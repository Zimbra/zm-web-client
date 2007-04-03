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
* Creates an item of the given type.
* @constructor
* @class
* An item is a piece of data that may contain user content. Most items are taggable. Currently,
* the following things are items: conversation, message, attachment, appointment, and contact.
* <p>
* An item typically appears in the context of a containing list. Its event handling
* is generally handled by the list so we avoid having the same listeners on each item. If we
* create a context where an item stands alone outside a list context, then the item will have
* its own listeners and do its own notification handling.</p>
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		the app context
* @param type		[constant]		type of object (conv, msg, etc)
* @param id			[int]			unique ID
* @param list		[ZmList]		list that contains this item
*/
function ZmItem(appCtxt, type, id, list) {

	if (arguments.length == 0) return;
	ZmModel.call(this, type);

	this._appCtxt = appCtxt;
	this.type = type;
	this.id = id;
	this.list = list;
	
	this.tags = [];
	this.tagHash = {};
	this.folderId = 0;
	
	if (id && appCtxt)
		appCtxt.cacheSet(id, this);
};

ZmItem.prototype = new ZmModel;
ZmItem.prototype.constructor = ZmItem;

// Item types
ZmItem.NOTE = ZmEvent.S_NOTE;

// App responsible for item
ZmItem.APP = {};

// Type names
ZmItem.MSG_KEY = {};
ZmItem.MSG_KEY[ZmItem.NOTE]	= "note";

// Representative icons
ZmItem.ICON = {};
ZmItem.ICON[ZmItem.NOTE] = "Note";

// Function for creating search results list
ZmItem.RESULTS_LIST = {};

// fields that can be part of a displayed item
var i = 1;
ZmItem.F_ID				= i++;
ZmItem.F_ITEM_ROW		= i++;
ZmItem.F_ICON			= i++;
ZmItem.F_FLAG			= i++;
ZmItem.F_ATTACHMENT		= i++;
ZmItem.F_TAG			= i++;
ZmItem.F_PARTICIPANT	= i++;
ZmItem.F_FROM			= i++;
ZmItem.F_FRAGMENT		= i++;
ZmItem.F_SUBJECT		= i++;
ZmItem.F_COUNT			= i++;
ZmItem.F_DATE			= i++;
ZmItem.F_STATUS			= i++;
ZmItem.F_FOLDER			= i++;
ZmItem.F_COMPANY		= i++;
ZmItem.F_EMAIL			= i++;
ZmItem.F_ITEM_TYPE		= i++;
ZmItem.F_TAG_CELL		= i++;
ZmItem.F_SIZE			= i++;
ZmItem.F_INDEX			= i++;
ZmItem.F_EXPAND			= i++;	// hybrid mail view
// task specific
ZmItem.F_PRIORITY		= i++;
ZmItem.F_PCOMPLETE		= i++;
ZmItem.F_COMPLETED		= i++;

// Action requests for different items
ZmItem.SOAP_CMD = {};
ZmItem.SOAP_CMD[ZmItem.TASK]	= "ItemAction";

// Item fields (for modify events)
ZmItem.TAGS_FIELD = 1;

// Item flags
ZmItem.FLAG_FLAGGED		= "f";
ZmItem.FLAG_ATTACH		= "a";
ZmItem.FLAG_UNREAD		= "u";
ZmItem.FLAG_REPLIED		= "r";
ZmItem.FLAG_FORWARDED	= "w";
ZmItem.FLAG_ISSENT		= "s";
ZmItem.FLAG_ISDRAFT 	= "d";
ZmItem.ALL_FLAGS = [ZmItem.FLAG_FLAGGED, ZmItem.FLAG_ATTACH, ZmItem.FLAG_UNREAD,
					ZmItem.FLAG_REPLIED, ZmItem.FLAG_FORWARDED, ZmItem.FLAG_ISSENT, ZmItem.FLAG_ISDRAFT];

// Map flag to item property
ZmItem.FLAG_PROP = {};
ZmItem.FLAG_PROP[ZmItem.FLAG_FLAGGED]	= "isFlagged";
ZmItem.FLAG_PROP[ZmItem.FLAG_ATTACH]	= "hasAttach";
ZmItem.FLAG_PROP[ZmItem.FLAG_UNREAD]	= "isUnread";
ZmItem.FLAG_PROP[ZmItem.FLAG_REPLIED]	= "isReplied";
ZmItem.FLAG_PROP[ZmItem.FLAG_FORWARDED]	= "isForwarded";
ZmItem.FLAG_PROP[ZmItem.FLAG_ISSENT]	= "isSent";
ZmItem.FLAG_PROP[ZmItem.FLAG_ISDRAFT] 	= "isDraft";

// DnD actions this item is allowed
ZmItem.DND_ACTION_MOVE = 1 << 0;
ZmItem.DND_ACTION_COPY = 1 << 1;
ZmItem.DND_ACTION_BOTH = ZmItem.DND_ACTION_MOVE | ZmItem.DND_ACTION_COPY;

/**
 * Stores information about the given item type.
 * 
 * @param item			[constant]	item type
 * @param app			[constant]	app that handles this item type
 * @param nameKey		[string]	msg key for item name
 * @param icon			[string]	name of item's icon class
 * @param soapCmd		[string]	SOAP command for acting on this item
 * @param itemClass		[string]	name of class that represents this item
 * @param node			[string]	SOAP response node for this item
 * @param organizer		[constant]	associated organizer
 * @param searchType	[string]	associated type in SearchRequest
 * @param resultsList	[function]	function that returns a ZmList for
 * 									holding search results of this type
 */
ZmItem.registerItem =
function(item, params) {
	if (params.app)				{ ZmItem.APP[item]					= params.app; }
	if (params.nameKey)			{ ZmItem.MSG_KEY[item]				= params.nameKey; }
	if (params.icon)			{ ZmItem.ICON[item]					= params.icon; }
	if (params.soapCmd)			{ ZmItem.SOAP_CMD[item]				= params.soapCmd; }
	if (params.itemClass)		{ ZmList.ITEM_CLASS[item]			= params.itemClass; }
	if (params.node)			{ ZmList.NODE[item]					= params.node; }
	if (params.organizer)		{ ZmOrganizer.ITEM_ORGANIZER[item]	= params.organizer; }
	if (params.searchType)		{ ZmSearch.TYPE[item]				= params.searchType; }
	if (params.resultsList)		{ ZmItem.RESULTS_LIST[item]			= params.resultsList; }
	
	if (params.node) {
		ZmList.ITEM_TYPE[params.node] = item;
	}
};

/**
* Takes a normalized id or an item id, and returns the item id.
*/
ZmItem.getItemId =
function(id) {
	if (!id) {
		return id;
	}
	if (!ZmItem.SHORT_ID_RE) {
		var shell = DwtShell.getShell(window);
		var appCtxt = ZmAppCtxt.getFromShell(shell);
		ZmItem.SHORT_ID_RE = new RegExp(appCtxt.get(ZmSetting.USERID) + ':', "gi");
	}
	return id.replace(ZmItem.SHORT_ID_RE, '');
};

// abstract methods
ZmItem.prototype.create = function(args) {};
ZmItem.prototype.modify = function(mods) {};
ZmItem.prototype.getPrintHtml = function(preferHtml, callback) {};

/**
* Returns this item if it has the given ID. Used by the app controller for
* handling notifications.
*
* @param id		an item ID
*/
ZmItem.prototype.getById =
function(id) {
	if (id == this.id)
		return this;
};

ZmItem.prototype.clear =
function() {
	this._evtMgr.removeAll(ZmEvent.L_MODIFY);
	if (this.tags.length) {
		for (var i = 0; i < this.tags.length; i++)
			this.tags[i] = null;
		this.tags = [];
	}
	for (var i in this.tagHash)
		this.tagHash[i] = null;
	this.tagHash = {};
};

/**
* Returns true is this item has the given tag.
*
* @param tagId		a numeric tag ID
*/
ZmItem.prototype.hasTag =
function(tagId) {
	return (this.tagHash[tagId] == true);
};

/**
* Returns ID of the folder that contains this item, if available.
*/
ZmItem.prototype.getFolderId =
function() {
	return this.folderId;
};

ZmItem.prototype.getSortVal =
function(sortBy) {
	// overload me to return the sort val per type of derived ZmItem
	return null;
};

/** @deprecated Use getRestUrl. */
ZmItem.prototype.getUrl = function() {
	return this.getRestUrl();
};

ZmItem.prototype.getRestUrl = function() {
	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	var organizerType = ZmOrganizer.ITEM_ORGANIZER[this.type];
	var organizer = this._appCtxt.getById(this.folderId);
	var url = [
		organizer.getRestUrl(), "/", AjxStringUtil.urlComponentEncode(this.name)
	].join("");

	DBG.println("NO REST URL FROM SERVER. GENERATED URL: "+url);

	return url;
};

/**
* Returns the ID of the appropriate tag image for this item.
*/
ZmItem.prototype.getTagImageInfo =
function() {
	var tagImageInfo;
	if (!this.tags.length) {
		tagImageInfo = "Blank_16";
	} else if (this.tags.length == 1) {
		var tag = this._appCtxt.getById(this.tags[0]);
		var color = tag ? tag.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
		tagImageInfo = ZmTag.COLOR_MINI_ICON[color];
	} else {
		tagImageInfo = "MiniTagStack";
	}
	return tagImageInfo;
};

/**
* Returns what the default action should be when dragging this item. This method
* is meant to be overloaded for items that are read-only and can only be copied.
*/
ZmItem.prototype.getDefaultDndAction =
function() {
	return (this.isShared() || this.isReadOnly())
		? ZmItem.DND_ACTION_COPY
		: ZmItem.DND_ACTION_MOVE;
};

/**
* This method should be overloaded by the derived object to determine what
* "read-only" means.
*/
ZmItem.prototype.isReadOnly =
function() {
	return false;
};

/**
* This method should be overloaded by the derived object to determine whether it
* is a share or not.
*/
ZmItem.prototype.isShared =
function() {
	return false;
};

// Notification handling

/**
* Handles a delete notification.
*/
ZmItem.prototype.notifyDelete =
function() {
	this.deleteLocal();
	if (this.list)
		this.list.deleteLocal([this]);
	this._notify(ZmEvent.E_DELETE);
};

/**
* Handles a modification notification.
*
* @param obj		item with the changed attributes/content
*/
ZmItem.prototype.notifyModify =
function(obj) {
	// empty string is meaningful here, it means no tags
	if (obj.t != null) {
		this._parseTags(obj.t);
		this._notify(ZmEvent.E_TAGS);
	}
	// empty string is meaningful here, it means no flags
	if (obj.f != null) {
		var flags = this._getFlags();
		var origFlags = {};
		for (var i = 0; i < flags.length; i++)
			origFlags[flags[i]] = this[ZmItem.FLAG_PROP[flags[i]]];
		this._parseFlags(obj.f);
		var changedFlags = [];
		for (var i = 0; i < flags.length; i++) {
			var on = this[ZmItem.FLAG_PROP[flags[i]]];
			if (origFlags[flags[i]] != on)
				changedFlags.push(flags[i]);
		}
		this._notify(ZmEvent.E_FLAGS, {flags: changedFlags});
	}
	if (obj.l != null && obj.l != this.folderId) {
		this.moveLocal(obj.l);
		if (this.list)
			this.list.moveLocal([this], obj.l);
		// if this was the last item in a list of items that moved,
		// it's safe to do replenishment now
		this._notify(ZmEvent.E_MOVE, {replenish: obj.lastModify});
	}
};

// Local change handling

/**
* Applies the given flag change to this item.
*
* @param flag		the flag that changed
* @param on			true if the flag is now set
*/
ZmItem.prototype.flagLocal =
function(flag, on) {
	this[ZmItem.FLAG_PROP[flag]] = on;
};

/**
* Adds or removes the given tag for this item.
*
* @param tagId		a numeric tag ID
* @param doTag		true if tag is being added, false if it is being removed
*/
ZmItem.prototype.tagLocal =
function(tagId, doTag) {
	var bNotify = false;
	if (doTag) {
		if (!this.tagHash[tagId]) {
			bNotify = true;
			this.tags.push(tagId);
			this.tagHash[tagId] = true;
		}
	} else {
		for (var i = 0; i < this.tags.length; i++) {
			if (this.tags[i] == tagId) {
				this.tags.splice(i, 1);
				delete this.tagHash[tagId];
				bNotify = true;
				break;
			}
		}
	}
	
	return bNotify;
};

ZmItem.prototype.removeAllTagsLocal =
function() {
	this.tags = [];
	for (var i in this.tagHash) {
		delete this.tagHash[i];
	}
};

/**
* Here for completeness, in case an item wants to do something while being deleted.
*/
ZmItem.prototype.deleteLocal = function() {};

/**
* Updates the folder for this item.
*
* @param folderId		the new folder ID
*/
ZmItem.prototype.moveLocal =
function(folderId) {
	this.folderId = folderId;
};

// Takes a comma-separated list of tag IDs and applies the tags to this item.
ZmItem.prototype._parseTags =
function(str) {	
	this.tags = [];
	this.tagHash = {};
	if (str && str.length) {
		var tags = str.split(",");
		for (var i = 0; i < tags.length; i++) {
			var tagId = Number(tags[i]);
			if (tagId >= ZmOrganizer.FIRST_USER_ID[ZmOrganizer.TAG])
				this.tagLocal(tagId, true);
		}
	}
};

// Takes a string of flag chars and applies them to this item.
ZmItem.prototype._parseFlags =
function(str) {
	for (var i = 0; i < ZmItem.ALL_FLAGS.length; i++) {
		var flag = ZmItem.ALL_FLAGS[i];
		var on = (str && (str.indexOf(flag) != -1)) ? true : false;
		this.flagLocal(flag, on);
	}
};

// Listener notification

// notify the list as well as this item
ZmItem.prototype._notify =
function(event, details) {
	ZmModel.prototype._notify.call(this, event, details);
	if (this.list) {
		if (details)
			details.items = [this];
		else
			details = {items: [this]};
		this.list._notify(event, details);
	}
};

/*
* Returns a list of flags that apply to this type of item.
*/
ZmItem.prototype._getFlags =
function() {
	return [ZmItem.FLAG_FLAGGED, ZmItem.FLAG_ATTACH];
};
