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

	// create a sash for each of the two reading pane locations
	this._vertSash = new DwtSash({parent:this, style:DwtSash.HORIZONTAL_STYLE, className:"AppSash-horiz",
								  threshold:ZmDoublePaneView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._vertSash.registerCallback(this._sashCallback, this);
	this._vertSash.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._sashVertRelease));
	this._horizSash = new DwtSash({parent:this, style:DwtSash.VERTICAL_STYLE, className:"AppSash-vert",
								   threshold:ZmDoublePaneView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._horizSash.registerCallback(this._sashCallback, this);
	this._horizSash.addListener(DwtEvent.ONMOUSEUP, new AjxListener(this, this._sashHorizRelease));

	this.setReadingPane();
};

ZmDoublePaneView.prototype = new DwtComposite;
ZmDoublePaneView.prototype.constructor = ZmDoublePaneView;

ZmDoublePaneView.prototype.isZmDoublePaneView = true;
ZmDoublePaneView.prototype.toString = function() { return "ZmDoublePaneView"; };

// consts

ZmDoublePaneView.SASH_THRESHOLD = 5;
ZmDoublePaneView.MIN_LISTVIEW_WIDTH = 20;

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
function() {

	var mlv = this._mailListView, mv = this._itemView;
	var readingPaneEnabled = this._controller.isReadingPaneOn();
	if (!readingPaneEnabled) {
		mv.setVisible(false);
		this._vertSash.setVisible(false);
		this._horizSash.setVisible(false);
	} else {
		if (!mv.getVisible()) {
			if (mlv.getSelectionCount() == 1) {
				this._controller._setSelectedItem();
			} else {
				mv.reset();
			}
		}
		mv.setVisible(true);
		var readingPaneOnRight = this._controller.isReadingPaneOnRight();
		var newSash = readingPaneOnRight ? this._vertSash : this._horizSash;
		var oldSash = readingPaneOnRight ? this._horizSash : this._vertSash;
		oldSash.setVisible(false);
		newSash.setVisible(true);
	}

	mlv.reRenderListView();
	mv.setReadingPane();

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
	if (!dontFocus) {
		this._controller._restoreFocus();	// bug 47700
	}
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

ZmDoublePaneView.prototype._resetSize = 
function(newWidth, newHeight, force) {

	if (newWidth <= 0 || newHeight <= 0) { return; }
	if (!force && newWidth == this._lastResetWidth && newHeight == this._lastResetHeight) { return; }

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (this.isReadingPaneVisible()) {
		var sash = this.getSash();
		var sashSize = sash.getSize();
		var sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
		if (readingPaneOnRight) {
			var listViewWidth = this.getReadingSashPosition(true) || (Number(ZmMsg.LISTVIEW_WIDTH)) || Math.floor(newWidth / 2.5);
			this._mailListView.resetSize(listViewWidth, newHeight);
			sash.setLocation(listViewWidth, 0);
			this._itemView.setBounds(listViewWidth + sashThickness, 0,
									newWidth - (listViewWidth + sashThickness), newHeight);
		} else {
			var listViewHeight = this.getReadingSashPosition(false) || (Math.floor(newHeight / 2) - DwtListView.HEADERITEM_HEIGHT);
			this._mailListView.resetSize(newWidth, listViewHeight);
			sash.setLocation(0, listViewHeight);
			this._itemView.setBounds(0, listViewHeight + sashThickness, newWidth,
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

	if (delta > 0) {
		if (readingPaneOnRight) {
			// moving sash right
			var minMsgViewWidth = this._itemView.getMinWidth();
			var currentMsgWidth = this._itemView.getSize().x;
			delta = Math.max(0, Math.min(delta, currentMsgWidth - minMsgViewWidth));
			var newListWidth = ((AjxEnv.isIE) ? this._vertSash.getLocation().x : this._mailListView.getSize().x) + delta;

			if (delta > 0) {
				this._mailListView.resetSize(newListWidth, Dwt.DEFAULT);
				this._itemView.setBounds(this._itemView.getLocation().x + delta, Dwt.DEFAULT,
										currentMsgWidth - delta, Dwt.DEFAULT);
			} else {
				delta = 0;
			}
		} else {
			// moving sash down
			var newMsgViewHeight = this._itemView.getSize().y - delta;
			var minMsgViewHeight = this._itemView.getMinHeight();
			if (newMsgViewHeight > minMsgViewHeight) {
				this._mailListView.resetSize(Dwt.DEFAULT, this._mailListView.getSize().y + delta);
				this._itemView.setBounds(Dwt.DEFAULT, this._itemView.getLocation().y + delta,
										Dwt.DEFAULT, newMsgViewHeight);
			} else {
				delta = 0;
			}
		}
	} else {
		var absDelta = Math.abs(delta);

		if (readingPaneOnRight) {
			// moving sash left
			var currentWidth = ((AjxEnv.isIE) ? this._vertSash.getLocation().x : this._mailListView.getSize().x);
			absDelta = Math.max(0, Math.min(absDelta, currentWidth - ZmDoublePaneView.MIN_LISTVIEW_WIDTH));

			if (absDelta > 0) {
				delta = -absDelta;
				this._mailListView.resetSize(currentWidth - absDelta, Dwt.DEFAULT);
				this._itemView.setBounds(this._itemView.getLocation().x - absDelta, Dwt.DEFAULT,
										this._itemView.getSize().x + absDelta, Dwt.DEFAULT);
			} else {
				delta = 0;
			}
		} else {
			// moving sash up
			if (!this._minMLVHeight) {
				var list = this._mailListView.getList();
				if (list && list.size()) {
					var item = list.get(0);
					var div = document.getElementById(this._mailListView._getItemId(item));
					this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT + (Dwt.getSize(div).y * 2);
				} else {
					this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT;
				}
			}

			if (this.getSash().getLocation().y - absDelta > this._minMLVHeight) {
				// moving sash up
				this._mailListView.resetSize(Dwt.DEFAULT, this._mailListView.getSize().y - absDelta);
				this._itemView.setBounds(Dwt.DEFAULT, this._itemView.getLocation().y - absDelta,
										Dwt.DEFAULT, this._itemView.getSize().y + absDelta);
			} else {
				delta = 0;
			}
		}
	}

	if (delta) {
		this._mailListView._resetColWidth();
		if (readingPaneOnRight) {
			this._vertSashX = this._vertSash.getLocation().x + delta;
		} else {
			this._horizSashY = this._horizSash.getLocation().y + delta;
		}
	}

	return delta;
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
		search.lastId = search.lastSortVal = null
		search.offset = search.limit = 0;
		appCtxt.getSearchController().redoSearch(search);
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
