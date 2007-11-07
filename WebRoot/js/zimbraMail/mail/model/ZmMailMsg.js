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
 * Creates a new (empty) mail message.
 * @constructor
 * @class
 * This class represents a mail message.
 *
 * @param id		[int]			unique ID
 * @param list		[ZmMailList]	list that contains this message
 * @param noCache	[boolean]*		if true, do not cache this msg
 */
ZmMailMsg = function(id, list, noCache) {

	ZmMailItem.call(this, ZmItem.MSG, id, list, noCache);

	this._inHitList = false;
	this._attHitList = [];
	this._attachments = [];
	this._bodyParts = [];
	this._addrs = [];

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

ZmMailMsg.HDR_FROM		= AjxEmailAddress.FROM;
ZmMailMsg.HDR_TO		= AjxEmailAddress.TO;
ZmMailMsg.HDR_CC		= AjxEmailAddress.CC;
ZmMailMsg.HDR_BCC		= AjxEmailAddress.BCC;
ZmMailMsg.HDR_REPLY_TO	= AjxEmailAddress.REPLY_TO;
ZmMailMsg.HDR_SENDER	= AjxEmailAddress.SENDER;
ZmMailMsg.HDR_DATE		= "DATE";
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

ZmMailMsg.URL_RE = /((telnet:)|((https?|ftp|gopher|news|file):\/\/)|(www\.[\w\.\_\-]+))[^\s\xA0\(\)\<\>\[\]\{\}\'\"]*/i;

ZmMailMsg.CONTENT_PART_ID = "ci";
ZmMailMsg.CONTENT_PART_LOCATION = "cl";

// Additional headers to request.  Also used by ZmConv and ZmSearch
//     via getAdditionalHeaders().
ZmMailMsg._requestHeaders = {};

/**
 * Fetches a message from the server.
 *
 * @param params		[hash]			hash of params:
 *        sender		[ZmZimbraMail]	provides access to sendRequest()
 *        msgId			[int]			ID of the msg to be fetched.
 *        partId 		[int]* 			msg part ID (if retrieving attachment part, i.e. rfc/822)
 *        getHtml		[boolean]*		if true, try to fetch html from the server
 *        callback		[AjxCallback]*	async callback
 *        errorCallback	[AjxCallback]*	async error callback
 *        noBusyOverlay	[boolean]*		don't put up busy overlay during request
 *        dontTruncate	[boolean]*		don't truncate message body
 */
ZmMailMsg.fetchMsg =
function(params) {
	var soapDoc = AjxSoapDoc.create("GetMsgRequest", "urn:zimbraMail", null);
	var msgNode = soapDoc.set("m");
	msgNode.setAttribute("id", params.msgId);
	if (params.partId) {
		msgNode.setAttribute("part", params.partId);
	}
	msgNode.setAttribute("read", "1");
	if (params.getHtml) {
		msgNode.setAttribute("html", "1");
	}

	// Request additional headers
	for (var hdr in ZmMailMsg.getAdditionalHeaders()) {
		var headerNode = soapDoc.set('header', null, msgNode);
		headerNode.setAttribute('n', hdr);
	}

	if (!params.dontTruncate) {
		msgNode.setAttribute("max", appCtxt.get(ZmSetting.MAX_MESSAGE_SIZE));
	}

	var respCallback = new AjxCallback(null, ZmMailMsg._handleResponseFetchMsg, [params.callback]);
	var execFrame = new AjxCallback(null, ZmMailMsg.fetchMsg, [params]);
	params.sender.sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback,
							errorCallback:params.errorCallback, execFrame:execFrame,
							noBusyOverlay:params.noBusyOverlay});
};

/**
 * Request additional headers from the server.
 */
ZmMailMsg.requestHeader =
function(hdr) {
	ZmMailMsg._requestHeaders[hdr] = hdr;
};

ZmMailMsg.getAdditionalHeaders =
function() {
	return ZmMailMsg._requestHeaders;
}


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
* Returns a vector of addresses of the given type
*
* @param type	[Integer]	an email address type
* @param used	[Array]		array of addressed that have been used. If not null,
*		then this method will omit those addresses from the returned vector and
*		will populate used with the additional new addresses
* @param addAsContact	[boolean]	true if emails should be converted to ZmContacts
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

ZmMailMsg.prototype.getAttachments =
function() {
	return this._attachments;
}

/**
* Returns a Reply-To address if there is one, otherwise the From address
* unless this message was sent by the user, in which case, it is the To
* field (but only in the case of Reply All). A list is returned, since
* theoretically From and Reply To can have multiple addresses.
*/
ZmMailMsg.prototype.getReplyAddresses =
function(mode, aliases) {
	var invAddr;
	// reply-to has precedence over everything else
	var addrVec = this._addrs[AjxEmailAddress.REPLY_TO];
	if (!addrVec && this.isInvite() && this.needsRsvp()) {
		var invEmail = this.invite.getOrganizerEmail(0);
		if (invEmail)
			invAddr = new AjxEmailAddress(invEmail);
	}
	if (invAddr) {
		return AjxVector.fromArray([invAddr]);
    }

	if (!(addrVec && addrVec.size())) {
        if (mode == ZmOperation.REPLY_CANCEL ||
			this.isSent && mode == ZmOperation.REPLY_ALL)
		{
			addrVec = this.isInvite()
				? this._getAttendees()
				: this._addrs[AjxEmailAddress.TO];
        }
        else
		{
            addrVec = this._addrs[AjxEmailAddress.FROM];

			if (aliases) {
				var from = addrVec.get(0);
				// make sure we're not replying to ourself
				if (from && aliases[from.address]) {
					var sender = this._addrs[AjxEmailAddress.SENDER];
					addrVec = (sender.size() > 0) ? sender : this._addrs[AjxEmailAddress.TO];
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
    for (var i = 0; i < attendees.length; i++) {
        var at = attendees[i];
        emails.add(new AjxEmailAddress(at.a, null, null, at.d));
    }

    return emails;
};

/**
* Returns the first address in the vector of addresses of the given type
*/
ZmMailMsg.prototype.getAddress =
function(type) {
	return this._addrs[type].get(0);
};

/**
* Returns the fragment. If maxLen is given, will truncate fragment to maxLen and add ellipsis
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
* Returns the date
*/
ZmMailMsg.prototype.getDate =
function() {
	return this.date;
};

ZmMailMsg.prototype.getHeaderStr =
function(hdr) {
	if (hdr == ZmMailMsg.HDR_DATE) {
		var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.FULL);
		return this.sentDate ? ZmMailMsg.HDR_KEY[hdr] + ": " + formatter.format(new Date(this.sentDate)) : "";
	} else if (hdr == ZmMailMsg.HDR_SUBJECT) {
		return this.subject ? ZmMailMsg.HDR_KEY[hdr] + ": " + this.subject : "";
	} else {
		var addrs = this.getAddresses(hdr);
		var addrStr = addrs.toString(", ", true);
		if (addrStr)
			return ZmMailMsg.HDR_KEY[hdr] + ": " + addrStr;
	}
};

/**
* Returns true if this message was matched during a search
*/
ZmMailMsg.prototype.isInHitList =
function() {
	return this._inHitList;
};

/**
* Returns true if this message has html parts
*/
ZmMailMsg.prototype.isHtmlMail =
function() {
	return this.getBodyPart(ZmMimeTable.TEXT_HTML) != null;
};

// Setters

/**
* Sets the vector of addresses of the given type to the given vector of addresses
*
* @param type	the address type
* @param addrs	a vector of addresses
*/
ZmMailMsg.prototype.setAddresses =
function(type, addrs) {
	this._onChange("adresses", type, addrs);
	this._addrs[type] = addrs;
};

/**
* Sets the vector of addresses of the given type to the address given
*
* @param type	the address type
* @param addr	an address
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
* @param type	the address type
* @param addrs	a vector of addresses
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
* @param type	the address type
* @param addr	an address
*/
ZmMailMsg.prototype.addAddress =
function(addr) {
	var type = addr.type || AjxEmailAddress.TO;
	this._addrs[type].add(addr);
};

/**
* Sets the subject
*
* @param	a subject
*/
ZmMailMsg.prototype.setSubject =
function(subject) {
	this._onChange("subject", subject);
	this.subject = subject;
};

/**
* Sets the message's top part to the given MIME part
*
* @param part	a MIME part
*/
ZmMailMsg.prototype.setTopPart =
function(part) {
	this._onChange("topPart", part);
	this._topPart = part;
};

/**
 * Note: It's assumed by other parts of the code that this._bodyParts
 * is an array of the node properties of ZmMimePart, <em>not</em> the
 * ZmMimePart objects themselves. Therefore, the caller must pass in
 * an array like [ part.node, ... ].
 */
ZmMailMsg.prototype.setBodyParts =
function(parts) {
	this._onChange("bodyParts", parts);
	this._bodyParts = parts;
}

/**
* Sets the ID of any attachments which have already been uploaded.
*
* @param id		an attachment ID
*/
ZmMailMsg.prototype.addAttachmentId =
function(id) {
	if (this._attId) {
		id = this._attId + "," + id;
	}
	this._onChange("attachmentId", id);
	this._attId = id;
};

/**
* Returns the ID of any attachments which have already been uploaded.
*
*/
ZmMailMsg.prototype.getAttachmentId = 
function() {
	return this._attId;
};

ZmMailMsg.prototype.addInlineAttachmentId = function(cid,aid,part){
	if(!this._inlineAtts) {
		this._inlineAtts = [];
	}
	this._onChange("inlineAttachments",aid);
	if(aid){
		this._inlineAtts.push({"cid":cid,"aid":aid});
	}else if(part){
		this._inlineAtts.push({"cid":cid,"part":part});
	}
};

ZmMailMsg.prototype.setInlineAttachments = function(inlineAtts){
	if(inlineAtts){
		this._inlineAtts = inlineAtts;
	}
};

ZmMailMsg.prototype.getInlineAttachments = function(){
	return this._inlineAtts;
};


/**
* Sets the IDs of messages to attach (as a forward)
*
* @param ids	[Array]		list of mail message IDs
*/
ZmMailMsg.prototype.setMessageAttachmentId =
function(ids) {
	this._onChange("messageAttachmentId", ids);
	this._msgAttIds = ids;
};

/**
* Sets the list of attachment (message part) IDs to be forwarded
*
* @param ids	[Array]		list of attachment IDs
*/
ZmMailMsg.prototype.setForwardAttIds =
function(ids) {
	this._onChange("forwardAttIds", ids);
	this._forAttIds = ids;
};

ZmMailMsg.prototype._setFilteredForwardAttIds = function(filteredFwdAttIds){
	
	this._onChange("filteredForwardAttIds",filteredFwdAttIds);
	this._filteredFwdAttIds = filteredFwdAttIds;
	
};


// Actions

/**
 * Fills in the message from the given message node. Whatever attributes and child nodes
 * are available will be used. The message node is not always fully populated, since it
 * may have been created as part of getting a conversation.
 *
 * @param node		a message node
 * @param args		hash of input args
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
 * @param getHtml		[boolean]*		if true, try to fetch html from the server
 * @param forceLoad		[boolean]*		if true, get msg from server
 * @param callback		[AjxCallback]*	async callback
 * @param errorCallback	[AjxCallback]*	async error callback
 * @param noBusyOverlay	[boolean]*		don't put up busy overlay during request
 * @param dontTruncate	[boolean]*		don't set max limit on size of msg body
 */
ZmMailMsg.prototype.load =
function(getHtml, forceLoad, callback, errorCallback, noBusyOverlay, dontTruncate) {
	// If we are already loaded, then don't bother loading
	if (!this._loaded || forceLoad) {
		var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
		var params = {
			sender: appCtxt.getAppController(),
			msgId: this.id,
			getHtml: getHtml,
			callback: respCallback,
			errorCallback: errorCallback,
			noBusyOverlay: noBusyOverlay,
			dontTruncate: dontTruncate
		};
		ZmMailMsg.fetchMsg(params);
	} else {
		this._markReadLocal(true);
		if (callback) {
			callback.run(new ZmCsfeResult()); // return exceptionless result
		}
	}
};

ZmMailMsg.prototype._handleResponseLoad =
function(callback, result) {
	var response = result.getResponse().GetMsgResponse;

	this.clearAddresses();
	
	// clear all participants (since it'll get re-parsed w/ diff. ID's)
	if (this.participants) {
		this.participants.removeAll();
	}

	// clear all attachments
	this._attachments.length = 0;

	this._loadFromDom(response.m[0]);
	var folder = appCtxt.getById(this.folderId);
	var isReadOnly = folder ? folder.isReadOnly() : false;
	if (!isReadOnly) {
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

ZmMailMsg.prototype.getBodyPart =
function(contentType) {

	if (contentType == ZmMimeTable.TEXT_HTML &&
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
	}
};

ZmMailMsg.prototype.getBodyContent =
function() {
	if (this._loaded) {
		var bodyPart = this.getBodyPart();
		return bodyPart ? bodyPart.content : null;
	}

	return null;
};

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

ZmMailMsg.prototype.setHtmlContent =
function(content) {
	this._onChange("htmlContent", content);
	this._htmlBody = content;
};

ZmMailMsg.prototype.sendInviteReply =
function(contactList, edited, componentId, callback, errorCallback, instanceDate, accountName) {
	this._origMsg = this._origMsg || this;

	if (!this._origMsg.invite.hasMultipleComponents()) {
		return this._sendInviteReply(contactList, edited, 0, callback, errorCallback, instanceDate, accountName);
	} else {
		// TODO ... don't understand multiple invites too well yet.
	}
};

ZmMailMsg.prototype._sendInviteReply =
function(contactList, edited, componentId, callback, errorCallback, instanceDate, accountName) {
	var soapDoc = AjxSoapDoc.create("SendInviteReplyRequest", "urn:zimbraMail");

	var id = this._origMsg.id;
	soapDoc.setMethodAttribute("id", id);
	soapDoc.setMethodAttribute("compNum", componentId);

	var verb = "ACCEPT";
	switch (this.inviteMode) {
		case ZmOperation.REPLY_ACCEPT: 		verb = "ACCEPT"; break;
		case ZmOperation.REPLY_DECLINE:		verb = "DECLINE"; break;
		case ZmOperation.REPLY_TENTATIVE: 	verb = "TENTATIVE";	break;
		case ZmOperation.REPLY_NEW_TIME: 	verb = "DELEGATED"; break; // XXX: WRONG MAPPING!
	}

	soapDoc.setMethodAttribute("verb", verb);

	var inv = this._origMsg.getInvite();
	if (this.getAddress(AjxEmailAddress.TO) == null && !inv.isOrganizer()) {
		var to = inv.getSentBy() || inv.getOrganizerEmail();
		this.setAddress(AjxEmailAddress.TO, (new AjxEmailAddress(to)));
	}

	soapDoc.setMethodAttribute("updateOrganizer", "TRUE" );
	if (instanceDate) {
		var serverDateTime = AjxDateUtil.getServerDateTime(instanceDate);
		var timeZone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
        var clientId = AjxTimezone.getClientId(timeZone);
        ZmTimezone.set(soapDoc, clientId, null, true);

        var exceptIdNode = soapDoc.set("exceptId");
        exceptIdNode.setAttribute("d", serverDateTime);
		exceptIdNode.setAttribute("tz", timeZone);
	}

	if (edited) {
		this._createMessageNode(soapDoc, contactList, null, accountName);
	}

	var respCallback = new AjxCallback(this, this._handleResponseSendInviteReply, [callback]);
	var execFrame = new AjxCallback(this, this._sendInviteReply, [contactList, edited, componentId, callback, errorCallback, instanceDate]);
	return this._sendMessage({ soapDoc:soapDoc,
								isInvite:true,
								isDraft:false,
								callback:respCallback,
								errorCallback:errorCallback,
								execFrame:execFrame,
								accountName:accountName });
};

ZmMailMsg.prototype._handleResponseSendInviteReply =
function(callback, result) {
	var resp = result.getResponse();

	var id = resp.id ? resp.id.split("-")[0] : null;

	if (id || resp.status == "OK") {
		this._notifySendListeners();
		this._origMsg.folderId = ZmFolder.ID_TRASH;
	}

	if (callback)
		callback.run(result);
}

/**
* Sends the message out into the world.
*/
ZmMailMsg.prototype.send =
function(contactList, isDraft, callback, errorCallback, accountName) {
	var aName = accountName;
	if (!aName) {
		// only set the account name if this *isnt* the main/parent account
		var acct = appCtxt.getActiveAccount();
		if (acct && !acct.isMain)
			aName = acct.name;
	}

	// if we have an invite reply, we have to send a different soap message
	if (this.isInviteReply && !isDraft) {
		return this.sendInviteReply(contactList, true, 0, callback, errorCallback, this._instanceDate, aName);
	} else {
		var request = isDraft ? "SaveDraftRequest" : "SendMsgRequest";
		var soapDoc = AjxSoapDoc.create(request, "urn:zimbraMail");
		if (!isDraft && this.sendUID)
			soapDoc.setMethodAttribute("suid", this.sendUID);
		this._createMessageNode(soapDoc, contactList, isDraft, aName);

		// if we're sending a draft msg, check if its obo for special handling
		if (this._origMsg && this._origMsg.isDraft) {
			var ac = window.parentAppCtxt || window.appCtxt;
			var mainAcct = ac.getMainAccount().getEmail();
			var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
			// this means we're sending a draft msg obo so reset account name
			if (from && from.address != mainAcct) {
				aName = from.address;
			}
		}

		var respCallback = new AjxCallback(this, this._handleResponseSend, [isDraft, callback]);
		var execFrame = new AjxCallback(this, this.send, [contactList, isDraft, callback, errorCallback]);
		var params = {
			soapDoc: soapDoc,
			isInvite: false,
			isDraft: isDraft,
			accountName: aName,
			callback: respCallback,
			errorCallback: errorCallback,
			execFrame: execFrame
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
}

ZmMailMsg.prototype._createMessageNode =
function(soapDoc, contactList, isDraft, accountName) {

	var msgNode = soapDoc.set("m");

	// if origId is given, means we're saving a draft or sending a msg that was
	// originally a reply/forward
	if (this.origId) {
		msgNode.setAttribute("origid", this.origId);
	}

	// if id is given, means we are re-saving a draft
	if ((isDraft || this.isDraft) && this.id) {
		msgNode.setAttribute("id", this.nId);
	}

	if (this.isForwarded) {
		msgNode.setAttribute("rt", "w");
	} else if (this.isReplied) {
		msgNode.setAttribute("rt", "r");
	}
	if (this.identity) {
		msgNode.setAttribute("idnt", this.identity.id);
	}

    if (this.isHighPriority) {
        msgNode.setAttribute("f", ZmItem.FLAG_HIGH_PRIORITY);
    } else if (this.isLowPriority) {
        msgNode.setAttribute("f", ZmItem.FLAG_LOW_PRIORITY);
    }

    for (var i = 0; i < ZmMailMsg.COMPOSE_ADDRS.length; i++) {
		var type = ZmMailMsg.COMPOSE_ADDRS[i];
		this._addAddressNodes(soapDoc, msgNode, type, contactList, isDraft);
	}
	this._addFrom(soapDoc, msgNode, isDraft, accountName);
	this._addReplyTo(soapDoc, msgNode);

	soapDoc.set("su", this.subject, msgNode);

	var topNode = soapDoc.set("mp", null, msgNode);
	topNode.setAttribute("ct", this._topPart.getContentType());

	var inlineAttsHandled = false;
	// if the top part has sub parts, add them as children
	var numSubParts = this._topPart.children ? this._topPart.children.size() : 0;
	if (numSubParts > 0) {
		for (var i = 0; i < numSubParts; i++) {
			var part = this._topPart.children.get(i);
			var partNode = soapDoc.set("mp", null, topNode);
			partNode.setAttribute("ct", part.getContentType());
			
			//If each part again has subparts, add them as children
			var numSubSubParts = part.children ? part.children.size():0;
			if(numSubSubParts > 0){
				for(var j=0;j<numSubSubParts; j++){
					var subPart = part.children.get(j);
					var subPartNode = soapDoc.set("mp",null,partNode);
					subPartNode.setAttribute("ct",subPart.getContentType());
					soapDoc.set("content",subPart.getContent(),subPartNode);
				}
				//Handle Related SubPart , a specific condition
				if(part.getContentType() == ZmMimeTable.MULTI_RELATED){
					//Handle Inline Attachments
					var inlineAtts = this.getInlineAttachments() || [];
					for(j=0;j<inlineAtts.length;j++){
						var inlineAttNode = soapDoc.set("mp",null,partNode);
						inlineAttNode.setAttribute("ci",inlineAtts[j].cid);
						var attachNode = soapDoc.set("attach", null, inlineAttNode);
						if(inlineAtts[j].aid){
							attachNode.setAttribute("aid", inlineAtts[j].aid);
						}else{
							var attachPartNode = soapDoc.set("mp",null,attachNode);
							var id = (isDraft || this.isDraft) ? (this.id || this.origId) : (this.origId || this.id);
							attachPartNode.setAttribute("mid", id);
							attachPartNode.setAttribute("part", inlineAtts[j].part);
						}
					}
				}
			}else{
				soapDoc.set("content", part.getContent(), partNode);
			}
			//soapDoc.set("content", part.getContent(), partNode);
		}
	} else {
		soapDoc.set("content", this._topPart.getContent(), topNode);
	}

	if (this.irtMessageId)
		soapDoc.set("irt", this.irtMessageId, msgNode);

	if (this._attId ||
		(this._msgAttIds && this._msgAttIds.length) ||
		(this._forAttIds && this._forAttIds.length))
	{
		var attachNode = soapDoc.set("attach", null, msgNode);
		if (this._attId) {
			attachNode.setAttribute("aid", this._attId);
		}

		// attach mail msgs
		if (this._msgAttIds) {
			for (var i = 0; i < this._msgAttIds.length; i++) {
				var node = soapDoc.set("m", null, attachNode);
				node.setAttribute("id", this._msgAttIds[i]);
			}
		}

		// attach msg attachments
		if (this._forAttIds) {
			var attIds = this._filteredFwdAttIds ||  this._forAttIds;
            for (var i = 0; i < attIds.length; i++) {
				// if multiple msgs needs to be attached...
				//Bugi: Broken
				/*if (!this.isDraft) {
					var attNode = soapDoc.set("m", null, attachNode);
					attNode.setAttribute("id", attIds[i]);
				} else {*/
					var msgPartNode = soapDoc.set("mp", null, attachNode);
					// XXX: this looks hacky but we cant send a null ID to the server!
					var id = (isDraft || this.isDraft) ? (this.id || this.origId) : (this.origId || this.id);
					if(!id && this._origMsg) id = this._origMsg.id;
					msgPartNode.setAttribute("mid", id);
					msgPartNode.setAttribute("part", attIds[i]);
				//}
			}
		}
    }
};

/*
* Sends this message to its recipients.
*
* @param soapDoc		[AjxSoapDoc]	SOAP document
* @param isInvite		[boolean]		true if this message is an invite
* @param isDraft		[boolean]		true if this message is a draft
* @param callback		[AjxCallback]	async callback
* @param errorCallback	[AjxCallback]	async error callback
*/
ZmMailMsg.prototype._sendMessage =
function(params) {
	var respCallback = new AjxCallback(this, this._handleResponseSendMessage, [params.isInvite, params.isDraft, params.callback]);

	// bug fix #4325 - its safer to make sync request when dealing w/ new window
	if (window.parentController) {
		var resp = appCtxt.getAppController().sendRequest({soapDoc:params.soapDoc, errorCallback:params.errorCallback, execFrame:params.execFrame});
		if (!resp) return; // bug fix #9154

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
		appCtxt.getAppController().sendRequest({ soapDoc:params.soapDoc,
														asyncMode:true,
														callback:respCallback,
														errorCallback:params.errorCallback,
														execFrame:params.execFrame,
														accountName:params.accountName });
	}
};

ZmMailMsg.prototype._handleResponseSendMessage =
function(bIsInvite, bIsDraft, callback, result) {
	var response = result.getResponse();
	if (bIsInvite)
		result.set(response.SendInviteReplyResponse);
	else if (bIsDraft)
		result.set(response.SaveDraftResponse);
	else
		result.set(response.SendMsgResponse);

	if (callback) callback.run(result);
};


ZmMailMsg.prototype._notifySendListeners =
function() {
	var flag = null;
	if (this.isForwarded) {
		flag = ZmItem.FLAG_FORWARDED;
	} else if (this.isReplied) {
		flag = ZmItem.FLAG_REPLIED;
	}

	if (flag) {
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

	if (type.match(/^image/) && attachment.foundInMsgBody)
		return false;

	// bug fix #8751 - dont ignore text/calendar type if msg is not an invite
	if (type == ZmMimeTable.TEXT_CAL && this.isInvite())
		return false;

	return true;
};

// this is a helper method to get an attachment url for multipart/related content
ZmMailMsg.prototype.getContentPartAttachUrl =
function(contentPartType, contentPart) {
	if (this._attachments &&
		this._attachments.length > 0 &&
		(contentPartType == ZmMailMsg.CONTENT_PART_ID ||
		 contentPartType == ZmMailMsg.CONTENT_PART_LOCATION))
	{
    	for (var i = 0; i < this._attachments.length; i++) {
    		var attach = this._attachments[i];
			if (attach[contentPartType] == contentPart) {
    			return appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&id=" + this.id + "&part=" + attach.part;
    		}
		}
	}
	return null;
}

/**
 * Returns an array of objects containing meta info about attachments to be used
 * to build href's by the caller
*/
ZmMailMsg.prototype.getAttachmentLinks =
function(findHits) {
	// cache the attachment links once they've been generated.
	if (this._attLinks != null)
		return this._attLinks;

	this._attLinks = [];

	if (this._attachments && this._attachments.length > 0) {
		var hrefRoot = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&id=" + this.id + "&amp;part=";

		for (var i = 0; i < this._attachments.length; i++) {
    		var attach = this._attachments[i];

			if (!this.isRealAttachment(attach) ||
				(attach.body && ZmMimeTable.isRenderableImage(attach.ct)))
			{
				continue;
			}

			var props = {};

    		// set a viable label for this attachment
    		props.label = attach.name || attach.filename || (ZmMsg.unknown + " <" + attach.ct + ">");

			// use content location instead of built href flag
    		var useCL = false;
			// set size info in any
    		if (attach.s && attach.s > 0) {
    		    if (attach.s < 1024)		props.size = attach.s + " B";
                else if (attach.s < 1024^2)	props.size = Math.round((attach.s / 1024) * 10) / 10 + " KB";
                else 						props.size = Math.round((attach.s / (1024*1024)) * 10) / 10 + " MB";
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
			} else {
				// set the anchor html for the link to this attachment on the server
				var url = useCL ? attach.cl : (hrefRoot + attach.part);

				// bug fix #6500 - append filename w/in so "Save As" wont append .html at the end
				if (!useCL) {
					var insertIdx = url.indexOf("?auth=co&");
					var fn = AjxStringUtil.urlComponentEncode(attach.filename);
					fn = fn.replace(/'/g, "%27");
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

				if( (attach.name || attach.filename) && appCtxt.get(ZmSetting.BRIEFCASE_ENABLED) ){
					var onclickStr1 = "ZmMailMsgView.briefcaseCallback(" + this.id + ",\"" + attach.part + "\",\""+props.label+"\");";
					props.briefcaseLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr1 + "'>";
				}

				if (!useCL) {
					// check for vcard *first* since we dont care to view it in HTML
					if (attach.ct == ZmMimeTable.TEXT_VCARD)
					{
						var onclickStr = "ZmMailMsgView.vcardCallback(" + this.id + ",\"" + attach.part + "\");";
						props.vcardLink = "<a style='text-decoration:underline' class='AttLink' href='javascript:;' onclick='" + onclickStr + "'>";
					}
					else if (attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct) &&
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
			}

			// set the link icon
			var mimeInfo = ZmMimeTable.getInfo(attach.ct);
			props.linkIcon = mimeInfo ? mimeInfo.image : "GenericDoc";
	        props.ct = attach.ct;
	        
			// set other meta info
			props.isHit = findHits && this._isAttInHitList(attach);
			props.part = attach.part;
			if (!useCL)
				props.url = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&id=" + this.id + "&part=" + attach.part;
			
			if(attach.ci){
				props.ci = attach.ci;
			}
			
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
	if (msgNode.cm) 	{ this._inHitList = msgNode.cm; }
	if (msgNode.su) 	{ this.subject = msgNode.su; }
	if (msgNode.fr) 	{ this.fragment = msgNode.fr; }
	if (msgNode.rt) 	{ this.rt = msgNode.rt; }
	if (msgNode.idnt)	{ this.identity = appCtxt.getIdentityCollection().getById(msgNode.idnt); }
	if (msgNode.origid) { this.origId = msgNode.origid; }
	if (msgNode.hp) 	{ this._attHitList = msgNode.hp; }
	if (msgNode.mid)	{ this.messageId = msgNode.mid; }
	if (msgNode._attrs) { this.attrs = msgNode._attrs; }

	// set the "normalized" Id if this message belongs to a shared folder
	var idx = this.id.indexOf(":");
	this.nId = (idx != -1) ? (this.id.substr(idx + 1)) : this.id;

	if (msgNode._convCreateNode) {
		this._convCreateNode = msgNode._convCreateNode;
	}

	// update conv's folder list
	if (msgNode.cid && msgNode.l) {
		var conv = appCtxt.getById(msgNode.cid);
		if (conv) {
			conv.folders[msgNode.l] = true;
		}
	}

	// always call parseFlags even if server didnt return any
	this._parseFlags(msgNode.f);

	if (msgNode.mp) {
		var params = {attachments: this._attachments, bodyParts: this._bodyParts};
		this._topPart = ZmMimePart.createFromDom(msgNode.mp, params);
		this._loaded = this._bodyParts.length > 0 || this._attachments.length > 0;
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
            //bug:18613
            var desc = this.invite.getComponentDescription();
            if((this._bodyParts.length == 0) && desc){
                var textPart = new Object();
                textPart.ct = ZmMimeTable.TEXT_PLAIN;
                textPart.s = desc.length;
                textPart.content = desc;
                this._bodyParts.push(textPart);
            }
            this._loaded = this._bodyParts.length > 0  || this._attachments.length > 0;
        } catch (ex) {
			// do nothing - this means we're trying to load an ZmInvite in new
			// window, which we dont currently load (re: support).
		}
	}
};

ZmMailMsg.prototype.isInvite =
function () {
	return (this.invite != null);
};

ZmMailMsg.prototype.needsRsvp =
function () {
	return (this.isInvite() && this.invite.shouldRsvp() && !this.invite.isOrganizer());
};

/**
 * returns an ZmInvite object
 */
ZmMailMsg.prototype.getInvite =
function() {
	return this.invite;
};

// Adds child address nodes for the given address type.
ZmMailMsg.prototype._addAddressNodes =
function(soapDoc, parent, type, contactList, isDraft) {
	var addrs = this._addrs[type];
	var num = addrs.size();
	for (var i = 0; i < num; i++) {
		var addr = addrs.get(i);
		var email = addr.getAddress();
		var e = soapDoc.set("e", null, parent);
		e.setAttribute("t", AjxEmailAddress.toSoapType[type]);
		e.setAttribute("a", email);

		// tell server to add this email to address book if not found
		if (contactList && !isDraft && appCtxt.get(ZmSetting.AUTO_ADD_ADDRESS) &&
			!contactList.getContactByEmail(email)) {

			DBG.println(AjxDebug.DBG2, "adding contact: " + email);
			e.setAttribute("add", "1");
		}
		var name = addr.getName();
		if (name)
			e.setAttribute("p", name);
	}
};

ZmMailMsg.prototype._addFrom =
function(soapDoc, parent, isDraft, accountName) {
	var ac = window.parentAppCtxt || window.appCtxt;

	if (accountName)
	{
		// when saving a draft, even if obo, we do it on the main account so reset the from
		if (isDraft) {
			var folder = appCtxt.getById(this.folderId);
			if (folder && folder.isRemote()) {
				accountName = folder.getOwner();
			}
		}
		var from = soapDoc.set("e", null, parent);
		from.setAttribute("t", "f");
		from.setAttribute("a", accountName);

		// the main account is *always* the sender
		var sender = soapDoc.set("e", null, parent);
		sender.setAttribute("t", "s");
		sender.setAttribute("a", ac.getMainAccount().getEmail());
	}
	else if (this.identity)
	{
		var e = soapDoc.set("e", null, parent);
		e.setAttribute("t", "f");

		// bug fix #20630 - handling sending drafts obo
		if (this._origMsg && this._origMsg.isDraft) {
			var mainAcct = ac.getMainAccount().getEmail();
			var from = this._origMsg.getAddresses(AjxEmailAddress.FROM).get(0);
			// this means we're sending a draft msg obo
			if (from && from.address != mainAcct) {
				e.setAttribute("a", from.address);
				// if sending obo, always set sender as main account
				var sender = soapDoc.set("e", null, parent);
				sender.setAttribute("t", "s");
				sender.setAttribute("a", mainAcct);
				return;
			}
		}

		e.setAttribute("a", this.identity.sendFromAddress);
		var name = this.identity.sendFromDisplay;
		if (name) {
			e.setAttribute("p", name);
		}
	}
};

ZmMailMsg.prototype._addReplyTo =
function(soapDoc, parent) {
	if (this.identity) {
		if (this.identity.setReplyTo && this.identity.setReplyToAddress) {
			var e = soapDoc.set("e", null, parent);
			e.setAttribute("t", "r");
			e.setAttribute("a", this.identity.setReplyToAddress);
			if (this.identity.setReplyToDisplay) {
				e.setAttribute("p", this.identity.setReplyToDisplay);
			}
		}
	}
};

ZmMailMsg.prototype._isAttInHitList =
function(attach) {
	for (var i = 0; i < this._attHitList.length; i++) {
		if (attach.part == this._attHitList[i].part)
			return true;
	}

	return false;
};

ZmMailMsg.prototype._onChange =
function(what, a, b, c) {
	if (this.onChange && this.onChange instanceof AjxCallback)
		this.onChange.run(what, a, b, c);
};

ZmMailMsg.prototype.getPrintHtml =
function(preferHtml, callback) {
	ZmMailMsgView.getPrintHtml(this, preferHtml, callback);
};

ZmMailMsg.prototype.getStatusIcon =
function() {
	var imageInfo;
	if (this.isInvite())		{ imageInfo = "Appointment"; }
	else if (this.isDraft)		{ imageInfo = "MsgStatusDraft"; }
	else if (this.isReplied)	{ imageInfo = "MsgStatusReply"; }
	else if (this.isForwarded)	{ imageInfo = "MsgStatusForward"; }
	else if (this.isSent)		{ imageInfo = "MsgStatusSent"; }
	else						{ imageInfo = this.isUnread ? "MsgStatusUnread" : "MsgStatusRead"; }

	return imageInfo;
};

ZmMailMsg.prototype.notifyModify =
function(obj) {
	if (obj.cid != null) {
		this.cid = obj.cid;
	}

	ZmMailItem.prototype.notifyModify.apply(this, arguments);
};
