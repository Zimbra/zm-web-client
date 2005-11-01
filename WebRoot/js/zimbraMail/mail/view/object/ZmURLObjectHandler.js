/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmURLObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt, ZmURLObjectHandler.TYPE);
}

ZmURLObjectHandler.prototype = new ZmObjectHandler;
ZmURLObjectHandler.prototype.constructor = ZmURLObjectHandler;

ZmURLObjectHandler.TYPE = "url";
ZmURLObjectHandler.URL_RE = /((telnet:)|((https?|ftp|gopher|news|file):\/\/)|(www\.[\w\.\_\-]+))[^\s\xA0\(\)\<\>\[\]\{\}\'\"]*/ig;
ZmURLObjectHandler.THUMB_URL = "http://pthumbnails.alexa.com/image_server.cgi?id=" + document.domain + "&url=";

ZmURLObjectHandler.prototype.match =
function(line, startIndex) {
	ZmURLObjectHandler.URL_RE.lastIndex = startIndex;
	var m = ZmURLObjectHandler.URL_RE.exec(line);
	if (!m) {return null;}
	
	var last = m[0].charAt(m[0].length-1);
	if (last == '.' || last == ",") {
		var m2 = {index: m.index };
		m2[0] = m[0].substring(0, m[0].length-1);
		return m2;
	} else {
		return m;
	}
};

ZmURLObjectHandler.prototype._getHtmlContent =
function(html, idx, url) {
	var escapedUrl = url.replace(/\"/g, '\"');
	if (escapedUrl.substr(0,4) == 'www.') {
		escapedUrl = "http://"+escapedUrl+"/";
	}
	html[idx++] = '<a target="_blank" href="'+escapedUrl+'">'+AjxStringUtil.htmlEncode(url)+'</a>';	
	return idx;
};
	
ZmURLObjectHandler.prototype.getToolTipText =
function(url, context) {
	// Pre-load the image
	(new Image()).src =  ZmURLObjectHandler.THUMB_URL + url;
	return '<iframe frameborder="0" width="205" height="150" src="' + ZmURLObjectHandler.THUMB_URL + url + '"></iframe>';
};

ZmURLObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};
