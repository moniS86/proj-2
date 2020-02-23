/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc, nsDoc) {
    var moveUnitsData = '',
        searchList = '',
        docLink = false;
	if((window.location.href).indexOf('/documentation/') > 0){
		docLink = true;
	}
    if(!nsBooking){nsBooking=nsDoc;}
    function nullCheck(inputVal) {
        return (!(inputVal)) ? '' : (inputVal);
    }

    function initializeDragEvent() {
        var i = 0;
        $('#selectable > div').each(function() {
            $(this).css({
                top: i * 42
            });
            i++;
        });
        $('#moveFromCargoUnits .CargoUnitVin').draggable({
            distance: 1,
            revert: 'invalid',
            cursorAt: {
                right: 0
            },
            helper: function(event) {
                var set = $('<div></div>'),
                    selected = $('#moveFromCargoUnits  .CargoUnitVin.ui-selecting'),
                    offset = $(this).offset(),
                    click = {
                        left: event.pageX - offset.left,
                        top: event.pageY - offset.top
                    },
                    center = {
                        left: ((selected.length < 5) ? (selected.length / 2) : 2.5) * 20,
                        top: ((parseInt((selected.length - 1) / 5) + 1) * 20) / 2
                    },
                    row = parseInt(i / 5),
                    j = i - (row * 5);
                $('<div class="draggingWrap"></div>').addClass('ui-selecting').text(selected.length + ' Items')
                    .appendTo(set)
					.stop()
					.animate({
                        left: (20 * j) + click.left - center.left,
                        top: (-20 * i) + click.top - center.top + (row * 20)
                    }, 500);
                return set;
            }
        });
    }

    function initializeDropEvent() {
        var movingFromMainDiv,
            blnValidBol = '',
            blnValidBolTo = '';
        $('#moveToSubBookUnits .cargoVin').droppable({
            accept: '#moveFromCargoUnits .CargoUnitVin.ui-selecting',
            hoverClass: 'ui-state-active',
            tolerance: 'intersect',
            over: function() {
                var dropIntoDiv = $(this),
                    movingIntoDivId = dropIntoDiv.data('subbookingid'),
                    objData = {},
                    objFromData = {},
                    blnValid = false,
                    blnValidSpace = true,
                    blnValidCargoUnit = true,
                    blnValidCargoType = true,
                    blnValidNewCargo =
                    true,
                    beforeCargoUnits = [],
                    cargoTypeIds = [],
                    movingToMainDiv = movingIntoDivId,
                    blnValidMove = '';
                nsBookDoc.newCargoMoveUnits = '';
                movingFromMainDiv = $('#subBookingsFromContent').find('.activeFromSubBook').data('subbookingid');
				if (nullCheck(movingToMainDiv)) {
                    blnValidMove = isSameSelection(movingFromMainDiv, movingIntoDivId);
                    objFromData = getSubbookingData(movingFromMainDiv);
                    objData = getSubbookingData(movingToMainDiv);
                    blnValidBol = checkBolStatus(objFromData);
                    blnValidBolTo = checkBolStatus(objData);
                    $('#moveFromCargoUnits .CargoUnitVin.ui-selecting').each(function(eleCount, ele) {
                        beforeCargoUnits.push($(ele).attr('data-cargoUnitId'));
                        cargoTypeIds.push($(ele).attr('data-cargoTypeId'));

                        if ($(ele).attr('data-statusCode') === '4') {
                            if (objFromData.voyageId === objData.voyageId) {
                                blnValidCargoUnit = true;
                            } else {
                                blnValidCargoUnit = false;
                            }
                        }
                    });

                    blnValidCargoType = checkCargoTypeSame(objData.cargoTypeId, objFromData.cargoTypeId);
                    blnValidSpace = validateAlloc(objData, objFromData, beforeCargoUnits.length);
                    blnValidNewCargo = isNewCargoMove(objFromData, objData);

                    blnValid = checkValidMove(blnValidCargoUnit, blnValidSpace, blnValidBol, blnValidBolTo, blnValidMove, 
                            blnValidCargoType, blnValidNewCargo);
                    if (blnValid) {
                        dropIntoDiv.removeClass('ui-state-active').addClass('ui-state-success-new');
                        $(dropIntoDiv).parent().parent().addClass('dragDropSuccess');
                        return true;
                    } else {
                        dropIntoDiv.addClass('ui-state-error');
                        $(dropIntoDiv).parent().parent().addClass('dragDropError');
                        return false;
                    }
                }
            },
            out: function() {
                var self = $(this);
                self.removeClass('ui-state-error ui-state-success-new');
                $(self).parent().parent().removeClass('dragDropError dragDropSuccess');
            },
            deactivate: function() {
                var self = $(this);
                self.removeClass('ui-state-error ui-state-success-new');
                $(self).parent().parent().removeClass('dragDropError dragDropSuccess');
            },
            drop: function(event, ui) {
                var dropIntoDiv = $(this),
                    movingIntoDivId = dropIntoDiv.data('subbookingid'),
                    objData = {},
                    objFromData = {},
                    blnValid = false,
                    blnValidSpace = true,
                    blnValidCargoUnit = true,
                    blnValidCargoType = true,
                    blnValidNewCargo = true,
                    beforeCargoUnits = [],
                    cargoTypeIds = [],
                    consFromTimeStamp = $('#subBookingsFromContent').find('.activeFromSubBook').data('constimestamp'),
                    consToTimeStamp = dropIntoDiv.data('constimestamp'),
                    movingToMainDiv = movingIntoDivId,
                    blnValidMove = '';

                if (nullCheck(movingToMainDiv)) {
                    blnValidMove = isSameSelection(movingFromMainDiv, movingIntoDivId);
                    objFromData = getSubbookingData(movingFromMainDiv);
                    objData = getSubbookingData(movingToMainDiv);
                    blnValidBol = checkBolStatus(objFromData);
                    blnValidBolTo = checkBolStatus(objData);

                    $('#moveFromCargoUnits .CargoUnitVin.ui-selecting').each(function(elecou, ele) {
                        beforeCargoUnits.push($(ele).attr('data-cargoUnitId'));
                        cargoTypeIds.push($(ele).attr('data-cargoTypeId'));

                        if ($(ele).attr('data-statusCode') === '4') {
                            if (objFromData.voyageId === objData.voyageId) {
                                blnValidCargoUnit = true;
                            } else {
                                blnValidCargoUnit = false;
                            }
                        }
                    });

                    blnValidCargoType = checkCargoTypeSame(objData.cargoTypeId, objFromData.cargoTypeId);
                    blnValidSpace = validateAlloc(objData, objFromData, beforeCargoUnits.length);
                    blnValidNewCargo = isNewCargoMove(objFromData, objData);

                    if (checkWithoutAlloc(blnValidCargoUnit, blnValidBol, blnValidMove, blnValidCargoType,
                        blnValidNewCargo) && !blnValidSpace) {
                        nsCore.showAlert('Cannot move units due to lack of allocation space');
                        ui.draggable.draggable('option', 'revert', true);
                        return false;
                    }
                    blnValid = checkValidMove(blnValidCargoUnit, blnValidSpace, blnValidBol, blnValidBolTo, blnValidMove,
                                blnValidCargoType, blnValidNewCargo);
                    if (!blnValid) {
                        ui.draggable.draggable('option', 'revert', true);
                        return false;
                    } else {
                        invokeUpdateCall($(this), movingToMainDiv, movingFromMainDiv, ui,
                            consFromTimeStamp, consToTimeStamp);
                    }
                }
                $(dropIntoDiv).parent().parent().removeClass('dragDropError dragDropSuccess');
            }
        });
    }

    function invokeUpdateCall(form, movingToMainDiv, movingFromMainDiv, ui, consFromTimeStamp, consToTimeStamp) {
        var selectedCargoUnits = [],
            cargoList = [],
            consignmentTemplateDetail = [],
            bookingId = $('.mainBookingListWrap').find('.subBookContentListCol')
                .find('.ui-selecting').attr('data-bookingid'),
            data = {};
        if (form.hasClass('cargoVin')) {
            form.closest('#moveToSubBookUnits').find('.cargoVin').removeClass('activeSubBook activeToSubBook');
            form.addClass('activeSubBook activeToSubBook');
        }

        $('#moveFromCargoUnits .CargoUnitVin.ui-selecting').each(function(val, ele) {
            selectedCargoUnits.push($(ele).attr('data-cargoUnitId'));
            cargoList.push({
                id: $(ele).attr('data-cargoUnitId'),
                vinNumber: '0',
                customsRef: $(ele).attr('data-consignmentLegId')
            });
        });
        consignmentTemplateDetail.push({
            id: movingToMainDiv,
            timeStamp: consToTimeStamp,
            cargoList: cargoList,
            fromSubBookingId: movingFromMainDiv,
            fromSubBookTimestamp: consFromTimeStamp
        });
        cargoList.push({
            id: '0',
            vinNumber: '0',
            customsRef: '0'
        });
        consignmentTemplateDetail.push({
            id: '0',
            timeStamp: consToTimeStamp,
            cargoList: cargoList,
            fromSubBookingId: movingFromMainDiv,
            fromSubBookTimestamp: consFromTimeStamp
        });
        data = {
            id: bookingId,
            bookNo: $('#moveUnitsbooking').html(),
            subBookingList: consignmentTemplateDetail
        };
        updateSubBookingData(selectedCargoUnits, data, form, ui);
    }

    function updateSubBookingData(selectedCargoUnits, data, self, objUi) {
        var selectedFromSubBook = '',
            selectedToSubBook = '',
            activeFromSubBook = $('#subBookingsFromContent .cargoVin.activeFromSubBook').attr('data-subBookingId'),
            activeToSubBook = self.data('subbookingid');

        $.each(moveUnitsData.subBookingList, function(i, obj) {
            if (parseInt(activeFromSubBook) === parseInt(obj.subBookingId)) {
                selectedFromSubBook = moveUnitsData.subBookingList.indexOf(obj);
            } else {
                if (parseInt(activeToSubBook) === parseInt(obj.subBookingId)) {
                    selectedToSubBook = moveUnitsData.subBookingList.indexOf(obj);
                }
            }
        });
        vmsService.vmsApiServiceType(function(responseDTO) {
                var emptySubBookingId = '',
                    nextOfEmpty = '',
                    divEmptySubBookingId = '',
                    cargoIndex = {},
                    description = '', cargoLength = 0,
                    subBookingMovedFromCnt = 0,
                    chargesBookingId,
                    subBookingMovedToCnt = 0,
                    url;
                if(!nsDoc){
                	chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting').attr('data-bookingid')
                }else{
                	 chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting').attr("data-bolid")
                }
                if (responseDTO) {
                	if(!nsDoc && responseDTO.responseDescription === 'concurrency'){		                   
                		nsCore.showAlert('Someone else have updated the data since you retrieved the Booking information');		
                	} else if (responseDTO.responseCode === '2') {
                    	cargoLength = (moveUnitsData.subBookingList[selectedFromSubBook].cargoUnitList ? moveUnitsData.subBookingList[selectedFromSubBook].cargoUnitList.length : 0);
                        subBookingMovedFromCnt = (cargoLength - selectedCargoUnits.length);
                        cargoLength = (moveUnitsData.subBookingList[selectedToSubBook].cargoUnitList ? moveUnitsData.subBookingList[selectedToSubBook].cargoUnitList.length : 0);
                        subBookingMovedToCnt = (cargoLength + selectedCargoUnits.length);

                        $.each(selectedCargoUnits, function(i, cargoUnit) {
                            $.each(moveUnitsData.subBookingList[selectedFromSubBook].cargoUnitList, function(key, val) {
                                if (parseInt(cargoUnit) === parseInt(val.cargoId)) {
                                    cargoIndex.val = val;
                                    cargoIndex.valIndex = key;
                                    return false;
                                }
                            });
                            setAllocSpace(selectedToSubBook, selectedFromSubBook);
                            moveUnitsData.subBookingList[selectedFromSubBook].cargoUnitList.splice(cargoIndex.valIndex, 1);
                            if(!moveUnitsData.subBookingList[selectedToSubBook].cargoUnitList){
                            	moveUnitsData.subBookingList[selectedToSubBook].cargoUnitList = [];
                            }
                            moveUnitsData.subBookingList[selectedToSubBook].cargoUnitList.push(cargoIndex.val);
                            if (moveUnitsData.subBookingList[selectedFromSubBook].cargoUnitList.length <= 0) {
                                emptySubBookingId = moveUnitsData.subBookingList[selectedFromSubBook].subBookingId;
                                divEmptySubBookingId = $('#subBookingsFromContent')
                                    .find('[data-subbookingid = "' + emptySubBookingId + '"]');

                                if (divEmptySubBookingId.next().length !== 0) {
                                    nextOfEmpty = divEmptySubBookingId.next();
                                } else if (divEmptySubBookingId.prev().length !== 0) {
                                    nextOfEmpty = divEmptySubBookingId.prev();
                                } else {
                                    nextOfEmpty = divEmptySubBookingId;
                                }
                                $('#subBookingsFromContent,#moveToSubBookUnits').find(
                                    '[data-subbookingid = "' + emptySubBookingId + '"]').remove();
                                nextOfEmpty.click();
                            }
                        });
                        $('#moveFromCargoUnits .CargoUnitVin.ui-selecting').removeClass('ui-draggable ui-selecting')
                        .appendTo($('#cargoUnitToCntnt'));

                        self.closest('#moveToSubBookUnits').find('.cargoVin')
                            .removeClass('activeSubBook activeToSubBook ui-state-sucess-new');

                        $('#subBookingsFromContent,#moveToSubBookUnits')
                            .find('[data-subbookingid = "' + activeFromSubBook + '"]').find('#cargoUnitCnt')
                            .text(subBookingMovedFromCnt);

                        $('#subBookingsFromContent,#moveToSubBookUnits')
                            .find('[data-subbookingid = "' + activeToSubBook + '"]')
                            .find('#cargoUnitCnt').text(subBookingMovedToCnt);
                        
                        $('#subBookingsFromContent,#moveToSubBookUnits,#moveFromCargoUnits,#cargoUnitToCntnt').text('');
                        
                  	     $('.preloaderWrapper').show();
                  	     if(!nsDoc){
                  	    	url= '/Vms/booking/moveUnits?bookingId='
                  	     }else{
                  	    	url ='/Vms/booking/moveUnits?bolId='
                  	     }
                   	     vmsService.vmsApiService(function(response) {
                   	    	 $('.preloaderWrapper').hide();
                   	         if (response) {
                   	             fnDdLpDp(response);
                   	          $('#moveToSubBookUnits .cargoVin').each(function() {
                                  if (parseInt($(this).attr('data-subBookingId')) === parseInt(activeToSubBook)) {
                                      $(this).trigger('click');
                                      $(this).addClass('activeSubBook activeToSubBook');
                                  }
                              });
                              
                              $('#subBookingsFromContent .cargoVin').each(function() {
                                  if (parseInt($(this).attr('data-subBookingId')) === parseInt(activeFromSubBook)) {
                                      $(this).trigger('click');
                                      $(this).addClass('activeSubBook activeFromSubBook');
                                  }
                              });
                              
                   	         } else {
                   	             nsCore.showAlert(nsBooking.errorMsg);
                   	         }
                   	     }, url + chargesBookingId, 'GET', null);

                    } else if (responseDTO.responseCode === '14003' || responseDTO.responseCode === '14001' ) { 
                        
						nsCore.showAlert(responseDTO.responseDescription);
	                }else {
	                        description = responseDTO.responseDescription;
	                        objUi.draggable.draggable('option', 'revert', true);
	                        $('#statusMessage').text(description);
	                    }
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, '/Vms/booking/moveUnitsSave', 'POST', JSON.stringify(data))
            // updating count
    }

    function filterList(searchVal, srchList) {
        var searchAttr = 'data-filtering',
            searchStrng = searchVal.toLowerCase();
        $.each(srchList, function(i, obj) {
            if ($(obj).attr(searchAttr).toLowerCase().indexOf(searchStrng) > -1) {
                $(obj).css('display', 'block');
            } else {
                $(obj).css('display', 'none').removeClass('ui-selecting');
            }
        });
    }

    function fnDdLpDp(response) {
        var optData = ['<option value="0">---Select---</option>'],
            combi = '',
            valLpDp = 0;
        $.each(response.subBookingList, function(i, obj) {
            combi = obj.loadPortCode + '-' + obj.discPortCode;

            if (optData.indexOf('<option value="' + combi + '">' + combi + '</option>') === -1) {
                optData.push('<option value="' + combi + '">' + combi + '</option>');
            }
        });
        $('#valSelLpDp').html(optData.join(''));
        
        if(nsBookDoc.moveUnitPortPair){
        	$('#valSelLpDp').val(nsBookDoc.moveUnitPortPair);
        } else{
        	$('#valSelLpDp').val($('#valSelLpDp').children()[1].value);
        }
        
        fnLoadData($('#valSelLpDp').val(), response);

        $('#ddSelLPDp').on('change', function(e) {
            e.preventDefault();
            $('#subBookingsFromContent,#moveToSubBookUnits,#moveFromCargoUnits,#cargoUnitToCntnt').text('');
            nsBookDoc.moveUnitPortPair = $('#valSelLpDp').val() || 0;
            valLpDp = $('#valSelLpDp').val() || 0;
            fnLoadData(valLpDp, response);
        });
    }

    function createSubBookingContent(subBookTitle, obj, allocationDetailId, appe, className, subBookingsContent) {
        var cnName = (obj.subBookingType.toUpperCase().length >= 16) ? '' : 'dibmw';
    	subBookingsContent += '<div data-subBoookTitle="' + subBookTitle + '" data-filtering="' + subBookTitle
            + '" data-subBookingId="' + obj.subBookingId + '" data-constimestamp="' + obj.timeStamp
            + '" class="cargoVin billVin singleColItem moveUnitSubBook" data-allocDetailId="'
            + allocationDetailId + '"><span>' + appe + obj.consignmentNumber + '</span> - <span id="cargoUnitCnt">'
            + (obj.cargoUnitList ? obj.cargoUnitList.length : '0') + '</span> - <span class='+cnName+'>' + obj.subBookingType.toUpperCase()
            + '</span><span class=" icons_sprite existingVin ' + className + '"></span></div>';
        return subBookingsContent;
    }


    function fnLoadData(val, response) {
        var valLpDp = val,
            subBookingsContent = '',
            combi = '',
            lengthNo = 0,
            originalLen = 4,
            appendStr = '',
            k = 0,
            BLStatus = '',
            className = '',
            allocationDetailId = '';
        if (valLpDp !== '0') {
            $.each(response.subBookingList, function(i, obj) {
                var subBookTitle = '', bolStatusCheck = (docLink ? (obj.bolStatus === '20' || obj.bolStatus === '21' || obj.bolStatus === '31') : (obj.bolStatus === '10'));
                if(bolStatusCheck){
                    allocationDetailId = obj.allocationDetailId;
                    combi = obj.loadPortCode + '-' + obj.discPortCode;
                    if (valLpDp === combi) {
                        lengthNo = originalLen - obj.consignmentNumber.length;
                        for (k = 0; k < lengthNo; k++) {
                            appendStr += '0';
                        }
                        BLStatus = obj.bolStatus;
                        className = getClassName(BLStatus);
    
                        subBookTitle = appendStr + obj.consignmentNumber + ' - ' + (obj.cargoUnitList ? obj.cargoUnitList.length : '0')
                        + ' - ' + obj.subBookingType;
    
                        subBookingsContent = createSubBookingContent(subBookTitle, obj, allocationDetailId,
                        appendStr, className, subBookingsContent);
                    }
                }
            });

            $('#subBookingsFromContent, #moveToSubBookUnits').append(subBookingsContent);
            nsBookDoc.newCargoMoveUnits = '';
            initializeDropEvent();
            moveUnitsData = response;

            $('#moveUnitsPopup').find('.subBookingNbrsCntnt').each(function() {
                $(this).find('.cargoVin').first().trigger('click');
            });

            $('#moveUnitsWrapper').fadeIn();
        } else {
            $('#moveUnitsWrapper').fadeOut();
        }
    }

    function setAllocSpace(selectedToSubBook, selectedFromSubBook) {
        var calc = 0,
            calcAdd = 0,
            allocationVolume = 0,
            allocation = 0;

        if (moveUnitsData.subBookingList[selectedToSubBook].firm === 'Y' &&
            (moveUnitsData.subBookingList[selectedToSubBook].allocationSpace > 0)) {
            calc = 1;
            if ((moveUnitsData.subBookingList[selectedToSubBook].cargoGrp === 'HH' ||
                    moveUnitsData.subBookingList[selectedToSubBook].cargoGrp === 'ST') &&
                    (moveUnitsData.subBookingList[selectedToSubBook].area)) {
                calc = parseFloat(calc) * parseFloat(moveUnitsData.subBookingList[selectedToSubBook].area);
            }
            allocationVolume = parseFloat(moveUnitsData.subBookingList[selectedToSubBook].allocationSpace)
			- parseFloat(calc);

            moveUnitsData.subBookingList[selectedToSubBook].allocationSpace = allocationVolume;
        }

        if (moveUnitsData.subBookingList[selectedFromSubBook].firm === 'Y') {
            calcAdd = 1;
            if ((moveUnitsData.subBookingList[selectedToSubBook].cargoGrp === 'HH' ||
                    moveUnitsData.subBookingList[selectedToSubBook].cargoGrp === 'ST') &&
                    (moveUnitsData.subBookingList[selectedToSubBook].area)) {
                calcAdd = parseFloat(calcAdd) * parseFloat(moveUnitsData.subBookingList[selectedToSubBook].area);
            }
            allocation = parseFloat(moveUnitsData.subBookingList[selectedFromSubBook].allocationSpace) + parseFloat(calcAdd);
            moveUnitsData.subBookingList[selectedFromSubBook].allocationSpace = allocation;
        }
    }

    function getClassName(BLStatus) {
        var className = '';

		switch(BLStatus){
			case '50':
			case '21':
			case '51':
				className = ' manifested ';
				break;

			case '40':
				className = ' issued ';
				break;

			case '20':
			case '30':
			case '31':
				className = ' made ';
				break;

			default:
				break;

		}

       return className;
    }

    function checkBolStatus(objDataSub) {
        var arrValidBLStatus = [];
        if($('.exportButtons  .rolesTitle').text().indexOf('Booking') > -1){
        	arrValidBLStatus = [10];
        } else {
        	arrValidBLStatus = [20, 21, 31];
        }
        return arrValidBLStatus.indexOf(parseInt(objDataSub.bolStatus)) !== -1 || (!objDataSub.bolStatus);
    }

    function getCargoUnits(len, objDataSub) {
        var carUnits = parseFloat(len);
        if (objDataSub.firm === 'Y' && objDataSub.allocationSpace > 0 &&
            (objDataSub.cargoGrp === 'HH' || objDataSub.cargoGrp === 'ST') && (!!objDataSub.area)) {
            carUnits = parseFloat(len) * parseFloat(objDataSub.area);
        }
        return carUnits;
    }

    function checkCargoTypeSame(toCargoTypeId, formCargoTypeId) {
        var blnValidCargoType = true;
        if (!(toCargoTypeId)|| formCargoTypeId !== toCargoTypeId) {
            blnValidCargoType = false;
        }
        return blnValidCargoType;
    }

    function getCargoAttribute(objDataSub) {
    	 var newCargo = '',i = 0, newUsed = false, firstVal = ((objDataSub.cargoUnitList || '')[i] || '').newCargo,
         newObj = {};  
            if (objDataSub.cargoUnitList && (objDataSub.cargoUnitList[i].newCargo === '1')) {
                newCargo = 'Y';
            } else if(!objDataSub.cargoUnitList && nsBookDoc.newCargoMoveUnits !== '') {
                newCargo = nsBookDoc.newCargoMoveUnits;
            } else {
                newCargo = 'N';
            }
            nsBookDoc.newCargoMoveUnits = newCargo;
            if(!nsDoc){
            	 $.each(objDataSub.cargoUnitList, function(j,val){
                     if((firstVal !== val.newCargo) && !newUsed){
                             newUsed = true;
                     }
                 })
                 newObj = {newCargo : newCargo, newUsed : newUsed}
            	 return newObj;
            }else{
            	return newCargo;
            }
    }

    function validateAlloc(objData, objFromData, len) {
        var blnValidSpace = true,
            allocationVal = parseFloat(objData.allocationSpace),
            carUnits = getCargoUnits(len, objData);
        blnValidSpace = !((allocationVal < carUnits) || allocationVal === 0);

        if ((objFromData.firm === 'N' && objData.firm === 'N') || (objFromData.firm === 'Y' && objData.firm === 'N')) {
            blnValidSpace = true;
        }
        if ((objFromData.firm === 'Y' && objData.firm === 'Y' &&
                objFromData.allocationDetailId === objData.allocationDetailId)) {
            blnValidSpace = true;
        }
        return blnValidSpace;
    }

    function getSubbookingData(selectedSubbookingId) {
        var objDataSub = {},
            count = 0;
        for (count = 0; count < moveUnitsData.subBookingList.length; count++) {
            if (parseInt(moveUnitsData.subBookingList[count].subBookingId) === parseInt(selectedSubbookingId)) {
                objDataSub = moveUnitsData.subBookingList[count];
                return objDataSub;
            }
        }
        return objDataSub;
    }

    function isSameSelection(movingFromMainDiv, movingIntoDivId) {
        return movingFromMainDiv !== movingIntoDivId;
    }

    function isNewCargoMove(objFromData, objData) {
        var blnValidNewCargo = true,
            fromNewCargo = getCargoAttribute(objFromData),
            toNewCargo = getCargoAttribute(objData);
        if(!nsDoc){
        	 if ((fromNewCargo.newCargo !== toNewCargo.newCargo) || fromNewCargo.newUsed || toNewCargo.newUsed) {
                 blnValidNewCargo = false;
             }
        }
        else {
        	 if (fromNewCargo !== toNewCargo){        	
        		 blnValidNewCargo = false;
        	 }
        }
        return blnValidNewCargo;
    }

    function checkWithoutAlloc(blnValidCargoUnit, blnValidBol, blnValidBolTo, blnValidMove, blnValidCargoType, blnValidNewCargo) {
    	if(nsDoc){
    		return blnValidCargoUnit && blnValidBol && blnValidMove && blnValidCargoType && blnValidNewCargo;
    	}else{
    		return blnValidCargoUnit && blnValidBol && blnValidBolTo && blnValidMove && blnValidCargoType && blnValidNewCargo;
    	}
    }

    function checkValidMove(blnValidCargoUnit, blnValidSpace, blnValidBol, blnValidBolTo, blnValidMove, blnValidCargoType,
        blnValidNewCargo) {
        var blnValid = false;

        if (checkWithoutAlloc(blnValidCargoUnit, blnValidBol, blnValidBolTo, blnValidMove, blnValidCargoType, blnValidNewCargo) &&
            blnValidSpace) {
            blnValid = true;
        } else {
            blnValid = false;
        }
        return blnValid;
    }

    //events will be triggered when DOM is ready
    $(document).ready(function() {
    	$(document).on('keyup', '.subBookListColWrap .filterBox', function(e) {
            var currEle = $(this),
                subBookWrap = '',
                filteredListCount = '',
                isSubBook = '';
			if($(this).parents('.actionLists').length > 0){
            	searchList = $(this).closest('.subBookListColWrap').find('.subBookContentListCol .singleColItem.massBooking');
            } else {
            	searchList = $(this).closest('.subBookListColWrap').find('.subBookContentListCol .singleColItem');
            }
            filterList($(this).val(), searchList);

            // To execute only for Move Units
            if (currEle.closest('form').prop('id') === 'billBooking') {
                subBookWrap = $(this).closest('.subBookListColWrap');
                filteredListCount = subBookWrap.find('.subBookContentListCol .singleColItem:visible').length;
                isSubBook = subBookWrap.find('.subBookContentListCol .singleColItem').hasClass('moveUnitSubBook');
                // To check if search results are 0
                if ((filteredListCount === 0) && isSubBook) {
                    $(this).closest('.subBookPanelWrapper').find('.CargoUnitCntnt .singleColItem').hide();
                    // Hiding Vins
                    searchList.removeClass('activeSubBook');
                    // Remove Highlight for existing selected Sub Book
                }
            } else {
                if (currEle.hasClass('massActionFilter')) {
                    currEle.closest('.subBookListColWrap').find('.accBody').addClass('hide');
                    currEle.closest('.subBookListColWrap').find('.accHead .toggleBooking').removeClass('fa-minus')
                        .addClass('fa-plus');
                }
            }
        });

        $(document).on('click', '#moveFromCargoUnits > div', function(e) {
            var self = $(this);
            if (!e.ctrlKey) {
                self.closest('.subBookContentListCol').find('.singleColItem').removeClass('ui-selecting');
                self.addClass('ui-selecting');
            } else {
                if (self.hasClass('ui-selecting')) {
                    self.removeClass('ui-selecting');
                } else {
                    self.addClass('ui-selecting');
                }
            }
        });

        $(document).on('click', '.mainBookingDetailsWrap .mainMoveUnitsLnk', function() {
            var chargesBookingId = '', url = '';
            if(docLink){
	       		$('.subBookingNbrsHdr .billMoveFrom').html('Consignment number');
	       		chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol')
                .find('.ui-selecting').attr("data-bolid")
            	$('.popUpTitle').html('B/L Number <span id="moveunitsbooking"></span>');
            	$('#moveUnitsPopup .popUpTitle #moveunitsbooking').html($('#mainBookDetailTitleeVal').html());
	       		url = '/Vms/booking/moveUnits?bolId=';
            } else {
            	url = '/Vms/booking/moveUnits?bookingId=';
            	chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol')
                .find('.ui-selecting').attr('data-bookingid')
            }
            
            if (nsBooking.globalBookingFlag.mainBookingFlag) {
            	nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
    			'mainBookingFlag', $(this));
    			return false;
    		}
            $('.preloaderWrapper').show();
            vmsService.vmsApiService(function(response) {
            	$('.preloaderWrapper').hide();
                if (response) {
                    fnDdLpDp(response);
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, url + chargesBookingId, 'GET', null);
            $('#moveUnitsPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '85%',
                position : {
                    my : "top",
                    at : "top+50"
                },
                dialogClass: 'noTitleBar',
                open: function() {
                	nsBookDoc.moveUnitPortPair = '';
                    $('#moveUnitsPopup').prev().remove();
                    $('#moveUnitsPopup').find('input').val('');
                },
                close: function() {
                	 nsBookDoc.moveUnitPortPair = '';
                    $('#moveUnitsPopup').find('.subBookContentListCol').text('');
                }
            });
        });
        $(document).on('click', '#moveUnitsPopup .cargoVin', function() {
            var self = $(this),
                cargoUnitsContent = [],
                selectedSubBookingId = '';
            if(nsDoc){
         		$("#cargoFromSearch").val('');
         		$("#cargoToSearch").val('');
            }

            if (self.closest('.subBookPanelWrapper ').hasClass('fromPanelWrapper')) {
                self.closest('.subBookingNbrsCntnt').find('.cargoVin').removeClass('activeFromSubBook activeSubBook');
                self.addClass('activeSubBook activeFromSubBook');
            } else {
                self.closest('#moveToSubBookUnits').find('.cargoVin').removeClass('activeSubBook activeToSubBook');
                self.addClass('activeSubBook activeToSubBook');
            }

            selectedSubBookingId = $(this).attr('data-subBookingId');

            $.each(moveUnitsData.subBookingList, function(i, obj) {
                if ((parseInt(selectedSubBookingId) === parseInt(obj.subBookingId) && !nsDoc) ||
                (parseInt(selectedSubBookingId) === parseInt(obj.subBookingId) && obj.cargoUnitList && nsDoc)){
                    $.each(obj.cargoUnitList, function(cargoUnitCount, cargoUnit) {
                        var vinNumber = 'New Cargo';
                        if (cargoUnit.vinNumber) {
                            vinNumber = cargoUnit.vinNumber;
                        }
                        if (cargoUnit.cargoId) {
                            cargoUnitsContent.push('<div data-consignmentLegId="' + cargoUnit.consignmentLegId
                            + '" data-newcargo="' + cargoUnit.newCargo + '" data-statusCode="' + cargoUnit.statusCode
                            + '" data-cargoTypeId="' + cargoUnit.cargoTypeId + '" data-cargoUnitId="'
                            + cargoUnit.cargoId + '" data-filtering="' + nsBookDoc.escapeHtml(vinNumber)
                            + '" class="CargoUnitVin singleColItem"><span>' + nsBookDoc.escapeHtml(vinNumber)
                            + '</span></div>');
                        }
                    });
                }
            });
            self.closest('.subBookPanelWrapper').find('.cargoUnitCntnt').html(cargoUnitsContent.join(''));
            initializeDragEvent();
        });

        $('.moveUnitDialogClose').click(function() {
            nsBooking.activeBooking();
            if($('.searchMenuWrapper .subBookContentListCol .thrdLevel').filter(function(){
            	return $(this).attr('data-bookingid') === $('.searchMenuWrapper .subBookContentListCol .scndLevel.activeSubBook').attr('data-bookingid');
            }).length > 0) {
            	$('.searchMenuWrapper .subBookContentListCol .thrdLevel').remove();
            	$('.searchMenuWrapper .subBookContentListCol .scndLevel.activeSubBook').find('.expandBooking').removeClass('fa-minus').addClass('fa-plus');
            	$('.searchMenuWrapper .subBookContentListCol .scndLevel.activeSubBook').find('.expandBooking').trigger('click');
            }
            $(this).closest('.ui-dialog-content').dialog('close');
        });
    });

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc, this.doc);