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

	// View hash. Holds the various views e.g. day, month, week, etc...
	this._views = {};
	this._date = new Date();
	this._viewFactory = {};
	this._viewFactory[ZmId.VIEW_CAL_DAY]		= ZmCalDayView;
	this._viewFactory[ZmId.VIEW_CAL_WORK_WEEK]	= ZmCalWorkWeekView;
	this._viewFactory[ZmId.VIEW_CAL_WEEK]		= ZmCalWeekView;
	this._viewFactory[ZmId.VIEW_CAL_MONTH]		= ZmCalMonthView;
	this._viewFactory[ZmId.VIEW_CAL_LIST]		= ZmCalListView;
	this._viewFactory[ZmId.VIEW_CAL_SCHEDULE]	= ZmCalScheduleView;
	this._viewFactory[ZmId.VIEW_CAL_APPT]		= ZmApptView;
    this._viewFactory[ZmId.VIEW_CAL_TRASH]		= ZmApptListView;

    this._createHtml();
};

ZmCalViewMgr.prototype = new DwtComposite;
ZmCalViewMgr.prototype.constructor = ZmCalViewMgr;

ZmCalViewMgr._SEP = 5;

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
		if (name != ZmId.VIEW_CAL_APPT)
			this._views[name].setNeedsRefresh(true);
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
	if (this._currentViewName && this._currentViewName != ZmId.VIEW_CAL_APPT) {
		var view = this._views[this._currentViewName];
		view.setDate(date, duration, roll);
	}
};

ZmCalViewMgr.prototype.createView =
function(viewName) {
	var view = new this._viewFactory[viewName](this, DwtControl.ABSOLUTE_STYLE, this._controller, this._dropTgt);

	if (viewName != ZmId.VIEW_CAL_APPT && viewName != ZmId.VIEW_CAL_TRASH) {
		view.addTimeSelectionListener(new AjxListener(this, this._viewTimeSelectionListener));
		view.addDateRangeListener(new AjxListener(this, this._viewDateRangeListener));
		view.addViewActionListener(new AjxListener(this, this._viewActionListener));
	}
	this._views[viewName] = view;
	return view;
};

ZmCalViewMgr.prototype.getSubContentView = function() {
    return this._list || this._createSubContent();
};

ZmCalViewMgr.prototype.setSubContentVisible = function(visible) {
    if (this._subContentShown != visible) {
        this._subContentShown = visible;
        if (!visible) {
            this._controller.setCurrentListView(null);
        }
        this._layout();
    }
};

ZmCalViewMgr.prototype._createSubContent = function() {
    if (this._subContentInitialized) return this._list;

    this._subContentInitialized = true;

    this._sash = new DwtSash({parent:this,posStyle:Dwt.ABSOLUTE_STYLE,style:DwtSash.VERTICAL_STYLE});
    this._list = this.createView(ZmId.VIEW_CAL_TRASH);
    this._list.set(new AjxVector([]));

    this._subContentEl.appendChild(this._sash.getHtmlElement());
    this._subContentEl.appendChild(this._list.getHtmlElement());

    this._populateTrashListView(this._list);
    return this._list;
};

ZmCalViewMgr.prototype._populateTrashListView = function(listView) {
    var params = {
        searchFor:ZmItem.APPT,
        query:"inid:"+ZmOrganizer.ID_TRASH,
        limit:20,
        types:AjxVector.fromArray([ZmId.ITEM_APPOINTMENT]),
        forceSearch: true,
//        noRender: true,
        callback: new AjxCallback(this, this._populateTrashListViewResults, [listView])
    };
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

		if (viewName != ZmId.VIEW_CAL_APPT) {
			var vd = view.getDate();
			if (vd == null || (view.getDate().getTime() != this._date.getTime())) {
				view.setDate(this._date, this._duration, true);
			}
		}
		this._layout();
	}
};

ZmCalViewMgr.prototype._layout =
function() {
    var size = this.getSize();

    // create sub-content, if needed
    var showSubContent = this.getCurrentViewName() != ZmId.VIEW_CAL_LIST && this._subContentShown;
    if (showSubContent && !this._subContentInitialized) {
        Dwt.setSize(this._contentEl, null, 2 * size.y / 3);
        Dwt.setSize(this._subContentEl, null, size.y / 3);
        this._createSubContent();
    }

    // show sub-content
    Dwt.setVisible(this._subContentEl, showSubContent);
    if (this._sash) {
        this._sash.setVisible(showSubContent);
        this._list.setVisible(showSubContent);
    }

    // size sub-content
    var contentWidth = size.x;
    var contentHeight = size.y;
    if (showSubContent) {
        var subContentHeight = Dwt.getSize(this._subContentEl).y;
        var sashHeight = this._sash.getSize().y;

        this._sash.setBounds(0, 0, contentWidth, sashHeight);
        this._list.setBounds(0, sashHeight, contentWidth, subContentHeight - sashHeight);

        contentHeight -= subContentHeight;
    }

    // size content
    var view = this._views[this._currentViewName];
    view.setBounds(0, 0, contentWidth, contentHeight);
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

ZmCalViewMgr.prototype._createHtml = function(templateId) {
    this._createHtmlFromTemplate(templateId||this.TEMPLATE, {id:this.getHTMLElId()});
};

ZmCalViewMgr.prototype._createHtmlFromTemplate = function(templateId, data) {
    DwtComposite.prototype._createHtmlFromTemplate.apply(this, arguments);
    this._contentEl = document.getElementById(data.id+"_content");
    this._subContentEl = document.getElementById(data.id+"_subcontent");
};
