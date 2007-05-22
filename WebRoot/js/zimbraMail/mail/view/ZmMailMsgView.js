/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
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
	this._tagRowId = Dwt.getNextId();
	this._tagCellId = Dwt.getNextId();
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	// expand/collapse vars
	this._expandHeader = true;
	this._expandDivId = Dwt.getNextId();

	// do we add a close button in the header section?
	this._hasHeaderCloseBtn = (this._mode == ZmController.MSG_VIEW && !this._controller.isChildWindow);

	this.setScrollStyle(ZmMailMsgView.SCROLL_WITH_IFRAME ? DwtControl.CLIP : DwtControl.SCROLL);

	if (!controller.isChildWindow) {
		// Add change listener to taglist to track changes in tag color
		this._tagList = this._appCtxt.getTagTree();
		this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
		this.addListener(ZmMailMsgView._TAG_CLICK, new AjxListener(this, this._msgTagClicked));
	}

	this._setMouseEventHdlrs(); // needed by object manager

	// XXX: for now, turn off object handling in new window
	if (!controller.isChildWindow) {
		this._objectManager = true;
	}

	this._changeListener = new AjxListener(this, this._msgChangeListener);
	this.addListener(DwtEvent.ONSELECTSTART, new AjxListener(this, this._selectStartListener));
	this.addListener(DwtEvent.CONTROL, new AjxListener(this, this._controlEventListener));
	this._setAllowSelection();
}

ZmMailMsgView.prototype = new DwtComposite;
ZmMailMsgView.prototype.constructor = ZmMailMsgView;


// Consts

ZmMailMsgView.SCROLL_WITH_IFRAME = false;
ZmMailMsgView.LIMIT_ATTACHMENTS = ZmMailMsgView.SCROLL_WITH_IFRAME ? 3 : 0;
ZmMailMsgView.ATTC_COLUMNS = 2;
ZmMailMsgView.ATTC_MAX_SIZE = ZmMailMsgView.LIMIT_ATTACHMENTS * 16 + 8;

ZmMailMsgView.QUOTE_DEPTH_MOD 	= 3;
ZmMailMsgView.MAX_SIG_LINES 	= 8;
ZmMailMsgView.SIG_LINE 			= /^(- ?-+)|(__+)\r?$/;
ZmMailMsgView._inited 			= false;
ZmMailMsgView._TAG_CLICK 		= "ZmMailMsgView._TAG_CLICK";
ZmMailMsgView._TAG_ANCHOR 		= "TA";
ZmMailMsgView._TAG_IMG 			= "TI";
ZmMailMsgView.OBJ_SIZE_TEXT 	= 50; // max. size of text emails that will automatically highlight objects
ZmMailMsgView.OBJ_SIZE_HTML 	= 50; // similar for HTML emails.
ZmMailMsgView.REPLY_INVITE_EVENT= "inviteReply";
ZmMailMsgView.SHARE_EVENT 		= "share";


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
	this.getHtmlElement().innerHTML = "";
	if (this._objectManager && this._objectManager.reset)
		this._objectManager.reset();
};

ZmMailMsgView.prototype.preventSelection =
function() {
	return false;
};

ZmMailMsgView.prototype.set =
function(msg) {
	if (this._msg && (this._msg.id == msg.id)) return;

	this.reset();
	var contentDiv = this.getHtmlElement();
	var oldMsg = this._msg;
	this._msg = msg;
	this._dateObjectHandlerDate = msg.sentDate
		? new Date(msg.sentDate)
		: new Date(msg.date);

	if ((this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) &&
		msg.isInvite() && msg.getInvite().type != "task" && 
		!this._controller.isChildWindow)
	{
		var invite = msg.getInvite();
		if (!invite.isEmpty() && !invite.hasMultipleComponents() &&
			invite.getStatus() != ZmCalItem.STATUS_CANC &&
			msg.folderId != ZmFolder.ID_TRASH &&
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
	else if (this._appCtxt.get(ZmSetting.SHARING_ENABLED) &&
			 msg.share &&
			 msg.folderId != ZmFolder.ID_TRASH)
	{
		var action = msg.share.action;
        var isNew = action == ZmShare.NEW;
        var isEdit = action == ZmShare.EDIT;
        if ((isNew || (isEdit && !this.__hasMountpoint(msg.share))) && msg.share.link.perm) {
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
	var tree = this._appCtxt.getFolderTree();
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
	return [ZmMsg.zimbraTitle, ": ", this._msg.subject].join("");
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
	// TODO: reuse the toolbar
	if (this._inviteToolbar)
		this._inviteToolbar.dispose();

	var operationButtonIds = [ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_TENTATIVE, ZmOperation.REPLY_DECLINE];
	var replyButtonIds = [ZmOperation.INVITE_REPLY_ACCEPT,ZmOperation.INVITE_REPLY_TENTATIVE,ZmOperation.INVITE_REPLY_DECLINE];
	var params = {parent:this, buttons:operationButtonIds, posStyle:DwtControl.STATIC_STYLE,
				  className:"ZmInviteToolBar", buttonClassName:"DwtToolbarButton"};
	this._inviteToolbar = new ZmButtonToolBar(params);
	// get a little space between the buttons.
	var toolbarHtmlEl = this._inviteToolbar.getHtmlElement();
	toolbarHtmlEl.firstChild.cellPadding = "3";

	var inviteToolBarListener = new AjxListener(this, this._inviteToolBarListener);
	operationButtonIds = this._inviteToolbar.opList;
	for (var i = 0; i < operationButtonIds.length; i++) {
		var id = operationButtonIds[i];

		// HACK for IE, which doesn't support multiple classnames. If I
		// just change the styles, the activated class overrides the basic
		// activated class definition, thus I have to change what the
		// activated class name will be for the buttons in the toolbar.
		var button = this._inviteToolbar.getButton(id);
		button._activatedClassName = button._className + "-" + DwtCssStyle.ACTIVATED;
		button._triggeredClassName = button._className + "-" + DwtCssStyle.TRIGGERED;

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
	// TODO: reuse the toolbar
	if (this._shareToolbar)
		this._shareToolbar.dispose();

	var buttonIds = [ZmOperation.SHARE_ACCEPT, ZmOperation.SHARE_DECLINE];
	var params = {parent:this, buttons:buttonIds, posStyle:DwtControl.STATIC_STYLE,
				  className:"ZmShareToolBar", buttonClassName:"DwtToolbarButton"};
	this._shareToolbar = new ZmButtonToolBar(params);
	// get a little space between the buttons.
	var toolbarHtmlEl = this._shareToolbar.getHtmlElement();
	toolbarHtmlEl.firstChild.cellPadding = "3";

	var shareToolBarListener = new AjxListener(this, this._shareToolBarListener);
	for (var i = 0; i < buttonIds.length; i++) {
		var id = buttonIds[i];

		// HACK for IE, which doesn't support multiple classnames. If I
		// just change the styles, the activated class overrides the basic
		// activated class definition, thus I have to change what the
		// activated class name will be for the buttons in the toolbar.
		var b = this._shareToolbar.getButton(id);
		b._activatedClassName = b._className + "-" + DwtCssStyle.ACTIVATED;
		b._triggeredClassName = b._className + "-" + DwtCssStyle.TRIGGERED;

		this._shareToolbar.addSelectionListener(id, shareToolBarListener);
	}

	return this._shareToolbar;
};

ZmMailMsgView.prototype._handleResponseSet =
function(msg, oldMsg) {
	if (!this._controller.isChildWindow) {
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
	if (this._appCtxt.zimletsPresent()) {
		this._appCtxt.getZimletMgr().notifyZimlets("onMsgView", msg, oldMsg);
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
	if(this._objectManager === true) {
		DBG.println(AjxDebug.DBG2, "Create new ZmObjectManager");
		// this manages all the detected objects within the view
		this._objectManager = new ZmObjectManager(this, this._appCtxt);
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

// Dives recursively into the given DOM node.  Creates ObjectHandlers in text
// nodes and cleans the mess in element nodes.  Discards by default "script",
// "link", "object", "style", "applet" and "iframe" (most of them shouldn't
// even be here since (1) they belong in the <head> and (2) are discarded on
// the server-side, but we check, just in case..).
ZmMailMsgView.prototype._processHtmlDoc =
function(doc) {
	DBG.timePt("Starting ZmMailMsgView.prototype._processHtmlDoc");

	// var T1 = new Date().getTime();
	this._lazyCreateObjectManager();
	var objectManager = this._objectManager,
		tmpdiv = doc.createElement("div"),
		node = doc.body;

	// This inner function does the actual work.  BEWARE that it return-s
	// in various places, not only at the end.
	function recurse(node, handlers, self) {
		var tmp, i, val;
		switch (node.nodeType) {
		    case 1:	// ELEMENT_NODE
			node.normalize();
			tmp = node.tagName.toLowerCase();
			if (/^(img|a)$/.test(tmp)) {
				if (tmp == "a" && node.target
				    && (ZmMailMsgView._URL_RE.test(node.href)
					|| ZmMailMsgView._MAILTO_RE.test(node.href)))
				{
					if (node.firstChild && node.firstChild.tagName &&
						node.firstChild.tagName.toLowerCase() == "img")
					{
						self._checkImgInAttachments(node.firstChild);
					}
					// tricky.
					var txt = RegExp.$1;
					tmp = doc.createElement("div");
					tmp.innerHTML = objectManager.findObjects(AjxStringUtil.trim(RegExp.$1));
					tmp = tmp.firstChild;
					if (tmp.nodeType == 3 /* Node.TEXT_NODE */) {
						// probably no objects were found.  A warning would be OK here
						// since the regexps guarantee that objects _should_ be found.
						// DBG.println(AjxDebug.DBG1, "No objects found for potentially valid text!");
						return tmp.nextSibling;
					}
					// here, tmp is an object span, but it
					// contains the URL (href) instead of
					// the original link text.
					node.parentNode.insertBefore(tmp, node); // add it to DOM
					tmp.innerHTML = "";
					tmp.appendChild(node); // we have the original link now
					return tmp.nextSibling;	// move on
				} else if (tmp == "img") {
					self._checkImgInAttachments(node);
				}
				handlers = false;
			} else if (/^(script|link|object|iframe|applet)$/.test(tmp)) {
				tmp = node.nextSibling;
				node.parentNode.removeChild(node);
				return tmp;
			}
			// fix style
			// node.nowrap = "";
			// node.className = "";

			if (AjxEnv.isIE)
				// strips expression()-s, bwuahahaha!
				// granted, they get lost on the server-side anyway, but assuming some get through...
				// the line below exterminates them.
				node.style.cssText = node.style.cssText;

			// Clear dangerous rules.  FIXME: implement proper way
			// using removeAttribute (kind of difficult as it's
			// (expectedly) quite different in IE from *other*
			// browsers, so for now style.prop="" will do.)
			tmp = ZmMailMsgView._dangerousCSS;
			for (i in tmp) {
				val = tmp[i];
				if (!val || val.test(node.style[i]))
					node.style[i] = "";
			}
			for (i = node.firstChild; i; i = recurse(i, handlers, self));
			return node.nextSibling;

		    case 3:	// TEXT_NODE
		    case 4:	// CDATA_SECTION_NODE (just in case)
			// generate ObjectHandler-s
			if (handlers && /[^\s\xA0]/.test(node.data)) try {
 				var a = null, b = null;

				if (!AjxEnv.isIE) {
					// this block of code is supposed to free the object handlers from
					// dealing with whitespace.  However, IE sometimes crashes here, for
					// reasons that weren't possible to determine--hence we avoid this
					// step for IE.  (bug #5345)
					var results = /^[\s\xA0]+/.exec(node.data);
					if (results) {
						a = node;
						node = node.splitText(results[0].length);
					}
					results = /[\s\xA0]+$/.exec(node.data);
					if (results)
						b = node.splitText(node.data.length - results[0].length);
				}

				tmp = tmpdiv;
				var code = objectManager.findObjects(node.data, true, null, false);
				var disembowel = false;
				if (AjxEnv.isIE) {
					// Bug #6481, #4498: innerHTML in IE massacrates whitespace
					//            unless it sees a <pre> in the code.
					tmp.innerHTML = [ "<pre>", code, "</pre>" ].join("");
					disembowel = true;
				} else {
					tmp.innerHTML = code;
				}

				if (a)
					tmp.insertBefore(a, tmp.firstChild);
				if (b)
					tmp.appendChild(b);

				a = node.parentNode;
				if (disembowel)
					tmp = tmp.firstChild;
				while (tmp.firstChild)
					a.insertBefore(tmp.firstChild, node);
				tmp = node.nextSibling;
				a.removeChild(node);
				return tmp;
			} catch(ex) {};
		}
		return node.nextSibling;
	};
	var df = doc.createDocumentFragment();
	while (node.firstChild) {
		df.appendChild(node.firstChild); // NODE now out of the displayable DOM
		recurse(df.lastChild, true, this);	 // parse tree and findObjects()
	}
	node.appendChild(df);	// put nodes back in the document

	DBG.timePt("-- END _processHtmlDoc");

	// bug fix #8632 - finally, set the attachment links
	this._setAttachmentLinks();
};

ZmMailMsgView.prototype._checkImgInAttachments =
function(img) {
	var attachments = this._msg.getAttachments();
	var csfeMsgFetch = this._appCtxt.getCsfeMsgFetcher();

	for (var i = 0; i < attachments.length; i++) {
		var att = attachments[i];

		if (att.foundInMsgBody) continue;

		var src = img.getAttribute("src") || img.getAttribute("dfsrc");
		if (src && src.indexOf(csfeMsgFetch) == 0) {
			var mpId = src.substring(src.lastIndexOf("=")+1);
			if (mpId == att.part) {
				att.foundInMsgBody = true;
				break;
			}
		} else if (att.cl) {
			var filename = src.substring(src.lastIndexOf("/")+1);
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
	var func = function () {
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
		msg.setHtmlContent(this._htmlBody);
		msg.showImages = true;
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
		self._highlightObjectsId = Dwt.getNextId();
		var div = document.createElement("div");
		div.className = "DisplayImages";
		div.id = self._highlightObjectsId;
		div.innerHTML =
			[ "<table cellspacing='0' cellpadding='0'><tr><td style='width:20px'>",
			  AjxImg.getImageHtml("Status") + "</td><td>",
			  ZmMsg.objectsNotDisplayed,
			  " <span style='font: inherit; color:blue; text-decoration:underline'>",
			  ZmMsg.hiliteObjects,
			  "</span></td></tr></table>" ].join("");
		self.getHtmlElement().appendChild(div);
		Dwt.setHandler(div, DwtEvent.ONCLICK, func);
	})();
};

ZmMailMsgView.prototype._makeIframeProxy =
function(container, html, isTextMsg) {
	// bug fix #4943
	if (html == null) html = "";

	var displayImages;
	if (!isTextMsg &&
		(this._msg == null || (this._msg && !this._msg.showImages)) &&
		/<img/i.test(html))
	{
		displayImages = document.createElement("div");
		displayImages.className = "DisplayImages";
		displayImages.id = this._displayImagesId;
		displayImages.innerHTML =
			[ "<table width='100%' cellspacing='0' cellpadding='0'><tr><td style='width:20px'>",
			  AjxImg.getImageHtml("Status") + "</td><td>",
			  ZmMsg.externalImages,
			  " <span style='font: inherit; color:blue; text-decoration:underline'>",
			  ZmMsg.displayExternalImages,
			  "</span></td></tr></table>" ].join("");
		container.appendChild(displayImages);
	}

	var callback = null;
	var msgSize = html.length / 1024;
	if (isTextMsg) {
		if (this._objectManager) {
			if (msgSize <= ZmMailMsgView.OBJ_SIZE_TEXT) {
				// better process objects directly rather than scanning the DOM afterwards.
				this._lazyCreateObjectManager();
				DBG.timePt("START: small text msg -- findObjects");
				html = this._objectManager.findObjects(html, true, null, true);
				DBG.timePt("END: small text msg -- findObjects");
				html = AjxStringUtil.nl2br(html);
			} else {
				this._makeHighlightObjectsDiv(html);
				html = AjxStringUtil.convertToHtml(html);
			}
		} else {
			// we get here when viewing text attachments
			// and we need to HTMLize the text message in
			// order to be displayed correctly (bug 8714).
			html = AjxStringUtil.convertToHtml(html);
		}
	} else {
		html = html.replace(/<!--(.|\n)*?-->/g, ""); // remove comments
		if (this._objectManager) {
			// this callback will post-process the HTML after the IFRAME is created
			if (msgSize <= ZmMailMsgView.OBJ_SIZE_HTML)
				callback = new AjxCallback(this, this._processHtmlDoc);
			else
				this._makeHighlightObjectsDiv();
		}
	}

	// bug fix #9475 - IE isnt resolving MsgBody class in iframe so set styles explicitly
	var inner_styles = AjxEnv.isIE ? ".MsgBody-text, .MsgBody-text * { font: 10pt monospace; }" : "";
	var params = {parent: this, className: "MsgBody", hidden: true, html: html,
				  styles: inner_styles, noscroll: !ZmMailMsgView.SCROLL_WITH_IFRAME,
				  posStyle: DwtControl.STATIC_STYLE, processHtmlCallback: callback,
				  useKbMgmt: true};
	var ifw = new DwtIframe(params);
	this._iframeId = ifw.getIframe().id;

	var idoc = ifw.getDocument();

	if (AjxEnv.isGeckoBased) {
		// patch local links
		var geckoScrollCallback = AjxCallback.simpleClosure(
			// pass null as the object, so that it gets called in the context of the link
			ZmMailMsgView.__localLinkClicked, null, this);
		var links = idoc.getElementsByTagName("a");
		for (var i = links.length; --i >= 0;) {
			var link = links[i];
			if (!link.target) {
				// has chances to be a local link
				link.onclick = geckoScrollCallback;
			}
		}
	}

	// assign the right class name to the iframe body
	idoc.body.className = isTextMsg
		? "MsgBody MsgBody-text"
		: "MsgBody MsgBody-html";

	ifw.getIframe().onload = AjxCallback.simpleClosure(ZmMailMsgView._resetIframeHeight, ZmMailMsgView, this, ifw.getIframe());

	// import the object styles
	var head = idoc.getElementsByTagName("head")[0];
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
		} else if (this._msg && this._msg.showImages) {
			var func = this._createDisplayImageClickClosure(this._msg, idoc, this._displayImagesId, ifw.getIframe());
			func.call();
		}
	}

	if (isTextMsg || this._controller.isChildWindow) {
		this._setAttachmentLinks();
	}

	// set height of view according to height of iframe on timer
	var args = [this, ifw.getIframe()];
	var act = new AjxTimedAction(null, ZmMailMsgView._resetIframeHeight, args);
	AjxTimedAction.scheduleAction(act, 5);
};

ZmMailMsgView.prototype._addAddressHeaderHtml =
function(htmlArr, idx, addrs, prefix) {
	htmlArr[idx++] = "<tr><td width=100 valign='top' class='LabelColName'>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(prefix);
	htmlArr[idx++] = ": </td><td class='LabelColValue'>";
	for (var i = 0; i < addrs.size(); i++) {
		if (i > 0)
			htmlArr[idx++] = AjxStringUtil.htmlEncode(AjxEmailAddress.SEPARATOR);

		var addr = addrs.get(i);
		if (this._objectManager && addr.address) {
			this._lazyCreateObjectManager();
			htmlArr[idx++] = this._objectManager.findObjects(addr, true, ZmObjectManager.EMAIL);
		} else {
			htmlArr[idx++] = addr.address ? addr.address : (AjxStringUtil.htmlEncode(addr.name));
		}
	}
   	htmlArr[idx++] = "</td></tr>";

	return idx;
};

ZmMailMsgView.prototype._renderMessage =
function(msg, container, callback) {
	if (this._objectManager) {
		this._lazyCreateObjectManager();
		this._objectManager.setHandlerAttr(ZmObjectManager.DATE,
	    								   ZmObjectManager.ATTR_CURRENT_DATE,
	    								   this._dateObjectHandlerDate);
	}

	var closeBtnCellId = Dwt.getNextId();
	this._hdrTableId = Dwt.getNextId();
	this._expandRowId = Dwt.getNextId();
	this._expandHeaderId = Dwt.getNextId();

	var idx = 0;
	var htmlArr = new Array();

	htmlArr[idx++] = "<table border=0 class='MsgHeaderTable' id='";
	htmlArr[idx++] = this._hdrTableId;
	htmlArr[idx++] = "' cellspacing=0 cellpadding=0 border=0 width=100%>";

	// Subject
	var subject = msg.getSubject() || ZmMsg.noSubject;
	htmlArr[idx++] = "<tr><td width=100 class='SubjectCol LabelColName' valign=top>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(ZmMsg.subject);
	htmlArr[idx++] = ": </td><td colspan=3>";
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=100%><tr><td class='SubjectCol LabelColValue'>";
	htmlArr[idx++] = this._objectManager ? this._objectManager.findObjects(subject, true) : subject;
	htmlArr[idx++] = "</td>";
	if (this._hasHeaderCloseBtn) {
		htmlArr[idx++] = "<td width=1% id='";
		htmlArr[idx++] = closeBtnCellId;
		htmlArr[idx++] = "'></td><td>&nbsp;</td>"; // add extra cell for padding since CSS does not play well in IE
	}
	htmlArr[idx++] = "</tr></table>";
	htmlArr[idx++] = "</td></tr>";

	// bug fix #10652 - check invite if sentBy is set (which means on-behalf-of)
	var sentBy = msg.getAddress(AjxEmailAddress.SENDER);
	var addr = msg.getAddress(AjxEmailAddress.FROM) || ZmMsg.unknown; 
	var dateString = msg.sentDate ? (new Date(msg.sentDate)).toLocaleString() : "";

	// add non-collapsable header info (Sent by and date)
	htmlArr[idx++] = "<tr id='";
	htmlArr[idx++] = this._expandRowId;
	htmlArr[idx++] = "'><td valign=middle>";
	htmlArr[idx++] = "<table align=right border=0 cellpadding=0 cellspacing=0><tr><td id='";
	htmlArr[idx++] = this._expandHeaderId;
	htmlArr[idx++] = "'></td><td class='LabelColName'>";
	htmlArr[idx++] = ZmMsg.sentBy;
	htmlArr[idx++] = ": </td></tr></table></td>";
	htmlArr[idx++] = "<td class='LabelColValue'>";
	if (addr instanceof AjxEmailAddress) {
		addr = addr.address || (AjxStringUtil.htmlEncode(addr.name));
	}
	htmlArr[idx++] = this._objectManager
		? this._objectManager.findObjects((sentBy || addr), true, ZmObjectManager.EMAIL)
		: (sentBy || addr);
	htmlArr[idx++] = "&nbsp;&nbsp;<span class='LabelColName'>";
	htmlArr[idx++] = ZmMsg.on;
	htmlArr[idx++] = ": </span><span class='LabelColValue'>";
	htmlArr[idx++] = this._objectManager
		? this._objectManager.findObjects(dateString, true, ZmObjectManager.DATE)
		: dateString;
	htmlArr[idx++] = "</span></td></tr>";

	if (sentBy) {
		// on behalf of (if applicable)
		htmlArr[idx++] = "<tr><td width=100 valign='top' class='LabelColName'>";
		htmlArr[idx++] = ZmMsg.onBehalfOf;
		htmlArr[idx++] = ":</td><td class='LabelColValue'>";
		htmlArr[idx++] = this._objectManager
			? this._objectManager.findObjects(addr, true, ZmObjectManager.EMAIL)
			: addr;
		htmlArr[idx++] = "</td></tr>";
	}

	// To/CC/Reply-to
	for (var i = 1; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		if (type == AjxEmailAddress.SENDER) continue;
		var addrs = msg.getAddresses(type);
		if (addrs.size() > 0) {
			var prefix = ZmMsg[AjxEmailAddress.TYPE_STRING[type]];
			idx = this._addAddressHeaderHtml(htmlArr, idx, addrs, prefix);
		}
	}

	htmlArr[idx++] = "</table>";
	var el = container ? container : this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(htmlArr.join("")));

	// add the expand/collapse arrow button now that we have add to the DOM tree
	var expandHeaderEl = document.getElementById(this._expandHeaderId);
	if (expandHeaderEl) {
		this._expandButton = new DwtToolBarButton(this);
		var image = this._expandHeader ? "HeaderExpanded" : "HeaderCollapsed";
		this._expandButton.setImage(image);
		this._expandButton.reparentHtmlElement(this._expandHeaderId);
		this._expandButton.addSelectionListener(new AjxListener(this, this._expandButtonListener))
	}

	this._expandRows(this._expandHeader);

	// add the close button if applicable
	if (this._hasHeaderCloseBtn) {
		this._closeButton = new DwtButton(this, null, "DwtToolbarButton");
		this._closeButton.setImage("Close");
		this._closeButton.setText(ZmMsg.close);
		this._closeButton.reparentHtmlElement(closeBtnCellId);
		this._closeButton.addSelectionListener(new AjxListener(this, this._closeButtonListener));
	}

	var bodyPart = msg.getBodyPart();
	if (bodyPart) {
		if (bodyPart.ct == ZmMimeTable.TEXT_HTML && this._appCtxt.get(ZmSetting.VIEW_AS_HTML)) {
			this._makeIframeProxy(el, bodyPart.content, false);
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
				this._makeIframeProxy(el, bodyPart.content, true);
			}
		}
	} else {
		this._setAttachmentLinks();
	}

	if (callback)
		callback.run();
};

ZmMailMsgView.prototype._handleResponseRenderMessage =
function(el, bodyPart, callback, result) {
	var content = result.getResponse();

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

	this._makeIframeProxy(el, (content || ""), true);
}

ZmMailMsgView.prototype._setTags =
function(msg) {
	if (!this._appCtxt.get(ZmSetting.TAGGING_ENABLED) || msg == null)
		return;

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
	var ta = new Array();
	for (var i = 0; i < numTags; i++)
		ta[i] = this._tagList.getById(msg.tags[i]);
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
			html[i++] = AjxImg.getImageHtml(ZmTag.COLOR_MINI_ICON[tag.color], null, ["id='", imageId, "'"].join(""));
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
			html[i++] = AjxImg.getImageHtml(ZmTag.COLOR_MINI_ICON[tag.color], null, ["id='", imageId, "'"].join(""));
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
	if (attLinks.length == 0)
		return;

	var headerTable = document.getElementById(this._hdrTableId);
	var row = headerTable.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.width = "100";
	cell.className = "LabelColName";
	cell.innerHTML = ZmMsg.attachments + ":";

	cell = row.insertCell(-1);
	cell.colSpan = 3;

	var htmlArr = new Array();
	var idx = 0;

	var dividx = idx;	// we might get back here
	htmlArr[idx++] = "<div style='overflow: auto;'>";
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0>";

	var rows = 0;
	if (attLinks.length > 1) {
		htmlArr[idx++] = "<tr><td colspan=";
		htmlArr[idx++] = ZmMailMsgView.ATTC_COLUMNS;
		htmlArr[idx++] = ">";
		idx = ZmMailMsgView._buildZipUrl(this._appCtxt.getCsfeMsgFetcher(), this._msg.id, attLinks, htmlArr, idx);
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
		linkArr[j++] = AjxStringUtil.htmlEncode(att.label);
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

		if (att.size || att.htmlLink || att.vcardLink || att.download) {
			htmlArr[idx++] = "&nbsp;(";
			if (att.size) {
				htmlArr[idx++] = att.size;
				if (att.htmlLink || att.vcardLink)
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

			if (att.download) {
				if (att.size || att.htmlLink || att.vcardLink)
					htmlArr[idx++] = ", ";

				htmlArr[idx++] = att.download;
				htmlArr[idx++] = ZmMsg.download;
				htmlArr[idx++] = "</a>";
			}
			htmlArr[idx++] = ")";
		}

		htmlArr[idx++] = "</td></tr></table>";
		htmlArr[idx++] = "</td>";
	}
	// limit display size.  seems like an attc. row has exactly 16px; we set it
	// to 56px so that it becomes obvious that there are more attachments.
	if (ZmMailMsgView.LIMIT_ATTACHMENTS != 0 && rows > ZmMailMsgView.LIMIT_ATTACHMENTS) {
		htmlArr[dividx] = "<div style='height:";
		htmlArr[dividx] = ZmMailMsgView.ATTC_MAX_SIZE;
		htmlArr[dividx] = "px; overflow:auto;' />";
	}
	htmlArr[idx++] = "</tr></table></div>";

	cell.innerHTML = htmlArr.join("");
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
	if (ev.type != ZmEvent.S_MSG)
		return;
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._msg);
};

ZmMailMsgView.prototype._selectStartListener =
function(ev) {
	// reset mouse event to propagate event to browser (allows text selection)
	ev._stopPropagation = false;
	ev._returnValue = true;
};

ZmMailMsgView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_COLOR])) {
		var tag = ev.getDetail("organizers")[0];
		var img = document.getElementById(this._tagCellId +  ZmDoublePaneView._TAG_IMG + tag.id);
		if (img)
			AjxImg.setImage(img, ZmTag.COLOR_MINI_ICON[tag.color]);
	}

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.MODIFY)
		this._setTags(this._msg);
};

ZmMailMsgView.prototype._expandButtonListener =
function(ev) {
	this._expandRows(!this._expandHeader);
};
ZmMailMsgView.prototype._expandRows = function(expand) {
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
	if (ZmMailMsgView.SCROLL_WITH_IFRAME) {
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
	var tag = this._appCtxt.getById(tagId);
	var query = 'tag:"' + tag.name + '"';
	var searchController = this._appCtxt.getSearchController();
	searchController.search({query: query});
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
	var html = new Array();
	var idx = 0;

	html[idx++] = "<div style='width: 100%; background-color: #EEEEEE'>";
	html[idx++] = "<table border=0 width=100%><tr>";

	// print SUBJECT and DATE
	html[idx++] = "<td><font size=+1>";
	html[idx++] = msg.getSubject();
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
	html[idx++] = "</div>";

	// finally, print content
	var content = null;
	var bodyPart = msg.getBodyPart();
	if (bodyPart) {
		html[idx++] = "<div style='padding: 10px; font-size: 12px'>";
		if (bodyPart.ct == ZmMimeTable.TEXT_HTML && preferHtml) {
			// TODO - html should really sit in its own iframe but not so easy to do...
			html[idx++] = bodyPart.content;
		} else {
			content = bodyPart.ct != ZmMimeTable.TEXT_PLAIN
				? msg.getTextPart()
				: bodyPart.content;
			html[idx++] = "<span style='font-family: courier'>";
			html[idx++] = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(content, true));
			html[idx++] = "</span>";
		}
		html[idx++] = "</div>";
	}

	if (callback) {
		var result = new ZmCsfeResult(html.join(""));
		callback.run(result);
	} else {
		return html.join("");
	}
};

ZmMailMsgView._swapIdAndSrc =
function (image, i, len, msg, idoc, iframe, view) {
	image.src = image.getAttribute("dfsrc");
	if (i == len - 1) {
		msg.setHtmlContent(idoc.documentElement.innerHTML);
		view._resetIframeHeightOnTimer(iframe);
	}
};

ZmMailMsgView._resetIframeHeight =
function(self, iframe) {
	var h;
	if (ZmMailMsgView.SCROLL_WITH_IFRAME) {
		h = self.getH() - 2;
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
			if (!iframe.contentWindow)
				return;
		} catch(ex) {
			// for IE
			return;
		}
		var doc = iframe.contentWindow.document;
		h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
		iframe.style.height = h + "px";
		var w = doc.body.scrollWidth;
		iframe.style.width = w + "px";
	}
};

ZmMailMsgView._tagClick =
function(myId, tagId) {
	var dwtObj = Dwt.getObjectFromElement(document.getElementById(myId));
	dwtObj.notifyListeners(ZmMailMsgView._TAG_CLICK, tagId);
};

ZmMailMsgView._detachCallback =
function(appCtxt, result) {
	var resp = result.getResponse().GetMsgResponse;
	var msg = new ZmMailMsg(appCtxt, resp.m[0].id);
	msg._loadFromDom(resp.m[0]);
	// bug fix #8868 - force load for rfc822 msgs since they may not return any content
	msg._loaded = true;

	ZmMailMsgView.detachMsgInNewWindow(appCtxt, msg);
};

ZmMailMsgView.detachMsgInNewWindow =
function(appCtxt, msg) {
	var newWinObj = appCtxt.getNewWindow(true);
	newWinObj.command = "msgViewDetach";
	newWinObj.params = { msg:msg };
};

ZmMailMsgView.rfc822Callback =
function(msgId, msgPartId) {
	var appCtxt = window.parentController
		? window.parentController._appCtxt
		: window._zimbraMail._appCtxt;
	var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
	var sender = appCtxt.getAppController();
	var callback = new AjxCallback(null, ZmMailMsgView._detachCallback, [appCtxt]);
	ZmMailMsg.fetchMsg({ sender:sender, msgId:msgId, partId:msgPartId, getHtml:getHtml, callback:callback });
};

ZmMailMsgView.vcardCallback =
function(msgId, vcardPartId) {
	ZmZimbraMail.unloadHackCallback();

	var appCtxt = window.parentController
		? window.parentController._appCtxt
		: window._zimbraMail._appCtxt;

	appCtxt.getApp(ZmApp.CONTACTS).createFromVCard(msgId, vcardPartId);
};

ZmMailMsgView._buildZipUrl =
function(csfeUrl, itemId, attachments, htmlArr, idx) {
	var url = csfeUrl + "id=" + itemId + "&part=";
	for (var j = 0; j < attachments.length; j++) {
		url += attachments[j].part;
		if (j <= attachments.length)
			url += ",";
	}
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='margin-right:1em; margin-bottom:1px'><tr>";
	htmlArr[idx++] = "<td style='width:18px'>";
	htmlArr[idx++] = AjxImg.getImageHtml(ZmMimeTable.getInfo(ZmMimeTable.APP_ZIP).image, "position:relative;");
	htmlArr[idx++] = "</td><td style='white-space:nowrap'><a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' href='";
	htmlArr[idx++] = url;
	htmlArr[idx++] = "&disp=a&fmt=zip'>";
	htmlArr[idx++] = ZmMsg.downloadAll;
	htmlArr[idx++] = "</td></tr></table>";

	return idx;
};
