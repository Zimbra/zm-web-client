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

	launch: function() {
		ZCS.app.on('notify', this.doNotify, this);
	},

	/**
	 * Create a specific event (such as "notifyConversationChange") from the generic given
	 * notification by looking at the type of notification and the item affected. For deletes
	 * and modifies, we pass along the item which is retrieved from the item cache. If we don't
	 * find the item, no event is fired.
	 *
	 * Some organizers (Trash and tags) can appear in more than one app overview. Sencha requires
	 * those to have unique IDs, so we end up with a many-to-one mapping of Sencha organizer IDs
	 * and ZCS IDs. If we get a notification for one of those organizers, we need to process
	 * it for each of the associated objects within Sencha.
	 *
	 * @param {Object}  notification        JSON notification
	 */
	doNotify: function(notification) {

		if (!this.handleNotification(notification)) {
			return;
		}

		if (notification.type === ZCS.constant.NOTIFY_CREATE) {
			var itemType = notification.itemType = ZCS.constant.NODE_ITEM[notification.nodeType] || notification.nodeType;
			if (itemType) {
				var eventName = 'notify' + Ext.String.capitalize(itemType) + notification.type;
				//<debug>
				Ext.Logger.info('Notification: ' + eventName);
				//</debug>
				ZCS.app.fireEvent(eventName, null, notification);
			}
		}
		else {
			var result = ZCS.cache.get(notification.id, null, true);
			if (result) {
				var items = Array.isArray(result) ? result : [ result ],
					item = items[0],
					itemType = notification.itemType = item && item.get('type'),
					eventName = itemType ? 'notify' + Ext.String.capitalize(itemType) + notification.type : null;

				if (eventName) {
					Ext.each(items, function(item) {
						//<debug>
						Ext.Logger.info('Notification: ' + eventName);
						//</debug>
						ZCS.app.fireEvent(eventName, item, notification);
					}, this);
				}
			}
		}
	},

	// Returns true if we should handle the notification. We don't want to handle empty folder change notifications.
	handleNotification: function(notification) {

		if (notification.type === ZCS.constant.NOTIFY_CHANGE && notification.nodeType === ZCS.constant.ORG_FOLDER) {
			for (var prop in notification) {
				if (ZCS.constant.ORG_NODE_FIELD_HASH[prop]) {
					return true;
				}
			}
			return false;
		}

		return true;
	}
});
