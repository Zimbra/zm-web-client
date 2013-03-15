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
 * This class displays the header content of a mail message. The information
 * shown is slightly different depending whether the view of the message is
 * collapsed or expanded.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgHeader', {

	extend: 'Ext.Component',

	xtype: 'msgheader',

	config: {
		cls: 'zcs-msg-header',
		msg: null,
		listeners: {
			destroy: function () {
				//dereference to prevent memory leaks
				this.setMsg(null);
			}
		}
	},

    /**
     * Get the image URL.
     *
     * contact {Object} contact details
     * maxWidth {int} max pixel width (optional - default 48)
     * @return	{String}	the image URL
     */
    getImageUrl: function(contact, maxWidth) {
        var image = contact && contact.data.image;
        var imagePart  = (image && image.part) || contact.data.imagepart;

        if (!imagePart) {
            return null;
        }
        maxWidth = maxWidth || 48;

        return ZCS.htmlutil.buildUrl({
            path: ZCS.constant.PATH_MSG_FETCH,
            qsArgs: {
                auth: 'co',
                id: contact.data.id,
                part: imagePart,
                max_width:maxWidth,
                t:(new Date()).getTime()
            }
        });
    },


	/**
	 * Displays the message header in one of three states: collapsed, expanded, or detailed.
	 *
	 * @param {ZtMailMsg}   msg     msg being rendered
	 */
	render: function(msg, state) {

		var msgView = this.up('msgview');
		state = state || msgView.getState();
		if (!state) {
			state = msgView.getExpanded() ? ZCS.constant.HDR_EXPANDED : ZCS.constant.HDR_COLLAPSED;
			msgView.setState(state);
		}

		var data = msg.getData(),
			tpl = ZCS.view.mail.ZtMsgHeader.TEMPLATE[state],
			tags = msg.get('tags');

		this.setMsg(msg);
		data.addrs = ZCS.model.mail.ZtMailItem.convertAddressModelToObject(msg.get('addresses'));
		if (state === ZCS.constant.HDR_EXPANDED) {
			data.recipients = Ext.Array.map(Ext.Array.clean([].concat(data.addrs.TO, data.addrs.CC)), function(addr) {
				return addr.displayName;
			}).join(', ');
		}

        /**
         * Fetch contactId from the email Vs contact cache.
         * Use the contactId to fetch the contact record and subsequently the image info.
         */
        var contactId = ZCS.cache.get(data.addrs.FROM[0].address, "email"),
            imageUrl = null;
        if (contactId) {
            var contact = ZCS.cache.get(contactId);
            imageUrl = this.getImageUrl(contact);
        }
        data.imageStyle = imageUrl !== null ? 'background-image: url(' + imageUrl + ')' : '';

		this.setHtml(tpl.apply(data));
	}
}, function (thisClass) {
	thisClass.TEMPLATE = {};
	thisClass.TEMPLATE[ZCS.constant.HDR_COLLAPSED] = Ext.create('Ext.XTemplate', ZCS.template.CollapsedMsgHeader);
	thisClass.TEMPLATE[ZCS.constant.HDR_EXPANDED] = Ext.create('Ext.XTemplate', ZCS.template.ExpandedMsgHeader);
	thisClass.TEMPLATE[ZCS.constant.HDR_DETAILED] = Ext.create('Ext.XTemplate', ZCS.template.DetailedMsgHeader);
});
