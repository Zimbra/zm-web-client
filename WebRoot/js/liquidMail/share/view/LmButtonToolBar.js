/**
* Creates a toolbar with the given buttons.
* @constructor
* @class
* This class represents a toolbar that contains just buttons.
* It can be easily created using a set of standard operations, and/or custom buttons
* can be provided. This class is designed for use with items (LmItem), so it can for
* example contain a button with a tab submenu. See also LmActionMenu.
*
* @author Conrad Damon
* @param parent					the containing widget
* @param standardButtons		a list of operation IDs
* @param extraButtons			a list of operation descriptors
* @param posStyle				positioning style
* @param className				CSS class name
*/
function LmButtonToolBar(parent, standardButtons, extraButtons, posStyle, className, buttonClassName) {

	if (arguments.length == 0) return;
	LmToolBar.call(this, parent, className, posStyle);
	
	if (buttonClassName == null) buttonClassName = "TBButton";
	this._buttonStyle = buttonClassName;

	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);

	// standard buttons default to New/Tag/Print/Delete
	if (!standardButtons) {
		standardButtons = [LmOperation.NEW_MENU];
		if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
			standardButtons.push(LmOperation.TAG_MENU);
		if (this._appCtxt.get(LmSetting.PRINT_ENABLED))
			standardButtons.push(LmOperation.PRINT);
		standardButtons.push(LmOperation.DELETE);
	} else if (standardButtons == LmOperation.NONE) {
		standardButtons = null;
	}
	this._buttons = LmOperation.createOperations(this, standardButtons, extraButtons);
}

LmButtonToolBar.prototype = new LmToolBar;
LmButtonToolBar.prototype.constructor = LmButtonToolBar;

// Public methods

LmButtonToolBar.prototype.toString = 
function() {
	return "LmButtonToolBar";
}

/**
* Creates a button and adds its operation ID as data.
*/
LmButtonToolBar.prototype.createOp =
function(buttonId, text, imageInfo, disImageInfo, enabled, toolTip) {
	var b;
	if (buttonId == LmOperation.TEXT)
		b = new DwtText(this);
	else
		b = LmToolBar.prototype._createButton.call(this, buttonId, imageInfo, text, disImageInfo, toolTip, enabled, this._buttonStyle);
	b.setData(LmOperation.KEY_ID, buttonId);
	return b;
}

/**
* Creates a separator. Added because LmToolBar defines _createSeparator().
*/
LmButtonToolBar.prototype.createSeparator =
function() {
	this.addSeparator("vertSep");
}

LmButtonToolBar.prototype.addOp =
function(id) {
	LmOperation.addOperation(this, id, this._buttons);
}

LmButtonToolBar.prototype.removeOp =
function(id) {
	LmOperation.removeOperation(this, id, this._buttons);
}

/**
* Returns the button with the given ID.
*
* @param id		an operation ID
*/
LmButtonToolBar.prototype.getOp =
function(id) {
	return this.getButton(id);
}

/**
* Returns the menu's tag submenu, if any.
*/
LmButtonToolBar.prototype.getTagMenu =
function() {
	var button = this.getButton(LmOperation.TAG_MENU);
	if (button)
		return button.getData(LmOperation.KEY_TAG_MENU);
}

// Private methods

// Returns the ID for the given button.
LmButtonToolBar.prototype._buttonId =
function(button) {
	return button.getData(LmOperation.KEY_ID);
}
