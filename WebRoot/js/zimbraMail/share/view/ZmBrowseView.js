function ZmBrowseView(parent, pickers) {

	DwtComposite.call(this, parent, "ZmBrowseView", DwtControl.ABSOLUTE_STYLE);

	this.setScrollStyle(DwtControl.SCROLL);
	this.addControlListener(new AjxListener(this, this._controlListener));
	this._pickers = new AjxVector();
}

ZmBrowseView.prototype = new DwtComposite;
ZmBrowseView.prototype.constructor = ZmBrowseView;

ZmBrowseView.prototype.toString = 
function() {
	return "ZmBrowseView";
}

ZmBrowseView.prototype.getToolBar = 
function() {
	return this._toolbar;
}

ZmBrowseView.prototype.addPicker =
function(picker, id) {
    this._pickers.add(picker);
    this.layout();
}

ZmBrowseView.prototype.getPickers = 
function() {
	return this._pickers;
}

ZmBrowseView.prototype.removePicker =
function(picker) {
	var p = this._pickers;
	if (p.size() == 0)
		return;
	if (p.remove(picker)) {
		picker.dispose();
	    this.layout();
    }
}

ZmBrowseView.prototype.removeAllPickers =
function() {
	var p = this._pickers;
	while (p.size() > 0) {
		var picker = p.getZast();
		picker.dispose();
	    p.removeZast();
    }
}

ZmBrowseView.prototype.layout =
function() {
	if (!this.getVisible())
		return;
	var p = this._pickers;
	var i, x;
	var sz = p.size();
	for (i = 0; i < sz; i++) {
		x = (i == 0) ? 0 : p.get(i - 1).getXW();
		var picker = p.get(i);
		picker.setBounds(x, 0, Dwt.DEFAULT, this.getH());
	}
	return this;
}

ZmBrowseView.prototype._controlListener =
function(ev) {
	this.layout();
}
