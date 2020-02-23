/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore){

  function getCustomerList(customerID, currElem) {
    var choose = customerID,
        currEle = currElem;
    vmsService.vmsApiService(function(response){
       if(response){
          if (response.responseData.contact1) {
              $(currEle).find('#billContact').val(response.responseData.contact1);
          } else {
             if (!response.responseData.contact1) {
               $(currEle).find('#billContact').val('');
             }
          }
          if (response.responseData.email1) {
             $(currEle).find('#billEmail').val(response.responseData.email1);
          } else {
             $(currEle).find('#billEmail').val('');
          }
          $(currEle).find('#billEORI').val(response.responseData.eori);
          if (response.responseData.phoneNum1) {
             $(currEle).find('#billTelephone').val(response.responseData.phoneNum1);
          } else {
             if (!response.responseData.phoneNum1) {
               $(currEle).find('#billTelephone').val('');
             }
          }
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.bookingEditData, 'POST', choose);
    // to get customer address details
    vmsService.vmsApiService(function(response){
       if(response){
          manipulateVmsResponse(response, currEle);
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.bookingCustAdd, 'POST', choose);
  }

  function manipulateVmsResponse(response, currEle){
		 $(currEle).find('#billPostalCode').val('');
		 $(currEle).find('#billCity').val('');
		 $(currEle).find('#billState').val('');
		 $(currEle).find('#billCountryCode').val('');
		 $(currEle).find('#billCountryCodeDesc').val('');
		 $(currEle).find('#billAddress').val('');
		 $(currEle).find('#billPostalCode').val(response.responseData.postalAddress.postalCode);
		 $(currEle).find('#billCity').val(response.responseData.postalAddress.city);
		 $(currEle).find('#billState').val(response.responseData.postalAddress.state);
		 $(currEle).find('#billCountryCode').val(response.responseData.postalAddress.countryCode);
		 $(currEle).find('#billCountryCodeDesc').val(response.responseData.postalAddress.countryName);
		 
		 if(response.responseData.postalAddress.blPartyAddress){
			 $(currEle).find('#billAddress').val(response.responseData.postalAddress.blPartyAddress);			 
		 }
		 else {
			$(currEle).find('#billAddress')
				.val((response.responseData.postalAddress.addressLine1 || '') + '\n'
				+ (response.responseData.postalAddress.addressLine2 || '') + '\n'
				   + (response.responseData.postalAddress.addressLine3 || '') + '\n'
				   + (response.responseData.postalAddress.city || '') + '\n'
				   + (response.responseData.postalAddress.state || '') + '\n'
				   + (response.responseData.postalAddress.postalCode || '') + '\n'
				   + (response.responseData.postalAddress.countryName || ''));
			
	    	$('#billAddress').val($('#billAddress').val().split('\n').filter(Boolean).join('\n'));
		 }
	  }
  $(document).ready(function() {
    var docFlagCode = [],
        docFlagDesc = [],
        docFlagId = [],
        docData = { supplierType : 'Doc'},
        responseDTOList = nsCore.modifySmartObj(nsCore.smartData.portCode, {
                 'index' : [ 'portCode' ],
                 'target' : [ 'portName' ]
             }),
        count1 = responseDTOList.length,
        responseDTOListCntry = nsCore.modifySmartObj(nsCore.smartData.countryCode, {
             'index' : [ 'countryCode' ],
             'target' : [ 'countryName' ]
         }),
        countCntry = responseDTOListCntry.length,
        flagCodes = [],
        flagDesc = [],
        flagCodesCntry = [],
        flagDescCntry = [],
        l = 0,
        selectedVal,
        fCount = 0;
    nsBooking.hasMakebLAccess = $('#sec').val() === 'Y',
    $(document).on('click', '#updateVesselVoyagePopup .accHead,#massActionWarningPopUp .accHead', function() {
      $(this).next('.accBody').toggleClass('hide');
      $(this).find('.toggleBooking').toggleClass('fa-plus fa-minus');
    });
    nsCore.loadUI('booking');
    /* dirty flag for the forms in the booking page ends */
    // Code for loading the status bar
    $(document).ajaxSend(function(event, xhr, options) {
      if (options.loading) {
        $('.preloaderWrapper').show();
      }
    }).ajaxComplete(function(event, xhr, options) {
      if (options.loading) {
        $('.preloaderWrapper').hide();
      }
    }); 
    $(document).on('focus.autocomplete','.portSearch',function(){
    	$('.portSearch').autocomplete({
            search : function(event, ui) {
                $(this).closest('.doubleInput').find('.portSearch').attr('data-form', '0');
                $(this).attr('data-form', '0');
            },
            source : nsCore.beginWithAutoComplete(flagCodes),
            autoFocus : true,
            delay: 0,
            select : function(event, ui) {
            	fCount = 0;
                selectedVal = ui.item.value;
                if($(this).attr('id') === 'currentEditDiscPortCode'){
                	nsBooking.newDpVal = ui.item.value;
                }
                for (fCount = 0; fCount < count1; fCount++) {
                    if (selectedVal === responseDTOList[fCount].portCode) {
                        nsBooking.checkAddLegOrNormal($(this).closest('.doubleInput').find('.portSearch').attr('data-type'), 
                        		$(this).closest('.doubleInput').find('.portSearch').attr('id'), 
                        		$(this).closest('.doubleInput').find('.portSearch').attr('name'), 
                        		selectedVal, responseDTOList[fCount].portName);
                        $(this).closest('.doubleInput').find('.portSearch').attr('data-form',
                            selectedVal);
                        $(this).closest('.doubleInput').find('.descField').val(
                            responseDTOList[fCount].portName);
                        $(this).closest('.doubleInput').find('.descField').attr('data-form',
                            responseDTOList[fCount].portName);
                    }
                }
            }
        });
    });
    
    $(document).on('focus.autocomplete','.descField',function() {    	
    	$('.descField').autocomplete({
            search : function(event, ui) {
                $(this).closest('.doubleInput').find('.portSearch').attr('data-form', '0');
                $(this).attr('data-form', '0');
            },
            source : nsCore.beginWithAutoComplete(flagDesc),
            autoFocus : true,
            delay: 0,
            select : function(event, ui) {
                fCount = 0;
            	selectedVal = ui.item.value;
                for (fCount = 0; fCount < count1; fCount++) {
                    if (selectedVal === responseDTOList[fCount].portName) {
                        nsBooking.checkEditLegOrNormal($(this).closest('.doubleInput').find('.portSearch').attr('data-type'),
                        		$(this).closest('.doubleInput').find('.descField').attr('id'), 
                        		$(this).closest('.doubleInput').find('.descField').attr('name'),
                            responseDTOList[fCount].portCode, responseDTOList[fCount].portName);
                        $(this).closest('.doubleInput').find('.portSearch').attr('data-form',responseDTOList[fCount].portCode);
                        $(this).closest('.doubleInput').find('.portSearch').val(responseDTOList[fCount].portCode);
                        $(this).closest('.doubleInput').find('.portSearch').attr('data-form',responseDTOList[fCount].portCode);
                        if($(this).attr('id') === 'currentEditDiscPortDesc'){
                        	nsBooking.newDpVal = responseDTOList[fCount].portCode;
                        }
                    }
                }
            }
        });
    });
    
    $('.portSearch,.descField').on( 'autocompletechange', function( event, ui ) {    	
    	var portCodeIndex,i,
    	portCodeCount = responseDTOList.length;
    	if(!ui){
        for (i = 0; i < portCodeCount; i++) {
        	flagCodes.push(responseDTOList[i].portCode);
        	flagDesc.push(responseDTOList[i].portName);
        }        
        portCodeIndex = ($.inArray(ui.item.value,flagCodes) === -1?$.inArray(ui.item.value,flagDesc): $.inArray(ui.item.value,flagCodes));    	   	
    	nsBooking.checkEditLegOrNormal($(this).closest('.doubleInput').find('.portSearch')
                .attr('data-type'), $(this).closest('.doubleInput').find('.descField').attr('id'),
                $(this).closest('.doubleInput').find('.descField').attr('name'),
                responseDTOList[portCodeIndex].portCode, responseDTOList[portCodeIndex].portName);
        }
    });
    
    // Origin Port Autocomplete
    flagCodes = [];
     flagDesc = [];
   for (l = 0; l < count1; l++) {
       flagCodes.push(responseDTOList[l].portCode);
       flagDesc.push(responseDTOList[l].portName);
   }
   flagCodes.sort();
   flagDesc.sort();
   
   nsCore.portAutoComplete('#mainBookDetailCustomerOrigin','#mainBookDetailCustomerOriginDesc','data-form1');
   nsCore.portAutoComplete('#mainBookDetailCustomerOrigin','#mainBookDetailCustomerOriginDesc','data-form1');
   
   
   $('#mainBookDetailCustomerOrigin,#mainBookDetailCustomerOriginDesc').on( "autocompletechange", function( event, ui ) {nsBooking.mainBookingFlag.changedOriginDest = true;});
    // Destination Port Autocomplete
    flagCodes = [];
    flagDesc = [];
    for (l = 0; l < count1; l++) {
      flagCodes.push(responseDTOList[l].portCode);
      flagDesc.push(responseDTOList[l].portName);
    }
      flagCodes.sort();
      flagDesc.sort();
      $(document).on('focus.autocomplete','#mainBookDetailCustomerDestination',function() {
    	  nsCore.portAutoComplete('#mainBookDetailCustomerDestination','#mainBookDetailCustomerDestinationDesc','data-form2');   	  
     });
     $(document).on('focus.autocomplete', '#mainBookDetailCustomerDestinationDesc',function() {
    	 nsCore.portAutoComplete('#mainBookDetailCustomerDestination','#mainBookDetailCustomerDestinationDesc','data-form2');
     });
     $('#mainBookDetailCustomerDestination,#mainBookDetailCustomerDestinationDesc').on( "autocompletechange", function( event, ui ) {nsBooking.mainBookingFlag.changedOriginDest = true;});
    /* country smart search */
    flagCodesCntry = [];
    flagDescCntry = [];
    for (l = 0; l < countCntry; l++) {
    	flagCodesCntry.push(responseDTOListCntry[l].countryCode);
    	flagDescCntry.push(responseDTOListCntry[l].countryName);
    }
    flagCodesCntry.sort();
    nsBooking.flagCde = flagCodesCntry;
    nsBooking.flagDsc = flagDescCntry;
    $(document).on('focus.autocomplete','.billCountryCode',function() {
      $('.billCountryCode').autocomplete({
         source : nsCore.beginWithAutoComplete(flagCodesCntry),
         autoFocus : true,
         delay: 0,
         select : function(event, ui) {
            selectedVal = ui.item.value;

            for (fCount = 0; fCount < countCntry; fCount++) {

               if (selectedVal === responseDTOListCntry[fCount].countryCode) {
                  $(this).closest('.ladingPartyItem').find('.billCountryCodeDesc')
                      .val(responseDTOListCntry[fCount].countryName);
               }
            }
         }
      });
    });
    $('.ladingPartyItem .billCountryCode').each(function() {
      var code = $(this).val(),
          b = 0;
      if (code) {
         for (b = 0; b < countCntry; b++){
            if (code === responseDTOListCntry[b].countryCode) {
              $(this).closest('.ladingPartyItem').find('.billCountryCodeDesc').val(responseDTOListCntry[b].countryName);
            }
         }
      }
    });
    $(document).on('focus.autocomplete','.billCountryCodeDesc',function() {
      $('.billCountryCodeDesc').autocomplete({
         source : flagDescCntry,
         autoFocus : true,
         delay: 0,
         select : function(event, ui) {
          var fcnt = 0;
          selectedVal = ui.item.value;
            for (fcnt = 0; fcnt < countCntry; fcnt++) {
               if (selectedVal === responseDTOListCntry[fcnt].countryName) {
                  $(this).closest('.ladingPartyItem').find('.billCountryCode')
                      .val(responseDTOListCntry[fcnt].countryCode);
               }
            }
         }
      });
    });
    $('.custSearch').change(function(e){
    	if($(e.target).attr('id') === 'forwarderCode'){
    		nsCore.delInvalidAutoFeilds('#forwarderCode', '#forwarderName',$(this).val(), nsBooking.fwdCodeAutoArr, e);
    	} else {
    		nsCore.delInvalidAutoFeilds('.custSearch', '.custNameSearch',$(this).val(), nsBooking.customerCodeAutoArr, e);
    	}
        
    });
    $('.custNameSearch').change(function(e){
    	if($(e.target).attr('id') === 'forwarderName'){
    		nsCore.delInvalidAutoFeilds('#forwarderName', '#forwarderCode',$(this).val(), nsBooking.fwdNameAutoArr, e);
    	} else {
    		nsCore.delInvalidAutoFeilds('.custNameSearch', '.custSearch',$(this).val(), nsBooking.customerNameAutoArr, e);
    	}
    });
    /* Documentation office */
    vmsService.vmsApiService(function(response){
        var i = 0, arrCount = 0;
       if(response){
    	  arrCount = response.responseData.length;
          nsBooking.fnValidateAutoComplete(response.responseData);
          for (i = 0; i < arrCount; i++) {
            docFlagCode.push(response.responseData[i].companyCode);
            docFlagDesc.push(response.responseData[i].name);
            docFlagId.push(response.responseData[i].companyID);
          }
          docFlagCode.sort();
          docFlagDesc.sort();
          docFlagId.sort();
          $('#billDocumentationOffice').autocomplete({
             search : function() {
                $(this).attr('data-form', '0');
             },
             source : nsCore.beginWithAutoComplete(docFlagCode),
             autoFocus : true,
             delay: 0,
             select : function(event, ui) {
                selectedVal = ui.item.value;
                for (fCount = 0; fCount < arrCount; fCount++) {
                   if (selectedVal === response.responseData[fCount].companyCode) {
                      $('#billDocumentationOfficeDesc').val(response.responseData[fCount].name);
                      $('#billDocumentationOffice').val(response.responseData[fCount].companyID);
                      $('#billDocumentationOfficeId').val(response.responseData[fCount].companyID);
                      nsCore.bookingPopup = 1;
                   }
                }
             }
          });
          $('#billDocumentationOffice').blur(function(e){
              nsCore.delInvalidAutoFeilds('#billDocumentationOffice', '#billDocumentationOfficeDesc',$(this).val(), docFlagCode, e);
          });
          $('#billDocumentationOfficeDesc').autocomplete({
             search : function() {
                $('#billDocumentationOffice').attr('data-form', '0');
                $(this).attr('data-form', '0');
             },
             source : docFlagDesc,
             autoFocus : true,
             delay: 0,
             select : function(event, ui) {
                var fcnt = 0;
                selectedVal = ui.item.value;
                for (fcnt = 0; fcnt < arrCount; fcnt++) {
                   if (selectedVal === response.responseData[fcnt].name) {
                      $('#billDocumentationOffice').val(response.responseData[fcnt].companyCode);
                      $('#billDocumentationOfficeId').val(response.responseData[fcnt].companyCode);
                      $('#billDocumentationOfficeDesc').val(response.responseData[fcnt].name);
                      nsCore.bookingPopup = 1;
                   }
                }
             }
          });
          $('#billDocumentationOfficeDesc').blur(function(e){
              nsCore.delInvalidAutoFeilds('#billDocumentationOfficeDesc', '#billDocumentationOffice',$(this).val(), docFlagDesc, e);
          });
          $('#bookingDocCode').autocomplete({
             search : function() {
                $(this).attr('data-form', '0');
             },
             source : docFlagCode,
             autoFocus : true,
             delay: 0,
             select : function(event, ui) {
              selectedVal = ui.item.value;
                for (fCount = 0; fCount < arrCount; fCount++) {
                   if (selectedVal === response.responseData[fCount].companyCode) {
                      $('#bookingDocDesc').val(response.responseData[fCount].name);
                      $('#bookingDocOfficeId').val(response.responseData[fCount].companyID);
                      $('#bookingDocCode').attr('data-form', ui.item.value);
                   }
                }
             }
          });
          $('#bookingDocCode').blur(function(e){
              nsCore.delInvalidAutoFeilds('#bookingDocCode', '#bookingDocDesc',$(this).val(), docFlagCode, e);
          });
          $('#bookingDocDesc').autocomplete({
             search : function() {
                $('#bookingDocCode').attr('data-form', '0');
                $(this).attr('data-form', '0');
             },
             source : docFlagDesc,
             autoFocus : true,
             delay: 0,
             select : function(event, ui) {
              var fcnt = 0;
              selectedVal = ui.item.value;
                for (fcnt = 0; fcnt < arrCount; fcnt++) {
                   if (selectedVal === response.responseData[fcnt].name) {
                     $('#bookingDocCode').val(response.responseData[fcnt].companyCode);
                     $('#bookingDocOfficeId').val(response.responseData[fcnt].companyID);
                     $('#bookingDocCode').attr('data-form', ui.item.value);
                   }
                }
             }
          });
          $('#bookingDocDesc').blur(function(e){
              nsCore.delInvalidAutoFeilds('#bookingDocDesc', '#bookingDocCode',$(this).val(), docFlagDesc, e);
          });
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.supComSearch, 'POST', JSON.stringify(docData));
    /* currency smart search for sub booking */
    vmsService.vmsApiService(function(response){
      var currencyList;
       if(response){
          currencyList = response.responseData;
          $.each(currencyList, function(i, obj) {
             nsBooking.currencyOptions.push(obj.currencyCode + ',' + obj.currencyDescription);
          });
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.postCurrencyUrl1, 'POST', JSON.stringify({}));
    /*Freight Charge Basis*/
    vmsService.vmsApiService(function(response){
       if(response){
          $.each(response.responseData, function(i, obj) {
             nsBooking.chargeBasisOptions.push(obj.chargeBasis + ',' + obj.chargeBasisDesc);
          });
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.getFreightBasis, 'POST', null);
    /* Charge Basis */
    vmsService.vmsApiService(function(data){
      if(data){
    	  nsBooking.sbChargeType = [];
    	   data.sort(function(a, b) {
               var val1 = a.chargeDescription.toUpperCase(),
               	val2 = b.chargeDescription.toUpperCase();
               return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
           });
          $.each(data, function(i, obj) {
             nsBooking.chargeTypeOptions.push(escape(obj.chargeTypeName) + ',' + obj.chargeDescription);
             nsBooking.sbChargeType.push(obj.chargeTypeName + '|' + obj.chargeInclusive);
          });
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.chargeTypeSearch, 'POST', null);
    /* BL Type */
    vmsService.vmsApiService(function(response){
       var bolTypes;
       if(response){
          bolTypes = nsBooking.getBolTypes(response);
          $('#billType').html(bolTypes);
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.bookBolTypes, 'GET', null);
    /* Party Type */
    vmsService.vmsApiService(function(response){
      var i = 0;
       if(response){
          nsBooking.globalPartyType.push('00');
          nsBooking.globalPartyText['00'] = '--Select--';
          for (i in response.responseData) {
             if (response.responseData.hasOwnProperty(i)) { 
                nsBooking.globalPartyType.push(response.responseData[i].code);
                nsBooking.globalPartyText[response.responseData[i].code] = response.responseData[i].desc;
             }
          }
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.partyTypes, 'GET', null);
    nsBooking.doInitCustomerSearch(); //customer smart serach
    
    $('#voyage').prop('disabled', true);
    
    nsCore.vesselAutoComplete('#vesselCode','#vesselName','data-form','#voyage');
    $('#vesselCode,#vesselName').on( "autocompletechange", function( event, ui ) { $('#voyage').prop('disabled', false);});    
    
    /* Voyage Auto complete */
    $('#voyage').autocomplete({
       search : function() {
          $('#voyage').attr('data-form', '0');
       },
       minLength : 1,
       source : function(request, response) {
          var dataId = JSON.stringify({
                vesselCode : $('#vesselCode').val(),
                voyageNo : request.term
             });
          if(request.term){
	          vmsService.vmsApiService(function(data){
	              var i = 0, flagCodesVsl, countVoy;
	             if(data){
	                countVoy = data.responseData.length;
	                flagCodesVsl = [];
	                for (i = 0; i < countVoy; i++) {
	                	flagCodesVsl.push({
	                        value : '' + data.responseData[i].voyageNo + '',
	                        label : data.responseData[i].voyageNo
	                    });
	                }
	                response(flagCodesVsl);
	             } else {
	                nsCore.showAlert(nsBooking.errorMsg);
	             }
	          }, nsBooking.voyageList, 'POST', dataId);
          }
       },
       autoFocus : true,
       delay: 0,
       select : function(event, ui) {
           $('#voyage').val(ui.item.label);
           $('#voyage').attr('data-form', ui.item.value);
       }
    });
    /*make and model smart search*/
    vmsService.vmsApiService(function(response){
       if(response){
          $.each(response, function(idx, obj) {
             if ($.inArray(obj.make, nsBooking.makeIDs) === -1) {
                nsBooking.makeIDs.push(obj.make);
             }
             if ($.inArray(obj.model, nsBooking.modelIDs) === -1) {
                nsBooking.modelIDs.push(obj.model);
             }
          });
          nsBooking.makeAndModelQuickBook('#bookingCargoMake', '#bookingCargoModel');
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.makeModel, 'POST', JSON.stringify({}));
    /* Trade code auto complete */
    $('#tradeCode').autocomplete({
       minLength : 1,
       source : nsCore.modifySmartObj(nsCore.smartData.tradeCode, {
          'index' : [ 'value', 'label' ]
       }).sort(function(a, b) {
          return a.label.localeCompare(b.label);
       }),
       autoFocus : true,
       delay: 0,
       select : function(event, ui) {
          $('#tradeCode').val(ui.item.label);
          $('#tradeCode').attr('data-form', ui.item.value);
       }
    });
    $('#tradeCode').blur(function(e){
        nsCore.delInvalidAutoFeilds('#tradeCode', '#tradeCode',$(this).val(), JSON.parse(localStorage.tradeCode), e);
    });
    /* Party code name autocomplete */
    $(document).on('focus.autocomplete', '.blcustSearch', function() {
       var currDiv = '';
       currDiv = $(this).closest('.ladingPartyItem');
       $('.blcustSearch').autocomplete({
          search : function() {
             $(this).attr('data-form', '0');
          },
          minLength : 1,
          source : function(request, response) {
        	 if(request.term){
	             vmsService.vmsApiService(function(data){
	                var i = 0, flagPartyCodes, countPCodes;
	                if(data){
	                   $('#customerID').val('');
	                   countPCodes = data.responseData.length;
	                   flagPartyCodes = [];
	                   for (i = 0; i < countPCodes; i++) {
	                      if (data.responseData[i].status === 'Valid') {
	                    	  flagPartyCodes.push({
	                            custId : '' + data.responseData[i].companyId + '',
	                            label : data.responseData[i].customerCode,
	                            name : data.responseData[i].name
	                         });
	                      }
	                   }
	                   flagPartyCodes.sort(function(a, b) {
	                     return a.label.localeCompare(b.label);
	                   });
	                   response(flagPartyCodes);
	                } else {
	                   nsCore.showAlert(nsBooking.errorMsg);
	                }
	             }, nsBooking.custList, 'POST', JSON.stringify({customerCode : request.term}));
        	 }
          },
          autoFocus : true,
          delay: 0,
          select : function(event, ui) {
            $(this).val(ui.item.label);
            $(this).closest('.doubleInput').find('.blcustNameSearch').val(ui.item.name);
            $(this).closest('.doubleInput').find('.blcustomerID').val(ui.item.custId);
            $(this).attr('data-form', ui.item.label);
            $('.blcustNameSearch').attr('data-form', ui.item.name);
            getCustomerList(ui.item.custId, currDiv);
          }
       });
    });
    $(document).on('blur', '.blcustSearch', function(e) {
    	if($(this).attr('data-form') === '0'){
    		$(this).val('');
    	}
    });
    $(document).on('focus.autocomplete', '.blcustNameSearch', function() {
       var currDiv = '';
       currDiv = $(this).closest('.ladingPartyItem');
       $('.blcustNameSearch').autocomplete({
          search : function() {
            $(this).attr('data-form', '0');
          },
          minLength : 1,
          source : function(request, response) {
        	 if(request.term){
	             vmsService.vmsApiService(function(data){
	                var i = 0, flagNames,countNames;
	                if(data){
	                   $('#customerID').val('');
	                   countNames = data.responseData.length;
	                   flagNames = [];
	                   for (i = 0; i < countNames; i++) {
	                     if (data.responseData[i].status === 'Valid') {
	                    	 flagNames.push({
	                            custId : '' + data.responseData[i].companyId + '',
	                            label : data.responseData[i].name,
	                            name : data.responseData[i].customerCode
	                         });
	                     }
	                   }
	                   flagNames.sort(function(a, b) {
	                      return a.label.localeCompare(b.label);
	                   });
	                   response(flagNames);
	                } else {
	                   nsCore.showAlert(nsBooking.errorMsg);
	                }
	             }, nsBooking.custList, 'POST', JSON.stringify({name : request.term}));
        	 }
          },
          autoFocus : true,
          delay: 0,
          select : function(event, ui) {
             $(this).val(ui.item.label);
             $(this).closest('.doubleInput').find('.blcustSearch').val(ui.item.name);
             $(this).closest('.doubleInput').find('.blcustomerID').val(ui.item.custId);
             $(this).attr('data-form', ui.item.label);
             $('.blcustSearch').attr('data-form', ui.item.name);
             getCustomerList(ui.item.custId, currDiv);
          }
       });
    });
    /* Transport type drop down */
    vmsService.vmsApiService(function(response){
      var status;
       if(response){
          if (response.responseDescription === 'Success') {
        	  response.responseData.sort(function(a, b) {
                  var val1 = a.desc.toUpperCase(),
                  	val2 = b.desc.toUpperCase();
                  return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
              });
             status = '<option value="">-- Select --</option>';
             $.each(response.responseData, function(i, val) {
                status += '<option value="' + escape(val.code) + '">' + val.desc + '</option>';
             });
             $('#voyageTransportationType').html(status);
          }
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.transportTypes, 'GET', null);
    vmsService.vmsApiService(function(response){
      var status,
          count,
          i = 0;
       if(response){
    	   response.responseData.sort(function(a, b) {
               var val1 = a.desc.toUpperCase(),
               	val2 = b.desc.toUpperCase();
               return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
           });
          status = '<option selected value="">-- Select --</option>';
          count = response.responseData.length;
          for (i = 0; i < count; i++) {
             if (response.responseData[i].desc !== 'Hoegh Autoliners') {
                status += '<option value="' + response.responseData[i].code + '">'
                            + response.responseData[i].desc + '</option>';
             }
          }
          $('#voyageCarrier').html(status);
       } else {
          nsCore.showAlert(nsBooking.errorMsg);
       }
    }, nsBooking.carrierType, 'GET', null);
    /* Mass Action */
    $('#massActionWarningPopUp').dialog({
       modal : true,
       resizable : false,
       draggable : false,
       autoOpen : false,
       width : '30%',
       height : 550/*,close : function() {},open : function() {}*/
    });
    // commented for Temporarily - Enable in Documnetation module
    $('.massActionListLink').position({
       my : 'right top',
       at : 'left+9 center',
       of : '.rightActionListWrapper'
    });
  });
})(this.booking, jQuery, this.vmsService, this.core);