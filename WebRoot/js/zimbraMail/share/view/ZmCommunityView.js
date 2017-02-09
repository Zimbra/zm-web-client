/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Sets up an iframe which displays content from Community (activity stream, notifications, chat).
 * @class
 * This class displays Community content in an iframe.
 *
 * @extends		ZmAppIframeView
 *
 * @author Conrad Damon
 */
ZmCommunityView = function(params) {
	ZmAppIframeView.apply(this, arguments);
	this._createFrame(params);
	this._setupMessageHandling();
};

ZmCommunityView.prototype = new ZmAppIframeView;
ZmCommunityView.prototype.constructor = ZmCommunityView;

ZmCommunityView.prototype.isZmCommunityView = true;
ZmCommunityView.prototype.toString = function() { return "ZmCommunityView"; };

ZmCommunityView.prototype._setupMessageHandling = function(params) {

	// Set up to handle messages sent to us via postMessage()
	var iframe = document.getElementById(this._iframeId);
	if (iframe) {
		var callback = ZmCommunityView.handleMessage.bind(null, this);
		if (window.addEventListener) {
			window.addEventListener('message', callback, false);
		}
		else if (window.attachEvent) {
			window.attachEvent('onmessage', callback);
		}
	}
};

ZmCommunityView.prototype._getIframeId = function() {
	return 'fragment-41812_iframe';     // this is what Community is expecting
};

/**
 * If Community tells us there is new content, turn the tab orange if it's not the current tab,
 * and refresh the content.
 *
 * @param view
 * @param event
 */
ZmCommunityView.handleMessage = function(view, event) {

	var iframe = document.getElementById(view._iframeId);
	if (iframe && event.source === iframe.contentWindow) {
		var data = AjxStringUtil.parseQueryString(event.data || '');
		var isUnread = (data.unread && data.unread.toLowerCase() === 'true');
		if (data.type === 'community-notification' && isUnread) {
			appCtxt.getApp(view._appName).startAlert();
			view.getUpdates();
		}
	}
};

/**
 * Sends a message to Community to refresh the content.
 */
ZmCommunityView.prototype.getUpdates = function() {

	var iframe = document.getElementById(this._iframeId)
	if (iframe) {
		iframe.contentWindow.postMessage('type=community-update', '*');
	}
};

// Called when user switches to this tab.
ZmCommunityView.prototype.activate = function(active) {
	if (active) {
		this.getUpdates();
	}
};

// Code to run when the user clicks the refresh (circle-arrow) button. Shouldn't really be
// needed, but doesn't hurt to have it.
ZmCommunityView.prototype.runRefresh = function() {
	this.getUpdates();
};
