function ZmTagTreeController(appCtxt, parent, tree) {

	var dropTgt = new DwtDropTarget(ZmConv, ZmMailMsg, ZmContact);
	ZmTreeController.call(this, appCtxt, parent, tree, dropTgt);

	this._listeners[ZmOperation.NEW_TAG] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_TAG] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.COLOR_MENU] = new AjxListener(this, this._colorListener);
}

ZmTagTreeController.prototype = new ZmTreeController;
ZmTagTreeController.prototype.constructor = ZmTagTreeController;

// Public methods

ZmTagTreeController.prototype.toString = 
function() {
	return "ZmTagTreeController";
}

ZmTagTreeController.prototype.show = 
function(tagTree, showUnread) {
	this._setup();
	this._treeView.set(tagTree, showUnread);
}

ZmTagTreeController.prototype.createActionMenu = 
function(parent, menuItems) {
	var menu = ZmTreeController.prototype.createActionMenu.call(this, parent, menuItems);
	var mi = menu.getMenuItem(ZmOperation.COLOR_MENU);
	if (mi) {
		var items = mi.getMenu().getItems();
		for (var i = 0; i < items.length; i++)
			items[i].addSelectionListener(this._listeners[ZmOperation.COLOR_MENU]);
	}

	return menu;
}

// Override so we can create special Tags folder menu
ZmTagTreeController.prototype._setup = 
function() {
	ZmTreeController.prototype._setup.call(this);
	if (!this._customActionMenu) {
		this._customActionMenu = new Object();
		this._customActionMenu[ZmFolder.ID_TAGS] = this.createActionMenu(this._shell, [ZmOperation.NEW_TAG]);
	}
}

/**
* Enables/disables operations based on context.
*
* @param parent		the widget that contains the operations
* @param id			the currently selected/activated organizer
*/
ZmTagTreeController.prototype.resetOperations = 
function(parent, id) {
	var tag = this._appCtxt.getTagList().getById(id);
	if (id >= ZmTag.FIRST_USER_ID)
		parent.enableAll(true);
	else
		parent.enable([ZmOperation.RENAME_TAG, 
					   ZmOperation.COLOR_MENU, ZmOperation.DELETE], false);
	parent.enable(ZmOperation.MARK_ALL_READ, (tag && (tag.numUnread > 0)));
}

// Private methods

ZmTagTreeController.prototype._getActionMenuOps =
function() {
	var list = new Array();
	list.push(ZmOperation.NEW_TAG,
			  ZmOperation.MARK_ALL_READ,
			  ZmOperation.RENAME_TAG,
			  ZmOperation.DELETE,
			  ZmOperation.COLOR_MENU);
	return list;
}

ZmTagTreeController.prototype._createNewTreeView =
function() {
	return (new ZmTagTreeView(this._appCtxt, this.parent, this.tree, this._dragSrc, this._dropTgt));
}

ZmTagTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewTagDialog();
}

ZmTagTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameTagDialog();
}

ZmTagTreeController.prototype._doColorTag =
function(params) {
	try {
		params.tag.setColor(params.color);
	} catch (ex) {
		this._handleException(ex, this._doColorTag, params, false);
	}
}

// Listeners

ZmTagTreeController.prototype._treeViewListener =
function(ev) {
	this._actionedOrganizer = ev.item.getData(Dwt.KEY_OBJECT);
	var org = this._actionedOrganizer; // org is either a tag or the Tags folder
	if (!(org && ((org instanceof ZmTag) || (org.id == ZmFolder.ID_TAGS)))) return;
	var id = org.id;
	if (ev.detail == DwtTree.ITEM_ACTIONED) {
		var actionMenu = this._customActionMenu[id] ? this._customActionMenu[id] : this._actionMenu;
		this.resetOperations(actionMenu, id);
		actionMenu.popup(0, ev.docX, ev.docY)
	} else if ((ev.detail == DwtTree.ITEM_SELECTED) && (org instanceof ZmTag) && (org.id >= ZmTag.FIRST_USER_ID)) {
		this._appCtxt.getSearchController().search('tag:"' + org.name + '"');
	}
}

ZmTagTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._pendingActionData = this._getActionedOrganizer(ev);
	this._deleteShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	var msg = AjxStringUtil.resolve(LmMsg.askDeleteTag, organizer.getName(false, ZmOrganizer.MAX_DISPLAY_NAME_LENGTH));
	this._deleteShield.setMessage(msg, null, DwtMessageDialog.WARNING_STYLE);
	this._deleteShield.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
	this._deleteShield.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
    this._deleteShield.popup();
}

ZmTagTreeController.prototype._colorListener = 
function(ev) {
	this._schedule(this._doColorTag, {tag: this._getActionedOrganizer(ev), color: ev.item.getData(ZmOperation.MENUITEM_ID)});
}

// Note: ZmListController's drag listener passes us a two-piece object as srcData.
ZmTagTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var data = ev.srcData.data;
		var sample = (data instanceof Array) ? data[0] : data;
		if (sample instanceof ZmContact && sample.isGal) {
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

ZmTagTreeController.prototype._newCallback =
function(args) {
	this._schedule(this._doCreate, {name: args[0], color: args[1], parent: args[2]});
	this._clearDialog(this._getNewDialog());
}

ZmTagTreeController.prototype._deleteShieldYesCallback =
function(tag) {
	this._schedule(this._doDelete, {organizer: tag});
	this._clearDialog(this._deleteShield);
}

// Actions

ZmTagTreeController.prototype._doCreate =
function(params) {
	var parent = params.parent || this._appCtxt.getTagList().root;
	try {
		parent.create(params.name, params.color);
	} catch (ex) {
		if (ex.code == LsCsfeException.MAIL_INVALID_NAME) {
			var msg = AjxStringUtil.resolve(LmMsg.errorInvalidName, params.name);
			this._msgDialog.setMessage(msg, null, DwtMessageDialog.CRITICAL_STYLE);
			this._msgDialog.popup();
		} else {
			this._handleException(ex, ZmTagTreeController.prototype._doCreate, params, false);
		}
	}
}
