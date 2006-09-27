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
	}

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = contact;

	this._setFields();
	this._isDirty = false;
};

ZmGroupView.prototype.getModifiedAttrs =
function() {
	// TODO
};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	// TODO
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
	return this._isDirty;
};

ZmGroupView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.group].join(": ");
};


// Private methods

ZmGroupView.prototype._setFields =
function() {
	this._setHeaderColor();
	this._setTitle();
	this._setTags();
};

ZmGroupView.prototype._setHeaderColor =
function() {
/*
	// set the appropriate header color
	var folderId = this._contact.folderId;
	var folder = folderId ? this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(folderId) : null;
	var color = folder ? folder.color : ZmAddrBook.DEFAULT_COLOR;
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	var contactHdrRow = document.getElementById(this._groupHeaderRowId);
	contactHdrRow.className = "contactHeaderRow " + bkgdColor;
*/
};

ZmGroupView.prototype._setTitle =
function(title) {
/*
	var div = document.getElementById(this._groupTitleId);
	var fileAs = title || this._contact.getFileAs();
	div.innerHTML = fileAs || (this._contact.id ? "&nbsp;" : ZmMsg.newGroup);
*/
};

ZmGroupView.prototype._setTags =
function() {
/*
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

	var tagCell = document.getElementById(this._groupTagId);
	tagCell.innerHTML = html.join("");
*/
};

ZmGroupView.prototype._createHtml =
function(contact) {
	var idx = 0;
	var html = new Array(50);

	// TODO

	this.getHtmlElement().innerHTML = html.join("");

	this._htmlInitialized = true;
};

ZmGroupView.prototype._getTabGroupMembers =
function() {
	// TODO
	return [];
};

ZmGroupView.prototype._getDefaultFocusItem =
function() {
	// TODO
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
ZmGroupView.getPrintHtml =
function(contact, abridged, appCtxt) {
	DBG.println("TODO");
};
