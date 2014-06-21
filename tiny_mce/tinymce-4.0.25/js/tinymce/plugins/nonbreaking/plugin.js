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
/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('nonbreaking', function(editor) {
	var setting = editor.getParam('nonbreaking_force_tab');

	editor.addCommand('mceNonBreaking', function() {
		editor.insertContent(
			(editor.plugins.visualchars && editor.plugins.visualchars.state) ?
			'<span class="mce-nbsp">&nbsp;</span>' : '&nbsp;'
		);

		editor.dom.setAttrib(editor.dom.select('span.mce-nbsp'), 'data-mce-bogus', '1');
	});

	editor.addButton('nonbreaking', {
		title: 'Insert nonbreaking space',
		cmd: 'mceNonBreaking'
	});

	editor.addMenuItem('nonbreaking', {
		text: 'Nonbreaking space',
		cmd: 'mceNonBreaking',
		context: 'insert'
	});

	if (setting) {
		var spaces = +setting > 1 ? +setting : 3;  // defaults to 3 spaces if setting is true (or 1)

		editor.on('keydown', function(e) {
			if (e.keyCode == 9) {

				if (e.shiftKey) {
					return;
				}

				e.preventDefault();
				for (var i = 0; i < spaces; i++) {
					editor.execCommand('mceNonBreaking');
				}
			}
		});
	}
});
