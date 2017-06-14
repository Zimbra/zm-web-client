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
 * Creates a new compose view. The view does not display itself on construction.
 * @constructor
 * @class
 * This class provides a form for composing a message.
 *
 * @author Conrad Damon
 * 
 * @param {DwtControl}		parent			the element that created this view
 * @param {ZmController}	controller		the controller managing this view
 * @param {constant}		composeMode 	passed in so detached window knows which mode to be in on startup
 * 
 * @extends		DwtComposite
 * 
 * @private
 */
ZmComposeView = function(parent, controller, composeMode, action) {

	if (arguments.length === 0) { return; }
		
	this.TEMPLATE = "mail.Message#Compose";
	this._view = controller.getCurrentViewId();
	this._sessionId = controller.getSessionId();

	DwtComposite.call(this, {parent:parent, className:"ZmComposeView", posStyle:Dwt.ABSOLUTE_STYLE, id:ZmId.getViewId(this._view)});

	ZmComposeView.NOTIFY_ACTION_MAP = {};
	ZmComposeView.NOTIFY_ACTION_MAP[ZmOperation.REPLY_ACCEPT]		= ZmOperation.REPLY_ACCEPT_NOTIFY;
	ZmComposeView.NOTIFY_ACTION_MAP[ZmOperation.REPLY_DECLINE]		= ZmOperation.REPLY_DECLINE_NOTIFY;
	ZmComposeView.NOTIFY_ACTION_MAP[ZmOperation.REPLY_TENTATIVE]	= ZmOperation.REPLY_TENTATIVE_NOTIFY;

	ZmComposeView.MOVE_TO_FIELD = {};
	ZmComposeView.MOVE_TO_FIELD[ZmOperation.MOVE_TO_TO]		= AjxEmailAddress.TO;
	ZmComposeView.MOVE_TO_FIELD[ZmOperation.MOVE_TO_CC]		= AjxEmailAddress.CC;
	ZmComposeView.MOVE_TO_FIELD[ZmOperation.MOVE_TO_BCC]	= AjxEmailAddress.BCC;
		
	this._onMsgDataChange = this._onMsgDataChange.bind(this);

	this._controller = controller;

	var recipParams = {};
	recipParams.resetContainerSizeMethod	= this._resetBodySize.bind(this);
	recipParams.enableContainerInputs		= this.enableInputs.bind(this);
	recipParams.reenter						= this.reEnableDesignMode.bind(this);
	recipParams.contactPopdownListener		= this._controller._dialogPopdownListener;
	recipParams.contextId					= this._controller.getCurrentViewId();

	this._recipients = new ZmRecipients(recipParams);
	this._attcTabGroup = new DwtTabGroup('ZmComposeViewAttachments');

	this._firstTimeFixImages = true;

	this._initialize(composeMode, action);

	// make sure no unnecessary scrollbars show up
	this.setScrollStyle(Dwt.CLIP);
};

ZmComposeView.prototype = new DwtComposite;
ZmComposeView.prototype.constructor = ZmComposeView;

ZmComposeView.prototype.isZmComposeView = true;
ZmComposeView.prototype.toString = function() {	return "ZmComposeView"; };

//
// Constants
//

// Consts related to compose fields
ZmComposeView.QUOTED_HDRS = [
		ZmMailMsg.HDR_FROM,
		ZmMailMsg.HDR_TO,
		ZmMailMsg.HDR_CC,
		ZmMailMsg.HDR_DATE,
		ZmMailMsg.HDR_SUBJECT
];

ZmComposeView.BAD						= "_bad_addrs_";

// Message dialog placement
ZmComposeView.DIALOG_X 					= 50;
ZmComposeView.DIALOG_Y 					= 100;

// Attachment related
ZmComposeView.UPLOAD_FIELD_NAME			= "attUpload";
ZmComposeView.FORWARD_ATT_NAME			= "ZmComposeView_forAttName";
ZmComposeView.FORWARD_MSG_NAME			= "ZmComposeView_forMsgName";
ZmComposeView.ADD_ORIG_MSG_ATTS			= "add_original_attachments";
ZmComposeView.MAX_ATTM_NAME_LEN	        = 30;

// max # of attachments to show
ZmComposeView.SHOW_MAX_ATTACHMENTS		= AjxEnv.is800x600orLower ? 2 : 3;
ZmComposeView.MAX_ATTACHMENT_HEIGHT 	= (ZmComposeView.SHOW_MAX_ATTACHMENTS * 23) + "px";

// Reply/forward stuff
ZmComposeView.EMPTY_FORM_RE				= /^[\s\|]*$/;
ZmComposeView.HTML_TAG_RE				= /(<[^>]+>)/g;
ZmComposeView.QUOTED_CONTENT_RE			= new RegExp("^----- ", "m");
ZmComposeView.HTML_QUOTED_CONTENT_RE	= new RegExp("<br>----- ", "i");

// Address components
ZmComposeView.OP = {};
ZmComposeView.OP[AjxEmailAddress.TO]	= ZmId.CMP_TO;
ZmComposeView.OP[AjxEmailAddress.CC]	= ZmId.CMP_CC;
ZmComposeView.OP[AjxEmailAddress.BCC]	= ZmId.CMP_BCC;

// Upload sources
ZmComposeView.UPLOAD_COMPUTER           = 'computer';
ZmComposeView.UPLOAD_INLINE             = 'inline';
ZmComposeView.UPLOAD_BRIEFCASE          = 'briefcase';

// Quoted content - distinguish "" from a lack of quoted content
ZmComposeView.EMPTY                     = '__empty__';

// Public methods

/**
 * Sets the current view, based on the given action. The compose form is
 * created and laid out and everything is set up for interaction with the user.
 *
 * @param {Hash}		params			a hash of parameters:
 * @param {constant}	action				new message, reply, forward, or an invite action
 * @param {ZmMailMsg}	msg					the original message (reply/forward), or address (new message)
 * @param {ZmIdentity}	identity			identity of sender
 * @param {String}		toOverride			To: addresses (optional)
 * @param {String}		ccOverride			Cc: addresses (optional)
 * @param {String}		subjectOverride		subject for new msg (optional)
 * @param {String}		extraBodyText		text to prepend to body
 * @param {Array}		msgIds				list of msg Id's to be added as attachments
 * @param {String}		accountName			on-behalf-of From address
 */
ZmComposeView.prototype.set =
function(params) {

	var action = this._action = params.action;
	this._origAction = this._action;
	if (this._msg) {
		this._msg.onChange = null;
	}

	this._isIncludingOriginalAttachments = false;
	this._originalAttachmentsInitialized = false;

	this.isEditAsNew = params.isEditAsNew;

	this._acceptFolderId = params.acceptFolderId;
	var msg = this._msg = this._origMsg = params.msg;
	var oboMsg = msg || (params.selectedMessages && params.selectedMessages.length && params.selectedMessages[0]);
	var obo = this._getObo(params.accountName, oboMsg);
	if (msg) {
		msg.onChange = this._onMsgDataChange;
	}

	// list of msg Id's to add as attachments
	this._msgIds = params.msgIds;

	this.reset(true);

	this._setFromSelect(msg);

	if (obo) {
		this.identitySelect.setSelectedValue(obo);
		this._controller.resetIdentity(obo);
	}

	if (params.identity) {
		if (this.identitySelect) {
			this.identitySelect.setSelectedValue(params.identity.id);
			this._controller.resetIdentity(params.identity.id);
		}
		if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED) || appCtxt.multiAccounts) {
			var selected = this._getSignatureIdForAction(params.identity) || "";
			var account = appCtxt.multiAccounts && this.getFromAccount();
			this._controller.resetSignatureToolbar(selected, account);
		}
	}

	this._recipients.setup();

	if (!ZmComposeController.IS_FORWARD[action]) {
		// populate fields based on the action and user prefs
		this._setAddresses(action, AjxEmailAddress.TO, params.toOverride);
		if (params.ccOverride) {
			this._setAddresses(action, AjxEmailAddress.CC, params.ccOverride);
		}
		if (params.bccOverride) {
			this._setAddresses(action, AjxEmailAddress.BCC, params.bccOverride);
		}
	}

	this._setSubject(action, msg || (params.selectedMessages && params.selectedMessages[0]), params.subjOverride);
	this._setBody(action, msg, params.extraBodyText, false, false, params.extraBodyTextIsExternal, params.incOptions);
	if (params.extraBodyText) {
		this._isDirty = true;
	}

    //Force focus on body only for reply and replyAll
    if (ZmComposeController.IS_REPLY[action]) {
        this._moveCaretOnTimer(params.extraBodyText ? params.extraBodyText.length : 0);
    }

	if (action !== ZmOperation.FORWARD_ATT) {
		this._saveExtraMimeParts();
	}

	// save form state (to check for change later)
	if (this._composeMode === Dwt.HTML) {
		var ta = new AjxTimedAction(this, this._setFormValue);
		AjxTimedAction.scheduleAction(ta, 10);
	} else {
		this._setFormValue();
	}
	// Force focus on the TO field
	if (!ZmComposeController.IS_REPLY[action]) {
		appCtxt.getKeyboardMgr().grabFocus(this._recipients.getAddrInputField(AjxEmailAddress.TO));
	}
};

ZmComposeView.prototype._getObo =
function(obo, msg) {
	if (msg) {
		var folder = !obo ? appCtxt.getById(msg.folderId) : null;
		obo = (folder && folder.isRemote()) ? folder.getOwner() : null;

		// check if this is a draft that was originally composed obo
		var isFromDataSource = msg.identity && msg.identity.isFromDataSource;
		if (!obo && msg.isDraft && !appCtxt.multiAccounts && !isFromDataSource && !appCtxt.get(ZmSetting.ALLOW_ANY_FROM_ADDRESS)) {
			var ac = window.parentAppCtxt || window.appCtxt;
			var from = msg.getAddresses(AjxEmailAddress.FROM).get(0);
			if (from && (from.address.toLowerCase() !== ac.accountList.mainAccount.getEmail().toLowerCase()) && !appCtxt.isMyAddress(from.address.toLowerCase())) {
				obo = from.address;
			}
		}
	}
	return obo;
};

ZmComposeView.prototype._saveExtraMimeParts =
function() {
		
	var bodyParts = this._msg ? this._msg.getBodyParts() : [];
	for (var i = 0; i < bodyParts.length; i++) {
		var bodyPart = bodyParts[i];
		var contentType = bodyPart.contentType;

		if (contentType === ZmMimeTable.TEXT_PLAIN) { continue; }
		if (contentType === ZmMimeTable.TEXT_HTML) { continue; }
		if (ZmMimeTable.isRenderableImage(contentType) && bodyPart.contentDisposition === "inline") { continue; } // bug: 28741

		var mimePart = new ZmMimePart();
		mimePart.setContentType(contentType);
		mimePart.setContent(bodyPart.getContent());
		this.addMimePart(mimePart);
	}
};

/**
 * Called automatically by the attached ZmMailMsg object when data is
 * changed, in order to support Zimlets modify subject or other values
 * (bug: 10540)
 * 
 * @private
 */
ZmComposeView.prototype._onMsgDataChange =
function(what, val) {
	if (what === "subject") {
		this._subjectField.value = val;
		this.updateTabTitle();
	}
};

ZmComposeView.prototype.getComposeMode =
function() {
	return this._composeMode;
};

ZmComposeView.prototype.getController =
function() {
	return this._controller;
};

ZmComposeView.prototype.getHtmlEditor =
function() {
	return this._htmlEditor;
};

/**
 * Gets the title.
 * 
 * @return	{String}	the title
 */
ZmComposeView.prototype.getTitle =
function() {
	var text;
	if (ZmComposeController.IS_REPLY[this._action]) {
		text = ZmMsg.reply;
	} else if (ZmComposeController.IS_FORWARD[this._action]) {
		text = ZmMsg.forward;
	} else {
		text = ZmMsg.compose;
	}
	return [ZmMsg.zimbraTitle, text].join(": ");
};

/**
 * Gets the field values for each of the addr fields.
 * 
 * @return	{Array}	an array of addresses
 */
ZmComposeView.prototype.getRawAddrFields =
function() {
	return this._recipients.getRawAddrFields();
};

// returns address fields that are currently visible
ZmComposeView.prototype.getAddrFields =
function() {
	return this._recipients.getAddrFields();
};

ZmComposeView.prototype.getTabGroupMember = function() {

    if (!this._tabGroup) {
        var tg = this._tabGroup = new DwtTabGroup('ZmComposeView');
        tg.addMember(this._fromSelect);
        tg.addMember(this.identitySelect);
        tg.addMember(this._recipients.getTabGroupMember());
        tg.addMember(this._subjectField);
        tg.addMember(this._attButton);
        tg.addMember(this._attcTabGroup);
        tg.addMember(this._htmlEditor.getTabGroupMember());
    }

	return this._tabGroup;
};

ZmComposeView.prototype.getAddrInputField =
function(type) {
	return this._recipients.getAddrInputField(type);
};

ZmComposeView.prototype.getRecipientField =
function(type) {
	return this._recipients.getField(type);
};

ZmComposeView.prototype.getAddressButtonListener =
function(ev, addrType) {
	return this._recipients.addressButtonListener(ev, addrType);
};

ZmComposeView.prototype.setAddress =
function(type, addr) {
	return this._recipients.setAddress(type, addr);
};

ZmComposeView.prototype.collectAddrs =
function() {
	return this._recipients.collectAddrs();
};

// returns list of attachment field values (used by detachCompose)
ZmComposeView.prototype.getAttFieldValues =
function() {
	var attList = [];
	var atts = document.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++) {
		attList.push(atts[i].value);
	}

	return attList;
};

ZmComposeView.prototype.setBackupForm =
function() {
	this.backupForm = this._backupForm();
};

/**
* Saves *ALL* form value data to test against whether user made any changes
* since canceling SendMsgRequest. If user attempts to send again, we compare
* form data with this value and if not equal, send a new UID otherwise, re-use.
* 
* @private
*/
ZmComposeView.prototype._backupForm =
function() {
	var val = this._formValue(true, true);

	// keep track of attachments as well
	var atts = document.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME);
	for (var i = 0; i < atts.length; i++) {
		if (atts[i].value.length) {
			val += atts[i].value;
		}
	}

	// keep track of "uploaded" attachments as well :/
	val += this._getForwardAttIds(ZmComposeView.FORWARD_ATT_NAME + this._sessionId).join("");
	val += this._getForwardAttIds(ZmComposeView.FORWARD_MSG_NAME + this._sessionId).join("");

	return val;
};

ZmComposeView.prototype._setAttInline =
function(opt){
  this._isAttachInline = (opt === true);
};

ZmComposeView.prototype._getIsAttInline =
function(opt){
  return(this._isAttachInline);
};


ZmComposeView.prototype._isInline =
function(msg) {

	if (this._attachDialog) {
		return this._attachDialog.isInline();
	}

	msg = msg || this._origMsg;

	if (msg && this._msgAttId && msg.id === this._msgAttId) {
		return false;
	}

	if (msg && msg.attachments) {
		var atts = msg.attachments;
		for (var i = 0; i < atts.length; i++) {
			if (atts[i].contentId) {
				return true;
			}
		}
	}

	return false;
};


ZmComposeView.prototype._addReplyAttachments =
function(){
	this._showForwardField(this._msg, ZmComposeView.ADD_ORIG_MSG_ATTS, true);
};

ZmComposeView.prototype._handleInlineAtts =
function(msg, handleInlineDocs){

	var handled = false, ci, cid, dfsrc, inlineAtt, attached = {};

	var idoc = this._htmlEditor._getIframeDoc();
	var images = idoc ? idoc.getElementsByTagName("img") : [];
	for (var i = 0; i < images.length; i++) {
		dfsrc = images[i].getAttribute("dfsrc") || images[i].getAttribute("data-mce-src") || images[i].src;
		if (dfsrc) {
			if (dfsrc.substring(0,4) === "cid:") {
				cid = dfsrc.substring(4).replace("%40","@");
				var docpath = images[i].getAttribute("doc");
				var mid = images[i].getAttribute('data-zimbra-id');
				var part = images[i].getAttribute('data-zimbra-part');

				if (docpath){
					msg.addInlineDocAttachment(cid, null, docpath);
					handled = true;
				} else if (mid && part) {
					images[i].removeAttribute('data-zimbra-id');
					images[i].removeAttribute('data-zimbra-part');
					msg.addInlineAttachmentId(cid, mid, part, true);
					handled = true;
				} else {
					ci = "<" + cid + ">";
					inlineAtt = msg.findInlineAtt(ci);
					if (!inlineAtt && this._msg) {
						inlineAtt = this._msg.findInlineAtt(ci);
					}
						if (inlineAtt) {
						var id = [cid, inlineAtt.part].join("_");
						if (!attached[id]) {
							msg.addInlineAttachmentId(cid, null, inlineAtt.part);
							handled = true;
							attached[id] = true;
						}
					}
				}
			}
		}
	}

	return handled;
};

ZmComposeView.prototype._generateCid =
function() {
	var timeStr = "" + new Date().getTime();
	var hash = AjxSHA1.hex_sha1(timeStr + Dwt.getNextId());
	return hash + "@zimbra";
};

/**
* Returns the message from the form, after some basic input validation.
*/
ZmComposeView.prototype.getMsg =
function(attId, isDraft, dummyMsg, forceBail, contactId) {

	// Check destination addresses.
	var addrs = this._recipients.collectAddrs();

	// Any addresses at all provided? If not, bail.
	if ((!isDraft || forceBail) && !addrs.gotAddress) {
		this.enableInputs(false);
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(ZmMsg.noAddresses, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._okCallback, this);
		this.enableInputs(true);
		return;
	}

	var cd = appCtxt.getOkCancelMsgDialog();
	cd.reset();

	// Is there a subject? If not, ask the user if they want to send anyway.
	var subject = AjxStringUtil.trim(this._subjectField.value);
	if ((!isDraft || forceBail) && subject.length === 0 && !this._noSubjectOkay) {
		this.enableInputs(false);
		cd.setMessage(ZmMsg.compSubjectMissing, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._noSubjectOkCallback, this, cd);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._noSubjectCancelCallback, this, cd);
		cd.popup();
		return;
	}

	// Any bad addresses?  If there are bad ones, ask the user if they want to send anyway.
	if ((!isDraft || forceBail) && addrs[ZmComposeView.BAD].size() && !this._badAddrsOkay) {
		this.enableInputs(false);
		var bad = AjxStringUtil.htmlEncode(addrs[ZmComposeView.BAD].toString(AjxEmailAddress.SEPARATOR));
		var msg = AjxMessageFormat.format(ZmMsg.compBadAddresses, bad);
		cd.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._badAddrsOkCallback, this, cd);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._badAddrsCancelCallback, this, [addrs.badType, cd]);
		cd.setVisible(true); // per fix for bug 3209
		cd.popup();
		return;
	} else {
		this._badAddrsOkay = false;
	}

	// Mandatory Spell Check
	if ((!isDraft || forceBail) && appCtxt.get(ZmSetting.SPELL_CHECK_ENABLED) && 
		appCtxt.get(ZmSetting.MAIL_MANDATORY_SPELLCHECK) && !this._spellCheckOkay) {
		if (this._htmlEditor.checkMisspelledWords(this._spellCheckShield.bind(this), null, this._spellCheckErrorShield.bind(this))) {
			return;
		}
	} else {
		this._spellCheckOkay = false;
	}

	// Create Msg Object - use dummy if provided
	var msg = dummyMsg || (new ZmMailMsg());
	msg.setSubject(subject);

	var zeroSizedAttachments = false;
	// handle Inline Attachments
	if (attId && (this._getIsAttInline() || (this._attachDialog && this._attachDialog.isInline()) || attId.clipboardPaste)) {
		for (var i = 0; i < attId.length; i++) {
			var att = attId[i];
			if (att.s === 0) {
				zeroSizedAttachments = true;
				continue;
			}
			var contentType = att.ct;
			if (contentType && contentType.indexOf("image") !== -1) {
				var cid = this._generateCid();
				if( att.hasOwnProperty("id") ){
					this._htmlEditor.replaceImage(att.id, "cid:" + cid);
				}
				else {
					this._htmlEditor.insertImage("cid:" + cid, AjxEnv.isIE);
				}
				msg.addInlineAttachmentId(cid, att.aid);
			} else {
				msg.addAttachmentId(att.aid);
			}
		}
	} else if (attId && typeof attId !== "string") {
		for (var i = 0; i < attId.length; i++) {
			if (attId[i].s === 0) {
				zeroSizedAttachments = true;
				continue;
			}
			msg.addAttachmentId(attId[i].aid);
		}
	} else if (attId) {
		msg.addAttachmentId(attId);
	}

	if (zeroSizedAttachments) {
		appCtxt.setStatusMsg(ZmMsg.zeroSizedAtts);
	}

	// check if this is a resend
	if (this.sendUID && this.backupForm) {
		// if so, check if user changed anything since canceling the send
		if (isDraft || this._backupForm() !== this.backupForm) {
			this.sendUID = (new Date()).getTime();
		}
	} else {
		this.sendUID = (new Date()).getTime();
	}

	// get list of message part id's for any forwarded attachments
	var forwardAttIds = this._getForwardAttIds(ZmComposeView.FORWARD_ATT_NAME + this._sessionId, !isDraft && this._hideOriginalAttachments),
        forwardAttObjs = this._getForwardAttObjs(forwardAttIds),
        attachedMsgIds = AjxUtil.arrayAsHash(AjxUtil.map(forwardAttObjs, function(m) { return m.mid; })),
	    forwardMsgIds = [];

	if (this._msgIds) {
		// Get any message ids added via the attachment dialog (See
		// _attsDoneCallback which adds new forwarded attachments to msgIds)
		forwardMsgIds = this._msgIds;
		this._msgIds = null;
	}
    if (this._msgAttId) {
		// Forward one message or Reply as attachment
		forwardMsgIds.push(this._msgAttId);
	}
    if (this._origMsgAtt) {
        attachedMsgIds[this._origMsgAtt.mid] = true;
    }
    // make sure we're not attaching a msg twice by checking for its ID in our list of forwarded attachments
    forwardMsgIds = AjxUtil.filter(forwardMsgIds, function(m) { return !attachedMsgIds[m]; });

	// --------------------------------------------
	// Passed validation checks, message ok to send
	// --------------------------------------------

	// build MIME
	var top = this._getTopPart(msg, isDraft);

	msg.setTopPart(top);
	msg.setSubject(subject);
	msg.setForwardAttIds(forwardAttIds);
	msg.setForwardAttObjs(forwardAttObjs);
	if (!contactId) {
		//contactId not passed in, but vcard signature may be set
		if (this._msg && this._msg._contactAttIds) {
			contactId = this._msg._contactAttIds;
			this._msg.setContactAttIds([]);
		}
	}
	msg.setContactAttIds(contactId);
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (addrs[type] && addrs[type].all.size() > 0) {
			msg.setAddresses(type, addrs[type].all);
		}
	}
	msg.identity = this.getIdentity();
	msg.sendUID = this.sendUID;

	if (!msg.identity) {
		msg.delegatedSenderAddr = this.identitySelect.getValue();
		var option = this.identitySelect.getSelectedOption();
		msg.delegatedSenderAddrIsDL = option.getExtraData("isDL");
		msg.isOnBehalfOf = option.getExtraData("isObo");
	}
	// save a reference to the original message
	msg._origMsg = this._msg;
	if (this._msg && this._msg._instanceDate) {
		msg._instanceDate = this._msg._instanceDate;
	}

	this._setMessageFlags(msg);

	if (this._action === ZmOperation.DRAFT && this._origAcctMsgId) {
		msg.origAcctMsgId = this._origAcctMsgId;
	}

	// replied/forw msg or draft shouldn't have att ID (a repl/forw voicemail mail msg may)
	if (this._msg && this._msg.attId) {
		msg.addAttachmentId(this._msg.attId);
	}

	msg.setMessageAttachmentId(forwardMsgIds);

	var priority = this._controller._getPriority();
	if (priority) {
		msg.flagLocal(priority, true);
	}

	if (this._fromSelect) {
		msg.fromSelectValue = this._fromSelect.getSelectedOption();
	}

	if (!this._zimletCheck(msg, isDraft, forceBail)) {
		return;
	}
		
	return msg;
};

ZmComposeView.prototype._getTopPart =
function(msg, isDraft, bodyContent) {
		
	// set up message parts as necessary
	var top = new ZmMimePart();
	var textContent;
	var content = bodyContent || this._getEditorContent();

	if (this._composeMode == Dwt.HTML) {
		top.setContentType(ZmMimeTable.MULTI_ALT);
		
		// experimental code for generating text part
		if (false && this._htmlEditor) {
			var userText = AjxStringUtil.convertHtml2Text(this.getUserText());
			this.setComponent(ZmComposeView.BC_TEXT_PRE, userText)
			this._setReturns(Dwt.TEXT);
			var xxx = this._layoutBodyComponents(this._compList, Dwt.TEXT);
//			this.resetBody({ extraBodyText:userText }, true);
//			this._composeMode = Dwt.HTML;
			this._setReturns(Dwt.HTML);
		}

		// create two more mp's for text and html content types
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textContent = this._htmlToText(content);
		textPart.setContent(textContent);
		top.children.add(textPart);

		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);		

		if (this._htmlEditor) {
			var idoc = this._htmlEditor._getIframeDoc();
			this._cleanupFileRefImages(idoc);
			this._restoreMultipartRelatedImages(idoc);
			if (!isDraft) {
				this._cleanupSignatureIds(idoc);
			}
			htmlPart.setContent(this._fixStyles(this._getEditorContent(!isDraft)));
		}
		else {
			htmlPart.setContent(bodyContent);
		}

		var content = "<html><body>" + AjxStringUtil.defangHtmlContent(htmlPart.getContent()) + "</body></html>";

		htmlPart.setContent(content);

		if (this._htmlEditor) {
			this._handleInlineAtts(msg, true);
		}
		var inlineAtts = msg.getInlineAttachments();
		var inlineDocAtts = msg.getInlineDocAttachments();
		var iAtts = [].concat(inlineAtts, inlineDocAtts);
		if (iAtts &&  iAtts.length > 0) {
			var relatedPart = new ZmMimePart();
			relatedPart.setContentType(ZmMimeTable.MULTI_RELATED);
			relatedPart.children.add(htmlPart);
			top.children.add(relatedPart);
		} else {
			top.children.add(htmlPart);
		}
	}
	else {
		var inline = this._isInline();

		var textPart = (this._extraParts || inline) ? new ZmMimePart() : top;
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textContent = content;
		textPart.setContent(textContent);

		if (inline) {
			top.setContentType(ZmMimeTable.MULTI_ALT);
			var relatedPart = new ZmMimePart();
			relatedPart.setContentType(ZmMimeTable.MULTI_RELATED);
			relatedPart.children.add(textPart);
			top.children.add(relatedPart);
		} else {
			if (this._extraParts) {
				top.setContentType(ZmMimeTable.MULTI_ALT);
				top.children.add(textPart);
			}
		}
	}

	// add extra message parts
	if (this._extraParts) {
		for (var i = 0; i < this._extraParts.length; i++) {
			var mimePart = this._extraParts[i];
			top.children.add(mimePart);
		}
	}

	// store text-content of the current email for zimlets to work with
	// TODO: zimlets are being lazy here, and text content could be large; zimlets should get content from parts
	msg.textBodyContent = !this._htmlEditor ? textContent : (this._composeMode === Dwt.HTML)
		? this._htmlEditor.getTextVersion()
		: this._getEditorContent();
		
	return top;
};

// Returns the editor content with any markers stripped (unless told not to strip them)
ZmComposeView.prototype._getEditorContent =
function(leaveMarkers) {
	var content = "";
	if (this._htmlEditor) {
		content = this._htmlEditor.getContent(true);
		if (!leaveMarkers && (this._composeMode === Dwt.TEXT)) {
			content = this._removeMarkers(content);
		}
	}
	return content;
};

// Bug 27422 - Firefox and Safari implementation of execCommand("bold")
// etc use styles, and some email clients (Entourage) don't process the
// styles and the text remains plain. So we post-process and convert
// those to the tags (which are what the IE version of execCommand() does).
ZmComposeView.prototype._fixStyles =
function(text) {
	if (AjxEnv.isFirefox) {
		text = text.replace(/<span style="font-weight: bold;">(.+?)<\/span>/, "<strong>$1</strong>");
		text = text.replace(/<span style="font-style: italic;">(.+?)<\/span>/, "<em>$1</em>");
		text = text.replace(/<span style="text-decoration: underline;">(.+?)<\/span>/, "<u>$1</u>");
		text = text.replace(/<span style="text-decoration: line-through;">(.+?)<\/span>/, "<strike>$1</strike>");
	} else if (AjxEnv.isSafari) {
		text = text.replace(/<span class="Apple-style-span" style="font-weight: bold;">(.+?)<\/span>/, "<strong>$1</strong>");
		text = text.replace(/<span class="Apple-style-span" style="font-style: italic;">(.+?)<\/span>/, "<em>$1</em>");
		text = text.replace(/<span class="Apple-style-span" style="text-decoration: underline;">(.+?)<\/span>/, "<u>$1</u>");
		text = text.replace(/<span class="Apple-style-span" style="text-decoration: line-through;">(.+?)<\/span>/, "<strike>$1</strike>");
	}
	return text;
};

ZmComposeView.prototype._setMessageFlags =
function(msg) {
		
	if (this._msg) {
		var isInviteReply = ZmComposeController.IS_INVITE_REPLY[this._action];
		if (this._action === ZmOperation.DRAFT || this._msg.isDraft) {
			msg.isReplied = (this._msg.rt === "r");
			msg.isForwarded = (this._msg.rt === "w");
			msg.isDraft = this._msg.isDraft;
			// check if we're resaving a draft that was originally a reply/forward
			if (msg.isDraft) {
				// if so, set both origId and the draft id
				msg.origId = (msg.isReplied || msg.isForwarded) ? this._msg.origId : null;
				msg.id = this._msg.id;
				msg.nId = this._msg.nId;
			}
		} else {
			msg.isReplied = ZmComposeController.IS_REPLY[this._action];
			msg.isForwarded = ZmComposeController.IS_FORWARD[this._action];
			msg.origId = this._msg.id;
		}
        msg.isOfflineCreated = this._msg.isOfflineCreated;
		msg.isInviteReply = isInviteReply;
		msg.acceptFolderId = this._acceptFolderId;
		var notifyActionMap = ZmComposeView.NOTIFY_ACTION_MAP || {};
		var inviteMode = notifyActionMap[this._action] ? notifyActionMap[this._action] : this._action;
		msg.inviteMode = isInviteReply ? inviteMode : null;
        if (!this.isEditAsNew && this._action !== ZmOperation.NEW_MESSAGE && (!msg.isDraft || msg.isReplied)){  //Bug: 82942 - in-reply-to shouldn't be added to new messages.
			 //when editing a saved draft (only from the drafts folder "edit") - _origMsg is the draft msg instead of the replied to message.
            msg.irtMessageId = this._origMsg.isDraft ? this._origMsg.irtMessageId : this._origMsg.messageId;
        }
        msg.folderId = this._msg.folderId;
    }
};

ZmComposeView.prototype._zimletCheck =
function(msg, isDraft, forceBail) {
		
	/*
	* finally, check for any errors via zimlets..
	* A Zimlet can listen to emailErrorCheck action to perform further check and
	* alert user about the error just before sending email. We will be showing
	* yes/no dialog. This zimlet must return an object {hasError:<true or false>,
	* errorMsg:<Some Error msg>, zimletName:<zimletName>} e.g: {hasError:true,
	* errorMsg:"you might have forgotten attaching an attachment, do you want to
	* continue?", zimletName:"com_zimbra_attachmentAlert"}
	**/
	if ((!isDraft || forceBail) && appCtxt.areZimletsLoaded()) {
		var boolAndErrorMsgArray = [];
		var showErrorDlg = false;
		var errorMsg = "";
		var zimletName = "";
		appCtxt.notifyZimlets("emailErrorCheck", [msg, boolAndErrorMsgArray]);
		var blen =  boolAndErrorMsgArray.length;
		for (var k = 0; k < blen; k++) {
			var obj = boolAndErrorMsgArray[k];
			if (obj === null || obj === undefined) { continue; }

			var hasError = obj.hasError;
			zimletName = obj.zimletName;
			if (Boolean(hasError)) {
				if (this._ignoredZimlets) {
					if (this._ignoredZimlets[zimletName]) { // if we should ignore this zimlet
						delete this._ignoredZimlets[zimletName];
						continue; // skip
					}
				}
				showErrorDlg = true;
				errorMsg = obj.errorMsg;
				break;
			}
		}
		if (showErrorDlg) {
			this.enableInputs(false);
			var cd = appCtxt.getOkCancelMsgDialog();
			cd.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
			var params = {errDialog:cd, zimletName:zimletName};
			cd.registerCallback(DwtDialog.OK_BUTTON, this._errViaZimletOkCallback, this, params);
			cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._errViaZimletCancelCallback, this, params);
			cd.popup();
			return false;
		}
	}

	return true;
};

ZmComposeView.prototype.setDocAttachments =
function(msg, docIds) {

	if (!docIds) { return; }

	var zeroSizedAttachments = false;
	var inline = this._isInline();
	for (var i = 0; i < docIds.length; i++) {
		var docAtt = docIds[i];
		var contentType = docAtt.ct;
		if (docAtt.s === 0) {
			zeroSizedAttachments = true;
			continue;
		}
		if (this._attachDialog && inline) {
			if (contentType && contentType.indexOf("image") !== -1) {
				var cid = this._generateCid();
				this._htmlEditor.insertImage("cid:" + cid, AjxEnv.isIE);
				msg.addInlineDocAttachment(cid, docAtt.id);
			} else {
				msg.addDocumentAttachment(docAtt);
			}
		} else {
			msg.addDocumentAttachment(docAtt);
		}
	}
	if (zeroSizedAttachments){
		appCtxt.setStatusMsg(ZmMsg.zeroSizedAtts);
	}
};

// Sets the mode the editor should be in.
ZmComposeView.prototype.setComposeMode =
function(composeMode, initOnly) {

	if (composeMode === this._composeMode) { return; }
		
	var htmlMode = (composeMode === Dwt.HTML);
	if (htmlMode && !appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) { return; }
		
	var previousMode = this._composeMode;
	var modeSwitch = (!initOnly && previousMode && composeMode && previousMode !== composeMode);
	var userText = modeSwitch && this.getUserText();
	var quotedText = modeSwitch && this._getQuotedText();
	this._composeMode = composeMode;
	this._setReturns();

	// switch the editor's mode
	this._htmlEditor.setContent("");
	this._htmlEditor.setMode(composeMode);
		
	if (modeSwitch) {
		userText = htmlMode ? AjxStringUtil.convertToHtml(userText) : AjxStringUtil.trim(this._htmlToText(userText)) + this._crlf;
		var op = htmlMode ? ZmOperation.FORMAT_HTML : ZmOperation.FORMAT_TEXT;
		this.resetBody({ extraBodyText:userText, quotedText:quotedText, op:op, keepAttachments:true });
	}

	// reset the body field Id and object ref
	this._bodyFieldId = this._htmlEditor.getBodyFieldId();
	this._bodyField = Dwt.byId(this._bodyFieldId);
	if (this._bodyField.disabled) {
		this._bodyField.disabled = false;
	}

	this._resetBodySize();

	// recalculate form value since HTML mode inserts HTML tags
	this._setFormValue();

	if (!htmlMode) {
		this._retryHtmlEditorFocus(); //this was previously in a block I removed, so keeping it here. (don't want to create rare focus regressions)
		this._moveCaretOnTimer();
	}

	if (this._msg && this._isInline(this._msg) && composeMode === Dwt.TEXT) {
		this._showForwardField(this._msg, this._action, true);
	}
};

ZmComposeView.prototype._retryHtmlEditorFocus =
function() {
	if (this._htmlEditor.hasFocus()) {
		setTimeout(this._focusHtmlEditor, 10);
	}
};

/**
 * Handles compose in new window.
 * 
 * @param params
 */
ZmComposeView.prototype.setDetach =
function(params) {

	this._action = params.action;
    this._controller._origAction = params.origAction;
	this._msg = params.msg;

	// set the addr fields as populated
	for (var type in params.addrs) {
		this._recipients.setAddress(type, "");
		var addrs = AjxUtil.toArray(params.addrs[type]);
		this._recipients.addAddresses(type, AjxVector.fromArray(addrs));
	}

	this._subjectField.value = params.subj || "";
	this._controller._setPriority(params.priority);
	this.updateTabTitle();

	var content = params.body || "";
	if ((content == "") && (this.getComposeMode() == Dwt.HTML)) {
		content	= "<br>";
	}
	this._htmlEditor.setContent(content);

	this._msgAttId = params.msgAttId;
    if (params.attHtml) {
        this._attcDiv.innerHTML = params.attHtml;
    }
    if (params.partMap && params.partMap.length) {
        this._partToAttachmentMap = params.partMap;
    }
    if (params.origMsgAtt && params.origMsgAtt.part) {
        this._origMsgAtt = params.origMsgAtt;
    }

    if (params.identityId && this.identitySelect) {
		var opt = this.identitySelect.getOptionAtIndex(params.identityId);
		this.identitySelect.setSelectedOption(opt);
		this._controller.resetIdentity(params.identity.id);
	}

	this.backupForm = params.backupForm;
	this.sendUID = params.sendUID;

	// bug 14322 -- in Windows Firefox, DEL/BACKSPACE don't work
	// when composing in new window until we (1) enter some text
	// or (2) resize the window (!).  I chose the latter.
	if (AjxEnv.isGeckoBased && AjxEnv.isWindows) {
		window.resizeBy(1, 1);
	}
};

ZmComposeView.prototype.reEnableDesignMode =
function() {
	if (this._composeMode === Dwt.HTML) {
		this._htmlEditor.reEnableDesignMode();
	}
};

// user just saved draft, update compose view as necessary
ZmComposeView.prototype.processMsgDraft =
function(msgDraft) {

	if (this._isInline(msgDraft)) {
		this._handleInline(msgDraft);
	}
	this.reEnableDesignMode();
    this._msg = msgDraft;

    var incOptions = this._controller._curIncOptions;
    if (!this._origMsgAtt && this._msgAttId && incOptions && incOptions.what === ZmSetting.INC_ATTACH) {
        var msgIdx = AjxUtil.indexOf(msgDraft._msgAttIds, this._msgAttId),
            attMsgs = AjxUtil.filter(msgDraft.attachments, function(att) {
            return att.getContentType() === ZmMimeTable.MSG_RFC822;
        }),
            attMsg = attMsgs[msgIdx];
        if (attMsg) {
            this._origMsgAtt = {
                size:       attMsg.size,
                part:       attMsg.part,
                mid:        this._msgAttId,
                draftId:    msgDraft.id
            }
        }
    }

	this._msgAttId = null;
	// always redo att links since user couldve removed att before saving draft
	this.cleanupAttachments(true);
	this._showForwardField(msgDraft, ZmOperation.DRAFT);
	this._resetBodySize();
	// save form state (to check for change later)
	this._setFormValue();
};

ZmComposeView.prototype._handleInline =
function(msgObj) {
	return this._fixMultipartRelatedImages(msgObj || this._msg, this._htmlEditor._getIframeDoc());
};

ZmComposeView.prototype._fixMultipartRelatedImages_onTimer =
function(msg, account) {
	// The first time the editor is initialized, idoc.getElementsByTagName("img") is empty.
	// Use a callback to fix images after editor is initialized.
	var idoc = this._htmlEditor._getIframeDoc();
	if (this._firstTimeFixImages) {
		var callback = this._fixMultipartRelatedImages.bind(this, msg, idoc, account);
		this._htmlEditor.addOnContentInitializedListener(callback);
		//set timeout in case ZmHtmlEditor.prototype.onLoadContent is never called in which case the listener above won't be called.
		window.setTimeout(callback, 3000);
	} else {
		this._fixMultipartRelatedImages(msg, idoc, account);
	}
};

/**
 * Twiddle the img tags so that the HTML editor can display the images. Instead of
 * a cid (which is relevant only within the MIME msg), point to the img with a URL.
 * 
 * @private
 */
ZmComposeView.prototype._fixMultipartRelatedImages =
function(msg, idoc, account) {

	if (this._firstTimeFixImages) {
		this._htmlEditor.clearOnContentInitializedListeners();
		var self = this; // Fix possible hiccups during compose in new window
		setTimeout(function() {
				self._fixMultipartRelatedImages(msg, self._htmlEditor._getIframeDoc(), account);
		}, 10);
		this._firstTimeFixImages = false;
		return;
	}

	idoc = idoc || this._htmlEditor._getIframeDoc();
	if (!idoc) { return; }

	var showImages = false;
	if (msg) {
		var addr = msg.getAddress(AjxEmailAddress.FROM);
		var sender = msg.getAddress(AjxEmailAddress.SENDER); // bug fix #10652 - check invite if sentBy is set (means on-behalf-of)
		var sentBy = (sender && sender.address) ? sender : addr;
		var sentByAddr = sentBy && sentBy.getAddress();
		if (sentByAddr) {
			msg.sentByAddr = sentByAddr;
			msg.sentByDomain = sentByAddr.substr(sentByAddr.indexOf("@")+1);
			showImages = this._isTrustedSender(msg);
		}
	}

	var images = idoc.getElementsByTagName("img");
	var num = 0;
	for (var i = 0; i < images.length; i++) {
		var dfsrc = images[i].getAttribute("dfsrc") || images[i].getAttribute("data-mce-src") || images[i].src;
		if (dfsrc) {
			if (dfsrc.substring(0,4) === "cid:") {
				num++;
				var cid = "<" + dfsrc.substring(4).replace("%40","@") + ">";
				var src = msg && msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_ID, cid);
				if (src) {
					//Cache cleared, becoz part id's may change.
					src = src + "&t=" + (new Date()).getTime();
					images[i].src = src;
					images[i].setAttribute("dfsrc", dfsrc);
				}
			} else if (dfsrc.substring(0,4) === "doc:") {
                var src = [appCtxt.get(ZmSetting.REST_URL, null, account), ZmFolder.SEP, dfsrc.substring(4)].join('');
				images[i].src = AjxStringUtil.fixCrossDomainReference(src, false, true);;
			} else if (dfsrc.indexOf("//") === -1) { // check for content-location verison
				var src = msg && msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_LOCATION, dfsrc);
				if (src) {
					//Cache cleared, becoz part id's may change.
					src = src + "&t=" + (new Date()).getTime();
					num++;
					images[i].src = src;
					images[i].setAttribute("dfsrc", dfsrc);
				}
			}
			else if (showImages) {
				var src = dfsrc;//x + "&t=" + (new Date()).getTime();
				num++;
				images[i].src = src;
				images[i].setAttribute("dfsrc", dfsrc);
			}
		}
		ZmMailMsgView.__unfangInternalImage(msg, images[i], "src", false);
	}
	return num === images.length;
};

ZmComposeView.prototype._isTrustedSender =
function(msg) {
	var trustedList = this.getTrustedSendersList();
	return trustedList.contains(msg.sentByAddr.toLowerCase()) || trustedList.contains(msg.sentByDomain.toLowerCase());
};

ZmComposeView.prototype.getTrustedSendersList =
function() {
	return this._controller.getApp().getTrustedSendersList();
};

ZmComposeView.prototype._cleanupFileRefImages =
function(idoc) {

	function removeImg(img){
		var parent = img.parentNode;
		parent.removeChild(img);
	}

	if (idoc) {
		var images = idoc.getElementsByTagName("img");
		var len = images.length, fileImgs=[], img, src;
		for (var i = 0; i < images.length; i++) {
			img = images[i];
			if (img && img.src && img.src.indexOf('file://') == 0) {
				removeImg(img);
				i--; //removeImg reduces the images.length by 1.
			}
		}
	}
};

/**
 * the comment below is no longer true, but I keep it for history purposes as this is so complicated. Bug 50178 changed to setting dfsrc instead of src...
 * todo - perhaps rewrite the whole thing regarding inline attachments.
 * Change the src tags on inline img's to point to cid's, which is what we
 * want for an outbound MIME msg.
 */
ZmComposeView.prototype._restoreMultipartRelatedImages =
function(idoc) {

	if (idoc) {
		var images = idoc.getElementsByTagName("img");
		var num = 0;
		for (var i = 0; i < images.length; i++) {
			var img = images[i];
			var cid = "";
			var src = img.src && unescape(img.src);
			var dfsrc = img.getAttribute("dfsrc") || img.getAttribute("data-mce-src");
			if (dfsrc && dfsrc.indexOf("cid:") === 0) {
				return; //dfsrc already set so nothing to do
			} else if (img.src && img.src.indexOf("cid:") === 0) {
				cid = img.src;
			} else if ( dfsrc && dfsrc.substring(0,4) === "doc:"){
				cid = "cid:" + this._generateCid();
				img.removeAttribute("dfsrc");
				img.setAttribute("doc", dfsrc.substring(4, dfsrc.length));
			} else if (src && src.indexOf(appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI)) === 0) {
				// bug 85129 - handle images copied from another mail
				var qsparams = AjxStringUtil.parseQueryString(src);

				if (qsparams.id && qsparams.part) {
					cid = "cid:" + this._generateCid();
					img.setAttribute('data-zimbra-id', qsparams.id);
					img.setAttribute('data-zimbra-part', qsparams.part);
				}
			} else {
				// If "Display External Images" is false then handle Reply/Forward
				if (dfsrc && (!this._msg || this._msg.showImages))
					//IE: Over HTTPS, http src urls for images might cause an issue.
					try {
						img.src = dfsrc;
					} catch(ex) {};
				}
			if (cid) {
				img.setAttribute("dfsrc", cid);
			}
		}
	}
};

ZmComposeView.prototype._cleanupSignatureIds =
function(idoc){
	var signatureEl = idoc && idoc.getElementById(this._controller._currentSignatureId);
	if (signatureEl) {
		signatureEl.removeAttribute("id");
	}
};

/**
 * Display an attachment dialog - either a direct and native upload dialog or
 * the legacy dialog.
 *
 * @param {constant}  type      One of the <code>ZmComposeView.UPLOAD_</code> constants.
 */
ZmComposeView.prototype.showAttachmentDialog =
function(type) {

	if (this._disableAttachments) { return };

	// collapse the attachment menu, just in case
	this.collapseAttMenu();

	if (AjxEnv.supportsHTML5File &&
	    type !== ZmComposeView.UPLOAD_BRIEFCASE) {
		var isinline = (type === ZmComposeView.UPLOAD_INLINE);
		var fileInputElement = ZmComposeView.FILE_INPUT;
		if (fileInputElement) {
			fileInputElement.value = "";
		}
		else {
			ZmComposeView.FILE_INPUT = fileInputElement = document.createElement('INPUT');
			fileInputElement.type = "file";
			fileInputElement.title = ZmMsg.uploadNewFile;
			fileInputElement.multiple = true;
			fileInputElement.style.display = "none";
			document.body.appendChild(fileInputElement);
		}
		fileInputElement.onchange = this._submitMyComputerAttachments.bind(this, null, fileInputElement, isinline);
		fileInputElement.click();
		return;
	}

	var attachDialog = this._attachDialog = appCtxt.getAttachDialog();

	if (type === ZmComposeView.UPLOAD_BRIEFCASE) {
		attachDialog.getBriefcaseView();
	} else {
		attachDialog.getMyComputerView();
	}

	var callback = this._attsDoneCallback.bind(this, true);
	attachDialog.setUploadCallback(callback);
	attachDialog.popup();
	attachDialog.enableInlineOption(this._composeMode === Dwt.HTML);

	if (type === ZmComposeView.UPLOAD_INLINE)
		attachDialog.setInline(true);

};

/**
 * Revert compose view to a clean state (usually called before popping compose view).
 * 
 * @param	{Boolean}	bEnableInputs		if <code>true</code>, enable the input fields
 */
ZmComposeView.prototype.reset = function(bEnableInputs) {

    DBG.println('draft', 'ZmComposeView.reset for ' + this._view);
	this.backupForm = null;
	this.sendUID = null;

	// reset autocomplete list
	if (this._acAddrSelectList) {
		this._acAddrSelectList.reset();
		this._acAddrSelectList.show(false);
	}

	this._recipients.reset();

	// reset subject / body fields
	this._subjectField.value = this._subject = "";
	this.updateTabTitle();

	this._htmlEditor.resetSpellCheck();
	this._htmlEditor.clear();

	// this._htmlEditor.clear() resets html editor body field.
	// Setting this._bodyField to its latest value
	this._bodyField = this._htmlEditor.getBodyField();
	this._bodyContent = {};

	// the div that holds the attc.table and null out innerHTML
	this.cleanupAttachments(true);

	this._resetBodySize();
	this._controller._curIncOptions = null;
	this._msgAttId = null;
    this._origMsgAtt = null;
    this._clearFormValue();
	this._components = {};
		
	// reset dirty shields
	this._noSubjectOkay = this._badAddrsOkay = this._spellCheckOkay = false;

	Dwt.setVisible(this._oboRow, false);

	// Resetting Add attachments from original link option
	Dwt.setVisible(ZmId.getViewId(this._view, ZmId.CMP_REPLY_ATT_ROW), false);

	// remove extra mime parts
	this._extraParts = null;

	// enable/disable input fields
	this.enableInputs(bEnableInputs);

	// reset state of the spell check button
	this._controller.toggleSpellCheckButton(false);

	//reset state of previous Signature cache variable.
	this._previousSignature = null;
	this._previousSignatureMode = null;

	// used by drafts handling in multi-account
	this._origAcctMsgId = null;
};

ZmComposeView.prototype.enableInputs =
function(bEnable) {
    DBG.println('draft', 'ZmComposeView.enableInputs for ' + this._view + ': ' + bEnable);
    this._recipients.enableInputs(bEnable);
	this._subjectField.disabled = this._bodyField.disabled = !bEnable;
};

/**
 * Adds an extra MIME part to the message. The extra parts will be
 * added, in order, to the end of the parts after the primary message
 * part.
 * 
 * @private
 */
ZmComposeView.prototype.addMimePart =
function(mimePart) {
	if (!this._extraParts) {
		this._extraParts = [];
	}
	this._extraParts.push(mimePart);
};

// Returns the full content for the signature, including surrounding tags if in HTML mode.
ZmComposeView.prototype._getSignatureContentSpan =
function(params) {

	var signature = params.signature || this.getSignatureById(this._controller.getSelectedSignature(), params.account);
	if (!signature) { return ""; }

	var signatureId = signature.id;
	var mode = params.mode || this._composeMode;
	var sigContent = params.sigContent || this.getSignatureContent(signatureId, mode);
	if (mode === Dwt.HTML) {
		var markerHtml = "";
		if (params.style === ZmSetting.SIG_OUTLOOK) {
			markerHtml = " " + ZmComposeView.BC_HTML_MARKER_ATTR + "='" + params.marker + "'";
		}
		sigContent = ["<div id=\"", signatureId, "\"", markerHtml, ">", sigContent, "</div>"].join('');
	}

	return this._getSignatureSeparator(params) + sigContent;
};

ZmComposeView.prototype._attachSignatureVcard =
function(signatureId) {

	var signature = this.getSignatureById(signatureId);
	if (signature && signature.contactId && !this._findVcardAtt(this._msg, signature, false)) {
		if (!this._msg) {
			this._msg = new ZmMailMsg();
		}
		if (this._msg._contactAttIds) {
			this._msg._contactAttIds.push(signature.contactId);
		} else {
			this._msg.setContactAttIds(signature.contactId);
		}

		//come back later and see if we need to save the draft
		AjxTimedAction.scheduleAction(this._checkSaveDraft.bind(this), 500);
	}
};

ZmComposeView.prototype._updateSignatureVcard =
function(oldSignatureId, newSignatureId) {

	if (oldSignatureId) {
		var hadVcard = false;
		// uncheck box for previous vcard att so it gets removed
		var oldSig = this.getSignatureById(oldSignatureId);
		if (oldSig && oldSig.contactId) {
            var vcardPart = this._findVcardAtt(this._msg, oldSig, true),
			    inputs = document.getElementsByName(ZmComposeView.FORWARD_ATT_NAME + this._sessionId);

			if (inputs && inputs.length) {
				for (var i = 0; i < inputs.length; i++) {
					if (inputs[i].value === vcardPart) {
						var span = inputs[i].parentNode && inputs[i].parentNode.parentNode;
						if (span && span.id) {
							this._removeAttachedMessage(span.id, vcardPart);
							hadVcard = true;
						}
					}
				}
			}
		}
		if (hadVcard && !newSignatureId) {
			this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_MANUAL);
		}
	}
};

/**
 * Searches for a vcard in a message's attachments. If the contact has not yet been loaded, we assume that
 * a vcard attachment that we find is for that contact. Multiple vcard attachment where the first one is not
 * from the signature should be very rare.
 *
 * @param {ZmMailMsg}       msg         mail message
 * @param {ZmSignature}     signature   a signature
 * @param {boolean}         removeAtt   if true, remove the vcard attachment from the msg
 *
 * @returns {string}    part number of vcard, or "undefined" if not found
 * @private
 */
ZmComposeView.prototype._findVcardAtt = function(msg, signature, removeAtt) {

    if (signature && signature.contactId) {

        var vcardPart,
            atts = msg && msg.attachments;

        if (atts && atts.length) {
            //we need to figure out what input to uncheck
            var sigContact,
                item = appCtxt.cacheGet(signature.contactId);

            if (item && item.isZmContact) {
                sigContact = item;
            }

            for (var i = 0; i < atts.length && !vcardPart; i++) {
                var att = atts[i];
                if (ZmMimeTable.isVcard(att.contentType)) {
                    //we may have multiple vcards, determine which one to remove based on signature in cache
                    if (sigContact) {
                        // remove the .vcf file extension and try to match on the contact's name
                        var name = att.fileName.substring(0, att.fileName.length - 4);
                        if (name === sigContact._fileAs) {
                            vcardPart = att.part;
                        }
                    }
                    else {
                        vcardPart = att.part;
                    }
                    if (removeAtt) {
                        atts.splice(i, 1);
                    }
                }
            }
        }
    }

    return vcardPart;
};

ZmComposeView.prototype._checkSaveDraft =
function() {
	if (this._msg && this._msg._contactAttIds && this._msg._contactAttIds.length > 0) {
		this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_MANUAL, null, null, null, this._msg._contactAttIds);
	}
};

/*
 * Convertor for text nodes that, unlike the one in AjxStringUtil._traverse, doesn't append spaces to the results
*/
ZmComposeView._convertTextNode =
function(el, ctxt) {

	if (el.nodeValue.search(AjxStringUtil._NON_WHITESPACE) !== -1) {
		if (ctxt.lastNode === "ol" || ctxt.lastNode === "ul") {
			return "\n";
		}
		if (ctxt.isPreformatted) {
			return AjxStringUtil.trim(el.nodeValue);
		} else {
			return AjxStringUtil.trim(el.nodeValue.replace(AjxStringUtil._LF, ""));
		}
	}
	return "";
};

ZmComposeView.prototype.dispose =
function() {
	if (this._identityChangeListenerObj) {
		var collection = appCtxt.getIdentityCollection();
        if (collection) {
		    collection.removeChangeListener(this._identityChangeListenerObj);
        }
	}
	DwtComposite.prototype.dispose.call(this);
};

ZmComposeView.prototype.getSignatureById =
function(signatureId, account) {
	signatureId = signatureId || this._controller.getSelectedSignature();
	return appCtxt.getSignatureCollection(account).getById(signatureId);
};

ZmComposeView.prototype.getSignatureContent =
function(signatureId, mode) {

	var extraSignature = this._getExtraSignature();
	signatureId = signatureId || this._controller.getSelectedSignature();

	if (!signatureId && !extraSignature) { return; }

	var signature;

	// for multi-account, search all accounts for this signature ID
	if (appCtxt.multiAccounts) {
		var ac = window.parentAppCtxt || window.appCtxt;
		var list = ac.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			var collection = appCtxt.getSignatureCollection(list[i]);
			if (collection) {
				signature = collection.getById(signatureId);
				if (signature) {
					break;
				}
			}
		}
	} else {
		signature = appCtxt.getSignatureCollection().getById(signatureId);
	}

	if (!signature && !extraSignature) { return; }

	mode = mode || this._composeMode;
    var htmlMode = (mode === Dwt.HTML);
    var sig = signature ? signature.getValue(htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN) : "";
    sig = AjxStringUtil.trim(sig + extraSignature) + (htmlMode ? "" : this._crlf);

	return sig;
};

/**
 * Returns "" or extra signature (like a quote or legal disclaimer) via zimlet
 */
ZmComposeView.prototype._getExtraSignature =
function() {
	var extraSignature = "";
	if (appCtxt.zimletsPresent()) {
		var buffer = [];
		appCtxt.notifyZimlets("appendExtraSignature", [buffer]);
		extraSignature = buffer.join(this._crlf);
		if (extraSignature) {
			extraSignature = this._crlf + extraSignature;
		}
	}
	return extraSignature;
};

ZmComposeView.prototype._getSignatureSeparator =
function(params) {

	var sep = "";
	params = params || {};
	if (params.style === ZmSetting.SIG_INTERNET) {
		var mode = params.mode || this._composeMode;
		if (mode === Dwt.HTML) {
			sep = "<div " + ZmComposeView.BC_HTML_MARKER_ATTR + "='" + params.marker + "'>-- " + this._crlf + "</div>";
		}
		else {
			sep += "-- " + this._crlf;
		}
	}
	return sep;
};

ZmComposeView.prototype._getSignatureIdForAction =
function(identity, action) {

	identity = identity || this.getIdentity();
	action = action || this._action;
	var field = (ZmComposeController.IS_REPLY[action] || ZmComposeController.IS_FORWARD[action]) ? ZmIdentity.REPLY_SIGNATURE : ZmIdentity.SIGNATURE;
	return identity && identity.getField(field);
};

/**
* Returns true if form contents have changed, or if they are empty.
*
* @param incAddrs		takes addresses into consideration
* @param incSubject		takes subject into consideration
* 
* @private
*/
ZmComposeView.prototype.isDirty =
function(incAddrs, incSubject) {

	if (this._isDirty) {
        DBG.println('draft', 'ZmComposeView.isDirty ' + this._view + ': true');
		return true;
	}

    // Addresses, Subject, non-html mode edit content
	var curFormValue = this._formValue(incAddrs, incSubject);
    // Html editor content changed
    var htmlEditorDirty =  this._htmlEditor && this._htmlEditor.isDirty(),
        dirty = (curFormValue !== this._origFormValue) || htmlEditorDirty;

    DBG.println('draft', 'ZmComposeView.isDirty ' + this._view + ': '  + dirty);

    return dirty;
};

ZmComposeView.removeAttachedFile = function(ev, cvId, spanId, partId) {

	var composeView = DwtControl.fromElementId(cvId);
	if (composeView) {
		if (ev.type === 'click' || (ev.type === 'keypress' && DwtKeyEvent.getCharCode(ev) === 13)) {
			composeView._removeAttachedFile(spanId, partId);
		}
	}
};

ZmComposeView.prototype._removeAttachedFile  =
function(spanId, attachmentPart) {

	var node = document.getElementById(spanId),
	    parent = node && node.parentNode;
	this._attachCount--;

	if (parent) {
		parent.removeChild(node);
	}

	/* Not sure about the purpose of below code so commenting it out instead of deleting.
	When a attachment is removed it should not change the original message. See bug 76776.

	if (attachmentPart) {
	var numAttachments = (this._msg &&  this._msg.attachments && this._msg.attachments.length ) || 0;
		for (var i = 0; i < numAttachments; i++) {
			if (this._msg.attachments[i].part === attachmentPart) {
			   this._msg.attachments.splice(i, 1);
			   break;
			}
		}
	}*/

	if (!parent.childNodes.length) {
		this.cleanupAttachments(true);
	}
};

ZmComposeView.prototype._removeAttachedMessage =
function(spanId, id){
  
	// Forward/Reply one message
	if (!id) {
		this._msgAttId = this._origMsgAtt = null;
	}
	else {
		var index = this._msgIds && this._msgIds.length ? AjxUtil.indexOf(this._msgIds, id) : -1;
		if (index !== -1) {
			// Remove message from attached messages
			this._msgIds.splice(index, 1);
		}
	}

	this._removeAttachedFile(spanId);
};

ZmComposeView.prototype.cleanupAttachments =
function(all) {

	var attachDialog = this._attachDialog;
	if (attachDialog && attachDialog.isPoppedUp()) {
		attachDialog.popdown();
	}

	if (all) {
		var hint = AjxEnv.supportsHTML5File && !this._disableAttachments ?
			ZmMsg.dndTooltip : "&nbsp;";

		this._attcDiv.innerHTML =
			AjxTemplate.expand('mail.Message#NoAttachments', { hint: hint });
		this._attcDiv.style.height = "";
		this._attcTabGroup.removeAllMembers();
		this._attachCount = 0;
	}

	// make sure att IDs don't get reused
	if (this._msg) {
		this._msg.attId = null;
		this._msg._contactAttIds = [];
	}
};

ZmComposeView.prototype.sendMsgOboIsOK =
function() {
	return Dwt.getVisible(this._oboRow) ? this._oboCheckbox.checked : false;
};

ZmComposeView.prototype.updateTabTitle =
function() {
	var buttonText = this._subjectField.value
		? this._subjectField.value.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT)
		: ZmComposeController.DEFAULT_TAB_TEXT;
	appCtxt.getAppViewMgr().setTabTitle(this._controller.getCurrentViewId(), buttonText);
};

/**
 * Used in multi-account mode to determine which account this composer is
 * belongs to.
 */
ZmComposeView.prototype.getFromAccount =
function() {
	var ac = window.parentAppCtxt || window.appCtxt;
	return this._fromSelect
		? (ac.accountList.getAccount(this._fromSelect.getSelectedOption().accountId))
		: (ac.accountList.defaultAccount || ac.accountList.activeAccount || ac.accountList.mainAccount);
};

// Private / protected methods

ZmComposeView.prototype._getForwardAttObjs =
function(parts) {
	var forAttObjs = [];
	for (var i = 0; i < this._partToAttachmentMap.length; i++) {
		for (var j = 0; j < parts.length; j++) {
			if (this._partToAttachmentMap[i].part === parts[j]) {
				forAttObjs.push( { part : parts[j], mid : this._partToAttachmentMap[i].mid } );
				break;
			}
		}
	}
	return forAttObjs;
};

ZmComposeView.prototype._getForwardAttIds =
function(name, removeOriginalAttachments) {

	var forAttIds = [];
	var forAttList = document.getElementsByName(name);

	// walk collection of input elements
	for (var i = 0; i < forAttList.length; i++) {
			var part = forAttList[i].value;
			if (this._partToAttachmentMap.length && removeOriginalAttachments) {
				var att = this._partToAttachmentMap[i].part;
				var original = this._originalAttachments[att.label];
				original = original && att.sizeInBytes;
				if (removeOriginalAttachments && original) {
					continue;
				}
			}
			forAttIds.push(part);
	}

	return forAttIds;
};

/**
 * Set various address headers based on the original message and the mode we're in.
 * Make sure not to duplicate any addresses, even across fields. Figures out what
 * addresses to put in To: and Cc: unless the caller passes addresses to use (along
 * with their type).
 * 
 * @param {string}				action		compose action
 * @param {string}				type		address type
 * @param {AjxVector|array}		override	addresses to use
 */
ZmComposeView.prototype._setAddresses =
function(action, type, override) {

	if (override) {
		this._recipients.addAddresses(type, override);
	}
	else {
		var identityId = this.identitySelect && this.identitySelect.getValue();
		var addresses = ZmComposeView.getReplyAddresses(action, this._msg, this._origMsg, identityId);
		if (addresses) {
			var toAddrs = addresses[AjxEmailAddress.TO];
			if (!(toAddrs && toAddrs.length)) {
				// make sure we have at least one TO address if possible
				var addrVec = this._origMsg.getAddresses(AjxEmailAddress.TO);
				addresses[AjxEmailAddress.TO] = addrVec.getArray().slice(0, 1);
			}
			for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
				var type = ZmMailMsg.COMPOSE_ADDRS[i];
				this._recipients.addAddresses(type, addresses[type]);
			}
		}
	}
};

ZmComposeView.getReplyAddresses =
function(action, msg, addrsMsg, identityId) {
		
	addrsMsg = addrsMsg || msg;
	var addresses = {};
	if ((action == ZmOperation.NEW_MESSAGE) || !msg || !addrsMsg) {
		return null;
	}
		
	ZmComposeController._setStatics();
	if (ZmComposeController.IS_REPLY[action]) {
		var ac = window.parentAppCtxt || window.appCtxt;

		// Prevent user's login name and aliases from becoming recipient addresses
		var userAddrs = {};
		var account = appCtxt.multiAccounts && msg.getAccount();
		var uname = ac.get(ZmSetting.USERNAME, null, account);
		if (uname) {
			userAddrs[uname.toLowerCase()] = true;
		}
		var aliases = ac.get(ZmSetting.MAIL_ALIASES, null, account);
		for (var i = 0, count = aliases.length; i < count; i++) {
			userAddrs[aliases[i].toLowerCase()] = true;
		}

		// Check for canonical addresses
		var defaultIdentity = ac.getIdentityCollection(account).defaultIdentity;
		if (defaultIdentity && defaultIdentity.sendFromAddress) {
			// Note: sendFromAddress is same as appCtxt.get(ZmSetting.USERNAME)
			// if the account does not have any canonical address assigned.
			userAddrs[defaultIdentity.sendFromAddress.toLowerCase()] = true;
		}

		// When updating address lists, use addresses msg instead of msg, because
		// msg changes after a draft is saved.
		var isDefaultIdentity = !identityId || (identityId && (defaultIdentity.id === identityId)); 
		var addrVec = addrsMsg.getReplyAddresses(action, userAddrs, isDefaultIdentity, true);
		addresses[AjxEmailAddress.TO] = addrVec ? addrVec.getArray() : [];
		if (action === ZmOperation.REPLY_ALL || action === ZmOperation.CAL_REPLY_ALL) {
			var toAddrs = addrsMsg.getAddresses(AjxEmailAddress.TO, userAddrs, false, true);
			var ccAddrs = addrsMsg.getAddresses(AjxEmailAddress.CC, userAddrs, false, true);
			toAddrs.addList(ccAddrs);
			addresses[AjxEmailAddress.CC] = toAddrs.getArray();
		}
	} else if (action === ZmOperation.DRAFT || action === ZmOperation.SHARE) {
		for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
			var type = ZmMailMsg.COMPOSE_ADDRS[i];
			var addrs = msg.getAddresses(type);
			addresses[type] = addrs ? addrs.getArray() : [];
		}
	} else if (action === ZmOperation.DECLINE_PROPOSAL) {
		var toAddrs = addrsMsg.getAddresses(AjxEmailAddress.FROM);
		addresses[AjxEmailAddress.TO] = toAddrs ? toAddrs.getArray() : [];
	}

	if (action === ZmOperation.DRAFT) {
		//don't mess with draft addresses, this is what the user wanted, this is what they'll get, including duplicates.
		return addresses;
	}

	// Make a pass to remove duplicate addresses
	var addresses1 = {}, used = {};
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		var addrs1 = addresses1[type] = [];
		var addrs = addresses[type];
		if (addrs && addrs.length) {
			for (var j = 0, len = addrs.length; j < len; j++) {
				var addr = addrs[j];
				if (!used[addr.address]) {
					addrs1.push(addr);
				}
				used[addr.address] = true;
			}
		}
	}
	return addresses1;
};

ZmComposeView.prototype._setSubject =
function(action, msg, subjOverride) {

	if ((action === ZmOperation.NEW_MESSAGE && !subjOverride)) {
		return;
	}

	var subj = subjOverride || (msg ? msg.subject : "");

	if (action === ZmOperation.REPLY_CANCEL && !subj) {
		var inv = msg && msg.invite;
		if (inv) {
			subj = inv.getName();
		}
	}

	if (action !== ZmOperation.DRAFT && subj) {
		subj = ZmMailMsg.stripSubjectPrefixes(subj);
	}

	var prefix = "";
	switch (action) {
		case ZmOperation.CAL_REPLY:
		case ZmOperation.CAL_REPLY_ALL:
		case ZmOperation.REPLY:
		case ZmOperation.REPLY_ALL: 		prefix = "Re: "; break;
		case ZmOperation.REPLY_CANCEL: 		prefix = ZmMsg.cancelled + ": "; break;
		case ZmOperation.FORWARD_INLINE:
		case ZmOperation.FORWARD_ATT: 		prefix = "Fwd: "; break;
		case ZmOperation.REPLY_ACCEPT:		prefix = ZmMsg.subjectAccept + ": "; break;
		case ZmOperation.REPLY_DECLINE:		prefix = ZmMsg.subjectDecline + ": "; break;
		case ZmOperation.REPLY_TENTATIVE:	prefix = ZmMsg.subjectTentative + ": "; break;
		case ZmOperation.REPLY_NEW_TIME:	prefix = ZmMsg.subjectNewTime + ": "; break;
	}
		
	subj = this._subject = prefix + (subj || "");
	if (this._subjectField) {
		this._subjectField.value = subj;
		this.updateTabTitle();
	}
};

ZmComposeView.prototype._setBody = function(action, msg, extraBodyText, noEditorUpdate, keepAttachments, extraBodyTextIsExternal, incOptions) {

	this._setReturns();
	var htmlMode = (this._composeMode === Dwt.HTML);

	var isDraft = (action === ZmOperation.DRAFT);

	// get reply/forward prefs as necessary
	var incOptions = this._controller._curIncOptions = this._controller._curIncOptions || incOptions;
	var ac = window.parentAppCtxt || window.appCtxt;
	if (!incOptions) {
		if (ZmComposeController.IS_REPLY[action]) {
			incOptions = {what:		ac.get(ZmSetting.REPLY_INCLUDE_WHAT),
						  prefix:	ac.get(ZmSetting.REPLY_USE_PREFIX),
						  headers:	ac.get(ZmSetting.REPLY_INCLUDE_HEADERS)};
		} else if (isDraft) {
			incOptions = {what:		ZmSetting.INC_BODY};
		} else if (action === ZmOperation.FORWARD_INLINE) {
			incOptions = {what:		ZmSetting.INC_BODY,
						  prefix:	ac.get(ZmSetting.FORWARD_USE_PREFIX),
						  headers:	ac.get(ZmSetting.FORWARD_INCLUDE_HEADERS)};
        } else if (action === ZmOperation.FORWARD_ATT && msg && !msg.isDraft) {
            incOptions = {what:		ZmSetting.INC_ATTACH};
		} else if (action === ZmOperation.DECLINE_PROPOSAL) {
			incOptions = {what:		ZmSetting.INC_BODY};
		} else if (action === ZmOperation.NEW_MESSAGE) {
			incOptions = {what:		ZmSetting.INC_NONE};
		} else {
			incOptions = {};
		}
		this._controller._curIncOptions = incOptions;	// pointer, not a copy
	}
	if (incOptions.what === ZmSetting.INC_ATTACH && !this._msg) {
		incOptions.what = ZmSetting.INC_NONE;
	}
		
	// make sure we've loaded the part with the type we want to reply in, if it's available
	if (msg && (incOptions.what === ZmSetting.INC_BODY || incOptions.what === ZmSetting.INC_SMART)) {
		var desiredPartType = htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
		msg.getBodyPart(desiredPartType, this._setBody1.bind(this, action, msg, extraBodyText, noEditorUpdate, keepAttachments, extraBodyTextIsExternal));
	}
	else {
		this._setBody1(action, msg, extraBodyText, noEditorUpdate, keepAttachments, extraBodyTextIsExternal);
	}
};

ZmComposeView.prototype._setReturns =
function(mode) {
	mode = mode || this._composeMode;
	var htmlMode = (mode === Dwt.HTML);
	this._crlf = htmlMode ? AjxStringUtil.CRLF_HTML : AjxStringUtil.CRLF;
	this._crlf2 = htmlMode ? AjxStringUtil.CRLF2_HTML : AjxStringUtil.CRLF2;
};

// body components
ZmComposeView.BC_NOTHING		= "NOTHING";		// marks beginning and ending
ZmComposeView.BC_TEXT_PRE		= "TEXT_PRE";		// canned text (might be user-entered or some form of extraBodyText) 
ZmComposeView.BC_SIG_PRE		= "SIG_PRE";		// a sig that goes above quoted text
ZmComposeView.BC_DIVIDER		= "DIVIDER";		// tells reader that quoted text is coming
ZmComposeView.BC_HEADERS		= "HEADERS";		// from original msg
ZmComposeView.BC_QUOTED_TEXT	= "QUOTED_TEXT";	// quoted text
ZmComposeView.BC_SIG_POST		= "SIG_POST";		// a sig that goes below quoted text

ZmComposeView.BC_ALL_COMPONENTS = [
		ZmComposeView.BC_NOTHING,
		ZmComposeView.BC_TEXT_PRE,
		ZmComposeView.BC_SIG_PRE,
		ZmComposeView.BC_DIVIDER,
		ZmComposeView.BC_HEADERS,
		ZmComposeView.BC_QUOTED_TEXT,
		ZmComposeView.BC_SIG_POST,
		ZmComposeView.BC_NOTHING
];

// Zero-width space character we can use to create invisible separators for text mode
// Note: as of 10/31/14, Chrome Canary does not recognize \u200B (though it does find \uFEFF)
ZmComposeView.BC_MARKER_CHAR = '\u200B';
ZmComposeView.BC_MARKER_REGEXP = new RegExp(ZmComposeView.BC_MARKER_CHAR, 'g');

// Create a unique marker sequence (vary by length) for each component, and regexes to find them
ZmComposeView.BC_TEXT_MARKER = {};
ZmComposeView.BC_TEXT_MARKER_REGEX1 = {};
ZmComposeView.BC_TEXT_MARKER_REGEX2 = {};

AjxUtil.foreach(ZmComposeView.BC_ALL_COMPONENTS, function(comp, index) {
	if (comp !== ZmComposeView.BC_NOTHING) {
		// Note: relies on BC_NOTHING coming first
		var markerChar = ZmComposeView.BC_MARKER_CHAR;
		var marker = ZmComposeView.BC_TEXT_MARKER[comp] = AjxStringUtil.repeat(markerChar, index);

		ZmComposeView.BC_TEXT_MARKER_REGEX1[comp] = new RegExp("^" + marker + "[^" + markerChar + "]");
		ZmComposeView.BC_TEXT_MARKER_REGEX2[comp] = new RegExp("[^" + markerChar + "]" + marker + "[^" + markerChar + "]");
	}
});

// HTML marker is an expando attr whose value is the name of the component
ZmComposeView.BC_HTML_MARKER_ATTR = "data-marker";

ZmComposeView.prototype._setBody1 =
function(action, msg, extraBodyText, noEditorUpdate, keepAttachments, extraBodyTextIsExternal) {
		
	var htmlMode = (this._composeMode === Dwt.HTML);
	var isDraft = (action === ZmOperation.DRAFT);
	var incOptions = this._controller._curIncOptions;

	// clear in case of switching from "as attachment" back to "include original message" or to "don't include original"
	this._msgAttId = null;

	if (extraBodyText) {
        // convert text if composing as HTML (check for opening < to see if content is already HTML, should work most of the time)
        if (extraBodyTextIsExternal && htmlMode && extraBodyText.charAt(0) !== '<') {
            extraBodyText = AjxStringUtil.convertToHtml(extraBodyText);
        }
		this.setComponent(ZmComposeView.BC_TEXT_PRE, this._normalizeText(extraBodyText, htmlMode));
	}

	var compList = ZmComposeView.BC_ALL_COMPONENTS;
		
	if (action === ZmOperation.DRAFT) {
		compList = [ZmComposeView.BC_QUOTED_TEXT];
	}
	else if (action === ZmOperation.REPLY_CANCEL) {
		compList = [ZmComposeView.BC_TEXT_PRE, ZmComposeView.BC_SIG_PRE, ZmComposeView.BC_SIG_POST];
	}
	else if (incOptions.what === ZmSetting.INC_NONE || incOptions.what === ZmSetting.INC_ATTACH) {
		compList = [ZmComposeView.BC_NOTHING, ZmComposeView.BC_TEXT_PRE, ZmComposeView.BC_SIG_PRE, ZmComposeView.BC_SIG_POST];
		if (this._msg && incOptions.what == ZmSetting.INC_ATTACH) {
			this._msgAttId = this._origMsg ? this._origMsg.id : this._msg.id;
		}
	}

	var isHtmlEditorInitd = this._htmlEditor && this._htmlEditor.isHtmlModeInited();
	if (this._htmlEditor && !noEditorUpdate && !isHtmlEditorInitd) {
		this._fixMultipartRelatedImages_onTimer(msg);
		this._htmlEditor.addOnContentInitializedListener(this._saveComponentContent.bind(this, true));
		//set timeout in case ZmHtmlEditor.prototype.onLoadContent is never called in which case the listener above won't be called.
		//but don't pass "force" so if the above was called first, don't do anything.
		window.setTimeout(this._saveComponentContent.bind(this), 3000);
	}

	var bodyInfo = {};
	var what = incOptions.what;
	if (msg && (what === ZmSetting.INC_BODY || what === ZmSetting.INC_SMART)) {
		bodyInfo = this._getBodyContent(msg, htmlMode, what);
	}
	var params = {action:action, msg:msg, incOptions:incOptions, bodyInfo:bodyInfo};
	var value = this._layoutBodyComponents(compList, null, params);
		
	if (this._htmlEditor && !noEditorUpdate) {
		this._htmlEditor.setContent(value);
	    if (!htmlMode && ZmComposeController.IS_REPLY[action]) {
                this._setBodyFieldCursor();
           }
	}
		
	if (isHtmlEditorInitd && !noEditorUpdate) {
		this._fixMultipartRelatedImages_onTimer(msg);
		this._saveComponentContent(true);
	}

	var ac = window.parentAppCtxt || window.appCtxt;
	var hasInlineImages = (bodyInfo.hasInlineImages) || !ac.get(ZmSetting.VIEW_AS_HTML);
	if (!keepAttachments) {
		//do not call this when switching between text and html editor.
		this._showForwardField(msg || this._msg, action, hasInlineImages, bodyInfo.hasInlineAtts);
	}

	var sigId = this._controller.getSelectedSignature();
	if (sigId && !isDraft) {
		this._attachSignatureVcard(sigId);
	}

	if (!this._htmlEditor && htmlMode) {
		// wrap <html> and <body> tags around content, and set font style
		value = ZmHtmlEditor._embedHtmlContent(value, true);
	}
				
	this._bodyContent[this._composeMode] = value;
};

/**
 * Sets the value of the given component.
 * 
 * @param {string}		comp		component identifier (ZmComposeView.BC_*)
 * @param {string}		compValue	value
 * @param {string}		mode		compose mode
 */
ZmComposeView.prototype.setComponent =
function(comp, compValue, mode) {

	this._components[Dwt.TEXT] = this._components[Dwt.TEXT] || {};
	this._components[Dwt.HTML] = this._components[Dwt.HTML] || {};

	mode = mode || this._composeMode;
	this._components[mode][comp] = compValue;
};

/**
 * Returns the current value of the given component.
 * 
 * @param {string}		comp		component identifier (ZmComposeView.BC_*)
 * @param {string}		mode		compose mode
 * @param {hash}		params		msg, include options, and compose mode
 */
ZmComposeView.prototype.getComponent =
function(comp, mode, params) {
		
	mode = mode || this._composeMode;
	var value = this._components[mode] && this._components[mode][comp];
	if (value || value === ZmComposeView.EMPTY) {
		return value === ZmComposeView.EMPTY ? "" : value;
	}

	switch (comp) {
		case ZmComposeView.BC_SIG_PRE: {
			return this._getSignatureComponent(ZmSetting.SIG_OUTLOOK, mode);
		}
		case ZmComposeView.BC_DIVIDER: {
			return this._getDivider(mode, params);
		}
		case ZmComposeView.BC_HEADERS: {
			return this._getHeaders(mode, params);
		}
		case ZmComposeView.BC_QUOTED_TEXT: {
			return this._getBodyComponent(mode, params || {});
		}
		case ZmComposeView.BC_SIG_POST:
			return this._getSignatureComponent(ZmSetting.SIG_INTERNET, mode);
	}
};

/**
 * Returns true if the given component is part of the compose body.
 * 
 * @param {string}		comp		component identifier (ZmComposeView.BC_*)
 */
ZmComposeView.prototype.hasComponent =
function(comp) {
	return AjxUtil.arrayContains(this._compList, comp);
};

/**
 * Takes the given list of components and returns the text that represents the aggregate of
 * their content.
 * 
 * @private
 * @param {array}	components		list of component IDs
 * @param {hash}	params			msg, include options, and compose mode
 */
ZmComposeView.prototype._layoutBodyComponents =
function(components, mode, params) {
		
	if (!(components && components.length)) {
		return "";
	}
		
	mode = mode || this._composeMode;
	var htmlMode = (mode === Dwt.HTML);
	this._headerText = "";
	this._compList = [];
	var value = "";
	var prevComp, prevValue;
	for (var i = 0; i < components.length; i++) {
		var comp = components[i];
		var compValue = this.getComponent(comp, mode, params) || "";
		var spacing = (prevComp && compValue) ? this._getComponentSpacing(prevComp, comp, prevValue, compValue) : "";
		if (compValue || (comp === ZmComposeView.BC_NOTHING)) {
			prevComp = comp;
			prevValue = compValue;
		}
		if (compValue) {
			if (!htmlMode) {
				compValue = this._getMarker(Dwt.TEXT, comp) + compValue;
			}
			value += spacing + compValue;
			this._compList.push(comp);
		}
	}

	return value;
};

ZmComposeView.prototype._getMarker =
function(mode, comp) {
	return (this._marker && this._marker[mode] &&  this._marker[mode][comp]) || "";
};

// Chart for determining number of blank lines between non-empty components.
ZmComposeView.BC_SPACING = AjxUtil.arrayAsHash(ZmComposeView.BC_ALL_COMPONENTS,
                                               function() { return Object() });

ZmComposeView.BC_SPACING[ZmComposeView.BC_NOTHING][ZmComposeView.BC_SIG_PRE]		= 2;
ZmComposeView.BC_SPACING[ZmComposeView.BC_NOTHING][ZmComposeView.BC_DIVIDER]		= 2;
ZmComposeView.BC_SPACING[ZmComposeView.BC_NOTHING][ZmComposeView.BC_SIG_POST]		= 2;
ZmComposeView.BC_SPACING[ZmComposeView.BC_TEXT_PRE][ZmComposeView.BC_SIG_PRE]		= 1;
ZmComposeView.BC_SPACING[ZmComposeView.BC_TEXT_PRE][ZmComposeView.BC_DIVIDER]		= 1;
ZmComposeView.BC_SPACING[ZmComposeView.BC_TEXT_PRE][ZmComposeView.BC_SIG_POST]		= 1;
ZmComposeView.BC_SPACING[ZmComposeView.BC_SIG_PRE][ZmComposeView.BC_DIVIDER]		= 1;
ZmComposeView.BC_SPACING[ZmComposeView.BC_DIVIDER][ZmComposeView.BC_QUOTED_TEXT]	= 1;
ZmComposeView.BC_SPACING[ZmComposeView.BC_HEADERS][ZmComposeView.BC_QUOTED_TEXT]	= 1;
ZmComposeView.BC_SPACING[ZmComposeView.BC_QUOTED_TEXT][ZmComposeView.BC_SIG_POST]	= 1;

// Returns the proper amount of space (blank lines) between two components.
ZmComposeView.prototype._getComponentSpacing =
function(comp1, comp2, val1, val2) {

	if (!(comp1 && comp2)) {
		return "";
	}
		
	val1 = val1 || !!(this.getComponent(comp1) || comp1 == ZmComposeView.BC_NOTHING);
	val2 = val2 || !!(this.getComponent(comp2) || comp2 == ZmComposeView.BC_NOTHING);
		
	var num = (val1 && val2) && ZmComposeView.BC_SPACING[comp1][comp2];
	// special case - HTML with headers or prefixes will create space after divider, so we don't need to add spacing
	var incOptions = this._controller._curIncOptions;
	var htmlMode = (this._composeMode === Dwt.HTML);
	if (htmlMode && comp1 === ZmComposeView.BC_DIVIDER && comp2 === ZmComposeView.BC_QUOTED_TEXT &&
			(incOptions.prefix || incOptions.headers)) {
		num = 0;
	}
	// minimize the gap between two BLOCKQUOTE sections (which have the blue line on the left)
	if (htmlMode && comp1 === ZmComposeView.BC_HEADERS && comp2 === ZmComposeView.BC_QUOTED_TEXT && incOptions.prefix) {
		num = 0;
	}

	return (num === 2) ? this._crlf2 : (num === 1) ? this._crlf : "";
};

ZmComposeView.prototype._getSignatureComponent =
function(style, mode) {
		
	var value = "";
	var ac = window.parentAppCtxt || window.appCtxt;
	var account = ac.multiAccounts && this.getFromAccount();
	if (ac.get(ZmSetting.SIGNATURES_ENABLED, null, account) && ac.get(ZmSetting.SIGNATURE_STYLE, null, account) === style) {
		var comp = (style === ZmSetting.SIG_OUTLOOK) ? ZmComposeView.BC_SIG_PRE : ZmComposeView.BC_SIG_POST;
		var params = {
			style:		style,
			account:	account,
			mode:		mode,
			marker:		this._getMarker(mode, comp)
		}
		value = this._getSignatureContentSpan(params);
	}
	return value;
};

ZmComposeView.prototype._getDivider =
function(mode, params) {

	mode = mode || this._composeMode;
	var htmlMode = (mode === Dwt.HTML);
	var action = (params && params.action) || this._action;
	var msg = (params && params.msg) || this._msg;
	var incOptions = (params && params.incOptions) || this._controller._curIncOptions;
	var preface = "";
	var marker = htmlMode && this._getMarker(mode, ZmComposeView.BC_DIVIDER);
	if (incOptions && incOptions.headers) {
		// divider is just a visual separator if there are headers below it
		if (htmlMode) {
			preface = '<hr id="' + AjxStringUtil.HTML_SEP_ID + '" ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">';
		} else {
			var msgText = (action === ZmOperation.FORWARD_INLINE) ? AjxMsg.forwardedMessage : AjxMsg.origMsg;
			preface = [ZmMsg.DASHES, " ", msgText, " ", ZmMsg.DASHES, this._crlf].join("");
		}
	}
	else if (msg) {
		// no headers, so summarize them by showing date, time, name, email
		var msgDate = msg.sentDate || msg.date;
		var now = new Date(msgDate);
		var date = AjxDateFormat.getDateInstance(AjxDateFormat.MEDIUM).format(now);
		var time = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT).format(now);
		var fromAddr = msg.getAddress(AjxEmailAddress.FROM);
		var fromName = fromAddr && fromAddr.getName();
		var fromEmail = fromAddr && fromAddr.getAddress();
		var address = fromName;
		if (fromEmail) {
			fromEmail = htmlMode ? AjxStringUtil.htmlEncode("<" + fromEmail + ">") : fromEmail;
			address = [address, fromEmail].join(" "); 
		}
		preface = AjxMessageFormat.format(ZmMsg.replyPrefix, [date, time, address]);
		preface += this._crlf;
		if (htmlMode) {
			preface = '<span id="' + AjxStringUtil.HTML_SEP_ID + '" ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">' + preface + '</span>';
		}
	}
		
	return preface;
};

ZmComposeView.prototype._getHeaders =
function(mode, params) {

	mode = mode || this._composeMode;
	var htmlMode = (mode === Dwt.HTML);
	params = params || {};
	var action = (params && params.action) || this._action;
	var msg = (params && params.msg) || this._msg;
	var incOptions = (params && params.incOptions) || this._controller._curIncOptions;

	var value = "";
	var headers = [];
	if (incOptions.headers && msg) {
		for (var i = 0; i < ZmComposeView.QUOTED_HDRS.length; i++) {
			var hdr = msg.getHeaderStr(ZmComposeView.QUOTED_HDRS[i], htmlMode);
			if (hdr) {
				headers.push(hdr);
			}
		}
	}

	if (headers.length) {
		//TODO: this could be simplified and maybe refactored with the similar code in _getBodyComponent()
		//(see bug 91743)
		//Revisit this after the release.
		var text = headers.join(this._crlf) + this._crlf;
		var wrapParams = {
			text:				text,
			preserveReturns:	true,
			htmlMode:			htmlMode,
			isHeaders:			true
		}
		var marker = this._getMarker(Dwt.HTML, ZmComposeView.BC_HEADERS);
		if (incOptions.prefix) {
			incOptions.pre = !htmlMode && appCtxt.get(ZmSetting.REPLY_PREFIX);
			wrapParams.prefix = incOptions.pre;
			if (htmlMode) {
				wrapParams.before = '<div ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">' + AjxStringUtil.HTML_QUOTE_PREFIX_PRE;
				wrapParams.after = AjxStringUtil.HTML_QUOTE_PREFIX_POST + '</div>';
			}
			value = AjxStringUtil.wordWrap(wrapParams);
		}
		else if (htmlMode) {
			wrapParams.before = '<div ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">';
			wrapParams.after = '</div>';
			value = AjxStringUtil.wordWrap(wrapParams);
		}
		else {
			value = text;
		}
	}

	return value;
};

ZmComposeView.prototype._getBodyComponent =
function(mode, params) {

	mode = mode || this._composeMode;
	params = params || {};
	var action = (params && params.action) || this._action;
	var htmlMode = (mode === Dwt.HTML);
	var msg = (params && params.msg) || this._msg;
	var incOptions = (params && params.incOptions) || this._controller._curIncOptions;
	var what = incOptions.what;
	var bodyInfo = params.bodyInfo || this._getBodyContent(msg, htmlMode, what);

	var value = "";
	var body = "";
	if (msg && (what === ZmSetting.INC_BODY || what === ZmSetting.INC_SMART)) {
		body = bodyInfo.body;
		// Bug 7160: Strip off the ~*~*~*~ from invite replies.
		if (ZmComposeController.IS_INVITE_REPLY[action]) {
			body = body.replace(ZmItem.NOTES_SEPARATOR, "");
		}
		if (htmlMode && body) {
			body = this._normalizeText(body, htmlMode);
		}
	}

	body = AjxStringUtil.trim(body);
	if (body) {
		//TODO: this could be simplified and maybe refactored with the similar code in _getHeaders()
		//(see bug 91743)
		//Revisit this after the release.
		var wrapParams = {
			text:				body,
			preserveReturns:	true,
			htmlMode:			htmlMode
		}
		if (htmlMode) {
			var marker = this._getMarker(Dwt.HTML, ZmComposeView.BC_QUOTED_TEXT);
			if (incOptions.prefix) {
				wrapParams.before = '<div ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">' + AjxStringUtil.HTML_QUOTE_PREFIX_PRE;
				wrapParams.after = AjxStringUtil.HTML_QUOTE_PREFIX_POST + '</div>';
				wrapParams.prefix = appCtxt.get(ZmSetting.REPLY_PREFIX);
			}
			else {
				wrapParams.before = '<div ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">';
				wrapParams.after = '</div>';
			}
			value = AjxStringUtil.wordWrap(wrapParams);
		}
		else {
			if (incOptions.prefix) {
				wrapParams.prefix = appCtxt.get(ZmSetting.REPLY_PREFIX);
				value = AjxStringUtil.wordWrap(wrapParams);
			}
			else {
				value = body;
			}
		}
	}

	return value;
};

// Removes the invisible markers we use in text mode, since we should not send those out as part of the msg
ZmComposeView.prototype._removeMarkers =
function(text) {
	return text.replace(ZmComposeView.BC_MARKER_REGEXP, '');
};

ZmComposeView.prototype._normalizeText =
function(text, isHtml) {
		
	text = AjxStringUtil.trim(text);
	if (isHtml) {
        text = AjxStringUtil.trimHtml(text);
	}
	else {
		text = this._removeMarkers(text);
		text = text.replace(/\n+$/g, "\n");	// compress trailing line returns
	}

	return AjxStringUtil._NON_WHITESPACE.test(text) ? text + this._crlf : "";
};

/**
 * Returns the value of the given component as extracted from the content of the editor.
 * 
 * @param {string}		comp		component identifier (ZmComposeView.BC_*)
 */
ZmComposeView.prototype.getComponentContent =
function(comp) {
	
	var htmlMode = (this._composeMode === Dwt.HTML);
	var content = this._getEditorContent(true);
	var compContent = "";

	var firstComp = this._compList[0];
	for (var i = 0; i < this._compList.length; i++) {
		if (this._compList[i] === comp) { break; }
	}
	var nextComp = this._compList[i + 1];
	var lastComp = this._compList[this._compList.length - 1];
	
	if (htmlMode) {
		var marker = this._getMarker(this._composeMode, comp);
		var idx1 = content.indexOf(marker);
		if (idx1 !== -1) {
			var chunk = content.substring(0, idx1);
			// found the marker (an element ID), now back up to opening of tag
			idx1 = chunk.lastIndexOf("<");
			if (idx1 !== -1) {
				if (comp === lastComp) {
					compContent = content.substring(idx1);
				}
				else {
					marker = this._getMarker(Dwt.HTML, nextComp);
					var idx2 = marker && content.indexOf(marker);
					if (idx2 !== -1) {
						chunk = content.substring(0, idx2);
						idx2 = chunk.lastIndexOf("<");
						if (idx2 !== -1) {
							compContent = content.substring(idx1, idx2);
						}
					}
				}
			}
		}
	}
	else {
		// In text mode, components are separated by markers which are varying lengths of a zero-width space
		var marker1 = this._getMarker(this._composeMode, comp),
			regex1 = ZmComposeView.BC_TEXT_MARKER_REGEX1[comp],     // matches marker at beginning
			regex2 = ZmComposeView.BC_TEXT_MARKER_REGEX2[comp],     // matches marker elsewhere
			start, marker2;

		var prePreText = "";
		// look for this component's marker
		if (regex1.test(content)) {
			// found it at the start of content
			start = marker1.length;
		}
		else if (regex2.test(content)) {
			// found it somewhere after the start
			var markerIndex = content.search(regex2) + 1; // add one to account for non-matching char at beginning of regex
			start = markerIndex + marker1.length;
			if (comp === ZmComposeView.BC_TEXT_PRE) {
				//special case - include stuff before the first marker for the pre text (user can add stuff before it by clicking and/or moving the cursor beyond the invisible marker)
				prePreText = content.substring(0, markerIndex);
			}
		}
		if (start > 0) {
			marker2 = this._getMarker(this._composeMode, nextComp);
			// look for the next component's marker so we know where this component's content ends
			regex2 = marker2 && ZmComposeView.BC_TEXT_MARKER_REGEX2[nextComp];
			idx2 = regex2 && content.search(regex2) + 1;
			if (idx2) {
				// found it, take what's in between
				compContent = content.substring(start, idx2);
			}
			else {
				// this comp is last component
				compContent = content.substr(start);
			}
			compContent = prePreText + compContent;
		}
	}

	return this._normalizeText(compContent, htmlMode);
};

ZmComposeView.prototype._saveComponentContent =
function(force) {
	if (this._compContent && !force) {
		return;
	}
	this._compContent = {};
	for (var i = 0; i < this._compList.length; i++) {
		var comp = this._compList[i];
		this._compContent[comp] = this.getComponentContent(comp);
	}
};

ZmComposeView.prototype.componentContentChanged =
function(comp) {
	return this._compContent && this.hasComponent(comp) && (this._compContent[comp] !== this.getComponentContent(comp));
};

/**
 * Returns text that the user has typed into the editor, as long as it comes first.
 */
ZmComposeView.prototype.getUserText =
function() {
		
	var htmlMode = (this._composeMode === Dwt.HTML);
	var content = this._getEditorContent(true);
	var userText = content;
	if (htmlMode) {
		var firstComp;
		for (var i = 0; i < this._compList.length; i++) {
			if (this._compList[i] !== ZmComposeView.BC_TEXT_PRE) {
				firstComp = this._compList[i];
				break;
			}
		}
		var marker = this._getMarker(this._composeMode, firstComp);
		var idx = content.indexOf(marker);
		if (idx !== -1) {
			var chunk = content.substring(0, idx);
			// found the marker (an element ID), now back up to opening of tag
			idx = chunk.lastIndexOf("<");
			if (idx !== -1) {
				// grab everything before the marked element
				userText = chunk.substring(0, idx);
			}
		}
	}
	else {
		if (this.hasComponent(ZmComposeView.BC_TEXT_PRE)) {
			userText = this.getComponentContent(ZmComposeView.BC_TEXT_PRE);
		}
		else if (this._compList.length > 0) {
			var idx = content.indexOf(this._getMarker(this._composeMode, this._compList[0]));
			if (idx !== -1) {
				userText = content.substring(0, idx);
			}
		}
	}
				
	return this._normalizeText(userText, htmlMode);
};

// Returns the block of quoted text from the editor, so that we can see if the user has changed it.
ZmComposeView.prototype._getQuotedText =
function() {
	return this.getComponentContent(ZmComposeView.BC_QUOTED_TEXT);
};

// If the user has changed the section of quoted text (eg by inline replying), preserve the changes
// across whatever operation the user is performing. If we're just checking whether changes can be
// preserved, return true if they can be preserved (otherwise we need to warn the user).
ZmComposeView.prototype._preserveQuotedText =
function(op, quotedText, check) {

	var savedQuotedText = this._compContent && this._compContent[ZmComposeView.BC_QUOTED_TEXT];
	if (check && !savedQuotedText) {
		return true;
	}
	quotedText = quotedText || this._getQuotedText();
	var changed = (quotedText !== savedQuotedText);
	if (check && (!quotedText || !changed)) {
		return true;
	}

	// track whether user has changed quoted text during this compose session
	this._quotedTextChanged = this._quotedTextChanged || changed;

	if (op === ZmId.OP_ADD_SIGNATURE || op === ZmOperation.INCLUDE_HEADERS || (this._quotedTextChanged && !changed)) {
		// just retain quoted text as is, no conversion needed
	}
	if (op === ZmOperation.USE_PREFIX) {
		if (check) {
			return true;
		}
		var htmlMode = (this._composeMode === Dwt.HTML);
		var incOptions = this._controller._curIncOptions;
		if (incOptions.prefix) {
			var wrapParams = {
				text:				quotedText,
				htmlMode:			htmlMode,
				preserveReturns:	true,
				prefix:				appCtxt.get(ZmSetting.REPLY_PREFIX)
			}
			if (htmlMode) {
				var marker = this._getMarker(Dwt.HTML, ZmComposeView.BC_QUOTED_TEXT);
				wrapParams.before = '<div ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">' + AjxStringUtil.HTML_QUOTE_PREFIX_PRE;
				wrapParams.after = AjxStringUtil.HTML_QUOTE_PREFIX_POST + '</div>';
			}
			quotedText = AjxStringUtil.wordWrap(wrapParams);
		}
		else {
			if (htmlMode) {
				quotedText = this._removeHtmlPrefix(quotedText);
			}
			else {
				// remove leading > or | (prefix) with optional space after it (for text there's a space, for additional level prefix there isn't)
				quotedText = quotedText.replace(/^[>|] ?/, "");
				quotedText = quotedText.replace(/\n[>|] ?/g, "\n");
			}
		}
	}
	else if (ZmComposeController.INC_MAP[op]) {
		return false;
	}
	else if (op === ZmOperation.FORMAT_HTML || op === ZmOperation.FORMAT_TEXT) {
		if (check) {
			return true;
		}
		if (op === ZmOperation.FORMAT_HTML) {
			var marker = this._getMarker(Dwt.HTML, ZmComposeView.BC_QUOTED_TEXT);
			var openTag =  AjxStringUtil.HTML_QUOTE_PREFIX_PRE;
			var closeTag = AjxStringUtil.HTML_QUOTE_PREFIX_POST;
			quotedText = AjxStringUtil.convertToHtml(quotedText, true, openTag, closeTag);
			quotedText = '<div ' + ZmComposeView.BC_HTML_MARKER_ATTR + '="' + marker + '">' + quotedText + '</div>';
		}
		else {
			quotedText = this._htmlToText(quotedText);
		}
	}

	if (!check) {
		this.setComponent(ZmComposeView.BC_QUOTED_TEXT, quotedText || ZmComposeView.EMPTY);
	}
		
	return true;
};

// Removes the first level of <blockquote> styling
ZmComposeView.prototype._removeHtmlPrefix =
function(html, prefixEl) {
	prefixEl = prefixEl || "blockquote";
	var oldDiv = Dwt.parseHtmlFragment(html);
	var newDiv = document.createElement("div");
	newDiv[ZmComposeView.BC_HTML_MARKER_ATTR] = this._getMarker(Dwt.HTML, ZmComposeView.BC_QUOTED_TEXT);
	while (oldDiv.childNodes.length) {
		var el = oldDiv.childNodes[0];
		if (el.nodeName.toLowerCase() === prefixEl) {
			while (el.childNodes.length) {
				newDiv.appendChild(el.removeChild(el.childNodes[0]));
			}
			oldDiv.removeChild(el);
		}
		else {
			newDiv.appendChild(oldDiv.removeChild(el));
		}
	}
	
	return newDiv.outerHTML;
};

/**
 * Returns true unless changes have been made to quoted text and they cannot be preserved.
 * 
 * @param 	{string}	op			action user is performing
 * @param	{string}	quotedText	quoted text (optional)
 */
ZmComposeView.prototype.canPreserveQuotedText =
function(op, quotedText) {
	return this._preserveQuotedText(op, quotedText, true);
};

ZmComposeView.prototype._getBodyContent =
function(msg, htmlMode, incWhat) {

	var body, bodyPart, hasInlineImages, hasInlineAtts;
	var crlf = htmlMode ? AjxStringUtil.CRLF_HTML : AjxStringUtil.CRLF;
	var crlf2 = htmlMode ? AjxStringUtil.CRLF2_HTML : AjxStringUtil.CRLF2;
	var getOrig = (incWhat === ZmSetting.INC_SMART);

	var content;
		
	// bug fix #7271 - if we have multiple body parts, append them all first
	var parts = msg.getBodyParts();
	if (msg.hasMultipleBodyParts()) {
		var bodyArr = [];
		for (var k = 0; k < parts.length; k++) {
			var part = parts[k];
			// bug: 28741
			if (ZmMimeTable.isRenderableImage(part.contentType)) {
				bodyArr.push([crlf, "[", part.contentType, ":", (part.fileName || "..."), "]", crlf].join(""));
				hasInlineImages = true;
			} else if (part.fileName && part.contentDisposition === "inline") {
				var attInfo = ZmMimeTable.getInfo(part.contentType);
				attInfo = attInfo ? attInfo.desc : part.contentType;
				bodyArr.push([crlf, "[", attInfo, ":", (part.fileName||"..."), "]", crlf].join(""));
				hasInlineAtts = true;
			} else if (part.contentType === ZmMimeTable.TEXT_PLAIN || (part.body && ZmMimeTable.isTextType(part.contentType))) {
				content = getOrig ? AjxStringUtil.getOriginalContent(part.getContent(), false) : part.getContent();
				bodyArr.push( htmlMode ? AjxStringUtil.convertToHtml(content) : content );
			} else if (part.contentType === ZmMimeTable.TEXT_HTML) {
				content = getOrig ? AjxStringUtil.getOriginalContent(part.getContent(), true) : part.getContent();
				if (htmlMode) {
					bodyArr.push(content);
				} else {
					var div = document.createElement("div");
					div.innerHTML = content;
					bodyArr.push(AjxStringUtil.convertHtml2Text(div));
				}
			}
		}
		body = bodyArr.join(crlf);
	} else {
		// at this point, we should have the type of part we want if we're dealing with multipart/alternative
		if (htmlMode) {
			content = msg.getBodyContent(ZmMimeTable.TEXT_HTML);
			if (!content) {
				// just grab the first body part and convert it to HTML
				content = AjxStringUtil.convertToHtml(msg.getBodyContent());
			}
			body = getOrig ? AjxStringUtil.getOriginalContent(content, true) : content;
		} else {
			hasInlineImages = msg.hasInlineImagesInMsgBody();
			bodyPart = msg.getTextBodyPart();
			if (bodyPart) {
				// cool, got a textish body part
				content = bodyPart.getContent();
			}
			else {
				// if we can find an HTML body part, convert it to text
				var html = msg.getBodyContent(ZmMimeTable.TEXT_HTML, true);
				content = html ? this._htmlToText(html) : "";
			}
			content = content || msg.getBodyContent();	// just grab first body part
			body = getOrig ? AjxStringUtil.getOriginalContent(content, false) : content;
		}
	}

	body = body || "";
		
	if (bodyPart && AjxUtil.isObject(bodyPart) && bodyPart.isTruncated) {
		body += crlf2 + ZmMsg.messageTruncated + crlf2;
	}
		
	if (!this._htmlEditor && this.getComposeMode() === Dwt.HTML) {
		// strip wrapper tags from original msg
		body = body.replace(/<\/?(html|head|body)[^>]*>/gi, '');
	}

	return {body:body, bodyPart:bodyPart, hasInlineImages:hasInlineImages, hasInlineAtts:hasInlineAtts};
};

ZmComposeView.BQ_BEGIN	= "BQ_BEGIN";
ZmComposeView.BQ_END	= "BQ_END";

ZmComposeView.prototype._htmlToText =
function(html) {

	var convertor = {
		"blockquote": function(el) {
			return "\n" + ZmComposeView.BQ_BEGIN + "\n";
		},
		"/blockquote": function(el) {
			return "\n" + ZmComposeView.BQ_END + "\n";
		},
		"_after": AjxCallback.simpleClosure(this._applyHtmlPrefix, this, ZmComposeView.BQ_BEGIN, ZmComposeView.BQ_END)
	}
	return AjxStringUtil.convertHtml2Text(html, convertor);
};

ZmComposeView.prototype._applyHtmlPrefix =
function(tagStart, tagEnd, text) {

	var incOptions = this._controller._curIncOptions;
	if (incOptions && incOptions.prefix) {
		var wrapParams = {
			preserveReturns:	true,
			prefix:				appCtxt.get(ZmSetting.REPLY_PREFIX)
		}

		var lines = text.split("\n");
		var level = 0;
		var out = [];
		var k = 0;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line === tagStart) {
				level++;
			} else if (line === tagEnd) {
				level--;
			} else {
				if (!line) {
					var lastLine = lines[i-1];
					if (lastLine && (lastLine !== tagStart && lastLine !== tagEnd)) {
						out[k++] = line;
					}
				} else {
					for (var j = 0; j < level; j++) {
						wrapParams.text = line;
						line = AjxStringUtil.wordWrap(wrapParams);
					}
					line = line.replace(/^\n|\n$/, "");
					out[k++] = line;
				}
			}
		}
		return out.join("\n");
	} else {
		return text.replace(tagStart, "").replace(tagEnd, "");
	}
};

/**
 * Reconstructs the content of the body area after some sort of change (for example: format,
 * signature, or include options).
 * 
 * @param {string}			action				compose action
 * @param {ZmMailMsg}		msg					original msg (in case of reply)
 * @param {string}			extraBodyText		canned text to include
 * @param {hash}			incOptions			include options
 * @param {boolean}			keepAttachments		do not cleanup the attachments
 * @param {boolean}			noEditorUpdate		if true, do not change content of HTML editor
 */
ZmComposeView.prototype.resetBody =
function(params, noEditorUpdate) {

	params = params || {};
	var action = params.action || this._origAction || this._action;
	if (this._action === ZmOperation.DRAFT) {
		action = this._origAction;
	}
	var msg = (this._action === ZmOperation.DRAFT) ? this._origMsg : params.msg || this._origMsg;
	var incOptions = params.incOptions || this._controller._curIncOptions;
		
	this._components = {};
	
	this._preserveQuotedText(params.op, params.quotedText);
	if (!params.keepAttachments) {
		this.cleanupAttachments(true);
	}
	this._isDirty = this._isDirty || this.isDirty();
	this._setBody(action, msg, params.extraBodyText, noEditorUpdate, params.keepAttachments);
	this._setFormValue();
	this._resetBodySize();
};

/**
 * Removes the attachment corresponding to the original message.
 */
ZmComposeView.prototype.removeOrigMsgAtt = function() {

    for (var i = 0; i < this._partToAttachmentMap.length; i++) {
        var att = this._partToAttachmentMap[i];
        if (att.rfc822Part && this._origMsgAtt && att.sizeInBytes === this._origMsgAtt.size) {
            this._removeAttachedMessage(att.spanId);
        }
    }
};

// Generic routine for attaching an event handler to a field. Since "this" for the handlers is
// the incoming event, we need a way to get at ZmComposeView, so it's added to the event target.
ZmComposeView.prototype._setEventHandler =
function(id, event, addrType) {
	var field = document.getElementById(id);
	field._composeViewId = this._htmlElId;
	if (addrType) {
		field._addrType = addrType;
	}
	var lcEvent = event.toLowerCase();
	field[lcEvent] = ZmComposeView["_" + event];
};

ZmComposeView.prototype._setBodyFieldCursor =
function(extraBodyText) {

	if (this._composeMode === Dwt.HTML) { return; }

	// this code moves the cursor to the beginning of the body
	if (AjxEnv.isIE) {
		var tr = this._bodyField.createTextRange();
		if (extraBodyText) {
			tr.move('character', extraBodyText.length + 1);
		} else {
			tr.collapse(true);
		}
		tr.select();
	} else {
		var index = extraBodyText ? (extraBodyText.length + 1) : 0;
		Dwt.setSelectionRange(this._bodyField, index, index);
	}
};

/**
 * This should be called only once for when compose view loads first time around
 * 
 * @private
 */
ZmComposeView.prototype._initialize =
function(composeMode, action) {

	this._internalId = AjxCore.assignId(this);

	// init html
	this._createHtml();

	// init drag and drop
	this._initDragAndDrop();

	// init compose view w/ based on user prefs
	var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	var defaultCompMode = bComposeEnabled && composeFormat === ZmSetting.COMPOSE_HTML
		? Dwt.HTML : Dwt.TEXT;
	this._composeMode = composeMode || defaultCompMode;
	this._clearFormValue();

	// init html editor
	var attmcallback =
		this.showAttachmentDialog.bind(this, ZmComposeView.UPLOAD_INLINE);

	// Focus on the editor body if its not a new message/forwarded message (where it focuses on the 'To' field).
	var autoFocus = (action !== ZmOperation.NEW_MESSAGE) &&
					(action !== ZmOperation.FORWARD_INLINE) &&
					(action !== ZmOperation.FORWARD_ATT);

	this._htmlEditor =
		new ZmHtmlEditor({
			parent: this,
			posStyle: DwtControl.RELATIVE_STYLE,
			mode: this._composeMode,
			autoFocus: autoFocus,
			initCallback: this._controlListener.bind(this),
			pasteCallback: this._uploadDoneCallback.bind(this),
			attachmentCallback: attmcallback
		});
	this._bodyFieldId = this._htmlEditor.getBodyFieldId();
	this._bodyField = document.getElementById(this._bodyFieldId);
	this._includedPreface = "";
	
	this._marker = {};
	this._marker[Dwt.TEXT] = ZmComposeView.BC_TEXT_MARKER;
	this._marker[Dwt.HTML] = {};
	for (var i = 0; i < ZmComposeView.BC_ALL_COMPONENTS.length; i++) {
		var comp = ZmComposeView.BC_ALL_COMPONENTS[i];
		this._marker[Dwt.HTML][comp] = '__' + comp + '__';
	}
	
	// misc. inits
	this.setScrollStyle(DwtControl.SCROLL);
	this._attachCount = 0;

	// init listeners
	this.addControlListener(new AjxListener(this, this._controlListener));

	var htmlEditor =  this._htmlEditor;
	var composeDragArea  = Dwt.getElement(ZmId.getViewId(this._view, ZmId.CMP_DRG_AREA));
	var composeTable = this._headerEl;

	Dwt.setHandler(composeTable, DwtEvent.ONDRAGENTER, htmlEditor._onDragEnter.bind(htmlEditor));
	Dwt.setHandler(composeDragArea, DwtEvent.ONDRAGLEAVE, htmlEditor._onDragLeave.bind(htmlEditor));
	Dwt.setHandler(composeDragArea, DwtEvent.ONDROP, htmlEditor._onDrop.bind(htmlEditor, this._dnd));
};

ZmComposeView.prototype._createHtml =
function(templateId) {

	var data = {
		id:					this._htmlElId,
		headerId:			ZmId.getViewId(this._view, ZmId.CMP_HEADER),
		fromSelectId:		ZmId.getViewId(this._view, ZmId.CMP_FROM_SELECT),
		toRowId:			ZmId.getViewId(this._view, ZmId.CMP_TO_ROW),
		toPickerId:			ZmId.getViewId(this._view, ZmId.CMP_TO_PICKER),
		toInputId:			ZmId.getViewId(this._view, ZmId.CMP_TO_INPUT),
		toCellId:			ZmId.getViewId(this._view, ZmId.CMP_TO_CELL),
		ccRowId:			ZmId.getViewId(this._view, ZmId.CMP_CC_ROW),
		ccPickerId:			ZmId.getViewId(this._view, ZmId.CMP_CC_PICKER),
		ccInputId:			ZmId.getViewId(this._view, ZmId.CMP_CC_INPUT),
		ccCellId:			ZmId.getViewId(this._view, ZmId.CMP_CC_CELL),
		bccRowId:			ZmId.getViewId(this._view, ZmId.CMP_BCC_ROW),
		bccPickerId:		ZmId.getViewId(this._view, ZmId.CMP_BCC_PICKER),
		bccInputId:			ZmId.getViewId(this._view, ZmId.CMP_BCC_INPUT),
		bccCellId:			ZmId.getViewId(this._view, ZmId.CMP_BCC_CELL),
		subjectRowId:		ZmId.getViewId(this._view, ZmId.CMP_SUBJECT_ROW),
		subjectInputId:		ZmId.getViewId(this._view, ZmId.CMP_SUBJECT_INPUT),
		oboRowId:			ZmId.getViewId(this._view, ZmId.CMP_OBO_ROW),
		oboCheckboxId:		ZmId.getViewId(this._view, ZmId.CMP_OBO_CHECKBOX),
		oboLabelId:			ZmId.getViewId(this._view, ZmId.CMP_OBO_LABEL),
		identityRowId:		ZmId.getViewId(this._view, ZmId.CMP_IDENTITY_ROW),
		identitySelectId:	ZmId.getViewId(this._view, ZmId.CMP_IDENTITY_SELECT),
		replyAttRowId:		ZmId.getViewId(this._view, ZmId.CMP_REPLY_ATT_ROW),
		attRowId:			ZmId.getViewId(this._view, ZmId.CMP_ATT_ROW),
		attDivId:			ZmId.getViewId(this._view, ZmId.CMP_ATT_DIV),
		attBtnId:			ZmId.getViewId(this._view, ZmId.CMP_ATT_BTN),
		compDragAreaId:     		ZmId.getViewId(this._view, ZmId.CMP_DRG_AREA),
		editorDragAreaId:       	ZmId.getViewId(this._view, ZmId.EDT_DRG_AREA)
	};

	this._createHtmlFromTemplate(templateId || this.TEMPLATE, data);
};

ZmComposeView.prototype._addSendAsAndSendOboAddresses  =
function(menu) {

	var optData = null;
	var myDisplayName = appCtxt.getUsername();
	this._addSendAsOrSendOboAddresses(menu, appCtxt.sendAsEmails, false, function(addr, displayName) {
		return displayName ? AjxMessageFormat.format(ZmMsg.sendAsAddress, [addr, displayName]) : addr;
	});
	this._addSendAsOrSendOboAddresses(menu, appCtxt.sendOboEmails, true, function(addr, displayName) {
		return  AjxMessageFormat.format(displayName ? ZmMsg.sendOboAddressAndDispName : ZmMsg.sendOboAddress, [myDisplayName, addr, displayName]);
	});
};

ZmComposeView.prototype._addSendAsOrSendOboAddresses  =
function(menu, emails, isObo, displayValueFunc) {
	for (var i = 0; i < emails.length; i++) {
		var email = emails[i];
		var addr = email.addr;
		var extraData = {isDL: email.isDL, isObo: isObo};
		var displayValue = displayValueFunc(addr, email.displayName);
		var optData = new DwtSelectOptionData(addr, displayValue, null, null, null, null, extraData);
		menu.addOption(optData);
	}
};


ZmComposeView.prototype._createHtmlFromTemplate =
function(templateId, data) {

	DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId, data);

	// global identifiers
	this._identityDivId = data.identityRowId;

	this._recipients.createRecipientHtml(this, this._view, data.id, ZmMailMsg.COMPOSE_ADDRS);
	this._acAddrSelectList = this._recipients.getACAddrSelectList();

	// save reference to DOM objects per ID's
	this._headerEl = document.getElementById(data.headerId);
	this._subjectField = document.getElementById(data.subjectInputId);
	this._oboRow = document.getElementById(data.oboRowId);
	this._oboCheckbox = document.getElementById(data.oboCheckboxId);
	this._oboLabel = document.getElementById(data.oboLabelId);
	this._attcDiv = document.getElementById(data.attDivId);
	this._attcBtn = document.getElementById(data.attBtnId);

	this._setEventHandler(data.subjectInputId, "onKeyUp");
	this._setEventHandler(data.subjectInputId, "onFocus");

	if (appCtxt.multiAccounts) {
		if (!this._fromSelect) {
			this._fromSelect = new DwtSelect({parent:this, index: 0, id:this.getHTMLElId() + "_fromSelect", parentElement:data.fromSelectId});
			//this._addSendAsAndSendOboAddresses(this._fromSelect);
			this._fromSelect.addChangeListener(new AjxListener(this, this._handleFromListener));
			this._recipients.attachFromSelect(this._fromSelect);
		}
	} else {
		// initialize identity select
		var identityOptions = this._getIdentityOptions();
		this.identitySelect = new DwtSelect({parent:this, index: 0, id:this.getHTMLElId() + "_identitySelect", options:identityOptions});
		this._addSendAsAndSendOboAddresses(this.identitySelect);
		this.identitySelect.setToolTipContent(ZmMsg.chooseIdentity, true);

		if (!this._identityChangeListenerObj) {
			this._identityChangeListenerObj = new AjxListener(this, this._identityChangeListener);
		}
		var ac = window.parentAppCtxt || window.appCtxt;
		var accounts = ac.accountList.visibleAccounts;
		for (var i = 0; i < accounts.length; i++) {
			var identityCollection = ac.getIdentityCollection(accounts[i]);
			identityCollection.addChangeListener(this._identityChangeListenerObj);
		}

		this.identitySelect.replaceElement(data.identitySelectId);
		this._setIdentityVisible();
	}

	var attButtonId = ZmId.getButtonId(this._view, ZmId.CMP_ATT_BTN);
	this._attButton = new DwtButton({parent:this, id:attButtonId});
	this._attButton.setText(ZmMsg.attach);

	this._attButton.setMenu(new AjxCallback(this, this._attachButtonMenuCallback));
	this._attButton.reparentHtmlElement(data.attBtnId);
	this._attButton.setToolTipContent(ZmMsg.attach, true);
	this._attButton.addSelectionListener(
		this.showAttachmentDialog.bind(this, ZmComposeView.UPLOAD_COMPUTER, false)
	);
};

ZmComposeView.prototype._initDragAndDrop =
function() {
	this._dnd = new ZmDragAndDrop(this);
};

ZmComposeView.prototype.collapseAttMenu =
function() {
	var menu = this._attButton && this._attButton.getMenu();
	menu.popdown();
};

ZmComposeView.prototype._handleFromListener =
function(ev) {
	var newVal = ev._args.newValue;
	var oldVal = ev._args.oldValue;
	if (oldVal === newVal) { return; }

	var ac = window.parentAppCtxt || window.appCtxt;
	var newOption = this._fromSelect.getOptionWithValue(newVal);
	var newAccount = ac.accountList.getAccount(newOption.accountId);
	var collection = ac.getIdentityCollection(newAccount);
	var identity = collection && collection.getById(newVal);

	var sigId = this._getSignatureIdForAction(identity || collection.defaultIdentity) || "";

	this._controller._accountName = newAccount.name;
	this._controller.resetSignatureToolbar(sigId, newAccount);
	this._controller.resetSignature(sigId, newAccount);
	this._controller._resetReadReceipt(newAccount);

	// reset account for autocomplete to use
	if (this._acAddrSelectList) {
		this._acAddrSelectList.setActiveAccount(newAccount);
	}

	// if this message is a saved draft, check whether it needs to be moved
	// based on newly selected value.
	if (this._msg && this._msg.isDraft) {
		var oldOption = this._fromSelect.getOptionWithValue(oldVal);
		var oldAccount = ac.accountList.getAccount(oldOption.accountId);

		// cache old info so we know what to delete after new save
		var msgId = this._origAcctMsgId = this._msg.id;

		this._msg = this._origMsg = null;
		var callback = new AjxCallback(this, this._handleMoveDraft, [oldAccount.name, msgId]);
		this._controller.saveDraft(this._controller._draftType, null, null, callback);
	}

	this._recipients.resetPickerButtons(newAccount);
};

ZmComposeView.prototype._handleMoveDraft =
function(accountName, msgId) {
	var jsonObj = {
		ItemActionRequest: {
			_jsns:  "urn:zimbraMail",
			action: { id:msgId, op:"delete" }
		}
	};
	var params = {
		jsonObj: jsonObj,
		asyncMode: true,
		accountName: accountName
	};
	appCtxt.getAppController().sendRequest(params);
};


ZmComposeView.prototype._createAttachMenuItem =
function(menu, text, listner) {
	var item = DwtMenuItem.create({parent:menu, text:text});
	item.value = text;
	if (listner) {
		item.addSelectionListener(listner);
	}
	return item;
};

ZmComposeView.prototype._startUploadAttachment =
function() {
	this._attButton.setEnabled(false);
	this.enableToolbarButtons(this._controller, false);
	this._controller._uploadingProgress = true;
};

ZmComposeView.prototype.checkAttachments =
function() {
	if (!this._attachCount) { return; }
};

ZmComposeView.prototype.updateAttachFileNode =
function(files,index, aid) {
	var curFileName = this._clipFile(files[index].name, true);

	this._loadingSpan.firstChild.innerHTML = curFileName;
	this._loadingSpan.firstChild.nextSibling.innerHTML = curFileName;
    // Set the next files progress back to 0
    this._setLoadingProgress(this._loadingSpan, 0);
    if (aid){
        var prevFileName = this._clipFile(files[index-1].name, true);
        var element = document.createElement("span");
        element.innerHTML = AjxTemplate.expand("mail.Message#MailAttachmentBubble", {fileName:prevFileName, id:aid});
        var newSpan = element.firstChild;
        if (this._loadingSpan.nextSibling) {
            this._loadingSpan.parentNode.insertBefore(newSpan, this._loadingSpan.nextSibling);
        } else {
            this._loadingSpan.parentNode.appendChild(element);
        }
        // Set the previous files progress to 100%
        this._setLoadingProgress(newSpan, 1);
    }

};

ZmComposeView.prototype.enableToolbarButtons =
function(controller, enabled) {
	var toolbar = controller._toolbar;
	var sendLater = appCtxt.get(ZmSetting.MAIL_SEND_LATER_ENABLED);
	toolbar.getButton(sendLater ? ZmId.OP_SEND_MENU : ZmId.OP_SEND).setEnabled(enabled);
	toolbar.getButton(ZmId.OP_SAVE_DRAFT).setEnabled(enabled);
	var optionsButton = toolbar.getButton(ZmId.OP_COMPOSE_OPTIONS);
	if (optionsButton) {
		var optionsMenu = optionsButton.getMenu();
		if (optionsMenu) {
			var menuItemsToEnable = [ZmId.OP_INC_NONE, ZmId.OP_INC_BODY, ZmId.OP_INC_SMART, ZmId.OP_INC_ATTACHMENT, ZmId.OP_USE_PREFIX, ZmId.OP_INCLUDE_HEADERS];
			AjxUtil.foreach(menuItemsToEnable, function(menuItemId) {
				var menuItem = optionsMenu.getMenuItem(menuItemId);
				if (menuItem) {
					menuItem.setEnabled(enabled);
				}
			});
		}
	}
	var detachComposeButton = toolbar.getButton(ZmId.OP_DETACH_COMPOSE);
	if (detachComposeButton) {
		detachComposeButton.setEnabled(enabled);
	}
	appCtxt.notifyZimlets("enableComposeToolbarButtons", [toolbar, enabled]);
};

ZmComposeView.prototype.enableAttachButton =
function(option) {
	if (this._attButton) {
	   this._attButton.setEnabled(option);
		var attachElement = this._attButton.getHtmlElement();
		var node = attachElement && attachElement.getElementsByTagName("input");
		if (node && node.length) {
			node[0].disabled = !(option);
		}
	}

	this._disableAttachments = !(option);
};


ZmComposeView.prototype._resetUpload =
function(err) {
	this._attButton.setEnabled(true);
	this.enableToolbarButtons(this._controller, true);
	this._setAttInline(false);
	this._controller._uploadingProgress = false;
	if (this._controller._uploadAttReq) {
		this._controller._uploadAttReq = null;
	}

	if (this.si) {
		clearTimeout(this.si);
	}
	if (err === true && this._loadingSpan) {
		this._loadingSpan.parentNode.removeChild(this._loadingSpan);
		this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO);// Save the previous state
	}

	if (this._loadingSpan) {
		this._loadingSpan = null;
	}

	if (this._uploadElementForm) {
		this._uploadElementForm.reset();
		this._uploadElementForm = null;
	}
};

ZmComposeView.prototype._uploadDoneCallback =
function(resp) {
	var response = resp && resp.length && resp[2];
	this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, response);
};


ZmComposeView.prototype._uploadFileProgress =
function(params, progress) {
	if (!this._loadingSpan ||  (!progress.lengthComputable) ) { 
		return;
	}
	this._setLoadingProgress(this._loadingSpan, progress.loaded / progress.total);
};

ZmComposeView.prototype._abortUploadFile =
function() {
	if (this._controller._uploadAttReq){
        this._controller._uploadAttReq.aborted = true;
        this._controller._uploadAttReq.abort();
    }
};

ZmComposeView.prototype._progress =
function() {
	var span1 = this._loadingSpan && this._loadingSpan.firstChild;
	var span2 = span1 && span1.nextSibling;
    if (span2){
        span1.style.width = ((span1.offsetWidth + 1) % span2.offsetWidth) + "px";
    }
};

/*
 Set the loading progress to a specific percentage
 @param {Number} progress - fraction of progress (0 to 1, 1 is 100%).
 */
ZmComposeView.prototype._setLoadingProgress =
function(loadingSpan, progress) {
	var finishedSpan = loadingSpan.childNodes[0];
	var allSpan = loadingSpan.childNodes[1];
	finishedSpan.style.width = (allSpan.offsetWidth * progress) + "px";
};

ZmComposeView.prototype._initProgressSpan =
function(fileName) {
	fileName = this._clipFile(fileName, true);

	var firstBubble = this._attcDiv.getElementsByTagName("span")[0];
	if (firstBubble) {
		var tempBubbleWrapper = document.createElement("span");
		tempBubbleWrapper.innerHTML = AjxTemplate.expand("mail.Message#MailAttachmentBubble", {fileName: fileName});
		var newBubble = tempBubbleWrapper.firstChild;
		firstBubble.parentNode.insertBefore(newBubble, firstBubble); //insert new bubble before first bubble.
	}
	else {
		//first one is enclosed in a wrapper (the template already expands the mail.Message#MailAttachmentBubble template inside the wrapper)
		this._attcDiv.innerHTML = AjxTemplate.expand("mail.Message#UploadProgressContainer", {fileName: fileName});
	}
	this._loadingSpan = this._attcDiv.getElementsByTagName("span")[0];
};


ZmComposeView.prototype._submitMyComputerAttachments =
function(files, node, isInline) {
	var name = "";

	if (!AjxEnv.supportsHTML5File) {
		// IE, FF 3.5 and lower
		this.showAttachmentDialog(ZmMsg.myComputer);
		return;
	}

	if (!files)
		files = node.files;

	var size = 0;
	if (files) {
		for (var j = 0; j < files.length; j++) {
			var file = files[j];
			//Check the total size of the files we upload this time (we don't know the previously uploaded files total size so we do the best we can).
			//NOTE - we compare to the MTA message size limit since there's no limit on specific attachments.
			size += file.size || file.fileSize /*Safari*/ || 0;
			if ((-1 /* means unlimited */ != appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)) &&
				(size > appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT))) {
				var msgDlg = appCtxt.getMsgDialog();
				var errorMsg = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)));
				msgDlg.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
				msgDlg.popup();
				return false;
			}
		}
	}

	this._setAttInline(isInline);
	this._initProgressSpan(files[0].name);

	this._controller._initUploadMyComputerFile(files);

};

ZmComposeView.prototype._clipFile = function(name, encode) {
	var r = AjxStringUtil.clipFile(name, ZmComposeView.MAX_ATTM_NAME_LEN);

	return encode ? AjxStringUtil.htmlEncode(r) : r;
};

ZmComposeView.prototype._checkMenuItems =
function(menuItem) {
	var isHTML = (this._composeMode === Dwt.HTML);
	menuItem.setEnabled(isHTML);
};

ZmComposeView.prototype._attachButtonMenuCallback =
function() {
	var menu = new DwtMenu({parent:this._attButton});

	var listener =
		this.showAttachmentDialog.bind(this, ZmComposeView.UPLOAD_COMPUTER);
	this._createAttachMenuItem(menu, ZmMsg.myComputer, listener);

	if (AjxEnv.supportsHTML5File) {
		// create the item for making inline attachments
		var listener =
			this.showAttachmentDialog.bind(this, ZmComposeView.UPLOAD_INLINE);
		var mi = this._createAttachMenuItem(menu, ZmMsg.attachInline, listener);
		menu.addPopupListener(new AjxListener(this, this._checkMenuItems,[mi]));
	}

	if (appCtxt.multiAccounts || appCtxt.get(ZmSetting.BRIEFCASE_ENABLED)) {
		var listener =
			this.showAttachmentDialog.bind(this,
			                               ZmComposeView.UPLOAD_BRIEFCASE);
		var briefcaseItem = this._createAttachMenuItem(menu, ZmMsg.briefcase, listener);
		briefcaseItem.setEnabled(!appCtxt.isWebClientOffline());

	}
	appCtxt.notifyZimlets("initializeAttachPopup", [menu, this], {waitUntilLoaded:true});

	return menu;
};

ZmComposeView.prototype._getIdentityOptions =
function() {
	var options = [];
	var identityCollection = appCtxt.getIdentityCollection();
	var identities = identityCollection.getIdentities(true);
	for (var i = 0, count = identities.length; i < count; i++) {
		var identity = identities[i];
		options.push(new DwtSelectOptionData(identity.id, this._getIdentityText(identity)));
	}
	return options;
};

ZmComposeView.prototype._getIdentityText =
function(identity, account) {
	var name = identity.name;
	if (identity.isDefault && name === ZmIdentity.DEFAULT_NAME) {
		name = account ? account.getDisplayName() : ZmMsg.accountDefault;
	}

	// default replacement parameters
	var defaultIdentity = appCtxt.getIdentityCollection().defaultIdentity;
	var addr = (identity.sendFromAddressType === ZmSetting.SEND_ON_BEHALF_OF) ? (appCtxt.getUsername() + " " + ZmMsg.sendOnBehalfOf + " " + identity.sendFromAddress) : identity.sendFromAddress;
	var params = [
		name,
		(identity.sendFromDisplay || ""),
		addr,
		ZmMsg.accountDefault,
		appCtxt.get(ZmSetting.DISPLAY_NAME),
		defaultIdentity.sendFromAddress
	];

	// get appropriate pattern
	var pattern;
	if (identity.isDefault) {
		pattern = ZmMsg.identityTextPrimary;
	}
	else if (identity.isFromDataSource) {
		var ds = appCtxt.getDataSourceCollection().getById(identity.id);
		params[1] = params[1] || ds.userName || "";
		params[2] = ds.getEmail();
		var provider = ZmDataSource.getProviderForAccount(ds);
		if (provider) {
			pattern = ZmMsg["identityText-"+provider.id];
		}
		else if (params[0] && params[1] && params[2] &&
				(params[0] !== params[1] !== params[2]))
		{
			pattern = ZmMsg.identityTextPersona;
		}
		else {
			pattern = ZmMsg.identityTextExternal;
		}
	}
	else {
		pattern = ZmMsg.identityTextPersona;
	}

	// format text
	return AjxMessageFormat.format(pattern, params);
};

ZmComposeView.prototype._identityChangeListener =
function(ev) {

	if (!this.identitySelect) { return; }

	var identity = ev.getDetail("item");
	if (!identity) { return; }
	if (ev.event === ZmEvent.E_CREATE) {
		// TODO: add identity in sort position
		var text = this._getIdentityText(identity);
		var option = new DwtSelectOptionData(identity.id, text);
		this.identitySelect.addOption(option);
        this._setIdentityVisible();
	} else if (ev.event === ZmEvent.E_DELETE) {
		this.identitySelect.removeOptionWithValue(identity.id);
		this._setIdentityVisible();
	} else if (ev.event === ZmEvent.E_MODIFY) {
		// TODO: see if it was actually name that changed
		// TODO: re-sort list
		var text = this._getIdentityText(identity);
		this.identitySelect.rename(identity.id, text);
	}
};

ZmComposeView.prototype._setIdentityVisible =
function() {
	var div = document.getElementById(this._identityDivId);
	if (!div) { return; }

	var visible = this.identitySelect.getOptionCount() > 1;
	Dwt.setVisible(div, visible);
	this.identitySelect.setVisible(visible);
};

ZmComposeView.prototype.getIdentity =
function() {
	var ac = window.parentAppCtxt || window.appCtxt;

	if (appCtxt.multiAccounts) {
		var newVal = this._fromSelect.getValue();
		var newOption = this._fromSelect.getOptionWithValue(newVal);
		var newAccount = ac.accountList.getAccount(newOption.accountId);
		var collection = ac.getIdentityCollection(newAccount);
		return collection && collection.getById(newVal);
	}

	if (this.identitySelect) {
		var collection = ac.getIdentityCollection();
		var val = this.identitySelect.getValue();
		var identity = collection.getById(val);
		return identity;
	}
};

ZmComposeView.prototype._showForwardField =
function(msg, action, includeInlineImages, includeInlineAtts) {

	var html = "";
	var attIncludeOrigLinkId = null;
	this._partToAttachmentMap = [];
	var appCtxt = window.parentAppCtxt || window.appCtxt
	var messages = [];

	var hasAttachments = msg && msg.attachments && msg.attachments.length > 0;

	if (!this._originalAttachmentsInitialized) {  //only the first time we determine which attachments are original
		this._originalAttachments = []; //keep it associated by label and size (label => size => true) since that's the only way the client has to identify attachments from previous msg version.
		this._hideOriginalAttachments = msg && hasAttachments && (action === ZmOperation.REPLY || action === ZmOperation.REPLY_ALL);
	}
	if (msg && (hasAttachments || includeInlineImages || includeInlineAtts || (action === ZmComposeView.ADD_ORIG_MSG_ATTS))) {
		var attInfo = msg.getAttachmentInfo(false, includeInlineImages, includeInlineAtts);

		if (action === ZmComposeView.ADD_ORIG_MSG_ATTS) {
			if (this._replyAttachments !== this._msg.attachments) {
				attInfo = attInfo.concat(this._replyAttachInfo);
				this._msg.attachments = this._msg.attachments.concat(this._replyAttachments);
			}
				this._replyAttachInfo = this._replyAttachments = [];
				Dwt.setVisible(ZmId.getViewId(this._view, ZmId.CMP_REPLY_ATT_ROW), false);
		} else if (action === ZmOperation.REPLY || action === ZmOperation.REPLY_ALL) {
			if (attInfo && attInfo.length && !appCtxt.isWebClientOffline()) {
				this._replyAttachInfo = attInfo;
				this._replyAttachments = this._msg.attachments;
				this._attachCount = 0;
				Dwt.setVisible(ZmId.getViewId(this._view, ZmId.CMP_REPLY_ATT_ROW), true);
			}

			return;
		}

		if (attInfo.length > 0 && !(action === ZmOperation.FORWARD_INLINE && appCtxt.isWebClientOffline())) {
			var rowId = this._htmlElId + '_attach';
			for (var i = 0; i < attInfo.length; i++) {
				var att = attInfo[i];
				var params = {
					att:		att,
					id:			[this._view, att.part, ZmMailMsgView.ATT_LINK_MAIN].join("_"),
					text:		this._clipFile(att.label),
					mid:		att.mid,
					rfc822Part: att.rfc822Part
				};
				att.link = ZmMailMsgView.getMainAttachmentLinkHtml(params);
				this._partToAttachmentMap[i] = att;
				if (!this._originalAttachmentsInitialized) {
					if (!this._originalAttachments[att.label]) {
						this._originalAttachments[att.label] = [];
					}
					this._originalAttachments[att.label][att.sizeInBytes] = true;
				}
				att.spanId = Dwt.getNextId(rowId);
				att.closeHandler = "ZmComposeView.removeAttachedFile(event, '" + [ this._htmlElId, att.spanId, att.part ].join("', '") + "');";
			}
			attIncludeOrigLinkId = Dwt.getNextId(ZmId.getViewId(this._view, ZmId.CMP_ATT_INCL_ORIG_LINK));


			if (action === ZmComposeView.ADD_ORIG_MSG_ATTS) {
				action = this._action;
			}

			var data = {
				attachments:				attInfo,
				messagesFwdFieldName: 		(ZmComposeView.FORWARD_MSG_NAME + this._sessionId),
				isNew:						(action === ZmOperation.NEW_MESSAGE),
				isForward:					(action === ZmOperation.FORWARD),
				isForwardInline:			(action === ZmOperation.FORWARD_INLINE),
				isDraft: 					(action === ZmOperation.DRAFT),
				hideOriginalAttachments:	this._hideOriginalAttachments,
				attIncludeOrigLinkId:		attIncludeOrigLinkId,
				originalAttachments: 		this._originalAttachments,
				fwdFieldName:				(ZmComposeView.FORWARD_ATT_NAME + this._sessionId),
				rowId:                      rowId
			};
			html = AjxTemplate.expand("mail.Message#ForwardAttachments", data);
			this._attachCount = attInfo.length;
			this.checkAttachments();
		}
	}

	this._originalAttachmentsInitialized  = true; //ok, done setting it for the first time.

	if (this._attachCount > 0) {
		this._attcDiv.innerHTML = html;
	} else if (!this._loadingSpan) {
		this.cleanupAttachments(true);
	}

	// include original attachments
	if (attIncludeOrigLinkId) {
		this._attIncludeOrigLinkEl = document.getElementById(attIncludeOrigLinkId);
		if (this._attIncludeOrigLinkEl) {
			Dwt.setHandler(this._attIncludeOrigLinkEl, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._includeOriginalAttachments, this));
		}
	}

	this._attcTabGroup.removeAllMembers();
	var links = Dwt.byClassName('AttLink', this._attcDiv),
		closeButtons = Dwt.byClassName('AttachmentClose', this._attcDiv);
	for (var i = 0; i < links.length; i++) {
		var link = links[i],
			closeButton = closeButtons[i];
		// MailMsg attachments are not displayed via the href, but rather using onClick.
		var onClick = link.onclick;
		this._makeFocusable(link);
		if (onClick) {
			Dwt.clearHandler(link, DwtEvent.ONCLICK);
			Dwt.setHandler(link, DwtEvent.ONCLICK, onClick);
		}
		this._attcTabGroup.addMember(link);
		this._attcTabGroup.addMember(closeButton);
	}
};

ZmComposeView.prototype._includeOriginalAttachments =
function(ev, force) {
	this._hideOriginalAttachments = false;
	this._isIncludingOriginalAttachments = true;
	this._showForwardField(this._msg, this._action, true);
};


// Miscellaneous methods
ZmComposeView.prototype._resetBodySize =
function() {
	if (!this._htmlEditor)
		return;

	var size = Dwt.insetBounds(this.getInsetBounds(),
	                           this._htmlEditor.getInsets());

	if (size) {
		size.height -= Dwt.getSize(this._headerEl).y;

		this._htmlEditor.setSize(size.width, size.height);
	}
};


ZmComposeView.prototype._setFromSelect =
function(msg) {
	if (!this._fromSelect) { return; }

	this._fromSelect.clearOptions();

	var ac = window.parentAppCtxt || window.appCtxt;
	var identity;
	var active = ac.getActiveAccount();
	var accounts = ac.accountList.visibleAccounts;

	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];
		if (appCtxt.isOffline && acct.isMain) { continue; }

		var identities = ac.getIdentityCollection(acct).getIdentities();
		if (ac.isFamilyMbox || ac.get(ZmSetting.OFFLINE_SMTP_ENABLED, null, acct)) {
			for (var j = 0; j < identities.length; j++) {
				identity = identities[j];

				var text = this._getIdentityText(identity, acct);
				var icon = appCtxt.isOffline ? acct.getIcon() : null;
				var option = new DwtSelectOption(identity.id, false, text, null, null, icon);
				option.addr = new AjxEmailAddress(identity.sendFromAddress, AjxEmailAddress.FROM, identity.sendFromDisplay);
				option.accountId = acct.id;

				this._fromSelect.addOption(option);
			}
		}
	}

	var selectedIdentity;
	if (msg) {
		var coll = ac.getIdentityCollection(msg.getAccount());
		selectedIdentity = (msg.isDraft)
			? coll.selectIdentity(msg, AjxEmailAddress.FROM)
			: coll.selectIdentity(msg);
		if (!selectedIdentity) {
			selectedIdentity = coll.defaultIdentity;
		}
	}

	if (!selectedIdentity) {
		selectedIdentity = ac.getIdentityCollection(active).defaultIdentity;
	}

	if (selectedIdentity && selectedIdentity.id) {
		this._fromSelect.setSelectedValue(selectedIdentity.id);
	}

	// for cross account searches, the active account isn't necessarily the
	// account of the selected conv/msg so reset it based on the selected option.
	// if active-account is local/main acct, reset it based on selected option.
	if ((appCtxt.getSearchController().searchAllAccounts && this._fromSelect) || active.isMain) {
		active = this.getFromAccount();
		this._controller._accountName = active.name;
	}

	if (this._acAddrSelectList) {
		this._acAddrSelectList.setActiveAccount(active);
	}

	this._recipients.resetPickerButtons(active);
};



// Returns a string representing the form content
ZmComposeView.prototype._formValue = function(incAddrs, incSubject) {

	var vals = [];
	if (incAddrs) {
		for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
			var type = ZmMailMsg.COMPOSE_ADDRS[i];
			if (this._recipients.getUsing(type)) {
				vals.push(this._recipients.getAddrFieldValue(type));
			}
		}
	}

	if (incSubject) {
		vals.push(this._subjectField.value);
	}

    var htmlMode = (this._composeMode === Dwt.HTML);
    if (!htmlMode) {
        var content = this._getEditorContent();
        vals.push(content);
    }

	return AjxUtil.collapseList(vals).join("|");
};

// Listeners


ZmComposeView.prototype._controlListener =
function() {
	this._resetBodySize();
};


// Callbacks

// this callback is triggered when an event occurs inside the html editor (when in HTML mode)
// it is used to set focus to the To: field when user hits the TAB key
ZmComposeView.prototype._htmlEditorEventCallback =
function(args) {
	var rv = true;
	if (args.type === "keydown") {
		var key = DwtKeyEvent.getCharCode(args);
		if (key === DwtKeyEvent.KEY_TAB) {
			var toField = this._recipients.getField(AjxEmailAddress.TO);
			if (toField) {
				appCtxt.getKeyboardMgr().grabFocus(toField);
			}
			rv = false;
		}
	}
	return rv;
};

// needed to reset design mode when in html compose format for gecko
ZmComposeView.prototype._okCallback =
function() {
	appCtxt.getMsgDialog().popdown();
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

// User has agreed to send message without a subject
ZmComposeView.prototype._noSubjectOkCallback =
function(dialog) {
	this._noSubjectOkay = true;
	this._popDownAlertAndSendMsg(dialog);
};

//this is used by several kinds of alert dialogs
ZmComposeView.prototype._popDownAlertAndSendMsg =
function(dialog) {
	// not sure why: popdown (in FF) seems to create a race condition,
	// we can't get the attachments from the document anymore.
	// W/in debugger, it looks fine, but remove the debugger and any
	// alerts, and gotAttachments will return false after the popdown call.

	if (AjxEnv.isIE) {
		dialog.popdown();
	}
	// bug fix# 3209
	// - hide the dialog instead of popdown (since window will go away anyway)
	if (AjxEnv.isNav && appCtxt.isChildWindow) {
		dialog.setVisible(false);
	}

	// dont make any calls after sendMsg if child window since window gets destroyed
	if (appCtxt.isChildWindow && !AjxEnv.isNav) {
		// bug fix #68774 Empty warning window when sending message without subject in chrome
		dialog.popdown();
		this._controller.sendMsg();
	} else {
		// bug fix #3251 - call popdown BEFORE sendMsg
		dialog.popdown();
		this._controller.sendMsg();
	}
};

// User has canceled sending message without a subject
ZmComposeView.prototype._noSubjectCancelCallback =
function(dialog) {
	this.enableInputs(true);
	dialog.popdown();
	appCtxt.getKeyboardMgr().grabFocus(this._subjectField);
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

ZmComposeView.prototype._errViaZimletOkCallback =
function(params) {
	var dialog = params.errDialog; 
	var zimletName = params.zimletName;
	//add this zimlet to ignoreZimlet string
	this._ignoredZimlets = this._ignoredZimlets || {};
	this._ignoredZimlets[zimletName] = true;
	this._popDownAlertAndSendMsg(dialog);
};

ZmComposeView.prototype._errViaZimletCancelCallback =
function(params) {
	var dialog = params.errDialog; 
	var zimletName = params.zimletName;
	this.enableInputs(true);
	dialog.popdown();
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

// User has agreed to send message with bad addresses
ZmComposeView.prototype._badAddrsOkCallback =
function(dialog) {
	this.enableInputs(true);
	this._badAddrsOkay = true;
	dialog.popdown();
	this._controller.sendMsg();
};

// User has declined to send message with bad addresses - set focus to bad field
ZmComposeView.prototype._badAddrsCancelCallback =
function(type, dialog) {
	this.enableInputs(true);
	this._badAddrsOkay = false;
	dialog.popdown();
	if (this._recipients.getUsing(type)) {
		appCtxt.getKeyboardMgr().grabFocus(this._recipients.getField(type));
	}
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

ZmComposeView.prototype._closeAttachDialog =
function() {
	if (this._attachDialog)
		this._attachDialog.popdown();

	this._initProgressSpan(ZmMsg.uploadingAttachment);

	var progress = function (obj) {
					var selfobject = obj;
					obj.si = window.setInterval (function() {selfobject._progress();}, 500);
	 };
	progress(this);
};

ZmComposeView.prototype._setAttachedMsgIds =
function(msgIds) {
	this._msgIds = msgIds;
};

// Files have been uploaded, re-initiate the send with an attachment ID.
ZmComposeView.prototype._attsDoneCallback =
function(isDraft, status, attId, docIds, msgIds) {
	DBG.println(AjxDebug.DBG1, "Attachments: isDraft = " + isDraft + ", status = " + status + ", attId = " + attId);
	this._closeAttachDialog();
	if (status === AjxPost.SC_OK) {
		if (msgIds) {
		  this._setAttachedMsgIds(msgIds);
		}
		var callback = this._resetUpload.bind(this);
		this._startUploadAttachment(); 
		this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, attId, docIds, callback);
	} else if (status === AjxPost.SC_UNAUTHORIZED) {
		// auth failed during att upload - let user relogin, continue with compose action
		this._resetUpload(true);
		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
		var callback = new AjxCallback(this._controller, isDraft ? this._controller.saveDraft : this._controller._send);
		this._controller._handleException(ex, {continueCallback:callback});
	} else {
		// bug fix #2131 - handle errors during attachment upload.
		this._resetUpload(true);
		this._controller.popupUploadErrorDialog(ZmItem.MSG, status,
		                                        ZmMsg.errorTryAgain);
		this._controller.resetToolbarOperations();
	}
};


//Mandatory Spellcheck Callback
ZmComposeView.prototype._spellCheckShield =
function(words) {
	if (words && words.available && words.misspelled && words.misspelled.length !== 0) {
		var msgDialog = new DwtMessageDialog({parent: appCtxt.getShell(), buttons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], id: Dwt.getNextId("SpellCheckConfirm_")});
		msgDialog.setMessage(AjxMessageFormat.format(ZmMsg.misspellingsMessage, [words.misspelled.length]), DwtMessageDialog.WARNING_STYLE);
		msgDialog.registerCallback(DwtDialog.YES_BUTTON, this._spellCheckShieldOkListener, this, [ msgDialog, words ] );
		msgDialog.registerCallback(DwtDialog.NO_BUTTON, this._spellCheckShieldCancelListener, this, msgDialog);
		msgDialog.associateEnterWithButton(DwtDialog.NO_BUTTON);
		msgDialog.getButton(DwtDialog.YES_BUTTON).setText(ZmMsg.correctSpelling);
		msgDialog.getButton(DwtDialog.NO_BUTTON).setText(ZmMsg.sendAnyway);
		var composeView = this;
		msgDialog.handleKeyAction = function(actionCode, ev) { if (actionCode && actionCode==DwtKeyMap.CANCEL) { composeView._spellCheckShieldOkListener(msgDialog, words, ev); return(true); } };
		msgDialog.popup(null, DwtDialog.NO_BUTTON);
	} else {
		this._spellCheckOkay = true;
		this._controller.sendMsg();
	}
};

ZmComposeView.prototype._spellCheckShieldOkListener =
function(msgDialog, words, ev) {

	this._controller._toolbar.enableAll(true);
	this.enableInputs(true);
	this._controller.toggleSpellCheckButton(true);
	this._htmlEditor.discardMisspelledWords();

	this._spellCheckOkay = false;
	msgDialog.popdown();

	this._htmlEditor.onExitSpellChecker = new AjxCallback(this._controller, this._controller.toggleSpellCheckButton, true)
	this._htmlEditor._spellCheckCallback(words);
};

ZmComposeView.prototype._spellCheckShieldCancelListener =
function(msgDialog, ev) {
	this._spellCheckOkay = true;
	msgDialog.popdown();
	this._controller.sendMsg();
};

ZmComposeView.prototype._spellCheckErrorShield =
function(ex) {
	var msgDialog = appCtxt.getYesNoMsgDialog();
	msgDialog.setMessage(ZmMsg.spellCheckFailed);
	msgDialog.registerCallback(DwtDialog.YES_BUTTON, this._spellCheckErrorShieldOkListener, this, msgDialog );
	msgDialog.registerCallback(DwtDialog.NO_BUTTON, this._spellCheckErrorShieldCancelListener, this, msgDialog);
	msgDialog.associateEnterWithButton(DwtDialog.NO_BUTTON);
	msgDialog.popup(null, DwtDialog.NO_BUTTON);

	return true;
};

ZmComposeView.prototype._spellCheckErrorShieldOkListener =
function(msgDialog, ev) {

	this._controller._toolbar.enableAll(true);
	this._controller.toggleSpellCheckButton(false);
	this._htmlEditor.discardMisspelledWords();
	msgDialog.popdown();

	this._spellCheckOkay = true;
	this._controller.sendMsg();
		
};

ZmComposeView.prototype._spellCheckErrorShieldCancelListener =
function(msgDialog, ev) {
	this._controller._toolbar.enableAll(true);
	this._controller.toggleSpellCheckButton(false);
	this._htmlEditor.discardMisspelledWords();
	msgDialog.popdown();
};

ZmComposeView.prototype._setFormValue =
function() {
	this._origFormValue = this._formValue(true, true);
};

ZmComposeView.prototype._clearFormValue = function() {

    DBG.println('draft', 'ZmComposeView._clearFormValue for ' + this._view);
	this._origFormValue = "";
	this._isDirty = false;
    if (this._htmlEditor) {
        this._htmlEditor.clearDirty();
    }
};

ZmComposeView.prototype._focusHtmlEditor =
function() {
	this._htmlEditor.focus();
};


// Static methods

// Update tab text when content of Subject field changes
ZmComposeView._onKeyUp = function(ev) {

    var cv = ZmComposeView._getComposeViewFromEvent(ev);
    if (cv) {
        cv.updateTabTitle();
    }

	return true;
};

// Subject field has gotten focus
ZmComposeView._onFocus = function(ev) {

    var cv = ZmComposeView._getComposeViewFromEvent(ev);
    if (cv) {
        appCtxt.getKeyboardMgr().updateFocus(cv._subjectField);
    }
};

ZmComposeView._getComposeViewFromEvent = function(ev) {

    ev = DwtUiEvent.getEvent(ev);
    var element = DwtUiEvent.getTargetWithProp(ev, "id");
    return element && DwtControl.fromElementId(element._composeViewId);
};

// for com.zimbra.dnd zimlet
ZmComposeView.prototype.uploadFiles =
function() {
	var attachDialog = appCtxt.getAttachDialog();
	var callback = new AjxCallback(this, this._attsDoneCallback, [true]);
	attachDialog.setUploadCallback(callback);
	attachDialog.upload(callback, document.getElementById("zdnd_form"));
};

ZmComposeView.prototype.deactivate =
function() {
	this._controller.inactive = true;
};

ZmComposeView.prototype._getIframeDoc =
function() {
	return this._htmlEditor && this._htmlEditor._getIframeDoc();
};

/**
 * Moves the cursor to the beginning of the editor.
 * 
 * @param {number}		delay			timer delay in ms
 * @param {number}		offset			number of characters to skip ahead when placing cursor
 * 
 * @private
 */
ZmComposeView.prototype._moveCaretOnTimer =
function(offset, delay) {

	delay = (delay !== null) ? delay : 200;
	var len = this._getEditorContent().length;
	AjxTimedAction.scheduleAction(new AjxTimedAction(this, function() {
		if (this._getEditorContent().length === len) {
			this.getHtmlEditor().moveCaretToTop(offset);
		}
	}), delay);
};


/**
 * @overview
 * This class is used to manage the creation of a composed message, without a UI. For example,
 * it an be used to reply to a msg with some canned or user-provided text.
 * 
 * @param controller
 * @param composeMode
 */
ZmHiddenComposeView = function(controller, composeMode) {
	// no need to invoke parent ctor since we don't need to create a UI
	this._controller = controller;
	this._composeMode = composeMode;
	this.reset();
};

ZmHiddenComposeView.prototype = new ZmComposeView;
ZmHiddenComposeView.prototype.constructor = ZmHiddenComposeView;

ZmHiddenComposeView.prototype.isZmHiddenComposeView = true;
ZmHiddenComposeView.prototype.toString = function() { return "ZmHiddenComposeView"; };

/**
 * Sets the current view, based on the given action. The compose form is
 * created and laid out and everything is set up for interaction with the user.
 *
 * @param {Hash}		params			a hash of parameters:
 * @param {constant}	action				new message, reply, or forward
 * @param {ZmMailMsg}	msg					the original message (reply/forward), or address (new message)
 * @param {ZmIdentity}	identity			identity of sender
 * @param {String}		toOverride			To: addresses (optional)
 * @param {String}		ccOverride			Cc: addresses (optional)
 * @param {String}		subjectOverride		subject for new msg (optional)
 * @param {String}		extraBodyText		text for new msg
 * @param {String}		accountName			on-behalf-of From address
 */
ZmHiddenComposeView.prototype.set =
function(params) {

	this.reset();
		
	var action = this._action = params.action;
	var msg = this._msg = this._origMsg = params.msg;

	if (!ZmComposeController.IS_FORWARD[action]) {
		this._setAddresses(action, AjxEmailAddress.TO, params.toOverride);
		if (params.ccOverride) {
			this._setAddresses(action, AjxEmailAddress.CC, params.ccOverride);
		}
		if (params.bccOverride) {
			this._setAddresses(action, AjxEmailAddress.BCC, params.bccOverride);
		}
	}
	this._setSubject(action, msg, params.subjectOverride);
	this._setBody(action, msg, params.extraBodyText, true);
	var oboMsg = msg || (params.selectedMessages && params.selectedMessages.length && params.selectedMessages[0]);
	var obo = this._getObo(params.accountName, oboMsg);
		
	if (action !== ZmOperation.FORWARD_ATT) {
		this._saveExtraMimeParts();
	}
};

ZmHiddenComposeView.prototype.setComposeMode =
function(composeMode) {
	this._composeMode = composeMode;
};

// no-op anything that relies on UI components
ZmHiddenComposeView.prototype.applySignature = function() {};
ZmHiddenComposeView.prototype.enableInputs = function() {};
ZmHiddenComposeView.prototype._showForwardField = function() {};
ZmHiddenComposeView.prototype.cleanupAttachments = function() {};
ZmHiddenComposeView.prototype.resetBody = function() {};
ZmHiddenComposeView.prototype._resetBodySize = function() {};

/**
 * Returns a msg created from prior input.
 */
ZmHiddenComposeView.prototype.getMsg =
function() {

	var addrs = this._recipients.collectAddrs();
	var subject = this._subject;

	// Create Msg Object - use dummy if provided
	var msg = new ZmMailMsg();
	msg.setSubject(subject);

	this.sendUID = (new Date()).getTime();

	// build MIME
	var top = this._getTopPart(msg, false, this._bodyContent[this._composeMode]);

	msg.setTopPart(top);
	msg.setSubject(subject);

    //vcard signature may be set
    if (this._msg && this._msg._contactAttIds) {
        msg.setContactAttIds(this._msg._contactAttIds);
        this._msg.setContactAttIds([]);
    }

	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		var a = addrs[type];
		if (a && a.length) {
			msg.setAddresses(type, AjxVector.fromArray(a));
		}
	}
	msg.identity = this.getIdentity();
	msg.sendUID = this.sendUID;

	// save a reference to the original message
	msg._origMsg = this._msg;
	if (this._msg && this._msg._instanceDate) {
		msg._instanceDate = this._msg._instanceDate;
	}

	this._setMessageFlags(msg);

	return msg;
};

ZmHiddenComposeView.prototype.reset =
function(bEnableInputs) {

	this.sendUID = null;
	this._recipients = new ZmHiddenRecipients();
	this._subject = "";
	this._controller._curIncOptions = null;
	this._msgAttId = null;
	this._addresses = {};
	this._bodyContent = {};
	this._components = {};
	this._quotedTextChanged = false;

	// remove extra mime parts
	this._extraParts = null;
};

ZmHiddenComposeView.prototype.getIdentity =
function() {
	//get the same identity we would have gotten as the selected one in full compose view persona select.
	return this._controller._getIdentity(this._msg);
};

ZmHiddenComposeView.prototype.__initCtrl = function() {};

/**
 * Minimal version of ZmRecipients that has no UI. Note that addresses are stored in
 * arrays rather than vectors.
 */
ZmHiddenRecipients = function() {
	this._addresses = {};
};

ZmHiddenRecipients.prototype.setAddress =
function(type, addr) {
	if (type && addr) {
		this._addresses[type] = this._addresses[type] || [];
		this._addresses[type].push(addr);
	}
};

ZmHiddenRecipients.prototype.addAddresses =
function(type, addrVec, used) {

	var addrAdded = false;
	used = used || {};
	var addrs = AjxUtil.toArray(addrVec);
	if (addrs && addrs.length) {
		if (!this._addresses[type]) {
			this._addresses[type] = [];
		}
		for (var i = 0, len = addrs.length; i < len; i++) {
			var addr = addrs[i];
			addr = addr.isAjxEmailAddress ? addr : AjxEmailAddress.parse(addr);
			if (addr) {
				var email = addr.getAddress();
				if (!email) { continue; }
				email = email.toLowerCase();
				if (!used[email]) {
					this._addresses[type].push(addr);
					used[email] = true;
					addrAdded = true;
				}
			}
		}
	}
	return addrAdded;
};

ZmHiddenRecipients.prototype.collectAddrs =
function() {
	return this._addresses;
};
