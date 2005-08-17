function LmURLObjectHandler(appCtxt) {

	LmObjectHandler.call(this, appCtxt, "url", null);
}

LmURLObjectHandler.prototype = new LmObjectHandler;
LmURLObjectHandler.prototype.constructor = LmURLObjectHandler;

LmURLObjectHandler.URL_RE = /((telnet:)|((https?|ftp|gopher|news|file):\/\/)|(www\.[\w\.\_\-]+))[^\s\(\)\<\>\[\]\{\}\'\"]*/ig;

LmURLObjectHandler.prototype.match =
function(line, startIndex) {
	LmURLObjectHandler.URL_RE.lastIndex = startIndex;
	var m = LmURLObjectHandler.URL_RE.exec(line);
	if (m == null) return null;
	
	var last = m[0].charAt(m[0].length-1);
	if (last == '.' || last == ",") {
		var m2 = {index: m.index };
		m2[0] = m[0].substring(0, m[0].length-1);
		return m2;
	} else {
		return m;
	}
}

LmURLObjectHandler.prototype._getHtmlContent =
function(html, idx, url) {
	var escapedUrl = url.replace(/\"/g, '\"');
	if (escapedUrl.substr(0,4) == 'www.') {
		escapedUrl = "http://"+escapedUrl+"/";
	}
	html[idx++] = '<a target="_blank" href="'+escapedUrl+'">'+LsStringUtil.htmlEncode(url)+'</a>';	
	return idx;
}
	
LmURLObjectHandler.prototype.getToolTipText =
function(obj) {
	return "<b>URL: </b>"+LsStringUtil.htmlEncode(obj);
}

LmURLObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
}

LmURLObjectHandler.prototype.hasToolTipText =
function(obj, context) {
	return false;
}
