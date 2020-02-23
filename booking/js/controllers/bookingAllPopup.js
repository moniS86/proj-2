/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var allChargeid = '', allChargeTimeSt = '', subBookingIdDelete = '', popupObj = {};
    function applyRateCom(data, action) {
        $('#bookingRateListPopup').dialog({
            modal : true,
            resizable : false,
            draggable : false,
            width : '85%',
            open : function() {
                var tableEle = $('#bookingRateListGrid');
                if ($.fn.DataTable.fnIsDataTable(tableEle)) {
                    $('#bookingRateListGrid').dataTable().api().clear().draw();
                }
                $('#bookingRateListGrid').addClass(action);
            },
            close : function() {
                $('#bookingRateListGrid').removeClass(action);
            }
        });
        $('#bookingRateList').find('#applyRateSubmit').attr('disabled', 'disabled');
        vmsService
            .vmsApiServiceType(
                function(response) {
                    if (response) {
                        $('#bookingRateList').find('#applyRateSubmit').removeAttr('disabled');
                        if (response.responseDescription === 'Success') {
                            if ($.fn.DataTable.fnIsDataTable($('#bookingRateListGrid'))) {
                                $('#bookingRateListGrid').dataTable().api().clear().draw();
                                $('#bookingRateListGrid').dataTable().api().rows.add(response.responseData).draw();
                            } else {
                                $('#bookingRateListGrid')
                                    .DataTable(
                                        {
                                            'processing' : true,
                                            'serverSide' : false,
                                            'bFilter' : true,
                                            'tabIndex' : -1,
                                            'paging' : false,
                                            'fixedHeader' : false,
                                            "orderClasses" : false,
                                            'order' : [
                                                [
                                                    1, 'asc'
                                                ]
                                            ],
                                            'info' : false,
                                            'searching' : false,
                                            'dom' : '<t>',
                                            'scrollX' : true,
                                            'scrollY' : 300,
                                            'scrollCollapse' : true,
                                            'aaData' : response.responseData,
                                            'bAutoWidth' : false,
                                            'columns' : [
                                                {
                                                    data : 'checked',
                                                    'render' : function(rendererVal, type, full) {
                                                        return ('<input type="radio" name="bookingApplyRate" class="bookingApplyRate" value="'
                                                            + full.rateName + '">');
                                                    }
                                                }, {
                                                    data : 'rateName'
                                                }, {
                                                    data : 'comment',
                                                    className: 'normalSpace',
                                                    'sWidth': '150px'
                                                }, {
                                                    data : 'contractCode',
                                                    className: 'normalSpace'
                                                }, {
                                                    data : 'tradeName'
                                                }, {
                                                    data : 'originPort'
                                                }, {
                                                    data : 'destinationPort'
                                                }, {
                                                    data : 'loadPort'
                                                }, {
                                                    data : 'discPort'
                                                }, {
                                                    data : 'cargoType',
                                                    className: 'normalSpace'
                                                }, {
                                                    data : 'basisType',
                                                    className: 'normalSpace'
                                                }, {
                                                    data : 'currencyCode'
                                                }, {
                                                    data : 'rate',
	                                            	'render': function(data1, type, full) {	 
	                                            		return nsCore.roundingNumbersCharges(data1, full.currencyCode, "");
	                                                    
	                                                 }                                                 	
                                                }, {
                                                    data : 'measurementType',
                                                    'defaultContent' : '',
                                                    className: 'normalSpace'
                                                }, {
                                                    data : 'minimum',
                                                    'defaultContent' : ''
                                                }, {
                                                    data : 'maximum',
                                                    'defaultContent' : ''
                                                }, {
                                                    data : 'attributeOne',
                                                    'defaultContent' : ''
                                                }, {
                                                    data : 'cargoState',
                                                    'defaultContent' : ''
                                                }
                                            ]
                                        });
                            }
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.bookingRateCharges, 'POST', JSON.stringify(data));
    }
    function sendConfirmationMail() {
        var flg = 0, emailID = $('#emailID').val(), subject1 = $('#emailSubject').val(), ccID = $('#ccID').val(), bccID = $(
            '#bccID').val(), content1 = $('#content').val(), message = validateFields(flg, emailID, subject1, ccID,
            bccID), pathName = $('#emailPdfName').val(), attachmentList = [
            pathName
        ], mail = {
            toMail : emailID,
            ccMail : ccID,
            bccMail : bccID,
            bodyContent : content1,
            subject : subject1,
            attachmentList : attachmentList
        };
        if (message) {
            nsCore.showAlert(message);
        } else {
            $('#bookingEmailDetailsPopup').closest('.ui-dialog-content').dialog('close');
            vmsService.vmsApiService(function(response) {
                if (response) {
                    if (response.responseDescription === 'Success') {
                        nsCore.showAlert('Email sent successfully!');
                    } else {
                        nsCore.showAlert('Email send failed, please try again!');
                    }
                    $('#bookinConfirmationPopup').closest('.ui-dialog-content').dialog('close');
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.bookingMailCnfrm, 'POST', JSON.stringify(mail));
        }
    }
    function validateFields(flg, emailID, subject1, ccID, bccID) {
        var message = '', emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, emailIdArry = emailID.split(';'), emailArrLen = emailIdArry.length, i = 0;
        if (!(emailID) || !(emailID.trim())) {
            message = 'To e-mail ID should not be empty';
        } else if (emailID.indexOf(';') !== -1) {
            for (i = 0; i < emailArrLen; i++) {
                if (!emailReg.test(emailIdArry[i])) {
                    flg = 1;
                    break;
                }
            }
        } else {
            if (!emailReg.test(emailID)) {
                flg = 1;
            }
        }
        if (!emailReg.test(ccID)) {
            flg = 1;
        }
        if (!emailReg.test(bccID)) {
            flg = 1;
        }
        if (flg === 1) {
            message = message + '\nEnter valid email id(s)!';
        }
        message = validateEmailFields(subject1, message);
        return message;
    }
    function validateEmailFields(subject1, message) {
        if (!subject1 || !(subject1.trim())) {
            if (!message) {
                message = 'Subject should not be empty';
            } else {
                message = message + '\nSubject should not be empty';
            }
        }
        return message;
    }
    function isNotValidCharge(chargeTypeValue, chargeBasisValue, rateValue, commentValue, inclGross, inclAllSubBook,
        curencyValue, defaultCurrencyCode, prepaidValue) {
        var temp = chargeTypeValue && chargeBasisValue && (rateValue) && commentValue && inclGross === 'N'
            && inclAllSubBook === 'N' && curencyValue === defaultCurrencyCode && prepaidValue === 'P';
        return temp;
    }
    function cargoConsVal(){
    	var consId = 'id' + $("input[name='selectedRoute']:checked").attr('data-consignmentlegid'),
	    	isCargoEquip = nsCore.isCondTrue($('#cargoEquipmentNbr').is(':enabled'), 'Y', 'N'),
	    	cagoEqpNo = $('#cargoEquipmentNbr').find(':selected').text(),
	    	equipNo = (cagoEqpNo === '-- Select --') ? '': cagoEqpNo,
			cargoHoldDisabled = $('input:checkbox[name=cargoOnHold]').prop('disabled'),
			newCargoDisabled = $('select[name="attribute1"]').prop('disabled');
    	if($("input[name='selectedRoute']:checked").attr('data-consignmentlegid')){
    		nsBookDoc.cargoConsignmentsSBU[consId][0] = {
                    cargoOnHold : nsCore.isCondTrue(($('input:checkbox[name=cargoOnHold]:checked').val() === 'on'), 'Y', 'N'),
                    equipNo : equipNo,
                    enabledEquipment : isCargoEquip,
                    enabledCargoOnHold : nsCore.isCondTrue((cargoHoldDisabled), 'N', 'Y'),
                    enabledNewCargo : nsCore.isCondTrue((newCargoDisabled), 'N', 'Y')
        	}
    	}
    }
    function cargothrdPartyVal(){
    	var consId = 'id' + $("input[name='selectedRoute']:checked").attr('data-consignmentlegid'),
    		carrierId = nsCore.isCondTrue(($('#voyageTransportationType').val() === '20'), $('#voyageCarrier').val(), ''),
    		carrierName = nsCore.isCondTrue((carrierId === '12'), $('.carrierOtherDetails').val(), ''),
    		carrierRef = $('#voyageCarrierRef').val(),
    		departureDate = $('#estimatedDeparture').val(),
    		estimatedArrival = $('#estimatedArrival').val(),
    		shippedOnBoard =  nsCore.isCondTrue($('.shippedOnboard').is(':checked'), 'Y', 'N'),
    		transpType =$('#voyageTransportationType').val();
    	nsBookDoc.cargoConsignmentsVD[consId] = {
        		carrierId : carrierId,
        		carrierName : carrierName,
        		carrierRef : carrierRef,
        		departureDate : departureDate,
        		estimatedArrival : estimatedArrival,
        		shippedOnBoard : shippedOnBoard,
        		transpType : transpType
        };
    }
    $(document)
        .ready(
            function() {
                var chargeRowToRemove = '';
                $('#cargoOnHoldConfirm').dialog({
                    resizable : false,
                    modal : true,
                    autoOpen : false,
                    draggable : false,
                    width : 400,
                    closeOnEscape : false,
                    open : function() {
                    	var titleText = '';
        	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
        	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
        	            	.removeClass('ui-corner-all ui-widget');
        	            titleText = $('#cargoOnHoldConfirm').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
        	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
        	        	$('#cargoOnHoldConfirm').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
        	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
        	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                    },
                    buttons : {
                        'Yes' : function() {
                            var ele = $(this).data('origin');
                            if($(ele).attr('id') === 'subCOH'){
                            	nsBooking.updateSubBookFlag();
                        	} else{
                        		if($(ele).attr('id') === 'cargoHoldOn'){
                        			nsBooking.globalBookingFlag.mainBookingFlag = true;
                        			if(!$('.activeNavigationItem').attr('id')){
                        				$('#bookingUnitForm').attr('data-dirty-popup', true)
                        			}
                        			nsBooking.globalBookingFlag.fnGoForward = nsBookDoc.fnBookingUnitForward;
                                    nsBooking.globalBookingFlag.fnGoBackWard = nsBookDoc.fnBookingUnitBackward;
                        		}
                        	}
                            $(ele).prop('checked', !$(ele).prop('checked'));
                            cargoConsVal();
                            $(this).dialog('close');
                        },
                        'No' : function() {
                            $(this).dialog('close');
                        }
                    }
                });

                $(document).on('change', '.thrdPartyVal', function(){
                	cargothrdPartyVal();
                })
                $(document).on('change', '#cargoEquipmentNbr', function(){
                	cargoConsVal();
                })
                $('#subCOH, #cargoHoldOn')
                    .click(
                        function(e) {
                        	var loaded  = $("#routeDetailGrid_wrapper .selectedRoute[type='radio']:checked").attr('data-loadedunits'),
                            	subCohCond = (loaded === '0' || loaded === '') ? false : true,
                        		cond = ($(this).prop('id') === 'subCOH') ? subCohCond : ($('#dataLoaded').val());
                            e.preventDefault();
                            if (cond) {
                                nsCore.showAlert('Not allowed to change the cargo on hold status, the cargo is loaded!');
                            } else {
                                $('#cargoOnHoldConfirm').dialog('open').data('origin', $(this));
                            }
                        });
                // Custom order for dates
                $.extend($.fn.dataTableExt.oSort, {
                    'date-euro-pre' : function(a) {
                        var x, frDatea = $.trim(a).split(' '), frTimea = frDatea[1].split(':'), frDatea2 = frDatea[0]
                            .split('/');
                        if ($.trim(a)) {
                            x = (frDatea2[2] + frDatea2[1] + frDatea2[0] + frTimea[0] + frTimea[1] + frTimea[2]) * 1;
                        } else {
                            x = Infinity;
                        }
                        return x;
                    },
                    'date-euro-asc' : function(a, b) {
                        return a - b;
                    },
                    'date-euro-desc' : function(a, b) {
                        return b - a;
                    }
                });
                $('#subBookingChargesGrid')
                    .on(
                        'click',
                        ' .rowRemoveIcon',
                        function(e) {
                            var chargeId = $(this).parents('tr').find('.chargeId').val(), timeStamp = $(this).parents(
                                'td').find('.chargesTimestamp').val();
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            chargeRowToRemove = $(this).closest('tr');
                            $('#confirmDialogPopup').dialog({
                                modal : true,
                                resizable : false,
                                draggable : false,
                                width : '35%',
                                open : function() {
                                	var titleText = '';
	                	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
	                	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
	                	            	.removeClass('ui-corner-all ui-widget');
	                	            titleText = $('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
	                	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
	                	        	$('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
	                	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
	                	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                                    $('#confirmDialogPopup .rowItem').text('Do you want to delete this charge?');
                                    $('#confirmDialogPopup').find('form').attr('id', 'confirmChargeDelete');
                                },
                                'chargeId' : chargeId,
                                'timeStamp' : timeStamp
                            });
                            
                            $('#confirmDialogPopup #confirmChargeDelete')
                            .unbind('submit').bind('submit',
                                    function(eventListen) {
                                        var chargeToRemove = $('#confirmDialogPopup').dialog('option', 'chargeId'), 
                                        subBookingId = nsCore.appModel.getSelectedSubBookingId(), 
                                        charge = {};
                                        eventListen.preventDefault();
                                        timeStamp = $('#confirmDialogPopup').dialog('option', 'timeStamp');
                                        if (chargeToRemove) {
                                            charge = {
                                                id : chargeToRemove,
                                                subBookingID : subBookingId,
                                                timeStamp : timeStamp
                                            };
                                            vmsService
                                                .vmsApiServiceType(
                                                    function(response) {
                                                        if (response) {
                                                            if (response.responseDescription === 'concurrency') {
                                                                nsCore
                                                                    .showAlert('Someone else have updated the data since you retrieved the booking information');
                                                            } else if (response.responseDescription === 'Delete successful') {
                                                                chargeRowToRemove.remove();
                                                                nsBooking.chrgRateFlag = true;
                                                            }
                                                        } else {
                                                            nsCore.showAlert(nsBooking.errorMsg);
                                                        }
                                                    }, nsBooking.bookingDltCharge, 'POST', JSON.stringify(charge));
                                        } else {
                                            chargeRowToRemove.remove();
                                            nsBooking.chrgRateFlag = true;
                                        }
                                        $(this).closest('.ui-dialog-content').dialog('close');
                                    });
                        });
                /* ** View Charge comment pop up starts here ** */
                $(document)
                    .on(
                        'click',
                        '.commentsIcon',
                        function() {
                            var currentEle = $(this), ele = $('.toolTipWrapper'), tooltipContent = '', textBoxData = $(
                                this).closest('tr').find('.chargeComments').val(), commentsData = (!textBoxData) ? 'No comments Available'
                                : textBoxData;
                            $('.toolTipWrapper').html('').hide();
                            tooltipContent += '<div class="toolTipWrap">';
                            tooltipContent += '<div class="addrTextAreaWrap">'
                                + '<span class="icons_sprite removeIcon toolTipCloseIcon"></span>' + commentsData
                                + '</div></div>';
                            $('.toolTipWrapper').html(tooltipContent).show();
                            $(ele).position({
                                my : 'left top',
                                at : 'right top-25',
                                collision : 'flipfit',
                                of : $(currentEle)
                            });
                            $('.leftArrowIcon').position({
                                my : 'left top',
                                at : 'right-11 top-5',
                                collision : 'flipfit',
                                of : $(currentEle)
                            });
                        });
                /* Apply rate popup code starts here */
                $(document)
                    .on(
                        'click',
                        '#bookingRateListLink',
                        function() {
                            var iContract = $('#mainContract').val(), iOrgCode = $('#mainBookDetailCustomerOrigin')
                            .val(), iDestCode = $('#mainBookDetailCustomerDestination').val(), bookingTbl = $(
                            '#routeDetailGrid').DataTable(), rowData = bookingTbl.row(
                            $('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(), tradeId = $(
                            '#routeDetailGrid tbody td input[name="mainLeg"]:checked').parents('tr').find(
                            '.selectedRoute').attr('data-tradeid'), consLegId = rowData.consignmentLegId, iTrade = tradeId, iLoadPrt = rowData.loadPortCode, iDiscPrt = rowData.discPortCode, iCarType = $(
                            '#bookingCargoType').val(), iCarSt = $('#bookingCargoState').val(), iNewCargo = $(
                            '#subAttr').val(), iHeight = $('#freightedHeight').val(), iVolume = $(
                            '#freightedVolume').val(), iWeight = $('#freightedWeight').val(), iSourcePortCallID = rowData.loadPortCallVoyageId, data = {};
                       
                        var bookedMeasureUnit = $('#bookedMeasureUnit').val();
                        if(bookedMeasureUnit === "10"){
                        	
                        	iVolume = iVolume / (Math.pow(3.280839895013, 3));
                        	iVolume = iVolume.toFixed(3);
                        	
                        	iHeight = iHeight / 39.370078740157;
                        	iHeight = iHeight.toFixed(3);
                        	
                        	
                        	iWeight = iWeight / 2.204622621849;
                        	iWeight = iWeight.toFixed(3);
                        	
                        	
                        }

                            if (iNewCargo === 'Y') {
                                iNewCargo = 'Yes';
                            } else {
                                if (iNewCargo === 'N') {
                                    iNewCargo = 'No';
                                }
                            }
                            data = {
                                rate : 'R',
                                contract : iContract,
                                trade : iTrade,
                                origin : iOrgCode,
                                destination : iDestCode,
                                loadPort : iLoadPrt,
                                dischargePort : iDiscPrt,
                                cargoType : iCarType,
                                cargoState : iCarSt,
                                newOrUsed : iNewCargo,
                                height : iHeight,
                                volume : iVolume,
                                weight : iWeight,
                                sourcePortCallID : iSourcePortCallID,
                                consLegId : consLegId
                            };
                            applyRateCom(data, 'subBookRateList');
                        });
                $('#bookingRateList')
                    .submit(
                        function(e) {
                            var bookingTblRate = $('#bookingRateListGrid').DataTable(), rowDataRate = bookingTblRate
                                .row($('#bookingRateListGrid tbody td input[type="radio"]:checked').closest('tr'))
                                .data(), iContract, iOrgCode, iDestCode, bookingTbl, rowData, tradeId, consLegId, iTrade, iLoadPrt, iDiscPrt, iCarType, iCarSt, iNewCargo, iHeight, iVolume, iWeight, iSourcePortCallID, parentFlag = '', qckBookSubBook, qckBookApplyRate, chargeData = {}, chargestable;
                            e.preventDefault();
                            e.stopPropagation();
                            if (!rowDataRate) {
                                nsCore.showAlert('Please Select a Rate');
                                return;
                            }
                            else{
                                $("#bookingRateListLink").show();
                           }
                            if ($('#bookingRateListGrid').hasClass('subBookRateList')) {
                                parentFlag = 'subBook';
                                $('#bookingRateListGrid').removeClass('subBookRateList');
                            } else {
                                if ($('#bookingRateListGrid').hasClass('qkBookRateList')) {
                                    parentFlag = 'qckBook';
                                    $('#bookingRateListGrid').removeClass('qkBookRateList');
                                }
                            }
                            $(this).closest('.ui-dialog-content').dialog('close');
                            if (parentFlag && (parentFlag !== 'qckBook')) {
                                iContract = $('#mainContract').val();
                                iOrgCode = $('#mainBookDetailCustomerOrigin').val();
                                iDestCode = $('#mainBookDetailCustomerDestination').val();
                                bookingTbl = $('#routeDetailGrid').DataTable();
                                rowData = bookingTbl.row(
                                    $('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data();
                                tradeId = $('#routeDetailGrid tbody td input[name="mainLeg"]:checked').parents('tr')
                                    .find('.selectedRoute').attr('data-tradeid');
                                consLegId = rowData.consignmentLegId;
                                iTrade = tradeId;
                                iLoadPrt = rowData.loadPortCode;
                                iDiscPrt = rowData.discPortCode;
                                iCarType = $('#bookingCargoType').val();
                                iCarSt = $('#bookingCargoState').val();
                                iNewCargo = $('#subAttr').val();
                                iHeight = $('#freightedHeight').val();
                                iVolume = $('#freightedVolume').val();
                                iWeight = $('#freightedWeight').val();
                                iSourcePortCallID = rowData.loadPortCallVoyageId;
                                $('#mainBookingFreightBasis').val(nsBooking.findBasisCode(rowDataRate.basisType) || rowDataRate.basisType);
                                $('#mainBookingFreightCurrency').val(rowDataRate.currencyCode);
                                $('#mainBookingFreightBasis').trigger('change');
                                $('#mainBookingFreightRate').val( nsCore.roundingNumbersCharges(rowDataRate.rate, rowDataRate.currencyCode, ""));
                                $('#mainBookingFreightRate').trigger('change');
                                chargestable = $('#subBookingChargesGrid');
                            } else {
                                qckBookSubBook = $('#quickBookSubBookWrapDiv').find(
                                    '.subBookingCalculation.applyRateClicked');
                                qckBookApplyRate = qckBookSubBook.find('.freightApplyRate');
                                iContract = nsBooking.getContract();
                                iOrgCode = nsBooking.getOriginCode();
                                iDestCode = nsBooking.getDestinationCode();
                                iTrade = rowDataRate.tradeName;
                                iLoadPrt = nsBooking.getLoadPort();
                                iDiscPrt = nsBooking.getDischargePort();
                                iCarType = nsBooking.getCargoType(qckBookApplyRate);
                                iCarSt = nsBooking.getCargoState(qckBookApplyRate);
                                iNewCargo = nsBooking.getIsNewCargo(qckBookApplyRate);
                                iHeight = nsBooking.getHeight(qckBookApplyRate);
                                iVolume = nsBooking.getVolume(qckBookApplyRate);
                                iWeight = nsBooking.getWeight(qckBookApplyRate);
                                qckBookSubBook.find('#freightAreaBasis').val(
                                    nsBooking.findBasisCode(rowDataRate.basisType));
                                qckBookSubBook.find('#freightAreaBasis').trigger('change');
                                qckBookSubBook.find('#freightAreatRate').val(rowDataRate.rate);
                                qckBookSubBook.find('#freightAreatRate').trigger('change');
                                qckBookSubBook.find('#freightCurrencies').val(rowDataRate.currencyCode);
                                chargestable = qckBookSubBook.find('#quickBookChargesGrid');
                                qckBookSubBook.removeClass('applyRateClicked');
                            }
                            if (iNewCargo === 'Y') {
                                iNewCargo = 'Yes';
                            } else {
                                if (iNewCargo === 'N') {
                                    iNewCargo = 'No';
                                }
                            }
                            
                            var bookedMeasureUnit = $('#bookedMeasureUnit').val();
	                        if(bookedMeasureUnit === "10"){
	                        	iVolume = iVolume / (Math.pow(3.280839895013, 3));
	                        	iVolume = iVolume.toFixed(3);
	                        	
	                        	iHeight = iHeight / 39.370078740157;
                            	iHeight = iHeight.toFixed(3);
                            	
                            	iWeight = iWeight / 2.204622621849;
                            	iWeight = iWeight.toFixed(3);
	                        	
	                        }
                            
                            
                            chargeData = {
                                rate : 'C',
                                contract : iContract,
                                trade : iTrade,
                                origin : iOrgCode,
                                destination : iDestCode,
                                loadPort : iLoadPrt,
                                dischargePort : iDiscPrt,
                                cargoType : iCarType,
                                cargoState : iCarSt,
                                newOrUsed : iNewCargo,
                                height : iHeight,
                                volume : iVolume,
                                weight : iWeight,
                                sourcePortCallID : iSourcePortCallID,
                                consLegId : consLegId
                            };
                            vmsService
                                .vmsApiServiceType(
                                    function(response) {
                                        var chargeToRemove = '', tsChargeToRemove = '', countI = '';
                                        if (response) {
                                            if (response.responseData.length > 0
                                                && response.responseData[0].chargeTypeCode) {
                                                chargestable.find('tbody').show();
                                            }
                                            allChargeid = '';
                                            allChargeTimeSt = '';
                                            chargestable
                                                .find('tbody tr')
                                                .map(
                                                    function() {
                                                        var chargeTypeValue = unescape($(this).find('#chargeType')
                                                            .val()), prepaidValue = $(this).find('#chargePayment')
                                                            .val(), chargeBasisValue = $(this).find('.chargeBasis')
                                                            .val(), rateValue = $(this).find('#chargeRate').val(), curencyValue = $(
                                                            this).find('#chargeCurrency').val(), commentValue = $(this)
                                                            .find('#chargeComments').val(), inclGross = 'N', inclAllSubBook = 'N';
                                                        if (parentFlag === 'subBook') {
                                                            if (isNotValidCharge(chargeTypeValue, chargeBasisValue,
                                                                rateValue, commentValue, inclGross, inclAllSubBook,
                                                                curencyValue, nsBooking.defaultCurrencyCode,
                                                                prepaidValue)) {
                                                                $(this).remove();
                                                            }
                                                            chargeToRemove = $(this).find('.chargeId').val();
                                                            tsChargeToRemove = $(this).find('.chargesTimestamp').val();
                                                            subBookingIdDelete = $('.mainBookingListWrap ').find('.activeSubBook.thrdLevel').attr('data-subbookingid');
                                                            if (chargeToRemove) {
                                                                if (countI > 0) {
                                                                    allChargeid += ',' + chargeToRemove;
                                                                    allChargeTimeSt += ',' + tsChargeToRemove;
                                                                } else {
                                                                    allChargeid = chargeToRemove;
                                                                    allChargeTimeSt = tsChargeToRemove;
                                                                }
                                                                countI++;
                                                            }
                                                        }
                                                        $(this).remove();
                                                    });
                                            if(!nsBooking.allChargeid){
                                            	nsBooking.allChargeid = allChargeid;
                                            }
                                            if(!nsBooking.allChargeTimeSt){
                                            	nsBooking.allChargeTimeSt = allChargeTimeSt;
                                            }
                                            nsBooking.subBookingIdDelete = subBookingIdDelete;
                                            if (response.responseData.length > 0
                                                && response.responseData[0].chargeTypeCode) {
                                                $.each(response.responseData,
                                                    function(i, obj) {
                                                        var strTag = nsBookDoc.createStrTag();
                                                        if (parentFlag === 'subBook') {
                                                            chargestable.find('tbody').append(strTag);
                                                        } else {
                                                            qckBookSubBook.find('#addNewChargeQuick').trigger('click');
                                                        }
                                                        chargestable.find('tr:last-child #chargeType').val(
                                                            obj.chargeTypeCode);
                                                        chargestable.find('tr:last-child .chargeBasis').val(
                                                            obj.basisCode);
                                                        chargestable.find('tr:last-child #chargeCurrency').val(
                                                            obj.currencyCode);
                                                        chargestable.find('tr:last-child #chargeRate').val(obj.rate);
                                                        chargestable.find('tr:last-child .chargeBasis').trigger(
                                                            'change');
                                                        chargestable.find('tr:last-child #chargeComments').val(
                                                            obj.comment);
                                                        if (obj.includeInGrossFreight === 'Y') {
                                                        	chargestable.find($('.chargeGrossFreight')[i]).prop('checked', true);
                                                        }
                                                        chargestable.find('tr:last-child .chargesTimestamp').val(
                                                            obj.timeStamp);
                                                    });
                                            }
                                        } else {
                                            nsCore.showAlert(nsBooking.errorMsg);
                                        }
                                    }, nsBooking.bookingRateCharges, 'POST', JSON.stringify(chargeData));
                        });
                /* Apply rate popup code ends here */
                // booking vessel click functionality
                $('#leftSearchMenu').on('click', '#getVesselData', function(e) {
                    var vesselCode = $('#vesselCode').val();
                    e.preventDefault();
                    if (vesselCode) {
                        vmsService.vmsApiServiceLoad(function(response) {
                            if (response) {
                                if (response.responseDescription === 'Success') {
                                    $('#bookingVesselPopup').dialog({
                                        modal : true,
                                        resizable : false,
                                        position : {
                                            my : "top",
                                            at : "top",
                                            of : "body"
                                        },
                                        draggable : false,
                                        width : '85%',
                                        close : function() {
                                            nsBooking.isMainVoyage = false;
                                            $('#bookingVesselListGrid').dataTable().api().destroy();
                                        },
                                        open : function() {
                                            nsBooking.isMainVoyage = true;
                                            if ($.fn.DataTable.fnIsDataTable($('#bookingVesselListGrid'))) {
                                                $('#bookingVesselListGrid').dataTable().api().columns.adjust();
                                            }
                                        }
                                    });
                                    if ($.fn.DataTable.fnIsDataTable($('#bookingVesselListGrid'))) {
                                        $('#bookingVesselListGrid').dataTable().api().destroy();
                                    }
                                    nsBooking.createBookingTbl(response);
                                }
                            } else {
                                nsCore.showAlert(nsBooking.errorMsg);
                            }
                        }, nsBooking.bookingAllocation + vesselCode, 'POST', null);
                    } else {
                        nsCore.showAlert('Vessel should not be empty');
                    }
                });
                // submit Voyage Selection functions
                $('#bookingVesselList').submit(
                    function(e) {
                        var rowData = $('#bookingVesselListGrid').dataTable().api().row(
                            $('#bookingVesselListGrid tbody td input[type="radio"]:checked').closest('tr')).data();
                        e.preventDefault();
                        if (!rowData) {
                            nsCore.showAlert('Please Select a Voyage');
                            return;
                        }
                        if (nsBooking.isMainVoyage) {
                            $('#voyage').val(rowData.voyageNo);
                        } else {
                            $('#massVoyageName').val(rowData.voyageNo);
                            if ($('#loadPort').val() || $('#originPort').val()) {
                                $('#massSailingDate').val(rowData.startDate);
                            }
                        }
                        $(this).closest('.ui-dialog-content').dialog('close');
                    });
                /* Enable the email confirmation functionality */
                $(document).on('click', '#emailPdf', function() {
                    var bookingId = $('#emailBookId').val(), emailAddr = '', i = 0,custlength=0;
                    $('#emailID').val('');
                    $('#content').val('');
                    $('#ccID').val('');
                    $('#bccID').val('');
                    vmsService.vmsApiService(function(response) {
                        if (response.responseData) {
                         custlength =  response.responseData.custEmailList? response.responseData.custEmailList.length:0;
                         if(custlength===1){
                        	 emailAddr =response.responseData.custEmailList[0];
                        	}
                         else if(custlength>1){                        		
                            for (i = 0; i < response.responseData.custEmailList.length; i++) {
                                if (response.responseData.custEmailList[i]) {
                                    emailAddr = emailAddr + response.responseData.custEmailList[i] + ';';
                                }
                            }                            
                         }                         
                         if(emailAddr) {
                        	 $('#emailID').val(emailAddr.replace(/;$/,""));
                         }
                         else{
                        	 $('#emailID').val(emailAddr);
                         }                        	 
                        }else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.BookingCustEmail + bookingId, 'GET', null);
                    $('#bookingEmailDetailsPopup').dialog({
                        modal : true,
                        resizable : false,
                        draggable : false,
                        width : '85%',
                        close : function() {
                            $('#bookingConfFrame').show();
                        },
                        open : function() {
                            $('#bookingConfFrame').hide();
                            $('.ui-dialog-titlebar').remove();
                            $('#ui-dialog-title-dialog').hide();
                            $('.ui-dialog-titlebar').removeClass('ui-widget-header');
                        }
                    });
                });
                $('#confirmSend, #fsbSaveBtn').click(sendConfirmationMail);
            });
    popupObj = {
        'subBookingIdDelete' : subBookingIdDelete,
        'isMainVoyage' : subBookingIdDelete,
        'applyRateCom' : applyRateCom
    };
    $.extend(true, nsBooking, popupObj);
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);
