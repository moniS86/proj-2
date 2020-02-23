/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {

    var helperObj = {
        'bookingEnabled': bookingEnabled,
        'checkNavigation': checkNavigation,
        'subBookingDetails': subBookingDetails,
        'chargeTypeSelectMsg': chargeTypeSelectMsg,
        'dimensionValidDetails': dimensionValidDetails,
        'dimensionValidData': dimensionValidData,
        'fnCreateNewBooking': fnCreateNewBooking,
        'getBLStatusClassName': getBLStatusClassName,
        'multipleLegBooking': multipleLegBooking,
        'loadDataObj': loadDataObj,
        'unCheckPossibleVoyg': unCheckPossibleVoyg,
        'makeModelList': makeModelList
    }

    // adding new copy of the subbooking
    function fnCreateNewBooking(bookingId, bookingNumber, selector) {
        var html = '';
        html += '<div data-bookingid="' + bookingId + '" data-filtering="' + bookingNumber +
            '" class="billVin singleColItem activeSubBook ui-selecting">' + bookingNumber;
        html += '<div class="mainBookingItemIcons">';
        html += '<span class="icons_sprite bookingInlineMenu roundDownArrowIcon fa fa-chevron-down"></span>';
        html += '<span id="bookingRemoveIcon" name="bookingRemoveIcon"' +
        	'class="icons_sprite rowRemoveIcon bookingRemoveIcon fa fa-remove"></span>';
        html += '</div>';
        html += '</div>';
        $(selector).replaceWith(html);
    }

    function bookingEnabled(cBookingID, bookingNumber, str, input, element, copyBookingBOL) {
        vmsService.vmsApiServiceType(function(data) {
            var output;
            if (data) {
                cBookingID = data.id;
                bookingNumber = data.bookNo;
                $('#bookingHeaderId').val(cBookingID);
                if (!cBookingID) {
                    input.bookingID = cBookingID;
                    // Save sub booking.
                    vmsService.vmsApiServiceType(function(result) {
                        if (result) {
                            output = result.statusMsg;
                            if (output !== 'false') {
                                nsCore.showAlert(nsBooking.createMsg);
                                fnCreateNewBooking(cBookingID, bookingNumber, '.newCopyBooking');
                            } else {
                                nsCore.showAlert(nsBooking.failed);
                            }
                            copyBookingBOL.id = result.bolId;
                            // Update BOL information
                            vmsService.vmsApiServiceType(function(response) {
                                if (!response) {
                                	nsCore.showAlert(nsBooking.errorMsg);
                                }
                            }, nsBooking.updateBill, 'POST', JSON.stringify(copyBookingBOL));

                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.addSubBooking, 'POST', JSON.stringify(input));

                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.freshBooking, 'POST', JSON.stringify(str));
    }

    function checkNavigation(input) {
        var output;
        vmsService.vmsApiServiceType(function(result) {
            if (result) {
                output = result.statusMsg;
                if (output) {
                    // to Reset Navigation check FLag
                    nsBooking.resetFlagSubBookingLevel();
                    nsCore.showAlert(nsBooking.createSubMsg);
                } else {
                    nsCore.showAlert(nsBooking.failed);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.addSubBooking, 'POST', JSON.stringify(input));
    }

    function getBLStatusClassName(BLStatus) {
        var className = '';
        if (BLStatus === '50' || BLStatus === '21' || BLStatus === '51') {
            className = 'manifested ';
        } else if (BLStatus === '40') {
            className = 'issued';
        } else {
            if (BLStatus === '20' || BLStatus === '30' || BLStatus === '31') {
                className = 'made';
            }
        }
        return className;
    }

    function subBookingDetails(input) {
        vmsService.vmsApiServiceType(function(result) {
            var output,
                cargoTextVal = 'New Sub Booking',
                subBookCount = parseInt($('.mainSubBookingCount').text()) + 1,
                canRemove = (result.isSubBookingRemovable === 'Y' ?
                    'rowRemoveIcon' : 'rowRemoveDisabledIcon'),
                originalLen = 4,
                BLStatus, k, subTitle,
                lengthNo = originalLen - result.subBookingNo.length,
                appe = '',
                className = '';
            if (result) {

                nsBooking.mainBookingFlag.changedOriginDest = false;
                output = result.statusMsg;
                if (output === 'true') {
                    if (!result.cargoText && $.trim(result.cargoText) !== '') {
                        cargoTextVal = result.cargoText;
                    }
                    $('.mainSubBookingCount').text(subBookCount);
                    for (k = 0; k < lengthNo; k++) {
                        appe += '0';
                    }
                    if (result.billOfLadingModel !== null) {
                        BLStatus = result.billOfLadingModel.bolStatus;
                        className = getBLStatusClassName(BLStatus);
                    }
                    subTitle = appe + result.subBookingNo + '-' + result.bookedUnits + '-' + cargoTextVal;
                    $('.mainSubBookingListWrap .subBookContentListCol .newBookLabel.treeListLabel')
                        .remove();
                    $('.mainSubBookFormTitle').val(subTitle);
                    $('.mainSubBookingListWrap .subBookContentListCol')
                        .append(
                            '<div data-subbookingid="' + result.subBookingId +
                            '" data-bookingId="' + $('#bookingHeaderId').val() +
                            '" data-filtering="' + subTitle +
                            '" class="cargoVin billVin singleColItem activeSubBook ui-selecting">' +
                            '<span class="title">' + subTitle + '</span><div class="mainBookingItemIcons">' +
                            '<span class=" icons_sprite existingVin ' + className + '"></span>' +
                            '<span class="icons_sprite subBookingInlineMenu roundDownArrowIcon fa fa-chevron-down"></span>' +
                            '<span id="subbookingRemoveIcon" name="subbookingRemoveIcon" class="icons_sprite ' +
                            canRemove + ' subbookingRemoveIcon fa fa-remove"></span></div></div>');
                    // to Reset Navigation check FLag
                    nsBooking.resetFlagSubBookingLevel();
                    nsBooking.loadSubbookingContent(result);
                } else {
                    nsCore.showAlert(nsBooking.failed);
                }

            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.addSubBooking, 'POST', JSON.stringify(input));
    }

    function chargeTypeSelectMsg(chargeTypeMsg, prepaidMsg, chargeBasisMsg, rateMsg, curencyMsg) {
        var chargeTypeValue = unescape($(this).find('#chargeType').val()),
            prepaidValue = $(this).find('#chargePayment').val(),
            chargeBasisValue = $(this).find('.chargeBasis').val(),
            rateValue = $(this).find('#chargeRate').val(),
            curencyValue = $(this).find('#chargeCurrency').val(),
            validateFloat, obj = {};
        chargeTypeMsg = ((!chargeTypeValue) ? 'Charge type is not selected \n' : '');
        prepaidMsg = ((!prepaidValue) ? 'Charges Payment is not selected \n' : '');
        chargeBasisMsg = ((!chargeBasisValue) ? 'Charges Basis is not selected \n' : '');
        rateMsg = ((!rateValue) ? 'Charges Rate should not be empty \n' :
            validateFloat('Charges Rate', rateValue, 10, 4));
        curencyMsg = ((!curencyValue) ? 'Charges Currency is not selected \n' : '');
        obj = {
            'chargeTypeMsg': chargeTypeMsg,
            'prepaidMsg': prepaidMsg,
            'rateMsg': rateMsg,
            'curencyMsg': curencyMsg,
            'chargeBasisMsg': chargeBasisMsg
        }
        return obj
    }

    function dimensionValidDetails(isDisabled, isBkdLenEmpty, bookedLength, isBkdWidEmpty,
        msg, bookedWidth, isBkdHeiEmpty, isBkdAreaEmpty, bookedArea,
        bookedHeight, isBkdVolEmpty, bookedVolume, validateFloat) {
        isDisabled = $('#subBlen').is('[disabled=disabled]');
        if (!isDisabled) {
            isBkdLenEmpty = (!bookedLength);
            msg = msg +
                +isBkdLenEmpty ? 'Booked Length should not be empty \n' :
                validateFloat('Booked Length', bookedLength, 4, 6);
        }
        isDisabled = $('#subBWid').is('[disabled=disabled]');
        if (!isDisabled) {
            isBkdWidEmpty = (bookedWidth === '' || bookedWidth === null);
            msg = msg +
                isBkdWidEmpty ? 'Booked Width should not be empty \n' :
                validateFloat('Booked Width', bookedWidth, 4, 6);
        }
        isDisabled = $('#subBHei').is('[disabled=disabled]');

        if (!isDisabled) {
            isBkdHeiEmpty = (bookedHeight === '' || bookedHeight === null);
            msg = msg + isBkdHeiEmpty ? 'Booked Height should not be empty \n' :
                validateFloat('Booked Height', bookedHeight, 4, 6);
        }
        isDisabled = $('#bookedArea').is('[disabled=disabled]');

        if (!isDisabled) {
            isBkdAreaEmpty = (bookedArea === '' || bookedArea === null);
            msg = msg +
                isBkdAreaEmpty ? 'Booked Area should not be empty \n' :
                validateFloat('Booked Area', bookedArea, 8, 12);
        }
        isDisabled = $('#subBVol').is('[disabled=disabled]');

        if (!isDisabled) {
            isBkdVolEmpty = (bookedVolume === '' || bookedVolume === null);
            msg = msg +
                isBkdVolEmpty ? 'Booked Volume should not be empty \n' :
                validateFloat('Booked Volume', bookedVolume, 8, 18);
        }
    }

    function dimensionValidData(msg, basis, freightedLength, isBkdAreaEmpty,
        bookedArea, isBkdVolEmpty, bookedVolume, validateFloat) {
        msg = msg + ((freightedLength === '' && basis === 'LM') ?
            'The values applied for consignment makes the calculated freight zero\n' : '');
        isBkdAreaEmpty = (bookedArea === '' || bookedArea === null);
        msg = msg +
            isBkdAreaEmpty ? 'Booked Area should not be empty \n' :
            validateFloat('Booked Area', bookedArea, 8, 12);
        isBkdVolEmpty = (bookedVolume === '' || bookedVolume === null);
        msg = msg +
            isBkdVolEmpty ? 'Booked Volume should not be empty \n' :
            validateFloat('Booked Volume', bookedVolume, 8, 18);
    }

    function multipleLegBooking(selectedLeg, consLegs) {
        var allocationStatus = $('#bookingAllocStatus').val(),
            cargoConsignments, carrier = '',
            shippedOn = 'N',
            oTable = $('#routeDetailGrid').DataTable(),
            rowData = oTable.row($('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(),
            loadPortCallVoyageId = rowData.loadPortCallVoyageId,
            portPair = {
                sourcePortCallID: (loadPortCallVoyageId === 'null' ||
                    loadPortCallVoyageId === null ? '' : loadPortCallVoyageId)
            },
            subBookingId = $('.subBookContentListCol').find('.ui-selecting').attr('data-subbookingid');
        // multiple leg
        $(selectedLeg).each(function() {
            var discPortCode = $(this).find('.discPortCode').text(),
                loadPortCode = $(this).find('.loadPortCode').text(),
                loadPortCalVoyID = $(this).find('.sourcePortCallID').val(),
                discPortCallVoyageId = $(this).find('.destinationPortCallID').val(),
                consType = $(this).find('.consignmentTransType').val(),
                loadPortObj = {
                    portCode: loadPortCode
                },
                destinationPortObj = {
                    portCode: discPortCode
                };
            consLegs.push({
                loadPort: loadPortObj,
                destinationPort: destinationPortObj,
                loadPortCallVoyageId: loadPortCalVoyID,
                discPortCallVoyageId: discPortCallVoyageId,
                wayCargo: 'N',
                comment: $('input[name$="bookingComments"]').val(),
                isFirm: allocationStatus,
                transpType: $('#voyageTransportationType').val(),
                carrierName: carrier,
                carrierRef: $('#voyageCarrierRef').val(),
                estimatedArrival: $('#estimatedArrival').val(),
                departureDate: $('#estimatedDeparture').val(),
                shippedOnBoard: shippedOn,
                cargoConsignmentList: cargoConsignments,
                portPair: portPair,
                id: '0',
                consignmentType: consType,
                consignmentId: subBookingId,
                isNewLeg: 'Y'
            });
        });
    }

    function loadDataObj(consLegs) {
        var loadPort = {
                portCode: ''
            },
            carrier = '',
            shippedOn = 'N',
            cargoConsignments,
            oTable = $('#routeDetailGrid').DataTable(),
            rowData = oTable.row($('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(),
            loadPortCallVoyageId = rowData.loadPortCallVoyageId,
            discPortCallVoyageId = rowData.discPortCallVoyageId,
            allocationStatus = $('#bookingAllocStatus').val(),
            destinationPort = {
                portCode: ''
            },
            portPair = {
                sourcePortCallID: (loadPortCallVoyageId === 'null' ||
                    loadPortCallVoyageId === null ? '' : loadPortCallVoyageId)
            },
            subBookingId = $('.subBookContentListCol').find('.ui-selecting').attr('data-subbookingid');
        consLegs.push({
            loadPort: loadPort,
            destinationPort: destinationPort,
            loadPortCallVoyageId: loadPortCallVoyageId,
            discPortCallVoyageId: discPortCallVoyageId,
            wayCargo: 'N',
            comment: $('input[name$="bookingComments"]').val(),
            isFirm: allocationStatus,
            transpType: $('#voyageTransportationType').val(),
            carrierName: carrier,
            carrierRef: $('#voyageCarrierRef').val(),
            estimatedArrival: $('#estimatedArrival').val(),
            departureDate: $('#estimatedDeparture').val(),
            shippedOnBoard: shippedOn,
            cargoConsignmentList: cargoConsignments,
            portPair: portPair,
            id: '0',
            consignmentType: 'M',
            consignmentId: subBookingId,
            isNewLeg: 'Y'
        });
    }

    function unCheckPossibleVoyg(consLegs) {
        var carrier = '',
            shippedOn = 'N',
            cargoConsignments,
            oTable = $('#routeDetailGrid').DataTable(),
            rowData = oTable.row($('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(),
            loadPortCallVoyageId = rowData.loadPortCallVoyageId,
            allocationStatus = $('#bookingAllocStatus').val(),
            portPair = {
                sourcePortCallID: (loadPortCallVoyageId === 'null' ||
                    loadPortCallVoyageId === null ? '' : loadPortCallVoyageId)
            },
            subBookingId = $('.subBookContentListCol').find('.ui-selecting').attr('data-subbookingid'),
            noPossibleSelection = $('.noPossibleVoyage:checked'),
            loadPortObjPoss = {
                portCode: $('#mainBookDetailCustomerOrigin').val()
            },
            destinationPortObjPoss = {
                portCode: $('#mainBookDetailCustomerDestination').val()
            };
        if (noPossibleSelection.length > 0) {
            consLegs.push({
                loadPort: loadPortObjPoss,
                destinationPort: destinationPortObjPoss,
                loadPortCallVoyageId: '0',
                discPortCallVoyageId: '0',
                wayCargo: 'N',
                comment: $('input[name$="bookingComments"]').val(),
                isFirm: allocationStatus,
                transpType: $('#voyageTransportationType').val(),
                carrierName: carrier,
                carrierRef: $('#voyageCarrierRef').val(),
                estimatedArrival: $('#estimatedArrival').val(),
                departureDate: $('#estimatedDeparture').val(),
                shippedOnBoard: shippedOn,
                cargoConsignmentList: cargoConsignments,
                portPair: portPair,
                id: '0',
                consignmentType: 'M',
                consignmentId: subBookingId,
                isNewLeg: 'Y'
            });
        }
    }

    function makeModelList(modelListObj, data, response) {
        modelListObj = JSON.parse(JSON.stringify(nsBooking.normalGridOpts));
        modelListObj.dom = '<t>';
        modelListObj.scrollCollapse = true;
        modelListObj.scrollX = true;
        modelListObj.scrollY = 200;
        modelListObj.data = response;
        modelListObj.bAutoWidth = false;
        modelListObj.columns = [{
            'render': function() {
                return '<input type="radio" name="selectMakeModel" value="">';
            }
        }, {
            data: 'make'
        }, {
            data: 'model'
        }, {
            data: 'yearOfManu'
        }, {
            data: 'cargoDescription'
        }, {
            data: 'cargoText'
        }, {
            data: 'dimensionText'
        }, {
            data: 'length'
        }, {
            data: 'width'
        }, {
            data: 'height'
        }, {
            data: 'weight'
        }, {
            data: 'area'
        }, {
            data: 'volume'
        }];
    }
    $.extend(true, nsBooking, helperObj);
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);