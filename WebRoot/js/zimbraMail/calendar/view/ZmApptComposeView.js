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
function ZmApptComposeView(parent, className, calApp, controller, composeMode) {

	className = className || "ZmApptComposeView";
	DwtComposite.call(this, parent, className, Dwt.ABSOLUTE_STYLE);
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._app = calApp;
	this._controller = controller;
	
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

	// allow both tabs to reset itself
	this._apptTab.reset();
	this._scheduleTab.reset();

	// TODO:
	// save form state (to check for changes)
	//this._origFormValue = this._formValue();
};

ZmApptComposeView.prototype.cleanup = 
function() {
	// allow both tabs to cleanup
	this._apptTab.cleanup();
	this._scheduleTab.cleanup();
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

ZmApptComposeView.prototype.isDirty =
function() {
	return (this._apptTab.isDirty() || this._scheduleTab.isDirty());
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
		// disable toolbar buttons (except save/cancel)
		var buttons = [ZmOperation.ATTACHMENT, ZmOperation.SPELL_CHECK];
		if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED))
			buttons.push(ZmOperation.COMPOSE_FORMAT);
		if (!this.isChildWindow)
			buttons.push(ZmOperation.DETACH_COMPOSE);
		toolbar.enable(buttons, false);
		// disable input fields in appointment tab
		this._apptTab.enableInputs(false);
	} else {
		this._apptTab.enableInputs(true);
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

ZmSchedTabViewPage.prototype.cleanup = 
function() {
	// TODO
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
