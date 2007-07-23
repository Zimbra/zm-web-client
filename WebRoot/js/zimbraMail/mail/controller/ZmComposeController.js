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
* Creates a new compose controller to manage message composition.
* @constructor
* @class
* This class manages message composition.
*
* @author Conrad Damon
* @param appCtxt		the application context
* @param container		the containing element
* @param mailApp		a handle to the mail application
*/
ZmComposeController = function(appCtxt, container, mailApp) {

	ZmController.call(this, appCtxt, container, mailApp);

	this._action = null;

	// settings whose changes affect us (so we add a listener to them)
	ZmComposeController.SETTINGS = [ZmSetting.SHOW_BCC];

	// radio groups for options items
	ZmComposeController.RADIO_GROUP = {};
	ZmComposeController.RADIO_GROUP[ZmOperation.REPLY]			= 1;
	ZmComposeController.RADIO_GROUP[ZmOperation.REPLY_ALL]		= 1;
	ZmComposeController.RADIO_GROUP[ZmOperation.FORMAT_HTML]	= 2;
	ZmComposeController.RADIO_GROUP[ZmOperation.FORMAT_TEXT]	= 2;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_ATTACHMENT]	= 3;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_NO_PREFIX]	= 3;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_NONE]		= 3;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_PREFIX]		= 3;
	ZmComposeController.RADIO_GROUP[ZmOperation.INC_SMART]		= 3;

	// translate between include preferences and operations
	ZmComposeController.INC_OP = {};
	ZmComposeController.INC_OP[ZmSetting.INCLUDE_ATTACH]	= ZmOperation.INC_ATTACHMENT;
	ZmComposeController.INC_OP[ZmSetting.INCLUDE]			= ZmOperation.INC_NO_PREFIX;
	ZmComposeController.INC_OP[ZmSetting.INCLUDE_NONE]		= ZmOperation.INC_NONE;
	ZmComposeController.INC_OP[ZmSetting.INCLUDE_PREFIX]	= ZmOperation.INC_PREFIX;
	ZmComposeController.INC_OP[ZmSetting.INCLUDE_SMART]		= ZmOperation.INC_SMART;
	ZmComposeController.INC_MAP = {};
	for (var i in ZmComposeController.INC_OP)
		ZmComposeController.INC_MAP[ZmComposeController.INC_OP[i]] = i;
	delete i;

	ZmComposeController.OPTIONS_TT = {};
	ZmComposeController.OPTIONS_TT[ZmOperation.NEW_MESSAGE]		= "composeOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.REPLY]			= "replyOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.REPLY_ALL]		= "replyOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.FORWARD_ATT]		= "forwardOptions";
	ZmComposeController.OPTIONS_TT[ZmOperation.FORWARD_INLINE]	= "forwardOptions";

	this._listeners = {};
	this._listeners[ZmOperation.SEND] = new AjxListener(this, this._sendListener);
	this._listeners[ZmOperation.IM] = new AjxListener(this, this._imListener);
	this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancelListener);
	this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._attachmentListener);
	this._listeners[ZmOperation.DETACH_COMPOSE] = new AjxListener(this, this._detachListener);
	this._listeners[ZmOperation.SAVE_DRAFT] = new AjxListener(this, this._saveDraftListener);
	this._listeners[ZmOperation.ADD_SIGNATURE] = new AjxListener(this, this._addSignatureListener);
	this._listeners[ZmOperation.SPELL_CHECK] = new AjxListener(this, this._spellCheckListener);
	this._listeners[ZmOperation.COMPOSE_OPTIONS] = new AjxListener(this, this._optionsListener);

	this._dialogPopdownListener = new AjxListener(this, this._dialogPopdownActionListener);

	var settings = this._appCtxt.getSettings();
	var scl = this._settingsChangeListener = new AjxListener(this, this._settingsChangeListener);
	for (var i = 0; i < ZmComposeController.SETTINGS.length; i++) {
		settings.getSetting(ZmComposeController.SETTINGS[i]).addChangeListener(scl);
	}
};

ZmComposeController.prototype = new ZmController();
ZmComposeController.prototype.constructor = ZmComposeController;

ZmComposeController.prototype.toString =
function() {
	return "ZmComposeController";
};

// Public methods

/**
* Called by ZmNewWindow.unload to remove ZmSettings listeners (which reside in
* the parent window). Otherwise, after the child window is closed, the parent
* window is still referencing the child window's compose controller, which has
* been unloaded!!
*/
ZmComposeController.prototype.dispose =
function() {
	var settings = this._appCtxt.getSettings();
	for (var i = 0; i < ZmComposeController.SETTINGS.length; i++) {
		settings.getSetting(ZmComposeController.SETTINGS[i]).removeChangeListener(this._settingsChangeListener);
	}
	this._composeView._dispose();
};

/**
 * Begins a compose session by presenting a form to the user.
 *
 * @param action		[constant]		new message, reply, forward, or an invite action
 * @param inNewWindow	[boolean]*		if true, we are in detached window
 * @param msg			[ZmMailMsg]*	the original message (reply/forward), or address (new message)
 * @param toOverride 	[string]*		initial value for To: field
 * @param subjOverride 	[string]*		initial value for Subject: field
 * @param extraBodyText [string]*		canned text to prepend to body (invites)
 * @param callback		[AjxCallback]*	callback to run after view has been set
 * @param accountName	[string]*		on-behalf-of From address
 */
ZmComposeController.prototype.doAction =
function(params) {
	if (params.inNewWindow) {
		var newWinObj = this._appCtxt.getNewWindow();

		// this is how child window knows what to do once loading:
		newWinObj.command = "compose";
		newWinObj.params = params;
	} else {
		this._setView(params);
	}
	if (params.callback) {
		params.callback.run();
	}
};

ZmComposeController.prototype.toggleSpellCheckButton =
function(selected) {
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setSelected((selected || false));
};

/**
* Detaches compose view to child window
*/
ZmComposeController.prototype.detach =
function() {
	// bug fix #7192 - disable detach toolbar button
	this._toolbar.enable(ZmOperation.DETACH_COMPOSE, false);

	var msg = this._composeView.getOrigMsg();
	var addrs = this._composeView.getRawAddrFields();
	var subj = this._composeView._subjectField.value;
	var forAttHtml = this._composeView.getForwardLinkHtml();
	var body = this._composeView.getHtmlEditor().getContent();
	var composeMode = this._composeView.getComposeMode();
	var identityId = this._composeView.getIdentity().id;
	var backupForm = this._composeView.backupForm;
	var sendUID = this._composeView.getSendUID();

	// this is how child window knows what to do once loading:
	var newWinObj = this._appCtxt.getNewWindow();
	newWinObj.command = "composeDetach";
	newWinObj.params = {action:this._action, msg:msg, addrs:addrs, subj:subj, forwardHtml:forAttHtml, body:body,
					  composeMode:composeMode, identityId:identityId, accountName:this._accountName,
					  backupForm:backupForm, sendUID:sendUID, msgIds:this._msgIds, forAttIds:this._forAttIds};
};

ZmComposeController.prototype.popShield =
function() {
	if (!this._composeView.isDirty()) {
		return true;
	}

	var ps = this._popShield = this._appCtxt.getYesNoCancelMsgDialog();
	if (this._appCtxt.get(ZmSetting.SAVE_DRAFT_ENABLED)) {
		ps.reset();
		ps.setMessage(ZmMsg.askSaveDraft, DwtMessageDialog.WARNING_STYLE);
		ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
		ps.registerCallback(DwtDialog.CANCEL_BUTTON, this._popShieldDismissCallback, this);
	} else {
		ps.setMessage(ZmMsg.askLeaveCompose, DwtMessageDialog.WARNING_STYLE);
		ps.registerCallback(DwtDialog.YES_BUTTON, this._popShieldYesCallback, this);
		ps.registerCallback(DwtDialog.NO_BUTTON, this._popShieldNoCallback, this);
	}
	ps.addPopdownListener(this._dialogPopdownListener);
	ps.popup(this._composeView._getDialogXY());

	return false;
};

// We don't call ZmController._preHideCallback here because it saves
// the current focus member, and we want to start over each time
ZmComposeController.prototype._preHideCallback =
function(view, force) {
	return force ? true : this.popShield();
};

ZmComposeController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	var composeMode = this._composeView.getComposeMode();
	if (composeMode == DwtHtmlEditor.HTML) {
		this._composeView._retryHtmlEditorFocus();
	}
	if (this._action != ZmOperation.NEW_MESSAGE &&
		this._action != ZmOperation.FORWARD_INLINE &&
		this._action != ZmOperation.FORWARD_ATT)
	{
		this._composeView._setBodyFieldCursor();
	}
};

/**
* Sends the message represented by the content of the compose view.
*/
ZmComposeController.prototype.sendMsg =
function(attId, isDraft, callback) {
	var msg = this._composeView.getMsg(attId, isDraft);
	if (!msg) return;

	var inviteMode = msg.inviteMode;
	var isCancel = (inviteMode == ZmOperation.REPLY_CANCEL);
	var isModify = (inviteMode == ZmOperation.REPLY_MODIFY);

	if (isCancel || isModify) {
		var origMsg = msg._origMsg;
		var appt = origMsg._appt;
		var respCallback = new AjxCallback(this, this._handleResponseCancelOrModifyAppt);
		if (isCancel) {
			appt.cancel(origMsg._mode, msg, respCallback);
		} else {
			appt.save();
		}
	} else {
		// if shared folder, make sure we send the email on-behalf-of
		var folder = msg.folderId ? this._appCtxt.getById(msg.folderId) : null;
		var acctName = (folder && folder.isRemote()) ? folder.getOwner() : this._accountName;
		var contactList = !isDraft ? AjxDispatcher.run("GetContacts") : null;
		var respCallback = new AjxCallback(this, this._handleResponseSendMsg, [isDraft, msg, callback]);
		var errorCallback = new AjxCallback(this, this._handleErrorSendMsg);
		var resp = msg.send(contactList, isDraft, respCallback, errorCallback, acctName);

		// XXX: temp bug fix #4325 - if resp returned, we're processing sync
		//      request REVERT this bug fix once mozilla fixes bug #295422!
		if (resp) {
			this._processSendMsg(isDraft, msg, resp);
		}
	}
};

ZmComposeController.prototype._handleResponseSendMsg =
function(isDraft, msg, callback, result) {
	var resp = result.getResponse();
	this._processSendMsg(isDraft, msg, resp);

	if (callback) callback.run(result);
};

ZmComposeController.prototype._handleResponseCancelOrModifyAppt =
function() {
	this._composeView.reset(false);
	this._app.popView(true);
};

ZmComposeController.prototype._handleErrorSendMsg =
function(ex) {
	this._toolbar.enableAll(true);

	var msg = null;
	if (ex.code == ZmCsfeException.MAIL_SEND_ABORTED_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		var invalidMsg = (invalid && invalid.length)
			? AjxMessageFormat.format(ZmMsg.sendErrorInvalidAddresses, AjxStringUtil.htmlEncode(invalid.join(", ")))
			: null;
		msg = ZmMsg.sendErrorAbort + "<br/>" + invalidMsg;
	} else if (ex.code == ZmCsfeException.MAIL_SEND_PARTIAL_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		msg = (invalid && invalid.length)
			? AjxMessageFormat.format(ZmMsg.sendErrorPartial, AjxStringUtil.htmlEncode(invalid.join(", ")))
			: ZmMsg.sendErrorAbort;
	} else if (ex.code == AjxException.CANCELED) {
		msg = ZmMsg.cancelSendMsgWarning;
		this._composeView.setBackupForm();
		return true;
	}
	if (msg) {
		this._msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		this._msgDialog.popup();
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
*/
ZmComposeController.prototype.initComposeView =
function(initHide, composeMode) {
	if (this._composeView) return;

	this._composeView = new ZmComposeView(this._container, this, composeMode);
	var callbacks = {};
	callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
	callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
	var elements = {};
	this._initializeToolBar();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._composeView;
    this._app.createView(ZmController.COMPOSE_VIEW, elements, callbacks, false, true);
    if (initHide) {
	    this._composeView.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
	    this._composeView.enableInputs(false);
	}
	this._composeView.getIdentitySelect().addChangeListener(new AjxListener(this, this._identityChangeListener));
};

ZmComposeController.prototype._identityChangeListener =
function(event) {
	if (!this._composeView.isDirty()) {
		this._applyIdentityToBody();
	} else {
		var dialog = this._appCtxt.getYesNoMsgDialog();
		dialog.reset();
		dialog.registerCallback(DwtDialog.YES_BUTTON, this._identityChangeYesCallback, this, [dialog]);
		dialog.registerCallback(DwtDialog.NO_BUTTON, this._identityChangeNoCallback, this, [dialog]);
		dialog.setMessage(ZmMsg.identityChangeWarning, DwtMessageDialog.WARNING_STYLE);
		dialog.popup();
	}
};

ZmComposeController.prototype._identityChangeYesCallback =
function(dialog) {
	this._applyIdentityToBody();
	dialog.popdown();
};

ZmComposeController.prototype._identityChangeNoCallback =
function(dialog) {
	var identity = this._composeView.getIdentity();
	this._setAddSignatureVisibility(identity);
	dialog.popdown();
};

ZmComposeController.prototype._applyIdentityToBody =
function() {
	var identity = this._composeView.getIdentity();
	var newMode = this._getComposeMode(this._msg, identity);
	if (newMode != this._composeView.getComposeMode()) {
		this._composeView.setComposeMode(newMode);
	}
	this._composeView.resetBody(this._action, this._msg, this._extraBodyText, null);
	this._setAddSignatureVisibility(identity);
};

/**
 * Sets the tab stops for the compose form. All address fields are added; they're
 * not actual tab stops unless they're visible. The textarea for plain text and
 * the HTML editor for HTML compose are swapped in and out depending on the mode.
 */
ZmComposeController.prototype._setComposeTabGroup =
function() {
	var tg = this._createTabGroup();
	var rootTg = this._appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		tg.addMember(this._composeView._field[ZmMailMsg.COMPOSE_ADDRS[i]]);
	}
	tg.addMember(this._composeView._subjectField);
	var mode = this._composeView.getComposeMode();
	var member = (mode == DwtHtmlEditor.TEXT) ? this._composeView._bodyField : this._composeView.getHtmlEditor();
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
			if (this._appCtxt.get(ZmSetting.SAVE_DRAFT_ENABLED)) {
				this._saveDraft();
			}
			break;

		case ZmKeyMap.SEND: // Send message
			this._send();
			break;

		case ZmKeyMap.ATTACHMENT:
			this._attachmentListener();
			break;

		case ZmKeyMap.SPELLCHECK:
			this.toggleSpellCheckButton(true);
			this._spellCheckListener();
			break;

		case ZmKeyMap.HTML_FORMAT:
			if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
				var mode = this._composeView.getComposeMode();
				var identity = this._composeView.getIdentity();
				var newMode = (mode == DwtHtmlEditor.TEXT) ? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
				this._setFormat(newMode);
				this._setOptionsMenu(newMode, identity);
			}
			break;

		case ZmKeyMap.ADDRESS_PICKER:
			this._composeView._addressButtonListener(null, AjxEmailAddress.TO);
			break;

		case ZmKeyMap.NEW_WINDOW:
			if (!this.isChildWindow) {
				this._detachListener();
			}
			break;

		default:
			return ZmMailListController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

// Private methods

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
	this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:async});
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

	// save args in case we need to re-display (eg go from Reply to Reply All)
	var action = this._action = params.action;
	var msg = this._msg = params.msg;
	this._toOverride = params.toOverride;
	this._subjOverride = params.subjOverride;
	this._extraBodyText = params.extraBodyText;
	this._accountName = params.accountName;
	this._msgIds = params.msgIds;

	var identityCollection = this._appCtxt.getIdentityCollection();
	var identity = (msg && msg.identity) ? msg.identity : identityCollection.selectIdentity(msg);
	params.identity = identity;

	this._initializeToolBar();
	this._toolbar.enableAll(true);
	var isCancel = (action == ZmOperation.REPLY_CANCEL);
	var isModify = (action == ZmOperation.REPLY_MODIFY);
	if (isCancel || isModify) {
		var ops = [ ZmOperation.SAVE_DRAFT ];
		if (isCancel) {
			ops.push(ZmOperation.ATTACHMENT);
		}
		this._toolbar.enable(ops, false);
	}

	this.initComposeView(null, params.composeMode);

	this._composeMode = params.composeMode ? params.composeMode : this._getComposeMode(msg, identity);
	this._composeView.setComposeMode(this._composeMode);

	this._setOptionsMenu(this._composeMode, identity);
	this._setAddSignatureVisibility(identity);

	this._composeView.set(params);
	this._setComposeTabGroup();
	this._app.pushView(ZmController.COMPOSE_VIEW);
	this._composeView.reEnableDesignMode();
};

ZmComposeController.prototype._initializeToolBar =
function() {
	if (this._toolbar) return;

	var buttons = [ZmOperation.SEND];

	if (this._appCtxt.get(ZmSetting.IM_ENABLED))
		buttons.push(ZmOperation.IM);

	buttons.push(ZmOperation.CANCEL, ZmOperation.SEP, ZmOperation.SAVE_DRAFT);
	
	if (this._appCtxt.get(ZmSetting.ATTACHMENT_ENABLED))    
		buttons.push(ZmOperation.ATTACHMENT);
		     
	buttons.push(ZmOperation.SPELL_CHECK, ZmOperation.ADD_SIGNATURE, ZmOperation.COMPOSE_OPTIONS, ZmOperation.FILLER);

	if (!this.isChildWindow) {
		buttons.push(ZmOperation.DETACH_COMPOSE);
	}

	var className = this.isChildWindow ? "ZmAppToolBar_cw" : "ZmAppToolBar";
	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons, className:className});

	for (var i = 0; i < this._toolbar.opList.length; i++) {
		var button = this._toolbar.opList[i];
		if (this._listeners[button]) {
			this._toolbar.addSelectionListener(button, this._listeners[button]);
		}
	}

	var identity = this._appCtxt.getIdentityCollection().defaultIdentity;
	var canAddSig = this._setAddSignatureVisibility(identity);

	var actions = [ZmOperation.NEW_MESSAGE, ZmOperation.REPLY,
					ZmOperation.FORWARD_ATT,ZmOperation.DRAFT,
					ZmOperation.REPLY_CANCEL, ZmOperation.REPLY_ACCEPT,
					ZmOperation.REPLY_DECLINE, ZmOperation.REPLY_TENTATIVE];
	this._optionsMenu = {};
	for (var i = 0; i < actions.length; i++) {
		this._optionsMenu[actions[i]] = this._createOptionsMenu(actions[i]);
	}
	this._optionsMenu[ZmOperation.REPLY_ALL] = this._optionsMenu[ZmOperation.REPLY];
	this._optionsMenu[ZmOperation.FORWARD_INLINE] = this._optionsMenu[ZmOperation.FORWARD_ATT];
	this._optionsMenu[ZmOperation.SHARE] = this._optionsMenu[ZmOperation.NEW_MESSAGE];

	// change default button style to select for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);

	// reduce toolbar width if low-res display
	if (AjxEnv.is800x600orLower) {
		spellCheckButton.setText("");
		// if "add signature" button exists, remove label for attachment button
		if (canAddSig) {
			var attachmentButton = this._toolbar.getButton(ZmOperation.ATTACHMENT);
			if(attachmentButton)
				attachmentButton.setText("");
		}
	}
};

ZmComposeController.prototype._setAddSignatureVisibility =
function(identity) {
	if (!identity) { return false; }
	var canAddSig = (!identity.signatureEnabled && identity.signature);
	var signatureButton = this._toolbar.getButton(ZmOperation.ADD_SIGNATURE);
	if (signatureButton) {
		signatureButton.setVisible(canAddSig);
	}
	return canAddSig;
};

ZmComposeController.prototype._createOptionsMenu =
function(action) {

	var isReply = (action == ZmOperation.REPLY || action == ZmOperation.REPLY_ALL);
	var isForward = (action == ZmOperation.FORWARD_ATT || action == ZmOperation.FORWARD_INLINE);
	var list = [];
	if (isReply) {
		list.push(ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.SEP);
	}
	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		list.push(ZmOperation.FORMAT_HTML, ZmOperation.FORMAT_TEXT, ZmOperation.SEP);
	}
	list.push(ZmOperation.SHOW_BCC);
	if (isReply) {
		list.push(ZmOperation.SEP, ZmOperation.INC_NONE, ZmOperation.INC_ATTACHMENT, ZmOperation.INC_NO_PREFIX,
				  ZmOperation.INC_PREFIX, ZmOperation.INC_SMART);
	} else if (isForward) {
		list.push(ZmOperation.SEP, ZmOperation.INC_ATTACHMENT, ZmOperation.INC_NO_PREFIX, ZmOperation.INC_PREFIX);
	}

	var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);

	var overrides = {};
	for (var i = 0; i < list.length; i++) {
		var op = list[i];
		if (op == ZmOperation.SEP) { continue; }
		overrides[op] = {};
		var style = (op == ZmOperation.SHOW_BCC) ? DwtMenuItem.CHECK_STYLE : DwtMenuItem.RADIO_STYLE;
		overrides[op].style = style;
		overrides[op].radioGroupId = (style == DwtMenuItem.RADIO_STYLE) ? ZmComposeController.RADIO_GROUP[op] : null;
		if (op == ZmOperation.REPLY) {
			overrides[op].text = ZmMsg.replySender;
		}

	}

	var menu = new ZmActionMenu({parent:button, menuItems:list, overrides:overrides});

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
function(composeMode, identity) {
	var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	button.setToolTipContent(ZmMsg[ZmComposeController.OPTIONS_TT[this._action]]);
	var menu = this._optionsMenu[this._action];
	if (!menu) return;

	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		menu.checkItem(ZmHtmlEditor._VALUE, composeMode, true);
	}
	var isReply = (this._action == ZmOperation.REPLY || this._action == ZmOperation.REPLY_ALL);
	var isForward = (this._action == ZmOperation.FORWARD_ATT || this._action == ZmOperation.FORWARD_INLINE);
	if (identity && (isReply || isForward)) {
		var includePref = isReply ? identity.getReplyOption() : identity.getForwardOption();
		this._curIncOption = ZmComposeController.INC_OP[includePref];
		menu.checkItem(ZmOperation.KEY_ID, this._curIncOption, true);
		if (isReply) {
			menu.checkItem(ZmOperation.KEY_ID, this._action, true);
		}
	}
	menu.getItemById(ZmOperation.KEY_ID, ZmOperation.SHOW_BCC).setChecked(this._appCtxt.get(ZmSetting.SHOW_BCC), true);

	button.setMenu(menu);
};

ZmComposeController.prototype._getComposeMode =
function(msg, identity) {
	// depending on COS/user preference set compose format
	var composeMode = DwtHtmlEditor.TEXT;

	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {
		if ((this._action == ZmOperation.REPLY ||
			this._action == ZmOperation.REPLY_ALL ||
			this._action == ZmOperation.FORWARD_INLINE ||
			this._action == ZmOperation.REPLY_ACCEPT ||
			this._action == ZmOperation.REPLY_CANCEL ||
			this._action == ZmOperation.REPLY_DECLINE ||
			this._action == ZmOperation.REPLY_TENTATIVE) && identity)
		{
			var bComposeSameFormat = identity.getComposeSameFormat();
			var bComposeAsFormat = identity.getComposeAsFormat();
			if ((!bComposeSameFormat && bComposeAsFormat == ZmSetting.COMPOSE_HTML) ||
			    (bComposeSameFormat && msg.isHtmlMail()))
			{
				composeMode = DwtHtmlEditor.HTML;
			}
		}
		else if (this._action == ZmOperation.NEW_MESSAGE)
		{
			if (this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML)
				composeMode = DwtHtmlEditor.HTML;
		}
		else if (this._action == ZmOperation.DRAFT)
		{
			if (msg.isHtmlMail())
				composeMode = DwtHtmlEditor.HTML;
		}
	}

	return composeMode;
};

ZmComposeController.prototype._setFormat =
function(mode) {
	if (mode == this._composeView.getComposeMode())	{ return; }

	if (mode == DwtHtmlEditor.TEXT &&
		(this._composeView.isDirty() || this._action == ZmOperation.DRAFT))
	{
		// if formatting from html to text, confirm w/ user!
		if (!this._htmlToTextDialog) {
			this._htmlToTextDialog = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
			this._htmlToTextDialog.setMessage(ZmMsg.switchToText, DwtMessageDialog.WARNING_STYLE);
			this._htmlToTextDialog.registerCallback(DwtDialog.OK_BUTTON, this._htmlToTextOkCallback, this);
			this._htmlToTextDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._htmlToTextCancelCallback, this);
		}
		this._htmlToTextDialog.popup(this._composeView._getDialogXY());
	} else {
		this._composeView.setComposeMode(mode);
	}
};

ZmComposeController.prototype._processSendMsg =
function(isDraft, msg, resp) {
	if (!isDraft) {
		if (this.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
			window.parentController.setStatusMsg(ZmMsg.messageSent);
		} else {
			this._appCtxt.setStatusMsg(ZmMsg.messageSent);
		}

		if (resp || !this._appCtxt.get(ZmSetting.SAVE_TO_SENT)) {
			this._composeView.reset(false);

			// if the original message was a draft, we need to nuke it
			var origMsg = msg._origMsg;
			if (origMsg && origMsg.isDraft)
				this._deleteDraft(origMsg);

			this._app.popView(true);
		}
	} else {
		// TODO - disable save draft button indicating a draft was saved
		if (this.isChildWindow && window.parentController) {
			window.parentController.setStatusMsg(ZmMsg.draftSaved);
		} else {
			this._appCtxt.setStatusMsg(ZmMsg.draftSaved);
		}
		this._composeView.processMsgDraft(msg);
	}
	if (this._appCtxt.get(ZmSetting.OFFLINE)) {
		this._appCtxt.getAppController().sendSync();
	}
};


// Listeners

// Send button was pressed
ZmComposeController.prototype._sendListener =
function(ev) {
	this._send();
};

ZmComposeController.prototype._imListener = function(ev) {
	var msg = this._composeView.getMsg();
	if (msg) {
		var text = this._composeView._htmlEditor.getContent();
		var contacts = msg.getAddresses(AjxEmailAddress.TO, {}, true);
		AjxDispatcher.run("GetChatListController").chatWithContacts(contacts, msg, text);
	}
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
	if (!dirty) {
		this._composeView.reset(true);
	} else {
		this._composeView.enableInputs(false);
	}
	this._composeView.reEnableDesignMode();
	this._app.popView(!dirty);
};

// Attachment button was pressed
ZmComposeController.prototype._attachmentListener =
function(ev) {

	if (!this._detachOkCancel) {
		// detach ok/cancel dialog is only necessary if user clicked on the add attachments button
		this._detachOkCancel = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
		this._detachOkCancel.setMessage(ZmMsg.detachAnyway, DwtMessageDialog.WARNING_STYLE);
		this._detachOkCancel.registerCallback(DwtDialog.OK_BUTTON, this._detachCallback, this);
	}
	this._composeView.showAttachmentDialog();
	//this._composeView.addAttachmentField();
};

ZmComposeController.prototype._optionsListener =
function(ev) {
	var op = ev.item.getData(ZmOperation.KEY_ID);

	// Show BCC is checkbox
	if (op == ZmOperation.SHOW_BCC) {
		var showField = (ev.detail == DwtMenuItem.CHECKED);
		this._composeView._showAddressField(AjxEmailAddress.BCC, showField);
		return;
	}

	// Click on "Options" button.
	if (op == ZmOperation.COMPOSE_OPTIONS && this._optionsMenu[this._action]) {
		var button = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
		var bounds = button.getBounds();
		this._optionsMenu[this._action].popup(0, bounds.x, bounds.y + bounds.height, false);
		return;
	}

	// the rest are radio buttons, we only care when they're selected
	if (ev.detail != DwtMenuItem.CHECKED) return;

	if (op == ZmOperation.REPLY || op == ZmOperation.REPLY_ALL) {
		this._composeView._setAddresses(op, this._toOverride);
	} else if (op == ZmOperation.FORMAT_HTML || op == ZmOperation.FORMAT_TEXT) {
		this._setFormat(ev.item.getData(ZmHtmlEditor._VALUE));
	} else {
		var incOption = ZmComposeController.INC_MAP[op];
		if (incOption) {
			if (this._composeView.isDirty()) {
				if (!this._switchIncludeDialog) {
					this._switchIncludeDialog = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
					this._switchIncludeDialog.setMessage(ZmMsg.switchIncludeWarning, DwtMessageDialog.WARNING_STYLE);
					this._switchIncludeDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._switchIncludeCancelCallback, this);
				}
				this._switchIncludeDialog.registerCallback(DwtDialog.OK_BUTTON, this._switchIncludeOkCallback, this, incOption);
				this._switchIncludeDialog.popup(this._composeView._getDialogXY());
			} else {
				this._composeView.resetBody(this._action, this._msg, this._extraBodyText, incOption);
				this._curIncOption = ZmComposeController.INC_OP[incOption];
			}
		}
	}
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
	this._saveDraft();
};

ZmComposeController.prototype._saveDraft =
function() {
	var respCallback = new AjxCallback(this, this._handleResponseSaveDraftListener);
	this.sendMsg(null, true, respCallback);
};

ZmComposeController.prototype._handleResponseSaveDraftListener =
function(args) {
	this._action = ZmOperation.DRAFT;
};

ZmComposeController.prototype._addSignatureListener =
function(ev) {
	this._composeView.addSignature(this._composeView.getHtmlEditor().getContent());
};

ZmComposeController.prototype._spellCheckListener =
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

ZmComposeController.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;

	var id = ev.source.id;
	if (id == ZmSetting.SHOW_BCC) {
		var menu = this._optionsMenu[this._action];
		if (menu)
			menu.getItemById(ZmOperation.KEY_ID, ZmOperation.SHOW_BCC).setChecked(this._appCtxt.get(ZmSetting.SHOW_BCC), true);
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

ZmComposeController.prototype._htmlToTextOkCallback =
function() {
	this._htmlToTextDialog.popdown();
	this._composeView.setComposeMode(DwtHtmlEditor.TEXT);
};

ZmComposeController.prototype._htmlToTextCancelCallback =
function() {
	this._htmlToTextDialog.popdown();

	// reset the radio button for the format button menu
	var menu = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS).getMenu();
	menu.checkItem(ZmHtmlEditor._VALUE, DwtHtmlEditor.HTML, true);

	this._composeView.reEnableDesignMode();
};

// Called as: Yes, save as draft
//			  Yes, go ahead and cancel
ZmComposeController.prototype._popShieldYesCallback =
function() {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._composeView.enableInputs(true);
	if (this._appCtxt.get(ZmSetting.SAVE_DRAFT_ENABLED)) {
		// save as draft
		this.sendMsg(null, true);
	} else {
		// cancel
		if (this.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
		} else {
			this._composeView.reset(false);
		}
	}

	this._app.popView(true);
	this._appCtxt.getAppViewMgr().showPendingView(true);
};

// Called as: No, don't save as draft
//			  No, don't cancel
ZmComposeController.prototype._popShieldNoCallback =
function() {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._composeView.enableInputs(true);
	if (this._appCtxt.get(ZmSetting.SAVE_DRAFT_ENABLED)) {
		if (this.isChildWindow && window.parentController) {
			window.onbeforeunload = null;
		} else {
			this._composeView.reset(false);
		}

		this._app.popView(true);
		this._appCtxt.getAppViewMgr().showPendingView(true);
	} else {
		this._appCtxt.getAppViewMgr().showPendingView(false);
		this._composeView.reEnableDesignMode();
	}
};

// Called as: Don't save as draft or cancel
ZmComposeController.prototype._popShieldDismissCallback =
function() {
	this._popShield.removePopdownListener(this._dialogPopdownListener);
	this._popShield.popdown();
	this._cancelViewPop();
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
	this._appCtxt.getAppViewMgr().showPendingView(false);
	this._composeView.reEnableDesignMode();
};

ZmComposeController.prototype._switchIncludeOkCallback =
function(incOption) {
	this._switchIncludeDialog.popdown();
	this._composeView.resetBody(this._action, this._msg, this._extraBodyText, incOption);
	this._curIncOption = ZmComposeController.INC_OP[incOption];
};

ZmComposeController.prototype._switchIncludeCancelCallback =
function() {
	this._switchIncludeDialog.popdown();
	// reset the radio button for the include mode
	var menu = this._optionsMenu[this._action];
	if (!menu) return;
	menu.checkItem(ZmOperation.KEY_ID, this._curIncOption, true);
};

ZmComposeController.prototype._getDefaultFocusItem =
function() {
	if (this._action == ZmOperation.NEW_MESSAGE ||
		this._action == ZmOperation.FORWARD_INLINE ||
		this._action == ZmOperation.FORWARD_ATT)
	{
		return this._composeView._field[AjxEmailAddress.TO];
	}
	else
	{
		var composeMode = this._composeView.getComposeMode();
		return (composeMode == DwtHtmlEditor.TEXT)
			? this._composeView._bodyField
			: this._composeView._htmlEditor;
	}
};
