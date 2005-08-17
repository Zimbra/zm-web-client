/**
* This toolbar sits above the overview and represents the current app. It has a label
* that tells the user what the current app is, and an optional View button/menu for
* switching views within the current app.
* @class
*/
function ZmCurrentAppToolBar(parent, className, buttons) {

	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE);

	this._currentAppLabel = new DwtLabel(this, DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_LEFT, "currentAppLabel");

	this.addFiller();
	this._viewButton = new DwtButton(this, null, "TBButtonWhite");
	this._viewButton.setText(ZmMsg.view);
	this._viewButton.setToolTipContent(ZmMsg.view);
	this._viewButton.setEnabled(true);
	this._viewButton.setVisible(false);
	this._viewButton.noMenuBar = true;
	
	this._viewIcon = new Object();
	this._viewTooltip = new Object();
	this._viewMenu = new Object();
}

ZmCurrentAppToolBar.prototype = new DwtToolBar;
ZmCurrentAppToolBar.prototype.constructor = ZmCurrentAppToolBar;

ZmCurrentAppToolBar.prototype.toString = 
function() {
	return "ZmCurrentAppToolBar";
}

ZmCurrentAppToolBar.prototype.setCurrentApp = 
function(appName) {
	this._currentAppLabel.setText(ZmMsg[ZmZimbraMail.MSG_KEY[appName]]);
	this._currentAppLabel.setImage(ZmZimbraMail.APP_ICON[appName]);
}

ZmCurrentAppToolBar.prototype.getViewButton = 
function() {
	return this._viewButton;
}

ZmCurrentAppToolBar.prototype.setViewTooltip = 
function(view, tooltip) {
	this._viewTooltip[view] = tooltip;
}

ZmCurrentAppToolBar.prototype.getViewMenu = 
function(view) {
	return this._viewMenu[view];
}

ZmCurrentAppToolBar.prototype.setViewMenu = 
function(view, menu) {
	this._viewMenu[view] = menu;
	this.showViewMenu(view);
}

ZmCurrentAppToolBar.prototype.showViewMenu = 
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

