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
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmClientCmdHandler(appCtxt) {
	this._appCtxt = appCtxt;
	this._settings = new Object();
}

ZmClientCmdHandler.prototype.execute =
function(argv) {
	if (!argv || !argv[0]) return ;
	var arg0 = argv[0].toLowerCase();
	if (arg0 == "debug") {
		if (!argv[1]) return;
		if (argv[1] == "t") {
			var on = DBG._showTiming;
			var newState = on ? "off" : "on";
			alert("Turning debug timing info " + newState);
			DBG.showTiming(!on);
		} else {
			var arg = Number(argv[1]);
			var level = AjxDebug.DBG[arg];
			if (level) {
				alert("Setting Debug to level:" + level);
				DBG.setDebugLevel(level);
			} else {
				alert("Invalid debug level");
			}
		}
	} else if (arg0 == "debug_use_div") {
		if (!argv[1]) {
			alert('enter true or false');
			return;
		}
		var arg = argv[1].toLowerCase();
		if (arg == 'true') {
			DBG.setUseDiv(true);
		} else {
			DBG.setUseDiv(false);
		}
		alert('set use div to ' + ((arg == 'true')? 'true': 'false'));
	} else if (arg0 == "support") {
		if (!argv[1]) return;
		var feature = argv[1].toUpperCase();
		var setting = "ZmSetting." + feature + "_ENABLED"
		var id = eval(setting);
		var on = this._appCtxt.get(id);
		if (on == undefined) {
			alert("No such setting: " + setting);
			return;
		}
		var newState = on ? "off" : "on";
		alert("Turning " + feature + " support " + newState);
		this._settings[id] = !on;
		this._appCtxt.getAppController().restart(this._settings);
	} else if (arg0 == "poll") {
		if (!argv[1]) return;
		this._appCtxt.set(ZmSetting.POLLING_INTERVAL, argv[1]);
		var pi = this._appCtxt.get(ZmSetting.POLLING_INTERVAL); // LDAP time format converted to seconds
		alert("Set polling interval to " + pi + " seconds");
		this._appCtxt.getAppController().setPollInterval();
	} else if (arg0 == "feed") {
		if (!argv[1]) return;	
		var enabled = argv[1] == 1;
		ZmNewFolderDialog._feedEnabled = enabled;
		alert("Turning "+ (enabled ? "on" : "off") +" feed support in new folder dialog");
	}
}
