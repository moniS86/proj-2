/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    $(document).on('click', '.bookConfirmation', function() {
        var bookingId = $(this).closest('.toolTipList').attr('data-bookingid'),
            bookNo = $(this).closest('.toolTipList').attr('data-filtering'),
            currDate = new Date(),
            sec = currDate.getSeconds() + '',
            min = currDate.getMinutes() + '',
            date = currDate.getDate() + '',
            mon = (currDate.getMonth() + 1) + '',
            hour = currDate.getHours() + '',
            dateStr = date + "-" + mon + "-" + currDate.getFullYear() + " " + hour + ":" + min + ":" + sec,
            url = nsBooking.viewBookConf + bookingId + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat + '&currentDate=' + dateStr;
        $('#emailBookId').val(bookingId);
        $('#emailBookNo').val(bookNo);
        $('#emailSubject').val('Booking Confirmation ' + bookNo + '.'+' PLS DO NOT REPLY TO THIS MAIL');
        vmsService.vmsApiServiceLoad(function(response) {
            if (response) {
                $('.toolTipWrapper').text('').hide();
                $('#bookingConfFrame').attr('src', '');
                if(response.responseDescription){
                	$('#bookingConfFrame').attr('src', nsBooking.reportsLink + response.responseDescription);
                } else{
                	$('#bookingConfFrame').attr('src', '');
                }
                $('#emailPdfName').val(response.responseDescription);
                $('#bookinConfirmationPopup').dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    width: '85%',                    
                    open: function() {
                        $(this).find('.popUpTitle').text('Booking Confirmation');
                    }
                });
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, url, 'POST', null);
    });
    $(document).on('click', '.previewBl', function() {
        var bookingId = $(this).closest('.toolTipList').attr('data-bookingid'),
            bookNo = $(this).closest('.toolTipList').attr('data-filtering'),
            dateFormat = localStorage.getItem('dateFormat'),
            reportDetail = {
                bookingId: bookingId,
                dateFormat: dateFormat
            },
            data = {
                reportsDetail: reportDetail
            };
        $('#emailBookId').val(bookingId);
        $('#emailBookNo').val(bookNo);
        $('#emailSubject').val('Preview Bill of Lading Mail for ' + bookNo + '. Please Donot Reply');
        $('.preloaderWrapper').show();
        vmsService.vmsApiService(function(response) {
            if (response) {
            	$('.preloaderWrapper').hide();
                $('.toolTipWrapper').text('').hide();
                $('#bookingConfFrame').attr('src', '');
                $('#bookingConfFrame').attr('src', nsBooking.reportsLink + response.responseDescription);
                $('#emailPdfName').val(response.responseDescription);
                $('#bookinConfirmationPopup').dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    width: '85%',                    
                    open: function() {
                        $(this).find('.popUpTitle').text('Preview BL');
                    }
                });
            } else {
            	$('.preloaderWrapper').hide();
                nsCore.showAlert(nsBooking.errorMsg);
            }
            
        }, nsBooking.loadPrevBlReport, 'POST', JSON.stringify(data));
    });
    $(document).on('click', '#marksAndNumBL', function() {
        var bookingId = $('.mainBookListCol').find('.ui-selecting').attr('data-bookingid'),
            previewBLInfo = {
                marksAndNumbers: $('#cargoMarkNumbersIcon').val(),
                bookId: bookingId
            };
        vmsService.vmsApiService(function(response) {
            if (response) {
                $('.toolTipWrapper').text('').hide();
                $('#consIFrame').attr('src', '');
                $('#consIFrame').attr('src', nsBooking.reportsLink + response.responseDescription);
                $('#consBLPopup').find('.popUpTitle').text('Preview Bill of Lading');
                $('#consEmailPdfName').val(response.responseDescription);
                $('#consBLPopup').dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    width: '85%'
                });
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.consignmentPreviewBL, 'POST', JSON.stringify(previewBLInfo));
    });
    $(document).on('click', '#cargoDescBL', function() {
        var bookingId = $('.mainBookListCol').find('.ui-selecting').attr('data-bookingid'),
            previewBLInfo = {
                cargoDescription: $('#cargoDescriptionIcon').val(),
                bookId: bookingId
            };
        vmsService.vmsApiService(function(response) {
            if (response) {
                $('#consIFrame').attr('src', '');
                $('#consIFrame').attr('src', nsBooking.reportsLink + response.responseDescription);
                $('#consEmailPdfName').val(response.responseDescription);
                $('#consBLPopup').find('.popUpTitle').text('Preview Bill of Lading');
                $('#consBLPopup').dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    width: '85%'
                });
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.consignmentPreviewBL, 'POST', JSON.stringify(previewBLInfo));
    });
    // Slide 53 Booking Email B/L details pop up code
    $(document).on('click', '#bookingEmailLink', function() {
        // onclick on email closing the preview popup of B/L details
        $('#billLadingPreview').closest('.ui-dialog-content').dialog('close');
        $('#bookingEmailDetailsPopup').dialog({
            modal: true,
            resizable: false,
            draggable: false,
            width: '85%'
        });
        $('#bookingEmailDetails').submit(function(e) {
            e.preventDefault();
            $(this).closest('.ui-dialog-content').dialog('close');
        });
        $('#bookingUnitForm').submit(function(e) {
            e.preventDefault();
            $(this).closest('.ui-dialog-content').dialog('close');
        });
    });
    

   
    $(document).on('click', '.bookingcopy', function(e) {
        var postUrl1 = '';
        $('.toolTipWrapper').hide();
        nsBooking.mainRoutekey = '';
        var levlIndex=$(this).closest('table').attr('data-id').split('_')[1];
        e.stopPropagation();
        $('.mainBookingDetailsWrap, .mainSubBookingListWrap,.mainBookingDetailsWrap .getPossibleVoyages').show();
        $('#possVoyagesHide').hide();
        $('.mainBookingDetailsWrap .showPreviousVoyageClass').show();
        $('.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
        $('.mainBookingListWrap .subBookingNbrsCntnt .billVin.singleColItem').removeClass('ui-selecting activeSubBook');
        postUrl1 = nsBooking.copyFreshBook + nsBooking.selectedEntity.selectedBookingMenuItem +
            '&modelType=BOOK' + '&timeStamp=' + nsBooking.selectedEntity.timeStamp;
        vmsService.vmsApiService(function(response) {
            if (response) {

            	var findNxtAvailIndex =$('.scndLevel:visible').length;
            	
            	$('.dropMenuIcon').hide();
            	if($('.frstLevel_dummy').length!==0){
            		createUnGroupedBooking()
            		nsBooking.createBookingWithoutSearch(response);
            	}else{
            		var actsubBook=$('.scndLevel.activeNavigationItem').attr('id').substr(0,$('.scndLevel.activeNavigationItem').attr('id').lastIndexOf('_'))
	            	var copyTag='<div style="display:block" class="billVin singleColItem copiedBooking scndLevel" id="scndLevel_'+levlIndex+'_'+findNxtAvailIndex+'" data-bolstatus="10" data-filtering="'
	            	+ response.bookNo + '" data-bookingid="' + response.id + '"data-deletable="Yes"><a href="javascript:void(0)"><i class="fa fa-plus expandBooking"></i>'
	            	+ response.bookNo + '</a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu '
	                + 'roundDownArrowIcon fa fa-caret-down dropMenuIcon" style="display:block"></span></div></div>'
	                nsBookDoc.insertNewAtBookingLevel(copyTag)
	                var elems=[]
						var eleStr=''
	                $.each($('.scndLevel:visible'), function(ind, ele){
						if(ele.id.indexOf(actsubBook)!==-1){
							elems.push(ele);
							
						}
					})
					elems.sort(compare);
					$.each(elems, function(ind,ele){
						eleStr+=ele.outerHTML;
						if(ind===elems.length-1){
							$('#'+ele.id).replaceWith(eleStr);
						}else{
							$('#'+ele.id).remove()
						}
					})
					$('.thrdLevel').remove();
					$('.frthLevel').remove();
					$('.fa.expandBooking').removeClass('fa-minus');
					$('.fa.expandBooking').addClass('fa-plus');
            	}

            	
                $('.mainBookingListWrap .mainBookingDetailFormTitle').text(response.bookNo);
                nsBooking.updateMainBookingCount(1);
                $('.mainBookingListWrap .subBookingNbrsCntnt div[data-bookingid=' + response.id + ']').trigger('click');
                $('#mainAddSubBooking').attr('disabled', 'disabled');
                $('.defaultSearchMsg').hide();
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, postUrl1, 'POST', null);
    });
    function compare(a,b) {
		  if (a.innerText < b.innerText){
			return -1;
		  }
		  if (a.innerText > b.innerText){
			return 1;
		  }
		  return 0;
		}
    function createUnGroupedBooking() {
    	$('.searchGroupBy').val('customerSet')
    	if($('.searchGroupBy').attr('disabled')!=='disabled'){
    		$('.searchRes').trigger('click');
    	}
    	$('.searchGroupBy').attr('disabled', true)
	    $('.subBookContentListCol.subBookingNbrsCntnt.mainBookListCol').html('<div class="searchNavigation"><div class="frstLevel_dummy" id="frstLevel_0_1"><div class="custCodePanel">Ungrouped Bookings</div><i class="fa fa-chevron-down chevronArrow"></i><div class="clearAll"></div></div><div data-bolstatus="10" data-timestamp="0" data-bookingid="" data-bolid="undefined" data-filtering="" data-bolprintstatus="undefined" data-bolstatusnumber="undefined" data-conslegstatusnum="undefined" data-deletable="Yes" class="scndLevel_dummy billVin singleColItem" id="scndLevel_0_0" style="display: block"><a href="javascript:void(0)"><i class="fa fa-plus expandBooking"></i><span class="inlinePanel">New Booking</span><div class="clearAll"></div></a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu roundDownArrowIcon fa fa-caret-down dropMenuIcon fa-chevron-down" style="display:none"></span></div></div></div></div>')
    }
    // Add New Booking from tree
    $(document).on('click', '#mainAddBooking, #createBookingButton, .createnewbooking', function(e){
    	var currBookOrgin = $('#mainBookDetailCustomerOrigin').val()
		var currBookDest = $('#mainBookDetailCustomerDestination').val()
		var custCode='' 
			 if (nsBooking.globalBookingFlag.mainBookingFlag) {
		            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
		                'mainBookingFlag', $(this));
		            return false;
		        }
		if($('.mainBookingDetailsWrap').css('display')==='block') {
			custCode= $('#mainBookDetailCustomerCode').val()
		}else{
			custCode=''
		}
    	//VMSAG-5156
    	if ($.fn.DataTable.fnIsDataTable($('#routeDetailGrid'))) {
    		if($('#routeDetailGrid .highlightedRow input').attr("data-voyageid")){
    			$('#routeDetailGrid .highlightedRow input').attr("data-voyageid","0");
    		}
        }
    	nsCore.appModel.clearDataOnCreateBooking();
    	 nsBookDoc.subBookingdiffOrgDest(false);
    	$('.wayCargo').removeAttr('disabled');
    	$('.mainLeg').removeAttr('disabled');
    	$('.selectedRoute').removeAttr('disabled');
    	$('.allocStatusType').removeAttr('disabled');
    	$('#totalBookedUnits').removeAttr('disabled');
    	$('.getPossibleVoyages').attr('style','pointer-events:null;cursor:pointer')
    	$('.getPossibleVoyages').removeClass('disabledLink');
    	$('.mainBookingDetailsWrap #possVoyages').show();
    	$('.mainBookingDetailsWrap #possVoyagesHide').hide();
    	$('.legField').children('a').each(function () {
    		$(this).attr('style','pointer-events:null;cursor:pointer');
    	});
    	nsBookDoc.appScreenShowing="newBooking"
    		nsBookDoc.consignLegList=[];
       
        e.stopPropagation();
        nsBooking.globalBookingFlag.currentEditLevel = 'booking';
        nsBooking.clearNewBook();
        nsBooking.mainRoutekey = '';
        nsBooking.fmainTrade = null;
        nsBooking.fmainSrcPort = null;
        nsBooking.fmaindestPort = null;
        nsBooking.fcarReAvl = 0;
        nsBooking.fpuReAvl = 0;
        nsBooking.fhhReAvl = 0;
        nsBooking.fstReAvl = 0;
        nsBooking.fnoVoyage = false;
        nsBooking.fmaxHeightCapacity = -1;
        nsBooking.fmaxWeightCapacity = -1;
        nsBooking.clearTrashipmentFields();
        $('.mainBookingDetailFormTitle, .comHeaderItem').show();
        $('.subBookLevel').hide();
        $('.bookingUnitContent').hide();
        $('.accElement.routeDetailsAcc').hide();
        $('.mainSubBookFormTitle').text('');
        $('.mainBookingDetailsWrap').css('background', '#ffffff');
        if ($('.mainSubBookingFormWrap').is(':visible')) {
            $('.mainSubBookingListWrap .subBookContentListCol, .mainSubBookingFormWrap').hide();
            $('.mainSubBookingCount').text('0');
        }
        $('.mainBookingContentWrapper, .mainBookingDetailsWrap').show();
        $('#bookingHeaderId').val('');
        $('#createFreshBook').find('.formSubmitButtons').show();
        $('.mainBookingDetailsWrap, .mainSubBookingListWrap,.mainBookingDetailsWrap .getPossibleVoyages').show();
        $('#possVoyagesHide').hide();
        $('.mainBookingDetailsWrap .showPreviousVoyageClass').show();
        $('.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
        if($('.mainBookingListWrap .subBookingNbrsCntnt').find('.singleColItem.activeSubBook.ui-selecting').attr('data-deletable') === 'Yes'){
        	$('.mainBookingListWrap .subBookingNbrsCntnt').find('.singleColItem.activeSubBook.ui-selecting').find('.bookingRemoveIcon').removeClass('rowRemoveDisabledIcon');
        }
        $('.mainBookingListWrap .subBookContentListCol .singleColItem').removeClass('activeSubBook ui-selecting');

      //  nsBookDoc.insertNewAtBookingLevel('<div class="newBookLabel treeListLabel ui-selecting scndLevel" style="display:block">New Booking</div>')
        $('.mainBookingDetailsWrap .mainBookingDetailFormTitle').text('New Booking');
        $('.mainMoveUnitsLnk,#mainViewSummaryLink,.routeDetailsWrapper,.possibleVoyageWrap').hide();
        $('#possibleVoyageRow,.mainSubBookingListWrap .subBookingNbrsHdr').hide();
        $('#mainAddSubBooking').attr('disabled', 'disabled');
        $('.defaultSearchMsg').hide();
        $('#possibleVoyageNewWrapId').html('');
        nsBooking.enableBookingSaveCancel();
        nsBooking.newBookFlag = true;
        if(e.target.id === 'mainAddBooking'){
        	copyDataFromSeach()
        }
        $('.withNewBooking').removeClass('withNewBooking');
        nsBookDoc.clearNewBookingNavigation()
        if((this.id === 'createBookingButton' && ($('.mainBookingCount').html() === '0' || $('.searchNavigation').length === 0 || $('.frstLevel_dummy').length !== 0))
    			|| (this.className === 'createnewbooking' && $('.frstLevel_dummy').length !== 0) ) {
    		createUnGroupedBooking()
		} else {
        	if(this.className!=='createnewbooking'){
        		nsBookDoc.collapseAllNavigation()
	    		$('.subBookContentListCol.subBookingNbrsCntnt.mainBookListCol .searchNavigation').append('<div class="frstLevel_dummy" id="frstLevel_0_1"><div class="custCodePanel">Ungrouped Bookings</div><i class="fa fa-chevron-down chevronArrow"></i><div class="clearAll"></div></div><div data-bolstatus="10" data-timestamp="0" data-bookingid="" data-bolid="undefined" data-filtering="" data-bolprintstatus="undefined" data-bolstatusnumber="undefined" data-conslegstatusnum="undefined" data-deletable="Yes" class="scndLevel_dummy billVin singleColItem" id="scndLevel_0_0" style="display: block" data-orgin="'+currBookOrgin+'"  data-dest="'+currBookDest+'"  data-custcode="'+custCode+'"><a href="javascript:void(0)"><i class="fa fa-plus expandBooking"></i><span class="inlinePanel">New Booking</span><div class="clearAll"></div></a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu roundDownArrowIcon fa fa-caret-down dropMenuIcon fa-chevron-down" style="display:none"></span></div></div></div>')
	    		$('.activeNavigationItem').removeClass('activeNavigationItem');
	    		$('.scndLevel_dummy').addClass('activeNavigationItem');
        		if($('.frstLevel').length===1){
        		//	bringGroupByData()
        		}else{
        			copyDataFromSeach()
        		}
        	
		    }else{
		    	nsBookDoc.insertNewAtBookingLevel('<div class="newBookLabel treeListLabel ui-selecting scndLevel" style="display:block" data-orgin="'+currBookOrgin+'"  data-dest="'+currBookDest+'"  data-custcode="'+custCode+'">New Booking</div>')
		    	 $('.scndLevel').removeClass('activeNavigationItem');
		    	 $('.newBookLabel').addClass('activeNavigationItem');
		    	 $('.mainBookingItemIcons.dropMenuIconContainder').removeAttr('style')
		    	 $('.icons_sprite.bookingInlineMenu.roundDownArrowIcon.fa.fa-caret-down.dropMenuIcon.fa-chevron-down').removeAttr('style')
		    	 if($('.frstLevel').length===1){
	        		//	bringGroupByData()
	        		}else{
	        			copyDataFromSeach()
	        		//	bringGroupByData()
	        		}
		    }
        }
    });
    function copyDataFromSeach() {
    	$('#mainBookDetailCustomerCode').val($('.leftSearchMenu #leftSearchMenu #custCode').val()).attr('data-form', $('.leftSearchMenu #leftSearchMenu #custCode').val());
    	$('#mainBookDetailCustomerDesc').val($('.leftSearchMenu #leftSearchMenu #custName').val()).attr('data-form', $('.leftSearchMenu #leftSearchMenu #custName').val());
    	$('#maincustomerID').val($('#massCUSID').val());
    	$('#mainBookDetailCustomerOrigin').val($('.leftSearchMenu #leftSearchMenu #originPort').val()).attr('data-form1', $('.leftSearchMenu #leftSearchMenu #originPort').val());
    	$('#mainBookDetailCustomerOriginDesc').val($('.leftSearchMenu #leftSearchMenu #originDesc').val()).attr('data-form1', $('.leftSearchMenu #leftSearchMenu #originDesc').val());
    	$('#mainBookDetailCustomerDestination').val($('.leftSearchMenu #leftSearchMenu #destPort').val()).attr('data-form2', $('.leftSearchMenu #leftSearchMenu #destPort').val());
    	$('#mainBookDetailCustomerDestinationDesc').val($('.leftSearchMenu #leftSearchMenu #destDesc').val()).attr('data-form2', $('.leftSearchMenu #leftSearchMenu #destDesc').val());
    	nsBooking.mainBookingFlag.changedOriginDest = true;
    	nsBookDoc.subBookingdiffOrgDest(false)
    }

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);