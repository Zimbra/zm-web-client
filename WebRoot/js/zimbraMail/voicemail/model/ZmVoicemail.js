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
 * Creates a voicemail.
 * @constructor
 * @class
 * This class represents a voiemail.
 *
 * @param id		[int]			unique ID
 * @param list		[ZmVoiceList]	list that contains this item
 */
ZmVoicemail = function(id, list) {

	ZmVoiceItem.call(this, ZmItem.VOICEMAIL, id, list);

	this.isUnheard = false;
	this.soundUrl = null;
}

ZmVoicemail.prototype = new ZmVoiceItem;
ZmVoicemail.prototype.constructor = ZmVoicemail;

ZmVoicemail.prototype.toString = 
function() {
	return "ZmVoicemail";
}

/**
* Fills in the voicemail from the given message node.
*
* @param node		a message node
* @param args		hash of input args
*/
ZmVoicemail.createFromDom =
function(node, args) {
	var result = new ZmVoicemail(node.id, args.list);
	result._loadFromDom(node);
	return result;
};

ZmVoicemail.prototype._loadFromDom =
function(node) {
	ZmVoiceItem.prototype._loadFromDom.call(this, node);
	if (node.f) {
		this.isUnheard = node.f.indexOf("u") >= 0;
		this.isHighPriority = node.f.indexOf("h") >= 0;
		this.isPrivate = node.f.indexOf("p") >= 0;
	}
	if (node.content) this.soundUrl = node.content[0].url;
};

