/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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
 * This class is a List that shows conversations.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtConvListView', {

	extend: 'ZCS.view.ZtListView',

	xtype: ZCS.constant.APP_MAIL + 'listview',

	config: {
		loadingText: ZtMsg.loadingConvs,
		emptyText: "<div class=\"notes-list-empty-text\">" + ZtMsg.noConvs + "</div>",
		scrollToTopOnRefresh: true,
		itemTpl: ZCS.template.ConvListItem
	}
});
