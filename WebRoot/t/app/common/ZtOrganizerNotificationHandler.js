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
	 */
	addOrganizer: function(parentViews, notification) {
		var me = this,
			organizer, 
			app;

		parentViews = Ext.Array.from(parentViews);

		organizer = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(notification, notification.itemType);

		this.organizerUpdate(parentViews, organizer, function (parentView) {

			app = (parentView.getApp && parentView.getApp()) || ZCS.session.getActiveApp();
			organizer = ZCS.model.ZtOrganizer.getProxy().getReader().getDataFromNode(notification, notification.itemType);
			if (ZCS.session.isValidOrganizer(organizer, app)) {
				var list = me.getListFromView(parentView);
				ZCS.model.ZtOrganizer.addOtherFields(organizer, app, list.getType(), false);
				return me.insertOrganizer(list, organizer, organizer.parentItemId, organizer.parentZcsId);
			}

			return null;
		});
	},

	/**
	 * Removes an organizer from the stores for the given views.
	 *
	 * @param {Array}       parentViews     views that may need to be updated
	 * @param {ZtOrganizer} organizer       organizer being deleted
	 */
	removeOrganizer: function(parentViews, organizer) {
		var me = this;

		me.organizerUpdate(parentViews, organizer, function (parentView) {
			var index,
				list = me.getListFromView(parentView),
				store = list && list.getStore(),
				parentNode = store.getNodeById(organizer.get('parentItemId'));
			
			//Don't touch any stores here, organizerUpdate will handle updating dependent stores and lists.
			if (parentNode) {
				parentNode.disableDefaultStoreEvents();

				parentNode.removeChild(organizer, true);
	
				if (!(parentNode.childNodes && parentNode.childNodes.length > 0)) {
					parentNode.set('disclosure', false);
					parentNode.set('leaf', true);
				}

				parentNode.enableDefaultStoreEvents();

				return {
					oldParent: parentNode,
					newChild: null,
					deletedChild: organizer
				};
			}

			return null;
		});
	},

	/**
	 * Handles changes to an organizer. The changes are indicated by the notification JSON. If an
	 * organizer has been moved, we need to move it from its old parent to its new parent.
	 *
	 * @param {Array}       parentViews     views that may need to be updated
	 * @param {ZtOrganizer} organizer       organizer being modified
	 * @param {Object}      notification    notification JSON
	 */
	modifyOrganizer: function(parentViews, organizer, notification) {
		var me = this;
		parentViews = Ext.Array.from(parentViews);

		me.organizerUpdate(parentViews, organizer, function (parentView) {
			var app = (parentView.getApp && parentView.getApp()) || ZCS.session.getActiveApp();

			// organizer has moved (has a new parent)
			if (notification.l) {
				var reader = ZCS.model.ZtOrganizer.getProxy().getReader(),
					data = reader.getDataFromNode(notification, organizer.get('type'), app, []),
					list = me.getListFromView(parentView),
					store = list && list.getStore(),
					organizerId = organizer.getId();

				if (store.getNodeById(organizerId)) {
					var	newParentItemId = organizer.get('parentItemId'),
						newParentZcsId = organizer.get('parentZcsId'),
						oldParentId = organizer.get('oldParentItemId'),
						oldParentZcsId = organizer.get('oldParentZcsId');

					return me.insertOrganizer(list, organizer, newParentItemId, newParentZcsId, oldParentId, oldParentZcsId);
				}
			}
		});
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
			store.setData({
				items: ZCS.session.getOrganizerData(app, null, list.getType())
			});

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
	 * Adds a new child to the given parent and then run the parent's sorting function.
	 * It would be nice to insert at the proper position, but the sorting function used
	 * in Sencha's tree stores is harry, and finding the right insertion index would
	 * amount to just doing a sort in the first place.
	 *
	 * @param {ZtOrganizer} organizer
	 * @param {String}      parentId
	 * @private
	 */
	insertOrganizer: function(list, organizer, parentId, parentZcsId, oldParentId, oldParentZcsId) {

		var	store = list && list.getStore();
		if (!store) {
			return;
		}

		var	newChild,
			parent = (!parentId || parentZcsId === ZCS.constant.ID_ROOT) ? store.getRoot() : store.getNodeById(parentId),
			oldParent = (!oldParentId || oldParentZcsId === ZCS.constant.ID_ROOT) ? store.getRoot() : store.getNodeById(oldParentId);

		if (parent && organizer) {			
			//Disable default sencha touch events at this point to prevent excessive sorting and memory thrashing.
			//The is caused by the store trying to determine the "insertionindex" of the newly added node several times
			//On a tree store, to determine the insertion index, the parent node is sorted.  Since we have a flat tree,
			//this results in all organizers being sorted multiple times.
			parent.disableDefaultStoreEvents();
			
			newChild = parent.appendChild(organizer);

			//Sort the parent node's children, not firing any events
			parent.sortWithoutEvents(store.data.getSortFn(), true);

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
			"newChild": newChild,
		};

		if (organizer.getId) {
			updateInfo.deletedChild = organizer;
			updateInfo.oldParent = oldParent;
		}

		return updateInfo;
	},

	/**
	 * @private
	 *
	 * Get an update information block using the update functino for
	 * each parent view, and then do an efficient update of dependent stores and
	 * lists.
	 */
	organizerUpdate: function (parentViews, organizer, updateFn) {
		var ln = parentViews.length, 
			i, 
			parentView, 
			updates = [],
			updateInformation;


		for (i = 0; i < ln; i++) {
			parentView = parentViews[i];
			updateInformation = updateFn(parentView);
			if (updateInformation) {
				updates.push(updateInformation);
			}
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

			var refreshIsRequired = false,
				dependentListsForThisNode;

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
					storeToUpdate.sort();
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
