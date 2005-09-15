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

function ZmPrintView (appCtxt, width, height) {
	this._appCtxt = appCtxt;
	this._width = parseInt(width) + 30;
	this._height = parseInt(height) + 134;
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
	} else if (item instanceof ZmCalViewMgr) {
		this._html = ZmCalViewMgr.getPrintHtml(item);
	}
	
	var optionsStr = "menubar=yes,resizable=yes,scrollbars=yes";
	if (this._width != null) {
		optionsStr = optionsStr + ",width=" + this._width;
	}
	if (this._height != null) {
		optionsStr = optionsStr + ",height=" + this._height;
	}
	this._printWindow = AjxWindowOpener.openBlank("ZmPrintWindow", optionsStr, this._render, this, true);
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
	html[idx++] = "<link rel='stylesheet' href='/zimbra/js/zimbraMail/config/style/zm.css' media='screen'></link>";
	// EMC 9/8/05:
	// If we want to print backgrounds, I think we may have to specify the media in the link, and the user may have 
	// to turn on a browser setting which is off by default ....

	// Also, we should figure out how to include the correct images file -- though I'm not sure if the user needs
	// to change browser settings for printing images as well.
	//html[idx++] = "<link rel='stylesheet' href='/zimbra/js/zimbraMail/config/style/zm.css' media='print'></link>";
	//html[idx++] = "<style type='text/css'><!-- @import url(/zimbra/img/hiRes/imgs.css?v=1); --></style>";

	// The onerror stuff would help if we were including innerHTML from the main window that might have functions which
	// don't exist in the print window.
	//html[idx++] = "</head><script>function errorHandler (ev) {ev=ev? ev: window.event; 	if (ev.stopPropagation != null) {ev.stopPropagation();ev.preventDefault();	} else { ev.returnValue = false; ev.cancelBubble = true;} alert(\"error\"); return false;}window.onerror=errorHandler</script><body>";
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
