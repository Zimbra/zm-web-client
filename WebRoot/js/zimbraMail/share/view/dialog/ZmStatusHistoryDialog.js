/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
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

/**
* show history of the status window
* @param parent			the element that created this view
*/
function ZmStatusHistoryDialog(parent, appCtxt) {

	DwtDialog.call(this, parent, null, null, [DwtDialog.OK_BUTTON]);

	this._appCtxt = appCtxt;
	this.setContent(this._contentHtml());
	this.setTitle(ZmMsg.statusHistory);	
};

ZmStatusHistoryDialog.prototype = new DwtDialog;
ZmStatusHistoryDialog.prototype.constructor = ZmStatusHistoryDialog;

// Public methods

ZmStatusHistoryDialog.prototype.toString = 
function() {
	return "ZmStatusHistoryDialog";
};

ZmStatusHistoryDialog.prototype._contentHtml = 
function() {
	this._listId = Dwt.getNextId();

	var html = new AjxBuffer();
	html.append("<div class='ZmStatusHistory' id='",this._listId,"'>");
	return html.toString();
};

ZmStatusHistoryDialog.prototype.initialize = 
function(historyVector) {
	var html = new AjxBuffer();

	var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.SHORT, AjxDateFormat.MEDIUM);
	var history = historyVector.getArray();
	for (var i=0; i < history.length; i++) {
		var work = history[i];
		html.append("<div class='", ZmStatusView.getClass(work)+"'", ((i > 0) ? " style='border-top:none;'": ""), ">");
/*
		html.append("<table><tr><td rowspan=2 align='center'>", ZmStatusView.getImageHtml32(work),"</td>");
		html.append("<td>", ZmMsg.date, ": ", AjxDateUtil.getTimeStr(work.date,"%n/%d %H:%m:%s %P"), "</td></tr>");
		html.append("<tr><td><b>", AjxStringUtil.htmlEncode(work.msg), "</b></td></tr></table>");
	*/	
		html.append("<table width=100%><tr><td style='width:40px;' align='center'>", ZmStatusView.getImageHtml32(work),"</td>");
		html.append("<td align='left'><b>", AjxStringUtil.htmlEncode(work.msg), "</b></td>");
		html.append("<td align='right' style='width:100px;' >",formatter.format(work.date), "</td>");
		html.append("</tr></table>");
		
		html.append("</div>");
	}
	var div = document.getElementById(this._listId);
	div.innerHTML = html.toString();	
};
