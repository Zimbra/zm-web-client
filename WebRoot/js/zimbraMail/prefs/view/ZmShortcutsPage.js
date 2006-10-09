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

/**
* Creates an empty shortcuts page.
* @constructor
* @class
* This class represents a page that allows the user to specify custom
* keyboard shortcuts. Currently, we limit custom shortcuts to actions
* that involve a folder, tag, or saved search. The user specifies a 
* number to refer to a particular organizer, which binds the shortcut
* to that organizer. For example, the user might assign the folder
* "test" the number 3, and then the shortcut "M,3" would move mail to
* that folder.
* <p>
* Only a single pref (the user's shortcuts gathered together in a string)
* is represented.</p>
*
* @author Conrad Damon
* @param parent				[DwtControl]				the containing widget
* @param appCtxt			[ZmAppCtxt]					the app context
* @param view				[constant]					which page we are
* @param controller			[ZmPrefController]			prefs controller
*/
function ZmShortcutsPage(parent, appCtxt, view, controller) {

	DwtTabViewPage.call(this, parent, "ZmShortcutsPage");
	
	this._appCtxt = appCtxt;
	this._view = view; // which preferences page we are
	this._controller = controller;
	this._title = [ZmMsg.zimbraTitle, ZmMsg.options, ZmPrefView.TAB_NAME[view]].join(": ");
	this._browseLstnr = new AjxListener(this, this._browseListener);
	this._prefId = ZmPrefView.PREFS[ZmPrefView.SHORTCUTS][0]; // our sole pref

	this._organizers = [ZmOrganizer.FOLDER];
	if (appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		this._organizers.push(ZmOrganizer.SEARCH);
	}
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._organizers.push(ZmOrganizer.TAG);
	}

	this._dwtObjects = {};
	this._createHtml();
	this._rendered = false;
	this._hasRendered = false;
};

ZmShortcutsPage.BUTTON_TEXT = {};
ZmShortcutsPage.BUTTON_TEXT[ZmOrganizer.FOLDER]	= ZmMsg.addFolderId;
ZmShortcutsPage.BUTTON_TEXT[ZmOrganizer.SEARCH]	= ZmMsg.addSearchId;
ZmShortcutsPage.BUTTON_TEXT[ZmOrganizer.TAG]	= ZmMsg.addTagId;

ZmShortcutsPage.DIALOG_TEXT = {};
ZmShortcutsPage.DIALOG_TEXT[ZmOrganizer.FOLDER]	= ZmMsg.chooseFolder;
ZmShortcutsPage.DIALOG_TEXT[ZmOrganizer.SEARCH]	= ZmMsg.chooseSearch;
ZmShortcutsPage.DIALOG_TEXT[ZmOrganizer.TAG]	= ZmMsg.chooseTag;

ZmShortcutsPage.ORGANIZERS = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG];
ZmShortcutsPage.ORG_ACTION = {};
ZmShortcutsPage.ORG_ACTION[ZmOrganizer.FOLDER]	= [ZmKeyMap.GOTO_FOLDER, ZmKeyMap.MOVE_TO_FOLDER];
ZmShortcutsPage.ORG_ACTION[ZmOrganizer.SEARCH]	= [ZmKeyMap.SAVED_SEARCH];
ZmShortcutsPage.ORG_ACTION[ZmOrganizer.TAG]		= [ZmKeyMap.GOTO_TAG, ZmKeyMap.TAG];

ZmShortcutsPage.ACTION_ORG = {};
var len = ZmShortcutsPage.ORGANIZERS.length;
for (var i = 0; i < len; i++) {
	var org = ZmShortcutsPage.ORGANIZERS[i];
	var actions = ZmShortcutsPage.ORG_ACTION[org];
	alen = actions.length;
	for (var j = 0; j < alen; j++) {
		ZmShortcutsPage.ACTION_ORG[actions[j]] = org;
	}
}
delete len;

ZmShortcutsPage.ORG_MAP = {};
ZmShortcutsPage.ORG_MAP[ZmOrganizer.FOLDER]	= "mail";
ZmShortcutsPage.ORG_MAP[ZmOrganizer.SEARCH]	= "global";
ZmShortcutsPage.ORG_MAP[ZmOrganizer.TAG]	= "global";

ZmShortcutsPage.DATA	= "_data_";
ZmShortcutsPage.ORG		= "_org_";

ZmShortcutsPage.prototype = new DwtTabViewPage;
ZmShortcutsPage.prototype.constructor = ZmShortcutsPage;

ZmShortcutsPage.prototype.toString =
function () {
    return "ZmShortcutsPage";
};

ZmShortcutsPage.prototype.hasRendered =
function () {
	return this._hasRendered;
};

/**
 * Displays the single pref that belongs to this page, if that hasn't been done
 * already. Note that this is an override of DwtTabViewPage.showMe(), so that it's
 * called only when the tab is selected and the page becomes visible.
 */
ZmShortcutsPage.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	this._controller._resetOperations(this._controller._toolbar, this._view);
	var dirty = this._controller.isDirty(this._view);
	if (this._hasRendered && !dirty) return;
	if (dirty) {
		var len = this._organizers.length;
		for (var j = 0; j < len; j++) {
			var org = this._organizers[j];
			this._table[org].tBodies[0].innerHTML = "";
		}
	}

	this._inputs = {};
	this._prefPresent = {};
	this._prefPresent[this._prefId] = true;
	DBG.println(AjxDebug.DBG2, "rendering shortcuts page");

	var len = ZmShortcutsPage.ORGANIZERS.length;
	for (var j = 0; j < len; j++) {
		var org = this._organizers[j];
		if (!this._hasRendered) {
			this._addButton(org, 100, new AjxListener(this, this._buttonListener));
		}
		this._renderTable(org);
	}
	this._hasRendered ? this._controller.setDirty(this._view, false) : this._hasRendered = true;

	// save the current value (for checking later if it changed)
	var pref = this._appCtxt.getSettings().getSetting(this._prefId);
	pref.origValue = this._getPrefValue(this._prefId);

	return;
};

ZmShortcutsPage.prototype.getFormValue =
function() {
	var kbm = this._appCtxt.getKeyboardMgr();
	var kmm = kbm.__keyMapMgr;
	var shortcuts = [];
	for (var id in this._inputs) {
		var row = this._inputs[id];
		var num = row["num"].dwtObj.getValue();
		var data = row["arg"].dwtObj.getData(ZmShortcutsPage.DATA);
		var org = row["arg"].dwtObj.getData(ZmShortcutsPage.ORG);
		if (!num || !data || !org) { continue; }
		var tree = this._appCtxt.getTree(org);
		var organizer = (org == ZmOrganizer.FOLDER) ? tree.getByPath(data, true) :
													  tree.getByName(data);
		if (!organizer) { continue; }
		var mapName = ZmShortcutsPage.ORG_MAP[org];
		var actions = ZmShortcutsPage.ORG_ACTION[org];
		var len = actions.length;
		for (var i = 0; i < len; i++) {
			var left = [mapName, actions[i] + num, organizer.id].join(".");
			var ks = kmm.getKeySequence(ZmKeyMap.MAP_NAME[mapName], actions[i]);
			var digits = num.split("");
			var right = ks.replace(/NNN/, digits.join(","));
			var sc = [left, right].join("=");
			shortcuts.push(sc);
		}
	}
	shortcuts.sort();
	var value = shortcuts.join("|");
	DBG.println(AjxDebug.DBG1, "shortcuts: " + value);
	return value;
};

ZmShortcutsPage.prototype.getTitle =
function() {
	return this._title;
};

ZmShortcutsPage.prototype.reset =
function() {
};

/**
* Resets the form fields to the prefs' current values.
*
* @param useDefaults	[boolean]	if true, fields are reset to prefs' default values
*/
/*
* Returns the value of the specified pref, massaging it if necessary.
*
* @param id			[constant]		pref ID
* @param useDefault	[boolean]		if true, use pref's default value
* @param convert	[boolean]		if true, convert value to user-visible form
*/
ZmShortcutsPage.prototype._getPrefValue =
function(id, useDefault, convert) {
	var value = null;
	var pref = this._appCtxt.getSettings().getSetting(id);
	return useDefault ? pref.getDefaultValue() : pref.getValue();
};

// Creates a table that we can later add preference rows to, and a placeholder DIV for
// the reset button.
ZmShortcutsPage.prototype._createHtml =
function() {

	var html = [];
	var i = 0;
	html[i++] = "<div style='padding:5 0 0 5'>";
	html[i++] = ZmMsg.shortcutAliases;
	html[i++] = "</div>";

	var tableId = {}
	this._table = {};
	this._folderButtonId = {};
	var len = this._organizers.length;
	for (var j = 0; j < len; j++) {
		var org = this._organizers[j];
		this._folderButtonId[org] = Dwt.getNextId();
		html[i++] = "<div style='padding:5 0 0 5' id='";
		html[i++] = this._folderButtonId[org];
		html[i++] = "'></div>";
		tableId[org] = Dwt.getNextId();
		html[i++] = "<div class='vSpace'></div>";
		html[i++] = "<table border=0 cellpadding=0 cellspacing=0 id='";
		html[i++] = tableId[org];
		html[i++] = "'><tbody></tbody></table>";
	}
	
	this.getHtmlElement().innerHTML = html.join("");
	
	for (var j = 0; j < len; j++) {
		var org = this._organizers[j];
		this._table[org] = document.getElementById(tableId[org]);
	}
};

/*
* Displays a table of ID/organizer mappings.
*/
ZmShortcutsPage.prototype._renderTable =
function(org) {
	var setting = this._appCtxt.get(this._prefId);
	var shortcuts = setting ? setting.split('|') : [];
	var done = {};
	var len = shortcuts.length;
	for (var i = 0; i < len; i++) {
		var sc = ZmShortcut.parse(shortcuts[i]);
		if (org != ZmShortcutsPage.ACTION_ORG[sc.baseAction] || done[sc.num]) { continue; }
		var html = this._getRowHtml(org, sc);
		var row = Dwt.parseHtmlFragment(html, true);
		this._table[org].tBodies[0].appendChild(row);
		this._addDwtObjects(row.id);
		done[sc.num] = true;
	}
};

ZmShortcutsPage.prototype._getRowHtml =
function(org, shortcut) {

	var rowId = Dwt.getNextId();
	this._inputs[rowId] = {org: org};

	var html = [];
	var i = 0;
	html[i++] = "<tr id='" + rowId + "'>";

	var button = new DwtButton(this);
	button.setSize(120, Dwt.DEFAULT);
	button.setData(ZmShortcutsPage.ORG, org);
	var organizer = null;
	if (shortcut) {
		organizer = this._appCtxt.getTree(org).getById(shortcut.arg);
		var value = (org == ZmOrganizer.FOLDER) ? organizer.getPath(false, false, null, true, true) :
												  organizer.getName(false, null, true);
		button.setData(ZmShortcutsPage.DATA, value);
	}
	var	text = organizer ? organizer.getName(false, null, true) : ZmMsg.browse;
	button.setText(text);
	var id = Dwt.getNextId();
	this._inputs[rowId]["arg"] = {id: id, dwtObj: button};
	button.addSelectionListener(this._browseLstnr);
	button.setScrollStyle(Dwt.CLIP);
	html[i++] = "<td class='paddedTableCell'>";
	html[i++] = ZmOrganizer.TEXT[org];
	html[i++] = " </td><td class='paddedTableCell' id='" + id + "' valign='center'></td>";

	id = Dwt.getNextId();
	var value = shortcut ? shortcut.num : null;
	var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: value, size: 20});
	this._inputs[rowId]["num"] = {id: id, dwtObj: input};
	html[i++] = "<td class='paddedTableCell'> ";
	html[i++] = ZmMsg.hasAlias;
	html[i++] = " </td><td class='paddedTableCell' id='" + id + "' valign='center'></td>"; 

	html[i++] = "</tr>";

	return html.join("");
};

// Add a button to the preferences page
ZmShortcutsPage.prototype._addButton =
function(org, width, listener) {
	var button = new DwtButton(this);
	button.setSize(width, Dwt.DEFAULT);
	button.setText(ZmShortcutsPage.BUTTON_TEXT[org]);
	button.addSelectionListener(listener);
	button.setData(ZmShortcutsPage.ORG, org);
	var element = button.getHtmlElement();
	element.parentNode.removeChild(element);
	var parent = document.getElementById(this._folderButtonId[org]);
	parent.appendChild(element);

	return button;
};

ZmShortcutsPage.prototype._buttonListener =
function(ev) {
	var button = ev.item;
	var org = button.getData(ZmShortcutsPage.ORG);
	var html = this._getRowHtml(org);
	var row = Dwt.parseHtmlFragment(html, true);
	this._table[org].tBodies[0].appendChild(row);
	this._addDwtObjects(row.id);
};

ZmShortcutsPage.prototype._browseListener =
function(ev) {
	var dialog, treeIds;
	var button = ev.item;
	var org = button.getData(ZmShortcutsPage.ORG);
	if (org == ZmOrganizer.TAG) {
		if (!this._tagPicker) {
			this._tagPicker = new ZmPickTagDialog(this._appCtxt.getShell(), this._appCtxt.getMsgDialog());
		}
		dialog = this._tagPicker;
	} else {
		dialog = this._appCtxt.getMoveToDialog();
		treeIds = [org];
	}
	dialog.reset();
	dialog.setTitle(ZmShortcutsPage.DIALOG_TEXT[org]);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._browseSelectionCallback, this, [ev.item, dialog]);
	dialog.popup(null, null, treeIds);
};

/*
* Changes the text of a button to the folder/tag that the user just chose.
*
* @param	[DwtButton]		the browse button
* @param	[ZmOrganizer]	the folder or tag that was chosen
*/
ZmShortcutsPage.prototype._browseSelectionCallback =
function(button, dialog, organizer) {
	if (organizer) {
		button.setText(organizer.getName(false, null, true));
		var value = (org.type == ZmOrganizer.FOLDER) ? organizer.getPath(false, false, null, true, true) :
													   organizer.getName(false, null, true);
		button.setData(ZmShortcutsPage.DATA, value);
	}
	dialog.popdown();
};

/*
* Attaches input widgets to the DOM tree based on placeholder IDs.
*
* @param	[string]*	rowId	ID of a single row to add inputs to
*/
ZmShortcutsPage.prototype._addDwtObjects =
function(rowId) {
	for (var id in this._inputs) {
		if (rowId && (id != rowId)) continue;
		var row = this._inputs[id];
		for (var f in row) {
			var field = row[f];
			if (field.id && field.dwtObj) {
				var el = field.dwtObj.getHtmlElement();
				if (el) {
					el.parentNode.removeChild(el);
					document.getElementById(field.id).appendChild(el);
					el._rowId = id;
				}
			}
		}
	}
};
