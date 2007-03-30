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
* Creates a voice item.
* @constructor
* @class
* This "abstract" class represents a voicemail or phone call.
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param id			[int]			unique ID
* @param list		[ZmVoiceList]	list that contains this item
*/
function ZmVoiceItem(appCtxt, type, id, list) {

	if (arguments.length == 0) return;
	ZmItem.call(this, appCtxt, type, id, list);

	this.id = null;
	this.date = 0;
	this.duration = 0;
	this._callingParties = {};
	this.participants = new AjxVector();
}

ZmVoiceItem.prototype = new ZmItem;
ZmVoiceItem.prototype.constructor = ZmVoiceItem;

ZmVoiceItem.prototype.toString = 
function() {
	return "ZmVoiceItem";
}

ZmVoiceItem.FROM		= 1;
ZmVoiceItem.TO			= 2;

ZmVoiceItem.prototype.getFolder = 
function() {
	return this.list ? this.list.folder : null;
};

ZmVoiceItem.prototype.getPhone = 
function() {
	return this.list && this.list.folder ? this.list.folder.phone : null;;
};

ZmVoiceItem.prototype.isInTrash = 
function() {
	if (this.list && this.list.folder) {
		return this.list.folder.isInTrash();
	} else {
		return false;
	}
};

ZmVoiceItem.prototype.getCallingParty =
function(type) {
	return this._callingParties[type];
};

ZmVoiceItem.prototype._loadFromDom =
function(node) {
	if (node.id) this.id = node.id;
	if (node.cp) {
		for(var i = 0, count = node.cp.length; i < count; i++) {
			var party = node.cp[i];
// Consider keeping a cache of calling parties. There's going to be a lot of repetition here....			
			var callingParty = new ZmCallingParty();
			callingParty._loadFromDom(node.cp[i]);
			this._callingParties[callingParty.type] = callingParty;
		}
	}
	if (node.d) this.date = new Date(node.d);
	if (node.du) this.duration = new Date(node.du * 1000);
};

