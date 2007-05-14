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

	this._USE_IFRAME = true;

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
		
		var toolbar = this._controller._toolbar[this._controller._currentView];
		toolbar.enable([ZmOperation.REFRESH,ZmOperation.EDIT,ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.PRINT,ZmOperation.SEND_PAGE,ZmOperation.DETACH], false);

		if(page!=null){
		this._iframe1.src = page.getRestUrl();
		}
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
	var notebook = this._appCtxt.getById(folderId);
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

	var cache = appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();
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
		var iframeId1 = this._htmlElId+"_iframe_hidden";
		element.innerHTML = [
			"<iframe id='",iframeId,"' frameborder='0' ",
				"onload='ZmNotebookPageView._iframeOnLoad(this)'>",
			"</iframe>",
			"<iframe id='",iframeId1,"' name='",iframeId1,"' frameborder='0' style='position: absolute; top: 0; left: 0; visibility: hidden'",
				"onload='ZmNotebookPageView._iframeOnLoad1(this)'>",
			"</iframe>"			
		].join("");

		this._iframe = document.getElementById(iframeId);
		this._iframe1 = document.getElementById(iframeId1);
		Dwt.associateElementWithObject(this._iframe, this);
		Dwt.associateElementWithObject(this._iframe1, this);
		window.wikiFrame = this._iframe;
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
	try{
	view.mutateLinks(iframe.contentWindow.document);
	
	var url = iframe.contentWindow.location.href;
	if(view.currentSrc){
		url = view.currentSrc;
		view.currentSrc = null;
		view.fetchPageInfo(url);
	}else if(url!=window.parent.location.href && url!="about:blank"){
		window.parent.DBG.println("JSON URL FETCH:"+url);
		view.fetchPageInfo(url);
	}	

	view.addIconStyles(iframe.contentWindow.document);	
	}
	catch(ex){
		DBG.println(AjxDebug.DBG1,'exception in iframe load processing:'+ex);
	}
	view.currentSrc = null;		
	
	return; //cdel				
	// highlight objects
	//var doc = Dwt.getIframeDoc(iframe);
	//var element = doc.body;
	//ZmNotebookPageView._findObjects(view._getObjectMgr(), element);
};

ZmNotebookPageView.prototype.processPageInfo = function(iSrc,t){

	//var t = result.text;
	if(t==null){
		return;
	}

	var cache = this._appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();
	
	try{

	var data = eval('['+t+']');

	if(data!=null){
		
		var response = data[0];
		var items = cache._processResponse(response);	
		var isPage = true;
		
		if(items && items.length >1){
			isPage = false;
		}else if(items && items.length==1){
			if(unescape(items[0].getRestUrl())!=unescape(iSrc)){
				isPage = false;
			}
		}		
		
		if(items && (items.length>0) ){
			if(!isPage){
			var iPage = cache.getPageByName(items[0].folderId,"_Index");
			this._controller.setPage(iPage);
			}else{
			this._controller.setPage(items[0]);
			}
			if(!this._controller.historyLoading){
			this._controller.updateHistory();
			}else{
			this._controller.historyLoading = null;
			}
			this.addColumn(this._iframe.contentWindow.document);
		}
	
		DBG.println("isPage:"+isPage);//cdel	
	}
	}catch(ex){	
		DBG.println(AjxDebug.DBG1,'exception in processing page info:'+ex);	
	}
	
	
};

ZmNotebookPageView.prototype.enableToolbar = function(enable){
	var toolbar = this._controller._toolbar[view._controller._currentView];
	toolbar.enable([ZmOperation.REFRESH,ZmOperation.EDIT,ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.PRINT,ZmOperation.SEND_PAGE,ZmOperation.DETACH], enable);
};


ZmNotebookPageView.prototype.mutateLinks = function(doc){

		try{
		var links  = doc.getElementsByTagName("a");
		var lwin = this._iframe1.contentWindow;
		var linkPrefix = lwin.location.protocol+"//"+lwin.location.host;
		if(links){
			for(var i=0;i<links.length;i++){
			var link = links[i];
			this.mutateLink(link,doc,linkPrefix);
			}
		}
		
		//this.addColumn(doc);
		}catch(ex){
			DBG.println(AjxDebug.DBG1,"exception in mutating iframe link:"+ex);
		}
};


ZmNotebookPageView.prototype.mutateLink = function(linkNode,doc,linkPrefix){
	var thref = linkNode.href;
	var target = "_new";
	if(thref.match(/^https?:\/\//)){
		if(thref.indexOf(linkPrefix)>=0){		
			target = this._iframe1.id;
		}else{
			target = "_new";
		}
		
	}else{	
		target = this._iframe1.id;
	}
	linkNode.target = target;
};

ZmNotebookPageView.prototype.fetchPageInfo = function(iSrc){
	
	try{		
	var idx1 = iSrc.indexOf("/home/");		
	var docPath = iSrc.substring(idx1);		
    var jsonUrl = docPath+"?fmt=json";		
	var pageInfo = AjxRpc.invoke("", jsonUrl, {}, null, true);

	if(pageInfo!=null){
	 	if(pageInfo.success){
	 	this.processPageInfo(iSrc,pageInfo.text);
	 	}
	 }
		 
	}catch(ex){
		DBG.println(AjxDebug.DBG1,'exception in fetch page info:'+ex);
	}
	
};

ZmNotebookPageView.prototype.addIconStyles = function(doc)
{
	var headTags = doc.getElementsByTagName("head");
	
	if(!headTags)
	return;
	
	var el = doc.createElement("link");	
	el.rel = "stylesheet";
	el.type = "text/css";
	el.href = "/zimbra/css/imgs.css";
	headTags[0].appendChild(el);	
	
};

ZmNotebookPageView.prototype.addColumn = function(doc)
{

	var table =null;
	var wikiTables = doc.getElementsByTagName("table");
	
	if(!wikiTables)
	return;

	for(var i=0;i<wikiTables.length;i++){
		if(wikiTables[i].className=="zmwiki-tocListTable"){
			table = wikiTables[i];
		}
	}
	
	if(!table)
	return;

	var object = this._controller._object;
	var cache = this._appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();	
	
	var tblBodyObj = table.tBodies[0];
	for (var i=0; i<tblBodyObj.rows.length; i++) {
		var row = tblBodyObj.rows[i];
	
		if(row.className=="zmwiki-headerUnderLine"){
				var newCell = row.insertCell(2);
				newCell.className = "zmwiki-header";
				newCell.innerHTML = "Actions";
				continue;
			}
			
		for(var j=0;j<row.cells.length;j++){
			var cell = row.cells[j];			
			
			if(cell.className == "zmwiki-pageLink"){
				var wikiName = cell.firstChild.innerHTML;
				var isPage = (row.cells[j-1].firstChild.className=="ImgPage")?true:false;
				var newCell = row.insertCell(j+1);			
				
				var isReadOnly = false;
				
				var page = cache.getPageByName(object.folderId,wikiName);
				
				if(page!=null){
					isReadOnly = page.isReadOnly();
				}
			
				if(isPage && !isReadOnly){
					var editLink = this.createEditLink(doc,wikiName);
					var delLink = this.createDeleteLink(doc,wikiName);
					newCell.appendChild(editLink);
					newCell.appendChild(doc.createTextNode(" "));
					newCell.appendChild(delLink);
				}else{				
					newCell.innerHTML = " - ";
				}
				break;
							
			}
		}
	}
};

ZmNotebookPageView.prototype.createEditLink = function(doc,wikiName){

	var editLink = doc.createElement("a");
	editLink.innerHTML = "Edit";
	editLink.href='javascript:window.parent.Dwt.getObjectFromElement(window.parent.wikiFrame).editPage("'+wikiName+'");'	
	editLink.className = "zmwiki-author";
	return editLink;
	
};

ZmNotebookPageView.prototype.createDeleteLink = function(doc,wikiName){

	var delLink = doc.createElement("a");
	delLink.innerHTML = "Delete";
	delLink.href='javascript:window.parent.Dwt.getObjectFromElement(window.parent.wikiFrame).deletePage("'+wikiName+'");'
	delLink.className = "zmwiki-author";
	return delLink;
	
};


ZmNotebookPageView.prototype.editPage = function(pageName){

var controller = this._controller;
var object = controller._object;
var cache = this._appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();
var iPage = cache.getPageByName(object.folderId,pageName);

if(!iPage)
return;

var pageEditController = controller._app.getPageEditController();
pageEditController.show(iPage);

};

ZmNotebookPageView.prototype.deletePage = function(pageName){

var controller = this._controller;
var object = controller._object;
var cache = this._appCtxt.getApp(ZmApp.NOTEBOOK).getNotebookCache();
var iPage = cache.getPageByName(object.folderId,pageName);

if(!iPage)
return;

var callback = new AjxListener(this,this.onDelete);
controller._doDelete(iPage,callback);
};

ZmNotebookPageView.prototype.onDelete = function(){

	var controller = this._controller;
	var object = controller._object;
	this._iframe1.src = object.getRestUrl();

};


ZmNotebookPageView._iframeOnLoad1 = function(iframe) {

	var view = Dwt.getObjectFromElement(iframe);
	// TODO: hook in navigation control
	var iSrc = iframe.contentWindow.location.href;

	try{
	var cwin = iframe.contentWindow;
	var doc = cwin.document;
	var iframeM = view._iframe;
	var ndoc = iframeM.contentWindow.document;

	var title = doc.title;
	
	var isErrorPage = false;

	if(title.match(/- Error report$/)){
		var info = doc.body.firstChild;
		if((info.tagName.toLowerCase() == "h1") && (info.innerHTML == "HTTP Status 404 - no such item"))
		{
			isErrorPage = true;
		}
	}
	
	if(!isErrorPage){	
		view.currentSrc = iSrc;
		ndoc.open();
		ndoc.write(cwin.document.documentElement.innerHTML);
		ndoc.close();
	}else{		
		view.createNewPage(cwin.location.pathname);	
	}

	}catch(ex){

		DBG.println("exception in accessing iframe:"+ex);
		var toolbar = view._controller._toolbar[view._controller._currentView];
		toolbar.enable([ZmOperation.REFRESH,ZmOperation.EDIT,ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.PRINT,ZmOperation.SEND_PAGE,ZmOperation.DETACH], false);
		
	}
	
	view._currentURL = iSrc;	
	
};

ZmNotebookPageView.prototype.createNewPage = function(iSrc){
			
	var name  = iSrc.replace(/^.*\//,"");
	name = unescape(name);			
	var cpage = this._controller.getPage();
	if(cpage.folderId){	
			var item = new ZmPage(this._appCtxt);
			item.name = name;					
			item.folderId = cpage.folderId;
			var controller = AjxDispatcher.run("GetPageEditController");
			controller.show(item);
	}
};
