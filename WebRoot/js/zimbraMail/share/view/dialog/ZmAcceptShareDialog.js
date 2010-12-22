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
 */

/**
 * Creates an "accept share" dialog.
 * @class
 * This class represents an "accept share" dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmAcceptShareDialog = function(parent, className) {
	className = className || "ZmAcceptShareDialog";
	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.acceptShare,
						  standardButtons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]});
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));
	this.setButtonListener(DwtDialog.NO_BUTTON, new AjxListener(this, this._handleNoButton));
	
	this.setView(this._createView());
	
	// create formatters
	this._headerFormatter = new AjxMessageFormat(ZmMsg.acceptShareHeader);
	this._detailsFormatter = new AjxMessageFormat(ZmMsg.acceptShareDetails);
};

ZmAcceptShareDialog.prototype = new DwtDialog;
ZmAcceptShareDialog.prototype.constructor = ZmAcceptShareDialog;

// Constants

ZmAcceptShareDialog._ACTIONS = {};
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_NONE]		= ZmMsg.acceptShareDetailsNone;
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_VIEWER]	= ZmMsg.acceptShareDetailsViewer;
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_MANAGER]	= ZmMsg.acceptShareDetailsManager;
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_ADMIN]	= ZmMsg.acceptShareDetailsAdmin;

// Public methods

/**
 * Pops-up the dialog.
 * 
 * @param	{ZmShare}		share		the share
 * @param	{String}		fromAddr	the from address
 */
ZmAcceptShareDialog.prototype.popup =
function(share, fromAddr) {

	this._share = share;
	this._fromAddr = fromAddr;
	this._headerEl.innerHTML = this._headerFormatter.format([share.grantor.name || share.grantor.email, share.link.name]);

	var role = ZmShare._getRoleFromPerm(share.link.perm);
	var params = [
		ZmShare.getRoleName(role),
		ZmAcceptShareDialog._ACTIONS[role]   // TODO: Be able to generate custom perms list
	];
	this._detailsEl.innerHTML = this._detailsFormatter.format(params);
	this._questionEl.innerHTML = "<b>" + ZmMsg.acceptShareQuestion + "</b>";

	var namePart = share.grantor.name || (share.grantor.email && share.grantor.email.substr(0, share.grantor.email.indexOf('@')));
	this._nameEl.value = ZmShare.getDefaultMountpointName(namePart, share.link.name);

	this._reply.setReplyType(ZmShareReply.NONE);
	this._reply.setReplyNote("");

	var orgType = ZmOrganizer.TYPE[share.link.view];
	var icon = null;
	var orgClass = ZmOrganizer.ORG_CLASS[orgType];
	if (orgClass) {
		var prototype = window[orgClass].prototype;
		// HACK: to get default icon regardless of organizer type
		icon = prototype.getIcon.apply(prototype);
	}
	this._color.setImage(icon);
	this._color.setValue(ZmOrganizer.DEFAULT_COLOR[orgType]);
	
	DwtDialog.prototype.popup.call(this);
};

/**
 * Sets the accept listener.
 * 
 * @param	{AjxListener}		listener		the listener
 */
ZmAcceptShareDialog.prototype.setAcceptListener =
function(listener) {
	this.removeAllListeners(ZmAcceptShareDialog.ACCEPT);
	if (listener) {
		this.addListener(ZmAcceptShareDialog.ACCEPT, listener);
	}
};

// Protected methods

ZmAcceptShareDialog.prototype._handleYesButton =
function(ev) {
	var replyType = this._reply.getReplyType();
	var notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote(): "";
	var callback = new AjxCallback(this, this._yesButtonCallback, [ev]);
	this._share.accept(this._nameEl.value, this._color.getValue(), replyType, notes, callback, this._fromAddr);
};

ZmAcceptShareDialog.prototype._yesButtonCallback =
function(ev) {
	// notify accept listener and clear
	this.notifyListeners(ZmAcceptShareDialog.ACCEPT, ev);
	this.setAcceptListener(null);
	this.popdown();
};

ZmAcceptShareDialog.prototype._handleNoButton =
function(ev) {
	this.popdown();
};

ZmAcceptShareDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};

ZmAcceptShareDialog.prototype._createView =
function() {
	var view = new DwtComposite(this);

	this._headerEl = document.createElement("DIV");
	this._headerEl.style.marginBottom = "0.5em";
	this._detailsEl = document.createElement("DIV");
	this._detailsEl.style.marginBottom = "1em";
	this._questionEl = document.createElement("DIV");
	this._questionEl.style.marginBottom = "0.5em";
	this._nameEl = document.createElement("INPUT");
	this._nameEl.style.width = "20em";
	var nameElement = this._nameEl;

	this._color = new ZmColorButton({parent:this});

	var props = this._propSheet = new DwtPropertySheet(view);
	var propsEl = props.getHtmlElement();
	propsEl.style.marginBottom = "0.5em";
	props.addProperty(ZmMsg.nameLabel, nameElement);
	props.addProperty(ZmMsg.colorLabel, this._color);

	this._reply = new ZmShareReply(view);

	var settings = document.createElement("DIV");
	settings.style.marginLeft = "1.5em";
	settings.appendChild(propsEl);
	settings.appendChild(this._reply.getHtmlElement());	

	var el = view.getHtmlElement();
	el.appendChild(this._headerEl);
	el.appendChild(this._detailsEl);
	el.appendChild(this._questionEl);
	el.appendChild(settings);
	return view;
};
