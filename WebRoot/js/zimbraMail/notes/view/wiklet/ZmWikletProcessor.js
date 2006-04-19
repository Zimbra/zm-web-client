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

function ZmWikletProcessor() {
}

// Static data

ZmWikletProcessor._context;

// Static functions

ZmWikletProcessor.process = function(appCtxt, note, content) {
	// global values needed by _replaceWiklet
	var notesApp = appCtxt.getApp(ZmZimbraMail.NOTES_APP);
	var cache = notesApp.getNoteCache();
	
	ZmWikletProcessor._context = new ZmWikletContext(appCtxt, cache);
	ZmWikletProcessor._context.pushItem(note);
	
	// process wiklets in content
	return ZmWikletProcessor._process(content);
};

// Protected static functions

ZmWikletProcessor._process = function(content) {
	if (!content) return "";
	var regex = /(?=^|[^\\])\{\{\s*(.+?)(?:\s+(.*?))?\s*\}\}/g;
	return content.replace(regex, ZmWikletProcessor._replace);
};

ZmWikletProcessor._replace = function(match, name, value) {
	var content = match;
	var wiklet = ZmWiklet.getWikletByName(name);
	if (wiklet) {
		var params = ZmWikletProcessor.__parseValueAsParams(value);
		var context = ZmWikletProcessor._context;

		var length = context.getItemCount();
		try {
			content = wiklet.func(name, value, params, context);
			content = ZmWikletProcessor._process(content);
		}
		catch (e) {
			DBG.println("error when processing wiklets: "+e);
		}
		context.setItemCount(length);
	}
	return content;
};

// Private static functions

ZmWikletProcessor.__parseValueAsParams = function(s) {
	var params = {};

	var re = /([a-z]+)\s*=\s*(?:'(.*?)'|"(.*?)"|(\S+))/ig;
	var m;
	while (m = re.exec(s)) {
		var pname = m[1].toLowerCase();
		var pvalue = m[2] || m[3] || m[4] | "";
		params[pname] = pvalue;
	}
	
	return params;
};
