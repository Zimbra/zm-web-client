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

function ZmBuddyTreeController(appCtxt, type, dropTgt) {
	if (arguments.length === 0) {return;}
	type = type ? type : ZmOrganizer.BUDDY;
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget(ZmBuddy);
	ZmTreeController.call(this, appCtxt, type, dropTgt);
    this._imApp = appCtxt.getApp(ZmZimbraMail.IM_APP);
	this._eventMgrs = {};
	this._toastFormatter = new AjxMessageFormat(ZmMsg.imStatusToast);
}

ZmBuddyTreeController.prototype = new ZmTreeController;
ZmBuddyTreeController.prototype.constructor = ZmBuddyTreeController;

ZmBuddyTreeController.prototype.toString = function() {
	return "ZmBuddyTreeController";
};

// Public methods
ZmBuddyTreeController.prototype.addSelectionListener =
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

ZmBuddyTreeController.prototype.removeSelectionListener =
function(overviewId, listener) {
	if (this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId].removeListener(DwtEvent.SELECTION, listener);
	}
};

ZmBuddyTreeController.prototype._changeListener = 
function(ev, treeView) {
    if (ev.event == ZmEvent.E_MODIFY) {
        var buddy = ev.getDetail("organizers");
        if (buddy instanceof ZmBuddy) {
            var fields = ev.getDetail("fields");
            var status = fields[ZmBuddy.F_STATUS];
            if (status != null) {
                var toast = this._toastFormatter.format([buddy.getName(), buddy.getStatusText()]);
                this._appCtxt.setStatusMsg(toast, null, null, null, ZmStatusView.TRANSITION_SLIDE_LEFT);
                var ti = treeView.getTreeItemById(buddy.id);
                if (ti) ti.setImage(buddy.getIcon());
            }
        }
    }
    ZmTreeController.prototype._changeListener.call(this, ev, treeView);
};

// Protected methods
ZmBuddyTreeController.prototype.show = 
function(overviewId, showUnread, omit, forceCreate) {
	var firstTime = !this._treeView[overviewId];

    	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit, forceCreate);

	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
		var root = treeView.getItems()[0];
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item.setExpanded(true);
		}
	}
};

// Returns a list of desired header action menu operations
ZmBuddyTreeController.prototype._getHeaderActionMenuOps = function() {
	return null;
};

// Returns a list of desired action menu operations
ZmBuddyTreeController.prototype._getActionMenuOps = function() {
	return null;
};

ZmBuddyTreeController.prototype.getTreeStyle = function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmBuddyTreeController.prototype._itemClicked = function(buddy) {
    if ((buddy instanceof ZmBuddy) && buddy.getStatus() != ZmBuddy.STATUS_GROUP) {
        var clc = this._imApp.getChatListController();
        clc.selectChatForBuddy(buddy);
    }
};

ZmBuddyTreeController.prototype._itemDblClicked = function(buddy) {
    if ((buddy instanceof ZmBuddy) && buddy.getStatus() != ZmBuddy.STATUS_GROUP) {
        var clc = this._imApp.getChatListController();
        clc.chatWithBuddy(buddy);
    }
};

/*
* Don't allow dragging of buddy groups
*
* @param ev		[DwtDragEvent]		the drag event
*/
ZmBuddyTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var item = ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
		if (!(item instanceof ZmBuddy))
			ev.operation = Dwt.DND_DROP_NONE;
	}
};

/*
* Handles the potential drop of something onto a buddy group. When something is dragged over
* a buddy group, returns true if a drop would be allowed. When something is actually dropped,
* performs the move. If items are being dropped, the source data is not the items
* themselves, but an object with the items (data) and their controller, so they can be
* moved appropriately.
*
* @param ev		[DwtDropEvent]		the drop event
*/
ZmBuddyTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var srcData = ev.srcData;
		var dropTarget = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (!(srcData instanceof ZmBuddy) || !(dropTarget instanceof ZmBuddyGroup)) {
			ev.doIt = false;
			return;
		}
		// don't allow drop onto current group
        	ev.doIt = (srcData.getGroup() != dropTarget.getName());
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {

	}
};
