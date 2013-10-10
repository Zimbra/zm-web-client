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
 * This class is a List that shows conversations.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtConvListView', {

	extend: 'ZCS.view.ZtListView',

	xtype: ZCS.constant.APP_MAIL + 'listview',

	config: {
		loadingText:            ZtMsg.loadingConvs,
		emptyText:              ZtMsg.noConvs,
		scrollToTopOnRefresh:   false,
		itemTpl:                ZCS.template.ConvListItem,
		cls:                    'zcs-conv-list',
		itemHeight: 			90,
		infinite: 				false
	}
});
