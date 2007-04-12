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

/**
* Creates a phone.
* @constructor
* @class
* This class represents a phone.
*
*/
function ZmPhone(appCtxt) {
	this._appCtxt = appCtxt;
	this.name = null; // The internal representation of the phone.
	this.used = null; // Amount of quota used.
	this.limit = null; // Quota size.
}

ZmPhone.prototype.toString = 
function() {
	return "ZmPhone";
}

ZmPhone.calculateDisplay =
function(name) {
	if (name.length == 10) {
		var array = [
			"(",
			name.substring(0, 3),
			") ",
			name.substring(3, 6),
			"-",
			name.substring(6, 10)
		];
		return array.join("");
	} else {
// TODO: How to handle other numbers????	
		return name;
	}
};

ZmPhone.calculateName =
function(display) {
	var match = display.match(/\d+/g);
	return match ? match.join("") : "";
};

ZmPhone.prototype.getDisplay = 
function() {
	if (!this._display) {
		this._display = ZmPhone.calculateDisplay(this.name);
	}
	return this._display;
};

ZmPhone.prototype._loadFromDom = 
function(node) {
	this.name =  node.name;
	if (node.used && node.used.length) this.used =  node.used[0]._content;
	if (this.limit && this.limit.length) this.limit = node.limit[0]._content;
};

/////////////////////////////////////////////////////
// Make a subclass for this stuff?
/////////////////////////////////////////////////////

ZmPhone.prototype.getCallFeatures = 
function(callback) {
	if (this._features) {
		if (callback) {
			callback.run(this._features);
		}
	} else {
	    var soapDoc = AjxSoapDoc.create("GetVoiceFeaturesRequest", "urn:zimbraVoice");
	    var node = soapDoc.set("phone");
	    node.setAttribute("name", this.name);
	    var respCallback = new AjxCallback(this, this._handleResponseGetVoiceFeatures, callback);
	    var params = {
	    	soapDoc: soapDoc, 
	    	asyncMode: true,
			callback: respCallback
		};
		this._appCtxt.getAppController().sendRequest(params);
	}
};

ZmPhone.prototype._handleResponseGetVoiceFeatures = 
function(callback, response) {
	var features = response._data.GetVoiceFeaturesResponse.phone[0];
	this._features = {};
	for(var i in features) {
		if (i == ZmCallFeature.VOICEMAIL_PREFS) {
// TODO: deal with this...
//			var voicemailPrefs = features[i][0].pref;
//			this._loadVoicemailPrefs(voicemailPrefs);
		} else {
			this._features[i] = new ZmCallFeature(this._appCtxt, i);
			this._features[i]._loadFromDom(features[i][0]);
		}
	}
	if (callback) {
		callback.run(this._features);
	}
};

ZmPhone.prototype._loadVoicemailPrefs = 
function(voicemailPrefs) {
	this._voicemailPrefs = {};
	for(var i = 0, count = voicemailPrefs.length; i < count; i++) {
		var pref = voicemailPrefs[i]
		this._voicemailPrefs[pref.name] = new ZmCallFeature(this._appCtxt, pref.name);
		this._features[i]._loadFromDom(features[i][0]);
	}
};

ZmPhone.prototype.modifyCallFeatures = 
function(batchCommand, newFeatures, callback) {
    var soapDoc = AjxSoapDoc.create("ModifyVoiceFeaturesRequest", "urn:zimbraVoice");
    var node = soapDoc.set("phone");
    node.setAttribute("name", this.name);
	for (var i = 0, count = newFeatures.length; i < count; i++) {
		newFeatures[i].addChangeNode(soapDoc, node);
	}
	var respCallback = new AjxCallback(this, this._handleResponseModifyVoiceFeatures, [newFeatures, callback]);
	batchCommand.addNewRequestParams(soapDoc, respCallback);
};

ZmPhone.prototype._handleResponseModifyVoiceFeatures = 
function(newFeatures, callback) {
	for(var i = 0, count = newFeatures.length; i < count; i++) {
		var feature = this._features[newFeatures[i].name];
		feature.assignFrom(newFeatures[i]);
	}
	if (callback) {
		callback.run();
	}
};

