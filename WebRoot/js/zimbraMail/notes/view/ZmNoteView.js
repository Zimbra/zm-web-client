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
	
	this._setMouseEventHdlrs(); // needed by object manager
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

ZmNoteView.prototype._keywordEl;
ZmNoteView.prototype._contentEl;

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

	var content = note.getContent();
	if (note.name.match(/^[^_]/)) {
		var cache = this._controller._app.getNoteCache();
		var chrome = cache.getNoteByName(note.folderId, "_CHROME_");
	
		var chromeContent = chrome.getContent();
		content = chromeContent.replace(/\{\{CONTENT\}\}/ig, content);
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
	var element = this.getHtmlElement();
	return element.innerHTML;
};

ZmNoteView.prototype.getSelection =
function() {
	return this._controller.getNote();
};


ZmNoteView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNoteView.prototype.addActionListener = function(listener) { /*TODO*/ };

ZmNoteView.prototype.setBounds = 
function(x, y, width, height) {
	// HACK: subtract height/width of scrollbars???
	width -= 11;
	height -= 11;
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
};

// Protected methods

ZmNoteView.prototype._render = function(element, note) {
	var ids = [];
	this._render1(element, note, ids);
	var action = new AjxTimedAction(this, this._render2, [ids, note]);
	AjxTimedAction.scheduleAction(action, 0);
};
ZmNoteView.prototype._render1 = function(element, note, ids) {
	var re = /(?=^|[^\\])\{\{(.+?)(?:\|(.*?))?\}\}/g;
	for (var child = element.firstChild; child != null; child = child.nextSibling) {
		if (child.nodeType == AjxUtil.ELEMENT_NODE) {
			this._render1(child, note, ids);
			continue;
		}
		if (child.nodeType == AjxUtil.TEXT_NODE) {
			var m;
			while (m = re.exec(child.nodeValue)) {
				// split text before/after transclusion
				child = child.splitText(m.index);
				if (child.nextSibling && child.nextSibling.nodeType == AjxUtil.TEXT_NODE) {
					child = child.nextSibling.splitText(m[0].length);
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
				
				re.lastIndex = 0;
			}
		}
	}
};
ZmNoteView.prototype._render2 = function(ids, note) {
	var cache = this._controller._app.getNoteCache();
	for (var i = 0; i < ids.length; i++) {
		var placeholder = document.getElementById(ids[i]);
		if (!placeholder) continue;
		
		var replacement = placeholder.firstChild;
		var wiklet = ZmNoteView.WIKLETS[placeholder.vname.toUpperCase()];
		if (wiklet) {
			replacement = wiklet(placeholder, cache, note);
		}
		placeholder.parentNode.replaceChild(replacement, placeholder);
	}
	var action = new AjxTimedAction(this, this._render3);
	AjxTimedAction.scheduleAction(action, 0);
};
ZmNoteView.prototype._render3 = function() {
	var element = this.getHtmlElement();
	if (!this._objectMgr) {
		this._objectMgr = new ZmObjectManager(this, this._appCtxt);
	}
	this._objectMgr.reset();
	this._objectMgr.processHtmlNode(element, true);
};

ZmNoteView.WIKLETS = {
	"TOC": function(element, cache, note) {
		// REVISIT: This isn't needed once notifications are used
		cache.fillCache(note.folderId);
	
		var notes = ZmNoteView.__object2Array(cache.getNotesInFolder(note.folderId));
		notes.sort(ZmNoteView.__byNoteName);
		
		var nameRe = /^[^_]/;

		var attrs = ZmNoteView.__parseValueAttrs(element.vvalue);
		if (attrs.name) {
			var reSource = attrs.name;
			reSource = reSource.replace(/\?/g, ".");
			reSource = reSource.replace(/\*/g, ".*");
			reSource = reSource.replace(/([\[\(\{\+])/g, "\\$1");

			nameRe = new RegExp("^" + reSource + "$", "i");
		}

		var a = [ "<UL>" ];
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

		var toc = document.createElement("DIV");
		toc.className = "WikiTOC";
		toc.innerHTML = a.join("");

		return toc;
	},
	"PAGENAME": function(element, cache, note) {
		return document.createTextNode(note.name);
	},
	"MSG": function(element, cache, note) {
		var key = element.vvalue;
		if (key && ZmMsg[key]) {
			return document.createTextNode(ZmMsg[key]);
		}
		return element.firstChild;
	}
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

ZmNoteView.__object2Array = function(o) {
	var a = [];
	for (var p in o) {
		a.push(o[p]);
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