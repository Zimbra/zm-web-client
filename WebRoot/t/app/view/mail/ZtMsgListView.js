/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 Zimbra Software, LLC.
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
 * This class is a List that shows the messages within a conversation.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgListView', {

	extend: 'Ext.dataview.List',

	requires: [
		'ZCS.view.mail.ZtMsgView'
	],

	xtype: ZCS.constant.APP_MAIL + 'itemview',

	config: {
		useComponents:        true,
		defaultType:          'msgview',
		disableSelection:     true,
		scrollToTopOnRefresh: false,
		variableHeights:      true,
		store:                'ZtMsgStore',
		itemCls:              'zcs-msgview',
		cls:                  'zcs-msglist',
		allowTaps:            true,
		deferEmptyText:       false,
		infinite:             false,
		scrollable: {
			direction: 'vertical'
		}
	},

	lastPageX: 0,

	initialize: function() {

		this.callParent(arguments);

		// Message header taps
		this.on({

			tap: function(e, node) {

				var target = e.event.actionTarget || e.event.target,
					elm = Ext.fly(target);

				// see if tap listener has been turned off
				if (!this.getAllowTaps()) {
					return true;
				}

				var msgHeader = this.down('#' + e.delegatedTarget.id),
					msg = msgHeader.getMsg(),
					// Note: elm.getId() hits NPE trying to cache DOM ID, so use elm.dom.id
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				// address bubble
				if (idParams.objType === ZCS.constant.OBJ_ADDRESS) {
					msgHeader.fireEvent('contactTap', elm, {
						menuName:   ZCS.constant.MENU_ADDRESS,
						msg:		msg,
						address:	idParams.address,
						name:	   idParams.name,
						addrObj:	idParams.addrObj
					});
					return true;
				}

				// tag bubble
				if (idParams.objType === ZCS.constant.OBJ_TAG) {
					msgHeader.fireEvent('tagTap', elm, {
						menuName:   ZCS.constant.MENU_TAG,
						item:		msg,
						tagName:	idParams.name
					});
					return true;
				}

				// somewhere in the header that is not one of the above
				if (msgHeader) {
					msgHeader.fireEvent('toggleView', msgHeader, elm.hasCls('zcs-msgHdr-link'));
				}

				//Stop this event from triggering a scroll reset.
				e.preventDefault();
				return false;

			},

			element:	'element',
			delegate:   '.zcs-msg-header',
			scope:	  this
		});

		// Message body taps
		this.on({

			tap: function(e) {

				var target = e.event.actionTarget || e.event.target,
					elm = Ext.fly(target);

				// see if tap listener has been turned off
				if (!this.getAllowTaps()) {
					return false;
				}

				var msgBody = this.down('#' + e.delegatedTarget.id),
					msg = msgBody.getMsg(),
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				// attachment bubble
				if (idParams.objType === ZCS.constant.OBJ_ATTACHMENT) {
					msgBody.fireEvent('attachmentTap', elm);
					return false;
				}

				// address bubble
				if (idParams.objType === ZCS.constant.OBJ_ADDRESS) {
					msgBody.fireEvent('contactTap', elm, {
						menuName:   ZCS.constant.MENU_ADDRESS,
						msg:		msg,
						address:	idParams.address
					});
					return false;
				}

				// invite response button (accept/tentative/decline)
				if (idParams.objType === ZCS.constant.OBJ_INVITE) {
					msgBody.fireEvent('inviteReply', idParams.msgId, idParams.action);
				}

				// show/hide quoted text link
				if (idParams.objType === ZCS.constant.OBJ_QUOTED) {
					msgBody.fireEvent('toggleQuotedText', msgBody);
				}

				// load rest of truncated message
				if (idParams.objType === ZCS.constant.OBJ_TRUNCATED) {
					msgBody.fireEvent('loadEntireMessage', msg, msgBody);
				}
			},

			element:	'element',
			delegate:   '.zcs-msg-body',
			scope:	  this
		});

		this.element.on({

			swipe: function(e) {

				var iframe = this.down('[xtype=iframe]'),
					iframeDom,
					scrollLeftMax,
					noScrollRestrictions = false,
					scrollIsMaxed = false,
					scrollIsAtStart = false,
					leftSwipeAllowed = false,
					rightSwipeAllowed = false;

				if (iframe) {
					iframeDom = iframe.element.dom;
					scrollLeftMax = iframeDom.scrollWidth - iframeDom.clientWidth;
					scrollIsMaxed = (iframeDom.scrollLeft === scrollLeftMax);
					scrollIsAtStart = (iframeDom.scrollLeft === 0);
					leftSwipeAllowed = scrollIsMaxed && iframeDom.leftSwipeAllowed;
					rightSwipeAllowed = scrollIsAtStart && iframeDom.rightSwipeAllowed;
				} else {
					noScrollRestrictions = true;
				}

				leftSwipeAllowed = leftSwipeAllowed || noScrollRestrictions;
				rightSwipeAllowed = rightSwipeAllowed || noScrollRestrictions;

				if (e.direction === "left" && leftSwipeAllowed) {
					this.fireEvent('messageSwipeLeft', e);
				}

				if (e.direction === "right" && rightSwipeAllowed) {
					this.fireEvent('messageSwipeRight', e);
				}
			},

			scope: this
		});

		var interactionStart = function (e) {

				this.lastPageX = e.pageX;
				var iframe = this.down('[xtype=iframe]'),
					iframeDom;

				this.scrollIsEnabled = true;

				if (iframe) {
					iframeDom = iframe.element.dom;
					var scrollLeft = iframeDom.scrollLeft,
						scrollLeftMax = iframeDom.scrollWidth - iframeDom.clientWidth;

					// We only want to touch the dom in touchmove if scrolling is possible
					// even a no-op could hurt scroll performance.
					if (scrollLeftMax > 0) {
						this.scrollIsPossible = true;
					} else {
						this.scrollIsPossible = false;
					}

					// Decide if left swiping or right swiping should be allowed based on the current swipe state of
					// the message.  We don't want a scroll and wipe to happen in the same gesture
					if (!this.scrollIsPossible) {
						iframeDom.leftSwipeAllowed = true;
						iframeDom.rightSwipeAllowed = true;
					} else if (scrollLeft === 0) {
						iframeDom.leftSwipeAllowed = false;
						iframeDom.rightSwipeAllowed = true;
					} else if (scrollLeft === scrollLeftMax) {
						iframeDom.rightSwipeAllowed = false;
						iframeDom.leftSwipeAllowed = true;
					} else {
						iframeDom.leftSwipeAllowed = false;
						iframeDom.rightSwipeAllowed = false;
					}
				}
			},

			interactionMove = function (e) {

				if (this.scrollIsPossible && this.scrollIsEnabled) {
					var xDifferential = e.pageX - this.lastPageX;
					if (xDifferential !== 0) {
						this.down('[xtype=iframe]').element.dom.scrollLeft -= xDifferential;
					}
					this.lastPageX = e.pageX;
				}
			},

			interactionEnd = function () {

				this.scrollIsEnabled = false;
			};

		// Allow swipes to happen at the beginning or end of a touch move.  But not in the middle.
		this.element.on({
			touchstart: interactionStart,
			touchmove: interactionMove,
			touchend: interactionEnd,
			// let this work with clicks/mouse too
			mousedown: interactionStart,
			mousemove: interactionMove,
			mouseup: interactionEnd,
			scope: this
		});

		var scroller = this.getScrollable();

		// Start the list scroll off by not using absolute positioning.
		scroller.getScroller().on('scrollstart', function () {
			//<debug>
			Ext.Logger.iframe('Scroll start on list');
			//</debug>
		 	this.doIframeProofPositioning(true);
		}, this);

		scroller.getScroller().on('scrollend', function () {
			//<debug>
			Ext.Logger.iframe('Scoll end on list');
			//</debug>
			this.doIframeProofPositioning();
		}, this);
	},

	doIframeProofPositioning: function(noAbsolute) {
		if (!noAbsolute) {
			this.setScrollHack();
		} else {
			this.resetScrollHack();
		}
	},

	setReadOnly: function (isReadOnly) {
		var listRef = this;

		Ext.each(this.query('msgview'), function (view) {
			view.setReadOnly(isReadOnly);
			listRef.updatedItems.push(view);
		});

		this.setAllowTaps(!isReadOnly);

		// Was only needed when list was inifite
		if (listRef.getInfinite() && listRef.itemsCount) {
			listRef.handleItemHeights();
			listRef.refreshScroller(listRef.getScrollable().getScroller());
		}
	},

	/**
	 * Bug 83170 - container sized to zero on app switch, don't re-display items
	 */
	onContainerResize: function(container, size) {
		if (size.height > 0 && size.width > 0) {
			this.callParent(arguments);
		}
	},

	/**
	 * Make sure the user can read the first expanded msg (which is either the latest unread msg,
	 * or the latest msg if all are read).
	 */
	scrollToFirstExpandedMsg: function() {

		var msgViews = this.getViewItems(),
			ln = msgViews.length, i,
			totalHeight = 0,
			containerHeight = this.element.getHeight();

		for (i = 0; i < ln; i++) {
			var msgView = msgViews[i],
				msgViewHeight = msgView.element.getHeight(),
				msgViewBottom = totalHeight + msgViewHeight,
				scrollAmt = 0;

			if (msgView.getExpanded()) {
				if (msgViewBottom > containerHeight) {
					if (msgViewHeight > containerHeight) {
						scrollAmt = totalHeight;
					}
					else {
						scrollAmt = msgViewBottom - containerHeight;
					}
					this.getScrollable().getScroller().scrollTo(0, scrollAmt);
				}
				break;
			}
			else {
				totalHeight += msgViewHeight;
			}
		}
	},

	setScrollHack: function () {
		var scroller = this.getScrollable().getScroller(),
			lastY = this.getScrollable().getScroller().getTranslatable().lastY;
			
		scroller.getElement().dom.style.position = "absolute";
		scroller.getElement().dom.style.top = lastY + "px";
		scroller.getElement().dom.style.webkitTransform = 'translate3d(0px, 0px, 0px)';
	},

	resetScrollHack: function () {
		var scroller = this.getScrollable().getScroller(),
			lastY = this.getScrollable().getScroller().getTranslatable().lastY;

		scroller.getElement().dom.style.position = "relative";
		scroller.getElement().dom.style.top = "0px";
		scroller.getElement().dom.style.webkitTransform = 'translate3d(0px, ' + lastY + 'px, 0px)';
	}
});
