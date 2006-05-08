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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class implements a share reply query box and additional input 
 * controls to allow the user to specify the reply type and quick reply 
 * note, if wanted. This control can be used from within the various
 * share dialogs to add reply capabilities.
 */
function ZmShareReply(parent, className) {
	className = className || "ZmShareReply";
	DwtComposite.call(this, parent, className);
	this._initControl();
};

ZmShareReply.prototype = new DwtComposite;
ZmShareReply.prototype.constructor = ZmShareReply;

// Constants

ZmShareReply.STANDARD = "standard";
ZmShareReply.QUICK = "quick";
ZmShareReply.COMPOSE = "compose";

// Data

ZmShareReply.prototype._replyEl;
ZmShareReply.prototype._replyCheckboxEl;
ZmShareReply.prototype._replyControlsEl;
ZmShareReply.prototype._replyType;
ZmShareReply.prototype._replyTypeEl;
ZmShareReply.prototype._replyStandardMailNoteEl;
ZmShareReply.prototype._replyNoteEl;

// Public methods

ZmShareReply.prototype.setReply = function(reply) {
	this._replyCheckboxEl.checked = reply;
	Dwt.setVisible(this._replyControlsEl, reply);
};

ZmShareReply.prototype.getReply = function() {
	return this._replyCheckboxEl.checked;
};

ZmShareReply.prototype.setReplyRequired = function(required) {
	Dwt.setVisible(this._replyEl, required ? false : true);
};

ZmShareReply.prototype.getReplyRequired = function() {
	return Dwt.getVisible(this._replyEl);
};

ZmShareReply.prototype.setReplyType = function(type) {
	this._replyType.setSelectedValue(type);
	Dwt.setVisible(this._replyStandardMailNoteEl, type == ZmShareReply.STANDARD || type == ZmShareReply.QUICK);
	Dwt.setVisible(this._replyNoteEl, type == ZmShareReply.QUICK);
};

ZmShareReply.prototype.getReplyType = function() {
	return this._replyType.getValue();
};

ZmShareReply.prototype.setReplyNote = function(note) {
	this._replyNoteEl.value = note;
};

ZmShareReply.prototype.getReplyNote = function() {
	return this._replyNoteEl.value;
};

// Protected methods

ZmShareReply.prototype._handleReplyType = function(event) {
	var type = this._replyType.getValue();
	this.setReplyType(type);
};

ZmShareReply.prototype._handleCheckbox = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	target._control.setReply(target.checked);
};

ZmShareReply.prototype._initControl = function() {
	// create controls
	this._replyCheckboxEl = document.createElement("INPUT");
	this._replyCheckboxEl.type = "checkbox";
	this._replyCheckboxEl.checked = true;
	
	this._replyEl = document.createElement("DIV");
	this._replyEl.style.paddingBottom = "0.25em";
	this._replyEl.innerHTML = ZmMsg.sendMailAboutShare;
	this._replyEl.insertBefore(this._replyCheckboxEl, this._replyEl.firstChild);
	
	this._replyType = new DwtSelect(this);
	this._replyType.addOption(ZmMsg.sendStandardMailAboutShare, false, ZmShareReply.STANDARD);
	this._replyType.addOption(ZmMsg.sendStandardMailAboutSharePlusNote, false, ZmShareReply.QUICK);
	this._replyType.addOption(ZmMsg.sendComposedMailAboutShare, false, ZmShareReply.COMPOSE);
	this._replyType.addChangeListener(new AjxListener(this, this._handleReplyType));
	
	this._replyTypeEl = document.createElement("DIV");
	this._replyTypeEl.style.paddingBottom = "0.125em";
	this._replyTypeEl.appendChild(this._replyType.getHtmlElement());
	
	this._replyStandardMailNoteEl = document.createElement("DIV");
	this._replyStandardMailNoteEl.style.paddingBottom = "0.125em";
	this._replyStandardMailNoteEl.style.width = "25em";
	this._replyStandardMailNoteEl.innerHTML = ZmMsg.sendMailAboutShareNote;
	
	this._replyNoteEl = document.createElement("TEXTAREA");
	this._replyNoteEl.cols = 50;
	this._replyNoteEl.rows = 4;
	
	this._replyControlsEl = document.createElement("DIV");
	this._replyControlsEl.style.marginLeft = "1.5em";
	this._replyControlsEl.appendChild(this._replyTypeEl);
	this._replyControlsEl.appendChild(this._replyStandardMailNoteEl);
	this._replyControlsEl.appendChild(this._replyNoteEl);

	this._replyCheckboxEl._control = this;
	Dwt.setHandler(this._replyCheckboxEl, DwtEvent.ONCLICK, this._handleCheckbox);
	
	// append controls
	var element = this.getHtmlElement();
	element.appendChild(this._replyEl);
	element.appendChild(this._replyControlsEl);
};