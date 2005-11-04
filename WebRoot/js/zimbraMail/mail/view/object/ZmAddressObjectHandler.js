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

function ZmAddressObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, ZmAddressObjectHandler.TYPE);
}

ZmAddressObjectHandler.prototype = new ZmObjectHandler;
ZmAddressObjectHandler.prototype.constructor = ZmAddressObjectHandler;

// Consts
ZmAddressObjectHandler.TYPE = "gaddress";
// TODO This regex is very very simple.  It only matches single line simple addresses like:
// 1234 Main St City CA 99999
ZmAddressObjectHandler.ADDRESS_RE = /[\w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,}\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?/ig;

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

ZmYAddressObjectHandler.prototype._geocodeCallback = 
function(args) {
	// Quick RDF parser
	var r = args[1].text;
	var lg_s = r.indexOf("<Longitude>");
	var lg_e = r.indexOf("</Longitude>");
	var lt_s = r.indexOf("<Latitude>");
	var lt_e = r.indexOf("</Latitude>");
	ZmAddressObjectHandler.displayMap(r.substring(lg_s+11,lg_e), r.substring(lt_s+10,lt_e), args[0]);
};

ZmAddressObjectHandler.prototype.populateToolTip =
function(obj, context) {
	if(ZmAddressObjectHandler.CACHE[obj+"lng"] && ZmAddressObjectHandler.CACHE[obj+"lat"]) {
		DBG.println(AjxDebug.DBG2, "gMAPS: Using cache");
		ZmAddressObjectHandler.displayMap(ZmAddressObjectHandler.CACHE[obj+"lng"], 
		                                  ZmAddressObjectHandler.CACHE[obj+"lat"], obj);
	} else {
		DBG.println(AjxDebug.DBG2, "gMAPS: New Request");
		var request = new AjxRpcRequest("geocode");
		var url = "/zimbra/zimlets/geocode.jsp?address=" + AjxStringUtil.urlEncode(obj);
		request.invoke(null, url, null, new AjxCallback(this, this._geocodeCallback, obj), true);
	}
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

/* Sticky tool tips not ready yet.
ZmAddressObjectHandler.prototype.hoverOver = function(object, context, x, y) {
	var shell = DwtShell.getShell(window);
	var tooltip = new DwtStickyToolTip(shell);
	tooltip.setTitle(object); // NOTE: object is address string
	tooltip.setContent(this.getToolTipText(object, context));
	this.populateToolTip(object, context);
	tooltip.popup(x, y);

}
ZmAddressObjectHandler.prototype.hoverOut = function(object, context) {
	// no-op
}
*/