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

function ZmNoteKeywordObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt, ZmNoteKeywordObjectHandler.TYPE);
};
ZmNoteKeywordObjectHandler.prototype = new ZmObjectHandler;
ZmNoteKeywordObjectHandler.prototype.constructor = ZmNoteKeywordObjectHandler;

// Constants

ZmNoteKeywordObjectHandler.TYPE = "noteKeyword";

ZmNoteKeywordObjectHandler.WIKIWORD_RE = /[A-Z]+[a-z]+[A-Z]+[a-zA-Z0-9]*/;
ZmNoteKeywordObjectHandler.LITERAL_RE = /[^\]\|]+?/; // REVISIT: escaped ']'

ZmNoteKeywordObjectHandler.TWIKI_KEYWORD_RE = new RegExp(
	"\\b(" + ZmNoteKeywordObjectHandler.WIKIWORD_RE.source + ")\\b" +
	"|" +
	"(?:\\[" +
		"\\[(" + ZmNoteKeywordObjectHandler.LITERAL_RE.source + ")\\]" +
		"(?:\\[(" + ZmNoteKeywordObjectHandler.LITERAL_RE.source + ")\\])?" +
	"\\])",
	"g"
);

ZmNoteKeywordObjectHandler.MEDIAWIKI_KEYWORD_RE = new RegExp(
	"\\b(" + ZmNoteKeywordObjectHandler.WIKIWORD_RE.source + ")\\b" +
	"|" +
	"(?:\\[\\[" +
		"(" + ZmNoteKeywordObjectHandler.LITERAL_RE.source + ")" +
		"(?:\\|([^\\]]*?))?" +
	"\\]\\])",
	"g"
);

// Public methods

ZmNoteKeywordObjectHandler.prototype.match =
function(line, startIndex) {
	var twiki = this.matchTWiki(line, startIndex);
	var mediaWiki = this.matchMediaWiki(line, startIndex);
	if (twiki && mediaWiki) {
		return twiki.index <= mediaWiki.index ? twiki : mediaWiki;
	}
	return twiki || mediaWiki;
};

ZmNoteKeywordObjectHandler.prototype.matchTWiki =
function(line, startIndex) {
    ZmNoteKeywordObjectHandler.TWIKI_KEYWORD_RE.lastIndex = startIndex;
    var m = ZmNoteKeywordObjectHandler.TWIKI_KEYWORD_RE.exec(line);
    if (m) {
    	var keyword = m[2] || m[1];
    	var label = m[3] || m[2] || m[1];
    	
    	m.matchLength = m[0].length;
    	m[0] = label;
    	m.context = { keyword: keyword, label: label };
    }
    return m;
};

ZmNoteKeywordObjectHandler.prototype.matchMediaWiki =
function(line, startIndex) {
    ZmNoteKeywordObjectHandler.MEDIAWIKI_KEYWORD_RE.lastIndex = startIndex;
    var m = ZmNoteKeywordObjectHandler.MEDIAWIKI_KEYWORD_RE.exec(line);
    if (m) {
    	var keyword = m[2] || m[1];
    	var label = m[2] || m[1];
    	m.matchLength = m[0].length;
    	
    	if (m[3] !== undefined) {
    		if (m[3] != '') {
    			label = m[3];
    		}
    		else {
    			var i;
    			for (i = m.index + m.matchLength; i < line.length; i++) {
    				if (line.charAt(i).match(/\s/)) {
    					break;
					}
    			}
    			label = m[2] + line.substring(m.index + m.matchLength, i);
    			m.matchLength = i - m.index;
    		}
    	}
    	
    	m[0] = label;
    	m.context = { keyword: keyword, label: label };
    }
    return m;
};

ZmNoteKeywordObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	var appController = this._appCtxt.getAppController();
	var notesApp = appController.getApp(ZmZimbraMail.NOTES_APP);
	var cache = notesApp.getNoteCache();
	
	var folderId = ZmFolder.ID_INBOX; // TODO: Where does this come from?!?!
	var note = cache.getNoteByName(folderId, context.keyword);
	if (note) {
		this._selectedHandleResponse(note);
		return;
	}
	
	var callback = new AjxCallback(this, this._selectedHandleResponse);
	ZmNote.load(this._appCtxt, folderId, context.keyword, null, callback);
};

ZmNoteKeywordObjectHandler.prototype._selectedHandleResponse =
function(note) {
	var appController = this._appCtxt.getAppController();
	var notesApp = appController.getApp(ZmZimbraMail.NOTES_APP);
	
	var isNew = !note || note.version == 0;
	var controller = isNew ? notesApp.getNoteEditController() : notesApp.getNoteController();
	controller.show(note);
};

ZmNoteKeywordObjectHandler.prototype.getToolTipText =
function(keyword, context) {
	var text = [ "<b>Keyword:</b> '", context.keyword, "'" ];
	if (context.keyword != context.label) {
		text.push("<br>", "<b>Label:</b> '", context.label, "'");
	}
	return text.join("");
};

ZmNoteKeywordObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};

// Protected methods

ZmNoteKeywordObjectHandler.prototype._getHtmlContent =
function(html, idx, keyword, context) {
   	html[idx++] = AjxStringUtil.htmlEncode(keyword);
	return idx;
};

// Static initialization

ZmObjectManager.registerHandler("ZmNoteKeywordObjectHandler", ZmNoteKeywordObjectHandler.TYPE, 20);