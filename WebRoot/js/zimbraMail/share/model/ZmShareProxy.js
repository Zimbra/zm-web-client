/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010 Zimbra, Inc.
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

ZmShareProxy = function(params) {
    params.type = ZmOrganizer.SHARE;
    ZmOrganizer.call(this, params);
};
ZmShareProxy.prototype = new ZmOrganizer;
ZmShareProxy.prototype.constructor = ZmShareProxy;

ZmShareProxy.prototype.toString = function() {
    return "ZmShareProxy";
};

// Constants

ZmShareProxy.ID_LOADING = -1;
ZmShareProxy.ID_NONE_FOUND = -2;
ZmShareProxy.ID_WARNING = -2;
ZmShareProxy.ID_ERROR = -3;

// Data

ZmShareProxy.prototype.TOOLTIP_TEMPLATE = "share.Widgets#ZmShareProxyToolTip";

// ZmOrganizer methods

ZmShareProxy.prototype.getIcon = function() {
    // icons for loading states
    var m = String(this.id).match(/^(-\d)(?::(.*))?$/);
    switch (Number(m && m[1])) { // NOTE: case is === !!!
        case ZmShareProxy.ID_LOADING: return "Spinner";
        case ZmShareProxy.ID_NONE_FOUND: return "Warning";
        case ZmShareProxy.ID_ERROR: return "Critical";
    }

    // icon for share owner
    if (!this.shareInfo) return "SharedMailFolder";

    // icon based on view type
    var type = ZmOrganizer.TYPE[this.shareInfo.view];
    var orgPackage = ZmOrganizer.ORG_PACKAGE[type];
    if (orgPackage) AjxDispatcher.require(orgPackage);
    var orgClass = window[ZmOrganizer.ORG_CLASS[type]];
    return orgClass ? orgClass.prototype.getIcon.call(this) : "Folder";
};

ZmShareProxy.prototype.getToolTip = function(force) {
    if (!this.shareInfo) return null;
    if (force || !this._tooltip) {
        this._tooltip = AjxTemplate.expand(this.TOOLTIP_TEMPLATE, this.shareInfo);
    }
    return this._tooltip;
};