"use strict"

const constants = require("./constants").constants
const info = require('./logger').info
const exists = require('./utils').exists
const readFile = require('./utils').readFile
const buildLocalDataMaps = require('./proxyInterceptors').buildLocalDataMaps
const doSourceMediaSubstitution = require('./proxyInterceptors').doSourceMediaSubstitution
const doJavascriptFileSubstitution = require('./proxyInterceptors').doJavascriptFileSubstitution
const doTemplateSubstitution = require('./proxyInterceptors').doPageTemplateSubstitution
const doStorefrontCssSubstitution = require('./proxyInterceptors').doStorefrontCssSubstitution
const doTextSnippetSubstitution = require('./proxyInterceptors').doTextSnippetSubstitution

const fs   = require('fs')
const hoxy = require('hoxy')

/**
 * Start the Cloud Developer Proxy and register a set of rules to
 * intercept requests to the current node and replace /file/ requests to
 * equivalent local versions stored under basePath.
 */
exports.startProxyDaemon = function (node, port) {
  // Build maps of Widget/Element resources to filesystem paths.
  buildLocalDataMaps()

  const keyFile = `${constants.trackingDir}/ccproxy-root-ca.key.pem`
  const certFile = `${constants.trackingDir}/ccproxy-private-root-ca.crt.pem`
  let options = {}

  console.info(keyFile)

  if (exists(keyFile) && exists(certFile)) {
    options['certAuthority'] = {
      key: readFile(keyFile),
      cert: readFile(certFile)
    }
  }

  console.info(options)

  const proxy = hoxy.createServer(options).listen(port, function () {
    info('proxyListeningMessage', {node, port})
  })

  proxy.log('error warn debug', process.stderr);
  proxy.log('info', process.stdout);

  // Intercept rule for Javascript Files.
  proxy.intercept({
    method: 'GET',
    phase: 'response',

    // only intercept js pages
    fullUrl: `${node}/file/*`,
    mimeType: 'application/javascript',

    // expose the response body as a big string
    as: 'string'
  },  doJavascriptFileSubstitution)

  proxy.intercept({
    method: 'GET',
    phase: 'response',

    // only intercept html templates
    fullUrl: `${node}/file/*`,
    mimeType: 'text/html',

    // expose the response body as a big string
    as: 'string'
  },  doSourceMediaSubstitution)

  // Intercept rule for Storefront CSS.
  // The CSS will either be delivered as a single 'storefront.css' file, or as
  // optimized chunked files (base.css, common.css, and other instance/site
  // specific files.) All we need to do is deliver the locally compiled
  // storefront file once (for either storefront.css or base.css requests) and
  // blank out the responses of other CSS requests under the /file/ endpoint.
  // (This rule should *not* intercept framework CSS requests!)
  proxy.intercept({
    method: 'GET',
    phase: 'response',

    // Intercept the storefront css request.
    fullUrl: `${node}/file/*/css/*.css`,
    mimeType: 'text/css',
    as: 'string'
  }, function (req, resp) {

    const url = req._data.url.split("?")[0] // url without params.

    if (url.endsWith("base.css") || url.endsWith("storefront.css")) {
      doStorefrontCssSubstitution(req, resp)
    } else {
      resp.string = ""
    }
  })

  // Intercept rule for Templates (Modifies Page response in place).
  proxy.intercept({
    method: 'GET',
    phase: 'response',

    // Intercept the page requests as json data.
    fullUrl: `${node}/ccstoreui/v1/pages/layout/:id*`,
    mimeType: 'application/json',
    as: 'json'
  }, doTemplateSubstitution)

  // Intercept common.json to substitute text snippets.
  proxy.intercept({
    method: 'GET',
    phase: 'response',

    // Intercept strings as json data.
    fullUrl: `${node}/ccstoreui/v1/resources/ns.common*`,
    mimeType: 'application/json',
    as: 'json'
  }, doTextSnippetSubstitution)
}
