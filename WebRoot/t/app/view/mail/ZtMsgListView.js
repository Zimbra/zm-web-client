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

		//Sets the default list item height, which corresponds to collapsed message height
		itemHeight: 70
	},

	initialize: function() {

		this.callParent(arguments);

		// Add a delegate here so we can catch a tap on a msg header.
		// Note: Adding this listener via config does not work.

		this.on({
			tap: function(e, node) {
				//This will not prevent tap events by itself, so we have to manually prevent taps for a period of time to prevent collapse
				//when holding on an address.

				var elm = Ext.fly(e.target),
					msgHeader = this.down('#' + e.delegatedTarget.id),
					msg = msgHeader.getMsg();

				if (elm.hasCls('zcs-contact-bubble')) {
					msgHeader.fireEvent('contactTap', elm, msg, Ext.String.htmlDecode(elm.getAttribute('address')));
					return false;
				}

				if (elm.hasCls('zcs-tag-bubble')) {
					msgHeader.fireEvent('tagTap', elm, msg, Ext.String.htmlDecord(elm.getAttribute('tagName')));
					return false;
				}

				if (elm.hasCls('zcs-attachment-bubble')) {
					msgHeader.fireEvent('attachmentTap', elm, msg);
					return false;
				}

				if (elm.hasCls('zcs-msgHdr-menuButton')) {
					msgHeader.fireEvent('menuTap', elm, msg);
					return false;
				}

				if (msgHeader) {
					msgHeader.fireEvent('toggleView', msgHeader, elm.hasCls('zcs-msgHdr-link'));
				}

			},
			element: 'element',
			delegate: '.zcs-msg-header',
			scope: this
		});

		this.on({
			tap: function(e) {
				var id = e.delegatedTarget.id,
					idParams = id && ZCS.util.getIdParams(id),
					msgBody = idParams && this.down('#' + idParams.msgBodyId);

				if (msgBody) {
					msgBody.fireEvent('inviteReply', idParams.msgId, idParams.action);
				}
			},
			element: 'element',
			delegate: '.zcs-invite-button',
			scope: this
		});
		var scroller = this.getScrollable();

		scroller.getScroller().on('scrollend', function () {
			Ext.Logger.iframe('Scoll end on list');
			this.doIframeProofPositioning();
		}, this);

		scroller.getScroller().on('scrollstart', function () {
			Ext.Logger.iframe('Scroll start on list');
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

    	//Every expanded list item may have links, so force it to have
    	//absolute positioning, which will prevent a bug where link taps were
    	//not registered.
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

		listRef.updateItemHeights();
		listRef.refreshScroller(listRef.getScrollable().getScroller());
	},

	forceHeightRecalc: function () {
		var listRef = this;

		Ext.each(this.query('msgview'), function (view) {
			listRef.updatedItems.push(view);
		});

		listRef.updateItemHeights();
	}
});
