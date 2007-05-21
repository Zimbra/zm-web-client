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
* Creates a phone call.
* @constructor
* @class
* This class represents a phone call.
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param id			[int]			unique ID
* @param list		[ZmVoiceList]	list that contains this item
*/
ZmCall = function(appCtxt, id, list) {

	if (arguments.length == 0) return;
	ZmVoiceItem.call(this, appCtxt, ZmItem.VOICEMAIL, id, list);
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
	var result = new ZmCall(args.appCtxt, node.id, args.list);
	result._loadFromDom(node);
	return result;
};

ZmCall.prototype._loadFromDom =
function(node) {
	ZmVoiceItem.prototype._loadFromDom.call(this, node);
};

