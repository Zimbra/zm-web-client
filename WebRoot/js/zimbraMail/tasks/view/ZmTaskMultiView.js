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

ZmTaskMultiView = function(params) {

	if (arguments.length == 0) { return; }

    params.className = params.className || "ZmTaskMultiView";
    params.mode = ZmId.VIEW_TASKMULTI;

	var view = params.controller._getViewType();
	params.id = ZmId.getViewId(view);
	DwtComposite.call(this, params);

	this._controller = params.controller;

    this._taskListView = this._createTaskListView(params);

	this._vertMsgSash = new DwtSash({parent:this, style:DwtSash.HORIZONTAL_STYLE, className:"AppSash-horiz",
									 threshold:ZmTaskMultiView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._vertMsgSash.registerCallback(this._sashCallback, this);

	this._horizMsgSash = new DwtSash({parent:this, style:DwtSash.VERTICAL_STYLE, className:"AppSash-vert",
									  threshold:ZmTaskMultiView.SASH_THRESHOLD, posStyle:Dwt.ABSOLUTE_STYLE});
	this._horizMsgSash.registerCallback(this._sashCallback, this);

	this._taskView = new ZmTaskView(this, DwtControl.ABSOLUTE_STYLE, this._controller);

	this.setReadingPane();
}

ZmTaskMultiView.prototype = new DwtComposite;
ZmTaskMultiView.prototype.constructor = ZmTaskMultiView;

ZmTaskMultiView.prototype.toString =
function() {
	return "ZmTaskMultiView";
};

// consts

ZmTaskMultiView.SASH_THRESHOLD = 5;
ZmTaskMultiView._TAG_IMG = "TI";

// public methods

ZmTaskMultiView.prototype.getController =
function() {
	return this._controller;
};

ZmTaskMultiView.prototype.getTitle =
function() {
	return this._taskListView.getTitle();
};

/**
 * Displays the reading pane, based on the current settings.
 */
ZmTaskMultiView.prototype.setReadingPane =
function() {

	var tlv = this._taskListView, tv = this._taskView;
	var readingPaneEnabled = this._controller.isReadingPaneOn();
	if (!readingPaneEnabled) {
		tv.setVisible(false);
		this._vertMsgSash.setVisible(false);
		this._horizMsgSash.setVisible(false);
	} else {
		if (!tv.getVisible()) {
			if (tlv.getSelectionCount() == 1) {
				this._controller._setSelectedItem();
			} else {
				tv.reset();
			}
		}
		tv.setVisible(true);
		var readingPaneOnRight = this._controller.isReadingPaneOnRight();
		var newSash = readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
		var oldSash = readingPaneOnRight ? this._horizMsgSash : this._vertMsgSash;
		oldSash.setVisible(false);
		newSash.setVisible(true);
	}

	tlv.reRenderListView();

	tv.noTab = !readingPaneEnabled || AjxEnv.isIE;
	var sz = this.getSize();
	this._resetSize(sz.x, sz.y, true);
};

ZmTaskMultiView.prototype._createTaskListView =
function(params) {
	params.parent = this;
	params.posStyle = Dwt.ABSOLUTE_STYLE;
	params.id = DwtId.getListViewId(this._controller._getViewType());
	return new ZmTaskListView(this, this._controller, this._controller._dropTgt );
};

ZmTaskMultiView.prototype.getTaskListView =
function() {
	return this._taskListView;
};

ZmTaskMultiView.prototype.getTaskView =
function() {
	return this._taskView;
};

ZmTaskMultiView.prototype.getSelectionCount =
function() {
	return this._taskListView.getSelectionCount();
};

ZmTaskMultiView.prototype.getSelection =
function() {
	return this._taskListView.getSelection();
};

ZmTaskMultiView.prototype.reset =
function() {
	this._taskListView.reset();
	this._taskView.reset();
};

ZmTaskMultiView.prototype.getTask =
function() {
	return this._taskView.getTask();
};

ZmTaskMultiView.prototype.setTask =
function(task) {
	this._taskView.set(task, ZmId.VIEW_TASK);
};

ZmTaskMultiView.prototype.resetTask =
function(newTask) {
	this._taskView.resetMsg(newTask);
};

ZmTaskMultiView.prototype.isTaskViewVisible =
function() {
	return this._taskView.getVisible();
};

ZmTaskMultiView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._resetSize(width, height);
};

ZmTaskMultiView.prototype._resetSize =
function(newWidth, newHeight, force) {


	if (newWidth <= 0 || newHeight <= 0) { return; }
	if (!force && newWidth == this._lastResetWidth && newHeight == this._lastResetHeight) { return; }

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (this.isTaskViewVisible()) {
		var sash = this.getSash();
		var sashSize = sash.getSize();
		var sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
		if (readingPaneOnRight) {
			var listViewWidth = this._vertSashX || (Number(ZmMsg.LISTVIEW_WIDTH)) || Math.floor(newWidth / 2.5);
			this._taskListView.resetSize(listViewWidth, newHeight);
			sash.setLocation(listViewWidth, 0);
			this._taskView.setBounds(listViewWidth + sashThickness, 0,
									newWidth - (listViewWidth + sashThickness), newHeight);
		} else {
			var listViewHeight = this._horizSashY || (Math.floor(newHeight / 2) - DwtListView.HEADERITEM_HEIGHT);
			this._taskListView.resetSize(newWidth, listViewHeight);
			sash.setLocation(0, listViewHeight);
			this._taskView.setBounds(0, listViewHeight + sashThickness, newWidth,
									newHeight - (listViewHeight + sashThickness));
		}
	} else {
		this._taskListView.resetSize(newWidth, newHeight);
	}
	this._taskListView._resetColWidth();

	this._lastResetWidth = newWidth;
	this._lastResetHeight = newHeight;
};

ZmTaskMultiView.prototype._sashCallback =
function(delta) {

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (delta > 0) {
		if (readingPaneOnRight) {
			// moving sash right
			var minMsgViewWidth = this._taskView.getMinWidth();
			var currentMsgWidth = this._taskView.getSize().x;
			delta = Math.max(0, Math.min(delta, currentMsgWidth - minMsgViewWidth));
			var newListWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._taskListView.getSize().x) + delta;

			if (delta > 0) {
				this._taskListView.resetSize(newListWidth, Dwt.DEFAULT);
				this._taskView.setBounds(this._taskView.getLocation().x + delta, Dwt.DEFAULT,
										currentMsgWidth - delta, Dwt.DEFAULT);
			} else {
				delta = 0;
			}
		} else {
			// moving sash down
			var newMsgViewHeight = this._taskView.getSize().y - delta;
			var minMsgViewHeight = this._taskView.getMinHeight();
			if (newMsgViewHeight > minMsgViewHeight) {
				this._taskListView.resetSize(Dwt.DEFAULT, this._taskListView.getSize().y + delta);
				this._taskView.setBounds(Dwt.DEFAULT, this._taskView.getLocation().y + delta,
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
				var firstHdr = this._taskListView._headerList[0];
				var hdrWidth = firstHdr._width;
				if (hdrWidth == "auto") {
					var header = document.getById(firstHdr._id);
					hdrWidth = header && Dwt.getSize(header).x;
				}
				this._minMLVWidth = hdrWidth;
			}

			var currentWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._taskListView.getSize().x);
			absDelta = Math.max(0, Math.min(absDelta, currentWidth - this._minMLVWidth));

			if (absDelta > 0) {
				delta = -absDelta;
				this._taskListView.resetSize(currentWidth - absDelta, Dwt.DEFAULT);
				this._taskView.setBounds(this._taskView.getLocation().x - absDelta, Dwt.DEFAULT,
										this._taskView.getSize().x + absDelta, Dwt.DEFAULT);
			} else {
				delta = 0;
			}
		} else {
			// moving sash up
			if (!this._minMLVHeight) {
				var list = this._taskListView.getList();
				if (list && list.size()) {
					var item = list.get(0);
					var div = document.getElementById(this._taskListView._getItemId(item));
					this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT + (Dwt.getSize(div).y * 2);
				} else {
					this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT;
				}
			}

			if (this.getSash().getLocation().y - absDelta > this._minMLVHeight) {
				// moving sash up
				this._taskListView.resetSize(Dwt.DEFAULT, this._taskListView.getSize().y - absDelta);
				this._taskView.setBounds(Dwt.DEFAULT, this._taskView.getLocation().y - absDelta,
										Dwt.DEFAULT, this._taskView.getSize().y + absDelta);
			} else {
				delta = 0;
			}
		}
	}

	if (delta) {
		this._taskListView._resetColWidth();
		if (readingPaneOnRight) {
			this._vertSashX = this._vertMsgSash.getLocation().x;
		} else {
			this._horizSashY = this._horizMsgSash.getLocation().y;
		}
	}

	return delta;
};

ZmTaskMultiView.prototype._selectFirstItem =
function() {
	var list = this._taskListView.getList();
	var selectedItem = list ? list.get(0) : null;
	if (selectedItem) {
		this._taskListView.setSelection(selectedItem, false);
	}
};

ZmTaskMultiView.prototype.getSash =
function() {
	var readingPaneOnRight = this._controller.isReadingPaneOnRight();
	return readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
};

ZmTaskMultiView.prototype.getLimit =
function(offset) {
	return this._taskListView.getLimit(offset);
};

ZmTaskMultiView.prototype._staleHandler =
function() {
	var search = this._controller._currentSearch;
	if (search) {
		search.lastId = search.lastSortVal = null
		search.offset = search.limit = 0;
		appCtxt.getSearchController().redoSearch(search);
	}
};

ZmTaskMultiView.prototype.set =
function(list, sortField) { 
	this._taskListView.set(list, sortField);
	this.isStale = false;
};
