/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore) {
    var qbObj = {};

    function validOriginDestination(subBookEle, rateButton) {
        if (!($('#customerCode').val()) || !($('#origin').val())) {
            nsBooking.disableRateButton(rateButton);
            return 1;
        }
        if (!(nsBooking.getContract()) || !($('#destination').val()) || !($(subBookEle).find('#bookedUnits').val())) {
            nsBooking.disableRateButton(rateButton);
            return 1;
        }
        return 0;
    }

    function validDimension(subBookEle, rateButton) {
        var perUnit = $(subBookEle).find('#perUnitID').is(':checked');
        if ((perUnit) &&
            (!($(subBookEle).find('#bkLength').val()) || !($(subBookEle).find('#bkWidth').val()) ||
                !($(subBookEle).find('#bkHeight').val()))) {
            nsBooking.disableRateButton(rateButton);
            return 1;
        }
        if (!($(subBookEle).find('#bkWeight').val())) {
            nsBooking.disableRateButton(rateButton);
            return 1;
        }
        return 0;
    }

    function validCargo(subBookEle, rateButton) {
        if (!($(subBookEle).find('#cargoType').val()) || ($(subBookEle).find('#newCargo').val() === '0')) {
            nsBooking.disableRateButton(rateButton);
            return 1;
        }
        if (!($(subBookEle).find('#bkArea').val()) || !($(subBookEle).find('#bkVolume').val())) {
            nsBooking.disableRateButton(rateButton);
            return 1;
        }
        return 0;
    }

    function enableDisableFRate(element) {
        var subBookEle = $(element).closest('.subBookingCalculation'),
            rateButton = $(subBookEle).find('.freightApplyRate');
        if(nsBooking.rateLinkAccessFlag){
        	$(rateButton).removeAttr('disabled');
            $(rateButton).removeClass('disabledBut');
        } else {
        	$(rateButton).attr('disabled', 'disabled');
            $(rateButton).addClass('disabledBut');
        }
    }

    function bookNumValid(response, bookingId, functionName, bookingNumber) {
        var isSearchChanged1 = false,
            searchBookingNo = $('#bookingNumber').val().trim(),
            bookingNoQuery = $('#bookingNoSearch').val().trim();
        if ((bookingNoQuery === 'Need Exact match') && (searchBookingNo && searchBookingNo !== bookingNumber)) {
            isSearchChanged1 = true;
        }
        if ((bookingNoQuery === 'Begins with') && (bookingNumber.substr(0, searchBookingNo.length) !== searchBookingNo)) {
            isSearchChanged1 = true;
        }
        return bookNumValid2(searchBookingNo, bookingNoQuery, bookingNumber, isSearchChanged1);
    }

    function bookNumValid2(searchBookingNo, bookingNoQuery, bookingNumber, isSearchChanged1) {
        if ((bookingNoQuery === 'Contains') && ((bookingNumber.indexOf(searchBookingNo) === -1))) {
            isSearchChanged1 = true;
        }
        if ((bookingNoQuery === 'Ends with') &&
            ((bookingNumber.substr(bookingNumber.lastIndexOf(searchBookingNo))) !== searchBookingNo)) {
            isSearchChanged1 = true;
        }
        return isSearchChanged1;
    }

    function dataValid(response, bookingId, functionName, bookingNumber) {
        var isSearchChanged = bookNumValid(response, bookingId, functionName, bookingNumber),
            searchBlStatus = $('#blStatus').val().trim(),
            searchVesselCode = $('#vesselCode').val().trim(),
            searchVoyage = $('#voyage').val().trim(),
            blStatusDesc = '';
        if (!isSearchChanged) {
            $.each(response.subBookingModelList, function(i, obj) {
                if (obj.billOfLadingModel) {
                    blStatusDesc = obj.billOfLadingModel.bolStatusDesc;
                }
                if (searchBlStatus && searchBlStatus !== blStatusDesc) {
                    isSearchChanged = true;
                }
            });
        }
        if (!isSearchChanged) {
            $.each(response.subBookingModelList, function(i, obj) {
                $.each(obj.consignmentLegModelList, function(j, consignmentLegModel) {
                    if (searchVesselCode && searchVesselCode !== consignmentLegModel.vesselCode) {
                        isSearchChanged = true;
                    }
                    if (searchVoyage && searchVoyage !== consignmentLegModel.voyageNo) {
                        isSearchChanged = true;
                    }
                });
            });
        }
        return isSearchChanged;
    }

    function isLocationMatch() {
        var customer1 = $('#custCode').val().trim(),
            originPort1 = $('#originPort').val().trim(),
            destination1 = $('#destPort').val().trim(),
            loadPort1 = $('#loadPort').val().trim(),
            dischargePort1 = $('#discPort').val().trim();
        if (!originPort1 && !loadPort1 && !destination1 && !dischargePort1 && !customer1) {
            return 1;
        }
        return locEmptyCheck(customer1, originPort1, destination1, loadPort1, dischargePort1);
    }

    function locEmptyCheck(customer1, originPort1, destination1, loadPort1, dischargePort1) {
        var origin = $('#origin').val(),
            destination = $('#destination').val(),
            customerCode = $('#customerCode').val();
        if ((originPort1 === origin) || (loadPort1 === origin) || (destination1 === destination) ||
            (dischargePort1 === destination) || (customer1 === customerCode)) {
            return 1;
        }
        return 0;
    }

    function isNewBookingMatchingSearch() {
        var res = isLocationMatch(),
            cargoType1 = $('#cargoType').val(),
            isCargoTypeSame = false;
        if (res === 1) {
            return true;
        }
        $('.subBookingCalculation').each(function() {
            var cargoType = $(this).find('#cargoType').val();
            if (cargoType === cargoType1) {
                isCargoTypeSame = true;
                return;
            }
        });
        return isCargoTypeSame;
    }

    function totalSelected(element) {
        var bookedUnits = $(element).closest('.subBookingCalculation').find('#bookedUnits').val(),
            area = 0,
            volume = 0,
            weight = 0,
            weightVal = 0;
        $(element).closest('.bookedDimensions').find('#bkLength').attr('readonly', 'readonly');
        $(element).closest('.bookedDimensions').find('#bkWidth').attr('readonly', 'readonly');
        $(element).closest('.bookedDimensions').find('#bkHeight').attr('readonly', 'readonly');
        $(element).closest('.bookedDimensions').find('#bkArea').removeAttr('readonly');
        $(element).closest('.bookedDimensions').find('#bkVolume').removeAttr('readonly');
        if (bookedUnits && $.isNumeric(bookedUnits)) {
            area = $(element).closest('.bookedDimensions').find('#bkArea').val();
            if (area) {
                area *= bookedUnits;
                area = area.toFixed(3);
                $(element).closest('.bookedDimensions').find('#bkArea').val(area);
            }
            volume = $(element).closest('.bookedDimensions').find('#bkVolume').val();
            if (volume) {
                volume *= bookedUnits;
                volume = volume.toFixed(3);
                $(element).closest('.bookedDimensions').find('#bkVolume').val(volume);
            }
            weight = $(element).closest('.bookedDimensions').find('#bkWeight').val();
            if (weight) {
                weightVal = weight * bookedUnits;
                weightVal = weightVal.toFixed(0);
                $(element).closest('.bookedDimensions').find('#bkWeight').val(weightVal);
            }
        } else {
            $(element).closest('.bookedDimensions').find('#bkArea').val('');
            $(element).closest('.bookedDimensions').find('#bkVolume').val('');
        }
    }

    function modelTypChange(element) {
        var rootElement = $(element).closest('.subBookingCalculation'),
            make = rootElement.find('#bookingCargoMake1').val(),
            model = rootElement.find('#bookingCargoModel1').val();
        if (make || model) {
            rootElement.find('#makeModelListLink1').removeAttr('disabled');
            rootElement.find('#makeModelListLink1').removeClass('disabledBut');
        } else {
            rootElement.find('#makeModelListLink1').attr('disabled', 'disabled');
            rootElement.find('#makeModelListLink1').addClass('disabledBut');
        }
    }

    function noVoyageSelected() {
        nsBooking.noVoyage = true;
    }

    function clearTrashipmentFieldsQuick() {
        $('#qhLoadPortCode1').val('');
        $('#qhLoadPortCode2').val('');
        $('#qhLoadPortCode3').val('');
        $('#qhDiscPortCode1').val('');
        $('#qhDiscPortCode2').val('');
        $('#qhDiscPortCode3').val('');
        $('#qhTrade1').val('');
        $('#qhTrade2').val('');
        $('#qhTrade3').val('');
        $('#qhSourcePortCallID1').val('');
        $('#qhSourcePortCallID2').val('');
        $('#qhSourcePortCallID3').val('');
        $('#qhDestinationPortCallID1').val('');
        $('#qhDestinationPortCallID2').val('');
        $('#qhDestinationPortCallID3').val('');
        $('#qhTranshipmentType1').val('');
        $('#qhTranshipmentType2').val('');
        $('#qhTranshipmentType3').val('');
    }

    function loadVals(key) {
        var values = key.split('-');
        nsBooking.mainTrade = values[0];
        nsBooking.mainSrcPort = values[1];
        nsBooking.maindestPort = values[2];
        nsBooking.carReAvl = values[3];
        nsBooking.puReAvl = values[4];
        nsBooking.hhReAvl = values[5];
        nsBooking.stReAvl = values[6];
    }

    function loadPortInfo(trElement) {
        $('#qhloadPortCode1').val($(trElement).find('#qloadPortCode1').text());
        $('#qhloadPortCode2').val($(trElement).find('#qloadPortCode2').text());
        $('#qhloadPortCode3').val($(trElement).find('#qloadPortCode3').text());
        $('#qhdiscPortCode1').val($(trElement).find('#qdiscPortCode1').text());
        $('#qhdiscPortCode2').val($(trElement).find('#qdiscPortCode2').text());
        $('#qhdiscPortCode3').val($(trElement).find('#qdiscPortCode3').text());
        $('#qhtrade1').val($(trElement).find('#qtrade1').text());
        $('#qhtrade2').val($(trElement).find('#qtrade2').text());
        $('#qhtrade3').val($(trElement).find('#qtrade3').text());
    }

    function noVoyCheck(key) {
        if (!key) {
            return 1;
        }
        if (key === 'No voyage') {
            noVoyageSelected();
            return 1;
        }
        nsBooking.noVoyage = false;
        return 0;
    }

    function routeChanged(element) {
        var key = $(element).val(),
            res = noVoyCheck(key),
            trElement = $(element).closest('#singleVoyageRow'),
            i = 1,
            ids = findPCVIDs(trElement),
            postUrl1 = '';
        clearTrashipmentFieldsQuick();
        if (res === 1) {
            return;
        }
        $('.subBookingCalculation').each(function() {
            $(this).find('#allocType').removeAttr('disabled');
        });
        loadVals(key);
        $(trElement).find('.singleLeg').each(function() {
            var trans = $(this).find('#qtranshipmentType' + i).val(),
                alloc = $(this).find('.alloc');
            if (trans === 'M') {
                $(alloc).each(function() {
                    var puVal = $(this).find('.PU').text(),
                        stVal = $(this).find('.ST').text();
                    if (puVal.indexOf('---') !== -1) {
                        nsBooking.puReAvl = nsBooking.carReAvl;
                    }
                    if (stVal.indexOf('---') !== -1) {
                    	nsBooking.stReAvl = nsBooking.hhReAvl;
                    }
                });
            }
            i++;
        });
        i = 1;
        loadPortInfo(trElement);
        doUpTransType(trElement);
        if (ids) {
            postUrl1 = nsBooking.fvCapacity + ids;
            vmsService.vmsApiService(function(response) {
                if (response && response.particulars) {
                    nsBooking.maxHeightCapacity = response.particulars.maxCargoHeight;
                    nsBooking.maxWeightCapacity = response.particulars.maxRampWeight;
                } else {
                	if(response !== '') {
                		nsCore.showAlert(nsBooking.errorMsg);
                	}
                }
            }, postUrl1, 'GET', null);
        }
    }

    function findPCVIDs(trElement) {
        var ids = '';
        if ($(trElement).find('#vesselId1').val() && $(trElement).find('#qtranshipmentType1').val() === 'M') {
            ids = $(trElement).find('#vesselId1').val();
        } else if ($(trElement).find('#vesselId2').val() && $(trElement).find('#qtranshipmentType2').val() === 'M') {
            ids = $(trElement).find('#vesselId2').val();
        } else {
            if ($(trElement).find('#vesselId3').val() && $(trElement).find('#qtranshipmentType3').val() === 'M') {
                ids = $(trElement).find('#vesselId3').val();
            }
        }
        return ids;
    }

    function doUpTransType(trElement) {
        if ($(trElement).find('#qdestinationPortCallID1').val()) {
            $('#qhdestinationPortCallID1').val($(trElement).find('#qdestinationPortCallID1').val());
        }
        if ($(trElement).find('#qdestinationPortCallID2').val()) {
            $('#qhdestinationPortCallID2').val($(trElement).find('#qdestinationPortCallID2').val());
        }
        if ($(trElement).find('#qdestinationPortCallID3').val()) {
            $('#qhdestinationPortCallID3').val($(trElement).find('#qdestinationPortCallID3').val());
        }
        if ($(trElement).find('#qsourcePortCallID1').val()) {
            $('#qhsourcePortCallID1').val($(trElement).find('#qsourcePortCallID1').val());
        }
        if ($(trElement).find('#qsourcePortCallID2').val()) {
            $('#qhsourcePortCallID2').val($(trElement).find('#qsourcePortCallID2').val());
        }
        if ($(trElement).find('#qsourcePortCallID3').val()) {
            $('#qhsourcePortCallID3').val($(trElement).find('#qsourcePortCallID3').val());
        }
        $('#qhtranshipmentType1').val($(trElement).find('#qtranshipmentType1').val());
        $('#qhtranshipmentType2').val($(trElement).find('#qtranshipmentType2').val());
        $('#qhtranshipmentType3').val($(trElement).find('#qtranshipmentType3').val());
    }

    function updateDims(element) {
        var perUnitE = $(element).closest('.subBookingCalculation').find('.bookedDimensions').find('#perUnitID'),
            isChecked = $(perUnitE).is(':checked');
        if (!isChecked) {
            perUnitSelected(perUnitE);
        }
    }

    function disDia(element) {
        $(element).closest('.bookedDimensions').find('#bkLength').removeAttr('readonly');
        $(element).closest('.bookedDimensions').find('#bkWidth').removeAttr('readonly');
        $(element).closest('.bookedDimensions').find('#bkHeight').removeAttr('readonly');
        $(element).closest('.bookedDimensions').find('#bkArea').attr('readonly', 'readonly');
        $(element).closest('.bookedDimensions').find('#bkVolume').attr('readonly', 'readonly');
    }

    function doUpdArea(element, scale, bookedUnits) {
        var area = $(element).closest('.bookedDimensions').find('#bkArea').val(),
            length = $(element).closest('.bookedDimensions').find('#bkLength').val(),
            width = $(element).closest('.bookedDimensions').find('#bkWidth').val();
        if ($.isNumeric(length) && $.isNumeric(width) && length && width) {
            area = ((length * width));
            if (scale === '10') {
                area = area / 144;
            }
            area = area.toFixed(3);
        } else {
            if (area && $.isNumeric(area)) {
                area /= bookedUnits;
                area = area.toFixed(3);
            }
        }
        $(element).closest('.bookedDimensions').find('#bkArea').val(area);
        doUpdVol(element, scale, bookedUnits, area, length, width);
    }

    function doUpdVol(element, scale, bookedUnits, area, length, width) {
        var height = $(element).closest('.bookedDimensions').find('#bkHeight').val(),
            volume = $(element).closest('.bookedDimensions').find('#bkVolume').val();
        if ($.isNumeric(length) && $.isNumeric(width) && length && width && $.isNumeric(height) && height) {
            volume = nsCore.volumeCalc(length , width , height);
            if (scale === '10') {
                volume = volume / 1728;
            }
            volume = volume.toFixed(3);
        } else {
            if (volume && $.isNumeric(volume)) {
                volume /= bookedUnits;
                volume = volume.toFixed(3);
            }
        }
        $(element).closest('.bookedDimensions').find('#bkVolume').val(volume);
    }

    function perUnitSelected(element) {
        var scale = nsBooking.getDScale(element),
            bookedUnits = $(element).closest('.subBookingCalculation').find('#bookedUnits').val(),
            weight = 0,
            weightVal = 0;
        disDia(element);
        if ((bookedUnits) && (bookedUnits.trim() !== '0') && $.isNumeric(bookedUnits)) {
            doUpdArea(element, scale, bookedUnits);
            weight = $(element).closest('.bookedDimensions').find('#bkWeight').val();
            if (weight) {
                weightVal = weight / bookedUnits;
                weightVal = weightVal.toFixed(0);
                $(element).closest('.bookedDimensions').find('#bkWeight').val(weightVal);
            }
        } else {
            nsBooking.calculateArea(element);
            nsBooking.calculateVolume(element);
        }
        enableDisableDims(element);
    }

    function isEnableAreaAndVol(element, isEnable) {
        if (isEnable) {
            $(element).closest('.bookedDimensions').find('#bkArea').removeAttr('readonly');
            $(element).closest('.bookedDimensions').find('#bkVolume').removeAttr('readonly');
        } else {
            $(element).closest('.bookedDimensions').find('#bkArea').attr('readonly', 'readonly');
            $(element).closest('.bookedDimensions').find('#bkVolume').attr('readonly', 'readonly');
        }
    }

    function enableDisableDims(element) {
        var len = $(element).closest('.bookedDimensions').find('#bkLength').val(),
            wid = $(element).closest('.bookedDimensions').find('#bkWidth').val(),
            hei = $(element).closest('.bookedDimensions').find('#bkHeight').val(),
            area = $(element).closest('.bookedDimensions').find('#bkArea').val(),
            vol = $(element).closest('.bookedDimensions').find('#bkVolume').val(),
            perUnit = $(element).closest('.bookedDimensions').find('#perUnitID').is(':checked');
        areaVolCheck(element, len, wid, hei, perUnit);
        if ((area || vol) && (!len && !wid && !hei)) {
            isEnableDim(element, false);
        } else {
            if (perUnit) {
                isEnableDim(element, true);
            }
        }
    }

    function areaVolCheck(element, len, wid, hei, perUnit) {
        if (((len) || (wid) || (hei)) && perUnit) {
            isEnableAreaAndVol(element, false);
        } else {
            isEnableAreaAndVol(element, true);
        }
    }

    function isEnableDim(element, isEnable) {
        if (isEnable) {
            $(element).closest('.bookedDimensions').find('#bkLength').removeAttr('readonly');
            $(element).closest('.bookedDimensions').find('#bkWidth').removeAttr('readonly');
            $(element).closest('.bookedDimensions').find('#bkHeight').removeAttr('readonly');
        } else {
            $(element).closest('.bookedDimensions').find('#bkLength').attr('readonly', 'readonly');
            $(element).closest('.bookedDimensions').find('#bkWidth').attr('readonly', 'readonly');
            $(element).closest('.bookedDimensions').find('#bkHeight').attr('readonly', 'readonly');
        }
    }

    function updateCargoState(element) {
        var cargoTypeID = $(element).val(),
            i = 0,
            option = '',
            cargoStateURL = '';
        if (!nsBooking.cargoStatesListArray || nsBooking.cargoStatesListArray.length === 0) {
            $('#cargoState option').each(function() {
                nsBooking.cargoStatesListArray.push({
                    cargoState: $(this).val(),
                    cargoStateDesc: $(this).text()
                });
            });
        }
        $(element).closest('.subBookingCalculation').find('#cargoState').children('option').length = 0;
        $(element).closest('.subBookingCalculation').find('#cargoState').html('');
        if (!cargoTypeID) {
            for (i = 0; i < nsBooking.cargoStatesListArray.length; i++) {
                option = '<option value=' + nsBooking.cargoStatesListArray[i].cargoState + '>' +
                    nsBooking.cargoStatesListArray[i].cargoStateDesc + '</option>';
                $(element).closest('.subBookingCalculation').find('#cargoState').append(option);
            }
            return;
        }
        cargoStateURL = nsBooking.bookingCargoStates + cargoTypeID;
        vmsService.vmsApiService(function(response) {
            if (response) {
            	response.responseData.sort(function(a, b) {
                    var val1 = a.desc.toUpperCase(),
                    	val2 = b.desc.toUpperCase();
                    return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
                });
                $.each(response.responseData, function(ind, val) {
                    var option1 = '';
                    if (val.code) {
                        option1 = '<option value=' + val.code + '>' + val.desc + '</option>';
                        $(element).closest('.subBookingCalculation').find('#cargoState').append(option1);
                    }
                });
                nsBooking.form_data = $('#quickBookForm').serialize();
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, cargoStateURL, 'GET', null);
    }

    function possibleVygSel(varElement) {
        var valid = nsBooking.validateIn(varElement),            
            qpossibleVoyageWrap = '',
            customerID = '',
            showPrevious = '',
            possibleVoyageClicked = '',
            ajUrl = '';
        if (valid) {          
            qpossibleVoyageWrap = $(varElement).closest('#quickBookForm');
            qpossibleVoyageWrap.find('.possibleVoyageWrap').show();
            customerID = $('#customerID').val();
            showPrevious = 'N';
            if ($('#prevVoyagesQuick').is(':checked')) {
                showPrevious = 'Y';
            }
            possibleVoyageClicked = 'Y';
            if ($('.getPossibleVoyagesQuickbook').attr('data-clicked') === 'false') {
                possibleVoyageClicked = 'N';
            }
            if ((possibleVoyageClicked === 'Y' && showPrevious === 'N') || showPrevious === 'Y') {
                ajUrl = nsBooking.possibleVoyages + nsBooking.getOriginCode() + '&destinationPort=' +
                    nsBooking.getDestinationCode() + '&showPreviousVoyage=' + showPrevious + '&compId=' + customerID +
                    '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat
                    + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=0';
                setUpPossVoyWrapHelper(ajUrl);
            }
        }
    }
    
    function setUpPossVoyWrapHelper(ajUrl){
    	vmsService.vmsApiService(function(response) {
            var possibleVoyageContent = '',empty = '',
                k = 0;
            if (response) {
            	  empty = '<div class="singleVoyageRow"><input name="selectPossibleVoyage" class="voyageSelection"  ' +
                  'type="radio" value="No voyage" checked><div class="singleLegNoVoyage">' +
                  '<span>No Voyage</span></div></div>';
                possibleVoyageContent = '<div class="possibleVoyageRow" id="possibleVoyageRow">' +
                    empty;
                if (response.routeModelList) {
                    $.each(response.routeModelList, function(j, leg) {
                        possibleVoyageContent +=
                            '<div class="singleVoyageRow" id="singleVoyageRow">';
                        possibleVoyageContent +=
                            '<input type="radio" class="voyageSelection" ' +
                            'data-vessel=""  name="selectPossibleVoyage" value=' +
                            leg.key + ' >';
                        for (k = 0; k < leg.count; k++) {
                            possibleVoyageContent += qpossibleVoyageContentFn(leg, k + 1, j,
                                leg.currentVoyage === 'N');
                        }
                        possibleVoyageContent += '</div>';
                    });
                    possibleVoyageContent += '</div>';
                    nsBooking.setUpPossVoyWrap(possibleVoyageContent);
                }else{
                	nsBooking.setUpPossVoyWrap(empty);
                }
                noVoyageSelected();
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, ajUrl, 'GET', null);
    }

    function qpossibleVoyageContentFn(leg, i, j, style) {
        var instLeg = nsBookDoc.fetchLegInstance(leg, i),
            styleColor = (style) ? 'style="color:#0000FF"' : '',
            possibleVoyageContent = '<div class="singleLeg" ' + styleColor +
            '><input type="hidden" class="sourcePortCallID" name="sourcePortCallID' +
            (j + 1) + ' " id="qsourcePortCallID' + i + '" value="' + instLeg.sourcePortCallID +
            '" /> ' + '<input type="hidden" id="qdestinationPortCallID' + i +
            '"  name="destinationPortCallID' + (j + 1) +
            ' "class="destinationPortCallID" value="' + instLeg.discPortCallID + '" />' +
            '<input type="hidden" class="vesselId' + i + '" name="vesselId' + (j + 1) +
            ' " id="vesselId' + i + '" value="' + instLeg.vesselId + '" />' +
            '<input type="hidden" id="qtranshipmentType' + i + '" name="transhipmentType' +
            i + '" class="consignmentTransType" value=' + instLeg.legType + '>' +
            '<span class="voyageVessel" data-vessel="' + instLeg.vesselVoyage + '" ' + styleColor +
            '>' + instLeg.vesselVoyage + '</span><span id="qtrade' + i + '" name="trade' + (j + 1) +
            ' " class="trade" ' + styleColor + '>' + instLeg.trade + '</span>' +
            '<span name="loadPortCode' + (j + 1) + ' " id="qloadPortCode' + i + '" class="loadPortCode" ' +
            styleColor + '>' + instLeg.loadPort + '</span><span class="bold">--&gt;</span>' +
            '<span name="discPortCode' + (j + 1) + ' " id="qdiscPortCode' + i + '" class="discPortCode" ' +
            styleColor + '>' + instLeg.discPort + '</span>' + '<div class="legTimeStamp"><span ' +
            styleColor + '>ETA: ' + instLeg.eta + '</span>' + '<span ' + styleColor + '>ETD: ' + instLeg.etd +
            '</span></div><span class="allocItems alloc">  <span class="allocCodeIcon CA" ' +
            'style="background-color: red;">' +
            instLeg.allocationForCar + '</span> <span class="allocCodeIcon PU" style="background-color: green;">' +
            instLeg.allocationForPU + '</span> <span class="allocCodeIcon HH" style="background-color: blue;">' +
            instLeg.allocationForHH + '</span><span class="allocCodeIcon ST" style="background-color: grey;">' +
            instLeg.allocationForST + '</span></span></div>';
        return possibleVoyageContent;
    }

    function makeModelPop(element) {
        var wrapper = $(element).closest('.subBookingCalculation'),
            make = $(wrapper).find('#bookingCargoMake1').val(),
            model = $(wrapper).find('#bookingCargoModel1').val(),
            formdata = {};
        nsBooking.makeModelElement = element;
        if (!make && !model) {
            $(wrapper).find('#makeModelListLink1').attr('disabled');
        } else {
            formdata = {
                make: $(wrapper).find('#bookingCargoMake1').val(),
                model: $(wrapper).find('#bookingCargoModel1').val()
            };
            vmsService.vmsApiService(function(response) {
                var testObj = {};
                if (response) {
                    if ($.fn.DataTable.isDataTable($('#makeModelListGrid'))) {
                        $('#makeModelListGrid').dataTable().api().clear().draw();
                        $('#makeModelListGrid').dataTable().api().rows.add(response).draw();
                    } else {
                        testObj = JSON.parse(JSON.stringify(nsBooking.normalGridOpts));
                        testObj.dom = '<t>';
                        testObj.scrollCollapse = true;
                        testObj.scrollX = true;
                        testObj.scrollY = 200;
                        testObj.data = response;
                        testObj.bAutoWidth = false;
                        testObj.columns = [{
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
                            data: 'cargoType'
                        }, {
                            data: 'cargoText'
                        }, {
                            data: 'dimensions'
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
                        $('#makeModelListGrid').DataTable(testObj);
                    }
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.searchAll, 'POST', JSON.stringify(formdata));
            $('#makeModelListPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '75%'
            }).data('origin', 'quickBooking');
        }
    }

    function doSubCreate() {
        var parent = $('.quickBookSubBookWrap').find('.portsCallForm').last(),
            newPortCallItem = $(parent).clone(),
            curVal = $(parent).find('#thisIndex').val(),
            indVal;
        nsBooking.quickSubCount = nsBooking.quickSubCount + 1;
        newPortCallItem.find('input,select').removeClass('redErrorBorder').val('');
        newPortCallItem.find('input:checked').attr('checked', false).end();
        if (curVal === '0') {
            indVal = 1;
            newPortCallItem.find('#thisIndex').val('1');
        } else {
            indVal = 0;
            newPortCallItem.find('#thisIndex').val('0');
        }
        newPortCallItem.find('input,select').attr('name',
            function(i, oldVal) {
                if (oldVal) {
                    return oldVal.replace(/\[(\d+)\]/, function() {
                        return '[' + (indVal) + ']';
                    });
                } else {
                    return oldVal;
                }
            });
        if (nsBooking.noVoyage) {
            noVoyageSelected();
        }
        newPortCallItem.find('#docID').val(nsBooking.deDocID);
        newPortCallItem.find('#docCode').val(nsBooking.deDocCode);
        newPortCallItem.find('#docName').val(nsBooking.deDocName);
        newPortCallItem.find('select#allocType').val('YES');
        newPortCallItem.find('#freightCurrencies').val(nsBooking.defaultCurrencyCode.slice(1,-1)); // val is set as curCde1
        newPortCallItem.find('.qMilitaryCargo').attr('checked', false);
        newPortCallItem.find('.qHazardousCargo').attr('checked', false);
        newPortCallItem.find('.qCargoOnHold').attr('checked', false);
        newPortCallItem.find('.qWayCargo').attr('checked', false);
        newPortCallItem.find('#quickSubCount').val(nsBooking.quickSubCount);
        newPortCallItem.find('#makeModelListLink1').attr('disabled', 'disabled');
        newPortCallItem.find('#makeModelListLink1').addClass('disabledBut');
        if(nsBooking.rateLinkAccessFlag){
        	newPortCallItem.find('.freightApplyRate').removeAttr('disabled');
        	newPortCallItem.find('.freightApplyRate').removeClass('disabledBut');
        } else {
        	newPortCallItem.find('.freightApplyRate').attr('disabled', 'disabled');
            newPortCallItem.find('.freightApplyRate').addClass('disabledBut');
        }
        $(newPortCallItem).focus();
        newPortCallItem.find('#newCargo').val('0');
        newPortCallItem.find('#freightAreaBasis').val('');
        newPortCallItem.find('#freightAreaPayment').val('P');
        $(newPortCallItem).find('#perUnitID').prop('checked', true).val('YES');
        $(newPortCallItem).find('#totalsID').val('NO');
        $(newPortCallItem).find('#dimensionType').val(nsBookDoc.defaultMeasUnit);
        $(newPortCallItem).find('#bkLength').removeAttr('readonly');
        $(newPortCallItem).find('#bkWidth').removeAttr('readonly');
        $(newPortCallItem).find('#bkHeight').removeAttr('readonly');
        $(newPortCallItem).find('#applyRateData').hide();
        $(newPortCallItem).find('.freightChargesCollapse').hide();
        $(newPortCallItem).find('#quickBookChargesGrid tbody tr:not(:first-child)').remove();
        $(newPortCallItem).find('#quickBookChargesGrid #chargeType').val('');
        $(newPortCallItem).find('#quickBookChargesGrid #chargeBasis').val('');
        $(newPortCallItem).find('#quickBookChargesGrid #chargeCurrency').val(nsBooking.defaultCurrencyCode.slice(1,-1));
        $(newPortCallItem).find('#quickBookChargesGrid #chargePayment').val('P');
        $(newPortCallItem).find('#quickBookChargesGrid tbody').hide();
        newPortCallItem.appendTo('#quickBookForm .quickBookSubBookWrap');
        nsBooking.updateCState(newPortCallItem);
        nsBooking.loadDocCodeNameQB();
        nsBooking.makeAndModelQuickBook('.bookingCargoMake1', '.bookingCargoModel1');
        if (nsBooking.quickSubCount >= 2) {
            $('#addNewBooking').attr('disabled', 'disabled');
            $('#addNewBooking').addClass('disabledBut');
            $('.portsCallForm').find('.removePortElement').show();
        }
    }
    
    function quickBookChargeVal(){
    	var chargeTypeMsg = '', chargeBasisMsg = '', rateMsg = '', valChrgRate = '', curencyMsg = '';
        $('#quickBookChargesGrid tbody tr').each(function() {
            var chargeTypeValue = unescape($(this).find('#chargeType').val()),
                chargeBasisValue = $(this).find('.chargeBasis').val(),
                rateValue = $(this).find('#chargeRate').val(),
                curencyValue = $(this).find('#chargeCurrency').val();
            if ($(this).css('display') === 'none') {
                return true;
            }
            if(!chargeTypeMsg){
            	chargeTypeMsg = (!chargeTypeValue) ? 'Charge type is not selected \n' : '';
            }
            if(!chargeBasisMsg){
            	chargeBasisMsg = (!chargeBasisValue) ? 'Charges Basis is not selected \n' : '';
            }
            if(!rateMsg){
            	rateMsg = (!rateValue) ? 'Charges Rate should not be empty \n' : '';
            }                
            if(!valChrgRate && rateValue){
            	valChrgRate = nsBooking.validateFloat('Charges Rate', rateValue, 10, 4);
            }
            if(!curencyMsg){
            	curencyMsg = (!curencyValue) ? 'Charges Currency is not selected \n' : '';
            }                
        });
        return chargeTypeMsg + chargeBasisMsg + rateMsg + valChrgRate + curencyMsg;
    }

    $(document).ready(function(){
    	$(document).on('click', '.voyageSelection', function(){
    		routeChanged(this);
    	});
    	$(document).on('blur', '#customerCode, #customerName, #origin, #originName, #destination, #destinationName, #contract', function(){
    		nsBooking.enableDisableRate(this);
    	});
    	$(document).on('change', '#cargoType, #bookedUnits, #newCargo', function(){
    		enableDisableFRate(this);
    	});
    	$(document).on('change', '#bookedUnits, #freightAreaBasis, #freightAreatRate ,#bkLength, #bkWeight, #bkVolume, #perUnitID, #totalsID, #dimensionType', function(){
    		nsBooking.freightTot(this);
    	});
    	$(document).on('change', '#perUnitID', function(){
    		perUnitSelected(this);
    	});
    	$(document).on('change', '#totalsID', function(){
    		totalSelected(this);
    	});
    	$(document).on('change', '#dimensionType', function(){
    		nsBooking.convertArea(this);
    		nsBooking.convertVolume(this);
    		nsBooking.heightChanged('#bkHeight');
    		nsBooking.weightChanged('#bkWeight');
    	});
    	$(document).on('click', '#quickSave', function(){
    		nsBooking.doQuickBookSubmit();
    	});
    	$(document).on('change', '#bkLength, #bkWidth', function(){
    		enableDisableDims(this);
    		nsBooking.calculateArea(this);
    		nsBooking.calculateVolume(this);
    		enableDisableFRate(this);
    		nsBooking.quickWeight(this);
    	});
    	$(document).on('change', '#bkHeight', function(){
    		enableDisableDims(this);
    		nsBooking.calculateVolume(this);
    		enableDisableFRate(this);
    		nsBooking.quickWeight(this);
    		nsBooking.heightChanged(this);
    	});
    	$(document).on('change', '#bkWeight', function(){
    		enableDisableFRate(this);
    		nsBooking.weightChanged(this);
    	});
    	$(document).on('change', '#bkArea, #bkVolume', function(){
    		enableDisableFRate(this);
    		enableDisableDims(this);
    		nsBooking.quickWeight(this);
    	});
    	$(document).on('change', '#cargoType', function(){
    		updateCargoState(this);
    	});

    	$(document).on('blur', '#bookingCargoMake1, #bookingCargoModel1', function(){
    		modelTypChange(this);
    	});
    	$(document).on('click', '#makeModelListLink1', function(){
    		makeModelPop(this);
    	});
    	$(document).on('click', '#addNewBooking', function(){
    		doSubCreate();
    	});
    	$(document).on('click', '.getPossibleVoyagesQuickbook', function(){
    		nsBooking.getQuickRouteDetails(this);
    	});
    	$(document).on('click', '#prevVoyagesQuick', function(){
    		possibleVygSel(this);
    	});
    	$(document).on('click', '#cnclBtn', function(){
    		nsBooking.doCancelOpn();
    	});
    });

    qbObj = {
        'validOriginDestination': validOriginDestination,
        'validDimension': validDimension,
        'validCargo': validCargo,
        'enableDisableFRate': enableDisableFRate,
        'bookNumValid': bookNumValid,
        'bookNumValid2': bookNumValid2,
        'dataValid': dataValid,
        'isLocationMatch': isLocationMatch,
        'locEmptyCheck': locEmptyCheck,
        'isNewBookingMatchingSearch': isNewBookingMatchingSearch,
        'totalSelected': totalSelected,
        'modelTypChange': modelTypChange,
        'noVoyageSelected': noVoyageSelected,
        'clearTrashipmentFieldsQuick': clearTrashipmentFieldsQuick,
        'loadVals': loadVals,
        'loadPortInfo': loadPortInfo,
        'noVoyCheck': noVoyCheck,
        'routeChanged': routeChanged,
        'findPCVIDs': findPCVIDs,
        'doUpTransType': doUpTransType,
        'updateDims': updateDims,
        'disDia': disDia,
        'doUpdArea': doUpdArea,
        'doUpdVol': doUpdVol,
        'perUnitSelected': perUnitSelected,
        'isEnableAreaAndVol': isEnableAreaAndVol,
        'enableDisableDims': enableDisableDims,
        'areaVolCheck': areaVolCheck,
        'isEnableDim': isEnableDim,
        'updateCargoState': updateCargoState,
        'possibleVygSel': possibleVygSel,
        'qpossibleVoyageContentFn': qpossibleVoyageContentFn,
        'makeModelPop': makeModelPop,
        'doSubCreate': doSubCreate,
        'quickBookChargeVal' : quickBookChargeVal
    };
    $.extend(true, nsBooking, qbObj);

})(this.booking, jQuery, this.vmsService, this.core);