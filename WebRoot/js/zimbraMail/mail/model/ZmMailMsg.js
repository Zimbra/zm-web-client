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
 * @overview
 * This file defines the mail message.
 */

/**
 * @constructor
 * @class
 * Creates a new (empty) mail message.
 *
 * @param {int}			id			the unique ID
 * @param {Array}		list		the list that contains this message
 * @param {Boolean}		noCache		if true, do not cache this message
 * 
 * @extends	ZmMailItem
 */
ZmMailMsg = function(id, list, noCache) {

	ZmMailItem.call(this, ZmItem.MSG, id, list, noCache);

	this.inHitList = false;
	this._attHitList = [];
	this._inviteDescBody = {};
	this._addrs = {};

	// info about MIME parts
	this.attachments = [];
	this._bodyParts = [];
	this._contentType = {};
	
	for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		this._addrs[type] = new AjxVector();
	}
	this.identity = null;
};

ZmMailMsg.prototype = new ZmMailItem;
ZmMailMsg.prototype.constructor = ZmMailMsg;

ZmMailMsg.prototype.isZmMailMsg = true;
ZmMailMsg.prototype.toString = function() {	return "ZmMailMsg"; };

ZmMailMsg.DL_SUB_VERSION = "0.1";

ZmMailMsg.ADDRS = [AjxEmailAddress.FROM, AjxEmailAddress.TO, AjxEmailAddress.CC,
				   AjxEmailAddress.BCC, AjxEmailAddress.REPLY_TO, AjxEmailAddress.SENDER,
                   AjxEmailAddress.RESENT_FROM];

ZmMailMsg.COMPOSE_ADDRS = [AjxEmailAddress.TO, AjxEmailAddress.CC, AjxEmailAddress.BCC];

ZmMailMsg.HDR_FROM		= AjxEmailAddress.FROM;
ZmMailMsg.HDR_TO		= AjxEmailAddress.TO;
ZmMailMsg.HDR_CC		= AjxEmailAddress.CC;
ZmMailMsg.HDR_BCC		= AjxEmailAddress.BCC;
ZmMailMsg.HDR_REPLY_TO	= AjxEmailAddress.REPLY_TO;
ZmMailMsg.HDR_SENDER	= AjxEmailAddress.SENDER;
ZmMailMsg.HDR_DATE		= "DATE";
ZmMailMsg.HDR_SUBJECT	= "SUBJECT";
ZmMailMsg.HDR_LISTID    = "List-ID";
ZmMailMsg.HDR_XZIMBRADL = "X-Zimbra-DL";
ZmMailMsg.HDR_INREPLYTO = "IN-REPLY-TO";

ZmMailMsg.HDR_KEY = {};
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_FROM]		= ZmMsg.from;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_TO]			= ZmMsg.to;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_CC]			= ZmMsg.cc;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_BCC]		= ZmMsg.bcc;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_REPLY_TO]	= ZmMsg.replyTo;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_SENDER]		= ZmMsg.sender;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_DATE]		= ZmMsg.sentAt;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_SUBJECT]	= ZmMsg.subject;

// Ordered list - first matching status wins
ZmMailMsg.STATUS_LIST = ["isScheduled", "isDraft", "isReplied", "isForwarded", "isSent", "isUnread"];

ZmMailMsg.STATUS_ICON = {};
ZmMailMsg.STATUS_ICON["isDraft"]		= "MsgStatusDraft";
ZmMailMsg.STATUS_ICON["isReplied"]		= "MsgStatusReply";
ZmMailMsg.STATUS_ICON["isForwarded"]	= "MsgStatusForward";
ZmMailMsg.STATUS_ICON["isSent"]			= "MsgStatusSent";
ZmMailMsg.STATUS_ICON["isUnread"]		= "MsgStatusUnread";
ZmMailMsg.STATUS_ICON["isScheduled"]	= "SendLater";

ZmMailMsg.PSTATUS_ACCEPT		= "AC";
ZmMailMsg.PSTATUS_DECLINED		= "DE";
ZmMailMsg.PSTATUS_TENTATIVE		= "TE";

ZmMailMsg.STATUS_ICON[ZmMailMsg.PSTATUS_ACCEPT]		= "CalInviteAccepted";
ZmMailMsg.STATUS_ICON[ZmMailMsg.PSTATUS_DECLINED]	= "CalInviteDeclined";
ZmMailMsg.STATUS_ICON[ZmMailMsg.PSTATUS_TENTATIVE]	= "CalInviteTentative";

// tooltips for invite status icons
ZmMailMsg.TOOLTIP = {};
ZmMailMsg.TOOLTIP["Appointment"]		= ZmMsg.appointment;
ZmMailMsg.TOOLTIP["CalInviteAccepted"]	= ZmMsg.ptstAccept;
ZmMailMsg.TOOLTIP["CalInviteDeclined"]	= ZmMsg.ptstDeclined;
ZmMailMsg.TOOLTIP["CalInviteTentative"]	= ZmMsg.ptstTentative;

// We just hard-code "Re:" or "Fwd:", but other clients may use localized versions
ZmMailMsg.SUBJ_PREFIX_RE = new RegExp("^\\s*(Re|Fw|Fwd|" + ZmMsg.re + "|" + ZmMsg.fwd + "|" + ZmMsg.fw + "):" + "\\s*", "i");

ZmMailMsg.URL_RE = /((telnet:)|((https?|ftp|gopher|news|file):\/\/)|(www\.[\w\.\_\-]+))[^\s\xA0\(\)\<\>\[\]\{\}\'\"]*/i;

ZmMailMsg.CONTENT_PART_ID = "ci";
ZmMailMsg.CONTENT_PART_LOCATION = "cl";

// Additional headers to request.  Also used by ZmConv and ZmSearch
ZmMailMsg.requestHeaders = {listId: ZmMailMsg.HDR_LISTID, xZimbraDL: ZmMailMsg.HDR_XZIMBRADL,replyTo:ZmMailMsg.HDR_INREPLYTO};

/**
 * Fetches a message from the server.
 *
 * @param {Hash}			params					a hash of parameters
 * @param {ZmZimbraMail}	params.sender			the provides access to sendRequest()
 * @param {int}				params.msgId			the ID of the msg to be fetched.
 * @param {int}				params.partId 			the msg part ID (if retrieving attachment part, i.e. rfc/822)
 * @param {int}				params.ridZ   			the RECURRENCE-ID in Z (UTC) timezone
 * @param {Boolean}			params.getHtml			if <code>true</code>, try to fetch html from the server
 * @param {Boolean}			params.markRead			if <code>true</code>, mark msg read
 * @param {AjxCallback}		params.callback			the async callback
 * @param {AjxCallback}		params.errorCallback	the async error callback
 * @param {Boolean}			params.noBusyOverlay	if <code>true</code>, do not put up busy overlay during request
 * @param {Boolean}			params.noTruncate		if <code>true</code>, do not truncate message body
 * @param {ZmBatchCommand}	params.batchCmd			if set, request gets added to this batch command
 * @param {String}			params.accountName		the name of the account to send request on behalf of
 * @param {boolean}			params.needExp			if not <code>false</code>, have server check if addresses are DLs
 */
ZmMailMsg.fetchMsg =
function(params) {
	var jsonObj = {GetMsgRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.GetMsgRequest;
	var m = request.m = {};
	m.id = params.msgId;
	if (params.partId) {
		m.part = params.partId;
	}
	if (params.markRead) {
		m.read = 1;
	}
	if (params.getHtml) {
		m.html = 1;
	}
	if (params.needExp !== false) {
		m.needExp = 1;
	}

	if (params.ridZ) {
		m.ridZ = params.ridZ;
	}

	ZmMailMsg.addRequestHeaders(m);

	if (!params.noTruncate) {
		m.max = appCtxt.get(ZmSetting.MAX_MESSAGE_SIZE) || ZmMailApp.DEFAULT_MAX_MESSAGE_SIZE;
	}

	if (params.batchCmd) {
		params.batchCmd.addRequestParams(jsonObj, params.callback);
	} else {
		var newParams = {
			jsonObj:		jsonObj,
			asyncMode:		true,
            offlineCache:   true,
			callback:		ZmMailMsg._handleResponseFetchMsg.bind(null, params.callback),
			errorCallback:	params.errorCallback,
			noBusyOverlay:	params.noBusyOverlay,
			accountName:	params.accountName
		};
        newParams.offlineCallback = ZmMailMsg._handleOfflineResponseFetchMsg.bind(null, m.id, newParams.callback);
		params.sender.sendRequest(newParams);
	}
};

ZmMailMsg._handleResponseFetchMsg =
function(callback, result) {
	if (callback) {
		callback.run(result);
	}
};

ZmMailMsg._handleOfflineResponseFetchMsg =
function(msgId, callback) {
    var getItemCallback = ZmMailMsg._handleOfflineResponseFetchMsgCallback.bind(null, callback);
    ZmOfflineDB.getItem(msgId, ZmApp.MAIL, getItemCallback);
};

ZmMailMsg._handleOfflineResponseFetchMsgCallback =
function(callback, result) {
    var response = {
        GetMsgResponse : {
            m : result
        }
    };
    if (callback) {
        callback(new ZmCsfeResult(response));
    }
};

ZmMailMsg.stripSubjectPrefixes =
function(subj) {
	var regex = ZmMailMsg.SUBJ_PREFIX_RE;
	while (regex.test(subj)) {
		subj = subj.replace(regex, "");
	}
	return subj;
};

// Public methods

/**
 * Gets a vector of addresses of the given type.
 *
 * @param {constant}	type			an email address type
 * @param {Hash}		used			an array of addresses that have been used. If not <code>null</code>,
 *										then this method will omit those addresses from the
 * 										returned vector and will populate used with the additional new addresses
 * @param {Boolean}		addAsContact	if <code>true</code>, emails should be converted to {@link ZmContact} objects
 * @param {boolean}		dontUpdateUsed	if true, do not update the hash of used addresses
 * 
 * @return	{AjxVector}	a vector of email addresses
 */
ZmMailMsg.prototype.getAddresses =
function(type, used, addAsContact, dontUpdateUsed) {
	if (!used) {
		return this._addrs[type];
	} else {
		var a = this._addrs[type].getArray();
		var addrs = [];
		for (var i = 0; i < a.length; i++) {
			var addr = a[i];
			var email = addr.getAddress();
			if (!email) { continue; }
			email = email.toLowerCase();
			if (!used[email]) {
				var contact = addr;
				if (addAsContact) {
					var cl = AjxDispatcher.run("GetContacts");
					contact = cl.getContactByEmail(email);
					if (contact == null) {
						contact = new ZmContact(null);
						contact.initFromEmail(addr);
					}
				}
				addrs.push(contact);
			}
			if (!dontUpdateUsed) {
				used[email] = true;
			}
		}
		return AjxVector.fromArray(addrs);
	}
};

/**
 * Gets a Reply-To address if there is one, otherwise the From address
 * unless this message was sent by the user, in which case, it is the To
 * field (but only in the case of Reply All). A list is returned, since
 * theoretically From and Reply To can have multiple addresses.
 * 
 * @return	{AjxVector}	an array of {@link AjxEmailAddress} objects
 */
ZmMailMsg.prototype.getReplyAddresses =
function(mode, aliases, isDefaultIdentity) {

	if (!this.isSent) { //ignore reply_to for sent messages.
		// reply-to has precedence over everything else
		var addrVec = this._addrs[AjxEmailAddress.REPLY_TO];
	}
	if (!addrVec && this.isInvite() && this.needsRsvp()) {
		var invEmail = this.invite.getOrganizerEmail(0);
		if (invEmail) {
			return AjxVector.fromArray([new AjxEmailAddress(invEmail)]);
		}
	}

	if (!(addrVec && addrVec.size())) {
		if (mode == ZmOperation.REPLY_CANCEL || (this.isSent && mode == ZmOperation.REPLY_ALL)) {
			addrVec = this.isInvite() ? this._getAttendees() : this.getAddresses(AjxEmailAddress.TO, aliases, false, true);
		} else {
			addrVec = this.getAddresses(AjxEmailAddress.FROM, aliases, false, true);
			if (addrVec.size() == 0) {
				addrVec = this.getAddresses(AjxEmailAddress.TO, aliases, false, true);
			}
		}
	}
	return addrVec;
};

ZmMailMsg.prototype._getAttendees =
function() {
	var attendees = this.invite.components[0].at;
	var emails = new AjxVector();
	for (var i = 0; i < (attendees ? attendees.length : 0); i++) {
		var at = attendees[i];
		emails.add(new AjxEmailAddress(at.a, null, null, at.d));
	}

	return emails;
};

/**
 * Gets the first address in the vector of addresses of the given type.
 * 
 * @param	{constant}		type		the type
 * @return	{String}	the address
 */
ZmMailMsg.prototype.getAddress =
function(type) {
	return this._addrs[type].get(0);
};

/**
 * Gets the fragment. If maxLen is given, will truncate fragment to maxLen and add ellipsis.
 * 
 * @param	{int}	maxLen		the maximum length
 * @return	{String}	the fragment
 */
ZmMailMsg.prototype.getFragment =
function(maxLen) {
	var frag = this.fragment;

	if (maxLen && frag && frag.length) {
		frag = frag.substring(0, maxLen);
		if (this.fragment.length > maxLen)
			frag += "...";
	}
	return frag;
};

/**
 * Checks if the message is read only.
 * 
 * @return	{Boolean}	<code>true</code> if read only
 */
ZmMailMsg.prototype.isReadOnly =
function() {
	if (this._isReadOnly == null) {
		var folder = appCtxt.getById(this.folderId);
		this._isReadOnly = (folder ? folder.isReadOnly() : false);
	}
	return this._isReadOnly;
};

/**
 * Gets the header string.
 * 
 * @param	{constant}	hdr			the header (see <code>ZmMailMsg.HDR_</code> constants)
 * @param	{boolean}	htmlMode	if true, format as HTML
 * @return	{String}	the value
 */
ZmMailMsg.prototype.getHeaderStr =
function(hdr, htmlMode) {

	var key, value;
	if (hdr == ZmMailMsg.HDR_DATE) {
		if (this.sentDate) {
			var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
			value = formatter.format(new Date(this.sentDate));
		}
	} else if (hdr == ZmMailMsg.HDR_SUBJECT) {
		value = this.subject;
	} else {
		var addrs = this.getAddresses(hdr);
		value = addrs.toString(", ", true);
	}

	var key = ZmMailMsg.HDR_KEY[hdr] + ": ";
	if (!value) { return; }
	if (htmlMode) {
		key = "<b>" + key + "</b>";
		value = AjxStringUtil.convertToHtml(value);
	}

	return key + value;
};

/**
 * Checks if this message has html parts.
 * 
 * @return	{Boolean}	<code>true</code> if this message has HTML
 */
ZmMailMsg.prototype.isHtmlMail =
function() {
    if (this.isInvite()) {
		return this.invite.isHtmlInvite();
    }
    else {
        return this.getBodyPart(ZmMimeTable.TEXT_HTML) != null;
    }
};

// Setters

/**
 * Sets the vector of addresses of the given type to the given vector of addresses
 *
 * @param {constant}		type	the address type
 * @param {AjxVector}		addrs	a vector of {@link AjxEmailAddress}	objects
 */
ZmMailMsg.prototype.setAddresses =
function(type, addrs) {
	this._onChange("address", type, addrs);
	this._addrs[type] = addrs;
};

/**
 * Sets the vector of addresses of the given type to the address given.
 *
 * @param {constant}	type	the address type
 * @param {AjxEmailAddress}	addr	an address
 */
ZmMailMsg.prototype.setAddress =
function(type, addr) {
	this._onChange("address", type, addr);
	this._addrs[type].removeAll();
	this._addrs[type] = new AjxVector();
	this._addrs[type].add(addr);
};

/**
 * Clears out all the address vectors.
 * 
 */
ZmMailMsg.prototype.clearAddresses =
function() {
	for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		this._addrs[type].removeAll();
	}
};

/**
 * Adds the given vector of addresses to the vector of addresses of the given type
 *
 * @param {constant}	type	the address type
 * @param {AjxVector}	addrs	a vector of {@link AjxEmailAddress} objects
 */
ZmMailMsg.prototype.addAddresses =
function(type, addrs) {
	var size = addrs.size();
	for (var i = 0; i < size; i++) {
		this._addrs[type].add(addrs.get(i));
	}
};

/**
 * Adds the given address to the vector of addresses of the given type
 *
 * @param {AjxEmailAddress}	addr	an address
 */
ZmMailMsg.prototype.addAddress =
function(addr, type) {
	type = type || addr.type || AjxEmailAddress.TO;
	this._addrs[type].add(addr);
};

/**
 * Sets the subject
 *
 * @param	{String}	subject		the subject
 */
ZmMailMsg.prototype.setSubject =
function(subject) {
	this._onChange("subject", subject);
	this.subject = subject;
};

/**
 * Sets the message's top part to the given MIME part
 *
 * @param {String}	part	a MIME part
 */
ZmMailMsg.prototype.setTopPart =
function(part) {
	this._onChange("topPart", part);
	this._topPart = part;
};

/**
 * Sets the body parts.
 *  
 * @param	{array}	parts		an array of ZmMimePart
 * 
 */
ZmMailMsg.prototype.setBodyParts =
function(parts) {
	this._onChange("bodyParts", parts);
	this._bodyParts = parts;
    this._loaded = this._bodyParts.length > 0 || this.attachments.length > 0;
};

/**
* Sets the ID of any attachments which have already been uploaded.
*
* @param {String}	id		an attachment ID
*/
ZmMailMsg.prototype.addAttachmentId =
function(id) {
	if (this.attId) {
		id = this.attId + "," + id;
	}
	this._onChange("attachmentId", id);
	this.attId = id;
};

/**
 * Adds an inline attachment.
 * 
 * @param	{String}	cid		the content id
 * @param	{String}	aid		the attachment id
 * @param	{String}	part		the part
 * @param	{Boolean}	ismsg		if true, aid is a message id
 */
ZmMailMsg.prototype.addInlineAttachmentId =
function (cid, aid, part, ismsg) {
	if (!this._inlineAtts) {
		this._inlineAtts = [];
	}
	this._onChange("inlineAttachments",aid);
	if (ismsg && aid && part) {
		this._inlineAtts.push({"cid":cid, "mid":aid, "part": part});
	} else if (aid) {
		this._inlineAtts.push({"cid":cid, "aid":aid});
	} else if (part) {
		this._inlineAtts.push({"cid":cid, "part":part});
	}
};

ZmMailMsg.prototype._resetAllInlineAttachments =
function(){
    this._inlineAtts = [];
    for (var i = 0; i < this.attachments.length; i++) {
       this.attachments[i].foundInMsgBody = false;
    }
}

/**
 * Adds an inline document attachment.
 * 
 * @param	{String}	cid		the content id
 * @param	{String}	docId		the document id
 * @param	{String}	docpath		the document path
 * @param	{String}	part		the part
 */
ZmMailMsg.prototype.addInlineDocAttachment =
function (cid, docId, docpath, part) {
	if (!this._inlineDocAtts) {
		this._inlineDocAtts = [];
	}
	this._onChange("inlineDocAttachments", docId, docpath, part);
	if (docId) {
		this._inlineDocAtts.push({"cid":cid,"docid":docId});
	} else if (docpath) {
		this._inlineDocAtts.push({"cid":cid,"docpath":docpath});
	}else if (part) {
		this._inlineDocAtts.push({"cid":cid,"part":part});
	}
};

ZmMailMsg.prototype.setInlineAttachments =
function(inlineAtts){
	if (inlineAtts) {
		this._inlineAtts = inlineAtts;
	}
};

/**
 * Gets the inline attachments.
 * 
 * @return	{Array}	an array of attachments
 */
ZmMailMsg.prototype.getInlineAttachments =
function() {
	return this._inlineAtts || [];
};


/**
 * Gets the inline document attachments.
 * 
 * @return	{Array}	an array of attachments
 */
ZmMailMsg.prototype.getInlineDocAttachments =
function() {
	return this._inlineDocAtts || [];
};

/**
 * Finds the attachment in this message for the given CID.
 * 
 * @param	{String}	cid		the content id
 * @return	{Object}	the attachment or <code>null</code> if not found
 */
ZmMailMsg.prototype.findInlineAtt =
function(cid) {
	if (!(this.attachments && this.attachments.length)) { return null; }

	for (var i = 0; i < this.attachments.length; i++) {
		if (this.attachments[i].contentId == cid) {
			return this.attachments[i];
		}
	}
	return null;
};

/**
 * Sets the IDs of messages to attach (as a forward)
 *
 * @param {Array}	ids	a list of mail message IDs
 */
ZmMailMsg.prototype.setMessageAttachmentId =
function(ids) {
	this._onChange("messageAttachmentId", ids);
	this._msgAttIds = ids;
};

/**
 * Sets the IDs of docs to attach 
 *
 * @param {Array}	ids	a list of document IDs
 */
ZmMailMsg.prototype.setDocumentAttachments =
function(docs) {
	this._onChange("documentAttachmentId", docs);
	this._docAtts = docs;
};

ZmMailMsg.prototype.addDocumentAttachment =
function(doc) {
	if(!this._docAtts) {
		this._docAtts = [];
	}
	this._docAtts.push(doc);
};

/**
* Sets the list of attachment (message part) IDs to be forwarded
*
* @param {Array}	ids		a list of attachment IDs
*/
ZmMailMsg.prototype.setForwardAttIds =
function(ids) {
	this._onChange("forwardAttIds", ids);
	this._forAttIds = ids;
};

/**
* Sets the list of attachments details(message id and message part) to be forwarded
*
* @param {Array}	objs		a list of attachments details {id, part}
*/
ZmMailMsg.prototype.setForwardAttObjs =
function(objs) {
	this._forAttObjs = objs;
};

/**
* Sets the ID of the contacts that are to be attached as vCards
*
* @param {Array}	ids		a list of contact IDs
*/
ZmMailMsg.prototype.setContactAttIds =
function(ids) {
	ids = AjxUtil.toArray(ids);
	this._onChange("contactAttIds", ids);
	this._contactAttIds = ids;
};

// Actions

/**
 * Fills in the message from the given message node. Whatever attributes and child nodes
 * are available will be used. The message node is not always fully populated, since it
 * may have been created as part of getting a conversation.
 *
 * @param	{Object}	node		a message node
 * @param	{Hash}		args		a hash of arguments
 * @param	{Boolean}	noCache		if true, do not cache this message
 * @return	{ZmMailMsg}				the message
 */
ZmMailMsg.createFromDom =
function(node, args, noCache) {
	var msg = new ZmMailMsg(node.id, args.list, noCache);
	msg._loadFromDom(node);
	return msg;
};

/**
 * Gets the full message object from the back end based on the current message ID, and
 * fills in the message.
 *
 * @param {Hash}			params					a hash of parameters:
 * @param {Boolean}			params.getHtml			if <code>true</code>, try to fetch html from the server
 * @param {Boolean}			params.markRead			if <code>true</code>, mark msg read
 * @param {Boolean}			params.forceLoad		if <code>true</code>, get msg from server
 * @param {AjxCallback}		params.callback			the async callback
 * @param {AjxCallback}		params.errorCallback	the async error callback
 * @param {Boolean}			params.noBusyOverlay	if <code>true</code>, do not put up busy overlay during request
 * @param {Boolean}			params.noTruncate		if <code>true</code>, do not set max limit on size of msg body
 * @param {ZmBatchCommand}	params.batchCmd			if set, request gets added to this batch command
 * @param {String}			params.accountName		the name of the account to send request on behalf of
 * @param {boolean}			params.needExp			if not <code>false</code>, have server check if addresses are DLs
 */
ZmMailMsg.prototype.load =
function(params) {
	if (this._loading && !params.forceLoad) {
		//the only way to not get partial results is to try in some timeout.
		//this method will be called again, eventually, the message will be finished loading, and the callback would be called safely.
		this._loadingWaitCount = (this._loadingWaitCount || 0) + 1;
		if (this._loadingWaitCount > 20) {
			//give up after 20 timeouts (about 10 seconds) - maybe request got lost. send another request below.
			this._loadingWaitCount = 0;
			this._loading = false;
		}
		else {
			setTimeout(this.load.bind(this, params), 500);
			return;
		}
	}
	// If we are already loaded, then don't bother loading
	if (!this._loaded || params.forceLoad) {
		this._loading = true;
		var respCallback = this._handleResponseLoad.bind(this, params, params.callback);
		params.getHtml = params.getHtml || this.isDraft || appCtxt.get(ZmSetting.VIEW_AS_HTML);
		params.sender = appCtxt.getAppController();
		params.msgId = this.id;
		params.partId = this.partId;
		params.callback = respCallback;
		var errorCallback = this._handleResponseLoadFail.bind(this, params, params.errorCallback);
		params.errorCallback = errorCallback;
		ZmMailMsg.fetchMsg(params);
	} else {
		if (params.callback) {
			params.callback.run(new ZmCsfeResult()); // return exceptionless result
		}
	}
};

ZmMailMsg.prototype._handleResponseLoad =
function(params, callback, result) {
	var response = result.getResponse().GetMsgResponse;

	this.clearAddresses();

	// clear all participants (since it'll get re-parsed w/ diff. ID's)
	if (this.participants) {
		this.participants.removeAll();
	}

	this._loadFromDom(response.m[0]);
	if (!this.isReadOnly() && params.markRead) {
        this.markRead();
	} else {
        // Setup the _evt.item field and list._evt.item in order to insure proper notifications.
        this._setupNotify();
    }
	this.findAttsFoundInMsgBody();

	this._loading = false;
	
	// return result so callers can check for exceptions if they want
	if (this._loadCallback) {
		// overriding callback (see ZmMsgController::show)
		this._loadCallback.run(result);
		this._loadCallback = null;
	} else if (callback) {
		callback.run(result);
	}
};

ZmMailMsg.prototype.markRead = function() {
	if (!this.isReadOnly()) {
		//For offline mode keep isUnread property as true so that additional MsgActionRequest gets fired.
		//MsgActionRequest also gets stored in outbox queue and it also sends notify header for reducing the folder unread count.
		this._markReadLocal(!appCtxt.isWebClientOffline());
	}
};

ZmMailMsg.prototype._handleResponseLoadFail =
function(params, callback, result) {
    this._loading = false;
	if (callback) {
		return callback.run(result);
	}
};

ZmMailMsg.prototype._handleIndexedDBResponse =
function(params, requestParams, result) {

    var obj = result[0],
        msgNode,
        data = {},
        methodName = requestParams.methodName;

    if (obj) {
        msgNode = obj[obj.methodName]["m"];
        if (msgNode) {
            msgNode.su = msgNode.su._content;
            msgNode.fr = msgNode.mp[0].content._content;
            msgNode.mp[0].content = msgNode.fr;
            if (msgNode.fr) {
                msgNode.mp[0].body = true;
            }
            data[methodName.replace("Request", "Response")] = { "m" : [msgNode] };
            var csfeResult = new ZmCsfeResult(data);
            this._handleResponseLoad(params, params.callback, csfeResult);
        }
    }
};

ZmMailMsg.prototype.isLoaded =
function() {
	return this._loaded;
};

/**
 * Returns the list of body parts.
 * 
 * @param	{string}	contentType		preferred MIME type of alternative parts (optional)
 */
ZmMailMsg.prototype.getBodyParts =
function(contentType) {

	if (contentType) {
		this._lastContentType = contentType;
	}

	// no multi/alt, so we have a plain list
	if (!this.hasContentType(ZmMimeTable.MULTI_ALT)) {
		return this._bodyParts;
	}
	
	// grab the preferred type out of multi/alt parts
	contentType = contentType || this._lastContentType;
	var parts = [];
	for (var i = 0; i < this._bodyParts.length; i++) {
		var part = this._bodyParts[i];
		if (part.isZmMimePart) {
			parts.push(part);
		}
		else if (part) {
			// part is a hash of alternative parts by content type
			var altPart = contentType && part[contentType];
			parts.push(altPart || AjxUtil.values(part)[0]);
		}
	}
		
	return parts;
};

/**
 * Returns true if this msg has loaded a part with the given content type.
 * 
 * @param	{string}		contentType		MIME type
 */
ZmMailMsg.prototype.hasContentType =
function(contentType) {
	return this._contentType[contentType];
};

/**
 * Returns true is the msg has more than one body part. The server marks parts that
 * it considers to be body parts.
 * 
 * @return {boolean}
 */
ZmMailMsg.prototype.hasMultipleBodyParts =
function() {
	var parts = this.getBodyParts();
	return (parts && parts.length > 1);
};

/**
 * Returns the first body part, of the given type if provided. May invoke a
 * server call if it needs to fetch an alternative part.
 * 
 * @param	{string}		contentType		MIME type
 * @param	{callback}		callback		callback
 * 
 * @return	{ZmMimePart}					MIME part
 */
ZmMailMsg.prototype.getBodyPart =
function(contentType, callback) {

	if (contentType) {
		this._lastContentType = contentType;
	}

	function getPart(ct) {
		var bodyParts = this.getBodyParts(ct);
		for (var i = 0; i < bodyParts.length; i++) {
			var part = bodyParts[i];
			// should be a ZmMimePart, but check just in case
			part = part.isZmMimePart ? part : part[ct];
			if (!ct || (part.contentType === ct)) {
				return part;
			}
		}
	}
	var bodyPart = getPart.call(this, contentType);
	
	if (this.isInvite()) {
		if (!bodyPart) {
			if (contentType === ZmMimeTable.TEXT_HTML) {
				//text/html not available so look for text/plain
				bodyPart = getPart.call(this,ZmMimeTable.TEXT_PLAIN);
			} else if (contentType === ZmMimeTable.TEXT_PLAIN) {
				//text/plain not available so look for text/html
				bodyPart = getPart.call(this,ZmMimeTable.TEXT_HTML);
			}
		}
		// bug: 46071, handle missing body part/content
		if (!bodyPart || (bodyPart && !bodyPart.getContent())) {
			bodyPart = this.getInviteDescriptionContent(contentType);
		}
	}

	if (callback) {
		if (bodyPart) {
			callback.run(bodyPart);
		}
		// see if we should try to fetch an alternative part
		else if (this.hasContentType(ZmMimeTable.MULTI_ALT) &&
				((contentType == ZmMimeTable.TEXT_PLAIN && this.hasContentType(ZmMimeTable.TEXT_PLAIN)) ||
				 (contentType == ZmMimeTable.TEXT_HTML && this.hasContentType(ZmMimeTable.TEXT_HTML)))) {

			ZmMailMsg.fetchMsg({
				sender:		appCtxt.getAppController(),
				msgId:		this.id,
				getHtml:	(contentType == ZmMimeTable.TEXT_HTML),
				callback:	this._handleResponseFetchAlternativePart.bind(this, contentType, callback)
			});
		}
		else {
			callback.run();
		}
	}

	return bodyPart;
};

/**
  * Fetches the requested alternative part and adds it to our MIME structure, and body parts.
  * 
  * @param {string}		contentType		MIME type of part to fetch
  * @param {callback}	callback
  */
ZmMailMsg.prototype.fetchAlternativePart =
function(contentType, callback) {
	
	var respCallback = this._handleResponseFetchAlternativePart.bind(this, contentType, callback);
	ZmMailMsg.fetchMsg({
		sender:		appCtxt.getAppController(),
		msgId:		this.id,
		getHtml:	(contentType == ZmMimeTable.TEXT_HTML),
		callback:	respCallback
	});
};

ZmMailMsg.prototype._handleResponseFetchAlternativePart =
function(contentType, callback, result) {

	// look for first multi/alt with child of type we want, add it; assumes at most one multi/alt per msg
	var response = result.getResponse().GetMsgResponse;
	var altPart = this._topPart && this._topPart.addAlternativePart(response.m[0].mp[0], contentType, 0);
	if (altPart) {
		var found = false;
		for (var i = 0; i < this._bodyParts.length; i++) {
			var bp = this._bodyParts[i];
			// a hash rather than a ZmMimePart indicates multi/alt
			if (!bp.isZmMimePart) {
				bp[altPart.contentType] = altPart;
			}
		}
	}
		
	if (callback) {
		callback.run();
	}
};

/**
 * Gets the content of the first body part of the given content type (if provided).
 * If HTML is requested, may return content set via setHtmlContent().
 * 
 * @param	{string}	contentType		MIME type
 * @param	{boolean}	useOriginal		if true, do not grab the copy w/ the images defanged (HTML only)
 * 
 * @return	{string}					the content
 */
ZmMailMsg.prototype.getBodyContent =
function(contentType, useOriginal) {

	if (contentType) {
		this._lastContentType = contentType;
	}

	if (contentType == ZmMimeTable.TEXT_HTML && !useOriginal && this._htmlBody) {
		return this._htmlBody;
	}

	var bodyPart = this._loaded && this.getBodyPart(contentType);
	return bodyPart ? bodyPart.getContent() : "";
};

/**
 * Extracts and returns the text content out of a text/calendar part.
 * 
 * @param	{ZmMimePart}	bodyPart	a text/calendar MIME part
 * @return	{string}					text content
 */
ZmMailMsg.getTextFromCalendarPart =
function(bodyPart) {

	// NOTE: IE doesn't match multi-line regex, even when explicitly
	// specifying the "m" attribute.
	var bpContent = bodyPart ? bodyPart.getContent() : "";
	var lines = bpContent.split(/\r\n/);
	var desc = [];
	var content = "";
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line.match(/^DESCRIPTION:/)) {
			desc.push(line.substr(12));
			for (var j = i + 1; j < lines.length; j++) {
				line = lines[j];
				if (line.match(/^\s+/)) {
					desc.push(line.replace(/^\s+/, " "));
					continue;
				}
				break;
			}
			break;
		}
        else if (line.match(/^COMMENT:/)) {
            //DESCRIPTION is sent as COMMENT in Lotus notes.
            desc.push(line.substr(8));
            for (var j = i + 1; j < lines.length; j++) {
                line = lines[j];
                if (line.match(/^\s+/)) {
                    desc.push(line.replace(/^\s+/, " "));
                    continue;
                }
                break;
            }
            break;
        }
	}
	if (desc.length > 0) {
		content = desc.join("");
		content = content.replace(/\\t/g, "\t");
		content = content.replace(/\\n/g, "\n");
		content = content.replace(/\\(.)/g, "$1");
	}
	return content;
};

/**
 * Returns a text/plain or text-like (not HTML or calendar) body part
 * 
 * @return {ZmMimePart}		MIME part
 */
ZmMailMsg.prototype.getTextBodyPart =
function() {
	var bodyPart = this.getBodyPart(ZmMimeTable.TEXT_PLAIN) || this.getBodyPart();
	return (bodyPart && bodyPart.isBody && ZmMimeTable.isTextType(bodyPart.contentType)) ? bodyPart : null;
};

/**
 * Returns true if this message has an inline image
 * 
 * @return {boolean}
 */
ZmMailMsg.prototype.hasInlineImage =
function() {
	for (var i = 0; i < this._bodyParts.length; i++) {
		var bp = this._bodyParts[i];
		if (bp.isZmMimePart && bp.contentDisposition == "inline" && bp.fileName && ZmMimeTable.isRenderableImage(bp.contentType)) {
			return true;
		}
	}
	return false;
};

/**
 * Sets the html content, overriding that of any HTML body part.
 * 
 * @param	{string}	content		the HTML content
 */
ZmMailMsg.prototype.setHtmlContent =
function(content) {
	this._onChange("htmlContent", content);
	this._htmlBody = content;
};

/**
 * Sets the invite description.
 * 
 * @param {String}	contentType	the content type ("text/plain" or "text/html")
 * @param	{String}	content		the content
 */
ZmMailMsg.prototype.setInviteDescriptionContent =
function(contentType, content) {
	this._inviteDescBody[contentType] = content;
};

/**
 * Gets the invite description content value.
 *
 * @param {String}	contentType	the content type ("text/plain" or "text/html")
 * @return	{String}	the content value
 */
ZmMailMsg.prototype.getInviteDescriptionContentValue =
function(contentType) {
    return this._inviteDescBody[contentType];
}
/**
 * Gets the invite description content.
 * 
 * @param {String}	contentType	the content type ("text/plain" or "text/html")
 * @return	{String}	the content
 */
ZmMailMsg.prototype.getInviteDescriptionContent =
function(contentType) {

	if (!contentType) {
		contentType = ZmMimeTable.TEXT_HTML;
	}

	var desc = this._inviteDescBody[contentType];

	if (!desc) {
		var htmlContent =  this._inviteDescBody[ZmMimeTable.TEXT_HTML];
		var textContent =  this._inviteDescBody[ZmMimeTable.TEXT_PLAIN];

		if (!htmlContent && textContent) {
			htmlContent = AjxStringUtil.convertToHtml(textContent);
		}

		if (!textContent && htmlContent) {
			textContent = AjxStringUtil.convertHtml2Text(htmlContent);
		}

		desc = (contentType == ZmMimeTable.TEXT_HTML) ? htmlContent : textContent;
	}

	var idx = desc ? desc.indexOf(ZmItem.NOTES_SEPARATOR) : -1;

	if (idx == -1 && this.isInvite()) {
		var inviteSummary = this.invite.getSummary((contentType == ZmMimeTable.TEXT_HTML));
		desc = desc ? (inviteSummary + desc) : null;
	}

	if (desc != null) {
		var part = new ZmMimePart();
		part.contentType = part.ct = contentType;
		part.size = part.s = desc.length;
		part.node = {content: desc};
		return part;
	}
};

ZmMailMsg.prototype.sendInviteReply =
function(edited, componentId, callback, errorCallback, instanceDate, accountName, ignoreNotify) {
	this._origMsg = this._origMsg || this;
	if (componentId == 0){ // editing reply, custom message
		this._origMsg._customMsg = true;
	}
	this._sendInviteReply(edited, componentId || 0, callback, errorCallback, instanceDate, accountName, ignoreNotify);
};

ZmMailMsg.prototype._sendInviteReply =
function(edited, componentId, callback, errorCallback, instanceDate, accountName, ignoreNotify) {
	var jsonObj = {SendInviteReplyRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SendInviteReplyRequest;

	request.id = this._origMsg.id;
	request.compNum = componentId;

	var verb = "ACCEPT";
	var needsRsvp = true;
	var newPtst;

	var toastMessage; //message to display after action is done.
	
	switch (this.inviteMode) {
		case ZmOperation.REPLY_ACCEPT_IGNORE:				//falls-through on purpose
			needsRsvp = false;
		case ZmOperation.REPLY_ACCEPT_NOTIFY:               //falls-through on purpose
		case ZmOperation.REPLY_ACCEPT:
			verb = "ACCEPT";
			newPtst = ZmCalBaseItem.PSTATUS_ACCEPT;
			toastMessage = ZmMsg.inviteAccepted;
			break;
		case ZmOperation.REPLY_DECLINE_IGNORE:				//falls-through on purpose
			needsRsvp = false;
		case ZmOperation.REPLY_DECLINE_NOTIFY:              //falls-through on purpose
		case ZmOperation.REPLY_DECLINE:
			verb = "DECLINE";
			newPtst = ZmCalBaseItem.PSTATUS_DECLINED;
			toastMessage = ZmMsg.inviteDeclined;
			break;
		case ZmOperation.REPLY_TENTATIVE_IGNORE:            //falls-through on purpose
			needsRsvp = false;
		case ZmOperation.REPLY_TENTATIVE_NOTIFY:            //falls-through on purpose
		case ZmOperation.REPLY_TENTATIVE:
			verb = "TENTATIVE";
			newPtst = ZmCalBaseItem.PSTATUS_TENTATIVE;
			toastMessage = ZmMsg.inviteAcceptedTentatively;
			break;
	}
	request.verb = verb;

	var inv = this._origMsg.invite;
	//update the ptst to new one (we currently don't use the rest of the info in "replies" so it's ok to remove it for now)
	//note - this updated value is used later in _handleResponseSendInviteReply, and also in the list view when
	// re-displaying the message (not reloaded from server)
	if (newPtst) {
		inv.replies = [{
			reply: [{
				ptst: newPtst
			}]
		}];
		if (appCtxt.isWebClientOffline()) {
			// Update the offline entry and appt too.  Depending upon whether this is invoked from mail or appointments,
			// msgId will either be a single id, or the composite msg-appt id
			var msgId = inv.getMessageId();
			var invId = msgId;
			if (msgId.indexOf("-") >= 0) {
				// Composite id
				msgId = msgId.split("-")[1];
			} else {
				invId = [inv.getAppointmentId(), msgId].join("-");
			}
			var inviteUpdateCallback = this.applyPtstOffline.bind(this, msgId, newPtst);
			appCtxt.updateOfflineAppt(invId, "ptst", newPtst, null, inviteUpdateCallback);
		}
	}
	if (this.getAddress(AjxEmailAddress.TO) == null && !inv.isOrganizer()) {
		var to = inv.getOrganizerEmail() || inv.getSentBy();
		if (to == null) {
			var ac = window.parentAppCtxt || window.appCtxt;
			var mainAcct = ac.accountList.mainAccount.getEmail();
			var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
			//bug: 33639 when organizer component is missing from invitation
			if (from && from.address != mainAcct) {
				to = from.address;
			}
		}
		if (to) {
			this.setAddress(AjxEmailAddress.TO, (new AjxEmailAddress(to)));
		}
	}

    if(!this.identity) {
		var ac = window.parentAppCtxt || window.appCtxt;
		var account = (ac.multiAccounts && ac.getActiveAccount().isMain)
			? ac.accountList.defaultAccount : null;
		var identityCollection = ac.getIdentityCollection(account);
		this.identity = identityCollection ? identityCollection.selectIdentity(this._origMsg) : null;
	}

	if (this.identity) {
		request.idnt = this.identity.id;
	}

	if (ignoreNotify) { //bug 53974
		needsRsvp = false;
	}
	this._sendInviteReplyContinue(jsonObj, needsRsvp ? "TRUE" : "FALSE", edited, callback, errorCallback, instanceDate, accountName, toastMessage);
};

ZmMailMsg.prototype.applyPtstOffline = function(msgId, newPtst) {
	var applyPtstOfflineCallback = this._applyPtstOffline.bind(this, newPtst);
	ZmOfflineDB.getItem(msgId, ZmApp.MAIL, applyPtstOfflineCallback);
};
ZmMailMsg.prototype._applyPtstOffline = function(newPtst, result) {
	if (result && result[0] && result[0].inv && result[0].inv[0]) {
		var inv = result[0].inv[0];
		if (!inv.replies) {
			// See _sendInviteReply - patch the invite status
			inv.replies = [{
				reply: [{
					ptst: newPtst
				}]
			}];
		} else {
			inv.replies[0].reply[0].ptst = newPtst;
		}
		// Finally, Alter the offline folder - upon accepting an invite, it moves to the Trash folder
		result[0].l = ZmFolder.ID_TRASH;
		ZmOfflineDB.setItem(result, ZmApp.MAIL);

		// With the Ptst of an invite altered offline, move the message to trash locally
		var originalMsg = this._origMsg;
		originalMsg.moveLocal(ZmFolder.ID_TRASH);
		if (originalMsg.list) {
			originalMsg.list.moveLocal([originalMsg], ZmFolder.ID_TRASH);
		}
		var details = {oldFolderId:originalMsg.folderId};
		originalMsg._notify(ZmEvent.E_MOVE, details);

	}
}

ZmMailMsg.prototype._sendInviteReplyContinue =
function(jsonObj, updateOrganizer, edited, callback, errorCallback, instanceDate, accountName, toastMessage) {

	var request = jsonObj.SendInviteReplyRequest;
	request.updateOrganizer = updateOrganizer;

	if (instanceDate) {
		var serverDateTime = AjxDateUtil.getServerDateTime(instanceDate);
		var timeZone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
		var clientId = AjxTimezone.getClientId(timeZone);
		ZmTimezone.set(request, clientId, null, true);
		request.exceptId = {d:serverDateTime, tz:timeZone};
	}

	if (edited) {
		this._createMessageNode(request, null, accountName);
	}

	var respCallback = new AjxCallback(this, this._handleResponseSendInviteReply, [callback, toastMessage]);
    this._sendMessage({ jsonObj:jsonObj,
								isInvite:true,
								isDraft:false,
								callback:respCallback,
								errorCallback:errorCallback,
								accountName:accountName
                       });
};

ZmMailMsg.prototype._handleResponseSendInviteReply =
function(callback, toastMessage, result) {
	var resp = result.getResponse();

	var id = resp.id ? resp.id.split("-")[0] : null;
	var statusOK = (id || resp.status == "OK");

	if (statusOK) {
		this._notifySendListeners();
		this._origMsg.folderId = ZmFolder.ID_TRASH;
	}

	// allow or disallow move logic:
	var allowMove;
	if ((this.acceptFolderId != ZmOrganizer.ID_CALENDAR) ||
		(appCtxt.multiAccounts &&
			!this.getAccount().isMain &&
			this.acceptFolderId == ZmOrganizer.ID_CALENDAR))
	{
		allowMove = true;
	}

	if (this.acceptFolderId && allowMove && resp.apptId != null) {
		this.moveApptItem(resp.apptId, this.acceptFolderId);
	}

    if (window.parentController) {
		window.close();
	}

	if (toastMessage) {
		//note - currently this is not called from child window, but just in case it will in the future.
		var ctxt = window.parentAppCtxt || window.appCtxt; //show on parent window if this is a child window, since we close this child window on accept/decline/etc
		ctxt.setStatusMsg(toastMessage);
	}

	if (callback) {
		callback.run(result, this._origMsg.getPtst()); // the ptst was updated in _sendInviteReply
	}
};

/**
 * returns this user's reply to this invite.
 */
ZmMailMsg.prototype.getPtst =
function() {
	return this.invite && this.invite.replies && this.invite.replies[0].reply[0].ptst;
};

ZmMailMsg.APPT_TRASH_FOLDER = 3;

ZmMailMsg.prototype.isInviteCanceled =
function() {
	var invite = this.invite;
	if (!invite) {
		return false;
	}
	return invite.components[0].ciFolder == ZmMailMsg.APPT_TRASH_FOLDER;
};

ZmMailMsg.prototype.moveApptItem =
function(itemId, nfolder) {
	var callback = new AjxCallback(this, this._handleMoveApptResponse, [nfolder]);
	var errorCallback = new AjxCallback(this, this._handleMoveApptError, [nfolder]);
	var ac = window.parentAppCtxt || window.appCtxt;
	var accountName = ac.multiAccounts && ac.accountList.mainAccount.name;
	ZmItem.move(itemId, nfolder, callback, errorCallback, accountName);
};

ZmMailMsg.prototype._handleMoveApptResponse =
function(nfolder, resp) {
	this._lastApptFolder = nfolder;
	// TODO: Display some sort of confirmation?
};

ZmMailMsg.prototype._handleMoveApptError =
function(nfolder, resp) {
	var params = {
		msg:	ZmMsg.errorMoveAppt,
		level:	ZmStatusView.LEVEL_CRITICAL
	};
	appCtxt.setStatusMsg(params);
	return true;
};

/**
 * Sends the message.
 *
 * @param {Boolean}	isDraft				if <code>true</code>, this a draft
 * @param {AjxCallback}	callback			the callback to trigger after send
 * @param {AjxCallback}	errorCallback	the error callback to trigger
 * @param {String}	accountName			the account to send on behalf of
 * @param {Boolean}	noSave				if set, a copy will *not* be saved to sent regardless of account/identity settings
 * @param {Boolean}	requestReadReceipt	if set, a read receipt is sent to *all* recipients
 * @param {ZmBatchCommand} batchCmd		if set, request gets added to this batch command
 * @param {Date} sendTime				if set, tell server that this message should be sent at the specified time
 * @param {Boolean} isAutoSave          if <code>true</code>, this an auto-save draft
 */
ZmMailMsg.prototype.send =
function(isDraft, callback, errorCallback, accountName, noSave, requestReadReceipt, batchCmd, sendTime, isAutoSave) {

	var aName = accountName;
	if (!aName) {
		// only set the account name if this *isnt* the main/parent account
		var acct = appCtxt.getActiveAccount();
		if (acct && !acct.isMain) {
			aName = acct.name;
		}
	}
	// if we have an invite reply, we have to send a different message
	if (this.isInviteReply && !isDraft) {
		// TODO: support for batchCmd here as well
		return this.sendInviteReply(true, 0, callback, errorCallback, this._instanceDate, aName, false);
	} else {
		var jsonObj, request;
		if (isDraft) {
			jsonObj = {SaveDraftRequest:{_jsns:"urn:zimbraMail"}};
			request = jsonObj.SaveDraftRequest;
		} else {
			jsonObj = {SendMsgRequest:{_jsns:"urn:zimbraMail"}};
			request = jsonObj.SendMsgRequest;
			if (this.sendUID) {
				request.suid = this.sendUID;
			}
		}
		if (noSave) {
			request.noSave = 1;
		}
		this._createMessageNode(request, isDraft, aName, requestReadReceipt, sendTime);
		appCtxt.notifyZimlets("addExtraMsgParts", [request, isDraft]);
		var params = {
			jsonObj: jsonObj,
			isInvite: false,
			isDraft: isDraft,
			isAutoSave: isAutoSave,
			accountName: aName,
			callback: (new AjxCallback(this, this._handleResponseSend, [isDraft, callback])),
			errorCallback: errorCallback,
			batchCmd: batchCmd,
            skipOfflineCheck: true
		};
        this._sendMessage(params);
    }
};

ZmMailMsg.prototype._handleResponseSend =
function(isDraft, callback, result) {
	var resp = result.getResponse().m[0];

	// notify listeners of successful send message
	if (!isDraft) {
		if (resp.id || !appCtxt.get(ZmSetting.SAVE_TO_SENT)) {
			this._notifySendListeners();
		}
	} else {
		this._loadFromDom(resp);
		if (resp.autoSendTime) {
			this._notifySendListeners();
		}
	}

	if (callback) {
		callback.run(result);
	}
};

ZmMailMsg.prototype._createMessageNode =
function(request, isDraft, accountName, requestReadReceipt, sendTime) {

	var msgNode = request.m = {};
	var ac = window.parentAppCtxt || window.appCtxt;
	var activeAccount = ac.accountList.activeAccount;
	var mainAccount = ac.accountList.mainAccount;

	//When fwding an email in Parent's(main) account(main == active), but we are sending on-behalf-of child(active != accountName)
	var doQualifyIds = !ac.isOffline && accountName && mainAccount.name !== accountName;

	// if origId is given, means we're saving a draft or sending a msg that was
	// originally a reply/forward
	if (this.origId) {
         // always Qualify ID when forwarding mail using a child account
        if (appCtxt.isOffline) {
            var origAccount = this._origMsg && this._origMsg.getAccount();
            doQualifyIds = ac.multiAccounts  && origAccount.id == mainAccount.id;
        }
		var id = this.origId;
		if(doQualifyIds) {
			id = ZmOrganizer.getSystemId(this.origId, mainAccount, true);
		}
		msgNode.origid = id;
	}
	// if id is given, means we are re-saving a draft
	var oboDraftMsgId = null; // On Behalf of Draft MsgId
	if ((isDraft || this.isDraft) && this.id) {
		// bug fix #26508 - check whether previously saved draft was moved to Trash
		var msg = ac.getById(this.id);
		var folder = msg ? ac.getById(msg.folderId) : null;
		if (!folder || (folder && !folder.isInTrash())) {
			if (!ac.isOffline && !isDraft && this._origMsg && this._origMsg.isDraft) {
				var defaultAcct = ac.accountList.defaultAccount || ac.accountList.mainAccount;
				var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
				// this means we're sending a draft msg obo
				if (from && from.address != defaultAcct.getEmail()) {
					oboDraftMsgId = (this.id.indexOf(":") == -1)
						? ([defaultAcct.id, ":", this.id].join("")) : this.id;
					msgNode.id = oboDraftMsgId;
				} else {
					msgNode.id = this.nId;
				}
			} else {
				msgNode.id = this.nId;
			}

			if (!isDraft) { // not saveDraftRequest 
				var did = this.nId || this.id; // set draft id
				if (doQualifyIds) {
					did = ZmOrganizer.getSystemId(did, mainAccount, true);
				}
				msgNode.did = did;
			}
		}
	}

	if (this.isForwarded) {
		msgNode.rt = "w";
	} else if (this.isReplied) {
		msgNode.rt = "r";
	}
	if (this.identity) {
		msgNode.idnt = this.identity.id;
	}

	if (this.isHighPriority) {
		msgNode.f = ZmItem.FLAG_HIGH_PRIORITY;
	} else if (this.isLowPriority) {
		msgNode.f = ZmItem.FLAG_LOW_PRIORITY;
	}

	if (this.isPriority) {
	    msgNode.f = ZmItem.FLAG_PRIORITY;			
	}

    if (this.isOfflineCreated) {
        msgNode.f = msgNode.f || "";
        if (msgNode.f.indexOf(ZmItem.FLAG_OFFLINE_CREATED) === -1) {
            msgNode.f = msgNode.f + ZmItem.FLAG_OFFLINE_CREATED;
        }
    }
	
	var addrNodes = msgNode.e = [];
	for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		this._addAddressNodes(addrNodes, type, isDraft);
	}
	this._addFrom(addrNodes, msgNode, isDraft, accountName);
	this._addReplyTo(addrNodes);
	if (requestReadReceipt) {
		this._addReadReceipt(addrNodes, accountName);
	}
	if (addrNodes.length) {
		msgNode.e = addrNodes;
	}
	
	//Let Zimlets set custom mime headers. They need to push header-name and header-value like below:
	//customMimeHeaders.push({name:"header1", _content:"headerValue"})
	var customMimeHeaders = [];
	appCtxt.notifyZimlets("addCustomMimeHeaders", [customMimeHeaders]);
	if((customMimeHeaders instanceof Array) && customMimeHeaders.length > 0) {
		 msgNode.header = customMimeHeaders;
	}
	msgNode.su = {_content:this.subject};

	var topNode = {ct:this._topPart.getContentType()};
	msgNode.mp = [topNode];

	// if the top part has sub parts, add them as children
	var numSubParts = this._topPart.children ? this._topPart.children.size() : 0;
	if (numSubParts > 0) {
		var partNodes = topNode.mp = [];
		for (var i = 0; i < numSubParts; i++) {
			var part = this._topPart.children.get(i);
			var content = part.getContent();
			var numSubSubParts = part.children ? part.children.size() : 0;
			if (content == null && numSubSubParts == 0) { continue; }

			var partNode = {ct:part.getContentType()};

			if (numSubSubParts > 0) {
				// If each part again has subparts, add them as children
				var subPartNodes = partNode.mp = [];
				for (var j = 0; j < numSubSubParts; j++) {
					var subPart = part.children.get(j);
					subPartNodes.push({ct:subPart.getContentType(), content:{_content:subPart.getContent()}});
				}
				// Handle Related SubPart , a specific condition
				if (part.getContentType() == ZmMimeTable.MULTI_RELATED) {
					// Handle Inline Attachments
					var inlineAtts = this.getInlineAttachments() || [];
					if (inlineAtts.length) {
						for (j = 0; j < inlineAtts.length; j++) {
							var inlineAttNode = {ci:inlineAtts[j].cid};
							var attachNode = inlineAttNode.attach = {};
							if (inlineAtts[j].aid) {
								attachNode.aid = inlineAtts[j].aid;
							} else {
								var id = inlineAtts[j].mid
									|| (isDraft || this.isDraft)
									? (oboDraftMsgId || this.id || this.origId)
									: (this.origId || this.id);

								if (!id && this._origMsg) {
									id = this._origMsg.id;
								}
								if (id && doQualifyIds) {
									id = ZmOrganizer.getSystemId(id, mainAccount, true);
								}
								if(id) {
									attachNode.mp = [{mid:id, part:inlineAtts[j].part}];
								}
							}
							subPartNodes.push(inlineAttNode);
						}
					}
					// Handle Inline Attachments
					var inlineDocAtts = this.getInlineDocAttachments() || [];
					if (inlineDocAtts.length) {
						for (j = 0; j < inlineDocAtts.length; j++) {
							var inlineDocAttNode = {ci:inlineDocAtts[j].cid};
							var attachNode = inlineDocAttNode.attach = {};
							if (inlineDocAtts[j].docpath) {
								attachNode.doc = [{path: inlineDocAtts[j].docpath, optional:1 }];
							} else if (inlineDocAtts[j].docid) {
								attachNode.doc = [{id: inlineDocAtts[j].docid}];
							} 
							subPartNodes.push(inlineDocAttNode);
						}
					}
				}
			} else {
				partNode.content = {_content:content};
			}
			partNodes.push(partNode);
		}
	} else {
		topNode.content = {_content:this._topPart.getContent()};
	}

	if (this.irtMessageId) {
		msgNode.irt = {_content:this.irtMessageId};
	}

	if (this.attId ||
		(this._msgAttIds && this._msgAttIds.length) ||
		(this._docAtts && this._docAtts.length) ||
		(this._forAttIds && this._forAttIds.length) ||
		(this._contactAttIds && this._contactAttIds.length))
	{
		var attachNode = msgNode.attach = {};
		if (this.attId) {
			attachNode.aid = this.attId;
		}

		// attach mail msgs
		if (this._msgAttIds && this._msgAttIds.length) {
			var msgs = attachNode.m = [];
			for (var i = 0; i < this._msgAttIds.length; i++) {
				msgs.push({id:this._msgAttIds[i]});
			}
		}


		// attach docs
		if (this._docAtts) {
			var docs = attachNode.doc = [];
			for (var i = 0; i < this._docAtts.length; i++) {
                var d = this._docAtts[i];
                // qualify doc id
                var docId = (d.id.indexOf(":") == -1)
                        ? ([mainAccount.id, d.id].join(":")) : d.id;
                var props = {id: docId};
                if(d.ver) props.ver = d.ver;
				docs.push(props);
			}
		}

		// attach msg attachments
		if (this._forAttObjs && this._forAttObjs.length) {
			var parts = attachNode.mp = this._forAttObjs;
			if (doQualifyIds) {
				for (var i = 0; i < parts.length; i++) {
					var part = parts[i];
					part.mid = ZmOrganizer.getSystemId(part.mid, mainAccount, true);
				}
			}
		}

		if (this._contactAttIds && this._contactAttIds.length) {
			attachNode.cn = [];
			for (var i = 0; i < this._contactAttIds.length; i++) {
				attachNode.cn.push({id:this._contactAttIds[i]});
			}
		}
	}

	if (sendTime && sendTime.date) {
		var date = sendTime.date; // See ZmTimeDialog.prototype.getValue
		var timezone = sendTime.timezone || AjxTimezone.DEFAULT;
		var offset = AjxTimezone.getOffset(timezone, date);
		var utcEpochTime = date.getTime() - ((date.getTimezoneOffset() + offset) * 60 * 1000);
		// date.getTime() is the selected timestamp in local machine time (NOT UTC)
		// date.getTimezoneOffset() is negative minutes to UTC from local time (+ for West, - for East)
		// offset is minutes to UTC from selected time (- for West, + for East)
		msgNode.autoSendTime = utcEpochTime;
	}
};

/**
 * Sends this message to its recipients.
 *
 * @param params				[hash]			hash of params:
 *        jsonObj				[object]		JSON object
 *        isInvite				[boolean]		true if this message is an invite
 *        isDraft				[boolean]		true if this message is a draft
 *        callback				[AjxCallback]	async callback
 *        errorCallback			[AjxCallback]	async error callback
 *        batchCmd				[ZmBatchCommand]	if set, request gets added to this batch command
 *
 * @private
 */
ZmMailMsg.prototype._sendMessage =
function(params) {
	var respCallback = new AjxCallback(this, this._handleResponseSendMessage, [params]),
        offlineCallback = this._handleOfflineResponseSendMessage.bind(this, params);
    /* bug fix 63798 removing sync request and making it async
	// bug fix #4325 - its safer to make sync request when dealing w/ new window
	if (window.parentController) {
		var newParams = {
			jsonObj: params.jsonObj,
			accountName: params.accountName,
			errorCallback: params.errorCallback
		};
		var resp = appCtxt.getAppController().sendRequest(newParams);
		if (!resp) { return; } // bug fix #9154
		if (params.toastMessage) {
			parentAppCtxt.setStatusMsg(params.toastMessage); //show on parent window since this is a child window, since we close this child window on accept/decline/etc
		}

		if (resp.SendInviteReplyResponse) {
			return resp.SendInviteReplyResponse;
		} else if (resp.SaveDraftResponse) {
			resp = resp.SaveDraftResponse;
			this._loadFromDom(resp.m[0]);
			return resp;
		} else if (resp.SendMsgResponse) {
			return resp.SendMsgResponse;
		}
	} else if (params.batchCmd) {*/
    if  (params.batchCmd) {
		params.batchCmd.addNewRequestParams(params.jsonObj, respCallback, params.errorCallback);
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:params.jsonObj,
												asyncMode:true,
												noBusyOverlay:params.isDraft && params.isAutoSave,
												callback:respCallback,
												errorCallback:params.errorCallback,
                                                offlineCallback:offlineCallback,
												accountName:params.accountName,
                                                timeout: ( ( params.isDraft && this.attId ) ? 0 : null )
                                                });
	}
};

ZmMailMsg.prototype._handleResponseSendMessage =
function(params, result) {
	var response = result.getResponse();
	if (params.isInvite) {
		result.set(response.SendInviteReplyResponse);
	} else if (params.isDraft) {
		result.set(response.SaveDraftResponse);
	} else {
		result.set(response.SendMsgResponse);
	}
	if (params.callback) {
		params.callback.run(result);
	}
};

ZmMailMsg.prototype._handleOfflineResponseSendMessage =
function(params) {

    var jsonObj = $.extend(true, {}, params.jsonObj),//Always clone the object
        methodName = Object.keys(jsonObj)[0],
        msgNode = jsonObj[methodName].m,
        msgNodeAttach = msgNode.attach,
        origMsg = this._origMsg,
        currentTime = new Date().getTime(),
        callback,
        aid = [];
	var folderId = this.getFolderId();

    jsonObj.methodName = methodName;
    msgNode.d = currentTime; //for displaying date and time in the outbox/Drafts folder

    if (msgNodeAttach && msgNodeAttach.aid) {
        var msgNodeAttachIds = msgNodeAttach.aid.split(",");
        for (var i = 0; i < msgNodeAttachIds.length; i++) {
            var msgNodeAttachId = msgNodeAttachIds[i];
            if (msgNodeAttachId) {
                aid.push(msgNodeAttachId);
                msgNodeAttach[msgNodeAttachId] = appCtxt.getById(msgNodeAttachId);
                appCtxt.cacheRemove(msgNodeAttachId);
            }
        }
    }

    if (origMsg && origMsg.hasAttach) {//Always append origMsg attachments for offline handling
        var origMsgAttachments = origMsg.attachments;
        if (msgNodeAttach) {
            delete msgNodeAttach.mp;//Have to rewrite the code for including original attachments
        } else {
            msgNodeAttach = msgNode.attach = {};
        }
        for (var j = 0; j < origMsgAttachments.length; j++) {
            var node = origMsgAttachments[j].node;
            if (node && node.isOfflineUploaded) {
                aid.push(node.aid);
                msgNodeAttach[node.aid] = node;
            }
        }
    }

	if (msgNodeAttach) {
		if (aid.length > 0) {
			msgNodeAttach.aid = aid.join();
		}
		//If msgNodeAttach is an empty object then delete it
		if (Object.keys(msgNodeAttach).length === 0) {
			delete msgNode.attach;
		}
	}

    // Checking for inline Attachment
    if (this.getInlineAttachments().length > 0 || (origMsg && origMsg.getInlineAttachments().length > 0)) {
        msgNode.isInlineAttachment = true;
    }

    callback = this._handleOfflineResponseSendMessageCallback.bind(this, params, jsonObj);

	//For outbox item, message id will be always undefined.
	if (folderId == ZmFolder.ID_OUTBOX) {
		msgNode.id = origMsg && origMsg.id;
	}
    if (msgNode.id) { //Existing drafts created online or offline
        jsonObj.id = msgNode.id;
        var value = {
            update : true,
            methodName : methodName,
            id : msgNode.id,
            value : jsonObj
        };
        ZmOfflineDB.setItemInRequestQueue(value, callback);
    }
    else {
        jsonObj.id = msgNode.id = currentTime.toString(); //Id should be string
        msgNode.f = (msgNode.f || "").replace(ZmItem.FLAG_OFFLINE_CREATED, "").concat(ZmItem.FLAG_OFFLINE_CREATED);
        ZmOfflineDB.setItemInRequestQueue(jsonObj, callback);
    }
};

ZmMailMsg.prototype._handleOfflineResponseSendMessageCallback =
function(params, jsonObj) {

	var m = ZmOffline.generateMsgResponse(jsonObj);
    var data = {},
        header = this._generateOfflineHeader(params, jsonObj, m),
        notify = header.context.notify[0],
        result;
	if (!params.isInvite) {
		// If existing invite message - do not overwrite it.  The online code does not reload
		// the invite msg, it just patches it in-memory.  When the cal item ptst is patched in the db, it will
		// make a call to patch the invite too.
		ZmOfflineDB.setItem(m, ZmApp.MAIL);
	}

    data[jsonObj.methodName.replace("Request", "Response")] = notify.modified;
    result = new ZmCsfeResult(data, false, header);
    this._handleResponseSendMessage(params, result);
    appCtxt.getRequestMgr()._notifyHandler(notify);

    if (!params.isDraft && !params.isInvite) {
        var key = {
            methodName : "SaveDraftRequest",
            id : jsonObj[jsonObj.methodName].m.id
        };
        ZmOfflineDB.deleteItemInRequestQueue(key);//Delete any drafts for this message id
    }
};

ZmMailMsg.prototype._generateOfflineHeader =
function(params, jsonObj, m) {

    var folderArray = [],
        header = {
            context : {
                notify : [{
                    created : {
                        m : m
                    },
                    modified : {
                        folder : folderArray,
                        m : m
                    }
                }]
            }
        };

	if (!params.isInvite) {
		var folderId = this.getFolderId();
		if (params.isDraft || params.isAutoSave) {
			//For new auto save or draft folderId will not be equal to ZmFolder.ID_DRAFTS
			if (folderId != ZmFolder.ID_DRAFTS) {
				folderArray.push({
					id : ZmFolder.ID_DRAFTS,
					n : appCtxt.getById(ZmFolder.ID_DRAFTS).numTotal + 1
				});
			}
		}
		else {
			if (folderId != ZmFolder.ID_OUTBOX) {
				folderArray.push({
					id : ZmFolder.ID_OUTBOX,
					n : appCtxt.getById(ZmFolder.ID_OUTBOX).numTotal + 1
				});
			}
			if (folderId == ZmFolder.ID_DRAFTS) {
				folderArray.push({
					id : ZmFolder.ID_DRAFTS,
					n : appCtxt.getById(ZmFolder.ID_DRAFTS).numTotal - 1
				});
			}
		}
	}
    return header;
};

ZmMailMsg.prototype._notifySendListeners =
function() {
	var flag, msg;
	if (this.isForwarded) {
		flag = ZmItem.FLAG_FORWARDED;
		msg = this._origMsg;
	} else if (this.isReplied) {
		flag = ZmItem.FLAG_REPLIED;
		msg = this._origMsg;
	}

	if (flag && msg) {
		msg[ZmItem.FLAG_PROP[flag]] = true;
		if (msg.list) {
			msg.list._notify(ZmEvent.E_FLAGS, {items: [msg.list], flags: [flag]});
		}
	}
};

/**
 * from a child window - since we clone the message, the cloned message needs to listen to changes on the original (parent window) message.
 * @param ev
 */
ZmMailMsg.prototype.detachedChangeListener =
function(ev) {
	var parentWindowMsg = ev.item;
	//for now I only need it for keeping up with the isUnread and isFlagged status of the detached message. Keep it simple.
	this.isUnread = parentWindowMsg.isUnread;
	this.isFlagged = parentWindowMsg.isFlagged;
};



ZmMailMsg.prototype.isRealAttachment =
function(attachment) {
	var type = attachment.contentType;

	// bug fix #6374 - ignore if attachment is body unless content type is message/rfc822
	if (ZmMimeTable.isIgnored(type)) {
		return false;
	}

	// bug fix #8751 - dont ignore text/calendar type if msg is not an invite
	if (type == ZmMimeTable.TEXT_CAL && appCtxt.get(ZmSetting.CALENDAR_ENABLED) && this.isInvite()) {
		return false;
	}

	return true;
};

// this is a helper method to get an attachment url for multipart/related content
ZmMailMsg.prototype.getContentPartAttachUrl =
function(contentPartType, contentPart) {
	if (contentPartType != ZmMailMsg.CONTENT_PART_ID &&
		 				contentPartType != ZmMailMsg.CONTENT_PART_LOCATION) {
		return null;
	}
	var url = this._getContentPartAttachUrlFromCollection(this.attachments, contentPartType, contentPart);
	if (url) {
		return url;
	}
	return this._getContentPartAttachUrlFromCollection(this._bodyParts, contentPartType, contentPart);
};

ZmMailMsg.prototype._getContentPartAttachUrlFromCollection =
function(collection, contentPartType, contentPart) {
	if (!collection) {
		return null;
	}
	for (var i = 0; i < collection.length; i++) {
		var attach = collection[i];
		if (attach[contentPartType] == contentPart) {
            return this.getUrlForPart(attach);
		}
	}
	return null;
};


ZmMailMsg.prototype.findAttsFoundInMsgBody =
function() {
	if (this.findAttsFoundInMsgBodyDone) { return; }

	var content = "", cid;
	var bodyParts = this.getBodyParts();
	for (var i = 0; i < bodyParts.length; i++) {
		var bodyPart = bodyParts[i];
		if (bodyPart.contentType == ZmMimeTable.TEXT_HTML) {
			content = bodyPart.getContent();
			var msgRef = this;
			content.replace(/src=([\x27\x22])cid:([^\x27\x22]+)\1/ig, function(s, q, cid) {
				var attach = msgRef.findInlineAtt("<" + AjxStringUtil.urlComponentDecode(cid)  + ">");
				if (attach) {
					attach.foundInMsgBody = true;
				}
			});
		}
	}
	this.findAttsFoundInMsgBodyDone = true;
};

ZmMailMsg.prototype.hasInlineImagesInMsgBody =
function() {
	var body = this.getBodyContent(ZmMimeTable.TEXT_HTML);
	return (body && body.search(/src=([\x27\x22])cid:([^\x27\x22]+)\1/ig) != -1);
};

/**
 * Returns the number of attachments in this msg.
 * 
 * @param {boolean}		includeInlineAtts
 */
ZmMailMsg.prototype.getAttachmentCount =
function(includeInlineAtts) {
	var attachments = includeInlineAtts ? [].concat(this.attachments, this._getInlineAttachments()) : this.attachments;
	return attachments ? attachments.length : 0;
};

ZmMailMsg.prototype._getInlineAttachments =
function() {
	var atts = [];
	var parts = this.getBodyParts();
	if (parts && parts.length > 1) {
		var part;
		for (var k = 0; k < parts.length; k++) {
			part = parts[k];
			if (part.fileName && part.contentDisposition == "inline") {
				atts.push(part);
			}
		}
	}
	return atts;
};

/**
 * Returns an array of objects containing meta info about attachments
 */
ZmMailMsg.prototype.getAttachmentInfo =
function(findHits, includeInlineImages, includeInlineAtts) {

	this._attInfo = [];

	var attachments = (includeInlineAtts || includeInlineImages) ? [].concat(this.attachments, this._getInlineAttachments()) : this.attachments;
	if (attachments && attachments.length > 0) {
		this.findAttsFoundInMsgBody();

		for (var i = 0; i < attachments.length; i++) {
			var attach = attachments[i];

			if (!this.isRealAttachment(attach) ||
					(attach.contentType.match(/^image/) && attach.contentId && attach.foundInMsgBody && !includeInlineImages) ||
					(attach.contentDisposition == "inline" && attach.fileName && ZmMimeTable.isRenderable(attach.contentType, true) && !includeInlineAtts)) {
				continue;
			}

			var props = {};
			props.links = {};	// flags that indicate whether to include a certain type of link

			// set a viable label for this attachment
			props.label = attach.name || attach.fileName || (ZmMsg.unknown + " <" + attach.contentType + ">");

			// use content location instead of built href flag
			var useCL = false;
			// set size info if any
			props.sizeInBytes = attach.s || 0;
			if (attach.size != null && attach.size >= 0) {
				var numFormatter = AjxNumberFormat.getInstance();  
				if (attach.size < 1024) {
					props.size = numFormatter.format(attach.size) + " " + ZmMsg.b;
				}
				else if (attach.size < (1024 * 1024)) {
					props.size = numFormatter.format(Math.round((attach.size / 1024) * 10) / 10) + " " + ZmMsg.kb;
				}
				else {
					props.size = numFormatter.format(Math.round((attach.size / (1024 * 1024)) * 10) / 10) + " " + ZmMsg.mb;
				}
			}

			if (attach.part) {
				useCL = attach.contentLocation && (attach.relativeCl || ZmMailMsg.URL_RE.test(attach.contentLocation));
			} else {
				useCL = attach.contentLocation && true;
			}

			// see if rfc822 is an invite
			if (attach.contentType == ZmMimeTable.MSG_RFC822) {
				props.rfc822Part = attach.part;
				var calPart = (attach.children.size() == 1) && attach.children.get(0);
				if (appCtxt.get(ZmSetting.CALENDAR_ENABLED) && calPart && (calPart.contentType == ZmMimeTable.TEXT_CAL)) {
					props.links.importICS = true;
					props.rfc822CalPart = calPart.part;
				}
			} else {
				// set the anchor html for the link to this attachment on the server
				var url = useCL ? attach.contentLocation : this.getUrlForPart(attach);

				// bug fix #6500 - append filename w/in so "Save As" wont append .html at the end
				if (!useCL) {
					var insertIdx = url.indexOf("?auth=co&");
					var fn = AjxStringUtil.urlComponentEncode(attach.fileName);
					fn = fn.replace(/\x27/g, "%27");
					url = url.substring(0,insertIdx) + fn + url.substring(insertIdx);
				}
				if (!useCL) {
					props.links.download = true;
				}

				var folder = appCtxt.getById(this.folderId);
				if ((attach.name || attach.fileName) && appCtxt.get(ZmSetting.BRIEFCASE_ENABLED)) {
					if (!useCL) {
						props.links.briefcase = true;
					}
				}

				var isICSAttachment = (attach.fileName && attach.fileName.match(/\./) && attach.fileName.replace(/^.*\./, "").toLowerCase() == "ics");

				if (appCtxt.get(ZmSetting.CALENDAR_ENABLED) && ((attach.contentType == ZmMimeTable.TEXT_CAL) || isICSAttachment)) {
					props.links.importICS = true;
				}

				if (!useCL) {
					// check for vcard *first* since we dont care to view it in HTML
					if (ZmMimeTable.isVcard(attach.contentType)) {
						props.links.vcard = true;
					}
					else if (ZmMimeTable.hasHtmlVersion(attach.contentType) && appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)) {
						props.links.html = true;
					}
					else {
						// set the objectify flag
						var contentType = attach.contentType;
						props.objectify = contentType && contentType.match(/^image/) && !contentType.match(/tif/); //see bug 82807 - Tiffs are not really supported by browsers, so don't objectify.
					}
				} else {
					props.url = url;
				}

				if (attach.part) {
					// bug: 233 - remove attachment
					props.links.remove = true;
				}
			}

			// set the link icon
			var mimeInfo = ZmMimeTable.getInfo(attach.contentType);
			props.linkIcon = mimeInfo ? mimeInfo.image : "GenericDoc";
			props.ct = attach.contentType;

			// set other meta info
			props.isHit = findHits && this._isAttInHitList(attach);
			// S/MIME: recognize client-side generated attachments,
			// and stash the cache key for the applet in the part, as
			// it's the only data which we retain later on
			if (attach.part) {
				props.part = attach.part;
			} else {
				props.generated = true;
				props.part = attach.cachekey;
			}
			if (!useCL) {
                if (attach.node && attach.node.isOfflineUploaded) { //for offline upload attachments
                    props.url = attach.node.data;
                } else {
                    props.url = this.getUrlForPart(attach);
    			}
			}
			if (attach.contentId || (includeInlineImages && attach.contentDisposition == "inline")) {  // bug: 28741
				props.ci = true;
			}
            props.mid = this.id;
			props.foundInMsgBody = attach.foundInMsgBody;

			// and finally, add to attLink array
			this._attInfo.push(props);
		}
	}

	return this._attInfo;
};
ZmMailMsg.prototype.getAttachmentLinks = ZmMailMsg.prototype.getAttachmentInfo;

ZmMailMsg.prototype.removeAttachments =
function(partIds, callback) {
	var jsonObj = {RemoveAttachmentsRequest: {_jsns:"urn:zimbraMail"}};
	var request = jsonObj.RemoveAttachmentsRequest;
	request.m = {
		id:		this.id,
		part:	partIds.join(",")
	};

	var params = {
		jsonObj:		jsonObj,
		asyncMode:		true,
		callback:		callback,
		noBusyOverlay:	true
	};
	return appCtxt.getAppController().sendRequest(params);
};


// Private methods

/**
 * Processes a message node, getting attributes and child nodes to fill in the message.
 * This method may be called on an existing msg, since only metadata is returned when a
 * conv is expanded via SearchConvRequest. That is why we check values before setting
 * them, and why we don't clear out all the msg properties here first.
 */
ZmMailMsg.prototype._loadFromDom =
function(msgNode) {
	// this method could potentially be called twice (SearchConvResponse and
	// GetMsgResponse) so always check param before setting!
	if (msgNode.id)		{ this.id = msgNode.id; }
	if (msgNode.part)	{ this.partId = msgNode.part; }
	if (msgNode.cid) 	{ this.cid = msgNode.cid; }
	if (msgNode.s) 		{ this.size = msgNode.s; }
	if (msgNode.d) 		{ this.date = msgNode.d; }
	if (msgNode.sd) 	{ this.sentDate = msgNode.sd; }
	if (msgNode.l) 		{ this.folderId = msgNode.l; }
	if (msgNode.tn)		{ this._parseTagNames(msgNode.tn); }
	if (msgNode.cm) 	{ this.inHitList = msgNode.cm; }
	if (msgNode.su) 	{ this.subject = msgNode.su; }
	if (msgNode.fr) 	{ this.fragment = msgNode.fr; }
	if (msgNode.rt) 	{ this.rt = msgNode.rt; }
	if (msgNode.origid) { this.origId = msgNode.origid; }
	if (msgNode.hp) 	{ this._attHitList = msgNode.hp; }
	if (msgNode.mid)	{ this.messageId = msgNode.mid; }
	if (msgNode.irt)	{ this.irtMessageId = msgNode.irt; }
	if (msgNode._attrs) { this.attrs = msgNode._attrs; }
	if (msgNode.sf) 	{ this.sf = msgNode.sf; }
	if (msgNode.cif) 	{ this.cif = msgNode.cif; }
	if (msgNode.md) 	{ this.md = msgNode.md; }
	if (msgNode.ms) 	{ this.ms = msgNode.ms; }
	if (msgNode.rev) 	{ this.rev = msgNode.rev; }

    if (msgNode.idnt)	{
        var identityColl = appCtxt.getIdentityCollection();
        this.identity = identityColl && identityColl.getById(msgNode.idnt);
    }

    //Copying msg. header's
	if (msgNode.header) {
		this.headers = {};
		for (var i = 0; i < msgNode.header.length; i++) {
			this.headers[msgNode.header[i].n] = msgNode.header[i]._content;
		}
	}

	//Grab the metadata, keyed off the section name
	if (msgNode.meta) {
		this.meta = {};
		for (var i = 0; i < msgNode.meta.length; i++) {
			var section = msgNode.meta[i].section;
			this.meta[section] = {};
			this.meta[section]._attrs = {};
			for (a in msgNode.meta[i]._attrs) {
				this.meta[section]._attrs[a] = msgNode.meta[i]._attrs[a];
			}
		}
	}

	// set the "normalized" Id if this message belongs to a shared folder
	var idx = this.id.indexOf(":");
	this.nId = (idx != -1) ? (this.id.substr(idx + 1)) : this.id;

	if (msgNode._convCreateNode) {
		this._convCreateNode = msgNode._convCreateNode;
	}

	if (msgNode.cid && msgNode.l) {
		var conv = appCtxt.getById(msgNode.cid);
		if (conv) {
			// update conv's folder list
			if (conv.folders) {
				conv.folders[msgNode.l] = true;
			}
			var folders = AjxUtil.keys(conv.folders);
			AjxDebug.println(AjxDebug.NOTIFY, "update conv folder list: conv spans " + folders.length + " folder(s): " + folders.join(" "));
			// update msg list if none exists since we know this conv has at least one msg
			if (!conv.msgIds) {
				conv.msgIds = [this.id];
			}
            
            if(conv.isMute) {
                this.isMute = true;
            }
		}
	}

	// always call parseFlags even if server didn't return any
	this._parseFlags(msgNode.f);

	if (msgNode.mp) {
		// clear all attachments and body data
		this.attachments = [];
		this._bodyParts = [];
		this._contentType = {};
		this.findAttsFoundInMsgBodyDone = false;
		var ctxt = {
			attachments:	this.attachments,
			bodyParts:		this._bodyParts,
			contentTypes:	this._contentType
		};
		this._topPart = ZmMimePart.createFromDom(msgNode.mp[0], ctxt);
		this._loaded = this._bodyParts.length > 0 || this.attachments.length > 0;
		this._cleanupCIds();
	}

	if (msgNode.shr) {
		// TODO: Make server output better msgNode.shr property...
		var shareXmlDoc = AjxXmlDoc.createFromXml(msgNode.shr[0].content);
		try {
			AjxDispatcher.require("Share");
			this.share = ZmShare.createFromDom(shareXmlDoc.getDoc());
			this.share._msgId = msgNode.id;
		} catch (ex) {
			// not a version we support, ignore
		}
	}
	if (msgNode.dlSubs) {
		var dlSubsXmlDoc = AjxXmlDoc.createFromXml(msgNode.dlSubs[0].content);
		try {
			this.subscribeReq = ZmMailMsg.createDlSubFromDom(dlSubsXmlDoc.getDoc());
			this.subscribeReq._msgId = msgNode.id;
		}
		catch (ex) {
			// not a version we support, or missing element, ignore  - Not sure I like this approach but copying Share - Eran
			DBG.println(AjxDebug.DBG1, "createDlSubFromDom failed, content is:" + msgNode.dlSubs[0].content + " ex:" + ex);
		}
	}

	if (msgNode.e && this.participants && this.participants.size() == 0) {
		for (var i = 0; i < msgNode.e.length; i++) {
			this._parseParticipantNode(msgNode.e[i]);
		}
		this.clearAddresses();
		var parts = this.participants.getArray();
		for (var j = 0; j < parts.length; j++ ) {
			this.addAddress(parts[j]);
		}
	}

	if (msgNode.autoSendTime) {
		var timestamp = parseInt(msgNode.autoSendTime) || null;
		if (timestamp) {
			this.setAutoSendTime(new Date(timestamp));
		}
	}

	if (msgNode.inv) {
		try {
			this.invite = ZmInvite.createFromDom(msgNode.inv);
            if (this.invite.isEmpty()) return;
			this.invite.setMessageId(this.id);
			// bug fix #18613
			var desc = this.invite.getComponentDescription();
			var descHtml = this.invite.getComponentDescriptionHtml();
			if (descHtml) {
				this.setHtmlContent(descHtml);
				this.setInviteDescriptionContent(ZmMimeTable.TEXT_HTML, descHtml);
			}

			if (desc) {
				this.setInviteDescriptionContent(ZmMimeTable.TEXT_PLAIN, desc);
			}

			if (!appCtxt.get(ZmSetting.CALENDAR_ENABLED) && this.invite.type == "appt") {
				this.flagLocal(ZmItem.FLAG_ATTACH, true);
			}

		} catch (ex) {
			// do nothing - this means we're trying to load an ZmInvite in new
			// window, which we dont currently load (re: support).
		}
	}
	//S/MIME: Set mail's S/MIME related info
	if (msgNode.certificate) {
		this.certificate = msgNode.certificate;
	}
	if (msgNode.isSigned) {
		this.isSigned = msgNode.isSigned == "true";
	}
	if (msgNode.isEncrypted) {
		this.isEncrypted = msgNode.isEncrypted == "true";
	}
	if (msgNode.decryptionErrorCode) {
		this.decryptionErrorCode = msgNode.decryptionErrorCode;
	}
};

ZmMailMsg.createDlSubFromDom =
function(doc) {
	// NOTE: This code initializes DL subscription info from the Zimbra dlSub format, v0.1
	var sub = {};

	var node = doc.documentElement;
	sub.version = node.getAttribute("version");
	sub.subscribe = node.getAttribute("action") == "subscribe";
	if (sub.version != ZmMailMsg.DL_SUB_VERSION) {
		throw "Zimbra dl sub version must be " + ZmMailMsg.DL_SUB_VERSION;
	}

	for (var child = node.firstChild; child != null; child = child.nextSibling) {
		if (child.nodeName != "dl" && child.nodeName != "user") {
			continue;
		}
		sub[child.nodeName] = {
			id: child.getAttribute("id"),
			email: child.getAttribute("email"),
			name: child.getAttribute("name")
		};
	}
	if (!sub.dl) {
		throw "missing dl element";
	}
	if (!sub.user) {
		throw "missing user element";
	}

	return sub;
};

ZmMailMsg.prototype.hasNoViewableContent =
function() {
	if (this.isRfc822) {
		//this means this message is not the top level one - but rather an attached message.
		return false; //till I can find a working heuristic that is not the fragment - size does not work as it includes probably stuff like subject and email addresses, and it's always bigger than 0.
	}
	var hasInviteContent = this.invite && !this.invite.isEmpty();
	//the general case - use the fragment, so that cases where the text is all white space are taken care of as "no content".
	return !this.fragment && !hasInviteContent && !this.hasInlineImagesInMsgBody() && !this.hasInlineImage()
};

ZmMailMsg.prototype._cleanupCIds =
function(atts) {
	atts = atts || this.attachments;
	if (!atts || atts.length == 0) { return; }

	for (var i = 0; i < atts.length; i++) {
		var att = atts[i];
		if (att.contentId && !/^<.+>$/.test(att.contentId)) {
			att.contentId = '<' + att.contentId + '>';
		}
	}
};

ZmMailMsg.prototype.mute =
function () {
	this.isMute = true;
};

ZmMailMsg.prototype.unmute =
function () {
	this.isMute = false;
};

ZmMailMsg.prototype.isInvite =
function () {
	return (this.invite != null);
};

ZmMailMsg.prototype.forwardAsInvite =
function () {
	if(!this.invite) {
		return false;
	}
	return this.invite.getInviteMethod() == "REQUEST";
};

ZmMailMsg.prototype.needsRsvp =
function () {
	if (!this.isInvite() || this.invite.isOrganizer()) { return false; }

	var needsRsvp = false;
	var accEmail = appCtxt.getActiveAccount().getEmail();
	if (this.isInvite()) {
		var at = this.invite.getAttendees();
		for (var i in at) {
			if (at[i].url == accEmail) {
				return at[i].rsvp;
			}
			if (at[i].rsvp) {
				needsRsvp = true;
			}
		}
		at = this.invite.getResources();
		for (var i in at) {
			if (at[i].url == accEmail) {
				return at[i].rsvp;
			}
			if (at[i].rsvp) {
				needsRsvp = true;
			}
		}
	}

	return needsRsvp;
};

// Adds child address nodes for the given address type.
ZmMailMsg.prototype._addAddressNodes =
function(addrNodes, type, isDraft) {

	var addrs = this._addrs[type];
	var num = addrs.size();
	var contactsApp;
	if (num) {
		if (appCtxt.isOffline) {
            contactsApp = appCtxt.getApp(ZmApp.CONTACTS)
        } else {
		    contactsApp = appCtxt.get(ZmSetting.CONTACTS_ENABLED) && appCtxt.getApp(ZmApp.CONTACTS);
        }
        if (contactsApp && !contactsApp.isContactListLoaded()) {
            contactsApp = null;
        }
		for (var i = 0; i < num; i++) {
			var addr = addrs.get(i);
			addr = addr.isAjxEmailAddress ? addr : AjxEmailAddress.parse(addr);
			if (addr) {
				var email = addr.getAddress();
				var name = addr.getName();
				var addrNode = {t:AjxEmailAddress.toSoapType[type], a:email};
				if (name) {
					addrNode.p = name;
				}
				addrNodes.push(addrNode);
			}
		}
	}
};

ZmMailMsg.prototype._addFrom =
function(addrNodes, parentNode, isDraft, accountName) {
	var ac = window.parentAppCtxt || window.appCtxt;

	// only use account name if we either dont have any identities to choose
	// from or the one we have is the default anyway
	var identity = this.identity;
	var isPrimary = identity == null || identity.isDefault;
	if (this.delegatedSenderAddr && !this.delegatedSenderAddrIsDL) {
		isPrimary = false;
	}

	// If repying to an invite which was addressed to user's alias then accept
	// reply should appear from the alias
	if (this._origMsg && this._origMsg.isInvite() &&
		this.isReplied &&
		(!this._origMsg._customMsg || !identity)) // is default reply or has no identities.
	{
		var origTos =  this._origMsg._getAttendees();
		var size = origTos && origTos.size() > 0 ? origTos.size() : 0;
		var aliazesString = "," + appCtxt.get(ZmSetting.MAIL_ALIASES).join(",") + ",";
		for (var i = 0; i < size; i++) {
			var origTo = origTos.get(i).address;
			if (origTo && aliazesString.indexOf("," + origTo + ",") >= 0) {
				var addrNode = {t:"f", a:origTo};
				addrNodes.push(addrNode);
				return; // We have already added appropriate alias as a "from". return from here.
			}
		}
	}

	//TODO: OPTIMIZE CODE by aggregating the common code.
	if (!appCtxt.isOffline && accountName && isPrimary) {
		var mainAcct = ac.accountList.mainAccount.getEmail();
		var onBehalfOf = false;

		var folder = appCtxt.getById(this.folderId);
		if ((!folder || folder.isRemote()) && (!this._origMsg || !this._origMsg.sendAsMe)) {
			accountName = (folder && folder.getOwner()) || accountName;
			onBehalfOf  = (accountName != mainAcct);
		}

		if (this._origMsg && this._origMsg.isDraft && !this._origMsg.sendAsMe) {
			var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
			// this means we're sending a draft msg obo so reset account name
			if (from && from.address.toLowerCase() != mainAcct.toLowerCase()) {
				accountName = from.address;
				onBehalfOf = true;
			}
		}

		// bug #44857 - replies/forwards should save sent message into respective account
		if (!onBehalfOf && appCtxt.isFamilyMbox && this._origMsg && folder) {
			onBehalfOf = (folder.getOwner() != mainAcct);
		}

		var addr, displayName;
		if (this.fromSelectValue) {
			addr = this.fromSelectValue.addr.address;
			displayName = this.fromSelectValue.addr.name;
		} else if (this._origMsg && this._origMsg.isInvite() && appCtxt.multiAccounts) {
			identity = this._origMsg.getAccount().getIdentity();
			addr = identity ? identity.sendFromAddress : this._origMsg.getAccount().name;
			displayName = identity && identity.sendFromDisplay;
		} else {
			if (onBehalfOf) {
				addr = accountName;
			} else {
				addr = identity ? identity.sendFromAddress : (this.delegatedSenderAddr || accountName);
                onBehalfOf = this.isOnBehalfOf;
				displayName = identity && identity.sendFromDisplay;
			}
		}

		var node = {t:"f", a:addr};
		if (displayName) {
			node.p = displayName;
		}
		addrNodes.push(node);
		if (onBehalfOf || !(ac.multiAccounts || isDraft)) {
			// the main account is *always* the sender
			addrNodes.push({t:"s", a:mainAcct});
		}
	} else{

		var mainAcct = ac.accountList.mainAccount.getEmail();
		var onBehalfOf = false;

		var folder = appCtxt.getById(this.folderId);
		if (folder && folder.isRemote() && !this._origMsg.sendAsMe) {
			accountName = folder.getOwner();
			onBehalfOf  = (accountName != mainAcct);
		}

		if (this._origMsg && this._origMsg.isDraft && !this._origMsg.sendAsMe) {
			var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
			// this means we're sending a draft msg obo so reset account name
			if (from && from.address.toLowerCase() != mainAcct.toLowerCase() && !appCtxt.isMyAddress(from.address.toLowerCase())) {
				accountName = from.address;
				onBehalfOf = true;
			}
		}

		var addr, displayName;
		if (onBehalfOf) {
			addr = accountName;
		} else if (identity) {
            if (identity.sendFromAddressType == ZmSetting.SEND_ON_BEHALF_OF){
                addr = identity.sendFromAddress.replace(ZmMsg.onBehalfOfMidLabel + " ", "");
                onBehalfOf = true;
            } else {
			    addr = identity.sendFromAddress || mainAcct;
            }
            displayName = identity.sendFromDisplay;

		} else {
           addr = this.delegatedSenderAddr || mainAcct;
           onBehalfOf = this.isOnBehalfOf;
        }

		var addrNode = {t:"f", a:addr};
		if( displayName) {
			addrNode.p = displayName;
		}
		addrNodes.push(addrNode);

		if (onBehalfOf) {
			addrNodes.push({t:"s", a:mainAcct});
		}

		if (identity && identity.isFromDataSource) {
			var dataSource = ac.getDataSourceCollection().getById(identity.id);
			if (dataSource) {
				// mail is "from" external account
				addrNode.t = "f";
				addrNode.a = dataSource.getEmail();
				if (ac.get(ZmSetting.DEFAULT_DISPLAY_NAME)) {
					var dispName = dataSource.identity && dataSource.identity.sendFromDisplay;
					addrNode.p = dispName || dataSource.userName || dataSource.getName();
				}
			}
		}
	}
};

ZmMailMsg.prototype._addReplyTo =
function(addrNodes) {
	if (this.identity) {
		if (this.identity.setReplyTo && this.identity.setReplyToAddress) {
			var addrNode = {t:"r", a:this.identity.setReplyToAddress};
			if (this.identity.setReplyToDisplay) {
				addrNode.p = this.identity.setReplyToDisplay;
			}
			addrNodes.push(addrNode);
		}
	}
};

ZmMailMsg.prototype._addReadReceipt =
function(addrNodes, accountName) {
	var addrNode = {t:"n"};
	var identity = this.identity;
	var ac = window.parentAppCtxt || window.appCtxt;

	if (identity) {
		addrNode.a = identity.readReceiptAddr || identity.sendFromAddress;
		addrNode.p = identity.sendFromDisplay;

		// ZCS-1874, if read receipt is for external POP/IMAP account then set proper email and display name
		if (identity.isFromDataSource) {
			var dataSource = ac.getDataSourceCollection().getById(identity.id);
			if (dataSource) {
				// mail is "from" external account
				addrNode.a = dataSource.getEmail();
				if (ac.get(ZmSetting.DEFAULT_DISPLAY_NAME)) {
					var dispName = dataSource.identity && dataSource.identity.sendFromDisplay;
					addrNode.p = dispName || dataSource.userName || dataSource.getName();
				}
			}
		}
	} else {
		addrNode.a = accountName || appCtxt.getActiveAccount().getEmail();
	}
	addrNodes.push(addrNode);
};

ZmMailMsg.prototype._isAttInHitList =
function(attach) {
	for (var i = 0; i < this._attHitList.length; i++) {
		if (attach.part == this._attHitList[i].part) { return true; }
	}

	return false;
};

ZmMailMsg.prototype._onChange =
function(what, a, b, c) {
	if (this.onChange) {
		this.onChange.run(what, a, b, c);
	}
};

/**
 * Gets the status icon.
 * 
 * @return	{String}	the icon
 */
ZmMailMsg.prototype.getStatusIcon =
function() {

	if (this.isInvite() && appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		var method = this.invite.getInviteMethod();
		var status;
		if (method == ZmCalendarApp.METHOD_REPLY) {
			var attendees = this.invite.getAttendees();
			status = attendees && attendees[0] && attendees[0].ptst;
		} else if (method == ZmCalendarApp.METHOD_CANCEL) {
			status = ZmMailMsg.PSTATUS_DECLINED;
		}
		return ZmMailMsg.STATUS_ICON[status] || "Appointment";
	}

	for (var i = 0; i < ZmMailMsg.STATUS_LIST.length; i++) {
		var status = ZmMailMsg.STATUS_LIST[i];
		if (this[status]) {
			return ZmMailMsg.STATUS_ICON[status];
		}
	}

	return "MsgStatusRead";
};

/**
 * Gets the status tool tip.
 * 
 * @return	{String}	the tool tip
 */
ZmMailMsg.prototype.getStatusTooltip =
function() {
	// keep in sync with ZmConv.prototype.getStatusTooltip
	var status = [];
	if (this.isInvite()) {
		var icon = this.getStatusIcon();
		status.push(ZmMailMsg.TOOLTIP[icon]);
	}
	if (this.isScheduled)	{ status.push(ZmMsg.scheduled); }
	if (this.isUnread)		{ status.push(ZmMsg.unread); }
	if (this.isReplied)		{ status.push(ZmMsg.replied); }
	if (this.isForwarded)	{ status.push(ZmMsg.forwarded); }
	if (this.isDraft) {
		status.push(ZmMsg.draft);
	}
	else if (this.isSent) {
		status.push(ZmMsg.sentAt); //sentAt is for some reason "sent", which is what we need.
	}
	if (status.length == 0) {
		status = [ZmMsg.read];
	}

	return status.join(", ");
};

ZmMailMsg.prototype.notifyModify =
function(obj, batchMode) {
	if (obj.cid != null) {
		this.cid = obj.cid;
	}

	return ZmMailItem.prototype.notifyModify.apply(this, arguments);
};

ZmMailMsg.prototype.isResourceInvite =
function() {
	if (!this.cif || !this.invite) { return false; }

	var resources = this.invite.getResources();
	for (var i in resources) {
		if (resources[i] && resources[i].url == this.cif) {
			return true;
		}
	}
	return false;
};

ZmMailMsg.prototype.setAutoSendTime =
function(autoSendTime) {
    this._setAutoSendTime(autoSendTime);
};

ZmMailMsg.prototype._setAutoSendTime =
function(autoSendTime) {
	ZmMailItem.prototype.setAutoSendTime.call(this, autoSendTime);
	var conv = this.cid && appCtxt.getById(this.cid);
	if (Dwt.instanceOf(conv, "ZmConv")) {
		conv.setAutoSendTime(autoSendTime);
	}
};

/**
 * Sends a read receipt.
 * 
 * @param {closure}	callback	response callback
 */
ZmMailMsg.prototype.sendReadReceipt =
function(callback) {

	var jsonObj = {SendDeliveryReportRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SendDeliveryReportRequest;
	request.mid = this.id;
	var ac = window.parentAppCtxt || window.appCtxt;
	ac.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:callback});
};


// Execute the mail redirect server side call
ZmMailMsg.prototype.redirect =
function(addrs, callback) {

	var jsonObj = {BounceMsgRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.BounceMsgRequest;
	request.m = {id:this.id};
	var e = request.m.e = [];
	for (var iType = 0; iType < ZmMailMsg.COMPOSE_ADDRS.length; iType++) {
		if (addrs[ZmMailMsg.COMPOSE_ADDRS[iType]]) {
			var all =  addrs[ZmMailMsg.COMPOSE_ADDRS[iType]].all;
			for (var i = 0, len = all.size(); i < len; i++) {
				var addr = all.get(i);
				var rType = AjxEmailAddress.toSoapType[addr.type];
				e.push({t:rType, a:addr.address});
			}
		}
	}

    // No Success callback, nothing of interest returned
    var acct = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
    appCtxt.getAppController().sendRequest({
        jsonObj:       jsonObj,
        asyncMode:     true,
        accountName:   acct,
        callback:      callback
    });
};

ZmMailMsg.prototype.doDelete =
function() {
	var params = {jsonObj:{MsgActionRequest:{_jsns:"urn:zimbraMail",action:{id:this.id, op:"delete"}}}, asyncMode:true};

	// Bug 84549: The params object is a property of the child window, because it
	// was constructed using this window's Object constructor. But when the child
	// window closes immediately after the request is sent, the object would be 
	// garbage-collected by the browser (or otherwise become invalid).
	// Therefore, we need to pass an object that is native to the parent window
	if (appCtxt.isChildWindow && (AjxEnv.isIE || AjxEnv.isModernIE)) {
		var cp = function(from){
			var to = window.opener.Object();
			for (var key in from) {
				var value = from[key];
				to[key] = (AjxUtil.isObject(value)) ? cp(value) : value;
			}
			return to;
		};
		params = cp(params);
	}

	var ac = window.parentAppCtxt || window.appCtxt;
	ac.getRequestMgr().sendRequest(params);
};

/**
 * If message is sent on behalf of returns sender address otherwise returns from address
 * @return {String} email address
 */
ZmMailMsg.prototype.getMsgSender = 
function() {
	var from = this.getAddress(AjxEmailAddress.FROM);
	var sender = this.getAddress(AjxEmailAddress.SENDER);
	if (sender && sender.address != (from && from.address)) {
		return sender.address;
	}
	return from && from.address;
};

/**
 * Return list header id if it exists, otherwise returns null
 * @return {String} list id
 */
ZmMailMsg.prototype.getListIdHeader = 
function() {
	var id = null;
	if (this.attrs && this.attrs[ZmMailMsg.HDR_LISTID]) {
		//extract <ID> from header
		var listId = this.attrs[ZmMailMsg.HDR_LISTID];
		id = listId.match(/<(.*)>/);
		if (AjxUtil.isArray(id)) {
			id = id[id.length-1]; //make it the last match
		}
	}
	return id;
};

/**
 * Return the zimbra DL header if it exists, otherwise return null
 * @return {AjxEmailAddress} AjxEmailAddress object if header exists
**/
ZmMailMsg.prototype.getXZimbraDLHeader = 
function() {
	if (this.attrs && this.attrs[ZmMailMsg.HDR_XZIMBRADL]) {
		return AjxEmailAddress.parseEmailString(this.attrs[ZmMailMsg.HDR_XZIMBRADL]);
	}
	return null;
};

/**
 * Return mime header id if it exists, otherwise returns null
 * @return {String} mime header value
 */
ZmMailMsg.prototype.getMimeHeader =
function(name) {
	var value = null;
	if (this.attrs && this.attrs[name]) {
		value = this.attrs[name];
	}
	return value;
};

/**
 * Adds optional headers to the given request.
 * 
 * @param {object|AjxSoapDoc}	req		SOAP document or JSON parent object (probably a <m> msg object)
 */
ZmMailMsg.addRequestHeaders =
function(req) {
	
	if (!req) { return; }
	if (req.isAjxSoapDoc) {
		for (var hdr in ZmMailMsg.requestHeaders) {
			var headerNode = req.set('header', null, null);
			headerNode.setAttribute('n', ZmMailMsg.requestHeaders[hdr]);
		}
	}
	else {
		var hdrs = ZmMailMsg.requestHeaders;
		if (hdrs) {
			req.header = req.header || [];
			for (var hdr in hdrs) {
				req.header.push({n:hdrs[hdr]});
			}
		}
	}
};

/**
 * Returns a URL that can be used to fetch the given part of this message.
 *
 * @param   {ZmMimePart}    bodyPart        MIME part to fetch
 *
 * @returns {string}    URL to fetch the part
 */
ZmMailMsg.prototype.getUrlForPart = function(bodyPart) {

    return appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&loc=" + AjxEnv.DEFAULT_LOCALE + "&id=" + this.id + "&part=" + bodyPart.part;
};
