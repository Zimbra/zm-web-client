/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmTaskbar = function(params) {
	ZmToolBar.call(this, params);

	ZmTaskbar.INSTANCE = this;

	this._tabGroup = new DwtTabGroup(this._htmlElId);
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
function(item, expand) {
	if (expand && this.expandedItem) {
		this.expandedItem._expand(false);
	}
	item._expand(expand);
	this.expandedItem = expand ? item : null;
};

/**
 * If there isn't already an expanded item, then the given item is expanded.
 * Otherwise the item is not expanded, and is put in its alert state so the user
 * knows to expand it.
 */
ZmTaskbar.prototype.conditionalExpand =
function(item) {
	if (!this.expandedItem) {
		this.expandItem(item, true);
		return true;
	} else {
		return false;
	}
};

ZmTaskbar.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
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
 *        contentCallback		[AjxCallback]	A callback that creates the popup content
 *        contentClassName		[String]		Name of the class that holds the content (Subclass of ZmTaskbarContent)
 *        rightAlign			[Boolean]		True to align the popup with the right of the button
 *        data					[Object]		Arbitrary data passed to popup object when it's created
 */
ZmTaskbarItem = function(params) {
	DwtComposite.call(this, params);
	this._createHtml();
	this._contentCallback = params.contentCalback;
	this._contentClassName = params.contentClassName;
	this._tabGroup = new DwtTabGroup(this._htmlElId);
	this.parent.getTabGroupMember().addMember(this._tabGroup);

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
		if (this._contentClassName) {
			var ctor = window.eval(this._contentClassName);
			this._popup = new ctor(args);
		} else {
			args.callback = this._contentCallback;
			this._popup = new ZmTaskbarPopup1(args);
		}
	}
	return this._popup;
};

ZmTaskbarItem.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

ZmTaskbarItem.prototype._expand =
function(expand) {
	this.expanded = expand;
	Dwt.setVisible(this._contentEl, expand);
	this.button.setSelected(expand);
	var popup = this.getPopup();
	var member = popup.getTabGroupMember();
	if (expand) {
		this.showAlert(false);
		popup.popup();
		this.positionContent();
		if (member) {
			this._tabGroup.addMember(member);
		}
	} else if (this._popup) {
		if (member) {
			this._tabGroup.removeMember(member);
		}
		popup.popdown();
	}
};

ZmTaskbarItem.prototype.positionContent =
function() {
	if (this._rightAlign) {
		var x = Dwt.toWindow(this.button.getHtmlElement(), 0, 0).x;
		var width = this.button.getW();
		var windowWidth = this.shell.getSize().x;
		var fudge = 6; // Couldn't figure out what makes this necessary.
		this._contentEl.style.right = windowWidth - x - width - fudge;
	}
};

ZmTaskbarItem.prototype._createHtml = function() {
    var data = { id: this._htmlElId };
    this._createHtmlFromTemplate(this.TEMPLATE, data);
	this._contentEl = document.getElementById(data.id + "_content");
	this._buttonEl = document.getElementById(data.id + "_button");
};


