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
* @param className 		class name for this view (defaults to ZmApptComposeView)
* @param calApp			a handle to the owning calendar application
* @param controller		the controller for this view
* @param contactPicker	handle to a ZmContactPicker for selecting addresses
* @param composeMode 	passed in so detached window knows which mode to be in on startup
*/
function ZmApptComposeView(parent, className, calApp, controller, contactPicker, composeMode) {

	className = className || "ZmApptComposeView";
	DwtComposite.call(this, parent, className, Dwt.ABSOLUTE_STYLE);
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._app = calApp;
	this._controller = controller;
	this._contactPicker = contactPicker;
	
	this._initialize(composeMode);
};

ZmApptComposeView.prototype = new DwtComposite;
ZmApptComposeView.prototype.constructor = ZmApptComposeView;

// Consts

// Message dialog placement
ZmApptComposeView.DIALOG_X = 50;
ZmApptComposeView.DIALOG_Y = 100;

ZmApptComposeView.EMPTY_FORM_RE = /^[\s\|]*$/;


// Public methods

ZmApptComposeView.prototype.toString = 
function() {
	return "ZmApptComposeView";
};

ZmApptComposeView.prototype.set =
function() {

	this.reset(true);

	// create iframe EVERY time
	//this._iframe = this._createAttachmentsContainer();
	
	// TODO - set focus

	// save form state (to check for changes)
	//this._origFormValue = this._formValue();
};

ZmApptComposeView.prototype.getComposeMode = 
function() {
	return this._apptTab.getComposeMode();
};

// Sets the mode ZmHtmlEditor should be in.
ZmApptComposeView.prototype.setComposeMode = 
function(composeMode) {
	if (composeMode == DwtHtmlEditor.TEXT || 
		(composeMode == DwtHtmlEditor.HTML && this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)))
	{
		this._apptTab.setComposeMode(composeMode);
	}
};

ZmApptComposeView.prototype.reEnableDesignMode = 
function() {
	this._apptTab.reEnableDesignMode();
};

ZmApptComposeView.prototype.reset =
function(bEnableInputs) {
	// allow both tabs to reset itself
	this._apptTab.reset(bEnableInputs);
	this._scheduleTab.reset(bEnableInputs);
};

ZmApptComposeView.prototype.isDirty =
function() {
	return (this._apptTab.isDirty() || this._scheduleTab.isDirty());
};

ZmApptComposeView.prototype.enableInputs = 
function(bEnable) {
	DBG.println("TODO: enable/disable inputs");
	// TODO
};

/**
* Adds an attachment file upload field to the compose form.
*/
ZmApptComposeView.prototype.addAttachmentField =
function() {
	this._apptTab.addAttachmentField();
};

ZmApptComposeView.prototype.tabSwitched =
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
	} else {
		this._apptTab.reEnableDesignMode();
	}
};


// Private / Protected methods

ZmApptComposeView.prototype._initialize = 
function(composeMode) {
	// TODO - add other init code here...
	
	// create the two tabs
DBG.println("ZmApptComposeView: creating tabs");
	this._tabs = new DwtTabView(this);
	
	this._apptTab = new ZmApptTabViewPage(this, this._appCtxt);
	this._scheduleTab = new ZmSchedTabViewPage(this, this._appCtxt);
	
	this._apptTabKey = this._tabs.addTab(ZmMsg.appointment, this._apptTab);
	this._scheduleTabKey = this._tabs.addTab(ZmMsg.scheduleAttendees, this._scheduleTab);
};

// Consistent spot to locate various dialogs
ZmApptComposeView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmComposeView.DIALOG_X, loc.y + ZmComposeView.DIALOG_Y);
};

ZmApptComposeView.prototype._submitAttachments =
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
ZmApptComposeView.prototype._gotAttachments =
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

ZmApptComposeView.prototype._createAttachmentsContainer =
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


function ZmSchedTabViewPage(parent, appCtxt, className, posStyle) {
	DwtTabViewPage.call(this, parent, className, posStyle);
	this._appCtxt = appCtxt;
	this._rendered = false;
};

ZmSchedTabViewPage.prototype = new DwtTabViewPage;
ZmSchedTabViewPage.prototype.constructor = ZmSchedTabViewPage;

ZmSchedTabViewPage.prototype.toString = 
function() {
	return "ZmSchedTabViewPage";
};

ZmSchedTabViewPage.prototype.showMe = 
function() {
	DwtTabViewPage.prototype.showMe.call(this);
	if (!this._rendered) {
		this._createHTML();
		this._rendered = true;
	}
	this.parent.tabSwitched(this._tabKey);
};

ZmSchedTabViewPage.prototype.reset = 
function(bEnableInputs) {
	// TODO
	DBG.println("TODO: schedule tab view page - enable/disable input fields");
};

ZmSchedTabViewPage.prototype.isDirty =
function() {
	// TODO
	DBG.println("TODO: schedule tab view is dirty");
	return false;
};

ZmSchedTabViewPage.prototype._createHTML = 
function() {
	// TODO
	this.getHtmlElement().innerHTML = "TODO";
};
