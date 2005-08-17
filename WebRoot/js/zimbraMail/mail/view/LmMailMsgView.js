function LmMailMsgView(parent, className, posStyle, mode) {

	className = className || "LmMailMsgView";
	DwtComposite.call(this, parent, className, posStyle);
	
	this._mode = mode;
	
	this._displayImagesId = Dwt.getNextId();
	this._tagRowId = Dwt.getNextId();
	this._tagCellId = Dwt.getNextId();
	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	
	this.setScrollStyle(DwtControl.SCROLL);
	
	// customize per "mode"
	if (mode == LmController.MSG_NEW_WIN_VIEW) {
		return;
	} else if (mode == LmController.MSG_VIEW) {
		// Add a change listener to taglist to track tag color changes
		this._tagList = this._appCtxt.getTagList();
		this._tagList.addChangeListener(new LsListener(this, LmMailMsgView.prototype._tagChangeListener));
	}

	this._setKeyEventHdlrs();
	this._setMouseEventHdlrs(); // needed by object manager
	
	// this manages all the detected objects within the view
	this._objectManager = new LmObjectManager(this, this._appCtxt);
	
	this._changeListener = new LsListener(this, this._msgChangeListener);
	this.addListener(DwtEvent.ONMOUSEDOWN, new LsListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONSELECTSTART, new LsListener(this, this._selectStartListener));
	this.addListener(DwtEvent.ONCONTEXTMENU, new LsListener(this, this._contextMenuListener));
	
}

LmMailMsgView.prototype = new DwtComposite;
LmMailMsgView.prototype.constructor = LmMailMsgView;

// Consts

LmMailMsgView.HEADER_ID = "h--" + Dwt.getNextId();
LmMailMsgView.QUOTE_DEPTH_MOD = 3;
LmMailMsgView.MAX_SIG_LINES = 8;
LmMailMsgView.SIG_LINE = /^(- ?-+)|(__+)\r?$/;
LmMailMsgView._inited = false;

LmMailMsgView.REPLY_INVITE_EVENT = "inviteReply";

// Public methods

LmMailMsgView.prototype.toString = 
function() {
	return "LmMailMsgView";
};

LmMailMsgView.prototype.reset =
function() {
	this._htmlBody = null;
	this.getHtmlElement().innerHTML = "";
	if (this._objectManager)
		this._objectManager.reset();
}

LmMailMsgView.prototype._getInviteToolbar =
function() {
	// TODO: reuse the toolbar 
	if (this._inviteToolbar)
		this._inviteToolbar.dispose();

	this._operationButtonIds = [LmOperation.REPLY_ACCEPT, LmOperation.REPLY_TENTATIVE, LmOperation.REPLY_DECLINE];
	this._inviteToolbar = new LmButtonToolBar(this,	this._operationButtonIds,
											  null, DwtControl.STATIC_STYLE, 
											  "LmInviteToolBar", "DwtButton");
	// get a little space between the buttons.
	var toolbarHtmlEl = this._inviteToolbar.getHtmlElement();
	toolbarHtmlEl.firstChild.cellPadding = "3";
	var inviteToolBarListener = new LsListener(this, this._inviteToolBarListener);

	for (var i = 0; i < this._operationButtonIds.length; i++) {
		var id = this._operationButtonIds[i];

		// HACK for IE, which doesn't support multiple classnames. If I
		// just change the styles, the activated class overrides the basic
		// activated class definition, thus I have to change what the 
		// activated class name will be for the buttons in the toolbar.
		var b = this._inviteToolbar.getButton(id);
		b._activatedClassName = b._className + "-" + DwtCssStyle.ACTIVATED;
		b._triggeredClassName = b._className + "-" + DwtCssStyle.TRIGGERED;
		
		this._inviteToolbar.addSelectionListener(id, inviteToolBarListener);
	}
	return this._inviteToolbar;
};

LmMailMsgView.prototype._inviteToolBarListener = 
function(ev) {
	ev._inviteReplyType = ev.item.getData(LmOperation.KEY_ID);;
	ev._inviteComponentId = null;
	this.notifyListeners(LmMailMsgView.REPLY_INVITE_EVENT, ev);
}

LmMailMsgView.prototype.addInviteReplyListener = 
function (listener) {
	this.addListener(LmMailMsgView.REPLY_INVITE_EVENT, listener);
};

LmMailMsgView.prototype.set =
function(msg) {
	this.reset();
	var contentDiv = this.getHtmlElement();
	var oldMsg = this._msg;
	this._msg = msg;
	this._dateObjectHandlerDate = msg.sentDate ? new Date(msg.sentDate) : new Date(msg.date);
	if ((this._appCtxt.get(LmSetting.CALENDAR_ENABLED)) && msg.isInvite() && msg.needsRsvp()) {
		var invite = msg.getInvite();
		// in the single component case, which I think is going to be 90%
		// of the time, we will just show a single toobar.
		if (!invite.hasMultipleComponents()) {
			// create toolbar
			var topToolbar = this._getInviteToolbar();
			// nuke the old toolbar if it exists b4 appending the new one
			var tEl = topToolbar.getHtmlElement();
			if (tEl && tEl.parentNode)
				tEl.parentNode.removeChild(tEl);
			contentDiv.appendChild(tEl);
		} else {
			// TODO:
			// here we want to show an arrow at the top which should drop down
			// to show all the components that could be replied to. 
			// I think I want the toolbar at the top, to be applied to the
			// selected component.
			// We need an inviteComponentView. Ughhh.
		}
	}
	this._renderMessage(msg, contentDiv);
	if (this._htmlBody) {
		this._populateHtmlIframe();
	}

	if (this._mode == LmController.MSG_VIEW) {
		this._setTags(msg);
		// Remove listener for current msg if it exists
		if (oldMsg != null)
			oldMsg.removeChangeListener(this._changeListener);
		msg.addChangeListener(this._changeListener);
	} else if (this._mode == LmController.TRAD_VIEW) {
		if (oldMsg != null)
			oldMsg.list.removeChangeListener(this._listChangeListener);
		msg.list.addChangeListener(new LsListener(this, this._listChangeListener));
	}
		
	// reset scroll view to top most
	this.getHtmlElement().scrollTop = 0;
}

// This looks for anchor tags first, to exclude them, and all other tags later.
LmMailMsgView.htmlPreprocRegex = /(<[aA][^>]*>)([^<]*)(<\/[aA][^>]*>)|(<[^>]*>)([^<]*)|([^<>]+)/g;

/**
 * This function trys to filter out all text in between tags, and pass it 
 * through the object geneneration methods. What this will not catch is html
 * looks like a string, but is a string with markup in between:
 * <i>http://www.</i><b>yahoo.com</b>
 * This function will grab http://www., and yahoo.com seperately, thus not
 * finding that it's an url.
 */
LmMailMsgView.prototype._preProcessHtml = 
function(html) {
	var results;
	var resultingHtml = new Array();
	var idx = 0;
	while ( (results = LmMailMsgView.htmlPreprocRegex.exec(html)) != null ) {
		if (results[1] || results[2] || results[3]){
			// we've matched an anchor tag
			resultingHtml[idx++] = results[0];
		} else {
			if (results[5] && results[5] != "") {
				resultingHtml[idx++] = results[4];
				resultingHtml[idx++] = this._objectManager.findObjects(results[5], false);
				resultingHtml[idx++] = results[6];
			} else {
				resultingHtml[idx++] = results[0];
			}
		}
	}
	return resultingHtml.join("");
};

LmMailMsgView.prototype._populateHtmlIframe = 
function() {
	var doc = this.getDocument();
	var iframe = Dwt.getDomObj(doc, this._iframeId);
	var idoc = Dwt.getIframeDoc(iframe);

	this._htmlBody = this._preProcessHtml(this._htmlBody);
	idoc.open();
	idoc.write(this._htmlBody);
	idoc.close();

	// TODO: only call this if top-level is multipart/related?
	var didAllImages = this._fixMultipartRelatedImages(this._msg, idoc, this.getDocument().domain);

	var displayImages = Dwt.getDomObj(doc, this._displayImagesId);
	// setup the click handler for the images
	if (displayImages) {
		if (didAllImages) {
			displayImages.style.display = "none";
		} else {
			displayImages.onclick = this._createDisplayImageClickClosure(this._msg, idoc, this._displayImagesId, iframe);
		}
	}
	// set height of view according to height of iframe on timer
	var act = new LsTimedAction();
	act.method = LmMailMsgView._resetIframeHeight;
	act.params.add(idoc);
	act.params.add(iframe);
	LsTimedAction.scheduleAction(act, 5);		
};

LmMailMsgView.prototype._fixMultipartRelatedImages =
function(msg, idoc, domain) {
	var images = idoc.getElementsByTagName("img");
	var num = 0;
	for (var i = 0; i < images.length; i++) {
		var dfsrc = images[i].getAttribute("dfsrc");
		if (dfsrc) {
			//DBG.println("images "+i+" id="+images[i].id);
			if (dfsrc.substring(0,4) == "cid:") {
				num++;
				var cid = "<" + dfsrc.substring(4) + ">";
				//DBG.printRaw(" cid = "+cid);
				var src = msg.getContentIdAttachUrl(cid,domain);
				if (src) {
					//DBG.printRaw(" src = "+src);
					images[i].src = src;
					images[i].dfsrc = src;
				}
			} else if (dfsrc.indexOf("//") == -1) { // check for content-location verison
				//DBG.printRaw(" cid = "+cid);
				var src = msg.getContentLocationAttachUrl(dfsrc,domain);
				if (src) {
					num++;				
					//DBG.printRaw(" src = "+src);
					images[i].src = src;
					images[i].dfsrc = src;
				}
			}
		}
	}
	return (num == images.length);
}

LmMailMsgView.prototype._createDisplayImageClickClosure =
function(msg, idoc, id, iframe) {
	var func = function () {
		var images = idoc.getElementsByTagName("img");
		for (var i = 0; i < images.length; i++) {
			if (images[i].getAttribute("dfsrc")) {
				// If we just loop through the images, IE for some reason,
				// doesn't fetch the image. By launching them off in the
				// background we seem to kick IE's engine a bit.
				if (LsEnv.isIE) {
					var act = new LsTimedAction();
					act.method = LmMailMsgView._swapIdAndSrc;
					act.params.add(images[i]);
					act.params.add(i);
					act.params.add(images.length);
					act.params.add(msg);
					act.params.add(idoc);
					LsTimedAction.scheduleAction(act, 0);
				} else {
					images[i].src = images[i].getAttribute("dfsrc");
				}
			}
		}
		diEl = Dwt.getDomObj(document, id);
		diEl.style.display = "none";
		msg.setHtmlContent(idoc.documentElement.innerHTML);		
		
		// reset the iframe height (bug #2886)
		var act = new LsTimedAction();
		act.method = LmMailMsgView._resetIframeHeight;
		act.params.add(idoc);
		act.params.add(iframe);
		LsTimedAction.scheduleAction(act, 5);
	}
	return func;
}

LmMailMsgView._swapIdAndSrc = 
function (args) {
	var image = args[0];
	var i = args[1];
	var len = args[2];
	var msg = args[3];
	var idoc = args[4];
	image.src = image.getAttribute("dfsrc");
	if (i == len -1) {
		msg.setHtmlContent(idoc.documentElement.innerHTML);
	}
}

LmMailMsgView._resetIframeHeight = 
function(args) {
	var idoc = args[0];
	var iframe = args[1];

	if (LsEnv.isIE) {
		idoc.recalc(true);
		iframe.style.height = parseInt(idoc.body.scrollHeight);
	} else {
		iframe.style.height = parseInt(idoc.getElementsByTagName('html')[0].scrollHeight);
	}
};

LmMailMsgView.prototype._generateHtmlBody =
function(html, idx, body) {
	this._iframeId = Dwt.getNextId();
	var doc = null;
	this._htmlBody = body;

	// the "External images are not displayed" div+link probably belongs in 
	// the headers section, and should also be hidden after it is clicked
	if (body.search(/<img/i) != -1){
		html[idx++] = "<div id='" + this._displayImagesId + "' style='background-color: rgb(230, 230, 230);'>External images are not displayed. <a href='javascript:;'>Display external images</a></div>";
	}
	var src = (LsEnv.isIE && (location.protocol == "https:"))? "src='/liquid/public/blank.html'" : "";
 	html[idx++] = "<iframe scrolling='no' frameborder='0' width='100%' height='100%' id='";
	html[idx++] = this._iframeId ;
	html[idx++] = "' ";
	html[idx++] = src;
	html[idx++] = "/>";
 	return idx;
}

LmMailMsgView.prototype.resetMsg = 
function(newMsg) {
	// Remove listener for current msg if it exists
	if (this._msg != null)
		this._msg.removeChangeListener(this._changeListener);
	// don't want add change listener for new until shown
	this._msg = newMsg;
}

LmMailMsgView.prototype.isDisplayingMsg =
function(msg) {
	return (this._msg == msg);
}

LmMailMsgView.prototype.getMsg =
function() {
	return this._msg;
}

// Following two overrides are a hack to allow this view to pretend it's a list view
LmMailMsgView.prototype.getSelection = 
function() {
	return this._msg;
}

LmMailMsgView.prototype.getSelectionCount = 
function() {
	return 1;
}

LmMailMsgView.prototype.getMinHeight = 
function() {
	if (!this._headerHeight) {
		var headerObj = Dwt.getDomObj(this.getDocument(), LmMailMsgView.HEADER_ID);
		this._headerHeight = headerObj ? Dwt.getSize(headerObj).y : 0;
	}
	return this._headerHeight;
}

LmMailMsgView.prototype.getTitle =
function() {
	return [LmMsg.zimbraTitle, ": ", this._msg.subject].join("");
}

// Private / Protected methods

LmMailMsgView.prototype._addAddressHeaderHtml =
function(htmlArr, idx, addrs, prefix) {
	htmlArr[idx++] = "<tr><td class='LabelColName'>";
	htmlArr[idx++] = LsStringUtil.htmlEncode(prefix);
	htmlArr[idx++] = ": </td><td class='LabelColValue'>";
	for (var i = 0; i < addrs.size(); i++) {
		if (i > 0)
			htmlArr[idx++] = LsStringUtil.htmlEncode(LmEmailAddress.SEPARATOR);

		var addr = addrs.get(i);
		if (this._objectManager && addr.address) {
			idx = this._objectManager.generateSpan(this._objectManager.getEmailHandler(), htmlArr, idx, addr, null);
		} else {
			htmlArr[idx++] = addr.address ? addr.address : (LsStringUtil.htmlEncode(addr.name));
		}
	}
   	htmlArr[idx++] = "</td></tr>";

	return idx;
}

LmMailMsgView.prototype._renderMessage =
function(msg, container) {
	LmDateObjectHandler.setCurrentDate(this._dateObjectHandlerDate);
	
	var idx = 0;
	var htmlArr = new Array();
	this._hdrTableId = Dwt.getNextId();
	htmlArr[idx++] = "<div id='" + LmMailMsgView.HEADER_ID + "' class='MsgHeader'>";
	var w = LsEnv.isIE ? "style='width:auto'" : "";
	htmlArr[idx++] = "<table id='" + this._hdrTableId + "' cellspacing=2 cellpadding=2 border=0 " + w + " >";
	
	// Date
	htmlArr[idx++] = "<tr><td class='LabelColName'>";
	htmlArr[idx++] = LsStringUtil.htmlEncode(LmMsg.sent);
	htmlArr[idx++] = ": </td><td>";
	htmlArr[idx++] = msg.sentDate ? (new Date(msg.sentDate)).toLocaleString() : "";
	htmlArr[idx++] = "</td></tr>";
	
	// From/To
	for (var i = 0; i < LmMailMsg.ADDRS.length; i++) {
		var type = LmMailMsg.ADDRS[i];
		if (type == LmEmailAddress.BCC)
			continue;
		var addrs = msg.getAddresses(type);
		if (addrs.size() > 0) {
			var prefix = LmMsg[LmEmailAddress.TYPE_STRING[type]];
			idx = this._addAddressHeaderHtml(htmlArr, idx, addrs, prefix);
		}
	}		

	// Subject
	var subject = msg.getSubject() || LmMsg.noSubject;
	htmlArr[idx++] = "<tr><td class='LabelColName'>";
	htmlArr[idx++] = LsStringUtil.htmlEncode(LmMsg.subject);
	htmlArr[idx++] = ": </td><td class='LabelColValue'>";
	htmlArr[idx++] = this._objectManager ? this._objectManager.findObjects(subject, true) : subject;
	htmlArr[idx++] = "</td></tr>"
	
	// Attachments
	var attLinks = msg.buildAttachLinks(true, this.getDocument().domain);
	if (attLinks.length > 0) {
		htmlArr[idx++] = "<tr><td class='LabelColName'>";
		htmlArr[idx++] = LmMsg.attachments;
		htmlArr[idx++] = ": </td><td class='LabelColValue'>";
		for (var i = 0; i<attLinks.length; i++)
			htmlArr[idx++] = attLinks[i].html;
		htmlArr[idx++] = "</td></tr>";
	}
	
	// Tags are handled in _setTags()

	htmlArr[idx++] = "</table></div>";
	var el = container ? container : this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(htmlArr.join("")));
	
	idx = 0;
	htmlArr.length = 0;
	
	// Body
	htmlArr[idx++] = "<div class='MsgBody'>";

	var bodyPart = msg.getBodyPart();
	if (bodyPart) {
		if (bodyPart.ct == LmMimeTable.TEXT_HTML && this._appCtxt.get(LmSetting.VIEW_AS_HTML)) {
			idx = this._generateHtmlBody(htmlArr, idx, bodyPart.content);
		} else {
			// otherwise, get the text part if necessary
			var content = null;
			if (bodyPart.ct != LmMimeTable.TEXT_PLAIN) {
				// try to go retrieve the text part
				content = msg.getTextPart();
				// if no text part, just dump the raw html (see bug 859)
				if (content == null)
					content = bodyPart.content;
			} else {
				content = bodyPart.content;
			}
			//this._htmlBody = null;
			var _st = new Date();
			idx = this._generateBody(htmlArr, idx, content);
			DBG.println(LsDebug.DBG1, "generateBody took " + (new Date() - _st.getTime()) + "ms");
		}
	}

	htmlArr[idx++] = "</div>";
	el.appendChild(Dwt.parseHtmlFragment(htmlArr.join("")));

}

// TODO: prefix char can also be "|"
LmMailMsgView.prototype._generateBody =
function(html, idx, body) {
	if (!body) return;

	// checking for object manager wont be necessary once proper new window is created for rfc/822
	var b = this._objectManager ? this._objectManager.findObjects(body, true) : body;
	html[idx++] = b.replace(/^ /mg, "&nbsp;").replace(/\t/g, "<pre style='display:inline;'>\t</pre>").replace(/\n/g, "<br>");
	return idx;	
	//single level of quoted text
	//html[idx++] = b.replace(/^ /mg, "&nbsp;").replace(/^&gt;(.*)$/mg, "<span class='QuotedText0'>&gt;$1</span>").replace(/\n/g, "<br>");
}

LmMailMsgView.prototype._setTags =
function(msg) {
	if (!this._appCtxt.get(LmSetting.TAGGING_ENABLED) || (this._mode != LmController.MSG_VIEW)) return;

	var table = Dwt.getDomObj(this.getDocument(), this._hdrTableId);
	var tagRow = Dwt.getDomObj(this.getDocument(), this._tagRowId);
	var hadTags = (tagRow != null);
	var numTags = msg.tags.length;
	var hasTags = (numTags > 0);
	if (!hadTags && hasTags) {
		tagRow = table.insertRow(-1);
		tagRow.id = this._tagRowId;
		var tagCell = tagRow.insertCell(-1);
		tagCell.className = "LabelColName";
		tagCell.innerHTML = LmMsg.tags + ": ";
		tagCell = tagRow.insertCell(-1);
		tagCell.className = "LabelColValue";
		tagCell.id = this._tagCellId;
	} else if (hadTags && !hasTags) {
		table.deleteRow(-1);
		return;
	} else if (!hasTags) {
		return;
	}
	
	// get sorted list of tags for this msg
	var ta = new Array();	
	for (var i = 0; i < numTags; i++)
		ta[i] = this._tagList.getById(msg.tags[i]);
	ta.sort(LmTag.sortCompare);
	
	if (numTags > 0) {
		var html = new Array();
		var idx = 0;
		for (var i = 0; i < numTags; i++) {
			var colorInfo = LmTag.COLOR_MINI_ICON[ta[i].color];
			var txtWidth = Dwt.getHtmlExtent(ta[i].name).x;
			html[idx++] = "<table cellpadding=0 cellspacing=0 style='display:inline; width:";
			html[idx++] = txtWidth + colorInfo[1]; 
			html[idx++] = "'><tr><td style='width:";
			html[idx++] = colorInfo[1];
			html[idx++] = "'>";
			var fieldId = this._tagCellId + LmDoublePaneView._TAG_IMG + ta[i].id;
			html[idx++] = LsImg.getImageHtml(colorInfo, null, ["id='", fieldId, "'"].join(""), true);
			html[idx++] = "</td><td style='cursor:default;width:'";
			html[idx++] = txtWidth;
			html[idx++] = "'>"
			html[idx++] = LsStringUtil.htmlEncode(ta[i].name);
			html[idx++] = "</td></tr></table>";
		}
	}
	var tagCell = Dwt.getDomObj(this.getDocument(), this._tagCellId);
	tagCell.innerHTML = html.join("");
}

LmMailMsgView.prototype._msgChangeListener = 
function(ev) {
	if (ev.type != LmEvent.S_MSG)
		return;
	if (ev.event == LmEvent.E_TAGS || ev.event == LmEvent.E_REMOVE_ALL)
		this._setTags(this._msg);
}

LmMailMsgView.prototype._listChangeListener = 
function(ev) {
	// bug fix #3398 - check list size before nuking the msg view
	if (ev.source.size() == 0 && (ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_MOVE))
		this.reset();
}

LmMailMsgView.prototype._mouseDownListener = 
function(ev) {
	if (ev.button == DwtMouseEvent.LEFT) {
		// reset mouse event to propagate event to browser (allows text selection)
		ev._stopPropagation = false;
		ev._returnValue = true;
		ev._populated = true;
	}
}

LmMailMsgView.prototype._selectStartListener = 
function(ev) {
	// reset mouse event to propagate event to browser (allows text selection)
	ev._stopPropagation = false;
	ev._returnValue = true;
	ev._populated = true;
}

LmMailMsgView.prototype._contextMenuListener = 
function(ev) {
	// reset mouse event to propagate event to browser (allows context menu)
	ev._stopPropagation = false;
	ev._returnValue = true;
	ev._populated = true;
}

LmMailMsgView.prototype.preventSelection = 
function() {
	return false;
}

LmMailMsgView.prototype.preventContextMenu = 
function(target) {
	var bObjFound = target.id.indexOf("OBJ_") == 0;
	var bSelection = false;
	
	// determine if anything has been selected (IE and mozilla do it differently)
	if (this.getDocument().selection) { // IE
		if (this.getDocument().selection.type == "Text")
			bSelection = true;
	} else if (getSelection()) { 		// mozilla
		if (getSelection().toString().length)
			bSelection = true;
	}
	
	// if something has been selected and target is not a custom object,
	return bSelection && !bObjFound ? false : true;
}

LmMailMsgView.prototype._tagChangeListener = 
function(ev) {
	if (ev.type != LmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	if (ev.event == LmEvent.E_MODIFY && (fields && fields[LmOrganizer.F_COLOR])) {
		var img = Dwt.getDomObj(this.getDocument(), this._tagCellId +  LmDoublePaneView._TAG_IMG + ev.source.id);
		if (img)
			LsImg.setImage(img, LmTag.COLOR_MINI_ICON[ev.source.color]);
	}
	
	if (ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_RENAME || ev.event == LmEvent.MODIFY)
		this._setTags(this._msg);
}

LmMailMsgView.getPrintHtml = 
function(msg, preferHtml) {
	if (!(msg instanceof LmMailMsg))
		return;
	
	if (!msg.isLoaded()) {
		var soapDoc = LsSoapDoc.create("GetMsgRequest", "urn:liquidMail", null);
		var msgNode = soapDoc.set("m");
		msgNode.setAttribute("id", msg.id);
		if (preferHtml)
			msgNode.setAttribute("html", "1");
		var resp = LsCsfeCommand.invoke(soapDoc).Body.GetMsgResponse;
		msg._loadFromDom(resp.m[0]);
	}
	
	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<div style='width: 100%; background-color: #EEEEEE'>";
	html[idx++] = "<table border=0 width=100%>";
	html[idx++] = "<tr><td><font size=+1>";
	
	// print FROM address and DATE
	var from = msg.getAddresses(LmEmailAddress.FROM).get(0);
	html[idx++] = from ? LsStringUtil.htmlEncode(from.toString()) : "";
	html[idx++] = "</font></td>";
	html[idx++] = "<td align=right><font size=+1>";
	html[idx++] = msg.sentDate 
		? (new Date(msg.sentDate)).toLocaleString() 
		: (new Date(msg.date)).toLocaleString();
	html[idx++] = "</font></td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "<table border=0 width=100%>";

	// print TO and CC addresses
	for (var j = 0; j < LmMailMsg.ADDRS.length; j++) {
		if (LmMailMsg.ADDRS[j] != LmEmailAddress.TO && LmMailMsg.ADDRS[j] != LmEmailAddress.CC)
			continue;
		
		var addrs = msg.getAddresses(LmMailMsg.ADDRS[j]);
		var len = addrs.size();
		if (len > 0) {
			html[idx++] = "<tr>";
			html[idx++] = "<td valign=top style='font-size: 14px'>";
			html[idx++] = LmMsg[LmEmailAddress.TYPE_STRING[LmMailMsg.ADDRS[j]]];
			html[idx++] = ": </td><td width=100% style='font-size: 14px'>";
			for (var i = 0; i < len; i++) {
				html[idx++] = i > 0 ? LsStringUtil.htmlEncode(LmEmailAddress.SEPARATOR) : "";
				html[idx++] = addrs.get(i).address;
			}
			html[idx++] = "</td>";
			html[idx++] = "</tr>";
		}
	}
	html[idx++] = "</table>";
	html[idx++] = "</div>";

	// finally, print content
	var content = null;
	var bodyPart = msg.getBodyPart();
	if (bodyPart) {
		html[idx++] = "<div style='padding: 10px; font-size: 12px'>";
		if (bodyPart.ct == LmMimeTable.TEXT_HTML && preferHtml) {
			// TODO - html should really sit in its own iframe but not so easy to do...
			html[idx++] = bodyPart.content;
		} else {
			content = bodyPart.ct != LmMimeTable.TEXT_PLAIN 
				? msg.getTextPart() 
				: bodyPart.content;
			html[idx++] = LsStringUtil.htmlEncodeSpace(content);
		}
		html[idx++] = "</div>";
	}

	return html.join("");
}
