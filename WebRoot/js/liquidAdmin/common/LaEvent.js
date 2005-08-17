/**
* Creates an empty event of the given type.
* @constructor
* @class
* @parameter type - the type of the source of the event
* This class represents an event that encapsulates some sort of change to a model (data).
* The event has a data type (eg conversation), an event type (eg delete), a source (the
* data object generating the event), and a hash of arbitrary information (details).
*/
function LaEvent(type) {

	this.type = type; //source type
	this.event = null; //event type
	this.source = null;
	this._details = new Object();
}

// Listener types
LaEvent.L_MODIFY = 1;
LaEvent.L_PICKER = 2;

// Source types (note: there are not separate types for list models)
var i = 1;
LaEvent.S_FOLDER		= i++;
LaEvent.S_TAG			= i++;
LaEvent.S_CONV			= i++;
LaEvent.S_MSG			= i++;
LaEvent.S_ATT			= i++;
LaEvent.S_CONTACT		= i++;
LaEvent.S_APPT			= i++;
LaEvent.S_NOTE			= i++;
LaEvent.S_PICKER		= i++;
LaEvent.S_SEARCH		= i++;
LaEvent.S_SETTING		= i++;

//Source types for admin
LaEvent.S_ACCOUNT		= i++;
LaEvent.S_COS			= i++;
LaEvent.S_DOMAIN		= i++;
LaEvent.S_SERVER		= i++;
LaEvent.S_GLOBALCONFIG	= i++;
LaEvent.S_STATUS	= i++;

// Event types
i = 1;
LaEvent.E_CREATE		= i++;
LaEvent.E_DELETE		= i++;
LaEvent.E_MODIFY		= i++;
LaEvent.E_LOAD			= i++;
LaEvent.E_REMOVE		= i++;
LaEvent.E_REMOVE_ALL	= i++;
LaEvent.E_RENAME		= i++;
LaEvent.E_MOVE			= i++;
LaEvent.E_FLAGS			= i++;
LaEvent.E_ADD_TAG		= i++;
LaEvent.E_REMOVE_TAG	= i++;

// Public methods

LaEvent.prototype.toString = 
function() {
	return "LaEvent";
}

/**
* Sets the event type and source.
*
* @param event		event type
* @param source		object that generated the event (typically "this")
*/
LaEvent.prototype.set =
function(event, source) {
	this.event = event; 
	this.source = source; 
}

/**
* Adds an arbitrary bit of info to the event.
*
* @param field		the detail's name
* @param value		the detail's value
*/
LaEvent.prototype.setDetail =
function(field, value) {
	this._details[field] = value;
}

/**
* Returns an arbitrary bit of info from the event.
*
* @param field		the detail's name
*/
LaEvent.prototype.getDetail =
function(field) {
	return this._details[field];
}

/**
* Sets the event details. Any existing details will be lost.
*
* @param details	a hash representing event details
*/
LaEvent.prototype.setDetails =
function(details) {
	this._details = details ? details : new Object();
}

/**
* Returns the event details.
*/
LaEvent.prototype.getDetails =
function() {
	return this._details;
}
