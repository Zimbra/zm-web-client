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
module("tinymce.plugins.Autosave", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			plugins: 'autosave',
			autosave_ask_before_unload: false,
			init_instance_callback: function(ed) {
				window.editor = ed;
				editor.plugins.autosave.removeDraft();
				QUnit.start();
			}
		});
	}
});

test("isEmpty true", function() {
	ok(editor.plugins.autosave.isEmpty(''));
	ok(editor.plugins.autosave.isEmpty('   '));
	ok(editor.plugins.autosave.isEmpty('\t\t\t'));

	ok(editor.plugins.autosave.isEmpty('<p id="x"></p>'));
	ok(editor.plugins.autosave.isEmpty('<p></p>'));
	ok(editor.plugins.autosave.isEmpty('<p> </p>'));
	ok(editor.plugins.autosave.isEmpty('<p>\t</p>'));

	ok(editor.plugins.autosave.isEmpty('<p><br></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br /></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /></p>'));

	ok(editor.plugins.autosave.isEmpty('<p><br><br></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br /><br /></p>'));
	ok(editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /><br data-mce-bogus="true" /></p>'));
});

test("isEmpty false", function() {
	ok(!editor.plugins.autosave.isEmpty('X'));
	ok(!editor.plugins.autosave.isEmpty('   X'));
	ok(!editor.plugins.autosave.isEmpty('\t\t\tX'));

	ok(!editor.plugins.autosave.isEmpty('<p>X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p> X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p>\tX</p>'));

	ok(!editor.plugins.autosave.isEmpty('<p><br>X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br />X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" />X</p>'));

	ok(!editor.plugins.autosave.isEmpty('<p><br><br>X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br /><br />X</p>'));
	ok(!editor.plugins.autosave.isEmpty('<p><br data-mce-bogus="true" /><br data-mce-bogus="true" />X</p>'));

	ok(!editor.plugins.autosave.isEmpty('<h1></h1>'));
	ok(!editor.plugins.autosave.isEmpty('<img src="x" />'));
});

test("hasDraft/storeDraft/restoreDraft", function() {
	ok(!editor.plugins.autosave.hasDraft());

	editor.setContent('X');
	editor.undoManager.add();
	editor.plugins.autosave.storeDraft();

	ok(editor.plugins.autosave.hasDraft());

	editor.setContent('Y');
	editor.undoManager.add();

	editor.plugins.autosave.restoreDraft();
	equal(editor.getContent(), '<p>X</p>');
});
