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

function ZmMailMsgListView(parent, className, posStyle, mode, controller, dropTgt) {
	this._mode = mode;
	var headerList = this._getHeaderList(parent);
	ZmMailListView.call(this, parent, className, posStyle, mode, ZmItem.MSG, controller, headerList, dropTgt);
};

ZmMailMsgListView.prototype = new ZmMailListView;
ZmMailMsgListView.prototype.constructor = ZmMailMsgListView;


// Consts

ZmMailMsgListView.MSGLIST_REPLENISH_THRESHOLD 	= 0;
ZmMailMsgListView.COL_WIDTH_FROM 				= 105;
ZmMailMsgListView.COL_WIDTH_FOLDER 				= 47;
ZmMailMsgListView.COL_WIDTH_SIZE 				= 45;


// Public methods

ZmMailMsgListView.prototype.toString = 
function() {
	return "ZmMailMsgListView";
};

ZmMailMsgListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {

	ZmMailListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	
	// Show "From" or "To" depending on which folder we're looking at
	if (this._mode == ZmController.TRAD_VIEW) {
		var isFolder = this._isSentOrDraftsFolder();

		// set the from column name based on query string
		var colLabel = (isFolder.sent || isFolder.drafts) ? ZmMsg.to : ZmMsg.from;
		var fromColIdx = this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_FROM]);
		var fromColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[fromColIdx]._id);
		if (fromColSpan) fromColSpan.innerHTML = "&nbsp;" + colLabel;
		if (this._colHeaderActionMenu) this._colHeaderActionMenu.getItem(fromColIdx).setText(colLabel);

		// set the received column name based on query string
		colLabel = isFolder.sent
			? ZmMsg.sentAt : (isFolder.drafts ? ZmMsg.lastSaved : ZmMsg.received);
		var recdColIdx = this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]);
		var recdColSpan = document.getElementById(DwtListView.HEADERITEM_LABEL + this._headerList[recdColIdx]._id);
		if (recdColSpan) recdColSpan.innerHTML = "&nbsp;" + colLabel;
		if (this._colHeaderActionMenu) this._colHeaderActionMenu.getItem(recdColIdx).setText(colLabel);
	}
};

ZmMailMsgListView.prototype.markUIAsRead = 
function(item, on) {
	var row = document.getElementById(this._getFieldId(item, ZmItem.F_ITEM_ROW));
	if (row) {
		var className =  on ? "" : "Unread";
		// don't worry about unread/read trash if in trad. view
		if (this._mode != ZmController.TRAD_VIEW) {
			var folder = this._appCtxt.getById(item.folderId);
			if (folder && folder.isInTrash()) {
				className = (className ? (className + " ") : "") + "Trash";
			}
		}
		if (item.isSent) {
			className = (className ? (className + " ") : "") + "Sent";
		}

		row.className = className;
	}
	var img = document.getElementById(this._getFieldId(item, ZmItem.F_STATUS));
	if (img && img.parentNode) {
		if (on) {
			var imageInfo;
			if (item.isInvite())		{ imageInfo = "Appointment"; }
			else if (item.isDraft)		{ imageInfo = "MsgStatusDraft"; }
			else if (item.isReplied)	{ imageInfo = "MsgStatusReply"; }
			else if (item.isForwarded)	{ imageInfo = "MsgStatusForward"; }
			else if (item.isSent)		{ imageInfo = "MsgStatusSent"; }
			else						{ imageInfo = "MsgStatusRead"; }
		} else {
			imageInfo = item.isInvite() ? "Appointment" : "MsgStatusUnread";
		}
		AjxImg.setImage(img.parentNode, imageInfo);
	}
};

ZmMailMsgListView.prototype.resetHeight = 
function(newHeight) {
	this.setSize(Dwt.DEFAULT, newHeight);
	Dwt.setSize(this._parentEl, Dwt.DEFAULT, newHeight-DwtListView.HEADERITEM_HEIGHT);
};


ZmMailMsgListView.prototype.getReplenishThreshold = 
function() {
	return ZmMailMsgListView.MSGLIST_REPLENISH_THRESHOLD;
};


// Private / protected methods

ZmMailMsgListView.prototype._createItemHtml =
function(msg, now, isDndIcon, isMixedView) {

	// bug fix #3595 - dont hilite if search was in:<folder name>
	var isMatched = msg.isInHitList() && this._mode == ZmController.CONV_VIEW && this._appCtxt.getCurrentSearch().folderId == null;
	var	div = this._getDiv(msg, isDndIcon, isMatched);

	var htmlArr = [];
	var idx = 0;
	
	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);

	// Row
	var className = null;
	if (this._mode == ZmController.CONV_VIEW) {
		var folder = this._appCtxt.getById(msg.folderId);
		if (folder != null && folder.isInTrash())
			className = "Trash";
	}
	if (msg.isUnread)
		className = (className ? (className + " ") : "") + "Unread";

	idx = this._getRow(htmlArr, idx, msg, className);

	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;

		var id = this._headerList[i]._id;
		var width = this._getFieldWidth(i);
		
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			// Flags
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_FLAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS]) == 0) {
			// Status
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = "><center>";
			var imageInfo;
			if (msg.isInvite())			imageInfo = "Appointment";
			else if (msg.isDraft)		imageInfo = "MsgStatusDraft";
			else if (msg.isReplied)		imageInfo = "MsgStatusReply";
			else if (msg.isForwarded)	imageInfo = "MsgStatusForward";
			else if (msg.isSent)		imageInfo = "MsgStatusSent";
			else						imageInfo = msg.isUnread ? "MsgStatusUnread" : "MsgStatusRead";
			htmlArr[idx++] = AjxImg.getImageHtml(imageInfo, null, ["id='", this._getFieldId(msg, ZmItem.F_STATUS), "'"].join(""));	
			htmlArr[idx++] = "</center></td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FROM]) == 0 ||
				   id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT]) == 0)
		{
			// Participants
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			if (this._mode == ZmController.TRAD_VIEW && 
				(msg.folderId == ZmFolder.ID_SENT || msg.folderId == ZmFolder.ID_DRAFTS || msg.folderId == ZmFolder.ID_OUTBOX)) 
			{
				var addrs = msg.getAddresses(AjxEmailAddress.TO).getArray();
		
				// default to FROM addresses if no TO: found
				if (addrs == null || addrs.length == 0)
					addrs = msg.getAddresses(AjxEmailAddress.FROM).getArray();
				
				if (addrs && addrs.length) {
					var fieldId = this._getFieldId(msg, ZmItem.F_PARTICIPANT);
					var origLen = addrs.length;
					var partsElided = false; // may need to get this from server...
					var parts = this._fitParticipants(addrs, partsElided, 145);
					for (var j = 0; j < parts.length; j++) {
						if (j == 1 && (partsElided || parts.length < origLen)) {
							htmlArr[idx++] = AjxStringUtil.ELLIPSIS;
						} else if (parts.length > 1 && j > 0) {
							htmlArr[idx++] = ", ";
						}
						htmlArr[idx++] = "<span style='white-space: nowrap' id='";
						htmlArr[idx++] = fieldId;
						htmlArr[idx++] = "_";
						// bug fix #3001 - always add one to index value (to take FROM: address into account)
						htmlArr[idx++] = parts[j].index+1;
						htmlArr[idx++] = "'>";
						htmlArr[idx++] = parts[j].name;
						htmlArr[idx++] = "</span>";
						if (parts.length == 1 && parts.length < origLen)
							htmlArr[idx++] = AjxStringUtil.ELLIPSIS;
					}
				}		
			} else {
				var fromAddr = msg.getAddress(AjxEmailAddress.FROM);
				if (fromAddr) {
					htmlArr[idx++] = "<span style='white-space:nowrap' id='";
					htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_FROM);
					htmlArr[idx++] = "'>";
					var name = fromAddr.getName() || fromAddr.getDispName();
					htmlArr[idx++] = AjxStringUtil.htmlEncode(name);
					htmlArr[idx++] = "</span>";
				}
			}
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachments
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			// Fragment
			if (this._mode == ZmController.CONV_VIEW) {
				htmlArr[idx++] = "<td id='";
				htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_FRAGMENT);
				htmlArr[idx++] = "'";
				htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'><div style='overflow:hidden'>" : " width=100%>";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
			} else {
				htmlArr[idx++] = "<td id='";
				htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_SUBJECT);
				htmlArr[idx++] = "'";
				htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'><div style='overflow:hidden'>" : " width=100%>";
				var subj = msg.getSubject() || ZmMsg.noSubject;
				htmlArr[idx++] = AjxStringUtil.htmlEncode(subj);
				if (this._appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && msg.fragment) {
					htmlArr[idx++] = "<span class='ZmConvListFragment'> - ";
					htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
					htmlArr[idx++] = "</span>";
				}
			}
			if (AjxEnv.isSafari)
				htmlArr[idx++] = "</div>";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER]) == 0) {
			// Folder
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "<nobr id='";
			htmlArr[idx++] = this._getFieldId(msg, ZmItem.F_FOLDER);
			htmlArr[idx++] = "'>"; // required for IE bug
			var folder = this._appCtxt.getById(msg.folderId);
			if (folder)
				htmlArr[idx++] = folder.getName();
			htmlArr[idx++] = "</nobr>";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE]) == 0) {
			// Size
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = "><nobr>";
			htmlArr[idx++] = AjxUtil.formatSize(msg.size);
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0) {
			// Date
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_DATE, i, now);
		} else if (isMixedView && id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ICON]) == 0) {
			// Type icon (mixed view only)
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_ITEM_TYPE, i);
		}
	}
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};


// Listeners

ZmMailMsgListView.prototype._changeListener =
function(ev) {

	var msg = ev.item;
	if (ev.handled || !this._handleEventType[msg.type]) { return; }

	// only update if we're currently visible or we're the view underneath
	if (this._mode &&
		(this._mode != this._appCtxt.getCurrentViewId()) &&
		(this._mode != this._appCtxt.getAppViewMgr().getLastViewId())) { return; }

	if ((ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) && this._mode == ZmController.CONV_VIEW) {
		if (!this._controller.handleDelete()) {
			if (ev.event == ZmEvent.E_DELETE) {
				ZmMailListView.prototype._changeListener.call(this, ev);
			} else {
				// if spam, remove it from listview
				if (msg.folderId == ZmFolder.ID_SPAM) {
					this._controller._list.remove(msg, true);
					ZmMailListView.prototype._changeListener.call(this, ev);
				} else {
					this._changeTrashStatus(msg);
					this._changeFolderName(msg);
				}
			}
		}
	} else if (this._mode == ZmController.CONV_VIEW && ev.event == ZmEvent.E_CREATE) {
		var conv = AjxDispatcher.run("GetConvController").getConv();
		if (conv && (msg.cid == conv.id)) {
			ZmMailListView.prototype._changeListener.call(this, ev);
		}
	} else if (ev.event == ZmEvent.E_FLAGS) { // handle "replied" and "forwarded" flags
		var flags = ev.getDetail("flags");
		var img = document.getElementById(this._getFieldId(msg, ZmItem.F_STATUS));
		if (img && img.parentNode) {
			for (var j = 0; j < flags.length; j++) {
				var flag = flags[j];
				var on = msg[ZmItem.FLAG_PROP[flag]];
				if (flag == ZmItem.FLAG_REPLIED && on) {
					AjxImg.setImage(img.parentNode, "MsgStatusReply");
				} else if (flag == ZmItem.FLAG_FORWARDED && on) {
					AjxImg.setImage(img.parentNode, "MsgStatusForward");
				}
			}
		}
		ZmMailListView.prototype._changeListener.call(this, ev); // handle other flags
	} else {
		ZmMailListView.prototype._changeListener.call(this, ev);
		if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE)	{
			this._resetColWidth();
		}
	}
};

ZmMailMsgListView.prototype._changeFolderName = 
function(msg) {
	var folderCell = document.getElementById(this._getFieldId(msg, ZmItem.F_FOLDER));
	if (folderCell) {
		var folder = this._appCtxt.getById(msg.folderId);
		if (folder) {
			folderCell.innerHTML = folder.getName();
		}
		if (msg.folderId == ZmFolder.ID_TRASH) {
			this._changeTrashStatus(msg);
		}
	}
};

ZmMailMsgListView.prototype._changeTrashStatus = 
function(msg) {
	var row = document.getElementById(this._getFieldId(msg, ZmItem.F_ITEM_ROW));
	if (row) {
		var folder = this._appCtxt.getById(msg.folderId);
		var className = null;
		if (msg.isUnread) {
			className = "Unread";
		}
		if ((folder != null) && folder.isInTrash()) {
			className = (className ? (className + " ") : "") + "Trash";
		}
		if (msg.isSent) {
			className = (className ? (className + " ") : "") + "Sent";
		}
		if (className) {
			row.className = className;
		}
	}
};

ZmMailMsgListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called

	var hList = [];

	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, "FlagRed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.flag));
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS], null, "MsgStatus", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.status));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FROM], ZmMsg.from, null, ZmMailMsgListView.COL_WIDTH_FROM, ZmItem.F_FROM, true));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));

	var sortBy = this._mode == ZmController.CONV_VIEW ? null : ZmItem.F_SUBJECT;
	var colName = this._mode == ZmController.CONV_VIEW ? ZmMsg.fragment : ZmMsg.subject;
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], colName, null, null, sortBy));

	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER], ZmMsg.folder, null, ZmMailMsgListView.COL_WIDTH_FOLDER, null, true));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmMailMsgListView.COL_WIDTH_SIZE, null, true));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.received, null, ZmListView.COL_WIDTH_DATE, ZmItem.F_DATE, true));

	return hList;
};

ZmMailMsgListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {

	// call base class to save new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	if (this.getList().size() > 1 && this._sortByString) {
		var controller = AjxDispatcher.run((this._mode == ZmController.CONV_VIEW) ? "GetConvController" :
																					"GetTradController");
		var searchString = controller.getSearchString();

		if (this._mode == ZmController.CONV_VIEW) {
			var conv = controller.getConv();
			if (conv) {
				var respCallback = new AjxCallback(this, this._handleResponseSortColumn, [conv, columnItem, controller]);
				conv.load({query:searchString, sortBy:this._sortByString, callback:respCallback});
			}
		} else {
			var params = {query: searchString, types: [ZmItem.MSG], sortBy: this._sortByString, limit: this.getLimit()};
			this._appCtxt.getSearchController().search(params);
		}
	}
};

ZmMailMsgListView.prototype._handleResponseSortColumn =
function(conv, columnItem, controller, result) {
	var list = result.getResponse();
	controller.setList(list); // set the new list returned
	this.setOffset(0);
	this.set(conv.msgs, columnItem);
	this.setSelection(conv.getHotMsg(this.getOffset(), this.getLimit()));
};

ZmMailMsgListView.prototype._getDefaultSortbyForCol = 
function(colHeader) {
	// if not date field, sort asc by default
	return colHeader._sortable != ZmItem.F_DATE;
};

ZmMailMsgListView.prototype._getParentForColResize = 
function() {
	return this.parent;
};
