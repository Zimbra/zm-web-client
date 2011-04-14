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
	this._modules = [];
};

ZmUnitTestManager.prototype.toString = function() { return "ZmUnitTestManager"; };

ZmUnitTestManager.prototype.addModule =
function(module) {
	this._modules.push(module);
};

/**
 * Runs unit tests. Check the query string argument that was passed to us to
 * see which tests to run: all of them, or a select subset.
 * 
 * @param {string}	which		value of "unittest" query string argument
 */
ZmUnitTestManager.prototype.runTests =
function(which) {

	this._panel = new ZmUnitTestPanel();
	
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
	this._panel.setLocation(0, newH);
	this._panel.setScrollStyle(Dwt.SCROLL);

	// If we're only to run tests for specified modules, put them in a hash
	var modHash;
	if (which && which != "1" && which != "all") {
		modHash = AjxUtil.arrayAsHash(which.split(","));
	}
	
	// This is our unit testing run loop. The window.* function calls are into QUnit.
	var modules = this._modules;
	for (var i = 0; i < this._modules.length; i++) {
		var mod = this._modules[i];
		if (!modHash || modHash[mod.name]) {
			window.module(mod.name);
			var utests = mod.getTests();
			if (utests && utests.length) {
				for (var j = 0; j < utests.length; j++) {
					var utest = utests[j];
					window.test(utest.name, function() {
						window.ok(utest.run());
					});
					utest.cleanup();
				}
			}
		}
	}
};

window.unitTestManager = new ZmUnitTestManager();


/**
 * Creates a DIV to hold the QUnit UI.
 * @constructor
 * @class
 * This is a panel below the shell that contains the QUnit UI.
 * 
 * @param {hash}	params		standard DwtControl params
 * 
 * TODO: Does this need to be a control? I doubt it.
 */
ZmUnitTestPanel = function(params) {
	
	params = params || {};
	params.className = "ZmUnitTestPanel";
	DwtControl.call(this, params);
	this.__ctrlInited = true;
	var htmlElement = document.createElement("div");
	this._htmlElId = htmlElement.id = params.id || Dwt.getNextId();
	DwtControl.ALL_BY_ID[this._htmlElId] = this;
	htmlElement.className = params.className;
	htmlElement.style.position = Dwt.ABSOLUTE_STYLE;
	htmlElement.style.overflow = Dwt.SCROLL;
	document.body.appendChild(htmlElement);
	
	// QUnit UI
	var html = [], idx = 0;
	html[idx++] = "<h1 id='qunit-header'>QUnit Test</h1>";
	html[idx++] = "<h2 id='qunit-banner'></h2>";
	html[idx++] = "<div id='qunit-testrunner-toolbar'></div>";
	html[idx++] = "<h2 id='qunit-userAgent'></h2>";
	html[idx++] = "<ol id='qunit-tests'></ol>";
	html[idx++] = "<p id='qunit-testresult' class='result'></p>";
	html[idx++] = "<div id='qunit-fixture'>test markup</div>";
	htmlElement.innerHTML = html.join("");
};

ZmUnitTestPanel.prototype = new DwtControl;
ZmUnitTestPanel.prototype.constructor = ZmUnitTestPanel;

ZmUnitTestPanel.prototype.toString = function() { return "ZmUnitTestPanel"; };




ZmUnitTestModule = function(name) {
	
	if (arguments.length == 0) { return; }
	
	this.name = name;
	window.unitTestManager.addModule(this);
	this._tests = [];
};

ZmUnitTestModule.prototype.toString = function() { return "ZmUnitTestModule"; };

ZmUnitTestModule.prototype.addTest =
function(utest) {
	this._tests.push(utest);
};

ZmUnitTestModule.prototype.getTests =
function() {
	return this._tests;
};

/**
 * Creates a new unit test.
 * @constructor
 * @class
 * This class represents a single unit test. To add a unit test, create an instance
 * of this class and define its run method (and, optionally, its cleanup method).
 * 
 * @param {string}	module		module name
 * @param {string}	name		unit test name
 * 
 * TODO: add utility methods to help with ZCS tests
 */
ZmUnitTest = function(name) {
	if (arguments.length == 0) { return; }
	this.name = name;
};

ZmUnitTest.prototype.toString = function() { return "ZmUnitTest"; };

// default implementation: pass the test
ZmUnitTest.prototype.run = function() {
	return true;
};

ZmUnitTest.prototype.cleanup = function() {};

// fake events that tests can pass to listeners
ZmUnitTest.controlEvent 	= new DwtControlEvent();
ZmUnitTest.focusEvent 		= new DwtFocusEvent();
ZmUnitTest.keyEvent 		= new DwtKeyEvent();
ZmUnitTest.mouseEvent 		= new DwtMouseEvent();
ZmUnitTest.selectionEvent	= new DwtSelectionEvent(true);
ZmUnitTest.treeEvent 		= new DwtTreeEvent();
