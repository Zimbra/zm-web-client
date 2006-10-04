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
* Creates a new, empty identities controller.
* @constructor
* @class
* Manages the identities page.
*
* @author Dave Comfort
*
* @param appCtxt		[ZmAppCtxt]			the app context
* @param container		[DwtShell]			the shell
* @param prefsApp		[ZmPreferencesApp]	the preferences app
* @param prefsView		[ZmPreferencesView]	the preferences view
*/
function ZmIdentitiesController(appCtxt, container, prefsApp, prefsView) {
	ZmPrefListController.call(this, appCtxt, container, prefsApp, prefsView);

	this._listView = new ZmIdentitiesView(prefsView._parent, appCtxt, this);
};

ZmIdentitiesController.prototype = new ZmPrefListController();
ZmIdentitiesController.prototype.constructor = ZmIdentitiesController;

ZmIdentitiesController.prototype._setup =
function() {
	ZmPrefListController.prototype._setup.call(this);
	this._listView.getList().setSelection(ZmIdentityCollection.HACK.defaultIdentity);
};

ZmIdentitiesController.prototype._addHandler =
function() {
	var identity = new ZmIdentity("New Identity");
	var listView = this.getListView().getList();
	listView.addItem(identity);
	listView.setSelection(identity);
};

ZmIdentitiesController.prototype._removeHandler =
function() {
	var listView = this.getListView().getList();
	var identity = listView.getSelection()[0];
	if (identity) {
		listView.removeItem(identity);
		listView.setSelection(ZmIdentityCollection.HACK.defaultIdentity);
	}
};

ZmPrefListController.prototype._getListData =
function() {
	return AjxVector.fromArray(ZmIdentityCollection.HACK.getIdentities())
};


