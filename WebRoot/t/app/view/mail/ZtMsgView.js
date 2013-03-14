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
 * This class displays a mail message using two components: a header and a body.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgView', {

	extend: 'Ext.dataview.component.ListItem',

	requires: [
		'ZCS.view.mail.ZtMsgHeader',
		'ZCS.view.mail.ZtMsgBody'
	],

	xtype: 'msgview',

	config: {

		// Using add() in an initialize method did not work for adding these components
		items: [
			{
				xtype: 'msgheader'
			}, {
				xtype: 'msgbody'
			}
		],

		msg: null,              // ZtMailMsg underlying this view

		expanded: undefined,    // true if this view is expanded (shows header and body)

		state: ZCS.constant.HDR_COLLAPSED,  // Display state of this header: ZCS.constant.HDR_*

		listeners: {
			updatedata: function(msgView, msgData) {

				if (msgData && !this.up('.itempanel').suppressRedraw) {
					Ext.Logger.info('updatedata for msg ' + msgData.id);
					var msg = ZCS.cache.get(msgData.id),
						loaded = !!msgData.isLoaded,
						isSingleExpand = msg.isExpand;

					if (msg) {
						if (isSingleExpand && !loaded) {
							return;
						}
						// Note: partial update on msg load results in double-render, so do whole thing
						this.setMsg(msg);

						if (!isSingleExpand) {
							this.setExpanded(loaded);
						} else {
							this.setExpanded(true);
						}

						msgView.renderHeader();
						if (loaded) {
							msgView.renderBody(msg.get('isLast'));
						}
						this.updateExpansion();

						if (isSingleExpand) {
							msg.isExpand = false;
						}
					}
				}
			}
		}
	},

	renderHeader: function() {
		this.down('msgheader').render(this.getMsg());
	},

	renderBody: function(isLast) {
		this.down('msgbody').on('msgContentResize', function () {
			this.updateHeight();
		}, this, {
			single: true
		});

		this.down('msgbody').render(this.getMsg(), isLast);
	},

	/**
	 * Toggles view between expanded and collapsed state.
	 */
	toggleView: function() {
		this.updateExpansion();
		this.down('msgheader').render(this.getMsg(), this.getState());
		this.updateHeight();
	},

	/**
	 * Displays view according to whether it is collapsed or expanded. When the view is
	 * collapsed, the body is hidden.
	 *
	 * @param {boolean} doNotRecomputeHeights		True to recompute heights, false to not recompute.
	 * @private
	 */
	updateExpansion: function() {
		if (this.getExpanded()) {
			this.down('msgbody').show();
		}
		else {
			this.down('msgbody').hide();
		}
	},

	setReadOnly: function(isReadOnly) {
		if (!isReadOnly) {
			this.updateExpansion();
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
	},

	/**
	 * When an iframe, that has a parent which has a translate3d value for its transform property, receives a touch event, it
	 * incorrectly interprets the target of that event.  However, if that same parent element has absolute positioning, then
	 * the iframe does correctly interpret that event.  So when this list item gets translated to its position, and it's expanded,
	 * give it absolute positoning.
	 *
	 */
	translate: function(x, y, animation) {
        if (animation) {
            return this.translateAnimated(x, y, animation);
        }

        if (this.isAnimating) {
            this.stopAnimation();
        }

        if (!isNaN(x) && typeof x == 'number') {
            this.x = x;
        }

        if (!isNaN(y) && typeof y == 'number') {
            this.y = y;
        }

        if (this.element.forceAbsolutePositioning) {
            //In case the element was not forced before.
            this.element.dom.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
            this.element.dom.style.top = this.y + 'px';
        } else {
        	if (this.element.dom.style.top) {
        		this.element.dom.style.top = '0px';
        	}
            this.element.dom.style.webkitTransform = 'translate3d(' + this.x + 'px, ' + this.y + 'px, 0px)';
        }
    }

});
