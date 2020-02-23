(function(nsBookDoc, $, vmsService, nsCore, nsBooking, nsDoc) {
    var searchNaviationObj = {}, sendBackToCopy = false, timeFormat = localStorage.getItem('timeFormat'), dateFormat = localStorage
        .getItem('dateFormat'), docLink = false;
    if ((window.location.href).indexOf('/documentation/') > 0) {
        docLink = true;
    }
    if (!nsBooking) {
        nsBooking = nsDoc;
    }
    function fncAjax(particularBookingdata, sendBackStatus) {
        if (nsCore.getPage(window.location.href) === 'booking') {
            if (particularBookingdata) {
                vmsService.vmsApiService(function(response) {
                    if (response) {
                        nsCore.appModel.setCurNavSelection('booking', response)
                        sendBackToCopy = sendBackStatus;
                        // added for 5376
                        nsBookDoc.isRouteDetailChanged = false;
                        nsBooking.bolPrintedStauts = 'N';
                        $('.mainBookingListWrap .subBookContentListCol .singleColItem.activeSubBook').attr(
                            'data-timestamp', (response.timeStamp || '0')).attr('data-boltimestamp',
                            (response.subBookingModelList[0].billOfLadingModel.timeStamp || '0'));
                        nsBooking.fectSubBookingObj = response;
                        nsBooking.loadbookingcontent(response, null, 'Exist', null, true);
                        if (sendBackToCopy) {
                            nsBooking.doAddCopyNewItem();
                        }
                        sendBackToCopy = false;
                        if ($('#billLadingDetailsForm[data-saveInput=true]').length > 0) {
                            $('#billLadingDetailsForm').attr('data-saveInput', false);
                            $('.preloaderWrapper').hide();
                            return false;
                        } else {
                            // hiding all div's on open of screen
                            nsBookDoc.panelActions('mainBookingContentWrapper', 'open');
                            $('#billLadingDetailsForm').attr('data-saveInput', false);
                        }
                        /*
                         * enable disable happens in getCommentsList call. after
                         * that hide - $('.preloaderWrapper').hide(); VMSAG-4000
                         */
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.fetchSubBooking, 'POST', JSON.stringify(particularBookingdata));
            }
        }
        vmsService.vmsApiService(function(data) {
            var bolTypes = [];
            $.each(data.responseData, function(i, val) {
                var billDet = val.docType + '-' + val.docTypeCopy + '-' + val.docTypeOriginal;
                bolTypes.push(billDet);
            });
            if (nsDoc) {
                nsDoc.docBolTypes = bolTypes;
            } else {
                nsBooking.bolTypes = bolTypes;
            }
        }, nsBooking.billTypeNum || nsDoc.billTypeNum, 'GET', null);
    }
    function getSubBookingTitle(consignNo, units, cargoTxt){
        if(!nsDoc){
	         var lengthNo = 4 - consignNo.length;
	         var appe=""
	         for (k = 0; k < lengthNo; k++) {
	             appe += '0';
	         }
	         return appe + consignNo+ ' - ' + units + ' - ' + cargoTxt;
        }else{
            
            return  units + ' - ' + cargoTxt;
        }
  	 
    }
    
    function fncAjax1(particularBookingdata, sendBackStatus) {
        var fetchURL = '';
        if (nsCore.getPage(window.location.href) === 'booking') {
            fetchURL = nsBooking.fetchConsignments;
            if (!particularBookingdata.bookingId) {
                $('.preloaderWrapper').hide();
                return false;
            }
        } else {
            fetchURL = '/Vms/documentation/fetchBLConsignments'
        }
        if(particularBookingdata){
        vmsService
            .vmsApiService(
                function(response) {
                    if (response && response.responseData) {
                        var responseFilter;
                        $('#maincustomerID, .subBookLevel #maincustomerID').val(response.responseData.companyId);
                        $('#bookingOfficeId').val(response.responseData.compAllocId);
                        $('#bookingHeaderId').val(response.responseData.id);
                        nsCore.appModel.setFetchBLConsignments(response);
                        if (response.responseData.subBookingList) {
                            responseFilter = response.responseData.subBookingList.reduce(function(memo, e1) {
                                var matches = memo.filter(function(e2) {
                                    return e1.id === e2.id
                                });
                                if (matches.length === 0) {
                                    memo.push(e1)
                                }
                                return memo;
                            }, [])
                        }
                        var subBookingContent = ''
                        nsBooking.isBookingCreatedStatus = false;
                        if (responseFilter && responseFilter.length > 0) {
                            $
                                .each(
                                    responseFilter,
                                    function(i, obj) {
                                        var canRemove = obj.subBookingRemovable === 'Y' ? 'rowRemoveIcon'
                                            : 'rowRemoveDisabledIcon', BLStatus = obj.billOfLading.bolHeader.bolStatus, className = nsBooking.getBlStatusClassName ? nsBooking
                                            .getBlStatusClassName(BLStatus)
                                            : "";
                                        cargoTextVal = 'New Sub Booking', lengthNo = 0, consLegStatus = '',
                                            originalLen = 4, k = 0, appe = '', subTitle = '';
                                        if (obj.cargoText) {
                                            cargoTextVal = obj.cargoText;
                                        }
                                        lengthNo = originalLen - obj.consignmentNo.length;
                                        for (k = 0; k < lengthNo; k++) {
                                            appe += '0';
                                        }
                                        subTitle = appe + obj.consignmentNo + ' - ' + obj.bookedUnits + ' - '
                                            + cargoTextVal;
                                        if (docLink) {
                                            consLegStatus = obj.consignmentLeg ? obj.consignmentLeg.consignmentLegStatus
                                                : "";
                                        } else {
                                            consLegStatus = obj.billOfLading ? obj.billOfLading.bolHeader.bolStatus
                                                : "";
                                        }
                                        subBookingContent += nsBookDoc.generateSingleSubBookingItem(
                                            (obj.bookingID || response.responseData.id), obj.id, subTitle, canRemove, className,
                                            obj.timeStamp, obj.consignmentLeg.timeStamp, obj.consignmentLeg.id,
                                            consLegStatus,
                                            (obj.billOfLading && obj.billOfLading.bolHeader.bolPrinted) ? "Yes" : "No",
                                            obj.billOfLading.id, response.responseData);
                                    })
                            // //////////////////////////////////////////////
                            $(this).find('.dropMenuIcon').show()
                            var selectedSub = $('.searchNavigation').find(
                                '['
                                    + getBookingDocValues("data-bookingid", "data-bolid")
                                    + '="'
                                    + getBookingDocValues(responseFilter[0].bookingID,
                                        responseFilter[0].billOfLading.id) + '"]');
                            var selectSubId = selectedSub[0].id;
                            var firstLvelIndex = selectSubId.split('_')[1]
                            var secondLvelIndex = selectSubId.split('_')[2]                           
                            
                            if (sendBackStatus === 'bookingOrBLClick'){
                            	removeSubbookingsInTree(selectSubId,firstLvelIndex,secondLvelIndex);
                            	addSubookingsInTree(subBookingContent,selectSubId,firstLvelIndex,secondLvelIndex);  
                            	$('.frthLevel').remove();
                            }
                            else {
	                            if ($($('#' + selectSubId)[0].parentNode).find(
	                                $('#thrdLevel_' + firstLvelIndex + '_' + secondLvelIndex + '_0')).length === 0) {	                            	
	                            	addSubookingsInTree(subBookingContent,selectSubId,firstLvelIndex,secondLvelIndex);
	                            } else {
	                            	removeSubbookingsInTree(selectSubId,firstLvelIndex,secondLvelIndex);
	                            }
                            }
                            
                            /* nsBookDoc.afterDynamicSubBookingInserted() */
                            if (nsBookDoc.insertNewSubBook !== '') {
                                nsBookDoc.insertNewAtSubBookingLevel(nsBookDoc.insertNewSubBook)
                                nsBookDoc.insertNewSubBook = '';
                            }
                            // /////////////////////////////////////////////////
                            if ($('#' + selectSubId).next().hasClass('frstLevel')) {
                                $('#' + selectSubId).addClass('bottomBorder');
                            } else {
                                $('#' + selectSubId).removeClass('bottomBorder');
                            }
                            nsBookDoc.addingBottomBorderScndLevel();
                            nsCore.appModel.triggerRegisterEvent();
                        }
                        $('.preloaderWrapper').hide();
                        if (nsBooking.bookingNewFlag
                            || ($('.mainBookDetailTitleWrap .mainBookingDetailFormTitle').text() === "New Booking" && $('.thrdLevel').length > 0)) {
                            nsBooking.bookingNewFlag = false;
                            nsBooking.newBookId = '';
                            $('.thrdLevel').trigger('click');
                        }
                        if (nsDoc && nsDoc.consLevelCheck) {
                            nsDoc.newBlObj.isManualTrigger = false;
                            $('.thrdLevel').attr('data-subbookingid', nsDoc.consLevelCheck).trigger('click');
                            nsDoc.consLevelCheck = false;
                        }
                    } else {
                        $('.preloaderWrapper').hide();
                        nsCore.appModel.clearRegisterEvent();                       
                    }
                }, fetchURL, 'POST', JSON.stringify(particularBookingdata));
        }
    }
    
     function addSubookingsInTree(subBookingContent,selectSubId,firstLvelIndex,secondLvelIndex){
    	 var thirdLvlIndex = 0;
         $(subBookingContent).insertAfter('#' + selectSubId);	                                
         $($('#' + selectSubId)[0].parentNode).children('div.thrdLevel').each(
             function() {
                 if (!this.id) {
                     $(this).attr(
                         'id',
                         'thrdLevel_' + firstLvelIndex + '_' + secondLvelIndex + '_'
                             + thirdLvlIndex)
                     thirdLvlIndex++;
                 }
             })
    	 
     }
     function removeSubbookingsInTree(selectSubId,firstLvelIndex,secondLvelIndex){
    	 $($('#' + selectSubId)[0].parentNode).children('div').each(function() {
             if (this.id.indexOf('thrdLevel_' + firstLvelIndex + '_' + secondLvelIndex) !== -1) {
                 $(this).remove();
             }
         });   
    	 
     }
    
    function getBookingDocValues(bookVal, docVal) {
        if (nsCore.getPage(window.location.href) === 'booking') {
            return bookVal
        } else {
            return docVal
        }
    }
    function fetchBookingCommon(that, calling) {
      
  	var errorMsg = '', 
      timeStamp = '',
      isBl = '',
      particularBookingdata = {},           
      vessel = nsCore.appModel.bookDocSearchCriteria.vesselCode?nsCore.appModel.bookDocSearchCriteria.vesselCode : '',
      voyage = nsCore.appModel.bookDocSearchCriteria.voyageNo? nsCore.appModel.bookDocSearchCriteria.voyageNo : '',
      customer = nsCore.appModel.bookDocSearchCriteria.customerCode? nsCore.appModel.bookDocSearchCriteria.customerCode : '',        
      loadPort = nsCore.appModel.bookDocSearchCriteria.loadPortCode ?  nsCore.appModel.bookDocSearchCriteria.loadPortCode : '',
      dischargePort = nsCore.appModel.bookDocSearchCriteria.dischargePortCode? nsCore.appModel.bookDocSearchCriteria.dischargePortCode :'',
      destination = nsCore.appModel.bookDocSearchCriteria.destinationCode? nsCore.appModel.bookDocSearchCriteria.destinationCode :'',
      originPort = nsCore.appModel.bookDocSearchCriteria.originCode ? nsCore.appModel.bookDocSearchCriteria.originCode :'',        
      bookingNo = nsCore.appModel.bookDocSearchCriteria.bookingNo? nsCore.appModel.bookDocSearchCriteria.bookingNo :'',    		  
      bolNo = nsCore.appModel.bookDocSearchCriteria.bolNum ? nsCore.appModel.bookDocSearchCriteria.bolNum:'',    
      bookingNoQuery = nsCore.appModel.bookDocSearchCriteria.bookingNoQuery ? nsCore.appModel.bookDocSearchCriteria.bookingNoQuery :$('#bookingNoSearch').val(), 
      VinNoQuery = nsCore.appModel.bookDocSearchCriteria.vinNoQuery ? nsCore.appModel.bookDocSearchCriteria.vinNoQuery :getBookingDocValues($('#vinSearch').val(), $('#VINNoQuery').val()),
      BLNoQuery = nsCore.appModel.bookDocSearchCriteria.blNoQuery ? nsCore.appModel.bookDocSearchCriteria.blNoQuery : $('#blSearch').val(),
      BLStatus = nsCore.appModel.bookDocSearchCriteria.blStatus ? nsCore.appModel.bookDocSearchCriteria.blStatus : '',        
      bookings =  $('#bookings').val(),
      manifest = '',
      bolid = $(that).attr('data-bolid'),
      bolNum = $(that).attr('data-filtering'),
      bookingDate = nsCore.appModel.bookDocSearchCriteria.bookingFrom?nsCore.appModel.bookDocSearchCriteria.bookingFrom:$('#bookinggFrom').val().trim(),
      manifestStatus = nsCore.appModel.bookDocSearchCriteria.manifest?nsCore.appModel.bookDocSearchCriteria.manifest: $('.manifestStatus input[type="radio"]:checked'), 
      forwarderCode = nsCore.appModel.bookDocSearchCriteria.forwarderCode? nsCore.appModel.bookDocSearchCriteria.forwarderCode :'',
      vinNo = nsCore.appModel.bookDocSearchCriteria.vinNumber? nsCore.appModel.bookDocSearchCriteria.vinNumber:'',
      cargoStatus = nsCore.appModel.bookDocSearchCriteria.cargoStatus ? nsCore.appModel.bookDocSearchCriteria.cargoStatus :'',
      cargoType = nsCore.appModel.bookDocSearchCriteria.cargoType ? nsCore.appModel.bookDocSearchCriteria.cargoType :'',
      tradeCode = nsCore.appModel.bookDocSearchCriteria.tradeCode ? nsCore.appModel.bookDocSearchCriteria.tradeCode :'',              
      bookingId = $(that).attr('data-bookingid');  
  	  
	  	if(nsCore.getPage(window.location.href) === 'booking'){
	  		bolNo = nsCore.appModel.bookDocSearchCriteria.blNumber ? nsCore.appModel.bookDocSearchCriteria.blNumber:'';
	  	}
  	   switch(BLStatus){
	       case '10': 
	    	   BLStatus = ($('#blStatus option')[3]).value;
	    	   break;
	       case '20':
	    	   BLStatus = ($('#blStatus option')[1]).value;
	    	   break;
	       case '30':
	    	   BLStatus = ($('#blStatus option')[2]).value;
	    	   break;
  	   }
    
        $('.bookingUnitWrap').hide();
        if (nsBooking.globalBookingFlag.mainBookingFlag) {
            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
                'mainBookingFlag', $(that));
            return false;
        }
        $('.preloaderWrapper').show();
        nsBooking.selectedEntity.selectedBooking = $(that).attr('data-bookingid');
        nsBooking.selectedEntity.selectedBookingMenuItem = $(that).attr('data-bookingid');
        nsBooking.isCopyBookingEnabled = '';
        if ($(that).closest('.subBookingNbrsCntnt').find('.singleColItem.activeSubBook.ui-selecting').attr(
            'data-deletable') === 'Yes') {
            $(that).closest('.subBookingNbrsCntnt').find('.singleColItem.activeSubBook.ui-selecting').find(
                '.bookingRemoveIcon').removeClass('rowRemoveDisabledIcon');
        }
        $(that).closest('.subBookingNbrsCntnt').find('.singleColItem').removeClass('activeSubBook ui-selecting');
        $(that).addClass('activeSubBook ui-selecting');
        if (calling === 'expand' && !$(that).hasClass('activeNavigationItem')) {
            $(that).find('.dropMenuIcon').hide();
        }
        nsBooking.globalBookingFlag.currentEditLevel = 'booking';
        nsBooking.globalBookingFlag.mainBlDetailsFlag = false;
        nsBooking.globalBookingFlag.mainBookingFlag = false;
        nsBooking.globalBookingFlag.mainBookingHeaderFlag = false;
        if (calling === 'booking') {
            $(
                '#mainViewSummaryLink,.mainBookingDetailsWrap, .mainSubBookingListWrap,'
                    + '.mainSubBookingFormWrap, .billLadingDetailsDivWrapper,.mainSubBookingListWrap'
                    + ' .subBookContentListCol, .mainSubBookingListWrap .SubBookingNbrsHdr').show();
            $('.mainBookingDetailFormTitle, .comHeaderItem').show();
            $('.subBookLevel').hide();
            $('.mainSubBookFormTitle').text('');
            $('.accElement.routeDetailsAcc').show();
            $('.accElement.routeDetailsAcc').css('width', '75%');
            $('.routeDetailsWrapper').css('width', '100%');
            $('#totalUnitsRow').hide();
            $('#mainBookDetailCustomerCode, #mainBookDetailCustomerDesc, #mCustomerRef, #mainContract').attr(
                'disabled', false);
            $('#createFreshBook').find('.formSubmitButtons').show();
            $(
                '.subBookingDimensionsInfoWrapper,.freightCargoDetailsDivWrapper,'
                    + '.possibleVoyageWrap,.possibleVoyageNewWrap').hide();
            $('.mainBookingDetailsWrap').css('background', '#ffffff');
            $('#mainAddSubBooking').removeAttr('disabled');
        }
        if (!(sendBackToCopy)) {
            nsBooking.highlightTreeItem($('.mainBookingListWrap .subBookingNbrsCntnt').find('.singleColItem'), $(that),
                'activeSubBook ui-selecting');
        }
        if (bookings) {// ///////////////////this needs to be looked into
            bookings = nsBooking.getBookings(bookings);
            if (!nsBooking.checkBookingFromDateFormat(bookingDate)) {
                return false;
            }
        }
        errorMsg = nsCore.valiDate(bookingDate);
        if (errorMsg.length !== 0) {
            nsCore.showAlert(errorMsg);
            return false;
        }
        
        if(nsCore.appModel.bookDocSearchCriteria.manifest){
        	manifest = (manifestStatus.length > 0) ? manifestStatus : '';
        }
        else {
        	manifest = (manifestStatus.length > 0) ? manifestStatus.val() : '';
        }
        
        if (bookings) {// ///////////////////this needs to be looked into
            if (nsBooking.canBookingDateBeEmpty(bookingNo, bookingNoQuery, vessel, voyage, bolNo, BLNoQuery, vinNo,
                VinNoQuery)) {
                bookingDate = '';
            }
        }
        timeStamp = $('.mainBookListCol').find('.ui-selecting').attr('data-timestamp');
        if (nsCore.getPage(window.location.href) === 'booking') {
            particularBookingdata = {
                vesselCode : vessel,
                voyageNo : voyage,
                customerCode : customer,
                loadPortCode : loadPort,
                dischargePortCode : dischargePort,
                destinationCode : destination,
                originCode : originPort,
                bookingNo : bookingNo,
                blNumber : bolNo,
                bookingNoQuery : bookingNoQuery,
                vinNoQuery : VinNoQuery,
                blNoQuery : BLNoQuery,
                blStatus : BLStatus,
                bookings : bookings,
                manifest : manifest,
                forwarderCode : forwarderCode,
                vinNumber : vinNo,
                cargoStatus : cargoStatus,
                cargoType : cargoType,
                tradeCode : tradeCode,
                bookingFrom : bookingDate,
                dateFormat : dateFormat,
                bookingId : bookingId,
                timeFormat : timeFormat,
                timeStamp : timeStamp
            };
            if ($('.mainBookingDetailFormTitle').text().indexOf('New Booking') !== -1) {
                particularBookingdata = {
                    vesselCode : "",
                    voyageNo : "",
                    customerCode : "",
                    loadPortCode : "",
                    dischargePortCode : "",
                    destinationCode : "",
                    originCode : "",
                    bookingNo : "",
                    blNumber : "",
                    bookingNoQuery : "Need Exact match",
                    vinNoQuery : "Need Exact match",
                    blNoQuery : "",
                    blStatus : "",
                    bookings : "Valid",
                    manifest : "Both",
                    forwarderCode : "",
                    vinNumber : "",
                    cargoStatus : "",
                    cargoType : "",
                    tradeCode : "",
                    bookingFrom : bookingDate,
                    dateFormat : dateFormat,
                    bookingId : bookingId,
                    timeFormat : timeFormat,
                    timeStamp : "0"
                };
            }
        } else {
            particularBookingdata = {
                blNoQuery : "Need Exact match",
                blStatus : BLStatus,
                bolId : bolid,
                bolNum : bolNum,
                bookingFrom : bookingDate,
                bookingNoQuery : BLNoQuery,
                bookingNumber : bookingNo,
                bookingType : "Valid",
                cargoStatus : cargoStatus,
                cargoType : cargoType,
                customerCode : customer,
                dateFormat : dateFormat,
                destinationCode : destination,
                dischargePortCode : dischargePort,
                forwarderCode : forwarderCode,
                loadPortCode : loadPort,
                manifest : manifest,
                originCode : originPort,
                tradeCode : tradeCode,
                vesselCode : vessel,
                vinNoQuery : VinNoQuery,
                vinNumber : vinNo,
                voyageNo : voyage
            };
        }
        if ($(that).hasClass('copiedBooking')) {
            isBl = 'BOOK';
            particularBookingdata = {
                dateFormat : dateFormat,
                bookingId : bookingId,
                timeFormat : timeFormat,
                blSearch : isBl,
                bookings : bookings,
                manifest : "Both"
            };
        }
        return particularBookingdata;
    }
    function addDefaultCharges() {
        var bookingId = nsBooking.findBookingID(null), postUrl1 = '/Vms/booking/getDefaultCharges?bookingId='
            + bookingId;
        vmsService.vmsApiService(function(response) {
            var count = 0, i = 0;
            if (response) {
                if (response.responseData.length > 0 && response.responseData[0].chargeType) {
                    $('#subBookingChargesGrid tbody').show();
                } else {
                    $('#subBookingChargesGrid tbody').hide();
                }
                count = response.responseData.length;
                for (i = 1; i < count; i++) {
                    $('#subBookingChargesGrid tbody tr:first').clone().appendTo('#subBookingChargesGrid');
                }
                count = 1;
                $.each(response.responseData, function(idx, obj) {
                    $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('#chargeType').val(
                        obj.chargeType);
                    $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('.chargeBasis').val(
                        obj.chargeBasis);
                    $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('#chargeCurrency').val(
                        obj.currency.currencyCode);
                    $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('#chargeRate').val(obj.rate);
                    $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('#chargeComments').val(
                        obj.comment);
                    $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('#chargePayment').val(
                        obj.prepaid);
                    if (obj.includeInGrossFreight === 'Y') {
                        $('#subBookingChargesGrid tbody tr:nth-child(' + count + ')').find('#chargeGrossFreight').prop(
                            'checked', true);
                    }
                    count = count + 1;
                });
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, postUrl1, 'GET', null);
    }
    function insertNewAtSubBookingLevel(tag) {
        var getActiveBookingId = ($('.scndLevel[data-bookingid='
            + $('.thrdLevel.activeNavigationItem').attr('data-bookingid') + ']')[0] || $('.scndLevel.activeSubBook')[0]).id,
        frsInd = '', sndInd = '',
            getLastSubBookingEle = '', newSubBookId = '', n1 = '', n2 = '';
        if (nsDoc) {
            getActiveBookingId = ($('.scndLevel[data-bolid=' + $('.thrdLevel.activeNavigationItem').attr('data-bolid')
                + ']')[0] || $('.scndLevel.activeSubBook')[0]).id;
        }
        frsInd = getActiveBookingId.split('_')[1];
        sndInd = getActiveBookingId.split('_')[2];
        n1 = frsInd.length - 1;
        n2 = sndInd.length - 1;
        $.each($('.thrdLevel'), function(i, elem) {
            if (elem.id.substr(0, 13 + n1 + n2) === 'thrdLevel_' + frsInd + "_" + sndInd) {
                getLastSubBookingEle = elem.id
            }
        });
        if (getLastSubBookingEle) {
            newSubBookId = getLastSubBookingEle.substr(0, 13 + n1 + n2) + '_'
                + (parseInt(getLastSubBookingEle.split('_')[3]) + 1).toString();
            if ($('#' + getLastSubBookingEle).find('i.expandSubBooking').hasClass('fa-minus')
                && $('.frthLevel').length > 0) {
                $(tag).attr('id', newSubBookId).insertAfter($('.frthLevel').last());
            } else {
                $(tag).attr('id', newSubBookId).insertAfter($('#' + getLastSubBookingEle));
            }
        }
        nsBookDoc.removeDropDownIcon();
        $('.activeNavigationItem').removeClass('activeNavigationItem')
        $('.thrdLevel.newBookLabel').addClass('activeNavigationItem')
        nsBookDoc.addingBottomBorderScndLevel();
    }
    function escapeHtml(string) {
        return String(string).replace(/[&<>''\/]/g, function(s) {
            return nsBooking.entityMap[s];
        });
    }
    function deleteSubBookingNav() {
        $('.thrdLevl.activeSubBook').remove();
    }
    searchNaviationObj = {
        'fncAjax' : fncAjax,
        'fncAjax1' : fncAjax1,
        'fetchBookingCommon' : fetchBookingCommon,
        'addDefaultCharges' : addDefaultCharges,
        'insertNewAtSubBookingLevel' : insertNewAtSubBookingLevel,
        'deleteSubBookingNav' : deleteSubBookingNav,
        'getBookingDocValues' : getBookingDocValues,
        'escapeHtml' : escapeHtml,
        'getSubBookingTitle' : getSubBookingTitle,
        'insertNewSubBook' : ''
    };
    $.extend(true, nsBookDoc, searchNaviationObj);
})(this.bookDoc, jQuery, this.vmsService, this.core, this.booking, this.doc);
