function ZmURLObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, "url", null);
}

ZmURLObjectHandler.prototype = new ZmObjectHandler;
ZmURLObjectHandler.prototype.constructor = ZmURLObjectHandler;

ZmURLObjectHandler.URL_RE = /((telnet:)|((https?|ftp|gopher|news|file):\/\/)|(www\.[\w\.\_\-]+))[^\s\(\)\<\>\[\]\{\}\'\"]*/ig;

ZmURLObjectHandler.prototype.match =
function(line, startIndex) {
	ZmURLObjectHandler.URL_RE.lastIndex = startIndex;
	var m = ZmURLObjectHandler.URL_RE.exec(line);
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

ZmURLObjectHandler.prototype._getHtmlContent =
function(html, idx, url) {
	var escapedUrl = url.replace(/\"/g, '\"');
	if (escapedUrl.substr(0,4) == 'www.') {
		escapedUrl = "http://"+escapedUrl+"/";
	}
	html[idx++] = '<a target="_blank" href="'+escapedUrl+'">'+AjxStringUtil.htmlEncode(url)+'</a>';	
	return idx;
}
	
ZmURLObjectHandler.prototype.getToolTipText =
function(obj) {
	return "<b>URL: </b>"+AjxStringUtil.htmlEncode(obj);
}

ZmURLObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
}

ZmURLObjectHandler.prototype.hasToolTipText =
function(obj, context) {
	return false;
}
