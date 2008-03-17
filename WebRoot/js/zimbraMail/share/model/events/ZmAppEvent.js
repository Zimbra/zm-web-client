/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty app event.
 * @constructor
 * @class
 * This class represents an event related to a change of state for an individual
 * app, or for ZCS as a whole.
 * 
 * @param app	[constant]		the app to which this event applies; if null, the event
 * 								applies to ZCS
 */
ZmAppEvent = function(app) {
	ZmEvent.call(this);
}

ZmAppEvent.prototype = new ZmEvent;
ZmAppEvent.prototype.constructor = ZmAppEvent;

ZmAppEvent.POST_STARTUP	= "POSTSTARTUP";
ZmAppEvent.PRE_LAUNCH	= "PRELAUNCH";
ZmAppEvent.POST_RENDER	= "POSTRENDER";
ZmAppEvent.ACTIVATE	= "ACTIVATE";

ZmAppEvent.prototype.toString =
function() {
	return "ZmAppEvent";
};
