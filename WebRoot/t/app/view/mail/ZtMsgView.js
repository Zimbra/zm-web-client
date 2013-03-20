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
						isSingleExpand = msg && msg.isExpand;

					if (msg) {
						if (isSingleExpand && !loaded) {
							return;
						}
						this.setMsg(msg);
						this.setExpanded(isSingleExpand ? true : loaded);
						this.setState(this.getExpanded() ? ZCS.constant.HDR_EXPANDED : ZCS.constant.HDR_COLLAPSED);

						msgView.renderHeader(this.getState());
						if (loaded) {
							msgView.renderBody();
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

	/**
	 * Returns the width of the msg header, as that is the only child guarenteed to be
	 * rendered.  Other children, like the body, may need to know this information before
	 * they lay themselves out.
	 *
	 * @return {Number} The width of a child in the message view.
	 */
	getChildWidth: function () {
		return this.down('msgheader').element.getWidth();
	},

	renderHeader: function(state) {
		this.down('msgheader').render(this.getMsg(), state);
	},

	renderBody: function(showQuotedText) {
		this.down('msgbody').on('msgContentResize', function () {
			this.updateHeight();
		}, this, {
			single: true
		});

		this.down('msgbody').render(this.getMsg(), showQuotedText);
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
		var msgBody = this.down('msgbody');
		if (this.getExpanded()) {
			msgBody.show();
		} else {
			msgBody.hide();
		}
	},

	setReadOnly: function(isReadOnly) {
		this.readOnly = isReadOnly;
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

		// Sencha hides a list item by scrolling it up 10000. That doesn't work for a very large
		// message, so move it left as well to make sure it's offscreen.
		if (this.y === -10000) {
			this.x = this.y;
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
