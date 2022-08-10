/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
