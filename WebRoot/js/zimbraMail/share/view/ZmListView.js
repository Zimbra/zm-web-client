/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 */

/**
 * Creates a list view.
 * @class
 * A list view presents a list of items as rows with fields (columns).
 *
 * @author Parag Shah
 * @author Conrad Damon
 *
 * @param {Hash}	params		a hash of parameters
 * @param {DwtComposite}	params.parent		the parent widget
 * @param {String}	params.className		the CSS class
 * @param {constant}	params.posStyle		the positioning style
 * @param {String}	params.id			the HTML ID for element
 * @param {Array}	params.headerList	the list of IDs for columns
 * @param {Boolean}	params.noMaximize	if <code>true</code>, all columns are fixed-width (otherwise, one will expand to fill available space)
 * @param {constant}	params.view			the ID of view
 * @param {constant}	params.type			the type of item displayed
 * @param {ZmListController}	params.controller	the owning controller
 * @param {DwtDropTarget}	params.dropTgt		the drop target
 * @param {Boolean}	params.pageless		if <code>true</code>, enlarge page via scroll rather than pagination
 *        
 * @extends		DwtListView
 */
ZmListView = function(params) {

	if (arguments.length == 0) { return; }
	
	params.id = params.id || ZmId.getViewId(params.view);
	DwtListView.call(this, params);

	this.view = params.view;
	this.type = params.type;
	this._controller = params.controller;
	this.setDropTarget(params.dropTgt);

	// create listeners for changes to the list model, folder tree, and tag list
	this._listChangeListener = new AjxListener(this, this._changeListener);
	this._tagListChangeListener = new AjxListener(this, this._tagChangeListener);
	var tagList = appCtxt.getTagTree();
	if (tagList) {
		tagList.addChangeListener(this._tagListChangeListener);
	}
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.addChangeListener(new AjxListener(this, this._folderChangeListener));
	}

	this._handleEventType = {};
	this._handleEventType[this.type] = true;
	this._disallowSelection = {};
	this._disallowSelection[ZmItem.F_FLAG] = true;
	this._selectAllEnabled = false;

	if (params.dropTgt) {
		var args = {container:this._parentEl, threshold:15, amount:5, interval:10, id:params.id};
		this._dndScrollCallback = new AjxCallback(null, DwtControl._dndScrollCallback, [args]);
		this._dndScrollId = params.id;
	}

	this._isPageless = params.pageless;
	if (this._isPageless) {
		Dwt.setHandler(this._getScrollDiv(), DwtEvent.ONSCROLL, ZmListView.handleScroll);
	}
	this._state = {};
};

ZmListView.prototype = new DwtListView;
ZmListView.prototype.constructor = ZmListView;

ZmListView.prototype.toString =
function() {
	return "ZmListView";
};


// Consts

ZmListView.KEY_ID							= "_keyId";

// column widths
ZmListView.COL_WIDTH_ICON 					= 19;
ZmListView.COL_WIDTH_NARROW_ICON			= 11;

// TD class for fields
ZmListView.FIELD_CLASS = {};
ZmListView.FIELD_CLASS[ZmItem.F_TYPE]		= "Icon";
ZmListView.FIELD_CLASS[ZmItem.F_FLAG]		= "Flag";
ZmListView.FIELD_CLASS[ZmItem.F_TAG]		= "Tag";
ZmListView.FIELD_CLASS[ZmItem.F_ATTACHMENT]	= "Attach";

ZmListView.ITEM_FLAG_CLICKED 				= DwtListView._LAST_REASON + 1;
ZmListView.DEFAULT_REPLENISH_THRESHOLD		= 0;

ZmListView.COL_JOIN = "|";

ZmListView.prototype._getHeaderList = function() {};

/**
 * Gets the controller.
 * 
 * @return	{ZmListController}		the list controller
 */
ZmListView.prototype.getController =
function() {
	return this._controller;
};

ZmListView.prototype.set =
function(list, sortField) {

	this._sortByString = this._controller._currentSearch && this._controller._currentSearch.sortBy;
	appCtxt.set(ZmSetting.SORTING_PREF, this._sortByString, this.view);

	this.setSelectionHdrCbox(false);

	// bug fix #28595 - in multi-account, reset tag list change listeners
	if (appCtxt.multiAccounts) {
		var tagList = appCtxt.getTagTree();
		if (tagList) {
			tagList.addChangeListener(this._tagListChangeListener);
		}
	}

	if (this._isPageless) {
		if (this._itemsToAdd) {
			if (this._itemsToAdd.length) {
				this.addItems(this._itemsToAdd);
				this._itemsToAdd = null;
			}
		} else {
			var lvList = list;
			if (list instanceof ZmList) {
				list.addChangeListener(this._listChangeListener);
				lvList = list.getSubList(0, list.size());
			}
			DwtListView.prototype.set.call(this, lvList, sortField);
		}
		this._setRowHeight();
	} else {
		var subList;
		if (list instanceof ZmList) {
			list.addChangeListener(this._listChangeListener);
			subList = list.getSubList(this.offset, this.getLimit());
		} else {
			subList = list;
		}
		DwtListView.prototype.set.call(this, subList, sortField);
	}
	this._rendered = true;

	// check in case there are more items but no scrollbar
	if (this._isPageless) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._checkItemCount), 1000);
	}
};

ZmListView.prototype.reset =
function() {
	this._rendered = false;
};

ZmListView.prototype.setUI =
function(defaultColumnSort) {
	DwtListView.prototype.setUI.call(this, defaultColumnSort);
	this._resetColWidth();	// reset column width in case scrollbar is set
};

/**
 * Gets the limit value.
 * 
 * @param	{Boolean}	offset		if <code>true</code>, offset
 * @return	{int}	the limit page size
 */
ZmListView.prototype.getLimit =
function(offset) {
	if (this._isPageless) {
		var limit = appCtxt.get(ZmSetting.PAGE_SIZE);
		return offset ? limit : 2 * limit;
	} else {
		return appCtxt.get(ZmSetting.PAGE_SIZE);
	}
};

/**
 * Gets the pageless threshold.
 * 
 * @return	{int}		the pageless threshold
 */
ZmListView.prototype.getPagelessThreshold =
function() {
	return Math.ceil(this.getLimit() / 5);
};

/**
 * Gets the replenish threshold.
 * 
 * @return	{int}	the replenish threshold
 */
ZmListView.prototype.getReplenishThreshold =
function() {
	return ZmListView.DEFAULT_REPLENISH_THRESHOLD;
};

ZmListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type] && (this.type != ZmItem.MIXED)) { return; }

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
				this._setImage(item, ZmItem.F_FLAG, on ? "FlagRed" : "FlagDis");
			} else if (flag == ZmItem.FLAG_ATTACH) {
				this._setImage(item, ZmItem.F_ATTACHMENT, on ? "Attachment" : null);
			}
		}
	}

	// move/delete support batch notification mode
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
			this.removeItem(item, true, ev.batchMode);
			// if we've removed it from the view, we should remove it from the reference
			// list as well so it doesn't get resurrected via replenishment *unless*
			// we're dealing with a canonical list (i.e. contacts)
			if (ev.event != ZmEvent.E_MOVE || !this._controller._list.isCanonical) {
				this._controller._list.remove(item);
			}
		}
		if (ev.batchMode) {
			this._fixAlternation(0);
		}
		this._checkReplenishOnTimer();
		this._controller._resetToolbarOperations();
	}
};

ZmListView.prototype._getItemFromEvent =
function(ev) {
	var item = ev.item;
	if (!item) {
		var items = ev.getDetail("items");
		item = (items && items.length) ? items[0] : null;
	}
	return item;
};

ZmListView.prototype._getItemsFromBatchEvent =
function(ev) {

	if (!ev.batchMode) { return []; }

	var items = ev.items;
	if (!items) {
		items = [];
		var notifs = ev.getDetail("notifs");
		if (notifs && notifs.length) {
			for (var i = 0, len = notifs.length; i < len; i++) {
				var mod = notifs[i];
				items.push(mod.item || appCtxt.cacheGet(mod.id));
			}
		}
	}

	return items;
};

ZmListView.prototype._checkReplenishOnTimer =
function(ev) {
	if (!this.allSelected) {
		if (!this._isPageless) {
			this._controller._app._checkReplenishListView = this;
		} else {
			// Many rows may be removed quickly, so skip unnecessary replenishes
			if (!this._replenishTimedAction) {
				this._replenishTimedAction = new AjxTimedAction(this, this._handleResponseCheckReplenish);
			}
			AjxTimedAction.scheduleAction(this._replenishTimedAction, 10);
		}
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
	}
	this._setNextSelection();
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
	} else if(ev.event == ZmEvent.E_DELETE) {
		var divs = this._getChildren();
		var tag = ev.getDetail("organizers")[0];
		for (var i=0; i < divs.length; i++) {
			var item = this.getItemFromElement(divs[i]);
			var nTagId = ZmOrganizer.normalizeId(tag.id);
			if (item && item.tags && item.hasTag(nTagId)) {
				 item.tagLocal(nTagId, false);
				 this._setImage(item, ZmItem.F_TAG, item.getTagImageInfo());
			}
		}
	}
};

// returns all child divs for this list view
ZmListView.prototype._getChildren =
function() {
	return this._parentEl.childNodes;
};

// Common routines for createItemHtml()

ZmListView.prototype._getRowId =
function(item) {
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_FIELD, this._view, item ? item.id : Dwt.getNextId(), ZmItem.F_ITEM_ROW);
};

// Note that images typically get IDs in _getCellContents().
ZmListView.prototype._getCellId =
function(item, field) {
	if (field == ZmItem.F_DATE) {
		return this._getFieldId(item, field);
	} else if (field == ZmItem.F_SELECTION) {
		return this._getFieldId(item, ZmItem.F_SELECTION_CELL);

	} else {
		return DwtListView.prototype._getCellId.apply(this, arguments);
	}
};

ZmListView.prototype._getCellClass =
function(item, field, params) {
	return ZmListView.FIELD_CLASS[field];
};

ZmListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_SELECTION) {
		idx = this._getImageHtml(htmlArr, idx, "CheckboxUnchecked", this._getFieldId(item, field));
	} else if (field == ZmItem.F_TYPE) {
		idx = this._getImageHtml(htmlArr, idx, ZmItem.ICON[item.type], this._getFieldId(item, field));
	} else if (field == ZmItem.F_FLAG) {
		idx = this._getImageHtml(htmlArr, idx, this._getFlagIcon(item.isFlagged), this._getFieldId(item, field));
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

ZmListView.prototype._getFragmentSpan =
function(item) {
	return ["<span class='ZmConvListFragment' id='",
			this._getFieldId(item, ZmItem.F_FRAGMENT),
			"'>", this._getFragmentHtml(item), "</span>"].join("");
};

ZmListView.prototype._getFragmentHtml =
function(item) {
	return [" - ", AjxStringUtil.htmlEncode(item.fragment, true)].join("");
};

ZmListView.prototype._getFlagIcon =
function(isFlagged, isMouseover) {
	return (isFlagged || isMouseover) ? "FlagRed" : "Blank_16";
};

/**
 * Parse the DOM ID to figure out what got clicked. IDs consist of three to five parts
 * joined by the "|" character.
 *
 *		type		type of ID (zli, zlir, zlic, zlif) - see DwtId.WIDGET_ITEM*)
 * 		view		view identifier (eg "TV")
 * 		item ID		usually numeric
 * 		field		field identifier (eg "fg") - see ZmId.FLG_*
 * 		participant	index of participant
 */
ZmListView.prototype._parseId =
function(id) {
	var parts = id.split(DwtId.SEP);
	if (parts && parts.length) {
		return {view:parts[1], item:parts[2], field:parts[3], participant:parts[4]};
	} else {
		return null;
	}
};

ZmListView.prototype._mouseDownAction =
function(ev, div) {
	return !Dwt.ffScrollbarCheck(ev);
};

ZmListView.prototype._mouseUpAction =
function(ev, div) {
	return !Dwt.ffScrollbarCheck(ev);
};

ZmListView.prototype._mouseOutAction =
function(ev, div) {
	DwtListView.prototype._mouseOutAction.call(this, ev, div);

	var id = ev.target.id || div.id;
	if (!id) { return true; }

	var data = this._data[div.id];
	var type = data.type;
	if (type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			if (m.field == ZmItem.F_SELECTION) {
				var origClassName = this._getItemData(div, "origSelClassName");
				if (origClassName) {
					ev.target.className = origClassName;
				}
			} else if (m.field == ZmItem.F_FLAG) {
				var item = this.getItemFromElement(div);
				if (!item.isFlagged) {
					AjxImg.setImage(ev.target, this._getFlagIcon(item.isFlagged, false), true);
				}
			}
		}
	}

	return true;
};

ZmListView.prototype._doubleClickAction =
function(ev, div) {
	var id = ev.target.id ? ev.target.id : div.id;
	if (!id) { return true; }

	var m = this._parseId(id);
	return (!(m && (m.field == ZmItem.F_FLAG)));
};

ZmListView.prototype._itemClicked =
function(clickedEl, ev) {
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX) && ev.button == DwtMouseEvent.LEFT) {
		if (!ev.shiftKey && !ev.ctrlKey) {
			// get the field being clicked
			var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1)	? ev.target.id : clickedEl.id;
			var m = id ? this._parseId(id) : null;
			if (m && (m.field == ZmItem.F_SELECTION) || (m.field == ZmItem.F_SELECTION_CELL) ) {
				if (this._selectedItems.size() == 1) {
					var sel = this._selectedItems.get(0);
					var item = this.getItemFromElement(sel);
					var selFieldId = item ? this._getFieldId(item, ZmItem.F_SELECTION) : null;
					var selField = selFieldId ? document.getElementById(selFieldId) : null;
					if (selField && sel == clickedEl) {
						var origClass = this._getItemData(sel, "origSelClassName");
						if (origClass == "ImgCheckboxChecked") {
							selField.className = "ImgCheckboxUnchecked";
							this._setItemData(sel, "origSelClassName", "ImgCheckboxUnchecked");
						} else if (origClass == "ImgCheckboxUnchecked") {
							selField.className = "ImgCheckboxChecked";
							this._setItemData(sel, "origSelClassName", "ImgCheckboxChecked");
							return;
						}
					} else {
						if (selField && selField.className == "ImgCheckboxUnchecked") {
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
	this._checkSelectionColumnClicked(clickedCol, ev);
};

ZmListView.prototype._checkSelectionColumnClicked =
function(clickedCol, ev) {

	if (!appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) { return; }

	var list = this.getList();
	var size = list ? list.size() : null;
	if (size > 0) {
		var idx = this._data[clickedCol.id].index;
		var item = this._headerList[idx];
		if (item && (item._field == ZmItem.F_SELECTION)) {
			var hdrId = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ICON, this._view, item._field);
			var hdrDiv = document.getElementById(hdrId);
			if (hdrDiv) {
				if (hdrDiv.className == "ImgCheckboxChecked") {
					if (ev.shiftKey && !this.allSelected) {
						this.selectAll(ev.shiftKey);
					} else {
						this.deselectAll();
						hdrDiv.className = "ImgCheckboxUnchecked";
					}
				} else {
					this.allSelected = false;
					hdrDiv.className = "ImgCheckboxChecked";
					this.selectAll(ev.shiftKey);
				}
			}
		}
		this._controller._resetToolbarOperations();
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

/**
 * Sets the selection checkbox.
 * 
 * @param	{Element}	obj		the item element object
 * @param	{Boolean}	bContained		(not used)
 * 
 */
ZmListView.prototype.setSelectionCbox =
function(obj, bContained) {
	if (!obj) { return; }

	var item = obj.tagName ? this.getItemFromElement(obj) : obj;
	var selFieldId = item ? this._getFieldId(item, ZmItem.F_SELECTION) : null;
	var selField = selFieldId ? document.getElementById(selFieldId) : null;
	if (selField) {
		selField.className = bContained ? "ImgCheckboxUnchecked" : "ImgCheckboxChecked";
		this._setItemData(obj, "origSelClassName", selField.className);
	}
};

/**
 * Sets the selection header checkbox.
 * 
 * @param	{Boolean}	check		if <code>true</code>, check the header checkbox
 */
ZmListView.prototype.setSelectionHdrCbox =
function(check) {
	var col = this._headerHash ? this._headerHash[ZmItem.F_SELECTION] : null;
	var hdrId = col ? DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ICON, this._view, col._field) : null;
	var hdrDiv = hdrId ? document.getElementById(hdrId) : null;
	if (hdrDiv) {
		hdrDiv.className = check
			? "ImgCheckboxChecked"
			: "ImgCheckboxUnchecked";
	}
};

/**
 * Sets the selected items.
 * 
 * @param	{Array}	selectedArray		an array of {Element} objects to select
 */
ZmListView.prototype.setSelectedItems =
function(selectedArray) {
	DwtListView.prototype.setSelectedItems.call(this, selectedArray);

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		this._checkSelectedItems(true);
	}
};

/**
 * Selects all items.
 * 
 * @param	{Boolean}	allResults		if <code>true</code>, set all search selected
 */
ZmListView.prototype.selectAll =
function(allResults) {

	DwtListView.prototype.selectAll.apply(this, arguments);

	if (this._selectAllEnabled) {
		var curResult = this._controller._activeSearch;
		if (curResult && curResult.getAttribute("more")) {
			var toastMsg = AjxMessageFormat.format(ZmMsg.allPageSelected, this.getList().size());
			if (allResults) {
				this.allSelected = true;
				toastMsg = ZmMsg.allSearchSelected;
			}
			appCtxt.setStatusMsg(toastMsg);
		}
	}
};

/**
 * Deselects all items.
 * 
 */
ZmListView.prototype.deselectAll =
function() {
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		this._checkSelectedItems(false);
		this.allSelected = false;
		var hdrId = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ICON, this._view, ZmItem.F_SELECTION);
		var hdrDiv = document.getElementById(hdrId);
		if (hdrDiv) {
			hdrDiv.className = "ImgCheckboxUnchecked";
		}
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
	this._rendered = true;
};

ZmListView.prototype._getActionMenuForColHeader =
function(force) {
	if (!this._colHeaderActionMenu || force) {
		// create a action menu for the header list
		this._colHeaderActionMenu = new ZmPopupMenu(this);
		var actionListener = new AjxListener(this, this._colHeaderActionListener);
		for (var i = 0; i < this._headerList.length; i++) {
			var hCol = this._headerList[i];
			// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
			if (hCol._width) {
				var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
				mi.setData(ZmListView.KEY_ID, hCol._id);
				mi.setChecked(hCol._visible, true);
                if (hCol._noRemove) {
					mi.setEnabled(false);
				}
                this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
			}
		}
	}
	return this._colHeaderActionMenu;
};

ZmListView.prototype._colHeaderActionListener =
function(ev) {

	var menuItemId = ev.item.getData(ZmListView.KEY_ID);

	for (var i = 0; i < this._headerList.length; i++) {
		var col = this._headerList[i];
		if (col._id == menuItemId) {
			col._visible = !col._visible;
			break;
		}
	}

	this._relayout();
};

/**
 * Gets the tool tip content.
 * 
 * @param	{Object}	ev		the hover event
 * @return	{String}	the tool tip content
 */
ZmListView.prototype.getToolTipContent =
function(ev) {
	var div = this.getTargetItemDiv(ev);
	if (!div) { return; }
	var id = ev.target.id || div.id;
	if (!id) { return ""; }

	// check if we're hovering over a column header
	var data = this._data[div.id];
	var type = data.type;
	var tooltip;
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var itemIdx = data.index;
		var field = this._headerList[itemIdx]._field;
		tooltip = this._getHeaderToolTip(field, itemIdx);
	} else {
		var match = this._parseId(id);
		if (match && match.field) {
			var item = this.getItemFromElement(div);
			var params = {field:match.field, item:item, ev:ev, div:div, match:match};
			tooltip = this._getToolTip(params);
		}
	}
	return tooltip;
};

ZmListView.prototype._getHeaderToolTip =
function(field, itemIdx, isOutboundFolder) {

	var tooltip = null;
	var sortable = this._headerList[itemIdx]._sortable;
	if (field == ZmItem.F_SELECTION) {
		tooltip = ZmMsg.selectionColumn;
	} else if (field == ZmItem.F_FLAG) {
        tooltip = ZmMsg.flag;
    } else if (field == ZmItem.F_PRIORITY){
        tooltip = ZmMsg.priority;
    } else if (field == ZmItem.F_TAG) {
        tooltip = ZmMsg.tag;
    } else if (field == ZmItem.F_ATTACHMENT) {
        tooltip = ZmMsg.attachment;
    } else if (field == ZmItem.F_SUBJECT) {
        tooltip = sortable ? ZmMsg.sortBySubject : ZmMsg.subject;
    } else if (field == ZmItem.F_DATE) {
		if (sortable) {
			if (isOutboundFolder) {
				tooltip = (this._folderId == ZmFolder.ID_DRAFTS) ? ZmMsg.sortByLastSaved : ZmMsg.sortBySent;
			} else {
				tooltip = ZmMsg.sortByReceived;
			}
		} else {
			tooltip = ZmMsg.date;
		}
    } else if (field == ZmItem.F_FROM) {
        tooltip = sortable ? isOutboundFolder ? ZmMsg.sortByTo : ZmMsg.sortByFrom : isOutboundFolder ? ZmMsg.to : ZmMsg.from ;
    } else if (field == ZmItem.F_SIZE){
        tooltip = sortable ? ZmMsg.sortBySize : ZmMsg.sizeToolTip;
	} else if (field == ZmItem.F_ACCOUNT) {
		tooltip = ZmMsg.account;
    } else if (field == ZmItem.F_FOLDER) {
        tooltip = ZmMsg.folder;
    }
    
    return tooltip;
};

/**
 * @param params		[hash]			hash of params:
 *        field			[constant]		column ID
 *        item			[ZmItem]*		underlying item
 *        ev			[DwtEvent]*		mouseover event
 *        div			[Element]*		row div
 *        match			[hash]*			fields from div ID
 *        callback		[AjxCallback]*	callback (in case tooltip content retrieval is async)
 *        
 * @private
 */
ZmListView.prototype._getToolTip =
function(params) {
    var tooltip, field = params.field, target = params.ev.target, item = params.item;
    if (field == ZmItem.F_SELECTION) {
		this._setItemData(params.div, "origSelClassName", target.className);
        if (target.className != "ImgCheckboxChecked") {
            target.className = "ImgCheckboxChecked";
        }
    } else if (field == ZmItem.F_FLAG) {
        if (!item.isFlagged) {
            AjxImg.setDisabledImage(target, this._getFlagIcon(item.isFlagged, true), true);
        }
    } else if (field == ZmItem.F_PRIORITY) {
        if (item.isHighPriority) {
            tooltip = ZmMsg.highPriorityTooltip;
        } else if (item.isLowPriority) {
            tooltip = ZmMsg.lowPriorityTooltip;
        }
    } else if (field == ZmItem.F_TAG) {
        tooltip = this._getTagToolTip(item);
    } else if (field == ZmItem.F_ATTACHMENT) {
        // disable att tooltip for now, we only get att info once msg is loaded
        // tooltip = this._getAttachmentToolTip(item);
    } else if (field == ZmItem.F_DATE) {
        tooltip = this._getDateToolTip(item, params.div);
    }
    return tooltip;
};

ZmListView.prototype._getTagToolTip =
function(item) {
	if (!item) { return; }
	var numTags = item.tags && item.tags.length;
	if (!numTags) { return; }
	var account = appCtxt.multiAccounts ? item.getAccount() : null;
	var tagList = appCtxt.getTagTree(account);
	var tags = item.tags;
	var html = [];
	var idx = 0;
    for (var i = 0; i < numTags; i++) {
		var tag = tagList.getById(tags[i]);
        if (!tag) { continue; }        
        html[idx++] = "<table><tr><td>";
		html[idx++] = AjxImg.getImageHtml(ZmTag.COLOR_ICON[tag.color]);
		html[idx++] = "</td><td valign='middle'>";
		html[idx++] = AjxStringUtil.htmlEncode(tag.name);
		html[idx++] = "</td></tr></table>";
	}
	return html.join("");
};

ZmListView.prototype._getAttachmentToolTip =
function(item) {
	var tooltip = null;
	var atts = item && item.attachments ? item.attachments : [];
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
	if (!(ev instanceof DwtMouseEvent)) { return true; }

	var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : clickedEl.id;
	var data = this._data[clickedEl.id];
	var type = data.type;
	if (id && type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			return this._allowFieldSelection(m.item, m.field);
		}
	}
	return true;
};

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
		case ZmItem.F_SIZE:		sortBy = bSortAsc ? ZmSearch.SIZE_ASC : ZmSearch.SIZE_DESC;	break;
		case ZmItem.F_SORTED_BY:sortBy = bSortAsc ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;	break;
	}

	if (sortBy) {
		this._sortByString = sortBy;
		appCtxt.set(ZmSetting.SORTING_PREF, sortBy, this.view);
	}
};

ZmListView.prototype._setNextSelection =
function() {
	// set the next appropriate selected item
	if (this.firstSelIndex < 0) {
		this.firstSelIndex = 0;
	}
    var item;
    if(this._list){
	    item = this._list.get(this.firstSelIndex) || this._list.getLast();
    }
	if (item) {
		this.setSelection(item, false);
	}
};

ZmListView.prototype._relayout =
function() {
	DwtListView.prototype._relayout.call(this);
	this._checkColumns();
};

ZmListView.prototype._checkColumns =
function() {
	var numCols = this._headerList.length;
	var fields = [];
	for (var i = 0; i < numCols; i++) {
		var headerCol = this._headerList[i];
		// bug 43540: always skip account header since its a multi-account only
		// column and we don't want it to sync
		if (headerCol && headerCol._field != ZmItem.F_ACCOUNT) {
			fields.push(headerCol._field + (headerCol._visible ? "" : "*"));
		}
	}
	var value = fields.join(ZmListView.COL_JOIN);
	value = (value == this._defaultCols) ? "" : value;
	appCtxt.set(ZmSetting.LIST_VIEW_COLUMNS, value, this.view);

	this._getActionMenuForColHeader(true); // re-create action menu so order is correct
};

/**
 * Scroll-based paging. Make sure we have at least one page of items below the visible list.
 * 
 * @param ev
 */
ZmListView.handleScroll =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	var lv = DwtControl.findControl(target);
	if (lv) {
		lv._checkItemCount();
	}
};

/**
 * Figure out if we should fetch some more items, based on where the scroll is. Our goal is to have
 * a certain number available below the bottom of the visible view.
 */
ZmListView.prototype._checkItemCount =
function() {
	var itemsNeeded = this._getItemsNeeded();
	if (itemsNeeded) {
		this._controller._paginate(this._view, true, null, itemsNeeded);
	}
};

/**
 * Figure out how many items we need to fetch to maintain a decent number
 * below the fold. Nonstandard list views may override.
 */
ZmListView.prototype._getItemsNeeded =
function() {

	if (!(this._controller._list && this._controller._list.hasMore()) || !this._list) { return 0; }
	if (!this._rendered || !this._rowHeight) { return 0; }

	DBG.println(AjxDebug.DBG2, "List view: checking item count");
	var scrollDiv = this._getScrollDiv();
	var sh = scrollDiv.scrollHeight, st = scrollDiv.scrollTop, rh = this._rowHeight;

	// view (porthole) height - everything measured relative to its top
	// prefer clientHeight since (like scrollHeight) it doesn't include borders
	var h = scrollDiv.clientHeight || Dwt.getSize(scrollDiv).y;

	// where we'd like bottom of list view to be (with extra hidden items at bottom)
	var target = h + (this.getPagelessThreshold() * this._rowHeight);

	// where bottom of list view is (including hidden items)
	var bottom = sh - st;

	if (bottom == h) {
		// handle cases where list view isn't full, but we have more items (eg tall browser, or replenishment)
		bottom = (this._list.size() * rh) - st;
		if (st == 0) {
			// fix list view width since we are getting a scrollbar
			AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._resetColWidth), 100);
		}
	}
	var itemsNeeded = 0;
	if (bottom < target) {
		// buffer below visible bottom of list view is not full
		return Math.max(Math.floor((target - bottom) / rh), this.getLimit(1));
	}
};

ZmListView.prototype._getScrollDiv =
function() {
	return this._parentEl;
};

ZmListView.prototype._sizeChildren =
function(height) {
	if (DwtListView.prototype._sizeChildren.apply(this, arguments)) {
		this._checkItemCount();
	}
};

// Allow list view classes to override type used in nav text. Return null to say "items".
ZmListView.prototype._getItemCountType =
function() {
	return this.type;
};

/**
 * Checks if the given item is in this view's list. Note that the view's list may
 * be only part of the controller's list (the currently visible page).
 *
 * @param {String|ZmItem}	item		the item ID, or item to check for
 * @return	{Boolean}	<code>true</code> if the item is in the list
 */
ZmListView.prototype.hasItem =
function(item) {

	var id = (typeof item == "string") ? item : item && item.id;
	if (id && this._list) {
		var a = this._list.getArray();
		for (var i = 0, len = a.length; i < len; i++) {
			var item = a[i];
			if (item && item.id == id) {
				return true;
			}
		}
	}
	return false;
};

/**
 * The following methods allow a list view to maintain state after it has
 * been rerendered. State may include such elements as: which items are selected,
 * focus, scroll position, etc.
 *
 * @private
 * @param {hash}		params		hash of parameters:
 * @param {boolean}		selection	if true, preserve selection
 * @param {boolean}		focus		if true, preserve focus
 * @param {boolean}		scroll		if true, preserve scroll position
 */
ZmListView.prototype._saveState =
function(params) {

	var s = this._state = {};
	params = params || {};
	if (params.selection) {
		s.selected = this.getSelection();
	}
	if (params.focus) {
		s.focused = this.hasFocus();
		s.anchorItem = this._kbAnchor && this.getItemFromElement(this._kbAnchor);
	}
	if (params.scroll) {
		s.rowHeight = this._rowHeight;
		s.scrollTop = this._listDiv.scrollTop;
	}
};

ZmListView.prototype._restoreState =
function() {

	var s = this._state;
	if (s.selected && s.selected.length) {
		this.setSelectedItems(s.selected);
	}
	if (s.anchorItem) {
		var el = this._getElFromItem(s.anchorItem);
		if (el) {
			this._setKbFocusElement(el);
		}
	}
	if (s.focused) {
		this.focus();
	}
	// restore scroll position based on row height ratio
	if (s.rowHeight) {
		this._listDiv.scrollTop = s.scrollTop * (this._rowHeight / s.rowHeight);
	}

	this._state = {};
};
