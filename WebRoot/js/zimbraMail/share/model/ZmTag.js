function LmTag(id, name, color, parent, tree, numUnread) {

	LmOrganizer.call(this, LmOrganizer.TAG, id, name, parent, tree, numUnread);
	color = color || LmTag.DEFAULT_COLOR;
	this.color = color;
}

LmTag.prototype = new LmOrganizer;
LmTag.prototype.constructor = LmTag;

LmTag.prototype.toString = 
function() {
	return "LmTag";
}

// tag colors - these are the server values
LmTag.C_ORANGE	= 0;
LmTag.C_BLUE	= 1;
LmTag.C_CYAN	= 2;
LmTag.C_GREEN	= 3;
LmTag.C_PURPLE	= 4;
LmTag.C_RED		= 5;
LmTag.C_YELLOW	= 6;
LmTag.MAX_COLOR	= LmTag.C_YELLOW;
LmTag.DEFAULT_COLOR = LmTag.C_ORANGE;

// color names
LmTag.COLOR_TEXT = new Object();
LmTag.COLOR_TEXT[LmTag.C_ORANGE]	= LmMsg.orange;
LmTag.COLOR_TEXT[LmTag.C_BLUE]		= LmMsg.blue;
LmTag.COLOR_TEXT[LmTag.C_CYAN]		= LmMsg.cyan;
LmTag.COLOR_TEXT[LmTag.C_GREEN]		= LmMsg.green;
LmTag.COLOR_TEXT[LmTag.C_PURPLE]	= LmMsg.purple;
LmTag.COLOR_TEXT[LmTag.C_RED]		= LmMsg.red;
LmTag.COLOR_TEXT[LmTag.C_YELLOW]	= LmMsg.yellow;

// color icons
LmTag.COLOR_ICON = new Object();
LmTag.COLOR_ICON[LmTag.C_ORANGE]	= LmImg.I_TAG_ORANGE;
LmTag.COLOR_ICON[LmTag.C_BLUE]		= LmImg.I_TAG_BLUE;
LmTag.COLOR_ICON[LmTag.C_CYAN]		= LmImg.I_TAG_CYAN;
LmTag.COLOR_ICON[LmTag.C_GREEN]		= LmImg.I_TAG_GREEN;
LmTag.COLOR_ICON[LmTag.C_PURPLE]	= LmImg.I_TAG_PURPLE;
LmTag.COLOR_ICON[LmTag.C_RED]		= LmImg.I_TAG_RED;
LmTag.COLOR_ICON[LmTag.C_YELLOW]	= LmImg.I_TAG_YELLOW;

// color mini icons
LmTag.COLOR_MINI_ICON = new Object();
LmTag.COLOR_MINI_ICON[LmTag.C_ORANGE]	= LmImg.I_MINI_TAG_ORANGE;
LmTag.COLOR_MINI_ICON[LmTag.C_BLUE]		= LmImg.I_MINI_TAG_BLUE;
LmTag.COLOR_MINI_ICON[LmTag.C_CYAN]		= LmImg.I_MINI_TAG_CYAN;
LmTag.COLOR_MINI_ICON[LmTag.C_GREEN]	= LmImg.I_MINI_TAG_GREEN;
LmTag.COLOR_MINI_ICON[LmTag.C_PURPLE]	= LmImg.I_MINI_TAG_PURPLE;
LmTag.COLOR_MINI_ICON[LmTag.C_RED]		= LmImg.I_MINI_TAG_RED;
LmTag.COLOR_MINI_ICON[LmTag.C_YELLOW]	= LmImg.I_MINI_TAG_YELLOW;

// system tags
LmTag.ID_ROOT = LmOrganizer.ID_ROOT;
LmTag.ID_UNREAD		= 32;
LmTag.ID_FLAGGED	= 33;
LmTag.ID_FROM_ME	= 34;
LmTag.ID_REPLIED	= 35;
LmTag.ID_FORWARDED	= 36;
LmTag.ID_ATTACHED	= 37;
LmTag.FIRST_USER_ID	= 64;

LmTag.sortCompare = 
function(tagA, tagB) {
	if (tagA.name.toLowerCase() > tagB.name.toLowerCase()) return 1;
	if (tagA.name.toLowerCase() < tagB.name.toLowerCase()) return -1;
	return 0;
}

LmTag.checkName =
function(name) {
	var msg = LmOrganizer.checkName(name);
	if (msg) return msg;

	if (name.indexOf('\\') == 0)
		return LsStringUtil.resolve(LmMsg.errorInvalidName, name);

	return null;
}

LmTag.prototype.create =
function(name, color) {
	color = LmTag.checkColor(color);
	var soapDoc = LsSoapDoc.create("CreateTagRequest", "urn:liquidMail");
	var tagNode = soapDoc.set("tag");
	tagNode.setAttribute("name", name);
	tagNode.setAttribute("color", color);
	var resp = this.tree._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
}

LmTag.prototype.notifyCreate =
function(obj) {
	var child = LmTag.createFromJs(this, obj, this.tree, true);
	this._eventNotify(LmEvent.E_CREATE, child);
}

LmTag.prototype.notifyModify =
function(obj) {
	if (!obj) return;
	
	var fields = LmOrganizer.prototype._getCommonFields.call(this, obj);
	if (obj.color) {
		var color = LmTag.checkColor(obj.color);
		if (this.color != color) {
			this.color = color;
			fields[LmOrganizer.F_COLOR] = true;
		}
	}
	this._eventNotify(LmEvent.E_MODIFY, this, {fields: fields});
}

LmTag.prototype.setColor =
function(color) {
	var color = LmTag.checkColor(color);
	if (this.color == color) return;
	var success = this._organizerAction("color", {color: color});
	if (success) {
		this.color = color;
		var fields = new Object();
		fields[LmOrganizer.F_COLOR] = true;
		this._eventNotify(LmEvent.E_MODIFY, this, {fields: fields});
	}
}

/**
* Tags come from back end as a flat list, and we manually create a root tag, so all tags
* have the root as parent. If tags ever have a tree structure, then this should do what
* LmFolder does (recursively create children).
*/
LmTag.createFromJs =
function(parent, obj, tree, sorted) {
	if (obj.id < LmTag.FIRST_USER_ID)
		return;
	var tag = new LmTag(obj.id, obj.name, LmTag.checkColor(obj.color), parent, tree, obj.u);
	var index = sorted ? LmOrganizer.getSortIndex(tag, LmTag.sortCompare) : null;
	parent.children.add(tag, index);

	return tag;
}

LmTag.checkColor =
function(color) {
	return ((color != null) && (color >= 0 && color <= LmTag.MAX_COLOR)) ? color : LmTag.DEFAULT_COLOR;
}
