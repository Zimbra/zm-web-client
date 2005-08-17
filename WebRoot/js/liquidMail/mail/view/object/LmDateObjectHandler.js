function LmDateObjectHandler(appCtxt) {
	if (arguments.length == 0) return;

	LmObjectHandler.call(this, appCtxt, "date", null);
}

LmDateObjectHandler.prototype = new LmObjectHandler;
LmDateObjectHandler.prototype.constructor = LmDateObjectHandler;

// needs to be kept in sync with LmDateObjectHandler.DOW
var $RE_DOW = "(Mon(?:day)?|Tue(?:s(?:day)?)?|Wed(?:nesday)?|Thu(?:rs(?:day)?)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)";

LmDateObjectHandler.DOW = { 
	sunday: 0, sun:0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3, 
	thursday: 4, thur: 4, thu: 4, friday: 5, fri: 5, saturday: 6, sat: 6 
};

var $RE_DOM = "(\\d{1,2})(?:st|nd|rd|th)?";

// needs to be kept in sync with LmDateObjectHAndler.MONTH
var $RE_MONTH = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

LmDateObjectHandler.MONTH = { 
	january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3, may: 4, june: 5, jun: 5, 
	july: 6, jul: 6, august: 7, aug: 7, september: 8, sept: 8, sep: 8, october: 9, oct: 9, november: 10, nov: 10, 
	december: 11, dec: 11
};

var $RE_TODAY_TOMORROW_YESTERDAY = "(today|tomorrow|yesterday)";

var $RE_NEXT_LAST = "(next|last)";

var $RE_COMMA_OR_SP = "(?:\\s+|\\s*,\\s*)?";

var $RE_DASH_OR_SLASH = "(?:-|\\/)";

var $RE_SP = "\\s+";

var $RE_YEAR4 = "(\\d{4})";

var $RE_MM = "(\\d{1,2})";

var $RE_DD = "(\\d{1,2})";

var $RE_YEAR42 = "(\\d{4}|\\d{2})";

var $RE_OP_TIME = "(?:\\s*\\d{1,2}:\\d{2}:\\d{2}\\s*)?";

var $RE_OP_DOW = "(?:\\s*"+$RE_DOW+"\\s*)?";

var $RE_OP_YEAR42 = "(?:" + $RE_COMMA_OR_SP + $RE_YEAR42 +")?";

var $RE_OP_YEAR4 = "(?:" + $RE_COMMA_OR_SP + $RE_YEAR4 +")?";

/*
$RE_MONTH + $RE_OP_YEAR4                                    // {June, 2005}, {April}, {March 2006}

$RE_DOW + $RE_COMMA_OR_SP + RE_MONTH + $RE_SP + $RE_DOM +
                 $RE_OP_TIME + $RE_OP_YEAR42  // {Friday, March 2nd}, {Mon Mar 22}, {Tue May 24 10:11:26 2005}
*/

LmDateObjectHandler.registerHandlers =
function(handlers, appCtxt) {
	handlers.push(new LmDate1ObjectHandler(appCtxt));
	handlers.push(new LmDate2ObjectHandler(appCtxt));
	handlers.push(new LmDate3ObjectHandler(appCtxt));
	handlers.push(new LmDate4ObjectHandler(appCtxt));
	handlers.push(new LmDate5ObjectHandler(appCtxt));
	handlers.push(new LmDate6ObjectHandler(appCtxt));
}

LmDateObjectHandler._currentDate = new Date();

LmDateObjectHandler.setCurrentDate =
function(date) {
	LmDateObjectHandler._currentDate = new Date(date);
}

LmDateObjectHandler.getCurrentDate =
function(date) {
	return LmDateObjectHandler._currentDate;
}

LmDateObjectHandler.prototype.getToolTipText =
function(obj, context) {
	var cc = this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
	return cc.getDayToolTipText(context ? context.date : new Date());

}

// Create action menu if needed
LmDateObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	//var isMonthYear = obj.match(LmDateObjectHandler.MonthYear_RE);
	//var calOp = isMonthYear ? LmOperation.MONTH_VIEW : LmOperation.DAY_VIEW;
	var calOp = LmOperation.DAY_VIEW;
	var list = [calOp, LmOperation.NEW_APPT];
	this._menu = new LmActionMenu(this._appCtxt.getShell(), list);
	this._menu.addSelectionListener(calOp, new LsListener(this, this._dayViewListener));
	this._menu.addSelectionListener(LmOperation.NEW_APPT, new LsListener(this, this._newApptListener));
	this._actionObject = obj;
	this._actionContext = context;
	return this._menu;
}

LmDateObjectHandler.prototype._calViewListener =
function(ev) {
	var obj = this._actionObject;
	var op = ev.item.getData(LmOperation.KEY_ID);
	var isDayView = (op == LmOperation.DAY_VIEW);
	var view = isDayView ? LmController.CAL_DAY_VIEW : LmController.CAL_MONTH_VIEW;
	DBG.println(LsDebug.DBG3, "handing date off to calendar " + isDayView ? "day" : "month" + " view: " + date);
	var cc = this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
	cc.show();
	cc.setDate(this._actionContext.date);
}


LmDateObjectHandler.prototype._dayViewListener =
function(ev) {
	var obj = this._actionObject;
	var cc = this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
	cc.show(LmCalViewMgr.DAY_VIEW);
	cc.setDate(this._actionContext.date);
}

LmDateObjectHandler.prototype._newApptListener =
function(ev) {
	DBG.println(LsDebug.DBG1, "new appt listener");
	var cc = this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
	var p = new DwtPoint(ev.docX, ev.docY);
	cc._showAppointmentDetails(null, p, this._actionContext.date);
}

LmDateObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	var cc = this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
	cc.show();
	cc.setDate(context.date);
}

// today/yesterday =======================

function LmDate1ObjectHandler(appCtxt) {
	LmDateObjectHandler.call(this, appCtxt);
}

LmDate1ObjectHandler.prototype = new LmDateObjectHandler;
LmDate1ObjectHandler.prototype.constructor = LmDate1ObjectHandler;

LmDate1ObjectHandler.REGEX = new RegExp("\\b" + $RE_TODAY_TOMORROW_YESTERDAY + "\\b", "ig"),

LmDate1ObjectHandler.prototype.match =
function(line, startIndex) {
	LmDate1ObjectHandler.REGEX.lastIndex = startIndex;
	var result = LmDate1ObjectHandler.REGEX.exec(line);
	if (result == null) return null;
	
	var d = new Date(LmDateObjectHandler.getCurrentDate());
	var when = result[1].toLowerCase();
	if (when == "yesterday") {
		d.setDate(d.getDate()-1);
	} else if (when == "tomorrow") {
		d.setDate(d.getDate()+1);
	}
	result.context = {date: d, monthOnly: 0};
	return result;
}

// {next Tuesday}, {last Monday}, etc

function LmDate2ObjectHandler(appCtxt) {
	LmDateObjectHandler.call(this, appCtxt);
}

LmDate2ObjectHandler.prototype = new LmDateObjectHandler;
LmDate2ObjectHandler.prototype.constructor = LmDate2ObjectHandler;

LmDate2ObjectHandler.REGEX = new RegExp("\\b" + $RE_NEXT_LAST + $RE_SP + $RE_DOW + "\\b", "ig"),

LmDate2ObjectHandler.prototype.match =
function(line, startIndex) {
	LmDate2ObjectHandler.REGEX.lastIndex = startIndex;
	var result = LmDate2ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(LmDateObjectHandler.getCurrentDate());
	var dow = d.getDay();
	var ndow = LmDateObjectHandler.DOW[result[2].toLowerCase()];
	var addDays;
			
	if (result[1].toLowerCase() == "next") {
		addDays = ndow - dow;
		if (ndow <= dow)
			addDays += 14;
		else
			addDays += 7;
	} else { // last
		addDays = (-1 * (dow + 7 - ndow)) % 7;
		if (addDays == 0)
			addDays = -7;
	}
	d.setDate(d.getDate() + addDays);
	result.context = {date: d, monthOnly: 0};
	return result;
}

// {25th December}, {6th, June}, {6 June 2004}, {25th December, 2005}

function LmDate3ObjectHandler(appCtxt) {
	LmDateObjectHandler.call(this, appCtxt);
}

LmDate3ObjectHandler.prototype = new LmDateObjectHandler;
LmDate3ObjectHandler.prototype.constructor = LmDate3ObjectHandler;

LmDate3ObjectHandler.REGEX = 	new RegExp("\\b" + $RE_DOM + $RE_COMMA_OR_SP + $RE_MONTH + $RE_OP_YEAR42 + "\\b", "ig"),

LmDate3ObjectHandler.prototype.match =
function(line, startIndex) {
	LmDate3ObjectHandler.REGEX.lastIndex = startIndex;
	var result = LmDate3ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(LmDateObjectHandler.getCurrentDate());
	var dom = parseInt(result[1], 10);;
	var month = LmDateObjectHandler.MONTH[result[2].toLowerCase()];
	d.setMonth(month, dom);
	if (result[3]) {
		var year = parseInt(result[3], 10);
		if (year < 20) 
			year += 2000;
		else if (year < 100)
			year += 1900;
		d.setYear(year);
	}
	result.context = {date: d, monthOnly: 0};
	return result;
}

// {June 6th, 2005}, {June 6}, {May 3rd, 04}, {May 24 10:11:26 2005}, 

function LmDate4ObjectHandler(appCtxt) {
	LmDateObjectHandler.call(this, appCtxt);
}

LmDate4ObjectHandler.prototype = new LmDateObjectHandler;
LmDate4ObjectHandler.prototype.constructor = LmDate4ObjectHandler;

LmDate4ObjectHandler.REGEX = new RegExp("\\b" + $RE_MONTH + $RE_SP + $RE_DOM + $RE_OP_TIME + $RE_OP_YEAR42 + "\\b", "ig"),

LmDate4ObjectHandler.prototype.match =
function(line, startIndex) {
	LmDate4ObjectHandler.REGEX.lastIndex = startIndex;
	var result = LmDate4ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(LmDateObjectHandler.getCurrentDate());
	var month = LmDateObjectHandler.MONTH[result[1].toLowerCase()];
	var dom = parseInt(result[2], 10);;
	d.setMonth(month, dom);
	if (result[3]) {
		var year = parseInt(result[3], 10);
		if (year < 20) 
			year += 2000;
		else if (year < 100)
			year += 1900;
		d.setYear(year);
	}
	result.context = {date: d, monthOnly: 0};
	return result;
}

//{12/25/2005}, {06/06/05}, {12-25-2005}, {06-06-05}, etc

function LmDate5ObjectHandler(appCtxt) {
	LmDateObjectHandler.call(this, appCtxt);
}

LmDate5ObjectHandler.prototype = new LmDateObjectHandler;
LmDate5ObjectHandler.prototype.constructor = LmDate5ObjectHandler;

LmDate5ObjectHandler.REGEX = new RegExp("\\b" + $RE_MM + $RE_DASH_OR_SLASH + $RE_DD + $RE_DASH_OR_SLASH + $RE_YEAR42 + "\\b", "ig"),

LmDate5ObjectHandler.prototype.match =
function(line, startIndex) {
	LmDate5ObjectHandler.REGEX.lastIndex = startIndex;
	var result = LmDate5ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(LmDateObjectHandler.getCurrentDate());
	var month = parseInt(result[1], 10) - 1;
	var dom = parseInt(result[2], 10);
	d.setMonth(month, dom);
	var year = parseInt(result[3], 10);
	if (year < 20) 
		year += 2000;
	else if (year < 100)
		year += 1900;
	d.setYear(year);

	result.context = {date: d, monthOnly: 0};
	return result;
}

// {2005/06/24}, {2005/12/25}, {2005-06-24}

function LmDate6ObjectHandler(appCtxt) {
	LmDateObjectHandler.call(this, appCtxt);
}

LmDate6ObjectHandler.prototype = new LmDateObjectHandler;
LmDate6ObjectHandler.prototype.constructor = LmDate6ObjectHandler;

LmDate6ObjectHandler.REGEX = new RegExp("\\b" + $RE_YEAR4 + $RE_DASH_OR_SLASH + $RE_MM + $RE_DASH_OR_SLASH + $RE_DD + "\\b", "ig"),

LmDate6ObjectHandler.prototype.match =
function(line, startIndex) {
	LmDate6ObjectHandler.REGEX.lastIndex = startIndex;
	var result = LmDate6ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(LmDateObjectHandler.getCurrentDate());
	var year = parseInt(result[1], 10);
	var month = parseInt(result[2], 10) - 1;
	var dom = parseInt(result[3], 10);
	d.setMonth(month, dom);
	d.setYear(year);

	result.context = {date: d, monthOnly: 0};
	return result;
}

