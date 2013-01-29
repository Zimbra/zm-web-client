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
		padding: 5,
		tpl: Ext.create('Ext.XTemplate', ZCS.template.MsgHeader),
//		cls: 'zcs-msg-header x-list-item-body'
		cls: 'zcs-msg-header'
	},

	render: function(msg) {

		var data = msg.getData(),
			addressTypes = [
				ZCS.constant.FROM,
				ZCS.constant.TO,
				ZCS.constant.CC
			];

		data.expanded = this.up('msgview').getExpanded();

		Ext.each(addressTypes, function(type) {
			var addrs = msg.getAddressesByType(type);
			if (addrs.length > 0) {
				data[type.toLowerCase()] = Ext.String.htmlEncode(addrs.join('; '));
			}
		}, this);

		this.setHtml(this.getTpl().apply(data));
	}
});
