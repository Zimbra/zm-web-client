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
 * This file contains the new window class.
 */

/**
 * Creates a controller to run <code>ZmNewWindow</code>. Do not call directly, instead use
 * the <code>run()</code> factory method.
 * @class
 * This class is the controller for a window created outside the main client
 * window. It is a very stripped down and specialized version of {@link ZmZimbraMail}.
 * The child window is single-use; it does not support switching among multiple
 * views.
 *
 * @author Parag Shah
 * 
 * @extends	ZmController
 * 
 * @see		#run
 */
ZmNewWindow = function() {

	ZmController.call(this, null);

	appCtxt.setAppController(this);

	this._settings = appCtxt.getSettings();
	this._shell = appCtxt.getShell();

	// Register keymap and global key action handler w/ shell's keyboard manager
	this._kbMgr = appCtxt.getKeyboardMgr();
	if (appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) {
		this._kbMgr.enable(true);
		this._kbMgr.registerKeyMap(new ZmKeyMap());
		this._kbMgr.pushDefaultHandler(this);
	}

	this._apps = {};
};

ZmNewWindow.prototype = new ZmController;
ZmNewWindow.prototype.constructor = ZmNewWindow;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmNewWindow.prototype.toString =
function() {
	return "ZmNewWindow";
};

// Public methods

/**
 * Sets up new window and then starts it by calling its constructor. It is assumed that the
 * CSFE is on the same host.
 * 
 */
ZmNewWindow.run =
function() {

	// We're using a custom pkg that includes the mail classes we'll need, so pretend that
	// we've already loaded mail packages so the real ones don't get loaded as well.
	AjxDispatcher.setLoaded("MailCore", true);
	AjxDispatcher.setLoaded("Mail", true);

	var winOpener = window.opener || window;
	// inherit parent window's debug level but only enable debug window if not already open
	DBG.setDebugLevel(winOpener.DBG._level, true);

	if (!window.parentController) {
		window.parentController = winOpener._zimbraMail;
	}

	// Create the global app context
	window.appCtxt = new ZmAppCtxt();
	window.appCtxt.isChildWindow = true;

	// XXX: DO NOT MOVE THIS LINE
	// redefine ZmSetting from parent window since it loses this info.
	window.parentAppCtxt = winOpener.appCtxt;
	appCtxt.setSettings(parentAppCtxt.getSettings());
	appCtxt.isOffline = parentAppCtxt.isOffline;
	appCtxt.multiAccounts = parentAppCtxt.multiAccounts;
	window.ZmSetting = winOpener.ZmSetting;

	ZmOperation.initialize();
	ZmApp.initialize();

	var shell = new DwtShell({className:"MainShell"});
	window.onbeforeunload = ZmNewWindow._confirmExitMethod;
	appCtxt.setShell(shell);

	// create new window and Go!
	var newWindow = new ZmNewWindow();
    newWindow.startup();
};

/**
* Allows this child window to inform parent it's going away
*/
ZmNewWindow.unload =
function(ev) {
	if (!window.opener || !window.parentController) { return; }

	if (window.command == "compose" || window.command == "composeDetach") {
		// compose controller adds listeners to parent window's list so we
		// need to remove them before closing this window!
		var cc = AjxDispatcher.run("GetComposeController", appCtxt.composeCtlrSessionId);
		if (cc) {
			cc.dispose();
		}
	} else if (window.command == "msgViewDetach") {
		// msg controller (as a ZmListController) adds listener to tag list
		var mc = AjxDispatcher.run("GetMsgController", appCtxt.msgCtlrSessionId);
		if (mc) {
			mc.dispose();
		}
	}

	if (window.parentController) {
		window.parentController.removeChildWindow(window);
	}
};

/**
 * Presents a view based on a command passed through the window object. Possible commands are:
 *
 * <ul>
 * <li><b>compose</b> compose window launched in child window</li>
 * <li><b>composeDetach</b> compose window detached from client</li>
 * <li><b>msgViewDetach</b> msg view detached from client</li>
 * </ul>
 * 
 */
ZmNewWindow.prototype.startup =
function() {

	// get params from parent window b/c of Safari bug #7162
	if (window.parentController) {
		var childWinObj = window.parentController.getChildWindow(window);
		if (childWinObj) {
			window.newWindowCommand = childWinObj.command;
			window.newWindowParams = childWinObj.params;
		}
	}

	var cmd = window.newWindowCommand;
	var params = window.newWindowParams;
	if (cmd == "shortcuts") {
		var apps = {};
		apps[ZmApp.PREFERENCES] = true;
		this._createEnabledApps(apps);
		this._createView();
		return;
	}

	if (!this._appViewMgr) {
		this._appViewMgr = new ZmAppViewMgr(this._shell, this, true, false);
		this._statusView = new ZmStatusView(this._shell, "ZmStatus", Dwt.ABSOLUTE_STYLE, ZmId.STATUS_VIEW);
	}

	var rootTg = appCtxt.getRootTabGroup();

	var apps = {};
	apps[ZmApp.MAIL] = true;
	apps[ZmApp.CONTACTS] = true;
	// only load calendar app if we're dealing with an invite
	var msg = (cmd == "msgViewDetach") ? params.msg : null;
	if (msg && msg.isInvite()) {
		apps[ZmApp.CALENDAR] = true;
	}
	apps[ZmApp.PREFERENCES] = true;
    apps[ZmApp.BRIEFCASE] = true;  //Need this for both Compose & Msg View detach window.
	this._createEnabledApps(apps);

	// inherit parent's identity collection
	var parentPrefsApp = parentAppCtxt.getApp(ZmApp.MAIL);
	appCtxt.getApp(ZmApp.MAIL)._identityCollection = parentPrefsApp.getIdentityCollection();

	// Find target first.
	var target;
	if (cmd == "compose" || cmd == "composeDetach") {
		target = "compose-window";
	} else if (cmd == "msgViewDetach") {
		target = "view-window";
	}
    
	// setup zimlets, Load it first becoz.. zimlets has to get processed first.
	if (target) {
		var allzimlets = parentAppCtxt.get(ZmSetting.ZIMLETS);
		allzimlets = allzimlets || [];
		var zimletArray = this._settings._getCheckedZimlets(allzimlets);
		if (this._hasZimletsForTarget(zimletArray, target)) {
			var zimletMgr = appCtxt.getZimletMgr();
			var userProps = this._getUserProps();
			var createViewCallback =  new AjxCallback(this, this._createView);
            appCtxt.setZimletsPresent(true);
			zimletMgr.loadZimlets(zimletArray, userProps, target, createViewCallback, true);
			return;
		}
	}

	this._createView();
};

/**
 * @private
 */
ZmNewWindow.prototype._createView =
function() {

	var cmd = window.newWindowCommand;
	var params = window.newWindowParams;

	var rootTg = appCtxt.getRootTabGroup();
	var startupFocusItem;

	// depending on the command, do the right thing
	if (cmd == "compose" || cmd == "composeDetach") {
		var cc = AjxDispatcher.run("GetComposeController");	// get a new compose ctlr
		appCtxt.composeCtlrSessionId = cc.sessionId;
		if (params.action == ZmOperation.REPLY_ALL) {
			params.msg = this._deepCopyMsg(params.msg);
		}
		if (cmd == "compose") {
			cc._setView(params);
		} else {
			var op = params.action || ZmOperation.NEW_MESSAGE;
			if (params.msg && params.msg._mode) {
				switch (params.msg._mode) {
					case ZmAppt.MODE_DELETE:
					case ZmAppt.MODE_DELETE_INSTANCE:
					case ZmAppt.MODE_DELETE_SERIES: {
						op = ZmOperation.REPLY_CANCEL;
						break;
					}
				}
			}
			params.action = op;
			cc._setView(params);
			cc._composeView.setDetach(params);

			// bug fix #5887 - get the parent window's compose controller based on its session ID
			var parentCC = window.parentController.getApp(ZmApp.MAIL).getComposeController(params.sessionId);
			if (parentCC && parentCC._composeView) {
				// once everything is set in child window, pop parent window's compose view
				parentCC._composeView.reset(true);
				parentCC._app.popView(true);
			}
		}
		cc._setComposeTabGroup();
		rootTg.addMember(cc.getTabGroup());
		startupFocusItem = cc._getDefaultFocusItem();

		target = "compose-window";
	} else if (cmd == "msgViewDetach") {
		var msgController = AjxDispatcher.run("GetMsgController");
		appCtxt.msgCtlrSessionId = msgController.sessionId;
		msgController.show(params.msg);
		rootTg.addMember(msgController.getTabGroup());
		startupFocusItem = msgController.getCurrentView();

		target = "view-window";
	} else if (cmd == "shortcuts") {
		var panel = appCtxt.getShortcutsPanel();
		panel.popup(params.cols);
	}

	var kbMgr = appCtxt.getKeyboardMgr();
	kbMgr.setTabGroup(rootTg);
	kbMgr.grabFocus(startupFocusItem);
};

/**
 * HACK: This should go away once we have a cleaner server solution that
 *       allows us to get just those zimlets for the specified target.
 *       
 * @private
 */
ZmNewWindow.prototype._hasZimletsForTarget =
function(zimletArray, target) {
	var targetRe = new RegExp("\\b"+target+"\\b");
	for (var i=0; i < zimletArray.length; i++) {
		var zimletObj = zimletArray[i];
		var zimlet0 = zimletObj.zimlet[0];
		if (targetRe.test(zimlet0.target || "main")) {
			return true;
		}
	}
	return false;
};

/**
 * @private
 */
ZmNewWindow.prototype._getUserProps =
function() {
	var userPropsArray = parentAppCtxt.get(ZmSetting.USER_PROPS);

	// default to original user props
	userPropsArray = userPropsArray ? [].concat(userPropsArray) : [];

	// current user props take precedence, if available
	var zimletHash = parentAppCtxt.getZimletMgr().getZimletsHash();
	var zimletArray = parentAppCtxt.get(ZmSetting.ZIMLETS);
	for (var i = 0; i < zimletArray.length; i++) {
		var zname = zimletArray[i].zimlet[0].name;
		var zimlet = zimletHash[zname];
		if (!zimlet || !zimlet.userProperties) continue;
		for (var j = 0; j < zimlet.userProperties.length; j++) {
			var userProp = zimlet.userProperties[j];
			var userPropObj = { zimlet: zname, name: userProp.name, _content: userProp.value };
			userPropsArray.push(userPropObj);
		}
	}

	// return user properties
	return userPropsArray;
};

/**
 * Cancels the request.
 * 
 * @param	{String}	reqId		the request id
 * @param	{AjxCallback}	errorCallback		the callback
 * @param	{Boolean}	noBusyOverlay	if <code>true</code>, do not show a busy overlay
 */
ZmNewWindow.prototype.cancelRequest =
function(reqId, errorCallback, noBusyOverlay) {
	return window.parentController ? window.parentController.cancelRequest(reqId, errorCallback, noBusyOverlay) : null;
};

/**
 * Sends the server requests to the main controller.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmNewWindow.prototype.sendRequest =
function(params) {
	// bypass error callback to get control over exceptions in the childwindow.
	params.errorCallback = new AjxCallback(this, this._handleException, [( params.errorCallback || null )]);
	return window.parentController ? window.parentController.sendRequest(params) : null;
};

/**
 * @private
 */
ZmNewWindow.prototype._handleException =
function(errCallback, ex) {
	var handled = false;
	if (errCallback) {
		handled = errCallback.run(ex);
	}
	if (!handled) {
		ZmController.prototype._handleException.apply(this, [ex]);
	}
	return true;
};

/**
 * Popup the error dialog.
 * 
 * @param	{String}	msg		the message
 * @param	{AjxException}	ex	the exception
 * @param	{Boolean}	noExecReset
 * @param	{Boolean}	hideReportButton
 */
ZmNewWindow.prototype.popupErrorDialog =
function(msg, ex, noExecReset, hideReportButton)  {
	// Since ex is from parent window, all the types seems like objects, so need
	// to filter the functions
	var detailStr;
	if (ex instanceof Object || typeof ex == "object") {
		var details = [];
		ex.msg = ex.msg || msg;
		for (var prop in ex) {
			if (typeof ex[prop] == "function" ||
				(typeof ex[prop] == "object" && ex[prop].apply && ex[prop].call))
			{
				continue;
			}
			details.push([prop, ": ", ex[prop], "<br/>\n"].join(""));
		}
		detailStr = details.join("");
	}
	ZmController.prototype.popupErrorDialog.call(this, msg, ( detailStr || ex ), noExecReset, hideReportButton);
};

/**
 * Set status messages via the main controller, so they show up in the client's status area.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmNewWindow.prototype.setStatusMsg =
function(params) {
	// bug: 26478. Changed status msg to be displayed within the child window.
	params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
	/*if (AjxEnv.isIE) {
		if (typeof params == "string") {
			params = {msg: params};
		}
		params.transitions = [ZmToast.SHOW, ZmToast.PAUSE];
	}*/
	this._statusView.setStatusMsg(params);
};

/**
 * Gets a handle to the given app.
 *
 * @param {String}	appName		the app name
 * @return	{ZmApp}		the application
 */
ZmNewWindow.prototype.getApp =
function(appName) {
	if (!this._apps[appName]) {
		this._createApp(appName);
	}
	return this._apps[appName];
};

/**
 * Gets a handle to the app view manager.
 * 
 * @return	{ZmAppViewMgr}	the view manager
 */
ZmNewWindow.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
};

// App view mgr calls this, we don't need it to do anything.
ZmNewWindow.prototype.setActiveApp = function() {};

/**
 * Gets the key map manager.
 * 
 * @return	{DwtKeyMapMgr}	the key map manager
 */
ZmNewWindow.prototype.getKeyMapMgr =
function() {
	return this._kbMgr;
};

/**
 * Gets the key map name.
 * 
 * @return	{String}	the key map name
 */
ZmNewWindow.prototype.getKeyMapName =
function() {
	var ctlr = appCtxt.getCurrentController();
	if (ctlr && ctlr.getKeyMapName) {
		return ctlr.getKeyMapName();
	}
	return "Global";
};

/**
 * Handles the key action.
 * 
 * @param	{Object}	actionCode		the action code
 * @param	{Object}	ev		the event
 * @return	{Boolean}	<code>true</code> if the action is handled
 */
ZmNewWindow.prototype.handleKeyAction =
function(actionCode, ev) {
	var ctlr = appCtxt.getCurrentController();
	if (ctlr && ctlr.handleKeyAction) {
		return ctlr.handleKeyAction(actionCode, ev);
	}

	return false;
};


// Private methods

/**
 * Instantiates enabled apps. An optional argument may be given limiting the set
 * of apps that may be created.
 *
 * @param {Hash}	apps	the set of apps to create
 * 
 * @private
 */
ZmNewWindow.prototype._createEnabledApps =
function(apps) {
	for (var app in ZmApp.CLASS) {
		if (!apps || apps[app]) {
			ZmApp.APPS.push(app);
		}
	}
	ZmApp.APPS.sort(function(a, b) {
		return ZmZimbraMail.hashSortCompare(ZmApp.LOAD_SORT, a, b);
	});

	// instantiate enabled apps - this will invoke app registration
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var app = ZmApp.APPS[i];
		if (app != ZmApp.IM) { // Don't create im app. Seems like the safest way to avoid ever logging in.
			var setting = ZmApp.SETTING[app];
			if (!setting || appCtxt.get(setting)) {
				this._createApp(app);
			}
		}
	}
};

/**
 * Creates an app object, which doesn't necessarily do anything just yet.
 * 
 * @private
 */
ZmNewWindow.prototype._createApp =
function(appName) {
	if (this._apps[appName]) return;
	var appClass = eval(ZmApp.CLASS[appName]);
	this._apps[appName] = new appClass(this._shell, window.parentController);
};

/**
 * @private
 */
ZmNewWindow.prototype._deepCopyMsg =
function(msg) {
	// initialize new ZmSearch if applicable
	var newSearch = null;
	var oldSearch = msg.list.search;

	if (oldSearch) {
		newSearch = new ZmSearch();

		for (var i in oldSearch) {
			if ((typeof oldSearch[i] == "object") || (typeof oldSearch[i] == "function")) { continue; }
			newSearch[i] = oldSearch[i];
		}

		// manually add objects since they are no longer recognizable
		newSearch.types = new AjxVector();
		var types = oldSearch.types.getArray();
		for (var i in types) {
			newSearch.types.add(types[i]);
		}
	}

	// initialize new ZmMailList
	var newMailList = new ZmMailList(msg.list.type, newSearch);
	for (var i in msg.list) {
		if ((typeof msg.list[i] == "object") || (typeof msg.list[i] == "function")) { continue; }
		newMailList[i] = msg.list[i];
	}

	// finally, initialize new ZmMailMsg
	var newMsg = new ZmMailMsg(msg.id, newMailList);

	for (var i in msg) {
		if ((typeof msg[i] == "object") || (typeof msg[i] == "function")) { continue; }
		newMsg[i] = msg[i];
	}

	// manually add any objects since they are no longer recognizable
	for (var i in msg._addrs) {
		var addrs = msg._addrs[i].getArray();
		for (var j in addrs) {
			newMsg._addrs[i].add(addrs[j]);
		}
	}

	if (msg.attachments && msg.attachments.length > 0) {
		for (var i in msg.attachments) {
			newMsg.attachments.push(msg.attachments[i]);
		}
	}

	for (var i in msg._bodyParts) {
		newMsg._bodyParts.push(msg._bodyParts[i]);
	}

	if (msg._topPart) {
		newMsg._topPart = new ZmMimePart();
		for (var i in msg._topPart) {
			if ((typeof msg._topPart[i] == "object") || (typeof msg._topPart[i] == "function"))
				continue;
			newMsg._topPart[i] = msg._topPart[i];
		}
		var children = msg._topPart.children.getArray();
		for (var i in children) {
			newMsg._topPart.children.add(children[i]);
		}
	}

	return newMsg;
};


// Static Methods

/**
 * @private
 */
ZmNewWindow._confirmExitMethod =
function(ev) {
	if (window.parentController &&
		(window.newWindowCommand == "compose" || window.newWindowCommand == "composeDetach"))
	{
		var cc = AjxDispatcher.run("GetComposeController", appCtxt.composeCtlrSessionId);
		// only show native confirmation dialog if compose view is dirty
		if (cc && cc._composeView && cc._composeView.isDirty()) {
			return ZmMsg.newWinComposeExit;
		}
	}
};
