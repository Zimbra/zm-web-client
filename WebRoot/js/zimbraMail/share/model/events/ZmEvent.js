/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines an event.
 *
 */

/**
 * Creates an empty event of the given type.
 * @class
 * This class represents an event that encapsulates some sort of change to a model (data).
 * The event has a data type (for example, conversation), an event type (for example, delete), a source (the
 * data object generating the event), and a hash of arbitrary information (details).
 * 
 * @param {constant}		type	the source of the event
 */
ZmEvent = function(type) {

	this.type = type;	// source type (conv, msg, contact, folder, etc)
	this.event = null;	// event type (create, modify, etc)
	this.source = null;	// notifying model (often a list)
	this.item = null;	// item that is subject of the notification
	this._details = {};
}

// Listener types
ZmEvent.L_MODIFY = 1;
ZmEvent.L_PICKER = 2;

// Source types (note: there are not separate types for list models)
ZmEvent.S_TAG			= "TAG";
ZmEvent.S_PICKER		= "PICKER";
ZmEvent.S_SEARCH		= "SEARCH";
ZmEvent.S_SETTING		= "SETTING";
ZmEvent.S_SETTINGS		= "SETTINGS";
ZmEvent.S_MOUNTPOINT	= "MOUNTPOINT";
ZmEvent.S_ZIMLET		= "ZIMLET";

// Event types
/**
 * Defines the "create" event type.
 */
ZmEvent.E_CREATE		= "CREATE";
/**
 * Defines the "delete" event type.
 */
ZmEvent.E_DELETE		= "DELETE";
/**
 * Defines the "modify" event type.
 */
ZmEvent.E_MODIFY		= "MODIFY";
/**
 * Defines the "load" event type.
 */
ZmEvent.E_LOAD			= "LOAD";
/**
 * Defines the "remove" event type.
 */
ZmEvent.E_REMOVE		= "REMOVE";
/**
 * Defines the "remove all" event type.
 */
ZmEvent.E_REMOVE_ALL	= "REMOVE ALL";
/**
 * Defines the "move" event type.
 */
ZmEvent.E_MOVE			= "MOVE";
/**
 * Defines the "flags" event type.
 */
ZmEvent.E_FLAGS			= "FLAGS";
/**
 * Defines the "tags" event type.
 */
ZmEvent.E_TAGS			= "TAGS";
/**
 * Defines the "zimlets" event type.
 */
ZmEvent.E_ZIMLETS		= "ZIMLET";
/**
 * Defines the "complete" event type.
 */
ZmEvent.E_COMPLETE		= "COMPLETE";

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmEvent.prototype.toString = 
function() {
	return "ZmEvent";
};

/**
 * Sets the event type and source.
 *
 * @param {constant}	event	the event type (see <code>ZmEvent.E_</code> constants)
 * @param {Object}	source		the object that generated the event (typically "this")
 */
ZmEvent.prototype.set =
function(event, source) {
	this.event = event;
	this.source = source;
	this.handled = false;
};

/**
 * Adds info to the event details.
 *
 * @param {String}		field		the detail name
 * @param {Object}		value		the detail value
 */
ZmEvent.prototype.setDetail =
function(field, value) {
	this._details[field] = value;
};

/**
 * Gets info from the event details.
 *
 * @param {String}	field		the detail field name
 * @return	{Object}	the details
 */
ZmEvent.prototype.getDetail =
function(field) {
	return this._details[field];
};

/**
 * Gets items by checking for a detail with a name of "items" and returning it.
 * 
 * @return	{Array}		an array of items or empty array if "items" does not exist
 */
ZmEvent.prototype.getItems =
function() {
    var items = this._details["items"];
    return items ? items : [];
};

/**
 * Sets the event details. Any existing details will be lost.
 *
 * @param {Hash}	details		a hash representing event details
 */
ZmEvent.prototype.setDetails =
function(details) {
	this._details = details ? details : {};
};

/**
 * Gets the event details.
 * 
 * @return	{Hash}	the event details
 */
ZmEvent.prototype.getDetails =
function() {
	return this._details;
};
