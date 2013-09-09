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
		useComponents:      true,
		defaultType:        'msgview',
		disableSelection:   true,
		scrollToTopOnRefresh:   false,		
		variableHeights:    true,
		store:              'ZtMsgStore',
		itemCls:            'zcs-msgview',
		allowTaps:          true,
		emptyText:          ZtMsg.selectConv,
		deferEmptyText:     false,
		infinite: 			false,
		scrollable: {
			direction: 'vertical'
		}
	},

	initialize: function() {

		this.callParent(arguments);

		// Message header taps
		this.on({
			tap: function(e, node) {

				// see if tap listener has been turned off
				if (!this.getAllowTaps()) {
					return true;
				}

				var elm = Ext.fly(e.target),
					msgHeader = this.down('#' + e.delegatedTarget.id),
					msg = msgHeader.getMsg(),
					// Note: elm.getId() hits NPE trying to cache DOM ID, so use elm.dom.id
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				// address bubble
				if (elm.hasCls('zcs-contact-bubble')) {
					msgHeader.fireEvent('contactTap', elm, {
						menuName:   ZCS.constant.MENU_ADDRESS,
						msg:        msg,
						address:    idParams.address,
						name:       idParams.name,
						addrObj:    idParams.addrObj
					});
					return true;
				}

				// tag bubble
				if (elm.hasCls('zcs-tag-bubble')) {
					msgHeader.fireEvent('tagTap', elm, {
						menuName:   ZCS.constant.MENU_TAG,
						msg:        msg,
						tagName:    idParams.name
					});
					return true;
				}

				// message actions menu
				if (elm.hasCls('zcs-msgHdr-menuButton') || elm.hasCls('zcs-msgHeader-menuButton-span')) {
					msgHeader.fireEvent('menuTap', elm, {
						menuName:   ZCS.constant.MENU_MSG,
						msg:        msg
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
			element:    'element',
			delegate:   '.zcs-msg-header',
			scope:      this
		});

		// Message body taps
		this.on({
			tap: function(e) {

				// see if tap listener has been turned off
				if (!this.getAllowTaps()) {
					return false;
				}

				var elm = Ext.fly(e.target),
					msgBody = this.down('#' + e.delegatedTarget.id),
					msg = msgBody.getMsg(),
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				// attachment bubble
				if (elm.hasCls('zcs-attachment-bubble')) {
					msgBody.fireEvent('attachmentTap', elm);
					return false;
				}

				// address bubble
				if (elm.hasCls('zcs-contact-bubble')) {
					msgBody.fireEvent('contactTap', elm, {
						menuName:   ZCS.constant.MENU_ADDRESS,
						msg:        msg,
						address:    idParams.address
					});
					return false;
				}

				// invite response button (accept/tentative/decline)
				if (elm.hasCls('zcs-invite-button')) {
					msgBody.fireEvent('inviteReply', idParams.msgId, idParams.action);
				}

				// show/hide quoted text link
				if (elm.hasCls('zcs-quoted-link')) {
					msgBody.fireEvent('toggleQuotedText', msgBody);
				}

				// load rest of truncated message
				if (elm.hasCls('zcs-truncated-message-link')) {
					msgBody.fireEvent('loadEntireMessage', msg, msgBody);
				}
			},
			element:    'element',
			delegate:   '.zcs-msg-body',
			scope:      this
		});

		this.element.on({
			swipe: function(e) { 
				if (e.direction === "left") {
					this.fireEvent('messageSwipeLeft', e);
				} 

				if (e.direction === "right") {
					this.fireEvent('messageSwipeRight', e);
				}
			},
			scope: this
		});

		var scroller = this.getScrollable();


		//Start the list scroll off by not using absolute positioning.
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
        var items = this.listItems,
            offset = 0,
            i, ln, item, translateY;

        if (typeof items[0] === 'object' &&
        		typeof items[0].element === 'object' && 
        			typeof items[0].element.dom === 'object' && 
        				items[0].element.dom.parentElement &&
        					items[0].element.dom.parentElement.style["position"] !== "relative") {
        	items[0].element.dom.parentElement.style["position"] = "relative";
    	}

    	// Every expanded list item may have links, so force it to have
    	// absolute positioning, which will prevent a bug where link taps were
    	// not registered.
		for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];

            if (item.element) {
	            if (!noAbsolute) {
			        item.element.forceAbsolutePositioning = true;
			        item.translate(item.x, item.y);
			    } else {
			    	item.element.forceAbsolutePositioning = false;
		    	}
	    	}
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
	}
});
