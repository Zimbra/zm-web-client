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
* Creates a new, empty pref list controller.
* @constructor
* @class
* Abstract class that manages pages that show lists of preferences, 
* such as identities, signatures, and accounts.
*
* @author Dave Comfort
*
* @param appCtxt		[ZmAppCtxt]			the app context
* @param container		[DwtShell]			the shell
* @param prefsApp		[ZmPreferencesApp]	the preferences app
* @param prefsView		[ZmPreferencesView]	the preferences view
* 
* Abstract methods:
* _addHandler() handles click on Add button
* _removeHandler()
* 
*/
function ZmPrefListController(appCtxt, container, prefsApp, prefsView) {
	if (arguments.length == 0) return;

	ZmController.call(this, appCtxt, container, prefsApp);

	this._prefsView = prefsView;
	this._listView = null; // subclass contructor needs to create this.
};

ZmPrefListController.prototype = new ZmController();
ZmPrefListController.prototype.constructor = ZmPrefListController;

/**
* Returns the list view.
*/
ZmPrefListController.prototype.getListView =
function() {
	return this._listView;
};

ZmPrefListController.prototype.getPrefsView =
function() {
	return this._prefsView;
};

ZmPrefListController.prototype._setup =
function() {
	// Fill in the list view.	
	var listView = this._listView.getList();
	listView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
	listView.set(this._getListData());
	
	// Set up the Add/remove buttons.
	var addButton = this._listView.getAddButton();
	addButton.addSelectionListener(new AjxListener(this, this._addHandler));
	var removeButton = this._listView.getRemoveButton();
	removeButton.addSelectionListener(new AjxListener(this, this._removeHandler));
};

/*
* Handles left-clicking on an item.
*
* @param	[DwtEvent]		the click event
*/
ZmPrefListController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		var listView = this._listView.getList();
		var selection = listView.getSelection()[0];
		this._listView.validate();
		this._listView.setItem(selection);
	}
};

