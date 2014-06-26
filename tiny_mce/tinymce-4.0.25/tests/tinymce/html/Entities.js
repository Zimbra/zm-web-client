/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
module("tinymce.html.Entities");

test('encodeRaw', function() {
	expect(2);

	equal(tinymce.html.Entities.encodeRaw('<>"\'&\u00e5\u00e4\u00f6\u0060'), '&lt;&gt;"\'&amp;\u00e5\u00e4\u00f6\u0060', 'Raw encoding text');
	equal(tinymce.html.Entities.encodeRaw('<>"\'&\u00e5\u00e4\u00f6\u0060', true), '&lt;&gt;&quot;\'&amp;\u00e5\u00e4\u00f6&#96;', 'Raw encoding attribute');
});

test('encodeAllRaw', function() {
	expect(1);

	equal(tinymce.html.Entities.encodeAllRaw('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;&quot;&#39;&amp;\u00e5\u00e4\u00f6', 'Raw encoding all');
});

test('encodeNumeric', function() {
	expect(2);

	equal(tinymce.html.Entities.encodeNumeric('<>"\'&\u00e5\u00e4\u00f6\u03b8\u2170\ufa11'), '&lt;&gt;"\'&amp;&#229;&#228;&#246;&#952;&#8560;&#64017;', 'Numeric encoding text');
	equal(tinymce.html.Entities.encodeNumeric('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;&#229;&#228;&#246;', 'Numeric encoding attribute');
});

test('encodeNamed', function() {
	expect(4);

	equal(tinymce.html.Entities.encodeNamed('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&auml;&ouml;', 'Named encoding text');
	equal(tinymce.html.Entities.encodeNamed('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;&aring;&auml;&ouml;', 'Named encoding attribute');
	equal(tinymce.html.Entities.encodeNamed('<>"\'\u00e5\u00e4\u00f6', false, {'\u00e5' : '&aring;'}), '&lt;&gt;"\'&aring;\u00e4\u00f6', 'Named encoding text');
	equal(tinymce.html.Entities.encodeNamed('<>"\'\u00e5\u00e4\u00f6', true, {'\u00e5' : '&aring;'}), '&lt;&gt;&quot;\'&aring;\u00e4\u00f6', 'Named encoding attribute');
});

test('getEncodeFunc', function() {
	var encodeFunc;

	expect(10);

	encodeFunc = tinymce.html.Entities.getEncodeFunc('raw');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;\u00e5\u00e4\u00f6', 'Raw encoding text');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;\u00e5\u00e4\u00f6', 'Raw encoding attribute');

	encodeFunc = tinymce.html.Entities.getEncodeFunc('named');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&auml;&ouml;', 'Named encoding text');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;&aring;&auml;&ouml;', 'Named encoding attribute');

	encodeFunc = tinymce.html.Entities.getEncodeFunc('numeric');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&#229;&#228;&#246;', 'Named encoding text');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;&#229;&#228;&#246;', 'Named encoding attribute');

	encodeFunc = tinymce.html.Entities.getEncodeFunc('named+numeric', '229,aring');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&#228;&#246;', 'Named+numeric encoding text');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;&aring;&#228;&#246;', 'Named+numeric encoding attribute');

	encodeFunc = tinymce.html.Entities.getEncodeFunc('named,numeric', '229,aring');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6'), '&lt;&gt;"\'&amp;&aring;&#228;&#246;', 'Named+numeric encoding text');
	equal(encodeFunc('<>"\'&\u00e5\u00e4\u00f6', true), '&lt;&gt;&quot;\'&amp;&aring;&#228;&#246;', 'Named+numeric encoding attribute');
});

test('decode', function() {
	expect(3);

	equal(tinymce.html.Entities.decode('&lt;&gt;&quot;&#39;&amp;&aring;&auml;&ouml;&unknown;&#039;&#x27;'), '<>"\'&\u00e5\u00e4\u00f6&unknown;\'\'', 'Decode text with various entities');

	equal(tinymce.html.Entities.encodeNumeric(tinymce.html.Entities.decode(
		'&#130;&#131;&#132;&#133;&#134;&#135;&#136;&#137;&#138;' +
		'&#139;&#140;&#141;&#142;&#143;&#144;&#145;&#146;&#147;&#148;&#149;&#150;&#151;&#152;' +
		'&#153;&#154;&#155;&#156;&#157;&#158;&#159;')
	), '&#8218;&#402;&#8222;&#8230;&#8224;&#8225;&#710;&#8240;&#352;&#8249;&#338;&#141;&#381;' +
		'&#143;&#144;&#8216;&#8217;&#8220;&#8221;&#8226;&#8211;&#8212;&#732;&#8482;&#353;' +
		'&#8250;&#339;&#157;&#382;&#376;',
	'Entity decode ascii');

	equal(tinymce.html.Entities.encodeNumeric(tinymce.html.Entities.decode('&#194564;')), '&#194564;', "High byte non western character.");
});
