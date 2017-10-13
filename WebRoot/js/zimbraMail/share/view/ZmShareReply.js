/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a share reply widget.
 * @class
 * This class implements a share reply query box and additional input 
 * controls to allow the user to specify the reply type and quick reply 
 * note, if wanted. This control can be used from within the various
 * share dialogs to add reply capabilities.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}		className	the class name
 * @param	{Array}	options			an array of options
 * @extends		DwtComposite
 */
ZmShareReply = function(params) {

	params = Dwt.getParams(arguments, ZmShareReply.PARAMS);

	params.className = params.className || "ZmShareReply";
	params.id = "ZmShareReply";
	DwtComposite.call(this, params);
	this._tabGroup = new DwtTabGroup(this.toString());
	this._initControl(params);
};

ZmShareReply.PARAMS = [ 'parent', 'className', 'options' ];

ZmShareReply.prototype = new DwtComposite;
ZmShareReply.prototype.constructor = ZmShareReply;
//ZmShareReply.prototype.isFocusable = true;

// Constants
/**
 * Defines the "none" reply type.
 */
ZmShareReply.NONE		= 0;
/**
 * Defines the "standard" reply type.
 */
ZmShareReply.STANDARD	= 1;
/**
 * Defines the "quick" reply type.
 */
ZmShareReply.QUICK		= 2;

ZmShareReply.DEFAULT_OPTIONS = [
	ZmShareReply.NONE, ZmShareReply.STANDARD, ZmShareReply.QUICK
];

ZmShareReply.EXTERNAL_USER_OPTIONS = [
	ZmShareReply.STANDARD, ZmShareReply.QUICK
];

ZmShareReply._LABELS = {};
ZmShareReply._LABELS[ZmShareReply.NONE]		= ZmMsg.sendNoMailAboutShare;
ZmShareReply._LABELS[ZmShareReply.STANDARD] = ZmMsg.sendStandardMailAboutShare;
ZmShareReply._LABELS[ZmShareReply.QUICK]	= ZmMsg.sendStandardMailAboutSharePlusNote;

ZmShareReply.ELEMENT_SPACING = "16px";

// Public methods

/**
 * Sets the reply type.
 * 
 * @param	{constant}	type		the type
 */
ZmShareReply.prototype.setReplyType =
function(type) {
	this._replyType.setSelectedValue(type);
	Dwt.setVisible(this._replyStandardMailNoteEl, type == ZmShareReply.STANDARD || type == ZmShareReply.QUICK);
	Dwt.setVisible(this._replyNoteEl, type == ZmShareReply.QUICK);
};

/**
 * Gets the reply type.
 * 
 * @return	{constant}		the reply type
 */
ZmShareReply.prototype.getReplyType =
function() {
	return this._replyType.getValue();
};

/**
 * Sets the reply note.
 * 
 * @param	{String}	note		the note
 */
ZmShareReply.prototype.setReplyNote =
function(note) {
	this._replyNoteEl.value = note;
};

/**
 * Gets the reply note.
 * 
 * @return	{String}		the reply note
 */
ZmShareReply.prototype.getReplyNote =
function() {
	return this._replyNoteEl.value;
};

/**
 * Sets the reply options.
 * 
 * @param	{Array}	options		an array of options
 */
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

/**
 * Gets the reply options.
 * 
 * @return	{Array}	an array of options
 */
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

ZmShareReply.prototype._initControl = function(params) {

	this._replyType = new DwtSelect({
		parent:   this,
		id:       "ZmShareReplySelect",
		legendId: params.legendId,
		className: "ZSelect ZSelectFullWidth"
	});
    var options = params.options || ZmShareReply.DEFAULT_OPTIONS;
    this.setReplyOptions(options);
	this._replyType.addChangeListener(this._handleReplyType.bind(this));

	var doc = document;
	this._replyTypeEl = doc.createElement("DIV");
	this._replyTypeEl.appendChild(this._replyType.getHtmlElement());
	
	this._replyStandardMailNoteEl = doc.createElement("DIV");
	this._makeFocusable(this._replyStandardMailNoteEl);
	this._replyStandardMailNoteEl.innerHTML = ZmMsg.sendMailAboutShareNote;
	this._replyStandardMailNoteEl.style.marginTop = ZmShareReply.ELEMENT_SPACING;
	
	var div = doc.createElement("DIV");
	this._replyNoteEl = doc.createElement("TEXTAREA");
	this._replyNoteEl.cols = 50;
	this._replyNoteEl.rows = 4;
	this._replyNoteEl.style.marginTop = ZmShareReply.ELEMENT_SPACING;
	div.appendChild(this._replyNoteEl);
	
	this._replyControlsEl = doc.createElement("DIV");
	this._replyControlsEl.style.marginTop = ZmShareReply.ELEMENT_SPACING;
	this._replyControlsEl.appendChild(this._replyTypeEl);
	this._replyControlsEl.appendChild(this._replyStandardMailNoteEl);
	this._replyControlsEl.appendChild(div);

	// append controls
	var element = this.getHtmlElement();
	element.appendChild(this._replyControlsEl);
	this._tabGroup.addMember(this._replyType);
	this._tabGroup.addMember(this._replyStandardMailNoteEl);
	this._tabGroup.addMember(this._replyNoteEl);
};

ZmShareReply.prototype.getTabGroupMember = function(){
	return this._tabGroup;
};
