/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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
        document.body.scrollTop = 0;
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
	 * @return {Number}    the height of the element
	 */
	getHeightFromComputedStyle: function(el, doc) {
		return this.getTotalFromComputedStyle(el, doc, [ 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom' ]);
	},

	/**
	 * Calculates an element's height based on its computed style.
	 *
	 * @param {Element}     el          an element
	 * @param {Document}    doc         its owning document
	 *
	 * @return {Number}    the width of the element
	 */
	getWidthFromComputedStyle: function(el, doc) {
		return this.getTotalFromComputedStyle(el, doc, [ 'width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight' ]);
	},

	/**
	 * Totals the values of the given style attributes of an element.
	 *
	 * @param {Element}     el      element
	 * @param {Document}    doc     document
	 * @param {Array}       attrs   list of style attributes to total
	 *
	 * @return {Number}     total value
	 */
	getTotalFromComputedStyle: function(el, doc, attrs) {

		doc = doc || window.document;
		var styleObj = doc.defaultView.getComputedStyle(el),
			ln = attrs.length, i, value,
			total = 0;

		for (i = 0; i < ln; i++) {
			value = parseInt(styleObj[attrs[i]]);
			total += isNaN(value) ? 0 : value;
		}

		return total;
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

        //<debug>
		Ext.Logger.iframe(ln + ' child nodes');
        //</debug>
		for (i = 0; i < ln; i++) {
			child = el.childNodes[i];
			if (child && child.nodeType === Node.ELEMENT_NODE) {
				height += this.getHeightFromComputedStyle(child, doc);
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

		// some editors like to put every <br> in a <div>
		html = html.replace(/<div><br ?\/?><\/div>/gi, '<br>');

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
	 * Removes empty HTML from the beginning and end, then wraps the result in a DIV.
	 *
	 * @param {String}  html        HTML as a string
	 * @param {String}  className   (optional) class for wrapping DIV
	 *
	 * @return {String}     trimmed and wrapped HTML
	 */
	trimAndWrapContent: function(html, className) {

		html = ZCS.htmlutil.trimHtml(html);

		var startTag = className ? '<div class="' + className + '">' : '<div>',
			endTag = '</div>';

		if (/<body/i.test(html)) {
			html = html.replace(/(<body[^>]*>)/i, '$1' + startTag)
					   .replace(/<\/body>/i, '</body>' + endTag);
		}
		else {
			html = startTag + html + endTag;
		}

		return html;
	},

	/**
	 * Goes through the message DOM looking for images to fix, including those that are used
	 * as background images (usually in BODY or TD). Internal images will get their URLs set
	 * to grab a part from the server. External images will be hidden or shown based on a user
	 * setting.
	 *
	 * @param {ZtMailMsg}       msg                     msg being displayed
	 * @param {Element}         containerEl             top-level element of DOM
	 * @param {boolean}         hideExternalImages      if true, hide external images
	 *
	 * @return {Array}    list of hidden images
	 */
	fixImages: function(msg, containerEl, hideExternalImages, onLoadHandler) {

		if (!containerEl) {
			return [];
		}

		var	els = containerEl.getElementsByTagName('*'),
			ln = els.length,
			html = containerEl.innerHTML,
			checkBackground = (html.indexOf('dfbackground') !== -1) ||
			                  (html.indexOf('pnbackground') !== -1),
			hiddenImages = [],
			onloadHandler,
			fixedBackground = false;

		for (var i = 0; i < ln; i++) {

			var el = els[i],
				nodeName = el.nodeName.toLowerCase(),
				isImg = (nodeName === 'img');

			if ((isImg && this.fixImage(msg, el, 'src', hideExternalImages, onLoadHandler)) ||
				(checkBackground && this.fixImage(msg, el, 'background', hideExternalImages, onLoadHandler))) {

				hiddenImages.push(el);
				if (!isImg) {
					fixedBackground = true;
				}
			}
		}

		if (fixedBackground) {
            //<debug>
			Ext.Logger.image('Background handled, resize on timer');
            //</debug>
			Ext.defer(onLoadHandler, 500, this.iframe);
		}

		return hiddenImages;
	},

	/**
	 * Rewrites the src reference for internal images so that they display, and optionally
	 * does the same for external images. Internal images will have 'cid', 'doc', and 'pnsrc'
	 * converted to a URL with a part value that can be used to fetch the image from our
	 * server. The part value is taken from the message's MIME parts.
	 *
	 * @param {ZmMailMsg}	msg			        mail message
	 * @param {Element}		el		            element to be checked (img)
	 * @param {string}		attr		        attribute name
	 * @param {boolean}     hideExternalImages  if true, replace external image with placeholder
	 *
	 * @return	true if the image is external and was replaced
	 */
	fixImage: function(msg, el, attr, hideExternalImages, onloadHandler) {

		var dfAttr = 'df' + attr,
			pnAttr = 'pn' + attr,
			baseValue, dfValue, pnValue, value,
			imgChanged = false,
			me = this;

		try {
			baseValue = el.getAttribute(attr);
			dfValue = el.getAttribute(dfAttr);
			pnValue = el.getAttribute(pnAttr);
		}
		catch(e) {
            //<debug>
			Ext.Logger.warn('ZtMsgBody.restoreImages: exception accessing base attribute ' + attr + ' in ' + el.nodeName);
            //</debug>
		}

		value = baseValue || dfValue || pnValue;

		if (value) {
			if (value.indexOf('cid:') === 0) {
				// image came as a related part keyed by Content-ID
				var cid = '<' + decodeURIComponent(value.substr(4)) + '>';
				value = msg.getPartUrlByField('contentId', cid, 'foundInMsgBody');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (value.indexOf('doc:') === 0) {
				// image is in Briefcase
				value = [ZCS.session.getSetting(ZCS.constant.SETTING_REST_URL), '/', value.substring(4)].join('');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (pnValue) {
				// image came as a related part keyed by Content-Location
				value = msg.getPartUrlByField('contentLocation', value, 'foundInMsgBody');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (dfValue) {
				if (hideExternalImages) {
					if (attr === 'src') {
						el.src = '/img/zimbra/1x1-trans.png';
					}
					return true;
				}
				else {
					el.src = dfValue;
					imgChanged = true;
				}
			}
			else if (value.indexOf('data:') === 0) {
			}
		}

		if (imgChanged && onloadHandler) {
			el.onload = Ext.Function.bind(onloadHandler, null, [me, el]);
			ZCS.view.mail.ZtMsgBody.numImgsToLoad += 1;
		}

		return false;
	}
});
