/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

/**
 * Creates a phone call.
 * @constructor
 * @class
 * This class represents a phone call.
 *
 * @param id		[int]			unique ID
 * @param list		[ZmVoiceList]	list that contains this item 
 */
ZmCall = function(id, list) {
	ZmVoiceItem.call(this, ZmItem.VOICEMAIL, id, list);
}

ZmCall.prototype = new ZmVoiceItem;
ZmCall.prototype.constructor = ZmCall;

ZmCall.prototype.toString = 
function() {
	return "ZmCall";
}

/**
* Fills in the voicemail from the given message node.
*
* @param node		a message node
* @param args		hash of input args
*/
ZmCall.createFromDom =
function(node, args) {
	var result = new ZmCall(node.id, args.list);
	result._loadFromDom(node);
	return result;
};

ZmCall.prototype._loadFromDom =
function(node) {
	ZmVoiceItem.prototype._loadFromDom.call(this, node);
};

