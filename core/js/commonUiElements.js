/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function (nsCore, vmsService, $) {
    var commonUiElements = {};

    function portAutoComplete(codeField, nameField,formField) {
        var portCodes = [],
            portDesc = [],
            i,
            portCodeList,
            portCodeCount,
            selectedVal;
        portCodeList = nsCore.modifySmartObj(nsCore.smartData.portCode, {
            'index': ['portCode'],
            'target': ['portName']
        });
        portCodeCount = portCodeList.length;
        for (i = 0; i < portCodeCount; i++) {
            portCodes.push(portCodeList[i].portCode);
            portDesc.push(portCodeList[i].portName);
        }
        portCodes.sort();
        portDesc.sort();
        $(codeField).autocomplete({
            source: nsCore.beginWithAutoComplete(portCodes),
            search: function() {   
            	$(this).closest('.doubleInput').find(codeField).attr(formField,'0');
            },
            select: function (event, ui) {
                var portCodeIndex = -1;
                selectedVal = ui.item.value;
                portCodeIndex= portCodeList.map(function (a) { return a.portCode; }).indexOf(selectedVal);
                if (portCodeIndex>-1){
                    $(this).closest('.doubleInput').find(codeField).attr(formField,selectedVal);
                     $(this).closest('.doubleInput').find(nameField).val(portCodeList[portCodeIndex].portName)
                        .attr(formField,portCodeList[portCodeIndex].portName);
               }
            },
            autoFocus: true,
            delay: 0
        });
        $(nameField).autocomplete({
            source: nsCore.beginWithAutoComplete(portDesc),
            search: function() {  
            	$(this).closest('.doubleInput').find(nameField).attr(formField,'0');            
            },
            select: function (event, ui) {
            	var portDescIndex = -1;
            	selectedVal = ui.item.value;
                portDescIndex = portCodeList.map(function (a) { return a.portName; }).indexOf(selectedVal);
                if (portDescIndex>-1){
                    $(this).closest('.doubleInput').find(codeField).val(portCodeList[portDescIndex].portCode).attr(formField, portCodeList[portDescIndex].portCode);
                    $(this).closest('.doubleInput').find(nameField).val(portCodeList[portDescIndex].portCode)
                }
            },
            autoFocus: true,
            delay: 0
        });

        $(codeField).blur(function (e) {
            nsCore.delInvalidAutoFeilds(codeField, nameField, $(this).val(), portCodes, e);
        });
        $(nameField).blur(function (e) {
            nsCore.delInvalidAutoFeilds(codeField, nameField, $(this).val(), portDesc, e);
        });
    }
    
    function autoCmpltSourceData(val, response, sData){
    	var arr = [];
    	if (!(val)){
    		arr = [];
    	} else {
    		arr = sData;
    	}
    	response(arr.filter(function(a){return a.label.toLowerCase().indexOf(val.toLowerCase()) >-1}).slice(0, 100));
    }
    function defaultVesselSearch(field, voyage, form) {
 	   $(field).attr(form, '0');
 	   $(voyage).val('').prop('disabled', true);
 	   
    }
    function defaultVesselSelect(code, name, form, voyage, ui) {
  	  $(voyage).prop('disabled', false);
  	$(voyage).prop('readonly', false);
        $(name).val(ui.item.value).attr(form, ui.item.value);    	          
        $(code).val(ui.item.name);
    }
    function vesselAutoComplete(codeField, nameField,formField,voyageId,searchFun,selectFun) {
    	
    	$(nameField).autocomplete({
    	       search : function() {
    	    	   if(searchFun){
    	    		   searchFun()
    	    		}else{
    	    			defaultVesselSearch(nameField, voyageId, formField);
    	    		}
    	       },
    	       minLength : 1,
    	       delay: 0,
    	       source : function(request, callback){
    	            var searchParam  = request.term,
    	            	sData = nsCore.modifySmartObj(nsCore.smartData.vesselDesc, {
    	        	          'index' : ['value', 'label'],
    	        	          'target' : ['name']
    	        	       }).sort(function(a, b) {
    	        	          return a.label.localeCompare(b.label);
    	        	       });
    	            autoCmpltSourceData(searchParam, callback, sData);
    	        },
    	       autoFocus : true,
    	       select : function(event, ui) {
    	    	   if(selectFun){
    	    		   selectFun(event, ui, this)
   	    		}else{
   	    			defaultVesselSelect(codeField, nameField, formField, voyageId, ui);
   	    		}
    	       }
    	    }).bind(
                  'keydown cut',
                  function() {
                      var inst = this;
                      setTimeout(function() {
                          if ($(inst).val().length === 0) {
                              $(inst).closest('form').find(voyageId).val('').attr(formField, '0').prop(
                                  'disabled', true);
                          }
                      }, 100);
                  });
    	       	    
    	    $(codeField).autocomplete({
    	       search : function() {
    	         if(searchFun){
    	        	 searchFun()
	  	    		}else{
	  	    			defaultVesselSearch(codeField, voyageId, formField);
	  	    		}
    	       },
    	       minLength : 1,
    	       delay: 0,
    	       source :function(request, callback){
	   	            var searchParam  = request.term,
		   	         sData = nsCore.modifySmartObj(nsCore.smartData.vesselCode, {
	       	          'index' : ['value', 'label'],
	       	          'target' : ['name']
	       	       }).sort(function(a, b) {
	       	          return a.label.localeCompare(b.label);
	       	       });
		            autoCmpltSourceData(searchParam, callback, sData);	
    	       },
    	       autoFocus : true,
    	       select : function(event, ui) {
    	    	if(selectFun){
    	    		selectFun(event, ui, this);
      	    		}else{
      	    			defaultVesselSelect(nameField, codeField, formField, voyageId, ui);
      	    		}
    	       }
    	    }).bind(
                    'keydown cut',
                    function() {
                        var inst = this;
                        setTimeout(function() {
                            if ($(inst).val().length === 0) {
                                $(inst).closest('form').find(voyageId).val('').attr(formField, '0').prop(
                                    'disabled', true);
                            }
                        }, 100);
                    });
    	    
    	    $(nameField).blur(function(e){
    	        nsCore.delInvalidAutoFeilds(nameField, codeField,$(this).val(), JSON.parse(localStorage.vesselNames), e);
    	    });
    	    $(codeField).blur(function(e){
    	        nsCore.delInvalidAutoFeilds(codeField, nameField,$(this).val(), JSON.parse(localStorage.vesselCodes), e);
    	    });
    }
    

        //function to intialise autocomplete for countryCode
    function countryAutocomplete(codeField, nameField,formField) {
        var responseDTOList = nsCore.modifySmartObj(nsCore.smartData.countryCode, {
                'index': ['countryCode'],
                'target': ['countryName']
            }),
            count1 = responseDTOList.length,
            countryCodes = [],
            countryNames = [],
            l = 0,
           // b = 0,
            fCount,
            selectedVal;
        for (l = 0; l < count1; l++) {
            countryCodes.push(responseDTOList[l].countryCode);
            countryNames.push(responseDTOList[l].countryName);
        }

        $(codeField).autocomplete({
            autoFocus: true,
            source: countryCodes,
            select: function(event, ui) {
                selectedVal = ui.item.value;
                for (fCount = 0; fCount < count1; fCount++) {
                    if (selectedVal === responseDTOList[fCount].countryCode) {
                        $(nameField).val(responseDTOList[fCount].countryName);
                    }
                }
            }
        });
        $(codeField).change(function(){
            nsCore.delInvalidAutoFeilds(codeField, nameField,$(codeField).val());
        });
        $(nameField).autocomplete({
            source: countryNames,
            autoFocus: true,
            select: function(event, ui) {
                selectedVal = ui.item.value;
                for (fcnt = 0; fcnt < count1; fcnt++) {
                    if (selectedVal === responseDTOList[fcnt].countryName) {
                        $(codeField).val(responseDTOList[fcnt].countryCode);
                    }
                }
            }
        });
        $(nameField).change(function(){
            nsCore.delInvalidAutoFeilds(nameField, codeField,$(nameField).val(), flagDesc);
        });
    }
    commonUiElements = {
        'countryAutocomplete': countryAutocomplete,
        'portAutoComplete': portAutoComplete,
        'vesselAutoComplete': vesselAutoComplete
    }
    $.extend(true, nsCore, commonUiElements);
})(this.core, this.vmsService, jQuery);