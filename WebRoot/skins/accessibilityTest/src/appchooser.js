(function() {
	skin.classListener('ZmAppChooser', function() {
		ZmAppChooser.prototype.a11yFocusable = true;
		ZmAppChooser.prototype.a11yRole = 'tablist';
		ZmAppChooser.prototype.a11yTitle = ZmMsg.appChooserTitle;
		ZmAppChooser.prototype.singleTabStop = false;
		ZmAppChooser.prototype.a11yFocusesChild = false;
	});

	skin.classListener('ZmAppButton', function() {
		ZmAppButton.prototype.a11yRole = 'tab';
	});

	skin.override.append('ZmAppChooser.prototype.__initCtrl', function() {
		var navctrl = new DwtComposite({parent: this.parent, className: 'A11yNavigationContainer'});
		var navel = navctrl.getHtmlElement();
		A11yUtil.setElementRole(navel, 'navigation');
		navel.setAttribute('aria-label', ZmMsg.appChooserTitle);
		this.reparent(navctrl);
	});

	skin.override.append('ZmAppChooser.prototype._createHtmlFromTemplate', function() {
		var firstchild = this.getHtmlElement().firstChild;
		if (firstchild && firstchild.tagName == 'TABLE') {
			A11yUtil.setElementRole(firstchild, 'presentation');
		}
	});

	/* set selected item */
	skin.override.append('ZmAppChooser.prototype.setSelected', function() {
		var button = this.getButton(this._selectedId);
		var selectedid = button && button.getHTMLElId();
		this.getHtmlElement().setAttribute('aria-activedescendant', selectedid);

		if (!DwtButton.getNoFocus()) {
			appCtxt.getRootTabGroup().setFocusMember(button);
		}
	});

	skin.override.append('ZmAppButton.prototype.setHoverImage', function(imageinfo) {
		// NB: actually implemented in DwtLabel
		if (imageinfo === 'Close' && A11yUtil.isHighContrastMode()) {
			var textnode =
				document.createTextNode(A11yUtil.DINGBATS.BALLOT.CROSSED);
			this._getIconEl().firstChild.appendChild(textnode);
		}
	});

	skin.override("ZmAppChooser.prototype.addButton", function(id, params) {
		var button = arguments.callee.func.apply(this, arguments);
		this.getTabGroupMember().addMember(button, params.index)
		return button;
	});

	skin.override("ZmAppChooser.prototype.removeButton", function(id) {
		var button = this._buttons[id];
		if (button) {
			this.getTabGroupMember().removeMember(button);
		}

		if (!appCtxt.inStartup) {
			A11yUtil.say(AjxMessageFormat.format(ZmMsg.a11yCloseTabMessage, button.getText()), 'assertive');
		}

		return arguments.callee.func.apply(this, arguments);
	});

})();
