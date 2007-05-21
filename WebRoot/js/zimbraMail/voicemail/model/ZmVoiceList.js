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
* @param type		type of thing in the list
* @param search		the search that generated this list
*/
ZmVoiceList = function(appCtxt, type, search) {
	ZmList.call(this, type, appCtxt, search);
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
	var params = {
		items: items, 
		action: "move", 
		attrs: attrs,
		callback: new AjxCallback(this, this._handleResponseMoveItems, [items, folder])
	};
	this._itemAction(params);
};

// The voice server isn't sending notifications. This callback updates
// folders and such after a move.
ZmVoiceList.prototype._handleResponseMoveItems =
function(items, destinationFolder) {
	// Remove the items.
	for(var i = 0, count = items.length; i < count; i++) {
		this.remove(items[i]);
	}
	
	// Update the unread counts in the folders.
	var numUnheard = 0;
	for(var i = 0, count = items.length; i < count; i++) {
		if (items[i].isUnheard) {
			numUnheard++;
		}
	}
	var sourceFolder = items[0].getFolder();
	if (numUnheard) {
		sourceFolder.changeNumUnheardBy(-numUnheard);
		destinationFolder.changeNumUnheardBy(numUnheard);
	}
	
	// Replenish the list view.
	//
	// This is sort of a hack having the model call back to the controller, but without notifications
	// this seems like the best approach.
	var controller = AjxDispatcher.run("GetVoiceController");
	controller._handleResponseMoveItems(items);
};

ZmVoiceList.prototype._getActionNamespace =
function() {
	return "urn:zimbraVoice";
};

