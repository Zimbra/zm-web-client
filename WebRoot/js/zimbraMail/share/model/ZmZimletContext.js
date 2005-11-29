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
	if(zimlet.zimlet[0].serverExtension && zimlet.zimlet[0].serverExtension[0].hasKeyword){
		this.keyword = zimlet.zimlet[0].serverExtension[0].hasKeyword;
	}
	if(zimlet.zimlet[0].contentObject){
		this.contentObject = zimlet.zimlet[0].contentObject[0];
	}
	if(zimlet.zimlet[0].zimletPanelItem){
		this.zimletPanelItem = zimlet.zimlet[0].zimletPanelItem[0];
	}
	this._loadIncludes();
}

ZmZimletContext.prototype.constructor = ZmZimletContext;

ZmZimletContext.prototype.toString =
function() {
	return "ZmZimletContext - " + this.name;
};

// This function will load scripts defined in the includes array.  I'm not sure
// if this shouldn't be better off done on the server-side, but anyway, here
// goes.  I first used such wizardry in HTMLArea and it works very good.  Here
// it's even smarter.  ;-)
//
// So what happens is that it will load scripts defined by the <include> tags,
// but sequentially.  That's because some script may use variables/functions
// defined in a previously <include>-ed script, and since loading is
// asynchronous, if we simply create <script> elements and append them to the
// <head> we risk having JS errors.  Therefore, we load scripts one by one,
// waiting for each <script> to finish loading.
ZmZimletContext.prototype._loadIncludes =
function() {
	var includes = this.includes;
	if (!includes)
		return;
	var self = this;
	var zimlet_url = "/service/zimlet/" + this.name + "/";
	var current = 0;
	var evt = AjxEnv.isIE ? "onreadystatechange" : "onload";
	var head = document.getElementsByTagName("head")[0];

	function loadNextScript() {
		if (current > 0 && AjxEnv.isIE &&
		    !/loaded|complete/.test(window.event.srcElement.readyState))
			return;
		if (this) // this is cool
			this[evt] = null; // clear the event handler so IE won't leak
		if (current < includes.length) {
			var fullurl = includes[current]._content;
			if (!/^((https?|ftps?):\x2f\x2f|\x2f)/.test(fullurl))
				fullurl = zimlet_url + fullurl;
			var script = document.createElement("script");
			script[evt] = loadNextScript;
			script.type = "text/javascript";
			script.src = fullurl;
			current++;
			head.appendChild(script);
		} else {
			// finished loading all scripts.
			// we don't allow this function to be called a second time.
			self.includes = null;
		}
	};

	loadNextScript();
};
