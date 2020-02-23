/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBooking, $, vmsService, nsCore, nsBookDoc) {
    var bookingObj = {
        'clearDataGrids': clearDataGrids,
        'getBkdValidationMsg': getBkdValidationMsg,
        'constructLegsFromRoute': constructLegsFromRoute,
        'isNoVoyageSelected': isNoVoyageSelected,
        'updateBillofLading': updateBillofLading,
        'enableDisableAddLegTerm': enableDisableAddLegTerm
        
    };

    function enableDisableAddLegTerm(isLoaded, isReceived, isLoadTerm) { 
        var loadTerminalEnable = '';
    	if($('#isBooking').val() === 'N'){
			loadTerminalEnable = !((isLoaded === 'N'|| isReceived === 'N'));
		} else{
			loadTerminalEnable = !((isLoaded === 'N' || isReceived === 'N') && (isLoadTerm === 'Y'));
		}
    	
    	$('#currentLoadPortTerminal').prop('disabled', loadTerminalEnable);
    	
    	if ($('#isBooking').val() !== 'N') {
            $('#currentDiscPortTerminal').prop('disabled', false);
            $('#nextLoadPortTerminal').prop('disabled', true);
            $('#nextDiscPortTerminal').prop('disabled', true);
        }
    }

   function getCountryFlag(countryCode, countryDesc, countryFlag) {
        if (countryCode !== '' && countryDesc === '') {
            countryFlag = 1;
        }
        if (countryCode === '' && countryDesc !== '') {
            countryFlag = 1;
        }
        return countryFlag;
    }

    function validateCountry(countryCode, countryDesc, countryFlag) {
        var countryCodeCheck = false,
            countryNameCheck = false,
            countryKey=0, nameCount = 0;

        countryFlag = getCountryFlag(countryCode, countryDesc, countryFlag);

        if (countryFlag === 0 && countryCode !== '' && countryDesc !== '') {
            countryFlag = 1;
            for (countryKey in nsBooking.flagCde) {
                if (countryCode === nsBooking.flagCde[countryKey]) {
                    countryCodeCheck = true;
                }
            }
            for (nameCount in nsBooking.flagDsc) {
                if (countryDesc === nsBooking.flagDsc[nameCount]) {
                    countryNameCheck = true;
                }
            }
            if (countryNameCheck && countryCodeCheck) {
                countryFlag = 0;
            }
        }
        return countryFlag;
    }

    function validatePartyFields(alertMsg, partyType, blCode, loadCust, partyName, countryCode, countryDesc, email) {
        var countryFlag = 0,
            emailReg = /^([^\s@]+@[^\s@]+\.[^\s@]+$)?$/;
        if (partyType === null || partyType === '' || partyType === '00') {
            alertMsg = 'Party type is not selected';
        }
        alertMsg = nsBookDoc.validatePartyName(alertMsg, blCode, loadCust, partyName);
        countryFlag = validateCountry(countryCode, countryDesc, countryFlag);
        if (countryFlag === 1) {
            alertMsg = alertMsg + '\nEnter a valid Country';
        }
        if (email) {
            if (!emailReg.test(email)) {
                alertMsg = alertMsg + '\nEnter a valid Email';
            }
        }
        return alertMsg;
    }

    function isInvalidPartyId(partyId) {
        var result = false;
        if (!partyId) {
            result = true;
        }
        return result;
    }

    function populatePartyInfo(obj, alertCheck, listParties) {
        var alertMsg = '',
            partyId, partyType, blCode, loadCust,
            partyName, address, contactName, postalCode, city,
            state, countryCode, countryDesc, email, telePhone,
            mobileNo, customer, eori;

        if (alertCheck) {
            partyId = $(obj).find('#billPartyId').val();
            partyType = $(obj).find('#billParty').val();
            blCode = $(obj).find('#billCode').val();
            loadCust = $(obj).find('#billCode').attr('data-form');
            partyName = $(obj).find('#billNameDesc').val();
            address = $(obj).find('#billAddress').val();
            contactName = $(obj).find('#billContact').val();
            postalCode = $(obj).find('#billPostalCode').val();
            city = $(obj).find('#billCity').val();
            state = $(obj).find('#billState').val();
            countryCode = $(obj).find('#billCountryCode').val();
            countryDesc = $(obj).find('#billCountryCodeDesc').val();
            email = $(obj).find('#billEmail').val();
            eori = $(obj).find('#billEORI').val();
            telePhone = $(obj).find('#billTelephone').val();
            mobileNo = $(obj).find('#billMobile').val();
            customer = {
                companyId: $(obj).find('#blcustomerID').val()
            };
            if (isInvalidPartyId(partyId)) {
                partyId = '0';
            }
            alertMsg = validatePartyFields(alertMsg, partyType, blCode, loadCust, partyName, countryCode, countryDesc,
                email);
            if (alertMsg !== '') {
                nsCore.showAlert(alertMsg);
                alertCheck = false;
                return false;
            }
            listParties.push({
                id: partyId,
                partyType: partyType,
                customer: customer,
                partyName: partyName,
                address: address,
                contactName: contactName,
                postalCode: postalCode,
                city: city,
                state: state,
                country: countryCode,
                email: email,
                eori: eori,
                telephone: telePhone,
                mobileNo: mobileNo,
                timeStamp :$(obj).find('.rmvPartyitem ').attr('data-partytimestamp')? $(obj).find('.rmvPartyitem ').attr('data-partytimestamp') :0 
            });
            return alertCheck;
        }
    }
    //function to validate bill of lading fields
    function validateBOLFields(errMsgDoc, blType, numOriginals, numCopy, MForm, ItnNo, errMsg) {
        var numbers = /^[0-9]+$/,
            alphanumeric = /^[ A-Za-z0-9_@./#&+-]*$/;
        errMsg = (blType === '') ? '\n B/L Type is not selected' : '';

        if (numOriginals === '') {
            errMsg += '\n Number of originals should not be empty';
        }
        if (isValidNumOriginals(numOriginals, numbers)) {
            errMsg += '\n Enter a valid Number of Originals';
        }
        if (numCopy === '') {
            errMsg += '\n Number of Copy should not be empty';
        }
        if (numCopy !== '' && !numCopy.match(numbers)) {
            errMsg += '\n Enter a valid Number of copy';
        }
        errMsg += errMsgDoc;
        if (!MForm.match(alphanumeric)) {
            errMsg += '\n Enter a valid M Form No. ';
        }
        if (MForm.length > 50) {
            errMsg += '\n Enter a valid M Form No.';
        }    
        if (ItnNo.length > 50) {
            errMsg += '\n  Enter a valid ItnNo';
        }
        return errMsg;
    }

    //function to validate numOriginals
    function isValidNumOriginals(numOriginals, numbers) {
        return numOriginals !== '' && !numOriginals.match(numbers);
    }
    
    //function to update bill of lading
    function updateBillofLading(errMsgDoc) {
        var blType = $('#billType').val(),
            numOriginals = $('#billOriginals').val(),
            numCopy = $('#billCopy').val(),
            issuedAt = $('#billIssued option:selected').text(),
            freightPay = $('#billFreightPayable option:selected').text(),
            locVessel = $('#billLocalVessel').val(),
            shipRef = $('#billShippersRef').val(),
            FAgentRef = $('#billFreightAgentRef').val(),
            MForm = $('#billMFormNbr').val(),
            ItnNo = $('#billITNNbr').val(),
            compCode = $('#billDocumentationOfficeId').val(),
            originCode = $('#billOrigin').val(),
            destCode = $('#billDestination').val(),
            loadPort = $('#billloadPort').val(),
            discPort = $('#billDischargePort').val(),
            oceanVessel = $('#billOceanVessel').val(),
            alertCheck = true,
            rowIndex = 0,
            errMsg = '',
            comp = {},
            blHeader = {},
            blInfo = {},
            bolComments = [],
            emptyComment = {},
            listParties = [],
            billofLading = {},
            cus;

        issuedAt = (issuedAt === '--Select--') ? '' : issuedAt;
        freightPay = (freightPay === '--Select--') ? '' : freightPay;
        errMsg = validateBOLFields(errMsgDoc, blType, numOriginals, numCopy, MForm, ItnNo, errMsg);
        if (errMsg.length !== 0) {
            nsCore.showAlert(errMsg);
            $('#billLadingDetailsForm').attr('data-alert', true);
            return false;
        }
        comp = {
            companyCode: compCode
        };
        blHeader = {
            bolType: blType,
            noOfOriginals: (blType === "20") ? 0 : numOriginals,
            noOfCopies: numCopy
        };
        blInfo = {
            issuedAt: issuedAt,
            freightPayableAt: freightPay,
            localVessel: locVessel,
            shippersRef: shipRef,
            agentRef: FAgentRef,
            mformNo: MForm,
            itnNo: ItnNo,
            origin: originCode,
            destination: destCode,
            loadPort: loadPort,
            dischargePort: discPort,
            oceanVessel: oceanVessel
        };
        $('#billLadingCommentGrid tbody tr').each(function() {
            var commentType = $(this).find('.blCommentsOptions :selected').attr('type'),
                comment;
            rowIndex = rowIndex + 1;
            if (commentType) {
                comment = {
                    id: $(this).find('.bolCommentId').val(),
                    commentType: commentType,
                    commentText: $(this).find('.blCommentText').val(),
                    timeStamp: $(this).find('#commentTimeStamp').val() || '0'
                };
                bolComments.push({
                    comment: comment,
                    commentNo: rowIndex
                });
            }
        });
        emptyComment = {
            id: '',
            commentType: '',
            commentText: ''
        };
        if (bolComments.length === 1) {
            bolComments.push({
                comment: emptyComment,
                commentNo: 0
            });
        }
        // Validation for party informations
        $('.billLadingPartyContentWrapper').find('.ladingPartyItem').each(function() {
            alertCheck = alertCheck && populatePartyInfo(this, alertCheck, listParties);
        });
        if (listParties.length === 1) {
            cus = {
                companyId: ''
            };
            listParties.push({
                id: '',
                partyType: '',
                customer: cus,
                partyName: '',
                address: '',
                contactName: '',
                postalCode: '',
                city: '',
                state: '',
                country: '',
                email: '',
                eori: '',
                telephone: '',
                mobileNo: ''
            });
        }
        billofLading = {
            id: $('#billId').val(),
            bolHeader: blHeader,
            bolInfo: blInfo,
            company: comp,
            bolCommentList: bolComments,
            bolPartyList: listParties,
            timeStamp: $('.mainBookingListWrap .subBookContentListCol .singleColItem.activeSubBook').attr('data-boltimestamp'),
            moduleType : 'BOOK' 
        };
        if (alertCheck) {
            if ((!(nsBooking.cpySubSelect)) && (nsBooking.canBookingSaved())) {
                nsBooking.copyBookingBOL = billofLading;
                nsCore.showAlert('Please save at least one sub-booking to save this booking');
                return;
            }
            vmsService.vmsApiServiceType(function(response) {
                $('.preloaderWrapper').hide();
                if (response) {
                    if (response.responseDescription === 'Success') {
                        $('#billLadingDetailsForm').attr('data-dirty', false);
                        nsBooking.globalBookingFlag.mainBlDetailsFlag = false;
                        nsBooking.globalBookingFlag.mainBookingFlag = false;
                        nsBooking.activeBooking();
                        // since accordion should not close on click on
                        $('#billLadingDetailsForm').attr('data-saveInput', true);
                    }  else if(response.responseDescription === 'concurrency'){
    					nsCore.showAlert('Someone else have updated the data since you retrieved the BOL information');
    				}
                } else {
                    nsCore.showAlert(nsBooking.errMsg);
                }
            }, nsBooking.updateBill, 'POST', JSON.stringify(billofLading));
        }
    }

    function clearDataGrids(gridList) {
        $.each(gridList, function(i, obj) {
            if (nsBooking.isDataTableIniialized(obj)) {
                $('#' + obj).dataTable().api().clear().draw();
            }
        });
    }

    function getBkdValidationMsg(msg, totalBookedUnits, numbers) {
        if (totalBookedUnits === '' || totalBookedUnits === null) {
            msg = msg + 'Booked units should not be empty ' + '\n';
        } else if (totalBookedUnits === '0' || totalBookedUnits === '00' || totalBookedUnits === '000' ||
            totalBookedUnits === '0000') {
            msg = msg + 'Can\'t calculate freight when booked units is 0 (zero)' + '\n';
        } else {
            if (!totalBookedUnits.match(numbers)) {
                msg = msg + 'Enter a valid Booked units' + '\n';
            }
        }
        return msg;
    }

    function constructLegsFromRoute() {
        var isCargoEquip = 'N',
            selectedRoute = $('.voyageSelection:checked'),
            equipNo,
            cargoHoldDisabled = $('input:checkbox[name=cargoOnHold]').prop('disabled'),
            newCargoDisabled = $('select[name="attribute1"]').prop('disabled'),
            cargoConsignments = [];
        if ($('#cargoEquipmentNbr').find(':selected').text() === '-- Select --') {
            equipNo = '';
        } else {
            equipNo = $('#cargoEquipmentNbr').find(':selected').text();
        }
        if (($('#cargoEquipmentNbr').is(':enabled'))) {
            isCargoEquip = 'Y';
        }
        cargoConsignments.push({
            cargoOnHold: $('input:checkbox[name=cargoOnHold]:checked').val() === 'on' ? 'Y' : 'N',
            equipNo: equipNo,
            enabledEquipment: isCargoEquip,
            enabledCargoOnHold: cargoHoldDisabled ? 'N' : 'Y',
            enabledNewCargo: newCargoDisabled ? 'N' : 'Y'
        }, {
            cargoOnHold: '',
            equipNo: '',
            enabledEquipment: '',
            enabledCargoOnHold: '',
            enabledNewCargo: ''
        });
        return nsBooking.buildConsLegs(selectedRoute);
    }

    function isNoVoyageSelected() {
        var isViss = $('.routeDetailsWrapper').css('display') !== 'none',
            result = true,
            discPortID = '';
        if (nsBooking.fnoVoyage) {
            return true;
        }
        if (isViss) {
            result = false;
            $('#routeDetailGrid tbody tr #consignmentLegsClass').each(function() {
                discPortID = $(this).attr('data-discportcallvoyageid');
                if (!discPortID || discPortID === 'null') {
                    result = true;
                }
            });
        } else {
            result = false;
        }
        return result;
    }
    $.extend(true, nsBooking, bookingObj);
})(this.booking, jQuery, this.vmsService, this.core, this.bookDoc);