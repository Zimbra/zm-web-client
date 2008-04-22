/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmPortalView = function(parent, controller, dropTgt) {
	var headerList = this._getHeaderList();
	ZmListView.call(this, {parent:parent, className:"ZmPortalView",
						   posStyle:Dwt.ABSOLUTE_STYLE, view:ZmId.VIEW_PORTAL,
						   controller:controller, headerList:headerList, dropTgt:dropTgt});
    this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
	this.setScrollStyle(Dwt.SCROLL);
}
ZmPortalView.prototype = new ZmListView;
ZmPortalView.prototype.constructor = ZmPortalView;

ZmPortalView.prototype.toString = function() {
	return "ZmPortalView";
};

//
// Public methods
//

ZmPortalView.prototype.getPortletIds = function() {
    return this._portletIds || [];
};

//
// Protected methods
//

ZmPortalView.prototype._getHeaderList = function() {
    return [];
};

//ZmPortalView.prototype._initializeView = function() {
ZmPortalView.prototype.set = function() {
	if (this._rendered)  { 
		Dwt.setTitle(this.getTitle()); //bug:24787
		return;
	}
	var callback = new AjxCallback(this, this._initializeView2);
    appCtxt.getApp(ZmApp.PORTAL).getManifest(callback);
};

ZmPortalView.prototype._initializeView2 = function(manifest) {
    // layout view
    var portalDef = manifest && manifest.portal;
    if (portalDef) {
        this.getHtmlElement().innerHTML = portalDef.html || "";
    }

    // create portlets
    var portletMgr = appCtxt.getApp(ZmApp.PORTAL).getPortletMgr();
    this._portletIds = portletMgr.createPortlets();

	this._rendered = true;
};

ZmPortalView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};
