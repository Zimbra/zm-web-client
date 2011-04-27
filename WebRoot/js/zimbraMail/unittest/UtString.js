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


UT.module("String");

UT.test("buildAttribute() method, prependSpace argument test",
	function() {
		UT.expect(1);
		UT.equal(AjxStringUtil.buildAttribute("attrName", "attrValue", true), " attrName='attrValue'");
	}
);

UT.test("buildAttribute() method, doubleQuotes argument test",
	function() {
		UT.expect(1);
		UT.equal(AjxStringUtil.buildAttribute("attrName", "attrValue", false, true), 'attrName="attrValue"');
	}
);

UT.test("buildAttribute() method, jsEscape argument test",
	function() {
		UT.expect(1);
		var val = " any <value> &   with '*! special <<characters>> ";
		var result = AjxStringUtil.buildAttribute("attrName", val, false, false, true);
		var expected = "attrName=" + AjxStringUtil.quoteString(escape(val));
		UT.equal(result, expected);
	}
);

UT.test("buildAttribute() method, htmlEscape argument test",
	function() {
		UT.expect(1);
		var val = " any <value> &   with '*! special <<characters>> ";
		var result = AjxStringUtil.buildAttribute("attrName", val, false, false, false, true);
		var expected = "attrName=" + AjxStringUtil.quoteString(AjxStringUtil.htmlEncode(val));
		UT.equal(result, expected);
	}
);

UT.test("quoteString() method, singleQuotes test",
	function() {
		UT.expect(1);
		var val = " any <value> &   with '*! special <<characters>> ";
		var result = AjxStringUtil.quoteString(val);
		var expected = "'" + val + "'";
		UT.equal(result, expected);
	}
);

UT.test("quoteString() method, doubleQuotes test",
	function() {
		UT.expect(1);
		var val = " any <value> &   with '*! special <<characters>> ";
		var result = AjxStringUtil.quoteString(val, true);
		var expected = '"' + val + '"';
		UT.equal(result, expected);
	}
);
