/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsBookDoc, $, vmsService, nsCore, nsDoc, nsBooking ) {
	var bookingTableObj={},
		routeGridDataTable=[],
		docLink = false;
	if((window.location.href).indexOf('/documentation/') > 0){
		docLink = true;
	}
	if(!nsBooking){nsBooking=nsDoc;}
	  $(document).on('click', '#addNewChargeHist, #addNewChargeQuick', function(e) {
	        var currTable = (e.target.id === 'addNewChargeHist') ? $('#subBookingChargesGrid') : $(this).closest('.subBookingCalculation').find('#quickBookChargesGrid'),
	        	str = '' , selectedCur;
	        selectedCur = (nsBooking.defaultCurrencyCode).substring(1,4)
	        var paymentSelect = $("#mainBookingFreightPayment option:checked").val();
	        var currencySelect = (nsBooking.defaultCurrencyCode).substring(1,4);

	        e.preventDefault();
	        if(currTable.find('tbody').css('display') !== 'none'){
	        str = '<tr role="row" class="'
	            + (currTable.find("tr:last-child").hasClass("odd") ? "even" : "odd") + '">';
	        str += ((e.target.id === 'addNewChargeHist') ? '' : '<td> <span class="icons_sprite rowRemoveIcon chargeRemove"></span></td>');
	        str += '<td><select name="chargeType" id="chargeType" class="chargeType">'
	            + nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, "", true) + "</select></td>";
	        str += '<td><select name="chargeBasis" id="chargeBasis' + (currTable.find("tr").length - 1)
	            + '" class="chargeBasis">'
	            + nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, "", true) + "</select></td>";
	        str += '<td><select name="chargecurrency" id="chargeCurrency" class="chargeCurrency">'
	            + nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions,
	            		selectedCur, true) + '</select></td>';
	        str += '<td class="smallNumeric"> <input type="text" maxlength="15" class="chargeRate numericField" id="chargeRate" '
	            + 'value=""></td><td class="smallNumeric"> <input type="text" '
	            + 'class="chargeQuantity numericField" id="chargeQuantity" value="" disabled=""></td>'
	            + '<td class="smallNumeric"> <input type="text" class="chargeTotal numericField" id="chargeTotal" value="" disabled=""></td>';
	        str += '<td><select name="chargePayment" id="chargePayment" class="chargePayment"><option value="C">Collect'
	            + '</option><option selected value="P">Prepaid</option></select></td><td> <input type="checkbox" '
	            + 'class="chargeGrossFreight" id="chargeGrossFreight" value=""></td>';
	        str += (e.target.id === 'addNewChargeHist') ? '<td> <input type="checkbox" class="chargeSubBookings" id="chargeSubBookings" value=""></td>' : '';
	        str +=	'<td> <input type="text" class="chargeComments w125 clippedTitle" maxlength="80" id="chargeComments" value=""></td>'
	        str +=	(e.target.id === 'addNewChargeHist') ? '<td class="icons"><span class="icons_sprite fa fa-comment-o commentsIcon"></span> <input type="hidden"'
	                + 'class="chargeId" value=""></td> <td class="icons"> <span class="icons_sprite fa fa-remove rowRemoveIcon"></span></td>' : '';
	        str += '</tr>';
	        currTable.find('tbody').append(str);

	        } else {
	        	currTable.find('tbody').show();

	        }
	        currTable.find('tbody').find('tr:last').find('#chargePayment option').each(function(){
	        	if($(this).val() === paymentSelect){
	        		$(this).prop( "selected", true );
	        	}
	        });
	    	 currTable.find('tbody').find('tr:last').find('#chargeCurrency option').each(function(){
	        	if($(this).val() === currencySelect){
	        		$(this).prop( "selected", true );
	        	}
	        });

	        if(e.target.id === 'addNewChargeHist'){
	        	nsBooking.updateSubBookFlag();
	        }
	    });
	  function populateChargeGrid(obj) {
	        var chargeBasisIdArray = [],
	            index = 0;
	        if (!obj.chargeModelList) {
	            obj.chargeModelList = [];
	        }
	        if ($.fn.DataTable.isDataTable($('#subBookingChargesGrid'))) {
	        	$('#subBookingChargesGrid').dataTable().fnClearTable();
	            $('#subBookingChargesGrid').dataTable().fnDestroy();
	        }
	            $('#subBookingChargesGrid').DataTable({
	                'processing': true,
	                'serverSide': false,
	                'bFilter': true,
	                'tabIndex': -1,
	                'bSort': false,
	                'paging': false,
	                'ordering': false,
	                'info': false,
	                'searching': false,
	                'dom': '<t>',
	                'scrollCollapse': true,
	                'data': obj.chargeModelList,
	                'bAutoWidth': false,
	                'drawCallback': function() {
	                    var co = 0,
	                        ind;
	                    chargeBasisIdArray = [];
	                    index = 0;
	                    for (co = 0; co < chargeBasisIdArray.length; co++) {
	                        ind = '#' + chargeBasisIdArray[co];
	                        nsBookDoc.updateSubBookingQuantity($(ind));
	                    }
	                },
	                'fnInitComplete': function() {
	                    var cb = 0,
	                        ind;
	                    for (cb = 0; cb < chargeBasisIdArray.length; cb++) {
	                        ind = chargeBasisIdArray[cb];
	                        nsBookDoc.updateSubBookingQuantity($(ind));
	                    }
	                },
	                'columns': [{
	                    data: 'chargeTypeCode',
	                    'render': function(data) {
	                        var selectr = '<select name="chargeType" id="chargeType" class="chargeType">';
	                        selectr += nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, escape(data), true);
	                        selectr += '</select>';
	                        return selectr;
	                    }
	                }, {
	                    data: 'basisCode',
	                    'render': function(data) {
	                        var selectr = '',
	                            id = 'chargeBasis' + index;
	                        chargeBasisIdArray.push(id);
	                        index = index + 1;
	                        selectr = '<select name="chargeBasis" id=' + id +
	                            ' class="chargeBasis" >';
	                        selectr += nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, data, true);
	                        selectr += '</select>';
	                        return selectr;
	                    }
	                }, {
	                    data: 'currencyCode',
	                    'render': function(data) {
	                        var selectr = '<select name="chargecurrency" id="chargeCurrency" class="chargeCurrency">';
	                        if (data === '') {
	                            data = nsBooking.defaultCurrencyCode.slice(1,-1);
	                        }
	                        selectr += nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, data, true);
	                        selectr += '</select>';
	                        return selectr;
	                    }
	                }, {
	                    data: 'rate',
	                    className: "smallNumeric",
	                    'render': function(data) {
	                        if (data !== 0 && !data) {
	                            data = '';
	                        }
	                        return ' <input type="text" maxlength="15" class="chargeRate numericField" id="chargeRate"'
	                            +'value="' + data + '" />';
	                    }
	                }, {
	                    data: 'quantity',
	                    className: "smallNumeric",
	                    'render': function(data) {
	                    	if (data !== 0 && !data) {
	                            data = '';
	                        }
	                        return ' <input type="text" class="chargeQuantity numericField" id="chargeQuantity"  value="' +
	                            data + '" disabled />';
	                    }
	                }, {
	                    data: 'total',
	                    className: "smallNumeric",
	                    'render': function(data) {
	                        if (data !== 0 && !data) {
	                            data = '';
	                        }
	                        return ' <input type="text" class="chargeTotal numericField" id="chargeTotal"   value="' +
	                            data + '" disabled />';
	                    }
	                }, {
	                    data: 'prepaid',
	                    'render': function(data) {
	                        var selectr = '<select name="chargePayment" id="chargePayment" class="chargePayment">',
	                            preStr = data === 'P' ? ' selected ' : '',
	                            collStr = data === 'C' ? ' selected ' : '';
	                        if ((preStr === '') && (collStr === '')) {
	                            preStr = '';
	                        }
	                        selectr += '<option value="C"' + collStr + '>Collect</option>';
	                        selectr += '<option value="P"' + preStr + '>Prepaid</option>';
	                        selectr += '</select>';
	                        return selectr;
	                    }
	                }, {
	                    data: 'inclInGrossFreight',
	                    'render': function(data) {
	                        if (data === 'Y') {
	                            return ' <input type="checkbox" class="chargeGrossFreight"'
	                            +'id="chargeGrossFreight"  value="' + data + '" checked />';
	                        } else {
	                            return ' <input type="checkbox" class="chargeGrossFreight"'
	                            +'id="chargeGrossFreight" value="' + data + '"  />';
	                        }
	                    }
	                }, {
	                    data: 'inclInSubBooking',
	                    'render': function(data) {
	                        if (data === 'Y') {
	                            return ' <input type="checkbox" class="chargeSubBookings" id="chargeSubBookings"  value="' +
	                                data + '" checked/>';
	                        } else {
	                            return ' <input type="checkbox" class="chargeSubBookings" id="chargeSubBookings"  value="' +
	                                data + '"/>';
	                        }
	                    }
	                }, {
	                    data: 'comment',
	                    'render': function(data) {
	                        // replace double quotes with html code
	                        var comm = data.replace(/'/g, '&#34;');
	                        comm = comm.replace(/'/g, '&#39;');
	                        return ' <input type="text" class="chargeComments w125 clippedTitle" maxlength="80" id="chargeComments"'
	                            +'value="' + comm + '" />';
	                    }
	                }, {
	                    data: 'chargeId',
	                    'class': 'icons',
	                    'render': function(data) {
	                        if (!data) {
	                            data = '';
	                        }
	                        return '<span class="icons_sprite fa fa-comment-o commentsIcon"></span> <input type="hidden"'
	                        +'class="chargeId" value="' + data + '" />';
	                    }
	                }, {
	                	data: 'timeStamp',
	                	'class': 'icons',
	                    'render': function(data) {
	                        return ' <span class="icons_sprite fa fa-remove rowRemoveIcon"></span> <input type="hidden"'
	                            +'class="chargesTimestamp" value="' + data + '" />';
	                    }
	                }]
	            });
	    }
	  
	  $(document).on('submit', '#bookingAddCarriageDetails', function(e) {
		  e.preventDefault();
          var loadPort = nsBookDoc.textNullCheck($('#currentLoadPortCode').val()),
              loadPortInfo = {portCode : loadPort},
              discPort = nsBookDoc.textNullCheck($('#currentDiscPortCode').val()),
              discPortInfo = {portCode : discPort},
              nextLoadPort = nsBookDoc.textNullCheck($('#nextLoadPortCode').val()),
              nextLoadPortInfo = {portCode : nextLoadPort},
              nextDiscPort = nsBookDoc.textNullCheck($('#nextDiscPortCode').val()),
              nextDiscPortInfo = {portCode : nextDiscPort},
              getPossibleSelected = nsBookDoc.populatePortCallId(),
              portCallId = nsBookDoc.getVoyageCallIds('#currentLoadPortCallId'),
              destCallId = nsBookDoc.getVoyageCallIds('#currentDiscPortCallId'),
              portPairDtl = {
                  sourcePortCallID : portCallId,
                  destinationPortCallID : destCallId
              },
              nextPortCallId = nsBookDoc.getVoyageCallIds('#nextLoadPortCallId'),
              nextDestCallId = nsBookDoc.getVoyageCallIds('#nextDiscPortCallId'),
              nextPortPairDtl = {
                  sourcePortCallID : nextPortCallId,
                  destinationPortCallID : nextDestCallId
              },
              consLegId = nsBookDoc.getVoyageCallIds('#nextConsignmentLegId'),
              LegId = nsBookDoc.getVoyageCallIds('#legId'),
              consignmentLegsModel = [],
              consignmentNo = nsBookDoc.textNullCheck($('#consignmentNo').val()),
              loadCurrentTerminal = nsBookDoc.getTerminalObj('#currentLoadPortTerminal'),
              discCurrentTerminal = nsBookDoc.getTerminalObj('#currentDiscPortTerminal'),
              loadNextTerminal = nsBookDoc.getTerminalObj('#nextLoadPortTerminal'),
              discNextTerminal = nsBookDoc.getTerminalObj('#nextDiscPortTerminal'),
              valid = true,
              message = '',
              isBl='',
              vessVoy1 = [], vessVoy2 = [],
              rtObj = {},
              sameVessCode = 'N',
              formData,
              validETD = true,
              validETA = true,
              dateCompMsg='',
              dateCompNextMsg = '',
              bookDocCheck = false,
              bookDocSubobj,
              selectedRow = '',
        	  selectedVessel = '',
        	  selectedNxtVessel='',
        	  selectedNxtVoyage='',
        	  consLegAllocCheck = [],
        	  selectedVoyage = '',
        	  editedLeg, nxtToEditLeg;
          
          if($('#addMainCarriageLegGrid').find('input:checked').length > 0){
        	  if(nsBooking.editLegSDate && nsBooking.editLegSDate!=='null' && $($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=='--'){
		        dateCompMsg = nsCore.compareDates(nsBooking.editLegSDate, $($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html());
	        	if(dateCompMsg!==""  && $($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=="" && nsBooking.editLegSDate!=="") {
					validETD=false;
				}
        	  }
          }

          if($('#addCarriageLegGrid').find('input:checked').length > 0){
        	  if($($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html()!=="--" && $($('#addCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=='--') {
        		  dateCompMsg = nsCore.compareDates($($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html(), $($('#addCarriageLegGrid').find('input:checked').parent().siblings()[2]).html());
        		  if(dateCompMsg!==""  && $($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html()!=="" && $($('#addCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=="") {
        			  validETD=false;
        		  }
        	  } else if(nsBooking.editLegSDate && nsBooking.editLegSDate!=='null' && ($($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[2]).html() === '--') && ($($('#addCarriageLegGrid').find('input:checked').parent().siblings()[2]).html() !== '--')){
        		  dateCompMsg = nsCore.compareDates(nsBooking.editLegSDate, $($('#addCarriageLegGrid').find('input:checked').parent().siblings()[2]).html());
        		  if(dateCompMsg!=="" && $($('#addCarriageLegGrid').find('input:checked').parent().siblings()[2]).html()!=="") {
        			  validETD=false;
        		  }
              }
        	  
        	  if(nsBooking.editLegNxtSDate && nsBooking.editLegNxtSDate!=='null' && ($($('#addCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !== '--')){
        		  dateCompNextMsg = nsCore.compareDates($($('#addCarriageLegGrid').find('input:checked').parent().siblings()[3]).html(), nsBooking.editLegNxtSDate);
        		  if(dateCompNextMsg!=="" && $($('#addCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !== "") {
        			  validETA=false;
        		  }
              } else if(nsBooking.editLegNxtSDate && nsBooking.editLegNxtSDate!=='null' && ($($('#addCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() === '--') && ($($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !== '--')){
            	  dateCompNextMsg = nsCore.compareDates($($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html(), nsBooking.editLegNxtSDate);
        		  if(dateCompNextMsg!=="" && $($('#addMainCarriageLegGrid').find('input:checked').parent().siblings()[3]).html() !== "") {
        			  validETA=false;
        		  }
              }
          }
          e.preventDefault();
      
          if (nsBookDoc.checkAlreadyRoute('#currentDiscPortCode')) {
        	  nsCore.showAlert('This port can not be added since it is already available in route details');
        	  return false;
          }
         
          if(nsDoc){
        	  isBl = ((nsDoc.isAtBlLevel()) ? 'Y' : 'N');
          }
          $('#nextLoadPortCallId').val('');
          $('#nextDiscPortCallId').val('');
          $('#currentLoadPortCallId').val('');
          $('#currentDiscPortCallId').val('');
          if(docLink){
        	  bookDocCheck = !nsDoc.isAtBlLevel();
        	  bookDocSubobj = nsBooking.fectSubBookingObj.consignmentList;
          } else{
        	  bookDocCheck = ($('#isBooking').val() === 'N');
        	  bookDocSubobj = nsBooking.fectSubBookingObj.subBookingModelList
          }
          var mergeConditon=false;
          var mainLegChanges=false
          if($('#addMainCarriageLegGrid tr td input.selectCarriageLeg:checked').attr('data-vessel')===$('#addCarriageLegGrid tr td input.selectNextCarriageLeg:checked').attr('data-vessel')
           && $('#addMainCarriageLegGrid tr td input.selectCarriageLeg:checked').attr('data-voyage')===$('#addCarriageLegGrid tr td input.selectNextCarriageLeg:checked').attr('data-voyage')){
 			mergeConditon=true
           }  
          if($('.mainLegChangeOption.mainLeg').length!==0 && $('.mainLegChangeOption.mainLeg').val()!=='M' && !mergeConditon){
        	  mainLegChanges=true
          }
          var nxtConsType=""
              if($('#consType').val()==='M' || $('#consType').val()==='O'){
            	  nxtConsType='O'
              }else{
            	  nxtConsType='P'
              }
        if (bookDocCheck) {
              consignmentLegsModel.push({
                  id : LegId,
                  consignmentType : (mainLegChanges)?$('.mainLegChangeOption.mainLeg').val():$('#consType').val(),
                  loadPort : loadPortInfo,
                  destinationPort : nextLoadPortInfo,
                  consignmentNo : ((consignmentNo !== 'null') ? consignmentNo : null),
                  portPair : portPairDtl,
                  newLeg : 'N',
                  consignmentId : $('#consignmentId').val(),
                  loadTerminal : loadCurrentTerminal,
                  discTerminal : discCurrentTerminal,
                  // adding for concurrency check.time stamp fpr the leg which
                  // is currently added is taken and sent
                  timeStamp : $('#legTimeStamp').val(),
                  consTimeStamp: nsBooking.subBookingObj.timeStamp 
              }, {
                  id : '0',
                  consignmentType : (mainLegChanges)?$('.mainLegChangeOption.onCarriage').val():nxtConsType,
                  loadPort : nextLoadPortInfo,
                  destinationPort : nextDiscPortInfo,
                  portPair : nextPortPairDtl,
                  consignmentNo : ((consignmentNo !== 'null') ? consignmentNo : null),
                  newLeg : 'Y',
                  consignmentId : $('#consignmentId').val(),
                  loadTerminal : loadNextTerminal,
                  discTerminal : discNextTerminal,
                  consTimeStamp: nsBooking.subBookingObj.timeStamp
              });
          } else {
        	  //booking or BL level
        	 $.each(bookDocSubobj, function(ind) {
            	  if(ind===0){
	            	  if(nsDoc){
	            		  editedLeg = nsDoc.fectSubBookingObj.consignmentLegModelsList.filter(function(data){return data.legId === LegId;})[0]
	                      nxtToEditLeg = nsDoc.fectSubBookingObj.consignmentLegModelsList.filter(function(data){return data.legId === editedLeg.nextConsignmentLegId;})[0]
	            		 
	            		  
	                		
	                	}else{
	                		editedLeg = this.consignmentLegModelList.filter(function(data){return data.consignmentLegId === LegId;})[0]
	                		nxtToEditLeg = this.consignmentLegModelList.filter(function(data){return data.consignmentLegId === editedLeg.nextConsignmentLegId;})[0]
	                		
	                	}
            	  }
            	  consignmentLegsModel.push({
                      id : LegId,
                      consignmentType : (mainLegChanges)?$('.mainLegChangeOption.mainLeg').val():$('#consType').val(),
                      loadPort : loadPortInfo,
                      destinationPort : nextDiscPortInfo,
                      consignmentNo : ((consignmentNo !== 'null') ? consignmentNo : null),
                      portPair : portPairDtl,
                      newLeg : 'N',
                      discharged : 'Y',
                      loaded : 'N',
                      consignmentId : bookDocSubobj[ind].subBookingId || bookDocSubobj[ind].consId,
                      loadTerminal : loadCurrentTerminal,
                      discTerminal : discCurrentTerminal,
                      sameDiscTerm : getDisLoadTerminal(editedLeg,nxtToEditLeg).samDiscTrm,
                      sameLoadTerm : getDisLoadTerminal(editedLeg,nxtToEditLeg).samLoadTrm,
                      timeStamp : $('#legTimeStamp').val(),
                      consTimeStamp : bookDocSubobj[ind].timeStamp
                  // adding for concurrency check.time stamp fpr the leg which
                  // is currently added is taken and sent
                  }, {
                      id : consLegId,
                      consignmentType : (mainLegChanges)?$('.mainLegChangeOption.onCarriage').val():nxtConsType,
                      loadPort : nextLoadPortInfo,
                      destinationPort : nextDiscPortInfo,
                      portPair : nextPortPairDtl,
                      consignmentNo : ((consignmentNo !== 'null') ? consignmentNo : null),
                      newLeg : 'Y',
                      loaded : 'Y',
                      discharged : 'N',
                      consignmentId : bookDocSubobj[ind].subBookingId || bookDocSubobj[ind].consId,
                      loadTerminal : loadNextTerminal,
                      discTerminal : discNextTerminal,
                      sameDiscTerm : getDisLoadTerminal(editedLeg,nxtToEditLeg).samDiscTrmNxtLg,
                      sameLoadTerm : getDisLoadTerminal(editedLeg,nxtToEditLeg).samLoadTrmNxtLg,
                      consTimeStamp : bookDocSubobj[ind].timeStamp
                  });
              });
          }
          rtObj = nsBookDoc.validateEditShowPrev('#currentDiscPortDesc', '#currentDiscPortCode', '#nextDiscPortCode',
          		'#currentLoadPortCode');
          valid = rtObj.valid;
          message = rtObj.message;
          if(nsDoc){
        	  valid= nsDoc.validateOnAddCarriageDetails(getPossibleSelected, portCallId, nextPortCallId);
          }
          if ((!getPossibleSelected && valid) || nsBooking.mainBookingFlag.addGetPossibleVoyage) {
              valid = false;
              message = message + ' Please select a voyage to proceed! ' + '\n';
          }
          if(!validETA){
        	  valid = false;
        	  message= message + " ETA of current leg's Discharge Port must be less than ETD of next leg's Load port " + '\n';
           }
          if(!validETD){
        	  valid = false;
        	  message= message + " ETD of current leg's Load Port must be greater than ETA of previous leg's Discharge port " + '\n';
           }
          vessVoy1 = $('.selectCarriageLeg:checked').closest('tr').find('td:nth-child(2)').text().split('/');
          vessVoy2 = $('.selectNextCarriageLeg:checked').closest('tr').find('td:nth-child(2)').text().split('/');
          if(vessVoy1[0] === vessVoy2[0] && vessVoy1[1] === vessVoy2[1] && vessVoy1[1]){
        	  sameVessCode = 'Y';
          }
          if (valid) {
        	  if(!docLink){
	              formData = {
	                  id : $('#consignmentId').val(),
	                  consignmentNo : ((consignmentNo !== 'null') ? consignmentNo : null),
	                  consignmentLegList : consignmentLegsModel,
	                  newLeg : 'Y',
	                  sameVesselVoyage  : sameVessCode,
	                  booking : $('#isBooking').val(),
	                  bookingID : $('#bookingHeaderId').val(),
	                  destination : discPortInfo,
	                  bol : 'BOOK'
	              };
    		  } else{
				  if(nsDoc.isAtBlLevel()){
					  consignmentLegsModel[0].destinationPort = consignmentLegsModel[1].destinationPort; 
				  }
	              formData = {
	                    id: $('#consignmentId').val(),
	                    consignmentNo: ((consignmentNo !== 'null') ? consignmentNo : null),
	                    consignmentLegList: consignmentLegsModel,
                        newLeg: 'Y',
                        sameVesselVoyage  : sameVessCode,
                        booking: isBl,
                        bookingID: $('#bookingHeaderId').val(),
                        bolID: $('#blId').val(),
                        destination: discPortInfo,
                        bol: 'BL'
	                };
	              
    		  }
        	  //next BL pop up check
        	  selectedRow = $('#addMainCarriageLegGrid tbody tr input[type="radio"].selectCarriageLeg:checked');
              selectedVessel = selectedRow.attr('data-vessel');
              selectedVoyage = selectedRow.attr('data-voyage');
              selectedNxtVessel= $('#addCarriageLegGrid tbody tr input[type="radio"].selectNextCarriageLeg:checked').attr('data-vessel')
              selectedNxtVoyage= $('#addCarriageLegGrid tbody tr input[type="radio"].selectNextCarriageLeg:checked').attr('data-voyage')
              if (!((selectedVessel === $('#currentLoadPortVessel').val()) && (selectedVoyage === $('#currentLoadPortVoyNo').val()))){
            	  if(docLink){
            		  nsDoc.sameVessVoySelected = true;  
            	  }
              } else {
            	  if (docLink){
            		  nsDoc.sameVessVoySelected = false;
            	  }
              }
              if($('.mainLegChangeOption.mainLeg') && $('.mainLegChangeOption.mainLeg').val()!=='M' ){
                	if (!((selectedNxtVessel === $('#currentLoadPortVessel').val()) && (selectedNxtVoyage === $('#currentLoadPortVoyNo').val()))){
              	  if(docLink){
              		  nsDoc.sameVessVoySelected = true;  
              	  }
                } else {
              	  if (docLink){
              		  nsDoc.sameVessVoySelected = false;
              	  }
                }
                	selectedVessel =selectedNxtVessel;
				  	selectedVoyage =  selectedNxtVoyage;                	
                }
              if (($('#isLoadedUnits').val() === 'Y') && $('#currentLoadPortVoyId').val() !== portCallId) {
            	  nsCore.showAlert('Unit is loaded on a previous vessel / voyage, please select the same vessel / voyage');
            	  return false;
              }
              
        	  if(docLink && nsDoc.isCallfromAddLeg && nsDoc.sameVessVoySelected){
        		  nsDoc.addLegFormData = formData;
        		  if($('.activeNavigationItem').hasClass('thrdLevel')){
        			  nsDoc.consLevelCheck = $('.activeNavigationItem').attr('data-subbookingid');
        		  }				  
                  nsDoc.newBlObj.renderPopup(selectedVessel, selectedVoyage, 'addMainLeg', $(this),  consLegAllocCheck);
            	  nsDoc.addLegPortCallId = portCallId;
        	  } else {
        		  nsBookDoc.invokeAddLegAjaxCall(formData, portCallId);
        	  }
  		} else {
  			nsCore.showAlert(message);
  		}
      });
	  function getDisLoadTerminal(editedLeg,nxtToEditLeg){
		  var DisLoaTerminal={};
		  if(!nsDoc){
    		  if(editedLeg){
    			  DisLoaTerminal.samDiscTrm=editedLeg.sameDiscTerm;
    			  DisLoaTerminal.samLoadTrm=editedLeg.sameLoadTerm;
      		}
    		  if(nxtToEditLeg){
    			  DisLoaTerminal.samDiscTrmNxtLg=nxtToEditLeg.sameDiscTerm
    			  DisLoaTerminal.samLoadTrmNxtLg=nxtToEditLeg.sameLoadTerm
    		  }
    	  }else{
    		  if(editedLeg){
    			  DisLoaTerminal.samDiscTrm=editedLeg.uniqueDiscTerm;
    			  DisLoaTerminal.samLoadTrm= editedLeg.uniqueLoadTerm;
    		  }
    		  if(nxtToEditLeg){
    			  DisLoaTerminal.samDiscTrmNxtLg=nxtToEditLeg.uniqueDiscTerm
    			  DisLoaTerminal.samLoadTrmNxtLg=nxtToEditLeg.uniqueLoadTerm
    		  }
    	  }
		  return getDisLoadTerminal;
	  }
	  
	  function addLegSuccessHelper(obj){
		  if (obj === '200') {
          	   $('#addCarriageLegPopup').dialog('close');
          } else {
          	if(obj === '1238' && docLink){
          		nsCore.showAlert('No allocation available for main leg vessel voyage and cannot save BL as Reserve. Please choose another vessel voyage');
          	}
          }
	  }
	  function invokeAddLegAjaxCall(formData, portCallId) {
	        var isCurLegChanged = false;
	        if (($('#isLoadedUnits').val() === 'Y') && $('#currentLoadPortVoyId').val() !== portCallId) {
	            isCurLegChanged = true;
	        }
	        if (!nsBookDoc.checkAlreadyRoute('#currentDiscPortCode')) {
	            if (isCurLegChanged) {
	                nsCore.showAlert(' New discharge port is not served by existing vessel voyage.'
	                    +'Please select another one! ');
	            } else {
	                vmsService.vmsApiServiceLoad(function(obj) {
	                	if (obj) {
	                    	if((nsDoc || '').isCallfromAddLeg && (nsDoc || '').sameVessVoySelected){
	                    		//added for 3957
	                    		if(obj === '18005'){
	                    			$('#nextBLpopup').dialog('close');
	                    			nsCore.showAlert('The sub booking(s) can not be saved because of lack of allocated space. Save as reserve and allocate needed space on the voyage');
	                    		}else if(obj === '1260'){
	                    			$('#nextBLpopup').dialog('close');
	                    			nsCore.showAlert("Cannot issue B/L because there exists issued manifest with cargo not loaded");
	                    		}else if(obj === '27'){
	                    			$('#nextBLpopup').dialog('close');
	                    			$('#editCarriageLegPopup').dialog('close');
	    	                		nsCore.showAlert('Your booking office/customer has no allocation on this voyage');
	                    		} else if(obj !== '1238'){
	                    			nsDoc.newBlObj.makeBlSubmit();
	                    			nsDoc.isCallfromAddLeg = false;
	        						nsDoc.sameVessVoySelected = false;
	                    		}
	        				}else if(obj === '1260'){
                    			$('#nextBLpopup').dialog('close');
                    			nsCore.showAlert("Cannot issue B/L because there exists issued manifest with cargo not loaded");
                    		}else if(obj === '200'){
	        					$('.activeNavigationItem').trigger('click');
	        				} else if(obj === '18005'){
	        					$('#nextBLpopup').dialog('close')
                    			nsCore.showAlert('The sub booking(s) can not be saved because of lack of allocated space. Save as reserve and allocate needed space on the voyage');
                    		} else if(obj === '27'){
                    			if(nsDoc){
                    				$('#nextBLpopup').dialog('close');
                    			}
                    			$('#editCarriageLegPopup').dialog('close');
    	                		nsCore.showAlert('Your booking office/customer has no allocation on this voyage');
                    		}
	        				nsBooking.mainBookingFlag.addGetPossibleVoyage = false;
	        				addLegSuccessHelper(obj);
	                    } else {
	                        nsCore.showAlert(nsBooking.errorMsg);
	                    }
	                }, nsBooking.addLeg, 'POST', JSON.stringify(formData));
	            }
	        } else {
	            nsCore.showAlert(
	                'This port can not be added since it is already available in route details');
	        }
	    }
	  function getTerminalObj(terminalObjField) {
	        var terminalObj = null;
	        if (nsBookDoc.textNullCheck($(terminalObjField).val()) !== '') {
	            terminalObj = {id : $(terminalObjField).val()};
	        }
	        return terminalObj;
	    }
	  function populatePortCallId() {
	        var getPossibleSelected = false;
	        $('#addCarriageLegGrid tbody tr').each(function() {
	            if ($(this).find('.selectNextCarriageLeg').is(':checked')) {
	                $('#nextLoadPortCallId').val($(this).find('.selectNextCarriageLeg')
	                    .attr('data-portcalVoyageIdLoad'));
	                $('#nextDiscPortCallId').val($(this).find('.selectNextCarriageLeg')
	                    .attr('data-portcalVoyageIdDisc'));
	            }
	        });
	        $('#addMainCarriageLegGrid tbody tr').each(function() {
	            if ($(this).find('.selectCarriageLeg').is(':checked')) {
	                getPossibleSelected = true;

	                $('#currentLoadPortCallId').val($(this).find('.selectCarriageLeg')
	                    .attr('data-portcalVoyageIdLoad'));

	                $('#currentDiscPortCallId').val($(this).find('.selectCarriageLeg')
	                    .attr('data-portcalVoyageIdDisc'));
	            }
	        });
	        return getPossibleSelected;
	    }
	  function getVoyageCallIds(portCallIdFields) {
	        var portCallId = 0;
	        if (nsBookDoc.textNullCheck($(portCallIdFields).val()) !== '' && nsBookDoc.textNullCheck($(portCallIdFields).val()) !== 'null') {
	            portCallId = $(portCallIdFields).val();
	        }
	        return portCallId;
	    }
	  
	  function validateEditShowPrev(discDescription, editDischargePort, nextEditDischarge, editLoadPort) {
	        var valid = true,
	            message = '',
	            currentEditDesc = nsBookDoc.textNullCheck($(discDescription).val()),
	            retObj = {};

	        if (nsBookDoc.textNullCheck($(editDischargePort).val()) === '' || currentEditDesc === '') {
	            message = message + 'Discharge port should not be empty.' + '\n';
	            valid = false;
	        }
	        if (nsBookDoc.textNullCheck($(editDischargePort).val()) !== '' && $(editDischargePort)
	                .attr('data-form') === '0'
	            && currentEditDesc !== '') {
	            message = message + 'Enter a valid Discharge port.' + '\n';
	            valid = false;
	        }
	        if (valid) {
	        	retObj = nsBookDoc.isValidCompination(nextEditDischarge, editDischargePort, valid, editLoadPort);
	        	valid = retObj.validateCheck;
	        	message = message + retObj.message;
	        }
	        return {'valid' :valid,
	        		'message':message};
	    }
	  function isValidCompination(nextEditDischarge, editDischargePort, valid, editLoadPort) {
	        var message = '',
	            validateCheck = valid;
	        if (validateCheck) {
	            if (nsBookDoc.comparetionCheck(nextEditDischarge, editDischargePort)) {
	                validateCheck = false;
	                message = message + 'Current and Next leg Discharge ports are equal. This is not a valid combination.'
	                    + '\n';
	            }
	            if ($.trim($(editDischargePort).val()) === $.trim($(editLoadPort).val())) {
	                validateCheck = false;
	                message = message + 'Load and Discharge ports are equal. This is not a valid combination.' + '\n';
	            }
	        }
	        return {'validateCheck' : validateCheck,
	        		'message' : message};
	    }
	    function throwAlert(message, valid) {
	        if (!valid) {
	            nsCore.showAlert(message);
	        }
	    }
	    function comparetionCheck(nextEditDischarge, editDischargePort) {
	        return nsBookDoc.textNullCheck($(nextEditDischarge).val()) !== ''
	            && $.trim($(editDischargePort).val()) === $.trim($(nextEditDischarge).val());
	    }
	    function checkAlreadyRoute(field) {
	        var isAlreadyInroute = false;
	        $('#routeDetailGrid tbody tr').each(function() {
	            if ($(this).find('.selectedRoute').attr('data-loadport') === $(field).val()
	                || $(this).find('.selectedRoute').attr('data-discport') === $(field).val()) {
	                isAlreadyInroute = true;
	                return false;
	            }
	        });
	        return isAlreadyInroute;
	    }
	    
	    function legSelectionToMatchSearch(data, v, value, pLegChecked, oLegChecked, mLegChecked){
	    	if((data === 'P') && !nsBooking.lcFlag){
	    		if($(v).find('.searchedItemValue').text() === value){
	    	        pLegChecked = 'checked';
	    	        nsBooking.lcFlag = true;
	    	    }
	        } else if(data === 'O' && !nsBooking.lcFlag){
	            if($(v).find('.searchedItemValue').text() === value){
	                oLegChecked = 'checked';
	                nsBooking.lcFlag = true;
	            }
	        } else{
	            if(data === 'M' && !nsBooking.lcFlag){
	                if($(v).find('.searchedItemValue').text() === value){
	                    mLegChecked = 'checked';
	                    nsBooking.lcFlag = true;
	                }
	            }
	        }
	    	return {'mLegChecked': mLegChecked, 'oLegChecked': oLegChecked, 'pLegChecked':pLegChecked};
	    }
	    
	    function loadROuteDetailsGrid(routeDetails, isBooking) {
	        var preLoaded = 'N', unitsRowData = [],
	            preReceived = 'N',
	            prevesselVoyage = '',
	            preSameLegVoyage = '',
	            selectedRoute = '',
	            preLoadPortId = '',
	            preAllocStatus = '',
	            preLoadPortCallId = '',
	            isBl='' ;        
	        if(nsDoc){
	        	isBl = ((nsDoc.isAtBlLevel()) ? 'Y' : 'N');
	        }
	        nsBooking.lcFlag = false;
	        $.each(routeDetails, function(ind, leg){
	        	if(!leg.estimatedDeparture && leg.portEstimatedDeparture){
	        		routeDetails[ind].estimatedDeparture=leg.portEstimatedDeparture
	        		routeDetails[ind].estimatedArrival=leg.portEstimatedArrival
	        	}
	        })

	     if ($.fn.DataTable.fnIsDataTable(routeGridDataTable)) {
	    	
	            var ott = TableTools.fnGetInstance('#routeDetailGrid');
	            if ( typeof ott !== 'undefined' && ott !== null) {
	            	ott.fnSelectNone();
	            }
	            $('#routeDetailGrid').dataTable().api().destroy();	            
	        }
	        routeGridDataTable=$('#routeDetailGrid').DataTable({
	            'destroy' : true,
	            'processing' : true,
	            'serverSide' : false,
	            'bFilter' : true,
	            'tabIndex' : -1,
	            'bSort' : false,
	            'ordering' : false,
	            'info' : false,
	            'searching' : false,
	            'dom' : '<t>',
	            'scrollCollapse' : true,
	            'paging' : false,
	            'data' : routeDetails,
	            'bAutoWidth' : false,
	            fnInitComplete : function() {
	                $('th').unbind('keypress');
	            },
	            'columns' : [
	                {
	                    data : 'consignmentType',
	                    'render' : function(data, type, full) {
	                    	if(!full.cargoConsignmentList){full.cargoConsignmentList = [];}
	                        var equipmentNr = '', unitsData = {},
	                            equipmentType = '',
	                            cargoOnholdStr = '',
	                            isEnorDisabled = 'disabled',
	                            legChecked = {'mLegChecked': '', 'oLegChecked': '', 'pLegChecked':''},
	                            oLegChecked = '',
	                        	mLegChecked = '',
	                        	pLegChecked = '',
	                        	equipNo = '',
	                        	consId = 'id' + full.consignmentLegId;
	                        
	                        unitsData.legType = data;
	                        unitsData.legId = full.consignmentLegId;
	                        unitsData.booked = full.bookedUnits || '';
	                        unitsData.received = full.receivedUnits;
	                        unitsData.loaded = full.loadedUnits;
	                        nsBookDoc.cargoConsignmentsVD[consId] = {
	                        		carrierId : full.carrierId || '',
	                        		carrierName : full.carrierName || '',
	                        		carrierRef : full.carrierRef || '',
	                        		departureDate : full.estimatedDeparture || '',
	                        		estimatedArrival : full.estimatedArrival || '',
	                        		shippedOnBoard : full.shippedOnBoard || '',
	                        		transpType : full.transpType || ''
	                        };
	                        if(full.cargoConsignmentList){
	                        	equipNo = (full.cargoConsignmentList[0] || '').equipNumber || '';
	                        	nsBookDoc.cargoConsignmentsSBU[consId] = [{
		                            cargoOnHold : (full.cargoConsignmentList[0] || '').cargoOnHold || '',
		                            equipNo : (!equipNo || (equipNo === '-1')) ? '' : equipNo,
		                            enabledEquipment : (equipNo === '-1') ? 'N' : 'Y',
		                            enabledCargoOnHold : (((full.cargoConsignmentList[0] || '').cargoOnHold === '-1') ? 'N' : 'Y'),
		                            enabledNewCargo : ((( full.cargoConsignmentList[0] || '').newCargo === '-1') ? 'N' : 'Y')
		                	},{
		                		cargoOnHold : '',
		                        equipNo : '',
		                        enabledEquipment : '',
		                        enabledCargoOnHold : '',
		                        enabledNewCargo : ''
		                	}];
	                        }else{
	                        	nsBookDoc.cargoConsignmentsSBU[consId] = [{
		                		cargoOnHold : '',
		                        equipNo : '',
		                        enabledEquipment : '',
		                        enabledCargoOnHold : '',
		                        enabledNewCargo : ''
		                	}];
	                        	
	                        }
	                        
	                        $.each($('.searchedForWrap .searchedItem'), function(i,v){
	                            var switchVar = $(v).attr('data-searchkey');
	                            if($('.searchedForWrap').text().indexOf('LP = ') > -1 && $('.searchedForWrap').text().indexOf('DP = ') > -1 && $('.searchedForWrap').text().indexOf('Trade = ') > -1) {
	                            	switchVar = 'LPDPTR';
	                            } else if($('.searchedForWrap').text().indexOf('LP = ') > -1 && $('.searchedForWrap').text().indexOf('DP = ') > -1 && $('.searchedForWrap').text().indexOf(' Vsl  = ') > -1) {
	                            	switchVar = 'LPDPVO';
	                            } else if($('.searchedForWrap').text().indexOf('LP = ') > -1 && $('.searchedForWrap').text().indexOf('DP = ') > -1){
	                                switchVar = 'LPDP';
	                            } else if ($('.searchedForWrap').text().indexOf(' Vsl  = ') > -1 && $('.searchedForWrap').text().indexOf('Trade = ') > -1){
	                            	switchVar = 'VOTR';
	                            } else if ($('.searchedForWrap').text().indexOf(' Vsl  = ') > -1 && $('.searchedForWrap').text().indexOf('Voy = ') > -1){
	                            	switchVar = 'VOVE';
	                            }
	                            switch(switchVar){
	    	                        case 'LPDPVO': if((data === 'P') && !nsBooking.lcFlag){
	    	                            if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    	                            		$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode &&
	    	                            		$(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode){
	    	                            	legChecked.pLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else if(data === 'O' && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode){
	    	                            	legChecked.oLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else{
	    	                            if(data === 'M' && !nsBooking.lcFlag){
	    	                            	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode){
	    	                                	legChecked.mLegChecked = 'checked';
	    	                                    nsBooking.lcFlag = true;
	    	                                }
	    	                            }
	    	                        }
	    	                        break;
	    	                        case 'LPDPTR': if((data === 'P') && !nsBooking.lcFlag){
	    	                            if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    	                            		$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode &&
	    	                            		$(v).parent().find('.searchedItem[data-searchkey=Trade]').find('.searchedItemValue').text() === full.tradeCode){
	    	                            	legChecked.pLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else if(data === 'O' && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=Trade]').find('.searchedItemValue').text() === full.tradeCode){
	    	                            	legChecked.oLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else{
	    	                            if(data === 'M' && !nsBooking.lcFlag){
	    	                            	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey=Trade]').find('.searchedItemValue').text() === full.tradeCode){
	    	                                	legChecked.mLegChecked = 'checked';
	    	                                    nsBooking.lcFlag = true;
	    	                                }
	    	                            }
	    	                        }
	    	                        break;
	    	                        case 'LPDP': if((data === 'P') && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode){
	    	                            	legChecked.pLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else if(data === 'O' && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode){
	    	                            	legChecked.oLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else{
	    	                            if(data === 'M' && !nsBooking.lcFlag){
	    	                            	if($(v).parent().find('.searchedItem[data-searchkey=LP]').find('.searchedItemValue').text() === full.loadPortCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey=DP]').find('.searchedItemValue').text() === full.discPortCode){
	    	                                	legChecked.mLegChecked = 'checked';
	    	                                    nsBooking.lcFlag = true;
	    	                                }
	    	                            }
	    	                        }
	    	                        break;
	    	                        case 'VOTR': if((data === 'P') && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=Trade]').find('.searchedItemValue').text() === full.tradeCode){
	    	                            	legChecked.pLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else if(data === 'O' && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=Trade]').find('.searchedItemValue').text() === full.tradeCode){
	    	                            	legChecked.oLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else{
	    	                            if(data === 'M' && !nsBooking.lcFlag){
	    	                            	if($(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey=Trade]').find('.searchedItemValue').text() === full.tradeCode){
	    	                                	legChecked.mLegChecked = 'checked';
	    	                                    nsBooking.lcFlag = true;
	    	                                }
	    	                            }
	    	                        }
	    	                        break;
	    	                        case 'VOVE': if((data === 'P') && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=Voy]').find('.searchedItemValue').text() === full.voyageNo){
	    	                            	legChecked.pLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else if(data === 'O' && !nsBooking.lcFlag){
	    	                        	if($(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode &&
	    	                        			$(v).parent().find('.searchedItem[data-searchkey=Voy]').find('.searchedItemValue').text() === full.voyageNo){
	    	                            	legChecked.oLegChecked = 'checked';
	    	                                nsBooking.lcFlag = true;
	    	                            }
	    	                        } else{
	    	                            if(data === 'M' && !nsBooking.lcFlag){
	    	                            	if($(v).parent().find('.searchedItem[data-searchkey="Vsl "]').find('.searchedItemValue').text() === full.vesselCode &&
	    		                        			$(v).parent().find('.searchedItem[data-searchkey=Voy]').find('.searchedItemValue').text() === full.voyageNo){
	    	                                	legChecked.mLegChecked = 'checked';
	    	                                    nsBooking.lcFlag = true;
	    	                                }
	    	                            }
	    	                        }
	    	                        break;
	                                case 'Vsl ':
	                                	legChecked = legSelectionToMatchSearch(data, v, full.vesselCode,legChecked.pLegChecked,legChecked.oLegChecked,legChecked.mLegChecked);
	    	                            break;
	                                case 'LP':
	                                	legChecked = legSelectionToMatchSearch(data, v, full.loadPortCode,legChecked.pLegChecked,legChecked.oLegChecked,legChecked.mLegChecked);
	    	                            break;
	                                case 'DP':
	                                	legChecked = legSelectionToMatchSearch(data, v, full.discPortCode,legChecked.pLegChecked,legChecked.oLegChecked,legChecked.mLegChecked);
	    	                            break;
	                                case 'Trade':
	                                	legChecked = legSelectionToMatchSearch(data, v, full.tradeCode,legChecked.pLegChecked,legChecked.oLegChecked,legChecked.mLegChecked);
	                                	break;
	                                default: break;
	                            }
	                        });
	                        
	                        mLegChecked = legChecked.mLegChecked;
	                        oLegChecked = legChecked.oLegChecked;
	                        pLegChecked = legChecked.pLegChecked;
	     
	                        if(!mLegChecked && !nsBooking.lcFlag){
	                        	mLegChecked = (!pLegChecked && !oLegChecked) ? 'checked' : '';
	                        }
	                        if (full.cargoConsignmentList !== null) {
	                            $.each(full.cargoConsignmentList, function(k, cargoConsignmentModel) {
	                                if (cargoConsignmentModel.cargoOnHold === '-1') {
	                                    cargoOnholdStr = '-1';
	                                    return false;
	                                } else {
	                                    cargoOnholdStr = cargoConsignmentModel.cargoOnHold;
	                                    return false;
	                                }
	                            });
	                            $.each(full.cargoConsignmentList, function(k, cargoConsignmentModel) {
	                                if (cargoConsignmentModel.equipNumber === '-1') {
	                                    equipmentNr = '-1';
	                                    return false;
	                                } else {
	                                    equipmentNr = cargoConsignmentModel.equipNumber;
	                                    equipmentType = cargoConsignmentModel.equipType;
	                                    return false;
	                                }
	                            });
	                        }
	                        if (isBooking === 'N') {
	                            isEnorDisabled = 'Enabled';
	                        }
	                        if (data === 'P') {
	                        	unitsData.selLeg = pLegChecked;
	                        	unitsRowData.push(unitsData);
	                            displayHideThirdParty(full.vesselVoyage);
	                            return '<input type="radio" '+ pLegChecked +' name="selectedRoute" ' + isEnorDisabled
	                                + ' data-receivedUnits="' + full.receivedUnits + '" data-loadedUnits="'
	                                + full.loadedUnits + '" data-isLoaded="' + (full.loaded || full.loadedStatus) + '" data-isReceived="' + (full.received || full.receivedStatus) + '"  data-isDischarged="'
	                                + (full.discharged || full.dischargedStatus) + '" data-estimArrDate="' + full.estimatedArrival
	                                + '" data-estimDepDate="' + full.estimatedDeparture + '"   data-consNo="'
	                                + full.consignmentNo + '" data-cargoEquipmentNbr="' + equipmentNr
	                                + '" data-equipType="' + equipmentType + '" data-comment="' + full.comment
	                                + '" data-isFirm="' + full.firm + '" data-transpType="' + full.transpType
	                                + '"  data-carrierName="' + full.carrierId + '"  data-crName="' + full.carrierName + '" data-carrierRef="'
	                                + full.carrierRef + '" class="selectedRoute margLeft40per" data-vesselvoyage="'
	                                + full.vesselVoyage + '" value="' + data + '"  data-loadport="' + full.loadPortCode
	                                + '" data-loadname="' + full.loadPortName + '"  data-discname="'
	                                + full.discPortName + '" data-discPort="' + full.discPortCode + '" data-tradeId="'
	                                + full.tradeId + '" data-vesselId="' + full.vesselId + '" data-voyageid="'
	                                + full.loadVoyageId + '" data-consignmentLegId="' + full.consignmentLegId 
	                                + '" data-vessel="' + full.vesselCode + '" data-voyage="' + full.voyageNo + '" data-portcalvoyageidload="' + full.loadPortCallVoyageId
	                                + '" data-timestamp="' + full.timeStamp +'" data-conslegstatus="'+ ((isBl==='Y')?full.consLegStatus:full.legStatus)+'" data-cargoOnHold="' + cargoOnholdStr
	                                + '" data-userDocOffice="' + full.userDocOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound
	                                + '" data-isHoeghCompany="' + full.isHoeghCompany + '" >';
	                        } else if(data === 'O'){
	                        	unitsData.selLeg = oLegChecked;
	                        	unitsRowData.push(unitsData);
	                        	displayHideThirdParty(full.vesselVoyage);
	                            return '<input type="radio" '+ oLegChecked +' name="selectedRoute" ' + isEnorDisabled
	                                + ' data-receivedUnits="' + full.receivedUnits +'" data-isReceived="' + (full.received || full.receivedStatus) + '" data-loadedUnits="'
	                                + full.loadedUnits + '" data-isLoaded="' + (full.loaded || full.loadedStatus) + '"  data-isDischarged="'
	                                + (full.discharged || full.dischargedStatus) + '" data-estimArrDate="' + full.estimatedArrival
	                                + '" data-estimDepDate="' + full.estimatedDeparture + '"   data-consNo="'
	                                + full.consignmentNo + '" data-cargoEquipmentNbr="' + equipmentNr
	                                + '" data-equipType="' + equipmentType + '" data-comment="' + full.comment
	                                + '" data-isFirm="' + full.firm + '" data-transpType="' + full.transpType
	                                + '"  data-carrierName="' + full.carrierId + '"  data-crName="' + full.carrierName + '" data-carrierRef="'
	                                + full.carrierRef + '" class="selectedRoute margLeft40per" data-vesselvoyage="'
	                                + full.vesselVoyage + '" value="' + data + '"  data-loadport="' + full.loadPortCode
	                                + '" data-loadname="' + full.loadPortName + '"  data-discname="'
	                                + full.discPortName + '" data-discPort="' + full.discPortCode + '" data-tradeId="'
	                                + full.tradeId + '" data-vesselId="' + full.vesselId + '" data-voyageid="'
	                                + full.loadVoyageId + '" data-consignmentLegId="' + full.consignmentLegId
	                                + '" data-vessel="' + full.vesselCode + '" data-voyage="' + full.voyageNo + '" data-portcalvoyageidload="' + full.loadPortCallVoyageId
	                                + '"data-timestamp="' + full.timeStamp  +'" data-conslegstatus="'+((isBl==='Y')?full.consLegStatus:full.legStatus)+'" data-cargoOnHold="' + cargoOnholdStr
	                                + '" data-userDocOffice="' + full.userDocOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound 
	                                + '" data-isHoeghCompany="' + full.isHoeghCompany + '" >';
	                        } else {
	                            if (isBooking === 'N') {
	                                nsBooking.updateConsNo(full.consignmentNo, full.legStatus);
	                            }
	                            unitsData.selLeg = mLegChecked;
	                            unitsRowData.push(unitsData);
	                            displayHideThirdParty(full.vesselVoyage);
	                            return '<input type="radio" '+ mLegChecked +' name="selectedRoute" ' + isEnorDisabled
	                                + ' class="selectedRoute margLeft40per" data-receivedUnits="' + full.receivedUnits
	                                + '" data-loadedUnits="' + full.loadedUnits + '" data-isLoaded="' + (full.loaded || full.loadedStatus)
	                                + '"  data-isDischarged="' + (full.discharged || full.dischargedStatus) + '" data-estimArrDate="'
	                                + full.estimatedArrival + '"  data-estimDepDate="' + full.estimatedDeparture
	                                + '"  data-consNo="' + full.consignmentNo + '" data-cargoEquipmentNbr="'
	                                + equipmentNr + '" data-equipType="' + equipmentType + '" data-comment="'
	                                + full.comment + '" data-isFirm="' + full.firm + '"  data-crName="' + full.carrierName + '" data-transpType="'
	                                + full.transpType + '"  data-carrierName="' + full.carrierId +'" data-isReceived="' + (full.received || full.receivedStatus)
	                                + '" data-carrierRef="' + full.carrierRef + '"  data-vesselvoyage="'
	                                + full.vesselVoyage + '" value="' + data + '"  data-loadport="' + full.loadPortCode
	                                + '" data-loadname="' + full.loadPortName + '"  data-discname="'
	                                + full.discPortName + '" data-tradeId="' + full.tradeId + '" data-discPort="'
	                                + full.discPortCode + '" data-consignmentLegId="'
	                                + full.consignmentLegId + '" data-voyageid="' + full.loadVoyageId
	                                + '" data-vessel="' + full.vesselCode + '" data-voyage="' + full.voyageNo + '" data-portcalvoyageidload="' + full.loadPortCallVoyageId
	                                + '" data-vesselId="' + full.vesselId + '"data-timestamp="' + full.timeStamp
	                                +'" data-conslegstatus="'+((isBl==='Y')?full.consLegStatus:full.legStatus)+'" data-cargoOnHold="' + cargoOnholdStr 
	                                + '" data-userDocOffice="' + full.userDocOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound 
	                                + '" data-isHoeghCompany="' + full.isHoeghCompany + '" >';
	                        }
	                    }
	                },
	                {
	                    data : 'vesselVoyage',
	                    'render': function (data){
	                    	return vesselVoyDisplay(data);
	                    }
	                },
	                {
	                    data : 'tradeCode'
	                },
	                {
	                    data : 'loadPortCode'
	                },
	                {
	                    data : 'estimatedDeparture',
	                    'render': function (data){
	                    	return data ? data.split(' ')[0] : '';
	                    }
	                },
	                {
	                    data : 'discPortCode'
	                },
	                {
	                    data : 'estimatedArrival',
	                    'render': function (data){
	                    	return data ? data.split(' ')[0] : '';
	                    }
	                },
	                {
	                    data : 'firm',
	                    'render' : function(data, type, full) {
	                        var isEnorDis = 'disabled',
	                            selectr = '<select name="allocStatusType" id="allocStatusType" class="allocStatusType" ';
	                        if(!data){data=full.allocationStatus}
	                        isEnorDis = getEnableDisable(isBooking, full.received, full.loaded, full.discharged, isEnorDis);
	                        selectr += isEnorDis + '   >';
	                        selectr += nsBookDoc.generateSelect(nsBooking.allocArray, data ? data : 'N', true);
	                        selectr += '</select>';
	                        return selectr;
	                    }
	                },
	                {
	                    data : 'consignmentType',
	                    'render' : function(data, type, full) {
	                        var isMainDisabled = 'Enabled';
	                        isMainDisabled = getEnableDisable(isBooking, full.received, full.loaded, full.discharged,
	                                            isMainDisabled);
	                        if (data === 'M') {
	                            return '<input type="radio" checked="checked" name="mainLeg" class="mainLeg margLeft44per" value="mainLeg" '
	                                + isMainDisabled
	                                + ' > <input type="hidden" class="consignmentLegsClass" name="consignmentLegsClass"'
	                                + 'id="consignmentLegsClass" data-isBooking="' + isBooking + '" data-consType="'
	                                + full.consignmentType + '" data-consignmentNo="' + full.consignmentNo + '" data-id="'
	                                + full.consignmentLegId + '" data-nextConsignmentId="' + full.nextConsignmentLegId
	                                + '" data-consignmentId="' + full.consignmentId + '" data-nextLoadPortCallVoyageId="'
	                                + full.nextLoadPortCallVoyId + '" data-nextDiscPortCallVoyageId="' + full.nextDiscPortCallVoyId
	                                + '"   data-nextLoadPortCode="' + full.nextLoadPortCode + '" data-nextLoadPortDesc="'
	                                + full.nextLoadPortDesc + '" data-nextDiscPortCode="' + full.nextDiscPortCode
	                                + '"  data-nextDiscPortDesc="' + full.nextDiscPortDesc + '" data-loadPortCallVoyageId="'
	                                + (full.sourcePortCallID ? full.sourcePortCallID : full.loadPortCallVoyageId) + '" data-discPortCallVoyageId="' 
	                                + (full.destinationPortCallID ? full.destinationPortCallID :full.discPortCallVoyageId)
	                                + '" data-consType="' + full.consignmentType + '"   data-loadPort="' + full.loadPortCode
	                                + '" data-loadPortName="' + full.loadPortName + '" data-discPort="' + full.discPortCode
	                                + '" data-discPortName="' + full.discPortName + '"  data-vesselvoyage="' + full.vesselVoyage
	                                + '" data-voyageid="' + full.loadVoyageId + '" data-vesselId="' + full.vesselId  +'" data-conslegstatus="'+((isBl==='Y')?full.consLegStatus:full.legStatus)+'"> ';
	                        } else {
	                            return '<input type="radio" name="mainLeg" class="mainLeg margLeft44per" value="mainLeg" ' + isMainDisabled
	                                + '> <input type="hidden" class="consignmentLegsClass" name="consignmentLegsClass"'
	                                + 'id="consignmentLegsClass" data-isBooking="' + isBooking + '" data-consType="'
	                                + full.consignmentType + '" data-consignmentNo="' + full.consignmentNo
	                                + '" data-id="' + full.consignmentLegId
	                                + '" data-nextConsignmentId="' + full.nextConsignmentLegId
	                                + '" data-consignmentId="' + full.consignmentId
	                                + '" data-nextLoadPortCallVoyageId="' + full.nextLoadPortCallVoyId
	                                + '" data-nextDiscPortCallVoyageId="' + full.nextDiscPortCallVoyId
	                                + '" data-nextLoadPortCode="' + full.nextLoadPortCode + '" data-nextLoadPortDesc="'
	                                + full.nextLoadPortDesc + '" data-nextDiscPortCode="' + full.nextDiscPortCode
	                                + '"  data-nextDiscPortDesc="' + full.nextDiscPortDesc
	                                + '" data-loadPortCallVoyageId="' + (full.sourcePortCallID ? full.sourcePortCallID : full.loadPortCallVoyageId) + '" data-discPortCallVoyageId="' 
	                                + (full.destinationPortCallID ? full.destinationPortCallID :full.discPortCallVoyageId) + '" data-consType="'
	                                + full.consignmentType + '"   data-loadPort="' + full.loadPortCode
	                                + '" data-loadPortName="' + full.loadPortName + '" data-discPort="'
	                                + full.discPortCode + '" data-discPortName="' + full.discPortName
	                                + '"  data-vesselvoyage="' + full.vesselVoyage + '" data-voyageid="'
	                                + full.loadVoyageId + '" data-vesselId="' + full.vesselId +'" data-conslegstatus="'+((isBl==='Y')?full.consLegStatus:full.legStatus)+'" > ';
	                        }
	                    }
	                },
	                {
	                    data : 'wayCargo',
	                    'render' : function(data, type, full) {
	                        if (data === 'Y') {
	                            return '<input type="checkbox" ' 
	                                + ' checked name="wayCargo" class="wayCargo margLeft44per" value="' + data + '" data-isLoaded="'
	                                + full.loaded + '" data-isReceived="' + full.received + '"  data-isDischarged="'
	                                + full.discharged + '">';
	                        } else {
	                            return '<input type="checkbox" ' 
	                                + ' name="wayCargo"  class="wayCargo margLeft44per" value="' + data + '" data-isLoaded="'
	                                + full.loaded + '" data-isReceived="' + full.received + '" >';
	                        }
	                    }
	                },	                
	                {
	                    data : 'actionList',
	                    'render' : function(data, type, full) {
	                        var actionsCont = '', linkIcon = '';
	                        $.each(data, function(i, link) {
	                        	switch(link){
	                        		case 'add': linkIcon = 'fa-plus'; 
	                        					break;
	                        		case 'edit': linkIcon = 'fa-pencil';
	                        					 break;
	                        		case 'remove': linkIcon = 'fa-remove';
	                        					   break;
	                        		default: linkIcon = '';
	                        	}
	                            actionsCont += '<a href="javascript:void(0);" data-isPreReceived="' + preReceived
	                                + '" data-isPreLoaded="' + preLoaded + '" data-isNextReceived="'
	                                + (full.nextReceivedStatus || full.nextReceived) + '" data-isNextLoaded="' + (full.nextLoadedStatus || full.nextLoaded)
	                                + '" data-isLoaded="' + (full.loaded || full.loadedStatus) + '" data-isReceived="' + (full.received || full.receivedStatus)
	                                + '" data-isDischarged="' + (full.discharged || full.dischargedStatus) + '" data-isNextLoadTerm="' + full.nextAvailableLoadTerm + '" data-isNextDiscTerm="'
	                                + full.nextAvailableDiscTerm + '" data-isSameLoadTerm="' + (full.uniqueLoadTerm || full.sameLoadTerm)
	                                + '" data-isSameDiscTerm="' + (full.uniqueDiscTerm || full.sameDiscTerm) + '" data-nextLoadTerminal="'
	                                + full.nextLoadTerminalId + '" data-nextDiscTerminal="' +  full.nextDiscTerminalId + '" data-isNextdischarged="' + full.nextDischarged
	                                + '"  data-discTerminal="' + full.discTerminalId + '"  data-loadTerminal="'
	                                + full.loadTerminalId + '" data-isBooking="' + isBooking + '" data-consType="'
	                                + full.consignmentType + '" data-consignmentNo="' + full.consignmentNo
	                                + '" data-id="' + (full.legId || full.consignmentLegId) + '" data-nextConsignmentId="'
	                                + full.nextConsignmentLegId + '" data-consignmentId="' + full.consignmentId
	                                + '" data-nextLoadPortCallVoyageId="' + full.nextLoadPortCallVoyId + '" data-allocStatus="' + (full.allocationStatus || full.firm)
	                                + '" data-nextDiscPortCallVoyageId="' + full.nextDiscPortCallVoyId + '" data-preAllocStatus="' + preAllocStatus
	                                + '"   data-nextLoadPortCode="' + full.nextLoadPortCode + '" data-NextConsType ="' + (full.nextConsType || full.nextConsignmentType)
	                                + '" data-nextLoadPortDesc="' + full.nextLoadPortDesc + '" data-nextDiscPortCode="'
	                                + full.nextDiscPortCode + '"  data-nextDiscPortDesc="' + full.nextDiscPortDesc + '" data-preLoadPortCallVoyageId="' + preLoadPortCallId
	                                + '" data-loadPortCallVoyageId="' + (full.loadPortCallVoyageId || full.sourcePortCallID)
	                                + '" data-discPortCallVoyageId="' + (full.destinationPortCallID || full.discPortCallVoyageId) + '" data-consType="'
	                                + full.consignmentType + '"   data-loadPort="' + full.loadPortCode
	                                + '" data-loadPortName="' + full.loadPortName + '" data-discport="'
	                                + full.discPortCode + '" data-discPortName="' + full.discPortName + '" class="'
	                                + link + 'Leg m_l_10 fa ' + linkIcon + '" data-vessel="' + full.vesselCode + '" data-voyage="'
	                                + full.voyageNo + '" data-vesselvoyage="' + full.vesselVoyage + '"data-preLoadPortCallId="' + preLoadPortId
	                                + '"  data-preVesselvoyage="' + prevesselVoyage + '" data-voyageid="'
	                                + full.loadVoyageId + '" data-vesselId="' + full.vesselId + '" data-sameVoyageId="'
	                                + preSameLegVoyage + '"  data-curSameVoyageId="' + full.sameLegVoyageId +'" data-conslegstatus="'+((isBl==='Y')?full.consLegStatus:full.legStatus)
	                                + '" data-userDocOffice="' + full.userDocOffice + '"  data-bloutBound="' + full.bloutBound + '"  data-blinBound="' + full.blinBound 
	                                + '" data-isHoeghCompany="' + full.isHoeghCompany + '" ></a>';
	                        });
	                        prevesselVoyage = full.vesselVoyage;
	                        preLoaded = full.loaded || full.loadedStatus;
	                        preReceived = full.received || full.receivedStatus;
	                        preSameLegVoyage = full.sameLegVoyageId;
	                        preLoadPortId = full.loadPortCode;
	                        preAllocStatus = (full.allocationStatus || full.firm);
	                        preLoadPortCallId = (full.loadPortCallVoyageId || full.sourcePortCallID);
	                        return '<div class="legField">' + actionsCont.slice(0, -1) + '</div>';
	                    }
	                }
	            ]
	        });
	        if(nsDoc && (nsCore.appModel.bookDocSearchCriteria.manifest==="Yes" || nsCore.appModel.bookDocSearchCriteria.manifest==="No"
		        || nsCore.appModel.bookDocSearchCriteria.loadPortCode || nsCore.appModel.bookDocSearchCriteria.dischargePortCode)){
	        	$($('.routeDetailGrid tbody tr td input[name="selectedRoute"]')[legSelectionOnLoad(routeDetails)]).attr('checked', true)
	        }
        	nsBooking.loadUnitsTable(unitsRowData);
        	nsBooking.legDetailsDisble();
        	if ($('.selectedRoute:checked').val() === 'M') {
            	nsBookDoc.panelActions('freightsAndCharges', 'open');
            	$('.freightsAndCharges .accHeader').removeClass('disabledHeader');
            } else {
            	nsBookDoc.panelActions('freightsAndCharges', 'close');
            	$('.freightsAndCharges .accHeader').addClass('disabledHeader');
            }
	        selectedRoute = $('.selectedRoute:checked');
	        $('.thrdLevel.activeNavigationItem').attr('data-currentlegid', $('.selectedRoute:checked').attr('data-consignmentlegid'));
            $('#bookingAllocStatus').val(selectedRoute.parent().parent().find('.allocStatusType').val());
	        nsBooking.loadRouteInfo(selectedRoute);
	        nsBooking.mainRoutekey = '';
	        if(nsCore.appModel.selected==='bl'){
				nsDoc.statusBasedDisable('BL', "");
	        }else{
	        	nsDoc.eqpNoSts = true;
	        	nsDoc.equipStatus = ($('#cargoEquipmentNbr').attr('disabled') === 'disabled'); 
	        	nsDoc.statusBasedDisable('Consignment', "");
	        }
	        nsBookDoc.updateRouteGridOnDiffRouteDetail("Y");
	    }
	    function legSelectionOnLoad(routeDetails){
	    	var searchString="", responceString="", matchArr=[], mainLegIndex=-1;
	    	$.each(routeDetails, function(index, routeDetail){
	    		searchString= (nsCore.appModel.bookDocSearchCriteria.loadPortCode+nsCore.appModel.bookDocSearchCriteria.dischargePortCode+
		    	nsCore.appModel.bookDocSearchCriteria.tradeCode	+nsCore.appModel.bookDocSearchCriteria.vesselCode+nsCore.appModel.bookDocSearchCriteria.voyageNo +
		    	getMeanifestedStr(routeDetail).srchString+getCargoStatus(routeDetail).scrLoaded
		    	+getCargoStatus(routeDetail).scrReceived);
		    	
		    	responceString=((nsCore.appModel.bookDocSearchCriteria.loadPortCode ? routeDetail.loadPortCode : nsCore.appModel.bookDocSearchCriteria.loadPortCode)
		    			+ (nsCore.appModel.bookDocSearchCriteria.dischargePortCode ? routeDetail.discPortCode : nsCore.appModel.bookDocSearchCriteria.dischargePortCode)
		    			+ (nsCore.appModel.bookDocSearchCriteria.tradeCode ? routeDetail.tradeCode : nsCore.appModel.bookDocSearchCriteria.tradeCode)
		    			+ (nsCore.appModel.bookDocSearchCriteria.vesselCode ? routeDetail.vesselCode : nsCore.appModel.bookDocSearchCriteria.vesselCode)
		    			+ (nsCore.appModel.bookDocSearchCriteria.voyageNo ? routeDetail.voyageNo : nsCore.appModel.bookDocSearchCriteria.voyageNo)
		    			+ (getMeanifestedStr(routeDetail).respString+getCargoStatus(routeDetail).respLoaded+getCargoStatus(routeDetail).respReceived));
	    		if(routeDetail.consignmentType==="M"){
	    			mainLegIndex=index;
	    		}
	    		if(searchString===responceString){
	    			matchArr.push(index);
	    		}
	    	})
	    	if(matchArr.length===0 || matchArr.length>1){
	    		return mainLegIndex
	    	}else{
	    		return matchArr[0];
	    	}
	    }
	    function getMeanifestedStr(routeDetail){
	    	var srchString="", respString="";
	    	if(nsCore.appModel.bookDocSearchCriteria.manifest==="Yes" && (routeDetail.consLegStatus === "50" || routeDetail.consLegStatus === "51")){
	    		srchString="5051";
	    		respString="5051"
	    		
	    	}else  if(nsCore.appModel.bookDocSearchCriteria.manifest==="No" && (routeDetail.consLegStatus === "50" || routeDetail.consLegStatus === "51")){
	    		srchString="";
	    		respString="5051"
	    	}
	    	return {srchString : srchString, respString : respString}
	    }
	    function getCargoStatus(routeDetail){
	    	var scrLoaded="", scrReceived="", respLoaded="", respReceived="";
	    	if(nsCore.appModel.bookDocSearchCriteria.cargoStatus==="4"){
	    		scrLoaded='Y'
	    	}
	    	if(nsCore.appModel.bookDocSearchCriteria.cargoStatus==="5"){
	    		scrLoaded='N'
	    	}
	    	if(nsCore.appModel.bookDocSearchCriteria.cargoStatus==="2"){
	    		scrReceived='Y'
	    	}
	    	if(nsCore.appModel.bookDocSearchCriteria.cargoStatus==="1"){
	    		scrReceived='N'
	    	}
	    	if(scrLoaded===""){
	    		respLoaded=""
	    	}else{
	    		respLoaded=routeDetail.loadedStatus
	    	}
	    	if(scrReceived===""){
	    		respReceived=""
	    	}else{
	    		respReceived=routeDetail.receivedStatus
	    	}
	    	return {scrLoaded :scrLoaded , scrReceived : scrReceived, respLoaded : respLoaded, respReceived : respReceived}
	    	
	    }
	    function vesselVoyDisplay(data){
	    	if(data){
				var vesselCodesIndex = JSON.parse(localStorage.getItem('vesselCodes')).indexOf(data.split("/")[0])
				var vesselNames = JSON.parse(localStorage.getItem('vesselNames'))[vesselCodesIndex]
				if(data.indexOf('/')!==-1){
					data=data.split('/')[0]+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+data.split('/')[1]
				}
				return '<span title="'+vesselNames+'">'+data+'</span>';
        	} else{
        		return "";
        	}
	    }
	    function displayHideThirdParty(vesselVoyage) {
	        if (nsBookDoc.textNullCheck(vesselVoyage) && nsBookDoc.textNullCheck(vesselVoyage) !== 'No Voyage') {
	            $("#thirdPartyVoyage").css("visibility", "hidden");
	        } else {
	            $("#thirdPartyVoyage").css("visibility", "visible");
	        }
	    }
	    function textNullCheck(text) {
	        return (text || '');
	    }
	    function getEnableDisable(isBooking, isReceived, isLoaded, isDischarged, isMainDisabled) {
	        var isMainDisabledField = isMainDisabled;
	        if (isReceived === 'Y' || isLoaded === 'Y' || isDischarged === 'Y') {
	            isMainDisabledField = 'disabled';
	        }
	        return isMainDisabledField;
	    }
	    function dimensionTableUnits(dimTable) {
	    	$.each(dimTable, function(i,val){
	    		var measType = $(this).find('.dimensions').val();
	    		switch(measType){
	    		case '20': $(this).find('.dimUnitLwh').html('m');
	    				   $(this).find('.dimUnitW').html('kg');
	    				   $(this).find('.dimUnitA').html('m<sup>2</sup>');
	    				   $(this).find('.dimUnitV').html('m<sup>3</sup>');    				   
	    				   break;
	    		case '10': $(this).find('.dimUnitLwh').html('in');
						   $(this).find('.dimUnitW').html('lb');
						   $(this).find('.dimUnitA').html('ft<sup>2</sup>');
						   $(this).find('.dimUnitV').html('ft<sup>3</sup>');    				   
						   break;
	    		default:   $(this).find('.dimUnitLwh').html('');
						   $(this).find('.dimUnitW').html('');
						   $(this).find('.dimUnitA').html('');
						   $(this).find('.dimUnitV').html('');
	    		}
	    	});
	    	
	    }
	    function isEmptyRateValue(rateValue) {
	        return rateValue === '' || rateValue === 0;
	    }
	    function activeSubBooking() {
	    	var bookedLen = 0;
	        nsBooking.isDiffFreight = false;
	        bookedLen = nsBooking.bookUnitPopUpFlag ? $('#bookingUnitPopup').find('.singleColItem').length : parseInt($('#totalBookedUnits').val());
	        if(!((bookedLen === 0) && $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').length === 1 &&
	        		$('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').text().indexOf('-0-New Sub Booking') === -1)){
	            $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').each(function() {
	                if ($(this).hasClass('ui-selecting')) {
	                    $(this).trigger('click');
	                    $(this).addClass('ui-selecting');
	                }
	            });
	        }
	    }
	    function updateRouteGridOnDiffRouteDetail(enabRoute){
	    	if (enabRoute === 'N') {
				nsBookDoc.subBookingDiffRouteDet();
			}
			else {
	            if($('.routeDetailsAcc .accHeader #subTitle.subTitle').length>0) {
		        	$('.routeDetailsAcc .accHeader #subTitle.subTitle').siblings().addClass('icons_sprite accEleIndicator fa fa-minus');			        		        	
		        } else{
		        	$('.routeDetailsAcc .addPadding #subTitle.subTitle').siblings().addClass('icons_sprite accEleIndicator fa fa-minus');
		        	$('.routeDetailsAcc .addPadding #subTitle.subTitle').parent().removeClass('addPadding').addClass('accHeader bdrBtmNo');
		        }
	         $('.routeDetailsAcc .accHeader #subTitle.subTitle').html('Route Detail');
			}
	    }
	    function subBookingDiffRouteDet(){
	    	$('.routeDetailsAcc .accHeader #subTitle.subTitle').html('Route Detail <span style="color:red;">- The Sub Booking has individual Routes Or Allocation Status Or Way Cargo</span>')
	        
	        if($('.routeDetailsAcc .accHeader #subTitle.subTitle').length>0){
	        	$('.routeDetailsAcc .accHeader #subTitle.subTitle').siblings().removeClass('icons_sprite accEleIndicator fa fa-plus').removeClass('fa fa-minus');
	        	$('.routeDetailsAcc .accHeader #subTitle.subTitle').parent().addClass('addPadding').removeClass('accHeader');
	        }
	        else{
	        	$('.routeDetailsAcc .addPadding #subTitle.subTitle').siblings().removeClass('icons_sprite accEleIndicator fa fa-plus').removeClass('fa fa-minus');
	        }
	    }
	    function subBookingdiffOrgDest(flag) {
	    	if(flag) {
		    	$('#mainBookDetailCustomerOrigin').val('The Sub bookings have different Origins And /Or Destinations')
		        .attr('disabled', 'disabled').css('cssText', 'background-color: white !important;width: 350px !important;color: red !important;border:0px;');
		        $('#mainBookDetailCustomerOriginDesc').hide();
		        $('#mainBookDetailCustomerDestination').val('The Sub bookings have different Origins And /Or Destinations')
		        .attr('disabled', 'disabled').css('cssText', 'background-color: white !important;width: 350px !important;color: red !important;border:0px;');
		        $('#mainBookDetailCustomerDestinationDesc').hide();
		        
		                
	    	} else {
	    		 $('#mainBookDetailCustomerOriginDesc').show();
	             $('#mainBookDetailCustomerOrigin').removeAttr('style');
	             $('#mainBookDetailCustomerDestination').removeAttr('style');
	             $('#mainBookDetailCustomerDestinationDesc').show();
	             if($('.routeDetailsAcc .accHeader #subTitle.subTitle').length>0) {
			        	$('.routeDetailsAcc .accHeader #subTitle.subTitle').siblings().addClass('icons_sprite accEleIndicator fa fa-minus');			        		        	
			        } else{
			        	$('.routeDetailsAcc .addPadding #subTitle.subTitle').siblings().addClass('icons_sprite accEleIndicator fa fa-minus');
			        	$('.routeDetailsAcc .addPadding #subTitle.subTitle').parent().removeClass('addPadding').addClass('accHeader bdrBtmNo');
			        }
	             	 
			}
	    }
	    function isEmptyPartyName(blCode, partyName) {
	        var temp = (partyName === null || partyName === '') && (blCode === null || blCode === '');
	        return temp;
	    }

	    function validatePartyName(alertMsg, blCode, loadCust, partyName) {
	        var codePartyName = 0;

	        if (isEmptyPartyName(blCode, partyName)) {
	            alertMsg = alertMsg + '\nCode/name should not be empty';
	            codePartyName = 1;
	        }
	        if ((blCode === '' && partyName !== '') || (blCode !== '' && partyName === '')) {
	            alertMsg = alertMsg + '\nEnter a valid Code/name';
	            codePartyName = 1;
	        }
	        if (codePartyName === 0 && loadCust === '0') {
	            alertMsg = alertMsg + '\nEnter a valid Code/name';
	        }
	        return alertMsg;
	    }
	    
	    function blStausOnDiffRouteDetails(response){
	    	
	    	var blFStatus = response[legSelectionOnLoad(response)].consLegStatus;
	    	blFStatus = nsBookDoc.detectConsStatusType(blFStatus, nsDoc.bolPrntStatus);
			blFStatus = (blFStatus === 'Printed' ? 'Issued and Printed' : blFStatus);
			$('#blStatusDesc').val(blFStatus)
	    }
	    function getIsHoeghCompany(){
	    	if($('#routeDetailGrid .selectedRoute:checked').length===0){
	    		if(!nsDoc){
	    			return nsCore.appModel.fetchBOLInfo.subBookingModelList[0].consignmentLegModelList[0].isHoeghCompany
	    		}else{
	    			return nsCore.appModel.viewbolDetails.consignmentLegModelsList[0].isHoeghCompany
	    		}
			}else{
				return $('#routeDetailGrid .selectedRoute:checked').data( "ishoeghcompany")
				
			}
	    }
	    function diffOfficeValidation(billStatus){
	    	var userBookOffice='', userDocOffice='';
	    	var isHoeghCompany= getIsHoeghCompany();
	    	if($('#routeDetailGrid .selectedRoute:checked').length===0){
	    		if(!nsDoc && nsCore.appModel.fetchBOLInfo.subBookingModelList){
	    			userBookOffice=nsCore.appModel.fetchBOLInfo.subBookingModelList[0].consignmentLegModelList[0].userBookOffice
	    		}else if(nsCore.appModel.viewbolDetails.consignmentLegModelsList) {
	    			userDocOffice=nsCore.appModel.viewbolDetails.consignmentLegModelsList[0].userDocOffice
	    		}
			}else{
				userBookOffice=$('#routeDetailGrid .selectedRoute:checked').data( "userbookoffice")
				userDocOffice=$('#routeDetailGrid .selectedRoute:checked').data( "userdocoffice")
			}
	    	if(((userDocOffice==='N' && billStatus!=='manifested')
	    			|| (userBookOffice==='N' && billStatus ==='Booking Created')) && isHoeghCompany === 'N'){
	    		
	    		$('.mainSubBookingFormWrap *').attr('disabled', true);
 				$('.mainSubBookingFormWrap option').removeAttr('disabled');
                $('#mainBookDetailCustomerCode,#mainBookDetailCustomerDesc,#mCustomerRef,#customerRef,#mainContract').attr('disabled', 'disabled');
                $('#mainBookDetailCustomerOrigin,#mainBookDetailCustomerOriginDesc,#mainBookDetailCustomerDestination,#mainBookDetailCustomerDestinationDesc').attr('disabled', 'disabled');
                $('.mainSubBookingFormWrap a').addClass('disabledLink');                
                $('#viewPrintSettingsLink,#cargoListLink').removeClass('disabledLink').removeAttr('disabled');
				$('.mainSubBookingFormWrap span').addClass('disabledLink');				
				$('.mainBookingDetailsWrap #possVoyages').hide();
				$('.mainBookingDetailsWrap #possVoyagesHide').show();	
				$('#billLadingDetailsForm .saveButton').removeAttr('disabled');
			}
	    	$.each($('#routeDetailGrid tbody tr'), function(i, val) {
		           if(($(this).find('input.selectedRoute').data('userbookoffice')==='N'
		        	   || $(this).find('input.selectedRoute').data('userdocoffice')==='N') 
		        	   && !$(this).find('input.selectedRoute').data('bloutbound') && isHoeghCompany === 'N' ){
		            	$(this).find('.allocStatusType, .wayCargo').attr('disabled', true)
		            }else{
		            	$('#mainSubBookingFormSave').removeAttr('disabled');
						$('.mainSubBookingFormWrap.subBookListFormWrap .saveButton').removeAttr('disabled')
		            }
		           if(((userDocOffice==='N' && billStatus!=='manifested')
			    			|| (userBookOffice==='N' && billStatus ==='Booking Created')) && isHoeghCompany === 'N'){
		        	   $(this).find('.mainLeg').attr('disabled', true)
		           }
		        });
	    }
	    function disableVesVoyOnDiffOffice(objData, gridName){
	    	 if(($(objData).data('userdocoffice')==='N' || $(objData).data('userbookoffice')==='N') 
	    		     && (($(objData).data('constype')==='M' && (gridName=== 'editMainCarriageLegGrid'||gridName=== 'addMainCarriageLegGrid')) 
	    		     ||($(objData).data('constype')==='P' && gridName=== 'editCarriageLegGrid')) && getIsHoeghCompany()==='N'){
	    				$('#' + gridName).find('input[type="radio"]').prop('disabled', true);
	    				$('.mainLegChangeOption.onCarriage').attr('disabled', true)
	    				$('.mainLegChangeOption.mainLeg').attr('disabled', true)
	    		    }
		}
	   
	    
	bookingTableObj = {
		    
	        'populateChargeGrid':populateChargeGrid,
	        'validateEditShowPrev':validateEditShowPrev,
	        'isValidCompination':isValidCompination,
	        'throwAlert':throwAlert,
	        'comparetionCheck':comparetionCheck,
	        'getTerminalObj':getTerminalObj,
	        'invokeAddLegAjaxCall':invokeAddLegAjaxCall,
	        'populatePortCallId':populatePortCallId,
	        'getVoyageCallIds':getVoyageCallIds,
	        'checkAlreadyRoute':checkAlreadyRoute,
	        'loadROuteDetailsGrid' : loadROuteDetailsGrid,
	        'textNullCheck' : textNullCheck,
	        'dimensionTableUnits':dimensionTableUnits,
	        'isEmptyRateValue':isEmptyRateValue,
	        'activeSubBooking':activeSubBooking,
	        'cargoConsignmentsVD': [],
	        'cargoConsignmentsSBU' : [],
	        'subBookingdiffOrgDest': subBookingdiffOrgDest,
	        'subBookingDiffRouteDet': subBookingDiffRouteDet,
	        'updateRouteGridOnDiffRouteDetail':updateRouteGridOnDiffRouteDetail,
	        'vesselVoyDisplay': vesselVoyDisplay,
	        'validatePartyName' : validatePartyName,
	        'legSelectionToMatchSearch' : legSelectionToMatchSearch,
	        'blStausOnDiffRouteDetails' : blStausOnDiffRouteDetails,
	        'diffOfficeValidation': diffOfficeValidation,
	        'disableVesVoyOnDiffOffice': disableVesVoyOnDiffOffice,
	        'legSelectionOnLoad' :legSelectionOnLoad,
	        'getIsHoeghCompany' : getIsHoeghCompany,
	        'eqpNoSts' : false,
	        'equipStatus' : false
	    };

	    $.extend(true, nsBookDoc, bookingTableObj);
})(this.bookDoc, jQuery, this.vmsService, this.core, this.doc, this.booking);
	