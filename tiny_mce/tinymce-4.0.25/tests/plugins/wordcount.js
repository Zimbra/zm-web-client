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
module("tinymce.plugins.Wordcount", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			wordcount_target_id: 'current-count',
			plugins: 'wordcount',
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	}
});

test("Blank document has 0 words", function() {
	expect(1);

	editor.setContent('');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 0);
});

test("Simple word count", function() {
	expect(1);

	editor.setContent('<p>My sentence is this.</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 4);
});

test("Does not count dashes", function() {
	expect(1);

	editor.setContent('<p>Something -- ok</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 2);
});

test("Does not count asterisks, non-word characters", function() {
	expect(1);

	editor.setContent('<p>* something\n\u00b7 something else</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 3);
});

test("Does not count numbers", function() {
	expect(1);

	editor.setContent('<p>Something 123 ok</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 2);
});

test("Does not count htmlentities", function() {
	expect(1);

	editor.setContent('<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 6);
});

test("Counts hyphenated words as one word", function() {
	expect(1);

	editor.setContent('<p>Hello some-word here.</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 3);
});

test("Counts words between blocks as two words", function() {
	expect(1);

	editor.setContent('<p>Hello</p><p>world</p>');
	var result = editor.plugins.wordcount.getCount();
	equal(result, 2);
});
