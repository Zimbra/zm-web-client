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
 * Creates a new compose view. The view does not display itself on construction.
 * @constructor
 * @class
 * This class provides a form for composing a message.
 *
 * @author Conrad Damon
 * 
 * @param {DwtControl}	parent		the element that created this view
 * @param {ZmController}	controller	the controller managing this view
 * @param {constant}	composeMode 	passed in so detached window knows which mode to be in on startup
 * 
 * @extends		DwtComposite
 * 
 * @private
 */
ZmComposeView = function(parent, controller, composeMode) {

	this.TEMPLATE = "mail.Message#Compose";
	this._view = ZmId.VIEW_COMPOSE + controller.sessionId;
	this._sessionId = controller.sessionId;

	DwtComposite.call(this, {parent:parent, className:"ZmComposeView", posStyle:Dwt.ABSOLUTE_STYLE,
							 id:ZmId.getViewId(this._view)});

	ZmComposeView.ADDR_SETTING[AjxEmailAddress.BCC]	= ZmSetting.SHOW_BCC;

	ZmComposeView.NOTIFY_ACTION_MAP = {};
	ZmComposeView.NOTIFY_ACTION_MAP[ZmOperation.REPLY_ACCEPT]		= ZmOperation.REPLY_ACCEPT_NOTIFY;
	ZmComposeView.NOTIFY_ACTION_MAP[ZmOperation.REPLY_DECLINE]		= ZmOperation.REPLY_DECLINE_NOTIFY;
	ZmComposeView.NOTIFY_ACTION_MAP[ZmOperation.REPLY_TENTATIVE]	= ZmOperation.REPLY_TENTATIVE_NOTIFY;

	this._onMsgDataChange = new AjxCallback(this, this._onMsgDataChange);

	this._controller = controller;
	this._initialize(composeMode);

	// make sure no unnecessary scrollbars show up
	this.getHtmlElement().style.overflow = "hidden";
};

ZmComposeView.prototype = new DwtComposite;
ZmComposeView.prototype.constructor = ZmComposeView;

ZmComposeView.prototype.toString =
function() {
	return "ZmComposeView";
};

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

// max # of attachments to show
ZmComposeView.SHOW_MAX_ATTACHMENTS		= AjxEnv.is800x600orLower ? 2 : 3;
ZmComposeView.MAX_ATTACHMENT_HEIGHT 	= (ZmComposeView.SHOW_MAX_ATTACHMENTS * 23) + "px";

// Reply/forward stuff
ZmComposeView.EMPTY_FORM_RE				= /^[\s\|]*$/;
ZmComposeView.HTML_TAG_RE				= /(<[^>]+>)/g;
ZmComposeView.SUBJ_PREFIX_RE			= new RegExp("^\\s*(Re|Fw|Fwd|" + ZmMsg.re + "|" + ZmMsg.fwd + "|" + ZmMsg.fw + "):" + "\\s*", "i");
ZmComposeView.QUOTED_CONTENT_RE			= new RegExp("^----- ", "m");
ZmComposeView.HTML_QUOTED_CONTENT_RE	= new RegExp("<br>----- ", "i");
ZmComposeView.ADDR_SETTING				= {}; // XXX: may not be necessary anymore?

ZmComposeView.OP = {};
ZmComposeView.OP[AjxEmailAddress.TO]	= ZmId.CMP_TO;
ZmComposeView.OP[AjxEmailAddress.CC]	= ZmId.CMP_CC;
ZmComposeView.OP[AjxEmailAddress.BCC]	= ZmId.CMP_BCC;


// Public methods

/**
 * Sets the current view, based on the given action. The compose form is
 * created and laid out and everything is set up for interaction with the user.
 *
 * @param	{Hash}	params		a hash of parameters
 * @param {constant}	params.action				new message, reply, forward, or an invite action
 * @param {ZmIdentity}	params.identity			the identity sending the message
 * @param {ZmMailMsg}	params.msg				the original message (reply/forward), or address (new message)
 * @param {String}	params.toOverride			initial value for To: field
 * @param {String}	params.subjOverride		initial value for Subject: field
 * @param {String}	params.extraBodyText		canned text to prepend to body (invites)
 * @param {Array}	params.msgIds				list of msg Id's to be added as attachments
 * @param {ZmIdentity}	params.identity			identity to use for this compose
 * @param {String}	params.accountName		on-behalf-of From address
 */
ZmComposeView.prototype.set =
function(params) {
	var action = this._action = params.action;
	if (this._msg) {
		this._msg.onChange = null;
	}
	this._acceptFolderId = params.acceptFolderId;
	var obo = params.accountName;
	var msg = this._msg = this._addressesMsg = params.msg;
	if (msg) {
		msg.onChange = this._onMsgDataChange;
		var folder = (!obo) ? appCtxt.getById(msg.folderId) : null;
		obo = (folder && folder.isRemote()) ? folder.getOwner() : null;

		// check if this is a draft that was originally composed obo
		if (!obo && msg.isDraft && !appCtxt.multiAccounts) {
			var ac = window.parentAppCtxt || window.appCtxt;
			var from = msg.getAddresses(AjxEmailAddress.FROM).get(0);
			if (from && from.address.toLowerCase() != ac.accountList.mainAccount.getEmail().toLowerCase() && !appCtxt.isMyAddress(from.address.toLowerCase())) {
				obo = from.address;
			}
		}
	}

	// list of msg Id's to add as attachments
	this._msgIds = params.msgIds;

	this.reset(true);

	this._setFromSelect(msg);

	if (params.identity) {
		if (this.identitySelect) {
			this.identitySelect.setSelectedValue(params.identity.id);
		}
		if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED) || appCtxt.multiAccounts) {
			var selected = params.identity.signature || "";
			var account = appCtxt.multiAccounts && this.getFromAccount();
			this._controller.resetSignatureToolbar(selected, account);
		}
	}

	// reset To/Cc/Bcc fields
	this._showAddressField(AjxEmailAddress.TO, true, true, true);
	this._showAddressField(AjxEmailAddress.CC, true, true, true);
	//Set BCC Field to Default
	this._toggleBccField(null, appCtxt.get(ZmSetting.SHOW_BCC));

	// populate fields based on the action and user prefs
	this._setAddresses(action, AjxEmailAddress.TO, params.toOverride);
	if (params.ccOverride) {
		this._setAddresses(action, AjxEmailAddress.CC, params.ccOverride);
	}
	if (params.bccOverride) {
		this._setAddresses(action, AjxEmailAddress.BCC, params.bccOverride);
	}
	if (obo) {
		this._setObo(obo);
	}
	this._setSubject(action, msg, params.subjOverride);
	this._setBody(action, msg, params.extraBodyText);

	if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
		var priority = "";
		if (msg && (action == ZmOperation.DRAFT)) {
			if (msg.isHighPriority) {
				priority = ZmItem.FLAG_HIGH_PRIORITY;
			} else if (msg.isLowPriority) {
				priority = ZmItem.FLAG_LOW_PRIORITY;
			}
		}
		this._setPriority(priority);
	}

	this.getHtmlEditor().moveCaretToTop();

	if (action != ZmOperation.FORWARD_ATT) {
		// save extra mime parts
		var bodyParts = msg ? msg.getBodyParts() : [];
		for (var i = 0; i < bodyParts.length; i++) {
			var bodyPart = bodyParts[i];
			var contentType = bodyPart.ct;

			if (contentType == ZmMimeTable.TEXT_PLAIN) continue;
			if (contentType == ZmMimeTable.TEXT_HTML) continue;
			if (ZmMimeTable.isRenderableImage(contentType) && bodyPart.cd == "inline") continue; // bug: 28741

			var mimePart = new ZmMimePart();
			mimePart.setContentType(contentType);
			mimePart.setContent(bodyPart.content);
			this.addMimePart(mimePart);
		}
	}

	// save form state (to check for change later)
	if (this._composeMode == DwtHtmlEditor.HTML) {
		var ta = new AjxTimedAction(this, this._setFormValue);
		AjxTimedAction.scheduleAction(ta, 10);
	} else {
		this._setFormValue();
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
	if (what == "subject") {
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
	if (this._isReply()) {
		text = ZmMsg.reply;
	} else if (this._isForward()) {
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
	var addrs = {};
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (this._using[type]) {
			addrs[type] = this._field[type].value;
		}
	}
	return addrs;
};

// returns address fields that are currently visible
ZmComposeView.prototype.getAddrFields =
function() {
	var addrs = [];
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (this._using[type]) {
			addrs.push(this._field[type]);
		}
	}
	return addrs;
};

// returns list of attachment field values (used by detachCompose)
ZmComposeView.prototype.getAttFieldValues =
function() {
	var attList = [];
	var atts = document.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++)
		attList.push(atts[i].value);

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
	val += this._getForwardAttIds(ZmComposeView.FORWARD_ATT_NAME+this._sessionId).join("");
	val += this._getForwardAttIds(ZmComposeView.FORWARD_MSG_NAME+this._sessionId).join("");

	return val;
};

ZmComposeView.prototype._isInline =
function(msg) {

	if (this._attachDialog) {
		return this._attachDialog.isInline();
	}

	msg = msg || this._msg;

	if (msg && this._msgAttId && msg.id == this._msgAttId) {
		return false;
	}

	if (msg && msg.attachments) {
		var atts = msg.attachments;
		for (var i = 0; i < atts.length; i++) {
			if (atts[i].ci) {
				return true;
			}
		}
	}

	return false;
};

ZmComposeView.prototype._handleInlineAtts =
function(msg, handleInlineDocs){

	var handled = false, ci, cid, dfsrc, inlineAtt;

	var idoc = this._htmlEditor._getIframeDoc();
	var images = idoc.getElementsByTagName("img");
	for (var i = 0; i < images.length; i++) {
		dfsrc = images[i].getAttribute("dfsrc") || images[i].getAttribute("mce_src") || images[i].src;
		if (dfsrc) {
			if (dfsrc.substring(0,4) == "cid:") {
				cid = dfsrc.substring(4);
				var docpath = images[i].getAttribute("doc");
				if(docpath){
					msg.addInlineDocAttachment(cid, null, docpath);
					handled = true;
				} else {
					ci = "<" + cid + ">";
					inlineAtt = msg.findInlineAtt(ci);
					if (!inlineAtt && this._msg) {
						inlineAtt = this._msg.findInlineAtt(ci);
					}
					if (inlineAtt) {
						msg.addInlineAttachmentId(cid, null, inlineAtt.part);
						handled = true;
					}
				}
			}
		}
	}

	return handled;
};

ZmComposeView.prototype._mergeInlineAndForwardAtts =
function(msg, forwardAttIds) {

	var newFwdAttIds = [];
	var atts = this._msg.attachments;

	function checkFwdAttExists(part) {
		for (var j = 0; j < forwardAttIds.length; j++) {
			if(forwardAttIds[j] == part){
				return true;
			}
		}
		return false;
	}

	for (var i = 0; i < atts.length; i++) {
		var att = atts[i];
		if (att.ci && !checkFwdAttExists(att.part)) {
			newFwdAttIds.push(att.part);
		}
	}

	return [].concat(forwardAttIds, newFwdAttIds);
};

/**
* Returns the message from the form, after some basic input validation.
*/
ZmComposeView.prototype.getMsg =
function(attId, isDraft, dummyMsg) {
	// Check destination addresses.
	var addrs = this._collectAddrs();

	// Any addresses at all provided? If not, bail.
	if (!isDraft && !addrs.gotAddress) {
		this.enableInputs(false);
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(ZmMsg.noAddresses, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup(this._getDialogXY());
		msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._okCallback, this);
		this.enableInputs(true);
		return;
	}

	var cd = appCtxt.getOkCancelMsgDialog();
	cd.reset();

	// Is there a subject? If not, ask the user if they want to send anyway.
	var subject = AjxStringUtil.trim(this._subjectField.value);
	if (!isDraft && subject.length == 0 && !this._noSubjectOkay) {
		this.enableInputs(false);
		cd.setMessage(ZmMsg.compSubjectMissing, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._noSubjectOkCallback, this, cd);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._noSubjectCancelCallback, this, cd);
		cd.popup(this._getDialogXY());
		return;
	}

	// Any bad addresses?  If there are bad ones, ask the user if they want to send anyway.
	if (!isDraft && addrs[ZmComposeView.BAD].size() && !this._badAddrsOkay) {
		this.enableInputs(false);
		var bad = AjxStringUtil.htmlEncode(addrs[ZmComposeView.BAD].toString(AjxEmailAddress.SEPARATOR));
		var msg = AjxMessageFormat.format(ZmMsg.compBadAddresses, bad);
		cd.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._badAddrsOkCallback, this, cd);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._badAddrsCancelCallback, this, [addrs.badType, cd]);
		cd.setVisible(true); // per fix for bug 3209
		cd.popup(this._getDialogXY());
		return;
	} else {
		this._badAddrsOkay = false;
	}

	// Mandatory Spell Check
	if (!isDraft && appCtxt.get(ZmSetting.SPELL_CHECK_ENABLED) && 
		appCtxt.get(ZmSetting.MAIL_MANDATORY_SPELLCHECK) && !this._spellCheckOkay) {
		if (this._htmlEditor.checkMisspelledWords(new AjxCallback(this, this._spellCheckShield), null, new AjxCallback(this, this._spellCheckErrorShield))) {
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
	if (this._attachDialog && this._attachDialog.isInline() && attId) {
		for (var i = 0; i < attId.length; i++) {
			var att = attId[i];
			if (att.s == 0) {
				zeroSizedAttachments = true;
				continue;
			}
			var contentType = att.ct;
			if (contentType && contentType.indexOf("image") != -1) {
				var cid = Dwt.getNextId();
				this._htmlEditor.insertImage("cid:" + cid, AjxEnv.isIE);
				msg.addInlineAttachmentId(cid, att.aid);
			} else {
				msg.addAttachmentId(att.aid);
			}
		}
	} else if (attId && typeof attId != "string") {
		for (var i = 0; i < attId.length; i++) {
			if (attId[i].s == 0) {
				zeroSizedAttachments = true;
				continue;
			}
			msg.addAttachmentId(attId[i].aid);
		}
	} else if (attId) {
		msg.addAttachmentId(attId);
	}

	if (zeroSizedAttachments){
		appCtxt.setStatusMsg(ZmMsg.zeroSizedAtts);
	}

	// check if this is a resend
	if (this.sendUID && this.backupForm) {
		// if so, check if user changed anything since canceling the send
		if (isDraft || this._backupForm() != this.backupForm) {
			this.sendUID = (new Date()).getTime();
		}
	} else {
		this.sendUID = (new Date()).getTime();
	}

	// get list of message part id's for any forwarded attachements
	var forwardAttIds = this._getForwardAttIds(ZmComposeView.FORWARD_ATT_NAME+this._sessionId);
	var forwardMsgIds = this._getForwardAttIds(ZmComposeView.FORWARD_MSG_NAME+this._sessionId);

	// --------------------------------------------
	// Passed validation checks, message ok to send
	// --------------------------------------------

	// set up message parts as necessary
	var top = new ZmMimePart();

	if (this._composeMode == DwtHtmlEditor.HTML) {
		top.setContentType(ZmMimeTable.MULTI_ALT);

		// create two more mp's for text and html content types
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(this._htmlEditor.getTextVersion());
		top.children.add(textPart);

		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);		

		var idoc = this._htmlEditor._getIframeDoc();
        this._cleanupFileRefImages(idoc);
		this._restoreMultipartRelatedImages(idoc);
		if (!isDraft) {
			this._cleanupSignatureIds(idoc);
		}
		var defangedContent = this._htmlEditor.getContent(true);

		// Bug 27422 - Firefox and Safari implementation of execCommand("bold")
		// etc use styles, and some email clients (Entourage) don't process the
		// styles and the text remains plain. So we post-process and convert
		// those to the tags (which are what the IE version of execCommand() does).
		if (AjxEnv.isFirefox) {
			defangedContent = defangedContent.replace(/<span style="font-weight: bold;">(.+?)<\/span>/, "<strong>$1</strong>");
			defangedContent = defangedContent.replace(/<span style="font-style: italic;">(.+?)<\/span>/, "<em>$1</em>");
			defangedContent = defangedContent.replace(/<span style="text-decoration: underline;">(.+?)<\/span>/, "<u>$1</u>");
			defangedContent = defangedContent.replace(/<span style="text-decoration: line-through;">(.+?)<\/span>/, "<strike>$1</strike>");
		} else if (AjxEnv.isSafari) {
			defangedContent = defangedContent.replace(/<span class="Apple-style-span" style="font-weight: bold;">(.+?)<\/span>/, "<strong>$1</strong>");
			defangedContent = defangedContent.replace(/<span class="Apple-style-span" style="font-style: italic;">(.+?)<\/span>/, "<em>$1</em>");
			defangedContent = defangedContent.replace(/<span class="Apple-style-span" style="text-decoration: underline;">(.+?)<\/span>/, "<u>$1</u>");
			defangedContent = defangedContent.replace(/<span class="Apple-style-span" style="text-decoration: line-through;">(.+?)<\/span>/, "<strike>$1</strike>");
		}

		htmlPart.setContent(defangedContent);

		this._handleInlineAtts(msg, true); // Better Code
		var inlineAtts = msg.getInlineAttachments();
		var inlineDocAtts = msg.getInlineDocAttachments();
		var iAtts = [].concat(inlineAtts, inlineDocAtts);
		if ( iAtts &&  iAtts.length > 0 ) {
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
		textPart.setContent(this._htmlEditor.getContent());

		if (inline) {
			top.setContentType(ZmMimeTable.MULTI_ALT);
			var relatedPart = new ZmMimePart();
			relatedPart.setContentType(ZmMimeTable.MULTI_RELATED);
			relatedPart.children.add(textPart);
			top.children.add(relatedPart);
            // bug: 43156 
            // Commented as we now show inline attachments as part of forward attachments.
			//forwardAttIds = this._mergeInlineAndForwardAtts(msg, forwardAttIds);
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

	// store text-content of the current email
	msg.textBodyContent = (this._composeMode == DwtHtmlEditor.HTML)
		? this._htmlEditor.getTextVersion()
		: this._htmlEditor.getContent();

	msg.setTopPart(top);
	msg.setSubject(subject);
	msg.setForwardAttIds(forwardAttIds);
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (addrs[type] && addrs[type].all.size() > 0) {
			msg.setAddresses(type, addrs[type].all);
		}
	}
	msg.identity = this.getIdentity();
	msg.sendUID = this.sendUID;

	// save a reference to the original message
	msg._origMsg = this._msg;
	if (this._msg && this._msg._instanceDate) {
		msg._instanceDate = this._msg._instanceDate;
	}

	if (this._action != ZmOperation.NEW_MESSAGE && this._msg && !this._msgIds) {
		var isInviteReply = this._isInviteReply(this._action);
		if (this._action == ZmOperation.DRAFT) {
			msg.isReplied = (this._msg.rt == "r");
			msg.isForwarded = (this._msg.rt == "w");
			msg.isDraft = this._msg.isDraft;
			// check if we're resaving a draft that was originally a reply/forward
			if (msg.isDraft) {
				// if so, set both origId and the draft id
				msg.origId = msg.isReplied || msg.isForwarded ? this._msg.origId : null;
				msg.id = this._msg.id;
				msg.nId = this._msg.nId;
			}
		} else {
			msg.isReplied = this._isReply();
			msg.isForwarded = this._isForward();
			msg.origId = this._msg.id;
		}
		msg.isInviteReply = isInviteReply;
		msg.acceptFolderId = this._acceptFolderId;
		var inviteMode = ZmComposeView.NOTIFY_ACTION_MAP[this._action] ? ZmComposeView.NOTIFY_ACTION_MAP[this._action] : this._action;
		msg.inviteMode = isInviteReply ? inviteMode : null;
		msg.irtMessageId = this._msg.irtMessageId || this._msg.messageId;
		msg.folderId = this._msg.folderId;
	}

	if (this._action == ZmOperation.DRAFT && this._origAcctMsgId) {
		msg.origAcctMsgId = this._origAcctMsgId;
	}

	// replied/forw msg or draft shouldn't have att ID (a repl/forw voicemail mail msg may)
	if (this._msg && this._msg.attId) {
		msg.addAttachmentId(this._msg.attId);
	}

	if (this._msgAttId) {
		if (forwardMsgIds.length > 0) {
			// Check if the MsgId is already present in the fwdMsgIds list.
			var i = 0;
			while (forwardMsgIds[i] && forwardMsgIds[i] != this._msgAttId) {
				i++;
			}
			if (i == forwardMsgIds.length) {
				forwardMsgIds.push(this._msgAttId);
			}
			delete i;
		} else {
			forwardMsgIds.push(this._msgAttId);
		}
	}

	msg.setMessageAttachmentId(forwardMsgIds);

	var priority = this._getPriority();
	if (priority) {
		msg.flagLocal(priority, true);
	}

	if (this._fromSelect) {
		msg.fromSelectValue = this._fromSelect.getSelectedOption();
	}

	/*
	* finally, check for any errors via zimlets..
	* A Zimlet can listen to emailErrorCheck action to perform further check and
	* alert user about the error just before sending email. We will be showing
	* yes/no dialog. This zimlet must return an object {hasError:<true or false>,
	* errorMsg:<Some Error msg>, zimletName:<zimletName>} e.g: {hasError:true,
	* errorMsg:"you might have forgotten attaching an attachment, do you want to
	* continue?", zimletName:"com_zimbra_attachmentAlert"}
	**/
	if (!isDraft && appCtxt.areZimletsLoaded()) {
		var boolAndErrorMsgArray = [];
		var showErrorDlg = false;
		var errorMsg = "";
		var zimletName = "";
		appCtxt.notifyZimlets("emailErrorCheck", [msg, boolAndErrorMsgArray]);
		var blen =  boolAndErrorMsgArray.length;
		for (var k = 0; k < blen; k++) {
			var obj = boolAndErrorMsgArray[k];
			if (obj == null || obj == undefined) { continue; }

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
			cd.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
			var params = {errDialog:cd, zimletName:zimletName};
			cd.registerCallback(DwtDialog.OK_BUTTON, this._errViaZimletOkCallback, this, params);
			cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._errViaZimletCancelCallback, this, params);
			cd.popup(this._getDialogXY());
			return;
		}
	}

	return msg;
};

ZmComposeView.prototype.setDocAttachments =
function(msg, docIds) {
	if (!docIds) { return; }

	var zeroSizedAttachments = false;
	var inline = this._isInline();
	for (var i = 0; i < docIds.length; i++) {
		var docAtt = docIds[i];
		var contentType = docAtt.ct;
		if (docAtt.s == 0) {
			zeroSizedAttachments = true;
			continue;
		}
		if (this._attachDialog && inline) {
			if (contentType && contentType.indexOf("image") != -1) {
				var cid = Dwt.getNextId();
				this._htmlEditor.insertImage("cid:" + cid, AjxEnv.isIE);
				msg.addInlineDocAttachment(cid, docAtt.id);
			} else {
				msg.addDocumentAttachmentId(docAtt.id);
			}
		}else {
			msg.addDocumentAttachmentId(docAtt.id);
		}
	}
	if (zeroSizedAttachments){
		appCtxt.setStatusMsg(ZmMsg.zeroSizedAtts);
	}
};

/**
 * Sets an address field.
 *
 * @param type	the address type
 * @param addr	the address string
 *
 * XXX: if addr empty, check if should hide field
 * 
 * @private
 */
ZmComposeView.prototype.setAddress =
function(type, addr) {
	addr = addr ? addr : "";
	if (addr.length && !this._using[type]) {
		this._using[type] = true;
		this._showAddressField(type, true);
	}
	this._field[type].value = addr;

	// Use a timed action so that first time through, addr textarea
	// has been sized by browser based on content before we try to
	// adjust it (bug 20926)
	AjxTimedAction.scheduleAction(new AjxTimedAction(this,
		function() {
			this._adjustAddrHeight(this._field[type]);
		}), 0);
};

// Sets the mode ZmHtmlEditor should be in.
ZmComposeView.prototype.setComposeMode =
function(composeMode, switchPreface) {
	if (composeMode == this._composeMode) return;
	var htmlMode = (composeMode == DwtHtmlEditor.HTML);
	if (!htmlMode || appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED)) {

		var curMember = (this._composeMode == DwtHtmlEditor.TEXT) ? this._bodyField : this._htmlEditor;
		this._composeMode = composeMode;
		if (!htmlMode && switchPreface) {
			this._switchPreface();
		}

		this._htmlEditor.setMode(composeMode, true);

		if (htmlMode && switchPreface) {
			this._switchPreface();
		}

		// reset the body field Id and object ref
		this._bodyFieldId = this._htmlEditor.getBodyFieldId();
		this._bodyField = document.getElementById(this._bodyFieldId);
		if (this._bodyField.disabled) {
			this._bodyField.disabled = false;
		}

		// for now, always reset message body size
		this._resetBodySize();

		// recalculate form value since HTML mode inserts HTML tags
		this._setFormValue();

		// swap new body field into tab group
		var newMember = (composeMode == DwtHtmlEditor.TEXT) ? this._bodyField : this._htmlEditor;
        if (window.isTinyMCE) {
            curMember = newMember = this._htmlEditor.getEditorContainer();
            this._retryHtmlEditorFocus();
        }
		if (curMember && newMember && (curMember != newMember) && this._controller._tabGroup) {
			this._controller._tabGroup.replaceMember(curMember, newMember);
			// focus via replaceMember() doesn't take, try again
			if (composeMode == DwtHtmlEditor.HTML) {
				this._retryHtmlEditorFocus();
			}
		}
		if (!htmlMode) {
			AjxTimedAction.scheduleAction(new AjxTimedAction(this, function() { this.getHtmlEditor().moveCaretToTop(); }), 200);
		}
	}

	if (this._msg && this._isInline() && composeMode == DwtHtmlEditor.TEXT) {
		this._showForwardField(this._msg, this._action, null, true);
	}
};

ZmComposeView.prototype._retryHtmlEditorFocus =
function() {
	if (this._htmlEditor.hasFocus()) {
		var ta = new AjxTimedAction(this, this._focusHtmlEditor);
		AjxTimedAction.scheduleAction(ta, 10);
	}
};

ZmComposeView.prototype.setDetach =
function(params) {

	this._action = params.action;
	this._msg = params.msg;

	// set the addr fields as populated
	for (var i in params.addrs) {
		this.setAddress(i, params.addrs[i]);
	}

	this._subjectField.value = params.subj || "";
	this.updateTabTitle();

	var content = params.body || "";
	if((content == "") && (this._htmlEditor.getMode() == DwtHtmlEditor.HTML)) {
		content	= "<br>";
	}
	this._htmlEditor.setContent(content);


	if (params.forwardHtml) {
		this._attcDiv.innerHTML = params.forwardHtml;
	}
	if (params.identityId && this.identitySelect) {
		this.identitySelect.setSelectedValue(params.identityId);
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
	if (this._composeMode == DwtHtmlEditor.HTML) {
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
	this._action = ZmOperation.DRAFT;
	this._msg = msgDraft;
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
	var msg = (msgObj) ? msgObj : this._msg;
	var iDoc = this._htmlEditor._getIframeDoc();
	return (this._fixMultipartRelatedImages(msg,iDoc));
};

ZmComposeView.prototype._fixMultipartRelatedImages_onTimer =
function(msg) {
	// first time the editor is initialized, idoc.getElementsByTagName("img") is empty
	// Instead of waiting for 500ms, trying to add this callback. Risky but works.
	if (!this._firstTimeFixImages) {
		this._htmlEditor.addOnContentIntializedListener(new AjxCallback(this, this._fixMultipartRelatedImages, [msg, this._htmlEditor._getIframeDoc()]));
	} else {
		this._fixMultipartRelatedImages(msg, this._htmlEditor._getIframeDoc());
	}
};

/**
 * Twiddle the img tags so that the HTML editor can display the images. Instead of
 * a cid (which is relevant only within the MIME msg), point to the img with a URL.
 * 
 * @private
 */
ZmComposeView.prototype._fixMultipartRelatedImages =
function(msg, idoc) {
	if (!this._firstTimeFixImages) {
		this._htmlEditor.removeOnContentIntializedListener();
		var self = this; // Fix possible hiccups during compose in new window
		setTimeout(function() {
				self._fixMultipartRelatedImages(msg, self._htmlEditor._getIframeDoc());
		}, 10);
		this._firstTimeFixImages = true;
		return;
	}

	idoc = idoc || this._htmlEditor._getIframeDoc();
	if (!idoc) { return; }

	var images = idoc.getElementsByTagName("img");
	var num = 0;
	for (var i = 0; i < images.length; i++) {
		var dfsrc = images[i].getAttribute("dfsrc") || images[i].getAttribute("mce_src") || images[i].src;
		if (dfsrc) {
			if (dfsrc.substring(0,4) == "cid:") {
				num++;
				var cid = "<" + dfsrc.substring(4) + ">";
				var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_ID, cid);
				//Cache cleared, becoz part id's may change.
				src = src + "&t=" + (new Date()).getTime();
				if (src) {
					images[i].src = src;
					images[i].setAttribute("dfsrc", dfsrc);
				}
			} else if (dfsrc.substring(0,4) == "doc:") {
				images[i].src = [appCtxt.get(ZmSetting.REST_URL), ZmFolder.SEP, dfsrc.substring(4)].join('');
			} else if (msg && dfsrc.indexOf("//") == -1) { // check for content-location verison
				var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_LOCATION, dfsrc);
				//Cache cleared, becoz part id's may change.
				if (src) {
					src = src + "&t=" + (new Date()).getTime();
					num++;
					images[i].src = src;
					images[i].setAttribute("dfsrc", dfsrc);
				}
			}
		}
	}
	return (num == images.length);
};

ZmComposeView.prototype._cleanupFileRefImages =
function(idoc){

    function removeImg(img){
        var parent = img.parentNode;
        parent.removeChild(img);
    }

    if (idoc) {
		var images = idoc.getElementsByTagName("img");
		var len = images.length, fileImgs=[], img, src;
        for (var i = 0; i < images.length; i++) {
            img = images[i];
            src = img.src;
            if(img && src.indexOf('file://') == 0){
                removeImg(img);
                i--; //removeImg reduces the images.length by 1.
            }

        }
    }
};

/**
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
			var dfsrc = img.getAttribute("dfsrc") || img.getAttribute("mce_src");
			if (dfsrc && dfsrc.indexOf("cid:") == 0) {
				cid = dfsrc;
				img.removeAttribute("dfsrc");
			} else if (img.src && img.src.indexOf("cid:") == 0) {
				cid = img.src;
			} else if ( dfsrc && dfsrc.substring(0,4) == "doc:"){
				cid = "cid:"+Dwt.getNextId();
				img.removeAttribute("dfsrc");
				img.setAttribute("doc", dfsrc.substring(4, dfsrc.length));
			} else {
				// If "Display External Images" is false then handle Reply/Forward
				if (dfsrc)
					//IE: Over HTTPS, http src urls for images might cause an issue.
					try{ img.src = dfsrc; }catch(ex){};
				}
			if (cid) {
				img.src = cid;
			}
		}
	}
};

ZmComposeView.prototype._cleanupSignatureIds =
function(idoc){
	var signatureId = this._controller._currentSignatureId;
	var signatureEl = idoc.getElementById(signatureId);
	if (signatureEl) {
		signatureEl.removeAttribute("id");
	}
};

ZmComposeView.prototype.showAttachmentDialog =
function() {
	var attachDialog = this._attachDialog = appCtxt.getAttachDialog();
	var callback = new AjxCallback(this, this._attsDoneCallback, [true]);
	attachDialog.setUploadCallback(callback);
	attachDialog.popup();
	attachDialog.enableInlineOption(this._composeMode == DwtHtmlEditor.HTML);
};

/**
 * Revert compose view to a clean state (usually called before popping compose view).
 * 
 * @param	{Boolean}	bEnableInputs		if <code>true</code>, enable the input fields
 */
ZmComposeView.prototype.reset =
function(bEnableInputs) {

	this.backupForm = null;
	this.sendUID = null;

	// reset autocomplete list
	if (this._acAddrSelectList) {
		this._acAddrSelectList.reset();
		this._acAddrSelectList.show(false);
	}

	// reset To/CC/BCC fields
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var textarea = this._field[ZmMailMsg.COMPOSE_ADDRS[i]];
		textarea.value = "";
		this._adjustAddrHeight(textarea, true);
	}

	// reset subject / body fields
	this._subjectField.value = "";
	this.updateTabTitle();

	this._htmlEditor.resetSpellCheck();
	this._htmlEditor.clear();

	// the div that holds the attc.table and null out innerHTML
	this.cleanupAttachments(true);

	this._resetBodySize();

	this._msgAttId = null;
	this._clearFormValue();

	// reset dirty shields
	this._noSubjectOkay = this._badAddrsOkay = this._spellCheckOkay = false;

	Dwt.setVisible(this._oboRow, false);

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
	// disable input elements so they dont bleed into top zindex'd view
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		this._field[ZmMailMsg.COMPOSE_ADDRS[i]].disabled = !bEnable;
	}
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

ZmComposeView.prototype.getSignatureContentSpan =
function(signature, sigContent, account) {
	signature = signature || this.getSignatureById(this._controller.getSelectedSignature(), account);
	if (!signature) { return ""; }

	var signatureId = signature.id;
	sigContent = sigContent || this.getSignatureContent(signatureId);
	if (this.getHtmlEditor().getMode() == DwtHtmlEditor.HTML) {
		sigContent = ["<span id=\"", signatureId, "\">", sigContent, "</span>"].join('');
	}

	return sigContent;
};

/**
 * Called when the user selects something from the Signature menu.
 *
 * @param {String}	content				the content
 * @param {String}	replaceSignatureId	the signature id
 * @param {ZmZimbraAccount}	account				the account
 * 
 * @private
 */
ZmComposeView.prototype.applySignature =
function(content, replaceSignatureId, account) {
	content = content || "";
	var ac = window.parentAppCtxt || window.appCtxt;
	var acct = account || (appCtxt.multiAccounts && this.getFromAccount());
	var signature = this.getSignatureById(this._controller.getSelectedSignature(), acct);
	var isHtml = this.getHtmlEditor().getMode() == DwtHtmlEditor.HTML;
	var newLine = this._getSignatureNewLine();
	var isAbove = ac.get(ZmSetting.SIGNATURE_STYLE, null, acct) == ZmSetting.SIG_OUTLOOK;
	var done = false, donotsetcontent = false;
	var noSignature = !signature;

	var sigContent, replaceSignature;
	var newSig = signature ? this.getSignatureContent(signature.id) : "";

	if (replaceSignatureId) {
		if (isHtml) {
			var idoc = this.getHtmlEditor()._getIframeDoc();
			var sigEl = idoc.getElementById(replaceSignatureId);
			if (sigEl) {
				// find old sig via delimiters, so we preserve any user content that made it into sig span
				var oldSigContent = sigEl.innerHTML, newSigContent;
				var idx = oldSigContent.indexOf(ZmComposeView.SIG_KEY);
				var lastIdx = oldSigContent.lastIndexOf(ZmComposeView.SIG_KEY);
				if (idx == -1 || lastIdx == -1) {
					idx = oldSigContent.indexOf(ZmComposeView.SIG_KEY_LC);
					lastIdx = oldSigContent.lastIndexOf(ZmComposeView.SIG_KEY_LC);
				}
				if (idx != -1 && lastIdx != -1) {
					newSigContent = oldSigContent.substring(0, idx) + newSig +
									oldSigContent.substring(lastIdx + ZmComposeView.SIG_KEY.length);
				} else {
					newSigContent = newSig;
				}
				sigEl.innerHTML = newSigContent;

				if (signature) {
					sigEl.id = signature.id;
				} else {
					sigEl.removeAttribute("id");
				}
				done = true;
				donotsetcontent = true;
			}
		} else {
			//Construct Regex
			replaceSignature = this.getSignatureContent(replaceSignatureId);
			var replaceRe = "(" + AjxStringUtil.regExEscape(newLine) + ")*" + AjxStringUtil.regExEscape(replaceSignature);
			replaceRe = replaceRe.replace(/(\\n|\\r)/g, "\\s*");
			if (!isAbove) {
				replaceRe += "\\s*(" + AjxStringUtil.regExEscape(newLine) + ")*";
				replaceRe += "$";
			}

			replaceRe = new RegExp(replaceRe, "i");

			//Replace Signature
			content = content.replace(replaceRe, newSig);
			done = true;

		}
	}
	if (!done) {
		sigContent = this.getSignatureContentSpan(signature);
		content = this._insertSignature(content, ac.get(ZmSetting.SIGNATURE_STYLE, null, acct), sigContent, newLine);
	}

	if (!isHtml) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, function() { this.getHtmlEditor().moveCaretToTop(); }), 200);
	}

	if (!donotsetcontent) {
		this._htmlEditor.setContent(content);
	}
	this._fixMultipartRelatedImages_onTimer(this._msg, this.getHtmlEditor()._getIframeDoc());

	//Caching previous Signature state.
	this._previousSignature = signature;
	this._previousSignatureMode = this._htmlEditor.getMode();
};

ZmComposeView.prototype.getSignatureContent =
function(signatureId) {
	var sig = this._getSignature(signatureId);
	if (!sig) { return ""; }

	return this._getSignatureSeparator() + sig;
};

/**
 * Adds the user's signature to the message body. An "internet" style signature
 * is prefixed by a special line and added to the bottom. An "outlook" style
 * signature is added before quoted content.
 *
 * This method is only used to add an
 *
 * @content 			optional content to use
 * 
 * @private
 */
ZmComposeView.prototype.addSignature =
function(content) {
	// bug fix #6821 - we need to pass in "content" param
	// since HTML composing in new window doesnt guarantee the html editor
	// widget will be initialized when this code is running.
	content = content || "";
	var ac = window.parentAppCtxt || window.appCtxt;
	var sigContent = this.getSignatureContentSpan();
	var account = appCtxt.multiAccounts && this.getFromAccount();
	content = this._insertSignature(content, ac.get(ZmSetting.SIGNATURE_STYLE, null, account),
									sigContent,
									this._getSignatureNewLine());

	this._htmlEditor.setContent(content);

	this._previousSignature = sigContent;
	this._previousSignatureMode = this._htmlEditor.getMode();
};

ZmComposeView.prototype._insertSignature =
function(content, sigStyle, sig, newLine) {

	var re_newlines = "(" + AjxStringUtil.regExEscape(newLine) + ")*";
	// get rid of all trailing newlines
	var re = re_newlines;
	if (this.getHtmlEditor().getMode() == DwtHtmlEditor.HTML) {
		re += "</body></html>";
	}
	re += "$";
	re = new RegExp(re, "i");
	content = content.replace(re, '');

	var what = this._controller._curIncOptions.what;
	var hasQuotedContent = (what != ZmSetting.INC_ATTACH && what != ZmSetting.INC_NONE);

	if (sigStyle == ZmSetting.SIG_OUTLOOK && hasQuotedContent) {
		var preface = this._getPreface();
		var regexp = new RegExp(re_newlines + preface, "i");

		if (content.match(regexp)) {
			content = content.replace(regexp, [sig, newLine, preface].join(""));
		} else {
			// new message
			content = [content, sig].join("");
		}
	} else {
		content = [content, sig].join("");
	}

	return content;
};

ZmComposeView.prototype._dispose =
function() {
	if (this._identityChangeListenerObj) {
		var collection = appCtxt.getIdentityCollection();
		collection.removeChangeListener(this._identityChangeListenerObj);
	}
};

ZmComposeView.prototype.getSignatureById =
function(signatureId, account) {
	signatureId = signatureId || this._controller.getSelectedSignature();
	return appCtxt.getSignatureCollection(account).getById(signatureId);
};

// So we can delimit the actual sig content when switching sigs (bug 46871)
ZmComposeView.SIG_KEY = '<SPAN name="x"></SPAN>';
ZmComposeView.SIG_KEY_LC = ZmComposeView.SIG_KEY.toLowerCase();

ZmComposeView.prototype._getSignature =
function(signatureId) {
	var extraSignature = this._getExtraSignature();
	signatureId = signatureId || this._controller.getSelectedSignature();

	if (!signatureId && extraSignature == "") { return; }

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

	if (!signature && extraSignature == "") { return; }

	var sigString = "";
	if (signature) {
		var htmlMode = (this._composeMode == DwtHtmlEditor.HTML);
		var mode = htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
		var sig = signature.getValue(mode);
		var sig1 = htmlMode ? ZmComposeView.SIG_KEY + sig + ZmComposeView.SIG_KEY : sig;
		sigString = sig1 + this._getSignatureNewLine();
	}
	return (sigString + extraSignature);
};

/**
 * Returns "" or extra signature(like a quote or legal disclaimer) via zimlet
 */
ZmComposeView.prototype._getExtraSignature =
function() {
	var extraSignature = "";
	if (appCtxt.zimletsPresent()) {
		var buffer = [];
		appCtxt.notifyZimlets("appendExtraSignature", [buffer]);
		extraSignature = buffer.join(this._getSignatureNewLine());
		if (extraSignature != "") {
			extraSignature = this._getSignatureNewLine() + extraSignature;
		}
	}
	return extraSignature;
};

ZmComposeView.prototype._getSignatureSeparator =
function() {
	var ac = window.parentAppCtxt || window.appCtxt;
	var newLine = this._getSignatureNewLine();
	var sep = newLine + newLine;
	var account = appCtxt.multiAccounts && this.getFromAccount();
	if (ac.get(ZmSetting.SIGNATURE_STYLE, null, account) == ZmSetting.SIG_INTERNET) {
		sep += "-- " + newLine;
	}
	return sep;
};

ZmComposeView.prototype._getSignatureNewLine =
function() {
	return ((this._composeMode == DwtHtmlEditor.HTML) ? "<br>" : "\n");
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
	// reply/forward and empty body => not dirty
	if ((this._action != ZmOperation.NEW_MESSAGE) && (this._htmlEditor.getContent().match(ZmComposeView.EMPTY_FORM_RE))) {
		return false;
	}

	if (this._isDirty) { return true; }

	var curFormValue = this._formValue(incAddrs, incSubject);

	// empty subject and body => not dirty
	if (curFormValue.match(ZmComposeView.EMPTY_FORM_RE) ||
		(this._composeMode == DwtHtmlEditor.HTML &&
		 (curFormValue == "<html><body></body></html>" ||
		  curFormValue == "<html><body><br></body></html>" ||
		  curFormValue == '<html><body><br mce_bogus="1"></body></html>')))
	{
		return false;
	}

	if (this._composeMode == DwtHtmlEditor.HTML) {
		var lower = function(match) {
			return match.toLowerCase();
		};

		var origFormValue = AjxStringUtil.trim(this._origFormValue.replace(ZmComposeView.HTML_TAG_RE, lower)); // Make sure HTML tag names & parameters are lowercase for both values in the comparison
		curFormValue = AjxStringUtil.trim(curFormValue.replace(ZmComposeView.HTML_TAG_RE, lower)); // so that <SPAN> and <span> are still equal, but <span>FOO</span> and <span>foo</span> are not.

		return (curFormValue != origFormValue);
	}
	return (curFormValue != this._origFormValue);
};

ZmComposeView.prototype.cleanupAttachments =
function(all) {
	var attachDialog = this._attachDialog;
	if (attachDialog && attachDialog.isPoppedUp()) {
		attachDialog.popdown();
	}

	if (all) {
		this._attcDiv.innerHTML = "";
		this._attcDiv.style.height = "";
		this._attachCount = 0;
	}

	// make sure att IDs don't get reused
	if (this._msg) {
		this._msg.attId = null;
	}
};

ZmComposeView.prototype.sendMsgOboIsOK =
function() {
	return (Dwt.getVisible(this._oboRow)) ? this._oboCheckbox.checked : false;
};

ZmComposeView.prototype.updateTabTitle =
function() {
	var buttonText = this._subjectField.value
		? this._subjectField.value.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT)
		: ZmComposeController.DEFAULT_TAB_TEXT;
	appCtxt.getAppViewMgr().setTabTitle(this._controller.viewId, buttonText);
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

ZmComposeView.prototype._isInviteReply =
function(action) {
	action = action || this._action;
	return (action == ZmOperation.REPLY_ACCEPT ||
			action == ZmOperation.REPLY_CANCEL ||
			action == ZmOperation.REPLY_DECLINE ||
			action == ZmOperation.REPLY_TENTATIVE ||
			action == ZmOperation.REPLY_MODIFY ||
			action == ZmOperation.REPLY_NEW_TIME);
};

ZmComposeView.prototype._isReply =
function(action) {
	action = action || this._action;
	return (action == ZmOperation.REPLY ||
			action == ZmOperation.REPLY_ALL ||
			this._isInviteReply(action));
};

ZmComposeView.prototype._isForward =
function(action) {
	action = action || this._action;
	return (action == ZmOperation.FORWARD_INLINE ||
			action == ZmOperation.FORWARD_ATT);
};

/*
* Creates an address string from the given vector, excluding any that have
* already been used.
*
* @param addrVec	[AjxVector]		vector of AjxEmailAddress
* @param used		[Object]		hash of addresses that have been used
*/
ZmComposeView.prototype._getAddrString =
function(addrVec, used) {
	used = used || {};
	var a = addrVec.getArray();
	var addrs = [];
	for (var i = 0; i < a.length; i++) {
		var addr = a[i];
		var email = addr ? addr.getAddress() : null;
		if (!email) { continue; }
		email = email.toLowerCase();
		if (!used[email]) {
			addrs.push(addr);
		}
		used[email] = true;
	}
	return addrs.join(AjxEmailAddress.SEPARATOR); // calls implicit toString() on each addr object
};

// returns the text part given a body part (if body part is HTML, converts it to text)
ZmComposeView.prototype._getTextPart =
function(bodyPart, encodeSpace) {
	var text = "";
	// if the only content type returned is html, convert to text
	if (bodyPart.ct == ZmMimeTable.TEXT_HTML) {
		// create a temp iframe to create a proper DOM tree
		var params = {parent: this, hidden: true, html: bodyPart.content};
		var dwtIframe = new DwtIframe(params);
		if (dwtIframe) {
			text = AjxStringUtil.convertHtml2Text(dwtIframe.getDocument().body);
			delete dwtIframe;
		}
	} else {
		text = encodeSpace
			? AjxStringUtil.convertToHtml(bodyPart.content)
			: bodyPart.content;
	}

	return text;
};

// Consistent spot to locate various dialogs
ZmComposeView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmComposeView.DIALOG_X, loc.y + ZmComposeView.DIALOG_Y);
};

ZmComposeView.prototype._getForwardAttIds =
function(name) {
	var forAttIds = [];
	var forAttList = document.getElementsByName(name);

	// walk collection of input elements
	for (var i = 0; i < forAttList.length; i++) {
		if (forAttList[i].checked)
			forAttIds.push(forAttList[i].value);
	}

	return forAttIds;
};

ZmComposeView.prototype._acCompHandler =
function(text, el, match) {
	this._adjustAddrHeight(el);
};

ZmComposeView.prototype._acKeyupHandler =
function(ev, acListView, result) {
	var key = DwtKeyEvent.getCharCode(ev);
	// process any printable character or enter/backspace/delete keys
	if (result && AjxStringUtil.isPrintKey(key) ||
		key == 3 || key == 13 || key == 8 || key == 46 ||
		(AjxEnv.isMac && key == 224)) // bug fix #24670
	{
		this._adjustAddrHeight(DwtUiEvent.getTargetWithProp(ev, "id"));
	}
};

ZmComposeView.prototype._adjustAddrHeight =
function(textarea, skipResetBodySize) {
	if (textarea.value.length == 0) {
		textarea.style.height = "21px";

		if (AjxEnv.isIE) // for IE use overflow-y
			textarea.style.overflowY = "hidden";
		else
			textarea.style.overflow = "hidden";

		if (!skipResetBodySize)
			this._resetBodySize();

		return;
	}

	if (textarea.scrollHeight > textarea.clientHeight) {
		var taHeight = parseInt(textarea.style.height) || 0;
		if (taHeight <= 65) {
			var sh = textarea.scrollHeight;
			if (textarea.scrollHeight >= 65) {
				sh = 65;
				if (AjxEnv.isIE)
					textarea.style.overflowY = "scroll";
				else
					textarea.style.overflow = "auto";
			}
			textarea.style.height = sh + 13;
			this._resetBodySize();
		} else {
			if (AjxEnv.isIE) // for IE use overflow-y
				textarea.style.overflowY = "scroll";
			else
				textarea.style.overflow = "auto";

			textarea.scrollTop = textarea.scrollHeight;
		}
	}
};

/*
* Set various address headers based on the original message and the mode we're in.
* Make sure not to duplicate any addresses, even across fields.
*/
ZmComposeView.prototype._setAddresses =
function(action, type, override) {
	this._action = action;

	if (action == ZmOperation.NEW_MESSAGE && override) {
		this.setAddress(type, override);
	} else if (this._isReply(action)) {
		var ac = window.parentAppCtxt || window.appCtxt;

		// Prevent user's login name and aliases from going into To: or Cc:
		var used = {};
		var account = appCtxt.multiAccounts && this._msg.getAccount();
		var uname = ac.get(ZmSetting.USERNAME, null, account);
		if (uname) {
			used[uname.toLowerCase()] = true;
		}
		var aliases = ac.get(ZmSetting.MAIL_ALIASES, null, account);
		for (var i = 0, count = aliases.length; i < count; i++) {
			used[aliases[i].toLowerCase()] = true;
		}

		// Check for Canonical Address's
		var defaultIdentity = ac.getIdentityCollection(account).defaultIdentity;
		if (defaultIdentity && defaultIdentity.sendFromAddress) {
			// Note: sendFromAddress is same as appCtxt.get(ZmSetting.USERNAME)
			// if the account does not have any Canonical Address assigned.
			used[defaultIdentity.sendFromAddress.toLowerCase()] = true;
		}

		// When updating address lists, use this._addressesMsg instead of this._msg, because
		// this._msg changes after a draft is saved.
		if (!this._addressesMsg.isSent) {
			var addrVec = this._addressesMsg.getReplyAddresses(action, used);
			var addr = this._getAddrString(addrVec);
			if (action == ZmOperation.REPLY_ALL) {
				for (var i = 0, len = addrVec.size(); i < len; i++) {
					var a = addrVec.get(i).address;
					used[a] = true;
				}
			}
			this.setAddress(AjxEmailAddress.TO, addr);
		} else if (action == ZmOperation.REPLY) {
			var toAddrs = this._addressesMsg.getAddresses(AjxEmailAddress.TO);
			this.setAddress(AjxEmailAddress.TO, this._getAddrString(toAddrs));
		}

		// reply to all senders if reply all (includes To: and Cc:)
		if (action == ZmOperation.REPLY) {
			this.setAddress(AjxEmailAddress.CC, "");
		} else if (action == ZmOperation.REPLY_ALL) {
			var addrs = new AjxVector();
			addrs.addList(this._addressesMsg.getAddresses(AjxEmailAddress.CC));
			var toAddrs = this._addressesMsg.getAddresses(AjxEmailAddress.TO);
			if (this._addressesMsg.isSent) {
				// sent msg replicates To: and Cc: (minus duplicates)
				this.setAddress(AjxEmailAddress.TO, this._getAddrString(toAddrs, used));
			} else {
				addrs.addList(toAddrs);
			}
			this.setAddress(AjxEmailAddress.CC, this._getAddrString(addrs, used));
		}
	} else if (action == ZmOperation.DRAFT || action == ZmOperation.SHARE) {
		for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
			var addrs = this._msg.getAddresses(ZmMailMsg.COMPOSE_ADDRS[i]);
			this.setAddress(ZmMailMsg.COMPOSE_ADDRS[i], addrs.getArray().join(AjxEmailAddress.SEPARATOR));
		}
	}
};

ZmComposeView.prototype._setObo =
function(obo) {
	Dwt.setVisible(this._oboRow, true);
	this._oboCheckbox.checked = true;
	this._oboLabel.innerHTML = AjxMessageFormat.format(ZmMsg.sendObo, obo);
};

ZmComposeView.prototype._setSubject =
function(action, msg, subjOverride) {
	if ((action == ZmOperation.NEW_MESSAGE && subjOverride == null)) {
		return;
	}

	var subj = subjOverride || ( (msg) ? msg.subject : "" );

	if (action == ZmOperation.REPLY_CANCEL && !subj) {
		var inv = (msg) ? msg.invite : null;
		if (inv) {
			subj = inv.getName();
		}
	}

	if (action != ZmOperation.DRAFT && subj) {
		var regex = ZmComposeView.SUBJ_PREFIX_RE;
		while (regex.test(subj))
			subj = subj.replace(regex, "");
	}

	var prefix = "";
	switch (action) {
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
	this._subjectField.value = prefix + (subj || "");
	this.updateTabTitle();
};

ZmComposeView.prototype._setBody =
function(action, msg, extraBodyText) {

	var htmlMode = (this._composeMode == DwtHtmlEditor.HTML);

	var isDraft = (action == ZmOperation.DRAFT);
	if (msg && msg.isInvite() && this._isForward(action)) {
		action = this._action = ZmOperation.FORWARD_INLINE;
	}

	// get reply/forward prefs as necessary
	var incOptions = this._controller._curIncOptions;
	if (!incOptions) {
		if (this._isReply(action)) {
			incOptions = {what:		appCtxt.get(ZmSetting.REPLY_INCLUDE_WHAT),
						  prefix:	appCtxt.get(ZmSetting.REPLY_USE_PREFIX),
						  headers:	appCtxt.get(ZmSetting.REPLY_INCLUDE_HEADERS)};
		} else if (isDraft) {
			incOptions = {what:			ZmSetting.INC_BODY};
		} else if (action == ZmOperation.FORWARD_INLINE) {
			incOptions = {what:		ZmSetting.INC_BODY,
						  prefix:	appCtxt.get(ZmSetting.FORWARD_USE_PREFIX),
						  headers:	appCtxt.get(ZmSetting.FORWARD_INCLUDE_HEADERS)};
		} else if (action == ZmOperation.FORWARD_ATT) {
			incOptions = {what:		ZmSetting.INC_ATTACH};
		} else if (action == ZmOperation.NEW_MESSAGE) {
			incOptions = {what:		ZmSetting.INC_NONE};
		} else {
			incOptions = {};
		}
		this._controller._curIncOptions = incOptions;	// pointer, not a copy
	}
	if (incOptions.what == ZmSetting.INC_NONE || incOptions.what == ZmSetting.INC_ATTACH) {
		incOptions.prefix = incOptions.headers = false;
	}
	if (incOptions.what == ZmSetting.INC_ATTACH && !this._msg) {
		incOptions.what = ZmSetting.INC_NONE;
	}

	var crlf = htmlMode ? "<br>" : ZmMsg.CRLF;
	var crlf2 = htmlMode ? "<br><br>" : ZmMsg.CRLF2;

	var sigPre = "", body = "", headers = [], preface = "", value = "";

	var bodyInfo = {};
	var what = incOptions.what;
	if (what == ZmSetting.INC_BODY || what == ZmSetting.INC_SMART) {
		bodyInfo = this._getBodyContent(msg, htmlMode);
		body = bodyInfo.body;
		// Bug 7160: Strip off the ~*~*~*~ from invite replies.
		if (this._isInviteReply(action)) {
			body = body.replace(ZmItem.NOTES_SEPARATOR, "");
		}
	}

	var sigStyle, sig;
	var account = appCtxt.multiAccounts && this.getFromAccount();
	var ac = window.parentAppCtxt || window.appCtxt;
	if (ac.get(ZmSetting.SIGNATURES_ENABLED, null, account)) {
		sig = this.getSignatureContentSpan(null, null, account);
		sigStyle = sig && ac.get(ZmSetting.SIGNATURE_STYLE, null, account);
	}
	var sigPre = (sigStyle == ZmSetting.SIG_OUTLOOK) ? sig : "";
	extraBodyText = extraBodyText || "";
	var preText = extraBodyText + sigPre;
	if (sigPre) {
		preText += crlf;
	}

	if (incOptions.headers) {
		for (var i = 0; i < ZmComposeView.QUOTED_HDRS.length; i++) {
			var hdr = msg.getHeaderStr(ZmComposeView.QUOTED_HDRS[i], htmlMode);
			if (hdr) {
				headers.push(hdr);
			}
		}
	}

	if (action == ZmOperation.REPLY_CANCEL) {
		var cancelledParts = [crlf];
		var inv = msg && msg.invite;
		if (inv) {
			cancelledParts.push(ZmMsg.subjectLabel + " " + (msg.subject || inv.getName()) + crlf);
			cancelledParts.push(ZmMsg.organizer + ": " + inv.getOrganizerName() + crlf);
			var sd = msg._instanceDate || inv.getServerStartDate();
			cancelledParts.push(ZmMsg.time + ": " + sd + crlf);
			var loc = inv.getLocation();
			if (loc) {
				cancelledParts.push(ZmMsg.locationLabel + " " + loc + crlf);
			}
		}
		cancelledParts.push(crlf + ZmItem.NOTES_SEPARATOR);
		value += crlf + cancelledParts.join("");
	} else if (incOptions.what == ZmSetting.INC_NONE) {
		value = preText;
	} else if (incOptions.what == ZmSetting.INC_ATTACH) {
		value = preText;
		this._msgAttId = this._msg.id;
	} else {
		var preface = this._preface = this._getPreface();
		var divider = htmlMode ? preface : preface + crlf;
		var leadingSpace = preText ? "" : crlf2;
		var wrapParams = ZmHtmlEditor.getWrapParams(htmlMode, incOptions);
		wrapParams.preserveReturns = true;
		if (incOptions.what == ZmSetting.INC_BODY) {
			if (isDraft) {
				value = body;
			} else if (htmlMode) {
				var headerText = headers.length ? headers.join(crlf) + crlf2 : "";
				wrapParams.text = isDraft ? body : headerText + body;
				var bodyText = AjxStringUtil.wordWrap(wrapParams);
				value = leadingSpace + preText + divider + bodyText;
			} else {
				var headerText = "";
				if (headers.length) {
					var text = wrapParams.text = headers.join(crlf);
					wrapParams.len = 120; // headers tend to be longer
					headerText = incOptions.prefix ? AjxStringUtil.wordWrap(wrapParams) : text;
					headerText = headerText + crlf;
				}
				wrapParams.text = body;
				wrapParams.len = ZmHtmlEditor.WRAP_LENGTH;
				var bodyText = incOptions.prefix ? AjxStringUtil.wordWrap(wrapParams) : body;
				value = leadingSpace + preText + divider + headerText + bodyText;
			}
		} else if (incOptions.what == ZmSetting.INC_SMART) {
			var chunks = AjxStringUtil.getTopLevel(body);
			if (chunks.length) {
				body = chunks.join(crlf2);
			}
			if (htmlMode) {
				var headerText = headers.length ? headers.join(crlf) + crlf2 : "";
				wrapParams.text = isDraft ? body : headerText + body;
				var bodyText = AjxStringUtil.wordWrap(wrapParams);
				value = leadingSpace + preText + divider + bodyText;
			} else {
				var headerText = "";
				if (headers.length) {
					var text = wrapParams.text = headers.join(crlf);
					wrapParams.len = 120; // headers tend to be longer
					headerText = incOptions.prefix ? AjxStringUtil.wordWrap(wrapParams) : text;
					headerText = headerText + crlf;
				}
				wrapParams.text = body;
				wrapParams.len = ZmHtmlEditor.WRAP_LENGTH;
				var bodyText = incOptions.prefix ? AjxStringUtil.wordWrap(wrapParams) : body;
				value = leadingSpace + preText + divider + headerText + bodyText;
			}
		}
	}

	var isHtmlEditorInitd = this._htmlEditor.isHtmlModeInited();
	if (!isHtmlEditorInitd) {
		this._fixMultipartRelatedImages_onTimer(msg);
	}

	if (sigStyle == ZmSetting.SIG_INTERNET) {
		this.addSignature(value);
	} else {
		value = value || (htmlMode ? "<br>" : "");
		this._htmlEditor.setContent(value);
	}

	if (isHtmlEditorInitd) {
		this._fixMultipartRelatedImages_onTimer(msg);
	}

	var hasInlineImages = (bodyInfo && bodyInfo.hasInlineImages) || !appCtxt.get(ZmSetting.VIEW_AS_HTML);
	this._showForwardField(msg, action, incOptions, hasInlineImages, bodyInfo && bodyInfo.hasInlineAtts);
};

ZmComposeView.prototype._getBodyContent =
function(msg, htmlMode) {

	var body, bodyPart, hasInlineImages, hasInlineAtts;
	var crlf = htmlMode ? "<br>" : ZmMsg.CRLF;
	var crlf2 = htmlMode ? "<br><br>" : ZmMsg.CRLF2;

	// bug fix #7271 - if we have multiple body parts, append them all first
	var parts = msg.getBodyParts();
	if (parts && parts.length > 1) {
		var bodyArr = [];
		for (var k = 0; k < parts.length; k++) {
			var part = parts[k];
			// bug: 28741
			if (ZmMimeTable.isRenderableImage(part.ct)) {
				bodyArr.push([crlf, "[", part.ct, ":", (part.filename || "..."), "]", crlf].join(""));
				hasInlineImages = true;
			} else if (part.filename && part.cd == "inline") {   //Inline attachments
				var attInfo = ZmMimeTable.getInfo(part.ct);
				attInfo = attInfo ? attInfo.desc : part.ct;
				bodyArr.push([crlf, "[", attInfo, ":", (part.filename||"..."), "]", crlf].join(""));
				hasInlineAtts = true;
			} else if (part.ct == ZmMimeTable.TEXT_PLAIN) {
				bodyArr.push( htmlMode ? AjxStringUtil.convertToHtml(part.content) : part.content );
			} else if (part.ct == ZmMimeTable.TEXT_HTML) {
				if (htmlMode){
					bodyArr.push(part.content);
				} else {
					var div = document.createElement("div");
					div.innerHTML = part.content;
					bodyArr.push(AjxStringUtil.convertHtml2Text(div));
				}
			}
		}
		body = bodyArr.join(crlf);
	} else {
		if (htmlMode) {
			body = msg.getBodyPart(ZmMimeTable.TEXT_HTML);
			if (body) {
				body = AjxUtil.isString(body) ? body : body.content;
			} else {
				// if no html part exists, just grab the text
				bodyPart = msg.getBodyPart();
				body = bodyPart ? this._getTextPart(bodyPart, true) : null;
			}
		} else {
			hasInlineImages = msg.hasInlineImagesInMsgBody();
			// grab text part out of the body part
			bodyPart = msg.getBodyPart(ZmMimeTable.TEXT_PLAIN) || msg.getBodyPart(ZmMimeTable.TEXT_HTML, true);
			body = bodyPart ? this._getTextPart(bodyPart) : null;
		}
	}

	if (bodyPart && AjxUtil.isObject(bodyPart) && bodyPart.truncated) {
		body += crlf2 + ZmMsg.messageTruncated + crlf2;
	}

	return {body:body || "", bodyPart:bodyPart, hasInlineImages:hasInlineImages, hasInlineAtts:hasInlineAtts};
};

ZmComposeView.prototype._getPreface =
function(mode, action) {

	mode = mode || this._composeMode;
	action = action || this._action;
	var preface;
	if (mode == DwtHtmlEditor.HTML) {
		preface = '<hr id="zwchr">';
	} else {
		var msgText = (action == ZmOperation.FORWARD_INLINE) ? AjxMsg.forwardedMessage : AjxMsg.origMsg;
		preface = [ZmMsg.DASHES, " ", msgText, " ", ZmMsg.DASHES].join("");
	}
	return preface;
};

// if mode isn't given, assumes mode has already been switched internally
ZmComposeView.prototype._switchPreface =
function(mode) {

	mode = mode || this._composeMode;
	var htmlMode = (mode == DwtHtmlEditor.HTML);
	var otherMode = htmlMode ? DwtHtmlEditor.TEXT : DwtHtmlEditor.HTML;
	var curPreface = this._getPreface(otherMode);
	var newPreface = this._getPreface(mode);
	if (!htmlMode) {
		newPreface = newPreface + "<br>";	// so that text preface is followed by a return after conversion
		this._switchedToText = true;
	} else if (this._switchedToText) {
		curPreface = new RegExp(curPreface + "\\s*<br>");
	}
	var content = this.getHtmlEditor().getContent();
	content = content.replace(curPreface, newPreface);
	this._htmlEditor.setContent(content);
	this._preface = newPreface;
};

ZmComposeView.prototype.resetBody =
function(action, msg, extraBodyText, incOptions) {
	this.cleanupAttachments(true);
	this._isDirty = this._isDirty || this.isDirty();
	this._setBody(action, msg, extraBodyText, incOptions);
	this._setFormValue();
	this._resetBodySize();
};

// Generic routine for attaching an event handler to a field. Since "this" for the handlers is
// the incoming event, we need a way to get at ZmComposeView, so it's added to the event target.
ZmComposeView.prototype._setEventHandler =
function(id, event, addrType) {
	var field = document.getElementById(id);
	field._composeView = this._internalId;
	if (addrType) {
		field._addrType = addrType;
	}
	var lcEvent = event.toLowerCase();
	field[lcEvent] = ZmComposeView["_" + event];
};

ZmComposeView.prototype._setBodyFieldCursor =
function(extraBodyText) {
	if (this._composeMode == DwtHtmlEditor.HTML) { return; }

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

ZmComposeView.prototype.isTinyMCEEnabled =
function() {
    return window.isTinyMCE;
};

/**
 * This should be called only once for when compose view loads first time around
 * 
 * @private
 */
ZmComposeView.prototype._initialize =
function(composeMode) {
	// init address field objects
	this._divId = {};
	this._buttonTdId = {};
	this._fieldId = {};
	this._using = {};
	this._button = {};
	this._field = {};
	this._divEl = {};
	this._internalId = AjxCore.assignId(this);

	// init html
	this._createHtml();

	// init compose view w/ based on user prefs
	var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	var defaultCompMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	this._composeMode = composeMode || defaultCompMode;
	this._clearFormValue();

	// init html editor
	if (this.isTinyMCEEnabled()) {
		this._htmlEditor = new ZmAdvancedHtmlEditor(this, DwtControl.RELATIVE_STYLE, null, this._composeMode);
		this._bodyFieldId = this._htmlEditor.getBodyFieldId();
		this._bodyField = document.getElementById(this._bodyFieldId);
	} else {
		this._htmlEditor = new ZmHtmlEditor(this, DwtControl.RELATIVE_STYLE, null, this._composeMode);
		this._bodyFieldId = this._htmlEditor.getBodyFieldId();
		this._bodyField = document.getElementById(this._bodyFieldId);
	}
	this._includedPreface = "";

	// misc. inits
	this.setScrollStyle(DwtControl.SCROLL);
	this._attachCount = 0;

	// init listeners
	this.addControlListener(new AjxListener(this, this._controlListener));
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
		ccRowId:			ZmId.getViewId(this._view, ZmId.CMP_CC_ROW),
		ccPickerId:			ZmId.getViewId(this._view, ZmId.CMP_CC_PICKER),
		ccInputId:			ZmId.getViewId(this._view, ZmId.CMP_CC_INPUT),
		bccRowId:			ZmId.getViewId(this._view, ZmId.CMP_BCC_ROW),
		bccPickerId:		ZmId.getViewId(this._view, ZmId.CMP_BCC_PICKER),
		bccInputId:			ZmId.getViewId(this._view, ZmId.CMP_BCC_INPUT),
		bccToggleId:		ZmId.getViewId(this._view, ZmId.CMP_BCC_TOGGLE),
		subjectRowId:		ZmId.getViewId(this._view, ZmId.CMP_SUBJECT_ROW),
		subjectInputId:		ZmId.getViewId(this._view, ZmId.CMP_SUBJECT_INPUT),
		oboRowId:			ZmId.getViewId(this._view, ZmId.CMP_OBO_ROW),
		oboCheckboxId:		ZmId.getViewId(this._view, ZmId.CMP_OBO_CHECKBOX),
		oboLabelId:			ZmId.getViewId(this._view, ZmId.CMP_OBO_LABEL),
		identityRowId:		ZmId.getViewId(this._view, ZmId.CMP_IDENTITY_ROW),
		identitySelectId:	ZmId.getViewId(this._view, ZmId.CMP_IDENTITY_SELECT),
		priorityId:			ZmId.getViewId(this._view, ZmId.CMP_PRIORITY),
		attRowId:			ZmId.getViewId(this._view, ZmId.CMP_ATT_ROW),
		attDivId:			ZmId.getViewId(this._view, ZmId.CMP_ATT_DIV),
		zdndToolTipId:		ZmId.getViewId(this._view, ZmId.CMP_DND_TOOLTIP)
	};

	this._createHtmlFromTemplate(templateId || this.TEMPLATE, data);
};

ZmComposeView.prototype._createHtmlFromTemplate =
function(templateId, data) {
	DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId, data);

	// global identifiers
	this._identityDivId = data.identityRowId;

	// init autocomplete list
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			parent: appCtxt.getShell(),
			dataClass: appCtxt.getAutocompleter(),
			matchValue: ZmAutocomplete.AC_VALUE_FULL,
			compCallback: (new AjxCallback(this, this._acCompHandler)),
			keyUpCallback: (new AjxCallback(this, this._acKeyupHandler))
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}

	var isPickerEnabled = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) ||
						   appCtxt.get(ZmSetting.GAL_ENABLED) ||
						   appCtxt.multiAccounts);
	this._pickerButton = {};

	// process compose fields
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		var typeStr = AjxEmailAddress.TYPE_STRING[type];

		// save identifiers
		this._divId[type] = [data.id, typeStr, "row"].join("_");
		this._buttonTdId[type] = [data.id, typeStr, "picker"].join("_");
		this._fieldId[type] = [data.id, typeStr, "control"].join("_");
		// save field elements
		this._divEl[type] = document.getElementById(this._divId[type]);

		// save field control
		this._field[type] = document.getElementById(this._fieldId[type]);
		if (this._field[type]) {
			this._field[type].addrType = type;
			this._setEventHandler(this._fieldId[type], "onFocus");
		}

		// create picker
		if (isPickerEnabled) {
			var pickerId = this._buttonTdId[type];
			var pickerEl = document.getElementById(pickerId);
			if (pickerEl) {
				var buttonId = ZmId.getButtonId(this._view, ZmComposeView.OP[type]);
				var button = this._pickerButton[type] = new DwtButton({parent:this, id:buttonId});
				button.setText(pickerEl.innerHTML);
				button.replaceElement(pickerEl);

				button.addSelectionListener(new AjxListener(this, this._addressButtonListener));
				button.addrType = type;

				// autocomplete-related handlers
				if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
					this._acAddrSelectList.handle(this._field[type]);
				} else {
					this._setEventHandler(this._fieldId[type], "onKeyUp");
				}

				this._button[type] = button;
			}
		}
	}

	// save reference to DOM objects per ID's
	this._headerEl = document.getElementById(data.headerId);
	this._subjectField = document.getElementById(data.subjectInputId);
	this._oboRow = document.getElementById(data.oboRowId);
	this._oboCheckbox = document.getElementById(data.oboCheckboxId);
	this._oboLabel = document.getElementById(data.oboLabelId);
	this._attcDiv = document.getElementById(data.attDivId);

	this._setEventHandler(data.subjectInputId, "onKeyUp");
	this._setEventHandler(data.subjectInputId, "onBlur");
	this._setEventHandler(data.subjectInputId, "onFocus");

	if (appCtxt.multiAccounts) {
		if (!this._fromSelect) {
			this._fromSelect = new DwtSelect({parent:this, parentElement:data.fromSelectId});
			this._fromSelect.addChangeListener(new AjxListener(this, this._handleFromListener));
		}
	} else {
		// initialize identity select
		var identityOptions = this._getIdentityOptions();
		this.identitySelect = new DwtSelect({parent:this, options:identityOptions});
		this.identitySelect.setToolTipContent(ZmMsg.chooseIdentity);

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

	if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
		var buttonId = ZmId.getButtonId(this._view, ZmId.CMP_PRIORITY);
		this._priorityButton = new DwtButton({parent:this, id:buttonId});
		this._priorityButton.setMenu(new AjxCallback(this, this._priorityButtonMenuCallback));
		this._priorityButton.reparentHtmlElement(data.priorityId);
		this._priorityButton.setToolTipContent(ZmMsg.setPriority);
	}

	// Toggle BCC
	this._toggleBccEl = document.getElementById(data.bccToggleId);
	if (this._toggleBccEl) {
		Dwt.setHandler(this._toggleBccEl, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._toggleBccField, this));
	}
};

ZmComposeView.prototype._handleFromListener =
function(ev) {
	var newVal = ev._args.newValue;
	var oldVal = ev._args.oldValue;
	if (oldVal == newVal) { return; }

	var ac = window.parentAppCtxt || window.appCtxt;
	var newOption = this._fromSelect.getOptionWithValue(newVal);
	var newAccount = ac.accountList.getAccount(newOption.accountId);
	var collection = ac.getIdentityCollection(newAccount);
	var identity = collection && collection.getById(newVal);
	var sigId = identity ? identity.signature : collection.defaultIdentity;

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

		this._msg = this._addressesMsg = null;
		var callback = new AjxCallback(this, this._handleMoveDraft, [oldAccount.name, msgId]);
		this._controller.saveDraft(this._controller._draftType, null, null, callback);
	}

	this._resetPickerButtons(newAccount);
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

ZmComposeView.prototype._toggleBccField =
function(ev, force) {
	var isBccFieldVisible = Dwt.getVisible(this._divEl[AjxEmailAddress.BCC]);
	if (typeof force != "undefined") {
		isBccFieldVisible = !force;
	}
	this._showAddressField(AjxEmailAddress.BCC, !isBccFieldVisible);
};

ZmComposeView.prototype._createPriorityMenuItem =
function(menu, text, flag) {
	var item = DwtMenuItem.create({parent:menu, imageInfo:this._getPriorityImage(flag), text:text});
	item._priorityFlag = flag;
	item.addSelectionListener(this._priorityMenuListnerObj);
};

ZmComposeView.prototype._priorityButtonMenuCallback =
function() {
	var menu = new DwtMenu({parent:this._priorityButton});
	this._priorityMenuListnerObj = new AjxListener(this, this._priorityMenuListner);
	this._createPriorityMenuItem(menu, ZmMsg.high, ZmItem.FLAG_HIGH_PRIORITY);
	this._createPriorityMenuItem(menu, ZmMsg.normal, "");
	this._createPriorityMenuItem(menu, ZmMsg.low, ZmItem.FLAG_LOW_PRIORITY);
	return menu;
};

ZmComposeView.prototype._getPriorityImage =
function(flag) {
	if (flag == ZmItem.FLAG_HIGH_PRIORITY)	{ return "PriorityHigh"; }
	if (flag == ZmItem.FLAG_LOW_PRIORITY)	{ return "PriorityLow"; }
	return "PriorityNormal";
};

ZmComposeView.prototype._priorityMenuListner =
function(ev) {
	this._setPriority(ev.dwtObj._priorityFlag);
};

ZmComposeView.prototype._getPriority =
function() {
	return (this._priorityButton)
		? (this._priorityButton._priorityFlag || "") : "";
};

ZmComposeView.prototype._setPriority =
function(flag) {
	if (this._priorityButton) {
		flag = flag || "";
		this._priorityButton.setImage(this._getPriorityImage(flag));
		this._priorityButton._priorityFlag = flag;
	}
};

ZmComposeView.prototype._getIdentityOptions =
function() {
	var options = [];
	var identityCollection = appCtxt.getIdentityCollection();
	var identities = identityCollection.getIdentities();
	for (var i = 0, count = identities.length; i < count; i++) {
		var identity = identities[i];
		options.push(new DwtSelectOptionData(identity.id, this._getIdentityText(identity)));
	}
	return options;
};

ZmComposeView.prototype._getIdentityText =
function(identity, account) {
	var name = identity.name;
	if (identity.isDefault && name == ZmIdentity.DEFAULT_NAME) {
		name = account ? account.getDisplayName() : ZmMsg.accountDefault;
	}

	// default replacement parameters
	var defaultIdentity = appCtxt.getIdentityCollection().defaultIdentity;
	var params = [
		name,
		(identity.sendFromDisplay || ''),
		identity.sendFromAddress,
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
		params[1] = ds.userName || '';
		params[2] = ds.getEmail();
		var provider = ZmDataSource.getProviderForAccount(ds);
		pattern = (provider && ZmMsg["identityText-"+provider.id]) || ZmMsg.identityTextExternal;
	}
	else {
		pattern = ZmMsg.identityTextPersona;
	}

	// format text
	return AjxMessageFormat.format(pattern, params);
};

ZmComposeView.prototype._identityChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE) {
		this._setIdentityVisible();
		var identity = ev.getDetail("item");
		var text = this._getIdentityText(identity);
		var option = new DwtSelectOptionData(identity.id, text);
		if (this.identitySelect) {
			this.identitySelect.addOption(option);
		}
	} else if (ev.event == ZmEvent.E_DELETE) {
		// DwtSelect doesn't support removing an option, so recreate the whole thing.
		if (this.identitySelect) {
			this.identitySelect.clearOptions();
			var options = this._getIdentityOptions();
			for (var i = 0, count = options.length; i < count; i++)	 {
				this.identitySelect.addOption(options[i]);
			}
			this._setIdentityVisible();
		}
	} else if (ev.event == ZmEvent.E_MODIFY) {
		if (this.identitySelect) {
			var identity = ev.getDetail("item");
			var text = this._getIdentityText(identity);
			this.identitySelect.rename(identity.id, text);
		}
	}
};

ZmComposeView.prototype._setIdentityVisible =
function() {
	if (!appCtxt.get(ZmSetting.IDENTITIES_ENABLED)) return;

	var div = document.getElementById(this._identityDivId);
	if (!div) return;

	var visible = appCtxt.getIdentityCollection().getSize() > 1;
	Dwt.setVisible(div, visible);
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
		return identity ? identity : collection.defaultIdentity;
	}
};

ZmComposeView.prototype._showForwardField =
function(msg, action, incOptions, includeInlineImages, includeInlineAtts) {

	var html = "";
	if (!(this._msgIds && this._msgIds.length) &&
		((incOptions && incOptions.what == ZmSetting.INC_ATTACH) || action == ZmOperation.FORWARD_ATT))
	{
		html = AjxTemplate.expand("mail.Message#ForwardOneMessage", {message:msg});
		this._attachCount = 1;
	}
	else if (msg && (msg.hasAttach || includeInlineImages || includeInlineAtts))
	{
		var attLinks = msg.getAttachmentLinks(false, includeInlineImages, includeInlineAtts);
		if (attLinks.length > 0) {
			var data = {
				attachments: attLinks,
				isNew: action == ZmOperation.NEW_MESSAGE,
				isForward: action == ZmOperation.FORWARD,
				isForwardInline: action == ZmOperation.FORWARD_INLINE,
				isDraft: action == ZmOperation.DRAFT,
				fwdFieldName:(ZmComposeView.FORWARD_ATT_NAME+this._sessionId)
			};
			html = AjxTemplate.expand("mail.Message#ForwardAttachments", data);

			if (attLinks.length >= ZmComposeView.SHOW_MAX_ATTACHMENTS) {
				this._attcDiv.style.height = ZmComposeView.MAX_ATTACHMENT_HEIGHT;
				this._attcDiv.style.overflow = "auto";
			}
			this._attachCount = attLinks.length;
		}
	} else if (this._msgIds && this._msgIds.length) {
		// use main window's appCtxt
		var appCtxt = window.parentAppCtxt || window.appCtxt;
		var messages = [];
		for (var i = 0; i < this._msgIds.length; i++) {
			var message = appCtxt.cacheGet(this._msgIds[i]);
			if (!message) continue;
			messages.push(message);
		}
		var data = {
			messages: messages,
			fwdFieldName: (ZmComposeView.FORWARD_MSG_NAME+this._sessionId)
		};
		html = AjxTemplate.expand("mail.Message#ForwardMessages", data);
		if (messages.length >= ZmComposeView.SHOW_MAX_ATTACHMENTS) {
			this._attcDiv.style.height = ZmComposeView.MAX_ATTACHMENT_HEIGHT;
			this._attcDiv.style.overflow = "auto";
		}
		this._attachCount = messages.length;
	}

	this._attcDiv.innerHTML = html;
};

// Miscellaneous methods
ZmComposeView.prototype._resetBodySize =
function() {
	var size = this.getSize();
	if (size.x <= 0 || size.y <= 0)
		return;

	var height = size.y - Dwt.getSize(this._headerEl).y;
	if (height != size.y) {
		this._htmlEditor.setSize(size.x, height);
	}
};

ZmComposeView.prototype._resetPickerButtons =
function(account) {
	var ac = window.parentAppCtxt || window.appCtxt;
	var isEnabled = ac.get(ZmSetting.CONTACTS_ENABLED, null, account) ||
					ac.get(ZmSetting.GAL_ENABLED, null, account);

	for (var i in this._pickerButton) {
		var button = this._pickerButton[i];
		button.setEnabled(isEnabled);
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

	this._fromSelect.setSelectedValue(selectedIdentity.id);

	// for cross account searches, the active account isn't necessarily the
	// account of the selected conv/msg so reset it based on the selected option.
	if (appCtxt.getSearchController().searchAllAccounts && this._fromSelect) {
		active = this.getFromAccount();
		this._controller._accountName = active.name;
	}

	if (this._acAddrSelectList) {
		this._acAddrSelectList.setActiveAccount(active);
	}

	this._resetPickerButtons(active);
};

// Show address field
ZmComposeView.prototype._showAddressField =
function(type, show, skipNotify, skipFocus) {
	this._using[type] = show;
	Dwt.setVisible(this._divEl[type], show);
	this._field[type].value = ""; // bug fix #750 and #3680
	this._field[type].noTab = !show;
	var setting = ZmComposeView.ADDR_SETTING[type];
	if (setting) {
		appCtxt.set(setting, show, null, false, skipNotify);
	}
	if (type == AjxEmailAddress.BCC) {
		Dwt.setInnerHtml(this._toggleBccEl, show ? ZmMsg.hideBCC : ZmMsg.showBCC );
	}
	this._resetBodySize();
};

// Grab the addresses out of the form. Optionally, they can be returned broken
// out into good and bad addresses, with an aggregate list of the bad ones also
// returned. If the field is hidden, its contents are ignored.
ZmComposeView.prototype._collectAddrs =
function() {
	var addrs = {};
	addrs[ZmComposeView.BAD] = new AjxVector();
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (!this._using[type]) continue;
		var val = AjxStringUtil.trim(this._field[type].value);
		if (val.length == 0) continue;
		var result = AjxEmailAddress.parseEmailString(val, type, false);
		if (result.all.size() == 0) continue;
		addrs.gotAddress = true;
		addrs[type] = result;
		if (result.bad.size()) {
			addrs[ZmComposeView.BAD].addList(result.bad);
			if (!addrs.badType)
				addrs.badType = type;
		}
	}
	return addrs;
};

// Returns a string representing the form content
ZmComposeView.prototype._formValue =
function(incAddrs, incSubject) {
	var vals = [];
	if (incAddrs) {
		for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
			var type = ZmMailMsg.COMPOSE_ADDRS[i];
			if (this._using[type])
				vals.push(this._field[type].value);
		}
	}
	if (incSubject) {
		vals.push(this._subjectField.value);
	}
	vals.push(this._htmlEditor.getContent());
	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

// Listeners

// Address buttons invoke contact picker
ZmComposeView.prototype._addressButtonListener =
function(ev, addrType) {
	var obj = ev ? DwtControl.getTargetControl(ev) : null;
	this.enableInputs(false);

	if (!this._contactPicker) {
		AjxDispatcher.require("ContactsCore");
		var buttonInfo = [
			{ id: AjxEmailAddress.TO,	label: ZmMsg[AjxEmailAddress.TYPE_STRING[AjxEmailAddress.TO]] },
			{ id: AjxEmailAddress.CC,	label: ZmMsg[AjxEmailAddress.TYPE_STRING[AjxEmailAddress.CC]] },
			{ id: AjxEmailAddress.BCC,	label: ZmMsg[AjxEmailAddress.TYPE_STRING[AjxEmailAddress.BCC]] }
		];
		this._contactPicker = new ZmContactPicker(buttonInfo);
		this._contactPicker.registerCallback(DwtDialog.OK_BUTTON, this._contactPickerOkCallback, this);
		this._contactPicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._contactPickerCancelCallback, this);
	}

	var curType = obj ? obj.addrType : addrType;
	var a = {};
	var addrs = this._collectAddrs();
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (addrs[type]) {
			a[type] = addrs[type].good.getArray();
		}
	}
	this._contactPicker.addPopdownListener(this._controller._dialogPopdownListener);
	var str = (this._field[curType].value && !(a[curType] && a[curType].length))
		? this._field[curType].value : "";

	var account;
	if (appCtxt.multiAccounts && this._fromSelect) {
		var addr = this._fromSelect.getSelectedOption().addr;
		account = appCtxt.accountList.getAccountByEmail(addr.address);
	}
	this._contactPicker.popup(curType, a, str, account);
};

ZmComposeView.prototype._controlListener =
function() {
	this._resetBodySize();
};


// Callbacks

// Transfers addresses from the contact picker to the compose view.
ZmComposeView.prototype._contactPickerOkCallback =
function(addrs) {
	this.enableInputs(true);
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		var vec = addrs[type];
		var addr = (vec.size() > 0) ? vec.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR : "";
		this.setAddress(ZmMailMsg.COMPOSE_ADDRS[i], addr);
	}
	this._contactPicker.removePopdownListener(this._controller._dialogPopdownListener);
	this._contactPicker.popdown();
	this.reEnableDesignMode();
};

ZmComposeView.prototype._contactPickerCancelCallback =
function() {
	this.enableInputs(true);
	this.reEnableDesignMode();
};

// this callback is triggered when an event occurs inside the html editor (when in HTML mode)
// it is used to set focus to the To: field when user hits the TAB key
ZmComposeView.prototype._htmlEditorEventCallback =
function(args) {
	var rv = true;
	if (args.type == "keydown") {
		var key = DwtKeyEvent.getCharCode(args);
		if (key == DwtKeyEvent.KEY_TAB) {
			var toField = document.getElementById(this._fieldId[AjxEmailAddress.TO]);
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
	if (this._using[type]) {
		appCtxt.getKeyboardMgr().grabFocus(this._field[type]);
	}
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

// Files have been uploaded, re-initiate the send with an attachment ID.
ZmComposeView.prototype._attsDoneCallback =
function(isDraft, status, attId, docIds) {
	DBG.println(AjxDebug.DBG1, "Attachments: isDraft = " + isDraft + ", status = " + status + ", attId = " + attId);
	if (status == AjxPost.SC_OK) {
		this._controller.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, attId, docIds);
	} else if (status == AjxPost.SC_UNAUTHORIZED) {
		// auth failed during att upload - let user relogin, continue with compose action
		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
		var callback = new AjxCallback(this._controller, isDraft ? this._controller.saveDraft : this._controller._send);
		this._controller._handleException(ex, {continueCallback:callback});
	} else {
		// bug fix #2131 - handle errors during attachment upload.
		var msg = AjxMessageFormat.format(ZmMsg.errorAttachment, (status || AjxPost.SC_NO_CONTENT));
		switch (status) {
			// add other error codes/message here as necessary
			case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE: 	msg += " " + ZmMsg.errorAttachmentTooBig + "<br><br>"; break;
			default: 									msg += " "; break;
		}

		this._controller.popupErrorDialog(msg + ZmMsg.errorTryAgain, null, null, true);
		this._controller.resetToolbarOperations();
	}
};


//Mandatory Spellcheck Callback
ZmComposeView.prototype._spellCheckShield =
function(words){
	if (words && words.available && words.misspelled != null && words.misspelled.length != 0) {
		var msgDialog = appCtxt.getYesNoMsgDialog();
		msgDialog.setMessage(AjxMessageFormat.format(ZmMsg.misspellingsMessage, [words.misspelled.length]));
		msgDialog.registerCallback(DwtDialog.YES_BUTTON, this._spellCheckShieldOkListener, this, [ msgDialog, words ] );
		msgDialog.registerCallback(DwtDialog.NO_BUTTON, this._spellCheckShieldCancelListener, this, msgDialog);
		msgDialog.associateEnterWithButton(DwtDialog.NO_BUTTON);
		var composeView = this;
		msgDialog.handleKeyAction = function(actionCode, ev) { if (actionCode && actionCode==DwtKeyMap.CANCEL) { composeView._spellCheckShieldOkListener(msgDialog, words, ev); return(true); } };
		msgDialog.popup(null, DwtDialog.NO_BUTTON);
	} else {
		this._spellCheckOkay = true;
		this._controller.sendMsg();
	}
};

ZmComposeView.prototype._spellCheckShieldOkListener =
function(msgDialog, words, ev){

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
function(msgDialog, ev){
	this._spellCheckOkay = true;
	msgDialog.popdown();
	this._controller.sendMsg();
};

ZmComposeView.prototype._spellCheckErrorShield =
function(ex){
	var msgDialog = appCtxt.getYesNoMsgDialog();
	msgDialog.setMessage(ZmMsg.spellCheckFailed);
	msgDialog.registerCallback(DwtDialog.YES_BUTTON, this._spellCheckErrorShieldOkListener, this, msgDialog );
	msgDialog.registerCallback(DwtDialog.NO_BUTTON, this._spellCheckErrorShieldCancelListener, this, msgDialog);
	msgDialog.associateEnterWithButton(DwtDialog.NO_BUTTON);
	msgDialog.popup(null, DwtDialog.NO_BUTTON);

	return true;
};

ZmComposeView.prototype._spellCheckErrorShieldOkListener =
function(msgDialog, ev){

	this._controller._toolbar.enableAll(true);
	this._controller.toggleSpellCheckButton(false);
	this._htmlEditor.discardMisspelledWords();
	msgDialog.popdown();

	this._spellCheckOkay = true;
	this._controller.sendMsg();
	
};

ZmComposeView.prototype._spellCheckErrorShieldCancelListener =
function(msgDialog, ev){
	this._controller._toolbar.enableAll(true);
	this._controller.toggleSpellCheckButton(false);
	this._htmlEditor.discardMisspelledWords();
	msgDialog.popdown();
};

ZmComposeView.prototype._setFormValue =
function() {
	this._origFormValue = this._formValue();
};

ZmComposeView.prototype._clearFormValue =
function() {
	this._origFormValue = "";
	this._isDirty = false;
};

ZmComposeView.prototype._focusHtmlEditor =
function() {
	this._htmlEditor.focus();
};


// Static methods

ZmComposeView._onKeyUp =
function(ev) {

	ev = DwtUiEvent.getEvent(ev);
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) { return true; }
	var cv = AjxCore.objectWithId(element._composeView);

	if (element == cv._subjectField) {
		var key = DwtKeyEvent.getCharCode(ev);
		if (key == 3 || key == 13) {
			cv._focusHtmlEditor();
		}
	} else {
		cv._adjustAddrHeight(element);
	}
	return true;
};

// set focus within tab group to element so tabbing works
ZmComposeView._onFocus =
function(ev) {

	ev = DwtUiEvent.getEvent(ev);
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) { return true; }

	var kbMgr = appCtxt.getKeyboardMgr();
	if (kbMgr.__currTabGroup) {
		kbMgr.__currTabGroup.setFocusMember(element);
	}
};

ZmComposeView._onBlur =
function(ev) {

	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) { return true; }
	var cv = AjxCore.objectWithId(element._composeView);

	cv.updateTabTitle();

	return true;
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
