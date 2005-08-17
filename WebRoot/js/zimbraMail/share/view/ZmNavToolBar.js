/**
* Navigation toolbar for the client. This toolbar is affected by every 
* push/pop of a view and must be context sensitive since it can custom apply 
* to any view. A new class was created since nav toolbar may be expanded in 
* the future (i.e. to incl. a text input indicating current page, etc)
*
* @param parent			parent DwtControl for this toolbar
* @param posStyle		CSS style position (absolute, static, relative)
* @param className 		CSS class name this toolbar should respect
* @param arrowStyle		single arrows, double arrows, or both
* @param hasText		true if this toolbar includes text in the middle
*/

function LmNavToolBar(parent, posStyle, className, arrowStyle, hasText) {

	className = className || "LmNavToolBar";
	LmButtonToolBar.call(this, parent, this._getButtons(arrowStyle, hasText), null, posStyle, className);
	if (hasText)
		this._textButton = this.getButton(LmOperation.TEXT);
};

LmNavToolBar.SINGLE_ARROWS	= 1;
LmNavToolBar.DOUBLE_ARROWS	= 2;
LmNavToolBar.ALL_ARROWS		= 3;

LmNavToolBar.prototype = new LmButtonToolBar;
LmNavToolBar.prototype.constructor = LmNavToolBar;

LmNavToolBar.prototype.toString = 
function() {
	return "LmNavToolBar";
};

/**
* Enables/disables buttons.
*
* @param ids		a list of button IDs
* @param enabled	whether to enable the buttons
*/
LmNavToolBar.prototype.enable =
function(ids, enabled) {
	LmButtonToolBar.prototype.enable.call(this, ids, enabled);

	// 	also kill the tooltips if buttons are disabled
	if (!enabled) {
		if (!(ids instanceof Array))
			ids = [ids];
		for (var i = 0; i < ids.length; i++) {
			var button = this.getButton(ids[i]);
			button.setToolTipContent(null);
		}
	}
};

LmNavToolBar.prototype.setToolTip = 
function(buttonId, tooltip) {
	var button = this.getButton(buttonId);
	if (button)
		button.setToolTipContent(tooltip);
};

LmNavToolBar.prototype.setText =
function(text) {
	if (!this._textButton) return;
	this._textButton.setText(text);
};

LmNavToolBar.prototype._getButtons = 
function(arrowStyle, hasText) {
	var buttons = new Array();
	this.hasSingleArrows = (arrowStyle == LmNavToolBar.SINGLE_ARROWS || arrowStyle == LmNavToolBar.ALL_ARROWS);
	this.hasDoubleArrows = (arrowStyle == LmNavToolBar.DOUBLE_ARROWS || arrowStyle == LmNavToolBar.ALL_ARROWS);
	if (this.hasDoubleArrows) buttons.push(LmOperation.PAGE_DBL_BACK);
	if (this.hasSingleArrows) buttons.push(LmOperation.PAGE_BACK);
	if (hasText) buttons.push(LmOperation.TEXT);
	if (this.hasSingleArrows) buttons.push(LmOperation.PAGE_FORWARD);
	if (this.hasDoubleArrows) buttons.push(LmOperation.PAGE_DBL_FORW);

	return buttons;
};
