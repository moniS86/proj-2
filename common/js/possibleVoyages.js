/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
(function(nsPossibleVoyage, $, vmsService, nsCore, nsBooking, nsBookDoc, nsDoc) {
    var posVoyObj = {}, timeFormat = localStorage.getItem('timeFormat'), dateFormat = localStorage
        .getItem('dateFormat'), tempConsignmentLeg = [], hiddenInput = "";
    seliDisplayIndex = 0;
    if (!nsBooking) {
        nsBooking = nsDoc
    }
    $(document).ready(
        function() {  
            
            $('#possibleVoyagePopup').dialog({
                modal : true,
                resizable : false,
                draggable : false,
                autoOpen : false,
                width : '80%',
                position : {
                    my : "center",
                    at : "top"
                },
                open : function() {
                    $('#possibleVoyagesGrid tr').find('td input:checked').trigger('click');
                },
                close : function() {
                    $('#quickBookChargesGrid tbody tr:not(:first-child)').remove();
                }
            });
            $('#possVoyages').click(function() {
                $('#currentLoadPortCallVoyId').val($('.selectedRoute:checked').attr('data-voyageid'));
                nsBookDoc.possibleVoyageinit();
            });
            $('#okBtn').click(
                function() {
                	if (nsBookDoc.consignLegList.length !== 0) {
                      	 setNewVoyageListDetails(tempConsignmentLeg)
                      } else {
                      	setNewVoyageListDetails(nsBookDoc.selectePossibleVoyage)
                      }
                	nsBookDoc.isRouteDetailChanged = true;
                    if (!nsDoc) {
                        nsBooking.clearThirdPartyInfo();
                    }
                    $('#routeDetailGrid').show();
                   nsBooking.mainBookingFlag.changedOriginDest = false;
                    $('.routeDetailsAcc').show();
                    $('.routeDetailsWrapper').show();
                    $('.PosVoyTemp').remove();
                    $('#mainBoookDetailsFormContent').append(hiddenInput);
                    $(".selectedPosVo").each(function() {
                        if (this.id !== 'selectPossibleVoyage' + seliDisplayIndex) {
                            this.parentNode.removeChild(this);
                        }
                    })
                    if ($('.mainSubBookFormTitle').text()
                        || ($('.subBookingDimensionsInfoWrapper').css('display') === 'block' && $(
                            '.mainSubBookingFormWrap').css('display') === 'block')) {
                        $('#totalUnitsRow').show();
                        $('.accElement.routeDetailsAcc').css('width', '100%');
                        $('.routeDetailsWrapper').css('width', '80%');
                    } else {
                        $('#totalUnitsRow').hide();
                        $('.accElement.routeDetailsAcc').css('width', '75%');
                        $('.routeDetailsWrapper').css('width', '100%');
                    }
                    if ($.fn.DataTable.fnIsDataTable($('#routeDetailGrid'))) {
                        $.fn.DataTable($('#routeDetailGrid')).destroy();
                    }  
                    if (nsBookDoc.consignLegList.length !== 0) {
                    	 setNewVoyageListDetails(tempConsignmentLeg)
                        tempConsignmentLeg=resetActionListInRouteGrid(tempConsignmentLeg)
                        if (nsCore.getPage(window.location.href) === 'booking') {
                            nsBooking.loadROuteDetailsGrid(tempConsignmentLeg, "N");
                        } else {
                            nsBookDoc.loadROuteDetailsGrid(tempConsignmentLeg, "N");
                        }
                    } else {
                    	setNewVoyageListDetails(nsBookDoc.selectePossibleVoyage)
                        nsBookDoc.selectePossibleVoyage=resetActionListInRouteGrid(nsBookDoc.selectePossibleVoyage)
                        if (nsCore.getPage(window.location.href) === 'booking') {
                            nsBooking.loadROuteDetailsGrid(nsBookDoc.selectePossibleVoyage, "Y");
                        } else {
                            nsBookDoc.loadROuteDetailsGrid(nsBookDoc.selectePossibleVoyage, "Y");
                        }
                        if (nsCore.appModel.lastUserEventTarget !== '.createsubbooking') {                          
                            $('.mainLeg').attr('disabled', 'disabled');
                            $('.selectedRoute').attr('disabled', 'disabled');
                            if (!nsDoc) {
                                var a = nsCore.appModel.fetchBOLInfo.subBookingModelList;
                                $.each(a, function(key, value) {
                                    if (a[key].bolStatus === "10" && nsCore.appModel.selected === 'booking') {
                                        $('.allocStatusType').removeAttr('disabled');
                                    } else {
                                        $('.allocStatusType').attr('disabled', 'disabled');
                                    }
                                });
                            }
                            $('.legField').children('a').each(function() {
                                $(this).attr('style', 'pointer-events:none;cursor:default');
                            });
                        }
                    }
                    if(nsBookDoc.isGetPossibleVoyageDiffSaveData(nsBookDoc.existingRouteDetails)){
                    	nsBookDoc.setForDirtyPopup();
                    }
                    nsBookDoc.newLegFlag='Y';
                    $('.wayCargo').prop('checked', false);
                    $('#possibleVoyagePopup').dialog('close');
                    $('.bookingTableWrapper.accContent').show();
                    $('.accElement.routeDetailsAcc .accHeader').addClass('bdrBtmNo');
                });
            $('#cancelBtn').click(function() {
                nsBookDoc.selectePossibleVoyage = [];
                if (nsDoc) {
                    nsDoc.existingRouteData.selectedVesselVoyage = nsDoc.existingRouteData.existingVesselVoyage;
                }
                if(nsBookDoc.prevSelectedPossibleVoyages.length!==0){
                    nsBookDoc.selectePossibleVoyage=nsBookDoc.prevSelectedPossibleVoyages
                }
                $('#possibleVoyagePopup').dialog('close')
            });
            $('.showPrevVoyages').click(function() {
                getPossVoyages()
            })
        })
         function setNewVoyageListDetails(consiLeg){
            nsBookDoc.existingRouteDetails.newLegCount = consiLeg.length;
            nsBookDoc.existingRouteDetails.newVesVoy=[];
            nsBookDoc.existingRouteDetails.newLoadPort=[];
            nsBookDoc.existingRouteDetails.newDisPort=[];
            nsBookDoc.existingRouteDetails.newETA=[];
            nsBookDoc.existingRouteDetails.newETD=[];

            $.each(consiLeg, function(i, v) {
                nsBookDoc.existingRouteDetails.newVesVoy[i] = v.vesselVoyage;
                nsBookDoc.existingRouteDetails.newLoadPort[i] = v.loadPortCode;
                nsBookDoc.existingRouteDetails.newDisPort[i] = v.discPortCode;
                nsBookDoc.existingRouteDetails.newETA[i] = v.estimatedArrival;
                nsBookDoc.existingRouteDetails.newETD[i] = v.estimatedDeparture;
            })
        }
       function resetActionListInRouteGrid(consignmentLegDetails){
        if(nsBookDoc.isGetPossibleVoyageDiffSaveData(nsBookDoc.existingRouteDetails)){
        	$.each(consignmentLegDetails, function(i, leg){
        		consignmentLegDetails[i].actionList=[];
        		
        	})
        	return consignmentLegDetails;
        }else{
        	return consignmentLegDetails;
        	
        }
        	
    	}
     function isGetPossibleVoyageDiffSaveData(existRouteDetails){
    	 switch(nsCore.appModel.selected){
    	 case 'booking':
    		 return findGetPossibleVayageDiffSaveData(existRouteDetails)
    		 break;
    	 case 'subBooking':
    		 return findGetPossibleVayageDiffSaveData(existRouteDetails)
    		 break;
    	 case 'bl':
    		 return findGetPossibleVayageDiffSaveData(existRouteDetails)
    		 break;
    	 default:
    		 /*Nothing here*/
    	 }
     }
    function findGetPossibleVayageDiffSaveData(existRouteDetails){
    	 var returnFlag=false;
    	 if(existRouteDetails.newLoadPort.length!==0 && existRouteDetails.newLoadPort.length!==existRouteDetails.oldLoadPort.length){
    		returnFlag= true;
    	}else{
    		$.each(existRouteDetails.newLoadPort, function(i, leg){
    			if((existRouteDetails.newVesVoy[i]!==existRouteDetails.vesVoy[i] || existRouteDetails.newLoadPort[i]!==existRouteDetails.oldLoadPort[i] || existRouteDetails.newDisPort[i]!==existRouteDetails.oldDisPort[i] || existRouteDetails.oldETA[i]!==existRouteDetails.newETA[i] || existRouteDetails.oldETD[i]!==existRouteDetails.newETD[i]) && !returnFlag){
    				returnFlag= true;
    			}
    				
    		})
    	}
    	return returnFlag;
    }
   function possVoyOriginValidate(isActionPerformed, message) {
        var origin = $('#mainBookDetailCustomerOrigin').val(), originDesc = $('#mainBookDetailCustomerOriginDesc')
            .val();
        if ((!origin) && (!originDesc) && (isActionPerformed)) {
            message = message + 'Origin should not be empty' + '\n';
        } else {
            if ((origin && !originDesc) || (!origin && originDesc)
                || ($('#mainBookDetailCustomerOrigin').attr('data-form1') === '0') && (isActionPerformed)) {
                message = message + 'Enter a valid Origin' + '\n';
            }
        }
        return message;
    }
    function possVoyDestiValidate(isActionPerformed, message) {
        var destination = $('#mainBookDetailCustomerDestination').val(), destinationDesc = $(
            '#mainBookDetailCustomerDestinationDesc').val();
        if ((!destination) && (!destinationDesc) && (isActionPerformed)) {
            message = message + 'Destination should not be empty' + '\n';
        } else {
            if ((!!destination) && (!destinationDesc) || ((!destination) && (!!destinationDesc))
                || ($('#mainBookDetailCustomerDestination').attr('data-form2') === '0') && (isActionPerformed)) {
                message = message + 'Enter a valid Destination' + '\n';
            }
        }
        return message;
    }
    function possVoyCustValidate(message) {
        var customerCode = $('.thrdLevel.activeSubBook.ui-selecting').length === 0 ? $('#mainBookDetailCustomerCode')
            .val() : $('.subBookLevel #mainBookDetailCustomerCode').text(), customerName = $('.thrdLevel.activeSubBook.ui-selecting').length === 0 ? $(
            '#mainBookDetailCustomerDesc').val()
            : $('.subBookLevel #mainBookDetailCustomerDesc').text(), loadCust = '', loadName = '';
        if ((!customerCode) && (!customerName)) {
            message = message + 'Customer should not be empty' + '\n';
        } else {
            loadCust = $('.thrdLevel.activeSubBook.ui-selecting').length === 0 ? $('#mainBookDetailCustomerCode').attr(
                'data-form') : $('.subBookLevel #mainBookDetailCustomerCode').attr('data-form');
            loadName = $('.thrdLevel.activeSubBook.ui-selecting').length === 0 ? $('#mainBookDetailCustomerDesc').attr(
                'data-form') : $('.subBookLevel #mainBookDetailCustomerDesc').attr('data-form');
            if (loadCust === '1' || loadName === '1') {
                message = message + 'Enter a valid Customer' + '\n';
            }
        }
        return message;
    }
    function validatePossVoyages(showPrevious, possibleVoyageClicked) {
        var message = '', valid = true, isActionPerformed = (possibleVoyageClicked === 'Y' || showPrevious === 'Y'), origin = '', destination = '';
        // Do all the mandatory check.
        message = possVoyOriginValidate(isActionPerformed, message);
        message = possVoyDestiValidate(isActionPerformed, message);
        message = possVoyCustValidate(message);
        if (!message) {
            origin = $('#mainBookDetailCustomerOrigin').val();
            destination = $('#mainBookDetailCustomerDestination').val();
            if (origin === destination) {
                message = 'Origin and destination are equal. This is not a valid combination.' + '\n';
                valid = false;
            }
        } else {
            valid = false;
        }
        if (!(valid)) {
            nsCore.showAlert(message);
        }
        return valid;
    }
    function getPossVoyages() {
        var showPrevious = findPrevVoyVal(), ajUrl, bookingId = ''
        if (validatePossVoyages(showPrevious, "Y")) {
            bookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting').attr(
                'data-bookingid');
            if (!bookingId) {
                bookingId = '0';
            }
            if (!(nsCore.getPage(window.location.href) === 'booking')) {
                $('#routeDetailGrid tbody tr').each(
                    function() {
                        var routeVesselVoyage = '', routeConsType = '', isMainLeg = $(this).find('.mainLeg').is(
                            ':checked');
                        if (isMainLeg) {
                            routeVesselVoyage = $(this).find('.consignmentLegsClass').attr('data-vesselvoyage');
                            routeConsType = $(this).find('.consignmentLegsClass').attr('data-constype');
                            if (!nsDoc.existingRouteData.currentConsType
                                && !nsDoc.existingRouteData.existingVesselVoyage) {
                                nsDoc.existingRouteData.currentConsType = routeConsType;
                                nsDoc.existingRouteData.existingVesselVoyage = routeVesselVoyage;
                            }
                        }
                    })
            }
            if(nsBookDoc.existingRouteDetails.vesVoy.length===0){
            	nsBookDoc.existingRouteDetails.vesVoy=[];
            	nsBookDoc.existingRouteDetails.addEdit=[];
            	nsBookDoc.existingRouteDetails.oldLoadPort=[];
            	nsBookDoc.existingRouteDetails.oldDisPort=[];
            	nsBookDoc.existingRouteDetails.oldETA=[];
                nsBookDoc.existingRouteDetails.oldETD=[];
            	$('#routeDetailGrid tbody tr').each(
                function(i, v) {
                	nsBookDoc.existingRouteDetails.vesVoy[i] = ($(this).find('.consignmentLegsClass').attr('data-vesselvoyage') && $(this).find('.consignmentLegsClass').attr('data-vesselvoyage')!=="null")?$(this).find('.consignmentLegsClass').attr('data-vesselvoyage'):"";
                	nsBookDoc.existingRouteDetails.oldLoadPort[i] = ($(this).find('.consignmentLegsClass').attr('data-loadport') && $(this).find('.consignmentLegsClass').attr('data-loadport')!=="null")?$(this).find('.consignmentLegsClass').attr('data-loadport'):"";
                	nsBookDoc.existingRouteDetails.oldDisPort[i] = ($(this).find('.consignmentLegsClass').attr('data-discport') && $(this).find('.consignmentLegsClass').attr('data-discport')!=="null")?$(this).find('.consignmentLegsClass').attr('data-discport'):"";
                	if(nsCore.appModel.viewSubBooking.consignmentLegModelList && nsCore.appModel.viewSubBooking.consignmentLegModelList.length!==0){
	                	if(nsDoc){
	                		nsBookDoc.existingRouteDetails.oldETA[i] = nsCore.appModel.viewSubBooking.consignmentLegModelList[i].estimatedArrival?nsCore.appModel.viewSubBooking.consignmentLegModelList[i].estimatedArrival.split(" ")[0]:"";
	                		nsBookDoc.existingRouteDetails.oldETD[i] = nsCore.appModel.viewSubBooking.consignmentLegModelList[i].estimatedDeparture?nsCore.appModel.viewSubBooking.consignmentLegModelList[i].estimatedDeparture.split(" ")[0]:"";
	                	}else{
	                		nsBookDoc.existingRouteDetails.oldETA[i] = nsCore.appModel.viewSubBooking.consignmentLegModelList[i].portEstimatedArrival?nsCore.appModel.viewSubBooking.consignmentLegModelList[i].portEstimatedArrival.split(" ")[0]:"";
	                		nsBookDoc.existingRouteDetails.oldETD[i] = nsCore.appModel.viewSubBooking.consignmentLegModelList[i].portEstimatedDeparture?nsCore.appModel.viewSubBooking.consignmentLegModelList[i].portEstimatedDeparture.split(" ")[0]:"";
	                	}
                	}
                	//nsBookDoc.existingRouteDetails.addEdit[i] = nsCore.appModel.fetchBOLInfo.subBookingModelList[0].consignmentLegModelList[i].actionList
                })
            }
            nsBookDoc.existingRouteDetails.legCount = nsBookDoc.existingRouteDetails.vesVoy.length;
            ajUrl = '/Vms/booking/possibleVoyages?originPort='
                + $('#mainBookDetailCustomerOrigin').val()
                + '&destinationPort='
                + $('#mainBookDetailCustomerDestination').val()
                + '&showPreviousVoyage='
                + showPrevious
                + '&compId='
                + ($('.thrdLevel.activeSubBook.ui-selecting').length === 0 ? nsBookDoc.getBookingDocValues($(
                    '#maincustomerID').val(), $('#mainCustomerID').val()) : $('.subBookLevel #maincustomerID').val())
                + '&dateFormat=' + dateFormat + '&timeFormat=' + timeFormat + '&possibleVoyageClicked=Y&bookID='
                + bookingId;
            voyageContentHelper(ajUrl);
            if (nsCore.getPage(window.location.href) === 'booking') {
                nsBooking.setNoVoyageData();
            } else {
                nsBookDoc.setNoVoyageData();
            }
        }
    }
    function findPrevVoyVal() {
        if ($('.showPrevVoyages').is(':checked')) {
            return 'Y';
        } else {
            return 'N';
        }
    }
    function voyageContentHelper(ajUrl) {
        $('.preloaderWrapper').show();
        vmsService.vmsApiService(function(response) {
            $('.preloaderWrapper').hide();
            var extractedLegs = []
            if (response) {
                if (response.routeModelList) {
                    $.each(response.routeModelList, function(j, leg) {
                        if (leg.count > 1) {
                            var obj1 = nsBookDoc.fetchLegInstance(leg, "tot");
                            obj1.count = leg.count;
                            extractedLegs.push(obj1);
                        }
                        for (var k = 0; k < leg.count; k++) {
                            var obj = nsBookDoc.fetchLegInstance(leg, k + 1);
                            if ((leg.count <= 1) && k == 0) {
                                obj.count = leg.count;
                            } else {
                                obj.count = "";
                            }
                            extractedLegs.push(obj);
                        }
                    });
                    extractedLegs.push(getNoVoyage());
                    setVoyageContent(extractedLegs);
                    $('#possibleVoyagePopup').dialog('open');
                    $('#possibleVoyagesGrid').show()
                }
            } else {
                $('.preloaderWrapper').hide();
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, ajUrl, 'GET', null);
    }
    function getNoVoyage() {
        return {
            'count' : '',
            'sourcePortCallID' : '',
            'discPortCallID' : '',
            'vesselId' : '',
            'legType' : 'M',
            'vesselVoyage' : 'No Voyage',
            'trade' : '',
            'loadPort' : $('#mainBookDetailCustomerOrigin').val(),
            'discPort' : $('#mainBookDetailCustomerDestination').val(),
            'eta' : '',
            'etd' : '',
            'allocationForCar' : '',
            'allocationForPU' : '',
            'allocationForHH' : '',
            'allocationForST' : ''
        };
    }
    function possibleVoyageinit() {
        var bookingOrBill = (nsCore.getPage(window.location.href) === 'booking') ? 'Booking: ' : 'B/L number: '
    	if(nsBookDoc.selectePossibleVoyage.length!==0){
            nsBookDoc.prevSelectedPossibleVoyages=nsBookDoc.selectePossibleVoyage
        }else{
            nsBookDoc.prevSelectedPossibleVoyages=[]
        }
        nsBookDoc.selectePossibleVoyage = [];
        if (findPrevVoyVal() === 'Y') {
            $('.showPrevVoyages').trigger('click')
        }
        $('#possibleVoyagesGrid').hide()
        $('.dataCustomer').html(
            $('#mainBookDetailCustomerCode').val() + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                + $('#mainBookDetailCustomerDesc').val())
        $('.dataContract').html($('#mainContract').val())
        $('.dataCustomerRef').html($('#mCustomerRef').val())
        $('.dataOrgin').html($('#mainBookDetailCustomerOrigin').val())
        $('.dataDestination').html($('#mainBookDetailCustomerDestination').val())
        $('.dataOrginDesc').html($('#mainBookDetailCustomerOriginDesc').val())
        $('.dataDestinationDesc').html($('#mainBookDetailCustomerDestinationDesc').val())
        if (nsBookDoc.appScreenShowing !== "newBooking") {
            $('.possibleVoyagesForm .bookingTitle').html(bookingOrBill + $('#mainBookDetailTitleeVal').text())
            $('.possibleVoyagesForm .subBookingTitle').html($('.mainSubBookFormTitle').text())
        } else {
            $('.possibleVoyagesForm .bookingTitle').html('New Booking')
            $('.possibleVoyagesForm .subBookingTitle').html('New Sub Booking')
        }
        if ($('.subBookingDimensionsInfoWrapper').css('display') === 'none'
            || nsBookDoc.appScreenShowing === "newBooking") {
            $('.spossibleVoyages').hide();
            $('.possibleVoyages').css('width', '1000px');
            $('.possibleVoyages').css('display', 'block')
            $('.pvTabB').show();
        } else {
            $('.spossibleVoyages').show();
            $('.possibleVoyages').css('width', '480px');
            $('.possibleVoyages').css('display', 'inline-block')
            $('.pvTabB').hide();
        }
        getPossVoyages();
        $('#possibleVoyagesGrid').DataTable().clear().draw();
        $('.possibleVoyageCanBtn, .possibleVoyagePopCls').click(function() {
            nsBookDoc.selectePossibleVoyage = [];
            if (nsDoc) {
                nsDoc.existingRouteData.selectedVesselVoyage = nsDoc.existingRouteData.existingVesselVoyage;
            }
            if(nsBookDoc.prevSelectedPossibleVoyages.length!==0){
                nsBookDoc.selectePossibleVoyage=nsBookDoc.prevSelectedPossibleVoyages
            }
            $('#possibleVoyagePopup').dialog('close')
        });
    }
    function setVoyageContent(response) {
        var possibleVoyageDataTable = $('#possibleVoyagesGrid');
        if ($.fn.DataTable.fnIsDataTable(possibleVoyageDataTable)) {
            var ott = TableTools.fnGetInstance('#possibleVoyagesGrid');
            if (typeof ott !== 'undefined' && ott !== null) {
                ott.fnSelectNone();
            }
            $('#possibleVoyagesGrid').dataTable().api().destroy();
        }
        var curRow = 0;
        var rowColor = "even";
        var firstRoutelegCount = 0;
        var voyageCount = 0, voyageIndex = 0
        hiddenInput = "";
        $('#possibleVoyagesGrid')
            .DataTable(
                {
                    'processing' : true,
                    'serverSide' : false,
                    'bFilter' : true,
                    'tabIndex' : -1,
                    'bSort' : false,
                    'paging' : false,
                    'ordering' : false,
                    'info' : false,
                    'searching' : false,
                    'dom' : 'rti',
                    'aaData' : response,
                    fnInitComplete : function() {
                    /*
                     * There is no operation performed on fnInitComplete
                     * function
                     */
                    },
                    'bAutoWidth' : false,
                    'columns' : [
                        {
                            sWidth : '12px',
                            className : "alignCenter",
                            data : function(data, type) {
                                if (data.count !== '' || data.vesselVoyage === "No Voyage") {
                                    return '<input type="radio" name="possibleVoyageList">'
                                }
                                return ""
                            }
                        },
                        {
                            sWidth : '14px',
                            className : "alignRight",
                            data : 'count',
                        },
                        {
                            sWidth : '33px',
                            className : "alignVesselVoyage",
                            data : function(data, type) {
                                var vesselCodesIndex = JSON.parse(localStorage.getItem('vesselCodes')).indexOf(
                                    data.vesselVoyage.split("/")[0])
                                var vesselNames = JSON.parse(localStorage.getItem('vesselNames'))[vesselCodesIndex]
                                if (data.vesselVoyage != null && data.vesselVoyage !== ""
                                    && data.vesselVoyage !== "No Voyage") {
                                    return '<span class="vesselSpan" title="' + vesselNames + '">'
                                        + data.vesselVoyage.split("/")[0] + '</span>' + data.vesselVoyage.split("/")[1]
                                }
                                if (data.vesselVoyage === "No Voyage") {
                                    return data.vesselVoyage;
                                }
                                return "";
                            }
                        }, {
                            sWidth : '20px',
                            className : "alignLeft",
                            data : 'trade',
                        }, {
                            sWidth : '24px',
                            className : "alignLeft",
                            data : 'loadPort',
                        }, {
                            sWidth : '20px',
                            className : "alignLeft",
                            data : 'etd',
                        }, {
                            sWidth : '28px',
                            className : "alignLeft",
                            data : 'discPort',
                        }, {
                            sWidth : '20px',
                            className : "alignLeft",
                            data : 'eta',
                        }, {
                            sWidth : '18px',
                            className : "alignRight",
                            data : 'allocationForCar',
                        }, {
                            sWidth : '25px',
                            className : "alignRight",
                            data : 'allocationForPU',
                        }, {
                            sWidth : '26px',
                            className : "alignRight",
                            data : 'allocationForHH',
                        }, {
                            sWidth : '18px',
                            className : "alignRight",
                            data : 'allocationForST',
                        }, {
                            sWidth : '1px',
                            data : '',
                            defaultContent : ''
                        }
                    ],
                    'fnRowCallback' : function(nRow, aData, iDisplayIndex) {
                        $(nRow).attr('data-sourceportcallid', aData.sourcePortCallID);
                        $(nRow).attr('data-discportcallid', aData.discPortCallID);
                        $(nRow).attr('data-vesselid', aData.vesselId);
                        $(nRow).attr('data-legtype', aData.legType);
                        $(nRow).attr('data-vesselvoyage', aData.vesselVoyage);
                        $(nRow).attr('data-voyageid', aData.voyageId);
                        if (aData.vesselVoyage !== 'No Voyage' && aData.vesselVoyage !== '') {
                            $(nRow).attr('data-firm', 'Y');
                        } else {
                            $(nRow).attr('data-firm', 'N');
                        }
                        if ($('#currentLoadPortCallVoyId').val() && $('#currentLoadPortCallVoyId').val() === aData.voyageId) {
                            $(nRow).find("input:radio").attr('checked', true);
                            $(nRow).find("input:radio").trigger("click");
                        }
                        if (aData.count === "" && aData.vesselVoyage !== "No Voyage") {
                            $(nRow).attr('id', 'subRow_' + iDisplayIndex + '_' + curRow);
                            $(nRow).addClass("subRows");
                            $(nRow).hide();
                            voyageIndex++;
                        } else {
                            voyageCount++;
                            voyageIndex = 0
                            curRow = iDisplayIndex;
                            $(nRow).attr('id', 'row_' + iDisplayIndex + '_' + aData.count);
                            $(nRow).addClass("rows");
                            $(nRow).removeClass('even');
                            $(nRow).removeClass('odd');
                            $(nRow).addClass(rowColor);
                            if (rowColor === 'even') {
                                rowColor = 'odd'
                            } else {
                                rowColor = 'even'
                            }
                            $(nRow).find("input:radio").click(function() {
                                $('[name="possibleVoyageList"]').parent().parent().removeClass('bgHiglight');
                                expandRow(this);
                                seliDisplayIndex = this.parentNode.parentNode.id.split("_")[1];
                                $(this).parent().parent().addClass('bgHiglight');
                                if (nsCore.getPage(window.location.href) === 'booking') {
                                    nsBooking.rteChanged(this);
                                } else {
                                    nsBookDoc.rteChanged(this);
                                }
                            });
                            if (iDisplayIndex === 0) {
                                firstRoutelegCount = nRow.id.split("_")[2];
                                if (!($(nRow).find("input:radio").is(':checked'))) {
                                    $(nRow).find("input:radio").attr('checked', true);
                                }
                                $(nRow).attr('style', 'background-color:#e0e0e0 !important');
                            }
                            if (iDisplayIndex === firstRoutelegCount - 1
                                || (iDisplayIndex === 0 && !firstRoutelegCount)) {
                                if (!$(nRow).find("input:radio").is(':checked')) {
                                    $(nRow).find("input:radio").trigger("click");
                                }
                            }
                            $(nRow).mouseover(function() {
                                $(nRow).attr('style', 'background-color:#e0e0e0 !important');
                            });
                            $(nRow).mouseout(function() {
                                $(nRow).removeAttr("style");
                            });
                        }
                        if (aData.vesselVoyage === "No Voyage") {
                            hiddenInput += '<input type="hidden" class="PosVoyTemp selectedPosVo" name="selectPossibleVoyage" id="selectPossibleVoyage'
                                + iDisplayIndex + '" value= "No Voyage">'
                            $(nRow).find('td:eq(4)').html("<p>" + aData.loadPort + "</p>");
                            $(nRow).find('td:eq(4) p').css('visibility', 'hidden');
                            $(nRow).find('td:eq(6)').html("<p>" + aData.discPort + "</p>");
                            $(nRow).find('td:eq(6) p').css('visibility', 'hidden');
                        } else {
                            if (aData.legType === 'M') {
                                var car = aData.allocationForCar === "---" ? "0" : aData.allocationForCar;
                                var pu = aData.allocationForPU === "---" ? "0" : aData.allocationForPU
                                var hh = aData.allocationForHH === "---" ? "0" : aData.allocationForHH
                                var st = aData.allocationForST === "---" ? "0" : aData.allocationForST
                                hiddenInput += '<input type="hidden" class="PosVoyTemp selectedPosVo" name="selectPossibleVoyage" id="selectPossibleVoyage'
                                    + iDisplayIndex
                                    + '" value="'
                                    + aData.trade
                                    + "-"
                                    + aData.loadPort
                                    + "-"
                                    + aData.discPort + "-" + car + "-" + pu + "-" + hh + "-" + st + '">'
                            }
                        }
                        if (aData.vesselVoyage !== "No Voyage") {
                            hiddenInput += '<input type="hidden" class="PosVoyTemp" name="sourcePortCallID'
                                + voyageCount + '" id="sourcePortCallID' + voyageIndex + '" value="'
                                + aData.sourcePortCallID + '">'
                            hiddenInput += '<input type="hidden" class="PosVoyTemp" name="destinationPortCallID'
                                + voyageCount + '" id="destinationPortCallID' + voyageIndex + '" value="'
                                + aData.discPortCallID + '">'
                            hiddenInput += '<input type="hidden" class="PosVoyTemp" name="vesselId' + voyageCount
                                + '" id="vesselId' + voyageIndex + '" value="' + aData.vesselId + '">'
                            hiddenInput += '<input type="hidden" class="PosVoyTemp" name="transhipmentType'
                                + (voyageIndex + 1) + '" id="transhipmentType' + (voyageIndex + 1) + '" value="'
                                + aData.legType + '">'
                        }
                    }
                });
        $(
            '#possibleVoyagesGrid td.alignRight:not(td:nth-child(2)), #possibleVoyagesGrid th.alignRight:not(th:nth-child(2))')
            .addClass('backGroundShade');        
        $('[name=possibleVoyageList]:checked').trigger('click')
    }
    function fetchLegInstance(leg, i) {
        var etaDateOnly = '';
        var etdDateOnly = '';
        if (i === "tot" && leg.count === 2) {
            etaDateOnly = (leg.etaOnCarriage).split(" ")[0];
            etdDateOnly = (leg.etdPreCarriage).split(" ")[0];
            return {
                'sourcePortCallID' : '',
                'discPortCallID' : '',
                'vesselId' : '',
                'voyageId' : '',
                'legType' : '',
                'vesselVoyage' : '',
                'trade' : '',
                'loadPort' : leg.loadPortPreCarriage,
                'discPort' : leg.discPortOnCarriage,
                'eta' : etaDateOnly,
                'etd' : etdDateOnly,
                'allocationForCar' : '',
                'allocationForPU' : '',
                'allocationForHH' : '',
                'allocationForST' : ''
            };
        } else if (i === "tot" && leg.count === 3) {
            etaDateOnly = (leg.etaMainLeg).split(" ")[0];
            etdDateOnly = (leg.etdPreCarriage).split(" ")[0];
            return {
                'sourcePortCallID' : '',
                'discPortCallID' : '',
                'vesselId' : '',
                'voyageId' : '',
                'legType' : '',
                'vesselVoyage' : '',
                'trade' : '',
                'loadPort' : leg.loadPortPreCarriage,
                'discPort' : leg.discPortMainLeg,
                'eta' : etaDateOnly,
                'etd' : etdDateOnly,
                'allocationForCar' : '',
                'allocationForPU' : '',
                'allocationForHH' : '',
                'allocationForST' : ''
            };
        }
        if (i === 1) {
            etaDateOnly = (leg.etaPreCarriage).split(" ")[0];
            etdDateOnly = (leg.etdPreCarriage).split(" ")[0];
            return {
                'sourcePortCallID' : leg.sourcePortCallIDPreCarriage,
                'discPortCallID' : leg.discPortCallIDPreCarriage,
                'vesselId' : leg.vesselIdPreCarriage,
                'voyageId' : leg.voyageIdPreCarriage,
                'legType' : leg.legTypePreCarriage,
                'vesselVoyage' : leg.vesselVoyagePreCarriage,
                'trade' : leg.tradePreCarriage,
                'loadPort' : leg.loadPortPreCarriage,
                'discPort' : leg.discPortPreCarriage,
                'eta' : etaDateOnly,
                'etd' : etdDateOnly,
                'allocationForCar' : leg.allocationForCarPreCarriage,
                'allocationForPU' : leg.allocationForPUPreCarriage,
                'allocationForHH' : leg.allocationForHHPreCarriage,
                'allocationForST' : leg.allocationForSTPreCarriage
            };
        } else if (i === 2) {
            etaDateOnly = (leg.etaOnCarriage).split(" ")[0];
            etdDateOnly = (leg.etdOnCarriage).split(" ")[0];
            return {
                'sourcePortCallID' : leg.sourcePortCallIDOnCarriage,
                'discPortCallID' : leg.discPortCallIDOnCarriage,
                'vesselId' : leg.vesselIdOnCarriage,
                'voyageId' : leg.voyageIdOnCarriage,
                'legType' : leg.legTypeOnCarriage,
                'vesselVoyage' : leg.vesselVoyageOnCarriage,
                'trade' : leg.tradeOnCarriage,
                'loadPort' : leg.loadPortOnCarriage,
                'discPort' : leg.discPortOnCarriage,
                'eta' : etaDateOnly,
                'etd' : etdDateOnly,
                'allocationForCar' : leg.allocationForCarOnCarriage,
                'allocationForPU' : leg.allocationForPUOnCarriage,
                'allocationForHH' : leg.allocationForHHOnCarriage,
                'allocationForST' : leg.allocationForSTOnCarriage
            };
        } else {
            etaDateOnly = (leg.etaMainLeg).split(" ")[0];
            etdDateOnly = (leg.etdMainLeg).split(" ")[0];
            return {
                'sourcePortCallID' : leg.sourcePortCallIDMainLeg,
                'discPortCallID' : leg.discPortCallIDMainLeg,
                'vesselId' : leg.voyageIdMainLeg,
                'voyageId' : leg.voyageIdMainCarriage,
                'legType' : leg.legTypeMainLeg,
                'vesselVoyage' : leg.vesselVoyageMainLeg,
                'trade' : leg.tradeMainLeg,
                'loadPort' : leg.loadPortMainLeg,
                'discPort' : leg.discPortMainLeg,
                'eta' : etaDateOnly,
                'etd' : etdDateOnly,
                'allocationForCar' : leg.allocationForCarMainLeg,
                'allocationForPU' : leg.allocationForPUMainLeg,
                'allocationForHH' : leg.allocationForHHMainLeg,
                'allocationForST' : leg.allocationForSTMainLeg
            };
        }
    }
    function expandRow(selRow) {
        var id = selRow.parentNode.parentNode.id, totSubRows = id.split("_")[2], selectedRow, rowIndex = id.split("_")[1], indexI = 1;
        nsBookDoc.selectePossibleVoyage = [];
        $('.subRows').hide();
        $('.rows td').removeClass("selRow");
        $('#row_' + rowIndex + '_' + totSubRows + " td").addClass('selRow');
        var posVoyage = [], loadPortCodesIndex, discPortCodesIndex, consNo = parseInt($('#routeDetailGrid tbody tr')
            .find('.selectedRoute:first-child').attr('data-consno'));
        selectedRow = selRow.parentNode.parentNode;
        if (totSubRows === "1" || totSubRows === "") {
            var lp = selectedRow.cells[4].innerHTML;
            var firstIndex = lp.indexOf(">");
            var lastIndex = lp.lastIndexOf("</p>");
            lp = lp.substring(firstIndex + 1, lastIndex);
            var dp = selectedRow.cells[6].innerHTML;
            var dfirstIndex = dp.indexOf(">");
            var dlastIndex = dp.lastIndexOf("</p>");
            dp = dp.substring(dfirstIndex + 1, dlastIndex);
            if (totSubRows === "" && (lastIndex !== -1 && dlastIndex !== -1)) {
                posVoyage.loadPortCode = lp;
                posVoyage.discPortCode = dp;
            } else {
                posVoyage.loadPortCode = selectedRow.cells[4].innerHTML;
                posVoyage.discPortCode = selectedRow.cells[6].innerHTML;
            }
            posVoyage.sourcePortCallID = selectedRow.dataset.sourceportcallid;
            posVoyage.destinationPortCallID = selectedRow.dataset.discportcallid;
            posVoyage.vesselVoyage = selectedRow.dataset.vesselvoyage;
            posVoyage.trade = posVoyage.tradeCode = selectedRow.cells[3].innerHTML;
            posVoyage.cars = selectedRow.cells[8].innerHTML;
            posVoyage.pickups = selectedRow.cells[9].innerHTML;
            posVoyage.highHeavy = selectedRow.cells[10].innerHTML;
            posVoyage.statics = selectedRow.cells[11].innerHTML;
            posVoyage.vesselId = selectedRow.dataset.vesselid;
            posVoyage.loadVoyageId = selectedRow.dataset.voyageid?selectedRow.dataset.voyageid:"";
            posVoyage.legType = posVoyage.consignmentType = selectedRow.dataset.legtype;
            posVoyage.portEstimatedDeparture = selectedRow.cells[5].innerHTML;
            posVoyage.portEstimatedArrival = selectedRow.cells[7].innerHTML;
            posVoyage.estimatedDeparture = selectedRow.cells[5].innerHTML;
            posVoyage.estimatedArrival = selectedRow.cells[7].innerHTML;
            posVoyage.firm = selectedRow.dataset.firm;
            posVoyage.bookedUnits = $('#totalBookedUnits').val();
            posVoyage.wayCargo = "";
            posVoyage.actionList = [
                "add", "edit"
            ];
            if (nsBookDoc.consignLegList.length !== 0) {
                if (totSubRows === "" && (lastIndex !== -1 && dlastIndex !== -1)) {
                    nsBookDoc.consignLegList[0].loadPortCode = lp;
                    nsBookDoc.consignLegList[0].discPortCode = dp;
                } else {
                    nsBookDoc.consignLegList[0].loadPortCode = selectedRow.cells[4].innerHTML;
                    nsBookDoc.consignLegList[0].discPortCode = selectedRow.cells[6].innerHTML;
                }
                nsBookDoc.consignLegList[0].sourcePortCallID = selectedRow.dataset.sourceportcallid
                nsBookDoc.consignLegList[0].destinationPortCallID = selectedRow.dataset.discportcallid
                nsBookDoc.consignLegList[0].vesselVoyage = selectedRow.dataset.vesselvoyage
                nsBookDoc.consignLegList[0].tradeCode = selectedRow.cells[3].innerHTML;
                nsBookDoc.consignLegList[0].cars = selectedRow.cells[8].innerHTML;
                nsBookDoc.consignLegList[0].pickups = selectedRow.cells[9].innerHTML;
                nsBookDoc.consignLegList[0].highHeavy = selectedRow.cells[10].innerHTML;
                nsBookDoc.consignLegList[0].statics = selectedRow.cells[11].innerHTML;
                nsBookDoc.consignLegList[0].vesselId = selectedRow.dataset.vesselid
                nsBookDoc.consignLegList[0].loadVoyageId = selectedRow.dataset.voyageid?selectedRow.dataset.voyageid:"";
                nsBookDoc.consignLegList[0].consignmentType = selectedRow.dataset.legtype
                nsBookDoc.consignLegList[0].portEstimatedDeparture = nsBookDoc.consignLegList[0].estimatedDeparture = selectedRow.cells[5].innerHTML;
                nsBookDoc.consignLegList[0].portEstimatedArrival = nsBookDoc.consignLegList[0].estimatedArrival = selectedRow.cells[7].innerHTML;
                loadPortCodesIndex = JSON.parse(localStorage.getItem('portCodes')).indexOf(
                    nsBookDoc.consignLegList[0].loadPortCode)
                nsBookDoc.consignLegList[0].loadPortName = JSON.parse(localStorage.getItem('portNames'))[loadPortCodesIndex]
                discPortCodesIndex = JSON.parse(localStorage.getItem('portCodes')).indexOf(
                    nsBookDoc.consignLegList[0].discPortCode)
                nsBookDoc.consignLegList[0].discPortName = JSON.parse(localStorage.getItem('portNames'))[discPortCodesIndex]
                nsBookDoc.consignLegList[0].firm = selectedRow.dataset.firm
                posVoyage.firm = selectedRow.dataset.firm;
                nsBookDoc.consignLegList[0].bookedUnits = $('#totalBookedUnits').val();
                nsBookDoc.consignLegList[0].consignmentNo = consNo;
            }
            nsBookDoc.selectePossibleVoyage.push(posVoyage);
        }
        if (totSubRows > 1) {
            var childRow = selectedRow.nextSibling;
            for (var i = 1; i <= totSubRows; i++) {
                var curRowIndex = Number(rowIndex) + i;
                $('#subRow_' + curRowIndex + '_' + rowIndex).attr('style', 'background-color:#e0e0e0!important')
                $('#subRow_' + curRowIndex + '_' + rowIndex).show();
                posVoyage = [];
                posVoyage.loadPortCode = childRow.cells[4].innerHTML;
                posVoyage.discPortCode = childRow.cells[6].innerHTML;
                posVoyage.sourcePortCallID = childRow.dataset.sourceportcallid;
                posVoyage.destinationPortCallID = childRow.dataset.discportcallid;
                posVoyage.vesselVoyage = childRow.dataset.vesselvoyage
                posVoyage.trade = posVoyage.tradeCode = childRow.cells[3].innerHTML;
                posVoyage.cars = childRow.cells[8].innerHTML;
                posVoyage.pickups = childRow.cells[9].innerHTML;
                posVoyage.highHeavy = childRow.cells[10].innerHTML;
                posVoyage.statics = childRow.cells[11].innerHTML;
                posVoyage.vesselId = childRow.dataset.vesselid;
                posVoyage.loadVoyageId = childRow.dataset.voyageid?childRow.dataset.voyageid:"";
                posVoyage.legType = posVoyage.consignmentType = childRow.dataset.legtype;
                posVoyage.portEstimatedDeparture = childRow.cells[5].innerHTML;
                posVoyage.portEstimatedArrival = childRow.cells[7].innerHTML;
                posVoyage.firm = childRow.dataset.firm;
                posVoyage.wayCargo = "";
                posVoyage.bookedUnits = $('#totalBookedUnits').val();
                posVoyage.actionList = [
                    "add", "edit"
                ];
                if (nsBookDoc.consignLegList.length !== 0) {
                    if (i >= nsBookDoc.consignLegList.length) {
                        var nxtConsignLeg = jQuery.extend(true, {}, nsBookDoc.consignLegList[i - 1]);
                        nsBookDoc.consignLegList.push(nxtConsignLeg)
                    }
                    nsBookDoc.consignLegList[i].loadPortCode = childRow.cells[4].innerHTML;
                    nsBookDoc.consignLegList[i].discPortCode = childRow.cells[6].innerHTML;
                    nsBookDoc.consignLegList[i].sourcePortCallID = childRow.dataset.sourceportcallid
                    nsBookDoc.consignLegList[i].destinationPortCallID = childRow.dataset.discportcallid
                    nsBookDoc.consignLegList[i].vesselVoyage = childRow.dataset.vesselvoyage
                    nsBookDoc.consignLegList[i].tradeCode = childRow.cells[3].innerHTML;
                    nsBookDoc.consignLegList[i].cars = childRow.cells[8].innerHTML;
                    nsBookDoc.consignLegList[i].pickups = childRow.cells[9].innerHTML;
                    nsBookDoc.consignLegList[i].highHeavy = childRow.cells[10].innerHTML;
                    nsBookDoc.consignLegList[i].statics = childRow.cells[11].innerHTML;
                    nsBookDoc.consignLegList[i].vesselId = childRow.dataset.vesselid
                    nsBookDoc.consignLegList[i].loadVoyageId = childRow.dataset.voyageid?childRow.dataset.voyageid:"";
                    nsBookDoc.consignLegList[i].consignmentType = childRow.dataset.legtype
                    nsBookDoc.consignLegList[i].portEstimatedDeparture = nsBookDoc.consignLegList[i].estimatedDeparture = childRow.cells[5].innerHTML;
                    nsBookDoc.consignLegList[i].portEstimatedArrival = nsBookDoc.consignLegList[i].estimatedArrival = childRow.cells[7].innerHTML;
                    loadPortCodesIndex = JSON.parse(localStorage.getItem('portCodes')).indexOf(
                        nsBookDoc.consignLegList[i].loadPortCode)
                    nsBookDoc.consignLegList[i].loadPortName = JSON.parse(localStorage.getItem('portNames'))[loadPortCodesIndex]
                    discPortCodesIndex = JSON.parse(localStorage.getItem('portCodes')).indexOf(
                        nsBookDoc.consignLegList[i].discPortCode)
                    nsBookDoc.consignLegList[i].discPortName = JSON.parse(localStorage.getItem('portNames'))[discPortCodesIndex]
                    nsBookDoc.consignLegList[i].firm = childRow.dataset.firm;
                    nsBookDoc.consignLegList[i].bookedUnits = $('#totalBookedUnits').val();
                    nsBookDoc.consignLegList[i].consignmentNo = consNo + i - 1;
                }
                nsBookDoc.selectePossibleVoyage.push(posVoyage);
                childRow = childRow.nextSibling;
                indexI++;
            }
        }
        tempConsignmentLeg = [];
        if (totSubRows > 1) {
            for (var j = 1; j < indexI; j++) {
                tempConsignmentLeg.push(nsBookDoc.consignLegList[j]);
            }
        } else {
            tempConsignmentLeg.push(nsBookDoc.consignLegList[0]);
        }
    }
    posVoyObj = {
        'possibleVoyageinit' : possibleVoyageinit,
        'selectePossibleVoyage' : [],
        'consignLegList' : [],
        'fetchLegInstance' : fetchLegInstance,
        'isGetPossibleVoyageDiffSaveData' :isGetPossibleVoyageDiffSaveData,
        'newLegFlag' : 'N',
        'prevSelectedPossibleVoyages':[]
    };
    $.extend(true, nsBookDoc, posVoyObj);
})(this.possibleVoyage, jQuery, this.vmsService, this.core, this.booking, this.bookDoc, this.doc);
