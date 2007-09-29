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
* Creates a data model.
* @constructor
* @class
* This class represents a data model which can process change events.
*
* @author Conrad Damon
*
* @param type	[constant]		event source type (see ZmEvent)
*/
function ZmModel(type) {
 	if (arguments.length == 0) return;

	this._evt = new ZmEvent(type);
	this._evtMgr = new AjxEventMgr();
}

ZmModel.prototype.toString = 
function() {
	return "ZmModel";
}

/**
* Adds a change listener.
*
* @param listener	[AjxListener]	a listener
*/
ZmModel.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(ZmEvent.L_MODIFY, listener);
}

/**
* Removes the given change listener.
*
* @param listener	[AjxListener]	a listener
*/
ZmModel.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(ZmEvent.L_MODIFY, listener);    	
}

/**
* Removes all change listeners.
*/
ZmModel.prototype.removeAllChangeListeners = 
function() {
	return this._evtMgr.removeAll(ZmEvent.L_MODIFY);    	
}

/**
* Notifies listeners of the given change event.
*
* @param event		[constant]		event type (see ZmEvent)
* @param details	[hash]*			additional information
*/
ZmModel.prototype._notify =
function(event, details) {
	if (this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evtMgr.notifyListeners(ZmEvent.L_MODIFY, this._evt);
	}
};
