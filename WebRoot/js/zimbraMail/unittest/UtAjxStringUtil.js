/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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


UtAjxStringUtil.clipFile = function() {
	ZmUnitTestUtil.log("starting AjxStringUtil.clipFile test");

	UT.expect(13);

	UT.equal(AjxStringUtil.clipFile('kaflaflibob', 11), 'kaflaflibob');
	UT.equal(AjxStringUtil.clipFile('kaflaflibob.', 12), 'kaflaflibob.');
	UT.equal(AjxStringUtil.clipFile('kaflaflibob.flaf', 12), 'kaflaflibob.flaf');
	UT.equal(AjxStringUtil.clipFile('kaflaflibob.flaf', 8), 'kafl\u2026bob.flaf');
	UT.equal(AjxStringUtil.clipFile('kaflaflibob', 9), 'kafl\u2026ibob');
	UT.equal(AjxStringUtil.clipFile('blyf.kaflaflibob.flaf', 8), 'blyf\u2026bob.flaf');
	UT.equal(AjxStringUtil.clipFile('flaf.kaflaflibob', 8), 'flaf.kaflaflibob');
	UT.equal(AjxStringUtil.clipFile('.kaflaflibob', 8), '.kaf\u2026bob');
	UT.equal(AjxStringUtil.clipFile('kaflaflibob', 11).length, 11);
	UT.equal(AjxStringUtil.clipFile('kaflaflibob', 9).length, 9);
	UT.equal(AjxStringUtil.clipFile('kaflaflibob', 6).length, 6);
	UT.equal(AjxStringUtil.clipFile('blyf.kaflaflibob.flaf', 8).length, 8 + 5);
	UT.equal(AjxStringUtil.clipFile('.kaflaflibob', 8).length, 8);
};

UT.test("AjxStringUtil.clipFile", UtAjxStringUtil.clipFile);

