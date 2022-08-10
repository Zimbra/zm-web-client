/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
