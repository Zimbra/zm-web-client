function LmPrintView (appCtxt) {
	this._appCtxt = appCtxt;
}

LmPrintView.prototype.toString = 
function () {
	return "LmPrintView";
};

LmPrintView.prototype.render = 
function(item) {
	
	var preferHtml = this._appCtxt.get(LmSetting.VIEW_AS_HTML);
	
	if (item instanceof LmConv) {
		this._html = LmConvListView.getPrintHtml(item, preferHtml);
	} else if (item instanceof LmMailMsg) {
		this._html = LmMailMsgView.getPrintHtml(item, preferHtml);
	} else if (item instanceof LmContact) {
		this._html = LmContactView.getPrintHtml(item, false, this._appCtxt);
	} else if (item instanceof LmContactList) {
		this._html = LmContactCardsView.getPrintHtml(item);
	}
	
	this._printWindow = LsWindowOpener.openBlank("LmPrintWindow", "menubar=yes,resizable=yes,scrollbars=yes", this._render, this, true);
};

LmPrintView.prototype._render = 
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
		this._appCtxt.getAppController().setStatusMsg(LmMsg.popupBlocker);
	}
	this._html = null;
};

LmPrintView.prototype._getHeader = 
function() {
	var username = this._appCtxt.get(LmSetting.USERNAME);
	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<html><head><title>Zimbra: " + username + "</title>";
	html[idx++] = "<style type='text/css'><!-- @import url(/liquid/js/liquidMail/config/style/lm.css); --></style>";
	html[idx++] = "</head><body>";
	html[idx++] = "<table border=0 width=100%><tr>";
	html[idx++] = "<td class='LmPrintView-company'><b>Zimbra</b> Collaboration Suite</td>";
	html[idx++] = "<td class='LmPrintView-username' align=right>" + username + "</td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "<hr>";
	html[idx++] = "<div style='padding: 10px'>";
	
	return html.join("");
}

LmPrintView.prototype._getFooter = 
function() {
	var html = new Array();
	var idx = 0;
	
	html[idx++] = "</div></body></html>";
	return html.join("");
}
