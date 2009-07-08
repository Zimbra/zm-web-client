/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
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
 * Creates an empty folder tree.
 * @constructor
 * @class
 * This class represents a tree of folders. It may be typed, in which case
 * the folders are all of that type, or untyped.
 * 
 * @author Conrad Damon
 * 
 * @param type		[constant]*		organizer type
 */
ZmFolderTree = function(type) {
	ZmTree.call(this, type);
};

ZmFolderTree.prototype = new ZmTree;
ZmFolderTree.prototype.constructor = ZmFolderTree;


// Consts
ZmFolderTree.IS_PARSED = {};


// Public Methods

ZmFolderTree.prototype.toString =
function() {
	return "ZmFolderTree";
};

/**
 * Loads the folder or the zimlet tree.
 */
ZmFolderTree.prototype.loadFromJs =
function(rootObj, elementType, accountId) {
	this.root = (elementType == "zimlet")
		? ZmZimlet.createFromJs(null, rootObj, this)
		: ZmFolderTree.createFromJs(null, rootObj, this, elementType, null, accountId);
};

/**
 * Generic function for creating a folder. Handles any organizer type that comes
 * in the folder list.
 * 
 * @param parent		[ZmFolder]		parent folder
 * @param obj			[object]		JSON with folder data
 * @param tree			[ZmFolderTree]	containing tree
 * @param elementType	[string]		type of containing JSON element
 * @param path			[array]			list of path elements
 * @param accountId		[string]*		account ID this folder belongs to
 */
ZmFolderTree.createFromJs =
function(parent, obj, tree, elementType, path, accountId) {
	if (!(obj && obj.id)) { return; }

	var folder;
	if (elementType == "search") {
		var types;
		if (obj.types) {
			var t = obj.types.split(",");
			types = [];
			for (var i = 0; i < t.length; i++) {
				types.push(ZmSearch.TYPE_MAP[t[i]]);
			}
		}
		DBG.println(AjxDebug.DBG2, "Creating SEARCH with id " + obj.id + " and name " + obj.name);
		var params = {
			id: obj.id,
			name: obj.name,
			parent: parent,
			tree: tree,
			numUnread: obj.u,
			query: obj.query,
			types: types,
			sortBy: obj.sortBy,
			accountId: accountId
		};
		folder = new ZmSearchFolder(params);
		ZmFolderTree._fillInFolder(folder, obj, path);
		ZmFolderTree._traverse(folder, obj, tree, (path || []), elementType, accountId);
	} else {
		var type = obj.view ? ZmOrganizer.TYPE[obj.view] : parent ? parent.type : ZmOrganizer.FOLDER;
		if (!type) {
			DBG.println(AjxDebug.DBG1, "No known type for view " + obj.view);
			return;
		}
		if (appCtxt.inStartup && ZmOrganizer.DEFERRABLE[type]) {
			var app = appCtxt.getApp(ZmOrganizer.APP[type]);
			var defParams = {
				type: type,
				parent: parent,
				obj: obj,
				tree: tree,
				path: path,
				elementType: elementType,
				accountId:accountId
			};
			app.addDeferredFolder(defParams);
		} else {
			var pkg = ZmOrganizer.ORG_PACKAGE[type];
			if (pkg) {
				AjxDispatcher.require(pkg);
			}
			folder = ZmFolderTree.createFolder(type, parent, obj, tree, path, elementType, accountId);
			ZmFolderTree._traverse(folder, obj, tree, (path || []), elementType, accountId);
		}
	}

	return folder;
};

ZmFolderTree._traverse =
function(folder, obj, tree, path, elementType, accountId) {

	var isRoot = (folder.nId == ZmOrganizer.ID_ROOT);
	if (obj.folder && obj.folder.length) {
		if (!isRoot) {
			path.push(obj.name);
		}
		for (var i = 0; i < obj.folder.length; i++) {
			var folderObj = obj.folder[i];
			var childFolder = ZmFolderTree.createFromJs(folder, folderObj, tree, (elementType || "folder"), path, accountId);
			if (folder && childFolder) {
				folder.children.add(childFolder);
			}
		}
		if (!isRoot) {
			path.pop();
		}
	}
	
	if (obj.search && obj.search.length) {
		if (!isRoot) {
			path.push(obj.name);
		}
		for (var i = 0; i < obj.search.length; i++) {
			var searchObj = obj.search[i];
			var childSearch = ZmFolderTree.createFromJs(folder, searchObj, tree, "search", path, accountId);
			if (childSearch) {
				folder.children.add(childSearch);
			}
		}
		if (!isRoot) {
			path.pop();
		}
	}

	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			var childFolder = ZmFolderTree.createFromJs(folder, link, tree, "link", path, accountId);
			if (childFolder) {
				folder.children.add(childFolder);
			}
		}
	}
};

ZmFolderTree.createFolder =
function(type, parent, obj, tree, path, elementType, accountId) {
	var orgClass = eval(ZmOrganizer.ORG_CLASS[type]);
	if (!orgClass) { return null; }

	DBG.println(AjxDebug.DBG2, "Creating " + type + " with id " + obj.id + " and name " + obj.name);

	var params = {
		id: 		obj.id,
		name: 		obj.name,
		parent: 	parent,
		tree: 		tree,
		color: 		obj.color,
		owner: 		obj.owner,
		zid: 		obj.zid,
		rid: 		obj.rid,
		restUrl: 	obj.rest,
		url: 		obj.url,
		numUnread: 	obj.u,
		numTotal: 	obj.n,
		sizeTotal: 	obj.s,
		perm: 		obj.perm,
		link: 		elementType == "link",
		accountId:	accountId
	};

	var folder = new orgClass(params);
	ZmFolderTree._fillInFolder(folder, obj, path);
	ZmFolderTree.IS_PARSED[type] = true;

	return folder;
};

ZmFolderTree._fillInFolder =
function(folder, obj, path) {
	if (path && path.length) {
		folder.path = path.join("/");
	}

	if (obj.f && folder._parseFlags) {
		folder._parseFlags(obj.f);
	}

	folder._setSharesFromJs(obj);
};

ZmFolderTree.prototype.getByType =
function(type) {
	return this.root ? this.root.getByType(type) : null;
};

ZmFolderTree.prototype.getByPath =
function(path, useSystemName) {
	return this.root ? this.root.getByPath(path, useSystemName) : null;
};

/*
 * Handles a missing link by marking its organizer as not there, redrawing it in
 * any tree views, and asking to delete it.
 *
 * @param organizerType		[int]		the type of organizer (constants defined in ZmOrganizer)
 * @param zid				[string]	the zid of the missing folder
 * @param rid				[string]	the rid of the missing folder
 *
 */
ZmFolderTree.prototype.handleNoSuchFolderError =
function(organizerType, zid, rid) {
	var items = this.getByType(organizerType);

	var treeView;
	var handled = false;
	if (items) {
		for (var i = 0; i < items.length; i++) {
			if ((items[i].zid == zid) && (items[i].rid == rid)) {
				// Mark that the item is not there any more.
				items[i].noSuchFolder = true;

				// Change its appearance in the tree.
				if (!treeView) {
					var overviewId = appCtxt.getAppController().getOverviewId();
					treeView = appCtxt.getOverviewController().getTreeView(overviewId, organizerType);
				}
				var node = treeView.getTreeItemById(items[i].id);
				node.setText(items[i].getName(true));

				// Ask if it should be deleted now.
				this.handleDeleteNoSuchFolder(items[i]);
				handled = true;
			}
		}
	}
	return handled;
};

/*
* Takes care of letting the user know that a linked organizer generated a "no such folder",
* error, giving him a chance to delete it.
*
* @param organizer	[ZmOrganizer]	organizer
*
*/
ZmFolderTree.prototype.handleDeleteNoSuchFolder =
function(organizer) {
	var ds = appCtxt.getYesNoMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteOrganizerYesCallback, this, [organizer, ds]);
	ds.registerCallback(DwtDialog.NO_BUTTON, appCtxt.getAppController()._clearDialog, this, ds);
	var msg = AjxMessageFormat.format(ZmMsg.confirmDeleteMissingFolder, organizer.getName(false, 0, true));
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

// Handles the "Yes" button in the delete organizer dialog.
ZmFolderTree.prototype._deleteOrganizerYesCallback =
function(organizer, dialog) {
	organizer._delete();
	appCtxt.getAppController()._clearDialog(dialog);
};

// This method is used to retrieve permissions on folders that can be *shared*
/**
 * Issues a BatchRequest of GetFolderRequest's for mountpoints that dont have 
 * permissions set.
 *
 * @param type				[Integer]		ZmItem type constant
 * @param callback			[AjxCallback]*	callback to trigger after fetching permissions
 * @param skipNotify		[Boolean]*		skip notify after fetching permissions
 * @param folderIds			[Array]*		list of folder Id's to fetch permissions for
 * @param noBusyOverlay		[Boolean]*		don't block the UI while fetching permissions
 */
ZmFolderTree.prototype.getPermissions =
function(params) {
	var needPerms = params.folderIds || this._getItemsWithoutPerms(params.type);

	// build batch request to get all permissions at once
	if (needPerms.length > 0) {
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		soapDoc.setMethodAttribute("onerror", "continue");

		var doc = soapDoc.getDoc();
		for (var j = 0; j < needPerms.length; j++) {
			var folderRequest = soapDoc.set("GetFolderRequest", null, null, "urn:zimbraMail");
			var folderNode = doc.createElement("folder");
			folderNode.setAttribute("l", needPerms[j]);
			folderRequest.appendChild(folderNode);
		}

		var respCallback = new AjxCallback(this, this._handleResponseGetShares, [params.callback, params.skipNotify]);
		appCtxt.getRequestMgr().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback, noBusyOverlay:params.noBusyOverlay});
	} else {
		if (params.callback) { params.callback.run(); }
	}
};

ZmFolderTree.prototype._getItemsWithoutPerms =
function(type) {
	var needPerms = [];
	var orgs = type ? [type] : [ZmOrganizer.FOLDER, ZmOrganizer.CALENDAR, ZmOrganizer.TASKS, ZmOrganizer.NOTEBOOK, ZmOrganizer.ADDRBOOK];

	for (var j = 0; j < orgs.length; j++) {
		var org = orgs[j];
		if (!ZmFolderTree.IS_PARSED[org])
			continue;

		var items = this.getByType(org);

		for (var i = 0; i < items.length; i++) {
			if (items[i].link && items[i].shares == null) {
				needPerms.push(items[i].id);
			}
		}
	}

	return needPerms;
};

ZmFolderTree.prototype._handleResponseGetShares =
function(callback, skipNotify, result) {
	var batchResp = result.getResponse().BatchResponse;
	this._handleErrorGetShares(batchResp);

	var resp = batchResp.GetFolderResponse;
	if (resp) {
		for (var i = 0; i < resp.length; i++) {
			var link = resp[i].link ? resp[i].link[0] : null;
			if (link) {
				var mtpt = appCtxt.getById(link.id);
				if (mtpt) {
					var acl = link.acl && link.acl.length && link.acl[0];
					if (acl && acl.grant && acl.grant.length) {
						for (var j = 0; j < acl.grant.length; j++) {
							mtpt.addShare(ZmShare.createFromJs(mtpt, acl.grant[j]));
						}
					}
				}

				if (link.folder && link.folder.length > 0) {
					var parent = appCtxt.getById(link.id);
					if (parent) {
						for (var j = 0; j < link.folder.length; j++)
							parent.notifyCreate(link.folder[j], false, skipNotify);
					}
				}
			}
		}
	}

	if (callback) { callback.run(); }
};

/*
 * Handles errors that come back from the GetShares batch request.
 *
 * @param organizerTypes	[array]		the types of organizer (constants defined in ZmOrganizer)
 * @param batchResp			[object]	the response
 *
 */
ZmFolderTree.prototype._handleErrorGetShares =
function(batchResp) {
	var faults = batchResp.Fault;
	if (faults) {
		var rids = [];
		var zids = [];
		for (var i = 0, length = faults.length; i < length; i++) {
			var ex = ZmCsfeCommand.faultToEx(faults[i]);
			if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
				var itemId = ex.data.itemId[0];
				var index = itemId.lastIndexOf(':');
				zids.push(itemId.substring(0, index));
				rids.push(itemId.substring(index + 1, itemId.length));
			}
		}
		if (zids.length) {
			this._markNoSuchFolder(zids, rids);
		}
	}
};

/*
 * Handles missing links by marking the organizers as not there
 *
 * @param zids				[array]		the zids of the missing folders
 * @param rids				[array]		the rids of the missing folders. rids and zids must have the same length
 *
 */
ZmFolderTree.prototype._markNoSuchFolder =
function(zids, rids) {
	var treeData = appCtxt.getFolderTree();
	var items = treeData && treeData.root
		? treeData.root.children.getArray()
		: null;

	for (var i = 0; i < items.length; i++) {
		for (var j = 0; j < rids.length; j++) {
			if ((items[i].zid == zids[j]) && (items[i].rid == rids[j])) {
				items[i].noSuchFolder = true;
			}
		}
	}
};

ZmFolderTree.prototype._sortFolder =
function(folder) {
	var children = folder.children;
	if (children && children.length) {
		children.sort(ZmFolder.sortCompare);
		for (var i = 0; i < children.length; i++)
			this._sortFolder(children[i]);
	}
};
