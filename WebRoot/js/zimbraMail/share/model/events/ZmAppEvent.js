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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
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

ZmAppEvent.prototype.toString =
function() {
	return "ZmAppEvent";
};
