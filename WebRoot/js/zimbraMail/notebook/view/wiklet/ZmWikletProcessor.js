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

ZmWikletProcessor = function() {
}

// Static data

ZmWikletProcessor._context;
ZmWikletProcessor._data;

// Static functions

ZmWikletProcessor.process = function(appCtxt, item, content) {
	// global values needed by _replaceWiklet
	var notebookApp = appCtxt.getApp(ZmApp.NOTEBOOK);
	var cache = notebookApp.getNotebookCache();

    ZmWikletProcessor._context = new ZmWikletContext(appCtxt, cache);
	ZmWikletProcessor._context.pushItem(item);
    ZmWikletProcessor._data = [];

    // process wiklets in content
	return ZmWikletProcessor._process(content);
};

// Protected static functions

ZmWikletProcessor._process = function(content) {
	if (!content) return "";
    content = content.replace(/(\{\{)/g, ZmWikletProcessor._store);
    content = content.replace(/<nowiklet>([.\n]*?)<\/nowiklet>/g, ZmWikletProcessor._store);
	content = content.replace(ZmWiklet.RE_WIKLET, ZmWikletProcessor._wiklet);
    content = content.replace(/\{\{(\d+)}}/g, ZmWikletProcessor._restore);
    return content;
};

ZmWikletProcessor._store = function(match, content) {
    ZmWikletProcessor._data.push(content);
    return "{{" + ZmWikletProcessor._data.length + "}}";
};

ZmWikletProcessor._wiklet = function(match, value) {
	var content = match;
    var params = ZmWikletProcessor.__parseValueAsParams(value);
    var name = params["class"].toUpperCase();
    var wiklet = ZmWiklet.getWikletByName(name);
	if (wiklet) {
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

ZmWikletProcessor._restore = function(match, number) {
    return ZmWikletProcessor._data[Number(number) - 1];
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
