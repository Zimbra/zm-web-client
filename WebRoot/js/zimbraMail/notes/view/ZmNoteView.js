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
	var chrome = cache.getNoteByName(note.folderId, ZmNotebook.PAGE_CHROME);
	var chromeContent = chrome.getContent();

	var content = chromeContent;
	if (note.name != ZmNotebook.PAGE_CHROME) {
		var pageContent = note.getContent();
		content = chromeContent.replace(/\{\{CONTENT\}\}/ig, pageContent);
	}
	content = this._processWiklets(content, note);

	element.innerHTML = content;
	this._renderFindObjects(element);
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

ZmNoteView.prototype._processWiklets = function(content, note) {
	// global values needed by _replaceWiklet
	ZmNoteView._cache = this._controller._app.getNoteCache();
	ZmNoteView._context = [ note ];
	
	// process wiklets in content
	return ZmNoteView._processWiklets(content);
}

ZmNoteView._processWiklets = function(content) {
	var regex = /(?=^|[^\\])\{\{\s*(.+?)(?:\s+(.*?))?\s*\}\}/g;
	return content.replace(regex, ZmNoteView._replaceWiklet);
};

ZmNoteView._replaceWiklet = function(match, name, value) {
	var content = match;
	var wiklet = ZmNoteView.WIKLETS[name];
	if (wiklet) {
		var params = ZmNoteView.__parseValueAsParams(value);
		var cache = ZmNoteView._cache;
		var context = ZmNoteView._context;

		var length = context.length;
		try {
			content = wiklet.func(name, value, params, cache, context);
			content = ZmNoteView._processWiklets(content);
		}
		catch (e) {
			DBG.println("error when processing wiklets: "+e);
		}
		context.length = length;
	}
	return content;
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
	"NAME": {
		tooltip: ZmMsg.wikletNameTT,
		func: function(name, value, params, cache, context) {
			var name = context[context.length - 1].name;
			return name == ZmNotebook.PAGE_INDEX ? ZmMsg.wikiToc : name;
		}
	},
	"ICON": {
		tooltip: ZmMsg.wikletIconTT,
		func: function(name, value, params, cache, context) {
			var imgName = "Page";
			var item = context[context.length - 1];
			if (item instanceof ZmNotebook) {
				imgName = item.parent.id == ZmOrganizer.ID_ROOT ? "Notebook" : "Section";
			}
			return ["<div class='Img",imgName," _icon'></div>"].join("");
		}
	},
	"COLOR": {
		tooltip: ZmMsg.wikletColorTT,
		func: function(name, value, params, cache, context) {
			var folderId = context[context.length - 1].folderId;
			var notebookTree = cache._appCtxt.getTree(ZmOrganizer.NOTEBOOK); // REVISIT !!!
			var notebook = notebookTree.getById(folderId);
			var index = notebook.color || 0;
			return ZmCalendarTreeController.COLOR_CLASSNAMES[index];
		}
	},
	"FRAGMENT": {
		tooltip: ZmMsg.wikletFragmentTT,
		func: function(name, value, params, cache, context) {
			var note = context[context.length - 1].name;
			return note.fragment || "";
		}
	},
	"MSG": {
		tooltip: ZmMsg.wikletMsgTT,
		params: "messageKey",
		func: function(name, value, params, cache, context) {
			return value && ZmMsg[value] ? ZmMsg[value] : "{{"+name+"}}";
		}
	},
	"INCLUDE": {
		tooltip: ZmMsg.wikletIncludeTT,
		params: "PageName",
		func: function(name, value, params, cache, context) {
			// check for recursive include
			for (var i = context.length - 1; i >= 0; i--) {
				var note = context[i];
				// TODO: also check folderId
				if (note.name == value) {
					var formatter = new AjxMessageFormat(ZmMsg.wikiIncludeRecursion);
					return formatter.format(value);
				}
			}
			
			// include note
			var folderId = context[context.length - 1].folderId;
			var note = cache.getNoteByName(folderId, value);
			if (note) {
				context.push(note);
				return note.getContent();
			}
			
			// no such note
			var formatter = new AjxMessageFormat(ZmMsg.wikiIncludeMissing);
			return formatter.format(value);
		}
	},
	"CREATOR": {
		tooltip: ZmMsg.wikletCreatorTT,
		func: function(name, value, params, cache, context) {
			var uname = context[context.length - 1].creator;
			return ZmNoteView._wikletFormatUser(uname, params.link);
		}
	},
	"MODIFIER": {
		tooltip: ZmMsg.wikletModifierTT,
		func: function(name, value, params, cache, context) {
			var note = context[context.length - 1];
			var uname = note.modifier || note.creator;
			return ZmNoteView._wikletFormatUser(uname, params.link);
		}
	},
	"CREATEDATE": {
		tooltip: ZmMsg.wikletCreateDateTT,
		params: "medium",
		func: function(name, value, params, cache, context) {
			var note = context[context.length - 1];
			return ZmNoteView._wikletFormatDate("date", value, note.createDate);
		}
	},
	"CREATETIME": {
		tooltip: ZmMsg.wikletCreateTimeTT,
		params: "short",
		func: function(name, value, params, cache, context) {
			var note = context[context.length - 1];
			return ZmNoteView._wikletFormatDate("time", value, note.createDate);
		}
	},
	"MODIFYDATE": {
		tooltip: ZmMsg.wikletModifyDateTT,
		params: "medium",
		func: function(name, value, params, cache, context) {
			var note = context[context.length - 1];
			return ZmNoteView._wikletFormatDate("date", value, note.modifyDate);
		}
	},
	"MODIFYTIME": {
		tooltip: ZmMsg.wikletModifyTimeTT,
		params: "short",
		func: function(name, value, params, cache, context) {
			var note = context[context.length - 1];
			return ZmNoteView._wikletFormatDate("time", value, note.modifyDate);
		}
	},
	"VERSION": {
		tooltip: ZmMsg.wikletVersionTT,
		func: function(name, value, params, cache, context) {
			return String(context[context.length - 1].version);
		}
	},
	"TOC": {
		tooltip: ZmMsg.wikletTocTT,
		params: "page = '*'",
		func: function(name, value, params, cache, context) {
			var folderId = context[context.length-1].folderId;
			var nameRe = /^[^_]/;
			if (params.page) {
				var reSource = params.page;
				reSource = reSource.replace(/\?/g, ".");
				reSource = reSource.replace(/\*/g, ".*");
				reSource = reSource.replace(/([\[\(\{\+\.])/g, "\\$1");
	
				nameRe = new RegExp("^" + reSource + "$", "i");
			}
			
			var notes = cache.getNotesInFolder(folderId);
			notes = ZmNoteView.__object2Array(notes, nameRe);
			notes.sort(ZmNoteView.__byNoteName);
			if (params.sort == "descending") {
				notes.reverse();
			}
			
			var content = [];
			//content.push("<div class='WikiTOC'>");
			if (notes.length == 0) {
				content.push("{{MSG wikiPagesNotFound}}");
			}
			else switch (params.format || "simple") {
				case "list": {
					content.push("<ul class='_toc_list'>");
					for (var i = 0; i < notes.length; i++) {
						var note = notes[i];
						content.push("<li class='_pageLink'>[[", note.name, "]]</li>");
					}
					content.push("</ul>");
				}
				case "template": {
					var folderId = context[context.length - 1].folderId;
					
					var itemTemplate = params.itemTemplate ? cache.getNoteByName(folderId, params.itemTemplate) : null;
					var itemContent = itemTemplate ? itemTemplate.getContent() : [
						// REVISIT
						"<tr>",
							"<td class='_pageIcon'>{{ICON}}</td>",
							"<td class='_pageLink'>[[{{NAME}}]]</td>",
							"<td class='_author'>{{MODIFIER}}</td>",
							"<td class='_history'>&bull;{{MODIFYDATE}}</td>",
						"</tr>",
						"<tr>",
							"<td></td>",
							"<td class='_fragment' colspan='4'>{{FRAGMENT}}</td>",
						"</tr>"
					].join("");
					for (var i = 0; i < notes.length; i++) {
						var length = context.length;
						try {
							context.push(notes[i]);
							content.push(ZmNoteView._processWiklets(itemContent));
						}
						catch (e) {
							DBG.println("error processing toc item: "+e);
						}
						context.length = length;
					}

					var bodyTemplate = params.bodyTemplate ? cache.getNoteByName(folderId, params.bodyTemplate) : null;
					var bodyContent = bodyTemplate ? bodyTemplate.getContent() : [
						// REVISIT
						"<table class='_toc_icon_table'>",
							"<tr>",
								"<td colspan='4' class='_tocHead'>{{NAME}}</td>",
							"</tr>",
							"{{CONTENT}}",
						"</table>"
					].join("");
					content = [ bodyContent.replace(/\{\{CONTENT\}\}/g, content.join("")) ];
					break;
				}
				case "simple": default: {
					content.push("<span class='_toc_simple'>");
					for (var i = 0; i < notes.length; i++) {
						var note = notes[i];
						content.push("<span class='_pageLink'>[[", note.name, "]]</span>");
					}
					content.push("</span>");
					break;
				}
			}
			//content.push("</div>");
			return content.join("");
		}
	},
	"BREADCRUMBS": {
		tooltip: ZmMsg.wikletBreadcrumbsTT,
		func: function(name, value, params, cache, context) {
			// TODO: params.page
			
			// get breadcrumb trail
			var note = context[context.length - 1];
			var notebookTree = cache._appCtxt.getTree(ZmOrganizer.NOTEBOOK); // REVISIT!!!
			var notebook = notebookTree.getById(note.folderId);
			
			var trail = [];
			while (notebook.id != ZmOrganizer.ID_ROOT) {
				trail.unshift(notebook);
				notebook = notebookTree.getById(notebook.parent.id);
			}
			
			// generate content
			var content = [];
			switch (params.format || "simple") {
				case "template": {
					var folderId = note.folderId;
					
					var separatorTemplate = params.separatorTemplate ? cache.getNoteByName(folderId, params.separatorTemplate) : null;
					var separatorContent = separatorTemplate ? separatorTemplate.getContent() : "<td class='_breadcrumb_separator'> &raquo; </td>";
					
					var itemTemplate = params.itemTemplate ? cache.getNoteByName(folderId, params.itemTemplate) : null;
					var itemContent = itemTemplate ? itemTemplate.getContent() : [
						// REVISIT
						"<td class='_pageIcon'>{{ICON}}</td>",
						"<td class='_pageLink'>{{NAME}}</td>"
					].join("");
					for (var i = 0; i < trail.length; i++) {
						if (i > 0) {
							content.push(separatorContent); // REVISIT: Should this be evaluated?
						}
						var length = context.length;
						try {
							context.push(trail[i]);
							content.push(ZmNoteView._processWiklets(itemContent));
						}
						catch (e) {
							DBG.println("error processing breadcrumb item: "+e);
						}
						context.length = length;
					}
					
					var bodyTemplate = params.bodyTemplate ? cache.getNoteByName(folderId, params.bodyTemplate) : null;
					var bodyContent = bodyTemplate ? bodyTemplate.getContent() : [
						// REVISIT
						"<table class='_breadcrumb_table'>",
							"<tr>",
								"{{CONTENT}}",
							"</tr>",
						"</table>"
					].join("");
					content = [ bodyContent.replace(/\{\{CONTENT\}\}/g, content.join("")) ];
					break;
				}
				case "simple": default: {
					content.push("<span class='_breadcrumbs_simple'>");
					for (var i = 0; i < trail.length; i++) {
						if (i > 0) {
							content.push(" &raquo; ");
						}
						var crumb = trail[i];
						var path = crumb.name; // TODO !!!
						content.push("<span class='_pageLink'>[[", path, "]]</span>");
					}
					content.push("</span>");
					break;
				}
			}
			return content.join("");
		}
	}
};

ZmNoteView._wikletFormatUser = function(name, link) {
	// TODO: add link around name
	return name;
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
		else if (type == "time") {
			formatter = AjxDateFormat.getTimeInstance();
		}
		else { // type == "date"
			formatter = AjxDateFormat.getDateInstance();
		}
		
		return formatter.format(date);
};

// Utility functions

ZmNoteView.__parseValueAsParams = function(s) {
	var params = {};

	var re = /([a-z]+)\s*=\s*(?:'(.*?)'|"(.*?)"|(\S+))/g;
	var m;
	while (m = re.exec(s)) {
		var pname = m[1].toLowerCase();
		var pvalue = m[2] || m[3] || m[4] | "";
		params[pname] = pvalue;
	}
	
	return params;
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