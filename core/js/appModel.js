/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsCore, vmsService, $) {
	var app = {}

	app = {
		'appModel' : {
			'selected' : 'none',
			'viewSubBooking' : {},
			'fetchBOLInfo' : {},
			'viewbolDetails' : {},
			'fetchBLConsignments' :{},
			'currentEditLeg' :{},
			'currentAddLeg':{},
			'setCurNavSelection' : setCurNavSelection,
			'getSelectedBookingId' : getSelectedBookingId,
			'getSelectedSubBookingId' : getSelectedSubBookingId,
			'getSearchResultCount' : getSearchResultCount,
			'triggerRegisterEvent' : triggerRegisterEvent,
			'addRegisterEvent' : addRegisterEvent,
			'clearRegisterEvent' : clearRegisterEvent,
			'clearDataOnCreateBooking' : clearDataOnCreateBooking,
			'setFetchBLConsignments' : setFetchBLConsignments,
			'clearFetchBLConsignments' : clearFetchBLConsignments,
			'getNextConsignmentType' : getNextConsignmentType,
			'getConsignmentNo' : getConsignmentNo,
			'registerEvent' : '',
			'lastUserEventTarget' : '',
			'searchByCriteria' : {},
			'bookDocSearchCriteria' : {}

		},
	};
	function triggerRegisterEvent() {
		if (nsCore.appModel.registerEvent) {
			$(nsCore.appModel.registerEvent).trigger('click');
		}
		nsCore.appModel.clearRegisterEvent();
	}
	function clearRegisterEvent() {
		nsCore.appModel.registerEvent = '';
	}
	function addRegisterEvent(that) {
		nsCore.appModel.registerEvent = that;
	}
	function clearDataOnCreateBooking(){
		nsCore.appModel.fetchBOLInfo = {};
		nsCore.appModel.viewSubBooking = {};
	}
	function getConsignmentNo(consignLegId){
		var consNo;
		$.each(nsCore.appModel.viewSubBooking.consignmentLegModelList, function(i, consignment){
			if(consignment.consignmentLegId === consignLegId ){
				consNo= consignment.consignmentNo;
			}
		});
		return consNo;
	}
	function getNextConsignmentType(legId){
		var consType="";
		var consignmentLeg=[];
		var currentLegId=""
		if(nsCore.appModel.selected==='booking' && nsCore.appModel.fetchBOLInfo.routeDetailEnable==='Y'){
			consignmentLeg= nsCore.appModel.fetchBOLInfo.subBookingModelList[0].consignmentLegModelList
			
		}else if(nsCore.appModel.selected==='bl' && nsCore.appModel.viewbolDetails.billOfLadingModel.enableRoute==='Y'){
			consignmentLeg= nsCore.appModel.viewbolDetails.consignmentLegModelsList
			
		}else if(nsCore.appModel.selected==='subBooking'){
			consignmentLeg= nsCore.appModel.viewSubBooking.consignmentLegModelList
		}
		$.each(consignmentLeg, function(index, leg){
				currentLegId=(leg.consignmentLegId)?leg.consignmentLegId: leg.legId
				if(currentLegId===legId){
					consType = (leg.nextConsignmentType)?leg.nextConsignmentType:  leg.nextConsType;
				}
		})
		return consType;
	}
	function setCurNavSelection(selected, data) {
		// ////////////////This needs to be removed before live
		// //////////////////////////////
		var error = exceptionHandling('setCurNavSelection', {
			'selected' : selected,
			'data' : data
		})
		if (!error) {
			return error;
		}
		// ////////////////////////////////////
		nsCore.appModel.selected = selected;
		switch (selected) {
		case 'booking':
			nsCore.appModel.fetchBOLInfo = data;
			nsCore.appModel.viewSubBooking = {};
			break;
		case 'subBooking':
			nsCore.appModel.viewSubBooking = data;
			break;
		case 'bl':
			nsCore.appModel.viewbolDetails = data;
			nsCore.appModel.viewSubBooking = {};
			break;
        default:
            break;
		}
	}
	function setFetchBLConsignments(data){
		nsCore.appModel.fetchBLConsignments=data;
	}
	function clearFetchBLConsignments(data){
		nsCore.appModel.fetchBLConsignments={};
	}
	function getSearchResultCount() {
		if (nsCore.appModel.searchByCriteria.responseData
				&& nsCore.appModel.searchByCriteria.responseData.searchCriteriaResultsList) {
			return nsCore.appModel.searchByCriteria.responseData.searchCriteriaResultsList.length;
		} else {
			return 0;
		}
	}
	function getSelectedBookingId() {
		// ////////////////This needs to be removed before live
		// //////////////////////////////
		exceptionHandling('getSelectedBookingId', {
			'value' : nsCore.appModel.fetchBOLInfo.bookingID
		})
		// ////////////////////////////////////
		return nsCore.appModel.fetchBOLInfo.bookingID;
	}
	function getSelectedSubBookingId() {
		// ////////////////This needs to be removed before live
		// //////////////////////////////
		exceptionHandling('getSelectedSubBookingId', {
			'value' : nsCore.appModel.viewSubBooking.subBookingId
		})
		// ////////////////////////////////////
		return nsCore.appModel.viewSubBooking.subBookingId;
	}
	// ////////////////This needs to be removed before live
	// //////////////////////////////
	function exceptionHandling(fun, obj) {
		switch (fun) {
		case 'setCurNavSelection':
			if (obj.selected !== 'booking' && obj.selected !== 'subBooking' && obj.selected !== 'bl') {
				return false;
			}
			if (!obj.data) {
				switch (selected) {
				case 'booking':
					return false;
				case 'subBooking':
					return false;
		        default:
		            break;
				}
			}

			break;
		case 'getSelectedSubBookingId':
			if (!obj.value) {
				return false;
			}
			break;
		case 'getSelectedBookingId':
			if (!obj.value) {
				return false;
			}
			break;
        default:
            break;
		}
		return true;
	}
	// ////////////////////////////////////
	$.extend(true, nsCore, app);
})(this.core, this.vmsService, jQuery);
