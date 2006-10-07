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

ZmNotebookObjectHandler.WIKIPATH_RE = /^(?:\/\/([^\/]+))?(.*\/([^\/]+)?|.*)/;

ZmNotebookObjectHandler.URL_RE = /^((telnet:|mailto:|callto:)|((https?|ftp|gopher|news|file):\/\/))[^\s\r\n]*?$/gi;

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
    if (ZmNotebookObjectHandler.URL_RE.test(context.keyword)) {
        ZmNotebookObjectHandler.__openWindow(context.keyword);
        return;
    }

    var item = this._getItem(context);
	if (!item) {
		if (!this._formatter) {
			this._formatter = new AjxMessageFormat(ZmMsg.pageNotFound);
		}
		var appController = this._appCtxt.getAppController();
		var message = this._formatter.format(context.keyword);
		appController.popupErrorDialog(message, null, null, true);
		return;
	}
	this._selectedHandleResponse(item);
};

ZmNotebookObjectHandler.prototype._selectedHandleResponse =
function(item) {
	var appController = this._appCtxt.getAppController();
	var notebookApp = appController.getApp(ZmZimbraMail.NOTEBOOK_APP);

	if (item instanceof ZmDocument) {
		var winurl = item.getRestUrl();
        ZmNotebookObjectHandler.__openWindow(winurl);
        return;
	}

	var isNew = !item || (item.version == 0 && item.name != ZmNotebook.PAGE_INDEX);
	var controller = isNew ? notebookApp.getPageEditController() : notebookApp.getNotebookController();
	controller.show(item);
};

ZmNotebookObjectHandler.__openWindow =
function(winurl) {
    var winname = "_new";
    var winfeatures = [
        "width=",(window.outerWidth || 640),",",
        "height=",(window.outerHeight || 480),",",
        "location,menubar,",
        "resizable,scrollbars,status,toolbar"
    ].join("");

    var win = open(winurl, winname, winfeatures);
};

ZmNotebookObjectHandler.prototype.getToolTipText =
function(label, context) {
	var item = this._getItem(context);
    var isUrl = !item && ZmNotebookObjectHandler.URL_RE.test(context.keyword); 

    var imageClass = null;
    if (isUrl) {
        imageClass = "ImgHtmlDoc";
    }
    else if (item instanceof ZmDocument) {
		imageClass = "ImgGenericDoc";
	}
	else if (item) {
		imageClass = item.name == ZmNotebook.PAGE_INDEX ? 'ImgSection': 'ImgPage';
	}
	var html = [
		"<table border=0 cellpadding=0 cellspacing=0>",
			"<tr><td>",
				"<div style='border-bottom:solid black 1px;margin-bottom:0.25em'>",
				"<table width=100% border=0 cellpadding=0 cellspacing=0>",
					"<tr valign=top>",
						"<td><b>",label,"</b></td>",
						"<td align=right style='padding-left:0.5em'><div class='", imageClass, "'></div></td>",
					"</tr>",
				"</table>",
				"</div>",
			"</td></tr>",
			"<tr><td>"
	];
    if (item && item.fragment) {
        var fragment = AjxStringUtil.htmlEncode(item.fragment);
        html.push(fragment, "<br>&nbsp;");
    }
    html.push("<table border=0 cellpadding=0 cellspacing=0>");
    if (isUrl) {
        this._appendPropertyToTooltip(html, context.keyword, ZmMsg.urlLabel);
    }
    else {
        if (item) {
            this._appendPropertyToTooltip(html, item.creator, ZmMsg.userLabel);
            this._appendPropertyToTooltip(html, item.getRestUrl(), ZmMsg.urlLabel);
        }
        this._appendPropertyToTooltip(html, item ? item.getPath() : context.keyword, ZmMsg.pathLabel);
    }
    html.push("</table></td></tr></table>");
	
	return html.join("");
};

ZmNotebookObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};

// Protected methods

ZmNotebookObjectHandler.prototype._getItem =
function(context) {
	var appController = this._appCtxt.getAppController();
	var notebookApp = appController.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = notebookApp.getNotebookCache();
	// REVISIT: ZmNotebookCache#getItemByLink has to create an empty
	//          page object in the case where the item can't be found
	//          in a sub-folder! Otherwise, the page we'll be editing
	//          won't have the right folder!
	var item = null;
	try {
		var path = context.keyword;
		// The expected contents of a link keyword are ":folderId/PageName".
		if (path != context.label) {
			if (path.indexOf(':') == 0) {
				var slashIndex = path.indexOf('/', 1)
				var folderId = path.substring(1, slashIndex);
				var pageName = path.substring(slashIndex + 1);
				return cache.getItemByName(folderId, pageName);
			}
		}
		if (!item) {
			item = cache.getItemByLink(path);
		}
		if (!item && !path.match(/^\/\//)) {
			var notebookController = notebookApp.getNotebookController();
			var currentPage = notebookController.getPage();
			var folderId = path.match(/^\//) ? ZmOrganizer.ID_ROOT : (currentPage && currentPage.folderId) || ZmNotebookItem.DEFAULT_FOLDER;
			var notebook = this._getNotebook(folderId, path);
			if (notebook) {
				// NOTE: We assume the page is new if there's no entry in the cache.
				item = new ZmPage(this._appCtxt);
				item.name = path.replace(/^.*\//,"");
				item.folderId = notebook.id;
			}
		}
	}
	catch (e) {
		// ignore
	}
	return item;
};

ZmNotebookObjectHandler.prototype._getNotebook = function(folderId, path) {
	var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
	var organizer = tree.getById(folderId);
	if (path.match('/')) {
		var parts = path.replace(/^\//,"").replace(/\/[^\/]*$/,"").split('/');
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			var child = organizer.getChild(part);
			if (child == null) {
				organizer = null;
				break;
			}
			organizer = child;
		}
	}
	return organizer;
};

ZmNotebookObjectHandler.prototype._appendPropertyToTooltip =
function (html, property, label) {
	if (property) {
		html.push(
			"<tr valign=top>",
				"<td align=right style='padding-right:5px'>",
					"<b>",label,"</b>",
				"</td>",
				"<td>",property,"</td>",
			"</tr>"
		);
	}
};

ZmNotebookObjectHandler.prototype._getHtmlContent =
function(html, idx, keyword, context) {
   	html[idx++] = AjxStringUtil.htmlEncode(keyword);
	return idx;
};
