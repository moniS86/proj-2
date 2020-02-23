// COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved.
'use strict';
this.reports = {};
(function(nsReports, nsCore, vmsService, $) {
	var reportsObj = {
            'reportList' : '/Vms/reports/reportsList',
            'dropDownList' : '/Vms/reports/reportsDropDownList',
            'autoComplCurrency' : '/Vms/autoComplete/currency',
            'autoComplVoyList' : '/Vms/autoComplete/voyageList',
            'autoComplCustList' : '/Vms/autoComplete/customerlist',
            'custEditData' : '/Vms/customer/editData',
            'getAllTerminals' : '/Vms/booking/getAllTerminals?portCode=',
            'fetchCustomerInfo' : '/Vms/reports/fetchCustomerInfo?bookingNo=',
            'sendConfirmMail' : '/Vms/reports/sendConfirmationMail',
            'downloadPDFLink' : '/Vms/reports/downloadPDF?reportType=',
            'downloadReport' : '/Vms/reports/downloadReport?reportType=',
            'getSailingDate' : '/Vms/allocation/getSailingDate?vesselCode=',
            'generateP3ReportData' : '/Vms/reports/generateP3ReportData?data=',
            'generateP3Report' : '/Vms/reports/generateP3Report',
            'vmsReports' : '/Vms/resources/reports/',
            'generateReport' : '/Vms/reports/generateReport',
            'errorMsg' : 'Something went wrong. Please contact your admin.',
            'customerCodeAutoArr' : [],
            'customerNameAutoArr' : [],
            'blCustomerNameAutoArr' : [],
            'blCustomerCodeAutoArr' : [],
            'forwardedCode' : [],
            'forwardedName' : [],
            'podTermCode' : [],
            'podTermName' : [],
            'mSelect' : false
        };
    $.extend(true, nsReports, reportsObj);
})(this.reports, this.core, this.vmsService, jQuery);