/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
function ZmIdentityController(appCtxt, container, prefsApp, prefsView) {
	ZmPrefListController.call(this, appCtxt, container, prefsApp, prefsView);

	this._listView = new ZmIdentityView(prefsView._parent, appCtxt, this);
    this._count = 0;
};

ZmIdentityController.prototype = new ZmPrefListController();
ZmIdentityController.prototype.constructor = ZmIdentityController;

ZmIdentityController.prototype._setup =
function() {
	ZmPrefListController.prototype._setup.call(this);
	var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
	this._listView.getList().setSelection(identityCollection.defaultIdentity);
	
	if (!this._appCtxt.get(ZmSetting.IDENTITIES_ENABLED)) {
		this._listView.getAddButton().setVisible(false);
		this._listView.getRemoveButton().setVisible(false);
	}
};

ZmIdentityController.prototype._addHandler =
function() {
    var count = ++this._count;
    var name = AjxMessageFormat.format(ZmMsg.newIdentity, count);
	var identity = new ZmIdentity(this._appCtxt, name);
	identity.useDefaultAdvanced = true;
	identity.setAllDefaultAdvancedFields();
	var listView = this.getListView();
	listView.addNew(identity);
	var list = listView.getList();
	list.addItem(identity);
	list.setSelection(identity);
	listView.validate();
};

ZmIdentityController.prototype._removeHandler =
function() {
	var listView = this.getListView();
	var list = listView.getList();
	var identity = list.getSelection()[0];
	if (identity) {
		var identityCollection = this._appCtxt.getIdentityCollection();
		list.setSelection(identityCollection.defaultIdentity);
		listView.remove(identity);
		list.removeItem(identity);
	}
};

ZmIdentityController.prototype._getListData =
function() {
	var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
	var result = new AjxVector();
	var identities = identityCollection.getIdentities(true);
	for (var i = 0, count = identities.length; i < count; i++) {
		var proxy = AjxUtil.createProxy(identities[i]);
		result.add(proxy);
	}
	return result;
};

