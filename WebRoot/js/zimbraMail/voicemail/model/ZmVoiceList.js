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
* Creates an empty list of voicemails.
* @constructor
* @class
* This class represents a list of voicemails.
*
* @author Dave Comfort
* @param appCtxt	global app context
* @param search		the search that generated this list
*/
function ZmVoiceList(appCtxt, search) {
	ZmList.call(this, ZmItem.VOICEMAIL, appCtxt, search);
	this.folder = null;
};

ZmVoiceList.prototype = new ZmList;
ZmVoiceList.prototype.constructor = ZmVoiceList;

ZmVoiceList.prototype.toString = 
function() {
	return "ZmVoiceList";
};

ZmVoiceList.prototype.moveItems =
function(items, folder, attrs) {
	attrs = attrs || {};
	attrs.phone = this.folder.phone.name;
	attrs.l = folder.id;
	this._itemAction({items: items, action: "move", attrs: attrs});
};

ZmVoiceList.prototype._getActionNamespace =
function() {
	return "urn:zimbraVoice";
};

