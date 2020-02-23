/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBookDoc, $, vmsService, nsCore, nsDoc ) {
    var freshBookObj = {}; 
    function rteChanged(element) {
        var trElement = $(element).closest('tr'),
            i = 1, values = '', j=1, subRowCheck = false, subRowArr = [], subRowId = '',
            ids = '';
        if(nsBookDoc.selectePossibleVoyage[0].vesselVoyage !== "No Voyage") {
        nsBookDoc.mainRoutekey = nsBookDoc.selectePossibleVoyage[0].trade+"-"
        +nsBookDoc.selectePossibleVoyage[0].loadPortCode+"-"
        +nsBookDoc.selectePossibleVoyage[0].discPortCode+"-"
        +nsBookDoc.selectePossibleVoyage[0].cars+"-"
        +nsBookDoc.selectePossibleVoyage[0].pickups+"-"
        +nsBookDoc.selectePossibleVoyage[0].highHeavy+"-"
        +nsBookDoc.selectePossibleVoyage[0].statics
        }else {
        	nsBookDoc.mainRoutekey ="No Voyage"
        }
        if (!nsBookDoc.mainRoutekey) {
            return;
        }
        if(!(nsCore.getPage(window.location.href)==='booking')){
        	subRowCheck = (parseInt($(trElement).attr('id').split('_')[2]) > 1) ? true : false;
        	if(subRowCheck){
        		subRowId = $(trElement).attr('id').split('_')[1];
        		$.each($('.subRows'), function(ix,v){
        			if($(v).attr('id').split('_')[2] === subRowId){
        				subRowArr.push(v);
        			}
        		})
        	}
        	nsDoc.newBlObj.isManualTrigger = false;
        	if(subRowCheck){
        		$.each(subRowArr, function(ix ,v) {
    				var trans = $(v).attr('data-legtype');
    				if (trans === 'M') {
    					nsDoc.existingRouteData.selectedVesselVoyage = $(v).attr('data-vesselvoyage');
    					nsDoc.existingRouteData.selectedLoadPortCallId = $(v).attr('data-sourceportcallid');
    					nsDoc.existingRouteData.selectedDiscPortCallId = $(v).attr('data-discportcallid');
    					nsDoc.existingRouteData.currentConsType = 'M';
    				}
    				j++;
    			});
        	} else{
        		if ($(trElement).attr('data-legtype') === 'M') {
					nsDoc.existingRouteData.selectedVesselVoyage = $(trElement).attr('data-vesselvoyage');
					nsDoc.existingRouteData.selectedLoadPortCallId = $(trElement).attr('data-sourceportcallid');
					nsDoc.existingRouteData.selectedDiscPortCallId = $(trElement).attr('data-discportcallid');
					nsDoc.existingRouteData.currentConsType = 'M';
				}
        	}
        }
        nsDoc.clearTrashipmentFields();
        $('select[name="bookingAllocStatus"]').removeAttr('disabled');
        if (!nsBookDoc.mainRoutekey) {
            return;
        }
        if (nsBookDoc.mainRoutekey === 'No Voyage') {
            nsBookDoc.fmaxHeightCapacity = -1;
            nsBookDoc.fmaxWeightCapacity = -1;
            nsBookDoc.fnoVoyage = true;
            return;
        }
        nsBookDoc.fnoVoyage = false;
        values = nsBookDoc.mainRoutekey.split('-');
        nsBookDoc.fmainTrade = values[0];
        nsBookDoc.fmainSrcPort = values[1];
        nsBookDoc.fmaindestPort = values[2];
        nsBookDoc.fcarReAvl = values[3];
        nsBookDoc.fpuReAvl = values[4];
        nsBookDoc.fhhReAvl = values[5];
        nsBookDoc.fstReAvl = values[6];
        $.each(nsBookDoc.selectePossibleVoyage, function(jx, leg) {
            var trans = leg.legType
            if (trans === 'M') {
                   var puVal = leg.pickups,
                        stVal = leg.statics
                    if (puVal.indexOf('---') !== -1) {
                        nsBookDoc.fpuReAvl = nsBookDoc.fcarReAvl;
                    }
                    if (stVal.indexOf('---') !== -1) {
                        nsBookDoc.fstReAvl = nsBookDoc.fhhReAvl;
                    }
            }
            i++;
        });
        nsBookDoc.setupPrtVal(trElement);
        ids = popsrcPrtId(trElement, ids);
        nsBookDoc.upPrtVal(trElement);
        findVesCap(ids);
    }
    
    function findVesCap(ids) {
        if (ids) {
            vmsService.vmsApiService(function(response) {
                if (response) {
                    if(response.particulars){
                    	nsBookDoc.fmaxHeightCapacity = response.particulars.maxCargoHeight;
                    	nsBookDoc.fmaxWeightCapacity = response.particulars.maxRampWeight;
                    }
                } else {
                	if(response !== '') {
                		nsCore.showAlert(nsBookDoc.errorMsg);
                	}
                }
            }, '/Vms/booking/findVesselCapacity?id=' + ids, 'GET', null);

        }
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
    function setNoVoyageData() {
        nsBookDoc.fmaxHeightCapacity = -1;
        nsBookDoc.fmaxWeightCapacity = -1;
        nsBookDoc.fNoVoayge = true;
    }
    function fetchLegInstanceFresh(leg, i) {
		switch(i){

			case 'i === 1' :
				return {
					'sourcePortCallID': leg.sourcePortCallIDPreCarriage,
					'discPortCallID': leg.discPortCallIDPreCarriage,
					'vesselId': leg.vesselIdPreCarriage,
					'legType': leg.legTypePreCarriage,
					'vesselVoyage': leg.vesselVoyagePreCarriage,
					'trade': leg.tradePreCarriage,
					'loadPort': leg.loadPortPreCarriage,
					'discPort': leg.discPortPreCarriage,
					'eta': leg.etaPreCarriage,
					'etd': leg.etdPreCarriage,
					'allocationForCar': leg.allocationForCarPreCarriage,
					'allocationForPU': leg.allocationForPUPreCarriage,
					'allocationForHH': leg.allocationForHHPreCarriage,
					'allocationForST': leg.allocationForSTPreCarriage
				};
				break;

			case 'i === 2' :
				return {
					'sourcePortCallID': leg.sourcePortCallIDOnCarriage,
					'discPortCallID': leg.discPortCallIDOnCarriage,
					'vesselId': leg.vesselIdOnCarriage,
					'legType': leg.legTypeOnCarriage,
					'vesselVoyage': leg.vesselVoyageOnCarriage,
					'trade': leg.tradeOnCarriage,
					'loadPort': leg.loadPortOnCarriage,
					'discPort': leg.discPortOnCarriage,
					'eta': leg.etaOnCarriage,
					'etd': leg.etdOnCarriage,
					'allocationForCar': leg.allocationForCarOnCarriage,
					'allocationForPU': leg.allocationForPUOnCarriage,
					'allocationForHH': leg.allocationForHHOnCarriage,
					'allocationForST': leg.allocationForSTOnCarriage
				};
				break;

			default:
				return {
					'sourcePortCallID': leg.sourcePortCallIDPostCarriage,
					'discPortCallID': leg.discPortCallIDMainLeg,
					'vesselId': leg.vesselIdPostCarriage,
					'legType': leg.legTypePostCarriage,
					'vesselVoyage': leg.vesselVoyageMainLeg,
					'trade': leg.tradePostCarriage,
					'loadPort': leg.loadPortMainLeg,
					'discPort': leg.discPortMainLeg,
					'eta': leg.etaPostCarriage,
					'etd': leg.etdPostCarriage,
					'allocationForCar': leg.allocationForCarMainLeg,
					'allocationForPU': leg.allocationForPUMainLeg,
					'allocationForHH': leg.allocationForHHMainLeg,
					'allocationForST': leg.allocationForSTMainLeg
				};
				break;
		}
    }

freshBookObj = {
    
        'rteChanged': rteChanged,
        'findVesCap':findVesCap,        
        'popsrcPrtId':popsrcPrtId,
        'mainRoutekey' : '',
        'fnoVoyage': false,
        'fpuReAvl' : 0,
        'fcarReAvl' : 0,
        'fstReAvl' : 0,
        'fhhReAvl' : 0,
        'fmaxHeightCapacity' : -1,
        'fmaxWeightCapacity' : -1,
        'fvCapacity': '/Vms/booking/findVesselCapacity?id=',
        'fmainSrcPort' : null,
        'fmainTrade' : null,
        'setNoVoyageData': setNoVoyageData,
        'fNoVoayge':false,
        'fetchLegInstanceFresh': fetchLegInstanceFresh
    };

    $.extend(true, nsBookDoc, freshBookObj);

})(this.bookDoc, jQuery, this.vmsService, this.core, this.doc);