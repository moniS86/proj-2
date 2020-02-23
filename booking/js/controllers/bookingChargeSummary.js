/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {

   
    function loadChargeSmryHelper(resultCheck, variableChargeVal, currencyDtl, chargeValue, grandTotal, curr, variableFreightVal, freightValue,
    				totalBookingFreightUSD, bookingFreightCurr, totalBookingChargeUSD, value, bookingChargeCurr){
        switch(resultCheck[1]) {
            case 'totalBookingFreightUSDMap':
                totalBookingFreightUSD += value;
                bookingFreightCurr += resultCheck[0];
                break;

            case 'totalBookingChargeUSDMap':
                totalBookingChargeUSD += value;
                bookingChargeCurr += resultCheck[0];
                break;

            case 'grandTotalUSDMap':
                grandTotal += value;
                break;

            case 'totalFreightCurrencyMap':
                freightValue = value;
                curr = resultCheck[0];
                curr = setCurr(curr);
                variableFreightVal += '<p class="currDetails"><span>' + freightValue + ' ' + curr + '</span></p>';
                break;

            case 'totalChargeCurrencyMap':
                chargeValue = value;
                chargeValue = nsCore.roundingNumbersCharges(chargeValue, resultCheck[0], "");
                currencyDtl = resultCheck[0];
                variableChargeVal += '<p class="currDetails"><span>' + chargeValue + ' ' + currencyDtl +'</span></p>';
                break;

            default:
                break;
            }
        return {
        		'variableChargeVal': variableChargeVal, 'currencyDtl': currencyDtl, 'chargeValue': chargeValue, 'bookingFreightCurr': bookingFreightCurr,
                'grandTotal': grandTotal, 'curr': curr, 'variableFreightVal': variableFreightVal, 'totalBookingFreightUSD': totalBookingFreightUSD,
                'totalBookingChargeUSD': totalBookingChargeUSD, 'bookingChargeCurr': bookingChargeCurr, 'freightValue': freightValue,
        	};
    }

    function loadChargeSummaryHeaderDetails(response, chargesBookingNo) {
        var responseMap = [],
        	chargeSummaryObj = {
        		'variableChargeVal': '', 'currencyDtl': '', 'chargeValue': '', 'bookingFreightCurr': '',
                'grandTotal': '', 'curr': '', 'variableFreightVal': '', 'freightValue': '', 'totalBookingFreightUSD': '',
                'totalBookingChargeUSD': '', 'bookingChargeCurr': ''
        	},
            couRes = 0,
            responseArr = '',
            key = 0,
            value = '',
            resultCheck = '';
        responseMap = getResponseMap(response, responseMap);

        for (couRes = 0; couRes < responseMap.length; couRes++) {
            responseArr = response.bookingFreightChargeList[couRes];

            for (key in responseArr) {
                if (responseArr.hasOwnProperty(key)) {
                    value = responseArr[key];
                    resultCheck = key.split(' ');
                    chargeSummaryObj = loadChargeSmryHelper(resultCheck, chargeSummaryObj.variableChargeVal, chargeSummaryObj.currencyDtl, chargeSummaryObj.chargeValue,
                        chargeSummaryObj.grandTotal, chargeSummaryObj.curr, chargeSummaryObj.variableFreightVal, chargeSummaryObj.freightValue, chargeSummaryObj.totalBookingFreightUSD,
                        chargeSummaryObj.bookingFreightCurr, chargeSummaryObj.totalBookingChargeUSD, value, chargeSummaryObj.bookingChargeCurr);
                }
            }
        }
        return buildChargeSummaryHeader(chargesBookingNo, chargeSummaryObj.totalBookingFreightUSD, chargeSummaryObj.bookingFreightCurr, chargeSummaryObj.totalBookingChargeUSD,
        		chargeSummaryObj.bookingChargeCurr, chargeSummaryObj.grandTotal, chargeSummaryObj.variableFreightVal, chargeSummaryObj.variableChargeVal);
    }

    function getResponseMap(response, responseMap) {
        var i = 0;

        for (i = 0; i < response.bookingFreightChargeList.length; i++) {
            responseMap.push(response.bookingFreightChargeList[i]);
        }
        return responseMap;
    }

    function setCurr(curr) {
        if (!curr) {
            curr = '';
        }
        return curr;
    }

    function buildChargeSummaryHeader(chargesBookingNo, totalBookingFreightUSD, bookingFreightCurr,
        totalBookingChargeUSD, bookingChargeCurr, grandTotal, variableFreightVal, variableChargeVal) {
        var chargesCommonHdr = '';
        totalBookingFreightUSD = totalBookingFreightUSD ? parseFloat(totalBookingFreightUSD).toFixed(2) : '';
        totalBookingChargeUSD = totalBookingChargeUSD ? parseFloat(totalBookingChargeUSD).toFixed(2) : '';
        grandTotal = grandTotal ? nsCore.roundingNumbersCharges(grandTotal, bookingFreightCurr, "") : '';
        variableFreightVal = '';
        variableChargeVal = '';
        chargesCommonHdr += '<div id="csSubDiv1"><p class="chargeNbr"><span>' + chargesBookingNo
		+ '</span></p></div><div class="columnDiv"><div id="csSubDiv2"><div class="bookFreightVal2">'
		+ '<p class="totalsDetails"> Total Freight</p></div><div class="bookChargeVal2">'
		+ '<p class="totalsDetails">Total Charge</p></div><div class=""><p class="totalsDetails lineColor">'
		+ 'Grand total</p></div></div><div id="csSubDiv3"><div class="bookFreightVal3"><p class="currDetails">'
		+ nsBookDoc.thousandSeparator(totalBookingFreightUSD) + ' ' + bookingFreightCurr
		+ '</p></div><div class="bookChargeVal3"><p class="currDetails">' + nsBookDoc.thousandSeparator(totalBookingChargeUSD) + ' '
		+ bookingChargeCurr + '</p></div><div class="mb10p"><p class="currDetails lineColor"><span>' + nsBookDoc.thousandSeparator(grandTotal)
		+ ' ' + bookingFreightCurr + '</span></p></div></div></div><div id="csSubDiv4"><div class="diffFreightVal">'
		+ variableFreightVal + '</div><div class="diffChargeVal">' + variableChargeVal + '</div></div>';

		return chargesCommonHdr;
    }

    $(document).ready(function() {
        // ***** view booking summary ************/
        $(document).on('click', '#mainViewSummaryLink', function() {
            var chargesBookingId = '',
                timeStamp = '',
                chargesBookingNo = '',
                ajUrl = '';
				$('.chargeSummaryTotals').text('');
				$('.chargeSummaryHdr').text('');
				$('.chargeSummaryCntnt').text('');
				var Y = window.pageYOffset;
				$('#viewSummaryPopup').dialog({
                modal: true,
                resizable: false,
                draggable: false,
                width: '70%',                
                open: function(event, ui) {
                    $(this).parent().css({'top': Y+65});
                },
            });
            chargesBookingId = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
			.attr('data-bookingid');

            timeStamp = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
            .attr('data-timeStamp');

            chargesBookingNo = $('.mainBookingListWrap').find('.subBookContentListCol').find('.ui-selecting')
			.attr('data-filtering');

            $('.mainChargeBookingId').text(chargesBookingNo);

            // charge summary json data
            ajUrl = nsBooking.bookSmry + chargesBookingId + '&isBol=NO' + '&timeStamp=' + timeStamp;
			vmsService.vmsApiService(function(response) {
                if (response) {
                    $('.chargeSummaryTotals').append(nsBookDoc.loadChargeSummaryTotalsGrid(response));
                    $('.chargeSummaryHdr').append(loadChargeSummaryHeaderDetails(response, chargesBookingNo));
                    nsBookDoc.loadChargeSummaryContentGrid(response);

                    $('.chargeSummaryCntnt').append(nsBookDoc.loadChargeSummaryContentGrid(response));

                    $('.chargeSummaryHdr,.chargeSummaryHdr #csSubDiv1,.chargeSummaryHdr #csSubDiv2,'
					+ '.chargeSummaryHdr #csSubDiv3,.chargeSummaryHdr #csSubDiv4')
                    .height(23 *((($('.chargeSummaryHdr').find('#csSubDiv4 .currDetails').length) > 3) ?
                    ($('.chargeSummaryHdr').find('#csSubDiv4 .currDetails').length) : 3) + 10);

				$('.csCntntSubdiv1').each(function() {
                    var val = ($(this).find('#csSubDiv4 .currDetails').length > $(this)
                        .find('#csSubDiv3 .currDetails').length ? $(this)
                        .find('#csSubDiv4 .currDetails').length : $(this)
                        .find('#csSubDiv3 .currDetails').length);

                        $(this).find('.bookChargeVal2').height(23 * ($(this)
                            .find('#csSubDiv3 .currDetails').length - 2) - 10);

                        $(this).height((23 * val) + 20).find('#csSubDiv1,#csSubDiv2,#csSubDiv3,#csSubDiv4')
                            .height((23 * val) + 20);
                    });
                } else {
                    nsCore.showAlert(nsBooking.errorMsg)
                }
            }, ajUrl, 'POST', null);
        });
    });
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);