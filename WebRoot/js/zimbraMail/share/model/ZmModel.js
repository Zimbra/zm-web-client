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
