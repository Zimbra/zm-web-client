/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmTimezone = function() {}

// Static methods

ZmTimezone.getDefault = function() {
	var shell = DwtShell.getShell(window);
	var serverId = appCtxt.get(ZmSetting.DEFAULT_CALENDAR_TIMEZONE);
	var clientId = serverId ? AjxTimezone.getClientId(serverId) : AjxTimezone.DEFAULT;
	return clientId;
};

ZmTimezone.getDefaultRule = function() {
	var clientId = ZmTimezone.getDefault();
	var timezone = AjxTimezone.getRule(clientId);
	return timezone;
};

/**
 * This function mirrors the <code>AjxSoapDoc#set</code> method
 * to add a timezone element at the specific place within the
 * given SOAP document. The added element takes the form of the
 * <code>&lt;tz></code> element as defined for SearchRequest
 * in ZimbraServer/docs/soap.txt.
 * </pre>
 *
 * @param request			[object|AjxSoapDoc]	The JSON request object, or soap document.
 * @param timezoneClientId	[string]			The client identifer.
 * @param parentNode		[Node]				(optional) The parent
 * 												node at which to add.
 * @param skipKnownTimezone	[boolean]			(optional) If set,
 *												doesn't add the "tz"
 *												element if it's one of
 *												the known set.
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
