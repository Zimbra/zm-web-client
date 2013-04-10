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
            return contact.data.zimletImage || null;  //return zimlet populated image only if user-uploaded image is not there.
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
			tpl = ZCS.view.mail.ZtMsgHeader.TEMPLATE[state];

		// set up tags with just the data we need, and an associated DOM ID
		if (data.tags) {
			data.tags = Ext.Array.map(Ext.Array.clean(data.tags), function(tag) {
				var tagData = Ext.copyTo({}, tag, 'itemId,color,displayName');
				tagData.id = ZCS.util.getUniqueId(tagData);
				return tagData;
			});
		}

		this.setMsg(msg);
		data.addrs = ZCS.model.mail.ZtMailItem.convertAddressModelToObject(msg.get('addresses'));
		if (state === ZCS.constant.HDR_EXPANDED) {
			data.recipients = Ext.Array.map(Ext.Array.clean([].concat(data.addrs.TO, data.addrs.CC)), function(addr) {
				return addr.displayName;
			}).join(', ');
		}

		// Get contact image if it has one
        var contact = ZCS.cache.get(data.addrs.FROM[0].address, 'email'),
            imageUrl = contact && this.getImageUrl(contact);

        data.imageStyle = imageUrl ? 'background-image: url(' + imageUrl + ')' : '';

		this.setHtml(tpl.apply(data));
	}
}, function (thisClass) {
	thisClass.TEMPLATE = {};
	thisClass.TEMPLATE[ZCS.constant.HDR_COLLAPSED] = Ext.create('Ext.XTemplate', ZCS.template.CollapsedMsgHeader);
	thisClass.TEMPLATE[ZCS.constant.HDR_EXPANDED] = Ext.create('Ext.XTemplate', ZCS.template.ExpandedMsgHeader);
	thisClass.TEMPLATE[ZCS.constant.HDR_DETAILED] = Ext.create('Ext.XTemplate', ZCS.template.DetailedMsgHeader);
});
