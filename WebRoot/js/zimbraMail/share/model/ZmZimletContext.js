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
	this.config = zimlet.zimletConfig;
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
	if(this.config){
		this.config = this.config[0];
		this._translateConfig();
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
		   new AjxCallback(this, this._finished_loadIncludes)
		   // ,"/service/proxy?target="
		);
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
		ZmObjectManager.registerHandler(this.handlerObject);
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

ZmZimletContext.prototype._translateConfig = function() {
	if (this.config.global) {
		var prop = this.config.global[0].property;
		this.config.global = {};
		for (var i = 0; i < prop.length; i++)
			this.config.global[prop[i].name] = prop[i]._content;
	}
	if (this.config.local) {
		var prop = this.config.local[0].property;
		this.config.local = {};
		for (var i = 0; i < prop.length; i++)
			this.config.local[prop[i].name] = prop[i]._content;
	}
};

ZmZimletContext.prototype.getConfig = function(name) {
	if (this.config.local && this.config.local[name])
		return this.config.local[name];
	if (this.config.global && this.config.global[name])
		return this.config.global[name];
	return undef;
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

ZmZimletContext._translateZMObject = function(obj) {
	if (ZmZimletContext._zmObjectTransformers[obj.toString()])
		return ZmZimletContext._zmObjectTransformers[obj.toString()](obj);
	else
		return obj;
};

ZmZimletContext._zmObjectTransformers = {

	"ZmMailMsg" : function(o) {
		if (o[0])
			o = o[0];
		var ret = { TYPE: "ZmMailMsg" };
		ret.id           = o.getId();
		ret.convId       = o.getConvId();
		ret.from         = o.getAddresses(ZmEmailAddress.FROM).getArray();
		ret.to           = o.getAddresses(ZmEmailAddress.TO).getArray();
		ret.cc           = o.getAddresses(ZmEmailAddress.CC).getArray();
		ret.subject      = o.getSubject();
		ret.date         = o.getDate();
		ret.size         = o.getSize();
		ret.fragment     = o.fragment;
		// FIXME: figure out how to get these
		// ret.tags         = o.getTags();
		// ret.flagged      = o.getFlagged();
		ret.unread       = o.isUnread;
		ret.attachment   = o._attachments.length > 0;
		ret.sent         = o.isSent;
		ret.replied      = o.isReplied;
		ret.draft        = o.isDraft;
		ret.body         = o.getTextPart();
		if (!ret.body) {
// 			ret.body = AjxStringUtil.convertHtml2Text(
// 				Dwt.parseHtmlFragment(
// 					"<div>" +
// 					o.getBodyPart(ZmMimeTable.TEXT_HTML).content +
// 					"</div>"));
//  			ret.body = o.getBodyPart(ZmMimeTable.TEXT_HTML).content;
			// FIXME: figure out how to properly translate it to text
			ret.body = ret.fragment;
		}
		return ret;
	},

	"ZmConv" : function(o) {
		if (o[0])
			o = o[0];
		var ret = { TYPE: "ZmConv" };
		ret.id           = o.id;
		ret.subject      = o.getSubject();
		ret.date         = o.date;
		ret.fragment     = o.fragment;
		ret.participants = o.participants.getArray();
		ret.numMsgs      = o.numMsgs;
		// FIXME: figure out how to get these
		// ret.tags         = o.getTags();
		// ret.flagged      = o.getFlagged();
		ret.unread       = o.isUnread;
		// ret.attachment   = o._attachments ?;
		// ret.sent         = o.isSent;

		// FIXME: perhaps we should get the body of the most recent message?
		ret.body         = ret.fragment;
		return ret;
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
		// can't even remotely understand why, after a contact has been
		// displayed once, we need to check it's "0" property and
		// retrieve the actual object from there.  x-( So, object in an
		// object.  Could it be because of our current JSON format?
		if (o[0])
			o = o[0];
		var ret = { TYPE: "ZmContact" };
		var a = this.ZmContact_fields;
		if (typeof a == "function")
			a = this.ZmContact_fields = a();
		var attr;
		var attr = o.getAttrs();
		for (var i = 0; i < a.length; ++i)
			ret[a[i]] = attr[a[i]];
		return ret;
	},

	"ZmAppt" : function(o) {
		if (o[0])
			o = o[0];
		var ret = { TYPE: "ZmAppt" };
		ret.id             = o.getId();
		ret.uid            = o.getUid();
		ret.type           = o.getType();
		ret.subject        = o.getName();
		ret.startDate      = o.getStartDate();
		ret.endDate        = o.getEndDate();
		ret.allDayEvent    = o.isAllDayEvent();
		ret.exception      = o.isException();
		ret.recurring      = o.isRecurring();
		ret.alarm          = o.hasAlarm();
		ret.otherAttendees = o.hasOtherAttendees();
		ret.attendees      = o.getAttendees();
		ret.location       = o.getLocation();
		ret.notes          = o.getNotesPart();
		ret.isRecurring    = ret.recurring; // WARNING: duplicate
		ret.timeZone       = o.getTimezone();
		return ret;
	}

};
