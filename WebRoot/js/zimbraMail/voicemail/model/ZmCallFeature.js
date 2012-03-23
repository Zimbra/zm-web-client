/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a call feature.
* @constructor
* @class
* This class represents a call feature. Each feature can be active or subscribed. Other than
* that each feature has different data, which is stored in the data member, as just copies of
* the JSON data. Whoever uses this class just has to know how to deal with the data.
*
*/
ZmCallFeature = function(name, isVoicemailPref, isSubscribed) {
	
	this.name = name;
	this.isSubscribed = isSubscribed;
	this.isActive = false;
	this.data = {};
	this.isVoicemailPref = isVoicemailPref;
	if (isVoicemailPref) {
		this.data.value = "";
	}
}

ZmCallFeature.prototype.toString = 
function() {
	return "ZmCallFeature";
}

// Calling preferences
ZmCallFeature.ANONYMOUS_REJECTION = "anoncallrejection";
ZmCallFeature.CALL_FORWARDING = "callforward";
ZmCallFeature.SELECTIVE_CALL_FORWARDING = "selectivecallforward";
ZmCallFeature.VOICEMAIL_PREFS = "voicemailprefs"
ZmCallFeature.CALL_FORWARD_NO_ANSWER = "callforwardnoanswer";
ZmCallFeature.SELECTIVE_CALL_REJECTION = "selectivecallrejection";
ZmCallFeature.SELECTIVE_CALL_ACCEPTANCE = "selectivecallacceptance";

ZmCallFeature.CALL_FEATURES = [ZmCallFeature.ANONYMOUS_REJECTION, ZmCallFeature.CALL_FORWARDING, ZmCallFeature.VOICEMAIL_PREFS, ZmCallFeature.CALL_FORWARD_NO_ANSWER, ZmCallFeature.SELECTIVE_CALL_FORWARDING, ZmCallFeature.SELECTIVE_CALL_REJECTION, ZmCallFeature.SELECTIVE_CALL_ACCEPTANCE];


// Voicemail preferences.
ZmCallFeature.EMAIL_NOTIFICATION = "vmPrefEmailNotifAddress";
ZmCallFeature.VOICE_FEATURES = [ZmCallFeature.EMAIL_NOTIFICATION];


ZmCallFeature.prototype.createProxy = 
function() {
	var result = AjxUtil.createProxy(this);
	result.data = AjxUtil.createProxy(this.data);
	return result;
};

ZmCallFeature.prototype.addVoicemailChangeNode = 
function(soapDoc, parentNode) {
	var value = this.isActive ? this.data.value : "";
	var child = soapDoc.set("pref", value, parentNode);
	child.setAttribute("name", this.name);
};

ZmCallFeature.prototype.addChangeNode = 
function(soapDoc, phoneNode) {
	var child = soapDoc.set(this.name, null, phoneNode);
	this._setBooleanAttrubute(child, "s", this.isSubscribed);
	this._setBooleanAttrubute(child, "a", this.isActive);
	this._addNode(soapDoc, child, this.data);
};

ZmCallFeature.prototype._setBooleanAttrubute =
function(node, name, value) {
	node.setAttribute(name, value ? "true" : "false");
};

ZmCallFeature.prototype._addNode =
function(soapDoc, parentNode, data) {
	for (var i in data) {
		if (i != "_object_") { // Ignore proxy field.
			var obj = data[i]
			if (obj instanceof Array) {
				this._addArrayNode(soapDoc, parentNode, i, obj);
			} else if (typeof obj == "object") {
				var child = soapDoc.set(i, null, parentNode);
				this._addNode(soapDoc, child, obj);
			} else {
				if ((typeof obj) == 'boolean') {
					this._setBooleanAttrubute(parentNode, i, obj)
				} else {
					parentNode.setAttribute(i, obj);
				}
			}
		}
	}
};

ZmCallFeature.prototype._addArrayNode = 
function(soapDoc, parentNode, name, array) {
	for (var i = 0, count = array.length; i < count; i++) {
		var child = soapDoc.set(name, null, parentNode);
		this._addNode(soapDoc, child, array[i]);
	}
};

ZmCallFeature.prototype.assignFrom = 
function(feature) {
	this.isSubscribed = feature.isSubscribed;
	this.isActive = feature.isActive;
	this.data = {};
	for (var i in feature.data) {
		if (i != "_object_") { // Ignore proxy field.
			this.data[i] = feature.data[i];
		}
	}
};

ZmCallFeature.prototype._loadCallFeature = 
function(node) {
	for (var i in node) {
		if (i == "s") {
			this.isSubscribed = node.s.toString().toLowerCase() == "true";
		} else if (i == "a") {
			this.isActive = node.a.toString().toLowerCase() == "true";
		} else {
			this.data[i] = node[i];
		}
	}
};

ZmCallFeature.prototype._loadVoicemailPref = 
function(node) {
	this.isVoicemailPref = true;
	this.data.value = node._content;
	this.isSubscribed = true;
	this.isActive = Boolean(this.data.value);
};

