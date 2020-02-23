/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, nsBookDoc, nsCore) {
    var currentEditLeg = false, nextEditLeg = false, currentLeg = false, routeGridDataTable = [], carriageGridOpts = {
        'processing' : true,
        'serverSide' : false,
        'bFilter' : true,
        'tabIndex' : -1,
        'bSort' : false,
        'paging' : false,
        'ordering' : false,
        'info' : false,
        'searching' : false,
        'dom' : '<t>',
        'bAutoWidth' : false,
        'scrollY' : 200,
        'scrollX' : true,
        'scrollCollapse' : true
    }, carriageCols = [
        {
            data : 'checked',
            'render' : function(data, type, full) {
                var isChecked = '', dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre), alreadySelected = false, loadPortCallId = nsBooking
                    .textFieldNullCheck('#currentLoadPortVoyId');
                if (nsBooking.textNullCheck(data) !== '' && $.trim(data) === 'checked') {
                    isChecked = 'checked';
                }
                if (dataLoadPortCal === loadPortCallId) {
                	isChecked = 'checked';
                	alreadySelected = true;
                }
                
                if (($('#isLoadedUnits').val() === 'Y') && alreadySelected) {
                    nsBooking.currentLeg = true;
                } else {
                    nsBooking.currentLeg = nsBooking.currentLeg || false;
                }
                return '<input type="radio" name="selectCarriageLeg" class="selectCarriageLeg" data-portcalVoyageIdLoad="'
                    + full.sourcePortCallIDPre
                    + '" data-portcalVoyageIdDisc="'
                    + full.destinationPortCallIDPre
                    + '" data-vessel="'
                    + full.vesselCodePre
                    + '" data-voyage="'
                    + full.voyageNoPre
                    + '" value="' + data + '" ' + isChecked + '>';
            }
        }, {
            data : 'vesselVoyagePre'
        }, {
            data : 'tradeCodePre'
        }, {
            data : 'estimatedStartPre'
        }, {
            data : 'estimatedArrivalPre'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationCA'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationPU'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationHH'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationST'
        }, {
            sWidth : '1px',
            data : '',
            defaultContent : ''
        }
    ], nextCarriageCols = [
        {
            data : 'checked',
            'render' : function(data, type, full) {
                var isChecked = '';
                if (nsBooking.textNullCheck(data) !== '' && $.trim(data) === 'checked') {
                    isChecked = 'checked';
                }
                return '<input type="radio" name="selectNextCarriageLeg" class="selectNextCarriageLeg" '
                    + 'data-portcalVoyageIdLoad="' + full.sourcePortCallIDPre + '" data-portcalVoyageIdDisc="'
                    + full.destinationPortCallIDPre + '" value="' + data + '" ' + isChecked + '>';
            }
        }, {
            data : 'vesselVoyagePre'
        }, {
            data : 'tradeCodePre'
        }, {
            data : 'estimatedStartPre'
        }, {
            data : 'estimatedArrivalPre'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationCA'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationPU'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationHH'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationST'
        }, {
            sWidth : '1px',
            data : '',
            defaultContent : ''
        }
    ], nextEditCarriageCols = [
        {
            data : 'checked',
            'render' : function(data, type, full) {
                var isEnabled = '', isChecked = '', alreadySelected = false, dataLoadPortCal = nsBooking
                    .textNullCheck(full.sourcePortCallIDPre), loadPortCallId = nsBooking.textFieldNullCheck('#nextLoadPortCallVoyId'), 
                    discPortCallId = nsBooking.textNullCheck($('#currentDiscPortCallVoyId').val()),
                	dataDiscPortCal = nsBooking.textNullCheck(full.destinationPortCallIDPre);
                if (nsBooking.textNullCheck(data) !== '' && $.trim(data) === 'checked') {
                    isChecked = 'checked';
                }
                if(nsBooking.textNullCheck(nsBooking.editDiscPort) === $('#currentEditDiscPortCode').val()){
                	if ((dataLoadPortCal === loadPortCallId) && (dataDiscPortCal === discPortCallId)) {
                    	isChecked = 'checked';
                    }
                } else if((nsBooking.textNullCheck(nsBooking.editDiscPort) !== $('#currentEditDiscPortCode').val()) &&
                		nsBooking.textNullCheck(nsBooking.editDiscPort)){
                	if(dataLoadPortCal === loadPortCallId){
                		isChecked = 'checked';
                	}
                }
                if(isChecked === 'checked'){
                	alreadySelected = true;
                } else {
                	alreadySelected = false;
                }
                if (($('#isNxtLoadedUnits').val() === 'Y') && alreadySelected) {
                    nsBooking.nextEditLeg = true;
                } else {
                    nsBooking.nextEditLeg = nsBooking.nextEditLeg || false;
                }
                return '<input type="radio" name="selectEditNextCarriageLeg" class="selectEditNextCarriageLeg" '
                    + 'data-portcalVoyageIdLoad="' + full.sourcePortCallIDPre + '" data-portcalVoyageIdDisc="'
                    + full.destinationPortCallIDPre + '" value="' + data + '"' + isChecked + ' ' + isEnabled + '>';
            }
        }, {
            data : 'vesselVoyagePre'
        }, {
            data : 'tradeCodePre'
        }, {
            data : 'estimatedStartPre'
        }, {
            data : 'estimatedArrivalPre'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationCA'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationPU'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationHH'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationST'
        }, {
            sWidth : '1px',
            data : '',
            defaultContent : ''
        }
    ], editCarriageCols = [
        {
            data : 'checked',
            'render' : function(data, type, full) {
                var isEnabled = '', isChecked = '', dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre), alreadySelected = false, 
                	loadPortCallId = nsBooking.textNullCheck($('#currentLoadPortCallVoyId').val()), discPortCallId = nsBooking.textNullCheck($('#currentDiscPortCallVoyId').val()),
                	dataDiscPortCal = nsBooking.textNullCheck(full.destinationPortCallIDPre);
                if (nsBooking.textNullCheck(data) !== '' && $.trim(data) === 'checked') {
                    isChecked = 'checked';
                }
                nsBooking.mainBookingFlag.initialEditLoad = false;
                if(nsBooking.textNullCheck(nsBooking.editDiscPort) === $('#currentEditDiscPortCode').val()){
                	if ((dataLoadPortCal === loadPortCallId) && (dataDiscPortCal === discPortCallId)) {
                    	isChecked = 'checked';
                    }
                } else if((nsBooking.textNullCheck(nsBooking.editDiscPort) !== $('#currentEditDiscPortCode').val()) &&
                		nsBooking.textNullCheck(nsBooking.editDiscPort)){
                	if(dataLoadPortCal === loadPortCallId){
                		isChecked = 'checked';
                	}
                }
                if(isChecked === 'checked'){
                	alreadySelected = true;
                } else {
                	alreadySelected = false;
                }
                if (($('#isLoadedUnits').val() === 'Y') && alreadySelected) {
                    nsBooking.currentEditLeg = true;
                } else {
                    nsBooking.currentEditLeg = nsBooking.currentEditLeg || false;
                }
                return '<input type="radio" name="selectEditCarriageLeg" class="selectEditCarriageLeg" '
                    + 'data-portcalVoyageIdLoad="' + full.sourcePortCallIDPre + '" data-portcalVoyageIdDisc="'
                    + full.destinationPortCallIDPre + '" data-vessel="' + full.vesselCodePre + '" data-voyage="'
    				+ full.voyageNoPre + '" value="' + data + '" ' + isChecked + '  ' + isEnabled + ' >';
                
            }
        }, {
            data : 'vesselVoyagePre'
        }, {
            data : 'tradeCodePre'
        }, {
            data : 'estimatedStartPre'
        }, {
            data : 'estimatedArrivalPre'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationCA'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationPU'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationHH'
        }, {
            className : "alignRight backGroundShade",
            data : 'allocationST'
        }, {
            sWidth : '1px',
            data : '',
            defaultContent : ''
        }
    ], bookingTableObj = {
        'generateAllocCodes' : generateAllocCodes,
        'loadCarriageGrids' : loadCarriageGrids,
        'reloadCarriageGrids' : reloadCarriageGrids,
        'hasWhiteSpace' : hasWhiteSpace,
        'displayHideThirdParty' : displayHideThirdParty,
        'loadROuteDetailsGrid' : loadROuteDetailsGrid,
        'loadrouteDetailGrid' : loadrouteDetailGrid,
        'isDataTableIniialized' : isDataTableIniialized,
        'clearDataGrids' : clearDataGrids,
        'getEnableDisable' : getEnableDisable,
        'updateConsNo' : updateConsNo,
        'allocStatusTypeEnable' : allocStatusTypeEnable,
        'currentEditLeg' : currentEditLeg,
        'nextEditLeg' : nextEditLeg,
        'currentLeg' : currentLeg
    };
    function generateAllocCodes(data) {
        var allocStatCont = '';
        if (data.length === 0) {
            allocStatCont += '--';
        } else {
            allocStatCont += '<span>';
            $.each(data, function(i, val) {
                allocStatCont += '<span class="allocCodeIcon" style="background-color: ' + val.color + ';">'
                    + val.allocationVolume + '</span>';
            });
            allocStatCont += '</span>';
        }
        return allocStatCont;
    }
    // Load possible voyages grid
    function loadCarriageGrids(gridName, gridData) {
        var carriageColumns = carriageCols, currentLegObj;
        nsBooking.currentEditLeg = false;
        nsBooking.nextEditLeg = false;
        nsBooking.currentLeg = false;
        if (gridName === 'addCarriageLegGrid') {
            carriageColumns = nextCarriageCols;
        }
        if (gridName === 'editCarriageLegGrid') {
            carriageColumns = nextEditCarriageCols;
        }
        if (gridName === 'editMainCarriageLegGrid') {
            carriageColumns = editCarriageCols;
        }
        if ($.fn.DataTable.fnIsDataTable($('#' + gridName))) {
            $('#' + gridName).dataTable().api().clear().draw();
            $('#' + gridName).dataTable().api().rows.add(gridData).draw();
        } else {
            currentLegObj = JSON.parse(JSON.stringify(carriageGridOpts));
            currentLegObj.data = gridData;
            currentLegObj.columns = carriageColumns;
            currentLegObj.drawCallback = function() {
            	var vesselName= $('#' + gridName).find('input[type="radio"][checked][data-vessel!="null"][data-voyage!="--"]').attr('data-vessel');
				var vesselCode= $('#' + gridName).find('input[type="radio"][checked][data-vessel!="null"][data-voyage!="--"]').attr('data-voyage');
                if (gridName === 'editCarriageLegGrid') {
                    if (nsBooking.nextEditLeg) {
                        $('#' + gridName).find('input[type="radio"]').prop('disabled', true);
                        $('#' + gridName).find('input[type="radio"][data-vessel='+ vesselName +'][data-voyage='+ vesselCode +']').prop('disabled', false)
                    } else {
                        $('#' + gridName).find('input[type="radio"]').prop('disabled', false);
                    }
                }
                if (gridName === 'editMainCarriageLegGrid') {
                    if (nsBooking.currentEditLeg) {
                        $('#' + gridName).find('input[type="radio"]').prop('disabled', true);
                        $('#' + gridName).find('input[type="radio"][data-vessel='+ vesselName +'][data-voyage='+ vesselCode +']').prop('disabled', false)
                    } else {
                        $('#' + gridName).find('input[type="radio"]').prop('disabled', false);
                    }
                }
                if (gridName === 'addMainCarriageLegGrid') {
                    if (nsBooking.currentLeg) {
                        $('#' + gridName).find('input[type="radio"]').prop('disabled', true);
                        $('#' + gridName).find('input[type="radio"][data-vessel='+ vesselName +'][data-voyage='+ vesselCode +']').prop('disabled', false)
                    } else {
                        $('#' + gridName).find('input[type="radio"]').prop('disabled', false);
                    }
                }
            };
            $('#' + gridName).DataTable(currentLegObj);
        }
    }
    // Reload previous voyages
    function reloadCarriageGrids(gridName, gridData) {
        $('#' + gridName).dataTable().api().clear();
        $('#' + gridName).dataTable().api().rows.add(gridData).draw();
    }
    function hasWhiteSpace(s) {
        return /\s/g.test(s);
    }
    function displayHideThirdParty(vesselVoyage) {
        if (nsBooking.textNullCheck(vesselVoyage) && nsBooking.textNullCheck(vesselVoyage) !== 'No Voyage') {
            $("#thirdPartyVoyage").css("visibility", "hidden");
        } else {
            $("#thirdPartyVoyage").css("visibility", "visible");
        }
    }
    function loadROuteDetailsGrid(routeDetails, isBooking) {
        var preLoaded = 'N', unitsRowData = [], preReceived = 'N', prevesselVoyage = '', preLoadPortId = '', preSameLegVoyage = '', selectedRoute = '';
        /*
         * oLegChecked = '', mLegChecked = '', legFlag = false, pLegChecked =
         * '';
         */
        nsBooking.lcFlag = false;
        if ($.fn.DataTable.fnIsDataTable(routeGridDataTable)) {
            var ott = TableTools.fnGetInstance('#routeDetailGrid');
            if (typeof ott !== 'undefined' && ott !== null) {
                ott.fnSelectNone();
            }
            $('#routeDetailGrid').dataTable().api().destroy();
        }
        nsBookDoc.cargoConsignmentsSBU = [];
        nsBookDoc.cargoConsignmentsVD = [];
        routeGridDataTable = $('#routeDetailGrid')
            .DataTable(
                {
                    'destroy' : true,
                    'processing' : true,
                    'serverSide' : false,
                    'bFilter' : true,
                    'tabIndex' : -1,
                    'bSort' : false,
                    'ordering' : false,
                    'info' : false,
                    'searching' : false,
                    'dom' : '<t>',
                    'scrollCollapse' : true,
                    'paging' : false,
                    'data' : routeDetails,
                    'bAutoWidth' : false,
                    fnInitComplete : function() {
                        $('th').unbind('keypress');
                    },
                    'columns' : [
                        {
                            data : 'consignmentType',
                            'render' : function(data, type, full) {
                                if (!full.cargoConsignmentList) {
                                    full.cargoConsignmentList = [];
                                }
                                var equipmentNr = '', unitsData = {}, equipmentType = '', cargoOnholdStr = '', isEnorDisabled = 'disabled', legChecked = {
                                    'mLegChecked' : '',
                                    'oLegChecked' : '',
                                    'pLegChecked' : ''
                                }, mLegChecked = '', oLegChecked = '', fullCargoConsList = nsCore.isCondTrue(
                                    full.cargoConsignmentList[0], full.cargoConsignmentList[0], ''), equipNo = nsCore
                                    .isCondTrue(fullCargoConsList.equipNumber, fullCargoConsList.equipNumber, ''), consId = 'id'
                                    + full.consignmentLegId, pLegChecked = '';
                                nsBookDoc.cargoConsignmentsSBU[consId] = [
                                    {
                                        cargoOnHold : nsCore.isCondTrue(fullCargoConsList.cargoOnHold,
                                            fullCargoConsList.cargoOnHold, ''),
                                        equipNo : (!equipNo || (equipNo === '-1')) ? '' : equipNo,
                                        enabledEquipment : (equipNo === '-1') ? 'N' : 'Y',
                                        enabledCargoOnHold : nsCore.isCondTrue(
                                            (fullCargoConsList.cargoOnHold === '-1'), 'N', 'Y'),
                                        enabledNewCargo : nsCore.isCondTrue((fullCargoConsList.newCargo === '-1'), 'N',
                                            'Y'),
                                    }, {
                                        cargoOnHold : '',
                                        equipNo : '',
                                        enabledEquipment : '',
                                        enabledCargoOnHold : '',
                                        enabledNewCargo : ''
                                    }
                                ];
                                nsBookDoc.cargoConsignmentsVD[consId] = {
                                    carrierId : nsCore.isCondTrue(full.carrierId, full.carrierId, ''),
                                    carrierName : nsCore.isCondTrue(full.carrierName, full.carrierName, ''),
                                    carrierRef : nsCore.isCondTrue(full.carrierRef, full.carrierRef, ''),
                                    departureDate : nsCore.isCondTrue(full.estimatedDeparture, full.estimatedDeparture,
                                        ''),
                                    estimatedArrival : nsCore.isCondTrue(full.estimatedArrival, full.estimatedArrival,
                                        ''),
                                    shippedOnBoard : nsCore.isCondTrue(full.shippedOnBoard, full.shippedOnBoard, ''),
                                    transpType : nsCore.isCondTrue(full.transpType, full.transpType, '')
                                };
                                unitsData.legType = data;
                                unitsData.legId = full.consignmentLegId;
                                unitsData.booked = nsCore.isCondTrue(full.bookedUnits, full.bookedUnits, '');
                                unitsData.received = $('.mainSubBookFormTitle').attr('data-subBookingTitle') === 'New Sub Booking' ? 0 : full.receivedUnits;
                                unitsData.loaded = $('.mainSubBookFormTitle').attr('data-subBookingTitle') === 'New Sub Booking' ? 0 : full.loadedUnits;
                                $.each($('.searchedForWrap .searchedItem'), function(i, v) {
                                    var switchVar = $(v).attr('data-searchkey');
                                    if ($('.searchedForWrap').text().indexOf('LP = ') > -1
                                        && $('.searchedForWrap').text().indexOf('DP = ') > -1
                                        && $('.searchedForWrap').text().indexOf('Trade = ') > -1) {
                                        switchVar = 'LPDPTR';
                                    } else if ($('.searchedForWrap').text().indexOf('LP = ') > -1
                                        && $('.searchedForWrap').text().indexOf('DP = ') > -1
                                        && $('.searchedForWrap').text().indexOf(' VSL = ') > -1) {
                                        switchVar = 'LPDPVO';
                                    } else if ($('.searchedForWrap').text().indexOf('LP = ') > -1
                                        && $('.searchedForWrap').text().indexOf('DP = ') > -1) {
                                        switchVar = 'LPDP';
                                    } else if ($('.searchedForWrap').text().indexOf(' VSL = ') > -1
                                        && $('.searchedForWrap').text().indexOf('Trade = ') > -1) {
                                        switchVar = 'VOTR';
                                    } else if ($('.searchedForWrap').text().indexOf(' VSL = ') > -1
                                        && $('.searchedForWrap').text().indexOf('Voy = ') > -1) {
                                        switchVar = 'VOVE';
                                    }
                                    switch (switchVar) {
                                    case 'LPDPVO':
                                        if ((data === 'P') && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                '.searchedItemValue').text() === full.loadPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                    '.searchedItemValue').text() === full.discPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                    '.searchedItemValue').text() === full.vesselCode) {
                                                legChecked.pLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else if (data === 'O' && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                '.searchedItemValue').text() === full.loadPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                    '.searchedItemValue').text() === full.discPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                    '.searchedItemValue').text() === full.vesselCode) {
                                                legChecked.oLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else {
                                            if (data === 'M' && !nsBooking.lcFlag) {
                                                if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                    '.searchedItemValue').text() === full.loadPortCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                        '.searchedItemValue').text() === full.discPortCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                        '.searchedItemValue').text() === full.vesselCode) {
                                                    legChecked.mLegChecked = 'checked';
                                                    nsBooking.lcFlag = true;
                                                }
                                            }
                                        }
                                        break;
                                    case 'LPDPTR':
                                        if ((data === 'P') && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                '.searchedItemValue').text() === full.loadPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                    '.searchedItemValue').text() === full.discPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=Trade]').find(
                                                    '.searchedItemValue').text() === full.tradeCode) {
                                                legChecked.pLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else if (data === 'O' && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                '.searchedItemValue').text() === full.loadPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                    '.searchedItemValue').text() === full.discPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=Trade]').find(
                                                    '.searchedItemValue').text() === full.tradeCode) {
                                                legChecked.oLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else {
                                            if (data === 'M' && !nsBooking.lcFlag) {
                                                if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                    '.searchedItemValue').text() === full.loadPortCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                        '.searchedItemValue').text() === full.discPortCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=Trade]').find(
                                                        '.searchedItemValue').text() === full.tradeCode) {
                                                    legChecked.mLegChecked = 'checked';
                                                    nsBooking.lcFlag = true;
                                                }
                                            }
                                        }
                                        break;
                                    case 'LPDP':
                                        if ((data === 'P') && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                '.searchedItemValue').text() === full.loadPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                    '.searchedItemValue').text() === full.discPortCode) {
                                                legChecked.pLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else if (data === 'O' && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                '.searchedItemValue').text() === full.loadPortCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                    '.searchedItemValue').text() === full.discPortCode) {
                                                legChecked.oLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else {
                                            if (data === 'M' && !nsBooking.lcFlag) {
                                                if ($(v).parent().find('.searchedItem[data-searchkey=LP]').find(
                                                    '.searchedItemValue').text() === full.loadPortCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=DP]').find(
                                                        '.searchedItemValue').text() === full.discPortCode) {
                                                    legChecked.mLegChecked = 'checked';
                                                    nsBooking.lcFlag = true;
                                                }
                                            }
                                        }
                                        break;
                                    case 'VOTR':
                                        if ((data === 'P') && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                '.searchedItemValue').text() === full.vesselCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=Trade]').find(
                                                    '.searchedItemValue').text() === full.tradeCode) {
                                                legChecked.pLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else if (data === 'O' && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                '.searchedItemValue').text() === full.vesselCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=Trade]').find(
                                                    '.searchedItemValue').text() === full.tradeCode) {
                                                legChecked.oLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else {
                                            if (data === 'M' && !nsBooking.lcFlag) {
                                                if ($(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                    '.searchedItemValue').text() === full.vesselCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=Trade]').find(
                                                        '.searchedItemValue').text() === full.tradeCode) {
                                                    legChecked.mLegChecked = 'checked';
                                                    nsBooking.lcFlag = true;
                                                }
                                            }
                                        }
                                        break;
                                    case 'VOVE':
                                        if ((data === 'P') && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                '.searchedItemValue').text() === full.vesselCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=Voy]').find(
                                                    '.searchedItemValue').text() === full.voyageNo) {
                                                legChecked.pLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else if (data === 'O' && !nsBooking.lcFlag) {
                                            if ($(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                '.searchedItemValue').text() === full.vesselCode
                                                && $(v).parent().find('.searchedItem[data-searchkey=Voy]').find(
                                                    '.searchedItemValue').text() === full.voyageNo) {
                                                legChecked.oLegChecked = 'checked';
                                                nsBooking.lcFlag = true;
                                            }
                                        } else {
                                            if (data === 'M' && !nsBooking.lcFlag) {
                                                if ($(v).parent().find('.searchedItem[data-searchkey=" VSL"]').find(
                                                    '.searchedItemValue').text() === full.vesselCode
                                                    && $(v).parent().find('.searchedItem[data-searchkey=Voy]').find(
                                                        '.searchedItemValue').text() === full.voyageNo) {
                                                    legChecked.mLegChecked = 'checked';
                                                    nsBooking.lcFlag = true;
                                                }
                                            }
                                        }
                                        break;
                                    case ' VSL':
                                        legChecked = nsBookDoc.legSelectionToMatchSearch(data, v, full.vesselCode,
                                            legChecked.pLegChecked, legChecked.oLegChecked, legChecked.mLegChecked);
                                        break;
                                    case 'LP':
                                        legChecked = nsBookDoc.legSelectionToMatchSearch(data, v, full.loadPortCode,
                                            legChecked.pLegChecked, legChecked.oLegChecked, legChecked.mLegChecked);
                                        break;
                                    case 'DP':
                                        legChecked = nsBookDoc.legSelectionToMatchSearch(data, v, full.discPortCode,
                                            legChecked.pLegChecked, legChecked.oLegChecked, legChecked.mLegChecked);
                                        break;
                                    case 'Trade':
                                        legChecked = nsBookDoc.legSelectionToMatchSearch(data, v, full.tradeCode,
                                            legChecked.pLegChecked, legChecked.oLegChecked, legChecked.mLegChecked);
                                        break;
                                    default:
                                        break;
                                    }
                                });
                                mLegChecked = legChecked.mLegChecked;
                                oLegChecked = legChecked.oLegChecked;
                                pLegChecked = legChecked.pLegChecked;
                                if (!mLegChecked && !nsBooking.lcFlag) {
                                    mLegChecked = (!pLegChecked && !oLegChecked) ? 'checked' : '';
                                }
                                if (full.cargoConsignmentList !== null) {
                                    $.each(full.cargoConsignmentList, function(k, cargoConsignmentModel) {
                                        if (cargoConsignmentModel.cargoOnHold === '-1') {
                                            cargoOnholdStr = '-1';
                                            return false;
                                        } else {
                                            cargoOnholdStr = cargoConsignmentModel.cargoOnHold;
                                            return false;
                                        }
                                    });
                                    $.each(full.cargoConsignmentList, function(k, cargoConsignmentModel) {
                                        if (cargoConsignmentModel.equipNumber === '-1') {
                                            equipmentNr = '-1';
                                            return false;
                                        } else {
                                            equipmentNr = cargoConsignmentModel.equipNumber;
                                            equipmentType = cargoConsignmentModel.equipType;
                                            return false;
                                        }
                                    });
                                }
                                if (!isBooking) {
                                    if (nsCore.appModel.selected === 'booking') {
                                        isBooking = 'Y'
                                    } else {
                                        isBooking = 'N'
                                    }
                                }
                                if (isBooking === 'N') {
                                    isEnorDisabled = 'Enabled';
                                }
                                if (data === 'P') {
                                    unitsData.selLeg = pLegChecked;
                                    unitsRowData.push(unitsData);
                                    displayHideThirdParty(full.vesselVoyage);
                                    return '<input type="radio" ' + pLegChecked + ' name="selectedRoute" '
                                        + isEnorDisabled + ' data-receivedUnits="' + full.receivedUnits
                                        + '" data-loadedUnits="' + full.loadedUnits + '" data-isLoaded="' + full.loaded
                                        + '" data-isReceived="' + full.received + '"  data-isDischarged="'
                                        + full.discharged + '" data-estimArrDate="' + full.estimatedArrival
                                        + '" data-estimDepDate="' + full.estimatedDeparture + '"   data-consNo="'
                                        + full.consignmentNo + '" data-cargoEquipmentNbr="' + equipmentNr
                                        + '" data-equipType="' + equipmentType + '" data-comment="' + full.comment
                                        + '" data-isFirm="' + full.firm + '" data-transpType="' + full.transpType
                                        + '"  data-carrierName="' + full.carrierId + '"  data-crName="'
                                        + full.carrierName + '" data-carrierRef="' + full.carrierRef
                                        + '" class="selectedRoute margLeft40per" data-vesselvoyage="'
                                        + full.vesselVoyage + '" value="' + data + '"  data-loadport="'
                                        + full.loadPortCode + '" data-loadname="' + full.loadPortName
                                        + '"  data-discname="' + full.discPortName + '" data-discPort="'
                                        + full.discPortCode + '" data-tradeId="' + full.tradeId + '" data-vesselId="'
                                        + full.vesselId + '" data-voyageid="' + full.loadVoyageId
                                        + '" data-consignmentLegId="' + full.consignmentLegId + '"data-timestamp="'
                                        + full.timeStamp + '" data-conslegstatus="' + full.legStatus
                                        + '" data-cargoOnHold="' + cargoOnholdStr
                                        + '" data-userBookOffice="' + full.userBookOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound 
                                        + '" data-isHoeghCompany="' + full.isHoeghCompany + '" >';
                                } else if (data === 'O') {
                                    unitsData.selLeg = oLegChecked;
                                    unitsRowData.push(unitsData);
                                    displayHideThirdParty(full.vesselVoyage);
                                    return '<input type="radio" ' + oLegChecked + ' name="selectedRoute" '
                                        + isEnorDisabled + ' data-receivedUnits="' + full.receivedUnits
                                        + '" data-loadedUnits="' + full.loadedUnits + '" data-isLoaded="' + full.loaded
                                        + '" data-isReceived="' + full.received + '"  data-isDischarged="'
                                        + full.discharged + '" data-estimArrDate="' + full.estimatedArrival
                                        + '" data-estimDepDate="' + full.estimatedDeparture + '"   data-consNo="'
                                        + full.consignmentNo + '" data-cargoEquipmentNbr="' + equipmentNr
                                        + '" data-equipType="' + equipmentType + '" data-comment="' + full.comment
                                        + '" data-isFirm="' + full.firm + '" data-transpType="' + full.transpType
                                        + '"  data-carrierName="' + full.carrierId + '"  data-crName="'
                                        + full.carrierName + '" data-carrierRef="' + full.carrierRef
                                        + '" class="selectedRoute margLeft40per" data-vesselvoyage="'
                                        + full.vesselVoyage + '" value="' + data + '"  data-loadport="'
                                        + full.loadPortCode + '" data-loadname="' + full.loadPortName
                                        + '"  data-discname="' + full.discPortName + '" data-discPort="'
                                        + full.discPortCode + '" data-tradeId="' + full.tradeId + '" data-vesselId="'
                                        + full.vesselId + '" data-voyageid="' + full.loadVoyageId
                                        + '" data-consignmentLegId="' + full.consignmentLegId + '"data-timestamp="'
                                        + full.timeStamp + '" data-conslegstatus="' + full.legStatus
                                        + '" data-cargoOnHold="' + cargoOnholdStr 
                                    	+ '" data-userBookOffice="' + full.userBookOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound
                                    	+ '" data-isHoeghCompany="' + full.isHoeghCompany + '" >';
                                } else {
                                    if (isBooking === 'N') {
                                        updateConsNo(full.consignmentNo, full.legStatus);
                                    }
                                    unitsData.selLeg = mLegChecked;
                                    unitsRowData.push(unitsData);
                                    displayHideThirdParty(full.vesselVoyage);
                                    if ($('.activeNavigationItem.activeSubBook.thrdLevel').length > 0
                                        && !$('.activeNavigationItem.activeSubBook.thrdLevel').attr(
                                            'data-mainlegconsid')) {
                                        $('.activeNavigationItem.activeSubBook.thrdLevel').attr('data-mainlegconsid',
                                            full.consignmentLegId);
                                    }
                                    return '<input type="radio" ' + mLegChecked + ' name="selectedRoute" '
                                        + isEnorDisabled + ' class="selectedRoute margLeft40per" data-receivedUnits="'
                                        + full.receivedUnits + '" data-loadedUnits="' + full.loadedUnits
                                        + '" data-isReceived="' + full.received + '" data-isLoaded="' + full.loaded
                                        + '"  data-isDischarged="' + full.discharged + '" data-estimArrDate="'
                                        + full.estimatedArrival + '"  data-estimDepDate="' + full.estimatedDeparture
                                        + '"  data-consNo="' + full.consignmentNo + '" data-cargoEquipmentNbr="'
                                        + equipmentNr + '" data-equipType="' + equipmentType + '" data-comment="'
                                        + full.comment + '" data-isFirm="' + full.firm + '" data-transpType="'
                                        + full.transpType + '"  data-carrierName="' + full.carrierId
                                        + '"  data-crName="' + full.carrierName +'" data-carrierRef="'
                                        + full.carrierRef + '"  data-vesselvoyage="' + full.vesselVoyage + '" value="'
                                        + data + '"  data-loadport="' + full.loadPortCode + '" data-loadname="'
                                        + full.loadPortName + '"  data-discname="' + full.discPortName
                                        + '" data-tradeId="' + full.tradeId + '" data-discPort="' + full.discPortCode
                                        + '" data-consignmentLegId="' + full.consignmentLegId + '" data-voyageid="'
                                        + full.loadVoyageId + '" data-vesselId="' + full.vesselId + '"data-timestamp="'
                                        + full.timeStamp + '" data-conslegstatus="' + full.legStatus
                                        + '" data-cargoOnHold="' + cargoOnholdStr 
                                        + '" data-userBookOffice="' + full.userBookOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound
                                        + '" data-isHoeghCompany="' + full.isHoeghCompany + '" >';
                                }
                            }
                        },
                        {
                            data : 'vesselVoyage',
                            'render' : function(data) {
                                return nsBookDoc.vesselVoyDisplay(data);
                            }
                        },
                        {
                            data : 'tradeCode'
                        },
                        {
                            data : 'loadPortCode'
                        },
                        {
                            data : 'portEstimatedDeparture',
                            'render' : function(data) {
                                return data ? data.split(' ')[0] : '';
                            }
                        },
                        {
                            data : 'discPortCode'
                        },
                        {
                            data : 'portEstimatedArrival',
                            'render' : function(data) {
                                return data ? data.split(' ')[0] : '';
                            }
                        },
                        {
                            data : 'firm',
                            'render' : function(data, type, full) {
                                var isEnorDis = 'Enabled', selectr = '<select name="allocStatusType" id="allocStatusType" class="allocStatusType" ';
                                isEnorDis = ((full.loaded === 'Y') || (full.discharged === 'Y')) ? 'disabled'
                                    : isEnorDis;
                                selectr += isEnorDis + '   >';
                                selectr += nsBookDoc.generateSelect(nsBooking.allocArray, data ? data : 'N', true);
                                selectr += '</select>';
                                return selectr;
                            }
                        },
                        {
                            data : 'consignmentType',
                            'render' : function(data, type, full) {
                                var isMainDisabled = 'Enabled';
                                isMainDisabled = getEnableDisable(isBooking, full.received, full.loaded,
                                    full.discharged, isMainDisabled);
                                if (data === 'M') {
                                    return '<input type="radio" checked="checked" name="mainLeg" class="mainLeg margLeft44per" value="mainLeg" '
                                        + isMainDisabled
                                        + ' > <input type="hidden" class="consignmentLegsClass" name="consignmentLegsClass"'
                                        + 'id="consignmentLegsClass" data-isBooking="'
                                        + isBooking
                                        + '" data-consType="'
                                        + full.consignmentType
                                        + '" data-consignmentNo="'
                                        + full.consignmentNo
                                        + '" data-id="'
                                        + full.consignmentLegId
                                        + '" data-nextConsignmentId="'
                                        + full.nextConsignmentLegId
                                        + '" data-consignmentId="'
                                        + full.consignmentId
                                        + '" data-nextLoadPortCallVoyageId="'
                                        + full.nextLoadPortCallVoyId
                                        + '" data-nextDiscPortCallVoyageId="'
                                        + full.nextDiscPortCallVoyId
                                        + '"   data-nextLoadPortCode="'
                                        + full.nextLoadPortCode
                                        + '" data-nextLoadPortDesc="'
                                        + full.nextLoadPortDesc
                                        + '" data-nextDiscPortCode="'
                                        + full.nextDiscPortCode
                                        + '"  data-nextDiscPortDesc="'
                                        + full.nextDiscPortDesc
                                        + '" data-loadPortCallVoyageId="'
                                        + (full.sourcePortCallID ? full.sourcePortCallID : full.loadPortCallVoyageId)
                                        + '" data-discPortCallVoyageId="'
                                        + (full.destinationPortCallID ? full.destinationPortCallID
                                            : full.discPortCallVoyageId)
                                        + '" data-consType="'
                                        + full.consignmentType
                                        + '"   data-loadPort="'
                                        + full.loadPortCode
                                        + '" data-loadPortName="'
                                        + full.loadPortName
                                        + '" data-discPort="'
                                        + full.discPortCode
                                        + '" data-discPortName="'
                                        + full.discPortName
                                        + '"  data-vesselvoyage="'
                                        + full.vesselVoyage
                                        + '" data-voyageid="'
                                        + full.loadVoyageId
                                        + '" data-vesselId="' + full.vesselId + '" > ';
                                } else {
                                    return '<input type="radio" name="mainLeg" class="mainLeg margLeft44per" value="mainLeg" '
                                        + isMainDisabled
                                        + '> <input type="hidden" class="consignmentLegsClass" name="consignmentLegsClass"'
                                        + 'id="consignmentLegsClass" data-isBooking="'
                                        + isBooking
                                        + '" data-consType="'
                                        + full.consignmentType
                                        + '" data-consignmentNo="'
                                        + full.consignmentNo
                                        + '" data-id="'
                                        + full.consignmentLegId
                                        + '" data-nextConsignmentId="'
                                        + full.nextConsignmentLegId
                                        + '" data-consignmentId="'
                                        + full.consignmentId
                                        + '" data-nextLoadPortCallVoyageId="'
                                        + full.nextLoadPortCallVoyId
                                        + '" data-nextDiscPortCallVoyageId="'
                                        + full.nextDiscPortCallVoyId
                                        + '" data-nextLoadPortCode="'
                                        + full.nextLoadPortCode
                                        + '" data-nextLoadPortDesc="'
                                        + full.nextLoadPortDesc
                                        + '" data-nextDiscPortCode="'
                                        + full.nextDiscPortCode
                                        + '"  data-nextDiscPortDesc="'
                                        + full.nextDiscPortDesc
                                        + '" data-loadPortCallVoyageId="'
                                        + (full.sourcePortCallID ? full.sourcePortCallID : full.loadPortCallVoyageId)
                                        + '" data-discPortCallVoyageId="'
                                        + (full.destinationPortCallID ? full.destinationPortCallID
                                            : full.discPortCallVoyageId)
                                        + '" data-consType="'
                                        + full.consignmentType
                                        + '"   data-loadPort="'
                                        + full.loadPortCode
                                        + '" data-loadPortName="'
                                        + full.loadPortName
                                        + '" data-discPort="'
                                        + full.discPortCode
                                        + '" data-discPortName="'
                                        + full.discPortName
                                        + '"  data-vesselvoyage="'
                                        + full.vesselVoyage
                                        + '" data-voyageid="'
                                        + full.loadVoyageId
                                        + '" data-vesselId="' + full.vesselId + '" > ';
                                }
                            }
                        },
                        {
                            data : 'wayCargo',
                            'render' : function(data, type, full) {
                                if (data === 'Y') {
                                    return '<input type="checkbox" '
                                        + ' checked name="wayCargo" class="wayCargo margLeft44per" value="' + data
                                        + '" data-isLoaded="' + full.loaded + '" data-isReceived="' + full.received
                                        + '"  data-isDischarged="' + full.discharged + '">';
                                } else {
                                    return '<input type="checkbox" '
                                        + ' name="wayCargo"  class="wayCargo margLeft44per" value="' + data
                                        + '" data-isLoaded="' + full.loaded + '" data-isReceived="' + full.received
                                        + '" >';
                                }
                            }
                        },
                        {
                            data : 'actionList',
                            'render' : function(data, type, full) {
                                var actionsCont = '', linkIcon = '';
                                var tempData = [];
                                data = data || '';
                                if (data.indexOf('edit') !== -1) {
                                    tempData.push('edit');
                                }
                                if (data.indexOf('add') !== -1) {
                                    tempData.push('add');
                                }
                                if (data.indexOf('remove') !== -1) {
                                    tempData.push('remove');
                                }
                                data = tempData;
                                $.each(data,
                                    function(i, link) {
                                        switch (link) {
                                        case 'add':
                                            linkIcon = 'fa-plus';
                                            break;
                                        case 'edit':
                                            linkIcon = 'fa-pencil';
                                            break;
                                        case 'remove':
                                            linkIcon = 'fa-remove';
                                            break;
                                        default:
                                            linkIcon = '';
                                        }
                                        actionsCont += '<a href="javascript:void(0);" data-isPreReceived="'
                                            + preReceived + '" data-isPreLoaded="' + preLoaded
                                            + '" data-isNextReceived="' + full.nextReceived + '" data-isNextLoaded="'
                                            + full.nextLoaded + '" data-isLoaded="' + full.loaded
                                            + '" data-isReceived="' + full.received + '" data-isDischarged="'
                                            + full.discharged + '" data-isNextLoadTerm="' + full.nextLoadTerm
                                            + '" data-isNextDiscTerm="' + full.nextDiscTerm + '" data-isSameLoadTerm="'
                                            + full.sameLoadTerm + '" data-isSameDiscTerm="' + full.sameDiscTerm
                                            + '" data-nextLoadTerminal="' + full.nextLoadTerminalId + '" data-isNextdischarged="' + full.nextDischarged
                                            + '" data-nextDiscTerminal="' + full.nextDiscTerminalId
                                            + '"  data-discTerminal="' + full.discTerminalId + '"  data-loadTerminal="'
                                            + full.loadTerminalId + '" data-isBooking="' + isBooking
                                            + '" data-consType="' + full.consignmentType + '" data-consignmentNo="'
                                            + full.consignmentNo + '" data-id="' + full.consignmentLegId
                                            + '" data-nextConsignmentId="' + full.nextConsignmentLegId
                                            + '" data-consignmentId="' + full.consignmentId
                                            + '" data-nextLoadPortCallVoyageId="' + full.nextLoadPortCallVoyId
                                            + '" data-nextDiscPortCallVoyageId="' + full.nextDiscPortCallVoyId
                                            + '"   data-nextLoadPortCode="' + full.nextLoadPortCode
                                            + '" data-nextLoadPortDesc="' + full.nextLoadPortDesc
                                            + '" data-nextDiscPortCode="' + full.nextDiscPortCode
                                            + '"  data-nextDiscPortDesc="' + full.nextDiscPortDesc
                                            + '" data-loadPortCallVoyageId="'
                                            + (full.loadPortCallVoyageId || full.sourcePortCallID)
                                            + '" data-discPortCallVoyageId="' + (full.destinationPortCallID || full.discPortCallVoyageId)
                                            + '" data-consType="' + full.consignmentType + '"   data-loadPort="'
                                            + full.loadPortCode + '" data-loadPortName="' + full.loadPortName
                                            + '" data-discPort="' + full.discPortCode + '" data-discPortName="'
                                            + full.discPortName + '" class="' + link + 'Leg m_l_10 fa ' + linkIcon
                                            + '" data-vessel="' + full.vesselCode + '" data-voyage="' + full.voyageNo
                                            + '" data-vesselvoyage="' + full.vesselVoyage + '"data-preLoadPortCallId="'
                                            + preLoadPortId + '"  data-preVesselvoyage="' + prevesselVoyage
                                            + '" data-voyageid="' + full.loadVoyageId + '" data-vesselId="'
                                            + full.vesselId + '" data-sameVoyageId="' + preSameLegVoyage
                                            + '" data-NextConsType ="' + (full.nextConsType || full.nextConsignmentType)
                                            + '"  data-curSameVoyageId="' + full.sameLegVoyageId + '" data-eta="'
                                            + full.portEstimatedArrival 
                                        	+ '" data-userBookOffice="' + full.userBookOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound 
                                        	+ '" data-isHoeghCompany="' + full.isHoeghCompany + '" ></a>';
                                    });
                                prevesselVoyage = full.vesselVoyage;
                                preLoaded = full.loaded;
                                preReceived = full.received;
                                preLoadPortId = full.loadPortCode;
                                preSameLegVoyage = full.sameLegVoyageId;
                                if ($.isEmptyObject(nsCore.appModel.viewSubBooking)
                                    && nsCore.appModel.selected !== 'booking') {
                                    return '<div class="legField"></div>';
                                } else {
                                    return '<div class="legField">' + actionsCont.slice(0, -1) + '</div>';
                                }
                            }
                        }
                    ]
                });
        if ($('.mainSubBookFormTitle').text()) {
            nsBooking.loadUnitsTable(unitsRowData);
        }
        if ($('.selectedRoute:checked').val() === 'M') {
            nsBookDoc.panelActions('freightsAndCharges', 'open');
            $('.freightsAndCharges .accHeader').removeClass('disabledHeader');
        } else {
            nsBookDoc.panelActions('freightsAndCharges', 'close');
            $('.freightsAndCharges .accHeader').addClass('disabledHeader');
        }
        selectedRoute = $('.selectedRoute:checked');
        $('.thrdLevel.activeNavigationItem').attr('data-currentlegid',
            $('.selectedRoute:checked').attr('data-consignmentlegid'));
        $('#bookingAllocStatus').val(selectedRoute.parent().parent().find('.allocStatusType').val());
        loadrouteDetailGrid(isBooking);
        nsBooking.legDetailsDisble();
        nsBooking.loadRouteInfo(selectedRoute);
        nsBooking.mainRoutekey = '';
        nsBookDoc.updateRouteGridOnDiffRouteDetail("Y");
        
    }
    function loadrouteDetailGrid(isBooking) {
        if (isBooking === 'N') {
            $('.routeDetailGrid tbody tr').each(
                function() {
                    if ($('#subBlStatus').val() && $('#subBlStatus').val() !== '10') {
                        $(this).find('.mainLeg').attr('disabled', 'disabled');
                        $(this).find('.wayCargo').attr('disabled', 'disabled');
                    } else {
                        $(this).find('.mainLeg').removeAttr('disabled');
                    }
                });
        }
    }
    function allocStatusTypeEnable() {
        $('.routeDetailGrid tbody tr').each(function() {
            if ($(this).find('.selectedRoute').attr('data-isLoaded') === 'Y') {
                $(this).find('.allocStatusType').attr('disabled', 'disabled');
            } else {
                $(this).find('.allocStatusType').removeAttr('disabled');
            }
        });
    }
    function isDataTableIniialized(tableName) {
        return $.fn.DataTable.fnIsDataTable($('#' + tableName));
    }
    function clearDataGrids(gridList) {
        $.each(gridList, function(i, obj) {
            if (isDataTableIniialized(obj)) {
                $('#' + obj).dataTable().api().clear().draw();
            }
        });
    }
    function getEnableDisable(isBooking, isReceived, isLoaded, isDischarged, isMainDisabled) {
        var isMainDisabledField = isMainDisabled;
        if (isReceived === 'Y' || isLoaded === 'Y' || isDischarged === 'Y') {
            isMainDisabledField = 'disabled';
        }
        return isMainDisabledField;
    }
    function updateConsNo(consNo, consStatus) {
    	var returnStatusIcon = '', printedStatus = '';
        if ($('.ui-dialog[aria-describedby=possibleVoyagePopup]').css('display') === 'block') {
            return;
        }
        $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel')
            .each(
                function() {
                    var cargoTextVal = 'New Sub Booking', lengthNo = 0, originalLen = 4, appe = '', k = 0, bookedUnits = '', subTitle = '';
                    if ($(this).hasClass('ui-selecting')) {
                        if ($('#bookingCargoText').val()) {
                            cargoTextVal = $('#bookingCargoText').val();
                        }
                        lengthNo = originalLen - String(consNo).length;
                        for (k = 0; k < lengthNo; k++) {
                            appe += '0';
                        }
                        if ($('#totalBookedUnits').val() !== undefined) {
                            bookedUnits = $('#totalBookedUnits').val();
                        } else {
                            for (var itr = 0; itr < nsCore.appModel.viewSubBooking.consignmentLegModelList.length; itr++) {
                                if (nsCore.appModel.viewSubBooking.consignmentLegModelList[itr].consignmentType === 'M') {
                                    bookedUnits = nsCore.appModel.viewSubBooking.consignmentLegModelList[itr].bookedUnits;
                                }
                            }
                        }
                        if (bookedUnits === '') {
                            bookedUnits = '0';
                        }
                        subTitle = appe + consNo + ' - ' + bookedUnits + ' - ' + cargoTextVal;
                        printedStatus = nsCore.appModel.viewSubBooking.billOfLadingModel.bolPrinted? 'Yes':'No';
        				returnStatusIcon = nsBookDoc.statusIcon((consStatus ? $(this).attr('data-bolstatus') : $('.selectedRoute:checked').attr('data-conslegstatus')),printedStatus);
        				$(this).find('.statusIcon').addClass(returnStatusIcon[0]);			
        				$(this).find('.statusIcon').css("color", returnStatusIcon[1]);
        				$(this).find('span a').text(subTitle);
                        $(this).addClass('clippedTitle')
                        $(this).attr('data-filtering', subTitle);
                        $('.mainSubBookFormTitle').attr('data-subbookingtitle', subTitle).text(
                            'Sub Booking: ' + subTitle);
                        return false;
                    }
                });
    }
    $(document)
        .ready(
            function() {
                var currentAnswerDiv;
                $('.hiddenDiv').hide();
                $('.rowToggle').click(function() {
                    currentAnswerDiv = $('div[rel="profile_' + $(this).attr('profile') + '"]');
                    $('.hiddenDiv').not(currentAnswerDiv).hide();
                    currentAnswerDiv.toggle(600);
                });
                $('#allocationTooltip-1').tooltip();
                $('#allocationTooltip-2').tooltip();
                $('#allocationTooltip-3').tooltip();
                nsBooking.allocArray.push('Y' + ',' + 'Firm');
                nsBooking.allocArray.push('N' + ',' + 'Reserve');
                $('#quickBookPopup').dialog({
                    modal : true,
                    resizable : false,
                    draggable : false,
                    autoOpen : false,
                    width : '85%',
                    close : function() {
                        $('#quickBookChargesGrid tbody tr:not(:first-child)').remove();
                    }
                });
                $('#possibleVoyagePopup').dialog({
                    modal : true,
                    resizable : false,
                    draggable : false,
                    autoOpen : false,
                    width : '80%',
                    position : {
                        my : "center",
                        at : "top"
                    },
                    open : function() {
                        $('#possibleVoyagesGrid tr').find('td input:checked').trigger('click');
                    },
                    close : function() {
                        $('#quickBookChargesGrid tbody tr:not(:first-child)').remove();
                    }
                });
                // Reset
                $('.filterDiv .resetIcon').click(function() {
                    $('input[name="selectCargo"]').prop('checked', false);
                });
                // Reset for freightChargesContent
                $('.freightChargesContent .resetIcon').click(function() {
                    $('.freightChargesCalculation  input').val('');
                });
                // Dimensions Reset
                $('.resetButton').click(function() {
                    $('.areaCalculation  input').val('');
                    $('.calculationValue').text('');
                });
                $('#quickBookForm').submit(function(e) {
                    e.preventDefault();
                    $(this).closest('.ui-dialog-content').dialog('close');
                });
                // Right Side Action List
                $('.blueHeader').click(
                    function() {
                        if (!($(this).hasClass('notExpandable'))) {
                            $(this).find('.icons_sprite').toggleClass('smallBottomArrowIcon');
                            $(this).next().slideToggle();
                            $(this).next().find('.optionItem,.optionVal').show();
                            $(this).next().find('.smallRemoveIcon').hide();
                            $(this).next().find('.optionVal').removeClass('clickedOption');
                            if ($(this).closest('.blueAccElement').find('.normalAccContentWrap ul').hasClass(
                                'inputActionWrap')) {
                                $(this).closest('.blueAccElement').find('.actionListInput').hide().find('input')
                                    .val('');
                            }
                            $('#bookingUnit .actionListLinkASide').show();
                        }
                    });
                $('.optionVal').click(
                    function() {
                        if (!($(this).hasClass('clickedOption'))) {
                            $(this).addClass('clickedOption');
                            $(this).closest('.optionItem').siblings().hide();
                            $(this).next().show();
                            if ($(this).closest('.blueAccElement').find('.normalAccContentWrap ul').hasClass(
                                'inputActionWrap')) {
                                $(this).closest('.blueAccElement').find('.actionListInput').toggle().val('');
                            }
                        }
                    });
                $('.smallRemoveIcon').click(
                    function() {
                        $(this).closest('.blueAccElement').find('.icons_sprite').addClass('smallBottomArrowIcon');
                        $(this).closest('.normalAccContentWrap').slideUp();
                        $(this).closest('.normalAccContentWrap').find('.optionItem,.optionVal').show();
                        $(this).closest('.normalAccContentWrap').find('.smallRemoveIcon').hide();
                        $(this).closest('.normalAccContentWrap').find('.optionVal').removeClass('clickedOption');
                        if ($(this).closest('.blueAccElement').find('.normalAccContentWrap ul').hasClass(
                            'inputActionWrap')) {
                            $(this).closest('.blueAccElement').find('.actionListInput').toggle().val('');
                        }
                    });
                $('.dialogCloseIcon')
                    .click(
                        function() {
                            if ($(this).parent().attr('id') === 'bookingUnitPopup') {
                                if (nsBooking.globalBookingFlag.mainBookingFlag) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    event.stopImmediatePropagation();
                                    nsBooking.fnDirtyDialog(nsBookDoc.fnBookingUnitForward,
                                        nsBookDoc.fnBookingUnitBackward, 'mainBookingFlag', $(this));
                                } else {
                                    $(this).closest('.ui-dialog-content').dialog('close');
                                }
                            } else if (!(this.id === 'qdpup' || this.id === 'printClose' || this.id === 'bkdUnitClose' || this.id === 'cargoListClose')) {
                                $(this).closest('.ui-dialog-content').dialog('close');
                            }
                        });
                $('.dialogCloseBtn').click(function() {
                    $(this).closest('.ui-dialog-content').dialog('close');
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
                // Quick Book Freight & Charges Click Event
                $(document).on('click', '.formRow .freightChargesSubDivtoggle .freightApplyRate', function() {
                    nsBooking.applyRate(this);
                });
                $(document).on('click', '.removePortElement', function() {
                    $(this).parents('.portsCallForm ').remove();
                    nsBooking.quickSubCount = nsBooking.quickSubCount - 1;
                    if (nsBooking.quickSubCount <= 1) {
                        $('#addNewBooking').removeClass('disabledBut');
                        $('#addNewBooking').removeAttr('disabled');
                        $('.portsCallForm').find('.removePortElement').hide();
                    }
                });
                $(document).on('click', '#actionListLink7', function() {
                    $('#actionListPopup7').dialog({
                        modal : true,
                        resizable : false,
                        draggable : false,
                        width : '85%'
                    });
                    if ($.fn.DataTable.fnIsDataTable($('#addUpdateChargesGrid'))) {
                        $.fn.DataTable($('#addUpdateChargesGrid')).clear();
                    } else {
                        $('#addUpdateChargesGrid').DataTable({
                            'scrollX' : true,
                            'sPaginationType' : 'full_numbers',
                            'processing' : true,
                            'serverSide' : false,
                            'bFilter' : false,
                            'tabIndex' : -1,
                            'bSort' : false,
                            'paging' : false,
                            'ordering' : false,
                            'info' : false,
                            'dom' : '<t>',
                            fnInitComplete : function() {
                                $('th').unbind('keypress');
                            },
                            'columns' : [
                                {
                                    width : '14%'
                                }, {
                                    width : '14%'
                                }, {
                                    width : '14%'
                                }, {
                                    width : '10%'
                                }, {
                                    width : '14%'
                                }, {
                                    width : '8%'
                                }, {
                                    width : '9%'
                                }, {
                                    width : '11%'
                                }, {
                                    width : '5%'
                                }
                            ]
                        });
                    }
                });
                $('#actionAddNewCharge')
                    .click(
                        function() {
                            var lastRow = $('#addUpdateChargesGrid tbody tr:last-of-type').clone(), rowCount = ($('#addUpdateChargesGrid tbody tr:visible').length + 1);
                            lastRow.find('.serialNum').text(rowCount);
                            lastRow.show().find('input,select').val('');
                            lastRow.appendTo($('#addUpdateChargesGrid tbody'));
                        });
                $(document).on('click', '.rowRemoveIcon', function() {
                    $(this).closest('tr').hide();
                });
                $('#actionListPopup7').on('click', '#addUpdateChargesGrid .rowRemoveIcon', function(e) {
                    var items = $('#addUpdateChargesGrid tbody tr:visible');
                    var i = 0;
                    e.stopPropagation();
                    $(this).closest('tr').hide();
                    for (i = 0; i < items.length; i++) {
                        $(items[i]).find('.serialNum').text(i + 1);
                    }
                });
                $(document).on('click', '.removePortElement', function() {
                    $(this).parents('.portsCallForm ').remove();
                });
                $(document).on('click', '#massActionWarning', function() {
                    $('#massActionWarningPopUp').dialog('open');
                });
                $(document).on('click', '.freightChargesHeader', function() {
                    $(this).next('.freightChargesCollapse').slideToggle();
                });
                // sub booking js code starts from here
                $(document).on('click', '.billLadingCommentsContentWrapper .addMoreDiv.addParty', function() {
                    $(this).closest('.ladingPartyItem').remove();
                });
                $(document).on('click', '.billLadingCommentsContentWrapper .smallRemoveIcon', function() {
                    $(this).closest('formRow').remove();
                });
                $('.cargoDetailsHeader').click(function() {
                    $(this).next('.cargoDetailsCollapse').slideToggle();
                });
                $('.voyageDetailsHeader').click(function() {
                    $(this).next('.voyageDetailsCollapse').slideToggle();
                });
                $('#billLadingDetailsForm').submit(function(e) {
                    e.preventDefault();
                });
            });
    $.extend(true, nsBooking, bookingTableObj);
})(this.booking, jQuery, this.bookDoc, this.core);
