/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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

/**
 * HTML and DOM-related utilities.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtHtmlUtil', {

	singleton: true,

	alternateClassName: 'ZCS.htmlutil',

	/**
	 * Removes HTML tags from the given string, using a regex.
	 *
	 * @param {string}	str			text from which to strip tags
	 * @param {boolean}	removeContent	if <code>true</code>, also remove content within tags
	 * @return	{string}	a tagless string
	 */
	stripTags: function(str, removeContent) {

		if (!str) {
			return '';
		}
		if (removeContent) {
			str = str.replace(/(<(\w+)[^>]*>).*(<\/\2[^>]*>)/, '$1$3');
		}
		return str.replace(/<\/?[^>]+>/gi, '');
	},

	/**
	 * Resets the scroll of the window, which often gets messed up in Safari on iOS
	 * after animations or orientation change events.
	 */
	resetWindowScroll: function () {
		window.scrollTo(0, 0);
	},

	/**
	 * Creates a URL out of the given components, using the current location as a default.
	 *
	 * @param params	[hash]		hash of params:
	 *        relative	[boolean]*	if true, return a relative URL
	 *        protocol	[string]*	protocol (trailing : is optional)
	 *        host		[string]*	server hostname
	 *        port		[int]*		server port
	 *        path		[string]*	URL path
	 *        qsReset	[boolean]*	if true, clear current query string
	 *        qsArgs	[hash]*		set of query string names and values
	 *
	 * @return {string} a complete URL
	 * @adapts AjxUtil.formatUrl
	 */
	buildUrl: function(params) {

		params = params || {};

		var url = [],
			i = 0,
			proto = params.protocol || location.protocol,
			host = params.host || location.hostname,
			port = Number(params.port || location.port),
			path = params.path || location.pathname,
			qs = '',
			qsArgs = [];

		if (!params.relative) {
			if (proto.indexOf(':') === -1) {
				proto += ':';
			}
			url[i++] = proto + '//' + host;
			if (port && ((proto === 'http:' && port !== 80) || (proto === 'https:' && port !== 443))) {
				url[i++] =  ':';
				url[i++] = port;
			}
		}
		url[i++] = path;
		if (params.qsArgs) {
			Ext.Object.each(params.qsArgs, function(name) {
				qsArgs.push(name + '=' + params.qsArgs[name]);
			});
			qs = '?' + qsArgs.join('&');
		} else {
			qs = params.qsReset ? '' : location.search;
		}
		url[i++] = qs;

		return url.join('');
	},

	/**
	 * Calculates an element's height based on its computed style.
	 *
	 * @param {Element}     el          an element
	 * @param {Document}    doc         its owning document
	 *
	 * @return {int}    the height of the element
	 */
	getHeightFromComputedStyle: function(el, doc) {
		doc = doc || window.document;
		var styleObj = doc.defaultView.getComputedStyle(el);
		return parseInt(styleObj.height);
	},

	/**
	 * Calculates an element's height by summing the heights of its child nodes.
	 *
	 * @param {Element}     el          an element
	 * @param {Document}    doc         its owning document
	 *
	 * @return {int}    the height of the element
	 */
	getHeightFromChildren: function(el, doc) {

		var height = 0,
			ln = el ? el.childNodes.length : 0,
			i, child, styleObj;

		doc = doc || window.document;

		Ext.Logger.iframe(ln + ' child nodes');
		for (i = 0; i < ln; i++) {
			child = el.childNodes[i];
			if (child && child.nodeType === Node.ELEMENT_NODE) {
				height += child.offsetHeight;
				styleObj = doc.defaultView.getComputedStyle(child);
				if (styleObj) {
					height += parseInt(styleObj.marginTop) + parseInt(styleObj.marginBottom);
				}
			}
		}

		return height;
	},

	/**
	 * Replaces Microsoft-specific emoticons (Wingdings) with their Unicode equivalents.
	 * When that doesn't happen, you see a bare J or L hanging out.
	 *
	 * @param {string}  html
	 */
	fixSmileys: function(html) {
		return html.replace(/<span style=["']font-family:Wingdings["']>J<\/span>/gi, '\u263a')  // :)
			.replace(/<span style=["']font-family:Wingdings["']>L<\/span>/gi, '\u2639'); // :(
	},

	/**
	 * Hides any content-ID image by changing its 'src' attribute.
	 *
	 * @param {String}  html    HTML to fix
	 * @return {String} fixed HTML
	 */
	hideCidImages: function(html) {
		return html.replace(ZCS.constant.REGEX_IMG_SRC_CID, '<img pnsrc="cid:');
	},

	/**
	 * Removes non-content HTML from the beginning and end. The idea is to remove anything that would
	 * appear to the user as blank space. This function is an approximation since that's hard to do,
	 * especially when dealing with HTML as a string.
	 *
	 * @param {String}  html    HTML to fix
	 * @return {String} trimmed HTML
	 * @adapts AjxStringUtil.trimHtml
	 */
	trimHtml: function(html) {

		if (!html) {
			return '';
		}

		// remove doc-level tags if they don't have attributes
		Ext.each(['html', 'head', 'body'], function(node) {
			var nodeLc = '<' + node + '>',
				nodeUc = '<' + node.toUpperCase + '>',
				regex;
			if (html.indexOf(nodeLc) !== -1 || html.indexOf(nodeUc) !== -1) {
				regex = new RegExp('<\\/?' + node + '>', 'gi');
				html = html.replace(regex, '');
			}
		});

		// remove empty surrounding <div> containers, and leading/trailing <br>
		var len = 0;
		while ((html.length !== len) &&
			((/^<?div>/i.test(html) && /<\/div>$/i.test(html)) ||
				/^<br ?\/?>/i.test(html) || /<br ?\/?>$/i.test(html))) {

			len = html.length;	// loop prevention
			html = html.replace(/^<div>/i, "").replace(/<\/div>$/i, '');
			html = html.replace(/^<br ?\/?>/i, "").replace(/<br ?\/?>$/i, '');
		}

		// remove trailing <br> trapped in front of closing tags
		var m = html && html.match(/((<br ?\/?>)+)((<\/\w+>)+)$/i);
		if (m && m.length) {
			var regex = new RegExp(m[1] + m[3] + '$', 'i');
			html = html.replace(regex, m[3]);
		}

		// remove empty internal <div> containers
		html = html.replace(/(<div><\/div>)+/gi, '');

		return Ext.String.trim(html);
	},

	/**
	 * Removes empty HTML from the beginning and end, then wraps the result in a DIV>
	 *
	 * @param {String}  html        HTML as a string
	 * @return {String}     trimmed and wrapped HTML
	 */
	trimAndWrapContent: function(html) {

		html = ZCS.htmlutil.trimHtml(html);

		if (/<body/i.test(html)) {
			html = html.replace(/(<body[^>]*>)/, '$1<div>')
					   .replace('<\/body>', '</body></div>');
		}
		else {
			html = '<div>' + html + '</div>';
		}

		return html;
	}
});
