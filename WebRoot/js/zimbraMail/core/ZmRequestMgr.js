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
 * This file contains the request manager class.
 */

/**
 * Creates a request manager.
 * @class
 * This class manages the sending of requests to the server, and handles the
 * responses, including refresh blocks and notifications.
 *
 * @author Conrad Damon
 * 
 * @param {ZmController}	controller	the main controller
 */
ZmRequestMgr = function(controller) {

	this._controller = controller;
	
	appCtxt.setRequestMgr(this);

	ZmCsfeCommand.setServerUri(appCtxt.get(ZmSetting.CSFE_SERVER_URI));
	var cv = appCtxt.get(ZmSetting.CLIENT_VERSION);
	ZmCsfeCommand.clientVersion = (!cv || cv.indexOf('@') == 0) ? "dev build" : cv;
	
	this._shell = appCtxt.getShell();

    this._highestNotifySeen = 0;

	this._cancelActionId = {};
	this._pendingRequests = {};

	this._useXml = appCtxt.get(ZmSetting.USE_XML);
	this._logRequest = appCtxt.get(ZmSetting.LOG_REQUEST);
	this._stdTimeout = appCtxt.get(ZmSetting.TIMEOUT);

	this._unreadListener = new AjxListener(this, this._unreadChangeListener);
};

ZmRequestMgr.prototype.isZmRequestMgr = true;
ZmRequestMgr.prototype.toString = function() { return "ZmRequestMgr"; };

// request states
ZmRequestMgr._SENT		= 1;
ZmRequestMgr._RESPONSE	= 2;
ZmRequestMgr._CANCEL	= 3;

// retry settings
ZmRequestMgr.RETRY_MAX			= 2;	// number of times to retry before throwing exception
ZmRequestMgr.RETRY_DELAY		= 5;	// seconds to delay between retries
ZmRequestMgr.RETRY_ON_EXCEPTION = {};	// which exceptions to retry on
ZmRequestMgr.RETRY_ON_EXCEPTION[ZmCsfeException.EMPTY_RESPONSE] = true;

ZmRequestMgr._nextReqId = 1;

ZmRequestMgr.OFFLINE_HEAP_DUMP          = "heapdump_upload";
ZmRequestMgr.OFFLINE_MUST_RESYNC        = "resync";
ZmRequestMgr.OFFLINE_MUST_GAL_RESYNC    = "gal_resync";
ZmRequestMgr.OFFLINE_FOLDER_MOVE_FAILED = "foldermove_failed";

// ms to delay after a response to make sure focus is in sync
ZmRequestMgr.FOCUS_CHECK_DELAY = 500;

/**
 * Sends a request to the CSFE and processes the response. Notifications and
 * refresh blocks that come in the response header are handled. Also handles
 * exceptions by default, though the caller can pass in a special callback to
 * run for exceptions. The error callback should return true if it has
 * handled the exception, and false if standard exception handling should still
 * be performed.
 *
 * @param {Hash}		params				a hash of parameters
 * @param {AjxSoapDoc}	soapDoc				the SOAP document that represents the request
 * @param {Object}		jsonObj				the JSON object that represents the request (alternative to soapDoc)
 * @param {Boolean}		asyncMode			if <code>true</code>, request will be made asynchronously
 * @param {AjxCallback}	callback			the next callback in chain for async request
 * @param {AjxCallback}	errorCallback		the callback to run if there is an exception
 * @param {AjxCallback}	continueCallback	the callback to run after user re-auths
 * @param {AjxCallback}	offlineCallback	    the callback to run if the user is offline
 * @param {int}			timeout				the timeout value (in seconds)
 * @param {Boolean}		noBusyOverlay		if <code>true</code>, don't use the busy overlay
 * @param {String}		accountName			the name of account to execute on behalf of
 * @param {Object}		response			the pre-determined response (no request will be made)
 * @param {Boolean}		skipAuthCheck		if <code>true</code>, do not check if auth token has changed
 * @param {constant}	resend				the reason for resending request
 * @param {Boolean}		sensitive			if <code>true</code>, attempt to use secure conn to protect data
 * @param {Boolean}		noSession			if <code>true</code>, no session info is included
 * @param {String}		restUri				the REST URI to send the request to
 * @param {boolean}		emptyResponseOkay	if true, empty or no response from server is not an erro
 * @param {boolean}		offlineRequest	    if true, request will not be send to server
 * @param {boolean}		useChangeToken	    if true, request will try to use change token in header
 */
ZmRequestMgr.prototype.sendRequest =
function(params) {
	var response = params.response;
	if (response) {
		if (params.reqId) {
			params = this._pendingRequests[params.reqId] || params;
			params.response = response;
		}
		params.asyncMode = true;	// canned response set up async style
		return this._handleResponseSendRequest(params, new ZmCsfeResult(response));
	}
	if (params.offlineRequest || appCtxt.isWebClientOffline()) {
		if (params.offlineCallback) {
			params.offlineCallback.run(params);
		}
		return;
	}
	
	var reqId = params.reqId = ("Req_"+ZmRequestMgr._nextReqId++);
	DBG.println("req", "assign req ID: " + reqId);
	var timeout = params.timeout = (params.timeout != null) ? params.timeout : this._stdTimeout;
	if (timeout) {
		timeout = timeout * 1000; // convert seconds to ms
	}
	var asyncCallback = params.asyncMode ? new AjxCallback(this, this._handleResponseSendRequest, [params]) : null;

	if (params.sensitive) {
		DBG.println(AjxDebug.DBG2, "request contains sensitive data");
		// NOTE: If only http mode is available, there's nothing we can
		//       do. And if we're already using https mode, then there's
		//       nothing we need to do. We only attempt to send the
		//       request securely if mixed mode is enabled and the app
		//       was loaded using http.
		var isHttp = document.location.protocol == ZmSetting.PROTO_HTTP;
		var isMixedMode = appCtxt.get(ZmSetting.PROTOCOL_MODE) == ZmSetting.PROTO_MIXED;
		if(isHttp && isMixedMode) {
			return this._sensitiveRequest(params, reqId);
		}
	}

	var command = new ZmCsfeCommand();
	// bug fix #10652, 82704 - dont set change token if accountName is not main account or is not specified
	// (since we're executing on someone else's mbox)
	var accountName = params.accountName;
	if (!accountName) {
		var acct = appCtxt.getActiveAccount();
		accountName = (acct && acct.id != ZmAccountList.DEFAULT_ID) ? acct.name : null;
	}
	var changeToken = null;
	if (params.useChangeToken && (!accountName || (accountName === appCtxt.accountList.mainAccount.name))) {
		changeToken = this._changeToken;
	}
	var cmdParams, methodName;

	if (params.restUri) {
		cmdParams =	{	restUri:			params.restUri,
						asyncMode:			params.asyncMode,
						callback:			asyncCallback
					};
	} else {
		cmdParams = {	jsonObj:			params.jsonObj,
						soapDoc:			params.soapDoc,
						accountName:		accountName,
						useXml:				this._useXml,
						changeToken:		changeToken,
						asyncMode:			params.asyncMode,
						callback:			asyncCallback,
						logRequest:			this._logRequest,
						highestNotifySeen:	this._highestNotifySeen,
						noAuthToken:		true,	// browser will handle auth token cookie
						skipAuthCheck:		params.skipAuthCheck,
						resend:				params.resend,
						noSession:			params.noSession,
						useStringify1:		(AjxEnv.isIE || AjxEnv.isModernIE) && params.fromChildWindow,
						emptyResponseOkay:	params.emptyResponseOkay
					};
		methodName = params.methodName = ZmCsfeCommand.getMethodName(cmdParams.jsonObj || cmdParams.soapDoc);
	}

	appCtxt.currentRequestParams = params;
	DBG.println("req", "send request " + reqId + ": " + methodName);
	var cancelParams = timeout ? [reqId, params.errorCallback, params.noBusyOverlay] : null;
	if (!params.noBusyOverlay) {
		var cancelCallback = null;
		var showBusyDialog = false;
		if (timeout) {
			DBG.println("req", "ZmRequestMgr.sendRequest: timeout for " + reqId + " is " + timeout);
			cancelCallback = new AjxCallback(this, this.cancelRequest, cancelParams);
			this._shell.setBusyDialogText(ZmMsg.askCancel);
			showBusyDialog = true;
		}
		// put up busy overlay to block user input
		this._shell.setBusy(true, reqId, showBusyDialog, timeout, cancelCallback);
	} else if (timeout) {
		var action = new AjxTimedAction(this, this.cancelRequest, cancelParams);
		this._cancelActionId[reqId] = AjxTimedAction.scheduleAction(action, timeout);
		DBG.println("req", "schedule cancel action for reqId " + reqId + ": " + this._cancelActionId[reqId]);
	}

	this._pendingRequests[reqId] = command;

	try {
		DBG.println("req", "invoke req: " + params.reqId);
		var response = params.restUri ? command.invokeRest(cmdParams) : command.invoke(cmdParams);
		command.state = ZmRequestMgr._SENT;
	} catch (ex) {
		DBG.println("req", "caught exception on invoke of req: " + params.reqId);
		this._handleResponseSendRequest(params, new ZmCsfeResult(ex, true));
		return;
	}

	return (params.asyncMode) ? reqId : (this._handleResponseSendRequest(params, response));
};

/**
 * @private
 * @param {Array}	params.ignoreErrs	list of error codes that can be ignored, when params.errorCallback does not exists.
 */
ZmRequestMgr.prototype._handleResponseSendRequest =
function(params, result) {
	DBG.println("req", "ZmRequestMgr.handleResponseSendRequest for req: " + params.reqId);
	var isCannedResponse = (params.response != null);
	if (!isCannedResponse && !appCtxt.isWebClientOffline()) {
		if (!this._pendingRequests[params.reqId]) {
			DBG.println("req", "ZmRequestMgr.handleResponseSendRequest no pending request for " + params.reqId);
			return;
		}
		if (this._pendingRequests[params.reqId].state == ZmRequestMgr._CANCEL) {
			DBG.println("req", "ZmRequestMgr.handleResponseSendRequest state=CANCEL for " + params.reqId);
			return;
		}
	
		this._pendingRequests[params.reqId].state = ZmRequestMgr._RESPONSE;
	
		if (!params.noBusyOverlay) {
			this._shell.setBusy(false, params.reqId); // remove busy overlay
		}
	}

	var response, refreshBlock;
	try {
		if (params.asyncMode && !params.restUri) {
			response = result.getResponse(); // may throw exception
		} else {
			// for sync responses, manually throw exception if necessary
			if (result._isException) {
				throw result._data;
			} else {
				response = result;
			}
		}
		if (response.Header) {
			refreshBlock = this._handleHeader(response.Header);
		}
	} catch (ex) {
		DBG.println("req", "Request " + params.reqId + " got an exception");
		var ecb = params.errorCallback;
		if (ecb) {
            var handled = ecb.run(ex, params);
			if (!handled) {
				this._handleException(ex, params);
			}
		} else {
			var ignore = function(ignoreErrs, errCode){
			/*
				Checks errCode exits in ignoreErrs
			*/
				if (ignoreErrs && (ignoreErrs.length > 0)){
					for (var val in ignoreErrs)
						if (ignoreErrs[val] == errCode) 
							return true;
				}
				return false;
			}(params.ignoreErrs, ex.code)

            if (ex.code === ZmCsfeException.EMPTY_RESPONSE && params.offlineCallback) {
                params.offlineCallback(params);
				if (appCtxt.isWebClientOffline() && !params.noBusyOverlay) {
					this._shell.setBusy(false, params.reqId); // remove busy overlay
				}
                ignore = true;
            }
			if (!ignore)
				this._handleException(ex, params);
		}
		var hdr = result.getHeader();
		if (hdr) {
			this._handleHeader(hdr);
			this._handleNotifications(hdr);
		}
		this._clearPendingRequest(params.reqId);
		return;
	}

    if (params.asyncMode && !params.restUri) {
	    result.set(response.Body);
	}

    // if we didn't get an exception, then we should make sure that the
    // poll timer is running (just in case it got an exception and stopped)
	if (!appCtxt.isOffline && !isCannedResponse) {
		this._controller._kickPolling(true);
	}

	var methodName = ZmCsfeCommand.getMethodName(params.jsonObj || params.soapDoc);
	if (params.asyncMode && params.callback) {
		DBG.println(AjxDebug.DBG1, "------------------------- Running response callback for " + methodName);
		params.callback.run(result);
	}

	DBG.println(AjxDebug.DBG1, "------------------------- Processing notifications for " + methodName);
	this._handleNotifications(response.Header, methodName);

	this._clearPendingRequest(params.reqId);

	if (refreshBlock && (!appCtxt.isOffline || !appCtxt.multiAccounts) && !params.more) {
		this._refreshHandler(refreshBlock);
	}
	
	if (!params.asyncMode) {
		return response.Body;
	}
	
	var ctlr = this._controller;
	if (ctlr._evtMgr && ctlr._evtMgr.isListenerRegistered(ZmAppEvent.RESPONSE)) {
		ctlr._evt.request = methodName;
		ctlr.notify(ZmAppEvent.RESPONSE);
	}
};

/**
 * Cancels the request.
 * 
 * @param	{String}	reqId		the request id
 * @param	{AjxCallback}	errorCallback		the callback
 * @param	{Boolean}	noBusyOverlay	if <code>true</code>, do not show busy overlay
 */
ZmRequestMgr.prototype.cancelRequest =
function(reqId, errorCallback, noBusyOverlay) {
	DBG.println("req", "ZmRequestMgr.cancelRequest: " + reqId);
	if (!this._pendingRequests[reqId]) { return; }
	if (this._pendingRequests[reqId].state == ZmRequestMgr._RESPONSE) { return; }

	this._pendingRequests[reqId].state = ZmRequestMgr._CANCEL;
	if (!noBusyOverlay) {
		this._shell.setBusy(false, reqId);
	}
	DBG.println("req", "canceling the XHR");
	this._pendingRequests[reqId].cancel();
	if (errorCallback) {
		DBG.println("req", "calling the error callback");
		var ex = new AjxException("Request canceled", AjxException.CANCELED, "ZmRequestMgr.prototype.cancelRequest");
		errorCallback.isAjxCallback ? errorCallback.run(ex) : errorCallback(ex);
	}
	this._clearPendingRequest(reqId);
};

/**
 * @private
 */
ZmRequestMgr.prototype._clearPendingRequest =
function(reqId) {
	var request = this._pendingRequests[reqId];
	if (request) {
		if (request.iframeId) {
			var iframe = document.getElementById(request.iframeId);
			if (iframe) {
				iframe.parentNode.removeChild(iframe);
			}
		}
		delete this._pendingRequests[reqId];
	}
	var cancelId = this._cancelActionId[reqId];
	if (cancelId && cancelId != -1) {
		DBG.println("req", "unschedule cancel action for reqId " + reqId + ": " + cancelId);
		AjxTimedAction.cancelAction(cancelId);
		this._cancelActionId[reqId] = -1;
	}
};

/**
 * Handles a response's SOAP header, except for notifications. Updates our
 * change token, and processes a <code>&lt;refresh&gt;</code> block if there is one (happens
 * when a new session is created on the server).
 *
 * @param {Object}	hdr	a SOAP header
 * 
 * @private
 */
ZmRequestMgr.prototype._handleHeader =
function(hdr) {

	var ctxt = hdr && hdr.context;
	if (!ctxt) { return; }

	// update change token if we got one
	if (ctxt.change) {
		this._changeToken = ctxt.change.token;
	}

	// offline/zdesktop only
	if (ctxt.zdsync && ctxt.zdsync.account) {
		var acctList = ctxt.zdsync.account;
		for (var i = 0; i < acctList.length; i++) {
            var acct = appCtxt.accountList.getAccount(acctList[i].id);
			if (acct) {
                //server is sending info to get user's consent on something.
                var dialog = acctList[i].dialog;
                if(dialog) {
                    this._handleOfflineInfoDialog(dialog[0], acct)
                }
				acct.updateState(acctList[i]);
			}
		}
	}

	if (ctxt.refresh) {
		this._controller.runAppFunction("_clearDeferredFolders");
		this._loadTrees(ctxt.refresh);
		this._controller.runAppFunction("_createVirtualFolders");
		this._highestNotifySeen = 0;
	}

	return ctxt.refresh;
};
/**
 * Handles server's notification to get user's consent on something
 *
 * @param {Object}	dlg is json object
 * @param {Object}	account object
 *
 * @private
 */
ZmRequestMgr.prototype._handleOfflineInfoDialog =
function(dlg, acct) {

    if(!dlg.type) {
        return;
    }
    var cont;
    switch(dlg.type) {
        case ZmRequestMgr.OFFLINE_HEAP_DUMP: {
            cont = ZmMsg.offlineHeapDump;
            break;
        }
        case ZmRequestMgr.OFFLINE_MUST_RESYNC: {
            cont = AjxMessageFormat.format(ZmMsg.offlineMustReSync, acct.name);
            break;
        }
		case ZmRequestMgr.OFFLINE_MUST_GAL_RESYNC: {
			cont = AjxMessageFormat.format(ZmMsg.offlineMustGalReSync, acct.name);
			break;
		}
        case ZmRequestMgr.OFFLINE_FOLDER_MOVE_FAILED: {
            appCtxt.setStatusMsg(ZmMsg.offlineMoveFolderError);
            break;
        }
        default:
    }
    if (!cont) {
        return;
    }
    var dialog = appCtxt.getOkCancelMsgDialog();
    dialog.setMessage(cont);
    dialog.registerCallback(DwtDialog.OK_BUTTON, this._handleOfflineDialogAction, this, [dialog, dlg.type, acct.id, true]);
    dialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._handleOfflineDialogAction, this, [dialog, dlg.type, acct.id, false]);
    dialog.popup();
};
/**
 * Sends DialogActionRequest with user's consent YES/NO
 * @param {object} dlg is getOkCancelMsgDialog
 * @param {string} type
 * @param {string} acctId Account ID
 * @param {boolean} action
 */
ZmRequestMgr.prototype._handleOfflineDialogAction =
function(dlg, type, acctId, action) {
    var args = {
			jsonObj: { DialogActionRequest: { _jsns: "urn:zimbraOffline", type: type, id:acctId, action: action ? "yes" : "no" } },
            callback: new AjxCallback(this, this._handleOfflineDialogActionResp, dlg),
			errorCallback: new AjxCallback(this, this._handleOfflineDialogActionResp, dlg),
			asyncMode: true
		};
    this.sendRequest(args);
};
/**
 * callback to hide dialog
 *
 * @param dlg
 * @param resp
 */
ZmRequestMgr.prototype._handleOfflineDialogActionResp =
function(dlg, resp) {
      if(dlg.isPoppedUp()){
        dlg.popdown();
    }
};

/**
 * For transient network exceptions, retry the request after a small delay.
 * We will only retry a limited number of times.
 * 
 * @param {AjxException}	ex			the exception
 * @param {Hash}	params		a hash of the original request params
 */
ZmRequestMgr.prototype._handleException =
function(ex, params) {
	var handled = false;
	if (ZmRequestMgr.RETRY_ON_EXCEPTION[ex.code]) {
		params.retryCount = params.retryCount || 0;
		if (params.retryCount < ZmRequestMgr.RETRY_MAX) {
			DBG.println(AjxDebug.DBG1, "RETRY " + ex.method + " due to " + ex.code);
			params.resend = ZmCsfeCommand.RETRY;
			params.retryCount++;
			AjxTimedAction.scheduleAction(new AjxTimedAction(this, 
				function() {
					this.sendRequest(params);
				}), ZmRequestMgr.RETRY_DELAY * 1000);
			handled = true;
		}
	}
	
	if (!handled) {
		this._controller._handleException(ex, params);
	}
};

/**
 * Handles the <code>&lt;notify&gt;</code> block of a response's SOAP header.
 *
 * @param {Object}	hdr	a SOAP header
 * 
 * @private
 */
ZmRequestMgr.prototype._handleNotifications =
function(hdr, methodName) {

	if (hdr && hdr.context && hdr.context.notify) {
        for (var i = 0; i < hdr.context.notify.length; i++) {
        	var notify = hdr.context.notify[i];
        	var seq = notify.seq;
            // BUG?  What if the array isn't in sequence-order?  Could we miss notifications?
			var sid = hdr.context && ZmCsfeCommand.extractSessionId(hdr.context.session);
            if (notify.seq > this._highestNotifySeen && !(sid && ZmCsfeCommand._staleSession[sid])) {
                DBG.println(AjxDebug.DBG1, "Handling notification[" + i + "] seq=" + seq);
                this._highestNotifySeen = seq;
                this._notifyHandler(notify, methodName);
            } else {
            	DBG.println(AjxDebug.DBG1, "SKIPPING notification[" + i + "] seq=" + seq + " highestNotifySeen=" + this._highestNotifySeen);
	      	}
    	}
	}
};

/**
 * A <code>&lt;refresh&gt;</code> block is returned in a SOAP response any time the session ID has 
 * changed. It always happens on the first SOAP command (GetInfoRequest).
 * After that, it happens after a session timeout. 
 * 
 * @param {Object}	refresh	the refresh block (JSON)
 * @private
 */
ZmRequestMgr.prototype._refreshHandler =
function(refresh) {

	DBG.println(AjxDebug.DBG1, "Handling REFRESH");
	AjxDebug.println(AjxDebug.NOTIFY, "REFRESH block received");
	if (!appCtxt.inStartup) {
		this._controller._execPoll();
	}

	if (refresh.version) {
		if (!this._canceledReload) {
			var curVersion = appCtxt.get(ZmSetting.SERVER_VERSION);
			if (curVersion != refresh.version) {
				appCtxt.set(ZmSetting.SERVER_VERSION, refresh.version);
				if (curVersion) {
					var dlg = appCtxt.getYesNoMsgDialog();
					dlg.reset();
					dlg.registerCallback(DwtDialog.YES_BUTTON, this._reloadYesCallback, this, [dlg, curVersion, refresh.version]);
					dlg.registerCallback(DwtDialog.NO_BUTTON, this._reloadNoCallback, this, [dlg, refresh]);
					var msg = AjxMessageFormat.format(ZmMsg.versionChangeRestart, [curVersion, refresh.version]);
					dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
					dlg.popup();
					appCtxt.reloadAppCache(true);
					return;
				}
			}
		}
	}

	if (!this._recentlyRefreshed) {
		// Run any app-requested refresh routines
		this._controller.runAppFunction("refresh", false, refresh);
		this._recentlyRefreshed = true;
		this._lastSkippedRefresh = null;
	} else {
		this._lastSkippedRefresh = refresh;
	}

	if (!this._refreshTimer)
		this._refreshTimer = new AjxTimedAction(this, this._refreshTimeout);

	AjxTimedAction.scheduleAction(this._refreshTimer, 5000);
};

ZmRequestMgr.prototype._refreshTimeout =
function() {
	if (this._lastSkippedRefresh) {
		this._controller.runAppFunction("refresh", false, this._lastSkippedRefresh);
		this._lastSkippedRefresh = null;
	}
	this._recentlyRefreshed = false;
};

ZmRequestMgr.prototype._loadTrees =
function(refresh) {
	var unread = {};
	var main = appCtxt.multiAccounts ? appCtxt.accountList.mainAccount : null;
	this._loadTree(ZmOrganizer.TAG, unread, refresh.tags, null, main);
	this._loadTree(ZmOrganizer.FOLDER, unread, refresh.folder[0], "folder", main);
	
	this._loadHabTree();
};

/**
 * Try to load HAB data if HAB-root-id is available.
 * 
 * @private
 */
ZmRequestMgr.prototype._loadHabTree =
function() {
	var habRoots = appCtxt.get(ZmSetting.HAB_ROOT);
	if (!habRoots && habRoots.length === 0) { return; }

	var habRoot = habRoots[0];
	if (habRoot) {
		var habRootId = habRoot._content;
		var request = {
			_jsns: "urn:zimbraAccount",
			"ownerOf": 1,
			habRootGroupId: habRootId
		};

		var jsonObj = {GetHABRequest: request};
		var respCallback = this._handleHABResponse.bind(this, habRootId);
		appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
	}
};

/**
 * @private
 */
ZmRequestMgr.prototype._handleHABResponse =
function(habRootId, result) {
	var organizationalUnit = result._data.GetHABResponse.ou[0];
	var habRootFolder = organizationalUnit.habGroup[0];
	habRootFolder.id = habRootId;

	this._loadTree("HAB", {}, habRootFolder, "hab", null);
}

/**
 * User has accepted reload due to change in server version.
 * 
 * @private
 */
ZmRequestMgr.prototype._reloadYesCallback =
function(dialog) {
	dialog.popdown();
    window.onbeforeunload = null;
    var url = AjxUtil.formatUrl();
	DBG.println(AjxDebug.DBG1, "SERVER_VERSION changed!");
    ZmZimbraMail.sendRedirect(url); // redirect to self to force reload
};

/**
 * User has canceled reload due to change in server version.
 * 
 * @private
 */
ZmRequestMgr.prototype._reloadNoCallback =
function(dialog, refresh) {
	dialog.popdown();
	this._canceledReload = true;
	this._refreshHandler(refresh);
};

/**
 * @private
 */
ZmRequestMgr.prototype._loadTree =
function(type, unread, obj, objType, account) {
	var isTag = (type == ZmOrganizer.TAG);
	var tree = appCtxt.getTree(type, account);
	if (tree) {
		tree.reset();
	} else {
		tree = isTag ? new ZmTagTree(account) : new ZmFolderTree();
	}
	appCtxt.setTree(type, tree, account);
	tree.addChangeListener(this._unreadListener);
	tree.getUnreadHash(unread);
	tree.loadFromJs(obj, objType, account);
};

/**
 * To handle notifications, we keep track of all the models in use. A model could
 * be an item, a list of items, or an organizer tree. Currently we never get an
 * organizer by itself.
 * 
 * @private
 */
ZmRequestMgr.prototype._notifyHandler =
function(notify, methodName) {
	DBG.println(AjxDebug.DBG1, "Handling NOTIFY");
	AjxDebug.println(AjxDebug.NOTIFY, "Notification block:");
	AjxDebug.dumpObj(AjxDebug.NOTIFY, notify);
	this._controller.runAppFunction("preNotify", false, notify);
	if (notify.deleted && notify.deleted.id) {
		this._handleDeletes(notify.deleted);
	}
	if (notify.created) {
		this._handleCreates(notify.created);
	}
	if (notify.modified) {
		this._handleModifies(notify.modified);
	}

	if (ZmOffline.isOnlineMode() && (notify.deleted || notify.created || notify.modified)) {
		appCtxt.webClientOfflineHandler.scheduleSyncRequest(notify, methodName);
	}
	this._controller.runAppFunction("postNotify", false, notify);
};

/**
 * A delete notification hands us a list of IDs which could be anything. First, we
 * run any app delete handlers. Any IDs which have been handled by an app will
 * be nulled out. The generic handling here will be applied to the rest - the item is
 * retrieved from the item cache and told it has been deleted.
 *
 * @param {Object}	deletes	the node containing all 'deleted' notifications
 * 
 * @private
 */
ZmRequestMgr.prototype._handleDeletes =
function(deletes) {
	var ids = deletes.id.split(",");
	this._controller.runAppFunction("deleteNotify", false, ids);

	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (!id) { continue; }
		var item = appCtxt.cacheGet(id);
		DBG.println(AjxDebug.DBG2, "ZmRequestMgr: handling delete notif for ID " + id);
		if (item && item.notifyDelete) {
			item.notifyDelete();
			appCtxt.cacheRemove(id);
			item = null;
		}
	}
};

/**
 * Create notifications hand us full XML nodes. First, we run any app
 * create handlers, which will mark any create nodes that they handle. Remaining
 * creates are handled here.
 * 
 * @param {Object}	creates	the node containing all 'created' notifications
 * 
 * @private
 */
ZmRequestMgr.prototype._handleCreates =
function(creates) {
	this._controller.runAppFunction("createNotify", false, creates);

	for (var name in creates) {
        if (creates.hasOwnProperty(name)) {
            var list = creates[name];
            for (var i = 0; i < list.length; i++) {
                var create = list[i];
                if (create._handled) { continue; }
                // ignore create notif for item we already have (except tags, which can reuse IDs)
                if (appCtxt.cacheGet(create.id) && name != "tag") { continue; }

                DBG.println(AjxDebug.DBG1, "ZmRequestMgr: handling CREATE for node: " + name);
                if (name == "tag") {
                    var account = appCtxt.multiAccounts && ZmOrganizer.parseId(create.id).account;
                    var tagTree = appCtxt.getTagTree(account);
                    if (tagTree) {
                        tagTree.root.notifyCreate(create);
                    }
                } else if (name == "folder" || name == "search" || name == "link") {
                    var parentId = create.l;
                    var parent = appCtxt.getById(parentId);
                    if (parent && parent.notifyCreate && parent.type != ZmOrganizer.TAG) { // bug #37148
                        parent.notifyCreate(create, name);
                    }
                }
            }
        }
	}
};

/**
 * First, we run any app modify handlers, which will mark any nodes that
 * they handle. Remaining modify notifications are handled here.
 * 
 * @param {Object}	modifies	the node containing all 'modified' notifications
 * 
 * @private
 */
ZmRequestMgr.prototype._handleModifies =
function(modifies) {

	this._controller.runAppFunction("modifyNotify", false, modifies);

	for (var name in modifies) {
		if (name == "mbx") {
			var mboxes = modifies[name];
			for (var i = 0; i < mboxes.length; i++) {
				var mbox = mboxes[i];
				var acctId = mbox.acct;
				var account = acctId && appCtxt.accountList.getAccount(acctId);
				var setting = appCtxt.getSettings(account).getSetting(ZmSetting.QUOTA_USED);
				setting.notifyModify({_name:name, s:mbox.s, account:account});
			}
			continue;
		}

		var list = modifies[name];
		for (var i = 0; i < list.length; i++) {
			var mod = list[i];
			if (mod._handled) { continue; }
			DBG.println(AjxDebug.DBG2, "ZmRequestMgr: handling modified notif for ID " + mod.id + ", node type = " + name);
			var item = appCtxt.cacheGet(mod.id);

			// bug fix #31991 - for contact modifies, check the contact list
			// Since we lazily create ZmContact items, it wont be in the global cache.
			// TODO: move to contacts app
			if (!item && name == "cn" && AjxDispatcher.loaded("ContactsCore")) {
				var capp = appCtxt.getApp(ZmApp.CONTACTS);
				if (capp.isContactListLoaded()) {
					item = capp.getContactList().getById(mod.id);
				}
			}

			if (item && item.notifyModify) {
				mod._isRemote = (name == "folder" && item.link);	// remote subfolder
				item.notifyModify(mod);
			}
		}
	}
};

/**
 * Changes browser title if it's a folder or tag whose unread count has changed.
 *
 * @param ev	the event
 * 
 * @private
 */
ZmRequestMgr.prototype._unreadChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (fields && fields[ZmOrganizer.F_UNREAD]) {
			var organizers = ev.getDetail("organizers");
			var organizer = organizers ? organizers[0] : null;
			var id = organizer ? (organizer.isSystem() ? organizer.nId : organizer.id) : null;
			var search = appCtxt.getCurrentSearch();
			if (search) {
				var searchFolder = appCtxt.multiAccounts && appCtxt.getById(search.folderId);
				var searchFolderId = (searchFolder && searchFolder.getAccount() == appCtxt.getActiveAccount())
					? searchFolder.nId : search.folderId;

				if (id && (id == searchFolderId || id == search.tagId)) {
					Dwt.setTitle(search.getTitle());
				}
			}
			var mailApp = appCtxt.getApp(ZmApp.MAIL);
			if (mailApp) {
				mailApp.setNewMailNotice(organizer);
			}
		}
	}
};

ZmRequestMgr.prototype._sensitiveRequest =
function(params, reqId) {
	DBG.println(AjxDebug.DBG2, "sending request securely");
	// adjust command parameters
	// TODO: Because of timing issues, should we not use session info?
	// TODO: But for batch commands, some updates would not be seen immediately.
	// TODO: To avoid security warning, send response in URL; so limit length
	params.noSession = true;
	params.noAuthToken = true;

	// information
	var requestStr = ZmCsfeCommand.getRequestStr(params);
	var loc = document.location;
	var port = appCtxt.get(ZmSetting.HTTPS_PORT);
	if (port && port != ZmSetting.DEFAULT_HTTPS_PORT) {
		port = ":"+port;
	}

	// create iframe
	var iframe = document.createElement("IFRAME");
	iframe.style.display = "none";
	iframe.id = Dwt.getNextId();
	document.body.appendChild(iframe);

	// set contents
	var iframeDoc = Dwt.getIframeDoc(iframe);
	iframeDoc.write(
		"<form ",
			"id=",iframe.id,"-form ",
			"target=",iframe.id,"-iframe ",
			"method=POST ",
			"action='https://",loc.hostname,port,appContextPath,"/public/secureRequest.jsp'",
		">",
			"<input type=hidden name=reqId value='",reqId,"'>",
			"<textarea name=data>",
				AjxStringUtil.htmlEncode(requestStr),
			"</textarea>",
		"</form>",
		"<iframe name=",iframe.id,"-iframe></iframe>"
	);
	iframeDoc.close();

	// save the params for the response
	params.iframeId = iframe.id;
	this._pendingRequests[reqId] = params;

	// submit form
	var form = iframeDoc.getElementById(iframe.id+"-form");
	form.submit();
};
