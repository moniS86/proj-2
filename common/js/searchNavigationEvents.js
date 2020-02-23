(function(nsBookDoc, $, vmsService, nsCore, nsBooking,  nsDoc ) {
	var sendBackToCopy = false, bookDocObj = {};
	function jDecode(str) {
        return $('<div/>').html(str).text();
    }
	function fnCargoListForward() {
		$('#cargoListSavBtn').click();
	}
	function fnCargoListBackward() {
		$('#cargoList').trigger('reset');
		$('#cargoListPopup').dialog('close');
	}
	function fnBookingUnitForward() {
		if($('.activeNavigationItem').attr('id')){
			$('.cargoDetailsSave:first').click();
		} else{
			$('.cargoDetailsSave:last').click();
		}
	}
	function fnBookingUnitBackward() {
		$('#bookingUnitForm').trigger('reset');
		$('#bkdUnitsCancelButton').click();
	}
	$(document).ready(function(){
	    	if(!nsBooking){nsBooking=nsDoc;}
	    	$('#forwarderCode').autocomplete({
	            search : function() {/*
	                                     * There is no operation performed on search
	                                     * function
	                                     */
	            },
	            open : function() {
	                $('.ui-menu').css('width', 'auto !important');
	            },
	            minLength : 0,
	            source : function(request, response) {
	            if(request.term){
	                vmsService.vmsApiService(function(dataCust) {
	                    var count1 = 0, flagCodes = [], i = 0;
	                    if (dataCust) {
	                    	nsBooking.fwdCodeAutoArr = [];
                            nsBooking.fwdNameAutoArr = [];
	                        count1 = dataCust.responseData.length;
	                        for (i = 0; i < count1; i++) {
	                            flagCodes.push({
	                                custId : '' + dataCust.responseData[i].companyId + '',
	                                label : dataCust.responseData[i].customerCode,
	                                name : dataCust.responseData[i].name
	                            });
	                            nsBooking.fwdCodeAutoArr.push(jDecode(dataCust.responseData[i].customerCode));
                                nsBooking.fwdNameAutoArr.push(jDecode(dataCust.responseData[i].name));
	                        }
	                        response(flagCodes);
	                    } else {
	                        nsCore.showAlert('Something went wrong. Please contact your admin.')
	                    }
	                }, '/Vms/autoComplete/customerlist', 'POST', JSON.stringify({customerCode : request.term}));
	            }
	            },
	            autoFocus : true,
	            focus : function(event) {
	                event.preventDefault();
	            },
	            select : function(event, ui) {
	                $('#forwarderCode').val(ui.item.label);
	                $('#forwarderName').val(ui.item.name);
	            }
	        });
	        $('#forwarderName').autocomplete({
	            search : function() {/*
	                                     * There is no operation performed on search
	                                     * function
	                                     */},
	            minLength : 0,
	            source : function(request, response) {
	            if(request.term){
	                vmsService.vmsApiService(function(dataCust) {
	                    var count1 = 0, flagCodes = [], i = 0;
	                    if (dataCust) {
	                    	nsBooking.fwdCodeAutoArr = [];
                            nsBooking.fwdNameAutoArr = [];
	                        count1 = dataCust.responseData.length;
	                        for (i = 0; i < count1; i++) {
	                            flagCodes.push({
	                                custId : '' + dataCust.responseData[i].companyId + '',
	                                label : dataCust.responseData[i].name,
	                                name : dataCust.responseData[i].customerCode
	                            });
	                            nsBooking.fwdCodeAutoArr.push(jDecode(dataCust.responseData[i].customerCode));
                                nsBooking.fwdNameAutoArr.push(jDecode(dataCust.responseData[i].name));
	                        }
	                        response(flagCodes);
	                    } else {
	                        nsCore.showAlert('Something went wrong. Please contact your admin.');
	                    }
	                }, '/Vms/autoComplete/customerlist', 'POST', JSON.stringify({name : request.term}));
	            }
	            },
	            autoFocus : true,
	            focus : function(event) {
	                event.preventDefault();
	            },
	            select : function(event, ui) {
	                $('#forwarderCode').val(ui.item.name);
	                $('#forwarderName').val(ui.item.label);
	            }
	        });
	 });
	    function canRemoveIconBeDisabled(bolStatus, dateLoaded, dateReceived, cargoStatusCode, dateReleasedLod) {
	        return (bolStatus === '50' || bolStatus === '21' || bolStatus === '51' || bolStatus === '40' ||
	            bolStatus === '20' || bolStatus === '30' || bolStatus === '31' || (dateLoaded) ||
	            (dateReceived) || (dateReleasedLod) || cargoStatusCode === '6');
	    }
	 	function isNewCargo(vin) {
		        if (!vin) {
		            vin = 'New Cargo';
		        }
		        return vin;
		    }
///Navigation secondLevel Event- Starts Here////////////////////////////////////////////////////////////////////////////////////////////////////////////
if(!nsDoc){	 	
$(document).on('click', '.mainBookingListWrap .subBookContentListCol .scndLevel', function(event) {
	if (nsBooking.globalBookingFlag.mainBookingFlag) {
	    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
	        nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
	    return false;
	}
	nsBookDoc.clearNewBookingNavigation()
	nsBookDoc.appScreenShowing="booking";
	nsBooking.lcFlag = false;
	nsBookDoc.frthLvlId = ''
	$('.mainBookingDetailsWrap').show();	
	if($(this)[0].innerText==='New Booking') {
		$('.routeDetailsAcc').hide();		
		$('.subBookListFormWrap').hide();	  
		$('.bookingUnitWrap').hide();
	} else{
		$('.routeDetailsAcc').show();		
		$('.subBookListFormWrap').show();		
	}
	if(nsDoc){
		nsDoc.existingRouteData = {
			'nextConsType' : '',
			'existingPortCallId' : '',
			'existingConsType' : '',
			'existingVesselVoyage' : '',
			'selectedVesselVoyage' : '',
			'selectedLoadPortCallId' : '',
			'selectedDiscPortCallId' : ''
		}
	}
	nsBookDoc.existingRouteDetails = {
			'vesVoy' : [],
            'newVesVoy' : [],
            'legCount' : 0,
            'newLegCount' : 0,
            'addEdit':[],
            'newLoadPort':[],
            'newDisPort':[],
            'newETD':[],
            'newETA':[],
            'oldLoadPort':[],
            'oldDisPort':[],
            'oldETD':[],
            'oldETA':[],
        }
	 $('.dropMenuIcon').hide();
	nsBookDoc.selectePossibleVoyage = [];
	 $(this).find('.dropMenuIcon').show()
	 $('.withNewBooking').removeClass('withNewBooking');
	 nsBookDoc.removeDropDownIcon();
	$('.activeNavigationItem').removeClass('activeNavigationItem')
	$(this).addClass('activeNavigationItem');
	$('.wayCargo').removeAttr('disabled');
	$('.mainLeg').removeAttr('disabled');
	$('.selectedRoute').removeAttr('disabled');
	$('.allocStatusType').removeAttr('disabled');
	$('#totalBookedUnits').removeAttr('disabled');
	$('.getPossibleVoyages').attr('style','pointer-events:null;cursor:pointer')
	$('.getPossibleVoyages').removeClass('disabledLink');
	$('.legField').children('a').each(function () {
		$(this).attr('style','pointer-events:null;cursor:pointer');
	});
	
	if($(this).attr('data-bookingid')){		
		nsBookDoc.fncAjax(nsBookDoc.fetchBookingCommon(this,'booking'), sendBackToCopy);
	}
	if($(this).find('.expandBooking').hasClass('fa-minus')){			
		nsBookDoc.fncAjax1(nsBookDoc.fetchBookingCommon(this ,'expand'), 'bookingOrBLClick');		
	}
	nsBookDoc.addingBottomBorderScndLevel()
});
}
$(document).on('click', '.mainBookingListWrap .subBookContentListCol .expandBooking', function(event) {
	if (nsBooking.globalBookingFlag.mainBookingFlag) {
        nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
            'mainBookingFlag', $(this.parentNode.parentNode));
        return false;
    }
	event.stopPropagation();
	event.preventDefault();
	var docLink = false, selectedSub;
	if((window.location.href).indexOf('/documentation/') > 0){
		docLink = true;
	}
	if(docLink){
		selectedSub=$('.searchNavigation').find('[data-bolid="' + $(this.parentNode.parentNode).attr('data-bolid') + '"]');
	} else{
		selectedSub=$('.searchNavigation').find('[data-bookingid="' + $(this.parentNode.parentNode).attr('data-bookingid') + '"]');
	}
	var selectSubId=selectedSub[0].id;
	var firstLvelIndex= selectSubId.split('_')[1]
	var secondLvelIndex=selectSubId.split('_')[2]
	if($(this).hasClass('fa-minus')){
		$('.scndLevel').find('.expandBooking').removeClass('fa-minus').addClass('fa-plus');
		$(this).toggleClass('fa-minus fa-plus')
	} else{
		$('.scndLevel').find('.expandBooking').removeClass('fa-minus').addClass('fa-plus');
	}
	$('.frthLevel').remove();
	 $('.searchNavigation .thrdLevel').filter(function(i){
		 var fetchIndex = $(this).attr('id');
		 var thisParentInd1 = fetchIndex.split('_')[1];
		 var thisParentInd2 = fetchIndex.split('_')[2];
		 if(secondLvelIndex !== thisParentInd2){
			 $('#scndLevel_'+thisParentInd1+'_'+thisParentInd2 + '_'+ i).removeClass("fa-minus").addClass("fa-plus");
		 }
    	 return $(this).attr('id').indexOf('thrdLevel_'+firstLvelIndex+'_'+secondLvelIndex) === -1
     }).remove();
	$('.bookingUnitWrap').hide();
	if($($('#'+selectSubId)[0].parentNode).find($('#thrdLevel_'+firstLvelIndex+'_'+secondLvelIndex+'_0')).length===0){
		nsBookDoc.fncAjax1(nsBookDoc.fetchBookingCommon(this.parentNode.parentNode ,'expand'), sendBackToCopy);
	}else{
		if( nsBookDoc.insertNewSubBook !== '') {
			$($('#'+selectSubId)[0].parentNode).children('div').each(function () {
				if(this.id.indexOf('thrdLevel_'+firstLvelIndex+'_'+secondLvelIndex)!==-1){
					$(this).remove();
				}
			});
		}
	}
	if($('#thrdLevel_'+firstLvelIndex+'_'+secondLvelIndex+'_0').css('display')==='block'){
		$('.thrdLevel').remove();
	}
	if ($(this).hasClass('fa-plus')) {
		$(this).removeClass("fa-plus").addClass("fa-minus");
	}
	else{
		$(this).removeClass("fa-minus").addClass("fa-plus");
		nsCore.appModel.clearFetchBLConsignments();
	}
	nsBookDoc.addingBottomBorderScndLevel();
});
///Navigation secondLevel Event- Ends Here////////////////////////////////////////////////////////////////////////////////////////////////////////////

///Navigation thirdLevel Event- Starts Here////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on('click', '#totalUnitsGrid tbody td .fa.fa-ellipsis-v', function() {
    var dataUnitItem = $(this).attr('data-unitType'),
        bolStatus = $('#hiddenBLStatus').val(),
        consLegId = $(this).parent().parent().find('.totalBookedUnits').attr('data-consignmentlegid'),
        dateFormat = localStorage.getItem('dateFormat'),
        cargoListHtml = '<div class="subBookListColWrap totalUnitsListColWrap"><div class="subBookingNbrsHdr"><p class="billMoveFrom subBookingNumTitle"></p>'
	                	+ '<div class="filterDiv"><input type="text" class="filterBox" id="subBoookingSearch"></div></div><div class="clearAll"></div>'
	                	+'<div class="subBookContentListCol subBookingNbrsCntnt totalSubBookingList"></div></div>',
        data = {};
    consType = $(this).parent().parent().find('.totalBookedUnits').attr('data-consignmentlegtype');
    nsBooking.consType = consType;
    if ($(this).hasClass('disableHandCursor')) {
        return false;
    } else {
        if (nsBooking.globalBookingFlag.mainBookingFlag) {
            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
            return false;
        }
    }
    /* resetting the form elements start */
    $(cargoListHtml).insertBefore($('#bookingUnitPopup #bookingUnitForm .bookingUnitContent'));
    $('#bookingUnitPopup').find('.subBookingNumTitle').html('');
    $('#cargodetails').html('');
    $('#bookingUnitPopup #bookingUnitForm').find('.subBookingNbrsCntnt').html('');
    $('#bookingUnitPopup #bookingUnitForm').find('input[type=text]').val('');
    $('#bookingUnitPopup #bookingUnitForm').find('input[type=checkbox]').prop('checked', false);
    $('#bookingUnitPopup #bookingUnitForm').find('input[type=radio]').prop('checked', false);
    // selecting first option as the default value
    $('#bookingUnitPopup #bookingUnitForm').find('select').find('option:first').prop('selected', 'selected');

    if($('.activeNavigationItem').find('.expandSubBooking').hasClass('fa-plus')){
    	$('.activeNavigationItem').find('.expandSubBooking').trigger("click");
    }
    /* resetting the form elements end */
    $('#bookingUnitPopup').dialog({
        modal: true,
        resizable: false,
        draggable: false,
        width: '85%',
        close: function() {
        	$('#bookingUnitForm .buContentHead').show();
            nsBookDoc.activeSubBooking();
            $('#bookingUnitPopup #bookingUnitForm .subBookListColWrap.totalUnitsListColWrap').remove();
            nsBookDoc.frthLvlId = '';
        },
        open: function() {
            $('#bookingUnitPopup #bookingUnitForm').find('.bookingUnitContent,.formSubmitButtons').hide();
            $('#bookingUnitForm .buContentHead').hide();
            $('.declaredValCode').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
            nsBookDoc.populateCargoEquipment(0);
        }
    });
    data = {
        id: nsBooking.subBookingActiveId,
        dateFormat: dateFormat,
        consignmentLegId: consLegId
    };
    if($('.mainSubBookFormTitle').attr('data-subBookingTitle') !== 'New Sub Booking') {
    vmsService.vmsApiService(function(response) {
        var popup = $('#bookingUnitPopup'),
            sinleColItm = nsBookDoc.getSubBookingTitle(nsCore.appModel.getConsignmentNo(consLegId), nsCore.appModel.viewSubBooking.bookedUnits, nsCore.appModel.viewSubBooking.cargoText),
            activeSubBook = nsDoc?nsCore.appModel.viewSubBooking.bolNumber:$('.mainSection .bookingContent .cargoManagementRightData .mainBookingContentWrapper #createFreshBook #mainBookDetailTitleeVal').text(),
            bookingValue = activeSubBook+" "+sinleColItm ;
            subBookingsContent = '';
        nsBookDoc.cargoSubBookTimeStamp = response.responseData.timeStamp;
        if (response.responseData.subBookingList) {
            responseCargo = response.responseData.subBookingList;
            nsBookDoc.cargoListArray = responseCargo;
            $('.bookingUnitContent').show();
            $('#cargodetails').text(bookingValue);
            if (dataUnitItem === 'Bkd') {
                popup.find('.subBookingNumTitle').html('Booked VINS for </br>' + sinleColItm);
            } else if (dataUnitItem === 'Rcd') {
                popup.find('.subBookingNumTitle').html('Received VINS for </br>' + sinleColItm);
            } else {
                if (dataUnitItem === 'Ldd') {
                    popup.find('.subBookingNumTitle').html('Loaded VINS for </br>' + sinleColItm);
                }
            }
            var searchNavUnitList=""
            $.each(responseCargo, function(ind, obj) {
                var vin = obj.consignmentLegList[0].cargoConsignmentList[0].cargo.vinNumber,
                    cargocon = obj.consignmentLegList[0].cargoConsignmentList[0],
                    cargoStatusCode = '', cargoDetTimeStamp = obj.timeStamp,
                    dateLoaded = obj.consignmentLegList[0].cargoConsignmentList[0].dateLoaded || '',
                    dateReceived = obj.consignmentLegList[0].cargoConsignmentList[0].dateReceived || '',
                    dateReleasedLod = obj.consignmentLegList[0].cargoConsignmentList[0].dateReleasedLoad || '',
                    iconVisiblilty = '',
                    isCargoNotNull = (obj.consignmentLegList[0].cargoConsignmentList[0].cargo.statusCode) ? true : false;
                if (isCargoNotNull) {
                    cargoStatusCode = obj.consignmentLegList[0].cargoConsignmentList[0].cargo.statusCode;
                }
                if (canRemoveIconBeDisabled(bolStatus, dateLoaded, dateReceived, cargoStatusCode, dateReleasedLod)) {
                    iconVisiblilty = 'rowRemoveDisabledIcon';
                } else {
                    iconVisiblilty = 'rowRemoveIcon';
                }
                vin = isNewCargo(vin);
                subBookingsContent = nsBookDoc.createSubBookinCntnt(vin, cargocon,
                    dataUnitItem, iconVisiblilty, ind, cargoDetTimeStamp);
                popup.find('.subBookContentListCol').append(subBookingsContent);
                searchNavUnitList+=subBookingsContent;
            });
            $('#bookingUnitForm .fa.fa-caret-down').hide();
            cargoList = responseCargo;
            $('#bookingUnitPopup #bookingUnitForm').find('.bookingUnitContent,.formSubmitButtons').hide();
        } else {
            nsCore.showAlert(nsBooking.errorMsg);
        }
    }, '/Vms/subbooking/getCargoDetails', 'POST', JSON.stringify(data));
    }
});
$(document).on('click', '.mainBookingListWrap .subBookContentListCol .expandSubBooking', function(event) {
	var dateFormat = localStorage.getItem('dateFormat'),	
	consLegId = $(this.parentNode).attr('data-currentlegid')|| $(this.parentNode).attr('data-consignmentlegid'),
	subbookingid = $(this.parentNode).attr('data-subbookingid'),
	subBookTitle = $(this.parentNode).attr('data-filtering'),
    data = {},
    currMod = window.location.href,
    fetchURL='/Vms/subbooking/getCargoDetails';
	 if ($(this.parentNode).attr('data-currentlegid') === "undefined"){
			consLegId = $(this.parentNode).attr('data-consignmentlegid') || 0;
		}
	data = {
            id: subbookingid,
            dateFormat: dateFormat,
            consignmentLegId: consLegId
        };
	event.stopPropagation();
	event.preventDefault();	
	 if((currMod.indexOf('/booking/') >=0) && (parseInt(($(this.parentNode).text().split('-')[1]) || 0)===0)){
		return false;
	 }
	 else if((currMod.indexOf('/documentation/') >=0) && (parseInt(($(this.parentNode).text().split('-')[0]) || 0)===0)) {
		return false;
	 } 
	var selectedSub=$('.searchNavigation').find('[data-subbookingid="' + $(this.parentNode).attr('data-subbookingid') + '"]'),
		selectSubId=selectedSub[0].id,
		firstLvelIndex= selectSubId.split('_')[1],
		secondLvelIndex=selectSubId.split('_')[2],
		thirdLvelIndex=selectSubId.split('_')[3];
     $('.searchNavigation .frthLevel').filter(function(){
    	 var fetchIndex = $(this).attr('id');
		 var thisParentInd1 = fetchIndex.split('_')[1];
		 var thisParentInd2 = fetchIndex.split('_')[2];
		 var thisParentInd3 = fetchIndex.split('_')[3];
		 if(thirdLvelIndex !== thisParentInd3){
			 $('#thrdLevel_'+thisParentInd1+'_'+thisParentInd2 + '_' + thisParentInd3+ ' i.expandSubBooking').removeClass("fa-minus").addClass("fa-plus");
		 }
    	 return $(this).attr('id').indexOf('frthLevel_'+firstLvelIndex+'_'+secondLvelIndex+'_'+thirdLvelIndex) === -1
     }).remove();
     if($($('#'+selectSubId)[0].parentNode).find($('#frthLevel_'+firstLvelIndex+'_'+secondLvelIndex+'_'+thirdLvelIndex+'_0')).length===0){
    	 $('.preloaderWrapper').show();
        vmsService.vmsApiService(function(response) {
            var subBookingsContentPop = '',cargoResponse='';
            $('.frthLevel:visible').not('#bookingUnitPopup .frthLevel').remove();
	            if(response.responseData){
	            	cargoResponse = response.responseData.subBookingList;  
	            }
            	if (cargoResponse) {
               var searchNavUnitList=""
            	  $.each(cargoResponse, function(ind, obj) {
                    var vin = obj.consignmentLegList[0].cargoConsignmentList[0].cargo.vinNumber,
                        cargocon = obj.consignmentLegList[0].cargoConsignmentList[0],
                        cargoDetTimeStamp = obj.timeStamp,
                        iconVisiblilty = '';
                    vin = vin?vin:'New Cargo';
                   
                    subBookingsContentPop = nsBookDoc.createSubBookinCntnt(vin, cargocon,
                    		'Bkd', iconVisiblilty, ind, cargoDetTimeStamp);
                    

                    searchNavUnitList+=subBookingsContentPop;
                });
                selectedSub=$('.searchNavigation').find('[data-subbookingid="' + subbookingid + '"]');
                selectSubId=selectedSub[0].id;
                firstLvelIndex= selectSubId.split('_')[1];
            	secondLvelIndex=selectSubId.split('_')[2];
                thirdLvelIndex=selectSubId.split('_')[3];
                
                	 $(searchNavUnitList).insertAfter('#'+selectSubId)
                	 	var firthLvlIndex=0
	                	 $($('#'+selectSubId)[0].parentNode).children('div.frthLevel').each(function(){
	                	 if(!this.id) {
	            		 	$(this).attr('id', 'frthLevel_'+firstLvelIndex+'_'+secondLvelIndex+'_'+thirdLvelIndex+'_'+firthLvlIndex )
	            		 	firthLvlIndex++;
	            		 }
                	 })
                	
               
                nsBookDoc.cargoListArray = cargoResponse;
                nsBookDoc.cargoSubBookTimeStamp = response.responseData.timeStamp;
                $('.declaredValCode').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
        		nsBookDoc.populateCargoEquipment(0);
                if(nsBooking.updatedCargoflag){
                	
                	$('.frthLevel').filter(function(){
	           	    	 return ($(this).attr('id').indexOf(nsBooking.updatedCargoflag) !== -1 && $(this).attr('data-filtering') === $('#vinSerialNbr').val());
	           	     }).trigger('click');
                	//VMSAG-4947
                	nsBooking.updatedCargoflag = '';
                }
                nsBookDoc.addingBottomBorderScndLevel();
            	if($('.rolesTitle').text().indexOf('Booking') > -1){
            		$('.buContentHead').find('.bookHDetail .mainBookingDetailFormTitle').html('Booking: <span id="buMainBook">' + response.responseData.bookNo + '</span>');
            	} else {
            		$('.buContentHead').find('.bookHDetail .mainBookingDetailFormTitle').html('B/L number: <span id="buMainBook">' + response.responseData.subBookingList[0].bolNumber + '</span>');
            	}
                $('#buCustCode').text(response.responseData.customerCode);
                $('#buCustDesc').text(response.responseData.customerName);
                $('#buMainContract').text(response.responseData.contractId);
                $('#buCustomerRef').text(response.responseData.customerRef);
                $('#buSubBook').text(subBookTitle);
                $('#buOriginCode').text(response.responseData.originPortCode);
                $('#buOriginDesc').text(response.responseData.originPortName);
                $('#buDestCode').text(response.responseData.destPortCode);
                $('#buDestDesc').text(response.responseData.destPortName);
                $('.preloaderWrapper').hide();
            } else {
            	$('.preloaderWrapper').hide();
                nsCore.showAlert(nsBooking.errorMsg);
                
            }
        }, fetchURL, 'POST', JSON.stringify(data));
     }else {
    	 $($('#'+selectSubId)[0].parentNode).children('div').each(function () {
  			if(this.id.indexOf('frthLevel_'+firstLvelIndex+'_'+secondLvelIndex+'_'+thirdLvelIndex)!==-1) {
  				$(this).remove();
			}
  		});
    	 $('.searchNavigation .frthLevel').remove();
    }
     
    if ($(this).hasClass('fa-plus')) {
 		$(this).removeClass("fa-plus").addClass("fa-minus");
 	}
 	else{
 		$(this).removeClass("fa-minus").addClass("fa-plus");
 	}
    nsBookDoc.addingBottomBorderScndLevel();
    
});
///Navigation thirdLevel Event- Ends Here////////////////////////////////////////////////////////////////////////////////////////////////////////////
	bookDocObj = {
		'fnCargoListForward': fnCargoListForward,
		'fnCargoListBackward': fnCargoListBackward,
		'fnBookingUnitForward': fnBookingUnitForward,
		'fnBookingUnitBackward': fnBookingUnitBackward
	}
	$.extend(true, nsBookDoc, bookDocObj);
})(this.bookDoc, jQuery, this.vmsService, this.core, this.booking, this.doc);