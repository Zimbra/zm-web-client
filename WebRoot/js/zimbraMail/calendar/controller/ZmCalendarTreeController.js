/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a calendar tree controller.
 * @constructor
 * @class
 * This class manages the calendar tree controller.
 *
 * @author Parag Shah
 *
 * @extends		ZmTreeController
 */
ZmCalendarTreeController = function() {

	ZmTreeController.call(this, ZmOrganizer.CALENDAR);

	this._listeners[ZmOperation.NEW_CALENDAR]			= this._newListener.bind(this);
	this._listeners[ZmOperation.ADD_EXTERNAL_CALENDAR]	= this._addExternalCalendarListener.bind(this);
	this._listeners[ZmOperation.CHECK_ALL]				= this._checkAllListener.bind(this);
	this._listeners[ZmOperation.CLEAR_ALL]				= this._clearAllListener.bind(this);
	this._listeners[ZmOperation.DETACH_WIN]				= this._detachListener.bind(this);
	this._listeners[ZmOperation.SHARE_CALENDAR]			= this._shareCalListener.bind(this);
    this._listeners[ZmOperation.MOVE]					= this._moveListener.bind(this);
	this._listeners[ZmOperation.RECOVER_DELETED_ITEMS]	= this._recoverListener.bind(this);

	this._eventMgrs = {};
};

ZmCalendarTreeController.prototype = new ZmTreeController;
ZmCalendarTreeController.prototype.constructor = ZmCalendarTreeController;

ZmCalendarTreeController.prototype.isZmCalendarTreeController = true;
ZmCalendarTreeController.prototype.toString = function() { return "ZmCalendarTreeController"; };

ZmCalendarTreeController.prototype._initializeActionMenus = function() {
	ZmTreeController.prototype._initializeActionMenus.call(this);

	var ops = this._getRemoteActionMenuOps();
	if (!this._remoteActionMenu && ops) {
		var args = [this._shell, ops];
		this._remoteActionMenu = new AjxCallback(this, this._createActionMenu, args);
	}

}

ZmCalendarTreeController.prototype._treeListener =
function(ev) {

    ZmTreeController.prototype._treeListener.call(this, ev);

	if(ev.detail == DwtTree.ITEM_EXPANDED){
        var calItem = ev.item;
        var calendar = calItem.getData(Dwt.KEY_OBJECT);
        if(calendar && calendar.isRemote() && calendar.isMountpoint){
            this._fixupTreeNode(calItem, calendar, calItem._tree);
        }
	}
};

// Public methods

/**
 * Displays the tree of this type.
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{constant}	params.overviewId		the overview ID
 * @param	{Boolean}	params.showUnread		if <code>true</code>, unread counts will be shown
 * @param	{Object}	params.omit				a hash of organizer IDs to ignore
 * @param	{Object}	params.include			a hash of organizer IDs to include
 * @param	{Boolean}	params.forceCreate		if <code>true</code>, tree view will be created
 * @param	{String}	params.app				the app that owns the overview
 * @param	{Boolean}	params.hideEmpty		if <code>true</code>, don't show header if there is no data
 * @param	{Boolean}	params.noTooltips	if <code>true</code>, don't show tooltips for tree items
 */
ZmCalendarTreeController.prototype.show = function(params) {
	params.include = params.include || {};
    params.include[ZmFolder.ID_TRASH] = true;
    params.showUnread = false;
    return ZmFolderTreeController.prototype.show.call(this, params);
};

/**
 * Gets all calendars.
 * 
 * @param	{String}	overviewId		the overview id
 * @param   {boolean}   includeTrash    True to include trash, if checked.
 * @return	{Array}		an array of {@link ZmCalendar} objects
 */
ZmCalendarTreeController.prototype.getCalendars =
function(overviewId, includeTrash) {
	var calendars = [];
	var items = this._getItems(overviewId);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item._isSeparator) { continue; }
	    var calendar = item.getData(Dwt.KEY_OBJECT);
        if (calendar) {
            if (calendar.id == ZmOrganizer.ID_TRASH && !includeTrash) continue;
			calendars.push(calendar);
        }
	}

	return calendars;
};

/**
 * Gets the owned calendars.
 * 
 * @param	{String}	overviewId		the overview id
 * @param	{String}	owner		the owner
 * @return	{Array}		an array of {@link ZmCalendar} objects
 */
ZmCalendarTreeController.prototype.getOwnedCalendars =
function(overviewId, owner) {
	var calendars = [];
	var items = this._getItems(overviewId);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (!item || item._isSeparator) { continue; }
		var calendar = item.getData(Dwt.KEY_OBJECT);
		if (calendar && calendar.getOwner() == owner) {
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
		// Each event manager has its own selection event to avoid multi-threaded
		// collisions
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

ZmCalendarTreeController.prototype.resetOperations = 
function(actionMenu, type, id) {
	if (actionMenu && !appCtxt.isWebClientOffline()) {
		var calendar = appCtxt.getById(id);
		var nId;
		if (calendar) {
			nId = calendar.nId;
            var isShareVisible = (!calendar.link || calendar.isAdmin()) && nId != ZmFolder.ID_TRASH;
            if (appCtxt.isOffline) {
                var acct = calendar.getAccount();
                isShareVisible = !acct.isMain && acct.isZimbraAccount;
            }
			actionMenu.enable(ZmOperation.SHARE_CALENDAR, isShareVisible);
			actionMenu.enable(ZmOperation.SYNC, calendar.isFeed());
		} else {
			nId = ZmOrganizer.normalizeId(id);
		}
		var isTrash = (nId == ZmFolder.ID_TRASH);
		actionMenu.enable(ZmOperation.DELETE_WITHOUT_SHORTCUT, (nId != ZmOrganizer.ID_CALENDAR && nId != ZmOrganizer.ID_TRASH));
		this.setVisibleIfExists(actionMenu, ZmOperation.EMPTY_FOLDER, nId == ZmFolder.ID_TRASH);
		var hasContent = ((calendar.numTotal > 0) || (calendar.children && (calendar.children.size() > 0)));
		actionMenu.enable(ZmOperation.EMPTY_FOLDER,hasContent);

        var moveItem = actionMenu.getItemById(ZmOperation.KEY_ID,ZmOperation.MOVE);

		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
		if (id == rootId) {
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

		this._enableRecoverDeleted(actionMenu, isTrash);

		// we always enable sharing in case we're in multi-mbox mode
		this._resetButtonPerSetting(actionMenu, ZmOperation.SHARE_CALENDAR, appCtxt.get(ZmSetting.SHARING_ENABLED));
		this._resetButtonPerSetting(actionMenu, ZmOperation.FREE_BUSY_LINK, appCtxt.getActiveAccount().isZimbraAccount);

        var fbLinkMenuItem = actionMenu.getMenuItem(ZmOperation.FREE_BUSY_LINK);
        if (fbLinkMenuItem){
            //setting up free busy link submenu
            actionMenu._fbLinkSubMenu = actionMenu._fbLinkSubMenu || this._getFreeBusySubMenu(actionMenu, calendar.restUrl);

            fbLinkMenuItem.setMenu(actionMenu._fbLinkSubMenu);
        }

        actionMenu.enable(ZmOperation.NEW_CALENDAR, !isTrash && !appCtxt.isExternalAccount() && !appCtxt.isWebClientOffline());

    }
};

ZmCalendarTreeController.prototype._getFreeBusySubMenu =
function(actionMenu, restUrl){
        var subMenuItems = [ZmOperation.SEND_FB_HTML,ZmOperation.SEND_FB_ICS,ZmOperation.SEND_FB_ICS_EVENT];
        var params = {parent:actionMenu, menuItems:subMenuItems};
	    var subMenu = new ZmActionMenu(params);
        for(var s=0;s<subMenuItems.length;s++){
            subMenu.addSelectionListener(subMenuItems[s], this._freeBusyLinkListener.bind(this, subMenuItems[s], restUrl) );
        }
        return subMenu;
}

ZmCalendarTreeController.prototype._detachListener =
function(ev){
	var folder = this._getActionedOrganizer(ev);
    if (!folder){
        return;
    }
    var acct = folder.getAccount();
    var noRemote = true;  // noRemote is to achieve a restUrl that points to user's mailbox instead of the shared calendar owner's mailbox
    var url = folder.getRestUrl(acct, noRemote);
    if (url) {
		window.open(url+".html?tz=" + AjxTimezone.DEFAULT, "_blank");
	}
};

ZmCalendarTreeController.prototype._freeBusyLinkListener =
function(op, restUrl, ev){
	var inNewWindow = false;
	var app = appCtxt.getApp(ZmApp.CALENDAR);
	if (app) {
		inNewWindow = app._inNewWindow(ev);
	}
	restUrl = restUrl || appCtxt.get(ZmSetting.REST_URL);
	if (restUrl) {
	   restUrl += op === ZmOperation.SEND_FB_ICS_EVENT ? "?fmt=ifb&fbfmt=event" : op === ZmOperation.SEND_FB_ICS ? "?fmt=ifb" : "?fmt=freebusy";
	}
	var params = {
		action: ZmOperation.NEW_MESSAGE, 
		inNewWindow: inNewWindow,
		msg: (new ZmMailMsg()),
		extraBodyText: restUrl
	};
	AjxDispatcher.run("Compose", params);
};

ZmCalendarTreeController.prototype._recoverListener =
function(ev) {
	appCtxt.getDumpsterDialog().popup(this._getSearchFor(), this._getSearchTypes());
};

ZmCalendarTreeController.prototype._getSearchFor =
function(ev) {
	return ZmItem.APPT;
};

ZmCalendarTreeController.prototype._getSearchTypes =
function(ev) {
	return [ZmItem.APPT];
};

// Returns a list of desired header action menu operations
ZmCalendarTreeController.prototype._getHeaderActionMenuOps =
function() {
    var ops = [];
    if (appCtxt.getCurrentApp().containsWritableFolder()) {
        ops.push(ZmOperation.NEW_CALENDAR,
                    ZmOperation.ADD_EXTERNAL_CALENDAR,
                    ZmOperation.CHECK_ALL,
                    ZmOperation.CLEAR_ALL,
                    ZmOperation.SEP,
                    ZmOperation.FREE_BUSY_LINK);
    }
    else {
        ops.push(ZmOperation.CHECK_ALL,
                ZmOperation.CLEAR_ALL);
    }

	ops.push(ZmOperation.FIND_SHARES);

	return ops;
};


// Returns a list of desired remote shared mailbox action menu operations
ZmCalendarTreeController.prototype._getRemoteActionMenuOps = function() {
	return [ZmOperation.NEW_CALENDAR,
			ZmOperation.ADD_EXTERNAL_CALENDAR,
			ZmOperation.FREE_BUSY_LINK];
};

// Returns a list of desired action menu operations
ZmCalendarTreeController.prototype._getActionMenuOps = function() {

    if (appCtxt.getCurrentApp().containsWritableFolder()) {
        return [
            ZmOperation.NEW_CALENDAR,
	        ZmOperation.SYNC,
	        ZmOperation.EMPTY_FOLDER,
	        ZmOperation.RECOVER_DELETED_ITEMS,
            ZmOperation.SHARE_CALENDAR,
	        ZmOperation.MOVE,
            ZmOperation.DELETE_WITHOUT_SHORTCUT,
            ZmOperation.EDIT_PROPS,
            ZmOperation.DETACH_WIN
        ];
    }
    else {
        return [
            ZmOperation.EDIT_PROPS,
            ZmOperation.DETACH_WIN
        ];
    }
};

ZmCalendarTreeController.prototype.getItemActionMenu = function(ev, item) {
	var actionMenu = null;
	if (item.isRemoteRoot()) {
		actionMenu = this._getRemoteActionMenu();
	} else {
		actionMenu = ZmTreeController.prototype.getItemActionMenu.apply(this, arguments);
	}
	return actionMenu;
}

ZmCalendarTreeController.prototype._getRemoteActionMenu = function() {
	if (this._remoteActionMenu instanceof AjxCallback) {
		var callback = this._remoteActionMenu;
		this._remoteActionMenu = callback.run();
	}
	return this._remoteActionMenu;
};

ZmCalendarTreeController.prototype._getActionMenu =
function(ev) {
	var organizer = ev.item.getData(Dwt.KEY_OBJECT);
	if (organizer.type != this.type &&
        organizer.nId != ZmOrganizer.ID_TRASH) {
        return null;
    }
	var menu = ZmTreeController.prototype._getActionMenu.apply(this, arguments);
    if (appCtxt.isWebClientOffline())  {
        menu.enableAll(false);
    } else {
        var isTrash = organizer.nId == ZmOrganizer.ID_TRASH;
        //bug 67531: "Move" Option should be disabled for the default calendar
        var isCalendar = organizer.nId == ZmOrganizer.ID_CALENDAR;
        menu.enableAll(!isTrash);
        menu.enable(ZmOperation.MOVE, !isCalendar && !isTrash);
        menu.enable(ZmOperation.EMPTY_FOLDER, isTrash);
        var menuItem = menu.getMenuItem(ZmOperation.EMPTY_FOLDER);
        if (menuItem) {
            menuItem.setText(isTrash ? ZmMsg.emptyTrash : ZmMsg.emptyFolder);
        }
    }
    return menu;
};

// Method that is run when a tree item is left-clicked
ZmCalendarTreeController.prototype._itemClicked =
function(organizer) {
	if ((organizer.type != ZmOrganizer.CALENDAR) && !organizer.isRemoteRoot()) {
        if (organizer._showFoldersCallback) {
            organizer._showFoldersCallback.run();
            return;
        }

        if (organizer.nId == ZmOrganizer.ID_TRASH) {
			return;
		}

		var appId = ZmOrganizer.APP[organizer.type];
		var app = appId && appCtxt.getApp(appId);
		if (app) {
			var callback = new AjxCallback(this, this._postActivateApp, [organizer, app]);
			appCtxt.getAppController().activateApp(appId, null, callback);
		}
		else {
			appCtxt.setStatusMsg({
				msg:	AjxMessageFormat.format(ZmMsg.appUnknown, [appId]),
				level:	ZmStatusView.LEVEL_WARNING
			});
		}
	}
};

ZmCalendarTreeController.prototype._postActivateApp =
function(organizer, app) {
	var controller = appCtxt.getOverviewController();
	var overviewId = app.getOverviewId();
	var treeId = organizer.type;
	var treeView = controller.getTreeView(overviewId, treeId);
	if (treeView) {
		treeView.setSelected(organizer);
	}
};

// Handles a drop event
ZmCalendarTreeController.prototype._dropListener =
function(ev) {
	var data = ev.srcData.data;
    var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);

	var appts = (!(data instanceof Array)) ? [data] : data;
	var isShiftKey = (ev.shiftKey || ev.uiEvent.shiftKey);

	if (ev.action == DwtDropEvent.DRAG_ENTER) {

        var type = ev.targetControl.getData(ZmTreeView.KEY_TYPE);

        if(data instanceof ZmCalendar){
             ev.doIt = dropFolder.mayContain(data, type) && !data.isSystem();
        }
		else if (!(appts[0] instanceof ZmAppt)) {
			ev.doIt = false;
		}
		else if (this._dropTgt.isValidTarget(data)) {
			var type = ev.targetControl.getData(ZmTreeView.KEY_TYPE);
			ev.doIt = dropFolder.mayContain(data, type);

			var action;
			// walk thru the array and find out what action is allowed
			for (var i = 0; i < appts.length; i++) {
				if (appts[i] instanceof ZmItem) {
					action |= appts[i].getDefaultDndAction(isShiftKey);
				}
			}

			if (((action & ZmItem.DND_ACTION_COPY) != 0)) {
				var plusDiv = (appts.length == 1)
					? ev.dndProxy.firstChild.nextSibling
					: ev.dndProxy.firstChild.nextSibling.nextSibling;

				Dwt.setVisibility(plusDiv, true);
			}
		}
	}
	else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var ctlr = ev.srcData.controller;
		var cc = AjxDispatcher.run("GetCalController");
        if (!isShiftKey && cc.isMovingBetwAccounts(appts, dropFolder.id)) {
            var dlg = appCtxt.getMsgDialog();
            dlg.setMessage(ZmMsg.orgChange, DwtMessageDialog.WARNING_STYLE);
            dlg.popup();
		} else {
            if (data instanceof ZmCalendar) {
                this._doMove(data, dropFolder);
            } else {
                ctlr._doMove(appts, dropFolder, null, isShiftKey);
            }
		}
	}
};

ZmCalendarTreeController.prototype._dropToRemoteFolder =
function(name) {
    appCtxt.setStatusMsg(AjxMessageFormat.format(ZmMsg.calStatusUpdate, name));
}

ZmCalendarTreeController.prototype._changeOrgCallback =
function(controller, dialog, appts, dropFolder) {
	dialog.popdown();
    if(!dropFolder.noSuchFolder){
	    controller._doMove(appts, dropFolder, null, false);
    }
    else{
        var dialog = appCtxt.getMsgDialog();
        var msg = AjxMessageFormat.format(ZmMsg.noFolderExists, dropFolder.name);
        dialog.setMessage(msg);
        dialog.popup();
    }
};

/*
* Returns a "New Calendar" dialog.
*/
ZmCalendarTreeController.prototype._getNewDialog =
function() {
    return appCtxt.getNewCalendarDialog();
};

ZmCalendarTreeController.prototype._newCallback =
function(params) {
    // For a calendar, set the parent folder (params.l) if specified
    var folder = this._pendingActionData instanceof ZmOrganizer ? this._pendingActionData :
        (this._pendingActionData && this._pendingActionData.organizer);
    if (folder) {
        params.l = folder.id;
    }
    ZmTreeController.prototype._newCallback.call(this, params);
};



/*
* Returns an "External Calendar" dialog.
*/
ZmCalendarTreeController.prototype.getExternalCalendarDialog =
function(isGoogleAuthConfigured) {
    if(!this._externalCalendarDialog) {
        AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
	    this._externalCalendarDialog = new ZmExternalCalendarDialog({parent: this._shell, controller: this, isGoogleAuthConfigured: isGoogleAuthConfigured});
    }
    return this._externalCalendarDialog;
};

// Listener callbacks

/*
* Listener to handle new external calendar.
*/
ZmCalendarTreeController.prototype._addExternalCalendarListener =
function() {
	return AjxRpc.invoke(null, "/service/extension/oauth2/info/google", null, new AjxCallback(this, this._handleGoogleConfig), true);
};

ZmCalendarTreeController.prototype._handleGoogleConfig =
function(response){
	try {
		var responseJson = JSON.parse(response.text);
	} catch(e) {
		console.error("unable to handle Google Config get info response => ", e);
	}

	var dialog = this.getExternalCalendarDialog(responseJson && responseJson.data && responseJson.data.client_id);
	dialog.popup();
};

ZmCalendarTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);

	if (ev.type != this.type || ev.handled) { return; }

	var fields = ev.getDetail("fields") || {};
	if (ev.event == ZmEvent.E_CREATE ||
		ev.event == ZmEvent.E_DELETE ||
		(ev.event == ZmEvent.E_MODIFY && fields[ZmOrganizer.F_FLAGS]))
	{
		var aCtxt = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
		var controller = aCtxt.getApp(ZmApp.CALENDAR).getCalController();
		controller._updateCheckedCalendars();

		// if calendar is deleted, notify will initiate the refresh action
		if (ev.event != ZmEvent.E_DELETE) {
            var calIds = controller.getCheckedCalendarFolderIds();
            AjxDebug.println(AjxDebug.CALENDAR, "tree change listener refreshing calendar event '" + ev.event + "' with checked folder ids " + calIds.join(","));
			controller._refreshAction(true);
			ev.handled = true;
		}
    }
};

ZmCalendarTreeController.prototype._treeViewListener =
function(ev) {
	// handle item(s) clicked
	if (ev.detail == DwtTree.ITEM_CHECKED) {
		var overviewId = ev.item.getData(ZmTreeView.KEY_ID);
		var calendar = ev.item.getData(Dwt.KEY_OBJECT);

		//checkbox event may not be propagated to close action menu
		if (this._getActionMenu(ev)) {
			this._getActionMenu(ev).popdown();
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
	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

ZmCalendarTreeController.prototype._deleteListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
    if (organizer.isInTrash()) {
        var callback = new AjxCallback(this, this._deleteListener2, [organizer]);
        var message = AjxMessageFormat.format(ZmMsg.confirmDeleteCalendar, AjxStringUtil.htmlEncode(organizer.name));

        appCtxt.getConfirmationDialog().popup(message, callback);
    }
    else {
        this._doMove(organizer, appCtxt.getById(ZmFolder.ID_TRASH));
    }
};

ZmCalendarTreeController.prototype._deleteListener2 =
function(organizer) {
	this._doDelete(organizer);
};

/**
 * Empties a folder.
 * It removes all the items in the folder except sub-folders.
 * If the folder is Trash, it empties even the sub-folders.
 * A warning dialog will be shown before any folder is emptied.
 *
 * @param {DwtUiEvent}		ev		the UI event
 *
 * @private
 */
ZmCalendarTreeController.prototype._emptyListener =
function(ev) {
	this._getEmptyShieldWarning(ev);
};

ZmCalendarTreeController.prototype._notifyListeners =
function(overviewId, type, items, detail, srcEv, destEv) {
	if (this._eventMgrs[overviewId] &&
		this._eventMgrs[overviewId].isListenerRegistered(type))
	{
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
		var account = appCtxt.multiAccounts ? treeView._overview.account : null;
		if (!appCtxt.get(ZmSetting.CALENDAR_ENABLED, null, account)) { return []; }

		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, account);
		var root = treeView.getTreeItemById(rootId);
		if (root) {
			var totalItems = [];
			this._getSubItems(root, totalItems);
			return totalItems;
		}
	}
	return [];
};

ZmCalendarTreeController.prototype._getSubItems =
function(root, totalItems) {
	if (!root || (root && root._isSeparator)) { return; }

	var items = root.getItems();
    //items is an array
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item && !item._isSeparator) {
			totalItems.push(item);
			this._getSubItems(item, totalItems);
		}
	}
};

ZmCalendarTreeController.prototype._setAllChecked =
function(ev, checked) {
	var overviewId = this._actionedOverviewId;
	var items = this._getItems(overviewId);
	var checkedItems = [];
	var item, organizer;
	for (var i = 0;  i < items.length; i++) {
		item = items[i];
		if (item._isSeparator) { continue; }
		organizer = item.getData(Dwt.KEY_OBJECT);
		if (!organizer || organizer.type != ZmOrganizer.CALENDAR) { continue; }
		item.setChecked(checked);
		checkedItems.push(item);
	}

	// notify listeners of selection
	if (checkedItems.length && this._eventMgrs[overviewId]) {
		this._notifyListeners(overviewId, DwtEvent.SELECTION, checkedItems, DwtTree.ITEM_CHECKED, ev, this._eventMgrs[overviewId]._selEv);
	}
};

ZmCalendarTreeController.prototype._createTreeView =
function(params) {
	if (params.treeStyle == null) {
		params.treeStyle = DwtTree.CHECKEDITEM_STYLE;
	}
    params.showUnread = false;
	return new ZmTreeView(params);
};

ZmCalendarTreeController.prototype._postSetup =
function(overviewId, account) {
	ZmTreeController.prototype._postSetup.apply(this, arguments);

	// bug: 43067 - remove the default calendar since its only a place holder
	// for caldav based accounts
	if (account && account.isCalDavBased()) {
		var treeView = this.getTreeView(overviewId);
		var calendarId = ZmOrganizer.getSystemId(ZmOrganizer.ID_CALENDAR, account);
		var treeItem = treeView.getTreeItemById(calendarId);
		treeItem.dispose();
	}
};

/**
 * Pops up the appropriate "New ..." dialog.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * @param {ZmZimbraAccount}	account	used by multi-account mailbox (optional)
 *
 * @private
 */
ZmCalendarTreeController.prototype._newListener =
function(ev, account, isExternalCalendar) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var newDialog = this._getNewDialog();

    // Fix for Bug: 85158 and regression due to Bug: 82811
    // Pass a flag isExternalCalendar from ZmExternalCalendarDialog::_nextButtonListener to help decide creating external calendar or local calendar
    if (isExternalCalendar && this._extCalData) {
        var iCalData = this._extCalData.iCal;
        newDialog.setICalData(iCalData);
        newDialog.setTitle(ZmMsg.addExternalCalendar);
        newDialog.getButton(ZmNewCalendarDialog.BACK_BUTTON).setVisibility(true);
    }
    else {
        newDialog.setTitle(ZmMsg.createNewCalendar);
        newDialog.getButton(ZmNewCalendarDialog.BACK_BUTTON).setVisibility(false);
    }
	if (!this._newCb) {
		this._newCb = new AjxCallback(this, this._newCallback);
	}
	if (this._pendingActionData && !appCtxt.getById(this._pendingActionData.id)) {
		this._pendingActionData = appCtxt.getFolderTree(account).root;
	}

	if (!account && appCtxt.multiAccounts) {
		var ov = this._opc.getOverview(this._actionedOverviewId);
		account = ov && ov.account;
	}

	ZmController.showDialog(newDialog, this._newCb, this._pendingActionData, account);

	newDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newDialog);
};

ZmCalendarTreeController.prototype.setExternalCalendarData =
function(extCalData) {
    this._extCalData = extCalData;
};

ZmCalendarTreeController.prototype._clearDialog =
function(dialog) {
    ZmTreeController.prototype._clearDialog.apply(this, arguments);
    if(this._externalCalendarDialog) {
        this._externalCalendarDialog.popdown();
    }
};

ZmCalendarTreeController.prototype.createDataSourceErrorCallback =
function(response) {
    appCtxt.setStatusMsg(ZmMsg.addExternalCalendarError);
};

ZmCalendarTreeController.prototype.createDataSourceCallback =
function(response) {
    var dsResponse = response.getResponse(),
        sourceId =  dsResponse && dsResponse.caldav ? dsResponse.caldav[0].id : "",
        jsonObj,
        params;
    if(sourceId) {
        jsonObj = {
            ImportDataRequest : {
                _jsns : "urn:zimbraMail",
                caldav : {
                    id : sourceId
                }
            }
        };
        params = {
              soapDoc: jsonObj,
              asyncMode: false
            };
        appCtxt.getAppController().sendRequest(params);
    }

    appCtxt.setStatusMsg(ZmMsg.addExternalCalendarSuccess);
    return response;
};

ZmCalendarTreeController.POLLING_INTERVAL = "1m";
ZmCalendarTreeController.CONN_TYPE_CLEARTEXT = "cleartext";
ZmCalendarTreeController.CONN_TYPE_SSL = "ssl";
ZmCalendarTreeController.SSL_PORT = "443";
ZmCalendarTreeController.GOOGLE_CALDAV_SERVER = "www.google.com";
ZmCalendarTreeController.ALT_GOOGLE_CALDAV_SERVER = "apidata.googleusercontent.com";
ZmCalendarTreeController.DATA_SOURCE_ATTR_YAHOO = "p:/principals/users/_USERNAME_";
ZmCalendarTreeController.DATA_SOURCE_ATTR = "p:/calendar/dav/_USERNAME_/user";

ZmCalendarTreeController.prototype.createDataSource =
function(organizer, errorCallback) {
    var calDav = this._extCalData && this._extCalData.calDav ? this._extCalData.calDav : null;
    if(!calDav) { return; }

    var url,
        port,
        urlComponents,
        hostUrl,
        jsonObj,
        connType = ZmCalendarTreeController.CONN_TYPE_CLEARTEXT,
        dsa = ZmCalendarTreeController.DATA_SOURCE_ATTR;


    hostUrl = calDav.hostUrl;
    urlComponents = AjxStringUtil.parseURL(hostUrl);
	url = urlComponents.domain;
	port = urlComponents.port || ZmCalendarTreeController.SSL_PORT;    	
	dsa = urlComponents.path ? "p:" + urlComponents.path : ZmCalendarTreeController.DATA_SOURCE_ATTR;
    

    if(port == ZmCalendarTreeController.SSL_PORT) {
        connType = ZmCalendarTreeController.CONN_TYPE_SSL;
    }

    if (calDav.hostUrl.indexOf(ZmCalendarTreeController.GOOGLE_CALDAV_SERVER) === -1 
    	&& calDav.hostUrl.indexOf(ZmCalendarTreeController.ALT_GOOGLE_CALDAV_SERVER) === -1) { // Not google url
        dsa = ZmCalendarTreeController.DATA_SOURCE_ATTR_YAHOO;
    }

    jsonObj = {
        CreateDataSourceRequest : {
            _jsns : "urn:zimbraMail",
            caldav : {
                name : organizer.name,
                pollingInterval : ZmCalendarTreeController.POLLING_INTERVAL,
                isEnabled : "1",
                l : organizer.nId,
                host : url,
                port : port,
                connectionType : connType,
                username : calDav.userName,
                password : calDav.password,
                a : {
                    n : "zimbraDataSourceAttribute",
                    _content : dsa
                }
            }
        }
    };

    this._extCalData = null;
    delete this._extCalData;
    var accountName = (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null);

    var params = {
            jsonObj: jsonObj,
            asyncMode: true,
            sensitive: true,
            callback: new AjxCallback(this, this.createDataSourceCallback),
            errorCallback: new AjxCallback(this, this.createDataSourceErrorCallback),
            accountName: accountName
        };
    appCtxt.getAppController().sendRequest(params);
};
