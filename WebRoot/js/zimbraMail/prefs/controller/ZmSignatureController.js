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
* Creates a new, empty signature controller.
* @constructor
* @class
* Manages the signature page.
*
* @author Dave Comfort
*
* @param appCtxt		[ZmAppCtxt]			the app context
* @param container		[DwtShell]			the shell
* @param prefsApp		[ZmPreferencesApp]	the preferences app
* @param prefsView		[ZmPreferencesView]	the preferences view
*/
function ZmSignatureController(appCtxt, container, prefsApp, prefsView) {
	ZmPrefListController.call(this, appCtxt, container, prefsApp, prefsView);

	this._listView = new ZmSignatureView(prefsView._parent, appCtxt, this);
};

ZmSignatureController.prototype = new ZmPrefListController();
ZmSignatureController.prototype.constructor = ZmSignatureController;

ZmSignatureController.prototype._setup =
function() {
	ZmPrefListController.prototype._setup.call(this);
	var signatureCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getSignatureCollection();
	this._listView.getList().setSelection(signatureCollection.defaultSignature);
};

ZmSignatureController.prototype._addHandler =
function() {
	var signature = new ZmSignature("New Signature");
	var listView = this.getListView().getList();
	listView.addItem(signature);
	listView.setSelection(signature);
};

ZmSignatureController.prototype._removeHandler =
function() {
	var listView = this.getListView().getList();
	var signature = listView.getSelection()[0];
	if (signature) {
		listView.removeItem(signature);
		var signatureCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getSignatureCollection();
		listView.setSelection(signatureCollection.defaultSignature);
	}
};

ZmSignatureController.prototype._getListData =
function() {
	var signatureCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getSignatureCollection();
	return AjxVector.fromArray(signatureCollection.getSignatures())
};


