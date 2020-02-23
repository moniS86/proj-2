/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc, nsDoc) {
    var sbObj = {};
    if (!nsBooking) {
        nsBooking = nsDoc
    }
    // adding new copy of the subbooking
    function fnCreateNewBooking(bookingId, bookingNumber, selector) {
        var html = '';
        html += '<div data-bookingid="' + bookingId + '" data-filtering="' + bookingNumber
            + '" class="billVin singleColItem activeSubBook ui-selecting">' + bookingNumber;
        html += '<div class="mainBookingItemIcons">';
        html += '<span class="icons_sprite bookingInlineMenu roundDownArrowIcon fa fa-caret-down"></span>';
        html += '<span id="bookingRemoveIcon" name="bookingRemoveIcon" class="icons_sprite rowRemoveIcon '
            + 'bookingRemoveIcon fa fa-remove"></span>';
        html += '</div>';
        html += '</div>';
        $(selector).replaceWith(html);
    }
    function loadSubBookContentHelper(input) {
        vmsService
            .vmsApiServiceTypeLoad(
                function(result) {
                    var output = '', cargoTextVal = 'New Sub Booking', subBookCount = '', lengthNo = 0, originalLen = '', appe = '', subTitle = '', newTag = '', k = 0, iconNoVin = '';
                    if (result) {
                        output = result.statusMsg;
                        nsBooking.subBookingObj = result;
                        nsBooking.mainBookingFlag.changedOriginDest = false;
                        if (output === 'true') {
                            if (result.cargoText) {
                                cargoTextVal = result.cargoText;
                            }
                            subBookCount = parseInt($('.mainSubBookingCount').text()) + 1;
                            $('.mainSubBookingCount').text(subBookCount);
                            originalLen = 4;
                            lengthNo = originalLen - result.subBookingNo.length;
                            for (k = 0; k < lengthNo; k++) {
                                appe += '0';
                            }
                            subTitle = appe + result.subBookingNo + ' - ' + result.bookedUnits + ' - ' + cargoTextVal;
                            $('.mainBookingListWrap .subBookContentListCol .newBookLabel.treeListLabel').remove();
                            $('#mainSubBookingHeader').val(subTitle);
                            $('.mainSubBookFormTitle').text(subTitle).attr('data-subbookingtitle', subTitle);
                            iconNoVin = '<i class="fa fa-plus expandSubBooking"></i>'
                            newTag = '<div data-subbookingid="'
                                + result.subBookingId
                                + '" data-bookingId="'
                                + nsBooking.selectedEntity.selectedBookingMenuItem
                                + '"data-timestamp="0" data-consLegTimeStamp="0 " data-consignmentLegId="0" data-filtering="'
                                + subTitle
                                + '" data-bolStatus="'
                                + result.bolStatus
                                + '" class="cargoVin billVin singleColItem thrdLevel activeSubBook clippedTitle">'
                                + iconNoVin
                                + '<i class="fa  statusIcon" style="color:#000000;"></i><span><a href="javascript:void(0)">'
                                + subTitle
                                + '</a></span><div class="mainBookingItemIcons"><span class="icons_sprite subBookingInlineMenu roundDownArrowIcon fa fa-caret-down">'
                                + '</span></div></div>';
                            $.each($('.mainBookingListWrap .subBookContentListCol .scndLevel'), function() {
                                // VMSAG-4420
                                if ($(this).find('a').text() === (!nsDoc ? nsBooking.bookingnoVariable
                                    : nsCore.appModel.viewbolDetails)) {
                                    nsBookDoc.insertNewAtSubBookingLevel(newTag);
                                }
                            });
                            $('.routeDetailsWrapper').show();
                            $('.possibleVoyageWrap, .possibleVoyageNewWrap').hide();
                            nsBooking.resetFlagSubBookingLevel();
                            nsBooking.loadSubbookingContent(result);
                            nsBooking.bookingnoVariable = "";
                            $('.thrdLevel[data-subbookingid=' + result.subBookingId + ']').trigger('click');
                        } else {
                            nsCore.showAlert(result.responseDescription);
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.addSubBooking, 'POST', JSON.stringify(input));
    }
    function vmsSubBookHelper(input, cBookingID, bookingNumber) {
        vmsService.vmsApiServiceTypeLoad(function(result) {
            var output = '';
            if (result) {
                output = result.statusMsg;
                if (output !== 'false') {
                    nsCore.showAlert('New Booking and Sub booking is created');
                    fnCreateNewBooking(cBookingID, bookingNumber, '.newCopyBooking');
                } else {
                    nsCore.showAlert(result.responseDescription);
                }
                nsBooking.copyBookingBOL.id = result.bolId;
                vmsService.vmsApiServiceType(function(response) {
                    if (response) {// do nothing
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.updateBill, 'POST', JSON.stringify(nsBooking.copyBookingBOL));
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.addSubBooking, 'POST', JSON.stringify(input));
    }
    // added for 4920
    function nextPrevValidate(currRow) {
        var msg = '', nextArr = '', prevDep = '', dateChecker = '', nextMsg = "ETA of current leg's Discharge Port must be less than ETD of next leg's Load port"
            + '\n', prevMsg = "ETD of current leg's Load Port must be greater than ETA of previous leg's Discharge port "
            + '\n';
        if ($(currRow).closest('tr').closest('tbody').find('tr').length > 0) {
            var ind, legDate = '', selectedInd = $(currRow).closest('tr').find('.selectedRoute')
                .index('.selectedRoute'), totRowCount = $(currRow).closest('tr').closest('tbody').find('tr').length, currDep = $(
                '#estimatedDeparture').val(), currArr = $('#estimatedArrival').val();
            if (selectedInd === 0) {
                ind = selectedInd + 1;
                for (var i = ind; i < totRowCount; i++) {
                    if (nsBookDoc.textNullCheck($($('.selectedRoute')[i]).attr('data-estimdepdate')) && !nextArr) {
                        nextArr = $($('.selectedRoute')[i]).attr('data-estimdepdate');
                    }
                }
            }
            if (selectedInd > 0) {
                ind = selectedInd - 1;
                for (var j = ind; j >= 0;j--) {
                    if (nsBookDoc.textNullCheck($($('.selectedRoute')[j]).attr('data-estimarrdate')) && !legDate) {
                        legDate = $($('.selectedRoute')[j]).attr('data-estimarrdate');
                    }
                }
                prevDep = legDate.split(' ')[0];
            }
            if (selectedInd < $(currRow).closest('tr').closest('tbody').find('tr').length - 1 && selectedInd !== 0) {
                ind = selectedInd + 1;
                for (var k = ind; k < totRowCount; k++) {
                    if (nsBookDoc.textNullCheck($($('.selectedRoute')[k]).attr('data-estimdepdate')) && !nextArr) {
                        nextArr = $($('.selectedRoute')[k]).attr('data-estimdepdate');
                    }
                }
            }
            dateChecker = nsCore.compareDates(prevDep, currDep);
            if (dateChecker) {
                msg = prevMsg;
            }
            dateChecker = nsCore.compareDates(currArr, nextArr);
            if (dateChecker) {
                msg += nextMsg;
            }
        }
        return msg;
    }
    function updateSubBooking() {
        var basis = $('#mainBookingFreightBasis').val(), rate = $('#mainBookingFreightRate').val(), currency = $(
            '#mainBookingFreightCurrency').val(), totalFreight = $('#mainBookingFreightFreight').val(), payment = $(
            '#mainBookingFreightPayment').val(), commission = $('#mainBookingFreightCommission').val(), msg = '', valChrgRate = '', chargeList = [], chargeTypeMsg = '', prepaidMsg = '', chargeBasisMsg = '', rateMsg = '', curencyMsg = '', totalMsg = '', commentMsg = '', curr = {
            currencyCode : currency
        }, newCargoDisabled = '', newCargo = '', freightValue = '', actDimCondCheck = false, carrierId = '', carrier = '', cargo = {}, bookedLength = $(
            'input[name$="bookedLength"]').val(), bookedWidth = $('input[name$="bookedWidth"]').val(), bookedHeight = $(
            'input[name$="bookedHeigth"]').val(), bookedWeight = $('input[name$="bookedWeight"]').val(), bookedArea = $(
            'input[name$="bookedArea"]').val(), bookedVolume = $('input[name$="bookedVolume"]').val(), bookedDimensionType = $(
            '#bookedMeasureUnit').val(), freightedLength = $('input[name$="freightedLength"]').val(), freightedWidth = $(
            'input[name$="freightedWidth"]').val(), freightedHeight = $('input[name$="freightedHeigth"]').val(), freightedWeight = $(
            'input[name$="freightedWeight"]').val(), freightedArea = $('input[name$="freightedArea"]').val(), freightedVolume = $(
            'input[name$="freightedVolume"]').val(), freightedDimensionType = $('#freightedMeasureUnit').val(), actualLength = $(
            'input[name$="actualLength"]').val(), actualWidth = $('input[name$="actualWidth"]').val(), actualHeight = $(
            'input[name$="actualHeigth"]').val(), actualWeight = $('input[name$="actualWeight"]').val(), actualArea = $(
            'input[name$="actualArea"]').val(), actualVolume = $('input[name$="actualVolume"]').val(), actualDimensionType = $(
            '#actualMeasureUnit').val(), allocationStatus = $('#bookingAllocStatus').val(), cargoText, totalBookedUnits, origin = $(
            '#mainBookDetailCustomerOrigin').val(), originDesc = $('#mainBookDetailCustomerOriginDesc').val(), destination = $(
            '#mainBookDetailCustomerDestination').val(), destinationDesc = $('#mainBookDetailCustomerDestinationDesc')
            .val(), cargoStateId = $('#bookingCargoState').val(), subBookingId1 = $(
            '.mainBookingListWrap .subBookContentListCol').find('.ui-selecting.thrdLevel').attr('data-subbookingid'), subBookingId = subBookingId1 ? subBookingId1
            : $('#consignmentId').val(), consID = subBookingId, subBookingTimeStamp = nsBooking.subBookingObj.timeStamp, isPerUnitChecked = $(
            '#bookedUnit').find('#shipInfovalidStatus').is(':checked'), isTotalChecked = nsCore.isCondTrue($(
            '#bookedUnit').find('#shipInfoHistStatus').is(':checked'), 'N', ''), isPerUnitBooked = nsCore.isCondTrue(
            isPerUnitChecked, 'Y', isTotalChecked), perUnitFreighted = nsCore.isCondTrue($('#freightedUnit').find(
            '#shipInfovalidStatus').is(':checked'), 'Y', 'N'), bookingId = $('#bookId').val(), actLenDisabled = '', actWidDisabled = '', actHeiDisabled = '', actWeiDisabled = '', actDimTypeDisabled = '', actualDimension = {}, documentationOfficeCompany = {}, bookedDimension = {}, freightedDimension = {}, militaryCargo = '', hazardousCargo = '', bolNumber = '', cargoDesc = '', cargoDetail = {}, originObj = {}, destinationObj = {}, consLegList = '', finalConsLeg = '', isRouteDetVisible = '', consignmentLegs = [], selectedRow = $(
            '#routeDetailGrid tbody tr td .selectedRoute:checked').parent().parent(), data = {}, cargoTypeObj = {
            cargoTypeId : parseInt($('#bookingCargoType').val()),
            cargoType : $('#bookingCargoType option:selected').text()
        };
        if ($('#subBookingChargesGrid tbody').css('display') !== 'none') {
            $('#subBookingChargesGrid tbody tr')
                .each(
                    function() {
                        var chargeTypeValue = unescape($(this).find('#chargeType').val()), prepaidValue = $(this).find(
                            '#chargePayment').val(), chargeBasisValue = $(this).find('.chargeBasis').val(), rateValue = $(
                            this).find('#chargeRate').val(), curencyValue = $(this).find('#chargeCurrency').val(), totalValue = $(
                            this).find('#chargeTotal').val(), commentValue = $(this).find('#chargeComments').val(), inclGross, inclAllSubBook, inclGrossChecked = $(
                            this).find('#chargeGrossFreight').is(':checked'), inclAllSubBookChecked = $(this).find(
                            '#chargeSubBookings').is(':checked'), chargeCurrencyObj = {
                            currencyCode : $(this).find('#chargeCurrency').val()
                        }, chargeObj = {};
                        inclGross = ((inclGrossChecked) ? 'Y' : 'N');
                        inclAllSubBook = ((inclAllSubBookChecked) ? 'Y' : 'N');
                        if (nsBooking.isChargeRowNotAvl(chargeTypeValue, chargeBasisValue, nsBookDoc.isEmptyRateValue,
                            rateValue, commentValue, inclGross, inclAllSubBook, curencyValue,
                            nsBooking.defaultCurrencyCode, prepaidValue)) {
                            return true;
                        }
                        if (!chargeTypeMsg) {
                            chargeTypeMsg = nsCore.isCondTrue(!chargeTypeValue, 'Charge type is not selected \n', '');
                        }
                        if (!chargeBasisMsg) {
                            chargeBasisMsg = nsCore.isCondTrue(!chargeBasisValue, 'Charges Basis is not selected \n',
                                '');
                        }
                        if (!rateMsg) {
                            rateMsg = nsCore.isCondTrue(!rateValue, 'Charges Rate should not be empty \n', '');
                        }
                        if (prepaidMsg) {
                            prepaidMsg = nsCore.isCondTrue(!prepaidValue, 'Charges Payment is not selected \n', '');
                        }
                        if (!valChrgRate && rateValue) {
                            valChrgRate = nsBooking.validateFloat('Charges Rate', rateValue, 10, 4);
                        }
                        if (!curencyMsg) {
                            curencyMsg = nsCore.isCondTrue(!curencyValue, 'Charges Currency is not selected \n', '');
                        }
                        chargeObj = {
                            id : $(this).find('.chargeId').val(),
                            chargeType : chargeTypeValue,
                            chargeBasis : chargeBasisValue,
                            currency : chargeCurrencyObj,
                            rate : rateValue,
                            quantity : $(this).find('#chargeQuantity').val(),
                            total : totalValue,
                            prepaid : prepaidValue,
                            includeInSubBooking : inclAllSubBook,
                            includeInGrossFreight : inclGross,
                            comment : commentValue,
                            subBookingID : consID,
                            timeStamp : $(this).find('.chargesTimestamp').val()
                        };
                        chargeList.push(chargeObj);
                    });
        }
        msg += chargeTypeMsg + prepaidMsg + chargeBasisMsg + rateMsg + curencyMsg + totalMsg + commentMsg + valChrgRate;
        newCargoDisabled = $('select[name="attribute1"]').prop('disabled');
        newCargo = $('select[name="attribute1"]').val();
        msg = nsBooking.validateFreightedFields(basis, rate, currency, payment, commission, msg, newCargoDisabled,
            newCargo);
        freightValue = {
            id : consID,
            commission : commission,
            basis : basis,
            currency : curr,
            prepaid : payment,
            rate : rate,
            quantity : $('#mainBookingFreightQuatity').val(),
            freight : totalFreight
        };
        carrierId = nsCore.isCondTrue(($('#voyageTransportationType').val() === '20'), $('#voyageCarrier').val(), '');
        carrier = nsCore.isCondTrue((carrierId === '12'), $('.carrierOtherDetails').val(), '');
        msg = validateCargoRelatedFields(msg);
        msg += getDimensionsValidMsg();
        msg += getOriginValidMsg(origin, originDesc);
        msg += getDestValidMsg(destination, destinationDesc);
        if ($('#thirdPartyVoyage').css('visibility') === 'visible') {
            msg += nsCore.isCondTrue((carrierId === '12' && !carrier), 'Carrier should not be empty\n', '');
            msg += nsCore.isCondTrue(nsCore.valiDate($('#estimatedArrival').val().split(" ")[0]),
                'Enter a valid ETA POD Date\n', '');
            msg += nsCore.isCondTrue(nsCore.valiDate($('#estimatedDeparture').val().split(" ")[0]),
                'Enter a valid ETD POL Date\n', '');
            msg += nsCore.isCondTrue(nsCore.compareDates($('#estimatedDeparture').val().split(" ")[0], $(
                '#estimatedArrival').val().split(" ")[0]), 'ETD POL date cannot be greater than ETA POD date', '');
            msg += nextPrevValidate($('.selectedRoute:checked'));
        }
        if (msg.trim().length > 0) {
            var msgArray = [];
            msgArray = msg.split("\n");
            if (msgArray.length === 2
                && msg.indexOf("The values applied for consignment makes the calculated freight zero") !== -1) {
                nsCore.showAlert(msg);
            } else {
                nsCore.showAlert(msg);
                $('#mainSubBookingForm').attr('data-alert', true);
                return false;
            }
        }
        // update sub-booking details
        cargoText = $('#bookingCargoText').val();
        totalBookedUnits = $('#totalBookedUnits').val();
        $('.routeDetailGrid tbody tr')
            .each(
                function(i) {
                    var wayCargoChecked = $(this).find('.wayCargo').is(':checked'), consId = 'id'
                        + $($("input[name='selectedRoute']")[i]).attr('data-consignmentlegid');
                    consignmentLegs
                        .push({
                            wayCargo : nsCore.isCondTrue((wayCargoChecked), 'Y', 'N'),
                            comment : $('input[name$="bookingComments"]').val(),
                            firm : $(this).find('.allocStatusType').val(),
                            reserveEquipment : nsBooking.findReserveEquip($(this)),
                            transpType : nsBookDoc.cargoConsignmentsVD[consId].transpType,
                            carrierId : nsBookDoc.cargoConsignmentsVD[consId].carrierId,
                            carrierName : nsBookDoc.cargoConsignmentsVD[consId].carrierName,
                            carrierRef : nsBookDoc.cargoConsignmentsVD[consId].carrierRef,
                            estimatedArrival : nsBookDoc.cargoConsignmentsVD[consId].estimatedArrival,
                            departureDate : nsBookDoc.cargoConsignmentsVD[consId].departureDate,
                            shippedOnBoard : nsBookDoc.cargoConsignmentsVD[consId].shippedOnBoard,
                            cargoConsignmentList : nsBookDoc.cargoConsignmentsSBU[consId],
                            loadPortCallVoyageId : $(this).find('.consignmentLegsClass').attr(
                                'data-loadportcallvoyageid') === 'null' ? 0 : $(this).find('.consignmentLegsClass')
                                .attr('data-loadportcallvoyageid'),
                            id : $(this).find('.consignmentLegsClass').attr('data-id'),
                            mainLegId : $($('.routeDetailGrid').find('.mainLeg:checked')[0].parentNode.parentNode)
                                .find('.selectedRoute').attr('data-consignmentlegid'),
                            newLeg : 'N'
                        })
                });
        actLenDisabled = $('input[name$="actualLength"]').attr('disabled');
        actWidDisabled = $('input[name$="actualWidth"]').attr('disabled');
        actHeiDisabled = $('input[name$="actualHeigth"]').attr('disabled');
        actWeiDisabled = $('input[name$="actualWeight"]').attr('disabled');
        actDimTypeDisabled = $('#actualMeasureUnit').attr('disabled');
        actDimCondCheck = (!actualLength && !actualWidth && !actualHeight && !actualWeight && !actualArea && !actualVolume);
        if (actLenDisabled !== 'disabled' || actWidDisabled !== 'disabled' || actHeiDisabled !== 'disabled'
            || actWeiDisabled !== 'disabled' || actDimTypeDisabled !== 'disabled' || !actDimCondCheck ) {
            actualDimension = {
                length : parseFloat(actualLength),
                width : parseFloat(actualWidth),
                height : parseFloat(actualHeight),
                weight : parseFloat(actualWeight),
                dimensionType : actDimCondCheck ? null : actualDimensionType,
     	    	area : parseFloat(actualArea), 
    	        volume : parseFloat(actualVolume)
            };
        }
        else if($('.selectedRoute:checked').index('.selectedRoute') !== $('.mainLeg:checked').index('.mainLeg')){
        	  actualDimension = {
                      length : parseFloat(actualLength),
                      width : parseFloat(actualWidth),
                      height : parseFloat(actualHeight),
                      weight : parseFloat(actualWeight),
                      dimensionType : actDimCondCheck ? null : actualDimensionType,
                   	  area : parseFloat(actualArea), 
                	  volume : parseFloat(actualVolume)      	             
                  };
        }
        
        cargo = {
            newCargo : $('select[name="attribute1"]').val(),
            isSameActual : (Number(totalBookedUnits)>Number(nsCore.appModel.viewSubBooking.bookedUnits))? "N" :nsCore.appModel.viewSubBooking.consignmentLegModelList[0].cargoConsignmentList[0].sameActual,
            actualDimension : actualDimension
        };
        documentationOfficeCompany = {
            id : $('#bookingDocOfficeId').val()
        };
        if (isPerUnitBooked === 'N') {
            bookedLength = '';
            bookedWidth = '';
            bookedHeight = '';
        }
        if (perUnitFreighted === 'N') {
            freightedLength = '';
            freightedWidth = '';
            freightedHeight = '';
        }
        bookedDimension = {
            length : parseFloat(bookedLength),
            width : parseFloat(bookedWidth),
            height : parseFloat(bookedHeight),
            weight : parseFloat(bookedWeight),
            area : parseFloat(bookedArea),
            volume : parseFloat(bookedVolume),
            dimensionType : bookedDimensionType
        };
        freightedDimension = {
            length : parseFloat(freightedLength),
            width : parseFloat(freightedWidth),
            height : parseFloat(freightedHeight),
            weight : parseFloat(freightedWeight),
            dimensionType : freightedDimensionType,
            area : parseFloat(freightedArea),
            volume : parseFloat(freightedVolume)           
        };
        militaryCargo = nsCore.isCondTrue(($('input:checkbox[name=militaryCargo]:checked').val() === 'on'), 'Y', 'N');
        hazardousCargo = nsCore.isCondTrue(($('input:checkbox[name=hazardousCargo]:checked').val() === 'on'), 'Y', 'N');
        bolNumber = $('input[name="bookingBLNbr"]').val();
        cargoDesc = $('#cargoDescriptionIcon').val();
        cargoDetail = {
            marksAndNumbers : $('#cargoMarkNumbersIcon').val(),
            cargoDescription : cargoDesc
        };
        originObj = {
            portCode : $('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').val(),
            portName : $('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').val()
        };
        destinationObj = {
            portCode : $('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').val(),
            portName : $('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').val()
        };
        isRouteDetVisible = nsBookDoc.selectePossibleVoyage.length === 0;
        if (isRouteDetVisible) {
            if (!$(selectedRow.find('td')[1]).text() && allocationStatus === 'Y') {
                nsCore.showAlert('Voyage Information is missing. Save Booking as reserved and add voyage information');
                return false;
            }
        } else {
            consLegList = nsBooking.constructLegsFromRoute();
            if ($('#possibleVoyageNewWrapId .singleVoyageRow .fVoyageSel:checked').hasClass('noPossibleVoyage')
                && allocationStatus === 'Y') {
                nsCore.showAlert('Voyage Information is missing. Save Booking as reserved and add voyage information');
                return false;
            }
        }
       if (consLegList.length === consignmentLegs.length) {
            $.each(consignmentLegs, function(i, v) {
                consLegList[i].firm = v.firm;
                consLegList[i].wayCargo = v.wayCargo;
            });
        }
        finalConsLeg = nsCore.isCondTrue(isRouteDetVisible, consignmentLegs, consLegList);
        data = {
            id : subBookingId,
            bookingID : bookingId,
            cargoText : cargoText,
            cargoState : cargoStateId,
            cargoTypeObj : cargoTypeObj,
            bookedUnits : totalBookedUnits,
            bookedDimension : bookedDimension,
            freightedDimension : freightedDimension,
            perUnitBooked : isPerUnitBooked,
            perUnitFreighted : perUnitFreighted,
            militaryCargo : militaryCargo,
            hazardousCargo : hazardousCargo,
            consignmentLegList : finalConsLeg,
            cargo : cargo,
            documentationOfficeCompany : documentationOfficeCompany,
            bolNumber : bolNumber,
            freight : freightValue,
            chargeList : chargeList,
            cargoDetail : cargoDetail,
            modelText : $('#bookingCargoMake').val(),
            customerId : $('.subBookLevel #maincustomerID').val()?$('.subBookLevel #maincustomerID').val():nsCore.appModel.viewSubBooking.customerId,
            origin : originObj,
            destination : destinationObj,
            newLeg : nsBookDoc.newLegFlag,
            timeStamp : subBookingTimeStamp,
            moduleType : !nsDoc ? 'BOOK' : 'BL'
        };
        if (window.location.href.indexOf('/documentation/') >= 0) {
            var noVessVoy = false;
            data.bol = 'BL';
            $.each(data.consignmentLegList, function(i, v) {
                if (!v.firm) {
                    v.firm = 'Y';
                }
                if (v.consignmentType === 'M' && v.firm === 'N') {
                    noVessVoy = true;
                }
            });
            if (noVessVoy) {
                nsCore.showAlert('Vessel/voyage should not be empty.');
                return;
            }
        }     
            if (window.location.href.indexOf('/documentation/') >= 0) {
                var vesVoyChange = '', selVesselVoy = '', consLegAllocCheck = [];
                vesVoyChange = (!nsDoc.newBlObj.isManualTrigger && nsDoc.existingRouteData.currentConsType === 'M' && nsDoc.existingRouteData.selectedVesselVoyage !== nsDoc.existingRouteData.existingVesselVoyage);
                consLegAllocCheck.push({
                    consignmentId : $('.activeNavigationItem').attr('data-subbookingid'),
                    loadPortCallVoyageId : nsDoc.existingRouteData.selectedLoadPortCallId,
                    discPortCallVoyageId : nsDoc.existingRouteData.selectedDiscPortCallId
                });
                if (vesVoyChange) {
                    nsDoc.consLevelCheck = $('.activeNavigationItem').attr('data-subbookingid');
                    selVesselVoy = nsDoc.existingRouteData.selectedVesselVoyage.split('/');
                    nsDoc.newBlObj.renderPopup(selVesselVoy[0], selVesselVoy[1], 'saveSubBook', '', consLegAllocCheck);
                    nsDoc.isCallfromSubBook = true;
                    nsDoc.subBookSaveData = data;
                    return false;
                }
            }
            saveSubBookHelper(data);
            nsBooking.mainBookingFlag.changedOriginDest = false;
            $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');       
    }
    function saveSubBookHelper(data) {
        $('.preloaderWrapper').show();
        vmsService
            .vmsApiService(
                function(response) {
                    if (response) {
                        if (response.responseCode === '45000') {
                            $('.preloaderWrapper').hide();
                            if (window.location.href.indexOf('/documentation/') >= 0) {
                                if (nsDoc.isCallfromSubBook) {
                                    nsDoc.isCallfromSubBook = false;
                                }
                            }
                            nsCore
                                .showAlert('Someone else have updated the data since you retrieved the booking information');
                        } else if (response.responseCode === '18005' || response.responseCode === '1234'
                            || response.responseCode === '1235') {
                            $('.preloaderWrapper').hide();
                            if (nsDoc && response.responseCode === '18005') {
                                nsCore
                                    .showAlert("The consignment can not be saved because of lack of allocated space. Save as reserve and allocate needed space on the voyage");
                            } else {
                                nsCore.showAlert(response.responseDescription);
                            }
                            return false;
                        } else if (response.responseDescription === 'Success') {
                            nsBookDoc.existingRouteDetails = {
                                'vesVoy' : [],
                                'newVesVoy' : [],
                                'legCount' : 0,
                                'newLegCount' : 0,
                                'addEdit' : [],
                                'newLoadPort' : [],
                                'newDisPort' : [],
                                'newETD' : [],
                                'newETA' : [],
                                'oldLoadPort' : [],
                                'oldDisPort' : [],
                                'oldETD' : [],
                                'oldETA' : [],
                            }
                            nsBookDoc.newLegFlag = 'N'
                            $('#mainSubBookingForm').attr('data-dirty', false);
                            if (window.location.href.indexOf('/documentation/') >= 0) {
                                nsDoc.newBlObj.isManualTrigger = false;
                                if (nsDoc.isCallfromSubBook) {
                                    nsDoc.isCallfromSubBook = false;
                                    nsDoc.newBlObj.makeBlSubmit();
                                    nsBooking.resetFlagSubBookingLevel();
                                    hidePreLoader();
                                    return false;
                                }
                            }
                            // to Reset Navigation check FLag
                            nsBooking.resetFlagSubBookingLevel();
                            nsBookDoc.activeSubBooking();
                            hidePreLoader();                       
                        } else {
                            $('.preloaderWrapper').hide();
                            if (response.responseDescription) {
                                nsCore.showAlert(response.responseDescription);
                            }
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.updateDateFormat + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat, 'POST', JSON
                    .stringify(data));
    }
    
    function hidePreLoader(){
        if ($('.thrdLevel.activeSubBook .expandSubBooking.fa-minus').length !== 1) {
            setTimeout(function() {
                $('.preloaderWrapper').hide();
            }, 10000);
        }
    }
    function validateCargoRelatedFields(msg) {
        var docCode = $('#bookingDocCode').val(), docDesc = $('#bookingDocDesc').val(), cargoType = $(
            '#bookingCargoType').val(), cargoText = $('#bookingCargoText').val().trim(), cargoState = $(
            '#bookingCargoState').val(), totalBookedUnits = $('#totalBookedUnits').val().trim(), numbers = /^[0-9]+$/;
        msg = getDocOfcValidMsg(msg, docCode, docDesc);
        if (!cargoText) {
            msg += 'Cargo text should not be empty ' + '\n';
        }
        msg = nsBooking.getBkdValidationMsg(msg, totalBookedUnits, numbers);
        if (!cargoType || cargoType === '0') {
            msg += 'Cargo type is not selected ' + '\n';
        }
        if (!cargoState) {
            msg += 'Cargo state is not selected ' + '\n';
        }
        return msg;
    }
    function getDocOfcValidMsg(msg, docCode, docDesc) {
        if (!docCode && !docDesc) {
            msg += 'Documentation office should not be empty' + '\n';
        } else {
            if (!docDesc || !docCode || ($('#bookingDocCode').attr('data-form') === '0')) {
                msg += 'Enter a valid Documentation office' + '\n';
            }
        }
        return msg;
    }
    function addEmptyCharge(chargeList) {
        var chargeCurrency = {}, charge = {};
        if (chargeList.length === 1) {
            chargeCurrency = {
                currencyCode : ''
            };
            charge = {
                id : '',
                chargeType : '',
                chargeBasis : '',
                currency : chargeCurrency,
                rate : '',
                quantity : '',
                total : '',
                prepaid : '',
                includeInSubBooking : '',
                includeInGrossFreight : '',
                comment : '',
                subBookingID : ''
            };
            chargeList.push(charge);
        }
        return chargeList;
    }
    function validateDimFeilds(cond, len, wid, hei, wei, area, vol) {
        if (cond) {
            if (len && wid && hei && wei && area && vol) {
                return false
            } else if (len && wid && hei && wei) {
                return false
            } else if (wei && area && vol) {
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }
    function getDimensionsValidMsg() {
        var msg = '', bookedLength = $('input[name$="bookedLength"]').val(), bookedWidth = $(
            'input[name$="bookedWidth"]').val(), bookedHeight = $('input[name$="bookedHeigth"]').val(), bookedWeight = $(
            'input[name$="bookedWeight"]').val(), bookedArea = $('input[name$="bookedArea"]').val(), bookedVolume = $(
            'input[name$="bookedVolume"]').val(), freightedLength = $('input[name$="freightedLength"]').val(), freightedWidth = $(
            'input[name$="freightedWidth"]').val(), freightedHeight = $('input[name$="freightedHeigth"]').val(), freightedWeight = $(
            'input[name$="freightedWeight"]').val(), freightedArea = $('input[name$="freightedArea"]').val(), freightedVolume = $(
            'input[name$="freightedVolume"]').val(), allocationStatus = $('#bookingAllocStatus').val(), perUnitBooked = $(
            '#bookedUnit').find('#shipInfovalidStatus').is(':checked'), perUnitFreighted = $('#freightedUnit').find(
            '#shipInfovalidStatus').is(':checked'), basis = $('#mainBookingFreightBasis').val(), isDisabled, isBkdLenEmpty = false, isBkdWidEmpty = false, isBkdHeiEmpty = false, isBkdAreaEmpty = false, isBkdVolEmpty = false, elementWeight = '', valueWeight = '', isFreiWeiEmpty = '', cargoDesc = '', isCargoDescEmpty = '', isBkdWeiEmpty = false, actualLength = $(
            'input[name$="actualLength"]').val(), actualWidth = $('input[name$="actualWidth"]').val(), actualHeight = $(
            'input[name$="actualHeigth"]').val(), actualWeight = $('input[name$="actualWeight"]').val(), actualArea = $(
            'input[name$="actualArea"]').val(), actualVolume = $('input[name$="actualVolume"]').val(), valCheck = ($(
            '.selectedRoute:checked').index('.selectedRoute') !== $('.mainLeg:checked').index('.mainLeg')), bookedCheck = validateDimFeilds(
            valCheck, bookedLength, bookedWidth, bookedHeight, bookedWeight, bookedArea, bookedVolume), freightedCheck = validateDimFeilds(
            valCheck, freightedLength, freightedWidth, freightedHeight, freightedWeight, freightedArea, freightedVolume), actualCheck = validateDimFeilds(
            valCheck, actualLength, actualWidth, actualHeight, actualWeight, actualArea, actualVolume);
        if (perUnitBooked) {
            isDisabled = $('#subBlen').is('[disabled]');
            if (!isDisabled || bookedCheck) {
                isBkdLenEmpty = (!bookedLength);
                msg += (isBkdLenEmpty) ? 'Booked Length should not be empty \n' : nsBooking.validateFloat(
                    'Booked Length', bookedLength, 6, 8);
                msg += (bookedLength === '0.000') ? 'Booked Length should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#subBWid').is('[disabled]');
            if (!isDisabled || bookedCheck) {
                isBkdWidEmpty = (!bookedWidth);
                msg += (isBkdWidEmpty) ? 'Booked Width should not be empty \n' : nsBooking.validateFloat(
                    'Booked Width', bookedWidth, 6, 8);
                msg += (bookedWidth === '0.000') ? 'Booked Width should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#subBHei').is('[disabled]');
            if (!isDisabled || bookedCheck) {
                isBkdHeiEmpty = (!bookedHeight);
                msg += (isBkdHeiEmpty) ? 'Booked Height should not be empty \n' : nsBooking.validateFloat(
                    'Booked Height', bookedHeight, 6, 8);
                msg += (bookedHeight === '0.000') ? 'Booked Height should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#bookedArea').is('[disabled]');
            if (!isDisabled || bookedCheck) {
                isBkdAreaEmpty = (!bookedArea);
                msg += (isBkdAreaEmpty) ? 'Booked Area should not be empty \n' : nsBooking.validateFloat('Booked Area',
                    bookedArea, 12, 8);
                msg += (bookedArea === '0.000') ? 'Booked Area should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#subBVol').is('[disabled]');
            if (!isDisabled || bookedCheck) {
                isBkdVolEmpty = (!bookedVolume);
                msg += (isBkdVolEmpty) ? 'Booked Volume should not be empty \n' : nsBooking.validateFloat(
                    'Booked Volume', bookedVolume, 18, 8);
                msg += (bookedVolume === '0.000') ? 'Booked Volume should be greater than 0 (Zero) \n' : '';
            }
        } else {
            isBkdAreaEmpty = (!bookedArea);
            msg += (isBkdAreaEmpty) ? 'Booked Area should not be empty \n' : nsBooking.validateFloat('Booked Area',
                bookedArea, 12, 8);
            msg += (bookedArea === '0.000') ? 'Booked Area should be greater than 0 (Zero) \n' : ''
            isBkdVolEmpty = (!bookedVolume);
            msg += (isBkdVolEmpty) ? 'Booked Volume should not be empty \n' : nsBooking.validateFloat('Booked Volume',
                bookedVolume, 18, 8);
            msg += (bookedVolume === '0.000') ? 'Booked Volume should be greater than 0 (Zero) \n' : '';
        }
        msg += ((parseFloat($('#mainBookingFreightFreight').val())===0 && basis === 'LM') ? 'The values applied for consignment makes the'
                + ' calculated freight zero\n' : '');
        if ((actualLength || actualWidth || actualHeight || actualWeight) && (!actualArea && !actualVolume)) {
            // validations added for actual dimensions
            isDisabled = $('#actualLength').is('[disabled]');
            if (!isDisabled || actualCheck) {
                isBkdLenEmpty = (!actualLength);
                msg += (isBkdLenEmpty) ? 'Actual Length should not be empty \n' : nsBooking.validateFloat(
                    'Actual Length', actualLength, 6, 8);
                msg += (actualLength === '0.000') ? 'Actual Length should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#actualWidth').is('[disabled]');
            if (!isDisabled || actualCheck) {
                isBkdWidEmpty = (!actualWidth);
                msg += (isBkdWidEmpty) ? 'Actual Width should not be empty \n' : nsBooking.validateFloat(
                    'Actual Width', actualWidth, 6, 8);
                msg += (actualWidth === '0.000') ? 'Actual Width should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#actualHeigth').is('[disabled]');
            if (!isDisabled || actualCheck) {
                isBkdHeiEmpty = (!actualHeight);
                msg += (isBkdHeiEmpty) ? 'Actual Height should not be empty \n' : nsBooking.validateFloat(
                    'Actual Height', actualHeight, 6, 8);
                msg += (actualHeight === '0.000') ? 'Actual Height should be greater than 0 (Zero) \n' : '';
            }
            isDisabled = $('#actualWeight').is('[disabled]');
            if (!isDisabled || actualCheck) {
                isBkdAreaEmpty = (!actualWeight);
                msg += (isBkdAreaEmpty) ? 'Actual Weight should not be empty \n' : nsBooking.validateFloat(
                    'Actual Weight', actualWeight, 6, 8);
                msg += (actualWeight === '0.000') ? 'Actual Weight should be greater than 0 (Zero) \n' : '';
            }
        }
        if ((!actualLength && !actualWidth && !actualHeight) && (actualWeight || actualArea || actualVolume)) {
            // validations added for actual dimensions
            isDisabled = $('#actualWeight').is('[disabled]');
            if (!isDisabled || actualCheck) {
                isBkdAreaEmpty = (!actualWeight);
                msg += (isBkdAreaEmpty) ? 'Actual Weight should not be empty \n' : nsBooking.validateFloat(
                    'Actual Weight', actualWeight, 6, 8);
                msg += (actualWeight === '0.000') ? 'Actual Weight should be greater than 0 (Zero) \n' : '';
            }
            isBkdAreaEmpty = (!actualArea);
            msg += (isBkdAreaEmpty) ? 'Actual Area should not be empty \n' : nsBooking.validateFloat('Actual Area',
                actualArea, 12, 8);
            msg += (actualArea === '0.000') ? 'Actual Area should be greater than 0 (Zero) \n' : '';
            isBkdAreaEmpty = (!actualVolume);
            msg += (isBkdAreaEmpty) ? 'Actual Volume should not be empty \n' : nsBooking.validateFloat('Actual Volume',
                actualVolume, 18, 8);
            msg += (actualVolume === '0.000') ? 'Actual Volume should be greater than 0 (Zero) \n' : '';
        }
        elementWeight = $('input[name$="bookedWeight"]');
        valueWeight = elementWeight.val();
        isBkdWeiEmpty = (!bookedWeight);
        msg += (isBkdWeiEmpty) ? 'Booked Weight should not be empty \n' : nsBooking.validateFloat('Booked Weight',
            valueWeight, 14, 8);
        msg += (parseInt(bookedWeight) === 0) ? 'Booked Weight should be greater than 0 (Zero) \n' : '';
        msg += getFreiDimMessage(freightedLength, freightedWidth, freightedHeight, freightedArea, freightedVolume,
            perUnitFreighted, isBkdLenEmpty, isBkdWidEmpty, isBkdHeiEmpty, isBkdAreaEmpty, isBkdVolEmpty, msg,
            freightedCheck);
        isFreiWeiEmpty = (!freightedWeight);
        msg += ((isFreiWeiEmpty && !isBkdWeiEmpty) ? 'Freighted Weight should not be empty \n' : '');
        if (msg.indexOf('Booked Weight should be greater than 0') === -1) {
            msg += (parseInt(freightedWeight) === 0) ? 'Freighted Weight should be greater than 0 (Zero) \n' : '';
        }
        elementWeight = $('input[name$="freightedWeight"]');
        valueWeight = elementWeight.val();
        msg += getFreiWeightMsg(elementWeight, valueWeight);
        msg += getDimensionsValidMsgHelper(allocationStatus, cargoDesc, isCargoDescEmpty);
        msg += getRouteValidation(allocationStatus);
        return msg;
    }
    function getRouteValidation(allocationStatus) {
        var message = "";
        message += ((!allocationStatus || allocationStatus === '-- Select --') ? 'Allocation status is not selected \n'
            : '');
        if (message === "") {
            $('.routeDetailGrid tbody tr')
                .each(
                    function() {
                        var allocTypDetailsubBook = $(this).find(".allocStatusType").css("display"), subBookValueAllStaType;
                        if (allocTypDetailsubBook !== "none" && message === "" && allocTypDetailsubBook) {
                            subBookValueAllStaType = $(this).find(".allocStatusType").val();
                            message += ((!subBookValueAllStaType || subBookValueAllStaType === '-- Select --') ? 'Allocation status is not selected \n'
                                : '');
                        }
                        if (message !== "") {
                            return message;
                        }
                    });
        }
        return message;
    }
    function getDimensionsValidMsgHelper(allocationStatus, cargoDesc, isCargoDescEmpty) {
        var message = '';
        cargoDesc = $('#cargoDescriptionIcon').val();
        isCargoDescEmpty = (!cargoDesc);
        message += ((isCargoDescEmpty) ? 'Cargo description should not be empty \n' : '');
        return message;
    }
    function getFreiWeightMsg(elementWeight, valueWeight) {
        var weightMsg = '';
        if (valueWeight) {
            weightMsg = nsBooking.validateFloat('Freighted Weight', valueWeight, 14, 8);
        }
        return weightMsg;
    }
    function getFreDimMsgHelper(isDisabled, isEmpty, field, value, msgChk, freightedCheck) {
        var msg = '';
        if ((!isDisabled || freightedCheck) && !isEmpty) {
            msg += ((!value) ? 'Freighted ' + field + ' should not be empty \n' : nsBooking.validateFloat('Freighted '
                + field, value, 6, 8));
            if (msgChk.indexOf('Booked ' + field + ' should be greater than 0') === -1) {
                msg += (value === '0.000') ? 'Freighted ' + field + ' should be greater than 0 (Zero) \n' : '';
            }
        }
        return msg;
    }
    function getFreiDimMessage(freightedLength, freightedWidth, freightedHeight, freightedArea, freightedVolume,
        perUnitFreighted, isBkdLenEmpty, isBkdWidEmpty, isBkdHeiEmpty, isBkdAreaEmpty, isBkdVolEmpty, msgChk,
        freightedCheck) {
        var msg = '', isDisabled;
        if (perUnitFreighted) {
            isDisabled = $('#freightedLength').is('[disabled]');
            msg = getFreDimMsgHelper(isDisabled, isBkdLenEmpty, 'Length', freightedLength, msgChk, freightedCheck);
            isDisabled = $('#freightedWidth').is('[disabled]');
            msg += getFreDimMsgHelper(isDisabled, isBkdWidEmpty, 'Width', freightedWidth, msgChk, freightedCheck);
            isDisabled = $('#freightedHeight').is('[disabled]');
            msg += getFreDimMsgHelper(isDisabled, isBkdHeiEmpty, 'Height', freightedHeight, msgChk, freightedCheck);
            isDisabled = $('#freightedArea').is('[disabled]');
            msg += getFreDimMsgHelper(isDisabled, isBkdAreaEmpty, 'Area', freightedArea, msgChk, freightedCheck);
            isDisabled = $('#freightedVolume').is('[disabled]');
            msg += getFreDimMsgHelper(isDisabled, isBkdVolEmpty, 'Volume', freightedVolume, msgChk, freightedCheck);
        } else {
            msg += getFreiDimMessageHelper(isBkdAreaEmpty, freightedArea, isBkdVolEmpty, freightedVolume, msgChk);
        }
        return msg;
    }
    function getFreiDimMessageHelper(isBkdAreaEmpty, freightedArea, isBkdVolEmpty, freightedVolume, msgChk) {
        var message = '';
        if (!isBkdAreaEmpty) {
            message += ((!freightedArea) ? 'Freighted Area should not be empty \n' : nsBooking.validateFloat(
                'Freighted Area', freightedArea, 12, 8));
            if (msgChk.indexOf('Booked Area should be greater than 0')) {
                message += (freightedArea === '0.000') ? 'Freighted Area should be greater than 0 (Zero) \n' : '';
            }
        }
        if (!isBkdVolEmpty) {
            message += ((!freightedVolume) ? 'Freighted Volume should not be empty \n' : nsBooking.validateFloat(
                'Freighted Volume', freightedVolume, 18, 8));
            if (msgChk.indexOf('Booked Volume should be greater than 0')) {
                message += (freightedVolume === '0.000') ? 'Freighted Volume should be greater than 0 (Zero) \n' : '';
            }
        }
        return message;
    }
    function getBkdWeightMsg(isBkdWeiEmpty, valueWeight, elementWeight) {
        var msg = '', weightBookedMsg = '';
        if (isBkdWeiEmpty) {
            msg = 'Booked Weight should not be empty ' + '\n';
        } else {
            if (valueWeight) {
                weightBookedMsg = nsBooking.nonDecCheck(elementWeight, valueWeight, 14, 'Booked Weight');
                if (weightBookedMsg) {
                    msg = weightBookedMsg + '\n';
                }
            }
        }
        return msg;
    }
    function getOriginValidMsg(origin, originDesc) {
        var msg = '';
        if ((!origin) && (!originDesc)) {
            msg = 'Origin should not be empty' + '\n';
        } else {
            if (!origin || (!originDesc && origin !== 'The Sub bookings have different Origins And /Or Destinations')
                || ($('#mainBookDetailCustomerOrigin').attr('data-form1') === '0')) {
                msg = 'Enter a valid Origin' + '\n';
            }
        }
        return msg;
    }
    function getDestValidMsg(destination, destinationDesc) {
        var msg = '';
        if (!destination && !destinationDesc) {
            msg = 'Destination should not be empty' + '\n';
        } else {
            if (!destination
                || (!destinationDesc && destination !== 'The Sub bookings have different Origins And /Or Destinations')
                || ($('#mainBookDetailCustomerDestination').attr('data-form2') === '0')) {
                msg = 'Enter a valid Destination' + '\n';
            }
        }
        return msg;
    }
    function addEmptyConsLeg(consLegList) {
        var consLeg = {};
        if (consLegList.length === 1) {
            consLeg = {
                wayCargo : '',
                comment : '',
                firm : '',
                transpType : '',
                carrierName : '',
                carrierRef : '',
                estimatedArrival : '',
                departureDate : '',
                shippedOnBoard : '',
                cargoConsignmentList : [],
                id : ''
            };
            consLegList.push(consLeg);
        }
        return consLegList;
    }
    function noVoyAllocCheck(noVoyAllocflag) {
        var alertMsg = 'Voyage information is missing. Save sub booking as reserved and add voyage information!', routePortCallVId = $(
            '#routeDetailGrid .mainLeg:checked').next('.consignmentLegsClass').attr('data-loadportcallvoyageid');
        if (nsBookDoc.selectePossibleVoyage.length === 0) {
            if (!(routePortCallVId && routePortCallVId !== 'null') && $('#bookingAllocStatus').val() === 'Y') {
                noVoyAllocflag = false;
                nsCore.showAlert(alertMsg);
            }
        } else {
            if ($('.possibleVoyageWrap').css('display') !== 'none') {
                noVoyAllocflag = noVoyAllocCheckHelper(noVoyAllocflag, alertMsg);
            }
        }
        return noVoyAllocflag;
    }
    function noVoyAllocCheckHelper(noVoyAllocflag, alertMsg) {
        var firstleg = $('input[name="selectPossibleVoyage"]:checked').parent('div').children('div')[0], possVoyPortCallId = $(
            firstleg).find('.sourcePortCallID').val();
        if ($(firstleg).hasClass('singleLegNoVoyage')) {
            if ($('#bookingAllocStatus').val() === 'Y') {
                noVoyAllocflag = false;
                nsCore.showAlert(alertMsg);
            }
        } else {
            if (!(possVoyPortCallId && possVoyPortCallId !== 'null') && $('#bookingAllocStatus').val() === 'Y') {
                noVoyAllocflag = false;
                nsCore.showAlert(alertMsg);
            }
        }
        return noVoyAllocflag;
    }
    function doFresSub(element, otherSubBooking) {
        var legData = '', wayCargo = 'N', isViss = $('.routeDetailsWrapper').css('display') !== 'none', militaryCargo = ($(
            'input:checkbox[name=militaryCargo]:checked').val() === 'on') ? 'Y' : 'N', hazardousCargo = ($(
            'input:checkbox[name=hazardousCargo]:checked').val() === 'on') ? 'Y' : 'N', cargoOnHold = ($(
            'input:checkbox[name=cargoOnHold]:checked').val() === 'on') ? 'Y' : 'N', bkdPerUnit = nsBooking
            .findBookPerUnit(element), bkdLen = nsBooking.findBookLength(element), bkdWidth = nsBooking
            .findBookWidth(element), bkdHeight = nsBooking.findBookHeight(element), FreiPerUnit = nsBooking
            .findFrPerUnit(element), FreiLength = nsBooking.findFrLength(element), FreiWidth = nsBooking
            .findFrWidth(element), FreiHeight = nsBooking.findFrHeight(element), cagoEqpNo = $('#cargoEquipmentNbr')
            .find(':selected').text(), equipNo = (cagoEqpNo === '-- Select --') ? '' : cagoEqpNo, equipType = $(
            '#cargoEquipmentType').val(), input = {}, noVoyAllocflag = true, cBookingID = null, bookingNumber = null, myform = $('#createFreshBook'), disabled = myform
            .find(':input:disabled').removeAttr('disabled'), str = $('#createFreshBook').serialize(), firstleg = '', transTyp = '', discPort = '', loadPort = '', discPortID = '', loadPortID = '';
        if (isViss) {
            $('#routeDetailGrid tbody tr #consignmentLegsClass')
                .each(
                    function() {
                        var isWayCargo = $(this).closest('tr').find('.wayCargo').is(':checked'), content = '', allocationType = '';
                        transTyp = $(this).attr('data-constype');
                        discPort = $(this).attr('data-discport');
                        loadPort = $(this).attr('data-loadport');
                        allocationType = $(this).closest('tr').find('.allocStatusType').val();
                        if ($(this).attr("data-vesselvoyage") === "No Voyage") {
                            discPortID = '0'
                            loadPortID = '0'
                        } else {
                            discPortID = $(this).attr('data-discportcallvoyageid') === 'null' ? '0' : $(this).attr(
                                'data-discportcallvoyageid');
                            loadPortID = $(this).attr('data-loadportcallvoyageid') === 'null' ? '0' : $(this).attr(
                                'data-loadportcallvoyageid');
                        }
                        if (isWayCargo) {
                            wayCargo = 'Y';
                        } else {
                            wayCargo = 'N';
                        }
                        content = transTyp + '<td>' + discPort + '<td>' + loadPort + '<td>' + discPortID + '<td>'
                            + loadPortID + '<td>' + wayCargo + '<td>' + allocationType;
                        if (legData === '') {
                            legData = content;
                        } else {
                            legData = legData + '<tr>' + content;
                        }
                    });
        } else {
            if ($('.possibleVoyageWrap').css('display') !== 'none') {
                legData = '';
                firstleg = $('input[name="selectPossibleVoyage"]:checked').parent('div').children('div');
                firstleg.each(function(i, val) {
                    transTyp = $(val).find('.consignmentTransType').val() || '';
                    discPort = $(val).find('.discPortCode').text();
                    loadPort = $(val).find('.loadPortCode').text();
                    discPortID = $(val).find('.destinationPortCallID').val() || '0';
                    loadPortID = $(val).find('.sourcePortCallID').val() || '0';
                    if (firstleg.length === 1
                        && $('input[name="selectPossibleVoyage"]:checked').val().toUpperCase() === 'NO VOYAGE') {
                        transTyp = 'M';
                        discPort = $('#mainBookDetailCustomerDestination').val();
                        loadPort = $('#mainBookDetailCustomerOrigin').val();
                    }
                    if (i === 0) {
                        legData = transTyp + '<td>' + discPort + '<td>' + loadPort + '<td>' + discPortID + '<td>'
                            + loadPortID + '<td>' + wayCargo;
                    } else {
                        legData += '<tr>' + transTyp + '<td>' + discPort + '<td>' + loadPort + '<td>' + discPortID
                            + '<td>' + loadPortID + '<td>' + wayCargo;
                    }
                });
            }
        }
        if (bkdPerUnit === 'NO') {
            bkdLen = '';
            bkdWidth = '';
            bkdHeight = '';
        }
        if (FreiPerUnit === 'NO') {
            FreiLength = '';
            FreiWidth = '';
            FreiHeight = '';
        }
        input = {
            cargoType : nsBooking.findCargoType(element),
            cargoText : nsBooking.findCargoText(element),
            cargoState : nsBooking.findCargoState(element),
            modelText : nsBooking.findModelText(element),
            bookedUnits : nsBooking.findBookedUnits(element),
            cargoOnHold : cargoOnHold,
            bookingID : nsBooking.findBookingID(element),
            militaryCargo : militaryCargo,
            hazardousCargo : hazardousCargo,
            attribute1 : nsBooking.findAttribute(element),
            wayCargo : nsBooking.findWayCargo(element),
            comments : nsBooking.findComments(element),
            documentationOfficeCode : nsBooking.findDocID(),
            allocationStatus : nsBooking.findAllocationStatus(element),
            reserveEquipment : nsBooking.findReserveEquip(element),
            dimensionTypeBooked : nsBooking.findBookType(element),
            lengthBooked : bkdLen,
            widthBooked : bkdWidth,
            heightBooked : bkdHeight,
            weightBooked : nsBooking.findBookWeight(element),
            areaBooked : nsBooking.findBookArea(element),
            volumeBooked : nsBooking.findBookVolume(element),
            perUnitBooked : bkdPerUnit,
            dimensionTypeFreighted : nsBooking.findFrType(element),
            lengthBookedFreighted : FreiLength,
            widthBookedFreighted : FreiWidth,
            heightBookedFreighted : FreiHeight,
            weightBookedFreighted : nsBooking.findFrWeight(element),
            areaBookedFreighted : nsBooking.findFrArea(element),
            volumeBookedFreighted : nsBooking.findFrVolume(element),
            perUnitBookedFreighted : FreiPerUnit,
            chargeContent : nsCore.replaceHTML(nsBooking.chargeCont),
            freightBasis : nsBooking.findFreightBasis(element),
            freightCurrency : nsBooking.findFreightCurrency(element),
            freightRate : nsBooking.findFreightRate(element),
            freightQuantity : $('#mainBookingFreightQuatity').val(),
            freightTotal : nsBooking.findFreightTotal(element),
            freightPayment : nsBooking.findFreightPayment(element),
            freightCommission : nsBooking.findFreightCommision(element),
            marksAndNumbers : nsBooking.findMarksAndNumbers(element),
            cargoDescription : nsBooking.findCargoDescription(element),
            equipmentNo : equipNo,
            equipmentType : equipType,
            transportationType : nsBooking.findTransportationType(element),
            carrierId : nsBooking.findCarrierId(element),
            carrier : nsBooking.findCarrier(element),
            carrierRef : nsBooking.findCarrierRef(element),
            estimatedArrival : nsBooking.findEstimatedArrival(element),
            estimatedDeparture : nsBooking.findEstimatedDepart(element),
            shippedOnBoard : nsBooking.findShipOnBoard(element),
            sourcePortID : nsBooking.findSourcePortID(element),
            destinationPortID : nsBooking.findDestiPortID(element),
            routeCount : nsBooking.findLegCount(),
            legContent : nsCore.replaceHTML(legData),
            lengthActual : nsBooking.findActLength(element),
            widthActual : nsBooking.findActWidth(element),
            heightActual : nsBooking.findActHeight(element),
            weightActual : nsBooking.findActWeight(element),
            dimensionTypeActual : nsBooking.findActType(element),
            areaActual : nsBooking.findActArea(element),
            volumeActual : nsBooking.findActVolume(element),
            copiedToFreighted : nsBooking.isCopiedToFreighted,
            dateTimeFormat : nsCore.dateFormat + ' ' + nsCore.timeFormat
        };
        if (nsBooking.isCopyBookingEnabled === 'Yes') {
            if (!otherSubBooking) {
                disabled.attr('disabled', 'disabled');
                vmsService.vmsApiServiceType(function(data) {
                    if (data) {
                        cBookingID = data.id;
                        bookingNumber = data.bookNo;
                        $('#bookingHeaderId').val(cBookingID);
                        if (cBookingID) {
                            input.bookingID = cBookingID;
                            vmsSubBookHelper(input, cBookingID, bookingNumber)
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.freshBooking, 'POST', str);
            } else {
                vmsService.vmsApiServiceTypeLoad(function(result) {
                    var output = '';
                    if (result) {
                        output = result.statusMsg;
                        if (output) {
                            nsBooking.resetFlagSubBookingLevel();
                            nsCore.showAlert('New Sub booking is created under Newly created Booking');
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.addSubBooking, 'POST', JSON.stringify(input));
            }
        } else {           
                noVoyAllocflag = noVoyAllocCheck(noVoyAllocflag);
                if (noVoyAllocflag) {
                    loadSubBookContentHelper(input);
                }           
        }
    }
    sbObj = {
        'fnCreateNewBooking' : fnCreateNewBooking,
        'updateSubBooking' : updateSubBooking,
        'validateCargoRelatedFields' : validateCargoRelatedFields,
        'getDocOfcValidMsg' : getDocOfcValidMsg,
        'addEmptyCharge' : addEmptyCharge,
        'getDimensionsValidMsg' : getDimensionsValidMsg,
        'getFreiWeightMsg' : getFreiWeightMsg,
        'getFreiDimMessage' : getFreiDimMessage,
        'getBkdWeightMsg' : getBkdWeightMsg,
        'getOriginValidMsg' : getOriginValidMsg,
        'getDestValidMsg' : getDestValidMsg,
        'addEmptyConsLeg' : addEmptyConsLeg,
        'doFresSub' : doFresSub,
        'getRouteValidation' : getRouteValidation,
        'saveSubBookHelper' : saveSubBookHelper
    };
    $.extend(true, nsBooking, sbObj);
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc, this.doc);
