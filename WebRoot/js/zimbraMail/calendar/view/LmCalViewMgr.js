function LmCalViewMgr(parent, dropTgt) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, "LmCalViewMgr", Dwt.ABSOLUTE_STYLE);
	this.addControlListener(new LsListener(this, this._controlListener));

	this._dropTgt = dropTgt;	

	// View array. Holds the various views e.g. day, month, week, etc...
	this._views = new Object();
	this._date = new Date();
	this._viewFactory = new Object();
	this._viewFactory[LmCalViewMgr.DAY_VIEW] = LmCalDayView;
	this._viewFactory[LmCalViewMgr.WORK_WEEK_VIEW] = LmCalWorkWeekView;
	this._viewFactory[LmCalViewMgr.WEEK_VIEW] = LmCalWeekView;
	this._viewFactory[LmCalViewMgr.MONTH_VIEW] = LmCalMonthView;
}

LmCalViewMgr.prototype = new DwtComposite;
LmCalViewMgr.prototype.constructor = LmCalViewMgr;

LmCalViewMgr.DAY_VIEW = "DayView";
LmCalViewMgr.WORK_WEEK_VIEW = "WorkWeekView";
LmCalViewMgr.WEEK_VIEW = "WeekView";
LmCalViewMgr.MONTH_VIEW = "MonthView";

LmCalViewMgr._SEP = 5;

LmCalViewMgr.prototype.toString = 
function() {
	return "LmCalViewMgr";
}

// sets need refresh on all views
LmCalViewMgr.prototype.setNeedsRefresh = 
function() {
	for (var name in this._views) {
		this._views[name].setNeedsRefresh(true);
	}
}

LmCalViewMgr.prototype.getCurrentView =
function() {
	return this._views[this._currentViewName];
}

LmCalViewMgr.prototype.getCurrentViewName =
function() {
	return this._currentViewName;
}

LmCalViewMgr.prototype.getView =
function(viewName) {
	return this._views[viewName];
}

LmCalViewMgr.prototype.getTitle =
function() {
	return this.getCurrentView().getTitle();
}

LmCalViewMgr.prototype.getDate =
function() 
{
	return this._date;
}

LmCalViewMgr.prototype.setDate =
function(date, duration, roll)
{
//DBG.println("LmCalViewMgr.setDate = "+date);
	this._date = new Date(date.getTime());
	if (this._currentViewName != null) {
		var view = this._views[this._currentViewName];
		view.setDate(date, duration, roll);
	}
}

LmCalViewMgr.prototype.createView =
function(viewName) {
//DBG.println("LmCalViewMgr.prototype.createView: " + viewName);
	view = new this._viewFactory[viewName](this, DwtControl.ABSOLUTE_STYLE, this._dropTgt);
	view.setDragSource(this._dragSrc);
	view.addTimeSelectionListener(new LsListener(this, this._viewTimeSelectionListener));	
	view.addDateRangeListener(new LsListener(this, this._viewDateRangeListener));
	this._views[viewName] = view;
	return view;
}

LmCalViewMgr.prototype.addTimeSelectionListener = 
function(listener) {
	this.addListener(LmCalBaseView.TIME_SELECTION, listener);
}

LmCalViewMgr.prototype.removeTimeSelectionListener = 
function(listener) {
	this.removeListener(LmCalBaseView.TIME_SELECTION, listener);
}

LmCalViewMgr.prototype.addDateRangeListener = 
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
}

LmCalViewMgr.prototype.removeDateRangeListener = 
function(listener) {
	this.removeListener(DwtEvent.DATE_RANGE, listener);	
}

LmCalViewMgr.prototype.setView =
function(viewName) {
//DBG.println("LmCalViewMgr.prototype.setView: " + viewName);
	if (viewName != this._currentViewName) {
		if (this._currentViewName) {
			//this._views[this._currentViewName].setVisible(false);
			this._views[this._currentViewName].setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
		}
		var view = this._views[viewName];
		//view.setVisible(true);
		this._currentViewName = viewName;

		var vd = view.getDate();
		
		if (vd == null || (view.getDate().getTime() != this._date.getTime())) {
				view.setDate(this._date, 0, true);
		}
		this._layout();
	}
}

LmCalViewMgr.prototype._layout =
function() {
	var mySz = this.getSize();
//DBG.println("_layout");
//DBG.dumpObj(mySz);
	if (mySz.x == 0 || mySz.y == 0)
		return;
	var view = this._views[this._currentViewName];
	var width = mySz.x - LmCalViewMgr._SEP;
	var height = mySz.y;
	var viewSz = view.getSize();
	if (viewSz.x == width && viewSz.y == height)
		view.setLocation(0, 0);
	else
		view.setBounds(0, 0, width, height);	
}

LmCalViewMgr.prototype._controlListener =
function(ev) {
//DBG.println("LmCalViewMgr._controlListener!!! this._oldHeight="+this._oldHeight+" this._oldWidth="+this._oldWidth);
//DBG.dumpObj(ev);
	if (ev.oldHeight != ev.newHeight
		|| ev.oldWidth != ev.newWidth) {
		this._layout();
	}	
}

LmCalViewMgr.prototype._viewTimeSelectionListener =
function(ev) {
	//DBG.println("LmCalViewMgr: VTS LISTENER: " + ev.detail);
	this.notifyListeners(LmCalBaseView.TIME_SELECTION, ev);
}

LmCalViewMgr.prototype._viewSelectionListener =
function(ev) {
//	DBG.println("LmCalViewMgr: VS LISTENER: " + ev.detail);
	//this.notifyListeners(LmCalBaseView.TIME_SELECTION, ev);
}

LmCalViewMgr.prototype._viewDateRangeListener =
function(ev) {
	//DBG.println("viewRangeListener!!!");
	//DBG.dumpObj(ev);
	// Notify any listeners
	if (!this.isListenerRegistered(DwtEvent.DATE_RANGE))
		return;
	this.notifyListeners(DwtEvent.DATE_RANGE, ev);
}

