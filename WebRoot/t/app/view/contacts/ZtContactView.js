/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * This class displays a single contact.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtContactView', {

	extend: 'Ext.Container',

	xtype: ZCS.constant.APP_CONTACTS + 'itemview',

	config: {
		tpl: Ext.create('Ext.XTemplate', ZCS.template.Contact),
        cls: 'zcs-contactview',
        scrollable: {
            direction: 'vertical',
            directionLock: true
        }
	},

	showItem: function(contact) {

		var data = ZCS.util.getFields(contact, ZCS.constant.CONTACT_TEMPLATE_FIELDS),
			imageUrl = ZCS.common.ZtUtil.getImageUrl(contact, 125);

		data.imageStyle = imageUrl ? 'background-image: url(' + imageUrl + ')' : '';
		this.setHtml(this.getTpl().apply(data));
	},

	clearItem: function() {
		this.setHtml('');
	}
});
