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

/**
 * This class implements a share reply query box and additional input 
 * controls to allow the user to specify the reply type and quick reply 
 * note, if wanted. This control can be used from within the various
 * share dialogs to add reply capabilities.
 */
ZmShareReply = function(parent, className) {
	className = className || "ZmShareReply";
	DwtComposite.call(this, parent, className);
	this._initControl();
};

ZmShareReply.prototype = new DwtComposite;
ZmShareReply.prototype.constructor = ZmShareReply;

// Constants

ZmShareReply.NONE		= 0;
ZmShareReply.STANDARD	= 1;
ZmShareReply.QUICK		= 2;
ZmShareReply.COMPOSE	= 3;

ZmShareReply.DEFAULT_OPTIONS = [
	ZmShareReply.NONE, ZmShareReply.STANDARD, ZmShareReply.QUICK, ZmShareReply.COMPOSE
];

ZmShareReply._LABELS = {};
ZmShareReply._LABELS[ZmShareReply.NONE]		= ZmMsg.sendNoMailAboutShare;
ZmShareReply._LABELS[ZmShareReply.STANDARD] = ZmMsg.sendStandardMailAboutShare;
ZmShareReply._LABELS[ZmShareReply.QUICK]	= ZmMsg.sendStandardMailAboutSharePlusNote;
ZmShareReply._LABELS[ZmShareReply.COMPOSE]	= ZmMsg.sendComposedMailAboutShare;

// Public methods

ZmShareReply.prototype.setReplyType =
function(type) {
	this._replyType.setSelectedValue(type);
	Dwt.setVisible(this._replyStandardMailNoteEl, type == ZmShareReply.STANDARD || type == ZmShareReply.QUICK);
	Dwt.setVisible(this._replyNoteEl, type == ZmShareReply.QUICK);
};

ZmShareReply.prototype.getReplyType =
function() {
	return this._replyType.getValue();
};

ZmShareReply.prototype.setReplyNote =
function(note) {
	this._replyNoteEl.value = note;
};

ZmShareReply.prototype.getReplyNote =
function() {
	return this._replyNoteEl.value;
};

ZmShareReply.prototype.setReplyOptions =
function(options) {
	if (this._replyOptions == options) return;

	this._replyOptions = options;
	this._replyType.clearOptions();

	for (var i = 0; i < options.length; i++) {
		var value = options[i];
		this._replyType.addOption(ZmShareReply._LABELS[value], false, value);
	}
};

ZmShareReply.prototype.getReplyOptions =
function() {
	return this._replyOptions;
};

// Protected methods

ZmShareReply.prototype._handleReplyType =
function(event) {
	var type = this._replyType.getValue();
	this.setReplyType(type);
};

ZmShareReply.prototype._initControl =
function() {
	this._replyType = new DwtSelect({parent:this});
	this.setReplyOptions(ZmShareReply.DEFAULT_OPTIONS);
	this._replyType.addChangeListener(new AjxListener(this, this._handleReplyType));
	
	var doc = document;
	this._replyTypeEl = doc.createElement("DIV");
	this._replyTypeEl.style.paddingBottom = "0.125em";
	this._replyTypeEl.appendChild(this._replyType.getHtmlElement());
	
	this._replyStandardMailNoteEl = doc.createElement("DIV");
	this._replyStandardMailNoteEl.style.paddingBottom = "0.125em";
	this._replyStandardMailNoteEl.style.width = "30em";
	this._replyStandardMailNoteEl.innerHTML = ZmMsg.sendMailAboutShareNote;
	
	var div = doc.createElement("DIV");
	if (Dwt.CARET_HACK_ENABLED) {
		div.style.overflowY="auto";
	}
	this._replyNoteEl = doc.createElement("TEXTAREA");
	this._replyNoteEl.cols = 50;
	this._replyNoteEl.rows = 4;
	div.appendChild(this._replyNoteEl);
	
	this._replyControlsEl = doc.createElement("DIV");
	this._replyControlsEl.style.marginLeft = "1.5em";
	this._replyControlsEl.appendChild(this._replyTypeEl);
	this._replyControlsEl.appendChild(this._replyStandardMailNoteEl);
	this._replyControlsEl.appendChild(div);

	// append controls
	var element = this.getHtmlElement();
	element.appendChild(this._replyControlsEl);
};