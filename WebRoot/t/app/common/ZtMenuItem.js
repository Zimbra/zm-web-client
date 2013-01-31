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
 * A small model to represent an action in an action menu.
 *
 * @see ZtMenu
 * @author Conrad Damon <cdamon@zimbra.com>
 *
 * TODO: Do we want to have an 'args' field?
 */
Ext.define('ZCS.model.ZtMenuItem', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			{ name: 'label', type: 'string' },      // user-visible text
			{ name: 'action', type: 'string' },     // constant for the operation to perform
			{ name: 'listener', type: 'auto' }      // function to run when the action is invoked
		]
	}
});
