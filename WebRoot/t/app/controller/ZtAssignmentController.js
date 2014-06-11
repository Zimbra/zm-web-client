/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
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
 * Controller for managing an assignment view (used to move or tag an item). Assignment views
 * are used to allow the user to choose a folder to move an item to to, or a tag to tag the item
 * with. There will typically be two possible assignment views for each app, one for folders and
 * one for tags.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.ZtAssignmentController', {

	extend: 'Ext.app.Controller',

	requires: [
		"ZCS.view.ux.ZtFolderAssignmentView",
		"ZCS.view.ux.ZtTagAssignmentView"
	],

	mixins: {
		organizerNotificationHandler: 'ZCS.common.ZtOrganizerNotificationHandler'
	},

	config: {
		/**
		 * @cfg {Object}    hash keyed by app/type, eg 'folder-mail' or 'tag-contacts'
		 */
		assignmentViews: {}
	},

	launch: function() {

		ZCS.app.on('notifyFolderCreate', this.handleOrganizerCreate, this);
		ZCS.app.on('notifySearchCreate', this.handleOrganizerCreate, this);
		ZCS.app.on('notifyTagCreate', this.handleOrganizerCreate, this);

		ZCS.app.on('notifyFolderDelete', this.handleOrganizerDelete, this);
		ZCS.app.on('notifySearchDelete', this.handleOrganizerDelete, this);
		ZCS.app.on('notifyTagDelete', this.handleOrganizerDelete, this);

		ZCS.app.on('notifyFolderChange', this.handleOrganizerChange, this);
		ZCS.app.on('notifySearchChange', this.handleOrganizerChange, this);
		ZCS.app.on('notifyTagChange', this.handleOrganizerChange, this);

		ZCS.app.on('notifyRefresh', this.handleRefresh, this);
	},

	showAssignmentView: function(item, type, app, controller, afterAssignment) {

		var targetComp = Ext.Viewport,
			itemPanel = Ext.ComponentQuery.query('appview #' + app + 'itempanel')[0],
			cacheKey = [ type, app ].join('-'),
			viewClass = 'ZCS.view.ux.Zt' + Ext.String.capitalize(type) + 'AssignmentView',
			isTags = (type === ZCS.constant.ORG_TAG),
			contentHeight,
			titlebar = itemPanel.down('titlebar');

		// TODO: determine why total height calc is failing in position maps now.
		contentHeight = 400;

		// To account for the panel header
		contentHeight += 20;

		var toggleHidden = itemPanel.isListPanelToggleHidden();
		if (!toggleHidden) {
			itemPanel.hideListPanelToggle();
		}

		var views = this.getAssignmentViews(),
			assignmentView = views[cacheKey];

		if (!assignmentView) {

			assignmentView = Ext.create(viewClass, {

				targetElement:    targetComp.bodyElement,
				record:           item,
				listTitle:        isTags ? ZtMsg.tags : ZtMsg.folders,
				organizerTree:    ZCS.session.getOrganizerData(app, type, ZCS.constant.ORG_LIST_ASSIGNMENT),
				app:              app,

				onAssignmentComplete:   function () {
					if (titlebar) {
						titlebar.show();
					}
					if (!toggleHidden) {
						itemPanel.showListPanelToggle();
					}
					if (controller && afterAssignment) {
						controller[afterAssignment]();
					}
				}
			});
			views[cacheKey] = assignmentView;
		}

		if (titlebar) {
			titlebar.hide();
		}

		var list = assignmentView.down('list');

		list.refresh();

		var listItems = list.getViewItems(),
			store = list.getStore();

/*
		store.each(function(organizer, index) {
			organizer = organizer instanceof ZCS.model.ZtOrganizer ? organizer : ZCS.cache.get(organizer.getId());
			listItems[index].setDisabled(!organizer.isValidAssignmentTarget(item));
		}, this);
*/

		assignmentView.showWithComponent(itemPanel, item, contentHeight);

		return assignmentView;
	},

	/**
	 * Returns a list of known assignment views.
	 * @return {Array}  list of ZtAssignmentView
	 * @private
	 */
	getAssignmentViewList: function() {
		return Ext.Object.getValues(this.getAssignmentViews());
	},

	handleOrganizerCreate: function(folder, notification) {
		this.addOrganizer(this.getAssignmentViewList(), notification);
	},

	handleOrganizerDelete: function(folder, notification) {
		this.removeOrganizer(this.getAssignmentViewList(), folder);
	},

	handleOrganizerChange: function(folder, notification) {
		this.modifyOrganizer(this.getAssignmentViewList(), folder, notification);
	},

	/**
	 * We got a <refresh> block. Reload the overviews.
	 */
	handleRefresh: function() {
		this.reloadOverviews(this.getAssignmentViewList());
	}
});
