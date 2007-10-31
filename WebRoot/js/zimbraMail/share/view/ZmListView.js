/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmListView = function(parent, className, posStyle, view, type, controller, headerList, dropTgt) {

	if (arguments.length == 0) return;
	DwtListView.call(this, parent, className, posStyle, headerList);

	this.view = view;
	this.type = type;
	this._controller = controller;
	this.setDropTarget(dropTgt);
	this._viewPrefix = ["V_", this.view, "_"].join("");

	// create listeners for changes to the list model, folder tree, and tag list
	this._listChangeListener = new AjxListener(this, this._changeListener);
	var tagList = appCtxt.getTagTree();
	if (tagList) {
		tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
	}
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.addChangeListener(new AjxListener(this, this._folderChangeListener));
	}
	
	//Item IDs are integers, with the following exception:
	//		- a shared item:	f9d58245-fb61-4e9a-9202-6ebc7ad4b0c4:-368
	this._parseIdRegex = /^V_([A-Z]+)_([a-z]*)_([a-zA-Z0-9:\-]+)_?(\d*)$/;

	this._handleEventType = {};
	this._handleEventType[this.type] = true;
	this._disallowSelection = {};
	this._disallowSelection[ZmItem.F_FLAG] = true;
}

ZmListView.prototype = new DwtListView;
ZmListView.prototype.constructor = ZmListView;

ZmListView.prototype.toString =
function() {
	return "ZmListView";
}

// column widths
ZmListView.COL_WIDTH_ICON 					= 19;
ZmListView.COL_WIDTH_NARROW_ICON			= 11;
ZmListView.COL_WIDTH_DATE 					= 75;

// TD class for fields
ZmListView.FIELD_CLASS = {};
ZmListView.FIELD_CLASS[ZmItem.F_TYPE]		= "Icon";
ZmListView.FIELD_CLASS[ZmItem.F_FLAG]		= "Flag";
ZmListView.FIELD_CLASS[ZmItem.F_TAG]		= "Tag";
ZmListView.FIELD_CLASS[ZmItem.F_ATTACHMENT]	= "Attach";

ZmListView.ITEM_FLAG_CLICKED 				= DwtListView._LAST_REASON + 1;
ZmListView.DEFAULT_REPLENISH_THRESHOLD		= 0;

ZmListView.prototype._getHeaderList = function() {};

ZmListView.prototype.getController =
function() {
	return this._controller;
}

ZmListView.prototype.set =
function(list, sortField) {
	this.setSelectionHdrCbox(false);

	var subList;
	if (list instanceof ZmList) {
		list.addChangeListener(this._listChangeListener);
		subList = list.getSubList(this.getOffset(), this.getLimit());
	} else {
		subList = list;
	}
	DwtListView.prototype.set.call(this, subList, sortField);
};

ZmListView.prototype.setUI =
function(defaultColumnSort) {
	DwtListView.prototype.setUI.call(this, defaultColumnSort);
	this._resetColWidth();	// reset column width in case scrollbar is set
};

ZmListView.prototype.getLimit =
function() {
	return appCtxt.get(ZmSetting.PAGE_SIZE);
};

ZmListView.prototype.getReplenishThreshold =
function() {
	return ZmListView.DEFAULT_REPLENISH_THRESHOLD;
};

ZmListView.prototype._changeListener =
function(ev) {

	var item = ev.item || ev.getDetail("items")[0];
	if (ev.handled || !this._handleEventType[item.type] && (this.type != ZmItem.MIXED)) { return; }

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		DBG.println(AjxDebug.DBG2, "ZmListView: TAG");
		this._setImage(item, ZmItem.F_TAG, item.getTagImageInfo());
	}

	if (ev.event == ZmEvent.E_FLAGS) { // handle "flagged" and "has attachment" flags
		DBG.println(AjxDebug.DBG2, "ZmListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			var on = item[ZmItem.FLAG_PROP[flag]];
			if (flag == ZmItem.FLAG_FLAGGED) {
				this._setImage(item, ZmItem.F_FLAG, on ? "FlagRed" : null);
			} else if (flag == ZmItem.FLAG_ATTACH) {
				this._setImage(item, ZmItem.F_ATTACHMENT, on ? "Attachment" : null);
			}
		}
	}

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		DBG.println(AjxDebug.DBG2, "ZmListView: DELETE or MOVE");
        this.removeItem(item, true);
        this._controller._app._checkReplenishListView = this;
		this._controller._resetToolbarOperations();
	}
};

ZmListView.prototype._checkReplenish =
function() {
	var respCallback = new AjxCallback(this, this._handleResponseCheckReplenish);
	this._controller._checkReplenish(respCallback);
};

ZmListView.prototype._handleResponseCheckReplenish =
function() {
	if (this.size() == 0) {
		this._controller._handleEmptyList(this);
	} else {
		this._controller._resetNavToolBarButtons(this._controller._getViewType());
		this._setNextSelection();
	}
};

ZmListView.prototype._folderChangeListener =
function(ev) {
	// make sure this is current list view
	if (appCtxt.getCurrentController() != this._controller) { return; }
	// see if it will be handled by app's postNotify()
	if (this._controller._app._checkReplenishListView == this) { return; }

	var organizers = ev.getDetail("organizers");
	var organizer = (organizers && organizers.length) ? organizers[0] : ev.source;

	var id = organizer.id;
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY) {
		if (!fields) { return; }
		if (fields[ZmOrganizer.F_TOTAL]) {
			this._controller._resetNavToolBarButtons(this._controller._getViewType());
		}
	}
};

ZmListView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG) return;

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_COLOR])) {
		var divs = this._getChildren();
		var tag = ev.getDetail("organizers")[0];
		for (var i = 0; i < divs.length; i++) {
			var item = this.getItemFromElement(divs[i]);
			if (item && item.tags && (item.tags.length == 1) && (item.tags[0] == tag.id))
				this._setImage(item, ZmItem.F_TAG, item.getTagImageInfo());
		}
	}
}

// returns all child divs for this list view
ZmListView.prototype._getChildren =
function() {
	return this._parentEl.childNodes;
}

// Common routines for createItemHtml()

ZmListView.prototype._getRowId =
function(item) {
	return this._getFieldId(item, ZmItem.F_ITEM_ROW);
};

// Note that images typically get IDs in _getCellContents().
ZmListView.prototype._getCellId =
function(item, field) {
	return (field == ZmItem.F_DATE)
		? this._getFieldId(item, field)
		: DwtListView.prototype._getCellId.apply(this, arguments);
};

ZmListView.prototype._getCellClass =
function(item, field, params) {
	return ZmListView.FIELD_CLASS[field];
};

ZmListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_SELECTION) {
		idx = this._getImageHtml(htmlArr, idx, "TaskCheckbox", this._getFieldId(item, field));
	} else if (field == ZmItem.F_TYPE) {
		idx = this._getImageHtml(htmlArr, idx, ZmItem.ICON[item.type], this._getFieldId(item, field));
	} else if (field == ZmItem.F_FLAG) {
		idx = this._getImageHtml(htmlArr, idx, item.isFlagged ? "FlagRed" : null, this._getFieldId(item, field));
	} else if (field == ZmItem.F_TAG) {
		idx = this._getImageHtml(htmlArr, idx, item.getTagImageInfo(), this._getFieldId(item, field));
	} else if (field == ZmItem.F_ATTACHMENT) {
		idx = this._getImageHtml(htmlArr, idx, item.hasAttach ? "Attachment" : null, this._getFieldId(item, field));
	} else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = AjxDateUtil.computeDateStr(params.now || new Date(), item.date);
	} else if (field == ZmItem.F_PRIORITY) {
        var priorityImage = null;
        if (item.isHighPriority) {
            priorityImage = "PriorityHigh_list";
        } else if (item.isLowPriority) {
			priorityImage = "PriorityLow_list";
		} else {
			priorityImage = "PriorityNormal_list";
		}
        idx = this._getImageHtml(htmlArr, idx, priorityImage, this._getFieldId(item, field));
	} else {
		idx = DwtListView.prototype._getCellContents.apply(this, arguments);
	}

	return idx;
};

ZmListView.prototype._getImageHtml =
function(htmlArr, idx, imageInfo, id) {
	imageInfo = imageInfo || "Blank_16";
	var idText = id ? ["id='", id, "'"].join("") : null;
	htmlArr[idx++] = AjxImg.getImageHtml(imageInfo, null, idText);
	return idx;
};

ZmListView.prototype._setImage =
function(item, field, imageInfo) {
	var img = this._getElement(item, field);
	if (img && img.parentNode) {
		imageInfo = imageInfo || "Blank_16";
		AjxImg.setImage(img.parentNode, imageInfo);
	}
};

/**
 * Parse the DOM ID to figure out what got clicked. Most IDs will look something like
 * "V_CLV_fg551".
 * Item IDs will look like "V_CLV_551". Participant IDs will look like
 * "V_CLV_pa551_0".
 *
 *     V_CLV		- conv list view (string of caps is from view constant in ZmController)
 *     _   			- separator
 *     fg  			- flag field (two small letters - see constants ZmItem.F_*)
 *     551 			- item ID
 *     _   			- separator
 *     0   			- first participant
 *
 * TODO: see if it's faster to create a RegExp once and reuse it
 */
ZmListView.prototype._parseId =
function(id) {
	var m = id.match(this._parseIdRegex);
	if (m) {
		return {view:m[1], field:m[2], item:m[3], participant:m[4]};
	} else {
		return null;
	}
};

ZmListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;

	// check if we're hovering over a column header
	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var itemIdx = Dwt.getAttr(div, "_itemIndex");
		var field = DwtListHeaderItem.getHeaderField(this._headerList[itemIdx]._id);
		this.setToolTipContent(this._getHeaderToolTip(field, itemIdx));
	} else {
		var match = this._parseId(id);
		if (match && match.field) {
			var item = this.getItemFromElement(div);
			this.setToolTipContent(this._getToolTip(match.field, item, ev, div, match));
		}
	}
	return true;
};

ZmListView.prototype._mouseOutAction =
function(ev, div) {
	DwtListView.prototype._mouseOutAction.call(this, ev, div);

	var id = ev.target.id || div.id;
	if (!id) return true;

	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			if (m.field == ZmItem.F_SELECTION) {
				var origClassName = Dwt.getAttr(ev.target, "_origClassName");
				if (origClassName) {
					ev.target.className = origClassName;
				}
			} else if (m.field == ZmItem.F_FLAG) {
				var item = this.getItemFromElement(div);
				if (!item.isFlagged) {
					AjxImg.setImage(ev.target, "Blank_16", true);
				}
			}
		}
	}

	return true;
};

ZmListView.prototype._doubleClickAction =
function(ev, div) {
	var id = ev.target.id ? ev.target.id : div.id;
	if (!id) return true;

	var m = this._parseId(id);
	return (!(m && (m.field == ZmItem.F_FLAG)));
};

ZmListView.prototype._itemClicked =
function(clickedEl, ev) {
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX) &&
		ev.button == DwtMouseEvent.LEFT)
	{
		if (!ev.shiftKey && !ev.ctrlKey) {
			// get the field being clicked
			var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1)
				? ev.target.id : clickedEl.id;

			// TODO - optimize by not calling parseId so much
			var m = id ? this._parseId(id) : null;
			if (m && m.field == ZmItem.F_SELECTION) {
				if (this._selectedItems.size() == 1) {
					var sel = this._selectedItems.get(0);
					var item = AjxCore.objectWithId(Dwt.getAttr(sel, "_itemIndex"));
					var selFieldId = item ? this._getFieldId(item, ZmItem.F_SELECTION) : null;
					var selField = selFieldId ? document.getElementById(selFieldId) : null;
					if (selField && sel == clickedEl) {
						if (selField._origClassName == "ImgTaskCheckboxCompleted") {
							selField.className = selField._origClassName = "ImgTaskCheckbox";
						} else if (selField._origClassName == "ImgTaskCheckbox") {
							selField.className = selField._origClassName = "ImgTaskCheckboxCompleted";
							return;
						}
					} else {
						if (selField && selField.className == "ImgTaskCheckbox") {
							DwtListView.prototype.deselectAll.call(this);
						}
					}
				}
				var bContained = this._selectedItems.contains(clickedEl);
				this.setMultiSelection(clickedEl, bContained);
				return;	// do not call base class if "selection" field was clicked
			}
		} else if (ev.shiftKey) {
			// uncheck all selected items first
			this._checkSelectedItems(false);

			// run base class first so we get the finalized list of selected items
			DwtListView.prototype._itemClicked.call(this, clickedEl, ev);

			// recheck new list of selected items
			this._checkSelectedItems(true);

			return;
		}
	}

	DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
};

ZmListView.prototype._columnClicked =
function(clickedCol, ev) {
	DwtListView.prototype._columnClicked.call(this, clickedCol, ev);

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		var list = this.getList();
		var size = list ? list.size() : null;
		if (size > 0) {
			var item = this._headerList[Dwt.getAttr(clickedCol, "_itemIndex")];
			if (item && item._id.indexOf(ZmItem.F_SELECTION) != -1) {
				var hdrId = DwtListView.HEADERITEM_ICON + item._id;
				var hdrDiv = document.getElementById(hdrId);
				if (hdrDiv) {
					if (hdrDiv.className == "ImgTaskCheckboxCompleted") {
						this.deselectAll();
						hdrDiv.className = "ImgTaskCheckbox";
					} else {
						hdrDiv.className = "ImgTaskCheckboxCompleted";
						this.setSelectedItems(this._list.getArray());
					}
				}
			}
			this._controller._resetToolbarOperations();
		}
	}
};

ZmListView.prototype.handleKeyAction =
function(actionCode, ev) {
	var rv = DwtListView.prototype.handleKeyAction.call(this, actionCode, ev);

	if (actionCode == DwtKeyMap.SELECT_ALL) {
		this._controller._resetToolbarOperations();
	}

	return rv;
};

ZmListView.prototype.setMultiSelection =
function(clickedEl, bContained, ev) {
	if (ev && ev.ctrlKey && this._selectedItems.size() == 1) {
		this._checkSelectedItems(true);
	}

	// call base class
	DwtListView.prototype.setMultiSelection.call(this, clickedEl, bContained);

	this.setSelectionCbox(clickedEl, bContained);
	this.setSelectionHdrCbox(this.getSelection().length == this.getList().size());

	// reset toolbar operations LAST
	this._controller._resetToolbarOperations();
};

ZmListView.prototype.setSelectionCbox =
function(obj, bContained) {
	if (!obj) { return; }

	var item = obj.tagName
		? AjxCore.objectWithId(Dwt.getAttr(obj, "_itemIndex")) : obj;
	var selFieldId = item ? this._getFieldId(item, ZmItem.F_SELECTION) : null;
	var selField = selFieldId ? document.getElementById(selFieldId) : null;
	if (selField) {
		selField.className = selField._origClassName = bContained
			? "ImgTaskCheckbox"
			: "ImgTaskCheckboxCompleted";
	}
};

ZmListView.prototype.setSelectionHdrCbox =
function(check) {
	var idx = this.getColIndexForId(ZmItem.F_SELECTION);
	var col = this._headerList ? this._headerList[idx] : null;
	var hdrId = col ? (DwtListView.HEADERITEM_ICON + col._id) : null;
	var hdrDiv = hdrId ? document.getElementById(hdrId) : null;
	if (hdrDiv) {
		hdrDiv.className = check
			? "ImgTaskCheckboxCompleted"
			: "ImgTaskCheckbox";
	}
};

ZmListView.prototype.setSelectedItems =
function(selectedArray) {
	DwtListView.prototype.setSelectedItems.call(this, selectedArray);

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		this._checkSelectedItems(true);
	}
};

ZmListView.prototype.deselectAll =
function() {
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		this._checkSelectedItems(false);
	}

	DwtListView.prototype.deselectAll.call(this);
};

ZmListView.prototype._checkSelectedItems =
function(check) {
	var sel = this.getSelection();
	for (var i = 0; i < sel.length; i++) {
		this.setSelectionCbox(sel[i], !check);
	}

	this.setSelectionHdrCbox(sel.length == this.getList().size());
};

ZmListView.prototype._setNoResultsHtml =
function() {
	DwtListView.prototype._setNoResultsHtml.call(this);
	this.setSelectionHdrCbox(false);
};

ZmListView.prototype._getHeaderToolTip =
function(field, itemIdx) {
	var tooltip = null;
	if (field == ZmItem.F_FLAG) {
		tooltip = ZmMsg.flag;
	} else if (field == ZmItem.F_TAG) {
		tooltip = ZmMsg.tag;
	} else if (field == ZmItem.F_ATTACHMENT) {
		tooltip = ZmMsg.attachment;
	} else if (field == ZmItem.F_SUBJECT) {
		tooltip = (this._headerList[itemIdx]._sortable)
			? ZmMsg.sortBySubject : ZmMsg.subject;
	} else if (field == ZmItem.F_DATE) {
		tooltip = (this._headerList[itemIdx]._sortable)
			? ZmMsg.sortByReceived : ZmMsg.date;
	} else if (field == ZmItem.F_FROM) {
		tooltip = (this._headerList[itemIdx]._sortable)
			? ZmMsg.sortByFrom : ZmMsg.from;
	} else if ( field == ZmItem.F_SIZE){
		tooltip = (this._headerList[itemIdx]._sortable)
			? ZmMsg.sortBySize : ZmMsg.sizeToolTip;
	}
	return tooltip;
};

ZmListView.prototype._getToolTip =
function(field, item, ev, div, match) {
	var tooltip;
	if (field == ZmItem.F_SELECTION) {
		ev.target._origClassName = ev.target.className;
		if (ev.target.className != "ImgTaskCheckboxCompleted")
			ev.target.className = "ImgTaskCheckboxCompleted";
	} else if (field == ZmItem.F_FLAG) {
		if (!item.isFlagged) {
			AjxImg.setDisabledImage(ev.target, "FlagRed", true);
		}
	} else if (field == ZmItem.F_TAG) {
		tooltip = this._getTagToolTip(item);
	} else if (field == ZmItem.F_ATTACHMENT) {
		// disable att tooltip for now, we only get att info once msg is loaded
		// tooltip = this._getAttachmentToolTip(item);
	} else if (field == ZmItem.F_DATE) {
		tooltip = this._getDateToolTip(item, div);
	}
	return tooltip;
};

ZmListView.prototype._getTagToolTip =
function(item) {
	if (!item) { return };
	var numTags = item.tags.length;
	if (!numTags) { return };
	var tagList = appCtxt.getTagTree();
	var tags = item.tags;
	var html = [];
	var idx = 0;
	for (var i = 0; i < numTags; i++) {
		var tag = tagList.getById(tags[i]);
		html[idx++] = "<table><tr><td>";
		html[idx++] = AjxImg.getImageHtml(ZmTag.COLOR_ICON[tag.color]);
		html[idx++] = "</td><td valign='middle'>";
		html[idx++] = AjxStringUtil.htmlEncode(tag.name);
		html[idx++] = "</td></tr></table>";
	}
	return html.join("");
}

ZmListView.prototype._getAttachmentToolTip =
function(item) {
	var tooltip = null;
	var atts = item.getAttachments ? item.getAttachments() : [];
	if (atts.length == 1) {
		var info = ZmMimeTable.getInfo(atts[0].ct);
		tooltip = info ? info.desc : null;
	} else if (atts.length > 1) {
		tooltip = AjxMessageFormat.format(ZmMsg.multipleAttachmentsTooltip, [atts.length]);
	}
	return tooltip;
};

ZmListView.prototype._getDateToolTip =
function(item, div) {
	div._dateStr = div._dateStr || this._getDateToolTipText(item.date);
	return div._dateStr;
};

ZmListView.prototype._getDateToolTipText =
function(date, prefix) {
	if (!date) { return ""; }
	var dateStr = [];
	var i = 0;
	dateStr[i++] = prefix;
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
	dateStr[i++] = dateFormatter.format(new Date(date));
	var delta = AjxDateUtil.computeDateDelta(date);
	if (delta) {
		dateStr[i++] = "<br><center><span style='white-space:nowrap'>(";
		dateStr[i++] = delta;
		dateStr[i++] = ")</span></center>";
	}
	return dateStr.join("");
};

/*
* Add a few properties to the list event for the listener to pick up.
*/
ZmListView.prototype._setListEvent =
function (ev, listEv, clickedEl) {

	DwtListView.prototype._setListEvent.call(this, ev, listEv, clickedEl);

	var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : clickedEl.id;
	if (!id) return false; // don't notify listeners

	var m = this._parseId(id);
	if (ev.button == DwtMouseEvent.LEFT) {
		this._selEv.field = m ? m.field : null;
	} else if (ev.button == DwtMouseEvent.RIGHT) {
		this._actionEv.field = m ? m.field : null;
		if (m && m.field) {
			if (m.field == ZmItem.F_PARTICIPANT) {
				var item = this.getItemFromElement(clickedEl);
				this._actionEv.detail = item.participants ? item.participants.get(m.participant) : null;
			}
		}
	}
	return true;
};

ZmListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
	// We only care about mouse events
	if (!(ev instanceof DwtMouseEvent))
		return true;

	var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : clickedEl.id;
	var type = Dwt.getAttr(clickedEl, "_type");
	if (id && type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			return this._allowFieldSelection(m.item, m.field);
		}
	}
	return true;
}

ZmListView.prototype._allowFieldSelection =
function(id, field) {
	return (!this._disallowSelection[field]);
};

ZmListView.prototype._sortColumn =
function(columnItem, bSortAsc) {
	// change the sort preference for this view in the settings
	var sortBy;
	switch (columnItem._sortable) {
		case ZmItem.F_FROM:		sortBy = bSortAsc ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC; break;
		case ZmItem.F_SUBJECT:	sortBy = bSortAsc ? ZmSearch.SUBJ_ASC : ZmSearch.SUBJ_DESC;	break;
		case ZmItem.F_DATE:		sortBy = bSortAsc ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;	break;
	}

	if (sortBy) {
		this._sortByString = sortBy;
		appCtxt.set(ZmSetting.SORTING_PREF, sortBy, this.view);
	}
};

ZmListView.prototype._setNextSelection =
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;
	var item = this._list.get(this._firstSelIndex) || this._list.getLast();
	if (item)
		this.setSelection(item, false);
};
