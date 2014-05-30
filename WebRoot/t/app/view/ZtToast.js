/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * This view manages the display of a toast message.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.view.ZtToast', {
	extend: 'Ext.Sheet',
	config: {
		milliSecondsUntilHide: 5000,
		hidden: true,
		floating: true,
		modal: false,
		width: 350,
		left: 300,
		cls: 'zcs-toast',
		layout: 'fit',
		items: [{
			xtype: 'component',
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
		};

		ZCS.app.on('orientationChange', function () {
			me.reposition();
		});

		this.callParent(arguments);
	},

	showMessage: function (message) {
		var me = this,
			formattedTemplate = ZCS.view.ZtToast.toastTpl.apply({ text: message }),
			toast = me.down('component');

		toast.setHtml(formattedTemplate);

		toast.element.on('tap', me.handleTap);
		me.doShow();

        Ext.defer(me.hide, me.getMilliSecondsUntilHide(), me);
	},

	doShow: function () {
		var me = this,
			viewportBox = Ext.Viewport.element.getBox(),
			left = (viewportBox.width / 2) - (me.getWidth() / 2);

		me.element.applyStyles({
			position: 'absolute',
			"zIndex": 10000
		});

        //explicitly set left coordinate - otherwise, disabling animation in hide/show in app.js
        //causes left coordinate of the Toast to be incorrect on Android devices
        me.setLeft(left);

		me.show({
			from: {
				opacity: 0,
				left: left
			},
			to: {
				opacity: 1,
				left: left
			},
			duration: 1000
		});
    },

	reposition: function () {
		var me = this,
			viewportBox = Ext.Viewport.element.getBox(),
			left = (viewportBox.width / 2) - (me.getWidth() / 2);

		me.setLeft(left);
	}
}, function (thisClass) {
		thisClass.toastTpl = Ext.create('Ext.XTemplate', ZCS.template.Toast);
	}
);
