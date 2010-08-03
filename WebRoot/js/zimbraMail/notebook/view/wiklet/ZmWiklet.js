/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmWiklet = function() {
}

// Constants

ZmWiklet.RE_WIKLET = new RegExp("<wiklet(?:\\s((?:.|\\n)*?))(?:\\/>|>((?:.|\\n)*?)<\\/wiklet(?:\\s[^>]*)?>)", "ig");
ZmWiklet.RE_NOWIKLET = new RegExp("<nowiklet>((?:.|\n)*?)<\\/nowiklet>", "ig");
ZmWiklet.RE_CONTENT = new RegExp("<wiklet\\s[^>]*?class\\s*=\\s*['\"]?CONTENT['\"](?:.|\\n)*?(?:/>|(?:.|\\n)*?</wiklet(?:\\s[^>]*)?>)","ig");

// Data

ZmWiklet._wiklets = {};

ZmWiklet.prototype.name;
ZmWiklet.prototype.tooltip;
ZmWiklet.prototype.params;

// Static functions

ZmWiklet.register = function(wiklet) {
	for (var i = 0; i < arguments.length; i++) {
		ZmWiklet._wiklets[arguments[i].name.toUpperCase()] = arguments[i];
	}
};
ZmWiklet.unregister = function(name) {
	delete ZmWiklet._wiklets[name.toUpperCase()];
};
ZmWiklet.getWiklets = function() {
	return ZmWiklet._wiklets;
};
ZmWiklet.getWikletByName = function(name) {
	return ZmWiklet._wiklets[name.toUpperCase()];
};

// Protected methods

ZmWiklet._formatUser = function(name, link) {
	// TODO: add link around name?
	return name;
};

ZmWiklet._dateFormatters = {};
ZmWiklet._formatDate = function(params, date) {
	if (!date) return "";
	var type = params.type || "shortdateandtime"; // REVISIT: what is the default length?
	if (type == "pattern") {
		var pattern = params.pattern || "";
		if (!ZmWiklet._dateFormatters[pattern]) {
			ZmWiklet._dateFormatters[pattern] = new AjxDateFormat(pattern);
		}
		return ZmWiklet._dateFormatters[pattern].format(date);
	}
	
	var formatter;
	var m;
	if ((m = type.match(/^(short|medium|long|full)(date|time)(?:and(date|time))?$/i))) {
		var func = ZmWiklet._formatDateFuncs[ m[3] ? m[2]+m[3] : m[2] ];
		var length1 = ZmWiklet._formatDateLengths[ m[1] ];
		var length2 = ZmWiklet._formatDateLengths[ m[1] ];
		formatter = func(length1, length2);
	}
	else {
		// REVISIT
		formatter = AjxDateFormat.getDateInstance(AjxDateFormat.LONG);
	}
	
	return formatter.format(date);
};
ZmWiklet._formatDateFuncs = {
	date: AjxDateFormat.getDateInstance,
	time: AjxDateFormat.getTimeInstance,
	datetime: AjxDateFormat.getDateTimeInstance
};
ZmWiklet._formatDateLengths = {
	medium: AjxDateFormat.MEDIUM,
	full: AjxDateFormat.FULL
};
// MOW:  "short" and "long" seem to be reserved words in IE,
//			so assigning inline above was causing script errors
ZmWiklet._formatDateLengths["short"] = AjxDateFormat.SHORT;
ZmWiklet._formatDateLengths["long"] = AjxDateFormat.LONG;


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
ZmWiklet.__byItemName = function(a, b) {
	var aname = a.name.toLowerCase();
	var bname = b.name.toLowerCase();
	if (aname < bname) return -1;
	if (aname > bname) return  1;
	return 0;
};

// REGISTER KNOWN WIKLETS

ZmWiklet.register(
	{
		name: "URL",
		label: ZmMsg.wikletUrl,
		tooltip: ZmMsg.wikletUrlTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			var displayName = name == ZmNotebook.PAGE_INDEX ? ZmMsg.wikiToc : item.name;
			var folderId;
			var name;
			if (item instanceof ZmPage) {
				folderId = item.folderId;
				name = item.name;				
			} else {
				folderId = item.id;
				name = ZmNotebook.PAGE_INDEX;
			}
			return ["[[:", folderId, '/', name, "|", displayName, "]]"].join("");
		}
	},
	{
		name: "NAME",
		label: ZmMsg.wikletName,
		tooltip: ZmMsg.wikletNameTT,
		func: function(name, value, params, context) {
			var name = context.getItem().name;
			return name == ZmNotebook.PAGE_INDEX ? ZmMsg.wikiToc : name;
		}
	},
	{
		name: "ID",
		label: ZmMsg.wikletId,
		tooltip: ZmMsg.wikletIdTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			var cache = context.getCache();
			if (item instanceof ZmPage) {
				return [':', item.folderId, '/', item.name].join("");
			} else {
				return [':', item.id, '/', ZmNotebook.PAGE_INDEX].join("");
			}
		}
	},
	{
		name: "ICON",
		label: ZmMsg.wikletIcon,
		tooltip: ZmMsg.wikletIconTT,
		func: function(name, value, params, context) {
			var imgName = "Page";
			var item = context.getItem();
			if (item instanceof ZmNotebook) {
				var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
				imgName = (item.parent.id == rootId) ? "Notebook" : "Section";
			}
			return ["<div class='Img",imgName," _pageIcon'></div>"].join("");
		}
	},
	{
		name: "TAGS",
		label: ZmMsg.wikletTags,
		tooltip: ZmMsg.wikletTagsTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			if (!item.tags || item.tags.length == 0) {
				return;
			}

			var a = [];
			a.push("<table border=0><tr>");
			for (var i = 0; i < item.tags.length; i++) {
				var tag = context.getTagById(item.tags[i]);
				var color = tag ? tag.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
				var tagImageInfo = ZmTag.getIcon(color);
				a.push("<td><div class='Img",tagImageInfo,"'></div></td>");
				a.push("<td style='white-space:nowrap'>",tag.name,"</td>");
			}
			a.push("</tr></table");
			return a.join("");
		}
	},
	{
		name: "COLOR",
		label: ZmMsg.wikletColor,
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
		label: ZmMsg.wikletFragment,
		tooltip: ZmMsg.wikletFragmentTT,
		func: function(name, value, params, context) {
			// check for recursive fragment
			var item = context.getItem();
			var itemCount = context.getItemCount();
			for (var i = itemCount - 2; i >= 0; i--) {
				var prevItem = context.getItemAt(i);
				if (prevItem != item) {
					break;
				}
				if (prevItem.folderId == item.folderId && prevItem.name == item.name) {
					return ZmMsg.wikiFragmentRecursion;
				}
			}

			// return fragment
			context.pushItem(item);
            var content = item.fragment || "";
            return ["<nolink>",content,"</nolink>"].join("");
		}
	},
	{
		name: "MSG",
		label: ZmMsg.wikletMsg,
		tooltip: ZmMsg.wikletMsgTT,
		paramdefs: {
			value: {
				name: "value",
				label: ZmMsg.key,
				type: "string",
				value: "messageKey"
			}
		},
		func: function(name, value, params, context) {
			var key = params.key;
			return key && ZmMsg[key] ? ZmMsg[key] : key;
		}
	},
	{
		name: "INCLUDE",
		label: ZmMsg.wikletInclude,
		tooltip: ZmMsg.wikletIncludeTT,
		paramdefs: {
			page: {
				name: "page",
				label: ZmMsg.page,
				type: "string",
				value: "PageName"
			},
			inherit: {
				name: "inherit",
				label: ZmMsg.wikletIncludeInherit,
				type: "boolean",
				value: false
			}
		},
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

			// include page
			var item = context.getItem();
			var recurseUp = (params.inherit && params.inherit.toLowerCase() == 'true');
			if (item.folderId) {
				var page = context.getPageByName(item.folderId, params.page, recurseUp);
				if (page) {
					context.pushItem(page);
					if (name == "INLINE") {
						// NOTE: We push the original item again so that
						//       the check for recursive include above
						//       works as expected. If we didn't push
						//       the included item in this situation, it
						//       could include itself and we'd have no
						//       way of knowing.
						context.pushItem(item);
					}
					return page.getContent();
				}
			}

			// no such page
			var formatter = new AjxMessageFormat(ZmMsg.wikiIncludeMissing);
			return formatter.format(params.page);
		}
	},
	{
		name: "INLINE",
		label: ZmMsg.wikletInline,
		tooltip: ZmMsg.wikletInlineTT,
		paramdefs: {
			page: {
				name: "page",
				label: ZmMsg.page,
				type: "string",
				value: "PageName"
			},
			inherit: {
				name: "inherit",
				label: ZmMsg.wikletIncludeInherit,
				type: "boolean",
				value: false
			}
		},
		func: function(name, value, params, context) {
			var include = ZmWiklet.getWikletByName("INCLUDE");
			return include.func(name, value, params, context);
		}
	},
	{
		name: "CREATOR",
		label: ZmMsg.wikletCreator,
		tooltip: ZmMsg.wikletCreatorTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatUser(item.creator, params.link);
		}
	},
	{
		name: "MODIFIER",
		label: ZmMsg.wikletModifier,
		tooltip: ZmMsg.wikletModifierTT,
		func: function(name, value, params, context) {
			var item = context.getItem();
			var uname = item.modifier || item.creator;
			return ZmWiklet._formatUser(uname, params.link);
		}
	},
	{
		name: "CREATEDATE",
		label: ZmMsg.wikletCreateDate,
		tooltip: ZmMsg.wikletCreateDateTT,
		paramdefs: {
			type: {
				name: "type",
				label: ZmMsg.type,
				type: "enum",
				item: [
					{ label: ZmMsg.wikletDateShort, value: "shortdate" },
					{ label: ZmMsg.wikletDateLong, value: "longdate" },
					{ label: ZmMsg.wikletTimeShort, value: "shorttime" },
					{ label: ZmMsg.wikletTimeLong, value: "longtime" },
					{ label: ZmMsg.wikletDateTimeShort, value: "shortdateandtime" },
					{ label: ZmMsg.wikletDateTimeLong, value: "longdateandtime" },
					{ label: ZmMsg.pattern, value: "pattern" }
				]
			},
			pattern: {
				name: "pattern",
				label: ZmMsg.pattern,
				type: "string"
			}
		},
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatDate(params, item.createDate);
		}
	},
	{
		name: "MODIFYDATE",
		label: ZmMsg.wikletModifyDate,
		tooltip: ZmMsg.wikletModifyDateTT,
		paramdefs: {
			type: {
				name: "type",
				label: ZmMsg.type,
				type: "enum",
				item: [
					{ label: ZmMsg.wikletDateShort, value: "shortdate" },
					{ label: ZmMsg.wikletDateLong, value: "longdate" },
					{ label: ZmMsg.wikletTimeShort, value: "shorttime" },
					{ label: ZmMsg.wikletTimeLong, value: "longtime" },
					{ label: ZmMsg.wikletDateTimeShort, value: "shortdateandtime" },
					{ label: ZmMsg.wikletDateTimeLong, value: "longdateandtime" },
					{ label: ZmMsg.pattern, value: "pattern" }
				]
			},
			pattern: {
				name: "pattern",
				label: ZmMsg.pattern,
				type: "string"
			}
		},
		func: function(name, value, params, context) {
			var item = context.getItem();
			return ZmWiklet._formatDate(params, item.modifyDate || item.createDate);
		}
	},
	{
		name: "VERSION",
		label: ZmMsg.wikletVersion,
		tooltip: ZmMsg.wikletVersionTT,
		func: function(name, value, params, context) {
			return String(context.getItem().version);
		}
	},
	{
		name: "TOC",
		label: ZmMsg.wikletToc,
		tooltip: ZmMsg.wikletTocTT,
		paramdefs: {
			type: {
				name: "type",
				label: ZmMsg.type,
				type: "enum",
				item: [
					{ label: ZmMsg.pages, value: "pages" },
					{ label: ZmMsg.sections, value: "sections" },
					//{ label: ZmMsg., value: "files" },
					{ label: ZmMsg.all, value: "all" }
				]
			},
			pattern: {
				name: "pattern",
				label: ZmMsg.pattern,
				type: "string",
				value: ""
			},
			sort: {
				name: "sort",
				label: ZmMsg.sortOrder,
				type: "enum",
				item: [
					{ label: ZmMsg.ascending, value: "ascending" },
					{ label: ZmMsg.descending, value: "descending" }
				]
			},
			format: {
				name: "format",
				label: ZmMsg.format,
				type: "enum",
				item: [
					{ label: ZmMsg.simple, value: "simple" },
					{ label: ZmMsg.list, value: "list" },
					{ label: ZmMsg.template, value: "template" }
				]
			},
			bodytemplate: {
				name: "bodytemplate",
				label: ZmMsg.bodyTemplate,
				type: "string"
			},
			itemtemplate: {
				name: "itemtemplate",
				label: ZmMsg.itemTemplate,
				type: "string"
			}
		},
		func: function(name, value, params, context) {
			var item = context.getItem();
			var folderId = item instanceof ZmPage ? item.folderId : item.id;


			var nameRe = /^[^_]/;
			var re = { pages: nameRe, sections: nameRe, files: nameRe };
			var funcs = {
				pages: context.getPages,
				sections: context.getSections,
				files: context.getFiles
			};

			var items = [];
			for (var name in re) {
				if (params.type && params.type != "all" && params.type != name) {
					continue;
				}
				if (params[name]) {
					var reSource = params[name];
					reSource = reSource.replace(/([\[\(\{\+\.])/g, "\\$1");
					reSource = reSource.replace(/\?/g, ".");
					reSource = reSource.replace(/\*/g, ".*");

					re[name] = new RegExp("^" + reSource + "$", "i");
				}

				var func = funcs[name];
				var object = func.call(context, folderId);
				var array = ZmWiklet.__object2Array(object, re[name]);
				items = items.concat(array);
			}

			items.sort(ZmWiklet.__byItemName);
			if (params.sort == "descending") {
				items.reverse();
			}

			var content = [];
			//content.push("<div class='WikiTOC'>");
			if (items.length == 0) {
				content.push("<wiklet class='MSG' value='wikiPagesNotFound' />");
			}
			else switch (params.format || "list") {
				case "list": {
					content.push("<ul class='zmwiki-tocList'>");
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						content.push(
							"<li class='zmwiki-pageLink'>",
								"[[", item.name, "]]",
							"</li>"
						);
					}
					content.push("</ul>");
					break;
				}
				case "template": {
					var folderId = context.getItem().folderId;

					var itemTemplate = context.getPageByName(folderId, (params.itemTemplate || ZmNotebook.PAGE_TOC_ITEM_TEMPLATE), true);
					var itemContent = itemTemplate.getContent();
					for (var i = 0; i < items.length; i++) {
						var length = context.getItemCount();
						try {
							context.pushItem(items[i]);
							content.push(ZmWikletProcessor._process(itemContent));
						}
						catch (e) {
							DBG.println("error processing toc item: "+e);
						}
						context.setItemCount(length);
					}

					var bodyTemplate = context.getPageByName(folderId, (params.bodyTemplate || ZmNotebook.PAGE_TOC_BODY_TEMPLATE), true);
					var bodyContent = bodyTemplate.getContent();
                    content = [ bodyContent.replace(ZmWiklet.RE_CONTENT, content.join("")) ];
					break;
				}
				case "simple": default: {
					content.push("<span class='zmwiki-tocSimple'>");
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						content.push(
							"<span class='zmwiki-pageLink'>",
								"[[", items.name, "]]",
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
		name: "PATH",
		label: ZmMsg.wikletPath,
		tooltip: ZmMsg.wikletPathTT,
		paramdefs: {
			format: {
				name: "format",
				label: ZmMsg.format,
				type: "enum",
				item: [
					{ label: ZmMsg.simple, value: "simple" },
					{ label: ZmMsg.template, value: "template" }
				]
			},
			bodytemplate: {
				name: "bodytemplate",
				label: ZmMsg.bodyTemplate,
				type: "string"
			},
			itemtemplate: {
				name: "itemtemplate",
				label: ZmMsg.itemTemplate,
				type: "string"
			},
			separator: {
				name: "separator",
				label: ZmMsg.separator,
				type: "string"
			},
			links: {
				name: "links",
				label: ZmMsg.wikletPathMakeLinks,
				type: "boolean",
				value: "true"
			}
		},
		func: function(name, value, params, context) {
			// TODO: params.page

			// get path trail
			var item = context.getItem();
			var notebook = context.getNotebookById(item.folderId || (item.parent && item.parent.id));

			var trail = [];
			var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
			while (notebook.id != rootId) {
				trail.unshift(notebook);
				notebook = context.getNotebookById(notebook.parent.id);
			}

			// generate content
			var makeLinks = params.links == null || params.link == "true";
			var content = [];
			switch (params.format || "simple") {
				case "template": {
					var folderId = item.folderId;

					var separator = params.separator || "<td class='zmwiki-path_separator'>&nbsp;&raquo;&nbsp;</td>";

					var itemTemplate = context.getPageByName(folderId, (params.itemTemplate || ZmNotebook.PATH_ITEM_TEMPLATE), true);
					var itemContent = itemTemplate.getContent();
					for (var i = 0; i < trail.length; i++) {
						if (i > 0) {
							content.push(separator);
						}
						var length = context.getItemCount();
						try {
							context.pushItem(trail[i]);
							content.push(ZmWikletProcessor._process(itemContent));
						}
						catch (e) {
							DBG.println("error processing path item: "+e);
						}
						context.setItemCount(length);
					}

					var bodyTemplate = context.getPageByName(folderId, (params.bodyTemplate || ZmNotebook.PATH_BODY_TEMPLATE), true);
					var bodyContent = bodyTemplate.getContent();
                    content = [ bodyContent.replace(ZmWiklet.RE_CONTENT, content.join("")) ];
					break;
				}
				case "simple": default: {
					var separator = params.separator || " &raquo; ";

					content.push("<span class='zmwiki-pathSimple'>");
					for (var i = 0; i < trail.length; i++) {
						if (i > 0) {
							content.push(separator);
						}
						var crumb = trail[i];
						var path = crumb.name; // TODO !!!
						content.push(
							"<span class='zmwiki-pageLink'>",
								(makeLinks ? "[[" : ""),
								path,
								(makeLinks ? "]]" : ""),
							"</span>"
						);
					}
					content.push("</span>");
					break;
				}
			}
			return content.join("");
		}
	},
	{
		name: "CONTENT",
		label: null,
		tooltip: null,
		func: function(name, value, params, context) {
			return "((CONTENT))";
		}
	}
);
