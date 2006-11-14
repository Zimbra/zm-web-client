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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTimezone() {
}

// Static methods

ZmTimezone.getDefault = function() {
	var shell = DwtShell.getShell(window);
	var appCtxt = ZmAppCtxt.getFromShell(shell);
	var serverId = appCtxt.get(ZmSetting.DEFAULT_CALENDAR_TIMEZONE);
	var clientId = serverId ? AjxTimezone.getClientId(serverId) : AjxTimezone.DEFAULT;
	return clientId;
};
ZmTimezone.getDefaultRule = function() {
	var clientId = ZmTimezone.getDefault();
	var rule = AjxTimezone.getRule(clientId);
	return rule;
};

/**
 * This function mirrors the <code>AjxSoapDoc#set</code> method
 * to add a timezone element at the specific place within the
 * given SOAP document. The added element takes the form of the
 * <code>&lt;tz></code> element as defined for SearchRequest
 * in ZimbraServer/docs/soap.txt.
 * </pre>
 *
 * @param soapDoc			[AjxSoapDoc]	The soap document.
 * @param timezoneClientId	[string]		The client identifer.
 * @param parentNode		[Node]			(optional) The parent
 * 											node at which to add.
 * @param skipKnownTimezone	[boolean]		(optional) If set,
 *											doesn't add the "tz"
 *											element if it's one of
 *											the known set.
 */
ZmTimezone.set =
function(soapDoc, timezoneClientId, parentNode, skipKnownTimezone) {
	var rule = AjxTimezone.getRule(timezoneClientId);
	if (!rule) return;

	if (rule.autoDetected || !skipKnownTimezone) {
		var tz = soapDoc.set("tz", null, parentNode);
		var id = AjxTimezone.getServerId(timezoneClientId);
		if (AjxEnv.isSafari) id = AjxStringUtil.xmlEncode(id);
		tz.setAttribute("id", id);
		if (rule.autoDetected) {
			tz.setAttribute("stdoff", rule.stdOffset);
			if (rule.dstOffset) {
				tz.setAttribute("dayoff", rule.dstOffset);
				var trans = [
					{ ename: "standard", change: rule.changeStd },
					{ ename: "daylight", change: rule.changeD }
				];
				for (var i = 0; i < trans.length; i++) {
					var tran = trans[i];
					var ename = tran.ename;
					var change = tran.change;

					var el = soapDoc.set(ename, null, tz);
					// NOTE: JS months are 0-based but SOAP is 1-based.
					el.setAttribute("mon", change[1] + 1);
					el.setAttribute("mday", change[2]);
					el.setAttribute("hour", change[3]);
					el.setAttribute("min", change[4]);
					el.setAttribute("sec", change[5]);
				}
			}
		}
	}
};