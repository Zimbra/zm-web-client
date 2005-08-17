function LmTagTreeController(appCtxt, parent, tree) {

	var dropTgt = new DwtDropTarget(LmConv, LmMailMsg, LmContact);
	LmTreeController.call(this, appCtxt, parent, tree, dropTgt);

	this._listeners[LmOperation.NEW_TAG] = new LsListener(this, this._newListener);
	this._listeners[LmOperation.RENAME_TAG] = new LsListener(this, this._renameListener);
	this._listeners[LmOperation.COLOR_MENU] = new LsListener(this, this._colorListener);
}

LmTagTreeController.prototype = new LmTreeController;
LmTagTreeController.prototype.constructor = LmTagTreeController;

// Public methods

LmTagTreeController.prototype.toString = 
function() {
	return "LmTagTreeController";
}

LmTagTreeController.prototype.show = 
function(tagTree, showUnread) {
	this._setup();
	this._treeView.set(tagTree, showUnread);
}

LmTagTreeController.prototype.createActionMenu = 
function(parent, menuItems) {
	var menu = LmTreeController.prototype.createActionMenu.call(this, parent, menuItems);
	var mi = menu.getMenuItem(LmOperation.COLOR_MENU);
	if (mi) {
		var items = mi.getMenu().getItems();
		for (var i = 0; i < items.length; i++)
			items[i].addSelectionListener(this._listeners[LmOperation.COLOR_MENU]);
	}

	return menu;
}

// Override so we can create special Tags folder menu
LmTagTreeController.prototype._setup = 
function() {
	LmTreeController.prototype._setup.call(this);
	if (!this._customActionMenu) {
		this._customActionMenu = new Object();
		this._customActionMenu[LmFolder.ID_TAGS] = this.createActionMenu(this._shell, [LmOperation.NEW_TAG]);
	}
}

/**
* Enables/disables operations based on context.
*
* @param parent		the widget that contains the operations
* @param id			the currently selected/activated organizer
*/
LmTagTreeController.prototype.resetOperations = 
function(parent, id) {
	var tag = this._appCtxt.getTagList().getById(id);
	if (id >= LmTag.FIRST_USER_ID)
		parent.enableAll(true);
	else
		parent.enable([LmOperation.RENAME_TAG, 
					   LmOperation.COLOR_MENU, LmOperation.DELETE], false);
	parent.enable(LmOperation.MARK_ALL_READ, (tag && (tag.numUnread > 0)));
}

// Private methods

LmTagTreeController.prototype._getActionMenuOps =
function() {
	var list = new Array();
	list.push(LmOperation.NEW_TAG,
			  LmOperation.MARK_ALL_READ,
			  LmOperation.RENAME_TAG,
			  LmOperation.DELETE,
			  LmOperation.COLOR_MENU);
	return list;
}

LmTagTreeController.prototype._createNewTreeView =
function() {
	return (new LmTagTreeView(this._appCtxt, this.parent, this.tree, this._dragSrc, this._dropTgt));
}

LmTagTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewTagDialog();
}

LmTagTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameTagDialog();
}

LmTagTreeController.prototype._doColorTag =
function(params) {
	try {
		params.tag.setColor(params.color);
	} catch (ex) {
		this._handleException(ex, this._doColorTag, params, false);
	}
}

// Listeners

LmTagTreeController.prototype._treeViewListener =
function(ev) {
	this._actionedOrganizer = ev.item.getData(Dwt.KEY_OBJECT);
	var org = this._actionedOrganizer; // org is either a tag or the Tags folder
	if (!(org && ((org instanceof LmTag) || (org.id == LmFolder.ID_TAGS)))) return;
	var id = org.id;
	if (ev.detail == DwtTree.ITEM_ACTIONED) {
		var actionMenu = this._customActionMenu[id] ? this._customActionMenu[id] : this._actionMenu;
		this.resetOperations(actionMenu, id);
		actionMenu.popup(0, ev.docX, ev.docY)
	} else if ((ev.detail == DwtTree.ITEM_SELECTED) && (org instanceof LmTag) && (org.id >= LmTag.FIRST_USER_ID)) {
		this._appCtxt.getSearchController().search('tag:"' + org.name + '"');
	}
}

LmTagTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._pendingActionData = this._getActionedOrganizer(ev);
	this._deleteShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	var msg = LsStringUtil.resolve(LmMsg.askDeleteTag, organizer.getName(false, LmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._deleteShield.setMessage(msg, null, DwtMessageDialog.WARNING_STYLE);
	this._deleteShield.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
	this._deleteShield.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
    this._deleteShield.popup();
}

LmTagTreeController.prototype._colorListener = 
function(ev) {
	this._schedule(this._doColorTag, {tag: this._getActionedOrganizer(ev), color: ev.item.getData(LmOperation.MENUITEM_ID)});
}

// Note: LmListController's drag listener passes us a two-piece object as srcData.
LmTagTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var data = ev.srcData.data;
		var sample = (data instanceof Array) ? data[0] : data;
		if (sample instanceof LmContact && sample.isGal) {
			ev.doIt = false;
		} else {
			ev.doIt = this._dropTgt.isValidTarget(data);
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var data = ev.srcData.data;
		var ctlr = ev.srcData.controller;
		var items = (data instanceof Array) ? data : [data];
		ctlr._schedule(ctlr._doTag, {items: items, tag: ev.targetControl.getData(Dwt.KEY_OBJECT), bTag: true});
	}
}

// Callbacks

LmTagTreeController.prototype._newCallback =
function(args) {
	this._schedule(this._doCreate, {name: args[0], color: args[1], parent: args[2]});
	this._clearDialog(this._getNewDialog());
}

LmTagTreeController.prototype._deleteShieldYesCallback =
function(tag) {
	this._schedule(this._doDelete, {organizer: tag});
	this._clearDialog(this._deleteShield);
}

// Actions

LmTagTreeController.prototype._doCreate =
function(params) {
	var parent = params.parent || this._appCtxt.getTagList().root;
	try {
		parent.create(params.name, params.color);
	} catch (ex) {
		if (ex.code == LsCsfeException.MAIL_INVALID_NAME) {
			var msg = LsStringUtil.resolve(LmMsg.errorInvalidName, params.name);
			this._msgDialog.setMessage(msg, null, DwtMessageDialog.CRITICAL_STYLE);
			this._msgDialog.popup();
		} else {
			this._handleException(ex, LmTagTreeController.prototype._doCreate, params, false);
		}
	}
}
