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

	alternateClassName: 'ZCS.util.html',

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
			Ext.each(params.qsArgs, function(name) {
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
	 * @private
	 */
	fixSmileys: function(html) {
		return html.replace(/<span style=["']font-family:Wingdings["']>J<\/span>/gi, '\u263a')  // :)
			.replace(/<span style=["']font-family:Wingdings["']>L<\/span>/gi, '\u2639'); // :(
	}
});
