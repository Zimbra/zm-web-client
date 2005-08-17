function LmMailMsgListView(parent, className, posStyle, mode, controller, dropTgt) {
	this._mode = mode;
	this._controller = controller;
	var headerList = this._getHeaderList(parent);
	LmMailListView.call(this, parent, className, posStyle, mode, LmItem.MSG, headerList, dropTgt);
}

LmMailMsgListView.prototype = new LmMailListView;
LmMailMsgListView.prototype.constructor = LmMailMsgListView;

LmMailMsgListView.prototype.toString = 
function() {
	return "LmMailMsgListView";
}

// Consts

LmMailMsgListView.MSGLIST_REPLENISH_THRESHOLD 	= 0;
LmMailMsgListView.MLV_COLWIDTH_ICON 			= 20;
LmMailMsgListView.MLV_COLWIDTH_FROM 			= 105;
LmMailMsgListView.MLV_COLWIDTH_FOLDER 			= 47;
LmMailMsgListView.MLV_COLWIDTH_SIZE 			= 45;
LmMailMsgListView.MLV_COLWIDTH_DATE 			= 75;

LmMailMsgListView.prototype.createHeaderHtml = 
function(defaultColumnSort) {

	LmMailListView.prototype.createHeaderHtml.call(this, defaultColumnSort);
	
	// This is bug fix #298
	if (this._mode == LmController.TRAD_VIEW) {
		var isSentFolder = this._folderId == LmFolder.ID_SENT;
		var isDraftsFolder = this._folderId == LmFolder.ID_DRAFTS;

		// if not in Sent/Drafts, deep dive into query to be certain		
		if (!isSentFolder && !isDraftsFolder) {
			// check for is:sent or is:draft w/in search query
			var query = this._appCtxt.getCurrentSearch().query;
			var idx = query.indexOf(":");
			if (idx) {
				var prefix = LsStringUtil.trim(query.substring(0, idx));
				if (prefix == "is") {
					var folder = LsStringUtil.trim(query.substring(idx+1));
					isSentFolder = folder == LmFolder.QUERY_NAME[LmFolder.ID_SENT];
					isDraftsFolder = folder == LmFolder.QUERY_NAME[LmFolder.ID_DRAFTS];
				}
			}
		}

		// set the from column name based on query string
		var fromColIdx = this.getColIndexForId(LmListView.FIELD_PREFIX[LmItem.F_FROM]);
		var fromColSpan = Dwt.getDomObj(this.getDocument(), DwtListView.HEADERITEM_LABEL + this._headerList[fromColIdx]._id);
		if (fromColSpan)
			fromColSpan.innerHTML = "&nbsp;" + (isSentFolder || isDraftsFolder ? LmMsg.to : LmMsg.from);

		// set the received column name based on query string
		var recdColIdx = this.getColIndexForId(LmListView.FIELD_PREFIX[LmItem.F_DATE]);
		var recdColSpan = Dwt.getDomObj(this.getDocument(), DwtListView.HEADERITEM_LABEL + this._headerList[recdColIdx]._id);
		if (recdColSpan) {
			var html = "&nbsp;";
			if (isSentFolder) {
				html += LmMsg.sent;
			} else if (isDraftsFolder) {
				html += LmMsg.lastSaved;
			} else {
				html += LmMsg.received;
			}
			recdColSpan.innerHTML = html;
		}
	}
}

LmMailMsgListView.prototype._createItemHtml =
function(msg, now, isDndIcon, isMixedView) {

	// Bug 2531 - Remove yellow hilighting that indicates hits from various lists :(
	var isMatched = false;/*(msg.isInHitList() && (this._mode == LmController.CONV_VIEW));*/
	var	div = this._getDiv(msg, isDndIcon, isMatched);
	div.className = div._styleClass;

	var htmlArr = new Array();
	var idx = 0;
	
	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);

	// Row
	var className = null;
	if (this._mode == LmController.CONV_VIEW) {
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
		var width = LsEnv.isIE ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
		
		if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FLAG]) == 0) {
			// Flags
			idx = this._getField(htmlArr, idx, msg, LmItem.F_FLAG, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, msg, LmItem.F_TAG, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_STATUS]) == 0) {
			// Status
			htmlArr[idx++] = "<td width=" + width + ">";
			var imageInfo;
			if (msg.isDraft)
				imageInfo = LmImg.I_DRAFT_MSG;
			else if (msg.isReplied)
				imageInfo = LmImg.I_REPLY;
			else if (msg.isForwarded)
				imageInfo = LmImg.I_FORWARD;
			else if (msg.isSent)
				imageInfo = LmImg.I_MAIL_SENT;
			else
				imageInfo = msg.isUnread ? LmImg.I_MAIL_UNREAD : LmImg.I_MAIL_READ;
			htmlArr[idx++] = LsImg.getImageHtml(imageInfo, null, ["id='", this._getFieldId(msg, LmItem.F_STATUS), "'"].join(""));	
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FROM]) == 0) {
			// Participants
			htmlArr[idx++] = "<td width=" + width + ">";
			if (this._mode == LmController.TRAD_VIEW && 
				(msg.folderId == LmFolder.ID_SENT || msg.folderId == LmFolder.ID_DRAFTS)) 
			{
				var addrs = msg.getAddresses(LmEmailAddress.TO).getArray();
		
				// default to FROM addresses if no TO: found
				if (addrs == null || addrs.length == 0)
					addrs = msg.getAddresses(LmEmailAddress.FROM).getArray();
				
				if (addrs && addrs.length) {
					var fieldId = this._getFieldId(msg, LmItem.F_PARTICIPANT);
					var origLen = addrs.length;
					var partsElided = false; // may need to get this from server...
					var parts = this._fitParticipants(addrs, partsElided, 145);
					for (var j = 0; j < parts.length; j++) {
						if (j == 1 && (partsElided || parts.length < origLen)) {
							htmlArr[idx++] = LsStringUtil.ELLIPSIS;
						} else if (parts.length > 1 && j > 0) {
							htmlArr[idx++] = ", ";
						}
						var partId = fieldId + "_" + parts[j].index;
						htmlArr[idx++] = "<span style='white-space: nowrap' id='" + partId + "'>";
						htmlArr[idx++] = parts[j].name;
						htmlArr[idx++] = "</span>";
						if (parts.length == 1 && parts.length < origLen)
							htmlArr[idx++] = LsStringUtil.ELLIPSIS;
					}
				}		
			} else {
				var fromAddr = msg.getAddress(LmEmailAddress.FROM);
				if (fromAddr) {
			   		htmlArr[idx++] = "<span style='white-space: nowrap' id='" + this._getFieldId(msg, LmItem.F_FROM) + "'>";
			   		var name = fromAddr.getName() || fromAddr.getDispName();
					htmlArr[idx++] = LsStringUtil.htmlEncode(name);
					// XXX: IM HACK
					if (this._appCtxt.get(LmSetting.IM_ENABLED)) {
				   		var contacts = LmAppCtxt.getFromShell(this.shell).getApp(LmLiquidMail.CONTACTS_APP).getContactList();
						var contact = contacts.getContactByEmail(fromAddr.getAddress());
						if (contact && contact.hasIMProfile())
							htmlArr[idx++] = LsImg.getImageHtml(contact.isIMAvailable() ? LmImg.I_IM : LmImg.ID_IM);
					}
			   		htmlArr[idx++] = "</span>";
					if (LsEnv.isNav)
						htmlArr[idx++] = LmListView._fillerString;
				}
			}
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT]) == 0) {
			// Attachments
			idx = this._getField(htmlArr, idx, msg, LmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) == 0) {
			// Fragment
			if (this._mode == LmController.CONV_VIEW) {
				htmlArr[idx++] = "<td id='" + this._getFieldId(msg, LmItem.F_FRAGMENT) + "'";
				htmlArr[idx++] = LsEnv.isSafari ? " style='width:auto;'>" : " width=100%>";
				htmlArr[idx++] = LsStringUtil.htmlEncode(msg.fragment, true);
			} else {
				htmlArr[idx++] = "<td id='" + this._getFieldId(msg, LmItem.F_SUBJECT) + "'";
				htmlArr[idx++] = LsEnv.isSafari ? " style='width:auto;'>" : " width=100%>";
				var subj = msg.getSubject() || LmMsg.noSubject;
				htmlArr[idx++] = LsStringUtil.htmlEncode(subj);
				if (this._appCtxt.get(LmSetting.SHOW_FRAGMENTS) && msg.fragment) {
					htmlArr[idx++] = "<span class='LmConvListFragment'>";
					htmlArr[idx++] = " - ";
					htmlArr[idx++] = LsStringUtil.htmlEncode(msg.fragment, true);
					htmlArr[idx++] = "</span>";
				}
			}
			if (LsEnv.isNav)
				htmlArr[idx++] = LmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FOLDER]) == 0) {
			// Folder
			htmlArr[idx++] = "<td width=" + width + ">";
			htmlArr[idx++] = "<nobr id='" + this._getFieldId(msg, LmItem.F_FOLDER) + "'>"; // required for IE bug
			var folder = this._appCtxt.getFolderTree().getById(msg.folderId);
			htmlArr[idx++] = folder ? folder.getName() : "";
			htmlArr[idx++] = "</nobr>";
			if (LsEnv.isNav)
				htmlArr[idx++] = LmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_SIZE]) == 0) {
			// Size
			htmlArr[idx++] = "<td width=" + this._headerList[i]._width + ">";
			htmlArr[idx++] = LsUtil.formatSize(msg.size);
			if (LsEnv.isNav)
				htmlArr[idx++] = LmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_DATE]) == 0) {
			// Date
			idx = this._getField(htmlArr, idx, msg, LmItem.F_DATE, i, now);
		} else if (isMixedView && id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ICON]) == 0) {
			// Type icon (mixed view only)
			idx = this._getField(htmlArr, idx, msg, LmItem.F_ITEM_TYPE, i);
		}
	}
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
}

LmMailMsgListView.prototype.markUIAsRead = 
function(items, on) {
	var doc = this.getDocument();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var row = Dwt.getDomObj(doc, this._getFieldId(item, LmItem.F_ITEM_ROW));
		if (row) {
			var className =  on ? "" : "Unread";
			// don't worry about unread/read trash if in trad. view
			if (this._mode != LmController.TRAD_VIEW) {
				var folder = this._appCtxt.getFolderTree().getById(item.folderId);
				if (folder && folder.isInTrash())
					className = (className ? (className + " ") : "") + "Trash";
			}
			if (item.isSent)
				className = (className ? (className + " ") : "") + "Sent";

			row.className = className;
		}
		var img = Dwt.getDomObj(doc, this._getFieldId(item, LmItem.F_STATUS));
		if (img && img.parentNode) {
			if (on) {
				var imageInfo;
				if (item.isDraft)
					imageInfo = LmImg.I_DRAFT_MSG;
				else if (item.isReplied)
					imageInfo = LmImg.I_REPLY;
				else if (item.isForwarded)
					imageInfo = LmImg.I_FORWARD;
				else if (item.isSent)
					imageInfo = LmImg.I_MAIL_SENT;
				else
					imageInfo = LmImg.I_MAIL_READ;
			} else {
				imageInfo = LmImg.I_MAIL_UNREAD;
			}
			LsImg.setImage(img.parentNode, imageInfo);
		}
	}
}

LmMailMsgListView.prototype._changeListener =
function(ev) {
	var items = ev.getDetail("items");
	if ((ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_MOVE) && this._mode == LmController.CONV_VIEW) {
		if (!this._controller.handleDelete()) {
			this._changeTrashStatus(items);
			this._changeFolderName(items);
		}
	} else if (this._mode == LmController.CONV_VIEW && ev.event == LmEvent.E_CREATE) {
		var conv = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvController().getConv();
		var msg = items[0].type == LmItem.MSG ? items[0] : null;
		if (conv && msg && (msg.cid == conv.id)) {
			LmMailListView.prototype._changeListener.call(this, ev);
		}
	} else if (ev.event == LmEvent.E_FLAGS) { // handle "replied" and "forwarded" flags
		var flags = ev.getDetail("flags");
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var img = Dwt.getDomObj(this.getDocument(), this._getFieldId(item, LmItem.F_STATUS));
			if (img && img.parentNode) {
				for (var j = 0; j < flags.length; j++) {
					var flag = flags[j];
					var on = item[LmItem.FLAG_PROP[flag]];
					if (flag == LmItem.FLAG_REPLIED && on)
						LsImg.setImage(img.parentNode, LmImg.I_REPLY);
					else if (flag == LmItem.FLAG_FORWARDED && on)
						LsImg.setImage(img.parentNode, LmImg.I_FORWARD);
				}
			}
		}
		LmMailListView.prototype._changeListener.call(this, ev); // handle other flags
	} else {
		LmMailListView.prototype._changeListener.call(this, ev);
		if (ev.event == LmEvent.E_CREATE || ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_MOVE)	{
			this._resetColWidth();
		}
	}
}

LmMailMsgListView.prototype.resetHeight = 
function(newHeight) {
	this.setSize(Dwt.DEFAULT, newHeight);
	Dwt.setSize(this._parentEl, Dwt.DEFAULT, newHeight-DwtListView.HEADERITEM_HEIGHT);
}

LmMailMsgListView.prototype._changeFolderName = 
function(items) {

	for (var i = 0; i < items.length; i++) {
		var folderCell = Dwt.getDomObj(this.getDocument(), this._getFieldId(items[i], LmItem.F_FOLDER));
		if (folderCell) {
			var folder = this._appCtxt.getFolderTree().getById(items[i].folderId);
			if (folder)
				folderCell.innerHTML = folder.getName();
			if (items[i].folderId == LmFolder.ID_TRASH)
				this._changeTrashStatus([items[i]]);
		}
	}
}

LmMailMsgListView.prototype._changeTrashStatus = 
function(items) {
	for (var i = 0; i < items.length; i++) {
		var row = Dwt.getDomObj(this.getDocument(), this._getFieldId(items[i], LmItem.F_ITEM_ROW));
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

LmMailMsgListView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();

	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_FLAG], null, LmImg.I_FLAG_ON, LmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, LmMsg.flag));

	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(LmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_TAG], null, LmImg.I_MINI_TAG, LmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, LmMsg.tag));
	}

	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_STATUS], null, LmImg.I_MAIL_STATUS, LmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, LmMsg.status));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_FROM], LmMsg.from, null, LmMailMsgListView.MLV_COLWIDTH_FROM, LmItem.F_FROM, true));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT], null, LmImg.I_ATTACHMENT, LmMailMsgListView.MLV_COLWIDTH_ICON, null, null, null, LmMsg.attachment));

	var sortBy = this._mode == LmController.CONV_VIEW ? null : LmItem.F_SUBJECT;
	var colName = this._mode == LmController.CONV_VIEW ? LmMsg.fragment : LmMsg.subject;
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT], colName, null, null, sortBy));

	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_FOLDER], LmMsg.folder, null, LmMailMsgListView.MLV_COLWIDTH_FOLDER, null, true));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_SIZE], LmMsg.size, null, LmMailMsgListView.MLV_COLWIDTH_SIZE, null, true));
	headerList.push(new DwtListHeaderItem(LmListView.FIELD_PREFIX[LmItem.F_DATE], LmMsg.received, null, LmMailMsgListView.MLV_COLWIDTH_DATE, LmItem.F_DATE, true));

	return headerList;
}

LmMailMsgListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {

	// call base class to save new sorting pref
	LmMailListView.prototype._sortColumn.call(this, columnItem, bSortAsc);

	if (this.getList().size() > 1 && this._sortByString) {
		var controller = this._mode == LmController.CONV_VIEW
			? this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvController()
			: this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getTradController();
		
		var searchString = controller.getSearchString();

		if (this._mode == LmController.CONV_VIEW) {
			var conv = controller.getConv();
			if (conv) {
				var list = conv.load(searchString, this._sortByString);
				controller.setList(list); // set the new list returned
				this.setOffset(0);
				this.set(conv.msgs, columnItem);
				this.setSelection(conv.getHotMsg(this.getOffset(), this.getLimit()));
			}
		} else {
			this._appCtxt.getSearchController().search(searchString, [LmItem.MSG], this._sortByString, 0, this.getLimit());
		}
	}
}

LmMailMsgListView.prototype._getDefaultSortbyForCol = 
function(colHeader) {
	// if not date field, sort asc by default
	return colHeader._sortable != LmItem.F_DATE;
}

LmMailMsgListView.prototype._getParentForColResize = 
function() {
	return this.parent;
}

LmMailMsgListView.prototype.getReplenishThreshold = 
function() {
	return LmMailMsgListView.MSGLIST_REPLENISH_THRESHOLD;
}
