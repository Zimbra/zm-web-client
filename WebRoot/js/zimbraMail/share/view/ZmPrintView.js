function ZmPrintView (appCtxt) {
	this._appCtxt = appCtxt;
}

ZmPrintView.prototype.toString = 
function () {
	return "ZmPrintView";
};

ZmPrintView.prototype.render = 
function(item) {
	
	var preferHtml = this._appCtxt.get(ZmSetting.VIEW_AS_HTML);
	
	if (item instanceof ZmConv) {
		this._html = ZmConvListView.getPrintHtml(item, preferHtml);
	} else if (item instanceof ZmMailMsg) {
		this._html = ZmMailMsgView.getPrintHtml(item, preferHtml);
	} else if (item instanceof ZmContact) {
		this._html = ZmContactView.getPrintHtml(item, false, this._appCtxt);
	} else if (item instanceof ZmContactList) {
		this._html = ZmContactCardsView.getPrintHtml(item);
	}
	
	this._printWindow = AjxWindowOpener.openBlank("ZmPrintWindow", "menubar=yes,resizable=yes,scrollbars=yes", this._render, this, true);
};

ZmPrintView.prototype._render = 
function() {
	if (this._printWindow) {
		var header = this._getHeader();
		var footer = this._getFooter();
		
		this._printWindow.document.open();
		this._printWindow.document.write(header);
		this._printWindow.document.write(this._html);
		this._printWindow.document.write(footer);
		this._printWindow.document.close();
	
		if (window.print)
			this._printWindow.print();
	} else {
		this._appCtxt.getAppController().setStatusMsg(ZmMsg.popupBlocker);
	}
	this._html = null;
};

ZmPrintView.prototype._getHeader = 
function() {
	var username = this._appCtxt.get(ZmSetting.USERNAME);
	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<html><head><title>Zimbra: " + username + "</title>";
	html[idx++] = "<style type='text/css'><!-- @import url(/zimbra/js/zimbraMail/config/style/lm.css); --></style>";
	html[idx++] = "</head><body>";
	html[idx++] = "<table border=0 width=100%><tr>";
	html[idx++] = "<td class='ZmPrintView-company'><b>Zimbra</b> Collaboration Suite</td>";
	html[idx++] = "<td class='ZmPrintView-username' align=right>" + username + "</td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "<hr>";
	html[idx++] = "<div style='padding: 10px'>";
	
	return html.join("");
}

ZmPrintView.prototype._getFooter = 
function() {
	var html = new Array();
	var idx = 0;
	
	html[idx++] = "</div></body></html>";
	return html.join("");
}
