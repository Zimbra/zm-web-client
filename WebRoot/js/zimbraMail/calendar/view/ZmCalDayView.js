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

ZmCalDayView = function(parent, posStyle, controller, dropTgt, view, numDays, readonly) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_DAY, 1, false, readonly);
	this._compactMode = false;
};

ZmCalDayView.prototype = new ZmCalColView;
ZmCalDayView.prototype.constructor = ZmCalDayView;

ZmCalDayView.prototype.toString =
function() {
	return "ZmCalDayView";
};

ZmCalDayView.prototype.setCompactMode =
function(compactMode) {
	this._compactMode = compactMode;
};

ZmCalDayView.prototype.isCompactMode =
function() {
	return this._compactMode;
};

ZmCalDayView.prototype._layout =
function(refreshApptLayout) {
	ZmCalColView.prototype._layout.call(this, refreshApptLayout);

	if (this._compactMode && !this._closeButton) {
		var btn = this._closeButton = new DwtButton({
			parent:this,
			style: DwtLabel.ALIGN_RIGHT | DwtButton.ALWAYS_FLAT,
			posStyle: DwtControl.ABSOLUTE_STYLE,
			className:"DwtToolbarButton cal_day_expand"
		});
		this._closeButton.setImage("Close");
		this._closeButton.setToolTipContent(ZmMsg.close);
		this._closeButton.setSize(16,16);
		var size= this.getSize();
		this._closeButton.setLocation(size.x-22, 0); // close button at top right corner for compact mode alone
		this._closeButton.addSelectionListener(new AjxListener(this, this._closeDayViewListener));
	}
};

ZmCalDayView.prototype._closeDayViewListener =
function() {
	if (this._closeDayViewCallback) {
		this._closeDayViewCallback.run();
	}
};

ZmCalDayView.prototype.setCloseDayViewCallback =
function(callback) {
	this._closeDayViewCallback = callback;
};

ZmCalDayView.prototype.setSize =
function(width, height) {
	ZmCalColView.prototype.setSize.call(this, width, height);
	if (this._closeButton) {
		this._closeButton.setLocation(width-22, 0);
	}
};

ZmCalDayView.prototype._controlListener =
function(ev) {
	if (!this._compactMode) {
		ZmCalColView.prototype._controlListener.call(this, ev);
	}
};
