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
 * @class
 * This is a folder choosing widget designed to be displayed as a dropdown hanging off a menu. Other than
 * that, it works mostly like ZmChooseFolderDialog. Instead of a New button, it has a "New Folder" menu item
 * at the bottom. Items are moved when a menu item is clicked, instead of the OK button in the dialog.
 * 
 * The implementation mostly relies on calling ZmChooseFolderDialog and ZmDialog methods, since those were
 * already written. A cleaner implementation would probably include a base widget that this and the dialog
 * would use.
 *
 * @author Eran Yarkon
 *
 * @param {hash}		params			a hash of parameters
 * @param {DwtComposite}      params.parent			the parent widget
 * @param {string}      params.className			the CSS class
 * @param {constant}      params.posStyle			the positioning style (see {@link Dwt})
 *
 * @extends		DwtComposite
 */
ZmFolderChooser = function(params) {
	if (arguments.length == 0) { return; }
	params.className = params.className || "ZmFolderChooser";
	DwtComposite.call(this, params);

	this._overview = {};
	this._opc = appCtxt.getOverviewController();
	this._treeView = {};
	this._folderTreeDivId = this._htmlElId + "_folderTreeDivId";

	this._uuid = Dwt.getNextId();

	this._changeListener = ZmChooseFolderDialog.prototype._folderTreeChangeListener.bind(this);
	this._treeViewListener = this._treeViewSelectionListener.bind(this);

	var moveMenu = params.parent;
	moveMenu._addItem(this, params.index); //this is what DwtMenuItem does. Allows this item to be in the menu items table - better for layout purposes such as consistent widths
	this._moveOnFolderCreate = true;
	
	if (!params.hideNewButton) {
		//add separator menu item on the move menu (the parent)
		new DwtMenuItem({parent:moveMenu, style:DwtMenuItem.SEPARATOR_STYLE});
	
		// add New button
		var newFolderItem = this._newButton = new DwtMenuItem({parent:moveMenu, id: moveMenu.getHTMLElId() + "|NEWFOLDER"});
		var appName = appCtxt.getCurrentAppName();	
		var defaultApp = ZmApp.MAIL;
		var newTextKey = ZmFolderChooser.NEW_ORG_KEY[appName] || ZmFolderChooser.NEW_ORG_KEY[defaultApp];
		var newImage = ZmFolderChooser.NEW_ORG_ICON[appName] || ZmFolderChooser.NEW_ORG_ICON[defaultApp];
		var newShortcut = ZmFolderChooser.NEW_ORG_SHORTCUT[appName];
		newFolderItem.setText(ZmMsg[newTextKey]);
		newFolderItem.setImage(newImage);
		if (newShortcut) {
			newFolderItem.setShortcut(appCtxt.getShortcutHint(this._keyMap, newShortcut));
		}
		newFolderItem.addSelectionListener(this._showNewDialog.bind(this));
	}

	this._init();
	AjxDispatcher.require("Extras");	// ZmChooseFolderDialog
};

ZmFolderChooser.prototype = new DwtComposite;
ZmFolderChooser.prototype.constructor = ZmFolderChooser;

ZmFolderChooser.prototype.isZmFolderChooser = true;
ZmFolderChooser.prototype.toString = function() { return "ZmFolderChooser"; };


// Properties for New button at bottom
ZmFolderChooser.NEW_ORG_KEY = {};
ZmFolderChooser.NEW_ORG_KEY[ZmApp.MAIL]				= "newFolder";
ZmFolderChooser.NEW_ORG_KEY[ZmApp.CONTACTS]			= "newAddrBook";
ZmFolderChooser.NEW_ORG_KEY[ZmApp.CALENDAR]			= "newCalendar";
ZmFolderChooser.NEW_ORG_KEY[ZmApp.TASKS]			= "newTaskFolder";

ZmFolderChooser.NEW_ORG_ICON = {};
ZmFolderChooser.NEW_ORG_ICON[ZmApp.MAIL]			= "NewFolder";
ZmFolderChooser.NEW_ORG_ICON[ZmApp.CONTACTS]		= "NewContactsFolder";
ZmFolderChooser.NEW_ORG_ICON[ZmApp.CALENDAR]		= "NewAppointment";
ZmFolderChooser.NEW_ORG_ICON[ZmApp.TASKS]			= "NewTaskList";

ZmFolderChooser.NEW_ORG_SHORTCUT = {};
ZmFolderChooser.NEW_ORG_SHORTCUT[ZmApp.MAIL]		= ZmKeyMap.NEW_FOLDER;
ZmFolderChooser.NEW_ORG_SHORTCUT[ZmApp.CALENDAR]	= ZmKeyMap.NEW_CALENDAR;

/**
 *
 * see ZmChooseFolderDialog.prototype.popup
 */
ZmFolderChooser.prototype.setupFolderChooser =
function(params, selectionCallback) {

	this._selectionCallback = selectionCallback;
	this._overviewId = params.overviewId;

	ZmChooseFolderDialog.prototype.popup.call(this, params, true);
};

ZmFolderChooser.prototype._getNewButton =
function () {
	return this._newButton;
};

ZmFolderChooser.prototype.updateData =
function(data) {
	this._data = data;
};

ZmFolderChooser.prototype._focus =
function() {
	var overview = this._overview[this._overviewId];
	if (overview) {
		overview.focus();
	}
};

/**
 * this is not really doing the popup, just setting more stuff up, but to reuse the caller (ZmChooseFolderDialog.prototype.popup)
 * from ZmChooseFolderDialog, I had to keep the name.
 *
 * @param params
 */
ZmFolderChooser.prototype._doPopup =
function(params) {
	ZmChooseFolderDialog.prototype._doPopup.call(this, params, true);
};


/**
 * this reuses ZmDialog stuff. With slight necessary changes. Might be fragile if this is changed in ZmDialog
 * in which case we might be better off with copy-paste. but for now it works.
 * 
 * @param params
 * @param forceSingle
 */
ZmFolderChooser.prototype._setOverview =
function(params, forceSingle) {
	params.overviewClass = "menuOverview";

	var overview = ZmDialog.prototype._setOverview.call(this, params, forceSingle); //reuse from ZmDialog

	overview.getHtmlElement().style.overflowX = "hidden"; //must do that or the vertical scrollbar causes a horizontal one to be added as well. might be some better solution to that, but not sure what.
	
	if (!appCtxt.multiAccounts || forceSingle) {
		//this  is needed for some reason
		this._overview[params.overviewId] = overview;
	}

	return overview;
};

/**
 * delegate to ZmDialog. called from ZmDialog.prototype._setOverview (which we delegate to from ZmFolderChooser.prototype._setOverview)
 */
ZmFolderChooser.prototype._renderOverview =
function() {
	ZmDialog.prototype._renderOverview.apply(this, arguments); //reuse code from ZmDialog
};

/**
 * delegate to ZmDialog. called from ZmDialog.prototype._setOverview (which we delegate to from ZmFolderChooser.prototype._setOverview)
 */
ZmFolderChooser.prototype._makeOverviewVisible =
function() {
	ZmDialog.prototype._makeOverviewVisible.apply(this, arguments); //reuse code from ZmDialog
};

ZmFolderChooser.prototype._resetTree =
function(treeIds, overview) {
	ZmChooseFolderDialog.prototype._resetTree.call(this, treeIds, overview);
};

ZmFolderChooser.prototype._getOverview =
function() {
	return ZmChooseFolderDialog.prototype._getOverview.call(this)
};

ZmFolderChooser.prototype._treeViewSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_SELECTED) {
		return;
	}
	//set in DwtTree.prototype._itemClicked and DwtTree.prototype.setSelection (which is called by DwtTreeItem.prototype.handleKeyAction)
	if (!ev.clicked && !ev.enter) {
		return;
	}

	//I kept this logic from ZmChooseFolderDialog.prototype._treeViewSelectionListener. Not sure what it means exactly
	if (this._getOverview() instanceof ZmAccountOverviewContainer) {
		if (ev.item instanceof DwtHeaderTreeItem) {
			return;
		}

		var oc = this._opc.getOverviewContainer(this._curOverviewId);
		var overview = oc.getOverview(ev.item.getData(ZmTreeView.KEY_ID));
		oc.deselectAll(overview);
	}

	var organizer = ev.item && ev.item.getData(Dwt.KEY_OBJECT);
	var value = organizer ? organizer.getName(null, null, true) : ev.item.getText();
	this._lastVal = value.toLowerCase();
	this._doSelection();
};

/**
 * copied mostly from ZmChooseFolderDialog.prototype._okButtonListener  
 * @param tgtFolder
 */
ZmFolderChooser.prototype._doSelection =
function(tgtFolder) {
    tgtFolder = tgtFolder || this._getOverview().getSelected();
    if  (!tgtFolder) {
        tgtFolder = appCtxt.getById(this._selected);
    }
	var folderList = (tgtFolder && (!(tgtFolder instanceof Array)))
		? [tgtFolder] : tgtFolder;

	var msg = (!folderList || (folderList && folderList.length == 0))
		? ZmMsg.noTargetFolder : null;

	//todo - what is that? can you move stuff to multiple targets?  annotation on ZmChooseFolderDialog show it might be for filters on multiple folders. obviously in that case we can't have a drop down. we might have to keep that folder dialog
	
	// check for valid target
	if (!msg && this._data) {
		for (var i = 0; i < folderList.length; i++) {
			var folder = folderList[i];
			if (folder.mayContain && !folder.mayContain(this._data, null, this._acceptFolderMatch)) {
				if (this._data instanceof ZmFolder) {
					msg = ZmMsg.badTargetFolder;
				}
				else {
					var items = AjxUtil.toArray(this._data);
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						if (!item) {
							continue;
						}
						if (item.isDraft && (folder.nId != ZmFolder.ID_TRASH && folder.nId != ZmFolder.ID_DRAFTS && folder.rid != ZmFolder.ID_DRAFTS)) {
							// can move drafts into Trash or Drafts
							msg = ZmMsg.badTargetFolderForDraftItem;
							break;
						}
						else if ((folder.nId == ZmFolder.ID_DRAFTS || folder.rid == ZmFolder.ID_DRAFTS) && !item.isDraft)	{
							// only drafts can be moved into Drafts
							msg = ZmMsg.badItemForDraftsFolder;
							break;
						}
					}
					if (!msg) {
						msg = ZmMsg.badTargetFolderItems;
					}
				}
				break;
			}
		}
	}

	if (msg) {
		ZmDialog.prototype._showError.call(this, msg);
		return;
	}
	if (this._selectionCallback) {
		this._selectionCallback(tgtFolder);
	}
};

ZmFolderChooser.prototype._resetTreeView =
function(visible) {
	ZmChooseFolderDialog.prototype._resetTreeView.call(this, visible);
};

ZmFolderChooser.prototype.getOverviewId =
function(part) {
	return appCtxt.getOverviewId([this.toString(), part], null);
};

ZmFolderChooser.prototype._loadFolders =
function() {
	ZmChooseFolderDialog.prototype._loadFolders.call(this);
};

ZmFolderChooser.prototype._init =
function() {

	var html = [], idx = 0;

	html[idx++] =	"<table cellspacing='0' cellpadding='0' style='border-collapse:collapse;'>";
	html[idx++] =		"<tr><td><div id='" + this._folderTreeDivId + "'>";
	html[idx++] =		"</div></td></tr>";
	html[idx++] =	"</table>";

	this.getHtmlElement().innerHTML = html.join("");
};

ZmFolderChooser.prototype._showNewDialog =
function() {
	var item = this._getOverview().getSelected(true);
	var newType = (item && item.type) || this._treeIds[0];
	var ftc = this._opc.getTreeController(newType);
	var dialog = ftc._getNewDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, ZmChooseFolderDialog.prototype._newCallback, this, [ftc, dialog]);
	this.parent.popdown(); //pop it down so it doenst pop down when user clicks on the "new" dialog, confusing them. this is also consistent with the tag menu "new".
	dialog.popup();
};
