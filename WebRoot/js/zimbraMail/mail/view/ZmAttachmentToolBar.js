function ZmAttachmentToolBar(parent) {

	ZmToolBar.call(this, parent);

	this._viewButton = this._createButton(ZmAttachmentToolBar.VIEW_BUTTON, null, ZmMsg.view, null, null, true);
    var menu = new DwtMenu(this._viewButton, null, "ActionMenu");
    this._viewButton.setMenu(menu);

    var mi = DwtMenuItem.create(menu, ZmImg.I_LIST, ZmMsg.list);
	mi.setData(ZmAttachmentToolBar.MENUITEM_ID, ZmAttachmentToolBar.LIST_MI);
	
    mi = DwtMenuItem.create(menu, ZmImg.I_ICON, ZmMsg.icon);
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
