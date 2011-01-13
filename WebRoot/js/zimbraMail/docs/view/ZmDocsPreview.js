/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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

ZmDocsPreview = function(container, params){

    this._container = document.getElementById(container);

    params = params || {};
    if(params.versionCont)
        params.versionCont = document.getElementById(params.versionCont);
    this._params = params;

    if(!params.deferInit)   this.init();

};

ZmDocsPreview.prototype.constructor = ZmDocsPreview;

//TODO: Make ZmPreview base class sto isolate all the common methods for Documents/Spreadsheets/Slides
//ZmDocsPreview.prototype = new ZmPreview

ZmDocsPreview.launch =
function(container, params){
    return ( new ZmDocsPreview(container, params) );
};

ZmDocsPreview.prototype.init =
function(){
    this.loadContent(new AjxCallback(this, this.show));
};

ZmDocsPreview.prototype.loadContent =
function(callback){
    if(!this._content){
        this.fetchContent(callback);
        return;
    }

    if(callback) callback.run();
};

ZmDocsPreview.prototype.getContent =
function(){
    return this._content;
};

ZmDocsPreview.prototype.fetchContent =
function(callback){

    var serverUrl = window.location.href;
    serverUrl = serverUrl.replace(/\?.*/,''); //Cleanup Params

    var urlParams = [];
    urlParams.push("fmt=native");

    var version = this._params.version;
    if(version)
        urlParams.push("ver="+version);

    urlParams = urlParams.join('&');
    serverUrl = serverUrl + ( urlParams.length > 0 ? "?" : "" ) + urlParams;

    AjxRpc.invoke(urlParams, serverUrl, null, new AjxCallback(this, this._handleFetchContent, callback), true);
    
};

ZmDocsPreview.prototype._handleFetchContent =
function(callback, response){
   this._content = response.text;
   if(callback)
        callback.run();
};

ZmDocsPreview.prototype.show =
function(){
    var previewHTML = this._content;
    this._container.innerHTML = previewHTML;
    if(this._params.versionCont){
        this._params.versionCont.innerHTML = this._params.version;
    }
};
