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

ZmMailMsgView = function(params) {

	if (arguments.length == 0) { return; }

	params.className = params.className || "ZmMailMsgView";
	ZmMailItemView.call(this, params);

	this._mode = params.mode;
	this._controller = params.controller;
	this._viewId = this._getViewId();

	this._displayImagesId	= ZmId.getViewId(this._viewId, ZmId.MV_DISPLAY_IMAGES, this._mode);
	this._msgTruncatedId	= ZmId.getViewId(this._viewId, ZmId.MV_MSG_TRUNC, this._mode);
	this._infoBarId			= ZmId.getViewId(this._viewId, ZmId.MV_INFO_BAR, this._mode);
	this._tagRowId			= ZmId.getViewId(this._viewId, ZmId.MV_TAG_ROW, this._mode);
	this._tagCellId			= ZmId.getViewId(this._viewId, ZmId.MV_TAG_CELL, this._mode);
	this._attLinksId		= ZmId.getViewId(this._viewId, ZmId.MV_ATT_LINKS, this._mode);

	// expand/collapse vars
	this._expandHeader = true;
	this._expandDivId = ZmId.getViewId(this._viewId, ZmId.MV_EXPAND_DIV, this._mode);

	this._scrollWithIframe = params.scrollWithIframe;
	this._limitAttachments = this._scrollWithIframe ? 3 : 0; //making it local
	this._attcMaxSize = this._limitAttachments * 16 + 8;
	this.setScrollStyle(this._scrollWithIframe ? DwtControl.CLIP : DwtControl.SCROLL);

	if (!appCtxt.isChildWindow) {
		// Add change listener to taglist to track changes in tag color
		this._tagList = appCtxt.getTagTree();
		if (this._tagList) {
			this._tagList.addChangeListener(this._tagChangeListener.bind(this));
			this.addListener(ZmMailMsgView._TAG_CLICK, this._msgTagClicked.bind(this));
		}
	}

	this._setMouseEventHdlrs(); // needed by object manager
	this._objectManager = true;

	this._changeListener = this._msgChangeListener.bind(this);
	this.addListener(DwtEvent.ONSELECTSTART, this._selectStartListener.bind(this));
	this.addListener(DwtEvent.CONTROL, this._controlEventListener.bind(this));

	// bug fix #25724 - disable right click selection for offline
	if (!appCtxt.isOffline) {
		this._setAllowSelection();
	}

	this.noTab = true;
    this._attachmentLinkIdToFileNameMap = null;
};

ZmMailMsgView.prototype = new ZmMailItemView;
ZmMailMsgView.prototype.constructor = ZmMailMsgView;

ZmMailMsgView.prototype.isZmMailMsgView = true;
ZmMailMsgView.prototype.toString = function() {	return "ZmMailMsgView"; };


// displays any additional headers in messageView
//pass ZmMailMsgView.displayAdditionalHdrsInMsgView[<actualHeaderName>] = <DisplayName>
//pass ZmMailMsgView.displayAdditionalHdrsInMsgView["X-Mailer"] = "Sent Using:"
ZmMailMsgView.displayAdditionalHdrsInMsgView = {};


// Consts

ZmMailMsgView.SCROLL_WITH_IFRAME	= true;
ZmMailMsgView.LIMIT_ATTACHMENTS 	= ZmMailMsgView.SCROLL_WITH_IFRAME ? 3 : 0;
ZmMailMsgView.ATTC_COLUMNS			= 2;
ZmMailMsgView.ATTC_MAX_SIZE			= ZmMailMsgView.LIMIT_ATTACHMENTS * 16 + 8;
ZmMailMsgView.QUOTE_DEPTH_MOD 		= 3;
ZmMailMsgView.MAX_SIG_LINES 		= 8;
ZmMailMsgView.SIG_LINE 				= /^(- ?-+)|(__+)\r?$/;
ZmMailMsgView._inited 				= false;
ZmMailMsgView._TAG_CLICK 			= "ZmMailMsgView._TAG_CLICK";
ZmMailMsgView._TAG_ANCHOR 			= "TA";
ZmMailMsgView._TAG_IMG 				= "TI";
ZmMailMsgView.SHARE_EVENT 			= "share";
ZmMailMsgView.SUBSCRIBE_EVENT 		= "subscribe";
ZmMailMsgView.IMG_FIX_RE			= new RegExp("(<img\\s+.*dfsrc\\s*=\\s*)[\"']http[^'\"]+part=([\\d\\.]+)[\"']([^>]*>)", "gi");
ZmMailMsgView.FILENAME_INV_CHARS_RE = /[\./?*:;{}'\\]/g; // Chars we do not allow in a filename
ZmMailMsgView.SETHEIGHT_MAX_TRIES	= 3;

ZmMailMsgView._URL_RE = /^((https?|ftps?):\x2f\x2f.+)$/;
ZmMailMsgView._MAILTO_RE = /^mailto:[\x27\x22]?([^@?&\x22\x27]+@[^@?&]+\.[^@?&\x22\x27]+)[\x27\x22]?/;

ZmMailMsgView.MAX_ADDRESSES_IN_FIELD = 10;

// tags that are trusted in HTML content that is not displayed in an iframe
ZmMailMsgView.TRUSTED_TAGS = ["#text", "a", "abbr", "acronym", "address", "article", "b", "basefont", "bdo", "big",
	"blockquote", "body", "br", "caption", "center", "cite", "code", "col", "colgroup", "dd", "del", "dfn", "dir",
	"div", "dl", "dt", "em", "font", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "img",
	"ins", "kbd", "li", "mark", "menu", "meter", "nav", "ol", "p", "pre", "q", "s", "samp", "section", "small",
	"span", "strike", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "time", "tr", "tt",
	"u", "ul", "var", "wbr"];

// attributes that we don't want to appear in HTML displayed in a div
ZmMailMsgView.UNTRUSTED_ATTRS = ["id", "class", "name", "profile"];

// styles that we don't want to appear in HTML displayed in a div
// for example, some clown may try to mess with us using absolute positioning
ZmMailMsgView.BAD_STYLES = ["position:absolute"];


// Public methods

ZmMailMsgView.prototype.getController =
function() {
	return this._controller;
};

ZmMailMsgView.prototype.reset =
function() {
	// Bug 23692: cancel any pending actions
	if (this._resizeAction) {
		AjxTimedAction.cancelAction(this._resizeAction);
		this._resizeAction = null;
	}
	if (this._objectsAction) {
		AjxTimedAction.cancelAction(this._objectsAction);
		this._objectsAction = null;
	}
	this._msg = this._item = null;
	this._htmlBody = null;
	this._containerEl = null;

	// TODO: reuse all these controls that are being disposed here.....
	if (this._expandButton) {
		this._expandButton.setVisible(false);
		this._expandButton.reparentHtmlElement(this.getHtmlElement());
	}
	if (this._ifw) {
		this._ifw.dispose();
		this._ifw = null;
	}
	if (this._inviteMsgView) {
		this._inviteMsgView.reset();
	}

	this.getHtmlElement().innerHTML = "";
	if (this._objectManager && this._objectManager.reset) {
		this._objectManager.reset();
	}
	this.setScrollWithIframe(this._scrollWithIframe);
};

ZmMailMsgView.prototype.preventSelection =
function() {
	return false;
};

ZmMailMsgView.prototype.set =
function(msg, force) {
	if (!force && this._msg && msg && (this._msg.id == msg.id)) { return; }

	var oldMsg = this._msg;
	this.reset();
	var contentDiv = this._getContainer();
	this._msg = this._item = msg;

	if (!msg) {
		if (this._inviteMsgView) {
			this._inviteMsgView.resize(true); //make sure the msg preview pane takes the entire area, in case we were viewing an invite. (since then it was resized to allow for day view) - bug 53098
		}
		contentDiv.innerHTML = AjxTemplate.expand("mail.Message#viewMessage");
		this.noTab = true;
		return;
	}

	var respCallback = this._handleResponseSet.bind(this, msg, oldMsg);
	this._renderMessage(msg, contentDiv, respCallback);
	this.noTab = AjxEnv.isIE;
};

ZmMailMsgView.prototype._getContainer =
function() {
	return this.getHtmlElement();
};

ZmMailMsgView.prototype.__hasMountpoint =
function(share) {
	var tree = appCtxt.getFolderTree();
	return tree
		? this.__hasMountpoint2(tree.root, share.grantor.id, share.link.id)
		: false;
};

ZmMailMsgView.prototype.__hasMountpoint2 =
function(organizer, zid, rid) {
	if (organizer.zid == zid && organizer.rid == rid)
		return true;

	if (organizer.children) {
		var children = organizer.children.getArray();
		for (var i = 0; i < children.length; i++) {
			var found = this.__hasMountpoint2(children[i], zid, rid);
			if (found) {
				return true;
			}
		}
	}
	return false;
};

ZmMailMsgView.prototype.highlightObjects =
function(origText) {
	if (origText != null) {
		// we get here only for text messages; it's a lot
		// faster to call findObjects on the whole text rather
		// than parsing the DOM.
		DBG.timePt("START - highlight objects on-demand, text msg.");
		this._lazyCreateObjectManager();
		var html = this._objectManager.findObjects(origText, true, null, true);
		html = html.replace(/^ /mg, "&nbsp;")
			.replace(/\t/g, "<pre style='display:inline;'>\t</pre>")
			.replace(/\n/g, "<br>");
		var container = this.getContentContainer();
		container.innerHTML = html;
		DBG.timePt("END - highlight objects on-demand, text msg.");
	} else {
		this._processHtmlDoc();
	}
};

ZmMailMsgView.prototype.resetMsg =
function(newMsg) {
	// Remove listener for current msg if it exists
	if (this._msg) {
		this._msg.removeChangeListener(this._changeListener);
	}
};

ZmMailMsgView.prototype.getMsg =
function() {
	return this._msg;
};

ZmMailMsgView.prototype.getItem = ZmMailMsgView.prototype.getMsg;

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmMailMsgView.prototype.getSelection =
function() {
	return [this._msg];
};

ZmMailMsgView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmMailMsgView.prototype.getMinHeight =
function() {
	if (!this._headerHeight) {
		var headerObj = document.getElementById(this._hdrTableId);
		this._headerHeight = headerObj ? Dwt.getSize(headerObj).y : 0;
	}
	return this._headerHeight;
};

// returns true if the current message was rendered in HTML
ZmMailMsgView.prototype.hasHtmlBody =
function() {
	return this._htmlBody != null;
};

// returns the IFRAME's document if we are using one, or the window document
ZmMailMsgView.prototype.getDocument =
function() {
	return this._usingIframe ? Dwt.getIframeDoc(this.getIframe()) : document;
};

// returns the IFRAME element if we are using one
ZmMailMsgView.prototype.getIframe =
function() {

	if (!this._usingIframe) { return null; }
	
	var iframe = this._iframeId && document.getElementById(this._iframeId);
	iframe = iframe || (this._ifw && this._ifw.getIframe());
	return iframe;
};
ZmMailMsgView.prototype.getIframeElement = ZmMailMsgView.prototype.getIframe;

// Returns a BODY element if we are using an IFRAME, the container DIV if we are not.
ZmMailMsgView.prototype.getContentContainer =
function() {
	if (this._usingIframe) {
		var idoc = this.getDocument();
		return idoc && idoc.body;
	}
	else {
		return this._containerEl;
	}
};

ZmMailMsgView.prototype.addInviteReplyListener =
function(listener) {
	this.addListener(ZmInviteMsgView.REPLY_INVITE_EVENT, listener);
};

ZmMailMsgView.prototype.addShareListener =
function(listener) {
	this.addListener(ZmMailMsgView.SHARE_EVENT, listener);
};

ZmMailMsgView.prototype.addSubscribeListener =
function(listener) {
	this.addListener(ZmMailMsgView.SUBSCRIBE_EVENT, listener);
};

ZmMailMsgView.prototype.setVisible =
function(visible) {
	DwtComposite.prototype.setVisible.apply(this, arguments);

	if (this._inviteMsgView) {
		if (visible && this._msg) {
			this._inviteMsgView.set(this._msg);
			this._inviteMsgView.showMoreInfo();
		} else {
			this._inviteMsgView.reset();
		}
	}
};


// Private / protected methods

ZmMailMsgView.prototype._getSubscribeToolbar =
function(req) {
	if (this._subscribeToolbar) {
		if (AjxEnv.isIE) {
			//reparenting on IE does not work. So recreating in this case. (similar to bug 52412 for the invite toolbar)
			this._subscribeToolbar.dispose();
			this._subscribeToolbar = null;
		}
		else {
			return this._subscribeToolbar;
		}
	}

	this._subscribeToolbar = this._getButtonToolbar([ZmOperation.SUBSCRIBE_APPROVE, ZmOperation.SUBSCRIBE_REJECT],
												ZmId.TB_SUBSCRIBE,
												this._subscribeToolBarListener.bind(this, req));

	return this._subscribeToolbar;
};



ZmMailMsgView.prototype._getShareToolbar =
function() {
	if (this._shareToolbar) {
		if (AjxEnv.isIE) {
			//reparenting on IE does not work. So recreating in this case. (similar to bug 52412 for the invite toolbar)
			this._shareToolbar.dispose();
			this._shareToolbar = null;
		}
		else {
			return this._shareToolbar;
		}
	}

	this._shareToolbar = this._getButtonToolbar([ZmOperation.SHARE_ACCEPT, ZmOperation.SHARE_DECLINE],
												ZmId.TB_SHARE,
												this._shareToolBarListener.bind(this));

	return this._shareToolbar;
};

ZmMailMsgView.prototype._getButtonToolbar =
function(buttonIds, toolbarType, listener) {

	var params = {
		parent: this,
		buttons: buttonIds,
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmShareToolBar",
		buttonClassName: "DwtToolbarButton",
		context: this._mode,
		toolbarType: toolbarType
	};
	var toolbar = new ZmButtonToolBar(params);

	for (var i = 0; i < buttonIds.length; i++) {
		var id = buttonIds[i];

		// HACK: IE doesn't support multiple class names.
		var b = toolbar.getButton(id);
		b._hoverClassName = b._className + "-" + DwtCssStyle.HOVER;
		b._activeClassName = b._className + "-" + DwtCssStyle.ACTIVE;

		toolbar.addSelectionListener(id, listener);
	}

	return toolbar;
};

ZmMailMsgView.prototype._notifyZimletsNewMsg =
function(msg, oldMsg) {
	// notify zimlets that a new message has been opened
	appCtxt.notifyZimlets("onMsgView", [msg, oldMsg, this]);
};


ZmMailMsgView.prototype._handleResponseSet =
function(msg, oldMsg) {

	var notifyZimletsInShowMore = false;
	if (this._inviteMsgView) {
		// always show F/B view if in stand-alone message view otherwise, check
		// if reading pane is on
		if (this._inviteMsgView.isActive() &&
			(this._controller.isReadingPaneOn() || (this._controller instanceof ZmMsgController)))
		{
			notifyZimletsInShowMore = true;
			this._inviteMsgView.showMoreInfo(this._notifyZimletsNewMsg.bind(this, msg, oldMsg));
		}
		else {
			// resize the message view without F/B view
			this._inviteMsgView.resize(true);
		}
	}

	if (!appCtxt.isChildWindow) {
		this._setTags(msg);
		// Remove listener for current msg if it exists
		if (oldMsg) {
			oldMsg.removeChangeListener(this._changeListener);
		}
		msg.addChangeListener(this._changeListener);
	}

	// reset scroll view to top most
	var htmlElement = this.getHtmlElement();
	htmlElement.scrollTop = 0;
	if (htmlElement.scrollTop != 0 && this._usingIframe) {
		/* situation that happens only on Chrome, without repro steps - bug 55775/57090 */
		AjxDebug.println(AjxDebug.SCROLL, "scrollTop not set to 0. scrollTop=" + htmlElement.scrollTop + " offsetHeight=" + htmlElement.offsetHeight + " scrollHeight=" + htmlElement.scrollHeight + " browser=" + navigator.userAgent);
		AjxDebug.dumpObj(AjxDebug.SCROLL, htmlElement.outerHTML);
		/*
			trying this hack for solution -
			explanation: The scroll bar does not appear if the scrollHeight of the div is bigger than the total height of the iframe and header together (i.e. if htmlElement.scrollHeight >= htmlElement.offsetHeight)
			If the scrollbar does not appear it's set to, and stays 0 when the scrollbar reappears due to resizing the iframe in _resetIframeHeight (which is later, I think always on timer).
			So what I do here is set the height of the iframe to very small (since the default is 150px), so the scroll bar disappears.
			it will reappear when we reset the size in _resetIframeHeight. I hope this will solve the issue.
		*/
		var iframe = this.getIframe();
		if (iframe) {
			iframe.style.height = "1px";
			AjxDebug.println(AjxDebug.SCROLL, "scrollTop after resetting it with the hack =" + htmlElement.scrollTop);
		}

	}

	if (!notifyZimletsInShowMore) {
		this._notifyZimletsNewMsg(msg, oldMsg);
	}

	if (!msg.isDraft && msg.readReceiptRequested) {
		this._controller.sendReadReceipt(msg);
	}
};

// Create the ObjectManager at the last minute just before we scan the message
ZmMailMsgView.prototype._lazyCreateObjectManager =
function() {
	// objectManager will be 'true' at create time, after that it will be the
	// real object. NOTE: Replaced if (this._objectManager === true) as "==="
	// does deep comparision of objects which might take a while.
	var createObjectMgr = (AjxUtil.isBoolean(this._objectManager) && this._objectManager);
	var firstCallAfterZimletLoading = (!this.zimletLoadFlag && appCtxt.getZimletMgr().isLoaded());
	
	if (createObjectMgr || firstCallAfterZimletLoading) {
		this.zimletLoadFlag = appCtxt.getZimletMgr().isLoaded();
		// this manages all the detected objects within the view
		this._objectManager = new ZmObjectManager(this);
	}
};

// This is needed for Gecko only: for some reason, clicking on a local link will
// open the full Zimbra chrome in the iframe :-( so we fake a scroll to the link
// target here. (bug 7927)
ZmMailMsgView.__localLinkClicked =
function(msgView, ev) {
	// note that this function is called in the context of the link ('this' is an A element)
	var id = this.getAttribute("href");
	var el = null;
	var doc = this.ownerDocument;

	if (id.substr(0, 1) == "#") {
		id = id.substr(1);
		el = doc.getElementById(id);
		if (!el) {
			try {
				el = doc.getElementsByName(id)[0];
			} catch(ex) {}
		}
		if (!el) {
			id = decodeURIComponent(id);
			el = doc.getElementById(id);
			if (!el) {
				try {
					el = doc.getElementsByName(id)[0];
				} catch(ex) {}
			}
		}
	}

	// attempt #1: doesn't work at all -- we're not scrolling with the IFRAME :-(
	// 		if (el) {
	// 			var pos = Dwt.getLocation(el);
	// 			doc.contentWindow.scrollTo(pos.x, pos.y);
	// 		}

	// attempt #2: works pretty well, but the target node will showup at the bottom of the frame
	// 		var foo = doc.createElement("a");
	// 		foo.href = "#";
	// 		foo.innerHTML = "foo";
	// 		el.parentNode.insertBefore(foo, el);
	// 		foo.focus();

	// the final monstrosity: scroll the containing DIV
	// (that is the whole msgView).  Note we have to take
	// into account the headers, "display images", etc --
	// so we add iframe.offsetTop/Left.
	if (el) {
		var div = msgView.getHtmlElement();
		var iframe = msgView.getIframe();
		var pos = Dwt.getLocation(el);
		div.scrollTop = pos.y + iframe.offsetTop - 20; // fuzz factor necessary for unknown reason :-(
		div.scrollLeft = pos.x + iframe.offsetLeft;
	}
	if (ev) {
		ev.stopPropagation();
		ev.preventDefault();
	}
	return false;
};

ZmMailMsgView.prototype.hasValidHref =
function (node) {
	// Bug 22958: IE can throw when you try and get the href if it doesn't like
	// the value, so we wrap the test in a try/catch.
	// hrefs formatted like http://www.name@domain.com can cause this to happen.
	try {
		var href = node.href;
		return ZmMailMsgView._URL_RE.test(href) || ZmMailMsgView._MAILTO_RE.test(href);
	} catch (e) {
		return false;
	}
};

// Dives recursively into the given DOM node.  Creates ObjectHandlers in text
// nodes and cleans the mess in element nodes.  Discards by default "script",
// "link", "object", "style", "applet" and "iframe" (most of them shouldn't
// even be here since (1) they belong in the <head> and (2) are discarded on
// the server-side, but we check, just in case..).
ZmMailMsgView.prototype._processHtmlDoc =
function() {

	var parent = this._usingIframe ? this.getDocument() : this._containerEl;
	if (!parent) { return; }

	DBG.timePt("Starting ZmMailMsgView.prototype._processHtmlDoc");
	// bug 8632
	var images = parent.getElementsByTagName("img");
	if (images.length > 0) {
		var length = images.length;
		for (var i = 0; i < images.length; i++) {
			this._checkImgInAttachments(images[i]);
		}
	}

	//Find Zimlet Objects lazly
	this.lazyFindMailMsgObjects(500);

	DBG.timePt("-- END _processHtmlDoc");
};

ZmMailMsgView.prototype.lazyFindMailMsgObjects =
function(interval) {
	if (this._objectManager) {
		this._lazyCreateObjectManager();
		this._objectsAction = new AjxTimedAction(this, this._findMailMsgObjects);
		AjxTimedAction.scheduleAction(this._objectsAction, ( interval || 500 ));
	}
};

ZmMailMsgView.prototype._findMailMsgObjects =
function() {
	var doc = this.getDocument();
	if (doc) {
		this._objectManager.processObjectsInNode(doc, this._usingIframe ? doc.body : this._containerEl);
	}
};

ZmMailMsgView.prototype._checkImgInAttachments =
function(img) {
	if (!this._msg || img.getAttribute("zmforced")) { return; }

	var attachments = this._msg.attachments;
	var csfeMsgFetch = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
	try {
		var src = img.getAttribute("src") || img.getAttribute("dfsrc");
	}
	catch(e) {
		AjxDebug.println(AjxDebug.DATA_URI, "_checkImgInAttachments: couldn't access attribute src or dfsrc");
	}
	var cid;
	if (/^cid:(.*)/.test(src)) {
		cid = "<" + RegExp.$1 + ">";
	}

	for (var i = 0; i < attachments.length; i++) {
		var att = attachments[i];

		if (att.foundInMsgBody) { continue; }

		if (cid && att.contentId == cid) {
			att.foundInMsgBody = true;
			break;
		} else if (src && src.indexOf(csfeMsgFetch) == 0) {
			var mpId = src.substring(src.lastIndexOf("=") + 1);
			if (mpId == att.part) {
				att.foundInMsgBody = true;
				break;
			}
		} else if (att.contentLocation && src) {
			var filename = src.substring(src.lastIndexOf("/") + 1);
			if (filename == att.fileName) {
				att.foundInMsgBody = true;
				break;
			}
		}
	}
};

ZmMailMsgView.prototype._fixMultipartRelatedImages =
function(msg, parent) {
	// fix <img> tags
	var images = parent.getElementsByTagName("img");
	var hasExternalImages = false;
	if (this._usingIframe) {
		var self = this;
		var onload = function() {
			//resize iframe onload of image
			ZmMailMsgView._resetIframeHeight(self);
			this.onload = null; // *this* is reference to <img> el.
		};
	}
	for (var i = 0; i < images.length; i++) {
		var img = images[i];
		var external = ZmMailMsgView._isExternalImage(img);	// has "dfsrc" attr
		if (!external) { //Inline image
			ZmMailMsgView.__unfangInternalImage(msg, img, "src", false);
			img.onload = onload;
		}
        else {
            img.setAttribute("src", "/img/mail/ImgBlockedImage.png");
            img.setAttribute("onload", "this.style.visibility = 'hidden'");
            img.style.visibility = 'hidden';
        }
		hasExternalImages = external || hasExternalImages;
	}
	// fix all elems with "background" attribute
	hasExternalImages = this._fixMultipartRelatedImagesRecurse(msg, this._usingIframe ? parent.body : parent) || hasExternalImages;

	// did we get them all?
	return !hasExternalImages;
};

ZmMailMsgView.prototype._fixMultipartRelatedImagesRecurse =
function(msg, node) {

	var hasExternalImages = false;

	function recurse(node){
		var child = node.firstChild;
		while (child) {
			if (child.nodeType == AjxUtil.ELEMENT_NODE) {
				hasExternalImages = ZmMailMsgView.__unfangInternalImage(msg, child, "background", true) || hasExternalImages;
				recurse(child);
			}
			child = child.nextSibling;
		}
	}

	if (node.innerHTML.indexOf("dfbackground") != -1) {
		recurse(node);
	}
	else if (node.attributes && node.getAttribute("dfbackground") != -1) {
		hasExternalImages = ZmMailMsgView.__unfangInternalImage(msg, node, "background", true);	
	}

	return hasExternalImages;
};

/**
 * Determines if an img element references an external image
 * @param elem {HTMLelement}
 * @return {Boolean} true if image is external
 */
ZmMailMsgView._isExternalImage = 
function(elem) {
	if (!elem) {
		return false;
	}
	return Boolean(elem.getAttribute("dfsrc"));
}

/**
 * Reverses the work of the (server-side) defanger, so that images are displayed.
 * 
 * @param {ZmMailMsg}	msg			mail message
 * @param {Element}		elem		element to be checked (img)
 * @param {string}		aname		attribute name
 * @param {boolean}		external	if true, look only for external images
 * 
 * @return	true if the image is external
 */
ZmMailMsgView.__unfangInternalImage =
function(msg, elem, aname, external) {
	
	var avalue, pnsrc;
	try {
		if (external) {
			avalue = elem.getAttribute("df" + aname);
		}
		else {
			pnsrc = avalue = elem.getAttribute("pn" + aname);
			avalue = avalue || elem.getAttribute(aname);
		}
	}
	catch(e) {
		AjxDebug.println(AjxDebug.DATA_URI, "__unfangInternalImage: couldn't access attribute " + aname);
	}

	if (avalue) {
		if (avalue.substr(0,4) == "cid:") {
			var cid = "<" + AjxStringUtil.urlComponentDecode(avalue.substr(4)) + ">"; // Parse percent-escaping per bug #52085 (especially %40 to @)
			avalue = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_ID, cid);
			if (avalue) {
				elem.setAttribute(aname, avalue);
			}
			return false;
		} else if (avalue.substring(0,4) == "doc:") {
			avalue = [appCtxt.get(ZmSetting.REST_URL), ZmFolder.SEP, avalue.substring(4)].join('');
			if (avalue) {
				elem.setAttribute(aname, avalue);
				return false;
			}
		} else if (pnsrc) { // check for content-location verison
			avalue = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_LOCATION, avalue);
			if (avalue) {
				elem.setAttribute(aname, avalue);
				return false;
			}
		} else if (avalue.substring(0,5) == "data:") {
			return false;
		}
		return true;	// not recognized as inline img
	}
	return false;
};

ZmMailMsgView.prototype._createDisplayImageClickClosure =
function(msg, parent, id) {
	var self = this;
	return function(ev) {
        var target = DwtUiEvent.getTarget(ev),
            targetId = target ? target.id : null,
            addrToAdd = "";
        var diEl = document.getElementById(id);
        
        //This is required in case of the address is marked as trusted, the function is called without any target being set
        var force = (msg && msg.showImages) ||  appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES);

        if (!force) {
            if (!targetId) { return; }
            if (targetId.indexOf("domain") != -1) {
                //clicked on domain
                addrToAdd = msg.sentByDomain;
            }
            else if (targetId.indexOf("email") != -1) {
                //clicked on email
                addrToAdd = msg.sentByAddr;
            }
            else if (targetId.indexOf("dispImgs") != -1) {
               //do nothing here - just load the images
            }
            else if (targetId.indexOf("close") != -1) {
				Dwt.setVisible(diEl, false);
                return;
            }
            else {
                //clicked elsewhere in the info bar - DO NOTHING AND RETURN
                return;
            }
        }
        //Create a modifyprefs req and add the addr to modify
        if (addrToAdd) {
            var trustedList = self.getTrustedSendersList();
            trustedList.add(addrToAdd, null, true);
			var callback = self._addTrustedAddrCallback.bind(self, addrToAdd);
			var errorCallback = self._addTrustedAddrErrorCallback.bind(self, addrToAdd); 
            self._controller.addTrustedAddr(trustedList.getArray(), callback, errorCallback);
        }

		var images = parent.getElementsByTagName("img");
		var onload = null;
		if (self._usingIframe) {
			onload = function() {            
				ZmMailMsgView._resetIframeHeight(self);
				this.onload = null; // *this* is reference to <img> el.
			};
		}
		for (var i = 0; i < images.length; i++) {
			var dfsrc = images[i].getAttribute("dfsrc");
			if (dfsrc && dfsrc.match(/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\_\.]*(\?\S+)?)?)?/)) {
				images[i].onload = function(e) {this.style.visibility = 'visible'};
				images[i].src = images[i].getAttribute("dfsrc");
			}
		}

		Dwt.setVisible(diEl, false);
		self._htmlBody = self.getContentContainer().innerHTML;
		if (msg) {
			msg.setHtmlContent(self._htmlBody);
			msg.showImages = true;
		}
        //Make sure the link is not followed
        return false;
	};
};

ZmMailMsgView.prototype._resetIframeHeightOnTimer =
function(attempt) {
	
	if (!this._usingIframe) { return; }

	DBG.println(AjxDebug.DBG1, "_resetIframeHeightOnTimer attempt: " + (attempt != null ? attempt : "null"));
	// Because sometimes our view contains images that are slow to download, wait a
	// little while before resizing the iframe.
	var act = this._resizeAction = new AjxTimedAction(this, ZmMailMsgView._resetIframeHeight, [this, attempt]);
	AjxTimedAction.scheduleAction(act, 200);
};

ZmMailMsgView.prototype._makeHighlightObjectsDiv =
function(origText) {
	var self = this;
	function func() {
		var div = document.getElementById(self._highlightObjectsId);
		div.innerHTML = ZmMsg.pleaseWaitHilitingObjects;
		setTimeout(function() {
			self.highlightObjects(origText);
			Dwt.setVisible(div, false);
			ZmMailMsgView._resetIframeHeight(self);
		}, 3);
		return false;
	}
	// avoid closure memory leaks
	(function() {
		var infoBarDiv = document.getElementById(self._infoBarId);
		if (infoBarDiv) {
			self._highlightObjectsId = ZmId.getViewId(this._viewId, ZmId.MV_HIGHLIGHT_OBJ, self._mode);
			var subs = {
				id: self._highlightObjectsId,
				text: ZmMsg.objectsNotDisplayed,
				link: ZmMsg.hiliteObjects
			};
			var html = AjxTemplate.expand("mail.Message#InformationBar", subs);
			infoBarDiv.appendChild(Dwt.parseHtmlFragment(html));

			var div = document.getElementById(subs.id+"_link");
			Dwt.setHandler(div, DwtEvent.ONCLICK, func);
		}
	})();
};

ZmMailMsgView.prototype._stripHtmlComments =
function(html) {
	// bug: 38273 - Remove HTML Comments <!-- -->
	// But make sure not to remove inside style|script tags.
	var regex =  /<(?:!(?:--[\s\S]*?--\s*)?(>)\s*|(?:script|style|SCRIPT|STYLE)[\s\S]*?<\/(?:script|style|SCRIPT|STYLE)>)/g;
	html = html.replace(regex,function(m, $1) {
		return $1 ? '':m;
	});
	return html;
};

// Returns true (the default) if we should display content in an IFRAME as opposed to a DIV.
ZmMailMsgView.prototype._useIframe =
function(isTextMsg, html, isTruncated) {
	return true;
};

// Displays the given content in an IFRAME or a DIV.
ZmMailMsgView.prototype._displayContent =
function(params) {

	var html = params.html || "";
	
	if (!params.isTextMsg) {
		//Microsoft silly smilies
		html = html.replace(/<span style="font-family:Wingdings">J<\/span>/g, "\u263a"); // :)
		html = html.replace(/<span style="font-family:Wingdings">L<\/span>/g, "\u2639"); // :(
	}

	// The info bar allows the user to load external images. We show it if:
	// - msg is HTML
	// - user pref says not to show images up front, or this is Spam folder
	// - we're not already showing images
	// - there are <img> tags
	var isSpam = (this._msg && this._msg.folderId == ZmOrganizer.ID_SPAM);
	var imagesNotShown = (!this._msg || !this._msg.showImages);
	this._needToShowInfoBar = (!params.isTextMsg &&
		(!appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) || isSpam) &&
		imagesNotShown && /<img/i.test(html));
	var displayImages;
	if (this._needToShowInfoBar) {
		displayImages = this._showInfoBar(this._infoBarId);
	}

	var callback;
	var msgSize = (html.length / 1024);
	var maxHighlightSize = appCtxt.get(ZmSetting.HIGHLIGHT_OBJECTS);
	if (params.isTextMsg) {
		if (this._objectManager) {
			if (msgSize <= maxHighlightSize) {
				callback = this.lazyFindMailMsgObjects.bind(this, 500);
			} else {
				this._makeHighlightObjectsDiv(params.origText);
			}
		}
		if (AjxEnv.isSafari) {
			html = "<html><head></head><body>" + html + "</body></html>";
		}
	} else {
		html = this._stripHtmlComments(html);
		if (this._objectManager) {
			var images = html.match(/<img[^>]+>/ig);
			msgSize = (images) ? msgSize - (images.join().length / 1024) : msgSize; // Excluding images in the message
			
			if (msgSize <= maxHighlightSize) {
				callback = this._processHtmlDoc.bind(this);
			} else {
				this._makeHighlightObjectsDiv();
			}
		}
	}

	var msgTruncated;
	this._isMsgTruncated = false;
	if (params.isTruncated) {
		this._isMsgTruncated = true;
		var msgTruncatedDiv = document.getElementById(this._msgTruncatedId);
		if (!msgTruncatedDiv) {
			var infoBarDiv = document.getElementById(this._infoBarId);
			if (infoBarDiv) {
				var subs = {
					id: this._msgTruncatedId,
					text: ZmMsg.messageTooLarge,
					link: ZmMsg.viewEntireMessage
				};
				var msgTruncatedHtml = AjxTemplate.expand("mail.Message#InformationBar", subs);
				msgTruncated = Dwt.parseHtmlFragment(msgTruncatedHtml);
				infoBarDiv.appendChild(msgTruncated);
			}
		}
	}

	this._msgBodyDivId = [this._htmlElId, ZmId.MV_MSG_BODY].join("_");
	
	this._usingIframe = this._useIframe(params.isTextMsg, html, params.isTruncated);
	DBG.println(AjxDebug.DBG1, "Use IFRAME: " + this._usingIframe);
	
	if (this._usingIframe) {
		// bug fix #9475 - IE isnt resolving MsgBody class in iframe so set styles explicitly
		var inner_styles = AjxEnv.isIE ? ".MsgBody-text, .MsgBody-text * { font: 10pt monospace; }" : "";
		var params = {
			parent:					this,
			parentElement:			params.container,
			index:					params.index,
			className:				this._getBodyClass(),
			id:						this._msgBodyDivId,
			hidden:					true,
			html:					html,
			styles:					inner_styles,
			noscroll:				!this._scrollWithIframe,
			posStyle:				DwtControl.STATIC_STYLE,
			processHtmlCallback:	callback,
			useKbMgmt:				true
		};
		var ifw = this._ifw = new DwtIframe(params);
		if (ifw.initFailed) {
			AjxDebug.println(AjxDebug.MSG_DISPLAY, "Message display: IFRAME was not ready");
			appCtxt.setStatusMsg(ZmMsg.messageDisplayProblem);
			return;
		}
		this._iframeId = ifw.getIframe().id;

		var idoc = ifw.getDocument();

		if (AjxEnv.isGeckoBased) {
			// patch local links (pass null as object so it gets called in context of link)
			var geckoScrollCallback = ZmMailMsgView.__localLinkClicked.bind(null, this);
			var links = idoc.getElementsByTagName("a");
			for (var i = links.length; --i >= 0;) {
				var link = links[i];
				if (!link.target) {
					link.onclick = geckoScrollCallback; // has chances to be a local link
				}
			}
		}

		// assign the right class name to the iframe body
		idoc.body.className = this._getBodyClass() + (params.isTextMsg ? " MsgBody-text" : " MsgBody-html");

		idoc.body.style.height = "auto"; //see bug 56899 - if the body has height such as 100% or 94%, it causes a problem in FF in calcualting the iframe height. Make sure the height is clear.

		ifw.getIframe().onload = this._onloadIframe.bind(this, ifw);

		// import the object styles
		var head = idoc.getElementsByTagName("head")[0];
		if (!head) {
			head = idoc.createElement("head");
			idoc.body.parentNode.insertBefore(head, idoc.body);
		}
	
		if (!ZmMailMsgView._CSS) {
			// Make a synchronous request for the CSS. Should we do this earlier?
			var cssUrl = appContextPath + "/css/msgview.css?v=" + cacheKillerVersion;
			var result = AjxRpc.invoke(null, cssUrl, null, null, true);
			ZmMailMsgView._CSS = result && result.text;
		}
		var style = document.createElement('style');
		var rules = document.createTextNode(ZmMailMsgView._CSS);
		style.type = 'text/css';
		if (style.styleSheet) {
			style.styleSheet.cssText = rules.nodeValue;
		}
		else {
			style.appendChild(rules);
		}
		head.appendChild(style);
	
		ifw.getIframe().style.visibility = "";
	}
	else {
		var div = this._containerEl = document.createElement("div");
		div.id = this._msgBodyDivId;
		div.className = "MsgBody MsgBody-" + (params.isTextMsg ? "text" : "html");
		var parent = this.getHtmlElement();
		if (!parent) {
			AjxDebug.println(AjxDebug.MSG_DISPLAY, "Message display: DIV was not ready");
			appCtxt.setStatusMsg(ZmMsg.messageDisplayProblem);
			return;
		}
		if (params.index != null) {
			parent.insertBefore(div, parent.childNodes[params.index])
		}
		else {
			parent.appendChild(div);
		}
		div.innerHTML = this._cleanedHtml || html;
	}

	if (!params.isTextMsg) {
		this._htmlBody = this.getContentContainer().innerHTML;

		// TODO: only call this if top-level is multipart/related?
		// setup the click handler for the images
		var didAllImages = this._fixMultipartRelatedImages(this._msg, idoc || this._containerEl);
		if (didAllImages) {
			Dwt.setVisible(displayImages, false);
			this._needToShowInfoBar = false;
		} else {
			this._setupInfoBarClicks(displayImages);
		}
	}

	if (msgTruncated) {
		Dwt.setHandler(msgTruncated, DwtEvent.ONCLICK, this._handleMsgTruncated.bind(this));
	}

	this._resetIframeHeightOnTimer();
	if (callback) {
		callback.run();
	}
};
ZmMailMsgView.prototype._makeIframeProxy = ZmMailMsgView.prototype._displayContent;

ZmMailMsgView.prototype._showInfoBar =
function(parentEl, html, isTextMsg) {

	parentEl = (typeof(parentEl) == "string") ? document.getElementById(parentEl) : parentEl;
	if (!parentEl) { return; }
	
	// prevent appending the "Display Images" info bar more than once
	var displayImages;
	var dispImagesDiv = document.getElementById(this._displayImagesId);
	if (!dispImagesDiv) {
		if (parentEl) {
			var subs = {
				id:			this._displayImagesId,
				text:		ZmMsg.externalImages,
				link:		ZmMsg.displayExternalImages,
				alwaysText:	ZmMsg.alwaysDisplayExternalImages,
				domain:		this._msg.sentByDomain,
				email:		this._msg.sentByAddr,
				or:			ZmMsg.or
			};
			var extImagesHtml = AjxTemplate.expand("mail.Message#ExtImageInformationBar", subs);
			displayImages = Dwt.parseHtmlFragment(extImagesHtml);
			parentEl.appendChild(displayImages);
		}
	}
	return displayImages;
};

ZmMailMsgView.prototype._setupInfoBarClicks =
function(displayImages) {

	var parent = this._usingIframe ? this.getDocument() : this._containerEl;
	var func = this._createDisplayImageClickClosure(this._msg, parent, this._displayImagesId);
	if (displayImages) {
		Dwt.setHandler(displayImages, DwtEvent.ONCLICK, func);
	}
	else if (appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) ||
			 (this._msg && this._msg.showImages))
	{
		func.call();
	}
};

ZmMailMsgView.prototype._getBodyClass =
function() {
	return "MsgBody";
};

ZmMailMsgView.prototype._addTrustedAddrCallback =
function(addr) {
    this.getTrustedSendersList().add(addr, null, true);
    appCtxt.set(ZmSetting.TRUSTED_ADDR_LIST, this.getTrustedSendersList().getArray());
    var prefApp = appCtxt.getApp(ZmApp.PREFERENCES);
    var func = prefApp && prefApp["refresh"];
    if (func && (typeof(func) == "function")) {
        func.apply(prefApp, [null, addr]);
    }
};

ZmMailMsgView.prototype._addTrustedAddrErrorCallback =
function(addr) {
    this.getTrustedSendersList().remove(addr);
};

ZmMailMsgView.prototype._isTrustedSender =
function(msg) {
    var trustedList = this.getTrustedSendersList();
    if (trustedList.contains(msg.sentByAddr) || trustedList.contains(msg.sentByDomain)){
        return true;
    }
    return false;
};

ZmMailMsgView.prototype.getTrustedSendersList =
function() {
    return this._controller.getApp().getTrustedSendersList();
};

ZmMailMsgView.showMore =
function(elementId, type) {
	var showMore = document.getElementById(this._getShowMoreId(elementId, type));
	var more = document.getElementById(this._getMoreId(elementId, type));
	Dwt.setVisible(showMore, false);
	more.style.display = "inline";
};


ZmMailMsgView._getShowMoreId =
function(elementId, type) {
	return elementId + 'showmore_' + type;
};

ZmMailMsgView._getMoreId =
function(elementId, type) {
	return elementId + 'more_addrs_' + type;
};


/**
 *
 * formats the array of addresses as HTML with possible "show more" expand link if more than a certain number of addresses are in the field.
 *
 * @param addrs array of addresses
 * @param options
 * @param type some type identifier (one per page)
 * @param om {ZmObjectManager}
 * @param htmlElId - unique view id so it works with multiple views open.
 *
 * returns object with the html and ShowMore link id
 */
ZmMailMsgView.getAddressesFieldHtmlHelper =
function(addrs, options, type, om, htmlElId) {
	var addressInfo = {};
	var idx = 0;
	var parts = [];
	var showMoreLink = false;
	for (var i = 0; i < addrs.length; i++) {
		if (i > 0) {
			// no need for semicolon if we're showing addr bubbles
			parts[idx++] = options.addrBubbles ? " " : AjxStringUtil.htmlEncode(AjxEmailAddress.SEPARATOR);
		}

		if (i == ZmMailMsgView.MAX_ADDRESSES_IN_FIELD) {
			showMoreLink = true;
			var showMoreId = ZmMailMsgView._getShowMoreId(htmlElId, type);
			addressInfo.showMoreLinkId = showMoreId + "_link";
			var moreId = ZmMailMsgView._getMoreId(htmlElId, type);
			parts[idx++] = "<span id='" + showMoreId + "' style='white-space:nowrap'>&nbsp;";
			parts[idx++] = "<a id='" + addressInfo.showMoreLinkId + "' href='' onclick='ZmMailMsgView.showMore(\"" + htmlElId + "\", \"" + type + "\"); return false;'>";
			parts[idx++] = ZmMsg.showMore;
			parts[idx++] = "</a></span><span style='display:none;' id='" + moreId + "'>";
		}
		var email = addrs[i];
		if (email.address) {
			parts[idx++] = om
				? (om.findObjects(email, true, ZmObjectManager.EMAIL, false, options))
				: AjxStringUtil.htmlEncode(email.address);
		}
		else {
			parts[idx++] = AjxStringUtil.htmlEncode(email.name);
		}
	}
	if (showMoreLink) {
		parts[idx++] = "</span>";
	}
	addressInfo.html =  parts.join("");
	return addressInfo;
};


/**
 *
 * formats the array of addresses as HTML with possible "show more" expand link if more than a certain number of addresses are in the field.
 *
 * @param addrs array of addresses
 * @param options
 * @param type some type identifier (one per page)
 *
 * returns object with the html and ShowMore link id
 */
ZmMailMsgView.prototype.getAddressesFieldInfo =
function(addrs, options, type) {
	return ZmMailMsgView.getAddressesFieldHtmlHelper(addrs, options, type, this._objectManager, this._htmlElId);
};

ZmMailMsgView.prototype._renderMessage =
function(msg, container, callback) {
	
	this._renderMessageHeader(msg, container);
	this._renderMessageBody(msg, container, callback);
	this._renderMessageFooter(msg, container);
	Dwt.setLoadedTime("ZmMailItem");
};

ZmMailMsgView.prototype._renderMessageHeader =
function(msg, container) {
	
	this._renderInviteToolbar(msg, container);
	
	var ai = this._getAddrInfo(msg, true);
	
	var subject = msg.subject || ZmMsg.noSubject;
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	// bug fix #31512 - if no sent date then display received date
	var dateString = msg.sentDate ? dateFormatter.format(new Date(msg.sentDate)) : dateFormatter.format(new Date(msg.date));

	var additionalHdrs = [];
	var invite = msg.invite;
	var autoSendTime = AjxUtil.isDate(msg.autoSendTime) ? AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM).format(msg.autoSendTime) : null;

	if (msg.attrs) {
		for (var hdrName in ZmMailMsgView.displayAdditionalHdrsInMsgView) {
			if (msg.attrs[hdrName]) {
				additionalHdrs.push({hdrName:ZmMailMsgView.displayAdditionalHdrsInMsgView[hdrName], hdrVal: msg.attrs[hdrName]});
			}
		}
	}

	var options = {};
	options.addrBubbles = appCtxt.get(ZmSetting.USE_ADDR_BUBBLES);
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);
	
	if (this._objectManager) {
		this._lazyCreateObjectManager();
		// zimlets notified above in _getAddrInfo(), be careful not to do it again
//		appCtxt.notifyZimlets("onFindMsgObjects", [msg, this._objectManager, this]);

		this._objectManager.setHandlerAttr(ZmObjectManager.DATE,
											ZmObjectManager.ATTR_CURRENT_DATE,
											this._dateObjectHandlerDate);

		subject 	= this._objectManager.findObjects(subject, true);
		dateString	= this._objectManager.findObjects(dateString, true, ZmObjectManager.DATE);
	}

	var attachmentsCount = msg.getAttachmentCount(true);

	// do we add a close button in the header section?

	var folder = appCtxt.getById(msg.folderId);
	var isSyncFailureMsg = (folder && folder.nId == ZmOrganizer.ID_SYNC_FAILURES);
    if (!msg.showImages) {
        msg.showImages = folder && folder.isFeed();
    }

	this._hdrTableId		= ZmId.getViewId(this._viewId, ZmId.MV_HDR_TABLE, this._mode);
	var reportBtnCellId		= ZmId.getViewId(this._viewId, ZmId.MV_REPORT_BTN_CELL, this._mode);
	this._expandRowId		= ZmId.getViewId(this._viewId, ZmId.MV_EXPAND_ROW, this._mode);
	var expandHeaderId		= ZmId.getViewId(this._viewId, ZmId.MV_EXPAND_HDR, this._mode);

	var subs = {
		id: 				this._htmlElId,
		hdrTableId: 		this._hdrTableId,
		hdrTableTopRowId:	ZmId.getViewId(this._viewId, ZmId.MV_HDR_TABLE_TOP_ROW, this._mode),
		expandRowId:		this._expandRowId,
		expandHeaderId:		expandHeaderId,
		attachId:			this._attLinksId,
		infoBarId:			this._infoBarId,
		subject:			subject,
		dateString:			dateString,
		hasAttachments:		(attachmentsCount != 0),
		attachmentsCount:	attachmentsCount,
		bwo:                ai.bwo,
		bwoAddr:            ai.bwoAddr
	};

	if (msg.isHighPriority || msg.isLowPriority) {
		subs.priority =			msg.isHighPriority ? "high" : "low";
		subs.priorityImg =		msg.isHighPriority ? "ImgPriorityHigh_list" : "ImgPriorityLow_list";
		subs.priorityDivId =	ZmId.getViewId(this._view, ZmId.MV_PRIORITY);
	}

	if (invite && !invite.isEmpty() && this._inviteMsgView) {
		this._getInviteSubs(subs, ai.sentBy, ai.sentByAddr, ai.sender ? ai.fromAddr : null);
	}
	else {
		subs.sentBy = ai.sentBy;
		subs.sentByNormal = ai.sentByAddr;
		subs.sentByIcon = ai.sentByIcon;
		subs.sentByAddr = ai.sentByAddr;
		subs.obo = ai.obo;
		subs.oboAddr = ai.oboAddr;
		subs.participants = ai.participants;
		subs.reportBtnCellId = reportBtnCellId;
		subs.isSyncFailureMsg = isSyncFailureMsg;
		subs.autoSendTime = autoSendTime;
		subs.additionalHdrs = additionalHdrs;
		subs.isOutDated = invite && invite.isEmpty()
	}

	var template = (invite && !invite.isEmpty() && this._inviteMsgView)
		? "mail.Message#InviteHeader" : "mail.Message#MessageHeader";
	var html = AjxTemplate.expand(template, subs);

	var el = container || this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(html));
	this._headerElement = Dwt.byId(this._htmlElId + "_headerElement");

	/**************************************************************************/
	/* Add to DOM based on Id's used to generate HTML via templates           */
	/**************************************************************************/

	// add the expand/collapse arrow button now that we have add to the DOM tree
	var expandHeaderEl = document.getElementById(expandHeaderId);
	if (expandHeaderEl) {
		// Added for bug 26579. Creating this control at object level was not working in IE
		var id = ZmId.getButtonId(this._mode, ZmId.OP_EXPAND, ZmId.MSG_VIEW);
		if (this._expandButton) {
			this._expandButton.dispose();
		}
		this._expandButton = new DwtToolBarButton({parent:this, id:id, parentElement:expandHeaderId});
		this._expandButton.addSelectionListener(this._expandButtonListener.bind(this));
		this._expandButton.setImage(this._expandHeader ? "HeaderExpanded" : "HeaderCollapsed");
		this._expandButton.setVisible(Dwt.DISPLAY_BLOCK);
	}

	// add the report button if applicable
	var reportBtnCell = document.getElementById(reportBtnCellId);
	if (reportBtnCell) {
		var id = ZmId.getButtonId(this._mode, ZmId.REPORT, ZmId.MSG_VIEW);
		var reportBtn = new DwtButton({parent:this, id:id, parentElement:reportBtnCell});
		reportBtn.setText(ZmMsg.reportSyncFailure);
		reportBtn.addSelectionListener(this._reportButtonListener.bind(this, msg));
	}
};

ZmMailMsgView.prototype._getAddrInfo =
function(msg, notifyZimlets) {
	
	var acctId = appCtxt.getActiveAccount().id;
	var cl;
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && appCtxt.getApp(ZmApp.CONTACTS).contactsLoaded[acctId]) {
		cl = AjxDispatcher.run("GetContacts");
	}
	var fromAddr = msg.getAddress(AjxEmailAddress.FROM) || ZmMsg.unknown;
	var sender = msg.getAddress(AjxEmailAddress.SENDER); // bug fix #10652 - Sender: header means on-behalf-of
	var sentBy = (sender && sender.address) ? sender : fromAddr;
	var from = AjxStringUtil.htmlEncode(sentBy.toString(true));
	var sentByAddr = (sentBy && sentBy != ZmMsg.unknown) ? sentBy.getAddress() : null;
    if (sentByAddr) {
        msg.sentByAddr = sentByAddr;
        msg.sentByDomain = sentByAddr.substr(sentByAddr.indexOf("@") + 1);
        msg.showImages = this._isTrustedSender(msg);
    }
	var sentByIcon = cl	&& (cl.getContactByEmail((sentBy && sentBy.address) ? sentBy.address : sentByAddr) ? "Contact" : "NewContact");
	var obo = sender ? fromAddr : null;
	var oboAddr = (obo && obo != ZmMsg.unknown) ? obo.getAddress() : null;

	var bwo = msg.getAddress(AjxEmailAddress.RESENT_FROM);
	var bwoAddr = bwo ? bwo.getAddress() : null;
	
	// find addresses we may need to search for contacts for, so that we can
	// aggregate them into a single search
	var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
	if (contactsApp) {
		var lookupAddrs = [];
		if (sentBy) { lookupAddrs.push(sentBy); }
		if (obo) { lookupAddrs.push(obo); }
		for (var i = 1; i < ZmMailMsg.ADDRS.length; i++) {
			var type = ZmMailMsg.ADDRS[i];
			if ((type == AjxEmailAddress.SENDER) || (type == AjxEmailAddress.RESENT_FROM)) { continue; }
			var addrs = msg.getAddresses(type).getArray();
			for (var j = 0; j < addrs.length; j++) {
				if (addrs[j]) {
					lookupAddrs.push(addrs[j].address);
				}
			}
		}
		if (lookupAddrs.length > 1) {
			contactsApp.setAddrLookupGroup(lookupAddrs);
		}
	}

	var options = {};
	options.addrBubbles = appCtxt.get(ZmSetting.USE_ADDR_BUBBLES);
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);
	
	if (this._objectManager) {
		this._lazyCreateObjectManager();

		if (notifyZimlets) {
			appCtxt.notifyZimlets("onFindMsgObjects", [msg, this._objectManager, this]);
		}

		sentBy		= this._objectManager.findObjects(sentBy, true, ZmObjectManager.EMAIL, false, options);
		if (obo) {
		    obo		= this._objectManager.findObjects(fromAddr, true, ZmObjectManager.EMAIL, false, options);
		}
		if (bwo) {
		    bwo		= this._objectManager.findObjects(bwo, true, ZmObjectManager.EMAIL, false, options);
		}
	} else {
		sentBy = AjxStringUtil.htmlEncode(sentBy.toString());
		if (obo) {
		    obo = AjxStringUtil.htmlEncode(obo.toString());
		}
		if (bwo) {
		    bwo = AjxStringUtil.htmlEncode(bwo.toString());
		}
	}

	var showMoreIds = {};
	var participants = [];
	for (var i = 1; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		if ((type == AjxEmailAddress.SENDER) || (type == AjxEmailAddress.RESENT_FROM)) { continue; }

		var addrs = msg.getAddresses(type).getArray();
		if (addrs.length > 0) {
			var prefix = AjxStringUtil.htmlEncode(ZmMsg[AjxEmailAddress.TYPE_STRING[type]]);
			var addressInfo = this.getAddressesFieldInfo(addrs, options, type);
			participants.push({ prefix: prefix, partStr: addressInfo.html });
			if (addressInfo.showMoreLinkId) {
			    showMoreIds[addressInfo.showMoreLinkId] = true;
			}
		}
	}
	
	return {
		fromAddr:		fromAddr,
		from:			from,
		sender:			sender,
		sentBy:			sentBy,
		sentByAddr:		sentByAddr,
		sentByIcon:		sentByIcon,
		obo:			obo,
		oboAddr:		oboAddr,
		bwo:			bwo,
		bwoAddr:		bwoAddr,
		participants:	participants,
        showMoreIds:    showMoreIds
	};
};

ZmMailMsgView.prototype._getInviteSubs =
function(subs, sentBy, sentByAddr, sender, addr) {
	this._inviteMsgView.addSubs(subs, sentBy, sentByAddr, sender ? addr : null);
};

ZmMailMsgView.prototype._renderInviteToolbar =
function(msg, container) {

	this._dateObjectHandlerDate = new Date(msg.sentDate || msg.date);

	var invite = msg.invite;
	var ac = window.parentAppCtxt || window.appCtxt;

	if ((ac.get(ZmSetting.CALENDAR_ENABLED) || ac.multiAccounts) && 
		(invite && !invite.isEmpty() && invite.type != "task"))
	{
		if (!this._inviteMsgView) {
			this._inviteMsgView = new ZmInviteMsgView({parent:this, mode:this._mode});
		}
		this._inviteMsgView.set(msg);
	}
	else if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
			 msg.share && msg.folderId != ZmFolder.ID_TRASH &&
			 appCtxt.getActiveAccount().id != msg.share.grantor.id)
	{
		AjxDispatcher.require("Share");
		var action = msg.share.action;
		var isNew = action == ZmShare.NEW;
		var isEdit = action == ZmShare.EDIT;
		var isDataSource = (appCtxt.getById(msg.folderId).isDataSource(null, true) && (msg.folderId != ZmFolder.ID_INBOX));

		if (!isDataSource &&
			(isNew || (isEdit && !this.__hasMountpoint(msg.share))) &&
			msg.share.link.perm)
		{
			var topToolbar = this._getShareToolbar();
			topToolbar.reparentHtmlElement(container);
			topToolbar.setVisible(Dwt.DISPLAY_BLOCK);
			this._hasShareToolbar = true;
		}
	}
	else if (msg.subscribeReq && msg.folderId != ZmFolder.ID_TRASH) {
		var topToolbar = this._getSubscribeToolbar(msg.subscribeReq);
		topToolbar.reparentHtmlElement(container);
		topToolbar.setVisible(Dwt.DISPLAY_BLOCK);
		this._hasSubToolbar = true;
	}
};

/**
 * Renders the message body. There is a chance a server call will be made to fetch an alternative part.
 * 
 * @param {ZmMailMsg}	msg
 * @param {Element}		container
 * @param {callback}	callback
 */
ZmMailMsgView.prototype._renderMessageBody =
function(msg, container, callback, index) {

	var htmlMode = appCtxt.get(ZmSetting.VIEW_AS_HTML);
	var contentType = htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
	msg.getBodyPart(contentType, this._renderMessageBody1.bind(this, msg, container, callback, index));
};

ZmMailMsgView.prototype._renderMessageBody1 =
function(msg, container, callback, index) {

	var el = container || this.getHtmlElement();
	var htmlMode = appCtxt.get(ZmSetting.VIEW_AS_HTML);
	var contentType = htmlMode ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	// if multiple body parts, ignore prefs and just append everything
	var origText;
	if (msg.hasMultipleBodyParts()) {
		var bodyParts = msg.getBodyParts(contentType);
		var len = bodyParts.length;
		var html = [];
		var hasHtmlPart = (htmlMode && msg.hasContentType(ZmMimeTable.TEXT_HTML)) || msg.hasInlineImage();
		for (var i = 0; i < len; i++) {
			var bp = bodyParts[i];
			var content = this._getBodyContent(bp);
			if (ZmMimeTable.isRenderableImage(bp.contentType)) {
				if (bp.contentDisposition == "inline") {
					//ignore inline attachments here. No need to append it as it was already inline.
					continue;
				}
				// Hack: (Bug:27320) Done specifically for sMime
				var imgHtml = content
					? ["<img zmforced='1' class='InlineImage' src='", bp.getContent(), "'>"].join("")
					: ["<img zmforced='1' class='InlineImage' src='", appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI), "&id=", msg.id, "&part=", bp.part, "'>"].join("");
				html.push(imgHtml);
			} else {
				if (bp.contentType == ZmMimeTable.TEXT_CAL) {
				    content = ZmMailMsg.getTextFromCalendarPart(bp);
				} else if (bp.contentType != ZmMimeTable.TEXT_HTML) {
				    content = AjxStringUtil.convertToHtml(content);
				}
				if (bp.contentType == ZmMimeTable.TEXT_PLAIN) {
					html.push(hasHtmlPart ? "<pre>" : "");
					html.push(content);
					html.push(hasHtmlPart ? "</pre>" : "");
					origText = bp.getContent();
				} else {
					if (appCtxt.get(ZmSetting.VIEW_AS_HTML)) {
						html.push(content);
					} else {
						// bug fix #31840 - convert HTML to text
						var div = document.createElement("div");
						div.innerHTML = content;
						var convert = AjxStringUtil.convertHtml2Text(div);

						html.push(hasHtmlPart ? "<pre>" : "");
						html.push(AjxStringUtil.htmlEncode(convert));
						html.push(hasHtmlPart ? "</pre>" : "");
					}
				}
			}
		}
		this._displayContent({	container:		el,
								html:			html.join(""),
								isTextMsg:		!hasHtmlPart,
								isTruncated:	false,
								index:			index,
								origText:		origText
							});
	} else {
		var bodyPart = msg.getBodyPart(contentType) || msg.getBodyPart();
		if (bodyPart) {
			var content = this._getBodyContent(bodyPart);
			var invite = msg.invite;

			if (bodyPart.contentType == ZmMimeTable.TEXT_HTML && htmlMode) {
				if (invite && !invite.isEmpty()) {
					content = ZmInviteMsgView.truncateBodyContent(content, true);
					// if the notes are empty, don't bother rendering them
					var tmp = AjxStringUtil.stripTags(content);
					if (!AjxStringUtil._NON_WHITESPACE.test(tmp)) {
					    // Run the remainder of the formatting to insure the invite
					    // display is set up properly
					    this._completeMessageBody(callback);
					    return;
					}
				}

				// fix broken inline images - take one like this: <img dfsrc="http:...part=1.2.2">
				// and make it look like this: <img dfsrc="cid:DWT123"> by looking up the cid for that part
				if (msg._attachments && ZmMailMsgView.IMG_FIX_RE.test(content)) {
					var partToCid = {};
					for (var i = 0; i < msg._attachments.length; i++) {
						var att = msg._attachments[i];
						if (att.contentId) {
							partToCid[att.part] = att.contentId.substring(1, att.contentId.length - 1);
						}
					}
					content = content.replace(ZmMailMsgView.IMG_FIX_RE, function(s, p1, p2, p3) {
						return partToCid[p2] ? [p1, '"cid:', partToCid[p2], '"', p3].join("") : s;
					});
				}

				if (!content) {
					content = AjxTemplate.expand("mail.Message#EmptyMessage", {isHtml: true});
				}

				this._displayContent({	container:		el,
										html:			content,
										isTextMsg:		false,
										isTruncated:	bodyPart.isTruncated,
										index:			index
									});
			} else if (ZmMimeTable.isRenderableImage(bodyPart.contentType)) {
				var html = [
					"<img zmforced='1' class='InlineImage' src='",
					appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI),
					"&id=", msg.id,
					"&part=", bodyPart.part, "'>"
				].join("");
				this._displayContent({	container:		el,
										html:			html,
										isTextMsg:		false,
										isTruncated:	false,
										index:			index
									});
			} else {
				
				if (bodyPart.contentType == ZmMimeTable.TEXT_PLAIN) {
					if (invite && !invite.isEmpty()) {
						content = ZmInviteMsgView.truncateBodyContent(content);
					}

					var isTextMsg = true;
					if (!content) {
						content = AjxTemplate.expand("mail.Message#EmptyMessage", {isHtml: false});
						isTextMsg = false; //To make sure we display html content properly
					}
					content = isTextMsg ? AjxStringUtil.convertToHtml(content) : content;
					this._displayContent({	container:		el,
											html:			content,
											isTextMsg:		isTextMsg,
											isTruncated:	bodyPart.isTruncated,
											index:			index,
											origText:		bodyPart.getContent()
										});
				} else {					
					if (content != null) {
						content = (bodyPart.contentType != ZmMimeTable.TEXT_HTML) ? AjxStringUtil.convertToHtml(content) : content;
						this._displayContent({	container:		el,
												html:			content,
												isTextMsg:		true,
												isTruncated:	false,
												index:			index
											});
					}
				}
			}
		}
	}

	this._completeMessageBody(callback);
};

ZmMailMsgView.prototype._completeMessageBody =
function(callback) {
	// Used in ZmConvView2._toggleExpansion : if False, create the message body (the
	// first time a message is expanded).
	this._msgBodyCreated = true;
	this._setAttachmentLinks();
	this._setRows();
	this._expandRows(this._expandHeader);

	if (callback) { callback.run(); }
}

ZmMailMsgView.prototype._getBodyContent =
function(bodyPart) {
	return bodyPart.getContent();
};

ZmMailMsgView.prototype._renderMessageFooter = function(msg, container) {};

ZmMailMsgView.prototype._setTags =
function(msg) {
	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED) || msg == null || !this._tagList) { return; }

	var numTags = msg.tags.length;
	var table = document.getElementById(this._hdrTableId);
	var tagRow = document.getElementById(this._tagRowId);
	var tagCell = null;

	if (tagRow != null && table.rows[table.rows.length-1] == tagRow) {
		if (numTags == 0) {
			table.deleteRow(-1);
			return;
		}
		tagCell = tagRow.cells[1];
	}
	else {
		if (numTags == 0) {
			return;
		}
		tagRow = table.insertRow(-1);
		tagRow.id = this._tagRowId;
		var tagLabelCell = tagRow.insertCell(-1);
		tagLabelCell.className = "LabelColName";
		tagLabelCell.innerHTML = ZmMsg.tags + ":";
		tagLabelCell.style.verticalAlign = "middle";
		tagCell = tagRow.insertCell(-1);
	}
	
	this._renderTags(msg, tagCell);
};

ZmMailMsgView.prototype._renderTags =
function(msg, container, tagCellId) {

	if (!container) { return; }
	var tags = msg && msg.getSortedTags();
	if (!(tags && tags.length)) {
		container.innerHTML = "";
		return;
	}

	var html = [], i = 0;
	html[i++] = "<table cellspacing=0 cellpadding=0 border=0 width=100%><tr>";
	html[i++] = "<td style='overflow:hidden; id='";
	html[i++] = tagCellId;
	html[i++] = "'>";

	for (var j = 0; j < tags.length; j++) {
		var tag = tags[j];
		if (!tag) { continue; }
		i = this._getTagHtml(tag, tagCellId, html, i);
	}
	html[i++] = "</td></tr></table>";
	container.innerHTML = html.join("");
};

ZmMailMsgView.prototype._getTagHtml =
function(tag, baseId, html, i) {

	var anchorId = [baseId, ZmMailMsgView._TAG_ANCHOR, tag.id].join("");
	var imageId = [baseId, ZmMailMsgView._TAG_IMG, tag.id].join("");

	var tagClick = ['ZmMailMsgView._tagClick("', this._htmlElId, '","', tag.id, '");'].join("");
	var removeClick = ['ZmMailMsgView._removeTagClick("', this._htmlElId, '","', tag.id, '");'].join("");

	html[i++] = "<span class='addrBubble TagBubble'";
	html[i++] = " id='";
	html[i++] = anchorId;
	html[i++] = "'>";

	html[i++] = "<span class='TagImage' onclick='";
	html[i++] = tagClick;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(tag.getIconWithColor(), null, ["id='", imageId, "'"].join(""));
	html[i++] = "</span>";

	html[i++] = "<span class='TagName' onclick='";
	html[i++] = tagClick;
	html[i++] = "'>";
	html[i++] = AjxStringUtil.htmlEncodeSpace(tag.name);
	html[i++] = "&nbsp;</span>";

	html[i++] = "<span class='ImgBubbleDelete' onclick='";
	html[i++] = removeClick;
	html[i++] = "'>";
	html[i++] = "</span>";
	html[i++] = "</span>";
	
	return i;
};

// Types of links for eacha attachment
ZmMailMsgView.ATT_LINK_MAIN			= "main";
ZmMailMsgView.ATT_LINK_CALENDAR		= "calendar";
ZmMailMsgView.ATT_LINK_DOWNLOAD		= "download";
ZmMailMsgView.ATT_LINK_BRIEFCASE	= "briefcase";
ZmMailMsgView.ATT_LINK_VCARD		= "vcard";
ZmMailMsgView.ATT_LINK_HTML			= "html";
ZmMailMsgView.ATT_LINK_REMOVE		= "remove";

ZmMailMsgView.prototype._setAttachmentLinks =
function() {
    this._attachmentLinkIdToFileNameMap = null;
	var attInfo = this._msg.getAttachmentInfo(true, !appCtxt.get(ZmSetting.VIEW_AS_HTML), true);
	var el = document.getElementById(this._attLinksId + "_container");
	if (el) {
		el.style.display = (attInfo.length == 0) ? "none" : "";
	}
	if (attInfo.length == 0) { return; }

	// prevent appending attachment links more than once
	var attLinksTable = document.getElementById(this._attLinksId + "_table");
	if (attLinksTable) { return; }

	var htmlArr = [];
	var idx = 0;
	var imageAttsFound = 0;

	var attColumns = (this._controller.isReadingPaneOn() && this._controller.isReadingPaneOnRight()) ? 1 : ZmMailMsgView.ATTC_COLUMNS;
	var dividx = idx;	// we might get back here
	htmlArr[idx++] = "<table id='" + this._attLinksId + "_table' border=0 cellpadding=0 cellspacing=0>";

	var rows = 0;
	for (var i = 0; i < attInfo.length; i++) {
		var att = attInfo[i];
		
		if ((i % attColumns) == 0) {
			if (i != 0) {
				htmlArr[idx++] = "</tr>";
			}
			htmlArr[idx++] = "<tr>";
			++rows;
		}

		htmlArr[idx++] = "<td>";
		htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='margin-right:1em; margin-bottom:1px'><tr>";
		htmlArr[idx++] = "<td style='width:18px'>";
		htmlArr[idx++] = AjxImg.getImageHtml(att.linkIcon, "position:relative;");
		htmlArr[idx++] = "</td><td style='white-space:nowrap'>";

		if (appCtxt.get(ZmSetting.ATTACHMENTS_BLOCKED)) {
			// if attachments are blocked, just show the label
			htmlArr[idx++] = att.label;
		} else {
			// main link for the att name
			var linkArr = [];
			var j = 0;
            var displayFileName = AjxStringUtil.clipFile(att.label, 30);
			// if name got clipped, set up to show full name in tooltip
            if (displayFileName != att.label) {
                if (!this._attachmentLinkIdToFileNameMap) {
					this._attachmentLinkIdToFileNameMap = {};
				}
                this._attachmentLinkIdToFileNameMap[att.attachmentLinkId] = att.label;
            }
			var params = {
				att:	att,
				id:		this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_MAIN),
				text:	AjxStringUtil.htmlEncode(displayFileName)
			}; 
			var link = ZmMailMsgView.getMainAttachmentLinkHtml(params);
			link = att.isHit ? "<span class='AttName-matched'>" + link + "</span>" : link;
			// objectify if this attachment is an image
			if (att.objectify && this._objectManager) {
				this._lazyCreateObjectManager();
				var imgHandler = this._objectManager.getImageAttachmentHandler();
				idx = this._objectManager.generateSpan(imgHandler, htmlArr, idx, link, {url:att.url});
			} else {
				htmlArr[idx++] = link;
			}
		}
		
		// add any discretionary links depending on the attachment and what's enabled
		var linkCount = 0;
		if (att.size || att.links.html || att.links.vcard || att.links.download || att.links.briefcase || att.links.importICS) {
			// size
			htmlArr[idx++] = "&nbsp;(";
			if (att.size) {
				htmlArr[idx++] = att.size;
				htmlArr[idx++] = ") ";
			}
			// convert to HTML
			if (att.links.html && !appCtxt.get(ZmSetting.ATTACHMENTS_BLOCKED)) {
				var params = {
					id:				this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_HTML),
					blankTarget:	true,
					href:			att.url + "&view=html",
					text:			ZmMsg.preview
				};
				htmlArr[idx++] = ZmMailMsgView.getAttachmentLinkHtml(params);
				linkCount++;
			}
			// save as vCard
			else if (att.links.vcard) {
				var params = {
					id:				this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_VCARD),
					jsHref:			true,
					text:			ZmMsg.addressBook
				};
				htmlArr[idx++] = ZmMailMsgView.getAttachmentLinkHtml(params);
				linkCount++;
			}
			// save locally
			if (att.links.download && !appCtxt.get(ZmSetting.ATTACHMENTS_BLOCKED)) {
				htmlArr[idx++] = linkCount ? " | " : "";
				var params = {
					id:				this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_DOWNLOAD),
					href:			att.url + "&disp=a",
					text:			ZmMsg.download
				};
				htmlArr[idx++] = ZmMailMsgView.getAttachmentLinkHtml(params);
				linkCount++;
			}
			// add as Briefcase file
			if (att.links.briefcase && !appCtxt.get(ZmSetting.ATTACHMENTS_BLOCKED)) {
				htmlArr[idx++] = linkCount ? " | " : "";
				var params = {
					id:				this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_BRIEFCASE),
					jsHref:			true,
					text:			ZmMsg.addToBriefcase
				};
				htmlArr[idx++] = ZmMailMsgView.getAttachmentLinkHtml(params);
				linkCount++;
			}
			// add ICS as calendar event
			if (att.links.importICS) {
				htmlArr[idx++] = linkCount ? " | " : "";
				var params = {
					id:				this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_CALENDAR),
					jsHref:			true,
					text:			ZmMsg.addToCalendar
				};
				htmlArr[idx++] = ZmMailMsgView.getAttachmentLinkHtml(params);
				linkCount++;
			}
			// remove attachment from msg
			if (att.links.remove) {
				htmlArr[idx++] = linkCount ? " | " : "";
				var params = {
					id:				this._getAttachmentLinkId(att.part, ZmMailMsgView.ATT_LINK_REMOVE),
					jsHref:			true,
					text:			ZmMsg.remove
				};
				htmlArr[idx++] = ZmMailMsgView.getAttachmentLinkHtml(params);
				linkCount++;
			}

			// Attachment Link Handlers (optional)
			if (ZmMailMsgView._attachmentHandlers) {
				var contentHandlers = ZmMailMsgView._attachmentHandlers[att.ct];
				var handlerFunc;
				if (contentHandlers) {
					for (var handlerId in contentHandlers) {
						handlerFunc = contentHandlers[handlerId];
						if (handlerFunc) {
							htmlArr[idx++] = " | " + handlerFunc.call(this, att);
						}
					}
				}
			}
		}

		htmlArr[idx++] = "</td></tr></table>";
		htmlArr[idx++] = "</td>";

		if (att.ct.indexOf("image") != -1) {
			++imageAttsFound;
		}
	}

	// limit display size.  seems like an attc. row has exactly 16px; we set it
	// to 56px so that it becomes obvious that there are more attachments.
	if (this._limitAttachments != 0 && rows > ZmMailMsgView._limitAttachments) {
		htmlArr[dividx] = "<div style='height:";
		htmlArr[dividx] = this._attcMaxSize;
		htmlArr[dividx] = "px; overflow:auto;' />";
	}
	htmlArr[idx++] = "</tr></table>";

	var allAttParams;
	if (attInfo.length > 1) {
		allAttParams = this._addAllAttachmentsLinks(attInfo, (imageAttsFound > 1), this._msg.subject);
		htmlArr[idx++] = allAttParams.html;
	}

	// Push all that HTML to the DOM
	var attLinksDiv = document.getElementById(this._attLinksId);
	attLinksDiv.innerHTML = htmlArr.join("");

	// add handlers for individual attachment links
	for (var i = 0; i < attInfo.length; i++) {
		var att = attInfo[i];
		if (att.ct == ZmMimeTable.MSG_RFC822) {
			this._addClickHandler(att.part, ZmMailMsgView.ATT_LINK_MAIN, ZmMailMsgView.rfc822Callback, null, this._msg.id, att.part);
		}
		if (att.links.importICS) {
			this._addClickHandler(att.part, ZmMailMsgView.ATT_LINK_CALENDAR, ZmMailMsgView.addToCalendarCallback, null, this._msg.id, att.part);
		}
		if (att.links.briefcase) {
			this._addClickHandler(att.part, ZmMailMsgView.ATT_LINK_BRIEFCASE, ZmMailMsgView.briefcaseCallback, null, this._msg.id, att.part, att.label.replace(/\x27/g, "&apos;"));
		}
		if (att.links.download) {
			this._addClickHandler(att.part, ZmMailMsgView.ATT_LINK_DOWNLOAD, ZmMailMsgView.downloadCallback, null, att.url + "&disp=a");
		}
		if (att.links.vcard) {
			this._addClickHandler(att.part, ZmMailMsgView.ATT_LINK_VCARD, ZmMailMsgView.vcardCallback, null, this._msg.id, att.part);
		}
		if (att.links.remove) {
			this._addClickHandler(att.part, ZmMailMsgView.ATT_LINK_REMOVE, this.removeAttachmentCallback, this, att.part);
		}
	}
	
	// add handlers for "all attachments" links
	if (allAttParams) {
		var downloadAllLink = document.getElementById(allAttParams.downloadAllLinkId);
		if (downloadAllLink) {
			downloadAllLink.onclick = allAttParams.downloadAllCallback;
		}
		var removeAllLink = document.getElementById(allAttParams.removeAllLinkId);
		if (removeAllLink) {
			removeAllLink.onclick = allAttParams.removeAllCallback;
		}
	}
};

/**
 * Returns the HTML for an attachment-related link (an <a> tag). The link will have an HREF
 * or an ID (so an onclick handler can be added after the element has been created).
 * 
 * @param {hash}	params		a hash of params:
 * @param {string}	id			ID for the link
 * @param {string}	href		link target
 * @param {boolean}	noUnderline	if true, do not include an underline style
 * @param {boolean} blankTarget	if true, set target to _blank
 * @param {boolean}	jsHref		empty link target so browser styles it as a link
 * @param {string}	text		visible link text
 * 
 * @private
 */
ZmMailMsgView.getAttachmentLinkHtml =
function(params) {
	var html = [], i = 0;
	html[i++] = "<a class='AttLink' ";
	html[i++] = params.id ? "id='" + params.id + "' " : "";
	html[i++] = !params.noUnderline ? "style='text-decoration:underline' " : "";
	html[i++] = params.blankTarget ? "target='_blank' " : "";
	var href = params.href || (params.jsHref && "javascript:;");
	html[i++] = href ? "href='" + href + "' " : "";
	html[i++] = ">" + AjxStringUtil.htmlEncode(params.text) + "</a>";

	return html.join("");
};

/**
 * Returns the HTML for the link for the attachment name (which usually opens the
 * content in a new browser tab).
 * 
 * @param id
 */
ZmMailMsgView.getMainAttachmentLinkHtml =
function(params) {
	var params1 = {
		id:				params.id,
		noUnderline:	true,
		text:			params.text
	}; 
	// handle rfc/822 attachments differently
	if (params.att.ct == ZmMimeTable.MSG_RFC822) {
		params1.jsHref = true;
	}
	else {
		params1.blankTarget = true;
		params1.href = params.att.url;
	}
	return ZmMailMsgView.getAttachmentLinkHtml(params1);
};

ZmMailMsgView.prototype._getAttachmentLinkId =
function(part, type) {
	return [this._viewId, part, type].join("_");
};

// Adds an onclick handler to the link with the given part and type. I couldn't find an easy
// way to pass and bind a variable number of arguments, so went with three, which is the most
// any of the handlers takes.
ZmMailMsgView.prototype._addClickHandler =
function (part, type, func, obj, arg1, arg2, arg3) {
	var id = this._getAttachmentLinkId(part, type);
	var link = document.getElementById(id);
	if (link) {
		link.onclick = func.bind(obj, arg1, arg2, arg3);
	}
};

ZmMailMsgView.prototype._addAllAttachmentsLinks =
function(attachments, viewAllImages, filename) {

	var itemId = this._msg.id;
	if (AjxUtil.isString(filename)) {
		filename = filename.replace(ZmMailMsgView.FILENAME_INV_CHARS_RE, "");
	} else {
		filename = null;
	}
	filename = AjxStringUtil.urlComponentEncode(filename || ZmMsg.downloadAllDefaultFileName);
	var url = [appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI), "&id=", itemId, "&filename=", filename,"&charset=", appCtxt.getCharset(), "&part="].join("");
	var parts = [];
	for (var j = 0; j < attachments.length; j++) {
		parts.push(attachments[j].part);
	}
	var partsStr = parts.join(",");
	var params = {
		url:				(url + partsStr),
		downloadAllLinkId:	this._viewId + "_downloadAll",
		removeAllLinkId:	this._viewId + "_removeAll"
	}
	if (viewAllImages) {
		params.viewAllUrl = "/h/viewimages?id=" + itemId;
	}
	params.html = AjxTemplate.expand("mail.Message#AllAttachments", params);
	
	params.downloadAllCallback = ZmZimbraMail.unloadHackCallback.bind(null);
	params.removeAllCallback = this.removeAttachmentCallback.bind(this, partsStr);
	return params;
};

ZmMailMsgView.prototype.getToolTipContent =
function(evt) {

	var tgt = DwtUiEvent.getTarget(evt, false);

	//see if this is the priority icon. If so, it has a "priority" attribute high/low.
	if (tgt.id == ZmId.getViewId(this._view, ZmId.MV_PRIORITY)) {
		return tgt.getAttribute('priority') =='high' ? ZmMsg.highPriorityTooltip : ZmMsg.lowPriorityTooltip;
	}
	
    if (!this._attachmentLinkIdToFileNameMap) {return null};

    if (tgt && tgt.nodeName.toLowerCase() == "a") {
        var id = tgt.getAttribute("id");
        if (id) {
            var fileName = this._attachmentLinkIdToFileNameMap[id];
            if (fileName) {
                return AjxStringUtil.htmlEncode(fileName);
            }
        }
    }
    return null;
};

// AttachmentLink Handlers
ZmMailMsgView.prototype.addAttachmentLinkHandler =
function(contentType,handlerId,handlerFunc){
	if (!ZmMailMsgView._attachmentHandlers) {
		ZmMailMsgView._attachmentHandlers = {};
	}

	if (!ZmMailMsgView._attachmentHandlers[contentType]) {
		ZmMailMsgView._attachmentHandlers[contentType] = {};
	}

	ZmMailMsgView._attachmentHandlers[contentType][handlerId] = handlerFunc;
};

// Listeners

ZmMailMsgView.prototype._controlEventListener =
function(ev) {
	// note - we may get here before we have a chance to initialize the IFRAME
	this._resetIframeHeightOnTimer();
	if (this._inviteMsgView && this._inviteMsgView.isActive()) {
		this._inviteMsgView.resize();
	}
};

ZmMailMsgView.prototype._shareToolBarListener =
function(ev) {
	ev._buttonId = ev.item.getData(ZmOperation.KEY_ID);
	ev._share = this._msg.share;
	this.notifyListeners(ZmMailMsgView.SHARE_EVENT, ev);
};

ZmMailMsgView.prototype._subscribeToolBarListener =
function(req, ev) {
	ev._buttonId = ev.item.getData(ZmOperation.KEY_ID);
	ev._subscribeReq = req;
	this.notifyListeners(ZmMailMsgView.SUBSCRIBE_EVENT, ev);
};


ZmMailMsgView.prototype._msgChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_MSG) { return; }
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		if (ev.source == this._msg && (appCtxt.getCurrentViewId() == this._viewId)) {
			this._controller._app.popView();
		}
	} else if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._setTags(this._msg);
	} else if (ev.event == ZmEvent.E_MODIFY) {
		if (ev.source == this._msg) {
			this.set(ev.source, true);
		}
	}
};

ZmMailMsgView.prototype._selectStartListener =
function(ev) {
	// reset mouse event to propagate event to browser (allows text selection)
	ev._stopPropagation = false;
	ev._returnValue = true;
};

ZmMailMsgView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG) {	return; }

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MODIFY) {
		this._setTags(this._msg);
	}
};

ZmMailMsgView.prototype._setRows =
function() {
        var expandRow = document.getElementById(this._expandRowId);
	var table = expandRow && expandRow.parentNode;
        if (!table) { return; } 
	if (this._addressRows) {
		for (var i = 0; i < this._addressRows.length; i++) {
			var addressRow = this._addressRows[i];
			table.appendChild(addressRow);
		}
	}
};

ZmMailMsgView.prototype._expandButtonListener =
function(ev) {
	this._expandRows(!this._expandHeader);
};

ZmMailMsgView.prototype._expandRows =
function(expand) {
	var expandRow = document.getElementById(this._expandRowId);
	if (!expandRow) { return; } 
	this._expandHeader = expand;
	if (this._expandButton) {
		this._expandButton.setImage(expand ? "HeaderExpanded" : "HeaderCollapsed");
	}

	var table = expandRow.parentNode;

	for (var i = 1; i < table.rows.length; i++) { // row[0] is From address
		table.rows[i].style.display = expand ? "" : "none";
	}

	var attContainer = document.getElementById(this._attLinksId + "_container");
	if (attContainer) {
		var attInfo = this._msg.getAttachmentInfo(true, !appCtxt.get(ZmSetting.VIEW_AS_HTML), true);
		Dwt.setVisible(attContainer, expand && (attInfo.length > 0));
	}
	if (this._scrollWithIframe) {
		ZmMailMsgView._resetIframeHeight(this);
	}
};


ZmMailMsgView.prototype._reportButtonListener =
function(msg, ev) {
	var proxy = AjxUtil.createProxy(msg);

	proxy.clearAddresses();
	var toAddress = new AjxEmailAddress(appCtxt.get(ZmSetting.OFFLINE_REPORT_EMAIL));
	proxy._addrs[AjxEmailAddress.TO] = AjxVector.fromArray([toAddress]);

	var bp = msg.getBodyPart();
	if (bp) {
		var top = new ZmMimePart();
		top.setContentType(bp.ct);
		top.setContent(msg.getBodyPart().getContent());
		proxy.setTopPart(top);
	}

	var respCallback = this._sendReportCallback.bind(this, msg);
	var errorCallback = this._sendReportError.bind(this);
	proxy.send(false, respCallback, errorCallback, null, true);
};

ZmMailMsgView.prototype._sendReportCallback =
function(msg) {
	this._controller._doDelete([msg], true);
};

ZmMailMsgView.prototype._sendReportError =
function() {
	appCtxt.setStatusMsg(ZmMsg.reportSyncError, ZmStatusView.LEVEL_WARNING);
};


// Callbacks

ZmMailMsgView.prototype._msgTagClicked =
function(tagId) {
	var tag = appCtxt.getById(tagId);
	appCtxt.getSearchController().search({query: tag.createQuery()});
};

ZmMailMsgView.prototype._handleMsgTruncated =
function() {
	this._msg.viewEntireMessage = true;	// remember so we reply to entire msg
	this._msg = null;					// so that this view refreshes
	// redo selection to trigger loading and display of entire msg
	this._controller._setSelectedItem({noTruncate: true, forceLoad: true, markRead: false});
	
	Dwt.setVisible(this._msgTruncatedId, false);
};

// Focus management - just pass through to native element's focus()
// and blur() methods, which will indicate focus with a dotted border,
// and make the element actively scrollable. Doesn't work in IE, which
// does not support focus for non-input elements.

ZmMailMsgView.prototype._focus =
function() {
	// need this flag because the hidden input field in DwtKeyboard Mgr
	// gets a blur event which it passes to us
	this._settingFocus = true;
	this.getHtmlElement().focus();
	this._settingFocus = false;
};

ZmMailMsgView.prototype._blur =
function() {
	if (this._settingFocus) { return; }
	this.getHtmlElement().blur();
};

// Static methods

ZmMailMsgView._swapIdAndSrc =
function (image, i, len, msg, parent, view) {
	// Fix for IE: Over HTTPS, http src urls for images might cause an issue.
	try {
		image.src = image.getAttribute("dfsrc");
	}
	catch (ex) {
		// do nothing
	}

	if (i == len - 1) {
		if (msg) {
			msg.setHtmlContent(parent.innerHTML);
		}
		view._resetIframeHeightOnTimer();
	}
};

ZmMailMsgView.prototype._onloadIframe =
function(dwtIframe) {
	var iframe = dwtIframe.getIframe();
	try { iframe.onload = null; } catch(ex) {}
	ZmMailMsgView._resetIframeHeight(this);
};

ZmMailMsgView._resetIframeHeight =
function(self, attempt) {

	var iframe = self.getIframe();
	if (!iframe) { return; }

	DBG.println("cv2", "ZmMailMsgView::_resetIframeHeight " + (attempt || "0"));
	var h;
	if (self._scrollWithIframe) {
		h = self.getH();
		function subtract(el) {
			if (el) {
				if (typeof el == "string") {
					el = document.getElementById(el);
				}
				if (el) {
					h -= Dwt.getSize(el).y;
				}
			}
		}
		subtract(self._headerElement);
		subtract(self._displayImagesId);
		subtract(self._highlightObjectsId);
		if (self._isMsgTruncated) {
			subtract(self._msgTruncatedId);
		}
		if (self._inviteMsgView && self._inviteMsgView.isActive()) {
			if (self._inviteMsgView._inviteToolbar) {//if toolbar not created there's nothing to subtract (e.g. sent folder)
				subtract(self._inviteMsgView.getInviteToolbar().getHtmlElement());
			}
			if (self._inviteMsgView._dayView) {
				subtract(self._inviteMsgView._dayView.getHtmlElement());
			}
		}
		if (self._hasShareToolbar && self._shareToolbar) {
			subtract(self._shareToolbar.getHtmlElement());
		}
		iframe.style.height = h + "px";
	} else {
		if (attempt == null) { attempt = 0; }
		try {
			if (!iframe.contentWindow || !iframe.contentWindow.document) {
				if (attempt < ZmMailMsgView.SETHEIGHT_MAX_TRIES) {
					attempt++;
					self._resetIframeHeightOnTimer(attempt);
				}
				return; // give up
			}
		} catch(ex) {
			if (attempt < ZmMailMsgView.SETHEIGHT_MAX_TRIES) {
				attempt++;
				self._resetIframeHeightOnTimer(attempt++); // for IE
			}
			return; // give up
		}

		var doc = iframe.contentWindow.document;
		var origHeight = doc && doc.body && doc.body.scrollHeight || 0;

		// first off, make it wide enough to fill ZmMailMsgView.
		iframe.style.width = "100%"; // *** changes height!

		// remember the current width
		var view_width = iframe.offsetWidth;

		// if there's a long unbreakable string, the scrollWidth of the body
		// element will be bigger--we must make the iframe that wide, or there
		// won't be any scrollbars.
		var w = doc.body.scrollWidth;
		if (w > view_width) {
			iframe.style.width = w + "px"; // *** changes height!

			// Now (bug 20743), by forcing the body a determined width (that of
			// the view) we are making the browser wrap those paragraphs that
			// can be wrapped, even if there's a long unbreakable string in the message.
			doc.body.style.overflow = "visible";
			if (view_width > 20) {
				doc.body.style.width = view_width - 20 + "px"; // *** changes height!
			}
		}

		// we are finally in the right position to determine height.
		h = Math.max(doc.documentElement.scrollHeight, origHeight);

		iframe.style.height = h + "px";

		if (AjxEnv.isWebKitBased) {
			// bug: 39434, WebKit specific
			// After the iframe ht is set there is change is body.scrollHeight, weird.
			// So reset ht to make the entire body visible.
			var newHt = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
			if (newHt > h) {
				iframe.style.height = newHt + "px";
			}
		}
	}
};

// note that IE doesn't seem to be able to reset the "scrolling" attribute.
// this function isn't safe to call for IE!
ZmMailMsgView.prototype.setScrollWithIframe =
function(val) {
	
	if (!this._usingIframe) { return; }
	
	this._scrollWithIframe = val;
	this._limitAttachments = this._scrollWithIframe ? 3 : 0; //making it local
	this._attcMaxSize = this._limitAttachments * 16 + 8;

	this.setScrollStyle(val ? DwtControl.CLIP : DwtControl.SCROLL);
	var iframe = this.getIframe();
	if (iframe) {
		iframe.style.width = "100%";
		iframe.scrolling = val;
		ZmMailMsgView._resetIframeHeight(this);
	}
};

ZmMailMsgView._tagClick =
function(myId, tagId) {
	var dwtObj = DwtControl.fromElementId(myId);
	dwtObj.notifyListeners(ZmMailMsgView._TAG_CLICK, tagId);
};

ZmMailMsgView._removeTagClick =
function(myId, tagId) {
	var dwtObj = DwtControl.fromElementId(myId);
	var tag = appCtxt.getById(tagId);
	ZmListController.prototype._doTag.call(dwtObj._controller, dwtObj._msg, tag, false);
};

ZmMailMsgView._detachCallback =
function(isRfc822, parentController, result) {
	var msgNode = result.getResponse().GetMsgResponse.m[0];
	var ac = window.parentAppCtxt || window.appCtxt;
	var ctlr = ac.getApp(ZmApp.MAIL).getMailListController();
	var msg = ZmMailMsg.createFromDom(msgNode, {list: ctlr.getList()}, true);
	msg._loaded = true; // bug fix #8868 - force load for rfc822 msgs since they may not return any content
	msg.readReceiptRequested = false; // bug #36247 - never allow read receipt for rfc/822 message
	msg._part = resp.m[0].part;
	ZmMailMsgView.detachMsgInNewWindow(msg, isRfc822, parentController);
};

ZmMailMsgView.detachMsgInNewWindow =
function(msg, isRfc822, parentController) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var newWinObj = appCtxt.getNewWindow(true);
	if(newWinObj) {// null check for popup blocker
		newWinObj.command = "msgViewDetach";
		newWinObj.params = { msg:msg, isRfc822:isRfc822, parentController:parentController };
	}
};

// loads a msg and displays it in a new window
ZmMailMsgView.rfc822Callback =
function(msgId, msgPartId, parentController) {
	var isRfc822 = Boolean((msgPartId != null));
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var params = {
		sender: appCtxt.getAppController(),
		msgId: msgId,
		partId: msgPartId,
		getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
		markRead: true,
		callback: ZmMailMsgView._detachCallback.bind(null, isRfc822, parentController)
	};
	ZmMailMsg.fetchMsg(params);
};

ZmMailMsgView.contactIconCallback =
function(addr, icon) {
	if (icon == "Contact") {
		var params = {
			action: ZmOperation.NEW_MESSAGE,
			toOverride: (addr + AjxEmailAddress.SEPARATOR)
		};
		AjxDispatcher.run("Compose", params);
	} else {
		AjxDispatcher.require(["ContactsCore", "Contacts"], false);
		var contact = new ZmContact(null);
		var email = AjxEmailAddress.parse(addr);
		contact.initFromEmail(email);
		AjxDispatcher.run("GetContactController").show(contact, true);
	}
};

ZmMailMsgView.vcardCallback =
function(msgId, partId) {
	ZmZimbraMail.unloadHackCallback();

	var ac = window.parentAppCtxt || window.appCtxt;
	ac.getApp(ZmApp.CONTACTS).createFromVCard(msgId, partId);
};

ZmMailMsgView.downloadCallback =
function(downloadUrl) {
	ZmZimbraMail.unloadHackCallback();
	location.href = downloadUrl;
};


ZmMailMsgView.prototype.removeAttachmentCallback =
function(partIds) {
	ZmZimbraMail.unloadHackCallback();

	if (!(partIds instanceof Array)) { partIds = partIds.split(","); }

	var msg = (partIds.length > 1)
		? ZmMsg.attachmentConfirmRemoveAll
		: ZmMsg.attachmentConfirmRemove;

	var dlg = appCtxt.getYesNoMsgDialog();
	dlg.registerCallback(DwtDialog.YES_BUTTON, this._removeAttachmentCallback, this, [partIds]);
	dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	dlg.popup();
};

ZmMailMsgView.prototype._removeAttachmentCallback =
function(partIds) {
	appCtxt.getYesNoMsgDialog().popdown();
	this._msg.removeAttachments(partIds, this._handleRemoveAttachment.bind(this));
};

ZmMailMsgView.prototype._handleRemoveAttachment =
function(result) {
	var msgNode = result.getResponse().RemoveAttachmentsResponse.m[0];
	var ac = window.parentAppCtxt || window.appCtxt;
	var ctlr = ac.getApp(ZmApp.MAIL).getMailListController();
	var msg = ZmMailMsg.createFromDom(msgNode, {list: ctlr.getList()}, true);
	this._msg = this._item = null;
	// cache this actioned ID so we can reset selection to it once the CREATE
	// notifications have been processed.
	ctlr.actionedMsgId = msgNode.id;
	this.set(msg);
};

ZmMailMsgView.briefcaseCallback =
function(msgId, partId, name) {
	ZmZimbraMail.unloadHackCallback();

	// force create deferred folders if not created
	AjxDispatcher.require("BriefcaseCore");
	var aCtxt = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
	var briefcaseApp = aCtxt.getApp(ZmApp.BRIEFCASE);
	briefcaseApp._createDeferredFolders();

	appCtxt.getApp(ZmApp.BRIEFCASE).createFromAttachment(msgId, partId, name);
};

ZmMailMsgView.prototype.deactivate =
function() {
	this._controller.inactive = true;
};

ZmMailMsgView.addToCalendarCallback =
function(msgId, partId, name) {
	ZmZimbraMail.unloadHackCallback();

	// force create deferred folders if not created
	AjxDispatcher.require("CalendarCore");
	var aCtxt = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
	var calApp = aCtxt.getApp(ZmApp.CALENDAR);
	calApp._createDeferredFolders();

	appCtxt.getApp(ZmApp.CALENDAR).importAppointment(msgId, partId, name);
};

ZmMailMsgView.prototype.getMsgBodyElement =
function(){
    return document.getElementById(this._msgBodyDivId);
};

ZmMailMsgView.prototype._getViewId =
function() {
	var ctlrViewId = this._controller.getCurrentViewId();
	return this._controller.isZmMsgController ? ctlrViewId : [ctlrViewId, ZmId.VIEW_MSG].join("_");
};

ZmMailMsgView.prototype._keepReading =
function() {
	var cont = this.getHtmlElement();
	var contHeight = Dwt.getSize(cont).y;
	var canScroll = (cont.scrollHeight > contHeight && (cont.scrollTop + contHeight < cont.scrollHeight));
	if (canScroll) {
		cont.scrollTop = cont.scrollTop + contHeight;
		return true;
	}
	return false;
};
