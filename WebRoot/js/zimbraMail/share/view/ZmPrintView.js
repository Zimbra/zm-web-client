/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

function ZmPrintView (appCtxt) {
	this._appCtxt = appCtxt;
};

ZmPrintView.prototype.toString =
function () {
	return "ZmPrintView";
};

ZmPrintView.prototype.render = 
function(item) {
	var preferHtml = this._appCtxt.get(ZmSetting.VIEW_AS_HTML);

	if (item instanceof ZmConv) {
		var respCallback = new AjxCallback(this, this._handleResponseRender, item);
		ZmConvListView.getPrintHtml(item, preferHtml, respCallback, this._appCtxt);
		return;
		// NOTE: we check for toString instead of instanceof b/c opening new
		//       window loses type info :(
	} else if (item.toString() == "ZmMailMsg") {
		var respCallback = new AjxCallback(this, this._handleResponseRender, item);
		ZmMailMsgView.getPrintHtml(item, preferHtml, respCallback);
		return;
	} else if (item instanceof ZmContact) {
		this._html = item.isGroup()
			? ZmGroupView.getPrintHtml(item, false, this._appCtxt)
			: ZmContactView.getPrintHtml(item, false, this._appCtxt);
	} else if (item instanceof ZmContactList) {
		this._html = ZmContactCardsView.getPrintHtml(item);
	} else if (item instanceof ZmCalViewMgr) {
		this._html = ZmCalViewMgr.getPrintHtml(item);
	} else if (item instanceof ZmPage) {
		this._html = ZmNotebookPageView.getPrintHtml(item, this._appCtxt);
	}

	this._printWindow = this._getNewWindow();
};

ZmPrintView.prototype.renderType =
function(type, list) {
	if (list instanceof Array)
		list = AjxVector.fromArray(list);

	if (type == ZmItem.CONTACT) {
		this._html = ZmContactCardsView.getPrintHtml(list);
	}

	this._printWindow = this._getNewWindow();
};

ZmPrintView.prototype._handleResponseRender =
function(mailItem, result) {
	this._html = result.getResponse();
	var args = mailItem.showImages ? mailItem : null;
	this._printWindow = this._getNewWindow(args);
};

ZmPrintView.prototype._render = 
function(item) {
	if (this._printWindow) {
		var onloadStr = item && item.showImages
			? this._getShowImagesStr()
			: null;
		var header = this._getHeader(onloadStr);
		var footer = this._getFooter();
		
		this._printWindow.document.open();
		this._printWindow.document.write(header);
		this._printWindow.document.write(this._html);
		this._printWindow.document.write(footer);
		this._printWindow.document.close();

		if (window.print)
			this._printWindow.print();
	} else {
		this._appCtxt.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
	}
	this._html = null;
};

ZmPrintView.prototype._getHeader = 
function(onloadStr) {
	var username = this._appCtxt.get(ZmSetting.USERNAME);
	var html = new Array();
	var idx = 0;
	html[idx++] = "<html><head><title>Zimbra: ";
	html[idx++] = username;
	html[idx++] = "</title>";
	html[idx++] = "<link rel='stylesheet' href='";
	html[idx++] = appContextPath;
	html[idx++] = "/css/msgview,zm,wiki.css?v=";
	html[idx++] = cacheKillerVersion;
	html[idx++] = "' media='screen'></link>";
	if (onloadStr) {
		html[idx++] = "<script language='javascript'>";
		html[idx++] = "function handleOnload() {";
		html[idx++] = onloadStr;
		html[idx++] = "} </script>";
		html[idx++] = "</head><body onload='handleOnload();'>";
	} else {
		html[idx++] = "</head><body>";
	}
	html[idx++] = "<table border=0 width=100%><tr>";
	html[idx++] = "<td class='ZmPrintView-company'><b>Zimbra</b> Collaboration Suite</td>";
	html[idx++] = "<td class='ZmPrintView-username' align=right>";
	html[idx++] = username;
	html[idx++] = "</td></tr></table>";
	html[idx++] = "<hr>";
	html[idx++] = "<div style='padding: 10px'>";

	return html.join("");
};

ZmPrintView.prototype._getFooter = 
function() {
	return "</div></body></html>";
};

ZmPrintView.prototype._getNewWindow =
function(args) {
	var callback = new AjxCallback(this, this._render, args);
	var winArgs = "menubar=yes,resizable=yes,scrollbars=yes";
	return AjxWindowOpener.openBlank("ZmPrintWindow", winArgs, callback, true);
}

ZmPrintView.prototype._getShowImagesStr =
function() {
	var code = [];
	var idx = 0;

	code[idx++] = "var images = document.getElementsByTagName('img');";
	code[idx++] = "for (var i = 0; i < images.length; i++) {";
	code[idx++] = "if (images[i].getAttribute('dfsrc')) {";
	code[idx++] = "images[i].src = images[i].getAttribute('dfsrc');";
	code[idx++] = "	} };";

	return code.join("");
};
