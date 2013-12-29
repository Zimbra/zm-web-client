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

	setReadOnly: function (isReadOnly) {
		var header = Ext.fly(this.element.query('.zcs-msgHdr-link')[0]);
		if (header) {
			header.setVisible(!isReadOnly);
		}
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

		data.tags = ZCS.model.ZtItem.getTagData(data.tags);

		this.setMsg(msg);

		var addrs = data.addrs = ZCS.model.mail.ZtMailItem.convertAddressModelToObject(msg.get('addresses'));

		function getFirstAddr(type) {
			return addrs[type] && addrs[type][0];
		}

		var from = getFirstAddr(ZCS.constant.FROM),
			sender = getFirstAddr(ZCS.constant.SENDER),
			byWayOf = getFirstAddr(ZCS.constant.RESENT_FROM),
			onBehalfOf;

		// if we have no FROM address and msg is in an outbound folder, assume current user is the sender
		if (!from && ZCS.isOutboundFolderId(msg.get('folderId'))) {
			var fromObj = Ext.create(ZCS.model.mail.ZtEmailAddress, {
				type:   ZCS.constant.FROM,
				email:  ZCS.session.getSetting(ZCS.constant.SETTING_FROM_ADDRESS),
				name:   ZCS.session.getSetting(ZCS.constant.SETTING_FROM_NAME)
			});
			from = ZCS.model.mail.ZtMailItem.convertAddressModelToObject(fromObj);
		}

		if (sender) {
			onBehalfOf = from;
			from = sender;
		}
		from = from || {};

		data.fromName = from.name || ZtMsg.unknown;
		data.fromId = from.id;
		data.onBehalfOfName = (onBehalfOf && onBehalfOf.address !== from.address) ? onBehalfOf.name : '';
		data.onBehalfOfId = data.onBehalfOfName ? onBehalfOf.id : '';
		data.byWayOfName = (byWayOf && byWayOf.address !== from.address) ? byWayOf.name : '';
		data.byWayOfNameId = data.byWayOfNameName ? byWayOfName.id : '';

		if (state === ZCS.constant.HDR_EXPANDED) {
			data.recipients = Ext.Array.map(Ext.Array.clean([].concat(data.addrs.TO, data.addrs.CC)), function(addr) {
				return addr.name;
			}).join(', ');
		}

		// Get contact image if it has one
        var contact = ZCS.cache.get(from && from.address, 'email'),
            imageUrl = contact && ZCS.model.contacts.ZtContact.getImageUrl(contact, contact.getId());

        data.imageStyle = imageUrl ? 'background-image: url(' + imageUrl + ')' : '';

		this.setHtml(tpl.apply(data));
	}
}, function (thisClass) {
	thisClass.TEMPLATE = {};
	thisClass.TEMPLATE[ZCS.constant.HDR_COLLAPSED] = ZCS.template.createNestableTemplate('CollapsedMsgHeader');
	thisClass.TEMPLATE[ZCS.constant.HDR_EXPANDED] = ZCS.template.createNestableTemplate('ExpandedMsgHeader');
	thisClass.TEMPLATE[ZCS.constant.HDR_DETAILED] = ZCS.template.createNestableTemplate('DetailedMsgHeader');
});
