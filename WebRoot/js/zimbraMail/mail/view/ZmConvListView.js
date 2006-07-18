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

function ZmConvListView(parent, className, posStyle, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	ZmMailListView.call(this, parent, className, posStyle, ZmController.CONVLIST_VIEW, ZmItem.CONV, controller, headerList, dropTgt);
	this.setHtmlElementId("ZmConvListView")
};

ZmConvListView.prototype = new ZmMailListView;
ZmConvListView.prototype.constructor = ZmConvListView;

// Consts

ZmConvListView.CONVLIST_REPLENISH_THRESHOLD = 0;
ZmConvListView.CLV_COLWIDTH_ICON 			= 19;
ZmConvListView.CLV_COLWIDTH_FROM 			= 145;
ZmConvListView.CLV_COLWIDTH_DATE 			= 60;


// Public methods

ZmConvListView.prototype.toString = 
function() {
	return "ZmConvListView";
};

ZmConvListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {
	ZmMailListView.prototype.createHeaderHtml.call(this, defaultColumnSort);

	// Show "From" or "To" depending on which folder we're looking at
	var isFolder = this._isSentOrDraftsFolder();

	// set the from column name based on query string
	var fromColIdx = this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT]);
	var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[fromColIdx]._id);
	if (fromColSpan)
		fromColSpan.innerHTML = "&nbsp;" + (isFolder.sent || isFolder.drafts ? ZmMsg.to : ZmMsg.from);

	// bug fix #4786
	var dateColIdx = this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]);
	var dateColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[dateColIdx]._id);
	if (dateColSpan)
		dateColSpan.innerHTML = "&nbsp;" + (isFolder.sent ? ZmMsg.sent : ZmMsg.received);
};

ZmConvListView.prototype.markUIAsRead = 
function(items, on) {
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var row = document.getElementById(this._getFieldId(item, ZmItem.F_ITEM_ROW));
		if (row)
			row.className = on ? "" : "Unread";
		var img = document.getElementById(this._getFieldId(item, ZmItem.F_STATUS));
		if (img && img.parentNode)
			AjxImg.setImage(img.parentNode, on ? "MsgStatusRead" : "MsgStatusUnread");
	}
}

ZmConvListView.prototype.setSize = 
function(width, height) {
	ZmMailListView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

ZmConvListView.prototype.setBounds = 
function(x, y, width, height) {
	ZmMailListView.prototype.setBounds.call(this, x, y, width, height);
	this._resetColWidth();
};

ZmConvListView.prototype.getReplenishThreshold = 
function() {
	return ZmConvListView.CONVLIST_REPLENISH_THRESHOLD;
};


// Private / protected methods

ZmConvListView.prototype._createItemHtml =
function(conv, now, isDndIcon, isMixedView, div) {

	var	div = div ? div : this._getDiv(conv, isDndIcon);
	div.className = div._styleClass;
	// XXX: for some reason, we need to explicitly set the height of the div
	// since FF barfs if u remove the flag column.. too busy to figure out why
//MOW	if (AjxEnv.isMozilla)
//MOW		div.style.height = "20px";

	var htmlArr = new Array();
	var idx = 0;
	
	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);
	
	// Row
	idx = this._getRow(htmlArr, idx, conv, conv.isUnread ? "Unread" : null);
	
	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;
		
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			// Flags
			idx = this._getField(htmlArr, idx, conv, ZmItem.F_FLAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, conv, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT]) == 0) {
			// Participants
			var width = AjxEnv.isIE || AjxEnv.isSafari ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
			var fieldId = this._getFieldId(conv, ZmItem.F_PARTICIPANT);
			htmlArr[idx++] = "<td width=" + width + " id='" + fieldId + "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = this._getParticipantHtml(conv, fieldId);
			htmlArr[idx++] = AjxEnv.isSafari ? "</div>" : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachments icon
			idx = this._getField(htmlArr, idx, conv, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			// Subject
			htmlArr[idx++] = "<td id='" + this._getFieldId(conv, ZmItem.F_SUBJECT) + "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = conv.subject ? AjxStringUtil.htmlEncode(conv.subject, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
			if (this._appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && conv.fragment) {
				htmlArr[idx++] = "<span class='ZmConvListFragment'>";
				htmlArr[idx++] = " - ";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(conv.fragment, true);
				htmlArr[idx++] = "</span>";
			}
			htmlArr[idx++] = AjxEnv.isNav ? ZmListView._fillerString : "";
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_COUNT]) == 0) {
			var width = AjxEnv.isIE || AjxEnv.isSafari ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
			htmlArr[idx++] = "<td id='" + this._getFieldId(conv, ZmItem.F_COUNT) + "'";
			htmlArr[idx++] = " width=" + width + ">";
			htmlArr[idx++] = conv.numMsgs > 1 ? ("(" + conv.numMsgs + ")") : "";
			htmlArr[idx++] = AjxEnv.isNav ? ZmListView._fillerString : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0) {
			// Date
			idx = this._getField(htmlArr, idx, conv, ZmItem.F_DATE, i, now);
		} else if (isMixedView && id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ICON]) == 0) {
			// Type icon (mixed view only)
			if (conv.isDraft) {
				htmlArr[idx++] = "<td width=" + this._headerList[i]._width + " class='Icon'>";
				htmlArr[idx++] = AjxImg.getImageHtml("MsgStatusDraft", null, ["id='", this._getFieldId(conv, ZmItem.F_STATUS), "'"].join(""));
				htmlArr[idx++] = "</td>";
			} else {
				idx = this._getField(htmlArr, idx, conv, ZmItem.F_ITEM_TYPE, i);
			}
		}
	}
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};

ZmConvListView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();
	
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, "FlagRed", ZmConvListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.flag));
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmConvListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT], ZmMsg.from, null, ZmConvListView.CLV_COLWIDTH_FROM, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, "Attachment", ZmConvListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.attachment));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subject, null, null, ZmItem.F_SUBJECT));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_COUNT], null, "Conversation", 25, null, null, null, ZmMsg.count));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.received, null, ZmConvListView.CLV_COLWIDTH_DATE, ZmItem.F_DATE));
	
	return headerList;
};

ZmConvListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {

	// call base class to save the new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);
	
	if (this.getList().size() > 1 && this._sortByString) {
		var searchString = this._controller.getSearchString();
		var params = {query: searchString, types: [ZmItem.CONV], sortBy: this._sortByString, limit: this.getLimit()};
		this._appCtxt.getSearchController().search(params);
	}
};

ZmConvListView.prototype._getDefaultSortbyForCol = 
function(colHeader) {
	// if not date field, sort asc by default
	return colHeader._sortable != ZmItem.F_DATE;
};


// Listeners

ZmConvListView.prototype._changeListener =
function(ev) {
	// update count field for this conv
	var fields = ev.getDetail("fields");
	var items = ev.getDetail("items");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_COUNT])) {
		for (var i = 0; i < items.length; i++) {
			var countField = document.getElementById(this._getFieldId(items[i], ZmItem.F_COUNT));
			if (countField)
				countField.innerHTML = items[i].numMsgs > 1 ? "(" + items[i].numMsgs + ")" : "";
		}
	} else if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		for (var i = 0; i < items.length; i++) {
			var conv = items[i];
			var div = document.getElementById(this._getItemId({id: conv._oldId}));
			if (div) {
				this._createItemHtml(conv, this._now, false, false, div);
				this.associateItemWithElement(conv, div, DwtListView.TYPE_LIST_ITEM);
				DBG.println(AjxDebug.DBG1, "conv updated from ID " + conv._oldId + " to ID " + conv.id);
			}
		}
	} else if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_PARTICIPANT])) {
		for (var i = 0; i < items.length; i++) {
			var fieldId = this._getFieldId(items[i], ZmItem.F_PARTICIPANT);
			var participantField = document.getElementById(fieldId);
			if (participantField)
				participantField.innerHTML = this._getParticipantHtml(items[i], fieldId);
		}
	} else {
		ZmMailListView.prototype._changeListener.call(this, ev);
		if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE)	{
			this._resetColWidth();
		}
	}
};

ZmConvListView.prototype._getParticipantHtml = 
function(conv, fieldId) {
	var html = new Array();
	var idx = 0;

	var part1 = conv.participants.getArray();
	var origLen = part1.length;
	// might get a weird case where there are no participants in message
	if (origLen > 0) {
		var partColWidth = this._headerList[this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT])]._width;
		var part2 = this._fitParticipants(part1, conv.participantsElided, partColWidth);
		for (var j = 0; j < part2.length; j++) {
			if (j == 1 && (conv.participantsElided || part2.length < origLen)) {
				html[idx++] = AjxStringUtil.ELLIPSIS;
			} else if (part2.length > 1 && j > 0) {
				html[idx++] = ", ";
			}
			var partId = fieldId + "_" + part2[j].index;
			html[idx++] = "<span style='white-space: nowrap' id='" + partId + "'>";
			html[idx++] = part2[j].name;
			html[idx++] = "</span>";
		}

		// bug fix #724
		if (part2.length == 1 && origLen > 1)
			html[idx++] = AjxStringUtil.ELLIPSIS;
	} else {
		// XXX: possible import bug but we must take into account
		html[idx++] = ZmMsg.noWhere;
	}
	if (AjxEnv.isNav)
		html[idx++] = ZmListView._fillerString;
		
	return html.join("");
};


// Static methods

ZmConvListView.getPrintHtml = 
function(conv, preferHtml, callback) {

	// first, get list of all msg id's for this conversation
	if (conv.msgIds == null) {
		var soapDoc = AjxSoapDoc.create("GetConvRequest", "urn:zimbraMail");
		var msgNode = soapDoc.set("c");
		msgNode.setAttribute("id", conv.id);
		
		var respCallback = new AjxCallback(null, ZmConvListView._handleResponseGetPrintHtml, [conv, preferHtml, callback]);
		window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
	} else {
		ZmConvListView._printMessages(conv, preferHtml, callback);
	}
};

ZmConvListView._handleResponseGetPrintHtml =
function(conv, preferHtml, callback, result) {
	var resp = result.getResponse().GetConvResponse.c[0];
	var msgIds = new Array();
	for (var i = 0; i < resp.m.length; i++)
		msgIds.push(resp.m[i].id);
	conv.msgIds = msgIds;
	ZmConvListView._printMessages(conv, preferHtml, callback);
};

ZmConvListView._printMessages =
function(conv, preferHtml, callback) {
	// XXX: optimize? Once these msgs are d/l'ed should they be cached?
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
	soapDoc.setMethodAttribute("onerror", "continue");
	
	for (var i = 0; i < conv.msgIds.length; i++) {
		// make a request to get this mail message from the server
		var msgRequest = soapDoc.set("GetMsgRequest");
		msgRequest.setAttribute("xmlns", "urn:zimbraMail");

		var doc = soapDoc.getDoc();
		var msgNode = doc.createElement("m");
		msgNode.setAttribute("id", conv.msgIds[i]);
		if (preferHtml)
			msgNode.setAttribute("html", "1");
		msgRequest.appendChild(msgNode);
	}
	var respCallback = new AjxCallback(null, ZmConvListView._handleResponseGetMessages, [conv, preferHtml, callback]);
	window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmConvListView._handleResponseGetMessages =
function(conv, preferHtml, callback, result) {
	var resp = result.getResponse().BatchResponse.GetMsgResponse;

	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<font size=+2>" + conv.subject + "</font><br>";
	html[idx++] = "<font size=+1>" + conv.numMsgs;
	html[idx++] = (conv.numMsgs > 1) ? " messages" : " message";
	html[idx++] = "</font><hr>";
	
	for (var i = 0; i < resp.length; i++) {
		var msgNode = resp[i].m[0];
		var msg = ZmMailMsg.createFromDom(msgNode, {appCtxt: null, list: null});
		html[idx++] = ZmMailMsgView.getPrintHtml(msg, preferHtml);
		if (i < resp.length - 1)
			html[idx++] = "<hr>";
	}
	
	result.set(html.join(""));
	if (callback) callback.run(result);
};
