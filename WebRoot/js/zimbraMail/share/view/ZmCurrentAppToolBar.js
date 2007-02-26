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
		// HACK - expand out the parent table and shrink first child so view
		// button can be as wide as possible
		this._table.width = "100%";
		this._table.rows[0].cells[0].width = "1%";
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
		this._currentAppLabel.setText(ZmMsg[ZmZimbraMail.MSG_KEY[appName]]);
		this._currentAppLabel.setImage(ZmZimbraMail.APP_ICON[appName]);
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
	this.showViewMenu(view);
};

ZmCurrentAppToolBar.prototype.showViewMenu = 
function(view, viewId) {
	var viewMenu = this._viewMenu[view];
	if (viewMenu) {
		this._viewButton.setVisible(true);
		this._viewButton.setToolTipContent(this._viewTooltip[view]);
		this._viewButton.setMenu(viewMenu, false, DwtMenuItem.RADIO_STYLE);
		var mi = viewMenu.getItemById(ZmOperation.MENUITEM_ID, (viewId || view));
		var icon = mi ? mi.getImage() : null;
		if (icon) this._viewButton.setImage(icon);
		if (mi && this._viewLabel) this._viewButton.setText(mi.getText());
	} else {
		this._viewButton.setVisible(false);
	}

	if (this._viewLabel)
		this._viewLabel.setVisible(viewMenu != null);
};
