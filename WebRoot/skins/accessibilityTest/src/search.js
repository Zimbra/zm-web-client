(function(){
	// Fix up tabgroup for search toolbar; the previous setup just didn't work
	// because DwtInputField._focusHdlr set itself as focused member while the inner
	// field was the real tabgroupmember
	skin.override.append("ZmSearchController.prototype._setView", function(){
		this._tabGroup.replaceMember(this._searchToolBar.getSearchField(), this._searchToolBar._searchField.getTabGroupMember());
	});

	skin.override.append("ZmMainSearchToolBar.prototype._createHtml", function(){
		if (this._searchField) {
			A11yUtil.setLabel(this._searchField.getInputElement(), ZmMsg.searchQuery || "Search query");
			this._searchField._validationStyle = DwtInputField.MANUAL_VALIDATION;
		}
		this._button[ZmSearchToolBar.TYPES_BUTTON].a11yLabelPrefix = "Search in: ";
	});

	skin.override.append("ZmSearchToolBar.prototype.initAutocomplete", function() {
		this._acList.setClearInputOnUpdate(false);
	});

})();
