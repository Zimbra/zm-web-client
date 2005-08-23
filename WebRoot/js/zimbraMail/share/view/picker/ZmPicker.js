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

function ZmPicker(parent, id) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "ZmPicker", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._header = new DwtToolBar(this);
	this._label = new DwtLabel(this._header, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmPickerLabel");
	this._header.addFiller();
	this._close = new DwtButton(this._header, DwtLabel.IMAGE_LEFT, "TBButton");
	this._close.setImage(ZmImg.I_RED_X);
	this._close.setToolTipContent(ZmMsg.close);
	this._picker = new DwtComposite(this, "ZmPickerOverview");
	this._picker.setSize(Dwt.DEFAULT, parent.getH() - this._header.getH());
	this._picker.setScrollStyle(DwtControl.SCROLL);
	this._pickerEvent = new ZmEvent(ZmEvent.S_PICKER);
	this._pickerEvent.set(ZmEvent.E_MODIFY, this);
	this._setupPicker(this._picker);
	this.id = id;
    this.setTitle(ZmMsg[ZmPicker.T_MSG_KEY[id]]);
    this.setImage(ZmPicker.IMAGE[id]);
}

ZmPicker.prototype = new DwtComposite;
ZmPicker.prototype.constructor = ZmPicker;

var i = 1;
ZmPicker.ATTACHMENT	= i++;
ZmPicker.BASIC		= i++;
ZmPicker.CUSTOM		= i++;
ZmPicker.DATE		= i++;
ZmPicker.DOMAIN		= i++;
ZmPicker.FLAG		= i++;
ZmPicker.FOLDER		= i++;
ZmPicker.OBJECT		= i++;
ZmPicker.SEARCH		= i++;
ZmPicker.SIZE		= i++;
ZmPicker.TAG		= i++;
ZmPicker.TIME		= i++;
ZmPicker.RESET		= i++;	// not really a picker
ZmPicker.CLOSE		= i++;	// not really a picker

// Button labels
ZmPicker.MSG_KEY = new Object();
ZmPicker.MSG_KEY[ZmPicker.ATTACHMENT]	= "attachment";
ZmPicker.MSG_KEY[ZmPicker.BASIC]		= "basic";
ZmPicker.MSG_KEY[ZmPicker.CUSTOM]		= "custom";
ZmPicker.MSG_KEY[ZmPicker.DATE]			= "date";
ZmPicker.MSG_KEY[ZmPicker.DOMAIN]		= "domain";
ZmPicker.MSG_KEY[ZmPicker.FLAG]			= "status";
ZmPicker.MSG_KEY[ZmPicker.FOLDER]		= "folder";
ZmPicker.MSG_KEY[ZmPicker.OBJECT]		= "special";
ZmPicker.MSG_KEY[ZmPicker.SEARCH]		= "savedSearch";
ZmPicker.MSG_KEY[ZmPicker.SIZE]			= "size";
ZmPicker.MSG_KEY[ZmPicker.TAG]			= "tag";
ZmPicker.MSG_KEY[ZmPicker.TIME]			= "time";
ZmPicker.MSG_KEY[ZmPicker.RESET]		= "removeAll";
ZmPicker.MSG_KEY[ZmPicker.CLOSE]		= "close";

// Button and picker icons
ZmPicker.IMAGE = new Object();
ZmPicker.IMAGE[ZmPicker.ATTACHMENT]	= ZmImg.I_ATTACHMENT;
ZmPicker.IMAGE[ZmPicker.BASIC]		= ZmImg.I_SEARCH_FOLDER;
ZmPicker.IMAGE[ZmPicker.CUSTOM]		= ZmImg.I_SEARCH;
ZmPicker.IMAGE[ZmPicker.DATE]		= ZmImg.I_DATE;
ZmPicker.IMAGE[ZmPicker.DOMAIN]		= ZmImg.I_URL;
ZmPicker.IMAGE[ZmPicker.FLAG]		= ZmImg.I_FLAG_ON;
ZmPicker.IMAGE[ZmPicker.FOLDER]		= ZmImg.I_FOLDER;
ZmPicker.IMAGE[ZmPicker.OBJECT]		= ZmImg.I_SEARCH_FOLDER;
ZmPicker.IMAGE[ZmPicker.SEARCH]		= ZmImg.I_SEARCH_FOLDER;
ZmPicker.IMAGE[ZmPicker.SIZE]		= ZmImg.I_SEARCH_FOLDER;
ZmPicker.IMAGE[ZmPicker.TAG]		= ZmImg.I_TAG_FOLDER;
ZmPicker.IMAGE[ZmPicker.TIME]		= ZmImg.I_DATE;
//ZmPicker.IMAGE[ZmPicker.RESET]		= ZmImg.I_RED_X;	//MOW: no image for reset button
ZmPicker.IMAGE[ZmPicker.CLOSE]		= ZmImg.I_RED_X;

// Button tooltips
ZmPicker.TT_MSG_KEY = new Object();
ZmPicker.TT_MSG_KEY[ZmPicker.ATTACHMENT]	= "searchByAttachment";
ZmPicker.TT_MSG_KEY[ZmPicker.BASIC]			= "searchByBasic";
ZmPicker.TT_MSG_KEY[ZmPicker.CUSTOM]		= "searchByCustom";
ZmPicker.TT_MSG_KEY[ZmPicker.DATE]			= "searchByDate";
ZmPicker.TT_MSG_KEY[ZmPicker.DOMAIN]		= "searchByDomain";
ZmPicker.TT_MSG_KEY[ZmPicker.FLAG]			= "searchByFlag";
ZmPicker.TT_MSG_KEY[ZmPicker.FOLDER]		= "searchByFolder";
ZmPicker.TT_MSG_KEY[ZmPicker.OBJECT]		= "searchByObject";
ZmPicker.TT_MSG_KEY[ZmPicker.SEARCH]		= "searchBySavedSearch";
ZmPicker.TT_MSG_KEY[ZmPicker.SIZE]			= "searchBySize";
ZmPicker.TT_MSG_KEY[ZmPicker.TAG]			= "searchByTag";
ZmPicker.TT_MSG_KEY[ZmPicker.TIME]			= "searchByTime";
ZmPicker.TT_MSG_KEY[ZmPicker.RESET]			= "clearAdvSearch";
ZmPicker.TT_MSG_KEY[ZmPicker.CLOSE]			= "closeSearchBuilder";

// Picker titles
ZmPicker.T_MSG_KEY = new Object();
ZmPicker.T_MSG_KEY[ZmPicker.ATTACHMENT]	= "attachments";
ZmPicker.T_MSG_KEY[ZmPicker.BASIC]		= "basicSearch";
ZmPicker.T_MSG_KEY[ZmPicker.CUSTOM]		= "custom";
ZmPicker.T_MSG_KEY[ZmPicker.DATE]		= "date";
ZmPicker.T_MSG_KEY[ZmPicker.DOMAIN]		= "domains";
ZmPicker.T_MSG_KEY[ZmPicker.FLAG]		= "status";
ZmPicker.T_MSG_KEY[ZmPicker.FOLDER]		= "folders";
ZmPicker.T_MSG_KEY[ZmPicker.OBJECT]		= "special";
ZmPicker.T_MSG_KEY[ZmPicker.SEARCH]		= "savedSearches";
ZmPicker.T_MSG_KEY[ZmPicker.SIZE]		= "size";
ZmPicker.T_MSG_KEY[ZmPicker.TAG]		= "tags";
ZmPicker.T_MSG_KEY[ZmPicker.TIME]		= "time";

// Max number of instances for each picker
ZmPicker.LIMIT = new Object();
ZmPicker.LIMIT[ZmPicker.ATTACHMENT]	= 1;
ZmPicker.LIMIT[ZmPicker.BASIC]		= -1;	// no limit
ZmPicker.LIMIT[ZmPicker.CUSTOM]		= 1;
ZmPicker.LIMIT[ZmPicker.DATE]		= 2;
ZmPicker.LIMIT[ZmPicker.DOMAIN]		= 2;
ZmPicker.LIMIT[ZmPicker.FLAG]		= 4;
ZmPicker.LIMIT[ZmPicker.FOLDER]		= 1;
ZmPicker.LIMIT[ZmPicker.OBJECT]		= 3;
ZmPicker.LIMIT[ZmPicker.SEARCH]		= -1;
ZmPicker.LIMIT[ZmPicker.SIZE]		= 2;
ZmPicker.LIMIT[ZmPicker.TAG]		= -1;	// no limit
ZmPicker.LIMIT[ZmPicker.TIME]		= 1;

ZmPicker.MULTI_JOIN = new Object();
for (var i = 1; i <= ZmPicker.CLOSE; i++)
	ZmPicker.MULTI_JOIN[i] = " ";
ZmPicker.MULTI_JOIN[ZmPicker.BASIC] = " OR ";

ZmPicker.CTOR = new Object();

ZmPicker.DEFAULT_PICKER = ZmPicker.BASIC;

ZmPicker.KEY_ID = "_id_";
ZmPicker.KEY_CTOR = "_ctor_";
ZmPicker.KEY_PICKER = "_picker_";

function ZmPicker_Descriptor(id, label, image, toolTip, ctor) {
	this.id = id;
	this.label = label || ZmMsg[ZmPicker.MSG_KEY[id]];
	this.image = image || ZmPicker.IMAGE[id];
	this.toolTip = toolTip || ZmMsg[ZmPicker.TT_MSG_KEY[id]] || this.label;
	this.ctor = ctor;
}

ZmPicker.prototype.toString = 
function() {
	return "ZmPicker";
}

ZmPicker.prototype._setupPicker  = function() {}
ZmPicker.prototype._updateQuery  = function() {}

ZmPicker.prototype.setTitle =
function(text) {
    this._label.setText(text);
}

ZmPicker.prototype.setImage =
function(imageInfo) {
    this._label.setImage(imageInfo);
}

ZmPicker.prototype.getCloseButton = 
function() {
	return this._close;
}

ZmPicker.prototype.setEnabled =
function(enabled) {
   DwtControl.prototype.setEnabled(this, enabled);
    this._label.setEnabled(enabled);
    if (this._picker.setEnabled)
	    this._picker.setEnabled(enabled);
}

ZmPicker.prototype.addPickerListener =
function(listener) {
	this.addListener(ZmEvent.L_PICKER, listener);
}

ZmPicker.prototype.removePickerListener =
function(listener) {
	this.removeListener(ZmEvent.L_PICKER, listener);
}

ZmPicker.prototype.execute =
function() {
	if (this.isListenerRegistered(ZmEvent.L_PICKER)) {
		this._pickerEvent.set(ZmEvent.E_LOAD, this);
		this.notifyListeners(ZmEvent.L_PICKER, this._pickerEvent);
	}
}

ZmPicker.prototype.setQuery =
function(query) {
	this._query = query;
	if (this.isListenerRegistered(ZmEvent.L_PICKER)) {
		this._pickerEvent.set(ZmEvent.E_MODIFY, this);
		this.notifyListeners(ZmEvent.L_PICKER, this._pickerEvent);
	}
}
