/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the task list view classes.
 */

/**
 * Creates the task list view.
 * @class
 * This class represents the task list view.
 * 
 * @param	{DwtComposite}	parent		the parent
 * @param	{ZmTaskController}		controller		the controller
 * @param	{DwtDropTarget}	dropTgt		the drop target	
 * 
 * @extends		ZmListView
 */
ZmTaskListView = function(parent, controller, dropTgt) {
	var headerList = this._getHeaderList(parent);
	var params = {parent:parent, posStyle:Dwt.ABSOLUTE_STYLE, view:ZmId.VIEW_TASKLIST, pageless:true,
				  type:ZmItem.TASK, controller:controller, headerList:headerList, dropTgt:dropTgt}
	ZmListView.call(this, params);
};

ZmTaskListView.prototype = new ZmListView;
ZmTaskListView.prototype.constructor = ZmTaskListView;


// Consts
ZmTaskListView.COL_WIDTH_STATUS		= ZmMsg.COLUMN_WIDTH_STATUS_TLV;
ZmTaskListView.COL_WIDTH_PCOMPLETE	= ZmMsg.COLUMN_WIDTH_PCOMPLETE_TLV;
ZmTaskListView.COL_WIDTH_DATE_DUE	= ZmMsg.COLUMN_WIDTH_DATE_DUE_TLV;

// Public Methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};

ZmTaskListView.prototype.setSize =
function(width, height) {
	ZmListView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

/**
 * Saves the new task.
 * 
 * @param	{Boolean}	keepFocus		if <code>true</code>, keep focus after the save
 */
ZmTaskListView.prototype.saveNewTask =
function(keepFocus) {
	if (this._newTaskInputEl && Dwt.getVisibility(this._newTaskInputEl)) {
		var name = AjxStringUtil.trim(this._newTaskInputEl.value);
		if (name != "") {
			var respCallback = new AjxCallback(this, this._saveNewTaskResponse, [keepFocus]);
            var errorCallback = new AjxCallback(this, this._handleNewTaskError);
			this._controller.quickSave(name, respCallback, errorCallback);
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

ZmTaskListView.prototype._handleNewTaskError =
function(ex) {
    if(ex) {
        this.discardNewTask();   
    }
};

ZmTaskListView.prototype.handleKeyAction =
function(actionCode, ev) {
	if (this._editing) {
		switch (actionCode) {
			case DwtKeyMap.SELECT_NEXT:		this.discardNewTask(); break;
			case DwtKeyMap.DBLCLICK:		break;
			default: DwtListView.prototype.handleKeyAction.call(this,actionCode,ev);
		}
	} else {
		DwtListView.prototype.handleKeyAction.call(this,actionCode,ev);
	}
};

/**
 * Discards the task.
 * 
 */
ZmTaskListView.prototype.discardNewTask =
function() {
	if (this._newTaskInputEl && Dwt.getVisibility(this._newTaskInputEl)) {
		this._newTaskInputEl.value = "";
		Dwt.setVisibility(this._newTaskInputEl, false);
		this.focus();
		this._editing =  false;
	}
};

/**
 * Gets the title.
 * 
 * @return	{String}		the title
 */
ZmTaskListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

// Private Methods

ZmTaskListView.prototype._renderList =
function(list, noResultsOk, doAdd) {
	// call base class first
	ZmListView.prototype._renderList.apply(this, arguments);
	if (doAdd) { return; }

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
			this.dId = Dwt.getNextId();
			htmlArr[idx++] = "<td><div class='newTaskBanner' onclick='ZmTaskListView._handleOnClick(this)' id='";
			htmlArr[idx++] = this.dId;	// bug: 17653 - for QA
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
		var icon = params.bContained ? "CheckboxChecked" : "CheckboxUnchecked";
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
        var formatter = new AjxMessageFormat(AjxMsg.percentageString);
		htmlArr[idx++] = formatter.format(task.pComplete || 0);
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
		var params = {
			query: this._controller.getSearchString(),
			queryHint: this._controller.getSearchStringHint(),
			types: [ZmItem.TASK],
			sortBy: this._sortByString,
			limit: this.getLimit()
		};
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
	this._editing =  true;
};


ZmTaskListView.prototype._handleColHeaderResize =
function(ev) {
	ZmListView.prototype._handleColHeaderResize.call(this, ev);
	this._newTaskInputEl = null;
};

ZmTaskListView.prototype._getHeaderList =
function(parent) {

	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_SELECTION, icon:"CheckboxUnchecked", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.selection}));
	}
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_TAG, icon:"Tag", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.tag}));
	}
	hList.push(new DwtListHeaderItem({field:ZmItem.F_PRIORITY, icon:"TaskHigh", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.priority}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_ATTACHMENT, icon:"Attachment", width:ZmListView.COL_WIDTH_ICON, name:ZmMsg.attachment}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject, sortable:ZmItem.F_SUBJECT, resizeable:true, noRemove:true}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_STATUS, text:ZmMsg.status, width:ZmTaskListView.COL_WIDTH_STATUS, resizeable:true, sortable:ZmItem.F_STATUS}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_PCOMPLETE, text:ZmMsg.pComplete, width:ZmTaskListView.COL_WIDTH_PCOMPLETE, sortable:ZmItem.F_PCOMPLETE}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.dateDue, width:ZmTaskListView.COL_WIDTH_DATE_DUE, sortable:ZmItem.F_DATE}));

	return hList;
};


// Listeners

ZmTaskListView.prototype._changeListener =
function(ev) {
	if ((ev.type != this.type) && (ZmList.MIXED != this.type))
		return;

	var items = ev.getDetail("items") || ev.items;
    items = AjxUtil.toArray(items);

	if (ev.event == ZmEvent.E_CREATE) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];

			// skip if this item does not belong in this list.
			var folderId = this._controller.getList().search.folderId;
			if (appCtxt.getById(folderId) &&
				appCtxt.getById(folderId).isRemote())
			{
				folderId = appCtxt.getById(folderId)._remoteId; //getRemoteId();
			}

			if (appCtxt.isOffline) {
				folderId = ZmOrganizer.getSystemId(folderId);
			}

			if (folderId && folderId != item.folderId) { continue; }			// does not belong to this folder
			if (this._list && this._list.contains(item)) { continue; }			// skip if we already have it

			// add new item at the beg. of list view's internal list
			var idx = this._list && this._list.size() > 0 ? 1 : null;
			this.addItem(item, idx, false, 0);
		}
	} else if (ev.event == ZmEvent.E_MODIFY) {
		var task = items[0];
		var div = this._getElFromItem(task);
		if (div) {
			var bContained = this._selectedItems.contains(div);
			this._createItemHtml(task, {div:div, bContained:bContained});
			this.associateItemWithElement(task, div);
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

    //Handle Create Notification
    if(ev.event == ZmEvent.E_MOVE){
        var folderId = this._controller._folderId || this.folderId || this._folderId;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if(item && item.folderId == folderId && this._getRowIndex(item) === null){
                this.addItem(item, null, true);
            }
        }
    }

	if (ev.event == ZmEvent.E_CREATE ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.E_MOVE)
	{
		this._resetColWidth();
	}
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

ZmTaskListView.prototype._selectItem =
function(next, addSelect, kbNavEvent) {
	if (!next) {
		var itemDiv = (this._kbAnchor)
		? this._getSiblingElement(this._kbAnchor, next)
		: this._parentEl.firstChild;
		if (itemDiv && itemDiv.id == "_newTaskBannerId") {
			document.getElementById(this.dId).onclick();
			return;
		}
	}
	DwtListView.prototype._selectItem.call(this,next,addSelect,kbNavEvent);
};

ZmTaskListView._handleKeyPress =
function(ev) {
	var key = DwtKeyEvent.getCharCode(ev);

	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var tlv = appCtxt.getApp(ZmApp.TASKS).getTaskListController().getCurrentView();

	if (key == DwtKeyEvent.KEY_ENTER) {
		tlv.saveNewTask(true);
	}
	else {
		// bug fix #31778 - down arrow and left paren. have same key code!
		var isDownArrow = (!AjxEnv.isIE)
			? (ev.charCode == 0 && ev.keyCode == 40) : false;
		if (key == DwtKeyEvent.KEY_ESCAPE || isDownArrow) {
			tlv.discardNewTask();
		}
	}
};
