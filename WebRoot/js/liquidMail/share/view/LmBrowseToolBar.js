function LmBrowseToolBar(parent, pickers) {

	LmToolBar.call(this, parent, "LmBrowseToolBar");
	
	for (var i = 0; i < pickers.length; i++) {
		var id = pickers[i];
		var b = this._createButton(id, LmPicker.IMAGE[id], LmMsg[LmPicker.MSG_KEY[id]], null, LmMsg[LmPicker.TT_MSG_KEY[id]], true);
		b.setData(LmPicker.KEY_ID, id);
		b.setData(LmPicker.KEY_CTOR, LmPicker.CTOR[id]);
	}

	this._createSeparator();

	var id = LmPicker.RESET;
	var b = this._createButton(id, LmPicker.IMAGE[id], LmMsg[LmPicker.MSG_KEY[id]], null, LmMsg[LmPicker.TT_MSG_KEY[id]], true);
	b.setData(LmPicker.KEY_ID, id);

	this.addFiller();

	var id = LmPicker.CLOSE;
	var b = this._createButton(id, LmPicker.IMAGE[id], LmMsg[LmPicker.MSG_KEY[id]], null, LmMsg[LmPicker.TT_MSG_KEY[id]], true);
	b.setData(LmPicker.KEY_ID, id);
}

LmBrowseToolBar.prototype = new LmToolBar;
LmBrowseToolBar.prototype.constructor = LmBrowseToolBar;

LmBrowseToolBar.prototype.toString = 
function() {
	return "LmBrowseToolBar";
}
