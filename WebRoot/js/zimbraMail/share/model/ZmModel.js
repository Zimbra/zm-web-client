/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * This class represents a data model which can process change events.
 *
 */

/**
 * Creates the data model.
 * @class
 * This class represents a data model which can process change events.
 * 
 * @author Conrad Damon
 *
 * @param {constant}		type	the event source type {@see ZmEvent}
 */
ZmModel = function(type) {
 	if (arguments.length == 0) return;

	this._evt = new ZmEvent(type);
	this._evtMgr = new AjxEventMgr();
}

ZmModel.prototype.isZmModel = true;
ZmModel.prototype.toString = function() { return "ZmModel"; }

/**
* Adds a change listener.
*
* @param {AjxListener}	listener	the change listener to add
*/
ZmModel.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(ZmEvent.L_MODIFY, listener);
}

/**
* Removes the given change listener.
*
* @param {AjxListener}	listener		the change listener to remove
*/
ZmModel.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(ZmEvent.L_MODIFY, listener);    	
}

/**
* Removes all change listeners.
* 
*/
ZmModel.prototype.removeAllChangeListeners = 
function() {
	return this._evtMgr.removeAll(ZmEvent.L_MODIFY);    	
}

/**
* Notifies listeners of the given change event.
*
* @param {constant}		event		the event type {@see ZmEvent}
* @param {Hash}			details		additional information
* 
* @private
*/
ZmModel.prototype._notify =
function(event, details) {
	if (this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evtMgr.notifyListeners(ZmEvent.L_MODIFY, this._evt);
	}
};

/**
 * @private
 */
ZmModel.notifyEach =
function(list, event, details) {
	if (!(list && list.length)) { return; }
	for (var i = 0; i < list.length; i++) {
		list[i]._notify(event, details);
	}
};
