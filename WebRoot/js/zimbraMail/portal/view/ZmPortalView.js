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

function ZmPortalView(parent, appCtxt, controller, dropTgt) {
	var headerList = this._getHeaderList(appCtxt);
	ZmListView.call(this,
        parent, "ZmPortalView", Dwt.ABSOLUTE_STYLE,
        ZmController.PORTAL_VIEW, null, controller, headerList, dropTgt
    );

	this._appCtxt = appCtxt;
	this._controller = controller;

    this._initializeView();
}
ZmPortalView.prototype = new ZmListView;
ZmPortalView.prototype.constructor = ZmPortalView;

ZmPortalView.prototype.toString = function() {
	return "ZmPortalView";
};

//
// Protected methods
//

ZmPortalView.prototype._getHeaderList = function() {
    return [];
};

ZmPortalView.prototype._initializeView = function() {
    var viewEl = this.getHtmlElement();
    var portal;

    // load the portal manifest
    var portalName = this._appCtxt.get(ZmSetting.PORTAL_NAME);
    if (portalName) {
        var url = [ "/zimbra/portals/",portalName,"/manifest.js" ].join("");
        var req = AjxLoader.load(url);
        if (req.status == 200 && req.responseText) {
            eval("portal = "+req.responseText);
        }
    }

    // generate layout
    var cols = portal && portal.cols;
    if (cols) {
        var templateId = "zimbraMail.portal.templates.Portal#layout";
        var data = { cols: cols, spacing: 4 };
        viewEl.innerHTML = AjxTemplate.expand(templateId, data);

        // populate portlets
        var zimletMgr = this._appCtxt.getZimletMgr();
        var portletZimlets = zimletMgr.getPortletZimletsHash();
        var portletMgr = this._appCtxt.getApp(ZmApp.PORTAL).getPortletMgr();

        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            var portletDefs = col.portlets || [];
            for (var j = 0; j < portletDefs.length; j++) {
                var portletDef = portletDefs[j];

                var zimlet = portletZimlets[portletDef.zimlet];

                var id = [ "Portal", i, j ].join("_");
                var contEl = document.getElementById(id);

                var portlet = portletMgr.createPortlet(id, portletDef);
                var view = new ZmPortletView(contEl, portlet);
            }
        }
    }

    // clear layout
    else {
        viewEl.innerHTML = "";
    }
};
