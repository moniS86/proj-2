/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
(function(nsCargo, $, vmsService, nsCore) {
    var cargoInitObj = {
            'leftMenuSearch': leftMenuSearch,
            'cargoSearchCall': cargoSearchCall
        },
        extObj = {},
        dateFormat = localStorage.getItem('dateFormat'),
    // This method is used to load the grid data based on the search result
    cargoMgmtGridColumnData = [{
        sWidth: '33px',
        bSortable: false,
        sClass: 'checkBoxCell',
        searchable: true,
        render: function(data, type, full) {        	
        	var className = ((full.isEditable === 'N' || (full.isLpOutbound ==='N' && full.isDpInbound==='N')) ? 'selectCargo' : 'selectCargo selectable');
            return '<input type="hidden" id="selCargo"  value="' + full.id + '"/>'
			+ '<input type="checkbox"  class="' + className + '" name="selectCargo" data-cargoTcn="'+ full.cargoTcn
            + '" data-cargoConsTcn="'+ full.cargoConsTcn + '" data-consLegTcn="'+ full.consLegTcn + '" data-consTcn="'+ full.consTcn + '" id=' + full.id + '>';
        }
    }, {
        width: '150px',
        class: 'cargoVin',
        data: 'vinNo',
        render: function(data, type, full) {
            var vin;
            if (!nsCargo.isNewCargo(full.vinNo)) {
                vin = data.replace(/</g, '&lt;');
                return '<span class="greenText newCargo" id="vinNo">' + vin + '</span><span class="icons_sprite existingVin cargoDetailsIcon fa fa-file-text"'
				+ 'id="cargoDetail"></span>';
            } else {
                return (greenTextSpanLoader('vinNo', 'newCargo', '', 'New Cargo')
				+ '<span class="icons_sprite existingVin cargoDetailsIcon fa fa-file-text" id="cargoDetail"></span>');
            }
        }
    }, {
        width: '40px',
        data: 'condition',
        render: function(data, type, full) {
            if (full.cargoConsignment.condition) {
                return greenTextSpanLoader('Condition', 'Condition', '', ' Yes ');
            } else {
                return greenTextSpanLoader('Condition', 'Condition', '',' No ');
            }
        }
    }, {
        width: '90px',
        data: 'bookingNo',
        render: function(data, type, full) {
            var tmpBook = (full.bookingNo ? full.bookingNo : '');
            return greenTextSpanLoader('Booking', 'Booking', '', tmpBook);
        }
    }, {
        width: '80px',
        data: 'firm',
        render: function(data, type, full) {
            var tmpFirm = (full.firmCargo ? full.firmCargo : '');
            return greenTextSpanLoader('Firm', 'Firm', '', tmpFirm);
        }
    },  {
    	width: '43px',        
        data: 'loadPort',
        sClass: 'overflownone',
        render: function(data, type, full) {
            var tmpLoadPort = (full.loadPort.portCode ? full.loadPort.portCode : '');
            return greenTextSpanLoader('LoadPort', 'LoadPort', '', tmpLoadPort);
        }
    }, {
    	width: '43px',        
        data: 'discharge',
        sClass: 'overflownone',
        render: function(data, type, full) {
            var tmpDisc = (full.dischargePort.portCode ? full.dischargePort.portCode : '');
            return greenTextSpanLoader('Discharge', 'Discharge', '', tmpDisc);
        }
    }, {
        width: '5%',
        data: 'customer',
        render: function(data, type, full) {
            var tmpCus = (full.customer ? full.customer : '');
            return greenTextSpanLoader('Customer', 'Customer', '', tmpCus);
        }
    }, {
        width: '87px',
        data: 'cargoText',
        render: function(data, type, full) {
            var tmpText = (full.cargoText ? full.cargoText : '');
            return greenTextSpanLoader('CargoText', 'CargoText', '', tmpText);
        }
    }, {
        width: '130px',
        data: 'cargoType',
        render: function(data, type, full) {
            var tmptype = (full.cargoType.cargType ? full.cargoType.cargType : '');
            return greenTextSpanLoader('CargoType', 'CargoType', '', tmptype);
        }
    }, {
        width: '60px',
        data: 'vessel',
        render: function(data, type, full) {
            var tmpvess = (full.voyage.vesselCode ? full.voyage.vesselCode : '');
            return greenTextSpanLoader('Vessel', 'Vessel', '', tmpvess);
        }
    }, {
        width: '40px',
        data: 'voyage',
        sClass: 'alignRight',
        render: function(data, type, full) {
            var tmpvoy = (full.voyage.voyageNo ? full.voyage.voyageNo : '');
            return greenTextSpanLoader('Voyage', 'Voyage', '', tmpvoy);
        }
    }, {
        width: '100px',
        sClass: 'datePickerCell',
        data: 'dateReceived',
        render: function(data, type, full) {
            var tmpRec = (full.cargoConsignment.receivedDate ? full.cargoConsignment.receivedDate : '');
            return greenTextSpanLoader('DateReceived', 'DateReceived', '', tmpRec);
        }
    }, {
        width: '100px',
        data: 'dateLoaded',
        sClass: 'datePickerCell',
        render: function(data, type, full) {
            var tmpload = (full.cargoConsignment.loadedDate ? full.cargoConsignment.loadedDate : '');
            return greenTextSpanLoader('DateLoaded', 'DateLoaded', '', tmpload);
        }
    }, {
        width: '120px',
        sClass: 'datePickerCell',
        data: 'dateDischarged',
        render: function(data, type, full) {
            var tmpdt = (full.cargoConsignment.dischargeDate ? full.cargoConsignment.dischargeDate : '');
            return greenTextSpanLoader('DateDischarged', 'DateDischarged', '', tmpdt);
        }
    }, {
        width: '85px',
        data: 'destination',
        render: function(data, type, full) {
            var tmpdest = (full.destination.portCode ? full.destination.portCode : '');
            return greenTextSpanLoader('Destination', 'Destination', '', tmpdest);
        }
    }, {
        width: '100px',
        data: 'actualLength',
        render: function(data, type, full) {
            var length;
            if (!full.dimension.length && full.dimension.length !== 0) {
                length = '';
            } else {
                length = full.dimension.length;
                length = nsCargo.checkParseFloat(length).toFixed(3);
            }
            return greenTextSpanLoader('Length', 'Length', 'float: right', length);
        }
    }, {
        width: '100px',
        data: 'actualWidth',
        render: function(data, type, full) {
            var width;
            if (!full.dimension.width && full.dimension.width !== 0) {
                width = '';
            } else {
                width = full.dimension.width;
                width = nsCargo.checkParseFloat(width).toFixed(3);
            }
            return greenTextSpanLoader('Width', 'Width', 'float: right', width);
        }
    }, {
        width: '100px',
        data: 'actualHeight',
        render: function(data, type, full) {
            var height;
            if (!full.dimension.height && full.dimension.height !== 0) {
                height = '';
            } else {
                height = full.dimension.height;
                height = nsCargo.checkParseFloat(height).toFixed(3);
            }
            return greenTextSpanLoader('Height', 'Height', 'float: right', height);
        }
    }, {
        width: '100px',
        data: 'actualArea',
        render: function(data, type, full) {
            var dataArea;
            if (!full.dimension.area && full.dimension.area !== 0) {
            	dataArea = '';
            } else {
            	dataArea = full.dimension.area;
            	dataArea = nsCargo.checkParseFloat(dataArea).toFixed(3);
            }
            return greenTextSpanLoader('Area', 'Area', 'float: right', dataArea);
        }
    }, {
        width: '100px',
        data: 'actualVolume',
        render: function(data, type, full) {
            var dataVol;
            if (!full.dimension.volume && full.dimension.volume !== 0) {
            	dataVol = '';
            } else {
            	dataVol = full.dimension.volume;
            	dataVol = nsCargo.checkParseFloat(dataVol).toFixed(3);
            }
            return greenTextSpanLoader('Volume', 'Volume', 'float: right', dataVol);
        }
    }, {
        width: '100px',
        data: 'actualWeight',
        render: function(data, type, full) {
            var weight;
            if (!full.dimension.weight && full.dimension.weight !== 0) {
                weight = '';
            } else {
                weight = full.dimension.weight;
                weight = Math.floor(weight);
            }
            return greenTextSpanLoader('Weight', 'Weight', 'float: right', weight);
        }
    }, {
        width: '120px',
        data: 'weightUnit',
        render: function(data, type, full) {
            var tmpUnit = (full.dimension.dimensionType ? full.dimension.dimensionType : '');
            return greenTextSpanLoader('WeightUnit', 'WeightUnit', '', tmpUnit);
        }
    }, {
        width: '170px',
        data: 'docReceipt',
        render: function(data, type, full) {
            var tmpDoc = (full.cargoConsignment.docReceipt ? full.cargoConsignment.docReceipt : '');
            return greenTextSpanLoader('DockReceipt', 'DockReceipt', '', tmpDoc);
        }
    }, {
        width: '100px',
        data: 'equipmentNo',
        render: function(data, type, full) {
            var tmpequTyp = (full.equipment.equipmentType ? full.equipment.equipmentType : '');
            return greenTextSpanLoader('EquipmentNo', 'EquipmentNo', '', tmpequTyp);
        }
    }, {
        width: '180px',
        data: 'equipmentType',
        render: function(data, type, full) {
            var tmpEqu = (full.equipment.equipmentDesc ? full.equipment.equipmentDesc : '');
            return greenTextSpanLoader('EquipmentType', 'EquipmentType', '', tmpEqu);
        }
    }, {
        width: '170px',
        data: 'billOfLading',
        render: function(data, type, full) {
            var tmpBol = (full.billOfLading ? full.billOfLading : '');
            return greenTextSpanLoader('BOL', 'BOL', '', tmpBol);
        }
    }];

    function addSelection(selection, flg) {
    	var ind;
    	if(flg){
    		nsCargo.dataList.push(selection);
    	} else{
    		ind = nsCargo.dataList.indexOf(selection);
    		nsCargo.dataList.splice(ind, 1);
    	}
    }
    extObj = {'addSelection' : addSelection};
    $.extend(true, nsCargo, extObj);
    //This method is used to set style for the span based on the input params
    function greenTextSpanLoader(id, classes, inlineStyle, val) {
        return '<span class="greenText ' + classes + '" style="'+ inlineStyle + '" id="' + id + '">' + val + '</span>';
    }

    //This method is used to validate the search criteria
    function leftSearchMenuConditions(vessel, voyage, loadPort, dischargePort,
        bookingNo, bol, vinNo, cargoStatus) {
        return [((vessel && nsCargo.checkEmptyString(voyage)) ||
                (nsCargo.checkEmptyString(vessel) && voyage )),

                ((vessel && nsCargo.checkEmptyString(voyage)) &&
                (nsCargo.checkEmptyString(loadPort) && nsCargo.checkEmptyString(dischargePort)&&
                    nsCargo.checkEmptyString(bookingNo) && nsCargo.checkEmptyString(bol) &&
                    nsCargo.checkEmptyString(vinNo))),

                ((nsCargo.checkEmptyString(vessel) && nsCargo.checkEmptyString(voyage)) &&
                (nsCargo.checkEmptyString(loadPort) && nsCargo.checkEmptyString(dischargePort)&&
                    nsCargo.checkEmptyString(bookingNo) && nsCargo.checkEmptyString(bol) && nsCargo.checkEmptyString(vinNo))),

                ((dischargePort && nsCargo.checkEmptyString(loadPort)) &&
                (nsCargo.checkEmptyString(bookingNo) && nsCargo.checkEmptyString(bol) &&
                    nsCargo.checkEmptyString(vinNo)
                ) &&
                (nsCargo.checkEmptyString(vessel) || nsCargo.checkEmptyString(voyage))),

                ((loadPort && nsCargo.checkEmptyString(cargoStatus)) &&
                ((nsCargo.checkEmptyString(vessel) && nsCargo.checkEmptyString(voyage) &&
                    nsCargo.checkEmptyString(dischargePort) &&nsCargo.checkEmptyString(bookingNo) &&
                    nsCargo.checkEmptyString(bol) && nsCargo.checkEmptyString(vinNo)
                )))
        ];
    }

    //This method is used to assign the values using function call back
    function cargoMgmtGridRowCallback(nRow, aData, iDisplayIndex) {
        if (nsCargo.isNewCargo(aData.vinNo)) {
            $(nRow).attr('data-cargoType', 'newCargo');
        }
        $(nRow).find('#vinNo').attr('data-edit', aData.isEditable);
        $(nRow).find('#vinNo').attr('id', 'vinNo_' + iDisplayIndex);
        $(nRow).find('#cargoDetail').attr('id', iDisplayIndex);
        $(nRow).find('#selectCargo').attr('value', iDisplayIndex);
        if(aData.isEditable === 'N' || (aData.isLpOutbound ==='N' && aData.isDpInbound==='N')){
        	$(nRow).find('#selCargo').parent().find('input:checkbox').attr('disabled', true);
        	$(nRow).find('#selCargo').parent().find('input:checkbox').attr('data-disable', true);
        	$(nRow).find('.selectCargo').parent().find('input:checkbox').hide();
        }
        else {
        	$(nRow).find('#selCargo').parent().find('input:checkbox').attr('disabled', false);
        }
        $(nRow).find('#selCargo').attr('id', 'selCargo_' + iDisplayIndex);
        $(nRow).find('#condition').attr('id', 'condition_' + iDisplayIndex);
        $(nRow).find('#booking').attr('id', 'booking_' + iDisplayIndex);
        $(nRow).find('#firm').attr('id', 'firm_' + iDisplayIndex);
        $(nRow).find('#loadPort').attr('id', 'loadPort_' + iDisplayIndex);
        $(nRow).find('#discharge').attr('id', 'discharge_' + iDisplayIndex);
        $(nRow).find('#customer').attr('id', 'customer_' + iDisplayIndex);
        $(nRow).find('#cargoText').attr('id', 'cargoText_' + iDisplayIndex);
        $(nRow).find('#cargoType').attr('id', 'cargoType_' + iDisplayIndex);
        $(nRow).find('#vessel').attr('id', 'vessel_' + iDisplayIndex);
        $(nRow).find('#voyage').attr('id', 'voyage_' + iDisplayIndex);
        $(nRow).find('#dateReceived').attr('id', 'dateReceived_' + iDisplayIndex);
        $(nRow).find('#dateLoaded').attr('id', 'dateLoaded_' + iDisplayIndex);
        $(nRow).find('#dateDischarged').attr('id', 'dateDischarged_' + iDisplayIndex);
        $(nRow).find('#destination').attr('id', 'destination_' + iDisplayIndex);
        $(nRow).find('#length').attr('id', 'length_' + iDisplayIndex);
        $(nRow).find('#width').attr('id', 'width_' + iDisplayIndex);
        $(nRow).find('#height').attr('id', 'height_' + iDisplayIndex);
        $(nRow).find('#area').attr('id', 'area_' + iDisplayIndex);
        $(nRow).find('#volume').attr('id', 'volume_' + iDisplayIndex);
        $(nRow).find('#weight').attr('id', 'weight_' + iDisplayIndex);
        $(nRow).find('#weightUnit').attr('id', 'weightUnit_' + iDisplayIndex);
        $(nRow).find('#dockReceipt').attr('id', 'dockReceipt_' + iDisplayIndex);
        $(nRow).find('#equipmentNo').attr('id', 'equipmentNo_' + iDisplayIndex);
        $(nRow).find('#equipmentType').attr('id', 'equipmentType_' + iDisplayIndex);
        $(nRow).find('#bol').attr('id', 'bol_' + iDisplayIndex);
        return nRow;
    }

    //This method is used to load the cargo management grid data
    function loadcargoMgmtGridTable(response) {
    	var tempCnt = 0;
    	nsCargo.chkAllFlg = false;
    	$.each(response, function(index, val){
    		if(val.isEditable === 'N' || (val.isLpOutbound ==='N' && val.isDpInbound==='N')){
    			tempCnt++;
    		}
    	})
    	for(var i=0;i<response.length;i++) {
    		if(response[i].dimension.height) {
    			response[i].dimension.height=response[i].dimension.height.toFixed(3);
    		}
    		if(response[i].dimension.area) {
    			response[i].dimension.area=response[i].dimension.area.toFixed(3);
    		}
			if(response[i].dimension.volume) {
				response[i].dimension.volume=response[i].dimension.volume.toFixed(3);
    		}
			if(response[i].dimension.width) {
				response[i].dimension.width=response[i].dimension.width.toFixed(3);
    		}
    		if(response[i].dimension.length) {
    			response[i].dimension.length=response[i].dimension.length.toFixed(3);
    		}
    	}
    	if(tempCnt === response.length){
    		nsCargo.chkAllFlg = true;
    		$('#checkAllRows').prop('disabled', true);
    	} else{
    		$('#checkAllRows').prop('disabled', false);
    	}
        return $('#cargoMgmtGrid').DataTable({
            'iDisplayLength': nsCore.pageCount,
            'scrollX': true,
            'sPaginationType': 'full_numbers',
            'processing': true,
            'bJQueryUI': true,
            'serverSide': false,
            'fixedHeader': false,
            "orderClasses": false,
            'bFilter': true,
            'tabIndex': -1,
            'aaData': response,
            'info': false,
            'searching': true,
            'searchCols': [{}, {}, {}],
            'dom': 'Brtip',
            'aaSorting': [],
            'columnDefs': [{
                targets: [5],
                render: $.fn.dataTable.render.number(',', '.', 3)
              },{
            	  orderable: false, targets: [0] 
              }], 
            'buttons': [
            	{
            	text: '<span class="icons_sprite buttonIcon exportExcelIcon fa fa-file-excel-o"></span>Export to Excel',
            	className: 'exportExcelLnk  lightGreyGradient normalBtnLink',
            	extend: 'excelHtml5',
            	exportOptions: {
                    columns: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 ],
                    
            	},
            	customize: function(xlsx){
            		var sSh = xlsx.xl['styles.xml'];
        		    var lastXfIndex = $('cellXfs xf', sSh).length - 1;
        		 
        		    var n1 = '<numFmt formatCode="0.000" numFmtId="300"/>';
        		    var s1 = '<xf numFmtId="300" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>';
        		    var s2 = '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">'+
        		                '<alignment horizontal="center"/></xf>';
        		    sSh.childNodes[0].childNodes[0].innerHTML += n1;
        		    sSh.childNodes[0].childNodes[5].innerHTML += s1 + s2;
        		    var fourDecPlaces = lastXfIndex + 1;
        		    var sheet = xlsx.xl.worksheets['sheet1.xml'];
        		    //% 4 decimal places, as added above
        		    $('row c[r^="P"]', sheet).attr( 's', fourDecPlaces );
        		    $('row c[r^="Q"]', sheet).attr( 's', fourDecPlaces );
        		    $('row c[r^="R"]', sheet).attr( 's', fourDecPlaces );
        		    $('row c[r^="S"]', sheet).attr( 's', fourDecPlaces );
        		    $('row c[r^="T"]', sheet).attr( 's', fourDecPlaces ); 
        		    $('row:eq(0) c[r^="P"]', sheet).attr( 's', '2' );
        		    $('row:eq(0) c[r^="Q"]', sheet).attr( 's', '2' );
        		    $('row:eq(0) c[r^="R"]', sheet).attr( 's', '2' );
        		    $('row:eq(0) c[r^="S"]', sheet).attr( 's', '2' );
        		    $('row:eq(0) c[r^="T"]', sheet).attr( 's', '2' );
            	},
            	title: ''
             }],
            'oLanguage': {
                'oPaginate': {
                    'sFirst': '',
                    'sPrevious': '',
                    'sNext': '',
                    'sLast': ''
                }
            },

            fnInitComplete: function() {
                var excelButton = [];
                $('th').unbind('keypress');
                $(this).show();
               $(this).dataTable().api().columns.adjust();
                excelButton = $('div.dt-buttons').detach();
                $('.buttonsList').append(excelButton);
                $('div.dt-buttons').wrap("<span style='display:inline-block;'></span>");
               $('.cargoMgmtRightData .buttonsList').show();
                $('#checkAllRows').prop('checked', false);
            },
            'columns': cargoMgmtGridColumnData,
            'fnRowCallback': function(nRow, aData, iDisplayIndex) {
                cargoMgmtGridRowCallback(nRow, aData, iDisplayIndex);
            }
        });      
        
    }

     //This method is used to load the tooltip details for each cargo
    function loadCargoTooltip() {
        $(document).on('click', '.existingVin.cargoDetailsIcon', function() {
            var rowNum = $(this).attr('id'),
                vinDisplay = $('#vinNo_' + rowNum).text(),
                currentEle = $(this),
                vinDisplayVar='',
                ele = $('.toolTipWrapper'),
                toolTip;
            $('.toolTipWrapper').html('').hide();
            vinDisplayVar = ((vinDisplay) ? vinDisplay : 'New Cargo');
            toolTip = buildCargoTooltip(vinDisplayVar, rowNum); //building tooltip content
            $('.toolTipWrapper').html(toolTip).show();
            $(ele).position({
                my: 'left top',
                at: 'right top-25',
                collision: 'flipfit',
                of: $(currentEle)
            });
            $('.leftArrowIcon').position({
                my: 'left top',
                at: 'right-11 top-5',
                collision: 'flipfit',
                of: $(currentEle)
            });
        });
    }

    //To build the cargo tooltip
    function buildCargoTooltip(vinDisplayVar, rowNum) {
        var tmpHeadNames = {
                'Customer': 'Customer',
                'Firm': 'Firm/Reserve',
                'CargoText': 'Cargo Text',
                'CargoType': 'Cargo Type',
                'Vessel': 'Vessel',
                'Voyage': 'Voyage',
                'DateReceived': 'Date Received',
                'DateLoaded': 'Date Loaded',
                'DateDischarged': 'Date Discharged',
                'Destination': 'Destination',
                'Length': 'Length',
                'Width': 'Width',
                'Height': 'Height',
                'Area': 'Area',
                'Volume': 'Volume',
                'Weight': 'Weight',
                'WeightUnit': 'Dimension Unit',
                'DockReceipt': 'Dock Receipt',
                'EquipmentNo': 'Equipment No',
                'EquipmentType': 'Equipment Type',
                'BOL': 'BOL'
            },
            tooltipContent = '';
        tooltipContent += '<div class="toolTipWrap"><span class="icons_sprite leftArrowIcon"></span>'
		+ '<div class="toolTipContent headerGreyBanner"><span class="icons_sprite removeIcon toolTipCloseIcon fa fa-remove" ></span>'
		+ '<h1>' + vinDisplayVar + '</h1></div>';
        tooltipContent += '<table cellspacing="0" cellpadding="0" class="toolTipList">';

        $.each(tmpHeadNames, function(key, val) {
            tooltipContent += '<tr><td class="bold">' + val + '</td><td> ' +
                $($('.' + key)[rowNum]).text() + '</td></tr>';
        });
        tooltipContent += '</table></div>';
        return tooltipContent;
    }

    //This method will trigger the loadcargoMgmtGridTable to load the response data
    function loadTable(response) {
        var cargoMgmtGridtable = $('#cargoMgmtGrid');
        $('.cargoMgmtGridContentWrapper.compressedState').css('border', 'none');
        if ($.fn.DataTable.fnIsDataTable(cargoMgmtGridtable)) {
            $('div.DTTT_container').remove();
            $('#cargoMgmtGrid').DataTable().clear().draw();
            var ott = TableTools.fnGetInstance('#cargoMgmtGrid');
            if (ott) {
            	ott.fnSelectNone();
            }       
            $('#cargoMgmtGrid').dataTable().api().destroy();                       
        }
        $('.defaultSearchMsg').hide();
        cargoMgmtGridtable = loadcargoMgmtGridTable(response);
        cargoMgmtGridtable.columns().eq(0).each(function(colIdx) {
            $('.filterDiv .filterBox', cargoMgmtGridtable.column(colIdx).header())
			.on('keyup change',function() {
                $('.statusMessageText').css('display', 'none');
                cargoMgmtGridtable.column(colIdx).search($(this).val()).draw();
            });
	        $('.filterDiv .filterBox', cargoMgmtGridtable.column(colIdx).header())
			.on('click',function(event) {
	                event.stopPropagation();
	            });
        });
        if($('#checkAllRows').attr('disabled')==='disabled'){
            $('#cargoMgmtGrid').dataTable().api().rows().nodes().to$().find('.checkBoxCell')
                .each(function(i, obj) {            	
                    $(obj).find('input.selectCargo').prop('checked', true);
                    $(obj).parent().removeClass('DTTT_selected selected');
                });
                $('.selectCargo').hide();
                $('.cargoMgmtRightData .buttonsList').show();
        }
        loadCargoTooltip();       
    }
    //This method is used to construct the error messages for search panel
    function errorAlert(i) {
        var commonStatment = 'Please enter value for ';
        switch (i) {
            case 0:
                nsCore.showAlert(commonStatment + 'vessel/voyage to proceed!');
                break;
            case 1:
                nsCore.showAlert(commonStatment + 'Voyage');
                break;
            case 2:
                nsCore.showAlert(commonStatment + 'Vessel');
                break;
            case 3:
                nsCore.showAlert(commonStatment + 'vessel/voyage to proceed!');
                break;
            case 4:
                nsCore.showAlert(commonStatment + 'Cargo Status');
                break;
            default:
                break;
        }
        return false;
    }
    // This method is used to check the conditions for and construct the error message array
    function alertText(conditions) {
        var i = 0;
        if (conditions[0] || conditions[1] || conditions[2] || conditions[3]) {
            nsCargo.clearElements();
        }
        for (i = 0; i < 5; i++) {
            if (conditions[i]) {
                errorAlert(i);
                return;
            }
        }
    }

    // This method is used to build the data for search operation
    function cargoSearchCriteriaDataBuild(vessel, voyage, customer, loadPort, dischargePort, destination,
        bookingNo, bol, cargoStatus, cargoType, cargoState, vinNo, newCargoFlag, dateFmt, fetchAll, firm) {
        return {
            vesselCode: vessel,
            voyageNo: voyage,
            custCode: customer,
            loadPortCode: loadPort,
            dischargePortCode: dischargePort,
            destinationCode: destination,
            bookingNo: bookingNo,
            bol: bol,
            cargoStatus: cargoStatus,
            cargoType: cargoType,
            cargoState: cargoState,
            vinNo: vinNo,
            newCargoFlag: newCargoFlag,
            cargoSearchFlag: 'Y',
            dateFormat: localStorage.getItem('dateFormat'),
            fetchAll: fetchAll,
            firmCargo: firm
        };
    }

    // This method is used to validate the vessel/voyage/portCode for the minimum
    function canRemoveVesselVoyagePortCode(searchKeyParam, minCount, voyage, vessel, cargoStatus) {
        switch (searchKeyParam) {
            case 'vessel':
                return !(minCount === 1 && vessel );
            case 'voyage':
                return !(minCount === 1 && voyage );
            case 'portCode':
                return !(minCount === 1 && cargoStatus );
            default:
                return true;
        }
    }

    // This method is used to validate the cargoStatus/dischargeCode for the minimum
    function canRemoveDischargeCodeCargoStatus(searchKeyParam, minCount, voyage, vessel, loadPort) {
        switch (searchKeyParam) {
            case 'dischargeCode':
                return !(minCount === 1 && vessel && voyage );
            case 'cargoStatus':
                return !(minCount === 1 && loadPort );
            default:
                return true;
        }
    }

    // This method is used to validate the bookingNo/vinNo/bol for the minimum search criteria functionality
    function canRemoveBookingVinBol(searchKeyParam, minCount) {
        switch (searchKeyParam) {
            case 'bookingNo':
                return minCount > 1;
            case 'vinNo':
                return minCount > 1;
            case 'bol':
                return minCount > 1;
            default:
                return true;
        }
    }

    // This method invokes the validation for minimum search criteria functionality
    function canRemove(searchKeyParam, minCount, voyage, vessel, cargoStatus, loadPort) {
        if (searchKeyParam === 'vessel' || searchKeyParam === 'voyage' || searchKeyParam === 'portCode') {
            return canRemoveVesselVoyagePortCode(searchKeyParam, minCount, voyage, vessel, cargoStatus);
        } else if (searchKeyParam === 'dischargeCode' || searchKeyParam === 'cargoStatus') {
            return canRemoveDischargeCodeCargoStatus(searchKeyParam, minCount, voyage, vessel, loadPort);
        } else {
            return canRemoveBookingVinBol(searchKeyParam, minCount);
        }
    }

    // This method is used to display the search criteria in 'You Searched For'
    function searchedForConst(minCount, voyage, vessel, cargoStatus, loadPort) {
        var searchedFor = '';
        $('#leftSearchMenu').find('.searchInput').not('.name').each(function() {
            var currInput = $(this),
                searchKey = $(currInput).attr('data-searchKey'),
                currVal = (currInput.attr('type') === 'text' ? currInput.val() :
				currInput.find('option:selected').text());
            if (currInput.val() ) {
                searchedFor += '<div data-searchKey="' + searchKey + '" class="searchedItem">';
                searchedFor += ((minCount > 1)
                		|| (canRemove(currInput.attr('id'), minCount, voyage, vessel, cargoStatus, loadPort))
                		? '<span class="icons_sprite smallRemoveIcon fa fa-remove"></span>' : 
                			'<span class="icons_sprite fa fa-circle"></span>');
                searchedFor += '<span class="searchedItemKey">' + searchKey +
            		'</span><span> = </span><span class="searchedItemValue">' + currVal + '</span>'
                searchedFor += '</div>';
            }
        });
        return searchedFor;
    }

    // This method is used to perform the post success operation for the search cargo
    function cargoSearchSuccess(response) {
        var loadItems = '';
        nsCargo.searchCount = 0;
        loadItems = response.responseData;
        $('#noRecords').html((response.responseData.length === 1001
		? response.responseData.length - 1 : response.responseData.length));
        $('#searchResult,#searchedFor,#actionLst,#excel,#emailLink').show();
        $('.blueAccElement .blueHeader').removeClass('disabled');
        $('.filterBox').val('');
        $('#cargoMgmtGridWrapper').show();
        if (response.responseData.length === 0) {
            $('div.msg').text('No Matching Records Found').css('font-weight', 'bold');
            $('.defaultSearchMsg .first').text(''); 
            $('.defaultSearchMsg .second').text('');
            $('.statusMessageText').css('display', 'block');
            $('div.dataExceeds').hide();
            if ($.fn.DataTable.fnIsDataTable($('#cargoMgmtGrid'))) {
                $('div.DTTT_container').remove();
                $('#cargoMgmtGrid').DataTable().clear().draw();
                var ott = TableTools.fnGetInstance('#cargoMgmtGrid');
                if (ott) {
                	ott.fnSelectNone();
                }
                $('#cargoMgmtGrid').dataTable().api().destroy();
                $('#cargoMgmtGrid').hide();
            }
        } else {
            if (response.responseData.length > 0 && $('div.msg').text() !== 'Update saved successfully!') {
                $('div.msg').text('');
                $('#cargoMgmtGrid').show();
            }
        }
        if (response.responseData.length > 1001) {
            $('div.dataExceeds').hide();
        }
        if (response.responseData.length < 1000) {
            $('div.dataExceeds').hide();
        }
        if (response.responseData.length === 1001) {
            loadItems = response.responseData.slice(0, response.responseData.length - 1);
            $('div.dataExceeds').show();
            $('.statusMessageTextdata').css('display', 'block');
            if($('.loadingIcon').length > 0){
                $('.loadingIcon').remove();
            }
        }

        $('#actionListAccordion').find('input, select, textarea').val('');
        $('.blueAccElement').find('.normalAccContentWrap').css('display', 'none');
        $('.insertControlNumVal,.actionListInput,.actionListContent').css('display', 'none');
        $('.rightActionListWrapper').removeClass('actionListWrapStyles');
        $('#serachResult').text('Searched Results('+ loadItems.length +')');
        nsCargo.searchCount = loadItems.length;
        if(loadItems.length > 0){
        	loadTable(loadItems);
        }
    }

    // This method is used to validate for Minimun Search Criteria
    function minimumSearchCriteriaValidator(vessel, voyage, loadPort, dischargePort, bookingNo, bol, vinNo) {
        if (!vessel && !voyage && !loadPort && !dischargePort && !bookingNo && !bol && !vinNo) {
            nsCore.showAlert(
                'Please enter values for at least one combination from below for search \n 1. Vessel/voyage' +
                '\n 2. Load port \n 3. Discharge port with vessel/voyage \n 4. Vin/Serial Number' +
                '\n 5. BL Number \n 6. Booking Number'
				);
            $('#searchResult').hide();
            $('#searchedFor').hide();
            $('#actionLst').hide();
            $('#excel').hide();
            $('#emailLink').hide();
            $('div.dataExceeds').hide();
            $('#searchedFor').parent().find('.searchedItem').hide();
            $('#serachResult').text('Searched Results()');
            if($('.loadingIcon').length > 0){
                $('.loadingIcon').remove();
            }
            return false;
        }
        return true;
    }

    // This method is used to perform the search operation
    function leftSearchMenuSubmitValidator(vessel, voyage, loadPort, dischargePort, bookingNo, bol, vinNo,
        cargoStatus) {
        var searchConditions;
        if ($('#leftSearchMenu').attr('data-submitType') === 'submit') {
            if (!minimumSearchCriteriaValidator(vessel, voyage, loadPort, dischargePort, bookingNo, bol, vinNo)) {
                return false;
            }
            searchConditions = leftSearchMenuConditions(vessel, voyage, loadPort, dischargePort,
                        bookingNo, bol, vinNo, cargoStatus);
            alertText(searchConditions);
            if (searchConditions.indexOf(true) >= 0) {
            	if($('.loadingIcon').length > 0){
                    $('.loadingIcon').remove();
                }
                return false;
            }
            return true;
        }
    }
    // This method is used to calcualte the minimum count for the search criteria
    function calculateMinCount(minCountVars, minCount) {
        $.each(minCountVars, function(i, obj) {
            var isValid = true,
                j = 0;
            for (j in obj) {
                if (obj.hasOwnProperty(j) && typeof obj[j] === 'string') {
                    isValid = (nsCargo.checkEmptyString(obj[j]) ? false : isValid);
                }
            }
            if (isValid) {
                minCount++;
            }
        });
        return minCount;
    }
    // This method constructs the search criteria and triggers the search operation
    function leftMenuSearch(e) {
        var minCount = 0,
            vessel = $('#vessel').val().trim(),
            voyage = $('#voyage').val().trim(),
            customer = $('#cusCode').val().trim(),
            loadPort = $('#portCode').val().trim(),
            dischargePort = $('#dischargeCode').val().trim(),
            destination = $('#destinationCode').val().trim(),
            bookingNo = $('#bookingNo').val().trim(),
            bol = $('#bol').val().trim(),
            vinNo = $('#vinNo').val().trim(),
            cargoStatus = $('#cargoStatus').val(),
            cargoType = $('#cargoType').val(),
            cargoState = $('#cargoState').val(),
            newCargo = $('#newCargo').is(':checked'),
            newCargoFlag = (newCargo ? 'Y' : 'N'),
            firm = $('#firm').val(),
            minCountVars, searchedFor, cargoSearchCriteriaData;
		e.preventDefault();
        $('.cargoMgmtRightData .buttonsList').hide();
        $('#cargoMgmtGrid').parents('div.cargoMgmtGridWrapper').first().hide();
        $('#searchResult').hide();
        if (!leftSearchMenuSubmitValidator(vessel, voyage, loadPort, dischargePort, bookingNo, bol, vinNo, cargoStatus)) {
        	$('.preloaderWrapper').hide()
            return false;
        }
        minCountVars = [
            [
                vinNo
            ],
            [
                bol
            ],
            [
                bookingNo
            ],
            [
                loadPort, cargoStatus
            ],
            [
                dischargePort, vessel, voyage
            ],
            [
                vessel, voyage
            ]
        ];
        minCount = calculateMinCount(minCountVars, minCount);
        searchedFor = searchedForConst(minCount, voyage, vessel, cargoStatus, loadPort);
        $('.searchedForWrap').find('.searchedItem').remove();
        $('.searchedForWrap').append(searchedFor);
        cargoSearchCriteriaData = cargoSearchCriteriaDataBuild(vessel, voyage, customer, loadPort, dischargePort,
            destination, bookingNo, bol, cargoStatus, cargoType, cargoState, vinNo, newCargoFlag, dateFormat,
            nsCargo.fetchAll, firm);
        nsCargo.prevCargoSearchCriteriaData = cargoSearchCriteriaData;
        cargoSearchCall(cargoSearchCriteriaData);

       
    }
    function cargoSearchCall(cargoSearchCriteriaData){
    	$('.preloaderWrapper').show()
    	 vmsService.vmsApiServiceTypeLoad(function(response) {
             $('.dataExceeds.statusMessageTextdata.nIhide').show();            
             if (response) {
                 if (response.responseDescription === 'Success') {
                	 nsCargo.dataList = [];
                     $('#cargoMgmtGrid_wrapper').show();
                     cargoSearchSuccess(response);
                     $('#searchResult').show();
                     $('.preloaderWrapper').hide();
                 }
             } else {
             	$('.preloaderWrapper').hide()
                 nsCore.showAlert(nsCargo.hide);
             }
         }, nsCargo.cargoSearchDetails, 'POST', JSON.stringify(cargoSearchCriteriaData));
    }
    
    $(document).ready(function(){
    	$(document).on('click', '#checkAllRows', function(e) {
            var rowNodes = $('#cargoMgmtGrid').dataTable().api().rows({filter: 'applied'}).nodes().to$(),
            	arr = $(rowNodes).find('.checkBoxCell input[type="checkbox"].selectable'),
            	checkedarr='';
            e.stopPropagation;
            if(nsCargo.dataList){
            	nsCargo.dataList = [];
            }
            if ($(this).is(':checked')) {
            	checkedarr = $(rowNodes).find('.checkBoxCell input[type="checkbox"].selectable').parent().parent();
            	checkedarr.addClass('DTTT_selected selected');              
              $(rowNodes).find('.checkBoxCell input[type="checkbox"]:enabled').prop('checked', true);
                $(arr).each(function(i, val){
                	if($(this).parents("tr").find(".cargoVin span").attr("data-edit")==='N'){
                		$(val).prop('checked', false).parents('tr').removeClass('DTTT_selected selected');
                	} else {
                		addSelection(val.id, true);
                	}
                });
                nsCargo.showBtnsAndResize();
                $('#emailLink, .exportExcelLnk').show();
            } else {
                $('.statusMessageText').css('display', 'none');
                $(rowNodes).removeClass('DTTT_selected selected');
                $(rowNodes).find('.checkBoxCell input[type="checkbox"]').prop('checked', false);
                $('.buttonsList').css('display', 'block');
                $('#emailLink, .exportExcelLnk').show();
                nsCargo.dataList = [];
            }
        });
        $(document).on('click', '.newCargo', function() {
            var rowDataInst, dataEdit;
            dataEdit = $(this).attr('data-edit')
            if ($('#sec').val() === 'Write') {
                rowDataInst = $('#cargoMgmtGrid').dataTable().api().row($(this).closest('tr')).data();
                nsCargo.openCargoDetailsPopup(rowDataInst, dataEdit);
            }
        });
    })
    $.extend(true, nsCargo, cargoInitObj);
})(this.cargoObj, jQuery, this.vmsService, this.core);