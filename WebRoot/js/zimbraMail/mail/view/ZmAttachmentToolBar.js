/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
