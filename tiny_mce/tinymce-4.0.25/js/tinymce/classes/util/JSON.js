/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
/**
 * JSON.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * JSON parser and serializer class.
 *
 * @class tinymce.util.JSON
 * @static
 * @example
 * // JSON parse a string into an object
 * var obj = tinymce.util.JSON.parse(somestring);
 *
 * // JSON serialize a object into an string
 * var str = tinymce.util.JSON.serialize(obj);
 */
define("tinymce/util/JSON", [], function() {
	function serialize(o, quote) {
		var i, v, t, name;

		quote = quote || '"';

		if (o === null) {
			return 'null';
		}

		t = typeof o;

		if (t == 'string') {
			v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return quote + o.replace(/([\u0080-\uFFFF\x00-\x1f\"\'\\])/g, function(a, b) {
				// Make sure single quotes never get encoded inside double quotes for JSON compatibility
				if (quote === '"' && a === "'") {
					return a;
				}

				i = v.indexOf(b);

				if (i + 1) {
					return '\\' + v.charAt(i + 1);
				}

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + quote;
		}

		if (t == 'object') {
			if (o.hasOwnProperty && Object.prototype.toString.call(o) === '[object Array]') {
					for (i = 0, v = '['; i < o.length; i++) {
						v += (i > 0 ? ',' : '') + serialize(o[i], quote);
					}

					return v + ']';
				}

				v = '{';

				for (name in o) {
					if (o.hasOwnProperty(name)) {
						v += typeof o[name] != 'function' ? (v.length > 1 ? ',' + quote : quote) + name +
							quote + ':' + serialize(o[name], quote) : '';
					}
				}

				return v + '}';
		}

		return '' + o;
	}

	return {
		/**
		 * Serializes the specified object as a JSON string.
		 *
		 * @method serialize
		 * @param {Object} obj Object to serialize as a JSON string.
		 * @param {String} quote Optional quote string defaults to ".
		 * @return {string} JSON string serialized from input.
		 */
		serialize: serialize,

		/**
		 * Unserializes/parses the specified JSON string into a object.
		 *
		 * @method parse
		 * @param {string} s JSON String to parse into a JavaScript object.
		 * @return {Object} Object from input JSON string or undefined if it failed.
		 */
		parse: function(text) {
			try {
				// Trick uglify JS
				return window[String.fromCharCode(101) + 'val']('(' + text + ')');
			} catch (ex) {
				// Ignore
			}
		}

		/**#@-*/
	};
});
