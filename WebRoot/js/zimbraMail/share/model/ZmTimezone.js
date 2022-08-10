/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the timezone class.
 */

/**
 * Creates a timezone
 * @class
 * This class represents a timezone.
 * 
 */
ZmTimezone = function() {}

// Static methods

/**
 * Gets the default timezone.
 * 
 * @return	{AjxTimezone}	the timezone
 */
ZmTimezone.getDefault =
function() {
	var shell = DwtShell.getShell(window);
	var serverId = appCtxt.get(ZmSetting.DEFAULT_TIMEZONE);
	return (serverId) ? AjxTimezone.getClientId(serverId) : AjxTimezone.DEFAULT;
};

/**
 * Gets the default rule.
 * 
 * @return	{String}	the rule
 */
ZmTimezone.getDefaultRule =
function() {
	return AjxTimezone.getRule(ZmTimezone.getDefault());
};

/**
 * This function mirrors the <code>AjxSoapDoc#set</code> method
 * to add a timezone element at the specific place within the
 * given SOAP document. The added element takes the form of the
 * <code>&lt;tz></code> element as defined for <code>&lt;SearchRequest&gt;</code>.
 *
 * @param {object|AjxSoapDoc}	request			the JSON request object or SOAP document
 * @param {String}	timezoneClientId	the client identifier
 * @param {Node}	parentNode		(optional) the parent node at which to add
 * @param {Boolean}	skipKnownTimezone	(optional) if <code>true</code>, does not add the "tz" element if it's one of the known set
 */
ZmTimezone.set =
function(request, timezoneClientId, parentNode, skipKnownTimezone) {
	var timezone = AjxTimezone.getRule(timezoneClientId);
	if (!timezone) { return; }

	if (timezone.autoDetected || !skipKnownTimezone) {
		if (request instanceof AjxSoapDoc) {
			ZmTimezone._setSoap(request, timezoneClientId, parentNode, timezone);
		} else {
			ZmTimezone._setJson(request, timezoneClientId, timezone);
		}
	}
};

/**
 * @private
 */
ZmTimezone._setSoap =
function(soapDoc, timezoneClientId, parentNode, timezone) {
	var tz = soapDoc.set("tz", null, parentNode);
	var id = AjxTimezone.getServerId(timezoneClientId);
	tz.setAttribute("id", id);
	if (timezone.autoDetected) {
		tz.setAttribute("stdoff", timezone.standard.offset);
		if (timezone.daylight) {
			tz.setAttribute("dayoff", timezone.daylight.offset);
            var enames = [ "standard", "daylight" ];
            var pnames = [ "mon", "mday", "week", "wkday", "hour", "min", "sec" ];
            for (var i = 0; i < enames.length; i++) {
                var ename = enames[i];
                var onset = timezone[ename];
                
                var el = soapDoc.set(ename, null, tz);
                for (var j = 0; j < pnames.length; j++) {
                    var pname = pnames[j];
                    if (pname in onset) {
                        el.setAttribute(pname, onset[pname]);
                    }
                }
            }
        }
	}
};

/**
 * @private
 */
ZmTimezone._setJson =
function(request, timezoneClientId, timezone) {
	var id = AjxTimezone.getServerId(timezoneClientId);
	var tz = request.tz = {id:id};
	if (timezone.autoDetected) {
		tz.stdoff = timezone.standard.offset;
		if (timezone.daylight) {
			tz.dayoff = timezone.daylight.offset;
            var enames = [ "standard", "daylight" ];
            var pnames = [ "mon", "mday", "week", "wkday", "hour", "min", "sec" ];
            for (var i = 0; i < enames.length; i++) {
                var ename = enames[i];
                var onset = timezone[ename];
                tz[ename] = {};
                for (var j = 0; j < pnames.length; j++) {
                    var pname = pnames[j];
                    if (pname in onset) {
                    	tz[ename][pname] = onset[pname];
                    }
                }
            }
        }
	}
};
