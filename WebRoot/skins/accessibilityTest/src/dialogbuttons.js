/*(function(){
	var dialogOperationStrings = 
		[ZmId.OP_NEW_FOLDER, ZmId.OP_RENAME_FOLDER, ZmId.OP_EDIT_PROPS, ZmId.OP_SHARE_FOLDER, ZmId.OP_MOVE,
			ZmId.OP_NEW_TAG, ZmId.OP_RENAME_TAG, 
			ZmId.OP_ATTACHMENT],

		dialogOperations = AjxUtil.arrayAsHash(dialogOperationStrings);

	dialogOperations[ZmId.OP_DELETE] = dialogOperations[ZmId.OP_DELETE_WITHOUT_SHORTCUT] = function(item,op){
		var thisMenu = item && item.parent;
		if (A11yUtil.isInstance(thisMenu, "ZmActionMenu")) {
			var overviewTypesRequiringDialog = [ZmOrganizer.TAG],
				overviewController = appCtxt.getOverviewController();
			for (var i=0; i<overviewTypesRequiringDialog.length; i++) {
				var controller = overviewController.getTreeController(overviewTypesRequiringDialog[i], true),
					actionMenu = controller && controller._actionMenu;
				if (actionMenu) {
					if (thisMenu === actionMenu) return true;
				}
			}
		}
		return false;
	};

	var applyOpens = function(item, op) {
		var opens = dialogOperations[op];
		if (AjxUtil.isBoolean(opens) && opens) {
			item.opensDialog();
		} else if (AjxUtil.isFunction(opens)) {
			item.opensDialog(opens(item,op));
		}
	};

	skin.override("ZmOperation.addOperation",function(parent, id, opHash){
		arguments.callee.func.apply(this,arguments);
		if (opHash[id] instanceof DwtButton) {
			applyOpens(opHash[id], id);
		}
	});

	skin.override("ZmToolBar.prototype.createButton",function(id, params){
		var b = arguments.callee.func.apply(this,arguments);
		if (b instanceof DwtButton) {
			applyOpens(b, id);
		}
		return b;
	});
	skin.override("ZmPopupMenu.prototype.popup",function(){
		var opList = this.opList || AjxUtil.keys(this._menuItems);
		for (var i=0; i<opList.length; i++) {
			var op = opList[i];
			applyOpens(this.getMenuItem(op), op);
		}
		return arguments.callee.func.apply(this,arguments);
	});

	//--------------------------------------------------------------------------
	// Catch stragglers that don't fall into the generic case

	// New folder button in overview
	skin.override("ZmTreeController.prototype.show",function(params) {
		var treeView = arguments.callee.func.apply(this,arguments);
		if (A11yUtil.isInstance(this,"ZmMailFolderTreeController")) {
			var headerItem = treeView && treeView._headerItem;
			if (headerItem) {
				var button = headerItem._optButtonItem;
				if (button) {
					button.opensDialog();
				}
			}
		}
		return treeView;
	});
	// Share link in overview
	skin.override("ZmTreeView.prototype.set",function(){
		arguments.callee.func.apply(this,arguments);
		if (this._addShareLink instanceof DwtButton) {
			this._addShareLink.opensDialog();
		}
	});
	// Create tag in right-click menu
	skin.override("ZmTagMenu.prototype._render",function(){
		arguments.callee.func.apply(this,arguments);
		this._menuItems[ZmTagMenu.MENU_ITEM_ADD_ID].opensDialog();
	});
	skin.override("ZmRecipients.prototype.createRecipientHtml",function(){
		arguments.callee.func.apply(this,arguments);
		var buttons = this._pickerButton;
		for (var id in buttons) {
			buttons[id].opensDialog();
		}
	});

})();*/
