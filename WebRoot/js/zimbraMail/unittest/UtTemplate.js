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

UtTemplate = function() {

	ZmUnitTestModule.call(this, "Template");

	this.addTest(new UtTemplateTest1());
};
UtTemplate.prototype = new ZmUnitTestModule;
UtTemplate.prototype.constructor = UtTemplate;



// Comment about what is being tested

UtTemplateTest1 = function() {
	ZmUnitTest.call(this, "Summary of test");
};
UtTemplateTest1.prototype = new ZmUnitTest;
UtTemplateTest1.prototype.constructor = UtTemplateTest1;

UtTemplateTest1.prototype.run =
function() {
	return success;
};

// Override if any cleanup needs to be done
UtTemplateTest1.prototype.cleanup =
function() {
};

// Instantiate this module and add it and its tests to the test suite.
new UtTemplate();
