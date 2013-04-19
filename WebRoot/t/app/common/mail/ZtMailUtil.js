/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * Mail-related utilities.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.mail.ZtMailUtil', {

	singleton: true,

	alternateClassName: 'ZCS.mailutil',

	/**
	 * Converts the string to HTML, replacing tabs and returns. Optionally turns blocks of
	 * quoted content (which use > or | to mark quoted text) into <blockquote> sections.
	 *
	 * @param {string}	str		                the string
	 * @param {boolean} convertQuotedContent    if true, convert quoted content into blockquotes
	 * @return	{string}	the resulting string
	 */
	textToHtml: function(str, convertQuotedContent) {

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
			.replace(/  /mg, ' &nbsp;')
			.replace(/^ /mg, '&nbsp;')
			.replace(/\t/mg, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
			.replace(/\r?\n/mg, '<br>');

		return str;
	},

	/**
	 * Convert HTML into a reasonable text equivalent by translating tags rather than just
	 * removing them. For example, an OL will number its items.
	 *
	 * @param {string}  html        HTML to convert
	 * @param {string}  prefix      (optional) prefix to use when converting quoted content
	 *
	 * @return {string}     text version of HTML
	 * @adapts AjxStringUtil.convertHtml2Text
	 */
	htmlToText: function(html, prefix) {

		var div = document.createElement('div'),
			text = [],
			idx = 0,
			bqStart = prefix ? 'BQ_BEGIN' : '',
			bqEnd = prefix ? 'BQ_END' : '',
			ctxt = {
				bqStart: bqStart,
				bqEnd: bqEnd,
				lastNode: '',
				isPreformatted: false,
				list: false
			};

		div.innerHTML = html;
		this.convertNodeToText(div, text, idx, null, 0, 0, ctxt);

		text = text.join('');
		if (prefix) {
			text = this.convertBlockquote(text, prefix, bqStart, bqEnd);
		}

		return text;
	},

	/**
	 * Converts a single HTML node to text.
	 *
	 * @param {Element}     el
	 * @param {array}       text
	 * @param {int}         idx
	 * @param {string}      listType
	 * @param {int}         listLevel
	 * @param {int}         bulletNum
	 * @param {object}      ctxt
	 *
	 * @private
	 * @adapts AjxStringUtil._traverse
	 */
	convertNodeToText: function(el, text, idx, listType, listLevel, bulletNum, ctxt) {

		var nodeName = el.nodeName.toLowerCase(),
			nodeValue, i,
			lastNode = ctxt.lastNode;

		if (nodeName === '#text') {
			nodeValue = el.nodeValue;
			if (ZCS.constant.REGEX_NON_WHITESPACE.test(nodeValue)) {
				if (lastNode === 'ol' || lastNode === 'ul') {
					text[idx++] = '\n';
				}
				if (ctxt.isPreformatted) {
					text[idx++] = Ext.String.trim(nodeValue) + ' ';
				} else {
					text[idx++] = Ext.String.trim(nodeValue.replace('\n', ' ').replace(/\s+/g, ' ')) + ' ';
				}
				// TODO: Should we wrap text to avoid long lines?
			}
		}
		else if (nodeName === 'p') {
			text[idx++] = '\n\n';
		}
		else if (!listType && (nodeName === 'br' || nodeName === 'hr')) {
			text[idx++] = '\n';
		}
		else if (nodeName === 'ol' || nodeName === 'ul') {
			text[idx++] = '\n';
			if (el.parentNode.nodeName.toLowerCase() !== 'li' && lastNode !== 'br' && lastNode !== 'hr') {
				text[idx++] = '\n';
			}
			listType = nodeName;
			listLevel++;
			bulletNum = 0;
		}
		else if (nodeName === 'li') {
			for (i = 0; i < listLevel; i++) {
				text[idx++] = '    ';
			}
			if (listType === 'ol') {
				text[idx++] = bulletNum + '. ';
			} else {
				text[idx++] = '\u002A '; // TODO AjxMsg.bullet
			}
		}
		else if (nodeName === 'tr' && el.parentNode.firstChild !== el) {
			text[idx++] = '\n';
		}
		else if (nodeName === 'td' && el.parentNode.firstChild !== el) {
			text[idx++] = '\t';
		}
		else if (nodeName === 'div' || nodeName === 'address') {
			if (idx && text[idx - 1] !== '\n') {
				text[idx++] = '\n';
			}
		}
		else if (nodeName === 'pre') {
			if (idx && text[idx - 1] !== '\n') {
				text[idx++] = '\n';
			}
			ctxt.isPreformatted = true;
		}
		else if (nodeName === '#comment' || nodeName === 'script' || nodeName === 'select' || nodeName === 'style') {
			return idx;
		}
		else if (nodeName === 'blockquote') {
			text[idx++] = '\n' + ctxt.bqStart + '\n';
		}

		var childNodes = el.childNodes,
			len = childNodes.length, child;

		for (i = 0; i < len; i++) {
			child = childNodes[i];
			if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'li') {
				bulletNum++;
			}
			idx = this.convertNodeToText(child, text, idx, listType, listLevel, bulletNum, ctxt);
		}

		if (/^h[1-6]$/.test(nodeName) || nodeName === 'div' || nodeName === 'address') {
			if (idx && text[idx - 1] !== '\n') {
				text[idx++] = '\n';
			}
			ctxt.list = false;
		}
		else if (nodeName === 'pre') {
			if (idx && text[idx - 1] !== '\n') {
				text[idx++] = '\n';
			}
			ctxt.isPreformatted = false;
		}
		else if (nodeName === 'li') {
			if (!ctxt.list) {
				text[idx++] = '\n';
			}
			ctxt.list = false;
		}
		else if (nodeName === 'ol' || nodeName === 'ul') {
			ctxt.list = true;
		}
		else if (nodeName === 'blockquote') {
			text[idx++] = '\n' + ctxt.bqEnd + '\n';
		}
		else if (nodeName !== '#text') {
			ctxt.list = false;
		}

		ctxt.lastNode = nodeName;

		return idx;
	},

	/**
	 * Converts a section of text that was part of a BLOCKQUOTE and prefixes it.
	 *
	 * @param {string}  text
	 * @param {string}  prefix
	 * @param {string}  tagStart
	 * @param {string}  tagEnd
	 * @private
	 * @adapts ZmComposeView._applyHtmlPrefix
	 */
	convertBlockquote: function(text, prefix, tagStart, tagEnd) {

		var wrapParams = {
			preserveReturns:	true,
			prefix:				prefix
		},
			lines = text.split('\n'),
			ln = lines.length, i, j, line, lastLine,
			level = 0,
			out = [],
			k = 0;

		for (i = 0; i < ln; i++) {
			line = lines[i];
			if (line === tagStart) {
				level++;
			}
			else if (line === tagEnd) {
				level--;
			}
			else {
				if (!line) {
					lastLine = lines[i-1];
					if (lastLine && (lastLine !== tagStart && lastLine !== tagEnd)) {
						out[k++] = line;
					}
				} else {
					for (j = 0; j < level; j++) {
						wrapParams.text = line;
						line = this.wordWrap(wrapParams);
					}
					line = line.replace(/^\n|\n$/, '');
					out[k++] = line;
				}
			}
		}
		return out.join('\n');
	},

	/**
	 * Wraps text to the given length and optionally quotes it. The level of quoting in the
	 * source text is preserved based on the prefixes. Special lines such as email headers
	 * always start a new line.
	 *
	 * @param {hash}	params	a hash of parameters
	 * @param {string}      text 				the text to be wrapped
	 * @param {number}      len					the desired line length of the wrapped text, defaults to 80
	 * @param {string}      prefix				an optional string to prepend to each line (useful for quoting)
	 * @param {string}      before				text to prepend to final result
	 * @param {string}      after				text to append to final result
	 * @param {boolean}		preserveReturns		if true, don't combine small lines
	 * @param {boolean}		isHeaders			if true, we are wrapping a block of email headers
	 * @param {boolean}		isFlowed			format text for display as flowed (RFC 3676)
	 *
	 * @return	{string}	the wrapped/quoted text
	 * @adapts AjxStringUtil.wordWrap
	 */
	wordWrap: function(params) {

		if (!(params && params.text)) {
			return '';
		}

		var text = params.text,
			before = params.before ||'',
			after = params.after || '',
			isFlowed = params.isFlowed;

		// For HTML, just surround the content with the before and after, which is
		// typically a block-level element that puts a border on the left
		if (params.htmlMode) {
			before = params.before || (params.prefix ? ZCS.constant.HTML_QUOTE_PREFIX_PRE : ZCS.constant.HTML_QUOTE_NONPREFIX_PRE);
			after = params.after || (params.prefix ? ZCS.constant.HTML_QUOTE_PREFIX_POST : ZCS.constant.HTML_QUOTE_NONPREFIX_POST);
			return [before, text, after].join('');
		}

		var max = params.len || (params.isHeaders ? ZCS.constant.HDR_WRAP_LENGTH : ZCS.constant.WRAP_LENGTH),
			prefixChar = params.prefix || '',
			eol = '\n',
			lines = text.split(ZCS.constant.REGEX_SPLIT),
			ln = lines.length, l, line,
			words = [];

		// Divides lines into words. Each word is part of a hash that also has
		// the word's prefix, whether it's a paragraph break, and whether it
		// needs to be preserved at the start or end of a line.
		for (l = 0; l < ln; l++) {
			line = lines[l];

			// get this line's prefix
			var m = line.match(/^([\s>\|]+)/),
				prefix = m ? m[1] : '',
				wds;

			if (prefix) {
				line = line.substr(prefix.length);
			}
			if (ZCS.constant.REGEX_NON_WHITESPACE.test(line)) {
				wds = this.splitKeepLeadingWhitespace(line);
				if (wds && wds[0] && wds[0].length) {

					var mustStart = ZCS.constant.REGEX_MSG_SEP.test(line) || ZCS.constant.REGEX_COLON.test(line) ||
						ZCS.constant.REGEX_HDR.test(line) || params.isHeaders || ZCS.constant.REGEX_SIG.test(line),

						mustEnd = params.preserveReturns;

					if (isFlowed) {
						var m = line.match(/( +)$/);
						if (m) {
							wds[wds.length - 1] += m[1];	// preserve trailing space at end of line
							mustEnd = false;
						}
						else {
							mustEnd = true;
						}
					}
					for (var w = 0, wlen = wds.length; w < wlen; w++) {
						words.push({
							w:			wds[w],
							prefix:		prefix,
							mustStart:	(w === 0) && mustStart,
							mustEnd:	(w === wlen - 1) && mustEnd
						});
					}
				}
			} else {
				// paragraph marker
				words.push({
					para:	true,
					prefix:	prefix
				});
			}
		}

		// Take the array of words and put them back together. We break for a new line
		// when we hit the max line length, change prefixes, or hit a word that must start a new line.
		var result = '',
			curLen = 0,
			wds = [],
			curPrefix = null,
			ln = words.length,
			i, word, w, prefix, addPrefix, pl, newPrefix;

		for (i = 0; i < ln; i++) {
			word = words[i];
			w = word.w;
			prefix = word.prefix;
			addPrefix = !prefixChar ? '' : curPrefix ? prefixChar : prefixChar + ' ';
			pl = (curPrefix === null) ? 0 : curPrefix.length;
			pl = 0;
			newPrefix = addPrefix + (curPrefix || '');
			if (word.para) {
				// paragraph break - output what we have, then add a blank line
				if (wds.length) {
					result += newPrefix + wds.join('').replace(/^ +/, '') + eol;
				}
				if (i < words.length - 1) {
					curPrefix = prefix;
					addPrefix = !prefixChar ? '' : curPrefix ? prefixChar : prefixChar + ' ';
					newPrefix = addPrefix + (curPrefix || '');
					result += newPrefix + eol;
				}
				wds = [];
				curLen = 0;
				curPrefix = null;
			}
			else if ((pl + curLen + w.length <= max) && (prefix === curPrefix || curPrefix === null) && !word.mustStart) {
				// still room left on the current line, add the word
				wds.push(w);
				curLen += w.length;
				curPrefix = prefix;
				if (word.mustEnd && words[i + 1]) {
					words[i + 1].mustStart = true;
				}
			}
			else {
				// no more room - output what we have and start a new line
				if (wds.length) {
					result += newPrefix + wds.join('').replace(/^ +/, '') + eol;
				}
				wds = [w];
				curLen = w.length;
				curPrefix = prefix;
				if (word.mustEnd && words[i + 1]) {
					words[i + 1].mustStart = true;
				}
			}
		}

		// handle last line
		if (wds.length) {
			var addPrefix = !prefixChar ? '' : wds[0].prefix ? prefixChar : prefixChar + ' ';
			var newPrefix = addPrefix + (curPrefix || '');
			result += newPrefix + wds.join("").replace(/^ /, '') + eol;
		}

		return [before, result, after].join('');
	},

	/**
	 * Splits the line into words, keeping leading whitespace with each word.
	 *
	 * @param {string}	line	the text to split
	 * @return {array}  list of words
	 * @private
	 * @adapts AjxStringUtil.splitKeepLeadingWhitespace
	 */
	splitKeepLeadingWhitespace: function(line) {

		var words = [],
			result;

		while (result = ZCS.constant.REGEX_SPACE_WORD.exec(line)) {
			words.push(result[0]);
		}
		return words;
	},

	/**
	 * Removes "Re:" and "Fwd:" from the beginning of a string.
	 *
	 * @param {string}  subj    subject string
	 * @return {string} subject without prefixes
	 */
	stripSubjectPrefixes: function(subj) {
		var regex = ZCS.constant.REGEX_SUBJ_PREFIX;
		while (regex.test(subj)) {
			subj = subj.replace(regex, '');
		}
		return subj;
	},

	/**
	 * Create a sender string from addresses. It shows up to a certain number of senders,
	 * with an ellipsis at the end if not all of them are shown.
	 *
	 * @param {object}  addresses   hash of addresses by type
	 * @param {int}     numSenders  number of senders to show
	 *
	 * @return {string}     comma-separated list of senders' display names
	 */
	getSenders: function(addresses, numSenders) {

		var senderStr = '',
			senders;

		if (addresses && addresses[ZCS.constant.FROM]) {
			senders = Ext.Array.map(addresses[ZCS.constant.FROM], function(addr) {
				return this.getDisplayName(addr);
			}, this);
			numSenders = numSenders || ZCS.constant.NUM_CONV_SENDERS;
			if (senders.length > numSenders) {
				senders = senders.slice(0, numSenders);
				senders.push('...');
			}
			senderStr = senders.join(', ');
		}

		return senderStr;
	},

	/**
	 * Returns a displayable form of the given address. An option may be set to get the display
	 * name from the user's contacts instead of using the "friendly" portion of the address.
	 *
	 * @param {ZtEmailAddress}  addr    an email address
	 * @return {String}     display name
	 */
	getDisplayName: function(addr) {

		if (!addr) {
			return '';
		}

		var sender = '',
			email = addr.get('email');

		if (ZCS.session.getSetting(ZCS.constant.SETTING_GET_SENDER_FROM_CONTACTS)) {
			var contact = ZCS.cache.get(email, 'email');
			if (contact) {
				sender = contact.get('displayName');
			}
		}
		return sender || addr.get('displayName') || addr.get('name') || email;
	},

	/**
	 * Returns an address object for "From: [me]".
	 * @return {ZCS.model.mail.ZtEmailAddress}
	 */
	getFromAddress: function() {
		return new ZCS.model.mail.ZtEmailAddress({
			type: ZCS.constant.FROM,
			email: ZCS.session.getSetting(ZCS.constant.SETTING_FROM_ADDRESS),
			name: ZCS.session.getSetting(ZCS.constant.SETTING_FROM_NAME)
		});
	}
});
