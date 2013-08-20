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
tinyMCEPopup.requireLangPack();

var AnchorDialog = {
	init : function(ed) {
		var action, elm, f = document.forms[0];

		this.editor = ed;
		elm = ed.dom.getParent(ed.selection.getNode(), 'A');
		v = ed.dom.getAttrib(elm, 'name') || ed.dom.getAttrib(elm, 'id');

		if (v) {
			this.action = 'update';
			f.anchorName.value = v;
		}

		f.insert.value = ed.getLang(elm ? 'update' : 'insert');
	},

	update : function() {
		var ed = this.editor, elm, name = document.forms[0].anchorName.value, attribName;

		if (!name || !/^[a-z][a-z0-9\-\_:\.]*$/i.test(name)) {
			tinyMCEPopup.alert('advanced_dlg.anchor_invalid');
			return;
		}

		tinyMCEPopup.restoreSelection();

		if (this.action != 'update')
			ed.selection.collapse(1);

		var aRule = ed.schema.getElementRule('a');
		if (!aRule || aRule.attributes.name) {
			attribName = 'name';
		} else {
			attribName = 'id';
		}

		elm = ed.dom.getParent(ed.selection.getNode(), 'A');
		if (elm) {
			elm.setAttribute(attribName, name);
			elm[attribName] = name;
			ed.undoManager.add();
		} else {
			// create with zero-sized nbsp so that in Webkit where anchor is on last line by itself caret cannot be placed after it
			var attrs =  {'class' : 'mceItemAnchor'};
			attrs[attribName] = name;
			ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('a', attrs, '\uFEFF'));
			ed.nodeChanged();
		}

		tinyMCEPopup.close();
	}
};

tinyMCEPopup.onInit.add(AnchorDialog.init, AnchorDialog);
