/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsSchedule, nsCore, vmsService, $) {
    var scheduleObj = {},isNotInitialLoad;
    // Edit a vessel voyage schedule
    $(document).on('click', '#editVesselVoyageScheduleLink', function() {
        var selectVoyage = nsSchedule.curVoyageNo,
            currDialogObj = JSON.parse(JSON.stringify(nsSchedule.normalDialogOpts)),
            searchCriteria = {
                voyageNo: nsSchedule.curVoyageNo,
                tradeCode: nsSchedule.curTradeCode,
                vesselCode: nsSchedule.curVesselCode,
                fromDate: $('#fromDate').val(),
                loadPort: $('#lPort').val(),
                discPort: $('#dPort').val()
            },
            schedule = {
                id: nsSchedule.clickedVoyage,
                searchCriteria: searchCriteria,
                dateFormat: nsSchedule.dateFormat,
                timeFormat: nsCore.timeFormat
            };
        nsSchedule.checkVoyage = nsSchedule.clickedVoyage;
        $('#errorMsg').html('');
        if (nsSchedule.vesselPositionDirtyFlag === 1) {
            nsSchedule.checkVesselPositionDirtyFlagMessage('editVoyage');
            $('#unsvDlgCnf').dialog('open');
            return false;
        } else{
            $('#editVesselVoyageSchedulePopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '85%',
                open: function() {
                    $('.ui-dialog-titlebar').hide();
                    $('#ui-dialog-title-dialog').hide();
                }
            });
        }
        $('#editScheduleUnit').find('input,select').val('');

        currDialogObj.height = parseInt($(window).outerHeight() * 0.9);
        currDialogObj.position = 'top center';
        $('#editVesselVoyageSchedulePopup').dialog(currDialogObj)
            .dialog('option', 'data-schedule', schedule).dialog('open');
        // Method to load voyage data on edit voyage popup
        nsSchedule.loadEditVoyageSchedule(nsSchedule.clickedVoyage, selectVoyage);
        // calling a method for loading Voyage Schedule data table in edit
        if(!$.isEmptyObject(nsSchedule.tVesselPositionResponse)){
            nsSchedule.loadEditVesselVoyageDataTable(nsSchedule.tVesselPositionResponse, selectVoyage);
        } else {
            nsSchedule.loadEditVesselVoyageDataTable(nsSchedule.vesselPositionResponse, selectVoyage);
        }
    });


  // triggered change on change of data in datetime picker
    function fnTriggeredChangeModuleVessel(obj) {
        var cellObj = nsSchedule.oTable.cell(obj),
            inputEle = $(cellObj.node()).find('input'),
            newVal = /*inputEle.val()*/ '',
            colIndex = cellObj.index().column,
            rowIndex = cellObj.index().row,
            rowNode = $(nsSchedule.oTable.row(rowIndex).node()),
            rowObj = nsSchedule.oTable.row(rowIndex).data(),
            nodeToUpdate = (inputEle.hasClass('arrivalDateTime') ? 'arrivalDate' : 'departureDate'),
            exitingEdit = nsSchedule.tableApi.cell(rowIndex, 20).data();

        nsSchedule.vesselPositionDirtyFlag = 1;
        newVal = $(obj.find('.dateTimeBox')[0]).val() + ' ' + $(obj.find('.dateTimeBox')[1]).val();

        rowObj[nodeToUpdate] = newVal;

        if (exitingEdit || (typeof exitingEdit === 'string')) {
            exitingEdit += ',';
        } else {
            exitingEdit = '';
        }
        exitingEdit += 'E' + (parseInt(colIndex) + 1);
        rowObj.edited = exitingEdit + ',' + rowObj.edited;
        // Operations Post Updating Values
        $(cellObj.node()).addClass('editBordr');
        rowNode.attr('data-edited', 'true');
    }
    /*
     * Initialization of the click on the date picker icon and hiding the other
     * opened datePickers
     */
    function fnInitializeDateClick(objDiv) {
        var currDateSibling = '',
            i = 0,
            prevDateElement, clickedVesselObjArr = [];
        $(document).find(objDiv).on('click', function(ev) {
            // to stop bubbling effect
            ev.stopPropagation();
            ev.preventDefault();
            prevDateElement = currDateSibling;
            currDateSibling = this.previousElementSibling;
            if (prevDateElement === currDateSibling) {
                rome(prevDateElement).show();
                prevDateElement = '';
            } else {
                // since date picker does not hide if we click on other pickers
                if (clickedVesselObjArr.length !== 0) {
                    i = 0;
                    do {
                        rome(clickedVesselObjArr[i]).hide();
                        clickedVesselObjArr.splice(i, 1);
                        i++;
                    } while (i < clickedVesselObjArr.length);
                    prevDateElement = '';
                }
                clickedVesselObjArr.push(currDateSibling);
                rome(currDateSibling).show();
            }
        });
    }

    function customDisableEle(disableMode) {

        $("#maintainVesselPositionGrid").find("input,button,textarea,select").prop("disabled", disableMode);

        $('.addAboveRowIcon').click(function() {
            return false;
        });
        $('.arthIcon').click(function() {
            return false;
        });
        $('.datePickerIcon').click(function() {
            return false;
        });
        $('.addBelowRowIcon').click(function() {
            return false;
        });
        $('.removePortcall').hide();
    }

    function customEdit(rowNum, hasVoyageErr) {
        var tableData=[], rowData, error, i = 0;
            rowData = tableData[rowNum]; error= rowData.isError;
        if (typeof error !== 'undefined' && !error) {
                for (i in rowData.validationMessageList) {
                    // iterate through the error messages
                    if (rowData.validationMessageList[i].columnName === 0) {
                        // assign true in case of voyage error
                        hasVoyageErr = true;
                        break;
                    }
                }
            }
            return hasVoyageErr;
    }

    function canEdit(rowNum) {
        var orderedColumnData = nsSchedule.tableApi.column(0, {
            order: 'current' }).data(),
            tableData = nsSchedule.tableApi.rows({ order: 'applied'}).data(),
            rowData = tableData[rowNum];
        var tableLength = orderedColumnData.length,
            prevVoyage = orderedColumnData[(rowNum - 1)],
            NextVoyage = orderedColumnData[(rowNum + 1)],
            currVoyage = orderedColumnData[rowNum],
            hasVoyageErr = false,
            i = 0,
            error = rowData.isError;


            if (typeof error !== 'undefined' && !error) {
                for (i in rowData.validationMessageList) {
                    // iterate through the error messages
                    if (rowData.validationMessageList[i].columnName === 0) {
                        // assign true in case of voyage error
                        hasVoyageErr = true;
                        break;
                    }
                }
            }

        if (hasVoyageErr) {
            // return readonly as false in case of voyage error
            return false;
        }
        return (
            (rowNum === 0 || rowNum === (tableLength - 1)) ||
            (currVoyage === prevVoyage && currVoyage === NextVoyage) ||
            (currVoyage !== prevVoyage && currVoyage !== NextVoyage)
        );
    }

    function checkVoyageEditables(currRowNum) {
        var tableLength = nsSchedule.tableApi.data().length,
            rowEle,
            effectedRows, result,
            rowEleTemp;
        if (currRowNum === 0) {
            effectedRows = [
                currRowNum, currRowNum + 1
            ];
        } else if (currRowNum === (tableLength - 1)) {
            effectedRows = [
                currRowNum, currRowNum - 1
            ];
        } else {
            effectedRows = [
                currRowNum, currRowNum - 1, currRowNum + 1
            ];
        }
        rowEleTemp = nsSchedule.tableApi.data().row(effectedRows[0]).node();
        $.each(effectedRows, function(i, rowNum) {
            rowEle = nsSchedule.tableApi.data().row(rowNum).node();
                result = canEdit(rowNum);
		    if(($(rowEleTemp).find('.voyageNum').val() === $(rowEle).find('.voyageNum').val()) && i !== 0){
		    	if(i === 1){
		    		if(nsSchedule.tableApi.data()[effectedRows[1]].timeStamp !== '0'){
		    			nsSchedule.tableApi.data()[effectedRows[0]].timeStamp = 
		    			nsSchedule.tableApi.data()[effectedRows[1]].timeStamp;
		    		}
		    	} else {
		    		if(nsSchedule.tableApi.data()[effectedRows[2]].timeStamp !== '0'){
		    			nsSchedule.tableApi.data()[effectedRows[0]].timeStamp = 
		    			nsSchedule.tableApi.data()[effectedRows[2]].timeStamp;
		    		}
		    	}
		    }
            $(rowEle).find('.voyageNum').prop('readonly', result);
        });
    }

    function checkEditOnRowCreate() {
        var tableData = nsSchedule.tableApi.data(),
            rowEle;
        $.each(tableData, function(rowNum) {
            rowEle = $('#maintainVesselPositionGrid tbody tr:eq(' + rowNum + ')');
            rowEle.find('.voyageNum').prop('readonly', canEdit(rowNum));
        });
        $('#maintainVesselPositionGrid').dataTable().api().columns.adjust().draw();
        $('#maintainVesselPositionGrid').find('.portcallCancel').each(function(){
            if($(this).is(':checked')){
                $(this).parent().parent().addClass('cancelledPortCall');
            }
        });
    }

    function checkExpandCollapse(gridId, opType) {
        var gridEle = $('#' + gridId).find('.dataTables_scroll .dataTables_scrollBody table'),
            gridHead = $('#' + gridId).find('.dataTables_scroll .dataTables_scrollHead table');
        if (opType === 'expand') {
            gridHead.find('.showHide').removeClass('vesselDataExpand').addClass('vesselDataCollapse').text('Collapse');
            gridHead.find('.vesselDataCollapse').next().removeClass('expandIcon').addClass('collapseIcon');
            gridHead.find('.colspanExpand').attr('colspan', '9');
            gridEle.find('.collapseData').css('display', 'table-cell');
            gridHead.find('.collapseData').css('display', 'table-cell');
        } else {
            gridHead.find('.showHide').removeClass('vesselDataCollapse').addClass('vesselDataExpand').text('Expand');
            gridHead.find('.vesselDataExpand').next().removeClass('collapseIcon').addClass('expandIcon');
            gridHead.find('.colspanExpand').attr('colspan', '5');
            gridEle.find('.collapseData').css('display', 'none');
            gridHead.find('.collapseData').css('display', 'none');
            gridEle.find('.displayStyle').css('display', 'table-cell');
        }
        $(gridEle).dataTable().api().columns.adjust();
    }
 // For Using Datatble Visible/Invisble
    function checkExpandCollapseGrid(gridId, opType) {
        var gridEle = $('#' + gridId).find('table'),
            toggleCols;
       
            toggleCols = [
                8, 9, 10, 11, 12, 13
            ];
       
        if (opType === 'expand') {
        	$('.expandTableCheck').removeClass('vesselDataExpand').addClass('vesselDataCollapse');
            gridEle.dataTable().api().columns(toggleCols).visible(true, true);
        } else {
        	$('.expandTableCheck').removeClass('vesselDataCollapse').addClass('vesselDataExpand');
            gridEle.dataTable().api().columns(toggleCols).visible(false, true);
        }
    }
    // For Using Datatble Visible/Invisble
    function checkExpandCollapseVessel(gridId, opType) {
        var gridEle = $('#' + gridId).find('.dataTables_scroll .dataTables_scrollBody table'),
            gridHead = $('#' + gridId).find('.dataTables_scroll .dataTables_scrollHead table'),
            toggleCols;
        if (gridId === 'maintainVesselPositionGrid_wrapper' || gridId === 'viewVesselPositionGrid_wrapper'|| gridId === 'editVesselVoyageGrid_wrapper') {
            toggleCols = [
                9, 10, 11, 12
            ];
        } else {
            toggleCols = [
                8, 9, 10, 11
            ];
        }
        if (opType === 'expand') {
            gridHead.find('.showHide').removeClass('vesselDataExpand').addClass('vesselDataCollapse').text('Collapse');
            gridHead.find('.vesselDataCollapse').next().removeClass('expandIcon').addClass('collapseIcon');
            gridEle.dataTable().api().columns(toggleCols).visible(true, true);
        } else {
            gridHead.find('.showHide').removeClass('vesselDataCollapse').addClass('vesselDataExpand').text('Expand');
            gridHead.find('.vesselDataExpand').next().removeClass('collapseIcon').addClass('expandIcon');
            gridEle.dataTable().api().columns(toggleCols).visible(false, true);
        }
    }
    // To adjust Datatable columns
    function checkAndAdjustTableColumn(tableId, adjustExcelBtn, divWrapper) {
        // To adjust Columns
        if ($.fn.DataTable.fnIsDataTable($('#' + tableId))) {
            $('#' + tableId).dataTable().api().columns.adjust();
        }
        // To adjust Excel Button
        if ($.fn.DataTable.fnIsDataTable($('#' + tableId)) && adjustExcelBtn) {
            adjustExportBtnPosition(divWrapper, tableId);
        }
    }
    // To Adjust & Position Excel Btn
    function adjustExportBtnPosition(divWrapper, tableId) {
        isNotInitialLoad='true';
        if (!isNotInitialLoad) {
            $(divWrapper + ' div.dt-buttons').remove();
            // to remove existing button if any
        }
        $('#' + tableId + '_wrapper div.dt-buttons').detach().appendTo($(divWrapper))
            .css('display', 'inline-block');
        $('div.dt-buttons').css('float', 'right');
        // to remove & place at the right place
        //TableTools.fnGetInstance(tableId).fnResizeButtons();
        // to resize
    }
    // Func to calculate Required Height of Add/Edit vessel Grids
    function calculatePopupScheduleGridHt(popUpId) {
        var popupEle = $('#' + popUpId),
            // Requierd height = total Popup - height of all Div/elements other than Grid
            delta = (popUpId === 'editVesselVoyageSchedulePopup' ? 130 : 100);
        return parseInt(popupEle.outerHeight() -
            delta -
            (popupEle.find('.threeColFormRow.formRow').outerHeight(true) *
            popupEle.find('.threeColFormRow.formRow').length) -
            popupEle.find('.singleColFormRow.formRow').outerHeight(true) -
            popupEle.find('.submitFromData').outerHeight(true) -
            popupEle.find('.popUpTitle').outerHeight(true) -
            popupEle.find('.greyBoldText').outerHeight(true));
    }

    function addRemoveDays(addVal, isDecrementOp, rowData, count) {
        var nodeToUpdate = (count === 0 ? 'arrivalDate' : 'departureDate'),
            dateVal = new moment(rowData[nodeToUpdate], nsSchedule.fDateFormat);
        if (isDecrementOp) {
            dateVal = dateVal.subtract(addVal, 'days');
        } else {
            dateVal = dateVal.add(addVal, 'days');
        }
        rowData[nodeToUpdate] = dateVal.format(nsSchedule.fDateFormat);
        return rowData;
    }
    scheduleObj = {
        'fnTriggeredChangeModuleVessel':fnTriggeredChangeModuleVessel,
        'customDisableEle': customDisableEle,
        'addRemoveDays': addRemoveDays,
        'calculatePopupScheduleGridHt': calculatePopupScheduleGridHt,
        'checkVoyageEditables': checkVoyageEditables,
        'checkEditOnRowCreate': checkEditOnRowCreate,
        'checkExpandCollapse': checkExpandCollapse,
        'checkExpandCollapseVessel': checkExpandCollapseVessel,
        'checkExpandCollapseGrid': checkExpandCollapseGrid,
        'checkAndAdjustTableColumn': checkAndAdjustTableColumn,
        'adjustExportBtnPosition' : adjustExportBtnPosition,
        'fnInitializeDateClick' : fnInitializeDateClick,
        'customEdit' : customEdit

    };
    $.extend(true, nsSchedule, scheduleObj);
})(this.schedule, this.core, this.vmsService, jQuery);