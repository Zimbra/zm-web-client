/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmCalendarTreeController(appCtxt, type, dropTgt) {
	if (arguments.length == 0) return;
	
	type = type ? type : ZmOrganizer.CALENDAR;
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget(ZmAppt);
	
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editPropsListener);

	this._eventMgrs = {};
}

ZmCalendarTreeController.prototype = new ZmTreeController;
ZmCalendarTreeController.prototype.constructor = ZmCalendarTreeController;

ZmCalendarTreeController.prototype.toString = function() {
	return "ZmCalendarTreeController";
}

// Constants

ZmCalendarTreeController.COLOR_CLASSNAMES = [
	// NOTE: We use Gray instead of GrayBg so that it doesn't blend into background
	"OrangeBg", "BlueBg", "CyanBg", "GreenBg", "PurpleBg", "RedBg", "YellowBg", "PinkBg", "Gray"
];

// Data

ZmCalendarTreeController.prototype._eventMgrs;

// Public methods

ZmCalendarTreeController.prototype.getCheckedCalendars = function(overvewId) {
	var calendars = [];
	var treeView = this.getTreeView(overviewId);
	if (treeView) {
		var root = treeView.getItems()[0];
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.getChecked()) {
				var calendar = item.getData(Dwt.KEY_OBJECT);
				calendars.push(calendar);
			}
		}
	}
	return calendars;
}

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
}
ZmCalendarTreeController.prototype.removeSelectionListener =
function(overviewId, listener) {
	if (this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId].removeListener(DwtEvent.SELECTION, listener);
	}
}

// Protected methods

ZmCalendarTreeController.prototype.show = 
function(overviewId, showUnread, omit) {
	var firstTime = !this._treeView[overviewId];

	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit);
	
	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
		var root = treeView.getItems()[0];
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var object = item.getData(Dwt.KEY_OBJECT);
			this._setTreeItemColor(item, object.color);
			if (object.id == ZmCalendar.ID_CALENDAR) {
				item.setChecked(true);
			}
		}
	}
}

// Returns a list of desired header action menu operations
ZmCalendarTreeController.prototype._getHeaderActionMenuOps = function() {
	return null;
}

// Returns a list of desired action menu operations
ZmCalendarTreeController.prototype._getActionMenuOps = function() {
	return [ ZmOperation.EDIT_PROPS ];
}

ZmCalendarTreeController.prototype.getTreeStyle = function() {
	return DwtTree.CHECKEDITEM_STYLE;
}

// Returns the dialog for organizer creation
ZmCalendarTreeController.prototype._getNewDialog = function() {
	alert("TODO: get new dialog");
}

// Returns the dialog for renaming an organizer
ZmCalendarTreeController.prototype._getRenameDialog = function() {
	alert("TODO: get rename dialog");
}

// Method that is run when a tree item is left-clicked
ZmCalendarTreeController.prototype._itemClicked = function() {
	alert("TODO: item clicked");
}

// Handles a drop event
ZmCalendarTreeController.prototype._dropListener = function() {
	alert("TODO: drop listener");
}

// Returns an appropriate title for the "Move To" dialog
ZmCalendarTreeController.prototype._getMoveDialogTitle = function() {
	alert("TODO: get move dialog title");
}

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

		var fields = ev.getDetail("fields");
		if (ev.event == ZmEvent.E_MODIFY) {
			if (node && fields && fields[ZmOrganizer.F_COLOR]) {
				var object = node.getData(Dwt.KEY_OBJECT);
				this._setTreeItemColor(node, object.color);
			}
		}
	}
}

ZmCalendarTreeController.prototype._treeViewListener = function(ev) {
	// handle item(s) clicked
	if (ev.detail == DwtTree.ITEM_CHECKED) { 
		var overviewId = ev.item.getData(ZmTreeView.KEY_ID);
		var calendar = ev.item.getData(Dwt.KEY_OBJECT);
		if (calendar.id == ZmOrganizer.ID_ROOT) {
			var item = ev.item;

			var checked = item.getChecked(); // state already changed by this time
			//item.setChecked(checked);
			
			var subitems = item.getItems();
			var checkedItems = null;
			for (var i = 0;  i < subitems.length; i++) {
				var subitem = subitems[i];
				if (subitem.getChecked() != checked) {
					subitem.setChecked(checked);
					if (checkedItems == null) checkedItems = [];
					checkedItems.push(subitem);
				}
			}

			// notify listeners of pseudo-selection
			if (checkedItems && this._eventMgrs[overviewId]) {
				this._notifyListeners(
					overviewId, 
					DwtEvent.SELECTION, checkedItems, DwtTree.ITEM_CHECKED, 
					ev, this._eventMgrs[overviewId]._selEv
				);
			}
			
			// a root selection is never propagated
			return;
		}
		
		// uncheck root
		var root = ev.item._tree.getItems()[0];
		root.setChecked(false);
		
		// notify listeners of selection
		if (this._eventMgrs[overviewId]) {
			this._eventMgrs[overviewId].notifyListeners(DwtEvent.SELECTION, ev);
		}
		return;
	}

	// default processing
	ZmTreeController.prototype._treeViewListener.call(this, ev);
}

ZmCalendarTreeController.prototype._editPropsListener = function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var folderPropsDialog = this._appCtxt.getFolderPropsDialog();
	var folder = this._pendingActionData;
	folderPropsDialog.setFolder(folder);
	folderPropsDialog.popup();
}

ZmCalendarTreeController.prototype._notifyListeners =
function(overviewId, type, items, detail, srcEv, destEv) {
	if (this._eventMgrs[overviewId] && 
		this._eventMgrs[overviewId].isListenerRegistered(type)) {
		if (srcEv) DwtUiEvent.copy(destEv, srcEv);
		destEv.items = items;
		if (items.length == 1) destEv.item = items[0];
		destEv.detail = detail;
		this._eventMgrs[overviewId].notifyListeners(type, destEv);
	}
}

ZmCalendarTreeController.prototype._setTreeItemColor = function(item, color) {
	var element = item.getHtmlElement();
	element.className = ZmCalendarTreeController.COLOR_CLASSNAMES[color];
}
