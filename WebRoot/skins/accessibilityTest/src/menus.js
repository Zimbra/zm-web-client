(function() {
	skin.classListener('DwtMenu', function(){
		DwtMenu.prototype.a11yRole = 'menu';
	});
	skin.classListener('DwtMenuItem', function(){
		DwtMenuItem.prototype.a11yRole = null; // Can't be "button"; then JAWS will intercept keys for its own inane reasons
		DwtMenuItem.prototype.a11yFocusable = true;
	});

	skin.override("DwtMenuItem._mouseOverListener", function(ev) {
		var menuItem = ev.dwtObj;
		if (!menuItem) { return false; }
		var menu = menuItem.parent;
		if (menu._hoveredItem) {
			var mouseEv = new DwtMouseEvent();
			mouseEv.dwtObj = menu._hoveredItem;
			DwtButton._mouseOutListener(mouseEv);
		}
		if (menuItem.isSeparator()) { return false; }
		DwtButton._mouseOverListener(ev, menuItem);
		menu._hoveredItem = menuItem;
		menu._popdownSubmenus(menuItem);
		if (menuItem._menu && !ev.ersatz) {
			menuItem._popupMenu(menuItem._hoverDelay);
		}

		var menuItem = ev.dwtObj;
		if (A11yUtil.isVisible(menuItem)) {
			DwtKeyboardMgr.__shell.getKeyboardMgr().grabFocus(menuItem);
		}
	}, function(){
		DwtMenuItem._listeners[DwtEvent.ONMOUSEOVER] = DwtMenuItem._listeners[DwtEvent.ONMOUSEENTER] = DwtMenuItem._mouseOverListener;
	});

	skin.override("DwtMenu.prototype._popdownSubmenus", function(except) {
		var sz = this._children.size();
		var a = this._children.getArray();
		for (var i = 0; i < sz; i++) {
			if (a[i]._popdownMenu && a[i]!==except) a[i]._popdownMenu();
		}
	});

	skin.override('DwtMenu.prototype.popup', function() {
		A11yUtil.say(ZmMsg.a11yMenuOpenMessage, A11yUtil.SAY_ASSERTIVELY);

		if (this._table) {
			A11yUtil.setElementRole(this._table, 'presentation');
		}

		if (!this.__createdTabGroup) {
			var tg = this._tabGroup,
				items = this.getItems();
			tg.removeMember(this);
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				if (! (A11yUtil.isInstance(item, "DwtLabel") && item.isStyle(DwtMenuItem.SEPARATOR_STYLE)) ) {
					tg.addMember(item.getTabGroupMember());
				}
			}
			this.__createdTabGroup = true;
		}

		var r = arguments.callee.func.apply(this, arguments);


		var self = this,
			item = this.__currentItem;

		setTimeout(function(){
			self.setSelectedItem(0);
			if (item) {
				appCtxt.getKeyboardMgr().grabFocus(item);
			}
		},0);

		// Set displaystate of parent buttons
		if (this.parentButton) {
			var button = this.parentButton;				
			while (button instanceof DwtMenuItem) {
				button.setDisplayState(DwtControl.HOVER);
				var menu = button.parent;
				button = menu.parentButton;
			}
		}
		return r;
	});

	skin.override.append("DwtMenu.prototype._doPopup", function(){
		var parentMenu = this.parentButton && this.parentButton.parent;
		if (parentMenu instanceof DwtMenu) {
			this.setZIndex(parentMenu.getZIndex()+1);
		}
	});

	skin.override.append('DwtMenuItem.prototype._createHtml', function() {
		if (this._className && this._className.indexOf('ZMenuItemSeparator')!==-1) {
			this.a11yRole = 'separator';
		} else if (this.isStyle(DwtMenuItem.RADIO_STYLE)) {
			//this.a11yRole = 'menuitemradio'; // NVDA jumps out of application mode and reads through the DOM when it encounters one of these
			this.a11yRole = 'menuitem';
			this.getHtmlElement().setAttribute('aria-checked', false);
		} else if (this.isStyle(DwtMenuItem.CHECK_STYLE)) {
			//this.a11yRole = 'menuitemcheckbox';
			this.a11yRole = 'menuitem';
			this.getHtmlElement().setAttribute('aria-checked', false);
		} else {
			this.a11yRole = 'menuitem';
		}
		this.setRole(this.a11yRole);
	});

	skin.override('DwtMenu.prototype.setSelectedItem', function(next) {
		// Pop down the menu if we pressed arrow up while on the topmost menu item, and we are not a submenu.
		var index = this._children.indexOf(this.__currentItem);
		var hasPriorEnabledItems;
		if (index >= 0) {
			for (var i=0; i<index; i++) {
				if (this._children.get(i).getEnabled()) {
					hasPriorEnabledItems = true;
					break;
				}
			}
		}
		if (next === false && !hasPriorEnabledItems) {
			var parentButton = this.parentButton || this.parent;
			if (!A11yUtil.isInstance(parentButton, "DwtMenuItem")) {
				this.popdown();
				if (A11yUtil.isInstance(parentButton, "DwtButton")) {
					appCtxt.getKeyboardMgr().grabFocus(parentButton);
					var tgMember = parentButton && (A11yUtil.isInstance(parentButton, "DwtToolBarButton") ? (parentButton.parent || parentButton) : parentButton);
					if (tgMember && appCtxt.getRootTabGroup().contains(tgMember)) {
						appCtxt.getRootTabGroup().setFocusMember(tgMember);
					}
				}
			}
		} else {
			var id = DwtButton.setNoFocus();
			arguments.callee.func.apply(this,arguments);
			DwtButton.clearNoFocus(id);
			this._tabGroup.setFocusMember(this.__currentItem);
		}
	});

	skin.override.append("DwtMenuItem.prototype.__doFocus", function(){
		// Update the UI to show hover effect
		// We can't call setSelectedItem here, because then we'd get into a loop when focusing from there.
		var currItem = this;
		var menu = this.parent;
		var mev = new DwtMouseEvent();
		if (menu.__currentItem) {
			menu._setMouseEvent(mev, {dwtObj:menu.__currentItem});
			menu.__currentItem.notifyListeners(AjxEnv.isIE ? DwtEvent.ONMOUSELEAVE : DwtEvent.ONMOUSEOUT, mev);
		}
		menu._setMouseEvent(mev, {dwtObj:currItem});
		currItem.notifyListeners(AjxEnv.isIE ? DwtEvent.ONMOUSEENTER : DwtEvent.ONMOUSEOVER, mev);	// mouseover selects a menu item
		menu.__currentItem = currItem;
		menu.scrollToItem(currItem, true);
	});

	// Refer keys in menuitems to the menu, not button keymap
	skin.override("DwtMenuItem.prototype.getKeyMapName", function(){
		return DwtKeyMap.MAP_MENU;
	});
	skin.override("DwtMenuItem.prototype.handleKeyAction", function(actionCode, ev){
		return this.parent ? this.parent.handleKeyAction(actionCode, ev) : arguments.callee.func.call(this, actionCode, ev);
	});

	skin.override("DwtMenu.prototype.handleKeyAction", function(actionCode, ev) {
		var r = arguments.callee.func.apply(this,arguments);
		if (actionCode === DwtKeyMap.PARENTMENU && this.parentButton instanceof DwtMenuItem) {
			this.popdown(0);
			r = true;
		}
		return r;
	});

	skin.override.append('DwtMenuItem.prototype.setChecked', function(checked) {
		this.getHtmlElement().setAttribute('aria-checked', checked);

		if (this._checkEl) {
			var widget = '';

			if (checked) {
				if (this.isStyle(DwtMenuItem.RADIO_STYLE)) {
					widget = A11yUtil.DINGBATS.BLACK_CIRCLE;
				} else if (this.isStyle(DwtMenuItem.CHECK_STYLE)) {
					widget = A11yUtil.DINGBATS.CHECKMARK;
				}
			}

			A11yUtil.setFallbackText(this._checkEl, widget, '');
		}
	});

	skin.override("DwtMenuItem.prototype._popupMenu", function(delay, kbGenerated) {
		var menu = this.getMenu();
		var pp = this.parent.parent;
		var pb = this.getBounds();
		var ws = menu.shell.getSize();
		var s = menu.getSize();
		var x;
		var y;
		var vBorder;
		var hBorder;
		var ppHtmlElement = pp.getHtmlElement();
		if (pp._style == DwtMenu.BAR_STYLE) {
			vBorder = (ppHtmlElement.style.borderLeftWidth == "") ? 0 : parseInt(ppHtmlElement.style.borderLeftWidth);
			x = pb.x + vBorder;
			hBorder = (ppHtmlElement.style.borderTopWidth == "") ? 0 : parseInt(ppHtmlElement.style.borderTopWidth);
			hBorder += (ppHtmlElement.style.borderBottomWidth == "") ? 0 : parseInt(ppHtmlElement.style.borderBottonWidth);
			y = pb.y + pb.height + hBorder;		
			x = ((x + s.x) >= ws.x) ? x - (x + s.x - ws.x): x;
		}
		else { // Drop Down
			vBorder = (ppHtmlElement.style.borderLeftWidth == "") ? 0 : parseInt(ppHtmlElement.style.borderLeftWidth);
			vBorder += (ppHtmlElement.style.borderRightWidth == "") ? 0 : parseInt(ppHtmlElement.style.borderRightWidth);
			x = pb.x + pb.width + vBorder;
			hBorder = (ppHtmlElement.style.borderTopWidth == "") ? 0 : parseInt(ppHtmlElement.style.borderTopWidth);
			y = pb.y + hBorder;

			if (pp._openRight || (x + s.x) >= ws.x) {
				x = pb.x - s.x - vBorder;
			}
		}
		menu.parentButton = this;
	
		menu.popup(delay, x, y, kbGenerated);
	});
})();
