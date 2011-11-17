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
 * Creates a folder properties dialog.
 * @class
 * This class represents a folder properties dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		DwtDialog
 */
ZmFolderPropsDialog = function(parent, className) {
	className = className || "ZmFolderPropsDialog";
	var extraButtons;
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		extraButtons = [
			new DwtDialog_ButtonDescriptor(ZmFolderPropsDialog.ADD_SHARE_BUTTON, ZmMsg.addShare, DwtDialog.ALIGN_LEFT)
		];
	}


	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.folderProperties, extraButtons:extraButtons});

	this._tabViews  = [];
	this._tabKeys   = [];
	this._tabInUse  = [];
	this._tabKeyMap = {};

	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		this.registerCallback(ZmFolderPropsDialog.ADD_SHARE_BUTTON, this._handleAddShareButton, this);
	}
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));

	this._folderChangeListener = new AjxListener(this, this._handleFolderChange);

	this._createView();
};

ZmFolderPropsDialog.prototype = new DwtDialog;
ZmFolderPropsDialog.prototype.constructor = ZmFolderPropsDialog;

// Constants

ZmFolderPropsDialog.ADD_SHARE_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmFolderPropsDialog.SHARES_HEIGHT = "9em";

// Tab identifiers
ZmFolderPropsDialog.TABKEY_PROPERTIES	= "PROPERTIES_TAB";
ZmFolderPropsDialog.TABKEY_RETENTION 	= "RETENTION_TAB";


// Public methods

ZmFolderPropsDialog.prototype.toString =
function() {
	return "ZmFolderPropsDialog";
};

ZmFolderPropsDialog.prototype.getTabKey =
function(id) {
	var index = this._tabKeyMap[id];
	return this._tabKeys[index];
};

/**
 * Pops-up the properties dialog.
 * 
 * @param	{ZmOrganizer}	organizer		the organizer
 */
ZmFolderPropsDialog.prototype.popup =
function(organizer) {
	this._organizer = organizer;
    for (var i = 0; i < this._tabViews.length; i++) {
        this._tabViews[i].setOrganizer(organizer);
    }
    // On popup, make the property view visible
	var tabKey = this.getTabKey(ZmFolderPropsDialog.TABKEY_PROPERTIES);
	this._tabContainer.switchToTab(tabKey, true);

	organizer.addChangeListener(this._folderChangeListener);

	this._handleFolderChange();
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		var isShareable = ZmOrganizer.SHAREABLE[organizer.type];

		var isVisible = (!organizer.link || organizer.isAdmin());
		this.setButtonVisible(ZmFolderPropsDialog.ADD_SHARE_BUTTON, isVisible && isShareable);
	}

	DwtDialog.prototype.popup.call(this);
};

ZmFolderPropsDialog.prototype.popdown =
function() {
	if (this._organizer) {
		this._organizer.removeChangeListener(this._folderChangeListener);
		this._organizer = null;
	}
	DwtDialog.prototype.popdown.call(this);
};

// Protected methods

ZmFolderPropsDialog.prototype._getSeparatorTemplate =
function() {
	return "";
};

ZmFolderPropsDialog.prototype._handleEditShare =
function(event, share) {
	share = share || Dwt.getObjectFromElement(DwtUiEvent.getTarget(event));
	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.EDIT, share.object, share);
	return false;
};

ZmFolderPropsDialog.prototype._handleRevokeShare =
function(event, share) {
	share = share || Dwt.getObjectFromElement(DwtUiEvent.getTarget(event));
	var revokeShareDialog = appCtxt.getRevokeShareDialog();
	revokeShareDialog.popup(share);
	return false;
};

ZmFolderPropsDialog.prototype._handleResendShare =
function(event, share) {

	AjxDispatcher.require("Share");
	share = share || Dwt.getObjectFromElement(DwtUiEvent.getTarget(event));

	// create share info
	var tmpShare = new ZmShare({object:share.object});
	tmpShare.grantee.id = share.grantee.id;
	tmpShare.grantee.email = (share.grantee.type == "guest") ? share.grantee.id : share.grantee.name;
	tmpShare.grantee.name = share.grantee.name;
    if (tmpShare.object.isRemote()) {
		tmpShare.grantor.id = tmpShare.object.zid;
		tmpShare.grantor.email = tmpShare.object.owner;
		tmpShare.grantor.name = tmpShare.grantor.email;
		tmpShare.link.id = tmpShare.object.rid;
	} else {
		tmpShare.grantor.id = appCtxt.get(ZmSetting.USERID);
		tmpShare.grantor.email = appCtxt.get(ZmSetting.USERNAME);
		tmpShare.grantor.name = appCtxt.get(ZmSetting.DISPLAY_NAME) || tmpShare.grantor.email;
		tmpShare.link.id = tmpShare.object.id;
	}

	tmpShare.link.name = share.object.name;
	tmpShare.link.view = ZmOrganizer.getViewName(share.object.type);
	tmpShare.link.perm = share.link.perm;

	if (share.grantee.type == "guest") {
		if (!this._guestFormatter) {
			this._guestFormatter = new AjxMessageFormat(ZmMsg.shareWithGuestNotes);
		}
		var url = share.object.getRestUrl();
		var username = tmpShare.grantee.email;
		var password = share.link.pw;

		if (password && username) {
			tmpShare.notes = this._guestFormatter.format([url, username, password]);
		}
	}

	tmpShare.sendMessage(ZmShare.NEW);
	appCtxt.setStatusMsg(ZmMsg.resentShareMessage);

	return false;
};

ZmFolderPropsDialog.prototype._handleAddShareButton =
function(event) {
	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, this._organizer, null);
};

ZmFolderPropsDialog.prototype._handleOkButton =
function(event) {

	// New batch command, stop on error
	var batchCommand = new ZmBatchCommand();
    var saveState = {
        commandCount: 0,
        errorMessage: []
    };
    for (var i = 0; i < this._tabViews.length; i++) {
        if (this._tabInUse[i]) {
            // Save all in use tabs
            this._tabViews[i].doSave(batchCommand, saveState);
        }
    }

    if (saveState.errorMessage.length > 0) {
        var msg = saveState.errorMessage.join("<br>");
        var dialog = appCtxt.getMsgDialog();
        dialog.reset();
        dialog.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
        dialog.popup();
    }  else if (saveState.commandCount > 0) {
        var callback = new AjxCallback(this, this.popdown);
        batchCommand.run(callback);
    } else {
        this.popdown();
    }
};



ZmFolderPropsDialog.prototype._handleError =
function(response) {
	// Returned 'not handled' so that the batch command will preform the default
	// ZmController._handleException
	return false;
};


ZmFolderPropsDialog.prototype._handleCancelButton =
function(event) {
	this.popdown();
};

ZmFolderPropsDialog.prototype._handleFolderChange =
function(event) {
	var organizer = this._organizer;

    // Get the components that will be hidden or displayed
    var tabBar = this._tabContainer.getTabBar();
    var tabKey = this.getTabKey(ZmFolderPropsDialog.TABKEY_RETENTION);
    var retentionTabButton = this._tabContainer.getTabButton(tabKey);
    var retentionIndex = this._tabKeyMap[ZmFolderPropsDialog.TABKEY_RETENTION];

    if ((organizer.type != ZmOrganizer.FOLDER) || organizer.link) {
        // Not a folder, or shared - hide the retention view (and possibly the toolbar)
        this._tabInUse[retentionIndex] = false;
        if (this._tabViews.length > 2) {
            // More than two tabs, hide the retention tab, leave the toolbar intact
            tabBar.setVisible(true);
            retentionTabButton.setVisible(false);
        } else {
            // Two or fewer tabs.  Hide the toolbar, just let the properties view display standalone
            // (On popup, the display defaults to the property view)
            tabBar.setVisible(false);
        }
    } else {
        // Using the retention tab view - show the toolbar and all tabs
        this._tabInUse[retentionIndex] = true;
        retentionTabButton.setVisible(true);
        tabBar.setVisible(true);
    }

    for (var i = 0; i < this._tabViews.length; i++) {
        if (this._tabInUse[i]) {
            // Update all in use tabs to use the specified folder
            this._tabViews[i]._handleFolderChange(event);
        }
    }

	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
		this._populateShares(organizer);
	}

};

ZmFolderPropsDialog.prototype._populateShares =
function(organizer) {

	this._sharesGroup.setContent("");

	var displayShares = this._getDisplayShares(organizer);

	var getFolder = false;
	if (displayShares.length) {
		for (var i = 0; i < displayShares.length; i++) {
			var share = displayShares[i];
			if (!(share.grantee && share.grantee.name)) {
				getFolder = true;
			}
		}
	}

	if (getFolder) {
		var respCallback = new AjxCallback(this, this._handleResponseGetFolder, [displayShares]);
		organizer.getFolder(respCallback);
	} else {
		this._handleResponseGetFolder(displayShares);
	}


	this._sharesGroup.setVisible(displayShares.length > 0);
};

ZmFolderPropsDialog.prototype._getDisplayShares =
function(organizer) {

	var shares = organizer.shares;
	var displayShares = [];
	if ((!organizer.link || organizer.isAdmin()) && shares && shares.length > 0) {
		AjxDispatcher.require("Share");
		var userZid = appCtxt.accountList.mainAccount.id;
		// if a folder was shared with us with admin rights, a share is created since we could share it;
		// don't show any share that's for us in the list
		for (var i = 0; i < shares.length; i++) {
			var share = shares[i];
			if (share.grantee) {
				var granteeId = share.grantee.id;
				if ((share.grantee.type != ZmShare.TYPE_USER) || (share.grantee.id != userZid)) {
					displayShares.push(share);
				}
			}
		}
	}

	return displayShares;
};

ZmFolderPropsDialog.prototype._handleResponseGetFolder =
function(displayShares, organizer) {

	if (organizer) {
		displayShares = this._getDisplayShares(organizer);
	}

	if (displayShares.length) {
		var table = document.createElement("TABLE");
		table.border = 0;
		table.cellSpacing = 0;
		table.cellPadding = 3;
		for (var i = 0; i < displayShares.length; i++) {
			var share = displayShares[i];
			var row = table.insertRow(-1);
			var nameEl = row.insertCell(-1);
			nameEl.style.paddingRight = "15px";
			var nameText = share.grantee && share.grantee.name;
			if (share.isAll()) {
				nameText = ZmMsg.shareWithAll;
			} else if (share.isPublic()) {
				nameText = ZmMsg.shareWithPublic;
			} else if (share.isGuest()){
                nameText = nameText || (share.grantee && share.grantee.id);
			}
			nameEl.innerHTML = AjxStringUtil.htmlEncode(nameText);

			var roleEl = row.insertCell(-1);
			roleEl.style.paddingRight = "15px";
			roleEl.innerHTML = ZmShare.getRoleName(share.link.role);

			this.__createCmdCells(row, share);
		}
		this._sharesGroup.setElement(table);

		var width = Dwt.DEFAULT;
		var height = displayShares.length > 5 ? ZmFolderPropsDialog.SHARES_HEIGHT : Dwt.CLEAR;

		var insetElement = this._sharesGroup.getInsetHtmlElement();
		Dwt.setScrollStyle(insetElement, Dwt.SCROLL);
		Dwt.setSize(insetElement, width, height);
	}

	this._sharesGroup.setVisible(displayShares.length > 0);
};

ZmFolderPropsDialog.prototype.__createCmdCells =
function(row, share) {
	var type = share.grantee.type;
	if (type == ZmShare.TYPE_DOMAIN || !share.link.role) {
		var cell = row.insertCell(-1);
		cell.colSpan = 3;
		cell.innerHTML = ZmMsg.configureWithAdmin;
		return;
	}

	var actions = [ZmShare.EDIT, ZmShare.REVOKE, ZmShare.RESEND];
	var handlers = [this._handleEditShare, this._handleRevokeShare, this._handleResendShare];

	for (var i = 0; i < actions.length; i++) {
		var action = actions[i];
		var cell = row.insertCell(-1);

		// public shares have no editable fields, and sent no mail
		var isAllShare = share.grantee && (share.grantee.type == ZmShare.TYPE_ALL);
		if ((isAllShare || share.isPublic()) && (action == ZmShare.EDIT || action == ZmShare.RESEND)) { continue; }

		var link = document.createElement("A");
		link.href = "#";
		link.innerHTML = ZmShare.ACTION_LABEL[action];

		Dwt.setHandler(link, DwtEvent.ONCLICK, handlers[i]);
		Dwt.associateElementWithObject(link, share);

		cell.appendChild(link);
	}
};

ZmFolderPropsDialog.prototype.addTab =
function(index, id, tabViewPage) {
	if (!this._tabContainer || !tabViewPage) { return null; }

	this._tabViews[index] = tabViewPage;
	this._tabKeys[index]  = this._tabContainer.addTab(tabViewPage.getTitle(), tabViewPage);
	this._tabInUse[index] = true;
	this._tabKeyMap[id] = index;
	return this._tabKeys[index];
};

ZmFolderPropsDialog.prototype._initializeTabView =
function(view) {
    this._tabContainer = new DwtTabView(view, null, Dwt.STATIC_STYLE);

    this.addTab(0, ZmFolderPropsDialog.TABKEY_PROPERTIES, new ZmFolderPropertyView(this._tabContainer));
    this.addTab(1, ZmFolderPropsDialog.TABKEY_RETENTION,  new ZmFolderRetentionView(this._tabContainer));

	// setup shares group
	if (appCtxt.get(ZmSetting.SHARING_ENABLED))	{
        this._sharesGroup = new DwtGrouper(view, "DwtGrouper ZmFolderPropSharing");
		this._sharesGroup.setLabel(ZmMsg.folderSharing);
		this._sharesGroup.setVisible(false);
		this._sharesGroup.setScrollStyle(Dwt.SCROLL);
        view.getHtmlElement().appendChild(this._sharesGroup.getHtmlElement());
	}
};

// This creates the tab views managed by this dialog, the tabToolbar, and
// the share buttons and view components
ZmFolderPropsDialog.prototype._createView =
function() {
    this._baseContainerView = new DwtComposite({parent:this, className:"ZmFolderPropertiesDialog-container "});
    this._initializeTabView(this._baseContainerView);
    this.setView(this._baseContainerView);
};

