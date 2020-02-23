/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc){
    var currentEditLeg = false,
        nextEditLeg = false,
        currentLeg = false;
    function isPossibleVoyClicked(popUp, gridView) {
        var possibleVoyageClicked = 'N';
        if ($(popUp).find(gridView).attr('data-clicked') === 'true') {
            possibleVoyageClicked = 'Y';
        }
        return possibleVoyageClicked;
    }
    function isShowPrevChecked(checkedFieldName) {
        var showPreVoyage = 'N';
        if ($(checkedFieldName).is(':checked')) {
            showPreVoyage = 'Y';
        }
        return showPreVoyage;
    }
    function invokeEditPossibleVoyage(showPreVoyage, possibleVoyageClicked) {
        var chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                .attr('data-bookingid'),
            url = '';
        if (!chargesBookingId) {
            chargesBookingId = '0';
        }
        currentEditLeg = false;
        nextEditLeg = false;
        url = nsBooking.orginPort + $('#currentEditLoadPortCode').val() + '&destinationPort='
        + $('#currentEditDiscPortCode').val() + '&consType=O&&loadPortCallVoyageId='
        + $('#currentEditLoadPortCallId').val() + '&discPortCallVoyageId=' + $('#currentEditDiscPortCallId').val()
        + '&showPreviousVoyage=' + showPreVoyage + '&compId=' +  ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
        + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=' + chargesBookingId
        + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
        vmsService.vmsApiServiceLoad(function(response) {
            var innerUrl;
            if (response) {
                $.each(response.preCarriageVoyageModelList, function(i, full) {
                    var dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre),
                        loadPortCallId = nsBooking.textNullCheck($('#currentLoadPortCallVoyId').val());
                    if (($('#isLoadedUnits').val() === 'Y') && dataLoadPortCal === loadPortCallId
                        && nsBooking.mainBookingFlag.editGetPossibleVoyage
                        && $('#currentDiscPortCodeOrg').val() !== $('#currentEditDiscPortCode').val()) {
                        currentEditLeg = true;
                    }
                    if ($('#currentDiscPortCodeOrg').val() === $('#currentEditDiscPortCode').val()) {
                        currentEditLeg = true;
                    }
                });
                nsBooking.mainBookingFlag.editGetPossibleVoyage = false;
                if (($('#isLoadedUnits').val() === 'Y') && !currentEditLeg) {

                    nsCore.showAlert(
                        ' New discharge port is not served by existing vessel voyage. Please select another one! ');

                    $('#currentEditDiscPortCode').val($('#currentDiscPortCodeOrg').val());
                    $('#currentEditDiscPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                    $('#nextEditLoadPortCode').val($('#currentDiscPortCodeOrg').val());
                    $('#nextEditLoadPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                } else {
                    nsBooking.loadCarriageGrids('editMainCarriageLegGrid', response.preCarriageVoyageModelList);
                }
                if (nsBooking.textNullCheck($('#nextEditLoadPortCode').val()) !== ''
                    && nsBooking.textNullCheck($('#nextEditDiscPortCode').val()) !== '') {
                	innerUrl = nsBooking.orginPort + $('#nextEditLoadPortCode').val()
                    + '&destinationPort=' + $('#nextEditDiscPortCode').val()
                    + '&consType=M&&loadPortCallVoyageId=' + $('#nextEditLoadPortCallId').val()
                    + '&discPortCallVoyageId=' + $('#nextEditDiscPortCallId').val()
                    + '&showPreviousVoyage=' + showPreVoyage + '&compId=' +  ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
                    + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=' + chargesBookingId
                    + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
                    vmsService.vmsApiServiceLoad(function(responseRouteVoy) {
                        var dataLoadPortCal,
                            loadNextPortCallId;
                        if (responseRouteVoy) {
                            $.each(responseRouteVoy.preCarriageVoyageModelList, function(i, full) {
                                dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre);
                                loadNextPortCallId = $('#currentEditLoadPortCallId').val() === null ||
                                    $('#nextLoadPortCallVoyId').val() === 'null' ? '' :
                                        $('#nextLoadPortCallVoyId').val();
                                if (($('#isNxtLoadedUnits').val() === 'Y')&& dataLoadPortCal === loadNextPortCallId
                                        && nsBooking.mainBookingFlag.editGetPossibleVoyage) {
                                    nextEditLeg = true;
                                }
                                if ($('#currentDiscPortCodeOrg').val() === $('#currentEditDiscPortCode').val()) {
                                    nextEditLeg = true;
                                }
                            });
                            if (($('#isNxtLoadedUnits').val() === 'Y') && !nextEditLeg) {
                                nsCore.showAlert('New discharge port is not served by existing vessel voyage.'
                                        +'Please select another one! ');
                                $('#currentEditDiscPortCode').val($('#currentDiscPortCodeOrg').val());
                                $('#currentEditDiscPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                                $('#nextEditLoadPortCode').val($('#currentDiscPortCodeOrg').val());
                                $('#nextEditLoadPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                            } else {
                                nextEditLeg = false;
                                nsBooking.loadCarriageGrids('editCarriageLegGrid',
                                    responseRouteVoy.preCarriageVoyageModelList);
                            }
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, innerUrl, 'POST', null);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, url, 'POST', null);
    }
    function invokeAddPossibleAjax(showPreVoyage, possibleVoyageClicked) {
        var chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                .attr('data-bookingid'),
            url = '';
        if (!chargesBookingId) {
            chargesBookingId = '0';
        }
        currentLeg = false;
        url = nsBooking.orginPort + $('#currentLoadPortCode').val() + '&destinationPort='
                + $('#currentDiscPortCode').val() + '&consType=O&&loadPortCallVoyageId='
                + $('#nextLoadPortCallId').val() + '&discPortCallVoyageId='
                + $('#nextDiscPortCallId').val() + '&showPreviousVoyage=' + showPreVoyage
                + '&compId=' + ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())+ '&possibleVoyageClicked='
                + possibleVoyageClicked + '&bookID=' + chargesBookingId
                + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
        vmsService.vmsApiServiceLoad(function(response) {
            var addCarriageGridList,
                innerUrl,
                dataLoadPortCal,
                loadPortCallId;
            if (response) {
                nsBooking.mainBookingFlag.addGetPossibleVoyage = false;
                $.each(response.preCarriageVoyageModelList, function(i, full) {
                        dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre),
                        loadPortCallId = nsBooking.textNullCheck($('#currentLoadPortVoyId').val());
                    if (($('#isLoadedUnits').val() === 'Y') && dataLoadPortCal === loadPortCallId) {
                        currentLeg = true;
                    }
                });
                if (($('#isLoadedUnits').val() === 'Y') && !currentLeg) {
                    addCarriageGridList = ['addMainCarriageLegGrid', 'addCarriageLegGrid'];
                    nsCore.showAlert(' New discharge port is not served by existing vessel voyage.'
                            +'Please select another one! ');
                    $('#currentDiscPortCode').val('');
                    $('#currentDiscPortDesc').val('');
                    $('#nextLoadPortCode').val('');
                    $('#nextLoadPortDesc').val('');
                    nsBooking.clearAddEditPopups('addCarriageLegPopup', addCarriageGridList, 'addCarriageVoyageDetails',
                        'addCarriagePrevVoyages');
                } else {
                    innerUrl = nsBooking.orginPort + $('#nextLoadPortCode').val() + '&destinationPort='
                            + $('#nextDiscPortCode').val() + '&consType=M&&loadPortCallVoyageId='
                            + $('#nextLoadPortCallId').val() + '&discPortCallVoyageId=' + $('#nextDiscPortCallId').val()
                            + '&showPreviousVoyage=' + showPreVoyage + '&compId=' +  ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
                            + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=' + chargesBookingId
                            + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
                    currentLeg = false;
                    nsBooking.loadCarriageGrids('addMainCarriageLegGrid', response.preCarriageVoyageModelList);
                    vmsService.vmsApiServiceLoad(function(responseRouteDtl) {
                        if (responseRouteDtl) {
                            nsBooking.loadCarriageGrids('addCarriageLegGrid',
                                responseRouteDtl.preCarriageVoyageModelList);
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, innerUrl, 'POST', null);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, url, 'POST', null);
    }
    function invokeAddGetPossibleVoyage(showPreVoyage, possibleVoyageClicked, possibleVoyageLnk, currDiscPort) {
        var chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                .attr('data-bookingid'),
            url = '';
        if (!chargesBookingId) {
            chargesBookingId = '0';
        }
        currentLeg = false;
        url = nsBooking.orginPort + $('#currentLoadPortCode').val().toUpperCase()
                + '&destinationPort=' + currDiscPort + '&consType=O&&loadPortCallVoyageId='
                + $('#nextLoadPortCallId').val() + '&discPortCallVoyageId=' + $('#nextDiscPortCallId').val()
                + '&showPreviousVoyage=' + showPreVoyage + '&compId=' +  ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
                + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=' + chargesBookingId
                + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
        vmsService.vmsApiServiceLoad(function(response) {
            var addCarriageGridList,
                innerUrl,
                dataLoadPortCal,
                loadPortCallId;
            if (response) {
                nsBooking.mainBookingFlag.addGetPossibleVoyage = false;
                possibleVoyageLnk.attr('data-clicked', true);
                $.each(response.preCarriageVoyageModelList, function(i, full) {
                    dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre);
                    loadPortCallId = nsBooking.textNullCheck($('#currentLoadPortVoyId').val());
                    if (($('#isLoadedUnits').val() === 'Y') && dataLoadPortCal === loadPortCallId) {
                        currentLeg = true;
                    }
                });
                if (($('#isLoadedUnits').val() === 'Y') && !currentLeg) {
                    addCarriageGridList = ['addCarriageLegGrid', 'addCarriageLegGrid'];
                    nsCore.showAlert(' New discharge port is not served by existing vessel voyage.'
                        +'Please select another one! ');
                    $('#currentDiscPortCode').val('');
                    $('#currentDiscPortDesc').val('');
                    $('#nextLoadPortCode').val('');
                    $('#nextLoadPortDesc').val('');
                    nsBooking.clearAddEditPopups('addCarriageLegPopup', addCarriageGridList, 'addCarriageVoyageDetails',
                        'addCarriagePrevVoyages');
                } else {
                    nsBooking.mainBookingFlag.initialAddLoad = false;
                    currentLeg = false;
                    nsBooking.loadCarriageGrids('addMainCarriageLegGrid', response.preCarriageVoyageModelList);
                    if (nsBooking.textNullCheck($('#currentDiscPortCode').val()) !== '') {
                        innerUrl = nsBooking.orginPort + $('#nextLoadPortCode').val().toUpperCase()
                                    + '&destinationPort=' + $('#nextDiscPortCode').val().toUpperCase()
                                    + '&consType=M&&loadPortCallVoyageId=' + $('#nextLoadPortCallId').val()
                                    + '&discPortCallVoyageId=' + $('#nextDiscPortCallId').val() + '&showPreviousVoyage='
                                    + showPreVoyage + '&compId=' + ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val()) +'&possibleVoyageClicked='
                                    + possibleVoyageClicked + '&bookID=' + chargesBookingId
                                    + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
                        vmsService.vmsApiServiceLoad(function(responseCarrige) {
                            if (responseCarrige) {
                                nsBooking.loadCarriageGrids('addCarriageLegGrid',
                                    responseCarrige.preCarriageVoyageModelList);
                            } else {
                                nsCore.showAlert(nsBooking.errorMsg);
                            }
                        }, innerUrl, 'POST', null);
                    }
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, url, 'POST', null);
    }
    function invokeEditGetPossibleVoyage(showPreVoyage, possibleVoyageClicked, possibleVoyageLnk) {
        var chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
                .attr('data-bookingid'),
            url = '';
        if (!chargesBookingId) {
            chargesBookingId = '0';
        }
        currentEditLeg = false;
        nextEditLeg = false;
        url = nsBooking.orginPort + $('#currentEditLoadPortCode').val() + '&destinationPort='
                    + $('#currentEditDiscPortCode').val() + '&consType=O&&loadPortCallVoyageId='
                    + $('#currentEditLoadPortCallId').val() + '&discPortCallVoyageId='
                    + $('#currentEditDiscPortCallId').val() + '&showPreviousVoyage=' + showPreVoyage + '&compId='
                    + ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val()) + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID='
                    + chargesBookingId + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
        vmsService.vmsApiServiceLoad(function(response) {
            var dataLoadPortCal,
                loadPortCallId,
                innerUrl;
            if (response) {
                $.each(response.preCarriageVoyageModelList, function(i, full) {
                    dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre);
                    loadPortCallId = nsBooking.textNullCheck($('#currentLoadPortCallVoyId').val());
                    if (($('#isLoadedUnits').val() === 'Y') && dataLoadPortCal === loadPortCallId
                        && nsBooking.mainBookingFlag.editGetPossibleVoyage
                        && $('#currentDiscPortCodeOrg').val() !== $('#currentEditDiscPortCode').val()) {
                        currentEditLeg = true;
                    }
                    if ($('#currentDiscPortCodeOrg').val() === $('#currentEditDiscPortCode').val()) {
                        currentEditLeg = true;
                    }
                });
                nsBooking.mainBookingFlag.editGetPossibleVoyage = false;
                possibleVoyageLnk.attr('data-clicked', true);
                if (($('#isLoadedUnits').val() === 'Y') && !currentEditLeg &&
                        (!nsBooking.mainBookingFlag.initialEditLoad)) {
                    $('#currentEditDiscPortCode').val($('#currentDiscPortCodeOrg').val());
                    $('#currentEditDiscPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                    $('#nextEditLoadPortCode').val($('#currentDiscPortCodeOrg').val());
                    $('#nextEditLoadPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                    nsCore.showAlert(' New discharge port is not served by existing vessel voyage.'
                        +'Please select another one! ');
                } else {
                    currentEditLeg = false;
                    nsBooking.loadCarriageGrids('editMainCarriageLegGrid', response.preCarriageVoyageModelList);
                }
                if (nsBooking.textNullCheck($('#nextEditLoadPortCode').val()) !== ''
                    && nsBooking.textNullCheck($('#nextEditDiscPortCode').val()) !== '') {
                    innerUrl = nsBooking.orginPort + $('#nextEditLoadPortCode').val()
                                + '&destinationPort=' + $('#nextEditDiscPortCode').val()
                                + '&consType=M&&loadPortCallVoyageId=' + $('#nextEditLoadPortCallId').val()
                                + '&discPortCallVoyageId=' + $('#nextEditDiscPortCallId').val()
                                + '&showPreviousVoyage=' + showPreVoyage + '&compId=' +  ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
                                + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID=' + chargesBookingId
                                + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
                    vmsService.vmsApiServiceLoad(function(responsePreCarrigeDtl) {
                        var urlInner;
                        if (responsePreCarrigeDtl) {
                            $.each(responsePreCarrigeDtl.preCarriageVoyageModelList, function(i, full) {
                                dataLoadPortCal = nsBooking.textNullCheck(full.sourcePortCallIDPre);
                                loadPortCallId = nsBooking.textNullCheck($('#nextLoadPortCallVoyId').val());
                                if (($('#isNxtLoadedUnits').val() === 'Y') && dataLoadPortCal === loadPortCallId
                                    && nsBooking.mainBookingFlag.editGetPossibleVoyage) {
                                    nextEditLeg = true;
                                }
                                if ($('#currentDiscPortCodeOrg').val() === $('#currentEditDiscPortCode').val()) {
                                    nextEditLeg = true;
                                }
                            });
                            if (($('#isNxtLoadedUnits').val() === 'Y') && !nextEditLeg) {
                                urlInner = nsBooking.orginPort
                                        + $('#currentEditLoadPortCode').val() + '&destinationPort='
                                        + $('#currentEditDiscPortCode').val()
                                        + '&consType=O&&loadPortCallVoyageId='
                                        + $('#currentEditLoadPortCallId').val() + '&discPortCallVoyageId='
                                        + $('#currentEditDiscPortCallId').val() + '&showPreviousVoyage='
                                        + showPreVoyage + '&compId=' +  ($('.subBookLevel #maincustomerID').val() || $('#maincustomerID').val())
                                        + '&possibleVoyageClicked=' + possibleVoyageClicked + '&bookID='
                                        + chargesBookingId + '&dateFormat=' + nsCore.dateFormat + '&timeFormat=' + nsCore.timeFormat;
                                nsCore.showAlert('New discharge port is not served by existing vessel voyage.'
                                    +'Please select another one!');
                                $('#currentEditDiscPortCode').val($('#currentDiscPortCodeOrg').val());
                                $('#currentEditDiscPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                                $('#nextEditLoadPortCode').val($('#currentDiscPortCodeOrg').val());
                                $('#nextEditLoadPortDesc').val($('#currentDiscPortCodeOrgDesc').val());
                                currentEditLeg = loadCarriageGridHelper(urlInner, currentEditLeg);
                            } else {
                                nextEditLeg = false;
                                nsBooking.loadCarriageGrids('editCarriageLegGrid',
                                    responsePreCarrigeDtl.preCarriageVoyageModelList);
                            }
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, innerUrl, 'POST', null);
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, url, 'POST', null);
    }

    function loadCarriageGridHelper(urlInner, currentEdit){
    	vmsService.vmsApiService(function(responsepreCarriage) {
            if (responsepreCarriage) {
                $.each(responsepreCarriage.preCarriageVoyageModelList, function() {
                	currentEdit = false;
                    nsBooking.loadCarriageGrids('editMainCarriageLegGrid',
                        responsepreCarriage.preCarriageVoyageModelList);
                });
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        }, urlInner, 'POST', null);
    	return currentEdit;
    }

    function checkAlreadyInRoute() {
        var isAlreadyInroute = false;
        if (!$('#currentEditDiscPortCode').is(':disabled')
            && ($('#currentRouteDiscPortCode').val() !== $('#currentEditDiscPortCode').val())) {
            isAlreadyInroute = nsBookDoc.checkAlreadyRoute('#currentEditDiscPortCode');
        }
        return isAlreadyInroute;
    }

    function checkNxtLegChanged(nextPortCallId) {
        var isNxtLegChanged = false;
        if (($('#isNxtLoadedUnits').val() === 'Y') && $('#nextLoadPortCallVoyId').val() !== nextPortCallId) {
            isNxtLegChanged = true;
        }
        if (($('#isLoadedUnits').val() === 'N' && $('#isReceivedUnits').val() === 'N')
            && ($('#isNxtLoadedUnits').val() === 'Y' || $('#isNxtReceivedUnits').val() === 'Y')
            && ($('#currentRouteDiscPortCode').val() !== $('#currentEditDiscPortCode').val())) {
            isNxtLegChanged = true;
        }
        return isNxtLegChanged;
    }
    function checkCutLegChanged(portCallId) {
        var isCurLegChanged = false;
        if (($('#isLoadedUnits').val() === 'Y') && $('#currentLoadPortCallVoyId').val() !== portCallId) {
            isCurLegChanged = true;
        }
        return isCurLegChanged;
    }
    function invokeSaveLegAjaxCall(nextPortCallId, formData, portCallId) {
        if (!checkAlreadyInRoute()) {
            if(checkCutLegChanged(portCallId)){
            	nsCore.showAlert('Unit is loaded on a previous vessel / voyage, please select the same vessel / voyage');
            } else if (checkNxtLegChanged(nextPortCallId)) {
                nsCore.showAlert(' New discharge port is not served by existing vessel voyage.'
                    +'Please select another one! ');
            } else {
                vmsService.vmsApiServiceLoad(function(obj) {
                	var arr = ((formData.booking === 'Y') ? nsCore.appModel.fetchBOLInfo.subBookingModelList[0].consignmentLegModelList : nsCore.appModel.viewSubBooking.consignmentLegModelList );
                	nsBooking.lpArr = [];
                	nsBooking.dpArr = [];
                	if(obj === '27'){
                		$('#editCarriageLegPopup').dialog('close');
                		nsCore.showAlert('Your booking office/customer has no allocation on this voyage');
                	} else if (obj) {
                        nsBooking.mainBookingFlag.editGetPossibleVoyage = false;
                        $.each(arr, function(ind, val) {
                        	var lpVal = val.loadPortCode,
    						dpVal = val.discPortCode,
    						legId = val.consignmentLegId,
    						prevLegId = (ind === 0 ) ? '' : ((arr[ind-1] || '').consignmentLegId);
		    					if(formData.consignmentLegList[0].id === legId){
		    						nsBooking.dpArr.push(formData.destination.portCode);
		    					} else {
		    						nsBooking.dpArr.push(dpVal);
		    					}
		    					if(formData.consignmentLegList[0].id === prevLegId){
		    						nsBooking.lpArr.push(formData.destination.portCode);
		    					} else {
		    						nsBooking.lpArr.push(lpVal);
		    					}
    					});
                        nsBooking.lpDpCheck = ($('#loadPort').val() && nsBooking.lpArr.indexOf($('#loadPort').val()) === -1) ? true : nsBooking.lpDpCheck;
						nsBooking.lpDpCheck = ($('#discPort').val() && nsBooking.dpArr.indexOf($('#discPort').val()) === -1) ? true : nsBooking.lpDpCheck;
                        nsBooking.bookLpDpCheck = [];
                        if (obj === '200' && !nsBooking.lpDpCheck) {
                        	$('.activeNavigationItem').trigger('click');
                            $('#editCarriageLegPopup').dialog('close');
                        } else {
                        	if(nsBooking.lpDpCheck){
                        		$('#editCarriageLegPopup').dialog('close');
                        		nsBookDoc.searchParamsMatch(nsBooking.fectSubBookingObj.bookingNumber, 'Updated');
                        		if($('.activeNavigationItem').hasClass('thrdLevel') && $('.thrdLevel').length > 1){
            						$('.activeNavigationItem').remove();
            					} else {
            						$('.activeSubBook').remove();
            					}
            					$('.thrdLevel').remove();
            					$('.frthLevel').remove();
            					$('.mainBookingDetailsWrap,.mainSubBookingListWrap,.mainSubBookingFormWrap').hide();
            					$('.defaultSearchMsg').show();
            					$('.activeSubBook.scndLevel').find('.expandBooking').removeClass('fa-minus').addClass('fa-plus');
            					if(($('.activeFirstLevel').attr('id') || '').split('_')[2] === '1'){
            						$('.activeFirstLevel').remove();
            					}
            					nsBooking.newLpVal = '';
            					nsBooking.newDpVal = '';
            					nsBooking.lpDpCheck = false;
                        	}
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.addLeg, 'POST', JSON.stringify(formData));
            }
        } else {
            nsCore.showAlert('This port can not be added since it is already available in route details');
        }
    }
    function populatPortCallIdForNxt() {
        $('#editCarriageLegGrid tbody tr').each(function() {
            if ($(this).find('.selectEditNextCarriageLeg').is(':checked')) {
                $('#nextEditLoadPortCallId').val($(this).find('.selectEditNextCarriageLeg')
                    .attr('data-portcalvoyageIdLoad'));
                $('#nextEditDiscPortCallId').val($(this).find('.selectEditNextCarriageLeg')
                    .attr('data-portcalvoyageIdDisc'));
            }
        });
    }
    function populatePortCallIdForCurrent() {
        var getPossibleSelected = false;
        $('#editMainCarriageLegGrid tbody tr').each(function() {
            if ($(this).find('.selectEditCarriageLeg').is(':checked')) {
                getPossibleSelected = true;
                $('#currentEditLoadPortCallId').val($(this).find('.selectEditCarriageLeg')
                    .attr('data-portcalVoyageIdLoad'));
                $('#currentEditDiscPortCallId').val($(this).find('.selectEditCarriageLeg')
                    .attr('data-portcalVoyageIdDisc'));
                
            }
        });
        return getPossibleSelected;
    }
    $(document).ready(function(){
        // click on cancel button to close add carriage leg pop up
        $('#bookingAddCarriageDetails').on('click', '.cancelButton', function() {
            $('#addCarriageLegPopup').dialog('close');
        });
        $('#addMainCarriageLegGrid').on('change', 'input[name="selectCarriageLeg"]', function() {
            $('#currentLoadPortCallId').val($(this).attr('data-portcalVoyageIdLoad'));
            $('#currentDiscPortCallId').val($(this).attr('data-portcalVoyageIdDisc'));
        });
        $('#editMainCarriageLegGrid').on('change', 'input[name="selectEditCarriageLeg"]', function() {
            $('#currentEditLoadPortCallId').val($(this).attr('data-portcalVoyageIdLoad'));
            $('#currentEditDiscPortCallId').val($(this).attr('data-portcalVoyageIdDisc'));
        });
        $('#addCarriageLegGrid').on('change', 'input[name="selectNextCarriageLeg"]', function() {
            $('#nextLoadPortCallId').val($(this).attr('data-portcalVoyageIdLoad'));
            $('#nextDiscPortCallId').val($(this).attr('data-portcalVoyageIdDisc'));
        });
        $('#editCarriageLegGrid').on('change', 'input[name="selectEditNextCarriageLeg"]', function() {
            $('#nextEditLoadPortCallId').val($(this).attr('data-portcalVoyageIdLoad'));
            $('#nextEditDiscPortCallId').val($(this).attr('data-portcalVoyageIdDisc'));
        });
        $('#bookingEditCarriageDetails').submit(function(e) {
        	$('#currentEditLoadPortCallId').val($('input[name=selectEditCarriageLeg]:checked').attr('data-portcalVoyageIdLoad'));
        	$('#currentEditDiscPortCallId').val($('input[name=selectEditCarriageLeg]:checked').attr('data-portcalVoyageIdDisc'));
        	$('#nextEditLoadPortCallId').val($('input[name=selectEditNextCarriageLeg]:checked').attr('data-portcalVoyageIdLoad'));
            $('#nextEditDiscPortCallId').val($('input[name=selectEditNextCarriageLeg]:checked').attr('data-portcalVoyageIdDisc'));
            var destination = {portCode : $('#currentEditDiscPort').val()},
                editLoadPort = nsBooking.textNullCheck($('#currentEditLoadPortCode').val()),
                loadPortInfo = {portCode : editLoadPort},
                editDiscPort = nsBooking.textNullCheck($('#currentEditDiscPortCode').val()),
                discPortInfo = {portCode : editDiscPort},
                nextLoadPort = nsBooking.textNullCheck($('#nextEditLoadPortCode').val()),
                nextLoadPortInfo = {portCode : nextLoadPort},
                nextDiscPort = nsBooking.textNullCheck($('#nextEditDiscPortCode').val()),
                nextDiscPortInfo = {portCode : nextDiscPort},
                getPossibleSelected = populatePortCallIdForCurrent(),
                portCallId = nsBookDoc.getVoyageCallIds('#currentEditLoadPortCallId'),
                destCallId = nsBookDoc.getVoyageCallIds('#currentEditDiscPortCallId'),
                portPairDtl = {
                    sourcePortCallID : portCallId,
                    destinationPortCallID : destCallId
                },
                nextPortCallId = nsBookDoc.getVoyageCallIds('#nextEditLoadPortCallId'),
                nextDestCallId = nsBookDoc.getVoyageCallIds('#nextEditDiscPortCallId'),
                nextPortPairDtl = {
                    sourcePortCallID : nextPortCallId,
                    destinationPortCallID : nextDestCallId
                },
                consLegId = nsBookDoc.getVoyageCallIds('#nextEditConsignmentLegId'),
                LegId = nsBookDoc.getVoyageCallIds('#editlegId'),
                consignmentNoEdit = nsBooking.textNullCheck($('#consignmentNoEdit').val()),
                consignmentLegsModel = [],
                loadCurrentTerminal = nsBookDoc.getTerminalObj('#currentEditLoadPortTerminal'),
                discCurrentTerminal = nsBookDoc.getTerminalObj('#currentEditDiscPortTerminal'),
                loadNextTerminal = nsBookDoc.getTerminalObj('#nextEditLoadPortTerminal'),
                discNextTerminal = nsBookDoc.getTerminalObj('#nextEditDiscPortTerminal'),
                valid = true,
                message = '',
                vessVoy1 = [],
                vessVoy2 = [],
                sameVessCode = 'N',
                consignmentLeg = {timeStamp : $('#legTimeStamp').val()},
                port, dateCompMsg='', startDate = '', toDate = '',
                formData,
                rtObj = {},
                validETD =  true,
                dateCompNextMsg = '',
                validETA =  true,
                editedLeg, nxtToEditLeg;
           
            e.preventDefault();
            $('#nextEditLoadPortCallId').val('');
            $('#nextEditDiscPortCallId').val('');
            populatPortCallIdForNxt();
            $('#currentEditLoadPortCallId').val('');
            $('#currentEditDiscPortCallId').val('');
            if ($('#isBooking').val() === 'N') {
                consignmentLegsModel.push({
                    id : LegId,
                    consignmentType : $('#editConsType').val(),
                    loadPort : loadPortInfo,
                    destinationPort : discPortInfo,
                    portPair : portPairDtl,
                    consignmentNo : consignmentNoEdit,
                    newLeg : 'N',
                    consignmentId : $('#consignmentId').val(),
                    loadTerminal : loadCurrentTerminal,
                    discTerminal : discCurrentTerminal,
                    // time stamp of leg which is edited is taken and sent
                    timeStamp : $('#legTimeStamp').val(),
                    consTimeStamp : nsBooking.subBookingObj.timeStamp
                }, {
                    id : consLegId,
                    consignmentType : nsCore.appModel.getNextConsignmentType(LegId),
                    loadPort : nextLoadPortInfo,
                    destinationPort : nextDiscPortInfo,
                    portPair : nextPortPairDtl,
                    consignmentNo : consignmentNoEdit,
                    newLeg : 'N',
                    consignmentId : $('#consignmentId').val(),
                    loadTerminal : loadNextTerminal,
                    discTerminal : discNextTerminal,
                    consTimeStamp : nsBooking.subBookingObj.timeStamp
                });
            } else {
            	// booking level
                port = destination;
                if (nsBooking.textNullCheck(nextLoadPort) === '') {
                    port = nextLoadPortInfo;
                }
                $.each(nsBooking.fectSubBookingObj.subBookingModelList, function(ind) {
                	if(ind===0){
                	editedLeg = this.consignmentLegModelList.filter(function(data){return data.consignmentLegId === LegId;})[0]
                	nxtToEditLeg = this.consignmentLegModelList.filter(function(data){return data.consignmentLegId === editedLeg.nextConsignmentLegId;})[0]
                	}
                    consignmentLegsModel.push({
                        id : LegId,
                        loadPort : loadPortInfo,
                        consignmentType : $('#editConsType').val(),
                        destinationPort : destination,
                        portPair : portPairDtl,
                        consignmentNo : consignmentNoEdit,
                        newLeg : 'N',
                        consignmentId : nsBooking.fectSubBookingObj.subBookingModelList[ind].subBookingId,
                        loaded : 'N',
                        discharged : 'Y',
                        loadTerminal : loadCurrentTerminal,
                        discTerminal : discCurrentTerminal,
                        sameDiscTerm : (editedLeg)? editedLeg.sameDiscTerm: "",
                        sameLoadTerm : (editedLeg)? editedLeg.sameLoadTerm: "",
                        // time stamp of leg which is edited is taken and sent
                        timeStamp : $('#legTimeStamp').val(),
                        consTimeStamp :  nsBooking.fectSubBookingObj.subBookingModelList[ind].timeStamp  
                    }, {
                        id : consLegId,
                        consignmentType : nsCore.appModel.getNextConsignmentType(LegId),
                        loadPort : port,
                        destinationPort : nextDiscPortInfo,
                        portPair : nextPortPairDtl,
                        consignmentNo : consignmentNoEdit,
                        newLeg : 'N',
                        consignmentId : nsBooking.fectSubBookingObj.subBookingModelList[ind].subBookingId,
                        loaded : 'Y',
                        discharged : 'N',
                        loadTerminal : loadNextTerminal,
                        discTerminal : discNextTerminal,
                        sameDiscTerm : (nxtToEditLeg)? nxtToEditLeg.sameDiscTerm: "",
                        sameLoadTerm : (nxtToEditLeg)? nxtToEditLeg.sameLoadTerm: "",
                        consTimeStamp : nsBooking.fectSubBookingObj.subBookingModelList[ind].timeStamp
                    });
                });
            }
            if((!$('#nextEditLoadPortDesc').val()) || $('#nextEditLoadPortDesc').val() === 'null'){ 
        		consignmentLegsModel.splice(1, 1);
            	
            }
            if (!getPossibleSelected || nsBooking.mainBookingFlag.editGetPossibleVoyage) {
                valid = false;
                message = message + ' Please select a voyage to proceed! ' + '\n';
            }
            if($('#editMainCarriageLegGrid').find('input:checked').length > 0){
            	if(nsBooking.editLegSDate && nsBooking.editLegSDate!=='null' && $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=='--'){
		            dateCompMsg = nsCore.compareDates(nsBooking.editLegSDate, $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html());
					if(dateCompMsg!==""  && $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=="" && nsBooking.editLegSDate!=="") {
						validETD=false;
					}
        		}
            	
			}
            if($('#editCarriageLegGrid').find('input:checked').length > 0){
            	if($($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html()!=='--' && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=='--') {
            		dateCompNextMsg = nsCore.compareDates($($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html(), $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[2]).html());
					if(dateCompNextMsg!==""  && $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html()!=="" && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=="") {
						validETA=false;
					}
        		}
        	}
            //added for 4920
            if($('#editMainCarriageLegGrid').find('input:checked').length > 0 && $('#editCarriageLegGrid').find('input:checked').length > 0){
            	if(nsBooking.editLegSDate && nsBooking.editLegSDate!=='null' && $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() === '--' && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=='--'){
		            dateCompMsg = nsCore.compareDates(nsBooking.editLegSDate, $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[2]).html());
					if(dateCompMsg!==""  && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=="" && nsBooking.editLegSDate!=="") {
						validETD=false;
					}
        		}
            	
            	if(nsBooking.editLegNxtSDate && nsBooking.editLegNxtSDate!=='null' && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() ==='--' && $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !=='--') {
            		dateCompNextMsg = nsCore.compareDates($($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html(), nsBooking.editLegNxtSDate);
					if(dateCompNextMsg!==""  && $($('#editMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html()!=="") {
						validETA=false;
					}
        		} else if(nsBooking.editLegNxtSDate && nsBooking.editLegNxtSDate!=='null' && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !== '--') {
            		dateCompNextMsg = nsCore.compareDates($($('#editCarriageLegGrid').find('input:checked').parent().siblings()[3]).html(), nsBooking.editLegNxtSDate);
					if(dateCompNextMsg!==""  && $($('#editCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !== "") {
						validETA=false;
					}
        		}
            }
            if(!validETA){
            	valid = false;
            	message = message + " ETA of current leg's Discharge Port must be less than ETD of next leg's Load port " + '\n';
            }
            
            if(!validETD){
            	valid = false;
        	    message = message + " ETD of current leg's Load Port must be greater than ETA of previous leg's Discharge port " + '\n';
            }
            startDate = nsBooking.editLegSDate || $($('.selectCarriageLeg:checked').closest('tr').find('td')[4]).text().split(' ')[0];
            startDate = (startDate === '--' || !startDate) ? '' : startDate ;
            toDate = ($('.selectNextCarriageLeg:visible').length>0?$($('.selectNextCarriageLeg:checked').closest('tr').find('td')[3]).text().split(' ')[0]:'');
            toDate = (toDate === '--' || !toDate) ? '' : toDate ;
            dateCompMsg = nsCore.compareDates(startDate, toDate);
            if(dateCompMsg){
            	valid = false;
                message = message + " ETA of discharge port on 1st leg must be less than ETD of load port on the next leg " + '\n';
            }
            vessVoy1 = $('.selectEditCarriageLeg:checked').closest('tr').find('td:nth-child(2)').text().split('/');
            vessVoy2 = $('.selectEditNextCarriageLeg:checked').closest('tr').find('td:nth-child(2)').text().split('/');
            if(vessVoy1[0] === vessVoy2[0] && vessVoy1[1] === vessVoy2[1] && vessVoy1[1] && $('#isNxtReceivedUnits').val()==='N' && $('#isNxtLoadedUnits').val() === 'N'){
          	  sameVessCode = 'Y';
            }
            if (valid) {
                rtObj = nsBookDoc.validateEditShowPrev('#currentEditDiscPortDesc', '#currentEditDiscPortCode',
                    '#nextEditDiscPortCode', '#currentEditLoadPortCode');
                valid = rtObj.valid;
                message = rtObj.message;
                if(message){
                	nsCore.showAlert(message);
                	return;
                }
                if (valid) {
                    formData = {
                        id : $('#consignmentId').val(),
                        consignmentNo : consignmentNoEdit,
                        consignmentLegList : consignmentLegsModel,
                        newLeg : 'N',
                        sameVesselVoyage : sameVessCode,
                        booking : $('#isBooking').val(),
                        bookingID : $('#bookingHeaderId').val(),
                        destination : discPortInfo,
                        bol : 'BOOK',
                        consignmentLeg : consignmentLeg
                                              
                    };
                    invokeSaveLegAjaxCall(nextPortCallId, formData, portCallId);
                }
            } else {
                nsCore.showAlert(message);
            }
        });
        // Load possible voyages for add leg - Feb3rd - Start
        $(document).on('click', '.addCarriageVoyageDetails', function() {
            var showPreVoyage = 'N',
                possibleVoyageLnk = $(this),
                possibleVoyageClicked = 'Y',
                currDiscPort = '',
                currDiscPortName = '',
                currDiscPortDescName = '',
                currLoadPortCode = '',
                nextDiscPortCode = '',
                valid = false,
                retObj = {};
            //added for 4787
            if(nsBooking.prevVoyCheck){
            	$('#addCarriagePrevVoyages').prop('checked', nsBooking.prevVoyCheck)
            }
            if ($('#addCarriagePrevVoyages').is(':checked')) {
                showPreVoyage = 'Y';
            }
       
        currDiscPort = $('#currentDiscPortCode').val();
        currDiscPortName = '#currentDiscPortCode';
        currDiscPortDescName = '#currentDiscPortDesc';
        currLoadPortCode = '#currentLoadPortCode';
        nextDiscPortCode = '#nextDiscPortCode';
        if(nsBooking.mainBookingFlag.initialAddLoad){
            nsBooking.mainBookingFlag.initialAddLoad=false;
        }
        else{
        	retObj = nsBookDoc.validateEditShowPrev(currDiscPortDescName, currDiscPortName, nextDiscPortCode, currLoadPortCode);
        	valid = retObj.valid;
        }
            if (valid) {
                invokeAddGetPossibleVoyage(showPreVoyage, possibleVoyageClicked, possibleVoyageLnk, currDiscPort);
            } else{
            	nsCore.showAlert(retObj.message);
            }
        });
        // Load possible voyages for edit leg
        $(document).on('click','.editCarriageVoyageDetails',function() {
            var possibleVoyageLnk = $(this),
                showPreVoyage,
                possibleVoyageClicked = 'Y',
                rObj = nsBookDoc.validateEditShowPrev('#currentEditDiscPortDesc', '#currentEditDiscPortCode',
                        '#nextEditDiscPortCode', '#currentEditLoadPortCode');
            //added for 4787
          //added for 4787
            if(nsBooking.prevVoyCheck){
            	$('#editCarriagePrevVoyages').prop('checked', nsBooking.prevVoyCheck)
            }
            showPreVoyage = isShowPrevChecked('#editCarriagePrevVoyages')
            if(nsBooking.textNullCheck(nsBooking.editDiscPort) !== $('#currentEditDiscPortCode').val()){
            	nsBooking.mainBookingFlag.editGetPossibleVoyage = true;
            }
            if (rObj.valid) {
                invokeEditGetPossibleVoyage(showPreVoyage, possibleVoyageClicked, possibleVoyageLnk);
            } else {
                nsCore.showAlert(rObj.message);
            }
        });
        // Load previous voyages for add leg
        $(document).on('change','.addCarriagePrevVoyages',function() {
            var showPreVoyage,
                possibleVoyageClicked = isPossibleVoyClicked('#addCarriageLegPopup', '.addCarriageVoyageDetails'),
                arr = [],
                rObj = nsBookDoc.validateEditShowPrev('#currentDiscPortDesc', '#currentDiscPortCode', '#nextDiscPortCode', '#currentLoadPortCode')
            //added for 4787
            if(nsBooking.prevVoyCheck){
            	$('#addCarriagePrevVoyages').prop('checked', nsBooking.prevVoyCheck)
            }
            showPreVoyage = isShowPrevChecked('#addCarriagePrevVoyages')
            if ((possibleVoyageClicked === 'Y' && showPreVoyage === 'N') || showPreVoyage === 'Y') {
                if (rObj.valid) {
                    invokeAddPossibleAjax(showPreVoyage, possibleVoyageClicked); 
                } else {
                    nsCore.showAlert(rObj.message);
                }
            } else {
                nsBooking.loadCarriageGrids('addMainCarriageLegGrid', arr);
                nsBooking.loadCarriageGrids('addCarriageLegGrid', arr);
            }
        });
        $(document).on('change','.editCarriagePrevVoyages',function() {
            var showPreVoyage,
                possibleVoyageClicked = isPossibleVoyClicked('#editCarriageLegPopup',
                '.editCarriageVoyageDetails'),
                arr = [],
                rObj = nsBookDoc.validateEditShowPrev('#currentEditDiscPortDesc', '#currentEditDiscPortCode', '#nextEditDiscPortCode', '#currentEditLoadPortCode');
            //added for 4787
            if(nsBooking.prevVoyCheck){
            	$('#editCarriagePrevVoyages').prop('checked', nsBooking.prevVoyCheck)
            }
            showPreVoyage = isShowPrevChecked('#editCarriagePrevVoyages')
            if(nsBooking.textNullCheck(nsBooking.editDiscPort) !== $('#currentEditDiscPortCode').val()){
            	nsBooking.mainBookingFlag.editGetPossibleVoyage = true;
            }
            if ((possibleVoyageClicked === 'Y' && showPreVoyage === 'N') || showPreVoyage === 'Y') {
                if (rObj.valid) {
                    invokeEditPossibleVoyage(showPreVoyage, possibleVoyageClicked);
                } else{
                	nsCore.showAlert(rObj.message);
                }
            } else {
                nsBooking.loadCarriageGrids('editMainCarriageLegGrid', arr);
                nsBooking.loadCarriageGrids('editCarriageLegGrid', arr);
            }
        });
        $('#bookingEditCarriageDetails').on('click', '.cancelButton', function() {
            $('#editCarriageLegPopup').dialog('close');
        });
    });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);