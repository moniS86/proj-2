/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var dateFormat = localStorage.getItem('dateFormat'), timeFormat = localStorage.getItem('timeFormat');
    function isValidBLStatus() {
        return $('#subBlStatus').val() && $('#subBlStatus').val() !== '10' || (($('#totLDD').text()) > 0);
    }
    function resetSubBookingValues() {
        $('input[name="totalBookedUnits"]').val('');
        $('.totalRCD a, .totalLDD a').text(0);
        $('#consignmentId').val('');
        $('#cargoList').find('input[type="text"]').val('');
    }
    function doAddNewBooking() {
        $('.mainSubBookingFormWrap').show();
        $('.mainSubBookingListWrap .subBookingNbrsCntnt').find('.singleColItem').removeClass(
            'ui-selecting activeSubBook');
        $('.mainSubBookingListWrap .subBookContentListCol').append(
            '<div class="newBookLabel treeListLabel ui-selecting activeSubBook">New Sub Booking</div>');
        $('.mainSubBookingFormWrap .mainSubBookFormTitle').text('New Sub Booking');
    }
    $(document)
        .ready(
            function() {
                $(document).on(
                    'click',
                    '.viewLastChanged',
                    function() {
                        var subbookingId = $(this).closest('table').attr('data-subbookingid'), ajUrl = nsBooking.sbID
                            + subbookingId + '&dateFormat=' + dateFormat + '&timeFormat=' + timeFormat;
                        if ($(this).hasClass('disabledLink')) {
                            return false;
                        }
                        $('.toolTipWrapper').hide();
                        $('#lastChangedPopup').dialog({
                            modal : true,
                            resizable : false,
                            draggable : false,
                            width : '65%'
                        });
                        vmsService.vmsApiService(function(response) {
                            if (response) {
                                if ($.fn.DataTable.fnIsDataTable($('#bookingLastChangedGrid'))) {
                                    $('#bookingLastChangedGrid').dataTable().api().clear().draw();
                                    $('#bookingLastChangedGrid').dataTable().api().rows.add(response.lastViewModelList)
                                        .draw();
                                    $('#bookingLastChangedGrid').dataTable().fnSort([
                                        [
                                            4, 'desc'
                                        ]
                                    ]);
                                } else {
                                    if (!response.lastViewModelList) {
                                        response.lastViewModelList = [];
                                    }
                                    $('#bookingLastChangedGrid').DataTable({
                                        'processing' : true,
                                        'serverSide' : false,
                                        'bFilter' : true,
                                        'tabIndex' : -1,
                                        'bSort' : false,
                                        'bJQueryUI' : true,
                                        'paging' : false,
                                        'ordering' : true,
                                        'info' : false,
                                        'searching' : false,
                                        'fixedHeader' : false,
                                        "orderClasses" : false,
                                        'dom' : '<t>',
                                        'scrollY' : '400px',
                                        'scrollCollapse' : true,
                                        'data' : response.lastViewModelList,
                                        'bAutoWidth' : false,
                                        'order' : [
                                            [
                                                4, 'desc'
                                            ]
                                        ],
                                        'columns' : [
                                            {
                                                data : 'item',
                                                'orderable' : false
                                            }, {
                                                data : 'changedBy',
                                                'orderable' : false
                                            }, {
                                                data : 'office',
                                                'orderable' : false
                                            }, {
                                                data : 'lastChanged',
                                                'orderable' : true,
                                                'orderData' : [
                                                    4
                                                ],
                                                'bSortable' : true
                                            }, {
                                                data : 'lastChangedStandard',
                                                'orderable' : true,
                                                'type' : 'date-euro',
                                                'visible' : false,
                                                'searchable' : false
                                            }
                                        ]
                                    });
                                }
                            } else {
                                nsCore.showAlert(nsBooking.errorMsg);
                            }
                        }, ajUrl, 'GET', null);
                    });
                $(document).on('change', '.chargeType', function() {
                    var val1 = $(this).val(), ele = $(this).parent().parent().find('.chargeGrossFreight');
                    $.each(nsBooking.sbChargeType, function(i, val) {
                        var arr = val.split('|');
                        if (val1 === arr[0] && arr[1] === 'Yes') {
                            ele.prop('checked', true);
                            return false;
                        } else {
                            ele.prop('checked', false);
                        }
                    })
                });
                $('#makeModelListLink').click(function() {
                    var make = $('#bookingCargoMake').val(), model = $('#bookingCargoModel').val(), formdata = {};
                    if ((make === '') && (model === '')) {
                        $('#bookingCargoModel').attr('disabled');
                    } else {
                        formdata = {
                            make : $('#bookingCargoMake').val(),
                            model : $('#bookingCargoModel').val()
                        };
                        vmsService.vmsApiServiceLoad(function(response) {
                            var testObj = '';
                            if (response) {
                                if ($.fn.DataTable.isDataTable($('#makeModelListGrid'))) {
                                    $('#makeModelListGrid').dataTable().api().clear().draw();
                                    $('#makeModelListGrid').dataTable().api().rows.add(response).draw();
                                } else {
                                    testObj = JSON.parse(JSON.stringify(nsBooking.normalGridOpts));
                                    testObj.dom = '<t>';
                                    testObj.scrollCollapse = true;
                                    testObj.scrollX = true;
                                    testObj.scrollY = 200;
                                    testObj.data = response;
                                    testObj.bAutoWidth = false;
                                    testObj.columns = [
                                        {
                                            'render' : function() {
                                                return '<input type="radio" name="selectMakeModel" value="">';
                                            }
                                        }, {
                                            data : 'make',
                                            defaultContent : ""
                                        }, {
                                            data : 'model',
                                            defaultContent : ""
                                        }, {
                                            data : 'yearOfManu',
                                            defaultContent : ""
                                        }, {
                                            data : 'cargoDescription',
                                            sWidth : '150px',
                                            defaultContent : ""
                                        }, {
                                            data : 'cargoText',
                                            defaultContent : ""
                                        }, {
                                            data : 'dimensionText',
                                            defaultContent : ""
                                        }, {
                                            data : 'length',
                                            className : 'pad2x',
                                            'render' : function(list, type, full) {
                                                if (full.length) {
                                                    return parseFloat(full.length).toFixed(3);
                                                } else {
                                                    return full.length;
                                                }
                                            },
                                            defaultContent : ""
                                        }, {
                                            data : 'width',
                                            'render' : function(list, type, full) {
                                                if (full.width) {
                                                    return parseFloat(full.width).toFixed(3);
                                                } else {
                                                    return full.width;
                                                }
                                            },
                                            defaultContent : ""
                                        }, {
                                            data : 'height',
                                            'render' : function(list, type, full) {
                                                if (full.height) {
                                                    return parseFloat(full.height).toFixed(3);
                                                } else {
                                                    return full.height;
                                                }
                                            },
                                            defaultContent : ""
                                        }, {
                                            data : 'weight',
                                            defaultContent : ""
                                        }, {
                                            data : 'area',
                                            'render' : function(list, type, full) {
                                                if (full.area) {
                                                    return parseFloat(full.area).toFixed(3);
                                                } else {
                                                    return full.area;
                                                }
                                            },
                                            defaultContent : ""
                                        }, {
                                            data : 'volume',
                                            'render' : function(list, type, full) {
                                                if (full.volume) {
                                                    return parseFloat(full.volume).toFixed(3);
                                                } else {
                                                    return full.volume;
                                                }
                                            },
                                            defaultContent : ""
                                        }
                                    ];
                                    $('#makeModelListGrid').DataTable(testObj);
                                }
                            } else {
                                nsCore.showAlert(nsBooking.errorMsg);
                            }
                        }, nsBooking.searchAll, 'POST', JSON.stringify(formdata));
                        $('#makeModelListPopup').dialog({
                            modal : true,
                            resizable : false,
                            draggable : false,
                            width : '75%',
                            close : function() {
                                $('#makeModelListGrid').dataTable().api().clear().draw();
                            },
                            open : function() {
                                if ($.fn.DataTable.fnIsDataTable($('#makeModelListGrid'))) {
                                    $('#makeModelListGrid').dataTable().api().columns.adjust();
                                }
                            }
                        }).data('origin', 'subBooking');
                    }
                });
                $('#makeModelList').submit(
                    function(e) {
                        var makeContent = '', params = [], rowData = '', bookedRow = '';
                        e.preventDefault();
                        rowData = $('#makeModelListGrid').dataTable().api().row(
                            $('#makeModelListGrid tbody td input[type="radio"]:checked').closest('tr')).data();
                        if (!rowData) {
                            nsCore.showAlert('Select a valid Make/ Model');
                            return;
                        }
                        $(this).closest('.ui-dialog-content').dialog('close');
                        if ($('#makeModelListPopup').data('origin') === 'subBooking') {
                            $('#bookingCargoText').val(rowData.cargoText);
                            $('select[name="bookingCargoType"]').val(rowData.cargoType);
                            if (!nsBooking.cargoPopulateText
                                && ($('.mainSubBookFormTitle').text().indexOf('New Sub Booking') !== -1)) {
                                $('#cargoDescriptionIcon').val(rowData.cargoText);
                            }
                            $('#bookingCargoModel').val('');
                            makeContent = rowData.yearOfManu + ' ' + rowData.make + ' ' + rowData.model;
                            $('#bookingCargoMake').val(makeContent);
                            bookedRow = $('#mainBookingDimensionsGrid tbody tr.bookedDimensionsRow');
                            params = [
                                'length', 'width', 'height', 'area', 'weight', 'volume', 'dimensions'
                            ];
                            params.forEach(function(entry) {
                                if (entry === ('weight') || entry === ('dimensions')) {
                                    bookedRow.find('.' + entry).val(rowData[entry] || '');
                                } else {
                                    bookedRow.find('.' + entry).val(
                                        ((parseFloat(rowData[entry]).toFixed(3)) === 'NaN' ? ''
                                            : (parseFloat(rowData[entry]).toFixed(3))));
                                }
                            });
                            if (rowData['length'] || rowData['width'] || rowData['height']) {
                                bookedRow.find('#shipInfovalidStatus').prop('checked', true);
                            } else {
                                bookedRow.find('#shipInfoHistStatus').prop('checked', true);
                            }
                            nsBooking.bookenableDisableDims(bookedRow.find('#shipInfovalidStatus'));
                            nsBooking.isMoreThanMaxHeight($('#subBHei'));
                            nsBooking.isMoreThanMaxWeight($('#subBWei'));
                            nsBooking.enabOrDisaRate($('#subAttr'));
                            nsBooking.copyToFre(bookedRow);
                            nsBookDoc.dimensionTableUnits($('#mainBookingDimensionsGrid tbody tr'));
                        } else {
                            if ($('#makeModelListPopup').data('origin') === 'quickBooking') {
                                nsBooking.dimensionSelected(rowData);
                            }
                        }
                        $('#bookingCargoType').trigger('change');
                    });
                $(document)
                    .on(
                        'click',
                        '.mainBookingListWrap .subBookContentListCol .thrdLevel, .mainBookingListWrap .subBookContentListCol .singleColItem',
                        function(e) {
                            var errMsgDoc = '', subBookingTitle = $(this).text(), bookId = $(this).attr(
                                'data-bookingId'), freightChargeBasis = [], index = '', bookingNumber = '', ajxURL = '', sendBackToSubCopy = false, hideGetPsbleBtn = false;
                            if ($(this).hasClass('scndLevel')) {
                                return;
                            }
                            if (e.currentTarget.id.indexOf('scndLevel') !== -1
                                    || e.currentTarget.id.indexOf('frthLevel') !== -1) {
                                    return;
                                }
                            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                                return false;
                            }
                            nsBooking.isCopiedToFreighted='N';
                            nsBookDoc.existingRouteDetails = {
                                'vesVoy' : [],
                                'newVesVoy' : [],
                                'legCount' : 0,
                                'newLegCount' : 0,
                                'addEdit':[],
                                'newLoadPort':[],
                                'newDisPort':[],
                                'newETD':[],
                                'newETA':[],
                                'oldLoadPort':[],
                                'oldDisPort':[],
                                'oldETD':[],
                                'oldETA':[],
                                
                            }
                            $('.dropMenuIcon').hide();
                            nsBookDoc.removeDropDownIcon();
                            $(this).find('.dropMenuIcon').show()
                            $('.withNewBooking').removeClass('withNewBooking');
                            bookingNumber = $('.scndLevel[data-bookingid=' + $(this).attr('data-bookingid') + ']')
                                .attr('data-filtering');
                            nsBookDoc.addingBottomBorderScndLevel()
                            if ($(this).html() === 'New Sub Booking') {
                                return false;
                            }
                            $('.activeNavigationItem').removeClass('activeNavigationItem');
                            nsBookDoc.frthLvlId = '';
                            $(this).addClass('activeNavigationItem');
                            $('.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#c9c9c9')
                                .css('color', '#000000');
                            $('.bookingUnitWrap').hide();
                            $('.subBookListFormWrap').show();
                            $('.mainBookingDetailsWrap').show();
                            $('.routeDetailsAcc').show();
                            nsBooking.bookUnitPopUpFlag = false;
                            $('.preloaderWrapper').show();
                            nsBookDoc.selectePossibleVoyage = [];
                            nsBooking.selectedEntity.selectedSubBooking = $(this).attr('data-subbookingid');
                            nsBooking.selectedEntity.selectedSubBookingMenuItem = $(this).attr('data-subbookingid');
                            $('.bookingUnitLink').removeAttr('disabled');
                            $('#mainBookDetailCustomerCode, #mainBookDetailCustomerDesc, #mCustomerRef, #mainContract')
                                .attr('disabled', true);
                            $('#createFreshBook').find('.formSubmitButtons').hide();
                            $('.newBookLabel').remove();
                            if (nsBooking.isCopyBookingEnabled === 'Yes') {
                                nsBooking.cpySubSelect = true;
                                nsBooking.updateBillofLading(errMsgDoc);
                                nsBooking.cpySubSelect = false;
                            }
                            nsBooking.cargoPopulateText = '';
                            nsBooking.clearNewSubBook();
                            if (!(sendBackToSubCopy)) {
                                nsBooking.highlightTreeItem($('.mainBookingListWrap .subBookingNbrsCntnt').find(
                                    '.singleColItem.thrdLevel'), $(this), 'activeSubBook ui-selecting');
                            }
                            nsBooking.globalBookingFlag.currentEditLevel = 'subBooking';
                            $(
                                '#mainViewSummaryLink,#bookingAllocItem,.mainMoveUnitsLnk,.billLadingDetailsDivWrapper,'
                                    + '.possibleVoyageWrap,.possibleVoyageNewWrap').hide();
                            $('.mainSubBookingListWrap').hide();
                            $(
                                '.mainBookingDetailsWrap .getPossibleVoyages, .subBookingDimensionsInfoWrapper,.routeDetailsWrapper,'
                                    + '.freightCargoDetailsDivWrapper,.mainSubBookingFormWrap,.mainBookingDetailsWrap '
                                    + '.showPreviousVoyageClass,.mainBookingDetailsWrap .showPreviousVoyageClasslbl')
                                .show();
                            $('.applyRateDiv').find('span').html('');
                            $('#possVoyagesHide').hide();
                            $('#subBookingChargesGrid tbody').show();
                            $('.mainBookingDetailFormTitle, .comHeaderItem').hide();
                            $('.subBookLevel, .subBookLevel .mainBookingDetailFormTitle').show();
                            $('#totalUnitsRow').show();
                            $('.accElement.routeDetailsAcc').css('width', '100%');
                            $('.routeDetailsWrapper').css('width', '80%');
                            $('.mainBookingDetailsWrap').css('background', '#ffffff');
                            $('#mainAddSubBoooking').removeAttr('disabled');
                            $('#cargoDetailsTab').attr('data-clicked', false);
                            $('.subBookLevel .mainBookingDetailFormTitle').html(
                                'Booking: <span id="mainBookDetailTitleeVal">' + bookingNumber + '</span>');
                            nsBookDoc.panelActions('mainBookingContentWrapper', 'open');
                            nsBooking.subBookingActiveId = $(this).attr('data-subbookingid');
                            $('#bookId').val(bookId);
                            $('#mainBookDetailTitleeVal, .subBookLevel #mainBookDetailTitleeVal ').text(
                                $('.scndLevel[data-bookingId=' + $(this).attr('data-bookingid') + ']').attr(
                                    'data-filtering'));
                            ajxURL = nsBooking.viewSubBooking + $(this).attr('data-bookingId') + '&subbookingId='
                                + $(this).attr('data-subbookingid') + '&dateFormat=' + dateFormat + '&timeFormat='
                                + timeFormat + '&module=BOOK' + '&timestamp=' + $(this).attr('data-timestamp');
                            vmsService
                                .vmsApiService(
                                    function(obj) {
                                        if (obj) {
                                        	 if(typeof obj ==="string" && obj.indexOf('"responseDescription":"concurrency"')){ // added 45000 check for concurrency
                                              	nsCore.showAlert('Someone else have updated the data since you retrieved the booking information');
                                         	   $('.preloaderWrapper').hide();
                                         	 }else{
                                         		nsBookDoc.newLegFlag='N'
                                             	nsCore.appModel.setCurNavSelection('subBooking', obj)
                                            if (obj.chargeModelList.length >= 1
                                                && (obj.chargeModelList[0].chargeTypeCode)) {
                                                nsBooking.chrgRateFlag = false;
                                            }
                                            nsBooking.allChargeid = '';
                                            nsBooking.subBookingIdDelete = '';
                                            nsBooking.allChargeTimeSt = '';
                                            nsBooking.clearNewSubBook();
                                            $('.thrdLevel[data-subbookingid=' + obj.subBookingId + ']').attr(
                                                'data-consignmentlegid',
                                                obj.consignmentLegModelList[0].consignmentLegId);
                                            $('.mainSubBookFormTitle').attr('data-subBookingTitle', subBookingTitle)
                                                .text(subBookingTitle);
                                            $('#mainBookingFreightCommission').removeAttr('disabled');
                                            $('.thrdLevel[data-subbookingid=' + obj.subBookingId + ']').attr(
                                                'data-timestamp', obj.timeStamp);
                                            nsBooking.subBookingObj = obj;
                                            nsBooking.loadSubbookingContent(obj);
                                            if (nsBooking.isCopyBookingEnabled === 'Yes') {
                                                resetSubBookingValues();
                                            }
                                            if (sendBackToSubCopy) {
                                                doAddNewBooking();
                                            }
                                            sendBackToSubCopy = false;
                                            $('.subBookingNbrsCntnt').show();
                                            $('.preloaderWrapper').hide();
                                            if (obj.isReservedEquipment === 'Y') {
                                                $('#resEquip').attr('checked', true);
                                            } else {
                                                $('#resEquip').attr('checked', false);
                                            }
                                            if (isValidBLStatus()) {
                                                $('#bookingAllocStatus').attr('disabled', 'disabled');
                                            } else {
                                                $('#bookingAllocStatus').removeAttr('disabled');
                                            }
                                            if (obj.chargeModelList.length === 1
                                                && !(obj.chargeModelList[0].chargeTypeCode)) {
                                                $('#subBookingChargesGrid tbody').hide();
                                            } else {
                                                $('#subBookingChargesGrid tbody').show();
                                            }                                            
                                          nsCore.roundOffCharges();                                          
                                        }
                                        } else {
                                            freightChargeBasis = nsBooking.chargeBasisOptions.slice();
                                            index = freightChargeBasis.indexOf('PC,Per cent of freight');
                                            if (index !== -1) {
                                                freightChargeBasis.splice(index, 1);
                                            }
                                            $('#mainBookingFreightBasis').html(
                                                nsBookDoc.generateSelect(freightChargeBasis, '', true));
                                            $('#mainBookingFreightCurrency').text(
                                                nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
                                            $('.chargeType').html(
                                                nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true));
                                            $('.chargeBasis').html(
                                                nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
                                            $('.chargeCurrency').html(
                                                nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
                                            $('select[name="cargoEquipmentNbr"]').val('');
                                            $('input[name="cargoEquipmentType"]').val('');
                                            $('#cargoEquipmentNbr').attr('disabled', 'disabled');
                                            $('input[name="bookingDocCode"]').val($('#billDocumentationOffice').val());
                                            $('input[name="bookingDocDesc"]').val(
                                                $('#billDocumentationOfficeDesc').val());
                                            $('#bookingDocOfficeId').val($('#BLDocumentationOfficeId').val());
                                            nsCore.showAlert(nsBooking.errorMsg);
                                        }
                                        if ($('.mainBookingListWrap .subBookingNbrsCntnt').find(
                                            '.singleColItem.activeSubBook.ui-selecting').attr('data-deletable') === 'Yes') {
                                            $('.mainBookingListWrap .subBookingNbrsCntnt').find(
                                                '.singleColItem.activeSubBook.ui-selecting').find('.bookingRemoveIcon')
                                                .removeClass('rowRemoveDisabledIcon');
                                        }
                                        if (obj.bolStatus !== '10') {
                                            $('.wayCargo').attr('disabled', 'disabled');
                                            $('.mainLeg').attr('disabled', 'disabled');
                                            $('.allocStatusType').attr('disabled', 'disabled');
                                            $('#totalBookedUnits').attr('disabled', 'disabled');
                                            $('.getPossibleVoyages')
                                                .attr('style', 'pointer-events:none;cursor:default');
                                            $('.getPossibleVoyages').addClass('disabledLink');
                                            $('.mainBookingDetailsWrap #possVoyagesHide').hide();
                                            $('.legField').children('a').each(function() {
                                                $(this).attr('style', 'pointer-events:none;cursor:default');
                                            });
                                        } else {
                                            $('.mainLeg').removeAttr('disabled');
                                            $('.wayCargo').removeAttr('disabled');
                                            $('.selectedRoute').removeAttr('disabled');
                                            $.each(obj.consignmentLegModelList, function(key, value) {
                                                if (value.received === 'Y' || value.loaded === 'Y') {
                                                    hideGetPsbleBtn = true;
                                                    return false;
                                                }
                                            });
                                            if (!hideGetPsbleBtn) {
                                                $('.getPossibleVoyages').attr('style',
                                                    'pointer-events:null;cursor:pointer');
                                                $('.getPossibleVoyages').removeClass('disabledLink');
                                            }
                                            $('.legField').children('a').each(function() {
                                                $(this).attr('style', 'pointer-events:null;cursor:pointer');
                                            });
                                        }
                                        $('.selectedRoute').attr('disabled', false);// VMSAG-3943
                                                                                    // route
                                                                                    // selection
                                                                                    // enabled
                                                                                    // for
                                                                                    // all
                                                                                    // bol
                                                                                    // status
                                        // added for 4161
                                        if ($('.thrdLevel.activeNavigationItem').find('.expandSubBooking')) {
                                            $('.selectedRoute:checked').trigger('change');
                                        }
                                        var allocStatusTypeValue =  $('#allocStatusType').find(":selected").text();
                                        if(obj.bolStatus === '10' && allocStatusTypeValue === "Reserve"){
                                            $('#allocStatusType').removeAttr('disabled');
                                        }
                                       nsBookDoc.diffOfficeValidation(nsBookDoc.detectConsStatusType(obj.bolStatus))
                                    }, ajxURL, 'POST', null);
                        });
                $('#cargoEquipmentNbr').change(function() {
                    var selectedVal = $('#cargoEquipmentNbr').val();
                    $('#cargoEquipmentType').val(unescape(selectedVal));
                });
                $('.mainSubBookingListWrap')
                    .on(
                        'click',
                        '.subBookContentListCol .singleColItem .subBookingInlineMenu',
                        function(e) {
                            var subBookingId = '', bookingId = '', selectedRoute = '', currentEle = '', ele = '', bookingMenu = {}, tooltipContent = '', consTimeStamp = $(
                                e.target.parentElement.parentElement).attr('data-conslegtimestamp');
                            e.stopPropagation();
                            if (nsBooking.globalBookingFlag.mainBookingFlag) {
                                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                                return false;
                            }
                            subBookingId = $(this).closest('.singleColItem').attr('data-subbookingid');
                            bookingId = $(this).closest('.singleColItem').attr('data-bookingid');
                            nsBooking.selectedEntity.selectedSubBookingMenuItem = subBookingId;
                            $('.toolTipWrapper').text('').hide();
                            bookingMenu = {
                                'subBookingCopy' : 'Copy',
                                'makeBillLading' : 'Make Bill of Lading',
                                'viewLastChanged' : 'View Last Changed'
                            };
                            tooltipContent += '<table cellspacing="0" cellpadding="0" class="toolTipList" data-subbookingid='
                                + subBookingId + '>';
                            $.each(bookingMenu, function(key, value) {
                                tooltipContent += '<tr><td><a class="' + key + '" data-consTimeStamp ="'
                                    + consTimeStamp + '" href="javascript:void(0);" data-bookingId="' + bookingId
                                    + '" >' + value + '</a></td></tr>';
                            });
                            tooltipContent += '</table></div>';
                            $('.toolTipWrapper').html(tooltipContent).show();
                            selectedRoute = $('.selectedRoute:checked');
                            nsBookDoc.enableDisableSubLinks($(selectedRoute).val());
                            currentEle = $(this);
                            ele = $('.toolTipWrapper');
                            $(ele).position({
                                my : 'left top',
                                at : 'left bottom',
                                of : $(currentEle)
                            });
                        });
                $(document)
                    .on(
                        'click',
                        '.subBookingCopy',
                        function(e) {
                            var userName = '', timeStamp = '', postUrl1 = '', subBookCount = '';
                            if ($(this).hasClass('disabledLink')) {
                                return false;
                            }
                            $('.bookingUnitLink').attr('disabled', 'disabled');
                            $('.bookingUnitLink').css('color', 'grey');
                            e.stopImmediatePropagation();
                            e.stopPropagation();
                            nsBooking.highlightTreeItem($('.mainSubBookingListWrap .subBookingNbrsCntnt').find(
                                '.singleColItem'), $(this), 'activeSubBook ui-selecting');
                            userName = document.getElementById('userName').value;
                            nsBooking.selectedEntity.selectedBookingMenuItem = $('.mainBookingListWrap').find(
                                '.subBookContentListCol').find('.ui-selecting').attr('data-bookingid');
                            timeStamp = $('.mainBookingListWrap .subBookContentListCol')
                                .find('.ui-selecting.thrdLevel').attr('data-timestamp');
                            postUrl1 = '/Vms/subbooking/copy?userName=' + userName + '&bookID='
                                + nsBooking.selectedEntity.selectedBookingMenuItem + '&subbookingId='
                                + nsBooking.selectedEntity.selectedSubBookingMenuItem + '&modelType=BOOK'
                                + '&timeStamp=' + timeStamp;
                            vmsService
                                .vmsApiServiceType(
                                    function(response) {
                                        var copiedSubBook = '', iconNoVin = '';
                                        if(response && response.responseCode === '33'){
                                        	nsCore.showAlert(response.responseDescription);
                                        }else if (response && response.responseData) {
                                        	response= response.responseData;
                                            $('.mainSubBookingFormWrap').show();
                                            $('.mainBookingListWrap .subBookingNbrsCntnt').find(
                                                '.singleColItem.thrdLevel').removeClass('ui-selecting activeSubBook');
                                            iconNoVin = '<i class="fa fa-plus expandSubBooking "></i>'
                                            copiedSubBook = '<div data-subbookingid="'
                                                + response.id
                                                + '" data-bookingId="'
                                                + nsBooking.selectedEntity.selectedBookingMenuItem
                                                + '"data-timestamp="0" data-consLegTimeStamp="0 " data-consignmentLegId="0" data-filtering="'
                                                + response.subBookHeader
                                                + '" class="cargoVin billVin singleColItem thrdLevel clippedTitle">'
                                                + iconNoVin
                                                + '<i class="fa  statusIcon" style="color:#000000;"></i><span><a href="javascript:void(0)">'
                                                + response.subBookHeader
                                                + '</a></span><div class="mainBookingItemIcons"><span class="icons_sprite subBookingInlineMenu roundDownArrowIcon fa fa-caret-down">'
                                                + '</span></div></div>';
                                            nsBookDoc.insertNewAtSubBookingLevel(copiedSubBook);
                                            $('.mainSubBookFormTitle').text(response.subBookHeader);
                                            $(
                                                '.mainBookingListWrap .subBookingNbrsCntnt div[data-subbookingid='
                                                    + response.id + ']').trigger('click');
                                            subBookCount = parseInt($('.mainSubBookingCount').text()) + 1;
                                            $('.mainSubBookingCount').text(subBookCount);
                                            $('#cargoList').find('input[type="text"]').val('');
                                            $('.defaultSearchMsg').hide();
                                            $('.toolTipWrapper').hide();
                                        } else {
                                            nsCore.showAlert(nsBooking.errorMsg);
                                        }
                                    }, postUrl1, 'POST', null);
                        });
                $('#bookingCargoType').on('change', function() {
                    nsBooking.getCargoStateList($(this).val(), '');
                });
                $('.dialogCloseIconCargo').click(function() {
                    nsBooking.vinCount = 0;
                    $(this).closest('.ui-dialog-content').dialog('close');
                });
                $('#routeDetailGrid')
                    .on(
                        'change',
                        '#allocStatusType',
                        function() {
                            if ($(this).parent().parent().find('td:nth-child(2)').text() === ''
                                && $(this).val() === 'Y') {
                                nsCore
                                    .showAlert('Voyage Information is missing. Save Booking as reserved and add voyage information');
                                $(this).val('N');
                                return;                            
                            }
                            if ($(this).parent().parent().find('.selectedRoute').is(':checked')) {
                                $('#bookingAllocStatus').val($(this).val());
                            }
                        });
                $('#cargoListCancel').click(function() {
                    nsBooking.vinCount = 0;
                    $('#importVinPopup').dialog('close');
                });
            });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);
