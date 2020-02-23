/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsDoc, nsBookDoc) {
    var qbObj = {};
	if(!nsBooking){ nsBooking=nsDoc;}
    function getLoadPort() {
        return nsBooking.mainSrcPort;
    }

    function getDischargePort() {
        return nsBooking.maindestPort;
    }

    function getOriginCode() {
        return $('#origin').val();
    }

    function getDestinationCode() {
        return $('#destination').val();
    }

    function getContract() {
        return $('#contract').val();
    }

    function getCargoType(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#cargoType').val();
    }

    function getCargoState(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#cargoState').val();
    }

    function getHeight(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#bkHeight').val();
    }

    function getVolume(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#bkVolume').val();
    }

    function getWeight(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#bkWeight').val();
    }

    function getIsNewCargo(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#newCargo').val();
    }

    function getFrBasis(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#freightAreaBasis').val();
    }

    function getFrRate(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#freightAreatRate').val();
    }

    function getFrTotal(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#freightAreatTot').val();
    }

    function getBkQuantity(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#bookedUnits').val();
    }

    function getDScale(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#dimensionType').val();
    }

    function getLength(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#bkLength').val();
    }

    function getIsPerUnit(curElement) {
        return $(curElement).closest('.subBookingCalculation').find('#perUnitID').is(':checked');
    }

    function freightTot(curElement) {
        var tot = findTotal(getFrBasis(curElement), getBkQuantity(curElement), getFrRate(curElement),
            getLength(curElement), getWeight(curElement), getDScale(curElement), getVolume(curElement),
            getIsPerUnit(curElement));
        $(curElement).closest('.subBookingCalculation').find('#freightAreatTot').val(tot);
    }

    function checkNan(val) {
        return ((isNaN(val)) ? '' : val);
    }

    function totWW(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0,
            actualWeight = weight;
        if (scale === '10') {
            actualWeight = math.eval(actualWeight * nsBookDoc.quantityForWM);
        }
        var tempVal;
        if (isPerUnit) {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval((quantity * actualWeight) / 1000)),3).toFixed(3);           
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval(actualWeight / 1000)),3).toFixed(3);            
            $('#mainBookingFreightQuatity').val( tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function totCB(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0,
            actualVolumne = volume;
        if (scale === '10') {
            actualVolumne = math.eval(actualVolumne * nsBookDoc.quantityForCB);
        }
        var tempVal;
        if (isPerUnit) {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval(quantity * actualVolumne)),3).toFixed(3);            
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal =nsBookDoc.converToUpperDecimalOnFive(parseFloat(actualVolumne),3).toFixed(3);            
            $('#mainBookingFreightQuatity').val( tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function totWL(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0,
            actualWeight = weight;
        if (scale === '20') {
            actualWeight = math.eval(actualWeight * nsBookDoc.quantityForWL);
        }
        var tempVal;
        if (isPerUnit) {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval((quantity * actualWeight) / nsBookDoc.twoTwoFourZero)),3).toFixed(3);            
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval(actualWeight / nsBookDoc.twoTwoFourZero)),3).toFixed(3);                        
            $('#mainBookingFreightQuatity').val( tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function totCF(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0,
            actualVolumne = volume;
        if (scale === '20') {
            actualVolumne = math.eval(actualVolumne * nsBookDoc.quantityForCF);
        }
        var tempVal;
        if (isPerUnit) {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval(quantity * actualVolumne)),3).toFixed(3);           
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(actualVolumne),3).toFixed(3);            
            $('#mainBookingFreightQuatity').val(tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function totWM(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0,
            volMet, weightMet,
            actualVal;
        if (scale === '10') {
            weight = math.eval(weight * nsBookDoc.quantityForWM);
            volume = math.eval(volume * nsBookDoc.threeZeroFourEight * nsBookDoc.threeZeroFourEight * nsBookDoc.threeZeroFourEight);
        }
        volMet = volume;
        weightMet = math.eval(weight / 1000);
        if (volMet > weightMet) {
            actualVal = volMet;
        } else {
            actualVal = weightMet;
        }
        var tempVal;
        if (isPerUnit) {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval(quantity * actualVal)),3).toFixed(3);
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(actualVal),3).toFixed(3);
            $('#mainBookingFreightQuatity').val( tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function totWI(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0,
            volMet,
            weightMet,
            actualVal;
             if (scale === '20') {
                volMet = math.eval((volume * 35.3147)/40);
                weightMet = math.eval((weight * 2.20462) / 2240);
            }else{
                 volMet = math.eval(volume/40);
              weightMet = math.eval(weight/2240);
            }
            if (volMet > weightMet) {
                actualVal = volMet;
            } else {
                actualVal = weightMet;
            }
       var tempVal;
        if (isPerUnit) {
            tempVal =  nsBookDoc.converToUpperDecimalOnFive(math.eval(actualVal * quantity),3).toFixed(3);
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal =nsBookDoc.converToUpperDecimalOnFive( parseFloat(actualVal),3).toFixed(3);
            $('#mainBookingFreightQuatity').val( tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function totLM(basis, quantity, rate, length, weight, scale, isPerUnit) {
        var totalNum = 0,
        actualLength = length?length:0;
        if (scale === '10') {
            actualLength = math.eval(actualLength * nsBookDoc.quantityForLM);
        }
        var tempVal;
        if (isPerUnit) {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(math.eval(quantity * actualLength)),3).toFixed(3);
            $('#mainBookingFreightQuatity').val( tempVal || '');
        } else {
            tempVal = nsBookDoc.converToUpperDecimalOnFive(parseFloat(actualLength),3).toFixed(3);
            $('#mainBookingFreightQuatity').val( tempVal || '');
        }
        totalNum = checkNan(math.eval(rate * tempVal));
        return totalNum;
    }

    function findTotal(basis, quantity, rate, length, weight, scale, volume, isPerUnit) {
        var totalNum = 0;
		switch(basis) {
		case 'LS':
            totalNum = checkNan(rate);
            $('#mainBookingFreightQuatity').val('1');
			break;
		case 'LU': 
			totalNum = checkNan(rate * quantity);
            $('#mainBookingFreightQuatity').val(nsCore.fixedTo(quantity, 0) || '');            
			break;
		case 'LM':
            totalNum = totLM(basis, quantity, rate, length, weight, scale, isPerUnit);
			break;
        case 'WW':
            totalNum = totWW(basis, quantity, rate, length, weight, scale, volume, isPerUnit);
			break;
        case 'CB':
            totalNum = totCB(basis, quantity, rate, length, weight, scale, volume, isPerUnit);
			break;
        case 'WL':
            totalNum = totWL(basis, quantity, rate, length, weight, scale, volume, isPerUnit);
			break;
        case 'CF':
            totalNum = totCF(basis, quantity, rate, length, weight, scale, volume, isPerUnit);
			break;
        case 'WM':
            totalNum = totWM(basis, quantity, rate, length, weight, scale, volume, isPerUnit);
			break;
        default:
            if (basis === 'WI') {
                // Weight/measurement imperial.
                totalNum = totWI(basis, quantity, rate, length, weight, scale, volume, isPerUnit);
            }
			break;
        }
        return nsCore.roundingNumbers(totalNum, "mainBookingFreightCurrency");
    }

    function updateBaseCode(element, basisCode) {
        $(element).val(basisCode);
    }

    function findBasisCode(basisCode) {
        if (basisCode === 'Lump sum') {
            return 'LS';
        } else if (basisCode === 'Lump sum per unit') {
            return 'LU';
        } else if (basisCode === 'Per cubic foot') {
            return 'CF';
        } else {
            return findBasisCode1(basisCode);
        }
    }

    function findBasisCode1(basisCode) {
        if (basisCode === 'Weight/measurement imperial') {
            return 'WI';
        } else if (basisCode === 'Per cubic meter') {
            return 'CB';
        } else if (basisCode === 'Per lane meter') {
            return 'LM';
        } else if (basisCode === 'Per metric ton') {
            return 'WW';
        } else {
            return findBasisCode2(basisCode);
        }
    }

    function findBasisCode2(basisCode) {
        if (basisCode === 'Per long ton (2240 pound)') {
            return 'WL';
        } else if (basisCode === 'Per cent of freight') {
            return 'PC';
        } else if (basisCode === 'Weight/measurement metric') {
            return 'WM';
        } else {
            return '';
        }
    }

    function calculateArea(curElement) {
        var rootEle = $(curElement).closest('.subBookingCalculation'),
            length = rootEle.find('#bkLength').val(),
            width = rootEle.find('#bkWidth').val(),
            area = 0,
            scale = 0,
            isPerUnit = 0,
            bookedUnits = 0;
        if (length && width) {
            area = math.eval(length * width);
            scale = getDScale(rootEle);
            if (scale === '10') {
                area = math.eval(area / 144);
            }
            isPerUnit = getIsPerUnit(curElement);
            if (!isPerUnit) {
                bookedUnits = $(curElement).closest('.subBookingCalculation').find('#bookedUnits').val();
                area = math.eval(area * bookedUnits);
            }
            area = parseFloat(area).toFixed(3);
            rootEle.find('#bkArea').val(area);
        } else {
            rootEle.find('#bkArea').val('');
        }
    }

    function calculateVolume(curElement) {
        var rootEle = $(curElement).closest('.subBookingCalculation'),
            length = rootEle.find('#bkLength').val(),
            width = rootEle.find('#bkWidth').val(),
            height = rootEle.find('#bkHeight').val(),
            vol = 0,
            scale = 0,
            isPerUnit = 0,
            bookedUnits = 0;
        if (length && width && height) {
            vol = nsCore.volumeCalc(length , width , height);
            scale = getDScale(rootEle);
            if (scale === '10') {
                vol = math.eval(vol / 1728);
            }
            isPerUnit = getIsPerUnit(curElement);
            if (!isPerUnit) {
                bookedUnits = $(curElement).closest('.subBookingCalculation').find('#bookedUnits').val();
                vol = math.eval(vol * bookedUnits);
            }
            vol = parseFloat(vol).toFixed(3)
            rootEle.find('#bkVolume').val(vol);
        } else {
            rootEle.find('#bkVolume').val('');
        }
    }

    function updLM(curElement, rate, quantity) {
        var length = getLength(curElement),
            noOfUnits = getBkQuantity(curElement),
            scale = getDScale(curElement),
            total = 0;
        if (scale === '10') {
            length = math.eval(length * nsBookDoc.quantityForLM);
        }
        quantity = math.eval(noOfUnits * length);
        $(curElement).parents('tr').find('#chargeQuantity').val(quantity);
        if (quantity && rate) {
            total = math.eval(rate * quantity);
            $(curElement).parents('tr').find('#chargeTotal').val(total);
        }
    }

    function updCB(curElement, rate) {
        var actualVolume = getVolume(curElement),
            scale = getDScale(curElement),
            isPerUnit = getIsPerUnit(curElement),
            noOfUnits = 0,
            total = 0;
        if (scale === '10') {
            actualVolume = math.eval(actualVolume * nsBookDoc.quantityForCB);
        }
        if (isPerUnit) {
            noOfUnits = getBkQuantity(curElement);
            actualVolume = math.eval(actualVolume * noOfUnits);
        }
        $(curElement).parents('tr').find('#chargeQuantity').val(actualVolume);
        total = math.eval(rate * actualVolume);
        $(curElement).parents('tr').find('#chargeTotal').val(total);
    }

    function updWW(curElement, rate) {
        var actualWeight = getWeight(curElement),
            scale = getDScale(curElement),
            isPerUnit = getIsPerUnit(curElement),
            noOfUnits = 0,
            total = 0;
        if (scale === '10') {
            // scale in imperial.
            actualWeight = math.eval(actualWeight * nsBookDoc.quantityForWM);
            // Converting from pound to Kg.
        }
        if (isPerUnit) {
            noOfUnits = getBkQuantity(curElement);
            actualWeight = math.eval(actualWeight * noOfUnits);
        }
        $(curElement).parents('tr').find('#chargeQuantity').val(actualWeight);
        total = math.eval(rate * (actualWeight / 1000));
        $(curElement).parents('tr').find('#chargeTotal').val(total);
    }

    function updWL(curElement, rate) {
        var actualWeight = getWeight(curElement),
            scale = getDScale(curElement),
            isPerUnit = getIsPerUnit(curElement),
            noOfUnits = 0,
            total = 0;
        if (scale === '20') {
            actualWeight = math.eval(actualWeight * nsBookDoc.quantityForWL);
        }
        if (isPerUnit) {
            noOfUnits = getBkQuantity(curElement);
            actualWeight = math.eval(actualWeight * noOfUnits);
        }
        $(curElement).parents('tr').find('#chargeQuantity').val(actualWeight);
        total = math.eval(rate * (actualWeight / nsBookDoc.twoTwoFourZero));
        $(curElement).parents('tr').find('#chargeTotal').val(total);
    }

    function updCF(curElement, rate) {
        var actualVolume = getVolume(curElement),
            scale = getDScale(curElement),
            isPerUnit = getIsPerUnit(curElement),
            noOfUnits = 0,
            total = 0;
        if (scale === '20') {
            // scale in metric.
            actualVolume = math.eval(actualVolume * nsBookDoc.quantityForCF);
            // Converting from cubic foot to meters.
        }
        if (isPerUnit) {
            noOfUnits = getBkQuantity(curElement);
            actualVolume = math.eval(actualVolume * noOfUnits);
        }
        $(curElement).parents('tr').find('#chargeQuantity').val(actualVolume);
        total = math.eval(rate * actualVolume);
        $(curElement).parents('tr').find('#chargeTotal').val(total);
    }

    function updWM(curElement, rate) {
        var volume = getVolume(curElement),
            weight = getWeight(curElement),
            scale = getDScale(curElement),
            isPerUnit = getIsPerUnit(curElement),
            volMet = volume,
            weightMet = weight / 1000,
            actualVal,
            noOfUnits = 0,
            total = 0;
        if (scale === '10') {
            weight = math.eval(weight * nsBookDoc.quantityForWM);
            volume = math.eval(volume * nsBookDoc.threeZeroFourEight * nsBookDoc.threeZeroFourEight * nsBookDoc.threeZeroFourEight);
        }
        if (volMet > weightMet) {
            actualVal = volume;
        } else {
            actualVal = weight;
        }
        if (isPerUnit) {
            noOfUnits = getBkQuantity(curElement);
            actualVal = math.eval(actualVal * noOfUnits);
        }
        $(curElement).parents('tr').find('#chargeQuantity').val(actualVal);
        total = math.eval(rate * actualVal);
        $(curElement).parents('tr').find('#chargeTotal').val(total);
    }

    function updWI(curElement, rate) {
        var volume = getVolume(curElement),
            weight = getWeight(curElement),
            scale = getDScale(curElement),
            isPerUnit = getIsPerUnit(curElement),
            volMet, weightMet,
            actualVal,
            noOfUnits = 0,
            total = 0;
        if (scale === '20') {
            weight = math.eval(weight * nsBookDoc.quantityForWL);
            volume = math.eval(volume * nsBookDoc.quantityForWL1 * nsBookDoc.quantityForWL1 * nsBookDoc.quantityForWL1);
        }
        volMet = math.eval(volume / 40);
        weightMet = math.eval(weight / nsBookDoc.twoTwoFourZero);
        if (volMet > weightMet) {
            actualVal = volMet;
        } else {
            actualVal = weightMet;
        }
        if (isPerUnit) {
            noOfUnits = getBkQuantity(curElement);
            actualVal = math.eval(actualVal * noOfUnits);
        }
        $(curElement).parents('tr').find('#chargeQuantity').val(actualVal);
        total = math.eval(rate * actualVal);
        $(curElement).parents('tr').find('#chargeTotal').val(total);
    }

    function updPC(curElement, rate, quantity) {
        var total = 0;
        quantity = getFrTotal(curElement);
        $(curElement).parents('tr').find('#chargeQuantity').val(quantity);
        if (quantity && rate) {
            total = math.eval((rate * quantity) / 100);
            $(curElement).parents('tr').find('#chargeTotal').val(total);
        }
    }

    function updLU(curElement, rate, quantity) {
        var total = 0;
        quantity = getBkQuantity(curElement);
        $(curElement).parents('tr').find('#chargeQuantity').val(quantity);
        if (quantity && rate) {
            total = math.eval(rate * quantity);
            $(curElement).parents('tr').find('#chargeTotal').val(total);
        }
    }

    function updLS(curElement, rate, quantity) {
        var total = 0;
        quantity = 1;
        $(curElement).parents('tr').find('#chargeQuantity').val(quantity);
        if (rate) {
            total = math.eval(rate * quantity);
            $(curElement).parents('tr').find('#chargeTotal').val(total);
        }
    }

    function updateQuantity(curElement) {
        var basisCal = findBasisCode($(curElement).text()),
            rate = $(curElement).parents('tr').find('#chargeRate').text(),
            quantity = '';
			switch(basisCal) {
			case 'LS':
            updLS(curElement, rate, quantity);
			break;
			case 'LU':
            updLU(curElement, rate, quantity);
			break;
			case 'PC':
            updPC(curElement, rate, quantity);
			break;
			case 'LM':
            updLM(curElement, rate, quantity);
			break;
			case 'WW':
            updWW(curElement, rate);
			break;
			case 'CB':
            updCB(curElement, rate);
			break;
			case 'WL':
            updWL(curElement, rate);
			break;
			default:
            updateQuantityByScale(curElement, rate, quantity, basisCal);
			break;
        }
    }

    function updateQuantityByScale(curElement, rate, quantity, basisCal) {
        if (basisCal === 'CF') {
            updCF(curElement, rate);
        } else if (basisCal === 'WM') {
            updWM(curElement, rate);
        } else {
            if (basisCal === 'WI') {
                updWI(curElement, rate);
            }
        }
    }

    function nonDecCheck(ele, field, intPart, fieldName) {
        var numMsg = '',
            numeric = /^[0-9]+$/,
            decimal = /^[-+]?[0-9]+\.[0-9]+$/;
        if ((field !== '') && (!numeric.test(field) || decimal.test(field))) {
            numMsg = 'Enter a valid ' + fieldName;
        }
        return numMsg;
    }

    function validateFloat(fieldName, value, before, after) {
        var eRate = value,
        numbers = (fieldName.indexOf('Charges Rate') > -1) ? /^[-+]?[0-9]+$/ : /^[0-9]+$/,
            decimal = (fieldName.indexOf('Charges Rate') > -1) ? /^[-+]?[0-9]+\.[0-9]+$/ : /^[0-9]+\.[0-9]+$/,
            length = 0;
        if ((eRate.length > 1) && (eRate.charAt(0) === '.')) {
            eRate = '0' + eRate;
        }
        if (numbers.test(eRate)) {
            length = eRate.length;
            if (length > before) {
                return fieldName + ' value is too large (Maximum allowed digits before decimal is ' + before + ')' +
                    '\n';
            }
        } else if (decimal.test(eRate)) {
            return decimalValidate(fieldName, value, before, after);
        } else {
            return 'Enter a valid ' + fieldName + '\n';
        }
        return '';
    }

    function decimalValidate(fieldName, value, before, after) {
        var eRate = value,
            params = eRate.toString().split('.'),
            length1 = params[0].length,
            length2 = params[1].length;
        if ((length1 > before) && (length2 > after)) {
            return fieldName + ' value is too large (Maximum allowed digits before decimal is ' + before +
                ' and after decimal is ' + after + ')' + '\n';
        } else if (length1 > before) {
            return fieldName + ' value is too large (Maximum allowed digits before decimal is ' + before + ')' +
                '\n';
        } else {
            if (length2 > after) {
                return fieldName + ' value is too large (Maximum allowed digits after decimal is ' + after + ')' +
                    '\n';
            }
        }
        return '';
    }

    function getQuickRouteDetails(varElement) {
        $('.getPossibleVoyagesQuickbook').attr('data-clicked', 'true');
        nsBooking.possibleVygSel(varElement);
    }

    function validateIn() {
        var message = '',
            valid = true,
            origin = $('#origin').val(),
            destination = $('#destination').val(),
            destName = $('#destinationName').val(),
            oriName = $('#originName').val();
        if (!origin) {
            message = message + 'Origin should not be empty' + '\n';
            valid = false;
        } else {
            if (jQuery.inArray(origin, nsBooking.portCodes) === -1) {
                message = message + 'Enter a valid Origin' + '\n';
                valid = false;
            } else {
                if (jQuery.inArray(oriName, nsBooking.portDesc) === -1) {
                    message = message + 'Enter a valid Origin' + '\n';
                    valid = false;
                }
            }
        }
        if (!destination) {
            message = message + 'Destination should not be empty' + '\n';
            valid = false;
        } else {
            if (jQuery.inArray(destination, nsBooking.portCodes) === -1) {
                message = message + 'Enter a valid Destination' + '\n';
                valid = false;
            } else {
                if (jQuery.inArray(destName, nsBooking.portDesc) === -1) {
                    message = message + 'Enter a valid Destination' + '\n';
                    valid = false;
                }
            }
        }
        return validCheck(message, valid, origin, destination);
    }

    function validCheck(message, valid, origin, destination) {
        var customerCode = $('#customerCode').val(),
            customerName = $('#customerName').val();
        if (!customerCode || !customerName) {
            message = message + 'Customer should not be empty' + '\n';
            valid = false;
        }
        if ((valid) && ($.trim(origin) === $.trim(destination))) {
            message = 'Origin and destination are equal. This is not a valid combination.';
            valid = false;
        }
        if (!(valid)) {
            nsCore.showAlert(message);
        }
        return valid;
    }

    function setUpPossVoyWrap(possibleVoyageContent) {
        $('#qPossibleVoyageNewWrapId').addClass('formRow');
        $('#qPossibleVoyageNewWrapId').addClass('mt10');
        $('#qPossibleVoyageNewWrapId').addClass('width96per');
        $('#qPossibleVoyageNewWrapId').html(possibleVoyageContent);
        $('#qPossibleVoyageNewWrapId').show();
    }

    function cargoSTComp(cargoGrp, bookedUnits, message, area) {
        var finalVal1 = 0;
        if ('ST' === cargoGrp) {
            if ($('#totalsID').is(':checked')) {
                area = area / bookedUnits;
                finalVal1 = area;
            } else {
                finalVal1 = math.eval(area * bookedUnits);
            }
            if ($('#dimensionType').val() === '10') {
                finalVal1 = parseFloat(finalVal1 / (math.eval(nsBookDoc.stCompValue * nsBookDoc.stCompValue)));
            }
            if (nsBooking.stReAvl === 0) {
                if (finalVal1 > nsBooking.hhReAvl) {
                    message ='The sub booking(s) can not be saved because of lack of allocated space.'
					+ ' Save as reserve and allocate needed space on the voyage';
                }
            } else {
                if (finalVal1 > nsBooking.stReAvl) {
                    message ='The sub booking(s) can not be saved because of lack of allocated space. '
                    + 'Save as reserve and allocate needed space on the voyage';
                }
            }
        }
        return message;
    }

    function cargoHHComp(cargoGrp, bookedUnits, message, area) {
        var finalVal = 0;
        if ('HH' === cargoGrp) {
            if ($('#totalsID').is(':checked')) {
                area = area / bookedUnits;
                finalVal = area;
            } else {
                finalVal = area * bookedUnits;
            }
            if ($('#dimensionType').val() === '10') {
                finalVal = parseFloat(finalVal / (math.eval(nsBookDoc.stCompValue * nsBookDoc.stCompValue)));
            }
            if (finalVal > nsBooking.hhReAvl) {
                message = 'The sub booking(s) can not be saved because of lack of allocated space. '
                + 'Save as reserve and allocate needed space on the voyage';
            }
        } else {
            message = cargoSTComp(cargoGrp, bookedUnits, message, area);
        }
        return message;
    }

    function cargComp(cargoGrp, bookedUnits, message, area) {
        if ('CA' === cargoGrp) {
            if (bookedUnits > nsBooking.carReAvl) {
                message ='The sub booking(s) can not be saved because of lack of allocated space.'
                    + ' Save as reserve and allocate needed space on the voyage';
            }
        } else if ('PU' === cargoGrp) {
            if (bookedUnits > nsBooking.puReAvl) {
                message = 'The sub booking(s) can not be saved because of lack of allocated space. '
                + 'Save as reserve and allocate needed space on the voyage';
            }
        } else {
            message = cargoHHComp(cargoGrp, bookedUnits, message, area);
        }
        return message;
    }

    function setCheckVal(element) {
        var checked = $(element).find('.qCargoOnHold').is(':checked'),
            cgOnHold = (checked) ? 'Y' : 'N',
            checked1 = $(element).find('.qMilitaryCargo').is(':checked'),
            checked2 = $(element).find('.qWayCargo').is(':checked'),
            checked3 = $(element).find('.qHazardousCargo').is(':checked'),
            wayCg = (checked2) ? 'Y' : 'N',
            militarycargo = (checked1) ? 'Y' : 'N',
        	hazCargo = (checked3) ? 'Y' : 'N';
        $(element).find('#cargoOnHold1').val(cgOnHold);
        $(element).find('#miliCargo1').val(militarycargo);
        $(element).find('#wayCargo1').val(wayCg);
        $(element).find('#hazCargo1').val(hazCargo);
    }

    function validNon(message, element) {
        var cargoText = $(element).find('#cargoText').val(),
            frBasis = $(element).find('#freightAreaBasis').val(),
            freightAreatRate = $(element).find('#freightAreatRate').val(),
            newCargo = $(element).find('#newCargo').val(),
            cargoType = $(element).find('#cargoType').val(),
            cargoState = $(element).find('#cargoState').val();
        message = message + empCheck(message, cargoText, 'Cargo Text should not be empty');
        message = message + empCheck(message, frBasis, 'Freight Basis is not selected');
        message = message + empCheck(message, freightAreatRate, 'Freight Rate should not be empty');
        message = message + zeroCheck(message, newCargo, 'New/Used is not selected');
        message = message + empCheck(message, cargoType, 'Cargo Type is not selected');
        message = message + empCheck(message, cargoState, 'Cargo State is not selected');
        return message;
    }

    function empCheck(message, val, text) {
        if (!val) {
            return text + '\n';
        } else {
            return '';
        }
    }

    function zeroCheck(message, val, text) {
        if (val === '0' || val === 0) {
            return text + '\n';
        } else {
            return '';
        }
    }

    function valDimQ(element, message) {
        message = message + fltFieldVal(element, '#bkLength', 'Booked length should not be empty', 4, 6,
            'Booked Length');
        message = message + fltFieldVal(element, '#bkWidth', 'Booked width should not be empty', 4, 6,
            'Booked Width');
        message = message + fltFieldVal(element, '#bkHeight', 'Booked height should not be empty', 4, 6,
            'Booked Height');
        message = message + fltFieldVal(element, '#bkArea', 'Booked area should not be empty', 8, 12, 'Booked Area');
        message = message + fltFieldVal(element, '#bkVolume', 'Booked volume should not be empty', 8, 18,
            'Booked Volume');
        return message;
    }

    function valDimQ1(element, message) {
        message = message + fltFieldVal(element, '#bkArea', 'Booked area should not be empty', 8, 12, 'Booked Area');
        message = message + fltFieldVal(element, '#bkVolume', 'Booked volume should not be empty', 8, 18,
            'Booked Volume');
        return message;
    }

    function fltFieldVal(element, attrName, text, min, max, attrText) {
        var isDisabled = $(element).find(attrName).is('[readonly]'),
            bkVolume = '';
        if (!isDisabled) {
            bkVolume = $(element).find(attrName).val();
            if (!bkVolume) {
                return text + '\n';
            } else {
                return validateFloat(attrText, bkVolume, min, max);
            }
        }
        return '';
    }

    function valMakeAndModel(element) {
        var message = '',
            makID = '',
            modID = '';
        if (!(nsBooking.isDimensionSelected)) {
            makID = $(element).find('#bookingCargoMake1').val();
            if (makID && (jQuery.inArray(makID, nsBooking.makeIDs) === -1)) {
                message = message + 'Enter a valid Make' + '\n';
            }
            modID = $(element).find('#bookingCargoModel1').val();
            if (modID && (jQuery.inArray(modID, nsBooking.modelIDs) === -1)) {
                message = message + 'Enter a valid Model' + '\n';
            }
        }
        return message;
    }

    function valFreight(element) {
        var message = '',
            freightAreatRate = $(element).find('#freightAreatRate'),
            freightAreatRateVal = '',
            freightAreaCommission = '',
            freightAreaCommissionVal = '';
        if (freightAreatRate) {
            freightAreatRateVal = $(freightAreatRate).val();
            if (freightAreatRateVal) {
                message = message + validateFloat('Freight Rate', freightAreatRateVal, 10, 4);
            }
        }
        freightAreaCommission = $(element).find('#freightAreaCommission');
        if (freightAreaCommission) {
            freightAreaCommissionVal = $(freightAreaCommission).val();
            if (freightAreaCommissionVal) {
                message = message + validateFloat('Freight Commision', freightAreaCommissionVal, 2, 2);
            }
        }
        return message;
    }

    function valBookUnits(element) {
        var bookedUnits = $(element).find('#bookedUnits').val(),
            numbers = /^[0-9]+$/;
        if (!bookedUnits) {
            return 'Booked units should not be empty' + '\n';
        } else {
            if (!bookedUnits.match(numbers)) {
                return 'Enter a valid Booked units' + '\n';
            }
        }
        return '';
    }

    function docOffVal(element) {
        var docCode = $(element).find('#docCode').val(),
            docuName = $('#docName').val();
        if (docCode === '') {
            return 'Documentation office should not be empty' + '\n';
        } else {
            if (jQuery.inArray(docCode, nsBooking.docCodes) === -1) {
                return 'Enter a valid Documentation office' + '\n';
            } else {
                if (jQuery.inArray(docuName, nsBooking.docNames) === -1) {
                    return 'Enter a valid Documentation office' + '\n';
                }
            }
        }
        return '';
    }

    function wigVal(element, message) {
        var bkWeight = $(element).find('#bkWeight').val(),
            elementWeight = '',
            valueWeight = '',
            weightMsg = '';
        if (!bkWeight) {
            message = message + 'Booked weight should not be empty' + '\n';
        } else {
            elementWeight = $(element).find('#bkWeight');
            valueWeight = elementWeight.val();
            weightMsg = nonDecCheck(elementWeight, valueWeight, 14, 'Booked Weight');
            if (message && weightMsg) {
                message = message + '\n' + weightMsg;
            } else {
                if (weightMsg) {
                    message += weightMsg;
                }
            }
        }
        return message;
    }

    function findDefCurrency() {
        vmsService.vmsApiService(function(response) {
            if (response) {
                nsBooking.defaultCurrencyCode = response;
                $('#freightCurrencies').val(response.slice(1,-1));
                nsBooking.form_data = $('#quickBookForm').serialize();
            } else {
                //nsCore.showAlert(nsBooking.errorMsg); TO_DO : Fix Required
            }
        }, nsBooking.defaultCurrency, 'POST', null);
    }

    function quickWeight(ele) {
        var freight = $(ele).val();
        $(ele).val((freight)? parseFloat(freight).toFixed(3) : '');
    }

    function weightChanged(element) {
        var measType = 0,
            actualWeightval = '',
            weightval = 0,
            alertMsg = "Cargo weight exceeds vessel's max. ramp weight";
        if (nsBooking.maxWeightCapacity !== -1) {
            measType = $(element).closest('tr').find('#dimensionType').val();
            actualWeightval = $(element).val();
            weightval = actualWeightval;
            if (measType === '20') {
                weightval = math.eval(actualWeightval / 1000);
            } else {
                if (measType === '10') {
                    weightval = math.eval((actualWeightval / 2.2046) / 1000);
                }
            }
            if (weightval > nsBooking.maxWeightCapacity) {
                nsCore.showAlert(alertMsg);
            }
        }
    }

    function heightChanged(element) {
        var measType = '',
            actualHeightval = '',
            heightval = '',
            alertMsg = "Cargo height exceeds vessel's max. opening height";
        if (nsBooking.maxHeightCapacity !== -1) {
            measType = $(element).closest('tr').find('#dimensionType').val();
            actualHeightval = $(element).val();
            heightval = actualHeightval;
            if (measType === '10') {
                heightval = math.eval((actualHeightval / 39.370));
            }
            if (heightval > nsBooking.maxHeightCapacity) {
                nsCore.showAlert(alertMsg);
            }
        }
    }

    function convertArea(element) {
        var rootELe = $(element).closest('.subBookingCalculation'),
            length = rootELe.find('#bkLength').val(),
            width = rootELe.find('#bkWidth').val(),
            area = rootELe.find('#bkArea').val(),
            scale = '',
            perUnit = '';
        if (area) {
            scale = getDScale(rootELe);
            perUnit = rootELe.find('#perUnitID').is(':checked');
            updateArea(area, perUnit, length, width, scale, rootELe);
        }
    }

    function updateArea(area, perUnit, length, width, scale, root) {
        if (perUnit) {
            if ((scale === '10') && length && width) {
                area = math.eval(area / 144);
                area = parseFloat(area).toFixed(3);
            } else {
                if ((scale === '20') && $.isNumeric(length) && $.isNumeric(width) && (length !== '') && (width !==
                        '')) {
                    area = math.eval(length * width);
                    area = parseFloat(area).toFixed(3);
                }
            }
        }
        root.find('#bkArea').val(area);
    }

    function convertVolume(element) {
        var rootEle = $(element).closest('.subBookingCalculation'),
            length = rootEle.find('#bkLength').val(),
            height = rootEle.find('#bkHeight').val(),
            width = rootEle.find('#bkWidth').val(),
            volume = rootEle.find('#bkVolume').val(),
            scale = 0,
            perUnit = '';
        if ((volume !== null) && (volume.trim() !== '')) {
            scale = getDScale(rootEle);
            perUnit = rootEle.find('#perUnitID').is(':checked');
            updateVol(volume, perUnit, length, width, height, scale, rootEle);
        }
    }

    function updateVol(volume, perUnit, length, width, height, scale, root) {
        if (perUnit) {
            if (scale === '10') {
                updateVolMetri(volume, length, width, height, scale, root);
            } else {
                if (((scale === '20') && $.isNumeric(length) && $.isNumeric(width) && length && width) &&
                    $.isNumeric(height) && height) {
                    updateVolImp(volume, length, width, height, scale, root);
                }
            }
        }
    }

    function updateVolImp(volume, length, width, height, scale, root) {
        volume = nsCore.volumeCalc(length , width , height);
        volume = parseFloat(volume).toFixed(3);
        root.find('#bkVolume').val(volume);
    }

    function updateVolMetri(volume, length, width, height, scale, root) {
        if (length && width) {
            volume = math.eval(volume / 1728);
            volume = parseFloat(volume).toFixed(3);
        }
        root.find('#bkVolume').val(volume);
    }

    function updateCState(element) {
        if (element) {
            $(element).find('#cargoType option[value=""]').attr('selected', 'selected');
            nsBooking.updateCargoState($(element).find('#cargoType'));
        } else {
            $('.subBookingCalculation').find('#cargoType option[value=""]').attr('selected', 'selected');
            nsBooking.updateCargoState($('.subBookingCalculation').find('#cargoType'));
        }
    }
    function calculateFreightTotal() {
        var basis = $('#mainBookingFreightBasis').val(),
            rate = $('#mainBookingFreightRate').val(),
            length = $('input[name="freightedLength"]:not(:disabled)').val(),
            weight = $('input[name="freightedWeight"]').val(),
            volume = parseFloat($('#freightedVolume').val()),
            isPerUnit = false,
            scale = $('#freightedMeasureUnit').val(),
            quantity = $('#totalBookedUnits').val();
        if ($('#freightedUnit').find('#shipInfovalidStatus').is(':checked')) {
            isPerUnit = true;
        }
        $('#mainBookingFreightFreight').val(nsBooking.findTotal(basis, quantity, rate, length, weight, scale,
            volume, isPerUnit));
        $('.chargeBasis').trigger('change');
    }

    qbObj = {
        'getLoadPort': getLoadPort,
        'getDischargePort': getDischargePort,
        'getOriginCode': getOriginCode,
        'getDestinationCode': getDestinationCode,
        'getContract': getContract,
        'getCargoType': getCargoType,
        'getCargoState': getCargoState,
        'getHeight': getHeight,
        'getVolume': getVolume,
        'getWeight': getWeight,
        'getIsNewCargo': getIsNewCargo,
        'getFrBasis': getFrBasis,
        'getFrRate': getFrRate,
        'getFrTotal': getFrTotal,
        'getBkQuantity': getBkQuantity,
        'getDScale': getDScale,
        'getLength': getLength,
        'getIsPerUnit': getIsPerUnit,
        'freightTot': freightTot,
        'checkNan': checkNan,
        'totWW': totWW,
        'totCB': totCB,
        'totWL': totWL,
        'totCF': totCF,
        'totWM': totWM,
        'totWI': totWI,
        'totLM': totLM,
        'findTotal': findTotal,
        'updateBaseCode': updateBaseCode,
        'findBasisCode': findBasisCode,
        'findBasisCode1': findBasisCode1,
        'findBasisCode2': findBasisCode2,
        'calculateArea': calculateArea,
        'calculateVolume': calculateVolume,
        'updLM': updLM,
        'updCB': updCB,
        'updWW': updWW,
        'updWL': updWL,
        'updCF': updCF,
        'updWM': updWM,
        'updWI': updWI,
        'updPC': updPC,
        'updLU': updLU,
        'updLS': updLS,
        'updateQuantity': updateQuantity,
        'updateQuantityByScale': updateQuantityByScale,
        'nonDecCheck': nonDecCheck,
        'validateFloat': validateFloat,
        'decimalValidate': decimalValidate,
        'getQuickRouteDetails': getQuickRouteDetails,
        'validateIn': validateIn,
        'validCheck': validCheck,
        'setUpPossVoyWrap': setUpPossVoyWrap,
        'cargoSTComp': cargoSTComp,
        'cargoHHComp': cargoHHComp,
        'cargComp': cargComp,
        'setCheckVal': setCheckVal,
        'validNon': validNon,
        'empCheck': empCheck,
        'zeroCheck': zeroCheck,
        'valDimQ': valDimQ,
        'valDimQ1': valDimQ1,
        'fltFieldVal': fltFieldVal,
        'valMakeAndModel': valMakeAndModel,
        'valFreight': valFreight,
        'valBookUnits': valBookUnits,
        'docOffVal': docOffVal,
        'wigVal': wigVal,
        'findDefCurrency': findDefCurrency,
        'quickWeight': quickWeight,
        'weightChanged': weightChanged,
        'heightChanged': heightChanged,
        'convertArea': convertArea,
        'updateArea': updateArea,
        'convertVolume': convertVolume,
        'updateVol': updateVol,
        'updateVolImp': updateVolImp,
        'updateVolMetri': updateVolMetri,
        'updateCState': updateCState,
        'calculateFreightTotal': calculateFreightTotal
    };
    if(nsBooking) {
    	$.extend(true, nsBooking, qbObj);
    } else {
    	$.extend(true, nsDoc, qbObj);
    }    
    
})(this.booking, jQuery, this.vmsService, this.core, this.doc, this.bookDoc);