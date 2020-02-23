/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var freshBookObj = {},
        timeFormat = localStorage.getItem('timeFormat'),
        dateFormat = localStorage.getItem('dateFormat');

    function isFreshBookingMatchingSearch() {
    	
    	var routeArray1 = [],routeArray2 = [], lpValues,dpValues;
        $('#routeDetailGrid tbody tr').each(function(i, v) {
           
        	lpValues = $(this).find('td:nth-child(4)').html().trim();
        	dpValues = $(this).find('td:nth-child(6)').html().trim();
                routeArray1.push(lpValues);
                routeArray2.push(dpValues);
            
        })
        var customer1 = $('#custCode').val().trim(),
            originPort1 = $('#originPort').val().trim(),
            destination1 = $('#destPort').val().trim(),
            loadPort1 = $('#loadPort').val().trim(),
            dischargePort1 = $('#discPort').val().trim();

        if ((!originPort1) && (!loadPort1) && (!destination1) && (!dischargePort1) && (!customer1)) {
            return true;
        }
        return isFreshBookMatch(customer1, originPort1, destination1, routeArray1, routeArray2,loadPort1,dischargePort1);
    }

    function isFreshBookMatch(customer1, originPort1, destination1, routeArray1, routeArray2,loadPort1,dischargePort1) {
        var origin = $('#mainBookDetailCustomerOrigin').val(),
            destination = $('#mainBookDetailCustomerDestination').val(),
            customerCode = $('#mainBookDetailCustomerCode').val();
       
        
          if ((originPort1 === origin) || (routeArray1.indexOf(loadPort1)!==-1) || (destination1 === destination) ||
            (routeArray2.indexOf(dischargePort1)!==-1) || (customer1 === customerCode)) {
        	 return true;
            }
        
        return false;
    }

    function rteKeyCheck(element) {
        var values = '';
        nsBooking.clearTrashipmentFields();
        $('select[name="bookingAllocStatus"]').removeAttr('disabled');
        if (!nsBooking.mainRoutekey) {
            return;
        }
        if (nsBooking.mainRoutekey === 'No Voyage') {
            nsBooking.fmaxHeightCapacity = -1;
            nsBooking.fmaxWeightCapacity = -1;
            nsBooking.fnoVoyage = true;
            return;
        }
        nsBooking.fnoVoyage = false;
        values = nsBooking.mainRoutekey.split('-');
        nsBooking.fmainTrade = values[0];
        nsBooking.fmainSrcPort = values[1];
        nsBooking.fmaindestPort = values[2];
        nsBooking.fcarReAvl = values[3];
        nsBooking.fpuReAvl = values[4];
        nsBooking.fhhReAvl = values[5];
        nsBooking.fstReAvl = values[6];
    }

    function rteChanged(element) {
        var trElement = $(element).closest('#singleVoyageRow'),
            i = 1,
            ids = '';
        if(nsBookDoc.selectePossibleVoyage[0].vesselVoyage !== "No Voyage") {
        nsBooking.mainRoutekey = nsBookDoc.selectePossibleVoyage[0].trade+"-"
        +nsBookDoc.selectePossibleVoyage[0].loadPortCode+"-"
        +nsBookDoc.selectePossibleVoyage[0].discPortCode+"-"
        +nsBookDoc.selectePossibleVoyage[0].cars+"-"
        +nsBookDoc.selectePossibleVoyage[0].pickups+"-"
        +nsBookDoc.selectePossibleVoyage[0].highHeavy+"-"
        +nsBookDoc.selectePossibleVoyage[0].statics
        }else {
    		nsBooking.mainRoutekey ="No Voyage"
        }
        if (!nsBooking.mainRoutekey) {
            return;
        }
        rteKeyCheck(element);
        if (nsBooking.fnoVoyage) {
        	$('#thirdPartyVoyage').css('visibility', 'visible');
            return;
        }
        else{
        	$('#thirdPartyVoyage').css('visibility', 'hidden');
        }
        $.each(nsBookDoc.selectePossibleVoyage, function(j, leg) {
            var trans = leg.legType
            if (trans === 'M') {
                   var puVal = leg.pickups,
                        stVal = leg.statics
                    if (puVal.indexOf('---') !== -1) {
                        nsBooking.fpuReAvl = nsBooking.fcarReAvl;
                    }
                    if (stVal.indexOf('---') !== -1) {
                        nsBooking.fstReAvl = nsBooking.fhhReAvl;
                    }
            }
            i++;
        });
        nsBookDoc.setupPrtVal(trElement);
        ids = popsrcPrtId(trElement, ids);
        nsBookDoc.upPrtVal(trElement);
        findVesCap(ids);
    }

    function popsrcPrtId(trElement, ids) {
    	for(var i=0;i<3;i++){
    		if(nsBookDoc.selectePossibleVoyage[i]){
	    		if(!!nsBookDoc.selectePossibleVoyage[i].vesselId && nsBookDoc.selectePossibleVoyage[i].legType === 'M'){
	    			ids =nsBookDoc.selectePossibleVoyage[i].vesselId;
		        }
    		}
		}
    	
        return ids;
    }

    function findVesCap(ids) {
        if (ids) {
            vmsService.vmsApiService(function(response) {
                if (response) {
                	if(response.particulars){
                		nsBooking.fmaxHeightCapacity = response.particulars.maxCargoHeight;
                		nsBooking.fmaxWeightCapacity = response.particulars.maxRampWeight;
                	}
                } else {
                	if(response !== '') {
                		nsCore.showAlert(nsBooking.errorMsg);
                	}
                }
            }, nsBooking.fvCapacity + ids, 'GET', null);

        }
    }

    function getRouteDetails() {
        $('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked', 'true');
        getPossVoyages();
    }

    function findPrevVoyVal() {
        if ($('#prevVoyagesMain').is(':checked')) {
            return 'Y';
        } else {
            return 'N';
        }
    }

    function findPossiVoyClick() {
        if ($('.mainBookingDetailsWrap .getPossibleVoyages').attr('data-clicked') === 'false') {
            return 'N';
        } else {
            return 'Y';
        }
    }

    

    

    function getPossVoyages() {
        var showPrevious = findPrevVoyVal(),
            possibleVoyageClicked = findPossiVoyClick(),
            ajUrl,
            element = '', bookingId = '',
            possibleVoyageWrap = '';
        if (validatePossVoyages(showPrevious, possibleVoyageClicked)) {
            $('.routeDetailsWrapper').hide();
            if ((possibleVoyageClicked === 'Y' && showPrevious === 'N') || showPrevious === 'Y') {
                element = $('.mnPossibleVoyages');
                possibleVoyageWrap = $(element).closest('#createFreshBook');
                possibleVoyageWrap.find('.possibleVoyageWrap').show();
                bookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                    .attr('data-bookingid');
                if (!bookingId) {
                    bookingId = '0';
                }

                ajUrl = nsBooking.possVoyagesForBook + $('#mainBookDetailCustomerOrigin').val() + '&destinationPort='
                + $('#mainBookDetailCustomerDestination').val() + '&showPreviousVoyage=' + showPrevious
                + '&compId=' + $('#maincustomerID').val() + '&dateFormat=' + dateFormat + '&timeFormat='
                + timeFormat + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=' + bookingId;
                voyageContentHelper(ajUrl);
                $('#thirdPartyVoyage').css('visibility', 'visible');
                setNoVoyageData();
            }
        }
        clearVoyageSuggesionData(possibleVoyageClicked, showPrevious);
    }
    
    function voyageContentHelper(ajUrl){
    	vmsService.vmsApiService(function(response) {
			var possibleVoyageContent = '', k = 0,
				empty = '<div class="singleVoyageRow"><input name="selectPossibleVoyage" type="radio" '
		            + 'class = "fVoyageSel noPossibleVoyage mainNovoy" value="No voyage" checked>'
		            + '<div class="singleLegNoVoyage"><span>No Voyage</span></div></div>';
            if (response) {
                possibleVoyageContent = '<div class="possibleVoyageRow" id="possibleVoyageRow">' + empty;

                if (response.routeModelList) {
                    $.each(response.routeModelList, function(j, leg) {
                        possibleVoyageContent += '<div class="singleVoyageRow" id="singleVoyageRow">';
                        possibleVoyageContent += '<input type="radio" class="fVoyageSel voyageSelection mainselvoy" '
                            + 'data-vessel=""  name="selectPossibleVoyage" value='
                            + leg.key + ' >';
                        for (k = 0; k < leg.count; k++) {
                            possibleVoyageContent += possibleVoyageContentFn(leg, k + 1, j,
                                leg.currentVoyage === 'N');
                        }
                        possibleVoyageContent += '</div>';
                    });
                    possibleVoyageContent += '</div>';
                    $('#possibleVoyagePopup').dialog('open');
                    setVoyageContent(possibleVoyageContent);
                } else{
                    setVoyageContent(empty);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, ajUrl, 'GET', null);
    }

    function setNoVoyageData() {       
        nsBooking.fmaxHeightCapacity = -1;
        nsBooking.fmaxWeightCapacity = -1;
        nsBooking.fnoVoyage = true;
    }

    function setVoyageContent(possibleVoyageContent) {
        $('#possibleVoyageNewWrapId').html(possibleVoyageContent).addClass('mt10 width96per');
        $('#possibleVoyageNewWrapId, #createFreshBook .possibleVoyageWrap').show();
    }

    function clearVoyageSuggesionData(possibleVoyageClicked, showPrevious) {
        if ((possibleVoyageClicked === 'N' && showPrevious === 'N')) {
            nsBooking.mainRoutekey = '';
            nsBooking.fmainTrade = null;
            nsBooking.fnoVoyage = false;
            nsBooking.mainRoutekey = '';
            $('#possibleVoyageNewWrapId, #createFreshBook .possibleVoyageWrap').hide();
        }
    }

    function possibleVoyageContentFn(leg, i, j, style) {
        var instLeg = fetchLegInstance(leg, i),
            styleColor = style ? 'style="color:#0000FF"' : '',
            possibleVoyageContent = '<div class="singleLeg" ' + styleColor
            + '><input type="hidden" class="sourcePortCallID" name="sourcePortCallID' + (j + 1)
            + ' " id="sourcePortCallID' + i + '" value="' + instLeg.sourcePortCallID + '" /> '
            + '<input type="hidden" id="destinationPortCallID' + i + '"  name="destinationPortCallID' + (j + 1)
            + ' "class="destinationPortCallID" value="' + instLeg.discPortCallID + '" />'
            + '<input type="hidden" class="vesselId' + i + '" name="vesselId' + (j + 1)
            + ' " id="vesselId' + i + '" value="' + instLeg.vesselId + '" />'
            + '<input type="hidden" id="transhipmentType' + i + '" name="transhipmentType' + i
            + '" class="consignmentTransType" value=' + instLeg.legType + '>'
            + '<span class="voyageVessel" data-vessel="' + instLeg.vesselVoyage + '" id="vesselVoyId' + i + '" ' + styleColor + '>'
            + instLeg.vesselVoyage + '</span><span id="trade' + i + '" name="trade' + (j + 1) + ' " class="trade" '
            + styleColor + '>' + instLeg.trade + '</span>' + '<span name="loadPortCode' + (j + 1)
            + ' " id="loadPortCode' + i + '" class="loadPortCode" ' + styleColor + '>' + instLeg.loadPort
            + '</span><span class="bold">--&gt;</span>' + '<span name="discPortCode' + (j + 1) + ' " id="discPortCode'
            + i + '" class="discPortCode" ' + styleColor + '>' + instLeg.discPort + '</span>'
            + '<div class="legTimeStamp"><span ' + styleColor + '>ETD: ' + instLeg.etd + '</span>' + '<span '
            + styleColor + '>ETA: ' + instLeg.eta + '</span></div><span class="allocItems alloc">'
            +'<span class="allocCodeIcon CA" style="background-color: red;">' + instLeg.allocationForCar
            + '</span> <span class="allocCodeIcon PU" style="background-color: green;">' + instLeg.allocationForPU
            + '</span> <span class="allocCodeIcon HH" style="background-color: blue;">' + instLeg.allocationForHH
            + '</span><span class="allocCodeIcon ST" style="background-color: grey;">' + instLeg.allocationForST
            + '</span></span></div>';
        return possibleVoyageContent;
    }

    

    freshBookObj = {
        'isFreshBookingMatchingSearch': isFreshBookingMatchingSearch,
        'isFreshBookMatch': isFreshBookMatch,
        'rteKeyCheck': rteKeyCheck,
        'rteChanged': rteChanged,
        'popsrcPrtId': popsrcPrtId,
        'findVesCap': findVesCap,
        'getRouteDetails': getRouteDetails,
        'findPrevVoyVal': findPrevVoyVal,
        'findPossiVoyClick': findPossiVoyClick,
        'getPossVoyages': getPossVoyages,
        'setNoVoyageData': setNoVoyageData,
        'setVoyageContent': setVoyageContent,
        'clearVoyageSuggesionData': clearVoyageSuggesionData,
        'possibleVoyageContentFn': possibleVoyageContentFn
        
    };

    $.extend(true, nsBooking, freshBookObj);

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);