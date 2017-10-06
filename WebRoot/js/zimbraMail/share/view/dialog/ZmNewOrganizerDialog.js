/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a new organizer dialog.
 * @class
 * This class represents a new organizer dialog.
 * 
 * @param	{DwtControl}	parent		the parent
 * @param	{String}	className		the class name
 * @param	{String}	title		the title
 * @param	{constant}	type		the organizer type
 * 
 * @extends		ZmDialog
 */
ZmNewOrganizerDialog = function(parent, className, title, type, extraButtons) {
	if (arguments.length == 0) return;

	className = className || "ZmCreateNewFolderDialog";

	this._organizerType = type;
	ZmDialog.call(this, {parent:parent, className:className, title:title, id:"CreateNewFolderDialog", extraButtons: extraButtons});
	this._setupControls();
};

ZmNewOrganizerDialog.prototype = new ZmDialog;
ZmNewOrganizerDialog.prototype.constructor = ZmNewOrganizerDialog;

ZmNewOrganizerDialog.prototype.isZmNewOrganizerDialog = true;
ZmNewOrganizerDialog.prototype.toString = function() { return "ZmNewOrganizerDialog"; };

//override the following if needed
ZmNewOrganizerDialog.prototype._folderLocationLabel = ZmMsg.newFolderParent;
ZmNewOrganizerDialog.prototype._folderNameAlreadyExistsMsg = ZmMsg.errorAlreadyExists;

// Public methods

/**
 * Pops-up the dialog.
 * 
 * @param {ZmOrganizer|hash}	params      popup parameters
 * @param	{ZmAccount}	account		the account
 */
ZmNewOrganizerDialog.prototype.popup =
function(params, account) {

	params = params || {};
    var folder = params instanceof ZmOrganizer ? params : (params && params.organizer);

	var parentLabelCell = document.getElementById(this._htmlElId + '_parentLabel');
	var parentValueCell = document.getElementById(this._htmlElId + '_parentValue');
	this._parentFolder = null;

	// if the user has already implicitly selected a parent folder, don't show overview
	if (folder && folder.id != ZmOrganizer.ID_ROOT) {
		this._parentFolder = folder;
		this._makeOverviewVisible();    // hide all overviews
		if (parentLabelCell) {
			parentLabelCell.colSpan = 1;
			parentLabelCell.innerHTML = ZmMsg.parentFolderLabel;
			parentValueCell.innerHTML = folder.getName();
		}
	}
	else {
		if (this._folderTreeCellId) {
			if (parentLabelCell) {
				parentLabelCell.innerHTML = this._folderLocationLabel;
				parentLabelCell.colSpan = 2;
				parentValueCell.innerHTML = '';
			}
			var overviewParams = {
				appName:		params.appName,
				overviewId:		this.toString() + (params.appName || ""),
				treeIds:		this._treeIds,
				omit:			this._omit,
				fieldId:		this._folderTreeCellId,
				overviewTrees:	[this._organizerType],
	            treeStyle:      this._treeStyle
			};
			var overview = this._setOverview(overviewParams);
			overview.removeAttribute('aria-label');
			overview.setAttribute('aria-labelledby', this._htmlElId + '_parentLabel');

			if (this._folderTreeView) {
				// bug #18533 - always make sure header item is visible in "New" dialog
				this._folderTreeView.getHeaderItem().setVisible(true, true);

				if (!folder || this._omit[folder.nId] || folder.nId == ZmOrganizer.ID_ROOT) {
					folder = appCtxt.getFolderTree().root; //default to root if no folder passed, the folder is omitted from the overview. (I don't get the last option, but it was there so I keep it - it's already root)
				}
				var ti = this._folderTreeView.getTreeItemById(folder.id);
				if (ti) {
					this._folderTreeView.setSelection(ti, true, null, true);
				}
				if (folder.nId == ZmOrganizer.ID_ROOT) {
					var sid = ZmOrganizer.getSystemId(folder.id);
					var ti = this._folderTreeView.getTreeItemById(sid);
					if (ti) {
						ti.setExpanded(true);
					}
				}
			}
		}
	}

    if (this._colorSelect) {
        var defaultColorCode = ZmOrganizer.DEFAULT_COLOR[this._organizerType],
            defaultColor = ZmOrganizer.COLOR_VALUES[defaultColorCode],
            colorMenu = this._colorSelect.getMenu(),
            moreColorMenu;
        if(colorMenu) {
            moreColorMenu = (colorMenu.toString() == "ZmMoreColorMenu") ? colorMenu : colorMenu._getMoreColorMenu();
            if(moreColorMenu) moreColorMenu.setDefaultColor(defaultColor);
        }

        var icon = null;
        var orgType = this._organizerType;
        var orgClass = ZmOrganizer.ORG_CLASS[orgType];
        if (orgClass) {
			//to fix bug 55320 - got rid of the calling getIcon on the prototype hack - that caused isRemote to set _isRemote on the prototype thus causing every object to have it by default set.
            //bug 55491: pass tmp. organizer id to make sure this._isRemote is not true by default.
			var sample = new window[orgClass]({id:Dwt.getNextId()}); //get a sample object just for the icon
			icon = sample.getIcon();
        }

        this._colorSelect.setImage(icon);
        this._colorSelect.setValue(ZmOrganizer.DEFAULT_COLOR[orgType]);
    }

	var ovContainer = appCtxt.multiAccounts && this._opc.getOverviewContainer(this.toString());
	if (ovContainer) {
		if (!folder || (folder && folder.nId == ZmOrganizer.ID_ROOT)) {
			var acct = account || appCtxt.getActiveAccount();
			ovContainer.setSelection(ovContainer.getHeaderItem(acct));
		} else {
			var overviewId = appCtxt.getOverviewId(this.toString(), account);
			var overview = ovContainer.getOverview(overviewId);
			var treeView = overview && overview.getTreeView(this._organizerType);
			if (treeView) {
				ovContainer.deselectAll();
				var ti = treeView.getTreeItemById(folder.id);
				treeView.setSelection(ti);
			}
		}

		ovContainer.expandAccountOnly(account);
	}

	ZmDialog.prototype.popup.call(this);
};

/**
 * Resets the dialog.
 * 
 * @param	{ZmAccount}	account		the account
 */
ZmNewOrganizerDialog.prototype.reset = function(account) {

	ZmDialog.prototype.reset.apply(this, arguments);

	if (this._remoteCheckboxField) {
		this._remoteCheckboxField.checked = false;
		var urlRow = document.getElementById(this._remoteCheckboxFieldId + "URLrow");
		if (urlRow) {
			urlRow.style.display = "none";
		}
	}

	if (this._urlField) {
		this._urlField.value = "";
		this._urlField.noTab = true;
	}

	if (appCtxt.multiAccounts) {
		this._account = account;
	} else {
		this._account = null;
	}
};


//
// Protected methods
//

ZmNewOrganizerDialog.prototype._getRemoteLabel =
function() {
	return ZmMsg.subscribeToFeed;
};

// create html

ZmNewOrganizerDialog.prototype._contentHtml = 
function() {
	var html = [];
	var idx = 0;
	html[idx++] = "<table class='ChooserDialog ZmDialogPropertySheet'>";
	idx = this._createStandardContentHtml(html, idx);
	idx = this._createExtraContentHtml(html, idx);
	html[idx++] = "</table>";
	return html.join("");
};

ZmNewOrganizerDialog.prototype._createStandardContentHtml =
function(html, idx) {
	idx = this._createNameContentHtml(html, idx);
	if (this._organizerType != ZmOrganizer.FOLDER || (this._organizerType == ZmOrganizer.FOLDER && appCtxt.get(ZmSetting.MAIL_FOLDER_COLORS_ENABLED))) {
		idx = this._createColorContentHtml(html, idx);
	}
	return idx;
};

ZmNewOrganizerDialog.prototype._createNameContentHtml =
function(html, idx) {
	this._nameFieldId = this._htmlElId + "_name";
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmNewOrgDialogName", {id:this._htmlElId});
	return idx;
};

ZmNewOrganizerDialog.prototype._createColorContentHtml =
function(html, idx) {
	this._colorSelectId = this._htmlElId + "_colorSelect";
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmNewOrgDialogColor", {id:this._htmlElId});
	return idx;
};

ZmNewOrganizerDialog.prototype._createExtraContentHtml =
function(html, idx) {
	idx = this._createRemoteContentHtml(html, idx);
	idx = this._createFolderContentHtml(html, idx);
	return idx;
};

ZmNewOrganizerDialog.prototype._createRemoteContentHtml = function(html, idx) {

	this._remoteCheckboxFieldId = this._htmlElId + "_remote";

	var subs = {
		id: this._htmlElId,
		remoteLabel: this._getRemoteLabel()
	};
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmNewOrgDialogRemote", subs);
	return idx;
};

ZmNewOrganizerDialog.prototype._createFolderContentHtml =
function(html, idx) {
	this._folderTreeCellId = this._htmlElId + "_folderTree";
	html[idx++] = AjxTemplate.expand("share.Dialogs#ZmNewOrgDialogFolder", {id:this._htmlElId});
	return idx;
};

// setup dwt controls

ZmNewOrganizerDialog.prototype._setupControls =
function() {
	this._setupStandardControls();
	this._setupExtraControls();
};

ZmNewOrganizerDialog.prototype._setupStandardControls =
function() {
	this._setupNameControl();
	this._setupColorControl();
};

ZmNewOrganizerDialog.prototype._setupNameControl =
function() {
	this._setNameField(this._nameFieldId);
};

ZmNewOrganizerDialog.prototype._setupColorControl =
function() {
    var el = document.getElementById(this._colorSelectId);
	this._colorSelect = new ZmColorButton({
		parent:         this,
		parentElement:  el,
		labelId:        this._htmlElId + '_lblColor'
	});
};

ZmNewOrganizerDialog.prototype._setupExtraControls =
function() {
	this._setupRemoteControl();
	this._setupFolderControl();
};

ZmNewOrganizerDialog.prototype._setupRemoteControl =
function() {
	this._remoteCheckboxField = document.getElementById(this._remoteCheckboxFieldId);
	if (this._remoteCheckboxField) {
		this._urlField = document.getElementById(this._remoteCheckboxFieldId + "URLfield");
		Dwt.setHandler(this._remoteCheckboxField, DwtEvent.ONCLICK, this._handleCheckbox.bind(this));
	}
};

ZmNewOrganizerDialog.prototype._setupFolderControl =
function() {
	if (!this._folderTreeCellId) { return; }
	
	this._treeIds = [this._organizerType];

	this._omit = {};
	this._omit[ZmFolder.ID_SPAM] = true;
	this._omit[ZmFolder.ID_DRAFTS] = true;
	this._omit[ZmFolder.ID_SYNC_FAILURES] = true;
	this._omit[ZmFolder.ID_OUTBOX] = true;

	//Bug#68799: no special handling needed for sync issues folder
	/*var folderTree = appCtxt.getFolderTree();
	var syncIssuesFolder = folderTree ? folderTree.getByName(ZmFolder.SYNC_ISSUES) : null;
	if (syncIssuesFolder) {
		this._omit[syncIssuesFolder.id] = true;
	}*/
	this._omit[ZmOrganizer.ID_ZIMLET] = true;
};

// other

ZmNewOrganizerDialog.prototype._renderOverview =
function(overview, treeIds, omit, noRootSelect) {
	this._setupFolderControl();	// reset in case we changed accounts (family mailbox)
	ZmDialog.prototype._renderOverview.apply(this, arguments);
	this._folderTreeView = overview.getTreeView(this._organizerType);
};

ZmNewOrganizerDialog.prototype._getOverviewOrOverviewContainer =
function() {
	if (appCtxt.multiAccounts) {
		return this._opc.getOverviewContainer(this.toString());
	}
	return this._opc.getOverview(this._curOverviewId);

};


/** 
 * Checks the input for validity and returns the following array of values:
 * <ul>
 * <li> parentFolder
 * <li> name
 * <li> color
 * <li> URL
 * </ul>
 */
ZmNewOrganizerDialog.prototype._getFolderData =
function() {
	// make sure a parent was selected
	var ov = this._getOverviewOrOverviewContainer();

	var parentFolder = this._parentFolder || (ov && ov.getSelected()) || appCtxt.getFolderTree(this._account).root;

	if (this._isGlobalSearch) {
		//special case for global search (only possible if this is ZmNewSearchDialog
		parentFolder = appCtxt.getById(ZmOrganizer.ID_ROOT);
	}

	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name, parentFolder);

	// make sure parent doesn't already have a child by this name
	if (!msg && parentFolder.hasChild(name)) {
        var folderType = appCtxt.getFolderTree(appCtxt.getActiveAccount()).getFolderTypeByName(name);
		msg = AjxMessageFormat.format(this._folderNameAlreadyExistsMsg, [name,ZmMsg[folderType.toLowerCase()]]);
	}

	var color = null;
	if (!msg && this._colorSelectId) {
		color = this._colorSelect.getValue();
	}

	var url = null;
	if (!msg && this._remoteCheckboxField) {
		url = this._remoteCheckboxField.checked ? this._urlField.value : null;
		if (url || url != null) {
			msg = ZmOrganizer.checkUrl(url);
		}
	}

	if (!msg && parentFolder.disallowSubFolder) {
		msg = AjxMessageFormat.format(ZmMsg.errorSubFolderNotAllowed, parentFolder.name);
	}

    if (msg) {
        return this._showError(msg);
    }

	var account = appCtxt.multiAccounts ? parentFolder.getAccount() : null;
	var params = {l:parentFolder.id, name:name, color:color, url:url, account:account};
    if (String(color).match(/^#/)) {
        params.rgb = color;
        delete params.color;
    }
    return params;
};

ZmNewOrganizerDialog.prototype._getTabGroupMembers =
function() {
	var list = [this._nameField];
	if (this._colorSelect) {
		list.push(this._colorSelect);
	}
	if (this._remoteCheckboxField) {
		list.push(this._remoteCheckboxField);
		if (this._urlField) {
			list.push(this._urlField);
		}
	}
	if (this._overview[this._curOverviewId]) {
		list.push(this._overview[this._curOverviewId]);
	}
	return list;
};

// dwt event listeners

ZmNewOrganizerDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmNewOrganizerDialog.prototype._enterListener =
function(ev) {
	var results = this._getFolderData();
	if (results) {
		this._runEnterCallback(results);
	}
};


// html event handlers

ZmNewOrganizerDialog.prototype._handleCheckbox = function(event) {

	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var urlRow = document.getElementById(target.id + "URLrow");
	urlRow.style.display = target.checked ? (AjxEnv.isIE ? "block" : "table-row") : "none";
	if (this._urlField) {
		if (target.checked) {
			this._urlField.focus();
		}
		this._urlField.noTab = !target.checked;
	}
};

ZmNewOrganizerDialog.prototype.setRemoteURL =
function(url) {
    this._remoteCheckboxField.checked = true;
    this._urlField.value = url;
    var urlRow = document.getElementById(this._remoteCheckboxFieldId + "URLrow");
	var urlField= document.getElementById(this._remoteCheckboxFieldId + "URLfield");
	urlRow.style.display = AjxEnv.isIE ? "block" : "table-row";

};
