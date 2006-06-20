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

		var cache = this._controller._app.getNotebookCache();
		var chrome = cache.getPageByName(page.folderId, ZmNotebook.PAGE_CHROME, true);
		var chromeContent = chrome.getContent();

		var content = chromeContent;
		if (page.name != ZmNotebook.PAGE_CHROME) {
			var pageContent = page.getContent();
			content = chromeContent.replace(ZmWiklet.RE_CONTENT, pageContent);
		}
		content = ZmWikletProcessor.process(this._appCtxt, page, content);

		element.innerHTML = content;

		var links = element.getElementsByTagName("A");
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (!link.href) continue;

			if (!link.target) {
				link.target = "_new";
			}
		}

		this._findObjects(element);
	}
};

ZmNotebookPageView.getPrintHtml =
function(item, callback) {
	var url = item.getRestUrl();
	try {
		AjxRpc.invoke(null, url, null, new AjxCallback(this, this._handleResponseGetPrintHtml, [callback, url]), true);
	} catch (e) {
		var message = e.dump ? e.dump() : e.toString();
		DBG.println("Unable to open URL for page. URL: " + url + " Exception: " + message);
	}
};

ZmNotebookPageView._handleResponseGetPrintHtml =
function(callback, url, response) {
	// If an error occurs, log it, and then proceed to show the 404 message or whatever came back.
	if (!response.success) {
		DBG.println(AjxDebug.DBG1, "Request for print html failed. URL: " + url);
	}
	callback.run(response.text);	
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

ZmNotebookPageView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	if (this._USE_IFRAME) {
		this._iframe.width = width;
		this._iframe.height = height;
	}
};

// Protected methods

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

ZmNotebookPageView.prototype._findObjects = function(element) {
	if (!this._objectMgr) {
		this._objectMgr = new ZmObjectManager(this, this._appCtxt);
		var handler = new ZmNotebookObjectHandler(this._appCtxt);
		this._objectMgr.addHandler(handler, ZmNotebookObjectHandler.TYPE, 20);
		this._objectMgr.sortHandlers();
	}
	this._objectMgr.reset();

	var discard = null;
	var ignore = "nolink";
	this._objectMgr.processHtmlNode(element, true, discard, ignore);
};

ZmNotebookPageView._iframeOnLoad = function(iframe) {
	var view = Dwt.getObjectFromElement(iframe);

	// TODO: hook in navigation control

	// highlight objects
	var doc = Dwt.Dwt.getIframeDoc(iframe);
	var element = doc.body;
	view._findObjects(element);
};
