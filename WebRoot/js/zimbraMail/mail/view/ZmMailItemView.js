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

ZmMailItemView = function(params) {

	if (arguments.length == 0) { return; }
	
	DwtComposite.call(this, params);

	this._controller = params.controller;
};

ZmMailItemView.prototype = new DwtComposite;
ZmMailItemView.prototype.constructor = ZmMailItemView;

ZmMailItemView.prototype.isZmMailItemView = true;
ZmMailItemView.prototype.toString = function() { return "ZmMailItemView"; };

ZmMailItemView.prototype.set =
function(item, force) {
};

ZmMailItemView.prototype.getItem =
function() {
};

ZmMailItemView.prototype.reset =
function() {
};

ZmMailItemView.prototype.getMinHeight =
function() {
	return 20;
};

ZmMailItemView.prototype.getMinWidth =
function() {
	return 20;
};

ZmMailItemView.prototype.getHtmlBodyElement =
function() {
};

ZmMailItemView.prototype.hasHtmlBody =
function() {
	return false;
};

ZmMailItemView.prototype.getItem =
function() {
	return this._item;
};

ZmMailItemView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._item.subject].join(": ");
};

ZmMailItemView.prototype.setReadingPane =
function() {
};

ZmMailItemView.prototype.getInviteMsgView =
function() {
	return this._inviteMsgView;
};

// Create the ObjectManager at the last minute just before we scan the message
ZmMailItemView.prototype._lazyCreateObjectManager =
function(view) {
	// objectManager will be 'true' at create time, after that it will be the
	// real object. NOTE: Replaced if (this._objectManager === true) as "==="
	// does deep comparision of objects which might take a while.
	var createObjectMgr = (AjxUtil.isBoolean(this._objectManager) && this._objectManager);
	var firstCallAfterZimletLoading = (!this.zimletLoadFlag && appCtxt.getZimletMgr().isLoaded());

	if (createObjectMgr || firstCallAfterZimletLoading) {
		this.zimletLoadFlag = appCtxt.getZimletMgr().isLoaded();
		// this manages all the detected objects within the view
		this._objectManager = new ZmObjectManager(view || this);
	}
};