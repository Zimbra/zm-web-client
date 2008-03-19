/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmTaskListView = function(parent, controller, dropTgt) {
	var headerList = this._getHeaderList(parent);
	ZmListView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, ZmController.TASKLIST_VIEW, ZmItem.TASK, controller, headerList, dropTgt);
};

ZmTaskListView.prototype = new ZmListView;
ZmTaskListView.prototype.constructor = ZmTaskListView;


// Consts
ZmTaskListView.KEY_ID				= "_keyId";
ZmTaskListView.COL_WIDTH_STATUS		= 145;
ZmTaskListView.COL_WIDTH_PCOMPLETE	= 75;
ZmTaskListView.COL_WIDTH_DATE_DUE	= 75;


// Public Methods
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};

ZmTaskListView.prototype.setSize =
function(width, height) {
	ZmListView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

ZmTaskListView.prototype.setBounds =
function(x, y, width, height) {
	ZmListView.prototype.setBounds.call(this, x, y, width, height);
	this._resetColWidth();
};

ZmTaskListView.prototype.getLimit =
function() {
	// dont rely on page size being set (in case mail app is disabled)
	// at least until tasks app gets its own prefs page
	return (appCtxt.get(ZmSetting.PAGE_SIZE) || 25);
};

ZmTaskListView.prototype.saveNewTask =
function(keepFocus) {
	if (this._newTaskInputEl && Dwt.getVisibility(this._newTaskInputEl)) {
		var name = AjxStringUtil.trim(this._newTaskInputEl.value);
		if (name != "") {
			var respCallback = new AjxCallback(this, this._saveNewTaskResponse, [keepFocus]);
			this._controller.quickSave(name, respCallback);
		} else {
			this._saveNewTaskResponse(keepFocus);
		}
	}
};

ZmTaskListView.prototype._saveNewTaskResponse =
function(keepFocus) {
	if (keepFocus) {
		this._newTaskInputEl.value = "";
		this._newTaskInputEl.focus();
	} else {
		Dwt.setVisibility(this._newTaskInputEl, false);
	}
};

ZmTaskListView.prototype.discardNewTask =
function() {
	if (this._newTaskInputEl && Dwt.getVisibility(this._newTaskInputEl)) {
		this._newTaskInputEl.value = "";
		Dwt.setVisibility(this._newTaskInputEl, false);
		this.focus();
	}
};

ZmTaskListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

// Private Methods

ZmTaskListView.prototype._renderList =
function(list, noResultsOk) {
	// call base class first
	ZmListView.prototype._renderList.call(this, list, noResultsOk);

	// add custom row to allow user to quickly enter tasks from w/in listview
	var div = document.createElement("DIV");
	div.id = "_newTaskBannerId";

	var htmlArr = [];
	var idx = 0;

	htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100% class='newTaskBannerSep'><tr>";
	for (var i = 0; i < this._headerList.length; i++) {
		var hdr = this._headerList[i];
		if (!hdr._visible) { continue; }

		if (hdr._field == ZmItem.F_SUBJECT) {
			htmlArr[idx++] = "<td><div class='newTaskBanner' onclick='ZmTaskListView._handleOnClick(this)' id='";
			htmlArr[idx++] = Dwt.getNextId(); 									// bug: 17653 - for QA
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = ZmMsg.createNewTaskHint;
			htmlArr[idx++] = "</div></td>";
		} else {
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = hdr._width;
			htmlArr[idx++] = ">&nbsp;</td>";
		}
	}
	htmlArr[idx++] = "</tr></table>";
	div.innerHTML = htmlArr.join("");
	this._addRow(div, 0);
};

ZmTaskListView.prototype._resetListView =
function() {
	// explicitly remove each child (setting innerHTML causes mem leak)
	var cDiv;
	while (this._parentEl.hasChildNodes()) {
		if (this._parentEl.lastChild.id == "_newTaskBannerId") { break; }
		cDiv = this._parentEl.removeChild(this._parentEl.lastChild);
		this._data[cDiv.id] = null;
	}
	this._selectedItems.removeAll();
	this._rightSelItems = null;
};

ZmTaskListView.prototype._getCellId =
function(item, field) {
	return (field == ZmItem.F_PRIORITY) ? this._getFieldId(item, field) : null;
};

ZmTaskListView.prototype._getCellContents =
function(htmlArr, idx, task, field, colIdx, params) {

	if (field == ZmItem.F_SELECTION) {
		var icon = params.bContained ? "TaskCheckboxCompleted" : "TaskCheckbox";
		idx = this._getImageHtml(htmlArr, idx, icon, this._getFieldId(task, field));

	} else if (field == ZmItem.F_PRIORITY) {
		htmlArr[idx++] = "<center>";
		htmlArr[idx++] = ZmCalItem.getImageForPriority(task, params.fieldId);
		htmlArr[idx++] = "</center>";

	} else if (params.isMixedView && (field == ZmItem.F_FROM)) {
		htmlArr[idx++] = task.organizer || "&nbsp";

	} else if (field == ZmItem.F_SUBJECT) {
		if (params.isMixedView) {
			htmlArr[idx++] = task.name ? AjxStringUtil.htmlEncode(task.name, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
		} else {
			htmlArr[idx++] = AjxStringUtil.htmlEncode(task.getName(), true);
		}

	} else if (field == ZmItem.F_STATUS) {
		htmlArr[idx++] = ZmCalItem.getLabelForStatus(task.status);

	} else if (field == ZmItem.F_PCOMPLETE) {	// percent complete
		htmlArr[idx++] = task.pComplete || 0;
		htmlArr[idx++] = "%";

	} else if (field == ZmItem.F_DATE) {
		// due date - dont call base class since we *always* want to show date (not time)
		htmlArr[idx++] = task.endDate != null
			? AjxDateUtil.simpleComputeDateStr(task.endDate)
			: "&nbsp;";
	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	
	return idx;
};

ZmTaskListView.prototype._getActionMenuForColHeader =
function() {
	if (!this._colHeaderActionMenu) {
		// create a action menu for the header list
		this._colHeaderActionMenu = new ZmPopupMenu(this);
		var actionListener = new AjxListener(this, this._colHeaderActionListener);
		for (var i = 0; i < this._headerList.length; i++) {
			var hCol = this._headerList[i];
			var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
			mi.setData(ZmTaskListView.KEY_ID, hCol._id);
			mi.setChecked(true, true);
			if (hCol._noRemove) {
				mi.setEnabled(false);
			}
			this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
		}
	}
	return this._colHeaderActionMenu;
};

ZmTaskListView.prototype._getHeaderToolTip =
function(field, itemIdx) {
	switch (field) {
		case ZmItem.F_PRIORITY: 	return ZmMsg.priority;
		case ZmItem.F_STATUS:		return ZmMsg.status;
		case ZmItem.F_PCOMPLETE:	return ZmMsg.percentComplete;
		case ZmItem.F_DATE:			return ZmMsg.dateDue;
	}
	return ZmListView.prototype._getHeaderToolTip.call(this, field, itemIdx);
};

ZmTaskListView.prototype._sortColumn =
function(columnItem, bSortAsc) {
	// change the sort preference for this view in the settings
	var sortBy;
	switch (columnItem._sortable) {
		case ZmItem.F_SUBJECT:		sortBy = bSortAsc ? ZmSearch.SUBJ_ASC : ZmSearch.SUBJ_DESC; break;
		case ZmItem.F_STATUS:		sortBy = bSortAsc ? ZmSearch.STATUS_ASC : ZmSearch.STATUS_DESC; break;
		case ZmItem.F_PCOMPLETE:	sortBy = bSortAsc ? ZmSearch.PCOMPLETE_ASC : ZmSearch.PCOMPLETE_DESC; break;
		case ZmItem.F_DATE:			sortBy = bSortAsc ? ZmSearch.DUE_DATE_ASC : ZmSearch.DUE_DATE_DESC;	break;
	}

	if (sortBy) {
		this._sortByString = sortBy;
		appCtxt.set(ZmSetting.SORTING_PREF, sortBy, this.view);
	}

	if (this.getList().size() > 1 && this._sortByString) {
		var searchString = this._controller.getSearchString();
		var params = {query:searchString, types:[ZmItem.TASK], sortBy:this._sortByString, limit:this.getLimit()};
		appCtxt.getSearchController().search(params);
	}
};

ZmTaskListView.prototype._handleNewTaskClick =
function(el) {
	if (!this._newTaskInputEl) {
		this._newTaskInputEl = document.createElement("INPUT");
		this._newTaskInputEl.type = "text";
		this._newTaskInputEl.className = "InlineWidget";
		this._newTaskInputEl.style.position = "absolute";
		this._newTaskInputEl.id = Dwt.getNextId();								// bug: 17653 - for QA

		Dwt.setHandler(this._newTaskInputEl, DwtEvent.ONBLUR, ZmTaskListView._handleOnBlur);
		Dwt.setHandler(this._newTaskInputEl, DwtEvent.ONKEYPRESS, ZmTaskListView._handleKeyPress);
		this.shell.getHtmlElement().appendChild(this._newTaskInputEl);

		var bounds = Dwt.getBounds(el);
		Dwt.setBounds(this._newTaskInputEl, bounds.x, bounds.y, bounds.width, bounds.height);
	} else {
		this._newTaskInputEl.value = "";
	}
	Dwt.setVisibility(this._newTaskInputEl, true);
	this._newTaskInputEl.focus();
};


ZmTaskListView.prototype._handleColHeaderResize =
function(ev) {
	ZmListView.prototype._handleColHeaderResize(this, ev);
	this._newTaskInputEl = null;
};

ZmTaskListView.prototype._getHeaderList =
function(parent) {

	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_SELECTION, null, "TaskCheckbox", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.selection));
	}
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmItem.F_TAG, null, "Tag", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmItem.F_PRIORITY, null, "TaskHigh", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.priority));
	hList.push(new DwtListHeaderItem(ZmItem.F_ATTACHMENT, null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));
	hList.push(new DwtListHeaderItem(ZmItem.F_SUBJECT, ZmMsg.subject, null, null, ZmItem.F_SUBJECT, null, null, null, null, true));
	hList.push(new DwtListHeaderItem(ZmItem.F_STATUS, ZmMsg.status, null, ZmTaskListView.COL_WIDTH_STATUS, ZmItem.F_STATUS));
	hList.push(new DwtListHeaderItem(ZmItem.F_PCOMPLETE, ZmMsg.pComplete, null, ZmTaskListView.COL_WIDTH_PCOMPLETE, ZmItem.F_PCOMPLETE));
	hList.push(new DwtListHeaderItem(ZmItem.F_DATE, ZmMsg.dateDue, null, ZmTaskListView.COL_WIDTH_DATE_DUE, ZmItem.F_DATE));

	return hList;
};


// Listeners

ZmTaskListView.prototype._changeListener =
function(ev) {
	if ((ev.type != this.type) && (ZmList.MIXED != this.type))
		return;

	var items = ev.getDetail("items");

	if (ev.event == ZmEvent.E_CREATE) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			// skip if this item does not belong in this list.
			var folderId = this._controller.getList().search.folderId;
			if (folderId && folderId != item.folderId)
				continue;

			if (this._list && this._list.contains(item)) // skip if we already have it
				continue;

			// add new item at the beg. of list view's internal list
			var idx = this._list && this._list.size() > 0 ? 1 : null;
			this.addItem(item, idx);
		}
	} else if (ev.event == ZmEvent.E_MODIFY) {
		var task = items[0];
		var div = this._getElFromItem(task);
		if (div) {
			var bContained = this._selectedItems.contains(div);
			this._createItemHtml(task, {now:this._now, div:div, bContained:bContained});
			this.associateItemWithElement(task, div, DwtListView.TYPE_LIST_ITEM);
		}
	} else if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		for (var i = 0; i < items.length; i++) {
			this.removeItem(items[i], true);
		}
		this._controller._app._checkReplenishListView = this;
		this._controller._resetToolbarOperations();
	} else {
		ZmListView.prototype._changeListener.call(this, ev);
	}

	if (ev.event == ZmEvent.E_CREATE ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.E_MOVE)
	{
		this._resetColWidth();
	}
};

ZmTaskListView.prototype._colHeaderActionListener =
function(ev) {
	var menuItemId = ev.item.getData(ZmTaskListView.KEY_ID);

	for (var i = 0; i < this._headerList.length; i++) {
		var col = this._headerList[i];
		if (col._id == menuItemId) {
			col._visible = !col._visible;
			break;
		}
	}

	this._relayout();
};


// Static Methods

ZmTaskListView._handleOnClick =
function(div) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var tlv = appCtxt.getApp(ZmApp.TASKS).getTaskListController().getCurrentView();
	tlv._handleNewTaskClick(div);
};

ZmTaskListView._handleOnBlur =
function(ev) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var tlv = appCtxt.getApp(ZmApp.TASKS).getTaskListController().getCurrentView();
	tlv.saveNewTask();
};

ZmTaskListView._handleKeyPress =
function(ev) {
	var key = DwtKeyEvent.getCharCode(ev);

	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var tlv = appCtxt.getApp(ZmApp.TASKS).getTaskListController().getCurrentView();

	if (key == DwtKeyEvent.KEY_ENTER) {
		tlv.saveNewTask(true);
	} else if (key == DwtKeyEvent.KEY_ESCAPE) {
		tlv.discardNewTask();
	}
};
