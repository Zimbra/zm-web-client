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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmAttachmentToolBar(parent) {

	ZmToolBar.call(this, parent);

	this._viewButton = this._createButton(ZmAttachmentToolBar.VIEW_BUTTON, null, ZmMsg.view, null, null, true);
    var menu = new DwtMenu(this._viewButton, null, "ActionMenu");
    this._viewButton.setMenu(menu);

    var mi = DwtMenuItem.create(menu, "ListView", ZmMsg.list);
	mi.setData(ZmAttachmentToolBar.MENUITEM_ID, ZmAttachmentToolBar.LIST_MI);
	
    mi = DwtMenuItem.create(menu, "IconView", ZmMsg.icon);
	mi.setData(ZmAttachmentToolBar.MENUITEM_ID, ZmAttachmentToolBar.ICON_MI);
}

ZmAttachmentToolBar.VIEW_BUTTON = 1;

ZmAttachmentToolBar.LIST_MI = 1;
ZmAttachmentToolBar.ICON_MI = 2;

ZmAttachmentToolBar.MENUITEM_ID = "_menuItemId";

ZmAttachmentToolBar.prototype = new ZmToolBar;
ZmAttachmentToolBar.prototype.constructor = ZmAttachmentToolBar;

ZmAttachmentToolBar.prototype.toString = 
function() {
	return "ZmAttachmentToolBar";
}
