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

	this.setReadingPane();
};

ZmPreviewPaneView.prototype = new DwtComposite;
ZmPreviewPaneView.prototype.constructor = ZmPreviewPaneView;

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

ZmPreviewPaneView.prototype.resetPreviewPane =
function(newPreviewStatus, oldPreviewStatus){

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
			var listViewWidth = this._vertSashX || (Number(ZmMsg.LISTVIEW_WIDTH)) || Math.floor(newWidth / 3);
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
			var currentMsgWidth = this._previewView.getSize().x;
			delta = Math.max(0, Math.min(delta, currentMsgWidth - minMsgViewWidth));
			var newListWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._detailListView.getSize().x) + delta;

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
				this._detailListView.resetSize(Dwt.DEFAULT, this._detailListView.getSize().y + delta);
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
			if (!this._minMLVWidth) {
				var firstHdr = this._detailListView._headerList[0];
				var hdrWidth = firstHdr._width;
				if (hdrWidth == "auto") {
					var header = document.getById(firstHdr._id);
					hdrWidth = header && Dwt.getSize(header).x;
				}
				this._minMLVWidth = hdrWidth;
			}

			var currentWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._detailListView.getSize().x);
			absDelta = Math.max(0, Math.min(absDelta, currentWidth - this._minMLVWidth));

			if (absDelta > 0) {
				delta = -absDelta;
				this._detailListView.resetSize(currentWidth - absDelta, Dwt.DEFAULT);
				this._previewView.setBounds(this._previewView.getLocation().x - absDelta, Dwt.DEFAULT,
										this._previewView.getSize().x + absDelta, Dwt.DEFAULT);
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
				this._detailListView.resetSize(Dwt.DEFAULT, this._detailListView.getSize().y - absDelta);
				this._previewView.setBounds(Dwt.DEFAULT, this._previewView.getLocation().y - absDelta,
										Dwt.DEFAULT, this._previewView.getSize().y + absDelta);
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
	if (selectedItem) {
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

ZmPreviewPaneView.prototype._staleHandler =
function() {
	var search = this._controller._currentSearch;
	if (search) {
		search.lastId = search.lastSortVal = null
		search.offset = search.limit = 0;
		appCtxt.getSearchController().redoSearch(search);
	}
};

ZmPreviewPaneView.prototype.set =
function(list, sortField) { 
	this._detailListView.set(list, sortField);
    this._selectFirstItem();
};

ZmPreviewPaneView.prototype._listSelectionListener =
function(ev){
    if(this._controller.isReadingPaneOn())
        this._previewView.set(ev.item);
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

ZmPreviewView.prototype._initialize =
function(){

    var htmlElId = this.getHTMLElId();
    this.getHtmlElement().innerHTML = AjxTemplate.expand("briefcase.Briefcase#PreviewView", {id:htmlElId});

    this._headerEl = document.getElementById(htmlElId+"_header");
    this._bodyEl   = document.getElementById(htmlElId+"_body");

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
    this._headerSize = document.getElementById(this._htmlElId+"_size");
    this._headerPath = document.getElementById(this._htmlElId+"_path");

    this._headerCreated = document.getElementById(this._htmlElId+"_created");
    this._headerCreator = document.getElementById(this._htmlElId+"_creator");
    this._headerModified = document.getElementById(this._htmlElId+"_modified");
    this._headerModifier = document.getElementById(this._htmlElId+"_modifier");

    this._headerItemDownload = document.getElementById(this._htmlElId+"_download");
    this._headerItemEmail = document.getElementById(this._htmlElId+"_email");

};

ZmPreviewView.prototype.set =
function(item){

    if(!item){
        this.enablePreview(false);
        return;
    }

    this.enablePreview(true);

    this._setHeader(item);

    //Load Body
    var html=[], idx=0;
    var restUrl = item.getRestUrl();
    restUrl = this._controller.getApp().fixCrossDomainReference(restUrl);
    if(ZmMimeTable.isRenderableImage(item.contentType)){
        //this._iframePreview.setSrc();
        html = [
            "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "<img src='",restUrl,"'>",
            "</div>"
        ].join('');
        this._iframePreview.setIframeContent(html);
    }else if( this.isConvertable(item) && appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)){
        restUrl += ( restUrl.match(/\?/) ? '&' : '?' ) + "view=html";
        this._iframePreview.setSrc(restUrl);
    }else if(ZmMimeTable.isRenderableImage(item.contentType)){
        this._iframePreview.setSrc(restUrl);
    }else if(ZmMimeTable.isMultiMedia(item.contentType)){
        html = [
            "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "<embed src='",restUrl,"'/>",
            "</div>"
        ].join('');
        this._iframePreview.setIframeContent(html);
    }else if(ZmMimeTable.isWebDoc(item.contentType)){
        restUrl = restUrl +"&preview=1&viewonly=1";
        this._iframePreview.setSrc(restUrl);        
    }else{
        //Show Download Link

        var downloadLink = restUrl+ "?disp=a"+(item.version ? "&ver="+item.version : "");

        html = [
            "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "We cannot generate the preview of the file. Click here to <a href='",downloadLink,"' target='_blank' >download</a> it.",
            "</div>"
        ].join('');
        this._iframePreview.setIframeContent(html);
    }

   // AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._resetIframeHeight), 100);
};


ZmPreviewView.prototype.isConvertable =
function(item){
    var type = item.contentType;
    return ( this._controller.isConvertable(item)/*name based*/ ||
            type == ZmMimeTable.TEXT_HTML || type == ZmMimeTable.TEXT_PLAIN );   //CT based
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

ZmPreviewView.prototype._setHeader =
function(item){

    //Name
    this._headerName.innerHTML = item.name;

    //Image icon
    var contentType = item.contentType;
    if(contentType && contentType.match(/;/)) {
        contentType = contentType.split(";")[0];
    }
    var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
    var icon = "Img" + ( mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48");
    this._headerImage.className = icon;

    //Size
    var size = item.size;
    if (size && size >= 0) {
        var sizeStr = ''
        if (size < 1024)		sizeStr = size + " "+ZmMsg.b;//" B";
        else if (size < (1024*1024) )	sizeStr = Math.round((size / 1024) * 10) / 10 + " "+ZmMsg.kb;//" KB";
        else    sizeStr = Math.round((size / (1024*1024)) * 10) / 10 + " "+ZmMsg.mb;//" MB";
        this._headerSize.innerHTML = sizeStr;
    }

    //Path
    var organizer = appCtxt.getById(item.folderId);
    if(organizer){
        this._headerPath.innerHTML = organizer.getSearchPath();
    }


    //Modified & Created
    var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
    this._headerModified.innerHTML = dateFormatter.format(item.modifyDate);
    this._headerModifier.innerHTML = item.modifier;
    this._headerCreated.innerHTML = dateFormatter.format(item.createDate);
    this._headerCreator.innerHTML = item.creator;

    if(ZmMimeTable.isWebDoc(item.contentType)) {
        this._headerItemDownload.innerHTML = ZmMsg.edit;
        Dwt.setHandler(this._headerItemDownload, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.editListener, this, item));
    }else{
        this._headerItemDownload.innerHTML = ZmMsg.download;
        Dwt.setHandler(this._headerItemDownload, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.downloadListener, this, item));
    }
    Dwt.setHandler(this._headerItemEmail, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.emailListener, this, item));

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



