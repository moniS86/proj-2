/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var defaultUnit = localStorage.getItem('measurementType'),
        bookingHeaderNames = {
            'BLNbr': 'BL # ',
            'createdOn': 'Created on',
            'createdBy': 'Created by'
        },
        responseCargo = {},
        cargoList = {},
        consType = '';

    function deleteFromSearchRepsonse(toDeleteBookig) {
        var bookingIndex = returnBookingIndex(nsBooking.bookingDataTree, toDeleteBookig);
        if (bookingIndex > -1) {
            nsBooking.bookingDataTree.responseData.searchCriteriaResultsList.splice(bookingIndex, 1);
        }
    }
    
    function setActiveSingleColItem(thisItem) {
        $(thisItem).closest('.subBookingNbrsCntnt').find('.singleColItem').removeClass('activeSubBook');
        $(thisItem).addClass('activeSubBook');
    }
    
    function checkResponseObj(responseDTO) {
    	if(responseDTO && responseDTO.searchCriteriaResultsList){
    		return (responseDTO.searchCriteriaResultsList.length > 0) ? true : false;
    	}else{
    		return false;
    	}
    }

    function returnBookingIndex(bookingDataTree, toDeleteBooking) {
        var bookingIndex = -1;
        if (checkResponseObj(bookingDataTree.responseData)) { // Delete
            $.each(bookingDataTree.responseData.searchCriteriaResultsList, function(i, val) {
                if (val.bookingId === toDeleteBooking) {
                    bookingIndex = i;
                }
            });
        } // Delete
        return bookingIndex;
    }

    function checkAttr(dataAttr, isDeletedBoth, toDelete, response, dataToSend, newBook) {
        if (dataAttr === 'data-bookingid' || (isDeletedBoth && dataAttr === 'data-subbookingid')) {
            toDelete = (dataAttr === 'data-bookingid') ? dataToSend : nsBooking.selectedEntity.selectedBooking;
            $('.mainBookingListWrap .mainBookingCount').text(parseInt($('.mainBookingListWrap .mainBookingCount').text()) - 1);
            if(!newBook){
            	deleteFromSearchRepsonse(toDelete);
            }
        } else {
            if (dataAttr === 'data-subbookingid' && response.responseDescription === 'Sub-Booking Deleted') {
                $('.mainSubBookingListWrap .mainSubBookingCount').text(parseInt($('.mainSubBookingListWrap .mainSubBookingCount').text()) - 1);
            }
        }
    }

    function getSelectedSubBooking(dataAttr, dataToSend) {
        if (dataAttr === 'data-bookingid') {
            return nsBooking.selectedEntity.selectedBooking === dataToSend;
        } else {
            return nsBooking.selectedEntity.selectedSubBooking === dataToSend;
        }
    }

    function changesInUIAfterSubDelete(dataAttr, dataToSend, isDeletedBoth) {
    	var isSelectedItem = getSelectedSubBooking(dataAttr, dataToSend),
    	scndLvlId = '', scndLevelCount = 0, frstLvlId = '', frstId = '', scndLvlInd = '';
	    // Elements
	    if (dataAttr === 'data-subbookingid' && !isDeletedBoth &&
	        $('.mainBookingListWrap .singleColItem.cargoVin.thrdLevel').filter(function() {
	            return $(this).attr('data-bookingid') === nsBooking.selectedEntity.selectedBooking;
	        }).length === 0) {
	        // booking hide
	        $('#mainViewSummaryLink,.mainBookingDetailsWrap, .mainSubBookingListWrap,.mainSubBookingFormWrap').hide();
	        $('.billLadingDetailsDivWrapper,.mainSubBookingListWrap .subBookContentListCol').hide();
	        $('.mainBookingListWrap').find('[data-bookingid="' +
	            nsBooking.selectedEntity.selectedBooking + '"].singleColItem').hide();
	    }
	    scndLvlId = $('.mainBookingListWrap .subBookingNbrsCntnt').find('[data-bookingid="' + nsBooking.selectedEntity.selectedBooking + '"]').attr('id');
	    if(scndLvlId){
		    frstLvlId = 'frstLevel_' + scndLvlId.split('_')[1] + '_';
		    scndLvlInd = 'scndLevel_' +scndLvlId.split('_')[1] + '_';
	    }
	    $.each($('.frstLevel'), function(i,v){
	    	if($(this).attr('id').indexOf(frstLvlId) >= 0){
	    		frstId = $(this).attr('id');
	    	}
	    })
	    $.each($('.scndLevel'), function(i,v){
	    	if($(v).attr('id').indexOf(scndLvlInd) >= 0){
	    		scndLevelCount++;
			}
		})
	    if(dataAttr === 'data-subbookingid' && $('.searchNavigation').hasClass('newSrchDiv') && $('.scndLevel').length === 1 && $('.thrdLevel').length === 0){
	    	$('.searchNavigation').remove();
	    }else if(dataAttr === 'data-subbookingid' && frstId && scndLevelCount === 1 && $('.frstLevel').length === 1 && $('.thrdLevel').length === 0){
	    	$('.searchNavigation').remove();
	    }else if(dataAttr === 'data-subbookingid' && frstId.split('_')[2] === '1' && scndLevelCount === 1 && $('.thrdLevel').length === 0){
	    	$('#' + frstId).remove();
	    }else if ((dataAttr === 'data-bookingid') && isSelectedItem) {
            // for selected Book delete
            $('#mainViewSummaryLink,.mainBookingDetailsWrap, .mainSubBookingListWrap,.mainSubBookingFormWrap').hide();
            $('.mainBookingListWrap .singleColItem.cargoVin.thrdLevel').filter(function() {
                return $(this).attr('data-bookingid') === nsBooking.selectedEntity.selectedBooking;
            }).hide();
            $('.billLadingDetailsDivWrapper,.mainSubBookingListWrap .subBookContentListCol').hide();
            nsBooking.selectedEntity.selectedBooking = '';
        } else if ((dataAttr === 'data-subbookingid') && isSelectedItem && !isDeletedBoth) {
            // for selected Sub Book delete
        	 if($('.mainBookingListWrap').find('[data-bookingid="' + nsBooking.selectedEntity.selectedBooking + '"].singleColItem.thrdLevel').length>1){
	        	$('.mainBookingListWrap').find('[data-bookingid="' + nsBooking.selectedEntity.selectedBooking + '"].singleColItem.scndLevel').trigger('click');
             }
            nsBooking.selectedEntity.selectedSubBooking = '';
        } else {
            if (isDeletedBoth && dataAttr === 'data-subbookingid') {
                $('.mainBookingListWrap .subBookingNbrsCntnt')
                    .find('div[data-bookingid="' + nsBooking.selectedEntity.selectedBooking + '"]').remove();
                nsBooking.selectedEntity.selectedBooking = '';
                $('#mainViewSummaryLink,.mainBookingDetailsWrap, .mainSubBookingListWrap').hide();
                $('.mainSubBookingFormWrap, .billLadingDetailsDivWrapper').hide();
            }
        }
    }
    $(document).ready(function() {
        vmsService.vmsApiService(function(response) {
            var dimensions = '';
            if (response) {
                $.each(response, function(i, val) {
                    dimensions += '<option value="' + val.code + '">' + val.desc + '</option>';
                });
                $('.cargoDimensions').html(dimensions).val(defaultUnit);
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.measurement, 'GET', null);
        $(document).on('keydown','#declaredValDesc', function() {
            nsCore.validateDecimals(this.id, "currCode");
        });
        $(document).on('click', '.existingVin.BillDetailsIcon.bookingDetails', function() {
            var indexVal = $(this).closest('.singleColItem').attr('data-index'),
                currentEle = $(this),
                ele = $('.toolTipWrapper'),
                tooltipContent = '',
                currentItem = responseCargo.responseData[indexVal];
            $('.toolTipWrapper').text('').hide();
            tooltipContent += '<div class="toolTipWrap">';
            tooltipContent += '<table cellspacing="0" cellpadding="0" class="toolTipList">';
            tooltipContent += '<tr><td class="bold">' + bookingHeaderNames.BLNbr +
                '</td><td> ' + currentItem.BLNbr +
                '</td></tr><tr><td class="bold">' +
                bookingHeaderNames.createdOn + '</td><td> ' +
                currentItem.createdOn + '</td></tr><tr><td class="bold">' +
                bookingHeaderNames.createdBy + '</td><td> ' +
                currentItem.createdBy + '</td></tr>';
            tooltipContent += '</table></div>';
            $('.toolTipWrapper').html(tooltipContent).show();
            $(ele).position({
                my: 'left top',
                at: 'right top-25',
                collision: 'flipfit',
                of: $(currentEle)
            });
            $('.leftArrowIcon').position({
                my: 'left top',
                at: 'right-11 top-5',
                collision: 'flipfit',
                of: $(currentEle)
            });
        });
        $('#bookingUnitPopup .subBookingNbrsCntnt.totalSubBookingList').
        on('click', '.CargoUnitVin.singleColItem', function(event) {
            var indexVall = $(this).closest('.singleColItem').attr('data-index'),
                currentItem1 = cargoList[indexVall],
                formSubmit,
                conLeg = currentItem1.consignmentLegList[0],
                carcon = conLeg.cargoConsignmentList[0],
                cargo = carcon.cargo,
                length = currentItem1.bookedDimension.length,
                width = currentItem1.bookedDimension.width,
                height = currentItem1.bookedDimension.height,
                weight = currentItem1.bookedDimension.weight,
                area = currentItem1.bookedDimension.area,
                volume = currentItem1.bookedDimension.volume,
                measUnit = currentItem1.perUnitBooked,
                bkdUnits = currentItem1.bookedUnits,
                equipementNo = carcon.equipNo,
                selectedVal = '';
            event.preventDefault(); // to stop all parent actions
            setActiveSingleColItem($(this));
            if (currentItem1.consignmentStatus >= 20) {
                formSubmit = $('#bookingUnitPopup').find('#vinSerialNbr,#currCode,#regPlate,#cargoHoldOn,'
                    + '#newCargochk,#declaredValDesc,.customerRef,#docReceiptNbr,'
                    + ' #newEquipmentNum, #cargoDetails');
                formSubmit.prop('disabled', true);
            } else {
                formSubmit = $('#bookingUnitPopup').find('#vinSerialNbr,#currCode,#cargoHoldOn,#newCargochk,'
                    + '#declaredValDesc,.customerRef,#docReceiptNbr,'
                    + '#regPlate,#newEquipmentNum, #cargoDetails');
                formSubmit.prop('disabled', true);
                if (consType === 'M') {
                    formSubmit = $('#bookingUnitPopup').find('#vinSerialNbr,#currCode,#cargoHoldOn,#newCargochk,'
                        + '#declaredValDesc,.customerRef,#docReceiptNbr,'
                        + '#regPlate,#newEquipmentNum, #cargoDetails');
                } else {
                    formSubmit = $('#bookingUnitPopup').find(
                        '#cargoHoldOn,.customerRef,#newEquipmentNum, #cargoDetails');
                }
                formSubmit.prop('disabled', false);
            }
            $('input.vinSerialNbr').val(cargo.vinNumber);
            // VMS
            $('#cargoHoldOn').prop('checked', carcon.cargoOnHold === 'Y');
            // 678
            $('select.allocStatus').val(conLeg.firm);
            // VMS
            $('#newCargochk').prop('checked', cargo.newCargo === 'Y');
            // 678
            /*actual dimension*/
            if(cargo.actualDimension.dimensionType){
	            $('.cargoDimensions.actualDim').val(cargo.actualDimension.dimensionType);
	            $('.cargoDimensions.bookedDim').val(currentItem1.bookedDimension.dimensionType);
	            $('.cargoDimensions.freightDim').val(currentItem1.freightedDimension.dimensionType);
	            $('input.actualLength').val(cargo.actualDimension.length);
	            $('input.actualWidth').val(cargo.actualDimension.width);
	            $('input.actualHeight').val(cargo.actualDimension.height);
	            $('input.actualWeight').val(cargo.actualDimension.weight);
	            $('input.actualArea').val(cargo.actualDimension.area);
	            $('input.actualVolume').val(cargo.actualDimension.volume);
            }
            /* Booked dimension */
            if (measUnit === 'N') {
                length = length || (length / bkdUnits);
                width = width || (width / bkdUnits);
                height = height || (height / bkdUnits);
                weight = weight || (weight / bkdUnits);
                area = area || (area / bkdUnits);
                volume = volume || (volume / bkdUnits);
            }
            $('input.bklenCal').val(length);
            $('input.bkwidCal').val(width);
            $('input.bkheiCal').val(height);
            $('input.bkweiCal').val(weight);
            $('input.bkareCal').val(area);
            $('input.bkvolCal').val(volume);
            /* Freighted dimension */
            length = currentItem1.freightedDimension.length;
            width = currentItem1.freightedDimension.width;
            height = currentItem1.freightedDimension.height;
            weight = currentItem1.freightedDimension.weight;
            area = currentItem1.freightedDimension.area;
            volume = currentItem1.freightedDimension.volume;
            measUnit = currentItem1.perUnitFreighted;
            bkdUnits = currentItem1.bookedUnits;
            if (measUnit === 'N') {
                length = length || (length / bkdUnits);
                width = width || (width / bkdUnits);
                height = height || (height / bkdUnits);
                weight = weight || (weight / bkdUnits);
                area = area || (area / bkdUnits);
                volume = volume || (volume / bkdUnits);
            }
            $('input.frlencal').val(length);
            $('input.frwidtcal').val(width);
            $('input.frheical').val(height);
            $('input.frweical').val(weight);
            $('input.frareacal').val(area);
            $('input.frvolcal').val(volume);
            $('select#currCode').val(cargo.declaredCurrency.currencyCode);
            $('input.declaredValDesc').val(cargo.declaredValue);
            $('input.customerRef').val(cargo.customsRef);
            $('.cargoDataReceived').val(carcon.dateReceivedStr);
            $('.cargoDataLoaded').val(carcon.dateLoadedStr);
            $('input.dataLoaded').val(carcon.dateLoadedStr);
            $('.cargoDateReleasedLoad').val(carcon.dateReleasedLoadStr);
            $('input.dataReceived').val(carcon.dateReceivedStr);
            $('input.docReceiptNbr').val(carcon.docReceiptNo);
            $('input.regPlate').val(cargo.regPlate);
            $('input.cargoCondition').val(carcon.cargoCondition);
            $('input.loadTerminal').val(conLeg.loadTerminal.termCode);
            $('input.discTerminal').val(conLeg.discTerminal.termCode);
            $('#cargoConsId').val(carcon.cargoConsID);
            $('#newEquipmentNum').val('');
            $('#equipmentType').val('');
            if (!equipementNo) {
                $('#newEquipmentNum').val('');
            } else {
                $('#newEquipmentNum').find('[data-equipNo="' + escape(equipementNo) + '"]').prop('selected', 'selected');
                selectedVal = $('#newEquipmentNum').val();
                $('#equipmentType').val(unescape(selectedVal));
            }
            $('#bookingUnitForm').find('.bookingUnitContent,.formSubmitButtons').show();
        });
        /** View cargo detail delete **/
        $('#confirmDialogPopup').on('submit', '#confirmDialogForm', function(e) {
            var dataType = $('#confirmDialogPopup').dialog('option', 'dataType'),
                dataAttr = $('#confirmDialogPopup').dialog('option', 'dataAttr'),
                dataToSend = $('#confirmDialogPopup').dialog('option', 'dataToSend'),
                cargoUrl = $('#confirmDialogPopup').dialog('option', 'dataUrl'),
                prevEleClassName = '',forthLevelDel='', checkId = 0;
            e.preventDefault();
            $('#confirmDialogPopup').dialog('close');
            $('.preloaderWrapper').show();
            vmsService.vmsApiService(function(response) {
                var isDeletedBoth = '', newBook,
                    toDelete = '';
                if (response) {
                	response = (typeof(response) === 'string') ? JSON.parse(response) : response;
                    $('.preloaderWrapper').hide();
                    if (response.responseDescription === 'Data expired') {
                        nsCore.showAlert('Data is Expired');
                    } else if(response.responseDescription === 'concurrency' || response.responseCode === '45000'){ // added 45000 check for concurrency
                    	nsCore.showAlert('Someone else have updated the data since you retrieved the booking information');
                    } else if(response.responseCode === '3900'){
                    	nsCore.showAlert('Can\'t delete booking,some of the cargos are received/loaded');
                    }else {
                    	if (response.responseDescription.indexOf('Error') === -1) {
                    		prevEleClassName = $('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem')[0].previousSibling.className;
                    		checkId = parseInt($('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem')[0].previousSibling.id.split('_')[2]);
                    		isDeletedBoth = (response.responseDescription === 'Booking And Sub-Booking Deleted');
                    		newBook = $('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem').attr('class').indexOf('menuItemTableFor') > -1;
                    		forthLevelDel = $('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem')[0].id;
                    		if (prevEleClassName.indexOf('frstLevel') >= 0 && checkId === 1){
                    			$($('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem')[0].previousSibling).remove();
                    		}
                    		
                    		if($('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem.scndLevel').find('.expandBooking').hasClass('fa-minus')){
                    			$('.frthLevel').remove();
                    		}
                    		$('.' + dataType).find('[' + dataAttr + '="' + dataToSend + '"].singleColItem').remove();
                    		checkAttr(dataAttr, isDeletedBoth, toDelete, response, dataToSend, newBook);
                    		changesInUIAfterSubDelete(dataAttr, dataToSend, isDeletedBoth);
                    		if(forthLevelDel.indexOf('thrdLevel') >= 0){
                				removeFromNavWhileDelete(forthLevelDel);
                			}
                    		$('.thrdLevel').find('.expandSubBooking').removeClass('fa-minus').addClass('fa-plus')
                    	}
                    }
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, cargoUrl, 'GET', '');
        });
        
        
        function removeFromNavWhileDelete(ele){
        	var revertedBookingEleId=ele;
        	var revertedNavIdIndex=revertedBookingEleId.split('_')
        	if(revertedNavIdIndex[0]==='scndLevel'){
        		revertedNavIdIndex = '_'+revertedNavIdIndex[1]+'_'+revertedNavIdIndex[2]
        		$.each($('.thrdLevel'), function(i,v){
        		var removeThrdLevel =$(this).attr('id').split('_')
        		removeThrdLevel='_'+removeThrdLevel[1]+'_'+removeThrdLevel[2]
            	if(revertedNavIdIndex===removeThrdLevel){
            		$(this).remove();
            	}
            })	
        	}else if(revertedNavIdIndex[0]==='thrdLevel'){
        		revertedNavIdIndex = '_'+revertedNavIdIndex[1]+'_'+revertedNavIdIndex[2]+'_'+revertedNavIdIndex[3]
        		 $.each($('.frthLevel'), function(i,v){
        		var removeFrthLevel =$(this).attr('id').split('_')
        		removeFrthLevel='_'+removeFrthLevel[1]+'_'+removeFrthLevel[2]+'_'+removeFrthLevel[3]
            	if(revertedNavIdIndex===removeFrthLevel){
            		$(this).remove();
            	}
            })
        	}
        	if(revertedNavIdIndex[0]!=='frthLevel'){
        		$('.frthLevel').remove();
        	}
        	if(revertedNavIdIndex[0]==='frthLevel'){
        		var thrdLevelValue1=($("#thrdLevel_"+revertedBookingEleId.split('_')[1]+'_'+revertedBookingEleId.split('_')[2]+'_'+revertedBookingEleId.split('_')[3]).find('span a').html().split(' - ')[0]-1),
        		 thrdLevelValue2=$("#thrdLevel_"+revertedBookingEleId.split('_')[1]+'_'+revertedBookingEleId.split('_')[2]+'_'+revertedBookingEleId.split('_')[3]).find('span a').html().split(' - ')[1],
        		 thrdLevelValue=thrdLevelValue1+' - '+ thrdLevelValue2
        		$("#thrdLevel_"+revertedBookingEleId.split('_')[1]+'_'+revertedBookingEleId.split('_')[2]+'_'+revertedBookingEleId.split('_')[3]).find('span a').html(thrdLevelValue)
        			
        	}
        	$('#'+revertedBookingEleId).remove();
        	if($('.frthLevel').length===0){
        		$('#thrdLevel_'+revertedBookingEleId.split('_')[1]+"_"+revertedBookingEleId.split('_')[2]+"_"+revertedBookingEleId.split('_')[3]).remove();
        	}
        	if($('.thrdLevel').length===0){
        		$('#scndLevel_'+revertedBookingEleId.split('_')[1]+"_"+revertedBookingEleId.split('_')[2]).remove();
        	}else{
        		var idVal='scndLevel_'+revertedBookingEleId.split('_')[1]+"_"+revertedBookingEleId.split('_')[2]
        		$('.mainBookingListWrap .subBookContentListCol .scndLevel[id="'+idVal+'"]').trigger('click');
        	}
        	$('#bookingUnitPopup').css('display') === 'none' ? $('.bookingUnitWrap').hide() : $('#bookingUnitPopup').dialog('close')
        	nsBookDoc.addingBottomBorderScndLevel();
        }
        
        $.extend(true,nsBooking,{'removeFromNavWhileDelete':removeFromNavWhileDelete});
        
        $('#bookingUnitPopup .subBookingNbrsCntnt.totalSubBookingList')
            .on('click', '.CargoUnitVin.singleColItem .mainBookingItemIcons .rowRemoveIcon',
            function(e) {
                var cargoId = $(this).closest('.singleColItem').attr('data-cargoId'),
                    timeStamp = $(this).closest('.singleColItem').attr('data-cargotimestamp'),
                    currentIndex = $(this).closest('.singleColItem').attr('data-index'),
                    nextIndex = parseInt(currentIndex) + 1;
                e.stopPropagation();
                e.preventDefault();
                $('#confirmDialogPopup').dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    width: '35%',
                    open: function() {
                    	var titleText = '';
        	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
        	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
        	            	.removeClass('ui-corner-all ui-widget');
        	            titleText = $('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
        	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
        	        	$('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
        	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
        	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                        $('#confirmDialogPopup .rowItem').text('');
                        $('#confirmDialogPopup .rowItem').text('Do you want to delete this Cargo?');
                        $('#confirmDialogPopup').find('form').attr('id', 'confirmCargoDelete');
                    },
                    'cargoId': cargoId,
                    'nextIndex': nextIndex,
                    'timeStamp': timeStamp
                });
            });
        $('#confirmDialogPopup').on('submit', '#confirmCargoDelete', function(eventLis) {
            var timeStamp = $('#confirmDialogPopup').dialog('option', 'timeStamp'),
                cargoToDelete = $('#confirmDialogPopup').dialog('option', 'cargoId'),
                nextCargoIndex = $('#confirmDialogPopup').dialog('option', 'nextIndex'),                
                parentList  = $('#bookingUnitPopup:visible').length === 0? $('.mainBookingListWrap .mainBookListCol') : $('#bookingUnitPopup .totalSubBookingList'),
                nextRow = parentList.find('.frthLevel[data-index="' + nextCargoIndex + '"]'),
                rowToRemove = parentList.find('.frthLevel[data-cargoId="' + cargoToDelete + '"]'),
                activeSubBookId = ($('#bookingUnitPopup').css('display') === 'none' ? '#thrdLevel'+rowToRemove.attr('id').substring(9,rowToRemove.attr('id').lastIndexOf('_')) : '#'+$('.thrdLevel.activeSubBook').attr('id')),
                subBookId = $(activeSubBookId).attr('data-subbookingid'),
                subBookText  = $(activeSubBookId).text().split(' '),
                //VMSAG-4942
                bookingidpopup = $('div.billVin.singleColItem.activeSubBook.ui-selecting a > span.inlinePanel').text(),
                cargo = {
                    id: cargoToDelete,
                    timeStamp: timeStamp,
                    consTimeStmp: nsBookDoc.cargoSubBookTimeStamp
                };
            eventLis.preventDefault();
            eventLis.stopImmediatePropagation();
            vmsService.vmsApiServiceType(function(response) {
                if (response) {                	
                	if(response.responseDescription === 'Delete successful'){
	                    $(rowToRemove).remove();
	                    if (nextRow.length !== 0) {
	                    	//frth level id refresh, 5205
	                    	$('.frthLevel').each(function(i,v){
	                    		if($(this).attr('id')){
	                    		var currId = $(this).attr('id').split('_');
	                    		currId[currId.length - 1] = i;
	                    		$(this).attr('id',currId.join('_'))
	                    		}
                    		})
	                        $(nextRow).trigger('click');
	                        subBookText[2] = ''+ (parseInt(subBookText[2]) -1) + '';
	                        $(activeSubBookId).find('span a').text(subBookText.join(' '));
	                        //VMSAG-4942
	                        $('#bookingUnitPopup').find('.subBookingNumTitle').html('Booked VINS for </br>' + subBookText.join(' '));
	                        $('#bookingUnitPopup').find('#cargodetails').html(bookingidpopup +" "+ subBookText.join(' '));
	                    } else if (parentList.find('.frthLevel').length !== 0) {
	                    	$('.frthLevel').each(function(i,v){
	                    		// this condition added so that it iterates only the leftnavigation fourthlevel
	                    		if($(this).attr('id')){
		                    		var currId = $(this).attr('id').split('_');
		                    		currId[currId.length - 1] = i;
		                    		$(this).attr('id',currId.join('_'))
	                    		}
                    		})
	                        nextRow = parentList.find('.frthLevel[data-index="0"]');
	                        $(nextRow).trigger('click');
	                        subBookText[2] = ''+ (parseInt(subBookText[2]) -1) + '';
	                        $(activeSubBookId).find('span a').text(subBookText.join(' '));
	                        $('#bookingUnitPopup').find('.subBookingNumTitle').html('Booked VINS for </br>' + subBookText.join(' '));
	                        $('#bookingUnitPopup').find('#cargodetails').html(bookingidpopup +" "+ subBookText.join(' '));
	                    } else if(parentList.find('.frthLevel').length === 0 && $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').length === 1){
	                    	nsBooking.bookUnitPopUpFlag = true;
	                    	$('#bookingUnitPopup').css('display') === 'none' ? $('.bookingUnitWrap').hide() :$('#bookingUnitPopup').dialog('close');
	                    	$(activeSubBookId).remove();
	                    	$('.frthLevel').remove();
	                    	$('.bookingUnitContent').hide();
	                    	changesInUIAfterSubDelete('data-subbookingid', subBookId, false);
	                    	nsBooking.bookUnitPopUpFlag = false;
	                    } else if(parentList.find('.frthLevel').length === 0 && $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').length > 1){
	                    	$(activeSubBookId).remove();
	                    	$('.frthLevel').remove();
	                    	$('.bookingUnitContent').hide();
	                    	nsBooking.bookUnitPopUpFlag = true;
	                    	$('#bookingUnitPopup').css('display') === 'none' ? $('.bookingUnitWrap').hide() : $('#bookingUnitPopup').dialog('close');
	                    	changesInUIAfterSubDelete('data-subbookingid', subBookId, false);
	                    	nsBooking.bookUnitPopUpFlag = false;
	                    } else {
	                        $('.bookingUnitWrap').hide();
	                    }
	                    
                	} else if(response.responseDescription === 'concurrency'){
                		nsCore.showAlert('Someone else have updated the data since you retrieved the booking information');
                	}
                	else if(response.responseCode==='3900'){
                		nsCore.showAlert('Cannot delete VIN, some of the cargo are received/loaded');
                	}
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.dltCargo, 'POST', JSON.stringify(cargo));
            $(this).closest('.ui-dialog-content').dialog('close');
        });

    });

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);