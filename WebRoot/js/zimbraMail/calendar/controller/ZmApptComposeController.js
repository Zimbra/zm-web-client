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
function(appt, mode) {
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

	this._setFormatBtnItem(true);

	this._app.pushView(ZmController.APPOINTMENT_VIEW, true);
	this._apptView.set(appt, mode);
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

ZmApptComposeController.prototype.saveAppt = 
function(attId) {
	var appt = this._apptView.getAppt(attId);
	if (appt)
		this._schedule(this._doSave, {appt: appt, attId: attId});
};

ZmApptComposeController.prototype.getFreeBusyInfo = 
function(startTime, endTime, emailList, callback) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	this._appCtxt.getAppController().sendRequest(soapDoc, true, callback);
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

	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);

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
function(skipNotify) {
	// based on preference, set the compose mode
	var bComposeEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	var composeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, composeMode, skipNotify);
};

ZmApptComposeController.prototype._showErrorMessage = 
function() {
	if (this._apptErrorDialog == null) {
		this._apptErrorDialog = new DwtMessageDialog(this._shell);
	}

	// XXX: temp error msg (until we get proper error handling mechanism, ala tooltips)
	var msg = "Cannot save appointment. You have errors that must be corrected. Please correct them and try again or contact your System Administrator.";
	this._apptErrorDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	this._apptErrorDialog.popup();
};

// Spell check methods

ZmApptComposeController.prototype._spellCheckAgain = 
function() {
	this._apptView.getHtmlEditor().discardMisspelledWords();
	this._doSpellCheck();
	return false;
};

ZmApptComposeController.prototype._exitSpellChecker =
function() {
	this._apptView.getHtmlEditor().discardMisspelledWords();
	return false;
};

ZmApptComposeController.prototype._resetSpellCheckButton = 
function() {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setToggled(false);
	if (this._spellCheckModeDivId != null) {
		var div = document.getElementById(this._spellCheckModeDivId);
		if (div)
			div.parentNode.removeChild(div);
		this._spellCheckModeDivId = null;
	}
};


// Listeners

// Save button was pressed
ZmApptComposeController.prototype._saveListener =
function(ev) {
	var popView = true;
	if (this._apptView.isDirty()) {
		popView = false;
		// check if all fields are populated w/ valid values
		if (this._apptView.isValid()) {
			this.saveAppt();
		} else {
			// XXX: show error dialog for now (until we get proper error handling mechanism)
			this._showErrorMessage();
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
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton.isToggled()) {
		this._doSpellCheck();
	} else {
		this._apptView.getHtmlEditor().discardMisspelledWords();
	}
};


// Callbacks

ZmApptComposeController.prototype._doSave = 
function(params) {
	try {
		params.appt.save(params.attId);
		this._apptView.cleanup();	// always cleanup the views
		this._app.popView(true);	// force pop view
	} catch(ex) {
		this._handleException(ex, this._doSave, params, false);
	}
};

ZmApptComposeController.prototype._doSpellCheck =  
function() {
	var text = this._apptView.getHtmlEditor().getTextVersion();
	var soap = AjxSoapDoc.create("CheckSpellingRequest", "urn:zimbraMail");
	soap.getMethod().appendChild(soap.getDoc().createTextNode(text));
	var cmd = new ZmCsfeCommand();
	var callback = new AjxCallback(this, this._spellCheckCallback);
	cmd.invoke({soapDoc:soap, asyncMode:true, callback:callback});
};

// Called as: Yes, save as draft
ZmApptComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	this._app.getAppViewMgr().showPendingView(true);
	this._apptView.cleanup();
};

// Called as: No, don't cancel
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
	this._apptView.reEnableDesignMode();
};

ZmApptComposeController.prototype._spellCheckCallback = 
function(args) {
	if (args._isException) {
		this._appCtxt.setStatusMsg(ZmMsg.spellCheckUnavailable, ZmStatusView.LEVEL_CRITICAL);	
		throw args;
	}

	var words = args._data.Body.CheckSpellingResponse;
	if (!words.available) {
		this._appCtxt.setStatusMsg(ZmMsg.spellCheckUnavailable, ZmStatusView.LEVEL_CRITICAL);
		throw new AjxException("Server-side spell checker is not available.");
	}

	words = words.misspelled;

	if (!words || words.length == 0) {
		this._appCtxt.setStatusMsg(ZmMsg.noMisspellingsFound, ZmStatusView.LEVEL_INFO);	
		this._resetSpellCheckButton();
	} else {
		this._toolbar.getButton(ZmOperation.SPELL_CHECK).setToggled(true);
		this._appCtxt.setStatusMsg(words.length + " "+ (words.length > 1 ? ZmMsg.misspellings : ZmMsg.misspelling), ZmStatusView.LEVEL_WARNING);
		var editor = this._apptView.getHtmlEditor();
		if (!editor.onExitSpellChecker) {
			editor.onExitSpellChecker = new AjxCallback(this, this._resetSpellCheckButton);
		}
		editor.highlightMisspelledWords(words);
	}
};
