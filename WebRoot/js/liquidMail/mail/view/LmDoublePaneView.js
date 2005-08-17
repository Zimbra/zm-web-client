function LmDoublePaneView(parent, className, posStyle, mode, controller, dropTgt) {

	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, className, posStyle);

	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	this._initHeader();
	this._msgListView = new LmMailMsgListView(this, null, Dwt.ABSOLUTE_STYLE, mode, controller, dropTgt);
	this._msgSash = new DwtSash(this, DwtSash.VERTICAL_STYLE, "AppSash-vert", LmDoublePaneView.SASH_THRESHOLD, Dwt.ABSOLUTE_STYLE);
	this._msgView = new LmMailMsgView(this, null, posStyle, mode);

	this._msgSash.registerCallback(this._sashCallback, this);
}

LmDoublePaneView.prototype = new DwtComposite;
LmDoublePaneView.prototype.constructor = LmDoublePaneView;

LmDoublePaneView.prototype.toString = 
function() {
	return "LmDoublePaneView";
}

// consts

LmDoublePaneView.SASH_THRESHOLD = 5;
LmDoublePaneView._TAG_IMG = "TI";


// public methods

LmDoublePaneView.prototype.toggleView = 
function() {
	var bIsVisible = this._isMsgViewVisible();
	
	if (bIsVisible) {
		// cache MLV height
		this._mlvHeight = this._msgListView.getSize().y;
		this._mvHeight = this._msgView.getSize().y;
		this._mvTop = this._msgView.getLocation().y;
	} 
	
	this._msgView.setVisible(!bIsVisible);
	this._msgSash.setVisible(!bIsVisible);
	
	if (!bIsVisible) {
		this._msgListView.resetHeight(this._mlvHeight);
		this._msgView.setSize(Dwt.DEFAULT, this._mvHeight);
		this._msgView.setLocation(Dwt.DEFAULT, this._mvTop);
	} else {
		var sz = this.getSize();
		this._resetSize(sz.x, sz.y);
	}
}

LmDoublePaneView.prototype.getMsgListView =
function() {
	return this._msgListView;
}

LmDoublePaneView.prototype.getSelectionCount = 
function() {
	return this._msgListView.getSelectionCount();
}

LmDoublePaneView.prototype.getSelection = 
function() {
	return this._msgListView.getSelection();
}

LmDoublePaneView.prototype.isDisplayingMsg =
function(msg) {
	return this._msgView.isDisplayingMsg(msg);
}

LmDoublePaneView.prototype.reset =
function() {
	this._msgView.reset();
}

LmDoublePaneView.prototype.setMsg =
function(msg) {
	this._msgView.set(msg);
}

LmDoublePaneView.prototype.addInviteReplyListener =
function (listener){
	this._msgView.addInviteReplyListener(listener);
}

LmDoublePaneView.prototype.resetMsg = 
function(newMsg) {
	this._msgView.resetMsg(newMsg);
}

LmDoublePaneView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._resetSize(width, height);
}

LmDoublePaneView.prototype.setItem = 
function(item) {
	// overload me
}

// Private / Protected methods

LmDoublePaneView.prototype._initHeader = 
function() {
	// overload me if you want a header
	return this;
}

LmDoublePaneView.prototype._resetSize = 
function(newWidth, newHeight) {
	// overload me
}

LmDoublePaneView.prototype._sashCallback =
function(delta) {
	// overload me
}

LmDoublePaneView.prototype._isMsgViewVisible = 
function() {
	return this._msgView.getVisible();
}
