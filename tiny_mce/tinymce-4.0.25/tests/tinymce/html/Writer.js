/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the “License”);
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an “AS IS” basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2014 Zimbra, Inc. All Rights Reserved. 
 * 
 * ***** END LICENSE BLOCK *****
 */
module("tinymce.html.Writer");

test('Comment', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer();
	writer.comment('text');
	equal(writer.getContent(), '<!--text-->');

	writer = new tinymce.html.Writer();
	writer.comment('');
	equal(writer.getContent(), '<!---->');
});

test('CDATA', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer();
	writer.cdata('text');
	equal(writer.getContent(), '<![CDATA[text]]>');

	writer = new tinymce.html.Writer();
	writer.cdata('');
	equal(writer.getContent(), '<![CDATA[]]>');
});

test('PI', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer();
	writer.pi('xml', 'someval');
	equal(writer.getContent(), '<?xml someval?>');

	writer = new tinymce.html.Writer();
	writer.pi('xml');
	equal(writer.getContent(), '<?xml?>');
});

test('Doctype', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer();
	writer.doctype(' text');
	equal(writer.getContent(), '<!DOCTYPE text>');

	writer = new tinymce.html.Writer();
	writer.doctype('');
	equal(writer.getContent(), '<!DOCTYPE>');
});

test('Text', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer();
	writer.text('te<xt');
	equal(writer.getContent(), 'te&lt;xt');

	writer = new tinymce.html.Writer();
	writer.text('');
	equal(writer.getContent(), '');
});

test('Text raw', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer();
	writer.text('te<xt', true);
	equal(writer.getContent(), 'te<xt');

	writer = new tinymce.html.Writer();
	writer.text('', true);
	equal(writer.getContent(), '');
});

test('Start', function() {
	var writer;

	expect(5);

	writer = new tinymce.html.Writer();
	writer.start('b');
	equal(writer.getContent(), '<b>');

	writer = new tinymce.html.Writer();
	writer.start('b', [{name: 'attr1', value: 'value1'}, {name: 'attr2', value: 'value2'}]);
	equal(writer.getContent(), '<b attr1="value1" attr2="value2">');

	writer = new tinymce.html.Writer();
	writer.start('b', [{name: 'attr1', value: 'val<"ue1'}]);
	equal(writer.getContent(), '<b attr1="val&lt;&quot;ue1">');

	writer = new tinymce.html.Writer();
	writer.start('img', [{name: 'attr1', value: 'value1'}, {name: 'attr2', value: 'value2'}], true);
	equal(writer.getContent(), '<img attr1="value1" attr2="value2" />');

	writer = new tinymce.html.Writer();
	writer.start('br', null, true);
	equal(writer.getContent(), '<br />');
});

test('End', function() {
	var writer;

	expect(1);

	writer = new tinymce.html.Writer();
	writer.end('b');
	equal(writer.getContent(), '</b>');
});

test('Indentation', function() {
	var writer;

	expect(2);

	writer = new tinymce.html.Writer({indent: true, indent_before: 'p', indent_after:'p'});
	writer.start('p');
	writer.start('span');
	writer.text('a');
	writer.end('span');
	writer.end('p');
	writer.start('p');
	writer.text('a');
	writer.end('p');
	equal(writer.getContent(), '<p><span>a</span></p>\n<p>a</p>');

	writer = new tinymce.html.Writer({indent: true, indent_before: 'p', indent_after:'p'});
	writer.start('p');
	writer.text('a');
	writer.end('p');
	equal(writer.getContent(), '<p>a</p>');
});

test('Entities', function() {
	var writer;

	expect(3);

	writer = new tinymce.html.Writer();
	writer.start('p', [{name: "title", value: '<>"\'&\u00e5\u00e4\u00f6'}]);
	writer.text('<>"\'&\u00e5\u00e4\u00f6');
	writer.end('p');
	equal(writer.getContent(), '<p title="&lt;&gt;&quot;\'&amp;\u00e5\u00e4\u00f6">&lt;&gt;"\'&amp;\u00e5\u00e4\u00f6</p>');

	writer = new tinymce.html.Writer({entity_encoding: 'numeric'});
	writer.start('p', [{name: "title", value: '<>"\'&\u00e5\u00e4\u00f6'}]);
	writer.text('<>"\'&\u00e5\u00e4\u00f6');
	writer.end('p');
	equal(writer.getContent(), '<p title="&lt;&gt;&quot;\'&amp;&#229;&#228;&#246;">&lt;&gt;"\'&amp;&#229;&#228;&#246;</p>');

	writer = new tinymce.html.Writer({entity_encoding: 'named'});
	writer.start('p', [{name: "title", value: '<>"\'&\u00e5\u00e4\u00f6'}]);
	writer.text('<>"\'&\u00e5\u00e4\u00f6');
	writer.end('p');
	equal(writer.getContent(), '<p title="&lt;&gt;&quot;\'&amp;&aring;&auml;&ouml;">&lt;&gt;"\'&amp;&aring;&auml;&ouml;</p>');
});
