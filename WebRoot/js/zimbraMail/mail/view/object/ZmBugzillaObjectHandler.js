/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmBugzillaObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt, ZmBugzillaObjectHandler.TYPE);
};

ZmBugzillaObjectHandler.TYPE = "bugz";

ZmBugzillaObjectHandler.prototype = new ZmObjectHandler;
ZmBugzillaObjectHandler.prototype.constructor = ZmBugzillaObjectHandler;

ZmBugzillaObjectHandler.bug_re = /\bbug(?:zilla)?:?\s*#?(\d+)\b/g;
ZmBugzillaObjectHandler.bug_url = "http://bugzilla.liquidsys.com/show_bug.cgi?ctype=xml&id=";

ZmBugzillaObjectHandler.bug_items = new Array(
	"bug_id", "ID",
	"bug_status", "Status",
	"priority", "Priority",
	"bug_severity", "Severity",
	"product", "Product",
	"component", "Component",
	"version", "Version",
	"reporter", "Reporter",
	"assigned_to", "Owner",
	"short_desc", "Description"
);

ZmBugzillaObjectHandler.prototype.match =
function(line, startIndex) {
	ZmBugzillaObjectHandler.bug_re.lastIndex = startIndex;
	var match = ZmBugzillaObjectHandler.bug_re.exec(line);
	if (match != null) {
		match.context = match[1];
	}
	return match;
};

ZmBugzillaObjectHandler._callback =
function(args) {
	var resp = args[1].text;
	for (i = 0; i < ZmBugzillaObjectHandler.bug_items.length; i += 2) {
		// XXX maybe properly parse the xml into DOM
		var key = ZmBugzillaObjectHandler.bug_items[i];
		var item_s = resp.indexOf("<"+key+">");
		var item_e = resp.indexOf("</"+key+">");
		var val = "";
		if (item_s > 0 && item_e > 0) {
			val = "<b>"+ZmBugzillaObjectHandler.bug_items[i+1]+": </b>"+resp.substring(item_s+key.length+2, item_e);
			document.getElementById(ZmBugzillaObjectHandler.encodeId(args[0], key)).innerHTML=val;
		}
	}
};

ZmBugzillaObjectHandler.generateTooltipText =
function(obj) {
	var ret = "";
	for (i = 0; i < this.bug_items.length; i += 2) {
		var key = this.bug_items[i];
		var text = this.bug_items[i+1];
		ret += "<div id=\""+this.encodeId(obj, key)+"\"><b>"+text+": </b></div>";
	}
	return ret;
};

ZmBugzillaObjectHandler.prototype.getToolTipText =
function(obj, context) {
	var request = new AjxRpcRequest("bugzilla");
	var url = "/service/proxy?target="+AjxStringUtil.urlEncode(ZmBugzillaObjectHandler.bug_url+context);
	request.invoke(null, url, null, new AjxCallback(this, ZmBugzillaObjectHandler._callback, context), true);
	return ZmBugzillaObjectHandler.generateTooltipText(context);
};

ZmBugzillaObjectHandler.encodeId =
function(obj, key) {
	return "bugz"+obj+"_"+key;
};
