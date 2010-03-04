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
 * This file contains a dialog.
 * 
 */

/**
 * Creates a dialog.
 * @class
 * This class is a base class for miscellaneous organizer-related dialogs. An instance
 * of this class can be re-used to show different overviews.
 *
 * @author Conrad Damon
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{DwtControl}	params.parent		the parent widget
 * @param	{DwtMsgDialog}	params.msgDialog		the message dialog
 * @param	{String}	params.className		the CSS class name
 * @param	{String}	params.title		the dialog title
 * @param	{Array|constant}	params.standardButtons		an array of standard buttons to include. Defaults to {@link DwtDialog.OK_BUTTON} and {@link DwtDialog.CANCEL_BUTTON}.
 * @param	{Array}	params.extraButtons		a list of {@link DwtDialog_ButtonDescriptor} objects describing custom buttons to add to the dialog
 * @param	{DwtControl}	params.view				the dialog contents
 * 
 * @extends	DwtDialog
 */
ZmDialog = function(params) {
	if (arguments.length == 0) { return; }

	DwtDialog.call(this, params);

	if (!params.view) {
		this.setContent(this._contentHtml());
	}

	if (this._button[DwtDialog.OK_BUTTON]) {
		this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	}

	this._overview = {};
	this._opc = appCtxt.getOverviewController();

	this._baseTabGroupSize = this._tabGroup.size();
};

ZmDialog.prototype = new DwtDialog;
ZmDialog.prototype.constructor = ZmDialog;

/**
 * @private
 */
ZmDialog.prototype._contentHtml =
function() {
	return "";
};

/**
 * Sets the view for this dialog.
 * 
 * @param	{DwtComposite}		newView		the view
 * @param	{Boolean}		noReset		if <code>true</code>, do not reset the dialog; <code>false</code> otherwise
 */
ZmDialog.prototype.setView =
function(newView, noReset) {
	this.reset();
	if (newView) {
        var contentDiv = this._getContentDiv();
        var el = newView.getHtmlElement();
		contentDiv.parentNode.replaceChild(el, contentDiv);
		this._contentDiv = el;
	}
};

ZmDialog.prototype.popup =
function() {
	// Bug 38281: for multiuse dialogs, we need to re-add the discretionary
	// tab stops to the base list (the dialog buttons)
	this._tabGroup.__members._array.splice(this._baseTabGroupSize);
	this._tabGroup.addMember(this._getTabGroupMembers());

	DwtDialog.prototype.popup.call(this);
	if (this._focusElement) {
		appCtxt.getKeyboardMgr().grabFocus(this._focusElement);
	}
};

ZmDialog.prototype.reset =
function() {
	if (this._nameField) {
		this._nameField.value = "";
	}
	DwtDialog.prototype.reset.call(this);
};

/**
 * @private
 */
ZmDialog.prototype._okButtonListener =
function() {
	this.popdown();
};

/**
 * @private
 */
ZmDialog.prototype._setNameField =
function(fieldId) {
	this._nameField = this._focusElement = document.getElementById(fieldId);
	if (this._enterListener) {
		this.addEnterListener(new AjxListener(this, this._enterListener));
	}
};

/**
 * Displays the given list of tree views in an overview, creating it if
 * necessary, and appends the overview to an element in the dialog. Since
 * dialogs may be reused, it is possible that it will display different
 * overviews. That is handled by making sure that only the current overview is
 * visible.
 * 
 * @param params		[hash]				hash of params:
 *        treeIds		[array]				list of tree views to show
 *        omit			[hash]				IDs of organizers to exclude
 *        fieldId		[string]			DOM ID of element that contains overview
 *        overviewId	[string]*			ID for the overview
 *        noRootSelect	[boolean]*			if true, don't make root tree item(s) selectable
 * @param forceSingle	[boolean]*			if true, don't make multi-account overviews
 * @private
 */
ZmDialog.prototype._setOverview =
function(params, forceSingle) {

	// when in multi-account mode, hide the old overview since we don't know
	// whether we want to show an overview container or just a single-account overview.
	if (appCtxt.multiAccounts) {
		var oldOverview = this._opc.getOverviewContainer(this._curOverviewId) ||
						  this._opc.getOverview(this._curOverviewId);

		if (oldOverview) {
			oldOverview.setVisible(false);
		}
	}

	// multi-account uses overview container
	if (appCtxt.multiAccounts && !forceSingle) {
		// use overviewId as the containerId; container will assign overviewId's
		var containerId = this._curOverviewId = params.overviewId;
		var ovContainer = this._opc.getOverviewContainer(containerId);
		if (!ovContainer) {
			var overviewParams = {
				overviewClass:	"dialogOverviewContainer",
				headerClass:	"DwtTreeItem",
				noTooltips:		true,
				treeStyle:		params.treeStyle,
				treeIds:		params.treeIds,
				overviewTrees:	params.overviewTrees,
				omit:			params.omit,
				omitPerAcct:	params.omitPerAcct,
				selectable:		params.selectable
			};
			var containerParams = {
				appName: params.appName,
				containerId: containerId
			};
			ovContainer = this._opc.createOverviewContainer(containerParams, overviewParams);
			ovContainer.setSize(Dwt.DEFAULT, "200");
			document.getElementById(params.fieldId).appendChild(ovContainer.getHtmlElement());
		}

		// make overview container visible
		ovContainer.setVisible(true);

		return ovContainer;
	}

	// single-account overview handling
	var overviewId = this._curOverviewId = params.overviewId;
	var overview = this._opc.getOverview(overviewId);
	if (!overview) {
		var ovParams = {
			overviewId:		overviewId,
			overviewClass:	"dialogOverview",
			headerClass:	"DwtTreeItem",
			noTooltips:		true,
			treeStyle:		params.treeStyle,
			treeIds:		params.treeIds,
			account:		((appCtxt.multiAccounts && params.forceSingle) ? appCtxt.getActiveAccount() : params.account)
		};
		overview = this._overview[overviewId] = this._opc.createOverview(ovParams);
		this._renderOverview(overview, params.treeIds, params.omit, params.noRootSelect);
		document.getElementById(params.fieldId).appendChild(overview.getHtmlElement());
	}

	this._makeOverviewVisible(overviewId);

	return overview;
};

/**
 * @private
 */
ZmDialog.prototype._makeOverviewVisible =
function(overviewId) {
	for (var id in this._overview) {
		this._overview[id].setVisible(id == overviewId);
	}
};

/**
 * Renders the tree views in the overview, and makes the header items
 * selectable (since they can generally be targets of whatever action the dialog
 * is facilitating).
 * 
 * @param overview		[ZmOverview]		the overview
 * @param treeIds		[array]				list of tree views to show
 * @param omit			[hash]*				IDs of organizers to exclude
 * @param noRootSelect	[boolean]*			if true, don't make root tree item(s) selectable
 * @private
 */
ZmDialog.prototype._renderOverview =
function(overview, treeIds, omit, noRootSelect) {
	overview.set(treeIds, omit);
	if (!noRootSelect) {
		for (var i = 0; i < treeIds.length; i++) {
			var treeView = overview.getTreeView(treeIds[i]);
			var hi = treeView && treeView.getHeaderItem();
			if (hi) hi.enableSelection(true);
		}
	}
};

/**
 * @private
 */
ZmDialog.prototype._getOverview =
function() {
	return this._overview[this._curOverviewId];
};

/**
 * @private
 */
ZmDialog.prototype._getInputFields =
function() {
	return (this._nameField) ? [this._nameField] : null;
};

/**
 * @private
 */
ZmDialog.prototype._showError =
function(msg, loc) {
	var nLoc = loc || (new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100));
	var msgDialog = appCtxt.getMsgDialog();

	msgDialog.reset();
    msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup(nLoc);
};

/**
 * @private
 */
ZmDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField];
};
