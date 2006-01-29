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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmMailMsgView(parent, className, posStyle, mode, controller) {

	className = className || "ZmMailMsgView";
	DwtComposite.call(this, parent, className, posStyle);

	this._mode = mode;
	this._controller = controller;

	this._displayImagesId = Dwt.getNextId();
	this._tagRowId = Dwt.getNextId();
	this._tagCellId = Dwt.getNextId();
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	this.setScrollStyle(ZmMailMsgView.SCROLL_WITH_IFRAME
			    ? DwtControl.CLIP
			    : DwtControl.SCROLL);

	if (!controller.isChildWindow) {
		// Add change listener to taglist to track changes in tag color
		this._tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
		this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
		this.addListener(ZmMailMsgView._TAG_CLICK, new AjxListener(this, this._msgTagClicked));
	}

	this._setMouseEventHdlrs(); // needed by object manager

	// XXX: for now, turn off object handling :(
	if (!controller.isChildWindow) {
		// this manages all the detected objects within the view
		this._objectManager = new ZmObjectManager(this, this._appCtxt);
	}

	this._changeListener = new AjxListener(this, this._msgChangeListener);
	this.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._mouseDownListener));
	this.addListener(DwtEvent.ONSELECTSTART, new AjxListener(this, this._selectStartListener));
	this.addListener(DwtEvent.ONCONTEXTMENU, new AjxListener(this, this._contextMenuListener));
	this.addListener(DwtEvent.CONTROL, new AjxListener(this, this._controlEventListener));
}

ZmMailMsgView.prototype = new DwtComposite;
ZmMailMsgView.prototype.constructor = ZmMailMsgView;


// Consts

ZmMailMsgView.SCROLL_WITH_IFRAME = false;
ZmMailMsgView.LIMIT_ATTACHMENTS = ZmMailMsgView.SCROLL_WITH_IFRAME ? 3 : 0;
ZmMailMsgView.ATTC_COLUMNS = 2;
ZmMailMsgView.ATTC_MAX_SIZE = ZmMailMsgView.LIMIT_ATTACHMENTS * 16 + 8;

ZmMailMsgView.HEADER_ID 		= "h--" + Dwt.getNextId();
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
	if (this._objectManager)
		this._objectManager.reset();
};

ZmMailMsgView.prototype.preventSelection =
function() {
	return false;
};

ZmMailMsgView.prototype.preventContextMenu =
function(target) {
	if (AjxEnv.isSafari) {
		// XXX: for some reason Safari is returning false on getSelection()
		//      even when something is selected w/in msg view. Just return false
		//      to allow copying text :(
		return false;
	} else {
		var bObjFound = target.id.indexOf("OBJ_") == 0;
		var bSelection = false;

		// determine if anything has been selected (IE and mozilla do it differently)
		if (document.selection) { // IE
			bSelection = document.selection.type == "Text";
		} else if (getSelection()) { 		// mozilla
			if (getSelection().toString().length)
				bSelection = true;
		}
		// if something has been selected and target is not a custom object,
		return bSelection && !bObjFound ? false : true;
	}
};

ZmMailMsgView.prototype.set =
function(msg) {
	if (this._msg == msg) return;

	this.reset();
	var contentDiv = this.getHtmlElement();
	var oldMsg = this._msg;
	this._msg = msg;
	this._dateObjectHandlerDate = msg.sentDate ? new Date(msg.sentDate) : new Date(msg.date);
	if ((this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) && msg.isInvite()) {
		var invite = msg.getInvite();
		// in the single component case, which I think is going to be 90%
		// of the time, we will just show a single toobar.
		if (!invite.isEmpty() && !invite.hasMultipleComponents() && msg.folderId != ZmFolder.ID_TRASH) {
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
	else if (msg.share && msg.share.action == ZmShareInfo.NEW && msg.folderId != ZmFolder.ID_TRASH) {
		// Note: Even if the share message is cc'd to someone else, the
		//		 accept/decline buttons are only seen by the grantee.
		if (msg.share.grantee.id == this._appCtxt.get(ZmSetting.USERID)) {
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

ZmMailMsgView.prototype.highlightObjects =
function() {
	// This turns out to work fine for both HTML and Text emails.  For
	// text, however, it's slower than if we were just calling findObjects
	// on the whole text content, but has the advantage that it doesn't
	// scroll the iframe to top.  If anyone thinks that hiliting objects in
	// big text messages is too slow, lemme know.  -mihai@zimbra.com
	var idoc = document.getElementById(this._iframeId).contentWindow.document;
	this._processHtmlDoc(idoc);
};

ZmMailMsgView.prototype.resetMsg =
function(newMsg) {
	// Remove listener for current msg if it exists
	if (this._msg != null)
		this._msg.removeChangeListener(this._changeListener);
	// don't want add change listener for new until shown
	this._msg = newMsg;
};

ZmMailMsgView.prototype.isDisplayingMsg =
function(msg) {
	return (this._msg == msg);
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
		var headerObj = document.getElementById(ZmMailMsgView.HEADER_ID);
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

ZmMailMsgView.prototype.detach =
function(msgId, msgPartId) {
	var getHtml = this._appCtxt.get(ZmSetting.VIEW_AS_HTML);
	var sender = this._appCtxt.getAppController();
	var callback = new AjxCallback(this, this._detachCallback);
	ZmMailMsg.fetchMsg({sender:sender, msgId: msgId, partId:msgPartId, getHtml:getHtml, callback:callback});
};

ZmMailMsgView.prototype._detachCallback =
function(result) {
	var resp = result.getResponse().GetMsgResponse;
	var msg = new ZmMailMsg(this._appCtxt, resp.m[0].id);
	msg._loadFromDom(resp.m[0]);

	var newWin = this._appCtxt.getNewWindow(true);
	newWin.command = "msgViewDetach";
	newWin.args = {msg: msg};
};


// Private / protected methods

ZmMailMsgView.prototype._getInviteToolbar =
function() {
	// TODO: reuse the toolbar
	if (this._inviteToolbar)
		this._inviteToolbar.dispose();

	var operationButtonIds = [ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_TENTATIVE, ZmOperation.REPLY_DECLINE];
	var replyButtonIds = [ZmOperation.INVITE_REPLY_ACCEPT,ZmOperation.INVITE_REPLY_TENTATIVE,ZmOperation.INVITE_REPLY_DECLINE];
	this._inviteToolbar = new ZmButtonToolBar(this,	operationButtonIds,
						  null, DwtControl.STATIC_STYLE,
						  "ZmInviteToolBar", "DwtButton");
	// get a little space between the buttons.
	var toolbarHtmlEl = this._inviteToolbar.getHtmlElement();
	toolbarHtmlEl.firstChild.cellPadding = "3";

	var inviteToolBarListener = new AjxListener(this, this._inviteToolBarListener);
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
		var menu = new ZmActionMenu(button, standardItems);
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
	this._shareToolbar = new ZmButtonToolBar(this,	buttonIds,
											  null, DwtControl.STATIC_STYLE,
											  "ZmShareToolBar", "DwtButton");
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
	if (this._mode == ZmController.TRAD_VIEW) {
		if (oldMsg != null)
			oldMsg.list.removeChangeListener(this._listChangeListener);
		msg.list.addChangeListener(new AjxListener(this, this._listChangeListener));
	} else {
		this._setTags(msg);
		// Remove listener for current msg if it exists
		if (oldMsg != null)
			oldMsg.removeChangeListener(this._changeListener);
		msg.addChangeListener(this._changeListener);
	}

	// reset scroll view to top most
	this.getHtmlElement().scrollTop = 0;
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

// Dives recursively into the given DOM node.  Creates ObjectHandlers in text
// nodes and cleans the mess in element nodes.  Discards by default "script",
// "link", "object", "style", "applet" and "iframe" (most of them shouldn't
// even be here since (1) they belong in the <head> and (2) are discarded on
// the server-side, but we check, just in case..).
ZmMailMsgView.prototype._processHtmlDoc =
function(doc) {
	// var T1 = new Date().getTime();
	var objectManager = this._objectManager,
		node = doc.body;

	// This inner function does the actual work.  BEWARE that it return-s
	// in various places, not only at the end.
	function recurse(node, handlers) {
		var tmp, i, val;
		switch (node.nodeType) {
		    case 1:	// ELEMENT_NODE
			node.normalize();
			tmp = node.tagName.toLowerCase();
			if (/^(img|a)$/.test(tmp)) {
				if (tmp == "a"
				    && (ZmMailMsgView._URL_RE.test(node.href)
					|| ZmMailMsgView._MAILTO_RE.test(node.href)))
				{
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
			for (i = node.firstChild; i; i = recurse(i, handlers));
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
					if (/^[\s\xA0]+/.test(node.data)) {
						a = node;
						node = node.splitText(RegExp.lastMatch.length);
					}
					if (/[\s\xA0]+$/.test(node.data))
						b = node.splitText(node.data.length - RegExp.lastMatch.length);
				}

				tmp = doc.createElement("div");
				tmp.innerHTML = objectManager.findObjects(node.data, true);

				if (a)
					tmp.insertBefore(a, tmp.firstChild);
				if (b)
					tmp.appendChild(b);

				a = node.parentNode;
				while (tmp.firstChild)
					a.insertBefore(tmp.firstChild, node);
				tmp = node.nextSibling;
				a.removeChild(node);
				return tmp;
			} catch(ex) {};
		}
		return node.nextSibling;
	};
	recurse(node, true);
	// alert((new Date().getTime() - T1)/1000);
};

ZmMailMsgView.prototype._fixMultipartRelatedImages =
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
					var args = [images[i], i, images.length, msg, idoc];
					var act = new AjxTimedAction(null, ZmMailMsgView._swapIdAndSrc, args);
					AjxTimedAction.scheduleAction(act, 0);
				} else {
					images[i].src = images[i].getAttribute("dfsrc");
				}
			}
		}
		diEl = document.getElementById(id);
		diEl.style.display = "none";
		this._htmlBody = idoc.documentElement.innerHTML;
		ZmMailMsgView._resetIframeHeight(self, iframe);
		msg.setHtmlContent(this._htmlBody);
	};
	return func;
};

ZmMailMsgView.prototype._makeHighlightObjectsDiv =
function() {
	var self = this;
	function func() {
		var div = document.getElementById(self._highlightObjectsId);
		div.innerHTML = ZmMsg.pleaseWaitHilitingObjects;
		setTimeout(function() {
			self.highlightObjects();
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
	if (!isTextMsg && /<img/i.test(html)) {
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
	if (this._objectManager) {
		if (isTextMsg) {
			if (msgSize <= ZmMailMsgView.OBJ_SIZE_TEXT && this._objectManager) {
				// better process objects directly rather than scanning the DOM afterwards.
				html = this._objectManager.findObjects(html, true);
			} else {
				html = AjxStringUtil.convertToHtml(html);
				this._makeHighlightObjectsDiv();
			}
			html = html.replace(/^ /mg, "&nbsp;")
				.replace(/\t/g, "<pre style='display:inline;'>\t</pre>")
				.replace(/\n/g, "<br>");
		} else {
			html = html.replace(/<!--(.*?)-->/g, ""); // remove comments
			// html = html.replace(/<style>/, "<style type='text/css'>");
			// this callback will post-process the HTML after the IFRAME is created
			if (msgSize <= ZmMailMsgView.OBJ_SIZE_HTML)
				callback = new AjxCallback(this, this._processHtmlDoc);
			else
				this._makeHighlightObjectsDiv();
		}
	}

	// pass essential styles to avoid padding/font flickering
	var inner_styles = [ ".MsgBody-text, .MsgBody-text * { font: 10pt monospace; }",
			     "body.MsgBody { padding: 10px; }",
			     ".MsgHeader .Object { white-space: nowrap; }",
			     ".Object a:link, .Object a:active, .Object a:visited { text-decoration: none; }",
			     ".Object a:hover { text-decoration: underline; }",
			     ".Object-activated { text-decoration:underline; }"
		].join(" ");
	var ifw = new DwtIframe(this, "MsgBody", true, html, inner_styles,
				!ZmMailMsgView.SCROLL_WITH_IFRAME, // "noscroll"
				"static", callback);
	this._iframeId = ifw.getIframe().id;

	var idoc = ifw.getDocument();

	// assign the right class name to the iframe body
	idoc.body.className = isTextMsg
		? "MsgBody MsgBody-text"
		: "MsgBody MsgBody-html";

	// import the object styles
	var head = idoc.getElementsByTagName("head")[0];
	var link = idoc.createElement("link");
	link.rel = "stylesheet";
	link.href = "/zimbra/js/zimbraMail/config/style/msgview.css?v="+cacheKillerVersion;
	head.appendChild(link);

	ifw.getIframe().style.visibility = "";

	if (!isTextMsg) {
		this._htmlBody = idoc.body.innerHTML;

		// TODO: only call this if top-level is multipart/related?
		var didAllImages = this._fixMultipartRelatedImages(this._msg, idoc, document.domain);

		// setup the click handler for the images
		if (displayImages) {
			if (didAllImages) {
				displayImages.style.display = "none";
			} else {
				var func = this._createDisplayImageClickClosure(this._msg, idoc, this._displayImagesId, ifw.getIframe());
				Dwt.setHandler(displayImages, DwtEvent.ONCLICK, func);
			}
		}
	}

	// set height of view according to height of iframe on timer
	var args = [this, ifw.getIframe()];
	var act = new AjxTimedAction(null, ZmMailMsgView._resetIframeHeight, args);
	AjxTimedAction.scheduleAction(act, 5);
};

ZmMailMsgView.prototype._addAddressHeaderHtml =
function(htmlArr, idx, addrs, prefix) {
	htmlArr[idx++] = "<tr><td class='LabelColName'>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(prefix);
	htmlArr[idx++] = ": </td><td class='LabelColValue'>";
	for (var i = 0; i < addrs.size(); i++) {
		if (i > 0)
			htmlArr[idx++] = AjxStringUtil.htmlEncode(ZmEmailAddress.SEPARATOR);

		var addr = addrs.get(i);
		if (this._objectManager && addr.address) {
			htmlArr[idx++] = this._objectManager.findObjects(addr, true, ZmEmailObjectHandler.TYPE);
		} else {
			htmlArr[idx++] = addr.address ? addr.address : (AjxStringUtil.htmlEncode(addr.name));
		}
	}
   	htmlArr[idx++] = "</td></tr>";

	return idx;
};

ZmMailMsgView.prototype._renderMessage =
function(msg, container, callback) {
	if(this._objectManager) {
	    this._objectManager.setHandlerAttr(ZmDateObjectHandler.TYPE, ZmDateObjectHandler.ATTR_CURRENT_DATE, this._dateObjectHandlerDate);
	}

	var idx = 0;
	var htmlArr = new Array();
	this._hdrTableId = Dwt.getNextId();
	htmlArr[idx++] = "<div id='" + ZmMailMsgView.HEADER_ID + "' class='MsgHeader'>";
	htmlArr[idx++] = "<table id='" + this._hdrTableId + "' cellspacing=2 cellpadding=2 border=0 width=100%>";

	// Subject
	var subject = msg.getSubject() || ZmMsg.noSubject;
	htmlArr[idx++] = "<tr class='SubjectLine'><td class='LabelColName'>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(ZmMsg.subject);
	htmlArr[idx++] = ": </td><td class='LabelColValue'>";
	htmlArr[idx++] = this._objectManager ? this._objectManager.findObjects(subject, true) : subject;
	htmlArr[idx++] = "</td></tr>";

	// From/To
	for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
		var type = ZmMailMsg.ADDRS[i];
		// bug fix #3227 - dont bother filtering out BCC - server wont return any if they dont belong
		var addrs = msg.getAddresses(type);
		if (addrs.size() > 0) {
			var prefix = ZmMsg[ZmEmailAddress.TYPE_STRING[type]];
			idx = this._addAddressHeaderHtml(htmlArr, idx, addrs, prefix);
		}
	}

	// Date
	htmlArr[idx++] = "<tr><td class='LabelColName'>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(ZmMsg.sent);
	htmlArr[idx++] = ": </td><td>";
	htmlArr[idx++] = msg.sentDate ? (new Date(msg.sentDate)).toLocaleString() : "";
	htmlArr[idx++] = "</td></tr>";

	// Attachments
	idx = this._getAttachmentHtml(msg, htmlArr, idx);

	htmlArr[idx++] = "</table></div>";
	var el = container ? container : this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(htmlArr.join("")));

	var bodyPart = msg.getBodyPart();
	if (bodyPart) {
		if (bodyPart.ct == ZmMimeTable.TEXT_HTML && this._appCtxt.get(ZmSetting.VIEW_AS_HTML)) {
			this._makeIframeProxy(el, bodyPart.content, false);
			if (callback)
				callback.run();
		} else {
			// otherwise, get the text part if necessary
			if (bodyPart.ct != ZmMimeTable.TEXT_PLAIN) {
				// try to go retrieve the text part
				var respCallback = new AjxCallback(this, this._handleResponseRenderMessage, [el, bodyPart, callback]);
				msg.getTextPart(respCallback);
			} else {
				this._makeIframeProxy(el, bodyPart.content, true);
				if (callback)
					callback.run();
			}
		}
	}
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
						var line = lines[j];
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
		}
		else if (bodyPart.ct == ZmMimeTable.TEXT_HTML)
			content = bodyPart.content;
	}

	this._makeIframeProxy(el, (content || ""), true);
}

ZmMailMsgView.prototype._setTags =
function(msg) {
	if (!this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) return;

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
	html[i++] = AjxEnv.isIE ? "' class='Tags'>" : "'>";

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
		if (AjxEnv.isIE) {
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

ZmMailMsgView.prototype._getAttachmentHtml =
function(msg, htmlArr, idx) {
	var attLinks = msg.getAttachmentLinks(true);
	if (attLinks.length == 0)
		return idx;
	htmlArr[idx++] = "<tr>";
	htmlArr[idx++] = "<td class='LabelColName'>";
	htmlArr[idx++] = ZmMsg.attachments;
	htmlArr[idx++] = ": </td><td class='LabelColValue'>";
	var dividx = idx;	// we might get back here
	htmlArr[idx++] = "<div style='overflow: auto;'>";
	htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0>";
	var rows = 0;
	for (var i = 0; i < attLinks.length; i++) {
		var att = attLinks[i];

		if ((i % ZmMailMsgView.ATTC_COLUMNS) == 0) {
			if (i != 0)
				htmlArr[idx++] = "</tr>";
			htmlArr[idx++] = "<tr>";
			++rows;
		}

		htmlArr[idx++] = "<td>";
		htmlArr[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='margin-right: 1em'><tr>";
		htmlArr[idx++] = "<td style='width:18px'>";
		htmlArr[idx++] = AjxImg.getImageHtml(att.linkIcon, "position:relative;");
		htmlArr[idx++] = "</td><td style='white-space:nowrap'>";

		var linkArr = new Array();
		var j = 0;
		linkArr[j++] = att.isHit ? "<span class='AttName-matched'>" : "";
		linkArr[j++] = att.link;
		linkArr[j++] = AjxStringUtil.htmlEncode(att.label);
		linkArr[j++] = att.isHit ? "</a></span>" : "</a>";
		var link = linkArr.join("");

		// objectify if this attachment is an image
		if (att.objectify && this._objectManager) {
			var imgHandler = this._objectManager.getImageAttachmentHandler();
			idx = this._objectManager.generateSpan(imgHandler, htmlArr, idx, link, {url:att.url});
		} else {
			htmlArr[idx++] = link;
		}

		if (att.size || att.htmlLink) {
			htmlArr[idx++] = "&nbsp;(";
			if (att.size) {
				htmlArr[idx++] = att.size;
				if (att.htmlLink)
					htmlArr[idx++] = ", ";
			}
			if (att.htmlLink) {
				htmlArr[idx++] = att.htmlLink;
				htmlArr[idx++] = ZmMsg.viewAsHtml;
				htmlArr[idx++] = "</a>";
			}

			htmlArr[idx++] = ")";
		}
		htmlArr[idx++] = "</td>";
		htmlArr[idx++] = "</tr></table>";
		htmlArr[idx++] = "</td>";
	}
	if (ZmMailMsgView.LIMIT_ATTACHMENTS != 0 && rows > ZmMailMsgView.LIMIT_ATTACHMENTS)
		// limit display size.  seems like an attc. row has exactly
		// 16px; we set it to 56px so that it becomes obvious that
		// there are more attachments.
		htmlArr[dividx] = "<div style='height: " + ZmMailMsgView.ATTC_MAX_SIZE + "px; overflow: auto;'>";
	htmlArr[idx++] = "</tr>"; // hopefully ;-)
	htmlArr[idx++] = "</table>";
	htmlArr[idx++] = "</div>";
	htmlArr[idx++] = "</td>";
	htmlArr[idx++] = "</tr>";

	return idx;
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
		var args = [this, iframe];
		var act = new AjxTimedAction(null, ZmMailMsgView._resetIframeHeight, args);
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

ZmMailMsgView.prototype._listChangeListener =
function(ev) {
	// bug fix #3398 - check list size before nuking the msg view
	if (ev.source.size() == 0 && (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE))
		this.reset();
};

ZmMailMsgView.prototype._mouseDownListener =
function(ev) {
	if (ev.button == DwtMouseEvent.LEFT) {
		// reset mouse event to propagate event to browser (allows text selection)
		ev._stopPropagation = false;
		ev._returnValue = true;
	}
};

ZmMailMsgView.prototype._selectStartListener =
function(ev) {
	// reset mouse event to propagate event to browser (allows text selection)
	ev._stopPropagation = false;
	ev._returnValue = true;
};

ZmMailMsgView.prototype._contextMenuListener =
function(ev) {
	// reset mouse event to propagate event to browser (allows context menu)
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


// Callbacks

ZmMailMsgView.prototype._msgTagClicked =
function(tagId) {
	var tag = this._appCtxt.getTree(ZmOrganizer.TAG).getById(tagId);
	var query = 'tag:"' + tag.name + '"';
	var searchController = this._appCtxt.getSearchController();
	searchController.search({query: query});
};


// Static methods

ZmMailMsgView.getPrintHtml =
function(msg, preferHtml, callback) {
	if (!(msg.toString() == "ZmMailMsg"))
		return;

	if (!msg.isLoaded()) {
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
function(msg, callback, result) {
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
	html[idx++] = "<td><font size=+1>" + msg.getSubject() + "</font></td>";
	html[idx++] = "<td align=right><font size=+1>";
	html[idx++] = msg.sentDate
		? (new Date(msg.sentDate)).toLocaleString()
		: (new Date(msg.date)).toLocaleString();
	html[idx++] = "</font></td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "<table border=0 width=100%>";

	// print all address types
	for (var j = 0; j < ZmMailMsg.ADDRS.length; j++) {
		var addrs = msg.getAddresses(ZmMailMsg.ADDRS[j]);
		var len = addrs.size();
		if (len > 0) {
			html[idx++] = "<tr>";
			html[idx++] = "<td valign=top style='text-align:right; font-size:14px'>";
			html[idx++] = ZmMsg[ZmEmailAddress.TYPE_STRING[ZmMailMsg.ADDRS[j]]];
			html[idx++] = ": </td><td width=100% style='font-size: 14px'>";
			for (var i = 0; i < len; i++) {
				html[idx++] = i > 0 ? AjxStringUtil.htmlEncode(ZmEmailAddress.SEPARATOR) : "";
				html[idx++] = addrs.get(i).address;
			}
			html[idx++] = "</td>";
			html[idx++] = "</tr>";
		}
	}

	// bug fix# 3928
	var attachments = msg.getAttachments();
	for (var i = 0; i < attachments.length; i++) {
		var attach = attachments[i];
		if (!msg.isRealAttachment(attach))
			continue;

		var label = attach.name || attach.filename || (ZmMsg.unknown + " <" + type + ">");

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
function (image, i, len, msg, idoc) {
	image.src = image.getAttribute("dfsrc");
	if (i == len -1) {
		msg.setHtmlContent(idoc.documentElement.innerHTML);
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
					h -= Dwt.getSize(el, true).y;
			}
		};
		substract(self._hdrTableId);
		substract(self._displayImagesId);
		substract(self._highlightObjectsId);
		if (self._inviteToolbar)
			substract(self._inviteToolbar.getHtmlElement());
	} else {
		var doc = iframe.contentWindow.document;
		var w = doc.body.scrollWidth;
		if (AjxEnv.isIE) {
			h = doc.body.scrollHeight;
		} else {
			h = doc.documentElement.scrollHeight;
		}
		iframe.style.width = w + "px";
	}
	iframe.style.height = h + "px";
};

ZmMailMsgView._tagClick =
function(myId, tagId) {
	var dwtObj = Dwt.getObjectFromElement(document.getElementById(myId));
	dwtObj.notifyListeners(ZmMailMsgView._TAG_CLICK, tagId);
};

ZmMailMsgView.rfc822Callback =
function(anchorEl, msgId, msgPartId) {
	// get the reference to ZmMailMsgView from the anchor element
	var msgView = anchorEl;
	while (msgView != null && (Dwt.getObjectFromElement(msgView) instanceof ZmMailMsgView == false))
		msgView = msgView.parentNode;

	if (msgView) msgView = Dwt.getObjectFromElement(msgView);
	if (msgView)
		msgView.detach(msgId, msgPartId);
};
