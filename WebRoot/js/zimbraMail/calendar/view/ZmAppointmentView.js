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

/**
* Creates a new appointment view. The view does not display itself on construction.
* @constructor
* @class
* This class provides a form for creating/editing appointments.
*
* @author Parag Shah
* @param parent			the element that created this view
* @param className 		class name for this view (defaults to ZmAppointmentView)
* @param calApp			a handle to the owning calendar application
* @param controller		the controller for this view
* @param contactPicker	handle to a ZmContactPicker for selecting addresses
* @param composeMode 	passed in so detached window knows which mode to be in on startup
*/
function ZmAppointmentView(parent, className, calApp, controller, contactPicker, composeMode) {

	className = className || "ZmAppointmentView";
	DwtComposite.call(this, parent, className, Dwt.ABSOLUTE_STYLE);
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._app = calApp;
	this._controller = controller;
	this._contactPicker = contactPicker;
	
	this._initialize(composeMode);
};

ZmAppointmentView.prototype = new DwtComposite;
ZmAppointmentView.prototype.constructor = ZmAppointmentView;

// Consts

// Message dialog placement
ZmAppointmentView.DIALOG_X = 50;
ZmAppointmentView.DIALOG_Y = 100;

// The iframe holds a form with attachment input fields
ZmAppointmentView.IFRAME_HEIGHT = 30;
ZmAppointmentView.UPLOAD_FIELD_NAME = "attUpload";

ZmAppointmentView.EMPTY_FORM_RE = /^[\s\|]*$/;

ZmAppointmentView.REMINDER_OPTIONS = [ZmMsg.none, 
	"0 " + ZmMsg.minutes, "5 " + ZmMsg.minutes, "10 " + ZmMsg.minutes, "15 " + ZmMsg.minutes, "30 " + ZmMsg.minutes,
	"1 " + ZmMsg.hour, "2 " + ZmMsg.hours, "3 " + ZmMsg.hours, "4 " + ZmMsg.hours, "5 " + ZmMsg.hours, "6 " + ZmMsg.hours, "7 " + ZmMsg.hours, "8 " + ZmMsg.hours, "9 " + ZmMsg.hours, "10 " + ZmMsg.hours, "11 " + ZmMsg.hours, 
	"0.5 " + ZmMsg.days, "18 " + ZmMsg.hours, 
	"1 " + ZmMsg.day, "2 " + ZmMsg.days, "3 " + ZmMsg.days, "4 " + ZmMsg.days, 
	"1 " + ZmMsg.week, "2 " + ZmMsg.weeks];

// Public methods

ZmAppointmentView.prototype.toString = 
function() {
	return "ZmAppointmentView";
};

ZmAppointmentView.prototype.set =
function() {

	this.reset(true);

	// create iframe EVERY time
	//this._iframe = this._createAttachmentsContainer();
	
	// TODO - set focus

	// save form state (to check for changes)
	//this._origFormValue = this._formValue();
};

ZmAppointmentView.prototype.getComposeMode = 
function() {
	return this._composeMode;
};

// Sets the mode ZmHtmlEditor should be in.
ZmAppointmentView.prototype.setComposeMode = 
function(composeMode) {
	if (composeMode == DwtHtmlEditor.TEXT || 
		(composeMode == DwtHtmlEditor.HTML && this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)))
	{
		this._composeMode = composeMode;
	
		this._htmlEditor.setMode(composeMode, true);
		// dont forget to reset the body field Id and object ref
		this._bodyFieldId = this._htmlEditor.getBodyFieldId();
		this._bodyField = Dwt.getDomObj(this.getDocument(), this._bodyFieldId);
		
		// for now, always reset message body size
		//this._resetBodySize();
	}
};

ZmAppointmentView.prototype.reEnableDesignMode = 
function() {
	if (this._composeMode == DwtHtmlEditor.HTML)
		this._htmlEditor.reEnableDesignMode();
};

ZmAppointmentView.prototype.reset =
function(bEnableInputs) {
	// the div that holds the iframe and null out innerHTML
	this._iframe = null;
	//this._iframeDiv.innerHTML = "";
	
	//this._resetBodySize();

	// reset form value
	this._origFormValue = null;

	// enable/disable input fields
	this.enableInputs(bEnableInputs);
};

ZmAppointmentView.prototype.isDirty =
function() {
	// any attachment activity => dirty
	if (this._gotAttachments())
		return true;

	// TODO
	return false;
/*
	var curFormValue = this._formValue();

	// empty subject and body => not dirty
	if (curFormValue.match(ZmAppointmentView.EMPTY_FORM_RE))
		return false;

	// subject or body has changed => dirty
	return (curFormValue != this._origFormValue);
*/
};

ZmAppointmentView.prototype.enableInputs = 
function(bEnable) {
	DBG.println("TODO: enable/disable inputs");
	// TODO
};

ZmAppointmentView.prototype.getHtmlEditor = 
function() {
	return this._htmlEditor;
};

/**
* Adds an attachment file upload field to the compose form.
*/
ZmAppointmentView.prototype.addAttachmentField =
function() {

	// just in case... iframes are tempermental
	var attTable = this._getAttachmentTable();
	if (!attTable) return;
	
	// add new row
	var	row = attTable.insertRow(-1);
	var attId = "_att_" + Dwt.getNextId();
	var attRemoveId = attId + "_r";
	var attInputId = attId + "_i";
	row.id = attId;
	row.style.height = ZmAppointmentView.IFRAME_HEIGHT;

	// add new cell and build html for inserting file upload input element
	var	cell = row.insertCell(-1);
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellspacing=4 cellpadding=0 border=0><tr>";
	html[idx++] = "<td><div class='attachText'>" + ZmMsg.attachFile + ":</div></td>";
	html[idx++] = "<td class='nobreak'>";
	html[idx++] = "<input id='" + attInputId + "' type='file' name='" + ZmComposeView.UPLOAD_FIELD_NAME + "' size=40>&nbsp;";
	html[idx++] = "<span id='" + attRemoveId + "'";
	html[idx++] = " onmouseover='this.style.cursor=\"pointer\"' onmouseout='this.style.cursor=\"default\"' style='color:blue;text-decoration:underline;'";
	html[idx++] = ">" + ZmMsg.remove + "</span>";
	html[idx++] = "</td></tr></table>";
	cell.innerHTML = html.join("");
	
	this._setEventHandler(attRemoveId, "onClick", null, !AjxEnv.isNav);
	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
	if (AjxEnv.isIE)
		this._setEventHandler(attInputId, "onKeyDown", null, !AjxEnv.isNav);
	this._setAttachmentsContainerHeight(true);
	//this._resetBodySize();
};

ZmAppointmentView.prototype.resetOperations =
function(tabKey) {
	// based on the current tab selected, enable/disable appropriate buttons in toolbar
	var toolbar = this._controller.getToolbar();
	toolbar.enableAll(true);
	if (tabKey == this._scheduleTabKey) {
		var buttons = [ZmOperation.ATTACHMENT, ZmOperation.SPELL_CHECK];
		if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED))
			buttons.push(ZmOperation.COMPOSE_FORMAT);
		if (!this.isChildWindow)
			buttons.push(ZmOperation.DETACH_COMPOSE);
		toolbar.enable(buttons, false);
	}
};


// Private / Protected methods

ZmAppointmentView.prototype._initialize = 
function(composeMode) {
	// TODO - add other init code here...
	
	this._initHtml();
};

ZmAppointmentView.prototype._initHtml = 
function() {
	this._createTabs();
	this._createSelects();
	this._createApptHtml(this._apptTab);
	
	// reparent select objects w/in table cells they belong to
	var doc = this.getDocument();

	var calCell = Dwt.getDomObj(doc, this._calSelectFieldId);
	if (calCell)
		calCell.appendChild(this._calendarSelect.getHtmlElement());

	var showAsCell = Dwt.getDomObj(doc, this._showAsSelectFieldId);
	if (showAsCell)
		showAsCell.appendChild(this._showAsSelect.getHtmlElement());
	
	var reminderCell = Dwt.getDomObj(doc, this._reminderSelectFieldId);
	if (reminderCell)
		reminderCell.appendChild(this._reminderSelect.getHtmlElement());
}

ZmAppointmentView.prototype._createTabs = 
function() {
DBG.println("ZmAppointmentView: creating tabs");
	this._tabs = new ZmApptTabView(this);
	this._apptTab = new DwtTabViewPage(this);
	this._scheduleTab = new DwtTabViewPage(this);
	this._apptTabKey = this._tabs.addTab(ZmMsg.appointment, this._apptTab);
	this._scheduleTabKey = this._tabs.addTab(ZmMsg.scheduleAttendees, this._scheduleTab);
};

ZmAppointmentView.prototype._createSelects = 
function() {
	this._calendarSelect = new DwtSelect(this);
	// TODO - get all folders/links w/ view set to "Appointment" we received from initial refresh block
	this._calendarSelect.addOption("Personal Calendar", true, "Personal Calendar");
	
	this._showAsSelect = new DwtSelect(this);
	// TODO - throw these strings in ZmMsg once they are finalized
	this._showAsSelect.addOption("Free", false, "Free");
	this._showAsSelect.addOption("Tentative", false, "Tentative");
	this._showAsSelect.addOption("Busy", true, "Busy");
	this._showAsSelect.addOption("Out of Office", false, "Out of Office");
	
	this._reminderSelect = new DwtSelect(this, ZmAppointmentView.REMINDER_OPTIONS);
	this._reminderSelect.setSelectedValue(ZmMsg.none);
};

ZmAppointmentView.prototype._createApptHtml = 
function(apptTab) {
DBG.println("ZmAppointmentView: creating appoinment tab html");
	var div = this.getDocument().createElement("div");

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0 height=100% width=100%>";
	html[i++] = "<tr><td valign=top width=50%>";
	html[i++] = "<fieldset><legend>Details</legend><div style='height:110px;'>";
	html[i++] = this._getDetailsHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td><td valign=top width=50%>";
	html[i++] = "<fieldset><legend>Time</legend><div style='height:110px;'>";
	html[i++] = this._getTimeHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td></tr><tr><td colspan=2>";
	html[i++] = "<fieldset><legend>Scheduling</legend>";
	html[i++] = this._getSchedulingHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td></tr><tr><td colspan=2>";
	html[i++] = "<fieldset><legend>Attachments</legend>";
	html[i++] = this._getAttachmentsHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td></tr><tr height=100%><td colspan=2>";
	html[i++] = "<textarea style='width:100%; height:100%'></textarea>";
	html[i++] = this._getNotesHtml();
	html[i++] = "</td></tr></table>";
	
	div.innerHTML = html.join("");
	apptTab.getHtmlElement().appendChild(div);
};

ZmAppointmentView.prototype._getDetailsHtml = 
function() {
DBG.println("ZmAppointmentView: creating details html");
	this._subjectFieldId = Dwt.getNextId();
	this._locationFieldId = Dwt.getNextId();
	this._calSelectFieldId = Dwt.getNextId();
	this._showAsSelectFieldId = Dwt.getNextId();
	this._reminderSelectFieldId = Dwt.getNextId();
	this._privateFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</td><td colspan=4><input style='width:100%' id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.location;
	html[i++] = ":</td><td colspan=4><input style='width:100%' id='";
	html[i++] = this._locationFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.calendar;
	html[i++] = ":</td><td width=1% id='"
	html[i++] = this._calSelectFieldId;
	html[i++] = "'></td><td width=1% align=right class='nobreak'>";
	html[i++] = ZmMsg.showAs;
	html[i++] = "</td><td width=1% id='";
	html[i++] = this._showAsSelectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.reminder;
	html[i++] = ":</td><td width=1% id='";
	html[i++] = this._reminderSelectFieldId;
	html[i++] = "'><td colspan=2 align=right class='nobreak' valign=bottom>";
	html[i++] = "<input type='checkbox' id='";
	html[i++] = this._privateFieldId;
	html[i++] = "'>";
	html[i++] = ZmMsg._private;
	html[i++] = "</td></tr>";
	html[i++] = "</table>";
	
	return html.join("");
};

ZmAppointmentView.prototype._getTimeHtml = 
function() {
	var html = new Array();
	var i = 0;
	
	html[i++] = "<br><br>";

	return html.join("");
}

ZmAppointmentView.prototype._getSchedulingHtml = 
function() {
	var html = new Array();
	var i = 0;
	
	html[i++] = "<br><br>";
	
	return html.join("");
}

ZmAppointmentView.prototype._getAttachmentsHtml = 
function() {
	var html = new Array();
	var i = 0;
	
	html[i++] = "<br><br>";

	return html.join("");
}

ZmAppointmentView.prototype._getNotesHtml =
function() {
	var html = new Array();
	var i = 0;
	
	return html.join("");
}

ZmAppointmentView.prototype._getAttachmentTable =
function() {
	var attTable = null;

	if (!this._iframe)
		this._iframe = this._createAttachmentsContainer();

	if (AjxEnv.isIE) {
		// get iframe doc (if doesnt exist, create new iframe)
		var iframeDoc = this._getIframeDocument();
		if (!iframeDoc)	return;
	
		attTable = Dwt.getDomObj(iframeDoc, this._attachmentTableId);

	} else {
		attTable = Dwt.getDomObj(document, this._attachmentTableId);
	}
	return attTable;
};

ZmAppointmentView.prototype._setAttachmentsContainerHeight =
function(add) {
	if (AjxEnv.isIE) {
		var height = parseInt(this._iframe.style.height);
		if (add) {
			height += ZmComposeView.IFRAME_HEIGHT;
		} else {
			height -= ZmComposeView.IFRAME_HEIGHT;
		}
		this._iframe.style.height = height
	}
};

ZmAppointmentView.prototype._submitAttachments =
function(isDraft) {
	var callback = new AjxCallback(this, this._attsDoneCallback, [isDraft]);
	var um = this._appCtxt.getUploadManager();
	window._uploadManager = um;
	var attCon = null;
	if (AjxEnv.isIE) {
		attCon = this._iframe;
	} else {
		var iframe = document.getElementById(this._navIframeId);
		iframe.style.display = "block";
		var uploadForm = document.getElementById(this._uploadFormId);
		var idoc = Dwt.getIframeDoc(iframe);
		idoc.body.appendChild(uploadForm);
		attCon = iframe;
	}
	um.execute(attCon, callback, this._uploadFormId);
};

// Returns true if any of the attachment fields is populated
ZmAppointmentView.prototype._gotAttachments =
function() {
	// TODO
	/*
	var atts;
	if (AjxEnv.isIE) {
		var iframeDoc = this._getIframeDocument();
		atts = iframeDoc ? iframeDoc.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME) : [];
	} else {
		atts = document.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME);
	}
	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;
	*/

	return false;
}

ZmAppointmentView.prototype._createAttachmentsContainer =
function() {
	var container = null;
	var doc = this.getDocument();
	var uri = location.protocol + "//" + doc.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	if (AjxEnv.isIE) {
	
		// remove old iframe if it exists
		this._iframeDiv = Dwt.getDomObj(doc, this._iframeDivId);
		this._iframeDiv.innerHTML = "";
		
		// create a brand new iframe
		var iframe = container = doc.createElement("iframe");
		iframe.id = this._iframeId;
 		if (AjxEnv.isIE && location.protocol == "https:") {
			iframe.src = "'/zimbra/public/blank.html'";
		}
		iframe.name = this._iframeId;
		iframe.frameBorder = iframe.vspace = iframe.hspace = iframe.marginWidth = iframe.marginHeight = 0;
		iframe.width = "100%";
		iframe.scrolling = "no";
		iframe.style.overflowX = iframe.style.overflowY = "visible";
		iframe.style.height = "0px";
		iframe.tabIndex = -1; // dont let iframe get focus
		this._iframeDiv.appendChild(iframe);
		
		var idoc = Dwt.getIframeDoc(iframe);
		idoc.open();
		var html = new Array();
		var idx = 0;
		html[idx++] = "<html><head><style type='text/css'><!-- @import url(/zimbra/js/zimbraMail/config/style/zm.css); --></style></head>";
		html[idx++] = "<body scroll=no bgcolor='#EEEEEE'>";
		html[idx++] = "<form method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
		html[idx++] = "<table id='" + this._attachmentTableId + "' cellspacing=0 cellpadding=0 border=0 class='iframeTable'></table>";
		html[idx++] = "</form>";
		html[idx++] = "</body></html>";
		idoc.write(html.join(""));
		idoc.close();
	} else {
		var html = new Array();
		var idx = 0;
		html[idx++] = "<div style='overflow:visible'>";
		html[idx++] = "<form method='POST' action='" + uri + "' id='" + this._uploadFormId + "' enctype='multipart/form-data'>";
		html[idx++] = "<table id='" + this._attachmentTableId + "' cellspacing=0 cellpadding=0 border=0 class='iframeTable'></table>";
		html[idx++] = "</form>";
		html[idx++] = "</div>";
		this._iframeDiv = Dwt.getDomObj(document, this._iframeDivId);
		this._iframeDiv.innerHTML = html.join("");
		container = this._iframeDiv.firstChild;
	}
	return container;
};


/**
* Creates a new tab view that can be used to overload DwtTabView base class methods
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
* @param className 		class name for this view
* @param positionStyle	positioning style (defaults to "absolute")
*/
function ZmApptTabView(parent, className, positionStyle) {
	DwtTabView.call(this, parent, className, positionStyle);
};

ZmApptTabView.prototype = new DwtTabView;
ZmApptTabView.prototype.constructor = ZmApptTabView;

ZmApptTabView.prototype.toString = 
function() {
	return "ApptTabView";
};

ZmApptTabView.prototype.switchToTab = 
function(tabKey) {
	DwtTabView.prototype.switchToTab.call(this, tabKey);
	this.parent.resetOperations(tabKey);
};
