/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2012, 2013 VMware, Inc.
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
		useComponents: true,
		defaultType: 'msgview',
		disableSelection: true,
		variableHeights: true,
		scrollable: {
			direction: 'vertical'
		},
		store: 'ZtMsgStore',
		itemCls: 'zcs-msgview',
		allowTaps: true
	},

	initialize: function() {

		this.callParent(arguments);

		// Message header taps
		this.on({
			tap: function(e, node) {

				// see if tap listener has been turned off
				if (!this.getAllowTaps()) {
					return false;
				}

				var elm = Ext.fly(e.target),
					msgHeader = this.down('#' + e.delegatedTarget.id),
					msg = msgHeader.getMsg(),
					// Note: elm.getId() hits NPE trying to cache DOM ID, so use elm.dom.id
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				// address bubble
				if (elm.hasCls('zcs-contact-bubble')) {
					msgHeader.fireEvent('contactTap', elm, {
						menuName: ZCS.constant.MENU_CONTACT,
						msg: msg,
						address: idParams.address
					});
					return false;
				}

				// tag bubble
				if (elm.hasCls('zcs-tag-bubble')) {
					msgHeader.fireEvent('tagTap', elm, {
						menuName: ZCS.constant.MENU_TAG,
						msg: msg,
						tagName: idParams.name
					});
					return false;
				}

				// message actions menu
				if (elm.hasCls('zcs-msgHdr-menuButton') || elm.hasCls('zcs-msgHeader-menuButton-span')) {
					msgHeader.fireEvent('menuTap', elm, {
						menuName: ZCS.constant.MENU_MSG,
						msg: msg
					});
					return false;
				}

				// somewhere in the header that is not one of the above
				if (msgHeader) {
					msgHeader.fireEvent('toggleView', msgHeader, elm.hasCls('zcs-msgHdr-link'));
				}

			},
			element: 'element',
			delegate: '.zcs-msg-header',
			scope: this
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
						menuName: ZCS.constant.MENU_CONTACT,
						msg: msg,
						address: idParams.address
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
					msgBody.fireEvent('loadEntireMessage', msg);
				}
			},
			element: 'element',
			delegate: '.zcs-msg-body',
			scope: this
		});

		var scroller = this.getScrollable();

		scroller.getScroller().on('scrollend', function () {
			//<debug>
            Ext.Logger.iframe('Scoll end on list');
            //</debug>
			this.doIframeProofPositioning();
		}, this);

		scroller.getScroller().on('scrollstart', function () {
            //<debug>
			Ext.Logger.iframe('Scroll start on list');
            //</debug>
			this.doIframeProofPositioning();
		}, this);
	},

	doIframeProofPositioning: function(forceZero) {
        var items = this.listItems,
        	doForceZero = forceZero,
            offset = 0,
            i, ln, item, translateY;

        if (items[0].element.dom.parentElement.style["position"] !== "relative") {
        	items[0].element.dom.parentElement.style["position"] = "relative";
    	}

    	// Every expanded list item may have links, so force it to have
    	// absolute positioning, which will prevent a bug where link taps were
    	// not registered.
		for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (item.getExpanded()) {
		        item.element.forceAbsolutePositioning = true;
		    } else {
		    	item.element.forceAbsolutePositioning = false;
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

		listRef.updateItemHeights();
		listRef.refreshScroller(listRef.getScrollable().getScroller());
	}
});
