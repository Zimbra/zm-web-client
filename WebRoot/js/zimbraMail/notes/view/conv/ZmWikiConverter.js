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

//
// ZmWikiConverter class
//

function ZmWikiConverter() {}

// Static data

ZmWikiConverter._data;

// Public functions

ZmWikiConverter.convert = function(s, rules) {
	ZmWikiConverter._data = [];
	for (var i in rules) {
		var rule = rules[i];
		s = s.replace(rule.input, rule.output || "");
	}
	return s;
};
ZmWikiConverter.store = function(s) {
	ZmWikiConverter._data.push(s);
	return "{{" + ZmWikiConverter._data.length + "}}";
};
ZmWikiConverter.restore = function(id) {
	return ZmWikiConverter._data[id];
};

function MediaWiki() {}
MediaWiki._LIST = {
	open: {
		item: { "*" : "<li>", "#" : "<li>", ";" : "<dt>", ":" : "<dd>" },
		list: { "*" : "<ul>", "#" : "<ol>", ";" : "<dl>", ":" : "<dl>" }
	},
	close: {
		item: { "*" : "</li>", "#" : "</li>", ";" : "</dt>", ":" : "</dd>" },
		list: { "*" : "</ul>", "#" : "</ol>", ";" : "</dl>", ":" : "</dl>" }
	}
};

// Replacement functions (note: are executed in scope of converter object)

MediaWiki._header = function(match, level, content) {
	return [ "<h", level.length, ">", content, "</h", level.length, ">\n" ].join("");
};
MediaWiki._list = function(match, level, content) {
	return [ "{{", level, "}", content, "{", level, "}}\n" ].join("");
};
MediaWiki._listTransition = function(match, close, open) {
	var offset = 0;
	var length = close.length < open.length ? close.length : open.length;

	while (offset < length) {
	    var oc = open.charAt(offset);
	    var cc = close.charAt(offset);
	    oc = oc == ';' ? ':' : oc;
	    cc = cc == ';' ? ':' : cc;
		if (oc != cc) {
			break;
		}
		offset++;
	}

	var a = [];
	for (var i = close.length - 1; i >= offset; i--) {
		var type = close.charAt(i);
		a.push(MediaWiki._LIST.close.item[type]);
		a.push(MediaWiki._LIST.close.list[type]);
	}
	for (var i = offset; i < open.length; i++) {
		var type = open.charAt(i);
		a.push(MediaWiki._LIST.open.list[type]);
		a.push(MediaWiki._LIST.open.item[type]);
	}

    if (close.length == open.length) {
		var type = close.charAt(close.length - 1);
		a.push(MediaWiki._LIST.close.item[type]);
	}
	var type = close.charAt(open.length - 1);
	a.push(MediaWiki._LIST.open.item[type]);

	return a.join("");
};
MediaWiki._listBoundary = function(match, open, content, close) {
    var a = [];
	for (var i = 0; i < open.length; i++) {
	    var type = open.charAt(i);
		a.push(MediaWiki._LIST.open.list[type]);
		a.push(MediaWiki._LIST.open.item[type]);
	}
	a.push(content);
	for (var i = close.length - 1; i >= 0; i--) {
		var type = close.charAt(i);
		a.push(MediaWiki._LIST.close.item[type]);
		a.push(MediaWiki._LIST.close.list[type]);
	}
	return a.join("");
}
MediaWiki._paragraph = function(match) {
	return [ match.substr(1), "<p>" ].join("");
};

// Rule set

MediaWiki.rules = [
	// pre-processing
	{ input: /\r?\n/g, output: "\n" },
	{ input: /\\(\{)/g, output: function($0,$1) { return ZmWikiConverter.store($1); } },
	{ input: /\{\{/g, output: function($0) { return ZmWikiConverter.store($0); } },
	// non-wiki stuff
	{ input: /<pre>.*?<\/pre>/g, output: function($0) { return ZmWikiConverter.store($0); } },
	// literals
	{ input: /&[^;]+?;/g, output: function($0) { return ZmWikiConverter.store($0); } },
	{ input: /&/g, output: "&amp;" },
	{ input: /<\s/g, output: function($0) { return ZmWikiConverter.store($0); } },
	// inlines
	{ input: /'''''(.+?)'''''/g, output: "<strong><em>$1</em></strong>" },
	{ input: /'''(.+?)'''/g, output: "<strong>$1</strong>" },
	{ input: /''(.+?)''/g, output: "<em>$1</em>" },
	// links
	{ input: /\[\[.+?\]\]/g, output: function($0) { ZmWikiConverter.store($0); } },
	{ input: /\[([^\s]+)\s+([^\]]+)\]/g, output: "<a href='$1'>$2</a>" },
	{ input: /\[([^\]]+)\]/g, output: "<a href='$1'>$1</a>" },
	// headers
	{ input: /(?:^|\n)(={1,4})(.*?)={1,4}/g, output: MediaWiki._header },
	// horizontal rule
	{ input: /(?:^|\n)-{4}(?=\n|$)/g, output: "\n<hr>\n" },
	// lists
	{ input: /(?:^|\n)([*#;:]*)(;[^:]*?)(:.*?)(?:\n|$)/g, output: "$1$2$1$3\n" },
	{ input: /(?:^|\n)([*#;:]+)(.*?)(?=\n|$)/g, output: MediaWiki._list },
	{ input: /\{([*#;:]+)\}\}\n\{\{([*#;:]+)\}/g, output: MediaWiki._listTransition },
	{ input: /\{\{([*#;:]+)\}(.*?)\{([*#;:]+)\}\}/g, output: MediaWiki._listBoundary },
	// tables
	{ input: /(?:^|\n)\{\|(.*?)(?=\n|$)/g, output: "<table $1>\n" },
	{ input: /(?:^|\n)\|\}(?=\n|$)/g, output: "</table>\n" },
	{ input: /(?:^|\n)\|-(.*?)(?=\n|$)/g, output: "<tr $1>\n" },
	{ input: /(?:^|\n)\!([^\|]+?)\|(.*?)(?=\n|$)/g, output: "<th $1>$2\n" },
	{ input: /(?:^|\n)\!(.*?)(?=\n|$)/g, output: "<th>$1\n" },
	{ input: /(?:^|\n)\|([^\|]+?)\|(.*?)(?=\n|$)/g, output: "<td $1>$2\n" },
	{ input: /(?:^|\n)\|(.*?)(?=\n|$)/g, output: "<td>$1\n" },
	// paragraphs
	{ input: /(\n{2,})/g, output: MediaWiki._paragraph },
	// post-processing
	{ input: /\{\{(\d+)\}\}/g, output: function($0,$1) { return ZmWikiConverter.restore($1); } },
	{ input: /^\n|\n$/, output: "" }
];

function TWiki() {}

TWiki._verbatim = function(match, content) {
	return ZmWikiConverter.store(["<pre>",content,"</pre>"].join(""));
};
TWiki._list = function(match, level, type, content) {
	if ((level.length % 3) != 0) return match;
	type = type.match(/\*/) ? type : "#";
	for (var i = Math.floor(level / 3); i > 0; i--) {
		type += type.substr(0,1);
	}
	return MediaWiki._list(match, type, content);
};

TWiki.rules = [
    // pre-processing
    { input: /\r?\n/g, output: "\n" },
    { input: /\\(\{)/g, output: function($0,$1) { return ZmWikiConverter.store($1); } },
    { input: /\{\{/g, output: function($0) { return ZmWikiConverter.store($0); } },
	// non-wiki
	{ input: /(?:^|\n)<verbatim>\n(.*?)\n<\/verbatim>(?=\n|$)/g, output: TWiki._verbatim },
	// literals
    { input: /&[^;]+?;/g, output: function($0) { return ZmWikiConverter.store($0); } },
    { input: /&/g, output: "&amp;" },
    { input: /<\s/g, output: function($0) { return ZmWikiConverter.store($0); } },
    // inlines
    { input: /\*([^*]+?)\*/g, output: "<b>$1</b>" },
    { input: /__([^_]+?)__/g, output: "<b><i>$1</i></b>" },
    { input: /_([^_]+?)_/g, output: "<i>$1</i>" },
	{ input: /==([^=]+?)==/g, output: "<b><tt>$1</tt></b>" },
	{ input: /=([^=]+?)=/g, output: "<tt>$1</tt>" },
	// headers
    { input: /(?:^|\n)---(\+{1,6})(.*?)(?=\n|$)/g, output: MediaWiki._header },
	// horizontal rule
	{ input: /(?:^|\n)-{3,}(?=\n|$)/g, output: "<hr>\n" },
	// lists
	{ input: /(?:^|\n)([ ]{3,})([*]|[\dAaIi]\.) (.*?)(?=\n|$)/g, output: TWiki._list },
	{ input: /\{([*#;:]+)\}\}\n\{\{([*#;:]+)\}/g, output: MediaWiki._listTransition },
	{ input: /\{\{([*#;:]+)\}(.*?)\{([*#;:]+)\}\}/g, output: MediaWiki._listBoundary },
	// post-processing
    { input: /\{\{(\d+)\}\}/g, output: function($0,$1) { return ZmWikiConverter.restore($1); } },
    { input: /^\n|\n$/, output: "" }
];
