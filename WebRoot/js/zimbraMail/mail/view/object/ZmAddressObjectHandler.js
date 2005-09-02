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
// XXX This regex is very very simple.  It only matches single line simpler addresses like:
// 1234 Main St City CA 99999
ZmAddressObjectHandler.ADDRESS_RE = /[\w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,}\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?/ig;
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
	return '<div id="gMap" style="width: 350px; height: 350px"></div>';
};

ZmAddressObjectHandler.prototype.populateToolTip =
function(obj, context) {
		if(ZmAddressObjectHandler.CACHE[obj]) {
			ZmAddressObjectHandler.displayMap(ZmAddressObjectHandler.CACHE[obj], obj);
		} else {
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
				    var point = new GPoint(resp.substring(lg_s+10,lg_e), resp.substring(lt_s+9,lt_e));
				    ZmAddressObjectHandler.displayMap(point, obj);
			  	}
			};
			request.send(null);
		}
};

ZmAddressObjectHandler.displayMap =
function(point, obj) {
    var map = new GMap(document.getElementById("gMap"));
    map.centerAndZoom(point, 4);
	var marker = new GMarker(point);
	map.addOverlay(marker);
	marker.openInfoWindowHtml('<br/>'+obj);
	if(!ZmAddressObjectHandler.CACHE[obj]) {
		ZmAddressObjectHandler.CACHE[obj] = point;
	}
};
