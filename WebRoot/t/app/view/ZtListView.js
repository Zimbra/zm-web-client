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
 * Base class for a List view of items. Tapping an item displays it in the item panel.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtListView', {

	extend: 'Ext.dataview.List',

	plugins: [{
		xclass: 'Ext.plugin.ListPaging',
		autoPaging: true,
		noMoreRecordsText: ''
	}],

	config: {
		scrollable : {
			direction: 'vertical'
		},
		listeners: {
			select: function(view, record) {
				this.fireEvent('showItem', view, record);
			},
			refresh: function() {
				this.deselect(this.getSelection());
			}
		}
	}
});
