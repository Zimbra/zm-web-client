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
 * An app panel consists of an overview (which shows the app's folder tree), a list of items,
 * and a panel that shows the details of a single item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtAppView', {

	extend: 'Ext.Container',

	requires: [
		'Ext.field.Text',
		'Ext.Label',

		'ZCS.view.ZtOverview',
		'ZCS.view.ZtListPanel',
		'ZCS.view.ZtItemPanel'
	],

	xtype: 'appview',

	config: {
		layout: 'hbox',
		padding: 0,
		app: null,

		// Configs for each app's floating menus
		menuConfigs: {
			mail: {
				msgActions: [
					{ label: ZtMsg.markRead,    action: ZCS.constant.OP_MARK_READ,  handlerName: 'doMarkRead' },
					{ label: ZtMsg.flag,        action: ZCS.constant.OP_FLAG,       handlerName: 'doFlag' },
					{ label: ZtMsg.move,        action: ZCS.constant.OP_MOVE,       handlerName: 'doMove' },
					{ label: ZtMsg.tag,         action: ZCS.constant.OP_TAG,        handlerName: 'doTag' },
					{ label: ZtMsg.markSpam,    action: ZCS.constant.OP_SPAM,       handlerName: 'doSpam' }
				],
				msgReplyActions: [
					{ label: ZtMsg.reply,       action: ZCS.constant.OP_REPLY,      handlerName: 'doReply' },
					{ label: ZtMsg.replyAll,    action: ZCS.constant.OP_REPLY_ALL,  handlerName: 'doReplyAll' },
					{ label: ZtMsg.forward,     action: ZCS.constant.OP_FORWARD,    handlerName: 'doForward' }
				],
				addressActions: [
					{ label: ZtMsg.editContact, action: ZCS.constant.OP_EDIT,           handlerName:   'doEditContact'},
					{ label: ZtMsg.addContact,  action: ZCS.constant.OP_ADD_CONTACT,    handlerName:   'doAddContact'},
					{ label: ZtMsg.newMessage,  action: ZCS.constant.OP_COMPOSE,        handlerName:   'doCompose' },
					{ label: ZtMsg.search,      action: ZCS.constant.OP_SEARCH,         handlerName:   'doSearch' }
				],
				convActions: [
					{ label: ZtMsg.convMarkRead,    action: ZCS.constant.OP_MARK_READ,  handlerName: 'doMarkRead' },
					{ label: ZtMsg.convFlag,        action: ZCS.constant.OP_FLAG,       handlerName: 'doFlag' },
					{ label: ZtMsg.convMove,        action: ZCS.constant.OP_MOVE,       handlerName: 'doMove' },
					{ label: ZtMsg.convTag,         action: ZCS.constant.OP_TAG,        handlerName: 'doTag' }
				],
				convReplyActions: [
					{ label: ZtMsg.reply,       action: ZCS.constant.OP_REPLY,      handlerName: 'doReply' },
					{ label: ZtMsg.replyAll,    action: ZCS.constant.OP_REPLY_ALL,  handlerName: 'doReplyAll' },
					{ label: ZtMsg.forward,     action: ZCS.constant.OP_FORWARD,    handlerName: 'doForward' }
				],
				tagActions: [
					{ label: ZtMsg.removeTag, action: ZCS.constant.OP_REMOVE_TAG,       handlerName: 'doRemoveTag' }
				],
				originalAttachment: [
					{ label: ZtMsg.removeAttachment, action: ZCS.constant.OP_REMOVE_ATT, handlerName: 'doRemoveAttachment' }
				],
				settings: [
					{ label: ZtMsg.logout, action: ZCS.constant.OP_LOGOUT, handlerName: 'doLogout' }
				],
				recipientActions: [
					{ label: 'Remove', handlerName: 'doRemoveRecipient' }
				]
			},
			contacts: {
				contactActions: [
					{ label: ZtMsg.move,        action: ZCS.constant.OP_MOVE,       handlerName: 'doMove' },
					{ label: ZtMsg.tag,         action: ZCS.constant.OP_TAG,        handlerName: 'doTag' },
					{ label: ZtMsg.del,         action: ZCS.constant.OP_DELETE,     handlerName: 'doDelete' }
				]
			},
			calendar: {
				calendarAddressActions: [
					{ label: ZtMsg.editContact, action: ZCS.constant.OP_EDIT,           handlerName:   'doEditContact'},
					{ label: ZtMsg.addContact,  action: ZCS.constant.OP_ADD_CONTACT,    handlerName:   'doAddContact'},
					{ label: ZtMsg.newMessage,  action: ZCS.constant.OP_COMPOSE,        handlerName:   'doCompose' }
				],
				inviteReplyActions: [
					{ label: ZtMsg.acceptAction,      action: ZCS.constant.OP_ACCEPT,      handlerName: 'doAccept' },
					{ label: ZtMsg.tentativeAction,   action: ZCS.constant.OP_TENTATIVE,  handlerName: 'doTentative' },
					{ label: ZtMsg.declineAction,     action: ZCS.constant.OP_DECLINE,    handlerName: 'doDecline' }
				],
				apptActions: [
					{ label: ZtMsg.move,        action: ZCS.constant.OP_MOVE,       handlerName: 'doMove' },
					{ label: ZtMsg.tag,         action: ZCS.constant.OP_TAG,        handlerName: 'doTag' },
					{ label: ZtMsg.del,    action: ZCS.constant.OP_DELETE,       handlerName: 'doDelete' }
				]
			}
		}
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp(),
			overviewEditable = Ext.Array.contains(ZCS.constant.EDITABLE_OVERVIEW_APPS, app);

		this.registerOverviewPanel({
			xtype: 'overview',
			itemId: app + 'overview',
			app: app,
			title: ZCS.constant.OVERVIEW_TITLE[app],
			showEdit: overviewEditable
		});

		if (app !== ZCS.constant.APP_CALENDAR) {
			this.registerListPanel({
				xtype: 'listpanel',
				itemId: app + 'listpanel',
				app: app,
				newButtonIcon: ZCS.constant.NEW_ITEM_ICON[app],
				storeName: ZCS.constant.STORE[app]
			});
		}

		this.registerItemPanel({
			xtype: 'itempanel',
			itemId: app + 'itempanel',
			app: app
		});

		for (var menuName in this.getMenuConfigs()[app]) {
			Ext.create('ZCS.common.ZtMenu', {
				name:   menuName,
				itemId: menuName + 'Menu',
				data:   this.getFilteredMenuData(app, menuName)
			});
		}
	},

	registerOverviewPanel: function (overviewPanelConfig) {
		this.fireEvent('registerOverviewPanel', overviewPanelConfig, this, ZCS.constant.SIDE_MENU_CONFIG);
	},

	registerListPanel: function (listPanelConfig) {
		this.fireEvent('registerListPanel', listPanelConfig, this, ZCS.constant.SIDE_MENU_CONFIG);
	},

	registerItemPanel: function (itemPanelConfig) {
		this.fireEvent('registerItemPanel', itemPanelConfig, this, ZCS.constant.SIDE_MENU_CONFIG);
	},

	// filters out ops that are not enabled by user settings
	getFilteredMenuData: function(app, menuName) {

		var menuItems = this.getMenuConfigs()[app][menuName],
			precondition;

		return Ext.Array.filter(menuItems, function(menuItem) {
			precondition = ZCS.constant.OP_PRECONDITION[menuItem.action];
			return (!precondition || ZCS.session.getSetting(precondition));
		}, this);
	}
});
