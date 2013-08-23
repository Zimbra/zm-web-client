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
 * This class shows a user a list of tags to apply to the configured component/record.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.view.ux.ZtTagAssignmentView', {

	extend: 'ZCS.view.ux.ZtAssignmentView',

	alias: 'widget.tagview',

	constructor: function (config) {

		var cfg = config || {},
			tagData = ZCS.session.getOrganizerDataByAppAndOrgType(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);

		// It would be nicer to create actual ZtOrganizer instances to populate the store, but doing that
		// messes up the store for some reason - it ends up with one unusable record.
		var tagStore = Ext.create('Ext.data.Store', {
//			model:  'ZCS.model.ZtOrganizer',
			data:   tagData,
			proxy: {
				type: 'memory',
				model: 'ZCS.model.ZtOrganizer'
			}
		});

		cfg.list = {
			xtype:              'foldersublist',
			ui:                 'dark',
			store:              tagStore,
			canDisableItems:    true,
			itemTpl:            ZCS.template.TagAssignmentListItem
		};

		this.callParent([cfg]);
	}
});
