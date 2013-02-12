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
		cls: 'zcs-msg-header',
		msg: null,
		listeners: {
			destroy: function () {
				//dereference to prevent memory leaks
				this.setMsg(null);
			}
		}
	},


	render: function(msg) {

		var data = msg.getData(),
			tpl,
			addressTypes = [
				ZCS.constant.FROM,
				ZCS.constant.TO,
				ZCS.constant.CC
			];

		this.setMsg(msg);

		data.expanded = this.up('msgview').getExpanded();
		data.addrs = {};

		Ext.each(addressTypes, function(type) {
			var addrs = msg.getAddressesByType(type);

			if (addrs.length > 0) {
				data.addrs[type.toLowerCase()] = Ext.Array.map(addrs, 
					function (addr) {
						var viewInfo = {
							address: Ext.String.htmlEncode(addr.get('email').toString()),
							displayName: Ext.String.htmlEncode(addr.get('displayName') || addr.get('name'))
						};

						viewInfo.displayName = viewInfo.displayName.replace('"', '');

						return viewInfo;
					}
				);
			}
		}, this);

		if (data.expanded) {
			tpl = ZCS.view.mail.ZtMsgHeader.expandedTpl;
		} else {
			tpl = ZCS.view.mail.ZtMsgHeader.collapsedTpl;
		}

		this.setHtml(tpl.apply(data));
	}
}, function (thisClass) {
	thisClass.collapsedTpl = Ext.create('Ext.XTemplate', ZCS.template.MsgHeader);
	thisClass.expandedTpl = Ext.create('Ext.XTemplate', ZCS.template.ExpandedMsgHeader);
});
