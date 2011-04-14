/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a tooltip manager.
 * @constructor
 * @class
 * This singleton class manages tooltip content generation and retrieval. Tooltips are
 * broken down by type based on what they show (for example information about
 * a person). Each type has a handler, which gets passed the appropriate data
 * and generates the tooltip content.
 *
 * @author Conrad Damon
 * 
 * @param {ZmComposite}	container	the containing shell
 * @param {ZmMailApp}	mailApp		the containing app
 */

ZmToolTipMgr = function() {
	this._registry = {};
	this.registerToolTipHandler(ZmToolTipMgr.PERSON, this.getPersonToolTip);
};

ZmToolTipMgr.PERSON = "PERSON";

/**
 * Associates a type of tooltip with a function to generate its content.
 * 
 * @param {constant}	type		type of tooltip
 * @param {function}	handler		function that returns tooltip content
 */
ZmToolTipMgr.prototype.registerToolTipHandler =
function(type, handler) {
	this._registry[type] = handler;
};

/**
 * Returns tooltip content for the given type with the given data.
 * 
 * @param {constant}	type		type of tooltip
 * @param {hash}		params		arbitrary data to pass to tooltip function
 * @param {AjxCallback}	callback	callback to run with results (optional)
 */
ZmToolTipMgr.prototype.getToolTip =
function(type, params, callback) {
	var handler = this._registry[type];
	if (handler && AjxUtil.isFunction(handler)) {
		return handler.apply(this, [params, callback]);
	}
};

/**
 * Returns tooltip content for a person based on an email address or contact.
 * 
 * @param {hash}					params			hash of params:
 * @param {string|AjxEmailAddress}	address			email address
 * @param {ZmContact}				contact			contact - need either address or contact
 * @param {DwtMouseEvent}			ev				mouseover event
 * @param {boolean}					noRightClick	if true, don't show right click hint
 * @param {AjxCallback}				callback		callback to run with results (optional)
 */
ZmToolTipMgr.prototype.getPersonToolTip =
function(params, callback) {

	if (!(params && (params.address || params.contact))) { return ""; }

	var contact = params.contact;
	var address = params.address || contact.getEmail();
	if (!address.isAjxEmailAddress) {
		address = new AjxEmailAddress(address);
	}
	
	if (appCtxt.notifyZimlets("onHoverOverEmailInList", [address, params.ev, params.noRightClick])) {
		// Zimlet framework is handling the tooltip
		return "";
	}
	
	var contactsApp = appCtxt.get(ZmSetting.CONTACTS_ENABLED) && appCtxt.getApp(ZmApp.CONTACTS);
	if (!contact && !contactsApp) { return ""; }

	var addr = address.getAddress();

	if (callback) {
		if (contact) {
			this._handleResponseGetContact(address, callback, contact);
		}
		else {
			var respCallback = new AjxCallback(this, this._handleResponseGetContact, [address, callback]);
			contactsApp.getContactByEmail(addr, respCallback);
		}
	} else {
		contact = contact || contactsApp.getContactByEmail(addr);
		return this._handleResponseGetContact(address, null, contact);
	}
};
		
ZmToolTipMgr.prototype._handleResponseGetContact =
function(address, callback, contact) {

	if (!address && !contact) { return ""; }
	
	var tooltip;
	if (contact) {
		tooltip = contact.getToolTip(address.getAddress());
	} else {
		tooltip = AjxTemplate.expand("abook.Contacts#TooltipNotInAddrBook", {addrstr:address.toString()});
	}

	if (callback) {
		callback.run(tooltip);
	} else {
		return tooltip;
	}
};
