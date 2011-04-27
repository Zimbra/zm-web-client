/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines an application event.
 *
 */

/**
 * Creates an empty application event.
 * @class
 * This class represents an event related to a change of state for an individual
 * application or for ZCS as a whole.
 * 
 * @param {Object}	the application to which this event applies; if <code>null</code>, the event applies to ZCS
 * 
 * @extends		ZmEvent
 */
ZmAppEvent = function(app) {
	ZmEvent.call(this);
};

ZmAppEvent.prototype = new ZmEvent;
ZmAppEvent.prototype.constructor = ZmAppEvent;

/**
 * Event used to notify listeners before startup (i.e. before the first
 * app is activated). This is a bit of a misnomer because this event occurs
 * after the apps are initialized but before the first app is shown. This
 * allows code to be executed after the apps have registered settings
 * but before the app actually acts on those settings.
 *
 * @see ZmAppEvent.POST_STARTUP
 */
ZmAppEvent.PRE_STARTUP	= "PRESTARTUP";

/**
 * Defines the event used to notify listeners post-startup.
 */
ZmAppEvent.POST_STARTUP	= "POSTSTARTUP";
/**
 * Defines the event used to notify listeners pre-launch.
 */
ZmAppEvent.PRE_LAUNCH	= "PRELAUNCH";
/**
 * Defines the event used to notify listeners post-launch.
 */
ZmAppEvent.POST_LAUNCH	= "POSTLAUNCH";
/**
 * Defines the event used to notify listeners post-render.
 */
ZmAppEvent.POST_RENDER	= "POSTRENDER";

ZmAppEvent.ACTIVATE	= "ACTIVATE";

// Triggered after processing of an async response finishes
ZmAppEvent.RESPONSE = "RESPONSE";

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAppEvent.prototype.toString =
function() {
	return "ZmAppEvent";
};
