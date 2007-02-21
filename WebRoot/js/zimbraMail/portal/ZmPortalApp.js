/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmPortalApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmApp.PORTAL, appCtxt, container, parentController);

    ZmApp.registerApp(ZmApp.PORTAL, {
        nameKey: "portal",
        icon: "Globe",
        button: ZmAppChooser.B_PORTAL,
        chooserSort: 1,
        defaultSort: 1
    });
}
ZmPortalApp.prototype = new ZmApp;
ZmPortalApp.prototype.constructor = ZmPortalApp;

ZmPortalApp.prototype.toString = function() {
	return "ZmPortalApp";
};

//
// Constants
//

ZmApp.PORTAL                    = "Portal";
ZmApp.CLASS[ZmApp.PORTAL]		= "ZmPortalApp";
ZmApp.SETTING[ZmApp.PORTAL]	= ZmSetting.PORTAL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.PORTAL]	= 1;

ZmEvent.S_PORTLET   = "PORTLET";
ZmItem.PORTLET      = ZmEvent.S_PORTLET;

//
// Public methods
//

ZmPortalApp.prototype.refreshPortlets = function() {
    var mgr = this.getPortletMgr();
    var portlets = mgr.getPortlets();
    for (var id in portlets) {
        portlets[id].refresh();
    }
};

ZmPortalApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Portal", false, loadCallback, null, true);
};

ZmPortalApp.prototype._handleLoadLaunch =
function(callback) {
    this.setActive(true);
    ZmApp.prototype.launch.call(this, callback);
};

ZmPortalApp.prototype.setActive =
function(active) {
	if (active) {
		var controller = this.getPortalController();
		controller.show();
	}
};

ZmPortalApp.prototype.getPortalController = function() {
	if (!this._portalController) {
		this._portalController = new ZmPortalController(this._appCtxt, this._container, this);
	}
	return this._portalController;
};

ZmPortalApp.prototype.getPortletMgr = function() {
    if (!this._portletMgr) {
        this._portletMgr = new ZmPortletMgr(this._appCtxt);
    }
    return this._portletMgr;
};
