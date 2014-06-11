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
 * Base class for a controller that manages a single item. It handles item actions initiated by a dropdown action menu
 * anchored to the toolbar, or from within the item itself.
 *
 * @see ZtItemPanel
 * @see ZtItem
 * @author Conrad Damon <cdamon@zimbra.com>
 */

Ext.define('ZCS.controller.ZtItemController', {

	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'ZCS.common.ZtMenu'
	],

	config: {

		refs: {
			itemPanelToolbar: '',
			itemPanel: ''
		},

		control: {
			itemPanelToolbar: {
				showMenu: 'showMenu'
			}
		},

		item: null
	},

	/**
	 * Clears the content of the toolbar. Hides placeholder text if appropriate.
	 *
	 * @param {Boolean}     noItemsFound        if true, list panel
	 */
	clear: function(noItemsFound) {

		this.updateToolbar({
			title:      '',
			hideAll:    true
		});

		// Don't show placeholder text if there is nothing to select
		var placeholder = this.getPlaceholder();
		if (placeholder) {
			if (noItemsFound) {
				placeholder.hide();
			}
			else {
				placeholder.show();
			}
		}
	},

	/**
	 * Do a delete originating from a button.  This drops the button parameter and
	 * allows doDelete to be used by both a button and the standard menu behavior.
	 */
	doButtonDelete: function() {
		this.doDelete();
	},

	doDelete: function() {
	},

	/**
	 * Removes the given tag from the item.
	 *
	 * @param {Object}  tagParams   item, tagName, menuName
	 */
	doRemoveTag: function(tagParams) {

		var item = tagParams.item || this.getItem(),
			tagName = tagParams.tagName,
			tag = ZCS.session.getOrganizerModel(tagParams.zcsId);

		if (item && tag) {
			this.tagItem(item, tag, true);
		}
	},

	getPlaceholder: function() {
		return null;
	},

	/**
	 * Displays the given item in a ZtItemPanel.
	 *
	 * @param {ZtItem}  item        the item
	 */
	showItem: function(item) {
		this.clear();
		this.setItem(item);
	},

	/**
	 * Performs a simple server operation on an item. Generally that means some sort of
	 * ActionRequest with an 'op' attribute and possibly other arguments.
	 *
	 * @param {ZtItem}          item        item to act on
	 * @param {Object|String}   data        data to save, or op to perform
	 * @param {Function}        callback    function to run on succes.
	 */
	performOp: function(item, data, callback) {

		item = item || this.getItem();
		if (item) {
			if (Ext.isString(data)) {
				data = { op: data };
			}
			data.success = function(item, operation) {
                //<debug>
				Ext.Logger.info('item op ' + data.op + ' done');
                //</debug>
				if (callback) {
					callback(item);
				}
			};
			item.save(data);
		}
	},

	/**
	 * Returns the toolbar button for the given operation.
	 *
	 * @param {String}      op      operation constant
	 *
	 * @return {Ext.Button} button
	 */
	getItemButton: function(op) {

		var app = ZCS.util.getAppFromObject(this),
			buttonConfig = ZCS.constant.ITEM_BUTTONS[app],
			toolbar = this.getItemPanelToolbar(),
			ln = buttonConfig ? buttonConfig.length : 0, i;

		if (toolbar) {
			for (i = 0; i < ln; i++) {
				if (op === buttonConfig[i].op) {
					return toolbar.down('#' + buttonConfig[i].itemId);
				}
			}
		}

		return null;
	},

	/**
	 * Shows or hides a button.
	 *
	 * @param {String}      op      operation constant
	 * @param {Boolean}     show    if true, show the button; otherwise, hide it
	 *
	 * @return {Ext.Button} button
	 */
	showButton: function(op, show) {

		var button = this.getItemButton(op);
		if (button) {
			if (show) {
				button.show();
			}
			else {
				button.hide();
			}
			button.setHidden(!show);
		}
	},

	/**
	 * Sets the title of the toolbar and shows or hides buttons as appropriate.
	 *
	 * @param {Object}      params      parameters:
	 *                                      title       toolbar title
	 *                                      hideAll     if true, hide all buttons
	 *                                      isDraft     if true, draft is being displayed
	 */
	updateToolbar: function(params) {
		this.updateTitle(params);
	},

	updateTitle: function (params) {
		var toolbar = this.getItemPanelToolbar();
		if (toolbar && params && params.title != null && this.getItemPanel().getApp() !== ZCS.constant.APP_CONTACTS) {
			toolbar.setTitle(params.title);
		}
	},

	/**
	 * Adds or removes a tag to/from the given item.
	 *
	 * @param {ZtMailItem}  item        item
	 * @param {ZtOrganizer} tag         tag to add or remove
	 * @param {Boolean}     remove      if true, remove the tag
	 */
	tagItem: function(item, tag, remove) {

		this.performOp(item, {
			op: remove ? '!tag' : 'tag',
			tn: tag.get('name')
		}, function() {
			var toastMsg = remove ? ZtMsg.tagRemoved : ZtMsg.tagAdded;
			ZCS.app.fireEvent('showToast', Ext.String.format(toastMsg, tag.get('displayName')));
		});
	},

    /**
     * Disables "Tag" action if user doesn't have any tags.
     */
    enableTagItem: function(menu) {
        if (menu && menu.getItem(ZCS.constant.OP_TAG)) {
            var tags = ZCS.session.getOrganizerData(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);
            menu.enableItem(ZCS.constant.OP_TAG, tags && tags.length > 0);
        }
    },

	/**
	 * Fetch the contact with the given email and use it to populate and edit form.
	 *
	 * @param {object}  actionParams    params with email address in some form
	 */
	doEditContact: function(actionParams) {

		var email = actionParams.addrObj ? actionParams.addrObj.get('email') : actionParams.address;

		ZCS.app.getContactListController().loadContactByEmail(email, function(contacts) {
			var contactController = ZCS.app.getContactController(),
				contact = contacts && contacts[0];

			if (contact) {
				contactController.setItem(contact);
				contactController.showContactForm(ZCS.constant.OP_EDIT, contact);
			}
		});
	}
});
