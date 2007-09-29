/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmCalendarTreeController(appCtxt, type, dropTgt) {
	
	type = type ? type : ZmOrganizer.CALENDAR;
	dropTgt = dropTgt ? dropTgt : null; //new DwtDropTarget(ZmAppt);
	
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.NEW_CALENDAR] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.CHECK_ALL] = new AjxListener(this, this._checkAllListener);
	this._listeners[ZmOperation.CLEAR_ALL] = new AjxListener(this, this._clearAllListener);

	this._listeners[ZmOperation.SHARE_CALENDAR] = new AjxListener(this, this._shareCalListener);
	this._listeners[ZmOperation.MOUNT_CALENDAR] = new AjxListener(this, this._mountCalListener);

	this._eventMgrs = {};
};

ZmCalendarTreeController.prototype = new ZmTreeController;
ZmCalendarTreeController.prototype.constructor = ZmCalendarTreeController;

ZmCalendarTreeController.prototype.toString = function() {
	return "ZmCalendarTreeController";
};

// Constants

ZmCalendarTreeController.COLOR_CLASSNAMES = [
	// NOTE: We use Gray instead of GrayBg so that it doesn't blend into background
	"OrangeBg", "BlueBg", "CyanBg", "GreenBg", "PurpleBg", "RedBg", "YellowBg", "PinkBg", "Gray"
];

// Public methods

ZmCalendarTreeController.prototype.getCheckedCalendars =
function(overviewId) {
	var calendars = [];
	var items = this._getItems(overviewId);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item._isSeparator) continue;
		if (item.getChecked()) {
			var calendar = item.getData(Dwt.KEY_OBJECT);
			calendars.push(calendar);
		}
	}

	return calendars;
};

ZmCalendarTreeController.prototype.addSelectionListener =
function(overviewId, listener) {
	// Each overview gets its own event manager
	if (!this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId] = new AjxEventMgr;
		// Each event manager has its own selection event to avoid
		// multi-threaded collisions
		this._eventMgrs[overviewId]._selEv = new DwtSelectionEvent(true);
	}
	this._eventMgrs[overviewId].addListener(DwtEvent.SELECTION, listener);
};

ZmCalendarTreeController.prototype.removeSelectionListener =
function(overviewId, listener) {
	if (this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId].removeListener(DwtEvent.SELECTION, listener);
	}
};

// Protected methods

ZmCalendarTreeController.prototype.show = 
function(overviewId, showUnread, omit, forceCreate) {
	var firstTime = (!this._treeView[overviewId] || forceCreate);

	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit, forceCreate);
	
	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
		var root = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
		root.showCheckBox(false);
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item._isSeparator) continue;
			var object = item.getData(Dwt.KEY_OBJECT);
			this._setTreeItemColor(item, object.color);
			item.setChecked(object.isChecked);
		}
	}
};

ZmCalendarTreeController.prototype.resetOperations = 
function(actionMenu, type, id) {
	if (actionMenu) {
		var overviewController = this._appCtxt.getOverviewController();
		var treeData = overviewController.getTreeData(ZmOrganizer.CALENDAR);
		var calendar = treeData.getById(id);
		actionMenu.enable(ZmOperation.SHARE_CALENDAR, !calendar.link);
		actionMenu.enable(ZmOperation.DELETE, id != ZmOrganizer.ID_CALENDAR);
		actionMenu.enable(ZmOperation.SYNC, calendar.isFeed());
		if (id == ZmOrganizer.ID_ROOT) {
			var items = this._getItems(this._actionedOverviewId);
			var foundChecked = false;
			var foundUnchecked = false;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item._isSeparator) continue;
				item.getChecked() ? foundChecked = true : foundUnchecked = true;
			}
			actionMenu.enable(ZmOperation.CHECK_ALL, foundUnchecked);
			actionMenu.enable(ZmOperation.CLEAR_ALL, foundChecked);
		}
	}
};

// Returns a list of desired header action menu operations
ZmCalendarTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_CALENDAR ];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_CALENDAR);
	}
	ops.push(ZmOperation.CHECK_ALL, ZmOperation.CLEAR_ALL);
	return ops;
};

// Returns a list of desired action menu operations
ZmCalendarTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_CALENDAR);
	}
	ops.push(ZmOperation.DELETE, ZmOperation.EDIT_PROPS, ZmOperation.SYNC);
	return ops;
};

ZmCalendarTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.CHECKEDITEM_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmCalendarTreeController.prototype._itemClicked =
function() {
	// TODO
};

// Handles a drop event
ZmCalendarTreeController.prototype._dropListener =
function() {
	// TODO
};

/*
* Returns a "New Calendar" dialog.
*/
ZmCalendarTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewCalendarDialog();
};

// Listener callbacks

ZmCalendarTreeController.prototype._changeListener =
function(ev, treeView) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView);

	if (ev.type != this.type) return;
	
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var node = treeView.getTreeItemById(id);
		if (!node) continue;

		var fields = ev.getDetail("fields") || {};
		// NOTE: ZmTreeController#_changeListener re-inserts the node if the 
		//		 name changes so we need to reset the color in that case, too.
		if (ev.event == ZmEvent.E_CREATE || 
			(ev.event == ZmEvent.E_MODIFY && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]))) {
			var object = node.getData(Dwt.KEY_OBJECT);
			this._setTreeItemColor(node, object.color);
		}
		if (ev.event == ZmEvent.E_CREATE || (ev.event == ZmEvent.E_MODIFY && fields[ZmOrganizer.F_FLAGS])) {
			var app = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
			var controller = app.getCalController();
			controller._updateCheckedCalendars();
			controller._refreshAction(true);
		}
	}
};

ZmCalendarTreeController.prototype._treeViewListener =
function(ev) {
	// handle item(s) clicked
	if (ev.detail == DwtTree.ITEM_CHECKED) { 
		var overviewId = ev.item.getData(ZmTreeView.KEY_ID);
		var calendar = ev.item.getData(Dwt.KEY_OBJECT);

		// bug fix #6514 - Explicitly set checkbox for Safari
		// NOTE: this bug fix should be removed once Safari gets new version!
		if (AjxEnv.isSafari) {
			ev.item._checkBox.checked = !ev.item._checkBox.checked;
		}

		// notify listeners of selection
		if (this._eventMgrs[overviewId]) {
			this._eventMgrs[overviewId].notifyListeners(DwtEvent.SELECTION, ev);
		}
		return;
	}

	// default processing
	ZmTreeController.prototype._treeViewListener.call(this, ev);
};

ZmCalendarTreeController.prototype._checkAllListener =
function(ev) {
	this._setAllChecked(ev, true);
};

ZmCalendarTreeController.prototype._clearAllListener =
function(ev) {
	this._setAllChecked(ev, false);
};

ZmCalendarTreeController.prototype._shareCalListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	
	var calendar = this._pendingActionData;
	var share = null;
	
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, calendar, share);
};

ZmCalendarTreeController.prototype._mountCalListener =
function(ev) {
	var dialog = this._appCtxt.getMountFolderDialog();
	dialog.popup(ZmOrganizer.CALENDAR/*, ...*/);
};

ZmCalendarTreeController.prototype._deleteListener = function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var callback = new AjxCallback(this, this._deleteListener2, [ organizer ]);
	var message = AjxMessageFormat.format(ZmMsg.confirmDeleteCalendar, organizer.name);

	var dialog = this._appCtxt.getConfirmationDialog();
	dialog.popup(message, callback);
};
ZmCalendarTreeController.prototype._deleteListener2 = function(organizer) {
	this._doDelete(organizer);
}

/*
* Called when a "New Calendar" dialog is submitted. This override is necessary because we
* need to pass additional args to _doCreate().
*
* @param parent		[ZmFolder]	root calendar folder
* @param name		[string]	name of the new calendar
* @param color		[constant]	color
* @param url		[string]*	URL (if remote calendar)
* @param excludeFb	[boolean]*	if true, exclude free/busy info for this calendar
*/
ZmCalendarTreeController.prototype._newCallback =
function(parent, name, color, url, excludeFb) {
	this._doCreate(parent, name, color, url, excludeFb);
	this._getNewDialog().popdown();
};

ZmCalendarTreeController.prototype._doCreate =
function(parent, name, color, url, excludeFb) {
	parent.create(name, color, url, excludeFb);
};

ZmCalendarTreeController.prototype._notifyListeners =
function(overviewId, type, items, detail, srcEv, destEv) {
	if (this._eventMgrs[overviewId] && this._eventMgrs[overviewId].isListenerRegistered(type)) {
		if (srcEv) DwtUiEvent.copy(destEv, srcEv);
		destEv.items = items;
		if (items.length == 1) destEv.item = items[0];
		destEv.detail = detail;
		this._eventMgrs[overviewId].notifyListeners(type, destEv);
	}
};

ZmCalendarTreeController.prototype._getItems =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	if (treeView) {
		var root = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
		if (root)
			return root.getItems();
	}
	return [];
};

ZmCalendarTreeController.prototype._setTreeItemColor =
function(item, color) {
	var element = item.getHtmlElement();
	element.className = ZmCalendarTreeController.COLOR_CLASSNAMES[color];
};

ZmCalendarTreeController.prototype._setAllChecked =
function(ev, checked) {
	var overviewId = this._actionedOverviewId;
	var items = this._getItems(overviewId);
	var checkedItems = [];
	for (var i = 0;  i < items.length; i++) {
		var item = items[i];
		if (item._isSeparator) continue;
		if (item.getChecked() != checked) {
			item.setChecked(checked);
			checkedItems.push(item);
		}
	}

	// notify listeners of selection
	if (checkedItems.length && this._eventMgrs[overviewId]) {
		this._notifyListeners(overviewId, DwtEvent.SELECTION, checkedItems, DwtTree.ITEM_CHECKED,
							  ev, this._eventMgrs[overviewId]._selEv);
	}
};
