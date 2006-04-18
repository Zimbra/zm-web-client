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

function ZmWiklet() {
}

// Data

ZmWiklet._wiklets = {};

ZmWiklet.prototype.name;
ZmWiklet.prototype.tooltip;
ZmWiklet.prototype.params;

// Static functions

ZmWiklet.register = function(wiklet) {
	for (var i = 0; i < arguments.length; i++) {
		ZmWiklet._wiklets[arguments[i].name] = arguments[i];
	}
};
ZmWiklet.unregister = function(name) {
	delete ZmWiklet._wiklets[name];
};
ZmWiklet.getWiklets = function() {
	return ZmWiklet._wiklets;
};
ZmWiklet.getWikletByName = function(name) {
	return ZmWiklet._wiklets[name];
};

// Protected methods

ZmWiklet._formatUser = function(name, link) {
	// TODO: add link around name?
	return name;
};

ZmWiklet._dateFormatters = {};
ZmWiklet._formatDate = function(type, style, date) {
		var formatter;
		if (style) {
			var pattern = ["{0",type,style,"}"].join();
			if (!ZmWiklet._dateFormatters[pattern]) {
				ZmWiklet._dateFormatters[pattern] = new AjxMessageFormat(pattern);
			}
			formatter = ZmWiklet._dateFormatters[pattern];
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

ZmWiklet.__parseValueAsParams = function(s) {
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

ZmWiklet.__object2Array = function(o, re) {
	var a = [];
	for (var p in o) {
		var op = o[p];
		if (!re.test(op.name)) continue;
		a.push(op);
	}
	return a;
};
ZmWiklet.__byNoteName = function(a, b) {
	var aname = a.name.toLowerCase();
	var bname = b.name.toLowerCase();
	if (aname < bname) return -1;
	if (aname > bname) return  1;
	return 0;
};

// REGISTER KNOWN WIKLETS

ZmWiklet.register(
	{ 
		name: "NAME",
		tooltip: ZmMsg.wikletNameTT,
		func: function(name, value, params, context) {
			var name = context.getItem().name;
			return name == ZmNotebook.PAGE_INDEX ? ZmMsg.wikiToc : name;
		}
	},
	{
		name: "ICON",
		tooltip: ZmMsg.wikletIconTT,
		func: function(name, value, params, context) {
			var imgName = "Page";
			var item = context.getItem();
			if (item instanceof ZmNotebook) {
				imgName = item.parent.id == ZmOrganizer.ID_ROOT ? "Notebook" : "Section";
			}
			return ["<div class='Img",imgName," _pageIcon'></div>"].join("");
		}
	},
	{
		name: "COLOR",
		tooltip: ZmMsg.wikletColorTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			if (item.folderId) {
				item = context.getNotebookById(item.folderId);
			}
			var index = item.color || 0;
			return ZmCalendarTreeController.COLOR_CLASSNAMES[index];
		}
	},
	{
		name: "FRAGMENT",
		tooltip: ZmMsg.wikletFragmentTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			return item.fragment || "";
		}
	},
	{
		name: "MSG",
		tooltip: ZmMsg.wikletMsgTT,
		params: "messageKey",
		func: function(name, value, params, context) {
			return value && ZmMsg[value] ? ZmMsg[value] : value;
		}
	},
	{
		name: "INCLUDE",
		tooltip: ZmMsg.wikletIncludeTT,
		params: "PageName",
		func: function(name, value, params, context) {
			// check for recursive include
			var itemCount = context.getItemCount();
			for (var i = itemCount - 1; i >= 0; i--) {
				var item = context.getItemAt(i);
				// TODO: also check folderId
				if (item.name == params.page) {
					var formatter = new AjxMessageFormat(ZmMsg.wikiIncludeRecursion);
					return formatter.format(params.page);
				}
			}
			
			// include note
			var item = context.getItem();
			var recurseUp = (params.lookup && params.lookup.toLowerCase() == 'true');
			if (item.folderId) {
				var note = context.getNoteByName(item.folderId, params.page, recurseUp);
				if (note) {
					context.pushItem(note);
					return note.getContent();
				}
			}
			
			// no such note
			var formatter = new AjxMessageFormat(ZmMsg.wikiIncludeMissing);
			return formatter.format(params.page);
		}
	},
	{
		name: "CREATOR",
		tooltip: ZmMsg.wikletCreatorTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatUser(item.creator, params.link);
		}
	},
	{
		name: "MODIFIER",
		tooltip: ZmMsg.wikletModifierTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			var uname = item.modifier || item.creator;
			return ZmWiklet._formatUser(uname, params.link);
		}
	},
	{
		name: "CREATEDATE",
		tooltip: ZmMsg.wikletCreateDateTT,
		params: "medium",
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatDate("date", value, item.createDate);
		}
	},
	{
		name: "CREATETIME",
		tooltip: ZmMsg.wikletCreateTimeTT,
		params: "short",
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatDate("time", value, item.createDate);
		}
	},
	{
		name: "MODIFYDATE",
		tooltip: ZmMsg.wikletModifyDateTT,
		params: "medium",
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatDate("date", value, item.modifyDate);
		}
	},
	{
		name: "MODIFYTIME",
		tooltip: ZmMsg.wikletModifyTimeTT,
		params: "short",
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatDate("time", value, item.modifyDate);
		}
	},
	{
		name: "VERSION",
		tooltip: ZmMsg.wikletVersionTT,
		func: function(name, value, params, context) {
			return String(context.getItem().version);
		}
	},
	{
		name: "TOC",
		tooltip: ZmMsg.wikletTocTT,
		params: "page = '*'",
		func: function(name, value, params, context) {
			var item = context.getItem();
			var folderId = item instanceof ZmNote ? item.folderId : item.id;
			var nameRe = /^[^_]/;
			if (params.page) {
				var reSource = params.page;
				reSource = reSource.replace(/\?/g, ".");
				reSource = reSource.replace(/\*/g, ".*");
				reSource = reSource.replace(/([\[\(\{\+\.])/g, "\\$1");
	
				nameRe = new RegExp("^" + reSource + "$", "i");
			}
			
			var notes = context.getNotes(folderId);
			notes = ZmWiklet.__object2Array(notes, nameRe);
			notes.sort(ZmWiklet.__byNoteName);
			if (params.sort == "descending") {
				notes.reverse();
			}
			
			var content = [];
			//content.push("<div class='WikiTOC'>");
			if (notes.length == 0) {
				content.push("{{MSG wikiPagesNotFound}}");
			}
			else switch (params.format || "list") {
				case "list": {
					content.push("<ul class='_toc_list'>");
					for (var i = 0; i < notes.length; i++) {
						var note = notes[i];
						content.push(
							"<li class='_pageLink'>",
								"[[", note.name, "]]",
							"</li>"
						);
					}
					content.push("</ul>");
					break;
				}
				case "template": {
					var folderId = context.getItem().folderId;
					
					var itemTemplate = context.getNoteByName(folderId, (params.itemTemplate || "_TOC_ITEM_TEMPLATE_"), true);
					var itemContent = itemTemplate ? itemTemplate.getContent() : [
						// REVISIT
						"<tr>",
							"<td class='_pageIcon'>{{ICON}}</td>",
							"<td class='_pageLink'>[[{{NAME}}]]</td>",
							"<td class='_tocAuthor'>{{MODIFIER}}</td>",
							"<td class='_tocHistory'>{{MODIFYDATE}}</td>",
						"</tr>",
						"<tr>",
							"<td></td>",
							"<td class='_tocFragment' colspan='4'>{{FRAGMENT}}</td>",
						"</tr>"
					].join("");
					for (var i = 0; i < notes.length; i++) {
						var length = context.getItemCount();
						try {
							context.pushItem(notes[i]);
							content.push(ZmWikletProcessor._process(itemContent));
						}
						catch (e) {
							DBG.println("error processing toc item: "+e);
						}
						context.setItemCount(length);
					}

					var bodyTemplate = context.getNoteByName(folderId, (params.bodyTemplate || "_TOC_BODY_TEMPLATE_"), true);
					var bodyContent = bodyTemplate ? bodyTemplate.getContent() : [
						// REVISIT
						"<table class='_tocIconTable'>",
							"<tr>",
								"<td></td>",
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
						content.push(
							"<span class='_pageLink'>",
								"[[", note.name, "]]",
							"</span>"
						);
					}
					content.push("</span>");
					break;
				}
			}
			//content.push("</div>");
			return content.join("");
		}
	},
	{
		name: "BREADCRUMBS",
		tooltip: ZmMsg.wikletBreadcrumbsTT,
		func: function(name, value, params, context) {
			// TODO: params.page
			
			// get breadcrumb trail
			var note = context.getItem();
			var notebook = context.getNotebookById(note.folderId);
			
			var trail = [];
			while (notebook.id != ZmOrganizer.ID_ROOT) {
				trail.unshift(notebook);
				notebook = context.getNotebookById(notebook.parent.id);
			}
			
			// generate content
			var content = [];
			switch (params.format || "simple") {
				case "template": {
					var folderId = note.folderId;
					
					var separatorTemplate = context.getNoteByName(folderId, (params.separatorTemplate || '_BREADCRUMB_SEPARATOR_'), true);
					var separatorContent = separatorTemplate ? separatorTemplate.getContent() : "<td class='_breadcrumb_separator'> &raquo; </td>";
					
					var itemTemplate = context.getNoteByName(folderId, (params.itemTemplate || '_BREADCRUMB_ITEM_TEMPLATE_'), true);
					var itemContent = itemTemplate ? itemTemplate.getContent() : [
						// REVISIT
						"<td class='_pageIcon'>{{ICON}}</td>",
						"<td class='_pageLink'>{{NAME}}</td>"
					].join("");
					for (var i = 0; i < trail.length; i++) {
						if (i > 0) {
							content.push(separatorContent); // REVISIT: Should this be evaluated?
						}
						var length = context.getItemCount();
						try {
							context.pushItem(trail[i]);
							content.push(ZmWikletProcessor._process(itemContent));
						}
						catch (e) {
							DBG.println("error processing breadcrumb item: "+e);
						}
						context.setItemCount(length);
					}
					
					var bodyTemplate = context.getNoteByName(folderId, (params.bodyTemplate || '_BREADCRUMB_BODY_TEMPLATE_'), true);
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
);
