// COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved.
'use strict';
(function(nsReports, nsCore, vmsService, $) {
    var reportsObj = {};
    function generalLabel(element) {
        var mandatoryObj = '';
        if (element.mandatory) {
            mandatoryObj = '<span class="redStar">*</span>';
        }
        return '<div class="formRow"><div class="rowItem width100per"><label>' + element.labelName + mandatoryObj
            + '</label>';
    }
    function removeEleClass(enabledFormats, i,reportId){
    	if (enabledFormats.hasOwnProperty(i)) {
            $('#' + enabledFormats[i]).removeClass('disabled').attr('data-reportId',reportId);
        }
    }
    function reportDialogHelper(response, reportsPopUpHt, reportsIframeHt){
    		reportsPopUpHt = parseInt($(window).outerHeight() * 0.9);
            reportsIframeHt = parseInt(reportsPopUpHt - $('.downLoadBtns').outerHeight(true)
                - 135);
            if(response.responseCode === 'SUCCESS') {
            	$('#reportsIFrame').ready(
        				function() {
        					$("#reportsIFrame").attr("height", reportsPopUpHt - 120);
        					$('#reportsIFrame').attr('src', '').attr(
        							'src',
        							thisBaseUrl + '/reportfile?path='
        									+ response.responseDescription).attr(
        							'height', reportsIframeHt);

        				});
            }
            $('#reportsPopup').dialog({
                modal : true,
                resizable : false,
                draggable : false,
                width : '85%',
                height : reportsPopUpHt,
                position : 'top center',
                dialogClass: "reportsPopupClass"
            });
            if($("#alert-box").parents(".ui-dialog").is(':visible')){
           	 var zindexVal = parseFloat($('#reportsPopup').parent().css("z-index")) + 100;
				  $("#alert-box").parents(".ui-dialog").css('z-index',zindexVal);
			}
			else{
				 $("#alert-box").parents(".ui-dialog").hide();
			}
    }
    function generateSelectInput(fieldName, mandatory, labelName) {
        var selecVal = getDetails(fieldName), dropDownText = '', totalOptions, selectedOption, isSelected, fieldDescription = '', rateVlaue = '', fieldId = '', data, totalOpt;
        if (selecVal) {
            totalOptions = selecVal.selectOptionList;
            selectedOption = selecVal.defaultSelect;
            if(fieldName==="cargoGroup"){
            	dropDownText = '<select data-labelName="' + labelName + '" class=" ' + isRequired(mandatory) + '  '
                + fieldName + '" name="' + fieldName + '" data-superattr="' + fieldName + '" data-objectpop="true" name="basic[]" multiple="multiple" class="3col active">';
            }else{
            dropDownText = '<select data-labelName="' + labelName + '" class=" ' + isRequired(mandatory) + '  '
                + fieldName + '" name="' + fieldName + '" data-superattr="' + fieldName + '" data-objectpop="true">';
            }
            // Iterating & generating
            $.each(totalOptions, function(a, obj) {
                isSelected = ((obj.fieldValue === selectedOption) ? ' selected ' : '');
                // for selected option
                if(!(obj.fieldKey === "-- Select --" && fieldName==="cargoGroup")){
	                dropDownText += '<option value="' + obj.fieldValue + '" ' + isSelected + '>' + obj.fieldKey
	                    + '</option>';
                }
            });
            dropDownText += '</select>';
        } else if (fieldName === "portArea") {
            totalOpt = nsCore.modifySmartObj(nsCore.smartData.portAreaCodes, {
                "index" : [
                    "fieldValue"
                ],
                "target" : [
                    "fieldKey"
                ]
            });
            dropDownText = '<select data-labelName="' + labelName + '" class=" ' + isRequired(mandatory) + '  '
                + fieldName + '" name="' + fieldName + '" data-superattr="' + fieldName + '" data-objectpop="true"  name="basic[]" multiple="multiple" class="3col active">';
            dropDownText += '';
            $.each(totalOpt, function(a, obj) {
                // for selected option
                dropDownText += '<option value="' + obj.fieldValue + '">' + obj.fieldValue + " - " + obj.fieldKey
                    + '</option>';
            });
            dropDownText += '</select>';
        } else {
            data = nsReports.dropDownMap[fieldName];
            dropDownText = '<select data-labelName="' + labelName + '" class=" ' + isRequired(mandatory) + '  '
                + fieldName + ' " name="' + fieldName + '" data-superattr="' + fieldName
                + '" data-objectpop="true"><option value="">--Select--</option>';
            // Iterating & generating
            $.each(data, function(b, obj) {
                if (fieldName === "exchangeCurrency") {
                    fieldId = obj.currencyCode;
                    fieldDescription = obj.currencyDescription;
                    rateVlaue = obj.rateUSD;
                }
                dropDownText += '<option value="' + fieldId + '" rate-value="' + rateVlaue + '">' + fieldDescription
                    + '</option>';
            });
            dropDownText += '</select>';
        }
        return dropDownText;
    }
    function getDetails(fieldVal) {
        var i = 0;
        for (i = 0; i < nsReports.dropDownData.length; i++) {
            if (nsReports.dropDownData[i].fieldName === fieldVal) {
                return nsReports.dropDownData[i];
            }
        }
        return null;
    }
    function generateBoxItems(inputType, superAttr, objectPop, mandatory, labelName) {
        var data = '';
        data += '<div style="width: 100%;" ><input data-labelName="' + labelName + '" type="' + inputType
            + '"  name="option' + superAttr + '" data-superattr="' + superAttr + '" data-objectpop="' + objectPop
            + '"></div>';
        return data;
    }
    function isRequired(mandatory) {
        if (nsReports.reportsForm.currentReportCode === 'RSS') {
            return '';
        }
        return (mandatory ? 'required' : '');
    }
    function isPortSearchInput(labelName) {
        var fieldName = {};
        // Or Condition for common port Class
        if (labelName === 'loadPort' || labelName === 'origin' || labelName === 'finalDestination'
            || labelName === 'dischargePort' || labelName === 'inTransitPort' || labelName === 'usDischargePort') {
            fieldName = {
                'codeClass' : 'portCodeField',
                'descClass' : 'portDescField'
            };
        }  else {
            fieldName = {
                'codeClass' : labelName + 'CodeField',
                'descClass' : labelName + 'DescField'
            };
        }
        return fieldName;
    }
    function formContentGen(formData, i) {
        var formRowCLose = '</div></div></div>', classes, formContent = '';
        switch (formData[i].inputType) {
        case "text":
            if (formData[i].numOfInputs === "1") {
                if (formData[i].fieldName === "voyageNumber") {
                    formContent += ' voyageInputWrap"><input class="voyageNumber ' + isRequired(formData[i].mandatory)
                        + '  ' + formData[i].fieldName + ' " type="text"  data-labelName="' + formData[i].labelName
                        + '" data-superattr="' + formData[i].fieldName + '" data-objectpop="true" name="'
                        + formData[i].fieldName
                        + '"/><a id="getVesselData" href="javascript:void(0)" class="orangeButton">...</a>'
                        + formRowCLose;
                } else if (formData[i].fieldName === "pageNumber") {
                    formContent += '"><input class=" ' + isRequired(formData[i].mandatory) + '  '
                        + formData[i].fieldName + ' " type="text"  data-labelName="' + formData[i].labelName
                        + '" data-superattr="' + formData[i].fieldName + '" maxlength= 3 '
                        + ' data-objectpop="true" name="' + formData[i].fieldName + '"/>' + formRowCLose;
                } else {
                    formContent += '"><input class=" ' + isRequired(formData[i].mandatory) + '  '
                        + formData[i].fieldName + ' " type="text"  data-labelName="' + formData[i].labelName
                        + '" data-superattr="' + formData[i].fieldName + '" data-objectpop="true" name="'
                        + formData[i].fieldName + '"/>' + formRowCLose;
                }
            } else {
                if (formData[i].numOfInputs === "2") {
                    classes = isPortSearchInput(formData[i].fieldName);
                    formContent += ' doubleInput"><input data-labelName="' + formData[i].labelName
                        + '" class="width25per ' + isRequired(formData[i].mandatory) + ' ' + classes.codeClass
                        + ' " name="' + formData[i].fieldName + 'Code" type="text"  data-superattr="'
                        + formData[i].fieldName + '" data-objectpop="true"/><input data-labelName="'
                        + formData[i].labelName + ' Desc" class="width65per ' + classes.descClass + ' " name="'
                        + formData[i].fieldName + 'Desc" type="text" data-superattr="' + formData[i].fieldName
                        + '" data-objectpop="false"/>' + formRowCLose;
                }
            }
            break;
        case 'select':
            if (formData[i].numOfInputs === '1') {
                formContent += '">'
                    + generateSelectInput(formData[i].fieldName, formData[i].mandatory, formData[i].labelName)
                    + formRowCLose;
            }
            break;
        case 'datepicker':
            formContent += ' datePickerInpWrap"><input data-labelName="' + formData[i].labelName
                + '" class="datePickerInp ' + isRequired(formData[i].mandatory) + '" name="' + formData[i].fieldName
                + '" type="text"  data-superattr="' + formData[i].fieldName
                + '" data-objectpop="true"/><div class="datePickerIconWrap">'
                + '<span class="icons_sprite datePickerIcon fa fa-2x fa-calendar"></span></div>' + formRowCLose;
            break;
        default:
            formContent += ' doubleInput radioItem">'
                + generateBoxItems(formData[i].inputType, formData[i].fieldName, true, formData[i].mandatory,
                    formData[i].labelName) + formRowCLose;
            break;
        }
        return formContent;
    }
    function radiogenCase(v, temp) {
        if (String(temp[$(v).attr('data-superattr')]) === 'undefined') {
            temp[$(v).attr('data-superattr')] = $('input[name="' + $(v).prop('name') + '"][type="radio"]:checked').map(
                function(ind, val) {
                    return $(val).val();
                })[0];
        }
        return temp;
    }
    function checkboxgenCase(v, temp) {
        if (String(temp[$(v).attr('data-superattr')]) === 'undefined') {
            temp[$(v).attr('data-superattr')] = $("input[name='" + $(v).prop("name") + "'][type='checkbox']:checked")
                .map(function(ind, val) {
                    return $(val).val();
                }).toArray();
        }
        return temp;
    }
    function populateTemp(v, temp) {
        switch ($(v).attr('type')) {
        case 'text':
            temp[$(v).attr('data-superattr')] = $(v).val();
            if(($(v).attr('data-superattr')==='exchangeRate') || ($(v).attr('data-superattr') === 'commission')){
            	var a = $(v).val();
            	temp[$(v).attr('data-superattr')] = a.replace (/\,/g, '.');
            }
            break;
        case 'radiogen':
            temp = radiogenCase(v, temp);
            break;
        case 'checkboxgen':
            temp = checkboxgenCase(v, temp);
            break;
        case 'radio':
            if (String(temp[$(v).attr('data-superattr')]) === 'undefined') {
                temp[$(v).attr('data-superattr')] = ($(v).prop('checked') ? 'Y' : 'N');
            }
            break;
        case 'checkbox':
            if (String(temp[$(v).attr('data-superattr')]) === 'undefined') {
                temp[$(v).attr('data-superattr')] = ($(v).prop('checked') ? 'Y' : 'N');
            }
            break;
        default:
            break;
        }
        return temp;
    }
    function formRenderer() {
        this.formData = {};
        this.formId = '#testForm';
        this.containerId = '#templateSelectorMenu';
        this.resultMode = 'json';
        this.initMode = 'ajax';
        this.dataAjax = '/Vms/reports/reportsCriteria';
        this.jsonData = {};
        this.validationMode = 'alert';
        this.messageContainer = '';
        this.submitFromPopUp = false;
        this.currentReportCode = '';
        this.init = function() {
            var instance;
            if (this.initMode === "ajax") {
                instance = this;
                vmsService.vmsApiService(function(response) {
                    if (response) {
                        instance.renderForm(response, instance);
                        $('select[multiple]').multiselect();
                        $('.ms-options').css('min-height', '100px');
                        $('.ms-options-wrap button').find('span').text( "-- Select --" )
                    } else {
                        nsCore.showAlert(nsReports.errorMsg);
                    }
                }, this.dataAjax, 'POST', JSON.stringify(instance.jsonData));
            }
        };
        this.loadformContent = function(formData) {
            var formContent = '', i = 0;
            for (i in formData) {
                if (formData.hasOwnProperty(i)) {
                    formContent += generalLabel(formData[i]) + '<div class="formInputWrap width100per';
                    formContent += formContentGen(formData, i);
                }
            }
            return formContent;
        };
        this.renderForm = function(response, instance) {
            // Take data and render form
            var formContent = this.loadformContent(response.responseData.reportCriteriaList);
            $(instance.containerId).html(formContent);
            if($('#reportFormTitle').text() === '- Booking Confirmation'){
            	$('.customerCodeDescField').css('width', '72%');
            }
            $('.voyageNumber').prop('readonly', true);
            $('.exchangeRate').val('');
            $('.exchangeRate').prop('readonly', true);
            $('.podTerminalCodeField').prop('readonly', true);
            $('.podTerminalDescField').prop('readonly', true);
            $('.exchangeCurrency').change(function() {
                if ($('.exchangeCurrency').val() === '') {
                    $('.exchangeRate').val('');
                    $('.exchangeRate').prop('readonly', true);
                    $('.exchangeRate').removeClass('required');
                } else {
                    $('.exchangeRate').prop('readonly', false);
                    $('.exchangeRate').addClass('required');
                }
                $('.required').each(function() {
                    $(this).rules('add', {
                        messages : {
                            required : $(this).attr('data-labelname') + ' should not be empty'
                        }
                    });
                });
            });
            if (this.currentReportCode === 'RD') {
                $('.groupBy option[value=""]').remove();
            }
            $('.formSubmitButtons,.resetButton').show();
            $('.datePickerInp').datepicker({
                dateFormat : localStorage.getItem('dateFormat'),
                changeYear : true
            });
            if ($('.voyageNumber').length > 0) {
                $('#getVesselData').voyageSelectionPlugin({
                    voyageButton : '#getVesselData',
                    vesselCode : 'input[name="vesselCodeCode"]',
                    popUpEle : '#bookingVesselPopup',
                    voyageTextInp : 'input[name="voyageNumber"]',
                    parentEle : '#templateSelectorMenu',
                    tableId : '#bookingVesselListGrid',
                    formId : 'bookingVesselList',
                    serviceUrl : nsReports.getSailingDate
                });
            }
            // To check the checkbox by default
            $('input[data-superattr="showTerminal"]').prop('checked', this.currentReportCode === 'RTL');
            instance.validateForm(instance);
        };
        this.validateForm = function(instance) {
            var submitted = false;
            if (instance.validationMode === 'errorBox') {
                $.validator.setDefaults({
                    highlight : function(el) {
                        $(el).addClass('redErrorBorder');
                    },
                    unhighlight : function(el) {
                        $(el).removeClass('redErrorBorder');
                    },
                    errorElement : 'p',
                    errorPlacement : function(error) {
                        error.appendTo(this.messageContainer);
                    }
                });
            }
            $(instance.formId).validate({
                onfocusout : false,
                onkeyup : false,
                onclick : false,
                onchange : false,
                showErrors : function(errorMap, errorList) {
                    var summary = '';
                    if (submitted && instance.validationMode === 'alert') {
                        $.each(errorList, function() {
                            summary += this.message + '\n';
                        });
                        nsCore.showAlert(summary);
                        submitted = false;
                    }
                },
                invalidHandler : function() {
                    submitted = true;
                },
                submitHandler : function() {
                    instance.generateResult(instance);
                }
            });
            $('.required').each(function() {
                $(this).rules('add', {
                    messages : {
                        required : $(this).attr("data-labelname") + " should not be empty"
                    }
                });
            });
            $('.noSpecial').each(
                function() {
                    $(this).rules(
                        'add',
                        {
                            messages : {
                                noSpecialChar : $(this).attr('data-labelname').find('label').text()
                                    + ' should not have special characters'
                            }
                        });
                });
            // for Allocation Report
            if (nsReports.reportsForm.currentReportCode === 'RA') {
                $('input[name="vesselCodeCode"]').rules('remove');
                $('input[name="tradeCode"]').rules('add', {
                    tradeComboAloc : true,
                    tradeComboAloc1 : true,
                    tradeComboAloc2 : true,
                    tradeComboAloc3 : true
                });
                // Custom validation for Trade code , TO Date, From Date
                $.validator.addMethod('tradeComboAloc', function() {
                    return !(!($.trim($('input[name="vesselCodeCode"]').val()))
                        && !($.trim($('input[name="voyageNumber"]').val()))
                        && !($.trim($('input[name="fromDate"]').val())) && !($.trim($('input[name="toDate"]').val())));
                }, 'Please enter values for atleast one combination from below for report Generation\n1.Vessel and '
                    + 'Voyage number\n2.From Date and To Date');
                // Custom validation for Trade code , TO Date, From Date
                $.validator.addMethod('tradeComboAloc1', function() {
                    return !($.trim($('input[name="vesselCodeCode"]').val())
                        && !($.trim($('input[name="voyageNumber"]').val()))
                        && !($.trim($('input[name="fromDate"]').val())) && !($.trim($('input[name="toDate"]').val())));
                }, 'Please enter values for atleast one combination from below for report Generation\n1.Vessel and '
                    + 'Voyage number\n2.From Date and To Date');
                // Custom validation for Trade code , TO Date, From Date
                $.validator.addMethod('tradeComboAloc2',
                    function() {
                        return !($.trim($('input[name="tradeCode"]').val())
                            && (!($.trim($('input[name="fromDate"]').val())) || !($.trim($('input[name="toDate"]')
                                .val()))) && (!($.trim($('input[name="vesselCodeCode"]').val())) && !($.trim($(
                            'input[name="voyageNumber"]').val()))));
                    }, 'Please enter values for From and To Date');
                // Custom validation for Trade code , TO Date, From Date
                $.validator.addMethod('tradeComboAloc3', function() {
                    return !(($.trim($('input[name="fromDate"]').val()) && !($.trim($('input[name="toDate"]').val())))
                        || (!($.trim($('input[name="fromDate"]').val())) && $.trim($('input[name="toDate"]').val()))
                        || ($.trim($('input[name="vesselCodeCode"]').val()) && !($.trim($('input[name="voyageNumber"]')
                            .val()))) || (!($.trim($('input[name="vesselCodeCode"]').val())) && $.trim($(
                        'input[name="voyageNumber"]').val())));
                }, 'Please enter values for atleast one combination from below for report Generation\n1.'
                    + 'Vessel and Voyage number\n2.From Date and To Date');
            }
            if (nsReports.reportsForm.currentReportCode === 'RVI') {
                $('input[name="vesselCodeCode"]').rules('remove');
                $('input[name="pageNumber"]').rules("add", {
                    pageNumberCombo : true
                });
                $.validator.addMethod('pageNumberCombo', function() {
                    if (!($('input[name="pageNumber"]').val())) {
                        return true;
                    }
                    return /^\d*(\.\d{0, 2})?$/.test($('input[name="pageNumber"]').val());
                }, 'The string is non-numeric');
            }
            if (nsReports.reportsForm.currentReportCode === 'RBC') {
            	$('input[name="customerEmail"]').keypress(function(e){
            		 if(e.which === 32) {
            			 return false;
            		 }            		 
            		});
            	
            	$(document).on('blur', 'input[name="customerEmail"]', function(){
            		var emailArray = [];
            		emailArray =  $('input[name="customerEmail"]').val();
					var cleanemailArray = [];
					$.each(emailArray.split(/[,;]+/), function(){
						cleanemailArray.push($.trim(this));
					});
					$('input[name="customerEmail"]').val(cleanemailArray.join(';'));
					});
            	
            	
                $('input[name="customerEmail"]').rules("add", {
                    CustomerFlag : true
                });
                $.validator.addMethod('CustomerFlag', function() {
                	$('input[name="customerEmail"]').trigger('blur');
                    if ($('input[name="customerEmail"]').val() === '') {
                        return true;
                    }
                    return /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4};?)+$/.test($('input[name="customerEmail"]').val());
                }, 'Enter a valid Customer Email');
            }
            if (nsReports.reportsForm.currentReportCode === 'RSS') {
                $('input[name="tradeCode"]').rules('remove');
                $('input[name="vesselCodeCode"]').rules('add', {
                    tradeComboSail : true,
                    tradeComboSail0 : true,
                    tradeComboSail01 : true,
                    tradeComboSail02 : true,
                    tradeComboSail1 : true,
                    tradeComboSail2 : true,
                    tradeComboSail4 : true,
                    tradeComboSail5 : true
                });
                // Custom validation for Trade code , TO Date, From Date
                $.validator.addMethod('tradeComboSail',
                    function() {
                        return !(!($.trim($('input[name="vesselCodeCode"]').val()))
                            && !($.trim($('input[name="voyageNumber"]').val()))
                            && !($.trim($('input[name="tradeCode"]').val())) && !($.trim($('input[name="fromDate"]')
                            .val())));
                    }, 'Please enter values for atleast one combination from below for report Generation\n1.'
                        + 'Vessel and Voyage number\n2.Trade and From Date');
                $.validator.addMethod("tradeComboSail0",
                    function() {
                        return !($.trim($('input[name="vesselCodeCode"]').val())
                            && !($.trim($('input[name="voyageNumber"]').val()))
                            && $.trim($('input[name="tradeCode"]').val()) && !(($.trim($('input[name="fromDate"]')
                            .val()))));
                    }, 'Please enter values for atleast one combination from below for report Generation\n1.'
                        + 'Vessel and Voyage number\n2.Trade and From Date');
                $.validator.addMethod('tradeComboSail01', function() {
                    return !($.trim($('input[name="vesselCodeCode"]').val())
                        && !($.trim($('input[name="voyageNumber"]').val())) && !($.trim($('input[name="tradeCode"]')
                        .val())));
                }, 'Please enter values for atleast one combination from below for report Generation\n1.'
                    + 'Vessel and Voyage number\n2.Trade and From Date');
                $.validator.addMethod('tradeComboSail02', function() {
                    return !(!($.trim($('input[name="vesselCodeCode"]').val()))
                        && !($.trim($('input[name="voyageNumber"]').val()))
                        && !($.trim($('input[name="tradeCode"]').val())) && $.trim($('input[name="fromDate"]').val()));
                }, 'Please enter values for atleast one combination from below for report Generation\n1.'
                    + 'Vessel and Voyage number\n2.Trade and From Date');
                $.validator.addMethod('tradeComboSail1', function() {
                    return !(!($.trim($('input[name="vesselCodeCode"]').val()))
                        && !($.trim($('input[name="voyageNumber"]').val()))
                        && $.trim($('input[name="tradeCode"]').val()) && !($.trim($('input[name="fromDate"]').val())));
                }, 'From Date cannot be Empty');
                $.validator.addMethod('tradeComboSail2',
                    function() {
                        return !(!($.trim($('input[name="vesselCodeCode"]').val()))
                            && !($.trim($('input[name="voyageNumber"]').val()))
                            && !($.trim($('input[name="tradeCode"]').val())) && !($.trim($('input[name="fromDate"]')
                            .val())));
                    }, 'Trade Code and From Date cannot be Empty');
                $.validator.addMethod('tradeComboSail4',
                    function() {
                        return !($.trim($('input[name="vesselCodeCode"]').val())
                            && !($.trim($('input[name="voyageNumber"]').val()))
                            && !($.trim($('input[name="tradeCode"]').val())) && !($.trim($('input[name="fromDate"]')
                            .val())));
                    }, 'Voyage Number cannot be Empty');
                $.validator.addMethod('tradeComboSail5',
                    function() {
                        return !(!($.trim($('input[name="vesselCodeCode"]').val()))
                            && $.trim($('input[name="voyageNumber"]').val())
                            && !($.trim($('input[name="tradeCode"]').val())) && !($.trim($('input[name="fromDate"]')
                            .val())));
                    }, 'Vessel code cannot be Empty');
            }
            if (nsReports.reportsForm.currentReportCode === 'RANL'
                || nsReports.reportsForm.currentReportCode === 'RANDN'
                || nsReports.reportsForm.currentReportCode === 'RBOLL') {
                $('input[name="exchangeRate"]').rules('add', {
                    exchangerRateValid : true
                });
                $.validator.addMethod('exchangerRateValid', function() {
                    if (!($.trim($('input[name="exchangeRate"]').val()))) {
                        return true;
                    }
                    var pattern=/^\d*[\.\d]*(\d+)?$/;
                    return pattern.test($('input[name="exchangeRate"]').val());
                }, 'Please enter Valid Exchange Rate!');
            }
            if (nsReports.reportsForm.currentReportCode === 'RBOLL') {
                $('input[name="commission"]').rules('add', {
                    commissionRateValid : true
                });
                $.validator.addMethod('commissionRateValid', function() {
                    if (!($.trim($('input[name="commission"]').val()))) {
                        return true;
                    }
                    var pattern=/^\d*[\.\d]*(\d+)?$/;
                    return pattern.test($('input[name="commission"]').val());
                }, 'Please enter Valid Commission argument!');
            }
            $.validator.addMethod('selectRequired', function(value) {
                return (value || value !== "-Select-");
            }, 'Select mand');
            instance.afterGenerate(instance);
        };
        this.beforeGenerate = function() {
        // Before generate
        };
        this.afterGenerate = function() {
        // After generate
        };
        this.generateResult = function(instance) {
            var temp = {}, dateFormat = localStorage.getItem("dateFormat"), timeFormat = localStorage
                .getItem("timeFormat"), currDate = new Date(), sec = currDate.getSeconds() + '', min = currDate
                .getMinutes()
                + '', date = currDate.getDate() + '', mon = (currDate.getMonth() + 1) + '', hour = currDate.getHours()
                + '', dateStr = '', data = {};
            // Validate and generate result depending on result mode
            instance.beforeGenerate();
            if (instance.resultMode === 'json') {
                $(instance.containerId).find('input,select').filter(function(i, v) {
                    return $(v).attr('data-objectpop') === 'true';
                }).map(function(i, v) {
                    if ($(v).prop('tagName') === 'INPUT') {
                        temp = populateTemp(v, temp);
                    } else {
                        if ($(v).prop('tagName') === 'SELECT') {
                        	if($(v).attr('class').trim() === 'portArea'){
                        		temp[$(v).attr('data-superattr')] = (($(v).val()) === '0') ? null : ($(v).val());
                        	} else{
                        		temp[$(v).attr('data-superattr')] = $(v).val();
                        	}
                        }
                    }
                });
                temp.dateFormat = localStorage.getItem('dateFormat');
                min = ((min.length === 1) ? ('0' + min) : min);
                date = ((date.length === 1) ? ('0' + date) : date);
                mon = ((mon.length === 1) ? ('0' + mon) : mon);
                hour = ((hour.length === 1) ? ('0' + hour) : hour);
                sec = ((sec.length === 1) ? ('0' + sec) : sec);
                dateStr = date + "-" + mon + "-" + currDate.getFullYear() + " " + hour + ":" + min + ":" + sec;
                data = {
                    reportCode : nsReports.reportsForm.currentReportCode,
                    dateFormat : dateFormat,
                    timeFormat : timeFormat,
                    currentDate : dateStr,
                    reportsDetail : temp,
                    alertConfirm : ((instance.submitFromPopUp) ? 'Y' : 'N')
                };
                if (nsReports.reportsForm.currentReportCode === 'RPE') {
                    vmsService.vmsApiServiceLoad(function(response) {
                        if (response) {
                            if (!(response.responseData.reportObjectList)
                                || response.responseData.reportObjectList.length === 0) {
                                nsCore.showAlert('No data found for current arguments!');
                                return false;
                            } else {
                                window.location.href = nsReports.generateP3ReportData + encodeURIComponent(JSON.stringify(data));
                            }
                        } else {
                            nsCore.showAlert(nsReports.errorMsg);
                        }
                    }, nsReports.generateP3Report, 'POST', JSON.stringify(data));
                } else {
                    vmsService.vmsApiServiceLoad(function(response) {
                        var enabledFormats, i = 0, reportsPopUpHt, reportsIframeHt,reportId;
                        if (response) {
                            instance.submitFromPopUp = false;
                            if(response.responseData && response.responseData.reportObjectList){
	                            if (!(response.responseData.reportObjectList)
	                                || response.responseData.reportObjectList.length === 0) {
	                                nsCore.showAlert('No data found for current arguments!');
	                                $('#testForm').find('input[type="text"]').first().focus();
	                                return false;
	                            }
	                            if (response.responseData.reportObjectList[0].alertRequired === 'Y') {
	                                $('#dialog-confirm').dialog({
	                                    resizable : false,
	                                    modal : true,
	                                    autoOpen : false,
	                                    width : 400,
	                                    dialogClass : 'titleShow',
	                                    closeOnEscape : false,
	                                    zIndex: 1000,
	                                    buttons : {
	                                        'Yes' : function() {
	                                            $(this).dialog('close');
	                                            instance.submitFromPopUp = true;
	                                            $('.previewReport').trigger('click');
	                                        },
	                                        'No' : function() {
	                                            $(this).dialog("close");
	                                        }
	                                    }
	                                }).dialog('open').find('.popupContent').html(
	                                    'The Report has been ordered '
	                                        + response.responseData.reportObjectList[0].countOfOrder
	                                        + ' time(s) before, last time by '
	                                        + response.responseData.reportObjectList[0].orderedBy + ' at '
	                                        + response.responseData.reportObjectList[0].orderedDate
	                                        + '. Do you want to order it again?');
	                                return false;
	                            }
                            }
                            if(response.responseData && response.responseData.enabledFileFormatList){
	                            enabledFormats = response.responseData.enabledFileFormatList;
	                            reportId = response.responseData.reportId;
	                            for (i in enabledFormats) {
	                            	removeEleClass(enabledFormats, i, reportId);
	                            }
	                            $('#emailPdf').attr('data-reportId',reportId);
                            }
                            	reportDialogHelper(response, reportsPopUpHt, reportsIframeHt);
                        } else {
                            nsCore.showAlert(nsReports.errorMsg);
                        }
                    }, nsReports.generateReport, 'POST', JSON.stringify(data));
                }
            }
            // Added for email disable functionality
            if (nsReports.reportsForm.currentReportCode === 'RPE'
                || nsReports.reportsForm.currentReportCode === 'REDIECD'
                || nsReports.reportsForm.currentReportCode === 'REDIICD'
                || nsReports.reportsForm.currentReportCode === 'REDIPL'
                || nsReports.reportsForm.currentReportCode === 'REDID'
                || nsReports.reportsForm.currentReportCode === 'RUMA') {
                $('#emailPdf').attr('disabled', true);
            } else {
                $('#emailPdf').attr('disabled', false);
            }
        };
    }
    reportsObj = {
        'generalLabel' : generalLabel,
        'generateSelectInput' : generateSelectInput,
        'getDetails' : getDetails,
        'generateBoxItems' : generateBoxItems,
        'isRequired' : isRequired,
        'isPortSearchInput' : isPortSearchInput,
        'formRenderer' : formRenderer
    };
    $.extend(true, nsReports, reportsObj);
})(this.reports, this.core, this.vmsService, jQuery);
