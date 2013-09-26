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
 * This controller manages notifications that come from the server. A notification
 * is a delete, create, or modify of an item. This class acts as a broker, taking
 * a generic notification event and converting it to a specific event that will be
 * caught by the controller that handles it.
 *
 * @author Conrad Damon
 */
Ext.define('ZCS.controller.ZtNotificationController', {

	extend: 'Ext.app.Controller',

	launch: function(notification) {
		ZCS.app.on('notify', this.doNotify, notification);
	},

	/**
	 * Create a specific event (such as "notifyConversationChange") from the generic given
	 * notification by looking at the type of notification and the item affected. For deletes
	 * and modifies, we pass along the item which is retrieved from the item cache. If we don't
	 * find the item, no event is fired.
	 *
	 * @param {Object}  notification        JSON notification
	 */
	doNotify: function(notification) {

		var item = ZCS.cache.get(notification.id),
			itemType = notification.itemType = (item && (item.get('notifyType') || item.get('type'))) || ZCS.constant.NODE_ITEM[notification.nodeType],
			event = itemType ? 'notify' + Ext.String.capitalize(itemType) + notification.type : null;

		if (event && (notification.type === ZCS.constant.NOTIFY_CREATE || item != null)) {
			//<debug>
			Ext.Logger.info('Notification: ' + event);
			//</debug>

			ZCS.app.fireEvent(event, item, notification);
		}
	}
});
