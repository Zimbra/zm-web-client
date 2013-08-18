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
 * This class respresents a store of messages.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.store.ZtItemStore', {

	extend: 'Ext.data.Store',

	requires: [
		'ZCS.common.ZtConstants'
	],

	constructor: function (cfg) {
		if (!cfg.pageSize) {
			cfg.pageSize = ZCS.constant.DEFAULT_PAGE_SIZE;
		}

		this.callParent(arguments);
	}
});
