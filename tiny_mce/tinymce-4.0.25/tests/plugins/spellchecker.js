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
(function() {
	var count = 0;

	module("tinymce.plugins.Spellchecker", {
		setupModule: function() {
			document.getElementById('view').innerHTML = (
				'<textarea id="no_lang"></textarea>' +
				'<textarea id="one_lang"></textarea>' +
				'<textarea id="many_lang"></textarea>'
			);

			QUnit.stop();

			function wait() {
				if (++count == 3) {
					QUnit.start();
				}
			}

			tinymce.init({
				selector: '#no_lang',
				plugins: "spellchecker",
				add_unload_trigger: false,
				skin: false,
				disable_nodechange: true,
				toolbar: 'spellchecker',
				init_instance_callback: function(ed) {
					window.editor = ed;
					wait();
				}
			});

			tinymce.init({
				selector: '#one_lang',
				plugins: "spellchecker",
				add_unload_trigger: false,
				skin: false,
				spellchecker_languages: 'English=en',
				disable_nodechange: true,
				toolbar: 'spellchecker',
				init_instance_callback: function(ed) {
					window.editor = ed;
					wait();
				}
			});

			tinymce.init({
				selector: '#many_lang',
				plugins: "spellchecker",
				add_unload_trigger: false,
				skin: false,
				spellchecker_languages: 'English=en,French=fr,German=de',
				disable_nodechange: true,
				toolbar: 'spellchecker',
				init_instance_callback: function(ed) {
					window.editor = ed;
					wait();
				}
			});
		},

		teardown: function() {
			editor.settings.forced_root_block = 'p';
		}
	});

	// Default spellchecker language should match editor language
	test('Check default language', function() {
		var mainLanguage = tinymce.get('no_lang').settings.language || 'en';
		equal(tinymce.get('no_lang').settings.spellchecker_language, mainLanguage);
	});

	// Spellchecker button may include a language menu

	// When no languages are specified, the default list of languages should be
	// used, matching the list in the old TinyMCE 3 spellchecker plugin.
	test('Check spellcheck button is a splitbutton (no languages)', function() {
		var spellcheckButton = tinymce.get('no_lang').buttons.spellchecker;
		equal(spellcheckButton.type, 'splitbutton');
	});

	// When exactly one spellchecker language is specified, there's no need to
	// display a selection menu.
	test('Check spellcheck button is a normal button (one language)', function() {
		var spellcheckButton = tinymce.get('one_lang').buttons.spellchecker;
		equal(spellcheckButton.type, 'button');
	});

	// When more than one spellchecker language is specified, a selection menu
	// should be provided to choose between them.
	test('Check spellcheck button is a splitbutton (many languages)', function() {
		var spellcheckButton = tinymce.get('many_lang').buttons.spellchecker;
		equal(spellcheckButton.type, 'splitbutton');
	});
})();
