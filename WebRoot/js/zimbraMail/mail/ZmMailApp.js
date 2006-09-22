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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmMailApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmZimbraMail.MAIL_APP, appCtxt, container, parentController);
};

ZmMailApp.prototype = new ZmApp;
ZmMailApp.prototype.constructor = ZmMailApp;

ZmMailApp.prototype.toString = 
function() {
	return "ZmMailApp";
};

ZmMailApp.prototype.launch =
function(callback, errorCallback, checkQS) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, callback);
	var query = null;
	if (checkQS) {
		if (location && (location.search.match(/\bview=compose\b/))) {
			var cc = this.getComposeController();
			var match = location.search.match(/\bsubject=([^&]+)/);
			var subject = match ? decodeURIComponent(match[1]) : null;
			match = location.search.match(/\bto=([^&]+)/);
			var to = match ? decodeURIComponent(match[1]) : null;
			match = location.search.match(/\bbody=([^&]+)/);
			var body = match ? decodeURIComponent(match[1]) : null;
			cc.doAction(ZmOperation.NEW_MESSAGE, false, null, to, subject, body, respCallback);
			return;
		} else if (location.search && (location.search.match(/\bview=msg\b/))) {
			var match = location.search.match(/\bid=(\d+)/);
			var id = match ? match[1] : null;
			if (id) {
				query = ["item:", id].join("");
			}
		}
	}
	query = query ? query : this._appCtxt.get(ZmSetting.INITIAL_SEARCH);
	var types = new AjxVector();
	types.add(this._appCtxt.getSettings().getGroupMailBy());
	
	var params = {query: query, callback: respCallback, errorCallback: errorCallback, types:types};
	this._appCtxt.getSearchController().search(params);
};

ZmMailApp.prototype._handleResponseLaunch =
function(callback) {
	callback.run();
};

ZmMailApp.prototype.getAttachmentListController =
function() {
	if (!this._attachmentListController) {
		this._attachmentListController = new ZmAttachmentListController(this._appCtxt, this._container, this);
	}
	return this._attachmentListController;
};

ZmMailApp.prototype.getConvListController =
function() {
	if (!this._convListController) {
		this._convListController = new ZmConvListController(this._appCtxt, this._container, this);
	}
	return this._convListController;
};

ZmMailApp.prototype.getConvController =
function() {
	if (!this._convController) {
		this._convController = new ZmConvController(this._appCtxt, this._container, this);
	}
	return this._convController;
};

ZmMailApp.prototype.getTradController = 
function() {
	if (!this._tradController) {
		this._tradController = new ZmTradController(this._appCtxt, this._container, this);
	}
	return this._tradController;
};

ZmMailApp.prototype.getMsgController = 
function() {
	if (!this._msgController) {
		this._msgController = new ZmMsgController(this._appCtxt, this._container, this);
	}
	return this._msgController;
};

ZmMailApp.prototype.getComposeController =
function() {
	if (!this._composeController) {
		this._composeController = new ZmComposeController(this._appCtxt, this._container, this);
	}
	return this._composeController;
};

ZmMailApp.prototype.getMailListController =
function() {
	var groupMailBy = this._appCtxt.get(ZmSetting.GROUP_MAIL_BY);
	return (groupMailBy == ZmSetting.GROUP_BY_CONV) ? this.getConvListController() :
													  this.getTradController();
};
