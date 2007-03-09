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
*
* @constructor
* @class
*
* @author Dave Comfort
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param color
* @param url		[string]*		URL for this organizer's feed
* @param owner
* @param zid		[string]*		Zimbra id of owner, if remote share
* @param rid		[string]*		Remote id of organizer, if remote share
* @param restUrl	[string]*		The REST URL of this organizer.
*/
function ZmVoiceFolder(params) {
	params.type = ZmOrganizer.VOICEMAIL;
	ZmOrganizer.call(this, params);
	this.phone = params.phone;
//TODO: clean up this callType...shouldn't be necessary, when .name field has same thing.	
	this.callType = params.name; // A constant...ACCOUNT, PLACED, etc.
	this.view = params.view;
}

ZmVoiceFolder.prototype = new ZmOrganizer;
ZmVoiceFolder.prototype.constructor = ZmVoiceFolder;

ZmVoiceFolder.ACCOUNT = "USER_ROOT";
ZmVoiceFolder.PLACED_CALL = "Placed Calls";
ZmVoiceFolder.ANSWERED_CALL = "Answered Calls";
ZmVoiceFolder.MISSED_CALL = "Missed Calls";
ZmVoiceFolder.VOICEMAIL = "Voice Mails";
ZmVoiceFolder.TRASH = "Trash";


// Public methods

ZmVoiceFolder.prototype.toString =
function() {
	return "ZmVoiceFolder";
};

ZmVoiceFolder.prototype.getName =
function(showUnread, maxLength, noMarkup) {
	var name = this.name == ZmVoiceFolder.ACCOUNT ? this.phone.getDisplay() : this.name;
	return this._markupName(name, showUnread, noMarkup);
};

ZmVoiceFolder.prototype.getIcon =
function() {
	switch (this.callType) {
		case ZmVoiceFolder.ACCOUNT: return null;
		case ZmVoiceFolder.PLACED_CALL: return "PlacedCalls";
		case ZmVoiceFolder.ANSWERED_CALL: return "AnsweredCalls";
		case ZmVoiceFolder.MISSED_CALL: return "MissedCalls";
		case ZmVoiceFolder.VOICEMAIL: return "Voicemail";
		case ZmVoiceFolder.TRASH: return "Trash";
	}
	return null;
};

ZmVoiceFolder.sortCompare =
function(a, b) {
	return 0;
};

