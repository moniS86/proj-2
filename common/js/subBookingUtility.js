/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsDoc, nsBookDoc) {
    var subBookingUtilsObj = {};
    if (!nsBooking) {
        nsBooking = nsDoc
    }
    nsBooking.isCopiedToFreighted = 'N';
    function loadUnitsTable(unitsData) {
        $('#totalUnitsGrid')
            .DataTable(
                {
                    'destroy' : true,
                    'processing' : true,
                    'serverSide' : false,
                    'bFilter' : true,
                    'tabIndex' : -1,
                    'bSort' : false,
                    'ordering' : false,
                    'info' : false,
                    'searching' : false,
                    'dom' : '<t>',
                    'scrollCollapse' : true,
                    'paging' : false,
                    'data' : unitsData,
                    'bAutoWidth' : false,
                    fnInitComplete : function() {
                        $('th').unbind('keypress');
                    },
                    'columns' : [
                        {
                            data : 'booked',
                            'render' : function(data, type, full) {
                                if (full.legType === 'M') {
                                    return '<input id="totalBookedUnits" type="text" data-bookingnum="" class="totalBookedUnits freightTotal  numericField notDecimal" name="totalBookedUnits" value="'
                                        + data
                                        + '" maxlength="4"'
                                        + (full.selLeg === 'checked' ? '' : 'disabled')
                                        + ' data-consignmentlegid="'
                                        + full.legId
                                        + '" data-consignmentlegtype="'
                                        + full.legType
                                        + '"><span class="hide floatRight fa fa-ellipsis-v" data-unittype="Bkd"><span>';
                                } else {
                                    return '<input type="text" disabled data-bookingnum="" class="totalBookedUnits freightTotal  numericField" name="totalBookedUnits" value="'
                                        + data
                                        + '" maxlength="4" data-consignmentlegid="'
                                        + full.legId
                                        + '" data-consignmentlegtype="'
                                        + full.legType
                                        + '"><span class="hide floatRight fa fa-ellipsis-v" data-unittype="Bkd"><span>';
                                }
                            }
                        },
                        {
                            data : 'received',
                            'render' : function(data, type, full) {
                                return '<p>' + (data || '0')
                                    + '</p><span class="hide floatRight fa fa-ellipsis-v" data-unittype="Rcd"><span>';
                            }
                        },
                        {
                            data : 'loaded',
                            'render' : function(data, type, full) {
                                return '<p>' + (data || '0')
                                    + '</p><span class="hide floatRight fa fa-ellipsis-v" data-unittype="Ldd"><span>';
                            }
                        }
                    ]
                });
        nsCore.onlyNumbers('#totalUnitsGrid .totalBookedUnits');
    }
    function legDetailsDisble() {
        $.each($('#routeDetailGrid tbody tr'), function(i, val) {
            if ($(this).find('.selectedRoute').is(':checked')) {
                $(this).find('input[type=checkbox], select').attr('disabled', false);
                $(this).addClass('highlightedRow');
                $($('#totalUnitsGrid tbody tr')[i]).addClass('highlightedRow');
                if ($(this).find('.selectedRoute').attr('data-isLoaded') === 'Y') {
                    $(this).find('.allocStatusType').attr('disabled', 'disabled');
                }
            } else {
                $(this).removeClass('highlightedRow');
                $($('#totalUnitsGrid tbody tr')[i]).removeClass('highlightedRow');
            }
        });
    }
    function populateCargoStates() {
        var count = 0, i;
        if (nsBooking.cargoStatesListArray === null || nsBooking.cargoStatesListArray.length === 0) {
            $('#cargoState option').each(function() {
                nsBooking.cargoStatesListArray.push({
                    cargoState : $(this).val(),
                    cargoStateDesc : $(this).text()
                });
            });
        }
        $('#bookingCargoState').children('option').length = 0;
        $('#bookingCargoState').text('');
        for (i = 0; i < nsBooking.cargoStatesListArray.length; i++) {
            if (count === 0) {
                document.mainSubBookingForm.bookingCargoState.options[count] = new Option(
                    nsBooking.cargoStatesListArray[i].cargoStateDesc, nsBooking.cargoStatesListArray[i].cargoState,
                    true, false);
            } else {
                document.mainSubBookingForm.bookingCargoState.options[count] = new Option(
                    nsBooking.cargoStatesListArray[i].cargoStateDesc, nsBooking.cargoStatesListArray[i].cargoState,
                    false, false);
            }
            count++;
        }
    }
    function copyToFre(ele) {
        var wrap, perUnit;
        if (nsBooking.isCopiedToFreighted === 'N') {
            wrap = $(ele).closest('.mainSubBookingFormWrap');
            setFrLenWidth(wrap);
            $(wrap).find('#freightedHeight').val($(wrap).find('#subBHei').val());
            $(wrap).find('#freightedWeight').val($(wrap).find('#subBWei').val());
            if ($(wrap).find('#subBHei').is(':disabled')) {
                $(wrap).find('#freightedHeight').attr('disabled', 'disabled');
            } else {
                $(wrap).find('#freightedHeight').removeAttr('disabled');
            }
            if ($(wrap).find('#subBWei').is(':disabled')) {
                $(wrap).find('#freightedWeight').attr('disabled', 'disabled');
            } else {
                $(wrap).find('#freightedWeight').removeAttr('disabled');
            }
            setFrAreaVolume(wrap);
            $(wrap).find('#freightedMeasureUnit').val($(wrap).find('#bookedMeasureUnit').val());
            perUnit = $(wrap).find('#bookedUnit').find('#shipInfovalidStatus').is(':checked');
            if (perUnit) {
                $(wrap).find('#freightedUnit').find('#shipInfovalidStatus').prop('checked', true);
            } else {
                $(wrap).find('#freightedUnit').find('#shipInfoHistStatus').prop('checked', true);
            }
            nsBooking.calculateFreightTotal();
            nsBooking.updateChargeOnDimChange();
        }
        if ($(ele).attr('id') !== 'bookedMeasureUnit' && $(ele).attr('id') !== 'freightedMeasureUnit'
            && $(ele).attr('id') !== 'subBWei') {
            nsBooking.freightWeight(ele);
        }
    }
    function setFrLenWidth(wrap) {
        $(wrap).find('#freightedLength').val($(wrap).find('#subBlen').val());
        if ($(wrap).find('#subBlen').is(':disabled')) {
            $(wrap).find('#freightedLength').attr('disabled', 'disabled');
        } else {
            $(wrap).find('#freightedLength').removeAttr('disabled');
        }
        $(wrap).find('#freightedWidth').val($(wrap).find('#subBWid').val());
        if ($(wrap).find('#subBWid').is(':disabled')) {
            $(wrap).find('#freightedWidth').attr('disabled', 'disabled');
        } else {
            $(wrap).find('#freightedWidth').removeAttr('disabled');
        }
    }
    function setFrAreaVolume(wrap) {
        $(wrap).find('#freightedArea').val($(wrap).find('#bookedArea').val());
        if ($(wrap).find('#bookedArea').is(':disabled')) {
            $(wrap).find('#freightedArea').attr('disabled', 'disabled');
        } else {
            $(wrap).find('#freightedArea').removeAttr('disabled');
        }
        $(wrap).find('#freightedVolume').val($(wrap).find('#subBVol').val());
        if ($(wrap).find('#subBVol').is(':disabled')) {
            $(wrap).find('#freightedVolume').attr('disabled', 'disabled');
        } else {
            $(wrap).find('#freightedVolume').removeAttr('disabled');
        }
    }
    function getCargoStateList(cargoTypeID, cargoStateVal) {
        var cargoStateURL = '';
        if (cargoTypeID === '') {
            populateCargoStates();
            return;
        }
        // Update the cargo state list based on the cargo type selection..
        cargoStateURL = '/Vms/masterdata/cargoStates?module=booking&cargoTypeId=' + cargoTypeID;
        vmsService.vmsApiService(function(response) {
            var options = '', count, i;
            if (response) {
                response.responseData.sort(function(a, b) {
                    var val1 = a.desc.toUpperCase(), val2 = b.desc.toUpperCase();
                    return (val1 < val2) ? 1 : (val1 > val2) ? -1 : 0;
                });
                count = response.responseData.length;
                for (i = 0; i < count; i++) {
                    options += '<option value="' + response.responseData[i].code + '">' + response.responseData[i].desc
                        + '</option>';
                }
                $('#bookingCargoState').html(options);
                if (cargoStateVal !== null && cargoStateVal !== '') {
                    $('select[name="bookingCargoState"]').val(cargoStateVal);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, cargoStateURL, 'GET', null);
    }
    /** ENABLE DISABLE THE SUB BOOKING CONTENT*** */
    function legChangedAction(param, isNew) {
        if ((window.location.href).indexOf('/documentation/') < 0) {
            $('.routeDetailGrid tbody tr').each(
                function() {
                    $(this).find('.wayCargo').attr('disabled', 'disabled');                    
                    //if bookBLstatus is 10 it will return status otherwise always empty  
                    if((nsCore.appModel.selected==='booking' && $.trim($('#bookBLStatus').val()) === '')||(nsCore.appModel.selected==="subBooking" && ($.trim($('#subBlStatus').val()) !== '' && $('#subBlStatus').val() !== '10')) ){ 
	                        $(this).find('.mainLeg').attr('disabled', 'disabled');
	                        $(this).find('.wayCargo').attr('disabled', 'disabled');
	                } 
	                else {
                        $(this).find('.mainLeg').removeAttr('disabled');
                        $(this).find('.wayCargo').removeAttr('disabled');
	                }
                });
        }
        else{
        	 $('.routeDetailGrid tbody tr').each(function() {
                  var legStatus = $(this).find('.selectedRoute').attr('data-conslegstatus');
                     if( legStatus === '51' || legStatus === '50' ){     	                        
 	                        $(this).find('.wayCargo').attr('disabled', 'disabled');
 	                 } 
                     else{ 	                        
                        $(this).find('.wayCargo').removeAttr('disabled');
                     }  	                 
                 });        	
        }      
    
        if (param === 'D') {
            $('input[name="bookingCargoText"]').attr('disabled', 'disabled');
            $('select[name="bookingCargoType"]').attr('disabled', 'disabled');
            $('input[name="bookingCargoText"]').attr('disabled', 'disabled');
            $('select[name="bookingCargoState"]').attr('disabled', 'disabled');
            $('select[name="bookingCargoModel"]').attr('disabled', 'disabled');
            $('input[name="bookingDocCode"]').attr('disabled', 'disabled');
            $('input[name="bookingDocDesc"]').attr('disabled', 'disabled');
            $('textarea[name="cargoMarkNumbersIcon"]').attr('disabled', 'disabled');
            $('textarea[name="cargoDescriptionIcon"]').attr('disabled', 'disabled');
            $('input[name="mainBookingFreightCommission"]').attr('disabled', 'disabled');
            $('select[name="mainBookingFreightBasis"]').attr('disabled', 'disabled');
            $('select[name="mainBookingFreightCurrency"]').attr('disabled', 'disabled');
            $('input[name="freightedLength"]').attr('disabled', 'disabled');
            $('input[name="freightedWidth"]').attr('disabled', 'disabled');
            $('input[name="freightedHeigth"]').attr('disabled', 'disabled');
            $('input[name="freightedWeight"]').attr('disabled', 'disabled');
            $('input[name="bookedLength"]').attr('disabled', 'disabled');
            $('input[name="bookedWidth"]').attr('disabled', 'disabled');
            $('input[name="bookedHeigth"]').attr('disabled', 'disabled');
            $('input[name="bookedWeight"]').attr('disabled', 'disabled');
            $('input[name="actualLength"]').attr('disabled', 'disabled');
            $('input[name="actualWidth"]').attr('disabled', 'disabled');
            $('input[name="actualHeigth"]').attr('disabled', 'disabled');
            $('input[name="actualWeight"]').attr('disabled', 'disabled');
            $('select[name="mainBookingFreightPayment"]').attr('disabled', 'disabled');
            $('input[name="mainBookingFreightRate"]').attr('disabled', 'disabled');
            $('#mainBookingFreightFreight, #mainBookingFreightQuatity').attr('disabled', 'disabled');
            $('input[name="bookingBLNbr"]').attr('disabled', 'disabled');            
            $('input[id="shipInfovalidStatus"]').attr('disabled', 'disabled');
            $('input[id="shipInfoHistStatus"]').attr('disabled', 'disabled');
            $('input[name="bookedArea"]').attr('disabled', 'disabled');
            $('input[name="bookedVolume"]').attr('disabled', 'disabled');
            $('input[name="freightedArea"]').attr('disabled', 'disabled');
            $('input[name="freightedVolume"]').attr('disabled', 'disabled');
            $('select[name="attribute1"]').attr('disabled', 'disabled');
            if(!nsDoc && $('#subBlStatus').val() === '10'){            
            	$('select[name="voyageTransportationType"]').removeAttr('disabled');
            }   
            else if(nsDoc && $('.selectedRoute:checked').attr('data-conslegstatus') === "99"){
            	 $('.thirdPartyDetailsAccEle').find('input,select').prop('disabled', true);
            }
                        
            $('input[name="cargoEquipmentNbr"]').removeAttr('disabled');
            $('select[name="cargoEquipmentType"]').removeAttr('disabled');
            $('select[name="freightedMeasureUnit"]').attr('disabled', 'disabled');
            $('select[name="bookedMeasureUnit"]').attr('disabled', 'disabled');
            $('.chargeType').attr('disabled', 'disabled');
            $('.chargeBasis').attr('disabled', 'disabled');
            $('select[name="chargecurrency"]').attr('disabled', 'disabled');
            $('.chargeRate').attr('disabled', 'disabled');
            $('.chargeQuantity').attr('disabled', 'disabled');
            $('.chargeTotal').attr('disabled', 'disabled');
            $('.chargePayment').attr('disabled', 'disabled');
            $('.chargeGrossFreight').attr('disabled', 'disabled');
            $('.chargeSubBookings').attr('disabled', 'disabled');
            $('.chargeComments').attr('disabled', 'disabled');
            $('#addNewChargeHist').bind('click', false);
            $('#mainBookingFreightBasis').attr('disabled', 'disabled');
            $('#mainBookingFreightCurrency').attr('disabled', 'disabled');
            $('#bookingRateListLink').bind('click', false);
            $('#copytpFrightLink').hide();
            $('#disableCopytpFrightLink').show();
            $('.freightChargesSubDivAside').attr('disabled', 'disabled');
            $('input[name="militaryCargo"]').attr('disabled', 'disabled');
            $('input[name="hazardousCargo"]').attr('disabled', 'disabled');
            $('input[id="resEquip"]').attr('disabled', 'disabled');
            $('#actualMeasureUnit').attr('disabled', 'disabled');
            $('input[name="selectMakeModel"]').attr('disabled', 'disabled');
            $('#applyRateSubmit').attr('disabled', 'disabled');
            $('#applyRateSubmit').css('cursor', 'default');
            $('.datePickerIcon').css('pointer-events', 'auto');
            $('input[name="bookingCargoMake"]').attr('disabled', 'disabled');
            $('input[id="bookingCargoModel"]').attr('disabled', 'disabled');
            $('#makeModelListLink').bind('click', false);
            $('#subBookingChargesGrid').find('.rowRemoveIcon').css('pointer-events', 'none');
            nsBooking.isEnableRateButton(false);
            $('#bookingRateListLink').addClass('disabledBut');
            nsBooking.isEnableChargeButton(false);
            nsBooking.isEnableCrgListButton(false);
            $(
                '#mainBookDetailCustomerOrigin,#mainBookDetailCustomerOriginDesc,#mainBookDetailCustomerDestination,'
                    + '#mainBookDetailCustomerDestinationDesc').prop('disabled', true);
            $(
                '.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClass,'
                    + '.mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
        } else {
            $('input[id="shipInfovalidStatus"]').removeAttr('disabled');
            $('input[id="shipInfoHistStatus"]').removeAttr('disabled');
            $('select[name="freightedMeasureUnit"]').removeAttr('disabled');
            $('select[name="bookedMeasureUnit"]').removeAttr('disabled');            
			 if(nsCore.appModel.viewSubBooking.consignmentLegModelList && nsCore.appModel.viewSubBooking.consignmentLegModelList[0].cargoConsignmentList.length>0 
				            		&& nsCore.appModel.viewSubBooking.consignmentLegModelList[0].cargoConsignmentList[0].sameActual==='Y'){
			$('#actualMeasureUnit').removeAttr('disabled');
			}else{
				 $('#actualMeasureUnit').attr('disabled', 'disabled');
			}            
            $('input[name="selectMakeModel"]').removeAttr('disabled');
            $('#applyRateSubmit').removeAttr('disabled');
            $('#applyRateSubmit').css('cursor', 'pointer');
            $('input[name="bookingCargoMake"]').removeAttr('disabled');
            $('input[id="bookingCargoModel"]').removeAttr('disabled');
            $('input[name="bookingCargoText"]').removeAttr('disabled');
            $('select[name="bookingCargoType"]').removeAttr('disabled');
            $('input[name="bookingCargoText"]').removeAttr('disabled');
            $('select[name="bookingCargoState"]').removeAttr('disabled');
            $('select[name="bookingCargoModel"]').removeAttr('disabled');
            if (!nsDoc){ // in documentation Consignment level user should not change the Doc office always
	            $('input[name="bookingDocCode"]').removeAttr('disabled');
	            $('input[name="bookingDocDesc"]').removeAttr('disabled');
            } 
            $('textarea[name="cargoMarkNumbersIcon"]').removeAttr('disabled');
            $('textarea[name="cargoDescriptionIcon"]').removeAttr('disabled');
            $('select[name="chargecurrency"]').removeAttr('disabled');
            $('select[name="mainBookingFreightBasis"]').removeAttr('disabled');
            $('select[name="mainBookingFreightCurrency"]').removeAttr('disabled');
            $('select[name="mainBookingFreightPayment"]').removeAttr('disabled');
            $('input[name="mainBookingFreightRate"]').removeAttr('disabled');
            $('input[name="bookingComments"]').removeAttr('disabled');
            $('select[name="voyageTransportationType"]').removeAttr('disabled');
            $('input[name="voyageCarrierRef"]').removeAttr('disabled');
            $('input[name="cargoEquipmentNbr"]').removeAttr('disabled');
            $('select[name="cargoEquipmentType"]').removeAttr('disabled');
            $('select[name="attribute1"]').removeAttr('disabled');
            $('.chargeType').removeAttr('disabled');
            $('.chargeBasis').removeAttr('disabled');
            $('.chargeRate').removeAttr('disabled');
            $('.chargePayment').removeAttr('disabled');
            $('.chargeGrossFreight').removeAttr('disabled');
            $('.chargeSubBookings').removeAttr('disabled');
            $('.chargeComments').removeAttr('disabled');
            $('#addNewChargeHist').unbind('click', false);
            $('#mainBookingFreightBasis').removeAttr('disabled');
            $('#mainBookingFreightCurrency').removeAttr('disabled');
            $('.freightChargesSubDivAside').removeAttr('disabled');
            $('input[name="shippedOnboard"]').removeAttr('disabled');
            $('#bookingRateListLink').unbind('click', false).removeClass('disabledBut');
            $('#copytpFrightLink').show();
            $('#disableCopytpFrightLink').hide();
            if(nsCore.appModel.viewSubBooking.consignmentLegModelList && nsCore.appModel.viewSubBooking.consignmentLegModelList.length>0 
                    && nsCore.appModel.viewSubBooking.consignmentLegModelList[0].cargoConsignmentList.length>0
                    && nsCore.appModel.viewSubBooking.consignmentLegModelList[0].cargoConsignmentList[0].cargoOnHold!=='-1'){
                $('input[name="cargoOnHold"]').removeAttr('disabled');
            }
            $('input[name="militaryCargo"]').removeAttr('disabled');
            $('input[name="hazardousCargo"]').removeAttr('disabled');
            $('input[name="freightedWeight"]').removeAttr('disabled');
            $('input[name="bookedWeight"]').removeAttr('disabled');
            if ($('#bookedUnit #shipInfovalidStatus:checked').length === 1
                && ($('#subBlen').val().trim() !== "" || ($('#subBlen').val().trim() === "" && $('#bookedArea').val()
                    .trim() === ""))) {
                $('input[name="bookedLength"]').removeAttr('disabled');
                $('input[name="bookedWidth"]').removeAttr('disabled');
                $('input[name="bookedHeigth"]').removeAttr('disabled');
            } else {
                $('input[name="bookedArea"]').removeAttr('disabled');
                $('input[name="bookedVolume"]').removeAttr('disabled');
            }
            if ($('#freightedUnit #shipInfovalidStatus:checked').length === 1
                && ($('#freightedLength').val().trim() !== "" || ($('#freightedLength').val().trim() === "" && $(
                    '#freightedArea').val().trim() === ""))) {
                $('input[name="freightedLength"]').removeAttr('disabled');
                $('input[name="freightedWidth"]').removeAttr('disabled');
                $('input[name="freightedHeigth"]').removeAttr('disabled');
            } else {
                $('input[name="freightedArea"]').removeAttr('disabled');
                $('input[name="freightedVolume"]').removeAttr('disabled');
            }
            $('#totalUnitsGrid th').removeClass('disableHandCursor');
            $('#makeModelListLink').unbind('click', false);
            $('#cargoListLink').unbind('click', false);
            if(!(nsCore.appModel.selected==='booking' && nsCore.appModel.fetchBOLInfo.sameLPDP==='N')){
	            $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClass').show();
	            $('#possVoyagesHide').hide();
            }
            $('.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
            $('#subBookingChargesGrid').find('.rowRemoveIcon').css('pointer-events', 'auto');
            if (isNew === 'Y') {
                nsBooking.isEnableRateButton(false);
            } else {
                nsBooking.isEnableRateButton(true);
            }
            nsBooking.isEnableCrgListButton(true);
            nsBooking.isEnableChargeButton(true);
            if($('.mainSubBookFormTitle').text().toLowerCase()!=='new sub booking'){
            	enableDisableHeaderCont();
            }
        }
    }
    function enableDisableHeaderCont() {
        var disCheck = false,contractCheck= false;
        
        if(nsCore.appModel.selected==="subBooking"){
	        // sub-booking or Consignment loop used in bookDoc
	        $.each($('.selectedRoute'), function(i, v) {
	            if ($(v).attr('data-isloaded') === 'Y' || $(v).attr('data-isreceived') === 'Y'
	                || $(v).attr('data-isdischarged') === 'Y') {
	                disCheck = true;
	                return false;
	            }
	        })     
        }
        // status check for booking module
		if (!nsDoc && nsCore.appModel.selected==="booking" && $('.scndLevel.activeNavigationItem').attr('data-bolstatus')!=='10'  && !disCheck ) {
		        	disCheck = true;
		}
        if(!nsDoc && nsCore.appModel.selected==="booking"){ // for booking header
	        $.each(nsCore.appModel.fetchBOLInfo.subBookingModelList, function(i,v){
	        	if(v.bolStatus!=='10'){
	        		contractCheck =true;
	        	}
	        	if(!disCheck){
		        	$.each(v.consignmentLegModelList, function(ind,val){
		        		if (val.received === 'Y' || val.loaded === 'Y' || val.discharged === 'Y') {
		                    disCheck = true;		                    
		                }
		        	})
	        	}
	        })	          	
        }
        else if(nsDoc && nsCore.appModel.selected==="bl"){ // for Documentation header
	        $.each(nsCore.appModel.viewbolDetails.consignmentLegModelsList, function(i, v) {
	        	if(!disCheck){		        	
					if (v.receivedStatus === 'Y' || v.loadedStatus === 'Y' || v.dischargedStatus === 'Y') {
						disCheck = true;
						return false;
        			}
        		}
	        });
        }
        
        if (disCheck) {
            $('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').attr('disabled', 'disabled');           
            $('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #possVoyages').hide();
            $('.mainBookingDetailsWrap #possVoyagesHide').show();
        }        	        
        else {
        	if($('#mainBookDetailCustomerOrigin').val().indexOf('different Origins')<0 && !(nsDoc && nsCore.appModel.selected==='subBooking')&& !(nsCore.appModel.selected==='bl')){
        	    $('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').attr('disabled', false);
	            $('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').attr('disabled', false);
	            $('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').attr('disabled', false);
	            $('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').attr('disabled', false);
        	  }        	
        	if(!(nsCore.appModel.selected==='booking' && nsCore.appModel.fetchBOLInfo.sameLPDP==='N')){
        		if(!nsDoc){
		            $('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', false);
		            $('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', false);
        		}
        		else{
                    $('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', 'disabled');
                    $('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', 'disabled');        			
        		}
        		$('.mainBookingDetailsWrap #possVoyages').show();
        		$('.mainBookingDetailsWrap #possVoyagesHide').hide()			        
            }
        }
        //based on Booking status (even one BL - disable all at header level) override all the above conditions.
		if (contractCheck && nsCore.appModel.selected==="booking"){ 
		        	
        	$('.mainBookingDetailsWrap #mainContract').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerOrigin').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerOriginDesc').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerDestination').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerDestinationDesc').attr('disabled', 'disabled');           
            $('.mainBookingDetailsWrap #mainBookDetailCustomerCode').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #mainBookDetailCustomerDesc').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap #possVoyages').hide();
            $('.mainBookingDetailsWrap #possVoyagesHide').show();
            $('.wayCargo').attr('disabled', 'disabled');
            $('.mainLeg').attr('disabled', 'disabled');
            $('.addLeg').hide();
            $('.editLeg').hide();
            $('.deleteLeg').hide();
            $('.removeLeg').hide();
            $('#mCustomerRef').attr('disabled', 'disabled');
            $('#freshBookSaveBtn').attr('disabled',true);
            $('.allocStatusType').attr('disabled',true);
		 }
       
    }
    function doInitFreshSubBook() {
        var bookingID = nsBooking.findBookingID(null), timeStamp = $('.mainBookListCol').find('.ui-selecting').attr(
            'data-timestamp'), url = nsBooking.viewBookingID + bookingID + '&timeStamp=' + timeStamp;
        vmsService.vmsApiService(function(response) {
            if (response) {
                vmsResponseManipulation(response);
                if ($('.selectedRoute:checked').attr('data-consignmentLegId') !== $('.mainLeg:checked').closest('tr').find('.consignmentLegsClass').attr('data-id')) {
            		nsBooking.legChangedAction('D', 'Y');
                }  
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, url, 'POST', null);
    }
    function vmsResponseManipulation(response) {
    	//VMSAG-4420
      	 nsBooking.bookingnoVariable = response.bookingNumber;
        if (response.subBookingModelList) {
            var totUnitObj = {
                'booked' : '',
                'received' : '',
                'loaded' : '',
                'selLeg' : 'checked',
                'legType' : 'M'
            }, loadUnitArr = [];
            if(nsCore.appModel.viewSubBooking && nsCore.appModel.viewSubBooking.subBookingId){
                $.each(response.subBookingModelList, function(i, obj) {
                    if (nsCore.appModel.viewSubBooking.subBookingId === obj.subBookingId) {
                        subBookingModelListResponse(response, obj);
                    }
                })
            }else{
                subBookingModelListResponse(response, response.subBookingModelList[0]);
            }
            $.each(response.subBookingModelList[0].consignmentLegModelList, function(i, obj) {
                loadUnitArr.push(totUnitObj)
            });
            $('#bookingDocOfficeId').val(response.subBookingModelList[0].docOffCompId);
            $('#bookingDocCode').val(response.subBookingModelList[0].docOffCompCode);
            $('#bookingDocDesc').val(response.subBookingModelList[0].docOffCompName);
            nsBooking.loadRouteInfo($('#routeDetailGrid').find('input[name="selectedRoute"]'));
            //since we copy from routedetail from the previous subooking and unitstable is already loaded with previous values we ignore below   
            if($('.mainSubBookFormTitle').attr('data-subBookingTitle') !== 'New Sub Booking') {
             nsBooking.loadUnitsTable(loadUnitArr);
			}
        }
    }
    function subBookingModelListResponse(response, obj) {
        if ($.fn.DataTable.fnIsDataTable($('#routeDetailGrid'))) {
            $.fn.DataTable($('#routeDetailGrid')).destroy();
        }
        if (!obj.consignmentLegModelList) {
            obj.consignmentLegModelList = [];
        }else{
            $.each(obj.consignmentLegModelList, function(){
                this.actionList=[];
            })
        }
        nsBooking.loadROuteDetailsGrid(obj.consignmentLegModelList, $('#isBooking').val());
        nsBooking.populateCargoConsAndThirdParty(obj);
        $('.routeDetailsWrapper').show();
        if (response.sameLPDP === 'N' && nsCore.appModel.lastUserEventTarget === '.createsubbooking') {
            $('.routeDetailsWrapper').hide();
        }
        if (response.sameLPDP === 'Y') {
            $('#mainBookDetailCustomerOrigin').val(response.bookingOriginPort);
            $('#mainBookDetailCustomerOriginDesc').val(response.bookingOriginPortDesc);
            $('#mainBookDetailCustomerDestination').val(response.bookingDestPort);
            $('#mainBookDetailCustomerDestinationDesc').val(response.bookingDestPortDesc);
            nsBookDoc.subBookingdiffOrgDest(false)
        } else {
            if (nsCore.appModel.lastUserEventTarget === '.createNewSubBooking') {
            	var subBookingLegObj=jQuery.extend(true, [], nsCore.appModel.viewSubBooking.consignmentLegModelList)
           	 	$.each(subBookingLegObj, function(){
				   this.actionList=[];
				})
                nsBooking.loadROuteDetailsGrid(subBookingLegObj, 'N');
                $('#mainBookDetailCustomerOrigin').val(nsCore.appModel.viewSubBooking.originPortCode)
                $('#mainBookDetailCustomerOriginDesc').val(nsCore.appModel.viewSubBooking.originPortName)
                $('#mainBookDetailCustomerDestination').val(nsCore.appModel.viewSubBooking.destPortCode)
                $('#mainBookDetailCustomerDestinationDesc').val(nsCore.appModel.viewSubBooking.destPortName)
            } else {
                $('#mainBookDetailCustomerOrigin').val('');
                $('#mainBookDetailCustomerOriginDesc').val('');
                $('#mainBookDetailCustomerDestination').val('');
                $('#mainBookDetailCustomerDestinationDesc').val('');
            }
        }
    }
    function bookingArea(ele) {
        var length = parseFloat(nsBooking.findBookLength(ele)), width = parseFloat(nsBooking.findBookWidth(ele)), area, scale, perUnit, isPerUnit, bookedUnits;
        if ($.isNumeric(length) && $.isNumeric(width) && (length !== '') && (width !== '')) {
            area = length * width;
            scale = nsBooking.findBookType(ele);
            area = nsBooking.getAreaInImp(area, scale);
            perUnit = nsBooking.findBookPerUnit(ele);
            isPerUnit = false;
            if (perUnit === 'YES') {
                isPerUnit = true;
            }
            if (!isPerUnit) {
                bookedUnits = $('#totalBookedUnits').val();
                area = math.eval(area * bookedUnits);
            }
            area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
            $(ele).closest('.mainSubBookingFormWrap').find('#bookedArea').val(area);
        } else {
            $(ele).closest('.mainSubBookingFormWrap').find('#bookedArea').val('');
        }
    }
    function bookingVolume(ele) {
        var length = parseFloat(nsBooking.findBookLength(ele)), width = parseFloat(nsBooking.findBookWidth(ele)), height = parseFloat(nsBooking
            .findBookHeight(ele)), scale, perUnit, volume, isPerUnit, bookedUnits;
        if ($.isNumeric(length) && $.isNumeric(width) && $.isNumeric(height) && (length !== '') && (width !== '')
            && (height !== '')) {
            volume = nsCore.volumeCalc(length , width , height);
            scale = nsBooking.findBookType(ele);
            if (scale === '10') {
                volume = math.eval(volume / 1728);
            }
            perUnit = nsBooking.findBookPerUnit(ele);
            isPerUnit = false;
            if (perUnit === 'YES') {
                isPerUnit = true;
            }
            if (!isPerUnit) {
                bookedUnits = $('#totalBookedUnits').val();
                volume = math.eval(volume * bookedUnits);
            }
            volume= Number(volume<0.000001?volume.toFixed(5): volume);
            volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
            $(ele).closest('.mainSubBookingFormWrap').find('#subBVol').val(volume);
        } else {
            $(ele).closest('.mainSubBookingFormWrap').find('#subBVol').val('');
        }
    }
    function bookperUnitSelected(element) {
        var area = $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val(), volume = $(element)
            .closest('.mainSubBookingFormWrap').find('#subBVol').val(), weight = $(element).closest(
            '.mainSubBookingFormWrap').find('#subBWei').val(), bookedUnits, scale, length, width, weightVal;
        if (nsBooking.isValidWeigVolArea(area, volume, weight)) {
            $(element).closest('.mainSubBookingFormWrap').find('#subBlen').attr('disabled', 'disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#subBWid').attr('disabled', 'disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#subBHei').attr('disabled', 'disabled');
        } else {
            $(element).closest('.mainSubBookingFormWrap').find('#subBlen').removeAttr('disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#subBWid').removeAttr('disabled');
            $(element).closest('.mainSubBookingFormWrap').find('#subBHei').removeAttr('disabled');
        }
        bookedUnits = $('#totalBookedUnits').val();
        nsBooking.bookedTotalArea = area;
        nsBooking.bookedTotalVolume = volume;
        nsBooking.bookedTotalWeight = weight;
        nsBooking.bookedUnitsTotal = bookedUnits;
        if ((bookedUnits !== null) && (bookedUnits.trim() !== '') && (bookedUnits.trim() !== '0')
            && $.isNumeric(bookedUnits)) {
            length = nsBooking.findBookLength(element);
            width = nsBooking.findBookWidth(element);
            scale = nsBooking.findBookType(element);
            if (nsBooking.isValidLengthWidth(length, width)) {
                area = ((length * width));
                area = nsBooking.getAreaInImp(area, scale);
                volume = nsBooking.getSBVolume(element, volume, bookedUnits, scale);
                volume = nsBooking.getBkdVolume(element, volume, bookedUnits, scale);
                area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
                volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
            } else {
                area = nsBooking.getNewArea(area, bookedUnits);
                volume = nsBooking.getNewVolume(volume, bookedUnits);
            }
            if ((weight)) {
                weightVal = weight / bookedUnits;
                weightVal = weightVal.toFixed(0);
                $(element).closest('.mainSubBookingFormWrap').find('#subBWei').val(weightVal);
            }
            $(element).closest('.mainSubBookingFormWrap').find('#bookedArea').val(area);
            $(element).closest('.mainSubBookingFormWrap').find('#subBVol').val(volume);
        } else {
            bookingArea(element);
            bookingVolume(element);
        }
        nsBooking.bookenableDisableDims(element);
    }
    function createFreshSubBooking(element, otherSubBooking) {
        var inco = 0, message = '', cquant, mainBookingFreightBasis, cBasis, cChrType, chComment, cTotal, cRate, cCur, cPayment, includeGrossFr, includeSubBook, numbers = /^[0-9]+$/, inclGrossChecked, inclAllSubBookChecked, content, cargoState, bkMeasType, cargoType, bookedUnits, valChrgRate = '', chargeTypeMsg = '', prepaidMsg = '', chargeBasisMsg = '', rateMsg = '', curencyMsg = '',chrgeContent = '';
        if ($('#subBookingChargesGrid tbody').css('display') !== 'none') {
            $('#subBookingChargesGrid tbody tr').each(
                function() {
                    cquant = $('.chargeQuantity', this).val();
                    cTotal = $('.chargeTotal', this).val();
                    cRate = $('.chargeRate', this).val();
                    cCur = $('.chargeCurrency', this).val();
                    cPayment = $('.chargePayment', this).val();
                    includeGrossFr = 'N';
                    includeSubBook = 'N';
                    inclGrossChecked = $('.chargeGrossFreight', this).is(':checked');
                    includeGrossFr = (inclGrossChecked) ? 'Y' : 'N';
                    inclAllSubBookChecked = $('.chargeSubBookings', this).is(':checked');
                    includeSubBook = (inclAllSubBookChecked) ? 'Y' : 'N';
                    cBasis = $('.chargeBasis', this).val();
                    cChrType = $('.chargeType', this).val();
                    chComment = $('.chargeComments', this).val();
                    if (!chargeTypeMsg) {
                        chargeTypeMsg = nsCore.isCondTrue(!cChrType, 'Charge type is not selected \n', '');
                    }
                    if (!chargeBasisMsg) {
                        chargeBasisMsg = nsCore.isCondTrue(!cBasis, 'Charge Basis is not selected \n', '');
                    }
                    if (!rateMsg) {
                        rateMsg = nsCore.isCondTrue(!cRate, 'Charges Rate should not be empty \n', '');
                    }
                    if (prepaidMsg) {
                        prepaidMsg = nsCore.isCondTrue(!cPayment, 'Charges Payment is not selected \n', '');
                    }
                    if (!valChrgRate && cRate) {
                        valChrgRate = nsBooking.validateFloat('Charges Rate', cRate, 10, 4);
                    }
                    if (!curencyMsg) {
                        curencyMsg = nsCore.isCondTrue(!cCur, 'Charges Currency is not selected \n', '');
                    }
                    if (nsBooking.isChargeRowAvailable(cChrType, cBasis, cRate, chComment, includeGrossFr,
                        includeSubBook, nsBooking.defaultCurrencyCode, cCur, cPayment)) {
                        if ((cChrType !== '') && (cBasis !== '') && (cRate !== '')) {
                            content = cChrType + '<td>' + cBasis + '<td>' + cCur + '<td>' + cRate + '<td>' + cquant
                                + '<td>' + cTotal + '<td>' + cPayment + '<td>' + includeGrossFr + '<td>'
                                + includeSubBook + '<td>' + chComment;
                            if (chrgeContent === '') {
                                chrgeContent = content;
                            } else {
                                chrgeContent = chrgeContent + '<tr>' + content;
                            }
                        }
                        nsBooking.chargeCont = chrgeContent;
                    }
                    inco = inco + 1;
                });
        }
        message = chargeTypeMsg + prepaidMsg + chargeBasisMsg + rateMsg + curencyMsg + valChrgRate;
        message = nsBooking.validateAttribute(element, message);
        mainBookingFreightBasis = $(element).closest('.mainSubBookingFormWrap').find('#mainBookingFreightBasis').val();
        message += (mainBookingFreightBasis === '' ? 'Freight Basis is not selected\n' : '');
        message = nsBooking.getFreightRateMsg(element, message);
        message = nsBooking.getOrigDestCargoTxtNsg(element, message);
        bookedUnits = nsBooking.findBookedUnits(element);
        message = nsBooking.getBkdValidationMsg(message, bookedUnits, numbers);
        message += nsCore.isCondTrue((nsBooking.findDocID() === ''), 'Documentation office should not be empty\n', '');
        cargoType = nsBooking.findCargoType(element);
        message += nsCore.isCondTrue((cargoType === '' || cargoType === '0'), 'Cargo type is not selected\n', '');
        cargoState = nsBooking.findCargoState(element);
        message += nsCore.isCondTrue((cargoState === '' || cargoState === null), 'Cargo state is not selected\n', '');
        bkMeasType = nsBooking.findBookType(element);
        message += nsBooking.getDimensionsValidMsg();
        message += nsCore.isCondTrue((bkMeasType === ''), 'Booked measurement unit should not be empty\n', '');
        if ($('#thirdPartyVoyage').css('visibility') === 'visible') {
            message += nsCore.isCondTrue(
                (nsBooking.findCarrierId(element) === '12' && (nsBooking.findCarrier(element) === '')),
                'Carrier should not be empty\n', '');
            message += nsCore.isCondTrue(nsCore.valiDate($('#estimatedArrival').val()), 'Enter a valid ETA POD Date\n',
                '');
            message += nsCore.isCondTrue(nsCore.valiDate($('#estimatedDeparture').val()),
                'Enter a valid ETD POL Date\n', '');
            message += nsCore.isCondTrue(nsCore.compareDates($('#estimatedDeparture').val(), $('#estimatedArrival')
                .val()), 'ETD POL date cannot be greater than ETA POD date', '');
        }
        if (message.trim() === '') {
                nsBooking.doFresSub(element, otherSubBooking);
        } else {
            nsCore.showAlert(message.trim());
        }
    }

    function enabOrDisaRate(element) {
        var origin = nsBooking.findSourcePortID(element), perUnit, destination = nsBooking.findDestiPortID(element), isperUnit, bookedUnits = nsBooking
            .findBookedUnits(element), bkLength, bkWeight = nsBooking.findBookWeight(element), bkWidth, bkArea = nsBooking
            .findBookArea(element), bkHeight, bkVolume = nsBooking.findBookVolume(element), cargoType = nsBooking
            .findCargoType(element), cargoState = nsBooking.findCargoState(element), isNew = nsBooking
            .findAttribute(element);
        if (nsBooking.isAllFieldsEmpty(origin, destination, bookedUnits, bkWeight, bkArea, bkVolume, cargoType,
            cargoState, isNew)) {
            nsBooking.isEnableRateButton(false);
            return;
        }
        perUnit = nsBooking.findBookPerUnit(element);
        isperUnit = false;
        if (perUnit === 'YES') {
            isperUnit = true;
        }
        if (isperUnit) {
            bkLength = nsBooking.findBookLength(element);
            bkWidth = nsBooking.findBookWidth(element);
            bkHeight = nsBooking.findBookHeight(element);
            if (((bkLength === '') || (bkWidth === '') || (bkHeight === '')) && (bkVolume ==='') ) {
                nsBooking.isEnableRateButton(false);
                return;
            }
        }
        nsBooking.isEnableRateButton(true);
    }
    function validateFreightedFields(basis, rate, currency, payment, commission, msg, newCargoDisabled, newCargo) {
        //only new/used selected validation will be done
    	if (!newCargo) {
            msg = msg + 'New/Used is not selected ' + '\n';
        }
        msg = getBasisValidationMsg(basis, msg);
        msg = getRateValidationMsg(rate, msg);
        if (commission) {
            msg = msg + nsBooking.validateFloat('Commission', commission, 2, 2);
        }
        if (!currency) {
            msg = msg + 'Freight Currency is not selected ' + '\n';
        }
        if (!payment) {
            msg = msg + 'Freight Payment is not selected ' + '\n';
        }
        return msg;
    }
    function getBasisValidationMsg(basis, msg) {
        if (!basis) {
            msg = msg + 'Freight Basis is not selected' + '\n';
        }
        return msg;
    }
    function getRateValidationMsg(rate, msg) {
        if (!rate) {
            msg = msg + 'Freight Rate should not be empty' + '\n';
        } else {
            msg = msg + nsBooking.validateFloat('Freight Rate', rate, 10, 4);
        }
        return msg;
    }
    $(document).ready(
        function() {
            $('#totalUnitsGrid').on('keyup', '.totalBookedUnits', function(e) {
                $('input.totalBookedUnits').val($(this).val());
            });
            $('#mainSubBookingFormCancel').click(
                function() {
                    // to Show popup if any data has been changed.
                    if (nsBooking.globalBookingFlag.mainBookingFlag) {
                        nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                            nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                        return false;
                    } else {
                        if ($('.mainSubBookFormTitle').attr('data-subBookingTitle') === 'New Sub Booking') {
                            $('.scndLevel.singleColItem.activeSubBook').trigger('click');
                        }
                    }
                });
            $('.voyageTransportationType').on('change', function() {
                var selectedTransportVal = $(this).val();
                if (selectedTransportVal === '20') {
                    $('#voyageCarrier').removeAttr('disabled');
                } else {
                    $('#voyageCarrier').attr('disabled', 'disabled');
                    $('#voyageCarrier').val('');
                    $('.carrierOtherDetails').attr('disabled', 'disabled');
                    $('.carrierOtherDetails').val('');
                }
                if (selectedTransportVal === '10' || selectedTransportVal === '') {
                    $('input[name="EstimatedArrival"]').attr('disabled', 'disabled');
                    $('input[name="EstimatedDeparture"]').attr('disabled', 'disabled');
                    $('input[name="EstimatedArrival"]').val('');
                    $('input[name="EstimatedDeparture"]').val('');
                } else {
                    $('input[name="EstimatedArrival"]').removeAttr('disabled');
                    $('input[name="EstimatedDeparture"]').removeAttr('disabled');
                }
            });
            $('#voyageCarrier').on('change', function() {
                var selectedCarrier = $('#voyageCarrier').val();
                if (selectedCarrier === '12') {
                    $('.carrierOtherDetails').prop('disabled', false);
                } else {
                    $('.carrierOtherDetails').prop('disabled', true);
                    $('.carrierOtherDetails').val('');
                }
            });
            // cargo list apply all functionality
            $(document).on('click', '.VINApplyAllItem', function() {
                var cargoVINNbrData = $('input[name="cargoVIN"]').val(), isValidLengthText = true;
                if (cargoVINNbrData.length > 18) {
                    isValidLengthText = false;
                }
                if (!isValidLengthText) {
                    nsCore.showAlert('VIN is too long');
                } else {
                    $('.cargoVinNbr').val(cargoVINNbrData);
                    $('input[name="cargoVIN"]').val('')
                }
            });
            $('.freightTotal').change(function() {
                nsBooking.calculateFreightTotal();
            });
            $(document).on('keydown', '#mainBookingFreightRate.freightTotal', function() {
				nsCore.validateDecimals(this.id, "mainBookingFreightCurrency");
				$('#mainBookingFreightRate.freightTotal').triggerHandler( "change" );
            });
            $(document).on('change blur', '#mainBookingFreightRate.freightTotal', function() {
                $(this).val(nsCore.roundingNumbers(this.value, "mainBookingFreightCurrency"));
            });
            $('#mainBookingFreightCurrency').change(
                function() {
                    var rateVal = $('#mainBookingFreightRate').val();
                    $('input[name="mainBookingFreightRate"]').val(
                        nsCore.roundingNumbers(rateVal, "mainBookingFreightCurrency"));
                    nsBooking.calculateFreightTotal();
                });
            $(document).on('keydown', '.chargeRate', function() {
                nsCore.validateDecimals(this, "chargesCol");
                $('.chargeRate').triggerHandler( "change" );
            });
            $(document).on(
                'change blur',
                '.chargeRate',
                function() {
                    var srcCurrencyValue = $(this).parents('tr').find('.chargeCurrency').val();
                    var rateValue = $(this).parents('tr').find('.chargeRate').val();
                    $(this).parents('tr').find('.chargeRate').val(
                        nsCore.roundingNumbersCharges(rateValue, srcCurrencyValue, ""));
                    nsBookDoc.updateSubBookingQuantity(this);
                });
            $(document).on(
                'change',
                '.chargeCurrency',
                function() {
                    var srcCurrencyValue = $(this).parents('tr').find('.chargeCurrency').val();
                    var rateValue = $(this).parents('tr').find('.chargeRate').val();
                    $(this).parents('tr').find('.chargeRate').val(
                        nsCore.roundingNumbersCharges(rateValue, srcCurrencyValue, ""));
                    var chargeTotalValue = $(this).parents('tr').find('.chargeTotal').val();
                    $(this).parents('tr').find('.chargeTotal').val(
                        nsCore.roundingNumbersCharges(chargeTotalValue, srcCurrencyValue, ""));
                });
            
            $(document).on('change', '#mainBookingFreightPayment', function() {
	           	 var srcCurrencyValueFreight = $(this).val();
	           	$('#subBookingChargesGrid tbody tr').each(function() {
	                  $(this).find('#chargePayment').val(srcCurrencyValueFreight);
	               });
	           });  
            
        });
    subBookingUtilsObj = {
        'populateCargoStates' : populateCargoStates,
        'copyToFre' : copyToFre,
        'setFrLenWidth' : setFrLenWidth,
        'setFrAreaVolume' : setFrAreaVolume,
        'getCargoStateList' : getCargoStateList,
        'legChangedAction' : legChangedAction,
        'doInitFreshSubBook' : doInitFreshSubBook,
        'bookingArea' : bookingArea,
        'bookingVolume' : bookingVolume,
        'bookperUnitSelected' : bookperUnitSelected,
        'createFreshSubBooking' : createFreshSubBooking,
        'enabOrDisaRate' : enabOrDisaRate,
        'validateFreightedFields' : validateFreightedFields,
        'getBasisValidationMsg' : getBasisValidationMsg,
        'getRateValidationMsg' : getRateValidationMsg,
        'loadUnitsTable' : loadUnitsTable,
        'legDetailsDisble' : legDetailsDisble
    };
    $.extend(true, nsBooking, subBookingUtilsObj);
})(this.booking, jQuery, this.vmsService, this.core, this.doc, this.bookDoc);
