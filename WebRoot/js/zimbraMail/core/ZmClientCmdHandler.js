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

	if (arg0 == "debug") {
		if (!argv[1] || !this._dbg) { return; }
		if (argv[1] == "t") {
			var on = this._dbg._showTiming;
			var newState = on ? "off" : "on";
			this._alert("Turning timing info " + newState);
			this._dbg.showTiming(!on);
		} else {
			var level = argv[1];
			this._dbg.setDebugLevel(level);
			this._alert("Setting debug level to: " + level);
		}
	} else if (arg0 == "support") {
		if (!argv[1]) return;
		var feature = argv[1].toUpperCase();
		var setting = "ZmSetting." + feature + "_ENABLED"
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
	} else if (arg0 == "instant_notify") {
		if (argv.length <= 1) {
			this._alert("Instant notify is "+ (appCtxt.getAppController().getInstantNotify() ? "ON" : "OFF"));
		} else {
			var on = false;
			if (argv[1] && argv[1] == 1) {
				on = true;
			}
			this._alert("Set instant notify to "+ (on ? "ON" : "OFF"));
			appCtxt.getAppController().setInstantNotify(on);
		}
	} else if (arg0 == "poll") {
		if (!argv[1]) return;
		appCtxt.set(ZmSetting.POLLING_INTERVAL, argv[1]);
		var pi = appCtxt.get(ZmSetting.POLLING_INTERVAL); // LDAP time format converted to seconds
		if (appCtxt.getAppController().setPollInterval()) {
			this._alert("Set polling interval to " + pi + " seconds");
		} else {
			this._alert("Ignoring polling interval b/c we are in Instant_Polling mode ($set:instant_notify 0|1)");
		}
	} else if (arg0 == "noop") {
		appCtxt.getAppController().sendNoOp();
		this._alert("Sent NoOpRequest");
	} else if (arg0 == "a") {
		if (!this._assistantDialog) {
			AjxDispatcher.require("Assistant");
			this._assistantDialog = new ZmAssistantDialog();
		}
		searchController.setSearchField("");
		this._assistantDialog.popup();
	} else if (arg0 == "rr") {		
		appCtxt.getApp(ZmApp.CALENDAR).getReminderController().refresh();
	} else if (arg0 == "rh") {
		appCtxt.getApp(ZmApp.CALENDAR).getReminderController()._housekeepingAction();
	} else if (arg0 == "toast") {
		appCtxt.setStatusMsg("Your options have been saved.", ZmStatusView.LEVEL_INFO);
		appCtxt.setStatusMsg("Unable to save options.", ZmStatusView.LEVEL_WARNING);
		appCtxt.setStatusMsg("Message not sent.", ZmStatusView.LEVEL_CRITICAL);
	} else if (arg0 == "get") {
		if (!argv[1]) return;
		var item = argv[1];
		if (item == "version") {		
			alert("Client Information\n\n" +
			      "Client Version: " + appCtxt.get(ZmSetting.CLIENT_VERSION) + "\n" +
			      "Client Release: " + appCtxt.get(ZmSetting.CLIENT_RELEASE) + "\n" +
			      "    Build Date: " + appCtxt.get(ZmSetting.CLIENT_DATETIME));
		}
	} else if (arg0 == "refresh") {
		ZmCsfeCommand.setSessionId(null);
		appCtxt.getAppController().sendNoOp();
	} else if (arg0 == "leak") {
		if (!window.AjxLeakDetector) {
			this._alert("AjxLeakDetector is not loaded", ZmStatusView.LEVEL_WARNING);
		} else {
			var leakResult = AjxLeakDetector.execute(argv[1]);
			this._alert(leakResult.message, leakResult.success ? ZmStatusView.LEVEL_INFO : ZmStatusView.LEVEL_WARNING);
		}
	} else if (arg0 == "expando") {
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
	} else if (arg0 == "log") {
		var type = argv[1];
		var text = AjxUtil.LOG[type].join("<br/>");
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.reset();
		msgDialog.setMessage(text, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
	}
};

ZmClientCmdHandler.prototype._alert = 
function(msg, level) {
	appCtxt.setStatusMsg(msg, level);
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
"xml"];

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
"title"];
