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

function ZmNavToolBar(parent, posStyle, className, arrowStyle, hasText) {

	className = className || "ZmNavToolBar";
	ZmButtonToolBar.call(this, parent, this._getButtons(arrowStyle, hasText), null, posStyle, className);
	if (hasText)
		this._textButton = this.getButton(ZmOperation.TEXT);
};

ZmNavToolBar.SINGLE_ARROWS	= 1;
ZmNavToolBar.DOUBLE_ARROWS	= 2;
ZmNavToolBar.ALL_ARROWS		= 3;

ZmNavToolBar.prototype = new ZmButtonToolBar;
ZmNavToolBar.prototype.constructor = ZmNavToolBar;

ZmNavToolBar.prototype.toString = 
function() {
	return "ZmNavToolBar";
};

/**
* Enables/disables buttons.
*
* @param ids		a list of button IDs
* @param enabled	whether to enable the buttons
*/
ZmNavToolBar.prototype.enable =
function(ids, enabled) {
	ZmButtonToolBar.prototype.enable.call(this, ids, enabled);

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

ZmNavToolBar.prototype.setToolTip = 
function(buttonId, tooltip) {
	var button = this.getButton(buttonId);
	if (button)
		button.setToolTipContent(tooltip);
};

ZmNavToolBar.prototype.setText =
function(text) {
	if (!this._textButton) return;
	this._textButton.setText(text);
};

ZmNavToolBar.prototype._getButtons = 
function(arrowStyle, hasText) {
	var buttons = new Array();
	this.hasSingleArrows = (arrowStyle == ZmNavToolBar.SINGLE_ARROWS || arrowStyle == ZmNavToolBar.ALL_ARROWS);
	this.hasDoubleArrows = (arrowStyle == ZmNavToolBar.DOUBLE_ARROWS || arrowStyle == ZmNavToolBar.ALL_ARROWS);
	if (this.hasDoubleArrows) buttons.push(ZmOperation.PAGE_DBL_BACK);
	if (this.hasSingleArrows) buttons.push(ZmOperation.PAGE_BACK);
	if (hasText) buttons.push(ZmOperation.TEXT);
	if (this.hasSingleArrows) buttons.push(ZmOperation.PAGE_FORWARD);
	if (this.hasDoubleArrows) buttons.push(ZmOperation.PAGE_DBL_FORW);

	return buttons;
};
