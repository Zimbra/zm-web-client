/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
	this._prefsView = prefsView;
	ZmController.call(this, container, prefsApp);
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
function(view) {
	var listControl = view.getList();
	listControl.addSelectionListener(new AjxListener(this, this._listSelectionListener, view));
	var listData = this._getListData();
	listControl.set(listData);
	if (listData.size()) {
		listControl.setSelection(listData.get(0));
	}
};

ZmVoicePrefsController.prototype._resetOperations =
function() {
	var toolbar = this._prefsView._controller._toolbar;
	toolbar.enable(ZmOperation.SAVE, true);
	toolbar.enable(ZmOperation.CANCEL, true);
};

ZmVoicePrefsController.prototype.checkPreCondition =
function(obj, precondition) {
	return ZmPrefController.prototype.checkPreCondition.call(this, obj, precondition);
}

/*
* Handles left-clicking on an item.
*
* @param	[DwtEvent]		the click event
*/
ZmVoicePrefsController.prototype._listSelectionListener =
function(listView, ev) {
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		var list = listView.getList();
		
		var selection = list.getSelection()[0];
		if (!listView.validate()) {
			var message = listView.getErrorMessage(true);
			appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
			
			list.setSelectedItems([listView._item]);
		} else {
			listView.setItem(selection);
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

