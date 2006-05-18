/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
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
		var respCallback = new AjxCallback(this, this._handleResponseRender);
		ZmConvListView.getPrintHtml(item, preferHtml, respCallback);
		return;
	//} else if (item instanceof ZmMailMsg) {
	// XXX: fix this when opening a new window doesnt nuke type info!
	} else if (item.toString() == "ZmMailMsg") {
		var respCallback = new AjxCallback(this, this._handleResponseRender);
		ZmMailMsgView.getPrintHtml(item, preferHtml, respCallback);
		return;
	} else if (item instanceof ZmContact) {
		this._html = ZmContactView.getPrintHtml(item, false, this._appCtxt);
	} else if (item instanceof ZmContactList) {
		this._html = ZmContactCardsView.getPrintHtml(item);
	} else if (item instanceof ZmCalViewMgr) {
		this._html = ZmCalViewMgr.getPrintHtml(item);
	}
	
	this._printWindow = AjxWindowOpener.openBlank("ZmPrintWindow", "menubar=yes,resizable=yes,scrollbars=yes", this._render, this, true);
};

ZmPrintView.prototype._handleResponseRender =
function(result) {
	this._html = result.getResponse();
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
		this._appCtxt.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
	}
	this._html = null;
};

ZmPrintView.prototype._getHeader = 
function() {
	var username = this._appCtxt.get(ZmSetting.USERNAME);
	var html = new Array();
	var idx = 0;
	html[idx++] = "<html><head><title>Zimbra: ";
	html[idx++] = username;
	html[idx++] = "</title>";
	html[idx++] = "<link rel='stylesheet' href='"+appContextPath+"/skins/"+appCurrentSkin+"/msgview.css?v="+cacheKillerVersion+"' media='screen'></link>";
	html[idx++] = "<link rel='stylesheet' href='"+appContextPath+"/skins/"+appCurrentSkin+"/zm.css?v="+cacheKillerVersion+"' media='screen'></link>";
	html[idx++] = "</head><body>";
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