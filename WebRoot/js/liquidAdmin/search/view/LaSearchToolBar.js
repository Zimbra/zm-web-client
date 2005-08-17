function LaSearchToolBar(parent, posStyle) {

	LaToolBar.call(this, parent, null, posStyle, "SearchToolBar");

	this._searchField = new LaSearchField(this, "SearchTBSearchField", 48);
	var h1 = this._searchField.getSize().y;
		
	this._createSeparator();
	
	this._createSeparator();
	
	this.setSize(DwtControl.DEFAULT, Math.max(this._searchField.getSize().y, this.computeHeight()));
}

LaSearchToolBar.prototype = new LaToolBar;
LaSearchToolBar.prototype.constructor = LaSearchToolBar;

LaSearchToolBar.prototype.toString = 
function() {
	return "LaSearchToolBar";
}

LaSearchToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	// Don't allow listeners on the search by button since we only want listeners registered
	// on its menu items
	if (buttonId != LaSearchToolBar.SEARCHFOR_BUTTON)
		LaToolBar.prototype.addSelectionListener.call(this, buttonId, listener);
}


LaSearchToolBar.prototype.getSearchField =
function() {
	return this._searchField;
}
