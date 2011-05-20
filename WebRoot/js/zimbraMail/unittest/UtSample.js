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

UtSample = function() {

	ZmUnitTestModule.call(this, "Sample");

	this.addTest(new UtSampleTestMultiplication());
	this.addTest(new UtSampleTestSearchDialog());
	this.addTest(new UtSampleTestReferenceError());
};
UtSample.prototype = new ZmUnitTestModule;
UtSample.prototype.constructor = UtSample;

// See if basic multiplication works.

UtSampleTestMultiplication = function() {
	ZmUnitTest.call(this, "Multiplication");
};
UtSampleTestMultiplication.prototype = new ZmUnitTest;
UtSampleTestMultiplication.prototype.constructor = UtSampleTestMultiplication;

UtSampleTestMultiplication.prototype.run =
function() {
	return (4*2 == 8);
};

// Make sure the save search dialog comes up.

UtSampleTestSearchDialog = function() {
	ZmUnitTest.call(this, "Press Save button, search dialog pops up");
};
UtSampleTestSearchDialog.prototype = new ZmUnitTest;
UtSampleTestSearchDialog.prototype.constructor = UtSampleTestSearchDialog;

UtSampleTestSearchDialog.prototype.run =
function() {
	var sc = appCtxt.getSearchController();
	sc._saveButtonListener();
	
	var dlg = appCtxt.getNewSearchDialog();
	return (dlg && dlg.getVisible());
};

UtSampleTestSearchDialog.prototype.cleanup =
function() {
	var dlg = appCtxt.getNewSearchDialog();
	if (dlg) {
		dlg.popdown();
	}
};

// Generate a reference error.

UtSampleTestReferenceError = function() {
	ZmUnitTest.call(this, "Reference error");
};
UtSampleTestReferenceError.prototype = new ZmUnitTest;
UtSampleTestReferenceError.prototype.constructor = UtSampleTestReferenceError;

UtSampleTestReferenceError.prototype.run =
function() {
	var fooberries = foo.berries;
	return true;
};

// Instantiate this module and add it and its tests to the test suite.
new UtSample();
