/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a personna.
 * @class
 * This class represents a personna.
 * 
 * @param	{ZmIdentity}		identity		the identity
 * @param	{Object}		list		the list
 * @extends		ZmAccount
 */
ZmPersona = function(identity, list) {
	if (arguments.length == 0) { return; }
	
	ZmAccount.call(this, ZmAccount.TYPE_PERSONA, identity.id, null, list);

	identity.sendFromDisplay = identity.sendFromDisplay || appCtxt.get(ZmSetting.DISPLAY_NAME);
	identity.sendFromAddress = identity.sendFromAddress || appCtxt.get(ZmSetting.USERNAME);
    identity.sendFromAddressType = identity.sendFromAddressType || ZmSetting.SEND_AS;
	this.identity = identity;
};
ZmPersona.prototype = new ZmAccount;
ZmPersona.prototype.constructor = ZmPersona;

ZmPersona.prototype.toString =
function() {
	return "ZmPersona";
};


//
// Public methods
//

ZmPersona.prototype.setName =
function(name) {
	this.getIdentity().name = AjxStringUtil.htmlEncode(name);
};

ZmPersona.prototype.getName =
function() {
	return AjxStringUtil.htmlDecode(this.getIdentity().name);
};

ZmPersona.prototype.setEmail =
function(email) {
	this.getIdentity().sendFromAddress = email;
};

ZmPersona.prototype.getEmail =
function() {
	return this.getIdentity().sendFromAddress;
};

ZmPersona.prototype.getIdentity =
function() {
	return this.identity;
};

ZmPersona.prototype.create =
function(callback, errorCallback, batchCmd) {
	return this.getIdentity().create(callback, errorCallback, batchCmd);
};

ZmPersona.prototype.save =
function(callback, errorCallback, batchCmd) {
	return this.getIdentity().save(callback, errorCallback, batchCmd);
};

ZmPersona.prototype.doDelete = 
function(callback, errorCallback, batchCmd) {
	return this.getIdentity().doDelete(callback, errorCallback, batchCmd);
};
