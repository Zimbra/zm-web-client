/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * This file contains the Zimlet context class.
 */

/**
 * Creates the Zimlet context.
 * @class
 * This class represents the Zimlet context.
 * 
 * @param	{String}	id		the id
 * @param	{ZmZimletBase}	zimlet	the Zimlet
 * 
 */
ZmZimletContext = function(id, zimlet) {

	// sanitize JSON here
	this.json = ZmZimletContext.sanitize(zimlet, "zimlet", ZmZimletContext.RE_ARRAY_ELEMENTS);

	this.id = id;
	this.icon = "ZimbraIcon";
	this.ctxt = zimlet.zimletContext;
	this.config = zimlet.zimletConfig;
	zimlet = zimlet.zimlet[0];
	/**
	 * The zimlet name.
	 * @type String
	 */
	this.name = zimlet.name;
	this._url = this.ctxt[0].baseUrl;
	this.priority = this.ctxt[0].priority;
	/**
	 * The zimlet description.
	 * @type String
	 */
	this.description = zimlet.description;
	/**
	 * The zimlet version.
	 * @type String
	 */
	this.version = zimlet.version;
	this.label = zimlet.label;
	this.includes = this.json.zimlet.include || [];
	this.includes.push([appContextPath, "/messages/", this.name, ".js?v=", cacheKillerVersion].join(""));
	this.includeCSS = this.json.zimlet.includeCSS;

	if (zimlet.serverExtension && zimlet.serverExtension[0].hasKeyword) {
		this.keyword = zimlet.serverExtension[0].hasKeyword;
	}

	DBG.println(AjxDebug.DBG2, "Zimlets - context: " + this.name);

	this.targets = {};
	var targets = (zimlet.target || "main").split(" ");
	for (var i = 0; i < targets.length; i++) {
		this.targets[targets[i]] = true;
	}

	this._contentActionMenu = null;
	if (zimlet.contentObject) {
		this.contentObject = zimlet.contentObject[0];
		if (this.contentObject.type) {
			this.type = this.contentObject.type;
		}
		if (this.contentObject.contextMenu) {
			if (this.contentObject.contextMenu instanceof Array) {
				this.contentObject.contextMenu = this.contentObject.contextMenu[0];
			}
			this._contentActionMenu = new AjxCallback(this, this._makeMenu,[this.contentObject.contextMenu.menuItem]);
		}
	}

	this._panelActionMenu = null;
	if (zimlet.zimletPanelItem && !appCtxt.isChildWindow) {
		this.zimletPanelItem = zimlet.zimletPanelItem[0];
		if (this.zimletPanelItem.label) {
			this.zimletPanelItem.label = this.process(this.zimletPanelItem.label);
		}
		if (this.zimletPanelItem.toolTipText && this.zimletPanelItem.toolTipText[0]) {
			this.zimletPanelItem.toolTipText = this.process(this.zimletPanelItem.toolTipText[0]._content);
		}
		if (this.zimletPanelItem.icon) {
			this.icon = this.zimletPanelItem.icon;
		}
		if (this.zimletPanelItem.contextMenu) {
			if (this.zimletPanelItem.contextMenu instanceof Array) {
				this.zimletPanelItem.contextMenu = this.zimletPanelItem.contextMenu[0];
			}
			this._panelActionMenu = new AjxCallback(this, this._makeMenu, [this.zimletPanelItem.contextMenu.menuItem]);
		}
		if (this.zimletPanelItem.onClick instanceof Array) {
			this.zimletPanelItem.onClick = this.zimletPanelItem.onClick[0];
		}
		if (this.zimletPanelItem.onDoubleClick instanceof Array) {
			this.zimletPanelItem.onDoubleClick = this.zimletPanelItem.onDoubleClick[0];
		}
	}

	if (zimlet.handlerObject) {
		this.handlerObject = zimlet.handlerObject[0]._content;
	}

	var portlet = zimlet.portlet && zimlet.portlet[0];
	if (portlet) {
		portlet = ZmZimletContext.sanitize(portlet);
		portlet.portletProperties = (portlet.portletProperties && portlet.portletProperties.property) || {};
		this.portlet = portlet;
	}

	this.userProperties = zimlet.userProperties ? zimlet.userProperties[0] : [];
	this._propsById = {};
	if (zimlet.userProperties) {
		this._translateUserProp();
	}

	if (this.config) {
		if (this.config instanceof Array ||
			(appCtxt.isChildWindow && this.config.length && this.config[0])) {

			this.config = this.config[0];
		}
		this._translateConfig();
	}

	this._handleMenuItemSelected = new AjxListener(this, this._handleMenuItemSelected);
};

ZmZimletContext.prototype.constructor = ZmZimletContext;


//
// Consts
//
ZmZimletContext.RE_ARRAY_ELEMENTS = /^(dragSource|include|includeCSS|menuItem|param|property|resource|portlet)$/;
ZmZimletContext.APP = {
	contextPath: appContextPath,
	currentSkin: appCurrentSkin
};

// NOTE: I have no idea why these regexes start with (^|[^\\]). But
//       since they have always been public, I can't change them now.
ZmZimletContext.RE_SCAN_APP = /(^|[^\\])\$\{app\.([\$a-zA-Z0-9_]+)\}/g;
ZmZimletContext.RE_SCAN_OBJ = /(^|[^\\])\$\{(?:obj|src)\.([\$a-zA-Z0-9_]+)\}/g;
ZmZimletContext.RE_SCAN_PROP = /(^|[^\\])\$\{prop\.([\$a-zA-Z0-9_]+)\}/g;
ZmZimletContext.RE_SCAN_MSG = /(^|[^\\])\$\{msg\.([\$a-zA-Z0-9_]+)\}/g;

ZmZimletContext.__RE_SCAN_SETTING = /\$\{setting\.([\$a-zA-Z0-9_]+)\}/g;

/**
 * @private
 */
ZmZimletContext._isArray =
function(obj){
    return (!AjxUtil.isUndefined(obj) && appCtxt.isChildWindow && obj.length && AjxUtil.isFunction(obj.sort) && AjxUtil.isFunction(obj.unshift) );
};

/**
 * This function creates a 'sane' JSON object, given one returned by the
 * Zimbra server.
 *<p>
 * It will basically remove unnecessary arrays and create String objects for
 * those tags that have text data, so that we don't need to dereference lots of
 * arrays and use _content. It does the job that the server should do.  *grin*
 * </p>
 * <b>WARNING</b>: usage of an attribute named "length" may give sporadic
 * results, since we convert tags that have text content to Strings.
 *
 * @param obj -- array or object, whatever was given by server
 * @param tag -- the tag of this object, if it's an array
 * @param wantarray_re -- RegExp that matches tags that must remain an array
 *
 * @return -- sanitized object
 * 
 * @private
 */
ZmZimletContext.sanitize =
function(obj, tag, wantarray_re) {
	function doit(obj, tag) {
		var cool_json, val, i;
		if (obj instanceof DwtControl) { //Don't recurse into DwtControls, causes too much recursion
			return obj;
		}
		else if (obj instanceof Array || ZmZimletContext._isArray(obj) ) {
			if (obj.length == 1 && !(wantarray_re && wantarray_re.test(tag))) {
				cool_json = doit(obj[0], tag);
			} else {
				cool_json = [];
				for (i = 0; i < obj.length; ++i) {
					cool_json[i] = doit(obj[i], tag);
				}
			}
		}
		else if (obj && typeof obj == "object") {
			if (obj._content) {
				cool_json = new String(obj._content);
			} else {
				cool_json = {};
			}
			for (i in obj) {
				cool_json[i] = doit(obj[i], i);
			}
		} else {
			cool_json = obj;
		}
		return cool_json;
	}
	return doit(obj, tag);
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmZimletContext.prototype.toString =
function() {
	return "ZmZimletContext - " + this.name;
};

/**
 * <strong>Note:</strong>
 * This method is called by ZmZimletMgr#_finished_loadIncludes.
 * 
 * @private
 */
ZmZimletContext.prototype._finished_loadIncludes =
function() {
	var CTOR = this.handlerObject ? window[this.handlerObject] : ZmZimletBase;
	if (!CTOR) {
		DBG.println("zimlet handler not defined ("+this.handlerObject+")");
		return;
	}
	this.handlerObject = new CTOR();
	if (!this.handlerObject._init) {
		var msg = [
			"ERROR - Zimlet handler (",
			this.name,
			") not defined. ",
			"Make sure the Zimlet name and handlerObject defined in ",
			this.name,
			".xml are different."
		].join("");
		DBG.println(AjxDebug.DBG1, msg);
	}
	this.handlerObject._init(this, DwtShell.getShell(window));
	if (this.contentObject) {
		appCtxt.getZimletMgr().registerContentZimlet(this.handlerObject, this.type, this.priority);
	}
	this.handlerObject.init();
	this.handlerObject._zimletContext = this;
	// If it has an _id then we need to make sure the treeItem is up-to-date now
	// that the i18n files have loaded.
	if (this._id) {
		var tree = appCtxt.getZimletTree();
		if (tree) {
			var zimletItem = tree.getById(this._id);
			zimletItem.resetNames();
		}
	}

	// initialize portlets
	if (appCtxt.get(ZmSetting.PORTAL_ENABLED) && !appCtxt.isChildWindow) {
		var params = {
			name: "Portal",
			callback: new AjxCallback(this, this._finished_loadIncludes2)
		};
		DBG.println("------------------- REQUIRING Portal (ZmZimletContext)");
		AjxPackage.require(params);
	}

	DBG.println(AjxDebug.DBG2, "Zimlets - init() complete: " + this.name);
};

/**
 * @private
 */
ZmZimletContext.prototype._finished_loadIncludes2 =
function() {
	appCtxt.getApp(ZmApp.PORTAL).getPortletMgr().zimletLoaded(this);
};

/**
 * Gets the organizer.
 * 
 * @return	{ZmOrganizer}	the organizer
 */
ZmZimletContext.prototype.getOrganizer =
function() {
	// this._organizer is a ZmZimlet and is set in ZmZimlet.createFromJs
	return this._organizer;
};

/**
 * Gets the URL.
 * 
 * @return	{String}	the URL
 */
ZmZimletContext.prototype.getUrl =
function() {
	return this._url;
};

/**
 * Gets the value.
 * 
 * @param	{String}	key		the key
 * @return	{Object}	the value
 */
ZmZimletContext.prototype.getVal =
function(key) {
	var zim = this.json.zimlet;    
	return eval("zim." + key);
};

/**
 * Calls the handler.
 * 
 * @param	{String}	funcname		the function
 * @param	{Hash}		args			the arguments
 * @return	{Object}	the results or <code>null</code> for none
 * 
 * @private
 */
ZmZimletContext.prototype.callHandler =
function(funcname, args) {
	if (this.handlerObject) {
		var f = this.handlerObject[funcname];
		if (typeof f == "function") {
			if (typeof args == "undefined") {
				args = [];
			}
			else if (!(args instanceof Array)) {
				args = [args];
			}
			return f.apply(this.handlerObject, args);
		}
	}
	return null;
};

/**
 * @private
 */
ZmZimletContext.prototype._translateUserProp =
function() {
	var a = this.userProperties = this.userProperties.property;
	for (var i = 0; i < a.length; ++i) {
		this._propsById[a[i].name] = a[i];
	}
};

/**
 * Sets the property.
 * 
 * @param	{String}	name		the name
 * @param	{Object}	val			the value
 * 
 */
ZmZimletContext.prototype.setPropValue =
function(name, val) {
	if (!this._propsById[name]) {
		var prop = { name: name };
		this.userProperties.push(prop);
		this._propsById[name] = prop;
	}
	this._propsById[name].value = val;
};

/**
 * Gets the property.
 * 
 * @param	{String}	name		the name
 * @return	{Object}	value
 */
ZmZimletContext.prototype.getPropValue =
function(name) {
	return this._propsById[name] && this._propsById[name].value;
};

/**
 * Gets the property.
 * 
 * @param	{String}	name		the name
 * @return	{Object}	the property
 */
ZmZimletContext.prototype.getProp =
function(name) {
	return this._propsById[name];
};

/**
 * @private
 */
ZmZimletContext.prototype._translateConfig =
function() {
	if (!this.config) { return; }

	if (this.config.global && this.config.global[0]) {
		var prop = this.config.global[0].property;
		this.config.global = {};
		for (var i in prop) {
			this.config.global[prop[i].name] = prop[i]._content;
		}
	}
	if (this.config.local && this.config.local[0]) {
		var propLocal = this.config.local[0].property;
		this.config.local = {};
		for (var j in propLocal) {
			this.config.local[propLocal[j].name] = propLocal[j]._content;
		}
	}
};

/**
 * Gets the configuration value.
 * 
 * @param	{String}	name		the config key name
 * @return	{Object}	the config value or <code>null</code> if not set
 */
ZmZimletContext.prototype.getConfig =
function(name) {

	var config = (this.config && this.config.length && this.config[0]) ? this.config[0] : this.config;
	if (!config) { return; }

	if (config.local && config.local[name]) {
		return config.local[name];
	}

	if (config.global && config.global[name]) {
		return config.global[name];
	}

	return null;
};

/**
 * Gets the panel action menu.
 * 
 * @return	{ZmActionMenu}	the menu
 */
ZmZimletContext.prototype.getPanelActionMenu =
function() {
	if (this._panelActionMenu instanceof AjxCallback) {
		this._panelActionMenu = this._panelActionMenu.run();
	}
	return this._panelActionMenu;
};

/**
 * @private
 */
ZmZimletContext.prototype._makeMenu =
function(obj) {
	var menu = new ZmActionMenu({parent:DwtShell.getShell(window), menuItems:ZmOperation.NONE});
	for (var i = 0; i < obj.length; ++i) {
		var data = obj[i];
		if (!data.id) {
			menu.createSeparator();
		} else {
			var params = {image:data.icon, text:this.process(data.label),disImage:data.disabledIcon};
			var item = menu.createMenuItem(data.id, params);
			item.setData("xmlMenuItem", data);
			item.addSelectionListener(this._handleMenuItemSelected);
		}
	}
	return menu;
};

/**
 * @private
 */
ZmZimletContext.prototype._handleMenuItemSelected =
function(ev) {
	var data = ev.item.getData("xmlMenuItem");
	if (data.actionUrl) {
		this.handleActionUrl(data.actionUrl[0], data.canvas);
	} else {
		this.callHandler("menuItemSelected", [data.id, data, ev]);
	}
};

/**
 * @private
 */
ZmZimletContext.prototype.process =
function(str, obj, props) {
	if (obj) {
		str = this.processString(str, obj);
	}
	str = this.processMessage(str); 
	str = this.replaceObj(ZmZimletContext.RE_SCAN_PROP, str, props || this._propsById);
	str = this.replaceObj(ZmZimletContext.RE_SCAN_APP, str, ZmZimletContext.APP);
	str = str.replace(ZmZimletContext.__RE_SCAN_SETTING, ZmZimletContext.__replaceSetting);
	return str;
};

/**
 * @private
 */
ZmZimletContext.prototype.processString =
function(str, obj) {
	return this.replaceObj(ZmZimletContext.RE_SCAN_OBJ, str, obj);
};

/**
 * @private
 */
ZmZimletContext.prototype.processMessage =
function(str) {
	// i18n files load async so if not defined skip translation
	if (!window[this.name]) {
		DBG.println(AjxDebug.DBG2, "processMessage no messages: " + str);
		return str;
	}
	var props = window[this.name];
	return this.replaceObj(ZmZimletContext.RE_SCAN_MSG, str, props);
};

/**
 * @private
 */
ZmZimletContext.prototype.replaceObj =
function(re, str, obj) {
	return String(str).replace(re,
		function(str, p1, prop) {
			var txt = p1;
			if (obj instanceof Array && obj.length > 1) {
				for(var i=0; i < obj.length; i++) {
					if(txt) {txt += ",";}
					var o = obj[i];
					if (o[prop] instanceof Object) {
						txt += o[prop].value;  // user prop
					} else {
						txt += o[prop];   // string
					}
				}
			} else {
				if (typeof obj[prop] != "undefined") {
					if (obj[prop] instanceof Object) {
						txt += obj[prop].value;  // user prop
					} else {
						txt += obj[prop];   // string
					}
				} else {
					txt += "(UNDEFINED - str '" + str + "' obj '" + obj + "')";
				}
			}
			return txt;
		});
};

/**
 * @private
 */
ZmZimletContext.__replaceSetting =
function($0, name) {
	return appCtxt.get(name);
};

/**
 * @private
 */
ZmZimletContext.prototype.makeURL =
function(actionUrl, obj, props) {
	// All URL's to have REST substitutions
	var url = this.process(actionUrl.target, obj, props);
	var param = [];
	if (actionUrl.param) {
		var a = actionUrl.param;
		for (var i = 0; i < a.length; ++i) {
			// trim whitespace as it's almost certain that the
			// developer didn't intend it.
			var val = AjxStringUtil.trim(a[i]._content || a[i]);
			val = this.process(val, obj, props);
			param.push([ AjxStringUtil.urlEncode(a[i].name),
				     "=",
				     AjxStringUtil.urlEncode(val) ].join(""));
		}
		var startChar = actionUrl.paramStart || '?';
		var joinChar = actionUrl.paramJoin || '&';
		url = [ url, startChar, param.join(joinChar) ].join("");
	}
	return url;
};

/**
 * If there already is a paintable canvas to use, as in the case of tooltip,
 * pass it to 'div' parameter.  otherwise a canvas (window, popup, dialog) will
 * be created to display the contents from the url.
 *
 * @param actionUrl
 * @param canvas
 * @param obj
 * @param div
 * @param x
 * @param y
 * 
 * @private
 */
ZmZimletContext.prototype.handleActionUrl =
function(actionUrl, canvas, obj, div, x, y) {
	var url = this.makeURL(actionUrl, obj);
	var xslt = actionUrl.xslt && this.getXslt(actionUrl.xslt);

	// need to use callback if the paintable canvas already exists, or if it
	// needs xslt transformation.
	if (div || xslt) {
		if (!div) {
			canvas = this.handlerObject.makeCanvas(canvas, null, x, y);
			div = document.getElementById("zimletCanvasDiv");
		}
		url = ZmZimletBase.PROXY + AjxStringUtil.urlComponentEncode(url);
		AjxRpc.invoke(null, url, null, new AjxCallback(this, this._rpcCallback, [xslt, div]), true);
	} else {
		this.handlerObject.makeCanvas(canvas, url, x, y);
	}
};

/**
 * @private
 */
ZmZimletContext._translateZMObject =
function(obj) {
	// XXX Assumes all dragged objects are of the same type
	var type = obj[0] ? obj[0].toString() : obj.toString();
	return (ZmZimletContext._zmObjectTransformers[type])
		? ZmZimletContext._zmObjectTransformers[type](obj) : obj;
};

/**
 * @private
 */
ZmZimletContext._zmObjectTransformers = {

	"ZmMailMsg" : function(o) {
		var all = [];
		o = (o instanceof Array) ? o : [o];
		for (var i = 0; i < o.length; i++) {
			var ret = { TYPE: "ZmMailMsg" };
			var oi = o[i];
			ret.id			= oi.id;
			ret.convId		= oi.cid;
			ret.from		= oi.getAddresses(AjxEmailAddress.FROM).getArray();
			ret.to			= oi.getAddresses(AjxEmailAddress.TO).getArray();
			ret.cc			= oi.getAddresses(AjxEmailAddress.CC).getArray();
			ret.subject		= oi.subject;
			ret.date		= oi.date;
			ret.size		= oi.size;
			ret.fragment	= oi.fragment;
			ret.tags		= oi.tags;
			ret.unread		= oi.isUnread;
			ret.attachment	= oi.attachments.length > 0;
			ret.attlinks	= oi._attLinks || oi.getAttachmentLinks();
			ret.sent		= oi.isSent;
			ret.replied		= oi.isReplied;
			ret.draft		= oi.isDraft;
			ret.body		= ZmZimletContext._getMsgBody(oi);
			ret.srcObj		= oi;
			all[i] = ret;
		}
		if (all.length == 1) {
			return all[0];
		} else {
			all["TYPE"] = "ZmMailMsg";
			return all;
		}
	},

	"ZmConv" : function(o) {
		var all = [];
		o = (o instanceof Array) ? o : [o];
		for (var i = 0; i < o.length; i++) {
			var oi = o[i];
			var ret = { TYPE: "ZmConv" };
			ret.id				= oi.id;
			ret.subject			= oi.subject;
			ret.date			= oi.date;
			ret.fragment		= oi.fragment;
			ret.participants	= oi.participants.getArray();
			ret.numMsgs			= oi.numMsgs;
			ret.tags			= oi.tags;
			ret.unread			= oi.isUnread;
			ret.body			= ZmZimletContext._getMsgBody(oi.getFirstHotMsg());
			ret.srcObj			= oi;
			all[i] = ret;
		}
		if (all.length == 1) {
			return all[0];
		} else {
			all["TYPE"] = "ZmConv";
			return all;
		}
	},

	ZmContact_fields : function() {
		return [
			ZmContact.F_assistantPhone,
			ZmContact.F_callbackPhone,
			ZmContact.F_carPhone,
			ZmContact.F_company,
			ZmContact.F_companyPhone,
			ZmContact.F_email,
			ZmContact.F_email2,
			ZmContact.F_email3,
			ZmContact.F_fileAs,
			ZmContact.F_firstName,
			ZmContact.F_homeCity,
			ZmContact.F_homeCountry,
			ZmContact.F_homeFax,
			ZmContact.F_homePhone,
			ZmContact.F_homePhone2,
			ZmContact.F_homePostalCode,
			ZmContact.F_homeState,
			ZmContact.F_homeStreet,
			ZmContact.F_homeURL,
			ZmContact.F_jobTitle,
			ZmContact.F_lastName,
			ZmContact.F_middleName,
			ZmContact.F_mobilePhone,
			ZmContact.F_namePrefix,
			ZmContact.F_nameSuffix,
			ZmContact.F_notes,
			ZmContact.F_otherCity,
			ZmContact.F_otherCountry,
			ZmContact.F_otherFax,
			ZmContact.F_otherPhone,
			ZmContact.F_otherPostalCode,
			ZmContact.F_otherState,
			ZmContact.F_otherStreet,
			ZmContact.F_otherURL,
			ZmContact.F_pager,
			ZmContact.F_workCity,
			ZmContact.F_workCountry,
			ZmContact.F_workFax,
			ZmContact.F_workPhone,
			ZmContact.F_workPhone2,
			ZmContact.F_workPostalCode,
			ZmContact.F_workState,
			ZmContact.F_workStreet,
			ZmContact.F_workURL
			];
	},

	"ZmContact" : function(o) {
		o = (o instanceof Array) ? o : [o];
		var all = new Array();
		for (var i = 0; i < o.length; i++) {
			var ret = { TYPE: "ZmContact" };
			var a = this.ZmContact_fields;
			if (typeof a == "function") {
				a = this.ZmContact_fields = a();
			}
			var attr = o[i].getAttrs();
			for (var j = 0; j < a.length; ++j) {
				ret[a[j]] = attr[a[j]];
			}
			ret.id = o[i].id;
			all[i] = ret;
		}
		if (all.length == 1) {
			return all[0];
		} else {
			all["TYPE"] = "ZmContact";
			return all;
		}
	},

	"ZmFolder" : function(o) {
		var oi = o[0] ? o[0] : o;
		var ret = { TYPE: "ZmFolder" };
		ret.id			= oi.id;
		ret.name		= oi.getName();
		ret.path		= oi.getPath();
		ret.isInTrash	= oi.isInTrash();
		ret.unread		= oi.numUnread;
		ret.total		= oi.numTotal;
		ret.url			= oi.getRestUrl();
		ret.srcObj		= oi;
		return ret;
	},

	"ZmAppt" : function(o) {
		var oi = o[0] ? o[0] : o;
		oi.getDetails();
		var ret = { TYPE: "ZmAppt" };
		ret.id				= oi.id;
		ret.uid				= oi.uid;
		ret.subject			= oi.getName();
		ret.startDate		= oi.startDate;
		ret.endDate			= oi.endDate;
		ret.allDayEvent		= oi.isAllDayEvent();
		ret.exception		= oi.isException;
		ret.alarm			= oi.alarm;
		ret.otherAttendees	= oi.otherAttendees;
		ret.attendees		= oi.getAttendeesText(ZmCalBaseItem.PERSON);
		ret.resources		= oi.getAttendeesText(ZmCalBaseItem.EQUIPMENT);
		ret.location		= oi.getLocation();
		ret.notes			= oi.getNotesPart();
		ret.isRecurring		= oi.isRecurring();
		ret.timeZone		= oi.timezone;
		ret.srcObj			= oi;
		return ret;
	}
};

/**
 * Gets the xslt.
 * 
 * @param	{String}	url		the URL
 * @return	{AjxXslt}	the xslt
 */
ZmZimletContext.prototype.getXslt =
function(url) {
	if (!this._xslt) {
		this._xslt = {};
	}
	var realurl = this.getUrl() + url;
	if (!this._xslt[realurl]) {
		this._xslt[realurl] = AjxXslt.createFromUrl(realurl);
	}
	return this._xslt[realurl];
};

/**
 * @private
 */
ZmZimletContext.prototype._rpcCallback =
function(xslt, canvas, result) {
	var html, resp = result.xml;
	if (!resp) {
		var doc = AjxXmlDoc.createFromXml(result.text);
		resp = doc.getDoc();
	}
	// TODO:  instead of changing innerHTML, maybe append
	// the dom tree to the canvas.
	if (xslt) {
		html = xslt.transformToString(resp);
		// If we don't have HTML at this point, we probably have a HTML fragment.
		if (!html) {
			html = result.text;
		}
		
	} else {
		html = resp.innerHTML;
	}
	canvas.innerHTML = html;
};

/**
 * @private
 */
ZmZimletContext._getMsgBody =
function(o) {
	var body = o.getTextPart();
	if (!body && o.getBodyPart(ZmMimeTable.TEXT_HTML)) {
		var div = document.createElement("div");
		div.innerHTML = o.getBodyPart(ZmMimeTable.TEXT_HTML).content;
		body = AjxStringUtil.convertHtml2Text(div);
	}
	return body;
};
