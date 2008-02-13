/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmAcceptShareDialog = function(parent, className) {
	className = className || "ZmAcceptShareDialog";
	DwtDialog.call(this, parent, className, ZmMsg.acceptShare, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));
	this.setButtonListener(DwtDialog.NO_BUTTON, new AjxListener(this, this._handleNoButton));
	
	this.setView(this._createView());
	
	// create formatters
	this._headerFormatter = new AjxMessageFormat(ZmMsg.acceptShareHeader);
	this._detailsFormatter = new AjxMessageFormat(ZmMsg.acceptShareDetails);
	this._defaultNameFormatter = new AjxMessageFormat(ZmMsg.shareNameDefault);
};

ZmAcceptShareDialog.prototype = new DwtDialog;
ZmAcceptShareDialog.prototype.constructor = ZmAcceptShareDialog;

// Constants

ZmAcceptShareDialog._ACTIONS = {};
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_NONE] = ZmMsg.acceptShareDetailsNone;
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_VIEWER] = ZmMsg.acceptShareDetailsViewer;
ZmAcceptShareDialog._ACTIONS[ZmShare.ROLE_MANAGER] = ZmMsg.acceptShareDetailsManager;

// Public methods

ZmAcceptShareDialog.prototype.popup =
function(share) {

	this._share = share;
	var params = [ share.grantor.name, share.link.name ];
	this._headerEl.innerHTML = this._headerFormatter.format(params);;

	params = [
		ZmShare.getRoleName(share.link.perm),
		ZmAcceptShareDialog._ACTIONS[share.link.perm]   // TODO: Be able to generate custom perms list
	];
	this._detailsEl.innerHTML = this._detailsFormatter.format(params);;
	this._questionEl.innerHTML = "<b>" + ZmMsg.acceptShareQuestion + "</b>";

	params = [ share.grantor.name, share.link.name ];
	this._nameEl.value = this._defaultNameFormatter.format(params);;

	this._reply.setReplyType(ZmShareReply.NONE);
	this._reply.setReplyNote("");

	var orgType = ZmOrganizer.TYPE[share.link.view];
	if (orgType == ZmOrganizer.FOLDER) {
		this._color.getMenu().getItem(0).setEnabled(true);
		this._color.setSelectedValue(0);
	} else {
		this._color.getMenu().getItem(0).setEnabled(false);
		this._color.setSelectedValue(1);
	}

	DwtDialog.prototype.popup.call(this);
};

ZmAcceptShareDialog.prototype.setAcceptListener =
function(listener) {
	this.removeAllListeners(ZmAcceptShareDialog.ACCEPT);
	if (listener)
		this.addListener(ZmAcceptShareDialog.ACCEPT, listener);
};

// Protected methods

ZmAcceptShareDialog.prototype._handleYesButton =
function(event) {
	var replyType = this._reply.getReplyType();
	var notes = (replyType == ZmShareReply.QUICK) ? this._reply.getReplyNote(): "";
	var callback = new AjxCallback(this, this._yesButtonCallback, [event]);
	this._share.accept(this._nameEl.value, this._color.getValue(), replyType, notes, callback);
};

ZmAcceptShareDialog.prototype._yesButtonCallback =
function(event) {
	// notify accept listener and clear
	this.notifyListeners(ZmAcceptShareDialog.ACCEPT, event);
	this.setAcceptListener(null);

	this.popdown();
};

ZmAcceptShareDialog.prototype._handleNoButton =
function(event) {
	this.popdown();
};

ZmAcceptShareDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};

ZmAcceptShareDialog.prototype._createView =
function() {
	var view = new DwtComposite(this);
	
	var doc = document;
	this._headerEl = doc.createElement("DIV");
	this._headerEl.style.marginBottom = "0.5em";
	this._detailsEl = doc.createElement("DIV");
	this._detailsEl.style.marginBottom = "1em";
	this._questionEl = doc.createElement("DIV");
	this._questionEl.style.marginBottom = "0.5em";
	this._nameEl = doc.createElement("INPUT");
	this._nameEl.style.width = "20em";
	var nameElement = this._nameEl;
	if (Dwt.CARET_HACK_ENABLED) {
		nameElement = doc.createElement("DIV");
		nameElement.style.overflow = "auto";
		nameElement.appendChild(this._nameEl);
	}

	this._color = new DwtSelect({parent:view});
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var color = ZmOrganizer.COLOR_CHOICES[i];
		this._color.addOption(color.label, false, color.value);
	}

	var props = this._propSheet = new DwtPropertySheet(view);
	var propsEl = props.getHtmlElement();
	propsEl.style.marginBottom = "0.5em";
	props.addProperty(ZmMsg.nameLabel, nameElement);
	props.addProperty(ZmMsg.colorLabel, this._color);
	
	this._reply = new ZmShareReply(view);

	var settings = doc.createElement("DIV");
	settings.style.marginLeft = "1.5em";
	settings.appendChild(propsEl);
	settings.appendChild(this._reply.getHtmlElement());	
	
	var element = view.getHtmlElement();
	element.appendChild(this._headerEl);
	element.appendChild(this._detailsEl);
	element.appendChild(this._questionEl);
	element.appendChild(settings);
	return view;
};
