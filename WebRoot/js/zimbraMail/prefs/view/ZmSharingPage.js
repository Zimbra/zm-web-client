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

ZmSharingPage.prototype.showMe =
function() {
	ZmPreferencesPage.prototype.showMe.apply(this, arguments);
	if (!this._rendered) {
		this.view = new ZmSharingView({parent:this, pageId:this._htmlElId});
		this.view.findShares();
		this.view.showGrants();
		this._rendered = true;
	}
};

ZmSharingPage.prototype.getShares =
function(type, owner, callback) {

	var jsonObj = {GetShareInfoRequest:{_jsns:"urn:zimbraAccount"}};
	var request = jsonObj.GetShareInfoRequest;
	if (type && type != ZmShare.TYPE_ALL) {
		request.grantee = {type:type};
	}
	if (owner) {
		request.owner = {by:"name", _content:owner};
	}
	var respCallback = new AjxCallback(this, this._handleGetSharesResponse, [callback]);
	appCtxt.getAppController().sendRequest({jsonObj:	jsonObj,
											asyncMode:	true,
											callback:	respCallback});
};

ZmSharingPage.prototype._handleGetSharesResponse =
function(callback, result) {

	var resp = result.getResponse().GetShareInfoResponse;
	if (callback) {
		callback.run(resp.share);
	}
};


/**
 * Creates a sharing view.
 * @constructor
 * @class
 * <p>Manages a view composed of two sections. The first section is for showing information about
 * folders shared with the user. The user can look for shares that came via their membership in
 * a distribution list, or shares directly from a particular user. The shares are displayed in two
 * lists: one for shares that have not been accepted, and one for shares that have been accepted,
 * which have mountpoints.</p>
 * <p>
 * Internally, shares are standardized into ZmShare objects, with a few additional fields. Shares
 * are converted into those from several different forms: share info JSON from GetShareInfoResponse,
 * ZmShare's on folders that have been shared by the user, and folders that have been mounted by the
 * user.
 *
 * @param params	[hash]				hash of params:
 *        parent	[ZmSharingPage]		owning prefs page
 *        pageId	[string]			ID of prefs page's HTML element
 */
ZmSharingView = function(params) {

	DwtComposite.apply(this, arguments);

//	this._controller = appCtxt.getSharingController();
//	this._controller._sharingView = this;
	this._pageId = params.pageId;
	this._sharesByAcceptId = {};
	this._grantsByActionId = {};
	this._shareByKey = {};
	this._shareByDomId = {};

	this._initialize();
};

ZmSharingView.prototype = new DwtComposite;
ZmSharingView.prototype.constructor = ZmSharingView;

ZmSharingView.ID_RADIO			= "radio";
ZmSharingView.ID_GROUP			= "group";
ZmSharingView.ID_USER			= "user";
ZmSharingView.ID_OWNER			= "owner";
ZmSharingView.ID_FIND_BUTTON	= "findButton";
ZmSharingView.ID_FOLDER_TYPE	= "folderType";
ZmSharingView.ID_SHARE_BUTTON	= "shareButton";

ZmSharingView.SHARE = "SHARE";
ZmSharingView.GRANT = "GRANT";

ZmSharingView.PENDING	= "PENDING";
ZmSharingView.MOUNTED	= "MOUNTED";

ZmSharingView.F_ACTIONS	= "ac";
ZmSharingView.F_FOLDER	= "fo";
ZmSharingView.F_GROUP	= "gp";
ZmSharingView.F_ITEM	= "it";
ZmSharingView.F_OWNER	= "ow";
ZmSharingView.F_ROLE	= "ro"
ZmSharingView.F_TYPE	= "ty";
ZmSharingView.F_WITH	= "wi";

ZmSharingView.prototype.toString = function() { return "ZmSharingView"; };

/**
 * Makes a request to the server for group shares or shares from a particular user.
 *
 * @param owner					[string]*		address of account to check for shares from
 * @param userButtonClicked		[boolean]*		if true, user pressed "Find Shares" button
 */
ZmSharingView.prototype.findShares =
function(owner, userButtonClicked) {

	var errorMsg;
	// check if button was actually clicked, since missing owner is fine when form
	// goes through rote validation on display
	if (userButtonClicked && !owner) {
		errorMsg = ZmMsg.sharingErrorOwnerMissing;
	} else if (!this._shareForm.validate(ZmSharingView.ID_OWNER)) {
		errorMsg = ZmMsg.sharingErrorOwnerSelf;
	}
	if (errorMsg) {
		appCtxt.setStatusMsg({msg: errorMsg, level: ZmStatusView.LEVEL_INFO});
		return;
	}

	var respCallback = new AjxCallback(this, this.showShares);
	var type = owner ? ZmShare.TYPE_USER : ZmShare.TYPE_GROUP;
	var shares = this.parent.getShares(type, owner, respCallback);
};

/**
 * Displays shares in two list views. One shows shares that are pending (have not yet been
 * mounted), and the other shows accepted (mounted) shares.
 *
 * @param shares	[array]		list of JSON share info objects from GetShareInfoResponse	
 */
ZmSharingView.prototype.showShares =
function(shares) {

	var pending = [], mounted = [];
	for (var i = 0; i < shares.length; i++) {
		// convert share info to ZmShare
		var share = ZmSharingView.getShareFromShareInfo(shares[i]);
		if (share.mounted) {
			mounted.push(share);
		} else {
			pending.push(share);
		}
	}
	pending.sort(ZmSharingView.sortCompareShare);
	mounted.sort(ZmSharingView.sortCompareShare);
	this._pendingShareListView.set(AjxVector.fromArray(pending));
	this._mountedShareListView.set(AjxVector.fromArray(mounted));
};

/**
 * Displays grants (folders shared by the user) in a list view. The grants are culled from
 * the folder information in a <refresh> block. Grants will show up in <acl> objects, and
 * are converted into ZmShare objects.
 */
ZmSharingView.prototype.showGrants =
function() {

	var shares = [];
	var list = appCtxt.getFolderTree().asList();
	for (var i = 0; i < list.length; i++) {
		var folder = list[i];
		if (folder.shares && folder.shares.length) {
			for (var j = 0; j < folder.shares.length; j++) {
				shares.push(ZmSharingView.getShareFromGrant(folder.shares[j]));
			}
		}
	}

	shares.sort(ZmSharingView.sortCompareGrant);
	this._grantListView.set(AjxVector.fromArray(shares));
};

ZmSharingView._handleAcceptLink =
function(domId) {

	var sharingView = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView().getView("SHARING").view;
	var share = sharingView._shareByDomId[domId];
	if (share) {
		appCtxt.getAcceptShareDialog().popup(share, share.grantor.email);
	}
	return false;
};

ZmSharingView._handleShareAction =
function(domId, handler) {

	var sharingView = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController().getPrefsView().getView("SHARING").view;
	var share = sharingView._shareByDomId[domId];
	if (share) {
		var dlg = appCtxt.getFolderPropsDialog();
		return dlg[handler](null, share);
	}
};

/**
 * Creates or updates a ZmShare from share info that comes in JSON form from
 * GetShareInfoResponse.
 *
 * @param shareInfo	[object]		JSON representing share info
 * @param share		[ZmShare]*		share to update
 */
ZmSharingView.getShareFromShareInfo =
function(shareInfo, share) {

	var share = share || new ZmShare();

	// grantee is the user, or a group they belong to
	share.grantee = share.grantee || {};
	if (shareInfo.granteeName)	{ share.grantee.name	= shareInfo.granteeName; }
	if (shareInfo.granteeId)	{ share.grantee.id		= shareInfo.granteeId; }
	if (shareInfo.granteeType)	{ share.grantee.type	= shareInfo.granteeType; }

	// grantor is the owner of the shared folder
	share.grantor = share.grantor || {};
	if (shareInfo.ownerEmail)	{ share.grantor.email	= shareInfo.ownerEmail; }
	if (shareInfo.ownerName)	{ share.grantor.name	= shareInfo.ownerName; }
	if (shareInfo.ownerId)		{ share.grantor.id		= shareInfo.ownerId; }

	// link is the shared folder
	share.link = share.link || {};
	share.link.view	= shareInfo.view || "message";
	if (shareInfo.folderId)		{ share.link.id		= shareInfo.folderId; }
	if (shareInfo.folderPath)	{ share.link.path	= shareInfo.folderPath; }
	if (shareInfo.folderPath)	{ share.link.name	= shareInfo.folderPath.substr(shareInfo.folderPath.lastIndexOf("/") + 1); }
	if (shareInfo.rights)		{ share.link.perm	= shareInfo.rights; }

	// mountpoint is the local folder, if the share has been accepted and mounted
	if (shareInfo.mid) {
		share.mounted		= true;
		share.mountpoint	= share.mountpoint || {};
		share.mountpoint.id	= shareInfo.mid;
		var mtpt = appCtxt.getById(share.mountpoint.id);
		if (mtpt) {
			share.mountpoint.name = mtpt.getName();
			share.mountpoint.path = mtpt.getPath();
		}
	}

	share.action	= "new";
	share.version	= "0.1";

	share.type = ZmSharingView.SHARE;

	return share;
};

/**
 * Creates or updates a ZmShare from a ZmOrganizer that's a mountpoint. The grantee is
 * the current user.
 *
 * @param link		[ZmFolder]		mountpoint
 * @param share		[ZmShare]*		share to update
 */
ZmSharingView.getShareFromLink =
function(link, share) {

	var share = share || new ZmShare();

	// grantor is the owner of the shared folder
	share.grantor = share.grantor || {};
	if (link.owner)	{ share.grantor.email	= link.owner; }
	if (link.zid)	{ share.grantor.id		= link.zid; }

	// link is the shared folder
	share.link = share.link || {};
	share.link.view	= link.view || "message";
	if (link.rid)	{ share.link.id		= link.rid; }
	if (link.name)	{ share.link.name	= link.name; }
	if (link.perm)	{ share.link.perm	= link.perm; }

	// mountpoint is the local folder
	share.mounted = true;
	share.mountpoint = share.mountpoint || {};
	share.mountpoint.id		= link.id;
	share.mountpoint.name	= link.getName();
	share.mountpoint.path	= link.getPath();

	share.action	= "new";
	share.version	= "0.1";

	share.type = ZmSharingView.SHARE;

	return share;
};

/**
 * Updates a ZmShare that represents a grant, massaging into the format we use.
 *
 * @param share		[ZmShare]		share to update
 */
ZmSharingView.getShareFromGrant =
function(share, oldShare) {

	share.link = share.link || {};
	share.link.id	= share.object && (share.object.nId || share.object.id);
	share.link.path = share.object.getPath();
	share.link.name = share.object.getName();

	share.type = ZmSharingView.GRANT;
	share.domId = oldShare && oldShare.domId;

	return share;
};

ZmSharingView.prototype._initialize =
function() {

	// form for finding shares
	var params = {};
	params.parent = this;
	params.template = "prefs.Pages#ShareForm";
	params.form = {
		items: [
			{ id: ZmSharingView.ID_RADIO, type: "DwtRadioButtonGroup", onclick: this._onClick, items: [
				{ id: ZmSharingView.ID_GROUP, type: "DwtRadioButton", value: ZmSharingView.ID_GROUP, label: ZmMsg.showGroupShares, checked: true },
				{ id: ZmSharingView.ID_USER, type: "DwtRadioButton", value: ZmSharingView.ID_USER, label: ZmMsg.showUserShares }]},
			{ id: ZmSharingView.ID_OWNER, type: "DwtInputField", cols: 40, validator: this._validateOwner },
			{ id: ZmSharingView.ID_FIND_BUTTON, type: "DwtButton", label: ZmMsg.findShares, onclick: this._onClick }
		]
	};
	this._shareForm = new DwtForm(params);
	this._shareForm.setScrollStyle(Dwt.VISIBLE);	// so autocomplete list doesn't get clipped
	var shareFormDiv = document.getElementById(this._pageId + "_shareForm");
	shareFormDiv.appendChild(this._shareForm.getHtmlElement());

	// form for creating a new share
	var options = [];
	var orgTypes = [ZmOrganizer.FOLDER, ZmOrganizer.CALENDAR, ZmOrganizer.ADDRBOOK, ZmOrganizer.NOTEBOOK,
					ZmOrganizer.TASKS, ZmOrganizer.BRIEFCASE];
	var orgKey = {};
	orgKey[ZmOrganizer.FOLDER]		= "mailFolder";
	orgKey[ZmOrganizer.TASKS]		= "tasksFolder";
	orgKey[ZmOrganizer.BRIEFCASE]	= "briefcase";
	for (var i = 0; i < orgTypes.length; i++) {
		var orgType = orgTypes[i];
		if (orgType) {
			var key = orgKey[orgType] || ZmOrganizer.MSG_KEY[orgType];
			options.push({id: orgType, value: orgType, label: ZmMsg[key]});
		}
	}
	params.template = "prefs.Pages#GrantForm";
	params.form = {
		items: [
			{ id: ZmSharingView.ID_FOLDER_TYPE, type: "DwtSelect", items: options},
			{ id: ZmSharingView.ID_SHARE_BUTTON, type: "DwtButton", label: ZmMsg.share, onclick: this._onClick }
		]
	};
	this._grantForm = new DwtForm(params);
	var grantFormDiv = document.getElementById(this._pageId + "_grantForm");
	grantFormDiv.appendChild(this._grantForm.getHtmlElement());

	// list views of shares and grants
	this._pendingShareListView = new ZmSharingListView({parent:this, type:ZmSharingView.SHARE, status:ZmSharingView.PENDING, view:this});
	this._addListView(this._pendingShareListView, this._pageId + "_pendingShares");
	this._mountedShareListView = new ZmSharingListView({parent:this, type:ZmSharingView.SHARE, status:ZmSharingView.MOUNTED, view:this});
	this._addListView(this._mountedShareListView, this._pageId + "_mountedShares");
	this._grantListView = new ZmSharingListView({parent:this, type:ZmSharingView.GRANT, view:this});
	this._addListView(this._grantListView, this._pageId + "_sharesBy");

	// autocomplete
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			parent: this,
			dataClass:		appCtxt.getAutocompleter(),
			matchValue:		ZmAutocomplete.AC_VALUE_EMAIL,
			separator:		"",
			locCallback:	(new AjxCallback(this, this._getAcLocation, [this]))
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
		var inputCtrl = this._shareForm.getControl(ZmSharingView.ID_OWNER);
		this._acAddrSelectList.handle(inputCtrl.getInputElement());
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

// Note that in the handler call, "this" is set to the form
ZmSharingView.prototype._onClick =
function(id) {

	if (id == ZmSharingView.ID_FIND_BUTTON) {
		this.setValue(ZmSharingView.ID_USER, true);
		this.parent.findShares(this.getValue(ZmSharingView.ID_OWNER), true);
	} else if (id == ZmSharingView.ID_GROUP) {
		this.parent.findShares();
	} else if (id == ZmSharingView.ID_SHARE_BUTTON) {
		var orgType = this.getValue(ZmSharingView.ID_FOLDER_TYPE);
		this.parent._showChooser(orgType);
	}
};

ZmSharingView.prototype._getAcLocation =
function(cv, ev) {

	var location = Dwt.toWindow(ev.element, 0, 0, document.getElementById(this._pageId));
	var size = Dwt.getSize(ev.element);
	return new DwtPoint((location.x), (location.y + size.y));
};

ZmSharingView.prototype._showChooser =
function(orgType) {

	var dialog = appCtxt.getChooseFolderDialog();
	var params = {treeIds: 			[orgType],
				  overviewId:		["ZmSharingView", orgType].join("_"),
				  title:			ZmMsg.chooseFolder,
				  skipReadOnly:		true,
				  hideNewButton:	true,
				  noRootSelect:		true};
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._folderSelectionCallback, this, [dialog]);
	dialog.popup(params);
};

ZmSharingView.prototype._folderSelectionCallback =
function(chooserDialog, org) {

	chooserDialog.popdown();
	var shareDialog = appCtxt.getSharePropsDialog();
	shareDialog.popup(ZmSharePropsDialog.NEW, org);
};

/**
 * Sorts shares in the following order:
 *   1. by name of owner
 *   2. by name of group it was shared with, if any
 *   3. by path of shared folder
 */
ZmSharingView.sortCompareShare =
function(a, b) {

	var ownerA = (a.grantor.name && a.grantor.name.toLowerCase()) || (a.grantor.email && a.grantor.email.toLowerCase()) || "";
	var ownerB = (b.grantor.name && b.grantor.name.toLowerCase()) || (b.grantor.email && b.grantor.email.toLowerCase()) || "";
	if (ownerA != ownerB) {
		return (ownerA > ownerB) ? 1 : -1;
	}

	var groupA = (a.grantee.type == ZmShare.TYPE_GROUP) ? (a.grantee.name && a.grantee.name.toLowerCase()) : "";
	var groupB = (b.grantee.type == ZmShare.TYPE_GROUP) ? (b.grantee.name && b.grantee.name.toLowerCase()) : "";
	if (groupA != groupB) {
		if (!groupA && groupB) {
			return 1;
		} else if (groupA && !groupB) {
			return -1;
		} else {
			return (groupA > groupB) ? 1 : -1;
		}
	}

	var pathA = (a.link.name && a.link.name.toLowerCase()) || "";
	var pathB = (b.link.name && b.link.name.toLowerCase()) || "";
	if (pathA != pathB) {
		return (pathA > pathB) ? 1 : -1;
	}

	return 0;
};

/**
 * Sorts shares in the following order:
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

	var pathA = (a.link && a.link.name) || "";
	var pathB = (b.link && b.link.name) || "";
	if (pathA != pathB) {
		return (pathA > pathB) ? 1 : -1;
	}

	return 0;
};

/**
 * Returns a key for a share or a grant. The key combines the owner's account ID and
 * the folder ID.
 *
 * @param item		[object]		ZmShare, share info (from GetShareInfoResponse), or share JSON obj
 */
/*
ZmSharingView.getKey =
function(item) {
	if (!item) { return ""; }
	var acct = item.ownerId || (item.grantee && item.grantee.id) || item.zid;
	var folderId = item.folderId || (item.object && item.object.id) || item.rid;
	return [acct, folderId].join(":");
};
*/

ZmSharingView.prototype._folderTreeChangeListener =
function(ev) {

	this._pendingShareListView._changeListener(ev);
	this._mountedShareListView._changeListener(ev);
	this._grantListView._changeListener(ev);

/*
	var organizers = ev.getDetail("organizers");
	if (ev.event == ZmEvent.E_CREATE) {
		var link = organizers[0];
		ZmSharingView.getShareFromLink(link);
		var key = ZmSharingView.getKey(link);
		var share = this._shareByKey[key];
		if (share && share.granteeType == ZmShare.TYPE_GROUP) {
			share.folderPath = link.getPath(true);
		}
	}
*/
};


/**
 * A list view that displays some form of shares, either with or by the user. The data
 * is in the form of a list of ZmShare's.
 *
 * @param params	[hash]			hash of params:
 *        type		[constant]		SHARE (shared with user) or GRANT (shared by user)
 *        view		[ZmSharingView]	owning view
 *        status	[constant]		pending or mounted
 */
ZmSharingListView = function(params) {

	this.type = params.type;
	this.status = params.status;
	params.headerList = this._getHeaderList();
	DwtListView.call(this, params);

	this.view = params.view;
	this._idMap = {};
};

ZmSharingListView.prototype = new DwtListView;
ZmSharingListView.prototype.constructor = ZmSharingListView;

ZmSharingListView.prototype.toString = function() { return "ZmSharingListView"; }

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
		if (this.status == ZmSharingView.PENDING) {
			headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_ACTIONS, text:ZmMsg.actions, width:120}));
		} else {
			headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_FOLDER, text:ZmMsg.sharingFolder, width:150}));
		}
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_GROUP, text:ZmMsg.sharingGroup, width:180}));
	} else {
		headerList.push(new DwtListHeaderItem({field:ZmSharingView.F_ACTIONS, text:ZmMsg.actions, width:120}));
	}

	return headerList;
};

ZmSharingListView.prototype._getItemId =
function(item) {

	var account = (item.type == ZmSharingView.SHARE) ? item.grantor && item.grantor.id :
													   item.grantee && item.grantee.id;
	var key = [account, item.link.id].join(":");
	var id = item.domId;
	if (!id) {
		id = Dwt.getNextId();
		item.domId = id;
		this.view._shareByDomId[id] = item;
		this.view._shareByKey[key] = item;
	}

	return id;
};

ZmSharingListView.prototype._getCellId =
function(item, field, params) {

	if (this.type == ZmSharingView.GRANT && field == ZmSharingView.F_ROLE) {
		var rowId = this._getItemId(item);
		return [this._getItemId(item), field].join("_");
	} else {
		return null;
	}
};

ZmSharingListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {

	if (field == ZmSharingView.F_OWNER) {
		html[idx++] = item.grantor.name;
	} else if (field == ZmSharingView.F_WITH) {
		html[idx++] = item.grantee.name || item.grantee.id;
	} else if (field == ZmSharingView.F_ITEM) {
		html[idx++] = item.link.path;
	} else if (field == ZmSharingView.F_TYPE) {
		html[idx++] = ZmShare._getFolderType(item.link.view);
	} else if (field == ZmSharingView.F_ROLE) {
		var role = ZmShare._getRoleFromPerm(item.link.perm);
		html[idx++] = ZmShare.getRoleName(role);
	} else if (field == ZmSharingView.F_FOLDER) {
		html[idx++] = (item.mountpoint && item.mountpoint.path) || "&nbsp;";
	} else if (field == ZmSharingView.F_GROUP && (item.grantee.type == ZmShare.TYPE_GROUP)) {
		html[idx++] = item.grantee.name;
	} else if (field == ZmSharingView.F_ACTIONS) {
		if (this.type == ZmSharingView.SHARE) {
			var id = this._getItemId(item);
			html[idx++] = "<a href='javascript:;' onclick='ZmSharingView._handleAcceptLink(" + '"' + id + '"' + ");'>" + ZmMsg.accept + "</a>";
		} else {
			idx = this._addActionLinks(item, html, idx);
		}
	}

	return idx;
};

ZmSharingListView.prototype._changeListener =
function(ev) {

	var organizers = ev.getDetail("organizers") || [];
	var fields = ev.getDetail("fields");

	if (this.type == ZmSharingView.SHARE) {
		if (ev.event == ZmEvent.E_CREATE) {
			var link = organizers[0];
			var oldShare = this.view._shareByKey[[link.zid, link.rid].join(":")];
			var share = ZmSharingView.getShareFromLink(link, oldShare);
			if (this.status == ZmSharingView.PENDING) {
				this.removeItem(share);
			} else if (this.status == ZmSharingView.MOUNTED) {
//				var index = this._getIndex(shareInfo);
				this.addItem(share, 0, true);
			}
		}
	}

	if (this.type == ZmSharingView.GRANT) {
		if (ev.event == ZmEvent.E_MODIFY && fields[ZmOrganizer.F_SHARES]) {
			for (var i = 0; i < organizers.length; i++) {
				var org = organizers[i];
				var shares = org.shares || [];
				for (var j = 0; j < shares.length; j++) {
					var oldShare = this.view._shareByKey[[shares[j].grantee.id, shares[j].object.id].join(":")];
					var share = ZmSharingView.getShareFromGrant(shares[j], oldShare);
					var div = document.getElementById(share.domId);
					if (div) {
						var cellId = this._getCellId(share, ZmSharingView.F_ROLE);
						var cell = document.getElementById(cellId);
						if (cell) {
							cell.innerHTML = ZmShare.getRoleName(share.link.role);
						}
					}
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

		html[idx++] = "<a href='javascript:;' onclick='ZmSharingView._handleShareAction(" + '"' + share.domId + '", "' + handlers[i] + '"' + ");'>" + ZmMsg[action] + "</a> ";
	}

	return idx;
};
