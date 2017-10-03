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
		this._boundFolderChangeListener =  this._folderChangeListener.bind(this);
		folderTree.addChangeListener(this._boundFolderChangeListener);
	}

	this._handleEventType = {};
	this._handleEventType[this.type] = true;
	this._disallowSelection = {};
	this._disallowSelection[ZmItem.F_FLAG] = true;
	this._disallowSelection[ZmItem.F_MSG_PRIORITY] = true;
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
ZmListView.prototype.isZmListView = true;

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
ZmListView.FIELD_CLASS[ZmItem.F_TYPE]		= "ListViewIcon";
ZmListView.FIELD_CLASS[ZmItem.F_FLAG]		= "Flag";
ZmListView.FIELD_CLASS[ZmItem.F_TAG]		= "Tag";
ZmListView.FIELD_CLASS[ZmItem.F_ATTACHMENT]	= "Attach";

ZmListView.ITEM_FLAG_CLICKED 				= DwtListView._LAST_REASON + 1;
ZmListView.DEFAULT_REPLENISH_THRESHOLD		= 0;

ZmListView.COL_JOIN = "|";

ZmListView.CHECKED_IMAGE = "CheckboxChecked";
ZmListView.UNCHECKED_IMAGE = "CheckboxUnchecked";
ZmListView.CHECKED_CLASS = "ImgCheckboxChecked";
ZmListView.UNCHECKED_CLASS = "ImgCheckboxUnchecked";
ZmListView.ITEM_CHECKED_ATT_NAME = "itemChecked";


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
    //TODO: We need a longer term fix but this is to prevent a sort by that doesn't match our ZmSearch
	//constants and lead to notification issues.
	if (this._sortByString) {
    	this._sortByString = this._sortByString.replace("asc", "Asc").replace("desc", "Desc");// bug 75687
	}

	var settings = appCtxt.getSettings();
	if (!appCtxt.isExternalAccount() && this.view) {
		appCtxt.set(ZmSetting.SORTING_PREF,
					this._sortByString,
					this.view,
					false, //setDefault
					false, //skipNotify
					null, //account
					settings && !settings.persistImplicitSortPrefs(this.view)); //skipImplicit - do not persist
	}

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
			if (list && list.isZmList) {
				list.addChangeListener(this._listChangeListener);
				lvList = list.getSubList(0, list.size());
			}
			DwtListView.prototype.set.call(this, lvList, sortField);
		}
		this._setRowHeight();
	} else {
		var subList;
		if (list && list.isZmList) {
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

/**
 * Returns the underlying ZmList.
 */
ZmListView.prototype.getItemList =
function() {
	return this._controller && this._controller._list;
};

ZmListView.prototype._changeListener =
function(ev) {

	var item = this._getItemFromEvent(ev);
	if (!item || ev.handled || !this._handleEventType[item.type]) {
		return;
	}

	if (ev.event === ZmEvent.E_TAGS || ev.event === ZmEvent.E_REMOVE_ALL) {
		this._replaceTagImage(item, ZmItem.F_TAG, this._getClasses(ZmItem.F_TAG));
	}

	if (ev.event === ZmEvent.E_FLAGS) {
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			var on = item[ZmItem.FLAG_PROP[flag]];
			if (flag === ZmItem.FLAG_FLAGGED) {
				this._setImage(item, ZmItem.F_FLAG, on ? "FlagRed" : "FlagDis", this._getClasses(ZmItem.F_FLAG));
			}
			else if (flag === ZmItem.FLAG_ATTACH) {
				this._setImage(item, ZmItem.F_ATTACHMENT, on ? "Attachment" : null, this._getClasses(ZmItem.F_ATTACHMENT));
			}
			else if (flag === ZmItem.FLAG_PRIORITY) {
				this._setImage(item, ZmItem.F_MSG_PRIORITY, on ? "Priority" : "PriorityDis", this._getClasses(ZmItem.F_MSG_PRIORITY));
			}
		}
	}

	// Note: move and delete support batch notification mode
	if (ev.event === ZmEvent.E_DELETE || ev.event === ZmEvent.E_MOVE) {
		var items = ev.batchMode ? this._getItemsFromBatchEvent(ev) : [item];
		var needsSort = false;
		for (var i = 0, len = items.length; i < len; i++) {
			var item = items[i];
            var movedHere = (item.type === ZmId.ITEM_CONV) ? item.folders[this._folderId] : item.folderId === this._folderId;
			if (movedHere && ev.event === ZmEvent.E_MOVE) {
				// We've moved the item into this folder
				if (this._getRowIndex(item) === null) { // Not already here
					this.addItem(item);
					// TODO: couldn't we just find the sort index and insert it?
					needsSort = true;
				}
			}
			else {
				// remove the item if the user is working in this view,
				// if we know the item no longer matches the search, or if the item was hard-deleted
				if (ev.event === ZmEvent.E_DELETE || this.view == appCtxt.getCurrentViewId() || this._controller._currentSearch.matches(item) === false) {
					this.removeItem(item, true, ev.batchMode);
					// if we've removed it from the view, we should remove it from the reference
					// list as well so it doesn't get resurrected via replenishment *unless*
					// we're dealing with a canonical list (i.e. contacts)
					var itemList = this.getItemList();
					if (ev.event !== ZmEvent.E_MOVE || !itemList.isCanonical) {
						itemList.remove(item);
					}
				}
			}
		}
		if (needsSort) {
			this._saveState({scroll: true, selection:true, focus: true});
			this._redoSearch(this._restoreState.bind(this, this._state));
		}
		if (ev.batchMode) {
			this._fixAlternation(0);
		}
		this._checkReplenishOnTimer();
		this._controller._resetToolbarOperations();
	}

	this._updateLabelForItem(item);
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

// refreshes the content of the given field for the given item
ZmListView.prototype._updateField =
function(item, field) {
	var fieldId = this._getFieldId(item, field);
	var el = document.getElementById(fieldId);
	if (el) {
		var html = [];
		var colIdx = this._headerHash[field] && this._headerHash[field]._index;
		this._getCellContents(html, 0, item, field, colIdx, new Date());
		//replace the old inner html with the new updated data
		el.innerHTML = $(html.join("")).html();
	}

	this._updateLabelForItem(item);
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
function(item, forceSelection) {
	var respCallback = new AjxCallback(this, this._handleResponseCheckReplenish, [false, item, forceSelection]);
	this._controller._checkReplenish(respCallback);
};

ZmListView.prototype._handleResponseCheckReplenish =
function(skipSelection, item, forceSelection) {
	if (this.size() == 0) {
		this._controller._handleEmptyList(this);
	} else {
		this._controller._resetNavToolBarButtons();
	}
	if (!skipSelection) {
		this._setNextSelection(item, forceSelection);
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
			this._controller._resetNavToolBarButtons();
		}
	}
};

ZmListView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG) return;

	var fields = ev.getDetail("fields");

	var divs = this._getChildren();
	var tag = ev.getDetail("organizers")[0];
	for (var i = 0; i < divs.length; i++) {
		var item = this.getItemFromElement(divs[i]);
		if (!item || !item.tags || !item.hasTag(tag.name)) {
			continue;
		}
		var updateRequired = false;
		if (ev.event == ZmEvent.E_MODIFY && (fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]))) {
			//rename could change the color (for remote shared items, from the remote gray icon to local color and vice versa)
			updateRequired = item.tags.length == 1;
		}
		else if (ev.event == ZmEvent.E_DELETE) {
			updateRequired = true;
		}
		else if (ev.event == ZmEvent.E_CREATE) {
			//this could affect item if it had a tag not on tag list (remotely created on shared item, either shared by this user or shared to this user)
			updateRequired = true;
		}
		if (updateRequired) {
			this._replaceTagImage(item, ZmItem.F_TAG, this._getClasses(ZmItem.F_TAG));
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
function(htmlArr, idx, item, field, colIdx, params, classes) {
	if (field == ZmItem.F_SELECTION) {
		idx = this._getImageHtml(htmlArr, idx, "CheckboxUnchecked", this._getFieldId(item, field), classes);
	} else if (field == ZmItem.F_TYPE) {
		idx = this._getImageHtml(htmlArr, idx, ZmItem.ICON[item.type], this._getFieldId(item, field), classes);
	} else if (field == ZmItem.F_FLAG) {
		idx = this._getImageHtml(htmlArr, idx, this._getFlagIcon(item.isFlagged), this._getFieldId(item, field), classes);
	} else if (field == ZmItem.F_TAG) {
		idx = this._getImageHtml(htmlArr, idx, item.getTagImageInfo(), this._getFieldId(item, field), classes);
	} else if (field == ZmItem.F_ATTACHMENT) {
		idx = this._getImageHtml(htmlArr, idx, item.hasAttach ? "Attachment" : null, this._getFieldId(item, field), classes);
	} else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = AjxDateUtil.computeDateStr(params.now || new Date(), item.date);
	} else if (field == ZmItem.F_PRIORITY) {
        var priorityImage = null;
        if (item.isHighPriority) {
            priorityImage = "PriorityHigh_list";
        } else if (item.isLowPriority) {
			priorityImage = "PriorityLow_list";
		}
		if (priorityImage) {
        	idx = this._getImageHtml(htmlArr, idx, priorityImage, this._getFieldId(item, field), classes);
		} else {
			htmlArr[idx++] = "<div id='" + this._getFieldId(item, field) + "' " + AjxUtil.getClassAttr(classes) + "></div>";
		}
	} else {
		idx = DwtListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};

ZmListView.prototype._getImageHtml =
function(htmlArr, idx, imageInfo, id, classes) {
	htmlArr[idx++] = "<div";
	if (id) {
		htmlArr[idx++] = [" id='", id, "' "].join("");
	}
	htmlArr[idx++] = AjxUtil.getClassAttr(classes);
	htmlArr[idx++] = ">";
	htmlArr[idx++] = AjxImg.getImageHtml(imageInfo || "Blank_16");
	htmlArr[idx++] = "</div>";
	return idx;
};

ZmListView.prototype._getClasses =
function(field, classes) {
	if (this.isMultiColumn && this.isMultiColumn() && this._headerHash[field]) {
		classes = classes || [];
		classes = [this._headerHash[field]._cssClass];
	}
	return classes;
};

ZmListView.prototype._setImage =
function(item, field, imageInfo, classes) {
	var cell = this._getElement(item, field);
	if (cell) {
		if (classes) {
			cell.className = AjxUtil.uniq(classes).join(" ");
		}
		cell.innerHTML = AjxImg.getImageHtml(imageInfo || "Blank_16");
	}
};

ZmListView.prototype._replaceTagImage =
function(item, field, classes) {
	this._setImage(item, field, item.getTagImageInfo(), classes);
};

ZmListView.prototype._getFragmentSpan =
function(item) {
	return ["<span class='ZmConvListFragment' aria-hidden='true' id='",
			this._getFieldId(item, ZmItem.F_FRAGMENT),
			"'>", this._getFragmentHtml(item), "</span>"].join("");
};

ZmListView.prototype._getFragmentHtml =
function(item) {
	return [" - ", AjxStringUtil.htmlEncode(item.fragment, true)].join("");
};

ZmListView.prototype._getFlagIcon =
function(isFlagged, isMouseover, disabled) {
	if (!isFlagged && !isMouseover) {
		return "Blank_16";
	} else if (disabled) {
		return "FlagDis";
	} else {
		return "FlagRed";
	}
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

ZmListView.prototype._getField =
function(ev, div) {

	var target = this._getEventTarget(ev);

	var id = target && target.id || div.id;
	if (!id) {
		return null;
	}

	var data = this._data[div.id];
	var type = data.type;
	if (!type || type != DwtListView.TYPE_LIST_ITEM) {
		return null;
	}

	var m = this._parseId(id);
	if (!m || !m.field) {
		return null;
	}
	return m.field;

};


ZmListView.prototype._mouseOutAction =
function(ev, div) {
	DwtListView.prototype._mouseOutAction.call(this, ev, div);

	var field = this._getField(ev, div);
	if (!field) {
		return true;
	}

	if (field == ZmItem.F_FLAG) {
		var item = this.getItemFromElement(div);
		if (!item.isFlagged) {
			var target = this._getEventTarget(ev);
			AjxImg.setImage(target, this._getFlagIcon(item.isFlagged, false), false, false);
			target.className = this._getClasses(field);
		}
	}
	return true;
};


ZmListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);

	var field = this._getField(ev, div);
	if (!field) {
		return true;
	}

	if (field === ZmItem.F_FLAG) {
		var item = this.getItemFromElement(div);
		if (!item.isReadOnly() && !item.isFlagged) {
			var target = this._getEventTarget(ev);
			AjxImg.setDisabledImage(target, this._getFlagIcon(item.isFlagged, true), false);
			target.className = this._getClasses(field);
		}
	}
	return true;
};



ZmListView.prototype._doubleClickAction =
function(ev, div) {
	var target = this._getEventTarget(ev);
	var id = target && target.id || div.id;
	if (!id) { return true; }

	var m = this._parseId(id);
	return (!(m && (m.field == ZmItem.F_FLAG)));
};

ZmListView.prototype._itemClicked =
function(clickedEl, ev) {
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX) && ev.button == DwtMouseEvent.LEFT) {
		if (!ev.shiftKey && !ev.ctrlKey) {
			// get the field being clicked
			var target = this._getEventTarget(ev);
			var id = (target && target.id && target.id.indexOf("AjxImg") == -1) ? target.id : clickedEl.id;
			var m = id ? this._parseId(id) : null;
			if (m && (m.field == ZmItem.F_SELECTION || m.field == ZmItem.F_SELECTION_CELL)) {
				//user clicked on a checkbox
				if (this._selectedItems.size() == 1) {
					var sel = this._selectedItems.get(0);
					var item = this.getItemFromElement(sel);
					var selFieldId = item ? this._getFieldId(item, ZmItem.F_SELECTION) : null;
					var selField = selFieldId ? document.getElementById(selFieldId) : null;
					if (selField && sel == clickedEl) {
						var isChecked = this._getItemData(sel, ZmListView.ITEM_CHECKED_ATT_NAME);
						this._setImage(item, ZmItem.F_SELECTION, isChecked ? ZmListView.UNCHECKED_IMAGE : ZmListView.CHECKED_IMAGE);
						this._setItemData(sel, ZmListView.ITEM_CHECKED_ATT_NAME, !isChecked);
						if (!isChecked) {
							return; //nothing else to do. It's already selected, and was the only selected one. Nothing to remove
						}
					} else {
						if (selField && !this._getItemData(sel, ZmListView.ITEM_CHECKED_ATT_NAME)) {
							this.deselectAll();
							this._markUnselectedViewedItem(true);
						}
					}
				}
				var bContained = this._selectedItems.contains(clickedEl);
				this.setMultiSelection(clickedEl, bContained);
				this._controller._setItemSelectionCountText();
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
				if (hdrDiv.className == ZmListView.CHECKED_CLASS) {
					if (ev.shiftKey && !this.allSelected) {
						this.selectAll(ev.shiftKey);
					} else {
						this.deselectAll();
						hdrDiv.className = ZmListView.UNCHECKED_CLASS;
					}
				} else {
					this.allSelected = false;
					hdrDiv.className = ZmListView.CHECKED_CLASS;
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
	this.setSelectionHdrCbox(this._isAllChecked());

	// reset toolbar operations LAST
	this._controller._resetToolbarOperations();
};

/**
 * check whether all items in the list are checked
 * @return {Boolean} true if all items are checked
 */
ZmListView.prototype._isAllChecked = 
function() {
	var list = this.getList();
	return (list && (this.getSelection().length == list.size()));
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
		this._setImage(item, ZmItem.F_SELECTION, bContained ? ZmListView.UNCHECKED_IMAGE : ZmListView.CHECKED_IMAGE);
		this._setItemData(this._getElFromItem(item), ZmListView.ITEM_CHECKED_ATT_NAME, !bContained);
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
			? ZmListView.CHECKED_CLASS
			: ZmListView.UNCHECKED_CLASS;
	}
};

/**
 * Sets the selected items.
 * 
 * @param	{Array}	selectedArray		an array of {Element} objects to select
 * @param	{boolean}	dontCheck		do not check the selected item. (special case. see ZmListView.prototype._restoreState)
 */
ZmListView.prototype.setSelectedItems =
function(selectedArray, dontCheck) {
	DwtListView.prototype.setSelectedItems.call(this, selectedArray);

	if (!dontCheck && appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		this._checkSelectedItems(true, true);
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

			var list = this.getList(),
				type = this.type,
				countKey = 'type' + AjxStringUtil.capitalize(ZmItem.MSG_KEY[type]),
				typeText = AjxMessageFormat.format(ZmMsg[countKey], list ? list.size() : 2),
				shortcut = appCtxt.getShortcutHint(null, ZmKeyMap.SELECT_ALL),
				args = [list ? list.size() : ZmMsg.all, typeText, shortcut, "ZmListView.selectAllResults()"],
				toastMsg = AjxMessageFormat.format(ZmMsg.allPageSelected, args);

			if (allResults) {
				this.allSelected = true;
				toastMsg = ZmMsg.allSearchSelected;
			}
			appCtxt.setStatusMsg(toastMsg);
		}

		var sel = this._selectedItems.getArray();
		for (var i = 0; i < sel.length; i++) {
			this.setSelectionCbox(sel[i], false);
		}
	}
};

// Handle click of link in toast
ZmListView.selectAllResults =
function() {
	var ctlr = appCtxt.getCurrentController();
	var view = ctlr && ctlr.getListView();
	if (view && view.selectAll) {
		view.selectAll(true);
	}
};

/**
 * Deselects all items.
 * 
 */
ZmListView.prototype.deselectAll =
function() {

	this.allSelected = false;
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		this._checkSelectedItems(false);
		var hdrId = DwtId.getListViewHdrId(DwtId.WIDGET_HDR_ICON, this._view, ZmItem.F_SELECTION);
		var hdrDiv = document.getElementById(hdrId);
		if (hdrDiv) {
			hdrDiv.className = ZmListView.UNCHECKED_CLASS;
		}
		var sel = this._selectedItems.getArray();
		for (var i=0; i<sel.length; i++) {
			this.setSelectionCbox(sel[i], true);
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

	var list = this.getList();
	var size = list && list.size();
	this.setSelectionHdrCbox(size && sel.length == size);
};

ZmListView.prototype._setNoResultsHtml =
function() {
	DwtListView.prototype._setNoResultsHtml.call(this);
	this.setSelectionHdrCbox(false);
	this._rendered = true;
};

/**
 * override to call _resetToolbarOperations since we change the selection.
 * @private
 */
ZmListView.prototype._clearRightSel =
function() {
	DwtListView.prototype._clearRightSel.call(this);
	this._controller._resetToolbarOperations();
};


/*
 get sort menu for views that provide a right-click sort by menu in single-column view (currently mail and briefcase)
 */
ZmListView.prototype._getSortMenu = function (sortFields, defaultSortField, parent) {

	// create an action menu for the header list
	var menu = new ZmPopupMenu(parent || this, null, Dwt.getNextId("SORT_MENU_"));
	var actionListener = this._sortMenuListener.bind(this);

	for (var i = 0; i < sortFields.length; i++) {
		var column = sortFields[i];
		var fieldName = ZmMsg[column.msg];
		var mi = menu.createMenuItem(column.field, {
			text:   parent && parent.isDwtMenuItem ? fieldName : AjxMessageFormat.format(ZmMsg.arrangeBy, fieldName),
			style:  DwtMenuItem.RADIO_STYLE
		});
		if (column.field == defaultSortField) {
			mi.setChecked(true, true);
		}
		mi.setData(ZmListView.KEY_ID, column.field);
		menu.addSelectionListener(column.field, actionListener);
	}

	return menu;
};

/*
listener used by views that provide a right-click sort by menu in single-column view (currently mail and briefcase)
 */
ZmListView.prototype._sortMenuListener =
function(ev) {
	var column;
	if (this.isMultiColumn()) { //this can happen when called from the view menu, that now, for accessibility reasons, includes the sort, for both reading pane on right and at the bottom.
		var sortField = ev && ev.item && ev.item.getData(ZmOperation.MENUITEM_ID);
		column = this._headerHash[sortField];
	}
	else {
		column = this._headerHash[ZmItem.F_SORTED_BY];
		var cell = document.getElementById(DwtId.getListViewHdrId(DwtId.WIDGET_HDR_LABEL, this._view, column._field));
		if (cell) {
	        var text = ev.item.getText();
	        cell.innerHTML = text && text.replace(ZmMsg.sortBy, ZmMsg.sortedBy);
		}
		column._sortable = ev.item.getData(ZmListView.KEY_ID);
	}
	this._bSortAsc = (column._sortable === this._currentSortColId) ? !this._bSortAsc : this._isDefaultSortAscending(column);
	this._sortColumn(column, this._bSortAsc);
};

ZmListView.prototype._getActionMenuForColHeader = function(force, parent, context) {

	var menu;
	if (!this._colHeaderActionMenu || force) {
		// create an action menu for the header list
		menu = new ZmPopupMenu(parent || this);
		var actionListener = this._colHeaderActionListener.bind(this);
		for (var i = 0; i < this._headerList.length; i++) {
			var hCol = this._headerList[i];
			// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
			if (hCol._width) {
				var id = ZmId.getMenuItemId([ this._view, context ].join("_"), hCol._field);
				var mi = menu.createMenuItem(id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
				mi.setData(ZmListView.KEY_ID, hCol._id);
				mi.setChecked(hCol._visible, true);
                if (hCol._noRemove) {
					mi.setEnabled(false);
				}
				menu.addSelectionListener(id, actionListener);
			}
		}
	}

	return menu;
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
ZmListView.prototype.getToolTipContent = function(ev) {

	var div = this.getTargetItemDiv(ev);
	if (!div) {
        return "";
    }
	var target = Dwt.findAncestor(this._getEventTarget(ev), "id"),
	    id = (target && target.id) || div.id;

	if (!id) {
        return "";
    }

	// check if we're hovering over a column header
	var data = this._data[div.id];
	var type = data.type;
	var tooltip;
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var itemIdx = data.index;
		var field = this._headerList[itemIdx]._field;
		tooltip = this._getHeaderToolTip(field, itemIdx);
	}
    else {
		var match = this._parseId(id);
		if (match && match.field) {
			var item = this.getItemFromElement(div);
			var params = {field:match.field, item:item, ev:ev, div:div, match:match};
			tooltip = this._getToolTip(params);
		}
	}

	return tooltip;
};

ZmListView.prototype.getTooltipBase =
function(hoverEv) {
	return hoverEv ? DwtUiEvent.getTargetWithProp(hoverEv.object, "id") : DwtListView.prototype.getTooltipBase.apply(this, arguments);
};

ZmListView.prototype._getHeaderToolTip =
function(field, itemIdx, isOutboundFolder) {

	var tooltip = null;
	var sortable = this._headerList[itemIdx]._sortable;
	if (field == ZmItem.F_SELECTION) {
		tooltip = ZmMsg.selectionColumn;
	} else if (field == ZmItem.F_FLAG) {
        tooltip = ZmMsg.flagHeaderToolTip;
    } else if (field == ZmItem.F_PRIORITY){
        tooltip = ZmMsg.priorityHeaderTooltip;
    } else if (field == ZmItem.F_TAG) {
        tooltip = ZmMsg.tag;
    } else if (field == ZmItem.F_ATTACHMENT) {
        tooltip = ZmMsg.attachmentHeaderToolTip;
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
    } else if (field == ZmItem.F_MSG_PRIORITY) {
		tooltip = ZmMsg.messagePriority
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
    var tooltip, field = params.field, item = params.item, div = params.div;
	if (field == ZmItem.F_FLAG) {
		return null; //no tooltip for the flag
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
    } else if (div && (field == ZmItem.F_DATE)) {
        tooltip = this._getDateToolTip(item, div);
    }
    return tooltip;
};

/*
 * Get the list of fields for the accessibility label. Normally, this
 * corresponds to the header columns.
 *
 * @protected
 */
ZmListView.prototype._getLabelFieldList =
function() {
	var headers = this._getHeaderList();

	if (headers) {
		return AjxUtil.map(headers, function(header) {
			return header._field;
		});
	}
};

/*
 * Get the accessibility label corresponding to the given field.
 *
 * @protected
 */
ZmListView.prototype._getLabelForField =
function(item, field) {
	var tooltip = this._getToolTip({ item: item, field: field });
	// TODO: fix for tooltips that are callbacks (such as for appts)
	return AjxStringUtil.stripTags(tooltip);
};

ZmListView.prototype._updateLabelForItem =
function(item) {
	var fields = this._getLabelFieldList();
	var itemel = this._getElFromItem(item);

	if (!item || !fields || !itemel) {
		return;
	}

	var buf = [];

	for (var i = 0; i < fields.length; i++) {
		var label = this._getLabelForField(item, fields[i]);

		if (label) {
			buf.push(label);
		}
	}

	if (buf.length > 0) {
		itemel.setAttribute('aria-label', buf.join(', '));
	} else {
		itemel.removeAttribute('aria-label');
	}
};

ZmListView.prototype._getTagToolTip =
function(item) {
	if (!item) { return; }
	var numTags = item.tags && item.tags.length;
	if (!numTags) { return; }
	var tagList = appCtxt.getAccountTagList(item);
	var tags = item.tags;
	var html = [];
	var idx = 0;
    for (var i = 0; i < numTags; i++) {
		var tag = tagList.getByNameOrRemote(tags[i]);
        if (!tag) { continue; }        
		var nameText = tag.notLocal ? AjxMessageFormat.format(ZmMsg.tagNotLocal, tag.name) : tag.name;
        html[idx++] = "<table><tr><td>";
		html[idx++] = AjxImg.getImageHtml(tag.getIconWithColor());
		html[idx++] = "</td><td valign='middle'>";
		html[idx++] = AjxStringUtil.htmlEncode(nameText);
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
	var target = this._getEventTarget(ev);
	var id = (target && target.id && target.id.indexOf("AjxImg") == -1) ? target.id : clickedEl.id;
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
	var target = this._getEventTarget(ev);
	var id = (target && target.id && target.id.indexOf("AjxImg") == -1) ? target.id : clickedEl.id;
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

ZmListView.prototype._redoSearch =
function(callback) {
	var search = this._controller._currentSearch;
	if (!search) {
		return;
	}
	var sel = this.getSelection();
	var selItem = sel && sel[0];
	var changes = {
		isRedo: true,
		selectedItem: selItem
	};
	appCtxt.getSearchController().redoSearch(search, false, changes, callback);
};

ZmListView.prototype._sortColumn = function(columnItem, bSortAsc, callback) {

	// change the sort preference for this view in the settings
	var sortBy;
	switch (columnItem._sortable) {
		case ZmItem.F_FROM:		    sortBy = bSortAsc ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC; break;
        case ZmItem.F_TO:           sortBy = bSortAsc ? ZmSearch.RCPT_ASC : ZmSearch.RCPT_DESC; break;
		case ZmItem.F_NAME:		    sortBy = bSortAsc ? ZmSearch.SUBJ_ASC : ZmSearch.SUBJ_DESC; break; //used for Briefcase only now. SUBJ is mappaed to the filename of the document on the server side
		case ZmItem.F_SUBJECT:	    sortBy = bSortAsc ? ZmSearch.SUBJ_ASC : ZmSearch.SUBJ_DESC;	break;
		case ZmItem.F_DATE:		    sortBy = bSortAsc ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;	break;
		case ZmItem.F_SIZE:		    sortBy = bSortAsc ? ZmSearch.SIZE_ASC : ZmSearch.SIZE_DESC;	break;
        case ZmItem.F_FLAG:		    sortBy = bSortAsc ? ZmSearch.FLAG_ASC : ZmSearch.FLAG_DESC;	break;
        case ZmItem.F_ATTACHMENT:   sortBy = bSortAsc ? ZmSearch.ATTACH_ASC : ZmSearch.ATTACH_DESC; break;
		case ZmItem.F_READ:		    sortBy = bSortAsc ? ZmSearch.READ_ASC : ZmSearch.READ_DESC;	break;
        case ZmItem.F_PRIORITY:     sortBy = bSortAsc ? ZmSearch.PRIORITY_ASC : ZmSearch.PRIORITY_DESC; break;
		case ZmItem.F_SORTED_BY:    sortBy = bSortAsc ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;	break;
	}

	if (sortBy) {
		this._currentSortColId = columnItem._sortable;
		//special case - switching from read/unread to another sort column - remove it from the query, so users are not confused that they still see only unread messages after clicking on another sort column.
		if (columnItem._sortable != ZmItem.F_READ && (this._sortByString == ZmSearch.READ_ASC || this._sortByString == ZmSearch.READ_DESC)) {
			var controller = this._controller;
			var query = controller.getSearchString();
			if (query) {
				 controller.setSearchString(AjxStringUtil.trim(query.replace("is:unread", "")));
			}
		}
		this._sortByString = sortBy;
		var skipFirstNotify = this._folderId ? true : false; //just making it explicit boolean
        if (!appCtxt.isExternalAccount()) {
			var settings = appCtxt.getSettings();
           	appCtxt.set(ZmSetting.SORTING_PREF,
					   sortBy,
					   this.view,
					   false, //setDefault
					   skipFirstNotify, //skipNotify
					   null, //account
					   settings && !settings.persistImplicitSortPrefs(this.view)); //skipImplicit
            if (this._folderId) {
                appCtxt.set(ZmSetting.SORTING_PREF, sortBy, this._folderId);
            }
        }
		if (!this._isMultiColumn) {
			this._setSortedColStyle(columnItem._id);
		}
	}
	if (callback) {
		callback.run();
	}
};

ZmListView.prototype._setNextSelection =
function(item, forceSelection) {
	// set the next appropriate selected item
	if (this.firstSelIndex < 0) {
		this.firstSelIndex = 0;
	}
	if (this._list && !item) {
		item = this._list.get(this.firstSelIndex) || this._list.getLast();
    }
	if (item) {
		this.setSelection(item, false, forceSelection);
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
    if (!appCtxt.isExternalAccount() && !this._controller.isSearchResults) {
	    appCtxt.set(ZmSetting.LIST_VIEW_COLUMNS, value, appCtxt.getViewTypeFromId(this.view));
    }

	this._colHeaderActionMenu = this._getActionMenuForColHeader(true); // re-create action menu so order is correct
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
function(skipMoreCheck) {

	if (!skipMoreCheck) {
		var itemList = this.getItemList();
		if (!(itemList && itemList.hasMore()) || !this._list) { return 0; }
	}
	if (!this._rendered || !this._rowHeight) { return 0; }

	DBG.println(AjxDebug.DBG2, "List view: checking item count");

	var sbCallback = new AjxCallback(null, AjxTimedAction.scheduleAction, [new AjxTimedAction(this, this._resetColWidth), 100]);
	var params = {scrollDiv:	this._getScrollDiv(),
				  rowHeight:	this._rowHeight,
				  threshold:	this.getPagelessThreshold(),
				  limit:		this.getLimit(1),
				  listSize:		this._list.size(),
				  sbCallback:	sbCallback};
	return ZmListView.getRowsNeeded(params);
};

ZmListView.prototype._getScrollDiv =
function() {
	return this._parentEl;
};

ZmListView.getRowsNeeded =
function(params) {

	var div = params.scrollDiv;
	var sh = div.scrollHeight, st = div.scrollTop, rh = params.rowHeight;

	// view (porthole) height - everything measured relative to its top
	// prefer clientHeight since (like scrollHeight) it doesn't include borders
	var h = div.clientHeight || Dwt.getSize(div).y;

	// where we'd like bottom of list view to be (with extra hidden items at bottom)
	var target = h + (params.threshold * rh);

	// where bottom of list view is (including hidden items)
	var bottom = sh - st;

	if (bottom == h) {
		// handle cases where there's no scrollbar, but we have more items (eg tall browser, or replenishment)
		bottom = (params.listSize * rh) - st;
		if (st == 0 && params.sbCallback) {
			// give list view a chance to fix width since it may be getting a scrollbar
			params.sbCallback.run();
		}
	}

	var rowsNeeded = 0;
	if (bottom < target) {
		// buffer below visible bottom of list view is not full
		rowsNeeded = Math.max(Math.floor((target - bottom) / rh), params.limit);
	}
	return rowsNeeded;
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
		if (s.selected.length == 1) {
			//still a special case for now till we rewrite this thing.
			var el = this._getElFromItem(s.selected[0]); //terribly ugly, get back to the html element so i can have access to the item data
			s.singleItemChecked = this._getItemData(el, ZmListView.ITEM_CHECKED_ATT_NAME);
		}
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
function(state) {

	var s = state || this._state;
	if (s.selected && s.selected.length) {
		var dontCheck = s.selected.length == 1 && !s.singleItemChecked;
		this.setSelectedItems(s.selected, dontCheck);
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

ZmListView.prototype._renderList =
function(list, noResultsOk, doAdd) {
    var group = this._group;
    if (!group) {
        return DwtListView.prototype._renderList.call(this, list, noResultsOk, doAdd);
    }
	if (list instanceof AjxVector && list.size()) {
		var now = new Date();
		var size = list.size();
		var htmlArr = [];
        var section;
        var headerDiv;
		for (var i = 0; i < size; i++) {
			var item = list.get(i);
			var div = this._createItemHtml(item, {now:now}, !doAdd, i);
			if (div) {
				if (div instanceof Array) {
					for (var j = 0; j < div.length; j++){
                        section = group.addMsgToSection(item, div[j]);
                        if (group.getSectionSize(section) == 1){
                            headerDiv = this._getSectionHeaderDiv(group, section);
                            this._addRow(headerDiv);
                        }
						this._addRow(div[j]);
					}
				} else if (div.tagName || doAdd) {
                    section = group.addMsgToSection(item, div);
                    if (group.getSectionSize(section) == 1){
                        headerDiv = this._getSectionHeaderDiv(group, section);
                        this._addRow(headerDiv);
                    }
                    this._addRow(div);
				} else {
                    group.addMsgToSection(item, div);
				}
			}
		}
		if (group && !doAdd) {
			group.resetSectionHeaders();
			htmlArr.push(group.getAllSections(this._bSortAsc));
		}

		if (htmlArr.length && !doAdd) {
			this._parentEl.innerHTML = htmlArr.join("");
		}
	} else if (!noResultsOk) {
		this._setNoResultsHtml();
	}

};

ZmListView.prototype._addRow =
function(row, index) {
	DwtListView.prototype._addRow.apply(this, arguments);

	this._updateLabelForItem(this.getItemFromElement(row));
};

ZmListView.prototype._itemAdded = function(item) {
    item.refCount++;
};

ZmListView.prototype._getSectionHeaderDiv =
function(group, section) {
    if (group && section) {
        var headerDiv = document.createElement("div");
        var sectionTitle = group.getSectionTitle(section);
        var html = group.getSectionHeader(sectionTitle);
        headerDiv.innerHTML = html;
        return headerDiv.firstChild;
    }
};

ZmListView.prototype.deactivate =
function() {
	this._controller.inactive = true;
};

ZmListView.prototype._getEventTarget =
function(ev) {
	var target = ev && ev.target;
	if (target && (target.nodeName === "IMG" || (target.className && target.className.match(/\bImg/)))) {
		return target.parentNode;
	}
	return target;
};
