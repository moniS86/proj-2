/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
this.bookDoc = {};
(function(nsBookDoc, $, nsBooking, nsDoc, nsCore) {

    var ComUtilityObjBD = {
        'generateCurrencySelect' : generateCurrencySelect,
        'addEditLeglabel' :addEditLeglabel,
        'isEnableRouteDetail' : 'Y',
        'isRouteDetailChanged' : false,
        'isOrgDestChanged' : false,
        'bookOrigin' : '',
        'bookDest' : '',
        'moveUnitPortPair' : '',
        'existingRouteDetails' : {
        	'vesVoy' : [],
            'newVesVoy' : [],
            'legCount' : 0,
            'newLegCount' : 0,
            'addEdit':[],
            'newLoadPort':[],
            'newDisPort':[],
            'newETD':[],
            'newETA':[],
            'oldLoadPort':[],
            'oldDisPort':[],
            'oldETD':[],
            'oldETA':[],
        }
    };

    function generateCurrencySelect(options, selected, onlyOptions) {
        var dropDownText = '';
        if (selected.length === 5) {
            selected = selected.slice(1, -1)
        }
        if (!onlyOptions) {
            dropDownText += '<div class="formInputWrap"><select> ';
        }
        $.each(options,
            function(i, obj) {
                var optionValue = obj.split(','), isSelected = optionValue[0] === selected ? ' selected ' : '';
                dropDownText += '<option value="' + optionValue[0] + '" ' + isSelected + '>' + optionValue[0]
                    + '</option>';
            });
        if (!onlyOptions) {
            dropDownText += '</select></div>';
        }
        return dropDownText;
    }
    
    function addEditLeglabel(){
    	
		var tableObjMain="#editMainCarriageLegGrid_wrapper .dataTables_scrollHeadInner", tableObjOn="#editCarriageLegGrid_wrapper .dataTables_scrollHeadInner";		
		tableObjMain = $(tableObjMain).length===0? ' #editMainCarriageLegGrid':'#editMainCarriageLegGrid_wrapper .dataTables_scrollHeadInner';
		tableObjOn = $(tableObjOn).length===0? ' #editCarriageLegGrid':'#editCarriageLegGrid_wrapper .dataTables_scrollHeadInner'; 
		
	   if($("#editConsType").val()==="M"){
			$(tableObjMain).find("thead tr:nth-child(1) th").text("Main leg")
	   }
	   else if($("#editConsType").val()==="O"){
		   $(tableObjMain).find("thead tr:nth-child(1) th").text("On-carriage")
	   }
	   else{
		   $(tableObjMain).find("thead tr:nth-child(1) th").text("Pre-carriage") 
	   }
		
	   if($("#nextEditConsignmentType").val() && $("#nextEditConsignmentType").val()==="O"){
			$(tableObjOn).find("thead tr:nth-child(1) th").text("On-carriage")	
	   }
	   else if($("#nextEditConsignmentType").val() && $("#nextEditConsignmentType").val()==="M"){
		   $(tableObjOn).find("thead tr:nth-child(1) th").text("Main leg")	
	   }
	   else{
       		$(tableObjOn).find("thead tr:nth-child(1) th").text("Pre-carriage")	
	   }
    }
    
    $.extend(true, nsBookDoc, ComUtilityObjBD);
})(this.bookDoc, jQuery, this.booking, this.doc, this.core);
