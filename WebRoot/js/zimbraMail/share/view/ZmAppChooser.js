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

ZmAppChooser = function(parent, className, buttons, id) {

	className = className || "ZmAppChooser";
	var width = appCtxt.get(ZmSetting.SKIN_HINTS, "appChooser.fullWidth") ? "100%" : null;

	DwtToolBar.call(this, {parent:parent, className:className, posStyle:Dwt.ABSOLUTE_STYLE,
						   width:width, style:DwtToolBar.HORIZ_STYLE, id:id});
    Dwt.setLocation(this.getHtmlElement(), Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);

	this.setScrollStyle(Dwt.CLIP);

	this._buttons = {};
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) {
			this.addSpacer(ZmAppChooser.SPACER_HEIGHT);
		} else {
			this._createButton(id, i == buttons.length - 1);
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
	var oldBtn = this._buttons[this._selectedId];
	if (this._selectedId && oldBtn) {
        this.__markPrevNext(this._selectedId, false);
		oldBtn.setSelected(false);
    }

	var newBtn = this._buttons[id];
	if (newBtn) {
		newBtn.setSelected(true);

		if (newBtn._toggleText != null && newBtn._toggleText != "") {
			// hide text for previously selected button first
			if (oldBtn) {
				oldBtn._toggleText = (oldBtn._toggleText != null && oldBtn._toggleText != "")
					? oldBtn._toggleText : oldBtn.getText();
				oldBtn.setText("");
			}

			// reset original text for  newly selected button
			newBtn.setText(newBtn._toggleText);
			newBtn._toggleText = null;
		}
	}

	this._selectedId = id;
};

ZmAppChooser.prototype.autoAdjustWidth =
function(refElement) {
	var el = this.getHtmlElement();
	if (!el || !refElement) { return; }

	var offset1 = refElement.offsetWidth;
	var offset2 = el.firstChild ? el.firstChild.offsetWidth : offset1;

	if ((offset1 > 0 && offset2 > offset1)) {
		for (var i in this._buttons) {
			var b = this._buttons[i];
			if (!b || (b && (!b.getImage() || !b.getVisible()))) { continue; }

			if (offset2 > offset1) {
				b._toggleText = (b._toggleText != null && b._toggleText != "")
					? b._toggleText : b.getText();
				b.setText("");
			}
		}
	}
};

ZmAppChooser.prototype._createButton =
function(id, isLast) {
	var text = ZmMsg[ZmApp.NAME[id]];
    var outerClass = null;
    var buttonId = ZmId.getButtonId(ZmId.APP, id);
    var b = new ZmChicletButton(this, outerClass, ZmApp.ICON[id], text, isLast, buttonId);
	var tooltip = ZmMsg[ZmApp.CHOOSER_TOOLTIP[id]];
	var sc = appCtxt._getShortcutHint(null, ZmApp.GOTO_ACTION_CODE[id]);
	b.setToolTipContent(sc ?  [tooltip, sc].join("") : tooltip);
	b.setData(Dwt.KEY_ID, id);
	this._buttons[id] = b;
};
