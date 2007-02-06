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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmVoicemailView(parent, appCtxt, controller, dropTgt) {
	var headerList = this._getHeaderList(appCtxt);
	ZmListView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, ZmController.VOICEMAIL_VIEW, ZmItem.VOICEMAIL, controller, headerList, dropTgt);

	this._appCtxt = appCtxt;
	this._controller = controller;
}
ZmVoicemailView.prototype = new ZmListView;
ZmVoicemailView.prototype.constructor = ZmVoicemailView;

ZmVoicemailView.prototype.toString = function() {
	return "ZmVoicemailView";
};

ZmVoicemailView.FROM_WIDTH = 150;
ZmVoicemailView.DURATION_WIDTH = 120;
ZmVoicemailView.DATE_WIDTH = 60;
ZmVoicemailView.SUBJECT_WIDTH = null; // Auto


ZmVoicemailView.prototype._getHeaderList =
function(appCtxt) {

	var headerList = new Array();
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FROM], ZmMsg.from, null, ZmVoicemailView.FROM_WIDTH, true, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.duration, null, ZmVoicemailView.DURATION_WIDTH, true, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.received, null, ZmVoicemailView.DATE_WIDTH, true, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subjectNotes, null, ZmVoicemailView.SUBJECT_WIDTH, true, true));

	return headerList;
};

ZmVoicemailView.prototype._createItemHtml =
function(voicemail, now, isDndIcon, isMixedView, myDiv) {
	
	var	div = this._getDiv(voicemail, isDndIcon, false);
	var htmlArr = [];
	var idx = 0;
	
	idx = this._getTable(htmlArr, idx, isDndIcon);
	var className = voicemail.isUnheard ? "Unread" : "";
	idx = this._getRow(htmlArr, idx, voicemail, className);

	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;
		var width = this._getFieldWidth(i);
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = ">";
		
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FROM]) == 0) {
			htmlArr[idx++] = voicemail.caller;
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDuration(voicemail.duration);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0) {
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, voicemail.date);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			htmlArr[idx++] = AjxStringUtil.htmlEncode(voicemail.subject);
		}
		htmlArr[idx++] = "</td>";
	}	
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

ZmVoicemailView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var voicemail = this.getItemFromElement(div);
	var tooltip = voicemail ? this._createTooltip(voicemail) : null;
	this.setToolTipContent(tooltip);
};

ZmVoicemailView.prototype._createTooltip =
function(voicemail) {
	var data = { 
		caller: voicemail.caller, 
		duration: AjxDateUtil.computeDuration(voicemail.duration),
		date: AjxDateUtil.computeDateTimeString(voicemail.date)
	};
	var html = AjxTemplate.expand("zimbraMail.voicemail.templates.Voicemail#Tooltip", data);
	return html;
};
