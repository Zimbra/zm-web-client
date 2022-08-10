/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a phone.
* @constructor
* @class
* This class represents a phone.
*
*/
ZmPhone = function() {
	this.name = null;				// The internal representation of the phone.
	this.used = null;				// Amount of quota used.
	this.limit = null;				// Quota size.
	this.folderTree = null;			// Folders
};

ZmPhone.prototype.toString = 
function() {
	return "ZmPhone";
};

ZmPhone.calculateDisplay =
function(name) {
	if (!name) {
		return "";
	}
	var offset = 0;
	var doIt = false;
	if (name.length == 10) {
		doIt = true;
	} else if ((name.length == 11) && (name.charAt(0) == '1')) {
		doIt = true;
		offset = 1;
	}
	if (doIt) {
		var array = [
			"(",
			name.substring(offset, offset + 3),
			") ",
			name.substring(offset + 3, offset + 6),
			"-",
			name.substring(offset + 6, offset + 10)
		];
		return array.join("");
	} else {
		return name;
	}
};

ZmPhone.calculateName =
function(display) {
	return display.replace(/[^\d]/g, '');
};

ZmPhone.isValid =
function(str) {
	var nameLength = ZmPhone.calculateName(str).length;
	return (7 <= nameLength) && (nameLength <= 20) && !/[^0-9()\-\s\+]/.exec(str);
};

ZmPhone.prototype.getDisplay =
function() {
	this._display = ZmPhone.calculateDisplay(this.name);
	if(this.label) {
		this._display = [this.label, " - ", this._display].join("");
	}
	if(this._display == "") {
		this._display = ZmMsg.phoneNotConfigured;
	}
	return this._display;
};

ZmPhone.prototype.getCallUrl = 
function() {
	return "callto:+1" + this.name;
};

ZmPhone.prototype._loadFromDom = 
function(node) {
	this.name =  node.name;
	this.id = node.id;
	this.label = node.label;
	this.hasVoiceMail = node.vm;
	this.allProps = node;
	this.phoneType = node.type;
	
	if (node.used && node.used.length) this.used =  node.used[0]._content;
	if (this.limit && this.limit.length) this.limit = node.limit[0]._content;
	this._initializeFeatures();
	var features = node.callfeatures[0].callfeature;
	this._featuresDefined = true;
	if (features) {
		for (var i = 0, count = features.length; i < count; i++) {
			var name = features[i].name;
			var feature = this._features[name];
			if (feature) {
				feature.isSubscribed = true;
				this._featuresDefined = false;
			}
		}
	}
};

/////////////////////////////////////////////////////
// Make a subclass for this stuff?
/////////////////////////////////////////////////////

ZmPhone.prototype.getCallFeatures = 
function(callback, errorCallback) {
	if (this._featuresDefined) {
		if (callback) {
			callback.run(this._features, this);
		}
	} else {
		this._initializeFeatures();
		var soapDoc = AjxSoapDoc.create("GetVoiceFeaturesRequest", "urn:zimbraVoice");
		appCtxt.getApp(ZmApp.VOICE).setStorePrincipal(soapDoc);
		var node = soapDoc.set("phone");
		node.setAttribute("name", this.name);
		for (var i in this._features) {
			var feature = this._features[i];
			if (feature.isSubscribed && !feature.isVoicemailPref) {
				soapDoc.set(feature.name, null, node);
			}
		}
		var respCallback = new AjxCallback(this, this._handleResponseGetVoiceFeatures, callback);
		var params = {
			soapDoc: soapDoc,
			asyncMode: true,
			callback: respCallback,
			errorCallback: errorCallback
		};
		appCtxt.getAppController().sendRequest(params);
	}
};

ZmPhone.prototype._handleResponseGetVoiceFeatures = 
function(callback, response) {
	this._initializeFeatures();
	var features = response._data.GetVoiceFeaturesResponse.phone[0];
	for (var i in features) {
		if (i == ZmCallFeature.VOICEMAIL_PREFS) {
			var voicemailPrefs = features[i][0].pref;
			this._loadVoicemailPrefs(voicemailPrefs);
		} else {
			var feature = this._features[i];
			if (feature) {
				feature._loadCallFeature(features[i][0]);
			}
		}
	}
	this._featuresDefined = true;
	if (callback) {
		callback.run(this._features, this);
	}
};

ZmPhone.prototype._loadVoicemailPrefs = 
function(voicemailPrefs) {
	for (var i = 0, count = voicemailPrefs.length; i < count; i++) {
		var obj = voicemailPrefs[i];
		var feature = this._features[obj.name];
		if (feature) {
			feature._loadVoicemailPref(obj);
		}
	}
};

ZmPhone.prototype._initializeFeatures = 
function() {
	if (!this._features)
		this._features = {};
	for(var i = 0, count = ZmCallFeature.CALL_FEATURES.length; i < count; i++) {
		var name = ZmCallFeature.CALL_FEATURES[i];
		if (!this._features[name])
			this._features[name] = new ZmCallFeature(name, false, false);
	}
	for(var i = 0, count = ZmCallFeature.VOICE_FEATURES.length; i < count; i++) {
		var name = ZmCallFeature.VOICE_FEATURES[i];
		if (!this._features[name])
			this._features[name] = new ZmCallFeature(name, true, this.hasVoiceMail);
	}
};

ZmPhone.prototype.modifyCallFeatures = 
function(batchCommand, newFeatures, callback) {
	var soapDoc = AjxSoapDoc.create("ModifyVoiceFeaturesRequest", "urn:zimbraVoice");
	appCtxt.getApp(ZmApp.VOICE).setStorePrincipal(soapDoc);
	var node = soapDoc.set("phone");
	node.setAttribute("name", this.name);
	var voicemailPrefsNode = null;
	for (var i = 0, count = newFeatures.length; i < count; i++) {
		if (newFeatures[i].isVoicemailPref) {
			if (!voicemailPrefsNode) {
				voicemailPrefsNode = soapDoc.set(ZmCallFeature.VOICEMAIL_PREFS, null, node);
			}
			newFeatures[i].addVoicemailChangeNode(soapDoc, voicemailPrefsNode);
		} else {
			newFeatures[i].addChangeNode(soapDoc, node);
		}
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

