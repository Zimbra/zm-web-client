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
	zimlet = zimlet.zimlet[0];
	this.name = zimlet.name;
	this._url = "/service/zimlet/" + this.name + "/";
	DBG.println(AjxDebug.DBG2, "Zimlets: Loading Context: " + this.name);
	this.description = zimlet.description;
	this.version = zimlet.version;
	this.includes = zimlet.include;
	if (this.includes) {
		for (var i = this.includes.length; --i >= 0;)
			this.includes[i] = this.includes[i]._content;
	}
	this.includeCSS = zimlet.includeCSS;
	if (this.includeCSS) {
		for (var i = this.includeCSS.length; --i >= 0;)
			this.includeCSS[i] = this.includeCSS[i]._content;
	}
	if(zimlet.serverExtension && zimlet.serverExtension[0].hasKeyword){
		this.keyword = zimlet.serverExtension[0].hasKeyword;
	}

	this._contentActionMenu = null;
	if(zimlet.contentObject){
		this.contentObject = zimlet.contentObject[0];
	}

	this._panelActionMenu = null;
	if(zimlet.zimletPanelItem){
		this.zimletPanelItem = zimlet.zimletPanelItem[0];
		if (this.zimletPanelItem.icon)
			this.icon = this.zimletPanelItem.icon;
		if (this.zimletPanelItem.contextMenu) {
			this.zimletPanelItem.contextMenu = this.zimletPanelItem.contextMenu[0];
			this._panelActionMenu = new AjxCallback(
				this, this._makeMenu,
				this.zimletPanelItem.contextMenu.menuItem);
		}
	}
	if(zimlet.handlerObject){
		this.handlerObject = zimlet.handlerObject[0]._content;
	}
	if(zimlet.userProperties){
		this.userProperties = zimlet.userProperties[0];
		this._translateUserProp();
	}

	this._loadIncludes();
	this._loadStyles();

	this._handleMenuItemSelected = new AjxListener(this, this._handleMenuItemSelected);
};

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
		this.handlerObject.init(this, DwtShell.getShell(window));
	}
};

ZmZimletContext.prototype._loadStyles = function() {
	if (!this.includeCSS)
		return;
	var head = document.getElementsByTagName("head")[0];
	for (var i = 0; i < this.includeCSS.length; ++i) {
		var fullurl = this.includeCSS[i];
		if (!/^((https?|ftps?):\x2f\x2f|\x2f)/.test(fullurl))
			// relative URL
			fullurl = this._url + fullurl;
		var style = document.createElement("link");
		style.type = "text/css";
		style.rel = "stylesheet";
		style.href = fullurl;
		style.title = this.name + " " + this.includeCSS[i];
		head.appendChild(style);
	}
};

ZmZimletContext.prototype.getOrganizer = function() {
	// this._organizer is a ZmZimlet and is set in ZmZimlet.createFromJs
	return this._organizer;
};

ZmZimletContext.prototype.getUrl = function() { return this._url; };

ZmZimletContext.prototype.getVal = function(key, val) {
	if (val == null)
		val = this[key];
	if (val == null)
		return null;
	if (val instanceof Array && val.length == 1)
		val = val[0];
	if (val._content != null)
		val = val._content;
	return val;
};

ZmZimletContext.prototype.callHandler = function(funcname, args) {
	if (this.handlerObject) {
		var f = this.handlerObject[funcname];
		if (typeof f == "function") {
			if (typeof args == "undefined")
				args = [];
			if (!(args instanceof Array))
				args = [ args ];
			return f.apply(this.handlerObject, args);
		}
	}
};

// TODO: this func. must be a wrapper that translates msg which may be in the
// form "${msg.foo}" into calls that AjxMessageFormat can handle.
ZmZimletContext.prototype.msgFormat = function(msg) {
	return msg;
};

ZmZimletContext.prototype._translateUserProp = function() {
	// that's gonna do for now.
	var a = this.userProperties = this.userProperties.property;
	this._propsById = {};
	for (var i = 0; i < a.length; ++i)
		this._propsById[a[i].name] = a[i];
	// alert(this.userProperties.toSource());
};

ZmZimletContext.prototype.setPropValue = function(name, val) {
	this._propsById[name].value = val;
};

ZmZimletContext.prototype.getPropValue = function(name) {
	return this._propsById[name].value;
};

ZmZimletContext.prototype.getProp = function(name) {
	return this._propsById[name];
};

ZmZimletContext.prototype.getPanelActionMenu = function() {
	if (this._panelActionMenu instanceof AjxCallback)
		this._panelActionMenu = this._panelActionMenu.run();
	return this._panelActionMenu;
};

ZmZimletContext.prototype._makeMenu = function(obj) {
	var menu = new ZmPopupMenu(DwtShell.getShell(window));
	for (var i = 0; i < obj.length; ++i) {
		var data = obj[i];
		if (!data.id)
			menu.createSeparator();
		else {
			//alert([data.id, data.label, data.icon].join("\n"));
			var item = menu.createMenuItem(data.id, data.icon, data.label,
						       data.disabledIcon, true);
			item.setData("xmlMenuItem", data);
			item.addSelectionListener(this._handleMenuItemSelected);
		}
	}
	//menu.addSelectionListener();
	return menu;
};

ZmZimletContext.prototype._handleMenuItemSelected = function(ev) {
	var data = ev.item.getData("xmlMenuItem");
	if (data.actionUrl) {
		this._handleActionUrl(data.actionUrl[0]);
	} else {
		this.callHandler("menuItemSelected", [ data.id, data ]);
	}
};

ZmZimletContext.prototype._handleActionUrl = function(actionUrl) {
	var url = actionUrl.target;
	var param = [];
	if (actionUrl.param) {
		var a = actionUrl.param;
		for (var i = 0; i < a.length; ++i) {
			// trim whitespace as it's almost certain that the
			// developer didn't intend it.
			var val = a[i]._content
				.replace(/^\s+/, "")
				.replace(/\s+$/, "");
			param.push([ AjxStringUtil.urlEncode(a[i].name),
				     "=",
				     AjxStringUtil.urlEncode(val) ].join(""));
		}
		url = [ url, "?", param.join("&") ].join("");
	}
	window.open(url, "_blank");
};
