/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates the calendar view controller.
 * @class
 * The strategy for the calendar is to leverage the list view stuff by creating a single
 * view (i.e. {@link ZmCalViewMgr}) and have it manage the schedule views (e.g. week, month) and
 * a single calendar view (the calendar widget to the right). Each of the schedule views
 * will be a list view that are managed by the {@link ZmCalViewMgr}.
 * <p>
 * To do this we have to trick the {@link ZmListController}. Specifically we have only one toolbar and
 * directly manipulate this._toolbar elements to point to a single instance of the toolbar. We also
 * directly override the {@link ZmListControl.initializeToolBar} method.
 *
 * @param {DwtComposite}	container	the containing element
 * @param {ZmCalendarApp}	calApp		the handle to the calendar application
 * 
 * @extends		ZmListController
 * 
 * @see	ZmListControl.initializeToolBar
 */
ZmCalViewController = function(container, calApp) {
	ZmListController.call(this, container, calApp);

	var apptListener = new AjxListener(this, this._handleApptRespondAction);
	var apptEditListener = new AjxListener(this, this._handleApptEditRespondAction);

	// get view based on op
	ZmCalViewController.OP_TO_VIEW = {};
	ZmCalViewController.OP_TO_VIEW[ZmOperation.DAY_VIEW]		= ZmId.VIEW_CAL_DAY;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WEEK_VIEW]		= ZmId.VIEW_CAL_WEEK;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WORK_WEEK_VIEW]	= ZmId.VIEW_CAL_WORK_WEEK;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.MONTH_VIEW]		= ZmId.VIEW_CAL_MONTH;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.CAL_LIST_VIEW]	= ZmId.VIEW_CAL_LIST;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.SCHEDULE_VIEW]	= ZmId.VIEW_CAL_SCHEDULE;

	// get op based on view
	ZmCalViewController.VIEW_TO_OP = {};
	for (var op in ZmCalViewController.OP_TO_VIEW) {
		ZmCalViewController.VIEW_TO_OP[ZmCalViewController.OP_TO_VIEW[op]] = op;
	}

	this._listeners[ZmOperation.REPLY_ACCEPT] = apptListener;
	this._listeners[ZmOperation.REPLY_DECLINE] = apptListener;
	this._listeners[ZmOperation.REPLY_TENTATIVE] = apptListener;
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT] = apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE] = apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE] = apptEditListener;
	this._listeners[ZmOperation.SHOW_ORIG] = new AjxListener(this, this._showOrigListener);
	this._listeners[ZmOperation.VIEW_APPOINTMENT] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.OPEN_APPT_INSTANCE] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.OPEN_APPT_SERIES] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.TODAY] = new AjxListener(this, this._todayButtonListener);
	this._listeners[ZmOperation.NEW_APPT] = new AjxListener(this, this._newApptAction);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT] = new AjxListener(this, this._newAllDayApptAction);
	this._listeners[ZmOperation.SEARCH_MAIL] = new AjxListener(this, this._searchMailAction);
	this._listeners[ZmOperation.CAL_REFRESH] = new AjxListener(this, this._refreshButtonListener);
	this._listeners[ZmOperation.MOVE]  = new AjxListener(this, this._apptMoveListener);
	this._listeners[ZmOperation.DELETE_INSTANCE]  = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.DELETE_SERIES]  = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.FORWARD_APPT]  = new AjxListener(this, this._forwardListener);
	this._listeners[ZmOperation.FORWARD_APPT_INSTANCE]  = new AjxListener(this, this._forwardListener);
	this._listeners[ZmOperation.FORWARD_APPT_SERIES]  = new AjxListener(this, this._forwardListener);

	this._treeSelectionListener = new AjxListener(this, this._calTreeSelectionListener);
	this._maintTimedAction = new AjxTimedAction(this, this._maintenanceAction);
	this._pendingWork = ZmCalViewController.MAINT_NONE;
	this.apptCache = new ZmApptCache(this);

	ZmCalViewController.OPS = [
		ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW,
		ZmOperation.MONTH_VIEW, ZmOperation.CAL_LIST_VIEW, ZmOperation.SCHEDULE_VIEW
	];

	this._errorCallback = new AjxCallback(this, this._handleError);

	// needed by ZmCalListView:
	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
	this._clearCacheFolderMap = {};	
};

ZmCalViewController.prototype = new ZmListController();
ZmCalViewController.prototype.constructor = ZmCalViewController;

ZmCalViewController.DEFAULT_APPOINTMENT_DURATION = 3600000;

// maintenance needed on views and/or minical
ZmCalViewController.MAINT_NONE 		= 0x0; // no work to do
ZmCalViewController.MAINT_MINICAL 	= 0x1; // minical needs refresh
ZmCalViewController.MAINT_VIEW 		= 0x2; // view needs refresh
ZmCalViewController.MAINT_REMINDER	= 0x4; // reminders need refresh

// get view based on op
ZmCalViewController.ACTION_CODE_TO_VIEW = {};
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_DAY_VIEW]			= ZmId.VIEW_CAL_DAY;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WEEK_VIEW]			= ZmId.VIEW_CAL_WEEK;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WORK_WEEK_VIEW]	= ZmId.VIEW_CAL_WORK_WEEK;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_MONTH_VIEW]		= ZmId.VIEW_CAL_MONTH;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_LIST_VIEW]			= ZmId.VIEW_CAL_LIST;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_SCHEDULE_VIEW]		= ZmId.VIEW_CAL_SCHEDULE;

ZmCalViewController.prototype.toString =
function() {
	return "ZmCalViewController";
};

// Zimlet hack
ZmCalViewController.prototype.postInitListeners =
function () {
	if (ZmZimlet.listeners && ZmZimlet.listeners["ZmCalViewController"]) {
		for(var ix in ZmZimlet.listeners["ZmCalViewController"]) {
			if(ZmZimlet.listeners["ZmCalViewController"][ix] instanceof AjxListener)  {
				this._listeners[ix] = ZmZimlet.listeners["ZmCalViewController"][ix];
			} else {
				this._listeners[ix] = new AjxListener(this, ZmZimlet.listeners["ZmCalViewController"][ix]);
			}
		}
	}
};

ZmCalViewController.prototype._defaultView =
function() {
	var view = appCtxt.get(ZmSetting.CALENDAR_INITIAL_VIEW);
	return ZmCalendarApp.VIEW_FOR_SETTING[view] || ZmId.VIEW_CAL_WORK_WEEK;
};

/**
 * Gets the first day of week setting.
 * 
 * @return	{int}	the first day of week index
 */
ZmCalViewController.prototype.firstDayOfWeek =
function() {
	return appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
};

ZmCalViewController.prototype.show =
function(viewId, startDate, skipMaintenance) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	if (!viewId || viewId == ZmId.VIEW_CAL) {
		viewId = this._currentView ? this._currentView : this._defaultView();
	}

	if (!this._viewMgr) {
		this.createViewMgr(startDate);
		this._setup(viewId);
	}

	if (!this._viewMgr.getView(viewId)) {
		this._setup(viewId);
	}

	this._viewMgr.setView(viewId);
	DBG.timePt("setup and set view");

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[ZmId.VIEW_CAL];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._viewMgr;
	this._setView({view:ZmId.VIEW_CAL, elements:elements, isAppView:true});
	this._currentView = this._viewMgr.getCurrentViewName();
	this._listView[this._currentView] = this._viewMgr.getCurrentView();
	this._resetToolbarOperations(viewId);

	switch(viewId) {
		case ZmId.VIEW_CAL_DAY:
		case ZmId.VIEW_CAL_SCHEDULE:
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousDay);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextDay);
			break;
		case ZmId.VIEW_CAL_WORK_WEEK:
			this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWorkWeek);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWorkWeek);
			break;
		case ZmId.VIEW_CAL_WEEK:
			this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWeek);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWeek);
			break;
		case ZmId.VIEW_CAL_MONTH:
			// use day until month does something
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousMonth);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextMonth);
			break;
		case ZmId.VIEW_CAL_LIST:
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous);
			this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next);
			break;
	}
	DBG.timePt("switching selection mode and tooltips");

	if (viewId == ZmId.VIEW_CAL_APPT) {
		this._navToolBar[ZmId.VIEW_CAL].setVisible(false);
	} else {
		this._navToolBar[ZmId.VIEW_CAL].setVisible(true);
		var cv = this._viewMgr.getCurrentView();
		var navText = viewId == ZmId.VIEW_CAL_MONTH
			? cv.getShortCalTitle()
			: cv.getCalTitle();
		this._navToolBar[ZmId.VIEW_CAL].setText(navText);
		if (!skipMaintenance) {
			var work = ZmCalViewController.MAINT_VIEW;
			if (window.inlineCalSearchResponse) {
				this.processInlineCalSearch();
				window.inlineCalSearchResponse = null;
				work = ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW|ZmCalViewController.MAINT_REMINDER;
			}
			this._scheduleMaintenance(work);
		}
		DBG.timePt("scheduling maintenance");
	}

	// do this last
	if (!this._calTreeController) {
		this._calTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
		if (this._calTreeController) {
			if (appCtxt.multiAccounts) {
				var overviews = this._app.getOverviewContainer().getOverviews();
				for (var i in overviews) {
					this._calTreeController.addSelectionListener(i, this._treeSelectionListener);
				}
			} else {
				this._calTreeController.addSelectionListener(this._app.getOverviewId(), this._treeSelectionListener);
			}
			var calTree = appCtxt.getFolderTree();
			if (calTree) {
				calTree.addChangeListener(new AjxListener(this, this._calTreeChangeListener));
			}
		}
		DBG.timePt("getting tree controller", true);
	}
};

/**
 * Gets the calendar tree controller.
 * 
 * @return	{ZmCalendarTreeController}		the controller
 */
ZmCalViewController.prototype.getCalTreeController =
function() {
	return this._calTreeController;
};

ZmCalViewController.prototype.createViewMgr =
function(startDate) {
	var newDate = startDate || (this._miniCalendar ? this._miniCalendar.getDate() : new Date());

	if (!this._miniCalendar) {
		this._createMiniCalendar(newDate);
	}

	this._viewMgr = new ZmCalViewMgr(this._container, this, this._dropTgt);
	this._viewMgr.setDate(newDate);
	this._viewMgr.addTimeSelectionListener(new AjxListener(this, this._timeSelectionListener));
	this._viewMgr.addDateRangeListener(new AjxListener(this, this._dateRangeListener));
	this._viewMgr.addViewActionListener(new AjxListener(this, this._viewActionListener));
	DBG.timePt("created view manager");
};

/**
 * Gets the checked calendars.
 * 
 * @param	{String}	overviewId		the overview id
 * @return	{Array}		an array of {ZmCalendar} objects
 */
ZmCalViewController.prototype.getCheckedCalendars =
function() {
	if (!this._checkedCalendars) {
		this._updateCheckedCalendars();
	}
	return this._checkedCalendars;
};

/**
 * Gets the checked calendar folder ids.
 * 
 * @param	{Boolean}	localOnly		if <code>true</code>, include local calendars only
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getCheckedCalendarFolderIds =
function(localOnly) {
	if (!this._checkedCalendarIds) {
		this.getCheckedCalendars();
		if (!this._checkedCalendarIds) {
			return [ZmOrganizer.ID_CALENDAR];
		}
	}
	return localOnly
		? this._checkedLocalCalendarIds
		: this._checkedCalendarIds;
};

ZmCalViewController.prototype._updateCheckedCalendars =
function() {
	var cc = [];
	if (this._calTreeController) {
		if (appCtxt.multiAccounts) {
			var overviews = this._app.getOverviewContainer().getOverviews();
			for (var i in overviews) {
				cc = cc.concat(this._calTreeController.getCheckedCalendars(i));
			}
		} else {
			// bug fix #25512 - avoid race condition
			if (!this._app._overviewPanelContent) {
				this._app.setOverviewPanelContent(true);
			}
			cc = this._calTreeController.getCheckedCalendars(this._app.getOverviewId());
		}
	} else {
		this._app._createDeferredFolders(ZmApp.CALENDAR);
		var list = appCtxt.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			var acct = list[i];
			if (!appCtxt.get(ZmSetting.CALENDAR_ENABLED, null, acct)) { continue; }

			var calendars = appCtxt.getFolderTree(acct).getByType(ZmOrganizer.CALENDAR);
			for (var j = 0; j < calendars.length; j++) {
				// bug: 43067: skip the default calendar for caldav based accounts
				if (acct.isCalDavBased() && calendars[j].nId == ZmOrganizer.ID_CALENDAR) {
					continue;
				}
				if (calendars[j].isChecked) {
					cc.push(calendars[j]);
				}
			}
		}
	}

	this._checkedCalendars = cc;
	this._checkedCalendarIds = [];
	this._checkedLocalCalendarIds = [];
	this._checkedAccountCalendarIds = [];
	var checkedAccountCalendarIds = {};

	for (var i = 0; i < cc.length; i++) {
		var cal = cc[i];
		if (cal.noSuchFolder) { continue; }

		var acctId = (appCtxt.multiAccounts)
			? cal.getAccount().id : appCtxt.accountList.mainAccount.id;

		if (!checkedAccountCalendarIds[acctId]) {
			checkedAccountCalendarIds[acctId] = [];
		}
		checkedAccountCalendarIds[acctId].push(cal.id);

		this._checkedCalendarIds.push(cal.id);
		if (cal.isRemote && !cal.isRemote()) {
			this._checkedLocalCalendarIds.push(cal.id);
		}
	}

	// convert hash to local array
	for (var i in checkedAccountCalendarIds) {
		this._checkedAccountCalendarIds.push(checkedAccountCalendarIds[i]);
	}

	// return list of checked calendars
	return cc;
};

ZmCalViewController.prototype._calTreeSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_CHECKED) { return; }

	// XXX: this is unnecessary since cal tree controller does this
//	this._updateCheckedCalendars();

	if (!this._calItemStatus) {
		this._calItemStatus = {};
	}

	if (ev.item) {
		ev.items = [ ev.item ];
	}
	if (ev.items && ev.items.length) {
		for (var i = 0; i < ev.items.length; i++) {
			var item = ev.items[i];
			this.__addCalItemStatus(item, item.getChecked());
		}
	}

	// update calendar state on time delay to avoid race condition
	if (!this._updateCalItemStateActionId) {
		this._updateCalItemStateActionId = AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._updateCalItemState), 1200);
	}
};

ZmCalViewController.prototype.__addCalItemStatus =
function(item, checked) {
	item.setChecked(checked);
	var organizer = item.getData(Dwt.KEY_OBJECT);
	if (organizer && organizer.type == ZmOrganizer.CALENDAR) {
		this._calItemStatus[organizer.id] = {item: organizer, checked: checked};
	}

	// bug 6410
	var items = item.getItems();
	for (var i = 0; i < items.length; i++) {
		item = items[i];
		this.__addCalItemStatus(item, checked);
	}
};

ZmCalViewController.prototype._updateCalItemState =
function() {
	if (!this._calItemStatus) { return; }

	var accountName = appCtxt.isOffline && appCtxt.accountList.mainAccount.name;
	var batchCmd = new ZmBatchCommand(null, accountName);
	var itemCount = 0;
	for (var i in this._calItemStatus) {
		var info = this._calItemStatus[i];
		if (info.item) {
			var calendar = info.item;
			batchCmd.add(new AjxCallback(calendar, calendar.checkAction, [info.checked]));
			itemCount++;
		}
	}

	this._calItemStatus = {};
	if (itemCount > 0) {
		batchCmd.run();
	}

	this._updateCalItemStateActionId = null;
};

ZmCalViewController.prototype._calTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_DELETE) {
		this._updateCheckedCalendars();
	}
};

/**
 * Gets the calendar by folder id.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{ZmCalendar}	the calendar
 */
ZmCalViewController.prototype.getCalendar =
function(folderId) {
	return appCtxt.getById(folderId);
};

/**
 * Gets the calendar for the specified account.
 *
 * @param   {Hash}      params              Param hash
 * @param	{Boolean}	params.includeLinks	if <code>true</code>, include links
 * @param   {Boolean}   params.onlyWritable if <code>true</code> only writable calendars
 * @param	{ZmAccount}	params.account		the account
 * @return	{Array}	an array of {ZmCalendar} objects
 */
ZmCalViewController.prototype.getCalendars =
function(params) {
    params = params || {};
    var account = params.account;
    var includeLinks = params.includeLinks;
    var onlyWritable = params.onlyWritable;
	this._updateCheckedCalendars();
	var calendars = [];
	var organizers = appCtxt.getFolderTree(account).getByType(ZmOrganizer.CALENDAR);
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		if ((organizer.zid && !includeLinks) ||
			(appCtxt.multiAccounts &&
			 organizer.nId == ZmOrganizer.ID_CALENDAR &&
			 organizer.getAccount().isCalDavBased()))
		{
			continue;
		}

		if (account && organizer.getAccount() != account) { continue; }

        if (onlyWritable && organizer.isReadOnly()) continue;

		calendars.push(organizer);
	}
	calendars.sort(ZmCalViewController.__BY_NAME);
	return calendars;
};

ZmCalViewController.__BY_NAME =
function(a, b) {
	return a.name.localeCompare(b.name);
};

// todo: change to currently "selected" calendar
ZmCalViewController.prototype.getDefaultCalendarFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

/**
 * Gets the calendar color.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{String}	the color
 */
ZmCalViewController.prototype.getCalendarColor =
function(folderId) {
	if (!folderId) { return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR]; }
	var cal = this.getCalendar(folderId);
	return cal ? cal.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR];
};

ZmCalViewController.prototype._refreshButtonListener =
function(ev) {
	// bug fix #33830 - force sync for calendar refresh
	if (appCtxt.isOffline) {
		appCtxt.accountList.syncAll();
	}

	// reset possibly set user query
	this._userQuery = null;
	var sc = appCtxt.getSearchController();
	sc.setSearchField("");
	sc.getSearchToolbar().blur();
	this._refreshMaintenance = true;
	this._refreshAction(false);
};

// Move button has been pressed, show the dialog.
ZmCalViewController.prototype._apptMoveListener =
function(ev) {
	var items = this._listView[this._currentView].getSelection();
	var divvied = (items.length > 1) ? this._divvyItems(items) : null;

	if (divvied && divvied.readonly.length > 0) {
		var dlg = appCtxt.getMsgDialog();
		var list = [];
		if (divvied.normal.length > 0) {
			list = list.concat(divvied.normal);
		}
		if (divvied.recurring.length > 0) {
			list = list.concat(this._dedupeSeries(divvied.recurring));
		}
		var callback = (list.length > 0)
			? (new AjxCallback(this, this._moveListener, [ev, list])) : null;
		var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
		dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
		dlg.setMessage(ZmMsg.moveReadonly);
		dlg.popup();
	}
	else {
		this._moveListener(ev, this._dedupeSeries(items));
	}
};

ZmCalViewController.prototype._isItemMovable =
function(item, isShiftKey, folder) {
	return (!isShiftKey && !folder.isReadOnly());
};

ZmCalViewController.prototype._moveCallback =
function(folder) {
	if (this.isMovingBetwAccounts(this._pendingActionData, folder.id)) {
		var dlg = appCtxt.getYesNoMsgDialog();
		dlg.registerCallback(DwtDialog.YES_BUTTON, this._changeOrgCallback, this, [dlg, folder]);
		var msg = AjxMessageFormat.format(ZmMsg.orgChange, folder.getOwner());
		dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	} else {
		this._doMove(this._pendingActionData, folder, null, false);
	    this._clearDialog(appCtxt.getChooseFolderDialog());
	    this._pendingActionData = null;
	}
};

ZmCalViewController.prototype._changeOrgCallback =
function(dlg, folder) {
	dlg.popdown();
	ZmListController.prototype._moveCallback.call(this, folder);
};

ZmCalViewController.prototype._doTag =
function(items, tag, doTag) {

	var list = this._getTaggableItems(items);

	if (doTag) {
		if (list.length > 0 && list.length == items.length) {
			// there are items to tag, and all are taggable
			ZmListController.prototype._doTag.call(this, list, tag, doTag);
		} else {
			var msg;
			var dlg = appCtxt.getMsgDialog();
			if (list.length > 0 && list.length < items.length) {
				// there are taggable and nontaggable items
				var listener = new AjxListener(this, this._handleDoTag, [dlg, list, tag, doTag]);
				dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
				msg = ZmMsg.tagReadonly;
			} else if (list.length == 0) {
				// no taggable items
				msg = ZmMsg.nothingToTag;
			}
			dlg.setMessage(msg);
			dlg.popup();
		}
	} else if (list.length > 0) {
		ZmListController.prototype._doTag.call(this, list, tag, doTag);
	}
};

ZmCalViewController.prototype._doRemoveAllTags =
function(items) {
	var list = this._getTaggableItems(items);
	ZmListController.prototype._doRemoveAllTags.call(this, list);
};

ZmCalViewController.prototype._handleDoTag =
function(dlg, list, tag, doTag) {
	dlg.popdown();
	ZmListController.prototype._doTag.call(this, list, tag, doTag);
};

ZmCalViewController.prototype._getTaggableItems =
function(items) {
	var divvied = (items.length > 1) ? this._divvyItems(items) : null;

	if (divvied && (divvied.readonly.length > 0 || divvied.shared.length > 0)) {
		// get a list of items that are "taggable"
		items = [];
		for (var i in divvied) {
			// we process read only appts b/c it can also mean any appt where
			// i'm not the organizer but still resides in my local folder.
			if (i == "shared") { continue; }

			var list = divvied[i];
			for (var j = 0; j < list.length; j++) {
				var appt = list[j];
				var calendar = appt.getFolder();
				if (calendar && !calendar.isRemote()) {
					items.push(appt);
				}
			}
		}
	}

	return items;
};

ZmCalViewController.prototype._getToolBarOps =
function() {
	return [
		ZmOperation.NEW_MENU, ZmOperation.CAL_REFRESH,
		ZmOperation.SEP,
		ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT,
		ZmOperation.SEP,
		ZmOperation.TAG_MENU,
		ZmOperation.SEP,
		ZmOperation.VIEW_MENU,
		ZmOperation.SEP,
		ZmOperation.TODAY
	];
};

/* This method is called from ZmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
ZmCalViewController.prototype._initializeToolBar =
function(viewId) {
	if (this._toolbar[ZmId.VIEW_CAL]) { return; }

	ZmListController.prototype._initializeToolBar.call(this, ZmId.VIEW_CAL_DAY);
	var toolbar = this._toolbar[ZmId.VIEW_CAL_DAY];

	// Set the other view toolbar entries to point to the Day view entry. Hack
	// to fool the ZmListController into thinking there are multiple toolbars
	this._toolbar[ZmId.VIEW_CAL_SCHEDULE] = this._toolbar[ZmId.VIEW_CAL_WEEK] =
	this._toolbar[ZmId.VIEW_CAL_WORK_WEEK] = this._toolbar[ZmId.VIEW_CAL_MONTH] =
	this._toolbar[ZmId.VIEW_CAL_APPT] = this._toolbar[ZmId.VIEW_CAL_LIST] =
	this._toolbar[ZmId.VIEW_CAL_DAY];

	this._toolbar[ZmId.VIEW_CAL] = toolbar;

	// Setup the toolbar stuff
	toolbar.enable([ZmOperation.CAL_REFRESH], true);
	toolbar.enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
	toolbar.enable([ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.DAY_VIEW], true);

	toolbar.addFiller();

	var tb = new ZmNavToolBar({parent:toolbar, className:"ZmNavToolbar ZmCalendarNavToolbar", context:ZmId.VIEW_CAL});
	this._setNavToolBar(tb, ZmId.VIEW_CAL);

	this._setNewButtonProps(viewId, ZmMsg.createNewAppt, "NewAppointment", "NewAppointmentDis", ZmOperation.NEW_APPT);

	var printButton = toolbar.getButton(ZmOperation.PRINT);
	if (printButton) {
		printButton.setToolTipContent(ZmMsg.printCalendar);
	}

	toolbar.getButton(ZmOperation.DELETE).setToolTipContent(ZmMsg.hardDeleteTooltip);

	var viewButton = toolbar.getButton(ZmOperation.VIEW_MENU);
	if (viewButton) {
		viewButton.setMenu(new AjxCallback(this, this._setupViewMenuItems, [toolbar]));

		var op = ZmCalViewController.VIEW_TO_OP[this._defaultView()];
		var icon = ZmOperation.getProp(op, "image");
		viewButton.setImage(icon);
	}

	appCtxt.notifyZimlets("initializeToolbar", [this._app, toolbar, this, viewId], {waitUntilLoaded:true});
};

ZmCalViewController.prototype._setViewContents =
function(viewId) {
	// Ignore since this will always be ZmId.VIEW_CAL as we are fooling
	// ZmListController (see our show method)
};

ZmCalViewController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagAppt : ZmMsg.tagAppts;
};

ZmCalViewController.prototype._createNewView =
function(viewId) {
	return this._viewMgr.createView(viewId);
};

ZmCalViewController.prototype._setupViewMenuItems =
function(toolbar) {
	var viewBtn = toolbar.getButton(ZmOperation.VIEW_MENU);
	var menu = new ZmPopupMenu(viewBtn);
	viewBtn.setMenu(menu);

	var defaultViewId = this._defaultView();
	var calViews = ZmCalViewController.OPS;
	for (var i = 0; i < calViews.length; i++) {
		var id = calViews[i];
		var params = {
			image:		ZmOperation.getProp(id, "image"),
			text:		ZmMsg[ZmOperation.getProp(id, "textKey")],
			style:		DwtMenuItem.RADIO_STYLE,
			shortcut:	ZmOperation.getProp(id, "shortcut")
		};
		var mi = menu.createMenuItem(id, params);
		mi.setData(ZmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
		var viewId = ZmCalViewController.OP_TO_VIEW[id];
		if (viewId == defaultViewId) {
			mi.setChecked(true, true);
		}
	}

	return menu;
};

// Switch to selected view.
ZmCalViewController.prototype._viewMenuItemListener =
function(ev) {
	if (ev.detail == DwtMenuItem.CHECKED ||
		ev.detail == DwtMenuItem.UNCHECKED)
	{
		if (appCtxt.multiAccounts) {
			this.apptCache.clearCache();
		}
		var id = ev.item.getData(ZmOperation.MENUITEM_ID);
		var viewBtn = this._toolbar[ZmId.VIEW_CAL].getButton(ZmOperation.VIEW_MENU);
		if (viewBtn) {
			var icon = ZmOperation.getProp(id, "image");
			viewBtn.setImage(icon);
		}
		this.show(ZmCalViewController.OP_TO_VIEW[id]);
	}
};

/**
 * Creates the mini-calendar widget that sits below the overview.
 * 
 * @param {Date}		date		the date to highlight (defaults to today)
 * @private
 */
ZmCalViewController.prototype._createMiniCalendar =
function(date) {
	var calMgr = appCtxt.getCalManager();
	if (calMgr._miniCalendar == null) {
		calMgr._createMiniCalendar(date);
		this._miniCalendar = calMgr.getMiniCalendar();
	} else {
		this._miniCalendar = calMgr.getMiniCalendar();
		if (date != null) {
			this._miniCalendar.setDate(date, true);
		}
	}
	this._minicalMenu = calMgr._miniCalMenu;
	this._miniCalDropTarget = calMgr._miniCalDropTarget;
};

ZmCalViewController.prototype.recreateMiniCalendar =
function() {
	var calMgr = appCtxt.getCalManager();
	if (calMgr._miniCalendar != null) {
		var mc = calMgr.getMiniCalendar();
		var el = mc.getHtmlElement();
		var date = mc.getDate();
		if(el) {
			el.parentNode.removeChild(el);
		}
		this._miniCalendar = null;
		calMgr._miniCalendar = null;
		calMgr._createMiniCalendar(date);
		this._miniCalendar = calMgr.getMiniCalendar();
		this._createMiniCalendar();
	}
};

ZmCalViewController.prototype._miniCalDropTargetListener =
function(ev) {
	var data = ((ev.srcData.data instanceof Array) && ev.srcData.data.length == 1)
		? ev.srcData.data[0] : ev.srcData.data;

	// use shiftKey to create new Tasks if enabled. NOTE: does not support Contacts yet
	var shiftKey = appCtxt.get(ZmSetting.TASKS_ENABLED) && ev.uiEvent.shiftKey;

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		// Hack: in some instances ZmContact is reported as being an Array of
		//       length 1 (as well as a ZmContact) under FF1.5
		if (data instanceof Array && data.length > 1) {
			var foundValid = false;
			for (var i = 0; i < data.length; i++) {
				if (!shiftKey && (data[i] instanceof ZmContact)) {
					if (data[i].isGroup() && data[i].getGroupMembers().good.size() > 0) {
						foundValid = true;
					} else {
						var email = data[i].getEmail();
						if (email && email != "")
							foundValid = true;
					}
				} else {
					// theres other stuff besides contacts in here.. bail
					ev.doIt = false;
					return;
				}
			}

			// if not a single valid email was found in list of contacts, bail
			if (!foundValid) {
				ev.doIt = false;
				return;
			}
		} else {
			if (!this._miniCalDropTarget.isValidTarget(data)) {
				ev.doIt = false;
				return;
			}

			// If dealing with a contact, make sure it has a valid email address
			if (!shiftKey && (data instanceof ZmContact)) {
				if (data.isGroup()) {
					ev.doIt = (data.getGroupMembers().good.size() > 0);
				} else {
					var email = data.getEmail();
					ev.doIt = (email != null && email != "");
				}
			}
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var dropDate = this._miniCalendar.getDndDate();

		if (dropDate) {
			// bug fix #5088 - reset time to next available slot
			var now = new Date();
			dropDate.setHours(now.getHours());
			dropDate.setMinutes(now.getMinutes());
			dropDate = AjxDateUtil.roundTimeMins(dropDate, 30);

			if ((data instanceof ZmContact) ||
				((data instanceof Array) && data[0] instanceof ZmContact))
			{
				this.newApptFromContact(data, dropDate);
			}
			else
			{
				if (shiftKey) {
					AjxDispatcher.require(["TasksCore", "Tasks"]);
					appCtxt.getApp(ZmApp.TASKS).newTaskFromMailItem(data, dropDate);
				} else {
					this.newApptFromMailItem(data, dropDate);
				}
			}
		}
	}
};

/**
 * This method will create a new appointment from a conversation/mail message. In the case
 * of a conversation, the appointment will be populated by the first message in the
 * conversation (or matched msg in the case of a search). This method is asynchronous and
 * will return immediately if the mail message must load in the background.
 *
 * @param {ZmConv|ZmMailMsg}	mailItem the may either be a conversation of message
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromMailItem =
function(mailItem, date) {
	var subject = mailItem.subject || "";
	if (mailItem instanceof ZmConv) {
		mailItem = mailItem.getFirstHotMsg();
	}
	mailItem.load({getHtml:false, callback:new AjxCallback(this, this._msgLoadedCallback, [mailItem, date, subject])});
};

ZmCalViewController.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var newAppt = this._newApptObject(date, null, null, mailItem);
	newAppt.setFromMailMessage(mailItem, subject);
	this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
};

/**
 * This method will create a new appointment from a contact.
 *
 * @param {ZmContact}		contact the contact
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromContact =
function(contact, date) {
	var emails = [];
	var list = (contact instanceof ZmContact) ? [contact] : contact;
	for (var i = 0; i < list.length; i++) {
		if (list[i].isGroup()) {
			var members = list[i].getGroupMembers().good.getArray();
			for (var j = 0; j < members.length; j++) {
				var e = members[j].address;
				if (e && e != "")
					emails.push(e);
			}
		} else {
			// grab the first valid email address for this contact
			var e = list[i].getEmail();
			if (e && e != "")
				emails.push(e);
		}
	}

	if (emails.length > 0) {
		var newAppt = this._newApptObject(date);
		newAppt.setAttendees(emails, ZmCalBaseItem.PERSON);
		this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
	}
};

/**
 * This method will create a new appointment from an email address.
 *
 * @param {String}	emailAddr	the email address
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromEmailAddr =
function(emailAddr, date) {
	if (!emailAddr || emailAddr == "") {return; }

	var newAppt = this._newApptObject(date);
	newAppt.setAttendees(emailAddr, ZmCalBaseItem.PERSON);
	this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
};

ZmCalViewController.prototype.getMiniCalendar =
function(delay) {
	if (!this._miniCalendar) {
		this._createMiniCalendar(null, delay);
	}
	return this._miniCalendar;
};

ZmCalViewController.prototype._todayButtonListener =
function(ev) {
	this.setDate(new Date(), 0, false);
};

ZmCalViewController.prototype._newApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;

	if (d != null) {
		delete this._minicalMenu.__detail;
	} else {
		d = this._viewMgr ? this._viewMgr.getDate() : null;
	}

	// Bug 15686, eshum
	// Uses the selected timeslot if possible.
	var curr = this._viewVisible ? this._viewMgr.getDate() : new Date(); //new Date();
	if (d == null) {
		d = curr;
	} else {
		// bug fix #4693 - set the current time since it will be init'd to midnite
		d.setHours(curr.getHours());
		d.setMinutes(curr.getMinutes());
	}
    //bug:44423, Action Menu needs to select appropriate Calendar
    var calendarId = null;
    if(this._viewActionMenu && this._viewActionMenu._calendarId){
        calendarId = this._viewActionMenu._calendarId;
        this._viewActionMenu._calendarId = null;
    }

	var loadCallback = new AjxCallback(this, this._handleLoadNewApptAction, [d, calendarId]);
	AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewApptAction =
function(d, calendarId) {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.newAppointmentHelper(d, null, calendarId);
};

ZmCalViewController.prototype._searchMailAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) {
		delete this._minicalMenu.__detail;
		appCtxt.getSearchController().dateSearch(d, ZmId.SEARCH_MAIL);
	}
};

ZmCalViewController.prototype._newAllDayApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) delete this._minicalMenu.__detail;
	else d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();

    //bug:44423, Action Menu needs to select appropriate Calendar
    var calendarId = null;
    if(this._viewActionMenu && this._viewActionMenu._calendarId){
        calendarId = this._viewActionMenu._calendarId;
        this._viewActionMenu._calendarId = null;
    }

	var loadCallback = new AjxCallback(this, this._handleLoadNewAllDayApptAction, [d, calendarId]);
	AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewAllDayApptAction =
function(d, calendarId) {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.newAllDayAppointmentHelper(d, null, calendarId);
};

ZmCalViewController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	this._viewVisible = true;
	if (this._viewMgr.needsRefresh()) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);
	}
};

ZmCalViewController.prototype._postHideCallback =
function() {
	this._viewVisible = false;
};

ZmCalViewController.prototype._paginate =
function(viewId, forward) {
	var view = this._listView[viewId];
	var field = view.getRollField();
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);
};

/**
 * Sets the date.
 * 
 * @param	{Date}		date		the date
 * @param	{int}		duration	the duration
 * @param	{Boolean}	roll		if <code>true</code>, roll
 */
ZmCalViewController.prototype.setDate =
function(date, duration, roll) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	// set mini-cal first so it will cache appts we might need
	if (this._miniCalendar.getDate() == null ||
		this._miniCalendar.getDate().getTime() != date.getTime())
	{
		this._miniCalendar.setDate(date, true, roll);
	}
	if (this._viewMgr != null) {
		this._viewMgr.setDate(date, duration, roll);
		var viewId = this._viewMgr.getCurrentViewName();
		if (viewId == ZmId.VIEW_CAL_APPT) {
			this._viewMgr.getCurrentView().close();
		}
		var title = this._viewMgr.getCurrentView().getCalTitle();
		Dwt.setTitle([ZmMsg.zimbraTitle, ": ", title].join(""));
		if (!roll &&
			this._currentView == ZmId.VIEW_CAL_WORK_WEEK &&
			(date.getDay() == 0 || date.getDay() ==  6))
		{
			this.show(ZmId.VIEW_CAL_WEEK);
		}
		if (ZmId.VIEW_CAL_MONTH == this._currentView) {
			title = this._viewMgr.getCurrentView().getShortCalTitle();
		}
		this._navToolBar[ZmId.VIEW_CAL].setText(title);
	}
};

ZmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
};

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
		var loadCallback = new AjxCallback(this, this._handleLoadMiniCalSelection, [ev]);
		AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
	}
};

ZmCalViewController.prototype._handleLoadMiniCalSelection =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
	if (!this._viewVisible) {
		this.show();
	}
};

ZmCalViewController.prototype.newApptObject =
function(startDate, duration, folderId, mailItem) {
    return this._newApptObject(startDate, duration, folderId, mailItem);
};

ZmCalViewController.prototype._newApptObject =
function(startDate, duration, folderId, mailItem) {
	var newAppt = new ZmAppt();
	newAppt.setStartDate(AjxDateUtil.roundTimeMins(startDate, 30));
	newAppt.setEndDate(newAppt.getStartTime() + (duration ? duration : ZmCalViewController.DEFAULT_APPOINTMENT_DURATION));
	newAppt.resetRepeatWeeklyDays();
	newAppt.resetRepeatMonthlyDayList();
	newAppt.resetRepeatYearlyMonthsList(startDate.getMonth()+1);
	newAppt.resetRepeatCustomDayOfWeek();
	var defaultWarningTime = appCtxt.get(ZmSetting.CAL_REMINDER_WARNING_TIME);
	if (defaultWarningTime) {
		newAppt.setReminderMinutes(defaultWarningTime);
	}

	if (folderId) {
		newAppt.setFolderId(folderId);
	} else {
		// get folderId from mail message if being created off of one
		if (appCtxt.multiAccounts && mailItem) {
			newAppt.setFolderId(mailItem.getAccount().getDefaultCalendar().id);
		} else {
			// bug: 27646 case where only one calendar is checked
			var checkedFolderIds = this.getCheckedCalendarFolderIds();
			if (checkedFolderIds && checkedFolderIds.length == 1) {
				var calId = checkedFolderIds[0];
				var cal = appCtxt.getById(calId);
				// don't use calendar if feed, or remote and don't have write perms
				if (cal) {
					var share = cal.getMainShare();
					var skipCal = (cal.isFeed() || (cal.link && share && !share.isWrite()));
					if (cal && !skipCal) {
						newAppt.setFolderId(calId);
					}
				}
			} else if (appCtxt.multiAccounts) {
				// calendar app has no notion of "active" app, so always set to default calendar
				var calId = appCtxt.isOffline
					? appCtxt.getActiveAccount().getDefaultCalendar().id
					: appCtxt.accountList.mainAccount.getDefaultCalendar().id;
				newAppt.setFolderId(calId);
			}
		}
	}
	newAppt.setPrivacy((appCtxt.get(ZmSetting.CAL_APPT_VISIBILITY) == ZmSetting.CAL_VISIBILITY_PRIV)?"PRI" :"PUB");
	return newAppt;
};

ZmCalViewController.prototype._timeSelectionListener =
function(ev) {
	var view = this._viewMgr.getCurrentView();
	if (view.getSelectedItems().size() > 0) {
		view.deselectAll();
		this._resetOperations(this._toolbar[ZmId.VIEW_CAL_DAY], 0);
	}
	this.setDate(ev.detail, 0, ev.force);

	// popup the edit dialog
	if (ev._isDblClick){
		this._apptFromView = view;
		var appt = this._newApptObject(ev.detail);
		appt.setAllDayEvent(ev.isAllDay);
		if (ev.folderId) {
			appt.setFolderId(ev.folderId);
		}
		this._showQuickAddDialog(appt, ev.shiftKey);
	}
};

ZmCalViewController.prototype._printListener =
function(ev) {
	var url;
	var viewId = this._viewMgr.getCurrentViewName();

	if (viewId == ZmId.VIEW_CAL_APPT ||
		viewId == ZmId.VIEW_CAL_LIST)
	{
		var ids = [];
		var list = this._viewMgr.getCurrentView().getSelection();
		for (var i = 0; i < list.length; i++) {
			ids.push(list[i].invId);
		}
		url = "/h/printappointments?id=" + ids.join(",");

	} else {
		var date = this._viewMgr
			? this._viewMgr.getDate()
			: (new Date());

		var day = (date.getDate() < 10)
			? ('0' + date.getDate())
			: date.getDate();

		var month = date.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}

		var view;
		switch (viewId) {
			case ZmId.VIEW_CAL_DAY: 		view = "day"; break;
			case ZmId.VIEW_CAL_WORK_WEEK:	view = "workWeek"; break;
			case ZmId.VIEW_CAL_WEEK:		view = "week"; break;
			case ZmId.VIEW_CAL_SCHEDULE:	view = "schedule"; break;
			default:						view = "month"; break;				// default is month
		}

		var folderIds = this.getCheckedCalendarFolderIds();
		var l = folderIds.join(",");

		url = [
			"/h/printcalendar?view=", view,
			"&l=", l,
			"&date=", date.getFullYear(), month, day
		].join("");
	}

	window.open(appContextPath+url, "_blank");
};

ZmCalViewController.prototype._deleteListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	this._doDelete(this._listView[this._currentView].getSelection(), null, null, op);
};

ZmCalViewController.prototype._forwardListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	this._doForward(this._listView[this._currentView].getSelection(), op);
};

ZmCalViewController.prototype._doForward =
function(items, op) {
	// listview cannot handle forwarding multiple items at once
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
        return;
	}

	// since base view has multiple selection turned off, always select first item
	var appt = items[0];
	var mode = ZmCalItem.MODE_FORWARD;
	if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
		mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
			? ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE
			: ZmCalItem.MODE_FORWARD_SERIES;
	}
	this._forwardAppointment(appt, mode);
};

/**
 * Override the ZmListController method.
 * 
 * @private
 */
ZmCalViewController.prototype._doDelete =
function(items, hardDelete, attrs, op) {
	// listview can handle deleting multiple items at once
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
		var divvied = this._divvyItems(items);

		// data structure to keep track of which appts to delete and how
		this._deleteList = {};
		this._deleteList[ZmCalItem.MODE_DELETE] = divvied.normal;

		// first attempt to deal with read-only appointments
		if (divvied.readonly.length > 0) {
			var dlg = appCtxt.getMsgDialog();
			var callback = (divvied.recurring.length > 0)
				? new AjxCallback(this, this._showTypeDialog, [divvied.recurring, ZmCalItem.MODE_DELETE])
				: new AjxCallback(this, this._promptDeleteApptList);
			var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
			dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
			dlg.setMessage(ZmMsg.deleteReadonly);
			dlg.popup();
		}
		else if (divvied.recurring.length > 0) {
			this._showTypeDialog(divvied.recurring, ZmCalItem.MODE_DELETE);
		}
		else {
			this._promptDeleteApptList();
		}
	}
	else {
		// since base view has multiple selection turned off, always select first item
		var appt = items[0];
		if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
			var mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
				? ZmCalItem.MODE_DELETE_INSTANCE
				: ZmCalItem.MODE_DELETE_SERIES;
			this._promptDeleteAppt(appt, mode);
		} else {
			this._deleteAppointment(appt);
		}
	}
};

ZmCalViewController.prototype._handleReadonlyOk =
function(callback, dlg) {
	dlg.popdown();
	if (callback) {
		callback.run();
	}
};

ZmCalViewController.prototype._handleMultiDelete =
function() {
	var batchCmd = new ZmBatchCommand(true, null, true);

	// first, get details for each appointment
	for (var j in this._deleteList) {
		var list = this._deleteList[j];
		for (var i = 0; i < list.length; i++) {
			var appt = list[i];
			var args = [parseInt(j), null, null, null, null];
			batchCmd.add(new AjxCallback(appt, appt.getDetails, args));
		}
	}
	batchCmd.run(new AjxCallback(this, this._handleGetDetails));
};

ZmCalViewController.prototype._handleGetDetails =
function() {
	var batchCmd = new ZmBatchCommand(true);
	for (var j in this._deleteList) {
		var list = this._deleteList[j];
		for (var i = 0; i < list.length; i++) {
			var appt = list[i];
			var args = [parseInt(j), null, null, null];
			batchCmd.add(new AjxCallback(appt, appt.cancel, args));
		}
	}
	batchCmd.run();
	var summary = ZmList.getActionSummary(ZmMsg.actionDelete, batchCmd.size(), ZmItem.APPT);
	appCtxt.setStatusMsg(summary);
	appCtxt.notifyZimlets("onAppointmentDelete", [this._deleteList]);//notify Zimlets on delete 
};

ZmCalViewController.prototype._divvyItems =
function(items) {
	var normal = [];
	var readonly = [];
	var recurring = [];
	var shared = [];

	for (var i = 0; i < items.length; i++) {
		var appt = items[i];

		if (appt.isReadOnly()) {
			readonly.push(appt);
		} else if (appt.isRecurring() && !appt.isException) { 
			recurring.push(appt);
		} else {
			normal.push(appt);
		}

		// keep a separate list of shared items. This means "recurring" and
		// "normal" can contain shared items as well.
		var calendar = appt.getFolder();
		if (calendar && calendar.isRemote()) {
			shared.push(appt);
		}
	}

	return {normal:normal, readonly:readonly, recurring:recurring, shared:shared};
};

ZmCalViewController.prototype._promptDeleteApptList =
function() {
	if (this._deleteList[ZmCalItem.MODE_DELETE] &&
		this._deleteList[ZmCalItem.MODE_DELETE].length > 0)
	{
		var callback = new AjxCallback(this, this._handleMultiDelete);
		appCtxt.getConfirmationDialog().popup(ZmMsg.confirmCancelApptList, callback);
	}
};

ZmCalViewController.prototype._promptDeleteAppt =
function(appt, mode) {
	if (appt.isOrganizer()) {
		if (mode == ZmCalItem.MODE_DELETE_SERIES) {
			this._promptDeleteFutureInstances(appt, mode);
		} else {
			this._promptCancelReply(appt, mode);
		}
	} else {
		this._promptDeleteNotify(appt, mode);
	}
};

ZmCalViewController.prototype._promptCancelReply =
function(appt, mode) {
	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
	var confirmDialog = appCtxt.getConfirmationDialog();
	if (appt.otherAttendees && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);
		confirmDialog.popup(ZmMsg.confirmCancelApptReply, cancelReplyCallback, cancelNoReplyCallback);
	} else {
		var msg = ZmMsg.confirmCancelAppt;
		if (appt.isRecurring()) {
			msg = (mode == ZmCalItem.MODE_DELETE_INSTANCE) ? ZmMsg.confirmCancelApptInst :  ZmMsg.confirmCancelApptSeries;
		}
		confirmDialog.popup(msg, cancelNoReplyCallback);
	}
};

ZmCalViewController.prototype._promptDeleteFutureInstances =
function(appt, mode) {
	if (!this._delFutureInstNotifyDlg) {
		this._delFutureInstNotifyDlg = new ZmApptDeleteNotifyDialog({
			parent: this._shell,
			title: AjxMsg.confirmTitle,
			confirmMsg: ZmMsg.confirmCancelApptSeries,
			choiceLabel1: ZmMsg.confirmCancelApptWholeSeries,
			choiceLabel2 : ZmMsg.confirmCancelApptFutureInstances
		});
	}
	this._delFutureInstNotifyDlg.popup(new AjxCallback(this, this._deleteFutureInstYesCallback, [appt,mode]));
};

ZmCalViewController.prototype._deleteFutureInstYesCallback =
function(appt, mode) {
	var deleteWholeSeries = this._delFutureInstNotifyDlg.isDefaultOptionChecked();
	if (!deleteWholeSeries) {
		appt.setCancelFutureInstances(true);
	}

	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
	var confirmDialog = appCtxt.getConfirmationDialog();
	if (appt.otherAttendees && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);
		confirmDialog.popup(ZmMsg.confirmCancelApptReply, cancelReplyCallback, cancelNoReplyCallback);
	} else {
		this._continueDelete(appt, mode);
	}
};

ZmCalViewController.prototype._promptDeleteNotify =
function(appt, mode) {
	if (!this._deleteNotifyDialog) {
		var msg = ZmMsg.confirmCancelAppt;
		if (appt.isRecurring()) {
			msg = (mode == ZmCalItem.MODE_DELETE_INSTANCE)
				? ZmMsg.confirmCancelApptInst
				: ZmMsg.confirmCancelApptSeries;
		}
		this._deleteNotifyDialog = new ZmApptDeleteNotifyDialog({
			parent: this._shell,
			title: AjxMsg.confirmTitle,
			confirmMsg: msg,
			choiceLabel1: ZmMsg.dontNotifyOrganizer,
			choiceLabel2 : ZmMsg.notifyOrganizer
		});
	}
	this._deleteNotifyDialog.popup(new AjxCallback(this, this._deleteNotifyYesCallback, [appt,mode]));
};

ZmCalViewController.prototype._deleteNotifyYesCallback =
function(appt, mode) {
	var notifyOrg = !this._deleteNotifyDialog.isDefaultOptionChecked();
	if (notifyOrg) {
		this._cancelBeforeDelete(appt, mode);
	} else {
		this._continueDelete(appt, mode);
	}
};

ZmCalViewController.prototype._cancelBeforeDelete =
function(appt, mode) {
	var type = ZmOperation.REPLY_DECLINE;
	var respCallback = new AjxCallback(this, this._cancelBeforeDeleteContinue, [appt, type, mode]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._cancelBeforeDeleteContinue =
function(appt, type, mode) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(), true);
	this._continueDelete(appt, mode);
};


ZmCalViewController.prototype._deleteAppointment =
function(appt) {
	if (!appt) { return; }

	if (appt.isRecurring() && !appt.isException) {
		this._showTypeDialog(appt, ZmCalItem.MODE_DELETE);
	} else {
		this._promptDeleteAppt(appt, ZmCalItem.MODE_DELETE);
	}
};

ZmCalViewController.prototype._continueDeleteReply =
function(appt, mode) {
	var action = ZmOperation.REPLY_CANCEL;
	var respCallback = new AjxCallback(this, this._continueDeleteReplyRespondAction, [appt, action, mode]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._continueDeleteReplyRespondAction =
function(appt, action, mode) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg._appt = appt;
	msg._mode = mode;
	msgController.setMsg(msg);
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msg._instanceDate = instanceDate;
	msgController._editInviteReply(action, 0, instanceDate);
};

ZmCalViewController.prototype._continueDelete =
function(appt, mode) {
	if (appt instanceof Array) {
		// if list of appointments, de-dupe the same series appointments
		if (mode == ZmCalItem.MODE_DELETE_SERIES) {
			this._deleteList[ZmCalItem.MODE_DELETE_SERIES] = this._dedupeSeries(appt);
		} else {
			this._deleteList[ZmCalItem.MODE_DELETE_INSTANCE] = appt;
		}
		this._handleMultiDelete();
	}
	else {
		var respCallback = new AjxCallback(this, this._handleResponseContinueDelete, appt);
		appt.cancel(mode, null, respCallback, this._errorCallback);
	}
};

ZmCalViewController.prototype._handleResponseContinueDelete =
function(appt) {
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_APPT) {
		this._viewMgr.getCurrentView().close();
	}
	var summary = ZmList.getActionSummary(ZmMsg.actionDelete, 1, ZmItem.APPT);
	appCtxt.setStatusMsg(summary);
	appCtxt.notifyZimlets("onAppointmentDelete", [appt]);//notify Zimlets on delete 
};

/**
 * This method takes a list of recurring appointments and returns a list of
 * unique appointments (removes instances)
 *
 * @param list		[Array]		List of *recurring* appointments
 * 
 * @private
 */
ZmCalViewController.prototype._dedupeSeries =
function(list) {
	var unique = [];
	var deduped = {};
	for (var i = 0; i < list.length; i++) {
		var appt = list[i];
		if (!deduped[appt.id]) {
			deduped[appt.id] = true;
			unique.push(appt);
		}
	}
	return unique;
};

ZmCalViewController.prototype._getMoveParams =
function(dlg) {
	var params = ZmListController.prototype._getMoveParams.apply(this, arguments);
	var omit = {};
	var folderTree = appCtxt.getFolderTree();
	if (!folderTree) { return params; }

	var folders = folderTree.getByType(ZmOrganizer.CALENDAR);
	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.link && folder.isReadOnly()) {
			omit[folder.id] = true;
		}
	}
	params.omit = omit;
	params.description = ZmMsg.targetCalendar;

	return params;
};

ZmCalViewController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.moveAppt : ZmMsg.moveAppts;
};

/**
 * Shows a dialog for handling recurring appointments. User must choose to
 * perform the action on the instance of the series of a recurring appointment.
 *
 * @param appt		[ZmAppt]	This can be a single appt object or a *list* of appts
 * @param mode		[Integer]	Constant describing what kind of appointments we're dealing with
 * 
 * @private
 */
ZmCalViewController.prototype._showTypeDialog =
function(appt, mode) {
	if (this._typeDialog == null) {
		AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);		
		this._typeDialog = new ZmCalItemTypeDialog(this._shell);
		this._typeDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._typeOkListener));
		this._typeDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._typeCancelListener));
	}
	this._typeDialog.initialize(appt, mode, ZmItem.APPT);
	this._typeDialog.popup();
};

ZmCalViewController.prototype.showApptReadOnlyView =
function(appt, mode) {
	var clone = ZmAppt.quickClone(appt);
	clone.getDetails(mode, new AjxCallback(this, this._showApptReadOnlyView, [clone, mode]));
};

ZmCalViewController.prototype._showApptReadOnlyView =
function(appt, mode) {
	var viewId = ZmId.VIEW_CAL_APPT;
	if (!this._viewMgr) {
		this.createViewMgr();
	}
	var apptView = this._viewMgr.getView(viewId);
	if (!apptView) {
		this._setup(viewId);
		apptView = this._viewMgr.getView(viewId);
	}
	apptView.set(appt, null, mode);
	this.show(viewId);
	this._resetToolbarOperations();
};

ZmCalViewController.prototype._showQuickAddDialog =
function(appt, shiftKey) {
	// find out if we really should display the quick add dialog
	var useQuickAdd = appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD);
	if ((useQuickAdd && !shiftKey) || (!useQuickAdd && shiftKey)) {
		if (AjxTimezone.TIMEZONE_CONFLICT || AjxTimezone.DEFAULT_RULE.autoDetected) {
			var timezonePicker = this.getTimezonePicker();
			var callback = new AjxCallback(this, this.handleTimezoneSelectionQuickAdd, [appt, shiftKey]);
			timezonePicker.setCallback(callback);
			timezonePicker.popup();
		} else {
			this._showQuickAddDialogContinue(appt, shiftKey);
		}
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._showQuickAddDialogContinue =
function(appt, shiftKey) {
	if (this._quickAddDialog == null) {
		AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
		this._quickAddDialog = new ZmApptQuickAddDialog(this._shell);
		this._quickAddDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._quickAddOkListener));
		this._quickAddDialog.addSelectionListener(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, new AjxListener(this, this._quickAddMoreListener));
	}
	this._quickAddDialog.initialize(appt);
	this._quickAddDialog.popup();
};

ZmCalViewController.prototype.newAppointmentHelper =
function(startDate, optionalDuration, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, optionalDuration, folderId);
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAllDayAppointmentHelper =
function(startDate, endDate, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, null, folderId);
	if (endDate) {
		appt.setEndDate(endDate);
	}
	appt.setAllDayEvent(true);
	appt.freeBusy = "F";
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAppointment =
function(newAppt, mode, isDirty, startDate) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	var sd = startDate || (this._viewVisible ? this._viewMgr.getDate() : new Date());
	var appt = newAppt || this._newApptObject(sd, AjxDateUtil.MSEC_PER_HALF_HOUR);
	if (AjxTimezone.TIMEZONE_CONFLICT || AjxTimezone.DEFAULT_RULE.autoDetected) {
		var timezonePicker = this.getTimezonePicker();
		var callback = new AjxCallback(this, this.handleTimezoneSelection, [appt, mode, isDirty]);
		timezonePicker.setCallback(callback);
		timezonePicker.popup();
	} else {
		this._app.getApptComposeController().show(appt, mode, isDirty);
	}
};

ZmCalViewController.prototype.handleTimezoneSelection =
function(appt, mode, isDirty, serverId) {
	this.updateTimezoneInfo(appt, serverId);
	this._app.getApptComposeController().show(appt, mode, isDirty);
};

ZmCalViewController.prototype.handleTimezoneSelectionQuickAdd =
function(appt, shiftKey, serverId) {
	this.updateTimezoneInfo(appt, serverId);
	this._showQuickAddDialogContinue(appt, shiftKey);
};

ZmCalViewController.prototype.updateTimezoneInfo =
function(appt, serverId) {
	appt.setTimezone(serverId);
	appCtxt.set(ZmSetting.DEFAULT_TIMEZONE, serverId);
	AjxTimezone.TIMEZONE_CONFLICT = false;
	this.updateDefaultTimezone(serverId);
	var settings = appCtxt.getSettings();
	var tzSetting = settings.getSetting(ZmSetting.DEFAULT_TIMEZONE);
	settings.save([tzSetting], new AjxCallback(this, this._timezoneSaveCallback));
};

ZmCalViewController.prototype.updateDefaultTimezone =
function(serverId) {
	for (var i in AjxTimezone.MATCHING_RULES) {
		if (AjxTimezone.MATCHING_RULES[i].serverId == serverId) {
			AjxTimezone.DEFAULT_RULE = AjxTimezone.MATCHING_RULES[i];
			AjxTimezone.DEFAULT = AjxTimezone.getClientId(AjxTimezone.DEFAULT_RULE.serverId);
			break;
		}
	}
};

ZmCalViewController.prototype._timezoneSaveCallback =
function() {
	appCtxt.setStatusMsg(ZmMsg.timezonePrefSaved);
};

ZmCalViewController.prototype.getTimezonePicker =
function() {
	if (!this._timezonePicker) {
		this._timezonePicker = appCtxt.getTimezonePickerDialog();
	}
	return this._timezonePicker;
};

/**
 * Edits the appointment.
 * 
 * @param	{ZmAppt}		appt		the appointment
 * @param	{constant}		mode		the mode
 */
ZmCalViewController.prototype.editAppointment =
function(appt, mode) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
		var clone = ZmAppt.quickClone(appt);
		clone.getDetails(mode, new AjxCallback(this, this._showApptComposeView, [clone, mode]));
	} else {
		this._app.getApptComposeController().show(appt, mode);
	}
};

ZmCalViewController.prototype._forwardAppointment =
function(appt, mode) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
		var clone = ZmAppt.quickClone(appt);
		clone.getDetails(mode, new AjxCallback(this, this._showApptForwardComposeView, [clone, mode]));
	} else {
		this._showApptForwardComposeView(appt, mode);
	}
};

ZmCalViewController.prototype._showAppointmentDetails =
function(appt) {
	// if we have an appointment, go get all the details.
	if (!appt.__creating) {
		var calendar = appt.getFolder();
		var isSynced = Boolean(calendar.url);
		if (appt.isRecurring()) {
			// prompt user to edit instance vs. series if recurring but not exception
			if (appt.isException) {
				var mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
				if (appt.isReadOnly() || calendar.isReadOnly() || isSynced) {
					this.showApptReadOnlyView(appt, mode);
				} else {
					this.editAppointment(appt, mode);
				}
			} else {
				this._showTypeDialog(appt, ZmCalItem.MODE_EDIT);
			}
		} else {
			// if simple appointment, no prompting necessary
			if (appt.isReadOnly() || calendar.isReadOnly() || isSynced) {
				var mode = appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
				this.showApptReadOnlyView(appt, mode);
			} else {
				this.editAppointment(appt, ZmCalItem.MODE_EDIT);
			}
		}
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._typeOkListener =
function(ev) {
	if (this._typeDialog.mode == ZmCalItem.MODE_DELETE)
		this._promptDeleteAppt(this._typeDialog.calItem, this._typeDialog.isInstance() ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES);
	else
		this._performApptAction(this._typeDialog.calItem, this._typeDialog.mode, this._typeDialog.isInstance());
};

ZmCalViewController.prototype._performApptAction =
function(appt, mode, isInstance) {
	if (mode == ZmCalItem.MODE_DELETE) {
		var delMode = isInstance ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES;
		if (appt instanceof Array) {
			this._continueDelete(appt, delMode);
		} else {
			if (appt.isOrganizer()) {
				this._continueDelete(appt, delMode);
			} else {
				this._promptDeleteNotify(appt, delMode);
			}
		}
	}
	else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		var viewMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var state = this._updateApptDateState;
		var args = [state.appt, viewMode, state.startDateOffset, state.endDateOffset, state.callback, state.errorCallback];
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, args);
		delete this._updateApptDateState;
		appt.getDetails(viewMode, respCallback, state.errorCallback);
	}
	else {
		var editMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var calendar = appt.getFolder();
		var isSynced = Boolean(calendar.url);

		if (appt.isReadOnly() || calendar.isReadOnly() || isSynced) {
			this.showApptReadOnlyView(appt, editMode);
		} else {
			this.editAppointment(appt, editMode);
		}
	}
};

ZmCalViewController.prototype._typeCancelListener =
function(ev) {
	if (this._typeDialog.mode == ZmAppt.MODE_DRAG_OR_SASH) {
		// we cancel the drag/sash, refresh view
		this._refreshAction(true);
	}
};

ZmCalViewController.prototype._quickAddOkListener =
function(ev) {
	try {
		if (this._quickAddDialog.isValid()) {
			var appt = this._quickAddDialog.getAppt();
			if (appt) {
				if (appt.getFolder() && appt.getFolder().noSuchFolder) {
					throw AjxMessageFormat.format(ZmMsg.errorInvalidFolder, appt.getFolder().name);
				}
				this._quickAddDialog.popdown();
				appt.save();
			}
		}
	} catch(ex) {
		if (typeof ex == "string") {
			var errorDialog = new DwtMessageDialog({parent:this._shell});
			var msg = ex ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, ex) : ZmMsg.errorSaving;
			errorDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			errorDialog.popup();
		}
	}
};

ZmCalViewController.prototype._quickAddMoreListener =
function(ev) {
	var appt = this._quickAddDialog.getAppt();
	if (appt) {
		this._quickAddDialog.popdown();
		this.newAppointment(appt, ZmCalItem.MODE_NEW_FROM_QUICKADD, this._quickAddDialog.isDirty());
	}
};

ZmCalViewController.prototype._showApptComposeView =
function(appt, mode) {
	this._app.getApptComposeController().show(appt, mode);
};

ZmCalViewController.prototype._showApptForwardComposeView =
function(appt, mode) {
    appt.name = ZmMsg.fwd + ": " + appt.name;
	this._app.getApptComposeController().show(appt, mode);
};

/**
 * appt - appt to change
 * startDate - new date or null to leave alone
 * endDate - new or null to leave alone
 * changeSeries - if recurring, change the whole series
 *
 * TODO: change this to work with _handleException, and take callback so view can
 *       restore appt location/size on failure
 *       
 * @private
 */
ZmCalViewController.prototype.dndUpdateApptDate =
function(appt, startDateOffset, endDateOffset, callback, errorCallback, ev) {
	appt.dndUpdate = true;
	if (!appt.isRecurring()) {
		var viewMode = ZmCalItem.MODE_EDIT;
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
		appt.getDetails(viewMode, respCallback, errorCallback);
	}
	else {
		if (ev.shiftKey || ev.altKey) {
			var viewMode = ev.altKey ? ZmCalItem.MODE_EDIT_SERIES : ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
			var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
			appt.getDetails(viewMode, respCallback, errorCallback);
		}
		else {
			this._updateApptDateState = {appt:appt, startDateOffset: startDateOffset, endDateOffset: endDateOffset, callback: callback, errorCallback: errorCallback };
			if (appt.isException) {
				this._performApptAction(appt, ZmAppt.MODE_DRAG_OR_SASH, true);
			} else {
				this._showTypeDialog(appt, ZmAppt.MODE_DRAG_OR_SASH);
			}
		}
	}
};

ZmCalViewController.prototype._handleResponseUpdateApptDate =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	// skip prompt if no attendees
	if (!appt.otherAttendees) {
		this._handleResponseUpdateApptDateSave.apply(this, arguments);
		return;
	}

	// NOTE: We copy the arguments into an array because arguments
	//       is *not* technically an array. So if anyone along the
	//       line considers it such it will blow up -- this prevents
	//       that at the expense of having to keep this array and
	//       the actual argument list in sync.
	var args = [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result];
	var edit = new AjxCallback(this, this._handleResponseUpdateApptDateEdit, args);
	var save = new AjxCallback(this, this._handleResponseUpdateApptDateSave, args);
	var ignore = new AjxCallback(this, this._handleResponseUpdateApptDateIgnore, args);

	var dialog = appCtxt.getConfirmationDialog();
	dialog.popup(ZmMsg.confirmModifyApptReply, edit, save, ignore);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateEdit =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	var clone = ZmAppt.quickClone(appt);
	if (startDateOffset) clone.setStartDate(new Date(clone.getStartTime() + startDateOffset));
	if (endDateOffset) clone.setEndDate(new Date(clone.getEndTime() + endDateOffset));
	this._showAppointmentDetails(clone);
};
ZmCalViewController.prototype._handleResponseUpdateApptDateEdit2 =
function(appt, action, mode, startDateOffset, endDateOffset) {
	if (startDateOffset) appt.setStartDate(new Date(appt.getStartTime() + startDateOffset));
	if (endDateOffset) appt.setEndDate(new Date(appt.getEndTime() + endDateOffset));
	this._continueDeleteReplyRespondAction(appt, action, mode);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSave =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	try {
		// NOTE: If the appt was already populated (perhaps by
		//       dragging it once, canceling the change, and then
		//       dragging it again), then the result will be null.
		if (result) {
			result.getResponse();
		}
		appt.setViewMode(viewMode);
		if (startDateOffset) {
			var sd = (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) ? appt.getUniqueStartDate() : new Date(appt.getStartTime());
			appt.setStartDate(new Date(sd.getTime() + startDateOffset));
			appt.resetRepeatWeeklyDays();
		}
		if (endDateOffset) {
			var ed = (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) ? appt.getUniqueEndDate() : new Date(appt.getEndTime());
			appt.setEndDate(new Date(ed.getTime() + endDateOffset));
		}
		if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
			//bug: 32231 - use proper timezone while creating exceptions
			appt.setOrigTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		}

		if(!appt.getTimezone()) appt.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [callback]);
		var respErrCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [errorCallback]);
		appCtxt.getShell().setBusy(true);
		appt.save(null, respCallback, respErrCallback);
	} catch (ex) {
		appCtxt.getShell().setBusy(false);
		if (ex.msg) {
			this.popupErrorDialog(AjxMessageFormat.format(ZmMsg.mailSendFailure, ex.msg));
		} else {
			this.popupErrorDialog(ZmMsg.errorGeneric, ex);
		}
		if (errorCallback) errorCallback.run(ex);
	}
	if (callback) callback.run(result);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSave2 =
function(callback) {
	appCtxt.getShell().setBusy(false);
	if (callback) callback.run();
};

ZmCalViewController.prototype._handleResponseUpdateApptDateIgnore =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	this._refreshAction(true);
	if (callback) callback.run(result);
};

/**
 * Gets the day tool tip text.
 * 
 * @param	{Date}		date		the date
 * @param	{Boolean}	noheader	if <code>true</code>, do not include tool tip header
 * @param	{AjxCallback}	callback		the callback
 */
ZmCalViewController.prototype.getDayToolTipText =
function(date, noheader, callback) {
	try {
		var start = new Date(date.getTime());
		start.setHours(0, 0, 0, 0);
		var startTime = start.getTime();
		var end = start.getTime() + AjxDateUtil.MSEC_PER_DAY;
        var params = {start:startTime, end:end, fanoutAllDay:true};
        if(callback) {
            params.callback = new AjxCallback(this, this._handleToolTipSearchResponse, [start, noheader, callback]);
            this.getApptSummaries(params);
        }else {
            var result = this.getApptSummaries(params);            
		    return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader);
        }
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.errorGettingAppts + "</b>";
	}
};

ZmCalViewController.prototype._handleToolTipSearchResponse =
function(start, noheader, callback, result) {
	try {
        var tooltip =  ZmApptViewHelper.getDayToolTipText(start, result, this, noheader);
        callback.run(tooltip);        
    } catch (ex) {
        DBG.println(ex);
        callback.run("<b>" + ZmMsg.errorGettingAppts + "</b>");
    }
};

ZmCalViewController.prototype.getUserStatusToolTipText =
function(start, end, noheader, email) {
	try {
		var calIds = [];
		if (this._calTreeController) {
			var calendars = this._calTreeController.getOwnedCalendars(this._app.getOverviewId(),email);
			for (var i = 0; i < calendars.length; i++) {
				var cal = calendars[i];
				if (cal) {
					calIds.push(cal.nId);
				}
			}
		}		
		
		if ((calIds.length == 0) || !email) {
			return "<b>" + ZmMsg.statusFree + "</b>";
		}

		var startTime = start.getTime();
		var endTime = end.getTime();

		var dayStart = new Date(start.getTime());
		dayStart.setHours(0, 0, 0, 0);

		var dayEnd = new Date(dayStart.getTime() + AjxDateUtil.MSEC_PER_DAY);

		// to avoid frequent request to server we cache the appt for the entire
		// day first before getting the appts for selected time interval
		this.getApptSummaries({start:dayStart.getTime(), end:dayEnd.getTime(), fanoutAllDay:true, folderIds: calIds});		

		var result = this.getApptSummaries({start:startTime, end:endTime, fanoutAllDay:true, folderIds: calIds});

		return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, ZmMsg.unknown);
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.meetingStatusUnknown + "</b>";
	}
};

ZmCalViewController.prototype._miniCalDateRangeListener =
function(ev) {
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);
};

ZmCalViewController.prototype._dateRangeListener =
function(ev) {
	ev.item.setNeedsRefresh(true);
	this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
};

ZmCalViewController.prototype.processInlineCalSearch =
function() {
	var srchResponse = window.inlineCalSearchResponse;
	if (!srchResponse) { return; }

	var params = srchResponse.search;
	var response = srchResponse.Body;

	if (params instanceof Array) {
		params = params[0];
	}

	var viewId = this._currentView ? this._currentView : this._defaultView();
	var fanoutAllDay = (viewId == ZmId.VIEW_CAL_MONTH);
	var searchParams = {start: params.s, end: params.e, fanoutAllDay: fanoutAllDay, callback: null};
	searchParams.folderIds = params.l ? params.l.split(",") : []; 
	searchParams.query = "";

	var miniCalParams = this.getMiniCalendarParams();
	miniCalParams.folderIds = searchParams.folderIds;

	this.apptCache.setSearchParams(searchParams);
	this.apptCache.processBatchResponse(response.BatchResponse, searchParams, miniCalParams);
};

ZmCalViewController.prototype._getViewType =
function() {
	return ZmId.VIEW_CAL;
};

ZmCalViewController.prototype.setCurrentView =
function(view) {
	// do nothing
};

ZmCalViewController.prototype._resetNavToolBarButtons =
function(view) {
	this._navToolBar[ZmId.VIEW_CAL].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
};

ZmCalViewController.prototype._resetToolbarOperations =
function(viewId) {
	ZmListController.prototype._resetToolbarOperations.call(this);

	var viewBtn = viewId && this._toolbar[ZmId.VIEW_CAL].getButton(ZmOperation.VIEW_MENU);
	if (viewBtn) {
		var op = ZmCalViewController.VIEW_TO_OP[viewId];
		var icon = ZmOperation.getProp(op, "image");
		viewBtn.setImage(icon);
		viewBtn.getMenu().checkItem(ZmOperation.MENUITEM_ID, op);
	}
};

ZmCalViewController.prototype._resetOperations =
function(parent, num) {
	parent.enableAll(true);
	var currViewName = this._viewMgr.getCurrentViewName();

	if (currViewName == ZmId.VIEW_CAL_LIST && num > 1) { return; }

	if (currViewName == ZmId.VIEW_CAL_APPT) {
		// disable DELETE since CAL_APPT_VIEW is a read-only view
		parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.CAL_REFRESH, ZmOperation.TODAY], false);
	}
	else {
		if (this._navToolBar[ZmId.VIEW_CAL]) {
			this._navToolBar[ZmId.VIEW_CAL].setVisible(true);
		}
		var currView = this._viewMgr.getCurrentView();
		var appt = currView ? currView.getSelection()[0] : null;
		var calendar = appt && appt.getFolder();
		var isReadOnly = calendar ? calendar.isReadOnly() : false;
		var isSynced = Boolean(calendar && calendar.url);
		var isShared = calendar ? calendar.isRemote() : false;
		var disabled = isSynced || isReadOnly || (num == 0);
		var isPrivate = appt && appt.isPrivate() && calendar.isRemote() && !calendar.hasPrivateAccess();
		var isForwadable = appt && !appt.isOrganizer() && !calendar.isReadOnly();
		parent.enable([ZmOperation.DELETE, ZmOperation.MOVE], !disabled);
		parent.enable(ZmOperation.TAG_MENU, (!isShared && !isSynced && num > 0));
		parent.enable(ZmOperation.VIEW_APPOINTMENT, !isPrivate);
		parent.enable([ZmOperation.FORWARD_APPT, ZmOperation.FORWARD_APPT_INSTANCE, ZmOperation.FORWARD_APPT_SERIES], isForwadable);
		parent.enable(ZmOperation.SHOW_ORIG, num == 1 && appt && appt.getRestUrl() != null);
	}

	if (currViewName == ZmId.VIEW_CAL_LIST) {
		parent.enable(ZmOperation.PRINT, num > 0);
	}

	// disable button for current view
	var op = ZmCalViewController.VIEW_TO_OP[currViewName];
	if (op) {
		parent.enable(op, false);
	}
};

ZmCalViewController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		this._viewMgr.getCurrentView()._apptSelected();
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var appt = ev.item;
		if (appt.isPrivate() && appt.getFolder().isRemote() && !appt.getFolder().hasPrivateAccess()) {
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.setMessage(ZmMsg.apptIsPrivate, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
		} else {
			// open a appointment view
			this._apptIndexShowing = this._list.indexOf(appt);
			this._apptFromView = this._viewMgr.getCurrentView();
			this._showAppointmentDetails(ev.item);
		}
	}
};

ZmCalViewController.prototype._handleMenuViewAction =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu.__appt;
	delete actionMenu.__appt;

	var calendar = appt.getFolder();
	var isSynced = Boolean(calendar.url);
    var mode = ZmCalItem.MODE_EDIT;
    var menuItem = ev.item;
    var menu = menuItem.parent;
    var id = menu.getData(ZmOperation.KEY_ID);
    switch(id) {
        case ZmOperation.VIEW_APPT_INSTANCE:	mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE; break;
        case ZmOperation.VIEW_APPT_SERIES:		mode = ZmCalItem.MODE_EDIT_SERIES; break;
    }
    
	if (appt.isReadOnly() || isSynced) {
		var clone = ZmAppt.quickClone(appt);
		var callback = new AjxCallback(this, this._showApptReadOnlyView, [clone, mode]);
		clone.getDetails(mode, callback, this._errorCallback);
	} else {
		this.editAppointment(appt, mode);
	}
};

ZmCalViewController.prototype._handleApptRespondAction =
function(ev) {
	var appt = this._listView[this._currentView].getSelection()[0];
	var type = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptRespondAction, [appt, type, op]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptRespondAction =
function(appt, type, op) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner());
};

ZmCalViewController.prototype._handleApptEditRespondAction =
function(ev) {
	var appt = this._listView[this._currentView].getSelection()[0];
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.parent.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptEditRespondAction, [appt, id, op]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptEditRespondAction =
function(appt, id, op) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg.subject = msg.subject || appt.name;
	if (!msg.getAddress(AjxEmailAddress.REPLY_TO)) {
		msg.setAddress(AjxEmailAddress.REPLY_TO, new AjxEmailAddress(appt.organizer));
	}
	msgController.setMsg(msg);

	// poke the msgController
	switch (id) {
		case ZmOperation.EDIT_REPLY_ACCEPT: 	id = ZmOperation.REPLY_ACCEPT; break;
		case ZmOperation.EDIT_REPLY_DECLINE: 	id = ZmOperation.REPLY_DECLINE; break;
		case ZmOperation.EDIT_REPLY_TENTATIVE: 	id = ZmOperation.REPLY_TENTATIVE; break;
	}
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._editInviteReply(id, 0, instanceDate, appt.getRemoteFolderOwner());
};

ZmCalViewController.prototype._handleError =
function(ex) {
	if (ex.code == 'mail.INVITE_OUT_OF_DATE' ||	ex.code == 'mail.NO_SUCH_APPT') {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._handleError2, this, [msgDialog]);
		msgDialog.setMessage(ZmMsg.apptOutOfDate, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};

ZmCalViewController.prototype._handleError2 =
function(msgDialog) {
	msgDialog.unregisterCallback(DwtDialog.OK_BUTTON);
	msgDialog.popdown();
	this._refreshAction(false);
};

ZmCalViewController.prototype._initCalViewMenu =
function(menu) {
	for (var i = 0; i < ZmCalViewController.OPS.length; i++) {
		var op = ZmCalViewController.OPS[i];
		menu.addSelectionListener(op, this._listeners[op]);
	}
};

/**
 * Overrides ZmListController.prototype._getViewActionMenuOps
 * 
 * @private
 */
ZmCalViewController.prototype._getViewActionMenuOps =
function () {
	return [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT,
			ZmOperation.SEP,
			ZmOperation.TODAY, ZmOperation.CAL_VIEW_MENU];
};

/**
 * Overrides ZmListController.prototype._initializeActionMenu
 * 
 * @private
 */
ZmCalViewController.prototype._initializeActionMenu =
function() {
	var menuItems = this._getActionMenuOps();
	if (menuItems && menuItems.length > 0) {
		this._actionMenu = this._createActionMenu(menuItems);

		var menuItems = this._getRecurringActionMenuOps();
		if (menuItems && menuItems.length > 0) {
			var params = {parent:this._shell, menuItems:menuItems};
			this._recurringActionMenu = new ZmActionMenu(params);
			menuItems = this._recurringActionMenu.opList;
			for (var i = 0; i < menuItems.length; i++) {
				var item = this._recurringActionMenu.getMenuItem(menuItems[i]);
				var recurMenuItems = this._getActionMenuOps(menuItems[i]);
				var recurActionMenu = this._createActionMenu(recurMenuItems);
				if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
					this._setupTagMenu(recurActionMenu);
				}
				item.setMenu(recurActionMenu);
				// NOTE: Target object for listener is menu item
				var menuItemListener = new AjxListener(item, this._recurringMenuPopup);
				item.addListener(AjxEnv.isIE ? DwtEvent.ONMOUSEENTER : DwtEvent.ONMOUSEOVER, menuItemListener);
			}
			this._recurringActionMenu.addPopdownListener(this._menuPopdownListener);
		}

		if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			this._setupTagMenu(this._actionMenu);
		}
	}
};

ZmCalViewController.prototype._createActionMenu =
function(menuItems) {
	var params = {parent:this._shell, menuItems:menuItems, context:this._getMenuContext()};
	var actionMenu = new ZmActionMenu(params);
	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (menuItem == ZmOperation.INVITE_REPLY_MENU) {
			var menu = actionMenu.getOp(ZmOperation.INVITE_REPLY_MENU).getMenu();
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_ACCEPT, this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]);
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_TENTATIVE, this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]);
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_DECLINE, this._listeners[ZmOperation.EDIT_REPLY_DECLINE]);
		} else if (menuItem == ZmOperation.CAL_VIEW_MENU) {
			var menu = actionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
			this._initCalViewMenu(menu);
		}
		if (this._listeners[menuItem]) {
			actionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
		}
	}
	actionMenu.addPopdownListener(this._menuPopdownListener);
	return actionMenu;
};

/**
 * The <code>this</code> in this method is the menu item.
 * 
 * @private
 */
ZmCalViewController.prototype._recurringMenuPopup =
function(ev) {
	if (!this.getEnabled()) { return; }

	var menu = this.getMenu();
	var opId = this.getData(ZmOperation.KEY_ID);
	menu.setData(ZmOperation.KEY_ID, opId);
};

/**
 * Overrides ZmListController.prototype._getActionMenuOptions
 * 
 * @private
 */
ZmCalViewController.prototype._getActionMenuOps =
function(recurrenceMode) {

	var deleteOp = ZmOperation.DELETE;
	var viewOp = ZmOperation.VIEW_APPOINTMENT;
	var forwardOp = ZmOperation.FORWARD_APPT;

	if (recurrenceMode == ZmOperation.VIEW_APPT_INSTANCE) {
		deleteOp = ZmOperation.DELETE_INSTANCE;
		viewOp = ZmOperation.OPEN_APPT_INSTANCE;
		forwardOp = ZmOperation.FORWARD_APPT_INSTANCE;
	} else if (recurrenceMode == ZmOperation.VIEW_APPT_SERIES) {
		deleteOp = ZmOperation.DELETE_SERIES;
		viewOp = ZmOperation.OPEN_APPT_SERIES;
		forwardOp = ZmOperation.FORWARD_APPT_SERIES;
	}

	return [
		viewOp,
		ZmOperation.SEP,
		ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_TENTATIVE, ZmOperation.REPLY_DECLINE, ZmOperation.INVITE_REPLY_MENU,
		ZmOperation.SEP,
		forwardOp,
		deleteOp, ZmOperation.MOVE, ZmOperation.TAG_MENU,
		ZmOperation.SHOW_ORIG
	];
};

ZmCalViewController.prototype._getRecurringActionMenuOps =
function() {
	return [ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions =
function(appt, actionMenu) {
	var isOrganizer = appt.isOrganizer();

	// find the checked calendar for this appt
	var calendar;
	var folderId = appt.getLocalFolderId();
	var calendars = this.getCheckedCalendars();
	for (var i = 0; i < calendars.length; i++) {
		if (calendars[i].id == folderId) {
			calendar = calendars[i];
			break;
		}
	}

	var share = calendar && calendar.link ? calendar.getMainShare() : null;
	var workflow = share ? share.isWorkflow() : true;
	var isPrivate = appt.isPrivate() && calendar.isRemote() && !calendar.hasPrivateAccess();
	var enabled = !isOrganizer && workflow && !isPrivate;
	var isForwadable = appt && !appt.isOrganizer() && !calendar.isReadOnly();

	// reply action menu
	actionMenu.enable(ZmOperation.REPLY_ACCEPT, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_ACCEPT);
	actionMenu.enable(ZmOperation.REPLY_DECLINE, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED);
	actionMenu.enable(ZmOperation.REPLY_TENTATIVE, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_TENTATIVE);
	actionMenu.enable(ZmOperation.INVITE_REPLY_MENU, enabled);
	actionMenu.enable([ZmOperation.FORWARD_APPT, ZmOperation.FORWARD_APPT_INSTANCE, ZmOperation.FORWARD_APPT_SERIES], isForwadable);

	// edit reply menu
	if (enabled) {
		var mi = actionMenu.getMenuItem(ZmOperation.INVITE_REPLY_MENU);
		if (mi) {
			var editReply = mi.getMenu();
			if (editReply) {
				editReply.enable(ZmOperation.EDIT_REPLY_ACCEPT, appt.ptst != ZmCalBaseItem.PSTATUS_ACCEPT);
				editReply.enable(ZmOperation.EDIT_REPLY_DECLINE, appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED);
				editReply.enable(ZmOperation.EDIT_REPLY_TENTATIVE, appt.ptst != ZmCalBaseItem.PSTATUS_TENTATIVE);
			}
		}
	}

	var del = actionMenu.getMenuItem(ZmOperation.DELETE);
	if (del) {
		del.setText((isOrganizer && appt.otherAttendees) ? ZmMsg.cancel : ZmMsg.del);
		var isSynced = Boolean(calendar.url);
		del.setEnabled(!calendar.isReadOnly() && !isSynced && !isPrivate);
	}

	// recurring action menu options
	if (this._recurringActionMenu) {
		this._recurringActionMenu.enable(ZmOperation.VIEW_APPT_SERIES, !appt.exception);
	}
};

ZmCalViewController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var appt = ev.item;
	var actionMenu = this.getActionMenu();
	var menu = appt.isRecurring() ? this._recurringActionMenu : actionMenu;
	this._enableActionMenuReplyOptions(appt, menu);
	var op = (menu == actionMenu) && appt.exception ? ZmOperation.VIEW_APPT_INSTANCE : null;
	actionMenu.__appt = appt;
	menu.setData(ZmOperation.KEY_ID, op);

	if (appt.isRecurring()) {
		var menuItem = menu.getMenuItem(ZmOperation.VIEW_APPT_INSTANCE);
		this._setTagMenu(menuItem.getMenu());
		this._enableActionMenuReplyOptions(appt, menuItem.getMenu());
		menuItem = menu.getMenuItem(ZmOperation.VIEW_APPT_SERIES);
		this._setTagMenu(menuItem.getMenu());
		this._enableActionMenuReplyOptions(appt, menuItem.getMenu());
	}
	menu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._viewActionListener =
function(ev) {
	if (!this._viewActionMenu) {
		var menuItems = this._getViewActionMenuOps();
		if (!menuItems) return;
		var overrides = {};
		overrides[ZmOperation.TODAY] = {textKey:"todayGoto"};
		var params = {parent:this._shell, menuItems:menuItems, overrides:overrides};
		this._viewActionMenu = new ZmActionMenu(params);
		menuItems = this._viewActionMenu.opList;
		for (var i = 0; i < menuItems.length; i++) {
			var menuItem = menuItems[i];
			if (menuItem == ZmOperation.CAL_VIEW_MENU) {
				var menu = this._viewActionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
				this._initCalViewMenu(menu);
			} else if (this._listeners[menuItem]) {
				this._viewActionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
			}
		}
	}

    if(this._viewVisible && this._currentView == ZmId.VIEW_CAL_SCHEDULE){
        var view = this._viewMgr.getView(this._currentView);
        var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, ev.target, true);
        var col = view._getColFromX(gridLoc.x);
        this._viewActionMenu._calendarId = (col && col.cal) ? col.cal.id : null;
    }else{
        this._viewActionMenu._calendarId = null;
    }

	this._viewActionMenu.__view = ev.item;
	this._viewActionMenu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentView];
	var div = view.getTargetItemDiv(ev.uiEvent);
	var item = div ? view.getItemFromElement(div) : null;

	// only tags can be dropped on us *if* we are not readonly
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (item && item.type == ZmItem.APPT) {
			var calendar = item.getFolder();
			var isReadOnly = calendar ? calendar.isReadOnly() : false;
			var isSynced = Boolean(calendar && calendar.url);
			if (isSynced || isReadOnly) {
				ev.doIt = false; // can't tag a GAL or shared contact
				view.dragSelect(div);
				return;
			}
		}
	}

	ZmListController.prototype._dropListener.call(this, ev);
};

ZmCalViewController.prototype.sendRequest =
function(soapDoc) {
	try {
		return appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
	} catch (ex) {
		// do nothing
		return null;
	}
};

/**
 * Caller is responsible for exception handling. caller should also not modify
 * appts in this list directly.
 *
 * @param	{Hash}		params		a hash of parameters
 * @param	{long}	params.start 			the start time (in milliseconds)
 * @param	{long}	params.end				the end time (in milliseconds)
 * @param	{Boolean}	params.fanoutAllDay	if <code>true</code>, 
 * @param	{Array}	params.folderIds		the list of calendar folder Id's (null means use checked calendars in overview)
 * @param	{AjxCallback}	params.callback		the callback triggered once search results are returned
 * @param	{Boolean}	params.noBusyOverlay	if <code>true</code>, do not show veil during search
 * 
 * @private
 */
ZmCalViewController.prototype.getApptSummaries =
function(params) {
	if (!params.folderIds) {
		params.folderIds = this.getCheckedCalendarFolderIds();
	}
	params.query = this._userQuery;

	return this.apptCache.getApptSummaries(params);
};

ZmCalViewController.prototype.handleUserSearch =
function(params, callback) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	this.show(null, null, true);

	this.apptCache.clearCache();
	this._viewMgr.setNeedsRefresh();
	this._userQuery = params.query;

	// set start/end date boundaries
	var view = this.getCurrentView();

	if (view && this._currentView == ZmId.VIEW_CAL_APPT) {
		view.close();
		view = this.getCurrentView();
	}

	if (view) {
		var rt = view.getTimeRange();
		params.start = rt.start;
		params.end = rt.end;
	} else if (this._miniCalendar) {
		var calRange = this._miniCalendar.getDateRange();
		params.start = calRange.start.getTime();
		params.end = calRange.end.getTime();
	} else {
		// TODO - generate start/end based on current month?
	}

	params.fanoutAllDay = view ? view._fanoutAllDay() : false;
	params.callback = new AjxCallback(this, this._searchResponseCallback, callback);

	this.getApptSummaries(params);
};

ZmCalViewController.prototype._searchResponseCallback =
function(callback, list, userQuery, result) {

	this.show(null, null, true);	// always make sure a calendar view is being shown
	this._userQuery = userQuery;	// cache the user-entered search query

	this._maintGetApptCallback(ZmCalViewController.MAINT_VIEW, this.getCurrentView(), list, true, userQuery);

	if (callback) {
		callback.run(result);
	}
};

// TODO: appt is null for now. we are just clearing our caches...
ZmCalViewController.prototype.notifyCreate =
function(create) {
	// mark folders which needs to be cleared
	if (create && create.l) {
		var cal = appCtxt.getById(create.l);
		if (cal && cal.id) {
			this._clearCacheFolderMap[cal.id] = true;
		}
	}
};

ZmCalViewController.prototype.notifyDelete =
function(ids) {
	if (this._clearCache) { return; }

	this._clearCache = this.apptCache.containsAnyId(ids);
	this.handleEditConflict(ids);
};

ZmCalViewController.prototype.handleEditConflict =
function(ids) {
	//handling a case where appt is edited and related calendar is deleted
	if(appCtxt.getAppViewMgr().getCurrentViewId() == ZmId.VIEW_APPOINTMENT) {
		var view = appCtxt.getAppViewMgr().getCurrentView();
		var appt = view.getAppt(true);
		var calendar = appt && appt.getFolder();
		var idStr = ","+ ids+",";
		if (idStr.indexOf("," + calendar.id + ",") >= 0) {
			this._app.getApptComposeController()._closeView();
		}
	}
};

ZmCalViewController.prototype.notifyModify =
function(modifies) {
	if (this._clearCache) { return; }

	// if any of the ids are in the cache then...
	for (var name in modifies) {
		var list = modifies[name];
		this._clearCache = this._clearCache || this.apptCache.containsAnyItem(list);
	}
};

// this gets called afer all the above notify* methods get called
ZmCalViewController.prototype.notifyComplete =
function() {
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: notifyComplete: " + this._clearCache);
	
	var clearCacheByFolder = false;
	
	for (var i in this._clearCacheFolderMap) {
		DBG.println("clear cache :" + i);
		this.apptCache.clearCache(i);
		clearCacheByFolder = true;
	}
	this._clearCacheFolderMap = {};
	
	if (this._clearCache) {
		var act = new AjxTimedAction(this, this._refreshAction);
		AjxTimedAction.scheduleAction(act, 0);
		this._clearCache = false;
	} else if(clearCacheByFolder) {
		var act = new AjxTimedAction(this, this._refreshAction, [true]);
		AjxTimedAction.scheduleAction(act, 0);
	}
};

ZmCalViewController.prototype.setNeedsRefresh =
function(refresh) {
	if (this._viewMgr != null) {
		this._viewMgr.setNeedsRefresh(refresh);
	}
};

// returns true if moving given appt from local to remote folder or vice versa
ZmCalViewController.prototype.isMovingBetwAccounts =
function(appts, newFolderId) {
	appts = (!(appts instanceof Array)) ? [appts] : appts;
	var isMovingBetw = false;
	for (var i = 0; i < appts.length; i++) {
		var appt = appts[i];
		if (!appt.isReadOnly() && appt._orig) {
			var origFolder = appt._orig.getFolder();
			var newFolder = appCtxt.getById(newFolderId);
			if (origFolder && newFolder) {
				if ((origFolder.id != newFolderId) &&
					((origFolder.link && !newFolder.link) || (!origFolder.link && newFolder.link)))
				{
					isMovingBetw = true;
					break;
				}
			}
		}
	}

	return isMovingBetw;
};

// this gets called when we get a refresh block from the server
ZmCalViewController.prototype.refreshHandler =
function() {
	var act = new AjxTimedAction(this, this._refreshAction);
	AjxTimedAction.scheduleAction(act, 0);
};

ZmCalViewController.prototype._refreshAction =
function(dontClearCache) {
	DBG.println(AjxDebug.DBG1, "ZmCalViewController: _refreshAction: " + dontClearCache);
	var forceMaintenance = false;
	// reset cache
	if (!dontClearCache) {
		this.apptCache.clearCache();
		forceMaintenance = true;
	}

	if (this._viewMgr != null) {
		// mark all views as dirty
		this._viewMgr.setNeedsRefresh(true);
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW|ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	} else if (this._miniCalendar != null) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	} else {
		this._scheduleMaintenance(ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	}
};

ZmCalViewController.prototype._maintErrorHandler =
function(params) {
	// TODO: resched work?
};

ZmCalViewController.prototype._maintGetApptCallback =
function(work, view, list, skipMiniCalUpdate, query) {
	if (list instanceof ZmCsfeException) {
		this.searchInProgress = false;
		this._handleError(list, new AjxCallback(this, this._maintErrorHandler));
		return;
	}
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: _maintGetApptCallback: " + work);
	this._userQuery = query;

	if (work & ZmCalViewController.MAINT_VIEW) {
		this._list = new ZmApptList();
		this._list.getVector().addList(list);
		var sel = view.getSelection();
		view.set(list, skipMiniCalUpdate);

		// For bug 27221, reset toolbar after refresh
		view.deselectAll();
		if (sel && sel.length > 0) {
			var id = sel[0].id;
			for (var i = 0; i < this._list.size(); i++) {
				if (this._list.getArray()[i].id == id) {
					view.setSelection(this._list.getArray[i],true);
					break;
				}
			}
		}
		this._resetToolbarOperations();
	}

	if (work & ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
	}

	this.searchInProgress = false;

	// initiate schedule action for pending work (process queued actions)
	if (this._pendingWork != ZmCalViewController.MAINT_NONE) {
		var newWork = this._pendingWork;
		this._pendingWork = ZmCalViewController.MAINT_NONE;
		this._scheduleMaintenance(newWork);
	}
};

ZmCalViewController.prototype._scheduleMaintenance =
function(work, forceMaintenance) {

	this.onErrorRecovery = new AjxCallback(this, this._errorRecovery, [work, forceMaintenance]);

	// schedule timed action
	if ((!this.searchInProgress || forceMaintenance) &&
		(this._pendingWork == ZmCalViewController.MAINT_NONE))
	{
		this._pendingWork |= work;
		AjxTimedAction.scheduleAction(this._maintTimedAction, 0);
	}
	else
	{
		this._pendingWork |= work;
	}
};

ZmCalViewController.prototype._errorRecovery =
function(work, forceMaintenance) {
	var maintainMiniCal = (work & ZmCalViewController.MAINT_MINICAL);
	var maintainView = (work & ZmCalViewController.MAINT_VIEW);
	var maintainRemainder = (work & ZmCalViewController.MAINT_REMINDER);
	if (maintainMiniCal || maintainView || maintainRemainder) {
		var view = this.getCurrentView();
		view.setNeedsRefresh(true);
	}
	this._scheduleMaintenance(work, forceMaintenance);
};

ZmCalViewController.prototype._maintenanceAction =
function() {
	var work = this._pendingWork;
	this.searchInProgress = true;
	this._pendingWork = ZmCalViewController.MAINT_NONE;

	var maintainMiniCal = (work & ZmCalViewController.MAINT_MINICAL);
	var maintainView = (work & ZmCalViewController.MAINT_VIEW);
	var maintainRemainder = (work & ZmCalViewController.MAINT_REMINDER);
	
	if (work == ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
		this.searchInProgress = false;
	}
	else if (maintainMiniCal || maintainView || maintainRemainder) {
		var view = this.getCurrentView();
		if (view && view.needsRefresh()) {
			var rt = view.getTimeRange();
			var params = {
				start: rt.start,
				end: rt.end,
				fanoutAllDay: view._fanoutAllDay(),
				callback: (new AjxCallback(this, this._maintGetApptCallback, [work, view])),
				accountFolderIds: ([].concat(this._checkedAccountCalendarIds)), // pass in a copy, not a reference
				query: this._userQuery
			};

			var reminderParams;
			if (maintainRemainder) {
				reminderParams = this._app.getReminderController().getRefreshParams();
				reminderParams.callback = null;
			}

			this.apptCache.batchRequest(params, this.getMiniCalendarParams(), reminderParams);

			view.setNeedsRefresh(false);
		} else {
			this.searchInProgress = false;
		}
	}
};

ZmCalViewController.prototype.getKeyMapName =
function() {
	return "ZmCalViewController";
};

ZmCalViewController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmCalViewController.handleKeyAction");

	switch (actionCode) {

		case ZmKeyMap.CAL_DAY_VIEW:
		case ZmKeyMap.CAL_WEEK_VIEW:
		case ZmKeyMap.CAL_WORK_WEEK_VIEW:
		case ZmKeyMap.CAL_MONTH_VIEW:
		case ZmKeyMap.CAL_SCHEDULE_VIEW:
		case ZmKeyMap.CAL_LIST_VIEW:
			this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
			break;

		case ZmKeyMap.TODAY:
			this._todayButtonListener();
			break;

		case ZmKeyMap.REFRESH:
			this._refreshButtonListener();
			break;

		case ZmKeyMap.QUICK_ADD:
			if (appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD)) {
				var date = this._viewMgr ? this._viewMgr.getDate() : new Date();
				this.newAppointmentHelper(date, ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
			}
			break;

		case ZmKeyMap.EDIT:
			var appt = this._listView[this._currentView].getSelection()[0];
			if (appt) {
				var ev = new DwtSelectionEvent();
				ev.detail = DwtListView.ITEM_DBL_CLICKED;
				ev.item = appt;
				this._listSelectionListener(ev);
			}
			break;

		case ZmKeyMap.CANCEL:
			if (this._currentView == ZmId.VIEW_CAL_APPT) {
				this._listView[this._currentView].close();
			}
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

ZmCalViewController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[ZmId.VIEW_CAL];
};

/**
 * Returns a reference to the singleton message controller, used to send mail (in our case,
 * invites and their replies). If mail is disabled, we create our own ZmMsgController so that
 * we don't load the mail package.
 * 
 * @private
 */
ZmCalViewController.prototype._getMsgController =
function() {
	if (!this._msgController) {
		if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
			this._msgController = AjxDispatcher.run("GetMsgController");
		} else {
			AjxDispatcher.require("Mail");
			this._msgController = new ZmMsgController(this._container, this._app);
		}
	}
	return this._msgController;
};

ZmCalViewController.prototype.getMiniCalendarParams =
function() {
	var dr = this.getMiniCalendar().getDateRange();
	return {
		start: dr.start.getTime(),
		end: dr.end.getTime(),
		fanoutAllDay: true,
		noBusyOverlay: true,
		folderIds: this.getCheckedCalendarFolderIds(),
        tz: AjxTimezone.DEFAULT
	};
};

ZmCalViewController.prototype.getMiniCalCache =
function() {
	if (!this._miniCalCache) {
		this._miniCalCache = new ZmMiniCalCache(this);
	}
	return this._miniCalCache;
};

/**
 * Gets the calendar name.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{String}	the name
 */
ZmCalViewController.prototype.getCalendarName =
function(folderId) {
	var cal = appCtxt.getById(folderId);
	return cal && cal.getName();
};

ZmCalViewController.prototype._checkItemCount =
function() {
	// No-op since this view doesn't do virtual paging.
};


ZmCalViewController.prototype._showOrigListener =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu && actionMenu.__appt;
	if (appt)
		this._showApptSource(appt);
};

ZmCalViewController.prototype._showApptSource =
function(appt) {
	var restUrl = appt.getRestUrl();
	if (restUrl) {
		var url = [restUrl, (restUrl.indexOf("?")==-1) ? "?" : "&", "mime=text/plain", "&", "noAttach=1"].join("");
		window.open(url, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
	}
};
