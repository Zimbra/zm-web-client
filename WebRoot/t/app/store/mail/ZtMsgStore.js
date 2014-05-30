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
 * This class respresents a store of messages.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.store.mail.ZtMsgStore', {

	extend: 'ZCS.store.ZtItemStore',

	config: {
		model: 'ZCS.model.mail.ZtMailMsg',

		// We always ask for msgs in dateDesc order from server since we ask it to expand the first one and we want
		// that to be the latest msg. The user may want msgs in dateAsc order, so we use a sorter here to take care
		// of that.
		sorters: [
			{
				sorterFn: function(msg1, msg2) {
					var isAsc = (ZCS.session.getSetting(ZCS.constant.SETTING_CONVERSATION_ORDER) === ZCS.constant.DATE_ASC),
						date1 = msg1.get('date'),
						date2 = msg2.get('date');

					return isAsc ? date1 - date2 : date2 - date1;
				}
			}
		]
	}
});
