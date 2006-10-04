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
	ZmPrefListController.call(this, appCtxt, container, prefsApp, prefsView);

	this._listView = new ZmPersonasView(prefsView._parent, appCtxt, this);
};

ZmPersonasController.prototype = new ZmPrefListController();
ZmPersonasController.prototype.constructor = ZmPersonasController;

ZmPersonasController.prototype._setup =
function() {
	ZmPrefListController.prototype._setup.call(this);
	this._listView.getList().setSelection(ZmPersonaCollection.HACK.defaultPersona);
};

ZmPersonasController.prototype._addHandler =
function() {
	var persona = new ZmPersona("New Persona");
	var listView = this.getListView().getList();
	listView.addItem(persona);
	listView.setSelection(persona);
};

ZmPersonasController.prototype._removeHandler =
function() {
	var listView = this.getListView().getList();
	var persona = listView.getSelection()[0];
	if (persona) {
		listView.removeItem(persona);
		listView.setSelection(ZmPersonaCollection.HACK.defaultPersona);
	}
};

ZmPrefListController.prototype._getListData =
function() {
	return AjxVector.fromArray(ZmPersonaCollection.HACK.getPersonas())
};


