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


UtString = function() {

	ZmUnitTestModule.call(this, "String");

	this.addTest(new UtStringTestPrependSpace());
	this.addTest(new UtStringTestDoubleQuotes());
	this.addTest(new UtStringTestJsEscape());
	this.addTest(new UtStringTestHtmlEscape());
	this.addTest(new UtStringTestSingleQuotes());
	this.addTest(new UtStringTestDoubleQuotes1());
};
UtString.prototype = new ZmUnitTestModule;
UtString.prototype.constructor = UtString;

UtStringTestPrependSpace = function() {
	ZmUnitTest.call(this, "buildAttribute() method, prependSpace argument test");
};
UtStringTestPrependSpace.prototype = new ZmUnitTest;
UtStringTestPrependSpace.prototype.constructor = UtStringTestPrependSpace;

UtStringTestPrependSpace.prototype.run = function() {
	var result = AjxStringUtil.buildAttribute("attrName", "attrValue", true);
	return (result == " attrName='attrValue'");	 
};

UtStringTestDoubleQuotes = function() {
	ZmUnitTest.call(this, "buildAttribute() method, doubleQuotes argument test");
};
UtStringTestDoubleQuotes.prototype = new ZmUnitTest;
UtStringTestDoubleQuotes.prototype.constructor = UtStringTestDoubleQuotes;

UtStringTestDoubleQuotes.prototype.run = function() {
	var result = AjxStringUtil.buildAttribute("attrName", "attrValue", false, true);
	return (result == 'attrName="attrValue"');	 
};

UtStringTestJsEscape = function() {
	ZmUnitTest.call(this, "buildAttribute() method, jsEscape argument test");
};
UtStringTestJsEscape.prototype = new ZmUnitTest;
UtStringTestJsEscape.prototype.constructor = UtStringTestJsEscape;

UtStringTestJsEscape.prototype.run = function() {
	var val = " any <value> &   with '*! special <<characters>> ";
	var result = AjxStringUtil.buildAttribute("attrName", val, false, false, true);
	var expected = "attrName=" + AjxStringUtil.quoteString(escape(val));
	return (result == expected);
};

UtStringTestHtmlEscape = function() {
	ZmUnitTest.call(this, "buildAttribute() method, htmlEscape argument test");
};
UtStringTestHtmlEscape.prototype = new ZmUnitTest;
UtStringTestHtmlEscape.prototype.constructor = UtStringTestHtmlEscape;

UtStringTestHtmlEscape.prototype.run = function() {
	var val = " any <value> &   with '*! special <<characters>> ";
	var result = AjxStringUtil.buildAttribute("attrName", val, false, false, false, true);
	var expected = "attrName=" + AjxStringUtil.quoteString(AjxStringUtil.htmlEncode(val));
	return (result == expected);
};

UtStringTestSingleQuotes = function() {
	ZmUnitTest.call(this, "quoteString() method, singleQuotes test");
};
UtStringTestSingleQuotes.prototype = new ZmUnitTest;
UtStringTestSingleQuotes.prototype.constructor = UtStringTestSingleQuotes;

UtStringTestSingleQuotes.prototype.run = function() {
	var val = " any <value> &   with '*! special <<characters>> ";
	var result = AjxStringUtil.quoteString(val);
	var expected = "'" + val + "'";
	return (result == expected);
};

UtStringTestDoubleQuotes1 = function() {
	ZmUnitTest.call(this, "quoteString() method, doubleQuotes test");
};
UtStringTestDoubleQuotes1.prototype = new ZmUnitTest;
UtStringTestDoubleQuotes1.prototype.constructor = UtStringTestDoubleQuotes1;

UtStringTestDoubleQuotes1.prototype.run = function() {
	var val = " any <value> &   with '*! special <<characters>> ";
	var result = AjxStringUtil.quoteString(val, true);
	var expected = '"' + val + '"';
	return (result == expected);
};

// Instantiate this module and add it and its tests to the test suite.
new UtString();
