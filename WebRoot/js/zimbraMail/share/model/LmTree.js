function LmTree(type, appCtxt) {

	if (arguments.length == 0) return;
	LmModel.call(this, true);

	this.type = type;
	this._appCtxt = appCtxt;
	this.root = null;
}

LmTree.prototype = new LmModel;
LmTree.prototype.constructor = LmTree;

// organizer class
LmTree.CLASS = new Object();
LmTree.CLASS[LmOrganizer.FOLDER] = LmFolder;
LmTree.CLASS[LmOrganizer.TAG] = LmTag;

LmTree.prototype.toString = 
function() {
	return "LmTree";
}

LmTree.prototype.asString = 
function() {
	return this.root ? this._asString(this.root, "") : "";
}

LmTree.prototype.addChangeListener = 
function(listener) {
	if (LmModel.prototype.addChangeListener.call(this, listener))
		this._appCtxt.getAppController().addModel(this);	
}

LmTree.prototype.removeChangeListener = 
function(listener) {
	if (LmModel.prototype.removeChangeListener.call(this, listener))
		if (!this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY))
			this._appCtxt.getAppController().removeModel(this);	
}

LmTree.prototype.notifyDelete =
function(ids) {
	var deleted = new Array();
	for (var i = 0; i < ids.length; i++) {
		// ignore deletes of system folders
		if ((this.type == LmOrganizer.FOLDER) && (ids[i] < LmFolder.FIRST_USER_ID))
			continue;
		var organizer = this.getById(ids[i]);
		if (organizer)
			deleted.push(organizer);
	}
	if (deleted.length) {
		this.deleteLocal(deleted);
		this._eventNotify(LmEvent.E_DELETE, deleted);
	}
}

LmTree.prototype.getById =
function(id) {
	return this.root ? this.root.getById(id) : null;
}

LmTree.prototype.getByName =
function(name) {
	return this.root ? this.root.getByName(name) : null;
}

LmTree.prototype.size =
function() {
	return this.root ? this.root.size() : 0;
}

LmTree.prototype.reset =
function() {
	this.root = null;
}

LmTree.prototype.asList =
function() {
	var list = new Array();
	return this.root ? this._addToList(this.root, list) : list;
}

LmTree.prototype.deleteLocal =
function(organizers) {
	if (!(organizers && organizers.length)) return;
	
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		organizer.children.removeAll();
		organizer.parent.children.remove(organizer);
	}
}

LmTree.prototype.getUnreadHash =
function(unread) {
	if (!unread)
		unread = new Object();
	return this.root ? this._getUnreadHash(this.root, unread) : unread;
}

LmTree.prototype._addToList =
function(organizer, list) {
	list.push(organizer);
	var children = organizer.children.getArray();
	for (var i = 0; i < children.length; i++)
		this._addToList(children[i], list)

	return list;
}

LmTree.prototype._asString =
function(organizer, str) {
	if (organizer.id)
		str = str + organizer.id;
	var children = organizer.children.getArray();
	if (children.length) {
		children.sort(function(a,b){return a.id - b.id;});
		str = str + "[";
		for (var i = 0; i < children.length; i++) {
			if (children[i].id == LmFolder.ID_TAGS) // Tags "folder" added when view is set
				continue;
			if (i > 0)
				str = str + ",";
			str = this._asString(children[i], str);
		}
		str = str + "]";
	}
	return str;
}

LmTree.prototype._getUnreadHash =
function(organizer, unread) {
	unread[organizer.id] = organizer.numUnread;
	var children = organizer.children.getArray();
	for (var i = 0; i < children.length; i++)
		this._getUnreadHash(children[i], unread)

	return unread;
}

// Notify our listeners.
LmTree.prototype._eventNotify =
function(event, organizers, details) {
	organizers = organizers || this;
	if (this._evtMgr.isListenerRegistered(LmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evt.setDetail("organizers", organizers);
		this._evtMgr.notifyListeners(LmEvent.L_MODIFY, this._evt);
	}
}

