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
 * This is a base class for writing a JSON SOAP request for a mail item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMailWriter', {

	extend: 'ZCS.model.ZtWriter',

/*
	setFlags: function(data, node) {
		var flags = '';
		Ext.Object.each(ZCS.constant.FLAG_PROP, function(prop) {
			if (data[prop] === true) {
				flags += ZCS.constant.PROP_FLAG[prop];
			}
		});
		data.f = flags;
	}
*/

	/**
	 * Returns the JSON for a skeleton SOAP request body.
	 *
	 * @param {object}  parent      the SOAP Body
	 * @param {object}  item        record data that maps to the ZtMailItem
	 * @param {boolean} isMsg       true if the mail item is a ZtMailMsg
	 */
	setActionRequest: function(parent, item, isMsg) {
		var method = isMsg ? 'MsgActionRequest' : 'ConvActionRequest';
		parent[method] = {
			_jsns: 'urn:zimbraMail',
			action: {
				id: item.id,
				op: item.op
			}
		}
	}
});
