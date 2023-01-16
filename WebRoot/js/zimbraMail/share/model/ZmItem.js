/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines an item.
 */

/**
 * Creates an item.
 * @class
 * An item is a piece of data that may contain user content. Most items are taggable. Currently,
 * the following things are items: conversation, message, attachment, appointment, and contact.
 * <br/>
 * <br/>
 * An item typically appears in the context of a containing list. Its event handling
 * is generally handled by the list so we avoid having the same listeners on each item. If we
 * create a context where an item stands alone outside a list context, then the item will have
 * its own listeners and do its own notification handling.
 *
 * @author Conrad Damon
 * 
 * @param {constant}	type		type of object (conv, msg, etc)
 * @param {int}			id			the unique id
 * @param {ZmList}		list		a list that contains this item
 * @param {Boolean}		noCache		if <code>true</code>, do not cache this item
 * 
 * @extends		ZmModel
 */
ZmItem = function(type, id, list, noCache) {

	if (arguments.length == 0) { return; }
	ZmModel.call(this, type);

	this.type = type;
	this.id = id;
	this.list = list;
	this._list = {};

    // number of views using this item
    this.refCount = 0;

	this.tags = [];
	this.tagHash = {};
	this.folderId = 0;

	// make sure the cached item knows which lists it is in, even if those other lists
	// have separate instances of this item - propagate view IDs from currently cached item
	var curItem = appCtxt.getById(id);
	if (curItem) {
		this._list = AjxUtil.hashCopy(curItem._list);
        if (!list) {
            // No list specified, preserve the previous list
            this.list = curItem.list;
        }
	}
	if (list) {
		this._list[list.id] = true;
	}
	
	if (id && !noCache) {
		appCtxt.cacheSet(id, this);
	}
};

ZmItem.prototype = new ZmModel;
ZmItem.prototype.constructor = ZmItem;

ZmItem.prototype.isZmItem = true;
ZmItem.prototype.toString = function() { return "ZmItem"; };


ZmItem.APP 				= {};	// App responsible for item
ZmItem.MSG_KEY 			= {};	// Type names
ZmItem.ICON 			= {};	// Representative icons
ZmItem.RESULTS_LIST 	= {};	// Function for creating search results list

// fields that can be part of a displayed item
ZmItem.F_ACCOUNT		= ZmId.FLD_ACCOUNT;
ZmItem.F_ATTACHMENT		= ZmId.FLD_ATTACHMENT;
ZmItem.F_CAPACITY		= ZmId.FLD_CAPACITY;
ZmItem.F_COMPANY		= ZmId.FLD_COMPANY;
ZmItem.F_DATE			= ZmId.FLD_DATE;
ZmItem.F_DEPARTMENT		= ZmId.FLD_DEPARTMENT;
ZmItem.F_EMAIL			= ZmId.FLD_EMAIL;
ZmItem.F_EXPAND			= ZmId.FLD_EXPAND;
ZmItem.F_FILE_TYPE		= ZmId.FLD_FILE_TYPE;
ZmItem.F_FLAG			= ZmId.FLD_FLAG;
ZmItem.F_FOLDER			= ZmId.FLD_FOLDER;
ZmItem.F_FRAGMENT		= ZmId.FLD_FRAGMENT;
ZmItem.F_FROM			= ZmId.FLD_FROM;
ZmItem.F_HOME_PHONE		= ZmId.FLD_HOME_PHONE;
ZmItem.F_ID				= ZmId.FLD_ID;
ZmItem.F_INDEX			= ZmId.FLD_INDEX;
ZmItem.F_ITEM_ROW		= ZmId.FLD_ITEM_ROW;
ZmItem.F_ITEM_ROW_3PANE	= ZmId.FLD_ITEM_ROW_3PANE;
ZmItem.F_LOCATION		= ZmId.FLD_LOCATION;
ZmItem.F_NAME			= ZmId.FLD_NAME;
ZmItem.F_NOTES			= ZmId.FLD_NOTES;
ZmItem.F_PARTICIPANT	= ZmId.FLD_PARTICIPANT;
ZmItem.F_PCOMPLETE		= ZmId.FLD_PCOMPLETE;
ZmItem.F_PRIORITY		= ZmId.FLD_PRIORITY;
ZmItem.F_RECURRENCE		= ZmId.FLD_RECURRENCE;
ZmItem.F_SELECTION		= ZmId.FLD_SELECTION;
ZmItem.F_SELECTION_CELL	= ZmId.FLD_SELECTION_CELL;
ZmItem.F_SIZE			= ZmId.FLD_SIZE;
ZmItem.F_SORTED_BY		= ZmId.FLD_SORTED_BY;	// placeholder for 3-pane view
ZmItem.F_STATUS			= ZmId.FLD_STATUS;
ZmItem.F_READ			= ZmId.FLD_READ;
ZmItem.F_MUTE			= ZmId.FLD_MUTE;
ZmItem.F_SUBJECT		= ZmId.FLD_SUBJECT;
ZmItem.F_TAG			= ZmId.FLD_TAG;
ZmItem.F_TAG_CELL		= ZmId.FLD_TAG_CELL;
ZmItem.F_TO             = ZmId.FLD_TO;
ZmItem.F_TYPE			= ZmId.FLD_TYPE;
ZmItem.F_VERSION        = ZmId.FLD_VERSION;
ZmItem.F_WORK_PHONE		= ZmId.FLD_WORK_PHONE;
ZmItem.F_LOCK           = ZmId.FLD_LOCK;
ZmItem.F_SHARES			= ZmId.FLD_SHARES;
ZmItem.F_MSG_PRIORITY   = ZmId.FLD_MSG_PRIORITY;
ZmItem.F_APP_PASSCODE_CREATED = ZmId.FLD_CREATED;
ZmItem.F_APP_PASSCODE_LAST_USED = ZmId.FLD_LAST_USED;

// Action requests for different items
ZmItem.SOAP_CMD = {};

// Item fields (for modify events)
ZmItem.TAGS_FIELD = 1;

// Item flags
ZmItem.FLAG_ATTACH				= "a";
ZmItem.FLAG_FLAGGED				= "f";
ZmItem.FLAG_FORWARDED			= "w";
ZmItem.FLAG_ISDRAFT 			= "d";
ZmItem.FLAG_ISSCHEDULED 		= "c";
ZmItem.FLAG_ISSENT				= "s";
ZmItem.FLAG_READ_RECEIPT_SENT	= "n";
ZmItem.FLAG_REPLIED				= "r";
ZmItem.FLAG_UNREAD				= "u";
ZmItem.FLAG_MUTE				= "(";
ZmItem.FLAG_LOW_PRIORITY		= "?";
ZmItem.FLAG_HIGH_PRIORITY		= "!";
ZmItem.FLAG_PRIORITY            = "+"; //msg prioritization
ZmItem.FLAG_NOTE                = "t"; //specially for notes
ZmItem.FLAG_OFFLINE_CREATED     = "o";

ZmItem.ALL_FLAGS = [
	ZmItem.FLAG_FLAGGED,
	ZmItem.FLAG_ATTACH,
	ZmItem.FLAG_UNREAD,
	ZmItem.FLAG_MUTE,
	ZmItem.FLAG_REPLIED,
	ZmItem.FLAG_FORWARDED,
	ZmItem.FLAG_ISSENT,
	ZmItem.FLAG_READ_RECEIPT_SENT,
	ZmItem.FLAG_ISDRAFT,
	ZmItem.FLAG_ISSCHEDULED,
	ZmItem.FLAG_HIGH_PRIORITY,
	ZmItem.FLAG_LOW_PRIORITY,
	ZmItem.FLAG_PRIORITY,
    ZmItem.FLAG_NOTE,
    ZmItem.FLAG_OFFLINE_CREATED
];

// Map flag to item property
ZmItem.FLAG_PROP = {};
ZmItem.FLAG_PROP[ZmItem.FLAG_ATTACH]			= "hasAttach";
ZmItem.FLAG_PROP[ZmItem.FLAG_FLAGGED]			= "isFlagged";
ZmItem.FLAG_PROP[ZmItem.FLAG_FORWARDED]			= "isForwarded";
ZmItem.FLAG_PROP[ZmItem.FLAG_ISDRAFT] 			= "isDraft";
ZmItem.FLAG_PROP[ZmItem.FLAG_ISSCHEDULED] 		= "isScheduled";
ZmItem.FLAG_PROP[ZmItem.FLAG_ISSENT]			= "isSent";
ZmItem.FLAG_PROP[ZmItem.FLAG_READ_RECEIPT_SENT]	= "readReceiptSent";
ZmItem.FLAG_PROP[ZmItem.FLAG_REPLIED]			= "isReplied";
ZmItem.FLAG_PROP[ZmItem.FLAG_UNREAD]			= "isUnread";
ZmItem.FLAG_PROP[ZmItem.FLAG_MUTE]			    = "isMute";
ZmItem.FLAG_PROP[ZmItem.FLAG_LOW_PRIORITY]		= "isLowPriority";
ZmItem.FLAG_PROP[ZmItem.FLAG_HIGH_PRIORITY]		= "isHighPriority";
ZmItem.FLAG_PROP[ZmItem.FLAG_PRIORITY]          = "isPriority";
ZmItem.FLAG_PROP[ZmItem.FLAG_NOTE]              = "isNote";
ZmItem.FLAG_PROP[ZmItem.FLAG_OFFLINE_CREATED]   = "isOfflineCreated";

// DnD actions this item is allowed

/**
 * Defines the "move" action.
 * 
 * @see		#getDefaultDndAction
 */
ZmItem.DND_ACTION_MOVE = 1 << 0;
/**
 * Defines the "copy" action.
 * 
 * @see		#getDefaultDndAction
 */
ZmItem.DND_ACTION_COPY = 1 << 1;
/**
 * Defines the "move & copy" action.
 * 
 * @see		#getDefaultDndAction
 */
ZmItem.DND_ACTION_BOTH = ZmItem.DND_ACTION_MOVE | ZmItem.DND_ACTION_COPY;

/**
 * Defines the notes separator which is used by items
 * (such as calendar or share invites) that have notes.
 * 
 */
ZmItem.NOTES_SEPARATOR			= "*~*~*~*~*~*~*~*~*~*";

/**
 * Registers an item and stores information about the given item type.
 *
 * @param {constant}	item		the item type
 * @param	{Hash}	params			a hash of parameters
 * @param {constant}	params.app			the app that handles this item type
 * @param {String}		params.nameKey		the message key for item name
 * @param {String}		params.icon			the name of item icon class
 * @param {String}		params.soapCmd		the SOAP command for acting on this item
 * @param {String}		params.itemClass	the name of class that represents this item
 * @param {String}		params.node			the SOAP response node for this item
 * @param {constant}	params.organizer	the associated organizer
 * @param {String}		params.searchType	the associated type in SearchRequest
 * @param {function}	params.resultsList	the function that returns a {@link ZmList} for holding search results of this type
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

	if (params.dropTargets) {
		if (!ZmApp.DROP_TARGETS[params.app]) {
			ZmApp.DROP_TARGETS[params.app] = {};
		}
		ZmApp.DROP_TARGETS[params.app][item] = params.dropTargets;
	}
};

/**
* Gets an item id by taking a normalized id (or an item id) and returning the item id.
* 
* @param	{String}	id		the normalized id
* @return	{String}	the item id
*/
ZmItem.getItemId =
function(id) {
	if (!id) {
		return id;
	}
	if (!ZmItem.SHORT_ID_RE) {
		var shell = DwtShell.getShell(window);
		ZmItem.SHORT_ID_RE = new RegExp(appCtxt.get(ZmSetting.USERID) + ':', "gi");
	}
	return id.replace(ZmItem.SHORT_ID_RE, '');
};

// abstract methods
/**
 * Creates an item.
 * 
 * @param	{Hash}	args		the arguments
 */
ZmItem.prototype.create = function(args) {};
/**
 * Modifies an item.
 * 
 * @param	{Hash}	mods		the arguments
 */
ZmItem.prototype.modify = function(mods) {};

/**
 * Gets the item by id.
 *
 * @param {String}	id		an item id
 * @return	{ZmItem}	the item
 */
ZmItem.prototype.getById =
function(id) {
	if (id == this.id) {
		return this;
	}
};

ZmItem.prototype.getAccount =
function() {
	if (!this.account) {
		var account;

		if (this.folderId) {
			var ac = window.parentAppCtxt || window.appCtxt;
			var folder = ac.getById(this.folderId);
			account = folder && folder.getAccount();
		}

		if (!account) {
			var parsed = ZmOrganizer.parseId(this.id);
			account = parsed && parsed.account;
		}
		this.account = account;
	}
	return this.account;
};

/**
 * Clears the item.
 * 
 */
ZmItem.prototype.clear = function() {

    // only clear data if no views are using this item
    if (this.refCount <= 1) {
        this._evtMgr.removeAll(ZmEvent.L_MODIFY);
        if (this.tags.length) {
            for (var i = 0; i < this.tags.length; i++) {
                this.tags[i] = null;
            }
            this.tags = [];
        }
        for (var i in this.tagHash) {
            this.tagHash[i] = null;
        }
        this.tagHash = {};
    }

    this.refCount--;
};

/**
 * Caches the item.
 * 
 * @return	{Boolean}	<code>true</code> if the item is placed into cache; <code>false</code> otherwise
 */
ZmItem.prototype.cache =
function(){
  if (this.id) {
      appCtxt.cacheSet(this.id, this);
      return true;
  }
  return false;  
};

/**
 * Checks if the item has a given tag.
 * 
 * @param {String}		tagName		tag name
 * @return	{Boolean}	<code>true</code> is this item has the given tag.
 */
ZmItem.prototype.hasTag =
function(tagName) {
	return (this.tagHash[tagName] == true);
};

/**
 * is it possible to add a tag to this item?
 * @param tagName
 * @returns {boolean}
 */
ZmItem.prototype.canAddTag =
function(tagName) {
	return !this.hasTag(tagName);
};


/**
* Gets the folder id that contains this item, if available.
* 
* @return	{String}	the folder id or <code>null</code> for none
*/
ZmItem.prototype.getFolderId =
function() {
	return this.folderId;
};

/**
 * @deprecated
 * Use getRestUrl
 * 
 * @private
 * @see		#getRestUrl
 */
ZmItem.prototype.getUrl =
function() {
	return this.getRestUrl();
};

/**
 * Gets the rest url for this item.
 * 
 * @return	{String}	the url
 */
ZmItem.prototype.getRestUrl =
function() {
	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	var organizerType = ZmOrganizer.ITEM_ORGANIZER[this.type];
	var organizer = appCtxt.getById(this.folderId);
	var url = organizer
		? ([organizer.getRestUrl(), "/", AjxStringUtil.urlComponentEncode(this.name)].join(""))
		: null;

	if (url && this.folderId == ZmFolder.ID_FILE_SHARED_WITH_ME) {
		if (this.sfid) {
			url = [url, "?", "id=", this.sfid].join("");
		} else {
			url = [url, "?", "id=", this.id].join("");
		}
	}

	DBG.println(AjxDebug.DBG3, "NO REST URL FROM SERVER. GENERATED URL: " + url);

	return url;
};

/**
* Gets the appropriate tag image info for this item.
* 
* @return	{String}	the tag image info
*/
ZmItem.prototype.getTagImageInfo =
function() {
	return this.getTagImageFromNames(this.getVisibleTags());
};

/**
 * @deprecated
 * */
ZmItem.prototype.getTagImageFromIds =
function(tagIds) {
	var tagImageInfo;

	if (!tagIds || tagIds.length == 0) {
		tagImageInfo = "Blank_16";
	} else if (tagIds.length == 1) {
        tagImageInfo = this.getTagImage(tagIds[0]);
	} else {
		tagImageInfo = "TagStack";
	}

	return tagImageInfo;
};

ZmItem.prototype.getVisibleTags =
function() {
    if(!appCtxt.get(ZmSetting.TAGGING_ENABLED)){
        return [];
    }
    return this.tags;
	//todo - do we need anything from this?
//    var searchAll = appCtxt.getSearchController().searchAllAccounts;
//    if (!searchAll && this.isShared()) {
//        return [];
//    } else {
//        return this.tags;
//    }
};

ZmItem.prototype.getTagImageFromNames =
function(tags) {

	if (!tags || tags.length == 0) {
		return "Blank_16";
	}
	if (tags.length == 1) {
        return this.getTagImage(tags[0]);
	} 

	return "TagStack";
};


ZmItem.prototype.getTagImage =
function(tagName) {
	//todo - I don't think we need the qualified/normalized/whatever id anymore.
//	var tagFullId = (!this.getAccount().isMain)
//		? ([this.getAccount().id, tagName].join(":"))
//		: (ZmOrganizer.getSystemId(tagName));
	var tagList = appCtxt.getAccountTagList(this);

	var tag = tagList.getByNameOrRemote(tagName);
    return tag ? tag.getIconWithColor() : "Blank_16";
};

/**
* Gets the default action to use when dragging this item. This method
* is meant to be overloaded for items that are read-only and can only be copied.
*
* @param {Boolean}		forceCopy		If set, default DnD action is a copy
* @return	{Object}	the action
*/
ZmItem.prototype.getDefaultDndAction =
function(forceCopy) {
	return (this.isReadOnly() || forceCopy)
		? ZmItem.DND_ACTION_COPY
		: ZmItem.DND_ACTION_MOVE;
};

/**
* Checks if this item is read-only. This method should be
* overloaded by the derived object to determine what "read-only" means.
* 
* @return	{Boolean}	the read-only status
*/
ZmItem.prototype.isReadOnly =
function() {
	return false;
};

/**
 * Checks if this item is shared.
 * 
 * @return	{Boolean}	<code>true</code> if this item is shared (remote)
 */
ZmItem.prototype.isShared =
function() {
	if (this._isShared == null) {
		if (this.id === -1) {
			this._isShared = false;
		} else {
			this._isShared = appCtxt.isRemoteId(this.id);
		}
	}
	return this._isShared;
};

// Notification handling

// For delete and modify notifications, we first apply the notification to this item. Then we
// see if the item is a member of any other lists. If so, we have those other copies of this
// item handle the notification as well. Each will notify through the list that created it.

ZmItem.prototype.notifyDelete =
function() {
	this._notifyDelete();
	for (var listId in this._list) {
		var list = appCtxt.getById(listId);
		if (!list || (this.list && listId == this.list.id)) { continue; }
		var ctlr = list.controller;
		if (!ctlr || ctlr.inactive || (ctlr.getList().id != listId)) { continue; }
		var doppleganger = list.getById(this.id);
		if (doppleganger) {
			doppleganger._notifyDelete();
		}
	}
};

ZmItem.prototype._notifyDelete =
function() {
	this.deleteLocal();
	if (this.list) {
		this.list.deleteLocal([this]);
	}
	this._notify(ZmEvent.E_DELETE);
};

ZmItem.prototype.notifyModify =
function(obj, batchMode) {
	this._notifyModify(obj, batchMode);
	for (var listId in this._list) {
		var list = listId ? appCtxt.getById(listId) : null;
		if (!list || (this.list && (listId == this.list.id))) { continue; }
		var ctlr = list.controller;
		if (!ctlr || ctlr.inactive || (ctlr.getList().id != listId)) { continue; }
		var doppleganger = list.getById(this.id);
		if (doppleganger) {
			doppleganger._notifyModify(obj, batchMode);
		}
	}
};

/**
 * Handles a modification notification.
 *
 * @param {Object}	obj			the item with the changed attributes/content
 * @param {boolean}	batchMode	if true, return event type and don't notify
 */
ZmItem.prototype._notifyModify =
function(obj, batchMode) {
	// empty string is meaningful here, it means no tags
	if (obj.tn != null) {
		this._parseTagNames(obj.tn);
		this._notify(ZmEvent.E_TAGS);
	}
	// empty string is meaningful here, it means no flags
	if (obj.f != null) {
		var flags = this._getFlags();
		var origFlags = {};
		for (var i = 0; i < flags.length; i++) {
			origFlags[flags[i]] = this[ZmItem.FLAG_PROP[flags[i]]];
		}
		this._parseFlags(obj.f);
		var changedFlags = [];
		for (var i = 0; i < flags.length; i++) {
			var on = this[ZmItem.FLAG_PROP[flags[i]]];
			if (origFlags[flags[i]] != on) {
				changedFlags.push(flags[i]);
			}
		}
		if (changedFlags.length) {
			this._notify(ZmEvent.E_FLAGS, {flags: changedFlags});
		}
	}
	if (obj.l != null && obj.l != this.folderId) {
		var details = {oldFolderId:this.folderId};
		this.moveLocal(obj.l);
		if (this.list) {
			this.list.moveLocal([this], obj.l);
		}
		if (batchMode) {
			delete obj.l;			// folder has been handled
			return ZmEvent.E_MOVE;
		} else {
			this._notify(ZmEvent.E_MOVE, details);
		}
	}
};

// Local change handling

/**
 * Applies the given flag change to this item by setting a boolean property.
 *
 * @param {constant}	flag	the flag that changed
 * @param {Boolean}	on		<code>true</code> if the flag is now set
 */
ZmItem.prototype.flagLocal =
function(flag, on) {
	this[ZmItem.FLAG_PROP[flag]] = on;
};

/**
 * Sets the given flag change to this item. Both the flags string and the
 * flag properties are affected.
 *
 * @param {constant}	flag	the flag that changed
 * @param {Boolean}	on	<code>true</code> if the flag is now set
 *
 * @return	{String}		the new flags string
 */
ZmItem.prototype.setFlag =
function(flag, on) {
	this.flagLocal(flag, on);
	var flags = this.flags || "";
	if (on && flags.indexOf(flag) == -1) {
		flags = flags + flag;
	} else if (!on && flags.indexOf(flag) != -1) {
		flags = flags.replace(flag, "");
	}
	this.flags = flags;

	return flags;
};

/**
 * Adds or removes the given tag for this item.
 *
 * @param {Object}		tag		tag name
 * @param {Boolean}		doTag		<code>true</code> if tag is being added; <code>false</code> if it is being removed
 * @return	{Boolean}	<code>true</code> to notify
 */
ZmItem.prototype.tagLocal =
function(tag, doTag) {
	var bNotify = false;
	if (doTag) {
		if (!this.tagHash[tag]) {
			bNotify = true;
			this.tags.push(tag);
			this.tagHash[tag] = true;
		}
	} else {
		for (var i = 0; i < this.tags.length; i++) {
			if (this.tags[i] == tag) {
				this.tags.splice(i, 1);
				delete this.tagHash[tag];
				bNotify = true;
				break;
			}
		}
	}
	
	return bNotify;
};

/**
 * Removes all tags.
 * 
 */
ZmItem.prototype.removeAllTagsLocal =
function() {
	this.tags = [];
	for (var i in this.tagHash) {
		delete this.tagHash[i];
	}
};

/**
 * Deletes local, in case an item wants to do something while being deleted.
 */
ZmItem.prototype.deleteLocal = function() {};

/**
 * Moves the item.
 * 
 * @param	{String}	folderId
 * @param	{AjxCallback}	callback		the callback
 * @param	{AjxCallback}	errorCallback	the callback on error
 * @return	{Object}		the result of the move
 */
ZmItem.prototype.move =
function(folderId, callback, errorCallback) {
	return ZmItem.move(this.id, folderId, callback, errorCallback);
};

/**
 * Moves the item.
 * 
 * @return	{Object}		the result of the move
 */
ZmItem.move =
function(itemId, folderId, callback, errorCallback, accountName) {
	var json = {
		ItemActionRequest: {
			_jsns: "urn:zimbraMail",
			action: {
				id:	itemId instanceof Array ? itemId.join() : itemId,
				op:	"move",
				l:	folderId
			}
		}
	};

	var params = {
		jsonObj:		json,
		asyncMode:		Boolean(callback),
		callback:		callback,
		errorCallback:	errorCallback,
		accountName:	accountName
	};
	return appCtxt.getAppController().sendRequest(params);
};

/**
 * Updates the folder for this item.
 *
 * @param {String}		folderId		the new folder ID
 */
ZmItem.prototype.moveLocal =
function(folderId) {
	this.folderId = folderId;
};

/**
 * Takes a comma-separated list of tag IDs and applies the tags to this item.
 * 
 * @private
 */
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

/**
 * Takes a comma-separated list of tag names and applies the tags to this item.
 *
 * @private
 */
ZmItem.prototype._parseTagNames =
function(str) {
	this.tags = [];
	this.tagHash = {};
	if (!str || !str.length) {
		return;
	}
	
	// server escapes comma with backslash
	str = str.replace(/\\,/g, "\u001D");
	var tags = str.split(",");
	
	for (var i = 0; i < tags.length; i++) {
		var tagName = tags[i].replace("\u001D", ",");
		this.tagLocal(tagName, true);
	}
};

/**
 * Takes a string of flag chars and applies them to this item.
 * 
 * @private
 */
ZmItem.prototype._parseFlags =
function(str) {
	this.flags = str;
	for (var i = 0; i < ZmItem.ALL_FLAGS.length; i++) {
		var flag = ZmItem.ALL_FLAGS[i];
		var on = (str && (str.indexOf(flag) != -1)) ? true : false;
		this.flagLocal(flag, on);
	}
};

// Listener notification

/**
 * Notify the list as well as this item.
 * 
 * @private
 */
ZmItem.prototype._notify =
function(event, details) {
	this._doNotify(event, details);
};

ZmItem.prototype._setupNotify =
function() {
    this._doNotify();
}

ZmItem.prototype._doNotify =
function(event, details) {
	if (this._evt) {
		this._evt.item = this;
		if (event != null) {
			ZmModel.prototype._notify.call(this, event, details);
		}
	} else {
		var idText = "";
		if (this.type && this.id) {
			idText = ": item = " + this.type + "(" + this.id + ")";
		}
		DBG.println(AjxDebug.DBG1, "ZmItem._doNotify, missing _evt" + idText);
	}
    if (this.list) {
        this.list._evt.item = this;
        this.list._evt.items = [this];
        if (event != null) {
            if (details) {
                details.items = [this];
            } else {
                details = {items: [this]};
            }
            this.list._notify(event, details);
        }
    }
};

/**
 * Returns a list of flags that apply to this type of item.
 * 
 * @private
 */
ZmItem.prototype._getFlags =
function() {
	return [ZmItem.FLAG_FLAGGED, ZmItem.FLAG_ATTACH];
};

/**
 * Rename the item.
 *
 * @param	{String}	newName
 * @param	{AjxCallback}	callback		the callback
 * @param	{AjxCallback}	errorCallback	the callback on error
 * @return	{Object}		the result of the move
 */
ZmItem.prototype.rename =
function(newName, callback, errorCallback) {
	return ZmItem.rename(this.id, newName, callback, errorCallback);
};

/**
 * Rename the item.
 *
 * @return	{Object}		the result of the move
 */
ZmItem.rename =
function(itemId, newName, callback, errorCallback, accountName) {
    var json = {
		ItemActionRequest: {
			_jsns: "urn:zimbraMail",
			action: {
				id:	itemId instanceof Array ? itemId[0] : itemId,
				op:	"rename",
				name:	newName
			}
		}
	};	

	var params = {
		jsonObj:		json,
		asyncMode:		Boolean(callback),
		callback:		callback,
		errorCallback:	errorCallback,
		accountName:	accountName
	};
	return appCtxt.getAppController().sendRequest(params);
};

ZmItem.prototype.getSortedTags =
function() {
	var numTags = this.tags && this.tags.length;
	if (numTags) {
		var tagList = appCtxt.getAccountTagList(this);
		var ta = [];
		for (var i = 0; i < numTags; i++) {
			var tag = tagList.getByNameOrRemote(this.tags[i]);
			//tag could be missing if this was called when deleting a whole tag (not just untagging one message). So this makes sure we don't have a null item.
			if (!tag) {
				continue;
			}
			ta.push(tag);
		}
		ta.sort(ZmTag.sortCompare);
		return ta;
	}
	return null;
};

