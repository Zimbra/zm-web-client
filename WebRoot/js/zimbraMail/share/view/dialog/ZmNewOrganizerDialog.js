/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmNewOrganizerDialog = function(parent, className, title, type) {
	if (arguments.length == 0) return;
	
	ZmDialog.call(this, {parent:parent, className:className, title:title});
	this._organizerType = type;
	this._setupControls();
};

ZmNewOrganizerDialog.prototype = new ZmDialog;
ZmNewOrganizerDialog.prototype.constructor = ZmNewOrganizerDialog;

ZmNewOrganizerDialog.prototype.toString = 
function() {
	return "ZmNewOrganizerDialog";
};

// Public methods

/**
 * Popup the dialog. Note that if family mailbox is enabled, we may have
 * changed accounts since the last time we were popped up. In that case,
 * we need to show the overview for the current account's folders.
 * 
 * @param folder	[ZmFolder]*		folder to select initially
 */
ZmNewOrganizerDialog.prototype.popup =
function(folder) {
	if (this._folderTreeCellId) {
		var params = {
			treeIds: this._treeIds,
			omit: this._omit,
			fieldId: this._folderTreeCellId,
			account: appCtxt.getActiveAccount()
		};
		this._setOverview(params);

		// reset folder tree view if user has multiple accounts set up
		if (appCtxt.multiAccounts) {
			var overview = this._opc.getOverview(this.getOverviewId());
			this._folderTreeView = overview ? overview.getTreeView(this._organizerType) : null;
		}

		if (this._folderTreeView) {
			// bug #18533 - always make sure header item is visible in "New" dialog
			this._folderTreeView.getHeaderItem().setVisible(true, true);

			if (folder) {
				if (folder.nId == ZmOrganizer.ID_ROOT)
					folder = appCtxt.getFolderTree().root;
			} else {
				folder = appCtxt.getFolderTree().root;
			}
			this._folderTreeView.setSelected(folder);
			if (folder.nId == ZmOrganizer.ID_ROOT) {
				var sid = ZmOrganizer.getSystemId(folder.id);
				var ti = this._folderTreeView.getTreeItemById(sid);
				if (ti) ti.setExpanded(true);
			}
		}
		DBG.timePt("selected folder", true);
	}

	// dont allow "None" option in color picker
    // bug 22490 removed None option when not in use
    if (folder != ZmOrganizer.FOLDER && this._colorSelect) {
        var noneOption = this._colorSelect.getMenu().getItem(0);
        if(noneOption.getText() == ZmOrganizer.COLOR_TEXT[0]) {
            this._colorSelect.getMenu().removeChild(noneOption);
        }
    } 

	ZmDialog.prototype.popup.call(this);
};

ZmNewOrganizerDialog.prototype.reset =
function() {
	ZmDialog.prototype.reset.call(this);

	if (this._colorSelect) {
		this._initColorSelect();
	}

	if (this._remoteCheckboxField) {
		this._remoteCheckboxField.checked = false;
		var urlRow = document.getElementById(this._remoteCheckboxFieldId+"URLrow");
		if (urlRow) urlRow.style.display = "none";
	}

	if (this._urlField) {
		this._urlField.value = "";
	}
};


//
// Protected methods
//

ZmNewOrganizerDialog.prototype._getRemoteLabel =
function() {
	return ZmMsg.subscribeToFeed;
};

ZmNewOrganizerDialog.prototype._initColorSelect =
function() {
	var color = (this._colorSelect.getValue() + 1) % ZmOrganizer.COLOR_CHOICES.length;
	var option = this._colorSelect.getOptionWithValue(color);
	this._colorSelect.setSelectedOption(option);
};


// create html

ZmNewOrganizerDialog.prototype._contentHtml = 
function() {
	var html = [];
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=5 border=0>";
	idx = this._createStandardContentHtml(html, idx);
	idx = this._createExtraContentHtml(html, idx);
	html[idx++] = "</table>";
	return html.join("");
};

ZmNewOrganizerDialog.prototype._createStandardContentHtml =
function(html, idx) {
	idx = this._createNameContentHtml(html, idx);
	idx = this._createColorContentHtml(html, idx);
	return idx;
};

ZmNewOrganizerDialog.prototype._createNameContentHtml =
function(html, idx) {
	this._nameFieldId = Dwt.getNextId();

	html[idx++] = "<tr valign='center'><td class='Label'>";
	html[idx++] = ZmMsg.nameLabel;
	html[idx++] = "</td><td>";
    html[idx++] = Dwt.CARET_HACK_BEGIN;
	html[idx++] = "<input autocomplete='off' type='text' class='Field' id='";
	html[idx++] = this._nameFieldId;
	html[idx++] = "' />";
    html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr>";

	return idx;
};

ZmNewOrganizerDialog.prototype._createColorContentHtml =
function(html, idx) {
	this._colorSelectId = Dwt.getNextId();

	html[idx++] = "<tr><td class='Label'>";
	html[idx++] = ZmMsg.colorLabel;
	html[idx++] = "</td><td id='";
	html[idx++] = this._colorSelectId;
	html[idx++] = "'></td></tr>";

	return idx;
};

ZmNewOrganizerDialog.prototype._createExtraContentHtml =
function(html, idx) {
	idx = this._createRemoteContentHtml(html, idx);
	idx = this._createFolderContentHtml(html, idx);
	return idx;
};

ZmNewOrganizerDialog.prototype._createRemoteContentHtml =
function(html, idx) {
	this._remoteCheckboxFieldId = Dwt.getNextId();	
	this._urlFieldId = Dwt.getNextId();		

	html[idx++] = "<tr><td colspan=2>";
	html[idx++] = "<table cellpadding=0 cellspacing=5 border=0>";
	html[idx++] = "<tr valign='center'><td class='Label'>";
	html[idx++] = "<input type='checkbox' id='";
	html[idx++] = this._remoteCheckboxFieldId;
	html[idx++] = "'/></td><td>";
	html[idx++] = this._getRemoteLabel();
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";	
	html[idx++] = "</td></tr>";
	
	html[idx++] = "<tr style='display:none;' id='";
	html[idx++] = this._remoteCheckboxFieldId;
	html[idx++] = "URLrow' valign='center'><td class='Label'>";
	html[idx++] = ZmMsg.urlLabel;
	html[idx++] = "</td>";
	html[idx++] = "<td>";
	html[idx++] = Dwt.CARET_HACK_BEGIN;
	html[idx++] = "<input autocomplete='off' type='text' class='Field' id='";
	html[idx++] = this._remoteCheckboxFieldId;
	html[idx++] = "URLfield'/>";
	html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr>";

	return idx;
};

ZmNewOrganizerDialog.prototype._createFolderContentHtml = 
function(html, idx) {
	this._folderTreeCellId = Dwt.getNextId();

	html[idx++] = "<tr><td class='Label' colspan=2>";
	html[idx++] = ZmMsg.newFolderParent;
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='";
	html[idx++] = this._folderTreeCellId;
	html[idx++] = "'/></tr>";

	return idx;
};

// setup dwt controls

ZmNewOrganizerDialog.prototype._setupControls =
function() {
	this._setupStandardControls();
DBG.timePt("setup content");
	this._setupExtraControls();
DBG.timePt("set overview");
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
	this._colorSelect = new DwtSelect({parent:this});
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var choice = ZmOrganizer.COLOR_CHOICES[i];
		this._colorSelect.addOption(choice.label, i == 0, choice.value);
	}
	var colorTd = document.getElementById(this._colorSelectId);
	if (colorTd) {
		colorTd.appendChild(this._colorSelect.getHtmlElement());
	}
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
		Dwt.setHandler(this._remoteCheckboxField, DwtEvent.ONCLICK, this._handleCheckbox);
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
	var folderTree = appCtxt.getFolderTree();
	var syncIssuesFolder = folderTree ? folderTree.getByName(ZmFolder.SYNC_ISSUES) : null;
	if (syncIssuesFolder) {
		this._omit[syncIssuesFolder.id] = true;
	}
	this._omit[ZmOrganizer.ID_MY_CARD] = true;
};

// other

ZmNewOrganizerDialog.prototype._renderOverview =
function(overview, treeIds, omit, noRootSelect) {
	this._setupFolderControl();	// reset in case we changed accounts (family mailbox)
	ZmDialog.prototype._renderOverview.apply(this, arguments);
	this._folderTreeView = overview.getTreeView(this._organizerType);
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
	var parentFolder;
	if (this._folderTreeView) {
		// default to the root if no folder is selected
		parentFolder = this._folderTreeView.getSelected() || appCtxt.getFolderTree().root;
	} else {
		var folderTree = appCtxt.getFolderTree();
		if (folderTree) {
			parentFolder = folderTree.root;
		}
	}

	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmFolder.checkName(name, parentFolder);

	// make sure parent doesn't already have a child by this name
	if (!msg && parentFolder.hasChild(name)) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name]);
	}

	var color = null;
	if (!msg && this._colorSelectId) {
		color = this._colorSelect.getValue();
	}

	var url = null;
	if (!msg && this._remoteCheckboxField) {
		url = this._remoteCheckboxField.checked ? this._urlField.value : null;
		if (url) {
			msg = ZmOrganizer.checkUrl(url);
		}
	}

	return (msg ? this._showError(msg) : {l:parentFolder.id, name:name, color:color, url:url});
};

ZmNewOrganizerDialog.prototype._getTabGroupMembers =
function() {
	var list = [this._nameField];
	if (this._colorSelect) {
		list.push(this._colorSelect);
	}
	return list;
};

// dwt event listeners

ZmNewOrganizerDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmNewOrganizerDialog.prototype._enterListener =
function(ev) {
	var results = this._getFolderData();
	if (results)
		this._runEnterCallback(results);
};


// html event handlers

ZmNewOrganizerDialog.prototype._handleCheckbox =
function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	var urlRow = document.getElementById(target.id+"URLrow");
	var urlField= document.getElementById(target.id+"URLfield");	
	urlRow.style.display = target.checked ? (AjxEnv.isIE ? "block" : "table-row") : "none";
	if (target.checked) {
		urlField.focus();
	}
};
