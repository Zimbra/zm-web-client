/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a request manager.
 * @constructor
 * @class
 * This class manages the sending of requests to the server, and handles the
 * responses, including refresh blocks and notifications.
 *
 * @author Conrad Damon
 * 
 * @param appCtxt		[ZmAppCtxt]		the app context
 * @param controller	[ZmController]	main controller
 * @param domain		[string]		current domain
 */
function ZmRequestMgr(appCtxt, controller, domain) {

	this._appCtxt = appCtxt;
	this._controller = controller;
	
	this._appCtxt.setRequestMgr(this);

	ZmCsfeCommand.setServerUri(location.protocol + "//" + domain + appCtxt.get(ZmSetting.CSFE_SERVER_URI));
	ZmCsfeCommand.clientVersion = appCtxt.get(ZmSetting.CLIENT_VERSION);
	
	this._shell = appCtxt.getShell();

    this._highestNotifySeen = 0;

	this._cancelActionId = {};
	this._pendingRequests = {};

	this._useXml = this._appCtxt.get(ZmSetting.USE_XML);
	this._logRequest = this._appCtxt.get(ZmSetting.LOG_REQUEST);
	this._stdTimeout = this._appCtxt.get(ZmSetting.TIMEOUT);

	this._unreadListener = new AjxListener(this, this._unreadChangeListener);
};

// request states
ZmRequestMgr._SENT		= 1;
ZmRequestMgr._RESPONSE	= 2;
ZmRequestMgr._CANCEL	= 3;

ZmRequestMgr._nextReqId = 1;

ZmRequestMgr.getNextReqId =
function() {
	return "Req_" + ZmRequestMgr._nextReqId++;
};


/**
* Sends a request to the CSFE and processes the response. Notifications and
* refresh blocks that come in the response header are handled. Also handles
* exceptions by default, though the caller can pass in a special callback to
* run for exceptions. The error callback should return true if it has
* handled the exception, and false if standard exception handling should still
* be performed.
*
* @param soapDoc			[AjxSoapDoc]	SOAP document that represents the request
* @param asyncMode			[boolean]*		if true, request will be made asynchronously
* @param callback			[AjxCallback]*	next callback in chain for async request
* @param errorCallback		[AjxCallback]*	callback to run if there is an exception
* @param execFrame			[AjxCallback]*	the calling method, object, and args
* @param timeout			[int]*			timeout value (in seconds)
* @param noBusyOverlay		[boolean]*		if true, don't use the busy overlay
* @param accountName		[string]*		name of account to execute on behalf of
*/
ZmRequestMgr.prototype.sendRequest =
function(params) {
	var reqId = params.reqId = ZmRequestMgr.getNextReqId();
	var timeout = (params.timeout != null) ? params.timeout : this._stdTimeout;
	if (timeout) timeout = timeout * 1000; // convert seconds to ms
	var asyncCallback = params.asyncMode ? new AjxCallback(this, this._handleResponseSendRequest, [params]) : null;
	var command = new ZmCsfeCommand();
	// bug fix #10652 - dont set change token if accountName is specified
	// (since we're executing on someone else's mbox)
	var changeToken = params.accountName ? null : this._changeToken;
	var cmdParams = {soapDoc:params.soapDoc, accountName:params.accountName, useXml:this._useXml,
					 changeToken:changeToken, asyncMode:params.asyncMode, callback:asyncCallback,
					 logRequest:this._logRequest, highestNotifySeen:this._highestNotifySeen };

	DBG.println(AjxDebug.DBG2, "sendRequest(" + reqId + "): " + params.soapDoc._methodEl.nodeName);
	var cancelParams = timeout ? [reqId, params.errorCallback, params.noBusyOverlay] : null;
	if (!params.noBusyOverlay) {
		var cancelCallback = null;
		var showBusyDialog = false;
		if (timeout) {
			DBG.println(AjxDebug.DBG1, "ZmRequestMgr.sendRequest: timeout for " + reqId + " is " + timeout);
			cancelCallback = new AjxCallback(this, this.cancelRequest, cancelParams);
			this._shell.setBusyDialogText(ZmMsg.askCancel);
			showBusyDialog = true;
		}
		// put up busy overlay to block user input
		this._shell.setBusy(true, reqId, showBusyDialog, timeout, cancelCallback);
	} else if (timeout) {
		var action = new AjxTimedAction(this, this.cancelRequest, cancelParams);
		this._cancelActionId[reqId] = AjxTimedAction.scheduleAction(action, timeout);
	}

	this._pendingRequests[reqId] = command;

	try {
		var response = command.invoke(cmdParams);
		command.state = ZmRequestMgr._SENT;
	} catch (ex) {
		this._handleResponseSendRequest(params, new ZmCsfeResult(ex, true));
		return;
	}
	if (params.asyncMode) {
		return reqId;
	} else {
		return this._handleResponseSendRequest(params, response);
	}
};

ZmRequestMgr.prototype._handleResponseSendRequest =
function(params, result) {
	if (!this._pendingRequests[params.reqId]) {
		DBG.println(AjxDebug.DBG2, "ZmRequestMgr.handleResponseSendRequest no pendingRequest entry for " + params.reqId);
		return;
	}
	if (this._pendingRequests[params.reqId].state == ZmRequestMgr._CANCEL) {
		DBG.println(AjxDebug.DBG2, "ZmRequestMgr.handleResponseSendRequest state=CANCEL for " + params.reqId);
		return;
	}

	this._pendingRequests[params.reqId].state = ZmRequestMgr._RESPONSE;

	if (!params.noBusyOverlay) {
		this._shell.setBusy(false, params.reqId); // remove busy overlay
	} else if (params.timeout) {
		AjxTimedAction.cancelAction(this._cancelActionId[params.reqId]);
		this._cancelActionId[params.reqId] = -1;
	}

	var response;
	try {
		if (params.asyncMode) {
			response = result.getResponse(); // may throw exception
		} else {
			// for sync responses, manually throw exception if necessary
			if (result._isException)
				throw result._data;
			else
				response = result;
		}
		this._handleHeader(response.Header);
	} catch (ex) {
		DBG.println(AjxDebug.DBG2, "Request " + params.reqId + " got an exception");
		if (params.errorCallback) {
			var handled = params.errorCallback.run(ex);
			if (!handled) {
				this._controller._handleException(ex, params.execFrame);
			}
		} else {
			this._controller._handleException(ex, params.execFrame);
		}
		var hdr = result.getHeader();
		this._handleHeader(hdr);
		this._handleNotifications(hdr);
		return;
	}

	if (params.asyncMode) {
		result.set(response.Body);
	}

    // if we didn't get an exception, then we should make sure that the
    // poll timer is running (just in case it got an exception and stopped)
    this._controller._kickPolling(true);

	this._clearPendingRequest(params.reqId);

	if (params.asyncMode && params.callback) {
		params.callback.run(result);
	}

	this._handleNotifications(response.Header);

	if (!params.asyncMode) {
		return response.Body;
	}
};

ZmRequestMgr.prototype.cancelRequest =
function(reqId, errorCallback, noBusyOverlay) {
	if (!this._pendingRequests[reqId]) return;
	if (this._pendingRequests[reqId].state == ZmRequestMgr._RESPONSE) return;

	this._pendingRequests[reqId].state = ZmRequestMgr._CANCEL;
	if (!noBusyOverlay) {
		this._shell.setBusy(false, reqId);
	}
	DBG.println(AjxDebug.DBG1, "ZmRequestMgr.cancelRequest: " + reqId);
	this._pendingRequests[reqId].cancel();
	if (errorCallback) {
		var ex = new AjxException("Request canceled", AjxException.CANCELED, "ZmRequestMgr.prototype.cancelRequest");
		errorCallback.run(ex);
	}
	this._clearPendingRequest(reqId);
};

ZmRequestMgr.prototype._clearPendingRequest =
function(reqId) {
	if (this._pendingRequests[reqId]) {
		delete this._pendingRequests[reqId];
	}
};

/**
 * Handles a response's SOAP header, except for notifications. Updates our
 * change token, and processes a <refresh> block if there is one (happens
 * when a new session is created on the server).
 *
 * @param hdr	[object]	a SOAP header
 */
ZmRequestMgr.prototype._handleHeader =
function(hdr) {
	if (!hdr) return;

	// update change token if we got one
	if (hdr && hdr.context && hdr.context.change) {
		this._changeToken = hdr.context.change.token;
	}

	// refresh block causes the overview panel to get updated
	if (hdr && hdr.context && hdr.context.refresh) {
		this._highestNotifySeen = 0;
		this._refreshHandler(hdr.context.refresh);
		this._controller._checkOverviewLayout(false);
	}
};

/**
 * Handles the <notify> block of a response's SOAP header.
 *
 * @param hdr	[object]	a SOAP header
 */
ZmRequestMgr.prototype._handleNotifications =
function(hdr) {
	if (hdr && hdr.context && hdr.context.notify) {
        for(i = 0; i < hdr.context.notify.length; i++) {
        	var notify = hdr.context.notify[i];
        	var seq = notify.seq;
            // BUG?  What if the array isn't in sequence-order?  Could we miss notifications?
            if (notify.seq > this._highestNotifySeen) {
                DBG.println(AjxDebug.DBG1, "Handling notification[" + i + "] seq=" + seq);
                this._highestNotifySeen = seq;
                this._notifyHandler(notify);
            } else {
            	DBG.println(AjxDebug.DBG1, "SKIPPING notification[" + i + "] seq=" + seq + " highestNotifySeen=" + this._highestNotifySeen);
	      	}
    	}
	}
};

// A <refresh> block is returned in a SOAP response any time the session ID has 
// changed. It always happens on the first SOAP command (GetInfoRequest).
// After that, it happens after a session timeout.
ZmRequestMgr.prototype._refreshHandler =
function(refresh) {
	DBG.println(AjxDebug.DBG1, "Handling REFRESH");

	var unread = {};
	this._loadTree(ZmOrganizer.TAG, unread, refresh.tags);
	this._loadTree(ZmOrganizer.FOLDER, unread, refresh.folder[0], "folder");
	this._controller._needOverviewLayout = true;
	
	var inbox = this._appCtxt.getFolderTree().getById(ZmFolder.ID_INBOX);
	if (inbox) {
		this._controller._statusView.setIconVisible(ZmStatusView.ICON_INBOX, inbox.numUnread > 0);
	}

	// XXX: temp, get additional share info (see bug #4434)
	if (refresh.folder) {
		this._getFolderPermissions([ZmOrganizer.CALENDAR, ZmOrganizer.TASKS, ZmOrganizer.NOTEBOOK, ZmOrganizer.ADDRBOOK]);
	}

	// Run any app-requested refresh routines
	this._controller.runAppFunction("refresh", refresh);
};

ZmRequestMgr.prototype._loadTree =
function(type, unread, obj, objType) {
	var isTag = (type == ZmOrganizer.TAG);
	var tree = isTag ? this._appCtxt.getTagTree() : this._appCtxt.getFolderTree();
	if (!tree) {
		tree = isTag ? new ZmTagTree(this._appCtxt) : new ZmFolderTree(this._appCtxt);
	}
	isTag ? this._appCtxt.setTagTree(tree) : this._appCtxt.setFolderTree(tree);
	tree.addChangeListener(this._unreadListener);
	tree.getUnreadHash(unread);
	tree.reset();
	if (isTag) {
		tree.createRoot(); // tag tree root not in the DOM
	}
	tree.loadFromJs(obj, objType);
};

ZmRequestMgr.prototype._getFolderPermissions =
function(items) {
	var needPermArr = [];

	for (var i = 0; i < items.length; i++) {
		this._getItemsWithoutPerms(needPermArr, items[i]);
	}

	// build batch request to get all permissions at once
	if (needPermArr.length > 0) {
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		soapDoc.setMethodAttribute("onerror", "continue");

		var doc = soapDoc.getDoc();
		for (var j = 0; j < needPermArr.length; j++) {
			var folderRequest = soapDoc.set("GetFolderRequest", null, null, "urn:zimbraMail");
			var folderNode = doc.createElement("folder");
			folderNode.setAttribute("l", needPermArr[j]);
			folderRequest.appendChild(folderNode);
		}

		var respCallback = new AjxCallback(this, this._handleResponseGetShares, [items]);
		this._controller().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
	}
};

ZmRequestMgr.prototype._getItemsWithoutPerms =
function(needPermArr, item) {
	var treeData = this._appCtxt.getTree(item);
	var items = (treeData && treeData.root) ? treeData.root.children.getArray()	: null;
	if (!items) { return; }

	for (var i = 0; i < items.length; i++) {
		if (items[i].link && items[i].shares == null)
			needPermArr.push(items[i].id);
	}
};

/*
* Takes care of letting the user know that a linked organizer generated a "no such folder",
* error, giving him a chance to delete it.
*
* @param organizer	[ZmOrganizer]	organizer
* 
*/
ZmRequestMgr.prototype.handleDeleteNoSuchFolder =
function(organizer) {
	var ds = this._appCtxt.getYesNoMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteOrganizerYesCallback, this, [organizer, ds]);
	ds.registerCallback(DwtDialog.NO_BUTTON, this._controller._clearDialog, this, ds);
	var msg = AjxMessageFormat.format(ZmMsg.confirmDeleteMissingFolder, organizer.getName(false, 0, true));
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

// Handles the "Yes" button in the delete organizer dialog.
ZmRequestMgr.prototype._deleteOrganizerYesCallback =
function(organizer, dialog) {
	organizer._delete();
	this._controller._clearDialog(dialog);
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
ZmRequestMgr.prototype._handleNoSuchFolderError =
function(organizerType, zid, rid) {
	var treeData = this._appCtxt.getTree(organizerType);
	var items = treeData && treeData.root
		? treeData.root.children.getArray()
		: null;
	var treeView;

	var handled = false;
	for (var i = 0; i < items.length; i++) {
		if ((items[i].zid == zid) && (items[i].rid == rid)) {
			// Mark that the item is not there any more.
			items[i].noSuchFolder = true;
			
			// Change its appearance in the tree.
			if (!treeView) {
				treeView = this._appCtxt.getOverviewController().getTreeView(ZmZimbraMail._OVERVIEW_ID, organizerType);
			}
			var node = treeView.getTreeItemById(items[i].id);
			node.setText(items[i].getName(true));
			
			// Ask if it should be deleted now.
			this.handleDeleteNoSuchFolder(items[i]);
			handled = true;
		}
	}
	return handled;
};

/*
 * Handles missing links by marking the organizers as not there
 * 
 * @param organizerType		[int]		the type of organizer (constants defined in ZmOrganizer)
 * @param zids				[array]		the zids of the missing folders
 * @param rids				[array]		the rids of the missing folders. rids and zids must have the same length
 * 
 */
ZmRequestMgr.prototype._markNoSuchFolder =
function(organizerType, zids, rids) {
	var treeData = this._appCtxt.getTree(organizerType);
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

/*
 * Handles errors that come back from the GetShares batch request.
 * 
 * @param organizerTypes	[array]		the types of organizer (constants defined in ZmOrganizer)
 * @param batchResp			[object]	the response
 * 
 */
ZmRequestMgr.prototype._handleErrorGetShares =
function(organizerTypes, batchResp) {
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
			for (var type = 0; type < organizerTypes.length; type++) {
				this._markNoSuchFolder(organizerTypes[type], zids, rids);
			}
		}
	}
};

ZmRequestMgr.prototype._handleResponseGetShares =
function(organizerTypes, result) {
	var batchResp = result.getResponse().BatchResponse;
	this._handleErrorGetShares(organizerTypes, batchResp);		
	var resp = batchResp.GetFolderResponse;
	if (resp) {
		for (var i = 0; i < resp.length; i++) {
			var link = resp[i].link ? resp[i].link[0] : null;
			if (link) {
				var tree = this._appCtxt.getFolderTree();
				var share = tree ? tree.getById(link.id) : null;
				if (share) {
					share.setPermissions(link.perm);
				}
			}
		}
	}
};

ZmRequestMgr.prototype._checkUnread =
function(tree, unread) {
	var organizers = [];
	var list = tree.asList();
	for (var i = 0; i < list.length; i++) {
		var organizer = list[i];
		if (organizer.numUnread != unread[organizer.id])
			organizers.push(organizer);
	}
	if (organizers.length) {
		var fields = {};
		fields[ZmOrganizer.F_UNREAD] = true;
		tree._notify(ZmEvent.E_MODIFY, {organizers: organizers, fields: fields});
	}
};

// To handle notifications, we keep track of all the models in use. A model could
// be an item, a list of items, or an organizer tree. Currently we never get an
// organizer by itself.
ZmRequestMgr.prototype._notifyHandler =
function(notify) {
	DBG.println(AjxDebug.DBG2, "Handling NOTIFY");
	this._controller.runAppFunction("preNotify", notify);
	try {
		if (notify.deleted) {
			this._handleDeletes(notify.deleted);
		}
		if (notify.created) {
			this._handleCreates(notify.created);
		}
		if (notify.modified) {
			this._handleModifies(notify.modified);
		}
		this._controller.runAppFunction("postNotify", notify);
	} catch (ex) {
		this._controller._handleException(ex, this._notifyHandler, notify, false);
	}
};

/**
 * A delete notification hands us a list of IDs which could be anything. First, we
 * run any app-requested delete handlers. Any IDs which have been handled by an app will
 * be nulled out. The generic handling here will be applied to the rest - the item is
 * retrieved from the item cache and told it has been deleted.
 *
 * @param deletes	[object]	node containing all 'deleted' notifications
 */
ZmRequestMgr.prototype._handleDeletes =
function(deletes) {
	var ids = deletes.id.split(",");
	this._controller.runAppFunction("deleteNotify", ids);

	for (var i = 0; i < ids.length; i++) {
		if (!ids[i]) { continue; }
		var item = this._appCtxt.cacheGet(ids[i]);
		DBG.println(AjxDebug.DBG2, "ZmRequestMgr: handling delete notif for ID " + ids[i]);
		if (item) {
			item.notifyDelete();
		}
	}
};

/**
 * Create notifications hand us full XML nodes. First, we run any app-requested
 * create handlers, which will mark any create notes that they handle. Remaining
 * creates are handled here.
 * 
 * @param creates	[object]	node containing all 'created' notifications
 */
ZmRequestMgr.prototype._handleCreates =
function(creates) {
	var list = ZmRequestMgr._getObjList(creates);
	this._controller.runAppFunction("createNotify", list);

	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		if (create._handled) { continue; }
		// ignore create notif for item we already have (except tags, which can
		// reuse IDs)
		var name = create._name;
		if (this._appCtxt.cacheGet(create.id) && name != "tag") { continue; }

		DBG.println(AjxDebug.DBG1, "ZmRequestMgr: handling CREATE for node: " + name);
		if (name == "tag") {
			var tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
			tagList.root.notifyCreate(create);
		} else if (name == "folder" || name == "search") {
			var parentId = create.l;
			var parent = this._appCtxt.getFolderTree().getById(parentId);
			if (parent) {
				parent.notifyCreate(create, (name == "search"));
			}
		}
	}
};

/**
 * Change notifications are handled at the item/organizer level. The item or
 * organizer will notify its list/tree, if any.
 * 
 * @param modifies	[object]	node containing all 'modified' notifications
 */
ZmRequestMgr.prototype._handleModifies =
function(modifies) {
	var list = ZmRequestMgr._getObjList(modifies);

	// mark the last "item moved" notify to trigger replenishment (we don't want to
	// replenish after each one)
	var lastMove = null;
	for (var i = 0; i < list.length; i++)
		if (list[i].l) {
			lastMove = i;
		}
	if (lastMove != null) {
		list[lastMove].lastModify = true;
	}
	
	this._controller.runAppFunction("modifyNotify", list);

	for (var i = 0; i < list.length; i++) {
		var mod = list[i];
		if (mod._handled) { continue; }
		DBG.println(AjxDebug.DBG2, "ZmRequestMgr: handling modified notif for ID " + mod.id + ", node type = " + mod._name);
		if (mod._name == "mbx") {
			var setting = this._controller._settings.getSetting(ZmSetting.QUOTA_USED);
			setting.notifyModify(mod);
			continue;
		} else {
			var item = this._appCtxt.cacheGet(mod.id);
			if (item) {
				item.notifyModify(mod);
			}
		}
	}
};

/**
 * Returns a list of objects that have the given parent, flattening child
 * arrays in the process. It also saves each child's name into it.
 *
 * @param parent	[object]	notification subnode
 */
ZmRequestMgr._getObjList =
function(parent) {
	var list = [];
	for (var name in parent) {
		var obj = parent[name];
		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				obj[i]._name = name;
				list.push(obj[i]);
			}
		} else {
			obj._name = name;
			list.push(obj);
		}
	}
	return list;
};

/*
* Changes the browser title if it's a folder or tag whose unread
* count just changed.
*/
ZmRequestMgr.prototype._unreadChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		var organizers = ev.getDetail("organizers");
		var organizer = organizers ? organizers[0] : null;
		var id = organizer ? organizer.id : null;
		if (fields && fields[ZmOrganizer.F_UNREAD]) {
			var search = this._appCtxt.getCurrentSearch();
			if (search && id && (id == search.folderId || id == search.tagId))
				Dwt.setTitle(search.getTitle());
			if (id == ZmFolder.ID_INBOX) {
				this._controller._statusView.setIconVisible(ZmStatusView.ICON_INBOX,  organizer.numUnread > 0);
			}
		}		
	}
};
