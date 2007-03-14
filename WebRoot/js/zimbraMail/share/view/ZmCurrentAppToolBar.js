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

/**
* This toolbar sits above the overview and represents the current app. It has a
* label that tells the user what the current app is, and an optional View
* button/menu for switching views within the current app.
* @class
*/
function ZmCurrentAppToolBar(parent, tabStyle) {

	DwtToolBar.call(this, parent, null, Dwt.ABSOLUTE_STYLE);

	if (!tabStyle) {
		this._currentAppLabel = new DwtLabel(this, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "currentAppLabel");
		this.addFiller();
	} else {
		// XXX: hack for bug 13833 - we should redo steel skin so it uses this ID as well
		var appLabel = document.getElementById("skin_current_app_label");
		if (appLabel) {
			this._currentAppLabel = new DwtLabel(this, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "currentAppLabel");
			this._currentAppLabel.reparentHtmlElement("skin_current_app_label");
		}
		this._viewLabel = new DwtLabel(this, DwtLabel.ALIGN_RIGHT, "viewLabel");
		this._viewLabel.setText(ZmMsg.view + ":");
	}

	this._viewButton = new DwtButton(this, null, "DwtToolbarButton");
	if (this._currentAppLabel) {
		this._viewButton.setText(ZmMsg.view);
		this._viewButton.setToolTipContent(ZmMsg.view);
	} else {
		this._viewButton.setSize("100%");
	}
	this._viewButton.setEnabled(true);
	this._viewButton.setVisible(false);
	this._viewButton.noMenuBar = true;

	this._viewIcon = {};
	this._viewTooltip = {};
	this._viewMenu = {};
	this._subView = {};
	this._callback = {};
};

ZmCurrentAppToolBar.prototype = new DwtToolBar;
ZmCurrentAppToolBar.prototype.constructor = ZmCurrentAppToolBar;

ZmCurrentAppToolBar.prototype.toString = 
function() {
	return "ZmCurrentAppToolBar";
};

ZmCurrentAppToolBar.prototype.setCurrentApp = 
function(appName) {
	if (this._currentAppLabel) {
		this._currentAppLabel.setText(ZmMsg[ZmApp.NAME[appName]]);
		this._currentAppLabel.setImage(ZmApp.ICON[appName]);
	}
};

ZmCurrentAppToolBar.prototype.getViewButton = 
function() {
	return this._viewButton;
};

ZmCurrentAppToolBar.prototype.setViewTooltip = 
function(view, tooltip) {
	this._viewTooltip[view] = tooltip;
};

ZmCurrentAppToolBar.prototype.getViewMenu =
function(view) {
	return this._viewMenu[view];
};

ZmCurrentAppToolBar.prototype.setViewMenu = 
function(view, menu) {
	this._viewMenu[view] = menu;
};

/**
 * Associates a sub-view with a view. The name of the sub-view
 * will be used to retrieve the correct menu item in showViewMenu().
 * 
 * @param view		[constant]		a view ID
 * @param subView	[constant]		a view ID
 */
ZmCurrentAppToolBar.prototype.setSubView =
function(view, subView) {
	this._subView[view] = subView;
};

/**
 * Associates a callback with a view. The callback is used to
 * set the icon/text on the view button.
 * 
 * @param view		[constant]		a view ID
 * @param callback	[AjxCallback]	a callback
 */
ZmCurrentAppToolBar.prototype.setCallback =
function(view, callback) {
	this._callback[view] = callback;
};

ZmCurrentAppToolBar.prototype.showViewMenu = 
function(view) {
	this._curView = view;
	var viewMenu = this._viewMenu[view];
	if (viewMenu) {
		this._viewButton.setVisible(true);
		this._viewButton.setToolTipContent(this._viewTooltip[view]);
		this._viewButton.setMenu(viewMenu, false, DwtMenuItem.RADIO_STYLE);
		if (this._callback[view]) {
			this._callback[view].run();
		} else {
			var id = this._subView[view] || view;
			var mi = viewMenu.getItemById(ZmOperation.MENUITEM_ID, id);
			if (mi) {
				var icon = mi.getImage();
				if (icon) {
					this._viewButton.setImage(icon);
				}
				if (this._viewLabel) {
					this._viewButton.setText(mi.getText());
				}
				mi.setChecked(true, true);
			}
		}
	} else {
		this._viewButton.setVisible(false);
	}
	if (this._viewLabel) {
		this._viewLabel.setVisible(viewMenu != null);
	}
};
