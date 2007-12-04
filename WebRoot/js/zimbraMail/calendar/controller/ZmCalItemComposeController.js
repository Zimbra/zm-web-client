/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
 * @param container	[DwtComposite]	the containing element
 * @param calApp	[ZmApp]			a handle to the [calendar|task] application
 */
ZmCalItemComposeController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmController.call(this, container, app);
};

ZmCalItemComposeController.prototype = new ZmController;
ZmCalItemComposeController.prototype.constructor = ZmCalItemComposeController;

ZmCalItemComposeController.prototype.toString =
function() {
	return "ZmCalItemComposeController";
};

// Public methods

ZmCalItemComposeController.prototype.show =
function(calItem, mode, isDirty) {

	this._initToolbar(mode);
	var initial = this.initComposeView();
	this._setFormatBtnItem(true);

	this._app.pushView(this._getViewType());
	this._composeView.set(calItem, mode, isDirty);
	this._composeView.reEnableDesignMode();
	this._composeView.applyCaretHack();

	if (initial)
		this._setComposeTabGroup();
};

ZmCalItemComposeController.prototype._preHideCallback =
function(view, force) {
	ZmController.prototype._preHideCallback.call(this);
	return force ? true : this.popShield();
};

ZmCalItemComposeController.prototype._preUnloadCallback =
function(view) {
	return !this._composeView.isDirty();
};

ZmCalItemComposeController.prototype._postShowCallback =
function(view, force) {
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmCalItemComposeController.prototype.popShield =
function() {
	if (!this._composeView.isDirty()) {
		this._composeView.cleanup();
		return true;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askToSave, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	ps.popup(this._composeView._getDialogXY());

	return false;
};

ZmCalItemComposeController.prototype.getToolbar =
function() {
	return this._toolbar;
};

ZmCalItemComposeController.prototype.saveCalItem =
function(attId) {
	// override
};

ZmCalItemComposeController.prototype.toggleSpellCheckButton =
function(toggled) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setSelected((toggled || false));
};

ZmCalItemComposeController.prototype.initComposeView =
function(initHide) {
	if (!this._composeView) {
		this._composeView = this._createComposeView();
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		var elements = {};
		if (!this._toolbar)
			this._createToolBar();
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._composeView;
	    this._app.createView(this._getViewType(), elements, callbacks, false, true);
	    if (initHide) {
	    	this._composeView.preload();
	    }
		return true;
	}
	return false;
};

ZmCalItemComposeController.prototype._createComposeView =
function() {
	// override
};

ZmCalItemComposeController.prototype._setComposeTabGroup =
function(setFocus) {
	// override
};

ZmCalItemComposeController.prototype._setFocus =
function(focusItem, noFocus) {
	DBG.println("kbnav", "timed action restoring focus to " + focusItem + "; noFocus = " + noFocus);
	this._restoreFocus(focusItem, noFocus);
};

ZmCalItemComposeController.prototype.getKeyMapName =
function() {
	// override
};

ZmCalItemComposeController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println("ZmCalItemComposeController.handleKeyAction");
	switch (actionCode) {
		case ZmKeyMap.SAVE:
			this._saveListener();
			break;

		case ZmKeyMap.CANCEL:
			this._cancelListener();
			break;


		case ZmKeyMap.HTML_FORMAT:
			if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
				var mode = this._composeView.getComposeMode();
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

ZmCalItemComposeController.prototype.getTabView =
function() {
	return this._composeView;
};

// Private / Protected methods


ZmCalItemComposeController.prototype._getViewType =
function() {
	// override
};

ZmCalItemComposeController.prototype._initToolbar =
function(mode) {
	if (!this._toolbar)
		this._createToolBar();

	var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
	if (mode == null || mode == ZmCalItem.MODE_NEW || mode == ZmCalItem.MODE_NEW_FROM_QUICKADD) {
		cancelButton.setText(ZmMsg.cancel);
		cancelButton.setImage("Cancel");
	} else {
		cancelButton.setText(ZmMsg.close);
		cancelButton.setImage("Close");
	}
};

ZmCalItemComposeController.prototype._createToolBar =
function() {
	
	var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL,ZmOperation.SEP];
	
	if(appCtxt.get(ZmSetting.ATTACHMENT_ENABLED))
		buttons.push(ZmOperation.ATTACHMENT);
	
	buttons.push( ZmOperation.SEP, ZmOperation.SPELL_CHECK,ZmOperation.SEP, ZmOperation.COMPOSE_FORMAT);
	
	
	/*var buttons = [ZmOperation.SAVE, ZmOperation.CANCEL,
				   ZmOperation.SEP, ZmOperation.ATTACHMENT,
				   ZmOperation.SEP, ZmOperation.SPELL_CHECK,
				   ZmOperation.SEP, ZmOperation.COMPOSE_FORMAT];*/

	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons});
	this._toolbar.addSelectionListener(ZmOperation.SAVE, new AjxListener(this, this._saveListener));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, new AjxListener(this, this._cancelListener));
	if(appCtxt.get(ZmSetting.ATTACHMENT_ENABLED))
		this._toolbar.addSelectionListener(ZmOperation.ATTACHMENT, new AjxListener(this, this._attachmentListener));

	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	if (AjxEnv.is800x600orLower) {
		spellCheckButton.setText("");
	}

	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
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
ZmCalItemComposeController.prototype._setFormatBtnItem =
function(skipNotify) {
	// based on preference, set the compose mode
	var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	var composeMode = (bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML)
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	if (formatBtn)
		formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, composeMode, skipNotify);
};

ZmCalItemComposeController.prototype._showErrorMessage =
function(errorMsg) {
	var dialog = appCtxt.getMsgDialog();
	var msg = ZmMsg.errorSaving + (errorMsg ? (":<p>" + errorMsg) : ".");
	dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
};

ZmCalItemComposeController.prototype._saveCalItemFoRealz =
function(calItem, attId, notifyList) {
	if (this._composeView.isDirty()) {
		var callback = new AjxCallback(this, this._handleResponseSave, calItem);
		var errorCallback = new AjxCallback(this, this._handleErrorSave);
		calItem.save(attId, callback, errorCallback, notifyList);
	}
};

ZmCalItemComposeController.prototype._handleResponseSave =
function(calItem) {
	this._composeView.cleanup();
};

ZmCalItemComposeController.prototype._handleErrorSave =
function(ex) {
	// TODO: generalize error message for calItem instead of just Appt
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
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		return true;
	} else {
		return false;
	}
};

// Spell check methods

ZmCalItemComposeController.prototype._spellCheckAgain =
function() {
	this._composeView.getHtmlEditor().discardMisspelledWords();
	this._doSpellCheck();
	return false;
};


// Listeners

// Save button was pressed
ZmCalItemComposeController.prototype._saveListener =
function(ev) {
	if (this._doSave() === false)
		return;
	this._app.popView(true);
};

// Cancel button was pressed
ZmCalItemComposeController.prototype._cancelListener =
function(ev) {
	this._app.popView();
};

// Attachment button was pressed
ZmCalItemComposeController.prototype._attachmentListener =
function(ev) {
	this._composeView.addAttachmentField();
};

ZmCalItemComposeController.prototype._formatListener =
function(ev, mode) {
	if (!mode && !(ev && ev.item.getChecked())) return;

	mode = mode || ev.item.getData(ZmHtmlEditor._VALUE);
	if (mode == this._composeView.getComposeMode()) return;

	if (mode == DwtHtmlEditor.TEXT) {
		// if formatting from html to text, confirm w/ user!
		if (!this._textModeOkCancel) {
			this._textModeOkCancel = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
			this._textModeOkCancel.setMessage(ZmMsg.switchToText, DwtMessageDialog.WARNING_STYLE);
			this._textModeOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._textModeOkCallback, this);
			this._textModeOkCancel.registerCallback(DwtDialog.CANCEL_BUTTON, this._textModeCancelCallback, this);
		}
		this._textModeOkCancel.popup(this._composeView._getDialogXY());
	} else {
		this._composeView.setComposeMode(mode);
	}
};

ZmCalItemComposeController.prototype._spellCheckListener =
function(ev) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	var htmlEditor = this._composeView.getHtmlEditor();

	if (spellCheckButton.isToggled()) {
		var callback = new AjxCallback(this, this.toggleSpellCheckButton)
		if (!htmlEditor.spellCheck(callback))
			this.toggleSpellCheckButton(false);
	} else {
		htmlEditor.discardMisspelledWords();
	}
};

ZmCalItemComposeController.prototype._doSave =
function() {
	// check if all fields are populated w/ valid values
	try {
		if (this._composeView.isValid()) {
			return this.saveCalItem();
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

ZmCalItemComposeController.prototype._doSpellCheck =
function() {
	var text = this._composeView.getHtmlEditor().getTextVersion();
	var soap = AjxSoapDoc.create("CheckSpellingRequest", "urn:zimbraMail");
	soap.getMethod().appendChild(soap.getDoc().createTextNode(text));
	var cmd = new ZmCsfeCommand();
	var callback = new AjxCallback(this, this._spellCheckCallback);
	cmd.invoke({soapDoc:soap, asyncMode:true, callback:callback});
};

ZmCalItemComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.popdown();
	if (this._doSave()) {
		appCtxt.getAppViewMgr().showPendingView(true);
	}
};

ZmCalItemComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
    this._closeView();
};

ZmCalItemComposeController.prototype._closeView =
function() {
	this._app.popView(true);
	appCtxt.getAppViewMgr().showPendingView(true);
	this._composeView.cleanup();
};

ZmCalItemComposeController.prototype._textModeOkCallback =
function(ev) {
	this._textModeOkCancel.popdown();
	this._composeView.setComposeMode(DwtHtmlEditor.TEXT);
};

ZmCalItemComposeController.prototype._textModeCancelCallback =
function(ev) {
	this._textModeOkCancel.popdown();
	// reset the radio button for the format button menu
	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_FORMAT);
	if (formatBtn) {
		formatBtn.getMenu().checkItem(ZmHtmlEditor._VALUE, DwtHtmlEditor.HTML, true);
	}
	this._composeView.reEnableDesignMode();
};
