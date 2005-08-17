function ZmBrowseToolBar(parent, pickers) {

	ZmToolBar.call(this, parent, "ZmBrowseToolBar");
	
	for (var i = 0; i < pickers.length; i++) {
		var id = pickers[i];
		var b = this._createButton(id, ZmPicker.IMAGE[id], ZmMsg[ZmPicker.MSG_KEY[id]], null, ZmMsg[ZmPicker.TT_MSG_KEY[id]], true);
		b.setData(ZmPicker.KEY_ID, id);
		b.setData(ZmPicker.KEY_CTOR, ZmPicker.CTOR[id]);
	}

	this._createSeparator();

	var id = ZmPicker.RESET;
	var b = this._createButton(id, ZmPicker.IMAGE[id], ZmMsg[ZmPicker.MSG_KEY[id]], null, ZmMsg[ZmPicker.TT_MSG_KEY[id]], true);
	b.setData(ZmPicker.KEY_ID, id);

	this.addFiller();

	var id = ZmPicker.CLOSE;
	var b = this._createButton(id, ZmPicker.IMAGE[id], ZmMsg[ZmPicker.MSG_KEY[id]], null, ZmMsg[ZmPicker.TT_MSG_KEY[id]], true);
	b.setData(ZmPicker.KEY_ID, id);
}

ZmBrowseToolBar.prototype = new ZmToolBar;
ZmBrowseToolBar.prototype.constructor = ZmBrowseToolBar;

ZmBrowseToolBar.prototype.toString = 
function() {
	return "ZmBrowseToolBar";
}
