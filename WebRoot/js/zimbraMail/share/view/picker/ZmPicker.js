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

ZmPicker = function(parent, id) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, {parent:parent, className:"ZmPicker", posStyle:DwtControl.ABSOLUTE_STYLE});

	this._header = new DwtToolBar({parent:this});
	this._header.addFiller();

	this._label = new DwtLabel(this._header, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "ZmPickerLabel");

	this._close = new DwtButton({parent:this._header, style:DwtLabel.IMAGE_LEFT, className:"DwtToolbarButton"});
	this._close.setImage("Close");
	this._close.setToolTipContent(ZmMsg.close);

	this._picker = new DwtComposite(this, "ZmPickerOverview");
	this._picker.setSize(Dwt.DEFAULT, parent.getH() - this._header.getH());
	this._picker.setScrollStyle(Dwt.CLIP);
	this._pickerEvent = new ZmEvent(ZmEvent.S_PICKER);
	this._pickerEvent.set(ZmEvent.E_MODIFY, this);

	this.id = id;
    this.setTitle(ZmMsg[ZmPicker.T_MSG_KEY[id]]);
    this.setImage(ZmPicker.IMAGE[id]);
	this._setupPicker(this._picker);
};

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
ZmPicker.ZIMLET		= i++;
ZmPicker.SEARCH		= i++;
ZmPicker.SIZE		= i++;
ZmPicker.TAG		= i++;
ZmPicker.TIME		= i++;
ZmPicker.RESET		= i++;	// not really a picker
ZmPicker.CLOSE		= i++;	// not really a picker

ZmPicker.NEXT_ID	= i;

ZmPicker.DEFAULT_PICKERS = [
	ZmPicker.ATTACHMENT,
	ZmPicker.BASIC,
	ZmPicker.DATE,
	ZmPicker.DOMAIN,
	ZmPicker.FOLDER
];

// Button labels
ZmPicker.MSG_KEY = {};
ZmPicker.MSG_KEY[ZmPicker.ATTACHMENT]		= "attachment";
ZmPicker.MSG_KEY[ZmPicker.BASIC]			= "basic";
ZmPicker.MSG_KEY[ZmPicker.CUSTOM]			= "custom";
ZmPicker.MSG_KEY[ZmPicker.DATE]				= "date";
ZmPicker.MSG_KEY[ZmPicker.DOMAIN]			= "domain";
ZmPicker.MSG_KEY[ZmPicker.FLAG]				= "status";
ZmPicker.MSG_KEY[ZmPicker.FOLDER]			= "folder";
ZmPicker.MSG_KEY[ZmPicker.ZIMLET]			= "zimlets";
ZmPicker.MSG_KEY[ZmPicker.SEARCH]			= "savedSearch";
ZmPicker.MSG_KEY[ZmPicker.SIZE]				= "size";
ZmPicker.MSG_KEY[ZmPicker.TAG]				= "tag";
ZmPicker.MSG_KEY[ZmPicker.TIME]				= "time";
ZmPicker.MSG_KEY[ZmPicker.RESET]			= "removeAll";
ZmPicker.MSG_KEY[ZmPicker.CLOSE]			= "close";

// Button and picker icons
ZmPicker.IMAGE = {};
ZmPicker.IMAGE[ZmPicker.ATTACHMENT]			= "Attachment";
ZmPicker.IMAGE[ZmPicker.BASIC]				= "Message";
ZmPicker.IMAGE[ZmPicker.CUSTOM]				= "Search";
ZmPicker.IMAGE[ZmPicker.DATE]				= "Date";
ZmPicker.IMAGE[ZmPicker.DOMAIN]				= "URL";
ZmPicker.IMAGE[ZmPicker.FLAG]				= "FlagRed";
ZmPicker.IMAGE[ZmPicker.FOLDER]				= "Folder";
ZmPicker.IMAGE[ZmPicker.ZIMLET]				= "ZimbraIcon";
ZmPicker.IMAGE[ZmPicker.SEARCH]				= "SearchFolder";
ZmPicker.IMAGE[ZmPicker.SIZE]				= "Folder";
ZmPicker.IMAGE[ZmPicker.TAG]				= "Tag";
ZmPicker.IMAGE[ZmPicker.TIME]				= "Date";
//ZmPicker.IMAGE[ZmPicker.RESET]			= "Close";	//MOW: no image for reset button
ZmPicker.IMAGE[ZmPicker.CLOSE]				= "Close";

// Button tooltips
ZmPicker.TT_MSG_KEY = {};
ZmPicker.TT_MSG_KEY[ZmPicker.ATTACHMENT]	= "searchByAttachment";
ZmPicker.TT_MSG_KEY[ZmPicker.BASIC]			= "searchByBasic";
ZmPicker.TT_MSG_KEY[ZmPicker.CUSTOM]		= "searchByCustom";
ZmPicker.TT_MSG_KEY[ZmPicker.DATE]			= "searchByDate";
ZmPicker.TT_MSG_KEY[ZmPicker.DOMAIN]		= "searchByDomain";
ZmPicker.TT_MSG_KEY[ZmPicker.FLAG]			= "searchByFlag";
ZmPicker.TT_MSG_KEY[ZmPicker.FOLDER]		= "searchByFolder";
ZmPicker.TT_MSG_KEY[ZmPicker.ZIMLET]		= "searchByZimlet";
ZmPicker.TT_MSG_KEY[ZmPicker.SEARCH]		= "searchBySavedSearch";
ZmPicker.TT_MSG_KEY[ZmPicker.SIZE]			= "searchBySize";
ZmPicker.TT_MSG_KEY[ZmPicker.TAG]			= "searchByTag";
ZmPicker.TT_MSG_KEY[ZmPicker.TIME]			= "searchByTime";
ZmPicker.TT_MSG_KEY[ZmPicker.RESET]			= "clearAdvSearch";
ZmPicker.TT_MSG_KEY[ZmPicker.CLOSE]			= "closeSearchBuilder";

// Picker titles
ZmPicker.T_MSG_KEY = {};
ZmPicker.T_MSG_KEY[ZmPicker.ATTACHMENT]		= "attachments";
ZmPicker.T_MSG_KEY[ZmPicker.BASIC]			= "basicSearch";
ZmPicker.T_MSG_KEY[ZmPicker.CUSTOM]			= "custom";
ZmPicker.T_MSG_KEY[ZmPicker.DATE]			= "date";
ZmPicker.T_MSG_KEY[ZmPicker.DOMAIN]			= "domains";
ZmPicker.T_MSG_KEY[ZmPicker.FLAG]			= "status";
ZmPicker.T_MSG_KEY[ZmPicker.FOLDER]			= "folders";
ZmPicker.T_MSG_KEY[ZmPicker.ZIMLET]			= "zimlets";
ZmPicker.T_MSG_KEY[ZmPicker.SEARCH]			= "savedSearches";
ZmPicker.T_MSG_KEY[ZmPicker.SIZE]			= "size";
ZmPicker.T_MSG_KEY[ZmPicker.TAG]			= "tags";
ZmPicker.T_MSG_KEY[ZmPicker.TIME]			= "time";

// Max number of instances for each picker
// -1 means no limit
ZmPicker.LIMIT = {};
ZmPicker.LIMIT[ZmPicker.ATTACHMENT]			= 1;
ZmPicker.LIMIT[ZmPicker.BASIC]				= -1;
ZmPicker.LIMIT[ZmPicker.CUSTOM]				= 1;
ZmPicker.LIMIT[ZmPicker.DATE]				= 2;
ZmPicker.LIMIT[ZmPicker.DOMAIN]				= 2;
ZmPicker.LIMIT[ZmPicker.FLAG]				= 4;
ZmPicker.LIMIT[ZmPicker.FOLDER]				= 1;
ZmPicker.LIMIT[ZmPicker.ZIMLET]				= -1;
ZmPicker.LIMIT[ZmPicker.SEARCH]				= -1;
ZmPicker.LIMIT[ZmPicker.SIZE]				= 2;
ZmPicker.LIMIT[ZmPicker.TAG]				= -1;
ZmPicker.LIMIT[ZmPicker.TIME]				= 1;

ZmPicker.MULTI_JOIN = {};
for (var i = 1; i <= ZmPicker.CLOSE; i++) {
	ZmPicker.MULTI_JOIN[i] = " ";
}
ZmPicker.MULTI_JOIN[ZmPicker.BASIC] = " OR ";
ZmPicker.MULTI_JOIN[ZmPicker.FLAG] = " OR ";

ZmPicker.CTOR = new Object();

ZmPicker.DEFAULT_PICKER = ZmPicker.BASIC;

ZmPicker.KEY_ID = "_id_";
ZmPicker.KEY_CTOR = "_ctor_";
ZmPicker.KEY_PICKER = "_picker_";

ZmPicker_Descriptor = function(id, label, image, toolTip, ctor) {
	this.id = id;
	this.label = label || ZmMsg[ZmPicker.MSG_KEY[id]];
	this.image = image || ZmPicker.IMAGE[id];
	this.toolTip = toolTip || ZmMsg[ZmPicker.TT_MSG_KEY[id]] || this.label;
	this.ctor = ctor;
}

ZmPicker.prototype.toString = 
function() {
	return "ZmPicker";
};

ZmPicker.prototype._setupPicker  = function() {};
ZmPicker.prototype._updateQuery  = function() {};
ZmPicker.prototype._treeListener  = function() {};

ZmPicker.prototype.setTitle =
function(text) {
    this._label.setText(text);
};

ZmPicker.prototype.setImage =
function(imageInfo) {
    this._label.setImage(imageInfo);
};

ZmPicker.prototype.getCloseButton = 
function() {
	return this._close;
};

ZmPicker.prototype.setEnabled =
function(enabled) {
   DwtControl.prototype.setEnabled.call(this, enabled);
    this._label.setEnabled(enabled);
    if (this._picker.setEnabled)
	    this._picker.setEnabled(enabled);
};

ZmPicker.prototype.addPickerListener =
function(listener) {
	this.addListener(ZmEvent.L_PICKER, listener);
};

ZmPicker.prototype.removePickerListener =
function(listener) {
	this.removeListener(ZmEvent.L_PICKER, listener);
};

ZmPicker.prototype.execute =
function() {
	if (this.isListenerRegistered(ZmEvent.L_PICKER)) {
		this._pickerEvent.set(ZmEvent.E_LOAD, this);
		this.notifyListeners(ZmEvent.L_PICKER, this._pickerEvent);
	}
};

ZmPicker.prototype.setQuery =
function(query) {
	this._query = query;
	if (this.isListenerRegistered(ZmEvent.L_PICKER)) {
		this._pickerEvent.set(ZmEvent.E_MODIFY, this);
		this.notifyListeners(ZmEvent.L_PICKER, this._pickerEvent);
	}
};

ZmPicker.prototype.dispose =
function() {
	DwtComposite.prototype.dispose.call(this);
	if (this._treeView) {
		var opc = appCtxt.getOverviewController();
		this._overview.clear();
	}
};

ZmPicker.prototype._setOverview =
function(overviewId, parent, types) {
	var params = {
		overviewId: overviewId,
		parent: parent,
		headerClass: "DwtTreeItem",
		treeStyle: DwtTree.CHECKEDITEM_STYLE
	};
	var overview = this._overview = appCtxt.getOverviewController().createOverview(params);
	overview.set(types);
	this._treeView = {};
	for (var i = 0; i < types.length; i++) {
		var treeView = this._treeView[types[i]] = overview.getTreeView(types[i]);
		treeView.addSelectionListener(new AjxListener(this, this._treeListener));
	}
	if (types.length == 1) {
		this._hideRoot(types[0]);
	}
};

ZmPicker.prototype._hideRoot =
function(type) {
	var ti = this._treeView[type].getTreeItemById(ZmOrganizer.ID_ROOT);
	if (!ti) {
		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT)
		ti = this._treeView[type].getTreeItemById(rootId);
	}
	Dwt.setVisible(ti._checkBoxCell, false);
	ti.setExpanded(true);
	ti.setVisible(false, true);
};
