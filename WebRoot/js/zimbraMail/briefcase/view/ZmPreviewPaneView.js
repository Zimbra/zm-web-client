/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmPreviewPaneView = function(parent, controller, dropTgt) {

	if (arguments.length == 0) { return; }

    var params = {};
    params.className = params.className || "ZmPreviewPaneView";
    params.parent = parent;
    params.controller = controller;
    params.posStyle = Dwt.ABSOLUTE_STYLE;
    DwtComposite.call(this, params);

	this._controller = controller;

	this._vertMsgSash = new DwtSash({parent:this, style:DwtSash.HORIZONTAL_STYLE, className:"AppSash-horiz",
									 threshold:ZmPreviewPaneView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._vertMsgSash.registerCallback(this._sashCallback, this);

	this._horizMsgSash = new DwtSash({parent:this, style:DwtSash.VERTICAL_STYLE, className:"AppSash-vert",
									  threshold:ZmPreviewPaneView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._horizMsgSash.registerCallback(this._sashCallback, this);

	this._previewView = new ZmPreviewView({parent:this, posStyle:DwtControl.ABSOLUTE_STYLE, controller: this._controller});
	
    this._detailListView = new ZmDetailListView(this, this._controller, this._controller._dropTgt );
    this._detailListView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
    this._listSelectionShortcutDelayAction = new AjxTimedAction(this, this._listSelectionTimedAction);
    this._delayedSelectionItem = null;
	this.setReadingPane();
};

ZmPreviewPaneView.prototype = new DwtComposite;
ZmPreviewPaneView.prototype.constructor = ZmPreviewPaneView;
ZmPreviewPaneView.LIST_SELECTION_SHORTCUT_DELAY = 300;

ZmPreviewPaneView.prototype.toString =
function() {
	return "ZmPreviewPaneView";
};

// consts

ZmPreviewPaneView.SASH_THRESHOLD = 5;
ZmPreviewPaneView._TAG_IMG = "TI";

// public methods

ZmPreviewPaneView.prototype.getController =
function() {
	return this._controller;
};

ZmPreviewPaneView.prototype.getTitle =
function() {
	return this._detailListView.getTitle();
};

ZmPreviewPaneView.prototype.getListView =
function() {
	return this._detailListView;
};

/**
 * Displays the reading pane, based on the current settings.
 */
ZmPreviewPaneView.prototype.setReadingPane =
function() {

	var tlv = this._detailListView, tv = this._previewView;
	var readingPaneEnabled = this._controller.isReadingPaneOn();
	if (!readingPaneEnabled) {
		tv.setVisible(false);
		this._vertMsgSash.setVisible(false);
		this._horizMsgSash.setVisible(false);
	} else {		
		tv.setVisible(true);
		var readingPaneOnRight = this._controller.isReadingPaneOnRight();
		var newSash = readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
		var oldSash = readingPaneOnRight ? this._horizMsgSash : this._vertMsgSash;
		oldSash.setVisible(false);
		newSash.setVisible(true);
	}

	tlv.reRenderListView();


	tv.noTab = !readingPaneEnabled || AjxEnv.isIE;
	var sz = this.getSize();
	this._resetSize(sz.x, sz.y, true);
};

ZmPreviewPaneView.prototype.reRenderListView =
function(force){
    var tlv = this._detailListView;
    tlv.reRenderListView(force  );
    var sz = this.getSize();
	this._resetSize(sz.x, sz.y, true);
};

ZmPreviewPaneView.prototype.enableRevisionView =
function(enabled){
    this._detailListView.enableRevisionView(enabled);    
};

ZmPreviewPaneView.prototype.isRevisionViewEnabled =
function(){
    return this._detailListView._revisionView;  
};

ZmPreviewPaneView.prototype.resetPreviewPane =
function(newPreviewStatus, oldPreviewStatus){

	this._detailListView._colHeaderActionMenu = null;  //action menu needs to be recreated as it's different for different views

    this.setReadingPane();

    if(oldPreviewStatus == ZmSetting.RP_OFF){
        var items = this.getSelection();
        if(items.length > 0){
            this._previewView.set(items[0]);
        }else{
            this._selectFirstItem();
        }
    }
    
};

ZmPreviewPaneView.prototype.getPreviewView =
function() {
	return this._previewView;
};

ZmPreviewPaneView.prototype.getSelectionCount =
function() {
	return this._detailListView.getSelectionCount();
};

ZmPreviewPaneView.prototype.getSelection =
function() {
	return this._detailListView.getSelection();
};

ZmPreviewPaneView.prototype.reset =
function() {
	this._detailListView.reset();
	this._previewView.reset();
};

ZmPreviewPaneView.prototype.isPreviewPaneVisible =
function() {
	return this._previewView.getVisible();
};

ZmPreviewPaneView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._resetSize(width, height);
};

ZmPreviewPaneView.prototype._resetSize =
function(newWidth, newHeight, force) {


	if (newWidth <= 0 || newHeight <= 0) { return; }
	if (!force && newWidth == this._lastResetWidth && newHeight == this._lastResetHeight) { return; }

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (this.isPreviewPaneVisible()) {
		var sash = this.getSash();
		var sashSize = sash.getSize();
		var sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
		if (readingPaneOnRight) {
			var listViewWidth = this._vertSashX || (Number(ZmMsg.LISTVIEW_WIDTH)) || Math.floor(newWidth / 2.5);
			this._detailListView.resetSize(listViewWidth, newHeight);
			sash.setLocation(listViewWidth, 0);
			this._previewView.setBounds(listViewWidth + sashThickness, 0,
									newWidth - (listViewWidth + sashThickness), newHeight);
		} else {
			var listViewHeight = this._horizSashY || (Math.floor(newHeight / 2) - DwtListView.HEADERITEM_HEIGHT);
			this._detailListView.resetSize(newWidth, listViewHeight);
			sash.setLocation(0, listViewHeight);
			this._previewView.setBounds(0, listViewHeight + sashThickness, newWidth,
									newHeight - (listViewHeight + sashThickness));
		}
	} else {
		this._detailListView.resetSize(newWidth, newHeight);
	}
	this._detailListView._resetColWidth();

	this._lastResetWidth = newWidth;
	this._lastResetHeight = newHeight;
};

ZmPreviewPaneView.prototype._sashCallback =
function(delta) {

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();
	if (delta > 0) {
		if (readingPaneOnRight) {
			// moving sash right
			var minMsgViewWidth = 300;
			var currentMsgWidth = this._previewView.getSize(true).x;
			delta = Math.max(0, Math.min(delta, currentMsgWidth - minMsgViewWidth));
			var newListWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._detailListView.getSize(true).x) + delta;
			if (delta > 0) {
				this._detailListView.resetSize(newListWidth, Dwt.DEFAULT);
				this._previewView.setBounds(this._previewView.getLocation().x + delta, Dwt.DEFAULT,
										currentMsgWidth - delta, Dwt.DEFAULT);
				
			} else {
				delta = 0;
			}
			
			
			
		} else {
			// moving sash down
			var newMsgViewHeight = this._previewView.getSize().y - delta;
			var minMsgViewHeight = 150;
			if (newMsgViewHeight > minMsgViewHeight) {
				this._detailListView.resetSize(Dwt.DEFAULT, this._detailListView.getSize(true).y + delta);
				this._previewView.setBounds(Dwt.DEFAULT, this._previewView.getLocation().y + delta,
							Dwt.DEFAULT, newMsgViewHeight);
			} else {
				delta = 0;
			}
		}
	} else {
		var absDelta = Math.abs(delta);

		if (readingPaneOnRight) {
			// moving sash left
			var currentWidth = this._vertMsgSash.getLocation().x;
			absDelta = Math.max(0, Math.min(absDelta, currentWidth - 300));

			if (absDelta > 0) {
				delta = -absDelta;
				this._detailListView.resetSize(currentWidth - absDelta, Dwt.DEFAULT);
				this._previewView.setBounds(this._previewView.getLocation().x - absDelta, Dwt.DEFAULT,
						this._previewView.getSize(true).x + absDelta, Dwt.DEFAULT);
			} else {
				delta = 0;
			}
		} else {
			// moving sash up
			if (!this._minMLVHeight) {
				var list = this._detailListView.getList();
				if (list && list.size()) {
					var item = list.get(0);
					var div = document.getElementById(this._detailListView._getItemId(item));
					this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT + (Dwt.getSize(div).y * 2);
				} else {
					this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT;
				}
			}

			if (this.getSash().getLocation().y - absDelta > this._minMLVHeight) {
				// moving sash up
				this._detailListView.resetSize(Dwt.DEFAULT, this._detailListView.getSize(true).y - absDelta);
				this._previewView.setBounds(Dwt.DEFAULT, this._previewView.getLocation().y - absDelta,
						Dwt.DEFAULT, this._previewView.getSize(true).y + absDelta);
			} else {
				delta = 0;
			}
		}
	}

	if (delta) {
		this._detailListView._resetColWidth();
		if (readingPaneOnRight) {
			this._vertSashX = this._vertMsgSash.getLocation().x;
		} else {
			this._horizSashY = this._horizMsgSash.getLocation().y;
		}
	}

	return delta;
};

ZmPreviewPaneView.prototype._selectFirstItem =
function() {
	var list = this._detailListView.getList();
	var selectedItem = list ? list.get(0) : null;
	if (selectedItem && !selectedItem.isFolder) {
		this._detailListView.setSelection(selectedItem);
	}else{
        this._previewView.enablePreview(false);
    }
};

ZmPreviewPaneView.prototype.getSash =
function() {
	var readingPaneOnRight = this._controller.isReadingPaneOnRight();
	return readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
};

ZmPreviewPaneView.prototype.getLimit =
function(offset) {
	return this._detailListView.getLimit(offset);
};

ZmPreviewPaneView.prototype.set =
function(list, sortField) {
	this._detailListView.set(list, sortField);
    var list = this._detailListView._zmList;
    if(list)
        list.addChangeListener(new AjxListener(this, this._listViewChangeListener));
    this._previewView.set(null);
};

ZmPreviewPaneView.prototype._listViewChangeListener =
function(ev){
   
    var item = this._detailListView.getSelection();
    item = item && item[0];
    if(item){
         this._listSelectionListener(ev, item);
    }else{
         this._previewView.enablePreview(false);
    }
    
};

ZmPreviewPaneView.prototype._listSelectionTimedAction =
function() {
	if(!this._delayedSelectionItem) {
		return;
	}
	if (this._listSelectionShortcutDelayActionId) {
		AjxTimedAction.cancelAction(this._listSelectionShortcutDelayActionId);
	}
	this._previewView.set(this._delayedSelectionItem);
};

ZmPreviewPaneView.prototype._listSelectionListener = function(ev, item) {

    var item = item || ev.item;
    if (!item) {
    	return;
    }

    var cs = appCtxt.isOffline && appCtxt.getCurrentSearch();
    if (cs) {
        appCtxt.accountList.setActiveAccount(item.getAccount());
    }
    var noChange = ev && ev._details && ev._details.oldFolderId == item.folderId;
    // Ignore (no preview change) if move to same folder, deletion, or multi-select (shift key)
    if ((ev.event === ZmEvent.E_MOVE && noChange) || ev.event === ZmEvent.E_DELETE || ev.shiftKey) {
        return;
    }

    if(ev.field == ZmItem.F_EXPAND && this._detailListView._isExpandable(item)){
        this._detailListView.expandItem(item);   
    } else if(this._controller.isReadingPaneOn() && item){
    	if (ev.kbNavEvent) {
    		if (this._listSelectionShortcutDelayActionId) {
    			AjxTimedAction.cancelAction(this._listSelectionShortcutDelayActionId); 
    		}
    		this._delayedSelectionItem = item;
    		this._listSelectionShortcutDelayActionId = AjxTimedAction.scheduleAction(this._listSelectionShortcutDelayAction,
    				ZmPreviewPaneView.LIST_SELECTION_SHORTCUT_DELAY)
    	} else {
    		this._previewView.set(item);
    	}
    }
};

ZmPreviewPaneView.prototype._toggle =
function(item){
    if(this._detailListView._expanded[item.id]){
        this._detailListView.collapse(item);
    }else{
        this._expand(item);
    }   
};

ZmPreviewPaneView.prototype._expand =
function(item){
    var handleCallback = new AjxCallback(this, this._handleVersions, item);
    if(item && item instanceof ZmBriefcaseItem)
        item.getRevisions(handleCallback);
};

ZmPreviewPaneView.prototype._handleVersions =
function(item, result){
    result =  result.getResponse();
    result = result.ListDocumentRevisionsResponse.doc;

    var revisions = this._getRevisionItems(item, result);
    this._detailListView.expand(item, revisions);
};

ZmPreviewPaneView.prototype._getRevisionItems =
function(item, revisions){
    var revisionItems = [];
    for(var i=0; i<revisions.length; i++){
        var rev = revisions[i];
        var rItem = new ZmRevisionItem(this._getRevisionId(rev), item);
        rItem.set(rev);
        revisionItems.push(rItem);
    }
    return AjxVector.fromArray(revisionItems);
};

ZmPreviewPaneView.prototype._getRevisionId =
function(rev){
    return ( rev.id +'_'+(rev.version||rev.ver));    
};


ZmPreviewPaneView.prototype._restoreVerListener =
function(){
    var items = this._detailListView.getSelection();
    if(!items || items.length == 0) return;
    var verItem = items[0];
    this.restoreVersion(verItem);
};

ZmPreviewPaneView.prototype.restoreVersion =
function(verItem){
    if(verItem.isRevision){
        var item =  verItem.parent;
        if(item && item.version != verItem.revision ){
            item.restoreVersion(verItem.version, new AjxCallback(this, this.refreshItem, item));
        }
    }
};

ZmPreviewPaneView.prototype.deleteVersions =
function(items){
    items = items || this._detailListView.getSelection();
    if(!items || items.length == 0) return;

    var delVerBatchCmd = new ZmBatchCommand(true, null, true);
    for(var i=0; i<items.length; i++){
        delVerBatchCmd.add(new AjxCallback(this, this.deleteVersion, [items[i], delVerBatchCmd]));
    }
    delVerBatchCmd.run();
};

ZmPreviewPaneView.prototype.deleteVersion =
function(verItem, batchCmd){
    if(verItem.isRevision){
        var item =  verItem.parent;
        if(item && item.version != verItem.revision ){
            item.deleteVersion(verItem.version, new AjxCallback(this, this.refreshItem, item), batchCmd);
        }
    }
};

ZmPreviewPaneView.prototype.refreshItem =
function(item){
    this._detailListView.collapse(item, true);    
    this._expand(item);
};


//ZmPreviewView

/**
 * @overview
 * This file contains the Preview Pane View.
 */

/**
 * Creates a Preview view.
 * @class
 * This class represents the contact split view.
 *
 * @param	{Hash}	params		a hash of parameters
 * @extends	DwtComposite
 */

ZmPreviewView = function(params){

    if (arguments.length == 0) { return; }

    this._controller = params.controller;
	params.className = params.className || "ZmPreviewView";
    params.posStyle = Dwt.ABSOLUTE_STYLE;
	DwtComposite.call(this, params);

    this._initialize();

};

ZmPreviewView.prototype = new DwtComposite;
ZmPreviewView.prototype.constructor = ZmPreviewView;

ZmPreviewView.prototype.toString = 
function() {
	return "ZmPreviewView";	
};

ZmPreviewView.prototype._initialize =
function(){

    var htmlElId = this.getHTMLElId();
    this.getHtmlElement().innerHTML = AjxTemplate.expand("briefcase.Briefcase#PreviewView", {id:htmlElId});

    this._headerEl = document.getElementById(htmlElId+"_header");
    this._bodyEl   = document.getElementById(htmlElId+"_body");
    this._containerEl   = document.getElementById(htmlElId+"_container");

    //Create DWT IFrame
    var params = {
		parent: this,
		className: "PreviewFrame",
		id: htmlElId + "_iframe",
		hidden: false,
		html: AjxTemplate.expand("briefcase.Briefcase#NoPreview", {id:htmlElId}),
		noscroll: false,
		posStyle: DwtControl.STATIC_STYLE
	};
	
	
	this._iframePreview = new DwtIframe(params);
	this._iframePreviewId = this._iframePreview.getIframe().id;

    this._iframePreview.reparentHtmlElement(this._bodyEl);

    this._previewContainer = document.getElementById(htmlElId+"_filepreview");
    this._noresultContainer = document.getElementById(htmlElId+"_noitem");

    //Header Elements
    this._headerName = document.getElementById(this._htmlElId+"_name");
    this._headerImage = document.getElementById(this._htmlElId+"_image");   

    this._headerCreated = document.getElementById(this._htmlElId+"_created");
    this._headerCreator = document.getElementById(this._htmlElId+"_creator");
    this._headerModified = document.getElementById(this._htmlElId+"_modified");
    this._headerModifier = document.getElementById(this._htmlElId+"_modifier");
    this._headerLockTime = document.getElementById(this._htmlElId+"_lockTime");
    this._headerLockUser = document.getElementById(this._htmlElId+"_lockUser");

    this._headerNotesSection = document.getElementById(this._htmlElId+"_notes_section");
    this._headerNotes = document.getElementById(this._htmlElId+"_notes");
    this._headerExpand = document.getElementById(this._htmlElId+"_expand");

    this._lockStatus = document.getElementById(this._htmlElId+"_lock");

    Dwt.setHandler(this._headerExpand, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._toggleExpand, this));

    this._iframePreview.getIframe().onload = AjxCallback.simpleClosure(this._updatePreview, this);

    DwtShell.getShell(window).addControlListener(new AjxListener(this, function() { return this._onResize.apply(this, arguments); }));
    this.addControlListener(new AjxListener(this, function() { return this._onResize.apply(this, arguments); }));
};

ZmPreviewView._errorCallback =
function(errorCode, error){

    var previewView = window._zmPreviewView;
    previewView._handleError(previewView._previewItem, errorCode, error);

};

ZmPreviewView.prototype._handleError =
function(item, errorCode, error){

    this.enablePreview(true);

    if(item){

        var restUrl = item.getRestUrl();
        restUrl = AjxStringUtil.fixCrossDomainReference(restUrl);

        //Try to generate, otherwise fallback
        if(ZmMimeTable.isRenderable(item.contentType)){
            this._iframePreview.setSrc(restUrl);
        }else if(ZmMimeTable.isMultiMedia(item.contentType)){
            html = [
                "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "<embed src='",restUrl,"'/>",
                "</div>"
            ].join('');
            this._iframePreview.setIframeContent(html);
        }else{
            //Show Download Link
            var downloadLink = restUrl + (restUrl.match(/\?/) ? '&' : '?') + "disp=a";
            var html = [
                "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;font-family: \'Helvetica Neue\',Helvetica,Arial,\'Liberation Sans\',sans-serif;'>",
                    AjxMessageFormat.format(ZmMsg.previewDownloadLink, downloadLink),
                "</div>"
            ].join('');
            this._iframePreview.setIframeContent(html);
        }
        
    }    
};        

ZmPreviewView.prototype._setupErrorCallback =
function(url){

    if(!window._zmPreviewView)
        window._zmPreviewView = this;

    url = url + ( url.match(/\?/) ? '&' : '?' ) + "callback=ZmPreviewView._errorCallback";

    return url;
};

ZmPreviewView.prototype.set = function(item) {

    if (!item){
        this.enablePreview(false);
        return;
    }

    if (item === this._previewItem) {
        return;
    }

    this._oldItem = this._previewItem;
    this._previewItem = item;
    this.enablePreview(true);

    this._previewContent = false;

    if (item.isFolder) {
        this._setFolder(item);
        return;
    }


    this._setHeader(item);

    var restUrl = item.getRestUrl();
    restUrl = AjxStringUtil.fixCrossDomainReference(restUrl);

    if (ZmMimeTable.isWebDoc(item.contentType)) {
        restUrl = restUrl + ( restUrl.match(/\?/) ? '&' : '?' ) + "viewonly=1";
    }
    else {

        this._setupLoading();

        //Send everything trough ConvertD
        restUrl = this._setupErrorCallback(restUrl);
        restUrl += ( restUrl.match(/\?/) ? '&' : '?' ) + "fmt=native&view=html";
    }

    this._iframePreview.setSrc(restUrl);
	Dwt.setLoadedTime("ZmBriefcaseItem"); //iframe src set but item may not be downloaded by browser
};

ZmPreviewView.prototype._setupLoading =
function(){

    var html = [
        "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",ZmMsg.generatingPreview,"</div>"
    ].join('');
    try{
        this._iframePreview.setIframeContent(html);
    }catch(ex){
        //At times the previous item is not loaded or in the process of loading, causes iframe.body to be null.
        DBG.println("ZmPreviewView#_setupLoading");
        DBG.println("New Item:"+ this._previewItem.name );
		DBG.println("&nbsp;&nbsp;"+ex);
    }
};

ZmPreviewView.prototype._resetIframeHeight =
function(){
    var iframe = this._iframePreview.getIframe();
    var doc = this._iframePreview.getDocument();
    var origHeight = AjxEnv.isIE ? doc.body.scrollHeight : 0;
    var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, origHeight);
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
};

ZmPreviewView.prototype._setFolder =
function(item){

    this._cleanup();
    //Name
    this._headerName.innerHTML = AjxStringUtil.htmlEncode(item.name);
    //Briefcase icon
    this._headerImage.className = "ImgBriefcase_48";
    if(this._headerModifier)
        this._headerModifier.innerHTML = item.getOwner();
    this._setIframeContent(AjxTemplate.expand('briefcase.Briefcase#FolderPreview'));
};

ZmPreviewView.prototype._setIframeContent =
function(html){
    this._previewContent = html;
    this._iframePreview.setSrc('javascript:\"\";');
};

ZmPreviewView.prototype._updatePreview =
function(){
    if(this._previewContent){
        this._iframePreview.setIframeContent(this._previewContent);
        this._previewContent = false;
    }
	else {
	    var iframeDoc = this._iframePreview && this._iframePreview.getDocument();
	    if (!iframeDoc) {
		    return;
	    }
	    this._iframePreview._resetEventHandlers();  //for resizing reading pane on right
        var images = iframeDoc && iframeDoc.getElementsByTagName("img");
	    if (images && images.length) {
		    for (var i = 0; i <images.length; i++) {
			    var dfsrc = images[i].getAttribute("dfsrc");
			    if (dfsrc && dfsrc.match(/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\_\.]*(\?\S+)?)?)?/)) {
				    // Fix for IE: Over HTTPS, http src urls for images might cause an issue.
				    try {
					    images[i].src = ''; //unload it first
					    images[i].src = dfsrc;
				    } catch (ex) {
					    // do nothing
				    }
			    }
		    }
	    }
    }
};


ZmPreviewView.prototype._cleanup =
function(){

    this._headerName.innerHTML = "";

    this._headerImage.className = "ImgUnknownDoc_48";

    if(this._headerModified)
        this._headerModified.innerHTML = "";
    if(this._headerCreated)
        this._headerCreated.innerHTML = "";
    if(this._headerCreator)
        this._headerCreator.innerHTML = "";
    if(this._lockStatus)
        this._lockStatus.innerHTML = AjxImg.getImageHtml("Blank_16");
    if(this._headerLockTime){
        this._headerLockTime.innerHTML = "";
    }
    if(this._headerLockUser){
        this._headerLockUser.innerHTML = "";
    }
    Dwt.setVisible(this._headerNotesSection, false);

    this._previewContent = false;

};

ZmPreviewView.prototype._setHeader =
function(item){

    //Name
    this._headerName.innerHTML = AjxStringUtil.htmlEncode(item.name);

    //Image icon
    var contentType = item.contentType;
    if(contentType && contentType.match(/;/)) {
        contentType = contentType.split(";")[0];
    }
    var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
    var icon = "Img" + ( mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48");
    this._headerImage.className = icon;

    //Modified & Created.  For Modified, use contentChangeDate, which is content modification (modifiedDate is
	// content and metaData changes).
    var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
    if (this._headerModified && item.contentChangeDate) {
        this._headerModified.innerHTML = dateFormatter.format(item.contentChangeDate);
	}
    if(this._headerModifier)
        this._headerModifier.innerHTML = item.modifier;
    if (this._headerCreated && item.createDate) {
        this._headerCreated.innerHTML = dateFormatter.format(item.createDate);
	}
    if(this._headerCreator)
        this._headerCreator.innerHTML = item.creator;

    if(this._lockStatus)
        this._lockStatus.innerHTML = AjxImg.getImageHtml(item.locked ? "Padlock" : "Blank_16");

    if(this._headerLockTime){
        if(item.locked){
            dateFormatter = AjxDateFormat.getDateInstance();
            this._headerLockTime.innerHTML = dateFormatter.format(item.lockTime);
        }else{
            this._headerLockTime.innerHTML = ""
        }        
    }

    if(this._headerLockUser){
        this._headerLockUser.innerHTML = item.locked ? item.lockUser : "";
    }

    this.setNotes(item);

    this._onResize();
};

ZmPreviewView.prototype.setNotes =
function(item){
    var visible = item.subject;
    Dwt.setVisible(this._headerNotesSection, visible);
    if(visible && this._headerNotes){
        this._headerNotes.innerHTML = AjxStringUtil.nl2br(item.subject);
    }
    this.expandNotes(false);
};

ZmPreviewView.prototype.expandNotes =
function(expand){

    this._expandState = expand;

    if(this._headerNotes){
        this._headerNotes.style.height = expand ? "" : "15px";
    }
    if(this._headerExpand){
       this._headerExpand.innerHTML = AjxImg.getImageHtml((expand ? "NodeExpanded" : "NodeCollapsed"));
    }
};

ZmPreviewView.prototype._toggleExpand =
function(){
    this.expandNotes(!this._expandState);
};

ZmPreviewView.prototype.downloadListener =
function(item){
    this._controller.downloadFile(item);
};

ZmPreviewView.prototype.emailListener =
function(item){
    this._controller.sendFilesAsAttachment(item);
};

ZmPreviewView.prototype.openListener =
function(item){
    this._controller.openFile(item);
};

ZmPreviewView.prototype.editListener =
function(item){
    this._controller.editFile(item);
};

ZmPreviewView.prototype.enablePreview =
function(enabled){
    if(enabled){
        Dwt.setDisplay(this._previewContainer, Dwt.DISPLAY_INLINE);
        Dwt.setDisplay(this._noresultContainer, Dwt.DISPLAY_NONE);
    }else{
        Dwt.setDisplay(this._previewContainer, Dwt.DISPLAY_NONE);
        Dwt.setDisplay(this._noresultContainer, Dwt.DISPLAY_INLINE);
    }
};

ZmPreviewView.prototype._onResize =
function() {
    if (this._containerEl && this._bodyEl) {
        // in order to adapt to decreasing sizes in IE, make the body
        // very small before getting its parent's size
        Dwt.setSize(this._bodyEl, 1, 1);

        var size = Dwt.getSize(this._containerEl);
        Dwt.setSize(this._bodyEl, size.x, size.y);
    }
};
