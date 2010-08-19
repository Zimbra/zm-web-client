ZmActionStack = function(maxLength) {
	this._stack = [];
	this._pointer = -1;
	this._maxLength = maxLength || 0; // 0 means no limit
};

ZmActionStack.validTypes = [ZmId.ITEM_MSG, ZmId.ITEM_CONV, ZmId.ITEM_CONTACT, ZmId.ITEM_GROUP, ZmId.ORG_FOLDER]; // Set ZmActionStack.validTypes to false to allow all item types

ZmActionStack.prototype.toString = function() {
	return "ZmActionStack";
};

ZmActionStack.prototype.logAction = function(params) {
	var op = params.op;
	var items = [];
	if (params.items) {
		for (var i=0; i<params.items.length; i++) {
			var item = params.items[i];
			if (item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, item.type)!=-1)) {
				items.push(item);
			}
		}
	} else if (params.ids) {
		for (var i=0; i<params.ids.length; i++) {
			var item = appCtxt.getById(params.ids[i]);
			if (item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, item.type)!=-1)) {
				items.push(item);
			}
		}
	} else if (params.id) {
		var item = appCtxt.getById(params.id);
		if (item && (!ZmActionStack.validTypes || AjxUtil.indexOf(ZmActionStack.validTypes, item.type)!=-1)) {
			items.push(item);
		}
	}
	var attrs = params.attrs;
	var multi = items.length>1;

	var action = multi ? new ZmCompositeAction() : null;
	var folder;
	switch (op) {
		case "trash":
			folder = ZmFolder.ID_TRASH;
		case "move":
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				var moveAction;
				if (item instanceof ZmItem) {
					moveAction = new ZmItemMoveAction(item, item.getFolderId(), folder || attrs.l);
				} else if (item instanceof ZmOrganizer) {
					moveAction = new ZmOrganizerMoveAction(item, item.parent.id, folder || attrs.l);
				}
				if (moveAction) {
					if (multi)
						action.addAction(moveAction);
					else
						action = moveAction;
				}
			}
			break;
	}
	if (action) {
		this._push(action);
	}

	return action;
};

ZmActionStack.prototype.canUndo = function() {
	return this._pointer >= 0;
};

ZmActionStack.prototype.canRedo = function() {
	return this._pointer < this._stack.length - 1;
};

ZmActionStack.prototype.undo = function() {
	if (this.canUndo()) {
		var action = this._pop();
		action.undo();
	}
};

ZmActionStack.prototype.redo = function() {
	if (this.canRedo()) {
		var action = this._stack[++this._pointer];
		action.redo();
	}
};

ZmActionStack.prototype._push = function(action) {
	if (action && action instanceof ZmAction) {
		var next = this._pointer + 1;
		while (this._maxLength && next>=this._maxLength) {
			this._stack.shift();
			next--;
		}
		this._stack[next] = action;
		this._stack.length = next+1; // Kill all actions after pointer
		this._pointer = next;
	}
};

ZmActionStack.prototype._pop = function() {
	return this.canUndo() ? this._stack[this._pointer--] : null;
};




ZmAction = function(item) {
	if (!arguments.length) return;
	this._item = item;
	this._complete = false;
}

ZmAction.ACTION_ZMACTION = "ZmAction";
ZmAction.ACTION_ZMITEMACTION = "ZmItemAction";
ZmAction.ACTION_ZMITEMMOVEACTION = "ZmItemMoveAction";
ZmAction.ACTION_ZMORGANIZERACTION = "ZmOrganizerAction";
ZmAction.ACTION_ZMORGANIZERMOVEACTION = "ZmOrganizerMoveAction";
ZmAction.ACTION_ZMCOMPOSITEACTION = "ZmCompositeAction";

ZmAction.prototype.type = ZmAction.ACTION_ZMITEMACTION;

ZmAction.prototype.toString = function() {
	return "ZmAction";
};

ZmAction.prototype.undo = function() {
	//override me
};

ZmAction.prototype.redo = function() {
	//override me"
};

ZmAction.prototype.setComplete = function() {
	this._complete = true;
};

ZmAction.prototype.getComplete = function() {
	return this._complete;
};








ZmItemAction = function(item) {
	if (!arguments.length) return;
	this._item = item;
	this._complete = false;
}

ZmItemAction.prototype = new ZmAction;
ZmItemAction.prototype.constructor = ZmItemAction;
ZmItemAction.prototype.type = ZmAction.ACTION_ZMITEMACTION;

ZmItemAction.prototype.toString = function() {
	return "ZmItemAction";
};

ZmItemAction.prototype.getItem = function() {
	return this._item;
};



ZmOrganizerAction = function(organizer) {
	if (!arguments.length) return;
	this._organizer = organizer;
	this._complete = false;
};

ZmOrganizerAction.prototype = new ZmAction;
ZmOrganizerAction.prototype.constructor = ZmOrganizerAction;
ZmOrganizerAction.prototype.type = ZmAction.ACTION_ZMORGANIZERACTION;

ZmOrganizerAction.prototype.toString = function() {
	return "ZmOrganizerAction";
};

ZmOrganizerAction.prototype.getOrganizer = function() {
	return this._organizer;
};



ZmItemMoveAction = function(item, fromFolderId, toFolderId) {
	ZmItemAction.call(this, item);
	this._fromFolderId = fromFolderId;
	this._toFolderId = toFolderId;
};

ZmItemMoveAction.prototype = new ZmItemAction;
ZmItemMoveAction.prototype.constructor = ZmItemMoveAction;

ZmItemMoveAction.prototype.type = ZmAction.ACTION_ZMITEMMOVEACTION;

ZmItemMoveAction.prototype.toString = function() {
	return "ZmItemMoveAction";
};

ZmItemMoveAction.prototype.getFromFolderId = function() {
	return this._fromFolderId;
};

ZmItemMoveAction.prototype.getToFolderId = function() {
	return this._toFolderId;
};

ZmItemMoveAction.prototype._doMove = function(callback, errorCallback, folderId) {
	this._item.list.moveItems({items: [this._item], folder: appCtxt.getById(folderId), noUndo: true, finalCallback: new AjxCallback(this, this._handleDoMove, this._item.folderId)});
};

ZmItemMoveAction.prototype._handleDoMove = function(oldFolderId, params) {
	var lists = [];
	for (var id in params.idHash) {
		var item = params.idHash[id];
		var list = item && item.list;
		if (AjxUtil.indexOf(lists, list)==-1)
			lists.push(list);
	}
	for (var i=0; i<lists.length; i++) {
		lists[i]._notify(ZmEvent.E_MOVE, {oldFolderId:oldFolderId});
	}
	ZmList.killProgressDialog(params.actionSummary);
};

ZmItemMoveAction.prototype.undo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._fromFolderId);
};

ZmItemMoveAction.prototype.redo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._toFolderId);
};

ZmItemMoveAction.multipleUndo = function(actions, redo) {
	var ftTable = {};
	for (var i=0; i<actions.length; i++) {
		var action = actions[i];
		if (action instanceof ZmItemMoveAction) {
			var from = action.getFromFolderId();
			var to = action.getToFolderId();
			if (!ftTable[from]) ftTable[from] = {};
			if (!ftTable[from][to]) ftTable[from][to] = [];
			ftTable[from][to].push(action);
		}
	}
	for (var from in ftTable) {
		for (var to in ftTable[from]) {
			var subset = ftTable[from][to];
			var items = [];
			var list;
			for (var i=0; i<subset.length; i++) {
				var item = subset[i].getItem();
				items.push(item);
				if (!list && item.list) list = item.list;
			}
			if (list) {
				list.moveItems({items: items, folder: appCtxt.getById(redo ? to : from), noUndo: true});
			}
		}
	}
};

ZmItemMoveAction.multipleRedo = function(actions) {
	ZmItemMoveAction.multipleUndo(actions, true);
};



ZmOrganizerMoveAction = function(item, fromFolderId, toFolderId) {
	ZmOrganizerAction.call(this, item);
	this._fromFolderId = fromFolderId;
	this._toFolderId = toFolderId;
};

ZmOrganizerMoveAction.prototype = new ZmOrganizerAction;
ZmOrganizerMoveAction.prototype.constructor = ZmOrganizerMoveAction;

ZmOrganizerMoveAction.prototype.type = ZmAction.ACTION_ZMITEMMOVEACTION;

ZmOrganizerMoveAction.prototype.toString = function() {
	return "ZmOrganizerMoveAction";
};

ZmOrganizerMoveAction.prototype.getFromFolderId = function() {
	return this._fromFolderId;
};

ZmOrganizerMoveAction.prototype.getToFolderId = function() {
	return this._toFolderId;
};

ZmOrganizerMoveAction.prototype._doMove = function(callback, errorCallback, folderId) {
	var folder = appCtxt.getById(folderId);
	if (folder)
		this._organizer.move(folder, true);
};

ZmOrganizerMoveAction.prototype.undo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._fromFolderId);
};

ZmOrganizerMoveAction.prototype.redo = function(callback, errorCallback) {
	this._doMove(callback, errorCallback, this._toFolderId);
};

ZmOrganizerMoveAction.multipleUndo = function(actions, redo) {
	for (var i=0; i<actions.length; i++) {
		var action = actions[i];
		if (action instanceof ZmOrganizerMoveAction) {
			action._doMove(null, null, redo ? this._toFolderId : this._fromFolderId);
		}
	}
};

ZmOrganizerMoveAction.multipleRedo = function(actions) {
	ZmItemMoveAction.multipleUndo(actions, true);
};



ZmCompositeAction = function() {
	this._complete = false;
	this._actions = {};
};

ZmCompositeAction.prototype = new ZmAction;
ZmCompositeAction.prototype.constructor = ZmCompositeAction;
ZmCompositeAction.prototype.type = ZmAction.ACTION_ZMCOMPOSITEACTION;

ZmCompositeAction.prototype.toString = function() {
	return "ZmCompositeAction";
};

ZmCompositeAction.prototype.addAction = function(action) {
	if (action && action!=this && (action instanceof ZmItemAction || action instanceof ZmCompositeAction)) {
		var type = action.type;
		if (!this._actions[type])
			this._actions[type] = [];
		this._actions[type].push(action);
	}
};

ZmCompositeAction.prototype.getActions = function(type) {
	return this._actions[type] || [];
};

ZmCompositeAction.prototype.hasActions = function(type) {
	return this._actions[type] && this._actions[type].length>0;
};

ZmCompositeAction.prototype.undo = function(callback, errorCallback) {

	if (this.hasActions(ZmAction.ACTION_ZMITEMMOVEACTION)) {
		ZmItemMoveAction.multipleUndo(this.getActions(ZmAction.ACTION_ZMITEMMOVEACTION));
	}

	if (this.hasActions(ZmAction.ACTION_ZMCOMPOSITEACTION) || this.hasActions(ZmAction.ACTION_ZMITEMACTION)) {
		var actions = this.getActions(ZmAction.ACTION_ZMCOMPOSITEACTION).concat(this.getActions(ZmAction.ACTION_ZMITEMACTION));
		for (var i=0; i<actions.length; i++) {
			actions[i].undo();
		}
	}
};

ZmCompositeAction.prototype.redo = function(callback, errorCallback) {

	if (this.hasActions(ZmAction.ACTION_ZMITEMMOVEACTION)) {
		ZmItemMoveAction.multipleRedo(this.getActions(ZmAction.ACTION_ZMITEMMOVEACTION));
	}

	if (this.hasActions(ZmAction.ACTION_ZMCOMPOSITEACTION) || this.hasActions(ZmAction.ACTION_ZMITEMACTION)) {
		var actions = this.getActions(ZmAction.ACTION_ZMCOMPOSITEACTION).concat(this.getActions(ZmAction.ACTION_ZMITEMACTION));
		for (var i=0; i<actions.length; i++) {
			actions[i].redo();
		}
	}
};


