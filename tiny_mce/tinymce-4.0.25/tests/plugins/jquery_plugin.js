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
module("tinymce.plugins.jQuery", {
	setupModule: function() {
		document.getElementById('view').innerHTML = (
			'<textarea id="elm1"></textarea>' +
			'<textarea id="elm2"></textarea>' +
			'<textarea id="elm3">Textarea</textarea>'
		);

		QUnit.stop();

		$(function() {
			$('#elm1,#elm2').tinymce({
				plugins: [
					"pagebreak,layer,table,save,emoticons,insertdatetime,preview,media,searchreplace",
					"print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,template"
				],

				init_instance_callback: function() {
					var ed1 = tinymce.get('elm1'), ed2 = tinymce.get('elm2');

					// When both editors are initialized
					if (ed1 && ed1.initialized && ed2 && ed2.initialized) {
						QUnit.start();
					}
				}
			});
		});
	}
});

test("Get editor instance", function() {
	equal($('#elm1').tinymce().id, 'elm1');
	equal($('#elm2').tinymce().id, 'elm2');
	equal($('#elm3').tinymce(), null);
});

test("Get contents using jQuery", function() {
	expect(4);

	tinymce.get('elm1').setContent('<p>Editor 1</p>');

	equal($('#elm1').html(), '<p>Editor 1</p>');
	equal($('#elm1').val(), '<p>Editor 1</p>');
	equal($('#elm1').attr('value'), '<p>Editor 1</p>');
	equal($('#elm1').text(), 'Editor 1');
});

test("Set contents using jQuery", function() {
	expect(4);

	$('#elm1').html('Test 1');
	equal($('#elm1').html(), '<p>Test 1</p>');

	$('#elm1').val('Test 2');
	equal($('#elm1').html(), '<p>Test 2</p>');

	$('#elm1').text('Test 3');
	equal($('#elm1').html(), '<p>Test 3</p>');

	$('#elm1').attr('value', 'Test 4');
	equal($('#elm1').html(), '<p>Test 4</p>');
});

test("append/prepend contents using jQuery", function() {
	expect(2);

	tinymce.get('elm1').setContent('<p>Editor 1</p>');

	$('#elm1').append('<p>Test 1</p>');
	equal($('#elm1').html(), '<p>Editor 1</p>\n<p>Test 1</p>');

	$('#elm1').prepend('<p>Test 2</p>');
	equal($('#elm1').html(), '<p>Test 2</p>\n<p>Editor 1</p>\n<p>Test 1</p>');
});

test("Find using :tinymce selector", function() {
	expect(1);

	equal($('textarea:tinymce').length, 2);
});

test("Set contents using :tinymce selector", function() {
	expect(3);

	$('textarea:tinymce').val('Test 1');
	equal($('#elm1').val(), '<p>Test 1</p>');
	equal($('#elm2').val(), '<p>Test 1</p>');
	equal($('#elm3').val(), 'Textarea');
});

test("Get contents using :tinymce selector", function() {
	expect(1);

	$('textarea:tinymce').val('Test get');
	equal($('textarea:tinymce').val(), '<p>Test get</p>');
});
