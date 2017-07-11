/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		mailApp		the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 * 
 * @extends		ZmController
 */
ZmComposeController = function(container, mailApp, type, sessionId) {

	ZmController.apply(this, arguments);

	this._action = null;

	ZmComposeController._setStatics();

	this._listeners = {};
	this._listeners[ZmOperation.SEND]				= this._sendListener.bind(this);
	this._listeners[ZmOperation.SEND_MENU]			= this._sendListener.bind(this);
	this._listeners[ZmOperation.SEND_LATER]			= this._sendLaterListener.bind(this);
	this._listeners[ZmOperation.CANCEL]				= this._cancelListener.bind(this);
	this._listeners[ZmOperation.ATTACHMENT]			= this._attachmentListener.bind(this);
	this._listeners[ZmOperation.DETACH_COMPOSE]		= this._detachListener.bind(this);
	this._listeners[ZmOperation.SAVE_DRAFT]			= this._saveDraftListener.bind(this);
	this._listeners[ZmOperation.SPELL_CHECK]		= this._spellCheckListener.bind(this);
	this._listeners[ZmOperation.COMPOSE_OPTIONS]	= this._optionsListener.bind(this);

	this._dialogPopdownListener = this._dialogPopdownActionListener.bind(this);

	this._autoSaveTimer = null;
	this._draftType = ZmComposeController.DRAFT_TYPE_NONE;
	this._elementsToHide = ZmAppViewMgr.LEFT_NAV;
};

ZmComposeController.prototype = new ZmController();
ZmComposeController.prototype.constructor = ZmComposeController;

ZmComposeController.prototype.isZmComposeController = true;
ZmComposeController.prototype.toString = function() { return "ZmComposeController"; };

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
/**
 * Defines the "delaysend" draft type reason.
 */
ZmComposeController.DRAFT_TYPE_DELAYSEND	= "delaysend";

ZmComposeController.DEFAULT_TAB_TEXT = ZmMsg.compose;

ZmComposeController.NEW_WINDOW_WIDTH = 975;
ZmComposeController.NEW_WINDOW_HEIGHT = 475;

// Message dialogs
ZmComposeController.MSG_DIALOG_1	= 1;	// OK
ZmComposeController.MSG_DIALOG_2	= 2;	// OK Cancel

ZmComposeController._setStatics =
function() {

	if (ZmComposeController.RADIO_GROUP) {
		return;
	}

	// radio groups for options items
	ZmComposeController.RADIO_GROUP = {};
	ZmComposeController.RADIO_GROUP[ZmOperation.REPLY]				= 1;
	ZmComposeController.RADIO_GROUP[ZmOperation.REPLY_ALL]			= 1;
    ZmComposeController.RADIO_GROUP[ZmOperation.CAL_REPLY]			= 1;
	ZmComposeController.RADIO_GROUP[ZmOperation.CAL_REPLY_ALL]		= 1;
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
    ZmComposeController.OPTIONS_TT[ZmOperation.CAL_REPLY]		= "replyOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.CAL_REPLY_ALL]	= "replyOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.FORWARD_ATT]		= "forwardOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.FORWARD_INLINE]	= "forwardOptions";

	ZmComposeController.OP_CHECK = {};
	ZmComposeController.OP_CHECK[ZmOperation.SHOW_BCC] 	            = true;
	ZmComposeController.OP_CHECK[ZmOperation.REQUEST_READ_RECEIPT] 	= true;
	ZmComposeController.OP_CHECK[ZmOperation.USE_PREFIX] 			= true;
	ZmComposeController.OP_CHECK[ZmOperation.INCLUDE_HEADERS] 		= true;

	// Classification hashes for a compose action
	ZmComposeController.IS_INVITE_REPLY = {};
	ZmComposeController.IS_INVITE_REPLY[ZmOperation.REPLY_ACCEPT]		= true;
	ZmComposeController.IS_INVITE_REPLY[ZmOperation.REPLY_CANCEL]		= true;
	ZmComposeController.IS_INVITE_REPLY[ZmOperation.REPLY_DECLINE]		= true;
	ZmComposeController.IS_INVITE_REPLY[ZmOperation.REPLY_TENTATIVE]	= true;
	ZmComposeController.IS_INVITE_REPLY[ZmOperation.REPLY_MODIFY]		= true;
	ZmComposeController.IS_INVITE_REPLY[ZmOperation.REPLY_NEW_TIME]		= true;

	ZmComposeController.IS_CAL_REPLY = AjxUtil.hashCopy(ZmComposeController.IS_INVITE_REPLY);
	ZmComposeController.IS_CAL_REPLY[ZmOperation.CAL_REPLY]		= true;
	ZmComposeController.IS_CAL_REPLY[ZmOperation.CAL_REPLY_ALL]	= true;
	
	ZmComposeController.IS_REPLY = AjxUtil.hashCopy(ZmComposeController.IS_CAL_REPLY);
	ZmComposeController.IS_REPLY[ZmOperation.REPLY]		 = true;
	ZmComposeController.IS_REPLY[ZmOperation.REPLY_ALL]	 = true;
	
	ZmComposeController.IS_FORWARD = {};
	ZmComposeController.IS_FORWARD[ZmOperation.FORWARD_INLINE]	= true;
	ZmComposeController.IS_FORWARD[ZmOperation.FORWARD_ATT]	 	= true;

	ZmComposeController.PRIORITY_FLAG_TO_OP = {};
	ZmComposeController.PRIORITY_FLAG_TO_OP[ZmItem.FLAG_LOW_PRIORITY]   = ZmOperation.PRIORITY_LOW;
	ZmComposeController.PRIORITY_FLAG_TO_OP[ZmItem.FLAG_HIGH_PRIORITY]  = ZmOperation.PRIORITY_HIGH;
};

//
// Public methods
//

ZmComposeController.getDefaultViewType =
function() {
	return ZmId.VIEW_COMPOSE;
};
ZmComposeController.prototype.getDefaultViewType = ZmComposeController.getDefaultViewType;

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
	if (ZmComposeController.SETTINGS) { //no SETTINGS in child window
		for (var i = 0; i < ZmComposeController.SETTINGS.length; i++) {
			settings.getSetting(ZmComposeController.SETTINGS[i]).removeChangeListener(this._settingChangeListener);
		}
	}
	this._composeView.dispose();

	var app = this.getApp();
	app.disposeTreeControllers();
	appCtxt.notifyZimlets("onDisposeComposeController", [this]);

};

/**
 * Begins a compose session by presenting a form to the user.
 *
 * @param {Hash}		params			a hash of parameters:
 * @param {constant}	action			the new message, reply, forward, or an invite action
 * @param {Boolean}		inNewWindow		if <code>true</code>, we are in detached window
 * @param {ZmMailMsg}	msg				the original message (reply/forward), or address (new message)
 * @param {String}		toOverride 		the initial value for To: field
 * @param {String}		ccOverride		Cc: addresses (optional)
 * @param {String}		subjOverride 	the initial value for Subject: field
 * @param {String}		extraBodyText	the canned text to prepend to body (invites)
 * @param {AjxCallback}	callback		the callback to run after view has been set
 * @param {String}		accountName		the on-behalf-of From address
 * @param {String}		accountName		on-behalf-of From address
 * @param {boolean}		hideView		if true, don't show compose view
 */
ZmComposeController.prototype.doAction =
function(params) {

	params = params || {};
	var ac = window.parentAppCtxt || window.appCtxt;
	
	// in zdesktop, it's possible there are no accounts that support smtp
	if (ac.isOffline && !ac.get(ZmSetting.OFFLINE_COMPOSE_ENABLED)) {
		this._showMsgDialog(ZmComposeController.MSG_DIALOG_1, ZmMsg.composeDisabled, DwtMessageDialog.CRITICAL_STYLE);
		return;
	}

	params.action = params.action || ZmOperation.NEW_MESSAGE;
	params.inNewWindow = !appCtxt.isWebClientOffline() && !this.isHidden && (params.inNewWindow || this._app._inNewWindow(params.ev));
	this._msgSent = false;
	if (params.inNewWindow) {
        var msgId = (params.msg && params.msg.nId) || Dwt.getNextId();
		var newWinObj = ac.getNewWindow(false, ZmComposeController.NEW_WINDOW_WIDTH, ZmComposeController.NEW_WINDOW_HEIGHT, ZmId.VIEW_COMPOSE + "_" + msgId.replace(/\s|\-/g, '_'));
		if (newWinObj) {
			// this is how child window knows what to do once loading:
			newWinObj.command = "compose";
			newWinObj.params = params;
	        if (newWinObj.win) {
	            newWinObj.win.focus();
	        }
		}
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
		spellCheckButton.setAttribute('aria-pressed', selected);
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

	var view = this._composeView;
	var msg = this._msg || view._origMsg || view._msg;
	var subj = view._subjectField.value;
	var msgAttId = view._msgAttId; //include original as attachment
	var body = this._getBodyContent();
	var composeMode = view.getComposeMode();
	var backupForm = view.backupForm;
	var sendUID = view.sendUID;
	var action = view._action || this._action;
	var identity = view.getIdentity();
    var requestReadReceipt = this.isRequestReadReceipt();
    var selectedIdentityIndex = view.identitySelect && view.identitySelect.getSelectedIndex();

	var addrList = {};
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		addrList[type] = view.getAddrInputField(type).getAddresses(true);
	}

    var partToAttachmentMap = AjxUtil.map(view._partToAttachmentMap, function(member) {
       return AjxUtil.hashCopy(member);
    });

	// this is how child window knows what to do once loading:
    var msgId = (msg && msg.nId) || Dwt.getNextId();
	var newWinObj = appCtxt.getNewWindow(false, ZmComposeController.NEW_WINDOW_WIDTH, ZmComposeController.NEW_WINDOW_HEIGHT, ZmId.VIEW_COMPOSE + "_" + msgId.replace(/\s|\-/g, '_'));
    if (newWinObj && newWinObj.win) {
        newWinObj.win.focus();
    }
	newWinObj.command = "composeDetach";
	newWinObj.params = {
		action:			action,
		msg:			msg,
		addrs:			addrList,
		subj:			subj,
		priority:		this._getPriority(),
        attHtml:        view._attcDiv.innerHTML,
		msgAttId:		msgAttId,
        msgIds:         msg && msg.isDraft ? null : this._msgIds,
		draftType: 		this._draftType,
		draftMsg:		this._draftMsg,
		body:			body,
		composeMode:	composeMode,
		identityId:		selectedIdentityIndex,
		accountName:	this._accountName,
		backupForm:		backupForm,
		sendUID:		sendUID,
		sessionId:		this.getSessionId(),
        readReceipt:	requestReadReceipt,
		sigId:			this.getSelectedSignature(),
        incOptions:     this._curIncOptions,
        partMap:        partToAttachmentMap,
        origMsgAtt:     view._origMsgAtt ? AjxUtil.hashCopy(view._origMsgAtt) : null,
        origAction:     this._origAction
	};
};

ZmComposeController.prototype.popShield =
function() {
	var dirty = this._composeView.isDirty(true, true);
	if (!dirty && (this._draftType != ZmComposeController.DRAFT_TYPE_AUTO)) {
		return true;
	}

	var ps = this._popShield = appCtxt.getYesNoCancelMsgDialog();
	if (this._draftType == ZmComposeController.DRAFT_TYPE_AUTO) {
		// Message has been saved, but never explicitly by the user.
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
		ps.setTitle(ZmMsg.askSaveDraft);
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
	ps.popup();

	return false;
};

// We don't call ZmController._preHideCallback here because it saves the current
// focus member, and we want to start over each time
ZmComposeController.prototype._preHideCallback = function(view, force) {

    DBG.println('draft', 'ZmComposeController._preHideCallback for ' + view + ': force = ' + force + ', _dontSavePreHide = ' + this._dontSavePreHide);
	if (this._autoSaveTimer) {
		//the following is a bit suspicious to me. I assume maybe this method might be called with force == true
		//in a way that is not after the popShield was activated? That would be the only explanation to have this.
		//I wonder if that's the case that leaves orphan drafts
		if (force) {
			// auto-save if we leave this compose tab and the message has not yet been sent
			// this is a refactoring/fix of code initially from bug 72106 (since it's confusing I mention this bug to keep this knowledge)
            if (this._dontSavePreHide) {
                this._dontSavePreHide = false;
            }
            else {
                this._autoSaveCallback(true);
            }
		}
	}

	return force ? true : this.popShield();
};

ZmComposeController.prototype._preUnloadCallback =
function(view) {
	return !this._composeView.isDirty(true, true);
};


ZmComposeController.prototype._preShowCallback = function() {

    this._composeView.enableInputs(true);

	return true;
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
    var view = this._composeView;
	var composeMode = view.getComposeMode();
	if (this._action != ZmOperation.NEW_MESSAGE &&
		this._action != ZmOperation.FORWARD_INLINE &&
		this._action != ZmOperation.FORWARD_ATT)
	{
		if (composeMode == Dwt.HTML) {
 			setTimeout(view._focusHtmlEditor.bind(view), 100);
		}
		this._composeView._setBodyFieldCursor();
	}
};

ZmComposeController.prototype._postHideCallback = function() {

    DBG.println('draft', 'ZmComposeController._postHideCallback for ' + this._currentViewId);
    if (this._autoSaveTimer) {
        this._autoSaveTimer.kill();
    }

	// hack to kill the child window when replying to an invite
	if (appCtxt.isChildWindow && ZmComposeController.IS_INVITE_REPLY[this._action]) {
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
	ps.setTitle(ZmMsg.askSaveDraft);
	ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this, params);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this, params);
	ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
	ps.addPopdownListener(this._dialogPopdownListener);
	ps.popup();

	return true;
};

/**
 * Sends the message represented by the content of the compose view.
 *
 * @param	{String}		attId					the id
 * @param	{constant}		draftType				the draft type (see <code>ZmComposeController.DRAFT_TYPE_</code> constants)
 * @param	{AjxCallback}	callback				the callback
 * @param	{Boolean}		processImages           remove webkit-fake-url images and upload data uri images
 */
ZmComposeController.prototype.sendMsg =
function(attId, draftType, callback, contactId, processImages) {

    if (processImages !== false && this._composeView) {
        //Dont use bind as its arguments cannot be modified before its execution.
        var processImagesCallback = new AjxCallback(this, this._sendMsg, [attId, null, draftType, callback, contactId]);
        var result = this._processImages(processImagesCallback);
        if (result) {
            return;
        }
    }
	return this._sendMsg(attId, null, draftType, callback, contactId);
};

/**
 * Sends the message represented by the content of the compose view with specified docIds as attachment.
 * 
 * @param	{Array}	docIds		the document Ids
 * @param	{constant}	draftType		the draft type (see <code>ZmComposeController.DRAFT_TYPE_</code> constants)
 * @param	{AjxCallback}	callback		the callback
 */
ZmComposeController.prototype.sendDocs =
function(docIds, draftType, callback, contactId) {
	return this._sendMsg(null, docIds, draftType, callback, contactId);
};

/**
 * Sends the message represented by the content of the compose view.
 * 
 * @private
 */
ZmComposeController.prototype._sendMsg =
function(attId, docIds, draftType, callback, contactId) {

	var isTimed = Boolean(this._sendTime);
	draftType = draftType || (isTimed ? ZmComposeController.DRAFT_TYPE_DELAYSEND : ZmComposeController.DRAFT_TYPE_NONE);
	var isDraft = draftType != ZmComposeController.DRAFT_TYPE_NONE;
	var isAutoSave = draftType == ZmComposeController.DRAFT_TYPE_AUTO;
	// bug fix #38408 - briefcase attachments need to be set *before* calling
	// getMsg() but we cannot do that without having a ZmMailMsg to store it in.
	// File this one under WTF.
	var tempMsg;
	if (docIds) {
		tempMsg = new ZmMailMsg();
		this._composeView.setDocAttachments(tempMsg, docIds);
	}
	var msg = this._composeView.getMsg(attId, isDraft, tempMsg, isTimed, contactId);

	if (!msg) {
		return;
	}

	if (this._autoSaveTimer) {
        //If this._autoSaveTimer._timer is null then this._autoSaveTimer.kill(); is already called.
        //Due to browsers cleartimeout taking some time, we are again checking this._autoSaveTimer._timer to prevent unnecessary autosave call
        //Bug:74148
        if (isAutoSave && isDraft && !this._autoSaveTimer._timer) {
            return;
        }
		//kill the timer, no save is attempted while message is pending
        this._autoSaveTimer.kill();
	}

	var origMsg = msg._origMsg;
	var isCancel = (msg.inviteMode == ZmOperation.REPLY_CANCEL);
	var isModify = (msg.inviteMode == ZmOperation.REPLY_MODIFY);

	if (isCancel || isModify) {
		var appt = origMsg._appt;
		var respCallback = this._handleResponseCancelOrModifyAppt.bind(this);
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
	if (msg.delegatedSenderAddr && !msg.delegatedSenderAddrIsDL) {
		acctName = msg.delegatedSenderAddr;
	}

	if (isDraft) {
		if (appCtxt.multiAccounts) {
			// for offline, save drafts based on account owner of From: dropdown
			acctName = ac.accountList.getAccount(msg.fromSelectValue.accountId).name;
		} else {
			acctName = ac.getActiveAccount().name;
		}
		if (msg._origMsg && msg._origMsg.isDraft) {
			// if shared folder, make sure we save the draft under the owner account name
			var folder = msg.folderId ? ac.getById(msg.folderId) : null;
			if (folder && folder.isRemote()) {
				acctName = folder.getOwner();
			}
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
	var requestReadReceipt = !this.isHidden && this.isRequestReadReceipt();

	var respCallback = this._handleResponseSendMsg.bind(this, draftType, msg, callback);
	var errorCallback = this._handleErrorSendMsg.bind(this, draftType, msg);
	msg.send(isDraft, respCallback, errorCallback, acctName, null, requestReadReceipt, null, this._sendTime, isAutoSave);
	this._resetDelayTime();
};

ZmComposeController.prototype._handleResponseSendMsg =
function(draftType, msg, callback, result) {
	var resp = result.getResponse();
	// Reset the autosave interval to the default
	delete(this._autoSaveInterval);
	// Re-enable autosave
	if (draftType !== ZmComposeController.DRAFT_TYPE_NONE) {
		//only re-init autosave if it's a draft, NOT if it's an actual message send. (user clicked "send").
		//In order to avoid a potential race condition, and there's no reason to init auto save anyway.
		this._initAutoSave();
	}
	var needToPop = this._processSendMsg(draftType, msg, resp);

//	this._msg = msg;

	if (callback) {
		callback.run(result);
	}

    if(this.sendMsgCallback) {
        this.sendMsgCallback.run(result);
    }

	appCtxt.notifyZimlets("onSendMsgSuccess", [this, msg, draftType]);//notify Zimlets on success

	if (needToPop) {
		this._dontSavePreHide = true;
		this._app.popView(true, this._currentView);
	}
	
};

ZmComposeController.prototype._handleResponseCancelOrModifyAppt =
function() {
	this._app.popView(true);
    appCtxt.setStatusMsg(ZmMsg.messageSent);
};

ZmComposeController.prototype._handleErrorSendMsg = function(draftType, msg, ex, params) {

	if (draftType !== ZmComposeController.DRAFT_TYPE_NONE && !AjxUtil.isUndefined(this._wasDirty)) {
		this._composeView._isDirty = this._wasDirty;
		delete this._wasDirty;
	}

    var retVal = false;
	if (!this.isHidden) {
		this.resetToolbarOperations();
		this._composeView.enableInputs(true);
	}

    appCtxt.notifyZimlets("onSendMsgFailure", [this, ex, msg]);//notify Zimlets on failure
    if (ex && ex.code) {
	
        var errorMsg = null;
        var showMsg = false;
		var style = null;
        if (ex.code === ZmCsfeException.MAIL_SEND_ABORTED_ADDRESS_FAILURE) {
            var invalid = ex.getData ? ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID) : null;
            var invalidMsg = invalid && invalid.length ? AjxMessageFormat.format(ZmMsg.sendErrorInvalidAddresses, invalid.join(", ")) : null;
            errorMsg = ZmMsg.sendErrorAbort + "<br/>" +  AjxStringUtil.htmlEncode(invalidMsg);
            this.popupErrorDialog(errorMsg, ex, true, true, false, true);
            retVal = true;
        }
        else if (ex.code === ZmCsfeException.MAIL_SEND_PARTIAL_ADDRESS_FAILURE) {
            var invalid = ex.getData ? ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID) : null;
            errorMsg = invalid && invalid.length ? AjxMessageFormat.format(ZmMsg.sendErrorPartial, AjxStringUtil.htmlEncode(invalid.join(", "))) : ZmMsg.sendErrorAbort;
            showMsg = true;
        }
        else if (ex.code == AjxException.CANCELED) {
            if (draftType === ZmComposeController.DRAFT_TYPE_AUTO) {
				//note - this interval is not really used anymore. Only the idle timer is used. This is only used as a boolean checkbox now. I'm pretty sure.
                if (!this._autoSaveInterval) {
                    // Request was cancelled due to a ZmRequestMgr send timeout.
                    // The server can either be hung or this particular message is taking
                    // too long to process. Backoff the send interval - restored to
                    // default upon first successful save
                    this._autoSaveInterval = appCtxt.get(ZmSetting.AUTO_SAVE_DRAFT_INTERVAL);
                }
                if (this._autoSaveInterval) {
                    // Cap the save attempt interval at 5 minutes
                    this._autoSaveInterval *= 2;
                    if (this._autoSaveInterval > 300) {
                        this._autoSaveInterval = 300;
                    }
                }
            }
            errorMsg = ZmMsg.cancelSendMsgWarning;
            this._composeView.setBackupForm();
            retVal = true;
        }
        else if (ex.code === ZmCsfeException.MAIL_QUOTA_EXCEEDED) {
            errorMsg = ZmMsg.errorQuotaExceeded;
        }
        else if (ex.code === ZmCsfeException.MAIL_NO_SUCH_CONTACT) {
            errorMsg = ZmMsg.vcardContactGone;
            showMsg = true;
        }

        if (this._uploadingProgress){
            this._initAutoSave();
		    this._composeView._resetUpload(true);
			if (ex.code === ZmCsfeException.MAIL_MESSAGE_TOO_BIG) {
				errorMsg = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)));
				style = DwtMessageDialog.WARNING_STYLE;
                showMsg = true;
			}
			else if (ex.code === ZmCsfeException.MAIL_NO_SUCH_MSG) {
                // The message was deleted while upload was in progress (likely a discarded draft). Ignore the error.
                DBG.println(AjxDebug.DBG1, "Message was deleted while uploading a file; ignore the SaveDraft 'No Such Message' error." );
                retVal  = true;
                showMsg = false;
            } else {
				errorMsg = errorMsg || ZmMsg.attachingFilesError + "<br>" + (ex.msg || "");
                showMsg = true;
			}
        }

        if (errorMsg && showMsg) {
			this._showMsgDialog(ZmComposeController.MSG_DIALOG_1, errorMsg, style || DwtMessageDialog.CRITICAL_STYLE, null, true);
            retVal = true;
        }
    }

    // Assume the user stays on the compose view, so we need the timer.
    // (it was canceled when send was called)
    this._initAutoSave();
    return retVal;
};


/**
 * Creates a new ZmComposeView if one does not already exist
 */
ZmComposeController.prototype.initComposeView =
function() {

	if (this._composeView) { return; }

	if (!this.isHidden) {
		this._composeView = new ZmComposeView(this._container, this, this._composeMode, this._action);
		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE]		= this._preHideCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD]	= this._preUnloadCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_SHOW]	= this._postShowCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW]		= this._preShowCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_HIDE]	= this._postHideCallback.bind(this);
		this._initializeToolBar();
		var elements = this.getViewElements(null, this._composeView, this._toolbar);
	
		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								hide:		this._elementsToHide,
								controller:	this,
								callbacks:	callbacks,
								tabParams:	this._getTabParams()});

		if (this._composeView.identitySelect) {
			this._composeView.identitySelect.addChangeListener(this._identityChangeListener.bind(this));
		}
	}
	else {
		this._composeView = new ZmHiddenComposeView(this, this._composeMode);
	}
};

ZmComposeController.prototype._getTabParams =
function() {
	return {id:this.tabId, image:"CloseGray", hoverImage:"Close", text:ZmComposeController.DEFAULT_TAB_TEXT, textPrecedence:75,
			tooltip:ZmComposeController.DEFAULT_TAB_TEXT, style: DwtLabel.IMAGE_RIGHT};
};

ZmComposeController.prototype.isTransient =
function(oldView, newView) {
	return (appCtxt.getViewTypeFromId(newView) == ZmId.VIEW_MAIL_CONFIRM);
};

ZmComposeController.prototype._identityChangeListener =
function(event) {

	var cv = this._composeView;
	var signatureId = cv._getSignatureIdForAction(null, this._action);

	// don't do anything if signature is same
	if (signatureId == this._currentSignatureId) { return; }

	var okCallback = this._switchIdentityOkCallback.bind(this);
	var cancelCallback = this._switchIdentityCancelCallback.bind(this, cv.identitySelect.getValue());
	if (!this._warnUserAboutChanges(ZmId.OP_ADD_SIGNATURE, okCallback, cancelCallback)) {
		this._switchIdentityOkCallback();
	}
};

ZmComposeController.prototype._switchIdentityOkCallback =
function() {
    if(this._currentDlg) {
	    this._currentDlg.popdown();
    }
	this._switchIdentity();
};

ZmComposeController.prototype._switchIdentityCancelCallback =
function(identityId) {
	this._currentDlg.popdown();
	this._composeView.identitySelect.setSelectedValue(this._currentIdentityId);
};

ZmComposeController.prototype._switchIdentity =
function() {
	var identity = this._composeView.getIdentity();
	var sigId = this._composeView._getSignatureIdForAction(identity);
	this.setSelectedSignature(sigId);
	var params = {
		action:			this._action,
		msg:			this._msg,
		extraBodyText:	this._composeView.getUserText(),
		keepAttachments: true,
		op:				ZmId.OP_ADD_SIGNATURE
 	};
	this._composeView.resetBody(params);
	this._setAddSignatureVisibility();
	if (identity) {
		this.resetIdentity(identity.id);
	}
	this.resetSignature(sigId);
};

ZmComposeController.prototype._handleSelectSignature =
function(ev) {

	var sigId = ev.item.getData(ZmComposeController.SIGNATURE_KEY);
	var okCallback = this._switchSignatureOkCallback.bind(this, sigId);
	var cancelCallback = this._switchSignatureCancelCallback.bind(this);
	//TODO: There shouldn't be a need to warn the user now that we're preserving quoted text and headers.
	//(see bugs 91743 and 92086
	//However since it's the release time, it's safer to keep warning the user.
	//Revisit this after the release.
	if (!this._warnUserAboutChanges(ZmId.OP_ADD_SIGNATURE, okCallback, cancelCallback)) {
		this._switchSignature(sigId);
	}
};

ZmComposeController.prototype._switchSignatureOkCallback =
function(sigId) {
	this._currentDlg.popdown();
	this._switchSignature(sigId);
};

ZmComposeController.prototype._switchSignatureCancelCallback =
function() {
	this._currentDlg.popdown();
	this.setSelectedSignature(this._currentSignatureId);
};

ZmComposeController.prototype._switchSignature =
function(sigId) {
	this.setSelectedSignature(sigId);
	var params = {
		keepAttachments: true,
		action:			this._action,
		msg:			this._msg,
		extraBodyText:	this._composeView.getUserText(),
		op:				ZmId.OP_ADD_SIGNATURE
	};
	this._composeView._updateSignatureVcard(this._currentSignatureId, sigId);
	this._composeView.resetBody(params);
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
	tg.addMember(this._composeView.getTabGroupMember());
};

ZmComposeController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_COMPOSE;
};

ZmComposeController.prototype.handleKeyAction =
function(actionCode) {
	switch (actionCode) {
		case ZmKeyMap.CANCEL:
			this._cancelCompose();
			break;

		case ZmKeyMap.SAVE: // Save to draft
			if (this._uploadingProgress) {
				break;
			}
			if (this._canSaveDraft()) {
				this.saveDraft();
			}
			break;

		case ZmKeyMap.SEND: // Send message
			if (!appCtxt.get(ZmSetting.USE_SEND_MSG_SHORTCUT) || this._uploadingProgress) {
				break;
			}
			this._sendListener();
			break;

		case ZmKeyMap.ATTACHMENT:
			this._attachmentListener();
			break;

		case ZmKeyMap.SPELLCHECK:
            if (!appCtxt.isSpellCheckerAvailable()) {
                break;
            }
			this.toggleSpellCheckButton(true);
			this._spellCheckListener();
			break;

		case ZmKeyMap.HTML_FORMAT:
			if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
				var mode = this._composeView.getComposeMode();
				var newMode = (mode == Dwt.TEXT) ? Dwt.HTML : Dwt.TEXT;
				this._setFormat(newMode);
				this._setOptionsMenu(newMode);
			}
			break;

		case ZmKeyMap.ADDRESS_PICKER:
			this._composeView.getAddressButtonListener(null, AjxEmailAddress.TO);
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
	if (!this.isHidden) {
		var button = this._getSignatureButton();
		var menu = button ? button.getMenu() : null;
		if (menu) {
			var menuitem = menu.getSelectedItem(DwtMenuItem.RADIO_STYLE);
			return menuitem ? menuitem.getData(ZmComposeController.SIGNATURE_KEY) : null;
		}
	}
	else {
		// for hidden compose, return the default signature
		var ac = window.parentAppCtxt || window.appCtxt;
		var collection = ac.getIdentityCollection();
		return this._composeView._getSignatureIdForAction(collection.defaultIdentity);
	}
};

/**
 * Gets the selected signature.
 * 
 * @param	{String}	value 	the selected signature key
 */
ZmComposeController.prototype.setSelectedSignature =
function(value) {
	var button = this._getSignatureButton();
	var menu = button ? button.getMenu() : null;
	if (menu) {
        if (value === ZmIdentity.SIG_ID_NONE) {
            value = "";
        }
		menu.checkItem(ZmComposeController.SIGNATURE_KEY, value, true);
	}
};

ZmComposeController.prototype.resetSignature =
function(sigId) {
	this._currentSignatureId = sigId;
};

ZmComposeController.prototype.resetIdentity =
function(identityId) {
	this._currentIdentityId = identityId;
};

//
// Protected methods
//

ZmComposeController.prototype._deleteDraft =
function(delMsg) {

	if (!delMsg) { return; }
    var ac = window.parentAppCtxt || window.appCtxt;
    if (delMsg && delMsg.isSent) {
      var folder = delMsg.folderId ? ac.getById(delMsg.folderId) : null;
	  if (folder && folder.isRemote() && !folder.isPermAllowed(ZmOrganizer.PERM_DELETE)) {
         return;   //remote folder no permission to delete, exit
	  }
    }

	delMsg.doDelete();
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
 * @param readReceipt   [boolean]       true/false read receipt setting
 */
ZmComposeController.prototype._setView =
function(params) {

	if (this._autoSaveTimer) {
		this._autoSaveTimer.kill();
	}

	// msg is the original msg for a reply or when editing a draft (not a newly saved draft or sent msg)
	var msg = this._msg = params.msg;
	if (msg && msg.isInvite() && ZmComposeController.IS_FORWARD[params.action]) {
		params.action = ZmOperation.FORWARD_INLINE;
	}
	var action = this._action = params.action;
    this._origAction = params.origAction;
	
	this._toOverride = params.toOverride;
	this._ccOverride = params.ccOverride;
	this._subjOverride = params.subjOverride;
	this._extraBodyText = params.extraBodyText;
	this._msgIds = params.msgIds;
	this._accountName = params.accountName;
	var identity = params.identity = this._getIdentity(msg);

	this._composeMode = params.composeMode || this._getComposeMode(msg, identity, params);

    var cv = this._composeView;
	if (!cv) {
		this.initComposeView();
		cv = this._composeView;
	} else {
		cv.setComposeMode(this._composeMode, true);
	}

	if (identity) {
		this.resetSignature(cv._getSignatureIdForAction(identity, action));
	}

	if (!this.isHidden) {
		this._initializeToolBar();
		this.resetToolbarOperations();
		this._setOptionsMenu(this._composeMode, params.incOptions);
	}
	cv.set(params);

	if (!this.isHidden) {
		this._setOptionsMenu();	// reset now that compose view has figured out the inc options
		appCtxt.notifyZimlets("initializeToolbar", [this._app, this._toolbar, this, this._currentViewId], {waitUntilLoaded:true});
		this._setAddSignatureVisibility();
		if (params.sigId) {
			this.setSelectedSignature(params.sigId);
			this.resetSignature(params.sigId);
		}

		// preserve priority for drafts
		if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
			if (msg && action === ZmOperation.DRAFT) {
				var priority = msg.isHighPriority ? ZmItem.FLAG_HIGH_PRIORITY : msg.isLowPriority ? ZmItem.FLAG_LOW_PRIORITY : "";
				if (priority) {
					this._setPriority(priority);
				}
			}
			else {
				this._setPriority();
			}
		}

		if (params.readReceipt) {
			var menu = this._optionsMenu[action];
			var mi = menu && menu.getOp(ZmOperation.REQUEST_READ_RECEIPT);
			if (mi && this.isReadReceiptEnabled()) {
				mi.setChecked(true, true);
			}
		}
	
		this._setComposeTabGroup();
		if (!params.hideView) {
			this._app.pushView(this._currentViewId);
		}
		if (!appCtxt.isChildWindow) {
			cv.updateTabTitle();
		}
		cv.reEnableDesignMode();

		this._draftMsg = params.draftMsg;
		this._draftType = params.draftType || ZmComposeController.DRAFT_TYPE_NONE;
		if ((this._msgIds || cv._msgAttId) && !appCtxt.isChildWindow) {
			this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO);
		}
		else if (msg && (action == ZmOperation.DRAFT)) {
			this._draftType = ZmComposeController.DRAFT_TYPE_MANUAL;
			if (msg.autoSendTime) {
				this.saveDraft(ZmComposeController.DRAFT_TYPE_MANUAL, null, null, msg.setAutoSendTime.bind(msg));
				this._showMsgDialog(ZmComposeController.MSG_DIALOG_1, ZmMsg.messageAutoSaveAborted);
			}
		}
	}

    cv.checkAttachments();
    this.sendMsgCallback = params.sendMsgCallback;

	if (params.callback) {
		params.callback.run(this);
	}
};

ZmComposeController.prototype._getIdentity =
function(msg) {
	var account = (appCtxt.multiAccounts && appCtxt.getActiveAccount().isMain)
		? appCtxt.accountList.defaultAccount : null;
	var identityCollection = appCtxt.getIdentityCollection(account);
	if (!msg) {
		var ac = window.parentAppCtxt || window.appCtxt;
		var curSearch = ac.getApp(ZmApp.MAIL).currentSearch;
		var folderId = curSearch && curSearch.folderId;
		if (folderId) {
			return identityCollection.selectIdentityFromFolder(folderId);
		}
	} else {
		msg = this._getInboundMsg(msg);
	}
	return (msg && msg.identity) ? msg.identity : identityCollection.selectIdentity(msg);
};

/**
 * find the first message after msg (or msg itself) in the conv, that's inbound (not outbound). This is since inbound ones are
 * relevant to the rules to select identify (such as folder rules, outbound could be in "sent" for example, or "to" address rules)
 *
 * Also, just return the message if it does not have an associated folder - this occurs when a blank message is created in
 * Briefcase, for the 'Send as Attachment' command.
 * @param msg
 * @returns {ZmMailMsg}
 */
ZmComposeController.prototype._getInboundMsg =
function(msg) {
	var folder = appCtxt.getById(msg.folderId);
	if (!folder || !folder.isOutbound()) {
		return msg;
	}
	var conv = appCtxt.getById(msg.cid);
	if (!conv || !conv.msgs) {
		return msg;
	}
	//first find the message in the conv.
	var msgs = conv.msgs.getArray();
	for (var i = 0; i < msgs.length; i++) {
		if (msgs[i].id === msg.id) {
			break;
		}
	}
	//now find the first msg after it that's not outbound
	for (i = i + 1; i < msgs.length; i++) {
		var nextMsg = msgs[i];
		folder = appCtxt.getById(nextMsg.folderId);
		if (!folder.isOutbound()) {
			return nextMsg;
		}
	}
	return msg;
};

ZmComposeController.prototype._initializeToolBar =
function() {

	if (this._toolbar) { return; }
	
	var buttons = [];
	if (this._canSaveDraft() && appCtxt.get(ZmSetting.MAIL_SEND_LATER_ENABLED)) {
		buttons.push(ZmOperation.SEND_MENU);
	} else {
		buttons.push(ZmOperation.SEND);
	}

	buttons.push(ZmOperation.CANCEL, ZmOperation.SEP, ZmOperation.SAVE_DRAFT);

	if (appCtxt.isSpellCheckerAvailable()) {
		buttons.push(ZmOperation.SEP, ZmOperation.SPELL_CHECK);
	}
	buttons.push(ZmOperation.SEP, ZmOperation.COMPOSE_OPTIONS, ZmOperation.FILLER);

	if (appCtxt.get(ZmSetting.DETACH_COMPOSE_ENABLED) && !appCtxt.isChildWindow && !appCtxt.isWebClientOffline()) {
		buttons.push(ZmOperation.DETACH_COMPOSE);
	}

	var tb = this._toolbar = new ZmButtonToolBar({
		parent: this._container,
		buttons: buttons,
		className: (appCtxt.isChildWindow ? "ZmAppToolBar_cw" : "ZmAppToolBar") + " ImgSkin_Toolbar itemToolbar",
		context: this._currentViewId
	});

	for (var i = 0; i < tb.opList.length; i++) {
		var button = tb.opList[i];
		if (this._listeners[button]) {
			tb.addSelectionListener(button, this._listeners[button]);
		}
	}

	if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED) || appCtxt.multiAccounts) {
		var sc = appCtxt.getSignatureCollection();
		sc.addChangeListener(this._signatureChangeListener.bind(this));

		var button = tb.getButton(ZmOperation.ADD_SIGNATURE);
		if (button) {
			button.setMenu(new AjxCallback(this, this._createSignatureMenu));
		}
	}

	var actions = [ZmOperation.NEW_MESSAGE, ZmOperation.REPLY, ZmOperation.FORWARD_ATT, ZmOperation.DECLINE_PROPOSAL, ZmOperation.CAL_REPLY];
	this._optionsMenu = {};
	for (var i = 0; i < actions.length; i++) {
		this._optionsMenu[actions[i]] = this._createOptionsMenu(actions[i]);
	}
	this._optionsMenu[ZmOperation.REPLY_ALL] = this._optionsMenu[ZmOperation.REPLY];
    this._optionsMenu[ZmOperation.CAL_REPLY_ALL] = this._optionsMenu[ZmOperation.CAL_REPLY];
	this._optionsMenu[ZmOperation.FORWARD_INLINE] = this._optionsMenu[ZmOperation.FORWARD_ATT];
	this._optionsMenu[ZmOperation.REPLY_CANCEL] = this._optionsMenu[ZmOperation.REPLY_ACCEPT] =
		this._optionsMenu[ZmOperation.DECLINE_PROPOSAL] = this._optionsMenu[ZmOperation.REPLY_DECLINE] = this._optionsMenu[ZmOperation.REPLY_TENTATIVE] =
		this._optionsMenu[ZmOperation.SHARE] = this._optionsMenu[ZmOperation.DRAFT] =
		this._optionsMenu[ZmOperation.NEW_MESSAGE];

	// change default button style to select for spell check button
	var spellCheckButton = tb.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

	var button = tb.getButton(ZmOperation.SEND_MENU);
	if (button) {
		var menu = new ZmPopupMenu(button, null, null, this);
		var sendItem = menu.createMenuItem(ZmOperation.SEND, ZmOperation.defineOperation(ZmOperation.SEND));
		sendItem.addSelectionListener(this._listeners[ZmOperation.SEND]);
		var sendLaterItem = menu.createMenuItem(ZmOperation.SEND_LATER, ZmOperation.defineOperation(ZmOperation.SEND_LATER));
		sendLaterItem.addSelectionListener(this._listeners[ZmOperation.SEND_LATER]);
		button.setMenu(menu);
	}
};

ZmComposeController.prototype._initAutoSave =
function() {
	if (!this._canSaveDraft()) { return; }
    if (appCtxt.get(ZmSetting.AUTO_SAVE_DRAFT_INTERVAL)) {
        if (!this._autoSaveTimer) {
            this._autoSaveTimer = new DwtIdleTimer(ZmMailApp.AUTO_SAVE_IDLE_TIME * 1000, new AjxCallback(this, this._autoSaveCallback));
        }
        else{
            this._autoSaveTimer.resurrect(ZmMailApp.AUTO_SAVE_IDLE_TIME * 1000);
        }
    }
};

ZmComposeController.prototype._getOptionsMenu =
function() {
	return this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS).getMenu();
};


/**
 * returns the signature button - not exactly a button but a menu item in the options menu, that has a sub-menu attached to it.
 */
ZmComposeController.prototype._getSignatureButton =
function() {
	var menu = this._getOptionsMenu();
	return menu && menu.getItemById(ZmOperation.MENUITEM_ID, ZmOperation.ADD_SIGNATURE);
};

// only show signature submenu if the account has at least one signature
ZmComposeController.prototype._setAddSignatureVisibility =
function(account) {
	var ac = window.parentAppCtxt || window.appCtxt;
	if (!ac.get(ZmSetting.SIGNATURES_ENABLED, null, account)) {
		return;
	}
	
	var button = this._getSignatureButton();
	if (button) {
		var visible = ac.getSignatureCollection(account).getSize() > 0;
		button.setVisible(visible);
		button.parent.cleanupSeparators();
	}
	this._setOptionsVisibility();
};

ZmComposeController.prototype._setOptionsVisibility =
function() {

	var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	var menu = button.getMenu(),
		opList = menu && menu.opList,
		optionsEmpty = !opList || opList.length === 0;

	if (opList && opList.length === 1 && opList[0] === ZmOperation.ADD_SIGNATURE) {
		//this is kinda ugly, special case for the signature menu that is empty. It gets hidden instead of removed so it's still here.
		var sigButton = this._getSignatureButton();
		optionsEmpty = !sigButton.getVisible();
	}
	button.setVisible(!optionsEmpty);
};

ZmComposeController.prototype._createOptionsMenu =
function(action) {

	var isReply = ZmComposeController.IS_REPLY[action];
	var isCalReply = ZmComposeController.IS_CAL_REPLY[action];
	var isInviteReply = ZmComposeController.IS_INVITE_REPLY[action];
	var isForward = ZmComposeController.IS_FORWARD[action];
	var list = [];
    var ac = window.parentAppCtxt || window.appCtxt;
	if (isReply || isCalReply) {
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.SEP);
	}
	if (ac.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		list.push(ZmOperation.FORMAT_HTML, ZmOperation.FORMAT_TEXT, ZmOperation.SEP);
	}
	if (isInviteReply) { // Accept/decline/etc... an appointment invitation
		list.push(ZmOperation.SEP, ZmOperation.INC_NONE, ZmOperation.INC_BODY, ZmOperation.INC_SMART);
	}
	else if (isCalReply) { // Regular reply to an appointment
		list.push(ZmOperation.SEP, ZmOperation.INC_NONE, ZmOperation.INC_BODY, ZmOperation.INC_SMART);
	}
	else if (isReply) { // Message reply
        list.push(ZmOperation.SEP, ZmOperation.INC_NONE, ZmOperation.INC_BODY, ZmOperation.INC_SMART, ZmOperation.INC_ATTACHMENT);
	}
	else if (isForward) { // Message forwarding
        list.push(ZmOperation.SEP, ZmOperation.INC_BODY, ZmOperation.INC_ATTACHMENT);
	}

    if (isReply || isForward || isCalReply) {
        list.push(ZmOperation.SEP, ZmOperation.USE_PREFIX, ZmOperation.INCLUDE_HEADERS);
    }

	if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED)) {
		list.push(ZmOperation.SEP, ZmOperation.ADD_SIGNATURE);
	}

	list.push(ZmOperation.SEP, ZmOperation.SHOW_BCC);

	if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
		list.push(ZmOperation.SEP);
		list.push(ZmOperation.PRIORITY_HIGH);
		list.push(ZmOperation.PRIORITY_NORMAL);
		list.push(ZmOperation.PRIORITY_LOW);
	}

	if (ac.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED, null, ac.getActiveAccount())) {
		list.push(ZmOperation.SEP, ZmOperation.REQUEST_READ_RECEIPT);
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
		if (op == ZmOperation.REPLY || op == ZmOperation.CAL_REPLY) {
			overrides[op].text = ZmMsg.replySender;
		}
	}

	var menu = new ZmActionMenu({parent:button, menuItems:list, overrides:overrides,
								 context:[this._currentViewId, action].join("_")});

	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		var mi = menu.getOp(op);
		if (!mi) { continue; }
		if (op == ZmOperation.FORMAT_HTML) {
			mi.setData(ZmHtmlEditor.VALUE, Dwt.HTML);
		} else if (op == ZmOperation.FORMAT_TEXT) {
			mi.setData(ZmHtmlEditor.VALUE, Dwt.TEXT);
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
    var ac = window.parentAppCtxt || window.appCtxt;

	var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	button.noMenuBar = true;
	button.setToolTipContent(ZmMsg[ZmComposeController.OPTIONS_TT[this._action]], true);
	var menu = this._optionsMenu[this._action];
	if (!menu) { return; }

	if (ac.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		menu.checkItem(ZmHtmlEditor.VALUE, composeMode, true);
	}

	if (ac.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED) || ac.multiAccounts) {
		var mi = menu.getOp(ZmOperation.REQUEST_READ_RECEIPT);
		if (mi) {
			// did this draft have "request read receipt" option set?
			if (this._msg && this._msg.isDraft) {
				mi.setChecked(this._msg.readReceiptRequested);
			} else {
				// bug: 41329 - always re-init read-receipt option to be off
                //read receipt default state will be based on the preference configured
				mi.setChecked(appCtxt.get(ZmSetting.AUTO_READ_RECEIPT_ENABLED), true);
			}

			if (ac.multiAccounts) {
                mi.setEnabled(ac.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED, null, this._composeView.getFromAccount()));
			}
		}
	}

	if (this._action == ZmOperation.REPLY || this._action == ZmOperation.REPLY_ALL  ||
        this._action == ZmOperation.CAL_REPLY || this._action == ZmOperation.CAL_REPLY_ALL) {
		menu.checkItem(ZmOperation.KEY_ID, this._action, true);
	}

	this._setDependentOptions(incOptions);

	var showBcc = appCtxt.get(ZmSetting.SHOW_BCC);
	var mi = menu.getOp(ZmOperation.SHOW_BCC);
	if (mi) {
		mi.setChecked(showBcc);
		this._composeView._recipients._toggleBccField(showBcc);
	}

	button.setMenu(menu);
	this._setOptionsVisibility();
};

ZmComposeController.prototype._setDependentOptions =
function(incOptions) {

	incOptions = incOptions || this._curIncOptions || {};

	var menu = this._optionsMenu[this._action];
	if (!menu) { return; }

	// handle options for what's included
	var what = incOptions.what;
	menu.checkItem(ZmOperation.KEY_ID, ZmComposeController.INC_OP[what], true);
	var allowOptions = (what == ZmSetting.INC_BODY || what == ZmSetting.INC_SMART);
	var mi = menu.getOp(ZmOperation.USE_PREFIX);
	if (mi) {
		mi.setEnabled(allowOptions);
		mi.setChecked(incOptions.prefix, true);
	}
	mi = menu.getOp(ZmOperation.INCLUDE_HEADERS);
	if (mi) {
		mi.setEnabled(allowOptions);
		mi.setChecked(incOptions.headers, true);
	}
	//If we attach multiple messages, disable changing from "include as attachment" to "include original" (inc_body, a.k.a. include inline). Bug 74467
	var incOptionsDisabled = (this._msgIds && this._msgIds.length > 1) || this._origAction === ZmOperation.FORWARD_CONV;
	mi = menu.getOp(ZmOperation.INC_BODY);
	if (mi) {
		mi.setEnabled(!incOptionsDisabled);
	}
	mi = menu.getOp(ZmOperation.INC_ATTACHMENT);
	if (mi) {
		mi.setEnabled(!incOptionsDisabled);
	}
	mi = menu.getOp(ZmOperation.REQUEST_READ_RECEIPT);
	if (mi) {
		var fid = this._msg && this._msg.folderId;
		var ac = window.parentAppCtxt || window.appCtxt;
		var folder = fid ? ac.getById(fid) : null;
		mi.setEnabled(!folder || (folder && !folder.isRemote()));
	}
};

/**
 * Called in multi-account mode, when an account has been changed
 */
ZmComposeController.prototype._resetReadReceipt =
function(newAccount) {
	var menu = this._optionsMenu[this._action];
	var mi = menu && menu.getOp(ZmOperation.REQUEST_READ_RECEIPT);
	if (mi) {
		var isEnabled = appCtxt.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED, null, newAccount);
		if (!isEnabled) {
			mi.setChecked(false, true);
		}
		mi.setEnabled(isEnabled);
	}
};

ZmComposeController.prototype._getComposeMode =
function(msg, identity, params) {

	// depending on COS/user preference set compose format
	var composeMode = Dwt.TEXT;
    var ac = window.parentAppCtxt || window.appCtxt;
	if (ac.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
        if (this._action == ZmOperation.NEW_MESSAGE) {
            if (ac.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML) {
                composeMode = Dwt.HTML;
            }
        } 
		else if (this._action == ZmOperation.DRAFT) {
            if (params && params.isEditAsNew) { //For Edit As New option Bug:73479
                if (ac.get(ZmSetting.COMPOSE_AS_FORMAT) === ZmSetting.COMPOSE_HTML) {
                    composeMode = Dwt.HTML;
                }
            }
            else if (msg && msg.isHtmlMail()) {
                composeMode = Dwt.HTML;
            }
		}
		else if (identity) {
			var sameFormat = ac.get(ZmSetting.COMPOSE_SAME_FORMAT);
			var asFormat = ac.get(ZmSetting.COMPOSE_AS_FORMAT);
			if ((!sameFormat && asFormat == ZmSetting.COMPOSE_HTML) ||  (sameFormat && msg && msg.isHtmlMail())) {
				composeMode = Dwt.HTML;
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
	if (mode === curMode) { return false; }

	var op = (mode === Dwt.HTML) ? ZmOperation.FORMAT_HTML : ZmOperation.FORMAT_TEXT;
	var okCallback = this._formatOkCallback.bind(this, mode);
	var cancelCallback = this._formatCancelCallback.bind(this, curMode);
	//TODO: There shouldn't be a need to warn the user now that we're preserving quoted text and headers.
	//(see bugs 91743 and 92086
	//However since it's the release time, it's safer to keep warning the user.
	//Revisit this after the release.
	if (!this._warnUserAboutChanges(op, okCallback, cancelCallback)) {
		this._composeView.setComposeMode(mode);
		return true;
	}

	return false;
};

/**
 *
 * @return {Boolean} needToPop - whether we need to pop the view
 */
ZmComposeController.prototype._processSendMsg =
function(draftType, msg, resp) {

	this._msgSent = true;
	var isScheduled = draftType == ZmComposeController.DRAFT_TYPE_DELAYSEND;
	var isDraft = (draftType != ZmComposeController.DRAFT_TYPE_NONE && !isScheduled);
	var needToPop = false;
	if (!isDraft) {
		needToPop = true;
		var popped = false;
		if (appCtxt.get(ZmSetting.SHOW_MAIL_CONFIRM)) {
			var confirmController = AjxDispatcher.run("GetMailConfirmController");
			confirmController.showConfirmation(msg, this._currentViewId, this.tabId, this);
			needToPop = false;	// don't pop confirm page
		} else {
			if (appCtxt.isChildWindow && window.parentController) {
				window.onbeforeunload = null;
				if (draftType == ZmComposeController.DRAFT_TYPE_DELAYSEND) {
                    window.parentController.setStatusMsg(ZmMsg.messageScheduledSent);
                }
                else if (!appCtxt.isOffline) { // see bug #29372
					window.parentController.setStatusMsg(ZmMsg.messageSent);
				}
			} else {
				if (draftType == ZmComposeController.DRAFT_TYPE_DELAYSEND) {
					appCtxt.setStatusMsg(ZmMsg.messageScheduledSent);
				} else if (!appCtxt.isOffline) { // see bug #29372
					appCtxt.setStatusMsg(ZmMsg.messageSent);
				}
			}
		}

		if (resp || !appCtxt.get(ZmSetting.SAVE_TO_SENT)) {

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
		}
	} else {
		if (draftType != ZmComposeController.DRAFT_TYPE_AUTO) {
			var transitions = [ ZmToast.FADE_IN, ZmToast.IDLE, ZmToast.PAUSE, ZmToast.FADE_OUT ];
			appCtxt.setStatusMsg(ZmMsg.draftSaved, ZmStatusView.LEVEL_INFO, null, transitions);
		}
		this._draftMsg = msg;
		this._composeView.processMsgDraft(msg);
		// TODO - disable save draft button indicating a draft was saved

		var listController = this._listController; // non child window case
		if (appCtxt.isChildWindow) {
			//Check if Mail App view has been created and then update the MailListController
			if (window.parentAppCtxt.getAppViewMgr().getAppView(ZmApp.MAIL)) {
				listController = window.parentAppCtxt.getApp(ZmApp.MAIL).getMailListController();
			}
		}

		//listController is available only when editing an existing draft.
		if (listController && listController._draftSaved) {
			var savedMsg = appCtxt.isChildWindow ? null : msg;
			var savedResp = appCtxt.isChildWindow ? resp.m[0] : null; //Pass the mail response to the parent window such that the ZmMailMsg obj is created in the parent window.
			listController._draftSaved(savedMsg, savedResp);
		}
	}

	if (isScheduled) {
		if (appCtxt.isChildWindow) {
			var pAppCtxt = window.parentAppCtxt;
			if (pAppCtxt.getAppViewMgr().getAppView(ZmApp.MAIL)) {
				var listController = pAppCtxt.getApp(ZmApp.MAIL).getMailListController();
				if (listController && listController._draftSaved) {
					//Pass the mail response to the parent window such that the ZmMailMsg obj is created in the parent window.
					listController._draftSaved(null, resp.m[0]);
				}
			}
		} else {
			if (this._listController && this._listController._draftSaved) {
				this._listController._draftSaved(msg);
			}
		}
	}
	return needToPop;
};


// Listeners

// Send button was pressed
ZmComposeController.prototype._sendListener =
function(ev) {
	if (!appCtxt.notifyZimlets("onSendButtonClicked", [this, this._msg])) {
	    this._send();
    }
};

ZmComposeController.prototype._send =
function() {
	this._toolbar.enableAll(false); // thwart multiple clicks on Send button
	this._resetDelayTime();
	this.sendMsg();
};

ZmComposeController.prototype._sendLaterListener =
function(ev) {
	this.showDelayDialog();
};

// Cancel button was pressed
ZmComposeController.prototype._cancelListener =
function(ev) {
	this._cancelCompose();
};

ZmComposeController.prototype._cancelCompose = function() {

	var dirty = this._composeView.isDirty(true, true);
    // Prompt the user if compose view is dirty (they may want to save), or if a draft has been
    // auto-saved and they might want to delete it
	var needPrompt = dirty || (this._draftType === ZmComposeController.DRAFT_TYPE_AUTO);
    this._composeView.enableInputs(!needPrompt);
	this._composeView.reEnableDesignMode();
	this._app.popView(!needPrompt);
};

// Attachment button was pressed
ZmComposeController.prototype._attachmentListener =
function(isInline) {
	var type =
		isInline ? ZmComposeView.UPLOAD_INLINE : ZmComposeView.UPLOAD_COMPUTER;
	this._composeView.showAttachmentDialog(type);
};

ZmComposeController.prototype._optionsListener =
function(ev) {

	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op === ZmOperation.REQUEST_READ_RECEIPT) {
		return;
	}

	// Click on "Options" button.
	if (op === ZmOperation.COMPOSE_OPTIONS && this._optionsMenu[this._action]) {
		var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
		var bounds = button.getBounds();
		this._optionsMenu[this._action].popup(0, bounds.x, bounds.y + bounds.height, false);
		return;
	}

	// ignore UNCHECKED for radio buttons
	if (ev.detail !== DwtMenuItem.CHECKED && !ZmComposeController.OP_CHECK[op]) {
		return;
	}

	if (op === ZmOperation.REPLY || op === ZmOperation.REPLY_ALL || op === ZmOperation.CAL_REPLY || op === ZmOperation.CAL_REPLY_ALL) {
		var cv = this._composeView;
		cv.setAddress(AjxEmailAddress.TO, "");
		cv.setAddress(AjxEmailAddress.CC, "");
		cv._setAddresses(op, AjxEmailAddress.TO, this._toOverride);
		if (this._ccOverride && (op === ZmOperation.REPLY_ALL || op === ZmOperation.CAL_REPLY_ALL)) {
			cv._setAddresses(op, AjxEmailAddress.CC, this._ccOverride);
		}
	}
	else if (op === ZmOperation.FORMAT_HTML || op === ZmOperation.FORMAT_TEXT) {
        if (op === ZmOperation.FORMAT_TEXT && this._msg) {
            this._msg._resetAllInlineAttachments();
        }
		this._setFormat(ev.item.getData(ZmHtmlEditor.VALUE));
	}
	else if (op === ZmOperation.SHOW_BCC) {
		this._composeView._recipients._toggleBccField();
		appCtxt.set(ZmSetting.SHOW_BCC, !appCtxt.get(ZmSetting.SHOW_BCC));
	}
	else if (ZmComposeController.INC_MAP[op] || op === ZmOperation.USE_PREFIX || op === ZmOperation.INCLUDE_HEADERS) {
		// user is changing include options
		if (this._setInclude(op)) {
			this._switchInclude(op);
			this._setDependentOptions();
		}
	}
};

ZmComposeController.prototype._setInclude =
function(op) {

	// Only give warning if user has typed text that can't be preserved
	var okCallback = this._switchIncludeOkCallback.bind(this, op);
	var cancelCallback = this._switchIncludeCancelCallback.bind(this, AjxUtil.hashCopy(this._curIncOptions));
	return (!this._warnUserAboutChanges(op, okCallback, cancelCallback));
};

/**
 * Returns the priority flag corresponding to the currently selected priority option.
 *
 * @returns {string}
 * @private
 */
ZmComposeController.prototype._getPriority = function() {

	var menu = this._optionsMenu[this._action],
		map = ZmComposeController.PRIORITY_FLAG_TO_OP;

	for (var flag in map) {
		var op = map[flag],
			mi = menu && menu.getOp(op);
		if (mi && mi.getChecked()) {
			return flag;
		}
	}

	return "";
};

/**
 * Sets the priority option in the options menu that corresponds to the given priority flag.
 *
 * @param {String}  priority        ZmItem.FLAG_*_PRIORITY
 * @private
 */
ZmComposeController.prototype._setPriority = function(priority) {

	var op = priority ? ZmComposeController.PRIORITY_FLAG_TO_OP[priority] : ZmOperation.PRIORITY_NORMAL,
		menu = this._optionsMenu[this._action],
		mi = menu && menu.getOp(op);

	if (mi) {
		mi.setChecked(true, true);
	}
};

ZmComposeController.prototype._switchInclude = function(op) {

	var menu = this._optionsMenu[this._action],
        cv = this._composeView;

	if (op === ZmOperation.USE_PREFIX || op === ZmOperation.INCLUDE_HEADERS) {
		var mi = menu.getOp(op);
		if (mi) {
			if (op === ZmOperation.USE_PREFIX) {
				this._curIncOptions.prefix = mi.getChecked();
			}
            else {
				this._curIncOptions.headers = mi.getChecked();
			}
		}
	}
    else if (ZmComposeController.INC_MAP[op]) {
        if (this._curIncOptions.what === ZmSetting.INC_ATTACH) {
            cv.removeOrigMsgAtt();
        }
		this._curIncOptions.what = ZmComposeController.INC_MAP[op];
	}

	var cv = this._composeView;
	if (op != ZmOperation.FORMAT_HTML && op != ZmOperation.FORMAT_TEXT) {
		if (cv._composeMode == Dwt.TEXT) {
			AjxTimedAction.scheduleAction(new AjxTimedAction(this, function() { cv.getHtmlEditor().moveCaretToTop(); }), 200);
		}
	}    

	// forwarding actions are tied to inc option
	var what = this._curIncOptions.what;
	if (this._action == ZmOperation.FORWARD_INLINE && what == ZmSetting.INC_ATTACH) {
		this._action = ZmOperation.FORWARD_ATT;
	}
	if (this._action == ZmOperation.FORWARD_ATT && what != ZmSetting.INC_ATTACH) {
		this._action = ZmOperation.FORWARD_INLINE;
	}

	var params = {
		action:			    this._action,
		msg:			    this._msg,
		extraBodyText:	    this._composeView.getUserText(),
		op:				    op,
        keepAttachments:    true
	};
	this._composeView.resetBody(params);
	if (op === ZmOperation.INC_ATTACHMENT) {
		this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO);
	}
};

ZmComposeController.prototype._detachListener =
function(ev) {
	if (!appCtxt.isWebClientOffline()) {
		var atts = this._composeView.getAttFieldValues();
		if (atts.length) {
			this._showMsgDialog(ZmComposeController.MSG_DIALOG_2, ZmMsg.importErrorUpload, null, this._detachCallback.bind(this));
		} else {
			this.detach();
		}
	}
};

// Save Draft button was pressed
ZmComposeController.prototype._saveDraftListener =
function(ev) {
	this.saveDraft();
};

ZmComposeController.prototype._autoSaveCallback =
function(idle) {
    DBG.println('draft', 'DRAFT autosave check from ' + this._currentViewId);
    if (idle && !DwtBaseDialog.getActiveDialog() && !this._composeView.getHtmlEditor().isSpellCheckMode() && this._composeView.isDirty(true, true)) {
		this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO);
	}
};

ZmComposeController.prototype.saveDraft =
function(draftType, attId, docIds, callback, contactId) {

	if (!this._canSaveDraft()) { return; }

	this._wasDirty = this._composeView._isDirty;
	this._composeView._isDirty = false;
	draftType = draftType || ZmComposeController.DRAFT_TYPE_MANUAL;
	var respCallback = this._handleResponseSaveDraftListener.bind(this, draftType, callback);
	this._resetDelayTime();
	if (!docIds) {
        DBG.println('draft', 'SAVE DRAFT for ' + this.getCurrentViewId() + ', type is ' + draftType);
		this.sendMsg(attId, draftType, respCallback, contactId);
	} else {
		this.sendDocs(docIds, draftType, respCallback, contactId);
	}
};

ZmComposeController.prototype._handleResponseSaveDraftListener =
function(draftType, callback, result) {
	if (draftType == ZmComposeController.DRAFT_TYPE_AUTO &&
		this._draftType == ZmComposeController.DRAFT_TYPE_NONE) {
		this._draftType = ZmComposeController.DRAFT_TYPE_AUTO;
	} else if (draftType == ZmComposeController.DRAFT_TYPE_MANUAL) {
		this._draftType = ZmComposeController.DRAFT_TYPE_MANUAL;
	}
//	this._action = ZmOperation.DRAFT;
    // Notify the htmlEditor that the draft has been saved and is not dirty any more.
    this._composeView._htmlEditor.clearDirty();
	if (draftType === ZmComposeController.DRAFT_TYPE_MANUAL) {
		this._setCancelText(ZmMsg.close)
	}

	if (callback) {
		callback.run(result);
	}
};

ZmComposeController.prototype._spellCheckListener = function(ev) {

	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	var htmlEditor = this._composeView.getHtmlEditor();

    if (spellCheckButton) {
        if (spellCheckButton.isToggled()) {
            var callback = this.toggleSpellCheckButton.bind(this);
            if (!htmlEditor.spellCheck(callback)) {
                this.toggleSpellCheckButton(false);
            }
        } else {
            htmlEditor.discardMisspelledWords();
        }
    }
};

ZmComposeController.prototype.showDelayDialog =
function() {
	if (!this._delayDialog) {
		this._delayDialog = new ZmTimeDialog({parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
		this._delayDialog.setButtonListener(DwtDialog.OK_BUTTON, this._handleDelayDialog.bind(this));
	}
	this._delayDialog.popup();
};

ZmComposeController.prototype._handleDelayDialog =
function() {
	this._delayDialog.popdown();
	var time = this._delayDialog.getValue(); //Returns {date: Date, timezone: String (see AjxTimezone)}

	var date = time.date;
	var dateOffset = AjxTimezone.getOffset(AjxTimezone.getClientId(time.timezone), date);
	var utcDate = new Date(date.getTime() - dateOffset*60*1000);

	var now = new Date();
	var nowOffset = AjxTimezone.getOffset(AjxTimezone.DEFAULT_RULE, now);
	var utcNow = new Date(now.getTime() - nowOffset*60*1000);

    if(!this._delayDialog.isValidDateStr()){
        this.showInvalidDateDialog();
    }
	else if (utcDate < utcNow) {
		this.showDelayPastDialog();
	} else {
		this._toolbar.enableAll(false); // thwart multiple clicks on Send button
		this._sendTime = time;
		this.sendMsg(null, ZmComposeController.DRAFT_TYPE_DELAYSEND, null);
	}
};

ZmComposeController.prototype.showDelayPastDialog =
function() {
	this._showMsgDialog(ZmComposeController.MSG_DIALOG_2, ZmMsg.sendLaterPastError, null, this._handleDelayPastDialog.bind(this));
};

ZmComposeController.prototype.showInvalidDateDialog =
function() {
	this._showMsgDialog(ZmComposeController.MSG_DIALOG_1, ZmMsg.invalidDateFormat, DwtMessageDialog.CRITICAL_STYLE, this._handleInvalidDateDialog.bind(this));
};

ZmComposeController.prototype._handleInvalidDateDialog =
function() {
	this._currentDlg.popdown();
    this._sendLaterListener();
}

ZmComposeController.prototype._handleDelayPastDialog =
function() {
	this._currentDlg.popdown();
	this._send();
};

ZmComposeController.prototype._resetDelayTime =
function() {
	this._sendTime = null;
};

// Callbacks

ZmComposeController.prototype._detachCallback =
function() {
	// get rid of any lingering attachments since they cannot be detached
	this._composeView.cleanupAttachments();
	this._currentDlg.popdown();
	this.detach();
};

ZmComposeController.prototype._formatOkCallback =
function(mode) {
	this._currentDlg.popdown();
	this._composeView.setComposeMode(mode);
	this._composeView._isDirty = true;
};

ZmComposeController.prototype._formatCancelCallback =
function(mode) {
	this._currentDlg.popdown();

	// reset the radio button for the format button menu
	var menu = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS).getMenu();
	menu.checkItem(ZmHtmlEditor.VALUE, mode, true);

	this._composeView.reEnableDesignMode();
};

/**
 * Called as: Yes, save as draft
 * 			  Yes, go ahead and leave compose
 * 			  Yes, keep the auto-saved draft (view is dirty, new draft will be saved)
 *
 * @param mailtoParams		[Object]*	Used by offline client to pass on mailto handler params
 */
ZmComposeController.prototype._popShieldYesCallback = function(mailtoParams) {

	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._composeView.enableInputs(true);
	if (this._canSaveDraft()) {
		// save as draft
		var callback = mailtoParams ? this.doAction.bind(this, mailtoParams) : this._popShieldYesDraftSaved.bind(this);
		this._resetDelayTime();
		this.sendMsg(null, ZmComposeController.DRAFT_TYPE_MANUAL, callback);
	}
    else {
		// cancel
		if (appCtxt.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
		}
		if (mailtoParams) {
			this.doAction(mailtoParams);
		}
        else {
            this._dontSavePreHide = true;
			appCtxt.getAppViewMgr().showPendingView(true);
		}
	}
};

ZmComposeController.prototype._popShieldYesDraftSaved =
function() {
	appCtxt.getAppViewMgr().showPendingView(true);
};

/**
 * Called as: No, don't save as draft
 * 			  No, don't leave compose
 * 			  Yes, keep the auto-saved draft (view is not dirty, no need to save again)
 *
 * @param mailtoParams		[Object]*	Used by offline client to pass on mailto handler params
 */
ZmComposeController.prototype._popShieldNoCallback = function(mailtoParams) {

	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._composeView.enableInputs(true);
    this._dontSavePreHide = true;

	if (this._canSaveDraft()) {
		if (appCtxt.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
		}
		if (!mailtoParams) {
			appCtxt.getAppViewMgr().showPendingView(true);
		}
	}
    else {
		if (!mailtoParams) {
			appCtxt.getAppViewMgr().showPendingView(false);
		}
		this._composeView.reEnableDesignMode();
	}

	if (mailtoParams) {
		this.doAction(mailtoParams);
	}
};

// Called as: No, do not keep the auto-saved draft
ZmComposeController.prototype._popShieldDiscardCallback =
function() {
	this._deleteDraft(this._draftMsg);
	this._popShieldNoCallback();
};

// Called as: I changed my mind, just make the pop shield go away
ZmComposeController.prototype._popShieldDismissCallback =
function() {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._cancelViewPop();
	this._initAutoSave(); //re-init autosave since it was killed in preHide
	
};

ZmComposeController.prototype._switchIncludeOkCallback =
function(op) {
	this._currentDlg.popdown();
	this._switchInclude(op);
	this._setDependentOptions();
};

ZmComposeController.prototype._switchIncludeCancelCallback =
function(origIncOptions) {
	this._currentDlg.popdown();
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
		return this._composeView.getAddrInputField(AjxEmailAddress.TO);
	}

	return (this._composeView.getComposeMode() == Dwt.TEXT)
		? this._composeView._bodyField
		: this._composeView._htmlEditor;
};

ZmComposeController.prototype._createSignatureMenu =
function(button, account) {
	if (!this._composeView) { return null; }

	var button = this._getSignatureButton();
	if (!button) { return null; }

	var menu;
	var options = appCtxt.getSignatureCollection(account).getSignatureOptions();
	if (options.length > 0) {
		menu = new DwtMenu({parent:button});
		var listener = this._handleSelectSignature.bind(this);
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
	var button = this._getSignatureButton();
	if (!button) {
		return;
	}
	var previousMenu = button.getMenu();
	previousMenu &&	previousMenu.dispose();

	var menu = this._createSignatureMenu(null, account);
	if (menu) {
		button.setMenu(menu);
		this.setSelectedSignature(selected || "");
	}

	this._setAddSignatureVisibility(account);
};

ZmComposeController.prototype.resetToolbarOperations =
function() {
	if (this.isHidden) { return; }
	this._toolbar.enableAll(true);
	if (ZmComposeController.IS_INVITE_REPLY[this._action]) {
		var ops = [ ZmOperation.SAVE_DRAFT, ZmOperation.ATTACHMENT ];
		this._toolbar.enable(ops, false);
        this._composeView.enableAttachButton(false);
	} else {
        this._composeView.enableAttachButton(true);
    }

	this._setCancelText(this._action === ZmId.OP_DRAFT ? ZmMsg.close : ZmMsg.cancel);

	appCtxt.notifyZimlets("resetToolbarOperations", [this._toolbar, 1]);
};

ZmComposeController.prototype._setCancelText =
function(text) {
	var cancel = this._toolbar.getButton(ZmOperation.CANCEL);
	cancel.setText(text);
};

ZmComposeController.prototype._canSaveDraft =
function() {
	return !this.isHidden && appCtxt.get(ZmSetting.SAVE_DRAFT_ENABLED) && !ZmComposeController.IS_INVITE_REPLY[this._action];
};

/*
 * Return true/false if read receipt is being requested
 */
ZmComposeController.prototype.isRequestReadReceipt =
function(){

  	// check for read receipt
	var requestReadReceipt = false;
    var isEnabled = this.isReadReceiptEnabled();
	if (isEnabled) {
		var menu = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS).getMenu();
		if (menu) {
			var mi = menu.getItemById(ZmOperation.KEY_ID, ZmOperation.REQUEST_READ_RECEIPT);
			requestReadReceipt = (!!(mi && mi.getChecked()));
		}
	}

    return requestReadReceipt;
};

/*
 * Return true/false if read receipt is enabled
 */
ZmComposeController.prototype.isReadReceiptEnabled =
function(){
    var acctName = appCtxt.multiAccounts
		? this._composeView.getFromAccount().name : this._accountName;
    var acct = acctName && appCtxt.accountList.getAccountByName(acctName);
    if (appCtxt.get(ZmSetting.MAIL_READ_RECEIPT_ENABLED, null, acct)){
        return true;
    }

    return false;
};

/**
 * Return ZmMailMsg object
 * @return {ZmMailMsg} message object
 */
ZmComposeController.prototype.getMsg =
function(){
    return this._msg;
};

ZmComposeController.prototype._processImages =
function(callback){

    var idoc = this._composeView._getIframeDoc();//editor iframe document
    if (!idoc) {
        return;
    }

    var imgArray = idoc.getElementsByTagName("img"),
        length = imgArray.length;
    if (length === 0) {//No image elements in the editor document
        return;
    }

    var isWebkitFakeURLImage = false;
    for (var i = 0; i < length; i++) {
        var img = imgArray[i],
            imgSrc = img.src;

        if (imgSrc && imgSrc.indexOf("webkit-fake-url://") === 0) {
            img.parentNode.removeChild(img);
            length--;
            i--;
            isWebkitFakeURLImage = true;
        }
    }

    if (isWebkitFakeURLImage) {
        appCtxt.setStatusMsg(ZmMsg.invalidPastedImages);
        if (length === 0) {//No image elements in the editor document
            return;
        }
    }

    return this._processDataURIImages(imgArray, length, callback);
};

ZmComposeController.prototype._processDataURIImages =
function (imgArray, length, callback) {

    if ( !(typeof window.atob === "function" && typeof window.Blob === "function") || appCtxt.isWebClientOffline()) {
        return;
    }

    for (var i = 0, blobArray = []; i < length; i++) {
        var img = imgArray[i];
        if (img) {
            var imgSrc = img.src;
            if (imgSrc && imgSrc.indexOf("data:") !== -1) {
                var blob = AjxUtil.dataURItoBlob(imgSrc);
                if (blob) {
                    //setting data-zim-uri attribute for image replacement in callback
                    var id = Dwt.getNextId();
                    img.setAttribute("id", id);
                    img.setAttribute("data-zim-uri", id);
                    blob.id = id;
                    blobArray.push(blob);
                }
            }
        }
    }

    length = blobArray.length;
    if (length === 0) {
        return;
    }

    this._uploadedImageArray = [];
    this._dataURIImagesLength = length;

    for (i = 0; i < length; i++) {
        var blob = blobArray[i];
        var uploadImageCallback = this._handleUploadImage.bind(this, callback, blob.id);
        this._uploadImage(blob, uploadImageCallback);
    }
    return true;
};

ZmComposeController.prototype._initUploadMyComputerFile =
function(files) {
    if (appCtxt.isWebClientOffline()) {
        return this._handleOfflineUpload(files);
    } else {
        var curView = this._composeView;
        if (curView) {
            var params = {
				attachment:            true,
                files:                 files,
                notes:                 "",
                allResponses:          null,
                start:                 0,
                curView:               this._composeView,
                preAllCallback:        this._preUploadAll.bind(this),
                initOneUploadCallback: curView._startUploadAttachment.bind(curView),
                errorCallback:         curView._resetUpload.bind(curView, true),
                completeOneCallback:   curView.updateAttachFileNode.bind(curView),
                completeAllCallback:   this._completeAllUpload.bind(this)
            }
			params.progressCallback =  curView._uploadFileProgress.bind(curView, params);


			// Do a SaveDraft at the start, since we will suppress autosave during the upload
            var uploadManager = appCtxt.getZmUploadManager();
            var uploadCallback = uploadManager.upload.bind(uploadManager, params);
            this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, null, null, uploadCallback);
        }
    }
};

ZmComposeController.prototype._preUploadAll =
function(fileName) {
    var curView = this._composeView;
    if (!curView) {
        return;
    }
    curView._initProgressSpan(fileName);
    // Disable autosave while uploading
    if (this._autoSaveTimer) {
        this._autoSaveTimer.kill();
    }
};

ZmComposeController.prototype._completeAllUpload =
function(allResponses) {
    var curView = this._composeView;
    if (!curView){
        return;
    }
    var callback = curView._resetUpload.bind(curView);
    // Init autosave, otherwise saveDraft thinks this is a suppressed autosave, and aborts w/o saving
    this._initAutoSave();
    this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, this._syncPrevData(allResponses), null, callback);
}

ZmComposeController.prototype._syncPrevData =
function(attaData){
    var result = []
    for (var i=0;i < attaData.length  ; i++){
        if (attaData[i] && (i === attaData.length -1 || document.getElementById(attaData[i].aid))){
            result.push(attaData[i]);
        }
    }

    return result;
};

ZmComposeController.prototype._uploadImage = function(blob, callback, errorCallback){
    var req = new XMLHttpRequest();
    req.open("POST", appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw", true);
    req.setRequestHeader("Cache-Control", "no-cache");
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.setRequestHeader("Content-Type", blob.type);
    req.setRequestHeader("Content-Disposition", 'attachment; filename="' + AjxUtil.convertToEntities(blob.name) + '"');
    if (window.csrfToken) {
        req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken);
    }
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var resp = eval("["+req.responseText+"]");
                callback.run(resp[2]);
            }
            else {
                errorCallback && errorCallback();
            }
        }
    };
    req.send(blob);
};

ZmComposeController.prototype._handleUploadImage = function(callback, id, response){
    this._dataURIImagesLength--;
    var uploadedImageArray = this._uploadedImageArray;
    if( response && id ){
        response[0]["id"] = id;
        uploadedImageArray.push(response[0]);
    }
    if( this._dataURIImagesLength === 0 && callback ){
        if( uploadedImageArray.length > 0 && callback.args ){
            uploadedImageArray.clipboardPaste = true;
            if(callback.args[0]){  //attid argument of _sendMsg method
                callback.args[0] = callback.args[0].concat(uploadedImageArray);
            }
            else{
                callback.args[0] = uploadedImageArray;
            }
        }
        callback.run();
        delete this._uploadedImageArray;
        delete this._dataURIImagesLength;
    }
};

ZmComposeController.prototype._warnUserAboutChanges =
function(op, okCallback, cancelCallback) {

	var cv = this._composeView;
	var switchToText = (op === ZmOperation.FORMAT_TEXT &&
	                    !AjxUtil.isEmpty(this._getBodyContent()));
	var willLoseChanges = cv.componentContentChanged(ZmComposeView.BC_SIG_PRE) ||
						  cv.componentContentChanged(ZmComposeView.BC_DIVIDER) ||
						  cv.componentContentChanged(ZmComposeView.BC_HEADERS) ||
						  cv.componentContentChanged(ZmComposeView.BC_SIG_POST) ||
						  !cv.canPreserveQuotedText(op) ||
						  switchToText;
	if (willLoseChanges) {
		var callbacks = {};
		callbacks[DwtDialog.OK_BUTTON] = okCallback;
		callbacks[DwtDialog.CANCEL_BUTTON] = cancelCallback;
		var msg = (willLoseChanges && switchToText) ? ZmMsg.switchIncludeAndFormat : 
				willLoseChanges ? ZmMsg.switchIncludeWarning : ZmMsg.switchToText;
		this._showMsgDialog(ZmComposeController.MSG_DIALOG_2, msg, null, callbacks);
		return true;
	}

	return false;
};

ZmComposeController.prototype._showMsgDialog =
function(dlgType, msg, style, callbacks) {

	var ac = window.appCtxt;
	var dlg = this._currentDlg = (dlgType === ZmComposeController.MSG_DIALOG_1) ? ac.getMsgDialog() :
								 (dlgType === ZmComposeController.MSG_DIALOG_2) ? ac.getOkCancelMsgDialog() : ac.getYesNoCancelMsgDialog();
	dlg.reset();
	if (msg) {
		dlg.setMessage(msg, style || DwtMessageDialog.WARNING_STYLE);
	}
	if (callbacks) {
		if (typeof callbacks === "function") {
			var cb = {};
			cb[DwtDialog.OK_BUTTON] = callbacks;
			callbacks = cb;
		}
		for (var buttonId in callbacks) {
			dlg.registerCallback(buttonId, callbacks[buttonId]);
		}
	}
	dlg.popup();
};

ZmComposeController.prototype._handleOfflineUpload =
function(files) {
    var callback = this._readFilesAsDataURLCallback.bind(this);
    ZmComposeController.readFilesAsDataURL(files, callback);
};

/**
 * Read files in DataURL Format and execute the callback with param dataURLArray.
 *
 * dataURLArray is an array of objects, with each object containing name, type, size and data in data-url format for an file.
 *
 * @param {FileList} files                  Object containing one or more files
 * @param {AjxCallback/Bound} callback	    the success callback
 * @param {AjxCallback/Bound} errorCallback the error callback
 *
 * @public
 */
ZmComposeController.readFilesAsDataURL =
function(files, callback, errorCallback) {
    var i = 0,
        filesLength = files.length,
        dataURLArray = [],
        fileReadErrorCount = 0;

    if (!window.FileReader || filesLength === 0) {
        if (errorCallback) {
            errorCallback.run(dataURLArray, fileReadErrorCount);
        }
        return;
    }

    for (; i < filesLength; i++) {

        var file = files[i],
            reader = new FileReader();

        reader.onload = function(file, ev) {
            dataURLArray.push(
                {
                    filename : file.name,
                    ct : file.type,
                    s : file.size,
                    data : ev.target.result,
                    aid : new Date().getTime().toString(),
                    isOfflineUploaded : true
                }
            );
        }.bind(null, file);

        reader.onerror = function() {
            fileReadErrorCount++;
        };

        //Called when the read is completed, whether successful or not. This is called after either onload or onerror.
        reader.onloadend = function() {
            if ((dataURLArray.length + fileReadErrorCount) === filesLength) {
                if (fileReadErrorCount > 0 && errorCallback) {
                    errorCallback.run(dataURLArray, fileReadErrorCount);
                }
                if (callback) {
                    callback.run(dataURLArray, fileReadErrorCount);
                }
            }
        };

        reader.readAsDataURL(file);
    }
};

ZmComposeController.prototype._readFilesAsDataURLCallback =
function(filesArray) {
    for (var j = 0; j < filesArray.length; j++) {
        var file = filesArray[j];
        if (file) {
            appCtxt.cacheSet(file.aid, file);
        }
    }
    var curView = this._composeView,
        callback = curView._resetUpload.bind(curView);
    this.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, filesArray, null, callback);
};
