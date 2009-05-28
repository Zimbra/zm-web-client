/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmAddressObjectHandler = function() {

	ZmObjectHandler.call(this, ZmAddressObjectHandler.TYPE);
}

ZmAddressObjectHandler.prototype = new ZmObjectHandler;
ZmAddressObjectHandler.prototype.constructor = ZmAddressObjectHandler;

// Consts
ZmAddressObjectHandler.TYPE = "address";
// TODO This regex is very very simple.  It only matches single line simple addresses like:
// 1234 Main St City CA 99999
ZmAddressObjectHandler.ADDRESS_RE = /[\w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,}\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?\b/ig;

// Y! maps geocoder, since Google doesn't have one.
ZmAddressObjectHandler.URL = "http://api.local.yahoo.com/MapsService/V1/geocode?appid=ZimbraMail&location=";

// Make DOM safe id's
ZmAddressObjectHandler.encodeId = function(s) {
	return s.replace(/[^A-Za-z0-9]/g, "");
};

ZmAddressObjectHandler.CACHE = new Array();

// Public methods

ZmAddressObjectHandler.prototype.match =
function(line, startIndex) {
	ZmAddressObjectHandler.ADDRESS_RE.lastIndex = startIndex;
	return ZmAddressObjectHandler.ADDRESS_RE.exec(line);
};

ZmAddressObjectHandler.prototype._getHtmlContent =
function(html, idx, address, context) {
	var	url = "http://maps.google.com/maps?q="+AjxStringUtil.htmlEncode(address);
    html[idx++] = '<a target="_blank" href="'+url+'">'+AjxStringUtil.htmlEncode(address)+'</a>';	
	return idx;
};

ZmAddressObjectHandler.prototype.getToolTipText =
function(obj, context) {
	return '<div class="AddressContent" id="'+ZmAddressObjectHandler.encodeId(obj)+'"> </div>';
};

ZmAddressObjectHandler.prototype.populateToolTip =
function(obj, context) {
	if(ZmAddressObjectHandler.CACHE[obj+"lng"] && ZmAddressObjectHandler.CACHE[obj+"lat"]) {
		ZmAddressObjectHandler.displayMap(ZmAddressObjectHandler.CACHE[obj+"lng"], 
		                                  ZmAddressObjectHandler.CACHE[obj+"lat"], obj);
	} else {
		var url = "/service/proxy?target=" + AjxStringUtil.urlEncode(ZmAddressObjectHandler.URL + AjxStringUtil.htmlEncode(obj));
		AjxRpc.invoke(null, url, null, new AjxCallback(this, this._callback, obj), true);
	}
};

ZmAddressObjectHandler.prototype._callback = 
function(arg0, arg1) {
	// Quick RDF parser
	var r = arg1.text;
	var lg_s = r.indexOf("<Longitude>");
	var lg_e = r.indexOf("</Longitude>");
	var lt_s = r.indexOf("<Latitude>");
	var lt_e = r.indexOf("</Latitude>");
	ZmAddressObjectHandler.displayMap(r.substring(lg_s+11,lg_e), r.substring(lt_s+10,lt_e), arg0);
};

ZmAddressObjectHandler.displayMap = function(lng, lat, obj) {
	DBG.println(AjxDebug.DBG2, "gMAPS: lat: " + lat + " long: " + lng + " obj: '" + obj + "'");
	var element = document.getElementById(ZmAddressObjectHandler.encodeId(obj));
    var map = new GMap(element);
    var point = new GPoint(lng, lat);
    map.centerAndZoom(point, 4);
	var marker = new GMarker(point);
	map.addOverlay(marker);
	marker.openInfoWindowHtml("<div id=\""+ZmAddressObjectHandler.encodeId(obj)+"tip\" style=\"width:255px\"><b>"+obj+"</b></div>");
    if(!ZmAddressObjectHandler.CACHE[obj+"lng"] || !ZmAddressObjectHandler.CACHE[obj+"lat"]) {
		DBG.println(AjxDebug.DBG2, "gMAPS: Adding to cache");
		ZmAddressObjectHandler.CACHE[obj+"lng"] = lng;
		ZmAddressObjectHandler.CACHE[obj+"lat"] = lat;
	}
};

//ZmObjectManager.registerHandler("ZmAddressObjectHandler",ZmAddressObjectHandler.TYPE, 27);