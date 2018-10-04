const Promise = require("bluebird")

const constants = require("./constants").constants
const copyFieldContentsToFile = require("./grabberUtils").copyFieldContentsToFile
const endPointTransceiver = require("./endPointTransceiver")
const exists = require("./utils").exists
const info = require("./logger").info
const makeTrackedDirectory = require("./utils").makeTrackedDirectory
const readMetadataFromDisk = require("./metadata").readMetadataFromDisk
const sanitizeName = require("./utils").sanitizeName
const splitPath = require("./utils").splitPath
const warn = require("./logger").warn
const writeMetadata = require("./metadata").writeMetadata

/**
 * Grab all the instances for a specific stack e.g. stack/Name/instances.
 * @param directory
 */
function grabStackInstances(directory) {
  return tryToGrabStacks(splitPath(directory, 2))
}

/**
 * Grab a specific stack instance e.g. stack/Name/instances/Name.
 * @param directory
 */
function grabSpecificStackInstance(directory) {

  return tryToGrabStacks(splitPath(directory, 3), splitPath(directory))
}

/**
 * Grab a specific stack and all its instances e.g. stack/Accordion
 * @param directory
 */
function grabSpecificStack(directory) {
  return tryToGrabStacks(splitPath(directory))
}

/**
 * The endpoints we need to manipulate stacks were added fairly recently so let's not assume they are there.
 * @returns {boolean}
 */
function stacksCanBeGrabbed() {

  if (endPointTransceiver.serverSupports("getAllStackInstances", "getStackSourceCode", "getStackLessVars", "getStackLess")) {
    return true
  } else {
    warn("stacksCannotBeGrabbed")
    return false
  }
}

/**
 * Try to grab stack info that the user has asked for.
 * @param stackName
 */
function tryToGrabStacks(stackName, stackInstanceName) {

  const promises = []

  if (stacksCanBeGrabbed()) {

    promises.push(endPointTransceiver.getAllStackInstances().tap(results => {

      // Create stack top level dir first if it does not already exist.
      makeTrackedDirectory(constants.stacksDir)

      promises.push(grabStacks(results, stackName, stackInstanceName))
    }))
  }

  return Promise.all(promises)
}

/**
 * Pull down all the stacks from the server unless we specify which one.
 */
function grabAllStacks() {
  return tryToGrabStacks()
}

/**
 * Walk through the array contained in results creating files on disk.
 * @param results
 * @param stackName
 * @param stackInstanceName
 */
function grabStacks(results, stackName, stackInstanceName) {

  // Keep track of all the promises, returning them as a single promise at the end.
  const promises = []

  // Walk through the stacks, making sure we only grab what the user wants.
  results.data.items.filter(stack => {

    return !stackName || (stackName && stack.displayName == stackName)
  }).forEach(stack => promises.push(grabStack(stack, stackInstanceName)))

  // Warn if we did not find a match.
  stackName && promises.length == 0 && warn("noMatchFound", {name : stackName})

  return Promise.all(promises)
}

/**
 * Get the resources for the supplied stack. Unlike widgets, there is only source
 * code associated with the instances.
 * @param stack
 * @param stackInstanceName
 */
function grabStack(stack, stackInstanceName) {

  // Let the user know something is happening...
  info("grabbingStack", {name : stack.displayName})

  // Create the top level dirs for the stack first.
  const stackDir = `${constants.stacksDir}/${sanitizeName(stack.displayName)}`
  makeTrackedDirectory(stackDir)

  writeStackMetadata(stack.repositoryId, stack.stackType, stack.version, stack.displayName, stackDir)

  const instancesDir = `${stackDir}/instances`
  makeTrackedDirectory(instancesDir)

  // Keep track of all the promises, returning them as a single promise at the end.
  const promises = []

  // See if the user wants a specific instance.
  stack.instances.filter(stackInstance => stackInstanceName ? stackInstanceName == stackInstance.displayName : true)
    .forEach(stackInstance => promises.push(grabStackInstance(instancesDir, stackInstance)))

  return Promise.all(promises)
}

/**
 * Create files based on the supplied stack instance
 * @param instancesDir - where to stick the files
 * @param stackInstance - info on the stack instance from the server
 */
function grabStackInstance(instancesDir, stackInstance) {

  // Set up a dir for this instance.
  const stackInstanceDir = `${instancesDir}/${sanitizeName(stackInstance.displayName)}`

  // See if we have already grabbed a version of stack.
  if (exists(stackInstanceDir)) {

    // Get the version from the instance we currently have on disk.
    const metadataFromDisk = readMetadataFromDisk(stackInstanceDir, constants.stackInstanceMetadataJson)

    // If the one on disk is more up to date, don't go any further.
    if (metadataFromDisk && metadataFromDisk.version > stackInstance.descriptor.version) {
      return null
    }
  }

  // We can now safely make the directory.
  makeTrackedDirectory(stackInstanceDir)

  // Need to store the stack instance ID in the tracking dir for later.
  const stackInstanceJson = {}
  stackInstanceJson.repositoryId = stackInstance.id
  stackInstanceJson.displayName = stackInstance.displayName

  writeMetadata(`${stackInstanceDir}/${constants.stackInstanceMetadataJson}`, stackInstanceJson)

  // Keep track of all the promises, returning them as a single promise at the end.
  const promises = []

  // Add templates, style variables and style sheet.
  promises.push(copyFieldContentsToFile("getStackSourceCode", stackInstance.id, "source", `${stackInstanceDir}/${constants.stackTemplate}`))
  promises.push(copyFieldContentsToFile("getStackLessVars", stackInstance.id, "source", `${stackInstanceDir}/${constants.stackVariablesLess}`))
  promises.push(copyFieldContentsToFile("getStackLess", stackInstance.id, "source", `${stackInstanceDir}/${constants.stackLess}`))

  return Promise.all(promises)
}

/**
 * Holds the boilerplate for writing stack metadata.
 * @param repositoryId
 * @param stackType
 * @param version
 * @param displayName
 * @param stackDir
 */
function writeStackMetadata(repositoryId, stackType, version, displayName, stackDir) {
  writeMetadata(`${stackDir}/${constants.stackMetadataJson}`, {repositoryId, stackType, version, displayName})
}

exports.grabAllStacks = grabAllStacks
exports.grabSpecificStack = grabSpecificStack
exports.grabStackInstances = grabStackInstances
exports.grabSpecificStackInstance = grabSpecificStackInstance
