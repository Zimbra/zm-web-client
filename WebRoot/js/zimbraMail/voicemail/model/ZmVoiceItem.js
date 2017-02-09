/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a voice item.
 * @constructor
 * @class ZmVoiceItem
 * This abstract class represents a voicemail or phone call.
 *
 * @param id		[int]			unique ID
 * @param list		[ZmVoiceList]	list that contains this item
 */
ZmVoiceItem = function(type, id, list) {

	if (arguments.length == 0) { return; }
	ZmItem.call(this, type, id, list, true);

	this.id = null;
	this.date = 0;
	this.duration = 0;
	this._callingParties = {};
	this.participants = new AjxVector();
};

ZmVoiceItem.prototype = new ZmItem;
ZmVoiceItem.prototype.constructor = ZmVoiceItem;

ZmVoiceItem.prototype.toString = 
function() {
	return "ZmVoiceItem";
};

ZmVoiceItem.FROM		= 1;
ZmVoiceItem.TO			= 2;

ZmVoiceItem.prototype.getFolder = 
function() {
	return this.list ? this.list.folder : null;
};

ZmVoiceItem.prototype.getPhone = 
function() {
	return this.list && this.list.folder ? this.list.folder.phone : null;
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
			var callingParty = new ZmCallingParty();
			callingParty._loadFromDom(node.cp[i]);
			this._callingParties[callingParty.type] = callingParty;
		}
	}
	if (node.d) this.date = new Date(node.d);
	if (node.du) this.duration = new Date(node.du * 1000);
};

