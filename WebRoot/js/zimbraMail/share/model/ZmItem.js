/**
* Creates an item of the given type.
* @constructor
* @class
* An item is a piece of data that may contain user content. Most items are taggable. Currently,
* the following things are items: conversation, message, attachment, and contact.
* <p>
* An item typically appears in the context of a containing LmList, so its event handling
* has been pushed up there so we avoid having the same listeners on every single item. If we
* create a context where an item stands alone outside a list context, then the item has
* to create its own event and handle the notifications.</p>
*
* @author Conrad Damon
* @param appCtxt	the app context
* @param type		type of object (conv, msg, etc)
* @param list		LmList that contains this item
*/
function LmItem(appCtxt, type, list) {

	if (arguments.length == 0) return;
	LmModel.call(this, true);

	this._appCtxt = appCtxt;
	this.type = type;
	this.list = list;
	
	this.tags = new Array();
	this.tagHash = new Object();
	this.folderId = 0;
	this._evt = new LmEvent(type);
}

LmItem.prototype = new LmModel;
LmItem.prototype.constructor = LmItem;

// Item types
LmItem.CONV		= LmEvent.S_CONV;
LmItem.MSG		= LmEvent.S_MSG;
LmItem.ATT		= LmEvent.S_ATT;
LmItem.CONTACT	= LmEvent.S_CONTACT;
LmItem.APPT		= LmEvent.S_APPT;
LmItem.NOTE		= LmEvent.S_NOTE;
LmItem.MAX		= LmItem.NOTE;

// Type names
LmItem.MSG_KEY = new Object();
LmItem.MSG_KEY = new Object();
LmItem.MSG_KEY[LmItem.CONV]		= "conversation";
LmItem.MSG_KEY[LmItem.MSG]		= "message";
LmItem.MSG_KEY[LmItem.ATT]		= "attachment";
LmItem.MSG_KEY[LmItem.CONTACT]	= "contact";
LmItem.MSG_KEY[LmItem.APPT]		= "appointment";
LmItem.MSG_KEY[LmItem.NOTE]		= "note";

// Representative icons
LmItem.ICON = new Object();
LmItem.ICON[LmItem.CONV]	= LmImg.I_CONV;
LmItem.ICON[LmItem.MSG]		= LmImg.I_MAIL;
LmItem.ICON[LmItem.ATT]		= LmImg.I_ATTACHMENT;
LmItem.ICON[LmItem.CONTACT]	= LmImg.I_CONTACT;
LmItem.ICON[LmItem.APPT]	= LmImg.I_APPT;
LmItem.ICON[LmItem.NOTE]	= LmImg.I_NOTE;

// fields that can be part of a displayed item
var i = 1;
LmItem.F_ID				= i++;
LmItem.F_ITEM_ROW		= i++;
LmItem.F_ICON			= i++;
LmItem.F_FLAG			= i++;
LmItem.F_ATTACHMENT		= i++;
LmItem.F_TAG			= i++;
LmItem.F_PARTICIPANT	= i++;
LmItem.F_FROM			= i++;
LmItem.F_FRAGMENT		= i++;
LmItem.F_SUBJECT		= i++;
LmItem.F_COUNT			= i++;
LmItem.F_DATE			= i++;
LmItem.F_STATUS			= i++;
LmItem.F_FOLDER			= i++;
LmItem.F_COMPANY		= i++;
LmItem.F_EMAIL			= i++;
LmItem.F_PHONE_BUS		= i++;
LmItem.F_PHONE_MOBILE 	= i++;
LmItem.F_FREE_BUSY		= i++;
LmItem.F_ITEM_TYPE		= i++;
LmItem.F_TAG_CELL		= i++;
LmItem.F_SIZE			= i++;

// Action requests for different items
LmItem.SOAP_CMD = new Object();
LmItem.SOAP_CMD[LmItem.CONV]	= "ConvAction";
LmItem.SOAP_CMD[LmItem.MSG]		= "MsgAction";
LmItem.SOAP_CMD[LmItem.ATT]		= "unsupported";
LmItem.SOAP_CMD[LmItem.CONTACT]	= "ContactAction";

// Item fields (for modify events)
LmItem.TAGS_FIELD = 1;

// Item flags
LmItem.FLAG_FLAGGED		= "f";
LmItem.FLAG_ATTACH		= "a";
LmItem.FLAG_UNREAD		= "u";
LmItem.FLAG_REPLIED		= "r";
LmItem.FLAG_FORWARDED	= "w";
LmItem.FLAG_ISSENT		= "s";
LmItem.FLAG_ISDRAFT 	= "d";
LmItem.ALL_FLAGS = [LmItem.FLAG_FLAGGED, LmItem.FLAG_ATTACH, LmItem.FLAG_UNREAD,
					LmItem.FLAG_REPLIED, LmItem.FLAG_FORWARDED, LmItem.FLAG_ISSENT, LmItem.FLAG_ISDRAFT];

// Map flag to item property
LmItem.FLAG_PROP = new Object();
LmItem.FLAG_PROP[LmItem.FLAG_FLAGGED]	= "isFlagged";
LmItem.FLAG_PROP[LmItem.FLAG_ATTACH]	= "hasAttach";
LmItem.FLAG_PROP[LmItem.FLAG_UNREAD]	= "isUnread";
LmItem.FLAG_PROP[LmItem.FLAG_REPLIED]	= "isReplied";
LmItem.FLAG_PROP[LmItem.FLAG_FORWARDED]	= "isForwarded";
LmItem.FLAG_PROP[LmItem.FLAG_ISSENT]	= "isSent";
LmItem.FLAG_PROP[LmItem.FLAG_ISDRAFT] 	= "isDraft";

// abstract methods
LmItem.prototype.create = function(args) {}
LmItem.prototype.modify = function(mods) {}

/**
* Adds a change listener to this item, and adds this item to the list of
* models the app controller knows about.
*
* @param listener	the listener
*/
LmItem.prototype.addChangeListener = 
function(listener) {
	if (LmModel.prototype.addChangeListener.call(this, listener))
		this._appCtxt.getAppController().addModel(this);	
}

/**
* Removes a change listener from this item, and removes this item from the list of
* models the app controller knows about.
*
* @param listener	the listener
*/
LmItem.prototype.removeChangeListener = 
function(listener) {
	if (LmModel.prototype.removeChangeListener.call(this, listener))
		if (!this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY))
			this._appCtxt.getAppController().removeModel(this);	
}

/**
* Returns this item if it has the given ID. Used by the app controller for
* handling notifications.
*
* @param id		an item ID
*/
LmItem.prototype.getById =
function(id) {
	if (id == this.id)
		return this;
}

LmItem.prototype.clear =
function() {
	if (this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY))
		this._appCtxt.getAppController().removeModel(this);
	this._evtMgr.removeAll(LmEvent.L_MODIFY);
	if (this.tags.length) {
		for (var i = 0; i < this.tags.length; i++)
			this.tags[i] = null;
		this.tags = new Array();
	}
	for (var i in this.tagHash)
		this.tagHash[i] = null;
	this.tagHash = new Object();
}

/**
* Returns true is this item has the given tag.
*
* @param tagId		a numeric tag ID
*/
LmItem.prototype.hasTag =
function(tagId) {
	return (this.tagHash[tagId] == true);
}

/**
* Returns the ID of the appropriate tag image for this item.
*/
LmItem.prototype.getTagImageInfo =
function() {
	var tagList = this._appCtxt.getTagList();
	var tagImageInfo;
	if (!this.tags.length) {
		tagImageInfo = LmImg.I_BLANK;
	} else if (this.tags.length == 1) {
		var color = tagList.getById(this.tags[0]).color;
		tagImageInfo = LmTag.COLOR_MINI_ICON[color];
	} else {
		tagImageInfo = LmImg.I_MINI_TAG_STACK;
	}
	return tagImageInfo;
}

/**
* Applies the given flag change to this item.
*
* @param flag		the flag that changed
* @param on			true if the flag is now set
*/
LmItem.prototype.flagLocal =
function(flag, on) {
	this[LmItem.FLAG_PROP[flag]] = on;
}

/**
* Adds or removes the given tag for this item.
*
* @param tagId		a numeric tag ID
* @param doTag		true if tag is being added, false if it is being removed
*/
LmItem.prototype.tagLocal =
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
}

LmItem.prototype.removeAllTagsLocal =
function() {
	this.tags = new Array();
	for (var i in this.tagHash) {
		delete this.tagHash[i];
	}
}

/**
* Here for completeness. There isn't anything for an item to do once it's
* been deleted.
*/
LmItem.prototype.deleteLocal = function() {}

/**
* Updates the folder for this item.
*
* @param folderId		the new folder ID
*/
LmItem.prototype.moveLocal =
function(folderId) {
	this.folderId = folderId;
}

/**
* Handles a delete notification, checking to see if our ID is in the list of IDs that
* were deleted.
*
* @param ids	IDs that got deleted
*/
LmItem.prototype.notifyDelete =
function(ids) {
	for (var i = 0; i < ids.length; i++) {
		if (ids[i] == this.id) {
			// not sure what to do here; presumably it's a single-item view that's the listener,
			// eg a contact or message; msg dialog then pop view?
		}
	}
}

/**
* Handles a modification notification.
*
* @param obj		item with the changed attributes/content
*/
LmItem.prototype.notifyModify =
function(obj) {
	// empty string is meaningful here, it means no tags
	if (obj.t != null) {
		this._parseTags(obj.t);
		this._notify(LmEvent.E_TAGS);
	}
	// empty string is meaningful here, it means no flags
	if (obj.f != null) {
		var flags = this._getFlags();
		var origFlags = new Object();
		for (var i = 0; i < flags.length; i++)
			origFlags[flags[i]] = this[LmItem.FLAG_PROP[flags[i]]];
		this._parseFlags(obj.f);
		var changedFlags = new Array();
		for (var i = 0; i < flags.length; i++)
			if (origFlags[flags[i]] != this[LmItem.FLAG_PROP[flags[i]]])
				changedFlags.push(flags[i]);
		this._notify(LmEvent.E_FLAGS, {flags: changedFlags});
	}
	if (obj.l != null) {
		this.moveLocal(obj.l);
		this._notify(LmEvent.E_MOVE);
	}
}

// Any item can be flagged or have an attachment
LmItem.prototype._getFlags =
function() {
	return [LmItem.FLAG_FLAGGED, LmItem.FLAG_ATTACH];
}

// Takes a comma-separated list of tag IDs and applies the tags to this item.
LmItem.prototype._parseTags =
function(str) {	
	this.tags = new Array();
	this.tagHash = new Object();
	if (str && str.length) {
		var tags = str.split(",");
		for (var i = 0; i < tags.length; i++) {
			var tagId = Number(tags[i]);
			if (tagId >= LmTag.FIRST_USER_ID)
				this.tagLocal(tagId, true);
		}
	}
}

// Takes a string of flag chars and applies them to this item.
LmItem.prototype._parseFlags =
function(str) {
	for (var i = 0; i < LmItem.ALL_FLAGS.length; i++) {
		var flag = LmItem.ALL_FLAGS[i];
		this[LmItem.FLAG_PROP[flag]] = str && (str.indexOf(flag) != -1) ? true : false;
	}
}

// Notifies listeners on this item
LmItem.prototype._eventNotify =
function(event, details) {
	if (this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evtMgr.notifyListeners(LmEvent.L_MODIFY, this._evt);
	}
}

// Notifies listeners on this item's list
LmItem.prototype._listNotify =
function(event, details) {
	if (this.list) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this.list._eventNotify(event, [this], details);
	}
}

LmItem.prototype._notify =
function(event, details) {
	this._eventNotify(event, details);
	if (this.list)
		this._listNotify(event, details);
}
