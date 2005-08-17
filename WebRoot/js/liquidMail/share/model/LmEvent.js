/**
* Creates an empty event of the given type.
* @constructor
* @class
* @parameter type - the type of the source of the event
* This class represents an event that encapsulates some sort of change to a model (data).
* The event has a data type (eg conversation), an event type (eg delete), a source (the
* data object generating the event), and a hash of arbitrary information (details).
*/
function LmEvent(type) {

	this.type = type; //source type
	this.event = null; //event type
	this.source = null;
	this._details = new Object();
}

// Listener types
LmEvent.L_MODIFY = 1;
LmEvent.L_PICKER = 2;

// Source types (note: there are not separate types for list models)
var i = 1;
LmEvent.S_FOLDER		= i++;
LmEvent.S_TAG			= i++;
LmEvent.S_CONV			= i++;
LmEvent.S_MSG			= i++;
LmEvent.S_ATT			= i++;
LmEvent.S_CONTACT		= i++;
LmEvent.S_APPT			= i++;
LmEvent.S_NOTE			= i++;
LmEvent.S_PICKER		= i++;
LmEvent.S_SEARCH		= i++;
LmEvent.S_SETTING		= i++;

//Source types for admin
LmEvent.S_ACCOUNT		= i++;
LmEvent.S_COS			= i++;
LmEvent.S_DOMAIN		= i++;
LmEvent.S_SERVER		= i++;
LmEvent.S_GLOBALCONFIG	= i++;
LmEvent.S_STATUS		= i++;

// Event types
i = 1;
LmEvent.E_CREATE		= i++;
LmEvent.E_DELETE		= i++;
LmEvent.E_MODIFY		= i++;
LmEvent.E_LOAD			= i++;
LmEvent.E_REMOVE		= i++;
LmEvent.E_REMOVE_ALL	= i++;
LmEvent.E_RENAME		= i++;
LmEvent.E_MOVE			= i++;
LmEvent.E_FLAGS			= i++;
LmEvent.E_TAGS			= i++;

// Public methods

LmEvent.prototype.toString = 
function() {
	return "LmEvent";
}

/**
* Sets the event type and source.
*
* @param event		event type
* @param source		object that generated the event (typically "this")
*/
LmEvent.prototype.set =
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
LmEvent.prototype.setDetail =
function(field, value) {
	this._details[field] = value;
}

/**
* Returns an arbitrary bit of info from the event.
*
* @param field		the detail's name
*/
LmEvent.prototype.getDetail =
function(field) {
	return this._details[field];
}

/**
* Sets the event details. Any existing details will be lost.
*
* @param details	a hash representing event details
*/
LmEvent.prototype.setDetails =
function(details) {
	this._details = details ? details : new Object();
}

/**
* Returns the event details.
*/
LmEvent.prototype.getDetails =
function() {
	return this._details;
}
