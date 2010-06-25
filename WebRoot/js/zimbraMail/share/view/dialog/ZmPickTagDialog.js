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
 * Creates a dialog for choosing a tag.
 * @class
 * This class presents the user with their list of tags in a tree view so that they
 * can choose one. There is a text input that can be used to filter the list.
 *
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends	ZmDialog
 */
ZmPickTagDialog = function(parent, className) {

	var newButton = new DwtDialog_ButtonDescriptor(ZmPickTagDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	var params = {parent:parent, className:className, title:ZmMsg.pickATag, extraButtons:[newButton]};
	ZmDialog.call(this, params);

	this._createControls();
	this._setNameField(this._inputDivId);
	this._tagTreeChangeListener = new AjxListener(this, this._handleTagTreeChange);
	appCtxt.getTagTree().addChangeListener(this._tagTreeChangeListener);
	this.registerCallback(ZmPickTagDialog.NEW_BUTTON, this._showNewDialog, this);
	this._creatingTag = false;
	this._treeViewListener = new AjxListener(this, this._treeViewSelectionListener);
	this._lastVal = "";
};

ZmPickTagDialog.prototype = new ZmDialog;
ZmPickTagDialog.prototype.constructor = ZmPickTagDialog;

ZmPickTagDialog.NEW_BUTTON = DwtDialog.LAST_BUTTON + 1;

ZmPickTagDialog.prototype.toString = 
function() {
	return "ZmPickTagDialog";
};

/**
 * Pops-up the dialog.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param	{ZmAccount}	params.account		the account
 */
ZmPickTagDialog.prototype.popup = 
function(params) {

	params = params || {};
	this._account = params.account;

	if (appCtxt.multiAccounts && params.account) {
		appCtxt.getTagTree().removeChangeListener(this._tagTreeChangeListener);
		appCtxt.getTagTree(params.account).addChangeListener(this._tagTreeChangeListener);
	}

	// all this is done here instead of in the constructor due to multi-account issues
	var overviewId = (appCtxt.multiAccounts && params.account)
		? ([this.toString(), "-", params.account.name].join("")) : this.toString();

	var ovParams = {
		overviewId:			overviewId,
		treeIds:			[ZmOrganizer.TAG],
		fieldId:			this._tagTreeDivId,
		account:			params.account
	};
	this._setOverview(ovParams, true);
	this._tagTreeView = this._getOverview().getTreeView(ZmOrganizer.TAG);
	this._tagTreeView.removeSelectionListener(this._treeViewListener);
	this._tagTreeView.addSelectionListener(this._treeViewListener);
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	var root = this._tagTreeView.getTreeItemById(rootId);
	if (root) {
		root.enableSelection(false);
	}

	this._loadTags();	// item list for this account's tree view will be cached after the first time
	this._resetTreeView();
	this._focusElement = this._inputField;
	this._inputField.setValue("");
	var tags = appCtxt.getTagTree(this._account).asList();
	if (tags.length == 1) {
		this._tagTreeView.setSelected(tags[0], true, true);
	}
	ZmDialog.prototype.popup.apply(this, arguments);
};

ZmPickTagDialog.prototype._contentHtml = 
function() {
	this._tagTreeDivId = this._htmlElId + "_tagTreeDivId";
	this._inputDivId = this._htmlElId + "_inputDivId";

	return AjxTemplate.expand("share.Widgets#ZmPickTagDialog", {id:this._htmlElId});
};

ZmPickTagDialog.prototype._createControls =
function() {
	this._inputField = new DwtInputField({parent: this});
	document.getElementById(this._inputDivId).appendChild(this._inputField.getHtmlElement());
	this._inputField.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleKeyUp));
};

ZmPickTagDialog.prototype._showNewDialog = 
function() {
	var dialog = appCtxt.getNewTagDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	dialog.popup(null, this._account);
};

ZmPickTagDialog.prototype._newCallback = 
function(parent, name) {
	appCtxt.getNewTagDialog().popdown();
	var ttc = this._opc.getTreeController(ZmOrganizer.TAG);
	ttc._doCreate(parent, name);
	this._creatingTag = true;
};

ZmPickTagDialog.prototype._loadTags =
function() {
	this._tags = [];
	var items = this._tagTreeView.getTreeItemList();
	for (var i = 0, len = items.length; i < len; i++) {
		var tag = items[i].getData(Dwt.KEY_OBJECT);
		if (tag.id != ZmOrganizer.ID_ROOT) {
			this._tags.push({id:tag.id, name:tag.getName(false, null, true, true).toLowerCase()});
		}
	}
};

ZmPickTagDialog.prototype._handleTagTreeChange =
function(ev) {
	// TODO - listener for changing tags
	if (ev.event == ZmEvent.E_CREATE && this._creatingTag) {
		var tag = ev.getDetail("organizers")[0];
		this._tagTreeView.setSelected(tag, true);
		this._creatingTag = false;
	}
	this._loadTags();
};

ZmPickTagDialog.prototype._okButtonListener = 
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev, [this._tagTreeView.getSelected()]);
};

ZmPickTagDialog.prototype._handleKeyUp =
function(ev) {

	var key = DwtKeyEvent.getCharCode(ev);
	if (key == 9) {
		return;
	} else if (key == 40) {
		this._overview[this._curOverviewId].focus();
		return;
	}
	
	var num = 0, firstMatch;
	var value = this._inputField.getValue().toLowerCase();
	if (value == this._lastVal) { return; }
	for (var i = 0, len = this._tags.length; i < len; i++) {
		var tagInfo = this._tags[i];
		var ti = this._tagTreeView.getTreeItemById(tagInfo.id);
		if (ti) {
			var matches = (tagInfo.name.indexOf(value) == 0);
			ti.setVisible(matches);
			if (matches && !firstMatch) {
				firstMatch = tagInfo.id;
			}
		}
	}

	if (firstMatch) {
		this._tagTreeView.setSelected(appCtxt.getById(firstMatch), true, true);
	}
	this._lastVal = value;
};

ZmPickTagDialog.prototype._resetTreeView =
function() {
	// make all tree items visible (in case there was prior filtering)
	for (var i = 0, len = this._tags.length; i < len; i++) {
		var ti = this._tagTreeView.getTreeItemById(this._tags[i].id);
		if (ti) {
			ti.setVisible(true);
		}
	}

	this._tagTreeView.getHeaderItem().setExpanded(true, false, true);
};

ZmPickTagDialog.prototype._treeViewSelectionListener =
function(ev) {

	if (ev.detail != DwtTree.ITEM_SELECTED && ev.detail != DwtTree.ITEM_DBL_CLICKED)	{ return; }

	var tag = ev.item.getData(Dwt.KEY_OBJECT);
	if (tag) {
		var value = tag.getName(false, null, true, true);
		this._lastVal = value.toLowerCase();
		this._inputField.setValue(value);
		if (ev.detail == DwtTree.ITEM_DBL_CLICKED) {
			this._okButtonListener();
		}
	}
};

ZmPickTagDialog.prototype._getTabGroupMembers =
function() {
	return [this._inputField, this._overview[this._curOverviewId]];
};

ZmPickTagDialog.prototype._enterListener =
function(ev) {
	this._okButtonListener.call(this, ev);
};
