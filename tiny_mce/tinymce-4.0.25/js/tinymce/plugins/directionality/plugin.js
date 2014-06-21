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

tinymce.PluginManager.add('directionality', function(editor) {
	function setDir(dir) {
		var dom = editor.dom, curDir, blocks = editor.selection.getSelectedBlocks();

		if (blocks.length) {
			curDir = dom.getAttrib(blocks[0], "dir");

			tinymce.each(blocks, function(block) {
				// Add dir to block if the parent block doesn't already have that dir
				if (!dom.getParent(block.parentNode, "*[dir='" + dir + "']", dom.getRoot())) {
					if (curDir != dir) {
						dom.setAttrib(block, "dir", dir);
					} else {
						dom.setAttrib(block, "dir", null);
					}
				}
			});

			editor.nodeChanged();
		}
	}

	function generateSelector(dir) {
		var selector = [];

		tinymce.each('h1 h2 h3 h4 h5 h6 div p'.split(' '), function(name) {
			selector.push(name + '[dir=' + dir + ']');
		});

		return selector.join(',');
	}

	editor.addCommand('mceDirectionLTR', function() {
		setDir("ltr");
	});

	editor.addCommand('mceDirectionRTL', function() {
		setDir("rtl");
	});

	editor.addButton('ltr', {
		title: 'Left to right',
		cmd: 'mceDirectionLTR',
		stateSelector: generateSelector('ltr')
	});

	editor.addButton('rtl', {
		title: 'Right to left',
		cmd: 'mceDirectionRTL',
		stateSelector: generateSelector('rtl')
	});
});