/**
* This toolbar sits above the overview and represents the current app. It has a label
* that tells the user what the current app is, and an optional View button/menu for
* switching views within the current app.
* @class
*/
function LmCurrentAppToolBar(parent, className, buttons) {

	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE);

	this._currentAppLabel = new DwtLabel(this, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "currentAppLabel");

	this.addFiller();
	this._viewButton = new DwtButton(this, null, "TBButtonWhite");
	this._viewButton.setText(LmMsg.view);
	this._viewButton.setToolTipContent(LmMsg.view);
	this._viewButton.setEnabled(true);
	this._viewButton.setVisible(false);
	this._viewButton.noMenuBar = true;
	
	this._viewIcon = new Object();
	this._viewTooltip = new Object();
	this._viewMenu = new Object();
}

LmCurrentAppToolBar.prototype = new DwtToolBar;
LmCurrentAppToolBar.prototype.constructor = LmCurrentAppToolBar;

LmCurrentAppToolBar.prototype.toString = 
function() {
	return "LmCurrentAppToolBar";
}

LmCurrentAppToolBar.prototype.setCurrentApp = 
function(appName) {
	this._currentAppLabel.setText(LmMsg[LmLiquidMail.MSG_KEY[appName]]);
	this._currentAppLabel.setImage(LmLiquidMail.APP_ICON[appName]);
}

LmCurrentAppToolBar.prototype.getViewButton = 
function() {
	return this._viewButton;
}

LmCurrentAppToolBar.prototype.setViewTooltip = 
function(view, tooltip) {
	this._viewTooltip[view] = tooltip;
}

LmCurrentAppToolBar.prototype.getViewMenu = 
function(view) {
	return this._viewMenu[view];
}

LmCurrentAppToolBar.prototype.setViewMenu = 
function(view, menu) {
	this._viewMenu[view] = menu;
	this.showViewMenu(view);
}

LmCurrentAppToolBar.prototype.showViewMenu = 
function(view) {
	var viewMenu = this._viewMenu[view];
	if (viewMenu) {
		this._viewButton.setVisible(true);
		this._viewButton.setToolTipContent(this._viewTooltip[view]);
		this._viewButton.setMenu(viewMenu, false, DwtMenuItem.RADIO_STYLE);
		var mi = viewMenu.getSelectedItem(DwtMenuItem.RADIO_STYLE);
		var icon = mi ? mi.getImage() : null;
		if (icon)
			this._viewButton.setImage(icon);
	} else {
		this._viewButton.setVisible(false);
	}
}

