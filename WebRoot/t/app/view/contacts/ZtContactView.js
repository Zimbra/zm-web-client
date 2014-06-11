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
 * This class displays a single contact.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.contacts.ZtContactView', {

	extend: 'Ext.Container',

	xtype: ZCS.constant.APP_CONTACTS + 'itemview',

	config: {
		tpl:        Ext.create('Ext.XTemplate', ZCS.template.Contact),
		emptyTpl:   Ext.create('Ext.XTemplate', ZCS.template.EmptyContactView),
        cls:        'zcs-contactview',
        scrollable: {
            direction: 'vertical',
            directionLock: true
        },
		contact: null
	},

	initialize: function() {

		this.callParent(arguments);

		this.on({
			tap: function(e, node) {

				var elm = Ext.fly(e.target),
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				if (elm.hasCls('zcs-tag-bubble')) {
					// tag tapped: show menu
					this.fireEvent('tagTap', elm, {
						menuName:   ZCS.constant.MENU_TAG,
						item:       this.getContact(),
						zcsId:      idParams.zcsId
					});
					return true;
				}
				else if (idParams.email) {
					// email tapped: go to compose
					this.fireEvent('addressTouch', idParams.email);
				}
			},
			element:    'element',
			delegate:   '.zcs-tag-bubble, .zcs-contactview-email',
			scope:      this
		});
	},

	showItem: function(contact) {

		this.setContact(contact);

		var data = ZCS.util.getFields(contact, ZCS.constant.CONTACT_TEMPLATE_FIELDS),
			imageUrl = ZCS.model.contacts.ZtContact.getImageUrl(contact, contact.getId(), 112);

		Ext.each(data.email, function(email) {
			email.id = ZCS.util.getUniqueId({ email: email.email });
		}, this);

		if (ZCS.session.getSetting(ZCS.constant.SETTING_TAGGING_ENABLED)) {
			data.tags = ZCS.model.ZtItem.getTagData(contact.get('tags'));
		}
		else {
			data.tags = null;
		}
		data.imageStyle = imageUrl ? 'background-image: url(' + imageUrl + ')' : '';

        //truncate the url text
       Ext.each(data.URL, function(urlObj) {
           urlObj.urlText = urlObj.URL.substring(0, Math.min(ZCS.constant.MAX_URL_LENGTH, urlObj.URL.length));
                if (urlObj.URL.length > ZCS.constant.MAX_URL_LENGTH) {
                    urlObj.urlText += '...';
                }

                //add http prefix if not present
                if (!urlObj.URL.match(/^[a-zA-Z]+:\/\//)) {
                    urlObj.URL = 'http://' + urlObj.URL;
                }
        }, this);

		this.setHtml(this.getTpl().apply(data));
	},

	clearItem: function() {
		this.setHtml(this.getEmptyTpl().apply({}));
	}
});
