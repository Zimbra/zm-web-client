/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This controller manages the toast UI element that is displayed after certain actions in the UI.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.controller.ZtToastController', {
	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'ZCS.view.ZtToast'
	],
	config: {
		refs: {
			toast: 'toast'
		},
		control: {
			toast: {
				'undo': 'doUndo'
			}
		}
	},

	launch: function () {
		ZCS.app.on('showToast', this.showToast);
	},

	showToast: function (message, undoReference, undoScope) {
		if (!this.toast) {
			this.toast = Ext.Viewport.add(Ext.create('ZCS.view.ZtToast'));
		}

		this.undoReference = undoReference;
		this.undoScope = undoScope;

		this.toast.showMessage(message);
	},

	doUndo: function () {
		this.undoReference.call(this.undoScope);
	}
});