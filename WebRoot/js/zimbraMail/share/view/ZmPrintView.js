/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
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
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmPrintView = function() {}

ZmPrintView.prototype.toString =
function () {
	return "ZmPrintView";
};

ZmPrintView.prototype.render = 
function(item) {
	var preferHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
	var respCallback = new AjxCallback(this, this._handleResponseRender, item);
	var html = item.getPrintHtml(preferHtml, respCallback);
	if (html) {
		this.renderHtml(html);
	}
};

ZmPrintView.prototype.renderHtml =
function(html, args) {
	this._html = html;
	this._printWindow = this._getNewWindow(args);
};

ZmPrintView.prototype._handleResponseRender =
function(mailItem, result) {
	var args = mailItem.showImages ? mailItem : null;
	this.renderHtml(result.getResponse(), args);
};

ZmPrintView.prototype._render = 
function(item) {
	if (this._printWindow)
	{
		var onloadStr = item && item.showImages
			? this._getShowImagesStr()
			: null;

		var subs = {
			username: appCtxt.get(ZmSetting.USERNAME),
			appContextPath: appContextPath,
			cacheKillerVersion: cacheKillerVersion,
			onloadStr: onloadStr,
			content: this._html
		};

		var html = AjxTemplate.expand("share.App#PrintView", subs);

		this._printWindow.document.open();
		this._printWindow.document.write(html);
		this._printWindow.document.close();

		if (window.print)
			this._printWindow.print();
	}
	else
	{
		appCtxt.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
	}

	// cleanup
	this._html = null;
};

ZmPrintView.prototype._getNewWindow =
function(args) {
	var callback = new AjxCallback(this, this._render, args);
	var winArgs = "menubar=yes,resizable=yes,scrollbars=yes";
	return AjxWindowOpener.openBlank("ZmPrintWindow", winArgs, callback, true);
}

ZmPrintView.prototype._getShowImagesStr =
function() {
	if (!this._showImagesStr) {
		var code = [];
		var idx = 0;

		code[idx++] = "var images = document.getElementsByTagName('img');";
		code[idx++] = "for (var i = 0; i < images.length; i++) {";
		code[idx++] = "if (images[i].getAttribute('dfsrc')) {";
		code[idx++] = "images[i].src = images[i].getAttribute('dfsrc');";
		code[idx++] = "	} };";

		this._showImagesStr = code.join("");
	}

	return this._showImagesStr;
};
