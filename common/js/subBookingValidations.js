/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, nsCore, nsDoc, nsBookDoc){
    var freight = 0, length = 0,width = 0,height = 0,
        area = 0,weight = 0,volume = 0,
        perUnit = 0,isPerUnit = 0,scale = 0,
        bookingValObj = {
            'isTotalSelected':isTotalSelected,
            'freightWeight':freightWeight,
            'bookWeight':bookWeight,
            'convertFloat':convertFloat,
            'freightArea':freightArea,
            'freightVolume':freightVolume,
            'findCargoType':findCargoType,
            'findCargoText':findCargoText,
            'findCargoState':findCargoState,
            'findModelText':findModelText,
            'findDocID':findDocID,
            'findBookedUnits':findBookedUnits,
            'findCargoOnHold':findCargoOnHold,
            'findBookingID':findBookingID,
            'findMilCargo':findMilCargo,
            'findHazCargo':findHazCargo,
            'findAttribute':findAttribute,
            'findWayCargo':findWayCargo,
            'findComments':findComments,
            'findDocumentationCode':findDocumentationCode,
            'findAllocationStatus':findAllocationStatus,
            'findReserveEquip':findReserveEquip,
            'findShipOnBoard':findShipOnBoard,
            'findBookType':findBookType,
            'findBookLength':findBookLength,
            'findBookWidth':findBookWidth,
            'findBookHeight':findBookHeight,
            'findBookWeight':findBookWeight,
            'findBookArea':findBookArea,
            'findActLength':findActLength,
            'findActWidth':findActWidth,
            'findActHeight':findActHeight,
            'findActWeight':findActWeight,
            'findActArea':findActArea,
            'findActVolume':findActVolume,
            'findActType':findActType,
            'findUnitsType':findUnitsType,
            'findBookVolume':findBookVolume,
            'findFrType':findFrType,
            'findFrLength':findFrLength,
            'findFrWidth':findFrWidth,
            'findFrHeight':findFrHeight,
            'findFrWeight':findFrWeight,
            'findFrArea':findFrArea,
            'findFrVolume':findFrVolume,
            'findFrPerUnit':findFrPerUnit,
            'findBookPerUnit':findBookPerUnit,
            'findChargeContent':findChargeContent,
            'findFreightBasis':findFreightBasis,
            'findFreightCurrency':findFreightCurrency,
            'findFreightRate':findFreightRate,
            'findFreightTotal':findFreightTotal,
            'findFreightPayment':findFreightPayment,
            'findFreightCommision':findFreightCommision,
            'findMarksAndNumbers':findMarksAndNumbers,
            'findCargoDescription':findCargoDescription,
            'findEuipNo':findEuipNo,
            'findEquipType':findEquipType,
            'findTransportationType':findTransportationType,
            'findCarrierId':findCarrierId,
            'findCarrier':findCarrier,
            'findCarrierRef':findCarrierRef,
            'findEstimatedArrival':findEstimatedArrival,
            'findEstimatedDepart':findEstimatedDepart,
            'findSourcePortID':findSourcePortID,
            'findDestiPortID':findDestiPortID,
            'findLegCount':findLegCount,
            'areaVolumeValidate':areaVolumeValidate,
            'lenWidHeiValidate':lenWidHeiValidate,
            'heightValidate':heightValidate,
            'dimensionValidate':dimensionValidate,
            'validateWeight':validateWeight,
            'frLenWidHeiValidate':frLenWidHeiValidate,
            'frieghtDimValidate':frieghtDimValidate,
            'frAreaVolCheck':frAreaVolCheck,
            'frArVolValidate':frArVolValidate,
            'validateFrWeight':validateFrWeight,
            'getBkdVolume':getBkdVolume,
            'isValidWeigVolArea':isValidWeigVolArea,
            'booktotalSelected':booktotalSelected,
            'updateBookDims':updateBookDims,
            'updateFreDims':updateFreDims,
            'frperUnitSelected':frperUnitSelected,
            'getNewVolume':getNewVolume,
            'getNewArea':getNewArea,
            'getSBVolume':getSBVolume,
            'getAreaInImp':getAreaInImp,
            'isValidLengthWidth':isValidLengthWidth,
            'setWeightValue':setWeightValue,
            'isValidBookedUnits':isValidBookedUnits,
            'frtotalSelected':frtotalSelected,
            'bookenableDisableDims':bookenableDisableDims,
            'frenableDisableDims':frenableDisableDims,
            'getOrigDestCargoTxtNsg':getOrigDestCargoTxtNsg,
            'getFreightRateMsg':getFreightRateMsg,
            'validateAttribute':validateAttribute,
            'getLoadPortIds':getLoadPortIds,
            'getChargeMessage':getChargeMessage,
            'isChargeRowAvailable':isChargeRowAvailable,
            'isVoyageSelected':isVoyageSelected,
            'calcAllocNeeded':calcAllocNeeded,
            'checkForAvlAlloc':checkForAvlAlloc,
            'checkAvailAllocSpace':checkAvailAllocSpace,
            'isAllFieldsEmpty':isAllFieldsEmpty,
            'isEnableRateButton':isEnableRateButton,
            'isEnableCrgListButton':isEnableCrgListButton,
            'isEnableChargeButton':isEnableChargeButton,
            'popCargoConsDet':popCargoConsDet,
            'crgGripCom':crgGripCom,
            'isChargeRowNotAvl':isChargeRowNotAvl,
            'getActualLength':getActualLength
        };
    if(!nsBooking){nsBooking=nsDoc}
function isTotalSelected(len, wid, hei, ttlArea, ttlVolume) {
    var temp = (ttlArea || ttlVolume ) && !len && !wid && !hei;
    return temp;
}
function freightWeight(ele) {
    freight = $(ele).val();
    $(ele).val(freight ? parseFloat(freight).toFixed(3) : '');
}
function bookWeight(ele) {
    freight = $(ele).val();
    $(ele).val(freight ? parseFloat(freight).toFixed(3) : '');
}
function convertFloat(ele) {
    var floatValue = $(ele).val();
    $(ele).val(floatValue ? parseFloat(floatValue).toFixed(3) : '');
}
function freightArea(ele) {
    var bookedUnits;
    length = parseFloat(findFrLength(ele));
    width = parseFloat(findFrWidth(ele));
    if ($.isNumeric(length) && $.isNumeric(width) && (length) && (width)) {
        area = math.eval (length * width);
        scale = findFrType(ele);
        area = getAreaInImp(area, scale);
        perUnit = findFrPerUnit(ele);
        isPerUnit = false;
        if (perUnit === 'YES') {
            isPerUnit = true;
        }
        if (!isPerUnit) {
            bookedUnits = $('#totalBookedUnits').val();
            area = math.eval(area * bookedUnits);
        }
        area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
        $(ele).closest('.mainSubBookingFormWrap').find('#freightedArea').val(area);
    } else {
        $(ele).closest('.mainSubBookingFormWrap').find('#freightedArea').val('');
    }
}
function freightVolume(ele) {
    var bookedUnits;
    length = parseFloat(findFrLength(ele));
    width = parseFloat(findFrWidth(ele));
    height = parseFloat(findFrHeight(ele));
    if ($.isNumeric(length) && $.isNumeric(width) && $.isNumeric(height) && (length) && (width)
        && (height)) {      
        volume = nsCore.volumeCalc(length,width,height);        	
        scale = findFrType(ele);
        if (scale === '10') {
            volume = math.eval(volume / 1728);
        }
       perUnit = findFrPerUnit(ele);
       isPerUnit = false;
        if (perUnit === 'YES') {
            isPerUnit = true;
        }
        if (!isPerUnit) {
            bookedUnits = $('#totalBookedUnits').val();
            volume = volume * bookedUnits;
        }
        volume= Number(volume<0.000001?volume.toFixed(5): volume);
        volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
        $(ele).closest('.mainSubBookingFormWrap').find('#freightedVolume').val(volume);
    } else {
        $(ele).closest('.mainSubBookingFormWrap').find('#freightedVolume').val('');
    }
}
function findCargoType(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookingCargoType').val();
}
function findCargoText(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookingCargoText').val().trim();
}
function findCargoState(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookingCargoState').val();
}
function findModelText(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookingCargoMake').val().trim();
}
function findDocID() {
    return $('#bookingDocOfficeId').val();
}
function findBookedUnits(element) {
    return $('#totalBookedUnits').val();
}
function findCargoOnHold(element) {
    var onHoldVal = $(element).closest('.mainSubBookingFormWrap').find('#subCOH').val();
    if (onHoldVal === 'on') {
        return 'Y';
    } else {
        return 'N';
    }
}
function findBookingID(element) {
    var curSelectedBooking = ($('.mainBookListCol').find('.scndLevel.activeSubBook').length > 0 ?
    		$('.mainBookListCol').find('.scndLevel.activeSubBook').attr('data-bookingid') :
    			$($('.thrdLevel.activeNavigationItem')[0].previousElementSibling).attr('data-bookingid'));
    return curSelectedBooking;
}
function findMilCargo(element) {
    var milVal = $(element).closest('.mainSubBookingFormWrap').find('#subMilCar').val();
    if (milVal === 'on') {
        return 'Y';
    } else {
        return 'N';
    }
}
function findHazCargo(element) {
    var hazVal = $(element).closest('.mainSubBookingFormWrap').find('#subHazCar').val();
    if (hazVal === 'on') {
        return 'Y';
    } else {
        return 'N';
    }
}
function findAttribute(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#subAttr').val();
}
function findWayCargo(element) {
    var cargoVal = $(element).closest('.mainSubBookingFormWrap').find('#subWayCar').val();
    if (cargoVal === 'on') {
        return 'Y';
    } else {
        return 'N';
    }
}
function findComments(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookingComments').val();
}
function findDocumentationCode(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('').val();
}
function findAllocationStatus(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookingAllocStatus').val();
}
function findReserveEquip(element) {
    var equipVal = $('.mainSubBookingFormWrap').find('#resEquip').val();
    if (equipVal === 'on') {
        return 'Y';
    } else {
        return 'N';
    }
}
function findShipOnBoard(element) {
	var shipVal = $(element).closest('.mainSubBookingFormWrap').find('#shippedOnboard').prop('checked');
	if (shipVal === true) {
        return 'Y';
    } else {
        return 'N';
    }
}
function findBookType(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookedMeasureUnit').val();
}
function findBookLength(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#subBlen').val();
}
function findBookWidth(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#subBWid').val();
}
function findBookHeight(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#subBHei').val();
}
function findBookWeight(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#subBWei').val();
}
function findBookArea(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val();
}
function findActLength(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualLength').val();
}
function findActWidth(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualWidth').val();
}
function findActHeight(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualHeigth').val();
}
function findActWeight(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualWeight').val();
}
function findActArea(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualArea').val();
}
function findActVolume(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualVolume').val();
}
function findActType(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#actualMeasureUnit').val();
}
function findUnitsType(value) {
    return value ? 'YES' : 'NO';
}
function findBookVolume(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val();
}
function findFrType(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedMeasureUnit').val();
}
function findFrLength(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedLength').val();
}
function findFrWidth(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedWidth').val();
}
function findFrHeight(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedHeight').val();
}
function findFrWeight(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedWeight').val();
}
function findFrArea(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val();
}
function findFrVolume(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val();
}
function findFrPerUnit(element) {
    return findUnitsType($(element).closest('.mainSubBookingFormWrap').find('#freightedUnit')
        .find('#shipInfovalidStatus').is(':checked'));
}
function findBookPerUnit(element) {
    return findUnitsType($(element).closest('.mainSubBookingFormWrap').find('#bookedUnit').find('#shipInfovalidStatus')
        .is(':checked'));
}
function findChargeContent(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('').val();
}
function findFreightBasis(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightBasis').val();
}
function findFreightCurrency(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightCurrency').val();
}
function findFreightRate(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightRate').val();
}
function findFreightTotal(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightFreight').val();
}
function findFreightPayment(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightPayment').val();
}
function findFreightCommision(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightCommission').val();
}
function findMarksAndNumbers(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#cargoMarkNumbersIcon').val().trim();
}
function findCargoDescription(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#cargoDescriptionIcon').val();
}
function findEuipNo(element) {
    var eqNum = $(element).closest('.mainSubBookingFormWrap').find('#cargoEquipmentNbr').val();
    if (eqNum === '40%27%20mafi%20trailer') {
        return 'MTRU 414121';
    } else {
        return 'AHBU580001-';
    }
}
function findEquipType(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#cargoEquipmentType').val();
}
function findTransportationType(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#voyageTransportationType').val();
}
function findCarrierId(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#voyageCarrier').val();
}
function findCarrier(element) {
    if (findCarrierId(element) === '12') {
        return $(element).closest('.mainSubBookingFormWrap').find('.carrierOtherDetails').val();
    } else {
        return '';
    }
}
function findCarrierRef(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#voyageCarrierRef').val();
}
function findEstimatedArrival(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#estimatedArrival').val();
}
function findEstimatedDepart(element) {
    return $(element).closest('.mainSubBookingFormWrap').find('#estimatedDeparture').val();
}
function findSourcePortID(element) {
	element = '#mainBookDetailCustomerOrigin';
    return $(element).val();
}
function findDestiPortID(element) {
	element = '#mainBookDetailCustomerDestination';
    return $(element).val();
}
function findLegCount() {
    var trade1 = $('#mTrade1').val(),
        trade2 = $('#mTrade2').val(),
        trade3 = $('#mTrade3').val();
    if (!trade1) {
        return 0;
    } else {
        if (!trade2) {
            return 1;
        } else {
            if (!trade3) {
                return 2;
            } else {
                return 3;
            }
        }
    }
}
function areaVolumeValidate(element, message, isDisableCheck) {
    var bkArea = findBookArea(element),
        bkVolume = findBookVolume(element),
        isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').is('[disabled=disabled]');
    if ((!isDisabled) && (isDisableCheck)) {
        if (!bkArea) {
            message += 'Booked Area should not be empty' + '\n';
            nsBooking.isBkdAreaEmpty = true;
        } else {
            message += nsBooking.validateFloat('Booked Area', bkArea, 12, 8);
        }
    }
    isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#subBVol').is('[disabled=disabled]');
    if ((!isDisabled) && (isDisableCheck)) {
        if (!bkVolume) {
            message += 'Booked Volume should not be empty' + '\n';
            nsBooking.isBkdVolEmpty = true;
        } else {
            message += nsBooking.validateFloat('Booked Volume', bkVolume, 18, 8);
        }
    }
    return message;
}
function lenWidHeiValidate(element, message) {
    var bkLength = findBookLength(element),
        bkWidth = findBookWidth(element),
        isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#subBlen').is('[disabled=disabled]');
    if (!isDisabled) {
        if (!bkLength) {
            message += 'Booked Length should not be empty' + '\n';
            nsBooking.isBkdLenEmpty = true;
        } else {
            message += nsBooking.validateFloat('Booked Length', bkLength, 6, 8);
        }
    }
    isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#subBWid').is('[disabled=disabled]');
    if (!isDisabled) {
        if (!bkWidth) {
            message += 'Booked Width should not be empty' + '\n';
            nsBooking.isBkdWidEmpty = true;
        } else {
            message += nsBooking.validateFloat('Booked Width', bkWidth, 6, 8);
        }
    }
    return heightValidate(element, message);
}
function heightValidate(element, message) {
    var bkHeight = findBookHeight(element),
        isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#subBHei').is('[disabled=disabled]');
    if (!isDisabled) {
        if (!bkHeight) {
            message += 'Booked Height should not be empty' + '\n';
            nsBooking.isBkdHeiEmpty = true;
        } else {
            message += nsBooking.validateFloat('Booked Height', bkHeight, 6, 8);
        }
    }
    return message;
}
function dimensionValidate(element, message) {
    perUnit = findBookPerUnit(element);
    if (perUnit === 'YES') {
        message = lenWidHeiValidate(element, message);
        message = areaVolumeValidate(element, message, true);
    } else {
        message += (findFrLength(element) === '' && nsBooking.mainBookingFreightBasis === 'LM')
         ? 'The values applied for consignment makes the calculated freight zero\n' : '';
        message = areaVolumeValidate(element, message, false);
    }
    return validateWeight(element, message);
}
function validateWeight(element, message) {
    var bkWeight = findBookWeight(element);
    if (bkWeight === '') {
        message += 'Booked Weight should not be empty' + '\n';
        nsBooking.isBkdWeiEmpty = true;
    } else {
        message += nsBooking.validateFloat('Booked Weight', bkWeight, 14, 8);
    }
    return message;
}
function frLenWidHeiValidate(element, message) {
    var fbkLength = findFrLength(element),
        fbkWidth = findFrWidth(element),
        fbkHeight = findFrHeight(element),
        isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#freightedLength').is('[disabled=disabled]');
    if (!isDisabled && !nsBooking.isBkdLenEmpty) {
        message += (fbkLength === '') ? 'Freighted length should not be empty\n' :
            nsBooking.validateFloat('Freighted Length', fbkLength, 6, 8);
    }
    isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#freightedWidth').is('[disabled=disabled]');
    if (!isDisabled && !nsBooking.isBkdWidEmpty) {
        message += (fbkWidth === '') ? 'Freighted width should not be empty.\n' :
            nsBooking.validateFloat('Freighted Width', fbkWidth, 6, 8);
    }
    isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#freightedHeight').is('[disabled=disabled]');
    if (!isDisabled && !nsBooking.isBkdHeiEmpty) {
        message += (fbkHeight === '') ? 'Freighted height should not be empty.\n':
            nsBooking.validateFloat('Freighted Height', fbkHeight, 6, 8);
    }
    return message;
}
function frieghtDimValidate(element, message) {
    var fperUnit = findFrPerUnit(element);
    if (fperUnit) {
        message = frLenWidHeiValidate(element, message);
        message = frAreaVolCheck(element, message);
    } else {
        message = frArVolValidate(element, message);
    }
    return validateFrWeight(element, message);
}
function frAreaVolCheck(element, message) {
    var fbkArea = findFrArea(element),
        fbkVolume = findFrVolume(element),
        isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').is('[disabled=disabled]');
    if (!isDisabled && !nsBooking.isBkdAreaEmpty) {
        message += (fbkArea === '') ? 'Freighted area should not be empty.\n' :
            nsBooking.validateFloat('Freighted Area', fbkArea, 12, 8);
    }
    isDisabled = $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').is('[disabled=disabled]');
    if (!isDisabled && !nsBooking.isBkdVolEmpty) {
        message += (fbkVolume === '') ? 'Freighted volume should not be empty.\n' :
            nsBooking.validateFloat('Freighted Volume', fbkVolume, 18, 8);
    }
    return message;
}
function frArVolValidate(element, message) {
    var fbkArea = findFrArea(element), fbkVolume = findFrVolume(element);
    if (!nsBooking.isBkdAreaEmpty) {
        message += (fbkArea === '') ? 'Freighted area should not be empty.\n' :
            nsBooking.validateFloat('Freighted Area', fbkArea, 12, 8);
    }
    if (!nsBooking.isBkdVolEmpty) {
        message += (fbkVolume === '') ? 'Freighted volume should not be empty.\n' :
            nsBooking.validateFloat('Freighted Volume', fbkVolume, 18, 8);
    }
    return message;
}
function validateFrWeight(element, message) {
    var fbkWeight = findFrWeight(element);
    if (!nsBooking.isBkdWeiEmpty) {
        if (fbkWeight === '') {
            message += 'Freighted weight should not be empty.' + '\n';
            nsBooking.isBkdWeiEmpty = true;
        } else {
            message += nsBooking.validateFloat('Freighted Weight', fbkWeight, 14, 8);
        }
    }
    return message;
}
function getBkdVolume(element, bkdVolume, bookedUnits, bkdScale) {
   length = findBookLength(element);
   width = findBookWidth(element);
   height = findBookHeight(element);
    if ($.isNumeric(height) && (height !== '')) {
        bkdVolume = nsCore.volumeCalc(length , width , height);
        if (bkdScale === '10') {
            bkdVolume = bkdVolume / 1728;
        }
    } else {
        if (bkdVolume !== '' && $.isNumeric(width)) {
            bkdVolume /= bookedUnits;
        }
    }
    return bkdVolume;
}
function isValidWeigVolArea(valArea, valVolume, valWeight) {
    return valArea && valVolume && valWeight;
}
function booktotalSelected(element) {
    var bookedUnits,
        areaVal,
        volumeVal,
        weightVal;
    $(element).closest('.mainSubBookingFormWrap').find('#subBlen').attr('disabled', 'disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#subBWid').attr('disabled', 'disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#subBHei').attr('disabled', 'disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').removeAttr('disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#subBVol').removeAttr('disabled');
    bookedUnits = $('#totalBookedUnits').val();
    //if(nsBooking.bookedUnitsTotal === bookedUnits){
   // 	$(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val(nsBooking.bookedTotalArea);
   // 	$(element).closest('.mainSubBookingFormWrap').find('#subBVol').val(nsBooking.bookedTotalVolume);
   // 	$(element).closest('.mainSubBookingFormWrap').find('#subBWei').val(nsBooking.bookedTotalWeight);
   // } else 
    	if ((bookedUnits) && $.isNumeric(bookedUnits)) {
        area = $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val();
        if ((area)) {
            areaVal = math.eval(area * bookedUnits);
            areaVal = nsBookDoc.converToUpperDecimalOnFive(areaVal, 3).toFixed(3);
            $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val(areaVal);
        }
        volume = $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val();
        if ((volume)) {
            volumeVal = math.eval(volume * bookedUnits);
            volumeVal = nsBookDoc.converToUpperDecimalOnFive(volumeVal, 3).toFixed(3);
            $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val(volumeVal);
        }
        weight = $(element).closest('.mainSubBookingFormWrap').find('#subBWei').val();
        if ((weight)) {
            weightVal = math.eval(weight * bookedUnits);
            weightVal = weightVal.toFixed(0);
            $(element).closest('.mainSubBookingFormWrap').find('#subBWei').val(weightVal);
        }
    } else {
        $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val('');
        $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val('');
    }
}
function updateBookDims(element) {
    var perUnitE = $(element).closest('.mainSubBookingFormWrap').find('#bookedUnit').find('#shipInfovalidStatus'),
        isChecked = $(perUnitE).is(':checked');
    if (!isChecked) {
        booktotalSelected(perUnitE);
    }
}
function updateFreDims(element) {
    var perUnitE = $(element).closest('.mainSubBookingFormWrap').find('#freightedUnit').find('#shipInfovalidStatus'),
        isChecked = $(perUnitE).is(':checked');
    if (!isChecked) {
        frtotalSelected(perUnitE);
    }
}
function frperUnitSelected(element) {
    var bookedUnits = $('#totalBookedUnits').val();
    area = $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val();
    volume = $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val();
    weight = $(element).closest('.mainSubBookingFormWrap').find('#freightedWeight').val();
    if ((area) && (volume)) {
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').attr('disabled', 'disabled');
    } else {
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').removeAttr('disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').removeAttr('disabled');
    }
    nsBooking.frTotalArea = area;
    nsBooking.frTotalVolume = volume;
    nsBooking.frTotalWeight = weight;
    nsBooking.frUnitsTotal = bookedUnits;
    if (isValidBookedUnits(bookedUnits)) {
        length = findFrLength(element);
        width = findFrWidth(element);
        scale = findFrType(element);
        if (isValidLengthWidth(length, width)) {
            area = length * width;
            area = getAreaInImp(area, scale);
            volume = getSBVolume(element, volume, bookedUnits, scale);
            area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
            volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
        } else {
            area = getNewArea(area, bookedUnits);
            volume = getNewVolume(volume, bookedUnits);
        }
        setWeightValue(element, bookedUnits, weight);
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val(area);
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val(volume);
    } else {
        freightArea(element);
        freightVolume(element);
    }
    frenableDisableDims(element);
    nsBooking.calculateFreightTotal();
    nsBooking.updateChargeOnDimChange();
}
function getNewVolume(newVolume, bookedUnits) {
    if (newVolume !== '' && $.isNumeric(newVolume)) {
        newVolume /= bookedUnits;
        newVolume = newVolume.toFixed(3);
    }
    return newVolume;
}
function getNewArea(newArea, bookedUnits) {
    if (newArea !== '' && $.isNumeric(newArea)) {
        newArea /= bookedUnits;
        newArea = newArea.toFixed(3);
    }
    return newArea;
}
function getSBVolume(element, sBvolume, bookedUnits, sBscale) {
    length = findFrLength(element);
    width = findFrWidth(element);
    height = findFrHeight(element);
    if ($.isNumeric(height) && (height !== '')) {
        sBvolume = nsCore.volumeCalc(length , width , height);
        if (sBscale === '10') {
            sBvolume = sBvolume / 1728;
        }
    } else {
        if (sBvolume !== '' && $.isNumeric(sBvolume)) {
            sBvolume /= bookedUnits;
        }
    }
    return sBvolume;
}
function getAreaInImp(inImpArea, inImpScale) {
    if (inImpScale === '10') {
        inImpArea = inImpArea / 144;
    }
    return inImpArea;
}
function isValidLengthWidth(valLength, valWidth) {
    return $.isNumeric(valLength) && $.isNumeric(valWidth) && (valLength !== '') && (valWidth !== '');
}
function setWeightValue(element, bookedUnits, setWeight) {
    var weightVal;
    if ((setWeight !== '') && ($.isNumeric(setWeight))) {
        weightVal = setWeight / bookedUnits;
        weightVal = weightVal.toFixed(0);
        $(element).closest('.mainSubBookingFormWrap').find('#freightedWeight').val(weightVal);
    }
}
function isValidBookedUnits(bookedUnits) {
    var result = false;
    if ((bookedUnits) && $.isNumeric(bookedUnits)
        && (bookedUnits.trim() !== '0')) {
        result = true;
    }
    return result;
}
function frtotalSelected(element) {
    var bookedUnits = $('#totalBookedUnits').val(),
        areaVal, volumeVal, weightVal;
    $(element).closest('.mainSubBookingFormWrap').find('#freightedLength').attr('disabled', 'disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#freightedWidth').attr('disabled', 'disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#freightedHeight').attr('disabled', 'disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').removeAttr('disabled');
    $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').removeAttr('disabled');
   /* if(nsBooking.frUnitsTotal === bookedUnits){
    	$(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val(nsBooking.frTotalArea);
    	$(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val(nsBooking.frTotalVolume);
    	$(element).closest('.mainSubBookingFormWrap').find('#freightedWeight').val(nsBooking.frTotalWeight);
    } else */
    if ((bookedUnits) && $.isNumeric(bookedUnits)) {
         area = $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val();
        if (area) {
            areaVal = area * bookedUnits;
            areaVal = nsBookDoc.converToUpperDecimalOnFive(areaVal, 3).toFixed(3);
            $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val(areaVal);
        }
         volume = $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val();
        if (volume) {
            volumeVal = volume * bookedUnits;
            volumeVal = volumeVal.toFixed(3);
            $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val(volumeVal);
        }
         weight = $(element).closest('.mainSubBookingFormWrap').find('#freightedWeight').val();

        if (weight) {
            weightVal = weight * bookedUnits;
            weightVal = weightVal.toFixed(0);
            $(element).closest('.mainSubBookingFormWrap').find('#freightedWeight').val(weightVal);
        }
    } else {
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val('');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val('');
    }
    nsBooking.calculateFreightTotal();
    nsBooking.updateChargeOnDimChange();
}
function bookenableDisableDims(element) {
    length = $(element).closest('.mainSubBookingFormWrap').find('#subBlen').val();
    width = $(element).closest('.mainSubBookingFormWrap').find('#subBWid').val();
    height = $(element).closest('.mainSubBookingFormWrap').find('#subBHei').val();
    area = $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val();
    volume = $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val();
    perUnit = findBookPerUnit(element);
    isPerUnit = false;
    if (perUnit === 'YES') {
        isPerUnit = true;
    }
    if (((length !== '') || (width !== '') || (height !== '')) && isPerUnit) {
        $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#subBVol').attr('disabled', 'disabled');
    } else {
        $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').removeAttr('disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#subBVol').removeAttr('disabled');
    }
    if (isTotalSelected(length, width, height, area, volume)) {
        $(element).closest('.mainSubBookingFormWrap').find('#subBlen').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#subBWid').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#subBHei').attr('disabled', 'disabled');
    } else {
        if (isPerUnit) {
            $(element).closest('.mainSubBookingFormWrap').find('#subBlen').removeAttr('disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#subBWid').removeAttr('disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#subBHei').removeAttr('disabled');
        }
    }
}
function frenableDisableDims(element) {
    length = $(element).closest('.mainSubBookingFormWrap').find('#freightedLength').val();
    width = $(element).closest('.mainSubBookingFormWrap').find('#freightedWidth').val();
    height = $(element).closest('.mainSubBookingFormWrap').find('#freightedHeight').val();
    area = $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val();
    volume = $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val();
    perUnit = findFrPerUnit(element);
    isPerUnit = false;
    if (perUnit === 'YES') {
        isPerUnit = true;
    }
    if (((length !== '') || (width !== '') || (height !== '')) && isPerUnit) {
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').attr('disabled', 'disabled');
    } else {
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').removeAttr('disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').removeAttr('disabled');
    }
    if (isTotalSelected(length, width, height, area, volume)) {
        $(element).closest('.mainSubBookingFormWrap').find('#freightedLength').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedWidth').attr('disabled', 'disabled');
        $(element).closest('.mainSubBookingFormWrap').find('#freightedHeight').attr('disabled', 'disabled');
    } else {
        if (isPerUnit) {
            $(element).closest('.mainSubBookingFormWrap').find('#freightedLength').removeAttr('disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#freightedWidth').removeAttr('disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#freightedHeight').removeAttr('disabled');
        }
    }
}

function getOrigDestCargoTxtNsg(element, message) {
    if (findSourcePortID(element) === '') {
        message += 'Origin should not be empty' + '\n';
    }
    if (findDestiPortID(element) === '') {
        message += 'Destination should not be empty' + '\n';
    }
    if (findCargoText(element) === '') {
        message += 'Cargo text should not be empty' + '\n';
    }
    return message;
}
function getFreightRateMsg(element, message) {
    var mainBookingFreightRate = $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightRate').val();
    if (mainBookingFreightRate === '') {
        message += 'Freight Rate should not be empty' + '\n';
    }
    return message;
}
function validateAttribute(element, message) {
    var newOrUsed = $(element).closest('.mainSubBookingFormWrap').find('#subAttr').val();
    if (newOrUsed.trim() === '') {
        message += 'New/Used is not selected' + '\n';
    }
    return message;
}
function getLoadPortIds(ids, loadPortID) {
    if (ids === '') {
        ids = loadPortID;
    } else {
        ids = ids + ',' + loadPortID;
    }
    return ids;
}
function getChargeMessage(cChrType, cBasis, cRate, message) {
    if (cChrType === '') {
        message += 'Charge type is not selected' + '\n';
    }
    if (cBasis === '') {
        message += 'Charges Basis is not selected' + '\n';
    }
    if (cRate === '') {
        message += 'Charges Rate should not be empty' + '\n';
    }
    return message;
}
function isChargeRowAvailable
    (cChrType, cBasis, cRate, chComment, includeGrossFr, includeSubBook, defaultCurrencyCode, cCur, cPayment) {
    var result = false;
    if ((cChrType !== '') || (cBasis !== '') || (cRate !== '') || (chComment !== '') || (includeGrossFr === 'Y')
        || (includeSubBook === 'Y') || (defaultCurrencyCode !== cCur) || (cPayment === 'C')) {
        result = true;
    }
    return result;
}
function isVoyageSelected(isViss, noVoyageSelected) {
    var result = false;
    if (isViss) {
        nsBooking.fnoVoyage = false;
    }
    if ((!nsBooking.fnoVoyage) && (!(noVoyageSelected))) {
        result = true;
    }
    return result;
}
function calcAllocNeeded(element, allocArea, bookedUnits, finalVal) {
    if (findBookPerUnit(element) === 'NO') {
        allocArea = allocArea / bookedUnits;
    }
    finalVal = allocArea * bookedUnits;
    if (findBookType(element) === '10') {
        finalVal = parseFloat(finalVal / (3.28083 * 3.28083));
    }
    return finalVal;
}
function checkForAvlAlloc(spaceNeeded, spaceAvailable) {
     var message = '';
    if (spaceNeeded > spaceAvailable) {
        message = 'The sub booking(s) can not be saved because of lack of allocated space.'
            +'Save as reserve and allocate needed space on the voyage';
    }
    return message;
}
function checkAvailAllocSpace(cargoGrp, bookedUnits, responseAllocValue, element, chkAllocArea) {
    var finalVal, message = '',responseAlloc=responseAllocValue.responseData;
    if(responseAllocValue.responseCode==='27'){
    	message=responseAllocValue.responseDescription;
    }
    else if (('CA' === cargoGrp) || ('PU' === cargoGrp)) {
        if (responseAlloc ===null || bookedUnits > responseAlloc.bookedVolume) {
            message = 'The sub booking(s) can not be saved because of lack of allocated space.'
                +'Save as reserve and allocate needed space on the voyage';
        }
    } else {
        if (('HH' === cargoGrp) || ('ST' === cargoGrp)) {
            if (findBookPerUnit(element) === 'NO') {
                chkAllocArea = chkAllocArea / bookedUnits;
            }
            finalVal = chkAllocArea * bookedUnits;
            if (findBookType(element) === '10') {
                finalVal = parseFloat(finalVal / (3.28083 * 3.28083));
            }
            if (responseAlloc ===null || finalVal > responseAlloc.bookedVolume) {
                message = 'The sub booking(s) can not be saved because of lack of allocated space.'
                    +'Save as reserve and allocate needed space on the voyage';
            }
        }
    }
    return message;
}
function isAllFieldsEmpty(origin, destination, bookedUnits, bkWeight, bkArea, bkVolume, cargoType, cargoState, isNew) {
    var result = false;
    if ((origin === '') || (destination === '') || (bookedUnits === '') || (bkWeight === '') || (bkArea === '')
        || (bkVolume === '') || (cargoType === '') || (cargoState === '') || (isNew === '')) {
        result = true;
    }
    return result;
}
function isEnableRateButton(isEnable) {
	var currUrl = window.location.href;
	if(currUrl.indexOf('/documentation/') === -1){
		isEnable = nsBooking.rateLinkAccessFlag;
	}
	else{
		isEnable = nsDoc.rateLinkAccessFlag;
	}
    if (isEnable) {
        $('.mainSubBookingFormWrap').find('#bookingRateListLink').removeAttr('disabled');
        $('.mainSubBookingFormWrap').find('#bookingRateListLink').removeClass('disabledBut');
    } else {
        $('.mainSubBookingFormWrap').find('#bookingRateListLink').attr('disabled', 'disabled');
        $('.mainSubBookingFormWrap').find('#bookingRateListLink').addClass('disabledBut');
    }
}
function isEnableCrgListButton(isEnable) {
    if (isEnable) {
        $('.mainSubBookingFormWrap').find('#cargoListLink').removeAttr('disabled');
        $('.mainSubBookingFormWrap').find('#cargoListLink').removeClass('disabledBut');
    }
}
function isEnableChargeButton(isEnable) {
    if (isEnable) {
        $('.mainSubBookingFormWrap').find('#addNewChargeHist').removeAttr('disabled');
        $('.mainSubBookingFormWrap').find('#addNewChargeHist').removeClass('disabledBut');
    } else {
        $('.mainSubBookingFormWrap').find('#addNewChargeHist').attr('disabled', 'disabled');
        $('.mainSubBookingFormWrap').find('#addNewChargeHist').addClass('disabledBut');
    }
}
function popCargoConsDet(ele) {
    var dataLoaded = ele.find('#dataLoaded').val(),
        dataReceived = ele.find('#dataReceived').val(),
        docReceiptNbr = ele.find('#docReceiptNbr').val(),
        equipmentNbr = '', equipmentType = ele.find('#equipmentType').val(),
        cargoConsid = ele.find('#cargoConsId').val(),
        cargoConsignment = {},
        cargoOnHold = ele.find('#cargoHoldOn').prop('checked') ? 'Y' : 'N'; // VMS
    if (!ele.find('#newEquipmentNum option:selected').val()) {
        equipmentNbr = '';
    } else {
        equipmentNbr = ele.find('#newEquipmentNum option:selected').text();
    }
    cargoConsignment = {
        id : cargoConsid,
        dateLoaded : new Date(dataLoaded),
        dateReceived : new Date(dataReceived),
        docReceiptNo : docReceiptNbr,
        equipNo : equipmentNbr,
        equipType : equipmentType,
        cargoOnHold : cargoOnHold
    };
    return cargoConsignment;
}
function crgGripCom(cargoGrp, message, bookedUnits, fcarReAvl, fpuReAvl, element, cargGripArea,
        fhhReAvl, fstReAvl,otherSubBooking, finalVal) {
    if ('CA' === cargoGrp) {
        message = checkForAvlAlloc(bookedUnits, fcarReAvl);
    } else if ('PU' === cargoGrp) {
        message = checkForAvlAlloc(bookedUnits, fpuReAvl);
    } else if ('HH' === cargoGrp) {
        finalVal = calcAllocNeeded(element, cargGripArea, bookedUnits, finalVal);
        message = checkForAvlAlloc(finalVal, fhhReAvl);
    } else {
        if ('ST' === cargoGrp) {
            finalVal = calcAllocNeeded(element, cargGripArea, bookedUnits, finalVal);
            message = checkForAvlAlloc(finalVal, fstReAvl);
        }
    }
    if (message.trim() !== '') {
        nsCore.showAlert(message.trim());
        return;
    } else {
        nsBooking.doFresSub(element, otherSubBooking);
        return;
    }
}
function isChargeRowNotAvl(chargeTypeValue, chargeBasisValue, isEmptyRateValue, rateValue, commentValue, inclGross,
    inclAllSubBook, curencyValue, defaultCurrencyCode, prepaidValue) {
    return chargeTypeValue === '' && chargeBasisValue === '' && isEmptyRateValue(rateValue) && commentValue === ''
        && inclGross === 'N' && inclAllSubBook === 'N' && curencyValue === defaultCurrencyCode && prepaidValue === 'P';
}
function getActualLength(element) {
    var actualLength = '';
    if ($(element).attr('data-actualLength') !== null || $(element).attr('data-actualLength') !== 'null') {
        actualLength = $(element).attr('data-actualLength');
    }
    return actualLength;
}
$.extend(true, nsBooking, bookingValObj);
})(this.booking, jQuery, this.core, this.doc, this.bookDoc);