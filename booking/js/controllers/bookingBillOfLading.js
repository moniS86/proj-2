/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $) {
    function selectComOpt(newCom, type, value){
    	newCom.find('.blCommentsOptions option[type="' + type + '"]').each(function(){
    		if(!value && !($(this).attr('title'))){
    			newCom.find('.blCommentsOptions').val($(this).val());
    			newCom.find('.blCommentText').val(value);
    		}
    		if($(this).attr('title') === value){
    			newCom.find('.blCommentsOptions').val($(this).val());
    			newCom.find('.blCommentsOptions').trigger('change');
    		}
    	});
    }
    //events will be triggered when DOM is ready
    $(document).ready(function() {
        //when account header is clicked
        $(document).on('click', '.accHeader', function() {
            if ($(this).closest('form').prop('id') === 'billLadingDetailsForm'
			&& nsBooking.globalBookingFlag.mainBookingFlag
			&& nsBooking.globalBookingFlag.mainBookingHeaderFlag) {
                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                    nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
                return false;
            }
            if($(this).hasClass('disabledHeader')){
            	return false;
            }
            $(this).find('.accEleIndicator').toggleClass('fa-plus fa-minus');
            $(this).closest('.accElement').find('.accContent').slideToggle();
            if($(this).find('.accEleIndicator').hasClass('fa-minus')) {
            	$(this).addClass('bdrBtmNo');
            } else {
            	$(this).removeClass('bdrBtmNo');
            }
            if ($(this).prop('id') === 'cargoDetailsTab') {
                $(this).attr('data-clicked', 'true');
            }
        });

        //when bill of lading frieght payable is clicked
        $(document).on('change', '#billFreightPayable', function() {
        	var payableC = true, newCom, freightPay = $('#billFreightPayable option:selected').text();
            $('#billLadingCommentGrid tbody tr').each(function() {
                var selectedType = $(this).find('.blCommentsOptions').find('option:selected').attr('type');
                var rowToRemove = [];
                rowToRemove = $(this).closest('tr');
                if (selectedType === '50') {
                    if (freightPay === '--Select--') {
                        freightPay = '';
                        /*test*/
                        var commentId = $(this).find(".bolCommentId").val(),
        				comntTimeStamps = $(this).find("#commentTimeStamp").val(),
        				comment = {};
                        if (commentId) {
            				comment = {
            					id : commentId,
            					timeStamp : comntTimeStamps,
            					moduleType : 'BOOK'
            				};
            				vmsService.vmsApiServiceTypeLoad(function(response){
            					var deletedRowComm,
            						comType,
            						comText,
            						payableDropDown,
            						blIssuedDropDown;
            					if(response){
            						if (response.responseCode === '1498') {
            							nsCore.showAlert('The Documentation Comment was not deleted because the data has changed since you retrieved it');
            							return false;
            						} else if(response.responseDescription === 'concurrency'){
            							nsCore.showAlert('Someone else have updated the data since you retrieved the information');
            							return false;
            						}
            						deletedRowComm = $(rowToRemove).find('.blCommentsOptions option:selected');
            						comType = deletedRowComm.attr('type');
            						comText = $(rowToRemove).find('.blCommentText').val();
            						if (comType === 50) {
            							payableDropDown = $('#billFreightPayable');
            							payableDropDown.val('');
            							payableDropDown.find('option[text="' + comText+ '"]').remove();
            						} else {
            							if (comType === 60) {
            								blIssuedDropDown = $('#billIssued');
            								blIssuedDropDown.val('');
            								blIssuedDropDown.find('option[text="' + comText + '"]').remove();
            							}
            						}
            						rowToRemove.remove();
            					} else{
            						 nsCore.showAlert(nsBooking.errorMsg)
            					}
            				}, nsBooking.BookingBolCmtDlt, 'POST', JSON.stringify(comment))
            			} else {
            				$(this).closest('tr').remove();
            			}
                        /*test*/
                    }
                    selectComOpt($(this), '50', freightPay);
                    payableC = false;
                }
              
            });
            if(payableC){
            	$('#addNewCommentHist').trigger('click');
            	newCom = $('#billLadingCommentGrid tbody tr:last-child');
            	selectComOpt(newCom, '50', freightPay);            
            }
        });

        //when bill of lading issued field is changes
        $(document).on('change', '#billIssued', function() {
        	var issueC = true, newCom, issuedAt = $('#billIssued option:selected').text();
            $('#billLadingCommentGrid tbody tr').each(function() {
                var selectedType = $(this).find('.blCommentsOptions').find('option:selected').attr('type');
                var rowToRemove = [];
                rowToRemove = $(this).closest('tr');
                if (selectedType === '60') {
                    if (issuedAt === '--Select--') {
                        issuedAt = '';
                        /*test*/
                        var commentId = $(this).find(".bolCommentId").val(),
        				comntTimeStamps = $(this).find("#commentTimeStamp").val(),
        				comment = {};
                        if (commentId) {
            				comment = {
            					id : commentId,
            					timeStamp : comntTimeStamps,
            					moduleType : 'BOOK'
            					
            				};
            				vmsService.vmsApiServiceTypeLoad(function(response){
            					var deletedRowComm,
            						comType,
            						comText,
            						payableDropDown,
            						blIssuedDropDown;
            					if(response){
            						if (response.responseCode === '1498') {
            							nsCore.showAlert('The Documentation Comment was not deleted because the data has changed since you retrieved it');
            							return false;
            						} else if(response.responseDescription === 'concurrency'){
            							nsCore.showAlert('Someone else have updated the data since you retrieved the information');
            							return false;
            						}
            						deletedRowComm = $(rowToRemove).find('.blCommentsOptions option:selected');
            						comType = deletedRowComm.attr('type');
            						comText = $(rowToRemove).find('.blCommentText').val();
            						if (comType === 50) {
            							payableDropDown = $('#billFreightPayable');
            							payableDropDown.val('');
            							payableDropDown.find('option[text="' + comText+ '"]').remove();
            						} else {
            							if (comType === 60) {
            								blIssuedDropDown = $('#billIssued');
            								blIssuedDropDown.val('');
            								blIssuedDropDown.find('option[text="' + comText + '"]').remove();
            							}
            						}
            						rowToRemove.remove();
            					} else{
            						nsCore.showAlert(nsBooking.errorMsg);
            					}
            				}, nsBooking.BookingBolCmtDlt, 'POST', JSON.stringify(comment))
            			} else {
            				$(this).closest('tr').remove();
            			}
                        /*test*/
                    }
                    selectComOpt($(this), '60', issuedAt);
                    issueC = false;
                }
            });
            if(issueC){
            	$('#addNewCommentHist').trigger('click');
            	newCom = $('#billLadingCommentGrid tbody tr:last-child');
            	selectComOpt(newCom, '60', issuedAt);
            }
        });
    });

})(this.booking, jQuery);