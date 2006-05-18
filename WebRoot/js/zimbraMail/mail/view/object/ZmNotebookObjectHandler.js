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

function ZmNotebookObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt, ZmNotebookObjectHandler.TYPE);
};
ZmNotebookObjectHandler.prototype = new ZmObjectHandler;
ZmNotebookObjectHandler.prototype.constructor = ZmNotebookObjectHandler;

// Constants

ZmNotebookObjectHandler.TYPE = "notebook";

ZmNotebookObjectHandler.WIKIWORD_RE = /[A-Z]+[a-z]+[A-Z]+[a-zA-Z0-9]*/;
ZmNotebookObjectHandler.LITERAL_RE = /[^\]\|]+?/; // REVISIT: escaped ']'

ZmNotebookObjectHandler.TWIKI_KEYWORD_RE = new RegExp(
	"\\b(" + ZmNotebookObjectHandler.WIKIWORD_RE.source + ")\\b" +
	"|" +
	"(?:\\[" +
		"\\[(" + ZmNotebookObjectHandler.LITERAL_RE.source + ")\\]" +
		"(?:\\[(" + ZmNotebookObjectHandler.LITERAL_RE.source + ")\\])?" +
	"\\])",
	"g"
);

ZmNotebookObjectHandler.MEDIAWIKI_KEYWORD_RE = new RegExp(
	"\\b(" + ZmNotebookObjectHandler.WIKIWORD_RE.source + ")\\b" +
	"|" +
	"(?:\\[\\[" +
		"(" + ZmNotebookObjectHandler.LITERAL_RE.source + ")" +
		"(?:\\|([^\\]]*?))?" +
	"\\]\\])",
	"g"
);

// Public methods

ZmNotebookObjectHandler.prototype.match =
function(line, startIndex) {
	var twiki = this.matchTWiki(line, startIndex);
	var mediaWiki = this.matchMediaWiki(line, startIndex);
	if (twiki && mediaWiki) {
		return twiki.index <= mediaWiki.index ? twiki : mediaWiki;
	}
	return twiki || mediaWiki;
};

ZmNotebookObjectHandler.prototype.matchTWiki =
function(line, startIndex) {
    ZmNotebookObjectHandler.TWIKI_KEYWORD_RE.lastIndex = startIndex;
    var m = ZmNotebookObjectHandler.TWIKI_KEYWORD_RE.exec(line);
    if (m) {
    	var keyword = m[2] || m[1];
    	var label = m[3] || m[2] || m[1];
    	
    	m.matchLength = m[0].length;
    	m[0] = label;
    	m.context = { keyword: keyword, label: label };
    }
    return m;
};

ZmNotebookObjectHandler.prototype.matchMediaWiki =
function(line, startIndex) {
    ZmNotebookObjectHandler.MEDIAWIKI_KEYWORD_RE.lastIndex = startIndex;
    var m = ZmNotebookObjectHandler.MEDIAWIKI_KEYWORD_RE.exec(line);
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

ZmNotebookObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	var appController = this._appCtxt.getAppController();
	var notebookApp = appController.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = notebookApp.getNotebookCache();

	// REVISIT: Need some structured syntax for wiki links	
	var notebookController = notebookApp.getNotebookController();
	var page = notebookController.getPage();
	var folderId = page ? page.folderId : ZmOrganizer.ID_NOTEBOOK;

	var page = cache.getPageByName(folderId, context.keyword);
	if (!page) {
		// NOTE: We assume the page is new if there's no entry in the cache.
		page = new ZmPage(this._appCtxt);
		page.name = context.keyword;
		page.folderId = folderId;
	}	
	this._selectedHandleResponse(page);
};

ZmNotebookObjectHandler.prototype._selectedHandleResponse =
function(page) {
	var appController = this._appCtxt.getAppController();
	var notebookApp = appController.getApp(ZmZimbraMail.NOTEBOOK_APP);
	
	var isNew = !page || page.version == 0;
	var controller = isNew ? notebookApp.getPageEditController() : notebookApp.getNotebookController();
	controller.show(page);
};

ZmNotebookObjectHandler.prototype.getToolTipText =
function(keyword, context) {
	// TODO: i18n
	var text = [ "<b>Keyword:</b> '", context.keyword, "'" ];
	if (context.keyword != context.label) {
		text.push("<br>", "<b>Label:</b> '", context.label, "'");
	}
	return text.join("");
};

ZmNotebookObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};

// Protected methods

ZmNotebookObjectHandler.prototype._getHtmlContent =
function(html, idx, keyword, context) {
   	html[idx++] = AjxStringUtil.htmlEncode(keyword);
	return idx;
};
