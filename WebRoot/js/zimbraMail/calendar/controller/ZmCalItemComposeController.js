
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		app			the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 * 
 * @extends		ZmBaseController
 */
ZmCalItemComposeController = function(container, app, type, sessionId) {
	if (arguments.length == 0) { return; }
	ZmBaseController.apply(this, arguments);
	this._elementsToHide = ZmAppViewMgr.LEFT_NAV;

	this._onAuthTokenWarningListener = this._onAuthTokenWarningListener.bind(this);
	appCtxt.addAuthTokenWarningListener(this._onAuthTokenWarningListener);
};

ZmCalItemComposeController.prototype = new ZmBaseController;
ZmCalItemComposeController.prototype.constructor = ZmCalItemComposeController;

ZmCalItemComposeController.prototype.isZmCalItemComposeController = true;
ZmCalItemComposeController.prototype.toString = function() { return "ZmCalItemComposeController"; };

ZmCalItemComposeController.DEFAULT_TAB_TEXT = ZmMsg.appointment;

ZmCalItemComposeController.SAVE_CLOSE 	= "SAVE_CLOSE";
ZmCalItemComposeController.SEND 		= "SEND";
ZmCalItemComposeController.SAVE  		= "SAVE";
ZmCalItemComposeController.APPT_MODE  	= "APPT";
ZmCalItemComposeController.MEETING_MODE	= "MEETING";

// Public methods

ZmCalItemComposeController.prototype.show =
function(calItem, mode, isDirty) {

    this._mode = mode;
	if (this._toolbar.toString() != "ZmButtonToolBar") {
		this._createToolBar();
	}
	var initial = this.initComposeView();
	this._app.pushView(this._currentViewId);
	this._composeView.set(calItem, mode, isDirty);
	this._composeView.reEnableDesignMode();
    this._initToolbar(mode);
	if (initial) {
		this._setComposeTabGroup();
	}
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


ZmCalItemComposeController.prototype._preShowCallback =
function() {
	return true;
};

ZmCalItemComposeController.prototype._postShowCallback =
function(view, force) {
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmCalItemComposeController.prototype._postHideCallback =
function() {
	// overload me
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

ZmCalItemComposeController.prototype._onAuthTokenWarningListener =
function() {
	// The auth token will expire in less than five minutes, so we must issue
	// issue a last, hard save. This method is typically called more than once.
	try {
		if (this._composeView && this._composeView.isDirty()) {
			// bypass most of the validity checking logic
			var calItem = this._composeView.getCalItem();
			return this._saveCalItemFoRealz(calItem, null, null, true);
		}
	} catch(ex) {
		var msg = AjxUtil.isString(ex) ?
			AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, errorMsg) :
			ZmMsg.errorSaving;

		appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_CRITICAL);
	}
};

/**
 * Gets the appt view.
 * 
 * @return	{ZmApptView}	the appt view
 */
ZmCalItemComposeController.prototype.getItemView = function() {
	return this._composeView;
};

/**
 * Gets the toolbar.
 *
 * @return	{ZmButtonToolBar}	the toolbar
 */
ZmCalItemComposeController.prototype.getToolbar =
function() {
	return this._toolbar;
};

/**
 * Saves the calendar item.
 * 
 * @param	{String}	attId		the item id
 */
ZmCalItemComposeController.prototype.saveCalItem =
function(attId) {
	// override
};

/**
 * Toggles the spell check button.
 * 
 * @param	{Boolean}	toggled		if <code>true</code>, select the spell check button 
 */
ZmCalItemComposeController.prototype.toggleSpellCheckButton =
function(toggled) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setSelected((toggled || false));
	}
};

ZmCalItemComposeController.prototype.initComposeView =
function(initHide) {
	if (!this._composeView) {
		this._composeView = this._createComposeView();
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW] = new AjxCallback(this, this._preShowCallback);
		callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);
		if (this._toolbar.toString() != "ZmButtonToolBar")
			this._createToolBar();
		var elements = this.getViewElements(null, this._composeView, this._toolbar);

		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								hide:		this._elementsToHide,
								controller:	this,
								callbacks:	callbacks,
								tabParams:	this._getTabParams()});
		if (initHide) {
			this._composeView.preload();
		}
		return true;
	}
	return false;
};

ZmCalItemComposeController.prototype._getTabParams =
function() {
	return {id:this.tabId, image:"CloseGray", hoverImage:"Close", text:ZmCalItemComposeController.DEFAULT_TAB_TEXT, textPrecedence:76,
			tooltip:ZmCalItemComposeController.DEFAULT_TAB_TEXT, style: DwtLabel.IMAGE_RIGHT};
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
	DBG.println(AjxDebug.KEYBOARD, "timed action restoring focus to " + focusItem + "; noFocus = " + noFocus);
	this._restoreFocus(focusItem, noFocus);
};

ZmCalItemComposeController.prototype.getKeyMapName =
function() {
	// override
};

ZmCalItemComposeController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG2, "ZmCalItemComposeController.handleKeyAction");
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
				var newMode = (mode == Dwt.TEXT) ? Dwt.HTML : Dwt.TEXT;
				this._formatListener(null, newMode);
				// reset the radio button for the format button menu
				var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
				if (formatBtn) {
					formatBtn.getMenu().checkItem(ZmHtmlEditor.VALUE, newMode, true);
				}
			}
			break;

		default:
			return ZmController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

ZmCalItemComposeController.prototype.mapSupported =
function(map) {
	return (map == "editor");
};

ZmCalItemComposeController.prototype.getTabView =
function() {
	return this._composeView;
};

/**
 * inits check mark for menu item depending on compose mode preference.
 * 
 * @private
 */
ZmCalItemComposeController.prototype.setFormatBtnItem =
function(skipNotify, composeMode) {
	var mode;
	if (composeMode) {
		mode = composeMode;
	} else {
		var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
		var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
		mode = (bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML)
			? Dwt.HTML : Dwt.TEXT;
	}

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (formatBtn) {
        var menu = formatBtn.getMenu ? formatBtn.getMenu() : null;
        if(menu) {
		    menu.checkItem(ZmHtmlEditor.VALUE, mode, skipNotify);
        }
	}
};

ZmCalItemComposeController.prototype.setOptionsBtnItem =
function(skipNotify, composeMode) {
	var mode;
	if (composeMode) {
		mode = composeMode;
	} else {
		var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
		var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
		mode = (bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML)
			? Dwt.HTML : Dwt.TEXT;
	}

	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (formatBtn) {
		formatBtn.getMenu().checkItem(ZmHtmlEditor.VALUE, mode, skipNotify);
	}
};

// Private / Protected methods


ZmCalItemComposeController.prototype._initToolbar =
function(mode) {
	if (this._toolbar.toString() != "ZmButtonToolBar") {
		this._createToolBar();
	}

    this.enableToolbar(true);

	var isNew = (mode == null || mode == ZmCalItem.MODE_NEW || mode == ZmCalItem.MODE_NEW_FROM_QUICKADD);

	var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
	if (isNew) {
		cancelButton.setText(ZmMsg.cancel);
	} else {
		cancelButton.setText(ZmMsg.close);
	}

    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    //use send button for forward appt view
    if(ZmCalItem.FORWARD_MAPPING[mode]) {
        saveButton.setText(ZmMsg.send);
    }

	var printButton = this._toolbar.getButton(ZmOperation.PRINT);
	if (printButton) {
		printButton.setEnabled(!isNew);
	}

	appCtxt.notifyZimlets("initializeToolbar", [this._app, this._toolbar, this, this._currentViewId], {waitUntilLoaded:true});
};


ZmCalItemComposeController.prototype._createToolBar =
function() {

	var buttons = [ZmOperation.SEND_INVITE, ZmOperation.SAVE, ZmOperation.CANCEL, ZmOperation.SEP];

	if (appCtxt.get(ZmSetting.ATTACHMENT_ENABLED)) {
		buttons.push(ZmOperation.ATTACHMENT);
	}

    if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		buttons.push(ZmOperation.PRINT);
	}

	if (appCtxt.isSpellCheckerAvailable()) {
		buttons.push(ZmOperation.SPELL_CHECK);
	}
	buttons.push(ZmOperation.SEP, ZmOperation.COMPOSE_OPTIONS);

	this._toolbar = new ZmButtonToolBar({
		parent:     this._container,
		buttons:    buttons,
		overrides:  this._getButtonOverrides(buttons),
		context:    this._currentViewId,
		controller: this
	});
	this._toolbar.addSelectionListener(ZmOperation.SAVE, new AjxListener(this, this._saveListener));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, new AjxListener(this, this._cancelListener));

	if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		this._toolbar.addSelectionListener(ZmOperation.PRINT, new AjxListener(this, this._printListener));
	}

	if (appCtxt.get(ZmSetting.ATTACHMENT_ENABLED)) {
		this._toolbar.addSelectionListener(ZmOperation.ATTACHMENT, new AjxListener(this, this._attachmentListener));
	}

    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);
    sendButton.setVisible(false);

	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

	var optionsButton = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (optionsButton) {
		optionsButton.setVisible(false); //start it hidden, and show in case it's needed.
	}

	if (optionsButton && appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		optionsButton.setVisible(true); 

		var m = new DwtMenu({parent:optionsButton});
		optionsButton.setMenu(m);

		var mi = new DwtMenuItem({parent:m, style:DwtMenuItem.RADIO_STYLE, id:[ZmId.WIDGET_MENU_ITEM,this._currentViewId,ZmOperation.FORMAT_HTML].join("_")});
		mi.setImage("HtmlDoc");
		mi.setText(ZmMsg.formatAsHtml);
		mi.setData(ZmHtmlEditor.VALUE, Dwt.HTML);
        mi.addSelectionListener(new AjxListener(this, this._formatListener));

		mi = new DwtMenuItem({parent:m, style:DwtMenuItem.RADIO_STYLE, id:[ZmId.WIDGET_MENU_ITEM,this._currentViewId,ZmOperation.FORMAT_TEXT].join("_")});
		mi.setImage("GenericDoc");
		mi.setText(ZmMsg.formatAsText);
		mi.setData(ZmHtmlEditor.VALUE, Dwt.TEXT);
        mi.addSelectionListener(new AjxListener(this, this._formatListener));
	}

	this._toolbar.addSelectionListener(ZmOperation.SPELL_CHECK, new AjxListener(this, this._spellCheckListener));
};

ZmCalItemComposeController.prototype.showErrorMessage =
function(errorMsg) {
	var dialog = appCtxt.getMsgDialog();
    dialog.reset();
	//var msg = ZmMsg.errorSaving + (errorMsg ? (":<p>" + errorMsg) : ".");
	var msg = errorMsg ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, errorMsg) : ZmMsg.errorSaving;
	dialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	dialog.popup();
    this.enableToolbar(true);
};

ZmCalItemComposeController.prototype._saveCalItemFoRealz = function(calItem, attId, notifyList, force) {

    var recurringChanges = this._composeView.areRecurringChangesDirty();

	if (this._composeView.isDirty() || recurringChanges || force) {
		// bug: 16112 - check for folder existance
		if (calItem.getFolder() && calItem.getFolder().noSuchFolder) {
			var msg = AjxMessageFormat.format(ZmMsg.errorInvalidFolder, calItem.getFolder().name);
			this.showErrorMessage(msg);
			return false;
		}
        if(this._composeView.isReminderOnlyChanged()) {
            calItem.setMailNotificationOption(false);
        }
        var callback = new AjxCallback(this, this._handleResponseSave, calItem);
		var errorCallback = new AjxCallback(this, this._handleErrorSave, calItem);
        this._doSaveCalItem(calItem, attId, callback, errorCallback, notifyList);
	} else {
        if (this._action == ZmCalItemComposeController.SAVE && !this._composeView.isDirty()) {
            this.enableToolbar(true);
        }
        
        if (this.isCloseAction()){
            this._composeView.cleanup();  // bug: 27600 clean up edit view to avoid stagnant attendees
            this.closeView();
        }
	}
};

ZmCalItemComposeController.prototype._doSaveCalItem =
function(calItem, attId, callback, errorCallback, notifyList){
    if(this._action == ZmCalItemComposeController.SEND)
        calItem.send(attId, callback, errorCallback, notifyList);
    else
        calItem.save(attId, callback, errorCallback, notifyList);
};

ZmCalItemComposeController.prototype.isCloseAction =
function() {
    return ( this._action == ZmCalItemComposeController.SEND ||  this._action == ZmCalItemComposeController.SAVE_CLOSE );
};

ZmCalItemComposeController.prototype._handleResponseSave =
function(calItem, result) {
    try {
        if (calItem.__newFolderId) {
            var folder = appCtxt.getById(calItem.__newFolderId);
            calItem.__newFolderId = null;
            this._app.getListController()._doMove(calItem, folder, null, false);
        }

        calItem.handlePostSaveCallbacks();
        if(this.isCloseAction()) {
        	this.closeView();
        }
        appCtxt.notifyZimlets("onSaveApptSuccess", [this, calItem, result]);//notify Zimlets on success
    } catch (ex) {
        DBG.println(ex);
    } finally {
        this._composeView.cleanup();
    }
};

ZmCalItemComposeController.prototype._handleErrorSave =
function(calItem, ex) {
	var status = this._getErrorSaveStatus(calItem, ex);
	return status.handled;
};

ZmCalItemComposeController.prototype._getErrorSaveStatus =
function(calItem, ex) {
	// TODO: generalize error message for calItem instead of just Appt
	var status = calItem.processErrorSave(ex);
	status.handled = false;

    if (status.continueSave) {
        this.saveCalItemContinue(calItem);
        status.handled = true;
    } else {
        // Enable toolbar if not attempting to continue the Save
        this.enableToolbar(true);
        if (status.errorMessage) {
            // Handled the error, display the error message
            status.handled = true;
            var dialog = appCtxt.getMsgDialog();
            dialog.setMessage(status.errorMessage, DwtMessageDialog.CRITICAL_STYLE);
            dialog.popup();
        }
        appCtxt.notifyZimlets("onSaveApptFailure", [this, calItem, ex]);
    }

    return status;
};

// Spell check methods

ZmCalItemComposeController.prototype._spellCheckAgain =
function() {
	this._composeView.getHtmlEditor().discardMisspelledWords();
	this._doSpellCheck();
	return false;
};

ZmCalItemComposeController.prototype.enableToolbar =
function(enabled) {
    this._toolbar.enableAll(enabled);
};

// Listeners

// Save button was pressed
ZmCalItemComposeController.prototype._saveListener =
function(ev) {
    this._action = ZmCalItemComposeController.SAVE;
    this.enableToolbar(false);
	if (this._doSave() === false) {
		return;
    }
};

// Cancel button was pressed
ZmCalItemComposeController.prototype._cancelListener =
function(ev) {
	this._action = ZmCalItemComposeController.SAVE_CLOSE;
	this._app.popView();
};

ZmCalItemComposeController.prototype._printListener =
function() {
	// overload me.
};

// Attachment button was pressed
ZmCalItemComposeController.prototype._attachmentListener =
function(ev) {
	this._composeView.addAttachmentField();
};

ZmCalItemComposeController.prototype._formatListener =
function(ev, mode) {
	if (!mode && !(ev && ev.item.getChecked())) return;

	mode = mode || ev.item.getData(ZmHtmlEditor.VALUE);
	if (mode == this._composeView.getComposeMode()) return;

	if (mode == Dwt.TEXT) {
		// if formatting from html to text, confirm w/ user!
		if (!this._textModeOkCancel) {
			var dlgId = this._composeView.getHTMLElId() + "_formatWarning";
			this._textModeOkCancel = new DwtMessageDialog({id: dlgId, parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
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
			this.showErrorMessage(ex);
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
	this._action = ZmCalItemComposeController.SAVE_CLOSE;
	if (this._doSave()) {
		appCtxt.getAppViewMgr().showPendingView(true);
	}
};

ZmCalItemComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.popdown();
    this.enableToolbar(true);
	try {
		// bug fix #33001 - prism throws exception with this method:
		appCtxt.getAppViewMgr().showPendingView(true);
	} catch(ex) {
		// so do nothing
	} finally {
		// but make sure cleanup is *always* called
		this._composeView.cleanup();
	}
};

ZmCalItemComposeController.prototype._closeView =
function() {
	this._app.popView(true,this._currentViewId);
    this._composeView.cleanup();
};

ZmCalItemComposeController.prototype._textModeOkCallback =
function(ev) {
	this._textModeOkCancel.popdown();
	this._composeView.setComposeMode(Dwt.TEXT);
};

ZmCalItemComposeController.prototype._textModeCancelCallback =
function(ev) {
	this._textModeOkCancel.popdown();
	// reset the radio button for the format button menu
	var formatBtn = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (formatBtn) {
		formatBtn.getMenu().checkItem(ZmHtmlEditor.VALUE, Dwt.HTML, true);
	}
	this._composeView.reEnableDesignMode();
};
