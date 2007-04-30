/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmRosterTreeController(appCtxt, type, dropTgt) {
	if (arguments.length === 0) { return; }

	type = type ? type : ZmOrganizer.ROSTER_TREE_ITEM;
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget("ZmRosterTreeItem");
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._imApp = appCtxt.getApp(ZmApp.IM);
	this._eventMgrs = {};
	this._confirmDeleteRosterItemFormatter = new AjxMessageFormat(ZmMsg.imConfirmDeleteRosterItem);
	this._addr2Items = {}; // hash from  roster tree item addr to ZmRosterItem for each group item is in
	this._prefixId = Dwt.getNextId();
	// initialize tree data from roster item list
	var list = this._imApp.getRoster().getRosterItemList();
	list.addChangeListener(new AjxListener(this, this._rosterListChangeListener));
	//	if (this._dataTree.root == null) {
	//	    this._dataTree.root = ZmRosterTree.createRoot(this._dataTree);
	//	}
	var listArray = list.getArray();
	for (var i=0; i < listArray.length; i++) {
		this._addRosterItem(listArray[i]);
	}

	this._listeners[ZmOperation.NEW_ROSTER_ITEM] = new AjxListener(this, this._newRosterItemListener);
	this._listeners[ZmOperation.IM_NEW_CHAT] = new AjxListener(this, this._imNewChatListener);
	this._listeners[ZmOperation.IM_NEW_GROUP_CHAT] = new AjxListener(this, this._imNewGroupChatListener);
	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editRosterItemListener);
	this._listeners[ZmOperation.IM_CREATE_CONTACT] = new AjxListener(this, this._imCreateContactListener);
	this._listeners[ZmOperation.IM_ADD_TO_CONTACT] = new AjxListener(this, this._imAddToContactListener);
	this._listeners[ZmOperation.IM_EDIT_CONTACT] = new AjxListener(this, this._imEditContactListener);
	this._listeners[ZmOperation.IM_GATEWAY_LOGIN] = new AjxListener(this, this._imGatewayLoginListener);

	this._treeItemHoverListenerListener = new AjxListener(this, this._treeItemHoverListener);
};

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

ZmRosterTreeController.prototype._getDataTree =
function() {
	if (!this._dataTree) {
		this._dataTree = new ZmTree(this.type, this._appCtxt);
		this._dataTree.root = ZmRosterTree.createRoot(this._dataTree);
	}
	return this._dataTree;
};

ZmRosterTreeController.prototype._rosterListChangeListener = function(ev) {
	var treeView = this.getTreeView(ZmZimbraMail._OVERVIEW_ID);
	var items= ev.getItems();

// 	if (!this._zimbraAssistantBuddy) {
// 		// create the Zimbra Assistant buddy
// 		var list = this._imApp.getRoster().getRosterItemList();
// 		var assistant = new ZmAssistantBuddy(list, this._appCtxt);
// 		list.addItem(assistant, true, 0);
// 		this._zimbraAssistantBuddy = assistant;
// 		items.unshift(assistant);
// 	}

	for (var n=0; n < items.length; n++) {
		var item = items[n];
		if (!(item instanceof ZmRosterItem)) continue;
		switch (ev.event) {
		    case ZmEvent.E_MODIFY:
			this._handleRosterItemModify(item, ev.getDetail("fields"), treeView);
			break;
		    case ZmEvent.E_CREATE:
			this._addRosterItem(item);
			break;
		    case ZmEvent.E_REMOVE:
			this._removeRosterItem(item);
			break;
		}
	}

	ZmTreeController.prototype._changeListener.call(this, ev, treeView);
};

ZmRosterTreeController.prototype._handleRosterItemModify =
function(item, fields, treeView) {
	var doShow = ZmRosterItem.F_PRESENCE in fields;
	var doUnread = ZmRosterItem.F_UNREAD in fields;
	var doGroups = ZmRosterItem.F_GROUPS in fields;
	var doName = ZmRosterItem.F_NAME in fields;

	if (doGroups || doName) {
		// easier to remove/add it
		this._removeRosterItem(item);
		this._addRosterItem(item);
	}

	var items = (doShow != null) || (doUnread != null) ? this.getAllItemsByAddr(item.getAddress()) : null;

	var numUnread = item.getUnread();
	var newName = !doUnread ? null :
		(numUnread == 0 ? item.getDisplayName() : AjxBuffer.concat("<b>",AjxStringUtil.htmlEncode(item.getDisplayName()), " (", numUnread, ")</b>"));

	if (items) for (var i in items) {
		var rti = items[i];
		var ti = treeView.getTreeItemById(rti.id);
		if (ti) {
			if (doShow) ti.setImage(rti.getIcon());
			if (doUnread) ti.setText(newName);
		}
	}

};

// Protected methods
ZmRosterTreeController.prototype._postSetup =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	var items = treeView.getItems();
	var root = (items && items.length) ? items[0] : null;
	if (!root) { return; }
	var groups = root.getItems();
	for (var i = 0; i < groups.length; i++) {
		var group = groups[i];
		group.setExpanded(true);
		var treeItems = group.getItems();
		for (var j=0; j < treeItems.length; j++) {
			var treeItem = treeItems[j];
			treeItem.setToolTipContent("");
			treeItem.addListener(DwtEvent.HOVEROVER, this._treeItemHoverListenerListener);
		}
	}
};

ZmRosterTreeController.prototype._treeItemHoverListener =
function(ev) {
//	this._foobar = this._foobar != null ? this._foobar+1 : 1;
	if (ev.object) {
		var ti = ev.object;
		var rti = ti.getData(Dwt.KEY_OBJECT);
		if (rti) ti.setToolTipContent(rti.getRosterItem().getToolTip());
	}
	/*
	var shell = DwtShell.getShell(window);
	var manager = shell.getHoverMgr();
	var el = manager.getHoverObject();
	var treeItem = Dwt.getObjectFromElement(el);
	treeItem.setToolTipContent(this._foobar);
	*/

};

// Returns a list of desired header action menu operations
ZmRosterTreeController.prototype._getHeaderActionMenuOps = function() {
	return [ZmOperation.NEW_ROSTER_ITEM, ZmOperation.IM_GATEWAY_LOGIN];
};

// Returns a list of desired action menu operations
ZmRosterTreeController.prototype._getItemActionMenuOps = function() {
	return [ZmOperation.IM_NEW_CHAT,
		ZmOperation.SEP, //-----------
		ZmOperation.EDIT_PROPS, ZmOperation.DELETE,
		ZmOperation.SEP, //-----------
		ZmOperation.IM_CREATE_CONTACT, ZmOperation.IM_ADD_TO_CONTACT, ZmOperation.IM_EDIT_CONTACT
	       ];
};

// Returns a list of desired action menu operations
ZmRosterTreeController.prototype._getGroupActionMenuOps = function() {
    	return [ZmOperation.IM_NEW_GROUP_CHAT, ZmOperation.SEP, ZmOperation.NEW_ROSTER_ITEM];
};


ZmRosterTreeController.prototype._deleteListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	if (!(organizer instanceof ZmRosterTreeItem)) return;
	var ds = this._deleteShield = this._appCtxt.getYesNoCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
	ds.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
	var msg = this._confirmDeleteRosterItemFormatter.format([organizer.getRosterItem().getAddress()]);
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

ZmRosterTreeController.prototype._deleteShieldYesCallback =
function(organizer) {
	organizer.getRosterItem()._delete();
	this._clearDialog(this._deleteShield);
};

ZmRosterTreeController.prototype._getActionMenu =
function(ev) {
	var org = this._getActionedOrganizer(ev);
	var menu = null;
	if (org instanceof ZmRosterTree) {
		menu = this.__headerActionMenu;
		if (menu == null)
			menu = this.__headerActionMenu = this._createActionMenu(this._shell, this._getHeaderActionMenuOps());
	} else if (org instanceof ZmRosterTreeItem) {
		menu = this._itemActionMenu;
		if (menu == null)
			menu = this._itemActionMenu = this._createActionMenu(this._shell, this._getItemActionMenuOps());

		var item = org.getRosterItem();

		// disallow these operations for implicit buddies (i.e. Zimbra Assistant)
		menu.getOp(ZmOperation.EDIT_PROPS).setEnabled(!item.isDefaultBuddy());
		menu.getOp(ZmOperation.DELETE).setEnabled(!item.isDefaultBuddy());

		var contact = item.getContact();
		menu.getOp(ZmOperation.IM_ADD_TO_CONTACT).setVisible(!contact);
		menu.getOp(ZmOperation.IM_CREATE_CONTACT).setVisible(!contact);
		menu.getOp(ZmOperation.IM_EDIT_CONTACT).setVisible(!!contact);
	} else if (org instanceof ZmRosterTreeGroup) {
		menu = this._groupActionMenu;
		if (menu == null)
			menu = this._groupActionMenu = this._createActionMenu(this._shell, this._getGroupActionMenuOps());
	}
	return menu;
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
		if (!((item instanceof ZmRosterTreeItem) || (item instanceof ZmRosterTreeGroup)))
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
		// don't allow drop onto group item is currently in
        	ev.doIt = !srcData.getRosterItem().inGroup(dropTarget.getName());
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
        	var srcData = ev.srcData;
		var dropTarget = ev.targetControl.getData(Dwt.KEY_OBJECT);
		// TODOO: normally taken care of by notification listener
		if ((srcData instanceof ZmRosterTreeItem) && (dropTarget instanceof ZmRosterTreeGroup)) {
			var srcGroup = srcData.getGroupName();
			var dstGroup = dropTarget.getName();
			srcData.getRosterItem().doRenameGroup(srcGroup, dstGroup);
		}
	}
};

// return all item instances with given addr
ZmRosterTreeController.prototype.getAllItemsByAddr =
function(addr) {
	return this._addr2Items[addr] || [];
};

ZmRosterTreeController.prototype._addRosterItem =
function(rosterItem) {
	var groups = rosterItem.getGroups();
	if (groups.length == 0)
		groups = [ZmMsg.buddies];
	var items = [];
	for (var j = 0; j < groups.length; j++) {
		var groupName = groups[j];
		var rosterGroup = this._getGroup(groupName);
		var id = rosterItem.getAddress() + ":" + groupName;
		var args = { id		      : id,
			     rosterItem	      : rosterItem,
			     parent	      : rosterGroup,
			     tree	      : this._dataTree };
		var item = new ZmRosterTreeItem(args);
		item._notify(ZmEvent.E_CREATE);
		rosterGroup.children.add(item);
		items.push(item);
	}
	this._addr2Items[rosterItem.getAddress()] = items;
	var treeView = this.getTreeView(ZmZimbraMail._OVERVIEW_ID);
	if (treeView) for (var i in items) {
		var ti = treeView.getTreeItemById(items[i].id);
		if (ti) {
			ti.setToolTipContent(rosterItem.getAddress());
			ti.addListener(DwtEvent.HOVEROVER, this._treeItemHoverListenerListener);
		}
	}
}

ZmRosterTreeController.prototype._removeRosterItem =
function(rosterItem) {
	var items = this.getAllItemsByAddr(rosterItem.getAddress());
	for (var i in items) {
		var rti = items[i];
		//rti.notifyDelete();
		rti.deleteLocal();
		rti._notify(ZmEvent.E_DELETE);
		if (rti.parent.children.size() == 0) {
			rti.parent.deleteLocal();
			rti.parent._notify(ZmEvent.E_DELETE);
		}
	}
	delete this._addr2Items[rosterItem.getAddress()];
};

// used to get (auto-create) a group from the root
ZmRosterTreeController.prototype._getGroup =
function(name) {
	var groupId = this._prefixId+"_group_"+name;
	var group = this._appCtxt.getById(groupId);
	if (group == null) {
		group = new ZmRosterTreeGroup({id: groupId, name: name, parent: this._dataTree.root, tree: this._dataTree});
		group._notify(ZmEvent.E_CREATE);
		this._dataTree.root.children.add(group);

		// expand groups if tree is created
		var treeView = this.getTreeView(ZmZimbraMail._OVERVIEW_ID);
		if (treeView) {
			var ti = treeView.getTreeItemById(group.id);
			if (ti) ti.setExpanded(true);
		}
	}
	return group;
};

ZmRosterTreeController.prototype._imGatewayLoginListener = function(ev) {
	var dlg = this._appCtxt.getIMGatewayLoginDialog();
	if (!this._registerGatewayCb) {
		this._registerGatewayCb = new AjxCallback(this, this._registerGatewayCallback);
	}
	ZmController.showDialog(dlg, this._registerGatewayCb);
};

ZmRosterTreeController.prototype._registerGatewayCallback = function(service, screenName, password) {
	this._appCtxt.getIMGatewayLoginDialog().popdown();
	AjxDispatcher.run("GetRoster").registerGateway(service, screenName, password);
};

ZmRosterTreeController.prototype._newRosterItemListener =
function(ev) {
	var newDialog = this._appCtxt.getNewRosterItemDialog();
	newDialog.setTitle(ZmMsg.createNewRosterItem);
	if (!this._newRosterItemCb) {
		this._newRosterItemCb = new AjxCallback(this, this._newRosterItemCallback);
	}
	ZmController.showDialog(newDialog, this._newRosterItemCb);
	var org = this._getActionedOrganizer(ev);
	if (org instanceof ZmRosterTreeGroup) {
		newDialog.setGroups(org.getName());
	}
};

ZmRosterTreeController.prototype._editRosterItemListener =
function(ev) {
	var newDialog = this._appCtxt.getNewRosterItemDialog();
	newDialog.setTitle(ZmMsg.editRosterItem);
	if (!this._newRosterItemCb) {
		this._newRosterItemCb = new AjxCallback(this, this._newRosterItemCallback);
	}
	ZmController.showDialog(newDialog, this._newRosterItemCb);
	var org = this._getActionedOrganizer(ev);
	var ri = org.getRosterItem();
	newDialog.setAddress(ri.getAddress(), true);
	newDialog.setName(ri.getName());
	newDialog.setGroups(ri.getGroups());
};


ZmRosterTreeController.prototype._imNewChatListener =
function(ev) {
	var org = this._getActionedOrganizer(ev);
	var clc = this._imApp.getChatListController();
	clc.chatWithRosterItem(org.getRosterItem());
};

ZmRosterTreeController.prototype._imNewGroupChatListener =
function(ev) {
	var org = this._getActionedOrganizer(ev);
	var clc = this._imApp.getChatListController();
	clc.chatWithRosterItems(org.getRosterItems(), org.getName()+" "+ZmMsg.imGroupChat);
};

// Create a roster item
ZmRosterTreeController.prototype._newRosterItemCallback =
function(addr, rname, groups) {
	this._appCtxt.getNewRosterItemDialog().popdown();
	this._imApp.getRoster().createRosterItem(addr, rname, groups);
};

// HACK: override that removes a bunch of checking
ZmRosterTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	if (ev.event != ZmEvent.E_CREATE) {
		return ZmTreeController.prototype._changeListener.apply(this, [ev, treeView, overviewId]);
	}

	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source) {
		organizers = [ev.source];
	}

	// handle one organizer at a time
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var node = treeView.getTreeItemById(id);
		var parentNode = null;
		if (organizer.parent) {
			parentNode = this._appCtxt.getOverviewController().getTreeItemById(overviewId, organizer.parent.id);
			if (!parentNode) {
				// HACK: just add item to root node
				parentNode = this._appCtxt.getOverviewController().getTreeItemById(overviewId, 1);
			}
		}
		if (parentNode) {
			var idx = ZmTreeView.getSortIndex(parentNode, organizer, eval(ZmTreeView.COMPARE_FUNC[organizer.type]));
			this._addNew(treeView, parentNode, organizer, idx); // add to new parent
		}
	}
};

ZmRosterTreeController.prototype._imCreateContactListener = function(ev) {
	var item = this._getActionedOrganizer(ev).getRosterItem();
	var contact = new ZmContact(this._appCtxt);
	contact.setAttr(ZmContact.F_imAddress1, item.getAddress());
	AjxDispatcher.run("GetContactController").show(contact, true);
};

ZmRosterTreeController.prototype._imAddToContactListener = function(ev) {
	var item = this._getActionedOrganizer(ev).getRosterItem();
	ZmOneContactPicker.showPicker(
		{
			onAutocomplete: AjxCallback.simpleClosure(function(contact, dlg) {
				dlg.popdown();
				var fields = [ ZmContact.F_imAddress1, ZmContact.F_imAddress2, ZmContact.F_imAddress3 ];
				for (var i = 0; i < fields.length; ++i) {
					var f = fields[i];
					var orig = contact.getAttr(f);
					if (!orig || !/\S/.test(orig)) {
						contact.setAttr(f, item.getAddress());
						AjxDispatcher.run("GetContactController").show(contact, true);
						// reset the attribute now so that
						// ZmContactView thinks it's been
						// modified.  sort of makes sense. ;-)
						contact.setAttr(f, orig);
						break;
					}
				}
				if (i == fields.length) {
					// not set as all IM fields are filed
					// XXX: warn?
				}
			}, this )
		}
	);
};

ZmRosterTreeController.prototype._imEditContactListener = function(ev) {
	var item = this._getActionedOrganizer(ev).getRosterItem();
	AjxDispatcher.run("GetContactController").show(item.getContact(), false);
};
