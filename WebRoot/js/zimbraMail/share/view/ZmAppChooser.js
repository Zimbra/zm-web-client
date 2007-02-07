/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmAppChooser(parent, className, buttons, useTabs) {

	className = className || "ZmAppChooser";
	var tbStyle = useTabs ? DwtToolBar.HORIZ_STYLE : DwtToolBar.VERT_STYLE;
	var width = skin.hints && skin.hints.app_chooser.fullWidth ? "100%" : null;

	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE, null, null, width, tbStyle);

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
};

ZmAppChooser.SPACER								= "spacer";
ZmAppChooser.B_HELP								= "Help";
ZmAppChooser.B_LOGOUT							= "Logout";

ZmApp.CHOOSER_SORT[ZmAppChooser.SPACER]			= 160;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_HELP]			= 170;
ZmApp.CHOOSER_SORT[ZmAppChooser.B_LOGOUT]		= 190;

ZmAppChooser.OUTER								= "outer";
ZmAppChooser.OUTER_ACT							= "outer_act";
ZmAppChooser.OUTER_TRIG							= "outer_trig";

ZmAppChooser.IMAGE = {};
ZmAppChooser.IMAGE[ZmAppChooser.OUTER]			= "ImgAppChiclet";
ZmAppChooser.IMAGE[ZmAppChooser.OUTER_ACT]		= "ImgAppChicletHover";
ZmAppChooser.IMAGE[ZmAppChooser.OUTER_TRIG]		= "ImgAppChicletSel";

// hard code help/logout since they arent real "apps"
ZmApp.ICON[ZmAppChooser.B_HELP]					= "Help";
ZmApp.ICON[ZmAppChooser.B_LOGOUT]				= "Logoff";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_HELP]		= "goToHelp";
ZmApp.CHOOSER_TOOLTIP[ZmAppChooser.B_LOGOUT]	= "logOff";

ZmAppChooser.SPACER_HEIGHT = 10;

ZmAppChooser.prototype = new DwtToolBar;
ZmAppChooser.prototype.constructor = ZmAppChooser;

ZmAppChooser.prototype.toString = 
function() {
	return "ZmAppChooser";
};

ZmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
};

ZmAppChooser.prototype.setSelected =
function(id) {
	if (this._selectedId && this._buttons[this._selectedId])
		this._buttons[this._selectedId].setSelected(false);

	if (this._buttons[id])
		this._buttons[id].setSelected(true);

	this._selectedId = id;
};

ZmAppChooser.prototype._createButton =
function(id, tbStyle, isLast) {
	var text = (tbStyle == DwtToolBar.HORIZ_STYLE) ? ZmMsg[ZmApp.NAME[id]] : null;
	var b = new ZmChicletButton(this, ZmAppChooser.IMAGE[ZmAppChooser.OUTER], ZmApp.ICON[id], text, isLast);
	b.setActivatedImage(ZmAppChooser.IMAGE[ZmAppChooser.OUTER_ACT]);
	b.setTriggeredImage(ZmAppChooser.IMAGE[ZmAppChooser.OUTER_TRIG]);
	b.setToolTipContent(ZmMsg[ZmApp.CHOOSER_TOOLTIP[id]]);
	b.setData(Dwt.KEY_ID, id);
	this._buttons[id] = b;
};
