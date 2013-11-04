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
 * Base class for a List view of items. Tapping an item displays it in the item panel.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtListView', {

	extend: 'Ext.dataview.List',

	requires: [
		'Ext.plugin.ListPaging',
		'ZCS.common.ZtPullRefresh'
	],

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
		},

		plugins: [{
			xclass: 'Ext.plugin.ListPaging',
			autoPaging: true,
			noMoreRecordsText: '',
			loadMoreText: ZtMsg.loadMore
		}, {
			xclass: 'ZCS.common.ZtPullRefresh',
			pullText: 'Pull down to refresh'
		}]
	}
});
