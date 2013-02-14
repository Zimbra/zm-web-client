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
 * This class represents a setting, which usually maps to a user preference.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 * @adapts ZmSetting
 */
Ext.define('ZCS.model.ZtSetting', {

	config: {
		name: null,
		type: ZCS.constant.TYPE_STRING,
		value: null
	},

	constructor: function(config) {
		this.initConfig(config);
	}
});
