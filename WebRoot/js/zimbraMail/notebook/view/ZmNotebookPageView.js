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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNotebookPageView(parent, appCtxt, controller, dropTgt) {
	DwtComposite.call(this, parent, "ZmNotebookPageView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._USE_IFRAME = false;

	this._createHtml();	
	this._setMouseEventHdlrs(); // needed by object manager
	this._setAllowSelection();
	
	this.setDropTarget(dropTgt);
}
ZmNotebookPageView.prototype = new DwtComposite;
ZmNotebookPageView.prototype.constructor = ZmNotebookPageView;

ZmNotebookPageView.prototype.toString =
function() {
	return "ZmNotebookPageView";
};

// Data

ZmNotebookPageView.prototype._appCtxt;
ZmNotebookPageView.prototype._controller;

// Public methods

ZmNotebookPageView.prototype.getController =
function() {
	return this._controller;
};

ZmNotebookPageView.prototype.set =
function(page) {
	if (this._USE_IFRAME) {
		this._iframe.src = page.getRestUrl();
	}
	else {
		var element = this.getHtmlElement();
		if (!page) {
			element.innerHTML = "";
			return;
		}

		var content = ZmNotebookPageView._generateContent(page, this._appCtxt);

		//DBG.showTiming(true);
		//DBG.timePt("-- ZmNotebookPageView#set --");
		/*** remove all styles ***
		var re = /<style(.|\n)*?>(.|\n)*?<\/style(.|\n)*?>/gi;
		content = content.replace(re);
		/***/
		element.innerHTML = content;
		//DBG.timePt("set innerHTML");
		//DBG.showTiming(false);

		ZmNotebookPageView._fixLinks(element);
		ZmNotebookPageView._findObjects(this._getObjectMgr(), element);
	}
};

ZmNotebookPageView.getPrintHtml =
function(page, appCtxt) {
	if (!ZmNotebookPageView._objectMgr) {
		ZmNotebookPageView._objectMgr = new ZmObjectManager(null, appCtxt, null, true);
		var handler = new ZmNotebookObjectHandler(this._appCtxt);
		ZmNotebookPageView._objectMgr.addHandler(handler, ZmNotebookObjectHandler.TYPE, 1);
		ZmNotebookPageView._objectMgr.sortHandlers();
	}
	var html = ZmNotebookPageView._generateContent(page, appCtxt);
	var node = Dwt.parseHtmlFragment("<div>" + html + "</div>");
	ZmNotebookPageView._fixLinks(node);
	ZmNotebookPageView._findObjects(ZmNotebookPageView._objectMgr, node);
	return node.innerHTML;
};

ZmNotebookPageView.prototype.getTitle =
function() {
	var page = this.getVisiblePage();
	if (!page) {
		return ZmMsg.zimbraTitle;
	}
	var folderId = page.getFolderId();
	var notebook = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK).getById(folderId);
	var notebookName = notebook.getName();
	return [ZmMsg.zimbraTitle, notebookName].join(": ");
};

ZmNotebookPageView.prototype.getContent =
function() {
	return this.getHtmlElement().innerHTML;
};

ZmNotebookPageView.prototype.getSelection =
function() {
	return [this._controller.getPage()];
};

ZmNotebookPageView.prototype.getVisiblePage =
function() {
	return this._controller.getPage();
};


ZmNotebookPageView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNotebookPageView.prototype.addActionListener = function(listener) { /*TODO*/ };
ZmNotebookPageView.prototype.handleActionPopdown = function(ev) { /*TODO*/ };

ZmNotebookPageView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	if (this._USE_IFRAME) {
		this._iframe.width = width;
		this._iframe.height = height;
	}
};

// Protected methods

ZmNotebookPageView._fixLinks =
function(element) {
	var links = element.getElementsByTagName("A");
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (!link.href) continue;

		if (!link.target) {
			link.target = "_new";
		}
	}
};

ZmNotebookPageView._generateContent =
function(page, appCtxt) {
	if (!page) {
		return "";
	}

	var cache = appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP).getNotebookCache();
	var chrome = cache.getPageByName(page.folderId, ZmNotebook.PAGE_CHROME, true);
	var chromeContent = chrome.getContent();

	var content = chromeContent;
	if (page.name != ZmNotebook.PAGE_CHROME) {
		var pageContent = page.getContent();
		content = chromeContent.replace(ZmWiklet.RE_CONTENT, pageContent);
	}
	return ZmWikletProcessor.process(appCtxt, page, content);
};

ZmNotebookPageView._findObjects =
function(objectMgr, element) {
	objectMgr.reset();
	var discard = [];
	var ignore = "nolink";
	objectMgr.processHtmlNode(element, true, discard, ignore);
};

ZmNotebookPageView.prototype._createHtml = function() {
	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);

	if (this._USE_IFRAME) {
		var iframeId = this._htmlElId+"_iframe";
		element.innerHTML = [
			"<iframe id='",iframeId,"' frameborder='0' ",
				"onload='ZmNotebookPageView._iframeOnLoad(this)'>",
			"</iframe>"
		].join("");

		this._iframe = document.getElementById(iframeId);
		Dwt.associateElementWithObject(this._iframe, this);
	}
};

ZmNotebookPageView.prototype._getObjectMgr =
function() {
	if (!this._objectMgr) {
		this._objectMgr = new ZmObjectManager(this, this._appCtxt);
		var handler = new ZmNotebookObjectHandler(this._appCtxt);
		this._objectMgr.addHandler(handler, ZmNotebookObjectHandler.TYPE, 1);
		this._objectMgr.sortHandlers();
	}
	return this._objectMgr;
};

ZmNotebookPageView._iframeOnLoad = function(iframe) {
	var view = Dwt.getObjectFromElement(iframe);

	// TODO: hook in navigation control

	// highlight objects
	var doc = Dwt.Dwt.getIframeDoc(iframe);
	var element = doc.body;
	ZmNotebookPageView._findObjects(this._getObjectMgr(), element);
};
