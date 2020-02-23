/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';

(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {

    var blContentObj = {
        'loadBillofLadingContent': loadBillofLadingContent
    };

    function invokeBlCommentsAjaxEvent(bolObject, bolId, bookingId) {
        var bolComms = [],
            bolDuplicateType = [],
            subBookingList = [],
            subBooking = {},
            billOfLadingObject = {},
            bookingData = {},
            existingCommentTypes = [];

        if (bolObject.bolCommentList) {
            $.each(bolObject.bolCommentList, function(i, val) {
                bolDuplicateType.push(val.commentType);
                bolComms.push({
                    commentNo: val.commentNo,
                    commentText: val.commentText,
                    commentType: val.commentType,
                    id: val.commentId,
                    commentId: val.commentType + '#B',
                    officeComm: 'N',
                    timeStamp: val.timeStamp || '0'
                });
            });
        }
        if (bolComms.length === 0) {
            bolComms = [];
        } else {
            bolComms.sort(function(a, b) {
                return parseInt(a.commentNo) - parseInt(b.commentNo);
            });
        }

        billOfLadingObject = {
            id: bolId
        };
        subBooking = {
            billOfLading: billOfLadingObject
        };
        subBookingList.push(subBooking);
        subBooking = {
            billOfLading: null
        };
        subBookingList.push(subBooking);
        bookingData = {
            id: bookingId,
            consignmentList : subBookingList
        };
        vmsService.vmsApiService(function(responseAllCom){
            if(responseAllCom){
                if (responseAllCom.responseDescription === 'Success') {
                    $.each(responseAllCom.responseData, function(i, val) {
                        existingCommentTypes.push({
                            id: '',
                            type: val.code,
                            desc: val.desc
                        });
                    });
                }
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        },nsBooking.commenttypes, 'GET', null);
        populateBlCommentTypePopup(bolComms, bookingData, bolDuplicateType);
    }

    function populateBlCommentTypePopup(bolComms, bookingData, bolDuplicateType) {
        var commentList = [],
            map = {},
            payabaleAtOptions = '<option selected value="">--Select--</option>',
            issuedAtOptions = '<option selected value="">--Select--</option>';
        vmsService.vmsApiService(function(responseComList){
            var key = '',
                str = '<option  com-id="" value="">-Select-</option>';
            if(responseComList){
                $.each(bolComms, function(i, obj) {
                    map[obj.commentType + '-' + obj.commentText] = obj.commentText;
                });
                if (responseComList.responseData) {
                    responseComList.responseData = responseComList.responseData
                        .sort(nsBooking.dynamicSort('commentTypeDescription'));
                    $.each(responseComList.responseData, function(i, obj) {
                        if (!(obj.id.indexOf('#B') !== -1)) {
                        	switch (obj.commentType) {
                                case '50':

                                    payabaleAtOptions = payabaleAtOptions + '<option value="' + escape(obj.commentText)
                                        + '">' + obj.commentText + '</option>';
                                    break;
                                case '60':
                                    issuedAtOptions = issuedAtOptions + '<option value="' + escape(obj.commentText)
                                        + '">' + obj.commentText + '</option>';
                                    break;
                                default: break;
                        	}
                        }
                        if (bolDuplicateType.indexOf(obj.commentType) === -1 || obj.multipleCom === 'Y') {
                            key = obj.commentType + '-' + obj.commentText;
                            if (!(key in map)) {
                                commentList.push(obj);
                            }
                        }
                    });
                }
                if (payabaleAtOptions) {
                    $('#billFreightPayable').html(payabaleAtOptions);
                    $('#billFreightPayable option').each(function(){
                        if (this.value === 'undefined') {
                        	this.value = "";
                        	$(this).html("");
                            return false;
                        }
                    });
                    if($('#billFreightPayable option').length === 2){
                    	$('#billFreightPayable').val($('#billFreightPayable option')[1].value)
                    }
                }
                if (issuedAtOptions) {
                    $('#billIssued').html(issuedAtOptions);
                    $('#billIssued option').each(function(){
                        if (this.value === 'undefined') {
                        	this.value = "";
                        	$(this).html("");
                            return false;
                        }
                    });
                    if($('#billIssued option').length === 2){
                    	$('#billIssued').val($('#billIssued option')[1].value)
                    }
                }
                $.each(responseComList.responseData, function(i, v) {
                    str += '<option repeat="';
                    str += (v.multipleComment === 'Y') ? 'true' : 'false';
                    str += '" com-id="' + v.id + '" value="' + v.id + '" type="' + v.commentType + '"';
                    if (v.commentText) {
                        str += 'title = "' + v.commentText + '"';
                    }
                    str += '>' + v.commentTypeDescription + '</option>';
                });
                nsBooking.allCommentOptions = str;
                $('.blCommentsOptions').html(str);
                if (bolComms.length !== 0) {
                    loadBillCommentInfo(bolComms);
                } else {
                    $('#billLadingCommentGrid').find('tbody').empty();
                }
                nsBooking.filterCommentTypeOptions();
                if(!nsBooking.isBookingCreatedStatus){
                	$('#billLadingCommentGrid').find('input, select,textarea').attr('disabled', true);
                	$('#editCommentPopup').find('input, select,textarea').attr('disabled', true);
                	$('.editIcon,#billLadingCommentGrid span.rowRemoveIcon').addClass('disabledLink');
                }
                else {
                	$('#editCommentPopup').find('input, select,textarea').removeAttr('disabled');                	
                }
                	
                if ($('.routeDetailsWrapper').css('display') === 'block' && $('.selectedRoute:checked').val() !== 'M' && $('.selectedRoute:checked').val() !== 'null') {
					nsBookDoc.headerLevelLegBasedEnableDisable();
				}
                $('.preloaderWrapper').hide();
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        },nsBooking.getCommentList, 'POST', JSON.stringify(bookingData));
    }

    function getFreightParticulars(bookingId, inputField) {
        var freightParticularValue = '',
            isPrepaid = false,
            isCollect = false;
        if(bookingId){
        vmsService.vmsApiService(function(response){
            if(response){
                $.each(response.responseData, function(key, value) {
                    if (value.prepaid === 'P') {
                        isPrepaid = true;
                    }
                    if (value.prepaid === 'C') {
                        isCollect = true;
                    }
                });
                if (isPrepaid && isCollect) {
                    freightParticularValue = 'PREPAID/COLLECT';
                } else if (isPrepaid && !isCollect) {
                    freightParticularValue = 'PREPAID';
                } else if (!isPrepaid && isCollect) {
                    freightParticularValue = 'COLLECT';
                } else {
                    freightParticularValue = '';
                }
                inputField.val(freightParticularValue);
                $(inputField).attr('disabled', 'disabled');
                $(inputField).closest('tr').find('.editIcon').addClass('disabledEditIcon');
                $('#billFreightParticulars').val((freightParticularValue || '').toUpperCase());
            } else {
                nsCore.showAlert(nsBooking.errorMsg);
            }
        },nsBooking.bookingIdOrgetfrght+bookingId, 'GET', null);
        }
    }

    function setFreightParticulars(commentWrap, commentType) {
        var bookingId = '',
            inputField = '';
        if (commentType === '10') {

            bookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
			.attr('data-bookingid');
            if(!bookingId){
				bookingId=nsCore.appModel.fetchBOLInfo.bookingId
            }
            inputField = commentWrap.find('.blCommentText');
            getFreightParticulars(bookingId, inputField);
        }
    }
    //set comments to frieght payable
    function setCommentToFreightPayable(commentText) {
        var optionAvailable = false,
            selectobject = $('#billFreightPayable option'),
            sel = 0,
            optionsCheck = '';
        for (sel = 0; sel < selectobject.length; sel++) {
            if (selectobject[sel].text === commentText) {
                optionAvailable = true;
            }
        }
        if (!optionAvailable && (escape(commentText))) {
            optionsCheck = '<option value="' + escape(commentText) + '">' + commentText + '</option>';
            $('#billFreightPayable').append(optionsCheck);
        }
    }
    //function to check whether object is null or not
    function checkObjectNull(obj) {
        return (obj) ? true : false;
    }

    function loadBillPartyInfo(response) {
        var partyTemplate = response.bolPartyList,
            initialSelectedVals = [],
            i = 0,
            partyWrap = '';

        //VMSAG-3295 : parties sorting handled at DB
       /* if(partyTemplate){
	        partyTemplate.sort(function(a, b) {
	            var pt1 = a.partyType,
	                pt2 = b.partyType;
	            return (pt1 < pt2) ? -1 : (pt1 > pt2) ? 1 : 0;
	        });
        }*/

        $('.addNewPartyWrap > span.icons_sprite.buttonIcon').removeClass('fa-plus').addClass('fa-plus');
        $('.billLadingPartyContentWrapper').text('');
        for (i in partyTemplate) {
            if (partyTemplate.hasOwnProperty(i)) {
                partyWrap = $('.dummyPartyWrap .ladingPartyItem').clone();
                partyWrap.removeClass('hide');
                partyWrap.find('textarea,input,select').prop('disabled', false);
                partyWrap.find('.rmvPartyitem').prop('disabled', false);
                partyWrap.find('.blParty')
                    .html(nsBooking.generatePartySelect(nsBooking.globalPartyType, partyTemplate[i].partyType, true));
                partyWrap.find('.rmvPartyitem').attr('data-partyId', partyTemplate[i].partyId).attr('data-partytimestamp', partyTemplate[i].timeStamp);
                partyWrap.find('.billPartyId').val(partyTemplate[i].partyId);
                partyWrap.find('.billPartyType option:selected').remove();
                partyWrap.find('#billCode').val(partyTemplate[i].customerCode).attr('data-form', partyTemplate[i].customerCode);
                partyWrap.find('#blcustomerID').val(partyTemplate[i].companyId);
                partyWrap.find('#billNameDesc').val(partyTemplate[i].customerName).attr('data-form', partyTemplate[i].customerName);
                partyWrap.find('.billAddress').val(partyTemplate[i].address);
                partyWrap.find('.billContact').val(partyTemplate[i].contactName);
                partyWrap.find('.billPostalCode').val(partyTemplate[i].postalCode);
                partyWrap.find('.billCity').val(partyTemplate[i].city);
                partyWrap.find('.billState').val(partyTemplate[i].state);
                partyWrap.find('.billCountryCode').val(partyTemplate[i].country);
                partyWrap.find('.billCountryCodeDesc').val(partyTemplate[i].countryName);
                partyWrap.find('.billEmail').val(partyTemplate[i].email);
                partyWrap.find('.billEORI').val(partyTemplate[i].eori);
                partyWrap.find('.billTelephone').val(partyTemplate[i].telephone);
                partyWrap.find('.billMobile').val(partyTemplate[i].mobileNo);
                initialSelectedVals.push(partyTemplate[i].partyType);
                if (!nsBooking.isBlNotCreated()) {
                    partyWrap.find('textarea,input,select').prop('disabled', true);
                    partyWrap.find('.rmvPartyitem').addClass('disabledLink');
                    partyWrap.find('.iconBtn .icons_sprite').addClass('partyRemoveIcon');
                    $('.addNewPartyWrap').addClass('disabledLink');
                } else {
                    $('.addNewPartyWrap').removeClass('disabledLink');
                    $('.addNewPartyWrap > span.icons_sprite.buttonIcon').addClass('fa-plus');
                }
                partyWrap.appendTo($('.billLadingPartyContentWrapper'));
                partyWrap.attr("id","partyWrapId-"+i);
            }
        }
        $.each($('.billLadingPartyContentWrapper .ladingPartyItem')
                .find('select.blParty'), function(iterateParty, obj) {
            var currentSelVal = obj.value,
                othrSelected = initialSelectedVals.filter(function(el) {
                    return currentSelVal.indexOf(el) < 0;
                });
            $.each(othrSelected, function(selectOption, val) {
                $(obj).find('option[value="' + val + '"]').remove();
            });
        });
    }

    //function to load bill of lading content
    function loadBillofLadingContent(response, bookingId) {
        var bolId = '',
            multipleBol = false,
            bolObject = '', tempBolStatus = '', bolSameFlag = true,
            subBookingModelListLen=0,statusArray=[],currentValStatus,
        	bolHeaderloaded=false,arrCheck,arrValue;
        if (response.subBookingModelList) {
        	subBookingModelListLen= response.subBookingModelList.length;
            $.each(response.subBookingModelList, function(i, obj) {
            	var bolStatusFlg = '', bolDescFlag = '', bolPrint = '', bolIssuedDate = '';
            	statusArray.push(obj.billOfLadingModel.bolStatus);
            	if((subBookingModelListLen === 1) || (i > 0 && tempBolStatus === obj.billOfLadingModel.bolStatus && bolSameFlag)){
            		bolStatusFlg = obj.billOfLadingModel.bolStatus;
            		bolDescFlag = (obj.billOfLadingModel.bolPrinted && obj.billOfLadingModel.bolStatus==='30'? 'Issued and Printed' : obj.billOfLadingModel.bolStatusDesc);
            		bolPrint = obj.billOfLadingModel.bolPrinted;
            		bolIssuedDate = obj.billOfLadingModel.bolIssuedDate
            		bolSameFlag = true;
            	} else {
            		bolSameFlag = (i !== 0) ? false : true;
            	}
            	nsBooking.bolPrintedStauts = (nsBooking.bolPrintedStauts !== 'Y' && obj.billOfLadingModel.bolPrinted) ? 'Y' : 'N';
                if (checkObjectNull(obj.billOfLadingModel) && ((obj.bolStatus==='10' && !bolHeaderloaded)||(i === subBookingModelListLen-1 && !bolHeaderloaded))) {
                	bolHeaderloaded=true;
                    $('#billType').val(obj.billOfLadingModel.bolType);
                    if(obj.billOfLadingModel.bolType === '20'){
                    	$('#billOriginals').val('0').attr('readonly', true);
                    } else {
                    	$('#billOriginals').removeAttr('readonly');
                    }
                    $('#billStatusDesc').val(bolDescFlag); 
                    $('.activeNavigationItem').attr('data-bolstatus',bolStatusFlg);
                    $('#billStatus').val(bolStatusFlg);
                    $('#billOriginals').val(obj.billOfLadingModel.noOfOriginals);
                    $('#billCopy').val(obj.billOfLadingModel.noOfCopies);
                    $('#billIssuedDate').val(bolPrint);
                    $('#blLastIssuedDate').val(bolIssuedDate);
                    $('#billDocumentationOfficeId').val(obj.docOffCompId);
                    $('#billDocumentationOffice').val(obj.docOffCompCode);
                    $('#billDocumentationOfficeDesc').val(obj.docOffCompName);
                    // In booking below four fields are always empty irrespective of status.
                    $('#billOrigin').val('');
 	                $('#billDestination').val('');
 	                $('#billloadPort').val('');
 	                $('#billDischargePort').val('');                  
                    populateBLHeaderbyComments(obj);
                    $('#billLocalVessel').val(obj.billOfLadingModel.localVessel);
                    $('#billOceanVessel').val('');
                    $('#billShippersRef').val(obj.billOfLadingModel.shippersRef);
                    $('#billFreightAgentRef').val(obj.billOfLadingModel.agentRef);
                    $('#billITNNbr').val(obj.billOfLadingModel.itnNo);
                    $('#billMRNnbr').val(obj.billOfLadingModel.mrnNo);
                    $('#billMFormNbr').val(obj.billOfLadingModel.mformNo);
                    $('#billId').val(obj.billOfLadingModel.bolId);
                    $('#billTimeStamp').val(obj.billOfLadingModel.timeStamp);
                    loadBillPartyInfo(obj.billOfLadingModel);
                    setItnNumber();
                    // Bill of lading comments
                    if ((bolId) && bolId !== obj.bolId && !multipleBol) {
                        multipleBol = true;
                    }
                    bolId = obj.bolId;
                    bolObject = obj.billOfLadingModel;
                    invokePreviewBlAjaxCallEvent();
                }
                tempBolStatus = obj.billOfLadingModel.bolStatus;
            });
            
            
			
            // multiple status and with atleast one  booking created status
            if(!$('#billStatusDesc').val() && nsBooking.isBookingCreatedStatus){
            	$('.activeNavigationItem').attr('data-bolstatus','10');
            }
            //multiple status and with no booking created status // else part is already handled  above the loop (single status with multiple consignment or single status with single consignment)
            else if(!$('#billStatusDesc').val()) {
            	$('.activeNavigationItem').attr('data-bolstatus','');
            }
            
            currentValStatus = $("#billStatusDesc").val();
			if(!currentValStatus){
					arrCheck = statusArray.every( compareCheck );
					 arrValue =  (arrCheck === true) ? "Booking Created" : "";
					 $('#billStatusDesc').val(arrValue);
			}
			else{
				$('#billStatusDesc').val(currentValStatus);
			}
			 if (response.multipleDoof === 'Y') {
		            $('#billDocumentationOffice').val('').prop('disabled', true);
		            $('#billDocumentationOfficeDesc').val('').prop('disabled', true);
		        } else {
		            $('#billDocumentationOffice').prop('disabled', false);
		            $('#billDocumentationOfficeDesc').prop('disabled', false);
		        }
        }
        if (!multipleBol) {
            invokeBlCommentsAjaxEvent(bolObject, bolId, bookingId);
        }
    }
    function compareCheck(val, i, arr){
    	return val===arr[0];
    }
    //function to invoke preview of Bill of lading from ajax call event
    function invokePreviewBlAjaxCallEvent() {
        $(document).off('click', '#addressBLPreview').on('click', '#addressBLPreview', function(e) {
            var dataBookingId = $('.mainBookListCol').find('.ui-selecting').attr('data-bookingid'),
                shipperName = '',
                shippersAddr = '',
                consigneeName = '',
                consAddr = '',
                notifyPartyName = '',
                notifyAddr = '',
				billVal,
				billNameDesc,
				billAddress,
                previewBLInfo = {};
            e.preventDefault();
            e.stopPropagation();

			billVal = $(this).closest('.ladingPartyItem').find('#billParty').val();
			billNameDesc = $(this).closest('.ladingPartyItem').find('#billNameDesc').val();
			billAddress = $(this).closest('.ladingPartyItem').find('#billAddress').val();

			switch(billVal){
				case '10':
					shipperName = billNameDesc;
					shippersAddr = billAddress;
					break;

				case '20':
					consigneeName = billNameDesc;
					consAddr = billAddress;
					break;

				case '40':
					notifyPartyName = billNameDesc;
					notifyAddr = billAddress;
					break;

				default:
					break;
			}


            previewBLInfo = {
                bookId: dataBookingId,
                shipperName: shipperName,
                shippersAddress: shippersAddr,
                consigneeName: consigneeName,
                consAddress: consAddr,
                notifyPartyName: notifyPartyName,
                notifyAddress: notifyAddr
            };
            vmsService.vmsApiService(function(responsePBL) {
                if (responsePBL) {
                    $('.toolTipWrapper').text('').hide();
                    $('#consIFrame').attr('src', '');
                    $('#consIFrame').attr('src', nsBooking.reportsLink + responsePBL.responseDescription);
                    $('#consBLPopup').find('.popUpTitle').text('Preview Bill of Lading');
                    $('#consEmailPdfName').val(responsePBL.responseDescription);
                    $('#consBLPopup').dialog({
                        modal: true,
                        resizable: false,
                        draggable: false,
                        width: '85%'
                    });
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.consignmentPreviewBL, 'POST', JSON.stringify(previewBLInfo));
        });
    }

    //function to populate bill of lading header by comments
    function populateBLHeaderbyComments(obj) {
        $('#billFreightParticulars').val((obj.billOfLadingModel.freightParticulars || '').toUpperCase());
        if (obj.billOfLadingModel.issuedAt) {
            $('#billIssued').val(obj.billOfLadingModel.issuedAt);
        }
        if (obj.billOfLadingModel.freightPayableAt) {
            $('#billFreightPayable').val(obj.billOfLadingModel.freightPayableAt);
        }
    }

    //function to set item number
    function setItnNumber() {
        var loadPort = '',
            itnValidation = '';
        if (nsBooking.textNullCheck($('#mainBookDetailCustomerOrigin').val())) {
            // null check
            loadPort = $('#mainBookDetailCustomerOrigin').val(),
            itnValidation = loadPort.trim().substring(0, 2);
            if (itnValidation === 'US') {
           	 $('#billITNNbr').prop('readonly', false);
            	} else {
           	 $('#billITNNbr').prop('readonly', true);
            	}
        }
    }

    //function to set comments to bill issued
    function setCommentToBLIssued(commentText) {
        var optionAvailable = false,
            selectBlIssuedobject = $('#billIssued option'),
            selb = 0,
            optionsSelect = '';

        for (selb = 0; selb < selectBlIssuedobject.length; selb++) {
            if (selectBlIssuedobject[selb].text === commentText) {
                optionAvailable = true;
            }
        }
        if (!optionAvailable && (escape(commentText))) {
            optionsSelect = '<option value="' + escape(commentText) + '">' + commentText + '</option>';
            $('#billIssued').append(optionsSelect);
        }
    }

    function loadBillCommentInfo(commentTemplate) {
        var commentWrap = '',
            i = 0;
			nsBooking.commentTypesToDisable = [];
        for (i in commentTemplate) {
            if (commentTemplate.hasOwnProperty(i)) {
                commentWrap = getCommentWrap(i);
                if (commentTemplate[i].commentText) {
					checkCommentTemplate(i, commentWrap, commentTemplate);
                }
                loadExistingComments(commentTemplate, commentWrap, i);
                appendComments(commentTemplate, commentWrap, i);
            }
        }
    }

    function checkCommentTemplate(i, commentWrap, commentTemplate){
		switch(commentTemplate[i].commentType) {
			case '50':
				setCommentToFreightPayable(commentTemplate[i].commentText);
				break;

			case '60':
				setCommentToBLIssued(commentTemplate[i].commentText);
				break;


			default:
				setFreightParticulars(commentWrap, commentTemplate[i].commentType);
				break;
		}
    }

    function appendComments(commentTemplate, commentWrap, i) {
    	if ((commentTemplate[i].id)
        		&& ((commentTemplate[i].multipleCom === 'N' && commentTemplate[i].multiComType !== 'Y')
            || commentTemplate[i].multipleCom === 'Y' || (!commentTemplate[i].multipleCom)
            || (!commentTemplate[i].multipleCom))) {
                commentWrap.appendTo('#billLadingCommentGrid tbody');
        }
    }

    function getCommentWrap(i) {
        var commentWrap = '';
        if (i === '0') {
            commentWrap = $('#billLadingCommentGrid tbody tr').first();
            $('#billLadingCommentGrid').find('tbody').empty();
        } else {
            commentWrap = $('#billLadingCommentGrid tbody tr').last().clone();
        }
        if (commentWrap.length === 0) {
            $('#addNewCommentHist').trigger('click');
            commentWrap = $('#billLadingCommentGrid tbody tr').first();
            $('#billLadingCommentGrid').find('tbody').empty();
        }
        return commentWrap;
    }

    function loadExistingComments(commentTemplate, commentWrap, i) {
        if ((commentTemplate[i].id) &&
            ((commentTemplate[i].multipleCom === 'N' && commentTemplate[i].multiComType !== 'Y') ||
            commentTemplate[i].multipleCom === 'Y' || (!commentTemplate[i].multipleCom) ||
            (!commentTemplate[i].multipleCom))) {
            commentWrap.find('input,select').val('');
            commentWrap.find('.blCommentText').removeAttr('disabled');
            commentWrap.find('.editIcon').removeClass('disabledEditIcon');
            commentWrap.find('.blCommentText').val(commentTemplate[i].commentText);
            commentWrap.find('#commentTimeStamp').val(commentTemplate[i].timeStamp);

            if (commentTemplate[i].officeComm === 'N') {
                commentWrap.find('.bolCommentId').val(commentTemplate[i].id);
            }
            commentWrap.find('.blCommentsOptions').val(commentTemplate[i].commentId);
          
            if (commentTemplate[i].commentType === '50') {
            	var payableValue = commentTemplate[i].commentText;
            	if(!(payableValue)){
            		 $("#billFreightPayable").val($("#billFreightPayable option:eq(1)").val(''));
				}				
				else{
	            	$('#billFreightPayable').val(escape(payableValue));
				}
            }
            
            else {
            	 if (commentTemplate[i].commentType === '60') {
                 	var issuedValue = commentTemplate[i].commentText;
                 	if(!(issuedValue)){
                 		$("#billIssued").val($("#billIssued option:eq(1)").val(''));
     				}
 	            	else{
 	            		$('#billIssued').val(escape(issuedValue));
 	            	}
                 }
            }
        }
    }
    $.extend(true, nsBooking, blContentObj);

})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);