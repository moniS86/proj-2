/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
'use strict';
this.core = {};
(function(nsCore, $, vmsService) {
var bookingPopup = 0,
    oTable,
    dirtyFlag = 0,
    navchec = 0,
    clickedLinkPath = '',
    landingPage = '',
    pagination = '',
    timeZone = '',
    dateFormat = localStorage.getItem('dateFormat'),
    timeFormat = localStorage.getItem('timeFormat'),
    pageCount = parseInt(localStorage.getItem('pagination')),
    measurementType = localStorage.getItem('measurementType'),
    savedUserPref,
    selecteddateFormat = '',
    selectedtimeFormat = '',
    selectedlandingPage = '',
    selectedpagination = '',
    selectedtimeZone = '',
    userId = '',
    showAlert,
    headerObj = {};
showAlert = vmsService.showAlert;
$(document).ready(function() {
    //To HIde the Loading Icon
    $('.preloaderWrapper').hide();
   $(document).on('keydown', '.numericField', function(event){
    	if((event.target.value.indexOf('.') !== -1 || event.target.value.indexOf(',') !== -1) && (event.keyCode === 190 || event.keyCode === 110 || event.keyCode === 188)){
	      event.preventDefault();
    	}
    });
    $(document).on('keyup', '.numericField', function(e){
		  var inputVal = $(this).val();
		  if((e.keyCode === 188 || e.keyCode === 110)){
			  $(this).val(inputVal.replace(/,/g, '.'));
		  }
	});
    addTabIndex();
    $(document).on('click', '.preferencePage', function() {

        $('#timeZone').empty();
        $('#dateInput').empty();
        $('#timeInput').empty();
        $('#landing').empty();
        $('#page').empty();

        openPreferenceDialog();

        $('#editOfcFormMsgDiv,.editOfficeMandatory, #editOfficeForm .formRow .formInputWrap input,'
            +' #editOfficeForm .formRow .formInputWrap select, #editOfficeForm .submitFromData').val('')
            .removeClass('hide redErrorBorder');

        $('#editOfficeForm .formRow .formInputWrap label, #editOffice').addClass('hide');
        $('#first').val(localStorage.getItem('firstName'));
        $('#last').val(localStorage.getItem('lastName'));
        getPreference();
    })
    
        $(document).on('click', '.helpLinkHeader', function() {
        	showAlert("For further information on the usage of the system, refer link training guides available at the following link" + '<br>' + 
        			'<a href="https://training.hoegh.com/" target="_blank" class="helpLink">'+ "https://training.hoegh.com/" +'</a>')
        });
    
   
      //session storage Transfer  
	if (!sessionStorage.length) {
		// Ask other tabs for session storage
		localStorage.setItem('getSessionStorage', Date.now());
	}

	$(document).on('click', '#userPrefSave', function() {
        savePreference();
    });
	
	
    $('#preferenceCancelButton,#closePreference').click(function() {

        $('#userPrefSave').prop('disabled', false);
        $('#viewPreferenceDialog').dialog('close');
    });
    // To FIx Scroll Issue in Datatables with Horizontal Scroll
    $(document).on('keydown', '.dataTables_scrollHead table thead input,'
        +'.dataTables_scrollHead table thead select', function(e) {
        var dataTableBodyTable = $(this).closest('.dataTables_wrapper').find('.dataTables_scrollBody');
        if (e.shiftKey && e.keyCode === 9) {
            dataTableBodyTable.scrollLeft(dataTableBodyTable.scrollLeft()
                - parseInt($(this).closest('th').outerWidth()));
        }
        if (!e.shiftKey && e.which === 9) {
            dataTableBodyTable.scrollLeft(dataTableBodyTable.scrollLeft()
                + parseInt($(this).closest('th').outerWidth()));
        }
    });
    
 // Menu Hover Option
    $(".disable_module").parent().hover(function(){
    	$(this).addClass("disable_module_hover");
    });
});

function addTabIndex(){
	$('input[readonly]').each(function(){
	    $(this).attr('tabindex', '-1');
	});	
}


function isCondTrue(text, ifTrue, ifFalse) {
    return (text) ? ifTrue : ifFalse;
}
function areaVolEvent(len, width, height, area, volume) {
	var limit, totalLimit;
    $('#'+len+', #'+width+', #'+height+', #'+area+', #'+volume).keypress(function(event) {
        var inputVal = $(this).val(),
            inputNumValid, valueRes, decCount, arr;
        if ($(this).attr('id') === len || $(this).attr('id') === width || $(this).attr('id') === height) {
            limit = 6;
            totalLimit = 14;
        } else if ($(this).attr('id') === area) {
            limit = 12;
            totalLimit = 20;
        } else if ($(this).attr('id') === volume) {
            limit = 18;
            totalLimit = 26;
        }
        if (event.which < 44 || event.which > 57 || event.which === 47) {
            event.preventDefault();
        } else {
        	if(event.which === 44){
        		inputVal = inputVal.replace(/,/g, '.');
        	}
            inputNumValid = /^[0-9]+\.[0-9]{3}$/;
            valueRes = inputNumValid.test(inputVal);
            decCount = (inputVal.match(/\./g) || []).length;
            arr = inputVal.split(".");

            if ((valueRes && inputVal.length === totalLimit) || (decCount >= 1 && event.which === 46)) {
                event.preventDefault();
            } else if (inputVal.length === limit && arr.length === 1 && event.which !== 46) {
                event.preventDefault();
            } else if (arr.length === 2 && arr[0].length === 0 && arr[1].length === 8) {
                event.preventDefault();
            } else if (arr.length === 2 && arr[1].length === 8 && arr[0].length === limit) {
                event.preventDefault();
            } else if (arr.length === 2 && arr[1].length >= 8 && arr[0].length === limit) {
                event.preventDefault();
            }
        }
    }).keyup(function() {
        var arr, returnAfterDot, returnBeforeDot,
            inputVal = $(this).val();
        arr = inputVal.split(".");
        if (arr.length === 2) {
            if (arr[1].length > 8) {
                returnAfterDot = checkAfterDot(arr[1]);
                $(this).val(arr[0] + '.' + returnAfterDot);
            }
            if (arr[0].length > limit) {
                returnBeforeDot = checkBeforeDot(arr[0]);
                $(this).val(returnBeforeDot + '.' + arr[1]);
            }
        }
    });
}

function weightEvent(weight){
    $('#'+weight).keypress(function(event){
        var inputVal = $(this).val(),limit,inputNumValid,valueRes,decCount;
        limit = 14 ;

        if (event.which < 45 || event.which > 57 || event.which === 47 || event.which === 46){
            event.preventDefault();
        } else{
            inputNumValid = /^[0-9]+\[0-9]{3}$/,
            valueRes = inputNumValid.test(inputVal);
            if((valueRes || inputVal.length === limit && event.which !== 46) || decCount > 1){
                event.preventDefault();
            }
        }
        }).keyup(function(){
            var inputVal = $(this).val(),
            decCount = (inputVal.match(/\./g) || []).length;
            if(decCount === 1){
                $(this).val(inputVal.slice(0, -1));
            }
    });
}

function checkAfterDot(arrVal){
    var arr,i,addStr='';
    arr=arrVal.split("");
    for (i=0;i<3;i++){
        addStr=addStr + arr[i];
    }
    return addStr;
}

function checkBeforeDot(arrVal){
    var arr,i,addStr='';
    arr=arrVal.split("");
    for (i=0;i<6;i++){
        addStr=addStr + arr[i];
    }
    return addStr;
}
// function which allows only numbers and one decimal point in the input fields
function onlyNumbers(grid){
	$(grid).keydown(function(event){
	  if(event.keyCode === 188 || event.keyCode === 110){
		  event.keyCode = 190;
	  }
	  if (event.shiftKey === true && !((event.keyCode >= 35 && event.keyCode <= 37) || event.keyCode === 39 || event.keyCode === 9)) {
	        event.preventDefault();
	  }
	
	  if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 ||
				event.keyCode === 9 || (event.keyCode >= 35 && event.keyCode <= 37) || event.keyCode === 39 || event.keyCode === 46 || event.keyCode === 190 || event.keyCode === 110 || (event.ctrlKey && event.keyCode === 86)||(event.ctrlKey && event.keyCode === 67)) {
	  	// only numerics and one decimal point allowed
		  if((event.keyCode === 190 || event.keyCode === 110 || event.keyCode === 188) && ($(this).hasClass('notDecimal'))){
			  event.preventDefault();
		  }
	  } else {
	  	event.preventDefault();
	  }
	  
	  if(event.target.value.indexOf('.') !== -1 && (event.keyCode === 190 || event.keyCode === 110)){
	      event.preventDefault();
	  }
	}).keyup(function(e){
	  var inputVal = $(this).val();
	  if((e.keyCode === 188 || e.keyCode === 110) && !$(this).hasClass('notDecimal') && e.target.value.indexOf('.') === -1){
	  	$(this).val(inputVal.slice(0, inputVal.length-1) + '.');
	  }
	});
}

function volumeCalc(l,w,h){	
	return  math.format(math.eval (l*w*h), 14); // prevent round-off errors showing up in output - formatting with precision 14 as per Math.j Documentation.
}

//Function to display the Dirty flag message
function showDirtyFlagMessage(newFlag, dirtyFlagArg) {
    var navCheck = 0;
    if (dirtyFlagArg === 1) {
        if (newFlag){
            navCheck = 1;
        }
        $('#dialog-confirm').dialog('open');
    } else {
        dirtyFlagArg = 0;
    }
    return navCheck;
}

//method to navigate to the clicked link path
function navigateToClickedPath(clickedLinkPathArg) {
    window.location.href = clickedLinkPathArg;
}

function openPreferenceDialog() {
    $('#viewPreferenceDialog').dialog({
        modal: true,
        resizable: false,
        draggable: false,
        width: '85%',
        'dialogClass': 'noTitleBar'
    });
}

function getPreference() {
    var ajUrl = '/Vms/userpreferences/getUserPreference',
        ajUrl1 = '/Vms/userpreferences/getDropDownData';
    vmsService.vmsApiService(function(response){
        if (response) {
            savedUserPref = response.responseData;
        } else{
            showAlert('Something went wrong. Please contact your admin.');
        }
    }, ajUrl, 'POST', null);

    vmsService.vmsApiService(function(response){
            var userPrefObj = '',
                i =0;
        if(response){
            userPrefObj = response.responseData;
            for (i = 0; i < userPrefObj.length; i++) {
                if (userPrefObj[i].typeId === 'UPDF') {
                    selecteddateFormat += '<option value="' + userPrefObj[i].typeItemValue + '">'
                    + userPrefObj[i].typeItemDesc + '</option>';
                    $('#dateInput').append(selecteddateFormat);
                    selecteddateFormat = '';

                }

                if (userPrefObj[i].typeId === 'UPTF') {
                    selectedtimeFormat += '<option value="' + userPrefObj[i].typeItemValue + '">'
                    + userPrefObj[i].typeItemDesc + '</option>';
                    $('#timeInput').append(selectedtimeFormat);
                    selectedtimeFormat = '';

                }
                if (userPrefObj[i].typeId === 'UPLP') {
                    selectedlandingPage += '<option value="' + userPrefObj[i].typeItemValue + '">'
                    + userPrefObj[i].typeItemDesc + '</option>';
                    $('#landing').append(selectedlandingPage);
                    selectedlandingPage = '';

                }
                if (userPrefObj[i].typeId === 'UPPC') {
                    selectedpagination += '<option value="' + userPrefObj[i].typeItemValue + '">'
                    + userPrefObj[i].typeItemDesc + '</option>';
                    $('#page').append(selectedpagination);
                    selectedpagination = '';

                }

                if (userPrefObj[i].typeId === 'PRTMZ') {
                    selectedtimeZone += '<option value="' + userPrefObj[i].typeItemValue + '">'
                    + userPrefObj[i].typeItemDesc + '</option>';
                    $('#timeZone').append(selectedtimeZone);
                    selectedtimeZone = '';
                }
            }
            $('#timeZone').val(savedUserPref.timeZoneId);
            $('#dateInput').val(savedUserPref.dateFormat);
            $('#timeInput').val(savedUserPref.timeFormat);
            $('#landing').val(savedUserPref.defaultPage);
            $('#page').val(savedUserPref.pagination);
            $('#first').val(savedUserPref.firstName);
            $('#last').val(savedUserPref.lastName);
        } else{
            showAlert('Something went wrong. Please contact your admin.');
        }
    }, ajUrl1, 'POST', null);

}

function savePreference(){
    var dateFrmt = $('#dateInput').val(),
        timeFrmt = $('#timeInput').val(),
        timeZne = $('#timeZone').val(),
        landingPge = $('#landing').val(),
        pageVal = $('#page').val(),
        firstName = $('#first').val(),
        lastName = $('#last').val(),
        msg = '',
        ajUrl2 = '/Vms/userpreferences/saveUserPreferences',
        data = {
        dateFormat: dateFrmt,
        timeFormat: timeFrmt,
        timeZone: timeZne,
        defaultPage: landingPge,
        pagination: pageVal,
        firstName: firstName,
        lastName: lastName
    };
    $('#userPrefSave').prop('disabled', true);
    if (timeZne === '0') {
        $('#userPrefSave').prop('disabled', false);
        msg = 'Time Zone Field Cannot Be Left Empty';
    }
    if (!firstName) {
        $('#userPrefSave').prop('disabled', false);
        msg = msg + '\n First Name cannot be left empty';
    }
    if (!lastName) {
        $('#userPrefSave').prop('disabled', false);
        msg = msg + '\n Last Name cannot be left empty';
    }
    if (msg) {
    	showAlert(msg);
        return;
    }

    vmsService.vmsApiService(function(response){
        var userPrefObj = '',
            formattedDate = '',
            pageCountVal = '';
        if(response){
            userPrefObj = response.responseData;
            pageCountVal = userPrefObj.pagination;
            dateFormat = userPrefObj.dateFormat;
            formattedDate = formatDate(dateFormat);
            timeFormat = userPrefObj.timeFormat;
            timeZone = userPrefObj.timeZone;
            userId = userPrefObj.userId;
            localStorage.setItem('pagination', pageCountVal);
            localStorage.setItem('dateFormat', formattedDate);
            localStorage.setItem('firstName', firstName);
            localStorage.setItem('lastName', lastName);
            localStorage.setItem('timeFormat', timeFormat);
            $('#userPrefSave').prop('disabled', false);
            showAlert('User Preference Saved Successfully');
            $('#viewPreferenceDialog').dialog('close');
        } else{
            showAlert('Something went wrong. Please contact your admin.');
        }
    }, ajUrl2, 'POST', JSON.stringify(data));
}

function formatDate(date) {

    switch(date){
        case 'DD-MON-YYYY':
            return 'dd-M-yy';
            break;

        case 'YYYY.MM.DD':
            return 'yy.mm.dd';
            break;

        case 'YYYY-MM-DD':
            return 'yy-mm-dd';
            break;

        case 'DD-MM-YYYY':
            return 'dd-mm-yy';
            break;

        case 'DD.MM.YYYY':
            return 'dd.mm.yy';
            break;

        case 'MM-DD-YYYY':
            return 'mm-dd-yy';
            break;

        case 'MM.DD.YYYY':
            return 'mm.dd.yy';
            break;

        default:
            break;
    }


}

function checkDateFormat(fromDate, toDate) {
    var dateMsg = '', regEx;

    if (dateFormat === 'dd.mm.yy' || dateFormat === 'mm.dd.yy') {
        regEx = /^\d{2}\.\d{2}\.\d{4}$/;
    } else if (dateFormat === 'dd-mm-yy' || dateFormat === 'mm-dd-yy') {
        regEx = /^\d{2}\-\d{2}\-\d{4}$/;
    } else if (dateFormat === 'yy.mm.dd') {
        regEx = /^\d{4}\.\d{2}\.\d{2}$/;
    } else if (dateFormat === 'dd-M-yy') {
        regEx = /^\d{2}-[a-zA-Z]{3}-\d{4}$/;
    }
    if ((fromDate) && !fromDate.match(regEx)) {
        dateMsg = '\n Enter a valid From Date';
    }
    if ((toDate) && !toDate.match(regEx)) {
        dateMsg = dateMsg + '\n Enter a valid To Date';
    }
    return dateMsg;
}


function valiDate(date) {
    var valiDateMsg = '',
        dayfield = '',
        monthfield = '',
        yearfield = '',
        dayobj = '',
        map = {};
    if (date) {
        if (dateFormat === 'dd.mm.yy') {
            dayfield = date.split('.')[0];
            monthfield = date.split('.')[1];
            yearfield = date.split('.')[2];

            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                    (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';

            }

        } else if (dateFormat === 'dd-mm-yy') {
            dayfield = date.split('-')[0];
            monthfield = date.split('-')[1];
            yearfield = date.split('-')[2];
            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';
            }

        } else if (dateFormat === 'mm.dd.yy') {
            monthfield = date.split('.')[0];
            dayfield = date.split('.')[1];
            yearfield = date.split('.')[2];
            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                    (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';
            }

        } else if (dateFormat === 'mm-dd-yy') {
            monthfield = date.split('-')[0];
            dayfield = date.split('-')[1];
            yearfield = date.split('-')[2];
            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                    (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';

            }

        } else if (dateFormat === 'yy.mm.dd') {
            yearfield = date.split('.')[0];
            monthfield = date.split('.')[1];
            dayfield = date.split('.')[2];
            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                    (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';
            }

        } else if (dateFormat === 'yy-mm-dd') {
            yearfield = date.split('-')[0];
            monthfield = date.split('-')[1];
            dayfield = date.split('-')[2];
            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                    (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';
            }

        } else if (dateFormat === 'dd-M-yy') {
            map = {
                'Jan': '01',
                'Feb': '02',
                'Mar': '03',
                'Apr': '04',
                'May': '05',
                'Jun': '06',
                'Jul': '07',
                'Aug': '08',
                'Sep': '09',
                'Oct': '10',
                'Nov': '11',
                'Dec': '12'
            };
            dayfield = date.split('-')[0];
            monthfield = map[date.split('-')[1]];
            yearfield = date.split('-')[2];
            dayobj = new Date(yearfield, monthfield - 1, dayfield);
            if ((dayobj.getMonth() + 1 !== parseInt(monthfield)) || (dayobj.getDate() !== parseInt(dayfield)) ||
                    (dayobj.getFullYear() !== parseInt(yearfield))) {
                valiDateMsg = '\n Enter a valid Date ';
            }
        }
        return valiDateMsg;
    } else {
        return '';
    }
}

function compareDates(fromDate, toDate) {
    var compareDateMsg = '',
        dt1 = '',
        mon1 = '',
        yr1 = '',
        date1 = '',
        date2 = '',
        map = {},
        dayfield = '',
        monthfield = '',
        yearfield = '',
        fromObj = '',
        toDayfield = '',
        toMonthfield = '',
        toYearfield = '',
        toObj = '';
    if (fromDate && toDate) {
        if ((dateFormat === 'dd.mm.yy') || (dateFormat === 'dd-mm-yy')) {
            dt1 = parseInt(fromDate.substring(0, 2));
            mon1 = parseInt(fromDate.substring(3, 5));
            yr1 = parseInt(fromDate.substring(6, 10));
            date1 = new Date(yr1, mon1 - 1, dt1);
            dt1 = parseInt(toDate.substring(0, 2));
            mon1 = parseInt(toDate.substring(3, 5));
            yr1 = parseInt(toDate.substring(6, 10));
            date2 = new Date(yr1, mon1 - 1, dt1);

            if (date1 > date2) {
                compareDateMsg = '\n To Date cannot be before the start/from date ';
            }
        } else if ((dateFormat === 'mm.dd.yy') || (dateFormat === 'mm-dd-yy')) {
            mon1 = parseInt(fromDate.substring(0, 2));
            dt1 = parseInt(fromDate.substring(3, 5));
            yr1 = parseInt(fromDate.substring(6, 10));
            date1 = new Date(yr1, mon1 - 1, dt1);
            mon1 = parseInt(toDate.substring(0, 2));
            dt1 = parseInt(toDate.substring(3, 5));
            yr1 = parseInt(toDate.substring(6, 10));
            date2 = new Date(yr1, mon1 - 1, dt1);

            if (date1 > date2) {
                compareDateMsg = '\n To Date cannot be before the start/from date ';
            }
        } else if ((dateFormat === 'yy.mm.dd') || (dateFormat === 'yy-mm-dd')){
            yr1 = parseInt(fromDate.substring(0, 4));
            mon1 = parseInt(fromDate.substring(5, 7));
            dt1 = parseInt(fromDate.substring(8, 10));
            date1 = new Date(yr1, mon1 - 1, dt1);
            yr1 = parseInt(toDate.substring(0, 4));
            mon1 = parseInt(toDate.substring(5, 7));
            dt1 = parseInt(toDate.substring(8, 10));
            date2 = new Date(yr1, mon1 - 1, dt1);
            if (date1 > date2) {
                compareDateMsg = '\n To Date cannot be before the start/from date ';
            }
        } else if (dateFormat === 'dd-M-yy') {
            map = {
                'Jan': '01',
                'Feb': '02',
                'Mar': '03',
                'Apr': '04',
                'May': '05',
                'Jun': '06',
                'Jul': '07',
                'Aug': '08',
                'Sep': '09',
                'Oct': '10',
                'Nov': '11',
                'Dec': '12'
            };
            dayfield = fromDate.split('-')[0];
            monthfield = map[fromDate.split('-')[1]];
            yearfield = fromDate.split('-')[2];
            fromObj = new Date(yearfield, monthfield - 1, dayfield);
            toDayfield = toDate.split('-')[0];
            toMonthfield = map[toDate.split('-')[1]];
            toYearfield = toDate.split('-')[2];
            toObj = new Date(toYearfield, toMonthfield - 1, toDayfield);
            if (fromObj > toObj) {
                compareDateMsg = '\n To Date cannot be before the start/from date ';
            }
        }
    }
    return compareDateMsg;
}

function menuSelectActive(){
    var menuArr = ['menuBook', 'menuDoc', 'menuSch', 'menuCargo', 'menuReport', 'menuMdr'], i=0;
    $('#menuBook').addClass('bookingNav p_l_50');
    $('#menuDoc').addClass('documentationNav p_l_50');
    $('#menuSch').addClass('scheduleNav');
    $('#menuCargo').addClass('terminalNav');
    $('#menuReport').addClass('reportsNav');
    $('#menuMdr').addClass('mastrDataMgmtNav');
    for(i=0;i<menuArr.length; i++){
        if($('#'+menuArr[i]).hasClass('active')){
            $('#'+menuArr[i]).removeClass('active');
        }
    }

}

function menuSelect(mnuvar) {
    if (mnuvar === 'menuCargo') {
        menuSelectActive();
        $('#menuCargo').addClass(' active');

    } else if (mnuvar === 'menuBook') {
        menuSelectActive();
        $('#menuBook').addClass(' active');

    } else if (mnuvar === 'menuReport') {
        menuSelectActive();
        $('#menuReport').addClass(' active');

    } else if (mnuvar === 'menuSch') {
        menuSelectActive();
        $('#menuSch').addClass(' active');

    } else if (mnuvar === 'menuDoc') {
        menuSelectActive();
        $('#menuDoc').addClass(' active');

    }
}

function returnDate(date) {
    switch(date){
        case 'mm-dd-yy':
            return 'MM-DD-YYYY';
            break;

        case 'mm.dd.yy':
            return 'MM.DD.YYYY';
            break;

        case 'dd-mm-yy':
            return 'DD-MM-YYYY';
            break;

        case 'dd.mm.yy':
            return 'DD.MM.YYYY';
            break;

        case 'dd-M-YY':
            return 'DD-MMM-YYYY';
            break;

        case 'dd-M-yy':
            return 'DD-MMM-YYYY';
            break;

        case 'yy.mm.dd':
            return 'YYYY.MM.DD';
            break;

        case 'yy-mm-dd':
            return 'YYYY-MM-DD';
            break;

        default:
            break;
    }


}
    //Custom js function to create js date object based on the dynamic format

function builDateObj(dateformat, date) {
    var monthInd = dateformat.search('MMM') === -1 ? dateformat.search('MM') : dateformat.search('MMM'),
        dateInd = dateformat.search('DD'),
        yearInd = dateformat.search('YYYY') === -1 ? dateformat.search('YY') : dateformat.search('YYYY'),
        months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    return (new Date(
        dateformat.search('YYYY') === -1 ? parseInt('20' + date.substring(yearInd, yearInd + 2)) :
        parseInt(date.substring(yearInd, yearInd + 4)),
        dateformat.search('MMM') === -1 ? parseInt(date.substring(monthInd, monthInd + 2)) - 1 :
        months.indexOf(date.substring(monthInd, monthInd + 3)),
        parseInt(date.substring(dateInd, dateInd + 2))));
}

//Begin with Autocomplete
function beginWithAutoComplete(source) {
    return function(req, responseFn) {
        var re = $.ui.autocomplete.escapeRegex(req.term),
            matcher = new RegExp('^' + re, 'i'),
            a = $.grep(source, function(item) {
            return matcher.test(item.label || item.value || item);
        });
        responseFn(a.slice(0, 100));
    };
}

function roundingNumbers(currencyValue, currencyUnit, srcEle){
	var currUnit  = $("#"+ currencyUnit).val();
	var currVal  = currencyValue, thisBasis="";
	thisBasis = $("#freightBasis").val();
	if(currVal !=="" && (!(isNaN(currVal)))){
		currVal = parseFloat(currVal);
		if(currUnit !== "JPY"){
			if(srcEle === "chargesEle" && thisBasis === "PC"){
				currVal  = convertToChargeDecimal(currVal,4);
			}
			else{
				currVal  = convertToChargeDecimal(currVal,2); 
			}
		}
		else{
			currVal  = currVal.toFixed(0);			
		}
	}
	else{
		currVal = "";
	}
	return currVal;
}

function roundingNumbersCharges(currencyValue, currencyUnit, basisValue){	
	var currVal = currencyValue;	
	if(currVal !=="" && (!(isNaN(currVal)))){
		currVal = parseFloat(currVal);
		if(currencyUnit !== "JPY"){
			currVal  = Number(convertToChargeDecimal(currVal, 2)).toFixed(2);
		}
		else{
			currVal  = currVal.toFixed(0);
		}
	}
	else{
		currVal = "";
	}
	return currVal;
}
function roundOffCharges(){
	$.each($('.chargeBasis'), function(i, v) {          
	    var currValue = $(this).parent().parent().find('#chargeRate').val();
	    var currUnit = $(this).parent().parent().find('#chargeCurrency').val();                                             
	    var chargeTotalValue = $(this).parent().parent().find('#chargeTotal').val();
	    var currBasis = $(this).val();
	    var currQauntity = $(this).parent().parent().find('#chargeQuantity').val();
	    $(this).parent().parent().find('#chargeRate').val(roundingNumbersCharges(currValue, currUnit, ""));                                                
	    $(this).parent().parent().find('#chargeTotal').val(roundingNumbersCharges(chargeTotalValue, currUnit, ""));
	    $(this).parent().parent().find('#chargeQuantity').val(roundOffSubBookingQuantity(currBasis,currQauntity));                                                
	});  
}
function roundOffSubBookingQuantity(basisCal,quantity) {                                            
    if (basisCal === 'LS' || basisCal === 'LU') {
    	quantity = convertToChargeDecimal(quantity, 0)
    } else if (basisCal === 'PC') {
    	quantity= convertToChargeDecimal(quantity, 2)
    } else {
    	quantity = convertToChargeDecimal(quantity, 3)
    }                                                
    return quantity;                                                
}

function mdrFocusOnClick(obj){
	var focused = $(':focus');
	$(obj +' tbody tr:first td:first input').focus();
    $(focused).focus();
}
function convertToChargeDecimal(data, precision){ 	
	var sign = data >= 0 ? 1 : -1;        
	if(data || data === 0){
		return Number((Math.round((data*Math.pow(10,precision))+(sign*0.001))/Math.pow(10,precision))).toFixed(precision);
	}else{
		return data;
	}
}

function fixedTo(numValue, toFixValue){		
	if(numValue !=="" && (!(isNaN(numValue)))){
		numValue = convertToChargeDecimal(numValue,toFixValue);
	}
	return numValue;
}
function handleDecimalVal(decimalValue, currencyUnit, thisBasis) {
	if(decimalValue.length > 1 ){
		if(currencyUnit === "chargesColMD" && thisBasis === "PC"){
			if(decimalValue[1].length >= 4){
				event.preventDefault();
			}
		}
		else{
			if(event.target.selectionStart === event.target.value.length && decimalValue[1].length === 2){
				event.preventDefault();
			}
			if(event.target.selectionStart>event.target.value.length-3 && event.target.selectionStart !== event.target.value.length && event.target.selectionEnd-event.target.selectionStart<=1) {
				event.target.value= event.target.value.substring(0,event.target.selectionStart)+
				(event.keyCode>95?String.fromCharCode(event.keyCode-48):String.fromCharCode(event.keyCode))+event.target.value.substring(event.target.selectionStart+1,event.target.value.length);
				event.preventDefault();
			}
		}
	}
}
//function to allow only 2 decimals for Rate/amount except JPY
function validateDecimals(currencyValue, currencyUnit){
	
	var currUnit = "", thisBasis = "";
    	
	if(currencyUnit === "chargesCol"){
		currUnit = $(currencyValue).parents('tr').find('.chargeCurrency').val();
		thisBasis = $(currencyValue).parents('tr').find('.chargeBasis').val();
	} else if(currencyUnit === "chargesColMD"){
		currUnit = $("#rateCurrency").val();
		thisBasis = $("#freightBasis").val();
	} else{
		currUnit  = $("#"+ currencyUnit).val();
	}
	
	if (event.shiftKey === true && !((event.keyCode >= 35 && event.keyCode <= 37) || event.keyCode === 39 || event.keyCode === 9)) {
        event.preventDefault();
	}
	//only numbers allowed
	if ((event.keyCode <= 48 && event.keyCode >= 57) || (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode <= 96 && event.keyCode >= 105) ||
			  event.keyCode === 32) {
		  event.preventDefault();
	}
	if(currUnit === "JPY"){
		//decimal or comma is not allowed
		if(event.keyCode === 110 || event.keyCode === 190 || event.keyCode === 188){
			event.preventDefault();
		}
	}
	else{
		if(event.target.value.indexOf('.') !== -1 && (event.keyCode === 190 || event.keyCode === 110 || event.keyCode === 188)){
		      event.preventDefault();
		}
		if(event.target.value.indexOf('.') !== -1){
			if((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)){					
				var inputVal = event.target.value;
				if(inputVal !== ""){
					var decimalValue = inputVal.split(".");
					handleDecimalVal(decimalValue, currencyUnit, thisBasis);
				}
			}
		}
	}
	
}
function replaceHTML(str){
	str=str.replace(/<td>/g,'|td|').replace(/<tr>/g,'|tr|').replace(/<\/td>/g, '|#td|').replace(/<\/tr>/g,'|#tr|');
	return str;
}
function showAlertCallback(alertMsg, callback) {
  	if(!alertMsg){
  		return false;
  	}
	   var alrt = alertMsg.replace(/\n/g, "<br />"),
	        alertBox = '<div id="alert-box" title="Alert!" style="display: none;">'+
	            '<p style="line-height: 1.2em;">' + alrt  + '</p> </div>';
	    $(alertBox).appendTo($('body'));

	    // Initializing alert
	   var alertDialog= $('#alert-box').dialog({
	        resizable: false,
	        modal: true,
	        autoOpen: false,
	        width: 400,
	        closeOnEscape: false,
	        close: function( event, ui ) {
	        	$(this).dialog("destroy");
	        	$('#alert-box').remove();
	         },
	        open : function() {        	
	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').show();
	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar').find('button').addClass('fa fa-remove noBgBor')
	            	.removeClass('ui-corner-all ui-widget');
	            $(this).closest('.ui-dialog.ui-widget').find('.ui-dialog-titlebar .ui-dialog-title').prepend('<i class="fa fa-warning"></i>').addClass('pageTitle');
	            $(this).closest('.ui-dialog.ui-widget').find('.ui-button.ui-corner-all.ui-widget:nth-child(1)').addClass('btnColor');
	        },
	        buttons: {
	            'Ok': function() {
	                $(this).dialog('close');   
	                $('#alert-box').remove();
	                callback();
	            }
	        }
	    });    
	   alertDialog.dialog('open');
	}
headerObj = {
    'bookingPopup' : bookingPopup,
    'oTable' : oTable,
    'dirtyFlag' : dirtyFlag,
    'navchec' : navchec,
    'clickedLinkPath' : clickedLinkPath,
    'landingPage' : landingPage,
    'pagination' : pagination,
    'timeZone' : timeZone,
    'dateFormat' : dateFormat,
    'timeFormat' : timeFormat,
    'pageCount' : pageCount,
    'measurementType' : measurementType,
    'savedUserPref' : savedUserPref,
    'selecteddateFormat' : selecteddateFormat,
    'selectedtimeFormat' : selectedtimeFormat,
    'selectedlandingPage' : selectedlandingPage,
    'selectedpagination' : selectedpagination,
    'selectedtimeZone' : selectedtimeZone,
    'userId' : userId,
    'openPreferenceDialog' : openPreferenceDialog,
    'getPreference' : getPreference,
    'savePreference' : savePreference,
    'formatDate' : formatDate,
    'checkDateFormat' : checkDateFormat,
    'valiDate' : valiDate,
    'compareDates' : compareDates,
    'menuSelect' : menuSelect,
    'returnDate' : returnDate,
    'builDateObj' : builDateObj,
    'beginWithAutoComplete' : beginWithAutoComplete,
    'showAlert' : showAlert,
    'showDirtyFlagMessage' : showDirtyFlagMessage,
    'navigateToClickedPath' : navigateToClickedPath,
    'areaVolEvent' : areaVolEvent,
    'weightEvent' : weightEvent,
    'onlyNumbers' : onlyNumbers,
    'isCondTrue' : isCondTrue,
    'validateDecimals' : validateDecimals,
    'roundingNumbers' : roundingNumbers,
    'roundingNumbersCharges' : roundingNumbersCharges,
    'fixedTo' : fixedTo,
    'roundOffCharges': roundOffCharges,
    'addTabIndex' : addTabIndex,
    'showAlertCallback' : showAlertCallback,
    'replaceHTML' : replaceHTML,
    'mdrFocusOnClick' : mdrFocusOnClick,
    'volumeCalc' : volumeCalc
};

$.extend(true, nsCore, headerObj);

})(this.core, jQuery, this.vmsService);