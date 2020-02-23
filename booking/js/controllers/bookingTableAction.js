/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    function updateUnitstable(legInd) {
    	$('#totalUnitsGrid tbody tr:nth-child('+ (legInd + 1) +')').find('.totalBookedUnits').attr('disabled', false);
    	$('#totalUnitsGrid tbody tr:not(tr:nth-child('+ (legInd + 1) +'))').find('.totalBookedUnits').attr('disabled', true);
    }
    
    function populateThirdPartyDtl(thirdObj) {
        var arrDate, depDate, shipOnBoard = '', currConsId = '';
        $('#thirdPartyVoyage').css('visibility', 'visible');
        $('select[name="voyageTransportationType"]').val($(thirdObj).attr('data-transpType'));
        $('select[name="voyageCarrier"]').val($(thirdObj).attr('data-carrierName'));
        $('input[name="voyageCarrierRef"]').val($(thirdObj).attr('data-carrierRef'));
        if (nsBooking.textNullCheck(!$('select[name="voyageTransportationType"]').val())) {
            $('input[name="EstimatedArrival"]').prop('disabled', true);
            $('input[name="EstimatedDeparture"]').prop('disabled', true);
        } else {
            $('input[name="EstimatedArrival"]').prop('disabled', false);
            $('input[name="EstimatedDeparture"]').prop('disabled', false);
            arrDate = nsBooking.textNullCheck($(thirdObj).attr('data-estimArrDate'));
            depDate = nsBooking.textNullCheck($(thirdObj).attr('data-estimDepDate'));
            $('input[name="EstimatedArrival"]').val(arrDate);
            $('input[name="EstimatedDeparture"]').val(depDate);
        }
        if ($(thirdObj).attr('data-transpType') === '20') {
            $('#voyageCarrier').prop('disabled', false);
        } else {
            $('#voyageCarrier').prop('disabled', true);
        }
        if ($(thirdObj).attr('data-carriername') === '12') {
            $('.carrierOtherDetails').prop('disabled', false).val($(thirdObj).attr('data-crName'));
        } else {
            $('.carrierOtherDetails').prop('disabled', true).val('');
        }
        currConsId = 'id' + $(thirdObj).attr('data-consignmentlegid');
        shipOnBoard = ((nsBookDoc.cargoConsignmentsVD[currConsId] || '').shippedOnBoard === 'Y') ? true : false;
        $('input[name="shippedOnboard"]').attr('checked', shipOnBoard);
    }
    function populateThirdPartySubContent(thirdObj) {
        if (nsBooking.textNullCheck($(thirdObj).attr('data-vesselvoyage'))) {
            $('#thirdPartyVoyage').css('visibility', 'hidden');
        } else {
            populateThirdPartyDtl(thirdObj);
        }
        if (nsBooking.textNullCheck($(thirdObj).val())) {
            if ($(thirdObj).closest('tr').find('input[name="mainLeg"]').is(':checked')) {
                nsBooking.legChangedAction('E', 'N');
            } else {
                nsBooking.legChangedAction('D', 'N');
            }
        }
    }
    $(document).ready(function() {
        $('#routeDetailGrid').on('change', 'input[name="selectedRoute"]', function() {
                var consNo = $(this).attr('data-consNo'), blStat = '',
                blStatus = ($(this).attr('data-conslegstatus') && $(this).attr('data-conslegstatus') === 'null') ? $('.activeNavigationItem').attr('data-bolstatus') : $(this).attr('data-conslegstatus'),
            	legInd = $('#routeDetailGrid').DataTable().row($(this).parent().parent()).index();
            updateUnitstable(legInd);
            $('select[name="bookingAllocStatus"]').removeAttr('disabled');
            $('select[name="voyageTransportationType"]').val('');
            $('select[name="voyageCarrier"]').val('');
            $('input[name="voyageCarrierRef"]').val('');
            $('input[name="EstimatedArrival"]').val('');
            $('input[name="EstimatedDeparture"]').val('');
            $('input[name="shippedOnboard"]').removeAttr('checked');
            $('select[name="bookingAllocStatus"]').val($(this).attr('data-isFirm'));
            populateThirdPartySubContent($(this));
            $('input[name="bookingComments"]').val($(this).attr('data-comment'));
            $('select[name="bookingAllocStatus"]').val($(this).attr('data-isFirm'));
            if ($(this).attr('data-cargoEquipmentNbr') === '-1') {
                $('select[name="cargoEquipmentNbr"]').val('');
                $('input[name="cargoEquipmentType"]').val('');
                $('#cargoEquipmentNbr').attr('disabled', 'disabled');
            } else {
                $('select[name="cargoEquipmentNbr"]').val($(this).attr('data-cargoEquipmentNbr'));
                $('input[name="cargoEquipmentType"]').val($(this).attr('data-equipType'));
                $('select[name="cargoEquipmentNbr"]').removeAttr('disabled');
                nsBooking.populateEquipment($(this).attr('data-cargoEquipmentNbr'));
            }
            if ($(this).attr('data-cargoOnHold') === '-1') {
                $('#subCOH').prop('checked', true);
                $('#subCOH').attr('disabled', 'disabled');
            } else {
                $('#subCOH').prop('checked', $(this).attr('data-cargoOnHold') === 'Y');
                $('#subCOH').removeAttr('disabled');
            }
            if ($('.selectedRoute:checked').attr('data-consignmentLegId') === $('.mainLeg:checked').closest('tr').find('.consignmentLegsClass').attr('data-id')) {
            	nsBookDoc.panelActions('freightsAndCharges', 'open');
                $('.freightsAndCharges .accHeader').removeClass('disabledHeader');
            } else {
            	nsBookDoc.panelActions('freightsAndCharges', 'close');
            	$('.freightsAndCharges .accHeader').addClass('disabledHeader');
            }
            if (nsCore.appModel.viewSubBooking.bolStatus === "10") {
            	nsBooking.legDetailsDisble();
            }
            nsBooking.updateConsNo(consNo, '');
            if (nsBooking.textNullCheck(blStatus) !== '' && blStatus !== '10') {
                nsBooking.legChangedAction('D', 'N');
                nsBooking.disableFieldForBL();
                if ($(this).val() === 'M') {
                    $('#cargoListLink').removeAttr('disabled');
                    $('#cargoListLink').unbind('click', false);
                    $('#totalUnitsGrid th').removeClass('disableHandCursor');
                    $('#cargoListLink').bind('click');
                    $('.mainSubBookingFormWrap').find('#cargoListLink').removeAttr('disabled');
                    $('.mainSubBookingFormWrap').find('#cargoListLink').removeClass('disabledBut');
                }
            }
            $('#bookingAllocStatus').val($(this).parent().parent().find('.allocStatusType').val());
            if(nsCore.appModel.selected === 'subBooking'){
            	$('.thrdLevel.activeNavigationItem').attr('data-currentlegid', $(this).attr('data-consignmentlegid'));
            	if($('.thrdLevel.activeNavigationItem').find('.expandSubBooking').hasClass('fa-minus')){
            		$('.frthLevel').remove();
            		$('.thrdLevel.activeNavigationItem').find('.expandSubBooking').trigger('click');
            		$('.thrdLevel.activeNavigationItem').find('.expandSubBooking').removeClass('fa-plus').addClass('fa-minus');
            	}
            } 
            else {
            	//show corresponding leg status in Bl when search by other leg vessel voyage and selected leg is not main leg. all other cases main leg status will be shown as Booking status.
            	if(blStatus >= 30 && $('#billStatusDesc').val() && ($('.selectedRoute:checked').attr('data-consignmentLegId') !== $('.mainLeg:checked').closest('tr').find('.consignmentLegsClass').attr('data-id')) ){            	
	            	blStat = nsBookDoc.detectConsStatusType(blStatus, nsBooking.bolPrintedStauts);
	                blStat = (blStat === 'Printed' ? 'Issued and Printed' : blStat);
	                $('#billStatusDesc').val(blStat);
            	 }            
            }
            
            legChangedActionCall('mainLeg',$(this))
            nsBookDoc.diffOfficeValidation(nsBookDoc.detectConsStatusType(blStatus))
	            
        });
        // validate Enable and disable sub booking fields on change of main leg option
        $('#routeDetailGrid').on('change', 'input[name="mainLeg"]', function() {
        	var legInd = $('#routeDetailGrid').DataTable().row($(this).parent().parent()).index();
        	updateUnitstable(legInd);
            if ($(this).is(':checked')) {
            	legChangedActionCall('selectedRoute',$(this))
            }
            
            if ($('.selectedRoute:checked').attr('data-consignmentLegId') === $('.mainLeg:checked').closest('tr').find('.consignmentLegsClass').attr('data-id')) {
            	nsBookDoc.panelActions('freightsAndCharges', 'open');
                $('.freightsAndCharges .accHeader').removeClass('disabledHeader');
            } else {
            	nsBookDoc.panelActions('freightsAndCharges', 'close');
            	$('.freightsAndCharges .accHeader').addClass('disabledHeader');
            }
        });
        function legChangedActionCall(event,obj){
        	if(nsCore.appModel.selected === 'subBooking'){
	        	 if (obj.closest('tr').find('input[name="'+ event +'"]').is(':checked') && nsCore.appModel.viewSubBooking.bolStatus === "10") {
	             	 nsBooking.legChangedAction('E', 'N');
		          } else {
	                 nsBooking.legChangedAction('D', 'N');
	                 $('.totalBookedUnits').attr('disabled', true);
	             }
        	}
        	
        }
        $(document).on('click', '#routeDetailGrid .addLeg', function() {
            var isLoaded = $(this).attr('data-isLoaded'),
                isReceived = $(this).attr('data-isReceived'),
                isNxtReceived = $(this).attr('data-isNextReceived'),
                isNxtLoaded = $(this).attr('data-isNextLoaded'),
                loadTerm = nsBooking.textNullCheck($(this).attr('data-loadTerminal')),
                isLoadTerm = $(this).attr('data-isSameLoadTerm'),
                discTerm = nsBooking.textNullCheck($(this).attr('data-discterminal')),
                isDiscTerm = $(this).attr('data-isSameDiscTerm');
            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                nsBooking.globalBookingFlag.isDynamicEle = true;
                nsBooking.globalBookingFlag.dynamicEleType = 'routeDetailGrid';
                nsBooking.globalBookingFlag.dynamicEleRowNum = $(this).closest('tr').index();
                nsBooking.globalBookingFlag.dynamicEleClass = 'addLeg';
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
                    'mainBookingFlag', $(this));
                return false;
            }
            addEditLegValidation(this)
            nsBookDoc.prevLegETA=(($(this).attr('data-eta') && $(this).attr('data-eta')!== "null") ?$(this).attr('data-eta').split(" ")[0]:"");
            nsBooking.mainBookingFlag.addGetPossibleVoyage = false;
            $('#isBooking').val('');
            $('#currentLoadPortTerminal').val('');
            $('#currentDiscPortTerminal').val('');
            $('#nextLoadPortTerminal').val('');
            $('#nextDiscPortTerminal').val('');
            $('#consignmentNo').val($(this).attr('data-consignmentNo'));
            $('#currentLoadPortCode').val($(this).attr('data-loadPort'));
            $('#currentLoadPortDesc').val($(this).attr('data-loadPortName'));
            $('#nextLoadPortCode').val('');
            $('#nextLoadPortDesc').val('');
            $('#currentDiscPort').val($(this).attr('data-discport'));
            $('#currentDiscPortCode').val('');
            $('#currentDiscPortDesc').val('');
            $('#nextDiscPortCode').val($(this).attr('data-discPort'));
            $('#nextDiscPortDesc').val($(this).attr('data-discPortName'));
            $('#nextDiscPortCode').attr('disabled', 'disabled');
            $('#nextDiscPortDesc').attr('disabled', 'disabled');
            $('#currentLoadPortCallId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-loadPortCallVoyageId'));
            $('#currentDiscPortCallId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-discPortCallVoyageId'));
            $('#nextLoadPortCallId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-nextLoadPortCallVoyageId'));
            $('#nextDiscPortCallId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-nextDiscPortCallVoyageId'));
            $('#nextConsignmentLegId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-nextConsignmentId'));
            $('#currentDiscPortCode').prop('readonly', false).val('');
            $('#currentDiscPortDesc').prop('readonly', false).val('');
            $('#legId').val($(this).attr('data-id'));
            $('#consignmentId').val($(this).attr('data-consignmentId'));
            $('#isBooking').val($(this).attr('data-isBooking'));
            $('#consType').val($(this).attr('data-consType'));
            $('#legTimeStamp').val($(this).closest('tr').find('.selectedRoute').attr('data-timestamp'));
            $('#currentLoadPortVoyId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-loadPortCallVoyageId'));
            $('#currentDiscPortVoyId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-discPortCallVoyageId'));
            $('#currentLoadPortVessel').val($(this).attr('data-vessel'));
            $('#currentLoadPortVoyNo').val($(this).attr('data-voyage'));
            $('#nextLoadPortVoyId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-nextLoadPortCallVoyageId'));
            $('#nextDiscPortVoyId').val($(this).closest('tr').find('.consignmentLegsClass').attr('data-nextDiscPortCallVoyageId'));
            $('#isLoadedUnits').val(isLoaded);
            $('#isReceivedUnits').val(isReceived);
            nsBooking.mainBookingFlag.initialAddLoad = true;
            $('#isNxtLoadedUnits').val(isNxtLoaded);
            $('#isNxtReceivedUnits').val(isNxtReceived);
            $('#nextLoadPortVessel').val($(this).attr('data-nextLoadPortCallVoyageId'));
            $('#nextLoadPortVoyNo').val($(this).attr('data-nextDiscPortCallVoyageId'));
            nsBooking.populateTerminalChanges('#currentLoadPortCode', loadTerm, '#currentLoadPortTerminal', isLoadTerm);
            if (nsBooking.textNullCheck($('#nextDiscPortCode').val()) !== '') {
                nsBooking.populateTerminalChanges('#nextDiscPortCode', discTerm, '#nextDiscPortTerminal', isDiscTerm);
            }
            if (nsBooking.textNullCheck($('#currentDiscPortCode').val()) !== '') {
                nsBooking.populateTerminalChanges('#currentDiscPortCode', discTerm, '#currentDiscPortTerminal', isDiscTerm);
            }
            nsBooking.enableDisableAddLegTerm(isLoaded, isReceived, isLoadTerm);
          //added for 4787
            if($(this).attr('data-isLoaded') === 'Y' || $(this).attr('data-isNextLoaded') === 'Y'){
            	nsBooking.prevVoyCheck = true;
            } else{
            	nsBooking.prevVoyCheck = false;
            }
            $('#addCarriageLegPopup').dialog({
                modal : true,
                resizable : false,
                draggable : false,
                width : '70%',
                close : function() {
                    nsBooking.mainBookingFlag.initialAddLoad = false;
                },
                open : function() {
                    var addCarriageGridList = [ 'addMainCarriageLegGrid', 'addCarriageLegGrid' ];
                    nsBooking.clearAddEditPopups('addCarriageLegPopup', addCarriageGridList, 'addCarriageVoyageDetails',
                        'addCarriagePrevVoyages');
                    nsBooking.mainBookingFlag.initialAddLoad = true;
                    $('.addCarriageVoyageDetails').trigger('click');
                }
            });
        });
        function addEditLegValidation(that){
        	if($(that).closest('tr').closest('tbody').find('tr').length > 0){
                var ind, legDate = '', selectedInd = $(that).closest('tr').find('.selectedRoute').index('.selectedRoute'),
                	totRowCount = $(that).closest('tr').closest('tbody').find('tr').length;
                nsBooking.editLegNxtSDate="";
                nsBooking.editLegSDate=""; //VMSAG-4421-08/03- Alert "ETA of current leg's Discharge port must be less than ETD of next leg's Load port wrongly display
                if(selectedInd === 0){
                    ind = selectedInd + 1;
                    if($(that).hasClass('editLeg')){
                    	ind += 1
            		}
                    for(var i = ind ; i < totRowCount ; i++){
                    	if(nsBooking.textNullCheck($($('.selectedRoute')[i]).attr('data-estimdepdate')) && !nsBooking.editLegNxtSDate){
                        	nsBooking.editLegNxtSDate = $($('.selectedRoute')[i]).attr('data-estimdepdate');
                    	}
                    }   
                }
                if(selectedInd > 0){
                    ind = selectedInd - 1;
                    for(var k = ind ; k >= 0 ; k--){
                    	if(nsBooking.textNullCheck($($('.selectedRoute')[k]).attr('data-estimarrdate')) && !legDate){
                    		legDate = $($('.selectedRoute')[k]).attr('data-estimarrdate');
                    	}
                    }
                    nsBooking.editLegSDate = legDate.split(' ')[0];
                }
                if(selectedInd < $(that).closest('tr').closest('tbody').find('tr').length-1 && selectedInd!==0){
                    ind = selectedInd + 1;
                    if($(that).hasClass('editLeg')){
                    	ind += 1
            		}
                    for(var j = ind ; j < totRowCount ; j++){
                    	if(nsBooking.textNullCheck($($('.selectedRoute')[j]).attr('data-estimdepdate')) && !nsBooking.editLegNxtSDate){
                        	nsBooking.editLegNxtSDate = $($('.selectedRoute')[j]).attr('data-estimdepdate');
                    	}
                    }
                }
                nsBooking.editLegNxtSDate = nsBooking.editLegNxtSDate.split(' ')[0]

            }
        }
        // edit Leg process
        $(document).on('click', '#routeDetailGrid .editLeg', function() {
            var isLoaded = $(this).attr('data-isLoaded'),
                isReceived = $(this).attr('data-isReceived'),
                isNxtReceived = $(this).attr('data-isNextReceived'),
                isNxtLoaded = $(this).attr('data-isNextLoaded'),
                loadTerm = nsBooking.textNullCheck($(this).attr('data-loadTerminal')),
                isLoadTerm = $(this).attr('data-isSameLoadTerm'),
                discTerm = nsBooking.textNullCheck($(this).attr('data-discTerminal')),
                isDiscTerm = $(this).attr('data-isSameDiscTerm'),
                isDischarged = $(this).attr('data-isDischarged'),
                isNxtDischarged = $(this).attr('data-isNextDischarged'),
                userBookOffice= $(this).attr('data-userbookoffice'),
                nxtDiscPortCode=$(this).attr('data-nextdiscportcode'),
                nextLoadTerm, isNextLoadTerm, nextDiscTerm, isNextDiscTerm;
            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                nsBooking.globalBookingFlag.isDynamicEle = true;
                nsBooking.globalBookingFlag.dynamicEleType = 'routeDetailGrid';
                nsBooking.globalBookingFlag.dynamicEleRowNum = $(this).closest('tr').index();
                nsBooking.globalBookingFlag.dynamicEleClass = 'editLeg';
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
                    'mainBookingFlag', $(this));
                return false;
            }
            nsBooking.mainBookingFlag.editGetPossibleVoyage = false;
            nsBooking.editDiscPort = $(this).attr('data-discport');
            $('#currentEditDiscPortCode').prop('disabled', false);
            $('#currentEditDiscPortDesc').prop('disabled', false);
            $('#currentEditLoadPortTerminal').val('');
            $('#currentEditDiscPortTerminal').val('');
            $('#nextEditLoadPortTerminal').val('');
            $('#nextEditDiscPortTerminal').val('');
            $('#isBooking').val('');
            $('#consignmentNoEdit').val($(this).attr('data-consignmentNo'));
            $('#currentEditLoadPortCode').val($(this).attr('data-loadPort'));
            $('#currentEditLoadPortDesc').val($(this).attr('data-loadPortName'));
            $('#currentRouteDiscPortCode').val($(this).attr('data-discPort'));
            $('#currentEditDiscPortCode').val($(this).attr('data-discPort'));
            $('#currentEditDiscPortDesc').val($(this).attr('data-discPortName'));
            $('#currentEditDiscPort').val($(this).attr('data-discPort'));
            $('#currentDiscPortCodeOrg').val($(this).attr('data-discPort'));
            $('#currentDiscPortCodeOrgDesc').val($(this).attr('data-discPortName'));
            // To hide Next leg if LP & DP is Null
            if ($(this).attr('data-nextLoadPortCode') === 'null'
                && $(this).attr('data-nextDiscPortCode') === 'null') {            	
            	 if ($(this).attr('data-isdischarged') === 'N') {
                     $('#currentEditDiscPortCode').prop('disabled', false);
                     $('#currentEditDiscPortDesc').prop('disabled', false);
                 } else {
                     $('#currentEditDiscPortCode').prop('disabled', true);
                     $('#currentEditDiscPortDesc').prop('disabled', true);
                 }
                $('#editNextLegWrapper').hide();
            }
            $('#nextEditLoadPortCode').val($(this).attr('data-nextLoadPortCode'));
            $('#nextEditDiscPortCode').val($(this).attr('data-nextDiscPortCode'));
            $('#nextEditLoadPortDesc').val($(this).attr('data-nextLoadPortDesc'));
            $('#nextEditDiscPortDesc').val($(this).attr('data-nextDiscPortDesc'));
            $('#currentEditLoadPortCallId').val($(this).attr('data-loadPortCallVoyageId'));
            $('#currentEditDiscPortCallId').val($(this).attr('data-discPortCallVoyageId'));
            $('#currentLoadPortCallVoyId').val($(this).attr('data-loadPortCallVoyageId'));
            $('#currentDiscPortCallVoyId').val($(this).attr('data-discPortCallVoyageId'));
            $('#currentLoadPortCallVessel').val($(this).attr('data-vessel'));
            $('#currentLoadPortCallVoyNo').val($(this).attr('data-voyage'));
            $('#nextEditLoadPortCallId').val($(this).attr('data-nextLoadPortCallVoyageId'));
            $('#nextEditDiscPortCallId').val($(this).attr('data-nextDiscPortCallVoyageId'));
            $('#nextLoadPortCallVoyId').val($(this).attr('data-nextLoadPortCallVoyageId'));
            $('#nextDiscPortCallVoyId').val($(this).attr('data-nextDiscPortCallVoyageId'));
            $('#nextLoadPortCallVessel').val($(this).attr('data-nextLoadPortCallVoyageId'));
            $('#nextDiscPortCallVoyNo').val($(this).attr('data-nextDiscPortCallVoyageId'));
            $('#nextEditConsignmentLegId').val($(this).attr('data-nextConsignmentId'));
            $('#nextEditConsignmentType').val($(this).attr('data-NextConsType'));
            $('#editlegId').val($(this).attr('data-id'));
            $('#legTimeStamp').val($(this).closest('tr').find('.selectedRoute').attr('data-timestamp'));
            $('#consignmentId').val($(this).attr('data-consignmentId'));
            $('#isBooking').val($(this).attr('data-isBooking'));
            $('#editConsType').val($(this).attr('data-consType'));
            $('#isLoadedUnits').val(isLoaded);
            $('#isReceivedUnits').val(isReceived);
            $('#isNxtLoadedUnits').val(isNxtLoaded);
            $('#isNxtReceivedUnits').val(isNxtReceived);
            // we disable Dp whose on carraige leg has a received cargo
            if($('#isNxtReceivedUnits').val()=== 'Y'){
            	 $('#currentEditDiscPortCode').prop('disabled', true);
            	 $('#currentEditDiscPortDesc').prop('disabled', true);
            }
            if(userBookOffice==='N' && (nxtDiscPortCode==='null' || nxtDiscPortCode===null || nxtDiscPortCode==='') && nsBookDoc.getIsHoeghCompany() === 'N'){
                $('#currentEditDiscPortDesc').prop('disabled', true);
                 $('#currentEditDiscPortCode').prop('disabled', true);
                
            }
            nsBooking.populateTerminalChanges('#currentEditLoadPortCode', loadTerm, '#currentEditLoadPortTerminal',
                isLoadTerm);
            nsBooking.populateTerminalChanges('#currentEditDiscPortCode', discTerm, '#currentEditDiscPortTerminal',
                isDiscTerm);
            if (nsBooking.textNullCheck($('#nextEditLoadPortCode').val())) {
                nextLoadTerm = nsBooking.textNullCheck($(this).attr('data-nextLoadTerminal'));
                isNextLoadTerm = $(this).attr('data-isNextLoadTerm');
                nsBooking.populateTerminalChanges('#nextEditLoadPortCode', nextLoadTerm, '#nextEditLoadPortTerminal',
                    isNextLoadTerm);
            }
            if (nsBooking.textNullCheck($('#nextEditDiscPortCode').val())) {
                nextDiscTerm = nsBooking.textNullCheck($(this).attr('data-nextDiscTerminal'));
                isNextDiscTerm = $(this).attr('data-isNextDiscTerm');
                nsBooking.populateTerminalChanges('#nextEditDiscPortCode', nextDiscTerm, '#nextEditDiscPortTerminal',
                    isNextDiscTerm);
            }
            $('#currentEditLoadPortTerminal').prop('disabled', (isLoaded === 'Y'));
            $('#nextEditLoadPortTerminal').prop('disabled', (isNxtLoaded === 'Y'));
            $('#currentEditDiscPortTerminal').prop('disabled', (isDischarged === 'Y'));
            $('#nextEditDiscPortTerminal').prop('disabled', (isNxtDischarged === 'Y'));
            addEditLegValidation(this)
            //added for 4787
            if($(this).attr('data-isLoaded') === 'Y' || $(this).attr('data-isNextLoaded') === 'Y'){
            	nsBooking.prevVoyCheck = true;
            } else{
            	nsBooking.prevVoyCheck = false;
            }
            nsBookDoc.addEditLeglabel();
            $('#editCarriageLegPopup').dialog({
                modal : true,
                resizable : false,
                draggable : false,
                width : '80%',
                beforeClose : function() {
                	nsBooking.editLegSDate = '';
                    nsBooking.mainBookingFlag.initialEditLoad = false;
                    $('#editNextLegWrapper').show();
                    $(this).find('input[type=text]').removeAttr('data-form');
                },
                open : function() {
                    var editCarriageGridList = [ 'editCarriageLegGrid', 'editMainCarriageLegGrid' ];
                    nsBooking.clearAddEditPopups('editCarriageLegPopup', editCarriageGridList,
                        'editCarriageVoyageDetails', 'editCarriagePrevVoyages');
                    nsBooking.mainBookingFlag.initialEditLoad = true;
                    $('.editCarriageVoyageDetails').trigger('click');
                }
            });
        });
    });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);