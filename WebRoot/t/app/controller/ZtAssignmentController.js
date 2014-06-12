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

	config: {
		/**
		 * @cfg {Object}    hash keyed by app/type, eg 'folder-mail' or 'tag-contacts'
		 */
		assignmentViews: {}
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

		var list,
			views = this.getAssignmentViews(),
			assignmentView = views[cacheKey];

		if (!assignmentView) {

			assignmentView = Ext.create(viewClass, {

				targetElement:    targetComp.bodyElement,
				record:           item,
				listTitle:        isTags ? ZtMsg.tags : ZtMsg.folders,
				organizerRoot:    ZCS.session.getOrganizerData(app, type, ZCS.constant.ORG_LIST_ASSIGNMENT),
				app:              app,

				onAssignmentComplete:   function (success) {
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
			list = assignmentView.down('list');
		} else {
			list = assignmentView.down('list');
			list.refresh();	
		}

		if (titlebar) {
			titlebar.hide();
		}
		
		var store = list.getStore();

		store.filter(function(organizer, index) {
			return organizer.isValidAssignmentTarget(item) && organizer.get('type') === type;
		}, this);

		
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
	}
});
