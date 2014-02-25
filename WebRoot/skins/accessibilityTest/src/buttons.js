(function(){
	var util = comcast.access.util;

	skin.classListener('DwtButton', function() {
		DwtButton.prototype.a11yRole = 'button';
		DwtButton.prototype.a11yFocusable = true;
		DwtButton._noFocus = {};
	});

	// Let methods that create tabs have the option of muting the announcement
	skin.override('DwtButton.setNoFocus', function() {
		var id = Dwt.getNextId();
		this._noFocus[id] = true;
		return id;
	});
	skin.override('DwtButton.clearNoFocus', function(id) {
		delete this._noFocus[id];
	});
	skin.override('DwtButton.getNoFocus', function() {
		return !!AjxUtil.keys(this._noFocus).length;
	});

	skin.override.append('DwtButton.prototype.setMenu', function() {
		this.setHasActionMenu(!!this._menu);
		if (util.isHighContrastMode() && this._dropDownEl) {
			var textnode = document.createTextNode(util.DINGBATS.TRIANGLE.DOWN);
			Dwt.removeChildren(this._dropDownEl);
			this._dropDownEl.appendChild(textnode);
		}
	});

	skin.override("DwtButton.prototype.setHasActionMenu", function(hasMenu){
		this.__hasMenu = (hasMenu !== false);
		this.updateAriaLabeling();
	});

	skin.override.append("DwtButton.prototype.__initCtrl", function() {
		this._setEventHdlrs([DwtEvent.ONCLICK]);
		// Announce button when it's pressed (DE2965)
		this._sayListener = new AjxListener(this, function(){
			util.say(this.getText(), util.SAY_ASSERTIVELY);
		});
		this.addSelectionListener(this._sayListener);
	});

	skin.override("DwtButton.prototype._handleClick", function(ev) {
		var listeners = this._eventMgr && this._eventMgr._listeners[DwtEvent.SELECTION];
		// If the sayListener is the ONLY selection listener present, ignore it
		if (this.isListenerRegistered(DwtEvent.SELECTION) && !(listeners.size() === 1 && listeners.get(0) === this._sayListener)) {
			var now = (new Date()).getTime();
			if (!this._lastNotify || (now - this._lastNotify > DwtButton.NOTIFY_WINDOW)) {
				var selEv = DwtShell.selectionEvent;
				DwtUiEvent.copy(selEv, ev);
				selEv.item = this;
				selEv.detail = (typeof this.__detail == "undefined") ? 0 : this.__detail;
				this.notifyListeners(DwtEvent.SELECTION, selEv);
				this._lastNotify = now;
				this.shell.notifyGlobalSelection(selEv);
			}
		} else if (this._menu) {
			if(this._menu.isDwtMenu && !this.isListenerRegistered(DwtEvent.SELECTION)) {
				this._menu.setAssociatedObj(this);	
			}
			this._toggleMenu();
		}
	});


	skin.override.append('DwtButton.prototype.__doFocus', function() {
		if (this.parent instanceof DwtToolBar) {
			var toolbar = this.parent;
			toolbar._curFocusIndex = AjxUtil.indexOf(toolbar.getChildren(), this);
			appCtxt.getRootTabGroup().setFocusMember(toolbar, true, true);
		}
	});


	skin.override('DwtButton.prototype.setText', function(text) {
		// always show text in high contrast mode
		if (this.whatToShow && util.isHighContrastMode()) {
			this.whatToShow.showText = true;
		}

		var r = arguments.callee.func.apply(this, arguments);
		// some of our velodrome modifications occasionally hide the
		// button text, but stash it in an attribute
		if (!text && this._toggleText) {
			this.setAriaLabel(this._toggleText + " " + (this._shortcutText || ""));
		}
		return r;
	});

	skin.override("DwtButton.prototype.setShortcut", function(shortcutText){
		this._shortcutText = shortcutText;
		this.updateAriaLabeling();
	});

	skin.override.append('ZmColorButton.prototype.setText', function(text) {
		this.setAriaLabel(ZmMsg.colorLabel+" "+text);
	});

})();
