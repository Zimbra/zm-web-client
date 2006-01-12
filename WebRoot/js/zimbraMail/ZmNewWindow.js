/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a controller to run ZmNewWindow. Do not call directly, instead use the run()
* factory method.
* @constructor
* @class
* This class is the controller for a window created outside the main client window. It is
* a very stripped down and specialized version of ZmZimbraMail. The child window is
* single-use; it does not support switching among multiple views.
*
* @author Parag Shah
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param domain		[string]	current domain
*/
function ZmNewWindow(appCtxt, domain) {

	ZmController.call(this, appCtxt);

	appCtxt.setAppController(this);

	this._settings = appCtxt.getSettings();
	this._shell = appCtxt.getShell();
	this._apps = {};
	this.startup();
};

ZmNewWindow.prototype = new ZmController;
ZmNewWindow.prototype.constructor = ZmNewWindow;

ZmNewWindow.prototype.toString = 
function() {
	return "ZmNewWindow";
};

// Public methods

/**
* Sets up ZmNewWindow, and then starts it by calling its constructor. It is assumed that the
* CSFE is on the same host.
*
* @param domain		[string]	the host that we're running on
*/
ZmNewWindow.run =
function(domain) {

	// Create the global app context
	var appCtxt = new ZmAppCtxt();
	
	// set any global references in parent w/in child window
	if (window.parentController) {
		appCtxt.setSettings(window.parentController._appCtxt.getSettings());
	}

	var shell = new DwtShell("MainShell", false);
	appCtxt.setShell(shell);

	// Create upload manager (for sending attachments)
	appCtxt.setUploadManager(new AjxPost(appCtxt.getUploadFrameId()));
	
	// Go!
	var lm = new ZmNewWindow(appCtxt, domain);
};

/**
* Allows this child window to inform parent it's going away
*/
ZmNewWindow.unload = 
function(ev) {	
	if (window.parentController) {
		window.parentController.removeChildWindow(window);
	}
};

/**
* Presents a view based on a command passed through the window object. Possible commands are:
*
* compose			compose window launched in child window
* composeDetach		compose window detached from client
* msgViewDetach		msg view detached from client
*/
ZmNewWindow.prototype.startup =
function() {

	if (!this._appViewMgr)
		this._appViewMgr = new ZmAppViewMgr(this._shell, this, true, false);

	// depending on the command, do the right thing
	if (window.command == "compose" || window.command == "composeDetach") {
		var cc = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController();
		cc.isChildWindow = true;
		if (window.command == "compose") {
			this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController()._setView(window.args[0], window.args[1], window.args[2], window.args[3], window.args[4]);
		} else {
			var op = ZmOperation.NEW_MESSAGE;
			if (window.args.msg) {
				switch (window.args.msg._mode) {
					case ZmAppt.MODE_DELETE: 
					case ZmAppt.MODE_DELETE_INSTANCE: 
					case ZmAppt.MODE_DELETE_SERIES: {
						op = ZmOperation.REPLY_CANCEL;
						break;
					}
				}
			}
			cc._setView(op, window.args.msg, null, null, null, window.args.composeMode);
			cc._composeView.setDetach(window.args);
		}
	} else if (window.command == "msgViewDetach") {
		var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
		msgController.isChildWindow = true;
		msgController.show(window.args.msg);
	}
};

/**
* Pass server requests to the main controller.
*/
ZmNewWindow.prototype.sendRequest = 
function(soapDoc, asyncMode, callback, errorCallback, execFrame, timeout) {
	return window.parentController ? window.parentController.sendRequest(soapDoc, asyncMode, callback, errorCallback, execFrame, timeout) :
									 null;
};

/**
* Set status messages via the main controller, so they show up in the client's status area.
*/
ZmNewWindow.prototype.setStatusMsg = 
function(msg, level, detail, delay, transition) {
	if (window.parentController)
		window.parentController.setStatusMsg(msg, level, detail, delay, transition);
};

/**
* Returns a handle to the given app.
*
* @param appName	an app name
*/
ZmNewWindow.prototype.getApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	return this._apps[appName];
};

/**
* Returns a handle to the app view manager.
*/
ZmNewWindow.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
};

// App view mgr calls this, we don't need it to do anything.
ZmNewWindow.prototype.setActiveApp = function() {};

// Private methods

// Creates an app object, which doesn't necessarily do anything just yet.
ZmNewWindow.prototype._createApp =
function(appName) {
	if (this._apps[appName]) return;
	this._apps[appName] = new ZmZimbraMail.APP_CLASS[appName](this._appCtxt, this._shell, window.parentController);
};
