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
* Creates a new, empty personas controller.
* @constructor
* @class
* Manages the personas page.
*
* @author Dave Comfort
*
* @param appCtxt		[ZmAppCtxt]			the app context
* @param container		[DwtShell]			the shell
* @param prefsApp		[ZmPreferencesApp]	the preferences app
* @param prefsView		[ZmPreferencesView]	the preferences view
*/
function ZmPersonasController(appCtxt, container, prefsApp, prefsView) {
	ZmController.call(this, appCtxt, container, prefsApp);

	this._prefsView = prefsView;
	this._personasView = new ZmPersonasView(this._prefsView._parent, appCtxt, this);
};

ZmPersonasController.prototype = new ZmController();
ZmPersonasController.prototype.constructor = ZmPersonasController;

/**
* Returns the personas view.
*/
ZmPersonasController.prototype.getPersonasView =
function() {
	return this._personasView;
};

ZmPersonasController.prototype._setup =
function() {
	// Fill in the list view.	
	var listView = this._personasView.getPersonaListView();
	listView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
	listView.set(AjxVector.fromArray(ZmPersonaCollection.HACK.getPersonas()));
	
	// Set up the Add/remove buttons.
	var addButton = this._personasView.getAddButton();
	addButton.addSelectionListener(new AjxListener(this, this._addPersonaHandler));
	var removeButton = this._personasView.getRemoveButton();
	removeButton.addSelectionListener(new AjxListener(this, this._removePersonaHandler));
};

ZmPersonasController.prototype._addPersonaHandler =
function() {
	var persona = new ZmPersona("New Persona");
	var listView = this._personasView.getPersonaListView();
	listView.addItem(persona);
	listView.setSelection(persona);
};

ZmPersonasController.prototype._removePersonaHandler =
function() {
	var listView = this._personasView.getPersonaListView();
	var persona = listView.getSelection()[0];
	if (persona) {
		listView.removeItem(persona);
		listView.setSelection(ZmPersonaCollection.HACK.defaultPersona);
	}
};

/*
* Handles left-clicking on an item.
*
* @param	[DwtEvent]		the click event
*/
ZmPersonasController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		var listView = this._personasView.getPersonaListView();
		var selection = listView.getSelection()[0];
		this._personasView.showPersona(selection);
	}
};

