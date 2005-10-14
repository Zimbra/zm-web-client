/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a new (empty) mail message.
* @constructor
* @class
* This class represents a mail message.
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param id			[int]			unique ID
* @param list		[ZmMailList]	list that contains this message
*/
function ZmMailMsg(appCtxt, id, list) {
	
	ZmMailItem.call(this, appCtxt, ZmItem.MSG, id, list);

	this._loaded = false;
	this._inHitList = false;
	this._attHitList = new Array();
	this._attachments = new Array();
	this._bodyParts = new Array();
	this._addrs = new Array();

	for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		this._addrs[type] = new AjxVector();
	}
};

ZmMailMsg.prototype = new ZmMailItem;
ZmMailMsg.prototype.constructor = ZmMailMsg;

ZmMailMsg.ADDRS = [ZmEmailAddress.FROM, ZmEmailAddress.TO, ZmEmailAddress.CC, ZmEmailAddress.BCC, ZmEmailAddress.REPLY_TO];

ZmMailMsg.HDR_FROM		= ZmEmailAddress.FROM;
ZmMailMsg.HDR_TO		= ZmEmailAddress.TO;
ZmMailMsg.HDR_CC		= ZmEmailAddress.CC;
ZmMailMsg.HDR_BCC		= ZmEmailAddress.BCC;
ZmMailMsg.HDR_REPLY_TO	= ZmEmailAddress.REPLY_TO;
ZmMailMsg.HDR_DATE		= ZmEmailAddress.LAST_ADDR + 1;
ZmMailMsg.HDR_SUBJECT	= ZmEmailAddress.LAST_ADDR + 2;

ZmMailMsg.HDR_KEY = new Object();
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_FROM] = ZmMsg.from;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_TO] = ZmMsg.to;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_CC] = ZmMsg.cc;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_BCC] = ZmMsg.bcc;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_REPLY_TO] = ZmMsg.replyTo;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_DATE] = ZmMsg.sent;
ZmMailMsg.HDR_KEY[ZmMailMsg.HDR_SUBJECT] = ZmMsg.subject;

/**
 * static method which will fetch a message from the server.
 * @param sender - (Object) the object which has a method called sendRequest.
 * @param msgId - (int) the id to be fetched.
 * @param getHtml - whether to fetch html from the server ( if possible ).
 */
ZmMailMsg.fetchMsg = 
function(sender, msgId, getHtml, callback, errors) {
	var soapDoc = AjxSoapDoc.create("GetMsgRequest", "urn:zimbraMail", null);
	var msgNode = soapDoc.set("m");
	msgNode.setAttribute("id", msgId);
	msgNode.setAttribute("read", "1");
	if (getHtml) {
		msgNode.setAttribute("html", "1");
	}
	var respCallback = new AjxCallback(null, ZmMailMsg._handleGetMsgResponse, callback);
	sender.sendRequest(soapDoc, true, respCallback, errors);
};

ZmMailMsg._handleGetMsgResponse =
function(args) {
	var callback	= args[0];
	var result		= args[1];
	if (callback) callback.run(result);
}

// Public methods

ZmMailMsg.prototype.toString = 
function() {
	return "ZmMailMsg";
};

// Getters

/**
* Returns a vector of addresses of the given type
*
* @param type		an email address type
*/
ZmMailMsg.prototype.getAddresses =
function(type) {
	return this._addrs[type];
};

ZmMailMsg.prototype.getInviteOrganizer =
function() {
	return this.isInvite()
		? this.invite.getOrganizerEmail(0)
		: null;
};

/**
* Returns a Reply-To address if there is one, otherwise the From address
* unless this message was sent by the user, in which case, it is the To
* field (but only in the case of a Reply All - phew!
*/
ZmMailMsg.prototype.getReplyAddresses =
function(mode) {
	var rtVec = this._addrs[ZmEmailAddress.REPLY_TO];
	var addrs = null;
	var address = null;
	// TODO: when the server starts sending the organizer in the invite,
	// we will have to check for it when responding to the reply address
	// question.
	if (this.isInvite() && this.needsRsvp()){
		address = this.invite.getOrganizerEmail(0);
	} 
	// If the organizer email, for some reason, was null, use the email headers.
	if (address == null ) {
		if (rtVec.size()) {
			addrs = rtVec;
		} else {
			addrs = this.isSent && mode == ZmOperation.REPLY_ALL
			? this._addrs[ZmEmailAddress.TO]
			: this._addrs[ZmEmailAddress.FROM];
		}
		address = addrs.toString(ZmEmailAddress.SEPARATOR);
	}
	return address;
};

/**
* Returns the first address in the vector of addresses of the given type
*/
ZmMailMsg.prototype.getAddress =
function(type) {
	return this._addrs[type].get(0);
};

/**
* Returns the subject
*/
ZmMailMsg.prototype.getSubject =
function() {
	return this.subject;
};

/**
* Returns the date
*/
ZmMailMsg.prototype.getDate =
function() {
	return this.date;
};

/**
* Returns the size of the message content
*/
ZmMailMsg.prototype.getSize =
function() {
	return this.size;
};

/**
* Returns the message ID
*/
ZmMailMsg.prototype.getId =
function() {
	return this.id;
};

/**
* Returns the message's conversation ID, if any
*/
ZmMailMsg.prototype.getConvId =
function() {
	return this.cid;
};

ZmMailMsg.prototype.getHeaderStr =
function(hdr) {
	if (hdr == ZmMailMsg.HDR_DATE) {
		return this.sentDate ? ZmMailMsg.HDR_KEY[hdr] + ": " + (new Date(this.sentDate)).toLocaleString() : "";
	} else if (hdr == ZmMailMsg.HDR_SUBJECT) {
		var subj = this.getSubject();
		return subj ? ZmMailMsg.HDR_KEY[hdr] + ": " + subj : "";
	} else if (hdr <= ZmEmailAddress.LAST_ADDR) {
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

/**
* Returns true if this message's properties have been filled in
*/
ZmMailMsg.prototype.isLoaded =
function() {
	return this._loaded;
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
	this._addrs[type].removeAll();
	this._addrs[type] = new AjxVector();
	this._addrs[type].add(addr);
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
	for (var i = 0; i < size; i++)
		this._addrs[type].add(addrs.get(i));
};

/**
* Adds the given address to the vector of addresses of the given type
*
* @param type	the address type
* @param addr	an address
*/
ZmMailMsg.prototype.addAddress =
function(addr) {
	var type = addr.type || ZmEmailAddress.TO;
	this._addrs[type].add(addr);
};

/**
* Sets the subject
*
* @param	a subject
*/
ZmMailMsg.prototype.setSubject =
function(subject) {
	this.subject = subject;
};

/**
* Sets the message's top part to the given MIME part
*
* @param part	a MIME part
*/
ZmMailMsg.prototype.setTopPart =
function(part) {
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
	this._bodyParts = parts;
}

/**
* Sets the ID of any attachments which have already been uploaded.
*
* @param id		an attachment ID
*/
ZmMailMsg.prototype.setAttachmentId =
function(id) {
	this._attId = id;
};

/**
* Sets the ID of a message to attach (as a forward)
*
* @param id		an message ID
*/
ZmMailMsg.prototype.setMessageAttachmentId =
function(id) {
	this._msgAttId = id;
};

/**
* Sets the list of attachment (message part) IDs to be forwarded
* - This list will only be set for any msgs containing attachments that need to be forwarded 
*
* @param id		list of attachment IDs
*/
ZmMailMsg.prototype.setForwardAttIds = 
function(forAttIds) {
	this._forAttIds = forAttIds;
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
	var msg = new ZmMailMsg(args.appCtxt, node.id, args.list);
	msg._loadFromDom(node);
	return msg;
};

/**
* Gets the full message object from the back end based on the current message ID, and
* fills in the message.
*
* @param getHtml		
*/
ZmMailMsg.prototype.load =
function(getHtml, forceLoad, callback, errors) {
	// If we are already loaded, then don't bother loading
	if (!this._loaded || forceLoad) {
		var respCallback = new AjxCallback(this, this._handleResponseLoad, callback);
		ZmMailMsg.fetchMsg(this._appCtxt.getAppController(), this.id, getHtml, respCallback, errors);
	} else {
		this._markReadLocal(true);
		if (callback) callback.run(new ZmCsfeResult()); // return exceptionless result
	}
};

ZmMailMsg.prototype._handleResponseLoad =
function(args) {

	var callback	= args[0];
	var result		= args[1];

	var response = result.getResponse().GetMsgResponse;

	// clear address vectors
	for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		this._addrs[type].removeAll();
	}
	
	// clear all participants (since it'll get re-parsed w/ diff. ID's)
	this.participants.removeAll();
	for (var i in this._participantHash)
		delete this._participantHash[i];
		
	// clear all attachments
	this._attachments.length = 0;	

	this._loadFromDom(response.m[0]);
	this._markReadLocal(true);
	
	// return result so callers can check for exceptions if they want
	if (callback) callback.run(result);
};

ZmMailMsg.prototype.getBodyParts = 
function() {
	return this._bodyParts;
}

ZmMailMsg.prototype.getBodyPart =
function(contentType) {

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
	} else {
		var respCallback = new AjxCallback(this, this._handleResponseGetTextPart, callback);
		ZmMailMsg.fetchMsg(this._appCtxt.getAppController(), this.getId(), false, respCallback);
	}
};

ZmMailMsg.prototype._handleResponseGetTextPart =
function(args) {
	var callback	= args[0];
	var result		= args[1];
	
	var response = result.getResponse();
	this._loadFromDom(response.m[0]);
	bodyPart = this.getBodyPart(ZmMimeTable.TEXT_PLAIN);
	result.set(bodyPart ? bodyPart.content : null);
	if (callback) callback.run(result);
};

// we may want to set the text part w/o requesting it from the server 
// (i.e. if we already have the HTML part)
ZmMailMsg.prototype.setTextPart = 
function(textPartStr) {
	var textPart = new Object();
	textPart.ct = ZmMimeTable.TEXT_PLAIN;
	textPart.s = textPartStr.length;
	textPart.content = textPartStr;
	// XXX: not sure whether these params should be faked
	//textPart.body = 
	//textPart.part = 
	this._bodyParts.push(textPart);
};

ZmMailMsg.prototype.setHtmlContent =
function(content) {
	this._htmlBody = content;
};

ZmMailMsg.prototype.sendInviteReply = 
function(contactList, edited, componentId) {
	var ed = edited || false;
	if (!this._origMsg) {
		this._origMsg = this;
	}
	if (!this._origMsg.invite.hasMultipleComponents()) {
		return this._sendInviteReply(contactList, ed, 0);
	} else {
		// TODO ... don't understand multiple invites too well yet.
	}
};

ZmMailMsg.prototype._sendInviteReply = 
function (contactList, edited, componentId) {
	var soapDoc = AjxSoapDoc.create("SendInviteReplyRequest", "urn:zimbraMail");

	var id = this._origMsg.id;
	soapDoc.setMethodAttribute("id", id);
	soapDoc.setMethodAttribute("compNum", componentId);

	var verb = "ACCEPT";
	switch (this.inviteMode) {
		case ZmOperation.REPLY_ACCEPT: 		verb = "ACCEPT"; break;
		case ZmOperation.REPLY_DECLINE:		verb = "DECLINE"; break;
		case ZmOperation.REPLY_TENTATIVE: 	verb = "TENTATIVE";	break;
		case ZmOperation.REPLY_NEW_TIME: 	verb = "DELEGATED"; break; // ?? IS THIS MAPPING RIGHT
	}

	soapDoc.setMethodAttribute("verb", verb);

	if (this.getAddress(ZmEmailAddress.TO) == null && !this._origMsg.invite.isOrganizer(0)) {
		var toEmail = this._origMsg.getInvite().getOrganizerEmail(0);
		var to = new ZmEmailAddress(toEmail, ZmEmailAddress.TO, null, null);
		this.setAddress(ZmEmailAddress.TO, to);
	}

	//soapDoc.setMethodAttribute("updateOrganizer", (edited? "FALSE":"TRUE") );
	soapDoc.setMethodAttribute("updateOrganizer", "TRUE" );
	if (edited)
		this._createMessageNode(soapDoc, contactList);

	var resp = this._sendMessage(soapDoc, true);
	var id = resp.id ? resp.id.split("-")[0] : null;
	
	if (id || resp.status == "OK") {
		this._notifySendListeners();
		this._origMsg.folderId = ZmFolder.ID_TRASH;
		this._origMsg._listNotify(ZmEvent.E_MOVE);
	}

	// map this to an int?
	return (id || status);
};

/**
* Sends the message out into the world.
*/
ZmMailMsg.prototype.send =
function(contactList, isDraft) {
	// TODO - allow invite replies when the server gets updated.
	// if we have an invite reply, we have to send a different soap message

	////////////////////////////////////////////////////////////////////////////////////////
	// XXX: not sure how saving a invite draft works?!
	////////////////////////////////////////////////////////////////////////////////////////
	if (this.isInviteReply && !isDraft) {
		return this.sendInviteReply(contactList, true, 0);
	} else {
		var request = isDraft ? "SaveDraftRequest" : "SendMsgRequest";
		var soapDoc = AjxSoapDoc.create(request, "urn:zimbraMail");
		// TODO - return code and put up status message
		this._createMessageNode(soapDoc, contactList, isDraft);
		var resp = this._sendMessage(soapDoc, false, isDraft).m[0];
		
		// notify listeners of successful send message
		if (!isDraft) {
			if (resp.id || !this._appCtxt.get(ZmSetting.SAVE_TO_SENT))
				this._notifySendListeners();
			return resp.id;
		} else {
			this._loadFromDom(resp);
			return this;
		}
	}	
};

ZmMailMsg.prototype._createMessageNode = 
function(soapDoc, contactList, isDraft) {

	var msgNode = soapDoc.set("m");

	// if origId is given, means we're saving a draft or sending a msg that was 
	// originally a reply/forward
	if (this.origId)
		msgNode.setAttribute("origid", this.origId);

	// if id is given, means we are re-saving a draft
	if (isDraft && this.id)
		msgNode.setAttribute("id", this.id);

	if (this.isForwarded) {
		msgNode.setAttribute("rt", "w");
	} else if (this.isReplied) {
		msgNode.setAttribute("rt", "r");
	}

	for (var i = 0; i < ZmComposeView.ADDRS.length; i++) {
		var type = ZmComposeView.ADDRS[i];		
		this._addAddressNodes(soapDoc, msgNode, type, contactList, isDraft);
	}

	soapDoc.set("su", this.subject, msgNode);
	
	var topNode = soapDoc.set("mp", null, msgNode);
	topNode.setAttribute("ct", this._topPart.getContentType());

	// if the top part has sub parts, add them as children
	var numSubParts = this._topPart.children ? this._topPart.children.size() : 0;
	if (numSubParts > 0) {
		for (var i = 0; i < numSubParts; i++) {
			var part = this._topPart.children.get(i);
			var partNode = soapDoc.set("mp", null, topNode);
			partNode.setAttribute("ct", part.getContentType());
			soapDoc.set("content", part.getContent(), partNode);
		}
	} else {
		soapDoc.set("content", this._topPart.getContent(), topNode);
	}
	
	if (this.irtMessageId){
		soapDoc.set("irt", this.irtMessageId, msgNode);
	}
	
	if (this._attId || this._msgAttId || 
		(this._forAttIds && this._forAttIds.length)) {
		var attachNode = soapDoc.set("attach", null, msgNode);
		if (this._attId){
			attachNode.setAttribute("aid", this._attId);
		}
		if (this._msgAttId) {
			var msgNode = soapDoc.set("m", null, attachNode);
			msgNode.setAttribute("id", this._msgAttId);
		}
		if (this._forAttIds) {
			for (var i = 0; i < this._forAttIds.length; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				var id = isDraft ? (this.id || this.origId) : this.origId;
				msgPartNode.setAttribute("mid", id);
				msgPartNode.setAttribute("part", this._forAttIds[i]);
			}
		}
	}
};

ZmMailMsg.prototype._sendMessage = 
function(soapDoc, bIsInvite, bIsDraft) {
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	if (bIsInvite)
		return resp.SendInviteReplyResponse;
	else if (bIsDraft)
		return resp.SaveDraftResponse;
	else
		return resp.SendMsgResponse;
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
		this._origMsg._listNotify(ZmEvent.E_FLAGS, {flags: [flag]});
	}
};

ZmMailMsg.prototype.isRealAttachment = 
function(attachment) {
	var type = attachment.ct;
	if (ZmMimeTable.isIgnored(type) || attachment.body) 
		return false;

	// EMC 8/1/2005 -- TEMPORARY HACK
	// If there is a content id, we need to see if the part is referenced in the body 
	// of the message. However, currently, we do the attachment creation rather early in
	// the rendering process, so  .... We're making the assumption that image types are the 
	// ones that will be included, and that all other types, with a content id, should be
	// rendered as a valid attachment.
	// THIS SHOULD BE REMOVED.                                                       // below added for bug fix #3361
	if (type.match(/^image/) && ((attachment.ci != null) || ((attachment.cl != null) && !attachment.cl.match(".*//")))) {
		return false;
	}
	return true;
};


// this is a helper method to get an attachment url for multipart/related content
ZmMailMsg.prototype.getContentIdAttachUrl = 
function(cid,domain) {
	if (this._attachments && this._attachments.length > 0) {
	    	for (var i = 0; i < this._attachments.length; i++) {
	    		var attach = this._attachments[i];
	    		if (attach.ci == cid) {
	    			return location.protocol+"//" + domain + 
	    					this._appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) +
	    					"id=" + this.getId() + "&part=" + attach.part;
	    		}
    		}
	}
	return null;
}

// this is a helper method to get an attachment url for multipart/related content
ZmMailMsg.prototype.getContentLocationAttachUrl = 
function(cl,domain) {
	if (this._attachments && this._attachments.length > 0) {
	    	for (var i = 0; i < this._attachments.length; i++) {
	    		var attach = this._attachments[i];
	    		if (attach.cl == cl) {
	    			return location.protocol+"//" + domain + 
	    					this._appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) +
	    					"id=" + this.getId() + "&part=" + attach.part;
	    		}
    		}
	}
	return null;
}

// this is a helper method to build a list of attachment links in html
ZmMailMsg.prototype.buildAttachLinks = 
function(bFindHits, domain, partNameList) {
	var attLinks = new Array();

	if (this._attachments && this._attachments.length > 0) {
		var csfeMsgFetchSvc = location.protocol+"//" + domain + this._appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
    	var hrefRoot = "href='" + csfeMsgFetchSvc + "id=" + this.getId() + "&amp;part=";
    	
    	for (var i = 0; i < this._attachments.length; i++) {
    		var attach = this._attachments[i];
			type = attach.ct;
			
			if (!this.isRealAttachment(attach))
    			continue;
    		
    		// get a viable label for this attachment
    		var label = attach.name || attach.filename || (ZmMsg.unknown + " <" + type + ">");
    		
    		// start building html
    		var mimeInfo = ZmMimeTable.getInfo(type);
			var attProps = new Object;
			var htmlArr = new Array();
			var idx = 0;

			// get size info in any
			var sizeText = "";
    		var size = attach.s;
    		if (size != null) {
    		    if (size < 1024)		sizeText = " (" + size + "B)&nbsp;";
                else if (size < 1024^2)	sizeText = " (" + Math.round((size/1024) * 10) / 10 + "KB)&nbsp;"; 
                else 					sizeText = " (" + Math.round((size / (1024*1024)) * 10) / 10 + "MB)&nbsp;"; 
    		}

			// calc. widths of all data involved
    		var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
    		var encLabel = "&nbsp;" + AjxStringUtil.htmlEncode(label) + "&nbsp;";
    		var labelWidth = Dwt.getHtmlExtent(encLabel).x;
    		// The 5 is for padding for IE
    		labelWidth += sizeText ? Dwt.getHtmlExtent(sizeText).x + 5 : 0;
    		var iconLabelWidth = 16 + labelWidth;

			// set link
		    var link = type == ZmMimeTable.MSG_RFC822
		    	? "<a href='javascript:;' onclick='ZmMailMsg.rfc822Callback(this," + this.getId() + ",\"" + attach.part + "\")' class='AttLink'>"
		    	: "<a target='att_view_win' class='AttLink' " + hrefRoot + attach.part + "'>";

    		htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 style='display:inline; width:";
    		htmlArr[idx++] = iconLabelWidth;
    		htmlArr[idx++] = "'><tr><td style='width:" + iconLabelWidth + "'>";

    		htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 style='display:inline; width:";
    		htmlArr[idx++] = iconLabelWidth;
    		htmlArr[idx++] = "'><tr><td style='width:" + icon[1] + "'>";

			// position:relative required to make this work in FF    		
     		htmlArr[idx++] =  link + AjxImg.getImageHtml(icon, "position:relative;") + "</a>";
    		htmlArr[idx++] = "</td><td style='white-space:nowrap; width:" + labelWidth + "'>";
    		
    		// if this attachment is a match for the current search, set class name
    		if (bFindHits && this._isAttInHitList(attach)) {
	    		htmlArr[idx++] = "<span class='AttName-matched'>" + link + encLabel + sizeText + "</a></span>";
	    	} else {
				htmlArr[idx++] = link + encLabel +  sizeText +  "</a>";
		    }

    		htmlArr[idx++] = "</td></tr></table></td>";
//    		if (sizeWidth > 0)
//	    		htmlArr[idx++] = "<td style='width:" + sizeWidth + "'>" + sizeText + "&nbsp;</td>";
//	    	else
//	    		htmlArr[idx++] = "&nbsp;</td>";
	    	htmlArr[idx++] = "</tr></table>";
    		
    		attProps.html = htmlArr.join("");
    		attProps.mpId = attach.part;
    		attLinks.push(attProps);
    	}
    }
	
	return attLinks;
};

// Private methods

// Processes a message node, getting attributes and child nodes to fill in the message.
ZmMailMsg.prototype._loadFromDom =
function(msgNode) {
	// this method could potentially be called twice (SearchConvResponse and 
	// GetMsgResponse) so always check param before setting!
	if (msgNode.cid) 	this.cid = msgNode.cid;
	if (msgNode.s) 		this.size = msgNode.s;
	if (msgNode.d) 		this.date = msgNode.d;
	if (msgNode.sd) 	this.sentDate = msgNode.sd;
	if (msgNode.l) 		this.folderId = msgNode.l;
	if (msgNode.t) 		this._parseTags(msgNode.t);
	if (msgNode.f) 		this._parseFlags(msgNode.f);
	if (msgNode.cm) 	this._inHitList = msgNode.cm;
	if (msgNode.su) 	this.subject = msgNode.su;
	if (msgNode.fr) 	this.fragment = msgNode.fr;
	if (msgNode.rt) 	this.rt = msgNode.rt;
	if (msgNode.origid) this.origId = msgNode.origid;
	if (msgNode.hp) 	this._attHitList = msgNode.hp;

	if (msgNode.mp) {
		var params = {attachments: this._attachments, bodyParts: this._bodyParts};
		this._topPart = ZmMimePart.createFromDom(msgNode.mp, params);
		this._loaded = this._bodyParts.length > 0 || this._attachments.length > 0;
	}
	
	if (msgNode.shr) {
		// TODO: Make server output better msgNode.shr property...
		var shareXmlDoc = AjxXmlDoc.createFromXml(msgNode.shr[0].content);
		this.share = ZmShareInfo.createFromDom(shareXmlDoc.getDoc());
		this.share._msgId = msgNode.id;
	}

	if (msgNode.e && this.participants.size() == 0) {
		for (var i = 0; i < msgNode.e.length; i++)
			this._parseParticipantNode(msgNode.e[i]);

		var parts = this.participants.getArray();
		for (var j = 0; j < parts.length; j++ )
			this.addAddress(parts[j]);
	}

	if (msgNode.inv) {
		this.invite = ZmInvite.createFromDom(msgNode.inv);
		this.invite.setMessageId (this.id);
	}
};

ZmMailMsg.prototype.isInvite =
function () {
	return (this.invite != null);
};

ZmMailMsg.prototype.needsRsvp =
function () {
	return (this.isInvite() && this.invite.shouldRsvp(0) && !this.invite.isOrganizer(0));
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
		e.setAttribute("t", ZmEmailAddress.toSoapType[type]);
		e.setAttribute("a", email);
		// tell server to add this email to address book if not found
		if (!isDraft && this._appCtxt.get(ZmSetting.AUTO_ADD_ADDRESS) && !contactList.getContactByEmail(email)) {
			DBG.println(AjxDebug.DBG2, "adding contact: " + email);
			e.setAttribute("add", "1");
		}
		var name = addr.getName();
		if (name)
			e.setAttribute("p", name);
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

// XXX: HACK HACK HACK
// This hack allows a user to view rfc/822 messages (message which are forwarded as attachments)
// W/o a proper windowing model, there is no nice way to catch exceptions or allow inter-window
// communication. Additionally, since we cant get access to the app controller to invoke a server
// request, we will lose any notifications that may come in as a result of an invoke().
ZmMailMsg.rfc822Callback = 
function(anchorEl, msgId, msgPartId) {

	// get the reference to ZmMailMsgView from the anchor element
	var msgView = anchorEl;
	while (msgView != null && (Dwt.getObjectFromElement(msgView) instanceof ZmMailMsgView == false))
		msgView = msgView.parentNode;

	if (msgView) msgView = Dwt.getObjectFromElement(msgView);
	if (!msgView) return;
	
	var controller = msgView._appCtxt.getAppController();
	if (!controller) return;

	try {
		var soapDoc = AjxSoapDoc.create("GetMsgRequest", "urn:zimbraMail");
		var msgNode = soapDoc.set("m");
		msgNode.setAttribute("id", msgId);
		msgNode.setAttribute("part", msgPartId);
		var resp = controller.sendRequest(soapDoc).GetMsgResponse;

		// validate response
		if (resp == null || resp.m == null || resp.m[0] == null ||
			resp.m[0].id != msgId || resp.m[0].part != msgPartId)
		{
			return;
		}

		// parse rfc/822 into ZmMailMsg
		var msg = new ZmMailMsg(msgView._appCtxt, msgId);
		msg._loadFromDom(resp.m[0]);
		msg._loaded = true;

		// create temp msg view off current msg view
		var tmpMsgView = new ZmMailMsgView(msgView, null, DwtControl.ABSOLUTE_STYLE, ZmController.MSG_NEW_WIN_VIEW);
		Dwt.setVisible(tmpMsgView.getHtmlElement(), false);
		tmpMsgView.set(msg, true);

		// generate html document for new window
		var html = new Array();
		var idx = 0;
		html[idx++] = "<html><head>";
		html[idx++] = "<style type='text/css'>";
		html[idx++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/common.css); -->";
		html[idx++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/dwt.css); -->";
		html[idx++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/msgview.css); -->";
		html[idx++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/zm.css); -->";
		html[idx++] = "</style></head>";
		html[idx++] = "<body style='margin: 0px;' oncontextmenu='return false'>";
		html[idx++] = "<div style='height: 100%; overflow: auto' class='ZmMailMsgView'>";
		html[idx++] = tmpMsgView.getHtmlElement().innerHTML;
		html[idx++] = "</div>";
		html[idx++] = "</body></html>";

		// create new popup window and set content
		var winName = "win" + Dwt.getNextId();
		var win = window.open("", winName, "location=no,resizable=yes,menubar=no,scrollbar=yes,status=yes,toolbar=no,width=550,height=500");
		win.document.open();
		win.document.writeln(html.join(""));
		win.document.close();
	} catch (ex) {
		var params = {anchorEl: anchorEl, msgId: msgId, msgPartId: msgPartId};
		controller._handleException(ex, ZmMailMsg.rfc822Callback, params, false);
	}
};
