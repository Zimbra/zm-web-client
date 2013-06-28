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
 * This class respresents a store of contacts. It is used by the list panel.
 * The contacts in here will have only a few attributes populated. Contact
 * groups are included.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.store.contacts.ZtContactStore', {

	extend: 'ZCS.store.ZtItemStore',

	config: {
		model: 'ZCS.model.contacts.ZtContact',
		remoteSort: true
	}
});
