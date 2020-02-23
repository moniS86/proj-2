/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var bookingData = '',
        filterObj = {};
    nsBooking.fectSubBookingObj = {};
    function initalStr(label, value, padding, icon) {
        return '<div data-searchKey="' + label +
            '" class="searchedItem '+ padding +'">'+lastStr(icon)+'<span class="searchedItemKey">' + label +
            '</span><span> = </span><span class="searchedItemValue">' + value + '</span>';
    }

    function lastStr(icon) {
    	if(icon === 'circle') {
    		return '<span class="icons_sprite smallDotIcon fa fa-'+ icon +'"></span>';
    	} else{
    		return '<span class="icons_sprite smallRemoveIcon fa fa-'+ icon +'"></span>';
    	}
    }

    function changeBookListHead(isChecked, bookData, filterType, filterObject, currEle) {
    	var i, bookingsListContent = '', count = 0;
        if (isChecked) {
            $('.singleFilterContentWrap').find('.bookingListHeading input[type="checkbox"]').prop('disabled', true);
            currEle.prop('disabled', false);
            $(this).closest('.bookingListHeading input[type="checkbox"]').prop('disabled', false);
            bookData = nsBooking.filterData(bookData, filterObject);
            $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt')
                .text(nsBooking.generateViewAllTreeList(bookData, filterType, true));
        } else {
        	for(i in bookData){
        		if(bookData[i].isValidViewAll === 'invalid'){
        			bookData[i].isValidViewAll = '';
        			if(bookData[i].isValidIndvFil !== 'invalid'){
        				bookData[i].isValid = true;
        			}
        		}
        	}
        	$.each(bookData, function(j, obj) {
                if (obj.isValid) {
                    count++;
                    bookingsListContent += nsBooking.generateSingleBookingItem(obj.bookingId, obj.bookingNumber);
                }
            });
            nsBooking.dumpMainBookingData(bookingsListContent, count);
            $.each($('.filterItemContent'), function(j, obj) {
                if (!$(obj).find('.singleFilterItemsWrap .filterItem.activeFilterItem').length > 0) {
                    $(obj).find('.bookingListHeading input[type="checkbox"]').prop('disabled', false);
                }
            });            
        }
        return bookData;
    }

    
    
    

    function setFilterType(ifViewAllExists, filterType, bookingDataFil) {
    	var bookingsListContent = '', count = 0;
        if (ifViewAllExists) {
            filterType = $('.filterMenuContentWrapper')
            .find('input[type="checkbox"]:checked').closest('.filterItemContent').attr('data-filterType');
            nsBooking.generateViewAllTreeList(bookingDataFil, filterType, false);
        } else {
            filterType = $(this).closest('.filterItemContent').attr('data-filterType');
            $.each(bookingDataFil, function(i, obj) {
                if (obj.isValid) {
                    count++;
                    bookingsListContent += nsBooking.generateSingleBookingItem(obj.bookingId, obj.bookingNumber);
                }
            });
            nsBooking.dumpMainBookingData(bookingsListContent, count);
        }
    }

    function bookingTreeUI(bookDataTree, filterContent) {
    	var i = 0;
        nsBooking.bookingDataTree = bookDataTree;
        for(i in nsBooking.bookingDataTree.responseData.searchCriteriaResultsList){
        	if(!nsBooking.bookingDataTree.responseData.searchCriteriaResultsList[i].vesselSet){
        		nsBooking.bookingDataTree.responseData.filterDataList[1].filterValueList.push('No Voyage');
        		break;
        	}
        }
        $.each(nsBooking.bookingDataTree.responseData.filterDataList, function(int, obj) {
            filterContent += '<div class="singleFilterContentWrap">';
            filterContent += '<h3 class="filterItemHeader">' + obj.filterName
                        +'<span class="icons_sprite smallBottomArrowIcon"></span></h3>';

            filterContent += '<div  data-filterType="'
                        + obj.filterType + '" class="filterItemContent"><div class="bookingListHeading">'
                        +'<input type="checkbox" value="allItems"><span>View All</span></div>';

            filterContent += '<ul class="singleFilterItemsWrap">';
            obj.filterValueList.sort(function(a, b) {
                var filterVal1 = a.toUpperCase(),
                	filterVal2 = b.toUpperCase();
                return (filterVal1 < filterVal2) ? -1 : (filterVal1 > filterVal2) ? 1 : 0;
            });
            $.each(obj.filterValueList, function(filterL, val) {
                var filterValue = val.replace(/'/g, '&#34;');
                filterValue = filterValue.replace(/'/g, '&#39;');
                filterContent += '<li data-filterVal="' + filterValue + '" class="filterItem">' + val + '</li>';
            });
            filterContent += '</ul></div></div>';
        });
        return filterContent;
    }

    function fnAjax(searchCriteriaData, e) {
        vmsService.vmsApiServiceLoad(function(response) {
            var filterContent = '', bookCount = 0, scndLvlId = '', scndLvlInd = '';
            if (response.responseData) {
            	nsCore.appModel.searchByCriteria=response;
            	bookCount = response.responseData.searchCriteriaResultsList ? response.responseData.searchCriteriaResultsList.length : 0;
            	$('.searchErrorMsg, .searchRes').hide(); 
                $('.mainBookingCount').text(bookCount);
                if (response.responseData.bookCountValid === 'N') {
                    nsCore.showAlert('Search result is with more than 1500 records.'
                        +' Please search again with modified search criteria.');
                    return;
                }
               nsBooking.bookingDataTree = response;
               bookingData = response.responseData.searchCriteriaResultsList;
                if (e.originalEvent) {
                   $('.newSearch').trigger('click');
               }
                $('.mainBookingListWrap .subBookingNbrsHdr').show();
                if (!bookingData || bookingData.length === 0) {
                    $('.searchErrorMsg').css('display', 'block');
                    $('.mainBookingListWrap .SubBookingNbrsHdr').hide();
                    $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt').text('');
                    $('.mainBookingCount').text('0');
                    $('.searchGroupBy').attr('disabled', true);
                    return false;
                }
                nsBookDoc.loadMainBookingTree(nsBooking.bookingDataTree.responseData);
                $('.bookingListHeading .mainBookingCount, .searchRes .mainBookingCount').html(bookCount);
                // Reset Filters
                $('.resetFilter').click(function() {
                    $('.filterItemContent').find('.bookingListHeading input[type="checkbox"]')
					.prop('disabled', false).prop('checked', false);

                    $('.filterItemContent').find('.filterItem').removeClass('activeFilterItem');
                    bookingData = JSON.parse(JSON.stringify(nsBooking.bookingDataTree.responseData.searchCriteriaResultsList));
                    nsBookDoc.loadMainBookingTree(nsBooking.bookingDataTree.responseData);
                    nsBooking.newBookFlag ? $('.mainBookingListWrap .subBookContentListCol').append('<div class="newBookLabel treeListLabel ui-selecting">New Booking</div>') : '';
                    filterObj = {
                        'customer': '',
                        'vessel': '',
                        'lpDp': '',
                        'originDest': '',
                        'user': ''
                    };
                });
                nsBooking.setCSSForFilterAction();
                filterContent = bookingTreeUI(nsBooking.bookingDataTree, filterContent);
                $('.filterMenuContentWrapper').html(filterContent);
                $('.filterItemContent').hide();
                $('.resetFilter').trigger('click');
                $(document).off('click', '.filterItemContent .singleFilterItemsWrap .filterItem');
                $(document).on('click', '.filterItemContent .singleFilterItemsWrap .filterItem', function() {
                    var filterType,
                        ifViewAllExists = $('.filterMenuContentWrapper').find('input[type="checkbox"]:checked')
                            .length > 0,
                        localFilterType = $(this).closest('.filterItemContent').attr('data-filterType'),
                        isAlreadyChecked = $(this).hasClass('activeFilterItem'),
                        filterVal = $(this).attr('data-filterVal'),
                        canDoCurrViewAll = !(!ifViewAllExists && isAlreadyChecked);

                    if ($(this).closest('.filterItemContent').find('input[type="checkbox"]').is(':checked')) {
                        return false;
                    }
                    $('.mainBookingContentWrapper').hide();
                    nsBooking.newBookFlag = false;
                    $(this).closest('.filterItemContent').find('.filterItem').not($(this))
					.removeClass('activeFilterItem');

                    $(this).toggleClass('activeFilterItem');

					$(this).closest('.filterItemContent')
                    .find('.bookingListHeading input[type="checkbox"]').prop('disabled', canDoCurrViewAll);

                    filterObj[localFilterType] = (isAlreadyChecked ? '' : filterVal);
                    bookingData = nsBooking.filterData(bookingData, filterObj);
                    setFilterType(ifViewAllExists, filterType, bookingData);
                });
                // View All Click Event
                $(document).on('change', '.bookingListHeading input[type="checkbox"]', function() {
                    var isChecked = $(this).is(':checked'),
                        filterType = $(this).closest('.filterItemContent').attr('data-filterType');
                    $(this).closest('.filterItemContent').find('.filterItem').removeClass('activeFilterItem');
                    bookingData = changeBookListHead(isChecked, bookingData, filterType, filterObj, $(this));
                });
                $('.roundDownArrowIcon').addClass('fa fa-chevron-down');
                if(nsBooking.newBookId){
	                scndLvlId = $('.scndLevel[data-bookingId='+nsBooking.newBookId+']').attr('id');
	                if(scndLvlId){
		            	scndLvlInd = parseInt(scndLvlId.split('_')[1]);
		            	$($('.frstLevel')[scndLvlInd]).trigger('click');
	                }
                }
                if(nsBooking.bookingNewFlag){
                	$('.scndLevel[data-bookingId='+nsBooking.newBookId+']').find('.expandBooking').trigger('click');
                }
                if(nsBooking.bookingHeadFlag){
                	$('.scndLevel[data-bookingId='+nsBooking.newBookId+']').trigger('click');
                	nsBooking.newBookId = '';
                	nsBooking.bookingHeadFlag = false;
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.searchByCriteria, 'POST', JSON.stringify(searchCriteriaData));
    }

    $(document).ready(function() {
        $('#voyage').prop('disabled', true);
        $(document).on('click', '.searchRes', function(){
        	$('.newSearch').trigger('click');
        	$('.searchRes').hide();
        })
        // Left menu Submit
        $('#leftSearchMenu').submit(function(e) {
            var searchedFor = '',
                vessel = $('#vesselCode').val().trim(),
                voyage = $('#voyage').val().trim(),
                customer = $('#custCode').val().trim(),
                loadPort = $('#loadPort').val().trim(),
                dischargePort = $('#discPort').val().trim(),
                originPort = $('#originPort').val().trim(),
                destination = $('#destPort').val().trim(),
                bookingNo = $('#bookingNumber').val().trim(),
                bookingNoQuery = $('#bookingNoSearch').val(),
                VinNoQuery = $('#vinSearch').val(),
                BLNoQuery = $('#blSearch').val(),
                vinNo = $('#vinNumber').val().trim(),
                bolNo = $('#blNumber').val().trim(),
                cargoStatus = $('#cargoStatus').val(),
                cargoType = $('#cargoType').val(),
                tradeCode = $('#tradeCode').val(),
                BLStatus = $('#blStatus').val(),
                bookings = $('#bookings').val(),
                forwarderCode = $('#forwarderCode').val(),
                errorMsg = '',
                manifest = '',
                selectedManifest = $('.manifestStatus input[type="radio"]:checked'),
                dateFormat = localStorage.getItem('dateFormat'),
                bookingDate = $('#bookinggFrom').val().trim(),
                bookgFrmMand = 0,
                searchCriteriaData = {};
            e.preventDefault();
            nsBooking.bookUnitPopUpFlag = false;
            nsBooking.mainBookingFlag.changedOriginDest = false;
            nsBooking.newBookFlag = false;
            nsBooking.lcFlag = false;
            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
                    'mainBookingFlag', $(this));
                return false;
            }
            $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
            $('.bookingUnitWrap').hide();
            $('.leftSearchMenu').find('.searchMenuItemWrap').each(function() {
                var searchKey = $(this).attr('data-searchKey'), smallCloseIcon = '', itemIcon = '',
                    firstInpVal = $(this).find('.searchInput').first().val(), serchId = '';
                nsBooking.clearNewSubBook();
                nsBooking.clearNewBook();

                $('#mainViewSummaryLink,.mainBookingDetailsWrap, .mainSubBookingListWrap,'
                    +'.mainSubBookingFormWrap, .billLadingDetailsDivWrapper').hide();
                $('.mainBookingListWrap .SubBookingNbrsHdr').hide();
                $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt').text('');
                $('.mainSubBookingListWrap .subBookListColWrap .subBookContentListCol .singleColItem').remove();
                if(firstInpVal && searchKey === 'Bookings from'){
                	firstInpVal = $(this).find('.searchInput').first().val();
                	smallCloseIcon = (bookgFrmMand > 0) ? 'close' : 'circle';
                	searchedFor +=initalStr(searchKey, firstInpVal, '', smallCloseIcon) + '</div>';
                }
                else if ((firstInpVal) && !$(this).hasClass('manifestItem')) {
                    firstInpVal = ($(this).find('.searchInput').first().attr('type') === 'text') ?
                        ($(this).find('.searchInput').first().val()) :
                        ($(this).find('.searchInput').first().find('option:selected').text());
                    if ($(this).hasClass('matchOptionsItem')) {
                    	itemIcon = 'close';
                    	if($(this).find('select option:selected').text() === 'Exact match'){
                    		bookgFrmMand++;
                    		itemIcon = $('#bookinggFrom').val() ? 'close' : 'circle';
                    	}
                        searchedFor +=  initalStr(searchKey, $(this).find('select option:selected').text(), '', itemIcon)
                        + '<span> = </span><span class="searchedItemValue">' + firstInpVal + '</span>' + '</div>';
                    } else {
                    	serchId = $(this).find('.searchInput').first().attr('id');
                    	itemIcon = 'close';
                    	if(serchId === 'vesselCode' || serchId === 'vesselName' || serchId === 'voyage'){
                    		if(vessel && voyage){
	                    		bookgFrmMand++;
	                    		itemIcon = $('#bookinggFrom').val() ? 'close' : 'circle';
                    		}
                    	}
                        searchedFor += initalStr(searchKey, firstInpVal, '', itemIcon)  + '</div>';
                    }
                } else {
                    if ($(this).hasClass('manifestItem') &&
                        $(this).find('input[name="manifestStatus"]:checked').val() !== 'Both') {
                        searchedFor += initalStr(searchKey,
                            $(this).find('input[name="manifestStatus"]:checked').val(), '', "close")  + '</div>';
                    }
                }
            });
            $('.searchedForWrap').find('.searchedItem').remove();
            $('.searchedForWrap').html('<div class="selectedSearchDesc">Your Search </div>');
            $('.searchedForWrap').append(searchedFor);
            bookings = nsBooking.getBookings(bookings);
            if (!nsBooking.checkBookingFromDateFormat(bookingDate)) {
                return false;
            }
            errorMsg = nsCore.valiDate(bookingDate);
            if (errorMsg.length !== 0) {
                nsCore.showAlert(errorMsg);
                return false;
            }
            if (selectedManifest.length > 0) {
                manifest = selectedManifest.val();
            }
            if (nsBooking.canBookingDateBeEmpty(bookingNo, bookingNoQuery, vessel, voyage,
                    bolNo, BLNoQuery, vinNo, VinNoQuery)) {
                bookingDate = '';
            }
            searchCriteriaData = {
                vesselCode: vessel,
                voyageNo: voyage,
                customerCode: customer,
                loadPortCode: loadPort,
                dischargePortCode: dischargePort,
                destinationCode: destination,
                originCode: originPort,
                bookingNo: bookingNo,
                blNumber: bolNo,
                bookingNoQuery: bookingNoQuery,
                vinNoQuery: VinNoQuery,
                blNoQuery: BLNoQuery,
                blStatus: BLStatus,
                bookings: bookings,
                manifest: manifest,
                forwarderCode: forwarderCode,
                vinNumber: vinNo,
                cargoStatus: cargoStatus,
                cargoType: cargoType,
                tradeCode: tradeCode,
                bookingFrom: bookingDate,
                dateFormat: dateFormat
            };
            if (bookingDate || nsBooking.canBookingDateBeEmpty(bookingNo,
                    bookingNoQuery, vessel, voyage, bolNo, BLNoQuery, vinNo, VinNoQuery)) {
            	nsCore.appModel.bookDocSearchCriteria = searchCriteriaData;
                fnAjax(searchCriteriaData, e);
                $('.defaultSearchMsg').hide();
            } else {
                nsCore.showAlert('Bookings from should not be empty');
            }
        });
       
        
        
        
        
        // Main Booking Item CLick Event
        
        

    });

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);