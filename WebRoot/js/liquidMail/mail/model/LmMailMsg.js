/**
* Creates a new (empty) mail message.
* @constructor
* @class
* This class represents a mail message.
*/
function LmMailMsg(appCtxt, list) {
	
	LmMailItem.call(this, appCtxt, LmItem.MSG, list);

	this._loaded = false;
	this._inHitList = false;
	this._attachHitList = new Array();
	this._attachments = new Array();
	this._bodyParts = new Array();
	this._addrs = new Array();

	for (var i = 0; i < LmMailMsg.ADDRS.length; i++) {
		var type = LmMailMsg.ADDRS[i];
		this._addrs[type] = new LsVector();
	}
};

LmMailMsg.prototype = new LmMailItem;
LmMailMsg.prototype.constructor = LmMailMsg;

LmMailMsg.ADDRS = [LmEmailAddress.FROM, LmEmailAddress.TO, LmEmailAddress.CC, LmEmailAddress.BCC, LmEmailAddress.REPLY_TO];

LmMailMsg.HDR_FROM		= LmEmailAddress.FROM;
LmMailMsg.HDR_TO		= LmEmailAddress.TO;
LmMailMsg.HDR_CC		= LmEmailAddress.CC;
LmMailMsg.HDR_BCC		= LmEmailAddress.BCC;
LmMailMsg.HDR_REPLY_TO	= LmEmailAddress.REPLY_TO;
LmMailMsg.HDR_DATE		= LmEmailAddress.LAST_ADDR + 1;
LmMailMsg.HDR_SUBJECT	= LmEmailAddress.LAST_ADDR + 2;

LmMailMsg.HDR_KEY = new Object();
LmMailMsg.HDR_KEY[LmMailMsg.HDR_FROM] = LmMsg.from;
LmMailMsg.HDR_KEY[LmMailMsg.HDR_TO] = LmMsg.to;
LmMailMsg.HDR_KEY[LmMailMsg.HDR_CC] = LmMsg.cc;
LmMailMsg.HDR_KEY[LmMailMsg.HDR_BCC] = LmMsg.bcc;
LmMailMsg.HDR_KEY[LmMailMsg.HDR_REPLY_TO] = LmMsg.replyTo;
LmMailMsg.HDR_KEY[LmMailMsg.HDR_DATE] = LmMsg.sent;
LmMailMsg.HDR_KEY[LmMailMsg.HDR_SUBJECT] = LmMsg.subject;

// Public methods

LmMailMsg.prototype.toString = 
function() {
	return "LmMailMsg";
};

// Getters

/**
* Returns a vector of addresses of the given type
*
* @param type		an email address type
*/
LmMailMsg.prototype.getAddresses =
function(type) {
	return this._addrs[type];
};

LmMailMsg.prototype.getInviteOrganizer =
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
LmMailMsg.prototype.getReplyAddresses =
function(mode) {
	var rtVec = this._addrs[LmEmailAddress.REPLY_TO];
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
			addrs = this.isSent && mode == LmOperation.REPLY_ALL
			? this._addrs[LmEmailAddress.TO]
			: this._addrs[LmEmailAddress.FROM];
		}
		address = addrs.toString(LmEmailAddress.SEPARATOR);
	}
	return address;
};

/**
* Returns the first address in the vector of addresses of the given type
*/
LmMailMsg.prototype.getAddress =
function(type) {
	return this._addrs[type].get(0);
};

/**
* Returns the subject
*/
LmMailMsg.prototype.getSubject =
function() {
	return this.subject;
};

/**
* Returns the date
*/
LmMailMsg.prototype.getDate =
function() {
	return this.date;
};

/**
* Returns the size of the message content
*/
LmMailMsg.prototype.getSize =
function() {
	return this.size;
};

/**
* Returns the message ID
*/
LmMailMsg.prototype.getId =
function() {
	return this.id;
};

/**
* Returns the message's conversation ID, if any
*/
LmMailMsg.prototype.getConvId =
function() {
	return this.cid;
};

LmMailMsg.prototype.getAttachHitList = 
function() {
	return this._attachHitList;
};

LmMailMsg.prototype.getHeaderStr =
function(hdr) {
	if (hdr == LmMailMsg.HDR_DATE) {
		return this.sentDate ? LmMailMsg.HDR_KEY[hdr] + ": " + (new Date(this.sentDate)).toLocaleString() : "";
	} else if (hdr == LmMailMsg.HDR_SUBJECT) {
		var subj = this.getSubject();
		return subj ? LmMailMsg.HDR_KEY[hdr] + ": " + subj : "";
	} else if (hdr <= LmEmailAddress.LAST_ADDR) {
		var addrs = this.getAddresses(hdr);
		var addrStr = addrs.toString(", ", true);
		if (addrStr)
			return LmMailMsg.HDR_KEY[hdr] + ": " + addrStr;
	}
};

/**
* Returns true if this message was matched during a search
*/
LmMailMsg.prototype.isInHitList =
function() {
	return this._inHitList;
};

/**
* Returns true if this message has html parts
*/
LmMailMsg.prototype.isHtmlMail = 
function() {
	return this.getBodyPart(LmMimeTable.TEXT_HTML) != null;
};

/**
* Returns true if this message's properties have been filled in
*/
LmMailMsg.prototype.isLoaded =
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
LmMailMsg.prototype.setAddresses =
function(type, addrs) {
	this._addrs[type] = addrs;
};

/**
* Sets the vector of addresses of the given type to the address given
*
* @param type	the address type
* @param addr	an address
*/
LmMailMsg.prototype.setAddress =
function(type, addr) {
	this._addrs[type].removeAll();
	this._addrs[type] = new LsVector();
	this._addrs[type].add(addr);
};

/**
* Adds the given vector of addresses to the vector of addresses of the given type
*
* @param type	the address type
* @param addrs	a vector of addresses
*/
LmMailMsg.prototype.addAddresses =
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
LmMailMsg.prototype.addAddress =
function(addr) {
	var type = addr.type || LmEmailAddress.TO;
	this._addrs[type].add(addr);
};

/**
* Sets the subject
*
* @param	a subject
*/
LmMailMsg.prototype.setSubject =
function(subject) {
	this.subject = subject;
};

/**
* Sets the message's top part to the given MIME part
*
* @param part	a MIME part
*/
LmMailMsg.prototype.setTopPart =
function(part) {
	this._topPart = part;
};

/**
* Sets the ID of any attachments which have already been uploaded.
*
* @param id		an attachment ID
*/
LmMailMsg.prototype.setAttachmentId =
function(id) {
	this._attId = id;
};

/**
* Sets the ID of a message to attach (as a forward)
*
* @param id		an message ID
*/
LmMailMsg.prototype.setMessageAttachmentId =
function(id) {
	this._msgAttId = id;
};

/**
* Sets the list of attachment (message part) IDs to be forwarded
* - This list will only be set for any msgs containing attachments that need to be forwarded 
*
* @param id		list of attachment IDs
*/
LmMailMsg.prototype.setForwardAttIds = 
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
LmMailMsg.createFromDom =
function(node, args) {
	var msg = new LmMailMsg(args.appCtxt, args.list);
	msg._loadFromDom(node);
	return msg;
};

/**
* Gets the full message object from the back end based on the current message ID, and
* fills in the message.
*
* @param getHtml		
*/
LmMailMsg.prototype.load =
function(getHtml, forceLoad) {
	// If we are already loaded, then don't bother loading
	if (!this._loaded || forceLoad) {
		var resp = LmMailMsg.fetchMsg(this._appCtxt.getAppController(), this.id, getHtml);
		
		// clear address vectors
		for (var i = 0; i < LmMailMsg.ADDRS.length; i++) {
			var type = LmMailMsg.ADDRS[i];
			this._addrs[type].removeAll();
		}
	
		// clear all participants (since it'll get re-parsed w/ diff. ID's)
		this.participants.removeAll();
		for (var i in this._participantHash)
			delete this._participantHash[i];
		
		// clear all attachments
		this._attachments.length = 0;	

		this._loadFromDom(resp.m[0]);
	}
	this._markReadLocal(true);

};

/**
 * static method which will fetch a message from the server.
 * @param sender - (Object) the object which has a method called sendRequest.
 * @param msgId - (int) the id to be fetched.
 * @param getHtml - whether to fetch html from the server ( if possible ).
 */
LmMailMsg.fetchMsg = 
function (sender, msgId, getHtml) {
	var soapDoc = LsSoapDoc.create("GetMsgRequest", "urn:liquidMail", null);
	var msgNode = soapDoc.set("m");
	msgNode.setAttribute("id", msgId);
	msgNode.setAttribute("read", "1");
	if (getHtml) {
		msgNode.setAttribute("html", "1");
	}
	return sender.sendRequest(soapDoc, false).GetMsgResponse;

};

LmMailMsg.prototype.getBodyPart =
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

LmMailMsg.prototype.getBodyContent =
function() {
	if (this._loaded) {
		var bodyPart = this.getBodyPart();
		return bodyPart ? bodyPart.content : null;
	}
	
	return null;
};

LmMailMsg.prototype.getTextPart = 
function() {
	var bodyPart = this.getBodyPart();
	
	if (bodyPart && bodyPart.ct == LmMimeTable.TEXT_PLAIN) {
		return bodyPart.content;
	} else {
		var resp = LmMailMsg.fetchMsg(this._appCtxt.getAppController(), this.getId());
		this._loadFromDom(resp.m[0]);

		bodyPart = this.getBodyPart(LmMimeTable.TEXT_PLAIN);
		return bodyPart ? bodyPart.content : null;
	}
};

// XXX: doesnt look like this method is called anywhere?!
LmMailMsg.prototype.getHtmlContent =
function() {
	// XXX: especially since getHtmlPart() doesnt exist!?
	this.getHtmlPart();
	return this._htmlBody ? this._htmlBody : null;
};

LmMailMsg.prototype.setHtmlContent =
function(content) {
	this._htmlBody = content;
};

LmMailMsg.prototype.sendInviteReply = 
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

LmMailMsg.prototype._sendInviteReply = 
function (contactList, edited, componentId) {
	var soapDoc = LsSoapDoc.create("SendInviteReplyRequest", "urn:liquidMail");

	var id = this._origMsg.id;
	soapDoc.setMethodAttribute("id", id);
	soapDoc.setMethodAttribute("compNum", componentId);

	var verb = "ACCEPT";
	switch (this.inviteMode) {
		case LmOperation.REPLY_ACCEPT: 		verb = "ACCEPT"; break;
		case LmOperation.REPLY_DECLINE:		verb = "DECLINE"; break;
		case LmOperation.REPLY_TENTATIVE: 	verb = "TENTATIVE";	break;
		case LmOperation.REPLY_NEW_TIME: 	verb = "DELEGATED"; break; // ?? IS THIS MAPPING RIGHT
	}

	soapDoc.setMethodAttribute("verb", verb);

	if (this.getAddress(LmEmailAddress.TO) == null) {
		var toEmail = this._origMsg.getInvite().getOrganizerEmail(0);
		var to = new LmEmailAddress(toEmail, LmEmailAddress.TO, null, null);
		this.setAddress(LmEmailAddress.TO, to);
	}

	//soapDoc.setMethodAttribute("updateOrganizer", (edited? "FALSE":"TRUE") );
	soapDoc.setMethodAttribute("updateOrganizer", "TRUE" );
	if (edited)
		this._createMessageNode(soapDoc, contactList);

	var resp = this._sendMessage(soapDoc, true);
	var id = resp.id ? resp.id.split("-")[0] : null;
	
	if (id || resp.status == "OK")
		this._notifySendListeners();

	// map this to an int?
	return (id || status);
};

/**
* Sends the message out into the world.
*/
LmMailMsg.prototype.send =
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
		var soapDoc = LsSoapDoc.create(request, "urn:liquidMail");
		// TODO - return code and put up status message
		this._createMessageNode(soapDoc, contactList, isDraft);
		var resp = this._sendMessage(soapDoc, false, isDraft).m[0];
		
		// notify listeners of successful send message
		if (!isDraft) {
			if (resp.id || !this._appCtxt.get(LmSetting.SAVE_TO_SENT))
				this._notifySendListeners();
			return resp.id;
		} else {
			this._loadFromDom(resp);
			return this;
		}
	}	
};

LmMailMsg.prototype._createMessageNode = 
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

	for (var i = 0; i < LmComposeView.ADDRS.length; i++) {
		var type = LmComposeView.ADDRS[i];		
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

LmMailMsg.prototype._sendMessage = 
function(soapDoc, bIsInvite, bIsDraft) {
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	if (bIsInvite)
		return resp.SendInviteReplyResponse;
	else if (bIsDraft)
		return resp.SaveDraftResponse;
	else
		return resp.SendMsgResponse;
};

LmMailMsg.prototype._notifySendListeners = 
function() {
	var flag = null;
	if (this.isForwarded) {
		flag = LmItem.FLAG_FORWARDED;
	} else if (this.isReplied) {
		flag = LmItem.FLAG_REPLIED;
	}
	
	if (flag) {
		this._origMsg[LmItem.FLAG_PROP[flag]] = true;
		this._origMsg._listNotify(LmEvent.E_FLAGS, {flags: [flag]});
	}
};

LmMailMsg.prototype.isRealAttachment = 
function(attachment) {
	var type = attachment.ct;
	if (LmMimeTable.isIgnored(type) || attachment.body) 
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
LmMailMsg.prototype.getContentIdAttachUrl = 
function(cid,domain) {
	if (this._attachments && this._attachments.length > 0) {
	    	for (var i = 0; i < this._attachments.length; i++) {
	    		var attach = this._attachments[i];
	    		if (attach.ci == cid) {
	    			return location.protocol+"//" + domain + 
	    					this._appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI) +
	    					"id=" + this.getId() + "&part=" + attach.part;
	    		}
    		}
	}
	return null;
}

// this is a helper method to get an attachment url for multipart/related content
LmMailMsg.prototype.getContentLocationAttachUrl = 
function(cl,domain) {
	if (this._attachments && this._attachments.length > 0) {
	    	for (var i = 0; i < this._attachments.length; i++) {
	    		var attach = this._attachments[i];
	    		if (attach.cl == cl) {
	    			return location.protocol+"//" + domain + 
	    					this._appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI) +
	    					"id=" + this.getId() + "&part=" + attach.part;
	    		}
    		}
	}
	return null;
}

// this is a helper method to build a list of attachment links in html
LmMailMsg.prototype.buildAttachLinks = 
function(bFindHits, domain, partNameList) {
	var attLinks = new Array();

	if (this._attachments && this._attachments.length > 0) {
		var csfeMsgFetchSvc = location.protocol+"//" + domain + this._appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI);
    	var hrefRoot = "href='" + csfeMsgFetchSvc + "id=" + this.getId() + "&amp;part=";
    	
    	for (var i = 0; i < this._attachments.length; i++) {
    		var attach = this._attachments[i];
			type = attach.ct;
			
			if (!this.isRealAttachment(attach))
    			continue;
    		
    		// get a viable label for this attachment
    		var label = attach.name || attach.filename || (LmMsg.unknown + " <" + type + ">");
    		
    		// start building html
    		var mimeInfo = LmMimeTable.getInfo(type);
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
    		var icon = mimeInfo ? mimeInfo.image : LmImg.I_DOCUMENT;
    		var encLabel = "&nbsp;" + LsStringUtil.htmlEncode(label) + "&nbsp;";
    		var labelWidth = Dwt.getHtmlExtent(encLabel).x;
    		// The 5 is for padding for IE
    		labelWidth += sizeText ? Dwt.getHtmlExtent(sizeText).x + 5 : 0;
    		var iconLabelWidth = icon[1] + labelWidth;

			// set link
		    var link = type == LmMimeTable.MSG_RFC822
		    	? "<a href='javascript:;' onclick='LmMailMsg.rfc822Callback(this," + this.getId() + "," + attach.part + ")' class='AttLink'>"
		    	: "<a target='att_view_win' class='AttLink' " + hrefRoot + attach.part + "'>";

    		htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 style='display:inline; width:";
    		htmlArr[idx++] = iconLabelWidth;
    		htmlArr[idx++] = "'><tr><td style='width:" + iconLabelWidth + "'>";

    		htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 style='display:inline; width:";
    		htmlArr[idx++] = iconLabelWidth;
    		htmlArr[idx++] = "'><tr><td style='width:" + icon[1] + "'>";

			// position:relative required to make this work in FF    		
     		htmlArr[idx++] =  link + LsImg.getImageHtml(icon, "position:relative;") + "</a>";
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
LmMailMsg.prototype._loadFromDom =
function(msgNode) {
	// this method could potentially be called twice (SearchConvResponse and 
	// GetMsgResponse) so always check param before setting!
	if (msgNode.id)		this.id = msgNode.id;
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

	if (msgNode.mp) {
		var params = {attachments: this._attachments, bodyParts: this._bodyParts};
		this._topPart = LmMimePart.createFromDom(msgNode.mp, params);
		this._loaded = this._bodyParts.length > 0 || this._attachments.length > 0;
	}

	if (msgNode.e && this.participants.size() == 0) {
		for (var i = 0; i < msgNode.e.length; i++)
			this._parseParticipantNode(msgNode.e[i]);

		var parts = this.participants.getArray();
		for (var j = 0; j < parts.length; j++ )
			this.addAddress(parts[j]);
	}

	if (msgNode.inv) {
		this.invite = LmInvite.createFromDom(msgNode.inv);
		this.invite.setMessageId (this.id);
	}
};

LmMailMsg.prototype.isInvite =
function () {
	return (this.invite != null);
};

LmMailMsg.prototype.needsRsvp =
function () {
	return (this.isInvite() && this.invite.shouldRsvp(0) && !this.invite.isOrganizer(0));
};

/**
 * returns an LmInvite object
 */
LmMailMsg.prototype.getInvite = 
function() {
	return this.invite;
};

// Adds child address nodes for the given address type.
LmMailMsg.prototype._addAddressNodes =
function(soapDoc, parent, type, contactList, isDraft) {
	var addrs = this._addrs[type];
	var num = addrs.size();
	for (var i = 0; i < num; i++) {
		var addr = addrs.get(i);
		var email = addr.getAddress();
		var e = soapDoc.set("e", null, parent);
		e.setAttribute("t", LmEmailAddress.toSoapType[type]);
		e.setAttribute("a", email);
		// tell server to add this email to address book if not found
		if (!isDraft && this._appCtxt.get(LmSetting.AUTO_ADD_ADDRESS) && !contactList.getContactByEmail(email)) {
			DBG.println(LsDebug.DBG2, "adding contact: " + email);
			e.setAttribute("add", "1");
		}
		var name = addr.getName();
		if (name)
			e.setAttribute("p", name);
	}
};

LmMailMsg.prototype._isAttInHitList = 
function(attach) {
	var part = attach.part;
	for (var i = 0; i < this._attachHitList.length; i++) {
		if (this._attachHitList[i] == part)
			return true;
	}
	return false;
};

// XXX: HACK HACK HACK
// This hack allows a user to view rfc/822 messages (message which are forwarded as attachments)
// W/o a proper windowing model, there is no nice way to catch exceptions or allow inter-window
// communication. Additionally, since we cant get access to the app controller to invoke a server
// request, we will lose any notifications that may come in as a result of an invoke().
LmMailMsg.rfc822Callback = 
function(anchorEl, msgId, msgPartId) {

	// get the reference to LmMailMsgView from the anchor element
	var msgView = anchorEl;
	while (msgView != null && (Dwt.getObjectFromElement(msgView) instanceof LmMailMsgView == false))
		msgView = msgView.parentNode;

	if (msgView) msgView = Dwt.getObjectFromElement(msgView);
	if (!msgView) return;
	
	var controller = msgView._appCtxt.getAppController();
	if (!controller) return;

	try {
		var soapDoc = LsSoapDoc.create("GetMsgRequest", "urn:liquidMail");
		var msgNode = soapDoc.set("m");
		msgNode.setAttribute("id", msgId);
		msgNode.setAttribute("part", msgPartId);
		var resp = controller.sendRequest(soapDoc, false).GetMsgResponse;

		// validate response
		if (resp == null || resp.m == null || resp.m[0] == null ||
			resp.m[0].id != msgId || (parseInt(resp.m[0].part) != msgPartId))
		{
			return;
		}

		// parse rfc/822 into LmMailMsg
		var msg = new LmMailMsg(msgView._appCtxt);
		msg._loadFromDom(resp.m[0]);
		msg._loaded = true;

		// create temp msg view off current msg view
		var tmpMsgView = new LmMailMsgView(msgView, null, DwtControl.ABSOLUTE_STYLE, LmController.MSG_NEW_WIN_VIEW);
		Dwt.setVisible(tmpMsgView.getHtmlElement(), false);
		tmpMsgView.set(msg, true);

		// generate html document for new window
		var html = new Array();
		var idx = 0;
		html[idx++] = "<html><head>";
		html[idx++] = "<style type='text/css'><!-- @import url(/liquid/js/liquidMail/config/style/lm.css); --></style></head>";
		html[idx++] = "<body style='margin: 0px;' oncontextmenu='return false'>";
		html[idx++] = "<div style='height: 100%; overflow: auto' class='LmMailMsgView'>" + tmpMsgView.getHtmlElement().innerHTML + "</div>";
		html[idx++] = "</body></html>";

		// create new popup window and set content
		var winName = "win" + Dwt.getNextId();
		var win = window.open("", winName, "location=no,resizable=yes,menubar=no,scrollbar=yes,status=yes,toolbar=no,width=550,height=500");
		win.document.open();
		win.document.writeln(html.join(""));
		win.document.close();
	} catch (ex) {
		var params = {anchorEl: anchorEl, msgId: msgId, msgPartId: msgPartId};
		controller._handleException(ex, LmMailMsg.rfc822Callback, params, false);
	}
};
