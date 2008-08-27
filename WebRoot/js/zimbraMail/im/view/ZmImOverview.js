/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmImOverview = function(parent, args) {
	if (!args)
		args = {};

	DwtComposite.call(this, {parent:parent, posStyle:args.posStyle || Dwt.ABSOLUTE_STYLE});

	this._groupItems = {};
	this._itemsById = {};
	this._options = args;
	this._sortBy = appCtxt.get("IM_PREF_BUDDY_SORT");

	this._actionMenuOps = {

		root : [ ZmOperation.NEW_ROSTER_ITEM,
			ZmOperation.SEP, //-----------
			ZmOperation.IM_GATEWAY_LOGIN,
			ZmOperation.SEP, //-----------
			ZmOperation.IM_TOGGLE_OFFLINE,
			ZmOperation.IM_TOGGLE_BLOCKED,
			ZmOperation.SEP, //-----------
			ZmOperation.IM_SORT_BY_PRESENCE,
			ZmOperation.IM_SORT_BY_NAME
		],

		buddy : [ ZmOperation.IM_NEW_CHAT,

			// privacy
			ZmOperation.IM_BLOCK_BUDDY,
			ZmOperation.IM_UNBLOCK_BUDDY,

			//ZmOperation.IM_BLOCK_DOMAIN,
			//ZmOperation.IM_UNBLOCK_DOMAIN,

			ZmOperation.SEP, //-----------
			ZmOperation.EDIT_PROPS, ZmOperation.DELETE,
			ZmOperation.SEP, //-----------
			ZmOperation.IM_CREATE_CONTACT, ZmOperation.IM_ADD_TO_CONTACT, ZmOperation.IM_EDIT_CONTACT
		],

		assistant : [ ZmOperation.IM_NEW_CHAT ],

		group : [ // ZmOperation.IM_NEW_GROUP_CHAT,
			// ZmOperation.SEP,
			ZmOperation.NEW_ROSTER_ITEM,
			ZmOperation.IM_DELETE_GROUP
		]

	};

	this._actionMenuPopdownListener = new AjxListener(this, this._actionMenuPopdownListener);

	this._im_dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._im_dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this.__filters = [];
	this.__filterOffline = appCtxt.get(ZmSetting.IM_PREF_HIDE_OFFLINE);
	if (this.__filterOffline) {
		this.__filters.push(ZmImOverview.FILTER_OFFLINE_BUDDIES);
	}
	this.__filterBlocked = appCtxt.get(ZmSetting.IM_PREF_HIDE_BLOCKED);
	if (this.__filterBlocked) {
		this.__filters.push(ZmImOverview.FILTER_BLOCKED_BUDDIES);
	}

	this._init();
};

ZmImOverview.prototype = new DwtComposite;
ZmImOverview.prototype.constructor = ZmImOverview;

ZmImOverview.prototype.toString =
function() {
	return "ZmImOverview";
};

ZmImOverview.NO_MESSAGE = 0;
ZmImOverview.NOT_LOGGED_IN = 1;
ZmImOverview.LOADING = 2;
ZmImOverview.NO_BUDDIES = 3;

ZmImOverview.prototype.dispose =
function() {
	for (var name in this._actionMenuOps) {
		var menu = this._actionMenuOps[name]._dwtControl;
		if (menu) {
			menu.dispose();
		}
	}
	ZmImApp.INSTANCE.removeRosterItemListListener(this._rosterItemListListenerObj);
	DwtComposite.prototype.dispose.call(this);	
};

ZmImOverview.prototype.getTree =
function() {
	return this._tree;
};

ZmImOverview.prototype._dragListener = function(ev) {
        var data = ev.srcControl.getData("ZmImOverview.data");
        switch (ev.action) {
            case DwtDragEvent.SET_DATA:
                if (data.buddy) {
                        ev.srcData = data.buddy;
                        ev.srcData._drag_from_group = ev.srcControl.parent.getData("ZmImOverview.data").group;
                }
                break;
        }
};

ZmImOverview.prototype._setCheck =
function(menuItem, checked) {
	menuItem.setImage(checked ? "Check" : null);
};

ZmImOverview.prototype._setCheckOp =
function(menu, op, checked) {
	var item = menu.getMenuItem(op);
	if (item) {
		this._setCheck(item, checked);
	}
};

ZmImOverview.prototype._updateFilter =
function(filter, on) {
	if (on) {
		this.addFilter(filter);
	} else {
		this.removeFilter(filter);
	}
};

ZmImOverview.prototype._actionMenuListener =
function(useActionedItem, ev) {
	var operation = ev.item.getData(ZmOperation.KEY_ID);
	switch (operation) {

		case ZmOperation.IM_SORT_BY_PRESENCE:
			this.sort(ZmImApp.BUDDY_SORT_PRESENCE, true);
			break;

		case ZmOperation.IM_SORT_BY_NAME:
			this.sort(ZmImApp.BUDDY_SORT_NAME, true);
			break;

		case ZmOperation.IM_TOGGLE_OFFLINE:
			this.__filterOffline = !this.__filterOffline;
			appCtxt.getSettings().getSetting(ZmSetting.IM_PREF_HIDE_OFFLINE).setValue(this.__filterOffline);
			this._updateFilter(ZmImOverview.FILTER_OFFLINE_BUDDIES, this.__filterOffline);
			break;

		case ZmOperation.IM_TOGGLE_BLOCKED:
			this.__filterBlocked = !this.__filterBlocked;
			appCtxt.getSettings().getSetting(ZmSetting.IM_PREF_HIDE_BLOCKED).setValue(this.__filterBlocked);
			this._updateFilter(ZmImOverview.FILTER_BLOCKED_BUDDIES, this.__filterBlocked);
			break;

		default:
			var ctrl = appCtxt.getApp("IM").getImController();
			var listener = ctrl._listeners[operation];
			if (listener) {
				var args = { dwtObj : ev.dwtObj };
				if (useActionedItem && this._actionedItem) {
					var data = this._actionedItem.getData("ZmImOverview.data");
					args.type = data.type;
					args.buddy = data.buddy;
					args.group = data.group;
					args.actionedItem = this._actionedItem;
				}
				listener.handleEvent(args);
			}
	}
};

ZmImOverview.PRESENCE_SORT_INDEX = {
        CHAT     : 1,
        ONLINE   : 2,
        AWAY     : 3,
        XA       : 4,
        DND      : 5,
        OFFLINE  : 6,
        UNKNOWN  : 7
};

ZmImOverview.CMP_SORT_BY_NAME = function(a, b) {
        a = a.getData("ZmImOverview.data").buddy.getDisplayName();
        b = b.getData("ZmImOverview.data").buddy.getDisplayName();
        return a < b ? -1 : (a > b ? 1 : 0);
};

ZmImOverview.CMP_SORT_BY_PRESENCE = function(a, b) {
        var ai = ZmImOverview.PRESENCE_SORT_INDEX[a.getData("ZmImOverview.data").buddy.getPresence().getShow()] || 100;
        var bi = ZmImOverview.PRESENCE_SORT_INDEX[b.getData("ZmImOverview.data").buddy.getPresence().getShow()] || 100;
        if (ai == bi) {
                // same staus goes to sort by name
                return ZmImOverview.CMP_SORT_BY_NAME(a, b);
        }
        return ai - bi;
};

ZmImOverview.prototype.sort = function(by, immediate) {
	if (by && (by != this._sortBy)) {
		this._sortBy = by;
		appCtxt.getSettings().getSetting("IM_PREF_BUDDY_SORT").setValue(by);
	}
	// Unless specifically requested, sort on a timer to prevent lots
	// of sorts when starting up.
	if (immediate) {
		if (this._sortActionId) {
			AjxTimedAction.cancelAction(this._sortActionId);
		}
		this._doSort();
	} else if (!this._sortActionId) {
		this._doSortAction = this._doSortAction || new AjxTimedAction(this, this._doSort);
		this._sortActionId = AjxTimedAction.scheduleAction(this._doSortAction, 1000);
	}
};

ZmImOverview.prototype._doSort = function() {
	this._sortActionId = null;

	var root = this._rootItem;
        // groups are always sorted by name
	var items = root.getItems();
	var cmp = this._sortBy == ZmImApp.BUDDY_SORT_PRESENCE
			? ZmImOverview.CMP_SORT_BY_PRESENCE
			: ZmImOverview.CMP_SORT_BY_NAME;
	for (var i = 0; i < items.length; ++i) {
		var item = items[i];
		item.sort(cmp);
	}
};

ZmImOverview.prototype.chatWithBuddy = function(buddy) {
        var ctrl = AjxDispatcher.run("GetChatListController");
        ctrl.chatWithRosterItem(buddy);
        if (ZmImNewChatDlg._INSTANCE)
                ZmImNewChatDlg._INSTANCE.popdown();
};

ZmImOverview.prototype._actionMenuPopdownListener = function() {
        if (this._actionedItem)
                this._actionedItem._setActioned(false);
};

ZmImOverview.prototype._getActionMenu = function(nodeType, buddy, group) {
	var ops = this._actionMenuOps[nodeType];
	if (ops) {
		var menu = ops._dwtControl;
		if (!menu) {
			var dialog = this;
			while (dialog && !(dialog instanceof DwtDialog))
				dialog = dialog.parent;
			menu = ops._dwtControl = new ZmActionMenu({ parent	: this,
				menuItems : ops });
			var listener = new AjxListener(this, this._actionMenuListener, [true]);
			for (var i = 0; i < menu.opList.length; ++i) {
				var item = menu.opList[i];
				menu.addSelectionListener(item, listener);
			}
			menu.addPopdownListener(this._actionMenuPopdownListener);
		}
		if (nodeType == "buddy") {
			// update menu items depending on wether we do
			// or don't have an Abook contact associated
			// with this buddy
			var contact = buddy.getContact();
			menu.getOp(ZmOperation.IM_ADD_TO_CONTACT).setVisible(!contact);
			menu.getOp(ZmOperation.IM_CREATE_CONTACT).setVisible(!contact);
			menu.getOp(ZmOperation.IM_EDIT_CONTACT).setVisible(!!contact);
		} else if (nodeType == "root") {
			this._setCheckOp(menu, ZmOperation.IM_TOGGLE_OFFLINE, this.__filterOffline);
			this._setCheckOp(menu, ZmOperation.IM_TOGGLE_BLOCKED, this.__filterBlocked);
			this._setCheckOp(menu, ZmOperation.IM_SORT_BY_PRESENCE, this._sortBy == ZmImApp.BUDDY_SORT_PRESENCE);
			this._setCheckOp(menu, ZmOperation.IM_SORT_BY_NAME, this._sortBy == ZmImApp.BUDDY_SORT_NAME);
		}
		return menu;
	}
};

// This is called when the clicking in the tree view, but only if
// no tree item was clicked.
ZmImOverview.prototype._treeMouseUpListener = function(ev) {
	if ((ev.button == DwtMouseEvent.RIGHT)) {
		if (!this._treeViewActionMenu) {
			var list = [ZmOperation.NEW_ROSTER_ITEM, ZmOperation.IM_NEW_CHAT];
			this._treeViewActionMenu = new ZmActionMenu({parent:this.shell, menuItems:list});
			var listener = new AjxListener(this, this._actionMenuListener, [false]);
			for (var i = 0, count = list.length; i < count; i++) {
				this._treeViewActionMenu.addSelectionListener(list[i], listener);
			}
		}
		this._treeViewActionMenu.popup(0, ev.docX,  ev.docY);
	}
};

ZmImOverview.prototype._treeSelectionListener = function(ev) {
	if (ev.detail != DwtTree.ITEM_ACTIONED &&
		ev.detail != DwtTree.ITEM_SELECTED &&
		ev.detail != DwtTree.ITEM_DBL_CLICKED)
		return;

	var data = ev.item.getData("ZmImOverview.data");
	var type = data.type;
	var group = data.group;
	var buddy = data.buddy;

	if (ev.detail == DwtTree.ITEM_ACTIONED) {
		var menu = this._getActionMenu(type, buddy, group);
		if (menu) {
			this._actionedItem = ev.item;
			menu.popup(0, ev.docX, ev.docY);
		}
	} else if (ev.detail == DwtTree.ITEM_SELECTED && buddy) {
		var ctrl = AjxDispatcher.run("GetChatListController");
		ctrl.selectChatForRosterItem(buddy);
	} else if (ev.detail == DwtTree.ITEM_DBL_CLICKED) {
		if (buddy) {
			this.chatWithBuddy(buddy);
		} else if (group) {
			ev.item.setExpanded(!ev.item.getExpanded());
		}
	}
};

ZmImOverview.prototype._init = function() {

	var dropTgt = this._groupDropTgt = new DwtDropTarget([ "ZmRosterItem" ]);
	dropTgt.addDropListener(new AjxListener(this, this._groupDropListener));

	var treeArgs = {
		parent:this,
		className: this._options.overviewId ? "OverviewTree" : null
	};
	var tree = this._tree = new DwtTree(treeArgs);
	tree.getHtmlElement().style.width = "100%";
	if (!this._options.overviewId) {
		tree.getHtmlElement().style.overflow = "auto";
	}
	if (!this._options.inactiveTree)
		tree.addSelectionListener(new AjxListener(this, this._treeSelectionListener));
	tree.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._treeMouseUpListener));

	// create the root item
	this._rootItem = new DwtHeaderTreeItem({
		parent:tree,
		overview: this,
		className:"overviewHeader",
		button: {
			image: "NewContact",
			tooltip: ZmMsg.createNewRosterItem,
			callback: new AjxCallback(null, ZmImOverview.newBuddy)
		}
	});
	this._rootItem.setData("ZmImOverview.data", { type: "root" });
	this._rootItem.setText(ZmMsg.buddyList);
	this._rootItem.enableSelection(false);

	if (!this._options.noAssistant) {
		// Zimbra Assistant buddy
		var roster = this._roster = AjxDispatcher.run("GetRoster");
		var buddyList = roster.getRosterItemList();
		var assistant = new ZmAssistantBuddy(buddyList);
		this._createTreeItems("assistant", assistant);
	}

	this._rosterItemListListenerObj = new AjxListener(this, this._rosterItemListListener);
	ZmImApp.INSTANCE.addRosterItemListListener(this._rosterItemListListenerObj);
	if (ZmImApp.INSTANCE.hasRoster()) {
		roster = this._roster = AjxDispatcher.run("GetRoster");
		buddyList = roster.getRosterItemList();
	}
	if (roster && buddyList.size()) {
		this._createFilterItem();
		buddyList.getVector().foreach(this._createBuddy, this);
		this.sort();
	} else {
		this._infoItem = new ZmInfoTreeItem({parent:this._rootItem});
		this._infoItem.setData("ZmImOverview.data", { type: "infoItem" });
		this._showInfoItem(roster ? ZmImOverview.NO_BUDDIES : ZmImOverview.NOT_LOGGED_IN);
	}
	tree.addSeparator();

	if (!this._options.overviewId) {
		this.addControlListener(new AjxListener(this, this._controlListener));
	}

	if (this._options.expanded) {
		this._rootItem.setExpanded(true);
	} else {
		tree.addTreeListener(new AjxListener(this, this._treeListener));
	}
};

ZmImOverview.prototype._treeListener =
function(ev) {
	// The first time the root is expanded, also expand the "Buddies" group.
	if (!this._didInitialExpand &&
		(ev.detail == DwtTree.ITEM_EXPANDED) &&
		ev.items.length &&
		(ev.items[0] == this._rootItem))
	{
		var buddiesItem = this._groupItems[ZmMsg.buddies];
		if (buddiesItem) {
			buddiesItem.setExpanded(true);
		}
		this._didInitialExpand = true;
	}
};

ZmImOverview.prototype._controlListener = function(ev) {
        var s1 = { x: ev.oldWidth, y: ev.oldHeight };
        var s2 = { x: ev.newWidth, y: ev.newHeight };
        //DBG.println(AjxDebug.DBG1, "x1: " + s1.x + ", y1: " + s1.y);
        //DBG.println(AjxDebug.DBG1, "x2: " + s2.x + ", y2: " + s2.y);
        if (s1.x != s2.x || s1.y != s2.y) {
                var h = s2.y;
                //this._tree.setSize(s2.x, h);
                if (AjxEnv.isIE) {
                        h -= 2;
                }
                this._tree.setSize(Dwt.DEFAULT, h);
        }
};

ZmImOverview.login = function() {
	AjxDispatcher.run("GetRoster");
};

ZmImOverview.newBuddy = function() {
	ZmImApp.INSTANCE.prepareVisuals();
	ZmImApp.INSTANCE.getImController()._newRosterItemListener();
};

ZmImOverview.prototype._createFilterItem =
function(expand) {
	if (ZmImOverview.FILTER_SEARCH && !this._filterItem) {
		// enable the search filter
		this._filterItem = new ZmBuddyFilterItem({parent:this._rootItem, overview: this});
		this._filterItem.setData("ZmImOverview.data", { type: "filter" });
		if (expand) {
			this._rootItem.setExpanded(true);
		}
	}
};

ZmImOverview.prototype._showInfoItem =
function(type) {
	if (this._infoItem) {
		switch(type) {
		case ZmImOverview.NO_MESSAGE:
			// Once we have buddies we can just delete the info item.
			this._showInfoItem(ZmImOverview.NO_MESSAGE);
			this._infoItem = null;
			break;
		case ZmImOverview.NOT_LOGGED_IN:
			this._infoItem.setText(AjxMessageFormat.format(ZmMsg.imNotLoggedIn, "ZmImOverview.login()"));
			break;
		case ZmImOverview.LOADING:
			this._infoItem.setText(ZmMsg.loading);
			break;
		case ZmImOverview.NO_BUDDIES:
			this._infoItem.setText(AjxMessageFormat.format(ZmMsg.imNoBuddies, "ZmImOverview.newBuddy()"));
			break;
		}
	}
};

ZmImOverview.prototype._rosterItemListListener =
function(ev) {
	if (!this._roster) {
		this._roster = ZmImApp.INSTANCE.getRoster();
	}
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_LOAD) {
		if (this._infoItem) {
			this._showInfoItem(ZmImOverview.LOADING);
			this._loadingAction = new AjxTimedAction(this, this._loadingTimedOut);
			AjxTimedAction.scheduleAction(this._loadingAction, 5000);
		}
	} else if (ev.event == ZmEvent.E_CREATE) {
		if (this._infoItem) {
			var expand = this._rootItem.getExpanded();
			this._infoItem.dispose();
			this._infoItem = null;
			this._createFilterItem(expand);
		}
		if (this._loadingAction) {
			AjxTimedAction.cancelAction(this._loadingAction);
		}
		var buddies = AjxVector.fromArray(ev.getItems());
		buddies.foreach(this._createBuddy, this);
		if (buddies.size()) {
			this.sort();
		}
	} else if (ev.event == ZmEvent.E_MODIFY) {
		this._modifyBuddies(ev.getItems(), fields);
	} else if (ev.event == ZmEvent.E_REMOVE ||
			   ev.event == ZmEvent.E_DELETE) {
		var buddies = AjxVector.fromArray(ev.getItems());
		buddies.foreach(this._removeBuddy, this);
	}
};

ZmImOverview.prototype._loadingTimedOut = function() {
	delete this._loadingAction;
	if (this._infoItem) {
		this._showInfoItem(ZmImOverview.NO_BUDDIES);
	}
};

ZmImOverview.prototype._groupDropListener = function(ev) {
        if (!ev.srcData)
                return false;
        if (ev.action == DwtDropEvent.DRAG_ENTER) {
                ev.doIt = this._groupDropTgt.isValidTarget(ev.srcData);
        } else if (ev.action == DwtDropEvent.DRAG_DROP) {
                var buddy = ev.srcData;
                var from_group = buddy._drag_from_group;
                var to_group = ev.targetControl.getData("ZmImOverview.data").group;
                var groups = AjxVector.fromArray(buddy.getGroups());
                if (from_group != to_group && groups.indexOf(to_group) == -1) {
                        groups.remove(from_group);
                        groups.add(to_group);
                        var name = buddy.getDisplayName();
                        var addr = buddy.getAddress();
                        AjxDispatcher.run("GetRoster").createRosterItem(addr, name, groups.join(","));
                }
        }
};

ZmImOverview.prototype._getBuddyIcon = function(buddy) {
        var roster = AjxDispatcher.run("GetRoster");
        var pl = roster.getPrivacyList();
        return pl.isDenied(buddy.getAddress()) ? "BlockUser" : buddy.getPresence().getIcon();
};

ZmImOverview.prototype._createBuddy = function(buddy) {
	return this._createTreeItems("buddy", buddy);
};

ZmImOverview.prototype._createTreeItems = function(type, buddy) {
	var groups = buddy.getGroups();
	if (groups.length == 0) {
		groups = type == "buddy"
				? [ ZmMsg.buddies ] // default to "Buddies"
				: [ null ]; // add to root item for type == i.e. "assistant"
	}
	var label = buddy.getDisplayName();
	var icon = this._getBuddyIcon(buddy);
	var items = [];
	var rootExpanded = this._rootItem.getExpanded();
	for (var i = 0; i < groups.length; ++i) {
		var parent = this.getGroupItem(groups[i]);
		var item = new DwtTreeItem({parent:parent,
			index:this.getSortIndex(buddy, parent),
			text:label,
			imageInfo:icon});
		item.addClassName("ZmImPresence-" + buddy.getPresence().getShow());
		item.setToolTipContent("-"); // force it to have a tooltip
		item.getToolTipContent = AjxCallback.simpleClosure(buddy.getToolTip, buddy);
		item.setData("ZmImOverview.data", { type: type, buddy: buddy });
		item.setDragSource(this._im_dragSrc);
		items.push(item);
		if (this._options.expanded || (rootExpanded && (groups[i] == ZmMsg.buddies))) {
			parent.setExpanded(true);
		}
		var a = this._itemsById[buddy.getAddress()];
		if (!a)
			a = this._itemsById[buddy.getAddress()] = new AjxVector();
		a.add(item);
	}
	this.applyFilters(items);
};

ZmImOverview.prototype._modifyBuddies = function(buddies, fields) {
	var changedShow = false;
	var changedName = false;
	for (var i = 0,  count = buddies.length; i < count; i++) {
		var buddy = buddies[i];
		var items = this._itemsById[buddy.getAddress()];
		if (items) {
			var doGroups = ZmRosterItem.F_GROUPS in fields;
			if (doGroups) {
				this._removeBuddy(buddy);
				this._createTreeItems("buddy", buddy);
			} else {
				var doShow = ZmRosterItem.F_PRESENCE  in fields;
				var doUnread = ZmRosterItem.F_UNREAD	in fields;
				var doName = ZmRosterItem.F_NAME	  in fields;
				var doTyping = ZmRosterItem.F_TYPING	in fields;
				changedShow = changedShow || doShow;
				changedName = changedName || doName;
				items.foreach(function(item) {
					if (doShow) {
						item.setImage(this._getBuddyIcon(buddy));
						item.setClassName(item.getClassName());
						item.addClassName("ZmImPresence-" + buddy.getPresence().getShow());
					}
					if (doUnread || doName) {
						var txt = buddy.getDisplayName();
						if (buddy.getUnread()) {
							txt += " (" + buddy.getUnread() + ")";
							txt = txt.bold();
						}
						item.setText(txt);
					}
					if (doTyping) {
						item.condClassName(fields[ZmRosterItem.F_TYPING], "ZmRosterItem-typing");
					}
				}, this);
				this.applyFilters(items.getArray());
			}
		}
	}

	if ((changedShow && (this._sortBy == ZmImApp.BUDDY_SORT_PRESENCE)) ||
		(changedName)) {
		this.sort();
	}
};

ZmImOverview.prototype._removeBuddy = function(buddy) {
	var items = this._itemsById[buddy.getAddress()];
	items.foreach("dispose");
	this._itemsById[buddy.getAddress()] = null;
};

ZmImOverview.prototype.getGroupItem = function(group) {
	if (!group)
		return this._rootItem;
	var g = this._groupItems[group];
	if (!g) {
		g = this._groupItems[group] = new DwtTreeItem({parent:this._rootItem,
			index:this.getSortIndex(group), // index
			text:group, // text
			imageInfo:"ImGroup" // image
		});
		g.setToolTipContent("-");
		g.getToolTipContent = function() {
			var data = this.getData("ZmImOverview.data");
			return AjxMessageFormat.format(ZmMsg.imGroupItemTooltip, [ data.group, this.getItemCount() ]);
		};
		g.setData("ZmImOverview.data", { type: "group", group: group });
		g.setDropTarget(this._groupDropTgt);
	}
	return g;
};

ZmImOverview.prototype.getSortIndex = function(label, root) {
	var type = "buddy";
	if (root == null) {
		type = "group";
		root = this._rootItem;
		label = label.toLowerCase();
	}
	var items = root.getItems();
	for (var i = 0; i < items.length; ++i) {
		var item = items[i];
		var data = item.getData("ZmImOverview.data");
		if (data.type == "filter" || data.type == "infoItem") {
			continue;
		}
		if (type == "buddy") {
			// label is a buddy here (ZmRosterItem)
			if (this._sortBy == ZmImApp.BUDDY_SORT_NAME) {
				var txt = data.buddy.getDisplayName()
                                // txt can be null if type is "assistant"
				if (txt && txt.toLowerCase() > label.getDisplayName())
					break;
			} else if (this._sortBy == ZmImApp.BUDDY_SORT_PRESENCE) {
				var a = ZmImOverview.PRESENCE_SORT_INDEX[data.buddy.getPresence().getShow()] || 100;
				var b = ZmImOverview.PRESENCE_SORT_INDEX[label.getPresence().getShow()] || 100;
				if (a > b)
					break;
			}
		} else {
			var txt = data.group;
			if (txt && txt.toLowerCase() > label)
				break;
		}
	}
	return i;
};

ZmImOverview.prototype.addFilter = function(f) {
	// don't add same filter twice
	for (var i = this.__filters.length; --i >= 0;) {
		if (this.__filters[i] === f) {
			this.__filters.splice(i, 1);
		}
	}

	this.__filters.push(f);
	this.applyFilters();
};

ZmImOverview.prototype.removeFilter = function(f) {
	if (!this.__filters.length)
		return;

	for (var i = this.__filters.length; --i >= 0;) {
		if (this.__filters[i] === f) {
			this.__filters.splice(i, 1);
		}
	}

	// this is needed even if the array is empty in order to
	// redisplay any hidden items
	this.applyFilters(null, true);
};

ZmImOverview.prototype.applyFilters = function(items, doEmpty) {
	var filters = this.__filters;
	if (!filters.length && !doEmpty)
		return;
	this._firstFilterItem = null;
	var doItems = function(items) {
		var oneVisible = false;
		for (var j = items.length; --j >= 0;) {
			var item = items[j];
			var display = true;
			for (var k = filters.length; --k >= 0;) {
				var f = filters[k];
				if (f.call(this, item)) {
					display = false;
					break;
				}
			}
			if (!this._firstFilterItem && display)
				this._firstFilterItem = item;
			oneVisible = oneVisible || display;
			item.setVisible(display);
		}
		return oneVisible;
	};
	if (items) {
		doItems.call(this, items);
	} else if (this._rootItem) {
		var root = this._rootItem;
		var groups = root.getItems();
		for (var i = groups.length; --i >= 0;) {
			var group = groups[i];
			var items = group.getItems();
			var oneVisible = doItems.call(this, items) || items.length == 0;
			group.setVisible(oneVisible);
			if (oneVisible)
				group.setExpanded(true);
		}
	}
};

ZmImOverview.FILTER_OFFLINE_BUDDIES = function(item) {
	var rti = item.getData("ZmImOverview.data").buddy;
	var presence = rti.getPresence();
	return presence.getShow() == ZmRosterPresence.SHOW_OFFLINE;
};

ZmImOverview.FILTER_BLOCKED_BUDDIES = function(item) {
	var rti = item.getData("ZmImOverview.data").buddy;
	return AjxDispatcher.run("GetRoster").getPrivacyList().isDenied(rti.getAddress());
};

// comment this out if we want to disable the search input field
ZmImOverview.FILTER_SEARCH = {
	func : function(item) {
		var search = this.__searchInputEl.value.toLowerCase();
		var rti = item.getData("ZmImOverview.data").buddy;
		if (/^#/.test(search)) {
			// search address -- easy way to display only Y! buddies, for instance.
			return rti.getAddress().indexOf(search.substr(1)) < 0;
		} else {
			return rti.getDisplayName().toLowerCase().indexOf(search) < 0;
		}
	},

	_doKeyPress : function() {
		var search = this.__searchInputEl.value;
		if (!/\S/.test(search) || search == ZmMsg.filter)
			this.removeFilter(ZmImOverview.FILTER_SEARCH.func);
		else
			this.addFilter(ZmImOverview.FILTER_SEARCH.func);
	},

	inputFocus : function() {
		Dwt.delClass(this.__searchInputEl, "DwtSimpleInput-hint", "DwtSimpleInput-focused");
		if (this.__searchInputEl.value == ZmMsg.filter)
			this.__searchInputEl.value = "";
		else try {
			this.__searchInputEl.select();
		} catch(ex) { }
		;
	},

	inputBlur : function() {
		Dwt.delClass(this.__searchInputEl, "DwtSimpleInput-focused", "DwtSimpleInput-hint");
		if (!/\S/.test(this.__searchInputEl.value))
			this.__searchInputEl.value = ZmMsg.filter;
	},

	inputKeyPress : function(ev) {
		if (!ev)
			ev = window.event;

		if (this.__searchInputTimeout)
			clearTimeout(this.__searchInputTimeout);

		if (ev.keyCode == 27) {
			this.__searchInputEl.value = "";
			ZmImOverview.FILTER_SEARCH._doKeyPress.call(this);
			ZmImOverview.FILTER_SEARCH.inputBlur.call(this);
			this.__searchInputEl.blur();
		}

		if (ev.keyCode == 13) {
			// filter right now
			ZmImOverview.FILTER_SEARCH._doKeyPress.call(this);

			if (!/\S/.test(this.__searchInputEl.value))
				return;

                        // initiate chat with the first item, if found
			if (this._firstFilterItem) {
				this.chatWithBuddy(rti);

                                // and clear value to reset filters
				this.__searchInputEl.value = "";

				ZmImOverview.FILTER_SEARCH.inputBlur.call(this);
				this.__searchInputEl.blur();
			}
		}

		this.__searchInputTimeout = setTimeout(
				AjxCallback.simpleClosure(
						ZmImOverview.FILTER_SEARCH._doKeyPress, this
						), 500);
	}
};



///////////////////////////////////////////////////////////////////////////

ZmBuddyFilterItem = function(params) {
	this.overview = params.overview;
	params.className = "ZmBuddyFilterItem";
	DwtTreeItem.call(this, params);
}

ZmBuddyFilterItem.prototype = new DwtTreeItem;
ZmBuddyFilterItem.prototype.constructor = ZmBuddyFilterItem;

ZmBuddyFilterItem.prototype.toString =
function() {
	return "ZmBuddyFilterItem";
};

ZmBuddyFilterItem.prototype._createHtmlFromTemplate =
function(templateId, data) {
	// Completely overriding the usual _createHtmlFromTemplate, and not using
	// a template because this's html element has not been added to the dom by
	// the time we get here.
	var div = this.getHtmlElement();
	div.className = "ZmBuddyFilterItem";
	var input = div.ownerDocument.createElement("input");
	this.overview.__searchInputEl = input;
	input.autocomplete = "off";
	input.className = "DwtSimpleInput";
	div.appendChild(input);
	input.onkeydown = AjxCallback.simpleClosure(ZmImOverview.FILTER_SEARCH.inputKeyPress, this.overview);
	input.onfocus = AjxCallback.simpleClosure(ZmImOverview.FILTER_SEARCH.inputFocus, this.overview);
	input.onblur = AjxCallback.simpleClosure(ZmImOverview.FILTER_SEARCH.inputBlur, this.overview);
	input.onblur();
};

///////////////////////////////////////////////////////////////////////////

ZmInfoTreeItem = function(params) {
	params.className = "ZmInfoTreeItem";
	DwtTreeItem.call(this, params);
}

ZmInfoTreeItem.prototype = new DwtTreeItem;
ZmInfoTreeItem.prototype.constructor = ZmInfoTreeItem;

ZmInfoTreeItem.prototype.TEMPLATE = "im.Chat#ZmInfoTreeItem";

ZmInfoTreeItem.prototype.toString =
function() {
	return "ZmInfoTreeItem";
};
