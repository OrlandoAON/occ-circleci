define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['jquery', 'knockout', 'ccLogger'],
  //-------------------------------------------------------------------
  // Module definition
  //-------------------------------------------------------------------
  function($, ko, CCLogger) {
    'use strict';
    // A simple binding that highlights an element when it loses focus.
    ko.bindingHandlers.highlight_on_blur = {
      init: function (element, valueAccessor, allBindings, viewModel,
                      bindingContext) {
        $(element).on('blur.demo.ko', function() {
          $(this).css('background-color','yellow');
        });
        $(element).on('focus.demo.ko', function() {
          $(this).css('background-color','white');
        });
      }
    };
    return {
      onLoad : function() {
        CCLogger.info("Loading Demo KO Bindings");
      }
    };
  }
);