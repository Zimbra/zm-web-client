/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty event of the given type.
* @constructor
* @class
* @parameter type - the type of the source of the event
* This class represents an event that encapsulates some sort of change to a model (data).
* The event has a data type (eg conversation), an event type (eg delete), a source (the
* data object generating the event), and a hash of arbitrary information (details).
*/
function ZmEvent(type) {

	this.type = type; //source type
	this.event = null; //event type
	this.source = null;
	this._details = {};
}

// Listener types
ZmEvent.L_MODIFY = 1;
ZmEvent.L_PICKER = 2;

// Source types (note: there are not separate types for list models)
var i = 1;
ZmEvent.S_FOLDER			= i++;
ZmEvent.S_TAG				= i++;
ZmEvent.S_CONV				= i++;
ZmEvent.S_MSG				= i++;
ZmEvent.S_ATT				= i++;
ZmEvent.S_CONTACT			= i++;
ZmEvent.S_GROUP				= i++;
ZmEvent.S_APPT				= i++;
ZmEvent.S_NOTE				= i++;
ZmEvent.S_PAGE				= i++;
ZmEvent.S_DOCUMENT			= i++;
ZmEvent.S_NOTEBOOK			= i++;
ZmEvent.S_PICKER			= i++;
ZmEvent.S_SEARCH			= i++;
ZmEvent.S_SETTING			= i++;
ZmEvent.S_ZIMLET			= i++;
ZmEvent.S_FILTER			= i++;
ZmEvent.S_CHAT        		= i++;
ZmEvent.S_ROSTER			= i++;
ZmEvent.S_ROSTER_ITEM		= i++;
ZmEvent.S_ROSTER_TREE_ITEM	= i++;
ZmEvent.S_ROSTER_TREE_GROUP	= i++;
ZmEvent.S_RESOURCE			= i++;
ZmEvent.S_MOUNTPOINT		= i++;
ZmEvent.S_DATA_SOURCE       = i++;
ZmEvent.S_IDENTITY       	= i++;

//Source types for admin
ZmEvent.S_ACCOUNT		= i++;
ZmEvent.S_COS			= i++;
ZmEvent.S_DOMAIN		= i++;
ZmEvent.S_SERVER		= i++;
ZmEvent.S_GLOBALCONFIG	= i++;
ZmEvent.S_STATUS		= i++;

ZmEvent.S_MAX			= i - 1;

// Event types
i = 1;
ZmEvent.E_CREATE		= i++;
ZmEvent.E_DELETE		= i++;
ZmEvent.E_MODIFY		= i++;
ZmEvent.E_LOAD			= i++;
ZmEvent.E_REMOVE		= i++;
ZmEvent.E_REMOVE_ALL	= i++;
ZmEvent.E_MOVE			= i++;
ZmEvent.E_FLAGS			= i++;
ZmEvent.E_TAGS			= i++;
ZmEvent.E_CALENDARS		= i++;
ZmEvent.E_ZIMLETS		= i++;

// Public methods

ZmEvent.prototype.toString = 
function() {
	return "ZmEvent";
};

/**
* Sets the event type and source.
*
* @param event		event type
* @param source		object that generated the event (typically "this")
*/
ZmEvent.prototype.set =
function(event, source) {
	this.event = event; 
	this.source = source; 
};

/**
* Adds an arbitrary bit of info to the event.
*
* @param field		the detail's name
* @param value		the detail's value
*/
ZmEvent.prototype.setDetail =
function(field, value) {
	this._details[field] = value;
};

/**
* Returns an arbitrary bit of info from the event.
*
* @param field		the detail's name
*/
ZmEvent.prototype.getDetail =
function(field) {
	return this._details[field];
};

/**
* looks for a detail with a name of "items", and returns it, or an
* empty array if it doesn't exist.
*
* @param field		the detail's name
*/
ZmEvent.prototype.getItems =
function() {
    var items = this._details["items"];
    return items ? items : [];
};

/**
* Sets the event details. Any existing details will be lost.
*
* @param details	a hash representing event details
*/
ZmEvent.prototype.setDetails =
function(details) {
	this._details = details ? details : {};
};

/**
* Returns the event details.
*/
ZmEvent.prototype.getDetails =
function() {
	return this._details;
};