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

function ZmZimletTreeController(appCtxt, type, dropTgt) {
	if (arguments.length === 0) {return;}
	type = type ? type : ZmOrganizer.ZIMLET;
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget(ZmAppt, ZmConv, ZmMailMsg, ZmContact);
	ZmTreeController.call(this, appCtxt, type, dropTgt);
	this._eventMgrs = {};
}

ZmZimletTreeController.prototype = new ZmTreeController;
ZmZimletTreeController.prototype.constructor = ZmZimletTreeController;

ZmZimletTreeController.prototype.toString = function() {
	return "ZmZimletTreeController";
};

// Public methods
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

ZmZimletTreeController.prototype.removeSelectionListener =
function(overviewId, listener) {
	if (this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId].removeListener(DwtEvent.SELECTION, listener);
	}
};

// Protected methods
ZmZimletTreeController.prototype.show =
function(overviewId, showUnread, omit, forceCreate) {
	var firstTime = !this._treeView[overviewId];
	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit, forceCreate);
	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
		var root = treeView.getItems()[0];
		if (root) {
			var items = root.getItems();
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
			}
		}
	}
};

// Returns a list of desired header action menu operations
ZmZimletTreeController.prototype._getHeaderActionMenuOps = function() {
	return null;
};

// Returns a list of desired action menu operations
ZmZimletTreeController.prototype._getActionMenuOps = function() {
	return null;
};

ZmZimletTreeController.prototype._getActionMenu = function(ev) {
	// alert(ev.item.getData(ZmTreeView.KEY_ID)); // ==> e.g. ZimbraMail
	// alert(ev.item.getData(Dwt.KEY_ID));
	var z = ev.item.getData(Dwt.KEY_OBJECT);
	// z is here a ZmZimlet
	z = z.getZimletContext();
	return z.getPanelActionMenu();
};

ZmZimletTreeController.prototype.getTreeStyle = function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmZimletTreeController.prototype._itemClicked = function(z) {
	if (z.id == ZmZimlet.ID_ZIMLET)
		return;
	// to allow both click and dbl-click, we should use a timeout here, as
	// this function gets called twice in the case of a dbl-click.  If the
	// timeout already exists, we do nothing since _itemDblClicked will be
	// called (the timeout is cleared there).
	if (!z.__dbl_click_timeout) {
		z.__dbl_click_timeout = setTimeout(function() {
			z.__dbl_click_timeout = null;
			z.getZimletContext().callHandler("panelItemClicked");
		}, 350);
	}
};

ZmTreeController.prototype._itemDblClicked = function(z) {
	if (z.id == ZmZimlet.ID_ZIMLET)
		return;
	if (z.__dbl_click_timeout) {
		// click will never happen
		clearTimeout(z.__dbl_click_timeout);
		z.__dbl_click_timeout = null;
	}
	z.getZimletContext().callHandler("doubleClicked");
};

// Handles a drop event
ZmZimletTreeController.prototype._dropListener = function(ev) {
	var z = ev.targetControl.getData(Dwt.KEY_OBJECT);
	if (z.id == ZmZimlet.ID_ZIMLET)
		return;
	z = z.getZimletContext();
	var srcData = ev.srcData.data;
	if (!z || !srcData) {
		ev.doIt = false;
		return;
	}
	var dragSrc = z.zimletPanelItem.dragSource;
 	if (!dragSrc) {
 		ev.doIt = false;
 	} else {
		if (ev.action == DwtDropEvent.DRAG_ENTER) {
			var doIt = false;
			for (var i = dragSrc.length; --i >= 0;) {
				if (srcData.toString() == dragSrc[i].type) {
					doIt = true;
					break;
				}
			}
			if (doIt)
				doIt = z.callHandler("doDrag", [ srcData ]);
			ev.doIt = doIt;
		} else {
			if (ev.action == DwtDropEvent.DRAG_DROP) {
				z.callHandler("doDrop", [ srcData ]);
			}
		}
 	}
};

// Handles a drag event
ZmZimletTreeController.prototype._dragListener = function(ev) {
	// for now there's nothing defined in the spec to allow this
	ev.operation = Dwt.DND_DROP_NONE;
};
