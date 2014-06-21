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
 * ForceBlocks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/ForceBlocks", [], function() {
	return function(editor) {
		var settings = editor.settings, dom = editor.dom, selection = editor.selection;
		var schema = editor.schema, blockElements = schema.getBlockElements();

		function addRootBlocks() {
			var node = selection.getStart(), rootNode = editor.getBody(), rng;
			var startContainer, startOffset, endContainer, endOffset, rootBlockNode;
			var tempNode, offset = -0xFFFFFF, wrapped, restoreSelection;
			var tmpRng, rootNodeName, forcedRootBlock;

			forcedRootBlock = settings.forced_root_block;

			if (!node || node.nodeType !== 1 || !forcedRootBlock) {
				return;
			}

			// Check if node is wrapped in block
			while (node && node != rootNode) {
				if (blockElements[node.nodeName]) {
					return;
				}

				node = node.parentNode;
			}

			// Get current selection
			rng = selection.getRng();
			if (rng.setStart) {
				startContainer = rng.startContainer;
				startOffset = rng.startOffset;
				endContainer = rng.endContainer;
				endOffset = rng.endOffset;

				try {
					restoreSelection = editor.getDoc().activeElement === rootNode;
				} catch (ex) {
					// IE throws unspecified error here sometimes
				}
			} else {
				// Force control range into text range
				if (rng.item) {
					node = rng.item(0);
					rng = editor.getDoc().body.createTextRange();
					rng.moveToElementText(node);
				}

				restoreSelection = rng.parentElement().ownerDocument === editor.getDoc();
				tmpRng = rng.duplicate();
				tmpRng.collapse(true);
				startOffset = tmpRng.move('character', offset) * -1;

				if (!tmpRng.collapsed) {
					tmpRng = rng.duplicate();
					tmpRng.collapse(false);
					endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
				}
			}

			// Wrap non block elements and text nodes
			node = rootNode.firstChild;
			rootNodeName = rootNode.nodeName.toLowerCase();
			while (node) {
				// TODO: Break this up, too complex
				if (((node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName]))) &&
					schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase())) {
					// Remove empty text nodes
					if (node.nodeType === 3 && node.nodeValue.length === 0) {
						tempNode = node;
						node = node.nextSibling;
						dom.remove(tempNode);
						continue;
					}

					if (!rootBlockNode) {
						rootBlockNode = dom.create(forcedRootBlock, editor.settings.forced_root_block_attrs);
						node.parentNode.insertBefore(rootBlockNode, node);
						wrapped = true;
					}

					tempNode = node;
					node = node.nextSibling;
					rootBlockNode.appendChild(tempNode);
				} else {
					rootBlockNode = null;
					node = node.nextSibling;
				}
			}

			if (wrapped && restoreSelection) {
				if (rng.setStart) {
					rng.setStart(startContainer, startOffset);
					rng.setEnd(endContainer, endOffset);
					selection.setRng(rng);
				} else {
					// Only select if the previous selection was inside the document to prevent auto focus in quirks mode
					try {
						rng = editor.getDoc().body.createTextRange();
						rng.moveToElementText(rootNode);
						rng.collapse(true);
						rng.moveStart('character', startOffset);

						if (endOffset > 0) {
							rng.moveEnd('character', endOffset);
						}

						rng.select();
					} catch (ex) {
						// Ignore
					}
				}

				editor.nodeChanged();
			}
		}

		// Force root blocks
		if (settings.forced_root_block) {
			editor.on('NodeChange', addRootBlocks);
		}
	};
});