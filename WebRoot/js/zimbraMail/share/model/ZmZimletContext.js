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

ZmZimletContext.prototype._loadIncludes =
function() {
	if (!this.includes)
		return;
	AjxInclude(this.includes, this._url,
		   new AjxCallback(this, this._finished_loadIncludes));
};

ZmZimletContext.prototype._finished_loadIncludes = function() {
	// we don't allow _loadIncludes a second time
	this.includes = null;
	// instantiate the handler object if present
	if (this.handlerObject) {
		var CTOR = eval(this.handlerObject);
		this.handlerObject = new CTOR;
		this.handlerObject.constructor = CTOR;
		this.handlerObject.init(this);
	}
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
