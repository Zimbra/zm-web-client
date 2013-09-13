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
 * This class distinguishes between original and quoted content of a mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 * @adapts AjxStringUtil
 */
Ext.define('ZCS.common.mail.ZtQuotedContent', {

	singleton: true,

	alternateClassName: 'ZCS.quoted',

	/**
	 * Lazily creates a test hidden IFRAME and writes the given HTML to it, then returns the HTML element.
	 *
	 * @private
	 */
	writeToTestIframeDoc: function(html) {

		var idoc = this.htmlContentIframeDoc;
		if (!idoc) {
			var iframe = Ext.DomHelper.append(document.body, {
				tag: 'iframe',
				id: 'zcs-test-iframe',
				cls: 'zcs-offscreen'
			});
			idoc = this.htmlContentIframeDoc = iframe.contentDocument;
		}
		html = ZCS.htmlutil.hideCidImages(html);
		idoc.open();
		idoc.write(html);
		idoc.close();

		return idoc.childNodes[0];
	},

	/**
	 * Analyze the text and return what appears to be original (as opposed to quoted) content. We
	 * look for separators commonly used by mail clients, as well as prefixes that indicate that
	 * a line is being quoted.
	 *
	 * @param {string}	text		message body content
	 *
	 * @return	{string}	original content if quoted content was found, otherwise NULL
	 */
	getOriginalContent: function(text, isHtml) {

		if (!text) {
			return '';
		}

		if (isHtml) {
			return this.getOriginalHtmlContent(text);
		}

		var results = [],
			lines = text.split(ZCS.constant.REGEX_SPLIT),
			curType,
			curBlock = [],
			count = {},
			isMerged, unknownBlock, line, testLine, type,
			nextLine, isMerged, i, j, nextType,
			originalText, block, result;

		for (i = 0; i < lines.length; i++) {
			line = lines[i];
			testLine = Ext.String.trim(line);

			// blank lines are just added to the current block
			if (!ZCS.constant.REGEX_NON_WHITESPACE.test(testLine)) {
				curBlock.push(line);
				continue;
			}

			// Bugzilla is very good at fooling us, and does not have quoted content, so bail
			if ((testLine.indexOf('| DO NOT REPLY') === 0) && (lines[i + 2].indexOf('bugzilla') !== -1)) {
				return text;
			}

			type = this.getLineType(testLine);

			// WROTE can stretch over two lines; if so, join them into one line
			nextLine = lines[i + 1];
			isMerged = false;
			if (nextLine && (type === this.UNKNOWN) && this.REGEX_INTRO.test(testLine) && nextLine.match(/\w+:$/)) {
				testLine = [testLine, nextLine].join(' ');
				type = this.getLineType(testLine);
				isMerged = true;
			}

			// LINE sometimes used as delimiter; if HEADER follows, lump it in with them
			if (type === this.LINE) {
				j = i + 1;
				nextLine = lines[j];
				while (!ZCS.constant.REGEX_NON_WHITESPACE.test(nextLine) && j < lines.length) {
					nextLine = lines[++j];
				}
				nextType = nextLine && this.getLineType(nextLine);
				if (nextType === this.HEADER) {
					type = this.HEADER;
				}
				else {
					type = this.UNKNOWN;
				}
			}

			// see if we're switching to a new type; if so, package up what we have so far
			if (curType) {
				if (curType !== type) {
					results.push({
						type:curType,
						block:curBlock
					});
					unknownBlock = (curType === this.UNKNOWN) ? curBlock : unknownBlock;
					count[curType] = count[curType] ? count[curType] + 1 : 1;
					curBlock = [];
					curType = type;
				}
			}
			else {
				curType = type;
			}

			if (isMerged && (type === this.WROTE_WEAK || type === this.WROTE_STRONG)) {
				curBlock.push(line);
				curBlock.push(nextLine);
				i++;
				isMerged = false;
			}
			else {
				curBlock.push(line);
			}
		}

		// Handle remaining content
		if (curBlock.length) {
			results.push({
				type: curType,
				block: curBlock
			});
			unknownBlock = (curType === this.UNKNOWN) ? curBlock : unknownBlock;
			count[curType] = count[curType] ? count[curType] + 1 : 1;
		}

		// Now it's time to analyze all these blocks that we've classified

		// Check for UNKNOWN followed by HEADER
		var first = results[0], second = results[1];
		if (first && first.type === this.UNKNOWN && second && second.type === this.HEADER) {
			originalText = this.getTextFromBlock(first.block);
			if (originalText) {
				return originalText;
			}
		}

		// check for special case of WROTE preceded by UNKNOWN, followed by mix of UNKNOWN and QUOTED (inline reply)
		var originalText = this.checkInlineWrote(count, results, false);
		if (originalText) {
			return originalText;
		}

		// If we found quoted content and there's exactly one UNKNOWN block, return it.
		if (count[this.UNKNOWN] === 1 && count[this.QUOTED] > 0) {
			originalText = this.getTextFromBlock(unknownBlock);
			if (originalText) {
				return originalText;
			}
		}

		// If we have a STRONG separator (eg "--- Original Message ---"), consider it authoritative and return the text that precedes it
		if (count[this.SEP_STRONG] > 0) {
			block = [];
			for (i = 0; i < results.length; i++) {
				result = results[i];
				if (result.type === this.SEP_STRONG) {
					break;
				}
				block = block.concat(result.block);
			}
			originalText = this.getTextFromBlock(block);
			if (originalText) {
				return originalText;
			}
		}

		return text;
	},

	/**
	 * 	Matches a line of text against some regexes to see if has structural meaning within a mail msg.
	 * 	@private
	 */
    getLineType: function(testLine) {

		var type = this.UNKNOWN,
		    m, verb, points;

		// see if the line matches any known delimiters or quote patterns
		Ext.each(this.REGEXES, function(msgTest) {
			if (msgTest.regex.test(testLine.toLowerCase())) {
				// line that starts and ends with | is considered ASCII art (eg a table) rather than quoted
				if (!(msgTest.type == this.QUOTED && /^\s*\|.*\|\s*$/.test(testLine))) {
					type = msgTest.type;
					return false;	// first match wins
				}
			}
		}, this);


		if (type === this.UNKNOWN) {
			// "so-and-so wrote:" takes a lot of different forms; look for various common parts and
			// assign points to determine confidence
			m = testLine.match(/(\w+):$/);
			verb = m && m[1] && m[1].toLowerCase();
			if (verb) {
				points = 0;
				// look for "wrote:" (and discount "changed:", which is used by Bugzilla)
				points = points + (verb === ZtMsg.wrote) ? 5 : (verb === ZtMsg.changed) ? 0 : 3;
				if (this.REGEX_EMAIL.test(testLine)) {
					points += 4;
				}
				if (this.REGEX_DATE.test(testLine)) {
					points += 3;
				}
				var regEx = new RegExp('^(--|' + ZtMsg.on + ')', 'i');
				if (this.REGEX_INTRO.test(testLine)) {
					points += 1;
				}
				if (points >= 7) {
					type = this.WROTE_STRONG;
				}
				else if (points >= 5) {
					type = this.WROTE_WEAK;
				}
			}
		}

		return type;
	},

	getTextFromBlock: function(block) {

		if (!(block && block.length)) {
			return null;
		}
		var originalText = block.join('\n') + '\n';
		originalText = originalText.replace(/\s+$/, '\n');
		return (ZCS.constant.REGEX_NON_WHITESPACE.test(originalText)) ? originalText : null;
	},

	/**
	 * For HTML, we strip off the html, head, and body tags and stick the rest in a temporary DOM node so that
	 * we can walk the tree. Instead of going line by line, we go element by element. If we find one that
	 * is recognized as a separator, we remove all subsequent elements.
	 *
	 * @param {String}	text		message body content
	 *
	 * @return	{String}	original content if quoted content was found, otherwise NULL
	 * @private
	 */
	getOriginalHtmlContent: function(text) {

		// strip <script> tags (which should not be there)
		while (this.REGEX_SCRIPT.test(text)) {
			text = text.replace(this.REGEX_SCRIPT, '');
		}

		var htmlNode = this.writeToTestIframeDoc(text);

		var done = false, nodeList = [];
		this.flatten(htmlNode, nodeList);

		var ln = nodeList.length, i, results = [], count = {}, el, prevEl, nodeName, type, prevType, sepNode;
		for (i = 0; i < ln; i++) {
			el = nodeList[i];
			nodeName = el.nodeName.toLowerCase();
			type = this.checkNode(nodeList[i]);
			if (type !== null) {
				results.push({ type: type, node: el, nodeName: nodeName });
				count[type] = count[type] ? count[type] + 1 : 1;
				// definite separator
				if (type === this.SEP_STRONG || type === this.WROTE_STRONG) {
					sepNode = el;
					done = true;
					break;
				}
				// some sort of line followed by a header
				if (type === this.HEADER && prevType === this.LINE) {
					sepNode = prevEl;
					done = true;
					break;
				}
				prevEl = el;
				prevType = type;
			}
		}

		if (sepNode) {
			this.prune(sepNode, true);
		}

		// convert back to text, restoring html, head, and body nodes
		var content = done ? '<html>' + htmlNode.innerHTML + '</html>' : text;
		htmlNode.innerHTML = '';
		return content;
	},

	/**
	 * Traverse the given node depth-first to produce a list of descendant nodes. Some nodes are
	 * ignored.
	 *
	 * @param {Element}     node        node
	 * @param {Array}       list        result list which grows in place
	 * @private
	 */
	flatten: function(node, list) {

		list.push(node);

		var children = node.childNodes || [],
			i, el, nodeName;

		for (i = 0; i < children.length; i++) {
			el = children[i];
			nodeName = el.nodeName.toLowerCase();
			if (nodeName !== 'blockquote' && !this.IGNORE_NODE[nodeName]) {
				this.flatten(el, list);
			}
		}
	},

	/**
	 * Removes all subsequent siblings of the given node, and then does the same for its parent.
	 * The effect is that all nodes that come after the given node in a depth-first traversal of
	 * the DOM will be removed.
	 *
	 * @param {Element}     node
	 * @param {Boolean}     clipNode    if true, also remove the node
	 * @private
	 */
	prune: function(node, clipNode) {

		var p = node && node.parentNode,
			nodeName = p && p.nodeName.toLowerCase();

		// clip all subsequent nodes
		while (p && p.lastChild && p.lastChild !== node) {
			p.removeChild(p.lastChild);
		}

		// clip the node if asked
		if (clipNode && p && p.lastChild === node) {
			p.removeChild(p.lastChild);
		}

		// stop when we get up to BODY or HTML element
		if (p && nodeName !== 'body' && nodeName !== 'html') {
			this.prune(p, false);
		}
	},

	/**
	 * Tries to determine the type of the given node.
	 *
	 * @param {Element}     el      a DOM node
	 * @return {String}     type, or null
	 * @private
	 */
	checkNode: function(el) {

		if (!el) { return null; }

		var nodeName = el.nodeName.toLowerCase(),
			type = null,
			content;

		// Text node: test against our regexes
		if (nodeName === '#text') {
			content = Ext.String.trim(el.nodeValue);
			if (ZCS.constant.REGEX_NON_WHITESPACE.test(content)) {
				type = this.getLineType(content);
			}
		}
		// HR: look for a couple different forms that are used to delimit quoted content
		else if (nodeName === 'hr') {
			// see if the HR is ours, or one commonly used by other mail clients such as Outlook
			if (el.id === ZCS.constant.HTML_QUOTE_DIVIDER_ID || (el.size === '2' && el.width === '100%' && el.align === 'center')) {
				type = this.SEP_STRONG;
			}
			else {
				type = this.LINE;
			}
		}
		// PRE: treat as one big line of text (should maybe go line by line)
		else if (nodeName === 'pre') {
			type = this.checkNodeContent(el);
		}
		// DIV: check for Outlook class used as delimiter, or a top border used as a separator, and finally just
		// check the text content
		else if (nodeName === 'div') {
			if (el.className === 'OutlookMessageHeader' || el.className === 'gmail_quote') {
				type = this.SEP_STRONG;
			}
			else if (el.outerHTML.toLowerCase().indexOf('border-top') !== -1) {
				var styleObj = window.getComputedStyle(el);
				if (styleObj && styleObj.borderTopWidth && parseInt(styleObj.borderTopWidth) > 0) {
					// Take aggressive approach and assume top border is separator and not just a line
					type = this.SEP_STRONG;
				}
			}
			type = type || this.checkNodeContent(el);
		}
		// SPAN: check for Outlook ID used as delimiter, then check text content
		else if (nodeName === 'span') {
			if (el.id === 'OLK_SRC_BODY_SECTION') {
				type = this.SEP_STRONG;
			}
			type = type || this.checkNodeContent(el);
		}
		// IMG: treat as original content
		else if (nodeName === 'img') {
			type = this.UNKNOWN;
		}
		// BLOCKQUOTE: treat as quoted section
		else if (nodeName === 'blockquote') {
			type = this.QUOTED;
		}

		return type;
	},

	/**
	 * Checks innerText to see if it's a separator.
	 * @param {Element} node
	 * @return {String}
	 * @private
	 */
	checkNodeContent: function(node) {

		var content = node.innerText || '';
		if (!ZCS.constant.REGEX_NON_WHITESPACE.test(content) || content.length > 200) {
			return null;
		}
		// We're really only interested in SEP_STRONG and WROTE_STRONG
		var type = this.getLineType(content);
		return (type === this.SEP_STRONG || type === this.WROTE_STRONG) ? type : null;
	},

	/**
	 * A "... wrote:" separator is not quite as authoritative, since the user might be replying inline. If we have
	 * a single UNKNOWN block before the WROTE separator, return it unless there is a mix of QUOTED and UNKNOWN
	 * following the separator, except if there's only a single unknown block after the separator and it comes last.
	 *
	 * @private
	 */
	checkInlineWrote: function(count, results) {

		if (count[this.WROTE_STRONG] > 0) {
			var unknownBlock, foundSep = false, afterSep = {};
			for (var i = 0; i < results.length; i++) {
				var result = results[i], type = result.type;
				if (type === this.WROTE_STRONG) {
					foundSep = true;
				}
				else if (type === this.UNKNOWN && !foundSep) {
					if (unknownBlock) {
						return null;
					}
					else {
						unknownBlock = isHtml ? true : result.block;
					}
				}
				else if (foundSep) {
					afterSep[type] = true;
				}
			}

			var mixed = (afterSep[this.UNKNOWN] && afterSep[this.QUOTED]);
			var endsWithUnknown = (count[this.UNKNOWN] === 2 && results[results.length - 1].type === this.UNKNOWN);
			if (unknownBlock && (!mixed || endsWithUnknown)) {
				var originalText = this.getTextFromBlock(unknownBlock);
				if (originalText) {
					return originalText;
				}
			}
		}
	}
});

// Possible types for a block of content
ZCS.quoted.UNKNOWN         = 'UNKNOWN';
ZCS.quoted.QUOTED          = 'QUOTED';
ZCS.quoted.SEP_STRONG      = 'SEP_STRONG';
ZCS.quoted.SEP_WEAK        = 'SEP_WEAK';
ZCS.quoted.WROTE_STRONG    = 'WROTE_STRONG';
ZCS.quoted.WROTE_WEAK      = 'WROTE_WEAK';
ZCS.quoted.HEADER          = 'HEADER';
ZCS.quoted.LINE            = 'LINE';
ZCS.quoted.SIG_SEP         = 'SIG_SEP';

// Regexes for figuring out block type
ZCS.quoted.REGEXES = [
	{
		// the two most popular quote characters, > and |
		type:	ZCS.quoted.QUOTED,
		regex:	/^\s*(>|\|)/
	},
	{
		// marker for Original or Forwarded message, used by ZCS and others
		type:	ZCS.quoted.SEP_STRONG,
		regex:	new RegExp('^\\s*--+\\s*(' + ZtMsg.originalMessage + '|' + ZtMsg.forwardedMessage + '|' + ZtMsg.originalAppointment + ')\\s*--+\\s*$', 'i')
	},
	{
		// marker for Original or Forwarded message, used by ZCS and others
		type:	ZCS.quoted.SEP_STRONG,
		regex:	new RegExp('^' + ZtMsg.forwardedMessage1 + '$', 'i')
	},
	{
		// one of the commonly quoted email headers
		type:	ZCS.quoted.HEADER,
		regex:	new RegExp('^\\s*(' + [ZtMsg.fromHdr, ZtMsg.toHdr, ZtMsg.subjectHdr, ZtMsg.dateHdr, ZtMsg.sentHdr, ZtMsg.ccHdr].join('|') + ')', 'i')
	},
	{
		// some clients use a series of underscores as a text-mode separator (text version of <hr>)
		type:	ZCS.quoted.LINE,
		regex:	/^\s*_{5,}\s*$/
	}/*,
	 {
	 // in case a client doesn't use the exact words above
	 type:	ZCS.quoted.SEP_WEAK,
	 regex:	/^\s*--+\s*[\w\s]+\s*--+$/
	 },
	 {
	 // internet style signature separator
	 type:	ZCS.quoted.SIG_SEP,
	 regex:	/^- ?-\s*$/
	 }*/
];

ZCS.quoted.REGEX_EMAIL    = /[^@\s]+@[A-Za-z0-9\-]{2,}(\.[A-Za-z0-9\-]{2,})+/;
ZCS.quoted.REGEX_DATE     = /, 20\d\d/;
ZCS.quoted.REGEX_INTRO    = new RegExp('^(-{2,}|' + ZtMsg.on + ')', 'i');

ZCS.quoted.REGEX_SCRIPT = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

// nodes to ignore; they won't have anything we're interested in
ZCS.quoted.IGNORE_NODE = ZCS.util.arrayAsLookupHash([
	'#comment',
	'script',
	'select',
	'style'
]);

// Give up after processing this many nodes
ZCS.quoted.MAX_NODES       = 200;
