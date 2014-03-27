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
 * 
 * @extends		DwtControl
 * @private
 */
ZmUpsellView = function(params) {
	DwtControl.call(this, params);
	this._createFrame(params);
};

ZmUpsellView.prototype = new DwtControl;
ZmUpsellView.prototype.constructor = ZmUpsellView;

ZmUpsellView.prototype.isZmUpsellView = true;
ZmUpsellView.prototype.toString = function() { return "ZmUpsellView"; };

ZmUpsellView.prototype._createFrame = function(params) {

	params = params || {};

	var app = this._appName = params.appName;
	var isSocial = (app === ZmApp.SOCIAL);  // assume Social is Zimbra Community
	// Note: for Zimbra Community, may need to add client_id and url IFRAME attrs at some point for OAuth

	var upsellUrl = appCtxt.get(ZmApp.UPSELL_URL[app]),
		htmlArr = [],
		idx = 0;

	var	iframeId = this._iframeId = isSocial ? 'fragment-41812_iframe' : 'iframe_' + this.getHTMLElId();

	htmlArr[idx++] = "<iframe id='" + iframeId + "' width='100%' height='100%' frameborder='0' src='";
	htmlArr[idx++] = upsellUrl;
	htmlArr[idx++] = "'>";
	this.setContent(htmlArr.join(""));

	var iframe = document.getElementById(iframeId);
	if (iframe) {
		var callback = ZmUpsellView.handleMessage.bind(null, this);
		if (window.addEventListener) {
			window.addEventListener('message', callback, false);
		}
		else if (window.attachEvent) {
			window.attachEvent('onmessage', callback);
		}
	}
};

ZmUpsellView.handleMessage = function(view, event) {

	var iframe = document.getElementById(view._iframeId);
	if (iframe && event.source === iframe.contentWindow) {
		var data = AjxStringUtil.parseQueryString(event.data || '');
		var isUnread = (data.unread && data.unread.toLowerCase() === 'true');
		if (data.type === 'community-notification' && isUnread) {
			appCtxt.getApp(view._appName).startAlert();
		}
	}
};

ZmUpsellView.prototype.setBounds =
function(x, y, width, height, showToolbar) {
    var deltaHeight = 0;
    if(!showToolbar) {
        deltaHeight = this._getToolbarHeight();
    }
	DwtControl.prototype.setBounds.call(this, x, y - deltaHeight, width, height + deltaHeight);
	var id = "iframe_" + this.getHTMLElId();
	var iframe = document.getElementById(id);
	if(iframe) {
    	iframe.width = width;
    	iframe.height = height + deltaHeight;
	}
};

ZmUpsellView.prototype._getToolbarHeight =
function() {
    var topToolbar = appCtxt.getAppViewMgr().getViewComponent(ZmAppViewMgr.C_TOOLBAR_TOP);
	if (topToolbar) {
		var sz = topToolbar.getSize();
		var height = sz.y ? sz.y : topToolbar.getHtmlElement().clientHeight;
		return height;
	}
	return 0;
};

ZmUpsellView.prototype.getTitle = function() {
	return [ ZmMsg.zimbraTitle, appCtxt.getApp(this._appName).getDisplayName() ].join(": ");
};
