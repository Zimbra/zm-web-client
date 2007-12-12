/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
 * Creates a new compose view. The view does not display itself on construction.
 * @constructor
 * @class        
 * This class provides a form for composing a message.
 *
 * @author Conrad Damon
 * @param parent		[DwtControl]		the element that created this view
 * @param controller	[ZmController]		controller managing this view
 * @param composeMode 	[constant]			passed in so detached window knows which mode to be in on startup
 */
ZmComposeView = function(parent, controller, composeMode) {

	DwtComposite.call(this, parent, "ZmComposeView", Dwt.ABSOLUTE_STYLE);

	ZmComposeView.ADDR_SETTING[AjxEmailAddress.BCC]	= ZmSetting.SHOW_BCC;

	this._onMsgDataChange = new AjxCallback(this, this._onMsgDataChange);

	this._controller = controller;
	this._contactPickerEnabled = appCtxt.get(ZmSetting.CONTACTS_ENABLED) ||
								 appCtxt.get(ZmSetting.GAL_ENABLED);
	this._initialize(composeMode);

	// make sure no unnecessary scrollbars show up
	this.getHtmlElement().style.overflow = "hidden";
};

ZmComposeView.prototype = new DwtComposite;
ZmComposeView.prototype.constructor = ZmComposeView;

ZmComposeView.prototype.toString = function() {
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

ZmComposeView.BAD					= "_bad_addrs_";

// Message dialog placement
ZmComposeView.DIALOG_X 				= 50;
ZmComposeView.DIALOG_Y 				= 100;

// Attachment related
ZmComposeView.UPLOAD_FIELD_NAME		= "attUpload";
ZmComposeView.FORWARD_ATT_NAME		= "ZmComposeView_forAttName";
ZmComposeView.FORWARD_MSG_NAME		= "ZmComposeView_forMsgName";

// max # of attachments to show
ZmComposeView.SHOW_MAX_ATTACHMENTS	= AjxEnv.is800x600orLower ? 2 : 3;
ZmComposeView.MAX_ATTACHMENT_HEIGHT = (ZmComposeView.SHOW_MAX_ATTACHMENTS * 23) + "px";

// Reply/forward stuff
ZmComposeView.EMPTY_FORM_RE			= /^[\s\|]*$/;
ZmComposeView.SUBJ_PREFIX_RE		= new RegExp("^\\s*(" + ZmMsg.re + "|" + ZmMsg.fwd + "|" + ZmMsg.fw + "):" + "\\s*", "i");
ZmComposeView.QUOTED_CONTENT_RE		= new RegExp("^----- ", "m");
ZmComposeView.HTML_QUOTED_CONTENT_RE= new RegExp("<br>----- ", "i");
ZmComposeView.REFANG_RE				= new RegExp("(<img[^>]*)dfsrc\s*=([^>]*>)", "ig");
ZmComposeView.REFANG_RE_REPLACE		= "$1src=$2";
ZmComposeView.ADDR_SETTING			= {}; // XXX: may not be necessary anymore?
ZmComposeView.WRAP_LENGTH			= 72;

//
// Data
//

ZmComposeView.prototype.TEMPLATE = "mail.Message#Compose";

//
// Public methods
//

/**
* Sets the current view, based on the given action. The compose form is
* created and laid out and everything is set up for interaction with the user.
*
* @param action			[constant]		new message, reply, forward, or an invite action
* @param identity		[ZmIdentity]	the identity sending the message
* @param msg			[ZmMailMsg]*	the original message (reply/forward), or address (new message)
* @param toOverride 	[string]*		initial value for To: field
* @param subjOverride 	[string]*		initial value for Subject: field
* @param extraBodyText 	[string]*		canned text to prepend to body (invites)
*/
ZmComposeView.prototype.set =
function(params) {
	var action = this._action = params.action;
	if (this._msg) {
		this._msg.onChange = null;
	}
	var msg = this._msg = this._addressesMsg = params.msg;
	if (msg) {
		msg.onChange = this._onMsgDataChange;
	}
	if (params.identity) {
		this._identitySelect.setSelectedValue(params.identity.id);
		if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED)) {
			this._controller.setSelectedSignature(params.identity.signature || "");
		}
	}

	// list of msg Id's to add as attachments
	this._msgIds = params.msgIds;

	this.reset(true);

	// reset To/Cc/Bcc fields
	this._showAddressField(AjxEmailAddress.TO, true, true, true);
	this._showAddressField(AjxEmailAddress.CC, true, true, true);
	this._showAddressField(AjxEmailAddress.BCC, appCtxt.get(ZmSetting.SHOW_BCC), true, true);

	// populate fields based on the action and user prefs
	this._setAddresses(action, params.toOverride);
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
			if (contentType != ZmMimeTable.TEXT_PLAIN && contentType != ZmMimeTable.TEXT_HTML) {
				var mimePart = new ZmMimePart();
				mimePart.setContentType(contentType);
				mimePart.setContent(bodyPart.content);
				this.addMimePart(mimePart);
			}
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
*/
ZmComposeView.prototype._onMsgDataChange =
function(what, val) {
	switch (what) {
	    case "subject":
		this._subjectField.value = val;
		break;
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

ZmComposeView.prototype.getForwardLinkHtml =
function() {
	return this._attcDiv.innerHTML;
};

ZmComposeView.prototype.getHtmlEditor =
function() {
	return this._htmlEditor;
};

ZmComposeView.prototype.getOrigMsg =
function() {
	return this._msg;
};

ZmComposeView.prototype.getTitle =
function() {
	var text;
	if (this._action == ZmOperation.REPLY)
		text = ZmMsg.reply;
	else if (this._action == ZmOperation.FORWARD_INLINE || this._action == ZmOperation.FORWARD_ATT)
		text = ZmMsg.forward;
	else
		text = ZmMsg.compose;
	return [ZmMsg.zimbraTitle, text].join(": ");
};

// returns the field values for each of the addr fields
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

ZmComposeView.prototype.getSendUID =
function() {
	return this._sendUID;
};

ZmComposeView.prototype.setBackupForm =
function() {
	this.backupForm = this._backupForm();
};

/**
* Saves *ALL* form value data to test against whether user made any changes
* since canceling SendMsgRequest. If user attempts to send again, we compare
* form data with this value and if not equal, send a new UID otherwise, re-use.
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
	val += this._getForwardAttIds(ZmComposeView.FORWARD_ATT_NAME).join("");
	val += this._getForwardAttIds(ZmComposeView.FORWARD_MSG_NAME).join("");

	return val;
};

ZmComposeView.prototype._isInline =
function() {
	if (this._attachDialog) {
        return this._attachDialog.isInline();
    }

	if (this._msg && this._msgAttId && this._msg.id == this._msgAttId) {
		return false;
	}

	if (this._msg && this._msg.getAttachments()) {
		var atts = this._msg.getAttachments();
		for (var i = 0; i < atts.length; i++) {
			if (atts[i].ci) {
				return true;
			}
		}
	}

	return false;
};

ZmComposeView.prototype._fixMultipartRelatedLinks =
function(idoc) {
	if (!idoc) { return; }

	var images = idoc.getElementsByTagName("img");
	var inlineCid = [];
	for (var i = 0; i < images.length; i++) {
		var dfsrc = images[i].getAttribute("dfsrc");
		if (dfsrc) {
			images[i].src = dfsrc;
			if(dfsrc.substring(0,4 == "cid:")){
				inlineCid.push(dfsrc.substring(4));
			}
		}
	}
	return inlineCid;
};

ZmComposeView.prototype._filterInlineAmongForwardAttIds =
function(msg, atts, forwardAttIds) {
	var fwdAttIds = [];
	for (var i=0; i < forwardAttIds.length; i++) {
		var fwdAtt = forwardAttIds[i];
		var matched = false;
		for (var j=0; j < atts.length; j++) {
			if (atts[j].part == fwdAtt) {
				var cid = atts[j].ci;
				if (cid) {
					cid = cid.substring(1, cid.length-1);
					msg.addInlineAttachmentId(cid, null, atts[j].part);
					matched = true;
				}
				break;
			}
		}
		if (!matched) {
			fwdAttIds.push(fwdAtt);
		}
	}
	return fwdAttIds;
};

/**
* Returns the message from the form, after some basic input validation.
*/
ZmComposeView.prototype.getMsg =
function(attId, isDraft) {
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

	var cd = this._confirmDialog = appCtxt.getOkCancelMsgDialog();
	cd.reset();

	// Is there a subject? If not, ask the user if they want to send anyway.
	var subject = AjxStringUtil.trim(this._subjectField.value);
	if (!isDraft && subject.length == 0 && !this._noSubjectOkay) {
		this.enableInputs(false);
    	cd.setMessage(ZmMsg.compSubjectMissing, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._noSubjectOkCallback, this);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._noSubjectCancelCallback, this);
	    cd.popup(this._getDialogXY());
		return;
	}

	// Any bad addresses?  If there are bad ones, ask the user if they want to send anyway.
	if (!isDraft && addrs[ZmComposeView.BAD].size() && !this._badAddrsOkay) {
		this.enableInputs(false);
	    var bad = AjxStringUtil.htmlEncode(addrs[ZmComposeView.BAD].toString(AjxEmailAddress.SEPARATOR));
	    var msg = AjxMessageFormat.format(ZmMsg.compBadAddresses, bad);
    	cd.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._badAddrsOkCallback, this);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._badAddrsCancelCallback, this, addrs.badType);
		cd.setVisible(true); // per fix for bug 3209
		cd.popup(this._getDialogXY());
		return;
	} else {
		this._badAddrsOkay = false;
	}

	// Create Msg Object
	var msg = new ZmMailMsg();
	msg.setSubject(subject);
	
	//Handle Inline Attachments
	var inline = this._isInline();
	
	//Removed as I have added relavent code in ZmMailMsg._creatMsgNode()
	/*if(this._msg && inline){
		msg.setInlineAttachments(this._msg.getInlineAttachments());
	}*/
	
	if (this._attachDialog && inline && attId) {
		for (var i = 0; i < attId.length; i++) {
			var att = attId[i];
			var contentType = att.ct;
			if (contentType && contentType.indexOf("image") != -1) {
				var cid = Dwt.getNextId(); //Change this to more uniqueId
				msg.addInlineAttachmentId(cid,att.aid);
				this._htmlEditor.insertImage("cid:"+cid);
			} else {
				msg.addAttachmentId(att.aid);
			}
		}
	} else if(attId && typeof attId != "string") {
		for (var i = 0; i < attId.length; i++) {
			msg.addAttachmentId(attId[i].aid);
		}
	} else if (attId) {
		msg.addAttachmentId(attId);
	}

	// check if this is a resend
	if (this._sendUID && this.backupForm) {
		// if so, check if user changed anything since canceling the send
		if (isDraft || this._backupForm() != this.backupForm) {
			this._sendUID = (new Date()).getTime();
		}
	} else {
		this._sendUID = (new Date()).getTime();
	}

	// get list of message part id's for any forwarded attachements
	var forwardAttIds = this._getForwardAttIds(ZmComposeView.FORWARD_ATT_NAME);
	var forwardMsgIds = this._getForwardAttIds(ZmComposeView.FORWARD_MSG_NAME);

	//Handle Inline Attachments as a part of forwardAttIds
	if (this._msg && this._msg.getAttachments()) {
		var atts = this._msg.getAttachments();
		var filteredForwardAttIds = this._filterInlineAmongForwardAttIds(msg,atts,forwardAttIds);
		msg._setFilteredForwardAttIds(filteredForwardAttIds);
	}

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
		this._fixMultipartRelatedLinks(this._htmlEditor._getIframeDoc());
		var defangedContent = this._htmlEditor.getContent(true);
		var refangedContent = defangedContent.replace(ZmComposeView.REFANG_RE, ZmComposeView.REFANG_RE_REPLACE);
		htmlPart.setContent(refangedContent);
		
		//Support for Inline
		if (inline) {
			var relatedPart = new ZmMimePart();
			relatedPart.setContentType(ZmMimeTable.MULTI_RELATED);			
			relatedPart.children.add(htmlPart);
			top.children.add(relatedPart);
		} else {
			top.children.add(htmlPart);
		}
		//top.children.add(htmlPart);
	} else {
		var textPart = this._extraParts ? new ZmMimePart() : top;
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(this._htmlEditor.getContent());

		if (this._extraParts) {
			top.setContentType(ZmMimeTable.MULTI_ALT);
			top.children.add(textPart);
		}
	}

	// add extra message parts
	if (this._extraParts) {
		for (var i = 0; i < this._extraParts.length; i++) {
			var mimePart = this._extraParts[i];
			top.children.add(mimePart);
		}
	}

	//var msg = new ZmMailMsg();
	msg.setTopPart(top);
	msg.setSubject(subject);
	msg.setForwardAttIds(forwardAttIds);
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		if (addrs[type] && addrs[type].all.size() > 0)
			msg.setAddresses(type, addrs[type].all);
	}
	msg.identity = this.getIdentity();
	msg.sendUID = this._sendUID;

	// save a reference to the original message
	msg._origMsg = this._msg;
	if (this._msg && this._msg._instanceDate) {
		msg._instanceDate = this._msg._instanceDate;
	}

	if (this._action != ZmOperation.NEW_MESSAGE && !this._msgIds) {
		var isInviteReply = this._isInviteReply(this._action);
		if (this._action == ZmOperation.DRAFT) {
			msg.isReplied = this._msg.rt == "r";
			msg.isForwarded = this._msg.rt == "w";
			msg.isDraft = this._msg.isDraft;
			// check if we're resaving a draft that was originally a reply/forward
			if (msg.isDraft) {
				// if so, set both origId and the draft id
				msg.origId = msg.isReplied || msg.isForwarded ? this._msg.origId : null;
				msg.id = this._msg.id;
				msg.nId = this._msg.nId;
			}
		} else {
			msg.isReplied = this._action == ZmOperation.REPLY || this._action == ZmOperation.REPLY_ALL || isInviteReply;
			msg.isForwarded = this._action == ZmOperation.FORWARD_INLINE || this._action == ZmOperation.FORWARD_ATT;
            msg.origId = this._msg.id;
        }
		msg.isInviteReply = isInviteReply;
		msg.inviteMode = isInviteReply ? this._action : null;
		msg.irtMessageId = this._msg.messageId;
		msg.folderId = this._msg.folderId;
	}

	if (this._msg) {
		// replied/forw msg or draft shouldn't have att ID (a repl/forw voicemail mail msg may)
		var msgAttId = this._msg.getAttachmentId();
		if (msgAttId) {
			msg.addAttachmentId(msgAttId);
		}
	}

	if (this._msgAttId) {
		if(forwardMsgIds.length > 0) { 
			//Check if the MsgId is already present in the fwdMsgIds list.
			var i = 0;
			while(forwardMsgIds[i] && forwardMsgIds[i] != this._msgAttId){
				i++;
			}
			if( i == forwardMsgIds.length) forwardMsgIds.push(this._msgAttId);
			delete i;
			//endCheck
		}else{
			forwardMsgIds.push(this._msgAttId);
		}
	}
	
	msg.setMessageAttachmentId(forwardMsgIds);

    var priority = this._getPriority();
    if (priority) {
        msg.flagLocal(priority, true);
    }
    
    return msg;
};

/**
* Sets an address field.
*
* @param type	the address type
* @param addr	the address string
*
* XXX: if addr empty, check if should hide field
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
function(composeMode) {
	if (composeMode == DwtHtmlEditor.TEXT ||
		(composeMode == DwtHtmlEditor.HTML && appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED))) {

		var curMember = (this._composeMode == DwtHtmlEditor.TEXT) ? this._bodyField : this._htmlEditor;

		this._composeMode = composeMode;

		this._htmlEditor.setMode(composeMode, true);
		// reset the body field Id and object ref
		this._bodyFieldId = this._htmlEditor.getBodyFieldId();
		this._bodyField = document.getElementById(this._bodyFieldId);
		if (this._bodyField.disabled) {
			this._bodyField.disabled = false;
		}

		// for now, always reset message body size
		this._resetBodySize();
		// recalculate form value since HTML mode inserts HTML tags
		this._origFormValue = this._formValue();

		// swap new body field into tab group
		var newMember = (composeMode == DwtHtmlEditor.TEXT) ? this._bodyField : this._htmlEditor;
		if (curMember && newMember && (curMember != newMember) && this._controller._tabGroup) {
			this._controller._tabGroup.replaceMember(curMember, newMember);
			// focus via replaceMember() doesn't take, try again
			if (composeMode == DwtHtmlEditor.HTML) {
				this._retryHtmlEditorFocus();
			}
		}
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
	this._htmlEditor.setContent(params.body || "");

	if (params.forwardHtml) {
		this._attcDiv.innerHTML = params.forwardHtml;
	}
	if (params.identityId) {
		this._identitySelect.setSelectedValue(params.identityId);
	}

	this.backupForm = params.backupForm;
	this._sendUID = params.sendUID;

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
	if (this._isInline()) {
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
	this._origFormValue = this._formValue();
};

ZmComposeView.prototype._handleInline =
function(msgObj) {
	var msg = (msgObj) ? msgObj : this._msg;
	var iDoc = this._htmlEditor._getIframeDoc();
	return (this._fixMultipartRelatedImages(msg,iDoc));
};

ZmComposeView.prototype._fixMultipartRelatedImages =
function(msg, idoc) {
	if (!idoc) { return; }

	var images = idoc.getElementsByTagName("img");
	var num = 0;
	for (var i = 0; i < images.length; i++) {
		var dfsrc = images[i].getAttribute("dfsrc") || images[i].src;
		if (dfsrc) {
			if (dfsrc.substring(0,4) == "cid:") {
				num++;
				var cid = "<" + dfsrc.substring(4) + ">";
				var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_ID, cid);
				//Cache cleared, becoz part id's may change. 
				src = src + "&t=" + (new Date()).getTime();
				if (src) {
					images[i].src = src;
					images[i].setAttribute("dfsrc",dfsrc);
				}
			} else if (dfsrc.indexOf("//") == -1) { // check for content-location verison
				var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_LOCATION, dfsrc);
				//Cache cleared, becoz part id's may change.
				src = src + "&t=" + (new Date()).getTime();
				if (src) {
					num++;
					images[i].src = src;
					images[i].setAttribute("dfsrc",dfsrc);
				}
			}
		}
	}
	return (num == images.length);
};

ZmComposeView.prototype.showAttachmentDialog =
function() {
	var attachDialog = appCtxt.getAttachDialog();
	var callback = new AjxCallback(this, this._attsDoneCallback, [true]);
	attachDialog.setUploadCallback(callback);
    attachDialog.popup();
    attachDialog.enableInlineOption(this._composeMode == DwtHtmlEditor.HTML);
	this._attachDialog = attachDialog;
};

/**
* Revert compose view to a clean state (usually called before popping compose view)
*/
ZmComposeView.prototype.reset =
function(bEnableInputs) {
	this.backupForm = null;
	this._sendUID = null;

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
	this._htmlEditor.clear();

	// the div that holds the attc.table and null out innerHTML
	this.cleanupAttachments(true);

	this._resetBodySize();

	this._msgAttId = null;
	this._origFormValue = "";

	// reset dirty shields
	this._noSubjectOkay = this._badAddrsOkay = false;

	// remove extra mime parts
	this._extraParts = null;

	// enable/disable input fields
	this.enableInputs(bEnableInputs);

	// reset state of the spell check button
	this._controller.toggleSpellCheckButton(false);

	if (this._accountChanged) {
		this._identitySelect.clearOptions();
		var identityOptions = this._getIdentityOptions();
		for (var i = 0; i < identityOptions.length; i++) {
			this._identitySelect.addOption(identityOptions[i]);
		}

		this._accountChanged = false;
	}
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
 */
ZmComposeView.prototype.addMimePart =
function(mimePart) {
	if (!this._extraParts) {
		this._extraParts = [];
	}
	this._extraParts.push(mimePart);
};

/**
 * Called when the user selects something from the Signature menu.
 */
ZmComposeView.prototype.applySignature =
function(content, replaceSignatureId){
	content = content || "";
	var signature = this.getSignatureContent();
	var sep = this._getSignatureSeparator();
	var newLine = this._getSignatureNewLine();
	var isAbove = this.getSignatureStyle() == ZmSetting.SIG_OUTLOOK;
	if (replaceSignatureId) {
		var replaceSignature = this.getSignatureContent(replaceSignatureId);
		var replaceRe = AjxStringUtil.regExEscape(replaceSignature);
		if (!isAbove) {
			replaceRe += "\\s*";
			if (this.getHtmlEditor().getMode() == DwtHtmlEditor.HTML) {
				replaceRe += "</body></html>";
			}
			replaceRe += "$";
		} else {
			signature = signature || newLine; 
		}
		content = content.replace(new RegExp(replaceRe, "i"), signature);
	} else {
		content = this._insertSignature(content, this.getSignatureStyle(), signature, sep, newLine);
	}
	this._htmlEditor.setContent(content);
};

ZmComposeView.prototype.getSignatureContent = function(signatureId) {
	var sig = this._getSignature(signatureId);
	if (!sig) { return ""; }

	var sep = this._getSignatureSeparator();
	var newLine = this._getSignatureNewLine();
	var isAbove = this.getSignatureStyle() == ZmSetting.SIG_OUTLOOK;
	var isText = this.getHtmlEditor().getMode() == DwtHtmlEditor.TEXT;
	return isAbove ? [sep, sig, isText ? newLine : ""].join("") : sep + sig;
};

ZmComposeView.prototype.getSignatureStyle = function(identity) {
	identity = identity || this.getIdentity();
	return identity.getSignatureStyle();
};

/**
 * Adds the user's signature to the message body. An "internet" style signature
 * is prefixed by a special line and added to the bottom. An "outlook" style
 * signature is added before quoted content.
 * 
 * This method is only used to add an 
 * 
 * @content 			optional content to use
 */
ZmComposeView.prototype.addSignature =
function(content) {
	// bug fix #6821 - we need to pass in "content" param
	// since HTML composing in new window doesnt guarantee the html editor
	// widget will be initialized when this code is running.
	content = content || "";
	var sig = this._getSignature();
	var sep = this._getSignatureSeparator();
	var newLine = this._getSignatureNewLine();
	var identity = this.getIdentity();
	content = this._insertSignature(content, identity.getSignatureStyle(), sig, sep, newLine);

	this._htmlEditor.setContent(content);
};

ZmComposeView.prototype._insertSignature =
function(content, sigStyle, sig, sep, newLine) {

	if (sigStyle == ZmSetting.SIG_OUTLOOK) {

		var regexp = ZmComposeView.QUOTED_CONTENT_RE;
		var repl = "----- ";
	
		if (this._composeMode == DwtHtmlEditor.HTML) {
			regexp = ZmComposeView.HTML_QUOTED_CONTENT_RE;
			repl = "<br>----- ";
		}
	
		if (content.match(regexp)) {
			content = content.replace(regexp, [sep, sig, newLine, repl].join(""));
		} else {
			content = [content, sep, sig].join("");
		}
	} else {
		content = [content, sep, sig].join("");
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

ZmComposeView.prototype._getSignature =
function(signatureId) {
	signatureId = signatureId || this._controller.getSelectedSignature();
	if (!signatureId) { return; }

	var signature = appCtxt.getSignatureCollection().getById(signatureId);
	var sig = signature.value;
	var newLine = this._getSignatureNewLine();
	if (this._composeMode == DwtHtmlEditor.HTML) {
		sig = AjxStringUtil.htmlEncodeSpace(sig).replace(/\n/g,"<br>");
	}
	return sig + newLine;
};

ZmComposeView.prototype._getSignatureSeparator =
function() {
	var newLine = this._getSignatureNewLine();
	var sep = newLine + newLine;
	if (this.getIdentity().getSignatureStyle() == ZmSetting.SIG_INTERNET) {
		sep = sep + "-- " + newLine;
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
*/
ZmComposeView.prototype.isDirty =
function(incAddrs, incSubject) {
	// reply/forward and empty body => not dirty
	if ((this._action != ZmOperation.NEW_MESSAGE) &&
		(this._htmlEditor.getContent().match(ZmComposeView.EMPTY_FORM_RE)))
	{
		return false;
	}

	var curFormValue = this._formValue(incAddrs, incSubject);

	// empty subject and body => not dirty
	if (curFormValue.match(ZmComposeView.EMPTY_FORM_RE) ||
		(this._composeMode == DwtHtmlEditor.HTML &&
		 (curFormValue == "<html><body></body></html>" ||
		  curFormValue == "<html><body><br></body></html>")))
	{
		return false;
	}

	// subject or body has changed => dirty
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
		this._msg._attId = null;
	}
};

// Private / protected methods

ZmComposeView.prototype._isInviteReply =
function(action) {
	return (action == ZmOperation.REPLY_ACCEPT ||
			action == ZmOperation.REPLY_CANCEL ||
			action == ZmOperation.REPLY_DECLINE ||
			action == ZmOperation.REPLY_TENTATIVE ||
			action == ZmOperation.REPLY_MODIFY ||
			action == ZmOperation.REPLY_NEW_TIME);
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
	var a = addrVec.getArray();
	var addrs = [];
	for (var i = 0; i < a.length; i++) {
		var addr = a[i];
		var email = addr ? addr.getAddress() : null;
		if (!email) { continue; }
		email = email.toLowerCase();
		if (!used[email])
			addrs.push(addr);
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

// Returns the location where the autocomplete list should be positioned. Run as a callback.
ZmComposeView.prototype._getAcListLoc =
function(cv, ev) {
	var element = ev.element;
	var field = document.getElementById(cv._divId[element.addrType]);
	var offset = Dwt.getLocation(field).y - this.getLocation().y

	return (new DwtPoint(75, offset + Dwt.getSize(element).y + 6));
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
		key == 3 || key == 13 || key == 8 || key == 46)
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
function(action, toOverride) {
	this._action = action;

	if (action == ZmOperation.NEW_MESSAGE &&
		toOverride)
	{
		this.setAddress(AjxEmailAddress.TO, toOverride);
	}
	else if (action == ZmOperation.REPLY ||
			 action == ZmOperation.REPLY_ALL ||
			 this._isInviteReply(action))
	{
		// Prevent user's login name and aliases from going into To: or Cc:
		var used = {};
		var uname = appCtxt.get(ZmSetting.USERNAME);
		if (uname) {
			used[uname.toLowerCase()] = true;
		}
		var aliases = appCtxt.get(ZmSetting.MAIL_ALIASES);
		for (var i = 0, count = aliases.length; i < count; i++) {
			used[aliases[i].toLowerCase()] = true;
		}

		// When updating address lists, use this._addressesMsg instead of this._msg, because
		// this._msg changes after a draft is saved.
		if (!this._addressesMsg.isSent) {
			var addr = this._getAddrString(this._addressesMsg.getReplyAddresses(action, used), {});
			this.setAddress(AjxEmailAddress.TO, addr);
		} else if (action == ZmOperation.REPLY) {
			var toAddrs = this._addressesMsg.getAddresses(AjxEmailAddress.TO);
			this.setAddress(AjxEmailAddress.TO, this._getAddrString(toAddrs, {}));
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
	}
	else if (action == ZmOperation.DRAFT ||
			 action == ZmOperation.SHARE)
	{
		for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
			var addrs = this._msg.getAddresses(ZmMailMsg.COMPOSE_ADDRS[i]);
			this.setAddress(ZmMailMsg.COMPOSE_ADDRS[i], addrs.getArray().join(AjxEmailAddress.SEPARATOR));
		}
	}
};

ZmComposeView.prototype._setSubject =
function(action, msg, subjOverride) {
	if ((action == ZmOperation.NEW_MESSAGE && subjOverride == null)) {
		return;
	}
	
	var subj = subjOverride || ( (msg) ? msg.subject : "" );

	if (action != ZmOperation.DRAFT && subj) {
		var regex = ZmComposeView.SUBJ_PREFIX_RE;
		while (regex.test(subj))
			subj = subj.replace(regex, "");
	}

	var prefix = "";
	switch (action) {
		case ZmOperation.REPLY:
		case ZmOperation.REPLY_ALL: 		prefix = ZmMsg.re + ": "; break;
		case ZmOperation.REPLY_CANCEL: 		prefix = ZmMsg.cancelled + ": "; break;
		case ZmOperation.FORWARD_INLINE:
		case ZmOperation.FORWARD_ATT: 		prefix = ZmMsg.fwd + ": "; break;
		case ZmOperation.REPLY_ACCEPT:		prefix = ZmMsg.subjectAccept + ": "; break;
		case ZmOperation.REPLY_DECLINE:		prefix = ZmMsg.subjectDecline + ": "; break;
		case ZmOperation.REPLY_TENTATIVE:	prefix = ZmMsg.subjectTentative + ": "; break;
		case ZmOperation.REPLY_NEW_TIME:	prefix = ZmMsg.subjectNewTime + ": "; break;
	}
	this._subjectField.value = prefix + (subj || "");
};

ZmComposeView.prototype._setBody =
function(action, msg, extraBodyText, incOption) {
	var composingHtml = this._composeMode == DwtHtmlEditor.HTML;

	// XXX: consolidate this code later.
	var isDraft = action == ZmOperation.DRAFT;
	var isShare = action == ZmOperation.SHARE;
	var isInviteReply = action == ZmOperation.REPLY_ACCEPT ||
						action == ZmOperation.REPLY_DECLINE ||
						action == ZmOperation.REPLY_TENTATIVE ||
						action == ZmOperation.REPLY_NEW_TIME;
	if (isDraft || isShare || isInviteReply) {
		var body = "";
		if (composingHtml) {
			body = msg.getBodyPart(ZmMimeTable.TEXT_HTML);
			// if no html part exists, just grab the text
			// (but make sure to preserve whitespace and newlines!)
			if (!AjxUtil.isString(body)) {
				if (body) {
					body = body.content;
				} else {
					var bodyPart = msg.getBodyPart();
					body = bodyPart ? (AjxStringUtil.convertToHtml(bodyPart.content)) : null;
				}
			}
		} else {
			var bodyPart = msg.getBodyPart();
			body = bodyPart ? bodyPart.content : null;
		}
		this._htmlEditor.setContent(body);
		
		if (!isInviteReply) {
			this._showForwardField(msg, action);
			this._fixMultipartRelatedImages(msg,this._htmlEditor._getIframeDoc());
			return;
		}
	}

	var identity = this.getIdentity();
	var sigStyle = null;
	if (appCtxt.get(ZmSetting.SIGNATURES_ENABLED)) {
		var sig = this._getSignature();
		sigStyle = sig ? identity.getSignatureStyle() : null;
	}
	var value = sigStyle == ZmSetting.SIG_OUTLOOK ? (this._getSignatureSeparator() + sig) : "";

	// get reply/forward prefs as necessary
	if (!incOption) {
		var isReply = action == ZmOperation.REPLY || action == ZmOperation.REPLY_ALL;
		if (isReply || isInviteReply) {
			incOption = identity.getReplyOption();
		} else if (action == ZmOperation.FORWARD_INLINE) {
			incOption = identity.getForwardOption();
			if (incOption == ZmSetting.INCLUDE_ATTACH) {
				incOption = ZmSetting.INCLUDE;
			}
		} else if (action == ZmOperation.FORWARD_ATT) {
			incOption = ZmSetting.INCLUDE_ATTACH;
		}
	}

	this._msgAttId = null;
	if (incOption == ZmSetting.INCLUDE_NONE || action == ZmOperation.NEW_MESSAGE) {
		if (extraBodyText) {
			value = extraBodyText + value;
		}
	} else if (incOption == ZmSetting.INCLUDE_ATTACH && this._msg) {
		this._msgAttId = this._msg.id;
	} else if (!this._msgIds) {
		var crlf = composingHtml ? "<br>" : ZmMsg.CRLF;
		var crlf2 = composingHtml ? "<br><br>" : ZmMsg.CRLF2;
		var leadingText = extraBodyText ? extraBodyText + crlf : crlf;
		var body;
		var bodyPart;

		// bug fix #7271 - if we have multiple body parts, append them all first
		var parts = msg.getBodyParts();
		if (parts && parts.length > 1) {
			var bodyArr = [];
			for (var k = 0; k < parts.length; k++) {
				var part = parts[k];
				if (part.ct == ZmMimeTable.TEXT_PLAIN || composingHtml) {
					bodyArr.push(part.content);
				} else if (part.ct == ZmMimeTable.TEXT_HTML) {
					var div = document.createElement("div");
					div.innerHTML = part.content;
					bodyArr.push(AjxStringUtil.convertHtml2Text(div));
				}
			}
			body = bodyArr.join(crlf);
		} else {
			if (composingHtml) {
				body = msg.getBodyPart(ZmMimeTable.TEXT_HTML);
				if (body) {
					body = AjxUtil.isString(body) ? body : body.content;
				} else {
					// if no html part exists, just grab the text
					bodyPart = msg.getBodyPart();
					body = bodyPart ? this._getTextPart(bodyPart, true) : null;
				}
			} else {
				// grab text part out of the body part
				bodyPart = msg.getBodyPart(ZmMimeTable.TEXT_PLAIN) || msg.getBodyPart(ZmMimeTable.TEXT_HTML, true);
				body = bodyPart ? this._getTextPart(bodyPart) : null;
			}
		}

		body = body || ""; // prevent from printing "null" if no body found

		if ((action == ZmOperation.FORWARD_INLINE ||
			 action == ZmOperation.REPLY ||
			 action == ZmOperation.REPLY_ALL) &&
			bodyPart && AjxUtil.isObject(bodyPart) && bodyPart.truncated)
		{
			body += composingHtml
				? ("<br><br>" + ZmMsg.messageTruncated + "<br><br>")
				: ("\n\n" + ZmMsg.messageTruncated + "\n\n");
		}

		// Bug 7160: Strip off the ~*~*~*~ from invite replies.
		if (isInviteReply) {
			body = body.replace(ZmItem.NOTES_SEPARATOR, "");
		}

		// bug fix# 3215 - dont allow prefixing for html msgs
		if ((action == ZmOperation.FORWARD_INLINE && incOption != ZmSetting.INCLUDE_PREFIX) || 
			 incOption == ZmSetting.INCLUDE || composingHtml) 
		{
			var msgText = (action == ZmOperation.FORWARD_INLINE) ? ZmMsg.forwardedMessage : ZmMsg.origMsg;
			var text = [ZmMsg.DASHES, " ", msgText, " ", ZmMsg.DASHES, crlf].join("");
			for (var i = 0; i < ZmComposeView.QUOTED_HDRS.length; i++) {
				var hdr = msg.getHeaderStr(ZmComposeView.QUOTED_HDRS[i]);
				if (hdr) {
					if (composingHtml){
						hdr = AjxStringUtil.convertToHtml(hdr);
					}
					text += (hdr + crlf);
				}
			}
			body = text + crlf + body;
			value += leadingText + body;
		} else if (body.length > 0) {
			var from = msg.getAddress(AjxEmailAddress.FROM);
			if (!from && msg.isSent) {
				from = appCtxt.get(ZmSetting.USERNAME);
			}
			var preface = "";
			if (from) {
				if (!ZmComposeView._replyPrefixFormatter) {
					ZmComposeView._replyPrefixFormatter = new AjxMessageFormat(ZmMsg.replyPrefix);
				}
				preface = ZmComposeView._replyPrefixFormatter.format(from.toString());
			}
			var prefix = identity.getPrefix();
			if (incOption == ZmSetting.INCLUDE_PREFIX)
			{
				value += leadingText + preface + AjxStringUtil.wordWrap(body, ZmComposeView.WRAP_LENGTH, prefix + " ");
			}
			else if (incOption == ZmSetting.INCLUDE_SMART)
			{
				var chunks = AjxStringUtil.getTopLevel(body);
				for (var i = 0; i < chunks.length; i++)
					chunks[i] = AjxStringUtil.wordWrap(chunks[i], ZmComposeView.WRAP_LENGTH, prefix + " ");
				var text = chunks.length ? chunks.join('\n\n') : body;
				value += leadingText + preface + text;
			}
			else if (action == ZmOperation.REPLY_ACCEPT ||
					 action == ZmOperation.REPLY_DECLINE ||
					 action == ZmOperation.REPLY_TENTATIVE)
			{
				var bp = msg.getBodyPart(ZmMimeTable.TEXT_PLAIN);
				var bodyStr = bp ? (bp.content.replace(/\r\n/g, "\n")) : "";

				// bug 5122: always show original meeting details
				value = preface + AjxStringUtil.wordWrap(bodyStr, ZmComposeView.WRAP_LENGTH, prefix + " ");
			}
		}
	}

	if (sigStyle == ZmSetting.SIG_INTERNET) {
		this.addSignature(value);
	} else {
		this._htmlEditor.setContent(value);
	}
	
	this._showForwardField(msg, action, incOption);
	this._fixMultipartRelatedImages(msg,this._htmlEditor._getIframeDoc());
};

ZmComposeView.prototype.resetBody =
function(action, msg, extraBodyText, incOption) {
	this.cleanupAttachments(true);
	this._setBody(action, msg, extraBodyText, incOption);
	this._origFormValue = this._formValue();
};

// Generic routine for attaching an event handler to a field. Since "this" for the handlers is
// the incoming event, we need a way to get at ZmComposeView, so it's added to the event target.
ZmComposeView.prototype._setEventHandler =
function(id, event, addrType) {
	var field = document.getElementById(id);
	field._composeView = this._internalId;
	if (addrType)
		field._addrType = addrType;
	var lcEvent = event.toLowerCase();
	field[lcEvent] = ZmComposeView["_" + event];
};

ZmComposeView.prototype._setBodyFieldCursor =
function(extraBodyText) {
	if (this._composeMode == DwtHtmlEditor.HTML) {
		return;
	}

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
	this._internalId = AjxCore.assignId(this);

	// init html
	this._createHtml();

	// init compose view w/ based on user prefs
	var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	var defaultCompMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
	this._composeMode = composeMode || defaultCompMode;

	// init html editor
	this._htmlEditor = new ZmHtmlEditor(this, DwtControl.RELATIVE_STYLE, null, this._composeMode);
//	this._htmlEditor.addEventCallback(new AjxCallback(this, this._htmlEditorEventCallback));
	this._bodyFieldId = this._htmlEditor.getBodyFieldId();
	this._bodyField = document.getElementById(this._bodyFieldId);

	// misc. inits
	this.setScrollStyle(DwtControl.SCROLL);
	this._attachCount = 0;

	// init listeners
	this.addControlListener(new AjxListener(this, this._controlListener));

	if (appCtxt.multiAccounts) {
		var opc = this._controller._app.getOverviewPanelContent();
		opc.addSelectionListener(new AjxListener(this, this._accountChangeListener));
	}
};

ZmComposeView.prototype._createHtml =
function(templateId) {
	var data = { id: this._htmlElId };
	this._createHtmlFromTemplate(templateId || this.TEMPLATE, data);
};

ZmComposeView.prototype._createHtmlFromTemplate =
function(templateId, data) {
	DwtComposite.prototype._createHtmlFromTemplate.call(this, templateId, data);

	// global identifiers
	this._identityDivId = data.id + "_identity_row";

	// init autocomplete list
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contactsClass = appCtxt.getApp(ZmApp.CONTACTS);
		var params = {
			parent: this,
			dataClass: contactsClass,
			dataLoader: contactsClass.getContactList,
			matchValue: ZmContactsApp.AC_VALUE_FULL,
			locCallback: (new AjxCallback(this, this._getAcListLoc, [this])),
			compCallback: (new AjxCallback(this, this._acCompHandler)),
			keyUpCallback: (new AjxCallback(this, this._acKeyupHandler))
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
	}

	// process compose fields
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		var typeStr = AjxEmailAddress.TYPE_STRING[type];

		// save identitifiers
		this._divId[type] = [data.id, typeStr, "row"].join("_");
		this._buttonTdId[type] = [data.id, typeStr, "picker"].join("_");
		this._fieldId[type] = [data.id, typeStr, "control"].join("_");

		// save field control
		this._field[type] = document.getElementById(this._fieldId[type]);
		if (this._field[type]) {
			this._field[type].addrType = type;
		}

		// create picker
		if (this._contactPickerEnabled) {
			var pickerId = this._buttonTdId[type];
			var pickerEl = document.getElementById(pickerId);
			if (pickerEl) {
				var button = new DwtButton(this);
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
	this._headerEl = document.getElementById(data.id+"_header");
	this._subjectField = document.getElementById(data.id+"_subject_control");
	this._attcDiv = document.getElementById(data.id+"_attachments_div");

	// initialize identity select
	var identityOptions = this._getIdentityOptions();
	this._identitySelect = new DwtSelect(this, identityOptions);
	this._identitySelect.setToolTipContent(ZmMsg.chooseIdentity);

	var identityCollection = appCtxt.getIdentityCollection();
	if (!this._identityChangeListenerObj) {
		this._identityChangeListenerObj = new AjxListener(this, this._identityChangeListener);
	}
	identityCollection.addChangeListener(this._identityChangeListenerObj);

	this._identitySelect.replaceElement(data.id+"_identity_control");
	this._setIdentityVisible();

    if  (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
        this._priorityButton = new DwtButton(this);
        this._priorityButton.setMenu(new AjxCallback(this, this._priorityButtonMenuCallback));
        this._priorityButton.reparentHtmlElement(data.id + "_priority");
		this._priorityButton.setToolTipContent(ZmMsg.setPriority);
	}
};

ZmComposeView.prototype._createPrioityMenuItem =
function(menu, text, flag) {
    var item = DwtMenuItem.create(menu, this._getPriorityImage(flag), text);
    item._priorityFlag = flag;
    item.addSelectionListener(this._priorityMenuListnerObj);
};

ZmComposeView.prototype._priorityButtonMenuCallback =
function() {
    var menu = new DwtMenu(this._priorityButton);
    this._priorityMenuListnerObj = new AjxListener(this, this._priorityMenuListner);
    this._createPrioityMenuItem(menu, ZmMsg.high, ZmItem.FLAG_HIGH_PRIORITY);
    this._createPrioityMenuItem(menu, ZmMsg.normal, "");
    this._createPrioityMenuItem(menu, ZmMsg.low, ZmItem.FLAG_LOW_PRIORITY);
    return menu;
};

ZmComposeView.prototype._getPriorityImage =
function(flag) {
    if (flag == ZmItem.FLAG_HIGH_PRIORITY) {
        return "PriorityHigh";
    } else if (flag == ZmItem.FLAG_LOW_PRIORITY) {
        return "PriorityLow";
    }
    return "PriorityNormal";
};

ZmComposeView.prototype._priorityMenuListner =
function(ev) {
    this._setPriority(ev.dwtObj._priorityFlag);
};

ZmComposeView.prototype._getPriority =
function() {
    if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
        return this._priorityButton._priorityFlag || "";
    }
    return "";
};

ZmComposeView.prototype._setPriority =
function(flag) {
    if (appCtxt.get(ZmSetting.MAIL_PRIORITY_ENABLED)) {
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

		// bug fix #21497 - skip the *fake* local account if offline and is main
		var acct = (appCtxt.get(ZmSetting.OFFLINE) && appCtxt.multiAccounts)
			? appCtxt.getAccount(identity.id) : null;
		if (acct && acct.isMain) { continue; }

		var text = this._getIdentityText(identity);
		options.push(new DwtSelectOptionData(identity.id, text));
	}
	return options;
};

ZmComposeView.prototype._getIdentityText =
function(identity) {
	if (identity.sendFromDisplay) {
		return [identity.name,  ' ("', identity.sendFromDisplay, '" <', identity.sendFromAddress, '>)'].join("");
	} else {
		return [identity.name,  ' (', identity.sendFromAddress, ')'].join("");
	}
};

ZmComposeView.prototype._identityChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE) {
		this._setIdentityVisible();
		var identity = ev.getDetail("item");
		var text = this._getIdentityText(identity);
		var option = new DwtSelectOptionData(identity.id, text);
		this._identitySelect.addOption(option);
	} else if (ev.event == ZmEvent.E_DELETE) {
		// DwtSelect doesn't support removing an option, so recreate the whole thing.		
		this._identitySelect.clearOptions();
		var options = this._getIdentityOptions();
		for (var i = 0, count = options.length; i < count; i++)	 {
			this._identitySelect.addOption(options[i]);
		}
		this._setIdentityVisible();
	} else if (ev.event == ZmEvent.E_MODIFY) {
		var identity = ev.getDetail("item");
		var text = this._getIdentityText(identity);
		this._identitySelect.rename(identity.id, text);
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

ZmComposeView.prototype.getIdentitySelect =
function() {
	return this._identitySelect;
};

ZmComposeView.prototype.getIdentity =
function() {
	var identityCollection = appCtxt.getIdentityCollection();
	var id = this._identitySelect.getValue();
	var result = identityCollection.getById(id);
	return result ? result : identityCollection.defaultIdentity;
};

ZmComposeView.prototype._showForwardField =
function(msg, action, replyPref) {
	
	var html = "";
	if (!(this._msgIds && this._msgIds.length) && (replyPref == ZmSetting.INCLUDE_ATTACH ||action == ZmOperation.FORWARD_ATT)) {
		var data = { message: msg };
		html = AjxTemplate.expand("mail.Message#ForwardOneMessage", data);
		this._attachCount = 1;
	}else if (msg && msg.hasAttach) {
		var attLinks = msg.getAttachmentLinks();
		if (attLinks.length > 0) {
			var data = {
				attachments: attLinks,
				isNew: action == ZmOperation.NEW_MESSAGE,
				isForward: action == ZmOperation.FORWARD,
				isForwardInline: action == ZmOperation.FORWARD_INLINE,
				isDraft: action == ZmOperation.DRAFT
			};
			html = AjxTemplate.expand("mail.Message#ForwardAttachments", data);

			if (attLinks.length >= ZmComposeView.SHOW_MAX_ATTACHMENTS) {
				this._attcDiv.style.height = ZmComposeView.MAX_ATTACHMENT_HEIGHT;
				this._attcDiv.style.overflow = "auto";
			}
			this._attachCount = attLinks.length;
		}
	}else if (this._msgIds && this._msgIds.length) {
		// use main window's appCtxt
		var appCtxt = window.parentAppCtxt || window.appCtxt;
		var messages = [];
		for (var i = 0; i < this._msgIds.length; i++) {
			var message = appCtxt.cacheGet(this._msgIds[i]);
			if (!message) continue;
			messages.push(message);
		}
		var data = { messages: messages };
		html = AjxTemplate.expand("mail.Message#ForwardMessages", data);
		if (messages.length >= ZmComposeView.SHOW_MAX_ATTACHMENTS) {
			this._attcDiv.style.height = ZmComposeView.MAX_ATTACHMENT_HEIGHT;
			this._attcDiv.style.overflow = "auto";
		}
		this._attachCount = messages.length;
	}
	
	this._attcDiv.innerHTML = html;
};

ZmComposeView._removeAttachment = function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	Dwt.findAncestor(el,"_attach_table").deleteRow(Dwt.findAncestor(el,"_attach_tr").rowIndex);
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

// Show address field
ZmComposeView.prototype._showAddressField =
function(type, show, skipNotify, skipFocus) {
	this._using[type] = show;
	Dwt.setVisible(document.getElementById(this._divId[type]), show);
	this._field[type].value = ""; // bug fix #750 and #3680
	this._field[type].noTab = !show;
	var setting = ZmComposeView.ADDR_SETTING[type];
	if (setting) {
		appCtxt.set(setting, show, null, false, skipNotify);
	}
	this._resetBodySize();
};

// Grab the addresses out of the form. Optionally, they can be returned broken out into good and
// bad addresses, with an aggregate list of the bad ones also returned. If the field is hidden,
// its contents are ignored.
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
	if (incSubject)
		vals.push(this._subjectField.value);
	vals.push(this._htmlEditor.getContent());
	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

// Listeners

// Address buttons invoke contact picker
ZmComposeView.prototype._addressButtonListener =
function(ev, addrType) {
	var obj = ev ? DwtUiEvent.getDwtObjFromEvent(ev) : null;
	this.enableInputs(false);

	if (!this._contactPicker) {
		AjxDispatcher.require("ContactsCore");
		var buttonInfo = [
			{ id: AjxEmailAddress.TO,	label: ZmMsg[AjxEmailAddress.TYPE_STRING[AjxEmailAddress.TO]] },
			{ id: AjxEmailAddress.CC,	label: ZmMsg[AjxEmailAddress.TYPE_STRING[AjxEmailAddress.CC]] },
			{ id: AjxEmailAddress.BCC,	label: ZmMsg[AjxEmailAddress.TYPE_STRING[AjxEmailAddress.BCC]] }];
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
	var str = (this._field[curType].value && !(a[curType] && a[curType].length)) ? this._field[curType].value : "";
	this._contactPicker.popup(curType, a, str);
};

ZmComposeView.prototype._controlListener =
function() {
	this._resetBodySize();
};

ZmComposeView.prototype._accountChangeListener =
function(ev) {
	this._accountChanged = true;
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
function() {
	this._noSubjectOkay = true;
	// not sure why: popdown (in FF) seems to create a race condition,
	// we can't get the attachments from the document anymore.
	// W/in debugger, it looks fine, but remove the debugger and any
	// alerts, and gotAttachments will return false after the popdown call.

 	if (AjxEnv.isIE) {
		this._confirmDialog.popdown();
 	}
	// bug fix# 3209
	// - hide the dialog instead of popdown (since window will go away anyway)
	if (AjxEnv.isNav && appCtxt.isChildWindow) {
		this._confirmDialog.setVisible(false);
	}

	// dont make any calls after sendMsg if child window since window gets destroyed
	if (appCtxt.isChildWindow && !AjxEnv.isNav) {
		this._controller.sendMsg();
	} else {
		// bug fix #3251 - call popdown BEFORE sendMsg
		this._confirmDialog.popdown();
		this._controller.sendMsg();
	}
};

// User has canceled sending message without a subject
ZmComposeView.prototype._noSubjectCancelCallback =
function() {
	this.enableInputs(true);
	this._confirmDialog.popdown();
	appCtxt.getKeyboardMgr().grabFocus(this._subjectField);
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

// User has agreed to send message with bad addresses
ZmComposeView.prototype._badAddrsOkCallback =
function() {
	this.enableInputs(true);
	this._badAddrsOkay = true;
	this._confirmDialog.popdown();
	this._controller.sendMsg();
};

// User has declined to send message with bad addresses - set focus to bad field
ZmComposeView.prototype._badAddrsCancelCallback =
function(type) {
	this.enableInputs(true);
	this._badAddrsOkay = false;
	this._confirmDialog.popdown();
	if (this._using[type]) {
		appCtxt.getKeyboardMgr().grabFocus(this._field[type]);
	}
	this._controller.resetToolbarOperations();
	this.reEnableDesignMode();
};

// Files have been uploaded, re-initiate the send with an attachment ID.
ZmComposeView.prototype._attsDoneCallback =
function(isDraft, status, attId) {
	DBG.println(AjxDebug.DBG1, "Attachments: isDraft = " + isDraft + ", status = " + status + ", attId = " + attId);
	DBG.dumpObj(AjxDebug.DBG1,attId);
	if (status == AjxPost.SC_OK) {
		this._controller._saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, attId);
	} else if (status == AjxPost.SC_UNAUTHORIZED) {
		// auth failed during att upload - let user relogin, continue with compose action
		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
		var callback = new AjxCallback(this._controller, isDraft ? this._controller._saveDraft : this._controller._send);
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
		this._controller.resetToolbarOperations()
	}
};

ZmComposeView.prototype._setFormValue =
function() {
	this._origFormValue = this._formValue();
};

ZmComposeView.prototype._focusHtmlEditor =
function() {
	this._htmlEditor.focus();
};


// Static methods

ZmComposeView._onClick =
function(ev) {
	ev || (ev = window.event);

	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var id = element ? element.id : null;

	// if clicked on remove attachment link
	if (id && id.indexOf("_att_") == 0) {
		var cv = AjxCore.objectWithId(element._composeView);
		var attId = id.slice(0, -2);
		var row = document.getElementById(attId);

		cv._attachmentTable.deleteRow(row.rowIndex);
		if (--cv._attachCount < ZmComposeView.SHOW_MAX_ATTACHMENTS) {
			cv._attcDiv.style.overflow = "";
			cv._attcDiv.style.height = "";
			if (cv._attachCount == 0) {
				cv._attachmentTable = null;
				cv._attcDiv.innerHTML = "";
			}
		}
		cv._resetBodySize();
		return false; // disables following of link
	}

	return true;
};

ZmComposeView._onKeyDown =
function(ev) {
	ev || (ev = window.event);

	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) return true;

	var id = element.id;
	var key = DwtKeyEvent.getCharCode(ev);
	// ignore return in attachment input field (bug 961)
	if (id.indexOf("_att_") == 0)
		return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
};

// NOTE: this handler should only get triggered if/when contacts are DISABLED!
ZmComposeView._onKeyUp =
function(ev) {
	ev || (ev = window.event);

	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	if (!element) return true;

	var cv = AjxCore.objectWithId(element._composeView);
	cv._adjustAddrHeight(element);
};

//for ZimbraDnD
ZmComposeView.prototype.uploadFiles = function(){
    var attachDialog = appCtxt.getAttachDialog();
    this._controller = AjxDispatcher.run("GetComposeController");
    var callback = new AjxCallback(this, this._attsDoneCallback, [true]);
	attachDialog.setUploadCallback(callback);
    attachDialog.upload(callback, document.getElementById("zdnd_form"));
};