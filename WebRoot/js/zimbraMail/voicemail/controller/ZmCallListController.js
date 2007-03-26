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

function ZmCallListController(appCtxt, container, app) {
	if (arguments.length == 0) return;
	
	ZmVoiceListController.call(this, appCtxt, container, app);

	this._listeners[ZmOperation.VIEW_BY_DATE] = new AjxListener(this, this._callByDateListener);
}

ZmCallListController.prototype = new ZmVoiceListController;
ZmCallListController.prototype.constructor = ZmCallListController;

ZmCallListController.prototype.toString =
function() {
	return "ZmCallListController";
};

ZmCallListController.prototype._defaultView =
function() {
	return ZmController.CALLLIST_VIEW;
};

ZmCallListController.prototype._createNewView = 
function(view) {
	return new ZmCallListView(this._container, this);
};

ZmCallListController.prototype._getToolBarOps =
function() {
	var list = [];
	list.push(ZmOperation.VIEW_BY_DATE);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.PRINT);
	return list;
};

ZmCallListController.prototype._getActionMenuOps =
function() {
	return null;
};

ZmCallListController.prototype._initializeToolBar =
function(view) {
	ZmVoiceListController.prototype._initializeToolBar.call(this, view);
};

ZmCallListController.prototype._resetOperations = 
function(parent, num) {
	ZmVoiceListController.prototype._resetOperations.call(this, parent, num);
	if (parent) {
		parent.enableAll(true);
	}
};

ZmCallListController.prototype._callByDateListener = 
function(ev) {
//	alert('Grrrrrr');
};

