/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmZimbraImService = function() {
	ZmImService.call(this);
}

ZmZimbraImService.prototype = new ZmImService;
ZmZimbraImService.prototype.constructor = ZmZimbraImService;

// Public methods

ZmZimbraImService.prototype.toString =
function() {
	return "ZmZimbraImService";
};

ZmZimbraImService.prototype.getGateways =
function(callback, params) {
	var soapDoc = AjxSoapDoc.create("IMGatewayListRequest", "urn:zimbraIM");
	var responseCallback = new AjxCallback(this, this._handleResponseGetGateways, [callback]);
	return this._send(params, soapDoc, responseCallback);
};

ZmZimbraImService.prototype._handleResponseGetGateways =
function(callback, response) {
	var responseJson = this._getResponseJson(response);
	var gateways = responseJson.IMGatewayListResponse.service;
	gateways = gateways || [];
	gateways.unshift({ type   : "XMPP", domain : "XMPP" });
	if (callback) {
		callback.run(gateways);
	}
	return gateways;
};

ZmZimbraImService.prototype.getRoster =
function(callback, params) {
	var soapDoc = AjxSoapDoc.create("IMGetRosterRequest", "urn:zimbraIM");
	var responseCallback = new AjxCallback(this, this._handleResponseGetRoster, [callback]);
	return this._send(params, soapDoc, responseCallback);
};

ZmZimbraImService.prototype._handleResponseGetRoster =
function(callback, response) {
	var responseJson = this._getResponseJson(response);
	var roster = responseJson ? responseJson.IMGetRosterResponse : null;
	if (callback) {
		callback.run(roster);
	}
	return roster;
};

ZmZimbraImService.prototype.createRosterItem =
function(addr, name, groups, params) {
	var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("addr", addr);
	if (name) {
		method.setAttribute("name", name);
	}
	if (groups) {
		method.setAttribute("groups", groups);
	}
	method.setAttribute("op", "add");
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("addr", rosterItem.id);
	method.setAttribute("op", "remove");
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	var soapDoc = AjxSoapDoc.create("IMSendMessageRequest", "urn:zimbraIM");
	var message = soapDoc.set("message");
	if (typing) {
		soapDoc.set("typing", null, message);
	}
	var thread = chat.getThread();
	if (thread)
		message.setAttribute("thread", thread);
	message.setAttribute("addr", chat.getRosterItem(0).getAddress());
    if (text || html) {
        var bodyNode = soapDoc.set("body", null, message);
        if (text) {
            soapDoc.set("text", text, bodyNode);
        }
        if (html) {
            soapDoc.set("html", html, bodyNode);
        }
    }
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype.closeChat =
function(chat, params) {
	var soapDoc = AjxSoapDoc.create("IMModifyChatRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("thread", chat.getThread());
	method.setAttribute("op", "close");
	return this._send(params, soapDoc);
};

ZmZimbraImService.prototype._send =
function(params, soapDoc, callback) {
	params = params || { };
	if (!params.hasOwnProperty("asyncMode")) {
		params.asyncMode = true;
	}
	params.soapDoc = soapDoc;
	params.callback = callback;
	var response = appCtxt.getAppController().sendRequest(params);
	if (!params.asyncMode && callback) {
		return callback.run(response);
	} else {
		return null;
	}
};

ZmZimbraImService.prototype._getResponseJson =
function(response) {
	return response.getResponse ? response.getResponse() : response;
};