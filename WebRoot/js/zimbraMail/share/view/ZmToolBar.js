function ZmToolBar(parent, className, posStyle) {

	if (arguments.length == 0) return;
	className = className ? className : "ZmToolBar";
	posStyle = posStyle ? posStyle : DwtControl.ABSOLUTE_STYLE;
		
	DwtToolBar.call(this, parent, className, posStyle);
	this._buttons = new Object();
}

ZmToolBar.prototype = new DwtToolBar;
ZmToolBar.prototype.constructor = ZmToolBar;

ZmToolBar.prototype.toString = 
function() {
	return "ZmToolBar";
}

ZmToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	this._buttons[buttonId].addSelectionListener(listener);
}

ZmToolBar.prototype.removeSelectionListener =
function(buttonId, listener) {
	this._buttons[buttonId].removeSelectionListener(listener);
}

ZmToolBar.prototype.getButton =
function(buttonId) {
	return this._buttons[buttonId];
}

ZmToolBar.prototype.setData = 
function(buttonId, key, data) {
	this._buttons[buttonId].setData(key, data);
}

/**
* Enables/disables buttons.
*
* @param ids		a list of button IDs
* @param enabled	whether to enable the buttons
*/
ZmToolBar.prototype.enable =
function(ids, enabled) {
	if (!(ids instanceof Array))
		ids = [ids];
	for (var i = 0; i < ids.length; i++)
		if (this._buttons[ids[i]])
			this._buttons[ids[i]].setEnabled(enabled);
}

ZmToolBar.prototype.enableAll =
function(enabled) {
	for (var i in this._buttons)
		this._buttons[i].setEnabled(enabled);
}

ZmToolBar.prototype._createButton =
function(buttonId, imageInfo, text, disImageInfo, toolTip, enabled, style, align) {
	if (!style)
		style = "TBButton";
	var b = this._buttons[buttonId] = new DwtButton(this, align, style);
	if (imageInfo)
		b.setImage(imageInfo);
	if (text)
		b.setText(text);
	if (toolTip)
		b.setToolTipContent(toolTip);
	if (disImageInfo) 
		b.setDisabledImage(disImageInfo);
	b.setEnabled((enabled) ? true : false);
	b.setData("_buttonId", buttonId);
	return b;
}

ZmToolBar.prototype._createSeparator =
function() {
	new DwtControl(this, "vertSep");
}

ZmToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
}
