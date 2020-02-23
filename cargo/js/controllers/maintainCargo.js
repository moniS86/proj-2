/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsCargo, $, vmsService, nsCore) {
    var cargoMaintObj = {
            'calculateAreaVolume': calculateAreaVolume,
            'showBtnsAndResize': showBtnsAndResize,
            'setDefaultUnits': setDefaultUnits,
            'openCargoDetailsPopup': openCargoDetailsPopup,
            'sendMail': sendMail,
            'calculateMinCondition': calculateMinCondition,
            'clearElements': clearElements,
            'removeDuplicates': removeDuplicates
        },
        masterURLprefix = '/Vms',
        areaDigitsUpperBound = 21,
        releasedToLoadDate = '',
        userDateFormat = nsCore.returnDate(localStorage.getItem('dateFormat'));
    var cargoTcn,consLegTcn,cargoConsTcn,consTcn;
    //This method is used to load the cargo status dropdown
    function buildCargoStatusDropdown() {
        var cargoStatusesData = {
            id: 'N'
        },
		status;

        vmsService.vmsApiService(function(response) {
            if (response) {
                status = '<option value="">-- Select --</option>';
                $.each(response, function(i, val) {
                    status += '<option value="' + val.code + '">' + val.desc + '</option>';
                });
                $('#newCargoTrackStatus').html(status);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, (nsCargo.cargoStatus), 'POST', JSON.stringify(cargoStatusesData));
    }

    function calcAreaAndVolumeUpdate() {
        var length = $('#updLengthCalc').val(), width = $('#updWidthCalc').val(), height = $('#updHeightCalc').val(),
            elementLen = $('#updLengthCalc'), elementwidth = $('#updWidthCalc'), elementHeight = $('#updHeightCalc'),
            elementWeight = $('#updWeightCalc'), elementArea = $('#updAreaCalc'), elementVolume = $('#updVolumeCalc'),
            odoValue = $('#newCargoOdo').val() || '0', valLen = elementLen.val(), valWidth = elementwidth.val(),
            valHeight = elementHeight.val(), valWeight = elementWeight.val(), valArea = elementArea.val(),
            valVolume = elementVolume.val(), calculatedVal = [], measurementType = {}, message = '';
        message = nsCargo.dimensionsLWHWValidation(message, valLen, valWidth, valHeight, valWeight,
                elementLen, elementwidth,elementHeight, elementWeight);
        if (length || width || height || valWeight) {
            message += nsCargo.dimCheck(length, width, height, valWeight);
        }
        message = nsCargo.dimensionMessage(message, valArea, elementArea, 12, 8, 'Area');
        message = nsCargo.dimensionMessage(message, valVolume, elementVolume, 18, 8, 'Volume');
        message = (!nsCargo.regEx.numeric.test(odoValue) ? (message + '\n' + 'Enter a valid Odometer value') : message);
        message += ((moment($('#dateReceived').val(), userDateFormat).isValid() ||
        		nsCargo.checkEmptyString($('#dateReceived').val()))) ? '' : ('\n' + 'Enter a valid Date');
        if (message) {
            nsCore.showAlert(message);
            return false;
        }
        calculatedVal = [];
        measurementType = {
            calculatedLength : length,
            calculatedWidth : width,
            calculatedHeight : height,
            measurementType : $('#dimensions').val()
        };
        areaVolumeAjaxUpdate(measurementType, calculatedVal);
    }

    function areaVolumeAjaxUpdate(measurementType, calculatedVal) {
    $('.preloaderWrapper').show(); 
    $.ajax({
            url : masterURLprefix + "/modeltype/AreaVolume",
            contentType : "application/json",
            type : "POST",
            loading : true,
            data : JSON.stringify(measurementType),
            cache : false,
            success : function(response) {
            	$('.preloaderWrapper').hide(); 
                if (response.responseData.length !== 0) {
                    calculatedVal[0] = response.responseData[0].calculatedArea;
                    calculatedVal[1] = response.responseData[0].calculatedVolume;
                    $("#updAreaCalc").val(((response.responseData[0].calculatedArea === 0) ?
                        '' : response.responseData[0].calculatedArea));
                    $("#updVolumeCalc").val(((calculatedVal[1] === 0) ? '' : calculatedVal[1]));
                }
                // Saving the cargo details after completing the validation
                updateCargoDetails(calculatedVal[0], calculatedVal[1]);
            }
        });
    }

    // This method is used to validate vin number if the cargo tracking status is changed
    function validateVinNo() {
        $('#newCargoTrackStatus').change(function() {
            var selectedVal = $('#newCargoVin').val();
            if ((selectedVal) || selectedVal.length <= 0) {
                nsCore.showAlert('Cannot changes Tracking status without a Vin Number');
            }
        });
    }

    // This method is used to populate the equipment type when the equipment number is changed
    function updateEquipmentType() {
        $('#newEquipmentNum').change(function() {
            var selectedVal = $('#newEquipmentNum').val();
            $('#newEquipType').val(unescape(selectedVal));
        });
    }

    // This method is used to update the calculated area
    function updateArea(response) {
        if (response.responseData[0].calculatedArea === 0) {
            $('#updAreaCalc').val('');
        } else {
            $('#updAreaCalc').val(response.responseData[0].calculatedArea);
        }
    }

    // This method is used to update the calculated volume
    function updateVolume(calculatedVal) {
        if (calculatedVal[1] === 0) {
            $('#updVolumeCalc').val('');
        } else {
            $('#updVolumeCalc').val(calculatedVal[1]);
        }
    }

    // This method is used to calculate the dimensions when the dimension types dropdown value changes
    function updateDimensions() {
        $('#dimensions').change(function() {
            var length = $('#updLengthCalc').val(),
                width = $('#updWidthCalc').val(),
                height = $('#updHeightCalc').val(),
                calculatedVal = [],
                measurementType = {
                    calculatedLength: length,
                    calculatedWidth: width,
                    calculatedHeight: height,
                    measurementType: $('#dimensions').val()
                };
            if (!(length || width || height)) {
                return false;
            }

            vmsService.vmsApiService(function(response) {
                if (response) {
                    if (response.responseData.length !== 0) {
                        calculatedVal[0] = response.responseData[0].calculatedArea;
                        calculatedVal[1] = response.responseData[0].calculatedVolume;
                        if (calculatedVal[0].length > areaDigitsUpperBound) {
                            nsCore.showAlert('Area value is too large (Maximum allowed digits ' +
                                'before decimal is 18 and after decimal is 8');
                            $('#updAreaCalc').val('');
                            return false;
                        } else {
                            updateArea(response);
                        }
                        if (calculatedVal[1].length < 27) {
                            updateVolume(calculatedVal);
                        }
                    }
                } else {
                    nsCore.showAlert(nsCargo.error);
                }
            }, (nsCargo.areaVolume), 'POST', JSON.stringify(measurementType));
        });
    }

    // Method to open the update details pop up window when the vin no is clicked
    function openCargoDetailsPopup(selectVal, dEdit) {
        var cargoSearchCriteria = {},
        	eleArr = [], idArr = [], i = 0,
            dateFormat = localStorage.getItem('dateFormat');
        // Initialize Cargo Popup
        $('#newCargoDetailsPopup').dialog({
            closeOnEscape: false,
            modal: true,
            autoOpen: false,
            resizable: false,
            draggable: false,
            width: '90%',
            close: function() {
                $('#newCargoForm').trigger('reset');
            },
            create: function() {
                $('#newCargoDetailsPopup').prev().remove();
            },
            open: function() {
                $('#newCargoDetailsPopup').prev().remove();
                $('#newCargoDetailsPopup').addClass('active-content');
            }
        });
      
        $('input#newCargoVin').keyup(function() {
            var newCargoDetailsPopup = $('#newCargoDetailsPopup');
            if ($(newCargoDetailsPopup).find('#newCargoVin').val().length > 0) {
                $(newCargoDetailsPopup).find('#dateReceived').prop('disabled', false);
                $(newCargoDetailsPopup).closest('#dateReceived .datePickerIconWrap').prop('disabled', false);
            } else {
                $(newCargoDetailsPopup).find('#dateReceived').prop('disabled', true);
                $(newCargoDetailsPopup).closest('#dateReceived .datePickerIconWrap').prop('disabled', true);
            }
        });
        nsCargo.adjustActionList();
        initPopUp();
        if(sessionStorage.getItem('eleActArr')){
        	idArr= JSON.parse(sessionStorage.getItem('eleActArr'));
        }
        else{
        	eleArr = $('#newCargoDetailsPopup :enabled');
        	for(i = 0; i < eleArr.length;i++){
        		idArr[i] = eleArr[i].id;
        	}
        	sessionStorage.setItem('eleActArr', JSON.stringify(idArr));
        }
        if(dEdit === 'Y'){
        	for(i = 0; i < idArr.length; i++){
        		if(idArr[i]){
        			$('#'+idArr[i]).attr('disabled', false);
        		}
        	}
        	$('.saveButton').attr('disabled', false);
        	$('#newCargoDetailsPopup .resetButton').prop('disabled', false);
        }
        else {
        	$('#newCargoDetailsPopup :enabled').attr('disabled', true);
        	$('#newCargoDetailsPopup .resetButton').prop('disabled', true);
        }
        cargoSearchCriteria = {
            ids: selectVal.id,
            cargoSearchFlag: 'N',
            dateFormat: dateFormat
        };

        vmsService.vmsApiService(function(response) {
            if (response) {
                if (response.responseDescription === 'Success') {
                	if(response.responseData && response.responseData.length>0){
                      $('#newCargoDetailsPopup').dialog('open');
                            loadCargoDetailsPopUp(response.responseData[0]);
                    }
                    else{
                         nsCore.showAlert("Someone else have updated the data since you retrieved the cargo information");
                    }
                    if(dEdit === 'N'){
                        
                        $('#newCargoDetailsPopup :enabled').attr('disabled', true);
                    }
                }
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, (nsCargo.cargoSearchDetails), 'POST', JSON.stringify(cargoSearchCriteria));
    }

    // This method is used to load the equipment type dropdown
    function buildEquipmentDropdown(equipmentType, portCode) {
        var equipmentsData = {
            'portInfo': {
                'portCode': portCode
            }
        };

        vmsService.vmsApiService(function(response) {
			var status;
            if (response) {
                status = '<option value="">-- Select --</option>';
                $.each(response, function(i, val) {
                    if ($.trim(equipmentType) === val.id) {
                        status += '<option value="' + escape(val.desc) + '" selected>' + val.id + '</option>';
                        $('#newEquipType').val(unescape(val.desc));
                    } else {
                        status += '<option value="' + escape(val.desc) + '">' + val.id + '</option>';
                    }
                    $('#newEquipmentNum').html(status);
                });

            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, (nsCargo.cargoEquipments), 'POST', JSON.stringify(equipmentsData));
    }

    // This method is used to loadCargo pop initializer
    function initPopUp() {
        $('#cargoId,#updVoyageCode,#updVoyageDesc,#updBookingNum,' +
            '#updCargoCust,#updLoadPortCode,#updLoadPortDesc,#newDisPortCode').val('');
        // discharge port code
        $('#newDisPortDesc,#updCargoDest,#newCargoVin,#newCargoCheck').val('');
        // new Cargo check box
        $('#newCargoDesc,#updLengthCalc,#updWidthCalc,#updHeightCalc,#updWeightcalc,' +
            '#updAreaCalc,#updVolumeCalc,#newEquipType,#newCargoDocReceipt,' +
            '#dateReceived,#newCargoOdo,#newCargoRegPlate,#newCargoCondition').val('');
    }

    // This method is used to validate update dimensions functionality
    function validateDimensions(response) {
		var validVal;
		//added for 3889
        if ((!response.dimension.length && response.dimension.length !== 0) || response.dimension.length === 'NaN') {
            validVal = '';
        } else {
            validVal = parseFloat(response.dimension.length).toFixed(3);
        }
		$('#updLengthCalc').val(validVal);

        if ((!response.dimension.width && response.dimension.width !== 0) || response.dimension.width === 'NaN') {
            validVal = '';
        } else {
            validVal = parseFloat(response.dimension.width).toFixed(3);
        }

		$('#updWidthCalc').val(validVal);


        if ((!response.dimension.height && response.dimension.height !== 0) || response.dimension.height === 'NaN') {
            validVal = '';
        } else {
            validVal = parseFloat(response.dimension.height).toFixed(3);
        }

		$('#updHeightCalc').val(validVal);

        $('#updWeightCalc').val((!response.dimension.weight && response.dimension.weight !== 0) ? '' : response.dimension.weight);

        if (!response.dimension.area && response.dimension.area !== 0) {
            validVal = '';
        } else {
            validVal = parseFloat(response.dimension.area).toFixed(3);
        }

		$('#updAreaCalc').val(validVal);
        $('#updVolumeCalc').val((!response.dimension.volume && response.dimension.volume !== 0)
		? '' : parseFloat(response.dimension.volume).toFixed(3));
    }

    // This method is used for loading the cargo details popup window
    function loadCargoDetailsPopUp(response) {
        var selectedDimensions = '',
            selTrackStatus = '',
			el, lpCode='', dpCode='';
        releasedToLoadDate = response.cargoConsignment.releasedToLoadDate;
        cargoTcn=response.cargoConsignment.cargoTcn;
        cargoTcn=response.cargoTcn;
        cargoConsTcn=response.cargoConsTcn;
        consLegTcn=response.consLegTcn;
        consTcn=response.consTcn;
        $('#cargoId').val(response.id);
        $('#updVoyageCode').val(response.voyage.vesselCode);
        $('#updVoyageDesc').val(response.voyage.voyageNo);
        $('#updBookingNum').val(response.bookingNo);
        $('#updCargoCust').val(response.customer);
        $('#updLoadPortCode').val(response.loadPort.portCode);
        $('#updLoadPortDesc').val(response.loadPort.portName);
        $('#newDisPortCode').val(response.dischargePort.portCode);
        $('#newDisPortDesc').val(response.dischargePort.portName);
        $('#updCargoDest').val(response.destination.portCode);
        $('#newCargoVin').val(response.vinNo);
        
		el = $('#newCargoDetailsPopup');
		
		/*VMSAG-4274 (Jira)*/


        if (!$('#newCargoVin').val()) {
            $(el).find('#dateReceived').prop('disabled', true);
            $(el).closest('#dateReceived .datePickerIconWrap').prop('disabled', true);
        } else {
            $(el).find('#dateReceived').prop('disabled', false);
            $(el).closest('#dateReceived .datePickerIconWrap').prop('disabled', false);
        }

		el = $('#newCargoCheck');

        if (response.newCargo === 'N' || $.trim(response.newCargo).length === 0) {
           $(el).prop('checked', false);
        } else {
            $(el).prop('checked', true);
        }

		el = $('#newCargoCleared');

        if (response.customCleared === 'N' || $.trim(response.customCleared).length === 0) {
            $(el).prop('checked', false);
        } else {
            $(el).prop('checked', true);
        }

        $('#newFirmCheck').val(response.firmCargo);
        $('#newCargoDesc').val(response.cargoText);
        lpCode = response.loadPort.portCode;
        vmsService.vmsApiService(function(data) {
        	var status;
            if (data) {
                status = '<option value="">-- Select --</option>';
                $.each(data.responseData, function(i, val) {
                    status += '<option value="' + val.id + '">' + val.terminalCode + '</option>';
                });

                $('#newLoadPortTerminal').html(status);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
            $('#newLoadPortTerminal').val(response.loadTerm.terminalId);
        }, (nsCargo.cargoLoadTerminal + lpCode), 'POST', null);

        dpCode = response.dischargePort.portCode;
        vmsService.vmsApiService(function(data) {
        	var status;
            if (data) {
                status = '<option value="">-- Select --</option>';
                $.each(data.responseData, function(i, val) {
                    status += '<option value="' + val.id + '">' + val.terminalCode + '</option>';
                });

                $('#newDisPortTerm').html(status);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
            $('#newDisPortTerm').val(response.discTerm.terminalId);
        }, (nsCargo.cargoLoadTerminal + dpCode), 'POST', null);

        selectedDimensions = !(response.dimension.dimensionUnit) ?
            $('#actionlistDimensions').attr('data-default') : response.dimension.dimensionUnit;
         if(selectedDimensions){
        	 $('#dimensions').val(selectedDimensions);
         }
         else {
        	 $('#dimensions').val(localStorage.getItem('measurementType'));
         }
        validateDimensions(response);
        buildEquipmentDropdown(response.equipment.equipmentType, response.dischargePort.portCode);
        $('#newCargoDocRecipt').val(response.cargoConsignment.docReceipt);
        $('#dateReceived').val(response.cargoConsignment.receivedDate);
        releasedToLoadDate = releasedToLoadDate ? releasedToLoadDate : '';
        $('#dtdis').val(response.cargoConsignment.dischargeDate);
        $('#dtlod').val(response.cargoConsignment.loadedDate);
        $('#newCargoOnHold').prop('checked', !(response.cargoHold === 'N' || $.trim(response.cargoHold).length === 0));
        selTrackStatus = response.cargoConsignment.statusCode;
        $('#newCargoTrackStatus').find('option').each(function(i, e) {
            if ($(e).val() === selTrackStatus) {
                $('#newCargoTrackStatus').prop('selectedIndex', i);
            }
        });
        $('#newCargoOdo').val(response.odometer);
        $('#newCargoRegPlate').val(response.regPlate);
        $('#newCargoCondition').val(response.cargoConsignment.condition);
        
        if(response.cargoConsignment.isIssued==="Y" && response.cargoConsignment.isManifested==="Y" ){
        	isManifested(true);      	
		}
        else if(response.cargoConsignment.isIssued==="Y" && response.cargoConsignment.isManifested==="N" ){
        	isManifested(true);
        	issuedOnly();	
        }else{     
        if (response.isLpOutbound === "Y") {
				isManifested(false);
			} else {
				isManifested(true);
			}
		}
	}
    
	function issuedOnly() {
		$("#newEquipmentNum").prop('disabled', false);
		$("#dateReceived").prop('disabled', false);
		$(".popupSubmitForm .saveButton").prop('disabled', false);
		$(".popupSubmitForm .formCancelBtn").prop('disabled', false);
		$("#newCargoCleared").prop('disabled', false);

	}
    function isManifested(isEnable) {
    	$("#newEquipmentNum").prop('disabled', isEnable);
		$('#newCargoDocRecipt').prop('disabled', isEnable);
		$('#updLengthCalc').prop('disabled', isEnable);
		$("#updWidthCalc").prop('disabled', isEnable);
		$("#updHeightCalc").prop('disabled', isEnable);
		$("#updWeightCalc").prop('disabled', isEnable);
		$("#newCargoCondition").prop('disabled', isEnable);
		$("#newCargoOdo").prop('disabled', isEnable);
		$("#newCargoRegPlate").prop('disabled', isEnable);
		$("#newCargoVin").prop('disabled', isEnable);
		$("#dimensions").prop('disabled', isEnable);
		$("#dateReceived").prop('disabled', isEnable);
		$("#newCargoCheck").prop('disabled', isEnable);
		$(".popupSubmitForm .saveButton").prop('disabled', isEnable);
		$(".popupSubmitForm .formCancelBtn").prop('disabled', isEnable);
		$("#newCargoCleared").prop('disabled', isEnable);
    }
    

    //This method is used to perform the area volume calculation on tab out functionality
    function updateAreaVolume(measurementType, calculatedVal) {
        vmsService.vmsApiService(function(response) {
            if (response) {
                if (response.responseData.length !== 0) {
                    calculatedVal[0] = response.responseData[0].calculatedArea;
                    calculatedVal[1] = response.responseData[0].calculatedVolume;
                    $('#updAreaCalc').val((response.responseData[0].calculatedArea === 0) ? '' : response.responseData[0].calculatedArea);
                    $('#updVolumeCalc').val((calculatedVal[1] === 0) ? '' : calculatedVal[1]);
                }
                // Saving the cargo details after completing the validation
                updateCargoDetails(calculatedVal[0], calculatedVal[1]);
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, (nsCargo.areaVolume), 'POST', JSON.stringify(measurementType));

    }

    // This method is used to trigger the area volume calculation
    function calculateAreaVolume() {
        var message, length = $('#updLengthCalc').val(),
            width = $('#updWidthCalc').val(),
            height = $('#updHeightCalc').val(),
            elementLen = $('#updLengthCalc'),
            elementWidth = $('#updWidthCalc'),
            elementHeight = $('#updHeightCalc'),
            elementWeight = $('#updWeightCalc'),
            elementArea = $('#updAreaCalc'),
            elementVolume = $('#updVolumeCalc'),
            odoValue = $('#newCargoOdo').val(),
            valLen = elementLen.val(),
            valWidth = elementWidth.val(),
            valHeight = elementHeight.val(),
            valWeight = elementWeight.val(),
            valArea = elementArea.val(),
            valVolume = elementVolume.val(),
            calculatedVal = [],
            measurementType = {};

        message = '';
        message = nsCargo.dimensionsLWHWValidation(message, valLen, valWidth, valHeight, valWeight,
            elementLen, elementWidth, elementHeight, elementWeight);
        message = nsCargo.dimensionMessage(message, valArea, elementArea, 12, 8, 'Area');
        message = nsCargo.dimensionMessage(message, valVolume, elementVolume, 18, 8, 'Volume');
        message = !nsCargo.regEx.numeric.test(odoValue) ? message + '\n Enter a valid Odometer value' : message;
        message += (nsCargo.moment($('#dateReceived').val() || nsCargo.userDateFormat).isValid() ||
            nsCargo.checkEmptyString($('#dateReceived').val())) ? '' : '\n Enter a valid Date';

        if (message) {
            nsCore.showAlert(message);
            return false;
        }


        measurementType = {
            calculatedLength: length,
            calculatedWidth: width,
            calculatedHeight: height,
            measurementType: $('#dimensions').val()
        };
        updateAreaVolume(measurementType, calculatedVal);
    }

    // This method is used to perform Cargo Mass Action
    function massActionCargo(vinNo, cargoMassAction) {
        var massActionCargoData = [];
        cargoMassAction.vinNo = vinNo;
        massActionCargoData.push(cargoMassAction);
        var cargoMassActionData = {
                cargoMassAction: massActionCargoData
            };
        $('.preloaderWrapper').show(); 
        vmsService.vmsApiServiceLoad(function(response) {
        	$('.preloaderWrapper').hide(); 
        	if (response) {
                $('div.statusMessageText').text('');
                if (response.responseCode === '45000') {
                	nsCore.showAlert('The Cargo information cannot be updated because the data has changed since you retrieved.');
                }else if(response.responseCode === '46000' || response.responseCode === '47000' || response.responseCode === '48000'){
                    nsCore.showAlert(response.responseDescription);
                }else if (response.responseDescription === 'Success') {
                    $('#newCargoDetailsPopup').dialog('close');
                    nsCargo.cargoSearchCall(nsCargo.prevCargoSearchCriteriaData)
                    $('div.statusMessageText').text('Update saved successfully!');
                    $('.statusMessageText').css('display', 'block');
                }else{
                	nsCore.showAlert('Something went wrong, please contact support.');
                }
            } else {
                nsCore.showAlert(nsCargo.error);
            }
        }, (nsCargo.areaVolumeUpdate), 'POST', JSON.stringify(cargoMassActionData));
    }

    // This method is used to construct the data for update functionality
    function updateCargoDetails(areaData, volumeData) {
        var cargoId = $('#cargoId').val(), message,
            dateFormat = localStorage.getItem('dateFormat'),
            cargoStatusReceived = 'Received',
            loadPortTerm = $('#newLoadPortTerminal').val(),
            discPortTerm = $('#newDisPortTerm').val(),
            vinSerialNum = $('#newCargoVin').val().trim(),
            dimensionUnit = '',
            lengthVal = $('#updLengthCalc').val(),
            widthVal = $('#updWidthCalc').val(),
            heightVal = $('#updHeightCalc').val(),
            weightVal = $('#updWeightCalc').val(),
            areaVal = areaData,
            volumeVal = volumeData,            
            newCargoFlg = $('#newCargoCheck').is(':checked') ? 'Y' : 'N',
            equipmentType = $('#newEquipType').val(),
            docRecipt = $('#newCargoDocRecipt').val(),
            dateReceived = $('#dateReceived').val(),
            regPlate = $('#newCargoRegPlate').val(),
            trackingStatus = $('#newCargoTrackStatus').val(),
            cargoOdo = $('#newCargoOdo').val() || '0',
            cargoCondition = $('#newCargoCondition').val(),
            dischargeDate = $('#dtdis').val(),
            customCleared = $('#newCargoCleared').is(':checked') ? 'Y' : 'N',
            vinNo = vinSerialNum,
            loadTerminal, discTerminal, cargoMassAction, dimension, equip, dateOptionVal = dateReceived,
            loadedDate = $('#dtlod').val(),
            shpStat = cargoStatusReceived;
        
        if(lengthVal && widthVal && heightVal && weightVal) {
        	dimensionUnit = $('#dimensions').val();
        }
        else {
        	dimensionUnit = '';
        }
        if(dateReceived.trim()!=="" && !vinNo.trim()) {
            nsCore.showAlert("VIN cannot be empty if it is Received / Loaded / Released to Load / Discharged");
            return;
        }
        if((trackingStatus==="3" || trackingStatus==="4" || trackingStatus==="6") && !vinNo.trim()) {
            nsCore.showAlert("VIN cannot be empty if it is Loaded / Released to Load / Discharged");
            return;
        }

        if ($('#newEquipmentNum').find(':selected').text() === '-- Select --') {
            equip = {
                equipmentNo: '',
                equipmentType: equipmentType
            };
        } else {
            equip = {
                equipmentNo: $('#newEquipmentNum').find(':selected').text(),
                equipmentType: equipmentType
            };
        }

        dateOptionVal = (!dateOptionVal) ? '' : dateOptionVal;
        // default date - in case no date is passed, this will not be updated
        message = nsCargo.validateDate(cargoId, dischargeDate, dateReceived, loadedDate, dateOptionVal, shpStat);

        if (message) {
            nsCore.showAlert(message);
            return false;
        }

        loadTerminal = { terminalCode: nsCargo.checkEmptyString(loadPortTerm) ? '0' : loadPortTerm };
        discTerminal = { terminalCode: nsCargo.checkEmptyString(discPortTerm) ? '0' : discPortTerm };

        dimension = {
            length: lengthVal,
            width: widthVal,
            height: heightVal,
            weight: weightVal,
            dimensionUnit: dimensionUnit,
            area : areaVal,
            volume : volumeVal           
        };
        cargoMassAction = {
            cargoConsId: cargoId,
            shippingStatus: trackingStatus,
            regPlate: regPlate,
            odometer: cargoOdo,
            docReciptNum: docRecipt,
            cargoCondition: cargoCondition,
            cargoDateValue: dateReceived,
            dimension: dimension,
            equipment: equip,
            loadTerminal: loadTerminal,
            discTerminal: discTerminal,
            newCargo: newCargoFlg,
            updateType: 'U',
            dateFormat: dateFormat,
            customCleared: customCleared,
            cargoTcn: cargoTcn,
            cargoConsTcn: cargoConsTcn,
            consLegTcn: consLegTcn,
            consTcn: consTcn
        };
        massActionCargo(vinNo, cargoMassAction);
    }

    // This method is used to perform the email functionality
    function sendMail() {
        var flg = 0,
            emailID = $('#emailID').val(),
            mailContent = $('#content').val(),
            ids = [], mailBean,
            ccID = $('#ccID').val(),
            bccID = $('#bccID').val(),
            mailSubject = $('#subject').val(),
            messageMail = validateEmailFields(flg, emailID, mailSubject, ccID, bccID, mailContent);

        if (messageMail) {
            nsCore.showAlert(messageMail);
        } else {
            ids = '';
            $.unique(nsCargo.dataList);
            $.each(nsCargo.dataList, function(i, value) {
                ids = nsCargo.checkEmptyString(ids) ? value : ids + ',' + value;
            });
            ids = ids.toString().split(',');
            mailBean = {
                toMail: emailID,
                ccMail: ccID,
                bccMail: bccID,
                bodyContent: mailContent +'\n',
                subject: mailSubject,
                attachmentList: ids
            };

            vmsService.vmsApiService(function(response) {
                if (response.responseDescription === 'Success') {
                	var rowNodes = $('#cargoMgmtGrid').dataTable().api().rows().nodes().to$();
                	nsCargo.dataList = [];
                	$('.buttonsList').css('display', 'block');
                    $('div.msg').text('Email sent successfully!');
                    $('.statusMessageText').css('display', 'block');
                    $(rowNodes).removeClass('DTTT_selected selected');
                    $(rowNodes).find('.checkBoxCell input[type="checkbox"]').prop('checked', false);
                    $('#checkAllRows').prop('checked', false);
                    TableTools.fnGetInstance('cargoMgmtGrid').fnSelectNone(true);
                } else {
                    $('div.msg').text('Email send failed, please try again!');
                    $('.statusMessageText').css('display', 'block');
                }
            }, (nsCargo.cargoEmailDetails), 'POST', JSON.stringify(mailBean));

            $('#emailPopup').dialog('close');
            $('#emailID,#ccID,#bccID,#subject,#content').val('');
        }
    }

    // This method is used to validate the email pop up fields
    function validateEmailFields(flg, emailID, mailSubject, ccID, bccID, mailContent) {
        var messageField = '',
            emailIdArry, i;
        if (nsCargo.checkEmptyString(emailID) || nsCargo.checkEmptyString(emailID.trim())) {
            messageField = 'To e-mail ID should not be empty';
        } else if (emailID.indexOf(';') !== -1) {
            emailIdArry = emailID.split(';');
            for (i = 0; i < emailIdArry.length; i++) {
                if (!nsCargo.regEx.email.test(emailIdArry[i])) {
                    flg = 1;
                    break;
                }
            }
        } else {
            if (!nsCargo.regEx.email.test(emailID)) {
                flg = 1;
            }
        }
        if (!nsCargo.regEx.email.test(ccID) || !nsCargo.regEx.email.test(bccID)) {
            flg = 1;
        }

        if (flg === 1) {
            messageField = messageField + '\n Enter valid email id(s)!';
        }
        messageField = validateSubjectBodyFields(mailSubject, mailContent, messageField);
        return messageField;
    }

    // This method is used to validate and construct the error messages
    function validateSubjectBodyFields(mailSubject, mailContent, messageEmail) {
        if ((nsCargo.checkEmptyString(mailSubject) || nsCargo.checkEmptyString(mailSubject.trim()))) {
            if (nsCargo.checkEmptyString(messageEmail)) {
                messageEmail = 'Subject should not be empty';
            } else {
                messageEmail = messageEmail + '\n Subject should not be empty';
            }
        }
        return messageEmail;
    }

    // This method is used to set the default value for the dimension unit
    function setDefaultUnits() {
    	$('#actionlistDimensions').attr('data-default')
    	$('#actionlistDimensions').val(localStorage.getItem('measurementType'));
    }

    // This method is used to check the minimum condition
    function calculateMinCondition(currEle, minCount, isJoint, isMinCond) {
        if (minCount > 1) {
            return true;
        } else if (minCount === 1 && isMinCond) {
            return false;
        } else if (minCount === 1 && !isMinCond && !isJoint) {
            return true;
        } else if (minCount === 1 && !isMinCond && isJoint) {
            return false;
        } else {
            return true;
        }
    }

    // This method is used for removing duplicates in error message
    function removeDuplicates(err) {
        var seen = {},
            out = [],
            len = err.length,
            j = 0,
            item, i;
        for (i = 0; i < len; i++) {
            item = err[i];
            if (seen[item] !== 1) {
                seen[item] = 1;  
                j++;
                out[j] = item;
            }
        }
        return out;
    }

      

    // This method is used to clear the elements
    function clearElements() {
        $('#searchResult,#searchedFor,#actionLst,div.dataExceeds').hide();
        $('.searchedForWrap .searchedItem').remove();
        $('div.msg').text('');
    }

    // This method is used to resize the buttons in screen
    function showBtnsAndResize() {
        $('.statusMessageText').css('display', 'none');
        $('.cargoMgmtRightData .buttonsList').show();
    }
    
    $(document).ready(function() {
        // on load dropdown - populating the cargo status drop down in update pop up window
        buildCargoStatusDropdown();
        if (nsCargo.checkEmptyString($('#newCargoOdo').val())) {
            $('#newCargoOdo').val(0);
        }
        validateVinNo();
        updateEquipmentType();
        updateDimensions();
        
        $('#newCargoDetailsPopup .formSubmitButtons').on('click', '.saveButton',function(){
        	var ind = $(this).parent().parent().attr('class');
        	if(ind.indexOf('emailPopupFormData') === -1){
        		calcAreaAndVolumeUpdate();
        	}
        });
    });
    $.extend(true, nsCargo, cargoMaintObj);
})(this.cargoObj, this.jQuery, this.vmsService, this.core);