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

ZmAddressObjectHandler.TYPE = "address";
// TODO This regex is very very simple.  It only matches single line simple addresses like:
// 1234 Main St City CA 99999
ZmAddressObjectHandler.ADDRESS_RE = /[\w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,}\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?/ig;

// Make DOM safe id's
ZmAddressObjectHandler.encodeId = function(s) {
	return s.replace(/[^A-Za-z0-9]/g, "");
};

ZmAddressObjectHandler.CACHE = new Array();
// Pre-load a couple addresses for off-line testing
ZmAddressObjectHandler.CACHE["2510 Fairview Ave Seattle WA 98102"+"lng"] = "-122.328914";
ZmAddressObjectHandler.CACHE["2510 Fairview Ave Seattle WA 98102"+"lat"] = "47.642286";
ZmAddressObjectHandler.CACHE["1801 Varsity Dr Raleigh NC 27606"+"lng"] = "-78.683064";
ZmAddressObjectHandler.CACHE["1801 Varsity Dr Raleigh NC 27606"+"lat"] = "35.777215";

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
			DBG.println(AjxDebug.DBG2, "gMAPS: Using cache");
			ZmAddressObjectHandler.displayMap(ZmAddressObjectHandler.CACHE[obj+"lng"], 
			                                  ZmAddressObjectHandler.CACHE[obj+"lat"], obj);
		} else {
			DBG.println(AjxDebug.DBG2, "gMAPS: New Request");
			var request = GXmlHttp.create();
			var url = "/zimbra/zimlets/geocode.jsp?address="+AjxStringUtil.urlEncode(obj);
			request.open("GET", url, true);
			request.onreadystatechange = function() {
		    	if (request.readyState == 4) {
		    		var resp = request.responseText;
					// Quick RDF parser
					var lg_s = resp.indexOf("<geo:long>");
					var lg_e = resp.indexOf("</geo:long>");
					var lt_s = resp.indexOf("<geo:lat>");
					var lt_e = resp.indexOf("</geo:lat>");
				    ZmAddressObjectHandler.displayMap(resp.substring(lg_s+10,lg_e), resp.substring(lt_s+9,lt_e), obj);
			  	}
			};
			request.send(null);
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
	marker.openInfoWindowHtml(obj);
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