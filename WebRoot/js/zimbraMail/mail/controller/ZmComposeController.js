/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new compose controller to manage message composition.
 * @constructor
 * @class
 * This class manages message composition.
 *
 * @author Conrad Damon
 * 
 * @param {ZmComposite}	container	the containing shell
 * @param {ZmMailApp}	mailApp			the containing app
 * 
 * @extends		ZmController
 */
ZmComposeController = function(container, mailApp) {

	ZmController.call(this, container, mailApp);

	this._action = null;

	ZmComposeController._setStatics();

	this._listeners = {};
	this._listeners[ZmOperation.SEND] = new AjxListener(this, this._sendListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);
	this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._attachmentListener);
	this._listeners[ZmOperation.DETACH_COMPOSE] = new AjxListener(this, this._detachListener);
	this._listeners[ZmOperation.SAVE_DRAFT] = new AjxListener(this, this._saveDraftListener);
	this._listeners[ZmOperation.SPELL_CHECK] = new AjxListener(this, this._spellCheckListener);
	this._listeners[ZmOperation.COMPOSE_OPTIONS] = new AjxListener(this, this._optionsListener);

	this._dialogPopdownListener = new AjxListener(this, this._dialogPopdownActionListener);

	var settings = appCtxt.getSettings();
	var scl = this._settingChangeListener = new AjxListener(this, this._settingChangeListener);
	for (var i = 0; i < ZmComposeController.SETTINGS.length; i++) {
		settings.getSetting(ZmComposeController.SETTINGS[i]).addChangeListener(scl);
	}

	this._autoSaveTimer = null;
	this._draftType = ZmComposeController.DRAFT_TYPE_NONE;
};

ZmComposeController.prototype = new ZmController();
ZmComposeController.prototype.constructor = ZmComposeController;

ZmComposeController.prototype.toString =
function() {
	return "ZmComposeController";
};

//
// Constants
//

ZmComposeController.SIGNATURE_KEY = "sigKeyId";

// Constants for defining the reason for saving a draft message.
/**
 * Defines the "none" draft type reason.
 */
ZmComposeController.DRAFT_TYPE_NONE		= "none";
/**
 * Defines the "manual" draft type reason.
 */
ZmComposeController.DRAFT_TYPE_MANUAL	= "manual";
/**
 * Defines the "auto" draft type reason.
 */
ZmComposeController.DRAFT_TYPE_AUTO		= "auto";

ZmComposeController.DEFAULT_TAB_TEXT = ZmMsg.compose;

ZmComposeController._setStatics =
function() {

	if (ZmComposeController.SETTINGS) { return; }

	// settings whose changes affect us (so we add a listener to them)
	ZmComposeController.SETTINGS = [ZmSetting.SHOW_BCC];

	// radio groups for options items
	ZmComposeController.RADIO_GROUP = {};
	ZmComposeController.RADIO_GROUP[ZmOperation.REPLY]				= 1;
	ZmComposeController.RADIO_GROUP[ZmOperation.REPLY_ALL]			= 1;
	ZmComposeController.RADIO_GROUP[ZmOperation.FORMAT_HTML]		= 2;
	ZmComposeController.RADIO_GROUP[ZmOperation.FORMAT_TEXT]		= 2;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_ATTACHMENT]		= 3;
    ZmComposeController.RADIO_GROUP[ZmOperation.INC_BODY]	    	= 3;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_NONE]			= 3;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_SMART]			= 3;

	// translate between include settings and operations
	ZmComposeController.INC_OP = {};
	ZmComposeController.INC_OP[ZmSetting.INC_ATTACH]		= ZmOperation.INC_ATTACHMENT;
	ZmComposeController.INC_OP[ZmSetting.INC_BODY]			= ZmOperation.INC_BODY;
	ZmComposeController.INC_OP[ZmSetting.INC_NONE]			= ZmOperation.INC_NONE;
	ZmComposeController.INC_OP[ZmSetting.INC_SMART]			= ZmOperation.INC_SMART;
	ZmComposeController.INC_MAP = {};
	for (var i in ZmComposeController.INC_OP) {
		ZmComposeController.INC_MAP[ZmComposeController.INC_OP[i]] = i;
	}

	ZmComposeController.OPTIONS_TT = {};
	ZmComposeController.OPTIONS_TT[ZmOperation.NEW_MESSAGE]		= "composeOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.REPLY]			= "replyOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.REPLY_ALL]		= "replyOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.FORWARD_ATT]		= "forwardOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.FORWARD_INLINE]	= "forwardOptions";

	ZmComposeController.OP_CHECK = {};
	ZmComposeController.OP_CHECK[ZmOperation.REQUEST_READ_RECEIPT] 	= true;
	ZmComposeController.OP_CHECK[ZmOperation.USE_PREFIX] 			= true;
	ZmComposeController.OP_CHECK[ZmOperation.INCLUDE_HEADERS] 		= true;
};

//
// Public methods
//

/**
* Called by ZmNewWindow.unload to remove ZmSettings listeners (which reside in
* the parent window). Otherwise, after the child window is closed, the parent
* window is still referencing the child window's compose controller, which has
* been unloaded!!
* 
* @private
*/
ZmComposeController.prototype.dispose =
function() {
	var settings = appCtxt.getSettings();
	for (var i = 0; i < ZmComposeController.SETTINGS.length; i++) {
		settings.getSetting(ZmComposeController.SETTINGS[i]).removeChangeListener(this._settingChangeListener);
	}
	this._composeView._dispose();
};

/**
 * Begins a compose session by presenting a form to the user.
 *
 * @param	{Hash}	params		a hash of parameters
 * @param {constant}	params.action		the new message, reply, forward, or an invite action
 * @param {Boolean}	params.inNewWindow		if <code>true</code>, we are in detached window
 * @param {ZmMailMsg}	params.msg			the original message (reply/forward), or address (new message)
 * @param {String}	params.toOverride 	the initial value for To: field
 * @param {String}	params.subjOverride 	the initial value for Subject: field
 * @param {String}	params.extraBodyText the canned text to prepend to body (invites)
 * @param {AjxCallback}	params.callback		the callback to run after view has been set
 * @param {String}	params.accountName	the on-behalf-of From address
 * @param {String}	accountName	[string]*		on-behalf-of From address
 */
ZmComposeController.prototype.doAction =
function(params) {

	// is zdesktop, its possible there are no accounts that support smtp
	var ac = window.parentAppCtxt || window.appCtxt;
	if (ac.isOffline && !ac.get(ZmSetting.OFFLINE_COMPOSE_ENABLED)) {
		var d = ac.getMsgDialog();
		d.setMessage(ZmMsg.composeDisabled, DwtMessageDialog.CRITICAL_STYLE);
		d.popup();
		return;
	}

	this._msgSent = false;
	if (params.inNewWindow) {
		var newWinObj = ac.getNewWindow();

		// this is how child window knows what to do once loading:
		newWinObj.command = "compose";
		newWinObj.params = params;
	} else {
		this._setView(params);
		this._listController = params.listController;
	}
};

/**
 * Toggles the spell check button.
 * 
 * @param	{Boolean}	selected		if <code>true</code>, toggle the spell check to "selected"
 * 
 */
ZmComposeController.prototype.toggleSpellCheckButton =
function(selected) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setSelected((selected || false));
	}
};

/**
 * Detaches compose view to child window.
 * 
 */
ZmComposeController.prototype.detach =
function() {
	// bug fix #7192 - disable detach toolbar button
	this._toolbar.enable(ZmOperation.DETACH_COMPOSE, false);

	var msg = this._composeView._msg;
	var addrs = this._composeView.getRawAddrFields();
	var subj = this._composeView._subjectField.value;
	var forAttHtml = this._composeView._attcDiv.innerHTML;
	var body = this._getBodyContent();
	var composeMode = this._composeView.getComposeMode();
	var backupForm = this._composeView.backupForm;
	var sendUID = this._composeView.sendUID;
	var action = this._composeView._action || this._action;
	var identity = this._composeView.getIdentity();

	// this is how child window knows what to do once loading:
	var newWinObj = appCtxt.getNewWindow();
	newWinObj.command = "composeDetach";
	newWinObj.params = {
		action: action,
		msg: msg,
		addrs: addrs,
		subj: subj,
		forwardHtml: forAttHtml,
		body: body,
		composeMode: composeMode,
		identityId: (identity ? identity.id : null),
		accountName: this._accountName,
		backupForm: backupForm,
		sendUID: sendUID,
		msgIds: this._msgIds,
		forAttIds: this._forAttIds,
		sessionId: this.sessionId
	};
};

ZmComposeController.prototype.popShield =
function() {
	var dirty = this._composeView.isDirty();
	if (!dirty && (this._draftType != ZmComposeController.DRAFT_TYPE_AUTO)) {
		return true;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	if (this._draftType == ZmComposeController.DRAFT_TYPE_AUTO) {
		// Messsage has been saved, but never explicitly by the user.
		// Ask if he wants to keep the autosaved draft.
		ps.reset();
		ps.setMessage(ZmMsg.askSaveAutosavedDraft, DwtMessageDialog.WARNING_STYLE);
		if (dirty) {
			ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		} else {
			ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldNoCallback, this);
		}
		ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldDiscardCallback, this);
		ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
	} else if (this._canSaveDraft()) {
		ps.reset();
		ps.setMessage(ZmMsg.askSaveDraft, DwtMessageDialog.WARNING_STYLE);
		ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
	} else {
		ps = this._popShield = appCtxt.getYesNoMsgDialog();
		ps.setMessage(ZmMsg.askLeaveCompose, DwtMessageDialog.WARNING_STYLE);
		ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldDismissCallback, this);
	}
	ps.addPopdownListener(this._dialogPopdownListener);
	ps.popup(this._composeView._getDialogXY());

	return false;
};

// We don't call ZmController._preHideCallback here because it saves the current
// focus member, and we want to start over each time
ZmComposeController.prototype._preHideCallback =
function(view, force) {
	if (force && this._autoSaveTimer) {
		this._autoSaveTimer.kill();

		// auto-save if we leave this compose tab and the message has not yet been sent
		if (!this._msgSent) {
			this._autoSaveCallback(true);
		}
	}
	return force ? true : this.popShield();
};

ZmComposeController.prototype._preUnloadCallback =
function(view) {
	return !this._composeView.isDirty();
};

ZmComposeController.prototype._postShowCallback =
function() {
	// always reset auto save every time this view is shown. This covers the
	// case where a compose tab is inactive and becomes active when user clicks
	// on compose tab.
	this._initAutoSave();

	if (!appCtxt.isChildWindow) {
		// no need to "restore" focus between windows
		ZmController.prototype._postShowCallback.call(this);
	}
	var composeMode = this._composeView.getComposeMode();
	if (this._action != ZmOperation.NEW_MESSAGE &&
		this._action != ZmOperation.FORWARD_INLINE &&
		this._action != ZmOperation.FORWARD_ATT)
	{
		if (composeMode == DwtHtmlEditor.HTML) {
			var ta = new AjxTimedAction(this._composeView, this._composeView._focusHtmlEditor);
			AjxTimedAction.scheduleAction(ta, 10);
		}
		this._composeView._setBodyFieldCursor();
	}
};

ZmComposeController.prototype._postHideCallback =
function() {
	// hack to kill the child window when replying to an invite
	if (appCtxt.isChildWindow &&
		(this._action == ZmOperation.REPLY_ACCEPT ||
		this._action == ZmOperation.REPLY_DECLINE ||
		this._action == ZmOperation.REPLY_TENTATIVE))
	{
		window.close();
	}
};

/**
 * This method gets called if user clicks on mailto link while compose view is
 * already being used.
 * 
 * @private
 */
ZmComposeController.prototype.resetComposeForMailto =
function(params) {
	if (this._popShield && this._popShield.isPoppedUp()) {
		return false;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.askSaveDraft, DwtMessageDialog.WARNING_STYLE);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this, params);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this, params);
	ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
	ps.addPopdownListener(this._dialogPopdownListener);
	ps.popup(this._composeView._getDialogXY());

	return true;
};

/**
 * Sends the message represented by the content of the compose view.
 * 
 * @param	{String}	attId		the id
 * @param	{constant}	draftType		the draft type (see <code>ZmComposeController.DRAFT_TYPE_</code> constants)
 * @param	{AjxCallback}	callback		the callback
 */
ZmComposeController.prototype.sendMsg =
function(attId, draftType, callback) {
	return this._sendMsg(attId, null, draftType, callback);
};

/**
 * Sends the message represented by the content of the compose view with specified docIds as attachment.
 * 
 * @param	{Array}	docIds		the document Ids
 * @param	{constant}	draftType		the draft type (see <code>ZmComposeController.DRAFT_TYPE_</code> constants)
 * @param	{AjxCallback}	callback		the callback
 */
ZmComposeController.prototype.sendDocs =
function(docIds, draftType, callback) {
	return this._sendMsg(null, docIds, draftType, callback);
};

/**
 * Sends the message represented by the content of the compose view.
 * 
 * @private
 */
ZmComposeController.prototype._sendMsg =
function(attId, docIds, draftType, callback) {

	draftType = draftType || ZmComposeController.DRAFT_TYPE_NONE;
	var isDraft = draftType != ZmComposeController.DRAFT_TYPE_NONE;

	// bug fix #38408 - briefcase attachments need to be set *before* calling
	// getMsg() but we cannot do that without having a ZmMailMsg to store it in.
	// File this one under WTF.
	var tempMsg;
	if (docIds) {
		tempMsg = new ZmMailMsg();
		this._composeView.setDocAttachments(tempMsg, docIds);
	}
	var msg = this._composeView.getMsg(attId, isDraft, tempMsg);

	if (!msg) { return; }

	var origMsg = msg._origMsg;
	var isCancel = (msg.inviteMode == ZmOperation.REPLY_CANCEL);
	var isModify = (msg.inviteMode == ZmOperation.REPLY_MODIFY);

	if (isCancel || isModify) {
		var appt = origMsg._appt;
		var respCallback = new AjxCallback(this, this._handleResponseCancelOrModifyAppt);
		if (isCancel) {
			appt.cancel(origMsg._mode, msg, respCallback);
		} else {
			appt.save();
		}
		return;
	}

	var ac = window.parentAppCtxt || window.appCtxt;
	var acctName = appCtxt.multiAccounts
		? this._composeView.getFromAccount().name : this._accountName;

	if (isDraft) {
		if (appCtxt.multiAccounts) {
			// for offline, save drafts based on account owner of From: dropdown
			acctName = ac.accountList.getAccount(msg.fromSelectValue.accountId).name;
		} else {
			acctName = ac.getActiveAccount().name;
		}
	} else {
		// if shared folder, make sure we send the email on-behalf-of
		var folder = msg.folderId ? ac.getById(msg.folderId) : null;
		if (folder && folder.isRemote() && this._composeView.sendMsgOboIsOK()) {
			acctName = folder.getOwner();            
		}
	}

	if (origMsg) {
		origMsg.sendAsMe = !this._composeView.sendMsgOboIsOK();
	}

	// If this message had been saved from draft and it has a sender (meaning
	// it's a reply from someone else's account) then get the account name from
	// the from field.
	if (!acctName && !isDraft && origMsg && origMsg.isDraft) {
		if (this._composeView.sendMsgOboIsOK()) {
			if (origMsg._addrs[ZmMailMsg.HDR_FROM] &&
				origMsg._addrs[ZmMailMsg.HDR_SENDER] &&
				origMsg._addrs[ZmMailMsg.HDR_SENDER].size())
			{
				acctName = origMsg._addrs[ZmMailMsg.HDR_FROM].get(0).address;
			}
		} else {
			origMsg.sendAsMe = true; // hack.
		}
	}

	// check for read receipt
	var requestReadReceipt = false;
	if (appCtxt.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED)) {
		var menu = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS).getMenu();
		var mi = menu.getItemById(ZmOperation.KEY_ID, ZmOperation.REQUEST_READ_RECEIPT);
		requestReadReceipt = (!!(mi && mi.getChecked()));
	}

	var respCallback = new AjxCallback(this, this._handleResponseSendMsg, [draftType, msg, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorSendMsg);
	var resp = msg.send(isDraft, respCallback, errorCallback, acctName, null, requestReadReceipt);

	// XXX: temp bug fix #4325 - if resp returned, we're processing sync
	//      request REVERT this bug fix once mozilla fixes bug #295422!
	if (resp) {
		this._processSendMsg(draftType, msg, resp);
		if (callback) callback.run(resp);
	}
};

ZmComposeController.prototype._handleResponseSendMsg =
function(draftType, msg, callback, result) {
	var resp = result.getResponse();
	this._processSendMsg(draftType, msg, resp);

	if (callback) {
		callback.run(result);
	}
};

ZmComposeController.prototype._handleResponseCancelOrModifyAppt =
function() {
	this._composeView.reset(false);
	this._app.popView(true);
};

ZmComposeController.prototype._handleErrorSendMsg =
function(ex) {
	this.resetToolbarOperations();
	this._composeView.enableInputs(true);

	if (!(ex && ex.code)) { return false; }

	var msg = null;
	if (ex.code == ZmCsfeException.MAIL_SEND_ABORTED_ADDRESS_FAILURE) {
		var invalid = ex.getData ? ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID) : null;
		var invalidMsg = (invalid && invalid.length)
			? AjxMessageFormat.format(ZmMsg.sendErrorInvalidAddresses, AjxStringUtil.htmlEncode(invalid.join(", ")))
			: null;
		msg = ZmMsg.sendErrorAbort + "<br/>" + invalidMsg;
		this.popupErrorDialog(msg, ex, true, true);
		return true;
	} else if (ex.code == ZmCsfeException.MAIL_SEND_PARTIAL_ADDRESS_FAILURE) {
		var invalid = ex.getData ? ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID) : null;
		msg = (invalid && invalid.length)
			? AjxMessageFormat.format(ZmMsg.sendErrorPartial, AjxStringUtil.htmlEncode(invalid.join(", ")))
			: ZmMsg.sendErrorAbort;
	} else if (ex.code == AjxException.CANCELED) {
		msg = ZmMsg.cancelSendMsgWarning;
		this._composeView.setBackupForm();
		return true;
	} else if (ex.code == ZmCsfeException.MAIL_QUOTA_EXCEEDED) {
		if (this._composeView._attachDialog) {
			msg = ZmMsg.errorQuotaExceeded;
			this._composeView._attachDialog.setFooter('You have exceeded your mail quota. Please remove some attachments and try again.' );
		}
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

/**
 * Creates a new ZmComposeView if one does not already exist
 *
 * @param initHide	Set to true if compose view should be initially rendered
 *					off screen (used as an optimization to preload this view)
 *
 * @private
 */
ZmComposeController.prototype.initComposeView =
function(initHide, composeMode) {
	if (this._composeView) { return; }

	this._composeView = new ZmComposeView(this._container, this, composeMode);
	var callbacks = {};
	callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
	callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
	callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
	callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);
	var elements = {};
	this._initializeToolBar();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._composeView;
	this._app.createView({viewId:this.viewId, elements:elements, callbacks:callbacks, tabParams:this._getTabParams()});
	if (initHide) {
		this._composeView.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		this._composeView.enableInputs(false);
	}

	if (this._composeView.identitySelect) {
		this._composeView.identitySelect.addChangeListener(new AjxListener(this, this._identityChangeListener, [true]));
	}
};

ZmComposeController.prototype._getTabParams =
function() {
	return {id:this.tabId, image:"NewMessage", textPrecedence:75, tooltip:ZmComposeController.DEFAULT_TAB_TEXT};
};

ZmComposeController.prototype._identityChangeListener =
function(setSignature, event) {
	var signatureId = this._composeView.getIdentity().signature;
	var resetBody = this._composeView.isDirty();

	// don't do anything if signature is same
	if (signatureId == this._currentSignatureId) { return; }

	// apply settings
	this._applyIdentityToBody(setSignature, resetBody);
	this._currentSignatureId = signatureId;
};

ZmComposeController.prototype._applyIdentityToBody =
function(setSignature, resetBody) {
	var identity = this._composeView.getIdentity();
	if (setSignature) {
		this.setSelectedSignature(identity.signature);
	}
	var newMode = this._getComposeMode(this._msg, identity);
	if (newMode != this._composeView.getComposeMode()) {
		this._composeView.setComposeMode(newMode);
	}
	this._composeView.applySignature(this._getBodyContent(), this._currentSignatureId);
	this._setAddSignatureVisibility();
};

ZmComposeController.prototype._handleSelectSignature =
function(ev) {
	var sigId = ev.item.getData(ZmComposeController.SIGNATURE_KEY);
	this.setSelectedSignature(sigId);
	this.resetSignature(sigId);
};

/**
 * Sets the tab stops for the compose form. All address fields are added; they're
 * not actual tab stops unless they're visible. The textarea for plain text and
 * the HTML editor for HTML compose are swapped in and out depending on the mode.
 * 
 * @private
 */
ZmComposeController.prototype._setComposeTabGroup =
function() {
	var tg = this._createTabGroup();
	var rootTg = appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		tg.addMember(this._composeView._field[ZmMailMsg.COMPOSE_ADDRS[i]]);
	}
	tg.addMember(this._composeView._subjectField);
	var mode = this._composeView.getComposeMode();
	var member = (mode == DwtHtmlEditor.TEXT) ? this._composeView._bodyField : this._composeView.getHtmlEditor();
    if(this._composeView.isTinyMCEEnabled()) {
        var htmlEditor = this._composeView.getHtmlEditor();
        member = htmlEditor.getEditorContainer();
    }
	tg.addMember(member);
};

ZmComposeController.prototype.getKeyMapName =
function() {
	return "ZmComposeController";
};

ZmComposeController.prototype.handleKeyAction =
function(actionCode) {
	switch (actionCode) {
		case ZmKeyMap.CANCEL:
			this._cancelCompose();
			break;

		case ZmKeyMap.SAVE: // Save to draft
			if (this._canSaveDraft()) {
				this.saveDraft();
			}
			break;

		case ZmKeyMap.SEND: // Send message
			this._send();
			break;

		case ZmKeyMap.ATTACHMENT:
			this._attachmentListener();
			break;

		case ZmKeyMap.SPELLCHECK:
			if (!appCtxt.get(ZmSetting.SPELL_CHECK_ENABLED)) break;
			this.toggleSpellCheckButton(true);
			this._spellCheckListener();
			break;

		case ZmKeyMap.HTML_FORMAT:
			if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
				var mode = this._composeView.getComposeMode();
				var newMode = (mode == DwtHtmlEditor.TEXT) ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
				this._setFormat(newMode);
				this._setOptionsMenu(newMode);
			}
			break;

		case ZmKeyMap.ADDRESS_PICKER:
			this._composeView._addressButtonListener(null, AjxEmailAddress.TO);
			break;

		case ZmKeyMap.NEW_WINDOW:
			if (!appCtxt.isChildWindow) {
				this._detachListener();
			}
			break;

		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

ZmComposeController.prototype.mapSupported =
function(map) {
	return (map == "editor");
};

/**
 * Gets the selected signature.
 * 
 * @return	{String}	the selected signature key or <code>null</code> if none selected
 */
ZmComposeController.prototype.getSelectedSignature =
function() {
	var button = this._toolbar.getButton(ZmOperation.ADD_SIGNATURE);
	var menu = button ? button.getMenu() : null;
	if (menu) {
		var menuitem = menu.getSelectedItem(DwtMenuItem.RADIO_STYLE);
		return menuitem ? menuitem.getData(ZmComposeController.SIGNATURE_KEY) : null;
	}
};

/**
 * Gets the selected signature.
 * 
 * @param	{String}	value 	the selected signature key
 */
ZmComposeController.prototype.setSelectedSignature =
function(value) {
	var button = this._toolbar.getButton(ZmOperation.ADD_SIGNATURE);
	var menu = button ? button.getMenu() : null;
	if (menu) {
		menu.checkItem(ZmComposeController.SIGNATURE_KEY, value, true);
	}
};

ZmComposeController.prototype.resetSignature =
function(sigId, account) {
	this._composeView.applySignature(this._getBodyContent(), this._currentSignatureId, account);
	this._currentSignatureId = sigId;
};

//
// Protected methods
//

ZmComposeController.prototype._deleteDraft =
function(delMsg) {

	var list = delMsg.list;
	var mailItem, request;

	if (list && list.type == ZmItem.CONV) {
		mailItem = list.getById(delMsg.cid);
		request = "ConvActionRequest";
	} else {
		mailItem = delMsg;
		request = "MsgActionRequest";
	}

	// manually delete "virtual conv" or msg created but never added to internal list model
	var soapDoc = AjxSoapDoc.create(request, "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", mailItem.id);
	actionNode.setAttribute("op", "delete");

	var async = window.parentController == null;
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:async});
};

/**
 * Creates the compose view based on the mode we're in. Lazily creates the
 * compose toolbar, a contact picker, and the compose view itself.
 *
 * @param action		[constant]		new message, reply, forward, or an invite action
 * @param msg			[ZmMailMsg]*	the original message (reply/forward), or address (new message)
 * @param toOverride 	[string]*		initial value for To: field
 * @param subjOverride 	[string]*		initial value for Subject: field
 * @param extraBodyText [string]*		canned text to prepend to body (invites)
 * @param composeMode	[constant]*		HTML or text compose
 * @param accountName	[string]*		on-behalf-of From address
 * @param msgIds		[Array]*		list of msg Id's to be added as attachments
 */
ZmComposeController.prototype._setView =
function(params) {

	if (this._autoSaveTimer) {
		this._autoSaveTimer.kill();
	}

	// save args in case we need to re-display (eg go from Reply to Reply All)
	var action = this._action = params.action;
	var msg = this._msg = params.msg;
	this._toOverride = params.toOverride;
	this._subjOverride = params.subjOverride;
	this._extraBodyText = params.extraBodyText;
	this._msgIds = params.msgIds;
	this._accountName = params.accountName;

	var account = (appCtxt.multiAccounts && appCtxt.getActiveAccount().isMain)
		? appCtxt.accountList.defaultAccount : null;
	var identityCollection = appCtxt.getIdentityCollection(account);
	var identity = (msg && msg.identity) ? msg.identity : identityCollection.selectIdentity(msg);
	params.identity = identity;
	if (identity) {
		this._currentSignatureId = identity.signature;
	}

	this._composeMode = params.composeMode || this._getComposeMode(msg, identity);
	this._curIncOptions = null;

	var cv = this._composeView;
	if (!cv) {
		this.initComposeView(null, this._composeMode);
		cv = this._composeView;
	} else {
		cv.setComposeMode(this._composeMode);
	}

	this._initializeToolBar();
	this.resetToolbarOperations();

	this._setAddSignatureVisibility();

	cv.set(params);
	this._setOptionsMenu();
	this._setComposeTabGroup();
	this._app.pushView(this.viewId);
	if (!appCtxt.isChildWindow) {
		cv.updateTabTitle();
	}
	cv.reEnableDesignMode();

	if (msg && (action == ZmOperation.DRAFT)) {
		this._draftType = ZmComposeController.DRAFT_TYPE_MANUAL;
	} else {
		this._draftType = ZmComposeController.DRAFT_TYPE_NONE;
	}

	if (params.callback) {
		params.callback.run(this);
	}
};

ZmComposeController.prototype._initializeToolBar =
function() {
	if (this._toolbar) { return; }

	var buttons = [
		ZmOperation.SEND,
		ZmOperation.CANCEL,
		ZmOperation.SEP,
		ZmOperation.SAVE_DRAFT
	];

	if (appCtxt.get(ZmSetting.ATTACHMENT_ENABLED)) {
		buttons.push(ZmOperation.ATTACHMENT);
	}

	if (!appCtxt.isOffline) {
		buttons.push(ZmOperation.SPELL_CHECK);
	}
	if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED)) {
		buttons.push(ZmOperation.ADD_SIGNATURE);
	}
	buttons.push(ZmOperation.COMPOSE_OPTIONS, ZmOperation.FILLER);

	if (appCtxt.get(ZmSetting.DETACH_COMPOSE_ENABLED) && !appCtxt.isChildWindow) {
		buttons.push(ZmOperation.DETACH_COMPOSE);
	}

	var tb = this._toolbar = new ZmButtonToolBar({
		parent: this._container,
		buttons: buttons,
		className: (appCtxt.isChildWindow ? "ZmAppToolBar_cw" : "ZmAppToolBar") + " ImgSkin_Toolbar",
		context: this.viewId
	});

	for (var i = 0; i < tb.opList.length; i++) {
		var button = tb.opList[i];
		if (this._listeners[button]) {
			tb.addSelectionListener(button, this._listeners[button]);
		}
	}

	this._setAddSignatureVisibility();

	if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED) || appCtxt.multiAccounts) {
		var sc = appCtxt.getSignatureCollection();
		sc.addChangeListener(new AjxListener(this, this._signatureChangeListener));

		var button = tb.getButton(ZmOperation.ADD_SIGNATURE);
		if (button) {
			button.setMenu(new AjxCallback(this, this._createSignatureMenu));
		}
	}

	var actions = [ZmOperation.NEW_MESSAGE, ZmOperation.REPLY, ZmOperation.FORWARD_ATT];
	this._optionsMenu = {};
	for (var i = 0; i < actions.length; i++) {
		this._optionsMenu[actions[i]] = this._createOptionsMenu(actions[i]);
	}
	this._optionsMenu[ZmOperation.REPLY_ALL] = this._optionsMenu[ZmOperation.REPLY];
	this._optionsMenu[ZmOperation.FORWARD_INLINE] = this._optionsMenu[ZmOperation.FORWARD_ATT];
	this._optionsMenu[ZmOperation.REPLY_CANCEL] = this._optionsMenu[ZmOperation.REPLY_ACCEPT] =
		this._optionsMenu[ZmOperation.REPLY_DECLINE] = this._optionsMenu[ZmOperation.REPLY_TENTATIVE] =
		this._optionsMenu[ZmOperation.SHARE] = this._optionsMenu[ZmOperation.DRAFT] =
		this._optionsMenu[ZmOperation.NEW_MESSAGE];

	// change default button style to select for spell check button
	var spellCheckButton = tb.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

	var button = tb.getButton(ZmOperation.NEW_MENU);
	if (button) {
		var listener = new AjxListener(tb, ZmListController._newDropDownListener);
		button.addDropDownSelectionListener(listener);
		tb._ZmListController_this = this;
		tb._ZmListController_newDropDownListener = listener;
	}

	appCtxt.notifyZimlets("initializeToolbar", [this._app, tb, this, this.viewId], {waitUntilLoaded:true});
};

ZmComposeController.prototype._initAutoSave =
function() {
	if (!this._canSaveDraft()) { return; }

	var autoSaveInterval = appCtxt.get(ZmSetting.AUTO_SAVE_DRAFT_INTERVAL);
	if (autoSaveInterval) {
		if (!this._autoSaveTimer) {
			this._autoSaveTimer = new DwtIdleTimer(autoSaveInterval * 1000, new AjxCallback(this, this._autoSaveCallback));
		} else {
			this._autoSaveTimer.resurrect(autoSaveInterval * 1000);
		}
	}
};

ZmComposeController.prototype._setAddSignatureVisibility =
function(account) {
	var ac = window.parentAppCtxt || window.appCtxt;
	var button = ac.get(ZmSetting.SIGNATURES_ENABLED, null, account) &&
				 this._toolbar.getButton(ZmOperation.ADD_SIGNATURE);
	if (button) {
		button.setVisible(appCtxt.getSignatureCollection(account).getSize() > 0);
	}
};

ZmComposeController.prototype._createOptionsMenu =
function(action) {

	var isReply = (action == ZmOperation.REPLY || action == ZmOperation.REPLY_ALL);
	var isForward = (action == ZmOperation.FORWARD_ATT || action == ZmOperation.FORWARD_INLINE);
	var list = [];
	if (isReply) {
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.SEP);
	}
	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		list.push(ZmOperation.FORMAT_HTML, ZmOperation.FORMAT_TEXT, ZmOperation.SEP);
	}
	if (isReply) {
        list.push(ZmOperation.SEP, ZmOperation.INC_NONE, ZmOperation.INC_BODY, ZmOperation.INC_SMART, ZmOperation.INC_ATTACHMENT);
	} else if (isForward) {
        list.push(ZmOperation.SEP, ZmOperation.INC_BODY, ZmOperation.INC_ATTACHMENT);
	}
    if (isReply || isForward) {
        list.push(ZmOperation.SEP, ZmOperation.USE_PREFIX, ZmOperation.INCLUDE_HEADERS);
    }

	// add read receipt
	if (appCtxt.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED)) {
		var ac = window.parentAppCtxt || window.appCtxt;
		var fid = this._msg && this._msg.folderId;
		var folder = fid ? ac.getById(fid) : null;
		if (!folder || (folder && !folder.isRemote())) {
			list.push(ZmOperation.SEP, ZmOperation.REQUEST_READ_RECEIPT);
		}
	}

	var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);

	var overrides = {};
	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		if (op == ZmOperation.SEP) { continue; }
		overrides[op] = {};
		if (ZmComposeController.OP_CHECK[op]) {
			overrides[op].style = DwtMenuItem.CHECK_STYLE;
		} else {
			overrides[op].style = DwtMenuItem.RADIO_STYLE;
			overrides[op].radioGroupId = ZmComposeController.RADIO_GROUP[op];
		}
		if (op == ZmOperation.REPLY) {
			overrides[op].text = ZmMsg.replySender;
		}
	}

	var menu = new ZmActionMenu({parent:button, menuItems:list, overrides:overrides,
								 context:[this.viewId, action].join("_")});

	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var mi = menu.getOp(op);
		if (!mi) { continue; }
		if (op == ZmOperation.FORMAT_HTML) {
			mi.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.HTML);
		} else if (op == ZmOperation.FORMAT_TEXT) {
			mi.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.TEXT);
		}
		mi.setData(ZmOperation.KEY_ID, op);
		mi.addSelectionListener(this._listeners[ZmOperation.COMPOSE_OPTIONS]);
	}

	return menu;
};

ZmComposeController.prototype._setOptionsMenu =
function(composeMode, incOptions) {

	composeMode = composeMode || this._composeMode;
	incOptions = incOptions || this._curIncOptions || {};

	var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	button.setToolTipContent(ZmMsg[ZmComposeController.OPTIONS_TT[this._action]]);
	var menu = this._optionsMenu[this._action];
	if (!menu) { return; }

	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		menu.checkItem(ZmHtmlEditor._VALUE, composeMode, true);
	}

	if (appCtxt.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED)) {
		var mi = menu.getOp(ZmOperation.REQUEST_READ_RECEIPT);
		if (mi) {
			// did this draft have "request read receipt" option set?
			if (this._msg && this._msg.isDraft) {
				mi.setChecked(this._msg.readReceiptRequested);
			} else {
				// bug: 41329 - always re-init read-receipt option to be off
				mi.setChecked(false, true);
			}
		}
	}

	if (this._action == ZmOperation.REPLY || this._action == ZmOperation.REPLY_ALL) {
		menu.checkItem(ZmOperation.KEY_ID, this._action, true);
	}

	// handle options for what's included
	var what = incOptions.what;
	menu.checkItem(ZmOperation.KEY_ID, ZmComposeController.INC_OP[what], true);
	var allowOptions = (what == ZmSetting.INC_BODY || what == ZmSetting.INC_SMART);
	var mi = menu.getOp(ZmOperation.USE_PREFIX);
	if (mi) {
		mi.setEnabled(allowOptions);
		mi.setChecked(incOptions.prefix && allowOptions, true);
	}
	mi = menu.getOp(ZmOperation.INCLUDE_HEADERS);
	if (mi) {
		mi.setEnabled(allowOptions);
		mi.setChecked(incOptions.headers && allowOptions, true);
	}

	button.setMenu(menu);
};

ZmComposeController.prototype._getComposeMode =
function(msg, identity) {

	// depending on COS/user preference set compose format
	var composeMode = DwtHtmlEditor.TEXT;

	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		if (this._action == ZmOperation.NEW_MESSAGE) {
			if (appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML) {
				composeMode = DwtHtmlEditor.HTML;
			}
		} else if (this._action == ZmOperation.DRAFT) {
			if (msg && msg.isHtmlMail()) {
				composeMode = DwtHtmlEditor.HTML;
			}
		} else if (identity) {
			var sameFormat = appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT);
			var asFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
			if ((!sameFormat && asFormat == ZmSetting.COMPOSE_HTML) ||  (sameFormat && msg && msg.isHtmlMail())) {
				composeMode = DwtHtmlEditor.HTML;
			}
		}
	}

	return composeMode;
};

ZmComposeController.prototype._getBodyContent =
function() {
	return this._composeView.getHtmlEditor().getContent();
};

ZmComposeController.prototype._setFormat =
function(mode) {

	var curMode = this._composeView.getComposeMode();
	if (mode == curMode) { return; }

	var cv = this._composeView;
	var dirty = cv.isDirty();
	if (dirty || this._action == ZmOperation.DRAFT) {
		if (!this._formatWarningDialog) {
			this._formatWarningDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
		}
		var fwDlg = this._formatWarningDialog;
		fwDlg.registerCallback(DwtDialog.OK_BUTTON, this._formatOkCallback, this, [mode]);
		fwDlg.registerCallback(DwtDialog.CANCEL_BUTTON, this._formatCancelCallback, this, [curMode]);
		var msg  = (mode == DwtHtmlEditor.TEXT) ? ZmMsg.switchToText : ZmMsg.switchToHtml;
		fwDlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		fwDlg.popup(cv._getDialogXY());
	} else {
		// bug 26658: remove the signature before changing mode, and
		//            add it back after
		var tmp = this._currentSignatureId;
		if (tmp) {
			this.setSelectedSignature("");
			this._composeView.applySignature(this._getBodyContent(), tmp);
		}
		cv.setComposeMode(mode, true);
		if (tmp) {
			this.setSelectedSignature(tmp);
			cv.applySignature(this._getBodyContent(), tmp);
		}
		return true;
	}

	return false;
};

ZmComposeController.prototype._processSendMsg =
function(draftType, msg, resp) {

	this._msgSent = true;
	var isDraft = (draftType != ZmComposeController.DRAFT_TYPE_NONE);
	if (!isDraft) {
		var popped = false;
		if (appCtxt.get(ZmSetting.SHOW_MAIL_CONFIRM)) {
			var confirmController = AjxDispatcher.run("GetMailConfirmController");
			confirmController.showConfirmation(msg, this.viewId, this.tabId);
			popped = true;	// don't pop confirm page
		} else {
			if (appCtxt.isChildWindow && window.parentController) {
				window.onbeforeunload = null;
				if (!appCtxt.isOffline) { // see bug #29372
					window.parentController.setStatusMsg(ZmMsg.messageSent);
				}
			} else {
				if (!appCtxt.isOffline) { // see bug #29372
					appCtxt.setStatusMsg(ZmMsg.messageSent);
				}
			}
			popped = this._app.popView(true);
		}

		if (resp || !appCtxt.get(ZmSetting.SAVE_TO_SENT)) {
			this._composeView.reset(false);

			// if the original message was a draft, we need to nuke it
			var origMsg = msg._origMsg;
			if (origMsg && origMsg.isDraft)
				this._deleteDraft(origMsg);

			// bug 36341
			if (!appCtxt.isOffline && resp && appCtxt.get(ZmSetting.SAVE_TO_IMAP_SENT) && msg.identity) {
				var datasources = appCtxt.getDataSourceCollection();
				var datasource = datasources && datasources.getById(msg.identity.id);
				if (datasource && datasource.type == ZmAccount.TYPE_IMAP) {
					var parent = appCtxt.getById(datasource.folderId);
					var folder;
					if (parent) {
						// try to find the sent folder from list of possible choices
						var prefix = parent.getName(false, null, true, true) + "/";
						var folderNames = [
							appCtxt.get(ZmSetting.SENT_FOLDER_NAME) || "Sent",
							ZmMsg.sent, "Sent Messages", "[Gmail]/Sent Mail"
						];
						for (var i = 0; i < folderNames.length; i++) {
							folder = parent.getByPath(prefix+folderNames[i]);
							if (folder) break;
						}
					}
					if (folder) {
						var jsonObj = {
							ItemActionRequest: {
								_jsns:  "urn:zimbraMail",
								action: {
									id:     resp.m[0].id,
									op:     "move",
									l:      folder.id
								}
							}
						};
						var params = {
							jsonObj: jsonObj,
							asyncMode: true,
							noBusyOverlay: true
						};
						appCtxt.getAppController().sendRequest(params);
					}
				}
			}

			if (!popped) {
				this._app.popView(true);
			}
		}
	} else {
		// TODO - disable save draft button indicating a draft was saved
		if (appCtxt.isChildWindow) {
			appCtxt.setStatusMsg(ZmMsg.draftSaved);
			this._composeView.processMsgDraft(msg);
			//Check if Mail App view has been created and then update the MailListController
			var pAppCtxt = window.parentAppCtxt;
			if(pAppCtxt.getAppViewMgr().getAppView(ZmApp.MAIL)) {
				var listController = pAppCtxt.getApp(ZmApp.MAIL).getMailListController();
				if (listController && listController._draftSaved) {
					//Pass the mail response to the parent window such that the ZmMailMsg obj is created in the parent window.
					listController._draftSaved(null, resp.m[0]);
				}
			}
		} else {
			var message;
			var transitions;
			if (draftType == ZmComposeController.DRAFT_TYPE_AUTO) {
				var time = AjxDateUtil.computeTimeString(new Date());
				this._autoSaveFormat = this._autoSaveFormat || new AjxMessageFormat(ZmMsg.draftSavedAuto);
				message = this._autoSaveFormat.format(time);
				transitions = [ ZmToast.FADE_IN, ZmToast.IDLE, ZmToast.PAUSE, ZmToast.FADE_OUT ];
			} else {
				message = ZmMsg.draftSaved;
			}
			appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_INFO, null, transitions);
			this._composeView.processMsgDraft(msg);
			if (this._listController && this._listController._draftSaved) {
				this._listController._draftSaved(msg);
			}
		}
	}
};


// Listeners

// Send button was pressed
ZmComposeController.prototype._sendListener =
function(ev) {
	this._send();
};

ZmComposeController.prototype._send =
function() {
	this._toolbar.enableAll(false); // thwart multiple clicks on Send button
	this.sendMsg();
};

// Cancel button was pressed
ZmComposeController.prototype._cancelListener =
function(ev) {
	this._cancelCompose();
};

ZmComposeController.prototype._cancelCompose =
function() {
	var dirty = this._composeView.isDirty();
	var needPrompt = dirty || (this._draftType == ZmComposeController.DRAFT_TYPE_AUTO);
	if (!needPrompt) {
		this._composeView.reset(true);
	} else {
		this._composeView.enableInputs(false);
	}
	this._composeView.reEnableDesignMode();
	this._app.popView(!needPrompt);
};

// Attachment button was pressed
ZmComposeController.prototype._attachmentListener =
function(ev) {

	if (!this._detachOkCancel) {
		// detach ok/cancel dialog is only necessary if user clicked on the add attachments button
		this._detachOkCancel = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
		this._detachOkCancel.setMessage(ZmMsg.detachAnyway, DwtMessageDialog.WARNING_STYLE);
		this._detachOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._detachCallback, this);
	}
	this._composeView.showAttachmentDialog();
};

ZmComposeController.prototype._optionsListener =
function(ev) {

	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.REQUEST_READ_RECEIPT) { return; }

	// Click on "Options" button.
	if (op == ZmOperation.COMPOSE_OPTIONS && this._optionsMenu[this._action]) {
		var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
		var bounds = button.getBounds();
		this._optionsMenu[this._action].popup(0, bounds.x, bounds.y + bounds.height, false);
		return;
	}

	// ignore UNCHECKED for radio buttons
	if (ev.detail != DwtMenuItem.CHECKED && !ZmComposeController.OP_CHECK[op]) { return; }

	if (op == ZmOperation.REPLY || op == ZmOperation.REPLY_ALL) {
		this._composeView._setAddresses(op, AjxEmailAddress.TO, this._toOverride);
	} else if (op == ZmOperation.FORMAT_HTML || op == ZmOperation.FORMAT_TEXT) {
		if (this._setFormat(ev.item.getData(ZmHtmlEditor._VALUE))) {
			this._switchInclude(op);
		}
	} else {
		if (this._setInclude(op)) {
			this._switchInclude(op);
		}
	}
};

ZmComposeController.prototype._setInclude =
function(op) {

	if (this._composeView.isDirty()) {
		// warn user of possible lost content
		if (!this._switchIncludeDialog) {
			this._switchIncludeDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
			this._switchIncludeDialog.setMessage(ZmMsg.switchIncludeWarning, DwtMessageDialog.WARNING_STYLE);
		}
		this._switchIncludeDialog.registerCallback(DwtDialog.OK_BUTTON, this._switchIncludeOkCallback, this, [op]);
		var origIncOptions = AjxUtil.hashCopy(this._curIncOptions);
		this._switchIncludeDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._switchIncludeCancelCallback, this, [origIncOptions]);
		this._switchIncludeDialog.popup(this._composeView._getDialogXY());
		return false;
	} else {
		return true;
	}
};

ZmComposeController.prototype._switchInclude =
function(op) {

	var menu = this._optionsMenu[this._action];
	if (op == ZmOperation.USE_PREFIX || op == ZmOperation.INCLUDE_HEADERS) {
	   var mi = menu.getOp(op);
	   if (op == ZmOperation.USE_PREFIX) {
		   this._curIncOptions.prefix = mi.getChecked();
	   } else {
		   this._curIncOptions.headers = mi.getChecked();
	   }
	} else if (ZmComposeController.INC_MAP[op]) {
		this._curIncOptions.what = ZmComposeController.INC_MAP[op];
	}

	var cv = this._composeView;
	var userText = "";
	if (op != ZmOperation.FORMAT_HTML && op != ZmOperation.FORMAT_TEXT) {
		if (cv._origIncludedContent) {
			var curText = this._getBodyContent();
			var idx = curText.indexOf(cv._origIncludedContent);
			if (idx > 0) {
				userText = curText.replace(cv._origIncludedContent, "");
			}
		}
		if (cv._composeMode == DwtHtmlEditor.TEXT) {
			AjxTimedAction.scheduleAction(new AjxTimedAction(this, function() { cv.getHtmlEditor().moveCaretToTop(); }), 200);
		}
	}

	// forwarding actions are tied to inc option
	if (this._action == ZmOperation.FORWARD_INLINE && what == ZmSetting.INC_ATTACH) {
		this._action = ZmOperation.FORWARD_ATT;
	}
	if (this._action == ZmOperation.FORWARD_ATT && what != ZmSetting.INC_ATTACH) {
		this._action = ZmOperation.FORWARD_INLINE;
	}

	cv.resetBody(this._action, this._msg, userText);
};

ZmComposeController.prototype._detachListener =
function(ev) {
	var atts = this._composeView.getAttFieldValues();
	if (atts.length) {
		this._detachOkCancel.popup(this._composeView._getDialogXY());
	} else {
		this.detach();
	}
};

// Save Draft button was pressed
ZmComposeController.prototype._saveDraftListener =
function(ev) {
	this.saveDraft();
};

ZmComposeController.prototype._autoSaveCallback =
function(idle) {
	if (idle && !DwtBaseDialog.getActiveDialog() && this._composeView.isDirty()) {
		this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO);
	}
};

ZmComposeController.prototype.saveDraft =
function(draftType, attId, docIds, callback) {

	if (!this._canSaveDraft()) { return; }

	draftType = draftType || ZmComposeController.DRAFT_TYPE_MANUAL;
	var respCallback = new AjxCallback(this, this._handleResponseSaveDraftListener, [draftType, callback]);
	if (!docIds) {
		this.sendMsg(attId, draftType, respCallback);
	} else {
		this.sendDocs(docIds, draftType, respCallback);
	}
};

ZmComposeController.prototype._handleResponseSaveDraftListener =
function(draftType, callback) {
	if (draftType == ZmComposeController.DRAFT_TYPE_AUTO &&
		this._draftType == ZmComposeController.DRAFT_TYPE_NONE) {
		this._draftType = ZmComposeController.DRAFT_TYPE_AUTO;
	} else if (draftType == ZmComposeController.DRAFT_TYPE_MANUAL) {
		this._draftType = ZmComposeController.DRAFT_TYPE_MANUAL;
	}
	this._action = ZmOperation.DRAFT;

	if (callback) {
		callback.run();
	}
};

ZmComposeController.prototype._spellCheckListener =
function(ev) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	var htmlEditor = this._composeView.getHtmlEditor();

	if (spellCheckButton.isToggled()) {
		var callback = new AjxCallback(this, this.toggleSpellCheckButton);
		if (!htmlEditor.spellCheck(callback))
			this.toggleSpellCheckButton(false);
	} else {
		htmlEditor.discardMisspelledWords();
	}
};

ZmComposeController.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;

	var id = ev.source.id;
	if (id == ZmSetting.SHOW_BCC) {
		//Handle, if SHOW_BCC setting is changed, need to do when we come up with a COS Preference.
	}
};


// Callbacks

ZmComposeController.prototype._detachCallback =
function() {
	// get rid of any lingering attachments since they cannot be detached
	this._composeView.cleanupAttachments();
	this._detachOkCancel.popdown();
	this.detach();
};

ZmComposeController.prototype._formatOkCallback =
function(mode) {
	this._formatWarningDialog.popdown();
	this._composeView.setComposeMode(mode, true);
	this._composeView._dirtyModeSwitch = true;
};

ZmComposeController.prototype._formatCancelCallback =
function(mode) {
	this._formatWarningDialog.popdown();

	// reset the radio button for the format button menu
	var menu = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS).getMenu();
	menu.checkItem(ZmHtmlEditor._VALUE, mode, true);

	this._composeView.reEnableDesignMode();
};

/**
 * Called as: Yes, save as draft
 * 			  Yes, go ahead and cancel
 *
 * @param mailtoParams		[Object]*	Used by offline client to pass on mailto handler params
 */
ZmComposeController.prototype._popShieldYesCallback =
function(mailtoParams) {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._composeView.enableInputs(true);
	if (this._canSaveDraft()) {
		// save as draft
		var callback = mailtoParams ? new AjxCallback(this, this.doAction, mailtoParams) :
					   				  new AjxCallback(this, this._popShieldYesDraftSaved);
		this.sendMsg(null, ZmComposeController.DRAFT_TYPE_MANUAL, callback);
	} else {
		// cancel
		if (appCtxt.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
		} else {
			this._composeView.reset(false);
		}
		if (mailtoParams) {
			this.doAction(mailtoParams);
		} else {
			appCtxt.getAppViewMgr().showPendingView(true);
		}
	}
};

ZmComposeController.prototype._popShieldYesDraftSaved =
function() {
	appCtxt.getAppViewMgr().showPendingView(true);
};

// Called as: No, don't save as draft
//			  No, don't cancel
ZmComposeController.prototype._popShieldNoCallback =
function(mailtoParams) {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._composeView.enableInputs(true);
	if (this._canSaveDraft()) {
		if (appCtxt.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
		}

        this._composeView.reset(false);

		if (!mailtoParams) {
			appCtxt.getAppViewMgr().showPendingView(true);
		}
	} else {
		if (!mailtoParams) {
			appCtxt.getAppViewMgr().showPendingView(false);
		}
		this._composeView.reEnableDesignMode();
	}

	if (mailtoParams) {
		this.doAction(mailtoParams);
	}
};

ZmComposeController.prototype._popShieldDiscardCallback =
function() {
	this._deleteDraft(this._composeView._msg);
	this._popShieldNoCallback();
};

// Called as: Don't save as draft or cancel
ZmComposeController.prototype._popShieldDismissCallback =
function() {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._cancelViewPop();
};

ZmComposeController.prototype._switchIncludeOkCallback =
function(op) {
	this._switchIncludeDialog.popdown();
	this._switchInclude(op);
};

ZmComposeController.prototype._switchIncludeCancelCallback =
function(origIncOptions) {
	this._switchIncludeDialog.popdown();
	this._setOptionsMenu(null, origIncOptions);
};

/**
 * Handles re-enabling inputs if the pop shield is dismissed via
 * Esc. Otherwise, the handling is done explicitly by a callback.
 */
ZmComposeController.prototype._dialogPopdownActionListener =
function() {
	this._cancelViewPop();
};

ZmComposeController.prototype._cancelViewPop =
function() {
	this._composeView.enableInputs(true);
	appCtxt.getAppViewMgr().showPendingView(false);
	this._composeView.reEnableDesignMode();
};

ZmComposeController.prototype._getDefaultFocusItem =
function() {
	if (this._action == ZmOperation.NEW_MESSAGE ||
		this._action == ZmOperation.FORWARD_INLINE ||
		this._action == ZmOperation.FORWARD_ATT)
	{
		return this._composeView._field[AjxEmailAddress.TO];
	}

	return (this._composeView.getComposeMode() == DwtHtmlEditor.TEXT)
		? this._composeView._bodyField
		: this._composeView._htmlEditor;
};

ZmComposeController.prototype._createSignatureMenu =
function(button, account) {
	if (!this._composeView) { return null; }

	var button = this._toolbar.getButton(ZmOperation.ADD_SIGNATURE);
	if (!button) { return null; }

	var menu;
	var options = appCtxt.getSignatureCollection(account).getSignatureOptions();
	if (options.length > 0) {
		menu = new DwtMenu({parent:button});
		var listener = new AjxListener(this, this._handleSelectSignature);
		var radioId = this._composeView._htmlElId + "_sig";
		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			var menuitem = new DwtMenuItem({parent:menu, style:DwtMenuItem.RADIO_STYLE, radioGroupId:radioId});
			menuitem.setText(AjxStringUtil.htmlEncode(option.displayValue));
			menuitem.setData(ZmComposeController.SIGNATURE_KEY, option.value);
			menuitem.addSelectionListener(listener);
			menu.checkItem(ZmComposeController.SIGNATURE_KEY, option.value, option.selected);
		}
	}
	return menu;
};

ZmComposeController.prototype._signatureChangeListener =
function(ev) {
	this.resetSignatureToolbar(this.getSelectedSignature());
};

/**
 * Resets the signature dropdown based on the given account and selects the
 * given signature if provided.
 *
 * @param selected	[String]*			ID of the signature to select
 * @param account	[ZmZimbraAccount]*	account for which to load signatures
 */
ZmComposeController.prototype.resetSignatureToolbar =
function(selected, account) {
	var button = this._toolbar.getButton(ZmOperation.ADD_SIGNATURE);
	var menu = button && this._createSignatureMenu(null, account);
	if (menu) {
		button.setMenu(menu);
		this.setSelectedSignature(selected || "");
	}

	this._setAddSignatureVisibility(account);
};

ZmComposeController.prototype.resetToolbarOperations =
function() {
	this._toolbar.enableAll(true);
	if (this._composeView._isInviteReply(this._action)) {
		var ops = [ ZmOperation.SAVE_DRAFT ];
		if (this._action == ZmOperation.REPLY_CANCEL) {
			ops.push(ZmOperation.ATTACHMENT);
		}
		this._toolbar.enable(ops, false);
	}
	var op = this._toolbar.getOp(ZmOperation.COMPOSE_OPTIONS);
	if (op) {
		op.setVisible(appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED));
	}
};

ZmComposeController.prototype.setSessionId =
function(type, sessionId) {
	ZmController.prototype.setSessionId.apply(this, arguments);
	this.tabId = ["tab", this.viewId].join("_");
};

ZmComposeController.prototype._canSaveDraft =
function() {
	return appCtxt.get(ZmSetting.SAVE_DRAFT_ENABLED) && !this._composeView._isInviteReply(this._action);
};
