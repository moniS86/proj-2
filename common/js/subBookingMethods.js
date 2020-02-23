/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc, nsDoc) {
    var sbmObj = {}, bookDocObj = {};
    if (!nsBooking) {
        nsBooking = nsDoc
    }
    function setQuantityForCB(curElement, basisCal, rate) {
        var total, scale, isPerUnit, noOfUnits, actualVolume;
        actualVolume = parseFloat($('#freightedVolume').val());
        scale = $('#freightedMeasureUnit').val();
        isPerUnit = $('#freightedUnit').find('#shipInfovalidStatus').is(':checked');
        if (scale === '10') {
            actualVolume = math.eval(actualVolume * nsBookDoc.quantityForCB);
        }
        if (isPerUnit) {
            noOfUnits = $('#totalBookedUnits').val();
            actualVolume = math.eval(actualVolume * noOfUnits);
        }
        actualVolume = convertToFloat(actualVolume);
        if (!isNaN(actualVolume)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(actualVolume, 3));
            total = math.eval(rate * $(curElement).parents('tr').find('#chargeQuantity').val());
            total = convertToFloat(total);
            var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
            total = nsCore.roundingNumbersCharges(total, currVal, "");
            if (!isNaN(total)) {
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function setQuantityForWL(curElement, basisCal, rate) {
        var total, scale, isPerUnit, noOfUnits, actualWeight;
        actualWeight = $('#freightedWeight').val();
        scale = $('#freightedMeasureUnit').val();
        isPerUnit = $('#freightedUnit').find('#shipInfovalidStatus').is(':checked');
        if (scale === '20') {
            actualWeight = math.eval(actualWeight * nsBookDoc.quantityForWL);
        }
        if (isPerUnit) {
            noOfUnits = $('#totalBookedUnits').val();
            actualWeight = math.eval(actualWeight * noOfUnits);
        }
        actualWeight = convertToFloat(actualWeight);
        if (!isNaN(actualWeight)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(
                nsCore.fixedTo((actualWeight / nsBookDoc.twoTwoFourZero), 3));
            total = math.eval(rate * $(curElement).parents('tr').find('#chargeQuantity').val());
            total = convertToFloat(total);
            var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
            total = nsCore.roundingNumbersCharges(total, currVal, "");
            if (!isNaN(total)) {
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function setQuantityForCF(curElement, basisCal, rate) {
        var total, scale, isPerUnit, noOfUnits, actualVolume;
        actualVolume = parseFloat($('#freightedVolume').val());        
        scale = $('#freightedMeasureUnit').val();
        isPerUnit = $('#freightedUnit').find('#shipInfovalidStatus').is(':checked');
        if (scale === '20') {
            actualVolume = math.eval(actualVolume * nsBookDoc.quantityForCF);
        }
        if (isPerUnit) {
            noOfUnits = $('#totalBookedUnits').val();
            actualVolume = math.eval(actualVolume * noOfUnits);
        }
        actualVolume = convertToFloat(actualVolume);
        if (!isNaN(actualVolume)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(actualVolume, 3));
            total = math.eval(rate * $(curElement).parents('tr').find('#chargeQuantity').val());
            total = convertToFloat(total);
            var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
            total = nsCore.roundingNumbersCharges(total, currVal, "");
            if (!isNaN(total)) {
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function setQuantityForWM(curElement, basisCal, rate) {
        var total, scale, isPerUnit, noOfUnits, volume, weight, volMet, weightMet, actualVal;
        volume = $('#freightedVolume').val();        	
        weight = $('#freightedWeight').val();
        scale = $('#freightedMeasureUnit').val();
        isPerUnit = $('#freightedUnit').find('#shipInfovalidStatus').is(':checked');
        if (scale === '10') {
         	  weightMet = math.eval(weight/(1000*nsBookDoc.quantityForWL));
         	  volMet = math.eval(volume/nsBookDoc.quantityForCF);         	
         }else{
             volMet = volume;
             weightMet = math.eval(weight / 1000);
         } 
        if (volMet > weightMet) {
            actualVal = volMet;
        } else {
            actualVal = weightMet;
        }
        if (isPerUnit) {
            noOfUnits = $('#totalBookedUnits').val();
            actualVal = math.eval(actualVal * noOfUnits);
        }
        actualVal = convertToFloat(actualVal);
        if (!isNaN(actualVal)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(actualVal, 3));
            total = math.eval(rate * $(curElement).parents('tr').find('#chargeQuantity').val());
            total = convertToFloat(total);
            var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
            total = nsCore.roundingNumbersCharges(total, currVal, "");
            if (!isNaN(total)) {
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function setQuantityForWL1(curElement, basisCal, rate) {
        var total, scale, isPerUnit, noOfUnits, volume, weight, volMet, weightMet, actualVal;
        if (basisCal === 'WI') {
            volume = parseFloat($('#freightedVolume').val());
            weight = $('#freightedWeight').val();
            scale = $('#freightedMeasureUnit').val();
            isPerUnit = $('#freightedUnit').find('#shipInfovalidStatus').is(':checked');
            if (scale === '20') {
                volMet = math.eval((volume * 35.3147)/40);
                weightMet = math.eval((weight * 2.20462) / 2240);
                

            }else{
                 volMet = math.eval(volume/40) ;
              weightMet = math.eval(weight/2240);
            }
            if (volMet > weightMet) {
                actualVal = volMet;
            } else {
                actualVal = weightMet;
            }
            if (isPerUnit) {
                noOfUnits = $('#totalBookedUnits').val();
                actualVal = math.eval(actualVal * noOfUnits);
            }
            actualVal = convertToFloat(actualVal);
            if (!isNaN(actualVal)) {
                $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(actualVal, 3));
                total = math.eval(rate * $(curElement).parents('tr').find('#chargeQuantity').val());
                total = convertToFloat(total);
                var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
                total = nsCore.roundingNumbersCharges(total, currVal, "");
                if (!isNaN(total)) {
                    $(curElement).parents('tr').find('#chargeTotal').val(total);
                    $(curElement).parents('tr').find('#chargeRate').val(
                        nsCore.roundingNumbersCharges(rate, currVal, ""));
                }
            }
        }
    }
    function populateEquipment(equipmentNo) {
        vmsService.vmsApiService(function(response) {
            var status = '<option value="">-- Select --</option>';
            if (response) {
                response.sort(function(a, b) {
                    var val1 = a.id.toUpperCase(), val2 = b.id.toUpperCase();
                    return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
                });
                $.each(response, function(i, val) {
                    if ($.trim(equipmentNo) === val.id) {
                        status += '<option value="' + escape(val.desc) + '" selected>' + val.id + '</option>';
                        $('#cargoEquipmentType').val(unescape(val.desc));
                    } else {
                        status += '<option value="' + escape(val.desc) + '">' + val.id + '</option>';
                    }
                });
                $('#cargoEquipmentNbr').html(status);
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, "/Vms/masterdata/equipments", 'POST', null);
    }
    function modelTypeChange() {
        var make = $('#mainSubBookingForm').find('#bookingCargoMake').val(), model = $('#mainSubBookingForm').find(
            '#bookingCargoModel').val();
        if (make || model) {
            $('#mainSubBookingForm').find('#makeModelListLink').removeClass('disabledLink');
        } else {
            $('#mainSubBookingForm').find('#makeModelListLink').addClass('disabledLink');
        }
    }
    function bookingAndSubBookingCreation(element) {
        var consID = $('#consignmentId').val(), charge = {};
        element = $('#mainSubBookingForm input[value=Save]')[0];
        if (nsBooking.isCopyBookingEnabled === 'Yes') {
            copyBookingAndSubBooking(element);
            return;
        } else {
            if (consID) {
                if (nsBooking.allChargeid && nsBooking.subBookingIdDelete) {
                    charge = {
                        id : nsBooking.allChargeid,
                        subBookingID : nsBooking.subBookingIdDelete,
                        timeStamp : nsBooking.allChargeTimeSt
                    };
                    nsBooking.allChargeid = '';
                    nsBooking.allChargeTimeSt = ''
                    nsBooking.subBookingIdDelete = '';
                    vmsService.vmsApiServiceType(function(response) {
                        if (response) {
                            // do nothing
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, '/Vms/subbooking/deleteCharge', 'POST', JSON.stringify(charge));
                }
                nsBooking.updateSubBooking();
                return;
            } else {
                nsBooking.createFreshSubBooking(element, false);
                return;
            }
        }
    }
    function copyBookingAndSubBooking(element) {
        var bookingID = $('#bookingHeaderId').val(), subbookingID = $('#consignmentId').val(), message = '';
        if (!bookingID && !subbookingID) {
            nsCore.showAlert('Creating New Booking and New Sub Booking');
            message = validateCopyBookingFields();
            if (!(message.trim())) {
                nsBooking.createFreshSubBooking(element, false);
            } else {
                nsCore.showAlert(message.trim());
                return;
            }
        } else {
            if (bookingID && !subbookingID) {
                nsBooking.createFreshSubBooking(element, true);
            }
        }
    }
    function validateCopyBookingFields() {
        var message = '', customerCode = $('#mainBookDetailCustomerCode').val(), contract = $('#mainContract').val(), origin = $(
            '#mainBookDetailCustomerOrigin').val(), destination = $('#mainBookDetailCustomerDestination').val();
        if (!customerCode) {
            message = message + 'Customer should not be empty' + '\n';
        }
        if (!contract) {
            message = message + 'Contract should not be empty' + '\n';
        }
        if (!origin) {
            message = message + 'Origin should not be empty' + '\n';
        }
        if (!destination) {
            message = message + 'Destination should not be empty' + '\n';
        }
        return message;
    }
    function constructLegsFromRoute() {
        var isCargoEquip = 'N', selectedRoute = $('#possibleVoyageNewWrapId').find('.voyageSelection:checked'), equipNo, cargoHoldDisabled = $(
            'input:checkbox[name=cargoOnHold]').prop('disabled'), newCargoDisabled = $('select[name="attribute1"]')
            .prop('disabled');
        if ($('#cargoEquipmentNbr').find(':selected').text() === '-- Select --') {
            equipNo = '';
        } else {
            equipNo = $('#cargoEquipmentNbr').find(':selected').text();
        }
        if (($('#cargoEquipmentNbr').is(':enabled'))) {
            isCargoEquip = 'Y';
        }
        nsBooking.cargoConsignments = [];
        nsBooking.cargoConsignments.push({
            cargoOnHold : ($('input:checkbox[name=cargoOnHold]:checked').val() === 'on') ? 'Y' : 'N',
            equipNo : equipNo,
            enabledEquipment : isCargoEquip,
            enabledCargoOnHold : (cargoHoldDisabled) ? 'N' : 'Y',
            enabledNewCargo : (newCargoDisabled) ? 'N' : 'Y'
        }, {
            cargoOnHold : '',
            equipNo : '',
            enabledEquipment : '',
            enabledCargoOnHold : '',
            enabledNewCargo : ''
        });
        return buildConsLegs(selectedRoute);
    }
    function buildConsLegs(selectedRoute) {
        var consLegs = [], wayCargo = [], initLegType="P", legsMain=[], allocationStatus = $('#bookingAllocStatus').val(), carrier = '', shippedOn = 'N', oTable = $(
            '#routeDetailGrid').DataTable(), rowData = oTable.row(
            $('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(), loadPortCallVoyageId = (rowData.loadPortCallVoyageId === 'null') ? ''
            : rowData.loadPortCallVoyageId, discPortCallVoyageId = (rowData.discPortCallVoyageId === 'null') ? ''
            : rowData.discPortCallVoyageId, portPair = {
            sourcePortCallID : loadPortCallVoyageId || ''
        }, consLegId = rowData.consignmentLegId, loadPort = {}, destinationPort = {}, loadPortObjPoss = {}, destinationPortObjPoss = {}, subBookingId = '';
        if ($('#voyageTransportationType').val() === '20') {
            carrier = $('#voyageCarrier').val();
        }
        if ($('.shippedOnboard').is(':checked')) {
            shippedOn = 'Y';
        }
        subBookingId = $('.mainBookingListWrap .subBookContentListCol').find('.ui-selecting.thrdLevel').attr(
            'data-subbookingid');
        $('.routeDetailGrid tbody tr').each(
            function() {
                var wayCargoChecked = (($(this).find('.selectedRoute').is(':checked')) && $(this).find('.wayCargo').is(
                    ':checked'));
                wayCargo.push(nsCore.isCondTrue((wayCargoChecked), 'Y', 'N'));
                if($(this).find('.mainLeg').is(':checked')){
                    legsMain.push('M')
                    initLegType='O'
                }else{
                   legsMain.push(initLegType) 
                }
            });
        if (nsBookDoc.selectePossibleVoyage.length > 0
            && nsBookDoc.selectePossibleVoyage[0].vesselVoyage !== "No Voyage") {
            if (nsBookDoc.selectePossibleVoyage.length > 0) {
                $(nsBookDoc.selectePossibleVoyage)
                    .each(
                        function(j, leg) {
                            var discPortCode = leg.discPortCode, loadPortCode = leg.loadPortCode, loadPortCalVoyID = leg.sourcePortCallID, loadPortObj = {
                                portCode : loadPortCode
                            }, destinationPortObj = {
                                portCode : discPortCode
                            };
                            discPortCallVoyageId = leg.destinationPortCallID;
                            consLegs.push({
                                loadPort : loadPortObj,
                                destinationPort : destinationPortObj,
                                loadPortCallVoyageId : loadPortCalVoyID,
                                discPortCallVoyageId : discPortCallVoyageId,
                                wayCargo : wayCargo[j],
                                comment : $('input[name$="bookingComments"]').val(),
                                firm : leg.firm,
                                transpType : $('#voyageTransportationType').val(),
                                carrierName : carrier,
                                carrierRef : $('#voyageCarrierRef').val(),
                                estimatedArrival : $('#estimatedArrival').val(),
                                departureDate : $('#estimatedDeparture').val(),
                                shippedOnBoard : shippedOn,
                                cargoConsignmentList : nsBooking.cargoConsignments,
                                portPair : portPair,
                                id : consLegId,
                                consignmentType : legsMain[j],
                                consignmentId : subBookingId,
                                newLeg : 'Y'
                            });
                        });
            } else {
                loadPort = {
                    portCode : ''
                };
                destinationPort = {
                    portCode : ''
                };
                consLegs.push({
                    loadPort : loadPort,
                    destinationPort : destinationPort,
                    loadPortCallVoyageId : loadPortCallVoyageId,
                    discPortCallVoyageId : discPortCallVoyageId,
                    wayCargo : wayCargo[j],
                    comment : $('input[name$="bookingComments"]').val(),
                    firm : allocationStatus,
                    transpType : $('#voyageTransportationType').val(),
                    carrierName : carrier,
                    carrierRef : $('#voyageCarrierRef').val(),
                    estimatedArrival : $('#estimatedArrival').val(),
                    departureDate : $('#estimatedDeparture').val(),
                    shippedOnBoard : shippedOn,
                    cargoConsignmentList : nsBooking.cargoConsignments,
                    portPair : portPair,
                    id : consLegId,
                    consignmentType : 'M',
                    consignmentId : subBookingId,
                    newLeg : 'Y'
                });
            }
        } else {
            if (nsBookDoc.selectePossibleVoyage[0].vesselVoyage === "No Voyage") {
                loadPortObjPoss = {
                    portCode : $('#mainBookDetailCustomerOrigin').val()
                };
                destinationPortObjPoss = {
                    portCode : $('#mainBookDetailCustomerDestination').val()
                };
                consLegs.push({
                    loadPort : loadPortObjPoss,
                    destinationPort : destinationPortObjPoss,
                    loadPortCallVoyageId : '0',
                    discPortCallVoyageId : '0',
                    wayCargo : wayCargo[0],
                    comment : $('input[name$="bookingComments"]').val(),
                    firm : allocationStatus,
                    transpType : $('#voyageTransportationType').val(),
                    carrierName : carrier,
                    carrierRef : $('#voyageCarrierRef').val(),
                    estimatedArrival : $('#estimatedArrival').val(),
                    departureDate : $('#estimatedDeparture').val(),
                    shippedOnBoard : shippedOn,
                    cargoConsignmentList : nsBooking.cargoConsignments,
                    portPair : portPair,
                    id : consLegId,
                    consignmentType : 'M',
                    consignmentId : subBookingId,
                    newLeg : 'Y'
                });
            }
        }
        return consLegs;
    }
    function convertToFloat(value) {
        if (!value) {
            value = '0';
        }
        return parseFloat(value);
    }
    function populateCargoDesc(element) {
        if ($('.mainSubBookFormTitle').text().indexOf('New Sub Booking') !== -1) {
            if (!nsBooking.cargoPopulateText) {
                $('#cargoDescriptionIcon').val($(element).val());
            }
        }
    }
    function convertBkgArea(element) {
        var length = nsBooking.findFrLength(element), width = nsBooking.findFrWidth(element), area = $(element)
            .closest('.mainSubBookingFormWrap').find('#bookedArea').val();
        if (area) {
            setBookingArea(element, length, width, area);
        }
    }
    function setBookingArea(element, length, width, area) {
        var scale = nsBooking.findBookType(element), perUnit = nsBooking.findBookPerUnit(element);
        if (perUnit === 'YES') {
            if (scale === '10') {
                if (length && width) {
                    area = math.eval(area / 144);
                    area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
                }
            } else {
                if ((scale === '20') && $.isNumeric(length) && $.isNumeric(width) && length && width) {
                    area = math.eval(length * width);
                    area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
                }
            }
        }
        $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val(area);
    }
    function convertBkgVolume(element) {
        var length = nsBooking.findFrLength(element), width = nsBooking.findFrWidth(element), height = nsBooking
            .findFrHeight(element), volume = $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val();
        if (volume) {
            setBookingVolume(element, length, width, height, volume);
        }
    }
    function setBookingVolume(element, length, width, height, volume) {
        var scale = nsBooking.findBookType(element), perUnit = nsBooking.findBookPerUnit(element);
        if (perUnit === 'YES') {
            if (scale === '10') {
                if (length && width && height) {
                    volume = math.eval(volume / 1728);
                    volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
                }
            } else {
                if ((scale === '20') && validateLenWidthHeight(length, width, height)) {
                    volume = nsCore.volumeCalc(length , width , height);
                    volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
                }
            }
        }
        $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val(volume);
    }
    function convertFrArea(element) {
        var length = nsBooking.findFrLength(element), width = nsBooking.findFrWidth(element), area = $(element)
            .closest('.mainSubBookingFormWrap').find('#freightedArea').val();
        if (area) {
            setFreightedArea(element, length, width, area);
        }
    }
    function setFreightedArea(element, length, width, area) {
        var scale = nsBooking.findFrType(element), perUnit = nsBooking.findFrPerUnit(element);
        if (perUnit === 'YES') {
            if (scale === '10') {
                if (length && width) {
                    area = math.eval(area / 144);
                    area = area.toFixed(3);
                }
            } else {
                if ((scale === '20') && $.isNumeric(length) && $.isNumeric(width) && (length !== '') && (width !== '')) {
                    area = math.eval(length * width);
                    area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
                }
            }
        }
        $(element).closest('.mainSubBookingFormWrap').find('#freightedArea').val(area);
    }
    function convertFrVolume(element) {
        var length = nsBooking.findFrLength(element), width = nsBooking.findFrWidth(element), height = nsBooking
            .findFrHeight(element), volume = $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume')
            .val();
        if (volume) {
            setFreightedVolume(element, length, width, height, volume);
        }
    }
    function setFreightedVolume(element, length, width, height, volume) {
        var scale = nsBooking.findFrType(element), perUnit = nsBooking.findFrPerUnit(element);
        if (perUnit === 'YES') {
            if (scale === '10') {
                if (length && width && height) {
                    volume = math.eval(volume / 1728);
                    volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
                }
            } else {
                if ((scale === '20') && validateLenWidthHeight(length, width, height)) {
                    volume = nsCore.volumeCalc(length , width , height);
                    volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
                }
            }
        }
        $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume').val(volume);
    }
    function getUnRoundedVolume(element){
   	 var length = nsBooking.findFrLength(element), width = nsBooking.findFrWidth(element), height = nsBooking
        .findFrHeight(element), volume = $(element).closest('.mainSubBookingFormWrap').find('#freightedVolume')
        .val();
    if (volume) {
        var scale = nsBooking.findFrType(element), perUnit = nsBooking.findFrPerUnit(element);
        if (perUnit === 'YES') {
            if (scale === '10') {
                if (length && width && height) {
                	 volume = nsCore.volumeCalc(length , width , height) / 1728;
                    
                }
            } else {
                if ((scale === '20') && validateLenWidthHeight(length, width, height)) {
                    volume = nsCore.volumeCalc(length , width , height);
                    
                }
            }
        }
      
    }
    return volume;
   }
    function validateLenWidthHeight(length, width, height) {
        var temp = (length && width && height && $.isNumeric(length) && $.isNumeric(width) && $.isNumeric(height));
        return temp;
    }
    function getCargoOnHold(element) {
        var cargoOnHold = '';
        if ($(element).attr('data-cargoOnHold')) {
            cargoOnHold = $(element).attr('data-cargoOnHold');
        }
        if (cargoOnHold === 'Y') {
            cargoOnHold = 'Yes';
        } else {
            cargoOnHold = 'No';
        }
        return cargoOnHold;
    }
    function getNewCargo(element) {
        var newCargo = '';
        if ($(element).attr('data-newCargo')) {
            newCargo = $(element).attr('data-newCargo');
        }
        if (newCargo === 'Y') {
            newCargo = 'Yes';
        } else {
            newCargo = 'No';
        }
        return newCargo;
    }
    function getCustRef(element) {
        var customerRef = '';
        if ($(element).attr('data-customerRef')) {
            customerRef = $(element).attr('data-customerRef');
        }
        return customerRef;
    }
    function getRegPlate(element) {
        var registrationPlate = '';
        if ($(element).attr('data-registrationPlate')) {
            registrationPlate = $(element).attr('data-registrationPlate');
        }
        return registrationPlate;
    }
    function getLoardTerm(element) {
        var loadTerm = '';
        if ($(element).attr('data-termLoad')) {
            loadTerm = $(element).attr('data-termLoad');
        }
        return loadTerm;
    }
    function getDiscTerm(element) {
        var discTerm = '';
        if ($(element).attr('data-termDisc')) {
            discTerm = $(element).attr('data-termDisc');
        }
        return discTerm;
    }
    function getLoardPort(element) {
        var loadPort = '';
        if ($(element).attr('data-loadPort')) {
            loadPort = $(element).attr('data-loadPort');
        }
        return loadPort;
    }
    function getDiscPort(element) {
        var discPort = '';
        if ($(element).attr('data-discPort')) {
            discPort = $(element).attr('data-discPort');
        }
        return discPort;
    }
    function getActualWeight(element) {
        var actualWeight = '';
        if ($(element).attr('data-actualWeight')) {
            actualWeight = $(element).attr('data-actualWeight');
        }
        return actualWeight;
    }
    function getWeightUnit(element) {
        var weightUnit = '';
        if ($(element).attr('data-WeightType')) {
            weightUnit = $(element).attr('data-WeightType');
            if (weightUnit === '20') {
                weightUnit = 'Kgs';
            } else if (weightUnit === '10') {
                weightUnit = 'Lbs';
            } else {
                weightUnit = '';
            }
        }
        return weightUnit;
    }
    function getReceiptNum(element) {
        var receiptNumber = '';
        if ($(element).attr('data-receiptNumber')) {
            receiptNumber = $(element).attr('data-receiptNumber');
        }
        return receiptNumber;
    }
    function getEquipNum(element) {
        var equipNumber = '';
        if ($(element).attr('data-equipNumber')) {
            equipNumber = $(element).attr('data-equipNumber');
        }
        return equipNumber;
    }
    function getEquipType(element) {
        var equipType = '';
        if ($(element).attr('data-equipType')) {
            equipType = $(element).attr('data-equipType');
        }
        return equipType;
    }
    function setTootipInfo(element, tooltipContent) {
        var receiptNumber = getReceiptNum($(element)), equipNumber = getEquipNum($(element)), equipType = getEquipType($(element)), ele = $('.toolTipWrapper');
        tooltipContent += '<tr><td class="bold">Dock Receipt</td><td> ' + receiptNumber + '</td></tr>';
        tooltipContent += '<tr><td class="bold">Equipment #</td><td> ' + equipNumber + '</td></tr>';
        tooltipContent += '<tr><td class="bold">Equipment Type</td><td> ' + equipType + '</td></tr>';
        tooltipContent += '</table></div>';
        $('.toolTipWrapper').html(tooltipContent).show();
        $(ele).position({
            my : 'left top',
            at : 'right top-25',
            collision : 'flipfit',
            of : $(element)
        });
        $('.leftArrowIcon').position({
            my : 'left top',
            at : 'right-11 top-5',
            collision : 'flipfit',
            of : $(element)
        });
    }
    function doNullCheckByCl(class1) {
        return (!!($(class1).val()));
    }
    function popCargoDat(ele) {
        var vinNo = ele.find('#vinSerialNbr').val(), currCode = ele.find('#currCode').val(), customerRef = ele.find(
            '.customerRef').val(), regPlate = ele.find('#regPlate').val(), declaredValDesc = ele.find(
            '#declaredValDesc').val(), newCargo = (ele.find('#newCargochk').prop('checked')) ? 'Y' : 'N', declaredCurrency = {}, cargo = {};
        if (!(ele.find('#newEquipmentNum option:selected').val())) {
            nsBooking.equipmentNbr = '';
        } else {
            nsBooking.equipmentNbr = ele.find('#newEquipmentNum option:selected').text();
        }
        declaredCurrency = {
            id : '0',
            currencyCode : currCode
        };
        cargo = {
            vinNumber : vinNo,
            declaredCurrency : declaredCurrency,
            declaredValue : parseFloat(declaredValDesc),
            regPlate : regPlate,
            customsRef : customerRef,
            newCargo : newCargo,
            timeStamp : nsBookDoc.cargoSubBookTimeStamp
        };
        return cargo;
    }
    function updateAreaVolume(element) {
        nsBooking.bookingArea(element);
        nsBooking.bookingVolume(element);
        nsBooking.freightArea(element);
        nsBooking.freightVolume(element);
    }
    function updateSubBookingQuantity(curElement) {
        var basisCal = $(curElement).parents('tr').find('.chargeBasis').val(), rate = $(curElement).parents('tr').find(
            '#chargeRate').val();
        if (basisCal === 'LS') {
            setQuantityForLS(curElement, basisCal, rate);
        } else if (basisCal === 'LU') {
            setQuantityForLU(curElement, basisCal, rate);
        } else if (basisCal === 'PC') {
            setQuantityForPC(curElement, basisCal, rate);
        } else if (basisCal === 'LM') {
            setQuantityForLM(curElement, basisCal, rate);
        } else if (basisCal === 'WW') {
            setQuantityForWW(curElement, basisCal, rate);
        } else if (basisCal === 'CB') {
            setQuantityForCB(curElement, basisCal, rate);
        } else if (basisCal === 'WL') {
            setQuantityForWL(curElement, basisCal, rate);
        } else if (basisCal === 'CF') {
            setQuantityForCF(curElement, basisCal, rate);
        } else if (basisCal === 'WM') {
            setQuantityForWM(curElement, basisCal, rate);
        } else {
            setQuantityForWL1(curElement, basisCal, rate);
        }
    }
    function setQuantityForLU(curElement, basisCal, rate) {
        var quantity, total;
        quantity = $('#totalBookedUnits').val();
        if (!isNaN(quantity)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(quantity, 0));
            if (quantity && rate && !isNaN(rate)) {
                total = math.eval(rate * nsCore.fixedTo(quantity, 3));
                var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
                total = nsCore.roundingNumbersCharges(total, currVal, basisCal);
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(
                    nsCore.roundingNumbersCharges(rate, currVal, basisCal));
            }
        }
    }
    function setQuantityForLS(curElement, basisCal, rate) {
        var quantity, total;
        quantity = 1;
        $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(quantity,0));
        if (rate && !isNaN(rate)) {
            total = math.eval(rate * nsCore.fixedTo(quantity, 3));
            var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
            total = nsCore.roundingNumbersCharges(total, currVal, "");
            $(curElement).parents('tr').find('#chargeTotal').val(total);
            $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
        }
    }
    function setQuantityForPC(curElement, basisCal, rate) {
        var quantity, total;
        quantity = $('#mainBookingFreightFreight').val();
        if (!isNaN(quantity)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(quantity, 2));
            if (quantity && rate && !isNaN(rate)) {
                total = math.eval((rate * nsCore.fixedTo(quantity, 2)) / 100);
                var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
                total = nsCore.roundingNumbersCharges(total, currVal, "");
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function setQuantityForLM(curElement, basisCal, rate) {
        var quantity, total, scale, noOfUnits,  length = $('input[name="freightedLength"]:not(:disabled)').val();
        noOfUnits = $('#totalBookedUnits').val();
        scale = $('#freightedMeasureUnit').val();
        if (scale === '10') {
            length = math.eval(length * nsBookDoc.quantityForLM);
        }
        quantity = math.eval(noOfUnits * length);
        quantity = convertToFloat(quantity);
        if (!isNaN(quantity)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo(quantity, 3));
            if (rate && !isNaN(rate)) {
                total = math.eval(rate *  $(curElement).parents('tr').find('#chargeQuantity').val());
                total = convertToFloat(total);
                var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
                total = nsCore.roundingNumbersCharges(total, currVal, "");
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function setQuantityForWW(curElement, basisCal, rate) {
        var total, scale, isPerUnit, noOfUnits, actualWeight;
        actualWeight = $('#freightedWeight').val();
        scale = $('#freightedMeasureUnit').val();
        isPerUnit = $('#freightedUnit').find('#shipInfovalidStatus').is(':checked');
        if (scale === '10') {
            actualWeight = math.eval(actualWeight * nsBookDoc.quantityForWM);
        }
        if (isPerUnit) {
            noOfUnits = $('#totalBookedUnits').val();
            actualWeight = math.eval(actualWeight * noOfUnits);
        }
        actualWeight = convertToFloat(actualWeight);
        if (!isNaN(actualWeight)) {
            $(curElement).parents('tr').find('#chargeQuantity').val(nsCore.fixedTo((actualWeight / 1000), 3));
            total = math.eval(rate * $(curElement).parents('tr').find('#chargeQuantity').val());
            total = convertToFloat(total);
            var currVal = $(curElement).parents('tr').find('#chargeCurrency').val();
            total = nsCore.roundingNumbersCharges(total, currVal, "");
            if (!isNaN(total)) {
                $(curElement).parents('tr').find('#chargeTotal').val(total);
                $(curElement).parents('tr').find('#chargeRate').val(nsCore.roundingNumbersCharges(rate, currVal, ""));
            }
        }
    }
    function updateChargeOnDimChange() {
        var chargeBasis = '';
        $('#subBookingChargesGrid tbody tr').each(function() {
            chargeBasis = $(this).find('.chargeBasis');
            updateSubBookingQuantity(chargeBasis);
        });
    }
    function populateCargoEquipment(equipmentNo) {
        vmsService.vmsApiService(function(response) {
            var status = '<option value="">-- Select --</option>';
            if (response) {
                response.sort(function(a, b) {
                    var val1 = a.id.toUpperCase(), val2 = b.id.toUpperCase();
                    return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
                });
                $.each(response, function(i, val) {
                    if ($.trim(val.id) === equipmentNo) {
                        status += '<option data-equipNo="' + escape(val.id) + '" value="' + escape(val.desc)
                            + '" selected>' + val.id;
                        $('#equipmentType').val(unescape(val.desc));
                    } else {
                        status += '<option data-equipNo="' + escape(val.id) + '" value="' + escape(val.desc) + '">'
                            + val.id + '</option>';
                    }
                });
                $('.equipmentNbr').html(status);
                if (nsBookDoc.frthLvlId) {
                    $('#' + nsBookDoc.frthLvlId).trigger('click');
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, '/Vms/masterdata/equipments', 'POST', null);
    }
    function fnDirtyPopDialog(fnGoForward, fnGoBackWard, formSelector) {
        if ($(formSelector).attr('data-dirty-popup')) {
            $('#dirtyFlagConfirmBox').dialog(
                {
                    resizable : false,
                    modal : true,
                    autoOpen : false,
                    draggable : false,
                    width : 400,
                    closeOnEscape : false,
                    open : function() {
                        $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
                        $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass(
                            'fa fa-remove noBgBor').removeClass('ui-corner-all ui-widget');
                    },
                    buttons : [
                        {
                            text : 'Yes',
                            click : function() {
                                $(formSelector).attr('data-dirty-popup', false);
                                nsBooking.globalBookingFlag.mainBookingFlag = false;
                                $(this).dialog('close');
                                fnGoForward();
                            }
                        }, {
                            text : 'No',
                            click : function() {
                                $(formSelector).attr('data-dirty-popup', false);
                                nsBooking.globalBookingFlag.mainBookingFlag = false;
                                $(this).dialog('close');
                                fnGoBackWard();
                            }
                        }
                    ]
                }).dialog('open');
        }
    }
    function fnHandleActionsDirtyFlags(paramsObj) {
        var params = paramsObj || {}, actionPoints = params.additionalActionPoints || '', formSelector = params.formSelector
            || '', fnGoForward = params.fnGoForward || '', fnGoBackWard = params.fnGoBackWard || '';
        $(document).find(formSelector + ' input[value=Save]').on('click', function() {
            if (!(formSelector === '#cargoList' && $('input[name="cargoVIN"]').val())) {
                $(formSelector).attr('data-dirty-popup', false);
                nsBooking.globalBookingFlag.mainBookingFlag = false;
            }
            return false;
        });
        $(document).find(actionPoints).on('click', function(event) {
            if ($(formSelector).attr('data-dirty-popup') === 'true') {
                // prevent any parent handlers from being executed
                event.preventDefault();
                // to stop bubbling effect
                event.stopPropagation();
                // prevent parent handlers and other handlers from executing
                event.stopImmediatePropagation();
                fnDirtyPopDialog(fnGoForward, fnGoBackWard, formSelector);
                return false;
            }
        });
    }
    function headerLevelLegBasedEnableDisable() {
        var screen = nsCore.appModel.selected;
        if (screen === 'booking' || screen === 'bl') {
        	
            $('#createFreshBook input:not(input[type=hidden], table input, input[type=submit]),select#mainContract')
                .attr('disabled', true);
            $(
                '#billLadingDetailsForm input:not(input[type=hidden], input[type=button]), #billLadingDetailsForm select, #billLadingDetailsForm textarea')
                .attr('disabled', true);
            $('#billLadingDetailsForm a.linkButton, #billLadingDetailsForm span.linkButton').addClass('disabledLink');
        }
        if(!nsDoc && screen === 'booking'){
        	  $('#createFreshBook input#freshBookSaveBtn.orangeButton.saveButton')
              .attr('disabled', false);
        }
        
    }
    function loadChargeSummaryTotalsGrid(response) {
        var totalFreightedWeight = parseFloat(response.totalFreightedWeight).toFixed(0),
            totalFreightedArea = parseFloat(response.totalFreightedArea).toFixed(3),
            totalFreightedTons = parseFloat(response.totalFreightedTons).toFixed(3),
            totalFreightedVolume = parseFloat(response.totalFreightedVolume).toFixed(3);

    return ('<div class="summaryTotals1"><div class="unitsDiv"><p class="usedCar">'
		+ '<span class="fontWeight">Total no of Units: </span><span>' + response.totalBookedUnits
		+ '</span></p></div></div><div class="summaryTotals2"><div class="unitsDiv"><p class="usedCar">'
		+ '<span class="fontWeight">Total Area: </span><span class="value1">' +thousandSeparator(totalFreightedArea)
		+ ' m<sup>2</sup></span></p></div><div class="metersDiv"><p class="usedCar">'
        + '<span class="fontWeight">Total Volume: ' + '</span><span>' + thousandSeparator(totalFreightedVolume)
        + ' m<sup>3</sup></span></p></div></div><div class="summaryTotals3"><div class="unitsDiv"><p class="usedCar">'
        + '<span class="fontWeight">Total Weight: ' + '</span><span class="value2">' + thousandSeparator(totalFreightedWeight)
		+ ' kg</span></p></div><div class="metersDiv"><p class="usedCar">'
        + '<span class="fontWeight">Total Freight Tons: </span><span>' + thousandSeparator(totalFreightedTons)
		+ '</span></p></div></div>');
    }
    function thousandSeparator(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ' ' + '$2');
        }
        return x1 + x2;
    }
function loadChargeSummaryContentGrid(response) {
		
		var summary = response.subBookingModelList,
			chargeSummaryContent = '',
			count = 0,
			map = {};
		if(nsDoc){
			nsDoc.fectSubBookingObj=response;
		}
		
        $.each(summary, function(i, obj) {
        	var lengthNo = 0,
	            appe = '',
	            originalLen = 4,
	            k = 0,
	            subTitle = '';
    
	        lengthNo = originalLen - obj.subBookingNo.length;
	        for (k = 0; k < lengthNo; k++) {
	            appe += '0';
	        }
	        subTitle = appe + obj.subBookingNo + '-' + obj.bookedUnits + '-' + obj.cargoText;
	        map[obj.subBookingId] = subTitle;
        });

		$.each(summary,	function(i, obj) {
			var freightValue = obj.totalFreight,
				freightCurrency = obj.currencyCode,
				freighValueUSD = obj.freightInUSD,
				chargeContent = '',
				totalChargeFreightUSD = obj.freightInUSD,
				chargeUSDContent = '',classeo = (i%2) ? 'odd' : 'even', padClass = (i === summary.length - 1) ? ' extraPad' : '',
				check = summary[count].chargeModelList;

			if (!freightCurrency) {
				freightCurrency = '';
			}

			if ((check.length > 0)) {
				$.each(summary[count].chargeModelList, function(summaryCou, viewSumObj) {
						var chargeValue = (viewSumObj.total || viewSumObj.total===0) ? nsCore.roundingNumbersCharges(viewSumObj.total, viewSumObj.currencyCode, "") : '',
							chargeCurr = viewSumObj.currencyCode,
							chargeValueUSD = viewSumObj.chargeInUSD ? parseFloat(viewSumObj.chargeInUSD).toFixed(2) : '';
							
						totalChargeFreightUSD = parseFloat(totalChargeFreightUSD) + parseFloat(viewSumObj.chargeInUSD);
						chargeUSDContent += '<p class="currDetails greyColor">' + nsBookDoc.thousandSeparator(chargeValueUSD) + ' USD</p>';
						chargeContent += '<p class="currDetails greyColor">' + nsBookDoc.thousandSeparator(chargeValue) + ' ' + chargeCurr + '</p>';
					});
			} else {
	               chargeUSDContent += '<p class="currDetails greyColor"> </p>';
	                chargeContent += '<p class="currDetails greyColor defaultCharge"> </p>';
	        }

			count++;
			
			freighValueUSD = freighValueUSD ? parseFloat(freighValueUSD).toFixed(2) : '';
            totalChargeFreightUSD = (totalChargeFreightUSD || totalChargeFreightUSD === 0) ? parseFloat(totalChargeFreightUSD).toFixed(2) : '';
            freightValue = freightValue ? nsCore.roundingNumbersCharges(freightValue, freightCurrency, "") : '';
			
			chargeSummaryContent += '<div class="csCntntSubdiv1 ' + classeo + '"><div id="csSubDiv1"><p class="usedCar fontWeight">'
			+ map[obj.subBookingId] + '</p></div><div class="columnDiv ' + padClass + '"><div id="csSubDiv2"><div class="bookFreightVal2">'
			+ '<p class="totalsDetails"> Freight</p></div><div class="bookChargeVal2">'
			+ '<p class="totalsDetails">Charge</p></div>' + '<div class=""><p class="totalsDetails  totalColor'
			+ ' lineColor1">Total</p> </div></div><div id="csSubDiv3"> <div class="bookFreightVal3">'
			+ '<p class="currDetails greyColor">' + nsBookDoc.thousandSeparator(freighValueUSD) + ' USD</p></div><div class="bookChargeVal3">'
			+ chargeUSDContent + '</div><div class="mb10p"><p class="currDetails totalColor lineColor1">'
			+ nsBookDoc.thousandSeparator(totalChargeFreightUSD) + ' USD</p></div></div></div><div id="csSubDiv4" class="' + padClass + '"><div class="diffFreightVal">'
			+ '<p class="currDetails greyColor">' + nsBookDoc.thousandSeparator(freightValue) + ' ' + freightCurrency + '</p></div>'
			+ '<div class="diffChargeVal">' + chargeContent +'</div></div></div><div class="clearAll"></div>';

		});
		return chargeSummaryContent;
	}
	function bookingVesselListGridColAdj(){
		if ($.fn.DataTable.fnIsDataTable($('#bookingVesselListGrid'))) {
            $('#bookingVesselListGrid').dataTable().api().columns.adjust();
        }
	}
	function onConfirmDialogOpen(text, title, flag){
		
			var titleText = '';
            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
            	.removeClass('ui-corner-all ui-widget');
            titleText = $('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
        	titleText = '<i class="fa fa-warning"></i>' + titleText;
        	$('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
			$('#confirmDialogPopup .rowItem').text(text);
			$('#confirmDialogPopup').find('form').attr('id', title);
		
	}
	function setupPrtVal(trElement) {
    	for(var i=0;i<3;i++) {
    		if(nsBookDoc.selectePossibleVoyage[i]!=null) {
	    		if(nsBookDoc.selectePossibleVoyage[i].loadPortCode!=null) {
		        	$('#mLoadPortCode'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].loadPortCode);
		        }else{
		        	$('#mLoadPortCode'+ (i+1)).val("");
		        }
	    		if(nsBookDoc.selectePossibleVoyage[i].discPortCode!=null) {
		        	$('#mDiscPortCode'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].discPortCode);
		        }else{
		        	$('#mDiscPortCode'+ (i+1)).val("");
		        }
	    		if(nsBookDoc.selectePossibleVoyage[i].trade!=null) {
		        	$('#mTrade'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].trade);
		        }else{
		        	$('#mTrade'+ (i+1)).val("");
		        }
	    		if(nsBookDoc.selectePossibleVoyage[i].trade!=null) {
		        	$('#mallocationStatus'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].firm);
		        }else{
		        	$('#mallocationStatus'+ (i+1)).val("");
		        }
    		}
		}
     }
	function upPrtVal(trElement) {
    	for(var i=0;i<3;i++) {
    		if(nsBookDoc.selectePossibleVoyage[i]) {
	    		if(nsBookDoc.selectePossibleVoyage[i].vesselVoyage) {
		        	$('#mVesselCode'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].vesselVoyage.split('/')[0]);
		        	$('#mVoyageNumber'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].vesselVoyage.split('/')[1]);
		        }else{
		        	$('#mVesselCode'+ (i+1)).val("");
		        	$('#mVoyageNumber'+ (i+1)).val("");
		        }
	    		if(nsBookDoc.selectePossibleVoyage[i].destinationPortCallID) {
		        	$('#mDestinationPortCallID'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].destinationPortCallID);
		        	
		        }else{
		        	$('#mDestinationPortCallID'+ (i+1)).val("");
		        	
		        }
	    		if(nsBookDoc.selectePossibleVoyage[i].sourcePortCallID) {
		        	$('#mSourcePortCallID'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].sourcePortCallID);
		        	
		        }else{
		        	$('#mSourcePortCallID'+ (i+1)).val("");
		        	
		        }
	    		if(nsBookDoc.selectePossibleVoyage[i].legType) {
		        	$('#mTranshipmentType'+ (i+1)).val(nsBookDoc.selectePossibleVoyage[i].legType);
		        	
		        }else{
		        	$('#mTranshipmentType'+ (i+1)).val("");
		        	
		        }
    		}
    		
		}
    }
	
    sbmObj = {
        'setQuantityForCB' : setQuantityForCB,
        'setQuantityForWL' : setQuantityForWL,
        'setQuantityForCF' : setQuantityForCF,
        'setQuantityForWM' : setQuantityForWM,
        'setQuantityForWL1' : setQuantityForWL1,
        'populateEquipment' : populateEquipment,
        'modelTypeChange' : modelTypeChange,
        'bookingAndSubBookingCreation' : bookingAndSubBookingCreation,
        'copyBookingAndSubBooking' : copyBookingAndSubBooking,
        'validateCopyBookingFields' : validateCopyBookingFields,
        'constructLegsFromRoute' : constructLegsFromRoute,
        'buildConsLegs' : buildConsLegs,
        'convertToFloat' : convertToFloat,
        'populateCargoDesc' : populateCargoDesc,
        'convertBkgArea' : convertBkgArea,
        'setBookingArea' : setBookingArea,
        'convertBkgVolume' : convertBkgVolume,
        'setBookingVolume' : setBookingVolume,
        'convertFrArea' : convertFrArea,
        'setFreightedArea' : setFreightedArea,
        'convertFrVolume' : convertFrVolume,
        'setFreightedVolume' : setFreightedVolume,
        'validateLenWidthHeight' : validateLenWidthHeight,
        'getCargoOnHold' : getCargoOnHold,
        'getNewCargo' : getNewCargo,
        'getCustRef' : getCustRef,
        'getRegPlate' : getRegPlate,
        'getLoardTerm' : getLoardTerm,
        'getDiscTerm' : getDiscTerm,
        'getLoardPort' : getLoardPort,
        'getDiscPort' : getDiscPort,
        'getActualWeight' : getActualWeight,
        'getWeightUnit' : getWeightUnit,
        'getReceiptNum' : getReceiptNum,
        'getEquipNum' : getEquipNum,
        'getEquipType' : getEquipType,
        'setTootipInfo' : setTootipInfo,
        'doNullCheckByCl' : doNullCheckByCl,
        'popCargoDat' : popCargoDat,
        'updateAreaVolume' : updateAreaVolume,
        'setQuantityForLU' : setQuantityForLU,
        'setQuantityForLS' : setQuantityForLS,
        'setQuantityForPC' : setQuantityForPC,
        'setQuantityForLM' : setQuantityForLM,
        'setQuantityForWW' : setQuantityForWW,
        'updateChargeOnDimChange' : updateChargeOnDimChange,
        'getUnRoundedVolume' : getUnRoundedVolume
    };
    $.extend(true, nsBooking, sbmObj);
    bookDocObj = {
        'populateCargoEquipment' : populateCargoEquipment,
        'fnHandleActionsDirtyFlags' : fnHandleActionsDirtyFlags,
        'updateSubBookingQuantity' : updateSubBookingQuantity,
        'headerLevelLegBasedEnableDisable' : headerLevelLegBasedEnableDisable,
        'loadChargeSummaryTotalsGrid' : loadChargeSummaryTotalsGrid,
        'loadChargeSummaryContentGrid' :loadChargeSummaryContentGrid,
        'thousandSeparator' : thousandSeparator,
        'onConfirmDialogOpen': onConfirmDialogOpen,
        'bookingVesselListGridColAdj' : bookingVesselListGridColAdj,
        'setupPrtVal' :setupPrtVal,
        'upPrtVal' : upPrtVal
    }
    $.extend(true, nsBookDoc, bookDocObj);
    $(document).ready(function() {
        $(document).on('keydown', function(event) {
            if (((event.keyCode ? event.keyCode : event.which) === 66) && event.shiftKey && event.ctrlKey) {
                event.preventDefault();
                $('.mainBookingListWrap #subBoookingSearch').focus();
            }
            if (((event.keyCode ? event.keyCode : event.which) === 83) && event.ctrlKey && event.shiftKey) {
                event.preventDefault();
                $('.subBookListColWrap #subBoookingSearch').focus();
            }
        });
        
        $(document).on('click', '#bkdUnitClose, #bkdUnitsCancelButton', function(){
        	if (nsBooking.globalBookingFlag.mainBookingFlag) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                fnDirtyPopDialog(nsBookDoc.fnBookingUnitForward, nsBookDoc.fnBookingUnitBackward, '#bookingUnitForm');
        	}
               
        })
    });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc, this.doc);
