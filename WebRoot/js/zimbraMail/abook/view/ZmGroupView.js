/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmGroupView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmGroupView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	this._tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	this.getHtmlElement().style.overflow = "hidden";
	this._changeListener = new AjxListener(this, this._groupChangeListener);
};

ZmGroupView.prototype = new DwtComposite;
ZmGroupView.prototype.constructor = ZmGroupView;


// Public Methods

ZmGroupView.prototype.toString =
function() {
	return "ZmGroupView";
};

// need this since contact view now derives from list controller
ZmGroupView.prototype.getList = function() { return null; }

ZmGroupView.prototype.getContact =
function() {
	return this._contact;
};

ZmGroupView.prototype.getController =
function() {
	return this._controller;
};

ZmGroupView.prototype.set =
function(contact) {

	if (!this._htmlInitialized) {
		this._createHtml(contact);
		this._installOnKeyupHandler();
	}

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = contact;

	this._setFields();
};

ZmGroupView.prototype.getModifiedAttrs =
function() {
	// TODO
};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	document.getElementById(this._groupNameId).disabled = !bEnable;
	document.getElementById(this._groupMembersId).disabled = !bEnable;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmGroupView.prototype.getSelection =
function() {
	return this._contact;
};

ZmGroupView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmGroupView.prototype.isDirty =
function() {
	// TODO - check group name and group members for dirtyness
	return true;
};

ZmGroupView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.group].join(": ");
};

ZmGroupView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	var groupTable = document.getElementById(this._groupMembersId);
	if (groupTable) {
		Dwt.setSize(groupTable, Dwt.DEFAULT, height-90);
	}
};



// Private methods

// Consistent spot to locate various dialogs
ZmGroupView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + 50, loc.y + 100);
};

ZmGroupView.prototype._setHeaderColor =
function() {
	// set the appropriate header color
	var folderId = this._contact.folderId;
	var folder = folderId ? this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(folderId) : null;
	var color = folder ? folder.color : ZmAddrBook.DEFAULT_COLOR;
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	var contactHdrRow = document.getElementById(this._contactHeaderRowId);
	contactHdrRow.className = "contactHeaderRow " + bkgdColor;
};

ZmGroupView.prototype._setTitle =
function(title) {
	var div = document.getElementById(this._titleId);
	var fileAs = title || this._contact.getFileAs();
	div.innerHTML = fileAs || (this._contact.id ? "&nbsp;" : ZmMsg.newGroup);
};

ZmGroupView.prototype._setTags =
function() {
	// get sorted list of tags for this msg
	var ta = new Array();
	for (var i = 0; i < this._contact.tags.length; i++)
		ta.push(this._tagList.getById(this._contact.tags[i]));
	ta.sort(ZmTag.sortCompare);

	var html = [];
	var i = 0;
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var icon = ZmTag.COLOR_MINI_ICON[tag.color];
		html[i++] = AjxImg.getImageSpanHtml(icon, null, null, tag.name);
		html[i++] = "&nbsp;";
	}

	var tagCell = document.getElementById(this._tagsId);
	tagCell.innerHTML = html.join("");
};

ZmGroupView.prototype._setFields =
function() {

	// TODO - set fields from this._contact

	this._setHeaderColor();
	this._setTitle();
	this._setTags();
};

ZmGroupView.prototype._createHtml =
function(contact) {
	this._titleId = Dwt.getNextId();
	this._tagsId = Dwt.getNextId();
	this._contactHeaderId = Dwt.getNextId();
	this._contactHeaderRowId = Dwt.getNextId();
	this._groupNameId = Dwt.getNextId();
	this._groupMembersId = Dwt.getNextId();

	var idx = 0;
	var html = [];

	// Title bar
	html[idx++] = "<table id='";
	html[idx++] = this._contactHeaderId;
	html[idx++] = "' cellspacing=0 cellpadding=0 width=100%><tr class='contactHeaderRow' id='";
	html[idx++] = this._contactHeaderRowId;
	html[idx++] = "'><td width=20><center>";
	html[idx++] = AjxImg.getImageHtml("Group");
	html[idx++] = "</center></td><td><div id='";
	html[idx++] = this._titleId;
	html[idx++] = "' class='contactHeader'></div></td><td align='right' id='";
	html[idx++] = this._tagsId;
	html[idx++] = "'></td></tr></table>";
	// content
	html[idx++] = "<table border=0 width=100% cellpadding=1 cellspacing=1><td width=50% valign=top>";
	html[idx++] = "<table border=0 width=100% cellpadding=2 cellspacing=2><tr><td colspan=2>";
	html[idx++] = ZmMsg.groupName;
	html[idx++] = ": <input type='text' id='";
	html[idx++] = this._groupNameId;
	html[idx++] = "'></td></tr><tr><td>";
	html[idx++] = ZmMsg.groupMembers;
	html[idx++] = ":</td><td class='editLabel' style='color:#666666'>";
	html[idx++] = ZmMsg.enterAddresses;
	html[idx++] = "</td></tr></table>";
	html[idx++] = "<textarea class='groupMembers' id='";
	html[idx++] = this._groupMembersId;
	html[idx++] = "'></textarea></td><td valign=top>";

	// TODO
	html[idx++] = "...list view goes here...";

	html[idx++] = "</td>";
	html[idx++] = "</tr></table>";

	this.getHtmlElement().innerHTML = html.join("");

	this._htmlInitialized = true;
};

ZmGroupView.prototype._installOnKeyupHandler =
function() {
	var groupName = document.getElementById(this._groupNameId);
	Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
	Dwt.associateElementWithObject(groupName, this);
	groupName._field = field;
};

ZmGroupView.prototype._getTabGroupMembers =
function() {
	var fields = [];

	fields.push(document.getElementById(this._groupNameId));
	fields.push(document.getElementById(this._groupMembersId));

	return fields;
};

ZmGroupView.prototype._getDefaultFocusItem =
function() {
	return document.getElementById(this._groupNameId);
};


// Listeners

ZmGroupView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT)
		return;

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._contact);
};

ZmGroupView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		this._setTags();
	}
};


// Static methods

ZmGroupView._onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey)
		return;

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._setTitle(e.value);
	}

	return true;
};

ZmGroupView.getPrintHtml =
function(contact, abridged, appCtxt) {
	DBG.println("TODO");
};
