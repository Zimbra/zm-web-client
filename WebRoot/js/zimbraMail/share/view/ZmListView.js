function LmListView(parent, className, posStyle, view, type, headerList, dropTgt) {

	if (arguments.length == 0) return;
	DwtListView.call(this, parent, className, posStyle, headerList);

	this.view = view;
	this.type = type;
	this.setDropTarget(dropTgt);

	// create listeners for changes to the list model, and to tags
	this._listChangeListener = new LsListener(this, this._changeListener);
	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	var tagList = this._appCtxt.getTagList();
	if (tagList)
		tagList.addChangeListener(new LsListener(this, this._tagChangeListener));

	this._csfeMsgFetchSvc = location.protocol + "//" + this.getDocument().domain + this._appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI);
}

LmListView.prototype = new DwtListView;
LmListView.prototype.constructor = LmListView;

LmListView.prototype.toString = 
function() {
	return "LmListView";
}

LmListView.FIELD_PREFIX = new Object();
LmListView.FIELD_PREFIX[LmItem.F_ITEM_ROW]		= "a";
LmListView.FIELD_PREFIX[LmItem.F_ICON]			= "b";
LmListView.FIELD_PREFIX[LmItem.F_FLAG]			= "c";
LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT]	= "d";
LmListView.FIELD_PREFIX[LmItem.F_TAG]			= "e";
LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT]	= "f";
LmListView.FIELD_PREFIX[LmItem.F_FROM]			= "g";
LmListView.FIELD_PREFIX[LmItem.F_FRAGMENT]		= "h";
LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]		= "i";
LmListView.FIELD_PREFIX[LmItem.F_COUNT]			= "j";
LmListView.FIELD_PREFIX[LmItem.F_DATE]			= "k";
LmListView.FIELD_PREFIX[LmItem.F_STATUS]		= "l";
LmListView.FIELD_PREFIX[LmItem.F_FOLDER]		= "m";
LmListView.FIELD_PREFIX[LmItem.F_COMPANY]		= "n";
LmListView.FIELD_PREFIX[LmItem.F_EMAIL]			= "o";
LmListView.FIELD_PREFIX[LmItem.F_PHONE_BUS]		= "p";
LmListView.FIELD_PREFIX[LmItem.F_PHONE_MOBILE]	= "q";
LmListView.FIELD_PREFIX[LmItem.F_FREE_BUSY]		= "r";
LmListView.FIELD_PREFIX[LmItem.F_ITEM_TYPE]		= "s";
LmListView.FIELD_PREFIX[LmItem.F_TAG_CELL]		= "t";
LmListView.FIELD_PREFIX[LmItem.F_SIZE]			= "u";

LmListView.ITEM_FLAG_CLICKED = DwtListView._LAST_REASON + 1;

// Filler to add into an empty area so that Firefox gets mouseMove events
LmListView._fillerString = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

LmListView.prototype.set =
function(list, sortField) {
	var subList;
	if (list instanceof LmList) {
		list.addChangeListener(this._listChangeListener);
		subList = list.getSubList(this.getOffset(), this.getLimit());
	} else {
		subList = list;
	}
	DwtListView.prototype.set.call(this, subList, sortField);
}

LmListView.prototype.setUI = 
function(defaultColumnSort) {
	DwtListView.prototype.setUI.call(this, defaultColumnSort);
	this._resetColWidth();	// reset column width in case scrollbar is set
}

LmListView.prototype._changeListener =
function(ev) {
	if (ev.type != this.type)
		return;
	var items = ev.getDetail("items");
	if (ev.event == LmEvent.E_TAGS || ev.event == LmEvent.E_REMOVE_ALL) {
		DBG.println(LsDebug.DBG2, "LmListView: TAG");
		for (var i = 0; i < items.length; i++)
			this._setTagImg(items[i]);
	} else if (ev.event == LmEvent.E_FLAGS) { // handle "flagged" and "has attachment" flags
		DBG.println(LsDebug.DBG2, "LmListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			for (var j = 0; j < flags.length; j++) {
				var flag = flags[j];
				var on = item[LmItem.FLAG_PROP[flag]];
				if (flag == LmItem.FLAG_FLAGGED) {
					var img = Dwt.getDomObj(this.getDocument(), this._getFieldId(item, LmItem.F_FLAG));
					if (img && img.parentNode)
						LsImg.setImage(img.parentNode, on ? LmImg.I_FLAG_ON : LmImg.I_FLAG_OFF);
				} else if (flag == LmItem.FLAG_ATTACH) {
					var img = Dwt.getDomObj(this.getDocument(), this._getFieldId(item, LmItem.F_ATTACHMENT));
					if (img && img.parentNode)
						LsImg.setImage(img.parentNode, on ? LmImg.I_ATTACHMENT : LmImg.I_BLANK);
				}
			}
		}
	} else if (ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_MOVE) {
		DBG.println(LsDebug.DBG2, "LmListView: DELETE or MOVE");
		for (var i = 0; i < items.length; i++) {
			var row = Dwt.getDomObj(this.getDocument(), this._getItemId(items[i]));
			if (row) {
				this._parentEl.removeChild(row);
				this._selectedItems.remove(row);
			}
			this._list.remove(items[i]);
		}
		
		this._setNextSelection();
		
	} else if (ev.event == LmEvent.E_MODIFY && (ev.getDetail("action") == "set")) {
		DBG.println(LsDebug.DBG2, "LmListView: SET");
	} else if (ev.event == LmEvent.E_MODIFY) {
		DBG.println(LsDebug.DBG2, "LmListView: MODIFY");
	} else if (ev.event == LmEvent.E_CREATE) {
		DBG.println(LsDebug.DBG2, "LmListView: CREATE");
	} else {
		DBG.println(LsDebug.DBG1, "LmListView: UNKNOWN event");
	}
}

LmListView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != LmEvent.S_TAG)
		return;
	var fields = ev.getDetail("fields");
	if (ev.event == LmEvent.E_MODIFY && (fields && fields[LmOrganizer.F_COLOR])) {
		var divs = this._parentEl.childNodes;
		var tag = ev.source;
		for (var i = 0; i < divs.length; i++) {
			var item = this.getItemFromElement(divs[i]);
			if (item && item.tags && (item.tags.length == 1) && (item.tags[0] == tag.id))
				this._setTagImg(item);
		}
	} else if (ev.event == LmEvent.E_DELETE) {
		var divs = this._parentEl.childNodes;
		var tag = ev.source;
		for (var d = 0; d < divs.length; d++) {
			var item = this.getItemFromElement(divs[d]);
			if (item && item.hasTag(tag.id)) {
				item.tagLocal(tag.id, false);
				this._setTagImg(item);
			}
		}	
	}
}

// Common routines for createItemHtml()

// The enclosing div and its styles
LmListView.prototype._getDiv =
function(item, isDndIcon, isMatched) {
	var	div = this.getDocument().createElement("div");

	var base = "Row";
	div._styleClass = base;
	div._selectedStyleClass = [base, DwtCssStyle.SELECTED].join("-");	// Row-selected
	if (isDndIcon && isMatched) {
		var one = [base, DwtCssStyle.MATCHED, DwtCssStyle.DND].join("-");
		var two = [base, DwtCssStyle.DND].join("-");
		div._styleClass = [one, two].join(" ");							// Row-matched-dnd Row-dnd
	} else if (isMatched) {
		div._styleClass = [base, DwtCssStyle.MATCHED].join("-");		// Row-matched
	} else if (isDndIcon) {
		div._styleClass = [base, DwtCssStyle.DND].join("-");			// Row-dnd
	}
	if (isDndIcon)
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);

	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);

	return div;
}

// The table that holds the items
LmListView.prototype._getTable =
function(htmlArr, idx, isDndIcon) {
	htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=";
	htmlArr[idx++] = !isDndIcon ? "100%>" : (this.getSize().x + ">");
	return idx;
}

// A table row for one item
LmListView.prototype._getRow =
function(htmlArr, idx, item, className) {
	htmlArr[idx++] = "<tr id='" + this._getFieldId(item, LmItem.F_ITEM_ROW) + "'";
	htmlArr[idx++] = className ? " class='" + className + "'>" : ">";
	return idx;
}

// A table cell for one field of the item
LmListView.prototype._getField =
function(htmlArr, idx, item, field, colIdx, now) {
	var fieldId = this._getFieldId(item, field);
	var width = LsEnv.isIE ? (this._headerList[colIdx]._width + 4): this._headerList[colIdx]._width;
	if (field == LmItem.F_ITEM_TYPE) {
		htmlArr[idx++] = "<td width=" + width + " class='Icon'>";
		htmlArr[idx++] = LsImg.getImageHtml(LmItem.ICON[item.type], null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";					
	} else if (field == LmItem.F_FLAG) {
		var flagImageInfo = item.isFlagged ? LmImg.I_FLAG_ON : LmImg.I_FLAG_OFF;
		htmlArr[idx++] = "<td width=" + width + " class='Flag'>";
		htmlArr[idx++] = LsImg.getImageHtml(flagImageInfo, null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";
	} else if (field == LmItem.F_TAG) {
		if (!this._appCtxt.get(LmSetting.TAGGING_ENABLED))
			return idx;
		var cellId = this._getFieldId(item, LmItem.F_TAG_CELL);
		htmlArr[idx++] = ["<td width=", width, " class='Tag' id='", cellId, "'>"].join("");
		htmlArr[idx++] = this._getTagImgHtml(item, fieldId);
		htmlArr[idx++] = "</td>";
	} else if (field == LmItem.F_ATTACHMENT) {
		var attImageInfo = item.hasAttach ? LmImg.I_ATTACHMENT : LmImg.I_BLANK;
		htmlArr[idx++] = "<td width=" + width + " class='Attach'>";
		htmlArr[idx++] = LsImg.getImageHtml(attImageInfo, null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";					
	} else if (field == LmItem.F_DATE) {
		htmlArr[idx++] = "<td id='" + fieldId + "'";
		htmlArr[idx++] = " width=" + width + ">";
		htmlArr[idx++] = LsDateUtil.computeDateStr(now, item.date);
		if (LsEnv.isNav)
			htmlArr[idx++] = LmListView._fillerString;
		htmlArr[idx++] = "</td>";
	}
	
	return idx;
}

// We use HTML to set the tag image, so that we don't need the blank image if there are
// no tags. In that case, we need the filler if it's Firefox.
LmListView.prototype._getTagImgHtml =
function(item, id) {
	var tagImageInfo = item.getTagImageInfo();
	var idStr = id ? ["id='", id, "'"].join("") : null;
	return LsImg.getImageHtml(tagImageInfo, null, idStr);
}

// Find the tag cell and reset its HTML depending on the item's tags.
LmListView.prototype._setTagImg =
function(item) {
	var tagCell = Dwt.getDomObj(this.getDocument(), this._getFieldId(item, LmItem.F_TAG_CELL));
	if (!tagCell) return;
	tagCell.innerHTML = this._getTagImgHtml(item, this._getFieldId(item, LmItem.F_TAG));
}

// Parse the DOM ID to figure out what got clicked. Most IDs will look something like "V1_a551".
// Item IDs will look like "V1_551". Participant IDs will look like "V1_a551_0".
//
//     V1  - conv list view (number is from view constant in LmController)
//     _   - separator
//     a   - flag field (see constants above)
//     551 - item ID
//     _   - separator
//     0   - first participant
LmListView.prototype._parseId =
function(id) {
	var m = id.match(/^V(\d+)_([a-z]?)((DWT)?-?\d+)_?(\d*)$/);
	if (m)
		return {view: m[1], field: m[2], item: m[3], participant: m[5]};
	else
		return null;
}

LmListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;
	
	// check if we're hovering over a column header
	if (div._type && div._type == DwtListView.TYPE_HEADER_ITEM) {
		var id = this._headerList[div._itemIndex]._id;
		if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FLAG]) == 0) {
			this.setToolTipContent(LmMsg.flag);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_TAG]) == 0) {
			this.setToolTipContent(LmMsg.tag);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT]) == 0) {
			this.setToolTipContent(LmMsg.attachment);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) == 0) {
			if (this._headerList[div._itemIndex]._sortable)
				this.setToolTipContent(LmMsg.sortBySubject);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_COUNT]) == 0) {
			this.setToolTipContent(LmMsg.convCountTooltip);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_DATE]) == 0) {
			if (this._headerList[div._itemIndex]._sortable)
				this.setToolTipContent(LmMsg.sortByReceived);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_STATUS]) == 0) {
			this.setToolTipContent(LmMsg.messageStatus);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FROM]) == 0) {
			this.setToolTipContent(LmMsg.sortByFrom);
		} else {
			this.setToolTipContent(null);
		}
	} else {
		var m = this._parseId(id);
		if (m && m.field) {
			var item = this.getItemFromElement(div);
			if (m.field == LmListView.FIELD_PREFIX[LmItem.F_TAG]) {
				this._setTagToolTip(div);
			} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_STATUS]) {
				this._setStatusToolTip(item);
			} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT]) {
				if (item instanceof LmContact) {	
					var toolTip = item.getToolTip(item.getAttr(LmContact.F_email));
					this.setToolTipContent(toolTip);
				} else if (item.participants) {
				    this._setParticipantToolTip(item.participants.get(m.participant));
				}
			} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_FROM]) {
				this._setParticipantToolTip(item.getAddress(LmEmailAddress.FROM));
			} else if ((m.field == LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) && item.fragment) {
				this.setToolTipContent(LsStringUtil.htmlEncode(item.fragment));
			} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_DATE]) {
				this._setDateToolTip(item, div);
			} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_FOLDER]) {
				var folder = this._appCtxt.getFolderTree().getById(item.folderId);
				if (folder && folder.parent)
					this.setToolTipContent(folder.getPath(true));
			} else if (m.field == LmListView.FIELD_PREFIX[LmItem.F_ITEM_TYPE]) {
				this.setToolTipContent(LmMsg[LmItem.MSG_KEY[item.type]]);
			} else {
				this.setToolTipContent(null);
			}
		} else {
			this.setToolTipContent(null);
		}
	}
	return true;
}

LmListView.prototype._doubleClickAction =
function(ev, div) {
	var id = ev.target.id ? ev.target.id : div.id;
	if (!id) return true;

	var m = this._parseId(id);
	if (m && (m.field == LmListView.FIELD_PREFIX[LmItem.F_FLAG])) {
		return false;
	}
	return true;
}

LmListView.prototype._mouseUpAction =
function(ev, div) {
	var id = (ev.target.id && ev.target.id.indexOf("LsImg") == -1) ? ev.target.id : div.id;
	if (!id) return true;

	var m = this._parseId(id);
	if (ev.button == DwtMouseEvent.LEFT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			this._selEv.field = m ? m.field : null;
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
		}
	} else if (ev.button == DwtMouseEvent.RIGHT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.ACTION)) {
			this._actionEv.field = m ? m.field : null;
			if (m && (m.field == LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT])) {
				var item = this.getItemFromElement(div);
				this._actionEv.detail = item.participants.get(m.participant);
			}
			this._evtMgr.notifyListeners(DwtEvent.ACTION, this._actionEv);
		}
	}
	return true;
}

LmListView.prototype._setParticipantToolTip = 
function(address) {
	if (!address) return;
	
	try {
		var toolTip;
		var addr = address.getAddress();
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED) && addr) {
			var contactApp = LmAppCtxt.getFromShell(this.shell).getApp(LmLiquidMail.CONTACTS_APP);
			var contacts = contactApp.getContactList();
			var contact = contacts ? contacts.getContactByEmail(addr) : null;
			if (contact)
				toolTip = contact.getToolTip(addr);
		}
		
		if (!toolTip) {
			var addrstr = address.toString();
			if (addrstr)
			    toolTip = "<div style='white-space:nowrap'><b>E-mail: </b>" + LsStringUtil.htmlEncode(addrstr) + "</div>";
	    }
	    
	    if (toolTip) {
			this.setToolTipContent(toolTip);
		}
	} catch (ex) {
		this._appCtxt.getAppController()._handleException(ex, contactApp.getContactList, null, false, contactApp);
	}
}

LmListView.prototype._setTagToolTip = 
function(div) {
	var item = this.getItemFromElement(div);
	var numTags = item.tags.length;
	if (!numTags) return;
	var tagList = this.shell.getData(LmAppCtxt.LABEL).getTagList();
	var tags = item.tags;
	var html = new Array();
	var idx = 0;
	for (var i = 0; i < numTags; i++) {
		var tag = tagList.getById(tags[i]);
		html[idx++] = "<table><tr><td>";
		html[idx++] = LsImg.getImageHtml(LmTag.COLOR_MINI_ICON[tag.color]);
		html[idx++] = "</td><td valign='middle'>";
		html[idx++] = LsStringUtil.htmlEncode(tag.name);
		html[idx++] = "</td></tr></table>";
	}
	this.setToolTipContent(html.join(""));
}

LmListView.prototype._setStatusToolTip = 
function(item) {
	var tooltip = null;
	// check unread first since it has precedence
	if (item.isDraft)
		tooltip = LmMsg.draft;
	else if (item.isUnread)
		tooltip = LmMsg.unread;
	else if (item.isReplied)
		tooltip = LmMsg.replied;
	else if (item.isForwarded)
		tooltip = LmMsg.forwarded;
	else if (item.isSent)
		tooltip = LmMsg.sent;
	else
		tooltip = LmMsg.read;
	
	this.setToolTipContent(tooltip);
}

LmListView.prototype._setDateToolTip = 
function(item, div) {
	if (!div._dateStr) {
		var date;
		var prefix = "";
		if (item instanceof LmContact) {
			date = item.modified;
			prefix = "<b>" + LmMsg.lastModified + ":</b><br>";
		} else {
			date = item.date;
		}
		if (date) {
			div._dateStr = prefix + (new Date(date)).toLocaleString() + " <span style='white-space:nowrap'>(" + LsDateUtil.computeDateDelta(date) + ")</span>";
		} else {
			div._dateStr = "";
		}
	}

	if (div._dateStr && div._dateStr != "")
		this.setToolTipContent(div._dateStr);
}

LmListView.prototype._sortColumn = 
function(columnItem, bSortAsc) { 
	// change the sort preference for this view in the settings
	var sortBy = null;
	switch (columnItem._sortable) {
		case LmItem.F_PARTICIPANT: 
		case LmItem.F_FROM:
			sortBy = bSortAsc ? LmSearch.NAME_ASC : LmSearch.NAME_DESC; 
			break;
			
		case LmItem.F_SUBJECT:
		case LmItem.F_FRAGMENT:
			sortBy = bSortAsc ? LmSearch.SUBJ_ASC : LmSearch.SUBJ_DESC; 
			break;
			
		case LmItem.F_DATE:
			sortBy = bSortAsc ? LmSearch.DATE_ASC : LmSearch.DATE_DESC; 
			break;
	}

	if (sortBy) {
		this._sortByString = sortBy;
		this._appCtxt.set(LmSetting.SORTING_PREF, sortBy, this.view);
	}
}

LmListView.prototype._getViewPrefix = 
function() { 
	return "V" + this.view + "_";
}

LmListView.prototype._getFieldId =
function(item, field) {
	return this._getViewPrefix() + LmListView.FIELD_PREFIX[field] + item.id;
}

LmListView.prototype._getDnDIcon =
function(dragOp) {
	var dndSelection = this.getDnDSelection();
	if (dndSelection == null)
		return null;

	var icon;
	var div;
	this._dndImg = null;
	if (!(dndSelection instanceof Array) || dndSelection.length == 1) {
		var item = null;
		if (dndSelection instanceof Array) {
			item = dndSelection[0];
		} else {
			item = dndSelection;
		}
		//var idx = this._getItemIndex(item);
		icon = this._createItemHtml(item, new Date(), true);
		icon._origClassName = icon.className;
	} else {
		var doc = this.getDocument();
		// Create multi one
		icon = doc.createElement("div");
		icon.className = "DndIcon";
		Dwt.setPosition(icon, Dwt.ABSOLUTE_STYLE); 
		
		//Dwt.setPosition(this._dndImg, Dwt.ABSOLUTE_STYLE);
		LsImg.setImage(icon, LmImg.M_DND_MULTI_YES);
		this._dndImg = icon;
								
		div = doc.createElement("div");
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
		div.innerHTML = "<table><tr><td class='MailMultiSelectText'>" 
						+ dndSelection.length + "</td></tr></table>";
		icon.appendChild(div);

		// The size of the Icon is envelopeImg.width + sealImg.width - 20, ditto for height
		Dwt.setSize(icon, 43 + 32 - 20, 36 + 32 - 20);
	}
	
	this.shell.getHtmlElement().appendChild(icon);
	
	// If we have multiple items selected, then we have our cool little dnd icon, so
	// Position the text in the middle of the seal
	if (div) {
		var sz = Dwt.getSize(div);
		Dwt.setLocation(div, 20 + (32 - sz.x) / 2, 19 + (32 - sz.y) / 2);
	}
	
	Dwt.setZIndex(icon, Dwt.Z_DND);
	return icon;
}

LmListView.prototype._setDnDIconState =
function(dropAllowed) {
	// If we are moving multiple items then set borders & icons, else delegate up
	// to DwtControl.prototype._setDnDIconState()
	if (this._dndImg)
		LsImg.setImage(this._dndImg, dropAllowed ? LmImg.M_DND_MULTI_YES : LmImg.M_DND_MULTI_NO);
	else {
		this._dndIcon.className = (dropAllowed) ? this._dndIcon._origClassName + " DropAllowed" 
												: this._dndIcon._origClassName + " DropNotAllowed";
	}
}

LmListView.prototype._setNextSelection = 
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;
	var item = this._list.get(this._firstSelIndex);
	if (item == null) 
		item = this._list.getLast();
	if (item)
		this.setSelection(item, false);
}
