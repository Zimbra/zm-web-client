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
 * This class displays a mail message using three components: a header, a body, and a footer.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgView', {

	extend: 'Ext.dataview.component.ListItem',

	requires: [
		'ZCS.view.mail.ZtMsgHeader',
		'ZCS.view.mail.ZtMsgBody',
		'ZCS.view.mail.ZtMsgFooter'
	],

	xtype: 'msgview',

	config: {

		// Using add() in an initialize method did not work for adding these components
		items: [
			{
				xtype: 'msgheader'
			},
			{
				xtype: 'msgbody'
			},
			{
				xtype: 'msgfooter'
			}
		],

		msg: null,          // ZtMailMsg underlying this view
		expanded: false,    // true if this view is expanded (shows header, body, footer)

		listeners: {
			updatedata: function(msgView, msgData) {
				if (msgData) {
					Ext.Logger.info('updatedata for msg ' + msgData.id);
					var msg = ZCS.cache.get(msgData.id);
					if (msg) {
						if (msg.op === 'load' && !msgData.isLoaded) {
							return;
						}
						// Note: partial update on msg load results in double-render, so do whole thing
						this.setMsg(msg);
						this.setExpanded(!!msgData.isLoaded);
						msgView.renderHeader();
						msgView.renderBody(msg.get('isLast'));
						this.updateExpansion();
					}
				}
			}
		}
	},

	renderHeader: function() {
		this.down('msgheader').render(this.getMsg());
	},

	renderBody: function(isLast) {
		this.down('msgbody').render(this.getMsg(), isLast);
	},

	/**
	 * Toggles view between expanded and collapsed state.
	 */
	toggleView: function() {
		this.setExpanded(!this.getExpanded());
		this.updateExpansion();
		this.down('msgheader').render(this.getMsg());
		this.updateHeight();
	},

	/**
	 * Displays view according to whether it is collapsed or expanded. When the view is
	 * collapsed, the body and footer are hidden.
	 *
	 * @param {boolean} doNotRecomputeHeights		True to recompute heights, false to not recompute.
	 * @private
	 */
	updateExpansion: function() {

		if (this.getExpanded()) {
			this.down('msgbody').show();
			this.down('msgfooter').show();
		}
		else {
			this.down('msgbody').hide();
			this.down('msgfooter').hide();
		}
	},

	updateHeight: function (doNotRecomputeHeights) {
		//Only recompute heights if this function has been called without parameters
		if (!doNotRecomputeHeights) {
			var listRef = this.up('.list');
			// Let the list know this item got updated.
			listRef.updatedItems.push(this);
			listRef.updateItemHeights();
			listRef.refreshScroller(listRef.getScrollable().getScroller());
		}
	}
});
