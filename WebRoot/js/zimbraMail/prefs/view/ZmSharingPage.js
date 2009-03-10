/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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
 * Creates a preferences page for displaying shares.
 * @constructor
 * @class
 * This class is a ZmPreferencesPage that contains a ZmSharingView, which shows shares
 * in two list views.
 *
 * @author Conrad Damon
 *
 * @param parent			[DwtControl]				the containing widget
 * @param section			[object]					which page we are
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmSharingPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
};

ZmSharingPage.prototype = new ZmPreferencesPage;
ZmSharingPage.prototype.constructor = ZmSharingPage;

ZmSharingPage.prototype.toString =
function () {
    return "ZmSharingPage";
};

//
// ZmPreferencesPage methods
//

ZmSharingPage.prototype._setupCustom =
function(id, setup, value) {

	if (id == ZmSetting.SHARING) {
		var view = this.view = new ZmSharingView({parent:this, pageId:this._htmlElId});
		this.setFormObject(id, view);
		return view;
	};

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmSharingPage.prototype.showMe =
function() {
	ZmPreferencesPage.prototype.showMe.apply(this, arguments);
	if (!this._rendered) {
		this.view.findShares();	// fetch group shares the first time
	}
	this.view.showGrants();
	this._rendered = true;
};


/**
 *
 *
 * @param params	[hash]				hash of params:
 *        parent	[ZmSharingPage]		owning prefs page
 *        pageId	[string]			ID of prefs page's HTML element
 */
ZmSharingView = function(params) {

	params.form = {
		items: [
			{ id: ZmSharingView.ID_OWNER, type: "DwtInputField", cols: 40, validator: this._validateOwner },
			{ id: ZmSharingView.ID_BUTTON, type: "DwtButton", label: "Find Shares", onclick: this._onClick }
		]
	};
	DwtForm.call(this, params);

	this.setScrollStyle(Dwt.VISIBLE);	// so autocomplete list doesn't get clipped
	this._controller = appCtxt.getSharingController();
	this._controller._sharingView = this;
	this._pageId = params.pageId;
	this._sharesByAcceptId = {};
	this._grantsByActionId = {};
	this._shareHash = {};

	this._initialize();
};

ZmSharingView.prototype = new DwtForm;
ZmSharingView.prototype.constructor = ZmSharingView;

ZmSharingView.prototype.TEMPLATE = "prefs.Pages#Sharing";

ZmSharingView.ID_OWNER	= "owner";
ZmSharingView.ID_BUTTON	= "button";

ZmSharingView.SHARE = "SHARE";
ZmSharingView.GRANT = "GRANT";

ZmSharingView.F_ACTIONS	= "ac";
ZmSharingView.F_FOLDER	= "fo";
ZmSharingView.F_GROUP	= "gp";
ZmSharingView.F_ITEM	= "it";
ZmSharingView.F_OWNER	= "ow";
ZmSharingView.F_ROLE	= "ro"
ZmSharingView.F_TYPE	= "ty";
ZmSharingView.F_WITH	= "wi";

ZmSharingView.prototype.toString = function() { return "ZmSharingView"; };

ZmSharingView.prototype.findShares =
function(owner, buttonClicked) {

	var errorMsg;
	if (buttonClicked && !owner) {
		errorMsg = ZmMsg.sharingErrorOwnerMissing;
	} else if (!this.validate(ZmSharingView.ID_OWNER)) {
		errorMsg = ZmMsg.sharingErrorOwnerSelf;
	}
	if (errorMsg) {
		appCtxt.setStatusMsg({msg: errorMsg, level: ZmStatusView.LEVEL_INFO});
		return;
	}

	var type = owner ? ZmShare.TYPE_USER : ZmShare.TYPE_GROUP;
	var respCallback = new AjxCallback(this, this.showShares, [type]);
	var shares = this._controller.getShares(type, owner, respCallback);
};

ZmSharingView.prototype.showShares =
function(type, shares) {

	var sharesVec = AjxVector.fromArray(shares);
	if (type == ZmShare.TYPE_USER) {
		if (this._groupShares && this._groupShares.size()) {
			var newVec = this._groupShares.clone();
			newVec.addList(sharesVec);
			sharesVec = newVec;
		}
	} else {
		this._groupShares = sharesVec.clone();
	}
	sharesVec.sort(ZmSharingView.sortCompareShare);
	this._shareListView.set(sharesVec);
};

ZmSharingView.prototype.showGrants =
function() {

	var shares = [];
	var list = appCtxt.getFolderTree().asList();
	for (var i = 0; i < list.length; i++) {
		var folder = list[i];
		if (folder.shares && folder.shares.length) {
			shares = shares.concat(folder.shares);
		}
	}

	shares.sort(ZmSharingView.sortCompareGrant);
	var sharesVec = AjxVector.fromArray(shares);
	this._grantListView.set(sharesVec);
};

ZmSharingView._handleAcceptLinkc =
function(shareId) {

	var ctlr = appCtxt.getSharingController();
	var sharingView = ctlr && ctlr._sharingView;
	var shareInfo = sharingView && sharingView._sharesByAcceptId[shareId];
	if (shareInfo) {
		var share = ZmSharingView.createShare(shareInfo);
		appCtxt.getAcceptShareDialog().popup(share, shareInfo.ownerEmail);
	}
	return false;
};

ZmSharingView._handleShareAction =
function(shareId, handler) {

	var ctlr = appCtxt.getSharingController();
	var sharingView = ctlr && ctlr._sharingView;
	var share = sharingView && sharingView._grantsByActionId[shareId];
	if (share) {
		var dlg = appCtxt.getFolderPropsDialog();
		return dlg[handler](null, share);
	}
};

ZmSharingView.createShare =
function(shareInfo) {

	var share = new ZmShare();

	share.grantee = {granteeName:	shareInfo.granteeName,
					 granteeId:		shareInfo.granteeId,
					 granteeType:	shareInfo.granteeType};

	share.grantor = {email:	shareInfo.ownerEmail,
					 name:	shareInfo.ownerName,
			   		 id:	shareInfo.ownerId};

	share.link = {id:	shareInfo.folderId,
			   	  name:	shareInfo.folderPath.substr(shareInfo.folderPath.lastIndexOf("/") + 1),
			   	  view:	shareInfo.view || "message",
				  perm:	shareInfo.rights};

	share.action	= "new";
	share.version	= "0.1";

	return share;
};

ZmSharingView.prototype._initialize =
function() {
	this._shareListView = new ZmSharingListView({parent:this, type:ZmSharingView.SHARE, view:this});
	this._addListView(this._shareListView, this._pageId + "_SHARING_sharesWith");
	this._grantListView = new ZmSharingListView({parent:this, type:ZmSharingView.GRANT, view:this});
	this._addListView(this._grantListView, this._pageId + "_SHARING_sharesBy");

	// create auto-completer
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			parent: this,
			dataClass:		appCtxt.getAutocompleter(),
			matchValue:		ZmAutocomplete.AC_VALUE_EMAIL,
			separator:		"",
			locCallback:	(new AjxCallback(this, this._getAcLocation, [this]))
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
		var inputCtrl = this.getControl(ZmSharingView.ID_OWNER);
		this._acAddrSelectList.handle(inputCtrl.getInputElement());
		var inputContainer = document.getElementById(this._htmlElId + "_OWNER");
		if (inputContainer) {
			var inputCtrlDiv = inputCtrl.getHtmlElement();
			inputCtrlDiv.parentNode.removeChild(inputCtrlDiv);
			inputContainer.appendChild(inputCtrlDiv);
		}
	}

	appCtxt.getFolderTree().addChangeListener(new AjxListener(this, this._folderTreeChangeListener));
};

ZmSharingView.prototype._addListView =
function(listView, listViewDivId) {
	var listDiv = document.getElementById(listViewDivId);
 	listDiv.appendChild(listView.getHtmlElement());
	listView.setUI(null, true); // renders headers and empty list
	listView._initialized = true;
};

// make sure user is not looking for folders shared from their account
ZmSharingView.prototype._validateOwner =
function(value) {

	if (!value) { return true; }

	if (appCtxt.isMyAddress(value, true)) {
		return false;
	}

	return true;
};

ZmSharingView.prototype._onClick =
function(ev) {
	this.findShares(this.getValue(ZmSharingView.ID_OWNER), true);
};

ZmSharingView.prototype._getAcLocation =
function(cv, ev) {

	var location = Dwt.toWindow(ev.element, 0, 0, document.getElementById(this._pageId));
	var size = Dwt.getSize(ev.element);
	return new DwtPoint((location.x), (location.y + size.y));
};

/**
 * Sorts folders shared with me in the following order:
 *   1. ones I have not mounted
 *   2. by name of owner
 *   3. by name of group it was shared with, if any
 *   4. by path of shared folder
 */
ZmSharingView.sortCompareShare =
function(a, b) {

	var isMountedA = (a.mid != null);
	var isMountedB = (b.mid != null);
	if (isMountedA != isMountedB) {
		return isMountedA ? 1 : -1;
	}

	var ownerA = (a.ownerName && a.ownerName.toLowerCase()) || "";
	var ownerB = (b.ownerName && b.ownerName.toLowerCase()) || "";
	if (ownerA != ownerB) {
		return (ownerA > ownerB) ? 1 : -1;
	}

	var groupA = (a.granteeName && a.granteeName.toLowerCase()) || "";
	var groupB = (b.granteeName && b.granteeName.toLowerCase()) || "";
	if (groupA != groupB) {
		if (!groupA && groupB) {
			return 1;
		} else if (groupA && !groupB) {
			return -1;
		} else {
			return (groupA > groupB) ? 1 : -1;
		}
	}

	var pathA = (a.folderPath && a.folderPath.toLowerCase()) || "";
	var pathB = (b.folderPath && b.folderPath.toLowerCase()) || "";
	if (pathA != pathB) {
		return (pathA > pathB) ? 1 : -1;
	}

	return 0;
};

/**
 * Sorts folders shared by me in the following order:
 *   1. by name of who it was shared with
 *   2. by path of shared folder
 */
ZmSharingView.sortCompareGrant =
function(a, b) {

	var granteeA = (a.grantee && a.grantee.name && a.grantee.name.toLowerCase()) || "";
	var granteeB = (b.grantee && b.grantee.name && b.grantee.name.toLowerCase()) || "";
	if (granteeA != granteeB) {
		return (granteeA > granteeB) ? 1 : -1;
	}

	var pathA = (a.object && a.object.getPath()) || "";
	var pathB = (b.object && b.object.getPath()) || "";
	if (pathA != pathB) {
		return (pathA > pathB) ? 1 : -1;
	}

	return 0;
};

/**
 * Returns a key for a share or a grant. The key combines the owner's account ID and
 * the folder ID.
 */
ZmSharingView.getKey =
function(item) {
	var acct = item.ownerId || (item.grantee && item.grantee.id) || item.zid;
	var folderId = item.folderId || (item.object && item.object.id) || item.rid;
	return [acct, folderId].join(":");
};

ZmSharingView.prototype._folderTreeChangeListener =
function(ev) {

	this._shareListView._changeListener(ev);
	this._grantListView._changeListener(ev);

	var organizers = ev.getDetail("organizers");
	if (ev.event == ZmEvent.E_CREATE) {
		var link = organizers[0];
		var key = ZmSharingView.getKey(link);
		var share = this._shareHash[key];
		if (share && share.granteeType == ZmShare.TYPE_GROUP) {
			share.folderPath = link.getPath(true);
		}
	}
};



/**
 * A list view that displays some form of shares, either with or by the user.
 *
 * @param params	[hash]			hash of params:
 *        type		[constant]		SHARE (shared with user) or GRANT (shared by user)
 */
ZmSharingListView = function(params) {

	this.type = params.type;
	params.headerList = this._getHeaderList();
	DwtListView.call(this, params);

	this.view = params.view;
	this._idMap = {};
};

ZmSharingListView.prototype = new DwtListView;
ZmSharingListView.prototype.constructor = ZmSharingListView;

ZmSharingListView.prototype._getHeaderList =
function() {

	var headerList = [];
	if (this.type == ZmSharingView.SHARE) {
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_OWNER, text:ZmMsg.sharingOwner, width:180}));
	} else if (this.type == ZmSharingView.GRANT) {
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_WITH, text:ZmMsg.sharingWith, width:180}));
	}
	headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_ITEM, text:ZmMsg.sharingItem}));
	headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_TYPE, text:ZmMsg.sharingFolderType, width:60}));
	headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_ROLE, text:ZmMsg.sharingRole, width:50}));
	if (this.type == ZmSharingView.SHARE) {
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_FOLDER, text:ZmMsg.sharingFolder, width:150}));
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_GROUP, text:ZmMsg.sharingGroup, width:180}));
	} else {
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_ACTIONS, text:ZmMsg.actions, width:120}));
	}

	return headerList;
};

ZmSharingListView.prototype._getRowId =
function(item, params) {

	var key = ZmSharingView.getKey(item);
	var id = this._idMap[key];
	if (!id) {
		id = Dwt.getNextId();
		this._idMap[key] = id;
		this.view._shareHash[key] = item;
	}

	return id;
};

ZmSharingListView.prototype._getCellId =
function(item, field, params) {

	if (field == ZmSharingView.F_FOLDER) {
		var rowId = this._getRowId(item, params);
		return [rowId, field].join("_");
	} else {
		return null;
	}
};

ZmSharingListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {

	if (field == ZmSharingView.F_OWNER) {
		html[idx++] = item.ownerName;
	} else if (field == ZmSharingView.F_WITH) {
		html[idx++] = (item.grantee.type == ZmShare.TYPE_GUEST) ? item.grantee.id : item.grantee.name;
	} else if (field == ZmSharingView.F_ITEM) {
		html[idx++] = (this.type == ZmSharingView.SHARE) ? item.folderPath : item.object.getPath();
	} else if (field == ZmSharingView.F_TYPE) {
		html[idx++] = (this.type == ZmSharingView.SHARE) ? ZmShare._getFolderType(item.view) : ZmMsg[ZmOrganizer.FOLDER_KEY[item.object.type]];
	} else if (field == ZmSharingView.F_ROLE) {
		var role = (this.type == ZmSharingView.SHARE) ? ZmShare._getRoleFromPerm(item.rights) : item.link.role;
		html[idx++] = ZmShare.getRoleName(role);
	} else if (field == ZmSharingView.F_FOLDER) {
		var link = item.mid && appCtxt.getById(item.mid);
		var linkName = link && link.getPath();
		if (linkName) {
			html[idx++] = linkName;
		} else {
			var id = Dwt.getNextId();
			this.view._sharesByAcceptId[id] = item;
			html[idx++] = "<a href='javascript:;' onclick='ZmSharingView._handleAcceptLink(" + '"' + id + '"' + ");'>" + ZmMsg.accept + "</a>";
		}
	} else if (field == ZmSharingView.F_GROUP && (item.granteeType == ZmShare.TYPE_GROUP)) {
		html[idx++] = item.granteeName;
	} else if (field == ZmSharingView.F_ACTIONS) {
		idx = this._addActionLinks(item, html, idx);
	}

	return idx;
};

ZmSharingListView.prototype._changeListener =
function(ev) {

	var organizers = ev.getDetail("organizers");
	if (this.type == ZmSharingView.SHARE) {
		if (ev.event == ZmEvent.E_CREATE) {
			var link = organizers[0];
			var key = [link.zid, link.rid].join(":");
			var row = document.getElementById(this._idMap[key]);
			if (row) {
				var cellId = this._getCellId(link, ZmSharingView.F_FOLDER);
				var cell = document.getElementById(cellId);
				if (cell) {
					cell.innerHTML = link.getPath();
				}
			}
		}
	}
};

/**
 * 
 */
ZmSharingListView.prototype._addActionLinks =
function(share, html, idx) {

	var type = share.grantee.type;
	if (type == ZmShare.TYPE_ALL || type == ZmShare.TYPE_DOMAIN || !share.link.role) {
		return ZmMsg.configureWithAdmin;
	}

	var actions = ["edit", "revoke", "resend"];
	var handlers = ["_handleEditShare", "_handleRevokeShare", "_handleResendShare"]; // handlers in ZmFolderPropsDialog

	for (var i = 0; i < actions.length; i++) {

		var action = actions[i];

		// public shares have no editable fields, and sent no mail
		if (share.isPublic() &&	(action == "edit" || action == "resend")) {	continue; }

		var id = Dwt.getNextId();
		this.view._grantsByActionId[id] = share;
		var handler = 
		html[idx++] = "<a href='javascript:;' onclick='ZmSharingView._handleShareAction(" + '"' + id + '", "' + handlers[i] + '"' + ");'>" + ZmMsg[action] + "</a> ";
	}

	return idx;
};
