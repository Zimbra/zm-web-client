/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmTaskbar = function(params) {
	ZmToolBar.call(this, params);

	ZmTaskbar.INSTANCE = this;

	this._setMouseEvents();
	this.shell.addControlListener(new AjxListener(this, this._shellControlListener));
};

ZmTaskbar.prototype = new ZmToolBar;
ZmTaskbar.prototype.constructor = ZmTaskbar;

ZmTaskbar.prototype.toString =
function() {
	return "ZmTaskbar";
};

/**
 * Overrides the DwtControl method by increasing the z-index for this control, making
 * the popups appear on top of the app view.
 */
ZmTaskbar.prototype.zShow =
function(show) {
	this.setZIndex(show ? Dwt.Z_VIEW + 10 : Dwt.Z_HIDDEN); 
};

/** Expands or collapses the item */
ZmTaskbar.prototype.expandItem =
function(item, expand, background) {
	if (expand && this.expandedItem) {
		this.expandedItem._expand(false);
	}
	item._expand(expand, background);
	this.expandedItem = expand ? item : null;
};

/** Expands or collapses the item */
ZmTaskbar.prototype.toggleExpanded =
function(item) {
	this.expandItem(item, !item.expanded);
};

/**
 * If there isn't already an expanded item, then the given item is expanded.
 * Otherwise the item is not expanded, and is put in its alert state so the user
 * knows to expand it.
 */
ZmTaskbar.prototype.conditionalExpand =
function(item) {
	if (!this.expandedItem) {
		this.expandItem(item, true, true);
		return true;
	} else {
		return false;
	}
};

ZmTaskbar.prototype._shellControlListener =
function(ev) {
	if ((ev.oldWidth != ev.newWidth) && this.expandedItem ) {
		this.expandedItem.positionContent();
	}
};

/**
 * ZmTaskbarItem represents an item on the taskbar with a button and a place for popup content.
 *
 * @param params				[hash]			hash of params:
 *        op					[String]		Id of operation that sets the button text and image
 * 		  buttonConstructor		[function]		Constructor for the button
 *        selectionListener		[AjxListener]	Listener that handles button presses
 *        contentClassName		[String]		Name of the class that holds the content (Subclass of ZmTaskbarPopup)
 *        rightAlign			[Boolean]		True to align the popup with the right of the button
 *        data					[Object]		Arbitrary data passed to popup object when it's created
 */
ZmTaskbarItem = function(params) {
	DwtComposite.call(this, params);
	this._createHtml();
	this._contentClassName = params.contentClassName;

	var buttonArgs = {
		style: DwtButton.TOGGLE_STYLE,
		parent: this,
		parentElement: this._buttonEl
	};
	var ctor = params.buttonConstructor || DwtToolBarButton;
	this.button = new ctor(buttonArgs);
	this.button.addSelectionListener(params.selectionListener);
	if (params.op) {
		this.button.setText(ZmMsg[ZmOperation.getProp(params.op, "textKey")]);
		this.button.setImage(ZmOperation.getProp(params.op, "image"));
		this.button.setToolTipContent(ZmMsg[ZmOperation.getProp(params.op, "tooltipKey")]);
	}
	this._rightAlign = params.rightAlign;
	this._data = params.data;
};

ZmTaskbarItem.prototype = new DwtComposite;
ZmTaskbarItem.prototype.constructor = ZmTaskbarItem;

ZmTaskbarItem.prototype.TEMPLATE = "share.App#ZmTaskbarItem";

ZmTaskbarItem.prototype.toString =
function() {
	return "ZmTaskbarItem";
};

ZmTaskbarItem.prototype.getPopup =
function() {
	if (!this._popup) {
		AjxDispatcher.require([ "IMCore", "IM" ]);
		var args = {
			parent: this,
			parentElement: this._contentEl,
			taskbarItem: this,
			taskbar: this.parent,
			data: this._data
		};
		var ctor = window.eval(this._contentClassName);
		this._popup = new ctor(args);
	}
	return this._popup;
};

ZmTaskbarItem.prototype._expand =
function(expand, background) {
	this.expanded = expand;
	Dwt.setVisible(this._contentEl, expand);
	this.button.setSelected(expand);
	var popup = this.getPopup();
	if (expand) {
		this.showAlert(false);
		popup.popup(background);
		this.positionContent();
	} else {
		popup.popdown();
	}
};

ZmTaskbarItem.prototype.positionContent =
function() {
	if (this._rightAlign) {
		var x = Dwt.toWindow(this.button.getHtmlElement(), 0, 0).x;
		var width = this.button.getW();
		var taskbarBounds = this.parent.getBounds();
		var fudge = 1; // Couldn't figure out what makes this necessary.
		this._contentEl.style.right = taskbarBounds.x + taskbarBounds.width - x - width - fudge;
	}
};

ZmTaskbarItem.prototype._createHtml = function() {
    var data = { id: this._htmlElId };
    this._createHtmlFromTemplate(this.TEMPLATE, data);
	this._contentEl = document.getElementById(data.id + "_content");
	this._buttonEl = document.getElementById(data.id + "_button");
};


