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


	handleOrganizerBatch: function (notifications) {
		var updates = [];

		Ext.each(notifications, function (notification) {



			//Since an organizer can be duplicated across apps (tag/trash)
			//Iterate over each app to get an organizer reference.
			//Get updates
			Ext.each(ZCS.constant.APPS, function(app) {
				//If the notificaiton has a view specified, only consider the app specified in that view.
				var notificationCanApplyToApp = notification.view ? app === ZCS.constant.VIEW_APP[notification.view] : true;
				if (ZCS.util.isAppEnabled(app) && notificationCanApplyToApp) {
					var organizer = ZCS.session.getOrganizerModel(notification.id, app),
						parentOrganizer;

					//Determine the parent organizer based on organizer type and operation type.
					if (notification.nodeType === ZCS.constant.ORG_TAG) {
						parentOrganizer = ZCS.session.getOrganizerModel(ZCS.constant.ID_ROOT, app);
					} else {
						if (notification.type === ZCS.constant.NOTIFY_CREATE) {
							parentOrganizer = ZCS.session.getOrganizerModel(notification.l, app);
						} else if (notification.type === ZCS.constant.NOTIFY_CHANGE) {
							parentOrganizer = ZCS.session.getOrganizerModel(notification.parentZcsId, app);
						}
					}

					if (organizer || parentOrganizer) {
						if (notification.type === ZCS.constant.NOTIFY_CREATE) {
							updates.push(this.addOrganizer(
								notification,
								parentOrganizer,
								app
							));
						} else if (notification.type === ZCS.constant.NOTIFY_CHANGE) {
							updates.push(this.modifyOrganizer(
								organizer,
								notification,
								app
							));
						} else if (notification.type === ZCS.constant.NOTIFY_DELETE) {
							updates.push(this.removeOrganizer(
								organizer,
								notification
							));
						}
					}
				}
			}, this);
		}, this);

		this.doEfficientHandlingOfUpdates(updates);
	},


	/**
	 * Adds an organizer to the appropriate place in the organizer model hierarchy.
	 *
	 * @param {Object}  notification    notification JSON
	 */
	addOrganizer: function(notification, parentOrganizer, app) {
		var me = this,
			newOrganizer;
		
		newOrganizer = ZCS.model.ZtOrganizer.singleInstanceProxy.getReader().getDataFromNode(notification, notification.nodeType);
		if (ZCS.session.isValidOrganizer(newOrganizer, app)) {
			ZCS.model.ZtOrganizer.addOtherFields(newOrganizer, app, false);
			return me.insertOrganizer(newOrganizer, app, parentOrganizer);
		}

		return null;
	},

	/**
	 * Removes an organizer from the stores for the given views.
	 *
	 * @param {ZtOrganizer} organizer       organizer being deleted
	 */
	removeOrganizer: function(organizer, notification) {
		var me = this;


		parentNode = organizer.parentNode;
			
		//Don't touch any stores here, just update the nodes.
		if (parentNode) {
			parentNode.disableDefaultStoreEvents();

			parentNode.removeChild(organizer, true);

			if (!(parentNode.childNodes && parentNode.childNodes.length > 0)) {
				parentNode.set('disclosure', false);
				parentNode.set('leaf', true);
			}

			parentNode.enableDefaultStoreEvents();

			organizer.destroy();

			return {
				oldParent: parentNode,
				newChild: null,
				deletedChild: organizer
			};
		}

		organizer.destroy();

		return null;
	},

	/**
	 * Handles changes to an organizer. The changes are indicated by the notification JSON. If an
	 * organizer has been moved, we need to move it from its old parent to its new parent.
	 *
	 * @param {ZtOrganizer} organizer       organizer being modified
	 * @param {Object}      notification    notification JSON
 	 * @param {String}      app
	 */
	modifyOrganizer: function(organizer, notification, app) {
		organizer.handleModifyNotification(notification);

		if (notification.l) {
			var me = this,
				newParentItemId = organizer.get('parentItemId'),
				newParentZcsId = organizer.get('parentZcsId'),
				oldParentId = organizer.get('oldParentItemId'),
				oldParentZcsId = organizer.get('oldParentZcsId'),
				newParent = ZCS.session.getOrganizerModel(newParentZcsId, app);

			return me.insertOrganizer(organizer, app, newParent, oldParentId, oldParentZcsId);
		}
	},


	/**
	 * @private
	 *
	 * Adds a new child to the given parent and then run the parent's sorting function.
	 * It would be nice to insert at the proper position, but the sorting function used
	 * in Sencha's tree stores is harry, and finding the right insertion index would
	 * amount to just doing a sort in the first place.
	 *
	 * @param {ZtOrganizer} organizer
	 * @param {String}      app
 	 * @param {ZtOrganizer} parent
 	 * @param {String}		oldParentId
 	 * @Param {String}      oldParentZcsId
	 * @private
	 */
	insertOrganizer: function(organizer, app, parent, oldParentId, oldParentZcsId) {

		var	newChild,
			oldParent = oldParentZcsId ? ZCS.session.getOrganizerModel(oldParentZcsId, app) : null;

		if (parent && organizer) {			
			//Disable default sencha touch events at this point to prevent excessive sorting and memory thrashing.
			//The is caused by the store trying to determine the "insertionindex" of the newly added node several times
			//On a tree store, to determine the insertion index, the parent node is sorted.  Since we have a flat tree,
			//this results in all organizers being sorted multiple times.
			parent.disableDefaultStoreEvents();
			
			newChild = parent.appendChild(organizer);

			//Sort the parent node's children, not firing any events
			if (parent.stores.length > 0) {
				parent.sortWithoutEvents(parent.stores[0].data.getSortFn(), false, true);
			}

			if (!parent.get('disclosure')) {
				parent.set('disclosure', true);
			}
			if (parent.get('leaf')) {
				parent.set('leaf', false);
			}

			if (oldParent && (oldParent.childNodes && oldParent.childNodes.length === 0)) {
				oldParent.set('disclosure', false);
				oldParent.set('leaf', true);
			}

			parent.enableDefaultStoreEvents();
		}

		var updateInfo = {
			"parent": parent,
			"newChild": newChild
		};

		if (organizer.getId) {
			updateInfo.deletedChild = organizer;
			updateInfo.oldParent = oldParent;
		}

		return updateInfo;
	},


	/**
	 * Handles the arrival of a <refresh> block by regenerating overviews.
	 *
	 * @param {Array}       parentViews     views that may need to be updated
	 */
	reloadOverviews: function(parentViews) {

		var ln = parentViews.length, i, app,
			updates = []; 

		for (i = 0; i < ln; i++) {
			var parentView = parentViews[i],
				app = (parentView.getApp && parentView.getApp()) || ZCS.session.getActiveApp(),
				list = this.getListFromView(parentView),
				store = list && list.getStore();

			store.data._autoSort = false;
			store.suspendEvents();

			store.setClearOnLoad(false);
			store.getRoot().removeAll(true, true);

			store.setRoot(ZCS.session.getOrganizerRoot(app));

			store.doDefaultSorting();

			updates.push({
				type: 'refresh',
				root: store.getRoot()
			});

			store.data._autoSort = true;
			store.resumeEvents(true);
		}

		this.doEfficientHandlingOfUpdates(updates);
	},


	/** 
	 * @private
	 *
	 * Takes the array of update information objects and efficiently updates
	 * the dependent stores and lists.  This should result in one sort and one
	 * refresh of each store/list that was effected.  Using the default sencha system
	 * can lead to many sorts and list refreshes.
	 * 
	 */
	doEfficientHandlingOfUpdates: function (updates) {
		var ln = updates.length, 
			i, 
			parentView, 
			organizer, 
			app, 
			modelHash = {},
			storesToUpdate = {},
			storeToUpdate,
			parentId,
			newOrganizer,
			deletedOrganizer,
			storeId,
			updates,
			updateInformation,
			parentInfo,
			dependentLists = {};
		for (i = 0; i < ln; i += 1) {
			updateInformation = updates[i];

			//Hash the update info by parent so we only end up updating for each parent once.
			if (updateInformation) {

				if (updateInformation.newChild) {

					modelHash[updateInformation.parent.getId()] = {
						node: updateInformation.parent,
						updates: {}
					};

					//Hash by the update child id so we don't update for the same node twice.
					modelHash[updateInformation.parent.getId()].updates[updateInformation.newChild.getId()] = {
						type: 'add',
						node: updateInformation.newChild
					};
				}

				if (updateInformation.oldParent) {
					modelHash[updateInformation.oldParent.getId()] = {
						node: updateInformation.oldParent,
						updates: {}
					};

					modelHash[updateInformation.oldParent.getId()].updates[updateInformation.deletedChild.getId()] = {
						type: 'delete',
						oldNode: updateInformation.deletedChild
					};
				}

				if (updateInformation.root) {
					modelHash[updateInformation.root.getId()] = {
						node: updateInformation.root,
						updates: {}
					};

					modelHash[updateInformation.root.getId()].updates[updateInformation.root.getId()] = {
						type: 'refresh',
						root: updateInformation.root
					};
				}
			}
		}

		for (parentId in modelHash) {
			parentInfo = modelHash[parentId];

			//Hash the stores to sort so we only sort them once.
			Ext.each(parentInfo.node.stores, function (store) {
				if (!storesToUpdate[store.getId()]) {
					storesToUpdate[store.getId()] = {
						store: store,
						updates: {}
					};
				}

				//Make sure the store knows about every update that needs to occur to it
				Ext.Object.each(parentInfo.updates, function (key, value) {
					storesToUpdate[store.getId()].updates[key] = value;
				});
			});
		}

		/**
		 *
		 * At this point we have a hash of store ids to information about what needs to happen in each store
		 * this allows us to make only a single update to make all updates to the store without
		 * any events flying around.
		 *
		 * {
		 *    'id': {
		 *	      store: store,
		 *	      updates: [{
		 *		      type: 'remove',
		 *		      node: node
		 *	      }, {
		 *		      type: 'add',
		 *		      node: node
		 *	      }]
		 *    }
		 * }
		 */
		for (storeId in storesToUpdate) {

			var	dependentListsForThisNode;

			storeToUpdate = storesToUpdate[storeId].store;

    		storeToUpdate.data._autoSort = false;
    		storeToUpdate.suspendEvents();

			Ext.Object.each(storesToUpdate[storeId].updates, function (key, value) {
				if (value.type === 'add') {
					storeToUpdate.add(value.node);
					dependentListsForThisNode = value.node.getDependentLists();
				} else if (value.type === 'delete') {
					dependentListsForThisNode = value.oldNode.getDependentLists();
					storeToUpdate.remove(value.oldNode);
				} else if (value.type === 'refresh') {

				}

				if (storeToUpdate.doDefaultSorting) {
					storeToUpdate.doDefaultSorting();
				} else {
					storeToUpdate.data._autoSort = false;
					storeToUpdate.suspendEvents();
					storeToUpdate.sort();
					storeToUpdate.data._autoSort = true;
					storeToUpdate.resumeEvents(true);
				}

				Ext.Object.each(dependentListsForThisNode, function (key, list) {
					dependentLists[list.getId()] = list;
				});	
			});

    		storeToUpdate.data._autoSort = true;
    		storeToUpdate.resumeEvents(true);
		}

		//Finally, force a hard refresh on all dependent lists since they had an item either added or removed.
		Ext.Object.each(dependentLists, function (key, value) {
			value.doRefresh();
		});
	},

	/**
	 * Gets the organizer list from a view, accounting for the fact that folders and
	 * tags use two different types of lists.
	 *
	 * @param {Container}   view        parent view
	 * @returns {ZtOrganizerList|ZtOrganizerSubList}   list
	 */
	getListFromView: function(view) {
		return view.down('nestedlist') || view.down('list');
	}
});
