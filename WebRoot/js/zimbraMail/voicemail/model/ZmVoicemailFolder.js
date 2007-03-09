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
function ZmVoicemailFolder(params) {
	params.type = ZmOrganizer.VOICEMAIL;
	ZmOrganizer.call(this, params);
	this.phone = params.phone;
//TODO: clean up this callType...shouldn't be necessary, when .name field has same thing.	
	this.callType = params.name; // A constant...ACCOUNT, PLACED, etc.
	this.view = params.view;
}

ZmVoicemailFolder.prototype = new ZmOrganizer;
ZmVoicemailFolder.prototype.constructor = ZmVoicemailFolder;

ZmVoicemailFolder.ACCOUNT = "USER_ROOT";
ZmVoicemailFolder.PLACED_CALL = "Placed Calls";
ZmVoicemailFolder.ANSWERED_CALL = "Answered Calls";
ZmVoicemailFolder.MISSED_CALL = "Missed Calls";
ZmVoicemailFolder.VOICEMAIL = "Voice Mails";
ZmVoicemailFolder.TRASH = "Trash";


// Public methods

ZmVoicemailFolder.prototype.toString =
function() {
	return "ZmVoicemailFolder";
};

ZmVoicemailFolder.prototype.getName =
function(showUnread, maxLength, noMarkup) {
	var name = this.name == ZmVoicemailFolder.ACCOUNT ? this.phone.getDisplay() : this.name;
	return this._markupName(name, showUnread, noMarkup);
};

ZmVoicemailFolder.prototype.getIcon =
function() {
	switch (this.callType) {
		case ZmVoicemailFolder.ACCOUNT: return null;
		case ZmVoicemailFolder.PLACED_CALL: return "PlacedCalls";
		case ZmVoicemailFolder.ANSWERED_CALL: return "AnsweredCalls";
		case ZmVoicemailFolder.MISSED_CALL: return "MissedCalls";
		case ZmVoicemailFolder.VOICEMAIL: return "Voicemail";
		case ZmVoicemailFolder.TRASH: return "Trash";
	}
	return null;
};

ZmVoicemailFolder.sortCompare =
function(a, b) {
	return 0;
};

