/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WIT HOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the Preview Pane View.
 */

/**
 * Creates a Briefcase split view.
 * @class
 * This class represents the contact split view.
 *
 * @param	{Hash}	params		a hash of parameters
 * @extends	DwtComposite
 */
ZmBriefcaseSplitView = function(parent, controller, dropTgt) {

	if (arguments.length == 0) { return; }

    var params = {
        parent:parent,
        className:"ZmBriefcaseSplitView",
        view:ZmId.VIEW_BRIEFCASE_PREVIEW,
        controller:controller,
        dropTgt:dropTgt,
        posStyle: Dwt.ABSOLUTE_STYLE
    };
	DwtComposite.call(this, params);

    this._controller = controller;
	this.setScrollStyle(Dwt.CLIP);

    this._initialize();

};

ZmBriefcaseSplitView.prototype = new DwtComposite;
ZmBriefcaseSplitView.prototype.constructor = ZmBriefcaseSplitView;

ZmBriefcaseSplitView.prototype._initialize =
function(){
    
    //Initialize UI

    var htmlElId = this.getHTMLElId();

    this.getHtmlElement().innerHTML = AjxTemplate.expand("briefcase.Briefcase#BriefcaseSpitView", {id:htmlElId});

    var containerEl = document.getElementById(htmlElId + "_listview");
    this._briefcaseListView = new ZmColListView(this, this._controller);
    this._briefcaseListView.reparentHtmlElement(containerEl);

    containerEl = document.getElementById(htmlElId + "_preview");
    this._previewView = new ZmPreviewView({parent:this, controller:this._controller});
    this._previewView.reparentHtmlElement(containerEl);
    
    //Initialize Handlers
    this._briefcaseListView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
    

};

ZmBriefcaseSplitView.prototype._listSelectionListener =
function(ev){
    this._previewView.set(ev.item);
};

ZmBriefcaseSplitView.prototype.toString =
function() {
	return "ZmBriefcaseSplitView";
};

ZmBriefcaseSplitView.prototype.getListView =
function() {
	return this._briefcaseListView;
};

ZmBriefcaseSplitView.prototype.set =
function(list) {
    var listView = this._briefcaseListView;
    //Remove Folders
    /*for(var i=0; i<list.size(); i++){
        var item = list.get(i);
        if(item.isFolder && item.folder)
           list.remove(item);
    }*/
    listView.set(list, null, true);
    var briefcaseList = listView.getList();
    if (briefcaseList && briefcaseList.size() > 0) {
        listView.setSelection(briefcaseList.get(0));
    }else{
        this._previewView.enablePreview(false);
    }
};

ZmBriefcaseSplitView.prototype.getController =
function(){
    return this._controller;
};

ZmBriefcaseSplitView.prototype.getTitle =
function(){
    return [ZmMsg.zimbraTitle, ZmMsg.briefcase, ZmMsg.preview].join(': ');
};



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

    this.enablePreview(true);

    this._setHeader(item);

    //Load Body
    var html=[], idx=0;
    var restUrl = item.getRestUrl();
    if(ZmMimeTable.isRenderableImage(item.contentType)){
        //this._iframePreview.setSrc();
        html = [
            "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "<img src='",restUrl,"'>",
            "</div>"
        ].join('');
        this._iframePreview.setIframeContent(html);
    }else if(this._controller.isConvertable(item) && appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)){
        restUrl += ( restUrl.match(/\?/) ? '&' : '?' ) + "view=html";
        this._iframePreview.setSrc(restUrl);
    }else if(ZmMimeTable.isRenderable(item.contentType)){
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
        //Show Open Link
        /*html = [
            "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "We cannot generate the preview of the file. Click here to <a href='javascript:;' id='",item.id,"_open' >open</a> it.",
            "</div>"
        ].join('');
        this._iframePreview.setIframeContent(html);
        var iDoc = this._iframePreview.getDocument();
        var el = iDoc.getElementById(item.id+'_open');
        Dwt.setHandler(el, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.openListener, this, item));*/
    }else{
        //Show Download Link
        html = [
            "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
                "We cannot generate the preview of the file. Click here to <a href='javascript:;' id='",item.id,"_download' >download</a> it.",
            "</div>"
        ].join('');
        this._iframePreview.setIframeContent(html);
        var iDoc = this._iframePreview.getDocument();
        var el = iDoc.getElementById(item.id+'_download');
        Dwt.setHandler(el, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this.downloadListener, this, item));
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
    this._controller._downloadFile(item);        
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

