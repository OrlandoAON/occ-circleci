define(
  //-------------------------------------------------------------------
  // DEPENDENCIES
  //-------------------------------------------------------------------
  ['jquery', 'knockout', 'navigation', 'ccConstants', 'ccRestClient'],
  // -------------------------------------------------------------------
  // MODULE DEFINITION
  // -------------------------------------------------------------------
  function ($, ko, navigation) {
    "use strict";
    return {
			elementName: 'product-fulldetails', 
      gotoFullProduct: function(widget){
        if (widget.product()){
          var popupId = $("#CC-fullProductDetails-link").closest(".modal").attr("id");
          $("#" + popupId).modal('hide');
          $('body').removeClass('modal-open');
          $('.modal-backdrop').remove();
          navigation.goTo(widget.product().route());
        }
      }      
    };
  }
);
