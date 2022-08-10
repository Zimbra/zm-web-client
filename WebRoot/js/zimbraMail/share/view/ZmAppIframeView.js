/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * A generic iframe view that can be associated with an app tab. One use is to display upsell content from an external
 * URL if the user does not currently have the app enabled.
 * @class
 * This class displays an external URL in an iframe.
 *
 * @extends		DwtControl
 *
 * @author Conrad Damon
 */
ZmAppIframeView = function(params) {

	if (arguments.length === 0) {
		return;
	}

	DwtControl.call(this, {
		parent:     appCtxt.getShell(),
		posStyle:   Dwt.ABSOLUTE_STYLE,
		className:  'ZmAppIframeView'
	});

	this._createFrame(params);
};

ZmAppIframeView.prototype = new DwtControl;
ZmAppIframeView.prototype.constructor = ZmAppIframeView;

ZmAppIframeView.prototype.isZmAppIframeView = true;
ZmAppIframeView.prototype.toString = function() { return "ZmAppIframeView"; };

ZmAppIframeView.prototype._createFrame = function(params) {

	params = params || {};

	var app = this._appName = params.appName,
		iframeUrl = appCtxt.get(ZmApp.UPSELL_URL[app]),
		htmlArr = [],
		idx = 0;

	var	iframeId = this._iframeId = this._getIframeId();

	htmlArr[idx++] = "<iframe id='" + iframeId + "' width='100%' height='100%' frameborder='0' src='";
	htmlArr[idx++] = iframeUrl;
	htmlArr[idx++] = "'>";
	this.setContent(htmlArr.join(""));
};

ZmAppIframeView.prototype._getIframeId = function() {
	return 'iframe_' + this.getHTMLElId();
};

ZmAppIframeView.prototype.activate = function(active) {};

ZmAppIframeView.prototype.runRefresh = function() {};

ZmAppIframeView.prototype.setBounds =
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

ZmAppIframeView.prototype._getToolbarHeight =
function() {
    var topToolbar = appCtxt.getAppViewMgr().getViewComponent(ZmAppViewMgr.C_TOOLBAR_TOP);
	if (topToolbar) {
		var sz = topToolbar.getSize();
		var height = sz.y ? sz.y : topToolbar.getHtmlElement().clientHeight;
		return height;
	}
	return 0;
};

ZmAppIframeView.prototype.getTitle = function() {
	return [ ZmMsg.zimbraTitle, appCtxt.getApp(this._appName).getDisplayName() ].join(": ");
};
