/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
		standardButtons: [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]
	};
	ZmDialog.call(this, params);

	this.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.close);
	this.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.recoverTo);

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
	this._searchTypes = types ? AjxUtil.toArray(types) : [ZmItem.MSG];
	this._searchFor = searchFor;
	this.runSearchQuery("");

	ZmDialog.prototype.popup.call(this);
};

ZmDumpsterDialog.prototype.runSearchQuery =
function(query) {
	var types = this._searchTypes;
	var searchFor = this._searchFor;
	var params = {
		query: "-in:/Junk " + query, // Users don't want/need to recover deleted spam.
		searchFor: searchFor,
		types: types,
		sortBy: ZmSearch.DATE_DESC,
		noRender: true,
		inDumpster: true,
		skipUpdateSearchToolbar: true, //don't update the main app search toolbar. Otherwise the main app is updated to weird stuff like the mixed view of everything.
		callback: this._controller.show.bind(this._controller, [types])
	};
	this._controller.show(types, null); // Clear the list & set headers
	appCtxt.getSearchController().search(params);

};

ZmDumpsterDialog.prototype.popdown =
function() {
	ZmDialog.prototype.popdown.call(this);
	if (this._inputField) {
		this._inputField.clear(); //clear for next time
	}

	this._controller.cleanup();
};

ZmDumpsterDialog.prototype._contentHtml =
function() {
	this._inputContainerId = this._htmlElId + "_inputContainerId";
	this._searchButtonContainerId = this._htmlElId + "_searchButtonContainerId";
	return AjxTemplate.expand("share.Widgets#ZmDumpsterDialog", {id:this._htmlElId});
};

ZmDumpsterDialog.prototype._handleInputFieldKeyDown =
function(ev) {
	if (ev.keyCode == 13 || ev.keyCode == 3) {
		this._controller._searchListener();
	}
};

ZmDumpsterDialog.prototype._resetTabFocus =
function(){
	this._tabGroup.setFocusMember(this._inputField, true);
};

/**
 * adds non-standard elements to tab group.
 */
ZmDumpsterDialog.prototype._updateTabGroup =
function() {
	this._tabGroup.addMember(this._inputField);
	this._tabGroup.addMember(this._searchButton);
};

ZmDumpsterDialog.prototype._initializeSearchBar =
function(listener) {

	this._inputField = new DwtInputField({parent: this});
	this._inputField.addListener(DwtEvent.ONKEYUP, this._handleInputFieldKeyDown.bind(this));//this._controller._searchListener.bind(this._controller));

	document.getElementById(this._inputContainerId).appendChild(this._inputField.getHtmlElement());

	var el = document.getElementById(this._searchButtonContainerId);
	var params = {parent:this, parentElement:el, id: "searchDumpsterButton"};

	var button = this._searchButton = new DwtButton(params);
	button.setImage("Search");
	button.addSelectionListener(listener);
};

ZmDumpsterDialog.prototype.getSearchText =
function() {
	return this._inputField.getValue();
};

ZmDumpsterDialog.prototype._okButtonListener = function() {
	//check if list item is selected
	var listView = this._controller.getListView();
	if(!listView || listView.getSelectionCount() == 0) {
		return;
	}
	this._controller._moveListener();
}

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
		parentElement: (parent._htmlElId + "_listview"),
		className: "ZOptionsItemsListView DwtListView"
	};
	this._type = this._getType();

	ZmListView.call(this, params);

	this._listChangeListener = new AjxListener(this, this._changeListener);
	this.setScrollStyle(DwtControl.SCROLL); // auto scroll
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

ZmDumpsterListView.prototype._changeListener = function(ev) {
	ZmListView.prototype._changeListener.call(this, ev);
	var dialog = this.getController && this.getController()._container;
	dialog && dialog.getButton(DwtDialog.OK_BUTTON).setEnabled(this.getSelectionCount() > 0);
}

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
	return AjxStringUtil.htmlEncode(params.item.getFragment());
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
	this.setCurrentViewId(view);
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
		this._initializeSearchBar();
		this._container._updateTabGroup();
		this._container._inputField.getInputElement().focus(); //this is the only focus way I could get it to focus on the input element.

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
	//disable `Recover To` button
	this._container.getButton(DwtDialog.OK_BUTTON).setEnabled(false);
};

ZmDumpsterListController.prototype._createNewView =
function(view) {
	return ZmDumpsterListView.createView(view, this._container, this);
};

ZmDumpsterListController.prototype._setViewContents	=
function(view) {
	this._listView[view].set(this._list);
};

ZmDumpsterListController.prototype._searchListener =
function() {
	var dialog = this._container;
	var keywords = dialog.getSearchText();
	dialog.runSearchQuery(keywords);
};

ZmDumpsterListController.prototype._initializeSearchBar =
function() {
	if (this._searchBarInitialized) {
		return;
	}
	this._searchBarInitialized = true;
	var dialog = this._container;
	dialog._initializeSearchBar(this._searchListener.bind(this));
};

ZmDumpsterListController.prototype._getToolBarOps =
function() {
	return [];
}

ZmDumpsterListController.prototype._doMove =
function(items, folder, attrs, isShiftKey) {
	if (!attrs) {
		attrs = {};
	}
	attrs.op = "recover";
	attrs.l = folder.id;
	                                                                                                                                              		
	ZmListController.prototype._doMove.call(this, items, folder, attrs, isShiftKey, true);
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
	//bug:60237 remote folders should be excluded from the recovery folder selection
    var folderTree = appCtxt.getFolderTree();
	if (!folderTree) { return params; }
	var folders = folderTree.getByType(ZmApp.ORGANIZER[this._appName]);
	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
        if(folder.link && folder.isRemote()) {
          omit[folder.id] = true;
        }
	}
	params.omit = omit;
	return params;
};

ZmDumpsterListController.prototype._listSelectionListener =
function(ev) {
	var listView = this.getListView();
	this._container.getButton(DwtDialog.OK_BUTTON).setEnabled(listView.getSelectionCount() > 0);
}
