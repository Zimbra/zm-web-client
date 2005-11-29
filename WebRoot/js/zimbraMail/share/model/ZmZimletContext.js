/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite.
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmZimletContext(id, zimlet) {
	this.id = id;
	this.icon = "ZimbraIcon";
	this.name = zimlet.zimlet[0].name;
	DBG.println(AjxDebug.DBG2, "Zimlets: Loading Context: " + this.name);
	this.description = zimlet.zimlet[0].description;
	this.version = zimlet.zimlet[0].version;
	this.includes = zimlet.zimlet[0].include;
	if (this.includes) {
		for (var i = this.includes.length; --i >= 0;)
			this.includes[i] = this.includes[i]._content;
	}
	if(zimlet.zimlet[0].serverExtension && zimlet.zimlet[0].serverExtension[0].hasKeyword){
		this.keyword = zimlet.zimlet[0].serverExtension[0].hasKeyword;
	}
	if(zimlet.zimlet[0].contentObject){
		this.contentObject = zimlet.zimlet[0].contentObject[0];
	}
	if(zimlet.zimlet[0].zimletPanelItem){
		this.zimletPanelItem = zimlet.zimlet[0].zimletPanelItem[0];
	}
	if(zimlet.zimlet[0].handlerObject){
		this.handlerObject = zimlet.zimlet[0].handlerObject[0]._content;
	}
	this._url = "/service/zimlet/" + this.name + "/";
	this._loadIncludes();
}

ZmZimletContext.prototype.constructor = ZmZimletContext;

ZmZimletContext.prototype.toString =
function() {
	return "ZmZimletContext - " + this.name;
};

// The document.write hack.  If files are present in this array, they will be
// favored by _loadIncludes (see inner function loadNextScript).  I originally
// tried to make the function below an inner function too, but this doesn't
// work because the whole mess is asynchronous (think multiple Zimlets loading
// external files that call document.write).
ZmZimletContext.dwhack_scripts = [];
document.write = document.writeln = function() {
	// let's assume there may be more arguments
	var a = [];
	for (var i = 0; i < arguments.length; ++i)
		a[i] = arguments[i];
	var str = a.join("");
	if (/<script[^>]+src=([\x22\x27])(.*?)\1/i.test(str)) {
		// we have a <script>, let's add it to our includes list. :-)
		ZmZimletContext.dwhack_scripts.push(RegExp.$2);
	}
	// If it's not a script, we can't do anything...  The idea is that the
	// original document.write would mess all our HTML anyway, so we can't
	// call it.  If scripts rely on it to insert elements, well, that's too
	// bad--they won't work.  For this reason we don't even care to save
	// the original functions.
};

// Asynchronously loads scripts in a synchronized fashion. ;-)
//
// Note that this function returns immediately; there are no guarantees that
// the scripts are loaded by that time.
//
// Calls to document.write(ln) are trapped in order to fix things with Yahoo,
// Google and potentially others who are too lazy to implement a proper way of
// loading scripts.  *grin*
ZmZimletContext.prototype._loadIncludes =
function() {
	var includes = this.includes;
	if (!includes)
		return;
	var self = this;
	var zimlet_url = this._url;
	var evt = AjxEnv.isIE ? "onreadystatechange" : "onload";
	var head = document.getElementsByTagName("head")[0];

	function loadNextScript() {
		if (AjxEnv.isIE &&
		    !/loaded|complete/.test(window.event.srcElement.readyState))
			return;
		if (this) // this is cool
			this[evt] = null; // clear the event handler so IE won't leak
		var scripts = ZmZimletContext.dwhack_scripts.length > 0
			? ZmZimletContext.dwhack_scripts
			: includes;
		if (scripts.length > 0) {
			var fullurl = scripts.shift();
			if (!/^((https?|ftps?):\x2f\x2f|\x2f)/.test(fullurl))
				fullurl = zimlet_url + fullurl;
			var script = document.createElement("script");
			script[evt] = loadNextScript;
			script.type = "text/javascript";
			script.src = fullurl;
			head.appendChild(script);
		} else if (includes.length == 0) {
			// finished loading all scripts.
			// we don't allow this function to be called a second time.
			self.includes = null;

			// instantiate the handler object if present
			if (self.handlerObject) {
				var CTOR = eval(self.handlerObject);
				self.handlerObject = new CTOR;
				self.handlerObject.constructor = CTOR;
			}
		}
	};

	loadNextScript();
};

ZmZimletContext.prototype.getUrl = function() { return this._url; };

ZmZimletContext.prototype.callHandler = function(funcname, args) {
	if (this.handlerObject) {
		var f = this.handlerObject[funcname];
		if (typeof f == "function") {
			if (!(args instanceof Array))
				args = [ args ];
			f.apply(this.handlerObject, args);
		}
	}
};
