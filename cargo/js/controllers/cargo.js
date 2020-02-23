/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsCargo, $, vmsService, nsCore) {
    //function to get selected row count
    var actionItem = '',
        dirtyFlag = 0,
        navCheck = 0,
        cargoTempObj = {},
        fetchAll = 'N';
    cargoTempObj = {'actionItem' : actionItem};
    $.extend(true, nsCargo, cargoTempObj);
    $.extend(true, nsCargo, {'fetchAll' : fetchAll});

    function selectedRowsCount() {
        return  $('#cargoMgmtGrid').dataTable().api().rows('.selected').data().length;
    }

    // This method is used to handle popup when escape key is pressed
    function cargoPopupEscHandler() {
        var escKeyCode = 27;
        $(document).keyup(function(e) {
            if (e.keyCode === escKeyCode && $('#newCargoDetailsPopup').hasClass('active-content')) {
                $('#newCargoDetailsPopup .dialogCloseIcon').trigger('click');
            }
        });
    }

    // This method is used to initiate the dialog box for dirty flag check functionality
    function dialogInit() {
    	var titleText = '';
        $('#dialog-confirm').dialog({
            resizable: false,
            modal: true,
            autoOpen: false,
            width: 400,
            closeOnEscape: false,
            open : function() {        	
	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
	            	.removeClass('ui-corner-all ui-widget');
	            titleText = $('#dialog-confirm').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
	        	$('#dialog-confirm').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
            },
            buttons: {
                'Yes': function() {
                    $(this).dialog('close');
                    if (dirtyFlag === 1) {
                    	dirtyFlag = 0;
                    	$('#newCargoDetailsPopup .formSubmitButtons .saveButton').trigger('click');
                    } else {
                        $('#actionListApply').click();
                    }
                },
                'No': function() {
                    $('#newCargoDetailsPopup').removeClass('active-content');
                    $(this).dialog('close');
                    if (dirtyFlag !== 1) {
                        if (navCheck === 0) {
                            $('#newCargoDetailsPopup').dialog('close');
                        } else {
                            nsCargo.navigateToClickedPath();
                        }
                    } else {
                        $('#newCargoDetailsPopup').dialog('close');
                        dirtyFlag = 0;
                    }
                }
            }
        });
    }

    //This method is used to calculate the area volume
    function updateAreaVolumeCalc(mType) {
        vmsService.vmsApiService(function(response) {
            if (response) {
            	var numMsg="";
            	if (response.responseData.length !== 0) {
                    $('#updAreaCalc').val((!(response.responseData[0].calculatedArea) ? '' : response.responseData[0].calculatedArea));
                    numMsg=	nsCargo.largeOrInvalidPart(numMsg, response.responseData[0].calculatedArea, 18, "Area", 3);
                    if(numMsg==="") {
                    	$('#updVolumeCalc').val((!(response.responseData[0].calculatedVolume) ? '' : response.responseData[0].calculatedVolume));
                    	numMsg=	nsCargo.largeOrInvalidPart(numMsg, response.responseData[0].calculatedVolume, 18, "Volume", 3);
                    }
                   if(numMsg!=="") {
	            	   $('#updLengthCalc').focus
	            	   nsCore.showAlert(numMsg);
            	   }
                } else {
                    $('#updAreaCalc').val('');
                    $('#updVolumeCalc').val('');
                }
            } else {
                nsCore.showAlert(nsCargo.error);
            }

        }, nsCargo.areaVolume, 'POST', JSON.stringify(mType));
    }

    //This method triggers the area volume calculation
    function calcAreaAndVolumeAjax(length, width, height) {
        var msg = '',
            mType, elementLen = $('#lengthCalc'),
            valueLen = elementLen.val(),
            elementWidth = $('#widthCalc'),
            valueWidth = elementWidth.val(),
            elementHeight = $('#heightCalc'),
            valueHeight = elementHeight.val(),
            elementWeight = $('#updWeightCalc'),
            valueWeight = elementWeight.val();
        length = (nsCargo.checkEmptyString(length) ? 0 : length);
        width = (nsCargo.checkEmptyString(width) ? 0 : width);
        height = (nsCargo.checkEmptyString(height) ? 0 : height);
        msg = nsCargo.dimensionsLWHWValidation(msg, valueLen, valueWidth, valueHeight,
            valueWeight, elementLen, elementWidth, elementHeight, elementWeight);
        if (msg) {
            nsCore.showAlert(msg);
            return false;
        }
        mType = {
            'calculatedLength': (isNaN(length) ? null : length),
            'calculatedWidth': (isNaN(width) ? null : width),
            'calculatedHeight': (isNaN(height) ? null : height),
            'measurementType': $('#dimensions').val()
        };
        updateAreaVolumeCalc(mType);
    }

    //This method is used to load the cargo status dropdown
    function cargoStatusesAjax() {
        var cargoStatusesData = {
            id: 'Y'
        },
		status;

        vmsService.vmsApiService(function(response) {
            if (response) {
                status = '<option value="" selected>-- Select --</option>';
                $.each(response, function(i, val) {
                    status += '<option value="' + val.code + '">' + val.desc + '</option>';
                });
                $('#cargoStatus').html(status);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, nsCargo.cargoStatus, 'POST', JSON.stringify(cargoStatusesData));
    }

    //This method is used to load the cargo state dropdown
    function cargoStateAjax() {
		var state;
        vmsService.vmsApiServiceType(function(response) {
            if (response) {
            	response.responseData.sort(function(a, b) {
                    var val1 = a.desc.toUpperCase(),
                    	val2 = b.desc.toUpperCase();
                    return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
                });
                state = '<option value="" selected>-- Select --</option>';
                $.each(response.responseData, function(i, val) {
                    state += '<option value="' + val.code + '">' + val.desc + '</option>';
                });
                $('#cargoState').html(state);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, nsCargo.cargoState, 'GET', null);
    }

    //This method is used to load the cargo type dropdown
    function cargoTypesAjax() {
		var type;
        vmsService.vmsApiService(function(response) {
            if (response) {
                type = '<option value="" selected>-- Select --</option>';
                $.each(response, function(i, val) {
                    type += '<option value="' + val.id + '">' + val.desc + '</option>';
                });
                $('#cargoType').html(type);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, nsCargo.cargoTypes, 'GET', null);
    }

    //This method is used to load the measurement types dropdown
    function measurementSystemsAjax() {
        var defaultUnit = localStorage.getItem('measurementType'),
		dimensions = '';
        vmsService.vmsApiService(function(response) {
            if (response) {
                $.each(response, function(i, val) {
                	if(defaultUnit === val.code){
						dimensions += '<option value="' + val.code + '" selected>' + val.desc + '</option>';
						$('.dim').val(val.code);
                	}
                	else{
                		dimensions += '<option value="' + val.code + '">' + val.desc + '</option>';
                	}
                });
                $('.dim').html(dimensions);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, nsCargo.cargoMeasurement, 'GET', null);
    }

    //This method is used to load the reports related to cargo
    function cargoReportAjax() {
		var cargoReport,
		typeCode = {
			code: 'TERM'
		},
		j;
        vmsService.vmsApiService(function(response) {

            if (response) {
                cargoReport = '<ul class="inputActionWrap">';
                for (j = 0; j < response.length; j++) {
                    cargoReport = cargoReport + '<li class="optionItem"><span class="optionVal">'+ response[j].desc
					+ '</span><span class="icons_sprite smallRemoveIcon floatRight fa fa-remove"></span></li>';
                }
                cargoReport = cargoReport + '</ul>';
                $('#cargoReport').html(cargoReport);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, '/Vms/masterdata/terminalReports', 'POST', JSON.stringify(typeCode));
    }

    // This method is used to load the insert control number
    function insertControlAjax() {
        var typeCode = {
            code: 'CAINC'
        },
		cargoControl,
		k;
        vmsService.vmsApiService(function(response) {
            if (response) {
                cargoControl = '<ul class="inputActionWrap">';
                for (k = 0; k < response.length; k++) {
                    cargoControl = cargoControl + '<li class="optionItem"><span class="optionVal">' + response[k].desc
					+ '</span><span class="icons_sprite smallRemoveIcon floatRight fa fa-remove" ></span></li>';
                }
                cargoControl = cargoControl + '</ul>';
                $('#insertControl').html(cargoControl);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, '/Vms/masterdata/insertControlNumber', 'POST', JSON.stringify(typeCode));
    }

    //This method is used to load the Shipping Status
    function shippingStatusAjax() {
        var typeCode = {
            code: 'CASHS'
        },
		i, cargoShippingDetails;

        vmsService.vmsApiService(function(response) {
            if (response) {
                cargoShippingDetails = '<ul class="inputActionWrap">';
                for (i = 0; i < response.length; i++) {
                    cargoShippingDetails = cargoShippingDetails
					+ '<li class="optionItem"><span class="optionVal">' + response[i].desc
					+ '</span><span class="icons_sprite smallRemoveIcon floatRight fa fa-remove"></span></li>';
                }
                cargoShippingDetails = cargoShippingDetails + '</ul>';
                $('#shippingStatus').html(cargoShippingDetails);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, '/Vms/masterdata/shippingStatuses', 'POST', JSON.stringify(typeCode));
    }

    //This method is used to hide the popup on mouse up
    function hidePopUpBind() {
        $(document).on('mouseup', function(e) {
            var cargoContainer = $('.toolTipWrapper');
            if (!cargoContainer.is(e.target) && cargoContainer.has(e.target).length === 0) {
                cargoContainer.hide();
            }
        });

        $(document).on("click", ".toolTipCloseIcon", function(e) {
            e.stopPropagation();
            $(".toolTipWrapper").hide();
        });

        $('#newCargoDetailsPopup').dialog({
            closeOnEscape: false,
            modal: true,
            autoOpen: false,
            resizable: false,
            draggable: false,
            width: '90%',
            close: function() {
                $('#newCargoForm').trigger('reset');
            },
            create: function() {
                $('#newCargoDetailsPopup').prev().remove();
            },
            open: function() {
                $('#newCargoDetailsPopup').prev().remove();
                $('#newCargoDetailsPopup').addClass('active-content');
                dirtyFlag = 0;
            }
        });
    }



    // This method is used to set the values for the area & volume
    function areaVolumeCalcBind() {
        $('.areaCalculation .formInputWrap.dimension input').keyup(function() {
            var length = $('#lengthCalc').val(),
                width = $('#widthCalc').val(),
                height = $('#heightCalc').val(),
                area, volume;
            if ($.isNumeric(length) && $.isNumeric(width) && $.isNumeric(height)) {
                area = (length * width);
                volume = nsCore.volumeCalc(length ,width , height);
                $('#areaValue').html(area);
                $('#volumeValue').html(volume);
            } else if ($.isNumeric(length) && $.isNumeric(width)) {
                area = (length * width);
                $('#areaValue').html(area);
            } else {
                $('.calculationValue').html('');
            }
        });
    }

    // This method is used to perform reset functionality
    function resetClearBind() {
        // Dimensions Reset
        $(document).on('click', '.resetButton', function() {
            $('.areaCalculation  input').val('');
            $('.calculationValue').html('');
        });
        // Reset All Rows and filter fields
        $('.filterDiv .resetIcon').click(function() {
            $('#checkAllRows').prop('checked', false);
            $('#cargoMgmtGrid').dataTable().api().rows().nodes().to$().find('.checkBoxCell')
                .each(function(i, obj) {
                    $(obj).find('input.selectCargo').prop('checked', false);
                    $(obj).parent().removeClass('DTTT_selected selected');
                });
            $('.filterBox').val('');
            $('#cargoMgmtGrid').dataTable().api().search('').columns().search('').draw();
            $('.statusMessageText,.cargoMgmtRightData .buttonsList').css('display', 'block');
        });
        // Reset Search
        $(document).on('click', '.resetSearch', function() {
            $('#leftSearchMenu').find('.searchMenuItemWrap').find('.searchInput').val('');
            $('.searchInputTmp').val('');
            $('#newCargo').prop('checked', true);
        });
    }

    //This method is used to perform the expand collapse functionality
    function blueHeaderClickBind() {
        $(document).on('click', '.blueHeader', function() {
            if ($(this).hasClass('disabled')) {
                return;
            }
            if (!($(this).hasClass('notExpandable'))) {
                $(this).find('.icons_sprite').toggleClass('smallBottomArrowIcon');
                $(this).next().slideToggle();
                $(this).next().find('.optionItem,.optionVal').show();
                $(this).next().find('.smallRemoveIcon').hide();
                $(this).next().find('.optionVal').removeClass('clickedOption');
                $(this).next().find('textarea, input').val('');
                $('.blueAccElement .blueHeader').removeClass('disabled');
                nsCargo.setDefaultUnits();
                if ($(this).closest('.blueAccElement').find('.normalAccContentWrap ul').hasClass('inputActionWrap')) {
                    $(this).closest('.blueAccElement').find('.actionListInput').hide().find('input').val('');
                }
            }
        });
    }

    //This method is used to validate the shipping status
    function optionValClickBind() {
        var cargoStatusReceived = 'Received',
            cargoStatusLoaded = 'Loaded',
            cargoStatusDischarged = 'Discharged',
            dateFormat = localStorage.getItem('dateFormat'),
            masterURLprefix = '/Vms',
            optionValArr = $(this).closest('.optionVal').html(),
            reportOption = '3',
            dateToFetch, allDates, shippingDate, exceptElement, reportName;
        $(document).on('click', '.optionVal', function() {
        	var dCheck = false;
        	optionValArr = $(this).closest('.optionVal').html();
            if (optionValArr === cargoStatusReceived || optionValArr === 'Released to Load') {
                $('#shippingStatusDt').val($.datepicker.formatDate(dateFormat, new Date()));
            } else if (optionValArr === cargoStatusLoaded || optionValArr === cargoStatusDischarged) {
                dateToFetch = (optionValArr === cargoStatusLoaded ? 'etd' : 'eta');
                allDates = [];
                $.each($('#cargoMgmtGrid tbody tr .checkBoxCell input:checked'), function(i, obj) {
                    allDates.push($('#cargoMgmtGrid').dataTable().api().row($(obj).closest('tr')).data()[dateToFetch]);
                });
                if(allDates.length > 0){
                	dCheck = !!allDates.reduce(function(a, b){ 
                				return (a === b) ? a : NaN; 
            				});
                }
                if (dCheck) {
                    shippingDate = allDates[0];
                    $('#shippingStatusDt').val(shippingDate);
                }
            } else {
                $('#shippingStatusDt').val('');
            }
            exceptElement = $(this).closest('.blueAccElement');
            nsCargo.actionItem = $(this).closest('.blueAccElement').attr('data-tabnum');
            $('.blueAccElement .blueHeader').addClass('disabled').next().hide();
            $('.blueAccElement .blueHeader').find('.icons_sprite').addClass('smallBottomArrowIcon');
            exceptElement.find('.blueHeader').removeClass('disabled').next().show().find('.icons_sprite')
                .removeClass('smallBottomArrowIcon');
            if (!($(this).hasClass('clickedOption'))) {
                $(this).addClass('clickedOption');
                $(this).closest('.optionItem').siblings().hide();
                $(this).next().show();
                if(($(this).closest('.optionItem').parent().parent().parent().text()).indexOf('Report Options') >= 0){
                	$(this).closest('.optionItem').siblings().show();
                	 $(this).next().hide();
                }
                if ($(this).closest('.blueAccElement').find('.normalAccContentWrap ul').hasClass('inputActionWrap')) {
                    $(this).closest('.blueAccElement').find('.actionListInput').toggle().val('');
                }
                // condition for Report Option Redirect using Tab Num
                // attribute
                if (nsCargo.actionItem === reportOption) {
                    reportName = $(this).html().trim();
                    $('.blueAccElement .blueHeader').removeClass('disabled');
                    window.open(masterURLprefix + '/reports/home?report_name=' + encodeURI(reportName), '_blank');
                }
            }
        });
    }

    //This method is used to perform the minimum search criteria close icon functionality
    function removeCloseIcon() {
        $(document).on('click', '.optionItem .smallRemoveIcon', function() {
            var accWrap = $(this).closest('.normalAccContentWrap'),
                blueAccEle = $(this).closest('.blueAccElement');
            nsCargo.actionItem = $(this).closest('.blueAccElement').attr('data-tabnum');
            $('#shippingStatusDt.dateOptionsVal').val('');
            $('.blueAccElement .blueHeader').removeClass('disabled');
            $(blueAccEle).find('.icons_sprite').addClass('smallBottomArrowIcon');
            $(accWrap).slideUp();
            $(accWrap).find('.optionItem,.optionVal').show();
            $(accWrap).find('.smallRemoveIcon').hide();
            $(accWrap).find('.optionVal').removeClass('clickedOption');
            if ($(blueAccEle).find('.normalAccContentWrap ul').hasClass('inputActionWrap')) {
                $(blueAccEle).find('.actionListInput').toggle().val('');
            }
        });

        // Searched Item Remove Event
        $('.searchedForWrap').on('click', '.smallRemoveIcon', function() {
            var cargoSearchItem = $(this).closest('.searchedItem'),
                searchKey = cargoSearchItem.attr('data-searchkey'),
				el = $('#leftSearchMenu'),
                searchedEle = $(el).find('input[data-searchkey="' + searchKey + '"]');
            $(cargoSearchItem).remove();
            searchedEle.val('');
            if (searchedEle.hasClass('isDoubleInp')) {
                searchedEle.siblings().val('');
            } else {
                searchedEle.val('');
            }
            $(el).find('[data-searchkey="' + searchKey + '"]').val('');
            $(el).submit();
        });

        $(document).on('click', '#emailGrid .smallRemoveIcon', function() {
            $(this).closest('tr').remove();
        });
    }

    //This method is used to perform the cargo condition validation
    function cargoCondnTextAreaBind() {
        $('.cargoCondnTextArea textarea').keyup(function() {
            var cargoTextVal = $(this).val(),
                exceptElement = [];
            if (cargoTextVal) {
                dirtyFlag = 1;
                exceptElement = $(this).closest('.blueAccElement');
                nsCargo.actionItem = $(this).closest('.blueAccElement').attr('data-tabnum');
                $('.blueAccElement .blueHeader').not($(this).closest('.blueAccElement').find('.blueHeader'))
                    .addClass('disabled').next().hide();
                $('.blueAccElement .blueHeader').find('.icons_sprite').addClass('smallBottomArrowIcon');
                exceptElement.find('.blueHeader').find('.icons_sprite').removeClass('smallBottomArrowIcon');
            } else {
                dirtyFlag = 0;
                hideActionLists(this);
            }
        });
    }

    //This method is used to perform the dimendion wrap functionality
    function dimensionWrapFormBind() {
        $('.dimensionWrap input,.dimensionWrap select').change(function() {
            var NonEmptyInputsCount = 0;
            nsCargo.actionItem = $(this).closest(".blueAccElement").attr("data-tabnum");
            $(this).closest('.blueAccElement').attr('data-tabnum');
            $.each($('.dimensionWrap input,.dimensionWrap select'), function(i, obj) {
                if ($(obj).val()) {
                    NonEmptyInputsCount++;
                }
            });
            dirtyFlag = 1;
            if (NonEmptyInputsCount !== 0) {
                $('.blueAccElement .blueHeader').addClass('disabled').not($(this).closest('.blueAccElement')
				.find('.blueHeader')).next().hide();
                $('.blueAccElement .blueHeader').find('.icons_sprite').not($(this).closest('.blueAccElement')
				.find('.blueHeader .icons_sprite')).addClass('smallBottomArrowIcon');
                $(this).closest('.blueAccElement').find('.blueHeader').removeClass('disabled').find('.icons_sprite')
                    .removeClass('smallBottomArrowIcon');
            } else {
                hideActionLists(this);
            }
        });
    }

    // This method is used to hide the action list panel
    function hideActionLists(currentEle) {
        var cargoCurrentElement = $(currentEle);
        $('.blueAccElement .blueHeader').removeClass('disabled');
        cargoCurrentElement.closest('.blueAccElement').find('.icons_sprite').addClass('smallBottomArrowIcon');
        cargoCurrentElement.closest('.normalAccContentWrap').slideUp();
    }

    //This method is used to trigger the area volume calculation
    function actionListApplyClickBind() {
        $(document).on('click', '#actionListApply', function(e) {
            var length = $('#lengthCalc').val(),
                width = $('#widthCalc').val(),
                height = $('#heightCalc').val(),
                weight = $("#weight").val();
            // validation area and volume
            nsCargo.calcAreaAndVolume(length, width, height, weight);
        });
    }

    //This method is used to initiate the email popup
    function emailPopupFormBind() {
        // Email Popup
        $('#emailGrid').DataTable({
            'serverSide': false,
            'tabIndex': -1,
            'info': false,
            'bSort': false,
            'fixedHeader': false,
            "orderClasses": false,
            'dom': '<<t>>',
            fnInitComplete: function() {
                $('th').unbind('keypress');
            },
            'bAutoWidth': false,
            'columns': [{}, {}, {}, {}, {
                'width': '50px'
            }]
        });

        // Email Form Submit
        $(document).on('click', '#emailLink', function() {
        	if($.unique(nsCargo.dataList).length <= 0){
            	nsCore.showAlert('Please make a selection of cargo/Vin to email');
            }
        	else{
	            $('#emailPopup').dialog({
	                modal: true,
	                resizable: false,
	                draggable: false,
	                width: '85%',
	                close: function() {/*There is no operation performed on email close function*/},
	                create: function() {
	                    $('#emailPopup').prev().remove();
	                },
	                open: function() {
	                    $('#emailPopup').prev().remove();
	                    $('#emailID,#ccID,#bccID,#subject,#content').val('');
	                }
	            });
        	 } 
        });
        
       
    }

    //This method is used to re calculate the dimensions on change of dimensions type in action list
    function dimensionInputChangeBind() {
        $('.areaCalculation .formInputWrap.dimension input').change(function() {
            var wdCalc = $('#updWidthCalc').val(),
                length = $('#updLengthCalc').val(),
                width = nsCargo.checkParseFloat(wdCalc).toFixed(3),
                height = $('#updHeightCalc').val(),
                weight = $('#updWeightCalc').val(),
                len = nsCargo.checkParseFloat(length).toFixed(3);
            $('#updLengthCalc').val((length ? nsCargo.checkParseFloat(length).toFixed(3) : ''));
            $('#updWidthCalc').val((wdCalc ? nsCargo.checkParseFloat(wdCalc).toFixed(3) : ''));
            $('#updHeightCalc').val((height ? nsCargo.checkParseFloat(height).toFixed(3) : ''));
            $('#updWeightCalc').val((weight ? nsCargo.checkNum(weight) : ''));
            if ($.isNumeric(len) && $.isNumeric(width) && $.isNumeric(height)) {
                calcAreaAndVolumeAjax(len, width, height);
            } else if (($.isNumeric(len) && $.isNumeric(width)) || nsCargo.checkEmptyString(height)) {
                calcAreaAndVolumeAjax(len, width, height);
            } else if (($.isNumeric(len) && $.isNumeric(height)) || nsCargo.checkEmptyString(width)) {
                calcAreaAndVolumeAjax(len, width, height);
            } else if (($.isNumeric(width) && $.isNumeric(height)) || nsCargo.checkEmptyString(len)) {
                calcAreaAndVolumeAjax(len, width, height);
            } else if ($.isNumeric(len) && $.isNumeric(width)) {
                calcAreaAndVolumeAjax(len, width, height);
            } else {
                $('#areaValue').val('');
                $('#volumeValue').val('');
                return true;
            }
        });
    }

    //THis method is used to set values after re calculation of dimensions
    function dimensionActionChangeBind() {
        $('.dimensionAction').change(function() {
            var actionLength = $('#lengthCalc').val(),
                actionWidth = $('#widthCalc').val(),
                actionHeight = $('#heightCalc').val(),
                actionWeight = $('#weight').val();

            $('#lengthCalc').val((actionLength ? nsCargo.checkParseFloat(actionLength).toFixed(3) : ''));
            $('#widthCalc').val((actionWidth ? nsCargo.checkParseFloat(actionWidth).toFixed(3) : ''));
            $('#heightCalc').val((actionHeight ? nsCargo.checkParseFloat(actionHeight).toFixed(3) : ''));
            $('#weight').val((actionWeight ? nsCargo.checkNum(actionWeight) : ''));
        });
    }

    $(document).ready(function() {
        var dateFormat = localStorage.getItem('dateFormat');
        cargoPopupEscHandler();
        $('.datePickerInp').datepicker({
            dateFormat: dateFormat,
            changeYear: true
        });
        $('#leftSearchMenu #vessel').change(function(){
        	if(!$(this).val()){
        		$('#leftSearchMenu #voyage').val('').attr('disabled', true);
        	}
        })
        $('.filterDiv .datePickerIcon').unbind('click').bind('click', function(e) {
            e.stopPropagation();
            $(this).closest('.datePickrFilterWrap').find('.datePickerInp').focus();
        });
        
        $('#newCargoDetailsPopup .formSubmitButtons .saveButton').click(function(){
        	dirtyFlag = 0;
        })
        // Hide the result div on load
        $('#searchResult,#searchedFor,#actionLst,#excel,#emailLink,div.dataExceeds').hide();
        $('.cargoMgmtGridContentWrapper,.exportButtons').toggleClass('compressedState expandState');
        $('.findCargo,.newSearch').toggle();
        $('.leftSearchMenuContent').toggle('slide', 'left');
        $(document).on('click', '.dialogCloseIcon', function() {
            $(this).closest('.ui-dialog-content').dialog('close');
        });
        // Initializing Popup
        dialogInit();
        
        $(document).on('keyup change', '#newCargoDetailsPopup :input', function(){
        	$(this).closest('form').data('changed', true);
        	dirtyFlag = 1;
        })
        
        $('#newCargoDetailsPopup .cancelButton, #newCargoDetailsPopup .dialogCloseIcon')
            .unbind('click').bind('click', function(e) {
                e.stopPropagation();
                if (dirtyFlag === 1) {
                	navCheck = nsCargo.showDirtyFlagMessage(false, dirtyFlag);
                } else {
                    $('#newCargoDetailsPopup').dialog('close');
                    dirtyFlag = 0;
                }
            });
        
        $(document).on('click', 'input[name="selectCargo"]', function() {
            var cargoRowsCount = $('#cargoMgmtGrid').dataTable().api().data().length,
            	eleVal = $(this)[0].id,
            	checked =$(this).is(':checked');            
            	nsCargo.addSelection(eleVal,checked);
            	if(!checked){
            		$(this).parent().parent().removeClass('DTTT_selected selected');
            		$('#emailLink, .exportExcelLnk').show()
            	}
            	else{
            		$(this).parent().parent().addClass('DTTT_selected selected');
            		$('#emailLink, .exportExcelLnk').show()
            	}

            // Moved code here and removed duplicate event to check/uncheck check all.
            $('#checkAllRows').prop('checked', (selectedRowsCount() === cargoRowsCount));
        });
        $(document).on('click', '.selectCargo', function() {
            var cargoRowsCount = $('#cargoMgmtGrid').dataTable().api().data().length,
            	eleVal = $(this)[0].id,
            	checked =$(this).is(':checked');            
            	nsCargo.addSelection(eleVal,checked);
            if (selectedRowsCount() === 0) {
                $('.cargoMgmtRightData .buttonsList').show();
                $('#emailLink, .exportExcelLnk').show()
            } else {
                nsCargo.showBtnsAndResize();
            }
            // Moved code here and removed duplicate event to check/uncheck check all.
            $('#checkAllRows').prop('checked', (selectedRowsCount() === cargoRowsCount));
        });
        
        
        $(document).on('keyup', '.cargoMgmtGridContentWrapper .filterBox', function() {
        	if($(this).val().trim().length >= 1){
        	 $('#checkAllRows').prop('checked', false);
        	}
        });
        
        $(document).on('click', '.getAllCargo', function() {
            nsCargo.fetchAll = "Y";
            $('#leftSearchMenu').submit();
        });
        
        $(document).on('click', '#cargoSearchSubmit', function() {        
            nsCargo.fetchAll = "N";
        });

        $('#newCargo').attr('checked', true);
        $('#voyage').prop('disabled', true);
        // Search button click
        $('#leftSearchMenu').submit(function(e) {
        	$('.preloaderWrapper').show();
            $('#cargoMgmtGrid_wrapper').hide();
            $('.statusMessageText').hide();
            $('.dataExceeds.statusMessageTextdata.nIhide').hide();
            nsCargo.leftMenuSearch(e);
        });
        // on load dropdown
        cargoStatusesAjax();
        cargoStateAjax();
        cargoTypesAjax();
        // Get the dimensions
        measurementSystemsAjax();
        cargoReportAjax();
        shippingStatusAjax();
        insertControlAjax();
        nsCargo.loadAutoComplete();
        // To hide Popover
        hidePopUpBind();
        // Area & volume Calculation
        areaVolumeCalcBind();
        resetClearBind();
        $(document).on('click', '#areaAndVolumeUpdate', function() {
            nsCargo.calculateAreaVolume();
        });
        $(document).on('click', '.showHideSearch', function() {
            $('.cargoMgmtGridContentWrapper,.exportButtons').toggleClass('compressedState expandState');
            $('.findCargo,.newSearch').toggle();
            $('.leftSearchMenuContent').toggle('slide', 'left');
        });
        blueHeaderClickBind();
        optionValClickBind();
        removeCloseIcon();
        cargoCondnTextAreaBind();
        dimensionWrapFormBind();
        $(document).on('click', '.actionListLnk', function() {
            if ($('#sec').val() === 'Write') {
                $(this).find('.icons_sprite').toggleClass('fa-chevron-left fa-chevron-right');
                $('.rightActionListWrapper').toggleClass('actionListWrapStyles');
                $('.actionListContent').toggle('slide', {
                    direction: 'right'
                });
                nsCargo.adjustActionList();
            }
        });
        $(document).on('click', '.datePickerIcon', function() {
            $(this).closest('.datePickerInpWrap').find('.datePickerInp').focus();
        });
        // Action List Submit
        actionListApplyClickBind();
        emailPopupFormBind();
        dimensionActionChangeBind();
        dimensionInputChangeBind();
        $('#bookingEmailDetails').submit(function(e) {
            e.preventDefault();
            nsCargo.sendMail();
        });
        nsCore.areaVolEvent('updLengthCalc', 'updWidthCalc', 'updHeightCalc', 'areaValue', 'volumeValue');
        nsCore.weightEvent('updWeightCalc');
        nsCore.areaVolEvent('lengthCalc', 'widthCalc', 'heightCalc', 'areaValue', 'volumeValue');
        nsCore.weightEvent('weight');
    });
    // End of document ready
})(this.cargoObj, this.jQuery, this.vmsService, this.core);