/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
ZmVoiceFolder = function(params) {
	params.type = ZmOrganizer.VOICE;
	ZmOrganizer.call(this, params);
	this.phone = params.phone;
	this.callType = params.name; // A constant...ACCOUNT, PLACED, etc.
	this.view = params.view;
}

ZmVoiceFolder.prototype = new ZmOrganizer;
ZmVoiceFolder.prototype.constructor = ZmVoiceFolder;

ZmVoiceFolder.ACCOUNT = "USER_ROOT";
ZmVoiceFolder.PLACED_CALL = "Placed Calls";
ZmVoiceFolder.ANSWERED_CALL = "Answered Calls";
ZmVoiceFolder.MISSED_CALL = "Missed Calls";
ZmVoiceFolder.VOICEMAIL = "Voicemail Inbox";
ZmVoiceFolder.TRASH = "Trash";

ZmVoiceFolder.ACCOUNT_ID = "1";
ZmVoiceFolder.PLACED_CALL_ID = "1027";
ZmVoiceFolder.ANSWERED_CALL_ID = "1026";
ZmVoiceFolder.MISSED_CALL_ID = "1025";
ZmVoiceFolder.VOICEMAIL_ID = "1024";
ZmVoiceFolder.TRASH_ID = "1028";

ZmVoiceFolder.SORT_ORDER = {};
ZmVoiceFolder.SORT_ORDER[ZmVoiceFolder.PLACED_CALL] = 5;
ZmVoiceFolder.SORT_ORDER[ZmVoiceFolder.ANSWERED_CALL] = 4;
ZmVoiceFolder.SORT_ORDER[ZmVoiceFolder.MISSED_CALL] = 3;
ZmVoiceFolder.SORT_ORDER[ZmVoiceFolder.VOICEMAIL] = 1;
ZmVoiceFolder.SORT_ORDER[ZmVoiceFolder.TRASH] = 2;

// Public methods

ZmVoiceFolder.prototype.toString =
function() {
	return "ZmVoiceFolder";
};

ZmVoiceFolder.prototype.getName =
function(showUnread, maxLength, noMarkup) {
	var name;
	switch (this.callType) {
		case ZmVoiceFolder.ACCOUNT: name = this.phone.getDisplay(); break;
		case ZmVoiceFolder.PLACED_CALL: name = ZmMsg.placedCalls; break;
		case ZmVoiceFolder.ANSWERED_CALL: name = ZmMsg.answeredCalls; break;
		case ZmVoiceFolder.MISSED_CALL: name = ZmMsg.missedCalls; break;
		case ZmVoiceFolder.VOICEMAIL: name = ZmMsg.voiceMail; break;
		case ZmVoiceFolder.TRASH: name = ZmMsg.trash; break;
	}
	return this._markupName(name, showUnread && (this.callType != ZmVoiceFolder.TRASH), noMarkup);
};

ZmVoiceFolder.prototype.getIcon =
function() {
	switch (this.callType) {
		case ZmVoiceFolder.ACCOUNT:			{ return null; }
		case ZmVoiceFolder.PLACED_CALL:		{ return "PlacedCalls"; }
		case ZmVoiceFolder.ANSWERED_CALL:	{ return "AnsweredCalls"; }
		case ZmVoiceFolder.MISSED_CALL:		{ return "MissedCalls"; }
		case ZmVoiceFolder.VOICEMAIL:		{ return "Voicemail"; }
		case ZmVoiceFolder.TRASH:			{ return "Trash"; }
		default:							{ return null; }
	}
};

ZmVoiceFolder.prototype.getSearchType =
function() {
	return (this.callType == ZmVoiceFolder.VOICEMAIL) ||
		   (this.callType == ZmVoiceFolder.TRASH) ? ZmItem.VOICEMAIL : ZmItem.CALL;
};

ZmVoiceFolder.prototype.getSearchQuery =
function() {
	var query = [ "phone:", this.phone.name ];
	if (this.callType != ZmVoiceFolder.VOICEMAIL) {
		query.push(" in:\"");
		query.push(this.callType);
		query.push("\"");
	}
	return query.join("");
};

ZmVoiceFolder.prototype.isInTrash =
function() {
	var folder = this;
	while (folder) {
		if (this.callType == ZmVoiceFolder.TRASH) {
			return true;
		}
		folder = folder.parent;
	}
	return false;
};

ZmVoiceFolder.prototype.mayContain =
function(what, folderType) {
	var items = (what instanceof Array) ? what : [what];
	for (var i = 0, count = items.length; i < count; i++) {
		var voicemail = items[i];
		if (!(voicemail instanceof ZmVoicemail)) {
			return false;
		}
		if ((this.callType != ZmVoiceFolder.VOICEMAIL) && 
			(this.callType !== ZmVoiceFolder.TRASH)) {
			return false;
		}
		var folder = voicemail.getFolder();
		if (folder == this) {
			return false;
		}
		if (folder.phone != this.phone) {
			return false;
		}
	}
	return true;
};

ZmVoiceFolder.prototype.changeNumUnheardBy =
function(delta) {
	var newValue = (this.numUnread || 0) + delta;
	this.notifyModify( { u: newValue } );
};

/**
 * This updates the num total in the folder 
 * @param delta {int} value to change num total by
 */
ZmVoiceFolder.prototype.changeNumTotal = 
function(delta) {
	var newValue = (this.numTotal || 0 ) + delta;
	this.notifyModify( {n: newValue});
};

ZmVoiceFolder.get =
function(phone, folderType) {
	var folderId = [folderType, "-", phone.name].join("");
	return phone.folderTree.getById(folderId);
};

ZmVoiceFolder.sortCompare =
function(folderA, folderB) {
	if ((folderA instanceof ZmVoiceFolder) && (folderB instanceof ZmVoiceFolder)) {
		var sortA = ZmVoiceFolder.SORT_ORDER[folderA.callType];
		var sortB = ZmVoiceFolder.SORT_ORDER[folderB.callType];
		if (sortA && sortB) {
			return sortA - sortB;
		}
	}
	return 0;
};

ZmVoiceFolder.prototype.getToolTip =
function (force) {
     return ZmOrganizer.prototype.getToolTip.call(this, force);
};

ZmVoiceFolder.prototype._getItemsText =
function() {
    switch (this.callType){
        case ZmVoiceFolder.VOICEMAIL:
        case ZmVoiceFolder.TRASH:
            return ZmMsg.voicemailMessages;
        case ZmVoiceFolder.ANSWERED_CALL:
            return ZmMsg.answeredCalls;
        case ZmVoiceFolder.MISSED_CALL:
            return ZmMsg.missedCalls;
        case ZmVoiceFolder.PLACED_CALL:
            return ZmMsg.placedCalls;
        default:
            return ZmMsg.calls;
    }
};

ZmVoiceFolder.prototype._getUnreadLabel = 
function() {
	return ZmMsg.unheard;	
};

ZmVoiceFolder.prototype.empty =
function(){
	DBG.println(AjxDebug.DBG1, "emptying: " + this.name + ", ID: " + this.id);

	var soapDoc = AjxSoapDoc.create("VoiceMsgActionRequest", "urn:zimbraVoice");
	var node = soapDoc.set("action");
	node.setAttribute("op", "empty");
	node.setAttribute("id", this.id);
	node.setAttribute("phone", this.phone.name);
	this._handleResponseEmptyObj = this._handleResponseEmptyObj || new AjxCallback(this, this._handleResponseEmpty);
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: this._handleResponseEmptyObj
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmVoiceFolder.prototype._handleResponseEmpty =
function() {
	// If this folder is visible, clear the contents of the view. 
	var controller = AjxDispatcher.run("GetVoiceController");
	if (controller.getFolder() == this) {
		controller.getListView().removeAll();
	}
};
