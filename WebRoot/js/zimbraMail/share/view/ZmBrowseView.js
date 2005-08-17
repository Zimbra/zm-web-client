function LmBrowseView(parent, pickers) {

	DwtComposite.call(this, parent, "LmBrowseView", DwtControl.ABSOLUTE_STYLE);

	this.setScrollStyle(DwtControl.SCROLL);
	this.addControlListener(new LsListener(this, this._controlListener));
	this._pickers = new LsVector();
}

LmBrowseView.prototype = new DwtComposite;
LmBrowseView.prototype.constructor = LmBrowseView;

LmBrowseView.prototype.toString = 
function() {
	return "LmBrowseView";
}

LmBrowseView.prototype.getToolBar = 
function() {
	return this._toolbar;
}

LmBrowseView.prototype.addPicker =
function(picker, id) {
    this._pickers.add(picker);
    this.layout();
}

LmBrowseView.prototype.getPickers = 
function() {
	return this._pickers;
}

LmBrowseView.prototype.removePicker =
function(picker) {
	var p = this._pickers;
	if (p.size() == 0)
		return;
	if (p.remove(picker)) {
		picker.dispose();
	    this.layout();
    }
}

LmBrowseView.prototype.removeAllPickers =
function() {
	var p = this._pickers;
	while (p.size() > 0) {
		var picker = p.getLast();
		picker.dispose();
	    p.removeLast();
    }
}

LmBrowseView.prototype.layout =
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

LmBrowseView.prototype._controlListener =
function(ev) {
	this.layout();
}
