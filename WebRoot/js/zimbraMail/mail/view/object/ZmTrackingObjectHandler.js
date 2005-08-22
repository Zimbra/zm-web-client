/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmTrackingObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, "url", null);
}

ZmTrackingObjectHandler.prototype = new ZmObjectHandler;
ZmTrackingObjectHandler.prototype.constructor = ZmTrackingObjectHandler;

ZmTrackingObjectHandler.UPS = "1[zZ]\\s?\\w{3}\\s?\\w{3}\\s?\\w{2}\\s?\\w{4}\\s?\\w{3}\\s?\\w{1}";
ZmTrackingObjectHandler.FEDEX = "(\\d{12}|\\d{22})";

ZmTrackingObjectHandler.TRACKING = "\\b(?:"+ZmTrackingObjectHandler.UPS+"|"+ZmTrackingObjectHandler.FEDEX+")\\b";

ZmTrackingObjectHandler.TRACKING_RE = new RegExp(ZmTrackingObjectHandler.TRACKING, "g");

ZmTrackingObjectHandler.prototype.match =
function(line, startIndex) {
	ZmTrackingObjectHandler.TRACKING_RE.lastIndex = startIndex;
	var m = ZmTrackingObjectHandler.TRACKING_RE.exec(line);
	if (m != null) {
		if (m[0].charAt(1) == 'z' || m[0].charAt(1) == 'Z') 
			m.context = "ups";
		else
			m.context = "fedex";
	}
	return m;
}

ZmTrackingObjectHandler.prototype._getHtmlContent =
function(html, idx, tracking, context) {
	var t = tracking.replace(/\s/g, '');
	var url;
	if (context == 'ups') {
		url = "http://wwwapps.ups.com/WebTracking/processInputRequest?" +
			"sort_by=status&tracknums_displayed=1&TypeOfInquiryNumber=T&loc=en_US&InquiryNumber1="+
			t +
			"&track.x=0&track.y=0";

	} else if (context == 'fedex') {
		url = "http://www.fedex.com/cgi-bin/tracking?" +
			"action=track&language=english&last_action=alttrack&ascend_header=1&cntry_code=&initial=x&mps=y&tracknumbers="+
			t;
	}

	if (url) {
		html[idx++] = '<a target="_blank" href="'+url+'">'+AjxStringUtil.htmlEncode(tracking)+'</a>';	
	} else {
		html[idx++] = AjxStringUtil.htmlEncode(tracking);
	}
	return idx;
}

ZmTrackingObjectHandler.prototype.getToolTipText =
function(obj, context) {
	if (context == 'ups') {
		return "<b>UPS Tracking Number: </b>"+AjxStringUtil.htmlEncode(obj);
	} else if (context == 'fedex') {
		return "<b>Fedex Tracking Number: </b>"+AjxStringUtil.htmlEncode(obj);
	} else {
		return "<b>Tracking Number: </b>"+AjxStringUtil.htmlEncode(obj);
	}
}

ZmTrackingObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	return null;
}
