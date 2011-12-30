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
 * Creates the calendar view manager.
 * @class
 * This class represents the calendar view manager.
 * 
 * @param {DwtShell}	parent			the element that created this view
 * @param {ZmController}		controller		the controller
 * @param {DwtDropTarget}	dropTgt			the drop target
 * 
 * @extends		DwtComposite
 */
ZmCalViewMgr = function(parent, controller, dropTgt) {

	DwtComposite.call(this, {parent:parent, className:"ZmCalViewMgr", posStyle:Dwt.ABSOLUTE_STYLE});
	this.addControlListener(new AjxListener(this, this._controlListener));

	this._controller = controller;
	this._dropTgt = dropTgt;
    this._showNewScheduleView = appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED);
	// View hash. Holds the various views e.g. day, month, week, etc...
	this._views = {};
	this._date = new Date();
	this._viewFactory = {};
	this._viewFactory[ZmId.VIEW_CAL_DAY]		= ZmCalDayTabView;
	this._viewFactory[ZmId.VIEW_CAL_WORK_WEEK]	= ZmCalWorkWeekView;
	this._viewFactory[ZmId.VIEW_CAL_WEEK]		= ZmCalWeekView;
	this._viewFactory[ZmId.VIEW_CAL_MONTH]		= ZmCalMonthView;
	this._viewFactory[ZmId.VIEW_CAL_LIST]		= ZmCalListView;
    this._viewFactory[ZmId.VIEW_CAL_FB]	        = ZmCalNewScheduleView;

    this._viewFactory[ZmId.VIEW_CAL_TRASH]		= ZmApptListView;
};

ZmCalViewMgr.prototype = new DwtComposite;
ZmCalViewMgr.prototype.constructor = ZmCalViewMgr;

ZmCalViewMgr._SEP = 5;

ZmCalViewMgr.MIN_CONTENT_SIZE = 100;

ZmCalViewMgr.prototype.toString = 
function() {
	return "ZmCalViewMgr";
};

ZmCalViewMgr.prototype.TEMPLATE = "calendar.Calendar#ZmCalViewMgr";

ZmCalViewMgr.prototype._subContentShown = false;
ZmCalViewMgr.prototype._subContentInitialized = false;

ZmCalViewMgr.prototype.getController =
function() {
	return this._controller;
};

// sets need refresh on all views
ZmCalViewMgr.prototype.setNeedsRefresh = 
function() {
	for (var name in this._views) {
		this._views[name].setNeedsRefresh(true);
    }
};

ZmCalViewMgr.prototype.layoutWorkingHours =
function() {
	for (var name in this._views) {
		if (name == ZmId.VIEW_CAL_DAY ||
            name == ZmId.VIEW_CAL_WORK_WEEK ||
            name == ZmId.VIEW_CAL_WEEK ||
            name == ZmId.VIEW_CAL_FB
            )
			this._views[name].layoutWorkingHours();
	}
};

ZmCalViewMgr.prototype.needsRefresh =
function(viewId) {
	viewId = viewId || this._currentViewName;
	var view = this._views[viewId];
	return view.needsRefresh ? view.needsRefresh() : false;
};

ZmCalViewMgr.prototype.getCurrentView =
function() {
	return this._views[this._currentViewName];
};

ZmCalViewMgr.prototype.getCurrentViewName =
function() {
	return this._currentViewName;
};

ZmCalViewMgr.prototype.getView =
function(viewName) {
	return this._views[viewName];
};

ZmCalViewMgr.prototype.getTitle =
function() {
	return this.getCurrentView().getTitle();
};

ZmCalViewMgr.prototype.getDate =
function() {
	return this._date;
};

ZmCalViewMgr.prototype.setDate =
function(date, duration, roll) {
	this._date = new Date(date.getTime());
	this._duration = duration;
	if (this._currentViewName) {
		var view = this._views[this._currentViewName];
		view.setDate(date, duration, roll);
	}
};

ZmCalViewMgr.prototype.createView =
function(viewName) {
	var view = new this._viewFactory[viewName](this, DwtControl.ABSOLUTE_STYLE, this._controller, this._dropTgt);

	if (viewName != ZmId.VIEW_CAL_TRASH) {
		view.addTimeSelectionListener(new AjxListener(this, this._viewTimeSelectionListener));
		view.addDateRangeListener(new AjxListener(this, this._viewDateRangeListener));
		view.addViewActionListener(new AjxListener(this, this._viewActionListener));
	}
	this._views[viewName] = view;
    if (viewName == ZmId.VIEW_CAL_TRASH) {
        var controller = this._controller;
        view.addSelectionListener(new AjxListener(controller, controller._listSelectionListener));
        view.addActionListener(new AjxListener(controller, controller._listActionListener));
    }
	return view;
};

ZmCalViewMgr.prototype.getSubContentView = function() {
    return this._list || this._createSubContent();
};

ZmCalViewMgr.prototype.getSelTrashCount = function() {

    var folders  = this._controller.getCheckedCalendars(true);
    this._multiAccTrashQuery = [];
    for (var i=0; i< folders.length; i++) {
        if (folders[i].nId == ZmOrganizer.ID_TRASH) {
            this._multiAccTrashQuery.push(['inid:', '"', folders[i].getAccount().id, ':', ZmOrganizer.ID_TRASH, '"'].join(""));
        }
    }
    return this._multiAccTrashQuery.length;
};

ZmCalViewMgr.prototype.setSubContentVisible = function(visible) {

    if (appCtxt.multiAccounts) {
        var selCount = this.getSelTrashCount();
        // if no trash is checked
        if (selCount < 1) {
            this._subContentShown = false;
            this._subContentInitialized = true;
            this._controller.setCurrentListView(null);
        } else {
        // if more one or more trash is checked
            this._subContentShown = true;
        }
    } else if (this._subContentShown != visible) {
        this._subContentShown = visible;
        if (!visible) {
            this._controller.setCurrentListView(null);
        }
    }
    this._layout();
};

ZmCalViewMgr.prototype._createSubContent = function() {
    if (!this._subContentShown) return null;
    if (this._subContentInitialized) return this._list;

    this._subContentInitialized = true;

    this._sash = new DwtSash({parent:this,posStyle:Dwt.ABSOLUTE_STYLE,style:DwtSash.VERTICAL_STYLE});
    this._sash.registerCallback(this._handleSashAdjustment, this);
    this._list = this.createView(ZmId.VIEW_CAL_TRASH);
    this._list.set(new AjxVector([]));

    this._populateTrashListView(this._list);
    return this._list;
};

ZmCalViewMgr.prototype._handleSashAdjustment = function(delta) {
    // sash moved too far up
    var sashLocation = this._sash.getLocation();
    if (sashLocation.y + delta < ZmCalViewMgr.MIN_CONTENT_SIZE) {
        delta = ZmCalViewMgr.MIN_CONTENT_SIZE - sashLocation.y;
    }

    // sash moved to0 far down
    else {
        var size = this.getSize();
        if (sashLocation.y + delta > size.y - ZmCalViewMgr.MIN_CONTENT_SIZE) {
            delta = size.y - ZmCalViewMgr.MIN_CONTENT_SIZE - sashLocation.y;
        }
    }

    // adjust sub-content
    if (delta != 0) {
        var listSize = this._list.getSize();
        this._list.setSize(listSize.x, listSize.y - delta);
        this._layoutControls(true);
    }

    return delta;
};

ZmCalViewMgr.prototype._populateTrashListView = function(listView) {
    var params = {
        searchFor:ZmItem.APPT,
        limit:20,
        types:AjxVector.fromArray([ZmId.ITEM_APPOINTMENT]),
        forceSearch: true,
//        noRender: true,
        callback: new AjxCallback(this, this._populateTrashListViewResults, [listView])
    };

    if (appCtxt.multiAccounts) {
        params.query = this._multiAccTrashQuery.join(" OR ");
        params.account = appCtxt.accountList.mainAccount.name;
    } else {
        params.query = "inid:"+ZmOrganizer.ID_TRASH;
    }
    var search = new ZmSearch(params);
    search.execute(params);
};

ZmCalViewMgr.prototype._populateTrashListViewResults = function(listView, results) {
    var data = results && results._data;
    var apptList = data && data._results && data._results.APPT;
    listView.set(apptList || new AjxVector([]));
};

ZmCalViewMgr.prototype.addViewActionListener =
function(listener) {
	this.addListener(ZmCalBaseView.VIEW_ACTION, listener);
};

ZmCalViewMgr.prototype.removeViewActionListener = 
function(listener) {
	this.removeListener(ZmCalBaseView.VIEW_ACTION, listener);
};

ZmCalViewMgr.prototype.addTimeSelectionListener = 
function(listener) {
	this.addListener(ZmCalBaseView.TIME_SELECTION, listener);
};

ZmCalViewMgr.prototype.removeTimeSelectionListener = 
function(listener) {
	this.removeListener(ZmCalBaseView.TIME_SELECTION, listener);
};

ZmCalViewMgr.prototype.addDateRangeListener = 
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
};

ZmCalViewMgr.prototype.removeDateRangeListener = 
function(listener) {
	this.removeListener(DwtEvent.DATE_RANGE, listener);
};

ZmCalViewMgr.prototype.setView =
function(viewName) {
	if (viewName != this._currentViewName) {
		if (this._currentViewName) {
			this._views[this._currentViewName].setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		}
		var view = this._views[viewName];
		this._currentViewName = viewName;

		var vd = view.getDate();
		if (vd == null || (view.getDate().getTime() != this._date.getTime())) {
			view.setDate(this._date, this._duration, true);
		}
		this._layout();
	}
};

ZmCalViewMgr.prototype._layout =
function() {
    // create sub-content, if needed
    var showSubContent = this._subContentShown;
    if (showSubContent && !this._subContentInitialized) {
        this._createSubContent();

        // NOTE: The list maintains its size so we can toggle back and forth
        var size = this.getSize();
        this._list.setSize(null, size.y / 3);
    }
    // Always re-populate trash list for multi-accounts
    if (appCtxt.multiAccounts && this._subContentInitialized) {
        this._populateTrashListView(this._list);
    }

    // show sub-content
    if (this._sash) {
        this._sash.setVisible(showSubContent);
        this._list.setVisible(showSubContent);
    }

    // layout the controls
    this._layoutControls();
};

ZmCalViewMgr.prototype._layoutControls = function(skipSash) {
    // size sub-content
    var size = this.getSize();
    var contentHeight = size.y;
    if (this._subContentShown) {
        var listSize = this._list.getSize();
        var sashSize = this._sash.getSize();
        var subContentHeight = listSize.y + sashSize.y;

        contentHeight -= subContentHeight;

        if (!skipSash) {
            this._sash.setBounds(0, contentHeight, size.x, sashSize.y);
        }
        this._list.setBounds(0, contentHeight+sashSize.y, size.x, listSize.y);
    }

    // size content
    var view = this._views[this._currentViewName];
    view.setBounds(0, 0, size.x, contentHeight);

    //need to reset layout for time view renderings
    if (view instanceof ZmCalBaseView) view.layoutView();
};

ZmCalViewMgr.prototype._controlListener =
function(ev) {
	if (ev.oldHeight != ev.newHeight ||
		ev.oldWidth != ev.newWidth)
	{
		this._layout();
	}
};

ZmCalViewMgr.prototype._viewTimeSelectionListener =
function(ev) {
	this.notifyListeners(ZmCalBaseView.TIME_SELECTION, ev);
};


ZmCalViewMgr.prototype._viewActionListener =
function(ev) {
	this.notifyListeners(ZmCalBaseView.VIEW_ACTION, ev);
};

ZmCalViewMgr.prototype._viewSelectionListener =
function(ev) {
	//this.notifyListeners(ZmCalBaseView.TIME_SELECTION, ev);
};

ZmCalViewMgr.prototype._viewDateRangeListener =
function(ev) {
	// Notify any listeners
	if (this.isListenerRegistered(DwtEvent.DATE_RANGE)) {
		this.notifyListeners(DwtEvent.DATE_RANGE, ev);
	}
};
