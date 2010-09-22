/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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


ZmDumpsterDialog.VIEW_DUMPSTER = "dumpster";


ZmDumpsterDialog.prototype.toString =
function() {
	return "ZmDumpsterDialog";
};

ZmDumpsterDialog.prototype.popup =
function() {
	var dumpster = appCtxt.getById(ZmFolder.ID_TRASH); // XXX: change me.

	var params = {
		query: dumpster.createQuery(),
		searchFor: ZmId.SEARCH_MAIL,    // only mail for now
		types: [ZmItem.MSG],            // restrict to messages only
		sortBy: ZmSearch.DATE_DESC,
		noRender: true,
		callback: (new AjxCallback(this._controller, this._controller.show))
	};

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
	var params = {
		parent: parent,
		controller: controller,
		pageless: true,
		view: ZmDumpsterDialog.VIEW_DUMPSTER,
		headerList: this._getHeaderList(),
		type: ZmItem.MSG,
		parentElement: (parent._htmlElId + "_listview")
	};

	ZmListView.call(this, params);

	this._listChangeListener = new AjxListener(this, this._changeListener);
};

ZmDumpsterListView.prototype = new ZmListView;
ZmDumpsterListView.prototype.constructor = ZmDumpsterListView;

ZmDumpsterListView.prototype.toString =
function() {
	return "ZmDumpsterListView";
};

ZmDumpsterListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmItem.F_FROM, text:ZmMsg.from, width:ZmMsg.COLUMN_WIDTH_FROM_MLV})),
		(new DwtListHeaderItem({field:ZmItem.F_SUBJECT, text:ZmMsg.subject})),
		(new DwtListHeaderItem({field:ZmItem.F_DATE, text:ZmMsg.received, width:ZmMsg.COLUMN_WIDTH_DATE}))
	];
};

ZmDumpsterListView.prototype._getCellContents =
function(htmlArr, idx, msg, field, colIdx, params) {
	if (field == ZmItem.F_FROM) {
		var fromAddr = msg.getAddress(AjxEmailAddress.FROM);
		if (fromAddr) {
			htmlArr[idx++] = "<span style='white-space:nowrap'>";
			var name = fromAddr.getName() || fromAddr.getDispName() || fromAddr.getAddress();
			htmlArr[idx++] = AjxStringUtil.htmlEncode(name);
			htmlArr[idx++] = "</span>";
		}
	}
	else if (field == ZmItem.F_SUBJECT) {
		var subj = msg.subject || ZmMsg.noSubject;
		htmlArr[idx++] = AjxStringUtil.htmlEncode(subj);
	}
	else {
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
function(results) {
	var searchResults = results.getResponse();
	var view = ZmDumpsterDialog.VIEW_DUMPSTER;

	// call base class
	ZmListController.prototype.show.call(this, searchResults, view);

	this._setup(view);

	var list = searchResults.getResults(searchResults.type);
	this.setList(list);
	this.setHasMore(searchResults.getAttribute("more"));
	this.getCurrentView().set(list);
};

ZmDumpsterListController.prototype.cleanup =
function() {
	this.getCurrentView().removeAll();
};

ZmDumpsterListController.prototype._getToolBarOps =
function() {
	return [ZmOperation.MOVE, ZmOperation.DELETE];
};

ZmDumpsterListController.prototype._createNewView =
function(view) {
	return (new ZmDumpsterListView(this._container, this));
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
	this._doDelete(this._listView[this._currentView].getSelection(), true);
};

