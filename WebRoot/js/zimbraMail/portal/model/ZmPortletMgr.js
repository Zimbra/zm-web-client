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

function ZmPortletMgr(appCtxt) {
    this._appCtxt = appCtxt;
    this._portlets = {};
    this._loadedZimlets = {};
    this._delayedPortlets = {};
}

//
// Public methods
//

ZmPortletMgr.prototype.createPortlets = function(global) {
    var portletsCreated = [];
    var manifest = this._appCtxt.getApp(ZmApp.PORTAL).getManifest();
    if (manifest) {
        var portalDef = manifest.portal;
        var portletDefs = portalDef && portalDef.portlets;
        if (portletDefs) {
            for (var i = 0; i < portletDefs.length; i++) {
                var portletDef = portletDefs[i];
                if (portletDef.global != global) continue;
                
                var id = portletDef.panel && portletDef.panel.id;
                if (id && !this._portlets[id] && document.getElementById(id)) {
                    this.createPortlet(id, portletDef);
                    portletsCreated.push(id);
                }
            }
        }
    }
    return portletsCreated;
};

ZmPortletMgr.prototype.createPortlet = function(id, portletDef) {
    // create portlet
    var portlet = new ZmPortlet(this._appCtxt, null, id, portletDef);
    this._portlets[id] = portlet;

    // notify portlet creation or add to list to notify later
    if (portlet.zimlet) {
        if (typeof portlet.zimlet != "string" || this._loadedZimlets[portlet.zimlet]) {
            this._portletCreated(portlet);
        }
        else {
            var zimletName = portlet.zimletName;
            if (!this._delayedPortlets[zimletName]) {
                this._delayedPortlets[zimletName] = [];
            }
            this._delayedPortlets[zimletName].push(portlet);
        }
    }

    return portlet;
};

ZmPortletMgr.prototype.getPortlets = function() {
    return this._portlets;
};

ZmPortletMgr.prototype.getPortletById = function(id) {
    return this._portlets[id];
};

/**
 * This method is called by ZmZimletContext after the source code for
 * the zimlet is loaded.
 */
ZmPortletMgr.prototype.zimletLoaded = function(zimletCtxt) {
    this._loadedZimlets[zimletCtxt.name] = true;

    var delayedPortlets = this._delayedPortlets[zimletCtxt.name];
    if (delayedPortlets) {
        for (var i = 0; i < delayedPortlets.length; i++) {
            var portlet = delayedPortlets[i];
            this._portletCreated(portlet, zimletCtxt);
        }
    }
    delete this._delayedPortlets[zimletCtxt.name];
};

//
// Protected methods
//

ZmPortletMgr.prototype._portletCreated = function(portlet, zimletCtxt) {
    // get zimlet context, if needed
    if (!zimletCtxt) {
        zimletCtxt = this._appCtxt.getZimletMgr().getZimletsHash()[portlet.zimletName];
    }

    // create view
    var parentEl = document.getElementById(portlet.id);
    var view = new ZmPortletView(parentEl, portlet);

    // call portlet handler
    var handler = zimletCtxt.handlerObject;
    portlet.zimlet = handler;
    if (handler) {
        handler.portletCreated(portlet);
    }
};