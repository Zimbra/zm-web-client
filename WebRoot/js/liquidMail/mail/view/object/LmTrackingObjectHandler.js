function LmTrackingObjectHandler(appCtxt) {

	LmObjectHandler.call(this, appCtxt, "url", null);
}

LmTrackingObjectHandler.prototype = new LmObjectHandler;
LmTrackingObjectHandler.prototype.constructor = LmTrackingObjectHandler;

LmTrackingObjectHandler.UPS = "1[zZ]\\s?\\w{3}\\s?\\w{3}\\s?\\w{2}\\s?\\w{4}\\s?\\w{3}\\s?\\w{1}";
LmTrackingObjectHandler.FEDEX = "(\\d{12}|\\d{22})";

LmTrackingObjectHandler.TRACKING = "\\b(?:"+LmTrackingObjectHandler.UPS+"|"+LmTrackingObjectHandler.FEDEX+")\\b";

LmTrackingObjectHandler.TRACKING_RE = new RegExp(LmTrackingObjectHandler.TRACKING, "g");

LmTrackingObjectHandler.prototype.match =
function(line, startIndex) {
	LmTrackingObjectHandler.TRACKING_RE.lastIndex = startIndex;
	var m = LmTrackingObjectHandler.TRACKING_RE.exec(line);
	if (m != null) {
		if (m[0].charAt(1) == 'z' || m[0].charAt(1) == 'Z') 
			m.context = "ups";
		else
			m.context = "fedex";
	}
	return m;
}

LmTrackingObjectHandler.prototype._getHtmlContent =
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
		html[idx++] = '<a target="_blank" href="'+url+'">'+LsStringUtil.htmlEncode(tracking)+'</a>';	
	} else {
		html[idx++] = LsStringUtil.htmlEncode(tracking);
	}
	return idx;
}

LmTrackingObjectHandler.prototype.getToolTipText =
function(obj, context) {
	if (context == 'ups') {
		return "<b>UPS Tracking Number: </b>"+LsStringUtil.htmlEncode(obj);
	} else if (context == 'fedex') {
		return "<b>Fedex Tracking Number: </b>"+LsStringUtil.htmlEncode(obj);
	} else {
		return "<b>Tracking Number: </b>"+LsStringUtil.htmlEncode(obj);
	}
}

LmTrackingObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	return null;
}
