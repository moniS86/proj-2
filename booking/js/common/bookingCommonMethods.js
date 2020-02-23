/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var count1 = 0, flagCodes = [], i = 0, commonMethodObj = {
        'doInitCustomerSearch' : doInitCustomerSearch,
        'highlightTreeItem' : highlightTreeItem,
        'jDecode' : jDecode,
        'formChangeParams' : formChangeParams,
        'resetFlagSubBookingLevel' : resetFlagSubBookingLevel,
        'isBookingHeaderChanged' : isBookingHeaderChanged,
        'updateBLDetailsFlag' : updateBLDetailsFlag,
        'updateSubBookFlag' : updateSubBookFlag,
        'updateMainBookingCount' : updateMainBookingCount,
        'arrayObjectIndexOf' : arrayObjectIndexOf,
        'updateSailingDate' : updateSailingDate,
        'addAutoComplete' : addAutoComplete,
        'loadNewRMassChargesRow' : loadNewRMassChargesRow,
        'collectChargesTableData' : collectChargesTableData,
        'validateMandatoryFields' : validateMandatoryFields,
        'dynamicSort' : dynamicSort,
        'populateTerminal' : populateTerminal,
        'checkNotNull' : checkNotNull,
        'textNullCheck' : textNullCheck,
        'checkBoxIsCheck' : checkBoxIsCheck,
        'getDropDownSelectionValue' : getDropDownSelectionValue,
        'populateTerminalForAddOrEdit' : populateTerminalForAddOrEdit,
        'populateTerminalForEdit' : populateTerminalForEdit,
        'checkEditLegOrNormal' : checkEditLegOrNormal,
        'checkAddLegOrNormal' : checkAddLegOrNormal,
        'populateThirdPartyInfo' : populateThirdPartyInfo,
        'setEquipmentNum' : setEquipmentNum,
        'setCargoOnHold' : setCargoOnHold,
        'setNewCargo' : setNewCargo,
        'setActualDim' : setActualDim,
        'actualAreaCalc' : actualAreaCalc,
        'actualVolumeCalc' : actualVolumeCalc,
        'setUnitsValue' : setUnitsValue,
        'populateCargoConsignments' : populateCargoConsignments,
        'clearThirdPartyInfo' : clearThirdPartyInfo
    };
    nsBooking.customerCodeAutoArr = [];
    nsBooking.customerNameAutoArr = [];
    function doInitCustomerSearch() {
        $('#mainBookDetailCustomerCode').autocomplete({
            search : function() {
                $(this).attr('data-form', '1');
                $('#mainBookDetailCustomerDesc').attr('data-form', '1');
            },
            minLength : 1,
            source : function(request, response) {
                if (request.term) {
                    vmsService.vmsApiService(function(data) {
                        if (data) {
                            count1 = data.responseData.length;
                            flagCodes = [];
                            nsBooking.customerCodeAutoArr = [];
                            nsBooking.customerNameAutoArr = [];
                            for (i = 0; i < count1; i++) {
                                if (data.responseData[i].status === 'Valid') {
                                    flagCodes.push({
                                        custId : '' + data.responseData[i].companyId + '',
                                        label : jDecode(data.responseData[i].customerCode),
                                        name : jDecode(data.responseData[i].name),
                                        info : (data.responseData[i].bookingInfo && data.responseData[i].bookingInfoDesc) ? data.responseData[i].bookingInfoDesc : ''
                                    });
                                    nsBooking.customerCodeAutoArr.push(jDecode(data.responseData[i].customerCode));
                                    nsBooking.customerNameAutoArr.push(jDecode(data.responseData[i].name));
                                }
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                            response(flagCodes);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.custList, 'POST', JSON.stringify({
                        customerCode : request.term
                    }));
                }
            },
            autoFocus : true,
            delay: 0,
            select : function(event, ui) {
                $(this).val(ui.item.label);
                $('#massCUSID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('.custNameSearch').val(jDecode(ui.item.name));
                $('#mainBookDetailCustomerDesc').attr('data-form', ui.item.name);
                $(this).attr('data-form', ui.item.label);
                $(this).closest('.doubleInput').find('.customerID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('#customerID').val(ui.item.custId);
                if(ui.item.info){
                	nsCore.showAlert(ui.item.info);
                }
            }
        });
        $('#custCode').autocomplete({
            search : function() {
                $(this).attr('data-form', '1');
                $('#custName').attr('data-form', '1');
            },
            minLength : 1,
            source : function(request, response) {
                if (request.term) {
                    vmsService.vmsApiService(function(data) {
                        if (data) {
                            count1 = data.responseData.length;
                            flagCodes = [];
                            nsBooking.customerCodeAutoArr = [];
                            nsBooking.customerNameAutoArr = [];
                            for (i = 0; i < count1; i++) {
                                if (data.responseData[i].status === 'Valid') {
                                    flagCodes.push({
                                        custId : '' + data.responseData[i].companyId + '',
                                        label : jDecode(data.responseData[i].customerCode),
                                        name : jDecode(data.responseData[i].name)
                                    });
                                    nsBooking.customerCodeAutoArr.push(jDecode(data.responseData[i].customerCode));
                                    nsBooking.customerNameAutoArr.push(jDecode(data.responseData[i].name));
                                }
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                            response(flagCodes);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.custList, 'POST', JSON.stringify({
                        customerCode : request.term
                    }));
                }
            },
            autoFocus : true,
            delay:0,
            select : function(event, ui) {
                $(this).val(ui.item.label);
                $('#massCUSID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('.custNameSearch').val(jDecode(ui.item.name));
                $('#custName').attr('data-form', ui.item.name);
                $(this).attr('data-form', ui.item.label);
                $(this).closest('.doubleInput').find('.customerID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('#customerID').val(ui.item.custId);
            }
        });
         $('#mainBookDetailCustomerDesc').autocomplete({
            search : function() {
                $('#mainBookDetailCustomerCode').attr('data-form', '1');
                $(this).attr('data-form', '1');
            },
            minLength : 1,
            source : function(request, response) {
                if (request.term) {
                    vmsService.vmsApiService(function(data) {
                        if (data) {
                            count1 = data.responseData.length;
                            flagCodes = [];
                            nsBooking.customerCodeAutoArr = [];
                            nsBooking.customerNameAutoArr = [];
                            for (i = 0; i < count1; i++) {
                                if (data.responseData[i].status === 'Valid') {
                                    flagCodes.push({
                                        custId : '' + data.responseData[i].companyId + '',
                                        label : jDecode(data.responseData[i].name),
                                        name : jDecode(data.responseData[i].customerCode),
                                        info : (data.responseData[i].bookingInfo && data.responseData[i].bookingInfoDesc) ? data.responseData[i].bookingInfoDesc : ''
                                    });
                                    nsBooking.customerNameAutoArr.push(jDecode(data.responseData[i].name));
                                    nsBooking.customerCodeAutoArr.push(jDecode(data.responseData[i].customerCode));
                                }
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                            response(flagCodes);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.custList, 'POST', JSON.stringify({
                        name : request.term
                    }));
                }
            },
            autoFocus : true,
            delay:0,
            select : function(event, ui) {
                $('#massCUSID').val(ui.item.custId);
                $(this).val(ui.item.label);
                $(this).attr('data-form', ui.item.label);
                $('#mainBookDetailCustomerCode').attr('data-form', ui.item.name);
                $(this).closest('.doubleInput').find('.custSearch').val(jDecode(ui.item.name));
                $(this).closest('.doubleInput').find('.customerID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('#customerID').val(ui.item.custId);
                if(ui.item.info){
                	nsCore.showAlert(ui.item.info);
                }
            }
        });
        $('#custName').autocomplete({
            search : function() {
                $('#custCode').attr('data-form', '1');
                $(this).attr('data-form', '1');
            },
            minLength : 1,
            source : function(request, response) {
                if (request.term) {
                    vmsService.vmsApiService(function(data) {
                        if (data) {
                            count1 = data.responseData.length;
                            flagCodes = [];
                            nsBooking.customerCodeAutoArr = [];
                            nsBooking.customerNameAutoArr = [];
                            for (i = 0; i < count1; i++) {
                                if (data.responseData[i].status === 'Valid') {
                                    flagCodes.push({
                                        custId : '' + data.responseData[i].companyId + '',
                                        label : jDecode(data.responseData[i].name),
                                        name : jDecode(data.responseData[i].customerCode)
                                    });
                                    nsBooking.customerNameAutoArr.push(jDecode(data.responseData[i].name));
                                    nsBooking.customerCodeAutoArr.push(jDecode(data.responseData[i].customerCode));
                                }
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                            response(flagCodes);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.custList, 'POST', JSON.stringify({
                        name : request.term
                    }));
                }
            },
            autoFocus : true,
            delay:0,
            select : function(event, ui) {
                $('#massCUSID').val(ui.item.custId);
                $('#custCode').val(ui.item.name);
                $(this).val(ui.item.label);
                $(this).attr('data-form', ui.item.label);
                $('#custCode').attr('data-form', ui.item.name);
                $(this).closest('.doubleInput').find('.custSearch').val(jDecode(ui.item.name));
                $(this).closest('.doubleInput').find('.customerID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('#customerID').val(ui.item.custId);
            }
        });
        $('#customerCode').autocomplete({
            search : function() {
                $(this).attr('data-form', '1');
                $('#customerName').attr('data-form', '1');
            },
            minLength : 1,
            source : function(request, response) {
                if (request.term) {
                    vmsService.vmsApiService(function(data) {
                        if (data) {
                            count1 = data.responseData.length;
                            flagCodes = [];
                            nsBooking.customerCodeAutoArr = [];
                            nsBooking.customerNameAutoArr = [];
                            for (i = 0; i < count1; i++) {
                                if (data.responseData[i].status === 'Valid') {
                                    flagCodes.push({
                                        custId : '' + data.responseData[i].companyId + '',
                                        label : jDecode(data.responseData[i].customerCode),
                                        name : jDecode(data.responseData[i].name)
                                    });
                                    nsBooking.customerCodeAutoArr.push(jDecode(data.responseData[i].customerCode));
                                    nsBooking.customerNameAutoArr.push(jDecode(data.responseData[i].name));
                                }
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                            response(flagCodes);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.custList, 'POST', JSON.stringify({
                        customerCode : request.term
                    }));
                }
            },
            autoFocus : true,
            delay:0,
            select : function(event, ui) {
                $(this).val(ui.item.label);
                $('#massCUSID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('.custNameSearch').val(jDecode(ui.item.name));
                $('#customerName').attr('data-form', ui.item.name);
                $(this).attr('data-form', ui.item.label);
                $(this).closest('.doubleInput').find('.customerID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('#customerID').val(ui.item.custId);
            }
        });
        $('#customerName').autocomplete({
            search : function() {
                $('#customerCode').attr('data-form', '1');
                $(this).attr('data-form', '1');
            },
            minLength : 1,
            source : function(request, response) {
                if (request.term) {
                    vmsService.vmsApiService(function(data) {
                        if (data) {
                            count1 = data.responseData.length;
                            flagCodes = [];
                            nsBooking.customerCodeAutoArr = [];
                            nsBooking.customerNameAutoArr = [];
                            for (i = 0; i < count1; i++) {
                                if (data.responseData[i].status === 'Valid') {
                                    flagCodes.push({
                                        custId : '' + data.responseData[i].companyId + '',
                                        label : jDecode(data.responseData[i].name),
                                        name : jDecode(data.responseData[i].customerCode)
                                    });
                                    nsBooking.customerNameAutoArr.push(jDecode(data.responseData[i].name));
                                    nsBooking.customerCodeAutoArr.push(jDecode(data.responseData[i].customerCode));
                                }
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                            response(flagCodes);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.custList, 'POST', JSON.stringify({
                        name : request.term
                    }));
                }
            },
            autoFocus : true,
            delay:0,
            select : function(event, ui) {
                $('#massCUSID').val(ui.item.custId);
                $(this).val(ui.item.label);
                $(this).attr('data-form', ui.item.label);
                $('#customerCode').attr('data-form', ui.item.name);
                $(this).closest('.doubleInput').find('.custSearch').val(jDecode(ui.item.name));
                $(this).closest('.doubleInput').find('.customerID').val(ui.item.custId);
                $(this).closest('.doubleInput').find('#customerID').val(ui.item.custId);
            }
        });
    }
    // To HIghlight a particular Item in a Tree
    function highlightTreeItem(tree, currentItem, classes) {
        tree.removeClass(classes);
        currentItem.addClass(classes);
    }
    function jDecode(str) {
        return $('<div/>').html(str).text();
    }
    function formChangeParams() {
        return {
            additionalActionPoints : '#routeDetailGrid .selectedRoute',
            formSelector : '#mainSubBookingForm',
            fnGoForward : nsBooking.bookingAndSubBookingCreation,
            fnGoBackWard : nsBooking.fnSubBookingBackward
        };
    }
    function resetFlagSubBookingLevel() {
        nsBooking.globalBookingFlag.mainBookingFlag = false;
        nsBooking.globalBookingFlag.currentEditLevel = 'subBooking';
    }
    function isBookingHeaderChanged() {
        return nsBooking.globalBookingFlag.mainBookingFlag && nsBooking.globalBookingFlag.mainBookingHeaderFlag;
    }
    function updateBLDetailsFlag() {
        nsBooking.globalBookingFlag.mainBookingFlag = true;
        nsBooking.globalBookingFlag.mainBlDetailsFlag = true;
        nsBooking.globalBookingFlag.fnGoForward = nsBooking.fnBillLadingForward;
        nsBooking.globalBookingFlag.fnGoBackWard = nsBooking.fnBillLadingBackward;
    }
    function updateSubBookFlag() {
        nsBooking.globalBookingFlag.mainBookingFlag = true;
        nsBooking.globalBookingFlag.fnGoForward = nsBooking.bookingAndSubBookingCreation;
        nsBooking.globalBookingFlag.fnGoBackWard = nsBooking.fnSubBookingBackward;
    }
    function updateMainBookingCount(count) {
        var checkBkngCount = parseInt($('.mainBookingListWrap .mainBookingCount').text()), existingBkngCount = isNaN(checkBkngCount) ? 0
            : checkBkngCount;
        $('.mainBookingListWrap .mainBookingCount').text(existingBkngCount + count);
    }
    function arrayObjectIndexOf(myArray, searchTerm, property) {
        var len = myArray.length;
        for (i = 0; i < len; i++) {
            if (myArray[i][property] === searchTerm) {
                return i;
            }
        }
        return -1;
    }
    function updateSailingDate() {
        var lp = $('#loadPort').val() !== '' ? $('#loadPort').val() : '', sailingDate = '';
        if (lp === '') {
            lp = $('#originPort').val();
        }
        if (lp === '' || $('#massVesselCode').val() === '' || $('#massVoyageName').val() === '') {
            return;
        }
        sailingDate = nsBooking.vesselSailingDate + $("#massVoyageName").val() + '/sailingdate?user-id='
            + $('#userName').val() + '&origin-port=' + lp + '&vessel-code=' + $("#massVesselCode").val();
        vmsService.vmsApiService(function(response) {
            if (response) {
                $('#massSailingDate').val(response.responseValue);
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, sailingDate, 'GET', null);
    }
    function addAutoComplete() {
        $('.massVesName, .massVesCode').on("autocompletechange", function(event, ui) {
            $('#massVoyageName').prop('disabled', false).val('');
            $('#massSailingDate').prop('disabled', false).val('');
            $('#massVoyageName').prop('readonly', false).val('');
        });                
        nsCore.vesselAutoComplete('.massVesCode','.massVesName','data-form','#massVoyageName');       
    }
    function loadNewRMassChargesRow() {
        var cloneRow = $('#addUpdateChargesGrid tbody tr.hiddenRow').clone();
        if( String($('#addUpdateChargesGrid tr').length/2).indexOf('.')===-1){
    	        	cloneRow.removeClass('hiddenRow hide').addClass('odd').show().appendTo($('#addUpdateChargesGrid tbody'));
    	}else{
    		cloneRow.removeClass('hiddenRow hide').addClass('even').show().appendTo($('#addUpdateChargesGrid tbody'));
    	}
    }
    function collectChargesTableData() {
        var chargestableData = [];
        $.each($('#addUpdateChargesGrid tbody tr:visible'), function(index, row) {
            row = $(row);
            chargestableData.push({
                'chargeBasis' : row.find('.chargeBasis').val(),
                'chargeType' : row.find('.chargeType').val(),
                'currencyCode' : row.find('.chargeCurrency').val(),
                'includeInGrossFreight' : row.find('.chargeGrossFreight').is(':checked') ? 'Y' : 'N',
                'includeInSubBooking' : row.find('.chargeSubBookings').is(':checked') ? 'Y' : 'N',
                'prepaid' : row.find('.chargePayment').val(),
                'rate' : row.find('.chargeRate').val(),
                'comment' : row.find('.chargeComments').val()
            });
        });
        return chargestableData;
    }
    function validateMandatoryFields() {
        var message = '', count = 0;
        $.each($('#addUpdateChargesGrid tbody tr:visible'), function() {
            count = count + 1;
            return false;
        });
        if (count === 0) {
            return 'There are no charge lines added. Please add atleast one line before apply';
        }
        $.each($('#addUpdateChargesGrid tbody tr:visible .chargeBasis'), function(index, row) {
            if ($(row).val() === '') {
                message = 'Basis is not selected \n';
                return false;
            }
        });
        $.each($('#addUpdateChargesGrid tbody tr:visible .chargeCurrency'), function(index, row) {
            if ($(row).val() === '') {
                message = message + 'Currency is not selected \n';
                return false;
            }
        });
        $.each($('#addUpdateChargesGrid tbody tr:visible .chargeType'), function(index, row) {
            if ($(row).val() === '') {
                message = message + 'Charge Type is not selected \n';
                return false;
            }
        });
        $.each($('#addUpdateChargesGrid tbody tr:visible .chargeRate'), function(index, row) {
            var mes = '';
            if ($(row).val() === '') {
                message = message + 'Rate should not be empty \n';
                return false;
            } else {
                mes = nsBooking.validateFloat('Charges Rate', $(row).val(), 4, 10);
                if (mes !== '') {
                    message = message + mes;
                    return false;
                }
            }
        });
        return message;
    }
    function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === '-') {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function(a, b) {
            var result = a[property] < b[property] ? -1 : (a[property] > b[property] ? 1 : 0);
            return result * sortOrder;
        };
    }
    function populateTerminal(responseTerminal, str) {
        var status = '<option value="">-- Select --</option>';
        if (responseTerminal.responseDescription === 'Success') {
            $.each(responseTerminal.responseData, function(index, val) {
                if (val.defaultTerminal=== 'Y') {
                    status += '<option value="' + val.id + '" selected>' + val.terminalCode + '</option>';
                } else {
                    status += '<option value="' + val.id + '" >' + val.terminalCode + '</option>';
                }
            });
            if (str === "current") {
                $('#currentEditDiscPortTerminal').html(status);
                $('#nextEditLoadPortTerminal').html(status);
            }
            if (str === "next") {
                $('#currentDiscPortTerminal').html(status);
                $('#nextLoadPortTerminal').html(status);
            }
        }
    }
    function checkNotNull(Obj) {
        return (Obj) ? true : false;
    }
    function textNullCheck(text) {
        return ((!text) || $.trim(text) === '' || $.trim(text) === 'null') ? '' : text;
    }
    function checkBoxIsCheck(field) {
        return $('input:checkbox[name=' + field + ']:checked').val() === 'on' ? 'Y' : 'N';
    }
    function getDropDownSelectionValue(field) {
        var selectedValue = '';
        if ($(field).find(':selected').text() === '-- Select --') {
            selectedValue = '';
        } else {
            selectedValue = $(field).find(':selected').text();
        }
        return selectedValue;
    }
    function populateTerminalForAddOrEdit(name, selectedVal, selectedName) {
        if (name === 'currentEditDiscPortCode') {
            if (textNullCheck($('#nextEditLoadPortCode').val()) !== '' || ($('#nextEditLoadPortCode:visible').length === 1)) { 
                $('#nextEditLoadPortCode').val(selectedVal);
                $('#nextEditLoadPortDesc').val(selectedName);
                nsBooking.newLpVal = selectedVal;
            }
            vmsService.vmsApiService(function(responseTerm) {
                if (responseTerm) {
                    populateTerminal(responseTerm, 'current');
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.getAllTerminal + selectedVal, 'POST', null);
            nsBooking.mainBookingFlag.editGetPossibleVoyage = true;
        }
        if (name === 'currentDiscPortCode') {
            $('#nextLoadPortCode').val(selectedVal);
            $('#nextLoadPortDesc').val(selectedName);
            vmsService.vmsApiService(function(responseTerminal) {
                if (responseTerminal) {
                    populateTerminal(responseTerminal, 'next');
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.getAllTerminal + selectedVal, 'POST', null);
            nsBooking.mainBookingFlag.addGetPossibleVoyage = true;
        }
    }
    function populateTerminalForEdit(name, selectedVal, selectedName) {
        if (name === 'currentEditDiscPortDesc') {
            if ($('#nextEditLoadPortCode').val() || ($('#nextEditLoadPortCode:visible').length === 1)) {
                $('#nextEditLoadPortCode').val(selectedVal);
                $('#nextEditLoadPortDesc').val(selectedName);
                nsBooking.newLpVal = selectedVal;
            }
            vmsService.vmsApiService(function(responseAllTerm) {
                if (responseAllTerm) {
                    populateTerminal(responseAllTerm, 'current');
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.getAllTerminal + selectedVal, 'POST', null);
            nsBooking.mainBookingFlag.editGetPossibleVoyage = true;
        }
        if (name === 'currentDiscPortDesc') {
            $('#nextLoadPortCode').val(selectedVal);
            $('#nextLoadPortDesc').val(selectedName);
            vmsService.vmsApiService(function(responseAllTerm) {
                if (responseAllTerm) {
                    populateTerminal(responseAllTerm, 'next');
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.getAllTerminal + selectedVal, 'POST', null);
        }
    }
    function checkEditLegOrNormal(dataType, attr, name, selectedVal, selectedName) {
        if (textNullCheck(dataType) !== '' && dataType === 'Leg') {
            populateTerminalForEdit(name, selectedVal, selectedName);
        }
        if (attr === 'mainBookDetailCustomerOriginDesc' || attr === 'mainBookDetailCustomerDestinationDesc') {
            nsBooking.mainBookingFlag.changedOriginDest = true;
        }
    }
    function checkAddLegOrNormal(dataType, attr, name, selectedVal, selectedName) {
        if (textNullCheck(dataType) !== '' && dataType === 'Leg') {
            populateTerminalForAddOrEdit(name, selectedVal, selectedName);
        }
        if (attr === 'mainBookDetailCustomerOrigin' || attr === 'mainBookDetailCustomerDestination') {
            nsBooking.mainBookingFlag.changedOriginDest = true;
        }
    }
    function clearThirdPartyInfo(){
    
    	 $('select[name="voyageTransportationType"]').val('');
         $('select[name="voyageCarrier"]').val('');
         $('input[name="voyageCarrierRef"]').val('');
         $('input[name="EstimatedArrival"]').val('');
         $('input[name="EstimatedDeparture"]').val('');
         $('.carrierOtherDetails').val('');
         $('input[name="shippedOnboard"]').removeAttr('checked');
    }
    function populateThirdPartyInfo(consignmentLegModel, selectedVesselVoyage) {
        if (textNullCheck(selectedVesselVoyage) !== '') {
            $('#thirdPartyVoyage').css('visibility', 'hidden');
            clearThirdPartyInfo()
           
        } else {
            $('#thirdPartyVoyage').css('visibility', 'visible');
            $('select[name="voyageTransportationType"]').val(consignmentLegModel.transpType);
            if(nsBooking.subBookingBillStatus === '10') {
            	$('input[name="EstimatedArrival"], input[name="EstimatedDeparture"]').prop('disabled', false);
            }
            if (consignmentLegModel.carrierId === null) {
                $('select[name="voyageCarrier"]').val('');
            } else {
                $('select[name="voyageCarrier"]').val(consignmentLegModel.carrierId);
            }
            if (consignmentLegModel.carrierId === '12') {
                $('.carrierOtherDetails').prop('disabled', false);
                $('.carrierOtherDetails').val(consignmentLegModel.carrierName);
            } else {
                $('.carrierOtherDetails').prop('disabled', true);
            }
            if (consignmentLegModel.transpType === '20') {
                $('#voyageCarrier').removeAttr('disabled');
            } else {
                $('#voyageCarrier').attr('disabled', 'disabled');
            }
            $('input[name="voyageCarrierRef"]').val(consignmentLegModel.carrierRef);
            $('input[name="EstimatedArrival"]').val(consignmentLegModel.estimatedArrival);
            $('input[name="EstimatedDeparture"]').val(consignmentLegModel.estimatedDeparture);
            if (consignmentLegModel.shippedOnBoard === 'Y') {
                $('input[name="shippedOnboard"]').attr('checked', 'checked');
            } else {
                $('input[name="shippedOnboard"]').removeAttr('checked');
            }
        }
    }
    function setEquipmentNum(booEquipNumberObj, cargoConsignmentModel) {
        var booEquipNumber = booEquipNumberObj;
        $('select[name="cargoEquipmentNbr"]').val('');
        $('input[name="cargoEquipmentType"]').val('');
        if (!booEquipNumber) {
            if (cargoConsignmentModel.equipNumber === '-1') {
                $('select[name="cargoEquipmentNbr"]').val('');
                $('input[name="cargoEquipmentType"]').val('');
                $('#cargoEquipmentNbr').attr('disabled', 'disabled');
                booEquipNumber = true;
            } else {
                $('select[name="cargoEquipmentNbr"]').val(cargoConsignmentModel.equipNumber);
                $('input[name="cargoEquipmentType"]').val(cargoConsignmentModel.equipType);
                $('#cargoEquipmentNbr').removeAttr('disabled');
                nsBooking.populateEquipment(cargoConsignmentModel.equipNumber);
                booEquipNumber = true;
            }
        }
        return booEquipNumber;
    }
    function setCargoOnHold(booCargoOnHoldObj, cargoConsignmentModel) {
        var booCargoOnHold = booCargoOnHoldObj;
        if (!booCargoOnHold) {
            if (cargoConsignmentModel.cargoOnHold === '-1') {
                $('#subCOH').prop('checked', true);
                $('#subCOH').attr('disabled', 'disabled');
                booCargoOnHold = true;
            } else {
                $('#subCOH').prop('checked', cargoConsignmentModel.cargoOnHold === 'Y');
                $('#subCOH').removeAttr('disabled');
                booCargoOnHold = true;
            }
        }
        return booCargoOnHold;
    }
    function setNewCargo(booNewCargoObj, cargoConsignmentModel) {
        var booNewCargo = booNewCargoObj;
        if (!booNewCargo) {
            if (cargoConsignmentModel.newCargo === '-1' || cargoConsignmentModel.newCargo === 'Y') {
                $('#subAttr').val('Y');                
                booNewCargo = true;
            } else {
                $('#subAttr').val(cargoConsignmentModel.newCargo);                
                booNewCargo = true;
            }
        }
        return booNewCargo;
    }
    function setActualDim(booDimensionObj, cargoConsignmentModel) {
        var booDimension = booDimensionObj, aLength = '', aWidth = '', aHeight = '', aWeight = '', aArea = '', aVolume = '';
        if (!booDimension) {
            if (cargoConsignmentModel.sameActual === 'Y') {
                $('input[name="actualLength"]').val(cargoConsignmentModel.dimension.length);
                $('input[name="actualWidth"]').val(cargoConsignmentModel.dimension.width);
                $('input[name="actualHeigth"]').val(cargoConsignmentModel.dimension.height);
                $('input[name="actualWeight"]').val(cargoConsignmentModel.dimension.weight);
                $('input[name="actualArea"]').val(cargoConsignmentModel.dimension.area);
                $('input[name="actualVolume"]').val(cargoConsignmentModel.dimension.volume);
                
                aLength = $('input[name="actualLength"]').val();
                $('input[name="actualLength"]').val(aLength ? parseFloat(aLength).toFixed(3) : '');
                aWidth = $('input[name="actualWidth"]').val();
                $('input[name="actualWidth"]').val(aWidth ? parseFloat(aWidth).toFixed(3) : '');
                aHeight = $('input[name="actualHeigth"]').val();
                $('input[name="actualHeigth"]').val(aHeight ? parseFloat(aHeight).toFixed(3) : '');
                aWeight = $('input[name="actualWeight"]').val();
                $('input[name="actualWeight"]').val(aWeight ? parseFloat(aWeight).toFixed(0) : '');
                aArea = $('input[name="actualArea"]').val();
                $('input[name="actualArea"]').val(aArea ? parseFloat(nsBookDoc.converToUpperDecimalOnFive(aArea, 3)).toFixed(3) : '');
                aVolume = $('input[name="actualVolume"]').val();
                $('input[name="actualVolume"]').val(aVolume ? parseFloat(nsBookDoc.converToUpperDecimalOnFive(aVolume, 3)).toFixed(3) : '');
                
                if (cargoConsignmentModel.dimension && cargoConsignmentModel.dimension.dimensionType) {
                    $('#actualMeasureUnit').val(cargoConsignmentModel.dimension.dimensionType);
                }
                else if(localStorage.getItem('measurementType')){
                	$('#actualMeasureUnit').val(localStorage.getItem('measurementType'));
                }                 
                	
				if (!cargoConsignmentModel.dimension.area) {
				    actualAreaCalc();
				}
				if(!cargoConsignmentModel.dimension.volume){
				         actualVolumeCalc();
				}   
                booDimension = true;
                $('input[name="actualLength"]').removeAttr('disabled');
                $('input[name="actualWidth"]').removeAttr('disabled');
                $('input[name="actualHeigth"]').removeAttr('disabled');
                $('input[name="actualWeight"]').removeAttr('disabled');
                $('input[name="actualWeight"]').removeAttr('disabled');
                $('#actualMeasureUnit').removeAttr('disabled');
                $('#copytpFrightLink').removeClass('disabledEditIcon');
            } else {
                $('input[name="actualLength"]').val('');
                $('input[name="actualWidth"]').val('');
                $('input[name="actualHeigth"]').val('');
                $('input[name="actualWeight"]').val('');
                $('input[name="actualArea"]').val('');
                $('input[name="actualVolume"]').val('');
                $('input[name="actualLength"]').attr('disabled', 'disabled');
                $('input[name="actualWidth"]').attr('disabled', 'disabled');
                $('input[name="actualHeigth"]').attr('disabled', 'disabled');
                $('input[name="actualWeight"]').attr('disabled', 'disabled');
                $('input[name="actualArea"]').attr('disabled', 'disabled');
                $('input[name="actualVolume"]').attr('disabled', 'disabled');
                $('#actualMeasureUnit').attr('disabled', 'disabled');
                $('#copytpFrightLink').addClass('disabledEditIcon');
                if (cargoConsignmentModel.dimension && cargoConsignmentModel.dimension.dimensionType) {
                    $('#actualMeasureUnit').val(cargoConsignmentModel.dimension.dimensionType);
                }
                else if(localStorage.getItem('measurementType')){
                	$('#actualMeasureUnit').val(localStorage.getItem('measurementType'));
                }   
                booDimension = true;
            }
        }
        return booDimension;
    }
    function actualAreaCalc() {
    	var length = parseFloat($('#actualLength').val()), width = parseFloat($('#actualWidth').val()), area = 0, scale = '';
        if ($.isNumeric(length) && $.isNumeric(width) && (length !== '') && (width !== '')) {
            area = math.eval(length * width);
            scale = $('#actualMeasureUnit').val();
            if (scale === '10') {
                area = math.eval(area / 144);
            }
            area = nsBookDoc.converToUpperDecimalOnFive(area, 3).toFixed(3);
            $('#actualArea').val(area);
        } else {
            $('#actualArea').val('');
        }
    }
    function actualVolumeCalc() {
    	var length = parseFloat($('#actualLength').val()), width = parseFloat($('#actualWidth').val()), height = parseFloat($('#actualHeigth').val()), volume = 0, scale = '';
        if ($.isNumeric(length) && $.isNumeric(width) && $.isNumeric(height) && (length !== '') && (width !== '')
            && (height !== '')) {
            volume =  nsCore.volumeCalc(length, width, height);
            scale = $('#actualMeasureUnit').val();
            if (scale === '10') {
                volume = math.eval(volume / 1728);
            }
            volume= Number(volume<0.000001?volume.toFixed(5): volume);
            volume = nsBookDoc.converToUpperDecimalOnFive(volume, 3).toFixed(3);
            $('#actualVolume').val(volume);
        } else {
            $('#actualVolume').val('');
        }
    }
    function setUnitsValue(consignmentLegModel) {
        var recUnits = '', loadUnits = '';
        if (consignmentLegModel.consignmentType !== 'O' && consignmentLegModel.consignmentType !== 'P') {
            recUnits = consignmentLegModel.receivedUnits, loadUnits = consignmentLegModel.loadedUnits;
            if (textNullCheck(recUnits) !== '') {
                $('.totalRCD a').text(recUnits);
            } else {
                $('.totalRCD a').text('0');
            }
            if (textNullCheck(loadUnits) !== '') {
                $('.totalLDD a').text(loadUnits);
            } else {
                $('.totalLDD a').text('0');
            }
        }
    }
    function populateCargoConsignments(cargoConsignmentModel) {
        var booEquipNumber = false, booCargoOnHold = false, booNewCargo = false, booDimension = false;
        $.each(cargoConsignmentModel.cargoConsignmentList, function(index, cargoConsignmentModelSub) {
            booEquipNumber = setEquipmentNum(booEquipNumber, cargoConsignmentModelSub);
            booCargoOnHold = setCargoOnHold(booCargoOnHold, cargoConsignmentModelSub);
            booNewCargo = setNewCargo(booNewCargo, cargoConsignmentModelSub);
            booDimension = setActualDim(booDimension, cargoConsignmentModelSub);
        });
    }
    $.extend(true, nsBooking, commonMethodObj);
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);
