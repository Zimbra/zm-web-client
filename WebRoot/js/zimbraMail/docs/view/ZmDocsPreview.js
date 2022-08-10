/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmDocsPreview = function(container, params){

    this._container = document.getElementById(container);

    params = params || {};
    if(params.versionCont)
        params.versionCont = document.getElementById(params.versionCont);
    if(params.dateContainer){
        params.dateContainer = document.getElementById(params.dateContainer);
    }
    this._params = params;

    if(!params.deferInit)   this.init();

};

ZmDocsPreview.prototype.constructor = ZmDocsPreview;

//TODO: Make ZmPreview base class sto isolate all the common methods for Documents
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
    var params = this._params;
    if(params.versionCont){
       params.versionCont.innerHTML = this._params.version;
    }
    if(params.dateContainer && params.dateModified){
        //bug:50533, Server sends GMT, convert it into Client timezone
        var dateModified = new Date(params.dateModified);
        params.dateModified = AjxTimezone.convertTimezone(dateModified, AjxTimezone.GMT ,AjxTimezone.DEFAULT);
        var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
        params.dateContainer.innerHTML = dateFormatter.format(params.dateModified) || params.dateModified;
    }
	this.fixImages();

};

ZmDocsPreview.prototype.fixImages = 
function() {
	var images = document.getElementsByTagName("img");
	
	for (var i = 0; i < images.length; i++) {
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
};
