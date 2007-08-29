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
 * Portions created by Zimbra are Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Navigation toolbar for the client. This toolbar is affected by every 
* push/pop of a view and must be context sensitive since it can custom apply 
* to any view. A new class was created since nav toolbar may be expanded in 
* the future (i.e. to incl. a text input indicating current page, etc)
*
* @param parent			parent DwtControl for this toolbar
* @param posStyle		CSS style position (absolute, static, relative)
* @param className 		CSS class name this toolbar should respect
* @param arrowStyle		single arrows, double arrows, or both
* @param hasText		true if this toolbar includes text in the middle
*/

ZmNavToolBar = function(parent, posStyle, className, arrowStyle, hasText) {

	className = className || "ZmNavToolBar";
	var buttons = this._getButtons(arrowStyle, hasText);
	var params = {parent:parent, buttons:buttons, posStyle:posStyle, className:className};
	ZmButtonToolBar.call(this, params);
	if (hasText) {
		this._textButton = this.getButton(ZmOperation.TEXT);
	}
};

ZmNavToolBar.SINGLE_ARROWS	= 1;
ZmNavToolBar.DOUBLE_ARROWS	= 2;
ZmNavToolBar.ALL_ARROWS		= 3;

ZmNavToolBar.prototype = new ZmButtonToolBar;
ZmNavToolBar.prototype.constructor = ZmNavToolBar;

ZmNavToolBar.prototype.toString = 
function() {
	return "ZmNavToolBar";
};

/**
* Enables/disables buttons.
*
* @param ids		a list of button IDs
* @param enabled	whether to enable the buttons
*/
ZmNavToolBar.prototype.enable =
function(ids, enabled) {
	ZmButtonToolBar.prototype.enable.call(this, ids, enabled);

	// 	also kill the tooltips if buttons are disabled
	if (!enabled) {
		if (!(ids instanceof Array))
			ids = [ids];
		for (var i = 0; i < ids.length; i++) {
			var button = this.getButton(ids[i]);
			if (button)
				button.setToolTipContent(null);
		}
	}
};

ZmNavToolBar.prototype.setToolTip = 
function(buttonId, tooltip) {
	var button = this.getButton(buttonId);
	if (button)
		button.setToolTipContent(tooltip);
};

ZmNavToolBar.prototype.setText =
function(text) {
	if (!this._textButton) return;
	this._textButton.setText(text);
};

ZmNavToolBar.prototype._getButtons = 
function(arrowStyle, hasText) {
	var buttons = new Array();
	this.hasSingleArrows = (arrowStyle == ZmNavToolBar.SINGLE_ARROWS || arrowStyle == ZmNavToolBar.ALL_ARROWS);
	this.hasDoubleArrows = (arrowStyle == ZmNavToolBar.DOUBLE_ARROWS || arrowStyle == ZmNavToolBar.ALL_ARROWS);
	if (this.hasDoubleArrows) buttons.push(ZmOperation.PAGE_DBL_BACK);
	if (this.hasSingleArrows) buttons.push(ZmOperation.PAGE_BACK);
	if (hasText) buttons.push(ZmOperation.TEXT);
	if (this.hasSingleArrows) buttons.push(ZmOperation.PAGE_FORWARD);
	if (this.hasDoubleArrows) buttons.push(ZmOperation.PAGE_DBL_FORW);

	return buttons;
};

ZmNavToolBar.prototype.createOp =
function(id, params) {
	params.className = this._buttonStyle;
	var b = (id == ZmOperation.TEXT)
		? (new DwtText(this, "ZWidgetTitle ZmNavToolBarTitle"))
		: this.createButton(id, params);
	b.setData(ZmOperation.KEY_ID, id);

	return b;
};
