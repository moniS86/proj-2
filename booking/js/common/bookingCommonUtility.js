/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, nsBookDoc, nsCore) {
    var ComUtilityObj = {
        'fnBookingDetailsBackward': fnBookingDetailsBackward,
        'fnBillLadingForward': fnBillLadingForward,
        'fnBillLadingBackward': fnBillLadingBackward,
        'fnSubBookingBackward': fnSubBookingBackward,
        'fnHandleActionPointsBooking': fnHandleActionPointsBooking,
        'fnDirtyDialog': fnDirtyDialog,
        'disabledBookingContentForBL': disabledBookingContentForBL,
        'enableBookingSaveCancel': enableBookingSaveCancel,
        'enableSaveCancel': enableSaveCancel,
        'populateRouteDetailGrid': populateRouteDetailGrid,
        'setSubookingTreeView': setSubookingTreeView,
        'populateBookedDim': populateBookedDim,
        'populateCargoConsAndThirdParty': populateCargoConsAndThirdParty,
        'getDecimal': getDecimal,
        'setMainAllocStatus': setMainAllocStatus,
        'setBookingHeaderUI': setBookingHeaderUI,
        'populateSubbookingContent': populateSubbookingContent,
        'setCommissionEnableDisable': setCommissionEnableDisable,
        'loadSubbookingContent': loadSubbookingContent,
        'populateFreightDim': populateFreightDim,
        'setBookingCreatedUI': setBookingCreatedUI,
        'setDropDrownForFreightCurr': setDropDrownForFreightCurr,
        'enableFieldForBL': enableFieldForBL,
        'disableFieldForBL': disableFieldForBL,
        'getBlStatusClassName': getBlStatusClassName,
        'populateSubbookingTree': populateSubbookingTree,
        'loadBlContent': loadBlContent,
        'headerPanelEnable': headerPanelEnable
    },
        billOfladingObj = {};

    function fnBookingDetailsBackward() {
        if ($('#bookingHeaderId').val()) {
            nsBooking.loadbookingcontent(nsBooking.fectSubBookingObj, null, 'Exist', null, true);
        } else {
            $('#createFreshBook')[0].reset();
            $('#possibleVoyageNewWrapId, #createFreshBook .possibleVoyageWrap').css('display', 'none');
            $('.routeDetailsAcc').hide();
        }
    }

    function fnBillLadingForward() {
        $('#billLadingDetailsForm').find('input[value="Save"]').trigger('click');
    }

    function fnBillLadingBackward() {
        var arrValues,
            i = 0,
            partyId = 0;
        $('#billLadingDetailsForm')[0].reset();
        arrValues = $('.billLadingPartyContentWrapper').find('[data-nullPartyId]');

        nsBooking.loadBillofLadingContent(billOfladingObj, nsBooking.selectedEntity.selectedBooking);
        // for removing null party id's if exists
        while ((arrValues.length - 1) > i) {
            if (!arrValues[i].getAttribute('data-partyId')) {
                partyId = arrValues[i].getAttribute('data-nullPartyId');
                $('.billLadingPartyContentWrapper').find('[data-nullPartyId="' + partyId + '"]')
                    .closest('.ladingPartyItem').remove();
            }
            i++;
        }
    }

    function fnSubBookingBackward() {
        if ($('.mainSubBookFormTitle').attr('data-subBookingTitle') === 'New Sub Booking') {
            $('.scndLevel.singleColItem.activeSubBook').trigger('click');
        } else {
            nsBooking.allChargeid = '';
            nsBooking.subBookingIdDelete = '';
            loadSubbookingContent(nsBooking.subBookingObj);
        }
    }   
    function thirdlevelCheck(){
    	loadSubbookingContent(nsBooking.subBookingObj);
    }
    function fnHandleActionPointsBooking(paramsCheck) {
        var params = paramsCheck || {},
            additionalActionPoints = params.additionalActionPoints || '',
            formSelector = params.formSelector || '',
            fnGoForward = params.fnGoForward || '',
            fnGoBackWard = params.fnGoBackWard || '',
            actionPointsTobeHandled = '';
        actionPointsTobeHandled = 'mainBookingItemIcons,.searchedItem .icons_sprite , .searchIcon,'
                    +'.subBookingNbrsCntnt>div,.subBookingNbrsCntnt .icons_sprite,.createBookingLnk,';

        actionPointsTobeHandled += '#leftSearchMenu,.filterActionLink, #mainAddBooking, #mainAddSubBooking,'
                    +' .filterDiv>input#subBoookingSearch,';

        actionPointsTobeHandled += '.buttonsList>a, .navigationBar a, .userMenu,';
        actionPointsTobeHandled += additionalActionPoints;
        $(document).find(formSelector + ' input[value=Save]').on('click', function() {
            $(formSelector).attr('data-dirty', false);
            return false;
        });
        $(document).find(actionPointsTobeHandled).on('click', function(event) {
            if ($(formSelector).attr('data-dirty') === 'true') {
                // prevent any parent handlers from being executed
                event.preventDefault();
                // to stop bubling effect
                event.stopPropagation();
                // prevent parent handlers and other handlers from executing
                event.stopImmediatePropagation();
                fnDirtyDialog(fnGoForward, fnGoBackWard, formSelector, $(this));
                return false;
            }
        });
    }

    function fnDirtyDialog(fnGoForward, fnGoBackWard, flagVar, clickedElem) {
        if (nsBooking.globalBookingFlag[flagVar]) {
            $('#dirtyFlagConfirmBox').dialog({
                resizable: false,
                modal: true,
                autoOpen: false,
                draggable: false,
                width: 400,
                closeOnEscape: false,
                open: function() {
                    $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
                    $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
	            	.removeClass('ui-corner-all ui-widget');
                },
                close: function() {
                    nsBooking.globalBookingFlag.isDynamicEle = false;
                },
                buttons: [{
                    text: 'Yes',
                    click: function() {
                        $(this).dialog('close');
                        fnGoForward();
                    }
                }, {
                    text: 'No',
                    click: function() {
                        var flagstoFalse = ['mainBookingFlag', 'mainBookingHeaderFlag', 'mainBlDetailsFlag'];
                        nsBooking.newBookFlag = false;
                        $.each(flagstoFalse, function(i, val) {
                            nsBooking.globalBookingFlag[val] = false;
                        });                                             
                        if(clickedElem.hasClass("thrdLevel")){
                        	thirdlevelCheck();
						}else{
							fnGoBackWard();
						}
                        if (!nsBooking.globalBookingFlag.isDynamicEle) {
                            if (clickedElem.is('a') && clickedElem.parents().hasClass('navigationBar')) {
                                nsBooking.navigateToClickedPath(clickedElem.attr('href'));
                            } else {
                            	if(clickedElem[0].id === 'leftSearchMenu'){
                            		clickedElem.trigger('submit');
                            	} else {
                            		clickedElem.trigger('click');
                            	}
                            }
                        } else {
                            if (nsBooking.globalBookingFlag.dynamicEleType === 'routeDetailGrid') {
                                $('#routeDetailGrid tbody tr:eq(' + nsBooking.globalBookingFlag.dynamicEleRowNum + ')')
								.find('.' + nsBooking.globalBookingFlag.dynamicEleClass).trigger('click');
                            } else {
                                return true;
                            }
                        }
                        $(this).dialog('close');
                    }
                }]
            }).dialog('open');
        }
    }

    function disabledBookingContentForBL(isBookingCreatedStatus, isCargoLoadAndDisch) {
        nsBooking.isBookingCreatedStatus = isBookingCreatedStatus;
        if (!nsBooking.isBookingCreatedStatus) {
            $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap'
                +'.showPreviousVoyageClass,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();

            $('input[name="mainBookingSave"]').attr('disabled', 'disabled');
            $('input[name="mainBookingSave"]').bind('click', false);

            $('.routeDetailGrid tbody tr').each(function() {
                $(this).find('.wayCargo').attr('disabled', 'disabled');
                $(this).find('.mainLeg').attr('disabled', 'disabled');
                $(this).find('.allocStatusType').attr('disabled', 'disabled');
            });
            
            $('#billLadingDetailsForm').find('input,select,textarea').prop('disabled', true);
            $('#billLadingDetailsForm :input[value="Save"]').prop('readOnly', true);

            $(' .textAreaDetailsIcon, .rowRemoveIcon, .editIcon,.billLadingDetailsDivWrapper a')
                .addClass('disabledLink');
            $('span .icons_sprite, .rowRemoveIcon').removeClass('disabledLink');            
            $('#viewPrintSettingsLink').removeClass('disabledLink');
            $('#viewPrintSettingsGrid input[type="checkbox"]').attr('disabled', 'disabled');

        } else {
            $('.routeDetailGrid tbody tr').each(function() {
                $(this).find('.mainLeg').removeAttr('disabled');
                $(this).find('.wayCargo').removeAttr('disabled');

                if (!isCargoLoadAndDisch  && $(this).find('.selectedRoute').attr('data-isLoaded') === 'N') {
                    $(this).find('.allocStatusType').removeAttr('disabled');
                }

            });
            $('#billLadingDetailsForm').find('input,select,textarea').not('#billDocumentationOffice, #billDocumentationOfficeDesc').prop('disabled', false);

            $('#billOrigin, #billDestination, #billloadPort, #billDischargePort, #billOceanVessel,'
                +'#billFreightParticulars,#billStatusDesc, #billIssuedDate, #blLastIssuedDate,' + '#billMRNnbr').prop('disabled', true);

            $('.textAreaDetailsIcon, .rowRemoveIcon, .editIcon,.billLadingDetailsDivWrapper a').removeClass('disabledLink');            

            $('#billLadingDetailsForm :input[value="Save"]').prop('readOnly', false);

            $('#viewPrintSettingsGrid input[type="checkbox"]').removeAttr('disabled');
        }
    }

    function enableBookingSaveCancel() {
        $('input[name="mainBookingSave"]').unbind('click', false);
        $('input[name="mainBookingSave"]').removeAttr('disabled');
    }

    function enableSaveCancel() {
        $('input[id="mainSubBookingFormSave"]').unbind('click', false);
        $('input[id="mainSubBookingFormCancel"]').unbind('click', false);
        $('input[id="mainSubBookingFormSave"]').removeAttr('disabled');
        $('input[id="mainSubBookingFormCancel"]').removeAttr('disabled');
    }

    function populateRouteDetailGrid(obj, isBooking) {
        if (!obj.consignmentLegModelList) {
            obj.consignmentLegModelList = [];
        }
        nsBookDoc.consignLegList = jQuery.extend(true, [], obj.consignmentLegModelList);
        if (!$.fn.DataTable.fnIsDataTable($('#routeDetailGrid'))) {
            nsBooking.loadROuteDetailsGrid(obj.consignmentLegModelList, isBooking);
        } else {
            $.fn.DataTable($('#routeDetailGrid')).destroy();
            nsBooking.loadROuteDetailsGrid(obj.consignmentLegModelList, isBooking);
        }
    }

    function setSubookingTreeView(obj) {
        var cargoTextVal = 'New Sub Booking',
            lengthNo = 0,
            originalLen = 4,
            k = 0,
            appe = '',
            subTitle = '';
        if (nsBooking.textNullCheck(obj.cargoText)) {
            cargoTextVal = obj.cargoText;
        }
        lengthNo = originalLen - obj.subBookingNo.length;
        for (k = 0; k < lengthNo; k++) {
            appe += '0';
        }      
        subTitle = appe + obj.subBookingNo + '-' + obj.bookedUnits + '-' + cargoTextVal;
        
        $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').each(function() {
            var canRemove;
            if ($(this).hasClass('ui-selecting')) {
                canRemove = obj.subBookingRemovable === 'Y' ? 'rowRemoveIcon' : 'rowRemoveDisabledIcon';
                $(this).find('.title').text(subTitle);

                $(this).find('.mainBookingItemIcons').find('.subbookingRemoveIcon')
                        .removeClass('rowRemoveDisabledIcon');

                $(this).find('.mainBookingItemIcons').find('.subbookingRemoveIcon').removeClass('rowRemoveIcon');
                $(this).find('.mainBookingItemIcons').find('.subbookingRemoveIcon').addClass(canRemove);
                if(subTitle){                	
	                if(parseInt(subTitle.split('-')[1])>0){
	                	$('.cargoVin.billVin.singleColItem.thrdLevel.activeSubBook.ui-selecting i:first').addClass('expandSubBooking');
	                	$('.cargoVin.billVin.singleColItem.thrdLevel.activeSubBook.ui-selecting i:first').removeClass('marginWithoutSubBooking');
	                	$('.cargoVin.billVin.singleColItem.thrdLevel.activeSubBook.ui-selecting i:first').removeClass('rightMargin');
	                }else{
	                	$('.cargoVin.billVin.singleColItem.thrdLevel.activeSubBook.ui-selecting i:first').removeClass('expandSubBooking');
	                	if($(this).attr('data-bolid')){
	                		$('.cargoVin.billVin.singleColItem.thrdLevel.activeSubBook.ui-selecting i:first').addClass('rightMargin');
	                	}else{
	                		$('.cargoVin.billVin.singleColItem.thrdLevel.activeSubBook.ui-selecting i:first').addClass('marginWithoutSubBooking');
	                	}
	                }
                }
                return false;
            }
        });
        // Initially Enable all Removes
        $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
            .find('.mainBookingItemIcons').find('.bookingRemoveIcon')
            .removeClass('rowRemoveDisabledIcon');
        // If atleast one Sub Booking Delete is Disabled, Disable the Delete for Booking
        if ($('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').filter(function() {
                return $(this).find('.mainBookingItemIcons').find('.subbookingRemoveIcon').hasClass('rowRemoveDisabledIcon');
            }).length > 0) {
            $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                .find('.mainBookingItemIcons').find('.bookingRemoveIcon').addClass('rowRemoveDisabledIcon');
        } else {
            $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                .find('.mainBookingItemIcons').find('.bookingRemoveIcon').addClass('rowRemoveIcon');
        }
    }

    function populateBookedDim(obj) {
        if (obj.bookedMeasurementUnit === '10') {
            $('#bookedMeasureUnit').val('10');
        } else {
            $('#bookedMeasureUnit').val('20');
        }
        if (obj.perUnitBooked === 'Y' || obj.perUnitBooked === '') {
            $('#bookedUnit #shipInfovalidStatus').prop('checked', true);
        } else {
            $('#bookedUnit #shipInfoHistStatus').prop('checked', true);
        }
        nsBooking.setBookedDimensions(obj);
    }

    function populateCargoConsAndThirdParty(obj) {
        var firm = 'N';
        nsBooking.subBookingBillStatus = obj.billOfLadingModel.bolStatus;
        $.each(obj.consignmentLegModelList, function(j, consignmentLegModel) {
            nsBooking.setUnitsValue(consignmentLegModel);
            $('select[name="bookingAllocStatus"]').removeAttr('disabled');
            $('.routeDetailGrid tbody tr').each(function() {
                if ($(this).find('.selectedRoute').is(':checked') && ($(this).find('.selectedRoute')
                        .attr('data-consignmentLegId') === consignmentLegModel.consignmentLegId)) {

                    nsBooking.populateThirdPartyInfo(consignmentLegModel, $(this).find('.selectedRoute')
                        .attr('data-vesselvoyage'));

                    $('input[name="bookingComments"]').val(consignmentLegModel.comment);
                    if (nsBooking.textNullCheck(consignmentLegModel.firm)) {
                        firm = consignmentLegModel.firm;
                    }
                    $('select[name="bookingAllocStatus"]').val(firm);
                    nsBooking.populateCargoConsignments(consignmentLegModel);
                }
            });

        });
    }

    function getDecimal(length) {
        return length ? parseFloat(length).toFixed(3) : '';
    }

    function setMainAllocStatus(obj) {
        var isFirm = 'N',
            i = 0;
        if (obj.consignmentLegModelList) {
            for (i = 0; i < obj.consignmentLegModelList.length; i++) {
                if (obj.consignmentLegModelList[i].consignmentType === 'M') {
                    isFirm = obj.consignmentLegModelList[i].firm;
                }
            }
        }
        $('select[name="bookingAllocStatus"]').val(isFirm);
    }

    function setBookingHeaderUI(obj) {
        $('#mainBookDetailCustomerDestination').removeAttr('disabled');
        $('#mainBookDetailCustomerDestinationDesc').removeAttr('disabled');
        $('#mainBookDetailCustomerOrigin').removeAttr('disabled');
        $('#mainBookDetailCustomerOriginDesc').removeAttr('disabled');

        if (parseInt(obj.loadedUnits) > 0) {
            $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
            $('.mainBookingDetailsWrap .showPreviousVoyageClass').hide();
        }

        $('#consignmentId').val(obj.subBookingId);
        $('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').val(obj.originPortCode);
        nsBookDoc.bookOrigin = obj.originPortCode;
        $('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').val(obj.originPortName);
        $('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').val(obj.destPortCode);
        nsBookDoc.bookDest = obj.destPortCode;
        $('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').val(obj.destPortName);
        nsBookDoc.subBookingdiffOrgDest(false)
        if (nsBooking.textNullCheck(obj.originPortCode)) {
            $('#mainBookDetailCustomerOrigin').attr('data-form1', '1');
        }
        if (nsBooking.textNullCheck(obj.originPortName)) {
            $('#mainBookDetailCustomerOriginDesc').attr('data-form1', '1');
        }
        if (nsBooking.textNullCheck(obj.destPortCode)) {
            $('#mainBookDetailCustomerDestination').attr('data-form2', '1');
        }
        if (nsBooking.textNullCheck(obj.destPortName)) {
            $('#mainBookDetailCustomerDestinationDesc').attr('data-form2', '1');
        }
        if (nsBooking.textNullCheck(obj.modelText) === '') {
            $('#makeModelListLink').addClass('disabledLink');
        }
    }

    function populateSubbookingContent(obj) {
        var length = 0,
            width = 0,
            height = 0,
            weight = 0,
            area = 0,
            volume = 0,
            booklength = 0,
            bookwidth = 0,
            bookheight = 0,
            bookweight = 0,
            bookarea = 0,
            bookvolume = 0;
        $('.subBookLevel #mainBookDetailCustomerCode').text(obj.customerCode);
        $('.subBookLevel #mainBookDetailCustomerDesc').text(obj.customerName);
        $('.subBookLevel #mainContract').text(obj.contractName);
        $('.subBookLevel #mCustomerRef').text(obj.customerRef?obj.customerRef:"");
        $('.comHeaderItem #mainContract').val(obj.contractId);
        $('select[name="bookingCargoType"]').val(obj.cargoType);
        nsBooking.getCargoStateList(obj.cargoType, obj.cargoState);
        $('input[name="bookingCargoText"]').val(obj.cargoText);
        $('select[name="bookingCargoState"]').val(obj.cargoState);
        $('input[name="bookingCargoMake"]').val(obj.modelText);
        $('input[name="bookingDocCode"]').val(obj.docOffCompCode);
        $('input[name="bookingDocDesc"]').val(obj.docOffCompName);
        $('#bookingDocOfficeId').val(obj.docOffCompId);
        $('textarea[name="cargoMarkNumbersIcon"]').val(obj.marksAndNumbers);
        $('textarea[name="cargoDescriptionIcon"]').val(obj.cargoDescription);
        if (obj.bookedUnits === '0') {
            $('input[name="totalBookedUnits"]').val('');
        } else {
            $('input[name="totalBookedUnits"]').val(obj.bookedUnits);
        }
        $('input[name="militaryCargo"]').prop('checked', obj.militaryCargo === 'Y');
        $('input[name="hazardousCargo"]').prop('checked', obj.hazardousCargo === 'Y');
        setMainAllocStatus(obj);
        $('.totalRCD a').text(obj.receivedUnits);
        $('.totalLDD a').text(obj.loadedUnits);
        if(obj.commission){
        	obj.commission = parseFloat(obj.commission).toFixed(2);
        }
        $('input[name="mainBookingFreightCommission"]').val(obj.commission);
        $('select[name="mainBookingFreightBasis"]').val(obj.chargeBasis);
        $('select[name="mainBookingFreightCurrency"]').val(obj.currencyCode);
        $('select[name="mainBookingFreightPayment"]').val(obj.prepaid);
        checkForZeroDim(obj);
        $('input[name="freightedLength"]').val(obj.freightedLength);
        $('input[name="freightedWidth"]').val(obj.freightedWidth);
        $('input[name="freightedHeigth"]').val(obj.freightedHeight);
        $('input[name="freightedWeight"]').val(obj.freightedWeight);
        $('input[name="freightedArea"]').val(obj.freightedArea);
        $('input[name="freightedVolume"]').val(obj.freightedVolume);
        length = $('input[name="freightedLength"]').val();
        $('input[name="freightedLength"]').val(getDecimal(length));
        width = $('input[name="freightedWidth"]').val();
        $('input[name="freightedWidth"]').val(getDecimal(width));
        height = $('input[name="freightedHeigth"]').val();
        $('input[name="freightedHeigth"]').val(getDecimal(height));
        weight = $('input[name="freightedWeight"]').val();
        $('input[name="freightedWeight"]').val(weight ? parseFloat(weight).toFixed(0) : '');
        area = $('input[name="freightedArea"]').val();
        $('input[name="freightedArea"]').val(getDecimal(nsBookDoc.converToUpperDecimalOnFive(area, 3)));
        volume = $('input[name="freightedVolume"]').val();
        $('input[name="freightedVolume"]').val(getDecimal(nsBookDoc.converToUpperDecimalOnFive(volume, 3)));
        if (obj.bookedLength !== obj.freightedLength || obj.bookedWidth !== obj.freightedWidth ||
            obj.freightedHeight !== obj.bookedHeight) {
            nsBooking.isDiffFreight = true;
        }
        $('input[name="bookedLength"]').val(obj.bookedLength);
        $('input[name="bookedWidth"]').val(obj.bookedWidth);
        $('input[name="bookedHeigth"]').val(obj.bookedHeight);
        $('input[name="bookedWeight"]').val(obj.bookedWeight);
        $('input[name="bookedArea"]').val(obj.bookedArea);
        $('input[name="bookedVolume"]').val(obj.bookedVolume);
        booklength = $('input[name="bookedLength"]').val();
        $('input[name="bookedLength"]').val(getDecimal(booklength));
        bookwidth = $('input[name="bookedWidth"]').val();
        $('input[name="bookedWidth"]').val(getDecimal(bookwidth));
        bookheight = $('input[name="bookedHeigth"]').val();
        $('input[name="bookedHeigth"]').val(getDecimal(bookheight));
        bookweight = $('input[name="bookedWeight"]').val();
        $('input[name="bookedWeight"]').val(bookweight ? parseFloat(bookweight).toFixed(0) : '');
        bookarea = $('input[name="bookedArea"]').val();
        $('input[name="bookedArea"]').val(getDecimal(nsBookDoc.converToUpperDecimalOnFive(bookarea, 3)));
        bookvolume = $('input[name="bookedVolume"]').val();
        $('input[name="bookedVolume"]').val(getDecimal(nsBookDoc.converToUpperDecimalOnFive(bookvolume,3)));
        $('input[name="mainBookingFreightRate"]').val(nsCore.roundingNumbersCharges(obj.chargeRate, obj.currencyCode, ""));
        if(obj.totalFreight){
        	obj.totalFreight = nsCore.roundingNumbersCharges(obj.totalFreight, obj.currencyCode, "");
        }
        $('input[name="mainBookingFreightFreight"]').val(obj.totalFreight);
        nsBooking.findTotal(obj.chargeBasis, obj.consignmentLegModelList[0].bookedUnits, obj.chargeRate, obj.freightedLength, obj.freightedWeight, obj.freightedMeasurementUnit, obj.freightedVolume, (obj.perUnitFreighted === 'Y' ? true : false));
        $('#mainBookingFreightFreight, #mainBookingFreightQuatity').attr('disabled', true);
        $('input[name="actualArea"]').attr('disabled', 'disabled');
        $('input[name="actualVolume"]').attr('disabled', 'disabled');
        $('input[name="bookingBLNbr"]').attr('disabled', 'disabled');
        // disable Freight commission if party is forwarder
        $('#mainBookingFreightCommission').attr('disabled', 'disabled');
        nsBookDoc.updateRouteGridOnDiffRouteDetail("Y")
        setCommissionEnableDisable(obj);
    }
   function checkForZeroDim(obj){
    	if(obj.freightedWeight === '0'){
	    	obj.freightedLength = (obj.freightedLength === '0') ? '' : obj.freightedLength;
	    	obj.freightedWidth = (obj.freightedWidth === '0') ? '' : obj.freightedWidth;
	    	obj.freightedHeight = (obj.freightedHeight === '0') ? '' : obj.freightedHeight;
	    	obj.freightedWeight = (obj.freightedWeight === '0') ? '' : obj.freightedWeight;
	    	obj.freightedArea = (obj.freightedArea === '0') ? '' : obj.freightedArea;
	    	obj.freightedVolume = (obj.freightedVolume === '0') ? '' : obj.freightedVolume;
        }
	    if(obj.bookedWeight === '0'){
    		obj.bookedLength = (obj.bookedLength === '0') ? '' : obj.bookedLength;
        	obj.bookedWidth = (obj.bookedWidth === '0') ? '' : obj.bookedWidth;
        	obj.bookedHeight = (obj.bookedHeight === '0') ? '' : obj.bookedHeight;
        	obj.bookedWeight = (obj.bookedWeight === '0') ? '' : obj.bookedWeight;
        	obj.bookedArea = (obj.bookedArea === '0') ? '' : obj.bookedArea;
        	obj.bookedVolume = (obj.bookedVolume === '0') ? '' : obj.bookedVolume;
    	}
    }
    function setCommissionEnableDisable(obj) {
        if (obj.billOfLadingModel) {
            $('#hiddenBLStatus').val(obj.billOfLadingModel.bolStatus);
            $('#subBlStatus').val(obj.billOfLadingModel.bolStatus);
            if(!obj.billOfLadingModel.bolPartyList){
            	obj.billOfLadingModel.bolPartyList = [];
            }
            if (obj.billOfLadingModel.bolPartyList.length > 0) {

                $.each(obj.billOfLadingModel.bolPartyList, function(partyObjCou, partyObj) {
                    if (partyObj.partyType === '30') {
                        $('#mainBookingFreightCommission').removeAttr('disabled');
                    }
                });
            }
        }
    }

    function loadSubbookingContent(obj) {
    	nsBooking.subBookingObj = obj;
        nsBooking.isDiffFreight = false;
        $('#subBlStatus').val('');
        nsBooking.mainBookingFlag.changedOriginDest = false;
        $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
        $('select[name="bookingAllocStatus"]').removeAttr('disabled');
        enableSaveCancel();
        nsBooking.legChangedAction('E', 'N');
        setSubookingTreeView(obj);
        setBookingHeaderUI(obj);
        populateSubbookingContent(obj);
        $('.routeDetailsWrapper').show();
        populateRouteDetailGrid(obj, 'N');
        $('input[name="bookingBLNbr"]').val(obj.bolNumber);
        // loading freight content before loading charge content
        populateFreightDim(obj);
        // Loading Rate Basis
        setDropDrownForFreightCurr(obj);
        nsBookDoc.populateChargeGrid(obj);
        populateBookedDim(obj);
        $('#actualMeasureUnit').val(nsBookDoc.defaultMeasUnit);
        // UCBKG-117 - Start
        populateCargoConsAndThirdParty(obj);
        // To Initially Enable/Disable Appy Rate Button
        nsBooking.enabOrDisaRate($('#bookingCargoText')[0]);
        setBookingCreatedUI(obj);
        nsBooking.headerPanelEnable(true, []);
        nsBookDoc.dimensionTableUnits($('#mainBookingDimensionsGrid tbody tr'));
        var subbookingCargoStatus = "No";        
		if(obj.consignmentLegModelList){
			$.each(obj.consignmentLegModelList, function(j, obj1) {
				if(obj1.loaded === "Y" || obj1.received === "Y" || obj1.discharged ==='Y' ){
					subbookingCargoStatus = "yes";					
					return false;
				}							
			});
		}
    	if(obj.billOfLadingModel.bolStatus === "10" && obj.consignmentLegModelList[0].received === 'N'){
    		nsBooking.headerPanelEnable(false, ["mainBookDetailCustomerOrigin|attr",
    			"mainBookDetailCustomerOriginDesc|attr", "mainBookDetailCustomerDestination|attr", 
    			"mainBookDetailCustomerDestinationDesc|attr"]);
    		$('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClass, .mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
    		$('.mainBookingDetailsWrap #possVoyagesHide').hide();
    		$('.routeDetailsWrapper tbody td .legField').show();
    		nsBooking.legDetailsDisble();
		} else if(obj.billOfLadingModel.bolStatus === "10" && obj.consignmentLegModelList[0].received === 'Y'){
			nsBooking.headerPanelEnable(false, ["mainBookDetailCustomerDestination|attr", 
    			"mainBookDetailCustomerDestinationDesc|attr"]);
    			$('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClass, .mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
    			$('.mainBookingDetailsWrap #possVoyagesHide').hide();
    			$('.routeDetailsWrapper tbody td .legField').show();
    			
		}else {
			nsBooking.headerPanelEnable(false, []);
			$('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClass, .mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
			$('.mainBookingDetailsWrap #possVoyagesHide').hide();
			$('.routeDetailsWrapper tbody td .legField').hide();
    		$('.routeDetailsWrapper').find('input, select').attr('disabled', 'disabled');
		}
		
		if(subbookingCargoStatus === "yes"){
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').attr('disabled', 'disabled');   
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #possVoyages').hide();
    		$('.mainBookingDetailsWrap #possVoyagesHide').show();
		}
		else{
			$('.mainBookingDetailsWrap #possVoyages').show();
    		$('.mainBookingDetailsWrap #possVoyagesHide').hide();
		}
	}

    function populateFreightDim(obj) {
        if (obj.freightedMeasurementUnit === '10') {
            $('#freightedMeasureUnit').val('10');
        } else {
            $('#freightedMeasureUnit').val('20');
        }
        if (obj.perUnitFreighted === 'Y' || obj.perUnitFreighted === '') {
            $('#freightedUnit #shipInfovalidStatus').prop('checked', true);
        } else {
            $('#freightedUnit #shipInfoHistStatus').prop('checked', true);
        }
        nsBooking.setFreightedDimensions(obj);
    }

    function setDropDrownForFreightCurr(obj) {
        var freightChargeBasis = [],
            index = 0;
        freightChargeBasis = nsBooking.chargeBasisOptions.slice();
        index = freightChargeBasis.indexOf('PC,Per cent of freight');
        if (index !== -1) {
            freightChargeBasis.splice(index, 1);
        }
        $('#mainBookingFreightBasis').html(nsBookDoc.generateSelect(freightChargeBasis, obj.chargeBasis, true));
        if (obj.currencyCode === '') {
            $('#mainBookingFreightCurrency')
                .html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, nsBooking.defaultCurrencyCode, true));
        } else {
            $('#mainBookingFreightCurrency')
                .html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, obj.currencyCode, true));
        }
    }

    function setBookingCreatedUI(obj) {
    	var isEntitled= $('#isEligibleToEdit').val();
        if (obj.billOfLadingModel && nsBooking.textNullCheck(obj.billOfLadingModel.bolStatus) !== ''
            && obj.billOfLadingModel.bolStatus !== '10' && !(isEntitled ==='Y')) {
            nsBooking.legChangedAction('D', 'N');
            disableFieldForBL();
            $('#cargoListLink').removeAttr('disabled').unbind('click', false);
            $('#totalUnitsGrid th').removeClass('disableHandCursor');
            $('#cargoListLink').bind('click');
            $('.mainSubBookingFormWrap').find('#cargoListLink').removeAttr('disabled').removeClass('disabledBut');
        }
    }

    function enableFieldForBL() {
        $('input[name="bookingComments"]').removeAttr('disabled');
        $('input[name="bookingAllocStatus"]').removeAttr('disabled');
        $('select[name="cargoEquipmentNbr"]').removeAttr('disabled');
        $('input[name="voyageTransportationType"]').removeAttr('disabled');
        $('input[name="voyageCarrierRef"]').removeAttr('disabled');
        $('input[id="mainSubBookingFormSave"]').unbind('click', false).removeAttr('disabled');
        $('input[id="mainSubBookingFormCancel"]').unbind('click', false).removeAttr('disabled');
    }

    function disableFieldForBL() {
        $('#mainBookDetailCustomerOrigin,#mainBookDetailCustomerDestinationDesc').prop('disabled', true);
        $('#mainBookDetailCustomerOriginDesc,#mainBookDetailCustomerDestination').prop('disabled', true);
        $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
        $('.mainBookingDetailsWrap .showPreviousVoyageClass').hide();
        $('input[name="bookingComments"]').attr('disabled', 'disabled');
        $('input[name="bookingAllocStatus"]').attr('disabled', 'disabled');
        $('select[name="cargoEquipmentNbr"]').attr('disabled', 'disabled');
        $('select[name="voyageTransportationType"]').attr('disabled', 'disabled');
        $('input[name="voyageCarrierRef"]').attr('disabled', 'disabled');
        $('select[name="voyageCarrier"]').attr('disabled', 'disabled');
        $('#estimatedDeparture').attr('disabled', 'disabled');
        $('#estimatedArrival').attr('disabled', 'disabled');
        $('#shippedOnboard').attr('disabled', 'disabled');        
        $('input[id="mainSubBookingFormSave"]').bind('click', false).attr('disabled', 'disabled');
        $('input[id="mainSubBookingFormCancel"]').bind('click', false).attr('disabled', 'disabled');
        $('select[name="bookingAllocStatus"]').attr('disabled', 'disabled');
        $('input[name="cargoOnHold"]').attr('disabled', 'disabled');
        $('.wayCargo').attr('disabled', 'disabled'); //disable all legs waycargo, if the status is greater then 10 in Booking.
        $('.mainLeg').attr('disabled', 'disabled');
    }
    function enableComponent(comp) {
    	if(comp.split("|")[1] === "attr") {
			$('#'+comp.split("|")[0]).removeAttr('disabled');
		}else if(comp.split("|")[1] === "addClass"){
			$('#'+comp.split("|")[0]).removeClass('disabledLink');
		}else if(comp.split("|")[1] === "show"){
			$('#'+comp.split("|")[0]).show();
		}
    }
    function disableComponent(comp) {
    	if(comp.split("|")[1] === "attr") {
			$('#'+comp.split("|")[0]).attr('disabled', 'disabled');
		}else if(comp.split("|")[1] === "addClass"){
			$('#'+comp.split("|")[0]).addClass('disabledLink');
		}else if(comp.split("|")[1] === "show"){
			$('#'+comp.split("|")[0]).hide();
		}
    }
    function coreEnableDisableComp(compList, flag, exception){
    	for(var loop = 0; loop < compList.length; loop++){
    		if(flag && $.inArray( compList[loop].split("|")[0], exception )){
    			enableComponent(compList[loop]);
    		}else if(!flag && $.inArray( compList[loop].split("|")[0], exception )){
				disableComponent(compList[loop]);
			}
		}
    	for(loop = 0; loop < exception.length; loop++){
    		if(!flag){
    			enableComponent(exception[loop]);
    		}else{
				disableComponent(exception[loop]);
			}
		}
    }
    function headerPanelEnable(enable, exceptionList){
    	var componentList = ["mainBookDetailCustomerCode|attr", "mainBookDetailCustomerDesc|attr", "mainBookDetailCustomerOrigin|attr",
    					"mainBookDetailCustomerOriginDesc|attr", "mainBookDetailCustomerDestination|attr", 
    					"mainBookDetailCustomerDestinationDesc|attr", "mCustomerRef|attr", "mainContract|attr"];
    	coreEnableDisableComp(componentList, enable, exceptionList);
    }
    function disableFields(response) {
    	nsBooking.headerPanelEnable(true, []);
    	$('.mainBookingDetailsWrap #possVoyages').show();
    	$('.mainBookingDetailsWrap #possVoyagesHide').hide();
    	var blStatus = [];
    
    	if(response.subBookingModelList){
    		$.each(response.subBookingModelList, function(i, obj) {
      	 		 blStatus.push(obj.billOfLadingModel.bolStatus);
      	 	});
    	}
    	nsBooking.blStatus = blStatus;
    	//routeDetailEnable property get "N" when two subbookings with differnt orgin and destination.
    	if((blStatus.indexOf("20")!=-1 || blStatus.indexOf("30")!=-1 || blStatus.indexOf("31")!=-1 || blStatus.indexOf("40")!=-1
	 			|| blStatus.indexOf("50")!=-1 || blStatus.indexOf("51")!=-1 || blStatus.indexOf("99")!=-1 || blStatus.indexOf("21")!=-1)&& (blStatus.indexOf("10")==-1)){
	 		nsBooking.headerPanelEnable(false, []);
	 		$('.mainBookingDetailsWrap .getPossibleVoyages, .mainBookingDetailsWrap .showPreviousVoyageClass, .mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
	 		$('.routeDetailsWrapper').find('input, select').attr('disabled', 'disabled');
	 		$('.routeDetailsWrapper tbody td .legField').hide();
	 		$('#freshBookSaveBtn').attr('disabled', 'disabled');
	 	 } else {
	 		if(response.sameLPDP === "N"){
	 			 nsBooking.headerPanelEnable(false, ["mCustomerRef|attr", "mainContract|attr"]);
	 			$('.mainBookingDetailsWrap .getPossibleVoyages, .mainBookingDetailsWrap .showPreviousVoyageClass, .mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
	 		} else{
	 			nsBooking.headerPanelEnable(true, []);
	 			$('.mainBookingDetailsWrap .getPossibleVoyages, .mainBookingDetailsWrap .showPreviousVoyageClass, .mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
	 			$('#possVoyagesHide').hide();
	 		}
	 		//VMSAG-4123-27/07-Booking customer is editable
	 		if(response.routeDetailEnable==='N'){
	 		   $('#mainBookDetailCustomerCode').attr('disabled', 'disabled');
               $('#mainBookDetailCustomerDesc').attr('disabled', 'disabled');
	 		}
	 		/////
	 		$('#freshBookSaveBtn').removeAttr('disabled');
	 		$('.routeDetailsWrapper tbody td .legField').show();
	 		$('.routeDetailsWrapper').find('input, select').removeAttr('disabled');
	 		$('.routeDetailsWrapper').find('input[name="selectedRoute"]').attr('disabled', 'disabled');
	 		 nsBooking.allocStatusTypeEnable();
	 	}
    	if(blStatus.filter(function(x){return x === '10'}).length < 2) {
    		$('#moveUnitsLnk').hide();
    	} else {
    		$('#moveUnitsLnk').show();
    	}
   	 	
   	 	var bookingCargoStatus = "No", bookingCargoStatusDis = "No";
    	if(response.subBookingModelList){
    		$.each(response.subBookingModelList, function(i, obj) {
    			if(obj.consignmentLegModelList){
	    			$.each(obj.consignmentLegModelList, function(j, obj1) {
	    				if(obj1.loaded === "Y" || obj1.received === "Y" ){
	    					bookingCargoStatus = "yes";
	    				}
	    				if(obj1.discharged === "Y"){
	    					bookingCargoStatusDis = "yes";
	    					return false;
	    				}
	    			});
    			}
      	 	});
    	}
    	if(bookingCargoStatus === "yes"){
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').attr('disabled', 'disabled');
      		$('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #possVoyages').hide();
    		$('.mainBookingDetailsWrap #possVoyagesHide').show();
       	}
    	if(bookingCargoStatusDis === "yes"){
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').attr('disabled', 'disabled');
    		
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').attr('disabled', 'disabled');
    		
    		$('.mainBookingDetailsWrap #mainContract').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mCustomerRef').attr('disabled', 'disabled');
    		
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', 'disabled');
    		$('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', 'disabled');
    		
    		$('.mainBookingDetailsWrap #possVoyages').hide();
    		$('.mainBookingDetailsWrap #possVoyagesHide').show();
    	}
	}
    function getBlStatusClassName(BLStatus) {
        var className = '';

		switch(BLStatus){
			case '99':
				
			break;
			case '50':
				
				break;
			case '21':
				
				break;
			case '51':
				
				className = ' manifested ';
				break;
			case '40':
				
                className = ' issued ';
                break;
			case '20':
				
				break;
			case '30':
			
				break;
			case '31':
				className = ' made ';
				
				break;

			case '10':
				nsBooking.isBookingCreatedStatus = true;
				
				break;

			default:
				break;

		}

        return className;
    }
    
    function populateSubbookingTree(response, isBookingFormReset) {
        var isCargoLoadAndDisch = false,
            subBookingContent = '',
            route = 0;
            nsBooking.isBookingCreatedStatus = false;
        if (response.subBookingModelList) {
            $('.mainSubBookingCount').text(response.subBookingModelList.length);
            $.each(response.subBookingModelList, function(i, obj) {
                var canRemove = response.subBookingModelList[i].subBookingRemovable === 'Y'
					? 'rowRemoveIcon' : 'rowRemoveDisabledIcon',

                    BLStatus = obj.billOfLadingModel.bolStatus,
                    className = getBlStatusClassName(BLStatus),
                    cargoTextVal = 'New Sub Booking',
                    lengthNo = 0,
                    originalLen = 4,
                    k = 0,
                    appe = '',
                    subTitle = '';                
                if (BLStatus === '10'){//(BLStatus === '10'|| isEntitled==='Y') { Security Usecase-401 (response.isEligibleToEdit is always Y now) 
                    nsBooking.isBookingCreatedStatus = true;                   
                }                
                if (nsBooking.textNullCheck(obj.cargoText)) {
                    cargoTextVal = obj.cargoText;
                }
               lengthNo = originalLen - obj.subBookingNo.length;
                for (k = 0; k < lengthNo; k++) {
                    appe += '0';
                }
                subTitle = appe + obj.subBookingNo + '-' + obj.bookedUnits + '-' + cargoTextVal;
                subBookingContent += nsBookDoc.generateSingleSubBookingItem(
                        response.bookingId, obj.subBookingId, subTitle, canRemove, className, obj.timeStamp, obj.consignmentLegModelList[0].timeStamp, obj.consignmentLegModelList[0].consignmentLegId, obj.billOfLading?obj.billOfLading.bolHeader.bolStatus:"", (obj.billOfLading && obj.billOfLading.bolHeader.bolPrinted) ?"Yes":"No",response);
                
                nsBookDoc.consignLegList=[]
				if (response.routeDetailEnable === 'Y') {
                    if (route === 0) {
                        populateRouteDetailGrid(obj, 'Y');
                        $('.routeDetailsWrapper').show();
                        route++;
                    }
                } else {
                    $('.routeDetailsWrapper').hide();
                }
                nsBookDoc.updateRouteGridOnDiffRouteDetail(response.routeDetailEnable)               
            });
            
            //BL status check
            if(nsBooking.isBookingCreatedStatus){
            	$('#bookBLStatus').val('10');
            }
            else{
            	$('#bookBLStatus').val('');
            }
            
            $('#bookingHeaderId').val(response.bookingId);

            $('.mainBookingDetailsWrap .mainBookingDetailFormTitle').html('Booking: '
			+ '<span id="mainBookDetailTitleeVal">' + response.bookingNumber + '</span>');
           
            $('.mainSubBookingListWrap .mainBookingCount').text(response.subBookingModelList.length);

            $('.mainBookingDetailsWrap .mainMoveUnitsLnk').attr('data-bookingNum', response.bookingId);

            if (!isBookingFormReset) {
            	$(subBookingContent).insertAfter($('.scndLevel[data-filtering="'+response.bookingNumber+'"]'));
            }
            if (response.subBookingModelList.length > 1) {
                $('.mainMoveUnitsLnk').show();
            } else {
                $('.mainMoveUnitsLnk').hide();
            }
        }
        loadBlContent(nsBooking.isBookingCreatedStatus, response, isCargoLoadAndDisch);
        disableFields(response);
        $('#routeDetailGrid .selectedRoute:checked').trigger('change');
        nsBookDoc.diffOfficeValidation(nsBooking.isBookingCreatedStatus?'Booking Created':'');
    }

    function loadBlContent(isBookingCreatedStatus, response, isCargoLoadAndDisch) {
        nsBooking.isBookingCreatedStatus = isBookingCreatedStatus;
        if (nsBooking.isBookingCreatedStatus) {
            billOfladingObj = response;
            $('#billLadingDetailsForm').find('input,select,textarea').prop('disabled', false);
            $('#billLadingDetailsForm').find('input,select,textarea').not(':input[type=button]').val('');
            $('#billOrigin, #billDestination, #billLoadPort, #billFreightParticulars, #billStatusDesc')
                .prop('disabled', true);
            $('#billDischargePort, #billOceanVessel, #billIssuedDate, #blLastIssuedDate, #billMRNnbr').prop('disabled', true);
            $('.textAreaDetailsIcon, .rowRemoveIcon').removeClass('disabledLink');
            $('.editIcon,.billLadingDetailsDivWrapper a').removeClass('disabledLink');            
            $('#billLadingDetailsForm :input[value="Save"]').prop('readOnly', false);
            $('#viewPrintSettingsGrid input[type="checkbox"]').removeAttr('disabled');
            nsBooking.loadBillofLadingContent(response, response.bookingId);
        } else {
            nsBooking.loadBillofLadingContent(response, response.bookingId);
            
            $('#billLadingDetailsForm').find('input,select,textarea').prop('disabled', true);
            $('#billLadingDetailsForm :input[value="Save"]').prop('readOnly', true);
            $('.textAreaDetailsIcon, .rowRemoveIcon').addClass('disabledLink');            
            $('.editIcon,.billLadingDetailsDivWrapper a').addClass('disabledLink');
            $('span .icons_sprite, .rowRemoveIcon').removeClass('disabledLink');
            $('#viewPrintSettingsLink').removeClass('disabledLink');
            $('#viewPrintSettingsGrid input[type="checkbox"]').attr('disabled', 'disabled');
        }
        // To show all the booking data
        $('.mainBookingContentWrapper').show();
        disabledBookingContentForBL(nsBooking.isBookingCreatedStatus, isCargoLoadAndDisch);
    }
    $.extend(true, nsBooking, ComUtilityObj);
})(this.booking, jQuery, this.bookDoc, this.core);