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
	this.view.findShares();
	this.view.showGrants();
};



ZmSharingView = function(params) {

	params.form = {
		items: [
			{ id: "OWNER", type: "DwtInputField", cols: 40 },
			{ id: "BUTTON", type: "DwtButton", label: "Find Shares", onclick: this._onClick }
		]
	};
	DwtForm.call(this, params);

	this._controller = appCtxt.getSharingController();
	this._controller._sharingView = this;
	this._pageId = params.pageId;
	this._sharesById = {};

	this._initialize();
};

ZmSharingView.prototype = new DwtForm;
ZmSharingView.prototype.constructor = ZmSharingView;

ZmSharingView.prototype.TEMPLATE = "prefs.Pages#Sharing";

ZmSharingView.SHARE = "SHARE";
ZmSharingView.GRANT = "GRANT";

ZmSharingView.F_FOLDER	= "fo";
ZmSharingView.F_GROUP	= "gp";
ZmSharingView.F_ITEM	= "it";
ZmSharingView.F_OWNER	= "ow";
ZmSharingView.F_ROLE	= "ro"
ZmSharingView.F_TYPE	= "ty";
ZmSharingView.F_WITH	= "wi";

ZmSharingView.prototype.toString = function() { return "ZmSharingView"; };

ZmSharingView.prototype.findShares =
function(owner) {

	var type = owner ? ZmSharingController.TYPE_USER : ZmSharingController.TYPE_GROUP;
	var respCallback = new AjxCallback(this, this.showShares, [type]);
	var shares = this._controller.getShares(type, owner, respCallback);
};

ZmSharingView.prototype.showShares =
function(type, shares) {

	var sharesVec = AjxVector.fromArray(shares);
	if (type == ZmSharingController.TYPE_USER) {
		if (this._groupShares && this._groupShares.size()) {
			var newVec = this._groupShares.clone();
			newVec.addList(sharesVec);
			sharesVec = newVec;
		}
	} else {
		this._groupShares = sharesVec;
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

ZmSharingView.acceptLinkCallback =
function(shareId) {

	var ctlr = appCtxt.getSharingController();
	var sharingView = ctlr && ctlr._sharingView;
	var shareInfo = sharingView && sharingView._sharesById[shareId];
	if (shareInfo) {
		AjxDispatcher.require("Share");
		var share = ZmSharingView.createShare(shareInfo);
		var acceptDlg = appCtxt.getAcceptShareDialog();
		acceptDlg.popup(share, shareInfo.ownerName);
	}
};

ZmSharingView.createShare =
function(shareInfo) {

	var share = new ZmShare();

	share.grantee = {granteeName:	shareInfo.granteeName,
					 granteeId:		shareInfo.granteeId,
					 granteeType:	shareInfo.granteeType};

	share.grantor = {email:	shareInfo.ownerName,
			   		 id:	shareInfo.ownerId};

	share.link = {id:	shareInfo.folderId,
			   	  name:	shareInfo.folderPath.substr(shareInfo.folderPath.lastIndexOf("/") + 1),
			   	  view:	shareInfo.view,
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
};

ZmSharingView.prototype._addListView =
function(listView, listViewDivId) {
	var listDiv = document.getElementById(listViewDivId);
 	listDiv.appendChild(listView.getHtmlElement());
	listView.setUI(null, true); // renders headers and empty list
	listView._initialized = true;
};

ZmSharingView.prototype._onClick =
function(ev) {
	this.findShares(this.getValue("OWNER"));
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
		return (groupA > groupB) ? 1 : -1;
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


ZmSharingListView = function(params) {

	this.type = params.type;
	params.headerList = this._getHeaderList();
	DwtListView.call(this, params);

	this.view = params.view;
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
	}

	return headerList;
};

ZmSharingListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {

	if (field == ZmSharingView.F_OWNER) {
		html[idx++] = item.ownerName;
	} else if (field == ZmSharingView.F_WITH) {
		html[idx++] = item.grantee && item.grantee.name;
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
			item.id = Dwt.getNextId();
			this.view._sharesById[item.id] = item;
			html[idx++] = "<a href='javascript:;' onclick='ZmSharingView.acceptLinkCallback(" + '"' + item.id + '"' + ");'>" + ZmMsg.accept + "</a>";
		}
	} else if (field == ZmSharingView.F_GROUP && (item.granteeType == ZmSharingController.TYPE_GROUP)) {
		html[idx++] = item.granteeName;
	}

	return idx;
};
