/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

ZmAppChooser = function(parent, className, buttons, useTabs) {

	className = className || "ZmAppChooser";
	var tbStyle = useTabs ? DwtToolBar.HORIZ_STYLE : DwtToolBar.VERT_STYLE;
	var width = appCtxt.get(ZmSetting.SKIN_HINTS, "appChooser.fullWidth") ? "100%" : null;

	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE, null, null, width, tbStyle);
    Dwt.setLocation(this.getHtmlElement(), Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);

	this.setScrollStyle(Dwt.CLIP);

	this._buttons = {};
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) {
			this.addSpacer(ZmAppChooser.SPACER_HEIGHT);
		} else {
			this._createButton(id, tbStyle, i == buttons.length - 1);
		}
	}
}

ZmAppChooser.prototype = new DwtToolBar;
ZmAppChooser.prototype.constructor = ZmAppChooser;

ZmAppChooser.prototype.toString =
function() {
	return "ZmAppChooser";
};

//
// Constants
//

ZmAppChooser.SPACER								= "spacer";
ZmAppChooser.B_HELP								= "Help";
ZmAppChooser.B_LOGOUT							= "Logout";

ZmApp.CHOOSER_SORT[ZmAppChooser.SPACER]			= 160;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_HELP]			= 170;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_LOGOUT]		= 190;

// hard code help/logout since they arent real "apps"
ZmApp.ICON[ZmAppChooser.B_HELP]					= "Help";
ZmApp.ICON[ZmAppChooser.B_LOGOUT]				= "Logoff";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_HELP]		= "goToHelp";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_LOGOUT]	= "logOff";

ZmAppChooser.SPACER_HEIGHT = 10;

//
// Data
//

ZmAppChooser.prototype.TEMPLATE = "share.Widgets#ZmAppChooser";
ZmAppChooser.prototype.ITEM_TEMPLATE = "share.Widgets#ZmAppChooserItem";
ZmAppChooser.prototype.SPACER_TEMPLATE = "dwt.Widgets#ZmAppChooserSpacer";

//
// Public methods
//

ZmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
};

ZmAppChooser.prototype.setSelected =
function(id) {
	if (this._selectedId && this._buttons[this._selectedId]) {
        this.__markPrevNext(this._selectedId, false);
		this._buttons[this._selectedId].setSelected(false);
    }

    if (this._buttons[id]) {
		this._buttons[id].setSelected(true);
        this.__markPrevNext(id, true);
    }

    this._selectedId = id;
};

ZmAppChooser.prototype._createButton =
function(id, tbStyle, isLast) {
	var text = ZmMsg[ZmApp.NAME[id]];
    var outerClass = null;
    var b = new ZmChicletButton(this, outerClass, ZmApp.ICON[id], text, isLast);
	b.setToolTipContent(ZmMsg[ZmApp.CHOOSER_TOOLTIP[id]]);
	b.setData(Dwt.KEY_ID, id);
	this._buttons[id] = b;
};
