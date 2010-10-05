/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
    var version = this._params.version;
    var urlParams = version ? ("?ver="+version) : "";
    serverUrl = serverUrl +  urlParams;
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

ZmDocsPreview._createDBG = function(devMode){

    var isDevMode = /^(1|true|on|yes)$/i.test(devMode);

    if(isDevMode){
        AjxDispatcher.require("Debug");
        window.DBG = new AjxDebug(AjxDebug.NONE, null, false);
    }else {
        window.AjxDebug = function() {};
        window.AjxDebug.prototype.toString		= function() { return "dummy DBG class"};
        window.AjxDebug.prototype.display		= function() {};
        window.AjxDebug.prototype.dumpObj		= function() {};
        window.AjxDebug.prototype.getDebugLevel	= function() {};
        window.AjxDebug.prototype.isDisabled	= function() {};
        window.AjxDebug.prototype.println		= function() {};
        window.AjxDebug.prototype.printRaw		= function() {};
        window.AjxDebug.prototype.printXML		= function() {};
        window.AjxDebug.prototype.setDebugLevel	= function() {};
        window.AjxDebug.prototype.setTitle		= function() {};
        window.AjxDebug.prototype.showTiming	= function() {};
        window.AjxDebug.prototype._getTimeStamp	= function() {};
        window.AjxDebug.prototype.timePt		= function() {};
        window.DBG = new window.AjxDebug();
    }
};
