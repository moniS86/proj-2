/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
this.cargoObj = {};
(function(nsCargo, $, vmsService, nsCore) {
    var cargoObj = {
        'areaVolume': '/Vms/modeltype/AreaVolume',
        'areaVolumeUpdate': '/Vms/cargo/updateAction',
        'loadCustomerCode': '/Vms/autoComplete/customerlist',
        'loadVoyagelist': '/Vms/autoComplete/voyageList',
        'cargoStatus': '/Vms/masterdata/cargoStatuses',
        'cargoState': '/Vms/masterdata/cargoStates?module=cargo&cargoTypeId=0',
        'cargoTypes': '/Vms/masterdata/cargoTypes',
        'cargoMeasurement': '/Vms/masterdata/measurementSystems',
        'cargoListData': '/Vms/masterdata/actionlistData',
        'cargoSearchDetails': '/Vms/cargo/searchCargoDetails',
        'cargoEquipments': '/Vms/masterdata/equipments',
        'cargoLoadTerminal': '/Vms/booking/getAllTerminals?portCode=',
        'cargoEmailDetails': '/Vms/cargo/emailCargoDetails',
        'dbPath': '../resources/app/swf/copy_csv_xls_pdf.swf',
        'error': 'Something went wrong. Please contact your admin.',
        'chkAllFlg' : false,
        'dataList' : [],
        'checkAreaVol': checkAreaVol,
        'dataObjConstructor': dataObjConstructor,
        'defineData': defineData,
        'fromDateBeforeToDateValidator': fromDateBeforeToDateValidator,
        'validateDate': validateDate,
        'validateCargoMgmtRow': validateCargoMgmtRow,
        'alertVinMessage': alertVinMessage,
        'dimCheck': dimCheck,
        'fetchDataForUpdate': fetchDataForUpdate,
        'cargoUpdateAction': cargoUpdateAction,
        'areaVolumeAjax': areaVolumeAjax,
        'calcAreaAndVolume': calcAreaAndVolume,
        'checkParseFloat': checkParseFloat,
        'checkNum': checkNum,
        'loadAutoComplete': loadAutoComplete,
        'dimensionMessage': dimensionMessage,
        'dimensionsLWHWValidation': dimensionsLWHWValidation,
        'showAlert': showAlert,
        'checkEmptyString': checkEmptyString,
        'loadVesselAutocomplete': loadVesselAutocomplete,
        'checkPrecision': checkPrecision,
        'largeOrInvalidPart': largeOrInvalidPart,
        'isNewCargo': isNewCargo,
        'navigateToClickedPath': navigateToClickedPath,
        'showDirtyFlagMessage': showDirtyFlagMessage,
        'adjustActionList' : adjustActionList,
        'searchCount' : 0,
        'regEx': {
            'numeric': /^[0-9]+$/,
            'decimal': /^[-+]?[0-9]+\.[0-9]+$/,
            'email': /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
        }
    },
    message = '',
    values = '',
    allTcn = [],
    slVin = [],
    cargoStatusReceived = 'Received',
    cargoStatusDischarged = 'Discharged',
    dateFormat = localStorage.getItem('dateFormat'),
    userDateFormat = nsCore.returnDate(dateFormat),
    cargoStatusLoad = 'Loaded';
    nsCargo.customerCodeAutoArr = [];
    nsCargo.customerNameAutoArr = [];

    function showAlert(alertMsg) {
        nsCore.showAlert(alertMsg);
    }

    // Function to display the Dirty flag message
    function showDirtyFlagMessage(newFlag, dirtyFlag) {
        var navCheck = 0;
        if (dirtyFlag === 1) {
            if (newFlag) {
                navCheck = 1;
            }
            $('#dialog-confirm').dialog('open');
        } else {
            dirtyFlag = 0;
        }
        return navCheck;
    }

    function navigateToClickedPath(clickedLinkPath) {
        window.location.href = clickedLinkPath;
    }

    // This method is used to check the non decimal number
    function nonDecCheck(ele, field, intPart, fieldName) {
        var numMsg = '';
        if (field && (!cargoObj.regEx.numeric.test(field) || cargoObj.regEx.decimal.test(field))) {
            numMsg = 'Enter a valid ' + fieldName;
        }
        return numMsg;
    }

    // This method is used to check the Area volume calculation
    function checkAreaVol(calculatedVal, focusedId) {
        var areaField = $('#areaValue'),
            volumeField = $('#volumeValue'),
            focusEle; 
        if(focusedId){
            focusEle =$('#' + focusedId);
        }
        else{
            focusEle =$('');
        }
        if (calculatedVal[0].length > 21) {
            $(focusEle).focus();
            $(areaField).val('');
        } else {
            $(areaField).val((calculatedVal[0] === 0) ? '' : calculatedVal[0]);
        }

        if (calculatedVal[1].length > 27) {
            $(focusEle).focus();
            $(volumeField).val('');
        } else {
            $(volumeField).val((calculatedVal[1] === 0) ? '' : calculatedVal[1]);
        }
    }

    // This method is used to construct object cargoMassActionData for update method
    function dataObjConstructor(shippingStatus, cargoHandlingStatus, reportOptions, insertCtrlNum,
        inserNumVal, cargoCondition, dateOptions, dateOptionVal, dimensionUnit, lengthparam,
        widthparam, heightparam, weight, actionItem, areaValue, volumeValue) {
        var equip, cargoTcn, consLegTcn,consTcn, cargoConsTcn, loadTerminal, discTerminal, cargoMassActionData, dimension;
        equip = {
            equipmentNo: '0',
            equipmentType: '0'
        };
        loadTerminal = {
            terminalCode: '0'
        };
        discTerminal = {
            terminalCode: '0'
        };
        dimension = {
            length: lengthparam,
            width: widthparam,
            height: heightparam,
            weight: weight,
            dimensionUnit: dimensionUnit,
            area: areaValue,
            volume: volumeValue            
        };

        var arr = values.split(','), aray=allTcn.split(','), len = arr.length , index = 0, massActionReqData = [], brr = slVin.split(','), tcnArr=[];
        for(index = 0; index < len; index++){
            tcnArr = aray[index].split('|');
            cargoTcn=tcnArr[1];
            cargoConsTcn=tcnArr[0];
            consLegTcn=tcnArr[2];
            consTcn=tcnArr[3];
              massActionReqData.push({
                    cargoConsId: arr[index],
                    shippingStatus: shippingStatus,
                    cargoHandlingStatus: cargoHandlingStatus,
                    reportOption: reportOptions,
                    insertCtrlNum: insertCtrlNum,
                    docReciptNum: inserNumVal,
                    cargoCondition: cargoCondition,
                    cargoDateOption: dateOptions,
                    cargoDateValue: dateOptionVal,
                    dimension: dimension,
                    equipment: equip,
                    loadTerminal: loadTerminal,
                    discTerminal: discTerminal,
                    newCargo: '',
                    updateType: 'A',
                    actionItem: actionItem,
                    vinNo : brr[index],
                    dateFormat: dateFormat,
                    cargoTcn: cargoTcn,
                    cargoConsTcn: cargoConsTcn,
                    consLegTcn: consLegTcn,
                    consTcn: consTcn

              });
              if(!brr[index] || brr[index] === 'New Cargo' ){
                  massActionReqData[index].newCargo = 'Y';
              }
              else {
                  massActionReqData[index].newCargo = 'N';
              }
        }
        cargoMassActionData = {
            cargoMassAction: massActionReqData
        };
        return cargoMassActionData;
    }

    //This method is used to define the data from the mass action panel
    function defineData() {
        var cargoUpdateData = {},
            keyVal, value;
        $('#actionListAccordion').find('.blueAccElement').not('.notExpandable').each(function(j, obj) {
            keyVal = $(obj).find('div.normalAccContentWrap').attr('id');
            value = $(obj).find('.normalAccContentWrap .optionItem .optionVal.clickedOption').html();
            cargoUpdateData[keyVal] = value;
        });
        $('.dimensionWrap').find('input,select').each(function(j, obj) {
            keyVal = $(obj).attr('name');
            value = $(obj).val();
            cargoUpdateData[keyVal] = value;
        });
        if ($('.insertControlNumVal').val()) {
            cargoUpdateData.insertControlNumVal = $('.insertControlNumVal').val();
        }
        if ($('#cargoCondition').val()) {
            cargoUpdateData.cargoCondition = $('#cargoCondition').val();
        }
        if ($('.dateOptionsVal').val()) {
            cargoUpdateData.dateOptionsVal = $('.dateOptionsVal').val();
        }
        return cargoUpdateData;
    }

    // This method is used to do date validation
    function fromDateBeforeToDateValidator(fromDate, toDate, msg) {
        if (nsCore.builDateObj(userDateFormat, fromDate) > nsCore.builDateObj(userDateFormat, toDate)) {
            return msg;
        }
        return '';
    }

    // This method is used to validate the date for the shipping status
    function validateDate(cargoID, discDate, receivedDate, loadDate, selectedDate, dateOption, rowData,a) {
        var validationMessage = '';
        // Validation for Cargo Discharged and cargo loaded dates
      
        if(rowData){
        	validationMessage = dataLevelValidation (rowData, dateOption, validationMessage);  	
        }
       
           // Validation for Cargo loaded and cargo Received dates
             if (dateOption === cargoStatusReceived) {
                validationMessage += fromDateBeforeToDateValidator(selectedDate, loadDate,
                    'Received date can not be after loaded date \n');
                if (loadDate && $.trim(selectedDate).length === 0) {
                    validationMessage += 'Received date cannot be blank since there exists cargo with Loaded date \n';
                }
            }
            if (dateOption === cargoStatusDischarged && $.trim(selectedDate).length > 0 && checkEmptyString(loadDate)) {
                validationMessage += 'Can not be updated. Please update the loaded status first! \n';
                    } else {
                        if (dateOption === cargoStatusDischarged && loadDate) {
                            validationMessage += fromDateBeforeToDateValidator(loadDate, selectedDate,
                                'Discharged date can not be before loaded date \n');
                        }
                    }
        // Validation for Cargo loaded and cargo Received dates
        if (dateOption === cargoStatusLoad) {
            if (discDate && $.trim(selectedDate).length > 0) {
                validationMessage += fromDateBeforeToDateValidator(selectedDate, discDate,
                    'Loaded date can not be after discharged date\n');
            } else {
                if (discDate && $.trim(selectedDate).length === 0) {
                    validationMessage += 'Can not be blank as there is already discharged date available for this selection \n';
                }
            }
            if (receivedDate && $.trim(selectedDate).length > 0) {
                validationMessage += fromDateBeforeToDateValidator(receivedDate, selectedDate,
                    'Loaded date can not be before received date \n');
            }
        }
       
        return validationMessage;
    }

    function dataLevelValidation (rowData, dateOption, validationMessage){
        if(rowData.cargoConsignment.isManifested=== "Y" && !(dateOption === cargoStatusDischarged)){
	             validationMessage += 'You are not allowed to update the Manifested data! \n';
	    }
   	   	else if(rowData.cargoConsignment.isIssued=== "Y" && (dateOption === '')){
	             validationMessage += 'You are not allowed to update the Issued data! \n';
	        }
   	   	else if((rowData.isLpOutbound==="Y") && (rowData.isDpInbound==="N" && dateOption === cargoStatusDischarged)){
   	   		validationMessage += 'Your office is not authorised to update the discharge date since it is not inbound responsible for the discharge port of this leg. \n';
   	   	}	
   	   	else if((rowData.isLpOutbound==="N") && (rowData.isDpInbound==="Y" && !(dateOption === cargoStatusDischarged))){ // while updating fields other than discharge date as DP inbound
   	   		validationMessage += 'Your office is only authorised to update the discharge date since it is inbound responsible for the discharge port of this leg. \n';
   	   	}	
   	   	else if(rowData.isLpOutbound==="N" && rowData.isDpInbound==="N"){
   	   		validationMessage += 'Your office is not authorised to update the data. \n';
   	   	}
        return validationMessage;
    }
    // This method is used to validate the shipping status for each cargo on mass  action
    function validateCargoMgmtRow(dateOptionVal, shippingStatus, cargoStatusLoaded, singleRow, count,validateCargoMgmtRow1) {
        var rowData = singleRow,
            selectedCargoID = rowData.id,
            selectedVinNo = rowData.vinNo,
            selDiscDate = ((rowData.cargoConsignment.dischargeDate) ? rowData.cargoConsignment.dischargeDate : ''),
            selRecDate = ((rowData.cargoConsignment.receivedDate) ? rowData.cargoConsignment.receivedDate : ''),
            selLoadDate = ((rowData.cargoConsignment.loadedDate) ? rowData.cargoConsignment.loadedDate : ''),
            a = validateCargoMgmtRow1,
            firmCargo = rowData.firmCargo;
        
        
        
        if (selectedCargoID) {
            if (!values) {
                values = selectedCargoID;
                slVin = selectedVinNo;
                allTcn = rowData.cargoConsTcn + '|' + rowData.cargoTcn + '|' + rowData.consLegTcn + '|' + rowData.consTcn;
            } else {
                values = values + ',' + selectedCargoID;
                slVin = slVin + ',' + selectedVinNo;
                allTcn = allTcn + ',' + rowData.cargoConsTcn + '|' + rowData.cargoTcn + '|' + rowData.consLegTcn + '|' + rowData.consTcn;
            }
        } else {
            values = '';
            allTcn = '';
        }
        if (selectedCargoID) {
            message += validateDate(selectedCargoID, selDiscDate, selRecDate, selLoadDate, dateOptionVal, shippingStatus,rowData,a);
        }
        message += ((shippingStatus === cargoStatusLoaded && firmCargo !== 'Firm') ?
            'Can not be updated as some/all cargo are in Reserve allocation status!\n' : '');
        message += ((shippingStatus === cargoStatusLoaded && rowData.cargoHold === 'Y') ?
                'Can not be updated as some/all cargo are in set On Hold!\n' : '');
        if(!singleRow.vinNo){
            count++;
        }
        return count;
    }

    // This method is used to construct error message if a vin is empty or not selected
    function alertVinMessage(selectionError, updateError) {
        if (selectionError) {
            nsCore.showAlert('Please make a selection of cargo/Vin before apply \n');
        }
        if (updateError) {
            nsCore.showAlert('Please insert Vin number first for selected records');
        }
    }

    // This method is used to check if length, width & height are empty and construct error message
    function dimCheck(lengthParam, widthParam, heightParam, weightParam) {
        var cargoMessageCheck = '',
            before = false;

        if (!(lengthParam && widthParam &&
                heightParam && weightParam)) {

            cargoMessageCheck = 'Please enter value for ';

            if (checkEmptyString(lengthParam)) {
                cargoMessageCheck += 'Length';
                before = true;
            }

            if (checkEmptyString(widthParam)) {
                cargoMessageCheck += before ? ', Width' : 'Width';
                before = true;
            }

            if (checkEmptyString(heightParam)) {
                cargoMessageCheck += before ? ', Height' : 'Height';
                before = true;
            }

            if (checkEmptyString(weightParam)) {
                cargoMessageCheck += before ? ', Weight' : 'Weight';                
            }
        }
        return cargoMessageCheck;
    }

    // This method is used to construct the data for update operation
    function fetchDataForUpdate() {
        var cargoUpdateData = defineData(),
            errMsgs, errMsgArr = [],
            shippingStatusDtVal = $('#shippingStatusDt').val(),
            shippingStatus = cargoUpdateData.shippingStatus,
            cargoHandlingStatus = cargoUpdateData.cargoHandlingStatus,
            reportOptions = cargoUpdateData.reportOptions,
            insertCtrlNum = cargoUpdateData.insertControl,
            cargoCondition = cargoUpdateData.cargoCondition,
            inserNumVal = cargoUpdateData.insertControlNumVal,
            dateOptions = cargoUpdateData.dateOptions,
            dateOptionVal = cargoUpdateData.dateOptionsVal,
            dimensionUnit = cargoUpdateData.actionlistDimensions,
            lengthparam = cargoUpdateData.length,
            heightparam = cargoUpdateData.height,
            widthparam = cargoUpdateData.width,
            weight = cargoUpdateData.weight,
            selectedRows = $('#cargoMgmtGrid').dataTable().api().rows('.selected').data(),
            rowWithNewCargoChecked = 0,
            firstActionClickedOpt = $('#actionListAccordion .blueAccElement:eq(0)').find('.clickedOption'),
            flgdDimension;
        message = '';

        dateOptionVal = !dateOptionVal ? '' : dateOptionVal;
        insertCtrlNum = !insertCtrlNum ? '' : insertCtrlNum;
        shippingStatus = !shippingStatus ? '' : shippingStatus;
        
        values = "";
        slVin = "";
        allTcn = "";

        // fetching the cargoID of the selected Vin Numbers
        if (selectedRows.length > 0) {
            $.each(selectedRows, function(j, singleRow) {
                rowWithNewCargoChecked = validateCargoMgmtRow(dateOptionVal, shippingStatus, cargoStatusLoad, singleRow, rowWithNewCargoChecked,inserNumVal);
            });
        }
        else{
        	if(nsCargo.searchCount === 0){
        		$('#cargoMgmtGrid_wrapper').hide();
        	}
        }

        message += (moment(shippingStatusDtVal, userDateFormat).isValid() || checkEmptyString(shippingStatusDtVal))
        ? '' : 'Enter a valid Date';

        alertVinMessage((!(values) || values.length <= 0),rowWithNewCargoChecked > 0 && $(firstActionClickedOpt).length > 0);

        if ((!values || values.length <= 0) || ((rowWithNewCargoChecked > 0)
        && $(firstActionClickedOpt).length > 0)) {
            return 'error';
        }

        // Validation before Action list
        flgdDimension = (checkEmptyString(lengthparam) && checkEmptyString(widthparam)
        && checkEmptyString(heightparam) && checkEmptyString(weight));
        
        message = (nsCargo.actionItem === '4' && insertCtrlNum === 'Dock receipt' && (checkEmptyString(inserNumVal) || !(inserNumVal)))
        ? 'Dock Receipt Number should not be empty' : message;
        

        if (lengthparam || widthparam || heightparam || weight) {
            message += dimCheck(lengthparam, widthparam, heightparam, weight);
        }

        if(!shippingStatus && !dateOptionVal && !insertCtrlNum && !inserNumVal && !cargoCondition && flgdDimension){
        message +='All fields should not be empty. Please provide value for one combination from below \n'
            + '1. Shipping status with a date \n' + '2. Insert control number with a value \n'
            + '3. Cargo condition \n' + '4. Dimensions change\n';
        }
        else {
               message +='';
            }

        errMsgArr = (message) ? message.split('\n') : '';
        errMsgs = nsCargo.removeDuplicates(errMsgArr).join('\n');
        if (errMsgs) {
            nsCore.showAlert(errMsgs);
            return 'error';
        }
        return dataObjConstructor(shippingStatus, cargoHandlingStatus, reportOptions, insertCtrlNum,
            inserNumVal, cargoCondition, dateOptions, dateOptionVal, dimensionUnit, lengthparam,
            widthparam, heightparam, weight, nsCargo.actionItem, $('#areaValue').val(), $('#volumeValue').val());
    }

    // This method is used to perform the update action
    function cargoUpdateAction() {
        var ssArr = $('#shippingStatus .optionItem');
        $(this).find('.icons_sprite').toggleClass('actionCloseIcon actionOpenIcon');
        $('.rightActionListWrapper').toggleClass('actionListWrapStyles');
        $.each(ssArr, function(i,v){
            $(v).find('.smallRemoveIcon').trigger('click')
        })
        $('.actionListContent').toggle('slide', {
            direction: 'right'
        });
        adjustActionList();
        nsCargo.cargoSearchCall(nsCargo.prevCargoSearchCriteriaData)
        $('div.statusMessageText').text('Update saved successfully!').css('display', 'block');
        $('#actionListAccordion').find('input, select, textarea').val('');
        $('.blueAccElement').find('.normalAccContentWrap').css('display', 'none');
        $('.insertControlNumVal,.actionListInput,#emailLink').css('display', 'none');
        $('#checkAllRows').prop('checked', false);
        values = '';
        allTcn = '';
    }

    //This method is used to adjust the position of action list panel
    function adjustActionList() {
        $('.actionListLnk').position({
            my: 'right top',
            at: 'left+9',
            of: '.rightActionListWrapper'
        });
    }

    // This method is used to calculate the area volume and trigger update action
    function areaVolumeAjax(measurementType, calculatedVal, focusedId, cargoUpdateActionData) {
        $('.preloaderWrapper').show(); 
            vmsService.vmsApiServiceLoad(function(cargoUpdateActionResponseData) {
                $('.preloaderWrapper').hide(); 
                if(cargoUpdateActionResponseData.responseCode === '45000' || cargoUpdateActionResponseData.responseCode === '47000' || cargoUpdateActionResponseData.responseCode === '48000'){
                    nsCore.showAlert(cargoUpdateActionResponseData.responseDescription);
                }else if(cargoUpdateActionResponseData.responseDescription === 'Success'){
                    cargoUpdateAction();
                } else {
                    nsCore.showAlert(cargoObj.error);
                }
            }, cargoObj.areaVolumeUpdate, 'POST', JSON.stringify(cargoUpdateActionData));
    }

    //This method is used to validate the dimensions
    function largeOrInvalidPart(numMsg, field, intPart, fieldName, decPart) {
        var length = 0,
            params = '',
            lengthInt = 0,
            lengthDec = 0;
        if (field.match(cargoObj.regEx.numeric)) {
            length = field.length;
            if (length > intPart) {
                numMsg = fieldName + ' value is too large (Maximum allowed digits before decimal is ' + intPart + ' )';
            }
        } else if (field.match(cargoObj.regEx.decimal)) {
            params = field.toString().split('.');
            lengthInt = params[0].length;
            lengthDec = params[1].length;
            if (lengthInt > intPart && lengthDec > decPart) {
                numMsg = fieldName + ' value is too large (Maximum allowed digits before decimal is ' + intPart
                + ' and after decimal is ' + decPart + ' )';

            } else if (lengthInt > intPart) {
                numMsg = fieldName + ' value is too large (Maximum allowed digits before decimal is ' + intPart + ')';

            } else {
                if (lengthDec > decPart) {
                    numMsg = fieldName + ' value is too large (Maximum allowed digits after decimal is ' + decPart + ')';
                }
            }
        } else {
            numMsg = 'Enter a valid ' + fieldName;
        }
        return numMsg;
    }

    // This method is used to check the field precision
    function checkPrecision(ele, field, intPart, decPart, fieldName) {
        var numMsg = '';
        field = (field.length > 1 && field.charAt(0) === '.') ? '0' + field : field;
        field = (field.length > 1 && field.charAt(field.length) === '.') ? field + '0' : field;

        if (field) {
            if (!cargoObj.regEx.numeric.test(field) && !cargoObj.regEx.decimal.test(field)) {
                numMsg = 'Enter a valid ' + fieldName;
            } else {
                numMsg = largeOrInvalidPart(numMsg, field, intPart, fieldName, decPart);
            }
        }
        return numMsg;
    }

    //This method is used to validate the dimensions
    function dimensionMessage(msg, value, element, upperBound, lowerBound, dimensionType) {
        var dimensionMsg = '';
        if (value) {
            dimensionMsg = checkPrecision(element, value, upperBound, lowerBound, dimensionType);
            msg = (msg && dimensionMsg) ? (msg + '\n' + dimensionMsg) :
            ((dimensionMsg) ? dimensionMsg : msg);
        }
        return msg;
    }

    //function to check whether it is new cargo
    function isNewCargo(vinNo) {
        return (checkEmptyString(vinNo) || !vinNo);
    }

    //This method is used to validate the length/width/height/weight
    function dimensionsLWHWValidation(msg, valueLen, valueWidth, valueHeight, valueWeight, elementLen, elementWidth,
        elementHeight, elementWeight) {
        var weightMsg = '';
        msg = dimensionMessage(msg, valueLen, elementLen, 6, 3, 'Length');
        msg = dimensionMessage(msg, valueWidth, elementWidth, 6, 3, 'Width');
        msg = dimensionMessage(msg, valueHeight, elementHeight, 6, 3, 'Height');
        if (valueWeight && valueWeight === 'NaN') {
            weightMsg = nonDecCheck(elementWeight, valueWeight, 14, 'Weight');
            msg = (msg && weightMsg) ? (msg + '\n' + weightMsg) :
            ((weightMsg) ? weightMsg + '\n' : msg);
        }
        return msg;
    }

    //function to check empty string
    function checkEmptyString(string) {
        return (!string);
    }

    // This method is used to construct the data area volume calculation and validate the data
    function calcAreaAndVolume(length, width, height, focusedId) {
        $('.preloaderWrapper').show(); 
        var elementLength = 0,
            valueLength = 0,
            elementWidth = 0,
            valueWidth = 0,
            elementHeight = 0,
            valueHeight = 0,
            elementWeight = 0,
            valueWeight = 0,
            elementArea = 0,
            valueArea = 0,
            elementVolume = 0,
            valueVolume = 0,
            calculatedVal = [],
            measurementType = {},
            cargoUpdateActionData;
            message = '';

        length = checkEmptyString(length) ? 0 : length;
        width = checkEmptyString(width) ? 0 : width;
        height = checkEmptyString(height) ? 0 : height;
        elementLength = $('#lengthCalc');
        valueLength = elementLength.val();
        elementWidth = $('#widthCalc');
        valueWidth = elementWidth.val();
        elementHeight = $('#heightCalc');
        valueHeight = elementHeight.val();
        elementWeight = $('#weight');
        valueWeight = elementWeight.val();
        elementArea = $('#areaValue');
        valueArea = elementArea.val();
        elementVolume = $('#volumeValue');
        valueVolume = elementVolume.val();
        message = dimensionsLWHWValidation(message, valueLength, valueWidth, valueHeight, valueWeight,
            elementLength, elementWidth, elementHeight, elementWeight);
        message = dimensionMessage(message, valueArea, elementArea, 12, 8, 'Area');
        message = dimensionMessage(message, valueVolume, elementVolume, 18, 8, 'Volume');
        if (message) {
            $('.preloaderWrapper').hide(); 
            nsCore.showAlert(message);
            return false;
        }
        measurementType = {
            calculatedLength: length,
            calculatedWidth: width,
            calculatedHeight: height,
            measurementType: $('#actionlistDimensions').val()
        };
        vmsService.vmsApiService(function(response) {
            message = '';
            $('.preloaderWrapper').hide(); 
            if (response && response.responseData.length !== 0) {
                calculatedVal[0] = response.responseData[0].calculatedArea;
                calculatedVal[1] = response.responseData[0].calculatedVolume;
                checkAreaVol(calculatedVal, focusedId);
                message = (calculatedVal[0].length > 21)
                ? 'Area value is too large (Maximum allowed digits' + ' before decimal is 18 and after decimal is 8\n'
                : message;

                message += (calculatedVal[1].length > 27)
                ? 'Volume value is too large (Maximum allowed digits' + ' before decimal is 18 and after decimal is 8\n'
                : '';
                checkAreaVol(calculatedVal, focusedId);
                cargoUpdateActionData = fetchDataForUpdate();
                if (cargoUpdateActionData === 'error') {
                    return;
                }
                areaVolumeAjax(measurementType, calculatedVal, focusedId, cargoUpdateActionData);
            } else {
                nsCore.showAlert(cargoObj.error);
            }
        }, cargoObj.areaVolume, 'POST', JSON.stringify(measurementType));
    }

    // This method is used to check NAN for decimal value
    function checkParseFloat(num) {
        return (/^[\d.]+$/.test(num)) ? parseFloat(num) : NaN;
    }

    // This method is used to check NAN for whole number
    function checkNum(num) {
        return (/^[\d]+$/.test(num)) ? num : NaN;
    }

    // This method is used to perform smart search for customer code/name based on code
    function loadCusCodeAutoComplete() {
        $('#cusCode').autocomplete({
            search: function() {
                $('#cusCode').attr('data-form', '0');
            },
            open: function() {
                $('.ui-menu').css('width', 'auto !important');
            },
            minLength: 0,
            source: function(request, response) {
                vmsService.vmsApiService(function(customerListData) {
                    var cusCodeResponseDataLength,
                    flagCodes = [],
                    incOp;
                    if (customerListData) {
                        cusCodeResponseDataLength = customerListData.responseData.length;

                        for (incOp = 0; incOp < cusCodeResponseDataLength; incOp++) {
                            flagCodes.push({
                                companyId: '' + customerListData.responseData[incOp].companyId + '',
                                label: customerListData.responseData[incOp].customerCode,
                                name: customerListData.responseData[incOp].name
                            });
                            nsCargo.customerCodeAutoArr.push(customerListData.responseData[incOp].customerCode);
                            nsCargo.customerNameAutoArr.push(customerListData.responseData[incOp].name);
                        }
                        flagCodes.sort(function(a, b) {
                            return a.label.localeCompare(b.label);
                        });
                        response(flagCodes);
                    } 
                }, cargoObj.loadCustomerCode, 'POST', JSON.stringify({
                    customerCode: request.term
                }));
            },
            autoFocus: true,
            focus: function(event) {
                event.preventDefault();
            },
            select: function(event, ui) {
                $('#cusCode').val(ui.item.label).attr('data-form', ui.item.companyId);
                $('#cusName').val(ui.item.name);
            }
        });
    }

    // This method is used to perform smart search for customer code/name based on name
    function loadCusNameAutocomplete() {
        $('#cusName').autocomplete({
            search: function() {
                $('#cusCode').attr('data-form', '0');
            },
            minLength: 0,
            source: function(request, response) {
                vmsService.vmsApiService(function(customerListData) {
                    var responseDataLength = 0, i=0, flagCodes = [];
                    if (customerListData) {
                        customerListData.responseData.sort(function(a,b){
                            var val1 = a.name || '',
                                val2 = b.name || '';
                            val1 = val1.toLowerCase();
                            val2 = val2.toLowerCase();
                            return (val1 < val2) ? -1 : (val1 > val2) ? 1 : 0;
                        });
                        responseDataLength = customerListData.responseData.length;
                        for (i = 0; i < responseDataLength; i++) {
                            flagCodes.push({
                                companyId: '' + customerListData.responseData[i].companyId + '',
                                label: customerListData.responseData[i].name,
                                name: customerListData.responseData[i].customerCode
                            });
                            nsCargo.customerCodeAutoArr.push(customerListData.responseData[i].customerCode);
                            nsCargo.customerNameAutoArr.push(customerListData.responseData[i].name);
                        }
                        flagCodes.sort(function(a, b) {
                            return a.label.localeCompare(b.label);
                        });
                       
                        response(flagCodes);
                    } 
                }, cargoObj.loadCustomerCode, 'POST', JSON.stringify({
                    name: request.term
                }));
            },
            autoFocus: true,
            focus: function(event) {
                event.preventDefault();
            },
            select: function(event, ui) {
                $('#cusCode').val(ui.item.name).attr('data-form', ui.item.companyId);
                $('#cusName').val(ui.item.label);
            }
        });
     
    }
    
    $(document).on('blur','#cusName',function(e) {   	 
   	 nsCore.delInvalidAutoFeilds('#cusName','#cusCode', $(this).val(), nsCargo.customerNameAutoArr, e);
    });
    $(document).on('blur','#cusCode',function(e) {   	 
      	 nsCore.delInvalidAutoFeilds('#cusName','#cusCode', $(this).val(), nsCargo.customerCodeAutoArr, e);
     });

    // This method is used to perform smart search for vessel code
    function loadVesselAutocomplete() { 
        nsCore.vesselAutoComplete('#vessel','','data-form','#voyage');        
    }
    
    // This method is used to perform smart search for voyage no
    function loadVoyageAutocomplete() {
        var loadVoyResponseDataLength,
            flagCodes = [],
            i;
        $('#voyage').autocomplete({
            search: function() {
                $('#voyage').attr('data-form', '0');
            },
            minLength: 0,
            source: function(request, response) {
                vmsService.vmsApiService(function(voyageListData) {
                    if (voyageListData) {
                        loadVoyResponseDataLength = voyageListData.responseData.length;
                        flagCodes = [];
                        for (i = 0; i < loadVoyResponseDataLength; i++) {
                            flagCodes.push({
                                value: '' + voyageListData.responseData[i].voyageNo + '',
                                label: voyageListData.responseData[i].voyageNo
                            });
                        }
                        response(flagCodes);
                    } else {
                        nsCore.showAlert(cargoObj.error);
                    }
                }, cargoObj.loadVoyagelist, 'POST', JSON.stringify({
                    vesselCode: $('#vessel').val(),
                    voyageNo: request.term
                }));
            },
            autoFocus: true,
            select: function(event, ui) {
                $('#voyage').val(ui.item.label).attr('data-form', ui.item.value);
            }
        });
    }

    
    // This method is used to perform smart search for load port code
    function loadPortAutocomplete() {
        nsCore.portAutoComplete('#portCode','#portName','data-form');
        
        nsCore.portAutoComplete('#dischargeCode','#dischargeName','data-form');
        nsCore.portAutoComplete('#destinationCode','#destinationName','data-form');

        $('.code,.portName').on( "autocompletechange", function( event, ui ) {   
            var currentObjId = $(this).attr('id');
                if( currentObjId === 'portCode' || currentObjId === 'portName' ){
                    $('#cargoStatus option[value="5"]').prop('selected', true);
                }else{
                    $('#cargoStatus option[value=""]').prop('selected', true);
                }
        });
    }
    
    // This method is used to initiate all the smart search function
    function loadAutoComplete() {
        loadCusCodeAutoComplete();
        loadVesselAutocomplete();
        loadCusNameAutocomplete();
        loadVoyageAutocomplete();
        loadPortAutocomplete();        
    }
    $.extend(true, nsCargo, cargoObj);
})(this.cargoObj, this.jQuery, this.vmsService, this.core);
