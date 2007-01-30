/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
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
*
* @param appCtxt	[ZmAppCtxt]		the application context
* @param container	[DwtComposite]	the containing element
* @param calApp		[ZmCalendarApp]	a handle to the calendar application
*/
function ZmApptComposeController(appCtxt, container, calApp) {

	ZmController.call(this, appCtxt, container, calApp);

	this._addedAttendees = [];
	this._removedAttendees = [];
	
	calApp.loadResources();	// make sure resources are available for autocomplete
	this._kbMgr = appCtxt.getKeyboardMgr();
};

ZmApptComposeController.prototype = new ZmController();
ZmApptComposeController.prototype.constructor = ZmApptComposeController;

ZmApptComposeController.prototype.toString =
function() {
	return "ZmApptComposeController";
};

// Public methods

ZmApptComposeController.prototype.show =
function(appt, mode, isDirty) {

	this._addedAttendees.length = this._removedAttendees.length = 0;
	this._initToolbar(mode);
	this.initApptComposeView();
	this._setFormatBtnItem(true);

	this._app.pushView(ZmController.APPOINTMENT_VIEW);
	this._apptView.set(appt, mode, isDirty);
	this._apptView.reEnableDesignMode();
	this._apptView.applyCaretHack();
};

ZmApptComposeController.prototype._preHideCallback =
function(view, force) {
	ZmController.prototype._preHideCallback.call(this);
	return force ? true : this.popShield();
};

ZmApptComposeController.prototype._postShowCallback =
function(view, force) {
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmApptComposeController.prototype.popShield =
function() {
	if (!this._apptView.isDirty()) {
		this._apptView.cleanup();
		return true;
	}

	var ps = this._popShield = this._appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.popup(this._apptView._getDialogXY());

	return false;
};

ZmApptComposeController.prototype.getToolbar = 
function() {
	return this._toolbar;
};

ZmApptComposeController.prototype.saveAppt = 
function(attId) {
	var appt = this._apptView.getAppt(attId);
	if (appt) {
		// bug fix #4160
		var origAttendees = appt.getOrigAttendees();
		if (!this._apptView.getApptTab().isDirty(true) &&	// make sure other fields (besides attendees field) have not changed
			attId == null && 								// make sure we're not u/l'ing a file
			origAttendees && origAttendees.length > 0) 		// make sure we are editing an existing appt w/ attendees
		{
			var attendees = appt.getAttendees();
			if (attendees.length > 0) {
				// check whether organizer has added/removed any attendees
				if (this._attendeesUpdated(appt, attId, attendees, origAttendees))
					return false;
			}
		}
		// otherwise, just save the appointment
		this._saveApptFoRealz(appt, attId);
	}
	return true;
};

ZmApptComposeController.prototype.getFreeBusyInfo = 
function(startTime, endTime, emailList, callback) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: callback});
};

ZmApptComposeController.prototype.toggleSpellCheckButton = 
function(toggled) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setToggled((toggled || false));
};

ZmApptComposeController.prototype.initApptComposeView = 
function(initHide) {
	if (!this._apptView) {
		this._apptView = new ZmApptComposeView(this._container, null, this._app, this);
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		var elements = {};
		if (!this._toolbar)
			this._createToolBar();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._apptView;
	    this._app.createView(ZmController.APPOINTMENT_VIEW, elements, callbacks, false, true);
	    if (initHide) {
	    	this._apptView.preload();
	    } else {
			this._setApptComposeTabGroup();
	    }
	}
};

ZmApptComposeController.prototype._setApptComposeTabGroup =
function(setFocus) {
	DBG.println(AjxDebug.DBG2, "_setApptComposeTabGroup");
	var tg = this._createTabGroup();
	var rootTg = this._appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
	var tabView = this._apptView.getTabView(this._apptView.getCurrentTab());
	tabView._addTabGroupMembers(tg);
	
	var focusItem = tabView._savedFocusMember || tabView._getDefaultFocusItem() || tg.getFirstMember(true);
	var ta = new AjxTimedAction(this, this._setFocus, [focusItem, !setFocus]);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmApptComposeController.prototype._setFocus =
function(focusItem, noFocus) {
	DBG.println("kbnav", "timed action restoring focus to " + focusItem + "; noFocus = " + noFocus);
	this._restoreFocus(focusItem, noFocus);
};

ZmApptComposeController.prototype.getKeyMapName =
function() {
	return "ZmApptComposeController";
};

ZmApptComposeController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println("ZmApptComposeController.handleKeyAction");
	switch (actionCode) {

		case ZmKeyMap.SAVE:
			this._saveListener();
			break;
		
		case ZmKeyMap.CANCEL:
			this._cancelListener();
			break;
		
		case ZmKeyMap.ALL_DAY:
			var tabView = this._apptView.getTabView(this._apptView.getCurrentTab());
			if (tabView && tabView.toggleAllDayField) {
				tabView.toggleAllDayField();
			}
			break;

		case ZmKeyMap.HTML_FORMAT:
			if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
				var mode = this._apptView.getComposeMode();
				var newMode = (mode == DwtHtmlEditor.TEXT) ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
				this._formatListener(null, newMode);
				// reset the radio button for the format button menu
				var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
				if (formatBtn) {
					formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, newMode, true);
				}
			}
			break;

		default:
			return ZmController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

ZmApptComposeController.prototype.getTabView =
function() {
	return this._apptView;
};

// Private / Protected methods

ZmApptComposeController.prototype._initToolbar = 
function(mode) {
	if (!this._toolbar)
		this._createToolBar();

	var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
	if (mode == null || mode == ZmAppt.MODE_NEW || mode == ZmAppt.MODE_NEW_FROM_QUICKADD) {
		cancelButton.setText(ZmMsg.cancel);
		cancelButton.setImage("Cancel");
	} else {
		cancelButton.setText(ZmMsg.close);
		cancelButton.setImage("Close");
	}
};

ZmApptComposeController.prototype._createToolBar =
function() {
	var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL, ZmOperation.SEP, ZmOperation.ATTACHMENT, ZmOperation.SEP, ZmOperation.SPELL_CHECK];

	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		buttons.push(ZmOperation.SEP);
		buttons.push(ZmOperation.COMPOSE_FORMAT);
	}

	this._toolbar = new ZmButtonToolBar(this._container, buttons, null, Dwt.ABSOLUTE_STYLE, "ZmAppToolBar");
	this._toolbar.addSelectionListener(ZmOperation.SAVE, new AjxListener(this, this._saveListener));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, new AjxListener(this, this._cancelListener));
	this._toolbar.addSelectionListener(ZmOperation.ATTACHMENT, new AjxListener(this, this._attachmentListener));

	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	if (AjxEnv.is800x600orLower) {
		spellCheckButton.setText("");
	}

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
	var composeMode = (bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML)
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	if (formatBtn)
		formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, composeMode, skipNotify);
};

ZmApptComposeController.prototype._showErrorMessage = 
function(errorMsg) {
	var dialog = this._appCtxt.getMsgDialog();
	var msg = ZmMsg.errorSaving + (errorMsg ? (":<p>" + errorMsg) : ".");
	dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

ZmApptComposeController.prototype._saveApptFoRealz = 
function(appt, attId, notifyList) {
	var args = [appt];
	var mode = appt.getViewMode();
	if (mode != ZmAppt.MODE_NEW && appt._orig && appt._orig.folderId != appt.folderId) {
		// pass along folderId for appt move
		args.push(appt.folderId);
	}
	var callback = new AjxCallback(this, this._handleResponseSave, args);
	var errorCallback = new AjxCallback(this, this._handleErrorSave);
	
	appt.save(attId, callback, errorCallback, notifyList);
};

ZmApptComposeController.prototype._handleResponseSave = 
function(appt, folderId) {
	if (appt && folderId) {
		var callback = new AjxCallback(this, this._handleResponseCleanup);
		appt.move(folderId, callback);
	} else {
		this._handleResponseCleanup();
	}

	// XXX: remove once bug 6082 is fixed!
	this._app.getCalController().checkForRefresh(appt);
};

ZmApptComposeController.prototype._handleResponseCleanup = 
function() {
	this._apptView.cleanup();
};

ZmApptComposeController.prototype._handleErrorSave = 
function(ex) {
	var msg = null;
	if (ex.code == ZmCsfeException.MAIL_SEND_ABORTED_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		var invalidMsg = (invalid && invalid.length) ? AjxMessageFormat.format(ZmMsg.apptSendErrorInvalidAddresses,
														AjxStringUtil.htmlEncode(invalid.join(", "))) : null;
		msg = ZmMsg.apptSendErrorAbort + "<br/>" + invalidMsg;
	} else if (ex.code == ZmCsfeException.MAIL_SEND_PARTIAL_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		msg = (invalid && invalid.length) ? AjxMessageFormat.format(ZmMsg.apptSendErrorPartial,
											AjxStringUtil.htmlEncode(invalid.join(", "))) : ZmMsg.apptSendErrorAbort;
	}
	if (msg) {
		this._msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		this._msgDialog.popup();
		return true;
	} else {
		return false;
	}
};

ZmApptComposeController.prototype._attendeesUpdated = 
function(appt, attId, attendees, origAttendees) {
	// create hashes of emails for comparison
	var origEmails = {};
	for (var i = 0; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		origEmails[email] = true;
	}
	var curEmails = {};
	for (var i = 0; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		curEmails[email] = true;
	}

	// walk the current list of attendees and check if there any new ones
	for (var i = 0 ; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		if (!origEmails[email]) {
			this._addedAttendees.push(email);
		}
	}

	for (var i = 0 ; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		if (!curEmails[email]) {
			this._removedAttendees.push(email);
		}
	}

	if (this._addedAttendees.length > 0 || this._removedAttendees.length > 0) {
		if (!this._notifyDialog) {
			this._notifyDialog = new ZmApptNotifyDialog(this._shell);
			this._notifyDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._notifyDlgOkListener));
			this._notifyDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._notifyDlgCancelListener));
		}
		this._notifyDialog.initialize(appt, attId, this._addedAttendees, this._removedAttendees);
		this._notifyDialog.popup();
		return true;
	}

	return false;
};

// Spell check methods

ZmApptComposeController.prototype._spellCheckAgain = 
function() {
	this._apptView.getHtmlEditor().discardMisspelledWords();
	this._doSpellCheck();
	return false;
};


// Listeners

// Save button was pressed
ZmApptComposeController.prototype._saveListener =
function(ev) {
	if (this._doSave() === false)
		return;
	this._app.popView(true);
};

// Cancel button was pressed
ZmApptComposeController.prototype._cancelListener =
function(ev) {
	var controller = this._app.getCalController();
	controller.setNeedsRefresh(true);
	this._app.popView();
};

// Attachment button was pressed
ZmApptComposeController.prototype._attachmentListener =
function(ev) {
	this._apptView.addAttachmentField();
};

ZmApptComposeController.prototype._formatListener = 
function(ev, mode) {
	if (!mode && !(ev && ev.item.getChecked())) return;
	
	mode = mode || ev.item.getData(ZmHtmlEditor._VALUE);
	if (mode == this._apptView.getComposeMode()) return;
	
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
	var htmlEditor = this._apptView.getHtmlEditor();

	if (spellCheckButton.isToggled()) {
		var callback = new AjxCallback(this, this.toggleSpellCheckButton)
		if (!htmlEditor.spellCheck(callback))
			this.toggleSpellCheckButton(false);
	} else {
		htmlEditor.discardMisspelledWords();
	}
};

ZmApptComposeController.prototype._doSave =
function() {
	// check if all fields are populated w/ valid values
	try {
		if (this._apptView.isValid()) {
			return this.saveAppt();
		}
	} catch(ex) {
		if (AjxUtil.isString(ex)) {
			this._showErrorMessage(ex);
		} else {
			DBG.dumpObj(AjxDebug.DBG1, ex);
		}
		
		return false;
	}
};


// Callbacks

ZmApptComposeController.prototype._doSpellCheck =  
function() {
	var text = this._apptView.getHtmlEditor().getTextVersion();
	var soap = AjxSoapDoc.create("CheckSpellingRequest", "urn:zimbraMail");
	soap.getMethod().appendChild(soap.getDoc().createTextNode(text));
	var cmd = new ZmCsfeCommand();
	var callback = new AjxCallback(this, this._spellCheckCallback);
	cmd.invoke({soapDoc:soap, asyncMode:true, callback:callback});
};

ZmApptComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	if (this._doSave()) {
		this._app.popView(true);
		this._app.getAppViewMgr().showPendingView(true);
	}
};

ZmApptComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
	this._app.popView(true);
	this._app.getAppViewMgr().showPendingView(true);
	this._apptView.cleanup();
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
	if (formatBtn) {
		formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, DwtHtmlEditor.HTML, true);
	}
	this._apptView.reEnableDesignMode();
};

ZmApptComposeController.prototype._notifyDlgOkListener = 
function(ev) {
	var notifyList = this._notifyDialog.notifyNew() ? this._addedAttendees : null;
	this._saveApptFoRealz(this._notifyDialog.getAppt(), this._notifyDialog.getAttId(), notifyList);
	this._app.popView(true);
};

ZmApptComposeController.prototype._notifyDlgCancelListener =
function(ev) {
	this._addedAttendees.length = this._removedAttendees.length = 0;
};
