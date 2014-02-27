(function() {
	skin.classListener('DwtTree', function () {
		DwtTree.prototype.a11yRole = 'tree';
		DwtTree.prototype.a11yFocusable = false;
		DwtTree.prototype.a11yTitle = "Tree";
	});

	skin.classListener('DwtTreeItem', function () {
		DwtTreeItem.prototype.a11yRole = 'treeitem';
		DwtTreeItem.prototype.a11yFocusable = true;
	});

	// Add ARIA attributes
	skin.override("DwtTreeItem.prototype._initialize", function(index, realizeDeferred, forceNode) {
		var r = arguments.callee.func.apply(this, arguments);

		var htmlel = this.getHtmlElement();

		var parentlevel = this.parent._a11yHeaderLevel || 0;
		this._a11yHeaderLevel = parentlevel + 1;

		htmlel.setAttribute('aria-level', this._a11yHeaderLevel);

		if (this instanceof DwtHeaderTreeItem) {
			var parentel = this._tree.getHtmlElement();

			if (this._optButton) {
				//this.setHasActionMenu();
			}

			// DE3285: We must label the tree root, or IE will let screen readers read THE ENTIRE TREE when it gets focus.
			var treeEl = this._tree.getHtmlElement();
			if (treeEl.getAttribute("aria-labelledby") != null) {
				treeEl.setAttribute("aria-labelledby", this._textCell.id);
				treeEl.removeAttribute("aria-label");
			}

		} else {
			if (this._contextEnabled) {
				//this.setHasActionMenu();
			}
		}
		if (this._textCell) {
			htmlel.setAttribute('aria-labelledby', this._textCell.id);
		}

		return r;
	});

	/* NB: the execution time of this function is proportional to the
	 * amount of children a tree (item) has; hence, wrapping it around
	 * e.g. _addItem makes adding N children O(N^2) :( */
	skin.override.append(["DwtTreeItem.prototype._setChildElOrder",
					"DwtTreeItem.prototype._addItem",
					"DwtTreeItem.prototype.removeChild",
					"DwtTree.prototype._addItem",
					"DwtTree.prototype.removeChild"], function() {
		var childcount = this._children.size();

		this._children.foreach(function(item, i) {
			var el = item.getHtmlElement();

			if (el) {
				el.setAttribute('aria-posinset', i);
				el.setAttribute('aria-setsize', childcount);
			}
		});
	});


	// Add ARIA attributes
	skin.override("DwtTreeItem.prototype._addItem", function(item, index, realizeDeferred) {
		arguments.callee.func.apply(this, arguments);

        if (!this._childDiv.role) {
			A11yUtil.setElementRole(this._childDiv, "group");
			this._childDiv.setAttribute("aria-labelledby", A11yUtil.getElementID(this._itemDiv));

			var thisEl = this.getHtmlElement();
			thisEl.parentNode.insertBefore(this._childDiv, thisEl.nextSibling);
			thisEl.setAttribute("aria-owns", A11yUtil.getElementID(this._childDiv));
			}

	});

	// add ARIA attributes
	skin.override.append("DwtTreeItem.prototype._setSelected", function() {
		this.getHtmlElement().setAttribute('aria-selected', this._selected);

		var myid = this.getHTMLElId();

		if (this._selected) {
			window.console && console.log('selecting %s', myid);
			if (!AjxEnv.isIE) { // Screenreaders in IE announce items twice if we do the below, which is not strictly necessary.
				this._tree.getHtmlElement().setAttribute('aria-activedescendant', myid);
			}
		} else {
			window.console && console.log('deselecting %s', myid);
			if (!AjxEnv.isIE) {
				this._tree.getHtmlElement().removeAttribute('aria-activedescendant');
			}
		}
	});

	skin.override.append('DwtTreeItem.prototype._expand', function(expand) {
		this.getHtmlElement().setAttribute('aria-expanded', expand);
	});

	// Let headers be selectable se we can navigate to them by keyboard
	skin.override("DwtHeaderTreeItem.prototype._initialize", function(){
		var keys = ["_origClassName", "_textClassName", "_selectedClassName", "_selectedFocusedClassName", "_actionedClassName", "_dragOverClassName"];
		for (var i=0; i<keys.length; i++) {
			this[keys[i]] += " a11yTransparent";
		}
		arguments.callee.func.apply(this, arguments);
		this._selectionEnabled = true;
	});

	skin.override("DwtTreeItem.prototype.handleKeyEvent", function(ev) {
		var keyCode = ev.charCode || ev.keyCode;

		if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) {
			var character = String.fromCharCode(keyCode).toLowerCase();
			var currentTree = this._tree;
			var itemList = [];
			var currentItemIndex = 0;
			var hasFoundSelected = false;

			if (currentTree._overview) {
				var overview = currentTree._overview;
				for (var i = 0; i < overview._treeIds.length; i++) {
					var tree = overview._treeHash[overview._treeIds[i]],
						items = tree.getTreeItemList(true);
					itemList = itemList.concat(items);
					if (tree == currentTree) {
						var sel = tree.getSelection();
						var curItem = (sel && sel.length) ? sel[0] : null;
						if (curItem) {
							currentItemIndex += AjxUtil.indexOf(items, curItem);
						}
						hasFoundSelected = true;
					} else if (!hasFoundSelected) {
						currentItemIndex += items.length;
					}
				}
			}
			var nextItemIndex = currentItemIndex+1;
			if (nextItemIndex >= itemList.length) nextItemIndex = 0;
				
			var wrappedList = itemList.slice(nextItemIndex).concat(itemList.slice(0,nextItemIndex));
			
			for (var i=0; i<wrappedList.length; i++) {
				var item = wrappedList[i],
					text = item.getText().replace(/<(?:.|\n)*?>/gm, '');
				if (text && text.toLowerCase()[0] === character) {
					item._tree.setSelection(item, false, true);
					break;
				}
			}
			return true;
		}


		var mapName = (this && this.getKeyMapName) ? this.getKeyMapName() : null;
		if (!mapName) {
			return false;
		}
		var keyBoardMgr = DwtKeyboardMgr.__shell.getKeyboardMgr();
		var keyMapMgr = appCtxt.getAppController().getKeyMapMgr();
		var actionCode = keyMapMgr.getActionCode(keyBoardMgr.__keySequence, mapName, false);
		if (actionCode && actionCode != DwtKeyMapMgr.NOT_A_TERMINAL) {
			return this.handleKeyAction(actionCode, ev);
		}
		return false;
	});

	skin.override("DwtTreeItem.prototype.handleKeyAction", function(actionCode, ev) {
		switch (actionCode) {
			case DwtKeyMap.SELECT_FIRST: {
				var ti = this._tree._getFirstLastTreeItem(false);
				if (ti) {
					// Select the first visible item in the overview
					ti._tree.setSelection(ti, false, true);
				}
				break;
			}
			case DwtKeyMap.SELECT_LAST: {
				var ti = this._tree._getFirstLastTreeItem(true);
				if (ti) {
					// Select the last visible item in the overview
					ti._tree.setSelection(ti, false, true);
				}
				break;
			}
			case DwtKeyMap.EXPAND: {
				if (!this._expanded) {
					this.setExpanded(true, false, true);
				} else if (this._children.size()>0) {
					// Select first child node
					var firstChild = this._children.get(0);
					this._tree.setSelection(firstChild, false, true);
				}
				break;
			}
			case DwtKeyMap.COLLAPSE: {
				if (this._expanded) {
					this.setExpanded(false, false, true);
				} else if (this.parent instanceof DwtTreeItem) {
					// select parent
					this._tree.setSelection(this.parent, false, true);
				}
				break;
			}
			case DwtKeyMap.DELETE: {
				var item = this.getData(Dwt.KEY_OBJECT),
					type = this.getData(ZmTreeView.KEY_TYPE);
				if (A11yUtil.isInstance(item,"ZmOrganizer")) {
					var controller = this._tree.parent._controller.getTreeController(type); // ZmTreeController
					controller._deleteListener({item:this});
				}
				break;
			}
			default:
				return arguments.callee.func.apply(this, arguments);
		}
		return true;
	});

	// Create new methods to obtain the first and last items in the overview.
	// Works like the _getNextTreeItem methods of the same classes, we usually call 
	// the ZmTreeView method to obtain the first or last item in the overview.
	skin.override("ZmOverview.prototype._getFirstLastTreeItem", function(last) {
		var item = null;
		var idx = last ? (this._treeIds.length-1) : 0;
		var tree = this._treeHash[this._treeIds[idx]];
		while (tree) {
			item = DwtTree.prototype._getFirstLastTreeItem.call(tree, last);
			if (item) {
				break;
			}
			idx += last ? -1 : 1;
			tree = this._treeHash[this._treeIds[idx]];
		}

		return item;
	});
	skin.override("ZmTreeView.prototype._getFirstLastTreeItem", function(last) {
		return (this._overview && this._overview._getFirstLastTreeItem(last)) || DwtTree.prototype._getFirstLastTreeItem.apply(this, arguments);
	});
	skin.override("DwtTree.prototype._getFirstLastTreeItem", function(last) {
		var list = this.getTreeItemList(true);
		if (list && list.length) {
			return last ? list[list.length-1] : list[0];
		}
	});

	// Let items in tree be openable by pressing enter, not merely by navigating to them
	skin.override("ZmTreeController.prototype._handleItemSelection", function(ev, overview, treeItem, item) {
		overview.itemSelected(treeItem);

		if (ev.kbNavEvent) {
			Dwt.scrollIntoView(treeItem._itemDiv, overview.getHtmlElement());
			ZmController.noFocus = true;
		}

		if (overview._treeSelectionShortcutDelayActionId) {
			AjxTimedAction.cancelAction(overview._treeSelectionShortcutDelayActionId);
		}

		//if ((overview.selectionSupported || item._showFoldersCallback) && !treeItem._isHeader) {
		if ((overview.selectionSupported || item._showFoldersCallback) && !treeItem._isHeader && (ev.enter || ev.clicked)) { // Only open an item is we clicked it or pressed enter

			// Open item immediately, no delay
			//if (ev.kbNavEvent && ZmTreeController.TREE_SELECTION_SHORTCUT_DELAY) {
			//	var action = new AjxTimedAction(this, ZmTreeController.prototype._treeSelectionTimedAction, [item, overview]);
			//	overview._treeSelectionShortcutDelayActionId =
			//		AjxTimedAction.scheduleAction(action, ZmTreeController.TREE_SELECTION_SHORTCUT_DELAY);
			//} else {
				if ((appCtxt.multiAccounts && (item instanceof ZmOrganizer)) ||
					(item.type == ZmOrganizer.VOICE))
				{
					appCtxt.getCurrentApp().getOverviewContainer().deselectAll(overview);

					// set the active account based on the item clicked
					var account = item.account || appCtxt.accountList.mainAccount;
					appCtxt.accountList.setActiveAccount(account);
				}

				this._itemSelected(item);
			//}
		}
	});

	// Let "find shares" link be openable by keyboard
	skin.override.append("ZmTreeView.prototype.set", function(){
		if (this._addShareLink) {
			var item = this._addShareLink;
			item.enableSelection(true);

			if (!this.__shareLinkListener) {
				var shareLinkListener = this.__shareLinkListener = new AjxListener(this, function(ev){
					var item = ev.item;
					if (item === this._addShareLink && (ev.enter || ev.click)) {
						var id = item.getHTMLElId();
						var linkEl = document.getElementById(id+"_addshare_link");
						linkEl.click();
					}
				});
				this.addSelectionListener(shareLinkListener);
			}
		}
	});

	skin.override("ZmFolderTreeController.prototype._itemClicked", function() {
		appCtxt.getCurrentApp()._forceMsgView = true;
		arguments.callee.func.apply(this,arguments);
	});
})();
