/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
/**
 * editor_plugin_src.js
 *
 * Copyright 2012, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	tinymce.create('tinymce.plugins.VisualBlocks', {
		init : function(ed, url) {
			var cssId;

			// We don't support older browsers like IE6/7 and they don't provide prototypes for DOM objects
			if (!window.NodeList) {
				return;
			}

			ed.addCommand('mceVisualBlocks', function() {
				var dom = ed.dom, linkElm;

				if (!cssId) {
					cssId = dom.uniqueId();
					linkElm = dom.create('link', {
						id: cssId,
						rel : 'stylesheet',
						href : url + '/css/visualblocks.css'
					});

					ed.getDoc().getElementsByTagName('head')[0].appendChild(linkElm);
				} else {
					linkElm = dom.get(cssId);
					linkElm.disabled = !linkElm.disabled;
				}

				ed.controlManager.setActive('visualblocks', !linkElm.disabled);
			});

			ed.addButton('visualblocks', {title : 'visualblocks.desc', cmd : 'mceVisualBlocks'});

			ed.onInit.add(function() {
				if (ed.settings.visualblocks_default_state) {
					ed.execCommand('mceVisualBlocks', false, null, {skip_focus : true});
				}
			});
		},

		getInfo : function() {
			return {
				longname : 'Visual blocks',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/visualblocks',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('visualblocks', tinymce.plugins.VisualBlocks);
})();