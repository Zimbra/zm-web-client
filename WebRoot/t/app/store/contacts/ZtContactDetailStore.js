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
 * This class respresents a store of contacts. It is used by the item panel.
 * The contacts in here will be fully populated. The store will contain either
 * a single contact, or the members of a contact group.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.store.contacts.ZtContactDetailStore', {

	extend: 'ZCS.store.ZtItemStore',

	config: {
		model: 'ZCS.model.contacts.ZtContact',
		remoteSort: true
	}
});
