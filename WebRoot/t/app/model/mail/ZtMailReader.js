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
 * This class is a base class for parsing mail item JSON into a ZtMailItem.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMailReader', {

	extend: 'ZCS.model.ZtReader',

	requires: [
		'ZCS.model.mail.ZtEmailAddress'
	],

	/**
	 * Sets flag-related boolean properties based on the JSON flags string. For example, if the letter 'u'
	 * is present in the flags string, the property 'isUnread' will get set to true.
	 *
	 * @param {object}  node        JSON for the mail item
	 * @param {object}  data        data used to create ZtMailItem
	 */
	parseFlags: function(node, data) {
		Ext.each(ZCS.constant.ALL_FLAGS, function(flag) {
			data[ZCS.constant.FLAG_PROP[flag]] = (node.f && node.f.indexOf(flag) !== -1);
		});
	}
});
