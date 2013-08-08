/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
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
Ext.define('ZCS.view.mail.ZtTagAssignmentView', {
	extend: 'ZCS.view.mail.ZtAssignmentView',
	alias: 'widget.tagview',
	constructor: function (config) {
		var cfg = config || {};

		cfg.listItemTpl = ZCS.template.TagAssignmentListItem;
		cfg.listData = ZCS.session.getOrganizerDataByAppAndOrgType(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);
		cfg.listDataModel = 'ZCS.model.ZtOrganizer';

		this.callParent([cfg]);
	}
});
