/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
//Declaration of Global variables'use strict;'
'use strict';
this.schedule = {};
(function(nsSchedule, nsCore, vmsService, $) {
    var scheduleObj = {
        'dbPath' : '../resources/app/swf/copy_csv_xls_pdf.swf',
        'maintainVessel' : '/Vms/schedule/vesselPosition',
        'vesselGrid' : '/Vms/schedule/vesselGrid',
        'portList' : '/Vms/schedule/portList',
        'search' : '/Vms/schedule/search',
        'vesselDelete' : '/Vms/schedule/delete',
        'vesselUpdate' : '/Vms/schedule/update',
        'allocation' : '/Vms/allocation/getGenericAllocation',
        'createAllocation' : '/Vms/allocation/createAllocation',
        'customerList' : '/Vms/autoComplete/customerlist',
        'applyTemplate' : '/Vms/allocTempl/applyAllocationTemplates',
        'allocationComment' : '/Vms/allocation/getAllocationComment',
        'companySearch' : '/Vms/supplier/search',
        'getAllocations' : '/Vms/allocTempl/getAllAllocations',
        'getAllocTempl' : '/Vms/allocTempl/getAllocTempl',
        'tabAllocation' : '/Vms/allocation/getAllocation',
        'getBookStatus' : '/Vms/allocation/getBookStatus',
        'charterer' : '/Vms/schedule/charterer',
        'removeVoyage' : '/Vms/schedule/removeEditVoyage?voyageId=',
        'editVoyage' : '/Vms/schedule/saveEditVoyage',
        'uploadDate' : '/Vms/schedule/upload?dateformat=',
        'errorMsg' : 'Something went wrong. Please contact your admin.',
        'saveData' : '/Vms/schedule/saveScheduleData',
        'tradeCodeList' : '/Vms/autoComplete/tradeCodeList',
        'getVoyageNumber' : '/Vms/schedule/getVoyageNumber',
        'getVoyComments' : '/Vms/schedule/getVoyComments?templateId=',
        'getPortCall' : '/Vms/voyageTempl/getPortCallTemplates?voyage-template-id=',
        'tradeId' : '/Vms/voyageTempl/voyagetemplates?trade-id=',
        'voyageDetails' : '/Vms/schedule/voyageDetails?voyageId=',
        'allocationSchedule' : '/Vms/allocation/home',
        'updateVoyageNo' : '',
        'selectedVoyageRowNum' : '',
        'scheduleHome' : '/Vms/schedule/home',
        'defVoyComment' : '',
        'templateData' : templateData,
        'checkVesselPositionDirtyFlagMessage' : checkVesselPositionDirtyFlagMessage,
        'highlightError' : highlightError,
        'loadVesselGridTable' : loadVesselGridTable,
        'toolTipWraper' : toolTipWraper,
        'toolTipContent' : toolTipContent,
        'vesselPositionDirtyFlag' : 0,
        'showAllocDirtyFlagMessage' : showAllocDirtyFlagMessage,
        'trdCode' : trdCode,
        'vslCode' : vslCode,
        'lodPort' : lodPort,
        'disPort' : disPort,
        'isAllocAvailable' : false
    };
    function templateData(response) {
        var select = '<option data-comment = "' + nsSchedule.defVoyComment + '" value="">-- Select --</option>', templateName = '', i, id;
        if (response.responseData.length > 0) {
            for (i in response.responseData) {
                if ((response.responseData).hasOwnProperty(i)) {
                    id = response.responseData[i].templateId;
                    templateName = templateName + '<option data-comment = "'
                        + (response.responseData[i].templateComments || '') + '" value=' + id + '>'
                        + response.responseData[i].templateName.toUpperCase() + '</option>';
                }
            }
            return select + templateName;
        } else {
            return select;
        }
    }
    // Function to display the Dirty flag message
    function checkVesselPositionDirtyFlagMessage(triggerSource, clickedVoyage) {
        // Initializing Popup
        $('#unsvDlgCnf').dialog(
            {
                resizable : false,
                modal : true,
                autoOpen : false,
                width : 400,
                closeOnEscape : false,
                // Inside the Dialog initialization, add the below code
                open : function() {
                    nsCore.commonPopup(this);
                },
                buttons : {
                    'Yes' : function() {
                        $('#unsvDlgCnf').dialog('close');
                        $('.saveSchedule').trigger('click');
                    },
                    'No' : function() {
                        nsSchedule.vesselPositionDirtyFlag = 0;
                        $('#unsvDlgCnf').dialog('close');
                        if (triggerSource === 'navigation') {
                            nsCore.navigateToClickedPath(nsSchedule.clickedLinkPath);
                        } else if (triggerSource === 'addVoyage') {
                            nsSchedule.loadMaintainVesselTable(nsSchedule.scheduleDataSearch);
                            $('#addVoyage').trigger('click');
                        } else if (triggerSource === 'editVoyage') {
                            nsSchedule.loadMaintainVesselTable(nsSchedule.scheduleDataSearch);
                            $('#editVesselVoyageScheduleLink').trigger('click');
                        } else if (triggerSource === 'selectVoyage') {
                            $(
                                '.voyageContentListCol.voyageNbrsCntnt .singleVoyageItem[data-voyageid="'
                                    + clickedVoyage + '"]').trigger('click');
                        } else if (triggerSource === 'newSearch') {
                            nsSchedule.loadMaintainVesselTable(nsSchedule.scheduleDataSearch);
                            $('.newSearch').trigger('click');
                        } else {
                            if (triggerSource === 'removePortcall') {
                                $(clickedVoyage).trigger('click');
                            }
                        }
                    }
                }
            });
        $('#unsvDlgCnf').dialog('open');
    }
    function trdCode() {
        $(document).on(
            'focus.autocomplete',
            '#tradeCode',
            function() {
                var count1 = nsCore.smartData.portCode.length, flagCodes = nsCore.returnSmartArr(
                    nsCore.smartData.tradeCode, 'index'), flagDesc = nsCore.returnSmartArr(nsCore.smartData.tradeCode,
                    'target'), fCount = 0, selectedVal = '', minWidth = $(this).width();
                $('#tradeCode').autocomplete({
                    source : nsCore.beginWithAutoComplete(flagCodes),
                    autoFocus : true,
                    delay : 0,
                    search : function() {
                        nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input');
                    },
                    open : function(event, ui) {
                        $(this).autocomplete("widget").css({
                            "min-width" : (minWidth + "px")
                        });
                    },
                    minLength : 1,
                    select : function(event, ui) {
                        selectedVal = ui.item.value;
                        for (fCount = 0; fCount < count1; fCount++) {
                            if (selectedVal === flagCodes[fCount]) {
                                $('#tradeCode').attr('data-form', selectedVal).val(selectedVal);
                                $('#tradeDesc').val(flagDesc[fCount]);
                            }
                        }
                    }
                });
            });
    }
    function vslCode() {
        $(document).on(
            'focus.autocomplete',
            '#vesselCode',
            function() {
                var count1 = nsCore.smartData.vesselCode.length, flagCodes = nsCore.returnSmartArr(
                    nsCore.smartData.vesselCode, 'index'), flagDesc = nsCore.returnSmartArr(
                    nsCore.smartData.vesselCode, 'target'), fCount = 0, selectedVal = '', minWidth = $(this).width();
                $('#vesselCode').autocomplete({
                    source : nsCore.beginWithAutoComplete(flagCodes),
                    autoFocus : true,
                    delay : 0,
                    search : function() {
                        nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input');
                    },
                    open : function(event, ui) {
                        $(this).autocomplete("widget").css({
                            "min-width" : (minWidth + "px")
                        });
                    },
                    minLength : 1,
                    select : function(event, ui) {
                        selectedVal = ui.item.value;
                        for (fCount = 0; fCount < count1; fCount++) {
                            if (selectedVal === flagCodes[fCount]) {
                                $('#vesselCode').attr('data-form', selectedVal).val(selectedVal);
                                $('#vesselName').val(flagDesc[fCount]);
                            }
                        }
                    }
                });
            });
    }
    // Load port details
    function lodPort() {
        $(document).on(
            'focus.autocomplete',
            '#lPort',
            function() {
                var count1 = nsCore.smartData.portCode.length, flagCodes = nsCore.returnSmartArr(
                    nsCore.smartData.portCode, 'index'), flagDesc = nsCore.returnSmartArr(nsCore.smartData.portCode,
                    'target'), fCount = 0, selectedVal = '', minWidth = $(this).width();
                $('#lPort').autocomplete({
                    source : nsCore.beginWithAutoComplete(flagCodes),
                    autoFocus : true,
                    delay : 0,
                    search : function() {
                        nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input');
                    },
                    open : function(event, ui) {
                        $(this).autocomplete("widget").css({
                            "min-width" : (minWidth + "px")
                        });
                    },
                    minLength : 1,
                    select : function(event, ui) {
                        selectedVal = ui.item.value;
                        for (fCount = 0; fCount < count1; fCount++) {
                            if (selectedVal === flagCodes[fCount]) {
                                $('#lPort').attr('data-form', selectedVal).val(selectedVal);
                                $('#lPortName').val(flagDesc[fCount]);
                            }
                        }
                    }
                });
            });
    }
    function disPort() {
        $(document).on(
            'focus.autocomplete',
            '#dPort',
            function() {
                var count1 = nsCore.smartData.portCode.length, flagCodes = nsCore.returnSmartArr(
                    nsCore.smartData.portCode, 'index'), flagDesc = nsCore.returnSmartArr(nsCore.smartData.portCode,
                    'target'), fCount = 0, selectedVal = '', minWidth = $(this).width();
                $('#dPort').autocomplete({
                    source : nsCore.beginWithAutoComplete(flagCodes),
                    autoFocus : true,
                    delay : 0,
                    search : function() {
                        nsCore.clearNextAutocomplete($(this), 'input.ui-autocomplete-input');
                    },
                    open : function(event, ui) {
                        $(this).autocomplete("widget").css({
                            "min-width" : (minWidth + "px")
                        });
                    },
                    minLength : 1,
                    select : function(event, ui) {
                        selectedVal = ui.item.value;
                        for (fCount = 0; fCount < count1; fCount++) {
                            if (selectedVal === flagCodes[fCount]) {
                                $('#dPort').attr('data-form', selectedVal).val(selectedVal);
                                $('#dPortName').val(flagDesc[fCount]);
                            }
                        }
                    }
                });
            });
    }
    function highlightError(row) {
        $(row).find('.carAllocVol').closest('td').removeClass('redBordr');
        $(row).find('.puAllocVol').closest('td').removeClass('redBordr');
        $(row).find('.stAllocVol').closest('td').removeClass('redBordr');
        $(row).find('.hhAllocVol').closest('td').removeClass('redBordr');
    }
    function loadVesselGridTable(schedule) {
        var tableEle, rVesselPositionList;
        tableEle = document.getElementById('viewVesselPositionGrid');
        if ($.fn.DataTable.fnIsDataTable(tableEle)) {
            $('#viewVesselPositionGrid').dataTable().fnClearTable();
            $('#viewVesselPositionGrid').dataTable().fnDestroy();
        }
        // Main Maintain Vessel Table load.
        vmsService
            .vmsApiService(
                function(response) {
                    if (response) {
                        nsSchedule.vesselPositionResponse = response;
                        rVesselPositionList = response.responseData.vesselPositionList;
                        if ($.fn.DataTable.fnIsDataTable($("#viewVesselPositionGrid"))) {
                            $("#viewVesselPositionGrid").dataTable().api().clear();
                            $("#viewVesselPositionGrid").dataTable().api().rows.add(rVesselPositionList).draw();
                        } else {
                            $('#viewVesselPositionGrid')
                                .DataTable(
                                    {
                                        "processing" : true,
                                        "serverSide" : false,
                                        "bFilter" : true,
                                        "tabIndex" : -1,
                                        "bSort" : false,
                                        "ordering" : false,
                                        "info" : false,
                                        "searching" : false,
                                        "orderClasses" : false,
                                        'dom' : 'Brtip',
                                        'buttons' : [
                                            {
                                                text : '<span class="icons_sprite buttonIcon exportExcelIcon fa fa-file-excel-o"></span>Export to Excel',
                                                className : 'exportExcelLnk  lightGreyGradient normalBtnLink',
                                                extend : 'excelHtml5',
                                                exportOptions : {
                                                    columns : [
                                                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
                                                    ],
                                                    format : {
                                                        body : function(data, row, column, node) {
                                                            // Strip $ from
                                                            // salary column to
                                                            // make it numeric
                                                            if ($(data).is('input:checkbox')) {
                                                                return ($(data).is(':checked') ? 'Yes' : 'No');
                                                                // for
                                                                // Checkboxes
                                                            } else if ($(data).find('input:text').length > 0) {
                                                                return $(data).find('input:text').val();
                                                                // for DateTime
                                                                // boxes
                                                            } else if ($(data).is('input:text')) {
                                                                return $(data).val();
                                                                // for text
                                                                // boxes
                                                            } else {
                                                                return data;
                                                                // for others
                                                            }
                                                        },
                                                        header : function(data, column) {
                                                            var cusHeader = [
                                                                'Voyage', 'Port name', 'Arrival', 'Departure', 'L',
                                                                'D', 'Port comment', 'Ct', 'Bc', 'Rc', 'De', 'Re',
                                                                'Dd', 'Regional comment', 'Cancelled', 'Port captain',
                                                                'Operator', 'TZ'
                                                            ];
                                                            if (typeof data !== 'undefined') {
                                                                if (data !== null) {
                                                                    return cusHeader[column]; 
                                                                 // get rid of the changed manually column
                                                                }
                                                            }
                                                            return data;
                                                        }
                                                    }
                                                },
                                                title : 'Schedule_Excel'
                                            }
                                        ],
                                        "scrollX" : "100%",
                                        "scrollCollapse" : true,
                                        "paging" : false,
                                        "autoWidth" : false,
                                        "data" : rVesselPositionList,
                                        "rowCallback" : function(row) {
                                            $(row).attr("data-edited", "false");
                                        },
                                        "columnDefs" : [
                                            {
                                                "targets" : [
                                                    9, 10, 11, 12
                                                ],
                                                "visible" : false,
                                                "className" : "toggleCols"
                                            }, {
                                                "targets" : [
                                                    1, 2, 3
                                                ],
                                                "width" : "130px"
                                            }, {
                                                "targets" : [
                                                    6, 13
                                                ],
                                                "class" : "flexibleCol"
                                            }, {
                                                "targets" : [
                                                    0
                                                ],
                                                "width" : "63px"
                                            }, {
                                                "targets" : [
                                                    6, 13
                                                ],
                                                "width" : "100px"
                                            }, {
                                                "targets" : [
                                                    4, 5, 7, 8, 9, 10, 11, 12
                                                ],
                                                "width" : "20px"
                                            }, {
                                                "orderable" : false,
                                                "targets" : [
                                                    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17
                                                ],
                                                "width" : "35px"
                                            }
                                        ],
                                        fnInitComplete : function() {
                                            $("th").unbind("keypress");
                                            nsSchedule.checkExpandCollapseVessel("viewVesselPositionGrid_wrapper",
                                                "collapse");
                                            $(this).dataTable().api().columns.adjust();
                                            // To change th position & Resize
                                            // the Export
                                            // to excel button
                                            nsSchedule.adjustExportBtnPosition(".viewVesselWrapper .buttonsList",
                                                "viewVesselPositionGrid");
                                            if ($('.showColumnsCb:checked').length !== 0) {
                                                $('.showHide').trigger('click');
                                            }
                                        },
                                        "columns" : [
                                            {
                                                data : "voyageNo",
                                                'sWidth' : '55px',
                                                "render" : function(data) {
                                                    return '<input class="voyageNum w35p textAlignRight floatRight" type="text" value="'
                                                        + data + '" readonly>';
                                                }
                                            },
                                            {
                                                data : "portName",
                                                'sWidth' : '170px',
                                                "sClass" : "",
                                                "render" : function(data) {
                                                    if (!data) {
                                                        data = '';
                                                    }
                                                    return '<input type="text" value="' + data + '" readonly></div>';
                                                }
                                            },
                                            {
                                                data : "arrivalDate",
                                                'sWidth' : '70px',
                                                "render" : function(data) {
                                                    return '<input class="arrivalDateTime dateTimeBox" '
                                                        + 'name="arrivalDateTime[1]" type="text" value="'
                                                        + data.split(' ')[0] + '" readonly>';
                                                }
                                            },
                                            {
                                                data : "departureDate",
                                                'sWidth' : '70px',
                                                "render" : function(data) {
                                                    return '<input class="departureDateTime dateTimeBox" '
                                                        + 'name="departureDateTime[1]" type="text" value="'
                                                        + data.split(' ')[0] + '" readonly>';
                                                }
                                            },
                                            {
                                                data : "load",
                                                'sWidth' : '25px',
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                data : "discharge",
                                                'sWidth' : '25px',
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                data : "portComment",
                                                'sWidth' : '150px',
                                                "render" : function(data) {
                                                    if (!data) {
                                                        data = '';
                                                    }
                                                    return '<input type="text"  class="portComment" title="' + data
                                                        + '"  value="' + data + '" readonly>';
                                                }
                                            },
                                            {
                                                data : "canTransit",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                data : "bunkerCall",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                "sClass" : "collapseData",
                                                data : "regCall",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                "sClass" : "collapseData",
                                                data : "delivery",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                "sClass" : "collapseData",
                                                data : "reDelivery",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                "sClass" : "collapseData",
                                                data : "dryDock",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                data : "regComments",
                                                'sWidth' : '150px',
                                                "render" : function(data) {
                                                    if (!data) {
                                                        data = '';
                                                    }
                                                    return '<input type="text" value="' + data + '" readonly>';
                                                }
                                            },
                                            {
                                                data : "cancelled",
                                                "render" : function(data) {
                                                    var checked = nsSchedule.checkedVal(data), tdHtmlText = '<input type="checkbox"'
                                                        + checked + ' value="' + data + '" disabled class="hide">';
                                                    if ((!navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent
                                                        .toLowerCase().indexOf('msie') > -1)) {
                                                        if (checked) {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;">&#x2713;</span>';
                                                        } else {
                                                            return tdHtmlText
                                                                + '<span style="margin-left:17px;"></span>';
                                                        }
                                                    } else {
                                                        return '<input type="checkbox"' + checked + ' value="' + data
                                                            + '" disabled>';
                                                    }
                                                }
                                            },
                                            {
                                                "sClass" : "minWidthData",
                                                data : "portCaptain",
                                                'sWidth' : '80px',
                                                "render" : function(data) {
                                                    if (!data) {
                                                        data = '';
                                                    }
                                                    return '<input type="text" class="w60p" value="' + data
                                                        + '" readonly>';
                                                }
                                            },
                                            {
                                                "sClass" : "minWidthData",
                                                data : "operator",
                                                'sWidth' : '60px',
                                                "render" : function(data) {
                                                    if (!data) {
                                                        data = '';
                                                    }
                                                    return '<input type="text" class="w60p operatorDataWidth" value="'
                                                        + data + '" readonly>';
                                                }
                                            },
                                            {
                                                "sClass" : "minWidthData timeZoneData",
                                                data : "timeZone",
                                                'sWidth' : '70px',
                                                "render" : function(data) {
                                                    if (!data) {
                                                        data = '';
                                                    } else {
                                                        data = nsSchedule.timeZoneFilter(data);
                                                    }
                                                    return '<input type="text" class="w60p" value="' + data
                                                        + '" readonly>';
                                                }
                                            }
                                        ]
                                    });
                            $(
                                '#viewVesselPositionGrid_wrapper .dataTables_scrollHeadInner, #viewVesselPositionGrid_wrapper .dataTable')
                                .css('width', '100%');
                            nsCore.addTabIndex();
                        }
                    } else {
                        nsCore.showAlert(scheduleObj.errorMsg);
                    }
                }, scheduleObj.vesselGrid, 'POST', JSON.stringify(schedule));
    }
    // Tool Tip Content
    // Allocation Comments data table load @param response
    function toolTipWraper(response, rowIndex, curr) {
        var tooltip = '';
        tooltip = '<div class="toolTipWrap"><p class="popUpTitle">Comments</p><span class="icons_sprite removeIcon toolTipCloseIcon fa fa-remove"></span>';
        tooltip += '<br><br><div class="toolTipWrap textarea-1">';
        tooltip += '<div class="commentTextAreaWrap"><p>Write New Comment: </p><textarea maxlength="256" data-rowIndex="'
            + rowIndex + '" rows="15" cols="80" class="tooltipTextarea"></textarea></div></div>';
        tooltip += '<div class="conversationWrapper"><table class="display dataTable'
            + ' cell-border orangeTable no-footer m_10p" id="conversationHistGrid" cellspacing="0" cellpadding="0" >'
            + '<thead><tr><th class="greyHeader"><span>User ID</span></th><th class="greyHeader">'
            + '<span>Company</span></th><th class="greyHeader commentCov"><span>Comment</span></th><th class="greyHeader">'
            + '<span>Date</span></th></tr></thead><tbody>';
        $.each(response.responseData, function(i, value) {
            tooltip += '<tr>';
            tooltip += '<td>' + value.changedBy + '</td>' + '<td>' + value.bookingOfficeCode + '</td>'
                + '<td class="commentCov">' + value.allocationComment + '</td>' + '<td class="numericField">'
                + value.changedDate + '</td>';
            tooltip += '</tr>';
        });
        tooltip += '</tbody></table></div><div class="clearAll"></div></div>';
        tooltip += '<div class="submitFromData tooltipSubmitFormData"><div class="formSubmitButtons">';
        if ($('#sec').val() === 'Write' || $('#sec1').val() === 'Write') {
            tooltip += '<a href="javascript:void(0)" class="orangeButton saveButton updateAllocComment">Ok</a>';
        }
        tooltip += '<a href="javascript:void(0)" class="cancelButton cancelAllocComment">Cancel</a></div></div>';
        return tooltip;
    }
    /* Schedule Init.js Datas Starts */
    // Show Voyage Details.
    function toolTipContent(scheduleHeaderNames, trade, vesselName, vesselVoyage, voyageNumber, master, operator,
        spaceCharterWith, ltCharterFrom, operatedBy, startDate, plannedVoyageSpeed, superIntendent, intDistribution,
        pubDistribution, voyageComments, maxCargoHeight, maxRampWeight) {
        var voyageWrap;
        plannedVoyageSpeed = (plannedVoyageSpeed) ? plannedVoyageSpeed + ' Knots' : '';
        voyageWrap = '<div class="voyageDescData"><span class="icons_sprite leftArrowIcon"></span>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="rowItem colOdd"><label class="spaceWrap pageTitle">' + scheduleHeaderNames.trade
            + ':</label><div class="formInputWrap pageTitle">' + trade + '</div></div>';
        voyageWrap += '<div class="rowItem colEven"><label class="spaceWrap pageTitle">'
            + scheduleHeaderNames.vesselVoyage + ':</label><div class="formInputWrap pageTitle">' + vesselName + ' ('
            + vesselVoyage + ') / ' + voyageNumber + '</div></div>';
        voyageWrap += '</div>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">' + scheduleHeaderNames.master
            + ':</label><div class="formInputWrap SchedulePopUpBreakWord">' + master + '</div></div>';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">' + scheduleHeaderNames.operator
            + ':</label><div class="formInputWrap">' + operator + '</div></div>';
        voyageWrap += '</div>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.spaceCharterWith + ':</label><div class="formInputWrap">' + spaceCharterWith
            + '</div></div>';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.ltCharterFrom + ':</label><div class="formInputWrap">' + ltCharterFrom
            + '</div></div>';
        voyageWrap += '</div>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.operatedBy + ':</label><div class="formInputWrap">' + operatedBy + '</div></div>';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.superIntendent + ':</label><div class="formInputWrap">' + superIntendent
            + '</div></div>';
        voyageWrap += '</div>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">' + scheduleHeaderNames.startDate
            + ':</label><div class="formInputWrap">' + startDate + '</div></div>';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.plannedVoyageSpeed + ':</label><div class="formInputWrap">' + plannedVoyageSpeed
            + '</div></div>';
        voyageWrap += '</div>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="singleColFormRow formRow"><label>Distribution:</label>'
            + '<div class="formInputWrap doubleInput radioItem">'
            + '<div><input type="checkbox" id="distInternalStatus" disabled="disabled"' + intDistribution
            + '><label for="distInternalStatus">Internal</label></div>';
        voyageWrap += '<div><input type="checkbox" id="distPublicStatus" disabled="disabled"' + pubDistribution
            + '><label for="distPublicStatus">Public</label></div></div></div></div>';
        voyageWrap += '<div class="formRow">';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.maxCargoHeight + ':</label><div class="formInputWrap">' + maxCargoHeight
            + '</div></div>';
        voyageWrap += '<div class="singleColFormRow formRow"><label class="spaceWrap">'
            + scheduleHeaderNames.maxRampWeight + ':</label><div class="formInputWrap">' + maxRampWeight
            + '</div></div>';
        voyageWrap += '</div>';
        voyageWrap += '<div class="formRow"><div class="singleColFormRow formRow width100per">'
            + '<label class="spaceWrap">' + scheduleHeaderNames.voyageComments
            + ':</label><div id="sComments" class="formInputWrap SchedulePopUpBreakWord">' + voyageComments
            + '</div></div></div>';
        return voyageWrap;
    }
    function showAllocDirtyFlagMessage(clickedVoyage, triggerSource) {
        // Initializing Popup
        $('#allocDialog-confirm').dialog(
            {
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
                        $(this).dialog('close');
                        nsSchedule.allocFlag = 0;
                        nsSchedule.saveAllocations();
                    },
                    'No' : function() {
                        $(this).dialog('close');
                        nsSchedule.allocFlag = 0;
                        if (triggerSource === 'navigation') {
                            nsCore.navigateToClickedPath(nsSchedule.clickedLinkPath);
                        } else if (triggerSource === 'newSearch') {
                            $('.newSearch').trigger('click');
                        } else if (triggerSource === 'refreshTab') {
                            nsSchedule.getAllocationTab(clickedVoyage);
                        } else {
                            if (triggerSource === 'selectVoyage') {
                                $('.voyageContentListCol.voyageNbrsCntnt [data-voyageid="' + clickedVoyage + '"]')
                                    .trigger('click');
                            }
                        }
                    }
                }
            });
        $('#allocDialog-confirm').dialog('open');
    }
    $.extend(true, nsSchedule, scheduleObj);
})(this.schedule, this.core, this.vmsService, jQuery);
