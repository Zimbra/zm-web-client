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


	render: function(msg) {

		var data = msg.getData(),
			tpl,
			tags = msg.get('tags');

		this.setMsg(msg);

		data.expanded = this.up('msgview').getExpanded();
		data.addrs = ZCS.model.mail.ZtMailItem.convertAddressModelToObject(msg.get('addresses'));

		if (data.expanded) {
			tpl = ZCS.view.mail.ZtMsgHeader.expandedTpl;
		} else {
			tpl = ZCS.view.mail.ZtMsgHeader.collapsedTpl;
		}

		this.setHtml(tpl.apply(data));
	}
}, function (thisClass) {
	thisClass.collapsedTpl = Ext.create('Ext.XTemplate', ZCS.template.CollapsedMsgHeader);
	thisClass.expandedTpl = Ext.create('Ext.XTemplate', ZCS.template.ExpandedMsgHeader);
});
