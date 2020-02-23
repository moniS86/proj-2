/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsSchedule, nsCore, vmsService, $) {
    var departDateArr = [], schedule, scheduleObj = {}, voyageEndDate = '', vesselPositionArray = '', addVoyageDirtyFlag = 0, checkStartDate, endDate = '', voyageNo = '', timeFormat = localStorage
        .getItem('timeFormat');
    nsSchedule.importExcel = 0;
    function isAddVesselExists() {
        return $.fn.DataTable.fnIsDataTable($('#addNewVesselGrid'))
            && ($('#addNewVesselGrid').dataTable().api().data().length > 0);
    }
    // Function to display the Dirty flag message
    function showDirtyFlagMessage() {
        if (addVoyageDirtyFlag === 1) {
            // Initializing Popup
            $('#addVoyageUnsvCnf').dialog({
                resizable : false,
                modal : true,
                autoOpen : false,
                width : 400,
                closeOnEscape : false,
                open : function() {
                    nsCore.commonPopup(this);
                },
                buttons : {
                    'Yes' : function() {
                        $('#addVoyageUnsvCnf').dialog('close');
                        nsSchedule.saveScheduleData();
                    },
                    'No' : function() {
                        nsSchedule.importExcel = 0;
                        addVoyageDirtyFlag = 0;
                        $('#addVoyageUnsvCnf').dialog('close');
                        $('#newVesselVoyageSchedulePopup').dialog('close');
                        $('.modelPopupBground').hide();
                        nsSchedule.vesselPositionArray = [];
                    }
                }
            });
            $('#addVoyageUnsvCnf').dialog('open');
        } else {
            addVoyageDirtyFlag = 0;
        }
    }
    function addVoyage() {
        var format = localStorage.getItem('dateFormat'), dateFormat = nsCore.returnDate(format), select, operatedByDropDown, operatedById;
        addVoyageDirtyFlag = 0;
        $('#errorMsgs').html('');
        $('.datePickerInp').datepicker({
            changeYear : true,
            dateFormat : dateFormat
        });
        // To clear the form values in add vessel voyage popup
        $('#newScheduleUnit').find('input[type="text"],select').val('');
        $("#newVPortName").removeAttr('disabled').val("");
        nsSchedule.endDate = '';
        $('#sDate').val(new moment().format(nsSchedule.userDateFormat + ' ' + "00:00"));
        // Dirty Flag
        $(document).on('change', '#newScheduleUnit :input,#newScheduleUnit', function() {
            var vCode = $('#vCode').attr('data-form3'), vDesc = $('#vesselDesc').attr('data-form4');
            if (vCode === '0' || vDesc === '0') {
                $('#voyageNo').val('');
                if (nsSchedule.importExcel === 0) {
                    $('#sDate').val('');
                }
            }
            addVoyageDirtyFlag = 1;
            $(this).closest('#newScheduleUnit').data('changed', true);
        });
        $('#newVesselVoyageSchedulePopup #cancelButton, #newVesselVoyageSchedulePopup .toolTipCloseIcon').click(
            function(e) {
                e.stopPropagation();
                if (addVoyageDirtyFlag === 1) {
                    showDirtyFlagMessage();
                } else {
                    nsSchedule.importExcel = 0;
                    addVoyageDirtyFlag = 0;
                    $('#newVesselVoyageSchedulePopup').dialog('close');
                    $('.modelPopupBground').hide();
                    nsSchedule.vesselPositionArray = [];
                }
            });
        $('.spaceCharterWith option').remove();
        $('.ltCharterFrom option').remove();
        $('.operatedBy option').remove();
        select = '<option value="">-- Select --</option>';
        $('.spaceCharterWith').html(select);
        $('.ltCharterFrom').html(select);
        $('.operatedBy').html(select);
        $('#applyTemplate').html(select);
        operatedByDropDown = select;
        operatedById = '';
        vmsService.vmsApiServiceType(function(response) {
            var count, i, dumArr = {
                'responseData' : []
            };
            if (response) {
                count = response.responseData.length;
                response.responseData.sort(function(a, b) {
                    var tmpltName1 = a.desc.toUpperCase(), tmpltName2 = b.desc.toUpperCase();
                    return (tmpltName1 < tmpltName2) ? -1 : (tmpltName1 > tmpltName2) ? 1 : 0;
                });
                if (count > 0) {
                    for (i = 0; i < count; i++) {
                        schedule = response.responseData[i];
                        operatedByDropDown += voyageDataHelper(schedule);
                    }
                }
                if ($('#spaceCharWith').val() === '' && $('#ltCharFrom').val() === '') {
                    $('#opBy').html('<option value="1">Hoegh Autoliners</option>').prop('disabled', true);
                }
                loadVoyageTable(dumArr);
                $(document).on(
                    'change',
                    '#spaceCharWith',
                    function() {
                        if ($('#spaceCharWith').val() === '' && $('#ltCharFrom').val() === '') {
                            $('#opBy').prop('disabled', false).html('<option value="6">Hoegh Autoliners</option>')
                                .prop('disabled', true);
                        } else {
                            $('#opBy').prop('disabled', false).html(operatedByDropDown).val(operatedById);
                        }
                    });
                $(document).on(
                    'change',
                    '#ltCharFrom',
                    function() {
                        if ($('#spaceCharWith').val() === '' && $('#ltCharFrom').val() === '') {
                            $('#opBy').prop('disabled', false).html('<option value="6">Hoegh Autoliners</option>')
                                .prop('disabled', true);
                        } else {
                            $('#opBy').prop('disabled', false).html(operatedByDropDown).val(operatedById);
                        }
                    });
                $(document).on('change', '#opBy', function() {
                    operatedById = $('#opBy').val();
                });
            } else {
                nsCore.showAlert(nsSchedule.errorMsg);
            }
        }, nsSchedule.charterer, 'POST', null);
        nsSchedule.isExcel = false;
    }
    function voyageDataHelper(voyageData, operatedByDropDown) {
        if (voyageData.desc !== 'Hoegh Autoliners') {
            $('#spaceCharWith').append('<option value=' + voyageData.code + '>' + voyageData.desc + '</option>');
            $('#ltCharFrom').append('<option value=' + voyageData.code + '>' + voyageData.desc + '</option>');
            operatedByDropDown = operatedByDropDown + '<option value=' + voyageData.code + '>' + voyageData.desc
                + '</option>';
            $('#opBy').append('<option value=' + voyageData.code + '>' + voyageData.desc + '</option>');
        }
        return operatedByDropDown;
    }
    function loadingData(response) {
        var templateName = '', id = '', i = 0, select;
        if (response.responseDescription === "Success") {
            select = '<option value="00">-- Select --</option>';
            response.responseData.sort(function(a, b) {
                var tmpltName1 = a.voyageTemplateName.toUpperCase(), tmpltName2 = b.voyageTemplateName.toUpperCase();
                return (tmpltName1 < tmpltName2) ? -1 : (tmpltName1 > tmpltName2) ? 1 : 0;
            });
            for (i in response.responseData) {
                if (response.responseData.hasOwnProperty(i)) {
                    id = response.responseData[i].id;
                    templateName = templateName + '<option value=' + id + '>'
                        + response.responseData[i].voyageTemplateName.toUpperCase() + '</option>';
                }
            }
            return select + templateName;
        }
    }
    function loadTemplateData(tradeIdParam) {
        $('#voyageComments').val('');
        if (nsSchedule.importExcel === 0) {
            if ($.fn.DataTable.fnIsDataTable($('#addNewVesselGrid'))) {
                $('#addNewVesselGrid').dataTable().api().clear().draw();
                nsSchedule.checkExpandCollapseVessel('addNewVesselGrid_wrapper', 'collapse');
            }
        }
        $('.tempDropDown').empty();
        if (!nsSchedule.importExcel) {
            $("#newVPortName").val("").prop("disabled", false);
        }
        vmsService.vmsApiServiceType(function(response) {
            var loadTemplateDropdown;
            if (response.responseDescription === 'Success') {
                if (response.responseData.length > 0) {
                    loadTemplateDropdown = loadingData(response);
                }
                $('#applyTemplate').html(loadTemplateDropdown || '<option value="00">-- Select --</option>');
            } else {
                nsCore.showAlert('Error: ' + response.responseDescription);
            }
        }, (nsSchedule.tradeId + tradeIdParam), 'GET', null);
    }
    function loadVoyageDetails(templateId) {
        vmsService.vmsApiServiceType(function(response) {
            var templateMenu, sDate, voyageTempComment;
            if (response.responseDescription === 'Success') {
                vmsService.vmsApiService(function(voyComments) {
                    $('#voyComments').val(voyComments);
                }, (nsSchedule.getVoyComments + templateId), 'POST', null);
                templateMenu = $('#templateSelectorMenu li.clickedRole').attr('id');
                voyageTempComment = $('#' + templateMenu + 'comment').val();
                $('#voyageTempComment').val('');
                if (voyageTempComment !== null && ($.trim(voyageTempComment) !== 'null')) {
                    $('#voyageTempComment').val(voyageTempComment);
                }
                vesselPositionArray = response.responseData;
                if (nsSchedule.vesselPositionArray) {
                    nsSchedule.vesselPositionArray = vesselPositionArray;
                } else {
                    $.extend(true, nsSchedule, {
                        'vesselPositionArray' : vesselPositionArray
                    });
                }
                loadVoyageTable(response);
                sDate = $('#sDate').val();
                if (sDate) {
                    nsSchedule.loadArrivalDepartDates(sDate);
                }
            } else {
                $('#addNewVesselGrid').dataTable().api().clear();
                $('#addNewVesselGrid').dataTable().api().rows.add(response.responseData).draw();
                $('#addNewVesselGrid').dataTable().api().columns.adjust();
                nsCore.showAlert('Error: ' + response.responseDescription);
            }
        }, (nsSchedule.getPortCall + templateId), 'GET', null);
    }
    // Loading the Add New Voyage DataGrid
    function loadVoyageTable(response) {
        var i = 0, arrivalDateArr = [],
            addVesselGridHt;
        departDateArr = [];
        for (i = 0; i < response.responseData.length; i++) {
            arrivalDateArr.push(response.responseData[i].arrivalDate);
            departDateArr.push(response.responseData[i].departureDate);
            response.responseData[i].voyageNo = nsSchedule.isExcel ? $('#voyageNo').val() : '';
        }
        if (nsSchedule.arrivalDateArr) {
            nsSchedule.arrivalDateArr = arrivalDateArr;
            nsSchedule.departDateArr = departDateArr;
        } else {
            $.extend(true, nsSchedule, {
                'arrivalDateArr' : arrivalDateArr,
                'departDateArr' : departDateArr
            });
        }
        nsSchedule.vesselPositionArray = response.responseData;
        $('.defaultSearchMsg').hide();
        if ($.fn.DataTable.fnIsDataTable($('#addNewVesselGrid'))) {
            $('#addNewVesselGrid').dataTable().api().clear().draw();
            $('#addNewVesselGrid').dataTable().api().rows.add(response.responseData).draw();
            nsSchedule.checkExpandCollapseVessel('addNewVesselGrid_wrapper', 'collapse');
        } else {
            addVesselGridHt = nsSchedule.calculatePopupScheduleGridHt('newVesselVoyageSchedulePopup');
            $('.hidden').removeClass('hidden');
            $('#addNewVesselGrid').DataTable(
                {
                    'processing' : true,
                    'serverSide' : false,
                    'bFilter' : true,
                    'tabIndex' : -1,
                    'bSort' : false,
                    'ordering' : false,
                    'info' : false,
                    'searching' : false,
                    'fixedHeader' : false,
                    "orderClasses" : false,
                    'dom' : '<t>',
                    'scrollX' : true,
                    'scrollY' : addVesselGridHt,
                    'scrollCollapse' : true,
                    'paging' : false,
                    'autoWidth' : false,
                    'retrieve' : true,
                    'data' : response.responseData,
                    'destroy' : true,
                    'fnDrawCallback' : function() {
                    // this grid is so sensitive and it has to be tested for so
                    // many scenarios. Will be removed in sprint5.
                    },
                    'columnDefs' : [
                        {
                            'targets' : [
                                4, 5, 8, 9, 10, 11, 7, 12, 15
                            ],
                            'width' : '20px',
                        }, {
                            'targets' : [
                                2, 3, 6, 13
                            ],
                            'width' : '140px'
                        }, {
                            'targets' : [
                                1
                            ],
                            'width' : '100px'
                        }, {
                            'targets' : [
                                0, 5, 12
                            ],
                            'class' : 'flexibleCol'
                        }, {
                            'targets' : [
                                15, 16, 17
                            ],
                            'width' : '60px'
                        }
                    ],
                    fnInitComplete : function() {
                        $('th').unbind('keypress');
                        $('.portComment').tooltip();
                        nsSchedule.checkExpandCollapseVessel('addNewVesselGrid_wrapper', 'collapse');
                        $(this).dataTable().api().columns.adjust();
                    },
                    'columns' : [
                        {
                            data : 'voyageNo',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                }
                                return '<input readonly type="text" class="textAlignRight" value="' + data + '">';
                            }
                        },
                        {
                            data : 'portName',
                            'render' : function(data, type, full) {
                                if (full.portName) {
                                    return '<input type="text"  readonly class="portName" value="' + full.portName
                                        + '">';
                                } else {
                                    return '<input type="text" readonly class="portName" value="">';
                                }
                            }
                        },
                        {
                            data : 'arrivalDate',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                }
                                return '<input class="arrivalDateTime vesselDates" name="arrivalDateTime[1]"'
                                    + 'type="text" readonly value= "' + data + '">';
                            }
                        },
                        {
                            data : 'departureDate',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                }
                                return '<input class="departureDateTime vesselDates" name="departureDateTime[1]"'
                                    + 'type="text" readonly value="' + data + '">';
                            }
                        },
                        {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Load') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox"' + checked + '  value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        },
                        {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Discharge') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox" ' + checked + '  value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        },
                        {
                            data : 'portComment',
                            'render' : function(data, type, full) {
                                var comments = full.comments;
                                if (data) {
                                    data = '';
                                }
                                if (!comments) {
                                    comments = '';
                                }
                                return '<input type="text" readonly class="portComment" title="' + data + '"value="'
                                    + comments + '">';
                            }
                        }, {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Canal transit') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox"' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Bunkering call') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox"' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Registration call') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox"' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Delivery') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox"' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Redelivery') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox" ' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'purposeDescList',
                            'render' : function(data) {
                                var checked = '';
                                if (data) {
                                    for (i = 0; i < data.length; i++) {
                                        if (data[i] === 'Drydock') {
                                            checked = 'checked';
                                        }
                                    }
                                }
                                return '<input type="checkbox"' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'regComments',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                }
                                return '<input type="text" readonly value="' + data + '">';
                            }
                        }, {
                            data : 'cancelled',
                            'sWidth' : '20px',
                            'render' : function(data) {
                                var checked = nsSchedule.checkedVal(data);
                                return '<input type="checkbox"' + checked + ' value="' + data + '" disabled>';
                            },
                            'sClass' : 'checkboxAlign'
                        }, {
                            data : 'portCaptain',
                            'sWidth' : '40px',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                }
                                return '<input class="w60p"  type="text" readonly value="' + data + '">';
                            }
                        }, {
                            data : 'operator',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                }
                                return '<input class="w60p" type="text" readonly value="' + data + '">';
                            }
                        }, {
                            data : 'timeZoneValue',
                            'render' : function(data) {
                                if (!data) {
                                    data = '';
                                } else {
                                    data = nsSchedule.timeZoneFilter(data);
                                }
                                return '<input type="text" readonly class="w60p timeZone" value="' + data + '">';
                            }
                        }
                    ]
                });
        }
        if (isAddVesselExists()) {
            $("#newVPortName").val($('#addNewVesselGrid tbody tr:first td:eq(1) input').val()).attr('disabled',
                'disabled');
            $("#newVPortName").attr('data-form5', 10);
        } else {
            $("#newVPortName").val("").prop("disabled", false);
            $("#newVPortName").attr('data-form5', 0);
        }
        $('#addNewVesselGrid_wrapper .dataTables_scrollHead').css('width', ($('#addNewVesselGrid').css('width')));
        $('.showHide').trigger('click');
    }
    function getVoyageNumber(vesselCodeParam) {
        var date = localStorage.getItem('dateFormat'), superIntendent = '', voyageData = {
            vesselCode : vesselCodeParam,
            tradeId : $('.tId').val()
        }, data = {
            voyageData : voyageData,
            dateFormat : date,
            timeFormat : timeFormat
        };
        vmsService.vmsApiServiceType(function(response) {
            var startDate, startEle = $('#sDate');
            if (response) {
                voyageNo = response.voyageNo;
                endDate = response.endDate;
                if (nsSchedule.endDate) {
                    nsSchedule.endDate = endDate;
                } else {
                    $.extend(true, nsSchedule, {
                        'endDate' : endDate
                    });
                }
                superIntendent = response.superIntendent;
                $('.voyageNo').val(parseInt(voyageNo));
                $('.Superintendent').val(superIntendent);
                voyageEndDate = response.endDate;
                if (nsSchedule.voyageEndDate) {
                    nsSchedule.voyageEndDate = voyageEndDate;
                } else {
                    $.extend(true, nsSchedule, {
                        'voyageEndDate' : voyageEndDate
                    });
                }
                if (nsSchedule.importExcel === 1) {
                    startDate = $('#sDate').val();
                    nsSchedule.loadVoyageNumberForExcelTemplate();
                } else {
                    startDate = response.startDate;
                    $('#sDate').val(startDate);
                    rome($('#sDate')[0]).setValue(startDate);
                }
                checkStartDate = startDate;
                $.extend(true, nsSchedule, {
                    'checkStartDate' : checkStartDate
                });
                // create Moment Obj
                startEle.val(startDate).attr('data-prev', startDate);
                if (isAddVesselExists() && !nsSchedule.isExcel) {
                    nsSchedule.loadArrivalDepartDates(startDate);
                }
            } else {
                nsCore.showAlert(nsSchedule.errorMsg);
            }
        }, nsSchedule.getVoyageNumber, 'POST', JSON.stringify(data));
    }
    $(document).ready(
        function() {
            if ($('#distPublicStatus').is(':checked')) {
                $('#distInternalStatus').prop('checked', true).prop('disabled', true);
            }
            $('#distPublicStatus').change(function() {
                if ($(this).is(':checked')) {
                    $('#distInternalStatus').prop('checked', true).prop('disabled', true);
                } else {
                    $('#distInternalStatus').prop('disabled', false);
                }
            });
            $('.tradeCode').autocomplete(
                {
                    search : function() {
                        nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input');
                        $('.tradeCode').attr('data-form1', 0);
                    },
                    minLength : 1,
                    delay : 0,
                    source : function(request, response) {
                        vmsService.vmsApiServiceType(function(data) {
                            var count1, flagCodes = [], i = 0;
                            if (data) {
                                count1 = data.responseData.length;
                                nsSchedule.tradeCodeAutoArry = [];
                                nsSchedule.tradeNameAutoArry = [];
                                for (i = 0; i < count1; i++) {
                                    flagCodes.push({
                                        value : '' + data.responseData[i].tradeCodeValue + '',
                                        label : data.responseData[i].tradeCodeValue,
                                        name : data.responseData[i].tradeDescription,
                                        tradeId : data.responseData[i].tradeId
                                    });
                                    nsSchedule.tradeCodeAutoArry.push(jDecode(data.responseData[i].tradeCodeValue));
                                    nsSchedule.tradeNameAutoArry.push(jDecode(data.responseData[i].tradeDescription));
                                }
                                flagCodes.sort(function(a, b) {
                                    return a.label.localeCompare(b.label);
                                });
                            } else {
                                loadTemplateData('0');
                            }
                            response(flagCodes);
                        }, nsSchedule.tradeCodeList, 'POST', JSON.stringify({
                            tradeCodeValue : request.term
                        }));
                    },
                    autoFocus : true,
                    select : function(event, ui) {
                        $('.tId').val(ui.item.tradeId);
                        $('.tradeCode').val(ui.item.label).attr('data-form1', ui.item.value);
                        $('.tradeDesc').attr('data-form2', ui.item.name).val(
                            ui.item.name.replace('&lt;', '<').replace('&gt;', '>'));
                        loadTemplateData(ui.item.tradeId);
                        addVoyageDirtyFlag = 1;
                        $('.showHide').trigger('click');
                    }
                });
            $('.tradeDesc').autocomplete({
                search : function() {
                    nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input');
                    $('.tradeDesc').attr('data-form2', 0);
                },
                minLength : 1,
                source : function(request, response) {
                    vmsService.vmsApiServiceType(function(data) {
                        var count1, flagCodes = [], i = 0;
                        if (data) {
                            count1 = data.responseData.length;
                            nsSchedule.tradeCodeAutoArry = [];
                            nsSchedule.tradeNameAutoArry = [];
                            for (i = 0; i < count1; i++) {
                                flagCodes.push({
                                    name : '' + data.responseData[i].tradeCodeValue + '',
                                    label : data.responseData[i].tradeDescription,
                                    value : data.responseData[i].tradeDescription,
                                    tradeId : data.responseData[i].tradeId
                                });
                                nsSchedule.tradeCodeAutoArry.push(jDecode(data.responseData[i].tradeCodeValue));
                                nsSchedule.tradeNameAutoArry.push(jDecode(data.responseData[i].tradeDescription));
                            }
                            flagCodes.sort(function(a, b) {
                                return a.label.localeCompare(b.label);
                            });
                        } else {
                            loadTemplateData('0');
                        }
                        response(flagCodes);
                    }, nsSchedule.tradeCodeList, 'POST', JSON.stringify({
                        tradeDescription : request.term
                    }));
                },
                autoFocus : true,
                delay : 0,
                select : function(event, ui) {
                    loadTemplateData(ui.item.tradeId);
                    $('.tId').val(ui.item.tradeId);
                    $('.tradeDesc').val(ui.item.label).attr('data-form2', ui.item.value);
                    $('.tradeCode').attr('data-form1', ui.item.name).val(ui.item.name);
                    addVoyageDirtyFlag = 1;
                    $('.showHide').trigger('click');
                }
            });
            $('.tradeCode').change(
                function(e) {
                    nsCore.delInvalidAutoFeilds('.tradeCode', '.tradeDesc', $(this).val(),
                        nsSchedule.tradeCodeAutoArry, e);
                });
            $('.tradeDesc').change(
                function(e) {
                    nsCore.delInvalidAutoFeilds('.tradeDesc', '.tradeCode', $(this).val(),
                        nsSchedule.tradeNameAutoArry, e);
                });
            function jDecode(str) {
                return $('<div/>').html(str).text();
            }
            vmsService.vmsApiServiceType(function(data) {
                var count1, i = 0;
                nsSchedule.flagCodesVslCode = [];
                nsSchedule.flagCodesVslName = [];
                if (data) {
                    count1 = data.responseData.length;
                    nsSchedule.vesselCodeAutoArry = [];
                    nsSchedule.vesselNameAutoArry = [];
                    if (data.responseDescription === 'Success') {
                        for (i = 0; i < count1; i++) {
                            nsSchedule.flagCodesVslCode.push({
                                index : data.responseData[i].vesselCode,
                                target : data.responseData[i].vesselName
                            });
                            nsSchedule.flagCodesVslName.push({
                                index : data.responseData[i].vesselName,
                                target : data.responseData[i].vesselCode
                            });
                            nsSchedule.vesselCodeAutoArry.push(jDecode(data.responseData[i].vesselCode));
                            nsSchedule.vesselNameAutoArry.push(jDecode(data.responseData[i].vesselName));
                        }
                    }
                }
            }, '/Vms/autocomplete/voyVesselList', 'POST', JSON.stringify({
                vesselCode : ''
            }));
            $('#vCode').autocomplete({
                search : function() {
                    $('#vCode').attr('data-form3', 0);
                    if (!$('#vCode').val()) {
                        $('#voyageNo').val('');
                        // this also clears the template Voyage Num
                        nsSchedule.loadVoyageNumberForExcelTemplate();
                    }
                },
                minLength : 1,
                source : nsCore.modifySmartObj(nsSchedule.flagCodesVslCode, {
                    'index' : [
                        'value', 'label'
                    ],
                    'target' : [
                        'name'
                    ]
                }).sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                }),
                autoFocus : true,
                delay : 0,
                select : function(event, ui) {
                    getVoyageNumber(ui.item.value);
                    $('.vesselCode').val(ui.item.label).attr('data-form3', ui.item.value);
                    $('.vesselName').attr('data-form4', ui.item.name).val(ui.item.name);
                    addVoyageDirtyFlag = 1;
                }
            });
            $('#vesselDesc').autocomplete({
                search : function() {
                    $('#vesselDesc').attr('data-form4', 0);
                    $(this).attr('data-form3', 0);
                    if (!$('#vesselDesc').val()) {
                        $('#voyageNo').val('');
                        // this also clears the template Voyage Num
                        nsSchedule.loadVoyageNumberForExcelTemplate();
                    }
                },
                minLength : 1,
                delay : 0,
                source : nsCore.modifySmartObj(nsSchedule.flagCodesVslName, {
                    'index' : [
                        'value', 'label'
                    ],
                    'target' : [
                        'name'
                    ]
                }).sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                }),
                autoFocus : true,
                select : function(event, ui) {
                    getVoyageNumber(ui.item.name);
                    $('.vesselName').val(ui.item.label);
                    $('.vesselCode').val(ui.item.name).attr('data-form3', ui.item.name);
                    $('.vesselName').attr('data-form4', ui.item.value);
                    addVoyageDirtyFlag = 1;
                }
            });
            $('.vesselCode').change(
                function(e) {
                    nsCore.delInvalidAutoFeilds('.vesselCode', '.vesselName', $(this).val(), JSON
                        .parse(localStorage.vesselCodes), e);
                });
            $('.vesselName').change(
                function(e) {
                    nsCore.delInvalidAutoFeilds('.vesselName', '.vesselCode', $(this).val(), JSON
                        .parse(localStorage.vesselNames), e);
                });
            $('#newVPortName').autocomplete({
                search : function() {
                    $('#newVPortName').attr('data-form5', 0);
                },
                minLength : 1,
                source : nsCore.modifySmartObj(nsCore.smartData.portDesc, {
                    'index' : [
                        'label'
                    ],
                    'target' : [
                        'name', 'prtCode'
                    ]
                }).sort(function(a, b) {
                    return a.label.localeCompare(b.label);
                }),
                autoFocus : true,
                delay : 0,
                select : function(event, ui) {
                    $('#newVPortName').val(ui.item.label).attr('data-form5', ui.item.prtCode);
                }
            });
            $('.vesselName, .vesselCode').blur(function() {
                if (!$(this).val()) {
                    $('#voyageNo').val('');
                    if (nsSchedule.importExcel === 0) {
                        $('#sDate').val('');
                    }
                }
            });
            $(document).on('change', '.tempDropDown', function() {
                var value = $(this).val(), dumArr = {
                    'responseData' : []
                };
                nsSchedule.isExcel = false;
                nsSchedule.importExcel = 0;
                $("#sDate").removeAttr('disabled');
                if ($.fn.DataTable.fnIsDataTable($('#addNewVesselGrid')) && value === '00') {
                    vesselPositionArray = '';
                    $('#addNewVesselGrid').dataTable().api().clear().draw();
                }
                if (value === '00') {
                    loadVoyageTable(dumArr);
                    $('#voyComments').val('');
                } else {
                    loadVoyageDetails(value);
                }
            });
        });
    scheduleObj = {
        'addVoyage' : addVoyage,
        'schedule' : schedule,
        'vesselPositionArray' : vesselPositionArray,
        'checkStartDate' : checkStartDate,
        'voyageNo' : voyageNo,
        'endDate' : endDate,
        'departDateArr' : departDateArr,
        'loadVoyageTable' : loadVoyageTable,
        'isAddVesselExists' : isAddVesselExists
    };
    $.extend(true, nsSchedule, scheduleObj);
})(this.schedule, this.core, this.vmsService, jQuery);
