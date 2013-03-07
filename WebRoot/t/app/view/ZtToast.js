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
 * This view manages the display of a toast message.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.view.ZtToast', {
	extend: 'Ext.Sheet',
	config: {
		milliSecondsUntilHide: 5000,
		width: 300,
		height: 40,
		hidden: true,
		floating: true,
		modal: false,
		top: 4,
		left: 300,
		padding: 0,
		cls: 'zcs-toast',
		layout: 'fit',
		items: [{
			xtype: 'component',
			padding: 0,
			tpl: ZCS.template.Toast
		}],
		hideAnimation: 'fadeOut'
	},

	constructor: function () {
		var me = this;

		me.handleTap = function (event) {
			if (event.target.className === 'zcs-toast-undo-action') {
				me.fireEvent('undo');
			}
		}

		this.callParent(arguments);
	},

	showMessage: function (message) {
		var me = this,
			formattedTemplate = Ext.String.format(ZCS.template.Toast, message),
			viewportBox = Ext.Viewport.element.getBox(),
			left = (viewportBox.width / 2) - (me.getWidth() / 2),
			toast = me.down('component');

		toast.element.un('tap', me.handleTap);

		toast.setHtml(formattedTemplate);

		toast.element.on('tap', me.handleTap);

		me.element.applyStyles({
			position: 'absolute'
		});

		me.show({
			from: {
				opacity: 0,
				left: left,
				top: 4
			},
			to: {
				opacity: 1,
				left: left,
				top: 4
			},
			duration: 200
		});

		Ext.defer(me.hide, me.getMilliSecondsUntilHide(), me);
	}
});
