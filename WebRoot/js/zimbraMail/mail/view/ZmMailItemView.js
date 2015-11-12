/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @class
 * Base class for a view displaying a single mail item (msg or conv).
 *
 * @author Conrad Damon
 *
 * @param {string}					id				ID for HTML element
 * @param {ZmListController}		controller		containing controller
 *
 * @extends		DwtComposite
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
	return this._item ? [ZmMsg.zimbraTitle, this._item.subject].join(": ") : ZmMsg.zimbraTitle;
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
