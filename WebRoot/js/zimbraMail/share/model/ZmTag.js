function ZmTag(id, name, color, parent, tree, numUnread) {

	ZmOrganizer.call(this, ZmOrganizer.TAG, id, name, parent, tree, numUnread);
	color = color || ZmTag.DEFAULT_COLOR;
	this.color = color;
}

ZmTag.prototype = new ZmOrganizer;
ZmTag.prototype.constructor = ZmTag;

ZmTag.prototype.toString = 
function() {
	return "ZmTag";
}

// tag colors - these are the server values
ZmTag.C_ORANGE	= 0;
ZmTag.C_BLUE	= 1;
ZmTag.C_CYAN	= 2;
ZmTag.C_GREEN	= 3;
ZmTag.C_PURPLE	= 4;
ZmTag.C_RED		= 5;
ZmTag.C_YELLOW	= 6;
ZmTag.MAX_COLOR	= ZmTag.C_YELLOW;
ZmTag.DEFAULT_COLOR = ZmTag.C_ORANGE;

// color names
ZmTag.COLOR_TEXT = new Object();
ZmTag.COLOR_TEXT[ZmTag.C_ORANGE]	= ZmMsg.orange;
ZmTag.COLOR_TEXT[ZmTag.C_BLUE]		= ZmMsg.blue;
ZmTag.COLOR_TEXT[ZmTag.C_CYAN]		= ZmMsg.cyan;
ZmTag.COLOR_TEXT[ZmTag.C_GREEN]		= ZmMsg.green;
ZmTag.COLOR_TEXT[ZmTag.C_PURPLE]	= ZmMsg.purple;
ZmTag.COLOR_TEXT[ZmTag.C_RED]		= ZmMsg.red;
ZmTag.COLOR_TEXT[ZmTag.C_YELLOW]	= ZmMsg.yellow;

// color icons
ZmTag.COLOR_ICON = new Object();
ZmTag.COLOR_ICON[ZmTag.C_ORANGE]	= ZmImg.I_TAG_ORANGE;
ZmTag.COLOR_ICON[ZmTag.C_BLUE]		= ZmImg.I_TAG_BLUE;
ZmTag.COLOR_ICON[ZmTag.C_CYAN]		= ZmImg.I_TAG_CYAN;
ZmTag.COLOR_ICON[ZmTag.C_GREEN]		= ZmImg.I_TAG_GREEN;
ZmTag.COLOR_ICON[ZmTag.C_PURPLE]	= ZmImg.I_TAG_PURPLE;
ZmTag.COLOR_ICON[ZmTag.C_RED]		= ZmImg.I_TAG_RED;
ZmTag.COLOR_ICON[ZmTag.C_YELLOW]	= ZmImg.I_TAG_YELLOW;

// color mini icons
ZmTag.COLOR_MINI_ICON = new Object();
ZmTag.COLOR_MINI_ICON[ZmTag.C_ORANGE]	= ZmImg.I_MINI_TAG_ORANGE;
ZmTag.COLOR_MINI_ICON[ZmTag.C_BLUE]		= ZmImg.I_MINI_TAG_BLUE;
ZmTag.COLOR_MINI_ICON[ZmTag.C_CYAN]		= ZmImg.I_MINI_TAG_CYAN;
ZmTag.COLOR_MINI_ICON[ZmTag.C_GREEN]	= ZmImg.I_MINI_TAG_GREEN;
ZmTag.COLOR_MINI_ICON[ZmTag.C_PURPLE]	= ZmImg.I_MINI_TAG_PURPLE;
ZmTag.COLOR_MINI_ICON[ZmTag.C_RED]		= ZmImg.I_MINI_TAG_RED;
ZmTag.COLOR_MINI_ICON[ZmTag.C_YELLOW]	= ZmImg.I_MINI_TAG_YELLOW;

// system tags
ZmTag.ID_ROOT = ZmOrganizer.ID_ROOT;
ZmTag.ID_UNREAD		= 32;
ZmTag.ID_FLAGGED	= 33;
ZmTag.ID_FROM_ME	= 34;
ZmTag.ID_REPLIED	= 35;
ZmTag.ID_FORWARDED	= 36;
ZmTag.ID_ATTACHED	= 37;
ZmTag.FIRST_USER_ID	= 64;

ZmTag.sortCompare = 
function(tagA, tagB) {
	if (tagA.name.toLowerCase() > tagB.name.toLowerCase()) return 1;
	if (tagA.name.toLowerCase() < tagB.name.toLowerCase()) return -1;
	return 0;
}

ZmTag.checkName =
function(name) {
	var msg = ZmOrganizer.checkName(name);
	if (msg) return msg;

	if (name.indexOf('\\') == 0)
		return AjxStringUtil.resolve(ZmMsg.errorInvalidName, name);

	return null;
}

ZmTag.prototype.create =
function(name, color) {
	color = ZmTag.checkColor(color);
	var soapDoc = AjxSoapDoc.create("CreateTagRequest", "urn:zimbraMail");
	var tagNode = soapDoc.set("tag");
	tagNode.setAttribute("name", name);
	tagNode.setAttribute("color", color);
	var resp = this.tree._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
}

ZmTag.prototype.notifyCreate =
function(obj) {
	var child = ZmTag.createFromJs(this, obj, this.tree, true);
	this._eventNotify(ZmEvent.E_CREATE, child);
}

ZmTag.prototype.notifyModify =
function(obj) {
	if (!obj) return;
	
	var fields = ZmOrganizer.prototype._getCommonFields.call(this, obj);
	if (obj.color) {
		var color = ZmTag.checkColor(obj.color);
		if (this.color != color) {
			this.color = color;
			fields[ZmOrganizer.F_COLOR] = true;
		}
	}
	this._eventNotify(ZmEvent.E_MODIFY, this, {fields: fields});
}

ZmTag.prototype.setColor =
function(color) {
	var color = ZmTag.checkColor(color);
	if (this.color == color) return;
	var success = this._organizerAction("color", {color: color});
	if (success) {
		this.color = color;
		var fields = new Object();
		fields[ZmOrganizer.F_COLOR] = true;
		this._eventNotify(ZmEvent.E_MODIFY, this, {fields: fields});
	}
}

/**
* Tags come from back end as a flat list, and we manually create a root tag, so all tags
* have the root as parent. If tags ever have a tree structure, then this should do what
* ZmFolder does (recursively create children).
*/
ZmTag.createFromJs =
function(parent, obj, tree, sorted) {
	if (obj.id < ZmTag.FIRST_USER_ID)
		return;
	var tag = new ZmTag(obj.id, obj.name, ZmTag.checkColor(obj.color), parent, tree, obj.u);
	var index = sorted ? ZmOrganizer.getSortIndex(tag, ZmTag.sortCompare) : null;
	parent.children.add(tag, index);

	return tag;
}

ZmTag.checkColor =
function(color) {
	return ((color != null) && (color >= 0 && color <= ZmTag.MAX_COLOR)) ? color : ZmTag.DEFAULT_COLOR;
}
