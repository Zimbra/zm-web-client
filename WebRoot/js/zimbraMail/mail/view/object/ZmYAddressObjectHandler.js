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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmYAddressObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt, ZmYAddressObjectHandler.TYPE);
}

ZmYAddressObjectHandler.prototype = new ZmObjectHandler;
ZmYAddressObjectHandler.prototype.constructor = ZmYAddressObjectHandler;

// Consts
ZmYAddressObjectHandler.TYPE = "yaddress";
// TODO This regex is very very simple.  It only matches single line simple addresses like:
// 1234 Main St City CA 99999
ZmYAddressObjectHandler.ADDRESS_RE = /[\w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,}\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?\b/ig;

// Y! Maps Service URL
ZmYAddressObjectHandler.URL = "http://api.local.yahoo.com/MapsService/V1/mapImage?appid=ZimbraMail&zoom=4&image_height=245&image_width=345&location=";

// Make DOM safe id's
ZmYAddressObjectHandler.encodeId = function(s) {
	return s.replace(/[^A-Za-z0-9]/g, "");
};

ZmYAddressObjectHandler.CACHE = new Array();

ZmYAddressObjectHandler.prototype.match =
function(line, startIndex) {
	ZmYAddressObjectHandler.ADDRESS_RE.lastIndex = startIndex;
	return ZmYAddressObjectHandler.ADDRESS_RE.exec(line);
};

ZmYAddressObjectHandler.prototype._getHtmlContent =
function(html, idx, address, context) {
	var	url = "http://maps.yahoo.com/beta/#maxp=search&q1="+AjxStringUtil.htmlEncode(address);
    html[idx++] = '<a target="_blank" href="'+url+'">'+AjxStringUtil.htmlEncode(address)+'</a>';	
	return idx;
};

ZmYAddressObjectHandler.prototype.getToolTipText =
function(obj, context) {
	return '<iframe scrolling="no" frameborder="0" marginWidth="0" marginHeight="0" width="345" height="245" src="" id="'+ZmYAddressObjectHandler.encodeId(obj)+'">' + obj + '</iframe>';
};

ZmYAddressObjectHandler.prototype.populateToolTip =
function(obj, context) {
	if (ZmYAddressObjectHandler.CACHE[obj+"img"]) {
		ZmYAddressObjectHandler.displayImage(ZmYAddressObjectHandler.CACHE[obj+"img"], obj);
	} else {
		var request = new AjxRpcRequest("yahoomaps");
		var url = "/service/proxy?target="+ AjxStringUtil.urlEncode(ZmYAddressObjectHandler.URL + obj);
		DBG.println(AjxDebug.DBG2, "ZmYAddressObjectHandler url " + url);
		request.invoke(null, url, null, new AjxCallback(this, this._callback, obj), true);
	}
};

ZmYAddressObjectHandler.displayImage = 
function(img_src, obj) {
	var element = document.getElementById(ZmYAddressObjectHandler.encodeId(obj));
	element.src = img_src;

    if(!ZmYAddressObjectHandler.CACHE[obj+"img"]) {
		ZmYAddressObjectHandler.CACHE[obj+"img"] = img_src;
	}
};

ZmYAddressObjectHandler.prototype._callback = 
function(args) {
	// Quick parser
	var r = args[1].text;
	ZmYAddressObjectHandler.displayImage(r.substring(r.indexOf("http://img"),r.indexOf("</Result>")), args[0]);
};

ZmObjectManager.registerHandler("ZmYAddressObjectHandler");