/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004 - 2011 Zimbra, Inc.
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

UT.module("AjxStringUtil");

UtAjxStringUtil = function() {};

UtAjxStringUtil.urlDecode = function() {
	ZmUnitTestUtil.log("starting AjxStringUtil.urlDecode test");

	UT.expect(4);
	var percentURI = AjxStringUtil.urlDecode("%");
	UT.equal(percentURI, "", "% is not a valid URI return ''");
	
	var nullURI = AjxStringUtil.urlDecode();
	UT.equal(nullURI, "", "null is not a valid URI return ''");
	
	var invalidURI = AjxStringUtil.urlDecode("%u65E5%u7523");
	UT.equal(invalidURI, "", "%u65E5%u7523 is not a valid URI return ''");
	
	var validURI = AjxStringUtil.urlDecode("http://google.com?q=Zimbra%208");
	UT.equal(validURI, "http://google.com?q=Zimbra 8");
	
};

UT.test("AjxStringUtil.urlDecode", UtAjxStringUtil.urlDecode);