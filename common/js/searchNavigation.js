/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
(function(nsBookDoc, $, vmsService, nsCore, nsBooking, nsDoc) {
	var searchNaviationObj={},
	mouseEnter=false,
	mouseEnterSub=false,
	mouseEnterUnitList=false,
	docLink = false;
	
	if(!nsBooking){ nsBooking=nsDoc;}
$(document).ready(function(){
	nsBookDoc.isEnableRouteDetail ='Y';
	if((window.location.href).indexOf('/documentation/') > 0){
		docLink = true;
	}
	 $('.searchGroupBy').change(function() {
		if($('.newSearch').css('display')!=='none') {
			 $('#leftSearchMenu').submit();
	 	}
     });
//	afterDynamicUnitListInserted function starts
	$(document).on('click', '.frthLevel', function(e){
		 var indexVall = $(this).closest('.singleColItem').attr('data-index'),
         currentItem1 = nsBookDoc.cargoListArray[indexVall],
         formSubmit,
         conLeg = currentItem1.consignmentLegList[0],
         carcon = conLeg.cargoConsignmentList[0],
         cargo = carcon.cargo,
         length = currentItem1.bookedDimension.length || '',
         width = currentItem1.bookedDimension.width || '',
         height = currentItem1.bookedDimension.height || '',
         weight = currentItem1.bookedDimension.weight || '',
         area = currentItem1.bookedDimension.area || '',
         volume = currentItem1.bookedDimension.volume || '',
         measUnit = currentItem1.perUnitBooked,
         bkdUnits = currentItem1.bookedUnits,
         equipementNo = conLeg.cargoConsignmentList[0].equipNo,
         selectedVal = '';
		 if (nsBooking.globalBookingFlag.mainBookingFlag) {
			    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
			        nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
			    return false;
			}
		 $('.dropMenuIcon').hide();
		 $(this).find('.dropMenuIcon').show()
		 $('.withNewBooking').removeClass('withNewBooking');
		 nsBookDoc.removeDropDownIcon();
		 nsBookDoc.addingBottomBorderScndLevel()
	e.stopPropagation();   // to stop all parent actions
	//$('.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#f9f9f9').css('color', '#000000');;
	$('.activeNavigationItem').removeClass('activeNavigationItem');
	$(this).addClass('activeNavigationItem');
	$('.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#c9c9c9').css('color', '#000000');
	$('.frthLevel').removeClass('activeCargo');
    $(this).addClass('activeCargo');
    $('.bookingUnitWrap').show();
    $('.subBookListFormWrap').hide();
    $('.mainBookingDetailsWrap').hide();
    $('.routeDetailsAcc').hide();
    $('.bookingUnitForm').find('.bookingUnitContent,.formSubmitButtons').show();
    if($(this).parents('.slideMenu').length > 0){
    	$('.mainBookingContentWrapper .buContentHead > .subBookLevel').show();
    } else {
    	$('.buContentHead > .subBookLevel').hide();
    }
    if(docLink){
    	nsDoc.statusBasedDisable('vinDetailsPopup', nsDoc.getCurrentConsignmentLegStatus());
    }else{

    if (currentItem1.consignmentStatus >= 20) {
        formSubmit = $('.bookingUnit:visible').find('.bookingUnitContent').find('#vinSerialNbr,#currCode,#regPlate,#cargoHoldOn,'
            + '#newCargochk,#declaredValDesc,.customerRef,#docReceiptNbr,#newEquipmentNum, #cargoDetails');
        formSubmit.prop('disabled', true);
    } else {
        formSubmit = $('.bookingUnit:visible').find('.bookingUnitContent').find('#vinSerialNbr,#currCode,#cargoHoldOn,#newCargochk,'
            + '#declaredValDesc,.customerRef,#docReceiptNbr,#regPlate,#newEquipmentNum, #cargoDetails');
        formSubmit.prop('disabled', true);

        if (!$('#bookingUnitPopup').is(":visible")){
       	 if ($('input:radio[name=selectedRoute]').length===0){
       		 nsBooking.consType ='M'; //sub-booking is not loaded but navigated to vin by expand functionality in left navigation( keeping Main leg as default).
       	 }
       	 else{
	        	nsBooking.consType =$('input:radio[name=selectedRoute]:checked').val();//accessing from left navigation without opening booked units popup.
	     }
        }
        if (nsBooking.consType === 'M') {
            formSubmit = $('.bookingUnit:visible').find('.bookingUnitContent').find('#vinSerialNbr,#currCode,#cargoHoldOn,#newCargochk,'
                + '#declaredValDesc,.customerRef,#docReceiptNbr,#regPlate,#newEquipmentNum, #cargoDetails');
        } else {
            formSubmit = $('.bookingUnit:visible').find('.bookingUnitContent').find('#vinSerialNbr,#currCode,#cargoHoldOn,.customerRef,#newEquipmentNum, #cargoDetails,#declaredValDesc');
        }
        formSubmit.prop('disabled', false);
    }
    }
     $('input.vinSerialNbr').val(cargo.vinNumber);
     var selectedValText = '';
     selectedValText =  $(this).children('span').text();
     nsBookDoc.frthLvlId = $(this).attr('id');
     $('#bookingUnitPopup #vinNo').text(selectedValText);
     // VMS
     $('.cargoHoldOn').prop('checked', carcon.cargoOnHold === 'Y');
     // 678
     $('select#allocStatus').val(conLeg.firm);
     // VMS
     $('.newCargochk').prop('checked', cargo.newCargo === 'Y');
     // 678
     $('.cargoDimensions.bookedDim').val(currentItem1.bookedDimension.dimensionType);
     $('.cargoDimensions.freightDim').val(currentItem1.freightedDimension.dimensionType);
     /*actual dimension*/
     $('input.actualLength').val('');
     $('input.actualWidth').val('');
     $('input.actualHeight').val('');
     $('input.actualWeight').val('');
     $('input.actualArea').val('');
     $('input.actualVolume').val('');
     if(cargo.actualDimension.dimensionType){
         $('.cargoDimensions.actualDim').val(cargo.actualDimension.dimensionType);
         $('.cargoDimensions.bookedDim').val(currentItem1.bookedDimension.dimensionType);
         $('.cargoDimensions.freightDim').val(currentItem1.freightedDimension.dimensionType);       
         $('input.actualLength').val((cargo.actualDimension.length !== null && cargo.actualDimension.length !== undefined)? parseFloat(cargo.actualDimension.length).toFixed(3) : '');
         $('input.actualWidth').val((cargo.actualDimension.width !== null && cargo.actualDimension.width !== undefined)? parseFloat(cargo.actualDimension.width).toFixed(3) : '');
         $('input.actualHeight').val((cargo.actualDimension.height !== null && cargo.actualDimension.height !== undefined)? parseFloat(cargo.actualDimension.height).toFixed(3) : '');
         $('input.actualWeight').val((cargo.actualDimension.weight !== null && cargo.actualDimension.weight !== undefined) ? parseFloat(cargo.actualDimension.weight).toFixed(0) : '');
         $('input.actualArea').val((cargo.actualDimension.area !== null && cargo.actualDimension.area !== undefined)? parseFloat(cargo.actualDimension.area).toFixed(3) : '');
         $('input.actualVolume').val((cargo.actualDimension.volume !== null && cargo.actualDimension.volume !== undefined)? parseFloat(cargo.actualDimension.volume).toFixed(3) : '');
     }
     /* Booked dimension */
     if (measUnit === 'N') {
         length = length || (length / bkdUnits);
         width = width || (width / bkdUnits);
         height = height || (height / bkdUnits);
         weight = weight || (weight / bkdUnits);
         area = area || (area / bkdUnits);
         volume = volume || (volume / bkdUnits);
     }
     $('input.bklenCal').val(length ? parseFloat(length).toFixed(3) : '');
     $('input.bkwidCal').val(width ? parseFloat(width).toFixed(3) : '');
     $('input.bkheiCal').val(height ? parseFloat(height).toFixed(3) : '');
     $('input.bkweiCal').val(weight ? parseFloat(weight).toFixed(0) : '');
     $('input.bkareCal').val(area ? parseFloat(area).toFixed(3) : '');
     $('input.bkvolCal').val(volume ? parseFloat(volume).toFixed(3) : '');
     /* Freighted dimension */
     length = currentItem1.freightedDimension.length || '';
     width = currentItem1.freightedDimension.width || '';
     height = currentItem1.freightedDimension.height || '';
     weight = currentItem1.freightedDimension.weight || '';
     area = currentItem1.freightedDimension.area || '';
     volume = currentItem1.freightedDimension.volume || '';
     measUnit = currentItem1.perUnitFreighted;
     bkdUnits = currentItem1.bookedUnits;
     if (measUnit === 'N') {
         length = length || (length / bkdUnits);
         width = width || (width / bkdUnits);
         height = height || (height / bkdUnits);
         weight = weight || (weight / bkdUnits);
         area = area || (area / bkdUnits);
         volume = volume || (volume / bkdUnits);
     }
     $('input.frlencal').val(length ? parseFloat(length).toFixed(3) : '');
     $('input.frwidtcal').val(width ? parseFloat(width).toFixed(3) : '');
     $('input.frheical').val(height ? parseFloat(height).toFixed(3) : '');
     $('input.frweical').val(weight ? parseFloat(weight).toFixed(0) : '');
     $('input.frareacal').val(area ? parseFloat(area).toFixed(3) : '');
     $('input.frvolcal').val(volume ? parseFloat(volume).toFixed(3) : '');
     $('select#currCode').val(cargo.declaredCurrency.currencyCode);
     	var currVal = parseFloat(cargo.declaredValue), currencyUnit = cargo.declaredCurrency.currencyCode;
		if(currencyUnit !== 'JPY'){
			currVal  = currVal.toFixed(2);
		}
		else{
			currVal  = currVal.toFixed(0);
		}
		$('.declaredValDesc').val(currVal !== 'NaN' ? currVal : '');
      $('input.customerRef').val(cargo.customsRef);
     $('.cargoDataReceived').val(carcon.dateReceivedStr);
     $('.cargoDataLoaded').val(carcon.dateLoadedStr);
     $('input.dataLoaded').val(carcon.dateLoadedStr);
     $('.cargoDateReleasedLoad').val(carcon.dateReleasedLoadStr);
     $('input.dataReceived').val(carcon.dateReceivedStr);
     $('input.docReceiptNbr').val(carcon.docReceiptNo);
     $('input.regPlate').val(cargo.regPlate);
     $('.cargoCondition').val(carcon.cargoCondition);
     $('input.loadTerminal').val(conLeg.loadTerminal.termCode);
     $('input.discTerminal').val(conLeg.discTerminal.termCode);
     $('input[name="cargoConsId"]').val(carcon.cargoConsID);
     $('.equipmentNbr').val('');
     $('.equipmentType').val('');
     if (!equipementNo) {
         $('.equipmentNbr').val('');
     } else {
         $('.equipmentNbr').find('[data-equipNo="' + escape(equipementNo) + '"]').prop('selected', 'selected');
         selectedVal = $('.equipmentNbr').val();
         $('.equipmentType').val(unescape(selectedVal));
     }
     nsBookDoc.dimensionTableUnits($('#bookingUnitsDimensionsGrid tbody tr'));
     $('.bookingUnitForm').find('.bookingUnitContent,.formSubmitButtons').show();

	});
	nsCore.onlyNumbers('.bookingUnitContent .declaredValDesc');
	$('.bookingUnitContent .declaredValDesc, .bookingUnitContent .declaredValCode').change(function(){
		var currVal = parseFloat($(this).parent().find('.declaredValDesc').val()), currencyUnit = $(this).parent().find('.declaredValCode').val();
		if(currencyUnit !== 'JPY'){
			currVal  = currVal.toFixed(2);
		}
		else{
			currVal  = currVal.toFixed(0);
		}
		$(this).parent().find('.declaredValDesc').val(currVal !== 'NaN' ? currVal : '');
	});
    $('.cargoDetailsSave').click(function() {
        var allocationStu = $(this).parent().parent().parent().find('#allocStatus option:selected').val(),
        	vinNumber = $(this).parent().parent().parent().find('#vinSerialNbr').val(),
        	isLoadRec = false, data = {};
        nsBooking.globalBookingFlag.mainBookingFlag = false;
        nsBooking.consignmentLeg = {
            firm : allocationStu
        };
        data = {
            cargoConsignment : nsBooking.popCargoConsDet($(this).parent().parent().parent()),
            cargo : nsBooking.popCargoDat($(this).parent().parent().parent()),
            consignmentLeg : nsBooking.consignmentLeg,
            timeStamp : $('.frthLevel.activeCargo').attr('data-cargotimestamp') || '0',
            moduleType : !nsDoc?'BOOK':'BL' 
        };
        if ((nsBooking.doNullCheckByCl('.cargoDataReceived'))
            || (nsBooking.doNullCheckByCl('.cargoDataLoaded'))
            || (nsBooking.doNullCheckByCl('.cargoDateReleasedLoad'))) {
            isLoadRec = true;
        }
        if (isLoadRec && !vinNumber) {
            nsCore.showAlert('Can not be null as some of the cargos are arrived/loaded/ReleasedToLoad!');
        } else {
            vmsService.vmsApiServiceType(function(response) {
                var subBookingId = '';
                if (response) {
                    if (response === 'concurrency') {
                        nsCore.showAlert('Someone else have updated the data since you retrieved the booking information');
                    } else if (response === '1250' || response === 'Can not be null as some of the cargos are arrived/loaded/ReleasedToLoad!'){
                    	nsCore.showAlert('Can not be null as some of the cargos are arrived/loaded/ReleasedToLoad!')
                    } else {
                        if (response === 'Success') {
                            if ($('#bookingUnitPopup').css('display') === 'none') {
                                subBookingId = $('.frthLevel.activeCargo').attr('id').substring(9, $('.frthLevel.activeCargo').attr('id').lastIndexOf('_'));
                                var subbookingid = $('.frthLevel.activeCargo').attr('id').substring(9, $('.frthLevel.activeCargo').attr('id').length);
                                $('#thrdLevel' + subBookingId).find('.expandSubBooking').trigger('click');
                                $('#thrdLevel' + subBookingId).find('.expandSubBooking').trigger('click');
                               // VMSAG-4947
                                nsBooking.updatedCargoflag =  subbookingid;
                            } else {
                                if ($('.searchNavigation .frthLevel').filter(function() {
                                        return $(this).attr('id').indexOf(
                                            $('.thrdLevel.activeSubBook').attr('id')
                                                .substring(9, 15)) !== -1
                                    }).length > 0) {
                                    $('.thrdLevel.activeSubBook').find('.expandSubBooking').trigger('click');
                                    $('.thrdLevel.activeSubBook').find('.expandSubBooking').trigger('click');
                                }
                                nsBooking.updatedCargoflag = '';
                                $('#bookingUnitPopup').dialog('close');
                            }
                        }
                    }
                } else {
                    nsCore.showAlert(nsBooking.errorMsg);
                }
            }, nsBooking.updateCargoDetails, 'POST', JSON.stringify(data));
        }
    });
    // when booked close or cancel button is clicked
    $(document).on('click', '#bkdUnitClose, #bkdUnitsCancelButton', function() {
        if ($('#bookingUnitForm').attr('data-dirty-popup') === 'false'
            || typeof $('#bookingUnitForm').attr('data-dirty-popup') === 'undefined') {
        	if(!$('#bookingUnitPopup').is(':visible')){ // VMSAG-3893 - 27/07/2018 - no blank screen on cancel button
        		if(nsBookDoc.frthLvlId){
        			$('#'+ nsBookDoc.frthLvlId).trigger('click');
        		}
        	} else {
        		nsBookDoc.frthLvlId = '';
        		$('#bookingUnitPopup').dialog('close');
        	}
        }
    });
	$(document).on('mouseleave', '.frthLevel .subBookingInlineMenu, .toolTipWrapper', function(e) {
		mouseEnterUnitList=false;
		setTimeout(function(){
			if(!mouseEnterUnitList) {
			$('.frthLevel.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#C9C9C9');
			$('.frthLevel').find('.mainBookingItemIcons').css('color', '#000000');
	    $('.toolTipWrapper').hide();
				}
		},100);
	})
	$(document).on('click', '.frthLevel .subBookingInlineMenu', function(e) {
				var tooltipContent = '',
		            consTimeStamp = e.target.parentElement.parentElement.dataset.cargotimestamp,
	                cargoId = e.target.parentElement.parentElement.dataset.cargoid,
	                vinStatus = nsBookDoc.cargoListArray[0]? nsBookDoc.cargoListArray[0].consignmentStatus:$(this).parent().parent().siblings().closest('.thrdLevel.activeSubBook').attr('data-bolstatus'),
	                currMod = window.location.href,
	                index = e.target.parentElement.parentElement.dataset.index;
	            e.stopPropagation();
	            $(this).parent().css('background-color', '#446181');
	            $(this).parent().css('color', '#ffffff');
	            mouseEnterUnitList=true;
	            $('.toolTipWrapper').text('').hide();
	            bookingMenu = {

	            };

	            if(currMod.indexOf('/booking/') >=0 ){
		            bookingMenu = {
		            		'deleteunit': 'Delete Unit'
		            };
	            } else{
		            bookingMenu = {
		            		'revertVinToBooking' : 'Revert to booking'
		            };
	            }
	            tooltipContent +='<table cellspacing="0" cellpadding="0" class="toolTipList" >';                
                if( ((bookingMenu.revertVinToBooking ==='Revert to booking') && (parseInt(vinStatus) <= 31) && (parseInt(vinStatus) !== 30)) || ((bookingMenu.deleteunit ==='Delete Unit') && (parseInt(vinStatus) <= 10)) && $('#hasWriteAccess').val() === 'Y'){
                   $.each(bookingMenu, function(key, value) {
                           tooltipContent += '<tr><td><a class="' + key + '"  href="javascript:void(0);" data-cargoId="'+cargoId+'" data-cargotimestamp="'+consTimeStamp+'"  data-index="'+index+'">'+ value +'</a></td></tr>';
                        });
                   }     
                   else {                     
                    $.each(bookingMenu, function(key, value) {
                           tooltipContent += '<tr><td><a class="disabledLink"  href="javascript:void(0);" data-cargoId="'+cargoId+'" data-cargotimestamp="'+consTimeStamp+'"  data-index="'+index+'">'+ value +'</a></td></tr>';
                        });
                   } 

                ///end
	            tooltipContent += '</table></div>';
	            if(mouseEnterUnitList){
	               $('.toolTipWrapper').html(tooltipContent).show();
	            afterDropDownMenuBuild();
	            disableOnReadAccess()
	            	}
	           // },200);
	            currentEle = $(this);
	            ele = $('.toolTipWrapper');
	            $(ele).position({
	            	my: 'right-9 top-7',
	                at: 'right bottom',
	                of: $(currentEle)
	            });
	        });
//	afterDynamicUnitListInserted function ends

//	afterDynamicSubBookingInserted function starts
	$(document).on('mouseleave', '.thrdLevel .subBookingInlineMenu, .toolTipWrapper', function(e) {
		mouseEnterSub=false;
		setTimeout(function(){
			if(!mouseEnterSub) {
		if($('.thrdLevel.activeNavigationItem').length > 0){
			$('.thrdLevel.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#c9c9c9');
			$('.thrdLevel.activeNavigationItem').find('.mainBookingItemIcons').css('color', '#000000');
		}
	    $('.toolTipWrapper').hide();
				}
		},100);
	})
	$('.mainBookingListWrap').on('click',
	        '.thrdLevel .subBookingInlineMenu',
	        function(e) {
	            var subBookingId = '',
	                bookingId = '',
	                selectedRoute = '',
	                currentEle = '',
	                ele = '',
	                bookingMenu = {},
	                bolId='', bolStatus='',
	                tooltipContent = '',
	                currMod = window.location.href,
	                timeStamp = $(this).closest('.singleColItem').attr('data-timestamp');
	            e.stopPropagation();
	            $(this).parent().css('background-color', '#446181');
	            $(this).parent().css('color', '#ffffff');
	            mouseEnterSub=true;
	            if(nsCore.getPage(window.location.href)==='booking'){ /////////////////////this needs to be looked into
	            if (nsBooking.globalBookingFlag.mainBookingFlag) {
	                nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
	                nsBooking.globalBookingFlag.fnGoBackWard,'mainBookingFlag',$(this));
	                return false;
	            }
	            }
	            subBookingId = $(this).closest('.singleColItem').attr('data-subbookingid');
	            bookingId = $(this).closest('.singleColItem').attr('data-bookingid');
	            bolId  =$(this).closest('.singleColItem').attr('data-bolid');	            
	            bolStatus = ($(this).parent().parent().siblings('.scndLevel.ui-selecting').attr('data-conslegStatusNum') !== 'undefined' && $(this).parent().parent().siblings('.scndLevel.ui-selecting').attr('data-conslegStatusNum') !== undefined)?$(this).parent().parent().siblings('.scndLevel.ui-selecting').attr('data-conslegStatusNum'): nsCore.appModel.viewSubBooking.bolStatus;	            
	            if(nsCore.getPage(window.location.href)==='booking'){ /////////////////////this needs to be looked into
	            nsBooking.selectedEntity.selectedSubBookingMenuItem = subBookingId;
	            }
	            $('.toolTipWrapper').text('').hide();
	            if(currMod.indexOf('/booking/') >=0 ){
		            bookingMenu = {
		                'subBookingCopy': 'Copy Sub Booking',
		                'createNewSubBooking': 'Create New Sub Booking',
		                'deleteSubBooking': 'Delete Sub Booking',
		                'makeBillLading': 'Make Bill of Lading',
		                'viewLastChanged': 'View Last Changed'
		            };
	            } else{
		            bookingMenu = {
		        		'subBookingCopy' : 'Copy',
		                'revertToBooking' : 'Revert to booking',
		                'viewLastChanged' : 'View Last Changed'
		    		};
	            }
	            tooltipContent +='<table cellspacing="0" cellpadding="0" class="toolTipList consignmentInlineMenu" data-subbookingid="'
	            + subBookingId + '" data-timeStamp ="' +
                timeStamp + '" data-bolId='+bolId+' >';
	            $.each(bookingMenu, function(key, value) {
	                tooltipContent += '<tr><td><a class="' + key + '" href="javascript:void(0);" data-bookingId="' +
	                    bookingId + '" >' + value + '</a></td></tr>';
	            });
	            tooltipContent += '</table></div>';
	            //setTimeout(function(){
	            if(mouseEnterSub){
	            	$('.toolTipWrapper').html(tooltipContent).show();
	            	}
	           // },200);
	            selectedRoute = $('.selectedRoute:checked');
	            enableDisableSubLinks($(selectedRoute).val(),bolStatus);
	            currentEle = $(this);
	            ele = $('.toolTipWrapper');
	            $(ele).position({
	            	my: 'right-9 top-7',
	                at: 'right bottom',
	                of: $(currentEle)
	            });
	            afterDropDownMenuBuild()
	            disableOnReadAccess()
	            createSubBooking()
	            /*$('.createNewSubBooking').click(function(){
	            	$('#mainAddSubBooking').trigger('click')
	            })*/

	        });
//	afterDynamicSubBookingInserted function ends

//	afterDynamicInserted function starts
	$(document).on('click', '.frstLevel_dummy', function(){
		$('.scndLevel_dummy').show();
		nsBookDoc.collapseAllNavigation()
		$('.activeNavigationItem').removeClass('.activeNavigationItem');
		$('.scndLevel_dummy').addClass('activeNavigationItem');
	})
$(document).on('click', '.frstLevel', function(){
	var firstLvelIndex= this.id.split('_')[1]
 	var secondLvelCount=this.id.split('_')[2]
	nsBookDoc.frthLvlId = '';
	$('.thrdLevel').remove();
	$('.frthLevel').remove();
	$('.searchNavigation i.fa-minus').removeClass('fa-minus').addClass('fa-plus');
	$('.subBookContentListCol i.fa-chevron-up').removeClass('fa-chevron-up').addClass('fa-chevron-down');
	$('.scndLevel_dummy').hide();
	$('.activeFirstLevel').removeClass('activeFirstLevel');
	$(this).addClass('activeFirstLevel');
	if($('#scndLevel_'+firstLvelIndex+'_0').css('display')==='block'){
			$('.scndLevel').hide();
		$(this).find("i").removeClass("fa-chevron-up").addClass("fa-chevron-down");

	}else{
		$('.scndLevel').hide();
		for(var i=0;i<secondLvelCount;i++){
			$('#scndLevel_'+firstLvelIndex+'_'+i).show();
			$('#scndLevel_'+firstLvelIndex+'_'+i).find('.chevronArrow').toggleClass( "fa-chevron-down fa-chevron-up");
		}
		$(this).find("i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
		if($(this).hasClass('withNewBooking')){
		   nsBookDoc.insertNewAtBookingLevel('<div class="newBookLabel treeListLabel ui-selecting scndLevel activeNavigationItem bottomBorder" style="display:block">New Booking</div>')
		}
	}
	nsBookDoc.addingBottomBorderScndLevel();
	$('.bookingUnitWrap').hide();
});


$(document).on('mouseenter','.toolTipWrapper',function(){
	mouseEnter=true
	mouseEnterSub=true
	mouseEnterUnitList=true
})
$(document).on('mouseleave', '.subBookContentListCol .singleColItem.activeSubBook .mainBookingItemIcons .bookingInlineMenu, .toolTipWrapper', function(e) {
	mouseEnter=false;
	setTimeout(function(){
	if(!mouseEnter) {
		if($('.scndLevel.activeNavigationItem').length > 0){
			$('.scndLevel.activeNavigationItem').find('.mainBookingItemIcons').css('background-color', '#c9c9c9');
			$('.scndLevel.activeNavigationItem').find('.mainBookingItemIcons').css('color', '#000000');
		} 
    $('.toolTipWrapper').hide();
			}
	},100);
})

$(document).on('click', '.subBookContentListCol .singleColItem.activeSubBook .mainBookingItemIcons .bookingInlineMenu', function(e) {
    var bookingId = $(this).closest('.singleColItem').attr('data-bookingid'),
        timeStamp = $(this).closest('.singleColItem').attr('data-timestamp'),
        divId= $(this).closest('.singleColItem')[0].id,
        postUrl1 = nsBookDoc.getBookingAllocStatus + bookingId,
        currMod = window.location.href,
        allocStatus = '',
        currentEle = $(this),
        blStatus ='10',
        bookNo = $(this).closest('.singleColItem').attr('data-filtering'),
    	bolId = $(this).closest('.singleColItem').attr('data-bolid'),
    	consLegStts = $(this).closest('.singleColItem').attr('data-conslegStatusNum'),
    	printStatus = $(this).closest('.singleColItem').attr('data-bolPrintStatus'),
    	consLegSttsDesc ='',
    	bookingMenu = {},
    	tooltipContent = '';
    e.stopImmediatePropagation();
    $(this).parent().css('background-color', '#446181');
    $(this).parent().css('color', '#ffffff');
    mouseEnter=true
    // Added for 965
    $('.toolTipWrapper').text('').hide();
    tooltipContent += '<table cellspacing="0" cellpadding="0" class="toolTipList" data-filtering="' +
        bookNo + '" data-blnum="'+ bookNo +'" data-bolid="'+ bolId + '" data-bookingid="' + bookingId + '" data-timestamp="' + timeStamp + '" data-id="' + divId +'">';

	    if(currMod.indexOf('/booking/') >=0 ){
	        bookingMenu = {
	        		'bookingcopy': 'Copy Booking',
	                'createnewbooking': 'Create New Booking',
	                'createsubbooking': 'Create Sub Booking',
	                'deletebooking': 'Delete Booking',
	                'makeBillLading': 'Make Bill of Lading',
	                'previewBl': 'Preview B/L',
	                'bookConfirmation': 'Booking Confirmation'
	        };
	        //if any one of the subbooking has BL created status it changes the BlStatus. We use if for delete and makeBL menu.
	        $.each(nsCore.appModel.fetchBOLInfo.subBookingModelList, function(i,v){
	        	 if(nsCore.appModel.fetchBOLInfo.subBookingModelList[i].bolStatus >'10'){
	        		 blStatus =nsCore.appModel.fetchBOLInfo.subBookingModelList[i].bolStatus;
	        	 }
	        	 return;
	        });        
	      
		    vmsService.vmsApiService(function(response) {
		        if (response) {
		            allocStatus = response;
		            nsBooking.selectedEntity.selectedBookingMenuItem = bookingId;
		            nsBooking.selectedEntity.timeStamp = timeStamp;
		            	if (nsBooking.globalBookingFlag.mainBookingFlag) {
		                    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward, nsBooking.globalBookingFlag.fnGoBackWard,
		                        'mainBookingFlag', $(this));
		                    return false;
		                }
			            $.each(bookingMenu, function(key, value) {
			                if (key === 'makeBillLading') {
			                    tooltipContent += '<tr><td><a class="' + key +
			                        '" href="javascript:void(0)" data-bookingId="' + bookingId +'" >' + value + '</a></td></tr>';
			                } else if (key === 'previewBl') {
			                	//if any one of the subbooking has booking created status it should enable.
			                    if ($('.activeNavigationItem').attr('data-bolstatus') !== '10') {
			                        tooltipContent += '<tr><td><a class="disabledInlineLink" href="javascript:void(0);">' +
			                            value + '</a></td></tr>';
			                    } else {
			                        tooltipContent += '<tr><td><a class="' + key + '" href="javascript:void(0);">' + value +
			                            '</a></td></tr>';
			                    }
			                } else {
			                    if (key === 'bookConfirmation') {
			                        // firm
			                        if (allocStatus !== '0') {
			                            tooltipContent += '<tr><td><a class="' + key + '" href="javascript:void(0);">' + value+
			                                '</a></td></tr>';
			                        } else {
			                            tooltipContent += '<tr><td><a class="disabledInlineLink" href="javascript:void(0);">' +
			                                value + '</a></td></tr>';
			                        }
			                    } else {
			                        tooltipContent += '<tr><td><a class="' + key + '" href="javascript:void(0);">' + value +
			                            '</a></td></tr>';
			                    }
			                }
			            });
			            createDropdown(tooltipContent,currentEle);
			           // VMSAG-5138
			            if(!nsDoc){			           
			            // this has multiple status atleast one Bl created status.
			            if(blStatus !== '10' && !$('#billStatusDesc').val()){
			            	$('.toolTipWrapper  .deletebooking').addClass('disabledLink');			            	
			            }
			            //Booking has only one status for all the subookings and greater than 10
			            else if($('#billStatusDesc').val() && blStatus !== '10'){
			            	$('.toolTipWrapper  .bookConfirmation').addClass('disabledLink');
			            	$('.toolTipWrapper  .deletebooking').addClass('disabledLink');
			            	$('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
			           }
			            else {
			            	$('.toolTipWrapper  .deletebooking').removeClass('disabledLink');			            	
			            	$('.toolTipWrapper  .bookConfirmation').removeClass('disabledLink');			            	
			            	$('.toolTipWrapper  .makeBillLading').removeClass('disabledLink');
			            	$('.toolTipWrapper  .disabledInlineLink').removeClass('disabledLink');
			            	if(makeBLAccess ==='N'){
								$('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
							}
			            }
			          }
			           
						if($('#hasWriteAccess').val() === 'N' || bookingAccess ==='read'){
							$('.toolTipWrapper a').addClass('disabledLink');
						}
						
						if(nsDoc){
							if(makeBLAccess ==='N'){
								$('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
							}else{
								$('.toolTipWrapper  .makeBillLading').removeClass('disabledLink');
							}
						}
						//if any one of the subbooking has booking created status it should enable.
						if($('.activeNavigationItem').attr('data-bolstatus') !== '10'){
			            	$('.toolTipWrapper  .previewBl').addClass('disabledLink');
			            } else {
			            	$('.toolTipWrapper  .previewBl').removeClass('disabledLink');
			            }
						
		        }//response
		        else{
	        	nsCore.showAlert(nsBooking.errorMsg);
	        	}
		    }, postUrl1, 'GET', null);
	    }
        else{
        	 bookingMenu = {
             		'viewIssuedBL' : 'View issued BL',
         			'issueBL' : 'Issue/Print BL',
         			'retractBL' : 'Retract BL',
         			'issueManifestCorrection' : 'Issue Manifest Correction',
         			'retractManifest' : 'Unlock B/L for Manifest Correction',
         			'revertToBooking' : 'Revert to booking',
         			'previewBL' : 'Preview BL',
         			'viewLastChanged' : 'View last changed'
     		};
        	if (nsDoc.globalBookingFlag.mainBookingFlag) {
    			nsDoc.fnDirtyDialog(nsDoc.globalBookingFlag.fnGoForward, nsDoc.globalBookingFlag.fnGoBackWard,
    			'mainBookingFlag', $(this));
    			return false;
    		}
        	consLegSttsDesc = nsDoc.detectStatusType(consLegStts);
        	$.each(bookingMenu, function(key, value) {

        		switch(key){
    				case 'viewIssuedBL':
    					key = consLegStts === '20' ? 'disabledInlineLink' : key;
    					break;

    				case 'previewBL':
    					key = (consLegStts === '20' || consLegStts === '21' || consLegStts === '31') ? key : 'disabledInlineLink';
    					break;

    				case 'revertToBooking':
    					key = (consLegSttsDesc.toLowerCase() !== 'created') ? 'disabledInlineLink' : key;
    					break;

    				case 'issueBL':
    					key = nsDoc.getManifestedStatus(consLegSttsDesc, key) === 'disabledInlineLink' || printStatus !=='Y' ? key : 'disabledInlineLink';
    					break;

    				case 'retractBL':
    					key = nsDoc.getManifestedStatus(consLegSttsDesc, key);
    					break;

    				case 'issueManifestCorrection':
    					key = (!(consLegSttsDesc.toLowerCase() === 'unlocked' || consLegSttsDesc.toLowerCase()
    					.startsWith('unlocked') || consLegStts === '75' || consLegStts === '99')) ? 'disabledInlineLink' : key;
    					break;

    				case 'retractManifest':
    				    key = !(consLegSttsDesc.toLowerCase() === 'manifested' || consLegSttsDesc.toLowerCase() === 'manifestcorrected') || consLegStts === '20' ? 'disabledInlineLink' : key;
    	                break;

    				default:
    					break;
        		}

    			tooltipContent += '<tr><td class="bookingOptions"><a class="'
    			+ key + '" href="javascript:void(0);">' + value + '</a></td></tr>';
    		});
        	createDropdown(tooltipContent,currentEle);
        	disableOnReadAccess()
        	if(issueBLAccess ==='N'){
				$('.toolTipWrapper  .issueBL').addClass('disabledLink');
			}else{
				$('.toolTipWrapper  .issueBL').removeClass('disabledLink');
			}
			if(issueManiAccess ==='N'){
				$('.toolTipWrapper  .issueManifestCorrection').addClass('disabledLink');
			}else{
				$('.toolTipWrapper  .issueManifestCorrection').removeClass('disabledLink');
			}
			if(consLegStts === '20' || consLegStts === '21' || consLegStts === '31'){
            	$('.toolTipWrapper  .previewBL').removeClass('disabledLink');
            } else {
            	$('.toolTipWrapper  .previewBL').addClass('disabledLink');
            }
	    	if(consLegStts !== '10' && consLegStts !== '20'){
	    		$('.toolTipWrapper  .viewIssuedBL').removeClass('disabledLink');
	    	}else{
	    		$('.toolTipWrapper  .viewIssuedBL').addClass('disabledLink');
	    	}
        }
	});
});
function disableOnReadAccess(){
	if((nsDoc && docAccess ==='read') || (!nsDoc && bookingAccess ==='read')){
		$('.toolTipWrapper a').addClass('disabledLink');
	}
	$('.toolTipWrapper  .viewLastChanged').removeClass('disabledLink');
}
function createDropdown(content,currentEle){
	content += '</table></div>';
    if(mouseEnter){
       	$('.toolTipWrapper').html(content).show();
    }
    ele = $('.toolTipWrapper');
    $(ele).position({
        my: 'right-9 top-7',
        at: 'right bottom',
        of: $(currentEle)
    });
    $('.createsubbooking').click(function(){
    	$('#mainAddSubBooking').trigger('click')
        })
        afterDropDownMenuBuild()
        createSubBooking()
}
function enableDisableSubLinks(consType, bolStatus) {
	//VMSAG-5138
	
	if(!nsDoc){
		if( bolStatus === '10'){
	        if (consType === 'O' || consType === 'P') {
	            $('.toolTipWrapper  .subBookingCopy').addClass('disabledLink');
	            $('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
	            $('.toolTipWrapper  .viewLastChanged').removeClass('disabledLink');
	            $('.toolTipWrapper  .deleteSubBooking').addClass('disabledLink');
	            $('.toolTipWrapper  .createNewSubBooking').removeClass('disabledLink');
	        } else {
	            $('.toolTipWrapper  .subBookingCopy').removeClass('disabledLink');
	            $('.toolTipWrapper  .makeBillLading').removeClass('disabledLink');
	            $('.toolTipWrapper  .viewLastChanged').removeClass('disabledLink');
	            $('.toolTipWrapper  .deleteSubBooking').removeClass('disabledLink');
	            $('.toolTipWrapper  .createNewSubBooking').removeClass('disabledLink');
	        }
		}
	
	else{
		if (consType === 'O' || consType === 'P') {
	            $('.toolTipWrapper  .subBookingCopy').addClass('disabledLink');
	            $('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
	            $('.toolTipWrapper  .viewLastChanged').removeClass('disabledLink');
	            $('.toolTipWrapper  .deleteSubBooking').addClass('disabledLink');
	            $('.toolTipWrapper  .createNewSubBooking').removeClass('disabledLink');
	        } else {
	            $('.toolTipWrapper  .subBookingCopy').removeClass('disabledLink');
	            $('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
	            $('.toolTipWrapper  .viewLastChanged').removeClass('disabledLink');
	            $('.toolTipWrapper  .deleteSubBooking').addClass('disabledLink');
	            $('.toolTipWrapper  .createNewSubBooking').removeClass('disabledLink');
	        }
	}
	}
	
        if($('#hasWriteAccess').val() === 'N') {
        	$('.toolTipWrapper a:not(.viewLastChanged)').addClass('disabledLink');
        }
        if(nsDoc) {
         if (consType === 'O' || consType === 'P') {
            $('.toolTipWrapper  .subBookingCopy').addClass('disabledLink');
            $('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
            $('.toolTipWrapper  .viewLastChanged').addClass('disabledLink');
        } else {
            $('.toolTipWrapper  .subBookingCopy').removeClass('disabledLink');
            $('.toolTipWrapper  .makeBillLading').removeClass('disabledLink');
            $('.toolTipWrapper  .viewLastChanged').removeClass('disabledLink');
        }
        
        if(bolStatus !== '10'){
        	$('.toolTipWrapper  .deleteSubBooking').addClass('disabledLink');
        	$('.toolTipWrapper  .makeBillLading').addClass('disabledLink');
        } else {
        	$('.toolTipWrapper  .deleteSubBooking').removeClass('disabledLink');
        	$('.toolTipWrapper  .makeBillLading').removeClass('disabledLink');
        }
    	if(nsDoc.detectStatusType(bolStatus).toLowerCase() !== 'created'){       		
			$('.toolTipWrapper  .subBookingCopy').addClass('disabledLink');
			$('.toolTipWrapper  .revertToBooking').addClass('disabledLink');
		} else {
			 $('.toolTipWrapper  .subBookingCopy').removeClass('disabledLink');
			 $('.toolTipWrapper  .revertToBooking').removeClass('disabledLink');
		}
          }
        }
function afterDropDownMenuBuild() {
	 $('.toolTipWrapper').on('click', '.deleteunit', function(e) {
         var cargoId = $(this).attr('data-cargoId'),
             timeStamp = $(this).attr('data-cargotimestamp'),
             currentIndex =$(this).attr('data-index'),
             nextIndex = parseInt(currentIndex) + 1;
         e.stopPropagation();
         e.preventDefault();
         $('.toolTipWrapper').hide();
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
                $('#confirmDialogPopup .rowItem').text('Do you want to delete this Cargo?');
                $('#confirmDialogPopup').find('form').attr('id', 'confirmCargoDelete');
             },
             'cargoId': cargoId,
             'nextIndex': nextIndex,
             'timeStamp': timeStamp
         });
     });
	 $('.toolTipWrapper').on('click','.deleteSubBooking, .deletebooking',
	            function(e) {
	                var isSubBook = $(this).closest('.toolTipList').is('[data-subbookingid]'),
	                    dataToSend, url, dataAttr, dataType, deleteMsg;
	                e.stopPropagation();
	                if (nsBooking.globalBookingFlag.mainBookingFlag) {
	                    nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
	                        nsBooking.globalBookingFlag.fnGoBackWard, 'mainBookingFlag', $(this));
	                    return false;
	                }
	                if (isSubBook) {
	                    dataAttr = 'data-subbookingid';
	                    dataToSend = $(this).closest('.toolTipList').attr(dataAttr);
	                    url = '../subbooking/deleteSubBooking?subbookingId=' + dataToSend + '&bookingId=' +
	                        $(this).attr('data-bookingid') + '&timeStamp=' + ($(this).closest('.toolTipList').attr('data-timestamp') || '0');
	                    dataType = 'mainBookingListWrap';
	                    deleteMsg = 'Sub Booking';
	                } else {
	                    dataAttr = 'data-bookingid';
	                    dataToSend = $(this).closest('.toolTipList').attr(dataAttr);
	                    url = '../booking/deleteBooking?bookingId=' + dataToSend + '&timeStamp=' + ($(this).closest('.toolTipList').attr('data-timestamp') || '0');
	                    dataType = 'mainBookingListWrap';
	                    deleteMsg = 'Booking';
	                }
	                $('.toolTipWrapper').hide();
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
	                            'Do you want to delete this ' + deleteMsg + '?');
	                        $('#confirmDialogPopup').find('form').attr('id',
	                            'confirmDialogForm');
	                    },
	                    dataType: dataType,
	                    dataAttr: dataAttr,
	                    dataToSend: dataToSend,
	                    dataUrl: url
	                });
	            });
}

function createSubBooking(){
//	createSubBooking function starts
	$('.createNewSubBooking, .createsubbooking').click(function(e) {
        var freightChargeBasis = [],
            index = 0,
            blPartyType = [];
        if($(this).hasClass('createsubbooking') && $('.searchNavigation .scndLevel[data-bookingid="'+ $(this).closest('table').attr('data-bookingid')+'"] .expandBooking').hasClass('fa-plus')){
        	nsCore.appModel.addRegisterEvent(this);
        	$('.searchNavigation .scndLevel[data-bookingid="'+ $($(this).closest('table')).attr('data-bookingid')+'"] .expandBooking').trigger('click');
        	return;
        }
        event.stopPropagation();
    	event.preventDefault();
    	nsBooking.isCopiedToFreighted = 'N';
        nsBooking.enableSaveCancel();
        if (nsBooking.globalBookingFlag.mainBookingFlag) {
            nsBooking.fnDirtyDialog(nsBooking.globalBookingFlag.fnGoForward,
                nsBooking.globalBookingFlag.fnGoBackWard,'mainBookingFlag', $(this));
            return false;
        }
        nsBookDoc.subBookingdiffOrgDest(false);
        $('.subBookListFormWrap, .mainBookingDetailsWrap, .routeDetailsAcc').show();
        nsBooking.bookUnitPopUpFlag = false;
        nsBooking.globalBookingFlag.currentEditLevel = 'subBooking';
        $('.bookingUnitLink').attr('disabled', 'disabled');
        $('.bookingUnitLink').css('color', 'grey');
        $('.mainBookingDetailFormTitle, .comHeaderItem').hide();
        $('.subBookLevel, .subBookLevel .mainBookingDetailFormTitle').show();
        $('#totalUnitsRow').show();
        if($(this).hasClass('createNewSubBooking')){
        	nsCore.appModel.lastUserEventTarget = '.createNewSubBooking'
        	$('#possVoyages').removeClass('disabledLink');
        	$('#possVoyages').attr('style','pointer-events:null;cursor:pointer');
        		
        }else{
           	nsCore.appModel.lastUserEventTarget = '.createsubbooking'
        }
        if(nsCore.appModel.fetchBOLInfo.sameLPDP==='N' && $(this).hasClass('createsubbooking') ){
           	$('#totalUnitsRow').hide();
        }
        $('.accElement.routeDetailsAcc').css('width', '100%');
        $('.routeDetailsWrapper').css('width', '80%');
        nsBooking.highlightTreeItem($('.mainSubBookingListWrap .subBookingNbrsCntnt')
            .find('.singleColItem'), $(this), 'activeSubBook ui-selecting');
        $('#mainBookDetailCustomerCode, #mainBookDetailCustomerDesc, #mCustomerRef, #mainContract')
            .attr('disabled', true);
        $('#createFreshBook').find('.formSubmitButtons').hide();
        $('#cargoDetailsTab').attr('data-clicked', false);
        nsBookDoc.panelActions('mainBookingContentWrapper', 'open');
        nsBooking.isCopiedToFreighted = 'N';
        $('#subBlen').removeAttr('disabled');
        $('#subBWid').removeAttr('disabled');
        $('#subBHei').removeAttr('disabled');
        $('#bookedArea').attr('disabled', 'disabled');
        $('#subBVol').attr('disabled', 'disabled');
        $('#shipInfovalidStatus').attr('checked', 'checked');
        $('#freightedLength').removeAttr('disabled');
        $('#freightedWidth').removeAttr('disabled');
        $('#freightedHeight').removeAttr('disabled');
        $('#freightedArea').attr('disabled', 'disabled');
        $('#freightedVolume').attr('disabled', 'disabled');
        $('#shipInfovalidStatus').attr('checked', 'checked');
        e.stopPropagation();
        nsBooking.clearNewSubBook();
        nsBooking.populateCargoStates();
        nsBookDoc.selectePossibleVoyage=[];
        $('input[name="actualLength"]').attr('disabled', 'disabled');
        $('input[name="actualWidth"]').attr('disabled', 'disabled');
        $('input[name="actualHeigth"]').attr('disabled', 'disabled');
        $('input[name="actualWeight"]').attr('disabled', 'disabled');
        $('input[name="actualArea"]').attr('disabled', 'disabled');
        $('input[name="actualVolume"]').attr('disabled', 'disabled');
        if (!($('#mainAddSubBooking').attr('disabled'))) {
            $('.mainSubBookingFormWrap').show();
            $('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').each(function() {
                if ($(this).hasClass('ui-selecting')) {
                    $(this).removeClass('ui-selecting');
                    return false;
                }
            });
            if ($('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').hasClass('.ui-selecting')) {
            	$('.mainBookListCol.subBookContentListCol .singleColItem.thrdLevel').removeClass('ui-selecting');
            }
            nsBookDoc.insertNewAtSubBookingLevel('<div class="newBookLabel treeListLabel thrdLevel ui-selecting activeSubBook">New Sub Booking</div>');
            $('.dropMenuIcon').hide();
            $('.mainSubBookFormTitle').attr('data-subBookingTitle', 'New Sub Booking').text('New Sub Booking');
            $('#mainViewSummaryLink,#bookingAllocItem,.mainMoveUnitsLnk,.billLadingDetailsDivWrapper,'
                + '.possibleVoyageWrap,.possibleVoyageNewWrap').hide();
            $('.mainBookingDetailsWrap .getPossibleVoyages,.subBookingDimensionsInfoWrapper,.routeDetailsWrapper,'
                + '.freightCargoDetailsDivWrapper,.mainSubBookingFormWrap,.mainBookingDetailsWrap '
                + '.showPreviousVoyageClass,.mainBookingDetailsWrap .showPreviousVoyageClasslbl').show();
            $('.mainMoveUnitsLnk,#mainViewSummaryLink,.routeDetailsWrapper,.possibleVoyageWrap').hide();
            $('#possVoyagesHide').hide();
            $('.defaultSearchMsg').hide();
            $('#consignmentId').val('');
            nsBooking.doInitFreshSubBook();
            $('#bookingDocOfficeId').val($('#mDocID').val());
            $('#bookingDocCode').val($('#mDocCode').val());
            $('#bookingDocDesc').val($('#mDocName').val());
            $('#mainBookDetailCustomerCode').attr('disabled', 'disabled');
            $('#mainBookDetailCustomerDesc').attr('disabled', 'disabled');
            $('#mCustomerRef').attr('disabled', 'disabled');
            $('#mainContract').attr('disabled', 'disabled');
            $('#mainBookDetailCustomerOrigin').removeAttr('disabled');
            $('#mainBookDetailCustomerDestination').removeAttr('disabled');
            $('#mainBookDetailCustomerOriginDesc').removeAttr('disabled');
            $('#mainBookDetailCustomerDestinationDesc').removeAttr('disabled');
            nsBooking.mainBookingFlag.changedOriginDest = false;
            $('#totalBookedUnits').val('');
            $('#totRCD').text('');
            $('#totLDD').text('');
            $('#totDisc').text('');
            $('#totDel').text('');
            $('select[name="bookingAllocStatus"]').removeAttr('disabled');
            freightChargeBasis = nsBooking.chargeBasisOptions.slice();
            index = freightChargeBasis.indexOf('PC,Per cent of freight');
            if (index !== -1) {
                freightChargeBasis.splice(index, 1);
            }
            $('#mainBookingFreightBasis').html(nsBookDoc.generateSelect(freightChargeBasis, '', true));
            $('#mainBookingFreightCurrency').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
            $('.chargeType').html(nsBookDoc.generateSelect(nsBooking.chargeTypeOptions, '', true));
            $('.chargeBasis').html(nsBookDoc.generateSelect(nsBooking.chargeBasisOptions, '', true));
            $('.chargeCurrency').html(nsBookDoc.generateCurrencySelect(nsBooking.currencyOptions, '', true));
            nsBookDoc.addDefaultCharges();
            $('#chargeGrossFreight').prop('checked', false);
            $('#chargeSubBookings').prop('checked', false);
            $('select[name="cargoEquipmentNbr"]').removeAttr('disabled').val('');
            $('input[name="cargoEquipmentType"]').val('');
        }
        nsBooking.isEnableRateButton(false);
        $('.chargeCurrency').val(nsBooking.defaultCurrencyCode.slice(1,-1));
        $('#chargePayment').val('P');
        $('#mainBookingFreightCurrency').val(nsBooking.defaultCurrencyCode.slice(1,-1));
        $('.billLadingPartyContentWrapper .ladingPartyItem')
            .find('select.blParty option[value !="00"]:selected').each(function(i, obj) {
            blPartyType.push($(obj).val());
        });
        $('#mainBookingFreightCommission').attr('disabled', 'disabled');
        $.each(blPartyType, function() {
            if (blPartyType[index] === '30') {
                $('#mainBookingFreightCommission').removeAttr('disabled');
            }
        });
        nsBooking.legChangedAction('E', 'Y');
        $('.routeDetailGrid tbody tr').each(function() {
            if ($(this).find('.selectedRoute').is(':checked')) {
                if ($(this).find('.selectedRoute').attr('data-vesselvoyage')) {
                    $('#thirdPartyVoyage').css('visibility', 'hidden');
                } else {
                    $('#thirdPartyVoyage').css('visibility', 'visible');
                    $('#voyageCarrier').prop('disabled', true);
                    $('#voyageCarrier').val('');
                    $('.carrierOtherDetails').val('');
                    $('.carrierOtherDetails').attr('disabled', 'disabled');
                }
            }
        });
        $('#bookingAllocStatus').val('Y');
        $('#bookingAllocStatus').removeAttr('disabled');
        $('#bookedMeasureUnit').val(nsBookDoc.defaultMeasUnit);
        $('#freightedMeasureUnit').val(nsBookDoc.defaultMeasUnit);
        $('#actualMeasureUnit').val(nsBookDoc.defaultMeasUnit);
        nsBookDoc.dimensionTableUnits($('#mainBookingDimensionsGrid tbody tr'));
        $('#bookingBLNbr').attr('disabled', true);
        $('#shippedOnboard').removeAttr('checked');
        nsBooking.enableSaveCancel();
        $('.toolTipWrapper').hide();
    });

    $('#cargoEquipmentNbr').change(function() {
        var selectedVal = $('#cargoEquipmentNbr').val();
        $('#cargoEquipmentType').val(unescape(selectedVal));
    });

//    createSubBooking function ends
	}
function insertNewAtBookingLevel(tag){
	if($('.frthLevel') && $('.frthLevel').length!==0 && $('.thrdLevel').length >= 1){
    	$(tag).insertAfter($('.searchNavigation').find('.frthLevel').last())
    }else if($('.thrdLevel') && $('.thrdLevel').length!==0 && $(".searchNavigation").find("div:last").parent().hasClass('thrdLevel')){
    	$(tag).insertAfter($('.searchNavigation').find('.thrdLevel').last())
    }else{
	    		 
    	if($(".thrdLevel:visible").length > 0){
    		$(tag).insertAfter($('.thrdLevel:visible').last());
    	}
    	else{
    		$(tag).insertAfter($('.scndLevel:visible').last());
    	}
    		 
    		 $('.scndLevel:visible').each(function(index){
    				if($(this).next().hasClass('frstLevel')){
    					$(this).addClass('bottomBorder');
    				}
    				else{
    					$(this).removeClass('bottomBorder');
    				}
    			});
		}
	$('.frstLevel.activeFirstLevel').addClass('withNewBooking');
}
function panelActions(Wrapper, opType) {
    if (opType === 'close') {
        $('.' + Wrapper + ' .accContent').slideUp();
        $('.' + Wrapper + ' .accHeader').removeClass('bdrBtmNo');
        $('.' + Wrapper + ' .accEleIndicator').removeClass('fa-minus').addClass('fa-plus');
    } else {
    	if(opType === 'open') {
    		$('.' + Wrapper + ' .accContent').slideDown();
            $('.' + Wrapper + ' .accHeader').addClass('bdrBtmNo');
            $('.' + Wrapper + ' .accEleIndicator').removeClass('fa-plus').addClass('fa-minus');
    	}
    }
}
function clearNewBookingNavigation(){
	$('.frstLevel_dummy').remove();
	$('.scndLevel_dummy').remove();
	}
function collapseAllNavigation(){
	$('.thrdLevel').remove();
	$('.frthLevel').remove();
	$('.scndLevel').hide();
	}
function addingBottomBorderScndLevel(){
	$('.scndLevel:visible').each(function(index){
		if($(this).next().hasClass('frstLevel') || $(this).next().hasClass('frstLevel_dummy')){
			$(this).addClass('bottomBorder');
		}
		else{
			$(this).removeClass('bottomBorder');
		}
	});
	$('.thrdLevel:visible').each(function(index){
		if($(this).next().hasClass('frstLevel') || $(this).next().hasClass('frstLevel_dummy')){
			$(this).addClass('bottomBorder');
		}
		else{
			$(this).removeClass('bottomBorder');
		}
	});
	$('.frthLevel:visible').each(function(index){
		if($(this).next().hasClass('frstLevel') || $(this)===$( ".searchNaviagion div:last-child" ) || $(this).next().hasClass('frstLevel_dummy')){
			$(this).addClass('bottomBorder');
		}
		else{
			$(this).removeClass('bottomBorder');
		}
	});
}
function removeDropDownIcon(){
	if($('.activeNavigationItem .mainBookingItemIcons .subBookingInlineMenu ').length===1 || $('.activeNavigationItem .mainBookingItemIcons .bookingInlineMenu').length===1){
	 	$('.activeNavigationItem .mainBookingItemIcons').removeAttr('style');
	 }
}
searchNaviationObj= {
		'quantityForCB':0.0283168,
		'quantityForWL':2.20462,
		'twoTwoFourZero':2240,
		'quantityForCF':35.3146667214,
		'quantityForWM':0.453592,
		'threeZeroFourEight':0.3048,
		'quantityForWL1':3.28084,
		'quantityForLM':0.0254,
		'stCompValue':3.28083,
		'convLengthVal':39.370,
        'insertNewAtBookingLevel':insertNewAtBookingLevel,
        'getBookingAllocStatus': '/Vms/booking/getBookingAllocStatus?bookId=',
        'globalBookingFlag': {'mainBookingFlag': false},
        'cargoListArray':[],
        'cargoSubBookTimeStamp':'',
        'prevLegETA':'',
        'panelActions': panelActions,
        'frthLvlId':'',
        'clearNewBookingNavigation':clearNewBookingNavigation,
        'collapseAllNavigation':collapseAllNavigation,
        'addingBottomBorderScndLevel':addingBottomBorderScndLevel,
        'removeDropDownIcon': removeDropDownIcon,
        'isEnableRouteDetail':'Y'
  };
$.extend(true, nsBookDoc, searchNaviationObj);
})(this.bookDoc, jQuery, this.vmsService, this.core, this.booking, this.doc);