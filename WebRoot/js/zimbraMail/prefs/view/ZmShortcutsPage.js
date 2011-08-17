/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
 * @param {DwtControl}	parent			the containing widget
 * @param {object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 * 
 * @extends		ZmPreferencesPage
 * 
 * @private
 */
ZmShortcutsPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
};

ZmShortcutsPage.prototype = new ZmPreferencesPage;
ZmShortcutsPage.prototype.constructor = ZmShortcutsPage;

ZmShortcutsPage.prototype.toString =
function () {
    return "ZmShortcutsPage";
};

ZmShortcutsPage.prototype._createControls =
function() {

	var button = new DwtButton({parent:this});
	button.setText(ZmMsg.print);
	var printButtonId = this._htmlElId + "_SHORTCUT_PRINT";
	var buttonDiv = document.getElementById(printButtonId);
	buttonDiv.appendChild(button.getHtmlElement());
	button.addSelectionListener(new AjxListener(this, this._printListener));

	var col1 = {};
	col1.title = ZmMsg.shortcutsApp;
	col1.type = ZmShortcutList.TYPE_APP;
	col1.sort = true;
	var list = new ZmShortcutList({style:ZmShortcutList.PREFS_STYLE, cols:[col1, ZmShortcutList.COL_SYS]});
	var listId = this._htmlElId + "_SHORTCUT_LIST";
	var listDiv = document.getElementById(listId);
	listDiv.innerHTML = list.getContent();

	ZmPreferencesPage.prototype._createControls.call(this);
};

ZmShortcutsPage.prototype._printListener =
function() {
	var args = "height=650,width=820,location=no,menubar=yes,resizable=yes,scrollbars=yes,toolbar=no";
	var newWin = window.open("", "_blank", args);

	var col1 = {}, col2 = {};
	col1.type = col2.type = ZmShortcutList.TYPE_APP;
	col1.maps = ["global", "mail"];
	col2.omit = ["global", "mail"];
	col2.sort = true;

	var list = new ZmShortcutList({style:ZmShortcutList.PRINT_STYLE, cols:[col1, col2, ZmShortcutList.COL_SYS]});

	var html = [], i = 0;
	html[i++] = "<html><head>";
	html[i++] = "<link href='"+appContextPath+"/css/zm.css' rel='stylesheet' type='text/css' />";
	html[i++] = "</head><body>";
	html[i++] = "<div class='ShortcutsPrintHeader'>" + ZmMsg.keyboardShortcuts + "</div>";

	var doc = newWin.document;
	doc.write(html.join(""));

	var content = list.getContent();
	doc.write(content);
	doc.write("</body></html>");

	doc.close();
};


/**
 * Displays shortcuts in some sort of list.
 * 
 * @param params
 * @private
 */
ZmShortcutList = function(params) {

	this._style = params.style;
	this._content = this._renderShortcuts(params.cols);
};

ZmShortcutList.prototype = new DwtControl;
ZmShortcutList.prototype.constructor = ZmShortcutList;

ZmShortcutList.PREFS_STYLE = "prefs";
ZmShortcutList.PRINT_STYLE = "print";
ZmShortcutList.PANEL_STYLE = "panel";

ZmShortcutList.TYPE_APP = "APP";
ZmShortcutList.TYPE_SYS = "SYS";

ZmShortcutList.COL_SYS = {};
ZmShortcutList.COL_SYS.title = ZmMsg.shortcutsSys;
ZmShortcutList.COL_SYS.type = ZmShortcutList.TYPE_SYS;
ZmShortcutList.COL_SYS.sort = true;
ZmShortcutList.COL_SYS.maps = ["button", "menu", "list", "tree", "dialog", "toolbarHorizontal",
							   "toolbarVertical", "editor", "tabView"];

ZmShortcutList.prototype.getContent =
function() {
	return this._content;
};

/**
 * Displays shortcut documentation as a set of columns.
 *
 * @param cols		[array]		list of columns; each column may have:
 *        maps		[array]*	list of maps to show in this column; if absent, show all maps
 *        omit		[array]*	list of maps not to show; all others are shown
 *        title		[string]*	text for column header
 *        type		[constant]	app or sys
 *        sort		[boolean]*	if true, sort list of maps based on .sort values in props file
 *        
 * @private
 */
ZmShortcutList.prototype._renderShortcuts =
function(cols) {
	var html = [];
	var i = 0;
	html[i++] = "<div class='ZmShortcutList'>";
    html[i++] = "<table cellspacing=10 cellpadding=0 border=0>";
	if (cols[0].title) {
		html[i++] = "<tr>";
		var style = ZmShortcutList._getClass("shortcutListType", this._style);
		for (j = 0; j < cols.length; j++) {
			html[i++] = "<td><div class='" + style + "'>" + cols[j].title + "</div></td>";
		}
		html[i++] = "</tr>";
	}
	html[i++] = "<tr>";
	for (j = 0; j < cols.length; j++) {
		i = this._getKeysHtml(cols[j], html, i);
	}
    html[i++] = "</tr></table>";
	html[i++] = "</div>";

	return html.join("");
};

ZmShortcutList.prototype._getKeysHtml =
function(params, html, i) {
	var keys = (params.type == ZmShortcutList.TYPE_APP) ? ZmKeys : AjxKeys;
	var kmm = appCtxt.getKeyboardMgr().__keyMapMgr;
	var mapDesc = {}, mapsFound = [], mapsHash = {}, keySequences = {}, mapsToShow = {}, mapsToOmit = {};
	if (params.maps) {
		for (var k = 0; k < params.maps.length; k++) {
			mapsToShow[params.maps[k]] = true;
		}
	}
	if (params.omit) {
		for (var k = 0; k < params.omit.length; k++) {
			mapsToOmit[params.omit[k]] = true;
		}
	}
	for (var propName in keys) {
		var propValue = keys[propName];
		if (!propValue || (typeof propValue != "string")) { continue; }
		var parts = propName.split(".");
		var map = parts[0];
        if ((params.maps && !mapsToShow[map]) || (params.omit && mapsToOmit[map])) { continue; }
		var isMap = (parts.length == 2);
		var action = isMap ? null : parts[1];
		var field = parts[parts.length - 1];

		if (action && (map != ZmKeyMap.MAP_CUSTOM)) {
			// make sure shortcut is defined && available
			var mapInt = ZmKeyMap.MAP_NAME[map] || DwtKeyMap.MAP_NAME[map];
			var ks = kmm.getKeySequences(mapInt, action);
			if (!(ks && ks.length)) { continue; }
		}
		if (field == "description") {
			if (isMap) {
				mapsFound.push(map);
				mapsHash[map] = true;
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
	var maps = [];
	if (params.sort || !params.maps) {
		mapsFound.sort(sortFunc);
		maps = mapsFound;
	} else {
		for (var j = 0; j < params.maps.length; j++) {
			var map = params.maps[j];
			if (mapsHash[map]) {
				maps.push(map);
			}
		}
	}
	
	var or = [" ", ZmMsg.or, " "].join("");
    html[i++] = "<td valign='top'>";
	for (var j = 0; j < maps.length; j++) {
		var map = maps[j];
		if (!keySequences[map]) { continue; }
        html[i++] = "<table class='" + ZmShortcutList._getClass("shortcutListTable", this._style) + "' cellspacing=0 cellpadding=0>";
		if (this._style == ZmShortcutList.PANEL_STYLE || this._style == ZmShortcutList.PRINT_STYLE) {
			html[i++] = "<colgroup><col width=100></col><col width=140></col></colgroup>";
		}
		html[i++] = "<tr><td class='" + ZmShortcutList._getClass("shortcutListHeaderTd", this._style) + "' colspan=2>";
        html[i++] = "<div class='" + ZmShortcutList._getClass("shortcutListHeader", this._style) + "'>";
		var mapDesc = keys[[map, "description"].join(".")];
		html[i++] = mapDesc;
		html[i++] = "</div></td></tr>";

		var actions = keySequences[map];
		if (actions && actions.length) {
			actions.sort(sortFunc);
			for (var k = 0; k < actions.length; k++) {
				var action = actions[k];
				var ks = keys[[action, "display"].join(".")];
				var desc = keys[[action, "description"].join(".")];

				html[i++] = "<tr><td class='" + ZmShortcutList._getClass("shortcutKeys", this._style) + "'>";
				var keySeq = ks.split(/\s*;\s*/);
				var keySeq1 = [];
				for (var m = 0; m < keySeq.length; m++) {
					 keySeq1.push(ZmShortcutList._formatKeySequence(keySeq[m], this._style));
				}
				html[i++] = keySeq1.join(or);
				html[i++] = "</span></td>";
				html[i++] = "<td class='" + ZmShortcutList._getClass("shortcutDescription", this._style) + "'>";
				html[i++] = desc;
				html[i++] = "</td></tr>";

			}
		}
        html[i++] = "</table>";
	}
    html[i++] = "</td>";

	return i;
};

// Translates a key sequence into a friendlier, more readable version
ZmShortcutList._formatKeySequence =
function(ks, style) {

	var html = [];
	var i = 0;
	html[i++] = "<span class='" + ZmShortcutList._getClass("shortcutKeyCombo", style) + "'>";

	var keys = (ks[ks.length - 1] != DwtKeyMap.SEP) ? ks.split(DwtKeyMap.SEP) : [ks];
	for (var j = 0; j < keys.length; j++) {
		var key = keys[j];
		var parts = key.split(DwtKeyMap.JOIN);
		var baseIdx = parts.length - 1;
		// base can be: printable char or escaped char name (eg "Comma")
		var base = parts[baseIdx];
		if (ZmKeyMap.ENTITY[base]) {
			base = ZmKeyMap.ENTITY[base];
		}
		parts[baseIdx] = base;
		var newParts = [];
		for (var k = 0; k < parts.length; k++) {
			newParts.push(ZmShortcutList._formatKey(parts[k], style));
		}
		html[i++] = newParts.join("+");
	}
	html[i++] = "</span>";

	return html.join("");
};

ZmShortcutList._formatKey =
function(key, style) {
	return ["<span class='", ZmShortcutList._getClass("shortcutKey", style), "'>", key, "</span>"].join("");
};

/**
 * Returns a string with two styles in it, a base style and a specialized one, eg
 * "shortcutListHeader shortcutListHeader-prefs".
 *
 * @param base		[string]	base style
 * @param style		[string]	style modifier
 * 
 * @private
 */
ZmShortcutList._getClass =
function(base, style) {
	return [base, [base, style].join("-")].join(" ");
};


ZmShortcutsPanel = function() {

	ZmShortcutsPanel.INSTANCE = this;
	var className = appCtxt.isChildWindow ? "ZmShortcutsWindow" : "ZmShortcutsPanel";
	DwtControl.call(this, {parent:appCtxt.getShell(), className:className, posStyle:Dwt.ABSOLUTE_STYLE});

	this._createHtml();

	this._tabGroup = new DwtTabGroup(this.toString(), true);
	this._tabGroup.addMember(this);
};

ZmShortcutsPanel.prototype = new DwtControl;
ZmShortcutsPanel.prototype.constructor = ZmShortcutsPanel;

ZmShortcutsPanel.prototype.toString =
function() {
	return "ZmShortcutsPanel";
}

ZmShortcutsPanel.prototype.popup =
function(cols) {
	var kbMgr = appCtxt.getKeyboardMgr();
	kbMgr.pushDefaultHandler(this);
	this._cols = cols;
	Dwt.setZIndex(appCtxt.getShell()._veilOverlay, Dwt.Z_VEIL);
	var list = new ZmShortcutList({style:ZmShortcutList.PANEL_STYLE, cols:cols});
	this._contentDiv.innerHTML = list.getContent();
	if (!appCtxt.isChildWindow) {
		this._position();
	}
	this._contentDiv.scrollTop = 0;
	kbMgr.pushTabGroup(this._tabGroup);
};

ZmShortcutsPanel.prototype.popdown =
function(maps) {
	var kbMgr = appCtxt.getKeyboardMgr();
	kbMgr.popTabGroup(this._tabGroup);
	this.setLocation(Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE);
	Dwt.setZIndex(appCtxt.getShell()._veilOverlay, Dwt.Z_HIDDEN);
	kbMgr.popDefaultHandler();
};

ZmShortcutsPanel.prototype.handleKeyEvent =
function() {
	ZmShortcutsPanel.closeCallback();
	return false;
};

ZmShortcutsPanel.prototype._createHtml =
function() {
	var headerId = [this._htmlElId, "header"].join("_");
	var contentId = [this._htmlElId, "content"].join("_");
	var html = [];
	var i = 0;
	html[i++] = "<div id='" + headerId + "'>";
	html[i++] = "<div class='ShortcutsPanelHeader'>" + ZmMsg.keyboardShortcuts + "</div>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0>";
	html[i++] = "<tr><td class='ShortcutsPanelDescription ShortcutsPanelText' width='70%'>" + ZmMsg.shortcutsCurrent + "</td>";
	html[i++] = "<td class='ShortcutsPanelLinks ShortcutsPanelText' width='30%'>" +
				"<span class='ShortcutsPanelLink' onclick='ZmShortcutsPanel.closeCallback();'>" + ZmMsg.close + "</span>";
	if (!appCtxt.isChildWindow) {
		html[i++] = "<br /><span class='ShortcutsPanelLink' onclick='ZmShortcutsPanel.newWindowCallback();'>" + ZmMsg.newWindow + "</span></td></tr>";
	}
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
	this.setZIndex(Dwt.Z_DIALOG);	
};

ZmShortcutsPanel.closeCallback =
function() {
	if (appCtxt.isChildWindow) {
		window.close();
	} else {
		ZmShortcutsPanel.INSTANCE.popdown();
	}
};

ZmShortcutsPanel.newWindowCallback =
function() {
	var newWinObj = appCtxt.getNewWindow(false, 820, 650);
	newWinObj.command = "shortcuts";
	newWinObj.params = {cols:ZmShortcutsPanel.INSTANCE._cols};
	ZmShortcutsPanel.closeCallback();
};
