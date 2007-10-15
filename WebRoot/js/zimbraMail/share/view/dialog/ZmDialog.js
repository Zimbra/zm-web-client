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
 * Creates an empty ZmDialog.
 * @constructor
 * @class
 * This class is a base class for miscellaneous organizer-related dialogs.
 *
 * @author Conrad Damon
 *
 * @param parent				[DwtControl]	parent widget
 * @param msgDialog			[DwtMsgDialog]*	message dialog
 * @param className			[string]*		CSS class
 * @param title				[string]*		dialog title
 * @param standardButtons	[array]*		list of standard buttons to show
 * @param extraButtons		[Array]*		buttons to show in addition to standard set
 * @param view				[DwtControl]*	dialog contents
 */
ZmDialog = function(params) {

	if (arguments.length == 0) return;
	DwtDialog.call(this, params.parent, params.className, params.title,
				   params.standardButtons, params.extraButtons);
	if (params.view) {
		this.setView(params.view);
	} else {
		this.setContent(this._contentHtml());
	}

	if (this._button[DwtDialog.OK_BUTTON]) {
		this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	}

	this._overview = {};
	this._opc = appCtxt.getOverviewController();
	this._tabGroupComplete = false;
};

ZmDialog.prototype = new DwtDialog;
ZmDialog.prototype.constructor = ZmDialog;

ZmDialog.prototype._contentHtml = function () {return "";};

ZmDialog.prototype.setView =
function(newView, noReset) {
	this.reset();
	if (newView) {
        var contentDiv = this._getContentDiv();
        var el = newView.getHtmlElement();
		var td = contentDiv.parentNode;
		td.replaceChild(el, contentDiv);
		this._contentDiv = el;
	}
};

ZmDialog.prototype.popup =
function() {
	if (!this._tabGroupComplete) {
		// tab group filled in here rather than in the constructor
		// because we need all the content fields to have been created
		var members = this._getTabGroupMembers();
		for (var i = 0; i < members.length; i++) {
			this._tabGroup.addMember(members[i], i);
		}
		this._tabGroupComplete = true;
	}
	DwtDialog.prototype.popup.call(this);
};

ZmDialog.prototype.reset =
function() {
	if (this._nameField)
		this._nameField.value = "";
	DwtDialog.prototype.reset.call(this);
};

ZmDialog.prototype._okButtonListener =
function() {
	this.popdown();
};

ZmDialog.prototype._setNameField =
function(fieldId) {
	this._nameField = document.getElementById(fieldId);
	if (this._nameField) this._focusElementId = fieldId;
	//this.setTabOrder([fieldId]);
	this.addEnterListener(new AjxListener(this, this._enterListener));
};

/**
 * Returns a unique ID for this dialog's overview.
 */
ZmDialog.prototype.getOverviewId =
function() {
	var base = this.toString();
	return appCtxt.multiAccounts ? [base, appCtxt.getActiveAccount().name].join(":") : base;
};

/**
 * Displays the given list of tree views in an overview, creating it if necessary, and appends
 * the overview to an element in the dialog. Since dialogs may be reused, it is possible that
 * it will display different overviews. That is handled by making sure that only the current
 * overview is visible.
 * 
 * @param params		[hash]		hash of params:
 *        treeIds		[array]		list of tree views to show
 *        omit			[hash]		IDs of organizers to exclude
 *        fieldId		[string]	DOM ID of element that contains overview
 *        overviewId	[string]*	ID for the overview
 *        noRootSelect	[boolean]*	if true, don't make root tree item(s) selectable
 */
ZmDialog.prototype._setOverview =
function(params) {
	var overviewId = params.overviewId || this.getOverviewId();
	var overview = this._opc.getOverview(overviewId);
	if (!overview) {
		var ovParams = {overviewId:overviewId, overviewClass:"dialogOverview",
						headerClass:"DwtTreeItem", noTooltips:true};
		overview = this._overview[overviewId] = this._opc.createOverview(ovParams);
		this._renderOverview(overview, params.treeIds, params.omit, params.noRootSelect);
		document.getElementById(params.fieldId).appendChild(overview.getHtmlElement());
	}
	// make the current overview the only visible one
	if (overviewId != this._curOverviewId) {
		for (var id in this._overview) {
			this._overview[id].setVisible(id == overviewId);
		}
		this._curOverviewId = overviewId;
	}
};

/**
 * Renders the tree views in the overview, and makes the header items
 * selectable (since they can generally be targets of whatever action
 * the dialog is facilitating).
 * 
 * @param overview		[ZmOverview]	the overview
 * @param treeIds		[array]			list of tree views to show
 * @param omit			[hash]*			IDs of organizers to exclude
 * @param noRootSelect	[boolean]*		if true, don't make root tree item(s) selectable
 */
ZmDialog.prototype._renderOverview =
function(overview, treeIds, omit, noRootSelect) {
	overview.set(treeIds, omit);
	if (!noRootSelect) {
		for (var i = 0; i < treeIds.length; i++) {
			var treeView = overview.getTreeView(treeIds[i]);
			if (treeView) {
				var hi = treeView.getHeaderItem();
				if (hi) {
					hi.enableSelection(true);
				}
			}
		}
	}
};

ZmDialog.prototype._getOverview =
function() {
	return this._overview[this._curOverviewId];
};

/*
ZmDialog.prototype._createOverview =
function(fieldId) {
	var params = {overviewId:this.getOverviewId(), overviewClass:"dialogOverview", headerClass:"DwtTreeItem"};
	var overview = this._opc.createOverview(params);
	if (fieldId) {
		document.getElementById(fieldId).appendChild(overview.getHtmlElement());
	}
};
*/

ZmDialog.prototype._getInputFields = 
function() {
	if (this._nameField)
		return [this._nameField];
};

ZmDialog.prototype._showError =
function(msg, loc) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
    msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
    msgDialog.popup(loc);
    return null;
};

ZmDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField];
};
