/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {

    var freshBookUtilObj = {
        'isdirtyFlag': false,
        'bookingobj': '',
        'mainRoutekey': '',
        'fmainTrade': '',
        'fmainSrcPort': '',
        'fmaindestPort': '',
        'fcarReAvl': 0,
        'fpuReAvl': 0,
        'fhhReAvl': 0,
        'fstReAvl': 0,
        'fnoVoyage': false,
        'mainFreshBookSubmit': mainFreshBookSubmit,
        'isMoreThanMaxWeight': isMoreThanMaxWeight,
        'isMoreThanMaxHeight': isMoreThanMaxHeight,
        'fheightChanged': fheightChanged,
        'fweightChanged': fweightChanged,
        'clearTrashipmentFields': clearTrashipmentFields,
        'findConsignmentType': findConsignmentType,
        'constructLegsFromRouteLeg': constructLegsFromRouteLeg,
        'getCarrier': getCarrier,
        'getNoVoyageSelection': getNoVoyageSelection,
        'createBookingWithoutSearch':createBookingWithoutSearch,
        'conslegs' : []
     };

    // function to get no voyage selection
    function getNoVoyageSelection() {
        var consLegs = [],
            loadPortOrigin = {},
            destinationPortCode = {};

        if (nsBookDoc.selectePossibleVoyage.length > 0) {
            loadPortOrigin = { portCode: $('#mainBookDetailCustomerOrigin').val() },
                destinationPortCode = { portCode: $('#mainBookDetailCustomerDestination').val()};
            consLegs.push({
                loadPort: loadPortOrigin,
                destinationPort: destinationPortCode,
                loadPortCallVoyageId: '0',
                discPortCallVoyageId: '0',
                wayCargo: '',
                comment: '',
                firm: '',
                transpType: '',
                carrierName: '',
                carrierRef: '',
                estimatedArrival: '',
                departureDate: '',
                shippedOnBoard: '',
                cargoConsignmentList: null,
                portPair: null,
                id: '0',
                consignmentType: 'M'
            });
        }
        return consLegs;
    }

    // function to get carrier value
    function getCarrier() {
        var carrier = '';
        if ($('#voyageTransportationType').val() === '20') {
            carrier = $('#voyageCarrier').val();
        }
        return carrier;
    }

    // function to construct legs from route leg
    function constructLegsFromRouteLeg() {
        var consLegs = [],
            carrier = getCarrier(),
            shippedOn = nsBooking.checkBoxIsCheck('shippedOnboard'),
            equipNo = nsBooking.getDropDownSelectionValue('#cargoEquipmentNbr'),
            cargoConsignments = [],
            bookingTbl = $('#routeDetailGrid').DataTable(),
            rowData = bookingTbl.row($('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(),
            loadPortCallVoyageId = null,
            portPair = {},
            discPortCallVoyId = null,
            loadPort = {},
            destinationPort = {},
            consType = 'M',
            discPortCode = '',
            loadPortCode = '',
            loadPortCalVoyID = '',
            discPortCallVoyageId = '',
            loadPortObj = {},
            destinationPortObj = {},
            initLegType="P", legsMain=[];
        cargoConsignments.push({
            cargoOnHold: nsBooking.checkBoxIsCheck('cargoOnHold'),
            equipNo: equipNo
        }, {
            cargoOnHold: '',
            equipNo: ''
        });
        if (nsBooking.checkNotNull(rowData)) {
            loadPortCallVoyageId = rowData.loadPortCallVoyageId;
        }
        if (nsBooking.checkNotNull(rowData)) {
            discPortCallVoyId = rowData.discPortCallVoyageId;
        }
        portPair = {
            sourcePortCallID: nsBooking.textNullCheck(loadPortCallVoyageId)
        };
        $('.routeDetailGrid tbody tr').each(
                function() {
                    if($(this).find('.mainLeg').is(':checked')){
                        legsMain.push('M')
                        initLegType='O'
                    }else{
                       legsMain.push(initLegType) 
                    }
             });
        if (nsBookDoc.selectePossibleVoyage.length > 0 && nsBookDoc.selectePossibleVoyage[0].vesselVoyage!=="No Voyage") {
           if (nsBookDoc.selectePossibleVoyage.length > 0  ) {
             $.each(nsBookDoc.selectePossibleVoyage, function(j, leg) {
                    discPortCode = leg.discPortCode
                    loadPortCode = leg.loadPortCode
                    loadPortCalVoyID =leg.sourcePortCallID
                    discPortCallVoyageId =leg.destinationPortCallID
                    loadPortObj = { portCode: loadPortCode };
                    destinationPortObj = { portCode: discPortCode};
                    consLegs.push({
                        loadPort: loadPortObj,
                        destinationPort: destinationPortObj,
                        loadPortCallVoyageId: loadPortCalVoyID,
                        discPortCallVoyageId: discPortCallVoyageId,
                        wayCargo: $($('.wayCargo')[j]).is(':checked') ? 'Y' : 'N',
                        comment: $('input[name$="bookingComments"]').val(),
                        firm: ($('.allocStatusType')[j]).value,
                        transpType: $('#voyageTransportationType').val(),
                        carrierName: carrier,
                        carrierRef: $('#voyageCarrierRef').val(),
                        estimatedArrival: $('#estimatedArrival').val(),
                        departureDate: $('#estimatedDeparture').val(),
                        shippedOnBoard: shippedOn,
                        cargoConsignmentList: cargoConsignments,
                        portPair: portPair,
                        id: '0',
                        consignmentType: legsMain[j]
                    });
                    if (consType === 'M') {
                        consType = 'O';
                    }
                });
            } else {
            	consLegs = getNoVoyageSelection();
                loadPort = { portCode: '' },
                    destinationPort = { portCode: ''};
                consLegs.push({
                    loadPort: loadPort,
                    destinationPort: destinationPort,
                    loadPortCallVoyageId: loadPortCallVoyageId,
                    discPortCallVoyageId: discPortCallVoyId,
                    wayCargo: nsBooking.checkBoxIsCheck('wayCargo'),
                    comment: $('input[name$="bookingComments"]').val(),
                    firm: ($('.allocStatusType')[j]).value,
                    transpType: $('#voyageTransportationType').val(),
                    carrierName: carrier,
                    carrierRef: $('#voyageCarrierRef').val(),
                    estimatedArrival: $('#estimatedArrival').val(),
                    departureDate: $('#estimatedDeparture').val(),
                    shippedOnBoard: shippedOn,
                    cargoConsignmentList: cargoConsignments,
                    portPair: portPair,
                    id: '0',
                    consignmentType: 'O'
                });
            }
        } else {
            consLegs = getNoVoyageSelection();
        }
        return consLegs;
    }

    function findConsignmentType(isMainLeg) {
        var consType = 'M';
        $('#routeDetailGrid tbody tr').each(function() {
            if ($(this).find('.mainLeg').is(':checked')) {
                consType = 'M';
                return false;
            } else {
                if (isMainLeg) {
                    consType = 'O';
                    return false;
                } else {
                    consType = 'P';
                    return false;
                }
            }
        });
        return consType;
    }

    function clearTrashipmentFields() {
        $('#mLoadPortCode1').val('');
        $('#mLoadPortCode2').val('');
        $('#mLoadPortCode3').val('');
        $('#mDiscPortCode1').val('');
        $('#mDiscPortCode2').val('');
        $('#mDiscPortCode3').val('');
        $('#mTrade1').val('');
        $('#mTrade2').val('');
        $('#mTrade3').val('');
        $('#mSourcePortCallID1').val('');
        $('#mSourcePortCallID2').val('');
        $('#mSourcePortCallID3').val('');
        $('#mDestinationPortCallID1').val('');
        $('#mDestinationPortCallID2').val('');
        $('#mDestinationPortCallID3').val('');
        $('#mTranshipmentType1').val('');
        $('#mTranshipmentType2').val('');
        $('#mTranshipmentType3').val('');
        $('#mVesselCode1').val('');
        $('#mVesselCode2').val('');
        $('#mVesselCode3').val('');
        $('#mVoyageNumber1').val('')
        $('#mVoyageNumber2').val('')
        $('#mVoyageNumber3').val('')
    }

    function fweightChanged(element) {
        var measType = '',
            actualWeightval = '',
            weightval = '';

        if (nsBooking.fmaxWeightCapacity !== -1 && nsBooking.fmaxWeightCapacity) {
            measType = $(element).closest('tr').find('#bookedMeasureUnit').val();
            actualWeightval = $(element).val();
            weightval = actualWeightval;

            if (measType === '20') {
                weightval = actualWeightval / 1000;
            } else{
            	if (measType === '10') {
            		weightval = (actualWeightval / 2.2046) / 1000;
            	}
            }


            if (weightval > nsBooking.fmaxWeightCapacity) {
                return true;
            }
        }
        return false;
    }

    function fheightChanged(element) {
        var measType = '',
            actualHeightval = '',
            heightval = '';

        if ((nsBooking.fmaxHeightCapacity !== -1) && (nsBooking.fmaxHeightCapacity)) {
            measType = $(element).closest('tr').find('#bookedMeasureUnit').val();
            actualHeightval = $(element).val();
            heightval = actualHeightval;

            // converting the height value to metric
            if (measType === '10') {
                heightval = (actualHeightval / 39.370);
            }
            if (heightval > nsBooking.fmaxHeightCapacity) {
                return true;
            }
        }
        return false;
    }

    function isMoreThanMaxHeight(element) {
        var msg = "Cargo height exceeds vessel's max. opening height";
        if (fheightChanged(element)) {
            nsCore.showAlert(msg);
        }
    }

    function isMoreThanMaxWeight(element) {
        var msg = "Cargo weight exceeds vessel's max. ramp weight";
        if (fweightChanged(element)) {
            nsCore.showAlert(msg);
        }
    }

    function valMsgHelper(origin, originDesc, destination, destinationDesc){
    	var message = '';
    	if (!origin && !originDesc) {
    	    message += 'Origin should not be empty' + '\n';
    	} else {
    	    message += (!origin || (!originDesc && origin!=='The Sub bookings have different Origins And /Or Destinations') || $('#mainBookDetailCustomerOrigin').attr('data-form1') === '0') ? 'Enter a valid Origin \n' : '';
    	}
    	if (!destination && !destinationDesc) {
    	    message += 'Destination should not be empty' + '\n';
    	} else {
    	    message += (!destination || (!destinationDesc && destination!=='The Sub bookings have different Origins And /Or Destinations') || $('#mainBookDetailCustomerDestination').attr('data-form2') === '0') ?'Enter a valid Destination \n' : '';
    	    message += (((!$('#bookingHeaderId').val()) || (!$.trim($('#bookingHeaderId').val()))) &&
    	        nsBooking.isCopyBookingEnabled === 'Yes') ?
    	            'Please save at least one sub-booking to save this booking \n' : '';
    	}
    	return message;
    }

    function validationMessage() {
        // Do all the mandatory check.
        var customerCode = $('#mainBookDetailCustomerCode').val(),
            customerName = $('#mainBookDetailCustomerDesc').val(),
            noVoyage = '',
            message = '',
            selVoyage = false,
            loadCust = '',
            loadName = '',
            custId = '',
            contract = $('#mainContract').val(),
            origin = $('#mainBookDetailCustomerOrigin').val(),
            originDesc = $('#mainBookDetailCustomerOriginDesc').val(),
            destination = $('#mainBookDetailCustomerDestination').val(),
            destinationDesc = $('#mainBookDetailCustomerDestinationDesc').val();

        if ((!freshBookUtilObj.fnoVoyage && (freshBookUtilObj.fmainTrade))) {
            noVoyage = $('.mainNovoy').is(':checked');
            selVoyage = false;
            $('.mainselvoy').each(function() {
                selVoyage = selVoyage || $(this).is(':checked');
            });
            message += (!noVoyage && !selVoyage) ? 'Vessel/voyage should not be empty. \n' : '';
        }

        if ((!customerCode) && (!customerName)) {
            message += 'Customer should not be empty' + '\n';
        } else {
            loadCust = $('#mainBookDetailCustomerCode').attr('data-form');
            loadName = $('#mainBookDetailCustomerDesc').attr('data-form');
            custId = $('#maincustomerID').val();
            message += (loadCust === '1' || loadName === '1' || (!custId)) ? 'Enter a valid Customer \n' : '';
        }
        message += (!contract) ? 'Contract is not selected' + '\n' : '';
        message += valMsgHelper(origin, originDesc, destination, destinationDesc);
        
        if (($.trim(origin) === $.trim(destination))) {
            message += 'Origin and destination are equal. This is not a valid combination.';            
        }
        return message;
    }

    function conslegsBuildFn() {
        var isMainLeg = false,
            consignmentType = '',
            loadPort = {},
            destinationPort = {},
            loadPortCallId = '',
            discPortCallId = '',
            wayCargo = '',
            selectRow = $('#routeDetailGrid tbody tr td .selectedRoute:checked').parent().parent(),
            portPair = {};
        freshBookUtilObj.conslegs.length = 0;
        if ($('.routeDetailsWrapper').find('tr')  && nsBookDoc.selectePossibleVoyage.length > 0) {
            freshBookUtilObj.conslegs = constructLegsFromRouteLeg();
        } else {
        	if(!$(selectRow.find('td')[1]).text() && $(selectRow.find('#allocStatusType')).val() === 'Y'){
        		nsCore.showAlert('Voyage Information is missing. Save Booking as reserved and add voyage information');
        		return false;
        	}
        	if($('.selectedRoute:visible').length > 0){
	            $('#routeDetailGrid tbody tr').each(function() {
	                if ($(this).find('.mainLeg').is(':checked')) {
	                    consignmentType = 'M';
	                    isMainLeg = true;
	                } else {
	                    consignmentType = isMainLeg ? 'O' : 'P';
	                }
	                loadPort = { portCode: $(this).find('.consignmentLegsClass').attr('data-loadPort') };
	
	                destinationPort = {portCode: $(this).find('.consignmentLegsClass').attr('data-discPort')};
	
	                loadPortCallId = ($(this).find('.consignmentLegsClass').attr('data-loadPortCallVoyageId') === 'null') ? '' : $(this).find('.consignmentLegsClass').attr('data-loadPortCallVoyageId');
	
	                discPortCallId = ($(this).find('.consignmentLegsClass').attr('data-discPortCallVoyageId') === 'null') ? '' : $(this).find('.consignmentLegsClass').attr('data-discPortCallVoyageId');
	
	                wayCargo = ($(this).find('.wayCargo').is(':checked') ? 'Y' : 'N');
	                portPair = {
	                    sourcePortCallID: loadPortCallId || '0',
	                    destinationPortCallID: discPortCallId || '0'
	                };
	                freshBookUtilObj.conslegs.push({
	                    loadPort: loadPort,
	                    destinationPort: destinationPort,
	                    loadPortCallVoyageId: loadPortCallId || '0',
	                    discPortCallVoyageId: discPortCallId || '0',
	                    firm: $(this).find('.allocStatusType').val(),
	                    portPair: portPair,
	                    id: '0',
	                    consignmentType: consignmentType,
	                    wayCargo: wayCargo,
	                    timeStamp: $(this).find('.selectedRoute').attr('data-timeStamp')
	                });
	            });
        	} else {
        		$.each(nsCore.appModel.fetchBOLInfo.subBookingModelList, function(i,v){
        			freshBookUtilObj.conslegs.push({id : v.subBookingId, consList : []})
        			$.each(v.consignmentLegModelList, function(ind,val){
        				val.loadPortCallVoyageId = (val.loadPortCallVoyageId === 'null' || !val.loadPortCallVoyageId) ? '0' : val.loadPortCallVoyageId;
        				val.discPortCallVoyageId = (val.discPortCallVoyageId === 'null' || !val.discPortCallVoyageId) ? '0' : val.discPortCallVoyageId;
        				portPair = {sourcePortCallID: val.loadPortCallVoyageId,
    						destinationPortCallID: val.discPortCallVoyageId};
    					if(freshBookUtilObj.conslegs[i].id === val.consignmentId){
    						freshBookUtilObj.conslegs[i].consList.push({
        					loadPort: {portCode : (val.loadPortCode)},
    	                    destinationPort: {portCode : (val.discPortCode)},
    	                    loadPortCallVoyageId: val.loadPortCallVoyageId,
    	                    discPortCallVoyageId: val.discPortCallVoyageId,
    	                    firm: val.firm,
    	                    portPair: portPair,
    	                    id: '0',
    	                    consignmentType: val.consignmentType,
    	                    wayCargo: val.wayCargo,
    	                    timeStamp: val.timeStamp
        				})
    					}
        			});
        		})
        	}
            isMainLeg = false;
        }
        return true;
    }

    function fnAjax(formData) {
    	nsBooking.newBookId = formData.id;
        vmsService.vmsApiServiceLoad(function(response) {
        	var finCount = 0;
            if (response) {
            	if(response.indexOf('concurrency') !== -1){
            		 nsCore.showAlert('Someone else have updated the data since you retrieved the booking information');
            	} else if (response.indexOf('Update successful') !== -1) {
            		nsBookDoc.isEnableRouteDetail='Y';
            		            		nsBookDoc.isRouteDetailChanged = false;
                    nsBooking.globalBookingFlag.mainBookingFlag = false;
                    nsBooking.globalBookingFlag.mainBookingHeaderFlag = false;
                    if (!nsBookDoc.dataValid(nsBooking.fectSubBookingObj, nsBooking.fectSubBookingObj.bookingId, 'Update', nsBooking.fectSubBookingObj.bookingNumber)
        					&& nsBooking.isFreshBookingMatchingSearch()) {
                    	nsBooking.bookingHeadFlag = true;
                    	if(!($('.frstLevel').hasClass('frstLevel_dummy')) && nsCore.appModel.getSearchResultCount() > 0){
                    		$('#leftSearchMenu').trigger('submit');
                    	}
                    	else {                    		
                    		$('.scndLevel[data-bookingId='+nsBooking.fectSubBookingObj.bookingId+']').trigger('click');
                    	}
                    } else{
                    	nsBookDoc.searchParamsMatch(nsBooking.fectSubBookingObj.bookingNumber, 'Updated');
                    	finCount = parseInt($('.mainBookingListWrap .mainBookingCount').text());
                    	// 4451
                    	var scndLevel = $('.scndLevel[data-bookingid='+nsBooking.newBookId+']').attr("id")
                    	if(scndLevel.indexOf('scndLevel') >= 0){
                    		nsBooking.removeFromNavWhileDelete(scndLevel);
                    			}
                    	$('.mainBookingListWrap .subBookContentListCol .singleColItem.activeSubBook.ui-selecting').remove();
                    	$('.mainBookingListWrap .mainBookingCount').text(finCount - 1);
                    	$('.mainSubBookingListWrap,.mainBookingDetailsWrap, .mainSubBookingFormWrap').hide();
                        $('.mainBookingListWrap .SubBookingNbrsHdr').show();
                    }
                } else {	               
	                   nsCore.showAlert(response);	               
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.updateBooking, 'POST', JSON.stringify(formData));
    }

    function fnAjaxType(str) {
        vmsService.vmsApiServiceTypeDataLoad(function(data) {
            if (data) {
            	nsBooking.newBookFlag = false;
            	nsBooking.chrgRateFlag = false;
            	$('#bookId').val(data.bookingId);
            	$('#createFreshBook .mainBookingDetailFormTitle').text('Booking : ' +data.bookingNumber);
                if (!nsBookDoc.dataValid(data, data.bookingId, 'New', data.bookingNumber)
					&& nsBooking.isFreshBookingMatchingSearch()) {
                	 nsBooking.globalBookingFlag.mainBlDetailsFlag = false;
                     nsBooking.globalBookingFlag.mainBookingFlag = false;
                     nsBooking.globalBookingFlag.mainBookingHeaderFlag = false;
                     nsBooking.selectedEntity.selectedBooking = data.bookingId;
                     nsBooking.bookingNewFlag = true;
                 	nsBooking.newBookId = data.bookingId;
                	if($('.frstLevel_dummy .custCodePanel').html()==='Ungrouped Bookings' && $('.frstLevel').length===0) {
                		createBookingWithoutSearch(data)
                	}else {
                    	if($('.frstLevel').length === 0){
                    		nsBooking.loadbookingcontent(data, data.bookingId, 'New', data.bookingNumber, false);
                    	} else if($('.searchNavigation').hasClass('newSrchDiv')){
                    		nsBooking.loadbookingcontent(data, data.bookingId, 'New', data.bookingNumber, false);
                    	} else if($('.searchNavigation').hasClass('prevSrchDiv')){
                    		$('.searchNavigation').remove();
                    		$('.searchedItem').remove();
                    		$('.mainBookingCount').html('0')
                    		nsBooking.loadbookingcontent(data, data.bookingId, 'New', data.bookingNumber, false);
                    	} else{
                    		$('#leftSearchMenu').trigger('submit');
                    	}
	                    $('.mainBookingListWrap .SubBookingNbrsHdr').show();
	                    $('.accElement.routeDetailsAcc').show();
	                    freshBookUtilObj.mainRoutekey = '';
                	}
                } else {
                	if($('.frstLevel_dummy .custCodePanel').html()==='Ungrouped Bookings'){
                		nsBooking.globalBookingFlag.mainBookingFlag = false;
	                    nsBooking.globalBookingFlag.mainBookingHeaderFlag = false;
	                    if($('.frstLevel').length!==0) {
	                    	nsBookDoc.searchParamsMatch(data.bookingNumber, 'Created');
	                    	nsBookDoc.clearNewBookingNavigation()
	                    	$('.mainBookingDetailsWrap').hide();
	                    }else{
                			createBookingWithoutSearch(data)
	                    }
                	}else {
                		nsBookDoc.searchParamsMatch(data.bookingNumber, 'Created');
	                    nsBooking.globalBookingFlag.mainBookingFlag = false;
	                    nsBooking.globalBookingFlag.mainBookingHeaderFlag = false;
	                    $('.mainSubBookingListWrap,.mainBookingDetailsWrap, .mainSubBookingFormWrap').hide();
	                    $('.newBookLabel').remove();
	                    nsBookDoc.addingBottomBorderScndLevel()
	                    $('.mainBookingListWrap .SubBookingNbrsHdr').show();
                	}
                }
            } else {
            	nsCore.showAlert('Something went wrong, please contact support.');
            }
        }, $('#createFreshBook').attr('action'), 'POST', str);
    }
    function createBookingWithoutSearch(data){
    	$('.scndLevel_dummy .bookingInlineMenu').removeAttr('style')
		$('.frstLevel_dummy').toggleClass('frstLevel')
		$('.scndLevel_dummy').toggleClass('scndLevel')
		$('.frstLevel_dummy').removeClass('frstLevel_dummy');
    	$('.scndLevel_dummy').removeClass('scndLevel_dummy');
		$('.frstLevel .custCodePanel').html($('#mainBookDetailCustomerCode').val())
		nsCore.appModel.setCurNavSelection('booking',data);
		$('.scndLevel .inlinePanel').html(data.bookingNumber || data.bookNo)
		$('.scndLevel').attr('data-bookingid',data.bookingId || data.id)
		$('.scndLevel').attr('data-filtering',data.bookingNumber || data.bookNo)
		$('.expandBooking').trigger('click');
    }

    function fnSubmitHelper(formData){         	
        fnAjax(formData);
        nsBooking.mainBookingFlag.changedOriginDest = false;
        $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
        $('.mainBookingDetailsWrap #prevVoyagesMain').prop('checked', false);        
    }

    function mainFreshBookSubmit() {
	        var message = '', subBookings = [], formData = {}, str = '', isEnableRouteDetail, customerOrigin = '',
	        customerDestn = '',customerOriginDes = "",customerDestnDes = "";
	        nsBooking.lcFlag = false;
	         if (nsBookDoc.isRouteDetailChanged ) {
	             nsBookDoc.isEnableRouteDetail = 'N';
	          } else {
	              nsBookDoc.isEnableRouteDetail = 'Y';
	          } 
		// added for 4566
		isEnableRouteDetail = nsBookDoc.isEnableRouteDetail;
		
        if (nsBooking.globalBookingFlag.mainBookingFlag && nsBooking.globalBookingFlag.mainBlDetailsFlag) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
            return false;
        }
        message = validationMessage();
        
        message += nsBooking.getRouteValidation("Y");
        if (!message.trim()) {
            if ($('.activeNavigationItem').attr('data-bookingid')) {
                if(!conslegsBuildFn()){
                	return false;
                }
                if (freshBookUtilObj.conslegs.length > 0) {
                    $.each(nsBooking.fectSubBookingObj.subBookingModelList, function(ind) {
                    	if(($('.selectedRoute:visible').length > 0)){
                	    	freshBookUtilObj.conslegs[0].id = nsBooking.fectSubBookingObj.subBookingModelList[ind].consignmentLegModelList.length > 0 ? nsBooking.fectSubBookingObj.subBookingModelList[ind].consignmentLegModelList[0].consignmentLegId : '0';
                	    } else {
                	    	freshBookUtilObj.conslegs[ind].consList[0].id = nsBooking.fectSubBookingObj.subBookingModelList[ind].consignmentLegModelList.length > 0 ? nsBooking.fectSubBookingObj.subBookingModelList[ind].consignmentLegModelList[0].consignmentLegId : '0';
                	    }
                        subBookings.push({
                            id: nsBooking.fectSubBookingObj.subBookingModelList[ind].subBookingId,
                            consignmentLegList: ($('.selectedRoute:visible').length > 0) ? freshBookUtilObj.conslegs : freshBookUtilObj.conslegs[ind].consList,
                            timeStamp: nsBooking.fectSubBookingObj.subBookingModelList[ind].timeStamp
                        });
                        if(($('.selectedRoute:visible').length === 0)) {
                        	freshBookUtilObj.conslegs[ind].consList.push({
                                loadPort: null,
                                destinationPort: null,
                                loadPortCallVoyageId: '0',
                                discPortCallVoyageId: '0',
                                firm: '',
                                portPair: null,
                                id: '00',
                                consignmentType: '',
                                wayCargo: '',
                                timeStamp: ''
                            });
                        }
                    });
                    if(($('.selectedRoute:visible').length > 0)){
	                    freshBookUtilObj.conslegs.push({
	                        loadPort: null,
	                        destinationPort: null,
	                        loadPortCallVoyageId: '0',
	                        discPortCallVoyageId: '0',
	                        firm: '',
	                        portPair: null,
	                        id: '00',
	                        consignmentType: '',
	                        wayCargo: '',
	                        timeStamp: ''
	                    });
                    }
                    subBookings.push({
                        id: '0',
                        consignmentLegList: null
                    });
                    
                    if($('#mainBookDetailCustomerOrigin').val()==="The Sub bookings have different Origins And /Or Destinations"){
                    	customerOrigin =  "";
                    	customerOriginDes = "";
                    }
                    else{
                    	customerOrigin = $('#mainBookDetailCustomerOrigin').val();
                    	customerOriginDes = $('#mainBookDetailCustomerOriginDesc').val();
                    }
                    if($('#mainBookDetailCustomerDestination').val()==="The Sub bookings have different Origins And /Or Destinations"){
                    	customerDestn =  "";
                    	customerDestnDes = "";
                    }
                    else{
                    	customerDestn = $('#mainBookDetailCustomerDestination').val();
                    	customerDestnDes = $('#mainBookDetailCustomerDestinationDesc').val();
                    }
                    formData = {
                    		
                        id: $('.activeNavigationItem').attr('data-bookingid'),
                        customerID: $('#maincustomerID').val(),
                        contractCode: $('#mainContract').val(),
                        customerCode: $('#mainBookDetailCustomerCode').val(),
                        originPortCode: customerOrigin,
                        originPortName: customerOriginDes,
                        destPortCode: customerDestn,
                        destPortName: customerDestnDes,
                        customerRef: $('#mCustomerRef').val(),
                        subBookingList: subBookings,
                        enableRouteDetail: isEnableRouteDetail,
                        module: 'BOOK',
                        timeStamp: $('.activeNavigationItem').attr('data-timestamp')
                    };
                    fnSubmitHelper(formData);
                } else {
                    nsCore.showAlert('Please select atleast one possibleVoyage');
                }
            } else {
                if ((!nsBooking.mainBookingFlag.changedOriginDest)) {
                	enableRouteDetailGridElem(true)
                    str = $('#createFreshBook').serialize();
                	freshBookUtilObj.mainRoutekey = '';
                    freshBookUtilObj.fmainTrade = null;
                    freshBookUtilObj.fmainSrcPort = null;
                    freshBookUtilObj.fmaindestPort = null;
                    freshBookUtilObj.fcarReAvl = 0;
                    freshBookUtilObj.fpuReAvl = 0;
                    freshBookUtilObj.fhhReAvl = 0;
                    freshBookUtilObj.fstReAvl = 0;
                    freshBookUtilObj.fnoVoyage = false;
                    nsBooking.fmaxHeightCapacity = -1;
                    nsBooking.fmaxWeightCapacity = -1;
                    fnAjaxType(str);
                    nsBooking.mainBookingFlag.changedOriginDest = false;
                    $('#mainAddSubBooking').removeAttr('disabled');
                    $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
                    $('.mainBookingDetailsWrap #prevVoyagesMain').prop('checked', false);
                } else {
                    nsCore.showAlert('Please select a voyage to proceed!');
                }
            }
        } else {
            nsCore.showAlert(message.trim());
            $('#createFreshBook').attr('data-alert', true);
            return false;
        }
    }
    function enableRouteDetailGridElem(flag) {
    	$('.routeDetailGrid td' ).each(function(){
    		if(flag){
    		$($(this)[0].childNodes[0]).removeAttr('disabled')
    		}else{
    			$($(this)[0].childNodes[0]).attr('disabled','disabled')
    		}

    	})
    }
    $.extend(true, nsBooking, freshBookUtilObj);

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);