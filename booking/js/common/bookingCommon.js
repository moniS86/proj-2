/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
this.booking = {};
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var bookingObj = {
        'dtPath': '../resources/app/swf/copy_csv_xls_pdf.swf',
        'bookingMailCnfrm': '/Vms/booking/sendConfirmationMail',
        'bookingAllocation': '/Vms/allocation/getSailingDate?vesselCode=',
        'bookingDltCharge': '/Vms/subbooking/deleteCharge',
        'bookingRateCharges': '/Vms/masterdata/ratecharges',
        'BookingCustEmail': '/Vms/booking/getCustEmailAddr?bookingId=',
        'bookingIdOrgetfrght': '/Vms/booking/getFreightParticulars?bookingId=',
        'viewPrintSettings': '/Vms/bol/viewPrintSettings',
        'updatePrintSettings': '/Vms/bol/updatePrintSettings',
        'updateBill': '/Vms/bol/updateBill',
        'consignmentPreviewBL': '/Vms/booking/consignmentPreviewBL',
        'reportsLink': '/Vms/resources/reports/',
        'commenttypes': '/Vms/masterdata/commenttypes',
        'getCommentList': '/Vms/bol/getCommentList',
        'measurement': '/Vms/masterdata/measurementSystems',
        'cargoDetails': '/Vms/subbooking/getCargoDetails',
        'dltCargo': '/Vms/subbooking/deleteCargo',
        'bookSmry': '/Vms/booking/mainBookingChargeSummaryDetails?idNum=',
        'bookingEditData': '/Vms/customer/editData',
        'bookingCustAdd': '/Vms/customer/editDataAddr',
        'bookingDltBolP': '/Vms/booking/deleteBOLParty',
        'BookingBolCmtDlt': '/Vms/bol/deleteBOLComment',
        'bookingGetCmtTxt': '/Vms/bol/getCommentText?commentId=',
        'errorMsg': 'Something went wrong. Please contact your admin.',
        'supComSearch': '/Vms/supplier/search',
        'postCurrencyUrl1': '/Vms/autoComplete/currency',
        'getFreightBasis': '/Vms/rate/getFreightBasis',
        'chargeTypeSearch': '/Vms/chargeType/search',
        'bookBolTypes': '/Vms/masterdata/boltypes',
        'partyTypes': '/Vms/masterdata/partytypes',
        'voyageList': '/Vms/autoComplete/voyageList',
        'makeModel': '/Vms/modelType/makemodel',
        'custList': '/Vms/autoComplete/customerlist',
        'transportTypes': '/Vms/masterdata/transporttypes',
        'carrierType': '/Vms/masterdata/carriertypes',
        'getAllTerminal': '/Vms/booking/getAllTerminals?portCode=',
        'vesselSailingDate': '/Vms/massaction/',
        'updateDateFormat': '/Vms/subbooking/updateSubBooking?dateFormat=',
        'addSubBooking': '/Vms/subbooking/addSubBooking',
        'freshBooking': '/Vms/booking/copyFreshBook?&modelType=BOOK',
        'orginPort': '/Vms/booking/getVoyages?originPort=',
        'addLeg': '/Vms/subbooking/addLeg',
        'viewBookConf': '/Vms/booking/viewBookingConfirmation?bookingId=',
        'loadPrevBlReport': '/Vms/bol/loadPreviewBLReport',
        'copyFreshBook': '/Vms/booking/copyFreshBook?bookId=',
        'viewSubBooking': '/Vms/subbooking/viewSubBooking?bookingId=',
        'viewBookingID': '/Vms/booking/viewBooking?bookingId=',
        'bookingCargoStates': '/Vms/masterdata/cargoStates?module=booking&cargoTypeId=',
        'cargoGroup': '/Vms/masterdata/cargoGroup?cargoTypeId=',
        'getAllocAvlCount': '/Vms/booking/getAllocationAvlCount?customerId=',
        'viewCargoList': '/Vms/subbooking/viewCargoList',
        'updateCargoList': '/Vms/subbooking/updateCargoList',
        'searchByCriteria': '/Vms/booking/searchByCriteria',
        'fetchSubBooking': '/Vms/booking/fetchBOLInfo',
        'fetchConsignments': '/Vms/booking/fetchConsignments',
        'moveUnitsSave': '/Vms/booking/moveUnitsSave',
        'moveUnitOrBooking': '/Vms/booking/moveUnits?bookingId=',
        'fvCapacity': '/Vms/booking/findVesselCapacity?id=',
        'possVoyagesForBook': '/Vms/booking/possibleVoyages?originPort=',
        'updateBooking': '/Vms/booking/updateBooking',
        'searchAll': '/Vms/modelType/searchAll',
        'updateCargoDetails': '/Vms/subbooking/updateCargoDetails',
        'copySubBooking': '/Vms/subbooking/copy?userName=',
        'getDefaultCharges': '/Vms/booking/getDefaultCharges?bookingId=',
        'defaultCurrency': '/Vms/currency/defaultCurrency',
        'cargoGroupUrl': '/Vms/masterdata/cargoGroup?cargoTypeId=',
        'possibleVoyages': '/Vms/booking/possibleVoyages?originPort=',
        'cargoStates': '/Vms/masterdata/cargoStates?module=booking&cargoTypeId=',
        'removeLeg': '/Vms/subbooking/removeLeg?consignmentLegId=',
        'equipments': '/Vms/masterdata/equipments',
        'sbID': '../subbooking/lastChangedDetails?subbookingId=',
        'rateLinkAccess' : '/Vms/officedefault/defaultRateAccess?companyId=0',
        'billTypeNum' : '/Vms/officedefault/defaultBolTypes?companyId=0',
        'editLegSDate' : '',
        'editLegNxtSDate' : '',
        'lcFlag':false,
        'bookUnitPopUpFlag': false,
        'rateLinkAccessFlag' : '',
        'bookingHeadFlag': false,
        'bookingNewFlag': false,
        'chrgRateFlag' : false,
        'prevVoyCheck' : false,
        'chargeCont': '',
        'navigateToClickedPath': navigateToClickedPath,
        'buildToolTip': buildToolTip,
        'buildCargoVin': buildCargoVin,
        'bulidMassActionWariningPopUp': bulidMassActionWariningPopUp,
        'buildUpdateVesselUI': buildUpdateVesselUI,
        'loadbookingcontent': loadbookingcontent,
        'activeSubBookingOnAddLeg':activeSubBookingOnAddLeg,
        'activeBooking': activeBooking,
        'setIssuedAt': setIssuedAt,
        'setPayableAt': setPayableAt,
        'filterCommentTypeOptions': filterCommentTypeOptions,
        'getFreightParticulars': getFreightParticulars,
        'clearAddEditPopups': clearAddEditPopups,
        'textFieldNullCheck': textFieldNullCheck,
        'textNullCheck': textNullCheck,
        'populateTerminalChanges': populateTerminalChanges,
        'loadRouteInfo': loadRouteInfo,
        'isNewCargo': isNewCargo,
        'generatePartySelect': generatePartySelect,
        'makeAndModelQuickBook': makeAndModelQuickBook,
        'hasWhiteSpace': hasWhiteSpace,
        'getBolTypes': getBolTypes,
        'createBookingTbl': createBookingTbl,
        'initializeDropEvent': initializeDropEvent,
        'createTooltipContent': createTooltipContent,
        'nullCheck': nullCheck,
        'sbChargeType' : [],
        'newBookId' : '',
        'bookLpDpCheck': [],
        'lpDpCheck' : false,
        'newLpVal' : '',
        'newDpVal' : '',
        'dpArr' : [],
        'lpArr' : []
    };

    function nullCheck(inputVal) {
        return ((!inputVal) ? '' : inputVal);
    }

    function loadRouteInfo(element) {
        var legID = '',
            custoID = '',
            userName = '',
            postUrlf ='',
            ids = '',
            postUrl1 = '';
        nsBooking.mainRoutekey = $(element).attr('data-discPort');
        if (nsBooking.mainRoutekey === 'No Voyage') {
            nsBooking.fnoVoyage = true;
            return;
        }
        $('input[name="mainLeg"]:checked').each(function() {
            var tdElem = $(this).closest('tr');
            nsBooking.fmainTrade = $(tdElem).find('td:nth-child(3)').text();
            nsBooking.fmainSrcPort = $(tdElem).find('td:nth-child(4)').text();
            nsBooking.fmaindestPort = $(tdElem).find('td:nth-child(6)').text();
        });
        legID = $(element).closest('tr').find('.consignmentLegsClass').attr('data-id');
        custoID = ($('.mainSubBookFormTitle').text() === '' ? $('#maincustomerID').val() : ($('.subBookLevel #maincustomerID').val() === '' ? $('#maincustomerID').val() : $('.subBookLevel #maincustomerID').val()));
        userName = $('#userName').val();

        postUrlf = '/Vms/booking/getBookingAllocDetail?consLegId=' + legID + '&customerId='
        + custoID + '&userId=' + userName;

        vmsService.vmsApiService(function(response){
            if(response){
                nsBooking.fcarReAvl = response.allocationForCarPreCarriage;
                nsBooking.fpuReAvl = response.allocationForPUPreCarriage;
                nsBooking.fhhReAvl = response.allocationForHHPreCarriage;
                nsBooking.fstReAvl = response.allocationForSTPreCarriage;

                if (nsBooking.fcarReAvl < 0) {
                    nsBooking.fcarReAvl = 0;
                }
                if (nsBooking.fpuReAvl < 0) {
                    nsBooking.fpuReAvl = 0;
                }
                if (nsBooking.fhhReAvl < 0) {
                    nsBooking.fhhReAvl = 0;
                }
                if (nsBooking.fstReAvl < 0) {
                    nsBooking.fstReAvl = 0;
                }
            } else{
                nsBooking.fcarReAvl = 0;
                nsBooking.fpuReAvl = 0;
                nsBooking.fhhReAvl = 0;
                nsBooking.fstReAvl = 0;
                nsCore.showAlert(bookingObj.errorMsg);
            }
        }, postUrlf, 'GET', null);
        $('#routeDetailGrid tbody tr .addLeg').each(function() {
        	 if($('#routeDetailGrid tbody tr .addLeg').attr('data-constype')==='M'){
        		 ids = $('#routeDetailGrid tbody tr .addLeg').attr('data-vesselId');
             }
        });
        if (ids && ids!==0 && ids!=='undefined') {
            postUrl1 = bookingObj.fvCapacity + ids;
            vmsService.vmsApiService(function(response){
                if(response && response.particulars){
                    nsBooking.fmaxHeightCapacity = response.particulars.maxCargoHeight;
                    nsBooking.fmaxWeightCapacity = response.particulars.maxRampWeight;
                } else {
                	if(response !== '') {
                		nsCore.showAlert(bookingObj.errorMsg);
                	}
                }
            }, postUrl1, 'GET', null);
        }
    }

    function isNewCargo(vin) {
        if (!vin) {
            vin = 'New Cargo';
        }
        return vin;
    }

    function makeAndModelQuickBook(make, model) {
        $(document).on('focus.autocomplete', make, function() {
            $(make).autocomplete({
                source: function(req, responseFn) {
                    var re = $.ui.autocomplete.escapeRegex(req.term),
                        matcher = new RegExp('^' + re, 'i'),
                        a = $.grep(nsBooking.makeIDs, function(item) {
                        return matcher.test(item);
                    });
                    responseFn(a);
                },
                delay:0,
                autoFocus: true
                
            });
        });
        $(document).on('focus.autocomplete', model, function() {
            $(model).autocomplete({
                source: function(req, responseFn) {
                    var re = $.ui.autocomplete.escapeRegex(req.term),
                        matcher = new RegExp('^' + re, 'i'),
                        a = $.grep(nsBooking.modelIDs, function(item) {
                        return matcher.test(item);
                    });
                    responseFn(a);
                },
                delay: 0,
                autoFocus: true
            });
        });
    }

    function hasWhiteSpace(s) {
        return /\s/g.test(s);
    }

    function generatePartySelect(options, isSelectedValue, onlyOptions) {
        var dropDownText = '';
        if (!onlyOptions) {
            dropDownText += '<select>';
        }
        $.each(options, function(i, obj) {
            nsBooking.isSelected = (obj === isSelectedValue) ? ' selected ' : '';
            dropDownText += '<option value="' + obj + '" ' + nsBooking.isSelected + '>'
            + nsBooking.globalPartyText[obj] + '</option>';
        });
        if (!onlyOptions) {
            dropDownText += '</select>';
        }
        return dropDownText;
    }

    function navigateToClickedPath(clickedLinkPath) {
        window.location.href = clickedLinkPath;
    }

    function initializeDropEvent(isSameSelection, checkValidMove, validateAlloc, isNewCargoMove, checkWithoutAlloc,
        checkCargoTypeSame, getSubbookingData, blnValidBol, checkBolStatus) {
        $('#moveToSubBookUnits .cargoVin').droppable({
            accept: '#moveFromCargoUnits .CargoUnitVin.ui-selecting',
            hoverClass: 'ui-state-active',
            tolerance: 'intersect',
            over: function() {
                // memoization - javascript saving memory
                var dropIntoDiv = $(this),
                    movingIntoDivId = dropIntoDiv.data('subbookingid'),
                    objData = {},
                    objFromData = {},
                    blnValid = false,
                    blnValidSpace = true,
                    blnValidCargoUnit = true,
                    blnValidCargoType = true,
                    blnValidNewCargo =
                    true,
                    blnValidMove = '',
                    beforeCargoUnits = [],
                    cargoTypeIds = [],
                    movingFromMainDiv = $('#subBookingsFromContent').find('.activeFromSubBook').data('subbookingid'),
                    movingToMainDiv = movingIntoDivId;
                if (nullCheck(movingToMainDiv) !== '') {
                    blnValidMove = nsBooking.isSameSelection(movingFromMainDiv, movingIntoDivId);
                    objFromData = nsBooking.getSubbookingData(movingFromMainDiv);
                    objData = nsBooking.getSubbookingData(movingToMainDiv);
                    nsBooking.blnValidBol = nsBooking.checkBolStatus(objFromData);
                    $('#moveFromCargoUnits .CargoUnitVin.ui-selecting').each(function(eleCount, ele) {
                        beforeCargoUnits.push($(ele).attr('data-cargoUnitId'));
                        cargoTypeIds.push($(ele).attr('data-cargoTypeId'));
                        // condition 3
                        if ($(ele).attr('data-statusCode') === '4') {
                            if (objFromData.voyageId === objData.voyageId) {
                                blnValidCargoUnit = true;
                            } else {
                                blnValidCargoUnit = false;
                            }
                        }
                    });
                    blnValidCargoType = nsBooking.checkCargoTypeSame(objData.cargoTypeId, objFromData.cargoTypeId);
                    blnValidSpace = nsBooking.validateAlloc(objData, objFromData, beforeCargoUnits.length);
                    blnValidNewCargo = nsBooking.isNewCargoMove(objFromData, objData);
                    blnValid = nsBooking.checkValidMove(blnValidCargoUnit, blnValidSpace, blnValidMove,
                            blnValidBol, blnValidCargoType, blnValidNewCargo);
                    if (blnValid) {
                        dropIntoDiv.removeClass('ui-state-active').addClass('ui-state-success-new');
                        $(dropIntoDiv).parent().parent().addClass('dragDropSuccess');
                        return true;
                    } else {
                        dropIntoDiv.addClass('ui-state-error');
                        $(dropIntoDiv).parent().parent().addClass('dragDropError');
                        return false;
                    }
                }
            },
            out: function() {
                var self = $(this);
                self.removeClass('ui-state-error');
                self.removeClass('ui-state-success-new');
                $(self).parent().parent().removeClass('dragDropError dragDropSuccess');
            },
            deactivate: function() {
                var self = $(this);
                self.removeClass('ui-state-error');
                self.removeClass('ui-state-success-new');
                $(self).parent().parent().removeClass('dragDropError dragDropSuccess');
            },
            drop: function(event, ui) {
                var dropIntoDiv = $(this),
                    movingIntoDivId = dropIntoDiv.data('subbookingid'),
                    objData = {},
                    objFromData = {},
                    blnValid = false,
                    blnValidSpace = true,
                    blnValidCargoUnit = true,
                    blnValidCargoType = true,
                    blnValidNewCargo = true,
                    blnValidMove = '',
                    beforeCargoUnits = [],
                    cargoTypeIds = [],
                    movingFromMainDiv = $('#subBookingsFromContent').find('.activeFromSubBook').data('subbookingid'),
                    consFromTimeStamp = $('#subBookingsFromContent').find('.activeFromSubBook').data('constimestamp'),
                    consToTimeStamp = dropIntoDiv.data('constimestamp'),
                    movingToMainDiv = movingIntoDivId;
                if (nullCheck(movingToMainDiv)) {
                    blnValidMove = isSameSelection(movingFromMainDiv, movingIntoDivId);
                    objFromData = getSubbookingData(movingFromMainDiv);
                    objData = getSubbookingData(movingToMainDiv);
                    blnValidBol = checkBolStatus(objFromData);
                    $('#moveFromCargoUnits .CargoUnitVin.ui-selecting').each(function(elecou, ele) {
                        beforeCargoUnits.push($(ele).attr('data-cargoUnitId'));
                        cargoTypeIds.push($(ele).attr('data-cargoTypeId'));

                        if ($(ele).attr('data-statusCode') === '4') {
                            if (objFromData.voyageId === objData.voyageId) {
                                blnValidCargoUnit = true;
                            } else {
                                blnValidCargoUnit = false;
                            }
                        }
                    });
                    blnValidCargoType = checkCargoTypeSame(objData.cargoTypeId, objFromData.cargoTypeId);
                    blnValidSpace = validateAlloc(objData, objFromData, beforeCargoUnits.length);
                    blnValidNewCargo = isNewCargoMove(objFromData, objData);
                    if (checkWithoutAlloc(blnValidCargoUnit, blnValidBol, blnValidMove,
                            blnValidCargoType,
                            blnValidNewCargo) &&
                        (!blnValidSpace)) {
                        nsCore.showAlert('Cannot move units due to lack of allocation space');
                        ui.draggable.draggable('option', 'revert', true);
                        return false;
                    }
                    blnValid =
                        checkValidMove(blnValidCargoUnit, blnValidSpace, blnValidBol, blnValidMove,
                            blnValidCargoType, blnValidNewCargo);
                    if (!blnValid) {
                        ui.draggable.draggable('option', 'revert', true);
                        return false;
                    } else {
                        nsBooking.invokeUpdateCall($(this), movingToMainDiv, movingFromMainDiv, ui,
                            consFromTimeStamp, consToTimeStamp);
                    }
                }
            }
        });
    }

    function getBolTypes(response) {
        var preBLType = '',
            select = '',
            bltypes = '',
            selectStart = '<select name="type" id="bolType" style="height:40px;">',
            i = 0,
            bolTypes = '';
        preBLType = '<option value="" selected>-- Select --</option>';
        for (i in response.responseData) {
            if (response.responseData.hasOwnProperty(i)) {
                bltypes = bltypes + '<option value="' + response.responseData[i].code + '">' +
                    response.responseData[i].desc + '</option>';
            }
        }
        select = '</select>';
        bolTypes = selectStart + preBLType + bltypes + select;
        return bolTypes;
    }

    function createTooltipContent(rowIndex, textBoxVal) {
        var tooltipContent = '';
        tooltipContent += '<span class="icons_sprite removeIcon dialogCloseIcon toolTipCloseIcon fa fa-remove"></span>'
            + '<div class="textAreaWrap textarea-1">';

        tooltipContent += '<div class="addrTextAreaWrap"><textarea data-rowIndex="' + rowIndex
            + '" rows="15" cols="80" class="tooltipTextarea" maxlength="4000">' + textBoxVal + '</textarea>';

        tooltipContent += '<div class="submitFromData tooltipSubmitFormData"><div class="formSubmitButtons">'
            + '<a href="javascript:void(0)" class="orangeButton saveButton'
            + ' updateBlComment center">Update</a></div></div></div></div>';

        return tooltipContent;
    }

    function createBookingTbl(response) {
        var bookingTbl = $('#bookingVesselListGrid').DataTable({
            'processing': true,
            'serverSide': false,
            'bFilter': true,
            'tabIndex': -1,
            'bSort': false,
            'paging': false,
            'ordering': true,
            'order': [
                [3, 'desc']
            ],
            'info': false,
            'searching': false,
            'dom': '<t>',
            'scrollY': '500px',
            'scrollCollapse': true,
            'aaData': response.responseData,
            'bAutoWidth': false,
            'columns': [{
                data: 'checked',
                sWidth: '33px',
                'render': function(data, type, full) {
                    return '<input type="radio" name="voyageList" class="applyVoyage" value="' +
                        full.vesselCode + '">';
                }
            }, {
                data: 'vesselCode'
            }, {
                data: 'vesselName'
            }, {
            	 data: 'voyageNo',
                 'render': function(data){
                 	return '<p class="numericField bvNumField">'+data+'</p>'
                 }
            }, {
                data: 'tradeCode'
            }, {
                data: 'startDate'
            }]
        });
        return bookingTbl;
    }
  

    //function to build tool tip
    function buildToolTip(toolTip, a, b, c, d, e, f, g, h, i, j, k, l, m, element) {
        toolTip += '<div class="toolTipWrap cargoListToolTip"><span class="icons_sprite leftArrowIcon">' +
                '</span><span class="icons_sprite removeIcon toolTipCloseIcon fa fa-remove"></span>'
                +'<div class="toolTip toolTipContent headerGreyBanner"><h1 class="cargoListToolTipTitle">'
				+ element.attr('data-vinNumber') + '</h1></div>';

        toolTip += '<table cellspacing="0" cellpadding="0" class="toolTipList">';
        toolTip += '<tr><td class="bold"> Cargo On Hold</td><td> ' + a + '</td></tr>';
        toolTip += '<tr><td class="bold">New Cargo</td><td> ' + b + '</td></tr>';
        toolTip += '<tr><td class="bold">Customs Ref</td><td> ' + c + '</td></tr>';
        toolTip += '<tr><td class="bold">Reg plate</td><td> ' + d + '</td></tr>';
        toolTip += '<tr><td class="bold">Load Port Terminal</td><td> ' + e + '</td></tr>';
        toolTip += '<tr><td class="bold">Discharge Port Terminal</td><td> ' + f + '</td></tr>';
        toolTip += '<tr><td class="bold">Length</td><td class="numericField"> ' + g + '</td></tr>';
        toolTip += '<tr><td class="bold">Width</td><td class="numericField"> ' + h + '</td></tr>';
        toolTip += '<tr><td class="bold">Height</td><td class="numericField"> ' + i + '</td></tr>';
        toolTip += '<tr><td class="bold">Area</td><td class="numericField"> ' + j + '</td></tr>';
        toolTip += '<tr><td class="bold">Volume</td><td class="numericField"> ' + k + '</td></tr>';
        toolTip += '<tr><td class="bold">Weight</td><td class="numericField"> ' + l + '  ' + m + ' </td></tr>';
        return toolTip;
    }
    function definedValue(value){
    	if(value && value !== 'null' && value !== 'undefined'){
    		return value;
    	} else {
    		return '';
    	}
    }
    //function to build cargo Vin
    function buildCargoVin(data, full) {
        return '<input type="text" class="greenText cargoVinNbr" data-consId="'
            + full.consignmentId + '" data-cargoId="' + (full.cargoId) + '" data-viewcargotimestamp="' + (full.timeStamp)
            + '"  data-id="' + full.consignmentLegId + '"  data-dateLoaded="' + definedValue(full.loadedDate) + '" data-receivedDate="'
            + definedValue(full.receivedDate) + '" data-releaseLoadDate="' + definedValue(full.releasedLoadDate) + '" value="' + data
            + '"  maxlength="18"/></span><span class=" icons_sprite existingVin cargoDetailsVinIcon fa fa-file-text" data-equipType="'
            + definedValue(full.equipType) + '" data-newCargo="' + definedValue(full.newCargo) + '" data-vinNumber="'
            + definedValue(full.vinNumber) + '" data-cargoOnHold="' + definedValue(full.cargoOnHold) + '" data-loadedDate="'
            + definedValue(full.loadedDate) + '" data-receivedDate="' + definedValue(full.receivedDate) + '" data-releaseLoadDate="'
            + definedValue(full.dateReleasedLoad) + '" data-actualLength="' + definedValue(full.dimension.length) + '" data-actualWidth="'
            + definedValue(full.dimension.width) + '" data-actualHeight="' + definedValue(full.dimension.height) + '" data-actualWeight="'
            + definedValue(full.dimension.weight) + '" data-actualArea="' +definedValue(full.dimension.area) + '" data-actualVolume="'
            + definedValue(full.dimension.volume) +'" data-loadPort="' + definedValue(full.cargoLoadPort) + '" data-discPort="'
            + definedValue(full.cargoDiscPort) + '" data-equipNumber="' + definedValue(full.equipNumber) + '" data-receiptNumber="'
            + definedValue(full.receiptNumber) + '" data-WeightType="' + definedValue(full.dimension.dimensionType)
            + '" data-registrationPlate="' + definedValue(full.registrationPlate) + '" data-customerRef="'
            + definedValue(full.customerRef) + '" data-termLoad="' + definedValue(full.loadTerminalCode) + '"  data-termDisc="'
            + definedValue(full.discTerminalCode)
            + '"><input type="hidden" class="cargoStatusCode" value="' + full.statusCode + '">';
    }

    //function to build mass action warning pop-up
    function bulidMassActionWariningPopUp(warningMap, v, str) {
        str += '<div class="cargoVin billVin singleColItem accHead massBooking" data-filtering="'
            + warningMap[v].parentName + '" data-bookingid="' + v + '">';

        str += '<span class="icons_sprite fa fa-plus plusIcon toggleBooking"></span><span>' + warningMap[v].parentName
            + '</span>(<span>' + warningMap[v].consignmentItemList.length + '</span>)';

        str += '<div class="mainBookingItemIcons"></div></div><div class="accBody hide">';

        $.each(warningMap[v].consignmentItemList, function(ind, val) {
            str += '<div class="cargoVin billVin" data-subbookingid="' + val.consignmentID + '">'
                + (val.consignmentName.length!==11 ? val.consignmentName : val.consignmentName+'New Sub Booking') + '<div class="mainBookingItemIcons"></div></div>';
        });

        str += '</div>';

        return str;
    }

    //to build vessel pop up Ui
    function buildUpdateVesselUI(itemsMap, str) {
        $.each(Object.keys(itemsMap), function(i, v) {
            str += '<div class="cargoVin billVin singleColItem accHead massBooking" data-filtering="'
                + itemsMap[v].parentName + '" data-bookingid="' + v + '">';

			str += '<span class="icons_sprite fa fa-plus toggleBooking"></span><span>' + itemsMap[v].parentName
                + '</span>(<span>' + itemsMap[v].consignmentItemList.length + '</span>)';

			str += '<div class="mainBookingItemIcons"><span class="icons_sprite rowRemoveIcon fa fa-remove">'
                +'</span></div></div><div class="accBody hide">';

			$.each(itemsMap[v].consignmentItemList, function(ind, val) {
                str += '<div class="cargoVin billVin singleColItem" data-subbookingid="' + val.consignmentID + '">'
                + (val.consignmentName.length!==11 ? val.consignmentName : val.consignmentName+'New Sub Booking') + '<div class="mainBookingItemIcons"><span class="icons_sprite rowRemoveIcon fa fa-remove">'
                +'</span></div></div>';
            });

            str += '</div>';

        });
        return str;
    }
    //function to populate header details
    function populateHeaderDetail(response) {
        $('#bookingOfficeId').val(response.compIdAlloc);
        if (response.sameLPDP === 'N') {
            $('#mainBookDetailCustomerOrigin').val('').attr('disabled', 'disabled');
            $('#mainBookDetailCustomerOriginDesc').val('').attr('disabled', 'disabled');
			$('#mainBookDetailCustomerDestination').val('').attr('disabled', 'disabled');
            $('#mainBookDetailCustomerDestinationDesc').val('').attr('disabled', 'disabled');
            $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').hide();
            $('.mainBookingDetailsWrap .showPreviousVoyageClass').hide();
            nsBookDoc.subBookingdiffOrgDest(true)
        } else {
            $('#mainBookDetailCustomerOrigin').removeAttr('disabled').val(response.bookingOriginPort);
            $('#mainBookDetailCustomerOriginDesc').removeAttr('disabled').val(response.bookingOriginPortDesc);
            $('#mainBookDetailCustomerDestination').removeAttr('disabled').val(response.bookingDestPort);
            $('#mainBookDetailCustomerDestinationDesc').removeAttr('disabled').val(response.bookingDestPortDesc);
            $('.mainBookingDetailsWrap .getPossibleVoyages,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
            $('#possVoyagesHide').hide();
            $('.mainBookingDetailsWrap .showPreviousVoyageClass').show();
            nsBookDoc.subBookingdiffOrgDest(false)
        }
        if (response.routeDetailEnable === 'N') {
            if (response.sameLPDP === 'N') {
                $('#mainBookDetailCustomerCode').attr('disabled', 'disabled');
                $('#mainBookDetailCustomerDesc').attr('disabled', 'disabled');
                $('#mCustomerRef').attr('disabled', 'disabled');
                $('#mainContract').attr('disabled', 'disabled');
            } else {
                $('#mainBookDetailCustomerCode').removeAttr('disabled');
                $('#mainBookDetailCustomerDesc').removeAttr('disabled');
                $('#mCustomerRef').removeAttr('disabled');
                $('#mainContract').removeAttr('disabled');
            }
        } else {
            $('#mainBookDetailCustomerCode').removeAttr('disabled');
            $('#mainBookDetailCustomerDesc').removeAttr('disabled');
            $('#mCustomerRef').removeAttr('disabled');
            $('#mainContract').removeAttr('disabled');
        }
        $('#mainBookDetailCustomerCode').val(response.customerCode).attr('data-form', response.customerCode);
        $('label#mainBookDetailCustomerCode').text(response.customerCode);
        $('#mainBookDetailCustomerDesc').val(response.customerName).attr('data-form', response.customerName);
        $('label#mainBookDetailCustomerDesc').text(response.customerName);
        $('#maincustomerID').val(response.companyId);
        loadHeaderContent(response);
    }

    //function to load header content
    function loadHeaderContent(response) {
        var allocationStatus = '';
        if (nsBooking.textNullCheck(response.bookingOriginPort)) {
            $('#mainBookDetailCustomerOrigin').attr('data-form1', '1');
        }
        if (nsBooking.textNullCheck(response.bookingOriginPortDesc)) {
            $('#mainBookDetailCustomerOriginDesc').attr('data-form1', '1');
        }
        if (nsBooking.textNullCheck(response.bookingDestPort)) {
            $('#mainBookDetailCustomerDestination').attr('data-form2', '1');
        }
        if (nsBooking.textNullCheck(response.bookingDestPortDesc)) {
            $('#mainBookDetailCustomerDestinationDesc').attr('data-form2', '1');
        }
        $('#mCustomerRef').val(response.customerRef);
        $('label#mCustomerRef').text(response.customerRef);
        $('#mainContract').val(response.contractId);
        $('label#mainContract').text(response.contractName);
        if (!(nsBooking.textNullCheck(response.bookingAllocStatus)) || response.bookingAllocStatus === 'Y') {
            allocationStatus = 'Y';
        } else {
            if (response.bookingAllocStatus === 'N') {
                allocationStatus = response.bookingAllocStatus;
            }
        }
        $('#opsDetailOpeningType').val(allocationStatus);
    }
    function loadbookingcontent(response, bookingId, functionName, bookingNumber, isBookingFormReset) {
    	nsBooking.fectSubBookingObj = response;
    	nsBooking.headerPanelEnable(true, []);
        var bookingsListContent = '';
        $('.mainSubBookingListWrap .subBookingNbrsHdr').show();
        nsBooking.mainBookingFlag.changedOriginDest = false;
        $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'false');
        $('select[name="bookingAllocStatus"]').removeAttr('disabled');
        nsBooking.subBookingContent = '';

        if (functionName !== 'Exist') {
        	 $('.mainBookingListWrap .subBookContentListCol .newBookLabel.treeListLabel').remove();
             bookingsListContent = nsBooking.generateSingleBookingItemForMenuItem(bookingId, bookingNumber,
                 response.bookingAllocStatus, response.customerCode);
             nsBooking.updateMainBookingCount(1);
             $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt').children()
                 .removeClass('activeSubBook ui-selecting');
             $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt').append(bookingsListContent);
             if($('.searchRes').css('display') !== 'none'){
            	$('.searchRes').trigger('click');
            }
            $('.mainBookingDetailsWrap .mainBookingDetailFormTitle')
                .html('Booking Details - <span id="mainBookDetailTitleeVal">' + bookingNumber + '</span>');
            $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt')
                .children('[data-filtering=' + bookingNumber + ']').addClass('activeSubBook ui-selecting');
            $('.mainMoveUnitsLnk,#mainViewSummaryLink,.routeDetailsWrapper,.possibleVoyageWrap, #possibleVoyageRow')
                .hide();
            $('.defaultSearchMsg').hide();
            // for quick booking showing the mainbooking and subbookingwrap
            if (!$('.mainBookingDetailsWrap').is(':visible')) {
                $('.mainBookingDetailsWrap,.mainSubBookingListWrap').show();
            }
            if (response.statusMsg) {
                $('.statusMessage').show();
            }
            $('.mainBookingListWrap .subBookContentListCol .newBookLabel').text(bookingNumber);
        }

        // hiding the possible voyages on load of the page/form
        $('#possibleVoyageNewWrapId, #createFreshBook .possibleVoyageWrap').css('display', 'none');
        $('#moveUnitsbooking').text(response.bookingNumber);
        nsBooking.clearNewBook();
        populateHeaderDetail(response);
        nsBooking.populateSubbookingTree(response, isBookingFormReset);
        if (functionName !== 'Exist') {
        	$($('.thrdLevel[data-bookingId='+bookingId+']')[0]).attr('id', 'thrdLevel' + $('.scndLevel[data-bookingId='+bookingId+']').attr('id').substring(9,13)+'_0');
            $('.mainBookingListWrap .subBookContentListCol .singleColItem.thrdLevel').trigger('click');
        }
        nsBooking.populateEquipment(0);
    }
    function activeSubBookingOnAddLeg() {
    	nsBooking.isDiffFreight = false;
        if(( $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').text().indexOf('-0-New Sub Booking') === -1)){
	        $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').each(function(i,v) {
	            if ($(v).hasClass('ui-selecting')) {
	                $(v).trigger('click');
	                $(v).addClass('ui-selecting');
	            }
	        });
	        if($('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').length === 0){
	        	$('.mainBookListCol.subBookContentListCol .singleColItem.scndLevel').each(function(i,v) {
		            if ($(v).hasClass('ui-selecting')) {
		                $(v).trigger('click');
		                $(v).addClass('ui-selecting');
		            }
		        });
	        }
        }
    }
   
    //function to check active booking
    function activeBooking() {
        nsBooking.isDiffFreight = false;
        $('.mainBookingListWrap .subBookContentListCol .singleColItem.scndLevel').each(function() {
            if ($(this).hasClass('ui-selecting')) {
                $(this).trigger('click');
                $(this).addClass('ui-selecting');
            }
        });
    }

    // function to set issued comment
    function setIssuedAt(comment) {
        var optionAvailable = false,
            options = '';
        $('#billIssued > option').each(function() {
            if (this.text === comment) {
            	this.value = comment;
                $('#billIssued').val(this.value);
                optionAvailable = true;
            }
        });
        if (escape(comment) !== '') {
            if (!optionAvailable) {
                options = '<option value="' + escape(comment) + '">' + comment + '</option>';
                $('#billIssued').append(options);
            }
            $('#billIssued').val(escape(comment));
        } else {
        	$('#billIssued').val('');
        }
    }

    //function to set payable value
    function setPayableAt(comment) {
        var optionAvailable = false,
            options = '';
        $('#billFreightPayable > option').each(function() {
            if (this.text === comment) {
                $('#billFreightPayable').val(this.value);
                optionAvailable = true;
            }
        });
        if (escape(comment) !== '') {
            if (!optionAvailable) {
                options = '<option value="' + escape(comment) + '">' + comment + '</option>';
                $('#billFreightPayable').append(options);
            }
            $('#billFreightPayable').val(escape(comment));
        } else {
        	$('#billFreightPayable').val('');
        }
    }

    //function to filter comment type options
    function filterCommentTypeOptions() {
        var selectedComm = [];
        $('span option').unwrap();
        $('.blCommentsOptions option:selected').filter(function() {
            return $(this).attr('repeat') === 'false';
        }).map(function() {
            selectedComm.push($(this).attr('type'));
        });
        $('.blCommentsOptions option').filter(function() {
            return selectedComm.indexOf($(this).attr('type')) >= 0;
        }).filter(function() {
            return !($(this).parent('select').find(
			'option:selected').attr('type') === $(this).attr('type'));
        }).map(function() {
            $(this).wrap('<span/>');
        });
    }

    //function to get frieght particulars
    function getFreightParticulars(bookingId, inputField) {
        var freightParticularValue = '',
            isPrepaid = false,
            isCollect = false;
        vmsService.vmsApiService(function(response) {
            if (response) {
                $.each(response.responseData, function(key, value) {
                    if (value.prepaid === 'P') {
                        isPrepaid = true;
                    }
                    if (value.prepaid === 'C') {
                        isCollect = true;
                    }
                });
                if (isPrepaid && isCollect) {
                    freightParticularValue = 'Prepaid/Collect';
                } else if (isPrepaid && !isCollect) {
                    freightParticularValue = 'Prepaid';
                } else if (!isPrepaid && isCollect) {
                    freightParticularValue = 'Collect';
                } else {
                    freightParticularValue = '';
                }
                inputField.val(freightParticularValue);
                $(inputField).attr('disabled', 'disabled');
                $(inputField).closest('tr').find('.editIcon').addClass('disabledEditIcon');
                $('#billFreightParticulars').val((freightParticularValue || '').toUpperCase());
            } else {
                nsCore.showAlert('error, please try again later');
            }
        }, nsBooking.bookingIdOrgetfrght + bookingId, 'GET', null);
    }

    //function to clear edit Pop ups
    function clearAddEditPopups(popupName, gridList, getPossibleLnk, prevCheckBox) {
        nsBooking.clearDataGrids(gridList);
        $('#' + popupName).find('.' + getPossibleLnk).attr('data-clicked', false);
        $('#' + popupName).find('.' + prevCheckBox).prop('checked', false);
    }

    function textFieldNullCheck(field) {
        return ((!$(field).val()) ? '' : $(field).val());
    }

    function textNullCheck(text) {
        return (!text) ? '' : text;
    }

    function trmnlChangeHelper(existingVal, status, val){
        if ($.trim(existingVal) === '') {
            status += '<option value="' + val.id + '">' + val.terminalCode + '</option>';
        } else {
            if ($.trim(existingVal) === val.id) {
                status += '<option value="' + escape(val.id) + '" selected>' + val.terminalCode + '</option>';
            } else {
                status += '<option value="' + val.id + '">' + val.terminalCode + '</option>';
            }
        }
        return status;
    }

    function populateTerminalChanges(fieldName, existingVal, dropDownField, isLoadTerm) {
        var status = '<option value=""">-- Select --</option>';
        vmsService.vmsApiService(function(response) {
        	if (response && response.responseDescription === 'Success') {
        	    $.each(response.responseData, function(i, val) {
        	        if ($('#isBooking').val() === 'Y') {
        	            if (isLoadTerm === 'Y') {
        	                status = trmnlChangeHelper(existingVal, status, val);
        	            }
        	        } else {
        	            if ($.trim(existingVal) === '') {
        	                status += '<option value="' + val.id + '">' + val.terminalCode + '</option>';
        	            } else {
        	                if ($.trim(existingVal) === val.id) {
        	                    status += '<option value="' + escape(val.id) + '" selected>' + val.terminalCode +'</option>';
        	                } else {
        	                    status += '<option value="' + val.id + '">' + val.terminalCode + '</option>';
        	                }
        	            }
        	        }
        	    });
        	    $(dropDownField).html(status);
        	} else {
        	    nsCore.showAlert(nsBooking.errorMsg);
        	}
        }, nsBooking.getAllTerminal + $(fieldName).val(), 'POST', null);
    }

    $.extend(true, nsBooking, bookingObj);

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);