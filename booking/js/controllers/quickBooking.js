/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var deDocID = '',
        selectedVal = '',
        deDocCode,
        deDocName,
        formData,
        maxHeightCapacity = -1,
        maxWeightCapacity = -1,
        docIDs = [],
        docCodes = [],
        docNames = [],
        portCodes = [],
        portDesc = [],
        cargoStatesListArray = [],
        isDimensionSelected = false,
        mainSrcPort,
        maindestPort,
        carReAvl = 0,
        puReAvl = 0,
        hhReAvl = 0,
        stReAvl = 0,
        noVoyage = false,
        count = 0,
        quickBookingObj = {};

    $(document).ready(function() {
        doInit();        
        $(document).on('change', '.applyRateData', function() {
            var key = $(this).val().split('-'),
                basisCode, currCode, rate, element,
                iOrgCode = nsBooking.getOriginCode(),
                iDestCode = nsBooking.getDestinationCode(),
                iContract = nsBooking.getContract(),
                iCarSt = nsBooking.getCargoState(this),
                iHeight = nsBooking.getHeight(this),
                iVolume = nsBooking.getVolume(this),
                iWeight = nsBooking.getWeight(this),
                iNewCargo = nsBooking.getIsNewCargo(this) ? 'Yes' : '',
                iCarType = nsBooking.getCargoType(this),
                iRate = 'C',
                iTrade = nsBooking.mainTrade,
                iLoadPrt = nsBooking.getLoadPort(),
                iDiscPrt = nsBooking.getDischargePort(),
                iSourcePortCallID = $('#qhsourcePortCallID1').val(),
                input = {},
                ids = '', charTabEle;
            if (key.length === 3) {
                basisCode = key[0];
                currCode = key[1];
                rate = key[2];
                element = $(this).closest('.freightChargesCollapse');
                if (rate !== null) {
                    $(element).find('#freightAreatRate').val(rate);
                }
                if ((basisCode !== null) && (basisCode !== 'null')) {
                    $(element).find('#freightAreaBasis').val(basisCode);
                }
                if ((currCode !== null) && (currCode !== 'null')) {
                    $(element).find('#freightCurrencies').val(currCode);
                }
            }
            nsBooking.freightTot(this);
            iLoadPrt = (!iLoadPrt) ? iOrgCode : iLoadPrt;
            iDiscPrt = (!iDiscPrt) ? iDestCode : iDiscPrt;
            iSourcePortCallID = (iSourcePortCallID === '0') ? '' : iSourcePortCallID;
            input = {
                rate : iRate,
                contract : iContract,
                trade : iTrade,
                origin : iOrgCode,
                destination : iDestCode,
                loadPort : iLoadPrt,
                dischargePort : iDiscPrt,
                cargoType : iCarType,
                cargoState : iCarSt,
                newOrUsed : iNewCargo,
                height : iHeight,
                volume : iVolume,
                weight : iWeight,
                sourcePortCallID : iSourcePortCallID,
                consLegId : 0
            };
            charTabEle = $(this).closest('.subBookingCalculation').find('#quickBookChargesGrid');
            if ($.fn.DataTable.fnIsDataTable($(charTabEle))) {
                $(charTabEle).dataTable().fnClearTable();
                $(charTabEle).dataTable().fnDestroy();
                $(charTabEle).hide();
            }
            vmsService.vmsApiService(function(response) {
                var index = 0;
                if (response) {
                    $(charTabEle).show();
                        $(charTabEle).DataTable({
                            'processing' : true,
                            'serverSide' : false,
                            'bFilter' : true,
                            'tabIndex' : -1,
                            'bSort' : false,
                            'paging' : false,
                            'ordering' : false,
                            'info' : false,
                            'fixedHeader': false,
                            "orderClasses": false,
                            'searching' : false,
                            'dom' : '<t>',
                            'scrollY' : '400px',
                            'scrollX' : true,
                            'scrollCollapse' : true,
                            'aaData' : response,
                            'bAutoWidth' : false,
                            'fnInitComplete' : function() {
                                var idList = ids.split('-'),
                                    ind, i = 0;
                                for (i = 0; i < index; i++) {
                                    ind = '#' + idList[i];
                                    nsBooking.updateQuantity($(ind));
                                }
                            },
                            'columns' : [
                                {
                                    data : 'checked',
                                    'render' : function() {
                                        return '<a href="javascript:void(0)">'
                                            + '<span class="icons_sprite removeIcon chargeRemove"></span></a>';
                                    }
                                },
                                {
                                    'render' : function(data, type, full) {
                                    	var selectr = '<select name="chargeType" id="chargeType" class="chargeType">';
                                        selectr += nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, escape(full.chargeTypeCode), true);
                                        selectr += '</select>';
                                        return selectr;
                                       
                                    }
                                },
                                {
                                    'render' : function(data, type, full) {
                                        var id = 'chargeBasis' + index;
                                        ids = ids + id + '-';
                                        index = index + 1;
                                        return ('<select name="chargeBasis" id="'
            									+ id + '" class="chargeBasis">'
                                                + '<option selected val="'+ full.basisCode +'">' + full.basisType + '</option></select>');
                                    }
                                },
                                {
                                    'render' : function(data, type, full) {
                                    	var selectr = '<select name="chargecurrency" id="chargeCurrency"' +' class="chargeCurrency">', dataCurr;
                                        if (!full.currencyCode) {
                                        	dataCurr = nsBooking.defaultCurrencyCode;
                                        } else {
                                        	dataCurr = full.currencyCode;
                                        }
                                        selectr += nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, dataCurr, true);
                                        selectr += '</select>';
                                        return selectr;
                                    }
                                },
                                {
                                    'render' : function(data, type, full) {
                                    	return ' <input type="text" maxlength="15" class="chargeRate numericField"'
                                        +' id="chargeRate" value="' + full.rate + '" />';
                                    }
                                },
                                {
                                    'render' : function() {
                                    	return ' <input type="text" class="chargeQuantity numericField" readonly />';
                                    }
                                },
                                {
                                    'render' : function() {
                                    	return ' <input type="text" class="chargeTotal numericField" readonly value=""/>';
                                    }
                                },
                                {
                                    'render' : function() {
                                        return '<select id="chargePayment" disabled="disabled" > <option value="P" '
                                            + 'selected >Prepaid</option> <option value="C">Collect</option>'
                                            + '</select>';
                                    }
                                },
                                {
                                    'render' : function() {
                                        return '<input type="checkbox" id="chargeGF" disabled="disabled" />';
                                    }
                                },
                                {
                                    'render' : function(data, type, full) {
                                    	return ' <input type="text" class="chargeComments" val="'+ full.comment +'"/>';
                                    }
                                }
                            ]
                        });                        
                 
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.bookingRateCharges, 'POST', JSON.stringify(input));
        });
        $(document).on('click', '#quickBookLink', function() {
            $('#quickBookForm #dimensionType').val(nsBookDoc.defaultMeasUnit);
            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag',
                    $(this));
                return false;
            }
            doDialogInit();
            nsBooking.makeAndModelQuickBook('.bookingCargoMake1', '.bookingCargoModel1');
            nsBooking.findDefCurrency();
            $('#quickBookChargesGrid #chargeType').html(nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true));
            $('#quickBookChargesGrid #chargeBasis').html(nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
            $('#quickBookChargesGrid #chargeCurrency').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, nsBooking.defaultCurrencyCode.slice(1,-1), true));
            $('#quickBookChargesGrid tbody').hide();
            $('#quickBookPopup').dialog('open');
            $('.portsCallForm').find('.removePortElement').hide();
            $('#addNewBooking').removeAttr('disabled');
            $('#addNewBooking').removeClass('disabledBut');
            if(nsBooking.rateLinkAccessFlag){
            	$('.freightApplyRate').removeAttr('disabled');
                $('.freightApplyRate').removeClass('disabledBut');
            } else {
            	$('.freightApplyRate').attr('disabled', 'disabled');
                $('.freightApplyRate').addClass('disabledBut');
            }
        });
        $('#quickBookChargesGrid tbody').on('click', '.chargeRemove', function() {
        	var rowCount = $(this).closest('#quickBookChargesGrid tbody').find('tr').length;
        	if(rowCount >= 2){
        		$(this).closest('tr').remove();
        	} else {
        		$(this).closest('#quickBookChargesGrid tbody').hide();
        	}

        });
    });
    function loadDocCodeNameQB() {
        var lenCount = 0,
            index = 0;
        $('.docCode').autocomplete({
            source : nsCore.beginWithAutoComplete(docCodes),
            select : function(event, ui) {
                lenCount = docCodes.length;
                selectedVal = ui.item.value;
                for (index = 0; index < lenCount; index++) {
                    if (selectedVal === docCodes[index]) {
                        $(event.target).parent('div').find('.docName').val(docNames[index]);
                        $(event.target).parent('div').find('.docID').val(docIDs[index]);
                    }
                }
            },
            delay: 0,
            autoFocus : true
        });
        $('.docCode').blur(function(e){
            nsCore.delInvalidAutoFeilds('.docCode', '.docName',$(this).val(), docCodes, e);
        });
        $('.docName').autocomplete({
            source : docNames,
            select : function(event, ui) {
                lenCount = docNames.length;
                selectedVal = ui.item.value;
                for (index = 0; index < lenCount; index++) {
                    if (selectedVal === docNames[index]) {
                        $(event.target).parent('div').find('.docCode').val(docCodes[index]);
                        $(event.target).parent('div').find('.docID').val(docIDs[index]);
                    }
                }
            },
            delay: 0,
            autoFocus : true
        });
        $('.docName').blur(function(e){
            nsCore.delInvalidAutoFeilds('.docCode', '.docName',$(this).val(), docNames, e);
        });
    }
    function doInit() {
        var dataForDocOffice = {supplierType : 'UsersDocOffice'},
            allDocOffice = {supplierType : 'Doc'},
            responseDTOList, i = 0;
        vmsService.vmsApiService(function(response) {
            var company;
            if (response) {
                company = response.responseData[0];
                deDocID = company.companyID;
                deDocCode = company.companyCode;
                deDocName = company.name;
                $('#docID').val(deDocID);
                $('#docCode').val(deDocCode);
                $('#docName').val(deDocName);
                $('#mDocID').val(deDocID);
                $('#mDocCode').val(deDocCode);
                $('#mDocName').val(deDocName);
                formData = $('#quickBookForm').serialize();
                $.extend(true, nsBooking, {'deDocID' : deDocID,
                    'deDocCode' : deDocCode,
                    'deDocName' : deDocName,
                    'formData' : formData});
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.supComSearch, 'POST', JSON.stringify(dataForDocOffice));
        nsBooking.findDefCurrency();
        $('#freightAreaPayment').val('P');
        $('#contract').val('');
        docIDs = [];
        docCodes = [];
        docNames = [];
        vmsService.vmsApiService(function(response) {
            if (response) {
                $.each(response.responseData, function(idx, obj) {
                    docNames.push(obj.name);
                    docIDs.push(obj.companyID);
                    docCodes.push(obj.companyCode);
                });
                $.extend(true, nsBooking, {'docIDs' : docIDs,
                    'docCodes' : docCodes,
                    'docNames' : docNames});
                loadDocCodeNameQB();
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, nsBooking.supComSearch, 'POST', JSON.stringify(allDocOffice));
        if (portCodes.length === 0) {
            // Origin and destination.
            responseDTOList = nsCore.modifySmartObj(nsCore.smartData.portCode, {
                'index' : [ 'portCode' ],
                'target' : [ 'portName' ]
            });
            count = responseDTOList.length;
            for (i = 0; i < count; i++) {
                portCodes.push(responseDTOList[i].portCode);
                portDesc.push(responseDTOList[i].portName);
            }
            $.extend(true, nsBooking, {'portCodes':portCodes, 'portDesc':portDesc});            
            nsCore.portAutoComplete('#origin','#originName','data-form');
            nsCore.portAutoComplete('#destination','#destinationName','data-form');
        }
        nsBooking.updateCState(null);
    }
    function doQuickBookSubmit() {
        var message = '',
            customerCode = $('#customerCode').val(),
            customerName = $('#customerName').val(),
            input = {};
        // Do all the mandatory check.
        if ((!nsBooking.noVoyage) && (!nsBooking.mainTrade)) {
            message = message + 'Vessel/voyage should not be empty' + '\n';
        }
        if (!customerCode) {
            message = message + 'Customer should not be empty' + '\n';
            doSubValidate(message);
        } else {
            input = {
                customerCode : customerCode,
                name : customerName
            };
            if ((customerCode.toLowerCase().indexOf('&amp;') >= 0) ||
                    (customerName.toLowerCase().indexOf('&amp;') >= 0)) {
                // Contains the special character, so don't do the check...
                	doSubValidate(message);
            } else {
                vmsService.vmsApiService(function(response) {
                    if (response) {
                        if (response.responseData.length === 0) {
                            message = message + 'Enter a valid Customer' + '\n';
                        }
                        doSubValidate(message);
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.custList, 'POST', JSON.stringify(input));
            }
        }
    }
    function doSubValidate(message) {
        var contract = $('#contract').val(),
            origin = $('#origin').val(),
            destination = $('#destination').val(),
            destName = $('#destinationName').val(),
            oriName = $('#originName').val();
        if (contract === '') {
            message = message + 'Contract is not selected' + '\n';
        }
        if (origin === '') {
            message = message + 'Origin should not be empty' + '\n';
        } else {
            if ($.inArray(origin, portCodes) === -1) {
                message = message + 'Enter a valid Origin' + '\n';
            } else {
                if ($.inArray(oriName, portDesc) === -1) {
                    message = message + 'Enter a valid Origin' + '\n';
                }
            }
        }
        if (destination === '') {
            message = message + 'Destination should not be empty' + '\n';
        } else {
            if ($.inArray(destination, portCodes) === -1) {
                message = message + 'Enter a valid Destination' + '\n';
            } else {
                if ($.inArray(destName, portDesc) === -1) {
                    message = message + 'Enter a valid Destination' + '\n';
                }
            }
        }
        $('.subBookingCalculation').each(function() {
            var perUnit = $(this).find('#perUnitID').is(':checked');
            nsBooking.setCheckVal(this);
            message += nsBooking.valFreight(this);
            message = nsBooking.validNon(message, this);
            message += nsBooking.valBookUnits(this);
            message += nsBooking.docOffVal(this);
            if (perUnit) {
                message = nsBooking.valDimQ(this, message);
            } else {
                message = nsBooking.valDimQ1(this, message);
            }
            message = nsBooking.wigVal(this, message);
            if($(this).find('#quickBookChargesGrid tbody').css('display') !== 'none'){
            	message += nsBooking.quickBookChargeVal();
            }
        });
        // Do all the float value check.
        // Do all the business validation.
        if (message.trim() === '') {
            if (!nsBooking.noVoyage) {
                // Do allocation validation.
                $('.subBookingCalculation').each(function() {
                    var allocationType = $(this).find('#allocType').val(),
                        cargoType = $(this).find('#cargoType').val(),
                        bookedUnits = parseInt($(this).find('#bookedUnits').val()),
                        area = $(this).find('#bkArea').val(),
                        cargoGroupUrls = nsBooking.cargoGroupUrl + cargoType;
                    if (allocationType === 'YES') {
                    	message += getCargoGroupsUrls(cargoGroupUrls, area, bookedUnits);
                    }
                });
                if (message.trim() === ''){
                    doSubForm();
                } else {
                	nsCore.showAlert(message.trim());
                    return;
                }
            } else {
                doSubForm();
            }
        } else {
        	nsCore.showAlert(message.trim());
        }
    }
    function getCargoGroupsUrls(cargoGroupUrls, area, bookedUnits){
    	var message = '';
    	vmsService.vmsApiService(function(response) {
             if (response) {
                 message = nsBooking.cargComp(response, bookedUnits, message, area);
             } else {
             	nsCore.showAlert('error' + JSON.stringify(response));
             }
         }, cargoGroupUrls, 'GET', null);
    	return message;
    }
    function doSubForm() {
        var str,
            chargeContent = '',
            subBookChargeContent = '';
        $('.subBookingCalculation').each(function(ind) {
        	$($('.subBookingCalculation')[ind]).find('#quickBookChargesGrid tbody tr').each(function(cInd) {
                // look for the fields firstName and lastName in the tr and push into storage
                var cquant = $('#chargeQuantity', this).val(),
                    cTotal = $('#chargeTotal', this).val(),
                    cRate = $('#chargeRate', this).val(),
                    cCur = $('#chargeCurrency', this).val(),
                    cPayment = $('#chargePayment', this).val(),
                    include = $('#chargeGrossFreight', this).is(':checked'),
                    cBasis = $('.chargeBasis', this).val(),
                    cChrType = $('#chargeType', this).val(),
                    cComment = $('#chargeComments', this).val(),
                    content = '';                
                if ((cChrType)) {
                    content = cChrType + '<td>' + cBasis + '<td>' + cCur + '<td>' + cRate + '<td>' + cquant
                        + '<td>' + cTotal + '<td>' + cPayment + '<td>' + include + '<td>' + cComment;
                    if (cInd === 0) {
                        chargeContent = content;
                    } else {
                        chargeContent = chargeContent + '<tr>' + content;
                    }
                }
            });
            subBookChargeContent = 'subBookingModelList['+ind+'].chargeContent';
            $('input[name="' + subBookChargeContent + '"]').val(chargeContent);
        });
        $('#quickBookForm').find('#cargoStateList').text('');
        $('#quickBookForm').find('#cargoStateList').empty();
        str = $('#quickBookForm').serialize();
        vmsService.vmsApiServiceTypeDataLoad(function(data) {
            var diffSearchParamMsg;
            if (data) {
                if (!nsBooking.dataValid(data, data.bookingId, 'New', data.bookingNumber) &&
                        nsBooking.isNewBookingMatchingSearch()) {
                    if (data) {
                        nsBooking.loadbookingcontent(data, data.bookingId, 'New', data.bookingNumber, false);
                    }
                } else {
                    diffSearchParamMsg = 'Booking created successfully! Please note down the booking no '
                        + data.bookingNumber + ' since this booking parameters are different from searched for';
                    $('#bookingAlertMessage').dialog({
                        resizable : false,
                        modal : true,
                        autoOpen : false,
                        draggable : false,
                        width : 400,
                        closeOnEscape : false,
                        open : function() {
                            var titleText = '';
            	            $('#bookingAlertMessage #alertMsg').text(diffSearchParamMsg);
            	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
            	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
            	            	.removeClass('ui-corner-all ui-widget');
            	            titleText = $('#bookingAlertMessage').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
            	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
            	        	$('#bookingAlertMessage').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
            	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
            	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                        },
                        buttons : [
                            {
                                text : 'OK',
                                click : function() {
                                    $(this).dialog('close');
                                }
                            }
                        ]
                    }).dialog('open');
                }
                $('.getPossibleVoyagesQuickbook').attr('data-clicked', 'false');
                $('#quickBookPopup').dialog('close');
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, $('#quickBookForm').attr('action'), 'POST', str);
        doCloseQuickBook();
    }
    function doCancelOpn() {
        var newData = $('#quickBookForm').serialize(),
            cargoChanged = false;
        $('.subBookingCalculation').each(function() {
            if ($(this).find('#cargoType').val() !== '') {
                cargoChanged = true;
            }
        });
        if ((formData === newData) && (!(cargoChanged))) {
            doCloseQuickBook();
            return;
        } else {
            $('#dialog-confirm').dialog({
                resizable : false,
                modal : true,
                autoOpen : false,
                draggable : false,
                width : 400,
                closeOnEscape : false,
                open : function() {
                	nsCore.commonPopup(this);
                },
                buttons : {
                    'Yes' : function() {
                        $(this).dialog('close');
                        doQuickBookSubmit();
                    },
                    'No' : function() {
                        $(this).dialog('close');
                        doCloseQuickBook();
                    }
                }
            });
            $('#dialog-confirm').dialog('open');
            return;
        }        
    }
    function doCloseQuickBook() {
        $('#quickBookForm').trigger('reset');
        $('#qPossibleVoyageNewWrapId').hide();
        $('#cargoState').text('');
        $('#quickBookPopup').dialog('close');
        $('.getPossibleVoyagesQuickbook').attr('data-clicked', 'false');
        resetAll();
        nsBooking.quickSubCount = 1;
        doInit();
    }
    function resetAll() {
        isDimensionSelected = false;
        maxHeightCapacity = -1;
        maxWeightCapacity = -1;
        nsBooking.mainTrade = null;
        mainSrcPort = null;
        maindestPort = null;
        carReAvl = 0;
        puReAvl = 0;
        hhReAvl = 0;
        stReAvl = 0;
        nsBooking.noVoyage = false;
        $('#quickBookForm').find("input[type=hidden]").not("input[id='userName']").val("");
        $('#quickBookMainWrapperDiv').find('input[type=text]').val('');
        $('#quickBookMainWrapperDiv').find('#textarea').val('');
        $('#quickBookMainWrapperDiv').find('input[type=select]').val('');
        $('#quickBookForm').find('#qhsourcePortCallID1, #qhdestinationPortCallID1, #qhsourcePortCallID2, #qhdestinationPortCallID2, ' 
        		+ '#qhsourcePortCallID3, #qhdestinationPortCallID3, #thisIndex').val('0');
        $('#quickSubCount').val('1');
        $('#freightAreaPayment').val('P');
        $('#docID').val(deDocID);
        $('#docCode').val(deDocCode);
        $('#docName').val(deDocName);
        $('#quickBookPopup').find('#bkLength').removeAttr('readonly');
        $('#quickBookPopup').find('#bkWidth').removeAttr('readonly');
        $('#quickBookPopup').find('#bkHeight').removeAttr('readonly');
        // Collapsing the Freight & Charges tab
        $('.freightChargesCollapse').hide();
        // Hiding Apply Rates Data table
        $('#applyRateData').hide();
        // Removing more than one sub booking
        if ($('.subBookingCalculation').length > 1) {
            $($('.subBookingCalculation')[1]).remove();
        }
    }
    function applyRate(button) {
        var iOrgCode = nsBooking.getOriginCode(),
            iDestCode = nsBooking.getDestinationCode(),
            iContract = nsBooking.getContract(),
            iCarSt = nsBooking.getCargoState(button),
            iHeight = nsBooking.getHeight(button),
            iVolume = nsBooking.getVolume(button),
            iWeight = nsBooking.getWeight(button),
            iNewCargo = '',
            iCarType = nsBooking.getCargoType(button),
            iRate = 'R',
            iTrade = nsBooking.mainTrade,
            iLoadPrt = nsBooking.getLoadPort(),
            iDiscPrt = nsBooking.getDischargePort(),
            iSourcePortCallID = $('#qhsourcePortCallID1').val(),
            input = {};
        if (nsBooking.getIsNewCargo(button) === 'Y') {
            iNewCargo = 'Yes';
        } else {
        	if (nsBooking.getIsNewCargo(button) === 'N') {
                iNewCargo = 'No';
            }
        }           
        //Check by commenting if (!iLoadPrt) { iLoadPrt = iOrgCode;}  if (!iDiscPrt) { iDiscPrt = iDestCode; }             
        if(!iContract || !iOrgCode || !iDestCode || !iLoadPrt || !iDiscPrt || !iCarType){
        	nsCore.showAlert('Please fill in the booking details and select voyage before applying a rate!');
        	return false;
        }      
        if (iSourcePortCallID === '0') {
            iSourcePortCallID = '';
        }
        input = {
            rate : iRate,
            contract : iContract,
            trade : iTrade,
            origin : iOrgCode,
            destination : iDestCode,
            loadPort : iLoadPrt,
            dischargePort : iDiscPrt,
            cargoType : iCarType,
            cargoState : iCarSt,
            newOrUsed : iNewCargo,
            height : iHeight,
            volume : iVolume,
            weight : iWeight,
            sourcePortCallID : iSourcePortCallID,
            consLegId : 0
        };
        $(button).closest('.subBookingCalculation').addClass('applyRateClicked');
        nsBooking.applyRateCom(input, 'qkBookRateList');
    }
    function getShowPrev() {
        if ($('#prevVoyagesQuick').is(':checked')) {
            return 'Y';
        } else {
            return 'N';
        }
    }
    function dimensionSelected(data) {
        var tableElement = $(nsBooking.makeModelElement).closest('.subBookingCalculation').find('.bookedDimensions')
                .find('#quickFreightDimensionsGrid'),
            cargoTextEle = $(nsBooking.makeModelElement).closest('.subBookingCalculation').find('#cargoText'),
            mamoContent = data.yearOfManu + ' ' + data.make + ' ' + data.model;
        isDimensionSelected = true;
        $(tableElement).find('#bkLength').val(data.length);
        $(tableElement).find('#bkWidth').val(data.width);
        $(tableElement).find('#bkHeight').val(data.height);
        $(tableElement).find('#bkWeight').val(data.weight);
        $(tableElement).find('#bkArea').val(data.area);
        $(tableElement).find('#bkVolume').val(data.volume);
        $(tableElement).find('#dimensionType').val(data.dimensions);
        $(cargoTextEle).val(data.cargoText);
        $(nsBooking.makeModelElement).closest('.subBookingCalculation').find('#bookingCargoMake1').val(mamoContent);
        $(nsBooking.makeModelElement).closest('.subBookingCalculation').find('#bookingCargoModel1').val('');
        nsBooking.enableDisableFRate(nsBooking.makeModelElement);
    }
    function doDialogInit() {
        if (deDocID) {
            nsBooking.quickSubCount = 1;
            $('.portsCallForm').find('.removePortElement').hide();
            $('#addNewBooking').removeAttr('disabled');
            $('#addNewBooking').removeClass('disabledBut');
            $('#docID').val(deDocID);
            $('#docCode').val(deDocCode);
            $('#docName').val(deDocName);
            formData = $('#quickBookForm').serialize();
        }
    }
    function enableDisableRate() {
        $('.subBookingCalculation').each(function() {
            nsBooking.enableDisableFRate($(this).find('.contactHeading'));
        });
    }
    function disableRateButton(rateButton) {
        $(rateButton).attr('disabled', 'disabled');
        $(rateButton).addClass('disabledBut');
    }
    quickBookingObj = {
            'maxHeightCapacity' : maxHeightCapacity,
            'maxWeightCapacity' : maxWeightCapacity,
            'portCodes' : portCodes,
            'portDesc' : portDesc,
            'cargoStatesListArray' : cargoStatesListArray,
            'isDimensionSelected' : isDimensionSelected,
            'mainSrcPort' : mainSrcPort,
            'maindestPort' : maindestPort,
            'carReAvl' : carReAvl,
            'puReAvl' : puReAvl,
            'hhReAvl' : hhReAvl,
            'stReAvl' : stReAvl,
            'noVoyage' : noVoyage,
            'count' : count,
            'loadDocCodeNameQB' : loadDocCodeNameQB,
            'doInit' : doInit,
            'doQuickBookSubmit' : doQuickBookSubmit,
            'doSubValidate' : doSubValidate,
            'doSubForm' : doSubForm,
            'doCancelOpn' : doCancelOpn,
            'doCloseQuickBook' : doCloseQuickBook,
            'resetAll' : resetAll,
            'applyRate' : applyRate,
            'getShowPrev' : getShowPrev,
            'dimensionSelected' : dimensionSelected,
            'doDialogInit' : doDialogInit,
            'enableDisableRate' : enableDisableRate,
            'disableRateButton' : disableRateButton
        };
    $.extend(true, nsBooking, quickBookingObj);
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);