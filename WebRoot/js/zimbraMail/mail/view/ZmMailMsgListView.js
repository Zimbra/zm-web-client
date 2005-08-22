/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmMailMsgListView(parent, className, posStyle, mode, controller, dropTgt) {
	this._mode = mode;
	this._controller = controller;
	var headerList = this._getHeaderList(parent);
	ZmMailListView.call(this, parent, className, posStyle, mode, ZmItem.MSG, headerList, dropTgt);
}

ZmMailMsgListView.prototype = new ZmMailListView;
ZmMailMsgListView.prototype.constructor = ZmMailMsgListView;

ZmMailMsgListView.prototype.toString = 
function() {
	return "ZmMailMsgListView";
}

// Consts

ZmMailMsgListView.MSGLIST_REPLENISH_THRESHOLD 	= 0;
ZmMailMsgListView.MLV_COLWIDTH_ICON 			= 20;
ZmMailMsgListView.MLV_COLWIDTH_FROM 			= 105;
ZmMailMsgListView.MLV_COLWIDTH_FOLDER 			= 47;
ZmMailMsgListView.MLV_COLWIDTH_SIZE 			= 45;
ZmMailMsgListView.MLV_COLWIDTH_DATE 			= 75;

ZmMailMsgListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {

	ZmMailListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	
	// This is bug fix #298
	if (this._mode == ZmController.TRAD_VIEW) {
		var isSentFolder = this._folderId == ZmFolder.ID_SENT;
		var isDraftsFolder = this._folderId == ZmFolder.ID_DRAFTS;

		// if not in Sent/Drafts, deep dive into query to be certain		
		if (!isSentFolder && !isDraftsFolder) {
			// check for is:sent or is:draft w/in search query
			var query = this._appCtxt.getCurrentSearch().query;
			var idx = query.indexOf(":");
			if (idx) {
				var prefix = AjxStringUtil.trim(query.substring(0, idx));
				if (prefix == "is") {
					var folder = AjxStringUtil.trim(query.substring(idx+1));
					isSentFolder = folder == ZmFolder.QUERY_NAME[ZmFolder.ID_SENT];
					isDraftsFolder = folder == ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS];
				}
			}
		}

		// set the from column name based on query string
		var fromColIdx = this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_FROM]);
		var fromColSpan = Dwt.getDomObj(this.getDocument(), DwtListView.HEADERITEM_LABEL + this._headerList[fromColIdx]._id);
		if (fromColSpan)
			fromColSpan.innerHTML = "&nbsp;" + (isSentFolder || isDraftsFolder ? ZmMsg.to : ZmMsg.from);

		// set the received column name based on query string
		var recdColIdx = this.getColIndexForId(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]);
		var recdColSpan = Dwt.getDomObj(this.getDocument(), DwtListView.HEADERITEM_LABEL + this._headerList[recdColIdx]._id);
		if (recdColSpan) {
			var html = "&nbsp;";
			if (isSentFolder) {
				html += ZmMsg.sent;
			} else if (isDraftsFolder) {
				html += ZmMsg.lastSaved;
			} else {
				html += ZmMsg.received;
			}
			recdColSpan.innerHTML = html;
		}
	}
}

ZmMailMsgListView.prototype._createItemHtml =
function(msg, now, isDndIcon, isMixedView) {

	// bug fix #3595 - dont hilite if search was in:<folder name>
	var isMatched = msg.isInHitList() && this._mode == ZmController.CONV_VIEW && this._appCtxt.getCurrentSearch().folderId == null;
	var	div = this._getDiv(msg, isDndIcon, isMatched);
	div.className = div._styleClass;

	var htmlArr = new Array();
	var idx = 0;
	
	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);

	// Row
	var className = null;
	if (this._mode == ZmController.CONV_VIEW) {
		var folder = this._appCtxt.getFolderTree().getById(msg.folderId);
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
		// IE does not obey box model properly so we over compensate :(
		var width = AjxEnv.isIE ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
		
		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			// Flags
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_FLAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS]) == 0) {
			// Status
			htmlArr[idx++] = "<td width=" + width + ">";
			var imageInfo;
			if (msg.isDraft)
				imageInfo = ZmImg.I_DRAFT_MSG;
			else if (msg.isReplied)
				imageInfo = ZmImg.I_REPLY;
			else if (msg.isForwarded)
				imageInfo = ZmImg.I_FORWARD;
			else if (msg.isSent)
				imageInfo = ZmImg.I_MAIL_SENT;
			else
				imageInfo = msg.isUnread ? ZmImg.I_MAIL_UNREAD : ZmImg.I_MAIL_READ;
			htmlArr[idx++] = AjxImg.getImageHtml(imageInfo, null, ["id='", this._getFieldId(msg, ZmItem.F_STATUS), "'"].join(""));	
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FROM]) == 0) {
			// Participants
			htmlArr[idx++] = "<td width=" + width + ">";
			if (this._mode == ZmController.TRAD_VIEW && 
				(msg.folderId == ZmFolder.ID_SENT || msg.folderId == ZmFolder.ID_DRAFTS)) 
			{
				var addrs = msg.getAddresses(ZmEmailAddress.TO).getArray();
		
				// default to FROM addresses if no TO: found
				if (addrs == null || addrs.length == 0)
					addrs = msg.getAddresses(ZmEmailAddress.FROM).getArray();
				
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
						var partId = fieldId + "_" + parts[j].index;
						htmlArr[idx++] = "<span style='white-space: nowrap' id='" + partId + "'>";
						htmlArr[idx++] = parts[j].name;
						htmlArr[idx++] = "</span>";
						if (parts.length == 1 && parts.length < origLen)
							htmlArr[idx++] = AjxStringUtil.ELLIPSIS;
					}
				}		
			} else {
				var fromAddr = msg.getAddress(ZmEmailAddress.FROM);
				if (fromAddr) {
			   		htmlArr[idx++] = "<span style='white-space: nowrap' id='" + this._getFieldId(msg, ZmItem.F_FROM) + "'>";
			   		var name = fromAddr.getName() || fromAddr.getDispName();
					htmlArr[idx++] = AjxStringUtil.htmlEncode(name);
					// XXX: IM HACK
					if (this._appCtxt.get(ZmSetting.IM_ENABLED)) {
				   		var contacts = ZmAppCtxt.getFromShell(this.shell).getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
						var contact = contacts.getContactByEmail(fromAddr.getAddress());
						if (contact && contact.hasIMProfile())
							htmlArr[idx++] = AjxImg.getImageHtml(contact.isIMAvailable() ? ZmImg.I_IM : ZmImg.ID_IM);
					}
			   		htmlArr[idx++] = "</span>";
					if (AjxEnv.isNav)
						htmlArr[idx++] = ZmListView._fillerString;
				}
			}
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachments
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			// Fragment
			if (this._mode == ZmController.CONV_VIEW) {
				htmlArr[idx++] = "<td id='" + this._getFieldId(msg, ZmItem.F_FRAGMENT) + "'";
				htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'>" : " width=100%>";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
			} else {
				htmlArr[idx++] = "<td id='" + this._getFieldId(msg, ZmItem.F_SUBJECT) + "'";
				htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'>" : " width=100%>";
				var subj = msg.getSubject() || ZmMsg.noSubject;
				htmlArr[idx++] = AjxStringUtil.htmlEncode(subj);
				if (this._appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && msg.fragment) {
					htmlArr[idx++] = "<span class='ZmConvListFragment'>";
					htmlArr[idx++] = " - ";
					htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
					htmlArr[idx++] = "</span>";
				}
			}
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER]) == 0) {
			// Folder
			htmlArr[idx++] = "<td width=" + width + ">";
			htmlArr[idx++] = "<nobr id='" + this._getFieldId(msg, ZmItem.F_FOLDER) + "'>"; // required for IE bug
			var folder = this._appCtxt.getFolderTree().getById(msg.folderId);
			htmlArr[idx++] = folder ? folder.getName() : "";
			htmlArr[idx++] = "</nobr>";
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE]) == 0) {
			// Size
			htmlArr[idx++] = "<td width=" + this._headerList[i]._width + ">";
			htmlArr[idx++] = AjxUtil.formatSize(msg.size);
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
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
}

ZmMailMsgListView.prototype.markUIAsRead = 
function(items, on) {
	var doc = this.getDocument();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var row = Dwt.getDomObj(doc, this._getFieldId(item, ZmItem.F_ITEM_ROW));
		if (row) {
			var className =  on ? "" : "Unread";
			// don't worry about unread/read trash if in trad. view
			if (this._mode != ZmController.TRAD_VIEW) {
				var folder = this._appCtxt.getFolderTree().getById(item.folderId);
				if (folder && folder.isInTrash())
					className = (className ? (className + " ") : "") + "Trash";
			}
			if (item.isSent)
				className = (className ? (className + " ") : "") + "Sent";

			row.className = className;
		}
		var img = Dwt.getDomObj(doc, this._getFieldId(item, ZmItem.F_STATUS));
		if (img && img.parentNode) {
			if (on) {
				var imageInfo;
				if (item.isDraft)
					imageInfo = ZmImg.I_DRAFT_MSG;
				else if (item.isReplied)
					imageInfo = ZmImg.I_REPLY;
				else if (item.isForwarded)
					imageInfo = ZmImg.I_FORWARD;
				else if (item.isSent)
					imageInfo = ZmImg.I_MAIL_SENT;
				else
					imageInfo = ZmImg.I_MAIL_READ;
			} else {
				imageInfo = ZmImg.I_MAIL_UNREAD;
			}
			AjxImg.setImage(img.parentNode, imageInfo);
		}
	}
}

ZmMailMsgListView.prototype._changeListener =
function(ev) {
	var items = ev.getDetail("items");
	if ((ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) && this._mode == ZmController.CONV_VIEW) {
		if (!this._controller.handleDelete()) {
			this._changeTrashStatus(items);
			this._changeFolderName(items);
		}
	} else if (this._mode == ZmController.CONV_VIEW && ev.event == ZmEvent.E_CREATE) {
		var conv = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvController().getConv();
		var msg = items[0].type == ZmItem.MSG ? items[0] : null;
		if (conv && msg && (msg.cid == conv.id)) {
			ZmMailListView.prototype._changeListener.call(this, ev);
		}
	} else if (ev.event == ZmEvent.E_FLAGS) { // handle "replied" and "forwarded" flags
		var flags = ev.getDetail("flags");
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var img = Dwt.getDomObj(this.getDocument(), this._getFieldId(item, ZmItem.F_STATUS));
			if (img && img.parentNode) {
				for (var j = 0; j < flags.length; j++) {
					var flag = flags[j];
					var on = item[ZmItem.FLAG_PROP[flag]];
					if (flag == ZmItem.FLAG_REPLIED && on)
						AjxImg.setImage(img.parentNode, ZmImg.I_REPLY);
					else if (flag == ZmItem.FLAG_FORWARDED && on)
						AjxImg.setImage(img.parentNode, ZmImg.I_FORWARD);
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
}

ZmMailMsgListView.prototype.resetHeight = 
function(newHeight) {
	this.setSize(Dwt.DEFAULT, newHeight);
	Dwt.setSize(this._parentEl, Dwt.DEFAULT, newHeight-DwtListView.HEADERITEM_HEIGHT);
}

ZmMailMsgListView.prototype._changeFolderName = 
function(items) {

	for (var i = 0; i < items.length; i++) {
		var folderCell = Dwt.getDomObj(this.getDocument(), this._getFieldId(items[i], ZmItem.F_FOLDER));
		if (folderCell) {
			var folder = this._appCtxt.getFolderTree().getById(items[i].folderId);
			if (folder)
				folderCell.innerHTML = folder.getName();
			if (items[i].folderId == ZmFolder.ID_TRASH)
				this._changeTrashStatus([items[i]]);
		}
	}
}

ZmMailMsgListView.prototype._changeTrashStatus = 
function(items) {
	for (var i = 0; i < items.length; i++) {
		var row = Dwt.getDomObj(this.getDocument(), this._getFieldId(items[i], ZmItem.F_ITEM_ROW));
		if (row) {
			var folder = this._appCtxt.getFolderTree().getById(items[i].folderId);
			var className = null;
			if (items[i].isUnread)
				className = "Unread";
			if ((folder != null) && folder.isInTrash())
				className = (className ? (className + " ") : "") + "Trash";
			if (items[i].isSent)
				className = (className ? (className + " ") : "") + "Sent";
			row.className = className;
		}
	}
}

ZmMailMsgListView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();

	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, ZmImg.I_FLAG_ON, ZmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, ZmMsg.flag));

	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, ZmImg.I_MINI_TAG, ZmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, ZmMsg.tag));
	}

	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS], null, ZmImg.I_MAIL_STATUS, ZmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, ZmMsg.status));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FROM], ZmMsg.from, null, ZmMailMsgListView.MLV_COLWIDTH_FROM, ZmItem.F_FROM, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, ZmImg.I_ATTACHMENT, ZmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, ZmMsg.attachment));

	var sortBy = this._mode == ZmController.CONV_VIEW ? null : ZmItem.F_SUBJECT;
	var colName = this._mode == ZmController.CONV_VIEW ? ZmMsg.fragment : ZmMsg.subject;
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], colName, null, null, sortBy));

	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER], ZmMsg.folder, null, ZmMailMsgListView.MLV_COLWIDTH_FOLDER, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmMailMsgListView.MLV_COLWIDTH_SIZE, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.received, null, ZmMailMsgListView.MLV_COLWIDTH_DATE, ZmItem.F_DATE, true));

	return headerList;
}

ZmMailMsgListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {

	// call base class to save new sorting pref
	ZmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	if (this.getList().size() > 1 && this._sortByString) {
		var controller = this._mode == ZmController.CONV_VIEW
			? this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvController()
			: this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getTradController();
		
		var searchString = controller.getSearchString();

		if (this._mode == ZmController.CONV_VIEW) {
			var conv = controller.getConv();
			if (conv) {
				var list = conv.load(searchString, this._sortByString);
				controller.setList(list); // set the new list returned
				this.setOffset(0);
				this.set(conv.msgs, columnItem);
				this.setSelection(conv.getHotMsg(this.getOffset(), this.getLimit()));
			}
		} else {
			this._appCtxt.getSearchController().search(searchString, [ZmItem.MSG], this._sortByString, 0, this.getLimit());
		}
	}
}

ZmMailMsgListView.prototype._getDefaultSortbyForCol = 
function(colHeader) {
	// if not date field, sort asc by default
	return colHeader._sortable != ZmItem.F_DATE;
}

ZmMailMsgListView.prototype._getParentForColResize = 
function() {
	return this.parent;
}

ZmMailMsgListView.prototype.getReplenishThreshold = 
function() {
	return ZmMailMsgListView.MSGLIST_REPLENISH_THRESHOLD;
}
