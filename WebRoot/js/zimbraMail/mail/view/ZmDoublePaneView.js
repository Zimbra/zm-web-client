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

	var view = params.controller._getViewType();
	params.id = ZmId.getViewId(view);
	DwtComposite.call(this, params);

	this._controller = params.controller;
	this._initHeader();
	params.className = null;
	params.id = DwtId.getListViewId(view);
	this._mailListView = this._createMailListView(params);

	this._vertMsgSash = new DwtSash({parent:this, style:DwtSash.HORIZONTAL_STYLE, className:"AppSash-horiz",
									 threshold:ZmDoublePaneView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._vertMsgSash.registerCallback(this._sashCallback, this);

	this._horizMsgSash = new DwtSash({parent:this, style:DwtSash.VERTICAL_STYLE, className:"AppSash-vert",
									  threshold:ZmDoublePaneView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._horizMsgSash.registerCallback(this._sashCallback, this);

	params.parent = this;
	params.className = null;
	params.id = ZmId.getViewId(ZmId.VIEW_MSG, null, view);
	this._msgView = new ZmMailMsgView(params);

	if (view == ZmId.VIEW_CONVLIST || view == ZmId.VIEW_TRAD) {
		this.setReadingPane();
	}
};

ZmDoublePaneView.prototype = new DwtComposite;
ZmDoublePaneView.prototype.constructor = ZmDoublePaneView;

ZmDoublePaneView.prototype.toString = 
function() {
	return "ZmDoublePaneView";
};

// consts

ZmDoublePaneView.SASH_THRESHOLD = 5;
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

	var readingPaneEnabled = this._controller.isReadingPaneOn();
	if (!readingPaneEnabled) {
		this._msgView.setVisible(false);
		this._vertMsgSash.setVisible(false);
		this._horizMsgSash.setVisible(false);
	} else {
		if (!this._msgView.getVisible()) {
			if (this._mailListView.getSelectionCount() == 1) {
				this._controller._setSelectedItem();
			} else {
				this._msgView.reset();
			}
		}
		this._msgView.setVisible(true);
		var readingPaneOnRight = this._controller.isReadingPaneOnRight();
		var newSash = readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
		var oldSash = readingPaneOnRight ? this._horizMsgSash : this._vertMsgSash;
		oldSash.setVisible(false);
		newSash.setVisible(true);
	}

	this._mailListView.reRenderListView();
	if (!this._mailListView._isPageless || this._mailListView.offset == 0) {
		this._mailListView.scrollToTop();
	}
	this._msgView.noTab = !readingPaneEnabled || AjxEnv.isIE;
	var sz = this.getSize();
	this._resetSize(sz.x, sz.y, true);
};

ZmDoublePaneView.prototype._createMailListView =
function(params) {
	params.parent = this;
	params.posStyle = Dwt.ABSOLUTE_STYLE;
	params.id = DwtId.getListViewId(this._controller._getViewType());
	return new ZmMailMsgListView(params);
};

ZmDoublePaneView.prototype.getMailListView =
function() {
	return this._mailListView;
};

ZmDoublePaneView.prototype.getMsgView = 
function() {
	return this._msgView;
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
	this._msgView.reset();
};

ZmDoublePaneView.prototype.getMsg =
function() {
	return this._msgView.getMsg();
};

ZmDoublePaneView.prototype.setMsg =
function(msg) {
	this._msgView.set(msg);
};

ZmDoublePaneView.prototype.addInviteReplyListener =
function (listener){
	this._msgView.addInviteReplyListener(listener);
};

ZmDoublePaneView.prototype.addShareListener =
function (listener){
	this._msgView.addShareListener(listener);
};

ZmDoublePaneView.prototype.resetMsg = 
function(newMsg) {
	this._msgView.resetMsg(newMsg);
};

ZmDoublePaneView.prototype.isMsgViewVisible =
function() {
	return this._msgView.getVisible();
};

ZmDoublePaneView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._resetSize(width, height);
};

ZmDoublePaneView.prototype.setItem =
function(items) {

	var paginating = Boolean(this._mailListView._itemsToAdd);
	this._mailListView.set(items, ZmItem.F_DATE);

	var gotItems = (this._controller._list && this._controller._list.size() > 0);
	if (this._mailListView._isPageless) {
		if (gotItems && !paginating) {
			this._msgView.set();
		}
	} else {
		 if (this._controller.isReadingPaneOn()) {
			 this._msgView.set();
		 } else {
			 this._selectFirstItem();
		 }
	}
};

// Private / Protected methods

ZmDoublePaneView.prototype._initHeader = 
function() {
	// overload me if you want a header
	return this;
};

ZmDoublePaneView.prototype._resetSize = 
function(newWidth, newHeight, force) {


	if (newWidth <= 0 || newHeight <= 0) { return; }
	if (!force && newWidth == this._lastResetWidth && newHeight == this._lastResetHeight) { return; }

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (this.isMsgViewVisible()) {
		var sash = this.getSash();
		var sashSize = sash.getSize();
		var sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
		if (readingPaneOnRight) {
			var listViewWidth = this._vertSashX || Math.floor(newWidth / 2.5);
			this._mailListView.resetSize(listViewWidth, newHeight);
			sash.setLocation(listViewWidth, 0);
			this._msgView.setBounds(listViewWidth + sashThickness, 0,
									newWidth - (listViewWidth + sashThickness), newHeight);
		} else {
			var listViewHeight = this._horizSashY || (Math.floor(newHeight / 2) - DwtListView.HEADERITEM_HEIGHT);
			this._mailListView.resetSize(newWidth, listViewHeight);
			sash.setLocation(0, listViewHeight);
			this._msgView.setBounds(0, listViewHeight + sashThickness, newWidth,
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
			var minMsgViewWidth = this._msgView.getMinWidth();
			var currentMsgWidth = this._msgView.getSize().x;
			delta = Math.max(0, Math.min(delta, currentMsgWidth - minMsgViewWidth));
			var newListWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._mailListView.getSize().x) + delta;

			if (delta > 0) {
				this._mailListView.resetSize(newListWidth, Dwt.DEFAULT);
				this._msgView.setBounds(this._msgView.getLocation().x + delta, Dwt.DEFAULT,
										currentMsgWidth - delta, Dwt.DEFAULT);
			} else {
				delta = 0;
			}
		} else {
			// moving sash down
			var newMsgViewHeight = this._msgView.getSize().y - delta;
			var minMsgViewHeight = this._msgView.getMinHeight();
			if (newMsgViewHeight > minMsgViewHeight) {
				this._mailListView.resetSize(Dwt.DEFAULT, this._mailListView.getSize().y + delta);
				this._msgView.setBounds(Dwt.DEFAULT, this._msgView.getLocation().y + delta,
										Dwt.DEFAULT, newMsgViewHeight);
			} else {
				delta = 0;
			}
		}
	} else {
		var absDelta = Math.abs(delta);

		if (readingPaneOnRight) {
			// moving sash left
			if (!this._minMLVWidth) {
				var firstHdr = this._mailListView._headerList[0];
				var hdrWidth = firstHdr._width;
				if (hdrWidth == "auto") {
					var header = document.getById(firstHdr._id);
					hdrWidth = header && Dwt.getSize(header).x;
				}
				this._minMLVWidth = hdrWidth;
			}

			var currentWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._mailListView.getSize().x);
			absDelta = Math.max(0, Math.min(absDelta, currentWidth - this._minMLVWidth));

			if (absDelta > 0) {
				delta = -absDelta;
				this._mailListView.resetSize(currentWidth - absDelta, Dwt.DEFAULT);
				this._msgView.setBounds(this._msgView.getLocation().x - absDelta, Dwt.DEFAULT,
										this._msgView.getSize().x + absDelta, Dwt.DEFAULT);
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
				this._msgView.setBounds(Dwt.DEFAULT, this._msgView.getLocation().y - absDelta,
										Dwt.DEFAULT, this._msgView.getSize().y + absDelta);
			} else {
				delta = 0;
			}
		}
	}

	if (delta) {
		this._mailListView._resetColWidth();
		if (readingPaneOnRight) {
			this._vertSashX = this._vertMsgSash.getLocation().x;
		} else {
			this._horizSashY = this._horizMsgSash.getLocation().y;
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
	return readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
};

ZmDoublePaneView.prototype.getLimit =
function(offset) {
	return this._mailListView.getLimit(offset);
};
