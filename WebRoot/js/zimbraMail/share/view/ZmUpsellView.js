/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 * 
 * @extends		DwtControl
 * @private
 */
ZmUpsellView = function(params) {
	DwtControl.call(this, params);
}
ZmUpsellView.prototype = new DwtControl;
ZmUpsellView.prototype.constructor = ZmUpsellView;

ZmUpsellView.prototype.toString = function() {
	return "ZmUpsellView";
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
    var topToolbar = appCtxt.getAppViewMgr().getCurrentViewComponent(ZmAppViewMgr.C_TOOLBAR_TOP);
	if (topToolbar) {
		var sz = topToolbar.getSize();
		var height = sz.y ? sz.y : topToolbar.getHtmlElement().clientHeight;
		return height;
	}
	return 0;
};
