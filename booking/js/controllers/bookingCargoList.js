/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var vinCount = 0,
        pasted = false;

    //function to disable cargo list field
    function disableCargoListField() {
        $('input[name="cargoVIN"]').attr('disabled', 'disabled');
        $('input[name="cargoLabel"]').attr('disabled', 'disabled');
        $('.cargoVinLink').attr('disabled', 'disabled');
        $('.VINApplyAllItem').addClass('disabledBut').bind('click', false);
        $('.importVinListLink').addClass('disabledBut').bind('click', false);
        $('input[id="cargoListSavBtn"]').attr('disabled', 'disabled').bind('click', false);
        $('#bookingCargoListGrid tbody tr').each(function(index, item) {
            $(item).find('.cargoCondition').attr('disabled', 'disabled');
            $(item).find('.cargoVinNbr').attr('disabled', 'disabled');
        });
    }

    //function to enable cargo list field
    function enableCargoListField() {
        $('input[name="cargoVIN"]').removeAttr('disabled');
        $('input[name="cargoLabel"]').removeAttr('disabled');
        $('.cargoVinLink').removeAttr('disabled');
        $('.VINApplyAllItem').removeClass('disabledBut').unbind('click', false);

        $('.importVinListLink').removeClass('disabledBut').unbind('click', false);
        $('input[id="cargoListSavBtn"]').removeAttr('disabled').unbind('click', false);
        $('#bookingCargoListGrid tbody tr').each(function(index, item) {
            $(item).find('.cargoCondition').removeAttr('disabled');
            $(item).find('.cargoVinNbr').removeAttr('disabled');
        });
    }

    //function to load view cargo list grid
    function loadViewCargoListGrid(consignementLeg, cargoDetails) {
        var vessel = '',
            loadPort = '',
            discPort = '',
            dataval = {},
            bookingCargoTableHeight = 0;
        if (consignementLeg.vesselVoyage) {
            vessel = consignementLeg.vesselVoyage;
        }
        if (consignementLeg.loadPortCode) {
            loadPort = consignementLeg.loadPortCode;
        }
        if (consignementLeg.discPortCode) {
            discPort = consignementLeg.discPortCode;
        }
        dataval = [{
            'vesselVoyage': vessel,
            'loadPortCode': loadPort,
            'discPortCode': discPort
        }];
        if ($.fn.DataTable.fnIsDataTable($('#mainLegGridView'))) {
            $('#mainLegGridView').dataTable().api().clear().draw();
            $('#mainLegGridView').dataTable().api().rows.add(dataval).draw();
        } else {
            $('#mainLegGridView').DataTable({
                'processing': true,
                'serverSide': false,
                'bFilter': true,
                'tabIndex': -1,
                'bSort': false,
                'paging': false,
                'bAutoWidth': false,
                'fixedHeader': false,
                'orderClasses': false,
                'searching': false,
                data: dataval,
                'dom': '<t>',
                columns: [{
                    data: 'vesselVoyage'
                }, {
                    data: 'loadPortCode'
                }, {
                    data: 'discPortCode'
                }]
            });
        }
        // calculate the Height of cargo Vin Table
        bookingCargoTableHeight = parseInt($('#cargoListPopup').outerHeight()
		- $('#cargoListPopup .cargoThreeColRow.bookingCargoHeader').outerHeight()
		- $('#cargoListPopup .bookingCargoMainHdr').outerHeight() - 90
		- $('#cargoListPopup .submitFromData').outerHeight());

        if ($.fn.DataTable.fnIsDataTable($('#bookingCargoListGrid'))) {
            $('#bookingCargoListGrid').dataTable().api().clear().draw();
            $('#bookingCargoListGrid').dataTable().api().rows.add(cargoDetails).draw();
        } else {
            $('#bookingCargoListGrid').DataTable({
                'processing': true,
                'serverSide': false,
                'bFilter': true,
                'tabIndex': -1,
                'bSort': false,
                'paging': false,
                'searching': false,
                'ordering': false,
                'info': false,
                'fixedHeader': false,
                "orderClasses": false,
                'dom': '<t>',
                'scrollY': bookingCargoTableHeight,
                "scrollX": true,
                'scrollCollapse': true,
                'data': cargoDetails,
                'bAutoWidth': false,
                'columns': [{
                    'data': 'vinNumber',
                    'class': 'cargoVin',
                    'sWidth': '240px',
                    'render': function(data, type, full) {
                        return nsBooking.buildCargoVin(data, full);
                    }
                }, {
                    data: 'firm',
                    'class': 'firm leftAlign',
                    'render': function(data) {
                        var firm = 'N';
                        if ((data) && ($.trim(data))) {
                            firm = data;
                        }
                        return firm;
                    }
                }, {
                    data: 'loadedDate',
                    'class': 'leftAlign',
                    'render': function (data){
                    	return data ? data.split(' ')[0] : '';
                    }
                }, {
                    data: 'receivedDate',
                    'class': 'leftAlign',
                    'render': function (data){
                    	return data ? data.split(' ')[0] : '';
                    }
                }, {
                    data: 'cargoCondition',
                    'render': function(data) {
                        var condition = '';
                        if (data) {
                            condition = data;
                        }
						return '<textarea  class="cargoCondition width100per id="newCargoConditionBooking">'+condition+'</textarea>';
                    }
                }, {
                    data: 'statusDesc',
                    'class': 'leftAlign'
                }]
            });
        }
    }

    //function to check whether cargo vin is empty or null
    function isVinEmptyOrNull(element) {
        var result = false;
        if (!($(element).find('.cargoVinNbr').val())) {
            result = true;
        }
        return result;
    }

    //function to check whether data loaded is not null and empty
    function isDateLoadedNotNullAndEmpty(element) {
        var result = false;
        if ($(element).find('.cargoVinNbr').attr('data-dateLoaded') && $(element).find('.cargoVinNbr').attr('data-dateLoaded') !== 'null') {
            result = true;
        }
        return result;
    }

    //function to check whether data recieved is not null and empty
    function isDateRcvdNotNullAndEmpty(element) {
        var result = false;
        if ($(element).find('.cargoVinNbr').attr('data-receivedDate') && $(element).find('.cargoVinNbr').attr('data-receivedDate') !=='null') {
            result = true;
        }
        return result;
    }

    //function to check whether relload data is not null and empty
    function isRelLoadDateNotNullAndEmpty(element) {
        var result = false;
        if ($(element).find('.cargoVinNbr').attr('data-releaseLoadDate') && $(element).find('.cargoVinNbr').attr('data-releaseLoadDate') !== 'null') {
            result = true;
        }
        return result;
    }

    //function to validate vin number
    function isValidVinNum(element, vinMessage) {
        if ($(element).find('.cargoVinNbr').val().length > 18 && (!vinMessage)) {
            vinMessage = 'VIN is too long';
        }
        if (nsBooking.hasWhiteSpace($(this).find('.cargoVinNbr').val()) && (!vinMessage)) {
            vinMessage = 'VIN contains illegal characters!';
        }
        return vinMessage;
    }

    //function to get cargo id
    function getCargoId(element) {
        var cargoId = '0';
        if ($(element).find('.cargoVinNbr').attr('data-cargoId')) {
            cargoId = $(element).find('.cargoVinNbr').attr('data-cargoId');
        }
        return cargoId;
    }

    //function to get Vin number
    function getVinNum(element) {
        var vinnumber = '';
        if ($(element).find('.cargoVinNbr').val()) {
            vinnumber = $(element).find('.cargoVinNbr').val();
        }
        return vinnumber;
    }

    //function to get cargo condition
    function getCargoCondition(element) {
        var condition = '';
        if ($(element).find('.cargoCondition').val()) {
            condition = $(element).find('.cargoCondition').val();
        }
        return condition;
    }

    // function to validate vin description
    function isValidVinDesc(response) {
        return (response.vinDesc) ? true : false;
    }

    //events will be triggered when DOM is ready
    $(document).ready(function() {
        var vinAnalyzer = {};
        $(document).on('click', '#cargoListLink', function() {
            var screenHeight = parseInt(parseInt($(window).height()) * 0.9),
                cargoGrids = ['bookingCargoListGrid', 'mainLegGridView'],
                bookingTbl = $('#routeDetailGrid').DataTable(),

                rowData = bookingTbl.row($('#routeDetailGrid tbody td input[name="selectedRoute"]:checked').closest('tr')).data(),
                rowData1 = bookingTbl.row($('#routeDetailGrid tbody td input[name="mainLeg"]:checked').closest('tr')).data(),

                consLegId = rowData.consignmentLegId,
                consLegId1 = rowData1.consignmentLegId,
                dateFormat = localStorage.getItem('dateFormat'),
                timeFormat = localStorage.getItem('timeFormat'),
                data = {
                    id: $('#consignmentId').val(),
                    dateFormat: dateFormat + ' ' + timeFormat,
                    consignmentLegId: consLegId
                };

            $('#cargoListPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '70%',
                height: screenHeight,
                position: {
                    at: 'top center',
                    of: window
                },
                beforeClose: function() {
                    $('#cargoListPopup').find('input[type="text"]').val('');
                    $('#viewcargoVIN').attr('viewCargoTimeStamp', '');
                },
                open: function() {
                    nsBooking.clearDataGrids(cargoGrids);
                }
            });
            $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').each(function() {
                if ($(this).hasClass('ui-selecting')) {
                    $('#consignmentId').val($(this).attr('data-subbookingid'));
                    return false;
                }
            });
            //if it is new booking yet to be created no Ajax call is needed. 
            if($('.mainSubBookFormTitle').attr('data-subBookingTitle') !== 'New Sub Booking') {
	            // ajax call to load main leg details and vin list
            vmsService.vmsApiService(function(response) {
                if (response) {
                    // vin label
                    if (isValidVinDesc(response)) {
                        $('input[name="cargoLabel"]').val($.trim(response.vinDesc));
                    }
                    $('#viewcargoVIN').attr('viewCargoTimeStamp', response.timeStamp);
                    $.each(response.consignmentLegModelList, function(i, obj) {
                        if (i === 0) {
                            loadViewCargoListGrid(obj, obj.cargoConsignmentList);
                        }
                    });
                    if (($('#subBlStatus').val()) && $('#subBlStatus').val() !== '10') {
                        disableCargoListField();
                    } else {
                        if (consLegId !== consLegId1) {
                            disableCargoListField();
                        } else {
                            enableCargoListField();
                        }
                    }
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.viewCargoList, 'POST', JSON.stringify(data));
          }
        });

        vinAnalyzer = {
            blnEnable: {
                btnAnalyze: false,
                btnInsert: false
            },
            removeEscapeChar: function() {
                $('#divEditable').contents().each(function(key, value) {
                    var data = $(value);
                    if (data.text() === '<br>' || (!data.text())) {
                        data.remove();
                    }
                });
            },
            fnAnalyze: function() {
                var errorText = {},
                    errCnt = 1,
                    html = [],
                    vinData = {},
                    vinVals = [],
                    tempHTML = '',
                    errorHTML = [],
                    key = 0, divEditableCnt = 0,
                    keyIndex = '';
                // resetting div's data
                $('#errorText').css('display', 'none');
                $('#errorCount').text(0);
                $('#errorDiv').text('');
                vinAnalyzer.removeEscapeChar();
                if ($('#divEditable').contents().length === 0) {
                    vinAnalyzer.showQuant(vinCount, $('#divEditable').contents().length);
                    $('#subBookImportRemCount p').remove();
                    vinAnalyzer.blnEnable.btnAnalyze = false;
                    vinAnalyzer.blnEnable.btnInsert = false;
                    $('#analyzeVin, #cargoListInsertBtn').removeClass('orangeButton saveButton')
                        .addClass('whitebutton cancelButton');
                    return false;
                }
                if ($('#divEditable').contents()[0].tagName === 'TABLE') {
                    $($('#divEditable').contents()[0]).find('td').each(function(i, v) {
                        tempHTML += '<div>' + $(v).text().trim() + '</div>';
                    });
                    $('#divEditable').html(tempHTML);
                }
                divEditableCnt=0;
                $('#divEditable').children().each(function () {
                    if($.trim(this.innerText)!==""){
                    	divEditableCnt++;
                   }
                 });
                if (vinCount < divEditableCnt) {
                    errorText[($('#divEditable').contents().length - 1)] = '<div class="vinErrorDivList" id="errorId'
                    + ($('#divEditable').contents().length - 1) + '" data-errorCntNo="' + errCnt
                    + '">There are '+ (divEditableCnt - vinCount) + ' VIN more than available units without VIN</div>';
                    $('#divEditable').contents().each(
                        function(keyError) {
                            var data = $(this).text();
                            html.push('<div class="vinListValuesErr" data-errorId="' + keyError + '">'
                                + data + '</div>');
                        });
                } else {
                    // calculating errors
                    $('#divEditable').contents().each(function(keyErrText) {
                        var data = $.trim($(this).text());
                        if (data.length >= 19) {
                            errorText[keyErrText] = '<div class="vinErrorDivList" id="errorId' + keyErrText
							+ '"" data-errorCntNo="' + errCnt + '">VIN is too long</div>';

							html.push('<div class="vinListValuesErr" data-errorId="' + keyErrText + '">' + data + '</div>');
                            errCnt++;
                        } else if (nsBooking.hasWhiteSpace(data)) {
                            errorText[keyErrText] = '<div class="vinErrorDivList" id="errorId' + keyErrText +
                                '" data-errorCntNo="' + errCnt + '">VIN contains illegal characters!</div>';
                            html.push('<div class="vinListValuesErr" data-errorId="' + keyErrText + '">' + data + '</div>');
                            errCnt++;
                        } else {
                            if (data !== '<br>' && data!=="") {
                                html.push('<div>' + data + '</div>');
                                vinData[keyErrText] = data;
                                vinVals.push(data);
                            }
                        }
                    });
                }
                $('#divEditable').html(html.join(''));
                for (key in errorText) {
                    if (errorText.hasOwnProperty(key)) {
                        errorHTML.push(errorText[key]);
                    }
                }
                if (errorHTML.length > 0) {
                    vinAnalyzer.blnEnable.btnInsert = false;
                    $('#cargoListInsertBtn').off('click');
                    $('#cargoListInsertBtn').removeClass('orangeButton saveButton').addClass('whitebutton cancelButton');
                    $('#errorText, #errorDivMain').css('display', 'block');
                    $('#errorCount').text(errorHTML.length);
                    $('#vinLinkSlider').css('display', (errorHTML.length > 1) ? 'block' : 'none');
                    $('#errorNo').text(1 + '/' + errorHTML.length);
                    $('#errorDiv').html(errorHTML.join('')).css('display', 'block');
                    $('.vinErrorDivList').css('display', 'none');
                    $('#errorDiv').children(':first').fadeIn();
                    keyIndex = $('#errorDiv').children(':first').attr('id').split('_')[1];
                    $('#divEditable').find('[data-errorId="' + keyIndex + '"]').css('background-color', '#000000');
                    $('#subBookImportRemCount p').remove();
                    $('#subBookImportRemCount').hide();
                } else {
                    vinAnalyzer.showQuant(vinCount, $('#divEditable').contents().length);
                    vinAnalyzer.blnEnable.btnInsert = true;
                    $('#cargoListInsertBtn').removeClass('whitebutton cancelButton').addClass('orangeButton saveButton');
                    $('#analyzeVin').removeClass('orangeButton saveButton').addClass('whitebutton cancelButton');
                    $('#subBookImportRemCount').html('<p>Ready to insert</p>');
                    $('#errorDivMain,#vinLinkSlider,#errorText').hide();
                    $('#errorText, #vinLinkSlider').css('display', 'none');
                    $('#cargoListInsertBtn').unbind('click').bind('click',function(e) {
                        e.preventDefault();
                        if (vinAnalyzer.blnEnable.btnInsert) {
                            vinAnalyzer.fnAddRows(vinVals);
                            vinCount = 0;
                            // Calculate Vin count again
                            $('#bookingCargoListGrid tbody tr').each(
                                function(index, item) {
                                    if (!$(item).find('.cargoVinNbr').val()) {
                                        vinCount++;
                                    }
                                });
                            vinAnalyzer.showQuant(vinCount, 0);
                            // Update quantity
                            $('#divEditable').text('');
                            // Remove data in editable div
                            vinAnalyzer.blnEnable.btnAnalyze = false;
                            // Disable analyze and insert button
                            vinAnalyzer.blnEnable.btnInsert = false;
                            $('#analyzeVin').off('click');
                            $('#analyzeVin, #cargoListInsertBtn').removeClass('orangeButton saveButton')
                                .addClass('whitebutton cancelButton');
                        }
                    });
                }
            },
            showQuant: function(a, b) {
                $('#subBookImportRemCount').text('Number of remaining VIN available in sub booking: ' + (a - b)).show();
            },
            fnScroller: function() {
                $('#next').on('click', function(e) {
                    var lastVisDivId = $('#errorDiv').find('div:visible').attr('id'),
                        errorCount = $('#errorCount').text(),
                        toBeShownDivId = ($('#' + lastVisDivId).next().length === 0) ?
                            $('#errorDiv').children(':first').attr('id') : $('#' + lastVisDivId).next().attr('id'),
                        key = toBeShownDivId.split('_')[1],
                        currErrorCnt = $('#' + toBeShownDivId).attr('data-errorCntNo');
                    e.preventDefault();
                    $('.vinErrorDivList').css('display', 'none');
                    $('#divEditable').find('[data-errorId]').css('background-color', '#ffffff');
                    if ($('#' + lastVisDivId).next().length === 0) {
                        $('#errorDiv').children(':first').fadeIn();
                        key = $('#errorDiv').children(':first').attr('id').split('_')[1];
                        $('#errorNo').text(1 + '/' + errorCount);
                        $('#divEditable').find('[data-errorId="' + key + '"]').css('background-color','#000000');
                    } else {
                        $('#' + lastVisDivId).next().fadeIn();
                        $('#errorNo').text(currErrorCnt + '/' + errorCount);
                        $('#divEditable').find('[data-errorId="' + key + '"]').css('background-color','#000000');
                    }
                    return false;
                });
                $('#previous').on('click', function(e) {
                    var lastVisDivId = $('#errorDiv').find('div:visible').attr('id'),
                        errorCount = $('#errorCount').text(),
                        toBeShownDivId = ($('#' + lastVisDivId).prev().length === 0) ?
                            ($('#errorDiv').children(':last').attr('id')) :
                            ($('#' + lastVisDivId).prev().attr('id')),
                        key = toBeShownDivId.split('_')[1],
                        currErrorCnt = $('#' + toBeShownDivId).attr('data-errorCntNo');
                    e.preventDefault();
                    $('.vinErrorDivList').css('display', 'none');
                    $('#divEditable').find('[data-errorId]').css('background-color', '#ffffff');

                    if ($('#' + lastVisDivId).prev().length === 0) {
                        $('#errorDiv').children(':last').css('display', 'block');
                        $('#errorNo').text(errorCount + '/' + errorCount);
                        key = $('#errorDiv').children(':last').attr('id').split('_')[1];
                        $('#divEditable').find('[data-errorId="' + key + '"]').css('background-color','#000000');
                    } else {
                        $('#' + lastVisDivId).prev().css('display', 'block');
                        $('#errorNo').text(currErrorCnt + '/' + errorCount);
                        $('#divEditable').find('[data-errorId="' + key + '"]').css('background-color','#000000');
                    }
                    return false;
                });
                $('#divEditable').on({
                    cut: function(e) {
                        e.preventDefault();
                        if ($('#divEditable').contents().length === 1) {
                            $('#divEditable').contents().each(function() {
                                var data = $(this).text();
                                if (data === '<br>') {
                                    $('#divEditable').text('');
                                }
                            });
                        }
                    },
                    paste: function() {
                        setTimeout(function() {
                            vinAnalyzer.fnAnalyze();
                            $('#divEditable').contents().each(function(key, value) {
                                if ($(value).prop('tagName') === 'IMG') {
                                    $(value).parent('div').remove();
                                }
                            });
                            pasted = true;
                        }, 0);
                        $('#analyzeVin').removeClass('whitebutton cancelButton').addClass('orangeButton saveButton');
                    }
                });
                $('#divEditable').on('keyup', function() {
                    if ($('#divEditable').contents().length === 1) {
                        $('#divEditable').contents().each(function() {
                            var data = $(this).text();
                            if (data === '<br>') {
                                $('#errorDivMain,#vinLinkSlider,#errorText').hide();
                                $('#divEditable').text('');
                            } else {
                                $('#analyzeVin').on('click', function(e) {
                                    vinAnalyzer.bindAnalyze(e);
                                });
                                vinAnalyzer.blnEnable.btnAnalyze = true;
                                $('#analyzeVin').removeClass('whitebutton cancelButton').addClass('orangeButton saveButton');
                            }
                        });
                    } else if ($('#divEditable').contents().length > 1) {
                        vinAnalyzer.blnEnable.btnAnalyze = true;
                        $('#analyzeVin').removeClass('whitebutton cancelButton').addClass('orangeButton saveButton');
                        $('#analyzeVin').on('click', function(e) {
                            vinAnalyzer.bindAnalyze(e);
                        });
                    } else {
                        vinAnalyzer.blnEnable.btnAnalyze = false;
                        $('#analyzeVin').off('click');
                        $('#analyzeVin, #cargoListInsertBtn').removeClass('orangeButton saveButton')
                            .addClass('whitebutton cancelButton');
                    }
                    if (!(pasted)) {
                        $('#cargoListInsertBtn').off('click');
                        $('#cargoListInsertBtn').removeClass('orangeButton saveButton')
                            .addClass('whitebutton cancelButton');
                    }
                    pasted = false;
                });
                $('#analyzeVin').on('click', function(e) {
                    vinAnalyzer.bindAnalyze(e);
                });
            },
            bindAnalyze: function(e) {
                e.preventDefault();
                if (vinAnalyzer.blnEnable.btnAnalyze) {
                    vinAnalyzer.fnAnalyze();
                }
            },
            fnAddRows: function(objVin) {
                var i = 0,
                    numberOfVinNumber = objVin;
                $('#bookingCargoListGrid tbody tr').each(function() {
                    if ((numberOfVinNumber.length > i) && (!$(this).find('.cargoVinNbr').val()) ||
                        (!$.trim($(this).find('.cargoVinNbr').val()))) {
                        $(this).find('.cargoVinNbr').val(numberOfVinNumber[i]);
                        i++;
                    }
                });
                vinCount = 0;
            },
            fnReset: function() {
                $('#errorText,#vinLinkSlider,#errorDivMain').css('display', 'none');
                $('#errorCount').text(0);
                $('#divEditable,#errorDiv').text('');
                $('#subBookImportRemCount p').remove();
                vinAnalyzer.blnEnable.btnInsert = false;
                $('#cargoListInsertBtn').removeClass('orangeButton saveButton').addClass('whitebutton cancelButton');
            }
        };

        function fixedTo(numValue, toFixValue){
        	if(numValue !=="" && (!(isNaN(numValue)))){
        		numValue = parseFloat(numValue).toFixed(toFixValue);
        	}
        	return numValue;
        }


        /* Cargo details VIN code starts here */
        $(document).on('click', '.existingVin.cargoDetailsVinIcon', function() {
            var tooltipContent = '',
                cargoOnHold = nsBooking.getCargoOnHold($(this)),
                newCargo = nsBooking.getNewCargo($(this)),
                customerRef = nsBooking.getCustRef($(this)),
                registrationPlate = nsBooking.getRegPlate($(this)),
                loadPort = nsBooking.getLoardTerm($(this)),
                discPort = nsBooking.getDiscTerm($(this)),
                actualLength = fixedTo(nsBooking.getActualLength($(this)),3),
                actualWidth = '',
                actualHeight = '',
                actualArea = '',
                actualVolume = '',
                actualWeight = nsBooking.getActualWeight($(this)),
                weightUnit = nsBooking.getWeightUnit($(this)),
                tip = $(this);
            $('.toolTipWrapper').text('').hide();

            if ($(this).attr('data-actualWidth')) {
                actualWidth = fixedTo($(this).attr('data-actualWidth'),3);
            }
            if ($(this).attr('data-actualHeight')) {
                actualHeight = fixedTo($(this).attr('data-actualHeight'),3);
            }
            if ($(this).attr('data-actualArea')) {
                actualArea = fixedTo(nsBookDoc.converToUpperDecimalOnFive($(this).attr('data-actualArea'), 3),3);
            }
            if ($(this).attr('data-actualVolume')) {
                actualVolume = fixedTo($(this).attr('data-actualVolume'),3);
            }
            tooltipContent = nsBooking.buildToolTip(tooltipContent, cargoOnHold, newCargo,
                customerRef, registrationPlate, loadPort, discPort, actualLength, actualWidth,
                actualHeight, actualArea, actualVolume, actualWeight, weightUnit, $(this));
            nsBooking.setTootipInfo(tip, tooltipContent);
        });

        // cargo list Import VIN list functionality
        $(document).on('click', '#importVinListLink', function() {
            vinAnalyzer.fnReset();
            vinCount = 0;
            $('#bookingCargoListGrid tbody tr').each(function(index, item) {
                if ($(item).find('.cargoVinNbr').length > 0 && (!$(item).find('.cargoVinNbr').val() || !$.trim($(item).find('.cargoVinNbr').val()))) {
                    vinCount++;
                }
            });
            vinAnalyzer.showQuant(vinCount, 0);
            $('#importVinPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '50%'
            });
            $('#cargoListInsertBtn').off('click');
            $('#cargoListInsertBtn').removeClass('orangeButton saveButton').addClass('whitebutton cancelButton');
            $('#cargoListAnalysisVals').val('');
        });

        //when cargo list save button is clicked
        $('#cargoListSavBtn').click(function() {
            var isLoadRecived = false,
                consignmentLegId = '',
                consId = '',
                vinMessage = '',
                cargoList = [],
                cargoConsignmentsStr = [],
                cargoStr = {},
                data = {};
            if($('input[name="cargoVIN"]').val()){
            	nsCore.showAlert('Please click on "Apply to all" to insert VIN number.');
            	return false;
            }
            $('#bookingCargoListGrid tbody tr').each(function() {
               // var condition = getCargoCondition($(this)).split(',').join('\n'),
                var condition = getCargoCondition($(this)),
                    vinnumber = getVinNum($(this)),
                    cargoId = getCargoId($(this)),
                    timeStamp = $(this).find('.cargoVinNbr').attr('data-viewcargotimestamp');
                    if (isVinEmptyOrNull($(this))&& (isDateLoadedNotNullAndEmpty($(this)) || isDateRcvdNotNullAndEmpty($(this))
                    		|| isRelLoadDateNotNullAndEmpty($(this)) || $.trim($(this).find('.cargoStatusCode').val()) === 6)){
                        if (timeStamp){
                            isLoadRecived = true;
                        }
                }
                vinMessage = isValidVinNum($(this), vinMessage);
                consignmentLegId = $(this).find('.cargoVinNbr').attr('data-id');
                consId = $(this).find('.cargoVinNbr').attr('data-consId');
                cargoList.push({
                    id: cargoId,
                    cargoCondition: condition,
                    vinNumber: vinnumber,
                    timeStamp: timeStamp
                });
            });
            cargoStr = {
                id: '0',
                vinNumber: '0',
                condition: '0'
            };
            cargoConsignmentsStr.push({
                id: '1',
                cargo: cargoStr
            });
            cargoList.push({
                id: '0',
                cargoCondition: '',
                timeStamp: '0',
                vinNumber: '0'
            });
            data = {
                id: consId,
                consignmentLegId: consignmentLegId,
                cargoList: cargoList,
                vinDesc: $('input[name="cargoLabel"]').val(),
                timeStamp : $('#viewcargoVIN').attr('viewCargoTimeStamp'),
                moduleType : 'BOOK' 
            };
            if (vinMessage) {
                nsCore.showAlert(vinMessage);
            } else {
            	 var emptyVIN=false
            	 $('#bookingCargoListGrid .cargoVinNbr').each(function(ind,fld){
            	     if($(fld).val().trim()===""){
                        emptyVIN=true;
            	     }
            	 })
            	 var checkLoadReceived=false
            	 if(nsCore.appModel.selected==="subBooking"){
            		 $(nsCore.appModel.viewSubBooking.consignmentLegModelList).each(function(ind,leg) {
	                     if(leg.receivedUnits!=="0" || leg.loadedUnits!=="0"){
	                         checkLoadReceived=true
	                     }
	                 })
            	 }
            	
                if (!isLoadRecived && ((checkLoadReceived && !emptyVIN) || (!checkLoadReceived))) {
                    vmsService.vmsApiService(function(response) {
                        if (response) {
                        	if(response === '45000'){
                        		nsCore.showAlert('Someone else have updated the data since you retrieved the Booking information');
                        	} else if (response === '200') {
                                $('#cargoListPopup').dialog('close');
                                if($('.thrdLevel.activeSubBook .expandSubBooking.fa-minus').length===1) {
                                	$('.thrdLevel.activeSubBook .expandSubBooking.fa-minus').trigger('click');
                                	$('.thrdLevel.activeSubBook .expandSubBooking.fa-plus').trigger('click');
                                }
                            }
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.updateCargoList, 'POST', JSON.stringify(data));
                } else {
                    nsCore.showAlert('Can not be null as some of the cargos are arrived/loaded/ReleasedToLoad!');
                }
               
            }
        });
        vinAnalyzer.fnScroller();
    });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);