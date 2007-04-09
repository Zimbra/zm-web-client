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
* Creates a call feature.
* @constructor
* @class
* This class represents a call feature. Each feature can be active or subscribed. Other than
* that each feature has different data, which is stored in the data member, as just copies of
* the JSON data. Whoever uses this class just has to know how to deal with the data.
*
*/
function ZmCallFeature(appCtxt) {
	this._appCtxt = appCtxt;
	
	this.isSubscribed = false;
	this.isActive = false;
	this.data = {};
}

ZmCallFeature.prototype.toString = 
function() {
	return "ZmCallFeature";
}

//ZmCallFeature.prototype.createProxy = 
//function() {
//	var result = AjxUtil.createProxy(this);
//	result.data = AjxUtil.createProxy(this.data);
//	return result;
//};

ZmCallFeature.prototype._loadFromDom = 
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

