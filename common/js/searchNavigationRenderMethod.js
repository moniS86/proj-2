/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';

(function(nsBookDoc, $, nsCore, nsDoc) {
	var bdtObj = {};
	
function generateSingleSubBookingItem(bookingId, subBookingId, subTitle, canRemove, className, timeStamp, consLegTimeStamp, consignmentLegId, bolstatus, printed,bolId, response) {
	 var bolIcon='',iconNoVin='',
	 	textColor, mainLegId = '', displaySubTitle='', returnStatusIcon=[];
	 if(response && response.subBookingList){
		 $.each(response.subBookingList, function(i,v){
			 if(v.id === subBookingId && v.consignmentLeg.consignmentType === 'M'){
				 mainLegId = v.consignmentLeg.id;
			 }			
		 })		 
		 if(!mainLegId && response.subBookingList.length>0){
			 mainLegId = response.subBookingList[0].consignmentLeg.id;	 
		 }
	 }
	 returnStatusIcon = nsBookDoc.statusIcon(bolstatus, printed);
	 bolIcon = returnStatusIcon[0];
	 textColor = returnStatusIcon[1];	 
	 iconNoVin ='<i class="fa fa-plus expandSubBooking"></i>'    
 	 if(nsDoc){
 		 displaySubTitle=subTitle.substr(subTitle.indexOf('- ')+2);
	 }else{
		 displaySubTitle=subTitle
	 }
    return '<div data-subbookingid="' + subBookingId + '" data-bookingId="' + bookingId+ '" data-bolid="'+ bolId + '" data-bolStatus="' + bolstatus
        + '"data-timestamp="' + (timeStamp || '0') + '" data-consLegTimeStamp="' + (consLegTimeStamp || '0') + '" data-consignmentLegId="' + (consignmentLegId || '0') 
        + '" data-filtering="' + subTitle + '" data-mainLegConsId="' + mainLegId+ '" data-currentlegid="' + (consignmentLegId || '0')
        + '" class="cargoVin billVin singleColItem thrdLevel clippedTitle">'+iconNoVin+'<i class="fa '+ bolIcon +' statusIcon" style="color:'+textColor+'"></i><span><a href="javascript:void(0)">'
        + displaySubTitle + '</a></span><div class="mainBookingItemIcons"><span class="icons_sprite subBookingInlineMenu roundDownArrowIcon fa fa-caret-down dropMenuIcon">'
        + '</span></div></div>';
}
function statusIcon(bolstatus, printed){
	var bolIcon, textColor;
	if(bolstatus==='10' && printed==='No'){
 		bolIcon= '';
 		textColor='#000000;'
 	}else if((bolstatus==='20' || bolstatus==='21' || bolstatus==='31')){
 		bolIcon= 'fa-file-o';
 		textColor='#000000;'
	}else if((bolstatus==='30') && printed==='No'){
		bolIcon= 'fa-file';
		textColor='#9b9b9b;'
	}else if((bolstatus==='30') && printed==='Yes'){
		bolIcon= 'fa-file-text';
		textColor='#9b9b9b;'
	}
	else if (bolstatus==='99'){
		bolIcon= 'fa-fa-unlockImg';
		textColor='#ff0000;'
	}
	else if((bolstatus==='50' || bolstatus==='51' || bolstatus==='75') && printed==='No'){
		bolIcon= 'fa-file';
		textColor='#000000;'
	}else if((bolstatus==='50' || bolstatus==='51'||bolstatus==='75') && printed==='Yes'){
		bolIcon= 'fa-file-text';
		textColor='#000000;'
	}
	return [bolIcon, textColor];
}
function loadMainBookingTree(response) {
    var mainBookingListContent = '',
     searchCriteriaResultList=[],
     bookingId,
     groupByValue='';
    if(nsCore.getPage(window.location.href)==='booking'){
    	searchCriteriaResultList= response.searchCriteriaResultsList
    }else if(nsCore.getPage(window.location.href)==='documentation'){
    	searchCriteriaResultList= response.searchCriteriaResultList
    }
    groupByValue = $('.searchGroupBy')[0].value;
    if(nsCore.getPage(window.location.href)==='documentation'){
    	
	    if(groupByValue==='originDestinationPortSet') {
	    		groupByValue = 'originDestPortSet';
	    	}
	    if(groupByValue==='loadDischargePortSet') {
			groupByValue = 'lpDpSet';
		}
    }
    
    var groupSet= groupBy(searchCriteriaResultList, groupByValue)
    var temp = "";
    $.each(groupSet, function(i,val){
            if(i === 'undefined'){
                   temp = val;
                   delete groupSet['undefined'];
                   groupSet['No Voyage'] = temp;
            }   
            
          });
   
    Object.keys(groupSet).sort().forEach(function(category, k){
    	var cat=category;
    	mainBookingListContent+="<div class='frstLevel' id='frstLevel_"+k+"_"+groupSet[category].length+"'><div class='custCodePanel'>"+cat+"</div><i class='fa fa-chevron-down chevronArrow'></i><div class='clearAll'></div></div>"
    	if(groupSet[category]){
    	groupSet[category].forEach(function(memb,i){
		 var blStatus = '', isUnclockedBl = (memb.blStatusNum === '75' || memb.blStatusNum === '99') ? 'unlockedBill' : '';
         if (memb.blStatus !== null && memb.blStatus !== '') {
             blStatus = memb.blStatus;
         }
         
         bookingId=memb.bookingId?memb.bookingId:memb.bookId;
        /*		 booking deletable needed or not
         canRemove = (memb.bookingDeletable === 'Yes') ? 'rowRemoveIcon' : 'rowRemoveDisabledIcon';*/
         
         if(window.location.href.indexOf("documentation") > -1) {
        	 mainBookingListContent += '<div data-bolStatus="' + blStatus + '" data-timestamp="' + memb.timeStamp
             + '" data-bookingId="' + bookingId + '" data-bolId="' + memb.blId + '" data-filtering="' + memb.bookingNumber + '" data-bolprintstatus="'+ memb.blPrintStatus+ '" data-bolstatusnumber="'+ memb.blStatusNum +'" data-conslegstatusnum="' + memb.consLegStatus + '" data-deletable="' + memb.bookingDeletable
             + '" class="scndLevel billVin '+ isUnclockedBl +' singleColItem" id="scndLevel_'+k+'_'+i+'"><a href="javascript:void(0)"><i class="fa fa-plus expandBooking"></i><span class="inlinePanel">' + memb.bookingNumber
             + '</span><div class="clearAll"></div></a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu '
             + 'roundDownArrowIcon fa fa-caret-down dropMenuIcon"></span></div></div>';
         }
         else{
        	 mainBookingListContent += '<div data-bolStatus="' + blStatus + '" data-timestamp="' + memb.timeStamp
             + '" data-bookingId="' + bookingId + '" data-bolId="' + memb.blId + '" data-filtering="' + memb.bookingNumber + '" data-bolprintstatus="'+ memb.blPrintStatus+ '" data-bolstatusnumber="'+ memb.blStatusNum +'" data-conslegstatusnum="' + memb.consLegStatus + '" data-deletable="' + memb.bookingDeletable
             + '" class="scndLevel billVin '+ isUnclockedBl +' singleColItem" id="scndLevel_'+k+'_'+i+'"><a href="javascript:void(0)"><i class="fa fa-plus expandBooking"></i><span class="inlinePanel">' + memb.bookingNumber.substr(memb.bookingNumber.length - 8)
             + '</span><div class="clearAll"></div></a><div class="mainBookingItemIcons dropMenuIconContainder"><span class="icons_sprite bookingInlineMenu '
             + 'roundDownArrowIcon fa fa-caret-down dropMenuIcon"></span></div></div>';
         }
         
       })
    }
    })
    mainBookingListContent="<div class='searchNavigation'>"+mainBookingListContent+"</div>"
    $('.mainBookingListWrap .mainBookingCount').html(searchCriteriaResultList.length);
    $('.mainBookingListWrap .subBookContentListCol.subBookingNbrsCntnt').html(mainBookingListContent);
    if (!$('.leftSearchMenuContent').hasClass('activeMenu')) {
        $('.subBookListColWrap').show();
         }else{
        $('.searchRes').show();
         }
	}
	function groupBy(xs, key) {
		  return xs.reduce(function(rv, x) {
			  
		    rv[x[key]] = rv[x[key]] || [];
		    rv[x[key]].push(x);
		    return rv;
		  }, {});
	}
	function clippedTitle(title,len){
		if(title.length>len){
			return(title.substring(0,len-3)+'...')
		}
		return title;
	}
	 function createSubBookinCntnt(vin, cargocon, dataUnitItem, iconVisiblilty, ind, cargoDetTimeStamp) {
	        var subBookingsContent = '';
	        if (dataUnitItem === 'Bkd') {
	            subBookingsContent += '<div data-index="' + ind + '" data-cargoUnitId="' + nsBookDoc.escapeHtml(vin)
	                + '" data-cargoId = "' + cargocon.cargo.id + '" data-filtering="' + nsBookDoc.escapeHtml(vin)
	                + '" data-cargotimestamp="' + cargoDetTimeStamp //nsBooking.escapeHtml(cargocon.cargo.timeStamp)
	                + '" class="CargoUnitVin singleColItem frthLevel clippedTitle">' + cargoSearchCriteria(cargocon) +'<span class="span2">' + nsBookDoc.escapeHtml(vin)
	                + '</span><div class="mainBookingItemIcons"><span class="icons_sprite subBookingInlineMenu roundDownArrowIcon fa fa-caret-down dropMenuIcon" style="display: none;">'
	                + '</span></div></div>';
	        } else if (dataUnitItem === 'Rcd') {
	            if (cargocon.dateReceived) {
	                subBookingsContent += '<div data-index="' + ind + '" data-cargoUnitId="' + nsBookDoc.escapeHtml(vin)
	                    + '" data-cargoId = "' + cargocon.cargo.id +'"data-cargotimestamp = "'+cargoDetTimeStamp +'" data-filtering="'
	                    + nsBookDoc.escapeHtml(vin) + '" class="CargoUnitVin singleColItem frthLevel"><span>'
	                    + nsBookDoc.escapeHtml(vin) + '</span></div>';
	            }
	        } else {
	            if (dataUnitItem === 'Ldd' && cargocon.dateLoaded) {
	                subBookingsContent += '<div data-index="' + ind + '" data-cargoUnitId="' + nsBookDoc.escapeHtml(vin)
	                    + '" data-cargoId = "' + cargocon.cargo.id + '"data-cargotimestamp = "'+cargoDetTimeStamp+'" data-filtering="' + nsBookDoc.escapeHtml(vin)
	                    + '" class="CargoUnitVin singleColItem frthLevel clippedTitle"><span>' + nsBookDoc.escapeHtml(vin) + '</span></div>';
	            }
	        }
	        return subBookingsContent;
	    }
	 
	 function cargoSearchCriteria(cargocon){
		 if(nsCore.appModel.bookDocSearchCriteria.cargoStatus){
			 switch (nsCore.appModel.bookDocSearchCriteria.cargoStatus) {
		         case '1': //Not Received        	 
		        	return returnHtml(cargocon.dateReceivedStr,true,cargocon.cargo.vinNumber)
		             break;
		         case '2': //Received        	 
		        	 return returnHtml(cargocon.dateReceivedStr,false,cargocon.cargo.vinNumber)
		             break;
		         case '3': //Released to Load	    	 	
		        	 return returnHtml(cargocon.dateReleasedLoadStr,false,cargocon.cargo.vinNumber)
		             break;
		         case '4': //Loaded        	 	
		        	 return returnHtml(cargocon.dateLoadedStr,false,cargocon.cargo.vinNumber)
		             break;
		         case '5': //Not Loaded        		
		        	 return returnHtml(cargocon.dateLoadedStr,true,cargocon.cargo.vinNumber)
		            break;         
		         default:
		        	 return '';	
		             break;
			 }
		 }
		 else if(nsCore.appModel.bookDocSearchCriteria.vinNumber){ //only Vinnumber Search
			 return  matchSearchCriteria(cargocon.cargo.vinNumber) ?'<span class ="dot"></span>' : '';
		 }		 
	  return '';		
	 }
	  
	function returnHtml(value,notLdRcdCheck,vin){
			 
			 if(nsCore.appModel.bookDocSearchCriteria.vinNumber){			 
				 if(notLdRcdCheck){		 
					 if(!value && matchSearchCriteria(vin)){
			    		 return '<span class ="dot"></span>';
			    	 }
				 }
				 else {
					 if(value && matchSearchCriteria(vin)){
			    		 return '<span class ="dot"></span>';
			    	 }
				 }				 
			 }
			 else{
				 if(notLdRcdCheck){		 
					 if(!value){
			    		 return '<span class ="dot"></span>';
			    	 }
				 }
				 else {
					 if(value){
			    		 return '<span class ="dot"></span>';
			    	 }
				 }	 
			 }
			 return '';		 
		 }
	 
	 function matchSearchCriteria(vin){		
		 ieBrowserSupportPollyFillES6();
		if(vin){
			 switch (nsCore.appModel.bookDocSearchCriteria.vinNoQuery) {
		         case 'Need Exact match':        	 
		        	return (nsCore.appModel.bookDocSearchCriteria.vinNumber.toUpperCase() === vin.toUpperCase())? true : false;
		             break;
		         case 'Begins with':       	 
		        	 return vin.toUpperCase().startsWith(nsCore.appModel.bookDocSearchCriteria.vinNumber.toUpperCase())? true : false;
		             break;
		         case 'Contains': 	    	 	
		        	 return vin.toUpperCase().includes(nsCore.appModel.bookDocSearchCriteria.vinNumber.toUpperCase())? true : false;
		             break;
		         case 'Ends with':       	 	
		        	 return vin.toUpperCase().endsWith(nsCore.appModel.bookDocSearchCriteria.vinNumber.toUpperCase())? true : false;
		             break; 
		         default:
		        	 return false;	
		             break;
			 	}	 
		 }
		 return false;	 
	 }
	 
	function ieBrowserSupportPollyFillES6(){		
	 if (!String.prototype.startsWith) {
		    Object.defineProperty(String.prototype, 'startsWith', {
		        value: function(search, rawPos) {
		            var pos = rawPos > 0 ? rawPos|0 : 0;
		            return this.substring(pos, pos + search.length) === search;
		        }
		    });
		}
	 if (!String.prototype.endsWith) {
			String.prototype.endsWith = function(search, this_len) {
				if (this_len === undefined || this_len > this.length) {
					this_len = this.length;
				}
				return this.substring(this_len - search.length, this_len) === search;
			};
		}
	 if (!String.prototype.includes) {
		  String.prototype.includes = function(search, start) {
		    'use strict';
		    if (typeof start !== 'number') {
		      start = 0;
		    }

		    if (start + search.length > this.length) {
		      return false;
		    } else {
		      return this.indexOf(search, start) !== -1;
		    }
		  };
		}
	 }
	 
   bdtObj = {
   'loadMainBookingTree': loadMainBookingTree,
   'generateSingleSubBookingItem' : generateSingleSubBookingItem,
   'createSubBookinCntnt':createSubBookinCntnt,
   'clippedTitle':clippedTitle,
   'defaultMeasUnit': localStorage.getItem('measurementType'),
   'statusIcon':statusIcon
   }
   $.extend(true, nsBookDoc, bdtObj);
  
})(this.bookDoc, jQuery, this.core, this.doc);