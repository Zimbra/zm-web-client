/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	tinymce.create('tinymce.plugins.Nonbreaking', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;

			// Register commands
			ed.addCommand('mceNonBreaking', function() {
				ed.execCommand('mceInsertContent', false, (ed.plugins.visualchars && ed.plugins.visualchars.state) ? '<span data-mce-bogus="1" class="mceItemHidden mceItemNbsp">&nbsp;</span>' : '&nbsp;');
			});

			// Register buttons
			ed.addButton('nonbreaking', {title : 'nonbreaking.nonbreaking_desc', cmd : 'mceNonBreaking'});

			if (ed.getParam('nonbreaking_force_tab')) {
				ed.onKeyDown.add(function(ed, e) {
					if (e.keyCode == 9) {
						e.preventDefault();
	
						ed.execCommand('mceNonBreaking');
						ed.execCommand('mceNonBreaking');
						ed.execCommand('mceNonBreaking');
					}
				});
			}
		},

		getInfo : function() {
			return {
				longname : 'Nonbreaking space',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/nonbreaking',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}

		// Private methods
	});

	// Register plugin
	tinymce.PluginManager.add('nonbreaking', tinymce.plugins.Nonbreaking);
})();