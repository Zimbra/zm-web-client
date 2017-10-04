/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmDoublePaneView = function(params) {

	if (arguments.length == 0) { return; }

	var view = this._view = params.view = params.controller.getCurrentViewId();
	params.id = ZmId.getViewId(view);
	DwtComposite.call(this, params);

	this._controller = params.controller;
	this._initHeader();

	params.className = null;
	params.id = DwtId.getListViewId(view);
	params.parent = this;
	params.posStyle = Dwt.ABSOLUTE_STYLE;
	this._mailListView = this._createMailListView(params);

	// create the item view
	params.className = null;
	this._itemView = this._createMailItemView(params);

    var viewType = appCtxt.getViewTypeFromId(view);
    if (viewType === ZmId.VIEW_TRAD || viewType === ZmId.VIEW_CONVLIST) {
        this._createSashes();
    }
	this.setReadingPane();
};

ZmDoublePaneView.prototype = new DwtComposite;
ZmDoublePaneView.prototype.constructor = ZmDoublePaneView;

ZmDoublePaneView.prototype.isZmDoublePaneView = true;
ZmDoublePaneView.prototype.toString = function() { return "ZmDoublePaneView"; };

// consts

ZmDoublePaneView.SASH_THRESHOLD = 5;
ZmDoublePaneView.MIN_LISTVIEW_WIDTH = 40;

ZmDoublePaneView._TAG_IMG = "TI";


// public methods

ZmDoublePaneView.prototype.getController =
function() {
	return this._controller;
};

ZmDoublePaneView.prototype.getTitle =
function() {
	return this._mailListView.getTitle();
};

/**
 * Displays the reading pane, based on the current settings.
 */
ZmDoublePaneView.prototype.setReadingPane =
function(noSet) {

	var mlv = this._mailListView,
        mv = this._itemView,
        sashesPresent = this._vertSash && this._horizSash;

	var readingPaneEnabled = this._controller.isReadingPaneOn();
	if (!readingPaneEnabled) {
		mv.setVisible(false);
        if (sashesPresent) {
            this._vertSash.setVisible(false);
            this._horizSash.setVisible(false);
        }
	}
    else {
		if (!mv.getVisible()) {
			if (mlv.getSelectionCount() == 1) {
				this._controller._setSelectedItem();
			} else {
				mv.reset();
			}
		}
		var readingPaneOnRight = this._controller.isReadingPaneOnRight();
		mv.setVisible(true, readingPaneOnRight);
        if (sashesPresent) {
            var newSash = readingPaneOnRight ? this._vertSash : this._horizSash;
            var oldSash = readingPaneOnRight ? this._horizSash : this._vertSash;
            oldSash.setVisible(false);
            newSash.setVisible(true);
        }
	}

	mlv.reRenderListView();
    if (!noSet) {
	    mv.setReadingPane();
    }

	mv.noTab = !readingPaneEnabled || AjxEnv.isIE;
	var sz = this.getSize();
	this._resetSize(sz.x, sz.y, true);
};

ZmDoublePaneView.prototype.getMailListView =
function() {
	return this._mailListView;
};

ZmDoublePaneView.prototype.getItemView = 
function() {
	return this._itemView;
};

// back-compatibility
ZmDoublePaneView.prototype.getMsgView = ZmDoublePaneView.prototype.getItemView;

ZmDoublePaneView.prototype.getInviteMsgView =
function() {
	return this._itemView.getInviteMsgView();
};


ZmDoublePaneView.prototype.getSelectionCount = 
function() {
	return this._mailListView.getSelectionCount();
};

ZmDoublePaneView.prototype.getSelection = 
function() {
	return this._mailListView.getSelection();
};

ZmDoublePaneView.prototype.reset =
function() {
	this._mailListView.reset();
	this._itemView.reset();
};

ZmDoublePaneView.prototype.getItem =
function() {
	return this._itemView.getItem();
};

ZmDoublePaneView.prototype.setItem =
function(item, force, dontFocus) {
	this._itemView.set(item, force);
	//this._controller._checkKeepReading();
 };

ZmDoublePaneView.prototype.clearItem =
function() {
	this._itemView.set();
};

// TODO: see if we can remove these
ZmDoublePaneView.prototype.getMsg =
function() {
	return (this._controller.getCurrentViewType() == ZmId.VIEW_TRAD) ? this._itemView.getMsg() : null;
};

ZmDoublePaneView.prototype.setMsg =
function(msg) {
	this._itemView.set(msg);
	this._controller._restoreFocus();	// bug 47700
};

ZmDoublePaneView.prototype.addInviteReplyListener =
function (listener){
	this._itemView.addInviteReplyListener(listener);
};

ZmDoublePaneView.prototype.addShareListener =
function (listener){
	this._itemView.addShareListener(listener);
};

ZmDoublePaneView.prototype.addSubscribeListener =
function(listener) {
	this._itemView.addSubscribeListener(listener);
};


ZmDoublePaneView.prototype.resetMsg = 
function(newMsg) {
	this._itemView.resetMsg(newMsg);
};

ZmDoublePaneView.prototype.isReadingPaneVisible =
function() {
	return this._itemView.getVisible();
};

ZmDoublePaneView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._resetSize(width, height);
};

ZmDoublePaneView.prototype.setList =
function(list) {
	this._mailListView.set(list, ZmItem.F_DATE);
	this.isStale = false;
};

// Private / Protected methods

ZmDoublePaneView.prototype._initHeader = function() {};
ZmDoublePaneView.prototype._createMailListView = function(params) {};
ZmDoublePaneView.prototype._createMailItemView = function(params) {};

// create a sash for each of the two reading pane locations
ZmDoublePaneView.prototype._createSashes = function() {

    var params = {
        parent:     this,
        style:      DwtSash.HORIZONTAL_STYLE,
        className:  "AppSash-horiz",
        threshold:  ZmDoublePaneView.SASH_THRESHOLD,
        posStyle:   Dwt.ABSOLUTE_STYLE
    };

    this._vertSash = new DwtSash(params);
    this._vertSash.registerCallback(this._sashCallback, this);
    this._vertSash.addListener(DwtEvent.ONMOUSEUP, this._sashVertRelease.bind(this));

    params.style = DwtSash.VERTICAL_STYLE;
    params.className = "AppSash-vert";
    this._horizSash = new DwtSash(params);
    this._horizSash.registerCallback(this._sashCallback, this);
    this._horizSash.addListener(DwtEvent.ONMOUSEUP, this._sashHorizRelease.bind(this));
    this.addListener(DwtEvent.CONTROL, this._controlEventListener.bind(this));
};

ZmDoublePaneView.prototype._resetSize = 
function(newWidth, newHeight, force) {

	if (newWidth <= 0 || newHeight <= 0) { return; }
	if (!force && newWidth == this._lastResetWidth && newHeight == this._lastResetHeight) { return; }

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (this.isReadingPaneVisible()) {
		var sash = this.getSash();
		var sashSize = sash.getSize();
		var sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
		var itemViewMargins = this._itemView.getMargins();
		if (readingPaneOnRight) {
			var listViewWidth = this.getReadingSashPosition(true) || (Number(ZmMsg.LISTVIEW_WIDTH)) || Math.floor(newWidth / 2.5);
			this._mailListView.resetSize(listViewWidth, newHeight);
			sash.setLocation(listViewWidth, 0);
			this._itemView.setBounds(listViewWidth + sashThickness, 0,
									newWidth - (listViewWidth + sashThickness + itemViewMargins.left + itemViewMargins.right), newHeight);
		} else {
			var listViewHeight = this.getReadingSashPosition(false) || (Math.floor(newHeight / 2) - DwtListView.HEADERITEM_HEIGHT);
			this._mailListView.resetSize(newWidth, listViewHeight);
			sash.setLocation(0, listViewHeight);
			this._itemView.setBounds(0, listViewHeight + sashThickness, newWidth - itemViewMargins.left - itemViewMargins.right,
									newHeight - (listViewHeight + sashThickness));
		}
	} else {
		this._mailListView.resetSize(newWidth, newHeight);
	}
	this._mailListView._resetColWidth();

	this._lastResetWidth = newWidth;
	this._lastResetHeight = newHeight;
};

ZmDoublePaneView.prototype._sashCallback =
function(delta) {

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();
	var listView = this._mailListView;
	var itemView = this._itemView;
	//See bug 69593 for the reason for "true"
	var itemViewSize = itemView.getSize(true);
	var listViewSize = listView.getSize(true);

	var newListViewSize;
	var newItemViewBounds;

	var absDelta = Math.abs(delta);

	if (readingPaneOnRight) {
		var currentListViewWidth = AjxEnv.isIE ? this._vertSash.getLocation().x : listViewSize.x;
		var currentItemViewWidth = itemViewSize.x;
		delta = this._getLimitedDelta(delta, currentItemViewWidth, itemView.getMinWidth(), currentListViewWidth, ZmDoublePaneView.MIN_LISTVIEW_WIDTH);
		if (!delta) {
			return 0;
		}
		newListViewSize = {width: currentListViewWidth + delta, height: Dwt.DEFAULT};
		newItemViewBounds = {
			left: itemView.getLocation().x + delta,
			top: Dwt.DEFAULT,
			width: currentItemViewWidth - delta,
			height: Dwt.DEFAULT
		};
	}
	else {
		//reading pane on bottom
		var currentListViewHeight = AjxEnv.isIE ? this._horizSash.getLocation().y : listViewSize.y;
		var currentItemViewHeight = itemViewSize.y;
		delta = this._getLimitedDelta(delta, currentItemViewHeight, itemView.getMinHeight(), currentListViewHeight, this._getMinListViewHeight(listView));
		if (!delta) {
			return 0;
		}
		newListViewSize = {width: Dwt.DEFAULT, height: currentListViewHeight + delta};
		newItemViewBounds = {
			left: Dwt.DEFAULT,
			top: itemView.getLocation().y + delta,
			width: Dwt.DEFAULT,
			height: currentItemViewHeight - delta
		};
	}

	listView.resetSize(newListViewSize.width, newListViewSize.height);
	itemView.setBounds(newItemViewBounds.left, newItemViewBounds.top, newItemViewBounds.width, newItemViewBounds.height);

	listView._resetColWidth();
	if (readingPaneOnRight) {
		this._vertSashX = this._vertSash.getLocation().x + delta;
	}
	else {
		this._horizSashY = this._horizSash.getLocation().y + delta;
	}

	return delta;
};

/**
 * returns the delta after limiting it based on minimum view dimension (which is either width/height - this code doesn't care)
 *
 * @param delta
 * @param currentItemViewDimension
 * @param minItemViewDimension
 * @param currentListViewDimension
 * @param minListViewDimension
 * @returns {number}
 * @private
 */
ZmDoublePaneView.prototype._getLimitedDelta =
function(delta, currentItemViewDimension, minItemViewDimension, currentListViewDimension, minListViewDimension) {
	if (delta > 0) {
		// moving sash right or down
		return Math.max(0, Math.min(delta, currentItemViewDimension - minItemViewDimension));
	}
	// moving sash left or up
	var absDelta = Math.abs(delta);
	return -Math.max(0, Math.min(absDelta, currentListViewDimension - minListViewDimension));
};

ZmDoublePaneView.prototype._getMinListViewHeight =
function(listView) {
	if (this._minListViewHeight) {
		return this._minListViewHeight;
	}

	var list = listView.getList();
	if (!list || !list.size()) {
		return DwtListView.HEADERITEM_HEIGHT;
	}
	//only cache it if there's a list, to prevent a subtle bug of setting to just the header height if
	//user first views an empty list.
	var item = list.get(0);
	var div = document.getElementById(listView._getItemId(item));
	this._minListViewHeight = DwtListView.HEADERITEM_HEIGHT + Dwt.getSize(div).y * 2;
	return this._minListViewHeight;
};

ZmDoublePaneView.prototype._selectFirstItem =
function() {
	var list = this._mailListView.getList();
	var selectedItem = list ? list.get(0) : null;
	if (selectedItem) {
		this._mailListView.setSelection(selectedItem, false);
	}
};

ZmDoublePaneView.prototype.getSash =
function() {
	var readingPaneOnRight = this._controller.isReadingPaneOnRight();
	return readingPaneOnRight ? this._vertSash : this._horizSash;
};

ZmDoublePaneView.prototype.getLimit =
function(offset) {
	return this._mailListView.getLimit(offset);
};

ZmDoublePaneView.prototype._staleHandler =
function() {

	var search = this._controller._currentSearch;
	if (search) {
		search.lastId = search.lastSortVal = null;
		search.offset = search.limit = 0;
		var params = {isRefresh: true};
		var mlv = this._mailListView
		if (mlv.getSelectionCount() == 1) {
			var sel = mlv.getSelection();
			var selItem = sel && sel[0];
			var curItem = this.getItem();
			if (selItem && curItem && selItem.id == curItem.id) {
				params.selectedItem = selItem;
			}
		}
		appCtxt.getSearchController().redoSearch(search, false, params);
	}
};

ZmDoublePaneView.prototype.handleRemoveAttachment =
function(oldMsgId, newMsg) {
	this._itemView.handleRemoveAttachment(oldMsgId, newMsg);
};

/**
 * Returns the sash location (in pixels) based on reading pane preference.
 * 
 * @param {boolean}		readingPaneOnRight   true if reading pane is on the right
 */
ZmDoublePaneView.prototype.getReadingSashPosition =
function(readingPaneOnRight) {
	if (readingPaneOnRight) {
		if (!this._vertSashX) {
			var value = this._readingPaneSashVertPos || appCtxt.get(ZmSetting.READING_PANE_SASH_VERTICAL);
			var percentWidth = value / 100;
			var screenWidth = this.getSize().x;
			this._vertSashX = Math.round(percentWidth * screenWidth);
		}
		return this._vertSashX;
	}
	else {
		if (!this._horizSashY) {
			var value = this._readingPaneSashHorizPos || appCtxt.get(ZmSetting.READING_PANE_SASH_HORIZONTAL);
			var percentHeight = value / 100;
			var screenHeight = this.getSize().y;
			this._horizSashY = Math.round(percentHeight * screenHeight);
		}
		return this._horizSashY;
	}
};

/**
 * Sets the location of sash (in percentage) depending upon reading pane preference.
 * 
 * @param {boolean}		readingPaneOnRight	true if reading pane is on the right
 * @param {int}			value   			location of sash (in pixels)
 */
ZmDoublePaneView.prototype.setReadingSashPosition =
function(readingPaneOnRight, value) {
	if (readingPaneOnRight) {
		var screenWidth = this.getSize().x;
		var sashWidthPercent = Math.round((value / screenWidth) * 100);
		if (this._controller.isSearchResults) {
			this._readingPaneSashVertPos = sashWidthPercent;
		}
		else {
			appCtxt.set(ZmSetting.READING_PANE_SASH_VERTICAL, sashWidthPercent);
		}
	}
	else {
		var screenHeight = this.getSize().y;
		var sashHeightPercent = Math.round((value/screenHeight) * 100);
		if (this._controller.isSearchResults) {
			this._readingPaneSashHorizPos = sashHeightPercent;
		}
		else {
			appCtxt.set(ZmSetting.READING_PANE_SASH_HORIZONTAL, sashHeightPercent);
		}
	}
};

ZmDoublePaneView.prototype._sashVertRelease =
function() {
	this.setReadingSashPosition(true, this._vertSashX);
};

ZmDoublePaneView.prototype._sashHorizRelease =
function() {
	this.setReadingSashPosition(false, this._horizSashY);
};

ZmDoublePaneView.prototype._controlEventListener =
function(ev) {
	//resize can be called multiple times based on the browser so wait till resizing is complete
	if (ev && (ev.newWidth == ev.requestedWidth) && (ev.newHeight == ev.requestedHeight))  {
		var readingPaneOnRight = this._controller.isReadingPaneOnRight();
		//reset the sash values and resize the pane based on settings
		if (readingPaneOnRight) {
			this._readingPaneSashVertPos = appCtxt.get(ZmSetting.READING_PANE_SASH_VERTICAL);
			delete this._vertSashX;
		} else {
			this._readingPaneSashHorizPos = appCtxt.get(ZmSetting.READING_PANE_SASH_HORIZONTAL);
			delete this._horizSashY;
		}
		var sz = this.getSize();
		this._resetSize(sz.x, sz.y, true);
	}
};

