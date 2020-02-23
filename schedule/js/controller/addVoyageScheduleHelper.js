/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsSchedule, $, nsCore, vmsService) {
    var scheduleObj = {},
        arrivalDateArr = [];
    
    function alertMsgHelper(tCode, tradeCode, tradeDesc, tDesc, erMsg){
    	var msg = ((tCode === '0' && tradeCode && tradeDesc) ||(tCode === '0' && tradeCode)||
				(tDesc === '0' && tradeDesc)|| (tDesc === '0' && tradeCode && tradeDesc) ? erMsg : '');
    	return msg;
    }
    

	function saveScheduleData() {
        var vesselInputList = [],
            intDistribution = '',
            pubDistribution = '',
            i, tErr = 'Start date overlaps with previous voyage. Please select a valid date',
            tradeCode = $('#tCode').val(),
            tradeDesc = $('#tDesc').val(),
            vesselCodeParam = $('#vCode').val(),
            vesselDesc = $('#vesselDesc').val(),
            voyageNo = $('#voyageNo').val(),
            operatedBy = $('#opBy').val(),
            tradeId = $('.tId').val(),
            master = $('#Master').val(),
            pVoyageSpeed = $('#pVoyageSpeed').val(),
            operator = $('#GVoperator').val(),
            spaceCharterWith = $('#spaceCharWith').val(),
            startDate = (nsSchedule.importExcel===1) ? $('#addNewVesselGrid').find('.departureDateTime:nth-child(1)').val() : $('#sDate').val(),
            voyageComments = $('#voyComments').val(),
            ltCharterFrom = $('#ltCharFrom').val(),
            newVoPortNameVal = $('#newVPortName').val(),
            alertMsg = '',
            date = localStorage.getItem('dateFormat'),
            vCode = $('#vCode').attr('data-form3'),
            vDesc = $('#vesselDesc').attr('data-form4'),
            tCode = $('#tCode').attr('data-form1'),
            tDesc = $('#tDesc').attr('data-form2'),
            newVoPortName = $('#newVPortName').attr('data-form5'),
            schedule, voyageData;
			alertMsg = ((!tradeCode || !tradeDesc) ? '\n Trade  should not be empty' : '');
            alertMsg += ((!vesselCodeParam || !vesselDesc)? '\n Vessel should not be empty' : '');
            alertMsg += (!startDate ? '\n Start date should not be empty' : '');
            alertMsg += (!operatedBy ? '\n Operated by should not be empty' : '');
            alertMsg += (!newVoPortNameVal ? '\n Port Name should not be empty' : '');
			alertMsg += alertMsgHelper(tCode, tradeCode, tradeDesc, tDesc, '\n Enter a valid trade');
			alertMsg += alertMsgHelper(vCode, vesselCodeParam, vesselDesc, vDesc, '\n Enter a valid vessel');
			alertMsg += (newVoPortName==='0' && newVoPortNameVal!=='') ? '\n Enter a valid port name':'';
			if(startDate){
	            alertMsg += (new moment(startDate, nsSchedule.userDateFormat + " " + nsCore.timeFormat) <= new moment(nsSchedule.endDate, nsSchedule.userDateFormat
	                    + " " + nsCore.timeFormat)? '\n Start date overlaps with previous voyage. Please select a valid date': "");
				if(alertMsg.indexOf(tErr) === -1){
					alertMsg +=(((nsSchedule.arrivalDateArr.length > 0) && (new moment(nsSchedule.arrivalDateArr[0], nsSchedule.userDateFormat + " " + nsCore.timeFormat) 
					<= new moment(nsSchedule.endDate, nsSchedule.userDateFormat + " " + nsCore.timeFormat))
		        	)? "\n Arrival date should be greater than the end date of previous voyage": "");
				}
			}
			alertMsg += plannedVoyageSpeedMessage(pVoyageSpeed);
        if (alertMsg !== '') {
            nsCore.showAlert(alertMsg);
            return;
        }
        intDistribution = ($('#distInternalStatus').is(':checked') ? 'Y' : 'N');
        pubDistribution = ($('#distPublicStatus').is(':checked') ? 'Y' : 'N');
        if (nsSchedule.vesselPositionArray) {
            for (i = 0; i < nsSchedule.vesselPositionArray.length; i++) {
                vesselInputList.push(vesselInputObjectFun(nsSchedule.vesselPositionArray[i],
                    nsSchedule.arrivalDateArr[i], nsSchedule.departDateArr[i]));
            }
        }
		voyageData = {
                    vesselCode: vesselCodeParam,
                    voyageNo: voyageNo,
                    operatedBy: operatedBy,
                    tradeId: tradeId,
                    master: master,
                    operator: operator,
                    plannedVoyageSpeed: pVoyageSpeed,
                    spaceCharterWith: spaceCharterWith,
                    ltCharterFrom: ltCharterFrom,
                    voyageComments: voyageComments,
                    startDate: $('#addNewVesselGrid').find('.departureDateTime:nth-child(1)').val() || startDate,
                    endDate: nsSchedule.departDateArr[nsSchedule.vesselPositionArray.length - 1],
                    intDistribution: intDistribution,
                    pubDistribution: pubDistribution,
                    portCode: newVoPortName
                };
		schedule = {
					voyageData: voyageData,
					vesselPositionList: vesselInputList,
					dateFormat: date,
					timeFormat: nsCore.timeFormat,
					excel: nsSchedule.isExcel,
					voyageNo: voyageNo,
					tradeCode: tradeId,
					vesselCode: vesselCodeParam,
					fromDate: $('#fromDate').val(),
					loadPort: $('#lPort').val(),
					discPort: $('#dPort ').val()

				};

        vmsService.vmsApiServiceType(function(response) {
            var scheduleSearch,
                msg = 'Voyage created successfully!';
                //key = '',
                //formEle = $('#leftSearchMenu');
            if(response.responseCode === '45000'){
                nsCore.showAlert('Someone else have updated the data since you retrieved the Voyage information');
            } else if (response.responseDescription === 'Success') {
            	scheduleSearch = response.responseData;
                $('#confirmDialogPopup').dialog('close');
                $('#newVesselVoyageSchedulePopup').dialog('close');
                $('.modelPopupBground').hide();
                $('#errorMsg').html('<label>' + msg + '<label>');
                nsSchedule.selectedVoyage = voyageNo;
                nsSchedule.vesselPositionDirtyFlag = 0;
                $("#sDate").removeAttr('disabled');
                $('#leftSearchMenu').trigger('submit', [
                    'addVoyageSubmit', scheduleSearch
                ]);                
            } else {
                if(response.responseCode === '20903'){
                    $('#errorMsgs').html('<label>' + vesselCodeParam +' / '+voyageNo+ ' already exists' + '<label>');
                }else{
                    nsCore.showAlert('Error: ' + response.responseDescription);
                }
            }
            nsSchedule.arrivalDateArr = [];
            nsSchedule.departDateArr = [];
            nsSchedule.isExcel = false;
            nsSchedule.importExcel = 0;
            $('#leftSearchMenu .resetSearch').trigger('click');
        }, nsSchedule.saveData, 'POST', JSON.stringify(schedule));
    }

    function plannedVoyageSpeedMessage(plannedVoyageSpeed) {
        var numbers = /^[0-9]+$/,
            voyageSpeedLen, params, length1, length2,
            decimal = /^[-+]?[0-9]+\.[0-9]+$/,
            alertMsg = '';
        if (plannedVoyageSpeed !== '') {
            alertMsg +=
                (!plannedVoyageSpeed.match(numbers) && !plannedVoyageSpeed.match(decimal) ?
                    '\n Enter a valid Planned voyage speed' : '');
            if (plannedVoyageSpeed.length > 1 && plannedVoyageSpeed.charAt(0) === '.' ) {
                plannedVoyageSpeed = 0 + plannedVoyageSpeed;
            } else if (plannedVoyageSpeed.match(numbers)) {
                voyageSpeedLen = plannedVoyageSpeed.length;
                alertMsg += (voyageSpeedLen > 5 ?
                    '\n Planned voyage speed value is too large(Maximum digits allowed before decimal is 5)' : '');
            } else {
                if (plannedVoyageSpeed.match(decimal)) {
                    params = plannedVoyageSpeed.toString().split('.'),
                        length1 = params[0].length,
                        length2 = params[1].length;
                    alertMsg += ((length1 > 5) && (length2 > 3) ?
                        '\n Planned voyage speed value is too large ' +
                        '(Maximum allowed digits before decimal is 5 and after decimal is 3)' : '');
                    alertMsg += (length1 > 5 && (length2 < 4) ?
                        '\n Planned voyage speed value is too large(Maximum digits allowed before decimal is 5)' :
                        (length1 <= 5 && length2 > 3 ?
                        '\n Planned voyage speed value is too large (Maximum digits allowed  after decimal is 3)' : ''));
                }
            }
        }
        return alertMsg;
    }

    function vesselInputObjectFun(vesselPositionArrayType, arrivalDateArray, departDateArray) {
        var load = false,
            discharge = false,
			descName = '',
            canTransit = false,
            bunkeringCall = false,
            regCall = false,
            delivery = false,
            reDelivery = false,
            dryDock = false,
            count,
            vesselInputObj;

        if (vesselPositionArrayType.purposeDescList) {
            for (count = 0; count < vesselPositionArrayType.purposeDescList.length; count++) {
                descName = vesselPositionArrayType.purposeDescList[count];
                switch (descName) {
                case 'Load':
                    load = true;
                    break;
                case 'Discharge':
                    discharge = true;
                    break;
                case 'Canal transit':
                    canTransit = true;
                    break;
                case 'Bunkering call':
                    bunkeringCall = true;
                    break;
                case 'Registration call':
                    regCall = true;
                    break;
                case 'Delivery':
                    delivery = true;
                    break;
                case 'Redelivery':
                    reDelivery = true;
                    break;
                case 'Drydock':
                    dryDock = true;
                    break;
                default:
                    break;
            }
            }
        }
        vesselInputObj = {
                validStatus: 'V',
                vesselCode: $('.vesselCodeParam').val(),
                portCallComments: vesselPositionArrayType.comments,
                voyageNo: $('.voyageNo').val(),
                portName: vesselPositionArrayType.portName,
                load: load,
                discharge: discharge,
                canTransit: canTransit,
                bunkerCall: bunkeringCall,
                delivery: delivery,
                reDelivery: reDelivery,
                dryDock: dryDock,
                regCall: regCall,
                arrivalDate: arrivalDateArray,
                departureDate: departDateArray,
                portCode: vesselPositionArrayType.portCode
            };

        return vesselInputObj;
    }
    function formSubmit() {
        var formData = new FormData($('#upload')[0]);
            vmsService.vmsApiServiceFileUpload(function(response) {
                if (response.responseDescription === 'Success') {
                    $('#popUp').dialog('close');
                    $('.defaultSearchMsg').hide();
                    nsSchedule.isExcel = true;
                    nsSchedule.loadVoyageTable(response);
                    if(response.responseData[0].departureDate){
                        $('#sDate').val(response.responseData[0].departureDate);
                        rome($('#sDate')[0]).setValue(response.responseData[0].departureDate);
                        $("#sDate").attr('disabled', 'disabled');
                        nsSchedule.importExcel = 1;
                    }
                    // Add these line after the data table initialization
                } else if (response.responseDescription === 'error') {
                    nsCore.showAlert('Select a valid file');
                } else if (response.responseDescription === 'Imported XL has Invalid Template') {
                    nsCore.showAlert('Imported XL has Invalid Template');
                } else if (!!response.responseDescription) {
                    nsCore.showAlert(response.responseDescription);
                } else {
                    if (response.responseDescription === 'Select a valid file') {
                        nsCore.showAlert('Select a valid file');
                    }
                }
            }, (nsSchedule.uploadDate + nsSchedule.dateFormat ), 'POST', formData);

    }
    $(document).on('click', '#uploadButton', function(){
        $("#applyTemplate").val("00");
        formSubmit();
    });

    function importXL() {
        nsSchedule.isExcel = false;
        $('#popUp').dialog({
            modal: true,
            autoOpen: false,
            resizable: false,
            draggable: false,
            width: '60%',
            open: function() {
                $('#multiFile').show();
                $('#uploadButton').show();
                $('.ui-dialog-titlebar').hide();
                $('#ui-dialog-title-dialog').hide();
                $('#error').hide();
                $('#duplicate').hide();
            }
        });
        $('#upload')[0].reset();
        $('#popUp').dialog('open');
        $('#uploadButton').show();
    }
    $(document).on('click','#importXL', function(){
        importXL();
    });

    // method to load the search screen after voyage update
    function loadSearchScreenTempData(schedule) {
        var choose = schedule;
        $('.vesselContentWrapperSubDiv').hide();
        $('.defaultSearchMsg').show();
        $('#leftSearchMenu').trigger('submit', ['editVoyageSubmit', choose]);
        $('#closeSearchMenu').click();
        $('.defaultSearchMsg').hide();
        nsSchedule.loadMaintainVesselTable(schedule, false);
        $('.vesselContentWrapperSubDiv').css('display', 'block');
    }

    function loadArrivalDepartDates(startDate) {
        var departDateArr = [],
            totalRows = $('#addNewVesselGrid tbody tr').length,
            addVesselapi = $('#addNewVesselGrid').dataTable().api(),
            dateTimeFormat = nsSchedule.userDateFormat + ' ' + nsCore.timeFormat,
            currRow = '',
            voyageNum =$('#voyageNo').val(),
            firstRowData = addVesselapi.row(0).data(),prevRowData,
            currArrivalDate,rowData;
            arrivalDateArr=[];
            firstRowData.voyageNo = voyageNum;
            firstRowData.arrivalDate = startDate;
            firstRowData.departureDate =
            new moment(startDate, dateTimeFormat).add(firstRowData.daysInPort, 'days').format(dateTimeFormat);
            arrivalDateArr.push(firstRowData.arrivalDate);
            departDateArr.push(firstRowData.departureDate);
            for (currRow = 1; currRow < totalRows; currRow++) {
            rowData = addVesselapi.row(currRow).data();
            prevRowData = addVesselapi.row((currRow - 1)).data();
            currArrivalDate =
            new moment(prevRowData.departureDate, dateTimeFormat).add(prevRowData.daysToNextPort, 'days');
            rowData.arrivalDate = currArrivalDate.format(dateTimeFormat);
            rowData.departureDate = currArrivalDate.add(rowData.daysInPort, 'days').format(dateTimeFormat);
            rowData.voyageNo =voyageNum;
            arrivalDateArr.push(rowData.arrivalDate);
            departDateArr.push(rowData.departureDate);
        }
        if(nsSchedule.arrivalDateArr){
        	nsSchedule.arrivalDateArr = arrivalDateArr;
        	nsSchedule.departDateArr = departDateArr;
        } else{
        	$.extend(true, nsSchedule, {'arrivalDateArr':arrivalDateArr, 'departDateArr':departDateArr});
        }
        $('#addNewVesselGrid').dataTable().api().rows().invalidate('data').draw();
    }

    function loadVoyageNumberForExcelTemplate() {
        var totalRows = $('#addNewVesselGrid tbody tr').length,
            addVesselapi = $('#addNewVesselGrid').dataTable().api(),
            currRow = '',
            voyageNum =$('#voyageNo').val(),
            firstRowData = addVesselapi.row(0).data(),
            rowData;
        if(firstRowData){
            firstRowData.voyageNo = voyageNum;
            for (currRow = 1; currRow < totalRows; currRow++) {
                rowData = addVesselapi.row(currRow).data();
                rowData.voyageNo =voyageNum;
            }
            $('#addNewVesselGrid').dataTable().api().rows().invalidate('data').draw();
        }
    }
    // meathod to load the search screen after voyage update
    function loadSearchScreenWithVoyage(schedule) {
        var choose = schedule.id;
        nsSchedule.vesselPositionDirtyFlag = 0;

        $('.vesselContentWrapperSubDiv').hide();
        $('.defaultSearchMsg').show();
        $('#leftSearchMenu').trigger('submit', ['addVoyageSubmit', choose]);
        $('#closeSearchMenu').click();
        $('.defaultSearchMsg').hide();
        $('.vesselContentWrapperSubDiv').css('display', 'block');
    }
    scheduleObj = {
        'saveScheduleData': saveScheduleData,
        'formSubmit': formSubmit,
        'importXL': importXL,
        'loadSearchScreenTempData': loadSearchScreenTempData,
        'loadArrivalDepartDates': loadArrivalDepartDates,
        'loadSearchScreenWithVoyage': loadSearchScreenWithVoyage,
        'loadVoyageNumberForExcelTemplate' :loadVoyageNumberForExcelTemplate
    };

    $.extend(true, nsSchedule, scheduleObj);
})(this.schedule,jQuery, this.core, this.vmsService);