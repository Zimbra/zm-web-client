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

/**
 * This toolbar sits above the overview and represents the current app. It has a
 * label that tells the user what the current app is, and an optional View
 * button/menu for switching views within the current app.
 * @class
 */
ZmCurrentAppToolBar = function(parent) {

	DwtToolBar.call(this, parent, null, Dwt.ABSOLUTE_STYLE);

	this._newFolderBtn = new DwtToolBarButton({parent:this});
	this._newFolderBtn.setVisible(false);
	this._newFolderBtn.addSelectionListener(new AjxListener(this, this._newFolderListener));
};

ZmCurrentAppToolBar.prototype = new DwtToolBar;
ZmCurrentAppToolBar.prototype.constructor = ZmCurrentAppToolBar;


// Consts

ZmCurrentAppToolBar.NEW_FOLDER_BUTTON	= {};
ZmCurrentAppToolBar.NEW_FOLDER_ICON		= {};
ZmCurrentAppToolBar.NEW_FOLDER_LABEL	= {};
ZmCurrentAppToolBar.NEW_FOLDER_TOOLTIP 	= {};
ZmCurrentAppToolBar.NEW_FOLDER_OPERATION= {};
ZmCurrentAppToolBar.NEW_FOLDER_ORGANIZER= {};
ZmCurrentAppToolBar.NEW_FOLDER_CALLBACK = {};


// Public methods

ZmCurrentAppToolBar.prototype.toString =
function() {
	return "ZmCurrentAppToolBar";
};

ZmCurrentAppToolBar.registerApp =
function(appName, op, org, callback) {
	ZmCurrentAppToolBar.NEW_FOLDER_BUTTON[appName]		= true;
	ZmCurrentAppToolBar.NEW_FOLDER_ICON[appName]		= ZmOperation.getProp(op, "image");
	ZmCurrentAppToolBar.NEW_FOLDER_LABEL[appName]		= ZmOperation.getProp(op, "textKey");
	ZmCurrentAppToolBar.NEW_FOLDER_TOOLTIP[appName]		= ZmOperation.getProp(op, "tooltipKey");
	ZmCurrentAppToolBar.NEW_FOLDER_OPERATION[appName]	= op;
	ZmCurrentAppToolBar.NEW_FOLDER_ORGANIZER[appName]	= org;
	ZmCurrentAppToolBar.NEW_FOLDER_CALLBACK[appName]	= callback;
};

ZmCurrentAppToolBar.prototype.setupView =
function(appName) {
	if (ZmCurrentAppToolBar.NEW_FOLDER_BUTTON[appName]) {
		this._newFolderBtn.setVisible(true);

		this._newFolderBtn.setImage(ZmCurrentAppToolBar.NEW_FOLDER_ICON[appName]);

		var textKey = ZmCurrentAppToolBar.NEW_FOLDER_LABEL[appName];
		this._newFolderBtn.setText(ZmMsg[textKey]);

		var tooltipKey = ZmCurrentAppToolBar.NEW_FOLDER_TOOLTIP[appName];
		this._newFolderBtn.setToolTipContent(ZmMsg[tooltipKey]);
	} else {
		this._newFolderBtn.setVisible(false);
	}
	this._currentApp = appName;
};

ZmCurrentAppToolBar.prototype._newFolderListener =
function(ev) {
	
	var org = ZmCurrentAppToolBar.NEW_FOLDER_ORGANIZER[this._currentApp];
	var callback = false;
	
	if (org) {
		var op = ZmCurrentAppToolBar.NEW_FOLDER_OPERATION[this._currentApp];
		var tc = appCtxt.getOverviewController().getTreeController(org);
		callback = new AjxListener(tc, tc._newListener, op);
	}else{
		callback = ZmCurrentAppToolBar.NEW_FOLDER_CALLBACK[this._currentApp];
	}
	
	if (callback) { callback.run(ev); }
};
