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
module("tinymce.plugins.Fullpage", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			plugins: "fullpage",
			add_unload_trigger: false,
			skin: false,
			valid_styles: {
				'*': 'text-align,padding-left,color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			indent: 0,
			setup: function(ed) {
				ed.on('NodeChange', false);
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	},

	teardown: function() {
		editor.getBody().dir = 'ltr';
	}
});

test('Keep header/footer intact', function() {
	expect(2);

	function normalizeHTML(html) {
		return html.replace(/\s/g, '');
	}

	editor.setContent('<html><body><p>Test</p>');
	equal(normalizeHTML(editor.getContent()), '<html><body><p>Test</p>', 'Invalid HTML content is still editable.');

	editor.setContent('<html><body><p>Test</p></body></html>');
	equal(normalizeHTML(editor.getContent()), '<html><body><p>Test</p></body></html>', 'Header/footer is intact.');
});

test('Default header/footer', function() {
	expect(1);

	editor.setContent('<p>Test</p>');
	equal(editor.getContent(), '<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<p>Test</p>\n</body>\n</html>', 'Invalid HTML content is still editable.');
});

test('Parse body attributes', function() {
	expect(9);

	editor.setContent('<html><body><p>Test</p></body></html>');
	equal(editor.getBody().style.color, '', 'No color on body.');
	equal(editor.getBody().dir, '', 'No dir on body.');
	equal(editor.dom.getStyle(editor.getBody().firstChild, 'display', true), 'block', 'No styles added to iframe document');

	editor.setContent('<html><body style="color:#FF0000"><p>Test</p></body></html>');
	ok(editor.getBody().style.color.length > 0, 'Color added to body');

	editor.setContent('<html><body dir="rtl"><p>Test</p></body></html>');
	equal(editor.getBody().dir, 'rtl', 'Dir added to body');

	editor.setContent('<html><head><style>p {text-align:right}</style></head><body dir="rtl"><p>Test</p></body></html>');
	equal(editor.dom.getStyle(editor.getBody().firstChild, 'text-align', true), 'right', 'Styles added to iframe document');

	editor.setContent('<html><body><p>Test</p></body></html>');
	equal(editor.getBody().style.color, '', 'No color on body.');
	equal(editor.getBody().dir, '', 'No dir on body.');
	equal(editor.dom.getStyle(editor.getBody().firstChild, 'display', true), 'block', 'No styles added to iframe document');
});

test('fullpage_hide_in_source_view: false', function() {
	editor.settings.fullpage_hide_in_source_view = false;
	editor.setContent('<html><body><p>1</p></body></html>');
	equal(editor.getContent({source_view: true}), '<html><body>\n<p>1</p>\n</body></html>');
});

test('fullpage_hide_in_source_view: false', function() {
	editor.settings.fullpage_hide_in_source_view = true;
	editor.setContent('<html><body><p>1</p></body></html>');
	equal(editor.getContent({source_view: true}), '<p>1</p>');
});

test('link elements', function() {
	editor.setContent('<html><head><link rel="stylesheet" href="a.css"><link rel="something"></head><body><p>c</p></body></html>');
	equal(editor.getContent(), '<html><head><link rel="stylesheet" href="a.css"><link rel="something"></head><body>\n<p>c</p>\n</body></html>');
});

test('add/remove stylesheets', function() {
	function hasLink(href) {
		var links = editor.getDoc().getElementsByTagName('link');

		for (var i = 0; i < links.length; i++) {
			if (links[i].href.indexOf('/' + href) != -1) {
				return true;
			}
		}
	}

	editor.setContent('<html><head><link rel="stylesheet" href="a.css"></head><body><p>c</p></body></html>');
	ok(hasLink("a.css"));
	ok(!hasLink("b.css"));
	ok(!hasLink("c.css"));

	editor.setContent('<html><head><link rel="stylesheet" href="a.css"><link rel="stylesheet" href="b.css"></head><body><p>c</p></body></html>');
	ok(hasLink("a.css"));
	ok(hasLink("b.css"));
	ok(!hasLink("c.css"));

	editor.setContent('<html><head><link rel="stylesheet" href="a.css"><link rel="stylesheet" href="b.css"><link rel="stylesheet" href="c.css"></head><body><p>c</p></body></html>');
	ok(hasLink("a.css"));
	ok(hasLink("b.css"));
	ok(hasLink("c.css"));

	editor.setContent('<html><head><link rel="stylesheet" href="a.css"></head><body><p>c</p></body></html>');
	ok(hasLink("a.css"));
	ok(!hasLink("b.css"));
	ok(!hasLink("c.css"));

	editor.setContent('<html><head></head><body><p>c</p></body></html>');
	ok(!hasLink("a.css"));
	ok(!hasLink("b.css"));
	ok(!hasLink("c.css"));
});
