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
* Creates an empty event of the given type.
* @constructor
* @class
* @parameter type - the type of the source of the event
* This class represents an event that encapsulates some sort of change to a model (data).
* The event has a data type (eg conversation), an event type (eg delete), a source (the
* data object generating the event), and a hash of arbitrary information (details).
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
ZmEvent.S_FOLDER		= "FOLDER";
ZmEvent.S_TAG			= "TAG";
ZmEvent.S_NOTE			= "NOTE";
ZmEvent.S_PICKER		= "PICKER";
ZmEvent.S_SEARCH		= "SEARCH";
ZmEvent.S_SETTING		= "SETTING";
ZmEvent.S_MOUNTPOINT	= "MOUNTPOINT";

// Event types
ZmEvent.E_CREATE		= "CREATE";
ZmEvent.E_DELETE		= "DELETE";
ZmEvent.E_MODIFY		= "MODIFY";
ZmEvent.E_LOAD			= "LOAD";
ZmEvent.E_REMOVE		= "REMOVE";
ZmEvent.E_REMOVE_ALL	= "REMOVE ALL";
ZmEvent.E_MOVE			= "MOVE";
ZmEvent.E_FLAGS			= "FLAGS";
ZmEvent.E_TAGS			= "TAGS";
ZmEvent.E_ZIMLETS		= "ZIMLET";

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
	this.handled = false;
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