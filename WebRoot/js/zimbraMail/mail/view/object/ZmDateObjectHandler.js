/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmDateObjectHandler(appCtxt) {
	if (arguments.length == 0) return;
	ZmObjectHandler.call(this, appCtxt, ZmDateObjectHandler.TYPE);
};

ZmDateObjectHandler.prototype = new ZmObjectHandler;
ZmDateObjectHandler.prototype.constructor = ZmDateObjectHandler;


ZmDateObjectHandler.TYPE = "date";

// needs to be kept in sync with ZmDateObjectHandler.DOW
var $RE_DOW = "(Mon(?:day)?|Tue(?:s(?:day)?)?|Wed(?:nesday)?|Thu(?:rs(?:day)?)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)";

ZmDateObjectHandler.DOW = { 
	sunday: 0, sun:0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3, 
	thursday: 4, thur: 4, thu: 4, friday: 5, fri: 5, saturday: 6, sat: 6 
};

var $RE_DOM = "(\\d{1,2})(?:st|nd|rd|th)?";

// needs to be kept in sync with ZmDateObjectHAndler.MONTH
var $RE_MONTH = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

ZmDateObjectHandler.MONTH = { 
	january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3, may: 4, june: 5, jun: 5, 
	july: 6, jul: 6, august: 7, aug: 7, september: 8, sept: 8, sep: 8, october: 9, oct: 9, november: 10, nov: 10, 
	december: 11, dec: 11
};

var $RE_TODAY_TOMORROW_YESTERDAY = "(today|tomorrow|yesterday)";

var $RE_NEXT_THIS_LAST = "(next|this|last)";

var $RE_COMMA_OR_SP = "(?:\\s+|\\s*,\\s*)";

var $RE_DASH = "(?:-)";

var $RE_SLASH = "(?:\\/)";

var $RE_SP = "\\s+";

var $RE_YEAR4 = "(\\d{4})";

var $RE_MM = "(\\d{1,2})";

var $RE_DD = "(\\d{1,2})";

var $RE_YEAR42 = "(\\d{4}|\\d{2})";

var $RE_OP_TIME = "(?:\\s+\\d{1,2}:\\d{2}:\\d{2}\\s*)?";

var $RE_OP_DOW = "(?:\\s*"+$RE_DOW+"\\s*)?";

var $RE_OP_YEAR42 = "(?:" + $RE_COMMA_OR_SP + $RE_YEAR42 +")?";

var $RE_OP_YEAR4 = "(?:" + $RE_COMMA_OR_SP + $RE_YEAR4 +")?";

/*
$RE_MONTH + $RE_OP_YEAR4                                    // {June, 2005}, {April}, {March 2006}

$RE_DOW + $RE_COMMA_OR_SP + RE_MONTH + $RE_SP + $RE_DOM +
                 $RE_OP_TIME + $RE_OP_YEAR42  // {Friday, March 2nd}, {Mon Mar 22}, {Tue May 24 10:11:26 2005}
*/

ZmDateObjectHandler.registerHandlers =
function(handlers, appCtxt) {
	handlers[ZmDateObjectHandler.TYPE] = [new ZmDate1ObjectHandler(appCtxt), 
					 					new ZmDate2ObjectHandler(appCtxt),
							 			new ZmDate3ObjectHandler(appCtxt),
							 			new ZmDate4ObjectHandler(appCtxt),
							 			new ZmDate5ObjectHandler(appCtxt),
							 			new ZmDate6ObjectHandler(appCtxt),
							 			new ZmDate7ObjectHandler(appCtxt),
							 			new ZmDate8ObjectHandler(appCtxt)];
};

ZmDateObjectHandler._currentDate = new Date();

ZmDateObjectHandler.setCurrentDate =
function(date) {
	ZmDateObjectHandler._currentDate = new Date(date);
};

ZmDateObjectHandler.getCurrentDate =
function(date) {
	return ZmDateObjectHandler._currentDate;
};

ZmDateObjectHandler.prototype.getToolTipText =
function(obj, context) {
	var cc = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
	return cc.getDayToolTipText(context ? context.date : new Date());

};

// Create action menu if needed
ZmDateObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	//var isMonthYear = obj.match(ZmDateObjectHandler.MonthYear_RE);
	//var calOp = isMonthYear ? ZmOperation.MONTH_VIEW : ZmOperation.DAY_VIEW;
	var calOp = ZmOperation.DAY_VIEW;
	var list = [calOp, ZmOperation.NEW_APPT];
	this._menu = new ZmActionMenu(this._appCtxt.getShell(), list);
	this._menu.addSelectionListener(calOp, new AjxListener(this, this._dayViewListener));
	this._menu.addSelectionListener(ZmOperation.NEW_APPT, new AjxListener(this, this._newApptListener));
	this._actionObject = obj;
	this._actionContext = context;
	return this._menu;
};

ZmDateObjectHandler.prototype._calViewListener =
function(ev) {
	var obj = this._actionObject;
	var op = ev.item.getData(ZmOperation.KEY_ID);
	var isDayView = (op == ZmOperation.DAY_VIEW);
	var view = isDayView ? ZmController.CAL_DAY_VIEW : ZmController.CAL_MONTH_VIEW;
	DBG.println(AjxDebug.DBG3, "handing date off to calendar " + isDayView ? "day" : "month" + " view: " + date);
	var calApp = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
	calApp.activate(true, null, this._actionContext.date);
};

ZmDateObjectHandler.prototype._dayViewListener =
function(ev) {
	var obj = this._actionObject;
	var calApp = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
	calApp.activate(true, ZmController.CAL_DAY_VIEW, this._actionContext.date);
};

ZmDateObjectHandler.prototype._newApptListener =
function(ev) {
	var cc = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
	cc.newAppointmentHelper(this._actionContext.date, null, null, ev.shiftKey);
};

ZmDateObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	var calApp = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
	calApp.activate(true, null, context.date);
};

// today/yesterday =======================

function ZmDate1ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate1ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate1ObjectHandler.prototype.constructor = ZmDate1ObjectHandler;

ZmDate1ObjectHandler.REGEX = new RegExp("\\b" + $RE_TODAY_TOMORROW_YESTERDAY + "\\b", "ig"),

ZmDate1ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate1ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate1ObjectHandler.REGEX.exec(line);
	if (result == null) return null;
	
	var d = new Date(ZmDateObjectHandler.getCurrentDate());
	var when = result[1].toLowerCase();
	if (when == "yesterday") {
		d.setDate(d.getDate()-1);
	} else if (when == "tomorrow") {
		d.setDate(d.getDate()+1);
	}
	result.context = {date: d, monthOnly: 0};
	return result;
};

// {next Tuesday}, {last Monday}, etc

function ZmDate2ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate2ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate2ObjectHandler.prototype.constructor = ZmDate2ObjectHandler;

ZmDate2ObjectHandler.REGEX = new RegExp("\\b" + $RE_NEXT_THIS_LAST + $RE_SP + $RE_DOW + "\\b", "ig"),

ZmDate2ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate2ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate2ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
	var dow = d.getDay();
	var ndow = ZmDateObjectHandler.DOW[result[2].toLowerCase()];
	var addDays;
			
	if (result[1].toLowerCase() == "next") {
		addDays = ndow - dow;
		addDays += 7;
	} else if (result[1].toLowerCase() == "this") {
		addDays = ndow - dow;			
	} else { // last
		addDays = (-1 * (dow + 7 - ndow)) % 7;
		if (addDays == 0)
			addDays = -7;
	}
	d.setDate(d.getDate() + addDays);
	result.context = {date: d, monthOnly: 0};
	return result;
};

// {25th December}, {6th, June}, {6 June 2004}, {25th December, 2005}

function ZmDate3ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate3ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate3ObjectHandler.prototype.constructor = ZmDate3ObjectHandler;

ZmDate3ObjectHandler.REGEX = 	new RegExp("\\b" + $RE_DOM + $RE_COMMA_OR_SP + $RE_MONTH + $RE_OP_YEAR42 + "\\b", "ig"),

ZmDate3ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate3ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate3ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
	var dom = parseInt(result[1], 10);;
	var month = ZmDateObjectHandler.MONTH[result[2].toLowerCase()];
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
};

// {June 6th, 2005}, {June 6}, {May 3rd, 04}, {May 24 10:11:26 2005}, 

function ZmDate4ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate4ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate4ObjectHandler.prototype.constructor = ZmDate4ObjectHandler;

ZmDate4ObjectHandler.REGEX = new RegExp("\\b" + $RE_MONTH + $RE_SP + $RE_DOM + $RE_OP_TIME + $RE_OP_YEAR42 + "\\b", "ig"),

ZmDate4ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate4ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate4ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
	var month = ZmDateObjectHandler.MONTH[result[1].toLowerCase()];
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
};

// {12-25-2005}, {06-06-05}, etc

function ZmDate5ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate5ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate5ObjectHandler.prototype.constructor = ZmDate5ObjectHandler;

ZmDate5ObjectHandler.REGEX = new RegExp("\\b" + $RE_MM + $RE_DASH + $RE_DD + $RE_DASH + $RE_YEAR42 + "\\b", "ig"),

ZmDate5ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate5ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate5ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
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
};

// {2005-06-24}

function ZmDate6ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate6ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate6ObjectHandler.prototype.constructor = ZmDate6ObjectHandler;

ZmDate6ObjectHandler.REGEX = new RegExp("\\b" + $RE_YEAR4 + $RE_DASH + $RE_MM + $RE_DASH + $RE_DD + "\\b", "ig"),

ZmDate6ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate6ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate6ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
	var year = parseInt(result[1], 10);
	var month = parseInt(result[2], 10) - 1;
	var dom = parseInt(result[3], 10);
	d.setMonth(month, dom);
	d.setYear(year);

	result.context = {date: d, monthOnly: 0};
	return result;
};


//{12/25/2005}, {06/06/05}, etc

function ZmDate7ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate7ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate7ObjectHandler.prototype.constructor = ZmDate7ObjectHandler;

ZmDate7ObjectHandler.REGEX = new RegExp("\\b" + $RE_MM + $RE_SLASH + $RE_DD + $RE_SLASH + $RE_YEAR42 + "\\b", "ig"),

ZmDate7ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate7ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate7ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
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
};

// {2005/06/24}, {2005/12/25}

function ZmDate8ObjectHandler(appCtxt) {
	ZmDateObjectHandler.call(this, appCtxt);
};

ZmDate8ObjectHandler.prototype = new ZmDateObjectHandler;
ZmDate8ObjectHandler.prototype.constructor = ZmDate8ObjectHandler;

ZmDate8ObjectHandler.REGEX = new RegExp("\\b" + $RE_YEAR4 + $RE_SLASH + $RE_MM + $RE_SLASH + $RE_DD + "\\b", "ig"),

ZmDate8ObjectHandler.prototype.match =
function(line, startIndex) {
	ZmDate8ObjectHandler.REGEX.lastIndex = startIndex;
	var result = ZmDate8ObjectHandler.REGEX.exec(line);
	if (result == null) return null;

	var d = new Date(ZmDateObjectHandler.getCurrentDate());
	var year = parseInt(result[1], 10);
	var month = parseInt(result[2], 10) - 1;
	var dom = parseInt(result[3], 10);
	d.setMonth(month, dom);
	d.setYear(year);

	result.context = {date: d, monthOnly: 0};
	return result;
};
