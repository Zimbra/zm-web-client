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

function ZmPortlet(appCtxt, list, id, def) {
    ZmItem.call(this, appCtxt, ZmItem.PORTLET, id, list);

    // save zimlet
    var zimletMgr = appCtxt.getZimletMgr();
    this.zimletName = def.zimlet;
    this.zimletCtxt = zimletMgr.getZimletsHash()[this.zimletName];
    this.zimlet = this.zimletCtxt && this.zimletCtxt.handlerObject;

    // save data
    this.icon = def.icon;
    this.title = def.title;
    if (this.title) {
        this.title = this.zimletCtxt ? this.zimletCtxt.processMessage(def.title) : def.zimlet;
    }
    var portlet = this.zimletCtxt && this.zimletCtxt.portlet;
    this.actionUrl = portlet && portlet.actionUrl;

    // merge default and specified properties
    this.properties = {};
    var defaultProps = portlet && portlet.portletProperties;
    for (var i in defaultProps) {
        var prop = defaultProps[i];
        this.properties[prop.name] = prop.value;
    }
    if (def.properties) {
        for (var i = 0; i < def.properties.length; i++) {
            var prop = def.properties[i];
            this.properties[prop.name] = prop._content;
        }
    }

    // setup refresh interval
    if (this.actionUrl) {
        this.setRefreshInterval(this.actionUrl.refresh);
    }
}
ZmPortlet.prototype = new ZmItem;
ZmPortlet.prototype.constructor = ZmPortlet;

ZmPortlet.prototype.toString = function() { return "ZmPortlet"; }

//
// Data
//

/** The view associated to this portlet. Type is ZmPortletView. */
ZmPortlet.prototype.view;

//
// Public methods
//

ZmPortlet.prototype.refresh = function() {
    if (this.view) {
        if (this.actionUrl) {
            this.view.setContentUrl(this.actionUrl.target);
        }
        else if (this.zimlet instanceof ZmZimletBase) {
            this.zimlet.portletRefreshed(this);
        }
        else if (this.zimlet) {
            var text = AjxMessageFormat.format(ZmMsg.zimletNotLoaded, this.zimletName);
            this.setContent(text);
        }
        else {
            var text = AjxMessageFormat.format(ZmMsg.zimletUnknown, this.zimletName);
            this.setContent(text);
        }
    }
};

ZmPortlet.prototype.setRefreshInterval = function(interval) {
    if (this._refreshActionId) {
        clearInterval(this._refreshActionId);
        delete this._refreshActionId;
    }
    if (interval) {
        var action = AjxCallback.simpleClosure(this.refresh, this);
        this._refreshActionId = setInterval(action, interval);
    }
};

ZmPortlet.prototype.setContent = function(content) {
    if (this.view) {
        this.view.setContent(content);
    }
    else {
        DBG.println("no view to set content ("+this.id+")");
    }
};
ZmPortlet.prototype.setContentUrl = function(url) {
    if (this.view) {
        this.view.setContentUrl(url);
    }
    else {
        DBG.println("no view to set content url ("+this.id+")");
    }
};