/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the command handler class. The following commands are supported:
 *
 * 		$set:debug {1,2,3}					set debug level to 1, 2, or 3
 * 		$set:debug t						toggle debug timing on/off
 * 		$set:debugtrace {on,off}			turn offline debug trace on/off
 * 		$set:instant_notify					show whether instant notify is on or off
 * 		$set:instant_notify {on,off}		turn instant notify on/off
 *		$set:poll [N]						set poll interval to N seconds (unless doing instant notify)
 * 		$set:noop							send a poll (get notifications)
 * 		$set:rr								refresh reminders
 * 		$set:rh								run reminder housekeeping
 * 		$set:toast							show sample toast messages
 * 		$set:get version					show client version
 * 		$set:expire							expire session; refresh block will come on next response
 * 		$set:refresh						force immediate return of a refresh block
 * 		$set:relogin						logout the user
 * 		$set:alert							issue a test sound alert
 * 		$set:alert {browser,desktop,app} N	issue a test alert in given context in N seconds
 * 		$set:leak {begin,report,end}		manage leak detection
 * 		$set:tabs							show tab groups (in debug window)
 * 		$set:ymid [id]						set Yahoo IM user to id
 * 		$set:log [type]						dump log contents for type
 * 		$set:log [type]	[size]				set number of msgs to keep for type
 * 		$set:compose						compose msg based on mailto: in query string
 * 		$set:error							show error dialog
 * 		$set:modify [setting] [value]		set setting to value, then optionally restart
 * 		$set:clearAutocompleteCache			clear contacts autocomplete cache
 *
 * TODO: should probably I18N the alert messages
 */

/**
 * Creates the client. command handler
 * @class
 * This class represents a client command handler.
 */
ZmClientCmdHandler = function() {
	this._settings = {};
	this._dbg = window.DBG;	// trick to fool minimizer regex
};

/**
 * Executes the command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute =
function(cmdStr, searchController) {

	if (!cmdStr) { return; }

	cmdStr = AjxStringUtil.trim(cmdStr, true);
	
	if (cmdStr == "") { return; }
	
	var argv = cmdStr.split(/\s/);
	var arg0 = argv[0];

	if (arg0 != "modify") {
		cmdStr = cmdStr.toLowerCase();
	}

	var func = this["execute_" + arg0];
	if (func) {
		var args = [].concat(cmdStr, searchController, argv);
		return func.apply(this, args);
	}
};

/**
 * @private
 */
ZmClientCmdHandler.prototype._alert =
function(msg, level) {
	appCtxt.setStatusMsg(msg, level);
};

/**
 * Executes the command with debug.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_debug =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!cmdArg1 || !this._dbg) { return; }
	if (cmdArg1 == "t") {
		var on = this._dbg._showTiming;
		var newState = on ? "off" : "on";
		this._alert("Turning timing info " + newState);
		this._dbg.showTiming(!on);
	} else {
		this._dbg.setDebugLevel(cmdArg1);
		this._alert("Setting debug level to: " + cmdArg1);
	}
};

/**
 * Executes the command with debug trace.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_debugtrace =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!cmdArg1) return;

	var val;
	if (cmdArg1 == "on") {
		val = true;
	} else if (cmdArg1 == "off") {
		val = false;
	}

	if (val != undefined) {
		appCtxt.set(ZmSetting.OFFLINE_DEBUG_TRACE, val, null, null, true);
		this._alert("Debug trace is " + cmdArg1);
	}
};

/**
 * Executes the instant notify "ON" command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_instant_notify =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (typeof cmdArg1 == "undefined") {
		this._alert("Instant notify is "+ (appCtxt.getAppController().getInstantNotify() ? "ON" : "OFF"));
	} else {
		var on = cmdArg1 && (cmdArg1.toLowerCase() == "on");
		this._alert("Set instant notify to "+ (on ? "ON" : "OFF"));
		appCtxt.getAppController().setInstantNotify(on);
	}
};

/**
 * Executes the poll interval command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_poll =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!cmdArg1) return;
	appCtxt.set(ZmSetting.POLLING_INTERVAL, cmdArg1);
	var pi = appCtxt.get(ZmSetting.POLLING_INTERVAL); // LDAP time format converted to seconds
	if (appCtxt.getAppController().setPollInterval(true)) {
		this._alert("Set polling interval to " + pi + " seconds");
	} else {
		this._alert("Ignoring polling interval b/c we are in Instant_Polling mode ($set:instant_notify 0|1)");
	}
};

/**
 * Executes the no op command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_noop =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getAppController().sendNoOp();
	this._alert("Sent NoOpRequest");
};

/**
 * Executes the reminder refresh command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_rr =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getApp(ZmApp.CALENDAR).getReminderController().refresh();
};

/**
 * Executes the reminder housekeeping command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_rh =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getApp(ZmApp.CALENDAR).getReminderController()._housekeepingAction();
};

/**
 * Executes the toast command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_toast =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.setStatusMsg("Your options have been saved.", ZmStatusView.LEVEL_INFO);
	appCtxt.setStatusMsg("Unable to save options.", ZmStatusView.LEVEL_WARNING);
	appCtxt.setStatusMsg("Message not sent.", ZmStatusView.LEVEL_CRITICAL);
};

/**
 * Executes the get version/release/date command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_get =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (cmdArg1 && cmdArg1 == "version") {
		alert("Client Information\n\n" +
			  "Client Version: " + appCtxt.get(ZmSetting.CLIENT_VERSION) + "\n" +
			  "Client Release: " + appCtxt.get(ZmSetting.CLIENT_RELEASE) + "\n" +
			  "    Build Date: " + appCtxt.get(ZmSetting.CLIENT_DATETIME));
	}
};

/**
 * Executes the expire command.
 *
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_expire =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	ZmCsfeCommand.clearSessionId();
	this._alert("Session expired");
};

/**
 * Executes the refresh command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_refresh = 
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	ZmCsfeCommand.clearSessionId();
	appCtxt.getAppController().sendNoOp();
};

/**
 * Executes the re-login command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 * @param	{Object}	[cmdArg2]		command arguments
 */
ZmClientCmdHandler.prototype.execute_relogin =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	ZmCsfeCommand.clearAuthToken();
	appCtxt.getAppController().sendNoOp();
};

/**
 * Executes the alert command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 * @param	{Object}	[cmdArg2]		command arguments
 */
ZmClientCmdHandler.prototype.execute_alert =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	//  $set:alert [sound/browser/app] [delay in seconds]
	function doIt() {
		if (cmdArg1 == "browser") {
			AjxDispatcher.require("Alert");
			ZmBrowserAlert.getInstance().start("Alert Test!");
		} else if (cmdArg1 == "desktop") {
			AjxDispatcher.require("Alert");
			ZmDesktopAlert.getInstance().start("Title!", "Message!");
		} else if (cmdArg1 == "app") {
			appCtxt.getApp(ZmApp.MAIL).startAlert();
		} else {
			AjxDispatcher.require("Alert");
			ZmSoundAlert.getInstance().start();
		}
	}
	setTimeout(doIt, Number(cmdArg2) * 1000);
};

/**
 * Executes the leak detector command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_leak =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	AjxPackage.require("ajax.debug.AjxLeakDetector");
	if (!window.AjxLeakDetector) {
		this._alert("AjxLeakDetector could not be loaded", ZmStatusView.LEVEL_WARNING);
	} else {
		var leakResult = AjxLeakDetector.execute(cmdArg1);
		this._alert(leakResult.message, leakResult.success ? ZmStatusView.LEVEL_INFO : ZmStatusView.LEVEL_WARNING);
	}
};

/**
 * Executes the tabs command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_tabs =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getRootTabGroup().dump(AjxDebug.DBG1);
};

/**
 * Executes the Yahoo! IM command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_ymid =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	var settings = appCtxt.getSettings(),
		setting = settings.getSetting(ZmSetting.IM_YAHOO_ID);
	setting.setValue(cmdArg1 || "");
	settings.save([setting]);
	this._alert("Done");
};

/**
 * Executes the log command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_log =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {

	var type = cmdArg1;
	if (cmdArg2 != null) {
		var size = parseInt(cmdArg2);
		if (!isNaN(size)) {
			AjxDebug.BUFFER_MAX[type] = size;
			this._alert("Debug log size for '" + type + "' set to " + size);
		}
	}
	else {
		appCtxt.getDebugLogDialog().popup(AjxDebug.getDebugLog(type), type);
	}
};

/**
 * Executes the compose command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 */
ZmClientCmdHandler.prototype.execute_compose =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	var mailApp = appCtxt.getApp(ZmApp.MAIL);
	var idx = (location.search.indexOf("mailto"));
	if (idx >= 0) {
		var query = "to=" + decodeURIComponent(location.search.substring(idx+7));
		query = query.replace(/\?/g, "&");

		mailApp._showComposeView(null, query);
		return true;
	}
};

/**
 * Executes the error command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 * @param	{Object}	[cmdArg2]		command arguments
 */
ZmClientCmdHandler.prototype.execute_error =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	var errDialog = appCtxt.getErrorDialog();
	errDialog.setMessage("Error Message!", "Details!!", DwtMessageDialog.WARNING_STYLE);
	errDialog.popup();

};

/**
 * Executes the modify command.
 * 
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 * @param	{Object}	[cmdArg2]		command arguments
 */
ZmClientCmdHandler.prototype.execute_modify =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	var settings = appCtxt.getSettings();
	var id = cmdArg1 && settings.getSettingByName(cmdArg1);
	if (id) {
		var setting = settings.getSetting(id);
		setting.setValue(cmdArg2 || setting.getDefaultValue());
		if (ZmSetting.IS_IMPLICIT[setting.id]) {
			appCtxt.accountList.saveImplicitPrefs();
		} else {
			settings.save([setting]);
		}
	}

	settings._showConfirmDialog(ZmMsg.accountChangeRestart, settings._refreshBrowserCallback.bind(settings));
};

/**
 * Executes the clearAutocompleteCache command.
 *
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 * @param	{Object}	[cmdArg2]		command arguments
 */
ZmClientCmdHandler.prototype.execute_clearAutocompleteCache =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	appCtxt.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
	this._alert("Contacts autocomplete cache cleared");
};

/**
 * Executes the getCharWidth command.
 *
 * @param	{String}	cmdStr		the command
 * @param	{ZmSearchController}	searchController	the search controller
 * @param	{Object}	[cmdArg1]		command arguments
 * @param	{Object}	[cmdArg2]		command arguments
 */
ZmClientCmdHandler.prototype.execute_getCharWidth =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	var cla = appCtxt.getApp(ZmApp.CONTACTS).getContactList().getArray();
	for (var i = 0; i < cla.length; i++) {
		ZmClientCmdHandler._testWidth(cla[i]._attrs["firstLast"] || cla[i]._attrs["company"] || "");
	}
	var text = [];
	text.push("Avg char width: " + ZmClientCmdHandler.WIDTH / ZmClientCmdHandler.CHARS);
	text.push("Avg bold char width: " + ZmClientCmdHandler.BWIDTH / ZmClientCmdHandler.CHARS);
	var w = ZmClientCmdHandler._testWidth(AjxStringUtil.ELLIPSIS);
	text.push("Ellipsis width: " + w.w);
	w = ZmClientCmdHandler._testWidth(", ");
	text.push("Comma + space width: " + w.w);
	alert(text.join("\n"));
};

ZmClientCmdHandler.CHARS = 0;
ZmClientCmdHandler.WIDTH = 0;
ZmClientCmdHandler.BWIDTH = 0;

ZmClientCmdHandler._testWidth =
function(str) {
	var div = document.createElement("DIV");
	div.style.position = Dwt.ABSOLUTE_STYLE;
	var shellEl = appCtxt.getShell().getHtmlElement();
	shellEl.appendChild(div);
	Dwt.setLocation(div, Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
	div.innerHTML = str;
	var size = Dwt.getSize(div);
	ZmClientCmdHandler.CHARS += str.length;
	ZmClientCmdHandler.WIDTH += size.x;
	div.style.fontWeight = "bold";
	var bsize = Dwt.getSize(div);
	ZmClientCmdHandler.BWIDTH += bsize.x;
	shellEl.removeChild(div);
	return {w:size.x, bw:bsize.x};
};
