ZmActionStack = function(maxLength) {
	this._stack = [];
	this._pointer = -1;
	this._maxLength = maxLength || 0; // 0 means no limit
};

ZmEvent.S_ACTION			= "ACTION";

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

	var action = null;
	var folder;
	switch (op) {
		case "trash":
			folder = ZmFolder.ID_TRASH;
			break;
		case "move":
		case "spam":
		case "!spam":
			folder = attrs.l;
			break;
	}

	switch (op) {
		case "trash":
		case "move":
		case "spam":
		case "!spam":
			for (var i=0; i<items.length; i++) {
				var item = items[i];
				var moveAction;
				if (item instanceof ZmItem) {
					moveAction = new ZmItemMoveAction(item, item.getFolderId(), folder, op);
				} else if (item instanceof ZmOrganizer) {
					moveAction = new ZmOrganizerMoveAction(item, item.parent.id, folder, op);
				}
				if (moveAction) {
					if (multi) {
						if (!action) action = new ZmCompositeAction();
						action.addAction(moveAction);
					} else {
						action = moveAction;
					}
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
