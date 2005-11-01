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

	var history = historyVector.getArray();
	for (var i=0; i < history.length; i++) {
		var work = history[i];
		html.append("<div class='", ZmStatusView.getClass(work)+"'>");
		html.append("<table><tr><td rowspan=2 align='center'>", ZmStatusView.getImageHtml32(work),"</td>");
		html.append("<td>", ZmMsg.date, ": ", AjxDateUtil.getTimeStr(work.date,"%n/%d %H:%m:%s %P"), "</td></tr>");
		html.append("<tr><td>", work.msg, "</td></tr></table>");
		html.append("</div>");
	}
	var div = document.getElementById(this._listId);
	div.innerHTML = html.toString();	
};
