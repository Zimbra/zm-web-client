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
 * Static utility class.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtUtil', {

	singleton: true,

	alternateClassName: 'ZCS.util',

	getAppFromObject: function(obj) {

		var path = Ext.getDisplayName(obj),
			parts = path && path.split('.'),
			app;

		app = (parts.length >= 3 && parts[0] === 'ZCS' && parts[2]);
		return ZCS.constant.TAB_TITLE[app] ? app : '';
	},

	/**
	 * Returns just the last part of the class name, without the preceding
	 * namespace or path.
	 *
	 * @param {object}  obj     object (instance of a class)
	 */
	getClassName: function(obj) {

		var className = Ext.getClassName(obj),
			parts = className && className.split('.');

		return parts ? parts[parts.length - 1] : '[unknown]';
	},

	/**
	 * Returns the class name of the store, without the initial name-spacing parts.
	 * It will typically be passed to Ext.getStore().
	 */
	getStoreShortName: function(controller) {
		var parts = controller.getStores()[0].split('.');
		return parts[parts.length - 1];
	},

	/**
	 * Converts an array of scalar values into a lookup hash where each value is a key.
	 *
	 * @param {array}       array to convert
	 * @return {object}     lookup hash
	 */
	arrayAsLookupHash: function(array) {
		var hash = {};
		Ext.each(array, function(member) {
			hash[member] = true;
		});
		return hash;
	},

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
		window.scrollTo(0,0);
	},

	/**
	 * Parses a possibly compound ID into account and local parts, and returns
	 * them in an object. If the ID is not a compound ID, then the account ID is
	 * set to the current account ID.
	 *
	 * @param {string}  id      item ID
	 *
	 * @return {object}     object with 'accountId' and 'localId' properties
	 */
	parseId: function(id) {

		var result = {
			isRemote: false
		};

		if (id.indexOf(':') > 0) {
			var parts = id.split(':');
			result.accountId = parts[0];
			result.localId = parts[1];
			result.isRemote = true;
		}
		else {
			result.accountId = ZCS.session.getAccountId();
			result.localId = id;
		}

		return result;
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
	 * Converts the string to HTML, replacing tabs and returns. Optionally turns blocks of
	 * quoted content (which use > or | to mark quoted text) into <blockquote> sections.
	 *
	 * @param {string}	str		                the string
	 * @param {boolean} convertQuotedContent    if true, convert quoted content into blockquotes
	 * @return	{string}	the resulting string
	 */
	convertToHtml: function(str, convertQuotedContent) {

		var openTag = '<blockquote>',
			closeTag = '</blockquote>',
			prefix_re = /^(>|&gt;|\|\s+)/,
			lines, lineLevel,
			level = 0;

		if (!str) {
			return '';
		}

		str = Ext.String.htmlEncode(str);
		if (convertQuotedContent) {
			// Convert a section of lines prefixed with > or |
			// to a section encapsulated in <blockquote> tags
			lines = str.split(/\r?\n/);
			level = 0;
			Ext.each(lines, function(line, index) {
				if (line.length > 0) {
					lineLevel = 0;
					// Remove prefixes while counting how many there are on the line
					while (line.match(prefix_re)) {
						line = line.replace(prefix_re, "");
						lineLevel++;
					}
					// If the lineLevel has changed since the last line, add blockquote start or end tags, and adjust level accordingly
					while (lineLevel > level) {
						line = openTag + line;
						level++;
					}
					while (lineLevel < level) {
						lines[index - 1] = lines[index - 1] + closeTag;
						level--;
					}
				}
				lines[index] = line;
			}, this);

			while (level > 0) {
				lines.push(closeTag);
				level--;
			}

			str = lines.join('\n');
		}

		str = str
			.replace(/\t/mg, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
			.replace(/\r?\n/mg, '<br>');

		return str;
	}
});
