/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBookDoc, $, vmsService, nsCore, nsDoc, nsBooking ) {
	var subBookingObj={};
	if(!nsBooking){nsBooking=nsDoc}
	
	function isValidBLStatus() {
        return $('#subBlStatus').val() && $('#subBlStatus').val() !== '10' ||
            (($('#totLDD').text()) > 0);
    }
	
	 $(document).on('change', '.chargeType', function() {
	     var val1 = $(this).val(), ele = $(this).parent().parent().find('.chargeGrossFreight'), objectToIterate=null;
	     if(nsCore.getPage(window.location.href)==='documentation'){
	    	 objectToIterate = nsDoc.sbChargeType;    	 
	     }	    	 
	     else{ 
	    	 objectToIterate = nsBooking.sbChargeType;
	     }
	     $.each(objectToIterate, function(i, val) {
	         var arr = val.split('|');
	         if (val1 === arr[0] && arr[1] === 'Yes') {
	             ele.prop('checked', true);
	             return false;
	         } else {
	             ele.prop('checked', false);
	         }
	     })
	 });
$(document).on('click', '.mainBookingListWrap .subBookContentListCol .thrdLevel, .mainBookingListWrap .subBookContentListCol .singleColItem',
             function(e) {
                var errMsgDoc = '',
                    subBookingTitle = $(this).text(),
                    bookId = $(this).attr('data-bookingId'),
                    freightChargeBasis = [],
                    index = '',
                    ajxURL = '', bookingNumber = '',
                    currMod = window.location.href,
                    consLegStatus='',
                    sendBackToSubCopy = false;
                if(e.currentTarget.id.indexOf('scndLevel')!==-1 || e.currentTarget.id.indexOf('frthLevel')!==-1) {
                	return;
                }
                if (nsBooking.globalBookingFlag.mainBookingFlag) {
                    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                        nsBooking.globalBookingFlag.fnGoBackWard,'mainBookingFlag', $(this));
                    return false;
                }
                if (nsDoc && nsDoc.globalBookingFlag.mainBlDetailsFlag) {
                	nsDoc.fnDirtyDialog(nsDoc.globalBookingFlag.fnGoForward, nsDoc.globalBookingFlag.fnGoBackWard,
            				'mainBlDetailsFlag', $(this));
    				return false;
    			}
                $('.dropMenuIcon').hide();
                nsDoc.existingRouteData = {
        			'nextConsType' : '',
        			'existingPortCallId' : '',
        			'existingConsType' : '',
        			'existingVesselVoyage' : '',
        			'selectedVesselVoyage' : '',
        			'selectedLoadPortCallId' : '',
        			'selectedDiscPortCallId' : ''
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
                nsBookDoc.removeDropDownIcon();
              	 $(this).find('.dropMenuIcon').show()
              	 bookingNumber = $('.scndLevel[data-bookingid='+$(this).attr('data-bookingid')+']').attr('data-filtering');
                $('.activeNavigationItem').removeClass('activeNavigationItem');
                nsBookDoc.frthLvlId = '';
               
                $(this).addClass('activeNavigationItem');
                $('.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#c9c9c9').css('color', '#000000');
                $('.bookingUnitWrap').hide();
                $('.subBookListFormWrap').show();
         		$('.mainBookingDetailsWrap').show();
         		$('.routeDetailsAcc').show();
         		
                nsBooking.bookUnitPopUpFlag = false;
                $('.preloaderWrapper').show();
                nsBookDoc.selectePossibleVoyage=[];
                nsBooking.selectedEntity.selectedSubBooking = $(this).attr('data-subbookingid');
                nsBooking.selectedEntity.selectedSubBookingMenuItem = $(this).attr('data-subbookingid');
                $('.bookingUnitLink').removeAttr('disabled');
                $('#mainBookDetailCustomerCode, #mainBookDetailCustomerDesc, #mCustomerRef, #mainContract')
                    .attr('disabled', true);
                $('#createFreshBook').find('.formSubmitButtons').hide();
                if (nsBooking.isCopyBookingEnabled === 'Yes') {
                    nsBooking.cpySubSelect = true;
                    nsBooking.updateBillofLading(errMsgDoc);
                    nsBooking.cpySubSelect = false;
                }
                nsBooking.cargoPopulateText = '';
                nsBooking.clearNewSubBook();
                if (!(sendBackToSubCopy)) {
                    nsBooking.highlightTreeItem($('.mainBookingListWrap .subBookingNbrsCntnt')
                        .find('.singleColItem.thrdLevel'), $(this), 'activeSubBook ui-selecting');
                }
                nsBooking.globalBookingFlag.currentEditLevel = 'subBooking';
                $('#mainViewSummaryLink,#bookingAllocItem,.mainMoveUnitsLnk,.billLadingDetailsDivWrapper,'
                    + '.possibleVoyageWrap,.possibleVoyageNewWrap').hide();
                $('.mainSubBookingListWrap').hide();
                $('.mainBookingDetailsWrap .getPossibleVoyages, .subBookingDimensionsInfoWrapper,.routeDetailsWrapper,'
                    +'.freightCargoDetailsDivWrapper,.mainSubBookingFormWrap,.mainBookingDetailsWrap '
                    +'.showPreviousVoyageClass,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
                $('#subBookingChargesGrid tbody').show();
                $('.mainBookingDetailFormTitle, .comHeaderItem').hide();
                $('.subBookLevel, .subBookLevel .mainBookingDetailFormTitle').show();
                $('#totalUnitsRow').show();
                $('.accElement.routeDetailsAcc').css('width', '100%');
                $('.routeDetailsWrapper').css('width', '80%');
                $('.mainBookingDetailsWrap').css('background', '#ffffff');
                $('#mainAddSubBoooking').removeAttr('disabled');
                $('#cargoDetailsTab').attr('data-clicked', false);
                $('.subBookLevel .mainBookingDetailFormTitle').html('B/L number: <span id="mainBookDetailTitleeVal">'+bookingNumber+'</span>');
                nsBookDoc.panelActions('mainBookingContentWrapper', 'open');
//               
                nsBooking.subBookingActiveId = $(this).attr('data-subbookingid');
                $('#bookId, #bookingHeaderId').val(bookId); 
                $('#mainBookDetailTitleeVal, .subBookLevel #mainBookDetailTitleeVal ').text($('.scndLevel[data-bolid='+$(this).attr('data-bolid')+']').attr('data-filtering'));
                ajxURL = '/Vms/subbooking/viewSubBooking?bookingId=' + $(this).attr('data-bookingId') +
                    '&subbookingId=' + $(this).attr('data-subbookingid') + '&dateFormat=' + nsCore.dateFormat +
                    '&timeFormat=' + nsCore.timeFormat + (nsDoc?'&module=BL':'&module=BOOK') + '&timestamp=' +
                    $(this).attr('data-timestamp');
                vmsService.vmsApiService(function(obj) {
                    if (obj) {
                    	//VMSAG-4976
                    	 $('#totalUnitsRow').show();
                    	nsCore.appModel.setCurNavSelection('subBooking', obj)
                    	if(obj.chargeModelList.length >= 1 && (obj.chargeModelList[0].chargeTypeCode)){
                    		nsBooking.chrgRateFlag = false;
                        }
                    	nsBooking.allChargeid = '';
                        nsBooking.subBookingIdDelete = '';
                        nsBooking.allChargeTimeSt = '';
                        nsBooking.clearNewSubBook();
                        $('.thrdLevel[data-subbookingid='+obj.subBookingId+']').attr('data-consignmentlegid', obj.consignmentLegModelList[0].consignmentLegId);
                        $('.mainSubBookFormTitle').attr('data-subBookingTitle', subBookingTitle).text(subBookingTitle);
                        $('#mainBookingFreightCommission').removeAttr('disabled');
                        $('.thrdLevel[data-subbookingid='+obj.subBookingId+']').attr('data-timestamp', obj.timeStamp);
                        if(nsCore.getPage(window.location.href)==='documentation'){
                        	$('.subBookLevel #mainBookDetailTitleeVal').text(obj.bolNumber);
                        }
                        nsBookDoc.newLegFlag='N'
                        nsBooking.subBookingObj = obj;
                        nsBooking.loadSubbookingContent(obj);
                       if (nsBooking.isCopyBookingEnabled === 'Yes') {
                            resetSubBookingValues();
                        }                         
                        if (sendBackToSubCopy) {
                            doAddNewBooking();
                        }
                        sendBackToSubCopy = false;
                        $('.subBookingNbrsCntnt').show();
                        $('.preloaderWrapper').hide();
                        $('.defaultSearchMsg').hide();
                        
                        if(obj.isReservedEquipment === 'Y'){
                        	$('#resEquip').attr('checked', true);
                        } else {
                        	$('#resEquip').attr('checked', false);
                        }                       
                              
                        if (nsBookDoc.isValidBLStatus()) {
                            $('#bookingAllocStatus').attr('disabled', 'disabled');
                        } else {
                            $('#bookingAllocStatus').removeAttr('disabled');
                        }
                        if(obj.chargeModelList.length === 1 && !(obj.chargeModelList[0].chargeTypeCode)){
                        	$('#subBookingChargesGrid tbody').hide();
                        } else{
                        	$('#subBookingChargesGrid tbody').show();
                        }
                        nsCore.roundOffCharges();                          
                    } else {
                        freightChargeBasis = nsBooking.chargeBasisOptions.slice();
                        index = freightChargeBasis.indexOf('PC,Per cent of freight');
                        if (index !== -1) {
                            freightChargeBasis.splice(index, 1);
                        }
                        $('#mainBookingFreightBasis').html(nsBookDoc.generateSelect(freightChargeBasis, '', true));
                        $('#mainBookingFreightCurrency')
                            .text(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
                        $('.chargeType').html(nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true));
                        $('.chargeBasis').html(nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
                        $('.chargeCurrency').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions,
                            '', true));
                        $('select[name="cargoEquipmentNbr"]').val('');
                        $('input[name="cargoEquipmentType"]').val('');
                        $('#cargoEquipmentNbr').attr('disabled', 'disabled');
                        $('input[name="bookingDocCode"]').val($('#billDocumentationOffice').val());
                        $('input[name="bookingDocDesc"]').val($('#billDocumentationOfficeDesc').val());
                        $('#bookingDocOfficeId').val($('#BLDocumentationOfficeId').val());
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                    
                    if(currMod.indexOf('/booking/') >=0 ){
	                    if($('.mainBookingListWrap .subBookingNbrsCntnt').find('.singleColItem.activeSubBook.ui-selecting').attr('data-deletable') === 'Yes'){
	                    	$('.mainBookingListWrap .subBookingNbrsCntnt').find('.singleColItem.activeSubBook.ui-selecting').find('.bookingRemoveIcon').removeClass('rowRemoveDisabledIcon');
	                    }
	                    if(obj.bolStatus!=='10'){ 
	                    	$('.wayCargo').attr('disabled','disabled');
	        				$('.mainLeg').attr('disabled','disabled');
	        				$('.allocStatusType').attr('disabled','disabled');
	        				$('#totalBookedUnits').attr('disabled','disabled');
	        				$('.getPossibleVoyages').attr('style','pointer-events:none;cursor:default');
	        				$('.getPossibleVoyages').addClass('disabledLink');
	        				$('.mainBookingDetailsWrap #possVoyagesHide').hide();
	        				$('.legField').children('a').each(function () {
	        					$(this).attr('style','pointer-events:none;cursor:default');
	        				});
	                	}else{
	        				$('.mainLeg').removeAttr('disabled');
	        				 $('.wayCargo').removeAttr('disabled');
	        				$('.selectedRoute').removeAttr('disabled');
	        				if(obj.receivedUnits==='0' && obj.loadedUnits==='0'){
	        					$('.getPossibleVoyages').attr('style','pointer-events:null;cursor:pointer');
	        					$('.getPossibleVoyages').removeClass('disabledLink');
	        				}        				
	        				$('.legField').children('a').each(function () {
	        					$(this).attr('style','pointer-events:null;cursor:pointer');
	        				});
	                	}
	                    $('.selectedRoute').attr('disabled',false);//VMSAG-3943 route selection enabled for all bol status
                    }
                    else {
                    	if (obj) {
		                    consLegStatus = nsDoc.getCurrentConsignmentLegStatus();	                    
		                    nsDoc.statusBasedDisable('Consignment', consLegStatus);  
                    	}
                    	 $.each($('#routeDetailGrid tbody tr'), function(i, val) {
             				if (!$(this).find('.selectedRoute').is(':checked')) {
             					if ($(this).find('.selectedRoute').attr('data-isLoaded') === 'Y') {
             						$(this).find('.allocStatusType').attr('disabled', 'disabled');
             					}
             				} 
                    		 });
                    }
                    if(nsDoc){
                        $('#bookingBLNbr').addClass('bookingBLNum');
                        if(nsCore.appModel.fetchBLConsignments.responseData){
                        	$('.subBookLevel #mainContract').text(nsCore.appModel.fetchBLConsignments.responseData.contractName);
	                    	$('.comHeaderItem #mainContract').val(nsCore.appModel.fetchBLConsignments.responseData.contractId);
	                    }
                        else{
                        	$('.subBookLevel #mainContract').text(nsCore.appModel.viewbolDetails.billOfLadingModel.contractName);
	                    	$('.comHeaderItem #mainContract').val(nsCore.appModel.viewbolDetails.billOfLadingModel.contractId);
                        }
                    }
                    //added for 4161
                    if($('.thrdLevel.activeNavigationItem').find('.expandSubBooking').hasClass('fa-minus')){
                    	$('.selectedRoute:checked').trigger('change');
                	}
                    nsBookDoc.diffOfficeValidation(consLegStatus)
                    
                }, ajxURL, 'POST', null);
            });
$(document).on('click','#makeModelListLink', function() {
    var make = $('#bookingCargoMake').val(),
        model = $('#bookingCargoModel').val(),
        formdata = {};
    if ((make === '') && (model === '')) {
        $('#bookingCargoModel').attr('disabled');
    } else {
        formdata = {
            make: $('#bookingCargoMake').val(),
            model: $('#bookingCargoModel').val()
        };
        vmsService.vmsApiServiceLoad(function(response) {
            var testObj = '';
            if (response) {
                if ($.fn.DataTable.isDataTable($('#makeModelListGrid'))) {
                    $('#makeModelListGrid').dataTable().api().clear().draw();
                    $('#makeModelListGrid').dataTable().api().rows.add(response).draw();
                } else {
                    testObj = JSON.parse(JSON.stringify(nsBooking.normalGridOpts));
                    testObj.dom = '<t>';
                    testObj.scrollCollapse = true;
                    testObj.scrollX = true;
                    testObj.scrollY = 200;
                    testObj.data = response;
                    testObj.bAutoWidth = false;
                    testObj.columns = [{
                        'render': function() {
                            return '<input type="radio" name="selectMakeModel" value="">';
                        }
                    }, {
                        data: 'make',
                        defaultContent: ""
                    }, {
                        data: 'model',
                        defaultContent: ""
                    }, {
                        data: 'yearOfManu',
                        defaultContent: ""
                    }, {
                        data: 'cargoDescription',
                        sWidth: '150px',
                        defaultContent: ""
                    }, {
                        data: 'cargoText',
                        defaultContent: ""
                    }, {
                        data: 'dimensionText',
                        defaultContent: ""
                    }, {
                        data: 'length',
                        className: 'pad2x',
                        defaultContent: ""
                    }, {
                        data: 'width',
                        defaultContent: ""
                    }, {
                        data: 'height',
                        defaultContent: ""
                    }, {
                        data: 'weight',
                        defaultContent: ""
                    }, {
                        data: 'area',
                        defaultContent: ""
                    }, {
                        data: 'volume',
                        defaultContent: ""
                    }];
                    $('#makeModelListGrid').DataTable(testObj);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.searchAll, 'POST', JSON.stringify(formdata));
        $('#makeModelListPopup').dialog({
            modal: true,
            resizable: false,
            draggable: false,
            width: '75%',
            close: function() {
                $('#makeModelListGrid').dataTable().api().clear().draw();
            },
            open: function() {
                if ($.fn.DataTable.fnIsDataTable($('#makeModelListGrid'))) {
                    $('#makeModelListGrid').dataTable().api().columns.adjust();
                }
            }
        }).data('origin', 'subBooking');
    }
});
subBookingObj = {
	    
        'isValidBLStatus': isValidBLStatus,
        
        
    };

    $.extend(true, nsBookDoc, subBookingObj);
})(this.bookDoc, jQuery, this.vmsService, this.core, this.doc, this.booking);