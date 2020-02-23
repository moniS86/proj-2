/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsDoc, nsBookDoc) {
    var docLink = false, comFunctions = {};
    if ((window.location.href).indexOf('/documentation/') > 0) {
        docLink = true;
    }
    if (!nsBooking) {
        nsBooking = nsDoc
    }
    function detectConsStatusType(num, isPrinted) {
        var temp = nsCore.compareWithDef(num, {
            '10' : 'Booking Created',
            '20' : 'Created',
            '21' : 'Retracted',
            '31' : 'Retracted Manifested',
            '50' : 'Manifested',
            '51' : 'Manifested Corrected',
            '75' : 'Unlocked',
            '99' : 'Unlocked'
        }, '');
        if (num === '30') {
            return (isPrinted === 'Y' ? 'Printed' : 'Issued');
        }
        if (temp !== '') {
            return temp;
        }
    }
    // function for generating Currency,chargebasis,Charge type
    function generateSelect(options, selected, onlyOptions) {
        var dropDownText = '';
        if (!onlyOptions) {
            dropDownText += '<div class="formInputWrap"><select> ';
        }
        dropDownText += '<option value="" >-- Select --</option>';
        $.each(options,
            function(i, obj) {
                var optionValue = obj.split(','), isSelected = optionValue[0] === selected ? ' selected ' : '';
                dropDownText += '<option value="' + optionValue[0] + '" ' + isSelected + '>' + optionValue[1]
                    + '</option>';
            });
        if (!onlyOptions) {
            dropDownText += '</select></div>';
        }
        return dropDownText;
    }
    function createStrTag() {
        var strTag = '<tr role="row" class="'
            + ($('#subBookingChargesGrid tr:last-child').hasClass('odd') ? 'even' : 'odd') + '">';
        strTag += '<td><select name="chargeType" id="chargeType" class="chargeType">'
            + nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true) + '</td>';
        strTag += '<td><select name="chargeBasis" id="chargeBasis' + ($('#subBookingChargesGrid tr').length - 1)
            + '" class="chargeBasis">' + nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true) + '</td>';
        strTag += '<td><select name="chargecurrency" id="chargeCurrency" class="chargeCurrency">'
            + nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, nsBooking.defaultCurrencyCode, true)
            + '</select></td>';
        strTag += '<td> <input type="text" maxlength="15" class="chargeRate numericField" id="chargeRate" '
            + 'value="">'
            + '</td><td> <input type="text" class="chargeQuantity '
            + 'numericField" id="chargeQuantity" value="" disabled="">'
            + '</td><td> <input type="text" class="chargeTotal numericField" id="chargeTotal" value="" disabled=""></td>';
        strTag += '<td><select name="chargePayment" id="chargePayment"'
            + ' class="chargePayment"><option value="P">Prepaid</option>'
            + '<option value="C">Collect</option></select></td><td> <input type="checkbox" '
            + 'class="chargeGrossFreight" id="chargeGrossFreight" value="">'
            + '</td><td> <input type="checkbox" class="chargeSubBookings" id="chargeSubBookings" value=""></td><td>'
            + '<input type="text" class="chargeComments w125 clippedTitle" maxlength="80" id="chargeComments" value=""></td><td class="icons"><span class="icons_sprite fa fa-comment-o commentsIcon"></span>'
            + ' <input type="hidden" class="chargeId" value=""></td><td class="icons">'
            + '<span class="icons_sprite fa fa-remove rowRemoveIcon"></span></td>';
        strTag += '</tr>';
        return strTag;
    }
    function searchParamsMatch(bookingNumber, action, item) {
        var diffSearchParamMsg = ((item && item === 'bol') ? 'Bill of Lading ' : 'Booking ') + action + ' successfully! Please note down the '
        + ((item && item === 'bol') ? 'bol number ' : 'booking no ') + bookingNumber
        + ' since this '+((item && item === 'bol') ? 'Bill of Lading ' : 'booking ')+'parameters are different from searched for';
        
        $('#bookingAlertMessage').dialog(
            {
                resizable : false,
                modal : true,
                autoOpen : false,
                draggable : false,
                width : 400,
                closeOnEscape : false,
                close : function() {
                    if (nsDoc && nsDoc.newBlObj.isNotSearchCriteria) {
                        nsDoc.newBlObj.isNotSearchCriteria = false;
                    }
                },
                open : function() {
                    var titleText = '';
                    $('#bookingAlertMessage #alertMsg').text(diffSearchParamMsg);
                    $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
                    $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass(
                        'fa fa-remove noBgBor').removeClass('ui-corner-all ui-widget');
                    titleText = $('#bookingAlertMessage').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
                    titleText = '<i class="fa fa-warning"></i>' + titleText;
                    $('#bookingAlertMessage').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
                    $('.ui-dialog-buttonset button:first-child').addClass('linkButton');
                    $('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                },
                buttons : [
                    {
                        text : 'OK',
                        click : function() {
                            $(this).dialog('close');
                            if (docLink && nsDoc.currentActiveBolId) {
                                $('.scndLevel[data-bolid = "' + nsDoc.currentActiveBolId + '"]').find('.expandBooking')
                                    .removeClass('fa-minus').addClass('fa-plus')
                                $('.scndLevel[data-bolid = "' + nsDoc.currentActiveBolId + '"]').trigger('click');
                                nsDoc.currentActiveBolId = false;
                            }
                        }
                    }
                ]
            }).dialog('open');
    }
    function daSeVal(response, bookingId, functionName, bookingNumber) {
        var isSearchChanged = false, searchBookingNo = $('#bookingNumber').val().trim(), bookingNoQuery = $(
            '#bookingNoSearch').val().trim();
        searchBookingNo = searchBookingNo.toUpperCase();
        // Validation for Booking number
        if (bookingNoQuery === 'Need Exact match' && !!searchBookingNo && searchBookingNo !== bookingNumber) {
            isSearchChanged = true;
        }
        if ((bookingNoQuery === 'Begins with') && (bookingNumber.substr(0, searchBookingNo.length) !== searchBookingNo)) {
            isSearchChanged = true;
        }
        return daSeVal1(bookingNumber, isSearchChanged, searchBookingNo, bookingNoQuery);
    }
    function daSeVal1(bookingNumber, isSearchChanged, searchBookingNo, bookingNoQuery) {
        if ((bookingNoQuery === 'Contains') && (bookingNumber.indexOf(searchBookingNo) === -1)) {
            isSearchChanged = true;
        }
        if ((bookingNoQuery === 'Ends with')
            && ((bookingNumber.substr(bookingNumber.lastIndexOf(searchBookingNo))) !== searchBookingNo)) {
            isSearchChanged = true;
        }
        return isSearchChanged;
    }
    function dataValid(response, bookingId, functionName, bookingNumber) {
        var isSearchChanged = daSeVal(response, bookingId, functionName, bookingNumber), searchBlStatus = $('#blStatus')
            .val().trim(), searchVesselCode = $('#vesselCode').val().trim(), searchVoyage = $('#voyage').val().trim(), blStatusDesc = '', currVessel = '', currVoyNo = '',

        routeArray = [];
        $('#routeDetailGrid tbody tr').each(function(i, v) {
            if ($(this).find('td:nth-child(2) span').html()) {
                var a = $(this).find('td:nth-child(2) span').html().split('&nbsp;');
                routeArray.push(a);
            }
        })
        // VMSAG-4853
        /*
         * if(vesselVoy){ vesselVoy = vesselVoy.split('&nbsp;'); }
         */
        if (!isSearchChanged && !!response.subBookingModelList) {
            $.each(response.subBookingModelList, function(i, obj) {
                if (obj.billOfLadingModel) {
                    blStatusDesc = obj.billOfLadingModel.bolStatus;
                }
                if (!!searchBlStatus && searchBlStatus !== blStatusDesc) {
                    isSearchChanged = true;
                }
            });
        }
        // Validation for Vessel Code and Voyage No.
        if (!isSearchChanged) {
            // VMSAG-4853
            /*
             * currVessel = vesselVoy[0]; currVoyNo =
             * vesselVoy[vesselVoy.length-1];
             */
            $(routeArray).each(function(i, v) {
                if ($(this)[0] === searchVesselCode) {
                    currVessel = searchVesselCode;
                    currVoyNo = $(this)[$(this).length - 1];
                }
            });
            if (searchVesselCode && searchVoyage) {
                if ((searchVesselCode === currVessel) &&  (searchVoyage === currVoyNo)) {
                    isSearchChanged = false;
                    return false;
                } else {
                    isSearchChanged = true;
                }
            } else if (searchVesselCode) {
                if (searchVesselCode === currVessel) {
                    isSearchChanged = false;
                    return false;
                } else {
                    isSearchChanged = true;
                }
            } else {
                if (searchVesselCode !== currVessel) {
                    isSearchChanged = true;
                }
                if (searchVoyage !== currVoyNo) {
                    isSearchChanged = true;
                }
            }
        }
        return isSearchChanged;
    }
    
    function rmvLeg(url){
    	$('.preloaderWrapper').show();
    	if(!nsDoc){
			vmsService.vmsApiService(function(obj) {		
				removeCall(obj);           
	        }, url, 'POST', null);
    	}
    	else {
			vmsService.vmsApiServiceTypeDataLoad(function(obj) {		
				removeCall(obj);	           
	        }, url, 'POST', null);
    	}		
	}    
    function removeCall(obj){
		if (obj) {            	 
        	if(docLink && nsDoc.isCallFromDeleteLeg){
        		nsDoc.isCallFromDeleteLeg = false;
        		nsDoc.deleteLegUrl = '';
        		nsDoc.newBlObj.makeBlSubmit();
        	} else {
        		successRefresh(obj);
        	}
        	$('.preloaderWrapper').hide();
        } else {
        	 $('.preloaderWrapper').hide();
            nsCore.showAlert(nsBooking.errorMsg);
        }
	}
    function updateDelFunc(url, delFlag, errMsge, docCurrentVoyage, docCurrentVessel, docDelCondCheck, preLoadId, currentDiscId) {
        var consLegAllocCheck = [];
    	if (errMsge) {
            nsCore.showAlert(errMsge)
        } else if(docLink && docDelCondCheck){
        	        	//conslegs has to be sent.
			consLegAllocCheck.push({ 
				consignmentId : $('.activeNavigationItem').attr('data-subbookingid'),
				loadPortCallVoyageId : preLoadId,
				discPortCallVoyageId : currentDiscId
			});
			nsDoc.isCallFromDeleteLeg = true;
			nsDoc.deleteLegUrl = url;
			nsDoc.newBlObj.renderPopup(docCurrentVessel,docCurrentVoyage,'removeMainLeg', '' , consLegAllocCheck);
          return false;
        } else {
        	rmvLeg(url)
        }
    }
    function converToUpperDecimalOnFive(data, precision){ 
    	if(data && data>0){    	   
    		return Number((+(Math.round(+(data + 'e' + precision)) + 'e' + -precision)).toFixed(precision));
        }else{
        	return data;
        }
    }
    
    function successRefresh(obj) {
        if (docLink) {
            if (obj === '4') {
                if (!nsDoc.isAtBlLevel()) {
                    nsDoc.activeSubbooking();
                } else {
                    nsDoc.activeBooking();
                }
                if (nsDoc.newBlObj.isNotSearchCriteria) {
                    nsDoc.newBlObj.renderNotSearchCriteriaPopup();
                    $('.mainBookingDetailsWrap,.mainSubBookingListWrap,.mainSubBookingFormWrap').hide();
                    $('.mainBookingListWrap .subBookContentListCol .singleColItem.ui-selecting').remove();
                }
            }
            if (obj === '1260'){
				nsCore.showAlert("Cannot issue B/L because there exists issued manifest with cargo not loaded");
			}
        } else {
            if (obj === '4') {
                $('.activeNavigationItem').trigger('click');
            }
        }
    }
    $(document)
        .ready(
            function() {
                nsCore
                    .onlyNumbers('#quickFreightDimensionsGrid input[type="text"], #mainBookingDimensionsGrid input[type="text"]');
                $('#bookingCargoMake, #bookingCargoModel').keyup(function() {
                    nsBooking.modelTypeChange();
                });
                $(
                    '#totalBookedUnits, #subAttr, #bookingCargoType, #bookingCargoState, #mainBookDetailCustomerOrigin, #mainBookDetailCustomerOriginDesc, #mainBookDetailCustomerDestination, #mainBookDetailCustomerDestinationDesc')
                    .change(function() {
                        nsBooking.enabOrDisaRate(this);
                    });
                // $('#totalBookedUnits').change(function(){
                $(document).on('keyup', '#totalBookedUnits', function() {
                    nsBooking.updateChargeOnDimChange(this);
                    nsBooking.calculateFreightTotal();
                    nsBooking.enabOrDisaRate(this);
                });
                $('#bookingCargoText').blur(function() {
                    nsBooking.populateCargoDesc(this);
                });
                $('#subBlen, #subBWid').change(function() {
                    nsBooking.bookingArea(this);
                    nsBooking.bookingVolume(this);
                    nsBooking.bookenableDisableDims(this);
                    nsBooking.enabOrDisaRate(this);
                    nsBooking.bookWeight(this);
                    nsBooking.copyToFre(this);
                });
                $('#subBHei').change(function() {
                    nsBooking.isMoreThanMaxHeight(this);
                    nsBooking.bookingVolume(this);
                    nsBooking.bookenableDisableDims(this);
                    nsBooking.enabOrDisaRate(this);
                    nsBooking.bookWeight(this);
                    nsBooking.copyToFre(this);
                });
                $('#subBWei').change(function() {
                    nsBooking.isMoreThanMaxWeight(this);
                    nsBooking.enabOrDisaRate(this);
                    nsBooking.bookenableDisableDims(this);
                    nsBooking.copyToFre(this);
                });
                $('#bookedArea, #subBVol').change(function() {
                    nsBooking.enabOrDisaRate(this);
                    nsBooking.bookWeight(this);
                    nsBooking.bookenableDisableDims(this);
                    nsBooking.copyToFre(this);
                });
                $('#bookedUnit #shipInfovalidStatus').change(function() {
                    nsBooking.bookperUnitSelected(this);
                    nsBooking.enabOrDisaRate(this);
                    nsBooking.copyToFre(this);
                });
                $('#bookedUnit #shipInfoHistStatus').change(function() {
                    nsBooking.booktotalSelected(this);
                    nsBooking.enabOrDisaRate(this);
                    nsBooking.copyToFre(this);
                });
                $('#bookedMeasureUnit').change(function() {
                    nsBooking.convertBkgArea(this);
                    nsBooking.convertBkgVolume(this);
                    nsBooking.copyToFre(this);
                    nsBooking.isMoreThanMaxHeight($('#subBHei'));
                    nsBooking.isMoreThanMaxWeight($('#subBWei'));
                });
                $('#actualLength, #actualWidth').change(function() {
                    nsBooking.actualAreaCalc();
                    nsBooking.actualVolumeCalc();
                    nsBooking.convertFloat(this);
                });
                $('#actualHeigth').change(function() {
                    nsBooking.actualVolumeCalc();
                    nsBooking.convertFloat(this);
                });
                $('#copytpFrightLink').click(function() {
                    if ($(this).hasClass('disabledEditIcon')) {
                        return false;
                    }
                    nsBooking.copyToFreighted();
                });
                $('#actualMeasureUnit').change(function() {
                    nsBooking.actualAreaCalc();
                    nsBooking.actualVolumeCalc();
                });
                $('#freightedLength').change(function() {
                    nsBooking.freightArea(this);
                    nsBooking.freightVolume(this);
                    nsBooking.calculateFreightTotal();
                    nsBooking.frenableDisableDims(this);
                    nsBooking.updateChargeOnDimChange();
                    nsBooking.freightWeight(this);
                });
                $('#freightedWidth').change(function() {
                    nsBooking.freightArea(this);
                    nsBooking.freightVolume(this);
                    nsBooking.calculateFreightTotal();
                    nsBooking.frenableDisableDims(this);
                    nsBooking.updateChargeOnDimChange();
                    nsBooking.freightWeight(this);
                });
                $('#freightedHeight').change(function() {
                    nsBooking.freightVolume(this);
                    nsBooking.calculateFreightTotal();
                    nsBooking.frenableDisableDims(this);
                    nsBooking.updateChargeOnDimChange();
                    nsBooking.freightWeight(this);
                });
                $('#freightedWeight').change(function() {
                	nsBooking.calculateFreightTotal();
                    nsBooking.updateChargeOnDimChange();                    
                    nsBooking.frenableDisableDims(this);
                });
                $('#freightedArea').change(function() {
                    nsBooking.freightWeight(this);
                    nsBooking.frenableDisableDims(this);
                    nsBooking.updateChargeOnDimChange();
                });
                $('#freightedVolume').change(function() {
                    nsBooking.updateChargeOnDimChange();
                    nsBooking.freightWeight(this);
                    nsBooking.frenableDisableDims(this);
                });
                $('#freightedUnit #shipInfovalidStatus').change(function() {
                    nsBooking.frperUnitSelected(this);
                    nsBooking.enabOrDisaRate(this);
                });
                $('#freightedUnit #shipInfoHistStatus').change(function() {
                    nsBooking.frtotalSelected(this);
                    nsBooking.enabOrDisaRate(this);
                });
                $('#freightedMeasureUnit').change(function() {
                    nsBooking.convertFrArea(this);
                    nsBooking.convertFrVolume(this);
                    nsBooking.calculateFreightTotal();
                    nsBooking.updateChargeOnDimChange();
                });
                $('#mainSubBookingFormSave').click(function() {
                    nsBooking.bookingAndSubBookingCreation(this);
                });
                $('#prevVoyagesMain').click(function() {
                    nsBooking.getPossVoyages();
                });
                $(document).on('click', '.fVoyageSel', function() {
                    nsBooking.rteChanged(this);
                });
                $(document).on('change', '.chargeBasis, .chargeRate', function() {
                    nsBookDoc.updateSubBookingQuantity(this);
                });
                $('#freshBookSaveBtn').click(function() {
                    nsBooking.mainFreshBookSubmit();
                });
                $('#makeBLBookingButton').click(function() {
                    nsCore.makeBLRedirect(nsBooking, 'bookTopMenu');
                });
                $(document).on('change', 'select.dimensions', function() {
                    nsBookDoc.dimensionTableUnits($('#mainBookingDimensionsGrid tbody tr'));
                });
                $('#docTxtHdr').css('display', 'none');
                $('#docText').css('display', 'none');
                $(document).on('change', '#billType', function() {
                    var billDetLen = nsBooking.bolTypes.length, k = 0, sBill = [];
                    for (k = 0; k < billDetLen; k++) {
                        sBill = nsBooking.bolTypes[k].split('-');
                        if ($(this).val() === sBill[0]) {
                            $('#billCopy').val(sBill[1]);
                            $('#billOriginals').val(sBill[2]);
                            break;
                        }
                    }
                    if($(this).val() === '20'){
                    	$('#billOriginals').val('0').attr('readonly', true);
                    } else {
                    	$('#billOriginals').removeAttr('readonly');
                    }
                });
                $(document)
                    .on(
                        'click',
                        '#routeDetailGrid .removeLeg',
                        function() {
                            var url, possUrl, currVessVoy, delFlag = true, chargesBookingId = '', docDelCondCheck = false, delCondCheck = false, isPreLegMain = false, prevIndex = 0, sameVessVoycheck = '&isSameVessVoyage='
                                + 'N', errMsg = '', consignTimeStamp = '', consignLegId = '', DocOrBook, bookingIdVal, prevFirm = false,
                                docCurrentVessel ='', docCurrentVoyage= '', preLoadId = '', currentDiscId = '';
                            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                                nsBooking.globalBookingFlag.isDynamicEle = true;
                                nsBooking.globalBookingFlag.dynamicEleType = 'routeDetailGrid';
                                nsBooking.globalBookingFlag.dynamicEleRowNum = $(this).closest('tr').index();
                                nsBooking.globalBookingFlag.dynamicEleClass = 'removeLeg';
                                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                                return false;
                            }
                            $('#isBooking').val($(this).attr('data-isBooking'));
                            if (docLink) {
                            	nsDoc.isCallFromDeleteLeg = false;
                                url = nsDoc.consignmentLegId;
                                possUrl = nsDoc.orginPort;
                                if ($('.mainLeg').length > 0) {
                                    prevIndex = $(this).closest('tr').index() - 1;
                                }
                                isPreLegMain = $($('.mainLeg')[prevIndex]).is(':checked');
                                delCondCheck = ($(this).attr('data-isPreLoaded') === 'Y' || isPreLegMain);
                                docDelCondCheck = ($(this).attr('data-consType') === 'M')&& ($(this).attr('data-preVesselvoyage') !== $(this).attr('data-vesselVoyage')) ;
                                prevFirm = ($(this).attr('data-consType') === 'M' && ($(this).attr('data-preAllocStatus') === 'N'));
                                docCurrentVessel =  ($(this).attr('data-preVesselvoyage') || '').split('/')[0] || '';
                                docCurrentVoyage =  ($(this).attr('data-preVesselvoyage') || '').split('/')[1] || '';
                                preLoadId = $(this).attr('data-preLoadPortCallVoyageId');
                                currentDiscId = $(this).attr('data-discPortCallVoyageId');
                            } else {
                                url = nsBooking.removeLeg;
                                possUrl = nsBooking.orginPort;
                                delCondCheck = ($(this).attr('data-isPreLoaded') === 'Y');
                            }
                            if (nsCore.appModel.selected === 'booking') {
                                consignTimeStamp = nsBooking.fectSubBookingObj.subBookingModelList[0].timeStamp;
                                bookingIdVal = $('#bookingHeaderId').val();
                                DocOrBook = "N";
                            } else if (nsCore.appModel.selected === 'bl') {
                                consignLegId = $(this).attr('data-consignmentId');
                                bookingIdVal = nsCore.appModel.viewbolDetails.billOfLadingModel.bolId;
                                DocOrBook = "Y";
                                $.each(nsCore.appModel.viewbolDetails.consignmentList, function(ind, consgLeg) {
                                    if (consgLeg.consId === consignLegId) {
                                        consignTimeStamp = consgLeg.timeStamp;
                                    }
                                })
                            } else { 
                            	bookingIdVal = $('#bookingHeaderId').val();
                            	if(nsDoc){	                                 
	                                DocOrBook = "Y";
                            	}
                            	else {
                            		DocOrBook = "N";                            		
                            	}
                                consignTimeStamp = nsBooking.subBookingObj.timeStamp
                            }
                            url = url + $(this).attr('data-id') + '&subbookingId=' + $(this).attr('data-consignmentId')
                                + '&consType=' + $(this).attr('data-constype') + '&isBooking=' + $('#isBooking').val()
                                + '&bookingId=' + bookingIdVal + '&loadPort=' + $(this).attr('data-loadPort')
                                + '&discPort=' + $(this).attr('data-discPort') + '&timestamp='
                                + $(this).attr('data-timestamp') + '&consTimeStamp=' + consignTimeStamp
                                + '&documentation=' + DocOrBook;
                            chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find(
                                '.ui-selecting').attr('data-bookingid');
                            currVessVoy = $(this).attr('data-prevesselvoyage');
                            possUrl = possUrl
                                + $(this).attr('data-preLoadPortCallId')
                                + '&destinationPort='
                                + $(this).attr('data-discport')
                                + '&consType=O&&loadPortCallVoyageId='
                                + ''
                                + '&discPortCallVoyageId='
                                + ''
                                + '&showPreviousVoyage='
                                + 'Y'
                                + '&compId='
                                + ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
                                + '&possibleVoyageClicked='
                                + 'Y'
                                + '&bookID='
                                + chargesBookingId
                                + '&dateFormat='
                                + nsCore.dateFormat
                                + '&timeFormat='
                                + nsCore.timeFormat
                                + '&consTimeStamp='
                                + (nsCore.appModel.selected === 'booking' ? nsBooking.fectSubBookingObj.subBookingModelList[0].timeStamp
                                    : nsBooking.subBookingObj.timeStamp);
                            $('.preloaderWrapper').show();
                            vmsService
                                .vmsApiService(
                                    function(response) {
                                    	$('.preloaderWrapper').hide();
                                        if (response) {
                                            $.each(response.preCarriageVoyageModelList, function(i, v) {
                                                if (v.vesselVoyagePre !== currVessVoy) {
                                                    delFlag = false;
                                                } else {
                                                    delFlag = true;
                                                    sameVessVoycheck = '&isSameVessVoyage=' + 'Y';
                                                    return false;
                                                }
                                            });
                                            if (!delFlag) {
                                                if (delCondCheck) {
                                                    errMsg = 'New discharge port is not served by existing vessel voyage. Please select another one!';
                                                } else {
                                                    errMsg = '';
                                                }
                                                if (docDelCondCheck && !errMsg) {
                                                    errMsg = 'Vessel voyage should not be empty for main leg';
                                                }
                                            }
                                            if(prevFirm && !errMsg){
                                            	errMsg = 'Main leg cannot be saved as reserve';
                                            }
                                            url = url + sameVessVoycheck;
                                            updateDelFunc(url, delFlag, errMsg, docCurrentVoyage, docCurrentVessel, docDelCondCheck, preLoadId, currentDiscId);
                                        } else {
                                            nsCore.showAlert(nsBooking.errorMsg);
                                        }
                                    }, possUrl, 'POST', null);
                            // } else {
                            // url = url + sameVessVoycheck;
                            // updateDelFunc(url, delFlag, errMsg);
                            // }
                        });
            });
    function setForDirtyPopup() {
        nsBooking.globalBookingFlag.mainBookingFlag = true;
        nsBooking.globalBookingFlag.mainBookingHeaderFlag = true;
        if (nsBooking.globalBookingFlag.currentEditLevel === 'subBooking') {
            nsBooking.globalBookingFlag.fnGoForward = nsBooking.bookingAndSubBookingCreation;
            nsBooking.globalBookingFlag.fnGoBackWard = nsBooking.fnSubBookingBackward;
        } else {
            nsBooking.globalBookingFlag.fnGoForward = nsBooking.mainFreshBookSubmit;
            nsBooking.globalBookingFlag.fnGoBackWard = nsBooking.fnBookingDetailsBackward;
        }
    }
    comFunctions = {
        'createStrTag' : createStrTag,
        'generateSelect' : generateSelect,
        'dataValid' : dataValid,
        'searchParamsMatch' : searchParamsMatch,
        'rmvLeg': rmvLeg,
        'detectConsStatusType' : detectConsStatusType,
        'setForDirtyPopup' : setForDirtyPopup,
        'converToUpperDecimalOnFive':converToUpperDecimalOnFive
    };
    $.extend(true, nsBookDoc, comFunctions);
})(this.booking, jQuery, this.vmsService, this.core, this.doc, this.bookDoc);
