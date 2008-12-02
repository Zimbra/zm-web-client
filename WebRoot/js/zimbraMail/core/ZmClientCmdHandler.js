/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmClientCmdHandler = function() {
	this._settings = {};
	this._dbg = window.DBG;	// trick to fool minimizer regex
};

ZmClientCmdHandler.prototype.execute =
function(cmdStr, searchController) {

	if (!cmdStr) { return; }

	cmdStr = AjxStringUtil.trim(cmdStr, true);
	
	if (cmdStr == "") { return; }
	
	cmdStr = cmdStr.toLowerCase();
	var argv = cmdStr.split(/\s/);
	var arg0 = argv[0];

	var func = this["execute_"+arg0];
	if (func) {
		var args = [].concat(cmdStr, searchController, argv);
		return func.apply(this, args);
	}
};

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

ZmClientCmdHandler.prototype.execute_support =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!cmdArg1) return;
	var feature = cmdArg1.toUpperCase();
	var setting = "ZmSetting." + feature + "_ENABLED";
	var id = eval(setting);
	var on = appCtxt.get(id);
	if (on == undefined) {
		this._alert("No such setting: " + setting);
		return;
	}
	var newState = on ? "off" : "on";
	alert("Turning " + feature + " support " + newState);
	this._settings[id] = !on;
	appCtxt.getAppController().restart(this._settings);
};

ZmClientCmdHandler.prototype.execute_instant_notify =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (typeof cmdArg1 == "undefined") {
		this._alert("Instant notify is "+ (appCtxt.getAppController().getInstantNotify() ? "ON" : "OFF"));
	} else {
		var on = false;
		if (cmdArg1 && cmdArg1 == 1) {
			on = true;
		}
		this._alert("Set instant notify to "+ (on ? "ON" : "OFF"));
		appCtxt.getAppController().setInstantNotify(on);
	}
};

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

ZmClientCmdHandler.prototype.execute_noop =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getAppController().sendNoOp();
	this._alert("Sent NoOpRequest");
};
ZmClientCmdHandler.prototype.execute_nop = ZmClientCmdHandler.prototype.noop;

ZmClientCmdHandler.prototype.execute_a =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!this._assistantDialog) {
		AjxDispatcher.require("Assistant");
		this._assistantDialog = new ZmAssistantDialog();
	}
	searchController.setSearchField("");
	this._assistantDialog.popup();
};

ZmClientCmdHandler.prototype.execute_rr =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getApp(ZmApp.CALENDAR).getReminderController().refresh();
};

ZmClientCmdHandler.prototype.execute_rh =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.getApp(ZmApp.CALENDAR).getReminderController()._housekeepingAction();
};

ZmClientCmdHandler.prototype.execute_toast =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	appCtxt.setStatusMsg("Your options have been saved.", ZmStatusView.LEVEL_INFO);
	appCtxt.setStatusMsg("Unable to save options.", ZmStatusView.LEVEL_WARNING);
	appCtxt.setStatusMsg("Message not sent.", ZmStatusView.LEVEL_CRITICAL);
};

ZmClientCmdHandler.prototype.execute_get =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!cmdArg1) return;
	var item = cmdArg1;
	if (item == "version") {
		alert("Client Information\n\n" +
			  "Client Version: " + appCtxt.get(ZmSetting.CLIENT_VERSION) + "\n" +
			  "Client Release: " + appCtxt.get(ZmSetting.CLIENT_RELEASE) + "\n" +
			  "    Build Date: " + appCtxt.get(ZmSetting.CLIENT_DATETIME));
	}
};

ZmClientCmdHandler.prototype.execute_refresh = 
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	ZmCsfeCommand.setSessionId(null);
	appCtxt.getAppController().sendNoOp();
};

ZmClientCmdHandler.prototype.execute_relogin =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	ZmCsfeCommand.clearAuthToken();
	appCtxt.getAppController().sendNoOp();
};

ZmClientCmdHandler.prototype.execute_alert =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	//  $set:alert [sound/browser/app] [delay in seconds]
	function doIt() {
		if (cmdArg1 == "browser") {
			AjxDispatcher.require("Alert");
			ZmBrowserAlert.getInstance().start("Alert Test!");
		} else if (cmdArg1 == "app") {
			appCtxt.getApp(ZmApp.MAIL).startAlert();
		} else {
			AjxDispatcher.require("Alert");
			ZmSoundAlert.getInstance().start();
		}
	}
	setTimeout(doIt, Number(cmdArg2) * 1000);
};

ZmClientCmdHandler.prototype.execute_leak =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	if (!window.AjxLeakDetector) {
		this._alert("AjxLeakDetector is not loaded", ZmStatusView.LEVEL_WARNING);
	} else {
		var leakResult = AjxLeakDetector.execute(cmdArg1);
		this._alert(leakResult.message, leakResult.success ? ZmStatusView.LEVEL_INFO : ZmStatusView.LEVEL_WARNING);
	}
};

ZmClientCmdHandler.prototype.execute_ymid =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	var settings = appCtxt.getSettings(),
		setting = settings.getSetting(ZmSetting.IM_YAHOO_ID);
	setting.setValue(cmdArg1 || "");
	settings.save([setting]);
	this._alert("Done");
};

ZmClientCmdHandler.prototype.execute_expando =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	var known_a = AjxEnv.isIE ? ZmClientCmdHandler._PROPS_IE : ZmClientCmdHandler._PROPS_FF;
	var known = {};
	var len = known_a.length;
	for (var i = 0; i < len; i++) {
		known[known_a[i]] = true;
	}
	var expandos = {};
	var divs = document.getElementsByTagName("DIV");
	len = divs.length;
	for (var i = 0; i < len; i++) {
		var el = divs[i];
		if (el.id && (el.id.indexOf("DWT") != -1)) {
			this._dumpEl(el, known, expandos);
		}
	}
	var exp = [];
	for (var p in expandos) {
		exp.push(p);
	}
	exp.sort();
	DBG.printRaw(exp.join("\n"));
};

ZmClientCmdHandler.prototype.execute_log =
function(cmdStr, searchController, cmdName, cmdArg1 /* ..., cmdArgN */) {
	var type = cmdArg1;
	var text = AjxUtil.LOG[type].join("<br/>");
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	msgDialog.setMessage(text, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
};

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

ZmClientCmdHandler.prototype._alert =
function(msg, level) {
	appCtxt.setStatusMsg(msg, level);
};

ZmClientCmdHandler.prototype.execute_chat =
function(cmdStr, searchController, cmdName, cmdArg1, cmdArg2 /* ..., cmdArgN */) {
	function doIt() {
		var jsonObj = {
			n: [
				{
				  body: [
					{
					  _content: cmdArg2 || "<span style=''>:) Whatever </span>",
					  html: true
					}
				   ],
				  from: "user2@secondchair-lm-corp-yahoo-com.local",
				  seq: 0,
				  thread: "user2@secondchair-lm-corp-yahoo-com.local-5",
				  ts: 1215626211402,
				  type: "message"
				 }
			   ]
		};
		AjxDispatcher.run("GetRoster").pushNotification(jsonObj);
	}
	AjxTimedAction.scheduleAction(new AjxTimedAction(null, doIt), (cmdArg1 || 0) * 1000);
};

ZmClientCmdHandler.prototype._dumpEl =
function dumpEl(el, known, expandos) {
	var props = [];
	for (var p in el) {
		props.push(p);
	}
	props.sort();
	var text = [], idx = 0;
	var len = props.length;
	for (var i = 0; i < len; i++) {
		var prop = props[i];
		if (!known[prop]) {
			if (prop == "dwtObj") {
				var x = 1;
			}
			expandos[prop] = true;
//			text[idx++] = prop + ": " + el.prop + "\n";
//			text[idx++] = ['"', prop, '",', "\n"].join("");
		}
	}
	
	return text.join("");
};

ZmClientCmdHandler._PROPS_FF = [
	"ATTRIBUTE_NODE",
	"CDATA_SECTION_NODE",
	"COMMENT_NODE",
	"DOCUMENT_FRAGMENT_NODE",
	"DOCUMENT_NODE",
	"DOCUMENT_POSITION_CONTAINED_BY",
	"DOCUMENT_POSITION_CONTAINS",
	"DOCUMENT_POSITION_DISCONNECTED",
	"DOCUMENT_POSITION_FOLLOWING",
	"DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",
	"DOCUMENT_POSITION_PRECEDING",
	"DOCUMENT_TYPE_NODE",
	"ELEMENT_NODE",
	"ENTITY_NODE",
	"ENTITY_REFERENCE_NODE",
	"NOTATION_NODE",
	"PROCESSING_INSTRUCTION_NODE",
	"TEXT_NODE",
	"align",
	"appendChild",
	"attributes",
	"baseURI",
	"blur",
	"childNodes",
	"className",
	"clientHeight",
	"clientWidth",
	"cloneNode",
	"compareDocumentPosition",
	"dir",
	"dispatchEvent",
	"firstChild",
	"focus",
	"getAttribute",
	"getAttributeNS",
	"getAttributeNode",
	"getAttributeNodeNS",
	"getElementsByTagName",
	"getElementsByTagNameNS",
	"getFeature",
	"getUserData",
	"hasAttribute",
	"hasAttributeNS",
	"hasAttributes",
	"hasChildNodes",
	"id",
	"innerHTML",
	"insertBefore",
	"isDefaultNamespace",
	"isEqualNode",
	"isSameNode",
	"isSupported",
	"lang",
	"lastChild",
	"localName",
	"lookupNamespaceURI",
	"lookupPrefix",
	"namespaceURI",
	"nextSibling",
	"nodeName",
	"nodeType",
	"nodeValue",
	"normalize",
	"offsetHeight",
	"offsetLeft",
	"offsetParent",
	"offsetTop",
	"offsetWidth",
	"onclick",
	"oncontextmenu",
	"ondblclick",
	"onkeypress",
	"onmousedown",
	"onmousemove",
	"onmouseout",
	"onmouseover",
	"onmouseup",
	"onscroll",
	"onselectstart",
	"ownerDocument",
	"parentNode",
	"prefix",
	"previousSibling",
	"removeAttribute",
	"removeAttributeNS",
	"removeAttributeNode",
	"removeChild",
	"removeEventListener",
	"replaceChild",
	"scrollHeight",
	"scrollLeft",
	"scrollTop",
	"scrollWidth",
	"setAttribute",
	"setAttributeNS",
	"setAttributeNode",
	"setAttributeNodeNS",
	"setUserData",
	"spellcheck",
	"style",
	"tabIndex",
	"tagName",
	"textContent",
	"title",
	"xml"
];

ZmClientCmdHandler._PROPS_IE = [
	"accessKey",
	"align",
	"all",
	"attributes",
	"behaviorUrns",
	"canHaveChildren",
	"canHaveHTML",
	"childNodes",
	"children",
	"className",
	"clientHeight",
	"clientLeft",
	"clientTop",
	"clientWidth",
	"contentEditable",
	"currentStyle",
	"dataFld",
	"dataFormatAs",
	"dataSrc",
	"dir",
	"disabled",
	"document",
	"filters",
	"firstChild",
	"hideFocus",
	"id",
	"innerHTML",
	"innerText",
	"isContentEditable",
	"isDisabled",
	"isMultiLine",
	"isTextEdit",
	"lang",
	"language",
	"lastChild",
	"nextSibling",
	"noWrap",
	"nodeName",
	"nodeType",
	"nodeValue",
	"offsetHeight",
	"offsetLeft",
	"offsetParent",
	"offsetTop",
	"offsetWidth",
	"onactivate",
	"onafterupdate",
	"onbeforeactivate",
	"onbeforecopy",
	"onbeforecut",
	"onbeforedeactivate",
	"onbeforeeditfocus",
	"onbeforepaste",
	"onbeforeupdate",
	"onblur",
	"oncellchange",
	"onclick",
	"oncontextmenu",
	"oncontrolselect",
	"oncopy",
	"oncut",
	"ondataavailable",
	"ondatasetchanged",
	"ondatasetcomplete",
	"ondblclick",
	"ondeactivate",
	"ondrag",
	"ondragend",
	"ondragenter",
	"ondragleave",
	"ondragover",
	"ondragstart",
	"ondrop",
	"onerrorupdate",
	"onfilterchange",
	"onfocus",
	"onfocusin",
	"onfocusout",
	"onhelp",
	"onkeydown",
	"onkeypress",
	"onkeyup",
	"onlayoutcomplete",
	"onlosecapture",
	"onmousedown",
	"onmouseenter",
	"onmouseleave",
	"onmousemove",
	"onmouseout",
	"onmouseover",
	"onmouseup",
	"onmousewheel",
	"onmove",
	"onmoveend",
	"onmovestart",
	"onpage",
	"onpaste",
	"onpropertychange",
	"onreadystatechange",
	"onresize",
	"onresizeend",
	"onresizestart",
	"onrowenter",
	"onrowexit",
	"onrowsdelete",
	"onrowsinserted",
	"onscroll",
	"onselectstart",
	"outerHTML",
	"outerText",
	"ownerDocument",
	"parentElement",
	"parentNode",
	"parentTextEdit",
	"previousSibling",
	"readyState",
	"recordNumber",
	"runtimeStyle",
	"scopeName",
	"scrollHeight",
	"scrollLeft",
	"scrollTop",
	"scrollWidth",
	"sourceIndex",
	"style",
	"tabIndex",
	"tagName",
	"tagUrn",
	"title"
];
