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
/**
 * @overview
 * This file defines a Zimlet tree controller.
 *
 */

/**
 * Creates a Zimlet tree controller.
 * @class
 * This class represents a Zimlet tree controller.
 * 
 * @extends		ZmTreeController
 */
ZmZimletTreeController = function() {

	ZmTreeController.call(this, ZmOrganizer.ZIMLET);

    this._eventMgrs = {};
}

ZmZimletTreeController.prototype = new ZmTreeController;
ZmZimletTreeController.prototype.constructor = ZmZimletTreeController;

ZmZimletTreeController.prototype.isZmZimletTreeController = true;
ZmZimletTreeController.prototype.toString = function() { return "ZmZimletTreeController"; };

// Public methods

/**
 * Adds a selection listener.
 * 
 * @param	{constant}	overviewId	the overview id
 * @param	{AjxListener}	listener		the listener to add
 */
ZmZimletTreeController.prototype.addSelectionListener =
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

/**
 * Removes the selection listener.
 * 
 * @param	{constant}	overviewId	the overview id
 * @param	{AjxListener}	listener		the listener to remove
 */
ZmZimletTreeController.prototype.removeSelectionListener =
function(overviewId, listener) {
	if (this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId].removeListener(DwtEvent.SELECTION, listener);
	}
};

// Protected methods

/**
 * @private
 */
ZmZimletTreeController.prototype._postSetup =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	var root = treeView.getItems()[0];
	if (root) {
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			this.setToolTipText(items[i]);
		}
	}
};

/**
 * Sets the tool tip text.
 * 
 * @param	{object}	item		the item
 */
ZmZimletTreeController.prototype.setToolTipText =
function (item) {
	var zimlet = item.getData(Dwt.KEY_OBJECT);
	if (zimlet) zimlet.setToolTipText(item);
};

/**
 * ZmTreeController removes existing DwtTreeItem object then add a new one on ZmEvent.E_MODIFY,
 * wiping out any properties set on the object.
 * 
 * @private
 */
ZmZimletTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var item = treeView.getTreeItemById(id);
		this.setToolTipText(item);
	}
};

/**
 * @private
 */
ZmZimletTreeController.prototype._getDataTree =
function() {
	return appCtxt.getZimletTree();
};

/**
 * Returns a list of desired header action menu operations.
 * 
 * @private
 */
ZmZimletTreeController.prototype._getHeaderActionMenuOps = function() {
	return null;
};

/**
 * Returns a list of desired action menu operations.
 * 
 * @private
 */
ZmZimletTreeController.prototype._getActionMenuOps = function() {
	return null;
};

/**
 * @private
 */
ZmZimletTreeController.prototype._getActionMenu = function(ev) {
	var z = ev.item.getData(Dwt.KEY_OBJECT);
	// z is here a ZmZimlet
	z = z.getZimletContext();
	if(z) {
		return z.getPanelActionMenu();
	}
};

/**
 * Gets the tree style.
 * 
 * @return	{constant}	the style
 * @see		DwtTree.SINGLE_STYLE
 */
ZmZimletTreeController.prototype.getTreeStyle = function() {
	return DwtTree.SINGLE_STYLE;
};

/**
 * Method that is run when a tree item is left-clicked.
 * 
 * @private
 */
ZmZimletTreeController.prototype._itemClicked = function(z) {
	if (z.id == ZmZimlet.ID_ZIMLET_ROOT) { return; }

	// to allow both click and dbl-click, we should use a timeout here, as
	// this function gets called twice in the case of a dbl-click.  If the
	// timeout already exists, we do nothing since _itemDblClicked will be
	// called (the timeout is cleared there).
	if (!z.__dbl_click_timeout) {
		z.__dbl_click_timeout = setTimeout(function() {
			z.__dbl_click_timeout = null;
			z.getZimletContext().callHandler("_dispatch", [ "singleClicked" ]);
		}, 350);
	}
};

/**
 * @private
 */
ZmZimletTreeController.prototype._itemDblClicked = function(z) {
	if (z.id == ZmZimlet.ID_ZIMLET_ROOT) { return; }

	if (z.__dbl_click_timeout) {
		// click will never happen
		clearTimeout(z.__dbl_click_timeout);
		z.__dbl_click_timeout = null;
	}
	z.getZimletContext().callHandler("_dispatch", [ "doubleClicked" ]);
};

/**
 * Handles a drop event.
 * 
 * @private
 */
ZmZimletTreeController.prototype._dropListener = function(ev) {
	var z = ev.targetControl.getData(Dwt.KEY_OBJECT);
	if (!z) {
		ev.doIt = false;
		return;
	}
	if (z.id == ZmZimlet.ID_ZIMLET_ROOT) {
		ev.doIt = false;
		return;
	}
	if (z.getZimletContext) {
		try {
			z = z.getZimletContext();
		} catch(ex) {
			ev.doIt = false;
			return;
		}
	} else {
		ev.doIt = false;
		return;
	}
	var srcData = ev.srcData.data;
	if (!z || !srcData) {
		ev.doIt = false;
		return;
	}
	var dragSrc = z.zimletPanelItem.dragSource;
 	if (dragSrc && ev.action == DwtDropEvent.DRAG_DROP) {
		z.callHandler("_dispatch",
			[ "doDrop",
				ZmZimletContext._translateZMObject(srcData),
			dragSrc ]);
	}
};

/**
 * Handles a drag event.
 * 
 * @private
 */
ZmZimletTreeController.prototype._dragListener = function(ev) {
	// for now there's nothing defined in the spec to allow this
	ev.operation = Dwt.DND_DROP_NONE;
};
