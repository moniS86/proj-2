/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore) {

    function generatePartySelect(options, isSelectedValue, onlyOptions) {
        var dropDownText = '';
        if (!onlyOptions) {
            dropDownText += '<select>';
        }
        $.each(options, function(i, obj) {
            var isSelected = (obj === isSelectedValue) ? ' selected ' : '';
            dropDownText += '<option value="' + obj + '"'
            + isSelected + '>' + nsBooking.globalPartyText[obj] + '</option>';
        });
        if (!onlyOptions) {
            dropDownText += '</select>';
        }
        return dropDownText;
    }

    $(document).ready(function() {
        var selectedVal = '',
            rowToRemove = [],
            billCommentRecord = [];
        // on change of party type value
        $(document).on('change', '.blParty', function() {
            var selectedValues = [];
            // Get all Selected Values
            $('.billLadingPartyContentWrapper .ladingPartyItem')
			.find('select.blParty option[value !="00"]:selected').each(function(i, obj) {
                selectedValues.push($(obj).val());
            });
            // Iterate and change the options
            $('.billLadingPartyContentWrapper .ladingPartyItem').find('select.blParty').each(function(i, obj) {
                var thisSelectVal = $(obj).val(),
                    totalVals = nsBooking.globalPartyType.slice(),
                    allOtherVals = selectedValues,
                    index= '';
                if (thisSelectVal === '00') {
                    index = totalVals.indexOf(thisSelectVal);
                    totalVals.splice(index, 1);
                }
                totalVals = totalVals.filter(function(el) {
                    return allOtherVals.indexOf(el) < 0;
                });
                $(obj).find('option:not(:selected)').remove();
                $.each(totalVals, function(pCou, value) {
                    $(obj).append(new Option(nsBooking.globalPartyText[value], value));
                });
            });
        });
        // To Add a New Party
        $('.addNewPartyWrap').click(function(e) {
            var partyWrap = $('.dummyPartyWrap .ladingPartyItem').clone(),
                dateTime = new Date().valueOf(),
                selectedValues = [],
                totalVals = nsBooking.globalPartyType.slice(),
                allOtherVals = '';
            var idwrapName = $(".ladingPartyItem").length-1;
            partyWrap.attr("id", "partyWrapId-"+idwrapName);
            e.preventDefault();
            if (nsBooking.globalBookingFlag.mainBookingFlag && (nsBooking.globalBookingFlag.mainBookingHeaderFlag)) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                return false;
            }
            if (nsBooking.blStatus.indexOf('10') === -1) {
                return false;
            }
            partyWrap.removeClass('hide');
            // since we need unique number
            partyWrap.find('a.rmvPartyitem').attr('data-nullPartyId', dateTime);
            $('.billLadingPartyContentWrapper .ladingPartyItem').find('.blParty option:selected[value!="00"]')
			.each(function(i, obj) {
                selectedValues.push($(obj).val());
            });
            if (selectedValues.length > 0) {
                allOtherVals = selectedValues;
                totalVals = totalVals.filter(function(el) {
                    return allOtherVals.indexOf(el) < 0;
                });
            }
            partyWrap.find('.blParty').html(generatePartySelect(totalVals, '00', true));
            $('.billLadingPartyContentWrapper').append(partyWrap);
            nsBooking.updateBLDetailsFlag();
        });
        $('.billLadingPartyContentWrapper').on('click', '.rmvPartyitem', function() {
            var partyId = $(this).attr('data-partyId') || 0,
            	partyTimeStamp = $(this).attr('data-partytimestamp') || 0,
                nullPartyId = 0;
            if (nsBooking.blStatus.indexOf('10') === -1) {
                return false;
            }
            if (partyId === 0) {
                nullPartyId = $(this).attr('data-nullPartyId');
            }
            // initialize Confirm Pop up
            $('#confirmDialogPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '35%',
                open: function() {
                	var titleText = '';
    	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
    	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
    	            	.removeClass('ui-corner-all ui-widget');
    	            titleText = $('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
    	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
    	        	$('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
    	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
    	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                    $('#confirmDialogPopup .rowItem').text('').text('Do you want to delete this party?');
                    $('#confirmDialogPopup').find('form').attr('id', 'confirmPartyDelete');
                },
                'dataParty': partyId,
                'nullPartyId': nullPartyId,
                'partyTimeStamp': partyTimeStamp
            });
            selectedVal = $(this).closest('.ladingPartyItem').find('.blParty option:selected').val();
        });
        // Confirm Delete Submit Party
        $('#confirmDialogPopup').on('submit', '#confirmPartyDelete', function(e) {
            var partyId = '', partytimeStamp = '',
                nullPartyId = '',
                bolParty = {};
            if (selectedVal !== '00') {
                $('.billLadingPartyContentWrapper .ladingPartyItem').find('select.blParty')
                    .each(function(i, obj) {
                        $(obj).append(new Option(nsBooking.globalPartyText[selectedVal], selectedVal));
                    });
            }
            e.preventDefault();
            partyId = $('#confirmDialogPopup').dialog('option', 'dataParty');
            partytimeStamp = $('#confirmDialogPopup').dialog('option', 'partyTimeStamp');
            $('#confirmDialogPopup').dialog('close');
            if (partyId === 0) {
                nullPartyId = $('#confirmDialogPopup').dialog('option', 'nullPartyId');
                $('.billLadingPartyContentWrapper').find('[data-nullPartyId="' + nullPartyId + '"]')
                    .closest('.ladingPartyItem').remove();
            } else {
                bolParty = {
                    id: partyId,
                    timeStamp: partytimeStamp,
                    moduleType : 'BOOK'
                };
                vmsService.vmsApiService(function(response) {
                    if (response) {
                        if (response.responseDescription === 'Delete successful') {
                            $('.billLadingPartyContentWrapper').find('[data-partyId="' + partyId + '"]')
                                .closest('.ladingPartyItem').remove();
                        } else if(response.responseDescription === 'concurrency'){
                        	nsCore.showAlert('Someone else have updated the data since you retrieved the information');
                        }
                    } else {
                        nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.bookingDltBolP, 'POST', JSON.stringify(bolParty));
            }
        });
        //Move row up and down
        $('#billLadingCommentGrid').on('click', '.greenUpArrow', function(e) {
	       	 e.preventDefault();
	       	 var rowIndex = $(this).closest('tr').index();
	       	 if(rowIndex !== 0) {
	       		 $(this).closest('tr').after($(this).closest('tr').prev('tr').closest('tr'));
	       	 }
       	 });
       
     //Move row up and down
       $('#billLadingCommentGrid').on('click', '.greenDownArrow', function(e) {
    	   	e.preventDefault();
	       	var rowIndex = $(this).closest('tr').index();
	       	var rowCount = $('#billLadingCommentGrid tr').length;
	       	if(rowIndex !== rowCount) {
	       	 $(this).closest('tr').before($(this).closest('tr').next('tr').closest('tr'));
	       	}
       	 });
        
        // Edit comment pop up code
        $('#billLadingCommentGrid').on('click', '.editIcon', function(e) {
            var tooltipContent = '',
                textBoxVal = '',
                rowIndex = 0;
            if (nsBooking.isBookingHeaderChanged()) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                    nsBooking.globalBookingFlag.fnGoBackWard,
                    'mainBookingFlag', $(this));
                return false;
            }
            $('#editCommentPopup').dialog({
                modal: false,
                resizable: false,
                draggable: false,
                width: '55%',
                cache: false,
                position: { my: "right center", at: "right bottom", of: "#billLadingCommentGrid"},
                open: function() {/*empty function*/}
            });
            e.preventDefault();
            textBoxVal = $(this).closest('td').find('.blCommentText').val();
            rowIndex = $(this).closest('tr').index();
            tooltipContent = nsBooking.createTooltipContent(rowIndex, textBoxVal);
            $('.textAreaContent').html(tooltipContent);
            $(".textAreaContent .tooltipTextarea").val(textBoxVal);
        });
        $('#editCommentPopup').on('click', '.updateBlComment', function() {
            var textArea = $(this).closest('.textAreaWrap').find('textarea'),
                rowIndex = textArea.attr('data-rowIndex'),
                commentText = textArea.val(),
                closestDropDown = $('#billLadingCommentGrid tbody tr:eq(' + rowIndex + ')').find(
                    '.blCommentsOptions option:selected');
            $('#billLadingCommentGrid tbody tr:eq(' + rowIndex + ')').find('.blCommentText').val(commentText);
            textArea.val('');
            $(this).closest('.ui-dialog-content').dialog('close');
            if (closestDropDown.val().indexOf('50') === 0) {
                nsBooking.setPayableAt(commentText);
            } else {
            	if (closestDropDown.val().indexOf('60') === 0) {
                    nsBooking.setIssuedAt(commentText);
            	}
            }

        });
        $(document).on('click', '#editCommentPopup .removeIcon', function() {
            $(this).closest('.ui-dialog-content').dialog('close');
        });
        // BL Comments remove event
        $('#billLadingCommentGrid').on('click', ' .rowRemoveIcon', function(e) {
            var bolCommentId = $(this).find('.bolCommentId').val(),
            	comntTimeStamp = $(this).parents('tr').find('#commentTimeStamp').val();
            e.preventDefault();
            e.stopImmediatePropagation();
            if (nsBooking.globalBookingFlag.mainBookingFlag && (nsBooking.globalBookingFlag.mainBookingHeaderFlag)) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                return false;
            }
            rowToRemove = $(this).closest('tr');
            $('#confirmDialogPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '35%',
                open: function() {
                	var titleText = '';
    	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
    	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
    	            	.removeClass('ui-corner-all ui-widget');
    	            titleText = $('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').text();
    	        	titleText = '<i class="fa fa-warning"></i>' + titleText;
    	        	$('#confirmDialogPopup').parent().find('.ui-dialog-titlebar .ui-dialog-title').html(titleText);
    	        	$('.ui-dialog-buttonset button:first-child').addClass('linkButton');
    	        	$('.ui-dialog-buttonset button:last-child').addClass('linkCancelButton');
                    $('#confirmDialogPopup .rowItem').text('');
                    $('#confirmDialogPopup .rowItem').text(
                        'Do you want to delete this bill of lading comment?');
                    $('#confirmDialogPopup').find('form').attr('id', 'confirmBolCommentDelete');
                },
                'commentId': bolCommentId,
                'comntTimeStamp': comntTimeStamp
            });

            $('#confirmDialogPopup').dialog('open');
            $('#confirmDialogPopup').on('submit', '#confirmBolCommentDelete', function(eventHand) {
                var commentId = $('#confirmDialogPopup').dialog('option', 'commentId'),
                	comntTimeStamps = $('#confirmDialogPopup').dialog('option', 'comntTimeStamp'),
                    comment = {};
                eventHand.preventDefault();
                eventHand.stopImmediatePropagation();
                if (commentId) {
                    comment = {
                        id: commentId,
                        timeStamp: comntTimeStamps,
                        moduleType : 'BOOK'
                    };
                    vmsService.vmsApiServiceTypeLoad(function(response) {
                        var deletedRowComm = '',
                            comType = '',
                            comText = '',
                            payableDropDown = [],
                            blIssuedDropDown = [];
                        if (response) {
							if(response.responseDescription === 'concurrency'){
								nsCore.showAlert('Someone else have updated the data since you retrieved the information');
								return false;
							}
                            deletedRowComm = $(rowToRemove).find('.blCommentsOptions option:selected'),
                            comType = deletedRowComm.attr('type'),
                            comText = $(rowToRemove).find('.blCommentText').val();
                            if (comType === '50') {
                                payableDropDown = $('#billFreightPayable');
                                payableDropDown.val('');
                                payableDropDown.find('option[text="' + comText + '"]').remove();
                                rowToRemove.remove();
                            } else if (comType === '60') {
                                blIssuedDropDown = $('#billIssued');
                                blIssuedDropDown.val('');
                                blIssuedDropDown.find('option[text="' + comText + '"]').remove();
                                rowToRemove.remove();
                            } else {
                                rowToRemove.remove();
                            }
                            nsBooking.filterCommentTypeOptions();
                        } else {
                            nsCore.showAlert(nsBooking.errorMsg);
                        }
                    }, nsBooking.BookingBolCmtDlt, 'POST', JSON.stringify(comment));
                } else {
                    rowToRemove.remove();
                }
                // Re rendering drop downs
                nsBooking.filterCommentTypeOptions();
                $(this).closest('.ui-dialog-content').dialog('close');
            });
        });
        $(document).on('change', '.blCommentsOptions', function() {
            var commType = $(this).find('option:selected').attr('type'),
                inputField = $(this).parents('tr').find('.blCommentText'),
                offcideDefaultCommentId = $(this).find('option:selected').attr('com-id'),
                selectBox = $(this).parents('tr').find('.blCommentText'),
                commentType = $(this).find('option:selected').attr('type'),
                bookingId = '',
                comText = '';
            // Re rendering drop downs
            nsBooking.filterCommentTypeOptions();
            $(this).parents('tr').find('.blCommentText').val('');
            if (commType === '10') {
                bookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting').attr('data-bookingid');
                if(!bookingId){
					bookingId=nsCore.appModel.fetchBOLInfo.bookingId
                }
                nsBooking.getFreightParticulars(bookingId, inputField);
            } else {
                $(inputField).removeAttr('disabled');
                $(this).parents('tr').find('.editIcon').removeClass('disabledEditIcon');
            }
            if (offcideDefaultCommentId.indexOf('#b') === -1 && commType !== '10') {
                vmsService.vmsApiService(function(response) {
                    if (response || (response === '')) {
                        comText = response;
                        selectBox.val(comText);
                        if (commentType.indexOf('50') === 0) {
                            nsBooking.setPayableAt(comText);
                        } else {
                            if (commentType.indexOf('60') === 0) {
                                nsBooking.setIssuedAt(comText);
                            }
                        }
                    } else {
                    	nsCore.showAlert(nsBooking.errorMsg);
                    }
                }, nsBooking.bookingGetCmtTxt + offcideDefaultCommentId, 'POST', null);
            }
        });
        billCommentRecord = $('#billLadingCommentGrid tbody tr').first().clone();
        $(document).on('click', '#addNewCommentHist', function(e) {
            var newCommentRow = [];
            e.preventDefault();
            if (nsBooking.globalBookingFlag.mainBookingFlag && (nsBooking.globalBookingFlag.mainBookingHeaderFlag)) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                return false;
            }
            billCommentRecord.find('input,select').val('');
            billCommentRecord.find('.formInputWrap').show();
            billCommentRecord.find('.rowRemoveIcon').removeClass('hide');
            newCommentRow = billCommentRecord.clone();
            newCommentRow.find('select').append(nsBooking.allCommentOptions);
            $('#billLadingCommentGrid').append(newCommentRow);
            // Re-Rendering
            nsBooking.filterCommentTypeOptions();
            // Updating Form Check Flag
            if (e.originalEvent) {
                nsBooking.updateBLDetailsFlag();
            }
        });
        // Make BOL return to search click functions
        $(document).on('click', '.makeBillLading', function(e) {
            var bookingId = '',bookingItemMenuVal = '';
            e.preventDefault();
            if ($(this).hasClass('disabledLink')) {
                return false;
            }
            if($(this).parents("table").hasClass("consignmentInlineMenu")){
            	bookingItemMenuVal = "subBookingItemMenu";
            	 bookingId = $(this).parents("table.consignmentInlineMenu").attr("data-subbookingid");
            }
            else{
            	bookingItemMenuVal = "bookingItemMenu";
            	bookingId = $(this).attr('data-bookingId')
            }
            nsCore.makeBLRedirect(nsBooking, bookingItemMenuVal, bookingId);
        });
    });
})(this.booking, jQuery, this.vmsService, this.core);