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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
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
* @param appCtxt		[ZmAppCtxt]			the app context
* @param container		[DwtShell]			the shell
* @param prefsApp		[ZmPreferencesApp]	the preferences app
* @param prefsView		[ZmPreferencesView]	the preferences view
*/
ZmVoicePrefsController = function(appCtxt, container, prefsApp, prefsView) {
	ZmPrefListController.call(this, appCtxt, container, prefsApp, prefsView);

	this._listView = new ZmVoicePrefsView(prefsView._parent, appCtxt, this);
    this._count = 0;
};

ZmVoicePrefsController.prototype = new ZmPrefListController();
ZmVoicePrefsController.prototype.constructor = ZmVoicePrefsController;

ZmVoicePrefsController.prototype._setup =
function() {
	ZmPrefListController.prototype._setup.call(this);
	
	this._listView.getAddButton().setVisible(false);
	this._listView.getRemoveButton().setVisible(false);

	var listControl = this._listView.getList();
	var list = listControl.getList();
	if (list.size()) {
		listControl.setSelection(list.get(0));
	}
};

ZmVoicePrefsController.prototype._getListData =
function() {
	var result = new AjxVector();
	var app = this._appCtxt.getApp(ZmApp.VOICE);
	for (var i = 0, count = app.phones.length; i < count; i++) {
		result.add(app.phones[i]);
	}
	return result;
};

