/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new double-pane view, with a list of conversations in the top pane,
 * and a message in the bottom pane.
 * @constructor
 * @class
 * This variation of a double pane view combines a conv list view with a reading
 * pane in which the first msg of a conv is shown. Any conv with more than one
 * message is expandable, and gets an expansion icon in the left column. Clicking on that
 * will display the conv's first page of messages. The icon then becomes a collapse icon and
 * clicking it will collapse the conv (hide the messages).
 * <p>
 * If a conv has more than one page of messages, the last message on the first page
 * will get a + icon, and that message is expandable.</p>
 *
 * @author Conrad Damon
 * 
 * @private
 */
ZmConvDoublePaneView = function(params) {

	this._invitereplylisteners = [];
	this._sharelisteners = [];
	this._subscribelisteners = [];

	params.className = params.className || "ZmConvDoublePaneView";
	params.mode = ZmId.VIEW_CONVLIST;
	ZmDoublePaneView.call(this, params);
};

ZmConvDoublePaneView.prototype = new ZmDoublePaneView;
ZmConvDoublePaneView.prototype.constructor = ZmConvDoublePaneView;

ZmConvDoublePaneView.prototype.isZmConvDoublePaneView = true;
ZmConvDoublePaneView.prototype.toString = function() { return "ZmConvDoublePaneView"; };

ZmConvDoublePaneView.prototype._createMailListView =
function(params) {
	return new ZmConvListView(params);
};

// default to conv item view
ZmConvDoublePaneView.prototype._createMailItemView =
function(params) {
	this._itemViewParams = params;
	return this._getItemView(ZmItem.CONV);
};

// get the item view based on the given type
ZmConvDoublePaneView.prototype._getItemView =
function(type) {
	var newview;
	
	this._itemViewParams.className = null;
	if (type == ZmItem.CONV) {
		if (!this._convView) {
			this._itemViewParams.id = ZmId.getViewId(ZmId.VIEW_CONV, null, this._itemViewParams.view);
			newview = this._convView = new ZmConvView2(this._itemViewParams);
		}
	}
	else if (type == ZmItem.MSG) {
		if (!this._mailMsgView) {
			this._itemViewParams.id = ZmId.getViewId(ZmId.VIEW_MSG, null, this._itemViewParams.view);
			newview = this._mailMsgView = new ZmMailMsgView(this._itemViewParams);
		}
	}

	if (newview) {
		AjxUtil.foreach(this._invitereplylisteners,
		                function(listener) {
		                	newview.addInviteReplyListener(listener);
		                });
		AjxUtil.foreach(this._sharelisteners,
		                function(listener) {
		                	newview.addShareListener(listener);
		                });
		AjxUtil.foreach(this._subscribelisteners,
		                function(listener) {
		                	newview.addSubscribeListener(listener);
		                });
	}

	return (type == ZmItem.CONV) ? this._convView : this._mailMsgView;
};

// set up to display either a conv or a msg in the item view
ZmConvDoublePaneView.prototype.setItem =
function(item, force) {

	if (!force && !this._controller.popShield(null, this.setItem.bind(this, item, true))) {
		return;
	}

	var changed = ((item.type == ZmItem.CONV) != (this._itemView && this._itemView == this._convView));
	var itemView = this._itemView = this._getItemView(item.type);
	var otherView = (item.type == ZmItem.CONV) ? this._mailMsgView : this._convView;
	if (otherView) {
		otherView.setVisible(false);
	}
	// Clear quick reply if going from msg view to conv view in reading pane
	if (changed && itemView && itemView._replyView) {
		itemView._replyView.reset();
	}
	this._itemView.setVisible(true,null,item);
	if (changed) {
		this.setReadingPane(true);	// so that second view gets positioned
	}

	return ZmDoublePaneView.prototype.setItem.apply(this, arguments);
};

ZmConvDoublePaneView.prototype.addInviteReplyListener =
function(listener) {
	this._invitereplylisteners.push(listener);
	ZmDoublePaneView.prototype.addInviteReplyListener.call(this, listener);
};

ZmConvDoublePaneView.prototype.addShareListener =
function(listener) {
	this._sharelisteners.push(listener);
	ZmDoublePaneView.prototype.addShareListener.call(this, listener);
};

ZmConvDoublePaneView.prototype.addSubscribeListener =
function(listener) {
	this._subscribelisteners.push(listener);
	ZmDoublePaneView.prototype.addSubscribeListener.call(this, listener);
};

/**
 * This class is a ZmMailListView which can display both convs and msgs.
 * It handles expanding convs as well as paging additional messages in. Message rows are
 * inserted after the row of the owning conv.
 * 
 * @private
 */
ZmConvListView = function(params) {

	params.type = ZmItem.CONV;
	this._controller = params.controller;
	this._mode = this.view = ZmId.VIEW_CONVLIST;
	params.headerList = this._getHeaderList();
	ZmMailListView.call(this, params);

	// change listener needs to handle both types of events
	this._handleEventType[ZmItem.CONV] = true;
	this._handleEventType[ZmItem.MSG] = true;

	this.setAttribute("aria-label", ZmMsg.conversationList);

	this._hasHiddenRows = true;	// so that up and down arrow keys work
	this._resetExpansion();
};

ZmConvListView.prototype = new ZmMailListView;
ZmConvListView.prototype.constructor = ZmConvListView;

ZmConvListView.prototype.isZmConvListView = true;
ZmConvListView.prototype.toString = function() { return "ZmConvListView"; };

ZmConvListView.prototype.role = 'tree';
ZmConvListView.prototype.itemRole = 'treeitem';

// Constants

ZmListView.FIELD_CLASS[ZmItem.F_EXPAND] = "Expand";

ZmConvListView.MSG_STYLE = "ZmConvExpanded";	// for differentiating msg rows


ZmConvListView.prototype.set =
function(list, sortField) {
	if (this.offset == 0) {
		this._resetExpansion();
	}
	ZmMailListView.prototype.set.apply(this, arguments);
};

/**
 * check whether all conversations are checked
 * overrides ZmListView.prototype._isAllChecked since the list here contains both conversations and messages, and we care only about messages
 * @return {Boolean} true if all conversations are checked
 */
ZmConvListView.prototype._isAllChecked =
function() {
	var selection = this.getSelection();
	//let's see how many conversations are checked.
	//ignore checked messages. Sure, if the user selects manually all messages in a conversation, the
	//conversation is not selected automatically too, but that's fine I think.
	//This method returns true if and only if all the conversations (in the conversation layer of the tree) are selected
	var convsSelected = 0;
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].type == ZmItem.CONV) {
			convsSelected++;
		}
	}

	var list = this.getList();
	return (list && convsSelected == list.size());
};


ZmConvListView.prototype.markUIAsMute =
function(item) {
	ZmMailListView.prototype.markUIAsMute.apply(this, arguments);
};

ZmConvListView.prototype.markUIAsRead =
function(item) {
	ZmMailListView.prototype.markUIAsRead.apply(this, arguments);
	if (item.type == ZmItem.MSG) {
		var classes = this._getClasses(ZmItem.F_STATUS, !this.isMultiColumn() ? ["ZmMsgListBottomRowIcon"]:null);
		this._setImage(item, ZmItem.F_STATUS, item.getStatusIcon(), classes);
	}
};

/**
 * Overrides DwtListView.getList to optionally include any visible msgs.
 *
 * @param {Boolean}	allItems	if <code>true</code>, include visible msgs
 */
ZmConvListView.prototype.getList =
function(allItems) {
	if (!allItems) {
		return ZmMailListView.prototype.getList.call(this);
	} else {
		var list = [];
		var childNodes = this._parentEl.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			var el = childNodes[i];
			if (Dwt.getVisible(el)) {
				var item = this.getItemFromElement(el);
				if (item) {
					list.push(item);
				}
			}
		}
		return AjxVector.fromArray(list);
	}
};

// See if we've been rigged to return a particular msg
ZmConvListView.prototype.getSelection =
function() {
	return this._selectedMsg ? [this._selectedMsg] : ZmMailListView.prototype.getSelection.apply(this, arguments);
};

ZmConvListView.prototype.getItemIndex =
function(item, allItems) {
	var list = this.getList(allItems);
	if (item && list) {
		var len = list.size();
		for (var i = 0; i < len; ++i) {
			var test = list.get(i);
			if (test && test.id == item.id) {
				return i;
			}
		}
	}
	return null;
};

ZmConvListView.prototype._initHeaders =
function() {
	if (!this._headerInit) {
		ZmMailListView.prototype._initHeaders.call(this);
		this._headerInit[ZmItem.F_EXPAND]	= {icon:"NodeCollapsed", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.expand, tooltip: ZmMsg.expandCollapse, cssClass:"ZmMsgListColExpand"};
        //bug:45171 removed sorted from converstaion for FROM field
        this._headerInit[ZmItem.F_FROM]		= {text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_CLV, resizeable:true, cssClass:"ZmMsgListColFrom"};
        this._headerInit[ZmItem.F_FOLDER]		= {text:ZmMsg.folder, width:ZmMsg.COLUMN_WIDTH_FOLDER, resizeable:true, cssClass:"ZmMsgListColFolder",visible:false};
	}
};

ZmConvListView.prototype._getLabelFieldList =
function() {
	var headers = ZmMailListView.prototype._getLabelFieldList.call(this);
	var selectionidx = AjxUtil.indexOf(headers, ZmItem.F_SELECTION);

	if (selectionidx >= 0) {
		headers.splice(selectionidx + 1, 0, ZmItem.F_EXPAND);
	}

	return headers;
}

ZmConvListView.prototype._getDivClass =
function(base, item, params) {
	if (item.type == ZmItem.MSG) {
		if (params.isDragProxy || params.isMatched) {
			return ZmMailMsgListView.prototype._getDivClass.apply(this, arguments);
		} else {
			return [base, ZmConvListView.MSG_STYLE].join(" ");
		}
	} else {
		return ZmMailListView.prototype._getDivClass.apply(this, arguments);
	}
};

ZmConvListView.prototype._getRowClass =
function(item) {
	return (item.type == ZmItem.MSG) ?
		ZmMailMsgListView.prototype._getRowClass.apply(this, arguments) :
		ZmMailListView.prototype._getRowClass.apply(this, arguments);
};

// set isMatched for msgs	
ZmConvListView.prototype._addParams =
function(item, params) {
	if (item.type == ZmItem.MSG) {
		ZmMailMsgListView.prototype._addParams.apply(this, arguments);
	}
};


ZmConvListView.prototype._getCellId =
function(item, field) {
	return ((field == ZmItem.F_FROM || field == ZmItem.F_SUBJECT) && item.type == ZmItem.CONV)
		? this._getFieldId(item, field)
		: ZmMailListView.prototype._getCellId.apply(this, arguments);
};

ZmConvListView.prototype._getCellClass =
function(item, field, params) {
	var cls = ZmMailListView.prototype._getCellClass.apply(this, arguments);
	return item.type === ZmItem.CONV && field === ZmItem.F_SIZE ? "Count " + cls : cls;
};


ZmConvListView.prototype._getCellCollapseExpandImage =
function(item) {
	if (!this._isExpandable(item)) {
		return null;
	}
	return this._expanded[item.id] ? "NodeExpanded" : "NodeCollapsed";
};


ZmConvListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params, classes) {

	var classes = classes || [];
	var zimletStyle = this._getStyleViaZimlet(field, item) || "";
	
	if (field === ZmItem.F_SELECTION) {
		if (this.isMultiColumn()) {
			//add the checkbox only for multicolumn layout. The checkbox for single column layout is added in _getAbridgedContent
			idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
		}
	}
	else if (field === ZmItem.F_EXPAND) {
		idx = this._getImageHtml(htmlArr, idx, this._getCellCollapseExpandImage(item), this._getFieldId(item, field), classes);
	}
    else if (field === ZmItem.F_READ) {
		idx = this._getImageHtml(htmlArr, idx, item.getReadIcon(), this._getFieldId(item, field), classes);
	}
	else if (item.type === ZmItem.MSG) {
		idx = ZmMailMsgListView.prototype._getCellContents.apply(this, arguments);
	}
	else {
		var visibleMsgCount = this._getDisplayedMsgCount(item);
		if (field === ZmItem.F_STATUS) {
			if (item.type == ZmItem.CONV && item.numMsgs == 1 && item.isScheduled) {
				idx = this._getImageHtml(htmlArr, idx, "SendLater", this._getFieldId(item, field), classes);
			} else {
				htmlArr[idx++] = "<div " + AjxUtil.getClassAttr(classes) + "></div>";
			}
		}
		else if (field === ZmItem.F_FROM) {
			htmlArr[idx++] = "<div id='" + this._getFieldId(item, field) + "' " + AjxUtil.getClassAttr(classes) +  zimletStyle + ">";
			htmlArr[idx++] = this._getParticipantHtml(item, this._getFieldId(item, ZmItem.F_PARTICIPANT));
			if (item.type === ZmItem.CONV && (visibleMsgCount > 1) && !this.isMultiColumn()) {
				htmlArr[idx++] = " - <span class='ZmConvListNumMsgs'>";
				htmlArr[idx++] = visibleMsgCount;
				htmlArr[idx++] = "</span>";
			}
			htmlArr[idx++] = "</div>";
		}
		else if (field === ZmItem.F_SUBJECT) {
			var subj = item.subject || ZmMsg.noSubject;
			if (item.numMsgs > 1) {
				subj = ZmMailMsg.stripSubjectPrefixes(subj);
			}
			htmlArr[idx++] = "<div id='" + this._getFieldId(item, field) + "' " + AjxUtil.getClassAttr(classes) + zimletStyle + ">";
			htmlArr[idx++] = "<span>";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(subj, true) + "</span>";
			if (appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && item.fragment) {
				htmlArr[idx++] = this._getFragmentSpan(item);
			}
			htmlArr[idx++] = "</div>";
		}
		else if (field === ZmItem.F_FOLDER) {
				htmlArr[idx++] = "<div " + AjxUtil.getClassAttr(classes) + " id='";
				htmlArr[idx++] = this._getFieldId(item, field);
				htmlArr[idx++] = "'>"; // required for IE bug
				if (item.folderId) {
					var folder = appCtxt.getById(item.folderId);
					if (folder) {
						htmlArr[idx++] = folder.getName();
					}
				}
				htmlArr[idx++] = "</div>";
		}
		else if (field === ZmItem.F_SIZE) {
			htmlArr[idx++] = "<div id='" + this._getFieldId(item, field) + "' " + AjxUtil.getClassAttr(classes) + ">";
			if (item.size) {
				htmlArr[idx++] = AjxUtil.formatSize(item.size);
			}
			else {
				htmlArr[idx++] = "(";
				htmlArr[idx++] = visibleMsgCount;
				htmlArr[idx++] = ")";
			}
			htmlArr[idx++] = "</div>";
		}
		else if (field === ZmItem.F_SORTED_BY) {
			htmlArr[idx++] = this._getAbridgedContent(item, colIdx);
		}
		else {
			idx = ZmMailListView.prototype._getCellContents.apply(this, arguments);
		}
	}
	
	return idx;
};

ZmConvListView.prototype._getAbridgedContent =
function(item, colIdx) {

	var htmlArr = [];
	var idx = 0;
	var width = (AjxEnv.isIE || AjxEnv.isSafari) ? 22 : 16;

	var isMsg = (item.type === ZmItem.MSG);
	var isConv = (item.type === ZmItem.CONV && this._getDisplayedMsgCount(item) > 1);

	var selectionCssClass = '';
	for (var i = 0; i < this._headerList.length; i++) {
		if (this._headerList[i]._field == ZmItem.F_SELECTION) {
			selectionCssClass = "ZmMsgListSelection";
			break;
		}
	}
	htmlArr[idx++] = "<div class='TopRow " + selectionCssClass + "' ";
	htmlArr[idx++] = "id='";
	htmlArr[idx++] = DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, item.id, ZmItem.F_ITEM_ROW_3PANE);
	htmlArr[idx++] = "'>";
	if (selectionCssClass) {
		idx = ZmMailListView.prototype._getCellContents.apply(this, [htmlArr, idx, item, ZmItem.F_SELECTION, colIdx]);
	}
	if (isMsg) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_EXPAND, colIdx);
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_READ, colIdx, width);
	if (isConv) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_EXPAND, colIdx, "16", null, ["ZmMsgListExpand"]);
	}
	
	// for multi-account, show the account icon for cross mbox search results
	if (appCtxt.multiAccounts && !isMsg && appCtxt.getSearchController().searchAllAccounts) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ACCOUNT, colIdx, "16");
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FROM, colIdx);
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_DATE, colIdx, ZmMsg.COLUMN_WIDTH_DATE, null, ["ZmMsgListDate"]);
	htmlArr[idx++] = "</div>";

	// second row
	htmlArr[idx++] = "<div class='BottomRow " + selectionCssClass + "'>";
	var bottomRowMargin = ["ZmMsgListBottomRowIcon"];
	if (isMsg) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_STATUS, colIdx, width, null, bottomRowMargin);
		bottomRowMargin = null;
	}
	if (item.isHighPriority || item.isLowPriority) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_PRIORITY, colIdx, "10", null, bottomRowMargin);
		bottomRowMargin = null;
	}
	idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_SUBJECT, colIdx, null, null, bottomRowMargin);

	//add the attach, flag and tags in a wrapping div
	idx = this._getListFlagsWrapper(htmlArr, idx, item);

	if (item.hasAttach) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_ATTACHMENT, colIdx, width);
	}
	var tags = item.getVisibleTags();
	if (tags && tags.length) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_TAG, colIdx, width, null, ["ZmMsgListColTag"]);
	}
	if (appCtxt.get(ZmSetting.FLAGGING_ENABLED)) {
		idx = this._getAbridgedCell(htmlArr, idx, item, ZmItem.F_FLAG, colIdx, width);
	}
	htmlArr[idx++] = "</div></div>";
	
	return htmlArr.join("");
};

ZmConvListView.prototype._getParticipantHtml =
function(conv, fieldId) {

	var html = [];
	var idx = 0;

	var part = conv.participants ? conv.participants.getArray() : [],
		isOutbound = this._isOutboundFolder(),
		part1 = [];

	for (var i = 0; i < part.length; i++) {
		var p = part[i];
		if ((isOutbound && p.type === AjxEmailAddress.TO) || (!isOutbound && p.type === AjxEmailAddress.FROM)) {
			part1.push(p);
		}
	}
	// Workaround for bug 87597: for "sent" folder, when no "to" fields were reported after notification,
	// push all participants to part1 to trick origLen > 0
	// then get recipients from msg.getAddresses below and overwrite part1
	if (part1.length === 0 && isOutbound) {
		part1 = part;
	}
	var origLen = part1 ? part1.length : 0;
	if (origLen > 0) {

		// bug 23832 - create notif for conv in sent gives us sender as participant, we want recip
		if (origLen == 1 && (part1[0].type === AjxEmailAddress.FROM) && conv.isZmConv && isOutbound) {
			var msg = conv.getFirstHotMsg();
			if (msg) {
				var addrs = msg.getAddresses(AjxEmailAddress.TO).getArray();
	            if (addrs && addrs.length) {
					part1 = addrs;
				} else {
					return "&nbsp;"
				}
			}
		}

		var headerCol = this._headerHash[ZmItem.F_FROM];
		var partColWidth = headerCol ? headerCol._width : ZmMsg.COLUMN_WIDTH_FROM_CLV;
		var part2 = this._fitParticipants(part1, conv, partColWidth);
		for (var j = 0; j < part2.length; j++) {
			if (j === 0 && (conv.participantsElided || part2.length < origLen)) {
				html[idx++] = AjxStringUtil.ELLIPSIS;
			}
			else if (part2.length > 1 && j > 0) {
				html[idx++] = AjxStringUtil.LIST_SEP;
			}
			var p2 = (part2 && part2[j] && (part2[j].index != null)) ? part2[j].index : "";
			var spanId = [fieldId, p2].join(DwtId.SEP);
			html[idx++] = "<span id='";
			html[idx++] = spanId;
			html[idx++] = "'>";
			html[idx++] = (part2 && part2[j]) ? AjxStringUtil.htmlEncode(part2[j].name) : "";
			html[idx++] = "</span>";
		}
	} else {
		html[idx++] = isOutbound ? "&nbsp;" : ZmMsg.noRecipients;
	}

	return html.join("");
};

// Returns the actual number of msgs that will be shown on expansion or in
// the reading pane (msgs in Trash/Junk/Drafts are omitted)
ZmConvListView.prototype._getDisplayedMsgCount =
function(conv) {

	var omit = ZmMailApp.getFoldersToOmit(),
		num = 0, id;

	if (AjxUtil.arraySize(conv.msgFolder) < conv.numMsgs) {
		//if msgFolder is empty, or does not include folders for all numMsgs message, for some reason (there are complicated cases like that), assume all messages are displayed.
		// This should not cause too big of a problem, as when the user expands, it will load the conv with the correct msgFolder and display only the relevant messages.
		return conv.numMsgs;
	}
	for (id in conv.msgFolder) {
		if (!omit[conv.msgFolder[id]]) {
			num++;
		}
	}

	return num;
};

ZmConvListView.prototype._getLabelForField =
function(item, field) {
	switch (field) {
	case ZmItem.F_EXPAND:
		if (this._isExpandable(item)) {
			return this.isExpanded(item) ? ZmMsg.expanded : ZmMsg.collapsed;
		}

		break;

	case ZmItem.F_SIZE:
		if (item.numMsgs > 1) {
			var messages =
				AjxMessageFormat.format(ZmMsg.typeMessage, item.numMsgs);
			return AjxMessageFormat.format(ZmMsg.itemCount,
			                               [item.numMsgs, messages]);
		}

		break;
	}

	return ZmMailListView.prototype._getLabelForField.apply(this, arguments);
};

ZmConvListView.prototype._getHeaderToolTip =
function(field, itemIdx) {

	if (field == ZmItem.F_EXPAND) {
		return "";
	}
	if (field == ZmItem.F_FROM) {
		return ZmMsg.from;
	}
	return ZmMailListView.prototype._getHeaderToolTip.call(this, field, itemIdx);
};

ZmConvListView.prototype._getToolTip =
function(params) {

	if (!params.item) { return; }

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && (params.field == ZmItem.F_PARTICIPANT)) { 
		var parts = params.item.participants;
		var matchedPart = params.match && params.match.participant;
		var addr = parts && parts.get(matchedPart || 0);
		if (!addr) { return ""; }

		var ttParams = {address:addr, ev:params.ev};
		var ttCallback = new AjxCallback(this,
			function(callback) {
				appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
			});
		return {callback:ttCallback};
	} else if (params.item.type == ZmItem.MSG) {
		return ZmMailMsgListView.prototype._getToolTip.apply(this, arguments);
	} else if (params.field == ZmItem.F_FROM) {
		// do nothing - this is white space in the TD not taken up by participants
	} else {
		return ZmMailListView.prototype._getToolTip.apply(this, arguments);
	}
};

/**
 * @param {ZmConv}		conv	conv that owns the messages we will display
 * @param {ZmMailMsg}	msg		msg that is the anchor for paging in more msgs (optional)
 * @param {boolean}		force	if true, render msg rows		
 * 
 * @private
 */
ZmConvListView.prototype._expand =
function(conv, msg, force) {
	var item = msg || conv;
	var isConv = (item.type == ZmItem.CONV);
	var rowIds = this._msgRowIdList[item.id];
	var lastRow;
	if (rowIds && rowIds.length && this._rowsArePresent(item) && !force) {
		this._showMsgs(rowIds, true);
		lastRow = document.getElementById(rowIds[rowIds.length - 1]);
	} else {
		this._msgRowIdList[item.id] = [];
		var msgList = conv.msgs;
		if (!msgList) { return; }
		if (isConv) {
			// should be here only when the conv is first expanded
			msgList.addChangeListener(this._listChangeListener);
		}

		var ascending = (appCtxt.get(ZmSetting.CONVERSATION_ORDER) == ZmSearch.DATE_ASC);
		var index = this._getRowIndex(item);	// row after which to add rows
		if (ascending && msg) {
			index--;	// for ascending, we want to expand upward (add above expandable msg row)
		}
		var offset = this._msgOffset[item.id] || 0;
		var a = conv.getMsgList(offset, ascending, ZmMailApp.getFoldersToOmit());
		for (var i = 0; i < a.length; i++) {
			var msg = a[i];
			var div = this._createItemHtml(msg);
			this._addRow(div, index + i + 1);
			rowIds = this._msgRowIdList[item.id];
			if (rowIds) {
				rowIds.push(div.id);
			}
			// TODO: we may need to use a group for nested conversations;
			// either as proper DOM nesting or with aria-owns.
			div.setAttribute('aria-level', 2);
			rowIds = this._msgRowIdList[item.id];
			if (i == a.length - 1) {
				lastRow = div;
			}
		}
	}

	this._setImage(item, ZmItem.F_EXPAND, "NodeExpanded", this._getClasses(ZmItem.F_EXPAND));
	this._expanded[item.id] = true;
	
	var cid = isConv ? item.id : item.cid;
	if (!this._expandedItems[cid]) {
		this._expandedItems[cid] = [];
	}
	this._expandedItems[cid].push(item);

	this._resetColWidth();
	if (lastRow) {
		this._scrollList(lastRow);
		if (rowIds) {
			var convHeight = rowIds.length * Dwt.getSize(lastRow).y;
			if (convHeight > Dwt.getSize(lastRow.parentNode).y) {
				this._scrollList(this._getElFromItem(item));
			}
		}
	}

	this._updateLabelForItem(item);
};

ZmConvListView.prototype._collapse =
function(item) {
	var isConv = (item.type == ZmItem.CONV);
	var cid = isConv ? item.id : item.cid;
	var expItems = this._expandedItems[cid];
	// also collapse any expanded sections below us within same conv
	if (expItems && expItems.length) {
		var done = false;
		while (!done) {
			var nextItem = expItems.pop();
			this._doCollapse(nextItem);
			done = ((nextItem.id == item.id) || (expItems.length == 0));
		}
	}

	if (isConv) {
		this._expanded[item.id] = false;
		this._expandedItems[cid] = [];
	}

	this._resetColWidth();
	this._updateLabelForItem(item);
};

ZmConvListView.prototype._updateLabelForItem =
function(item) {
	ZmMailListView.prototype._updateLabelForItem.apply(this, arguments);

	if (item && this._isExpandable(item)) {
		var el = this._getElFromItem(item);
		if (el && el.setAttribute) {
			el.setAttribute('aria-expanded', this.isExpanded(item));
		}
	}
}

ZmConvListView.prototype._doCollapse =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length) {
		this._showMsgs(rowIds, false);
	}
	this._setImage(item, ZmItem.F_EXPAND, "NodeCollapsed", this._getClasses(ZmItem.F_EXPAND));
	this._expanded[item.id] = false;
	this._updateLabelForItem(item);
};

ZmConvListView.prototype._showMsgs =
function(ids, show) {
	if (!(ids && ids.length)) { return; }

	for (var i = 0; i < ids.length; i++) {
		var row = document.getElementById(ids[i]);
		if (row) {
			Dwt.setVisible(row, show);
		}
	}
};

/**
 * Make sure that the given item has a set of expanded rows. If you expand an item
 * and then page away and back, the DOM is reset and your rows are gone.
 * 
 * @private
 */
ZmConvListView.prototype._rowsArePresent =
function(item) {
	var rowIds = this._msgRowIdList[item.id];
	if (rowIds && rowIds.length) {
		for (var i = 0; i < rowIds.length; i++) {
			if (document.getElementById(rowIds[i])) {
				return true;
			}
		}
	}
	this._msgRowIdList[item.id] = [];	// start over
	this._expanded[item.id] = false;
	if (item.type == ZmItem.CONV) {
		this._expandedItems[item.id] = [];
	}
	else {
		AjxUtil.arrayRemove(this._expandedItems[item.cid], item);
	}
	return false;
};

/**
 * Returns true if the given conv or msg should have an expansion icon. A conv is
 * expandable if it has 2 or more msgs. A msg is expandable if it's the last on a
 * page and there are more msgs.
 *
 * @param item		[ZmMailItem]	conv or msg to check
 * 
 * @private
 */
ZmConvListView.prototype._isExpandable =
function(item) {
	var expandable = false;
	if (item.type == ZmItem.CONV) {
		expandable = (this._getDisplayedMsgCount(item) > 1);
	} else {
		var conv = appCtxt.getById(item.cid);
		if (!conv) { return false; }
		
		var a = conv.msgs ? conv.msgs.getArray() : null;
		if (a && a.length) {
			var limit = appCtxt.get(ZmSetting.CONVERSATION_PAGE_SIZE);
			var idx = null;
			for (var i = 0; i < a.length; i++) {
				if (a[i].id == item.id) {
					idx = i + 1;	// start with 1
					break;
				}
			}
			if (idx && (idx % limit == 0) && (idx < a.length || conv.msgs._hasMore)) {
				this._msgOffset[item.id] = idx;
				expandable = true;
			}
		}
	}

	return expandable;
};

ZmConvListView.prototype._resetExpansion =
function() {

	// remove change listeners on conv msg lists
	for (var id in this._expandedItems) {
		var item = this._expandedItems[id];
		if (item && item.msgs) {
			item.msgs.removeChangeListener(this._listChangeListener);
		}
	}

	this._expanded		= {};	// current expansion state, by ID
	this._msgRowIdList	= {};	// list of row IDs for a conv ID
	this._msgOffset		= {};	// the offset for a msg ID
	this._expandedItems	= {};	// list of expanded items for a conv ID (inc conv)
};

ZmConvListView.prototype.isExpanded =
function(item) {
	return Boolean(item && this._expanded[item.id]);
};

ZmConvListView.prototype._expandItem =
function(item) {
	if (item && this._isExpandable(item)) {
		this._controller._toggle(item);
	} else if (item.type == ZmItem.MSG && this._expanded[item.cid]) {
		var conv = appCtxt.getById(item.cid);
		this._controller._toggle(conv);
		this.setSelection(conv, true);
	}
};

ZmConvListView.prototype._expandAll = function(expand) {

    if (!this._list) {
        return;
    }

	var a = this._list.getArray();
	for (var i = 0, count = a.length; i < count; i++) {
		var conv = a[i];
		if (!this._isExpandable(conv) || expand === this.isExpanded(conv)) {
            continue;
        }
		if (expand)	{
            if (conv._loaded) {
			    this._expandItem(conv);
            }
		}
        else if (!expand) {
			this._collapse(conv);
		}
	}
};

ZmConvListView.prototype._sortColumn =
function(columnItem, bSortAsc, callback) {

	// call base class to save the new sorting pref
	ZmMailListView.prototype._sortColumn.apply(this, arguments);

	var query;
	var list = this.getList();
	if (this._columnHasCustomQuery(columnItem)) {
		query = this._getSearchForSort(columnItem._sortable);
	}
	else if (list && list.size() > 1 && this._sortByString) {
		query = this._controller.getSearchString();
	}

	var queryHint = this._controller.getSearchStringHint();

	if (query || queryHint) {
		var params = {
			query:			query,
			queryHint:		queryHint,
			types:			[ZmItem.CONV],
			sortBy:			this._sortByString,
			limit:			this.getLimit(),
			callback:		callback,
			userInitiated:	this._controller._currentSearch.userInitiated,
			sessionId:		this._controller._currentSearch.sessionId,
			isViewSwitch:	true
		};
		appCtxt.getSearchController().search(params);
	}
};

ZmConvListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) {
		if (ev && ev.event == ZmEvent.E_CREATE) {
			AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: initial check failed");
		}
		return;
	}

	var fields = ev.getDetail("fields");
	var isConv = (item.type == ZmItem.CONV);
    var isMute = item.isMute ? item.isMute : false;
	var sortBy = this._sortByString || ZmSearch.DATE_DESC;
	var handled = false;
	var forceUpdateConvSize = false; //in case of soft delete we don't get notification of size change from server so take care of this case outselves.
	var convToUpdate = null; //in case this is a msg but we want to update the size field for a conv - this is the conv to use.
	
	// msg moved or deleted
	if (!isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			var conv = appCtxt.getById(item.cid);
			handled = true;
			if (conv) {
				if (item.folderId == ZmFolder.ID_SPAM || item.folderId == ZmFolder.ID_TRASH || ev.event == ZmEvent.E_DELETE) {
					if (item.folderId == ZmFolder.ID_TRASH) {
						//only in this case we don't get size notification from server.
						forceUpdateConvSize = true;
						convToUpdate = conv;
					}
					// msg marked as Junk, or hard-deleted
					conv.removeMsg(item);
					this.removeItem(item, true, ev.batchMode);	// remove msg row
					this._controller._app._checkReplenishListView = this;
					this._setNextSelection();
				} else {
					if (!conv.containsMsg(item)) {
						//the message was moved to this conv, most likely by "undo". (not sure if any other ways, probably not).
						sortIndex = conv.msgs && conv.msgs._getSortIndex(item, ZmSearch.DATE_DESC);
						conv.addMsg(item, sortIndex);
						forceUpdateConvSize = true;
						convToUpdate = conv;
						var expanded = this._expanded[conv.id];
						//remove rows so will have to redraw them, reflecting the new item.
						this._removeMsgRows(conv.id);
						if (expanded) {
							//expand if it was expanded before this undo.
							this._expand(conv, null, true);
						}
					}
					else if (!conv.hasMatchingMsg(this._controller._currentSearch, true)) {
						this._list.remove(conv);				// view has sublist of controller list
						this._controller._list.remove(conv);	// complete list
						ev.item = item = conv;
						isConv = true;
						handled = false;
					} else {
						// normal case: just change folder name for msg
						this._changeFolderName(item, ev.getDetail("oldFolderId"));
					}
				}
			}
		}
	}

	// conv moved or deleted	
	if (isConv && (ev.event == ZmEvent.E_MOVE || ev.event == ZmEvent.E_DELETE)) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		for (var i = 0, len = items.length; i < len; i++) {
			var conv = items[i];
			if (this._itemToSelect && (this._itemToSelect.cid == conv.id  //the item to select is in this conv.
										|| this._itemToSelect.id == conv.id)) { //the item to select IS this conv
				var omit = {};
				if (conv.msgs) { //for some reason, msgs might not be set for the conv.
					var a = conv.msgs.getArray();
					for (var j = 0, len1 = a.length; j < len1; j++) {
						omit[a[j].id] = true;
					}
				}
				//omit the conv too, since if we have ZmSetting.DELETE_SELECT_PREV, going up will get back to this conv, but the conv is gone
				omit[conv.id] = true;
				this._itemToSelect = this._controller._getNextItemToSelect(omit);
			}
			this._removeMsgRows(conv.id);	// conv move: remove msg rows
			this._expanded[conv.id] = false;
			this._expandedItems[conv.id] = [];
			delete this._msgRowIdList[conv.id];
		}
	}

	// if we get a new msg that's part of an expanded conv, insert it into the
	// expanded conv, and don't move that conv
	if (!isConv && (ev.event == ZmEvent.E_CREATE)) {
		AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: handle msg create " + item.id);
		var rowIds = this._msgRowIdList[item.cid];
		var conv = appCtxt.getById(item.cid);
		if (rowIds && rowIds.length && this._rowsArePresent(conv)) {
			var div = this._createItemHtml(item);
			if (!this._expanded[item.cid]) {
				Dwt.setVisible(div, false);
			}
			var convIndex = this._getRowIndex(conv);
			var sortIndex = ev.getDetail("sortIndex");
			var msgIndex = sortIndex || 0;
			AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: add msg row to conv " + item.id + " within " + conv.id);
			this._addRow(div, convIndex + msgIndex + 1);
			rowIds.push(div.id);
		}
		if (conv) { //see bug 91083 for change prior to this "if" wrapper I add here just in case.
			forceUpdateConvSize = true;
			convToUpdate = conv;
			handled = ev.handled = true;
		}
	}

	// The sort index we're given is relative to a list of convs. We want one relative to a list view which may
	// have some msg rows from expanded convs in there.
	if (isConv && (ev.event == ZmEvent.E_CREATE)) {
		ev.setDetail("sortIndex", this._getSortIndex(item, sortBy));
	}
	
	// virtual conv promoted to real conv, got new ID
	if (isConv && (ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_ID])) {
		// a virtual conv has become real, and changed its ID
		var div = document.getElementById(this._getItemId({id:item._oldId}));
		if (div) {
			this._createItemHtml(item, {div:div});
			this.associateItemWithElement(item, div);
			DBG.println(AjxDebug.DBG1, "conv updated from ID " + item._oldId + " to ID " + item.id);
		}
		this._expanded[item.id] = this._expanded[item._oldId];
		this._expandedItems[item.id] = this._expandedItems[item._oldId];
		this._msgRowIdList[item.id] = this._msgRowIdList[item._oldId] || [];
	}

	// when adding a conv (or changing its position within the list), we need to look at its sort order
	// within the list of rows (which may include msg rows) rather than in the ZmList of convs, since
	// those two don't necessarily map to each other
	if (isConv && ((ev.event == ZmEvent.E_MODIFY) && (fields && fields[ZmItem.F_INDEX]))) {
		// INDEX change: a conv has gotten a new msg and may need to be moved within the list of convs
		// if an expanded conv gets a new msg, don't move it to top
		AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: handle conv create " + item.id);
		var sortIndex = this._getSortIndex(item, sortBy);
		var curIndex = this.getItemIndex(item, true);

		if ((sortIndex != null) && (curIndex != null) && (sortIndex != curIndex) &&	!this._expanded[item.id]) {
            AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: change position of conv " + item.id + " to " + sortIndex);
            this._removeMsgRows(item.id);
            this.removeItem(item);
            this.addItem(item, sortIndex);
            // TODO: mark create notif handled?
		}
	}

	// only a conv can change its fragment
	if ((ev.event == ZmEvent.E_MODIFY || ev.event == ZmEvent.E_MOVE) && (fields && fields[ZmItem.F_FRAGMENT])) {
		this._updateField(isConv ? item : appCtxt.getById(item.cid), ZmItem.F_SUBJECT);
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && (fields[ZmItem.F_PARTICIPANT] || fields[ZmItem.F_FROM] ||
													(fields[ZmItem.F_SIZE] && !this.isMultiColumn())))) {
		this._updateField(item, ZmItem.F_FROM);
	}

	// remember if a conv's unread state changed since it affects how the conv is loaded when displayed
	if (ev.event == ZmEvent.E_FLAGS) {
		var flags = ev.getDetail("flags");
		if (AjxUtil.isArray(flags) && AjxUtil.indexOf(flags, ZmItem.FLAG_UNREAD) != -1) {
			item = item || (items && items[i]);
			var conv = isConv ? item : item && appCtxt.getById(item.cid);
			if (conv) {
				conv.unreadHasChanged = true;
			}
		}
	}

	// msg count in a conv changed - see if we need to add or remove an expand icon
	if (forceUpdateConvSize || (isConv && (ev.event === ZmEvent.E_MODIFY && fields && fields[ZmItem.F_SIZE]))) {
		conv = convToUpdate || item;
		var numDispMsgs = this._getDisplayedMsgCount(conv);
		//redraw the item when redraw is requested or when the new msg count is set to 1(msg deleted) or 2(msg added)
		//redrawConvRow is from bug 75301 - not sure this case is still needed after my fix but keeping it to be safe for now.
		if (conv.redrawConvRow || numDispMsgs === 1 || numDispMsgs === 2) {
			if (numDispMsgs === 1) {
				this._collapse(conv); //collapse since it's only one message.
			}
			//must redraw the line since the ZmItem.F_EXPAND field might not be there when switching from 1 message conv, so updateField does not work. And also we
			//don't want it after deleting message(s) resulting in 1.
			this.redrawItem(conv);
		}
		this._updateField(conv, this.isMultiColumn() ? ZmItem.F_SIZE : ZmItem.F_FROM); //in reading pane on the right, the count appears in the "from".
	}

	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_DATE])) {
		this._updateField(item, ZmItem.F_DATE);
	}

	if (!handled) {
		if (isConv) {
			if (ev.event == ZmEvent.E_MODIFY && item.msgs) {
				//bug 79256 - in some cases the listeners gets removed when Conv is moved around.
				//so add the listeners again. If they are already present than this will be a no-op.
				var cv = this.getController()._convView;
				if (cv) {
					item.msgs.addChangeListener(cv._listChangeListener);
				}
				item.msgs.addChangeListener(this._listChangeListener);
			}
			ZmMailListView.prototype._changeListener.apply(this, arguments);
		} else {
			ZmMailMsgListView.prototype._changeListener.apply(this, arguments);
		}
	}
};

ZmConvListView.prototype.handleUnmuteConv =
function(items) {
    for(var i=0; i<items.length; i++) {
        var item = items[i];
        var isConv = (item.type == ZmItem.CONV);
        if (!isConv) { continue; }
        var sortBy = this._sortByString || ZmSearch.DATE_DESC;
        var sortIndex = this._getSortIndex(item, sortBy);
        var curIndex = this.getItemIndex(item, true);

        if ((sortIndex != null) && (curIndex != null) && (sortIndex != curIndex) &&	!this._expanded[item.id]) {
            AjxDebug.println(AjxDebug.NOTIFY, "ZmConvListView: change position of conv " + item.id + " to " + sortIndex);
            this._removeMsgRows(item.id);
            this.removeItem(item);
            this.addItem(item, sortIndex);
        }
    }
};

ZmConvListView.prototype._getSortIndex =
function(conv, sortBy) {

	var itemDate = parseInt(conv.date);
	var list = this.getList(true);
	var a = list && list.getArray();
	if (a && a.length) {
		for (var i = 0; i < a.length; i++) {
			var item = a[i];
			if (!item || (item && item.type == ZmItem.MSG)) { continue; }
			var date = parseInt(item.date);
			if ((sortBy && sortBy.toLowerCase() === ZmSearch.DATE_DESC.toLowerCase() && (itemDate >= date)) ||
				(sortBy && sortBy.toLowerCase() === ZmSearch.DATE_ASC.toLowerCase() && (itemDate <= date))) {
				return i;
			}
		}
		return i;
	}
	else {
		return null;
	}
};

ZmConvListView.prototype._removeMsgRows =
function(convId) {
	var msgRows = this._msgRowIdList[convId];
	if (msgRows && msgRows.length) {
		for (var i = 0; i < msgRows.length; i++) {
			var row = document.getElementById(msgRows[i]);
			if (row) {
				this._selectedItems.remove(row);
				this._parentEl.removeChild(row);
			}
		}
	}
};

/**
 * Override so we can clean up lists of cached rows.
 */
ZmConvListView.prototype.removeItem =
function(item, skipNotify) {
	if (item.type == ZmItem.MSG) {
		AjxUtil.arrayRemove(this._msgRowIdList[item.cid], this._getItemId(item));
	}
	DwtListView.prototype.removeItem.apply(this, arguments);
};

ZmConvListView.prototype._allowFieldSelection =
function(id, field) {
	// allow left selection if clicking on blank icon
	if (field == ZmItem.F_EXPAND) {
		var item = appCtxt.getById(id);
		return (item && !this._isExpandable(item));
	} else {
		return ZmListView.prototype._allowFieldSelection.apply(this, arguments);
	}
};

ZmConvListView.prototype.redoExpansion =
function() {
	var list = [];
	var offsets = {};
	for (var cid in this._expandedItems) {
		var items = this._expandedItems[cid];
		if (items && items.length) {
			for (var i = 0; i < items.length; i++) {
				var id = items[i];
				list.push(id);
				offsets[id] = this._msgOffset[id];
			}
		}
	}
	this._expandAll(false);
	this._resetExpansion();
	for (var i = 0; i < list.length; i++) {
		var id = list[i];
		this._expand(id, offsets[id]);
	}
};

ZmConvListView.prototype._getLastItem =
function() {
	var list = this.getList();
	var a = list && list.getArray();
	if (a && a.length > 1) {
		return a[a.length - 1];
	}
	return null;
};

ZmConvListView.prototype._getActionMenuForColHeader =
function(force) {

	var menu = ZmMailListView.prototype._getActionMenuForColHeader.apply(this, arguments);
	if (!this.isMultiColumn()) {
		var mi = this._colHeaderActionMenu.getMenuItem(ZmItem.F_FROM);
		if (mi) {
			mi.setVisible(false);
		}
		mi = this._colHeaderActionMenu.getMenuItem(ZmItem.F_TO);
		if (mi) {
			mi.setVisible(false);
		}
	}
	return menu;
};

/**
 * @private
 * @param {hash}		params			hash of parameters:
 * @param {boolean}		expansion		if true, preserve expansion
 */
ZmConvListView.prototype._saveState =
function(params) {
	ZmMailListView.prototype._saveState.apply(this, arguments);
	this._state.expanded = params && params.expansion && this._expanded;
};

ZmConvListView.prototype._restoreState =
function(state) {

	var s = state || this._state;
	if (s.expanded) {
		for (var id in s.expanded) {
			if (s.expanded[id]) {
				this._expandItem(s.expanded[id]);
			}
		}
	}
	ZmMailListView.prototype._restoreState.call(this);
};
