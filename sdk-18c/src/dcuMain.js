const program = require("commander")

const addCommonOptions = require("./optionsUtils").addCommonOptions
const addExitHandler = require("./exitHandler").addExitHandler
const checkMetadata = require("./optionsUtils").checkMetadata
const endPointTransceiver = require("./endPointTransceiver")
const exitDueToInvalidCall = require("./exitHandler").exitDueToInvalidCall
const getApplicationKey = require("./optionsUtils").getApplicationKey
const getLastNode = require("./metadata").getLastNode
const getPassword = require("./optionsUtils").getPassword
const grabber = require("./grabber")
const inTransferMode = require("./state").inTransferMode
const lessCompiler = require("./CCLessCompiler")
const putter = require("./putter")
const t = require("./i18n").t
const enableUpdateInstances = require("./widgetPutter").enableUpdateInstances
const suppressConfigUpdate = require("./widgetPutter").suppressConfigUpdate
const useBasePath = require("./utils").useBasePath

exports.main = function (argv) {

  // Force use of dcu rather than the actual file name of dcu.js.
  program._name = "dcu"

  addCommonOptions(program)
    .option("-l, --locale <locale>", t("localeOptionText"))
    .option("-a, --allLocales", t("allLocalesOptionText"))
    .option("-c, --clean", t("cleanOptionText"))
    .option("-r, --refresh <directory>", t("refreshOptionText"), false)
    .option("-g, --grab", t("grabOptionText"), false)
    .option("-t, --put <file>", t("putOptionText"))
    .option("-m, --putAll <directory>", t("putAllOptionText"), false)
    .option("-r, --transfer <file>", t("transferOptionText"), false)
    .option("-x, --transferAll <directory>", t("transferAllOptionText"), false)
    .option("-C, --compileLess [auto]", t("compileLessOptionText"), false)
    .option("-s, --site <siteName>", t("siteNameOptionTest"), false)
    .option("-i, --updateInstances", t("updateInstancesOptionText"), false)
    .option("-o, --noInstanceConfigUpdate", t("noInstanceConfigUpdateText"), false)
    .parse(argv)

  // Pass on the base path if it was set.
  program.base && useBasePath(program.base)

  // Must have exactly one operation - no more and no less.
  const operationsCount = ["grab", "put", "putAll", "transfer", "transferAll", "compileLess", "refresh"]
    .reduce((total, currentValue) => total + (program[currentValue] ? 1 : 0), 0)

  // Some operations are only OK with a grab.
  const needsAGrab = (program.clean || program.allLocales) && !program.grab

  const needsASite = (program.compileLess) && !program.site

  // Make sure we know which server we are working with. If the user did not supply a node, try to use the last one.
  if (!program.node) {
    program.node = getLastNode(program.put || program.putAll || program.transferAll || program.refresh || program.transfer)
  }

  // Something is not quite right - tell the user.
  if (operationsCount !== 1 || needsAGrab || !program.node) {
    exitDueToInvalidCall(program)
  }

  if (needsASite) {
    program.site = "siteUS"
  }

  // Pass on the update instances flag if set.
  program.updateInstances && enableUpdateInstances()

  // Similarly, tell the putter not to send widget instance config stuff.
  program.noInstanceConfigUpdate && suppressConfigUpdate()

  // Sort out our endpoints first.
  return addExitHandler(endPointTransceiver.init(
    program.node,
    program.username, getPassword(program.password),
    getApplicationKey(program.applicationKey),
    program.locale, program.allLocales).then(() => {

    // For put/putAll or transferAll, make sure the metadata is OK.
    if (program.grab) {
      return grabber.grab(program.node, program.clean)
    } else if (program.refresh && checkMetadata(program.refresh)) {
      return grabber.refresh(program.refresh)
    } else if (program.transfer && checkMetadata(program.transfer)) {
      inTransferMode(true)
      return putter.put(program.transfer, program.node, false)
    } else if (program.put && checkMetadata(program.put)) {
      return putter.put(program.put, program.node, false)
    } else if (program.putAll && checkMetadata(program.putAll)) {
      return putter.put(program.putAll, program.node, true)
    } else if (program.transferAll && checkMetadata(program.transferAll)) {
      inTransferMode(true)
      return putter.put(program.transferAll, program.node, true)
    } else if (program.compileLess) {
      if (program.compileLess === "auto") {
        lessCompiler.compileAuto(program.site)
      } else {
        lessCompiler.compileOnce(program.site)
      }
    }
  }))
}
