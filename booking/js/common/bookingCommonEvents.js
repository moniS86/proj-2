/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var dateFormat = localStorage.getItem('dateFormat');
    function setValueToBlInformation(textField) {
        var closestDropDown = $(textField).parents('tr').find('.blCommentsOptions'), comType = $(closestDropDown).find(
            'option:selected').attr('type');
        if (comType === "50") {
            nsBooking.setPayableAt($(textField).val());
        } else {
            if (comType === "60") {
                nsBooking.setIssuedAt($(textField).val());
            }
        }
    }
    // function to check mendatory fields
    function checkEmptySearchMandatory() {
        // Change class names
        var check = [
            '#vesselCode', '#vesselName', '#voyage', '#custCode', '#loadPort', '#discPort', '#originPort', '#destPort'
        ], i = 0;
        for (i = 0; i < check.length; i++) {
            if ($(check[i]).val() !== '') {
            	if(check[i] === "#vesselCode" &&  $("#voyage").val()=== ''){
                    return false;
                 }
                 return true;
            }
        }
        return false;
    }
    function fnPrintSettingsForward() {
        var listPrint = [], bilOfLading = {};
        $('#viewPrintSettingsGrid tbody tr').each(function() {
            var origin = 'N', copy = 'N', manifest = 'N';
            if ($(this).find('.origin').is(':checked')) {
                origin = 'Y';
            }
            if ($(this).find('.copy').is(':checked')) {
                copy = 'Y';
            }
            if ($(this).find('.mani').is(':checked')) {
                manifest = 'Y';
            }
            listPrint.push({
                infoType : $(this).find('.attribute').attr('data-type'),
                printInBol : origin,
                printInBolCopy : copy,
                printInManifest : manifest,
                bolID : $('#billId').val(),
                timeStamp : $(this).find('.printRowTimeStamp').val()
            });
        });
        bilOfLading = {
            bolPrintInfoList : listPrint,
            id : $('#billId').val(),
            moduleType : 'BOOK'
        };
        vmsService.vmsApiServiceType(function(response) {
            if (response) {
                if (response.responseDescription === 'Success') {
                    $('#printSettingsPopup').dialog('close');
                } else if(response.responseDescription === 'concurrency'){
					nsCore.showAlert('Someone else have updated the data since you retrieved the information');
				}
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.updatePrintSettings, 'POST', JSON.stringify(bilOfLading));
    }
    function fnPrintSettingsBackward() {
        $('#printSettingsPopup').dialog('close');
        viewPrintSettings();
    }
    // function to view print settings
    function viewPrintSettings(e) {
        var billOfLading = {
            id : $('#billId').val()
        };
        if (nsBooking.isBookingHeaderChanged()) {
            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(e.target));
            return false;
        }
        vmsService.vmsApiServiceType(function(response) {
            if (response) {
                if (response.responseDescription === 'Success') {
                	if(e ? (e.target.id === 'viewPrintSettingsLink') : false){
                		$('#printSettingsPopup').dialog({
                            modal : true,
                            resizable : false,
                            draggable : false,
                            width : '40%',
                            close : function(){
                            	$('#printSettingsPopup [type="checkbox"]').prop('checked', false);
                            }
                        });
                	}
                    $(document).find('.origin').removeAttr('checked');
                    $(document).find('.copy').removeAttr('checked');
                    $(document).find('.mani').removeAttr('checked');
                    if (response.responseData) {
                        $.each(response.responseData, function(i, obj) {
                            checkBoxChecked(obj, obj.infoType);
                            $('#viewPrintSettingsGrid tbody tr:nth-child('+(i+1)+')').find('.printRowTimeStamp').val(obj.timeStamp);
                        });
                    }
                } else {
                    nsCore.showAlert('Error :' + response.message);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.viewPrintSettings, 'POST', JSON.stringify(billOfLading));
        $('#printSettingsForm').submit(function(ev) {
            ev.preventDefault();
            $(this).closest('.ui-dialog-content').dialog('close');
        });
    }
    function checkBoxChecked(printInfo, infoType) {
        var elemNameOrg = infoType + 'Original', elemNameCopy = infoType + 'Copy', elemNameMani = infoType + 'Manifest';
        if (printInfo.printInBol === 'Y') {
            $('#' + elemNameOrg).prop('checked', true);
        } else {
            $('#' + elemNameOrg).prop('checked', false);
        }
        if (printInfo.printInBolCopy === 'Y') {
            $('#' + elemNameCopy).prop('checked', true);
        } else {
            $('#' + elemNameCopy).prop('checked', false);
        }
        if (printInfo.printInManifest === 'Y') {
            $('#' + elemNameMani).prop('checked', true);
        } else {
            $('#' + elemNameMani).prop('checked', false);
        }
    }
    function findVoyNum() {
        var vesselCode = $('#massVesselCode').val();
        if (vesselCode) {
            vmsService.vmsApiService(function(response) {
                if (response) {
                    if (response.responseDescription === 'Success') {
                        nsBooking.isMainVoyage = false;
                        $('#bookingVesselPopup').dialog({
                            modal : true,
                            resizable : false,
                            draggable : false,
                            open : nsBookDoc.bookingVesselListGridColAdj(),
                            width : '85%',
                            close : function() {
                                nsBooking.isMainVoyage = false;
                                $('#bookingVesselListGrid').dataTable().api().destroy();
                            },
                            
                        });
                        if ($.fn.DataTable.fnIsDataTable($('#bookingVesselListGrid'))) {
                            $('#bookingVesselListGrid').dataTable().api().destroy();
                        }
                        $('#bookingVesselListGrid').DataTable(
                            {
                                'processing' : true,
                                'serverSide' : false,
                                'bFilter' : true,
                                'tabIndex' : -1,
                                'bSort' : false,
                                'paging' : false,
                                'ordering' : true,
                                'fixedHeader' : false,
                                "orderClasses" : false,
                                'order' : [
                                    [
                                        3, 'desc'
                                    ]
                                ],
                                'info' : false,
                                'searching' : false,
                                'dom' : '<t>',
                                'scrollY' : '500px',
                                'scrollCollapse' : true,
                                'aaData' : response.responseData,
                                'bAutoWidth' : false,
                                'columns' : [
                                    {
                                        data : 'checked',
                                        sWidth : '33px',
                                        'render' : function(data, type, full) {
                                            return '<input type="radio" name="voyageList" class="applyVoyage" value="'
                                                + full.vesselCode + '">';
                                        }
                                    }, {
                                        data : 'vesselCode'
                                    }, {
                                        data : 'vesselName'
                                    }, {
                                        data : 'voyageNo',
                                        'render' : function(data) {
                                            return '<p class="numericField bvNumField">' + data + '</p>'
                                        }
                                    }, {
                                        data : 'tradeCode'
                                    }, {
                                        data : 'startDate'
                                    }
                                ]
                            });
                    }
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.bookingAllocation + vesselCode, 'POST', null);
        } else {
            nsCore.showAlert('Vessel should not be empty');
        }
    }
    function loadPopUp(massActionloadId) {
        var txt = '';        
        switch (massActionloadId) {
        case 'actionListLink1':
            txt = 'Vessel/Voyage can not be updated for the below sub bookings due to business rule failure.';
            break;
        case 'actionListLink2':
            txt = 'Origin can not be updated for the below sub bookings due to business rule failure.';
            break;
        case 'actionListLink3':
            txt = 'Destination can not be updated for the below sub bookings due to business rule failure.';
            break;
        case 'actionListLink4':
            txt = 'Load port can not be updated for the below sub bookings due to business rule failure.';
            break;
        case 'actionListLink5':
            txt = 'Discharge Port can not be updated for the below sub bookings due to business rule failure.';
            break;
        case 'actionListLink6':
            txt = 'Rates can not be updated for the below sub bookings due to business rule failure.';
            break;
        default:
            break;
        }
        $('#massActionWarningPopUp').find('.topWarn').text(txt);
    }
    
    function canUpdateChargesFn(url, shouldReturn, isReturn) {
        var validationResult;
        if (url.indexOf('canUpdateCharges') >= 0) {
            validationResult = nsBooking.validateMandatoryFields();
            if (validationResult !== '') {
                nsCore.showAlert(validationResult);
                shouldReturn = true;
                isReturn = true;
            }
        }
        return {
            'shouldReturn' : shouldReturn,
            'isReturn' : isReturn
        };
    }
    function canUpdateFn(url, postURL, canReturn, shouldReturn) {
        var portCode, vesselCode, vesselName;
        if (url.indexOf('canUpdateDestination') >= 0 || url.indexOf('canUpdateOrigin') >= 0) {
            portCode = $('#massCodeIn').val();
            if (!portCode) {
                nsCore.showAlert('Port code should not be empty');
                shouldReturn = true;
                canReturn = true;
            } else {
                postURL = url + $('#massCodeIn').val();
            }
        } else if (url.indexOf('canUpdateRates') >= 0 || url.indexOf('canUpdateCharges') >= 0) {
            postURL = url;            
        } else {
            if (url.indexOf('canUpdateVesVoy') >= 0) {
                vesselCode = $('#massVesselCode').val();
                vesselName = $('#massVoyageName').val();
                if(!vesselCode || !vesselName){
                	if (!vesselCode) {
	                    nsCore.showAlert('Vessel code should not be empty');
	                }
	                if (!vesselName) {
	                    nsCore.showAlert('Voyage number should not be empty');
	                }
	                shouldReturn = true;
                    canReturn = true;
                } else{
                	postURL = url + vesselCode + '/' + vesselName;
                }
            }
        }
        return {
            'shouldReturn' : shouldReturn,
            'canReturn' : canReturn,
            'postURL' : postURL
        };
    }
    // function to validate data url
    function dataUrlVal(url, shouldReturn, postURL) {
        var isReturn = false, canReturn = false, canUpdateObj, canUpdateChargesObj;
        canUpdateChargesObj = canUpdateChargesFn(url, shouldReturn, isReturn);
        shouldReturn = canUpdateChargesObj.shouldReturn;
        isReturn = canUpdateChargesObj.isReturn;
        if (!isReturn) {
            canUpdateObj = canUpdateFn(url, postURL, canReturn, shouldReturn);
            shouldReturn = canUpdateObj.shouldReturn;
            postURL = canUpdateObj.postURL;
        }
        return {
            'shouldReturn' : shouldReturn,
            'postURL' : postURL
        };
    }
    function popPostUrlFun(url, postURL) {
        var consIDs = '';
        if (url.indexOf('doUpdateOrigin') >= 0 || url.indexOf('doUpdateDestination') >= 0
            || url.indexOf('doUpdateVesVoy') >= 0 || url.indexOf('doUpdateRates') >= 0
            || url.indexOf('doUpdateCharges') >= 0) {
            $.each(Object.keys(nsBooking.itemsMap), function(i, v) {
                $.each(nsBooking.itemsMap[v].consignmentItemList, function(ind, val) {
                    if (consIDs === '') {
                        consIDs = val.consignmentID;
                    } else {
                        consIDs = consIDs + ',' + val.consignmentID;
                    }
                });
            });
            if ((url.indexOf('doUpdateOrigin') >= 0) || (url.indexOf('doUpdateDestination') >= 0)) {
                postURL = url + consIDs + '/' + $('#massCodeIn').val();
            }
            if ((url.indexOf('doUpdateVesVoy') >= 0)) {
                postURL = url + $('#massVesselCode').val() + '/' + $('#massVoyageName').val() + '/' + consIDs;
            }
            if ((url.indexOf('doUpdateRates') >= 0) || (url.indexOf('doUpdateCharges') >= 0)) {
                postURL = url + consIDs;
            }
        }
        return postURL;
    }
    function popInput(url, itemCon, input) {
        var chargestableData, rateAndChargeMassActionDate;
        if ((url.indexOf('canUpdateCharges') >= 0) || (url.indexOf('doUpdateCharges') >= 0)) {
            chargestableData = nsBooking.collectChargesTableData();
            rateAndChargeMassActionDate = {
                chargeList : chargestableData
            };
            input = {
                itemContent : itemCon,
                rateAndChargeMassAction : rateAndChargeMassActionDate
            };
        } else {
            input = {
                itemContent : itemCon
            };
        }
        return input;
    }
    function formDOM(str, loadId, loginUserID) {
        switch (loadId) {
        case 'actionListLink1':
            str = '<div class="formRow"><div class="width100per rowItem"><label>Vessel code/Name</label> '
                + '<div class="width100per formInputWrap doubleInput"> <input class="width25per massVesCode" '
                + 'name="massCargoVoyageCode" type= "text" id="massVesselCode" >'
                + '<input class= "width65per ml10p massVesName" name= "massCargoVoyageName" type="text" '
                + '> </div> </div> </div> <div class="formRow"> <div class="rowItem">'
                + '<label>Voyage no.</label> <div class="formInputWrap"> <input class="width100per"'
                + 'name= "newCargoVoyageCode" type="text" id="massVoyageName"'
                + 'readonly="readonly" /> <a href="javascript:void(0)" id = "findVoyNum" class="orangeButton" >..</a>'
                + '</div> </div> <div class="rowItem updVslSailDate"> <label>Sailing Date</label> <div class="formInputWrap">'
                + '<input class="datePickerInp" name="possiblySailing" id="massSailingDate" type="text" disabled="disabled">'
                + '</div></div></div>';
            $(document).on('click', '#findVoyNum', findVoyNum);
            $('#massActionForm').attr('data-url-validation', '/Vms/massaction/canUpdateVesVoy/' + loginUserID + '/');
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateVesVoy/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Vessel/Voyage');
            break;
        case 'actionListLink2':
            str = loadPortDiv('Origin');
            $('#massActionForm').attr('data-url-validation', '/Vms/massaction/canUpdateOrigin/' + loginUserID + '/');
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateOrigin/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Origin');
            break;
        case 'actionListLink3':
            str = loadPortDiv('Destination');
            $('#massActionForm').attr('data-url-validation',
                '/Vms/massaction/canUpdateDestination/' + loginUserID + '/');
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateDestination/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Destination');
            break;
        case 'actionListLink4':
            str = loadPortDiv('Load port');
            $('#massActionForm').attr('data-url-validation', '/Vms/massaction/canUpdateOrigin/' + loginUserID + '/');
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateOrigin/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Load Port');
            break;
        case 'actionListLink5':
            str = loadPortDiv('Discharge port');
            $('#massActionForm').attr('data-url-validation',
                '/Vms/massaction/canUpdateDestination/' + loginUserID + '/');
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateDestination/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Discharge Port');
            break;
        case 'actionListLink6':
            str = loadPortDiv('Update Rates');
            $('#massActionForm').attr('data-url-validation', '/Vms/massaction/canUpdateRates/' + loginUserID);
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateRates/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Rates');
            break;
        case 'massAddChargesLink':
            $('#massActionForm').attr('data-url-validation', '/Vms/massaction/canUpdateCharges/' + loginUserID);
            $('#massActionForm').attr('data-url-update', '/Vms/massaction/doUpdateCharges/' + loginUserID + '/');
            $('#massActionWindowTitle').text('Update Charges');
            str = $('#massActionChargesTemplate').text();
            break;
        default:
            break;
        }
        return str;
    }
    function loadPortDiv(statusLabel) {
    	var formDiv = '';
    	
    	 if(statusLabel === 'Update Rates'){
         	formDiv = '<div class="formRow marginTop20pxBottom20px"><p style="text-align:center;font-size: 12px;font-weight: bold;">Click on Apply button to apply rates to the sub bookings<p></div>';
         }
    	 else{
    		 formDiv = '<div class="formRow marginTop20pxBottom20px"> <div class="rowItem width100per"> <label>'
    	            + statusLabel + '</label> <div class="formInputWrap width100per doubleInput">'
    	            + '<input class="width25per searchInput portSearch" name="" type="text" id="massCodeIn" >'
    	            + '<input class="width65per ml10p searchInput descField" name="" type="text"> </div> </div> </div>';
    	 }
        return formDiv;
    }
    // events will be triggeres when DOM is ready
    $(document)
        .ready(
            function() {
                var loadId = '';
                vmsService.vmsApiService(function(response) {
                    if (response.responseData.length > 0) {
                        nsBooking.rateLinkAccessFlag = (response.responseData[0].rateAccess === 'Y') ? true : false;
                    }
                }, nsBooking.rateLinkAccess, 'GET', null);
                $('#bookingUnit').on(
                    'blur',
                    '.portSearch',
                    function() {
                        nsCore.delInvalidAutoFeilds('#bookingUnit .portSearch', '#bookingUnit .descField', $(this)
                            .val(), JSON.parse(localStorage.portCodes));
                        if (!$(this).val()) {
                            $('#nextLoadPortTerminal, #nextLoadPortCode', '#nextLoadPortDesc,#currentDiscPortTerminal')
                                .val('');
                        }
                    });
                $('#bookingUnit').on(
                    'blur',
                    '.descField',
                    function() {
                        nsCore.delInvalidAutoFeilds('#bookingUnit .portSearch', '#bookingUnit .descField', $(this)
                            .val(), JSON.parse(localStorage.portNames));
                    });
                $('#bookingAddCarriageDetails').on(
                    'blur',
                    '#currentDiscPortCode',
                    function() {
                        nsCore.delInvalidAutoFeilds('#bookingAddCarriageDetails #currentDiscPortCode',
                            '#bookingAddCarriageDetails #currentDiscPortDesc', $(this).val(), JSON
                                .parse(localStorage.portCodes));
                        if (!$(this).val()) {
                            $('#nextLoadPortTerminal, #nextLoadPortCode,#nextLoadPortDesc,#currentDiscPortTerminal')
                                .val('');
                        }
                    });
                $('#bookingAddCarriageDetails').on(
                    'blur',
                    '#currentDiscPortDesc',
                    function() {
                        nsCore.delInvalidAutoFeilds('#bookingAddCarriageDetails #currentDiscPortCode',
                            '#bookingAddCarriageDetails #currentDiscPortDesc', $(this).val(), JSON
                                .parse(localStorage.portNames));
                        if (!$(this).val()) {
                            $('#nextLoadPortTerminal, #nextLoadPortCode,#nextLoadPortDesc,#currentDiscPortTerminal')
                                .val('');
                        }
                    });
                $('#bookingEditCarriageDetails')
                    .on(
                        'blur',
                        '#currentEditDiscPortCode',
                        function() {
                            nsCore.delInvalidAutoFeilds('#bookingEditCarriageDetails #currentEditDiscPortCode',
                                '#bookingEditCarriageDetails #currentEditDiscPortDesc', $(this).val(), JSON
                                    .parse(localStorage.portCodes));
                            if (!$(this).val()) {
                                $(
                                    '#nextEditLoadPortCode, #nextEditLoadPortDesc, #currentEditDiscPortTerminal,#nextEditLoadPortTerminal')
                                    .val('');
                            }
                        });
                $('#bookingEditCarriageDetails').on(
                    'blur',
                    '#currentEditDiscPortDesc',
                    function() {
                        nsCore.delInvalidAutoFeilds('#bookingEditCarriageDetails #currentEditDiscPortCode',
                            '#bookingEditCarriageDetails #currentEditDiscPortDesc', $(this).val(), JSON
                                .parse(localStorage.portNames));
                        if (!$(this).val()) {
                            $('#nextEditLoadPortCode, #nextEditLoadPortDesc',
                                '#currentEditDiscPortTerminal,#nextEditLoadPortTerminal').val('');
                        }
                    });
                
                //delete party invalid code
                $('#billLadingDetailsForm').on('blur','#billCountryCode',function(e) {
                	 var partyId = $(this).parents(".ladingPartyItem").attr("id");
                	 nsCore.delInvalidAutoFeilds('#'+partyId+' '+"#billCountryCodeDesc", '#'+partyId+' '+"#billCountryCode", $(this).val(), JSON.parse(localStorage.countryCodes), e);
               });
                $('#billLadingDetailsForm').on('blur','#billCountryCodeDesc',function(e) {
                	 var partyIdDesc = $(this).parents(".ladingPartyItem").attr("id");
                	 nsCore.delInvalidAutoFeilds('#'+partyIdDesc+' '+"#billCountryCode", '#'+partyIdDesc+' '+"#billCountryCodeDesc", $(this).val(), JSON.parse(localStorage.countryNames), e); 
                	});
                // when expand all button is clicked
                $('.showList').click(function() {
                    $('.mainSubBookingListWrap').show();
                });
                // when collapse all button is clicked
                $('.hideList').click(function() {
                    $('.mainSubBookingListWrap').hide();
                });
                // change of main booking details form
                $(document).on(
                    'keyup click change',
                    '#createFreshBook input:not([type="button"].saveButton):'
                        + 'not([type="radio"].selectedRoute), #createFreshBook select,#createFreshBook textarea',
                    function(e) {
                        if (nsBooking.globalBookingFlag.mainBlDetailsFlag) {
                            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                            return false;
                        }
                        if (e.type !== 'click') {
                        	nsBookDoc.setForDirtyPopup();
                        }
                    });
                // autocomplete for create fresh book
//                $(document).on(
//                    'keyup.autocomplete',
//                    '#createFreshBook',
//                    function(e) {
//                        if (nsBooking.globalBookingFlag.mainBlDetailsFlag) {
//                            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
//                                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
//                            return false;
//                        }
//                        if (e.type !== 'click') {
//                        	nsBookDoc.setForDirtyPopup();
//                        }
//                    });////tHIS aBOVE eVENT cOMMENTED fOR dEFECT-5899. dEFECT oNLY oCCUR IN iE. aS i tESTED tHIS iS uSELESS eVent. lET mE kNOW tHIS cREATE aNY iSSUES- Habeeb
                // for BL Details Input Fields
                $(document).on(
                    'keyup click change',
                    '#billLadingDetailsForm input:not([type="button"].saveButton),'
                        + '#billLadingDetailsForm select,#billLadingDetailsForm textarea',
                    function(e) {
                        if (nsBooking.globalBookingFlag.mainBookingHeaderFlag) {
                            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                            return false;
                        }
                        if (e.type !== 'click') {
                            nsBooking.updateBLDetailsFlag();
                        }
                    });
                // when input field value changed, to set dirty flag
                $(document).on(
                    'change keyup.autocomplete',
                    '#billLadingDetailsForm',
                    function(e) {
                        if (nsBooking.globalBookingFlag.mainBookingHeaderFlag) {
                            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                            return false;
                        }
                        if (e.type !== 'click') {
                            nsBooking.updateBLDetailsFlag();
                        }
                    });
                /* On change of main sub booking form */
                $(document).on(
                    'keyup click change',
                    '#mainSubBookingForm input:not([type="button"].'
                        + 'saveButton), #mainSubBookingForm select,#mainSubBookingForm textarea', function(e) {
                        if (e.type !== 'click') {
                            nsBooking.updateSubBookFlag();
                        }
                    });
                // autocomplete for main sub booking form
//                $(document).on('keyup.autocomplete', '#mainSubBookingForm', function(e) {
//                    if (e.type !== 'click') {
//                        nsBooking.updateSubBookFlag();
//                    }
//                });////tHIS aBOVE eVENT cOMMENTED fOR dEFECT-5899. dEFECT oNLY oCCUR IN iE. aS i tESTED tHIS iS uSELESS eVent. lET mE kNOW tHIS cREATE aNY iSSUES- Habeeb
                // on cancel of the main booking form
                $(document)
                    .on(
                        'click',
                        '#mainBookingCancel',
                        function() {
                            if (!nsBooking.globalBookingFlag.mainBookingFlag) {
                                nsBooking.newBookFlag = false;
                                    if ($('.mainBookingDetailFormTitle').text().substring(0, 3) === 'New') {
                                        $(
                                            '.mainSubBookingListWrap,.mainBookingDetailsWrap, .newBookLabel, .mainSubBookingFormWrap')
                                            .hide();
                                    }
                            } else {
                                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                                return false;
                            }
                        });
                // BL Details Form Cancel Button Click Event
                $('#billofLadingCancel').click(
                    function() {
                        // to Show pop up if any data has been changed.
                        if (nsBooking.globalBookingFlag.mainBookingFlag) {
                            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                            return false;
                        } else {
                            $('.searchNavigation').find('.scndLevel.activeNavigationItem').trigger('click');
                        }
                    });
                
                // for User Menu 7 navigation Bar
                $('.navigationBar a,.userMenu a,.newSearch').click(
                    function(event) {
                        if (nsBooking.globalBookingFlag.mainBookingFlag) {
                            // prevent any parent handlers from being executed
                            event.preventDefault();
                            // to stop bubbling effect
                            event.stopPropagation();
                            // prevent parent handlers and other handlers from
                            // executing
                            event.stopImmediatePropagation();
                            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                            return false;
                        }
                    });
                // for print setting pop up in bill of lading form
                $(document).on('change', '#printSettingsForm', function() {
                    var params;
                    $('#printSettingsForm').attr('data-dirty-popup', true);
                    params = {
                        additionalActionPoints : '#printClose, #printcancelButton',
                        formSelector : '#printSettingsForm',
                        fnGoForward : fnPrintSettingsForward,
                        fnGoBackWard : fnPrintSettingsBackward
                    };
                    nsBookDoc.fnHandleActionsDirtyFlags(params);
                });
                // when print close button is clicked
                $('#printClose, #printcancelButton').click(
                    function() {
                        if ($('#printSettingsForm').attr('data-dirty-popup') === 'false'
                            || (typeof $('#printSettingsForm').attr('data-dirty-popup')) === 'undefined') {
                            $('#printSettingsPopup').dialog('close');
                        }
                    });
                // for cargo List popup in sub-booking form
                $(document).on('change', '#cargoList', function() {
                    var params;
                    $('#cargoList').attr('data-dirty-popup', true);
                    params = {
                        additionalActionPoints : '#cargoListClose, #cargoListCancelButton',
                        formSelector : '#cargoList',
                        fnGoForward : nsBookDoc.fnCargoListForward,
                        fnGoBackWard : nsBookDoc.fnCargoListBackward
                    };
                    nsBookDoc.fnHandleActionsDirtyFlags(params);
                });
                // when close button is clicked
                $(document).on(
                    'click',
                    '#cargoListClose, #cargoListCancelButton',
                    function() {
                        if ($('#cargoList').attr('data-dirty-popup') === 'false'
                            || (typeof $('#cargoList').attr('data-dirty-popup') === 'undefined')) {
                            $('#cargoListPopup').dialog('close');
                        }
                    });
                // for booked_Units popup in billoflading form
                $(document).on('change', '#bookingUnitForm input:not(#subBoookingSearch)', function() {
                    var params;
                    $('#bookingUnitForm').attr('data-dirty-popup', true);
                    nsBooking.globalBookingFlag.fnGoForward = nsBookDoc.fnBookingUnitForward;
                    nsBooking.globalBookingFlag.fnGoBackWard = nsBookDoc.fnBookingUnitBackward;
                    nsBooking.globalBookingFlag.mainBookingFlag = true;
                    params = {
                        additionalActionPoints : '',
                        formSelector : '#bookingUnitForm',
                        fnGoForward : nsBookDoc.fnBookingUnitForward,
                        fnGoBackWard : nsBookDoc.fnBookingUnitBackward
                    };
                    nsBookDoc.fnHandleActionsDirtyFlags(params);
                });
                // autocomplete for booking unit form
                $(document).on('keyup.autocomplete', '#bookingUnitForm input:not(#subBoookingSearch)', function() {
                    var params;
                    $('#bookingUnitForm').attr('data-dirty-popup', true);
                    params = {
                        additionalActionPoints : '',
                        formSelector : '#bookingUnitForm',
                        fnGoForward : nsBookDoc.fnBookingUnitForward,
                        fnGoBackWard : nsBookDoc.fnBookingUnitBackward
                    };
                    nsBookDoc.fnHandleActionsDirtyFlags(params);
                });
                $('.equipmentNbr').change(function() {
                    var selectedVal = $(this).val();
                    $(this).closest('.formRow').parent().find('.equipmentType').val(unescape(selectedVal));
                });
                // to bind function to mass action list link
                $('.massActionListLink')
                    .unbind('click')
                    .bind(
                        'click',
                        function() {
                            if ($(this).find('.icons_sprite').hasClass('fa-chevron-right')) {
                                $(this).find('.icons_sprite').toggleClass('fa-chevron-right fa-chevron-left');
                                $('.rightActionListWrapper').toggleClass('actionListWrapStyles');
                                $('.actionListContent').toggle('slide', {
                                    direction : 'right'
                                }, 'fast');
                                return false;
                            }
                            if (checkEmptySearchMandatory()) {
                                $(this).find('.icons_sprite').toggleClass('fa-chevron-right fa-chevron-left');
                                $('.rightActionListWrapper').toggleClass('actionListWrapStyles');
                                $('.actionListContent').toggle('slide', {
                                    direction : 'left'
                                });
                            } else {
                                nsCore
                                    .showAlert('Atleast one of the below parameters to be filled in the search to perform mass action. Parameters are: Vessel/Voyage, Customer, Origin, Destination, Load port, Discharge port');
                            }
                            return false;
                        });
                // when action list link and row remove icon is clicked
                $(document).on(
                    'click',
                    '.actionListLinkASide .rowRemoveIcon',
                    function() {
                        var key, keyItem;
                        if ($(this).closest('.accHead').hasClass('massBooking')) {
                            key = $(this).closest('.accHead');
                            delete nsBooking.itemsMap[key.attr('data-bookingid')];
                            key.next('.accBody').remove();
                            key.remove();
                        } else {
                            keyItem = $(this).closest('.accBody').prev('.accHead');
                            nsBooking.itemsMap[keyItem.attr('data-bookingid')].consignmentItemList.splice(nsBooking
                                .arrayObjectIndexOf(
                                    nsBooking.itemsMap[keyItem.attr('data-bookingid')].consignmentItemList, $(this)
                                        .closest('.singleColItem').attr('data-subbookingid'), 'consignmentID'), 1);
                            $(this).closest('.mainBookingItemIcons').closest('.cargoVin').remove();
                            if (nsBooking.itemsMap[keyItem.attr('data-bookingid')].consignmentItemList.length === 0) {
                                keyItem.find('.rowRemoveIcon').trigger('click');
                            }
                        }
                    });
                // to bind function to booking unit submit button
                $('#bookingUnit')
                    .unbind('submit')
                    .bind(
                        'submit',
                        function(e) {
                            var opn = $('#massActionForm').attr('opn'), url = $('#massActionForm').attr(opn), postURL = '', massActionloadId  = nsBooking.massActionLinkActive, shouldReturn, dataUrlObj, itemCon = JSON
                                .stringify(nsBooking.itemsMap), input = null;
                            e.preventDefault();
                            if (opn === 'data-url-validation') {
                                shouldReturn = false;
                                dataUrlObj = dataUrlVal(url, shouldReturn, postURL);
                                shouldReturn = dataUrlObj.shouldReturn;
                                postURL = dataUrlObj.postURL;
                                if (shouldReturn) {
                                    return false;
                                }
                            } else {
                                postURL = popPostUrlFun(url, postURL);
                            }
                            input = popInput(url, itemCon, input);
                            if (itemCon === '{}') {
                                nsCore.showAlert('No Sub Booking available to apply Mass action');
                                return false;
                            }
                            $('.preloaderWrapper').show();
                            vmsService
                                .vmsApiService(
                                    function(response) {
                                        $('.preloaderWrapper').hide();
                                        var len, actualCount, warningCount;
                                        if (response) {
                                            len = $.map(response.itemsMap, function(n, i) {
                                                return i;
                                            }).length;
                                            if ((opn === 'data-url-validation') && (len > 0)) {
                                                // assign itemsMap in the
                                                // warning to be shown
                                                actualCount = 0;
                                                warningCount = 0;
                                                nsBooking.warningMap = response.itemsMap;
                                                $.each(Object.keys(nsBooking.warningMap), function(i, v) {
                                                    $.each(nsBooking.warningMap[v].consignmentItemList, function() {
                                                        warningCount++;
                                                    });
                                                });
                                                $.each(Object.keys(nsBooking.itemsMap), function(i, v) {
                                                    $.each(nsBooking.itemsMap[v].consignmentItemList, function() {
                                                        actualCount++;
                                                    });
                                                });
                                                if (actualCount === warningCount) {
                                                    nsCore
                                                        .showAlert('Mass action can not be performed on any of the sub bookings since one or more business rules have not been matched. Please see LiNK supporting material to verify which business rule was in conflict with this action.');
                                                    return false;
                                                }
                                                $('#massActionWarningPopUp').dialog(
                                                    {
                                                        modal : true,
                                                        resizable : false,
                                                        draggable : false,
                                                        autoOpen : false,
                                                        width : '30%',
                                                        open : function() {
                                                            var str = '';
                                                            $('.ui-dialog-titlebar').remove();
                                                            $('#ui-dialog-title-dialog').hide();
                                                            $('.ui-dialog-titlebar').removeClass('ui-widget-header');
                                                            $.each(Object.keys(nsBooking.warningMap), function(i, v) {
                                                                str = nsBooking.bulidMassActionWariningPopUp(
                                                                    nsBooking.warningMap, v, str);
                                                            });
                                                            $('#massActionWarningPopUp .subBookContentListCol').html(
                                                                str);
                                                        }
                                                    });
                                                loadPopUp(massActionloadId);
                                               
                                                $('#massActionWarningPopUp').dialog('open');
                                            } else {
                                                $('#updateVesselVoyagePopup,#massActionWarningPopUp').dialog('close');
                                                if (parseInt($('.searchRes .mainBookingCount').text()) > 0) {
                                                    $('#leftSearchMenu').trigger('submit');
                                                }
                                                nsCore.showAlert('Mass action performed successfully!');
                                                $('.massActionListLink').trigger('click');
                                            }
                                        } else {
                                            nsCore.showAlert(nsBooking.errorMsg);
                                        }
                                    }, postURL, 'POST', JSON.stringify(input));
                        });
                // to bind new click function to various action list links
                $(
                    '#actionListLink1,#actionListLink2,#actionListLink3,#actionListLink4,'
                        + '#actionListLink5,#actionListLink6,#massAddChargesLink')
                    .unbind('click')
                    .bind(
                        'click',
                        function() {
                            var custCode, originCode, destCode, vesselCode, voyage, bookinggFrom, loginUserID, postURL, input = {};
                            if (checkEmptySearchMandatory()) {
                                // Change class names
                                custCode = ($('#custCode').val() !== '') ? $('#custCode').val() : '';
                                originCode = $('#originPort').val() !== '' ? $('#originPort').val() : ($('#loadPort')
                                    .val() !== '' ? $('#loadPort').val() : '');
                                destCode = $('#destPort').val() !== '' ? $('#destPort').val()
                                    : ($('#discPort').val() !== '' ? $('#discPort').val() : '');
                                vesselCode = $('#vesselCode').val() !== '' ? $('#vesselCode').val() : '';
                                voyage = $('#voyage').val() !== '' ? $('#voyage').val() : '';
                                bookinggFrom = $('#bookinggFrom').val() !== '' ? $('#bookinggFrom').val() : '';
                                loginUserID = $('#userName').val();
                                postURL = '/Vms/massaction/search';
                                loadId = $(this).attr('id');
                                nsBooking.massActionLinkActive = $(this).attr('id');
                                input = {
                                    userId : loginUserID,
                                    customerCode : custCode,
                                    originCode : originCode,
                                    destinationCode : destCode,
                                    vesselCode : vesselCode,
                                    voyageNo : voyage,
                                    strFromDate : bookinggFrom,
                                    module : 'booking',
                                    strDateFormat : dateFormat
                                };
                                $('.preloaderWrapper').show();
                                vmsService
                                    .vmsApiService(
                                        function(response) {
                                            $('.preloaderWrapper').hide();
                                            if (response.responseDescription === 'Success') {
                                                $('#updateVesselVoyagePopup')
                                                    .dialog(
                                                        {
                                                            modal : true,
                                                            resizable : false,
                                                            autoOpen : false,
                                                            draggable : false,
                                                            width : '80%',
                                                            minHeight : 0.8 * $(window).height(),
                                                            open : function() {
                                                                var str = '';
                                                                nsBooking.itemsMap = response.responseData.itemsMap;
                                                                str = nsBooking.buildUpdateVesselUI(nsBooking.itemsMap,
                                                                    str);
                                                                $('.actionListLinkASide .subBookContentListCol').html(
                                                                    str);
                                                                if ($(window).width() > 1599) {
                                                                    $(
                                                                        '#updateVesselVoyagePopup .actionListLinkASideDiv2')
                                                                        .height((0.64 * $(window).height()) + 20);
                                                                    $('#updateVesselVoyagePopup .actionListLinkContent')
                                                                        .height(0.64 * $(window).height());
                                                                    $(
                                                                        '#updateVesselVoyagePopup .actionListLinkASideDiv2 .subBookingNbrsCntnt')
                                                                        .height((0.64 * $(window).height()) - 10);
                                                                } else {
                                                                    $(
                                                                        '#updateVesselVoyagePopup .actionListLinkASideDiv2')
                                                                        .height((0.5 * $(window).height()) + 20);
                                                                    $('#updateVesselVoyagePopup .actionListLinkContent')
                                                                        .height((0.5 * $(window).height()) + 20);
                                                                    $(
                                                                        '#updateVesselVoyagePopup .actionListLinkASideDiv2 .subBookingNbrsCntnt')
                                                                        .height((0.5 * $(window).height()) - 10);
                                                                }
                                                                str = formDOM(str, loadId, loginUserID);
                                                                $('#massActionForm').attr('opn', 'data-url-validation');
                                                                $('#massActionForm').html(str);
                                                                if (loadId === 'massAddChargesLink') {
                                                                    $('#addUpdateChargesGrid tbody tr.hiddenRow .chargeType')
                                                                        .html(nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true));
                                                                    $('#addUpdateChargesGrid tbody tr.hiddenRow .chargeBasis')
                                                                        .html(nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
                                                                    $('#addUpdateChargesGrid tbody tr.hiddenRow .chargeCurrency')
                                                                        .html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions,
                                                                                nsBooking.defaultCurrencyCode, true));
                                                                    nsBooking.loadNewRMassChargesRow();
                                                                }
                                                                nsBooking.addAutoComplete();
                                                                $('.ui-dialog-titlebar').remove();
                                                                $('#ui-dialog-title-dialog').hide();
                                                                $('.ui-dialog-titlebar')
                                                                    .removeClass('ui-widget-header');
                                                                $('.massActionFilter').val('');
                                                            }
                                                        });
                                                $('#updateVesselVoyagePopup').dialog('open');
                                            } else {
                                                nsCore.showAlert(nsBooking.errorMsg);
                                            }
                                        }, postURL, 'POST', JSON.stringify(input));
                            } else {
                                nsCore
                                    .showAlert('Atleast one of the below parameters to be filled in the search to perform mass action. Parameters are: Vessel/Voyage, Customer, Origin, Destination, Load port, Discharge port');
                            }
                        });
                // when mass action add new charge is clicked inside update
                // vessel voyage pop up
                $('#updateVesselVoyagePopup').on('click', '#massActionAddNewCharge', function() {
                    nsBooking.loadNewRMassChargesRow();
                });
                // when add update charge grid is clicked inside update vessel
                // voyage pop up
                $('#updateVesselVoyagePopup').on('click', '#addUpdateChargesGrid .rowRemoveIcon', function() {
                    $(this).closest('tr').remove();
                });
                $(document).on('click', '#viewPrintSettingsLink', function(e) {
                    viewPrintSettings(e);
                    //below four fields will be always disabled
                    $('#80Manifest, #90Manifest, #100Manifest,#110Manifest').attr('disabled','true');
                });
                $(document).on('click', '#qdpup', function() {
                    nsBooking.doCancelOpn();
                });
                // to bind click function to mass warning yes
                $('#massWarnYes').unbind('click').bind(
                    'click',
                    function() {
                        $('#massActionWarningPopUp').dialog('close');
                        $('#massActionForm').attr('opn', 'data-url-update');
                        $.each(Object.keys(nsBooking.warningMap), function(i, v) {
                            $.each(nsBooking.warningMap[v].consignmentItemList, function(ind, val) {
                                nsBooking.itemsMap[v].consignmentItemList.splice(nsBooking.arrayObjectIndexOf(
                                    nsBooking.itemsMap[v].consignmentItemList, val.consignmentID, 'consignmentID'), 1);
                            });
                            // if booking is empty
                            if (nsBooking.itemsMap[v].consignmentItemList.length === 0) {
                                delete nsBooking.itemsMap[v];
                            }
                        });
                        $('#bookingUnit').trigger('submit');
                    });
                // to bind click function to mass action cancel
                $('#massActionCancel').unbind('click').bind('click', function() {
                    $('#updateVesselVoyagePopup,#massActionWarningPopUp').dialog('close');
                });
                $('#printSettingsSubmitBtn').click(function() {
                    fnPrintSettingsForward();
                });
                $(document).on('blur', '.blCommentText', function() {
                    setValueToBlInformation(this);
                });
                // to bind click function to mass warning
                $('#massWarnNo').unbind('click').bind('click', function() {
                    $('#massActionWarningPopUp').dialog('close');
                });
            });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);
