/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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
 * Creates a new, voice prefs controller.
 * @constructor
 * @class
 * Manages the voice prefs page.
 *
 * @author Dave Comfort
 *
 * @param container		[DwtShell]			the shell
 * @param prefsApp		[ZmPreferencesApp]	the preferences app
 * @param prefsView		[ZmPreferencesView]	the preferences view
 */
ZmVoicePrefsController = function(container, prefsApp, prefsView) {
	ZmController.call(this, container, prefsApp);

	this._prefsView = prefsView;
	this._listView = new ZmVoicePrefsView(prefsView._parent, this);
    this._count = 0;
};

ZmVoicePrefsController.prototype = new ZmController();
ZmVoicePrefsController.prototype.constructor = ZmVoicePrefsController;

/**
* Returns the list view.
*/
ZmVoicePrefsController.prototype.getListView =
function() {
	return this._listView;
};

ZmVoicePrefsController.prototype.getPrefsView =
function() {
	return this._prefsView;
};

ZmVoicePrefsController.prototype._setup =
function() {
	var listControl = this._listView.getList();
	listControl.addSelectionListener(new AjxListener(this, this._listSelectionListener));
	var listData = this._getListData();
	listControl.set(listData);
	if (listData.size()) {
		listControl.setSelection(listData.get(0));
	}
};

/*
* Handles left-clicking on an item.
*
* @param	[DwtEvent]		the click event
*/
ZmVoicePrefsController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		var listView = this._listView.getList();
		var selection = listView.getSelection()[0];
		if (!this._listView.validate()) {
			var message = this._listView.getErrorMessage(true);
			appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
			listView.setSelectedItems([this._listView._item]);
		} else {
			this._listView.setItem(selection);
		}
	}
};

ZmVoicePrefsController.prototype._getListData =
function() {
	var result = new AjxVector();
	var app = appCtxt.getApp(ZmApp.VOICE);
	for (var i = 0, count = app.phones.length; i < count; i++) {
		result.add(app.phones[i]);
	}
	return result;
};

