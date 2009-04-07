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

//
// ZmWikiConverter class
//

ZmWikiConverter = function(toHtmlRules, toWikiRules) {
	if (arguments.length == 0) return;
	this._toHtmlRules = toHtmlRules;
	this._toWikiRules = toWikiRules;
}

// Public methods

ZmWikiConverter.prototype.toHtml = function(wiki) {
	ZmWikiConverter._converter = this;
        var a = [];
        wiki = ZmWikiConverter._saveComments(wiki, a);
	wiki = ZmWikiConverter.convert(wiki, this._toHtmlRules);
        return ZmWikiConverter._restoreComments(wiki, a);
};
ZmWikiConverter.prototype.toWiki = function(html) {
	ZmWikiConverter._converter = this;
        var a = [];
        html = ZmWikiConverter._saveComments(html, a);
	html = ZmWikiConverter.convert(html, this._toWikiRules);
        return ZmWikiConverter._restoreComments(html, a);
};


// Static functions

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
	return ZmWikiConverter._data[id - 1];
};

ZmWikiConverter._saveComments = function(text, a) {
        return text.replace(/<!--(.|\n)+?-->/g, function(s) {
                a.push(s);
                return "<ZmWikiConverter-COMMENT" + (a.length - 1) + ">";
        });
};

ZmWikiConverter._restoreComments = function(text, a) {
        return text.replace(/<ZmWikiConverter-COMMENT([0-9]+)>/g, function(s, p) {
                return a[p];
        });
};

//
// MediaWikiConverter syntax conversion
//

MediaWikiConverter = function() {
	ZmWikiConverter.call(this, MediaWikiConverter.toHtml.rules, MediaWikiConverter.toWiki.rules);
}
MediaWikiConverter.prototype = new ZmWikiConverter;
MediaWikiConverter.prototype.constructor = MediaWikiConverter;

// Static data

MediaWikiConverter.toHtml = {};

MediaWikiConverter.toHtml._LIST = {
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

MediaWikiConverter.toHtml._header = function(match, level, content) {
	return [ "<h", level.length, ">", content, "</h", level.length, ">\n" ].join("");
};
MediaWikiConverter.toHtml._list = function(match, level, content) {
	return [ "{{", level, "}", content, "{", level, "}}\n" ].join("");
};
MediaWikiConverter.toHtml._listTransition = function(match, close, open) {
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
		a.push(MediaWikiConverter.toHtml._LIST.close.item[type]);
		a.push(MediaWikiConverter.toHtml._LIST.close.list[type]);
	}
	for (var i = offset; i < open.length; i++) {
		var type = open.charAt(i);
		a.push(MediaWikiConverter.toHtml._LIST.open.list[type]);
		a.push(MediaWikiConverter.toHtml._LIST.open.item[type]);
	}

    if (close.length == open.length) {
		var type = close.charAt(close.length - 1);
		a.push(MediaWikiConverter.toHtml._LIST.close.item[type]);
	}
	var type = close.charAt(open.length - 1);
	a.push(MediaWikiConverter.toHtml._LIST.open.item[type]);

	return a.join("");
};
MediaWikiConverter.toHtml._listBoundary = function(match, open, content, close) {
    var a = ['\n'];
	for (var i = 0; i < open.length; i++) {
	    var type = open.charAt(i);
		a.push(MediaWikiConverter.toHtml._LIST.open.list[type]);
		a.push(MediaWikiConverter.toHtml._LIST.open.item[type]);
	}
	a.push(content);
	for (var i = close.length - 1; i >= 0; i--) {
		var type = close.charAt(i);
		a.push(MediaWikiConverter.toHtml._LIST.close.item[type]);
		a.push(MediaWikiConverter.toHtml._LIST.close.list[type]);
	}
	return a.join("");
}
MediaWikiConverter.toHtml._paragraph = function(match, newlines) {
	return [ match.substr(newlines.length - 2), "<p>" ].join("");
};

// Rule set

MediaWikiConverter.toHtml.rules = [
	// pre-processing
	{ input: new RegExp("\\r?\\n","g"), output: "\n" },
	{ input: new RegExp("\\\\(\\{)","g"), output: function($0,$1) { return ZmWikiConverter.store($1); } },
	{ input: new RegExp("\\{\\{","g"), output: function($0) { return ZmWikiConverter.store($0); } },
	// non-wiki stuff
	{ input: new RegExp("<pre>.*?<\\/pre>","ig"), output: function($0) { return ZmWikiConverter.store($0); } },
	// literals
	{ input: new RegExp("&[^;]+?;","g"), output: function($0) { return ZmWikiConverter.store($0); } },
	{ input: new RegExp("&","g"), output: "&amp;" },
	{ input: new RegExp("<\\s","g"), output: function($0) { return ZmWikiConverter.store($0); } },
	// inlines
	{ input: new RegExp("'''''(.+?)'''''","g"), output: "<strong><em>$1</em></strong>" },
	{ input: new RegExp("'''(.+?)'''","g"), output: "<strong>$1</strong>" },
	{ input: new RegExp("''(.+?)''","g"), output: "<em>$1</em>" },
	// links
	{ input: new RegExp("\\[\\[.+?\\]\\]","g"), output: function($0) { ZmWikiConverter.store($0); } },
	{ input: new RegExp("\\[([^\\s]+)\\s+([^\\]]+)\\]","g"), output: "<a href='$1' target='_new'>$2</a>" },
	{ input: new RegExp("\\[([^\\]]+)\\]","g"), output: "<a href='$1' target='_new'>$1</a>" },
	// headers
	{ input: new RegExp("(?:^|\\n)(={1,4})(.*?)={1,4}","g"), output: MediaWikiConverter.toHtml._header },
	// horizontal rule
	{ input: new RegExp("(?:^|\\n)-{4}(?=\\n|$)","g"), output: "\n<hr>\n" },
	// lists
	{ input: new RegExp("(?:^|\\n)([*#;:]*)(;[^:]*?)(:.*?)(?:\\n|$)","g"), output: "$1$2$1$3\n" },
	{ input: new RegExp("(?:^|\\n)([*#;:]+)(.*?)(?=\\n|$)","g"), output: MediaWikiConverter.toHtml._list },
	{ input: new RegExp("\\{([*#;:]+)\\}\\}\\n\\{\\{([*#;:]+)\\}","g"), output: MediaWikiConverter.toHtml._listTransition },
	{ input: new RegExp("\\{\\{([*#;:]+)\\}(.*?)\\{([*#;:]+)\\}\\}","g"), output: MediaWikiConverter.toHtml._listBoundary },
	// tables
	{ input: new RegExp("(?:^|\\n)\\{\\|(.*?)(?=\\n|$)","g"), output: "<table $1>\n" },
	{ input: new RegExp("(?:^|\\n)\\|\\}(?=\\n|$)","g"), output: "</table>\n" },
	{ input: new RegExp("(?:^|\\n)\\|-(.*?)(?=\\n|$)","g"), output: "<tr $1>\n" },
	{ input: new RegExp("(?:^|\\n)\\!([^\\|]+?)\\|(.*?)(?=\\n|$)","g"), output: "<th $1>$2\n" },
	{ input: new RegExp("(?:^|\\n)\\!(.*?)(?=\\n|$)","g"), output: "<th>$1\n" },
	{ input: new RegExp("(?:^|\\n)\\|([^\\|]+?)\\|(.*?)(?=\\n|$)","g"), output: "<td $1>$2\n" },
	{ input: new RegExp("(?:^|\\n)\\|(.*?)(?=\\n|$)","g"), output: "<td>$1\n" },
	// paragraphs
	{ input: new RegExp("(\\n{2,})","g"), output: MediaWikiConverter.toHtml._paragraph },
	// post-processing
	{ input: new RegExp("\\{\\{(\\d+)\\}\\}","g"), output: function($0,$1) { return ZmWikiConverter.restore($1); } },
	{ input: new RegExp("^\\n+|(?:<p.*?>)*\\n+$|<p.*?>*$","i"), output: "" }
];

MediaWikiConverter.toWiki = {};

MediaWikiConverter.toWiki._header = function(match, level, attrs, content) {
	// REVISIT: What to do with attr content?
	var marker = "====".substring(0, level);
	return [ "\n", marker, content, marker, "\n" ].join("");
};

MediaWikiConverter.toWiki._listClear = function(match) {
	MediaWikiConverter.toWiki._listLevel = "";
	return match;
};
MediaWikiConverter.toWiki._list = function(match, type) {
	if (match.charAt(1) == '/') {
		var listLevel = MediaWikiConverter.toWiki._listLevel;
		MediaWikiConverter.toWiki._listLevel = listLevel.substring(0, listLevel.length - 1);
		return match;
	}
	MediaWikiConverter.toWiki._listLevel += type;
	return [
		match.substring(0, match.length-1),
		" level=", MediaWikiConverter.toWiki._listLevel,
		">"
	].join("");
};
MediaWikiConverter.toWiki._listItem = function(match, level, content) {
	level = level.replace(/u/g,"*").replace(/o/g,"#").replace(/d/g,";");
	return ["\n",level," ",content.replace(/[\s\n]+/g, " ").replace(/\n+$/,"")].join("");
};

MediaWikiConverter.toWiki.rules = [
	// pre-processing
	{ input: new RegExp("^","g"), output: MediaWikiConverter.toWiki._listClear },
	// inlines
	{ input: new RegExp("(?:<em>|<i>)(.*?)(?:<\\/em>|<\\/i>)","ig"), output: "''$1''" },
	{ input: new RegExp("(?:<strong>|<b>)(.*?)(?:<\\/strong>|<\\/b>)","ig"), output: "'''$1'''" },
	// headers
	{ input: new RegExp("<h(\\d)(.*?)>(.*?)<\\/h\\d\\s*>","ig"), output: MediaWikiConverter.toWiki._header },
	// horizontal rule
	{ input: new RegExp("<hr(?:\\s+.*)?>","ig"), output: "\n----\n" },
	// lists
	{ input: new RegExp("<(?:\\/)?([uod])l(?:\\s+.*?)?>","ig"), output: MediaWikiConverter.toWiki._list },
	{ input: new RegExp("<.*? level=([uod]+)>[\\s\\n]*<li>(.*?)(?!<\\/.+?>)","ig"), output: MediaWikiConverter.toWiki._listItem },
	{ input: new RegExp("<\\/[uod]l\\s*>|<\\/li>","ig"), output: "" },
	// paragraphs
	{ input: new RegExp("<p(\\s+.*)?>","ig"), output: "\n\n" },
	// post-processing
	{ input: new RegExp("\\n{3,}","g"), output: "\n\n" },
	{ input: new RegExp("^\\n+|\\n+$"), output: "" }
];

//
// TWikiConverter syntax conversion
//

TWikiConverter = function() {
	ZmWikiConverter.call(this, TWikiConverter.toHtml.rules, TWikiConverter.toWiki.rules);
	this._webMap = {};
	this._varMap = {
		TOC: "<wiklet class='TOC'/>"
	};
}
TWikiConverter.prototype = new ZmWikiConverter;
TWikiConverter.prototype.constructor = TWikiConverter;

// Constants

TWikiConverter.DEFAULT_NOTEBOOK = "Notebook";

TWikiConverter.COLORS = {
	YELLOW: { fg: "yellow" }, // 255,255,0
	ORANGE: { fg: "#ff6600" }, // 255,102,0
	RED: { fg: "red" }, // 255,0,0
	PINK: { fg: "magenta" }, // 255,0,255
	PURPLE: { fg: "purple" }, // 128,0,128
	TEAL: { fg: "teal" }, // 0,128,128
	NAVY: { fg: "navy" }, // 0,0,128
	BLUE: { fg: "blue" }, // 0,0,255
	AQUA: { fg: "aqua" }, // 0,255,255
	LIME: { fg: "lime" }, // 0,255,0
	GREEN: { fg: "green" }, // 0,128,0
	OLIVE: { fg: "olive" }, // 128,0,128
	MAROON: { fg: "maroon" }, // 128,0,0
	BROWN: { fg: "#996633" }, // 153,102,51
	BLACK: { fg: "black" }, // 0,0,0
	GRAY: { fg: "gray" }, // 128,128,128
	SILVER: { fg: "silver" }, // 192,192,192
	WHITE: { fg: "white", bg: "gray" } // 255,255,255; 128,128,128
};

// Data

TWikiConverter.prototype._baseNotebook = TWikiConverter.DEFAULT_NOTEBOOK;
TWikiConverter.prototype._webMap;
TWikiConverter.prototype._varMap;

// Methods

TWikiConverter.prototype.setBaseNotebook = function(notebook) {
	this._baseNotebook = notebook;
};
TWikiConverter.prototype.putWebMapping = function(oldWeb, newWeb) {
	this._webMap[oldWeb] = newWeb;
};
TWikiConverter.prototype.putVariable = function(name, stringOrFunc) {
	this._varMap[name] = stringOrFunc;
};

// Rules

TWikiConverter.toHtml = {};

TWikiConverter.toHtml._verbatim = function(match, content) {
	var text = [ "<pre><nowiklet>", content, "</nowiklet></pre>" ].join("");
	return ZmWikiConverter.store(text);
};
TWikiConverter.toHtml._list = function(match, level, type, content) {
	var length = level.match(/\t/) ? level.length * 3 : level.length;
	if ((length % 3) != 0) return match;
	type = type.match(/\*/) ? type : "#";
	for (var i = Math.floor(length / 3) - 1; i > 0; i--) {
		type += type.substr(0,1);
	}
	return MediaWikiConverter.toHtml._list(match, type, content);
};
TWikiConverter.toHtml._color = function(match, color, content) {
	var COLOR = TWikiConverter.COLORS[color];
	return [
		"<span style='",
			"color:",COLOR.fg,";",
			(COLOR.bg ? "background-color:"+COLOR.bg+";" : ""),
		"'>",
			content,
		"</span>"
	].join("");
};
TWikiConverter.toHtml._tableRow = function(match, twikiRow) {
	var a = [];
	a.push("<tr>");
	var cellRe = new RegExp("\\|([^\\|]+?)(\\|{1,})","g");
	var m;
	while (m = cellRe.exec(twikiRow)) {
		var headerRe = new RegExp("^\\s*<b>(.*?)<\\/b>\\s*$","g");
		var n = m[1].match(headerRe);
		a.push(n ? "<th" : "<td");
		if (m[1].match(new RegExp("^\\S+"))) {
			a.push(" align=left");
		}
		else if (m[1].match(new RegExp("\\S+$"))) {
			a.push(" align=right");
		}
		else {
			a.push(" align=center");
		}
		if (m[2].length > 1) {
			a.push(" colspan=",m[2].length);
		}
		a.push(">");
		a.push((n ? n[1] : m[1]) || "&nbsp;");
		a.push(n ? "</th>" : "</td>");
		cellRe.lastIndex--;
	}
	a.push("</tr>\n");
	return a.join("");
};

TWikiConverter.toHtml._attachStart = function(match) {
	return [
		"<h3>Attachments Imported from TWiki</h3>\n",
		"<table class='Attachment' border='1' cellspacing='1' cellpadding='3'>\n",
			"<tr>",
				"<th>Attachment</th>",
		    	"<th>Size</th>",
				"<th>Date</th>",
				"<th>Who</th>",
				"<th>Comment</th>",
			"</tr>\n",
			match
	].join("");
};

TWikiConverter.toHtml._attachEnd = function(match) {
	return [match,"</table>"].join("\n");
};


TWikiConverter.toHtml._attachSizeFormatter = new AjxMessageFormat("{0,number,#.0} K");
TWikiConverter.toHtml._attachDateFormatter = new AjxDateFormat("d MMM yyyy - kk:mm");
TWikiConverter.toHtml._attachDateBaseTime = new Date(25200885).getTime(); // 31 Dec 1969 - 23:00:00

TWikiConverter.toHtml._metaData = function(match, name, value) {
	if (name == "META:FILEATTACHMENT") {
		var object = TWikiConverter._objectify(value);
		var size = Number(object.size) / 1024;
		var date = new Date(TWikiConverter.toHtml._attachDateBaseTime + Number(object.date) * 1000);
		var sizeFormatter = TWikiConverter.toHtml._attachSizeFormatter;
		var dateFormatter = TWikiConverter.toHtml._attachDateFormatter;
		return [
			"<tr>",
				"<td>[[",object.name,"]]</td>",
				"<td><nobr>",sizeFormatter.format(size),"</nobr></td>",
				"<td><nobr>",dateFormatter.format(date),"</nobr></td>",
				"<td>",object.user,"</td>",
				"<td>",object.comment,"</td>",
			"</tr>"
		].join("");
	}
	var metaRe = new RegExp("^META:(TOPICINFO|TOPICMOVED|TOPICPARENT)");
	if (name.match(metaRe)) {
		var text = ["<!--",match.replace(new RegExp("^\\n"),""),"-->"].join("");
		return ZmWikiConverter.store(text);
	}
	return ZmWikiConverter.store(match);
};

TWikiConverter.toHtml._wikiVar = function(match, name) {
	var conv = ZmWikiConverter._converter;
	var replacement = conv._varMap[name];
	if (replacement) {
		if (typeof replacement == "function") {
			return replacement(name);
		}
		return replacement;
	}
	return match;
};

TWikiConverter.toHtml._wikiWordBracket = function(match, web, word) {
    return TWikiConverter.toHtml._wikiWord(match, web, word, true);
}
TWikiConverter.toHtml._wikiWordNoBracket = function(match, web, word) {
    return TWikiConverter.toHtml._wikiWord(match, web, word, false);
}
TWikiConverter.toHtml._wikiWord = function(match, web, word, sawBracket) {
	var conv = ZmWikiConverter._converter;
    var user = conv._varMap["wiki.user"];
    user = user ? "//"+user : "";
    base = conv._baseNotebook || TWikiConverter.DEFAULT_NOTEBOOK;
	web = conv._webMap[web] || web;
    var a = [];
    if (!sawBracket) {
        a.push("[[");
    }
    a.push(user,"/",base,"/",web,"/",word);
    if (!sawBracket) {
        a.push("|",web,".",word,"]]");
    }
    return ZmWikiConverter.store(a.join(""));
};

TWikiConverter._objectify = function(s) {
	var object = {};
	var re = new RegExp("([a-z]+)=\"([^\"]*)\"","g");
	var m;
	while (m = re.exec(s)) {
		var name = m[1];
		var value = m[2];
		object[name] = value;
	}
	return object;
};

TWikiConverter.toHtml.rules = [
    // pre-processing
    { input: new RegExp("\\r?\\n","g"), output: "\n" },
    { input: new RegExp("\\\\(\\{)","g"), output: function($0,$1) { return ZmWikiConverter.store($1); } },
    { input: new RegExp("\\{\\{","g"), output: function($0) { return ZmWikiConverter.store($0); } },
	// meta-data
	{ input: new RegExp("(?:^|\\n)(%META:FILEATTACHMENT.*?%)"), output: TWikiConverter.toHtml._attachStart },
	{ input: new RegExp("(?:^|\\n)(%META:FILEATTACHMENT.*?%).*?$"), output: TWikiConverter.toHtml._attachEnd },
	{ input: new RegExp("(?:^|\\n)%(.*?)(?:\\{(.*?)\\})?%(?=\\n|$)","g"), output: TWikiConverter.toHtml._metaData },
	// non-wiki
	{ input: new RegExp("<verbatim>((?:.|\\n)*?)<\\/verbatim>","g"), output: TWikiConverter.toHtml._verbatim },
	{ input: new RegExp("<noautolink>(.*?)<\\/noautolink>","g"), output: "<nolink>$1</nolink>" },
	// wiki replacements
	{ input: new RegExp("%([A-Z]+?)%","g"), output: TWikiConverter.toHtml._wikiVar },
    { input: new RegExp("(?=\\[\\[)([A-Z]+[a-z]+(?:[A-Z]+[A-Za-z0-9]*)?)\\.([A-Z]+[a-z]+[A-Z]+[A-Za-z0-9]*)\\b","g"), output: TWikiConverter.toHtml._wikiWordBracket },
    { input: new RegExp("\\b([A-Z]+[a-z]+(?:[A-Z]+[A-Za-z0-9]*)?)\\.([A-Z]+[a-z]+[A-Z]+[A-Za-z0-9]*)\\b","g"), output: TWikiConverter.toHtml._wikiWordNoBracket },
	// links
	{ input: new RegExp("\\[\\[%ATTACHURL%\\/","g"), output: "[[" },
	{ input: new RegExp("\\[\\[(.*?)\\]\\[(.*?)\\]\\]","g"), output: "[[$1|$2]]" },
	// literals
    { input: new RegExp("&([a-z]+|#\\d+|#x[\\da-f]+);","ig"), output: function($0) { return ZmWikiConverter.store($0); } },
    { input: new RegExp("&","g"), output: "&amp;" },
    { input: new RegExp("<\\s","g"), output: function($0) { return ZmWikiConverter.store($0); } },
    { input: new RegExp("!(\\[\\[.*?\\]\\])","g"), output: "<nolink>$1</nolink>" },
    { input: new RegExp("!([A-Z]+[a-z]+[A-Z]+[a-zA-Z0-9]*)","g"), output: "<nolink>$1</nolink>" },
	// lists
	{ input: new RegExp("(?:^|\\n)([ ]{3,}|\\t{1,})([*]|[\\dAaIi]\\.) (.*?)(?=\\n|$)","g"), output: TWikiConverter.toHtml._list },
	{ input: new RegExp("\\{([*#;:]+)\\}\\}\\n\\{\\{([*#;:]+)\\}","g"), output: MediaWikiConverter.toHtml._listTransition },
	{ input: new RegExp("\\{\\{([*#;:]+)\\}(.*?)\\{([*#;:]+)\\}\\}","g"), output: MediaWikiConverter.toHtml._listBoundary },
    // inlines
	{ input: new RegExp("\\b\\*([^*\n]+?)\\*\\b","g"), output: "<b>$1</b>" },
    { input: new RegExp("\\b__([^_\n]+?)__\\b","g"), output: "<b><i>$1</i></b>" },
    { input: new RegExp("\\b_([^_\n]+?[^\\s])_\\b","g"), output: "<i>$1</i>" },
    { input: new RegExp("%(YELLOW|ORANGE|RED|PINK|PURPLE|TEAL|NAVY|BLUE|AQUA|LIME|GREEN|OLIVE|MAROON|BROWN|BLACK|GRAY|SILVER|WHITE)%(.*?)%ENDCOLOR%","g"), output: TWikiConverter.toHtml._color },
	// literals2
    { input: new RegExp("<[\\/]?[a-zA-Z][a-zA-Z0-9]*.*?>","g"), output: function($0) { return ZmWikiConverter.store($0); } },
    // inlines2
	{ input: new RegExp('\\b==(.+?)==\\b','g'), output: "<b><tt>$1</tt></b>" },
	{ input: new RegExp('\\b=(.+?)=\\b','g'), output: "<tt>$1</tt>" },
	// headers
    { input: new RegExp("(?:^|\\n)---(\\+{1,6})(.*?)(?=\\n|$)","g"), output: MediaWikiConverter.toHtml._header },
	// horizontal rule
	{ input: new RegExp("(?:^|\\n)-{3,}(?=\\n|$)","g"), output: "<hr>\n" },
	// tables
	{ input: new RegExp("(?:^|\\n)((?:\\|.*?\\|(?:\\n|$)){1,})","g"), output: "<table border=1>\n$1</table>\n" },
	//{ input: /(?=\n)((\|.*?\|(?:\n)))/g, output: "<tr>\n$1</tr>\n" },
	{ input: new RegExp("(?!\\n)(\\|.*?\\|)\\n","g"), output: TWikiConverter.toHtml._tableRow },
	// post-processing
    { input: new RegExp("\\{\\{(\\d+)\\}\\}","g"), output: function($0,$1) { return ZmWikiConverter.restore($1); } },
    { input: new RegExp("\\n{2,}","g"), output: "\n<p>\n" },
    { input: new RegExp("^\\s+|\\s+$"), output: "" }
];

TWikiConverter.toWiki = {};

TWikiConverter.toWiki.rules = [
	// pre-processing
	{ input: new RegExp("^"), output: "HTML to TWiki NOT IMPLEMENTED!\n\n" }
	// post-processing
];
