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
 * @overview
 * This file defines the mail message.
 */

/**
 * @constructor
 * @class
 * Creates a new (empty) mail message.
 *
 * @param {int}		id			the unique ID
 * @param {Array}		list		the list that contains this message
 * @param {Boolean}		noCache		if <code>true</code>, do not cache this message; <code>false</code> otherwise
 * 
 * @extends	ZmMailItem
 */
ZmMailMsg = function(id, list, noCache) {

	ZmMailItem.call(this, ZmItem.MSG, id, list, noCache);

	this.inHitList = false;
	this._attHitList = [];
	this.attachments = [];
	this._bodyParts = [];
    this._inviteDescBody = {};
	this._addrs = {};

	for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		this._addrs[type] = new AjxVector();
	}
	this.identity = null;
};

ZmMailMsg.prototype = new ZmMailItem;
ZmMailMsg.prototype.constructor = ZmMailMsg;

ZmMailMsg.ADDRS = [AjxEmailAddress.FROM, AjxEmailAddress.TO, AjxEmailAddress.CC,
				   AjxEmailAddress.BCC, AjxEmailAddress.REPLY_TO, AjxEmailAddress.SENDER];

ZmMailMsg.COMPOSE_ADDRS = [AjxEmailAddress.TO, AjxEmailAddress.CC, AjxEmailAddress.BCC];

/**
 * Defines the "from" header.
 */
ZmMailMsg.HDR_FROM		= AjxEmailAddress.FROM;
/**
 * Defines the "to" header.
 */
ZmMailMsg.HDR_TO		= AjxEmailAddress.TO;
/**
 * Defines the "cc" header.
 */
ZmMailMsg.HDR_CC		= AjxEmailAddress.CC;
/**
 * Defines the "bcc" header.
 */
ZmMailMsg.HDR_BCC		= AjxEmailAddress.BCC;
/**
 * Defines the "reply-to" header.
 */
ZmMailMsg.HDR_REPLY_TO	= AjxEmailAddress.REPLY_TO;
/**
 * Defines the "sender" header.
 */
ZmMailMsg.HDR_SENDER	= AjxEmailAddress.SENDER;
/**
 * Defines the "date" header.
 */
ZmMailMsg.HDR_DATE		= "DATE";
/**
 * Defines the "subject" header.
 */
ZmMailMsg.HDR_SUBJECT	= "SUBJECT";

ZmMailMsg.HDR_KEY = new Object();
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_FROM]		= ZmMsg.from;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_TO]			= ZmMsg.to;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_CC]			= ZmMsg.cc;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_BCC]		= ZmMsg.bcc;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_REPLY_TO]	= ZmMsg.replyTo;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_SENDER]		= ZmMsg.sender;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_DATE]		= ZmMsg.sentAt;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_SUBJECT]	= ZmMsg.subject;

// Ordered list - first matching status wins
ZmMailMsg.STATUS_LIST = ["isDraft", "isReplied", "isForwarded", "isSent", "isUnread"];

ZmMailMsg.STATUS_ICON = {};
ZmMailMsg.STATUS_ICON["isDraft"]		= "MsgStatusDraft";
ZmMailMsg.STATUS_ICON["isReplied"]		= "MsgStatusReply";
ZmMailMsg.STATUS_ICON["isForwarded"]	= "MsgStatusForward";
ZmMailMsg.STATUS_ICON["isSent"]			= "MsgStatusSent";
ZmMailMsg.STATUS_ICON["isUnread"]		= "MsgStatusUnread";

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


ZmMailMsg.URL_RE = /((telnet:)|((https?|ftp|gopher|news|file):\/\/)|(www\.[\w\.\_\-]+))[^\s\xA0\(\)\<\>\[\]\{\}\'\"]*/i;

ZmMailMsg.CONTENT_PART_ID = "ci";
ZmMailMsg.CONTENT_PART_LOCATION = "cl";

// Additional headers to request.  Also used by ZmConv and ZmSearch
ZmMailMsg.requestHeaders = {};

/**
 * Fetches a message from the server.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {ZmZimbraMail}      params.sender		the provides access to sendRequest()
 * @param {int}	params.msgId			the ID of the msg to be fetched.
 * @param {int}	      params.partId 		the msg part ID (if retrieving attachment part, i.e. rfc/822)
 * @param {int}	      params.ridZ   		the RECURRENCE-ID in Z (UTC) timezone
 * @param {Boolean}      params.getHtml		if <code>true</code>, try to fetch html from the server
 * @param {Boolean}      params.markRead		if <code>true</code>, mark msg read
 * @param {AjxCallback}	params.callback		the async callback
 * @param {AjxCallback}	      params.errorCallback	the async error callback
 * @param {Boolean}	      params.noBusyOverlay	if <code>true</code>, do not put up busy overlay during request
 * @param {Boolean}	      params.noTruncate	if <code>true</code>, do not truncate message body
 * @param {ZmBatchCommand}      params.batchCmd		if set, request gets added to this batch command
 * @param {String}      params.accountName	the name of the account to send request on behalf of
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

	if (params.ridZ) {
		m.ridZ = params.ridZ;
	}

	for (var hdr in ZmMailMsg.requestHeaders) {
		if (!m.header) { m.header = []; }
		m.header.push({n:hdr});
	}

	if (!params.noTruncate) {
		m.max = appCtxt.get(ZmSetting.MAX_MESSAGE_SIZE) || ZmMailApp.DEFAULT_MAX_MESSAGE_SIZE;
	}

	if (params.batchCmd) {
		params.batchCmd.addRequestParams(jsonObj, params.callback);
	} else {
		var newParams = {
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(null, ZmMailMsg._handleResponseFetchMsg, [params.callback])),
			errorCallback: params.errorCallback,
			noBusyOverlay: params.noBusyOverlay,
			accountName: params.accountName
		};
		params.sender.sendRequest(newParams);
	}
};

ZmMailMsg._handleResponseFetchMsg =
function(callback, result) {
	if (callback) {
		callback.run(result);
	}
};

// Public methods

ZmMailMsg.prototype.toString =
function() {
	return "ZmMailMsg";
};

// Getters

/**
 * Gets a vector of addresses of the given type.
 *
 * @param {constant}	type			an email address type
 * @param {Hash}	used			an array of addresses that have been used. If not <code>null</code>,
 *									then this method will omit those addresses from the
 * 									returned vector and will populate used with the additional new addresses
 * @param {Boolean}	addAsContact	if <code>true</code>, emails should be converted to {@link ZmContact} objects
 * 
 * @return	{AjxVector}	a vection of email address
 */
ZmMailMsg.prototype.getAddresses =
function(type, used, addAsContact) {
	if (!used) {
		return this._addrs[type];
	} else {
		var a = this._addrs[type].getArray();
		var addrs = [];
		for (var i = 0; i < a.length; i++) {
			var addr = a[i];
			var email = addr.getAddress();
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
			used[email] = true;
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
function(mode, aliases) {

	// reply-to has precedence over everything else
	var addrVec = this._addrs[AjxEmailAddress.REPLY_TO];
	if (!addrVec && this.isInvite() && this.needsRsvp()) {
		var invEmail = this.invite.getOrganizerEmail(0);
		if (invEmail) {
			return AjxVector.fromArray([new AjxEmailAddress(invEmail)]);
		}
	}

	if (!(addrVec && addrVec.size())) {
		if (mode == ZmOperation.REPLY_CANCEL || (this.isSent && mode == ZmOperation.REPLY_ALL)) {
			addrVec = this.isInvite() ? this._getAttendees() : this._addrs[AjxEmailAddress.TO];
		} else {
			addrVec = this._addrs[AjxEmailAddress.FROM];
			if (aliases) {
				var from = addrVec.get(0);
				// make sure we're not replying to ourself
				if (from && aliases[from.address]) {
					addrVec = this._addrs[AjxEmailAddress.TO];
				}
			}
		}
	}
	return addrVec;
};

ZmMailMsg.prototype._getAttendees =
function() {
	var attendees = this.invite.components[0].at;
	var emails = new AjxVector();
	for (var i = 0; i < attendees ? attendees.length : 0; i++) {
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
	if (!this._isReadOnly) {
		var folder = appCtxt.getById(this.folderId);
		this._isReadOnly = (folder ? folder.isReadOnly() : false);
	}
	return this._isReadOnly;
};

/**
 * Gets the header string.
 * 
 * @param	{constant}	hdr		the header (see <code>ZmMailMsg.HDR_</code> constants)
 * @return	{String}	the value
 */
ZmMailMsg.prototype.getHeaderStr =
function(hdr) {
	if (hdr == ZmMailMsg.HDR_DATE) {
		if (this.sentDate) {
			var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
			return (ZmMailMsg.HDR_KEY[hdr] + ": " + formatter.format(new Date(this.sentDate)));
		}
		return "";
	} else if (hdr == ZmMailMsg.HDR_SUBJECT) {
		return this.subject ? (ZmMailMsg.HDR_KEY[hdr] + ": " + this.subject) : "";
	} else {
		var addrs = this.getAddresses(hdr);
		var addrStr = addrs.toString(", ", true);
		if (addrStr) {
			return (ZmMailMsg.HDR_KEY[hdr] + ": " + addrStr);
		}
	}
};

/**
 * Checks if this message has html parts.
 * 
 * @return	{Boolean}	<code>true</code> if this message has HTML
 */
ZmMailMsg.prototype.isHtmlMail =
function() {
	return this.getBodyPart(ZmMimeTable.TEXT_HTML) != null;
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
function(addr) {
	var type = addr.type || AjxEmailAddress.TO;
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
 * Sets the body parts. Note: It's assumed by other parts of the code that body parts
 * is an array of the node properties of {@link ZmMimePart}, <em>not</em> the
 * {@link ZmMimePart} objects themselves. Therefore, the caller must pass in
 * an array like <code>[ part.node, ... ]</code>.
 * 
 * @param	{Array}	parts		an array of parts
 * 
 */
ZmMailMsg.prototype.setBodyParts =
function(parts) {
	this._onChange("bodyParts", parts);
	this._bodyParts = parts;
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
 */
ZmMailMsg.prototype.addInlineAttachmentId =
function (cid,aid,part) {
	if (!this._inlineAtts) {
		this._inlineAtts = [];
	}
	this._onChange("inlineAttachments",aid);
	if (aid) {
		this._inlineAtts.push({"cid":cid,"aid":aid});
	} else if (part) {
		this._inlineAtts.push({"cid":cid,"part":part});
	}
};

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
		if (this.attachments[i].ci == cid) {
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
ZmMailMsg.prototype.setDocumentAttachmentId =
function(ids) {
	this._onChange("documentAttachmentId", ids);
	this._docAttIds = ids;
};

ZmMailMsg.prototype.addDocumentAttachmentId =
function(id) {
	if(!this._docAttIds) {
		this._docAttIds = [];
	}
	this._docAttIds.push(id);
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

// Actions

/**
 * Fills in the message from the given message node. Whatever attributes and child nodes
 * are available will be used. The message node is not always fully populated, since it
 * may have been created as part of getting a conversation.
 *
 * @param {Object}	node		a message node
 * @param {Hash}	args		a hash of arguments
 * @return	{ZmMailMsg}		the message
 */
ZmMailMsg.createFromDom =
function(node, args) {
	var msg = new ZmMailMsg(node.id, args.list);
	msg._loadFromDom(node);
	return msg;
};

/**
 * Gets the full message object from the back end based on the current message ID, and
 * fills in the message.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {Boolean}      params.getHtml		if <code>true</code>, try to fetch html from the server
 * @param {Boolean}      params.markRead		if <code>true</code>, mark msg read
 * @param {Boolean}      params.forceLoad		if <code>true</code>, get msg from server
 * @param {AjxCallback}      params.callback		the async callback
 * @param {AjxCallback}      params.errorCallback	the async error callback
 * @param {Boolean}      params.noBusyOverlay	if <code>true</code>, do not put up busy overlay during request
 * @param {Boolean}      params.noTruncate	if <code>true</code>, do not set max limit on size of msg body
 * @param {ZmBatchCommand}      params.batchCmd		if set, request gets added to this batch command
 * @param {String}      params.accountName	the name of the account to send request on behalf of
 */
ZmMailMsg.prototype.load =
function(params) {
	// If we are already loaded, then don't bother loading
	if (!this._loaded || params.forceLoad) {
		var respCallback = new AjxCallback(this, this._handleResponseLoad, [params, params.callback]);
		params.getHtml = params.getHtml || this.isDraft || appCtxt.get(ZmSetting.VIEW_AS_HTML);
		params.sender = appCtxt.getAppController();
		params.msgId = this.id;
		params.callback = respCallback;
		ZmMailMsg.fetchMsg(params);
	} else {
		this._markReadLocal(true);
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

	// clear all attachments
	this.attachments.length = 0;

	this._loadFromDom(response.m[0]);
	if (!this.isReadOnly() && params.markRead) {
		this._markReadLocal(true);
	}

	// return result so callers can check for exceptions if they want
	if (this._loadCallback) {
		// overriding callback (see ZmMsgController::show)
		this._loadCallback.run(result);
		this._loadCallback = null;
	} else if (callback) {
		callback.run(result);
	}
};

ZmMailMsg.prototype.getBodyParts =
function() {
	return this._bodyParts;
};

/**
 * Gets the body parts.
 * 
 * @param {String}	contentType	the content type ("text/plain" or "text/html")
 * @param {Boolean}	useOriginal	if <code>true</code>, do not grab the copy w/ the images defanged
 *									(only applies when contentType is "text/html")
 *
 * @return	{String}	the body
 */
ZmMailMsg.prototype.getBodyPart =
function(contentType, useOriginal) {

	if (contentType == ZmMimeTable.TEXT_HTML && !useOriginal &&
		this._htmlBody && this._htmlBody.length > 0)
	{
		return this._htmlBody;
	}
	else
	{
		// return the first body part if content type was not specified,
		// otherwise, search for the first body part that matches the given ct.
		for (var i = 0; i < this._bodyParts.length; i++) {
			if (contentType) {
				if (this._bodyParts[i].ct == contentType)
					return this._bodyParts[i];
			} else {
				return this._bodyParts[i];
			}
		}

        if(this.isInvite()) {
            return this.getInviteDescriptionContent(contentType);
        }
	}
};

/**
 * Gets the body content.
 * 
 * @return	{String}	the content or <code>null</code> for none
 */
ZmMailMsg.prototype.getBodyContent =
function() {
	if (this._loaded) {
		var bodyPart = this.getBodyPart();
		return bodyPart ? bodyPart.content : null;
	}

	return null;
};

/**
 * Gets the text part.
 * 
 * @param	{AjxCallback}		callback		the callback
 */
ZmMailMsg.prototype.getTextPart =
function(callback) {
	var bodyPart = this.getBodyPart();

	if (bodyPart && bodyPart.ct == ZmMimeTable.TEXT_PLAIN) {
		return bodyPart.content;
	} else if (bodyPart && bodyPart.ct != ZmMimeTable.TEXT_PLAIN && bodyPart.ct != ZmMimeTable.TEXT_HTML) {
		// looks like the body of this message is the attachment itself
		return "";
	} else {
		// bug fix #19275 - if loaded and not viewing as HTML then assume no text part exists
		if (this._loaded && !appCtxt.get(ZmSetting.VIEW_AS_HTML)) {
			if (callback) callback.run();
		} else {
			var respCallback = new AjxCallback(this, this._handleResponseGetTextPart, [callback]);
			ZmMailMsg.fetchMsg({sender:appCtxt.getAppController(), msgId:this.id, getHtml:false, callback:respCallback});
		}
	}
};

ZmMailMsg.prototype._handleResponseGetTextPart =
function(callback, result) {
	var response = result.getResponse().GetMsgResponse;
	this._loadFromDom(response.m[0]);
	var bodyPart = this.getBodyPart(ZmMimeTable.TEXT_PLAIN);
	result.set(bodyPart ? bodyPart.content : null);
	if (callback) callback.run(result, bodyPart.truncated);
};

/**
 * Sets the html content.
 * 
 * @param	{String}	content		the content
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
 * Gets the invite description content.
 * 
 * @param {String}	contentType	the content type ("text/plain" or "text/html")
 * @return	{String}	the content
 */
ZmMailMsg.prototype.getInviteDescriptionContent =
function(contentType) {

    if(!contentType) {
        contentType = ZmMimeTable.TEXT_HTML;
    }

	var desc = this._inviteDescBody[contentType];

    if(!desc) {

        var htmlContent =  this._inviteDescBody[ZmMimeTable.TEXT_HTML];
        var textContent =  this._inviteDescBody[ZmMimeTable.TEXT_PLAIN];

        if(!htmlContent && textContent) {
            htmlContent = AjxStringUtil.convertToHtml(textContent);
        }

        if(!textContent && htmlContent) {
            textContent = AjxStringUtil.convertHtml2Text(htmlContent);
        }

        desc = (contentType == ZmMimeTable.TEXT_HTML) ? htmlContent : textContent;
    }

    var idx = desc ? desc.indexOf(ZmItem.NOTES_SEPARATOR) : -1;

    if(idx == -1 && this.isInvite()) {
        var inviteSummary = this.invite.getSummary((contentType == ZmMimeTable.TEXT_HTML));
        desc = desc ? (inviteSummary + desc) : null;
    }
    
    if(desc != null) {
        return { ct:contentType, s: desc.length, content: desc };
    }
};

ZmMailMsg.prototype.sendInviteReply =
function(edited, componentId, callback, errorCallback, instanceDate, accountName, ignoreNotifyDlg) {
	this._origMsg = this._origMsg || this;
    if(componentId == 0){ //editing reply, custom message
        this._origMsg._customMsg = true;            
    }
	return this._sendInviteReply(edited, componentId || 0, callback, errorCallback, instanceDate, accountName, ignoreNotifyDlg);
};

ZmMailMsg.prototype._sendInviteReply =
function(edited, componentId, callback, errorCallback, instanceDate, accountName, ignoreNotifyDlg) {
	var jsonObj = {SendInviteReplyRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SendInviteReplyRequest;

	request.id = this._origMsg.id;
	request.compNum = componentId;

	var verb = "ACCEPT";
    var needsRsvp = true;
    
    switch (this.inviteMode) {
        case ZmOperation.REPLY_ACCEPT_IGNORE:    needsRsvp = false;
        case ZmOperation.REPLY_ACCEPT_NOTIFY:
        case ZmOperation.REPLY_ACCEPT:           verb = "ACCEPT"; break;

        case ZmOperation.REPLY_DECLINE_IGNORE:   needsRsvp = false;
        case ZmOperation.REPLY_DECLINE_NOTIFY:
        case ZmOperation.REPLY_DECLINE:          verb = "DECLINE"; break;

        case ZmOperation.REPLY_TENTATIVE_IGNORE: needsRsvp = false;
        case ZmOperation.REPLY_TENTATIVE_NOTIFY:
        case ZmOperation.REPLY_TENTATIVE:        verb = "TENTATIVE"; break;

        case ZmOperation.REPLY_NEW_TIME: 	     verb = "DELEGATED"; break; // XXX: WRONG MAPPING!
    }
    request.verb = verb;

	var inv = this._origMsg.invite;
	if (this.getAddress(AjxEmailAddress.TO) == null && !inv.isOrganizer()) {
		var to = inv.getOrganizerEmail() || inv.getSentBy();
        if(to == null) {
            var ac = window.parentAppCtxt || window.appCtxt;
            var mainAcct = ac.accountList.mainAccount.getEmail();
            var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
            //bug: 33639 when organizer component is missing from invitation
            if (from && from.address != mainAcct) {
                to = from.address;
            }
        }
        if(to) {
		    this.setAddress(AjxEmailAddress.TO, (new AjxEmailAddress(to)));
        }
	}

    var replyActionMap = {};
    replyActionMap[ZmOperation.REPLY_ACCEPT_NOTIFY]		= ZmOperation.REPLY_ACCEPT;
    replyActionMap[ZmOperation.REPLY_ACCEPT_IGNORE]		= ZmOperation.REPLY_ACCEPT;
    replyActionMap[ZmOperation.REPLY_DECLINE_NOTIFY]	= ZmOperation.REPLY_DECLINE;
    replyActionMap[ZmOperation.REPLY_DECLINE_IGNORE]	= ZmOperation.REPLY_DECLINE;
    replyActionMap[ZmOperation.REPLY_TENTATIVE_NOTIFY]	= ZmOperation.REPLY_TENTATIVE;
    replyActionMap[ZmOperation.REPLY_TENTATIVE_IGNORE]	= ZmOperation.REPLY_TENTATIVE;
    
    if(!replyActionMap[this.inviteMode]) {
        needsRsvp = this._origMsg.needsRsvp();        
    }
    return this._sendInviteReplyContinue(jsonObj, needsRsvp ? "TRUE" : "FALSE", edited, callback, errorCallback, instanceDate, accountName);
};

ZmMailMsg.prototype._sendInviteReplyContinue =
function(jsonObj, updateOrganizer, edited, callback, errorCallback, instanceDate, accountName) {

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

	var respCallback = new AjxCallback(this, this._handleResponseSendInviteReply, [callback]);
	var resp = this._sendMessage({ jsonObj:jsonObj,
								isInvite:true,
								isDraft:false,
								callback:respCallback,
								errorCallback:errorCallback,
								accountName:accountName });

	if (window.parentController) {
		window.close();
	}
	return resp;
};

ZmMailMsg.prototype._handleResponseSendInviteReply =
function(callback, result) {
	var resp = result.getResponse();

	var id = resp.id ? resp.id.split("-")[0] : null;
	var statusOK = (id || resp.status == "OK");

	if (statusOK) {
		this._notifySendListeners();
		this._origMsg.folderId = ZmFolder.ID_TRASH;
	}

    if(this.acceptFolderId && this.acceptFolderId != ZmOrganizer.ID_CALENDAR && resp.apptId != null) {
        //move appt
        this.moveApptItem(resp.apptId, this.acceptFolderId);
    }
    
	if (callback) {
		callback.run(result);
	}
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
 */
ZmMailMsg.prototype.send =
function(isDraft, callback, errorCallback, accountName, noSave, requestReadReceipt) {
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
		return this.sendInviteReply(true, 0, callback, errorCallback, this._instanceDate, aName, true);
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
		this._createMessageNode(request, isDraft, aName, requestReadReceipt);

		var params = {
			jsonObj: jsonObj,
			isInvite: false,
			isDraft: isDraft,
			accountName: aName,
			callback: (new AjxCallback(this, this._handleResponseSend, [isDraft, callback])),
			errorCallback: errorCallback
		};
		return this._sendMessage(params);
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
	}

	if (callback) {
		callback.run(result);
	}
};

ZmMailMsg.prototype._createMessageNode =
function(request, isDraft, accountName, requestReadReceipt) {

	var msgNode = request.m = {};

	// if origId is given, means we're saving a draft or sending a msg that was
	// originally a reply/forward
	if (this.origId) {
		msgNode.origid = this.origId;
	}

	// if id is given, means we are re-saving a draft
	var oboDraftMsgId = null; // On Behalf of Draft MsgId
	if ((isDraft || this.isDraft) && this.id) {
		var ac = window.parentAppCtxt || window.appCtxt;
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

	if (ZmMailMsg.COMPOSE_ADDRS.length > 0) { // If no addrs, no element 'e'
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
								var id = (isDraft || this.isDraft)
									? (oboDraftMsgId || this.id || this.origId)
									: (this.origId || this.id);

                                if(!id && this._origMsg)
                                    id = this._origMsg.id;

								attachNode.mp = [{mid:id, part:inlineAtts[j].part}];
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
		(this._docAttIds && this._docAttIds.length) ||
		(this._forAttIds && this._forAttIds.length))
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
		if (this._docAttIds) {
			var docs = attachNode.doc = [];
			for (var i = 0; i < this._docAttIds.length; i++) {
				docs.push({id:this._docAttIds[i]});
			}
		}

		// attach msg attachments
		if (this._forAttIds && this._forAttIds.length) {
			var attIds = this._forAttIds;
			if (attIds && attIds.length) {
				var parts = attachNode.mp = [];
	            for (var i = 0; i < attIds.length; i++) {
					// YUCKY YUCK YUCK: find an ID to send 
					var id = (isDraft || this.isDraft)
						? (oboDraftMsgId || this.id || this.origId)
						: (this.origId || this.id);

					if (!id && this._origMsg) {
						id = this._origMsg.id;
					}

					if (!id && (isDraft || this.isDraft) && appCtxt.multiAccounts) {
						id = this.origAcctMsgId;
					}

					// bug fix #33312 - should be reverted(?) once bug #33691 is fixed. 
					if (id && appCtxt.multiAccounts && (isDraft || this.isDraft)) {
						id = ZmOrganizer.getSystemId(id, appCtxt.accountList.mainAccount, true);
					}

					parts.push({mid:id, part:attIds[i]});
				}
			}
		}
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
 *        
 * @private
 */
ZmMailMsg.prototype._sendMessage =
function(params) {
	var respCallback = new AjxCallback(this, this._handleResponseSendMessage, [params]);

	// bug fix #4325 - its safer to make sync request when dealing w/ new window
	if (window.parentController) {
		var newParams = {
			jsonObj: params.jsonObj,
			accountName: params.accountName,
			errorCallback: params.errorCallback
		};
		var resp = appCtxt.getAppController().sendRequest(newParams);
		if (!resp) { return; } // bug fix #9154

		if (resp.SendInviteReplyResponse) {
			return resp.SendInviteReplyResponse;
		} else if (resp.SaveDraftResponse) {
			resp = resp.SaveDraftResponse;
			this._loadFromDom(resp.m[0]);
			return resp;
		} else if (resp.SendMsgResponse) {
			return resp.SendMsgResponse;
		}
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:params.jsonObj,
												asyncMode:true,
												callback:respCallback,
												errorCallback:params.errorCallback,
												accountName:params.accountName });
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

ZmMailMsg.prototype._notifySendListeners =
function() {
	var flag;
	if (this.isForwarded) {
		flag = ZmItem.FLAG_FORWARDED;
	} else if (this.isReplied) {
		flag = ZmItem.FLAG_REPLIED;
	}

	if (flag && this._origMsg) {
		this._origMsg[ZmItem.FLAG_PROP[flag]] = true;
		if (this._origMsg.list) {
			this._origMsg.list._notify(ZmEvent.E_FLAGS, {items: [this._origMsg], flags: [flag]});
		}
	}
};

ZmMailMsg.prototype.isRealAttachment =
function(attachment) {
	var type = attachment.ct;

	// bug fix #6374 - ignore if attachment is body unless content type is message/rfc822
	if (ZmMimeTable.isIgnored(type))
		return false;

	// bug fix #8751 - dont ignore text/calendar type if msg is not an invite
	if (type == ZmMimeTable.TEXT_CAL && appCtxt.get(ZmSetting.CALENDAR_ENABLED) && this.isInvite())
		return false;

	return true;
};

// this is a helper method to get an attachment url for multipart/related content
ZmMailMsg.prototype.getContentPartAttachUrl =
function(contentPartType, contentPart) {
	if (this.attachments && this.attachments.length > 0 &&
		(contentPartType == ZmMailMsg.CONTENT_PART_ID ||
		 contentPartType == ZmMailMsg.CONTENT_PART_LOCATION))
	{
		for (var i = 0; i < this.attachments.length; i++) {
			var attach = this.attachments[i];
			if (attach[contentPartType] == contentPart) {
				return [appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI), "&id=", this.id, "&part=", attach.part].join("");
			}
		}
	}
	return null;
};

ZmMailMsg.prototype.findAttsFoundInMsgBody =
function(){

    if(this.findAttsFoundInMsgBodyDone) return;
    
    var content ="", cid;
    var bodyParts = this.getBodyParts();
    for (var i = 0; i < bodyParts.length; i++) {
        var bodyPart = bodyParts[i];
        if (bodyPart.ct == ZmMimeTable.TEXT_HTML) {
            content = bodyPart.content;
            var msgRef = this;
            content.replace(/dfsrc=([\x27\x22])cid:([^\x27\x22]+)\1/ig, function(s, q, cid){
                var attach = msgRef.findInlineAtt("<" + cid + ">");
                if(attach)
                    attach.foundInMsgBody = true;
            });
        }
    }
    this.findAttsFoundInMsgBodyDone = true;
};

ZmMailMsg.prototype.hasInlineImagesInMsgBody =
function(){
    var body = this.getBodyPart(ZmMimeTable.TEXT_HTML);
    if(body){
        body = AjxUtil.isString(body) ? body : body.content;
        if(body && body.search(/dfsrc=([\x27\x22])cid:([^\x27\x22]+)\1/ig) != -1){
            return true;
        }
    }
    return false;
};

/**
 * Returns an array of objects containing meta info about attachments to be used
 * to build href's by the caller
 * 
 * @private
 */
ZmMailMsg.prototype.getAttachmentLinks =
function(findHits, includeInlineImages, includeInlineAtts) {
	this._attLinks = [];

	var attachments = this.attachments;

	if (includeInlineAtts) {
		var parts = this.getBodyParts();
		if (parts && parts.length > 1) {
			var iAtts = [], part;
			for (var k = 0; k < parts.length; k++) {
				part = parts[k];
				if (part.filename && part.cd == "inline") {
					iAtts.push(part);
				}
			}
			attachments = [].concat(attachments, iAtts);
		}
	}

	if (attachments && attachments.length > 0) {

		var hrefRoot = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&loc=" + AjxEnv.DEFAULT_LOCALE + "&id=" + this.id + "&part=";
        this.findAttsFoundInMsgBody();

		for (var i = 0; i < attachments.length; i++) {
			var attach = attachments[i];

			if (!this.isRealAttachment(attach) || (attach.ct.match(/^image/) && attach.ci && attach.foundInMsgBody && !includeInlineImages) || (attach.cd == "inline" && attach.filename && ZmMimeTable.isRenderable(attach.ct) && !includeInlineAtts)) {
				continue;
			}

			var props = {};

			// set a viable label for this attachment
			props.label = attach.name || attach.filename || (ZmMsg.unknown + " <" + attach.ct + ">");

			// use content location instead of built href flag
			var useCL = false;
			// set size info in any
			if (attach.s != null && attach.s >= 0) {
				if (attach.s < 1024)		props.size = attach.s + " "+ZmMsg.b;//" B";
				else if (attach.s < (1024*1024) )	props.size = Math.round((attach.s / 1024) * 10) / 10 + " "+ZmMsg.kb;//" KB";
				else						props.size = Math.round((attach.s / (1024*1024)) * 10) / 10 + " "+ZmMsg.mb;//" MB";
			} else {
				useCL = attach.cl && (attach.relativeCl || ZmMailMsg.URL_RE.test(attach.cl));
			}

			// handle rfc/822 attachments differently
			if (attach.ct == ZmMimeTable.MSG_RFC822) {
				var html = [];
				var j = 0;
				html[j++] = "<a href='javascript:;' onclick='ZmMailMsgView.rfc822Callback(";
				html[j++] = '"';
				html[j++] = this.id;
				html[j++] = '"';
				html[j++] = ",\"";
				html[j++] = attach.part;
				html[j++] = "\"); return false;' class='AttLink'>";
				props.link = html.join("");


                if(appCtxt.get(ZmSetting.CALENDAR_ENABLED) && attach.mp && attach.mp.length==1 && attach.mp[0].ct == ZmMimeTable.TEXT_CAL) {
                    var onclickStr1 = "ZmMailMsgView.addToCalendarCallback(\"" + this.id + "\",\"" + attach.mp[0].part + "\");";
                    props.importICSLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr1 + "'>";
                }
                
			} else {
				// set the anchor html for the link to this attachment on the server
				var url = useCL ? attach.cl : (hrefRoot + attach.part);

				// bug fix #6500 - append filename w/in so "Save As" wont append .html at the end
				if (!useCL) {
					var insertIdx = url.indexOf("?auth=co&");
					var fn = AjxStringUtil.urlComponentEncode(attach.filename);
					fn = fn.replace(/\x27/g, "%27");
					url = url.substring(0,insertIdx) + fn + url.substring(insertIdx);
				}

				props.link = "<a target='_blank' class='AttLink' href='" + url + "'>";
				if (!useCL) {
					props.download = [
						"<a style='text-decoration:underline' class='AttLink' href='",
						url,
						appCtxt.get(ZmSetting.ATTACHMENTS_BLOCKED)
							? "' target='_blank'>"
							: "&disp=a' onclick='ZmZimbraMail.unloadHackCallback();'>"
					].join("");
				}

				var folder = appCtxt.getById(this.folderId);
				if ((attach.name || attach.filename) &&
					appCtxt.get(ZmSetting.BRIEFCASE_ENABLED) &&
					(folder && !folder.isRemote()))
				{
					var partLabel = props.label;
					partLabel = partLabel.replace(/\x27/g,"\\'");
					var onclickStr1 = "ZmMailMsgView.briefcaseCallback(\"" + this.id + "\",\"" + attach.part + "\",\""+partLabel+"\");";
					props.briefcaseLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr1 + "'>";
				}

                if(appCtxt.get(ZmSetting.CALENDAR_ENABLED) && attach.ct == ZmMimeTable.TEXT_CAL) {
                    var onclickStr1 = "ZmMailMsgView.addToCalendarCallback(\"" + this.id + "\",\"" + attach.part + "\");";
                    props.importICSLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr1 + "'>";
                }


				if (!useCL) {
					// check for vcard *first* since we dont care to view it in HTML
					if (attach.ct == ZmMimeTable.TEXT_VCARD ||
						attach.ct == ZmMimeTable.TEXT_DIRECTORY)
					{
						var onclickStr = "ZmMailMsgView.vcardCallback(" + "\"" + this.id + "\"" +  ",\"" + attach.part + "\");";
						props.vcardLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr + "'>";
					}
					else if (ZmMimeTable.hasHtmlVersion(attach.ct) &&
							 appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML))
					{
						// set the anchor html for the HTML version of this attachment on the server
						props.htmlLink = "<a style='text-decoration:underline' target='_blank' class='AttLink' href='" + url + "&view=html" + "'>";
					}
					else
					{
						// set the objectify flag
						props.objectify = attach.ct && attach.ct.match(/^image/);
					}
				} else {
					props.url = url;
				}

				// bug: 233 - remove attachment
				var onclickStr = "ZmMailMsgView.removeAttachmentCallback(" + "\"" + this.id + "\"" +  ",\"" + attach.part + "\");";
				props.removeLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr + "'>";
			}

			// set the link icon
			var mimeInfo = ZmMimeTable.getInfo(attach.ct);
			props.linkIcon = mimeInfo ? mimeInfo.image : "GenericDoc";
			props.ct = attach.ct;

			// set other meta info
			props.isHit = findHits && this._isAttInHitList(attach);
			props.part = attach.part;
			if (!useCL) {
				props.url = [
					appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI),
					"&loc=", AjxEnv.DEFAULT_LOCALE,
					"&id=", this.id,
					"&part=", attach.part
				].join("");
			}
			if (attach.ci || (includeInlineImages && attach.cd == "inline")) {  // bug: 28741
				props.ci = true;
			}

			props.foundInMsgBody = attach.foundInMsgBody;

			// and finally, add to attLink array
			this._attLinks.push(props);
		}
	}

	return this._attLinks;
};


// Private methods

// Processes a message node, getting attributes and child nodes to fill in the message.
ZmMailMsg.prototype._loadFromDom =
function(msgNode) {
	// this method could potentially be called twice (SearchConvResponse and
	// GetMsgResponse) so always check param before setting!
	if (msgNode.id)		{ this.id = msgNode.id; }
	if (msgNode.cid) 	{ this.cid = msgNode.cid; }
	if (msgNode.s) 		{ this.size = msgNode.s; }
	if (msgNode.d) 		{ this.date = msgNode.d; }
	if (msgNode.sd) 	{ this.sentDate = msgNode.sd; }
	if (msgNode.l) 		{ this.folderId = msgNode.l; }
	if (msgNode.t) 		{ this._parseTags(msgNode.t); }
	if (msgNode.cm) 	{ this.inHitList = msgNode.cm; }
	if (msgNode.su) 	{ this.subject = msgNode.su; }
	if (msgNode.fr) 	{ this.fragment = msgNode.fr; }
	if (msgNode.rt) 	{ this.rt = msgNode.rt; }
	if (msgNode.idnt)	{ this.identity = appCtxt.getIdentityCollection().getById(msgNode.idnt); }
	if (msgNode.origid) { this.origId = msgNode.origid; }
	if (msgNode.hp) 	{ this._attHitList = msgNode.hp; }
	if (msgNode.mid)	{ this.messageId = msgNode.mid; }
	if (msgNode._attrs) { this.attrs = msgNode._attrs; }
	if (msgNode.sf) 	{ this.sf = msgNode.sf; }
    if (msgNode.cif) 	{ this.cif = msgNode.cif; }

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
			conv.folders[msgNode.l] = true;
			// update msg list if none exists since we know this conv has at least one msg
			if (!conv.msgIds) {
				conv.msgIds = [this.id];
			}
		}
	}

	// always call parseFlags even if server didnt return any
	this._parseFlags(msgNode.f);

	if (msgNode.mp) {
		var params = {attachments: this.attachments, bodyParts: this._bodyParts};
		this._topPart = ZmMimePart.createFromDom(msgNode.mp, params);
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

	if (msgNode.inv) {
		try {
			this.invite = ZmInvite.createFromDom(msgNode.inv);
			this.invite.setMessageId(this.id);
			// bug fix #18613
			var desc = this.invite.getComponentDescription();
			var descHtml = this.invite.getComponentDescriptionHtml();
            if(descHtml) {
                this.setHtmlContent(descHtml);
                this.setInviteDescriptionContent(ZmMimeTable.TEXT_HTML, desc);
            }

            if(desc) {
                this.setInviteDescriptionContent(ZmMimeTable.TEXT_PLAIN, desc);                
            }

			if (!appCtxt.get(ZmSetting.CALENDAR_ENABLED) &&
				this.invite.type == "appt")
			{
				this.flagLocal(ZmItem.FLAG_ATTACH, true);
			}
		} catch (ex) {
			// do nothing - this means we're trying to load an ZmInvite in new
			// window, which we dont currently load (re: support).
		}
	}
};

ZmMailMsg.prototype._cleanupCIds = function(atts){

    atts = atts || this.attachments;
    if(!atts || atts.length == 0) return;

    for(var i=0; i<atts.length; i++){
        var att = atts[i];
        if(att.ci && !/^<.+>$/.test(att.ci)){
            att.ci = '<' + att.ci + '>';
        }
    }
};

ZmMailMsg.prototype.isInvite =
function () {
	return (this.invite != null);
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
	if (num) {
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		for (var i = 0; i < num; i++) {
			var addr = addrs.get(i);
			var email = addr.getAddress();
			var name = addr.getName();
			var addrNode = {t:AjxEmailAddress.toSoapType[type], a:email};
			if (name) {
				addrNode.p = name;
			}
			addrNodes.push(addrNode);
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

    //If repying to an invite which was addressed to user's alias then accept reply should appear from the alias 
    if(this._origMsg && this._origMsg.isInvite() && this.isReplied && (!this._origMsg._customMsg || !identity)){// is default reply or has no identities. 
        var origTos =  this._origMsg._getAttendees();
        var size = origTos && origTos.size() > 0 ? origTos.size() : 0;
        var aliazesString = ","+appCtxt.get(ZmSetting.MAIL_ALIASES).join(",")+",";
        for(var i = 0; i < size; i++){
            var origTo = origTos.get(i).address;
            if(origTo && aliazesString.indexOf(","+origTo+",") >= 0){
                var addrNode = {t:"f",a: origTo};
                addrNodes.push(addrNode);
                return; //We have already added appropriate alias as a "from". return from here.
            }
        }
    }

    //TODO: OPTIMIZE CODE by aggregating the common code.
	if (accountName && isPrimary) {

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
			if (from && from.address.toLowerCase() != mainAcct.toLowerCase()) {
				accountName = from.address;
				onBehalfOf = true;
			}
		}

		var addr, displayName = null;
		if (this.fromSelectValue) {
			addr = this.fromSelectValue.addr.address;
			displayName = this.fromSelectValue.addr.name;
		} else {
			if (onBehalfOf) {
				addr = accountName;
			} else {
				addr = identity ? identity.sendFromAddress : accountName;
				displayName = identity && identity.sendFromDisplay;
			}
		}

		var node = {t:"f", a:addr};
		if (displayName) {
			node.p = displayName;
		}
		addrNodes.push(node);

		if (!ac.multiAccounts && (!isDraft || onBehalfOf)) {
			// the main account is *always* the sender
			addrNodes.push({t:"s", a:mainAcct});
		}
	} else if (identity) {
                
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
        if(onBehalfOf){
            addr = accountName;
        }else{
            addr = identity.sendFromAddress || mainAcct;
            displayName = identity.sendFromDisplay;
        }

        var addrNode = {t:"f", a:addr};
        if(displayName)
            addrNode.p = displayName;
        addrNodes.push(addrNode);

        if( onBehalfOf){
            addrNodes.push({t:"s", a:mainAcct});
        }
        
		if (identity && identity.isFromDataSource && ac.get(ZmSetting.SEND_ON_BEHALF_OF)) {
			var dataSource = ac.getDataSourceCollection().getById(identity.id);
			if (dataSource) {
				var provider = ZmDataSource.getProviderForAccount(dataSource);
				var doNotAddSender = provider && provider._nosender;
				// main account is "sender"
				if (!doNotAddSender) {
					addrNode.t = "s";
					addrNode.p = name || ac.get(ZmSetting.DISPLAY_NAME);
					addrNode = {};
					addrNodes.push(addrNode);
				}
				// mail is "from" external account
				addrNode.t = "f";
				addrNode.a = dataSource.getEmail();
				if (ac.get(ZmSetting.DEFAULT_DISPLAY_NAME)) {
					addrNode.p = name || dataSource.getName();
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
	if (this.identity) {
		addrNode.a = this.identity.readReceiptAddr || this.identity.sendFromAddress;
		addrNode.p = this.identity.sendFromDisplay;
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
	if (this.onChange && this.onChange instanceof AjxCallback) {
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

	var status = [];
	if (this.isInvite()) {
		var icon = this.getStatusIcon();
		status.push(ZmMailMsg.TOOLTIP[icon]);
	}
	if (this.isUnread)		{ status.push(ZmMsg.unread); }
	if (this.isReplied)		{ status.push(ZmMsg.replied); }
	if (this.isForwarded)	{ status.push(ZmMsg.forwarded); }
	if (this.isSent)		{ status.push(ZmMsg.sentAt); }
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
  if(!this.cif || !this.invite) return false;
  var resources = this.invite.getResources();
  for(var i in resources) {
      if(resources[i] && resources[i].url == this.cif) {
          return true;
      }
  }
    return false;
};
