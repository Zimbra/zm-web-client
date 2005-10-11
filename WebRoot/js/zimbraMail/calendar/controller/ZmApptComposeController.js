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
* Creates a new appointment controller to manage appointment creation/editing.
* @constructor
* @class
* This class manages appointment creation/editing.
*
* @author Parag Shah
* @param appCtxt		the application context
* @param container		the containing element
* @param mailApp		a handle to the calendar application
*/
function ZmApptComposeController(appCtxt, container, calApp) {

	ZmController.call(this, appCtxt, container, calApp);
};

ZmApptComposeController.prototype = new ZmController();
ZmApptComposeController.prototype.constructor = ZmApptComposeController;

ZmApptComposeController.prototype.toString =
function() {
	return "ZmApptComposeController";
};

// Public methods

ZmApptComposeController.prototype.show =
function() {
	if (!this._toolbar)
		this._createToolBar();

	if (!this._apptView) {
		this._apptView = new ZmApptComposeView(this._container, null, this._app, this);
		var callbacks = new Object();
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this.popShield);
		var elements = new Object();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._apptView;
	    this._app.createView(ZmController.APPOINTMENT_VIEW, elements, callbacks);
	}

	this._setFormatBtnItem();

	this._apptView.set();
	this._app.pushView(ZmController.APPOINTMENT_VIEW, true);
	this._apptView.reEnableDesignMode();
};

ZmApptComposeController.prototype.popShield =
function() {
	if (!this._apptView.isDirty()) {
		this._apptView.cleanup();
		return true;
	}

	if (!this._popShield) {
		this._popShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
		this._popShield.setMessage(ZmMsg.askLeaveAppt, DwtMessageDialog.WARNING_STYLE);
		this._popShield.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		this._popShield.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	}
	this._apptView.enableInputs(false);
    this._popShield.popup(this._apptView._getDialogXY());
	return false;
};

ZmApptComposeController.prototype.getToolbar = 
function() {
	return this._toolbar;
};


// Private / Protected methods

ZmApptComposeController.prototype._createToolBar =
function() {
	var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL, ZmOperation.SEP, ZmOperation.ATTACHMENT];

	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED))
		buttons.push(ZmOperation.COMPOSE_FORMAT);

	buttons.push(ZmOperation.SPELL_CHECK);

	this._toolbar = new ZmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, "ZmAppToolBar");
	this._toolbar.addSelectionListener(ZmOperation.SAVE, new AjxListener(this, this._saveListener));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, new AjxListener(this, this._cancelListener));
	this._toolbar.addSelectionListener(ZmOperation.ATTACHMENT, new AjxListener(this, this._attachmentListener));

	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		var formatButton = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
		var m = new DwtMenu(formatButton);
		formatButton.setMenu(m);
	
		var mi = new DwtMenuItem(m, DwtMenuItem.RADIO_STYLE);
		mi.setImage("HtmlDoc");
		mi.setText(ZmMsg.htmlDocument);
		mi.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.HTML);
		mi.addSelectionListener(new AjxListener(this, this._formatListener));
		
		mi = new DwtMenuItem(m, DwtMenuItem.RADIO_STYLE);
		mi.setImage("GenericDoc");
		mi.setText(ZmMsg.plainText);
		mi.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.TEXT);
		mi.addSelectionListener(new AjxListener(this, this._formatListener));	
	}

	this._toolbar.addSelectionListener(ZmOperation.SPELL_CHECK, new AjxListener(this, this._spellCheckListener));
};

// inits check mark for menu item depending on compose mode preference
ZmApptComposeController.prototype._setFormatBtnItem = 
function() {
	// based on preference, set the compose mode
	var bComposeEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	var composeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, composeMode);
};


// Listeners

// Save button was pressed
ZmApptComposeController.prototype._saveListener =
function(ev) {
	var popView = true;
	if (this._apptView.isDirty()) {
		// check if all fields are populated w/ valid values
		if (this._apptView.isValid()) {
			// TODO:
			// - send request to save appointment
		} else {
			popView = false;
		}
	}

	if (popView) {
		this._apptView.cleanup();	// always cleanup the views
		this._app.popView(true);	// force pop view
	}
};

// Cancel button was pressed
ZmApptComposeController.prototype._cancelListener =
function(ev) {
	this._app.popView();
};

// Attachment button was pressed
ZmApptComposeController.prototype._attachmentListener =
function(ev) {
	this._apptView.addAttachmentField();
};

ZmApptComposeController.prototype._formatListener = 
function(ev) {
	if (!ev.item.getChecked()) 
		return;
	
	var mode = ev.item.getData(ZmHtmlEditor._VALUE);
	if (mode == this._apptView.getComposeMode())
		return;
	
	if (mode == DwtHtmlEditor.TEXT) {
		// if formatting from html to text, confirm w/ user!
		if (!this._textModeOkCancel) {
			this._textModeOkCancel = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
			this._textModeOkCancel.setMessage(ZmMsg.switchToText, DwtMessageDialog.WARNING_STYLE);
			this._textModeOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._textModeOkCallback, this);
			this._textModeOkCancel.registerCallback(DwtDialog.CANCEL_BUTTON, this._textModeCancelCallback, this);
		}
		this._textModeOkCancel.popup(this._apptView._getDialogXY());
	} else {
		this._apptView.setComposeMode(mode);
	}
};

ZmApptComposeController.prototype._spellCheckListener = 
function(ev) {
	// TODO
	DBG.println("TODO! spell check");
};


// Callbacks

// Called as: Yes, save as draft
//			  Yes, go ahead and cancel
ZmApptComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
	this._apptView.cleanup();
};

// Called as: No, don't save as draft
//			  No, don't cancel
ZmApptComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._apptView.enableInputs(true);
	this._app.getAppViewMgr().showPendingView(false);
	this._apptView.reEnableDesignMode();
};

ZmApptComposeController.prototype._textModeOkCallback = 
function(ev) {
	this._textModeOkCancel.popdown();
	this._apptView.setComposeMode(DwtHtmlEditor.TEXT);
};

ZmApptComposeController.prototype._textModeCancelCallback = 
function(ev) {
	this._textModeOkCancel.popdown();
	// reset the radio button for the format button menu
	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, DwtHtmlEditor.HTML, true);
	this._apptViewView.reEnableDesignMode();
};
