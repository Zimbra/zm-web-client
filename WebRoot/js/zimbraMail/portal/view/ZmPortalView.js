/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the portal view.
 * @class
 * This class represents the portal view.
 * 
 * @param {DwtComposite}	container	the containing element
 * @param	{ZmPortalApp}	app			the application
 * @param	{DwtDropTarget}	dropTgt		the drop target
 * 
 * @extends		ZmListView
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

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmPortalView.prototype.toString = function() {
	return "ZmPortalView";
};

//
// Public methods
//

/**
 * Gets the portlet ids.
 * 
 * @return	{Array}		an array of portlet ids
 */
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

/**
 * Gets the view title.
 * 
 * @return	{String}	the title
 */
ZmPortalView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};
