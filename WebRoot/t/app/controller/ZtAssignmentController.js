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
 * with. There will typically be two possible assignment views for each app.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.ZtAssignmentController', {

	extend: 'Ext.app.Controller',

	showAssignmentView: function(item, type, app, controller, afterAssignment) {

		var targetComp = Ext.Viewport.down('tabpanel'),
			itemPanel = Ext.ComponentQuery.query('appview #' + app + 'itempanel')[0],
			cacheKey = [ type, app ].join('-'),
			viewClass = 'ZCS.view.ux.Zt' + Ext.String.capitalize(type) + 'AssignmentView',
			isTags = (type === ZCS.constant.ORG_TAG),
			contentHeight;

		// TODO: determine why total height calc is failing in position maps now.
		contentHeight = 400;

		// To account for the panel header
		contentHeight += 20;

		var toggleHidden = itemPanel.isListPanelToggleHidden();
		if (!toggleHidden) {
			itemPanel.hideListPanelToggle();
		}

		// TODO: if we're caching assignment views, we will need to update its overview
		// TODO: when we get notified of organizer changes
		var assignmentView = this[cacheKey];
		if (!assignmentView) {
			assignmentView = this[cacheKey] = Ext.create(viewClass, {
				targetElement:          targetComp.bodyElement,
				record:                 item,
				listTitle:              isTags ? ZtMsg.tags : ZtMsg.folders,
				organizerTree:          ZCS.session.getOrganizerData(app, type, 'assignment'),
				onAssignmentComplete:   function () {
					if (controller && controller.updateToolbar) {
						controller.updateToolbar({
							hideAll: false
						});
					}
					if (!toggleHidden) {
						itemPanel.showListPanelToggle();
					}
					if (controller && afterAssignment) {
						controller[afterAssignment]();
					}
				}
			});
		}

		if (controller && controller.updateToolbar) {
			controller.updateToolbar({
				hideAll: true
			});
		}

		var list = assignmentView.down('list'),
			listItems = list.getViewItems(),
			store = list.getStore();

		store.each(function(organizer, index) {
			organizer = organizer instanceof ZCS.model.ZtOrganizer ? organizer : ZCS.cache.get(organizer.getId());
			listItems[index].setDisabled(!organizer.isValidAssignmentTarget(item));
		}, this);

		assignmentView.showWithComponent(itemPanel, item, contentHeight);

		return assignmentView;
	}
});
