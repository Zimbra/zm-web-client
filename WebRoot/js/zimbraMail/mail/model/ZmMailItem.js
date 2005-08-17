function LmMailItem(appCtxt, type, list) {

	if (arguments.length == 0) return;
	LmItem.call(this, appCtxt, type, list);

	this._initializeParticipants();
}

LmMailItem.prototype = new LmItem;
LmMailItem.prototype.constructor = LmMailItem;

LmMailItem.prototype.toString = 
function() {
	return "LmMailItem";
}

LmMailItem.prototype.clear =
function() {
	this._clearParticipants();	
	LmItem.prototype.clear.call(this);
}

LmMailItem.prototype.notifyModify =
function(obj) {
	var fields = new Object();
	if (obj.e != null) {
		this._clearParticipants();	
		this._initializeParticipants();	
		for (var i = 0; i < obj.e.length; i++)
			this._parseParticipantNode(obj.e[i]);
		fields[LmItem.F_PARTICIPANT] = true;
		this._notify(LmEvent.E_MODIFY, {fields : fields});
	}

	LmItem.prototype.notifyModify.call(this, obj);
}

LmMailItem.prototype._initializeParticipants =
function() {
	this.participants = new LsVector();
	this._participantHash = new Object();
	this.participantsElided = false;
}

LmMailItem.prototype._clearParticipants =
function() {
	this.participants.removeAll();
	this.participants = null;
	if (this._participantHash) {
		for (var i in this._participantHash)
			this._participantHash[i] = null;
		this._participantHash = null;
	}
	this.participantsElided = false;
}

LmMailItem.prototype._getFlags =
function() {
	var list = LmItem.prototype._getFlags.call(this);
	list.push(LmItem.FLAG_UNREAD, LmItem.FLAG_REPLIED, LmItem.FLAG_FORWARDED);
	return list;
}

LmMailItem.prototype._markReadLocal =
function(on) {
	this.isUnread = !on;
	this._notify(LmEvent.E_FLAGS, {flags: [LmItem.FLAG_UNREAD]});
}

LmMailItem.prototype._parseParticipantNode = 
function(child) {
	var address = null;

	var id = child.id;
	var ref = child.ref;
	if (id) {
		var addr = child.a;
		var type = LmEmailAddress.fromSoapType[child.t];
		var name = child.p;
		var dispName = child.d;
		address = new LmEmailAddress(addr, type, name, dispName);
		
		this._participantHash[id] = address;
	} else if (ref) {
		address = this._participantHash[ref];
	} else {
		this.participantsElided = true;
	}

	if (!this.participantsElided) {
		if (address)
			this.participants.add(address);
	} else {
		this.participantsElided = false;
	}
}
