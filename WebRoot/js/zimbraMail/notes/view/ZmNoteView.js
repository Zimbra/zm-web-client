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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNoteView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmNoteView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._createHtml();	
	this._setMouseEventHdlrs(); // needed by object manager
	
	this._commentRe = /<!--.*?-->/g;
	this._transclusionRe = /(?=^|[^\\])\{\{\s*(.+?)\s*(?:\|\s*(.*?))?\s*\}\}/g;
	
}
ZmNoteView.prototype = new DwtComposite;
ZmNoteView.prototype.constructor = ZmNoteView;

ZmNoteView.prototype.toString =
function() {
	return "ZmNoteView";
};

// Data

ZmNoteView.prototype._appCtxt;
ZmNoteView.prototype._controller;

// Public methods

ZmNoteView.prototype.getController =
function() {
	return this._controller;
};

ZmNoteView.prototype.set =
function(note) {
	var element = this.getHtmlElement();
	if (!note) {
		element.innerHTML = "";
		return;
	}

	var cache = this._controller._app.getNoteCache();
	var chrome = cache.getNoteByName(note.folderId, "_CHROME_");
	var chromeContent = chrome.getContent();

	var content = chromeContent;
	if (note.name != "_CHROME_") {
		var pageContent = note.getContent();
		content = chromeContent.replace(/\{\{CONTENT\}\}/ig, pageContent);
	}
	
	element.innerHTML = content;
	this._render(element, note);
};

ZmNoteView.prototype.getTitle =
function() {
	var note = this.getSelection();
	return AjxStringUtil.xmlDecode(note.name);
};
ZmNoteView.prototype.getContent =
function() {
	return this.getHtmlElement().innerHTML;
};

ZmNoteView.prototype.getSelection =
function() {
	return this._controller.getNote();
};


ZmNoteView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNoteView.prototype.addActionListener = function(listener) { /*TODO*/ };

// Protected methods

ZmNoteView.prototype._createHtml = function() {
	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
};

ZmNoteView.prototype._render = function(element, note) {
	var ids = [];
	this._renderFindTransclusions(element, element.firstChild, note, ids);
	this._renderReplaceTransclusions(note, ids);
	this._renderFindObjects(element);
};
ZmNoteView.prototype._renderFindTransclusions = function(element, startChild, note, ids) {
	for (var child = startChild; child != null; child = child.nextSibling) {
		if (child.nodeType == AjxUtil.ELEMENT_NODE) {
			this._renderFindTransclusions(child, child.firstChild, note, ids);
			continue;
		}
		if (child.nodeType == AjxUtil.TEXT_NODE) {
			var m;
			while (m = this._transclusionRe.exec(child.nodeValue)) {
				// skip comments
				var commentM = this._commentRe.exec(child.nodeValue);
				if (commentM) {
					var commentLen = commentM.index + commentM[0].length;
					if (m.index > commentM.index && m.index < commentLen) {
						this._commentRe.lastIndex = commentLen;
						this._transclusionRe.lastIndex = commentLen;
						continue;
					}
				}
			
				// split text before/after transclusion
				if (m.index > 0) {
					child = child.splitText(m.index);
				}
				if (child.nodeValue.length > m[0].length) {
					child.splitText(m[0].length);
				}
				
				// wrap transclusion in placeholder element
				var placeholder = document.createElement("SPAN");
				ids.push(placeholder.id = Dwt.getNextId());
				placeholder.vname = m[1];
				placeholder.vvalue = m[2];
				
				// replace original node with placeholder
				child.parentNode.replaceChild(placeholder, child);
				placeholder.appendChild(child);
				child = placeholder;
				
				this._commentRe.lastIndex = 0;
				this._transclusionRe.lastIndex = 0;
			}
		}
	}
};
ZmNoteView.prototype._renderReplaceTransclusions = function(note, ids) {
	var cache = this._controller._app.getNoteCache();
	while (ids.length > 0) {
		var id = ids.shift();
		var placeholder = document.getElementById(id);
		if (!placeholder) continue;
		
		var context;
		var replacement = placeholder.firstChild;
		var wiklet = ZmNoteView.WIKLETS[placeholder.vname.toUpperCase()];
		if (wiklet) {
			replacement = wiklet.func(placeholder, cache, note, context = []);
			if (replacement.nodeType == 11) { // document fragment
				var container = document.createElement("SPAN");
				container.appendChild(replacement);
				replacement = container;
			}
		}
		placeholder.parentNode.replaceChild(replacement, placeholder);
		
		var subnote = context && context.length ? context[0] : note;
		this._renderFindTransclusions(replacement.parentNode, replacement, subnote, ids); 
	}
};
ZmNoteView.prototype._renderFindObjects = function(element) {
	if (!this._objectMgr) {
		this._objectMgr = new ZmObjectManager(this, this._appCtxt);
		var handler = new ZmNoteKeywordObjectHandler(this._appCtxt);
		this._objectMgr.addHandler(handler, ZmNoteKeywordObjectHandler.TYPE, 20);
		this._objectMgr.sortHandlers();
	}
	this._objectMgr.reset();
	this._objectMgr.processHtmlNode(element, true);
};

ZmNoteView.WIKLETS = {
	"TOC": {
		tooltip: ZmMsg.wikletTocTT,
		params: "name = '*'",
		func: function(element, cache, note) {
			var nameRe = /^[^_]/;
	
			var attrs = ZmNoteView.__parseValueAttrs(element.vvalue);
			if (attrs.name) {
				var reSource = attrs.name;
				reSource = reSource.replace(/\?/g, ".");
				reSource = reSource.replace(/\*/g, ".*");
				reSource = reSource.replace(/([\[\(\{\+])/g, "\\$1");
	
				nameRe = new RegExp("^" + reSource + "$", "i");
			}
	
			var notes = ZmNoteView.__object2Array(cache.getNotesInFolder(note.folderId), nameRe);
			notes.sort(ZmNoteView.__byNoteName);

			var toc = document.createElement("DIV");
			toc.className = "WikiTOC";

			var a = [];
			if (notes.length == 0) {
				a.push("{{MSG|wikiPagesNotFound}}");
			}
			else {
				a.push("<UL>");
				for (var i = 0; i < notes.length; i++) {
					var name = notes[i].name;
					if (!nameRe.test(name)) continue;
					a.push(
						"<LI>",
						"[[", name, "]]",
						"</LI>"
					);
				}
				a.push("</UL>");
			}
			toc.innerHTML = a.join("");
	
			return toc;
		}
	},
	"NAME": {
		tooltip: ZmMsg.wikletNameTT,
		func: function(element, cache, note) {
			var name = note.name == "_INDEX_" ? ZmMsg.wikiToc : note.name;
			return document.createTextNode(name);
		}
	},
	"MSG": {
		tooltip: ZmMsg.wikletMsgTT,
		params: "messageKey",
		func: function(element, cache, note) {
			var key = element.vvalue;
			if (key && ZmMsg[key]) {
				element.innerHTML = ZmMsg[key];
			}
			return element.childNodes.length == 1 ? element.firstChild : element;
		}
	},
	"INCLUDE": {
		tooltip: ZmMsg.wikletIncludeTT,
		params: "PageName",
		func: function(element, cache, note, context) {
			var name = element.vvalue;
			// REVISIT: right now, assume same folder
			var note = cache.getNoteByName(note.folderId, name);
			if (note) {
				context.push(note);
				var container = document.createElement("SPAN");
				container.innerHTML = note.getContent();
				var fragment = document.createDocumentFragment();
				var child = container.firstChild;
				while (child != null) {
					fragment.appendChild(child);
					child = container.firstChild;
				}
				return fragment;
			}
			return element.firstChild;
		}
	},
	"CREATOR": {
		tooltip: ZmMsg.wikletCreatorTT,
		func: function(element, cache, note) {
			return document.createTextNode(note.creator);
		}
	},
	"CREATEDATE": {
		tooltip: ZmMsg.wikletCreateDateTT,
		params: "medium",
		func: function(element, cache, note) {
			return ZmNoteView._wikletFormatDate("date", element.vvalue, note.createDate);
		}
	},
	"CREATETIME": {
		tooltip: ZmMsg.wikletCreateTimeTT,
		params: "short",
		func: function(element, cache, note) {
			return ZmNoteView._wikletFormatDate("time", element.vvalue, note.createDate);
		}
	},
	"MODIFIER": {
		tooltip: ZmMsg.wikletModifierTT,
		func: function(element, cache, note) {
			return document.createTextNode(note.modifier || note.creator);
		}
	},
	"MODIFYDATE": {
		tooltip: ZmMsg.wikletModifyDateTT,
		params: "medium",
		func: function(element, cache, note) {
			return ZmNoteView._wikletFormatDate("date", element.vvalue, note.modifyDate);
		}
	},
	"MODIFYTIME": {
		tooltip: ZmMsg.wikletModifyTimeTT,
		params: "short",
		func: function(element, cache, note) {
			return ZmNoteView._wikletFormatDate("time", element.vvalue, note.modifyDate);
		}
	},
	"VERSION": {
		tooltip: ZmMsg.wikletVersionTT,
		func: function(element, cache, note) {
			return document.createTextNode(note.version);
		}
	}
};

ZmNoteView._wikletDateFormatters = {};
ZmNoteView._wikletFormatDate = function(type, style, date) {
		var formatter;
		if (style) {
			var pattern = ["{0",type,style,"}"].join();
			if (!ZmNoteView._wikletDateFormatters[pattern]) {
				ZmNoteView._wikletDateFormatters[pattern] = new AjxMessageFormat(pattern);
			}
			formatter = ZmNoteView._wikletDateFormatters[pattern];
		}
		else {
			formatter = AjxDateFormat.getDateInstance();
		}
		
		var s = formatter.format(date);
		return document.createTextNode(s);
};

// Utility functions

ZmNoteView.__parseValueAttrs = function(s) {
	var attrs = {};

	var re = /([a-z]+)\s*=\s*(?:'(.*?)'|"(.*?)")/g;
	var m;
	while (m = re.exec(s)) {
		var aname = m[1].toLowerCase();
		var avalue = m[2] || m[3] || "";
		attrs[aname] = avalue;
	}
	
	return attrs;
};

ZmNoteView.__object2Array = function(o, re) {
	var a = [];
	for (var p in o) {
		var op = o[p];
		if (!re.test(op.name)) continue;
		a.push(op);
	}
	return a;
};
ZmNoteView.__byNoteName = function(a, b) {
	var aname = a.name.toLowerCase();
	var bname = b.name.toLowerCase();
	if (aname < bname) return -1;
	if (aname > bname) return  1;
	return 0;
};