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

function ZmConvListView(parent, className, posStyle, controller, dropTgt, view) {

	if (arguments.length == 0) { return; }

	var headerList = this._getHeaderList(parent);
	view = view || ZmController.CONVLIST_VIEW;
	ZmMailListView.call(this, parent, className, posStyle, view, ZmItem.CONV, controller, headerList, dropTgt);
	this.setHtmlElementId(this.toString());
};

ZmConvListView.prototype = new ZmMailListView;
ZmConvListView.prototype.constructor = ZmConvListView;

// Consts

ZmConvListView.CONVLIST_REPLENISH_THRESHOLD = 0;
ZmConvListView.COL_WIDTH_FROM 				= 145;


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
	var colLabel = (isFolder.sent || isFolder.drafts) ? ZmMsg.to : ZmMsg.from;
	var fromColIdx = this.getColIndexForId(ZmItem.F_PARTICIPANT);
	var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[fromColIdx]._id);
	if (fromColSpan) {
		fromColSpan.innerHTML = "&nbsp;" + colLabel;
	}
	if (this._colHeaderActionMenu) {
		this._colHeaderActionMenu.getItem(fromColIdx).setText(colLabel);
	}

	// bug fix #4786
	colLabel = isFolder.sent ? ZmMsg.sentAt : ZmMsg.received;
	var dateColIdx = this.getColIndexForId(ZmItem.F_DATE);
	var dateColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[dateColIdx]._id);
	if (dateColSpan) {
		dateColSpan.innerHTML = "&nbsp;" + colLabel;
	}
	if (this._colHeaderActionMenu) {
		this._colHeaderActionMenu.getItem(dateColIdx).setText(colLabel);
	}
};

ZmConvListView.prototype.markUIAsRead =
function(item, on) {
	var row = document.getElementById(this._getFieldId(item, ZmItem.F_ITEM_ROW));
	if (row) {
		row.className = on ? "" : "Unread";
	}
	var img = document.getElementById(this._getFieldId(item, ZmItem.F_STATUS));
	if (img && img.parentNode) {
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

ZmConvListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called

	var hList = [];

	hList.push(new DwtListHeaderItem(ZmItem.F_FLAG, null, "FlagRed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.flag));
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_TAG, null, "MiniTag", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmItem.F_PARTICIPANT, ZmMsg.from, null, ZmConvListView.COL_WIDTH_FROM, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_ATTACHMENT, null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));
	hList.push(new DwtListHeaderItem(ZmItem.F_SUBJECT, ZmMsg.subject, null, null, ZmItem.F_SUBJECT));
	hList.push(new DwtListHeaderItem(ZmItem.F_COUNT, null, "Conversation", 25, null, null, null, ZmMsg.count));
	hList.push(new DwtListHeaderItem(ZmItem.F_DATE, ZmMsg.received, null, ZmListView.COL_WIDTH_DATE, ZmItem.F_DATE));

	return hList;
};

ZmConvListView.prototype._getField =
function(htmlArr, idx, conv, field, colIdx, params) {

	if (field == ZmItem.F_PARTICIPANT) {
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = params.width;
		htmlArr[idx++] = " id='";
		htmlArr[idx++] = params.fieldId;
		htmlArr[idx++] = "'>";
		if (AjxEnv.isSafari) {
			htmlArr[idx++] = "<div style='overflow:hidden'>";
		}
		htmlArr[idx++] = this._getParticipantHtml(conv, params.fieldId);
		if (AjxEnv.isSafari) {
			htmlArr[idx++] = "</div>";
		}
		htmlArr[idx++] = "</td>";
	} else if (field == ZmItem.F_SUBJECT) {
		htmlArr[idx++] = "<td id='";
		htmlArr[idx++] = params.fieldId;
		htmlArr[idx++] = "'>";
		htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
		htmlArr[idx++] = conv.subject ? AjxStringUtil.htmlEncode(conv.subject, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
		if (this._appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && conv.fragment) {
			htmlArr[idx++] = "<span class='ZmConvListFragment'> - ";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(conv.fragment, true);
			htmlArr[idx++] = "</span>";
		}
		htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
	} else if (field == ZmItem.F_COUNT) {
		htmlArr[idx++] = "<td id='";
		htmlArr[idx++] = params.fieldId;
		htmlArr[idx++] = "' width=";
		htmlArr[idx++] = params.width;
		htmlArr[idx++] = ">";
		if (conv.numMsgs > 1) {
			htmlArr[idx++] = "(";
			htmlArr[idx++] = conv.numMsgs;
			htmlArr[idx++] = ")";
		}
		htmlArr[idx++] = "</td>";
	} else if (params.isMixedView && (field == ZmItem.F_TYPE)) {
		// Type icon (mixed view only)
		if (conv.isDraft) {
			htmlArr[idx++] = "<td style='width:";
			htmlArr[idx++] = params.width;
			htmlArr[idx++] = "' class='Icon'>";
			htmlArr[idx++] = AjxImg.getImageHtml("MsgStatusDraft", null, ["id='", this._getFieldId(conv, ZmItem.F_STATUS), "'"].join(""));
			htmlArr[idx++] = "</td>";
		} else {
			idx = ZmListView.prototype._getField.apply(this, arguments);
		}
	} else {
		idx = ZmListView.prototype._getField.apply(this, arguments);
	}

	return idx;
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

	var conv = ev.item;
	if (ev.handled || (conv.type != ZmItem.CONV)) { return; }

	// update count field for this conv
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_COUNT])) {
		var countField = document.getElementById(this._getFieldId(conv, ZmItem.F_COUNT));
		if (countField) {
			countField.innerHTML = conv.numMsgs > 1 ? "(" + conv.numMsgs + ")" : "";
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		var div = document.getElementById(this._getItemId({id: conv._oldId}));
		if (div) {
			this._createItemHtml(conv, this._now, false, false, div);
			this.associateItemWithElement(conv, div, DwtListView.TYPE_LIST_ITEM);
			DBG.println(AjxDebug.DBG1, "conv updated from ID " + conv._oldId + " to ID " + conv.id);
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_PARTICIPANT])) {
		var fieldId = this._getFieldId(conv, ZmItem.F_PARTICIPANT);
		var participantField = document.getElementById(fieldId);
		if (participantField) {
			participantField.innerHTML = this._getParticipantHtml(conv, fieldId);
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_DATE])) {
		var fieldId = this._getFieldId(conv, ZmItem.F_DATE);
		var dateField = document.getElementById(fieldId);
		if (dateField) {
			var html = [];
			this._getField(html, 0, conv, ZmItem.F_DATE, 6, new Date());
			dateField.innerHTML = html.join("");
		}
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_INDEX])) {
		// a conv has gotten a new msg and may need to be moved within its list
		var sortIndex = ev.getDetail("sortIndex");
		if ((sortIndex[conv.id] != null) && (this._list.indexOf(conv) != sortIndex[conv.id])) {
			this.removeItem(conv);
			this.addItem(conv, sortIndex[conv.id]);
		}
	}

	if (!ev.handled) {
		ZmMailListView.prototype._changeListener.call(this, ev);
	}

	if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE)	{
		this._resetColWidth();
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
		var partColWidth = this._headerList[this.getColIndexForId(ZmItem.F_PARTICIPANT)]._width;
		var part2 = this._fitParticipants(part1, conv.participantsElided, partColWidth);
		for (var j = 0; j < part2.length; j++) {
			if (j == 1 && (conv.participantsElided || part2.length < origLen)) {
				html[idx++] = AjxStringUtil.ELLIPSIS;
			} else if (part2.length > 1 && j > 0) {
				html[idx++] = ", ";
			}
			html[idx++] = "<span style='white-space: nowrap' id='";
			html[idx++] = fieldId;
			html[idx++] = "_";
			html[idx++] = part2[j].index;
			html[idx++] = "'>";
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

	return html.join("");
};


// Static methods

ZmConvListView.getPrintHtml =
function(conv, preferHtml, callback, appCtxt) {

	// first, get list of all msg id's for this conversation
	if (conv.msgIds == null) {
		var soapDoc = AjxSoapDoc.create("GetConvRequest", "urn:zimbraMail");
		var msgNode = soapDoc.set("c");
		msgNode.setAttribute("id", conv.id);

		var respCallback = new AjxCallback(null, ZmConvListView._handleResponseGetPrintHtml, [conv, preferHtml, appCtxt, callback]);
		window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
	} else {
		ZmConvListView._printMessages(conv, preferHtml, appCtxt, callback);
	}
};

ZmConvListView._handleResponseGetPrintHtml =
function(conv, preferHtml, appCtxt, callback, result) {
	var resp = result.getResponse().GetConvResponse.c[0];
	var msgIds = new Array();
	var len = resp.m.length;
	for (var i = 0; i < len; i++)
		msgIds.push(resp.m[i].id);
	conv.msgIds = msgIds;
	ZmConvListView._printMessages(conv, preferHtml, appCtxt, callback);
};

ZmConvListView._printMessages =
function(conv, preferHtml, appCtxt, callback) {
	// XXX: optimize? Once these msgs are d/l'ed should they be cached?
	var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
	soapDoc.setMethodAttribute("onerror", "continue");

	for (var i = 0; i < conv.msgIds.length; i++) {
		// make a request to get this mail message from the server
		var msgRequest = soapDoc.set("GetMsgRequest", null, null, "urn:zimbraMail");

		var doc = soapDoc.getDoc();
		var msgNode = doc.createElement("m");
		msgNode.setAttribute("id", conv.msgIds[i]);
		if (preferHtml)
			msgNode.setAttribute("html", "1");
		msgRequest.appendChild(msgNode);
	}
	var respCallback = new AjxCallback(null, ZmConvListView._handleResponseGetMessages, [conv, preferHtml, appCtxt, callback]);
	window._zimbraMail.sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};

ZmConvListView._handleResponseGetMessages =
function(conv, preferHtml, appCtxt, callback, result) {
	var resp = result.getResponse().BatchResponse.GetMsgResponse;

	var html = new Array();
	var idx = 0;

	html[idx++] = "<font size=+2>";
	html[idx++] = conv.subject;
	html[idx++] = "</font><br><font size=+1>";
	html[idx++] = conv.numMsgs;
	html[idx++] = (conv.numMsgs > 1) ? " messages" : " message";
	html[idx++] = "</font><hr>";

	for (var i = 0; i < resp.length; i++) {
		var msgNode = resp[i].m[0];
		var msg = ZmMailMsg.createFromDom(msgNode, {appCtxt:appCtxt, list:null});
		html[idx++] = ZmMailMsgView.getPrintHtml(msg, preferHtml);
		if (i < resp.length - 1)
			html[idx++] = "<hr>";
	}

	result.set(html.join(""));
	if (callback) callback.run(result);
};
