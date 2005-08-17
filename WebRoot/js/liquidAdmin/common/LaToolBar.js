/**
* @class LaToolBar
* @contructor
* generic class that serves the purpose of creating any toolbar in the admin UI
* @param parent parent object
* @param opList array of LaOperation objects
**/
function LaToolBar(parent, opList, posStyle, className) {
	if (arguments.length == 0) return;
	className = className || "LaToolBar";
	posStyle = posStyle || DwtControl.ABSOLUTE_STYLE;

	DwtToolBar.call(this, parent, className, posStyle);
	this._buttons = new Object();
		
	if(opList) {
		var cnt = opList.length;
		for(var ix=0; ix < cnt; ix++) {
			this._createButton(opList[ix].id, opList[ix].imageId, opList[ix].caption, opList[ix].disImageId, opList[ix].tt, true);
			this._createSeparator();
			this.addSelectionListener(opList[ix].id, opList[ix].listener);		
		}
	}
}

LaToolBar.VIEW_DATA = "LaToolBar.VIEW";

LaToolBar.prototype = new DwtToolBar;
LaToolBar.prototype.constructor = LaToolBar;

LaToolBar.prototype.toString = 
function() {
	return "LaToolBar";
}

LaToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	this._buttons[buttonId].addSelectionListener(listener);
}

LaToolBar.prototype.removeSelectionListener =
function(buttonId, listener) {
	this._buttons[buttonId].removeSelectionListener(listener);
}

LaToolBar.prototype.getButton =
function(buttonId) {
	return this._buttons[buttonId];
}

LaToolBar.prototype.setData = 
function(buttonId, key, data) {
	this._buttons[buttonId].setData(key, data);
}

/**
* Enables/disables buttons.
*
* @param ids		a list of button IDs
* @param enabled	whether to enable the buttons
*/
LaToolBar.prototype.enable =
function(ids, enabled) {
	if (!(ids instanceof Array))
		ids = [ids];
	for (var i = 0; i < ids.length; i++)
		if (this._buttons[ids[i]])
			this._buttons[ids[i]].setEnabled(enabled);
}

LaToolBar.prototype.enableAll =
function(enabled) {
	for (var i in this._buttons)
		this._buttons[i].setEnabled(enabled);
}

LaToolBar.prototype.computeHeight =
function(enabled) {
	var h = 0;
	for (var i in this._buttons)
		h = Math.max(h, this._buttons[i].getSize().y);
	return h;
}

LaToolBar.prototype._createButton =
function(buttonId, imageId, text, disImageId, toolTip, enabled, style, align) {
	if (!style)
		style = "TBButton"
	var b = this._buttons[buttonId] = new DwtButton(this, align, style);
	if (imageId)
		b.setImage(imageId);
	if (text)
		b.setText(text);
	if (toolTip)
		b.setToolTipContent(toolTip);
	if (disImageId) 
		b.setDisabledImage(disImageId);
	b.setEnabled((enabled) ? true : false);
	b.setData("_buttonId", buttonId);
	return b;
}

LaToolBar.prototype._createSeparator =
function() {
	new DwtControl(this, "vertSep");
}

LaToolBar.prototype._buttonId =
function(button) {
	return button.getData("_buttonId");
}
