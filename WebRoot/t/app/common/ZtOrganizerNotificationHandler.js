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
 * Mixin that provides methods for handling organizer notifications by updating
 * a List/NestedList that contains organizer nodes.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */

Ext.define('ZCS.common.ZtOrganizerNotificationHandler', {

	/**
	 * Adds an organizer to the given list of views. First, the organizer will be created from
	 * the provided notification JSON, then it will be inserted into the proper position in
	 * each organizer tree.
	 *
	 * @param {Array}   parentViews     views that may need to be updated
	 * @param {Object}  notification    notification JSON
	 * @param {String}  context         where organizers appear (eg 'overview' or 'assignment')
	 * @param {String}  app             app in which organizers appear
	 */
	addOrganizer: function(parentViews, notification, context, app) {

		var ln = parentViews.length, i, parentView, organizer;

		for (i = 0; i < ln; i++) {
			parentView = parentViews[i];
			organizer = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(notification, notification.itemType);
			if (organizer) {
				ZCS.model.ZtOrganizer.addOtherFields(organizer, app || parentView.getApp(), context, false);
				this.insertOrganizer(parentView.down('folderlist'), organizer, organizer.parentItemId, organizer.parentZcsId);
			}
		}
	},

	/**
	 * Handles changes to an organizer. The changes are indicated by the notification JSON. If an
	 * organizer has been moved, we need to move it from its old parent to its new parent.
	 *
	 * @param {Array}       parentViews     views that may need to be updated
	 * @param {ZtOrganizer} organizer       organizer being modified
	 * @param {Object}      notification    notification JSON
	 * @param {String}      context         where organizers appear (eg 'overview' or 'assignment')
	 * @param {String}      app             app in which organizers appear
	 */
	modifyOrganizer: function(parentViews, organizer, notification, context, app) {

		var ln = parentViews.length, i, organizer;

		for (i = 0; i < ln; i++) {
			var parentView = parentViews[i],
				app = app || parentView.getApp();

			// organizer has moved (has a new parent)
			if (notification.l) {
				var reader = ZCS.model.ZtOrganizer.getProxy().getReader(),
					data = reader.getDataFromNode(notification, organizer.get('type'), app, []),
					list = parentView.down('folderlist'),
					store = list && list.getStore(),
					organizerId = organizer.getId();

				if (store.getNodeById(organizerId)) {
					var	oldParentId = organizer.get('parentItemId'),
					oldParentZcsId = organizer.get('parentZcsId'),
					newParentId = ZCS.model.ZtOrganizer.getOrganizerId(data.parentZcsId, app, context);

					organizer.set('parentZcsId', data.parentZcsId);
					organizer.set('parentItemId', newParentId);

					this.insertOrganizer(list, organizer, newParentId, data.parentZcsId, oldParentId, oldParentZcsId);
				}
			}
		}
	},

	/**
	 * Removes an organizer from the stores for the given views..
	 *
	 * @param {Array}       parentViews     views that may need to be updated
	 * @param {ZtOrganizer} organizer       organizer being deleted
	 */
	removeOrganizer: function(parentViews, organizer) {

		var ln = parentViews.length, i, organizer;

		for (i = 0; i < ln; i++) {
			var parentView = parentViews[i],
				list = parentView.down('folderlist'),
				store = list && list.getStore(),
				parentNode = store.getNodeById(organizer.get('parentItemId'));

			// store.remove() doesn't work here (actually runs into JS error), so have the
			// parent node do the removal
			if (parentNode) {
				parentNode.removeChild(organizer, true);
				if (!(parentNode.childNodes && parentNode.childNodes.length > 0)) {
					parentNode.set('disclosure', false);
					parentNode.set('leaf', true);
				}
			}
		}
	},

	/**
	 * Adds a new child to the given parent, inserting it at the proper position within
	 * the parent's children.
	 *
	 * @param {ZtOrganizer} organizer
	 * @param {String}      parentId
	 * @private
	 */
	insertOrganizer: function(list, organizer, parentId, parentZcsId, oldParentId, oldParentZcsId) {

		var	store = list && list.getStore(),
			parent = (!parentId || parentZcsId === ZCS.constant.ID_ROOT) ? store.getRoot() : store.getNodeById(parentId),
			oldParent = (!oldParentId || oldParentZcsId === ZCS.constant.ID_ROOT) ? store.getRoot() : store.getNodeById(oldParentId);

		if (parent && organizer) {
			var index = this.getSortIndex(parent, organizer);
			if (index === -1) {
				parent.appendChild(organizer);
			}
			else {
				parent.insertChild(index, organizer);
			}
			parent.set('disclosure', true);
			parent.set('leaf', false);

			if (oldParent && !(oldParent.childNodes && oldParent.childNodes.length > 0)) {
				oldParent.set('disclosure', false);
				oldParent.set('leaf', true);
			}
		}
	},

	/**
	 * Returns the index of the child within the parent's children, or -1 if there
	 * are no children.
	 *
	 * @param {ZtOrganizer} parent
	 * @param {ZtOrganizer} child
	 * @return {Integer}    the sort index
	 * @private
	 */
	getSortIndex: function(parent, child) {

		var ln = parent && parent.childNodes ? parent.childNodes.length : 0,
			i, organizer;

		for (i = 0; i < ln; i++) {
			organizer = parent.childNodes[i];
			if (ZCS.model.ZtOrganizer.compare(child, organizer) === -1) {
				return i;
			}
		}
		return -1;
	}
});
