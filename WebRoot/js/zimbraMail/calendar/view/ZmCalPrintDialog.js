/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Simple dialog allowing user to choose between an Instance or Series for an appointment
* @constructor
* @class
*
* @author Santosh Sutar
* @param parent			the element that created this view
* 
* 
* @extends		DwtDialog
* @private
*/
ZmCalPrintDialog = function(params) {

    var print = new DwtDialog_ButtonDescriptor(ZmCalPrintDialog.PRINT_BUTTON, ZmMsg.print, DwtDialog.ALIGN_RIGHT);
    var cancel = new DwtDialog_ButtonDescriptor(ZmCalPrintDialog.PRINT_CANCEL_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT);
    var parent = params.parent || appCtxt.getShell();
	ZmDialog.call(this, {parent:parent, standardButtons:[DwtDialog.NO_BUTTONS], extraButtons: [print, cancel]});

	this.setButtonListener(ZmCalPrintDialog.PRINT_BUTTON, new AjxListener(this, this._printButtonListener));
	this.setButtonListener(ZmCalPrintDialog.PRINT_CANCEL_BUTTON, new AjxListener(this, this._printCancelButtonListener));
    this.setTitle(ZmMsg.printCalendar);
	this.setContent(this._setHtml());
    this._createControls();
    this._setViewOptions();
};

ZmCalPrintDialog.prototype = new ZmDialog;
ZmCalPrintDialog.prototype.constructor = ZmCalPrintDialog;

ZmCalPrintDialog.PRINT_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmCalPrintDialog.PRINT_CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmCalPrintDialog.DATE_FORMAT = "yyyyMMddTHHmmss";
ZmCalPrintDialog.TIME_FORMAT = "HH:mm";

// Public methods

ZmCalPrintDialog.prototype.toString =
function() {
	return "ZmCalPrintDialog";
};

ZmCalPrintDialog.prototype.popup =
function(params) {
    //this._keyPressedInField = false; //see comment in _handleKeyUp

	// use reasonable defaults
	params = params || {};

	var treeIds = this._treeIds = (params.treeIds && params.treeIds.length)
		? params.treeIds : [ZmOrganizer.FOLDER];

    //Omit the trash form the tree view
	var omitParam = {};
    omitParam[ZmOrganizer.ID_TRASH] = true;

	var popupParams = {
		treeIds:		treeIds,
		omit:			omitParam,
		fieldId:		this._htmlElId + "_calTreeContainer",
		overviewId:		params.overviewId,
		noRootSelect:	params.noRootSelect,
		treeStyle:		params.treeStyle || DwtTree.SINGLE_STYLE,	// we don't want checkboxes!
		appName:		params.appName,
		selectable:		false,
		forceSingle:	params.forceSingle
	};

	// make sure the requisite packages are loaded
	var treeIdMap = {};
	for (var i = 0; i < treeIds.length; i++) {
		treeIdMap[treeIds[i]] = true;
	}
	var ov = this._setOverview(popupParams, popupParams.forceSingle);
	ZmDialog.prototype.popup.call(this);

    this.currentViewId = params.currentViewId;
    var cv = ZmCalViewController.VIEW_TO_OP[params.currentViewId];
    if(cv == ZmOperation.WORK_WEEK_VIEW) {
        cv = ZmOperation.WEEK_VIEW;
    }
    else if (cv == ZmOperation.FB_VIEW) {
        cv = ZmOperation.DAY_VIEW;
    }
    this._viewSelect.setSelectedValue(cv);
    this._setViewOptions();
    //this.workHours = params.workHours;
    this.setWorkingHours(params.workHours);
    this._selDate.setValue(params.currentDate);
    this._dateRangeFrom.setValue(new Date(params.timeRange.start));
    this._dateRangeTo.setValue(new Date(params.timeRange.end));
    if(ZmId.VIEW_CAL_WORK_WEEK == this.currentViewId) {
        document.getElementById(this._htmlElId + "_workDaysOnly").checked = true;
    }
};

ZmCalPrintDialog.prototype.setWorkingHours =
function(wHrs) {
    var fromTime = new Date(),
        toTime = new Date();
    fromTime.setHours(wHrs.startTime[0]/100, wHrs.startTime[0]%100, 0, 0);
    toTime.setHours(wHrs.endTime[0]/100, wHrs.endTime[0]%100, 0, 0);
    this._fromTimeSelect.set(fromTime);
    this._toTimeSelect.set(toTime);
};

// Private / protected methods

ZmCalPrintDialog.prototype._setHtml =
function() {
	var html = AjxTemplate.expand("calendar.Calendar#PrintDialog", {id: this._htmlElId});
    return html;
};

ZmCalPrintDialog.prototype._createControls =
function() {
    var i,
        op,
        list,
        fitToPageOptions,
        dateRangeRadio = document.getElementById(this._htmlElId + "_dateRangeRadio"),
        selDateRadio = document.getElementById(this._htmlElId + "_selDateRadio"),
        radioListener = AjxCallback.simpleClosure(this._setSelectedDateRadioListener, this);
    this._selDate = new ZmDateInput(this, this._htmlElId + "_selDate", this._htmlElId + "_selDateContainer");

    this._todayButton = new DwtButton({parent:this, parentElement:this._htmlElId + "_todayButtonContainer"});
    this._todayButton.setText(ZmMsg.today);
    this._todayButton.addSelectionListener(new AjxListener(this, this._setDateToToday))

    this._dateRangeFrom = new ZmDateInput(this, this._htmlElId + "_dateRangeFrom", this._htmlElId + "_dateRangeFromContainer");
    this._dateRangeTo = new ZmDateInput(this, this._htmlElId + "_dateRangeTo", this._htmlElId + "_dateRangeToContainer");

    this._viewSelect = new DwtSelect({parent:this, parentElement:this._htmlElId + "_printViewContainer"});
    list = [
		ZmOperation.DAY_VIEW, ZmOperation.WEEK_VIEW,
		ZmOperation.MONTH_VIEW, ZmOperation.CAL_LIST_VIEW
	];
    for(i=0; i<list.length; i++) {
        op = ZmOperation.defineOperation(list[i]);
        this._viewSelect.addOption(op.text, false, op.id, op.image);
    }

    this._viewSelect.addChangeListener(new AjxListener(this, this._setViewOptions));

    this._fromTimeSelect = new ZmTimeInput(this, ZmTimeInput.START, this._htmlElId + "_fromHoursContainer");
	this._toTimeSelect = new ZmTimeInput(this, ZmTimeInput.END, this._htmlElId + "_toHoursContainer");
    this._printErrorMsgContainer = document.getElementById(this._htmlElId + "_printErrorMsgContainer");

    this._fitToPageSelect = new DwtSelect({parent:this, parentElement:this._htmlElId + "_fitToPageSelectContainer"});
    fitToPageOptions = [
        {text: ZmMsg.calPrintFtpAuto, value:"auto"},
        {text: ZmMsg.calPrintFtpOneWeekPerPage, value:"1w"},
        {text: ZmMsg.calPrintFtpOneDayPerPage, value:"1d"}
    ];

    for(i=0; i<fitToPageOptions.length; i++) {
        op = fitToPageOptions[i];
        this._fitToPageSelect.addOption(op.text, false, op.value);
    }

    dateRangeRadio.onclick = radioListener;
    selDateRadio.onclick = radioListener;
};

ZmCalPrintDialog.prototype._setSelectedDateRadioListener =
function(ev) {
    var target = DwtUiEvent.getTarget(ev);
    if(target.id == this._htmlElId + "_selDateRadio") {
        this._setSelectedDateEnabled(true);
    }
    else {
        this._setSelectedDateEnabled(false);
    }
};

ZmCalPrintDialog.prototype._setDateToToday =
function(ev) {
    var d = new Date();
    this._selDate.setValue(d);
};

ZmCalPrintDialog.prototype._setSelectedDateEnabled =
function(enabled) {
    var dateRangeRadio = document.getElementById(this._htmlElId + "_dateRangeRadio"),
        selDateRadio = document.getElementById(this._htmlElId + "_selDateRadio");
    if(enabled) {
        //Disable the date range controls
        this._dateRangeFrom.setEnabled(false);
        this._dateRangeTo.setEnabled(false);
        dateRangeRadio.checked = false;
        //dateRangeRadio.disabled = true;

        //Enable selected date controls
        this._selDate.setEnabled(true);
        this._todayButton.setEnabled(true);
        selDateRadio.checked = true;
        //selDateRadio.disabled = false;
    }
    else {
        //Enable date range controls
        this._dateRangeFrom.setEnabled(true);
        this._dateRangeTo.setEnabled(true);
        dateRangeRadio.checked = true;
        //dateRangeRadio.disabled = false;

        //Disable selected date controls
        this._selDate.setEnabled(false);
        this._todayButton.setEnabled(false);
        selDateRadio.checked = false;
        //selDateRadio.disabled = true;
    }
};

ZmCalPrintDialog.prototype._validateDateRange =
function(ev) {
    var hoursContainer = document.getElementById(this._htmlElId + "_hoursContainer"),
        isValid = true;
    if( this._dateRangeFrom.getEnabled() &&
        this._dateRangeTo.getEnabled()) {
        var startDate = this._dateRangeFrom.getTimeValue();
        var endDate = this._dateRangeTo.getTimeValue();

        if(endDate < startDate) {
            isValid = false;
        }
    }

    if(Dwt.getDisplay(hoursContainer) == Dwt.DISPLAY_BLOCK) {
        var startTime = this._fromTimeSelect.getValue();
        var endTime = this._toTimeSelect.getValue();

        if(endTime < startTime) {
            isValid = false;
        }
    }
    if(!isValid) {
        Dwt.setDisplay(this._printErrorMsgContainer, Dwt.DISPLAY_BLOCK);
        this._printErrorMsgContainer.innerHTML = ZmMsg.errorInvalidDates;
    }
    return isValid;
};

ZmCalPrintDialog.prototype._setViewOptions =
function(ev) {
    var val = this._viewSelect.getValue();

    var workDaysOnlyContainer = document.getElementById(this._htmlElId + "_workDaysOnlyContainer");
    var oneWeekPerPageContainer = document.getElementById(this._htmlElId + "_oneWeekPerPageContainer");
    var oneDayPerPageContainer = document.getElementById(this._htmlElId + "_oneDayPerPageContainer");
    var includeTasksContainer = document.getElementById(this._htmlElId + "_includeTasksContainer");
    var includeMiniCalContainer = document.getElementById(this._htmlElId + "_includeMiniCalContainer");
    var hoursContainer = document.getElementById(this._htmlElId + "_hoursContainer");
    var fitToPageContainer = document.getElementById(this._htmlElId + "_fitToPageContainer");


    Dwt.setDisplay(includeMiniCalContainer, Dwt.DISPLAY_BLOCK);
    Dwt.setDisplay(hoursContainer, Dwt.DISPLAY_BLOCK);
    Dwt.setDisplay(fitToPageContainer, Dwt.DISPLAY_NONE);
    this._resetCheckboxes(false);

    switch(val) {
        case ZmOperation.FB_VIEW:
        case ZmOperation.DAY_VIEW:
            Dwt.setDisplay(workDaysOnlyContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(oneWeekPerPageContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(oneDayPerPageContainer, Dwt.DISPLAY_BLOCK);
            Dwt.setDisplay(includeTasksContainer, Dwt.DISPLAY_BLOCK);

            this._setSelectedDateEnabled(true);
            break;

        case ZmOperation.WORK_WEEK_VIEW:
        case ZmOperation.WEEK_VIEW:
            Dwt.setDisplay(workDaysOnlyContainer, Dwt.DISPLAY_BLOCK);
            Dwt.setDisplay(oneWeekPerPageContainer, Dwt.DISPLAY_BLOCK);
            Dwt.setDisplay(oneDayPerPageContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(includeTasksContainer, Dwt.DISPLAY_NONE);

            this._setSelectedDateEnabled(false);
            break;

        case ZmOperation.MONTH_VIEW:
            Dwt.setDisplay(workDaysOnlyContainer, Dwt.DISPLAY_BLOCK);
            Dwt.setDisplay(oneWeekPerPageContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(oneDayPerPageContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(includeTasksContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(hoursContainer, Dwt.DISPLAY_NONE);

            this._setSelectedDateEnabled(false);
            break;

        case ZmOperation.CAL_LIST_VIEW:
            Dwt.setDisplay(workDaysOnlyContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(oneWeekPerPageContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(oneDayPerPageContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(includeTasksContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(hoursContainer, Dwt.DISPLAY_NONE);
            Dwt.setDisplay(fitToPageContainer, Dwt.DISPLAY_BLOCK);

            this._setSelectedDateEnabled(false);
            break;
    }
};


ZmCalPrintDialog.prototype._printCancelButtonListener =
function() {
    this.popdown();
};

ZmCalPrintDialog.prototype._printButtonListener =
function() {
    if(!this._validateDateRange()) {
        return false;
    }
    var url = this._getPrintOptions();
    this.popdown();
    window.open(url, "_blank");
};

ZmCalPrintDialog.prototype.popdown =
function() {
    Dwt.setDisplay(this._printErrorMsgContainer, Dwt.DISPLAY_NONE);
    this._resetCheckboxes(false);
    DwtDialog.prototype.popdown.call(this);
};

ZmCalPrintDialog.prototype._resetCheckboxes =
function(value) {
    document.getElementById(this._htmlElId + "_workDaysOnly").checked = value;
    document.getElementById(this._htmlElId + "_oneWeekPerPage").checked = value;
    document.getElementById(this._htmlElId + "_oneDayPerPage").checked = value;
    document.getElementById(this._htmlElId + "_includeTasks").checked = value;
    document.getElementById(this._htmlElId + "_includeMiniCal").checked = value;
};

ZmCalPrintDialog.prototype._getPrintViewName =
function(view) {
    var viewStyle;
    switch (view) {
        case ZmId.VIEW_CAL_DAY: 		viewStyle = "day"; break;
        case ZmId.VIEW_CAL_WORK_WEEK:	viewStyle = "workWeek"; break;
        case ZmId.VIEW_CAL_WEEK:		viewStyle = "week"; break;
        case ZmId.VIEW_CAL_LIST:	    viewStyle = "list"; break;
        default:						viewStyle = "month"; break;				// default is month
    }
    return viewStyle;
};

ZmCalPrintDialog.prototype._getPrintOptions =
function() {
    var cals,
        calIds = [],
        treeView,
        i=0,
        j=0,
        params = [],
        printURL = "",
        selDate = this._selDate.getEnabled() ? this._selDate.getValue() : "",
        dateRangeFrom = this._dateRangeFrom.getEnabled() ? this._dateRangeFrom.getValue() : new Date(selDate.getTime()),
        dateRangeTo = this._dateRangeTo.getEnabled() ? this._dateRangeTo.getValue() : new Date(selDate.getTime()),
        fromTime = AjxDateFormat.format(ZmCalPrintDialog.TIME_FORMAT, this._fromTimeSelect.getValue()),
        toTime = AjxDateFormat.format(ZmCalPrintDialog.TIME_FORMAT, this._toTimeSelect.getValue()),
        viewSelected = ZmCalViewController.OP_TO_VIEW[this._viewSelect.getValue()],
        viewStyle = this._getPrintViewName(viewSelected),
        workDaysOnly = document.getElementById(this._htmlElId + "_workDaysOnly").checked,
        oneWeekPerPage = document.getElementById(this._htmlElId + "_oneWeekPerPage").checked,
        oneDayPerPage = document.getElementById(this._htmlElId + "_oneDayPerPage").checked,
        includeTasks = document.getElementById(this._htmlElId + "_includeTasks").checked,
        includeMiniCal = document.getElementById(this._htmlElId + "_includeMiniCal").checked,
        fitToPage = this._fitToPageSelect.getValue();

    //Create the string and pass it to the URL
    treeView = this._opc.getOverview(this._curOverviewId).getTreeView(ZmOrganizer.CALENDAR);
    cals = treeView.getSelected();

    for(j=0; j<cals.length; j++) {
        calIds.push(cals[j].id);
    }

    if(viewSelected == ZmId.VIEW_CAL_MONTH) {
        var endMonthDate = AjxDateUtil._daysPerMonth[dateRangeTo.getMonth()];
        dateRangeTo.setDate(endMonthDate);
        dateRangeFrom.setDate(1);
    }
    else if(viewSelected == ZmId.VIEW_CAL_WEEK ||
            viewSelected == ZmId.VIEW_CAL_WORK_WEEK) {
        var fdow = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
        dateRangeFrom = AjxDateUtil.getFirstDayOfWeek(dateRangeFrom, fdow);
        dateRangeTo = AjxDateUtil.getLastDayOfWeek(dateRangeTo, fdow);
    }

    dateRangeTo.setHours(23, 59, 59, 999);
    dateRangeFrom = AjxDateFormat.format(ZmCalPrintDialog.DATE_FORMAT, dateRangeFrom);
    dateRangeTo = AjxDateFormat.format(ZmCalPrintDialog.DATE_FORMAT, dateRangeTo);

    params[i++] = "/h/printcalendar?";
    params[i++] = "l=";
    params[i++] = calIds.join(',');
    params[i++] = "&origView=";
    params[i++] = this._getPrintViewName(this.currentViewId);
    params[i++] = "&view=";
    params[i++] = viewStyle;
    params[i++] = "&date=";
    params[i++] = dateRangeFrom;
    params[i++] = "&endDate=";
    params[i++] = dateRangeTo;
    params[i++] = "&ft=";
    params[i++] = fromTime;
    params[i++] = "&tt=";
    params[i++] = toTime;
    params[i++] = "&wd=";
    params[i++] = workDaysOnly;
    params[i++] = "&ow=";
    params[i++] = oneWeekPerPage;
    params[i++] = "&od=";
    params[i++] = oneDayPerPage;
    params[i++] = "&it=";
    params[i++] = includeTasks;
    params[i++] = "&imc=";
    params[i++] = includeMiniCal;
    params[i++] = "&ftp=";
    params[i++] = fitToPage;
    params[i++] = "&wdays=";
    params[i++] = workDaysOnly ? ZmCalPrintDialog.encodeWorkingDays() : "";
    params[i++] = "&tz=";
    params[i++] = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    params[i++] = "&skin=";
    params[i++] = appCurrentSkin;

    printURL = appContextPath + params.join("");
    //console.log(printURL);
    return printURL;
};

ZmCalPrintDialog.encodeWorkingDays = function () {
    var wHrs = ZmCalBaseView.parseWorkingHours(ZmCalBaseView.getWorkingHours()),
        wDays = [];
    for (var i=0; i<wHrs.length; i++) {
        if(wHrs[i].isWorkingDay) {
            wDays.push(i);
        }
    }
    return wDays.join(",");
};


ZmDateInput = function(parent, id, parentElement) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, {parent:parent, className:"ZmDateInput", parentElement: parentElement});
    this.id = id || Dwt.getNextId();
    this._setHtml(id);
};

ZmDateInput.prototype = new DwtComposite;
ZmDateInput.prototype.constructor = ZmDateInput;

ZmDateInput.prototype.getValue =
function() {
    var date = "";
    if(this.getEnabled()) {
        date = AjxDateUtil.simpleParseDateStr(this._dateInputField.getValue());
        //date.setHours(23, 59, 59, 999);
    }
    return date;
};

ZmDateInput.prototype.getTimeValue =
function() {
    if(this.getEnabled()) {
        return AjxDateUtil.simpleParseDateStr(this._dateInputField.getValue()).getTime();
    }
    else {
        return "";
    }
};

ZmDateInput.prototype.setValue =
function(date) {
    this._dateInputField.setValue(AjxDateUtil.simpleComputeDateStr(date));
};

ZmDateInput.prototype.setEnabled =
function(enabled) {
    this._dateInputField.setEnabled(enabled);
    this._dateButton.setEnabled(enabled);
};

ZmDateInput.prototype.getEnabled =
function(enabled) {
    return this._dateInputField.getEnabled() && this._dateButton.getEnabled();
};


// Private / protected methods

ZmDateInput.prototype._setHtml =
function(id) {
    var dateButtonListener = new AjxListener(this, this._dateButtonListener),
	    dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

    this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#ApptTimeInput", {id: this._htmlElId});
    this._dateButton = ZmCalendarApp.createMiniCalButton(this.parent, this._htmlElId + "_timeSelectBtn", dateButtonListener, dateCalSelectionListener);
    this._dateButton.setSize("20");

    //create time select input field
    var params = {
        parent: this,
        parentElement: (this._htmlElId + "_timeSelectInput"),
        type: DwtInputField.STRING,
        errorIconStyle: DwtInputField.ERROR_ICON_NONE,
        validationStyle: DwtInputField.CONTINUAL_VALIDATION,
        inputId: id
    };

    this._dateInputField = new DwtInputField(params);
    var timeInputEl = this._dateInputField.getInputElement();
    Dwt.setSize(timeInputEl, "80px", "22px");
    timeInputEl.typeId = this.id;
};

ZmDateInput.prototype._dateButtonListener =
function(ev) {
    var cal,
        menu,
        calDate = AjxDateUtil.simpleParseDateStr(this._dateInputField.getValue());

	// if date was input by user and its foobar, reset to today's date
	if (isNaN(calDate)) {
		calDate = new Date();
		this._dateInputField.setValue(AjxDateUtil.simpleComputeDateStr(calDate));
	}

	// always reset the date to current field's date
	menu = ev.item.getMenu();
	cal = menu.getItem(0);
	cal.setDate(calDate, true);
	ev.item.popup();
};

ZmDateInput.prototype._dateCalSelectionListener =
function(ev) {
	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);
    this._dateInputField.setValue(newDate);

};