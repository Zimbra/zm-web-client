/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * Env.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class tinymce.Env
 * @static
 */
define("tinymce/Env", [], function() {
	var nav = navigator, userAgent = nav.userAgent;
	var opera, webkit, ie, ie11, gecko, mac, iDevice;

	opera = window.opera && window.opera.buildNumber;
	webkit = /WebKit/.test(userAgent);
	ie = !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName);
	ie = ie && /MSIE (\w+)\./.exec(userAgent)[1];
	ie11 = userAgent.indexOf('Trident/') != -1 && (userAgent.indexOf('rv:') != -1 || nav.appName.indexOf('Netscape') != -1) ? 11 : false;
	ie = ie || ie11;
	gecko = !webkit && !ie11 && /Gecko/.test(userAgent);
	mac = userAgent.indexOf('Mac') != -1;
	iDevice = /(iPad|iPhone)/.test(userAgent);

	// Is a iPad/iPhone and not on iOS5 sniff the WebKit version since older iOS WebKit versions
	// says it has contentEditable support but there is no visible caret.
	var contentEditable = !iDevice || userAgent.match(/AppleWebKit\/(\d*)/)[1] >= 534;

	return {
		/**
		 * Constant that is true if the browser is Opera.
		 *
		 * @property opera
		 * @type Boolean
		 * @final
		 */
		opera: opera,

		/**
		 * Constant that is true if the browser is WebKit (Safari/Chrome).
		 *
		 * @property webKit
		 * @type Boolean
		 * @final
		 */
		webkit: webkit,

		/**
		 * Constant that is more than zero if the browser is IE.
		 *
		 * @property ie
		 * @type Boolean
		 * @final
		 */
		ie: ie,

		/**
		 * Constant that is true if the browser is Gecko.
		 *
		 * @property gecko
		 * @type Boolean
		 * @final
		 */
		gecko: gecko,

		/**
		 * Constant that is true if the os is Mac OS.
		 *
		 * @property mac
		 * @type Boolean
		 * @final
		 */
		mac: mac,

		/**
		 * Constant that is true if the os is iOS.
		 *
		 * @property iOS
		 * @type Boolean
		 * @final
		 */
		iOS: iDevice,

		/**
		 * Constant that is true if the browser supports editing.
		 *
		 * @property contentEditable
		 * @type Boolean
		 * @final
		 */
		contentEditable: contentEditable,

		/**
		 * Transparent image data url.
		 *
		 * @property transparentSrc
		 * @type Boolean
		 * @final
		 */
		transparentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",

		/**
		 * Returns true/false if the browser can or can't place the caret after a inline block like an image.
		 *
		 * @property noCaretAfter
		 * @type Boolean
		 * @final
		 */
		caretAfter: ie != 8,

		/**
		 * Constant that is true if the browser supports native DOM Ranges. IE 9+.
		 *
		 * @property range
		 * @type Boolean
		 */
		range: window.getSelection && "Range" in window,

		/**
		 * Returns the IE document mode for non IE browsers this will fake IE 10.
		 *
		 * @property documentMode
		 * @type Number
		 */
		documentMode: ie ? (document.documentMode || 7) : 10
	};
});
