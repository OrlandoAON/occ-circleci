"use strict"

const constants = require("../constants").constants
const mockery = require("./mockery")
const PuttingFileType = require("../puttingFileType").PuttingFileType

describe("Putter", () => {

  const self = this

  const themeStylesPath = "theme/Mono Theme/styles.less"

  beforeEach(done => {

    mockery.use(jasmine.createSpy)

    mockery.mockModules(self,
      "../state",
      "../utils",
      "../logger",
      "../classifier",
      "../metadata",
      "../endPointTransceiver",
      "../themePutter",
      "../widgetPutter",
      "../textSnippetPutter",
      "../applicationJavaScriptPutter",
      "../elementPutter",
      "../stackPutter"
    )

    self.metadata.readMetadata.returnsPromise(
      {
        node : "http://localhost:8080"
      })

    self.metadata.initializeMetadata.returnsPromise()

    self.utils.normalize.returnsFirstArg()

    self.utils.exists.returnsTrue()

    self.utils.splitFromBaseDir.returns(["/workspace/", "theme/Mono Theme"])

    self.putter = mockery.require("../putter")

    setTimeout(() => {
      done()
    }, 1)
  })

  afterEach(mockery.stopAll)

  it("should let you put a file on the server", done => {

    self.classifier.classify.returns(PuttingFileType.THEME_STYLES)

    self.putter.put(themeStylesPath, "http://localhost:8080").then(() => {

      expect(self.logger.info).toHaveBeenCalledWith("sendingPath", {
        path : themeStylesPath,
        node : "http://localhost:8080"
      })
      expect(self.themePutter.putThemeStyles).toHaveBeenCalled()
      done()
    })
  })

  it("should warn you when you try and send a silly file", done => {

    self.classifier.classify.returns(null)

    self.putter.put("silly/path/file.wierd", "http://localhost:8080").then(() => {

      expect(self.logger.info).toHaveBeenCalledWith("sendingPath", {
        path : "silly/path/file.wierd",
        node : "http://localhost:8080"
      })
      expect(self.logger.warn).toHaveBeenCalledWith('fileIsNotRecognized', {name : 'silly/path/file.wierd'})
      done()
    })
  })

  it("should detect server mismatches", done => {

    self.metadata.readMetadata.returnsPromise(
      {
        node : "http://someOtherServer:8080"
      })

    self.putter.put(themeStylesPath, "http://localhost:8080").then(() => {

      expect(self.logger.error).toHaveBeenCalledWith("cannotSendToDifferentNode", {
        path : themeStylesPath,
        node : "http://localhost:8080",
        configMetadataNode : "http://someOtherServer:8080"
      }, "Invalid Operation")
      done()
    })
  })

  it("should detect non-existent files", () => {

    self.utils.exists.returnsFalse()

    self.putter.put(themeStylesPath, "http://localhost:8080")

    expect(self.logger.error).toHaveBeenCalledWith("pathDoesNotExist", {path : 'theme/Mono Theme/styles.less'})
  })

  it("should detect non-existent directories", () => {

    self.utils.exists.returnsFalse()

    self.putter.put("theme/Mono Theme", "http://localhost:8080", false)

    expect(self.logger.error).toHaveBeenCalledWith("pathDoesNotExist", {path : 'theme/Mono Theme'})
  })

  it("should detect putAll being called against a non-directory", () => {

    self.utils.exists.returnsTrue()
    self.utils.isDirectory.returnsFalse()

    self.putter.put("theme/Mono Theme", "http://localhost:8080", true)

    expect(self.logger.error).toHaveBeenCalledWith("pathIsNotDirectory", {path : 'theme/Mono Theme'})
  })

  it("should let you send an entire directory to the server", done => {

    self.classifier.classify.returns(PuttingFileType.THEME)

    self.utils.walkDirectory.and.callFake((path, listeners) => {
      listeners.listeners.file("/workspace/theme", {name : "Mono Theme"}, () => {
      })
    })

    self.putter.putAll("theme/Mono Theme", "http://localhost:8080").then(() => {
      expect(self.themePutter.putTheme).toHaveBeenCalled()
      done()
    })
  })

  it("should let you send an entire directory to the server via the put method", done => {

    self.utils.isDirectory.returnsTrue()

    self.classifier.classify.returns(PuttingFileType.THEME)

    self.utils.walkDirectory.and.callFake((path, listeners) => {
      listeners.listeners.file("/workspace/theme", {name : "Mono Theme"}, () => {
      })
    })

    self.putter.put("theme/Mono Theme", "http://localhost:8080", true).then(() => {
      expect(self.themePutter.putTheme).toHaveBeenCalled()
      done()
    })
  })

  it("should detect attempts to transfer a server to itself", done => {

    self.state.inTransferMode.returnsTrue()

    self.metadata.readMetadata.returnsPromise(
      {
        node : "http://localhost:8080",
        commerceCloudVersion : "16.5"
      })

    self.endPointTransceiver.commerceCloudVersion = "16.5"

    self.putter.put(themeStylesPath, "http://localhost:8080").then(() => {

      expect(self.logger.error).toHaveBeenCalledWith("cannotSendToSameNode", {
        path : themeStylesPath,
        node : "http://localhost:8080"
      })
      done()
    })
  })

  it("should detect attempts to transfer between two different versions", done => {

    self.state.inTransferMode.returnsTrue()
    self.metadata.readMetadata.returnsPromise(
      {
        node : "http://localhost:8080",
        commerceCloudVersion : "16.6"
      })
    self.endPointTransceiver.commerceCloudVersion = "16.5"

    self.putter.put(themeStylesPath, "http://someOtherHost:8080").then(() => {

      expect(self.logger.error).toHaveBeenCalledWith("cannotSendToDifferentVersion", {
        path : themeStylesPath,
        node : "http://someOtherHost:8080",
        configMetadataNode : "http://localhost:8080",
        configMetadataVersion : "16.6",
        targetVersion : "16.5"
      })
      done()
    })
  })

  it("should detect when a theme doesn't exist on the target server", done => {

    self.utils.isDirectory.returnsTrue()
    self.state.inTransferMode.returnsTrue()

    self.classifier.classify.returns(PuttingFileType.THEME)

    self.utils.walkDirectory.and.callFake((path, config) => {
      config.listeners.directory("theme", {name : "Dark Theme"}, () => null)
      config.listeners.file("theme/Dark Theme", {name : "additionalStyles.less"}, () => null)
      config.listeners.file("theme/Dark Theme", {name : "styles.less"}, () => null)
      config.listeners.file("theme/Dark Theme", {name : "variables.less"}, () => null)
    })

    self.putter.put("theme/Dark Theme", "http://someOtherhost:8080", true).then(() => {

      expect(self.themePutter.putTheme).toHaveBeenCalled()
      done()
    })
  })

  it("should process non existent widgets differently", done => {

    self.utils.isDirectory.returnsTrue()

    self.classifier.classify.and.callFake((path) => {
      if (path.indexOf("widget/Dark Widget/instances/Dark Widget Instance/display.template") > -1)  {
        return PuttingFileType.WIDGET_INSTANCE_TEMPLATE
      } else if (path.endsWith("widget/Dark Widget/instances/Dark Widget Instance")){
        return PuttingFileType.WIDGET_INSTANCE
      } else {
        return PuttingFileType.WIDGET
      }
    })

    self.utils.walkDirectory.and.callFake((path, config) => {
      config.listeners.directory("widget", {name : "Dark Widget"}, () => null)
      config.listeners.directory("widget/Dark Widget/instances", {name : "Dark Widget Instance"}, () => null)
      config.listeners.file("widget/Dark Widget", {name : "display.template"}, () => null)
      config.listeners.file("widget/Dark Widget", {name : "widget.less"}, () => null)
      config.listeners.file("widget/Dark Widget/instances/Dark Widget Instance", {name : "display.template"}, () => null)
    })

    self.putter.put("widget/Dark Widget", "http://localhost:8080", true).then(() => {

      expect(self.widgetPutter.putWidget).toHaveBeenCalled()
      done()
    })
  })
})
