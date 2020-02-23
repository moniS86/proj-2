/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, nsCore,nsBookDoc) {
    var singleSubBooking, bookingTableSearchObj = {};
    function isBlNotCreated() {
        return $('#billStatus').val() === '10';
    }
    function doAddCopyNewItem() {
        $('.mainBookingListWrap .subBookingNbrsCntnt .billVin.singleColItem').removeClass('ui-selecting activeSubBook');
        $('.mainBookingListWrap .subBookContentListCol').append('<div class="newBookLabel treeListLabel '
            + 'newCopyBooking ui-selecting activeSubBook">New Booking</div>');
        $('.mainBookingDetailsWrap .mainBookingDetailFormTitle').text('New Booking');
        $('.mainMoveUnitsLnk,#mainViewSummaryLink,.routeDetailsWrapper,.possibleVoyageWrap').hide();
        $('#mainAddSubBooking').attr('disabled', 'disabled');
        $('.defaultSearchMsg').hide();
    }
    function fetchSelectedItems() {
        if ($('.mainBookingListWrap .subBookContentListCol .singleColItem.activeSubBook').length === 0) {
            nsCore.showAlert('Please Select a Booking');
        }
    }
    function generateSingleBookingItem(bookingId, bookingNo) {
        return '<div class="billVin singleColItem" data-filtering="' + bookingNo + '" data-bookingid="' + bookingId
            + '"><a href="javascript:void(0)">' + bookingNo + '</a><div class="mainBookingItemIcons">'
            + '<span class="icons_sprite bookingInlineMenu roundDownArrowIcon fa fa-chevron-down"></span><span id="bookingRemoveIcon" '
            + 'name="bookingRemoveIcon" class="icons_sprite rowRemoveIcon bookingRemoveIcon fa fa-remove"></span></div></div>';
    }
   
    function generateSingleBookingItemForMenuItem(bookingId, bookingNo, bookingAllocStatus, custCode) {
    	var frstLvlId = 'frstLevel_' + $('.frstLevel').length + '_1',
    		scndLvlId = 'scndLevel_' + $('.frstLevel').length + '_0';
        if (bookingAllocStatus === 'Y') {
        	return '<div class="searchNavigation newSrchDiv"><div class="frstLevel" id="'+frstLvlId+'"><div class="custCodePanel">'+custCode +'</div><i class="fa fa-chevron-down chevronArrow"></i><div class="clearAll"></div></div>'
        	            	+ '<div class="scndLevel billVin singleColItem activeSubBook menuItemTableForFirmBooking" data-filtering="' + bookingNo
        	                + '" data-bookingid="' + bookingId + '" id="'+scndLvlId+'" data-deletable="Yes" style="display: block;"><a href="javascript:void(0)"> <i class="fa fa-plus expandBooking"></i>' + bookingNo
        	                + '</a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu '
        	                + 'roundDownArrowIcon fa fa-caret-down dropMenuIcon fa-chevron-down"></div></div></div>';
        } else {
        	return '<div class="searchNavigation newSrchDiv"><div class="frstLevel" id="'+frstLvlId+'"><div class="custCodePanel">'+custCode +'</div><i class="fa fa-chevron-down chevronArrow"></i><div class="clearAll"></div></div>'
        	            	+ '<div class="scndLevel billVin singleColItem activeSubBook menuItemTableForReserveBooking" data-filtering="' + bookingNo
        	                + '" data-bookingid="' + bookingId + '" id="'+scndLvlId+'" data-deletable="Yes" style="display: block;"><a href="javascript:void(0)"> <i class="fa fa-plus expandBooking"></i>' + bookingNo
        	                + '</a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu '
        	                + 'roundDownArrowIcon fa fa-caret-down dropMenuIcon fa-chevron-down"></div></div></div>';
        }
    }
    function clearNewBook() {
        nsBooking.isDiffFreight = false;
        nsBooking.cargoPopulateText = '';
        nsBooking.enableBookingSaveCancel();
        $('#createFreshBook')[0].reset();
        $('#mainBookDetailCustomerCode').removeAttr('disabled');
        $('#mainBookDetailCustomerDesc').removeAttr('disabled');
        nsBooking.mainBookingFlag.changedOriginDest = false;
        $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
        $('#mainBookDetailCustomerOrigin').removeAttr('disabled');
        $('#mainBookDetailCustomerOriginDesc').removeAttr('disabled');
        $('#mainBookDetailCustomerDestination').removeAttr('disabled');
        $('#mainBookDetailCustomerDestinationDesc').removeAttr('disabled');
        $('#mCustomerRef').removeAttr('disabled');
        $('#mainContract').removeAttr('disabled');
        $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClass, '
            + '.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
        $('#possVoyagesHide').hide();
        $('.mainBookingListWrap .subBookContentListCol .newBookLabel.treeListLabel').remove();
    }
    function clearNewSubBook() {
        var chargeRecord = $('#subBookingChargesGrid tbody tr').first().clone();
        nsBooking.isDiffFreight = false;
        nsBooking.enableSaveCancel();
        nsBooking.cargoPopulateText = '';
        nsBooking.mainBookingFlag.changedOriginDest = false;
        $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
        $('#mainSubBookingForm')[0].reset();
        $('#subBookingChargesGrid').find('tbody').empty();
        chargeRecord.find('input,select').val('');
        chargeRecord.find('.formInputWrap').show();
        chargeRecord.find('.rowRemoveIcon').removeClass('hide');
        $('#subBookingChargesGrid').append(chargeRecord);
        $('#mainBookingFreightBasis').html(nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
        $('#mainBookingFreightCurrency').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
        $('.chargeType').html(nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true));
        $('.chargeBasis').html(nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
        $('.chargeCurrency').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
        $('.chargeType').val('');
        $('.chargeBasis').val('');
        $('.mainSubBookingListWrap .subBookContentListCol .newBookLabel.treeListLabel').remove();
    }
    function adjustWrappers(thisEle) {
        $(thisEle).toggle('slide', 'left');
        $(thisEle).toggleClass('activeMenu');
        if ($(thisEle).hasClass('activeMenu')) {
            $('.bookingGridContentWrapper').addClass('compressedState').removeClass('expandState');
            $('.subBookListColWrap').hide()
        } else {
            $('.bookingGridContentWrapper').addClass('expandState').removeClass('compressedState');
            $('.subBookListColWrap').show()
        }
    }
   
    
    // Generate Group By Content
    function generateViewAllTreeList(bookingData, filterType) {
        var html = '', key = 0, i = 0, keyMap = {}, count = 0;
        for (i in bookingData) {
        	if (bookingData[i].isValid) {
        		count++;
                keyMap = generateViewAllTreeListHelper(i, bookingData, filterType, keyMap);
        	}
        }

        for (key in keyMap) {
            if (keyMap.hasOwnProperty(key)) {
                html += '<div class="filterTypeLabel treeListLabel">' + key + '</div>' + keyMap[key];
            }
        }
        dumpMainBookingData(html, count);
    }
    function generateViewAllTreeListHelper(i, bookingData, filterType, keyMap){
        var f = 0, filterName, newInnerContent;
        singleSubBooking = bookingData[i];
        filterName = singleSubBooking[filterType];
        if (filterName) {
            if (typeof filterName === 'object') {
                for(f in filterName){
                    keyMap = createBookingTree(f, filterName, keyMap);
                }
            } else {
                newInnerContent = keyMap[filterName];
                newInnerContent = newInnerContent || '';
                newInnerContent += generateSingleBookingItem(singleSubBooking.bookingId,
                    singleSubBooking.bookingNumber);
                keyMap[filterName] = newInnerContent;
            }
        }
        return keyMap;
    }
    function createBookingTree(index, filterName, keyMap) {
        var newInnerPartContent = keyMap[filterName[index]];
        if (!newInnerPartContent) {
            newInnerPartContent = '';
        }
        newInnerPartContent += generateSingleBookingItem(singleSubBooking.bookingId, singleSubBooking.bookingNumber);
        keyMap[filterName[index]] = newInnerPartContent;
        return keyMap;
    }
    // Filteration logic
    function filterData(bookingData, filterDataObj) {
        var i;
        for (i in bookingData) {
        	if(!bookingData[i].vesselSet){
                bookingData[i].vesselSet = ['No Voyage'];
            }
            if (bookingData.hasOwnProperty(i)) {
                filterDataHelper(i, bookingData, filterDataObj);
            }
        }
        return bookingData;
    }

    function filterDataHelper(i, bookingData, filterDataObj){
        var filterKey=0, filterVal, viewAllChk = $('.filterMenuContentWrapper').find('input[type="checkbox"]:checked'),
        	filterValChkAll = viewAllChk.closest('.filterItemContent').attr('data-filtertype');
        bookingData[i].isValid = true;
        bookingData[i].isValidViewAll = '';
        bookingData[i].isValidIndvFil = '';
        if(viewAllChk.length > 0 &&  bookingData[i][filterValChkAll] === null){
        	bookingData[i].isValid = false;
        	bookingData[i].isValidViewAll = 'invalid';
        }
        for (filterKey in filterDataObj) {
            if (filterDataObj.hasOwnProperty(filterKey)) {
                filterVal = filterDataObj[filterKey];
                if (filterVal.length > 0 && checkEquality(bookingData[i][filterKey], filterVal)) {
                    bookingData[i].isValid = false;
                    bookingData[i].isValidIndvFil = 'invalid';
                }
            }
        }
    }
    // To Dump html data in the View
    function dumpMainBookingData(htmlData, count) {
        $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt').html(htmlData);
        $('.bookingListHeading .mainBookingCount').html(count);
    }

    function checkEquality(data, value) {
        if (typeof data === 'string') {
            return value !== data;
        } else if (data === null) {
            return true;
        } else {
            return !(data.indexOf(value) > -1);
        }
    }
    function positionToolTip(currentEle, myWrap, atWrap, collisionWrap, arrowMy, arrowAt, arrowCollision) {
        var currentElem = $(currentEle),
            ele = $('.toolTipWrapper');
        $(ele).position({
            my : myWrap,
            at : atWrap,
            collision : collisionWrap,
            of : $(currentElem)
        });
        $('.leftArrowIcon').position({
            my : arrowMy,
            at : arrowAt,
            collision : arrowCollision,
            of : $(currentEle)
        });
    }
    // function for getting unique values in filter condition
    function getUniqueBookingNo(bookingNoArray) {
        var uniqueBookArray = [], i= 0,
            uniqueBookNoArray = [];
        for (i = 0; i < bookingNoArray.length; i++) {
            if ((jQuery.inArray(bookingNoArray[i].bookNo, uniqueBookNoArray)) === -1) {
                uniqueBookNoArray.push(bookingNoArray[i].bookNo);
                uniqueBookArray.push(bookingNoArray[i]);
            }
        }
        return uniqueBookArray;
    }
    function copyToFreighted() {
        var length = $('input[name$="actualLength"]').val(),
            width = $('input[name$="actualWidth"]').val(),
            height = $('input[name$="actualHeigth"]').val(),
            weight = $('input[name$="actualWeight"]').val(),
            area = $('input[name$="actualArea"]').val(),
            volume = $('input[name$="actualVolume"]').val();
        nsBooking.isCopiedToFreighted = 'Y';
        $('input[name$="freightedLength"]').val(length);
        $('input[name$="freightedWidth"]').val(width);
        $('input[name$="freightedHeigth"]').val(height);
        $('input[name$="freightedWeight"]').val(weight);
        $('input[name$="freightedArea"]').val(area);
        $('input[name$="freightedVolume"]').val(volume);
        $('#freightedMeasureUnit').val($('#actualMeasureUnit').val());
        $('#freightedUnit').find('#shipInfovalidStatus').prop('checked', true);
        nsBooking.calculateFreightTotal();
        nsBooking.updateChargeOnDimChange();
        nsBookDoc.dimensionTableUnits($('#mainBookingDimensionsGrid tbody tr'));
    }
    function canBookingSaved() {
        return !$('#bookingHeaderId').val() || !$.trim($('#bookingHeaderId').val());
    }
    function fnValidateAutoComplete(resData) {
        $('#billLadingDetailsForm').find('input[value="Save"]').click(function() {
            var blnOfficeCode = false,
                docOffice = $('#billDocumentationOffice').val(),
                docOfficeDesc = $('#billDocumentationOfficeDesc').val(),
                errMsgDoc = '';
            if (nsBooking.globalBookingFlag.mainBookingFlag && (nsBooking.globalBookingFlag.mainBookingHeaderFlag)) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                return false;
            }
            if (docOffice.length !== 0 && docOfficeDesc.length !== 0) {
                $.each(resData, function(key) {
                    if (docOffice === resData[key].companyCode && docOfficeDesc === resData[key].name) {
                        blnOfficeCode = true;
                        return true;
                    }
                });
            }
            if (!$('#billDocumentationOffice').attr('disabled') && !blnOfficeCode) {
                errMsgDoc = '\n Documentation Office is not Valid';
            }
            nsBooking.updateBillofLading(errMsgDoc);
        });
    }
    function setBookedDimensions(obj) {
        var perUnit = obj.perUnitBooked;
        if (perUnit === 'Y' || perUnit === '') {
            if ((obj.bookedLength) || (obj.bookedWidth) || (obj.bookedHeight)) {
                $('input[name="bookedArea"]').attr('disabled', 'disabled');
                $('input[name="bookedVolume"]').attr('disabled', 'disabled');
                $('input[name="bookedLength"]').removeAttr('disabled');
                $('input[name="bookedWidth"]').removeAttr('disabled');
                $('input[name="bookedHeigth"]').removeAttr('disabled');
            } else if ((obj.bookedArea) || (obj.bookedVolume)) {
                $('input[name="bookedLength"]').attr('disabled', 'disabled');
                $('input[name="bookedWidth"]').attr('disabled', 'disabled');
                $('input[name="bookedHeigth"]').attr('disabled', 'disabled');
                $('input[name="bookedArea"]').removeAttr('disabled');
                $('input[name="bookedVolume"]').removeAttr('disabled');
            } else {
                $('input[name="bookedLength"]').removeAttr('disabled');
                $('input[name="bookedWidth"]').removeAttr('disabled');
                $('input[name="bookedHeigth"]').removeAttr('disabled');
                $('input[name="bookedArea"]').removeAttr('disabled');
                $('input[name="bookedVolume"]').removeAttr('disabled');
            }
        } else {
            if (perUnit === 'N') {
                $('input[name="bookedLength"]').attr('disabled', 'disabled');
                $('input[name="bookedWidth"]').attr('disabled', 'disabled');
                $('input[name="bookedHeigth"]').attr('disabled', 'disabled');
                // removing disabled attributes
                $('input[name="bookedArea"]').removeAttr('disabled');
                $('input[name="bookedVolume"]').removeAttr('disabled');
            }
        }
    }
    function setFreightedDimensions(obj) {
        var perUnit = obj.perUnitFreighted;
        if (perUnit === 'Y' || !perUnit) {
            if ((obj.bookedLength) || (obj.bookedWidth) || (obj.bookedHeight)) {
                $('input[name="freightedArea"]').attr('disabled', 'disabled');
                $('input[name="freightedVolume"]').attr('disabled', 'disabled');
                $('input[name="freightedLength"]').removeAttr('disabled');
                $('input[name="freightedWidth"]').removeAttr('disabled');
                $('input[name="freightedHeigth"]').removeAttr('disabled');
            } else if ((obj.bookedArea) || (obj.bookedVolume)) {
                $('input[name="freightedLength"]').attr('disabled', 'disabled');
                $('input[name="freightedWidth"]').attr('disabled', 'disabled');
                $('input[name="freightedHeigth"]').attr('disabled', 'disabled');
                $('input[name="freightedArea"]').removeAttr('disabled');
                $('input[name="freightedVolume"]').removeAttr('disabled');
            } else {
                $('input[name="freightedLength"]').removeAttr('disabled');
                $('input[name="freightedWidth"]').removeAttr('disabled');
                $('input[name="freightedHeigth"]').removeAttr('disabled');
                $('input[name="freightedArea"]').removeAttr('disabled');
                $('input[name="freightedVolume"]').removeAttr('disabled');
            }
        } else {
            if (perUnit === 'N') {
                $('input[name="freightedLength"]').attr('disabled', 'disabled');
                $('input[name="freightedWidth"]').attr('disabled', 'disabled');
                $('input[name="freightedHeigth"]').attr('disabled', 'disabled');
                // removing disabled attributes
                $('input[name="freightedArea"]').removeAttr('disabled');
                $('input[name="freightedVolume"]').removeAttr('disabled');
            }
        }
    }
    function convertLength(value, dimensionType) {
        var result;
        if (dimensionType === 20 || !value || value === '0') {
            result = value;
        } else {
            result = Math.round(parseFloat(value) * nsBookDoc.convLengthVal);
        }
        return result;
    }
    function convertWeight(value, dimensionType) {
        var result;
        if (dimensionType === 20 || !value || value === '0') {
            result = value;
        } else {
            result = Math.round(parseFloat(value) * 2.2046);
        }
        return result;
    }
    function convertVol(value, dimensionType) {
        var result;
        if (dimensionType === 20 || !value || value === '0') {
            result = value;
        } else {
            result = Math.round(parseFloat(value) * 10.764);
        }
        return result;
    }
    function canBookingDateBeEmpty(bookingNo, bookingNoQuery, vessel, voyage, bolNo, BLNoQuery, vinNo, VinNoQuery) {
        var temp = (bookingNo && bookingNoQuery === 'Need Exact match') || (vessel && voyage)
            || (bolNo && BLNoQuery === 'Need Exact match') || (vinNo && VinNoQuery === 'Need Exact match');
        return temp;
    }
    function setCSSForFilterAction() {
        if ($('.searchedForWrap').height() > 37 && $('.searchedForWrap').height() <= 64) {
            $('.filterActionLink').css('top', '71px');
        } else if ($('.searchedForWrap').height() > 64) {
            $('.filterActionLink').css('top', '103px');
        } else {
            $('.filterActionLink').css('top', '44px');
        }
    }
    function getBookings(bookings) {
        if (bookings === 'Firm') {
            bookings = 'Y';
        } else {
            if (bookings === 'Reserve') {
                bookings = 'N';
            }
        }
        return bookings;
    }
    function checkBookingFromDateFormat(fromDate) {
        var result = true, regEx,
            dFormat = localStorage.getItem('dateFormat');
        if (dFormat === 'dd.mm.yy' || dFormat === 'mm.dd.yy') {
            regEx = /^\d{2}\.\d{2}\.\d{4}$/;
        } else if (dFormat === 'dd-mm-yy' || dFormat === 'mm-dd-yy') {
            regEx = /^\d{2}\-\d{2}\-\d{4}$/;
        } else if (dFormat === 'yy.mm.dd') {
            regEx = /^\d{4}\.\d{2}\.\d{2}$/;
        } else {
            if (dFormat === 'dd-M-yy') {
                regEx = /^\d{2}-[a-zA-Z]{3}-\d{4}$/;
            }
        }
        if (fromDate !== '' && !fromDate.match(regEx)) {
            nsCore.showAlert('Invalid date format! Please enter a date in ' + nsCore.dateFormat + ' format');
            result = false;
        }
        return result;
    }
    $(document).ready(function() {
        var dateInput = new Date(new Date().setDate(new Date().getDate() - 90)),
            dateText = (dateInput.getDate().toString() + '.' + (parseInt(dateInput.getMonth(), 10) + 1) + '.'
            + dateInput.getFullYear().toString()).split('.'), data;
        nsCore.menuSelect('menuBook');
        $('.newSearch, .viewBooking').toggle();
        adjustWrappers($('.leftSearchMenuContent'));
       
        $('.newSearch').click(function() {
            adjustWrappers($('.leftSearchMenuContent'));
            if ($('.leftSearchMenuContent').hasClass('activeMenu')) {
                $('.filterActionLink,.leftFilterMenuWrapper').hide();
                $('.mainBookingListWrap .SubBookingNbrsHdr').css('padding-left', '0px');
                $('.leftFilterMenuWrapper').removeClass('activeMenu');
                $('.mainBookingListWrap .SubBookingNbrsHdr').hide();
                $('.searchRes').show();
                $('.searchGroupBy').attr('disabled', false)
            } else {
                $('.mainBookingListWrap .SubBookingNbrsHdr').css('padding-left', '24px');
                $('.mainBookingListWrap .SubBookingNbrsHdr').show()
                 if($('.frstLevel_dummy').length!==0) {
                   $('.searchGroupBy').attr('disabled', true)
                   $('.searchGroupBy').val('customerSet')
                }
            }
            $('.viewBooking,.newSearch').toggle();
        });
        $('.expandSearchHeader').click(function() {
            $('.expandSearchToggle').show();
            $('.searchListItems').addClass('expandSearchListItems');
            $('.expandSearchHeader').hide();
            $('.basicSearchHeader').show();
            return false;
        });
        $('.basicSearchHeader').click(function() {
            $('.expandSearchToggle').hide();
            $('.searchListItems').removeClass('expandSearchListItems');
            $('.basicSearchHeader').hide();
            $('.expandSearchHeader').show();
            return false;
        });
        if (dateText[0].length === 1) {
            dateText[0] = '0' + dateText[0];
        }
        if (dateText[1].length === 1) {
            dateText[1] = '0' + dateText[1];
        }
        $('.datePickerInp').datepicker({
            dateFormat : nsCore.dateFormat,
            changeYear:true
        }).datepicker('setDate', new Date(new Date().setDate(new Date().getDate() - 90)));
        $(document).on('click', '.datePickerIcon', function() {
            $(this).closest('.datePickerInpWrap').find('.datePickerInp').focus();
        });
        $('.resetSearch').click(function() {
            $('#leftSearchMenu').find('.searchMenuItemWrap').find('input[type="text"]').val('');
            $('#voyage.voyageTextVal.searchInput').attr('disabled', true)
            $('.datePickerInp').datepicker({ dateFormat : nsCore.dateFormat,
                changeYear:true
            }).datepicker('setDate', new Date(new Date().setDate(new Date().getDate() - 90)));
            $('#manifestStatusNull').prop('checked', true);
            $('#leftSearchMenu select').each(function() {
                this.selectedIndex = 0;
            });
            $('#leftSearchMenu .matchOptionsItem select').each(function() {
                this.selectedIndex = 3;
            });
            if($('.searchNavigation').length !== 0 && !$('.searchNavigation').hasClass('newSrchDiv')){
            	$('.searchNavigation').addClass('prevSrchDiv')
            }
        });

        $(document).on('click', '.singleFilterContentWrap .filterItemHeader', function() {
            $(this).find('.smallBottomArrowIcon').toggle();
            $(this).closest('.singleFilterContentWrap').find('.filterItemContent').slideToggle();
        });

        $('.subBookContentListCol').on('click', '.singleColItem .rowRemoveDisabledIcon', function(event) {
            event.stopImmediatePropagation();
        });
        // Main Booking Details Form collapse
        $('#collapseMainBookDetails').click(function() {
            $('#mainBoookDetailsFormContent').slideToggle(function() {
                nsCore.loadUI('booking');
            });
        });
        // Searched Item Remove Event
        $('.searchedForWrap').on('click', '.searchedItem .smallRemoveIcon', function() {
            var searchItem = $(this).closest('.searchedItem'),
                searchKey = searchItem.attr('data-searchkey'),
                vesVoySearchKey = 'Voy',
                vBooking = $('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + searchKey + '"]')
                    .find('#bookings').val();
            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                return false;
            }
            if (searchKey === 'Bookings' && vBooking === 'Valid') {
                nsCore.showAlert('Removing All valid bookings is not possible as this is a mandatory criteria');
                return false;
            } else if(searchKey === ' VSL' && ($(searchItem.parent().find('.searchedItem ')[1]).attr('data-searchkey') === 'Voy')){
            	$(searchItem.parent().find('.searchedItem ')[1]).closest('.searchedItem').remove();
            	$(searchItem).remove();
            	$('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + searchKey + '"]')
                .find('input[type="text"]').val('');
            	$('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + searchKey + '"]')
                .find('select').prop('selectedIndex', 0);
            	$('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + vesVoySearchKey + '"]')
                .find('input[type="text"]').val('');
            	$('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + vesVoySearchKey + '"]')
                .find('select').prop('selectedIndex', 0);
            	$('#leftSearchMenu').submit();
            } else {
                $(searchItem).remove();
                if (searchKey === 'Manifest status') {
                    $('#manifestStatusNull').prop('checked', true);
                }
                $('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + searchKey + '"]')
                    .find('input[type="text"]').val('');
                $('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + searchKey + '"]')
                    .find('select').prop('selectedIndex', 0);
                $('#leftSearchMenu').submit();
            }
        });
        // Filter Action Click Event
        $('.filterActionLink').click(function(e) {
            if (!nsBooking.globalBookingFlag.mainBookingFlag) {
                e.stopPropagation();
                adjustWrappers($('.leftFilterMenuWrapper'));
                $(this).hide();
                $('.mainBookingListWrap .SubBookingNbrsHdr').css('padding-left', '0px');
            }
        });
        // CLose Filter Menu
        $('#closeFilterResults').click(function() {
            adjustWrappers($('.leftFilterMenuWrapper'));
            $('.mainBookingListWrap .SubBookingNbrsHdr').css('padding-left', '24px');
        });
        $('#closeSearchMenu').click(function() {
            $('.viewBooking,.newSearch').toggle();
            adjustWrappers($('.leftSearchMenuContent'));
            $('.mainBookingListWrap .SubBookingNbrsHdr').css('padding-left', '24px');
        });
        $('#billLadingCommentGrid tbody').sortable({});
        $('#bookedUnit').find('input:radio[name="bookedUnit"]').change(function() {
            if ($(this).is(':checked')) {
                nsBooking.isDiffFreight = false;
                setBookedDimensions($(this).val());
            }
        });
        $('#freightedUnit').find('input:radio[name="status"]').change(function() {
        // override
        });
        if (nsCore.getQueryVariable('from') === 'makeBL' && sessionStorage.getItem('searchParams')) {
            data = JSON.parse(sessionStorage.getItem('searchParams'));
            $('#vesselCode').val(data.vesselCode);
            $('#vesselName').val(data.vesselName);
            $('#custName').val(data.customerName);
            $('#voyage').val(data.voyage);
            $('#custCode').val(data.customerCode);
            $('#loadPort').val(data.loadPort);
            $('#loadDesc').val(data.loadPortName);
            $('#discPort').val(data.discPort);
            $('#discDesc').val(data.dischargePortName);
            $('#originPort').val(data.originPort);
            $('#originDesc').val(data.originName);
            $('#destPort').val(data.destPort);
            $('#destDesc').val(data.destinationName);
            $('#bookingNumber').val(data.bookingNumber);
            $('#bookingNoSearch').val(data.bookingNoSearch);
            $('#vinSearch').val(data.vinSearch);
            $('#blSearch').val(data.blSearch);
            $('#vinNumber').val(data.vinNumber);
            $('#blNumber').val(data.blNumber);
            $('#cargoStatus').val(data.cargoStatus);
            $('#cargoType').val(data.cargoType);
            $('#tradeCode').val(data.tradeCode);
            $('#blStatus').val(data.BLStatus);
            $('#bookings').val(data.bookings);
            $('#forwarderCode').val(data.forwarderCode);
            $('#forwarderName').val(data.forwarderDesc);
            $('#bookinggFrom').val(data.bookingDate);
            
            if($('#vesselCode').val()&&$('#vesselName').val()){
            	  $('#voyage').prop('disabled', false);
            }
            else{
            	 $('#voyage').prop('disabled', true);
            }
        }
    });

    bookingTableSearchObj = {
        'isBlNotCreated' : isBlNotCreated,
        'doAddCopyNewItem' : doAddCopyNewItem,
        'fetchSelectedItems' : fetchSelectedItems,
        'generateSingleBookingItem' : generateSingleBookingItem,
        'generateSingleBookingItemForMenuItem' : generateSingleBookingItemForMenuItem,
        'clearNewBook' : clearNewBook,
        'clearNewSubBook' : clearNewSubBook,
        'adjustWrappers' : adjustWrappers,
        'generateViewAllTreeList' : generateViewAllTreeList,
        'generateViewAllTreeListHelper' : generateViewAllTreeListHelper,
        'createBookingTree' : createBookingTree,
        'filterData' : filterData,
        'dumpMainBookingData' : dumpMainBookingData,
        'checkEquality' : checkEquality,
        'positionToolTip' : positionToolTip,
        'getUniqueBookingNo' : getUniqueBookingNo,
        'copyToFreighted' : copyToFreighted,
        'canBookingSaved' : canBookingSaved,
        'fnValidateAutoComplete' : fnValidateAutoComplete,
        'setBookedDimensions' : setBookedDimensions,
        'setFreightedDimensions' : setFreightedDimensions,
        'convertLength' : convertLength,
        'convertWeight' : convertWeight,
        'convertVol' : convertVol,
        'canBookingDateBeEmpty' : canBookingDateBeEmpty,
        'setCSSForFilterAction' : setCSSForFilterAction,
        'getBookings' : getBookings,
        'checkBookingFromDateFormat' : checkBookingFromDateFormat
    };
    $.extend(true, nsBooking, bookingTableSearchObj);
})(this.booking, jQuery, this.core, this.bookDoc);