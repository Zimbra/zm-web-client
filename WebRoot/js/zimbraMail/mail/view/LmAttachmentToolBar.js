function LmAttachmentToolBar(parent) {

	LmToolBar.call(this, parent);

	this._viewButton = this._createButton(LmAttachmentToolBar.VIEW_BUTTON, null, LmMsg.view, null, null, true);
    var menu = new DwtMenu(this._viewButton, null, "ActionMenu");
    this._viewButton.setMenu(menu);

    var mi = DwtMenuItem.create(menu, LmImg.I_LIST, LmMsg.list);
	mi.setData(LmAttachmentToolBar.MENUITEM_ID, LmAttachmentToolBar.LIST_MI);
	
    mi = DwtMenuItem.create(menu, LmImg.I_ICON, LmMsg.icon);
	mi.setData(LmAttachmentToolBar.MENUITEM_ID, LmAttachmentToolBar.ICON_MI);
}

LmAttachmentToolBar.VIEW_BUTTON = 1;

LmAttachmentToolBar.LIST_MI = 1;
LmAttachmentToolBar.ICON_MI = 2;

LmAttachmentToolBar.MENUITEM_ID = "_menuItemId";

LmAttachmentToolBar.prototype = new LmToolBar;
LmAttachmentToolBar.prototype.constructor = LmAttachmentToolBar;

LmAttachmentToolBar.prototype.toString = 
function() {
	return "LmAttachmentToolBar";
}
