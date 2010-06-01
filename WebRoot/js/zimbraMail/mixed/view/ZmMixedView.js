/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmMixedView = function(params) {

	params.headerList = this._getHeaderList(parent);
	params.view = ZmId.VIEW_MIXED;
	params.type = ZmItem.MIXED;
	ZmListView.call(this, params);
	this._mixedController = params.controller;
};

ZmMixedView.prototype = new ZmListView;
ZmMixedView.prototype.constructor = ZmMixedView;

// Consts
ZmMixedView.COLWIDTH_ICON 			= 19;
ZmMixedView.COLWIDTH_FROM 			= ZmMsg.COLUMN_WIDTH_FROM_CLV;
ZmMixedView.COLWIDTH_DATE 			= ZmMsg.COLUMN_WIDTH_DATE;

// Stuff to support the use of type-based list view classes

// List view class
ZmMixedView.LV_CLASS = {};
ZmMixedView.LV_CLASS[ZmItem.CONTACT]		= "ZmContactSimpleView";
ZmMixedView.LV_CLASS[ZmItem.GROUP]			= "ZmContactSimpleView";
ZmMixedView.LV_CLASS[ZmItem.CONV]			= "ZmConvListView";
ZmMixedView.LV_CLASS[ZmItem.MSG]			= "ZmMailMsgListView";
ZmMixedView.LV_CLASS[ZmItem.APPT]			= "ZmCalListView";
ZmMixedView.LV_CLASS[ZmItem.TASK]			= "ZmTaskListView";
ZmMixedView.LV_CLASS[ZmItem.PAGE]			= "ZmFileListView";
ZmMixedView.LV_CLASS[ZmItem.BRIEFCASE_ITEM]	= "ZmDetailListView";

// support functions for _createItemHtml
ZmMixedView.LV_FUNCS = ["_addParams", "_getDiv", "_getDivClass", "_getTable",
						"_getRow", "_getRowClass", "_getRowId", "_getCell", "_getCellId",
						"_getCellClass", "_getCellAttrText", "_getCellContents",
						"_getFieldId"];

// functions particular to certain types
ZmMixedView.LV_ADDED_FUNCS = {};
ZmMixedView.LV_ADDED_FUNCS[ZmItem.CONV]	= ["_getFragmentSpan", "_getFragmentHtml", "_getStyleViaZimlet",
										   "_getParticipantHtml", "_fitParticipants", "_isOutboundFolder"];
ZmMixedView.LV_ADDED_FUNCS[ZmItem.MSG]	= ["_getFragmentSpan", "_getFragmentHtml", "_getStyleViaZimlet",
										   "_isOutboundFolder"];

ZmMixedView.LV_FUNCS_TT = {};
ZmMixedView.LV_FUNCS_TT[ZmItem.CONV]	= ["_getParticipantToolTip", "_handleResponseGetContact"];
ZmMixedView.LV_FUNCS_TT[ZmItem.MSG]		= ["_getParticipantToolTip", "_handleResponseGetContact"];

ZmMixedView.prototype.toString = 
function() {
	return "ZmMixedView";
};

ZmMixedView.prototype.set =
function(list, sortField) {
	ZmListView.prototype.set.call(this, list, sortField);

	// The mixed list of items doesn't handle notifications.
	// We need to add listeners to each of the lists that 
	// owns items in the mixed array...
	var items = list.getArray();
	var owners = {};
	for (var i = 0; i < items.length; i++) {
		var list = items[i].list;
		if (list) {
			owners[list.type] = list;
		}
	}
	for (var type in owners) {
		owners[type].addChangeListener(this._listChangeListener);
	}
};

ZmMixedView.prototype._getHeaderList =
function(parent) {

	var hList = [];

	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_SELECTION, icon:"CheckboxUnchecked", width:ZmMixedView.COLWIDTH_ICON}));
	}

	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem({field:ZmItem.F_TAG, icon:"Tag", width:ZmMixedView.COLWIDTH_ICON}));
	}

	hList.push(new DwtListHeaderItem({field:ZmItem.F_TYPE, icon:"Globe", width:ZmMixedView.COLWIDTH_ICON}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_FROM, text:ZmMsg.from, width:ZmMixedView.COLWIDTH_FROM, resizeable:true}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_ATTACHMENT, icon:"Attachment", width:ZmMixedView.COLWIDTH_ICON}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject, resizeable:true}));
	hList.push(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.date, width:ZmMixedView.COLWIDTH_DATE}));

	return hList;
};

/**
 * Let the main view for the given item handle creating the HTML for it.
 * We also need to make sure any functions called by DwtListView::_createItemHtml
 * come from the right class. Since there might not be an instance of the right
 * list view class around, we call its prototype directly.
 */
ZmMixedView.prototype._createItemHtml =
function(item, params) {

	params = params || {};
	params.isMixedView = true;
	AjxDispatcher.require(ZmMixedController.PKGS[item.type]);
	var listViewClass = window[ZmMixedView.LV_CLASS[item.type]];
	var funcs = ZmMixedView.LV_FUNCS.concat(ZmMixedView.LV_ADDED_FUNCS[item.type]);
	this._emulateListView(listViewClass, funcs);

	return listViewClass.prototype._createItemHtml.call(this, item, params);
};

/**
 * Copy function pointers from appropriate class to this one, making this class
 * act like that one.
 *
 * @param listViewClass		[function]		source of list view functions
 * @param funcs				[array]			list of functions to copy
 */
ZmMixedView.prototype._emulateListView =
function(listViewClass, funcs) {

	if (!(funcs && funcs.length)) { return; }
	for (var i = 0; i < funcs.length; i++) {
		var funcName = funcs[i];
		ZmMixedView.prototype[funcName] = listViewClass.prototype[funcName];
	}
};

ZmMixedView.prototype._getHeaderToolTip =
function(field, itemIdx) {
	return (field == ZmItem.F_TYPE)	? ZmMsg.itemType : ZmListView.prototype._getHeaderToolTip.apply(this, arguments);
};

ZmMixedView.prototype._getToolTip =
function(params) {

	var tooltip, field = params.field, item = params.item;
	if (field == ZmItem.F_TYPE) {
		tooltip = ZmMsg[ZmItem.MSG_KEY[item.type]];
	} else {
		var listViewClass = window[ZmMixedView.LV_CLASS[item.type]];
		this._emulateListView(listViewClass, ZmMixedView.LV_FUNCS_TT[item.type]);
		// some views hand off to their controllers
		this._controller = this._mixedController._getListController(item.type);
		tooltip = listViewClass.prototype._getToolTip.apply(this, arguments);
		this._controller = this._mixedController;
	}
	return tooltip;
};

ZmMixedView.prototype._changeListener =
function(ev) {

	if (appCtxt.getAppViewMgr().getCurrentViewId() != this.view) { return; }

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		var items = ev.getDetail("items");
		for (var i = 0; i < items.length; i++) {
			// remove from controller's list
			this._controller.getList().remove(items[i]);
		}
	}

	// call base class last
	ZmListView.prototype._changeListener.call(this, ev);
};
