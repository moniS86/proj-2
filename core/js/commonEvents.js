/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsCore, vmsService, $) {
    var smartData = {
        vesselCode : [],
        vesselDesc : [],
        usPortCode : [],
        usPortDesc : [],
        portCode : [],
        portDesc : [],
        tradeCode : [],
        tradeDesc : [],
        countryCode : [],
        countryDesc : [],
        docOfficeCode : [],
        docOfficeDesc : [],
        portAreaDesc : [],
        currencyCode : [],
        currencyName : [],
        portAreaCodes : []
    }, localStorageCountry = localStorage.getItem('countryCodes'), autoCompletePairs = [], commonEventsObj = {}, searchLoader = {}, dialogTimer;
    
    function loadPortCode(){
		vmsService.vmsApiService(function(response) {
            if (response) {
                if (typeof response === 'object') {
                    setResponseLocalStorage(response);
                } else {
                    nsCore.showAlert('Sorry Something went wrong!! Please Sign out and Login again');
                }
            } else {
                nsCore.showAlert('error, please try again later');
            }
        }, '/Vms/masterdata/ports', 'POST', null);
	}
    
    function loadVesselCode(){
    	vmsService.vmsApiService(function(response) {
            if (response) {
                if (typeof response === 'object') {
                    setResponseLocalStorage(response);
                } else {
                    nsCore.showAlert('Sorry Something went wrong!! Please Sign out and Login again');
                }
            } else {
                nsCore.showAlert('error, please try again later');
            }
        }, '/Vms/masterdata/vessels', 'POST', null);
    }
    
    function loadTradeCode(){
    	vmsService.vmsApiService(function(response) {
            if (response) {
                if (typeof response === 'object') {
                    setResponseLocalStorage(response);
                } else {
                    nsCore.showAlert('Sorry Something went wrong!! Please Sign out and Login again');
                }
            } else {
                nsCore.showAlert('error, please try again later');
            }
        }, '/Vms/masterdata/trades', 'POST', null);
    }
    
    $(document).ready(
        function() {
            autoCompleteDelCodeDelNameInit();
            var idleTimeLimit = localStorage.getItem('idleTimeLimit') || '3300', displayLimit = localStorage
                .getItem('displayLimit')
                || '300', dialogText = localStorage.getItem('dialogText');
            $('.mastrDataMgmtNav,.scheduleNav,.userMenu').hover(function() {
                $(this).find('.mdrMenu').toggle();
            });
            $('.mastrDataMgmtNav .mdrMenu ul li.subMenuParent,.scheduleNav .mdrMenu ul li.subMenuParent').hover(
                function() {
                    $(this).toggleClass('active');
                    $(this).find('.subMenu').toggle();
                });
            // fix for dropdown Z-index vs menu Hover
            $('.navigationBar').on('mouseenter', function() {
                $('.filterBox').blur();
                $('#yearOfManufacture').blur();
                $('#customerStatusFilter').blur();
                $('#Currency').blur();
                $('#rateTrade').blur();
            });
            // Main Header Nav Collapse
            $('#collapseHeaderNav').click(function() {
                $('.logoContentWrap').slideToggle(function() {
                    loadUI(getPage(window.location.href));
                });
            });
            // Schedule nav Bar Hover Event
            /*
             * $('.scheduleNav .mdrMenu ul li').hover(function() {
             * $(this).toggleClass('active'); $(this).find('.subMenu').show();
             * });
             */
            
//            common popup
            attachEventBinder();          
            
            $(document).keyup(function(e){                
                if(e.keyCode === 13){
                	$('.dt-button.buttons-excel.buttons-html5.exportExcelLnk.lightGreyGradient.normalBtnLink').removeAttr('disabled');                	
                }
            });
            
            $(document).keydown(function(e){
            	if(e.keyCode === 13){
            		$('.dt-button.buttons-excel.buttons-html5.exportExcelLnk.lightGreyGradient.normalBtnLink').attr('disabled','disabled');                	
                }
            });
            $(document).on('keyup', '#rangeStart, #rangeEnd', function() {
            	$(this).val($(this).val().replace(".","").replace(",","").replace("-",""));
            })
            
            $(document).on(
                'keydown',
                '.dataTables_scrollHeadInner table thead input, .dataTables_scrollHeadInner table thead select',
                function(e) {
                    if (e.shiftKey && e.keyCode === 9) {
                        $('.dataTables_scrollBody').scrollLeft(
                            $('.dataTables_scrollBody').scrollLeft() - parseInt($(this).closest('th').outerWidth()));
                    }
                    if (!e.shiftKey && e.which === 9) {
                        $('.dataTables_scrollBody').scrollLeft(
                            $('.dataTables_scrollBody').scrollLeft() + parseInt($(this).closest('th').outerWidth()));
                    }
                });

            
            if (localStorage.getItem('countryCodes') === null) {

                vmsService.vmsApiService(function(response) {
             
                    if (response) {
                        if (typeof response === 'object') {
                            setResponseLocalStorage( response);
                        } else {
                            nsCore.showAlert('Sorry Something went wrong!! Please Sign out and Login again');
                        }
                    } else {
                        nsCore.showAlert('error, please try again later');
                    }
                }, '/Vms/masterdata/countries', 'POST', null);
            }
            else {
                setSmartSearchSources();
            }
            
            //code to set portAreaCode for smartSearh
        if (localStorage.getItem('portAreaCodes') === null) {

               vmsService.vmsApiService(function(response) {
            
                    if (response) {
                      if (typeof response === 'object') {
                            setResponseLocalStorage( response);
                       } else {
                           nsCore.showAlert('Sorry Something went wrong!! Please Sign out and Login again');
                       }
                  } else {
                       nsCore.showAlert('error, please try again later');
                  }
               }, '/Vms/masterdata/portarea', 'POST', null);
           }
            else {
                setSmartSearchSources();
            }
            
            if (localStorage.getItem('currencyCodes') === null) {

                vmsService.vmsApiService(function(response) {
                    if (response) {
                        if (typeof response === 'object') {
                            setResponseLocalStorage(response);
                        } else {
                            nsCore.showAlert('Sorry Something went wrong!! Please Sign out and Login again');
                        }
                    } else {
                        nsCore.showAlert('error, please try again later');
                    }
                }, '/Vms/masterdata/currencies', 'POST', null);
            }
            else {
                setSmartSearchSources();
            }
            if (localStorage.getItem('portCodes') === null) {
            	loadPortCode();
            }
            else {
                setSmartSearchSources();
            }
            if (localStorage.getItem('vesselCodes') === null) {
                loadVesselCode();
            }
            else {
                setSmartSearchSources();
            }
            
            if (localStorage.getItem('tradeCode') === null) {
            	loadTradeCode();
                
            } else {
                setSmartSearchSources();
            }                     
            
            
           $('#signOutLnk').click(function(e) {
                e.preventDefault();
                localStorage.clear();
                nsCore.navigateToClickedPath($(this).attr('href'));
            });
            $(document).idleTimeout({
                idleTimeLimit : idleTimeLimit,
                redirectUrl : '/Vms/login',
                customCallback : false,
                activityEvents : 'click keypress scroll wheel mousewheel mousemove',
                enableDialog : true,
                dialogDisplayLimit : displayLimit,
                dialogTitle : 'Session Expiration Warning',
                dialogText : dialogText,
                sessionKeepAliveTimer : 1200
            });

            function checkDialogTimeout () {
                var redirectToLoginCheck =
                    window.localStorage.length === 0 || localStorage.getItem('idleTimeLimitFlag') === 'Y';

	            if ( redirectToLoginCheck && !(localStorage.getItem('idleTimeLimit')) ) {
	            	clearInterval(dialogTimer);
	                window.location.href = '/Vms/login';
	            }
              }
              dialogTimer = setInterval(checkDialogTimeout, 500);
            autoCompleteDelCodeDelNameInit();
        });
    function commonPopup(test) {
    	var titleText = '';
        titleText = $(test).parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
    	titleText = '<i class="fa fa-warning"></i>' + titleText;
    	$(test).parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
    	$(test).closest('.ui-dialog.ui-widget').find('.ui-dialog-buttonset button:first-child').addClass('linkButton');
    	$(test).closest('.ui-dialog.ui-widget').find('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
        $(test).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
        $(test).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
    	.removeClass('ui-corner-all ui-widget');
    }
    function areaVolCalc(bkdLen,bkdWidth,bkdHeight,parmValue,scaletype){
	    var parmtrValue = parmValue , areaCalc = 0, volCalc = 0, bookdWidth = bkdWidth, bookdLen = bkdLen, bookdHeight = bkdHeight,
	    scaleTypeVal = scaletype;
	    if(parmtrValue === 'area'){
	    	areaCalc = (bookdWidth*bookdLen === 0) ? "" : bookdWidth*bookdLen;
	    	 if (scaleTypeVal === '10') {
	    		  areaCalc = areaCalc / 144;	 
               	  return areaCalc;	                      
             } else {
               	  return areaCalc                  
             }
	    }
	    else{
	    	volCalc = (bookdWidth*bookdLen*bookdHeight === 0)? "" : bookdWidth*bookdLen*bookdHeight;
	    	 if (scaleTypeVal === '10') {
	    		 volCalc = volCalc / 1728;
              	  return volCalc;	                      
            } else {
              	  return volCalc                  
            }
	    }
    }
    
    function setResponseLocalStorage(response) {
        var value = response.fetchType;
        switch(value){
        	case 'Country':
				localStorage.setItem('countryCodes', JSON.stringify(response.codes));
				localStorage.setItem('countryNames', JSON.stringify(response.names));
        			break;
        	case 'Currency':
        		localStorage.setItem('currencyCodes', JSON.stringify(response.codes));
				localStorage.setItem('currencyNames', JSON.stringify(response.names));
        			break;
        	case 'Port':
        		localStorage.setItem('portCodes', JSON.stringify(response.codes));
				localStorage.setItem('portNames', JSON.stringify(response.names));
        			break;
        	case 'Vessel':
        		localStorage.setItem('vesselCodes', JSON.stringify(response.codes));
				localStorage.setItem('vesselNames', JSON.stringify(response.names));
        			break;
        	case 'Trade':
        		localStorage.setItem('tradeCode', JSON.stringify(response.codes));
				localStorage.setItem('tradeName', JSON.stringify(response.names));
        			break;
        	case 'Portarea':
        		localStorage.setItem('portAreaCodes', JSON.stringify(response.codes));
				localStorage.setItem('portAreaNames', JSON.stringify(response.names));
        			break;
        	default: break;
        }
        setSmartSearchSources();
    }
    function delInvalidAutoFeilds(id1, id2, inpVal, resSet, e) {
        var i = 0, flag = false;
        if (!resSet) {
            resSet = [];
        }
        for (i = 0; i < resSet.length; i++) {
            if (inpVal === resSet[i]) {
                flag = true;
                break;
            }
        }
        if (!flag && typeof id1!=="object" && id1.charAt(0) !== '.') {
            if (id1 === '#') {
                $(id2).val('');
            } else if (id2 === '#') {
                $(id1).val('');
            } else {
                $(id1 + ',' + id2).val('');
            }
        } else {
            if (!flag && $(e.target.parentElement).find(id1).val()) {
                $(e.target.parentElement).find(id1).val('');
                $(e.target.parentElement).find(id2).val('');
            }
            else if (!flag){
            	if(typeof id1!=="object"){
             	   $(id1 + ',' + id2).val('');
                 }else{
                   id1.value="";
                   id2.val("");
                 }
            }
        }
        if($('#leftSearchMenu #vesselCode').val()==='' && $('#leftSearchMenu #vesselName').val()===''){
            $('#voyage.voyageTextVal.searchInput').attr('disabled', true)
        }
    }
    function attachEventBinder() {
        var inps = $('input'), field, i;
        for (i = 0; (inps.length === i + 1); i++) {
            field = inps[i];
            eventBinder(field, 'keydown', keyEvent);
        }
    }
    function eventBinder(obj, evt, func) {
        if (obj.attachEvent) {
            obj.attachEvent('on' + evt, func);
        } else {
            obj.addEventListener(evt, func, false);
        }
    }
    function keyEvent(e) {
        var evt = (e || window.event), escKeyCode = 27;
        if (evt.keyCode === escKeyCode) {
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        }
    }
    function loadUI(par) {
        var tableHt;
        if ($(window).width() > 1599) {
            switch (par) {
            case 'booking':
                $('.toolTipWrapper').css('display', 'none');
                $('.cargoManagementRightData .mainBookingListWrap .subBookListColWrap').height(
                    ($('section').height() - $('.cargoManagementRightData .mainBookingContentWrapper').offset().top
                        + ($('.logoContentWrap').css('display') === 'none' ? 7 : $('header').outerHeight())
                        + $('nav').outerHeight() - $('.leftSearchMenuHeader').height() + (3.7 * parseInt($(
                        '.bookingGridContentWrapper').css('margin-top'))))).css('overflow-y', 'hidden');
                $('.cargoManagementRightData .mainBookingContentWrapper').height(
                    $('section').height() - $('.exportButtons').height()
                        - (4 * parseInt($('.exportButtons').css('margin-top')))
                        - (3.5 * parseInt($('.exportButtons').css('margin-bottom'))) - $('.searchedForWrap').height());
                $('.cargoManagementRightData .mainBookingListWrap .subBookListColWrap .subBookingNbrsCntnt').height(
                    $('.cargoManagementRightData .mainBookingListWrap .subBookListColWrap').height() - 120);
                $('.mainSubBookingListWrap .subBookListColWrap').height(
                    $('footer').offset().top - $('.mainBookingContentWrapper').offset().top
                        - (($('.mainBookingDetailsWrap').outerHeight() < 50) ? 15 : 185) - 64).css('overflow-y',
                    'hidden');
                $('.mainSubBookingListWrap').height(
                    $('footer').offset().top - $('.mainBookingContentWrapper').offset().top
                        - (($('.mainBookingDetailsWrap').outerHeight() < 50) ? 15 : 185) - 75).css('overflow-y',
                    'hidden');
                $('.mainSubBookingListWrap .subBookContentListCol').height(
                    $('footer').offset().top - $('.mainBookingContentWrapper').offset().top
                        - (($('.mainBookingDetailsWrap').outerHeight() < 50) ? 15 : 185) - 175).css('overflow-y',
                    'auto');
                $('.mainSubBookingFormWrap').height(
                    $('footer').offset().top - $('.mainBookingContentWrapper').offset().top
                        - (($('.mainBookingDetailsWrap').outerHeight() < 50) ? 15 : 185) - 96)
                    .css('overflow-y', 'auto');
                break;
            case 'schedule':
                if (window.location.href.indexOf('allocation') === -1) {
                    tableHt = $('#maintainVesselPositionGrid_wrapper .dataTables_scrollBody').height();
                    tableHt = ($('header .logoContentWrap').is(':visible')) ? (tableHt - 65) : (tableHt + 65);
                    $('#maintainVesselPositionGrid_wrapper .dataTables_scrollBody').height(tableHt);
                    if (isNaN(tableHt)) {
                        tableHt = '';
                    }
                    $('#maintainVesselPositionGrid').dataTable().api().settings()[0].oScroll.sY = tableHt;
                }
                break;
            case 'reports':
                $('section').height(
                    $(window).height() - ($('header').outerHeight()) - $('nav').outerHeight()
                        - $('footer').outerHeight() - 5).css('overflow-y', 'auto');
                $('#tradeSelectorMenu').height(
                    $('section').height() - $('.orangeHeader').outerHeight(true) - $('h1.rolesTitle').outerHeight(true)
                        - $('p.mandatoryRedText.floatRight').outerHeight(true) - 25);
                $('.templateSelectorMenuWrapper').height(
                    $('section').height() - $('h3.greyHeader').outerHeight(true) - $('h1.rolesTitle').outerHeight(true)
                        - $('p.mandatoryRedText.floatRight').outerHeight(true) - 80);
                break;
            case 'makebl':
                $('section,.makeBlWrapper')
                    .height(
                        $(window).height() - $('header').outerHeight() - $('nav').outerHeight()
                            - $('footer').outerHeight()).css('overflow-y', 'hidden');
                $('.makeBlWrapper').css('min-height', $('section').height()).css('overflow-y', 'hidden');
                $('.cargoManagementRightData').height($('section').height() - 100).css('overflow-y', 'hidden');
                $('.mainBookingListWrap,.mainConsignmentListWrap,.mainVinListWrap').height($('section').height() - 105)
                    .css('overflow-y', 'hidden');
                $(
                    '.mainVinListWrap > .subBookListColWrap,.mainConsignmentListWrap .bgColor,'
                        + '.makeBLListWrap > .subBookListColWrap').height($('section').height() - 110).css(
                    'overflow-y', 'hidden');
                $('.mainBookingContentWrapper').height($('section').height() - 130).css('overflow-y', 'auto');
                $('.makeBLListWrap .subBookingNbrsCntnt, .makeBlmoveFromWrapper .subBookContentListCol').height(
                    $('.makeBLListWrap').height() - 63).css('overflow-y', 'auto');
                $(
                    '.makebillLadingWrapper .makeBlConsignmentListWrap, .makebillLadingWrapper .mainBillNumListWrap,'
                        + '.makebillLadingWrapper .makeBlVinListWrap').height(
                    $('.makebillLadingWrapper').height() - 135).css('overflow-y', 'hidden');
                $('.mainBookingContentWrapper .subBookListColWrap').height(
                    $('.makebillLadingWrapper .makeBlConsignmentListWrap').height() - 4).css('overflow-y', 'hidden');
                $('.makebillLadingWrapper .subBookContentListCol').height(
                    $('.mainBookingContentWrapper .subBookListColWrap').height() - 35).css('overflow-y', 'auto');
                $('.leftSearchMenuContent').height($('.makeBLListWrap').height() - 20);
                break;
            default:
                break;
            }
        }
    }
    function getPage(url) {
        if (url.indexOf('booking') >= 0) {
            return 'booking';
        } else if (url.indexOf('schedule') >= 0 || url.indexOf('allocation') >= 0) {
            return 'schedule';
        } else if (url.indexOf('makeBLSearch') >= 0) {
            return 'makebl';
        } else if (url.indexOf('documentation') >= 0) {
            return 'documentation';
        } else if (url.indexOf('reports') >= 0) {
            return 'reports';
        }
    }
    function getQueryVariable(queryVariable) {
        var query = window.location.search.substring(1), i = 0, pair, vars = query.split('&');
        for (i = 0; i < vars.length; i++) {
            pair = vars[i].split('=');
            if (pair[0] === queryVariable) {
                return pair[1];
            }
        }
        return (false);
    }
    function clearNextAutocomplete(node, target) {
        if ($(node).val() === '') {
            $(node).siblings(target).val('');
        }
    }
    function pushData(targetCode, targetDesc, codeArr, descArr) {
        smartData[targetCode].push({
            index : codeArr,
            target : descArr
        });
        smartData[targetDesc].push({
            index : descArr,
            target : codeArr
        });
    }
    function setSmartSearchSources() {
        var vesselCodes = JSON.parse(localStorage.getItem('vesselCodes')), vesselNames = JSON.parse(localStorage
            .getItem('vesselNames')), portCodes = JSON.parse(localStorage.getItem('portCodes')), portNames = JSON
            .parse(localStorage.getItem('portNames')), tradeCodes = JSON.parse(localStorage.getItem('tradeCode')), tradeNames = JSON
            .parse(localStorage.getItem('tradeName')), countryCode = JSON.parse(localStorage.getItem('countryCodes')), countryDesc = JSON
            .parse(localStorage.getItem('countryNames')), docOfficeCode = JSON.parse(localStorage
            .getItem('docOffCodes')), docOfficeDesc = JSON.parse(localStorage.getItem('docOffNames')), portAreaCodes = JSON
            .parse(localStorage.getItem('portAreaCodes')), currencyCode = JSON.parse(localStorage
            .getItem('currencyCodes')), currencyName = JSON.parse(localStorage.getItem('currencyNames')), portAreaDesc = JSON
            .parse(localStorage.getItem('portAreaNames'));
        $.each(vesselCodes, function(i, val) {
            pushData('vesselCode', 'vesselDesc', val, vesselNames[i]);
        });
        $.each(tradeCodes, function(i, val) {
            pushData('tradeCode', 'tradeDesc', val, tradeNames[i]);
        });
        $.each(portCodes, function(i, val) {
            pushData('portCode', 'portDesc', val, portNames[i]);
            // if its a US port, also push to US ports list
            if (val.substring(0, 2).toUpperCase() === 'US') {
                pushData('usPortCode', 'usPortDesc', val, portNames[i]);
            }
        });
        $.each(countryCode, function(i, val) {
            pushData('countryCode', 'countryDesc', val, countryDesc[i]);
        });
        $.each(docOfficeCode, function(i, val) {
            pushData('docOfficeCode', 'docOfficeDesc', val, docOfficeDesc[i]);
        });
        $.each(portAreaCodes, function(i, val) {
            pushData('portAreaCodes', 'portAreaDesc', val, portAreaDesc[i]);
        });
        $.each(currencyCode, function(i, val) {
            pushData('currencyCode', 'currencyName', val, currencyName[i]);
        });
    }
    function modifySmartObj(arr, obj) {
        var temp = [], de = {};
        $.each(arr, function(i, v) {
            de = {};
            $.each(Object.keys(obj), function(inde, va) {
                $.each(obj[va], function(ind, val) {
                    de[val] = v[va];
                });
            });
            temp.push(de);
        });
        return temp;
    }
    function returnSmartArr(arr, prop) {
        var temp = [];
        $.each(arr, function(i, v) {
            temp.push(v[prop]);
        });
        return temp;
    }
    $.fn.has_scrollbar = function() {
        var divnode = this.get(0);
        if (divnode.scrollHeight > divnode.clientHeight) {
            return true;
        }
    };
    function makeBLRedirect(nsBooking, menuType, bookingId) {
        if (nsBooking.hasMakebLAccess) {
            switch (menuType) {
            case 'bookingItemMenu':
                sessionStorage.setItem('searchParams', JSON.stringify({
                    vesselCode : $('#vesselCode').val(),
                    vesselName : $('#vesselName').val(),
                    voyage : $('#voyage').val(),
                    custCode : $('#custCode').val(),
                    custName : $('#custName').val(),
                    loadPort : $('#loadPort').val(),
                    loadPortName : $('#loadDesc').val(),
                    discPort : $('#discPort').val(),
                    dischargePortName : $('#discDesc').val(),
                    originPort : $('#originPort').val(),
                    originName : $('#originDesc').val(),
                    destPort : $('#destPort').val(),
                    destinationName : $('#destDesc').val(),
                    bookingNumber : $('#bookingNumber').val(),
                    bookingNoSearch : $('#bookingNoSearch').val(),
                    vinSearch : $('#vinSearch').val(),
                    blSearch : $('#blSearch').val(),
                    vinNumber : $('#vinNumber').val(),
                    blNumber : $('#blNumber').val(),
                    cargoStatus : $('#cargoStatus').val(),
                    cargoType : $('#cargoType').val(),
                    tradeCode : $('#tradeCode').val(),
                    BLStatus : $('#blStatus').val(),
                    bookings : $('#bookings').val(),
                    forwarderCode : $('#forwarderCode').val(),
                    forwarderDesc : $('#forwarderName').val(),
                    bookingDate : $('#bookinggFrom').val()
                }));
                nsCore.navigateToClickedPath('/Vms/documentation/makeBLSearch?from=booking&bookId=' + bookingId);
                break;
                
            case 'subBookingItemMenu':
                sessionStorage.setItem('searchParams', JSON.stringify({
                    vesselCode : $('#vesselCode').val(),
                    vesselName : $('#vesselName').val(),
                    voyage : $('#voyage').val(),
                    custCode : $('#custCode').val(),
                    custName : $('#custName').val(),
                    loadPort : $('#loadPort').val(),
                    loadPortName : $('#loadDesc').val(),
                    discPort : $('#discPort').val(),
                    dischargePortName : $('#discDesc').val(),
                    originPort : $('#originPort').val(),
                    originName : $('#originDesc').val(),
                    destPort : $('#destPort').val(),
                    destinationName : $('#destDesc').val(),
                    bookingNumber : $('#bookingNumber').val(),
                    bookingNoSearch : $('#bookingNoSearch').val(),
                    vinSearch : $('#vinSearch').val(),
                    blSearch : $('#blSearch').val(),
                    vinNumber : $('#vinNumber').val(),
                    blNumber : $('#blNumber').val(),
                    cargoStatus : $('#cargoStatus').val(),
                    cargoType : $('#cargoType').val(),
                    tradeCode : $('#tradeCode').val(),
                    BLStatus : $('#blStatus').val(),
                    bookings : $('#bookings').val(),
                    forwarderCode : $('#forwarderCode').val(),
                    forwarderDesc : $('#forwarderName').val(),
                    bookingDate : $('#bookinggFrom').val()
                }));
                nsCore.navigateToClickedPath('/Vms/documentation/makeBLSearch?from=subbooking&subbookId=' + bookingId);
                break;
                
                
            case 'bookTopMenu':
                if (nsBooking.globalBookingFlag.mainBookingFlag) {
                    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                        nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                    return false;
                }
                nsCore.navigateToClickedPath('/Vms/documentation/makeBLSearch?from=booking&bookId=' + bookingId);
                break;
            case 'docTopMenu':
                if (nsBooking.globalBookingFlag.mainBookingFlag) {
                    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                        nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                    return false;
                }
                nsCore.navigateToClickedPath('/Vms/documentation/makeBLSearch?from=documentation&bookId=' + bookingId);
                break;
            default:
                return false;
                break;
            }
        } else {
            return false;
        }
    }
    // to check if Attribute exists for the selector
    $.fn.hasAttr = function(name) {
        return !!(this.attr(name));
    };
    // to check emptiness of params
    function checkEmptyParams(arr1, arr2) {
        var temp = true, temp1 = true, i;
        if (Array.isArray(arr1)) {
            for (i in arr1) {
                if (arr1[i] !== '') {
                    return false;
                }
                temp = temp & (arr1[i] === '');
            }
        }
        if (arr2) {
            if (arr2.length !== 0) {
                temp1 = false;
            }
            if (Array.isArray(arr2)) {
                for (i in arr2) {
                    temp = temp || (arr2[i] === '');
                }
            }
        }
        return temp & temp1;
    }
    function compare(param, obj) {
        var i;
        if (typeof (obj) === 'object') {
            for (i in obj) {
                if (param === i) {
                    return obj[i];
                }
            }
        }
    }
    function compareMsg(param, obj) {
        var i;
        if (typeof (obj) === 'object') {
            for (i in obj) {
                if (param === i) {
                    return obj[i];
                }
            }
            return '';
        }
    }
    function compareWithDef(param, obj, def) {
        var i;
        if (typeof (obj) === 'object') {
            for (i in obj) {
                if (param === i) {
                    return obj[i];
                }
            }
        }
        return def;
    }
    function ifElseIfCond(cond1, ret1, cond2, ret2, def) {
        if (cond1) {
            return ret1;
        } else {
            if (cond2) {
                return ret2;
            }
        }
        return def;
    }
    function alignAlert(list, message) {
        if (list === '') {
            list = message;
        } else {
            list = list + '\n' + message;
        }
        return list;
    }
    function toggleClass(ele, clas, oper) {
        if (oper === 'add') {
            $(ele).addClass(clas);
        } else {
            if (oper === 'add') {
                $(ele).removeClass(clas);
            }
        }
    }
    function autoCompleteDelCodeDelNameInit() {
        autoCompletePairs = fetchAutoCompletes(getModule());
        $.each(autoCompletePairs, function(i, v) {
            if ($(v.code).length < 1) {
                return;
            }
            $(v.code).bind('keydown cut', function() {
                var inst = this;
                setTimeout(function() {
                    if ($(inst).val().length === 0) {
                        $(inst).closest('.doubleInput').find(v.desc).val('');
                        $(inst).closest('.dblInput').find(v.desc).val('');
                    }
                }, 100);
            });
            $(v.desc).bind('keydown cut', function() {
                var inst = this;
                setTimeout(function() {
                    if ($(inst).val().length === 0) {
                        $(inst).closest('.doubleInput').find(v.code).val('');
                        $(inst).closest('.dblInput').find(v.code).val('');
                    }
                }, 100);
            });
        });
    }
    function getModule() {
        var url = window.location.href.toLowerCase();
        if (url.indexOf('booking') >= 0) {
            return 'booking';
        } else if (url.indexOf('documentation') >= 0) {
            return 'documentation';
        } else if (url.indexOf('cargo') >= 0) {
            return 'cargo';
        } else if (url.indexOf('schedule') >= 0) {
            return 'schedule';
        } else if (url.indexOf('reports') >= 0) {
            return 'reports';
        } else if (url.indexOf('port') >= 0) {
            return 'port';
        } else if (url.indexOf('vessel') >= 0) {
            return 'vessel';
        } else if (url.indexOf('country') >= 0) {
            return 'country';
        } else if (url.indexOf('tradecode') >= 0) {
            return 'tradeCode';
        } else if (url.indexOf('modeltype') >= 0) {
            return 'modelType';
        } else if (url.indexOf('supplier') >= 0) {
            return 'supplierCompany';
        } else if (url.indexOf('customer') >= 0) {
            return 'customer';
        } else if (url.indexOf('contract') >= 0) {
            return 'contract';
        } else if (url.indexOf('officedefault') >= 0) {
            return 'officeDefault';
        } else if (url.indexOf('user') >= 0) {
            return 'user';
        } else if (url.indexOf('role') >= 0) {
            return 'role';
        } else if (url.indexOf('currency') >= 0) {
            return 'currency';
        } else if (url.indexOf('rate') >= 0) {
            return 'rate';
        } else if (url.indexOf('charges') >= 0) {
            return 'charges';
        } else if (url.indexOf('chargetype') >= 0) {
            return 'chargeType';
        } else if (url.indexOf('voyagetempl') >= 0) {
            return 'voyageTempl';
        } else if (url.indexOf('alloctempl') >= 0) {
            return 'allocTempl';
        } else {
            return '';
        }
    }
    function fetchAutoCompletes(mod) {
        switch (mod) {
        case 'booking':
            return [
                {
                    'code' : '.portSearch',
                    'desc' : '.descField'
                }, {
                    'code' : '#mainBookDetailCustomerOrigin',
                    'desc' : '#mainBookDetailCustomerOriginDesc'
                }, {
                    'code' : '#mainBookDetailCustomerDestination',
                    'desc' : '#mainBookDetailCustomerDestinationDesc'
                }, {
                    'code' : '.billCountryCode',
                    'desc' : '.billCountryCodeDesc'
                }, {
                    'code' : '#billDocumentationOffice',
                    'desc' : '#billDocumentationOfficeDesc'
                }, {
                    'code' : '#bookingDocCode',
                    'desc' : '#bookingDocDesc'
                }, {
                    'code' : '#vesselCode',
                    'desc' : '#vesselName'
                }, {
                    'code' : '.massVesCode',
                    'desc' : '.massVesName'
                }, {
                    'code' : '#docCode',
                    'desc' : '#docName'
                }, {
                    'code' : '#origin',
                    'desc' : '#originName'
                }, {
                    'code' : '#destination',
                    'desc' : '#destinationName'
                }, {
                    'code' : '#custCode',
                    'desc' : '#custName'
                }, {
                    'code' : '#forwarderCode',
                    'desc' : '#forwarderName'
                }, {
                    'code' : '#mainBookDetailCustomerCode',
                    'desc' : '#mainBookDetailCustomerDesc'
                }
            ];
            break;
        case 'documentation':
            return [
                {
                    'code' : '#vesselCode',
                    'desc' : '#vesselName'
                }, {
                    'code' : '.code',
                    'desc' : '.name'
                }, {
                    'code' : '#custCode',
                    'desc' : '#custName'
                }, {
                    'code' : '#mainBookDetailCustomerCode',
                    'desc' : '#mainBookDetailCustomerDesc'
                }, {
                    'code' : '.blcustSearch',
                    'desc' : '.blcustNameSearch'
                }, {
                    'code' : '.portSearch',
                    'desc' : '.descField'
                }, {
                    'code' : '#mainBookDetailCustomerOrigin',
                    'desc' : '#mainBookDetailCustomerOriginDesc'
                }, {
                    'code' : '.BLCountryCode',
                    'desc' : '.BLCountryCodeDesc'
                }, {
                    'code' : '#BLDocumentationOffice',
                    'desc' : '#BLDocumentationOfficeDesc'
                }, {
                    'code' : '#bookingDocCode',
                    'desc' : '#bookingDocDesc'
                }, {
                    'code' : '.portIssueBL',
                    'desc' : '.descIssueBL'
                }, {
                    'code' : '#originPort',
                    'desc' : '#originDesc'
                }, {
                    'code' : '#destPort',
                    'desc' : '#destDesc'
                }, {
                    'code' : '#loadPort',
                    'desc' : '#loadDesc'
                }, {
                    'code' : '#discPort',
                    'desc' : '#discDesc'
                }, {
                    'code' : '#forwarderCode',
                    'desc' : '#forwarderName'
                }, {
                    'code' : '.vesPortSearch',
                    'desc' : '.vesDescField'
                }, {
                    'code' : '.vesCustCode',
                    'desc' : '.vesCustName'
                }, {
                    'code' : '.vesselCdSearch',
                    'desc' : '.vesselNmSearch'
                }, {
                    'code' : '.massVesCode',
                    'desc' : '.massVesName'
                }
            ];
            break;
        case 'cargo':
            return [
                {
                    'code' : '#cusCode',
                    'desc' : '#cusName'
                }, {
                    'code' : '.code',
                    'desc' : '.portName'
                }
            ];
            break;
        case 'schedule':
            return [
                {
                    'code' : '.tradeCode',
                    'desc' : '.tradeDesc'
                }, {
                    'code' : '.vesselCode',
                    'desc' : '.vesselName'
                }, {
                    'code' : '#editTradeCode',
                    'desc' : '#editTradeDesc'
                }, {
                    'code' : '.bookingOffCode',
                    'desc' : '.bookingOffName'
                }, {
                    'code' : '#lPort',
                    'desc' : '#lPortName'
                }, {
                    'code' : '#dPort',
                    'desc' : '#dPortName'
                }, {
                    'code' : '#tradeCode',
                    'desc' : '#tradeDesc'
                }, {
                    'code' : '#vesselCode',
                    'desc' : '#vesselName'
                }
            ];
            break;
        case 'reports':
            return [
                {
                    'code' : '.usDischargeCodeField',
                    'desc' : '.usDischargeDescField'
                }, {
                    'code' : '.portCodeField',
                    'desc' : '.portDescField'
                }, {
                    'code' : '.vesselCodeCodeField',
                    'desc' : '.vesselCodeDescField'
                }, {
                    'code' : '.tradeCodeField',
                    'desc' : '.tradeDescField'
                }, {
                    'code' : '.customerCodeCodeField',
                    'desc' : '.customerCodeDescField'
                }, {
                    'code' : '.customerBolCodeCodeField',
                    'desc' : '.customerBolCodeDescField'
                }, {
                    'code' : '.forwarderCodeCodeField',
                    'desc' : '.forwarderCodeDescField'
                }, {
                    'code' : '.podTerminalCodeField',
                    'desc' : '.podTerminalDescField'
                }, {
                    'code' : '.bookingOfficeCodeField',
                    'desc' : '.bookingOfficeDescField'
                }
            ];
            break;
        case 'port':
            return [
                {
                    'code' : '#postalCountryCode',
                    'desc' : '#postalCountryName'
                }, {
                    'code' : '#obCode',
                    'desc' : '#obName'
                }, {
                    'code' : '#ibCode',
                    'desc' : '#ibName'
                }, {
                    'code' : '.operatorCode',
                    'desc' : '.operatorName'
                }, {
                    'code' : '#authorityCode',
                    'desc' : '#authorityName'
                }
            ];
            break;
        case 'vessel':
            return [
                {
                    'code' : '#shipInfoPortRegCode',
                    'desc' : '#shipInfoPortRegDesc'
                }, {
                    'code' : '#shipInfoFlagCode',
                    'desc' : '#shipInfoFlagDesc'
                }
            ];
            break;
        case 'country':
            return [];
            break;
        case 'tradeCode':
            return [];
            break;
        case 'modelType':
            return [];
            break;
        case 'supplierCompany':
            return [
                {
                    'code' : '#Port',
                    'desc' : '#portName'
                }, {
                    'code' : '#allocCode',
                    'desc' : '#allocationOfficeInput'
                }, {
                    'code' : '#docCode',
                    'desc' : '#documentationOffice'
                }, {
                    'code' : '#postalCountryCode',
                    'desc' : '#postalCountryName'
                }, {
                    'code' : '#visitorCountryCode',
                    'desc' : '#visitorCountryName'
                }, {
                    'code' : '#invoiceCountryCode',
                    'desc' : '#invoiceCountryName'
                }, {
                    'code' : '#ParentCode',
                    'desc' : '#ParentNme'
                }
            ];
            break;
        case 'customer':
            return [
                {
                    'code' : '#postalCountryCode',
                    'desc' : '#postalCountryName'
                }, {
                    'code' : '#visitorCountryCode',
                    'desc' : '#visitorCountryName'
                }, {
                    'code' : '#invoiceCountryCode',
                    'desc' : '#invoiceCountryName'
                }
            ];
            break;
        case 'contract':
            return [];
            break;
        case 'officeDefault':
            return [
                {
                    'code' : '#cus',
                    'desc' : '#cusName'
                }, {
                    'code' : '#port',
                    'desc' : '#portName'
                }, {
                    'code' : '#origin',
                    'desc' : '#originName'
                }
            ];
            break;
        case 'user':
            return [
                {
                    'code' : '#companyCode',
                    'desc' : '#companyName'
                }
            ];
            break;
        case 'role':
            return [];
            break;
        case 'currency':
            return [];
            break;
        case 'rate':
            return [
                {
                    'code' : '#origin',
                    'desc' : '#originName'
                }, {
                    'code' : '#dest',
                    'desc' : '#destName'
                }, {
                    'code' : '#load',
                    'desc' : '#loadName'
                }, {
                    'code' : '#discharge',
                    'desc' : '#dischargeName'
                }, {
                    'code' : '#contractCode',
                    'desc' : '#contractDesc'
                },
                {
                    'code' : '#originPort',
                    'desc' : '#originDesc'
                },
                {
                    'code' : '#loadPort',
                    'desc' : '#loadDesc'
                },
                {
                    'code' : '#destPort',
                    'desc' : '#destDesc'
                },
                {
                    'code' : '#discPort',
                    'desc' : '#discDesc'
                }
            ];
            break;
        case 'charges':
            return [
                {
                    'code' : '.pSearch',
                    'desc' : '.descField'
                }, {
                    'code' : '#originPort',
                    'desc' : '#originDesc'
                }, {
                    'code' : '#destPort',
                    'desc' : '#destDesc'
                }, {
                    'code' : '#loadPort',
                    'desc' : '#loadDesc'
                }, {
                    'code' : '#discPort',
                    'desc' : '#discDesc'
                }, {
                    'code' : '#contractCode',
                    'desc' : '#contractDesc'
                }
            ];
            break;
        case 'chargeType':
            return [];
            break;
        case 'voyageTempl':
            return [
                {
                    'code' : '.portCode',
                    'desc' : '.portName'
                }
            ];
            break;
        case 'allocTempl':
            return [
                {
                    'code' : '.customerCode',
                    'desc' : '.customerName'
                }, {
                    'code' : '.bookingCode',
                    'desc' : '.bookingName'
                }
            ];
            break;
        default:
            return [];
            break;
        }
    }
    searchLoader = {
        'set' : function(mod, form) {
            var inputs = [];
            $(form + ' input:not(input[type="submit"]),' + form + ' select').each(function(i, v) {
                inputs.push({
                    'ele' : $(v).prop('tagName'),
                    'type' : $(v).prop('type'),
                    'selector' : $(v).prop('id'),
                    'name' : $(v).prop('name'),
                    'value' : $(v).val()
                });
            });
            localStorage.setItem('searchCriteria', JSON.stringify({
                'module' : mod,
                'form' : form,
                'elements' : inputs
            }));
        },
        'get' : function(mod, form) {
            var formData = JSON.parse(localStorage.getItem('searchCriteria'));
            if (!formData) {
                return false;
            }
            if (formData.module !== mod || formData.form !== form) {
                return false;
            }
            $.each(formData.elements, function(i, ele) {
                switch (ele.ele) {
                case 'SELECT':
                    $(form + ' select#' + ele.selector).val(ele.value);
                    break;
                case 'INPUT':
                    if (ele.type === 'radio' || ele.type === 'checkbox') {
                        $(form + ' input[name="' + ele.name + '"][value="' + ele.value + '"]').prop('checked', true);
                    } else {
                        $(form + ' input#' + ele.selector).val(ele.value);
                    }
                    break;
                default:
                    break;
                }
            });
            localStorage.setItem('searchCriteria', null);
        }
    };
    if (localStorageCountry) {
        setSmartSearchSources();
    }
    commonEventsObj = {
        'loadUI' : loadUI,
        'getPage' : getPage,
        'getQueryVariable' : getQueryVariable,
        'clearNextAutocomplete' : clearNextAutocomplete,
        'setSmartSearchSources' : setSmartSearchSources,
        'modifySmartObj' : modifySmartObj,
        'returnSmartArr' : returnSmartArr,
        'makeBLRedirect' : makeBLRedirect,
        'checkEmptyParams' : checkEmptyParams,
        'compare' : compare,
        'compareMsg' : compareMsg,
        'compareWithDef' : compareWithDef,
        'ifElseIfCond' : ifElseIfCond,
        'alignAlert' : alignAlert,
        'toggleClass' : toggleClass,
        'autoCompleteDelCodeDelNameInit' : autoCompleteDelCodeDelNameInit,
        'getModule' : getModule,
        'fetchAutoCompletes' : fetchAutoCompletes,
        'searchLoader' : searchLoader,
        'autoCompletePairs' : autoCompletePairs,
        'smartData' : smartData,
        'delInvalidAutoFeilds' : delInvalidAutoFeilds,
        'commonPopup': commonPopup,
        'loadPortCode' : loadPortCode,
        'loadVesselCode' : loadVesselCode,
        'loadTradeCode':loadTradeCode,
        'areaVolCalc' : areaVolCalc
    };
    $.extend(true, nsCore, commonEventsObj);
})(this.core, this.vmsService, jQuery);
