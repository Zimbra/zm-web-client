(function() {
	var util = comcast.access.util;

	skin.classListener('DwtToolBar', function() {
		DwtToolBar.prototype.a11yRole = 'toolbar';
		DwtToolBar.prototype.a11yFocusable = true;
		DwtToolBar.prototype.singleTabStop = true;
		DwtToolBar.prototype.a11yFocusesChild = true;
	});

	skin.classListener('ZmButtonToolBar', function() {
		ZmButtonToolBar.prototype.a11yFocusable = true;
	});

	skin.override("DwtToolBar.prototype._getFocusItem", function(index) {
		var item = this.getItem(index);
		if (!item || (item instanceof DwtToolBar))	{ return null; }
		if (item._noFocus)							{ return null; }
		//if (item.getEnabled && !item.getEnabled())	{ return null; } // Let disabled buttons be accessed by arrow keys
		if (item.getVisible && !item.getVisible())	{ return null; }
		return item;
	});

	// ensure that the current item focused receives browser focus
	skin.override.append('DwtToolBar.prototype._focus', function() {
		var focused = this._getFocusItem(this._curFocusIndex);
		if (focused) {
			appCtxt.getKeyboardMgr().grabFocus(focused);
		}
	});

	// Have toolbars return a tabgroup consisting of the contained buttons
	skin.override('DwtToolBar.prototype.getTabGroupMember', function(){
		if (this.singleTabStop) {
			return this;
		} else {
			if (!this._tabGroupMember) {
				this._tabGroupMember = new DwtTabGroup(this.getHTMLElId());
			}
			return this._tabGroupMember;
		}
	});

	// Update the toolbar's tabgroup when adding a new button
	skin.override.append('ZmToolBar.prototype.createButton', function(){
		this.sortChildren();
		//this.getHtmlElement().setAttribute("aria-activedescendant",this._children.get(0).getHTMLElId());
	});

	skin.override('ZmButtonToolBar.prototype.createOp', function(id) {
		var button = arguments.callee.func.apply(this, arguments);
		var elem = button.getHtmlElement();

		if (id == ZmOperation.TAG_MENU) {
			elem.setAttribute('aria-label', ZmMsg.tag);
		}

		return button;
	});

	skin.override.append("DwtToolBar.prototype._createItemElement", function() {
		AjxStringUtil.calcDIV().innerHTML = "";
	});

	skin.override.append("ZmButtonToolBar.prototype.addChild", function(child, index){
		if (!this.singleTabStop) {
			var tg = this.getTabGroupMember();
			if (util.isInstance(child, "DwtToolBarButton") && !tg.contains(child.getTabGroupMember())) {
				tg.addMember(child.getTabGroupMember(), this._children.indexOf(child));
			}
		}
		var cell = child.getHtmlElement().parentNode;
		if (cell.nodeName === "TD") {
			cell.setAttribute("role","presentation");
		}
	});

	skin.override("DwtToolBar.prototype.addArrowBorderListener", function(listener) {
		if (listener instanceof AjxListener) {
			if (!this._arrowBorderListeners) {
				this._arrowBorderListeners = [];
			}
			this._arrowBorderListeners.push(listener);
		}
	});

	skin.override("DwtToolBar.prototype.notifyArrowBorder", function(actionCode) {
		if (this._arrowBorderListeners) {
			skin.run(this._arrowBorderListeners, actionCode);
		}
	});

	skin.override("DwtToolBar.prototype.getFirst", function(checkEnabled) {
		var item = null;
		for (var index = 0; !item && index < this.getItemCount(); index++) {
			item = this._getFocusItem(index);
		}
		return item;
	});

	skin.override("DwtToolBar.prototype.getLast", function(checkEnabled) {
		var item = null;
		for (var index = this.getItemCount() - 1; !item && index >= 0; index--) {
			item = this._getFocusItem(index);
		}
		return item;
	});

	skin.override("DwtToolBar.prototype.handleKeyAction", function(actionCode, ev) {

		var item = this.getItem(this._curFocusIndex);
		var numItems = this.getItemCount();
		if (numItems < 2) {
			return true;
		}

		switch (actionCode) {

			case DwtKeyMap.PREV:
				var prevFocusIndex = this._curFocusIndex;
				if (this._curFocusIndex > 0) {
					this._moveFocus(true);
				}
				if (prevFocusIndex === this._curFocusIndex) {
					this.notifyArrowBorder(actionCode);
				}
				break;

			case DwtKeyMap.NEXT:
				var prevFocusIndex = this._curFocusIndex;
				if (this._curFocusIndex < (numItems - 1)) {
					this._moveFocus();
				}
				if (prevFocusIndex === this._curFocusIndex) {
					this.notifyArrowBorder(actionCode);
				}
				break;

			default:
				// pass everything else to currently focused item
				if (item) {
					return item.handleKeyAction(actionCode, ev);
				}
		}
		return true;
	});

	skin.override.append("DwtToolBarButton.prototype._focus", function(){
		var tb = this.parent;
		tb._curFocusIndex = tb._children.indexOf(this);
	//	tb.getHtmlElement().setAttribute("aria-activedescendant",this.getHTMLElId());
	});

	skin.override("ZmMailListController.prototype._initializeToolBar", function(view, className) {
		var created = !this._toolbar[view];
		arguments.callee.func.apply(this,arguments);

		if (created && this._navToolBar[view]) {
			var toolbar = this._toolbar[view],
				navtoolbar = this._navToolBar[view];
			toolbar.addArrowBorderListener(new AjxListener(function(actionCode){
				if (actionCode === DwtKeyMap.NEXT) {
					var item = navtoolbar.getFirst(true);
					if (item) {
						navtoolbar._focus(item);
					}
				}
			}));
			navtoolbar.addArrowBorderListener(new AjxListener(function(actionCode){
				if (actionCode === DwtKeyMap.PREV) {
					var item = toolbar.getLast(true);
					if (item) {
						toolbar._focus(item);
					}
				}
			}));
		}
	});

})();
