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

function ZmRosterTreeController(appCtxt, type, dropTgt) {
	if (arguments.length === 0) {return;}
	type = type ? type : ZmOrganizer.ROSTER_TREE_ITEM;
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget(ZmRosterTreeItem);
	ZmTreeController.call(this, appCtxt, type, dropTgt);
    this._imApp = appCtxt.getApp(ZmZimbraMail.IM_APP);
	this._eventMgrs = {};
	this._toastFormatter = new AjxMessageFormat(ZmMsg.imStatusToast);
	// initialze tree data from roster item list
	var list = this._imApp.getRosterItemList();
	list.addChangeListener(new AjxListener(this, this._rosterListChangeListener));
	if (this._dataTree.root == null) {
	    this._dataTree.root = ZmRosterTree.createRoot(this._dataTree);
	}
	var listArray = list.getArray();
	for (var i=0; i < listArray.length; i++) {
	    this._dataTree.root._addRosterItem(listArray[i], this._dataTree);
	}
}

ZmRosterTreeController.prototype = new ZmTreeController;
ZmRosterTreeController.prototype.constructor = ZmRosterTreeController;

ZmRosterTreeController.prototype.toString = function() {
	return "ZmRosterTreeController";
};

// Public methods
ZmRosterTreeController.prototype.addSelectionListener =
function(overviewId, listener) {
	// Each overview gets its own event manager
	if (!this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId] = new AjxEventMgr;
		this._eventMgrs[overviewId]._selEv = new DwtSelectionEvent(true);
	}
	this._eventMgrs[overviewId].addListener(DwtEvent.SELECTION, listener);
};

ZmRosterTreeController.prototype.removeSelectionListener =
function(overviewId, listener) {
	if (this._eventMgrs[overviewId]) {
		this._eventMgrs[overviewId].removeListener(DwtEvent.SELECTION, listener);
	}
};

//ZmRosterTreeController.prototype._changeListener = 
//function(ev, treeView) {};

ZmRosterTreeController.prototype._rosterListChangeListener = 
function(ev) {
    var treeView = this.getTreeView(ZmZimbraMail._OVERVIEW_ID);
    
    if (ev.event == ZmEvent.E_MODIFY) {
        var items= ev.getItems();
        for (var n=0; n < items.length; n++) {
            var item = items[n];
            if (item instanceof ZmRosterItem) this._handleRosterItemModify(item, ev.getDetail("fields"));
        }
    } else if (ev.event == ZmEvent.E_CREATE) {
        var item = ev.getDetail("organizers");
        if (item instanceof ZmRosterItem) this._dataTree._addRosterItem(item);
    }
    ZmTreeController.prototype._changeListener.call(this, ev, treeView);
};

ZmRosterTreeController.prototype._handleRosterItemModify =
function(item, fields) {
    var show = fields[ZmRosterItem.F_SHOW];
    if (show != null) {
        var toast = this._toastFormatter.format([item.getName(), item.getShowText()]);
        this._appCtxt.setStatusMsg(toast, null, null, null, ZmStatusView.TRANSITION_SLIDE_LEFT);
        var items = this._dataTree.root.getAllItemsByAddr(item.getAddress());
        // update all tree items with this address
        for (var i in items) {
             var rti = items[i];
             var ti = treeView.getTreeItemById(rti.id);
             if (ti) ti.setImage(rti.getIcon());
        }
   }
   var groups = fields[ZmRosterItem.F_GROUPS];
   if (groups != null) {
       this._dataTree.root._updateRosterItemGroups(item, this._dataTree);
   }
};

// Protected methods
ZmRosterTreeController.prototype.show = 
function(overviewId, showUnread, omit, forceCreate) {
	var firstTime = !this._treeView[overviewId];

    	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit, forceCreate);

	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
//		var root = treeView.getItems()[0];
//		var items = root.getItems();		
		var items = treeView.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item.setExpanded(true);
		}
	}
};

// Returns a list of desired header action menu operations
ZmRosterTreeController.prototype._getHeaderActionMenuOps = function() {
	return null;
};

// Returns a list of desired action menu operations
ZmRosterTreeController.prototype._getActionMenuOps = function() {
	return null;
};

ZmRosterTreeController.prototype.getTreeStyle = function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmRosterTreeController.prototype._itemClicked = function(item) {
    if (item instanceof ZmRosterTreeItem) {
        var clc = this._imApp.getChatListController();
        clc.selectChatForRosterItem(item.getRosterItem());
    }
};

ZmRosterTreeController.prototype._itemDblClicked = function(item) {
    if (item instanceof ZmRosterTreeItem) {
        var clc = this._imApp.getChatListController();
        clc.chatWithRosterItem(item.getRosterItem());
    }
};

/*
* Don't allow dragging of roster groups
*
* @param ev		[DwtDragEvent]		the drag event
*/
ZmRosterTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var item = ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
		if (!(item instanceof ZmRosterTreeItem))
			ev.operation = Dwt.DND_DROP_NONE;
	}
};

/*
* Handles the potential drop of something onto a roster group. When something is dragged over
* a roster group, returns true if a drop would be allowed. When something is actually dropped,
* performs the move. If items are being dropped, the source data is not the items
* themselves, but an object with the items (data) and their controller, so they can be
* moved appropriately.
*
* @param ev		[DwtDropEvent]		the drop event
*/
ZmRosterTreeController.prototype._dropListener =
function(ev) {

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var srcData = ev.srcData;
		var dropTarget = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (!(srcData instanceof ZmRosterTreeItem) || !(dropTarget instanceof ZmRosterTreeGroup)) {
			ev.doIt = false;
			return;
		}
		// don't allow drop onto current group. TODO: or group that already contains roster item
        	ev.doIt = !srcData.getRosterItem().inGroup(dropTarget.getName());
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
        	var srcData = ev.srcData;
		var dropTarget = ev.targetControl.getData(Dwt.KEY_OBJECT);
        // TODOO: normally taken care of by notification listener
		if ((srcData instanceof ZmRosterTreeItem) && (dropTarget instanceof ZmRosterTreeGroup)) {
		    var srcGroup = srcData.getGroupName();
		    var dstGroup = dropTarget.getName();
            srcData.getRosterItem().renameGroup(srcGroup, dstGroup);
        }
	}
};
