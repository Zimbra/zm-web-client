function LaStatusToolBar(parent) {

	LaToolBar.call(this, parent, null, null);

	this._createButton(LaStatusToolBar.REFRESH_BUTTON, LaImg.I_UNDO, LaMsg.TBB_Refresh, null, LaMsg.TBB_Refresh_tt, true);
	this._createSeparator();

	this._createButton(LaStatusToolBar.BACK_BUTTON, LaImg.I_BACK_ARROW, null,
	                            LaImg.ID_BACK_ARROW, LaMsg.Back, true);

	this._createButton(LaStatusToolBar.FORWARD_BUTTON, LaImg.I_FORWARD_ARROW, null,
	                            LaImg.ID_FORWARD_ARROW, LaMsg.Forward, true);

	this._createSeparator();
}

LaStatusToolBar.REFRESH_BUTTON = 1;
LaStatusToolBar.BACK_BUTTON = 2;
LaStatusToolBar.FORWARD_BUTTON = 3;

LaStatusToolBar.VIEW_DATA = "LaStatusToolBar.VIEW";

LaStatusToolBar.prototype = new LaToolBar;
LaStatusToolBar.prototype.constructor = LaStatusToolBar;

LaStatusToolBar.prototype.toString = 
function() {
	return "LaStatusToolBar";
}
