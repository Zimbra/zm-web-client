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
/**
 * ElementPath.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control creates an path for the current selections parent elements in TinyMCE.
 *
 * @class tinymce.ui.ElementPath
 * @extends tinymce.ui.Path
 */
define("tinymce/ui/ElementPath", [
	"tinymce/ui/Path",
	"tinymce/EditorManager"
], function(Path, EditorManager) {
	return Path.extend({
		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ElementPath} Current combobox instance.
		 */
		postRender: function() {
			var self = this, editor = EditorManager.activeEditor;

			function isHidden(elm) {
				if (elm.nodeType === 1) {
					if (elm.nodeName == "BR" || !!elm.getAttribute('data-mce-bogus')) {
						return true;
					}

					if (elm.getAttribute('data-mce-type') === 'bookmark') {
						return true;
					}
				}

				return false;
			}

			self.on('select', function(e) {
				var parents = [], node, body = editor.getBody();

				editor.focus();

				node = editor.selection.getStart();
				while (node && node != body) {
					if (!isHidden(node)) {
						parents.push(node);
					}

					node = node.parentNode;
				}

				editor.selection.select(parents[parents.length - 1 - e.index]);
				editor.nodeChanged();
			});

			editor.on('nodeChange', function(e) {
				var parents = [], selectionParents = e.parents, i = selectionParents.length;

				while (i--) {
					if (selectionParents[i].nodeType == 1 && !isHidden(selectionParents[i])) {
						var args = editor.fire('ResolveName', {
							name: selectionParents[i].nodeName.toLowerCase(),
							target: selectionParents[i]
						});

						parents.push({name: args.name});
					}
				}

				self.data(parents);
			});

			return self._super();
		}
	});
});