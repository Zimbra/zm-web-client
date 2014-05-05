/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013 Zimbra Software, LLC.
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
