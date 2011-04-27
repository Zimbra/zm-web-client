/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a singleton unit test manager.
 * @constructor
 * @class
 * This class provides a bridge between QUnit and ZCS. It creates a panel
 * below the shell that holds the QUnit UI, and provides a method to run
 * unit tests.
 * 
 * @author Conrad Damon
 */
ZmUnitTestManager = function() {

	// hash for setting a callback for a particular server request
	window.UT.callback = {};

	// clean up hack for getting QUnit to export into UT namespace
	delete window.exports;
	delete window.require;
};

ZmUnitTestManager.prototype.toString = function() { return "ZmUnitTestManager"; };

ZmUnitTestManager.prototype.runTests =
function() {
	this._initialize();
	AjxDispatcher.require("UnitTest");
};

ZmUnitTestManager.prototype.rerunTests =
function() {
	UT.QUnit.reset();
	AjxDispatcher.require("UnitTest");
};

ZmUnitTestManager.prototype._initialize =
function() {

	if (this._initialized) { return; }
	
	this._panel = this._createTestPanel();
	
	// Resize the shell to allow room for the unit test panel. We need to do
	// that after ZCS has finished its layout, so we do it here.
	var shell = appCtxt.getShell()
	var shellSize = shell.getSize();
	var newH = shellSize.y - 300;
	var ev = DwtShell.controlEvent;
	ev.oldWidth = ev.newWidth = shellSize.x;
	ev.oldHeight = shellSize.y;
	ev.newHeight = newH;
	Dwt.setSize(shell.getHtmlElement(), Dwt.DEFAULT, newH);
	// Tell the app view mgr that shell dimensions have changed.
	appCtxt.getAppViewMgr()._shellControlListener(ev);
	Dwt.setLocation(this._panel, 0, newH);
	Dwt.setScrollStyle(this._panel, Dwt.SCROLL);
	
	this._initialized = true;
};

ZmUnitTestManager.prototype._createTestPanel =
function() {
	
	var panel = document.createElement("div");
	panel.id = Dwt.getNextId();
	panel.className = "ZmUnitTestPanel";
	panel.style.position = Dwt.ABSOLUTE_STYLE;
	panel.style.overflow = Dwt.SCROLL;
	document.body.appendChild(panel);
	
	var qs = AjxStringUtil.parseQueryString();
	var utLink = 'javascript:window.unitTestManager.rerunTests("' + qs.unittest + '")';
	
	// QUnit UI
	var html = [], idx = 0;
	html[idx++] = "<h1 id='qunit-header'><a href='" + utLink + "'>QUnit Test</a></h1>";
	html[idx++] = "<h2 id='qunit-banner'></h2>";
	html[idx++] = "<div id='qunit-testrunner-toolbar'></div>";
	html[idx++] = "<h2 id='qunit-userAgent'></h2>";
	html[idx++] = "<ol id='qunit-tests'></ol>";
	html[idx++] = "<p id='qunit-testresult' class='result'></p>";
	html[idx++] = "<div id='qunit-fixture'>test markup</div>";
	panel.innerHTML = html.join("");
	
	return panel;
};

if (window.UT) {
	window.unitTestManager = new ZmUnitTestManager();
}


/**
 * Static utility class with unit test helper functions.
 */
ZmUnitTestUtil = function() {};

/**
 * Simulate a key being typed. Note that keyCode and charCode are not the same thing,
 * and we need both. The key code is the physical key that was pressed, so it's
 * case-independent. The char code represent the resulting symbol, so it can have a
 * case.
 * 
 * See QUnit.triggerEvent for simulating mouse events.
 * 
 * @param {Element}	element
 * @param {number}	keyCode
 * @param {number}	charCode
 */
ZmUnitTestUtil.emulateKeyPress =
function(element, keyCode, charCode) {
	element = (typeof element == "string") ? document.getElementById(element) : element;
	element.value += String.fromCharCode(charCode);	
	ZmUnitTestUtil.fireKeyEvent(element, "keyup", keyCode);
};

ZmUnitTestUtil.fireKeyEvent =
function(element, event, keyCode, altKey, ctrlKey, metaKey) {

	var ev = ZmUnitTestUtil.getEvent(event);
	ev.keyCode = ev.charCode = ev.which = keyCode;
	ev.altKey = altKey;
	ev.ctrlKey = ctrlKey;
	ev.metaKey = metaKey;
	
	ZmUnitTestUtil.fireEvent(element, event, ev);
};

ZmUnitTestUtil.getEvent =
function(event) {
	
	var ev = (AjxEnv.isIE) ? document.createEventObject() : document.createEvent("HTMLEvents");
	if (AjxEnv.isIE) {
		ev.type = event;
	}
	else {
		ev.initEvent(event, true, true);
	}
	
	return ev;
};

ZmUnitTestUtil.fireEvent =
function(element, event, ev) {
	
	element = (typeof element == "string") ? document.getElementById(element) : element;
	
	ev = ev || ZmUnitTestUtil.getEvent(event);
	if (AjxEnv.isIE) {
		return element.fireEvent("on" + event, ev);
	}
	else {
		return !element.dispatchEvent(ev);
	}
};

ZmUnitTestUtil.goToCompose =
function() {
	var ctlr = appCtxt.getApp(ZmApp.MAIL).getMailListController();
	ctlr._newListener(new DwtSelectionEvent(true), ZmOperation.NEW_MENU);
};
