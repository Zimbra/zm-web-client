/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog for choosing a tag.
 * @constructor
 * @class
 * This class presents the user with their list of tags in a tree view so that they
 * can choose one. There is a text input that can be used to filter the list.
 *
 * @param parent
 * @param className
 */
ZmPickTagDialog = function(parent, className) {

	var newButton = new DwtDialog_ButtonDescriptor(ZmPickTagDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	var params = {parent:parent, className:className, title:ZmMsg.pickATag, extraButtons:[newButton]};
	ZmDialog.call(this, params);

	this._createControls();
	this._setNameField(this._inputDivId);
	appCtxt.getTagTree().addChangeListener(new AjxListener(this, this._tagTreeChangeListener));
	this.registerCallback(ZmPickTagDialog.NEW_BUTTON, this._showNewDialog, this);
	this._creatingTag = false;
	this._treeViewListener = new AjxListener(this, this._treeViewSelectionListener);
};

ZmPickTagDialog.prototype = new ZmDialog;
ZmPickTagDialog.prototype.constructor = ZmPickTagDialog;

ZmPickTagDialog.NEW_BUTTON = DwtDialog.LAST_BUTTON + 1;

ZmPickTagDialog.prototype.toString = 
function() {
	return "ZmPickTagDialog";
};

ZmPickTagDialog.prototype.popup = 
function(params) {

	// all this is done here instead of in the constructor due to multi-account issues
	var ovParams = {
		overviewId:			this.toString(),
		treeIds:			[ZmOrganizer.TAG],
		fieldId:			this._tagTreeDivId
	}
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
	var tags = appCtxt.getTagTree().asList();
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
	dialog.popup();
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

ZmPickTagDialog.prototype._tagTreeChangeListener =
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
		var value = this._lastVal = tag.getName(false, null, true, true);
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
