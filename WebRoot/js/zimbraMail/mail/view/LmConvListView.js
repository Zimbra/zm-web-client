function LmConvListView(parent, className, posStyle, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	LmMailListView.call(this, parent, className, posStyle, LmController.CONVLIST_VIEW, LmItem.CONV, headerList, dropTgt);
	this._controller = controller;
}

LmConvListView.prototype = new LmMailListView;
LmConvListView.prototype.constructor = LmConvListView;

// Consts

LmConvListView.CONVLIST_REPLENISH_THRESHOLD = 0;
LmConvListView.CLV_COLWIDTH_ICON 			= 16;
LmConvListView.CLV_COLWIDTH_FROM 			= 145;
LmConvListView.CLV_COLWIDTH_DATE 			= 60;

LmConvListView.prototype.toString = 
function() {
	return "LmConvListView";
}

LmConvListView.prototype._createItemHtml =
function(conv, now, isDndIcon, isMixedView, div) {

	var	div = div ? div : this._getDiv(conv, isDndIcon);
	div.className = div._styleClass;
	// XXX: for some reason, we need to explicitly set the height of the div
	// since FF barfs if u remove the flag column.. too busy to figure out why
	if (LsEnv.isMozilla)
		div.style.height = "20px";

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
		if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FLAG]) == 0) {
			// Flags
			idx = this._getField(htmlArr, idx, conv, LmItem.F_FLAG, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, conv, LmItem.F_TAG, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT]) == 0) {
			// Participants
			var width = LsEnv.isIE ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
			var fieldId = this._getFieldId(conv, LmItem.F_PARTICIPANT);
			htmlArr[idx++] = "<td width=" + width + " id='" + fieldId + "'>";
			htmlArr[idx++] = this._getParticipantHtml(conv, fieldId);
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT]) == 0) {
			// Attachments icon
			idx = this._getField(htmlArr, idx, conv, LmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) == 0) {
			// Subject
			htmlArr[idx++] = "<td id='" + this._getFieldId(conv, LmItem.F_SUBJECT) + "'";
			htmlArr[idx++] = LsEnv.isSafari ? " style='width: auto;'>" : ">";
			htmlArr[idx++] = conv.subject ? LsStringUtil.htmlEncode(conv.subject, true) : LsStringUtil.htmlEncode(LmMsg.noSubject);
			if (this._appCtxt.get(LmSetting.SHOW_FRAGMENTS) && conv.fragment) {
				htmlArr[idx++] = "<span class='LmConvListFragment'>";
				htmlArr[idx++] = " - ";
				htmlArr[idx++] = LsStringUtil.htmlEncode(conv.fragment, true);
				htmlArr[idx++] = "</span>";
			}
			htmlArr[idx++] = LsEnv.isNav ? LmListView._fillerString : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_COUNT]) == 0) {
			var width = LsEnv.isIE ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
			htmlArr[idx++] = "<td id='" + this._getFieldId(conv, LmItem.F_COUNT) + "'";
			htmlArr[idx++] = " width=" + width + ">";
			htmlArr[idx++] = conv.numMsgs > 1 ? ("(" + conv.numMsgs + ")") : "";
			htmlArr[idx++] = LsEnv.isNav ? LmListView._fillerString : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_DATE]) == 0) {
			// Date
			idx = this._getField(htmlArr, idx, conv, LmItem.F_DATE, i, now);
		} else if (isMixedView && id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ICON]) == 0) {
			// Type icon (mixed view only)
			idx = this._getField(htmlArr, idx, conv, LmItem.F_ITEM_TYPE, i);
		}
	}
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
}

LmConvListView.prototype.markUIAsRead = 
function(items, on) {
	var doc = this.getDocument();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var row = Dwt.getDomObj(doc, this._getFieldId(item, LmItem.F_ITEM_ROW));
		if (row)
			row.className = on ? "" : "Unread";
		var img = Dwt.getDomObj(doc, this._getFieldId(item, LmItem.F_STATUS));
		if (img && img.parentNode)
			LsImg.setImage(img.parentNode, on ? LmImg.I_READ_MSG : LmImg.I_ENVELOPE);
	}
}

LmConvListView.prototype.setSize = 
function(width, height) {
	LmMailListView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

LmConvListView.prototype.setBounds = 
function(x, y, width, height) {
	LmMailListView.prototype.setBounds.call(this, x, y, width, height);
	this._resetColWidth();
};

LmConvListView.prototype._changeListener =
function(ev) {
	// update count field for this conv
	var fields = ev.getDetail("fields");
	var items = ev.getDetail("items");
	if (ev.event == LmEvent.E_MODIFY && (fields && fields[LmItem.F_COUNT])) {
		for (var i = 0; i < items.length; i++) {
			var countField = Dwt.getDomObj(this.getDocument(), this._getFieldId(items[i], LmItem.F_COUNT));
			if (countField)
				countField.innerHTML = items[i].numMsgs > 1 ? "(" + items[i].numMsgs + ")" : "";
		}
	} else if (ev.event == LmEvent.E_MODIFY && (fields && fields[LmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		for (var i = 0; i < items.length; i++) {
			var conv = items[i];
			var div = Dwt.getDomObj(this.getDocument(), this._getItemId({id: conv._oldId}));
			if (div) {
				this._createItemHtml(conv, this._now, false, false, div);
				this.associateItemWithElement(conv, div, DwtListView.TYPE_LIST_ITEM);
				DBG.println(LsDebug.DBG1, "conv updated from ID " + conv._oldId + " to ID " + conv.id);
			}
		}
	} else if (ev.event == LmEvent.E_MODIFY && (fields && fields[LmItem.F_PARTICIPANT])) {
		for (var i = 0; i < items.length; i++) {
			var fieldId = this._getFieldId(items[i], LmItem.F_PARTICIPANT);
			var participantField = Dwt.getDomObj(this.getDocument(), fieldId);
			if (participantField)
				participantField.innerHTML = this._getParticipantHtml(items[i], fieldId);
		}
	} else {
		LmMailListView.prototype._changeListener.call(this, ev);
		if (ev.event == LmEvent.E_CREATE || ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_MOVE)	{
			this._resetColWidth();
		}
	}
}

LmConvListView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();
	
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_FLAG], null, LmImg.I_FLAG_ON, LmConvListView.CLV_COLWIDTH_ICON, null, null, null, LmMsg.flag));
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(LmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_TAG], null, LmImg.I_MINI_TAG, LmConvListView.CLV_COLWIDTH_ICON, null, null, null, LmMsg.tag));
	}
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT], LmMsg.from, null, LmConvListView.CLV_COLWIDTH_FROM, null, true));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT], null, LmImg.I_ATTACHMENT, LmConvListView.CLV_COLWIDTH_ICON, null, null, null, LmMsg.attachment));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT], LmMsg.subject, null, null, LmItem.F_SUBJECT));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_COUNT], null, LmImg.I_CONV, 25, null, null, null, LmMsg.count));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_DATE], LmMsg.received, null, LmConvListView.CLV_COLWIDTH_DATE, LmItem.F_DATE));
	
	return headerList;
}

LmConvListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {

	// call base class to save the new sorting pref
	LmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);
	
	if (this.getList().size() > 1 && this._sortByString) {
		var searchString = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvListController().getSearchString();
		this._appCtxt.getSearchController().search(searchString, [LmItem.CONV], this._sortByString, 0, this.getLimit());
	}
}

LmConvListView.prototype._getDefaultSortbyForCol = 
function(colHeader) {
	// if not date field, sort asc by default
	return colHeader._sortable != LmItem.F_DATE;
}

LmConvListView.prototype.getReplenishThreshold = 
function() {
	return LmConvListView.CONVLIST_REPLENISH_THRESHOLD;
}

LmConvListView.getPrintHtml = 
function(conv, preferHtml) {

	// first, get list of all msg id's for this conversation
	if (conv.msgIds == null) {
		var soapDoc = LsSoapDoc.create("GetConvRequest", "urn:liquidMail");
		var msgNode = soapDoc.set("c");
		msgNode.setAttribute("id", conv.id);
		var resp = LsCsfeCommand.invoke(soapDoc).Body.GetConvResponse.c[0];
		var msgIds = new Array();
		for (var i = 0; i < resp.m.length; i++)
			msgIds.push(resp.m[i].id);
		conv.msgIds = msgIds;
	}
	
	// XXX: optimize? Once these msgs are d/l'ed should they be cached?
	var soapDoc = LsSoapDoc.create("BatchRequest", "urn:liquid");
	soapDoc.setMethodAttribute("onerror", "continue");
	
	for (var i = 0; i < conv.msgIds.length; i++) {
		// make a request to get this mail message from the server
		var msgRequest = soapDoc.set("GetMsgRequest");
		msgRequest.setAttribute("xmlns", "urn:liquidMail");

		var doc = soapDoc.getDoc();
		var msgNode = doc.createElement("m");
		msgNode.setAttribute("id", conv.msgIds[i]);
		if (preferHtml)
			msgNode.setAttribute("html", "1");
		msgRequest.appendChild(msgNode);
	}
	var resp = LsCsfeCommand.invoke(soapDoc).Body.BatchResponse.GetMsgResponse;
	
	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<font size=+2>" + conv.subject + "</font><br>";
	html[idx++] = "<font size=+1>" + conv.numMsgs;
	html[idx++] = (conv.numMsgs > 1) ? " messages" : " message";
	html[idx++] = "</font><hr>";
	
	for (var i = 0; i < resp.length; i++) {
		var msgNode = resp[i].m[0];
		var msg = LmMailMsg.createFromDom(msgNode, {appCtxt: null, list: null});
		
		html[idx++] = LmMailMsgView.getPrintHtml(msg, preferHtml);
		if (i < resp.length-1)
			html[idx++] = "<hr>";
	}
	
	return html.join("");
}

LmConvListView.prototype._getParticipantHtml = 
function(conv, fieldId) {
	var html = new Array();
	var idx = 0;

	var part1 = conv.participants.getArray();
	var origLen = part1.length;
	// might get a weird case where there are no participants in message
	if (origLen > 0) {
		var part2 = this._fitParticipants(part1, conv.participantsElided, 145);
		for (var j = 0; j < part2.length; j++) {
			if (j == 1 && (conv.participantsElided || part2.length < origLen)) {
				html[idx++] = LsStringUtil.ELLIPSIS;
			} else if (part2.length > 1 && j > 0) {
				html[idx++] = ", ";
			}
			var partId = fieldId + "_" + part2[j].index;
			html[idx++] = "<span style='white-space: nowrap' id='" + partId + "'>";
			html[idx++] = part2[j].name;
			html[idx++] = "</span>";
		}
	} else {
		// XXX: possible import bug but we must take into account
		html[idx++] = LmMsg.noWhere;
	}
	if (LsEnv.isNav)
		html[idx++] = LmListView._fillerString;
		
	return html.join("");
}
