// COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved.
'use strict';
(function(nsReports, nsCore, vmsService, $) {
    var reportsObj = {},
        reportsForm = {},
        dropDownData = {},
        dropDownMap = {};

    function downloadPDF(reportType) {
        var url = nsReports.downloadPDFLink + reportType,
            bookingNo;
        $('#emailID').val($('.customerEmail').val());
        $('#content, #emailSubject, #ccID, #bccID').val('');
        if (reportsForm.currentReportCode === 'RBC') {
            bookingNo = $('.bookingNumberBC').val() || '';
            $('#emailBookNo').val(bookingNo);
            $('#emailSubject').val('Booking Confirmation ' + bookingNo + '. PLS DO NOT REPLY TO THIS MAIL');
        } else {
            if (reportsForm.currentReportCode === 'RBOL') {
                $('#emailSubject').val('Bill Of Lading Mail. Please Donot Reply');
            }
        }
        vmsService.vmsApiService(function(response) {
            if (response) {
                $('#emailPdfName').val(response);
                $('#reportsEmailDetailsPopup').dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    width: '85%',
                    close: function() {
                        $('#reportsIFrame').show();
                        $('.previewReport').trigger('click');
                    },
                    open: function() {
                        $('#reportsIFrame').hide();
                        $('.ui-dialog-titlebar').remove();
                        $('#ui-dialog-title-dialog').hide();
                        $('.ui-dialog-titlebar').removeClass('ui-widget-header');
                    }
                });
            } else {
                nsCore.showAlert(nsReports.errorMsg);
            }
        }, url, 'POST', null);
    }

    function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === '-') {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function(a, b) {
            var result = (a[property] < b[property] ? -1 : (a[property] > b[property] ? 1 : 0));
            return result * sortOrder;
        };
    }

    function getEmailID(customerID, emailField) {
        var choose = customerID;
        vmsService.vmsApiService(function(response) {
            if (response) {
                if (response.responseData[0].email1) {
                    $(emailField).val(response.responseData[0].email1);
                } else {
                    $(emailField).val('');
                }
            } else {
                nsCore.showAlert(nsReports.errorMsg);
            }
        }, nsReports.custEditData, 'POST', choose);
    }

    function getCustomerDetails(bookingNo) {
        vmsService.vmsApiService	(function(response) {
            if(response.responseCode === '998'){
            	$('.customerCodeCodeField, .customerCodeDescField, .customerEmail').val('');
            	nsCore.showAlert(response.responseDescription);
            } else if (response) {
                if (response.responseData.customerCode) {
                    $('.customerCodeCodeField').val(response.responseData.customerCode);
                    $('.customerCodeDescField ').val(response.responseData.customerDescription);
                }
                if (response.responseData.emailID) {
                    $('.customerEmail').val(response.responseData.emailID);
                }
            } else {
                nsCore.showAlert(nsReports.errorMsg);
            }
        }, nsReports.fetchCustomerInfo + bookingNo, 'POST', null);
    }
    
	function split( val ) {
	    return val.split( /;\s*/ );
	}
	function extractLast( term ) {
		return split( term ).pop();
	}
	function multiSelectAutoComplete(source) {
		return function(req, responseFn) {
			if(extractLast( req.term )){
				var re = $.ui.autocomplete.escapeRegex(extractLast( req.term )),
	              matcher = new RegExp('^' + re, 'i'),
	              a = $.grep(source, function(item) {
	            	  return matcher.test(item.label || item.value || item);
	              });
				responseFn(a.slice(0, 100));
			} else {
				responseFn('');
			}
		};
      }
    
    $(document).ready(function() {
        // to highlight in Nav Bar
        nsCore.loadUI('reports');
        $('.downLoadBtns .downloadIcon').click(function() {
            var url;
            if ($(this).hasClass('disabled')) {
                return false;
            }
            url = nsReports.downloadReport + $(this).attr('data-type') +'&reportId='+ $(this).attr('data-reportId');
            window.open(url, '_blank');
        });
        // Dialog Close code
        $(document).on('click', '.dialogCloseIcon', function() {
        	var msie = (navigator.appName === "Netscape" && navigator.appVersion.indexOf('Trident') > -1);
        	if(!msie){
        		$("#reportsIFrame").contents().find("body").html("");
        	}
            $(this).closest('.ui-dialog-content').dialog('close');
           
        });
        
        $(document).on('click', '#emailPdf', function(){
        	downloadPDF('REPORT_TYPE_PDF&reportId='+ $(this).attr('data-reportId'));
        })
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
        // Date Picker
        $(document).on('click', '.datePickerIcon', function() {
            $(this).closest('.datePickerInpWrap').find('.datePickerInp').focus();
        });
        
        $(document).on('keydown', '[data-superattr="commission"],[data-superattr="exchangeRate"]', function(event){
        	if((event.target.value.indexOf('.') !== -1 || event.target.value.indexOf(',') !== -1) && (event.keyCode === 190 || event.keyCode === 110 || event.keyCode === 188)){
    	      event.preventDefault();
        	}
        });
        $(document).on('keyup', '[data-superattr="commission"],[data-superattr="exchangeRate"]', function(e){
  		  var inputVal = $(this).val();
  		  if((e.keyCode === 188 || e.keyCode === 110)){
  			  $(this).val(inputVal.replace(/,/g, '.'));
  		  }
        });
        $(document).on('keyup', '[data-superattr="commission"],[data-superattr="exchangeRate"]', function(e){
  		  	var inputVal = $(this).val();
  			  $(this).val(inputVal.replace(/,/g, '.'));
        });
        
        
        vmsService.vmsApiService(function(response) {
            var templateItems = '',
                queryReportName, reportWrapper;
            if (response) {
                templateItems += '<div class="accordionWrapper reportsListWrapper">';
                $.each(response.responseData, function(i, category) {
                    templateItems += '<div class="accElement">';
                    templateItems += '<div id="' + category.categoryName.replace(/ /g, '') +
                        'TypeTabHead" data-reportcategory="' + category.categoryName +
                        '" class="accHeader greyHeader"><span class="icons_sprite whitePlusIcon accEleIndicator fa fa-chevron-down">' +
                        '</span>';
                    templateItems += '<a href="javascript:void(0)">' + category.categoryName + '</a>';
                    templateItems += '</div>';
                    templateItems += '<div class="accContent">';
                    $.each(category.reportList, function(m, reportItem) {
                        templateItems += '<li ><a class="reportItem" href="javascript:void(0)" id="' +
                            reportItem.reportCode + '" data-reportName="' + reportItem.reportName +
                            '" data-reportType="' + reportItem.reportCode + '">' +
                            reportItem.reportName + '</a></li>';
                    });
                    templateItems += '</div></div><div class="clearAll"></div>';
                });
                templateItems += '</div>';
                $('#tradeSelectorMenu').html(templateItems);
                // To Auto trigger Report when loading from CGM Module.
                queryReportName = decodeURI(nsCore.getQueryVariable('report_name'));
                if(!(queryReportName === 'false')){
                    reportWrapper = $('.reportsListWrapper');
                    reportWrapper.find('.accHeader[data-reportcategory="Terminal Reports"]').trigger('click');
                    reportWrapper.find('a[data-reportName="' + queryReportName + '"]').trigger('click');
                    reportWrapper.find('.accHeader:not(.accHeader[data-reportcategory="Terminal Reports"])')
                        .addClass('disabledLink');
                }
            } else {
                nsCore.showAlert(nsReports.errorMsg);
            }
        }, nsReports.reportList, 'POST', null);
        // Expand Collapse
        $(document).on('click', '.accHeader', function() {
            var self = $(this);
            if ($(this).hasClass('disabledLink')) {
                return false;
            }
            self.toggleClass('greyHeader orangeHeader');
            self.find('.accEleIndicator').toggleClass('fa-chevron-down fa-chevron-up');
            self.closest('.accElement').find('.accContent').slideToggle();
        });
        // Fetch & Store all Drop Down Data
        vmsService.vmsApiService(function(response) {
            var dropDDObj;
            if (response) {
                dropDownData = response.responseData;
                dropDDObj = {'dropDownData' : dropDownData};
                $.extend(true, nsReports, dropDDObj);
            } else {
                nsCore.showAlert(nsReports.errorMsg);
            }
        }, nsReports.dropDownList, 'POST', null);

        vmsService.vmsApiService(function(response) {
            var data, dropDMObj;
            if (response) {
                data = response.responseData;
                dropDownMap.exchangeCurrency = data.sort(dynamicSort("currencyDescription"));
                dropDMObj = {'dropDownMap': dropDownMap};
                $.extend(true, nsReports, dropDMObj);

            } else {
                nsCore.showAlert(nsReports.errorMsg);
            }
        }, nsReports.autoComplCurrency, 'POST', null);

        // Report Type Click Event
        $(document).on('click', '.reportItem', function() {
            var reportsFormObj = {};
            $('#tradeSelectorMenu li a.reportItem').removeClass('clickedItem');
            $(this).addClass('clickedItem');
            $('#reportFormTitle').html('- ' + $(this).html().trim());
            reportsForm = new nsReports.formRenderer();
            // insert all autocomplete codes inside the below func
            reportsForm.loadAutocomplete = function() {
                var userId = $('.preferencePage').text(),
                    supplierCompany = {
                        supplierType: 'Alloc'
                    },
                    selectedVal;
                /* US Discharge Port smart Search Start */
                $(document).on('focus.autocomplete', '.usDischargeCodeField', function() {
                    $('.usDischargeCodeField').autocomplete({
                        search: function() {
                            $(this).attr('data-form', '0');
                        },
                        source: nsCore.beginWithAutoComplete(nsCore.modifySmartObj(nsCore.smartData.usPortCode, {
                            'index': ['value', 'label'],
                            'target': ['name']
                        })),
                        autoFocus: true,
                        select: function(event, ui) {
                            $(this).val(ui.item.label).attr('data-form', ui.item.label);
                            $(this).closest('.rowItem').find('.usDischargeDescField').val(ui.item.name);
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.usDischargeDescField', function() {
                    $('.usDischargeDescField').autocomplete({
                        search: function() {
                            $(this).attr('data-form', '0');
                        },
                        source: nsCore.beginWithAutoComplete(nsCore.modifySmartObj(nsCore.smartData.usPortDesc, {
                            'index': ['value', 'label'],
                            'target': ['code']
                        })),
                        autoFocus: true,
                        select: function(event, ui) {
                            $(this).val(ui.item.label).attr('data-form', ui.item.label);
                            $(this).closest('.rowItem').find('.usDischargeCodeField').val(ui.item.code);
                        }
                    });
                });
                /* US Discharge Port smart Search End */
                $(document).on('blur', '.usDischargeDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.usDischargeDescField', '.usDischargeCodeField',$(this).val(), JSON.parse(localStorage.portNames), e);
                });
                $(document).on('blur', '.usDischargeCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.usDischargeDescField', '.usDischargeCodeField',$(this).val(), JSON.parse(localStorage.portCodes), e);
                });
                /** Port Auto complete */
                $(document).on('blur', '.portCodeField, .portDescField', function(){
                	 if ($(this).attr('data-superattr') === 'dischargePort' && ((!$(this).val()) || $(this).attr('data-form') === '0')){
                		 $('.podTerminalCodeField').val('').prop('readonly', true);
                         $('.podTerminalDescField').val('').prop('readonly', true);
                	 }
                })
              	
                function multiSelectPairUpdate(code, inpObj, arrObj, currObj){
              		var desc=[], inppVal = '';
            		inpObj.val("");
            			$.each(code, function(i, data) {
               			 if(data){
                				var result  = arrObj.filter(function(o){return o.index === data;} );
                				if(result.length>0){
                				 desc.push(result[0].target)
                				 inppVal = desc.slice().join(";") + ';';
                				 inpObj.val(inppVal);
                				 if($(inpObj).hasClass('portCodeField')){
                					 $(currObj).attr('data-multiSelval', inppVal)
                					 $(currObj).attr('data-form', inppVal)
                				 } else{
                					$(currObj).attr('data-multiSelval', $(currObj).val())
               					$(currObj).attr('data-form', $(currObj).val())
                				 }
                				}
                			}
                		 })
              	}
                $(document).on('blur', '.portCodeField', function() {
                	var multiSelect = false, selectedReport = $('.clickedItem').text();
                	if(selectedReport === 'Booking List' || selectedReport === 'Booking Summary Totals' || selectedReport === 'Arrival Notice Listing' || selectedReport === 'Discharge Report'){
                		multiSelect = true;
                	}
                	if($(this).attr('data-superattr') === 'finalDestination'){
                		multiSelect = false;
                	}
                	if(multiSelect){
            			multiSelectPairUpdate(split($(this).val()),$(this).closest('.doubleInput').find('.portDescField'), nsCore.smartData.portCode, $(this));
            		} 
                })
                $(document).on('blur', '.portDescField', function() {
                	var multiSelect = false, selectedReport = $('.clickedItem').text();
                	if(selectedReport === 'Booking List' || selectedReport === 'Booking Summary Totals' || selectedReport === 'Arrival Notice Listing' || selectedReport === 'Discharge Report'){
                		multiSelect = true;
                	}
                	if($(this).attr('data-superattr') === 'finalDestination'){
                		multiSelect = false;
                	}
                	if(multiSelect){
            			multiSelectPairUpdate(split($(this).val()),$(this).closest('.doubleInput').find('.portCodeField'),nsCore.smartData.portDesc, $(this).closest('.doubleInput').find('.portCodeField'));
            		} 
                })
                $(document).on('focus.autocomplete', '.portCodeField', function() {
                	var multiSelect = false, selectedReport = $('.clickedItem').text();
                	if(selectedReport === 'Booking List' || selectedReport === 'Booking Summary Totals' || selectedReport === 'Arrival Notice Listing' || selectedReport === 'Discharge Report'){
                		multiSelect = true;
                	}
                	//added for 4831
                	if($(this).attr('data-superattr') === 'finalDestination'){
                		multiSelect = false;
                	}
                    $('.portCodeField').autocomplete({
                        search: function() {
                            $(this).attr('data-form', '0');
                            if(!$(this).attr('data-multiselval')){
                            	nsReports.mSelect = false;
                            }
                            if ($(this).attr('data-superattr') === 'dischargePort') {
                                $('.podTerminalCodeField').val('').prop('readonly', true);
                                $('.podTerminalDescField').val('').prop('readonly', true);
                            }
                        },
                        source: multiSelectAutoComplete(nsCore.modifySmartObj(nsCore.smartData.portCode, {
                            'index': ['value', 'label'],
                            'target': ['name']
                        })),
                        autoFocus: true,
                        focus: function(event) {
                        	 return false;
                        },
                        select: function(event, ui) {
                        	var code = split($(this).val());
                        	if ($(this).attr('data-superattr') === 'dischargePort') {
                                $('.podTerminalCodeField').prop('readonly', false);
                                $('.podTerminalDescField').prop('readonly', false);
                            }
                        	if(multiSelect){
                        		nsReports.mSelect = true;
                        		code.pop();
                        		code.push(ui.item.value);
                        		code.push("");
                        		$(this).val(code.join(";"));
                                $(this).attr('data-form', code.join( ";" ));
                                $(this).attr('data-multiSelval', code.join( ";" ));
                                multiSelectPairUpdate(code,$(this).closest('.doubleInput').find('.portDescField'),nsCore.smartData.portCode, $(this));
                                return false;
                        	} else{
                                $(this).val(ui.item.label);
                                $(this).attr('data-form', ui.item.value);
                                $(this).closest('.doubleInput').find('.portDescField').val(ui.item.name);
                        	}
                        	
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.portDescField', function() {
                	var multiSelect = false, selectedReport = $('.clickedItem').text();
                	if(selectedReport === 'Booking List' || selectedReport === 'Booking Summary Totals' || selectedReport === 'Arrival Notice Listing' || selectedReport === 'Discharge Report'){
                		multiSelect = true;
                	}
                	//added for 4831
                	if($(this).attr('data-superattr') === 'finalDestination'){
                		multiSelect = false;
                	}
                    $('.portDescField').autocomplete({
                        search: function() {
                            $(this).attr('data-form', '0');
                            if(!$(this).attr('data-multiselval')){
                            	nsReports.mSelect = false;
                            }
                            if ($(this).attr('data-superattr') === 'dischargePort') {
                                $('.podTerminalCodeField').val('');
                                $('.podTerminalDescField').val('');
                                $('.podTerminalCodeField').prop('readonly', true);
                                $('.podTerminalDescField').prop('readonly', true);
                            }
                        },
                        minLength : 1,
                        source: multiSelectAutoComplete(nsCore.modifySmartObj(nsCore.smartData.portDesc, {
                            'index': ['value', 'label'],
                            'target': ['code']
                        })),
                        autoFocus: true,
                        focus: function(event) {
                        	return false;
                        },
                        select: function(event, ui) {
                        	var code = split($(this).val());
                        	if ($(this).attr('data-superattr') === 'dischargePort') {
	                            $('.podTerminalCodeField').prop('readonly', false);
	                            $('.podTerminalDescField').prop('readonly', false);
	                        }
	                    	if(multiSelect){
	                    		nsReports.mSelect = true;
	                    		code.pop();
	                    		code.push(ui.item.label);
	                    		code.push("");
	                    		$(this).val(code.join(";"));
	                            $(this).attr('data-form', code.join( ";"));
	                            multiSelectPairUpdate(split($(this).val()),$(this).closest('.doubleInput').find('.portCodeField'), nsCore.smartData.portDesc, $(this).closest('.doubleInput').find('.portCodeField'));
	                            return false;
	                    	} else{
	                    		$(this).val(ui.item.label);
	                            $(this).attr('data-form', ui.item.code);
	                            $(this).closest('.doubleInput').find('.portCodeField').val(ui.item.code);
	                    	}
	                    
                        }
                    });
                });
                
                //Delete invlalid fields
                
                $(document).on('blur', '.loadPortDes', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.loadPortCod', '.loadPortDes',$(this).val(), JSON.parse(localStorage.portNames), e);
                	}
                });
                $(document).on('blur', '.loadPortCod', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.loadPortDes', '.loadPortCod',$(this).val(), JSON.parse(localStorage.portCodes), e);
                	}
                });
                
                
                $(document).on('blur', '.dischargePortCod', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.dischargePortCod', '.dischargePortDes',$(this).val(), JSON.parse(localStorage.portCodes), e);
                	}
                });
                $(document).on('blur', '.dischargePortDes', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.dischargePortDes', '.dischargePortCod',$(this).val(), JSON.parse(localStorage.portNames), e);
                	}
                });
                
                
                $(document).on('blur', '.finalDestinationCod', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.finalDestinationCod', '.finalDestinationDes',$(this).val(), JSON.parse(localStorage.portCodes), e);
                	}
                });
                $(document).on('blur', '.finalDestinationDes', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.finalDestinationDes', '.finalDestinationCod',$(this).val(), JSON.parse(localStorage.portNames), e);
                	}
                });
               
                
                $(document).on('blur', '.originCod', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.originCod', '.originDes',$(this).val(), JSON.parse(localStorage.portCodes), e);
                	}
                });
                $(document).on('blur', '.originDes', function(e){
                	if(!nsReports.mSelect){
                		nsCore.delInvalidAutoFeilds('.originDes', '.originCod',$(this).val(), JSON.parse(localStorage.portNames), e);
                	}
                });
                
                /** ********* Vessel Auto complete * */
                $(document).on('focus.autocomplete', '.vesselCodeCodeField', function() {
                    $('.vesselCodeCodeField').autocomplete({
                        search: function() {
                            $('.voyageNumber').val('');
                            $('.voyageNumber').prop('readonly', true);
                        },
                        source: nsCore.beginWithAutoComplete(nsCore.modifySmartObj(nsCore.smartData.vesselCode, {
                            'index': ['value', 'label'],
                            'target': ['name']
                        })),
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.vesselCodeDescField').val(ui.item.name);
                            $('.vesselCodeCodeField').val(ui.item.label);
                            $('.voyageNumber').prop('readonly', false).prop('disabled', false);
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.vesselCodeDescField', function() {
                    $('.vesselCodeDescField').autocomplete({
                        search: function() {
                            $('.voyageNumber').val('');
                            $('.voyageNumber').prop('readonly', true);
                        },
                        source: nsCore.modifySmartObj(nsCore.smartData.vesselDesc, {
                            'index': ['value', 'label'],
                            'target': ['name']
                        }).sort(function(a, b) {
                            return a.label.localeCompare(b.label);
                        }) ,
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.vesselCodeCodeField').val(ui.item.name);
                            $('.vesselCodeDescField').val(ui.item.label);
                            $('.voyageNumber').prop('readonly', false).prop('disabled', false);
                        }
                    });
                });
                $(document).on('blur', '.vesselCodeDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.vesselCodeCodeField', '.vesselCodeDescField',$(this).val(), JSON.parse(localStorage.vesselNames), e);
                });
                $(document).on('blur', '.vesselCodeCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.vesselCodeCodeField', '.vesselCodeDescField',$(this).val(), JSON.parse(localStorage.vesselCodes), e);
                });
                $(document).on('cut keydown', '.vesselCodeDescField,.vesselCodeCodeField', function(e) {
                    if (e.which === 46 || e.which === 8 || e.type === 'cut') {
                        $('.voyageNumber').val('');
                        $('.voyageNumber').prop('readonly', true);
                    }
                });
                /** ********* Voyage Auto complete * */
                $(document).on('focus.autocomplete', '.voyageNumber', function() {
                    $('.voyageNumber').autocomplete({
                        search: function() {
                            $('#voyage').attr('data-form', '0');
                        },
                        minLength: 0,
                        source: function(request, response) {
                            var ajData = JSON.stringify({
                                vesselCode: $('.vesselCodeCodeField').val(),
                                voyageNo: request.term
                            });
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        flagCodes.push({
                                            value: '' + data.responseData[i].voyageNo + '',
                                            label: data.responseData[i].voyageNo
                                        });
                                    }
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert("Invalid Voyage Number");
                                }
                            }, nsReports.autoComplVoyList, 'POST', ajData);
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $('#voyage').val(ui.item.label);
                        }
                    });
                });
                // Trade Autocomplete
                $(document).on('focus.autocomplete', '.tradeCodeField', function() {
                    $('.tradeCodeField').autocomplete({
                        search: function(event, ui) {
                            nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input', event, ui);
                        },
                        source: nsCore.beginWithAutoComplete(nsCore.modifySmartObj(nsCore.smartData.tradeCode, {
                            'index': ['value', 'label'],
                            'target': ['name']
                        })),
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.tradeCodeField').val(ui.item.label);
                            $('.tradeDescField').val(ui.item.name);
                        }
                    });
                });
                // Trade Desc Autocomplete
                $(document).on('focus.autocomplete', '.tradeDescField', function() {
                    $('.tradeDescField').autocomplete({
                        search: function() {/*There is no operation performed on click of search function*/},
                        source: nsCore.modifySmartObj(nsCore.smartData.tradeDesc, {
                            'index': ['value', 'label'],
                            'target': ['code']
                        }).sort(function(a, b) {
                            return a.label.localeCompare(b.label);
                        }),
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.tradeCodeField').val(ui.item.code);
                            $('.tradeDescField').val(ui.item.label);
                        }
                    });
                });
                $(document).on('blur', '.tradeCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.tradeCodeField', '.tradeDescField',$(this).val(), JSON.parse(localStorage.tradeCode), e);
                });
                $(document).on('blur', '.tradeDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.tradeCodeField', '.tradeDescField',$(this).val(), JSON.parse(localStorage.tradeName), e);
                });
                /* Party code name autocomplete */
                $(document).on('focus.autocomplete', '.customerCodeCodeField', function() {
                    $('.customerCodeCodeField').autocomplete({
                        source: function(request, response) {
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                nsReports.customerCodeAutoArr = [];
                                nsReports.customerNameAutoArr = [];
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        if (data.responseData[i].status === 'Valid') {
                                            flagCodes.push({
                                                custId: '' + data.responseData[i].compId + '',
                                                label: data.responseData[i].customerCode,
                                                name: data.responseData[i].name
                                            });
                                            nsReports.customerCodeAutoArr.push(data.responseData[i].customerCode);
                                            nsReports.customerNameAutoArr.push(data.responseData[i].name);
                                        }
                                    }
                                    flagCodes.sort(function(a, b) {
                                        return a.label.localeCompare(b.label);
                                    });
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, nsReports.autoComplCustList, 'POST', JSON.stringify({
                                customerCode: request.term
                            }));
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $(this).val(ui.item.label);
                            $('.customerCodeDescField').val(ui.item.name);
                            $('.customerCodeCodeField').val(ui.item.label);
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.customerCodeDescField', function() {
                    $('.customerCodeDescField').autocomplete({
                        source: function(request, response) {
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                nsReports.customerCodeAutoArr = [];
                                nsReports.customerNameAutoArr = [];
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        if (data.responseData[i].status === 'Valid') {
                                            flagCodes.push({
                                                custId: '' + data.responseData[i].compId + '',
                                                label: data.responseData[i].name,
                                                name: data.responseData[i].customerCode
                                            });
                                            nsReports.customerCodeAutoArr.push(data.responseData[i].customerCode);
                                            nsReports.customerNameAutoArr.push(data.responseData[i].name);
                                        }
                                    }
                                    flagCodes.sort(function(a, b) {
                                        return a.label.localeCompare(b.label);
                                    });
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, nsReports.autoComplCustList, 'POST', JSON.stringify({
                                name: request.term
                            }));
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $(this).val(ui.item.label);
                            $('.customerCodeDescField').val(ui.item.label);
                            $('.customerCodeCodeField').val(ui.item.name);
                        }
                    });
                });
                $(document).on('blur', '.customerCodeDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.customerCodeDescField', '.customerCodeCodeField',$(this).val(), nsReports.customerNameAutoArr, e);
                });
                $(document).on('blur', '.customerCodeCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.customerCodeDescField', '.customerCodeCodeField',$(this).val(), nsReports.customerCodeAutoArr, e);
                });
                /* bill of lading name autocomplete */
                $(document).on('focus.autocomplete', '.customerBolCodeCodeField', function() {
                    $('.customerBolCodeCodeField').autocomplete({
                        minLength: 0,
                        source: function(request, response) {
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    nsReports.blCustomerNameAutoArr = [];
                                    nsReports.blCustomerCodeAutoArr = [];
                                    for (i = 0; i < count1; i++) {
                                        if (data.responseData[i].status === 'Valid') {
                                            flagCodes.push({
                                                custId: '' + data.responseData[i].compId + '',
                                                label: data.responseData[i].custCode,
                                                name: data.responseData[i].name
                                            });
                                            nsReports.blCustomerNameAutoArr.push(data.responseData[i].name);
                                            nsReports.blCustomerCodeAutoArr.push(data.responseData[i].custCode);
                                        }
                                    }
                                    flagCodes.sort(function(a, b) {
                                        return a.label.localeCompare(b.label);
                                    });
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, nsReports.autoComplCustList, 'POST', JSON.stringify({
                                custCode: request.term
                            }));
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $(this).val(ui.item.label);
                            $('.customerBolCodeDescField').val(ui.item.name);
                            $('.customerBolCodeCodeField').val(ui.item.label);
                            getEmailID(ui.item.custId, $('.customerEmail'));
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.customerBolCodeDescField', function() {
                    $('.customerBolCodeDescField').autocomplete({
                        minLength: 0,
                        source: function(request, response) {
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                nsReports.blCustomerNameAutoArr = [];
                                nsReports.blCustomerCodeAutoArr = [];
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        if (data.responseData[i].status === 'Valid') {
                                            flagCodes.push({
                                                custId: '' + data.responseData[i].compId + '',
                                                label: data.responseData[i].name,
                                                name: data.responseData[i].custCode
                                            });
                                            nsReports.blCustomerNameAutoArr.push(data.responseData[i].name);
                                            nsReports.blCustomerCodeAutoArr.push(data.responseData[i].custCode);
                                        }
                                    }
                                    flagCodes.sort(function(a, b) {
                                        return a.label.localeCompare(b.label);
                                    });
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, nsReports.autoComplCustList, 'POST', JSON.stringify({
                                name: request.term
                            }));
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $(this).val(ui.item.label);
                            $('.customerBolCodeDescField').val(ui.item.label);
                            $('.customerBolCodeCodeField').val(ui.item.name);
                            getEmailID(ui.item.custId, $('.customerEmail'));
                        }
                    });
                });
                $(document).on('blur', '.customerBolCodeDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.customerBolCodeDescField', '.customerBolCodeCodeField',$(this).val(), nsReports.blCustomerNameAutoArr, e);
                });
                $(document).on('blur', '.customerBolCodeCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.customerBolCodeDescField', '.customerBolCodeCodeField',$(this).val(), nsReports.blCustomerCodeAutoArr, e);
                });
                // booking office autocomplete
                $.ajax({
                    beforeSend: function(xhrObj) {
                        xhrObj.setRequestHeader('userID', userId);
                    },
                    url: '/Vms/supplier/search',
                    type: 'POST',
                    contentType: 'application/json',
                    cache: false,
                    data: JSON.stringify(supplierCompany),
                    success: function(response) {
                        var listCount = response.responseData.length,
                            booingOffCodes = [],
                            booingOffNames = [],
                            comBoofId = [],
                            count;
                        for (count = 0; count < listCount; count++) {
                            booingOffCodes.push(response.responseData[count].companyCode);
                            booingOffNames.push(response.responseData[count].name);
                            comBoofId.push(response.responseData[count].companyID);
                        }
                        booingOffCodes.sort();
                        booingOffNames.sort();
                        $(document).on('focus.autocomplete', '.bookingOfficeCodeField', function() {
                            $('.bookingOfficeCodeField').autocomplete({
                                source: nsCore.beginWithAutoComplete(booingOffCodes),
                                autoFocus: true,
                                select: function(event, ui) {
                                    var fCount;
                                    selectedVal = ui.item.value;
                                    for (fCount = 0; fCount < listCount; fCount++) {
                                        if (selectedVal === response.responseData[fCount].companyCode) {
                                            $('.bookingOfficeDescField').val(response.responseData[fCount].name);
                                        }
                                    }
                                }
                            });
                        });
                        $(document).on('focus.autocomplete', '.bookingOfficeDescField', function() {
                            $('.bookingOfficeDescField').autocomplete({
                                source: booingOffNames,
                                autoFocus: true,
                                select: function(event, ui) {
                                    var fcnt;
                                    selectedVal = ui.item.value;
                                    for (fcnt = 0; fcnt < listCount; fcnt++) {
                                        if (selectedVal === response.responseData[fcnt].name) {
                                            $('.bookingOfficeCodeField').val(response.responseData[fcnt].companyCode);
                                        }
                                    }
                                }
                            });
                        });
                        $(document).on('blur', '.bookingOfficeCodeField', function(e){
                            nsCore.delInvalidAutoFeilds('.bookingOfficeCodeField', '.bookingOfficeDescField',$(this).val(), booingOffCodes, e);
                        });
                        $(document).on('blur', '.bookingOfficeDescField', function(e){
                            nsCore.delInvalidAutoFeilds('.bookingOfficeCodeField', '.bookingOfficeDescField',$(this).val(), booingOffNames, e);
                        });
                    }
                });
                // Forwarder Autocomplete
                $(document).on('focus.autocomplete', '.forwarderCodeCodeField', function() {
                    $('.forwarderCodeCodeField').autocomplete({
                        search: function() {
                            $(this).attr('data-form', '1');
                        },
                        source: function(request, response) {
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                nsReports.forwardedCode = [];
                                nsReports.forwardedName = [];
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        if (data.responseData[i].status === 'Valid') {
                                            flagCodes.push({
                                                label: data.responseData[i].customerCode,
                                                name: data.responseData[i].name
                                            });
                                            nsReports.forwardedCode.push(data.responseData[i].customerCode);
                                            nsReports.forwardedName.push(data.responseData[i].name);
                                        }
                                    }
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, nsReports.autoComplCustList, 'POST', JSON.stringify({
                                customerCode: request.term
                            }));
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.forwarderCodeCodeField').val(ui.item.label);
                            $('.forwarderCodeDescField').val(ui.item.name);
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.forwarderCodeDescField', function() {
                    $('.forwarderCodeDescField').autocomplete({
                        source: function(request, response) {
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                nsReports.forwardedCode = [];
                                nsReports.forwardedName = [];
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        if (data.responseData[i].status === 'Valid') {
                                            flagCodes.push({
                                                label: data.responseData[i].name,
                                                name: data.responseData[i].customerCode
                                            });
                                            nsReports.forwardedCode.push(data.responseData[i].customerCode);
                                            nsReports.forwardedName.push(data.responseData[i].name);
                                        }
                                    }
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, nsReports.autoComplCustList, 'POST', JSON.stringify({
                                name: request.term
                            }));
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.forwarderCodeCodeField').val(ui.item.name);
                            $('.forwarderCodeDescField').val(ui.item.label);
                        }
                    });
                });
                $(document).on('blur', '.forwarderCodeCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.forwarderCodeCodeField', '.forwarderCodeDescField',$(this).val(), nsReports.forwardedCode, e);
                });
                $(document).on('blur', '.forwarderCodeDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.forwarderCodeCodeField', '.forwarderCodeDescField',$(this).val(), nsReports.forwardedName, e);
                });
                $(document).on('focus.autocomplete', '.podTerminalCodeField', function() {
                    $('.podTerminalCodeField').autocomplete({
                        source: function(request, response) {
                            var url = nsReports.getAllTerminals + $('[name=dischargePortCode]').val();
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    nsReports.podTermCode = [];
                                    nsReports.podTermName = [];
                                    for (i = 0; i < count1; i++) {
                                        flagCodes.push({
                                            label: data.responseData[i].terminalCode,
                                            name: data.responseData[i].terminalDescription
                                        });
                                        nsReports.podTermCode.push(data.responseData[i].terminalCode);
                                        nsReports.podTermName.push(data.responseData[i].terminalDescription);
                                    }
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, url, 'POST', null);
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.podTerminalCodeField').val(ui.item.label);
                            $('.podTerminalDescField').val(ui.item.name);
                        }
                    });
                });
                $(document).on('focus.autocomplete', '.podTerminalDescField', function() {
                    $('.podTerminalDescField').autocomplete({
                        source: function(request, response) {
                            var url = nsReports.getAllTerminals + $('[name=dischargePortCode]').val();
                            vmsService.vmsApiService(function(data) {
                                var count1, flagCodes, i;
                                nsReports.podTermCode = [];
                                nsReports.podTermName = [];
                                if (data) {
                                    count1 = data.responseData.length;
                                    flagCodes = [];
                                    for (i = 0; i < count1; i++) {
                                        flagCodes.push({
                                            label: data.responseData[i].terminalDescription,
                                            name: data.responseData[i].terminalCode
                                        });
                                        nsReports.podTermCode.push(data.responseData[i].terminalCode);
                                        nsReports.podTermName.push(data.responseData[i].terminalDescription);
                                    }
                                    response(flagCodes);
                                } else {
                                    nsCore.showAlert(nsReports.errorMsg);
                                }
                            }, url, 'POST', null);
                        },
                        autoFocus: true,
                        select: function(event, ui) {
                            $('.podTerminalCodeField').val(ui.item.name);
                            $('.podTerminalDescField').val(ui.item.label);
                        }
                    });
                });
                $(document).on('blur', '.podTerminalCodeField', function(e){
                    nsCore.delInvalidAutoFeilds('.podTerminalCodeField', '.podTerminalDescField',$(this).val(), nsReports.podTermCode, e);
                });
                $(document).on('blur', '.podTerminalDescField', function(e){
                    nsCore.delInvalidAutoFeilds('.podTerminalCodeField', '.podTerminalDescField',$(this).val(), nsReports.podTermName, e);
                });
            };
            $(document).on('focus.autocomplete', '.countryCodeCodeField, .countryCodeDescField',function (){
                nsCore.countryAutocomplete('.countryCodeCodeField','.countryCodeDescField','countryCodeCode');
            });
            // End of Autocoplete Method
            reportsForm.currentReportCode = $(this).attr('data-reportType');
            reportsForm.jsonData = {
                reportCriteria: {
                    reportCode: reportsForm.currentReportCode
                }
            };
            reportsForm.beforeGenerate = function() {
                $('#pdf,#html,#csv,#rtf,#word,#excel').addClass('disabled');
            };
            reportsForm.afterGenerate = function() {
                nsCore.autoCompleteDelCodeDelNameInit();
            };
            reportsForm.init();
            reportsForm.loadAutocomplete();
            reportsFormObj = {'reportsForm' : reportsForm};
            $.extend(true, nsReports, reportsFormObj);
            $('[name=dischargePortCode]').addClass("dischargePortCod");
            $('[name=dischargePortDesc]').addClass("dischargePortDes");
            $('[name=loadPortCode]').addClass("loadPortCod");
            $('[name=loadPortCode]').addClass("loadPortDes");
            $('[name=finalDestinationCode]').addClass("finalDestinationCod");
            $('[name=finalDestinationDes]').addClass("finalDestinationDes");
            $('[name=originCode]').addClass("originCod");
            $('[name=originDesc]').addClass("originDes");
        });
        // Reset Button Click Event
        $('#resetButton').click(function() {
            $('.reportItem[data-reporttype="' + reportsForm.currentReportCode + '"').trigger('click');
        });
        $('#reportsPopup .cancelButton').click(function() {
            $('#reportsPopup').dialog('close');
        });

        $('.templateSelectorMenuWrapper').delegate('.bookingNumberBC', 'change', function() {
            var bookingNo = $('.bookingNumberBC').val();
            getCustomerDetails(bookingNo);
        });

        $('#sendConfirmationMail').click(function() {
            var flg = 0,
                i,
                emailID = $('#emailID').val(),
                subject1 = $('#emailSubject').val(),
                ccID = $('#ccID').val(),
                bccID = $('#bccID').val(),
                content1 = $('#content').val(),
                message = '',
                emailIdArry,
                emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                pathName, attachmentList, mailBean = {};
            if (!emailID) {
                message = 'To e-mail ID should not be empty';
            } else if (emailID.indexOf(';') !== -1) {
                emailIdArry = emailID.split(';');
                for (i = 0; i < emailIdArry.length; i++) {
                    if (!emailReg.test(emailIdArry[i])) {
                        flg = 1;
                        break;
                    }
                }
            } else {
                flg = !emailReg.test(emailID) ? 1 : flg;
            }
            flg = !emailReg.test(ccID) ? 1 : flg;
            flg = !emailReg.test(bccID) ? 1 : flg;
            message += (flg === 1) ? '\nEnter valid email id(s)!' : '';
            if (!subject1) {
                message = (!message) ? 'Subject should not be empty' : message +
                    '\nSubject should not be empty';
            }
            if (message) {
                nsCore.showAlert(message);
            } else {
                pathName = $('#emailPdfName').val();
                attachmentList = [pathName];
                mailBean = {
                    toMail: emailID,
                    ccMail: ccID,
                    bccMail: bccID,
                    bodyContent: content1,
                    subject: subject1,
                    attachmentList: attachmentList
                };
                vmsService.vmsApiService(function(response) {
                	  $('#reportsPopup').dialog('close');
                	  $('.preloaderWrapper').hide();
                    if (response.responseDescription === 'Success') {
                        nsCore.showAlertCallback('Email sent successfully!', afterAlert);
                    } else {
                        nsCore.showAlertCallback('Email send failed, please try again!', afterAlert);
                    }
                }, nsReports.sendConfirmMail, 'POST', JSON.stringify(mailBean));
            }
        });
        $('#reportsEmailDetailsPopup .cancelButton,#reportsEmailDetailsPopup .dialogCloseIcon').click(function() {
            $('#reportsEmailDetailsPopup').dialog('close');
            $('#bccID').val("");
            $('#emailSubject').val("");  
        });
    });
    function afterAlert(){
    	$('#reportsEmailDetailsPopup').closest('.ui-dialog-content').dialog('close');
    }
    
    reportsObj = {
        'downloadPDF': downloadPDF,
        'dynamicSort': dynamicSort,
        'getEmailID': getEmailID
    };
    $.extend(true, nsReports, reportsObj);
})(this.reports, this.core, this.vmsService, jQuery);