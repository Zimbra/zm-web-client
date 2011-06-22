/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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
 */

/**
 * Creates a dialog containing a listview of items that were (hard) deleted by
 * the user.
 * @class
 * This class represents a dumpster dialog.
 *
 * @param	{DwtComposite}	parent		the parent
 * @param	{String}	className		the class name
 *
 * @extends		ZmDialog
 */
ZmDumpsterDialog = function(parent, className) {

	var params = {
		parent: parent,
		className: (className || "ZmDumpsterDialog"),
		title: ZmMsg.recoverDeletedItems,
		standardButtons: [DwtDialog.CANCEL_BUTTON]
	};
	ZmDialog.call(this, params);

	this.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.close);

	this._controller = new ZmDumpsterListController(this);
};

ZmDumpsterDialog.prototype = new ZmDialog;
ZmDumpsterDialog.prototype.constructor = ZmDumpsterDialog;

ZmDumpsterDialog.prototype.toString =
function() {
	return "ZmDumpsterDialog";
};

ZmDumpsterDialog.prototype.popup =
function(searchFor, types) {
	types = (types && AjxUtil.toArray(types)) || [ZmItem.MSG];
	searchFor = searchFor || ZmId.SEARCH_ANY;
	var type = types[0];
	var params = {
		query: "is:anywhere",
		searchFor: searchFor,
		types: types,
		sortBy: ZmSearch.DATE_DESC,
		noRender: true,
		inDumpster: true,
		callback: new AjxCallback(this._controller, this._controller.show, [types])
	};
	this._controller.show(types, null); // Clear the list & set headers
	appCtxt.getSearchController().search(params);

	ZmDialog.prototype.popup.call(this);
};

ZmDumpsterDialog.prototype.popdown =
function() {
	ZmDialog.prototype.popdown.call(this);

	this._controller.cleanup();
};

ZmDumpsterDialog.prototype._contentHtml =
function() {
	return AjxTemplate.expand("share.Widgets#ZmDumpsterDialog", {id:this._htmlElId});
};

ZmDumpsterDialog.prototype._listSelectionListener =
function(ev) {
	var sel = this._listview.getSelection() || [];
	this._toolbar.enableAll((sel.length > 0));
};


/**
 * Listview showing deleted items
 *
 * @param parent
 */
ZmDumpsterListView = function(parent, controller) {
	if (!arguments.length) return;
	this._controller = controller;
	var params = {
		parent: parent,
		controller: controller,
		pageless: true,
		view: this._getViewId(),
		headerList: this._getHeaderList(),
		type: this._getType(),
		parentElement: (parent._htmlElId + "_listview")
	};
	this._type = this._getType();

	ZmListView.call(this, params);

	this._listChangeListener = new AjxListener(this, this._changeListener);
};

ZmDumpsterListView.prototype = new ZmListView;
ZmDumpsterListView.prototype.constructor = ZmDumpsterListView;

ZmDumpsterListView.prototype.toString =
function() {
	return "ZmDumpsterListView";
};
ZmDumpsterListView.prototype._getViewId =
function() {
	var type = this._getType();
	var appName = ZmItem.APP[type];
	return "dumpster" + appName;
};

ZmDumpsterListView.prototype._getCellId =
function(item, field) {
	return this._getFieldId(item, field);
};

ZmDumpsterListView.prototype._getType =
function() {
	throw "ZmDumpsterListView.prototype._getType must be overridden by all inheriting classes";
};

ZmDumpsterListView.createView = function(view, parent, controller) {
	var app = view.replace(/^dumpster/,"");
	switch (app) {
		case ZmApp.MAIL:
			return new ZmDumpsterMailListView(parent, controller);
		case ZmApp.CONTACTS:
			return new ZmDumpsterContactListView(parent, controller);
		case ZmApp.CALENDAR:
			return new ZmDumpsterCalendarListView(parent, controller);
		case ZmApp.TASKS:
			return new ZmDumpsterTaskListView(parent, controller);
		case ZmApp.BRIEFCASE:
			return new ZmDumpsterBriefcaseListView(parent, controller);
	}
};


/**
 * Listview showing deleted mail items
 *
 * @param parent
 * @param controller
 */
ZmDumpsterMailListView = function(parent, controller) {
	ZmDumpsterListView.call(this, parent, controller);
};

ZmDumpsterMailListView.prototype = new ZmDumpsterListView;
ZmDumpsterMailListView.prototype.constructor = ZmDumpsterMailListView;
ZmDumpsterMailListView.prototype.toString =
function() {
	return "ZmDumpsterMailListView";
};

ZmDumpsterMailListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_FROM, text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_MLV})),
		(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject})),
		(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.received, width:ZmMsg.COLUMN_WIDTH_DATE}))
	];
};

ZmDumpsterMailListView.prototype._getType =
function() {
	return ZmItem.MSG;
};

ZmDumpsterMailListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	var content;
	if (field == ZmItem.F_FROM) {
		var fromAddr = item.getAddress(AjxEmailAddress.FROM);
		if (fromAddr) {
			content = "<span style='white-space:nowrap'>";
			var name = fromAddr.getName() || fromAddr.getDispName() || fromAddr.getAddress();
			content += AjxStringUtil.htmlEncode(name);
			content += "</span>";
		}
	}
	else if (field == ZmItem.F_SUBJECT) {
		var subj = item.subject || ZmMsg.noSubject;
	
		content = AjxStringUtil.htmlEncode(subj);
	}
	if (content) {
		htmlArr[idx++] = content;
	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};

ZmDumpsterMailListView.prototype._getToolTip =
function(params) {
	return params.item.getFragment();
};


/**
 * Listview showing deleted contact items
 *
 * @param parent
 * @param controller
 */
ZmDumpsterContactListView = function(parent, controller) {
	ZmDumpsterListView.call(this, parent, controller);
};

ZmDumpsterContactListView.prototype = new ZmDumpsterListView;
ZmDumpsterContactListView.prototype.constructor = ZmDumpsterContactListView;
ZmDumpsterContactListView.prototype.toString =
function() {
	return "ZmDumpsterContactListView";
};

ZmDumpsterContactListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg.name})),
		(new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.email, width: 200}))
	];
};

ZmDumpsterContactListView.prototype._getType =
function() {
	return ZmItem.CONTACT;
};

ZmDumpsterContactListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	var content;
	if (field == ZmItem.F_NAME) {
		var name = ZmContact.computeFileAs(item);
		content = AjxStringUtil.htmlEncode(name);
	}
	else if (field == ZmItem.F_EMAIL) {
		var email = item.getEmail();
		content = email && AjxStringUtil.htmlEncode(email) || "&nbsp;";
	}
	if (content) {
		htmlArr[idx++] = content;
	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};


/**
 * Listview showing deleted calendar items
 *
 * @param parent
 * @param controller
 */
ZmDumpsterCalendarListView = function(parent, controller) {
	ZmDumpsterListView.call(this, parent, controller);
};

ZmDumpsterCalendarListView.prototype = new ZmDumpsterListView;
ZmDumpsterCalendarListView.prototype.constructor = ZmDumpsterCalendarListView;
ZmDumpsterCalendarListView.prototype.toString =
function() {
	return "ZmDumpsterCalendarListView";
};

ZmDumpsterCalendarListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject})),
		(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.date, width:ZmMsg.COLUMN_WIDTH_DATE_CAL}))
	];
};

ZmDumpsterCalendarListView.prototype._getType =
function() {
	return ZmItem.APPT;
};

ZmDumpsterCalendarListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	var content;
	if (field == ZmItem.F_SUBJECT) {
		var subj = item.name;
		content = AjxStringUtil.htmlEncode(subj);
	}
	else if (field == ZmItem.F_DATE) {
		content = item.startDate != null
			? AjxDateUtil.simpleComputeDateStr(item.startDate)
			: "&nbsp;";
	}
	if (content) {
		htmlArr[idx++] = content;
	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};

ZmDumpsterCalendarListView.prototype._getToolTip =
function(params) {
	return params.item.fragment;
};


/**
 * Listview showing deleted task items
 *
 * @param parent
 * @param controller
 */
ZmDumpsterTaskListView = function(parent, controller) {
	ZmDumpsterListView.call(this, parent, controller);
};

ZmDumpsterTaskListView.prototype = new ZmDumpsterListView;
ZmDumpsterTaskListView.prototype.constructor = ZmDumpsterTaskListView;
ZmDumpsterTaskListView.prototype.toString =
function() {
	return "ZmDumpsterTaskListView";
};

ZmDumpsterTaskListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject})),
		(new DwtListHeaderItem({field:ZmItem.F_STATUS, text:ZmMsg.status, width:ZmMsg.COLUMN_WIDTH_STATUS_TLV})),
		(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.date, width:ZmMsg.COLUMN_WIDTH_DATE_DUE_TLV}))
	];
};

ZmDumpsterTaskListView.prototype._getType =
function() {
	return ZmItem.TASK;
};

ZmDumpsterTaskListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	var content;
	if (field == ZmItem.F_SUBJECT) {
		var subj = item.name;
		content = AjxStringUtil.htmlEncode(subj);
	}
	else if (field == ZmItem.F_STATUS) {
		var status = item.status;
		content = ZmCalItem.getLabelForStatus(item.status);
	}
	else if (field == ZmItem.F_DATE) {
		content = item.endDate != null
			? AjxDateUtil.simpleComputeDateStr(item.endDate)
			: "&nbsp;";
	}
	if (content) {
		htmlArr[idx++] = content;
	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};

ZmDumpsterTaskListView.prototype._getToolTip =
function(params) {
	return params.item.fragment;
};


/**
 * Listview showing deleted briefcase items
 *
 * @param parent
 * @param controller
 */
ZmDumpsterBriefcaseListView = function(parent, controller) {
	ZmDumpsterListView.call(this, parent, controller);
};

ZmDumpsterBriefcaseListView.prototype = new ZmDumpsterListView;
ZmDumpsterBriefcaseListView.prototype.constructor = ZmDumpsterBriefcaseListView;
ZmDumpsterBriefcaseListView.prototype.toString =
function() {
	return "ZmDumpsterBriefcaseListView";
};

ZmDumpsterBriefcaseListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg.name})),
		(new DwtListHeaderItem({field:ZmItem.F_FILE_TYPE, text:ZmMsg.type, width:ZmMsg.COLUMN_WIDTH_TYPE_DLV})),
		(new DwtListHeaderItem({field:ZmItem.F_SIZE, text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_SIZE_DLV}))
	];
};

ZmDumpsterBriefcaseListView.prototype._getType =
function() {
	return ZmItem.BRIEFCASE_ITEM;
};

ZmDumpsterBriefcaseListView.prototype._getCellContents =
function(htmlArr, idx, item, field, colIdx, params) {
	var content;
	if (field == ZmItem.F_NAME) {
		var name = item.name;
		content = AjxStringUtil.htmlEncode(name);
	}
	else if (field == ZmItem.F_FILE_TYPE) {
		if (item.isFolder) {
		    content = ZmMsg.folder;
		} else {
		    var mimeInfo = item.contentType ? ZmMimeTable.getInfo(item.contentType) : null;
		    content = mimeInfo ? mimeInfo.desc : "&nbsp;";
		}
	}
	else if (field == ZmItem.F_SIZE) {
		var size = item.size;
		content = AjxUtil.formatSize(size);
	}
	
	if (content) {
		htmlArr[idx++] = content;
	} else {
		idx = ZmListView.prototype._getCellContents.apply(this, arguments);
	}
	return idx;
};


/**
 * Controller for the ZmDumpsterListView
 *
 * @param container		[DwtControl]	container this controller "controls"
 */
ZmDumpsterListController = function(container) {
	ZmListController.call(this, container, appCtxt.getApp(ZmApp.MAIL));
};

ZmDumpsterListController.prototype = new ZmListController;
ZmDumpsterListController.prototype.constructor = ZmDumpsterListController;

ZmDumpsterListController.prototype.toString =
function() {
	return "ZmDumpsterListController";
};

ZmDumpsterListController.prototype.show =
function(types, results) {
	this._appName = ZmItem.APP[types[0]]; // All types should be in the same app
	var view = "dumpster" + this._appName;
	for (var id in this._toolbar) {
		this._toolbar[id].setVisible(id == view);
	}
	for (var id in this._listView) {
		this._listView[id].setVisible(id == view);
	}
	if (results) {
		var searchResults = results.getResponse();
	
		// call base class
		ZmListController.prototype.show.call(this, searchResults, view);

		this._setup(view);

		var list = searchResults.getResults(searchResults.type);

		this.setList(list);
		this.setHasMore(searchResults.getAttribute("more"));
		this.getCurrentView().set(list);
	} else {
		this.cleanup();
	}
};

ZmDumpsterListController.prototype.cleanup =
function() {
	var currentView = this.getCurrentView();
	if (currentView) {
		currentView.removeAll();
	}
};

ZmDumpsterListController.prototype._getToolBarOps =
function() {
	return [ZmOperation.MOVE, ZmOperation.DELETE];
};

ZmDumpsterListController.prototype._createNewView =
function(view) {
	return ZmDumpsterListView.createView(view, this._container, this);
};

ZmDumpsterListController.prototype._setViewContents	=
function(view) {
	this._listView[view].set(this._list);
};

ZmDumpsterListController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) { return; }

	var tbParams = {
		parent: this._container,
		className: "ZmDumpsterDialog-toolbar",
		buttons: this._getToolBarOps(),
		posStyle: Dwt.RELATIVE_STYLE,
		context: view,
		controller: this,
		parentElement: (this._container._htmlElId + "_toolbar")
	};
	var tb = this._toolbar[view] = new ZmButtonToolBar(tbParams);
	tb.addSelectionListener(ZmOperation.MOVE, new AjxListener(this, this._moveListener));
	tb.addSelectionListener(ZmOperation.DELETE, new AjxListener(this, this._deleteListener));

	// change text of move button
	var button = tb.getButton(ZmOperation.MOVE);
	button.setText(ZmMsg.recoverTo);

	// change tooltip for delete button
	var button = tb.getButton(ZmOperation.DELETE);
	button.setToolTipContent(ZmMsg.permanentlyDelete);
};

ZmDumpsterListController.prototype._doMove =
function(items, folder, attrs, isShiftKey) {
	if (!attrs) {
		attrs = {};
	}
	attrs.op = "recover";
	attrs.l = folder.id;

	ZmListController.prototype._doMove.call(this, items, folder, attrs, isShiftKey);
};

ZmDumpsterListController.prototype._deleteListener =
function(ev) {
	var dialog = appCtxt.getOkCancelMsgDialog();
	dialog.reset();
	dialog.setMessage(ZmMsg.confirmItemDelete, DwtMessageDialog.WARNING_STYLE);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._deleteCallback, this, [dialog]);
	dialog.popup();
};

ZmDumpsterListController.prototype._deleteCallback =
function(dialog) {
	dialog.popdown();

	// hard delete
	this._doDelete(this._listView[this._currentView].getSelection(), true, {op:"dumpsterdelete"});
};

ZmDumpsterListController.prototype._getMoreSearchParams =
function(params) {
	params.inDumpster = true;
};

ZmDumpsterListController.prototype._getMoveParams =
function(dlg) {
	var params = ZmListController.prototype._getMoveParams.call(this, dlg);
	params.appName = this._appName;
	params.overviewId = dlg.getOverviewId(this._appName);
	params.treeIds = [ZmApp.ORGANIZER[this._appName]];
	params.acceptFolderMatch = true;
	params.showDrafts =	true;
	var omit = {};
	omit[ZmFolder.ID_SPAM] = true;
	params.omit = omit;
	return params;
};
