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
};

ZmCalViewMgr.prototype = new DwtComposite;
ZmCalViewMgr.prototype.constructor = ZmCalViewMgr;

ZmCalViewMgr._SEP = 5;

ZmCalViewMgr.prototype.toString = 
function() {
	return "ZmCalViewMgr";
};

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

	if (viewName != ZmId.VIEW_CAL_APPT) {
		view.addTimeSelectionListener(new AjxListener(this, this._viewTimeSelectionListener));
		view.addDateRangeListener(new AjxListener(this, this._viewDateRangeListener));
		view.addViewActionListener(new AjxListener(this, this._viewActionListener));
	}
	this._views[viewName] = view;
	return view;
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
	var mySz = this.getSize();
	if (mySz.x == 0 || mySz.y == 0) { return; }

	var view = this._views[this._currentViewName];
	var width = mySz.x - ZmCalViewMgr._SEP;
	var height = mySz.y;
	var viewSz = view.getSize();
	if (viewSz.x == width && viewSz.y == height) {
		view.setLocation(0, 0);
	} else {
		view.setBounds(0, 0, width, height);
	}
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
