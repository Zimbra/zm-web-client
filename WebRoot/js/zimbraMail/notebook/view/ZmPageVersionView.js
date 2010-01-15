/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmPageVersionView = function(parent, controller, dropTgt) {
	
	ZmNotebookPageView.call(this, parent, controller, dropTgt);
	/*
	DwtComposite.call(this, parent, "ZmNotebookPageView", DwtControl.ABSOLUTE_STYLE);
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._USE_IFRAME = true;

	this._createHtml();	
	this._setMouseEventHdlrs(); // needed by object manager
	this._setAllowSelection();
	
	this.setDropTarget(dropTgt);
	*/
}
ZmPageVersionView.prototype = new ZmNotebookPageView;
ZmPageVersionView.prototype.constructor = ZmPageVersionView;

ZmPageVersionView.prototype.toString =
function() {
	return "ZmPageVersionView";
};

ZmPageVersionView.prototype.set =
function(page) {
	this._page = page;
	if(page!=null){
		var url = page.getRestUrl() + "?view=history";	
		var cache = appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();
		var urlParts = cache.parseURL(url);
		this._orginalRestAuthority = urlParts.protocol +"://"+ urlParts.authority;						
		this.loadURL(url);
	}
};

ZmPageVersionView.prototype._createHtml =
function() {
	this._iframeLoader = "ZmPageVersionView._iframeOnLoad";
	this._hiddenIframeLoader = "ZmPageVersionView._iframeOnLoad1";	
	ZmNotebookPageView.prototype._createHtml.call(this);
};

ZmPageVersionView._iframeOnLoad = 
function(iframe) {
   ZmNotebookPageView._iframeOnLoad(iframe);
};

ZmPageVersionView._iframeOnLoad1 = 
function(iframe) {
   ZmNotebookPageView._iframeOnLoad1(iframe);
};

ZmPageVersionView.prototype.handleItemResponse = 
function(item){
	if(!item) { return; }
	
	ZmNotebookPageView.prototype.handleItemResponse.call(this, item);	
	var searchVal = this._iframe1.contentWindow.location.search;
	if(!searchVal){ return; }	
	
	var enableRevert = false;
	var results = /[&|\?]ver=(\d+)/.exec(searchVal);
		
	if(results){
		var version = (results && results.length>1) ? parseInt(results[1]) : 1;
		var cache = appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();	
		var page = cache.getPage(item);	
		page.version = version;
		this._controller.setPage(page);	
		enableRevert = true;	
	}
	
	this._controller.enableRevertButton(enableRevert);	
	
};

ZmPageVersionView.prototype.addActionLinks =
function(rows, isReadOnly) {
	return;
};


