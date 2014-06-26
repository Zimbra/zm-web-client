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
module("tinymce.ForceBlocks", {
	autostart: false,
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			indent: false,
			skin: false,
			entities: 'raw',
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,margin,margin-top,margin-right,margin-bottom,margin-left,display'
			},
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	},

	teardown: function() {
		editor.settings.forced_root_block = 'p';
		editor.settings.forced_root_block_attrs = null;
	}
});

test('Wrap single root text node in P', function() {
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 2);
	Utils.pressArrowKey();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Wrap single root text node in P with attrs', function() {
	editor.settings.forced_root_block_attrs = {"class": "class1"};
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 2);
	Utils.pressArrowKey();
	equal(editor.getContent(), '<p class="class1">abcd</p>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Wrap single root text node in P but not table sibling', function() {
	editor.getBody().innerHTML = 'abcd<table><tr><td>x</td></tr></table>';
	Utils.setSelection('body', 2);
	Utils.pressArrowKey();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<p>abcd</p><table><tbody><tr><td>x</td></tr></tbody></table>');
	equal(editor.selection.getNode().nodeName, 'P');
});

test('Wrap root em in P but not table sibling', function() {
	editor.getBody().innerHTML = '<em>abcd</em><table><tr><td>x</td></tr></table>';
	Utils.setSelection('em', 2);
	Utils.pressArrowKey();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<p><em>abcd</em></p><table><tbody><tr><td>x</td></tr></tbody></table>');
	equal(editor.selection.getNode().nodeName, 'EM');
});

test('Wrap single root text node in DIV', function() {
	editor.settings.forced_root_block = 'div';
	editor.getBody().innerHTML = 'abcd';
	Utils.setSelection('body', 2);
	Utils.pressArrowKey();
	equal(Utils.cleanHtml(editor.getBody().innerHTML), '<div>abcd</div>');
	equal(editor.selection.getNode().nodeName, 'DIV');
});

test('Remove empty root text nodes', function() {
	var body = editor.getBody();

	editor.settings.forced_root_block = 'div';
	editor.getBody().innerHTML = 'abcd<div>abcd</div>';
	Utils.setSelection('body', 2);
	body.insertBefore(editor.getDoc().createTextNode(''), body.firstChild);
	body.appendChild(editor.getDoc().createTextNode(''));
	Utils.pressArrowKey();
	equal(Utils.cleanHtml(body.innerHTML), '<div>abcd</div><div>abcd</div>');
	equal(editor.selection.getNode().nodeName, 'DIV');
	equal(body.childNodes.length, 2);
});
