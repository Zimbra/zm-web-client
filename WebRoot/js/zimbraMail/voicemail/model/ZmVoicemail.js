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
* @param appCtxt	[ZmAppCtxt]		the app context
* @param id			[int]			unique ID
* @param list		[ZmVoicemailList]	list that contains this item
*/
function ZmVoicemail(appCtxt, id, list) {

	if (arguments.length == 0) return;
	ZmItem.call(this, appCtxt, ZmItem.VOICEMAIL, id, list);

	this.id = null;
	this.caller = null;
	this.date = 0;
	this.duration = 0;
	this.isUnheard = false;
	this.soundUrl = false;
	this.participants = new AjxVector();
}

ZmVoicemail.prototype = new ZmItem;
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
	var result = new ZmVoicemail(args.appCtxt, node.id, args.list);
	result._loadFromDom(node);
	return result;
};

ZmVoicemail.getCallerComparator =
function(bSortAsc) {
	var negate = bSortAsc ? 1 : -1;
	return AjxCallback.simpleClosure(ZmVoicemail._callerComparator, ZmVoicemail, negate);	
};

ZmVoicemail._callerComparator =
function(negate, a, b) {
	var value = a.caller.localeCompare(b.caller);
	return value ? value * negate : ZmVoicemail._dateComparator(a, b);
};

ZmVoicemail.getDurationComparator =
function(bSortAsc) {
	var negate = bSortAsc ? 1 : -1;
	return AjxCallback.simpleClosure(ZmVoicemail._durationComparator, ZmVoicemail, negate);	
};

ZmVoicemail._durationComparator =
function(negate, a, b) {
	var value = a.duration.getTime() - b.duration.getTime();
	return value ? value * negate : ZmVoicemail._dateComparator(a, b);
};

ZmVoicemail.getDateComparator =
function(bSortAsc) {
	if (bSortAsc) {
		return ZmVoicemail._dateComparator;
	} else {
		return function(a, b) { return ZmVoicemail._dateComparator(b, a); }
	}
};

ZmVoicemail._dateComparator =
function(a, b) {
	return a.date.getTime() - b.date.getTime();
};

ZmVoicemail.prototype._loadFromDom =
function(node) {
	if (node.id) this.id = node.id;
	if (node.caller) this.caller = node.caller;
	if (node.date) this.date = node.date;
	if (node.duration) this.duration = node.duration;
	if (node.isUnheard) this.isUnheard = node.isUnheard;
	if (node.soundUrl) this.soundUrl = node.soundUrl;
};

