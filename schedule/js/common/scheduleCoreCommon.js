/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsSchedule, nsCore, vmsService, $) {

    var oTable,
        lastVoyageNo,
        checkVoyage = '',
        vesselPositionAddDirtyFlag = 0,
        scheduleObj = {},
        tableApi,
        security,
        loadCount = 0,
        isExcel = false,
        changedRow,
        vesselPositionResponse,
        dateFormat = localStorage.getItem('dateFormat'),
        userDateFormat = nsCore.returnDate(dateFormat),
        schTimeFormat = localStorage.getItem('timeFormat'),
        fDateFormat = userDateFormat +' '+ schTimeFormat,
        VesselVoyageTcn ='',
        normalDialogOpts = {
            'modal': true,
            'autoOpen': false,
            'resizable': 'false',
            'draggable': 'false',
            'width': '85%',
            'data-schedule': '',
            'open': function() {
                $('.ui-dialog-titlebar').hide();
                $('#ui-dialog-title-dialog').hide();
            }
        },
        scheduleHeaderNames = {
            'trade': 'Trade',
            'vesselVoyage': 'Vessel/Voyage',
            'master': 'Master',
            'operator': 'Global Vessel Operator',
            'spaceCharterWith': 'Space charter with',
            'ltCharterFrom': 'L/T charter to',
            'operatedBy': 'Operated by',
            'superIntendent': 'Superintendent',
            'startDate': 'Start date',
            'plannedVoyageSpeed': 'Planned voyage speed',
            'distribution': 'Distribution',
            'maxCargoHeight': 'Max Opening Height',
            'maxRampWeight': 'Max Ramp Weight',
            'voyageComments': 'Voyage comments'

        };
    nsSchedule.allocFlag = 0;
    nsSchedule.selectedVoyageRow = '';
    function checkedVal(data) {
        return (data ? 'checked' : '');
    }
    
    function setDirtyFlag(){
    	nsSchedule.fnTriggeredChangeModuleVessel($(this).closest('td'));
    	nsSchedule.vesselPositionDirtyFlag = 1;
    }

    function timeZoneFilter(data) {
        var timeZone = data.substring(1, 4),
            check = data.substring(4, 5);
        if (timeZone === 'GMT' && check === ')') {
            timeZone = '00:00';
            return timeZone;
        } else if(data === '(Select)'){
            return data;
        } else{
            timeZone = data.substring(4, 10);
            return timeZone;
        }
    }

    function adjustWrappers(thisEle) {
        $(thisEle).toggle('slide', 'left');
        $(thisEle).toggleClass('activeMenu');
        if ($(thisEle).hasClass('activeMenu')) {
            $('.vesselAccordionWrapper').addClass('compressedState').removeClass('expandState');
            $('.vesselListColWrap').toggle();
            $('.vesselColContentWrapper').addClass('expandWrapper');
        } else {
            $('.vesselAccordionWrapper').addClass('expandState').removeClass('compressedState');
            $('.vesselListColWrap').toggle();
            $('.vesselColContentWrapper').removeClass('expandWrapper');
        }
    }
    
    //hides allocTable sum footer in schedule tab
    function hideAllocFooter(){
        $( "#tabs" ).on( "tabsactivate", function( event, ui ) {        
           var allocTable = $('#vesselVoyageGridTable').DataTable();
           var tableContainer = $(allocTable.table().container());
           if (ui.newPanel.attr('id')==='tabs-2'){
               tableContainer.css( 'display','none' );
               allocTable.fixedHeader.adjust();
           }else{
               tableContainer.css( 'display','block' );
               allocTable.fixedHeader.adjust();
           }
           $('.fixedHeader-floating').css('width', $('#vesselVoyageGridTable').css('width'));
        });
   
  }
    // Load pop up data in schedule
    function showVoyageDetailsPopup(voyageData, currentEle) {
        var trade = voyageData.tradeCode,
            vesselVoyage = voyageData.vesselCode,
            master = (!voyageData.master ? '' : voyageData.master),
            operator = (!voyageData.operator ? '' : voyageData.operator),
            spaceCharterWith = (!voyageData.spaceCharterWith ? '' : voyageData.spaceCharterWith),
            ltCharterFrom = (!voyageData.ltCharterFrom ? '' : voyageData.ltCharterFrom),
            operatedBy = (!voyageData.operatedBy ? 'Hoegh Autoliners' : voyageData.operatedBy),
            superIntendent = (!voyageData.superIntendent ? '' : voyageData.superIntendent),
            startDate = voyageData.startDate,
            plannedVoyageSpeed = (!voyageData.plannedVoyageSpeed ? '' : voyageData.plannedVoyageSpeed),
            pubDistribution = (voyageData.pubDistribution === 'Y' ? 'Checked' : ''),
            intDistribution = (voyageData.intDistribution === 'Y' ? 'Checked' : ''),
            voyageComments = (!voyageData.voyageComments ? '' : voyageData.voyageComments),
            voyageNumber = (!voyageData.voyageNo ? '' : voyageData.voyageNo),
            ele = $('.toolTipWrapper'),
            vesselName = (!voyageData.vesselName ? '' : voyageData.vesselName),
            maxCargoHeight = (!voyageData.maxCargoHeight ? '' : voyageData.maxCargoHeight),
            maxRampWeight = (!voyageData.maxRampWeight ? '' : voyageData.maxRampWeight),
            toolTip ='';
            if(spaceCharterWith==='' && ltCharterFrom===''){
                operatedBy='Hoegh Autoliners';
            }
            toolTip = nsSchedule.toolTipContent(scheduleHeaderNames, trade, vesselName, vesselVoyage, voyageNumber,
                master,operator, spaceCharterWith, ltCharterFrom, operatedBy, startDate, plannedVoyageSpeed,
                superIntendent, intDistribution, pubDistribution, voyageComments, maxCargoHeight, maxRampWeight);

        $('.toolTipWrapper').html(toolTip).show().css('min-width', '75%');

        $(ele).position({
            my: 'left+10 top',
            at: 'right top-10',
            collision: 'flipfit',
            of: $(currentEle)
        });
        $('.leftArrowIcon').position({
            my: 'left+10 top',
            at: 'right-11 top+13',
            collision: 'flipfit',
            of: $(currentEle)
        });
    }

    function loadMaintainVesselTable(scheduleData, disableMode) {
        var maintainTableElement = $('#maintainVesselPositionGrid');
        vesselPositionAddDirtyFlag = 0;
        $('#disVesselCode').html('Vessel Position ' + scheduleData.vesselName + ' (' + scheduleData.vesselCode
            + ') / ' + scheduleData.voyageNo);

        if ($.fn.DataTable.fnIsDataTable(maintainTableElement)) {
            $('#maintainVesselPositionGrid').dataTable().fnClearTable();
            $('#maintainVesselPositionGrid').dataTable().fnDestroy();
        }
        // Main Maintain Vessel Table load.
        vmsService.vmsApiServiceLoad(function(response) {
            var i, vesselPosition;
            if(response){

                nsSchedule.vesselPositionResponse = response;
                vesselPosition = nsSchedule.vesselPositionResponse.responseData.vesselPositionList;
                nsSchedule.VesselVoyageTcn = response.responseData.timeStamp;
                lastVoyageNo = 0;
                for (i = 0; i < vesselPosition.length; i++) {
                    if (parseInt(lastVoyageNo) < parseInt(vesselPosition[i].voyageNo)) {
                        lastVoyageNo = vesselPosition[i].voyageNo;
                        $.extend(true, nsSchedule, {'lastVoyageNo': lastVoyageNo});
                    }
                }
                nsSchedule.selectedVoyageRow = response.responseCode;
                $('.defaultSearchMsg').hide();
                if($('.singleVoyageItem').length > 0) {
                	loadMaintainVesselDataTable(1, vesselPosition, scheduleData.voyageNo, disableMode,response.responseCode,scheduleData.vesselCode);
                } else {
                	$('.vesselContentWrapperSubDiv').hide();
                }
            } else {
                nsCore.showAlert(nsSchedule.errorMsg);
            }
        }, nsSchedule.maintainVessel, 'POST', JSON.stringify(scheduleData));

    }

    function loadMaintainVesselDataTable(data, vesselPosition, voyageNo, disableMode, selectedVoyageRow,vesselCode) {
        var table = $('#maintainVesselPositionGrid'),
        	expCol = '', wrapId ='';
        if(nsSchedule.updateVoyageNo !== voyageNo){
        	$('#expand').prop('checked', false);
        }
        vesselPosition.sort(function(a,b){
            return a.rowId - b.rowId;
        });
        $('.customTooltip').remove();
        if ($.fn.DataTable.fnIsDataTable(table)) {
            $('#maintainVesselPositionGrid').dataTable().api().clear();
            $('#maintainVesselPositionGrid').dataTable().api().destroy();
        }
        nsSchedule.oTable = $('#maintainVesselPositionGrid').DataTable({
            'processing': true,
            'serverSide': false,
            'tabIndex': -1,
            'bSortable': false,
            'sSortAsc':false,
            "orderClasses": false,         
            'order': [
                [
                    21, 'asc'
                ]
            ],
            'orderFixed': [
                21, 'asc'
            ],
            'info': false,
            'dom': 'Brtip',
            'buttons': [
                {
                text: '<span class="icons_sprite buttonIcon exportExcelIcon fa fa-file-excel-o"></span>Export to Excel',
                className: 'exportExcelLnk  lightGreyGradient normalBtnLink',
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [  0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,18 ],
                    format: {
                        body: function ( dataEle, row, column, node ) {
                            // Strip $ from salary column to make it numeric
                             if ($(dataEle).is('input:checkbox')) {
                                 return ($(dataEle).is(':checked') ? 'Yes' : 'No');
                                 // for Checkboxes
                             } else if ($(dataEle).find('input:text').length > 0) {
                                 return $(dataEle).find('input:text').val();
                                 // for DateTime boxes
                             } else if ($(dataEle).is('input:text')) {
                                 return $(dataEle).val();
                                 // for text boxes
                             } else {
                                 return dataEle;
                                 // for others
                             }
                        },
                        header: function ( dataEle, column ) {
                            var cusHeader = ['Voyage', 'Port name', 'Arrival', 'Departure','Days', 'L', 'D', 'Port comment',
                                'Ct', 'Bc', 'Rc', 'De', 'Re', 'Dd', 'Regional comment', 'Cancelled',
                                'Port captain', 'Operator', 'TZ', 'Delete'];
                            if (typeof dataEle !== 'undefined') {
                                if (dataEle !== null) {
                                    
                                        return cusHeader[column];  //get rid of the changed manually column
                                    
                                }
                            }
                            return dataEle;
                        }
                    }
                },
                title: 'Schedule_'+vesselCode
             }],
            'autoWidth': false,
            "paging":   false,
            'scrollX': false,            
            'scrollCollapse': true,
            'data': vesselPosition,
            "rowCallback" : function(row) {
                $(row).attr('data-edited', 'false');
            },
            'fnDrawCallback': function() {
                var api;
                $('.departureDateTime,.arrivalDateTime').datepicker({
                    changeYear: true,
                    dateFormat: localStorage.getItem('dateFormat'),
                }).datepicker();
                $('.arrTime, .depTime').timepicker({
                    timeFormat: localStorage.getItem('timeFormat'),
                    interval: 15,
                    minTime: '12:00am',
                    maxTime: '11:45pm',
                    defaultTime: $(this).val(),
                    startTime: '12:00am',
                    dynamic: false,
                    dropdown: true,
                    scrollbar: true,
                    change: setDirtyFlag
                });
                api = this.api();
                if (changedRow) {
                    api.scroller().scrollToRow(changedRow);
                    $('#maintainVesselPositionGrid tbody tr:eq(' + changedRow + ')')
                    .find('input.portNameVal').focus();
                    changedRow = '';
                }
            },
            'columnDefs': [{
                'orderable': false,
                'targets': [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
                ]
            }, {
                'targets': [
                    8, 9, 10, 11, 12, 13
                ],
                'visible': false,
                'className': 'toggleCols'
            }, {
                'targets': [
                    2, 3
                ],
                'width': '75px'
            }, {
                'targets': [
                    6, 13
                ],
                'class': 'flexibleCol'
            },
            ],
            "createdRow" : function(row, datacols) {
                var editedCols, i;
                // To Apply Blue Edited border for edited columns during re-render.
                if (datacols.edited) {
                    editedCols = datacols.edited.split(',');
                    // Check if it not an empty Array
                    for (i in editedCols) {
                        if (editedCols.hasOwnProperty(i)) {
                            $(row).find('td:eq(' + editedCols[i].substring('1') + ')').addClass('editBordr');
                        }
                    }
                }
            },
            fnInitComplete : function() {
                var tableData;
                $('th').unbind('keypress');
                $('.portComment').tooltip();
                $('.vesselVoyageWrapper').find('.showHide').removeClass('vesselDataCollapse')
                    .addClass('vesselDataExpand').text('Expand');
                $('.vesselVoyageWrapper').find('.colspanExpand').attr('colspan', '5');
                if (disableMode === 'true'||!$('#sec').val()) {
                    nsSchedule.customDisableEle(true);
                    //fix to disable to too many records across scroll
                    $('#maintainVesselPositionGrid_wrapper .dataTables_scrollBody').scroll(function(){
                        nsSchedule.customDisableEle(true);
                    });
                }
               nsSchedule.tableApi = $('#maintainVesselPositionGrid').dataTable().api();
                tableData = nsSchedule.tableApi.rows({ order: 'applied' }).data();
                $.each(tableData, function(rowNum, rowdata) {
                    var rowEle = $(nsSchedule.tableApi.row(rowNum).node());
                    if (rowEle.find('.portcallCancel').is(':checked')) {
                        rowEle.addClass('cancelledPortCall');
                    }
                    if (rowdata.error) {
                    	nsSchedule.selectedVoyageRowNum = rowdata.rowId;
                        $.each(rowdata.validationMessageList, function(j, obj) {
                            var errorCell = rowEle.find('td:eq(' + obj.columnName + ')');
                            errorCell.addClass('redBordr').attr('title', obj.errorMessage)
                                .attr('data-html','true').tooltip({
                                    tooltipClass: 'customTooltip',
                                    content: function() {
                                        return this.getAttribute('title');
                                    }
                                });
                            $(errorCell).on('mouseenter', function() {
                                $('.customTooltip').css('display', 'inline').show();
                            });
                            $(errorCell).on('mouseleave, change', function() {
                                $('.customTooltip').css('display', 'none').hide();
                            });
                        });
                    } else {
                        $('.customToolTip').css('display', 'none');
                    }
                });
                // ToCheck
                $(this).dataTable().api().columns.adjust();
                nsSchedule.adjustExportBtnPosition('.vesselColContentWrapper .buttonsList', 'maintainVesselPositionGrid');
                //VMSAG-5115
                if(selectedVoyageRow && nsSchedule.selectedVoyageRowNum){
                    $('html, body').animate({
                    scrollTop: $('#maintainVesselPositionGrid tbody tr:nth-child('+(parseInt(selectedVoyageRow || nsSchedule.selectedVoyageRowNum)+1)+')').offset().top
                }, 400);    
                }
            },
            'columns': [{
                        data : 'voyageNo',
                        'sWidth' : '40px',
                        "render" : function(dataGrid, type, full) {
                            var canEditVoyage = ((full.editable === 'Y') ? '' : 'readonly="readonly"');
                            var canEditVoyageEnable = ((full.editable === 'N' || full.bookingCount > 0) ? '' : 'enableField');
                            return '<input class="voyageNum numericField '+canEditVoyageEnable+'"  maxlength="4" type="text" '
                                + canEditVoyage + ' value="' + dataGrid + '">';
                        }
                    },{
                data: 'portName',
                'width': '110px',
                'sClass': 'iconCell',
                "render" : function(dataPortName, type, full) {
                    if (!dataPortName) {
                        dataPortName = '';
                    }
                    if(full.bookingCount > 0){
                        return '<input type="text" class="portNameVal" disabled value="'
                        + dataPortName + '">';
                    } else {
                        return '<input type="text" class="portNameVal enableField" value="'
                        + dataPortName + '">';
                    }
                }
            }, {
                data: 'arrivalDate',
                'sWidth': '95px',
                sClass: 'timepickerCell datePickerCell',
                "render" : function(dataArrivalDate) {
                	var date ='',time='';                		
            		if(dataArrivalDate){                		
                		date =dataArrivalDate.split(' ')[0],
            			time = dataArrivalDate.split(' ')[1] + ' ' + (dataArrivalDate.split(' ')[2] || '');
                		}
                    return '<div class="width100per datePickerInpWrap"><input '
                    +'class="arrivalDateTime width65per dateTimeBox" name="arrivalDateTime[1]" type="text" value="'
                    + date + '"><input class="arrTime timePickerWidth dateTimeBox" type="text" value="'+time+'"></div>';
                }
            }, {
                data: 'departureDate',
                'sWidth': '95px',
                sClass: 'timepickerCell datePickerCell',
                'render': function(datadepDate) {
                	var date ='',time='';
                	if(datadepDate){
                	    date = datadepDate.split(' ')[0],
                		time = datadepDate.split(' ')[1] + ' ' + (datadepDate.split(' ')[2] || '');
                	}
                    return '<div class="width100per datePickerInpWrap"><input '
                    + 'class="departureDateTime width65per dateTimeBox" name="departureDateTime[1]" type="text" value="'
                    + date + '"><input class="depTime dateTimeBox timePickerWidth"  type="text" value="'+time+'"><div class="datePickerIconWrap"  data-click ="dateTimePicker">'
                    + '</div></div>';
                }
            }, {
                data: '',
                'sClass': 'addRemoveCell',
                'sWidth': '70px',
                "render" : function() {
                    var canDelete = (disableMode === 'true' ? 'hide' : '');
                    return '<input type="text" class="w50p numericField" maxlength="3" value=""><div class="'
                        + canDelete + ' positionStyle addRemoveIcons"><span class="' + canDelete
                        +' subInput arthIcon fa fa-minus" data-op="dec"></span><span class="' + canDelete
                        +' addInput arthIcon fa fa-plus" data-op="inc"></span></div>';
                }
            }, {
                data: 'load',
                'sWidth': '5px',
                sClass: 'loadCall checkboxAlign',
                "render" : function(dataLoad, type, full) {
                    var checked = checkedVal(dataLoad),
                        disabled = "",
                        tmpCheck = checked;
                    if ((parseInt(full.voyageNo) > parseInt(voyageNo))|| full.loadPortBookingCount>0) {
                        disabled = 'Disabled';
                    }
                    return '<input type="checkbox"' + tmpCheck + ' value="' + dataLoad + '" '+ disabled+ '>';
                }
            }, {
                data: 'discharge',
                'sWidth': '5px',
                sClass: 'dischargeCall checkboxAlign',
                "render" : function(dataDischarge, type, full) {
                    var checked = checkedVal(dataDischarge),
                        disabled = '',
                        tmpCheck = checked;
                    if ((parseInt(full.voyageNo) < parseInt(voyageNo))||full.dischargePortBookingCount>0) {
                        disabled = 'Disabled';
                    }
                    return '<input type="checkbox"' + tmpCheck + ' value=" ' + dataDischarge +'"  ' +disabled+ '>';
                }
            }, {
                data: 'portComment',
                'sWidth': '80px',
                'defaultContent': '',
                "render" : function(dataportComm) {
                    if (!dataportComm) {
                        dataportComm = '';
                     }
                    return '<input type="text" maxlength="256" class="portComment" '
                        + (dataportComm === ' ' ? '' : 'title="'+ dataportComm + '"')
                        + 'value="' + (dataportComm === ' ' ? '' : dataportComm) + '">';
                 }
            }, {
                data: 'canTransit',
                'sWidth': '5px',
                "render" : function(dataconTransit) {
                    var checked = checkedVal(dataconTransit);
                    return '<input type="checkbox"' + checked + ' value="' + dataconTransit + '">';
                },
                sClass: 'checkboxAlign'
            }, {
                data: 'bunkerCall',
                'sWidth': '5px',
                "render" : function(dataunkerCall) {
                    var checked = checkedVal(dataunkerCall);
                    return '<input type="checkbox"' + checked + ' value="' + dataunkerCall + '">';
                },
                sClass: 'checkboxAlign'
            }, {
                'sClass': 'collapseData checkboxAlign',
                'sWidth': '5px',
                data: 'regCall',
                "render" : function(datacoll) {
                    var checked = checkedVal(datacoll);
                    return '<input type="checkbox"' + checked + ' value="' + datacoll + '">';
                }
            }, {
                'sClass': 'collapseData checkboxAlign',
                'sWidth': '5px',
                data: 'delivery',
                "render" : function(datacolData) {
                    var checked = checkedVal(datacolData);
                    return '<input type="checkbox"' + checked + ' value="' + datacolData + '">';
                }
            }, {
                'sClass': 'collapseData checkboxAlign',
                'sWidth': '5px',
                data: 'reDelivery',
                "render" : function(datareDel) {
                    var checked = checkedVal(datareDel);
                    return '<input type="checkbox"' + checked + ' value="' + datareDel + '">';
                }
            }, {
                'sClass': 'collapseData checkboxAlign',
                'sWidth': '5px',
                data: 'dryDock',
                "render" : function(dataDrydock) {
                    var checked = checkedVal(dataDrydock);
                    return '<input type="checkbox"' + checked + ' value="' + dataDrydock + '">';
                }
            }, {
                data: 'regComments',
                'sWidth': '100px',
                'defaultContent': '',
                "render" : function(dataregComm, type, full) {
                    var comments = dataregComm,
                        disabled = '';
                    if (full.load === false && full.discharge === false) {
                        comments = '';
                        disabled = 'disabled';
                    }
                    if (!comments) {
                        comments = '';
                    }
                    return '<input type="text" class="regComm enableField" maxlength="256" value="' + (comments === ' ' ? '' : comments) + '" ' + disabled + '>';
                }
            }, {
                data: 'cancelled',
                'sWidth': '20px',
                "render" : function(dataCancelled) {
                    var checked = checkedVal(dataCancelled),
                        highLightCancel = '';
                    if (checked === 'checked') {
                        highLightCancel = 'cancelledPortCall';
                    }
                    return '<input  class="pcml5px portcallCancel " '+ highLightCancel + ' type="checkbox"'
                        + checked + ' value="' + dataCancelled + '" >';
                }
            }, {
                data: 'portCaptain',
                'width': '50px',
                'defaultContent': '',
                "render" : function(dataportCap) {
                    if (!dataportCap) {
                        dataportCap = '';
                    }
                    return '<input type="text"  maxlength="10" class="portCaptainData w60p" value="'
                    + (dataportCap.trim()) + '">';
                }
            }, {
                data: 'operator',
                'width': '50px',
                "render" : function(dataoperator) {
                    if (!dataoperator) {
                        dataoperator = '';
                    }
                    return '<input type="text"  maxlength="10" class="operatorData w60p" value="'
                    + (dataoperator.trim() )+ '">';
                }
            }, {
                data: 'timeZone',
                'sClass': 'timeZoneData',
                'width': '30px',
                'defaultContent': '',
                "render" : function(datatimeZone, type, full) {
                    if (!datatimeZone) {
                        datatimeZone = '';
                    } else {
                        datatimeZone = timeZoneFilter(datatimeZone);
                    }
                    return '<input  type="text" class="portTimeZone w60p" readonly value="'
                    + datatimeZone + '">';
                }
            },{
                data: 'timeZone',
                'sClass': 'deleteData',
                'width': '15px',
                'defaultContent': '',
                "render" : function(datatimeZone, type, full) {
                    var canDelete = (disableMode === 'true' ? 'hide' : ''), bookCheck = '';
                    if (full.loadPortBookingCount > 0 || full.dischargePortBookingCount > 0 ||full.bookingCount>0 ) {
                        bookCheck = 'cursorDisabled';
                    }                    
                    return '<span class="'
                    + canDelete + ' '+ bookCheck + ' icons_sprite rowRemoveIcon removePortcall fa fa-remove"></span>';
                }
            },{
                
                data: 'portName',
                'sClass': 'iconCell alignIcon',
                'sWidth': '30px',
                  
            "render" : function(dataPortName,  type, full) {
                var canDelete;
                if (!dataPortName) {
                    dataPortName = '';
                }
                canDelete = (disableMode === 'true') ? 'hide' : '';
                return '<div class="rowAddition positionStyle icons_sprite addBelowRowIcon  " style="cursor:pointer" '+ canDelete
                + '   data-op="dec">'
                +'<span class="fa fa-plus"></span></div>';
               
            }
                
            }, {
                data: 'rowId',
                'sClass': 'hide rowId'
            }, {
                data: 'edited',
                'sClass': 'hide',
                'defaultContent': ''
            }]
        });
        expCol = ($('#expand').is(':checked') ? 'expand' : 'collapse');
        wrapId = "maintainVesselPositionGrid_wrapper";
    	nsSchedule.checkExpandCollapseGrid(wrapId, expCol);
    }

    $(document).ready(function() {
        var currDialogObj; //headerTagHt = $('header').outerHeight(),
        nsCore.loadUI(nsCore.getPage(window.location.href));
        $( "#tabs" ).tabs();
        hideAllocFooter();
        $(document).on('change', '.departureDateTime, .arrivalDateTime, .arrTime, .depTime', function(){
        	nsSchedule.fnTriggeredChangeModuleVessel($(this).closest('td'));
        })
        $(document).on('mouseleave', '.voyageNum', function(){
        	$('.customTooltip').css('display','none').hide();
        })
        $(document).keyup(function(e){
            if(e.keyCode === 27){
                $('#newVesselVoyageSchedulePopup').dialog('close');
                $('.modelPopupBground').hide();
            }
        });
        // Code for loading the status bar
        $(document).ajaxSend(function(event, xhr, options) {
            if (options.loading) {
                loadCount++;
                $('.preloaderWrapper').show();
            }
        }).ajaxComplete(function(event, xhr, options) {
            if (options.loading) {
                loadCount--;
            }
            
            if(loadCount === 0){
                $('.preloaderWrapper').hide();
            }
        });
        nsCore.menuSelect('menuSch');
        currDialogObj = JSON.parse(JSON.stringify(normalDialogOpts));
        nsSchedule.security = $('#sec').val();
        if ((typeof nsSchedule.security === 'undefined') || nsSchedule.security === null || nsSchedule.security ==='') {
        	nsSchedule.security = 'true';
        }

        currDialogObj.width = '35%';
        $('#confirmDialogPopup').dialog(currDialogObj);
        $(document).on('click', '.expandTableCheck', function() {
            var opType = ($(this).hasClass('vesselDataExpand') ? 'expand' : 'collapse'),
                wrapperId = "maintainVesselPositionGrid_wrapper";
            nsSchedule.checkExpandCollapseGrid(wrapperId, opType);
        });
        $(document).on('click', '.showColumnsCb', function() {
            $('.showHide').trigger('click');
        })
        // Expand and collapse functionality
        $(document).on('click', '.showHide', function() {
            var opType = ($(this).hasClass('vesselDataExpand') ? 'expand' : 'collapse'),
                wrapperId = $(this).closest('.dataTables_wrapper').attr('id');
            nsSchedule.checkExpandCollapseVessel(wrapperId, opType);
        });

        // Filter Action Click Event
        $(document).on('click', '.filterActionLink', function(e) {
            e.stopPropagation();
            adjustWrappers($('.leftFilterMenuWrapper'));
            $(this).hide();
        });
        // Close Filter Menu
        $(document).on('click', '#closeFilterResults', function() {
            adjustWrappers($('.leftFilterMenuWrapper'));
            $('.filterActionLink').show();
        });
        $(document).on('click', '#closeSearchMenu', function() {
            $('.findSchedule,.newSearch').toggle();
            adjustWrappers($('.leftSearchMenuContent'));
            $('.filterActionLink').show();
        });
        $(document).on("mouseover", ".rd-container tbody td.rd-day-body", function(e){
            $(this).addClass('calendarHover');
        });
        $(document).on("mouseout", ".rd-container tbody td.rd-day-body", function(e){
            $(this).removeClass('calendarHover');
        });
        // To remove a Voyage from Voyages List
        $(document).on('click', '.voyageContentListCol.voyageNbrsCntnt .singleVoyageItem .rowRemoveIcon',
            function(e) {
                e.stopPropagation();
                if ($(this).hasClass('removeAllocationIcon')) {
                    nsSchedule.toDelete = $(this).closest('tr');
                } else if ($(this).hasClass('voyageRemoveIcon')) {
                    nsSchedule.toDelete = $(this).closest('.singleVoyageItem');
                } else if ($(this).closest('td').hasClass('addRemoveCell')) {
                    nsSchedule.toDelete = $(this).closest('tr');
                } else {
                    nsSchedule.toDelete = $(this);
                }
                $('#confirmDialogPopup').dialog('open');
                $('#confirmDialogForm').submit(function(ex) {
                    ex.preventDefault();
                    $(this).closest('.ui-dialog-content').dialog('close');
                });
            });
        // Reset Search
        $(document).on('click', '.resetSearch', function() {
            $('#tradeCode').val('');
            $('#tradeDesc').val('');
            $('#vesselCode').val('');
            $('#vesselName').val('');
            $('#lPort').val('');
            $('#lPortName').val('');
            $('#dPort').val('');
            $('#dPortName').val('');
            $('#fromDate').val($.datepicker.formatDate(localStorage.getItem('dateFormat'), new Date()));
        });
        // Searched Item Remove Event
        $(document).on('click', '.searchedItem .smallRemoveIcon', function() {
            var searchItem = $(this).closest('.searchedItem'),
                searchKey = searchItem.attr('data-searchkey');
            $(searchItem).remove();
            $('#leftSearchMenu').find('div.searchMenuItemWrap[data-searchkey="' + searchKey + '"]')
                .find('input,select').val('');
            $('#leftSearchMenu').submit();
        });
        // Default landing page with search open
        $('.newSearch').css('display', 'none');
        $('.findSchedule').css('display', 'block');
        adjustWrappers($('.leftSearchMenuContent'));
        // Left Menu
        $(document).on('click', '.newSearch', function() {
            var extraHeight;
            $('.statusMessageText').css('display', 'none');
            if($(".searchErrorMsg").is(":visible")){
                $("#vesselAccordion").hide();
	        }
	        else{
	            $("#vesselAccordion").show();
	        }
            if (nsSchedule.vesselPositionDirtyFlag === 1) {
                nsSchedule.checkVesselPositionDirtyFlagMessage('newSearch');
                $('#unsvDlgCnf').dialog('open');
                return false;
            } else {
                if (nsSchedule.allocFlag === 1) {
                    nsSchedule.showAllocDirtyFlagMessage(0, 'newSearch');
                    return false;
                }
            }
            adjustWrappers($('.leftSearchMenuContent'));
            if ($('.leftSearchMenuContent').hasClass('activeMenu')) {
                $('.filterActionLink,.leftFilterMenuWrapper').hide();
                $('.leftFilterMenuWrapper').removeClass('activeMenu');
            } else {
                $('.filterActionLink').show();
            }
            $('.findSchedule,.newSearch').toggle();
            if($('.voyageNbrsCntnt').is(":visible")){
            	$('.leftSearchMenuHeader').hide();
            } else{
            	$('.leftSearchMenuHeader').show();
            }
            $('.leftSearchMenuContent, .searchRes').show();
            extraHeight = parseInt($('.leftSearchMenuContent').height()) + 50;
            $('.mainSection').css('min-height', extraHeight + 'px');
        });
        $('.searchRes').click(function(){
        	$('.newSearch').trigger('click');
        })
        $('.datePickerInp').datepicker({
            changeYear: true,
            dateFormat: localStorage.getItem('dateFormat'),
        }).datepicker('setDate', new Date());
        $(document).on('click', '.datePickerIcon', function() {
            $(this).closest('.datePickerInpWrap').find('.datePickerInp').focus();
        });
        // To hide Popover
        $(document).on('mouseup', function(e) {
            var container = $('.toolTipWrapper');
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                container.hide();
            }
        });
        // To close the tooltipWrapper
        $(document).on('click', '.toolTipCloseIcon', function(e) {
            e.stopPropagation();
            $('.toolTipWrapper').hide();
        });
        $(document).on('click', '.dialogCloseIcon', function() {
            $(this).closest('.ui-dialog-content').dialog('close');
        });
        $(document).on('click', '.accHeader', function() {
            var canEditReqRead = $('#sec').val() ? 'disabled' : '';
            $(this).closest('.accElement').find('.accContent').slideToggle({
                // to Adjust Columns after Sliding Down.
                complete: function() {
                    nsSchedule.checkAndAdjustTableColumn('vesselVoyageGridTable', true,
                        '.allocationBtnWrapper .buttonsList');
                    nsSchedule.checkAndAdjustTableColumn('viewVesselPositionGrid', true,
                        '.viewVesselWrapper .buttonsList');
                }
            });
            if (!canEditReqRead ) {
                $('#vesselVoyageGridTable .allocCommentIconWrap').find('.commentEditIcon, .rowRemoveIcon').hide();
                $('#vesselVoyageGridTable').find('.bookingOfficeCode, .bookingOfficeName, .customerCode').prop('disabled', true);
            }
        });
        $(document).on('click', '.rowAddition', function(e) {
            var emptyRowParams = {},
                rowArr = [],
                operation = $(this).attr('data-op'),
                isDecrementOp = (operation === 'dec'),
                clickedData = nsSchedule.tableApi.row($(this).closest('tr')).data(),
                rowIdVal = parseInt($(this).closest('tr').index()),
                newRowIndex = (isDecrementOp ? rowIdVal + 1 : rowIdVal),
                orderedColumnData = nsSchedule.tableApi.column(0, {order: 'current' }).data(),
                prevVoyage = orderedColumnData[(rowIdVal - 1)],
                NextVoyage = orderedColumnData[(rowIdVal + 1)],
                currVoyage = orderedColumnData[rowIdVal],
                currDisable = ((rowIdVal === 0 || rowIdVal === (orderedColumnData.length - 1)) || (currVoyage === prevVoyage && currVoyage === NextVoyage) || currVoyage !== NextVoyage);
            clickedData.editable = (currDisable) ? 'N' : 'Y';
            $('.preloaderWrapper').show();
            $('[role=tooltip]').tooltip().hide();
            nsSchedule.vesselPositionDirtyFlag = 1;
            e.preventDefault();            
            emptyRowParams = JSON.parse(JSON.stringify(clickedData));
            emptyRowParams.rowId = newRowIndex;
            emptyRowParams.voyageNo = clickedData.voyageNo;
            emptyRowParams.arrivalDate = clickedData.arrivalDate;
            emptyRowParams.departureDate = clickedData.departureDate;
            emptyRowParams.portName = '';
            emptyRowParams.bookingCount='';
            emptyRowParams.loadPortBookingCount = '';
            emptyRowParams.dischargePortBookingCount = '';
            emptyRowParams.portCallID = '';
            emptyRowParams.portCallTcn = (parseInt(emptyRowParams.portCallTcn) + 1)+'';
            emptyRowParams.portCallVoyageID = '';
            emptyRowParams.timeZone = '';
            emptyRowParams.portComment = '';
            emptyRowParams.edited = 'E3,E4,';
            emptyRowParams.load = false;
            emptyRowParams.discharge = false;
            emptyRowParams.canTransit = false;
            emptyRowParams.bunkerCall = false;
            emptyRowParams.regCall = false;
            emptyRowParams.delivery = false;
            emptyRowParams.reDelivery = false;
            emptyRowParams.dryDock = false;
            emptyRowParams.regComments = '';
            emptyRowParams.editable = 'N';
            emptyRowParams.cancelled = false;
            emptyRowParams.portCaptain = '';
            emptyRowParams.operator = '';
            emptyRowParams.timeStamp = '0';
            changedRow = newRowIndex;
            rowArr = $('#maintainVesselPositionGrid').DataTable().data().toArray();
            rowArr.splice(newRowIndex, 0, emptyRowParams);
           
            $.each(rowArr, function(ind,val){
                val.rowId = ind;
            });
            rowArr.sort(function(a,b){
                return a.rowId - b.rowId;
            });
            $('#maintainVesselPositionGrid').DataTable().clear();
            $('#maintainVesselPositionGrid').DataTable().rows.add(rowArr);                      
            nsSchedule.tableApi = $('#maintainVesselPositionGrid').dataTable().api();
            nsSchedule.checkEditOnRowCreate();      
            $('.preloaderWrapper').hide();
        });
        $(document).on('click', '.cancelButton', function() {
            $(this).closest('.ui-dialog-content').dialog('close');
        });
        // ProtoType for adding & Subtracting Dates
        Date.prototype.addDays = function(days) {
            this.setDate(this.getDate() + days);
            return this;
        };
        Date.prototype.subtractDays = function(days) {
            this.setDate(this.getDate() - days);
            return this;
        };
        // Add & Remove Days Event
        $(document).on('click', '.arthIcon', function(e) {
            var numberEle = $(this).closest('td').find('input'),
                addVal = $(this).closest('td').find('input').val(),
                operation = $(this).attr('data-op'),
                isDecrementOp = (operation === 'dec'),
                currRow = nsSchedule.tableApi.row($(this).closest('tr')).index(),
                totalRows = nsSchedule.tableApi.data().length, exitingEdit,
                tableData, rowData, dateFields, count, i;
            e.preventDefault();
            function isvalid () {
                return currRow < totalRows;
            }
            tableData = nsSchedule.tableApi.rows({
                order: 'applied'
            }).data();
            if (isNaN(addVal) || (addVal % 1 !== 0) || addVal ==='' || addVal < 0) {
                nsCore.showAlert('Please enter a Valid Number');
                return false;
            }
            // Iterating through the necessary Rows
            while (isvalid()) {
                rowData = tableData[currRow],
                    count = 0,
                    i = 0;
                dateFields = [
                    'arrivalDate', 'departureDate'
                ];


                // $.each(dateFields, function(i, field)
                while (i < dateFields.length) {
                    if(rowData.arrivalDate && rowData.departureDate){
                        rowData = nsSchedule.addRemoveDays(addVal, isDecrementOp, rowData, count);
                    }
                    count++;
                    i++;
                }
                // Add Start & end dates to edited
                // columns
                exitingEdit = 'E3E4';
                rowData.edited = exitingEdit;
                $('#maintainVesselPositionGrid tbody tr:eq(' + currRow + ')').find('.datePickerCell')
                    .addClass('editBordr');
                currRow++;
            }
            nsSchedule.tableApi.rows().invalidate('data').draw();
            nsSchedule.vesselPositionDirtyFlag = 1;
            $('#maintainVesselPositionGrid').dataTable().api().scroller().scrollToRow(nsSchedule.selectedVoyageRow);
            $('#maintainVesselPositionGrid').DataTable().draw();
            numberEle.val('');
        });
        $('#maintainVesselPositionGrid').on('focus.autocomplete', '.portNameVal',
            function() {
                $('.portNameVal').autocomplete({
                    source: function(request,response) {
                        var count1, flagCodes = [],
                            i, timeZone = '';
                        vmsService.vmsApiService(function(data) {
                            if(data){
                                count1 = data.responseData.length;
                                for (i = 0; i < count1; i++) {
                                    timeZone = data.responseData[i].portTimeZone;
                                    if (timeZone === null) {
                                        timeZone = '';
                                    } else {
                                        timeZone = timeZoneFilter(timeZone);
                                    }
                                    flagCodes.push({
                                        prtCode: '' + data.responseData[i].portCode + '',
                                        name: data.responseData[i].portName,
                                        label: data.responseData[i].portName,
                                        timezone: timeZone
                                    });
                                }
                                response(flagCodes);
                            } else {
                                nsCore.showAlert(nsSchedule.errorMsg);
                            }
                        }, nsSchedule.portList, 'POST', JSON.stringify({portName: request.term }));
                    },
                    autoFocus: true,
                    delay: 0,
                    search: function(event) {
                        var rowData = $('#maintainVesselPositionGrid').dataTable().api().row($(this)
                                .closest('tr')).data();
                        if (event.keyCode !== '16' && event.keyCode !== '18' && event.keyCode !=='17' &&
                            event.keyCode !== '33' && event.keyCode !== '35' && event.keyCode !=='34' &&
                            event.keyCode !== '45' && event.keyCode !== '36' && event.keyCode !=='144') {
                            rowData.portCode = '';
                        }
                    },
                    select: function(event, ui) {
                        var rowData =$('#maintainVesselPositionGrid').dataTable().api().row($(this)
                                .closest('tr')).data();
                        rowData.portName = ui.item.name;
                        rowData.portCode = ui.item.prtCode;
                        rowData.timeZone = ui.item.timezone;
                        nsSchedule.vesselPositionDirtyFlag = 1;
                        $(this).val(ui.item.name);
                        $(this).closest('tr').find('.timeZoneData input').val(ui.item.timezone);
                        $(this).closest('td').removeClass('redBordr');
                        $(this).closest('td').removeAttr('title');
                    }
                });
                setTimeout(function() {
                    $(document).on('change', '.portNameVal', function() {
                        $('.ui-autocomplete').hide();
                    });
                }, 3000);
            });
        $('#leftSearchMenu').on('blur', '#tradeCode', function() {
            nsCore.delInvalidAutoFeilds('#tradeCode', '#tradeDesc',$(this).val(), JSON.parse(localStorage.tradeCode));
            $('#tradeCode').val === '' ? $('#tradeDesc').val('') : '';
            $('#tradeDesc').val === '' ? $('#tradeCode').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#tradeDesc', function() {
            nsCore.delInvalidAutoFeilds('#tradeCode', '#tradeDesc',$(this).val(), JSON.parse(localStorage.tradeName));
            $('#tradeCode').val === '' ? $('#tradeDesc').val('') : '';
            $('#tradeDesc').val === '' ? $('#tradeCode').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#vesselCode', function() {
            nsCore.delInvalidAutoFeilds('#vesselCode', '#vesselName',$(this).val(), JSON.parse(localStorage.vesselCodes));
            $('#vesselCode').val === '' ? $('#vesselName').val('') : '';
            $('#vesselName').val === '' ? $('#vesselCode').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#vesselName', function() {
            nsCore.delInvalidAutoFeilds('#vesselCode', '#vesselName',$(this).val(), JSON.parse(localStorage.vesselNames));
            $('#vesselCode').val === '' ? $('#vesselName').val('') : '';
            $('#vesselName').val === '' ? $('#vesselCode').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#lPort', function() {
            nsCore.delInvalidAutoFeilds('#lPort', '#lPortName',$(this).val(), JSON.parse(localStorage.portCodes));
            $('#lPort').val === '' ? $('#lPortName').val('') : '';
            $('#lPortName').val === '' ? $('#lPort').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#lPortName', function() {
            nsCore.delInvalidAutoFeilds('#lPort', '#lPortName',$(this).val(), JSON.parse(localStorage.portNames));
            $('#lPort').val === '' ? $('#lPortName').val('') : '';
            $('#lPortName').val === '' ? $('#lPort').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#dPort', function() {
            nsCore.delInvalidAutoFeilds('#dPort', '#dPortName',$(this).val(), JSON.parse(localStorage.portCodes));
            $('#dPort').val === '' ? $('#dPortName').val('') : '';
            $('#dPortName').val === '' ? $('#dPort').val('') : '';
        });
        $('#leftSearchMenu').on('blur', '#dPortName', function() {
            nsCore.delInvalidAutoFeilds('#dPort', '#dPortName',$(this).val(), JSON.parse(localStorage.portNames));
            $('#dPort').val === '' ? $('#dPortName').val('') : '';
            $('#dPortName').val === '' ? $('#dPort').val('') : '';
        });
        $(document).on('click', '#createSchedule', function() {
            nsSchedule.saveScheduleData();
        });
    });

    scheduleObj = {
        'checkVoyage': checkVoyage,
        'vesselPositionAddDirtyFlag': vesselPositionAddDirtyFlag,
        'fDateFormat': fDateFormat,
        'loadMaintainVesselTable' : loadMaintainVesselTable,
        'showVoyageDetailsPopup': showVoyageDetailsPopup,
        'normalDialogOpts' : normalDialogOpts,
        'dateFormat' : dateFormat,
        'userDateFormat' : userDateFormat,
        'vesselPositionResponse':vesselPositionResponse,
        'checkedVal':checkedVal,
        'timeZoneFilter':timeZoneFilter,
        'oTable':oTable,
        'tableApi':tableApi,
        'security':security,
        'isExcel' : isExcel,
        'loadMaintainVesselDataTable' : loadMaintainVesselDataTable,
        'selectedVoyage' : '',
        'VesselVoyageTcn':VesselVoyageTcn
    };

    $.extend(true, nsSchedule, scheduleObj);
})(this.schedule, this.core, this.vmsService, jQuery);