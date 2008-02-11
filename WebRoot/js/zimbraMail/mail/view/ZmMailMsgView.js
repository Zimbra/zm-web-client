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

ZmMailMsgView = function(parent, className, posStyle, mode, controller) {
	if (arguments.length == 0) return;
	className = className ? className : "ZmMailMsgView";
	DwtComposite.call(this, parent, className, posStyle);

	this._mode = mode;
	this._controller = controller;

	this._displayImagesId = Dwt.getNextId();
	this._msgTruncatedId = Dwt.getNextId();
	this._infoBarId = Dwt.getNextId();
	this._tagRowId = Dwt.getNextId();
	this._tagCellId = Dwt.getNextId();
	this._attLinksId = Dwt.getNextId();

	// expand/collapse vars
	this._expandHeader = true;
	this._expandDivId = Dwt.getNextId();

	// do we add a close button in the header section?
	this._hasHeaderCloseBtn = (this._mode == ZmController.MSG_VIEW && !appCtxt.isChildWindow);

	//this.SCROLL_WITH_IFRAME = ZmMailMsgView.SCROLL_WITH_IFRAME;
    this._scrollWithIframe = ZmMailMsgView.SCROLL_WITH_IFRAME; // Making it local var
    this._limitAttachments = this._scrollWithIframe ? 3 : 0; //making it local
    this._attcMaxSize = this._limitAttachments * 16 + 8;
    this.setScrollStyle(this._scrollWithIframe ? DwtControl.CLIP : DwtControl.SCROLL);

	if (!appCtxt.isChildWindow) {
		// Add change listener to taglist to track changes in tag color
		this._tagList = appCtxt.getTagTree();
		if (this._tagList) {
			this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
			this.addListener(ZmMailMsgView._TAG_CLICK, new AjxListener(this, this._msgTagClicked));
		}
	}

	this._setMouseEventHdlrs(); // needed by object manager

	// XXX: for now, turn off object handling in new window
	if (!appCtxt.isChildWindow) {
		this._objectManager = true;
	}

	this._changeListener = new AjxListener(this, this._msgChangeListener);
	this.addListener(DwtEvent.ONSELECTSTART, new AjxListener(this, this._selectStartListener));
	this.addListener(DwtEvent.CONTROL, new AjxListener(this, this._controlEventListener));
	this._setAllowSelection();

    this._expandButton = new DwtToolBarButton(this);
    this._expandButton.addSelectionListener(new AjxListener(this, this._expandButtonListener));
    this._expandButton.setDisplay(Dwt.DISPLAY_NONE);

}

ZmMailMsgView.prototype = new DwtComposite;
ZmMailMsgView.prototype.constructor = ZmMailMsgView;


// Consts

ZmMailMsgView.SCROLL_WITH_IFRAME	= false;
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
ZmMailMsgView.OBJ_SIZE_TEXT 		= 50; // max. size of text emails that will automatically highlight objects
ZmMailMsgView.OBJ_SIZE_HTML 		= 50; // similar for HTML emails.
ZmMailMsgView.REPLY_INVITE_EVENT	= "inviteReply";
ZmMailMsgView.SHARE_EVENT 			= "share";


// Public methods

ZmMailMsgView.prototype.toString =
function() {
	return "ZmMailMsgView";
};

ZmMailMsgView.prototype.getController =
function() {
	return this._controller;
};

ZmMailMsgView.prototype.reset =
function() {
	this._msg = null;
	this._htmlBody = null;

	// TODO: reuse all thses controls that are being disposed here.....
	if (this._expandButton) {
        this._expandButton.setVisible(Dwt.DISPLAY_NONE);
        this._expandButton.reparentHtmlElement(this.getHtmlElement());
    }
	if (this._ifw) {
		this._ifw.dispose();
		this._ifw = null;
	}
	if (this._inviteToolbar) {
		this._inviteToolbar.dispose();
		this._inviteToolbar = null;
	}
	if (this._shareToolbar) {
		this._shareToolbar.dispose();
		this._shareToolbar = null;
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
function(msg) {
    if (this._msg && msg && (this._msg.id == msg.id)) { return; }

	var oldMsg = this._msg;
	this.reset();
	var contentDiv = this.getHtmlElement();
	this._msg = msg;

	if (!msg) {
		var htmlArr = [];
		var idx = 0;
		htmlArr[idx++] = "<table width='100%' cellspacing='0' cellpadding='1'><tr><td class='NoResults'><br>";
		htmlArr[idx++] = ZmMsg.viewMessage;
		htmlArr[idx++] = "</td></tr></table>";
		contentDiv.innerHTML = htmlArr.join("");
		return;
	}

	this._dateObjectHandlerDate = msg.sentDate
		? new Date(msg.sentDate)
		: new Date(msg.date);

	var invite = msg.getInvite();

	if ((appCtxt.get(ZmSetting.CALENDAR_ENABLED)) &&
		invite && invite.type != "task" &&
		!appCtxt.isChildWindow)
	{
		if (!invite.isEmpty() && !invite.hasMultipleComponents() &&
			invite.getStatus() != ZmCalendarApp.STATUS_CANC &&
			msg.folderId != ZmFolder.ID_TRASH &&
			appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED) &&
			!msg.isShared())
		{
			var topToolbar = this._getInviteToolbar();
			// nuke the old toolbar if it exists b4 appending the new one
			var tEl = topToolbar.getHtmlElement();
			if (tEl && tEl.parentNode)
				tEl.parentNode.removeChild(tEl);
			contentDiv.appendChild(tEl);
		}
	}
	else if (appCtxt.get(ZmSetting.SHARING_ENABLED) &&
			 msg.share && msg.folderId != ZmFolder.ID_TRASH &&
			 appCtxt.getActiveAccount().id != msg.share.grantor.id)
	{
		AjxDispatcher.require("Share");
		var action = msg.share.action;
        var isNew = action == ZmShare.NEW;
        var isEdit = action == ZmShare.EDIT;
		var isDataSource = appCtxt.getById(msg.folderId).isDataSource(null, true);

		if (!isDataSource &&
			(isNew || (isEdit && !this.__hasMountpoint(msg.share))) &&
			msg.share.link.perm)
		{
			var topToolbar = this._getShareToolbar();
			var tEl = topToolbar.getHtmlElement();
			if (tEl && tEl.parentNode) {
				tEl.parentNode.removeChild(tEl);
			}
			contentDiv.appendChild(tEl);
		}
	}
	var respCallback = new AjxCallback(this, this._handleResponseSet, [msg, oldMsg]);
	this._renderMessage(msg, contentDiv, respCallback);
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
	var idoc = document.getElementById(this._iframeId).contentWindow.document;
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
		idoc.body.innerHTML = html;
		DBG.timePt("END - highlight objects on-demand, text msg.");
	} else {
		this._processHtmlDoc(idoc);
	}
};

ZmMailMsgView.prototype.resetMsg =
function(newMsg) {
	// Remove listener for current msg if it exists
	if (this._msg != null)
		this._msg.removeChangeListener(this._changeListener);
};

ZmMailMsgView.prototype.getMsg =
function() {
	return this._msg;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmMailMsgView.prototype.getSelection =
function() {
	return this._msg;
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

ZmMailMsgView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._msg.subject].join(": ");
};

// returns true if the current message was rendered in HTML
ZmMailMsgView.prototype.hasHtmlBody =
function() {
	return this._htmlBody != null;
};

// returns the html body element w/in the IFRAME's document for html messages
ZmMailMsgView.prototype.getHtmlBodyElement =
function() {
	var htmlBodyEl = null;

	if (this._htmlBody) {
		var iframe = document.getElementById(this._iframeId);
		var idoc = iframe ? Dwt.getIframeDoc(iframe) : null;
		htmlBodyEl = idoc ? idoc.body : null;
	}

	return htmlBodyEl;
};

ZmMailMsgView.prototype.addInviteReplyListener =
function (listener) {
	this.addListener(ZmMailMsgView.REPLY_INVITE_EVENT, listener);
};

ZmMailMsgView.prototype.addShareListener =
function (listener) {
	this.addListener(ZmMailMsgView.SHARE_EVENT, listener);
};


// Private / protected methods

ZmMailMsgView.prototype._getInviteToolbar =
function() {
	var operationButtonIds = [ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_TENTATIVE, ZmOperation.REPLY_DECLINE];
	var replyButtonIds = [ZmOperation.INVITE_REPLY_ACCEPT,ZmOperation.INVITE_REPLY_TENTATIVE,ZmOperation.INVITE_REPLY_DECLINE];
	var params = {
		parent: this,
		buttons: operationButtonIds,
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmInviteToolBar",
		buttonClassName: "DwtToolbarButton"
	};
	this._inviteToolbar = new ZmButtonToolBar(params);

	var inviteToolBarListener = new AjxListener(this, this._inviteToolBarListener);
	operationButtonIds = this._inviteToolbar.opList;
	for (var i = 0; i < operationButtonIds.length; i++) {
		var id = operationButtonIds[i];

		// HACK for IE, which doesn't support multiple classnames. If I
		// just change the styles, the hovered class overrides the basic
		// hovered class definition, thus I have to change what the
		// hovered class name will be for the buttons in the toolbar.
		var button = this._inviteToolbar.getButton(id);
		button._hoverClassName = button._className + "-" + DwtCssStyle.HOVER;
		button._activeClassName = button._className + "-" + DwtCssStyle.ACTIVE;

		this._inviteToolbar.addSelectionListener(id, inviteToolBarListener);

		var standardItems = [id, replyButtonIds[i]];
		var menu = new ZmActionMenu({parent:button, menuItems:standardItems});
		standardItems = menu.opList;
		for (var j = 0; j < standardItems.length; j++) {
			var menuItem = menu.getItem(j);
			menuItem.addSelectionListener(inviteToolBarListener);
		}
		button.setMenu(menu);
	}

	return this._inviteToolbar;
};

ZmMailMsgView.prototype._getShareToolbar =
function() {
	var buttonIds = [ZmOperation.SHARE_ACCEPT, ZmOperation.SHARE_DECLINE];
	var params = {
		parent: this,
		buttons: buttonIds,
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmShareToolBar",
		buttonClassName: "DwtToolbarButton"
	};
	this._shareToolbar = new ZmButtonToolBar(params);

	var shareToolBarListener = new AjxListener(this, this._shareToolBarListener);
	for (var i = 0; i < buttonIds.length; i++) {
		var id = buttonIds[i];

		// HACK for IE, which doesn't support multiple classnames. If I
		// just change the styles, the hovered class overrides the basic
		// hovered class definition, thus I have to change what the
		// hovered class name will be for the buttons in the toolbar.
		var b = this._shareToolbar.getButton(id);
		b._hoverClassName = b._className + "-" + DwtCssStyle.HOVER;
		b._activeClassName = b._className + "-" + DwtCssStyle.ACTIVE;

		this._shareToolbar.addSelectionListener(id, shareToolBarListener);
	}

	return this._shareToolbar;
};

ZmMailMsgView.prototype._handleResponseSet =
function(msg, oldMsg) {
	if (!appCtxt.isChildWindow) {
		if (this._mode == ZmController.MSG_VIEW) {
			this._setTags(msg);
			// Remove listener for current msg if it exists
			if (oldMsg) {
				oldMsg.removeChangeListener(this._changeListener);
			}
			msg.addChangeListener(this._changeListener);
		}
	}

	// reset scroll view to top most
	this.getHtmlElement().scrollTop = 0;

	// notify zimlets that a new message has been opened
	if (appCtxt.zimletsPresent()) {
		appCtxt.getZimletMgr().notifyZimlets("onMsgView", msg, oldMsg, this);
	}
};

// Values in this hash MUST be null or RegExp.  If "null" is passed, then that
// CSS rule will be dropped regardless the value.  If a RegExp is passed, then
// the rule is removed only if its value matches the RegExp.  Useful for cases
// like "position", where we can safely support most values except "fixed".
ZmMailMsgView._dangerousCSS = {

// It' doesn't make too much sense to cleanup the style if we're using an IFRAME

// 	// clearly, we can't display background image-s :-(
// 	// in the future we should provide a way for end-users to see them on demand,
// 	// but at this time, ban.
// 	backgroundImage       : null,
// 	backgroundAttachment  : null,

// 	// position: fixed can cause real trouble with browsers that support it
// 	position              : /fixed/i,

// 	// negative margins can get an element out of the containing DIV.
// 	// let's ban them
// 	marginLeft            : /^-/,
// 	marginRight           : /^-/,
// 	marginTop             : /^-/,
// 	marginBottom          : /^-/,

// 	// all of the above being banned, zIndex could as well stay... but better not.
// 	zIndex                : null,

// 	// not sure this is good
// 	whiteSpace            : null

 };

ZmMailMsgView._URL_RE = /^((https?|ftps?):\x2f\x2f.+)$/;
ZmMailMsgView._MAILTO_RE = /^mailto:[\x27\x22]?([^@?&\x22\x27]+@[^@?&]+\.[^@?&\x22\x27]+)[\x27\x22]?/;

// Create the ObjectManager at the last minute just before we scan the message
ZmMailMsgView.prototype._lazyCreateObjectManager =
function() {
	// objectManager will be 'true' at create time, after that it will be the real object
	if (this._objectManager === true) {
		// this manages all the detected objects within the view
		this._objectManager = new ZmObjectManager(this);
	}
};

// This is needed for Gecko only: for some reason, clicking on a local
// link will open the full Zimbra chrome in the iframe :-( so we fake
// a scroll to the link target here. (bug 7927)
ZmMailMsgView.__localLinkClicked = function(msgView, ev) {
	// note that this function is called in the context of the link
	var id = this.getAttribute("href");
	var el = null;
	var doc = this.ownerDocument;
	if (/^#(.*)$/.test(id)) {
		id = RegExp.$1;
		el = doc.getElementById(id);
		if (!el) try {
			el = doc.getElementsByName(id)[0];
		} catch(ex) {};
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
	var div = msgView.getHtmlElement();
	var iframe = document.getElementById(msgView._iframeId);
	var pos = Dwt.getLocation(el);
	div.scrollTop = pos.y + iframe.offsetTop - 20; // fuzz factor necessary for unknown reason :-(
	div.scrollLeft = pos.x + iframe.offsetLeft;
	ev.stopPropagation();
	ev.preventDefault();
	return false;
};

ZmMailMsgView.prototype.hasValidHref =
function (node) {
	// Bug 22958: IE can throw when you try and get the href if it doesn't like the value,
	// so we wrap the test in a try/catch.
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
function(doc) {
    DBG.timePt("Starting ZmMailMsgView.prototype._processHtmlDoc");

    if(!doc) return;
    //bug 8632
    var images = doc.getElementsByTagName("img");
    if(images.length > 0){
        var length = images.length;
        for(var i=0; i<images.length; i++ ){
            this._checkImgInAttachments(images[i]);
        }
    }

    //Find Zimlet Objects lazly
    this.lazyFindMailMsgObjects(500, doc);

    DBG.timePt("-- END _processHtmlDoc");

	// bug fix #8632 - finally, set the attachment links
	this._setAttachmentLinks();

};

ZmMailMsgView.prototype.lazyFindMailMsgObjects = function(interval, doc ){
    if (this._objectManager) {
        this._lazyCreateObjectManager();
        AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._findMailMsgObjects, [doc]), ( interval || 500 ));
    }
};

ZmMailMsgView.prototype._findMailMsgObjects = function(doc){
    this._objectManager.processObjectsInNode(doc, doc.body);
};

ZmMailMsgView.prototype._checkImgInAttachments =
function(img) {
	var attachments = this._msg.getAttachments();
	var csfeMsgFetch = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);

	for (var i = 0; i < attachments.length; i++) {
		var att = attachments[i];

		if (att.foundInMsgBody) { continue; }

		var src = img.getAttribute("src") || img.getAttribute("dfsrc");
		if (src && src.indexOf(csfeMsgFetch) == 0) {
			var mpId = src.substring(src.lastIndexOf("=") + 1);
			if (mpId == att.part) {
				att.foundInMsgBody = true;
				break;
			}
		} else if (att.cl) {
			var filename = src.substring(src.lastIndexOf("/") + 1);
			if (filename == att.filename) {
				att.foundInMsgBody = true;
				break;
			}
		}
	}
};

ZmMailMsgView.prototype._fixMultipartRelatedImages =
function(msg, idoc) {
	var images = idoc.getElementsByTagName("img");
	var num = 0;
	for (var i = 0; i < images.length; i++) {
		var dfsrc = images[i].getAttribute("dfsrc");
		if (dfsrc) {
			if (dfsrc.substring(0,4) == "cid:") {
				num++;
				var cid = "<" + dfsrc.substring(4) + ">";
				var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_ID, cid);
				if (src) {
					images[i].src = src;
					images[i].dfsrc = src;
				}
			} else if (dfsrc.indexOf("//") == -1) { // check for content-location verison
				var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_LOCATION, dfsrc);
				if (src) {
					num++;
					images[i].src = src;
					images[i].dfsrc = src;
				}
			}
		}
	}
	return (num == images.length);
};

ZmMailMsgView.prototype._createDisplayImageClickClosure =
function(msg, idoc, id, iframe) {
	var self = this;
	var func = function() {
		var images = idoc.getElementsByTagName("img");
		for (var i = 0; i < images.length; i++) {
			if (images[i].getAttribute("dfsrc")) {
				// If we just loop through the images, IE for some reason,
				// doesn't fetch the image. By launching them off in the
				// background we seem to kick IE's engine a bit.
				if (AjxEnv.isIE) {
					var args = [images[i], i, images.length, msg, idoc, iframe, self];
					var act = new AjxTimedAction(null, ZmMailMsgView._swapIdAndSrc, args);
					AjxTimedAction.scheduleAction(act, 0);
				} else {
					images[i].src = images[i].getAttribute("dfsrc");
				}
			}
		}
		diEl = document.getElementById(id);
		if (diEl)
			diEl.style.display = "none";
		this._htmlBody = idoc.documentElement.innerHTML;
		if (!AjxEnv.isIE) {
			self._resetIframeHeightOnTimer(iframe);
		}

		ZmMailMsgView._resetIframeHeight(self, iframe);
        if(msg){
            msg.setHtmlContent(this._htmlBody);
            msg.showImages = true;
        }
    };
	return func;
};

ZmMailMsgView.prototype._resetIframeHeightOnTimer =
function(iframe) {
	// Because sometimes our view contains images that are slow to download, wait a
	// little while before resizing the iframe.
	var act = new AjxTimedAction(this, ZmMailMsgView._resetIframeHeight, [this, iframe]);
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
			div.style.display = "none";
			ZmMailMsgView._resetIframeHeight(self, document.getElementById(self._iframeId));
		}, 3);
		return false;
	};
	// avoid closure memory leaks
	(function() {
		var infoBarDiv = document.getElementById(self._infoBarId);
		if (infoBarDiv) {
			self._highlightObjectsId = Dwt.getNextId();
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

ZmMailMsgView.prototype._makeIframeProxy =
function(container, html, isTextMsg, isTruncated) {
	// bug fix #4943
	if (html == null) html = "";

	var displayImages;
	if (!isTextMsg &&
		(!appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) || (this._msg && this._msg.folderId == ZmOrganizer.ID_SPAM)) &&
		(this._msg == null || (this._msg && !this._msg.showImages)) &&
		/<img/i.test(html))
	{
		// prevent appending the "Display Images" info bar more than once
		var dispImagesDiv = document.getElementById(this._displayImagesId);
		if (!dispImagesDiv) {
			var infoBarDiv = document.getElementById(this._infoBarId);
			if (infoBarDiv) {
				var subs = {
					id: this._displayImagesId,
					text: ZmMsg.externalImages,
					link: ZmMsg.displayExternalImages
				};
				var extImagesHtml = AjxTemplate.expand("mail.Message#InformationBar", subs);
				displayImages = Dwt.parseHtmlFragment(extImagesHtml);
				infoBarDiv.appendChild(displayImages);
			}
		}
	}

	var callback;
	var msgSize = (html.length / 1024);
	if (isTextMsg) {
		if (this._objectManager) {
			if (msgSize <= ZmMailMsgView.OBJ_SIZE_TEXT) {
                //Using callback to lazily find objects instead of doing it on a run.
                callback = new AjxCallback(this, this.lazyFindMailMsgObjects, [500]);
                html = AjxStringUtil.nl2br(html);
			} else {
				this._makeHighlightObjectsDiv(html);
				html = AjxStringUtil.convertToHtml(html);
			}
		} else {
			// we get here when viewing text attachments and we need to HTMLize
			// the text message in order to be displayed correctly (bug 8714).
			html = AjxStringUtil.convertToHtml(html);
		}
		if (AjxEnv.isSafari) {
			html = "<html><head></head><body>" + html + "</body></html>";
		}
	} else {
		html = html.replace(/<!--(.|\n)*?-->/g, ""); 							// remove comments
		if (this._objectManager) {
			// this callback will post-process the HTML after the IFRAME is created
			if (msgSize <= ZmMailMsgView.OBJ_SIZE_HTML)
				callback = new AjxCallback(this, this._processHtmlDoc);
			else
				this._makeHighlightObjectsDiv();
		}
	}

	var msgTruncated;
	if (isTruncated) {
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

	// bug fix #9475 - IE isnt resolving MsgBody class in iframe so set styles explicitly
	var inner_styles = AjxEnv.isIE ? ".MsgBody-text, .MsgBody-text * { font: 10pt monospace; }" : "";
	var params = {
		parent: this,
		className: "MsgBody",
		hidden: true,
		html: html,
		styles: inner_styles,
		noscroll: !this._scrollWithIframe,
		posStyle: DwtControl.STATIC_STYLE,
		processHtmlCallback: callback,
		useKbMgmt: true
	};
	var ifw = this._ifw = new DwtIframe(params);
	this._iframeId = ifw.getIframe().id;

	var idoc = ifw.getDocument();

	if (AjxEnv.isGeckoBased) {
		// patch local links (pass null as object so it gets called in context of link)
		var geckoScrollCallback = AjxCallback.simpleClosure(ZmMailMsgView.__localLinkClicked, null, this);
		var links = idoc.getElementsByTagName("a");
		for (var i = links.length; --i >= 0;) {
			var link = links[i];
			if (!link.target) {
				link.onclick = geckoScrollCallback; // has chances to be a local link
			}
		}
	}

	// assign the right class name to the iframe body
	idoc.body.className = isTextMsg
		? "MsgBody MsgBody-text"
		: "MsgBody MsgBody-html";

	ifw.getIframe().onload = AjxCallback.simpleClosure(this._onloadIframe, this, ifw);

	// import the object styles
	var head = idoc.getElementsByTagName("head")[0];
	if (!head) {
		head = idoc.createElement("head");
		idoc.body.parentNode.insertBefore(head, idoc.body);
	}
	var link = idoc.createElement("link");
	link.rel = "stylesheet";
	link.href = appContextPath+"/css/msgview.css?v="+cacheKillerVersion;
	head.appendChild(link);

	ifw.getIframe().style.visibility = "";

	if (!isTextMsg) {
		this._htmlBody = idoc.body.innerHTML;

		// TODO: only call this if top-level is multipart/related?
		var didAllImages = this._fixMultipartRelatedImages(this._msg, idoc);

		// setup the click handler for the images
		if (displayImages) {
			if (didAllImages) {
				displayImages.style.display = "none";
			} else {
				var func = this._createDisplayImageClickClosure(this._msg, idoc, this._displayImagesId, ifw.getIframe());
				Dwt.setHandler(displayImages, DwtEvent.ONCLICK, func);
			}
		}
		else if (appCtxt.get(ZmSetting.DISPLAY_EXTERNAL_IMAGES) ||
				 (this._msg && this._msg.showImages))
		{
			var func = this._createDisplayImageClickClosure(this._msg, idoc, this._displayImagesId, ifw.getIframe());
			func.call();
		}
	}

	if (msgTruncated) {
		Dwt.setHandler(msgTruncated, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._handleMsgTruncated, this));
	}

	if (isTextMsg || appCtxt.isChildWindow) {
		this._setAttachmentLinks();
	}

	// set height of view according to height of iframe on timer
        this._resetIframeHeightOnTimer(ifw.getIframe());
};

ZmMailMsgView.prototype._renderMessage =
function(msg, container, callback) {

	var acctId = appCtxt.getActiveAccount().id;
	var cl = appCtxt.getApp(ZmApp.CONTACTS).contactsLoaded[acctId] ? AjxDispatcher.run("GetContacts") : null;
	var subject = msg.subject || ZmMsg.noSubject;
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
	var dateString = msg.sentDate ? dateFormatter.format(new Date(msg.sentDate)) : "";
	var addr = msg.getAddress(AjxEmailAddress.FROM) || ZmMsg.unknown;
	var sender = msg.getAddress(AjxEmailAddress.SENDER); // bug fix #10652 - check invite if sentBy is set (means on-behalf-of)
	var sentBy = (sender && sender.address) ? sender : addr;
	var sentByAddr = sentBy.address; // non-objectified version
	var sentByIcon = cl	? (cl.getContactByEmail(sentByAddr) ? "Contact" : "NewContact")	: null;
	var obo = sender ? addr : null;

	if (this._objectManager) {
		this._lazyCreateObjectManager();
		this._objectManager.setHandlerAttr(ZmObjectManager.DATE,
	    								   ZmObjectManager.ATTR_CURRENT_DATE,
	    								   this._dateObjectHandlerDate);

		subject 	= this._objectManager.findObjects(subject, true);
		sentBy		= this._objectManager.findObjects(sentBy, true, ZmObjectManager.EMAIL); 
        dateString	= this._objectManager.findObjects(dateString, true, ZmObjectManager.DATE);
		if (obo) {
			obo		= this._objectManager.findObjects(addr, true, ZmObjectManager.EMAIL);
		}
	} else {
		sentBy = AjxStringUtil.htmlEncode(sentBy.toString());
		if (obo) {
			obo = AjxStringUtil.htmlEncode(obo.toString());
		}
	}

	var participants = [];
	for (var i = 1; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		if (type == AjxEmailAddress.SENDER) { continue; }

		var addrs = msg.getAddresses(type).getArray();
		if (addrs.length > 0) {
			var idx = 0;
			var parts = [];
			for (var j = 0; j < addrs.length; j++) {
				if (j > 0) {
					parts[idx++] = AjxStringUtil.htmlEncode(AjxEmailAddress.SEPARATOR);
				}

				var email = addrs[j];
				if (email.address) {
					parts[idx++] = this._objectManager
						? (this._objectManager.findObjects(email, true, ZmObjectManager.EMAIL))
						: email.address;
                } else {
					parts[idx++] = AjxStringUtil.htmlEncode(email.name);
				}
			}
			var prefix = AjxStringUtil.htmlEncode(ZmMsg[AjxEmailAddress.TYPE_STRING[type]]);
			var partStr = parts.join("");
			participants.push({ prefix: prefix, partStr: partStr });
		}
	}

    var hasAttachments = msg.getAttachmentLinks(true);
    hasAttachments = ( hasAttachments.length != 0 );

    var subs = {
		id: this._htmlElId,
		subject: subject,
		dateString: dateString,
		sentBy: sentBy,
		sentByNormal: sentByAddr,
		sentByIcon: sentByIcon,
		obo: obo,
		participants: participants,
		hasHeaderCloseBtn: this._hasHeaderCloseBtn,
		infoBarId: this._infoBarId,
        hasAttachments: hasAttachments,
        attachId: this._attLinksId
    };

	var html = AjxTemplate.expand("mail.Message#MessageHeader", subs);

	var el = container || this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(html));


	/**************************************************************************/
	/* Add to DOM based on Id's used to generate HTML via templates           */
	/**************************************************************************/

	var expandHeaderId	= this._htmlElId + "_expandHeader";
	this._hdrTableId	= this._htmlElId + "_hdrTable";
	this._expandRowId	= this._htmlElId + "_expandRow";

	// add the expand/collapse arrow button now that we have add to the DOM tree
	var expandHeaderEl = document.getElementById(expandHeaderId);
	if (expandHeaderEl) {
		var image = this._expandHeader ? "HeaderExpanded" : "HeaderCollapsed";
		this._expandButton.setImage(image);
		this._expandButton.reparentHtmlElement(expandHeaderId);
        this._expandButton.setVisible(Dwt.DISPLAY_BLOCK);
	}


	// add the close button if applicable
	if (this._hasHeaderCloseBtn) {
		var closeBtnCellId	= this._htmlElId + "_closeBtnCell";
		this._closeButton = new DwtButton(this);
		this._closeButton.setImage("Close");
		this._closeButton.setText(ZmMsg.close);
		this._closeButton.reparentHtmlElement(closeBtnCellId);
		this._closeButton.addSelectionListener(new AjxListener(this, this._closeButtonListener));
	}

	// if multiple body parts, screw the prefs and just append everything
	var bodyParts = msg.getBodyParts();
	var len = bodyParts.length;
	if (len > 1) {
		for (var i = 0; i < len; i++) {
			var bp = bodyParts[i];
			if (ZmMimeTable.isRenderableImage(bp.ct)) {
				var img = document.createElement("IMG");
				img.className = "InlineImage";
				img.src = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI) + "&id=" + msg.id + "&part=" + bp.part;
				el.appendChild(img);
			} else {
				this._makeIframeProxy(el, bp.content, bp.ct == ZmMimeTable.TEXT_PLAIN, bp.truncated)
			}
		}
	} else {
		var bodyPart = msg.getBodyPart();
		if (bodyPart) {
			if (bodyPart.ct == ZmMimeTable.TEXT_HTML && appCtxt.get(ZmSetting.VIEW_AS_HTML)) {
				this._makeIframeProxy(el, bodyPart.content, false, bodyPart.truncated);
			} else {
				// otherwise, get the text part if necessary
				if (bodyPart.ct != ZmMimeTable.TEXT_PLAIN) {
					// try to go retrieve the text part
					var respCallback = new AjxCallback(this, this._handleResponseRenderMessage, [el, bodyPart, callback]);
					var content = msg.getTextPart(respCallback);
					if (content != null)
						this._makeIframeProxy(el, content, true);
					return;
				} else {
					this._makeIframeProxy(el, bodyPart.content, true, bodyPart.truncated);
				}
			}
		} else {
			this._setAttachmentLinks();
		}
	}

    this._expandRows(this._expandHeader);

    if (callback) { callback.run(); }
};

ZmMailMsgView.prototype._handleResponseRenderMessage =
function(el, bodyPart, callback, result, isTruncated) {
	var content = result ? result.getResponse() : null;

	// if no text part, check if theres a calendar part and generate some canned
	// text, otherwise, get the html part if one exists
	if (content == null) {
		if (bodyPart.ct == ZmMimeTable.TEXT_CAL) {
			// NOTE: If there's only a text/calendar part, then fall
			//       back to the description line(s) in the vcal content.
			/***
			var regex = /DESCRIPTION:(.*(?:\r\n\s+.*)*)/;
			var results = regex.exec(bodyPart.content);
			if (results && results.length > 1) {
				content = results[1];
				content = content.replace(/\r\n\s+/g," ");
				content = content.replace(/\\t/g, "\t");
				content = content.replace(/\\n/g, "\n");
				content = content.replace(/\\(.)/g, "$1");
			}
			/***/
			// NOTE: IE doesn't match my multi-line regex, even when
			//       explicitly specifying the "m" attribute.
			var lines = bodyPart.content.split(/\r\n/);
			var desc = [];
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
			}
			if (desc.length > 0) {
				content = desc.join("");
				content = content.replace(/\\t/g, "\t");
				content = content.replace(/\\n/g, "\n");
				content = content.replace(/\\(.)/g, "$1");
			}
			/***/
		} else if (bodyPart.ct == ZmMimeTable.TEXT_HTML) {
			// bug fix #8960 - convert the html content to text using the DOM
			var div = document.createElement("div");
			div.innerHTML = bodyPart.content;
			content = AjxStringUtil.convertHtml2Text(div);
		}
	}

	this._makeIframeProxy(el, (content || ""), true, isTruncated);
}

ZmMailMsgView.prototype._setTags =
function(msg) {
	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED) || msg == null || !this._tagList) { return; }

	var numTags = msg.tags.length;
	var table = document.getElementById(this._hdrTableId);
	var tagRow = document.getElementById(this._tagRowId);
	var tagCell = null;

	if (tagRow != null && table.rows[table.rows.length-1] == tagRow) {
		if (numTags > 0) {
			tagCell = tagRow.cells[1];
		} else {
			table.deleteRow(-1);
			return;
		}
	} else {
		if (numTags > 0) {
			tagRow = table.insertRow(-1);
			tagRow.id = this._tagRowId;
			var tagLabelCell = tagRow.insertCell(-1);
			tagLabelCell.className = "LabelColName";
			tagLabelCell.innerHTML = ZmMsg.tags + ":";
			tagLabelCell.style.verticalAlign = "middle";
			tagCell = tagRow.insertCell(-1);
		} else {
			return;
		}
	}

	// get sorted list of tags for this msg
	var ta = [];
	for (var i = 0; i < numTags; i++) {
		ta[i] = this._tagList.getById(msg.tags[i]);
	}
	ta.sort(ZmTag.sortCompare);

	var html = new Array();
	var i = 0;

	html[i++] = "<table cellspacing=0 cellpadding=0 border=0 width=100%><tr>";
	html[i++] = "<td style='overflow:hidden; id='";
	html[i++] = this._tagCellId;
	html[i++] = AjxEnv.isIE || AjxEnv.isSafari ? "' class='Tags'>" : "'>";

	if (AjxEnv.isGeckoBased)
		html[i++] = "<table border=0 cellspacing=0 cellpadding=0><tr>";
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var anchorId = [this._tagCellId, ZmMailMsgView._TAG_ANCHOR, tag.id].join("");
		var imageId = [this._tagCellId, ZmMailMsgView._TAG_IMG, tag.id].join("");

		if (AjxEnv.isGeckoBased) {
			html[i++] = "<td width=16>";
			html[i++] = AjxImg.getImageHtml(ZmTag.COLOR_ICON[tag.color], null, ["id='", imageId, "'"].join(""));
			html[i++] = "</td><td class='Tags' style='white-space:nowrap;'>";
		}
		html[i++] = "<a href='javascript:' onclick='ZmMailMsgView._tagClick(\"";
		html[i++] = this._htmlElId;
		html[i++] = '","';
		html[i++] = tag.id;
		html[i++] = "\"); return false;' id='";
		html[i++] = anchorId;
		html[i++] = "'>";
		if (AjxEnv.isIE || AjxEnv.isSafari) {
			html[i++] = "<table style='display:inline; vertical-align:middle; width:16px' border=0 cellspacing=0 cellpadding=0><tr><td>";
			html[i++] = AjxImg.getImageHtml(ZmTag.COLOR_ICON[tag.color], null, ["id='", imageId, "'"].join(""));
			html[i++] = "</td></tr></table>";
		}
		html[i++] = AjxStringUtil.htmlEncodeSpace(tag.name);
		html[i++] = "</a>";
		if (AjxEnv.isGeckoBased)
			html[i++] = "</td>";
	}
	if (AjxEnv.isGeckoBased)
		html[i++] = "</tr></table>";
	html[i++] = "</td></tr></table>";
	tagCell.innerHTML = html.join("");
};

ZmMailMsgView.prototype._setAttachmentLinks =
function() {
	var attLinks = this._msg.getAttachmentLinks(true);
	if (attLinks.length == 0) { return; }

	// prevent appending attachment links more than once
	var attLinksTable = document.getElementById(this._attLinksId+"_table");
	if (attLinksTable) { return; }

	var htmlArr = [];
	var idx = 0;

    var dividx = idx;	// we might get back here
	htmlArr[idx++] = "<table id='"+this._attLinksId+"_table' border=0 cellpadding=0 cellspacing=0>";

	var rows = 0;
	if (attLinks.length > 1) {
		htmlArr[idx++] = "<tr><td colspan=";
		htmlArr[idx++] = ZmMailMsgView.ATTC_COLUMNS;
		htmlArr[idx++] = ">";
		htmlArr[idx++] = ZmMailMsgView._buildZipUrl(appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI), this._msg.id, attLinks);
		htmlArr[idx++] = "</td></tr>";
		rows++;
	}

	for (var i = 0; i < attLinks.length; i++) {
		var att = attLinks[i];

		if ((i % ZmMailMsgView.ATTC_COLUMNS) == 0) {
			if (i != 0)
				htmlArr[idx++] = "</tr>";
			htmlArr[idx++] = "<tr>";
			++rows;
		}

		htmlArr[idx++] = "<td>";
		htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='margin-right:1em; margin-bottom:1px'><tr>";
		htmlArr[idx++] = "<td style='width:18px'>";
		htmlArr[idx++] = AjxImg.getImageHtml(att.linkIcon, "position:relative;");
		htmlArr[idx++] = "</td><td style='white-space:nowrap'>";

		var linkArr = [];
		var j = 0;
		linkArr[j++] = att.isHit ? "<span class='AttName-matched'>" : "";
		linkArr[j++] = att.link;
		linkArr[j++] = AjxStringUtil.htmlEncode( AjxStringUtil.clipFile(att.label, 30) );
		linkArr[j++] = att.isHit ? "</a></span>" : "</a>";
		var link = linkArr.join("");

		// objectify if this attachment is an image
		if (att.objectify && this._objectManager) {
			this._lazyCreateObjectManager();
			var imgHandler = this._objectManager.getImageAttachmentHandler();
			idx = this._objectManager.generateSpan(imgHandler, htmlArr, idx, link, {url:att.url});
		} else {
			htmlArr[idx++] = link;
		}

		if (att.size || att.htmlLink || att.vcardLink || att.download || att.briefcaseLink) {
			htmlArr[idx++] = "&nbsp;(";
			if (att.size) {
				htmlArr[idx++] = att.size;
				if (att.htmlLink || att.vcardLink || att.briefcaseLink)
					htmlArr[idx++] = ", ";
			}
			if (att.htmlLink) {
				htmlArr[idx++] = att.htmlLink;
				htmlArr[idx++] = ZmMsg.viewAsHtml;
				htmlArr[idx++] = "</a>";
			} else if (att.vcardLink) {
				htmlArr[idx++] = att.vcardLink;
				htmlArr[idx++] = ZmMsg.addToAddrBook;
				htmlArr[idx++] = "</a>";
			}
			if (att.briefcaseLink) {
				if (att.htmlLink || att.vcardLink)
					htmlArr[idx++] = ", ";

				htmlArr[idx++] = att.briefcaseLink;
				htmlArr[idx++] = ZmMsg.addToBriefcase;
				htmlArr[idx++] = "</a>";
			}
			if (att.download) {
				if (att.size || att.htmlLink || att.vcardLink || att.briefcaseLink)
					htmlArr[idx++] = ", ";

				htmlArr[idx++] = att.download;
				htmlArr[idx++] = ZmMsg.download;
				htmlArr[idx++] = "</a>";
			}

			// Attachment Link Handlers
			if (ZmMailMsgView._attachmentHandlers) {
				var contentHandlers = ZmMailMsgView._attachmentHandlers[att.ct];
				var handlerFunc;
				if (contentHandlers) {
					for (handlerId in contentHandlers) {
						handlerFunc = contentHandlers[handlerId];
						if (handlerFunc) {
							htmlArr[idx++] = ", " + handlerFunc.call(this,att);
						}
					}
				}
			}

			htmlArr[idx++] = ")";
		}

		htmlArr[idx++] = "</td></tr></table>";
		htmlArr[idx++] = "</td>";
	}
	// limit display size.  seems like an attc. row has exactly 16px; we set it
	// to 56px so that it becomes obvious that there are more attachments.
    if (this._limitAttachments != 0 && rows > ZmMailMsgView._limitAttachments) {
	//Commented for bug 12995 if (ZmMailMsgView.LIMIT_ATTACHMENTS != 0 && rows > ZmMailMsgView.LIMIT_ATTACHMENTS) {
		htmlArr[dividx] = "<div style='height:";
		htmlArr[dividx] = this._attcMaxSize;//ZmMailMsgView.ATTC_MAX_SIZE;
		htmlArr[dividx] = "px; overflow:auto;' />";
	}
	htmlArr[idx++] = "</tr></table>";

    var attLinksDiv = document.getElementById(this._attLinksId);
    attLinksDiv.innerHTML = htmlArr.join("");
};

//AttachmentLink Handlers
ZmMailMsgView.prototype.addAttachmentLinkHandler = function(contentType,handlerId,handlerFunc){
	if(!ZmMailMsgView._attachmentHandlers){
		ZmMailMsgView._attachmentHandlers = {};
	}

	if(!ZmMailMsgView._attachmentHandlers[contentType]){
		ZmMailMsgView._attachmentHandlers[contentType] = {};
	}

	ZmMailMsgView._attachmentHandlers[contentType][handlerId] = handlerFunc;
};

// Listeners

ZmMailMsgView.prototype._inviteToolBarListener =
function(ev) {
	ev._inviteReplyType = ev.item.getData(ZmOperation.KEY_ID);
	ev._inviteComponentId = null;
	this.notifyListeners(ZmMailMsgView.REPLY_INVITE_EVENT, ev);
};

ZmMailMsgView.prototype._controlEventListener =
function(ev) {
	var iframe = document.getElementById(this._iframeId);
	// we get here before we have a chance to initialize the IFRAME
	if (iframe) {
		var act = new AjxTimedAction(null, ZmMailMsgView._resetIframeHeight, [this, iframe]);
		AjxTimedAction.scheduleAction(act, 5);
	}
};

ZmMailMsgView.prototype._shareToolBarListener =
function(ev) {
	ev._buttonId = ev.item.getData(ZmOperation.KEY_ID);
	ev._share = this._msg.share;
	this.notifyListeners(ZmMailMsgView.SHARE_EVENT, ev);
};

ZmMailMsgView.prototype._msgChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_MSG) { return; }
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		if (ev.source == this._msg && (appCtxt.getCurrentViewId() == ZmController.MSG_VIEW)) {
			this._controller._app.popView();
		}
	} else if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._setTags(this._msg);
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

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_COLOR])) {
		var tag = ev.getDetail("organizers")[0];
		var img = document.getElementById(this._tagCellId +  ZmDoublePaneView._TAG_IMG + tag.id);
		if (img)
			AjxImg.setImage(img, ZmTag.COLOR_ICON[tag.color]);
	}

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.MODIFY) {
		this._setTags(this._msg);
	}
};

ZmMailMsgView.prototype._expandButtonListener =
function(ev) {
	this._expandRows(!this._expandHeader);
};

ZmMailMsgView.prototype._expandRows =
function(expand) {
	this._expandHeader = expand;
	this._expandButton.setImage(expand ? "HeaderExpanded" : "HeaderCollapsed");

	var expandRow = document.getElementById(this._expandRowId);
	var table = expandRow.parentNode;
	if (!expand) {
		this._addressRows = [];
		while (expandRow.nextSibling) {
			var addressRow = expandRow.nextSibling;
			this._addressRows.push(addressRow);
			table.removeChild(addressRow);
		}
	}
	else if (this._addressRows) {
		for (var i = 0; i < this._addressRows.length; i++) {
			var addressRow = this._addressRows[i];
			table.appendChild(addressRow);
		}
		this._addressRows = null;
	}
	if (this._scrollWithIframe) {
		var iframe = document.getElementById(this._iframeId);
		if (iframe)
			ZmMailMsgView._resetIframeHeight(this, iframe);
	}
};

ZmMailMsgView.prototype._closeButtonListener =
function(ev) {
	this._controller._app.popView();
};


// Callbacks

ZmMailMsgView.prototype._msgTagClicked =
function(tagId) {
	var tag = appCtxt.getById(tagId);
	var query = 'tag:"' + tag.name + '"';
	var searchController = appCtxt.getSearchController();
	searchController.search({query: query});
};

ZmMailMsgView.prototype._handleMsgTruncated =
function() {
	var params = {
		sender: appCtxt.getAppController(),
		msgId: this._msg.id,
		getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
		callback: (new AjxCallback(this, this._handleResponseMsgTruncated)),
		noBusyOverlay: true,
		dontTruncate: true
	};
	ZmMailMsg.fetchMsg(params);
};

ZmMailMsgView.prototype._handleResponseMsgTruncated =
function(result) {
	// parse temp message (we dont want to cache a huge msg)
	var node = result.getResponse().GetMsgResponse.m[0];
	var msg = new ZmMailMsg(node.id, null, true);
	msg._loadFromDom(node);
	msg.showImages = this._msg.showImages;

	appCtxt.getPrintView().render(msg, true);
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

ZmMailMsgView.getPrintHtml =
function(msg, preferHtml, callback) {
	if (!(msg.toString() == "ZmMailMsg"))
		return;

	if (!msg._loaded) {
		var soapDoc = AjxSoapDoc.create("GetMsgRequest", "urn:zimbraMail", null);
		var msgNode = soapDoc.set("m");
		msgNode.setAttribute("id", msg.id);
		if (preferHtml)
			msgNode.setAttribute("html", "1");
		var respCallback = new AjxCallback(null, ZmMailMsgView._handleResponseGetPrintHtml, [msg, preferHtml, callback]);
		window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
	} else {
		if (callback)
			ZmMailMsgView._printMessage(msg, preferHtml, callback);
		else
			return ZmMailMsgView._printMessage(msg, preferHtml);
	}
};

ZmMailMsgView._handleResponseGetPrintHtml =
function(msg, preferHtml, callback, result) {
	var resp = result.getResponse().GetMsgResponse;
	msg._loadFromDom(resp.m[0]);
	ZmMailMsgView._printMessage(msg, preferHtml, callback);
};

ZmMailMsgView._printMessage =
function(msg, preferHtml, callback) {
	var html = [];
	var idx = 0;

	html[idx++] = "<div style='width: 100%; background-color: #EEEEEE'>";
	html[idx++] = "<table border=0 width=100%><tr>";

	// print SUBJECT and DATE
	html[idx++] = "<td><font size=+1>";
	html[idx++] = msg.subject;
	html[idx++] = "</font></td><td align=right><font size=+1>";
	html[idx++] = msg.sentDate
		? (new Date(msg.sentDate)).toLocaleString()
		: (new Date(msg.date)).toLocaleString();
	html[idx++] = "</font></td></tr></table>";
	html[idx++] = "<table border=0 width=100%>";

	// print all address types
	for (var j = 0; j < ZmMailMsg.ADDRS.length; j++) {
		var addrs = msg.getAddresses(ZmMailMsg.ADDRS[j]);
		var len = addrs.size();
		if (len > 0) {
			html[idx++] = "<tr><td valign=top style='text-align:right; font-size:14px'>";
			html[idx++] = ZmMsg[AjxEmailAddress.TYPE_STRING[ZmMailMsg.ADDRS[j]]];
			html[idx++] = ": </td><td width=100% style='font-size: 14px'>";
			for (var i = 0; i < len; i++) {
				html[idx++] = i > 0 ? AjxStringUtil.htmlEncode(AjxEmailAddress.SEPARATOR) : "";
				html[idx++] = addrs.get(i).address;
			}
			html[idx++] = "</td></tr>";
		}
	}

	// bug fix# 3928
	var attachments = msg.getAttachments();
	for (var i = 0; i < attachments.length; i++) {
		var attach = attachments[i];
		if (!msg.isRealAttachment(attach))
			continue;

		var label = attach.name || attach.filename || (ZmMsg.unknown + " <" + attach.ct + ">");

		// get size info in any
		var sizeText = "";
		var size = attach.s;
		if (size && size > 0) {
		    if (size < 1024)		sizeText = " (" + size + "B)&nbsp;";
            else if (size < 1024^2)	sizeText = " (" + Math.round((size/1024) * 10) / 10 + "KB)&nbsp;";
            else 					sizeText = " (" + Math.round((size / (1024*1024)) * 10) / 10 + "MB)&nbsp;";
		}

		html[idx++] = "<tr><td style='font-size:14px'>";
		if (i == 0) {
			html[idx++] = ZmMsg.attachments;
			html[idx++] = ":";
		}
		html[idx++] = "</td><td valign=top style='font-size:13px'>";
		html[idx++] = AjxStringUtil.htmlEncode(label);
		html[idx++] = "&nbsp;";
		html[idx++] = sizeText;
		html[idx++] = "</td></tr>";
	}

	html[idx++] = "</table>";
	html[idx++] = "</div><div style='padding: 10px; font-size: 12px'>";

	// finally, print content
	var bodyParts = msg.getBodyParts();
	for (var i = 0; i < bodyParts.length; i++) {
		var content = "";
		var bodyPart = bodyParts[i];
		if (bodyPart.ct == ZmMimeTable.TEXT_HTML && preferHtml) {
			html[idx++] = ZmMailMsgView._fixMultipartRelatedImagesInContent(msg, bodyPart.content);
		} else {
			if (ZmMimeTable.isRenderableImage(bodyPart.ct)) {
				html[idx++] = "<img class='InlineImage' src='";
				html[idx++] = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
				html[idx++] = "&id=";
				html[idx++] = msg.id;
				html[idx++] = "&part=";
				html[idx++] = bodyPart.part;
				html[idx++] = "'>";
			} else {
				if (bodyPart.ct != ZmMimeTable.TEXT_PLAIN) {
					content = msg.getTextPart();
					if (!content && bodyPart.content && bodyPart.ct == ZmMimeTable.TEXT_HTML) {
						var div = document.createElement("div");
						div.innerHTML = bodyPart.content;
						content = AjxStringUtil.convertHtml2Text(div);
					}
				} else {
					content = bodyPart.content;
				}
				html[idx++] = "<span style='font-family: courier'>";
				html[idx++] = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(content, true));
				html[idx++] = "</span>";
			}
		}
	}

	html[idx++] = "</div>";

	if (callback) {
		var result = new ZmCsfeResult(html.join(""));
		callback.run(result);
	} else {
		return html.join("");
	}
};

ZmMailMsgView._fixMultipartRelatedImagesInContent = function(msg,content){
    var inlineImgs = content.match(/dfsrc=\"cid:\w*\"/ig);
    if(inlineImgs){
        for(var i=0; i<inlineImgs.length; i++){
            var dfsrc = inlineImgs[i];
            var tmp =   dfsrc.split(':');
            var cid = tmp[1].substring(0,tmp[1].length-1);
            var src = msg.getContentPartAttachUrl(ZmMailMsg.CONTENT_PART_ID, ("<" + cid + ">"));
            if(src){
                content = content.replace(dfsrc,"src='"+ src +"'");
            }
        }
    }
    return content;
};

ZmMailMsgView._swapIdAndSrc =
function (image, i, len, msg, idoc, iframe, view) {
	image.src = image.getAttribute("dfsrc");
	if (i == len - 1) {
        if(msg)
            msg.setHtmlContent(idoc.documentElement.innerHTML);
		view._resetIframeHeightOnTimer(iframe);
	}
};

ZmMailMsgView.prototype._onloadIframe =
function(dwtIframe) {
	var iframe = dwtIframe.getIframe();
	iframe.onload = null;
	ZmMailMsgView._resetIframeHeight(this, iframe);
};

ZmMailMsgView._resetIframeHeight =
function(self, iframe) {
	var h;
	if (self._scrollWithIframe) {
		h = self.getH() - 7;
		function substract(el) {
			if (el) {
				if (typeof el == "string")
					el = document.getElementById(el);
				if (el)
					h -= Dwt.getSize(el).y;
			}
		};
		substract(self._hdrTableId);
		substract(self._displayImagesId);
		substract(self._highlightObjectsId);
		if (self._inviteToolbar)
			substract(self._inviteToolbar.getHtmlElement());
		iframe.style.height = h + "px";
	} else {
		try {
			if (!iframe.contentWindow) {
                                self._resetIframeHeightOnTimer(iframe);
                        }
		} catch(ex) {
			self._resetIframeHeightOnTimer(iframe); // for IE
		}

		var doc = iframe.contentWindow.document;

		// first off, make it wide enough to fill ZmMailMsgView.
		iframe.style.width = "100%"; // *** changes height!

		// wait, are we too high? (bug 21037)
		if (AjxEnv.isGeckoBased &&
			Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) > 30000) {
			self.setScrollWithIframe(true);
			return;
		}

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
		h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);

		iframe.style.height = h + "px";
	}
};

// note that IE doesn't seem to be able to reset the "scrolling" attribute.
// this function isn't safe to call for IE!
ZmMailMsgView.prototype.setScrollWithIframe =
function(val) {
	this._scrollWithIframe = val;
    this._limitAttachments = this._scrollWithIframe ? 3 : 0; //making it local
    this._attcMaxSize = this._limitAttachments * 16 + 8;

    this.setScrollStyle(val ? DwtControl.CLIP : DwtControl.SCROLL);
	var iframe = document.getElementById(this._iframeId);
	if (iframe) {
		iframe.style.width = "100%";
		iframe.scrolling = val;
		ZmMailMsgView._resetIframeHeight(this, iframe);
	}
};

ZmMailMsgView._tagClick =
function(myId, tagId) {
	var dwtObj = Dwt.getObjectFromElement(document.getElementById(myId));
	dwtObj.notifyListeners(ZmMailMsgView._TAG_CLICK, tagId);
};

ZmMailMsgView._detachCallback =
function(result) {
	var resp = result.getResponse().GetMsgResponse;
	var msg = new ZmMailMsg(resp.m[0].id, null, true);	// do not cache this temp msg
	msg._loadFromDom(resp.m[0]);
	// bug fix #8868 - force load for rfc822 msgs since they may not return any content
	msg._loaded = true;

	ZmMailMsgView.detachMsgInNewWindow(msg);
};

ZmMailMsgView.detachMsgInNewWindow =
function(msg) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var newWinObj = appCtxt.getNewWindow(true);
	newWinObj.command = "msgViewDetach";
	newWinObj.params = { msg:msg };
};

ZmMailMsgView.rfc822Callback =
function(msgId, msgPartId) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
	var sender = appCtxt.getAppController();
	var callback = new AjxCallback(null, ZmMailMsgView._detachCallback);
	ZmMailMsg.fetchMsg({ sender:sender, msgId:msgId, partId:msgPartId, getHtml:getHtml, callback:callback });
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
		contact.initFromEmail(addr);
		AjxDispatcher.run("GetContactController").show(contact);
	}
};

ZmMailMsgView.vcardCallback =
function(msgId, vcardPartId) {
	ZmZimbraMail.unloadHackCallback();

	var appCtxt = window.parentAppCtxt || window.appCtxt;
	appCtxt.getApp(ZmApp.CONTACTS).createFromVCard(msgId, vcardPartId);
};

ZmMailMsgView._buildZipUrl =
function(csfeUrl, itemId, attachments) {
	var url = csfeUrl + "&id=" + itemId + "&part=";
	for (var j = 0; j < attachments.length; j++) {
		url += attachments[j].part;
		if (j <= attachments.length) {
			url += ",";
		}
	}

	return AjxTemplate.expand("mail.Message#DownloadAll", {url:url});
};

ZmMailMsgView.briefcaseCallback =
function(msgId, partId, name) {
	ZmZimbraMail.unloadHackCallback();

	var appCtxt = window.parentAppCtxt || window.appCtxt;
	appCtxt.getApp(ZmApp.BRIEFCASE).createFromAttachment(msgId, partId, name);
};
