/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
 * 
 * @param parent			[DwtControl]				the containing widget
 * @param view				[constant]					which page we are
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmShortcutsPage = function(parent, view, controller) {

	DwtTabViewPage.call(this, parent, "ZmShortcutsPage");
	
	this._view = view; // which preferences page we are
	this._controller = controller;
    var section = ZmPref.getPrefSectionMap()[view];
    this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section.title].join(": ");
	this._prefId = section.prefs[0]; // our sole pref

	this._organizers = [];
	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		this._organizers.push(ZmOrganizer.FOLDER);
	}
	if (appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		this._organizers.push(ZmOrganizer.SEARCH);
	}
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._organizers.push(ZmOrganizer.TAG);
	}

	this._scTabView = new ZmShortcutsPageTabView(this, controller, this._organizers, this._prefId );
	var element = this._scTabView.getHtmlElement();
	element.parentNode.removeChild(element);
	var parent = document.getElementById(this._scTabViewId);
	parent.appendChild(element);

	var listener = new AjxListener(this, this._changeListener);
	appCtxt.getSettings().getSetting(ZmSetting.SHORTCUTS).addChangeListener(listener);

	this._rendered = false;
	this._hasRendered = false;
};

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

	if (this._hasRendered && !dirty) {
		// always re-render shortcuts table if in multi-account mode
		if (appCtxt.multiAccounts) {
			this._scTabView.reRenderShortcutsTable();
		}
		return;
	}

	this._prefPresent = {};
	this._prefPresent[this._prefId] = true;
	DBG.println(AjxDebug.DBG2, "rendering shortcuts page");

	if (!this._hasRendered){
		this._hasRendered = true;
	} else {
		this._controller.setDirty(this._view, false);
	}

	this._scTabView.show();

	// save the current value (for checking later if it changed)
	var pref = appCtxt.getSettings().getSetting(this._prefId);
	pref.origValue = this._getPrefValue(this._prefId);
};

ZmShortcutsPage.prototype.getFormValue =
function() {
	var shortcuts = this._scTabView.getShortcuts();
	shortcuts.sort();
	return shortcuts.join("|");
};

ZmShortcutsPage.prototype.getTitle =
function() {
	return this._title;
};

ZmShortcutsPage.prototype.reset = function() {};

/*
 * Returns the value of the specified pref, massaging it if necessary.
 *
 * @param id			[constant]		pref ID
 * @param useDefault	[boolean]		if true, use pref's default value
 * @param convert		[boolean]		if true, convert value to user-visible form
 */
ZmShortcutsPage.prototype._getPrefValue =
function(id, useDefault, convert) {
	var value = null;
	var pref = appCtxt.getSettings().getSetting(id);
	return useDefault ? pref.getDefaultValue() : pref.getValue();
};

ZmShortcutsPage.prototype._createHtml =
function() {

	var html = [];
	var i = 0;
	this._headerId = Dwt.getNextId();
	this._scTabViewId = Dwt.getNextId();

	html[i++] = "<div class='BigHead' id='";
	html[i++] = this._headerId;
	html[i++] = "'>";
	html[i++] = ZmMsg.keyboardShortcuts;
	html[i++] = "</div>";
	html[i++] = "<div id='";
	html[i++] = this._scTabViewId;
	html[i++] = "'></div>";

	this.getHtmlElement().innerHTML = html.join("");
};

ZmShortcutsPage.prototype._getHeaderHeight =
function() {
	var header = document.getElementById(this._headerId);
	return header ? Dwt.getSize(header).y : 0;
};

ZmShortcutsPage.prototype._controlListener =
function(ev) {
	if (ev.oldHeight != ev.newHeight) {
		this._scTabView._resetSize(ev.oldHeight - ev.newHeight);
	}
};

ZmShortcutsPage.prototype._changeListener =
function() {
	var listView = this._scTabView && this._scTabView._scTabView && this._scTabView._scTabView[ZmShortcutsPageTabView.SHORTCUTS_LIST];
	if (listView) {
		listView._dirty = true;
	}
};

/**
 * Creates an empty tab view.
 * @constructor
 * @class
 * This tab view contains up to four tab pages: a list of the current shortcuts,
 * and one page each for creating custom shortcuts for folders, tags, and saved
 * searches.
 *
 * @param parent			[DwtControl]		the containing widget
 * @param controller		[ZmPrefController]	prefs controller
 * @param organizers		[array]				list of organizer types to handle
 * @param prefId			[int]				ID of shortcuts setting
 */
ZmShortcutsPageTabView = function(parent, controller, organizers, prefId) {

    DwtTabView.call(this, parent, "ZmPrefView");

	this._parent = parent;
	this._controller = controller;
	this._organizers = appCtxt.get(ZmSetting.SHORTCUT_ALIASES_ENABLED) ? organizers : [];
	this._tabBar.setVisible(this._organizers.length > 1);

	this._scTabView = {};
	this._hasRendered = false;
};

ZmShortcutsPageTabView.SHORTCUTS_LIST = "list";

ZmShortcutsPageTabView.TAB_NAME = {};
ZmShortcutsPageTabView.TAB_NAME[ZmShortcutsPageTabView.SHORTCUTS_LIST]	= ZmMsg.shortcutList;
ZmShortcutsPageTabView.TAB_NAME[ZmOrganizer.FOLDER]						= ZmMsg.mailShortcuts;
ZmShortcutsPageTabView.TAB_NAME[ZmOrganizer.SEARCH]						= ZmMsg.searchShortcuts;
ZmShortcutsPageTabView.TAB_NAME[ZmOrganizer.TAG]						= ZmMsg.tagShortcuts;

ZmShortcutsPageTabView.prototype = new DwtTabView;
ZmShortcutsPageTabView.prototype.constructor = ZmShortcutsPageTabView;

ZmShortcutsPageTabView.prototype.toString =
function() {
	return "ZmShortcutsPageTabView";
};

ZmShortcutsPageTabView.prototype.show =
function() {
	if (this._hasRendered) { return; }

	var view;
	var viewObj;

	// shortcut list
	if (appCtxt.get(ZmSetting.SHORTCUT_LIST_ENABLED)) {
		view = ZmShortcutsPageTabView.SHORTCUTS_LIST;
		viewObj = new ZmShortcutsPageTabViewList(this._parent, this._controller);
		this._scTabView[view] = viewObj;
		var tabButtonId = ZmId.getTabId(ZmId.VIEW_SHORTCUTS, view);
		this.addTab(ZmShortcutsPageTabView.TAB_NAME[view], this._scTabView[view], tabButtonId);
	}

	for (var i = 0; i < this._organizers.length; i++) {
		view = this._organizers[i];
        viewObj = new ZmShortcutsPageTabViewCustom(this._parent, view, this._controller);
		this._scTabView[view] = viewObj;
		var tabButtonId = ZmId.getTabId(ZmId.VIEW_SHORTCUTS, view);
		this.addTab(ZmShortcutsPageTabView.TAB_NAME[view], this._scTabView[view], tabButtonId);
	}

	this._resetSize();
	this._hasRendered = true;
};

ZmShortcutsPageTabView.prototype.reRenderShortcutsTable =
function() {
	for (var i = 0; i < this._organizers.length; i++) {
		var view = this._organizers[i];
		var tabView = this._scTabView[view];
		while (tabView._table.rows.length > 0) {
			tabView._table.deleteRow(0);
		}
		tabView._inputs = {};
		tabView._renderTable();
	}
};

// Grabs the shortcuts from the pages and returns them.
ZmShortcutsPageTabView.prototype.getShortcuts =
function() {
	var shortcuts = [];
	for (var i = 0, count = this._organizers.length; i < count; i++) {
		var org = this._organizers[i];
		var tv = this._scTabView[org];
		var sc = (tv && tv._hasRendered) ? tv.getShortcuts() : this._getShortcutsFromSetting(org);
		shortcuts = shortcuts.concat(sc);
	}
	return shortcuts;
};

ZmShortcutsPageTabView.prototype._getShortcutsFromSetting =
function(org) {
	var setting = appCtxt.get(ZmSetting.SHORTCUTS);
	var sc = setting ? setting.split("|") : [];
	var shortcuts = [];
	for (var i = 0, count = sc.length; i < count; i++) {
		var p = sc[i].split(",");
		if (p[0] == ZmShortcut.ORG_KEY[org]) {
			shortcuts.push(sc[i]);
		}
	}
	return shortcuts;
};

// HACK: set height. Should be done via styles, but I kept winding up with either
// zero height or a scroll bar. Need to fudge for IE.
ZmShortcutsPageTabView.prototype._resetSize =
function(delta) {
	delta = delta || 0;
	var pv = this._controller.getPrefsView();
	var prefsHeight = pv.getSize().y;
	var prefsTabBarHeight = pv._tabBar.getSize().y;
	var headerHeight = this._parent._getHeaderHeight();
	if (!headerHeight) { return; }
	var height = prefsHeight - (prefsTabBarHeight + headerHeight) - delta;
	DBG.println(AjxDebug.DBG2, "shortcuts page resize: " + [delta, prefsHeight, prefsTabBarHeight, headerHeight, height].join(" / "));
	this.setSize(Dwt.DEFAULT, AjxEnv.isIE ? height - 10 : height);
//	this.setBounds(Dwt.DEFAULT, Dwt.DEFAULT, Dwt.DEFAULT, AjxEnv.isIE ? height - 10 : height);
};

/**
 * Creates an empty tab page.
 * @constructor
 * @class
 * This class displays all the keyboard shortcuts that are currently
 * available.
 *
 * @param parent			[DwtControl]				the containing widget
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmShortcutsPageTabViewList = function(parent, controller) {

	DwtTabViewPage.call(this, parent, "ZmShortcutsPageTabViewList");

	this._controller = controller;
	this._hasRendered = false;
};

ZmShortcutsPageTabViewList.prototype = new DwtTabViewPage;
ZmShortcutsPageTabViewList.prototype.constructor = ZmShortcutsPageTabViewList;

ZmShortcutsPageTabViewList.prototype.showMe =
function() {
	if (this._hasRendered && !this._dirty) { return; }
	if (this._dirty) {
		this.getHtmlElement().innerHTML = "";
	}

	var list = new ZmShortcutsList({style:ZmShortcutsList.PREFS_STYLE});
	this.getHtmlElement().innerHTML = list.getContent();
//	this._renderShortcuts();

	if (!this._hasRendered){
		this._hasRendered = true;
	} else {
		this._controller.setDirty(this._view, false);
	}

	if (AjxEnv.isIE) {
		var tvSize = this.parent._scTabView.getSize();
		this.setSize(tvSize.x - 40, Dwt.DEFAULT);
	}
};

ZmShortcutsList = function(params) {

	this._style = params.style;
	this._content = this._renderShortcuts();
};

ZmShortcutsList.prototype = new DwtControl;
ZmShortcutsList.prototype.constructor = ZmShortcutsList;

ZmShortcutsList.PREFS_STYLE = "prefs";
ZmShortcutsList.PRINT_STYLE = "print";
ZmShortcutsList.PANEL_STYLE = "panel";

ZmShortcutsList.prototype.getContent =
function() {
	return this._content;
};

ZmShortcutsList.prototype._renderShortcuts =
function() {
	var html = [];
	var i = 0;
	html[i++] = "<div class='" + ["ZmShortcutsList", this._style].join("-") + "'>";
    html[i++] = "<table cellspacing=10 cellpadding=0 border=0>";
    html[i++] = "<tr>";
    html[i++] = "<td><div class='shortcutListType'>Application Shortcuts</div></td>";
    html[i++] = "<td><div class='shortcutListType'>System Shortcuts</div></td></tr>";
    html[i++] = "<tr>";
	var customKeys = appCtxt._getCustomKeys(ZmKeys);
//    if (customKeys) {
//        i = this._getKeysHtml(customKeys, ZmKeyMap.MAP_NAME, html, i);
//    }
	i = this._getKeysHtml(ZmKeys, ZmKeyMap.MAP_NAME, html, i);
	i = this._getKeysHtml(AjxKeys, DwtKeyMap.MAP_NAME, html, i);
    html[i++] = "</tr></table>";
	html[i++] = "</div>";

	return html.join("");
};

ZmShortcutsList.prototype._getKeysHtml =
function(keys, mapNames, html, i) {
	var kmm = appCtxt.getKeyboardMgr().__keyMapMgr;
	var mapDesc = {};
	var maps = [];
	var keySequences = {};
	for (var propName in keys) {
		var propValue = keys[propName];
		if (!propValue || (typeof propValue != "string")) { continue; }
		var parts = propName.split(".");
		var map = parts[0];
		var isMap = (parts.length == 2);
		var action = isMap ? null : parts[1];
		var field = parts[parts.length - 1];

		// HACK: multi-account setting gets set too late for precondition to be applied
		if (map == "global" &&
			(action == "GoToNextAccount" || action == "GoToPrevAccount" || action == "GoToAccount") &&
			appCtxt.numVisibleAccounts <= 1)
		{
			continue;
		}

		if (action && (map != ZmKeyMap.MAP_CUSTOM)) {
			// make sure shortcut is defined && available
			var ks = kmm.getKeySequences(mapNames[map], action);
			if (!(ks && ks.length)) { continue; }
		}
		if (field == "description") {
			if (isMap) {
				maps.push(map);
				mapDesc[map] = propValue;
			} else {
				keySequences[map] = keySequences[map] || [];
				keySequences[map].push([map, action].join("."));
			}
		}
	}

	var sortFunc = function(keyA, keyB) {
		var sortPropNameA = [keyA, "sort"].join(".");
		var sortPropNameB = [keyB, "sort"].join(".");
		var sortA = keys[sortPropNameA] ? Number(keys[sortPropNameA]) : 0;
		var sortB = keys[sortPropNameB] ? Number(keys[sortPropNameB]) : 0;
		return (sortA > sortB) ? 1 : (sortA < sortB) ? -1 : 0;
	}

	maps.sort(sortFunc);
	var or = [" ", ZmMsg.or, " "].join("");
    html[i++] = "<td valign='top'>";
	for (var j = 0; j < maps.length; j++) {
		var map = maps[j];
		if (!keySequences[map]) { continue; }
        html[i++] = "<table class='shortcutListTable' cellspacing=0 cellpadding=0>";
		html[i++] = "<tr><td class='shortcutListHeaderTd' colspan=2><div class='shortcutListHeader'>";
		var mapDesc = (this._style == ZmShortcutsList.PANEL_STYLE) ? ZmShortcutsList.getSummary(keys, map) : keys[[map, "description"].join(".")];
		html[i++] = mapDesc;
		html[i++] = "</div></td></tr>";

		var actions = keySequences[map];
		actions.sort(sortFunc);
		for (var k = 0; k < actions.length; k++) {
			var action = actions[k];
			var ks = keys[[action, "display"].join(".")];
			var desc = (this._style == ZmShortcutsList.PANEL_STYLE) ? ZmShortcutsList.getSummary(keys, action) : keys[[action, "description"].join(".")];
			//var desc = keys[[action, "description"].join(".")];

			html[i++] = "<tr><td class='shortcutKeys'>";
			var keySeq = ks.split(/\s*;\s*/);
			var keySeq1 = [];
			for (var m = 0; m < keySeq.length; m++) {
				 keySeq1.push(ZmShortcutsList._formatKeySequence(keySeq[m]));
			}
			html[i++] = keySeq1.join(or);
			html[i++] = "</span></td>";
			html[i++] = "<td class='shortcutDescription'>";
			html[i++] = desc;
			html[i++] = "</td></tr>";

		}
        html[i++] = "</table>";
	}
    html[i++] = "</td>";

	return i;
};

// Translates a key sequence into a friendlier, more readable version
ZmShortcutsList._formatKeySequence =
function(ks) {

	var html = [];
	var i = 0;
	html[i++] = "<span class='shortcutKeyCombo'>";

	var keys = (ks[ks.length - 1] != DwtKeyMap.SEP) ? ks.split(DwtKeyMap.SEP) : [ks];
	for (var j = 0; j < keys.length; j++) {
		var key = keys[j];
		var parts = key.split(DwtKeyMap.JOIN);
		var baseIdx = parts.length - 1;
		// base can be: printable char, escaped char name (eg "Comma"), or NNN
		var base = parts[baseIdx];
		if (base == ZmShortcut.ALIAS) {
			base = "[n]";
		} else if (/^[A-Z]$/.test(base)) {
		} else if (ZmKeyMap.ENTITY[base]) {
			base = ZmKeyMap.ENTITY[base];
		}
		parts[baseIdx] = base;
		var newParts = [];
		for (var k = 0; k < parts.length; k++) {
			newParts.push(ZmShortcutsList._formatKey(parts[k]));
		}
		html[i++] = newParts.join("+");
	}
	html[i++] = "</span>";

	return html.join("");
};

ZmShortcutsList._formatKey =
function(key) {
	return ["<span class='shortcutKey'>", key, "</span>"].join("");
};

ZmShortcutsList.getSummary =
function(keys, map, action) {
	var base = action ? [map, action].join(".") : map;
	var key1 = [base, "summary"].join(".");
	var key2 = [base, "description"].join(".");
	return keys[key1] || keys[key2] || "";
};

/**
 * Creates an empty tab page.
 * @constructor
 * @class
 * This class allows the user to view and create aliases for folders, tags, and
 * saved searches, for use in keyboard shortcuts. An alias must be numeric. Once
 * created, it provides an argument to the action.
 *
 * @author Conrad Damon
 * @param parent			[DwtControl]				the containing widget
 * @param organizer			[constant]					which organizer this page handles
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmShortcutsPageTabViewCustom = function(parent, organizer, controller) {

	DwtTabViewPage.call(this, parent, "ZmShortcutsPageTabViewCustom");
	
	this._organizer = organizer;
	this._controller = controller;

	this._dwtObjects = {};
	this._createShortcutsPageHtml();
	this._rendered = false;
	this._hasRendered = false;

	this._browseLstnr = new AjxListener(this, this._browseListener);
	this._internalId = AjxCore.assignId(this);
	this._orgKey = ZmShortcut.ORG_KEY[organizer];
};

ZmShortcutsPageTabViewCustom.DATA	= "_data_";

// Text that describes a type of organizer
ZmShortcutsPageTabViewCustom.ORG_TEXT = {};
ZmShortcutsPageTabViewCustom.ORG_TEXT[ZmOrganizer.FOLDER]	= ZmMsg.mailFolder;
ZmShortcutsPageTabViewCustom.ORG_TEXT[ZmOrganizer.TAG]		= ZmMsg.tag;
ZmShortcutsPageTabViewCustom.ORG_TEXT[ZmOrganizer.SEARCH]	= ZmMsg.search;

// Plural version of above
ZmShortcutsPageTabViewCustom.ORG_TEXT_PLURAL = {};
ZmShortcutsPageTabViewCustom.ORG_TEXT_PLURAL[ZmOrganizer.FOLDER]	= ZmMsg.mailFolders;
ZmShortcutsPageTabViewCustom.ORG_TEXT_PLURAL[ZmOrganizer.TAG]		= ZmMsg.tags;
ZmShortcutsPageTabViewCustom.ORG_TEXT_PLURAL[ZmOrganizer.SEARCH]	= ZmMsg.savedSearches;

// Name of a sample organizer for each type
ZmShortcutsPageTabViewCustom.SAMPLE_ORG = {};
ZmShortcutsPageTabViewCustom.SAMPLE_ORG[ZmOrganizer.FOLDER]	= ZmMsg.projects;
ZmShortcutsPageTabViewCustom.SAMPLE_ORG[ZmOrganizer.TAG]	= ZmMsg.important;
ZmShortcutsPageTabViewCustom.SAMPLE_ORG[ZmOrganizer.SEARCH]	= ZmMsg.unread;

// Customizable shortcuts for each organizer type (full property name)
ZmShortcutsPageTabViewCustom.SAMPLE_SHORTCUTS = {};
ZmShortcutsPageTabViewCustom.SAMPLE_SHORTCUTS[ZmOrganizer.FOLDER]	= ["mail.GoToFolder", "mail.MoveToFolder"];
ZmShortcutsPageTabViewCustom.SAMPLE_SHORTCUTS[ZmOrganizer.TAG]		= ["global.GoToTag", "global.Tag"];
ZmShortcutsPageTabViewCustom.SAMPLE_SHORTCUTS[ZmOrganizer.SEARCH]	= ["global.SavedSearch"];

ZmShortcutsPageTabViewCustom.DIALOG_TEXT = {};
ZmShortcutsPageTabViewCustom.DIALOG_TEXT[ZmOrganizer.FOLDER]	= ZmMsg.chooseFolder;
ZmShortcutsPageTabViewCustom.DIALOG_TEXT[ZmOrganizer.SEARCH]	= ZmMsg.chooseSearch;
ZmShortcutsPageTabViewCustom.DIALOG_TEXT[ZmOrganizer.TAG]		= ZmMsg.chooseTag;

ZmShortcutsPageTabViewCustom.SAMPLE_KEY = 3;

// widths for the table columns (organizer, shortcut, remove link)
ZmShortcutsPageTabViewCustom.COL1_WIDTH = 300;
ZmShortcutsPageTabViewCustom.COL2_WIDTH = 130;
ZmShortcutsPageTabViewCustom.COL3_WIDTH = 60;

ZmShortcutsPageTabViewCustom.prototype = new DwtTabViewPage;
ZmShortcutsPageTabViewCustom.prototype.constructor = ZmShortcutsPageTabViewCustom;

ZmShortcutsPageTabViewCustom.prototype.toString =
function() {
	return "ZmShortcutsPageTabViewCustom";
};

ZmShortcutsPageTabViewCustom.prototype.showMe =
function() {

	if (this._hasRendered && !this._dirty) return;
	if (this._dirty) {
		this._table.tBodies[0].innerHTML = this._getTableHeaderHtml();
	}

	this._button = this._addButton(this._addButtonDivId, ZmMsg.addShortcut, 120, new AjxListener(this, this._buttonListener));
	this._inputs = {};
	this._renderTable();

	if (!this._hasRendered){
		this._hasRendered = true;
	} else {
		this._controller.setDirty(this._organizer, false);
	}

	if (AjxEnv.isIE) {
		var tvSize = this.parent._scTabView.getSize();
		this.setSize(tvSize.x - 40, Dwt.DEFAULT);
	}
};

ZmShortcutsPageTabViewCustom.prototype.getShortcuts =
function() {
	var kbm = appCtxt.getKeyboardMgr();
	var kmm = kbm.__keyMapMgr;
	var shortcuts = [], numToData = {}, dataToNum = {};
	for (var id in this._inputs) {
		var row = this._inputs[id];
		var num = row["num"].dwtObj.getValue();
		var data = row["arg"].dwtObj.getData(ZmShortcutsPageTabViewCustom.DATA);
		if (!data && !num) {
			this._removeRow(id);
			continue;	// clean row is ok
		}
		
		// error checking
		var errorStr;
		if (!data) {
			errorStr = AjxMessageFormat.format(ZmMsg.missingShortcutOrg, [ZmMsg[ZmOrganizer.MSG_KEY[this._organizer]], num]);
		} else if (!num) {
			errorStr = AjxMessageFormat.format(ZmMsg.missingShortcutNumber, [ZmMsg[ZmOrganizer.MSG_KEY[this._organizer]], data]);
		} else if (!AjxUtil.isNumeric(num)) {
			errorStr = AjxMessageFormat.format(ZmMsg.nonnumericShortcut, [ZmMsg[ZmOrganizer.MSG_KEY[this._organizer]], data]);
		}
		if (!errorStr && numToData[num]) {
			if (numToData[num] != data) {
				errorStr = AjxMessageFormat.format(ZmMsg.duplicateShortcutNumber, [num]);
			} else {
				continue;
			}
		}
		if (!errorStr && dataToNum[data] && (dataToNum[data] != num)) {
			errorStr = AjxMessageFormat.format(ZmMsg.duplicateShortcutOrg, [data]);
		}
		if (errorStr) {
			throw new AjxException(errorStr);
		}

		numToData[num] = data;
		dataToNum[data] = num;

		var tree = appCtxt.getTree(this._organizer);
		var organizer = (this._organizer == ZmOrganizer.FOLDER) ? tree.getByPath(data, true) :
																  tree.getByName(data);
		if (!organizer) { continue; }

		shortcuts.push([this._orgKey, organizer.id, num].join(","));
	}
	DBG.println(AjxDebug.DBG1, "shortcuts for org type " + this._organizer + ": " + shortcuts.join("|"));

	return shortcuts;
};

ZmShortcutsPageTabViewCustom.prototype._createShortcutsPageHtml =
function() {

	this._addButtonDivId = Dwt.getNextId();

	var tableId = Dwt.getNextId();
	var closeLinkId = Dwt.getNextId();
	var helpButtonId = Dwt.getNextId();

	var html = [];
	var i = 0;

	i = this._getInfoBoxHtml(html, i, closeLinkId);

	html[i++] = "<div style='margin:10px;border:1px solid #666666;'>";
	html[i++] = "<table width=100% cellspacing=0 cellpadding=0>";
	html[i++] = "<tr class='PanelHead'><td>";
	html[i++] = ZmShortcutsPageTabView.TAB_NAME[this._organizer];
	html[i++] = "</td>";
	html[i++] = "<td style='width:1%' id='";
	html[i++] = helpButtonId;
	html[i++] = "'></td>";
	html[i++] = "</tr><tr><td colspan=2 height=100% style='vertical-align:top;padding:10px 20px 10px 20px;'>";
	html[i++] = "<table class='shortcutTable' cellspacing=0 cellpadding=4 id='";
	html[i++] = tableId;
	html[i++] = "'><tbody>";

	i = this._getTableHeaderHtml(html, i);

	html[i++] = "</table>";
	html[i++] = "<div id='";
	html[i++] = this._addButtonDivId;
	html[i++] = "'></div>";
	html[i++] = "</tbody></table>";
	html[i++] = "</div>";
	
	this.getHtmlElement().innerHTML = html.join("");

	this._table = document.getElementById(tableId);

	// Handle the link to close the info box.
	var linkElement = document.getElementById(closeLinkId);
	var linkCallback = AjxCallback.simpleClosure(this._toggleInfoBoxHandler, this);
	Dwt.setHandler(linkElement, DwtEvent.ONCLICK, linkCallback);

	// Create the help button.
	var helpButton = new DwtButton({parent:this, style:DwtLabel.ALIGN_RIGHT | DwtButton.ALWAYS_FLAT, className:"DwtToolbarButton"});
	helpButton.setImage("Information");
	helpButton.reparentHtmlElement(helpButtonId);
	helpButton.addSelectionListener(new AjxListener(this, this._toggleInfoBoxHandler));
};

ZmShortcutsPageTabViewCustom.prototype._getInfoBoxHtml =
function(html, i, closeLinkId) {

	this._infoBoxId = Dwt.getNextId();

	html[i++] = "<div class='infoBox' id='";
	html[i++] = this._infoBoxId;
	html[i++] = "'>";
    html[i++] = "<table width=100% border='0' cellpadding='0' cellspacing='4'>";
    html[i++] = "<tr valign='top'>";
    html[i++] = "<td class='infoBoxImg'><div class='ImgInformation_32'></div></td>";
    html[i++] = "<td><div class='InfoTitle'><div class='infoTitleClose' id='";
	html[i++] = closeLinkId;
	html[i++] = "'>";
	html[i++] = ZmMsg.close;
	html[i++] = "</div>";
	html[i++] = AjxMessageFormat.format(ZmMsg.aboutShortcuts, [ZmShortcutsPageTabViewCustom.ORG_TEXT[this._organizer]]);
	html[i++] = "</div>";
	html[i++] = AjxMessageFormat.format(ZmMsg.assignShortcuts, [ZmShortcutsPageTabViewCustom.ORG_TEXT_PLURAL[this._organizer]]);
	html[i++] = "<div>";
	var key = ZmShortcutsList._formatKey(ZmShortcutsPageTabViewCustom.SAMPLE_KEY);
	var org = ZmMsg[ZmOrganizer.MSG_KEY[this._organizer]];
	var exampleOrg = ["<i>", ZmShortcutsPageTabViewCustom.SAMPLE_ORG[this._organizer], "</i>"].join("");
	html[i++] = AjxMessageFormat.format(ZmMsg.exampleShortcutIntro, [key, org, exampleOrg]);
	html[i++] = "<ul>";
	var shortcuts = ZmShortcutsPageTabViewCustom.SAMPLE_SHORTCUTS[this._organizer];
	for (var j = 0; j < shortcuts.length; j++) {
		html[i++] = "<li>";
		var propName = [shortcuts[j], "display"].join(".");
		var value = ZmKeys[propName];
		if (value) {
			var keySeqs = ZmKeys[propName].split(/\s*;\s*/);
			var ks = keySeqs[0];
			var parts = ks.split(",");
			var scText = AjxMessageFormat.format(ZmMsg.shortcutExample, [ZmShortcutsList._formatKeySequence(parts[0]),
												 ZmShortcutsList._formatKey(ZmShortcutsPageTabViewCustom.SAMPLE_KEY)]);
			var examplePropName = [shortcuts[j], "example"].join(".");
			var exampleText = ZmKeys[examplePropName];
			if (exampleText) {
				var text = AjxMessageFormat.format(exampleText, [exampleOrg]);
				html[i++] = AjxMessageFormat.format(ZmMsg.shortcutTyping, [scText, text]);
			}
		}
		html[i++] = "</li>";
	}
	html[i++] = "</ul>";
	html[i++] = "</div>";
    html[i++] = "</td></tr></table>";
	html[i++] = "</div>";
	
	return i;
};

ZmShortcutsPageTabViewCustom.prototype._toggleInfoBoxHandler =
function() {
	var infoBox = document.getElementById(this._infoBoxId);
	var visible = Dwt.getVisible(infoBox);
	Dwt.setVisible(infoBox, !visible);
};

ZmShortcutsPageTabViewCustom.prototype._getTableHeaderHtml =
function(html, i) {
	var gotArg = (html && html.length);
	html = html ? html : [];
	i = i ? i : 0;
	
	html[i++] = "<tr>";
	html[i++] = "<th width=";
	html[i++] = ZmShortcutsPageTabViewCustom.COL1_WIDTH;
	html[i++] = ">";
	html[i++] = ZmMsg[ZmOrganizer.MSG_KEY[this._organizer]];
	html[i++] = "</th>";
	html[i++] = "<th width=";
	html[i++] = ZmShortcutsPageTabViewCustom.COL2_WIDTH;
	html[i++] = "><nobr>";
	html[i++] = ZmMsg.shortcut;
	html[i++] = "</nobr></th>";
	html[i++] = "<th width=";
	html[i++] = ZmShortcutsPageTabViewCustom.COL3_WIDTH;
	html[i++] = ">&nbsp;</th>";
	html[i++] = "</tr>";
	
	return gotArg ? i : html.join("");
};

ZmShortcutsPageTabViewCustom.prototype._addButton =
function(parentId, text, width, listener) {
	var button = new DwtButton({parent:this});
	button.setSize(width, Dwt.DEFAULT);
	button.setText(text);
	button.addSelectionListener(listener);
	var element = button.getHtmlElement();
	element.parentNode.removeChild(element);
	var parent = document.getElementById(parentId);
	parent.appendChild(element);
	return button;
};

ZmShortcutsPageTabViewCustom.prototype._buttonListener =
function(ev) {
	var button = ev.item;
	var html = this._getRowHtml();
	var row = Dwt.parseHtmlFragment(html, true);
	this._table.tBodies[0].appendChild(row);
	this._addDwtObjects(row.id);
};

/*
* Displays a table of ID/organizer mappings.
*/
ZmShortcutsPageTabViewCustom.prototype._renderTable =
function() {
	// always pull fresh copy of shortcuts in case accounts have changed
	var kmm = appCtxt.getAppController().getKeyMapMgr();
	var setting = appCtxt.get(ZmSetting.SHORTCUTS);
	var shortcuts = kmm ? ZmShortcut.parse(setting, kmm) : null;

	var org = this._organizer;
	var done = {};
	for (var i = 0, count = shortcuts.length; i < count; i++) {
		var sc = shortcuts[i];
		if (sc.orgType != org || done[sc.num]) { continue; }
		var html = this._getRowHtml(sc);
		var row = Dwt.parseHtmlFragment(html, true);
		this._table.tBodies[0].appendChild(row);
		this._addDwtObjects(row.id);
		done[sc.num] = true;
	}
};

ZmShortcutsPageTabViewCustom.prototype._getRowHtml =
function(shortcut) {

	var org = this._organizer;	// org type
	var rowId = Dwt.getNextId();
	this._inputs[rowId] = {};

	var html = [];
	var i = 0;
	html[i++] = ["<tr id='", rowId, "'>"].join("");

	var button = new DwtButton({parent:this, style:DwtLabel.ALIGN_CENTER});
	var bWidth = AjxEnv.isIE ? ZmShortcutsPageTabViewCustom.COL1_WIDTH - 5 : ZmShortcutsPageTabViewCustom.COL1_WIDTH;
	var bHeight = AjxEnv.isIE ? 24 : Dwt.DEFAULT;
	button.setSize(bWidth, bHeight);
	var organizer = null, value = "";
	if (shortcut) {
		var id = shortcut.arg;
		if (appCtxt.multiAccounts) {
			if (appCtxt.isOffline || !appCtxt.getActiveAccount().isMain)
				id = ZmOrganizer.getSystemId(shortcut.arg);
		}
		organizer = appCtxt.getById(id);
		if (organizer) {
			value = (org == ZmOrganizer.FOLDER) ? organizer.getPath(false, false, null, true, true) :
												  organizer.getName(false, null, true);
			button.setData(ZmShortcutsPageTabViewCustom.DATA, value);
		}
	}
	button.setText(organizer ? value : ZmMsg.browse);
	var id = Dwt.getNextId();
	this._inputs[rowId]["arg"] = {id: id, dwtObj: button};
	button.addSelectionListener(this._browseLstnr);
	button.setScrollStyle(Dwt.CLIP);
	html[i++] = "<td width=";
	html[i++] = ZmShortcutsPageTabViewCustom.COL1_WIDTH;
	html[i++] = " id='";
	html[i++] = id;
	html[i++] = "'></td>";

	id = Dwt.getNextId();
	var value = (shortcut && organizer) ? shortcut.num : null;
	var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: value});
	Dwt.setSize(input.getInputElement(), '100%', Dwt.DEFAULT);
	this._inputs[rowId]["num"] = {id: id, dwtObj: input};
	html[i++] = "<td width=";
	html[i++] = ZmShortcutsPageTabViewCustom.COL2_WIDTH;
	html[i++] = " id='";
	html[i++] = id;
	html[i++] = "'></td>"; 

	var removeId = ["_rem_", rowId].join("");
	this._inputs[rowId]["remove"] = {id: removeId};
	html[i++] = "<td width=";
	html[i++] = ZmShortcutsPageTabViewCustom.COL2_WIDTH;
	html[i++] = "><span id='";
	html[i++] = removeId;
	html[i++] = "' class='removeLink'>";
	html[i++] = ZmMsg.remove;
	html[i++] = "</span></td>";

	html[i++] = "</tr>";

	return html.join("");
};

/*
* Attaches input widgets to the DOM tree based on placeholder IDs.
*
* @param	[string]*	rowId	ID of a single row to add inputs to
*/
ZmShortcutsPageTabViewCustom.prototype._addDwtObjects =
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
			} else if (f == "remove") {
				var el = document.getElementById(field.id);
				el._tabViewId = this._internalId;
				el.onclick = ZmShortcutsPageTabViewCustom._onClick;
			}
		}
	}
};

ZmShortcutsPageTabViewCustom.prototype._removeRow =
function(rowId) {
	var row = document.getElementById(rowId);
	this._table.deleteRow(row.rowIndex);
	delete this._inputs[rowId];
};

ZmShortcutsPageTabViewCustom.prototype._browseListener =
function(ev) {
	var dialog, treeIds, params;
	var button = ev.item;
	if (this._organizer == ZmOrganizer.TAG) {
		dialog = appCtxt.getPickTagDialog();
	} else {
		dialog = appCtxt.getChooseFolderDialog();
		treeIds = [this._organizer];
		var title = (this._organizer == ZmOrganizer.SEARCH) ? ZmMsg.chooseSearch : ZmMsg.chooseFolder;
		var overviewId = [this.toString(), this._organizer].join("-");
		params = {treeIds:treeIds, title:title, overviewId:overviewId, noRootSelect:true};
	}
	dialog.reset();
	dialog.setTitle(ZmShortcutsPageTabViewCustom.DIALOG_TEXT[this._organizer]);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._browseSelectionCallback, this, [ev.item, dialog]);
	dialog.popup(params);
};

/*
* Changes the text of a button to the folder/tag that the user just chose.
*
* @param	[DwtButton]		the browse button
* @param	[ZmOrganizer]	the folder or tag that was chosen
*/
ZmShortcutsPageTabViewCustom.prototype._browseSelectionCallback =
function(button, dialog, organizer) {
	if (organizer) {
		button.setText(organizer.getName(false, null, true));
		var value = (organizer.type == ZmOrganizer.FOLDER) ? organizer.getPath(false, false, null, true, true) :
													 		 organizer.getName(false, null, true);
		button.setData(ZmShortcutsPageTabViewCustom.DATA, value);
	}
	dialog.popdown();
};

ZmShortcutsPageTabViewCustom._onClick =
function(ev) {
	var element = DwtUiEvent.getTargetWithProp(ev, "id");
	var id = element ? element.id : null;

	// if clicked on remove attachment link
	if (id && id.indexOf("_rem_") == 0) {
		var tv = AjxCore.objectWithId(element._tabViewId);
		var rowId = id.substr(5);
		tv._removeRow(rowId);
		return false; // disables following of link
	}

	return true;
};

ZmShortcutsPanel = function() {

	ZmShortcutsPanel.INSTANCE = this;
	DwtControl.call(this, {parent:appCtxt.getShell(), className:"ZmShortcutsPanel", posStyle:Dwt.ABSOLUTE_STYLE});
	if (!this._rendered) {
		this._createHtml();
	}
};

ZmShortcutsPanel.prototype = new DwtControl;
ZmShortcutsPanel.prototype.constructor = ZmShortcutsPanel;

ZmShortcutsPanel.prototype.toString =
function() {
	return "ZmShortcutsPanel";
}

ZmShortcutsPanel.prototype.popup =
function(maps) {
	var list = new ZmShortcutsList({style:ZmShortcutsList.PANEL_STYLE});
	this._contentDiv.innerHTML = list.getContent();
	this._position();
	this.setZIndex(Dwt.Z_DIALOG);
};

ZmShortcutsPanel.prototype.popdown =
function(maps) {
	this.setZIndex(Dwt.Z_HIDDEN);
};

ZmShortcutsPanel.prototype._createHtml =
function() {
	var headerId = [this._htmlElId, "header"].join("_");
	var contentId = [this._htmlElId, "content"].join("_");
	var html = [];
	var i = 0;
	html[i++] = "<div id='" + headerId + "'>";
	html[i++] = "<div class='ShortcutsPanelHeader'>Keyboard Shortcuts</div>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0>";
	html[i++] = "<tr><td class='ShortcutsPanelDescription ShortcutsPanelText' width='70%'>blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah</td>";
	html[i++] = "<td class='ShortcutsPanelLinks ShortcutsPanelText' width='30%'>" +
				"<span onclick='ZmShortcutsPanel.closeCallback();'>Close</span>" +
				"<br />" +
				"<span onclick='ZmShortcutsPanel.newWindowCallback();'>New Window</span></td></tr>";
	html[i++] = "</table>";
	html[i++] = "<hr />";
	html[i++] = "</div>";
	html[i++] = "<div id='" + contentId + "' style='overflow:auto'></div>";

	this.getHtmlElement().innerHTML = html.join("");
	this._headerDiv = document.getElementById(headerId);
	this._contentDiv = document.getElementById(contentId);
	var headerHeight = Dwt.getSize(this._headerDiv).y;
	var h = this.getSize().y - headerHeight;
	Dwt.setSize(this._contentDiv, Dwt.DEFAULT, h - 10);
	this._rendered = true;
};

ZmShortcutsPanel.closeCallback =
function() {
	ZmShortcutsPanel.INSTANCE.popdown();
};

ZmShortcutsPanel.newWindowCallback =
function() {

};
