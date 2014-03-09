/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ('License'); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an 'AS IS'
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents a search used to retrieve items matching a query from the server.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 * @adapts ZmParsedQuery
 */
Ext.define('ZCS.common.ZtSearch', {

	config: {
		query:          null,
		tokens:         null,
		matchFunction:  null,
		folderId:       null,
		tagId:          null
	},

	statics: {

		/**
		 * Parses the given query into a list of search tokens.
		 *
		 * @param {String}  query   search query
		 * @returns {Array}     list of ZtSearchToken
		 */
		parseQuery: function(query) {

			function getQuotedStr(str, pos, q) {
				var q = q || str.charAt(pos);
				pos++;
				var done = false, ch, quoted = '';
				while (pos < str.length && !done) {
					ch = str.charAt(pos);
					if (ch === q) {
						done = true;
					}
					else {
						quoted += ch;
						pos++;
					}
				}

				return done ? { str:quoted, pos:pos + 1 } : null;
			}

			function skipSpace(str, pos) {
				while (pos < str.length && str.charAt(pos) === ' ') {
					pos++;
				}
				return pos;
			}

			function fail(reason, query) {
				Ext.Logger.warn('ZmParsedQuery failure: ' + reason + '; query: [' + query + ']');
				return null;
			}

			var len = query.length,
				tokens = [], ch, lastCh, op, word = '', isEow = false, endOk = true, compound = 0, numParens = 0,
				pos = skipSpace(query, 0),
				results;

			while (pos < len) {
				lastCh = (ch !== ' ') ? ch : lastCh;
				ch = query.charAt(pos);
				isEow = ZCS.constant.SEARCH_IS_EOW[ch];

				if (ch === ':') {
					if (ZCS.constant.SEARCH_IS_OP[word]) {
						op = word;
					}
					else {
						return fail("unrecognized op '" + word + "'", query);
					}
					word = '';
					pos = skipSpace(query, pos + 1);
					continue;
				}

				if (isEow) {
					var lcWord = word.toLowerCase(),
						isCondOp = !!ZCS.constant.SEARCH_COND_OP[lcWord];

					if (op && word && !(isCondOp && compound > 0)) {
						tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:op, arg:lcWord }));
						if (compound === 0) {
							op = '';
						}
						word = '';
						endOk = true;
					}
					else if (!op || (op && compound > 0)) {
						if (isCondOp) {
							tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:lcWord }));
							endOk = false;
						}
						else if (word) {
							tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:ZCS.constant.SEARCH_OP_CONTENT, arg:word }));
						}
						word = '';
					}
				}

				if (ch === '"') {
					results = getQuotedStr(query, pos);
					if (results) {
						word = results.str;
						pos = results.pos;
					}
					else {
						return fail('improper use of quotes', query);
					}
				}
				else if (ch === ZCS.constant.SEARCH_GROUP_OPEN) {
					var done = false;
					if (compound > 0) {
						compound++;
					}
					else if (lastCh === ':') {
						compound = 1;
						// see if parens are being used as secondary quoting mechanism by looking for and/or
						var inside = query.substr(pos, query.indexOf(ZCS.constant.SEARCH_GROUP_CLOSE, pos + 1));
						inside = inside && inside.toLowerCase();
						if (inside && (inside.indexOf(' ' + ZCS.constant.SEARCH_COND_OR + ' ') === -1) &&
							(inside.indexOf(' ' + ZCS.constant.SEARCH_COND_AND + ' ') === -1)) {

							results = getQuotedStr(query, pos, ZCS.constant.SEARCH_GROUP_CLOSE);
							if (results) {
								word = results.str;
								pos = results.pos;
								compound = 0;
							}
							else {
								return fail('improper use of paren-based quoting', query);
							}
							done = true;
						}
					}
					if (!done) {
						tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:ch }));
						numParens++;
					}
					pos = skipSpace(query, pos + 1);
				}
				else if (ch === ZCS.constant.SEARCH_GROUP_CLOSE) {
					if (compound > 0) {
						compound--;
					}
					if (compound === 0) {
						op = '';
					}
					tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:ch }));
					pos = skipSpace(query, pos + 1);
				}
				else if (ch === '-' && !word && !op) {
					tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:ZCS.constant.SEARCH_COND_NOT }));
					pos = skipSpace(query, pos + 1);
					endOk = false;
				}
				else {
					if (ch !== ' ') {
						word += ch;
					}
					pos++;
				}
			}

			// check for term at end
			if ((pos >= query.length) && op && word) {
				tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:op, arg:word }));
				endOk = true;
			}
			else if (!op && word) {
				tokens.push(Ext.create('ZCS.common.ZtSearchToken', { op:word }));
			}

			// remove unnecessary enclosing parens from when a single compound term is expanded, for example when
			// "subject:(foo bar)" is expanded into "(subject:foo subject:bar)"
			if (tokens.length >= 3 && numParens === 1 && tokens[0].op === ZCS.constant.SEARCH_GROUP_OPEN &&
				tokens[tokens.length - 1].op === ZCS.constant.SEARCH_GROUP_CLOSE) {

				tokens.shift();
				tokens.pop();
			}

			if (!endOk) {
				return fail('unexpected end of query', query);
			}

			return tokens;
		}
	},

	/**
	 * A newly created ZtSearch parses its query and creates a match function.
	 *
	 * @param config
	 */
	constructor: function(config) {

		this.initConfig(config);

		this.setTokens(ZCS.common.ZtSearch.parseQuery(this.getQuery()));
		this.generateMatchFunction();
	},

	/**
	 * Returns true if the given item matches this search based on a generated match function.
	 *
	 * @param {ZtItem}  item    an item
	 * @returns {Boolean} true if the given item matches this search
	 */
	match: function(item) {
		var matchFunc = this.getMatchFunction();
		return matchFunc ? matchFunc(item) : null;
	},

	/**
	 * Returns a folder or tag ID if this search is constrained to an organizer.
	 *
	 * @returns {String}    folder or tag ID
	 */
	getOrganizerId: function() {
		return this.getFolderId() || this.getTagId();
	},

	/**
	 * @private
	 * @returns {Function}
	 */
	generateMatchFunction: function() {

		var func = [ "return Boolean(" ];
		var tokens = this.getTokens(),
			hasOrTerm = false,
			folderId, tagId,
			len = tokens.length, i;

		for (i = 0; i < len; i++) {
			var token = tokens[i],
				type = token.getType(),
				op = token.getOp(),
				arg = token.getArg(),
				folder, tag;

			if (type === ZCS.constant.SEARCH_TERM) {
				if (op === 'in' || op === 'inid') {
					folderId = arg;
					if (op === 'in') {
						folder = ZCS.cache.get(arg, 'path');
						folderId = folder ? folder.get('zcsId') : null;
					}
					if (folderId) {
						func.push("item.isInFolder('" + folderId + "')");
					}
				}
				else if (op === 'tag') {
					tag = ZCS.cache.get(arg, 'tagName');
					tagId = tag ? tag.get('zcsId') : null;
					if (tagId) {
						func.push("item.hasTag('" + arg + "')");
					}
				}
				else if (op === 'is') {
					var test = ZCS.constant.SEARCH_FLAG[arg];
					if (test) {
						func.push(test);
					}
				}
				else if (op === 'has' && arg === 'attachment') {
					func.push("item.get('hasAttachment')");
				}
				else {
					// search had a term we don't know how to match
					return null;
				}

				// resolve implied "and"
				var next = tokens[i + 1];
				if (next && (next.type === ZCS.constant.SEARCH_TERM || next === ZCS.constant.SEARCH_COND_OP[ZCS.constant.SEARCH_COND_NOT] || next === ZCS.constant.SEARCH_GROUP_CLOSE)) {
					func.push(ZCS.constant.SEARCH_COND_OP[ZCS.constant.SEARCH_COND_AND]);
				}
			}
			else if (type === ZCS.constant.SEARCH_COND) {
				func.push(ZCS.constant.SEARCH_COND_OP[op]);
				if (op === ZCS.constant.SEARCH_COND_OR) {
					hasOrTerm = true;
				}
			}
			else if (type === ZCS.constant.SEARCH_GROUP) {
				func.push(op);
			}
		}
		func.push(')');

		if (!hasOrTerm) {
			this.setFolderId(folderId);
			this.setTagId(tagId);
		}

		var func;
		try {
			// Since we aren't able to parse every kind of search, some searches cannot
			// be turned into a function and will throw a JS error here.
			func = new Function('item', func.join(''));
		} catch(ex) {}

		if (func) {
			this.setMatchFunction(func);
		}
	}
});

/**
 * This class represents a single query component, which can be a search term such as "in:inbox",
 * a conditional such as "and", or a grouping operator such as "(".
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 * @adapts ZmSearchToken
 */
Ext.define('ZCS.common.ZtSearchToken', {

	config: {
		type:   '',
		op:     '',
		arg:    ''
	},

	constructor: function(config) {

		this.initConfig(config);

		var op = this.getOp(),
			arg = this.getArg();

		if (op && !arg && op.indexOf(':') > 0) {
			var parts = op.split(':');
			op = parts[0];
			this.setOp(op);
			arg = parts[1];
			this.setArg(arg);
		}

		if (ZCS.constant.SEARCH_IS_OP[op] && arg) {
			this.setType(ZCS.constant.SEARCH_TERM);
		}
		else if (op && ZCS.constant.SEARCH_COND_OP[op.toLowerCase()]) {
			this.setType(ZCS.constant.SEARCH_COND);
			this.setOp(op.toLowerCase());
		}
		else if (op === ZCS.constant.SEARCH_GROUP_OPEN || op === ZCS.constant.SEARCH_GROUP_CLOSE) {
			this.setType(ZCS.constant.SEARCH_GROUP);
		}
		else if (op) {
			this.setType(ZCS.constant.SEARCH_TERM);
			this.setOp(ZCS.constant.SEARCH_OP_CONTENT);
			this.setArg(op);
		}
	},

	toString: function(force) {

		var type = this.getType(),
			op = this.getOp(),
			arg = this.getArg();

		if (type === ZCS.constant.SEARCH_TERM) {
			if (op === ZCS.constant.SEARCH_OP_CONTENT) {
				return /\W/.test(arg) ? '"' + arg.replace(/"/g, '\\"') + '"' : arg;
			}
			else {
				// quote arg if it has any spaces and is not already quoted
				arg = (arg && (arg.indexOf('"') !== 0) && arg.indexOf(' ') !== -1) ? '"' + arg + '"' : arg;
				return [op, arg].join(':');
			}
		}
		else {
			return (!force && op === ZCS.constant.SEARCH_COND_AND) ? '' : op;
		}
	}
});
