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
}

//
// Public methods
//

ZmPortletMgr.prototype.createPortlet = function(id, portletDef) {
    return this._portlets[id] = new ZmPortlet(this._appCtxt, null, id, portletDef);
};

ZmPortletMgr.prototype.getPortlets = function() {
    return this._portlets;
};

ZmPortletMgr.prototype.getPortletById = function(id) {
    return this._portlets[id];
};