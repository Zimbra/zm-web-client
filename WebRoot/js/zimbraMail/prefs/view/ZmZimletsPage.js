/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a Zimlets preference page.
 * @constructor
 * @class ZmZimletsPage
 * This class represents a page that allows the user to enable/disable availbale
 * zimlets. User can see all the simlets those are enabled by admin for his account.
 * Out of these available zimlets user can choose some or all for his account.
 *
 * @author Rajendra Patil
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 * 
 * @extends		ZmPreferencesPage
 * @private
 */
ZmZimletsPage = function(parent, section, controller) {
	ZmPreferencesPage.call(this, parent, section, controller);
	this._zimlets = ZmZimletsPage._getZimlets();
};

ZmZimletsPage.prototype = new ZmPreferencesPage;
ZmZimletsPage.prototype.constructor = ZmZimletsPage;

ZmZimletsPage.prototype.toString =
function () {
	return "ZmZimletsPage";
};

ZmZimletsPage.prototype.reset =
function(){
	var zimlets = this.getZimlets();
	var arr = zimlets._vector.getArray();
	for (var i = 0; i < arr.length; i++) {
		arr[i].restoreStatus();
	}
	this.showMe();
};

ZmZimletsPage.prototype.showMe =
function(){
	ZmPreferencesPage.prototype.showMe.call(this);
	if (this._listView) {
		var s = this._listView.getSelection();
		this._listView.set(this.getZimlets()._vector.clone());
		if (s && s[0]) {
			this._listView.setSelection(s[0]);
		}
	}
};

/**
 * @private
 */
ZmZimletsPage.prototype._setupCustom =
function(id, setup, value) {
	if (id == ZmSetting.CHECKED_ZIMLETS) {
		this._listView = new ZmPrefZimletListView(this, this._controller);
		return this._listView;
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmZimletsPage.prototype.addCommand  =
function(batchCommand) {
	var soapDoc = AjxSoapDoc.create("ModifyZimletPrefsRequest", "urn:zimbraAccount");
	// LDAP supports multi-valued attrs, so don't serialize list
	var zimlets = this.getZimlets()._vector.getArray();
	var settingsObj = appCtxt.getSettings();
	var setting = settingsObj.getSetting(ZmSetting.CHECKED_ZIMLETS);
	var checked = [];
	for (var i = 0; i < zimlets.length; i++) {
		if(zimlets[i].active) {
			checked.push(zimlets[i].name);
		}
		var node = soapDoc.set("zimlet", null);
		node.setAttribute("name", zimlets[i].name);
		node.setAttribute("presence", (zimlets[i].active ? "enabled" : "disabled"));
	}
	setting.setValue(checked);
	batchCommand.addNewRequestParams(soapDoc, null/*callback*/, null);

};

ZmZimletsPage.prototype._reloadZimlets =
function() {
	// reset all zimlets origStatus
	var zimlets = this.getZimlets()._vector.getArray();
	for (var i = 0; i < zimlets.length; i++) {
		zimlets[i].resetStatus();
	}
};

ZmZimletsPage.prototype.getPostSaveCallback =
function() {
	return new AjxCallback(this, this._postSave);
};
ZmZimletsPage.prototype._postSave =
function() {
	if (!this.isDirty()) { return; }

	this._reloadZimlets();

	var cd = appCtxt.getYesNoMsgDialog();
	cd.reset();
	cd.registerCallback(DwtDialog.YES_BUTTON, appCtxt.getSettings()._refreshBrowserCallback, appCtxt.getSettings(), [cd]);
	cd.setMessage(ZmMsg.zimletChangeRestart, DwtMessageDialog.WARNING_STYLE);
	cd.popup();
};

ZmZimletsPage.prototype._isChecked =
function(name) {
	var z = this.getZimlets().getPrefZimletByName(name);
	return (z && z.active);
};

ZmZimletsPage.prototype.isDirty =
function() {
	var allZimlets = this.getZimlets();
	var r = false;
	var arr = allZimlets._vector.getArray();
	for (var i = 0; i < arr.length; i++) {
		if (arr[i]._origStatus != arr[i].active) {
			r = true;
			break;
		}
	}
	return r;
};

/**
 * Gets the zimlet preferences.
 * 
 * @return	{ZmPrefZimlets}	the zimlets
 * 
 * @private
 */
ZmZimletsPage.prototype.getZimlets =
function() {
	if (!this._zimlets) {
		this._zimlets = ZmZimletsPage._getZimlets();
	}
	return this._zimlets;
};

ZmZimletsPage._getZimlets =
function() {
	var allz = appCtxt.get(ZmSetting.ZIMLETS) || [];
	var zimlets = new ZmPrefZimlets();
	for (var i = 0; i <  allz.length; i++) {
		var name = allz[i].zimlet[0].name;
		if (allz[i].zimletContext[0].presence == "mandatory") {
			continue; // skip mandatory zimlets to be shown in prefs
		}
		var desc = allz[i].zimlet[0].description;
		var label = allz[i].zimlet[0].label;
		var isEnabled = allz[i].zimletContext[0].presence == "enabled";
		zimlets.addPrefZimlet(new ZmPrefZimlet(name, isEnabled, desc, label));
	}
	zimlets.sortByName();
	return zimlets;
};


/**
 * ZmPrefZimletListView
 *
 * @param parent
 * @param controller
 */
ZmPrefZimletListView = function(parent, controller) {
	DwtListView.call(this, {
		parent: parent,
		className: "ZmPrefZimletListView",
		headerList: this._getHeaderList(),
		view: ZmId.VIEW_PREF_ZIMLETS
	});

	this._controller = controller;
	this.multiSelectEnabled = false; // single selection only
	this._internalId = AjxCore.assignId(this);
};

ZmPrefZimletListView.COL_ACTIVE	= "ac";
ZmPrefZimletListView.COL_NAME	= "na";
ZmPrefZimletListView.COL_DESC	= "ds";

ZmPrefZimletListView.prototype = new DwtListView;
ZmPrefZimletListView.prototype.constructor = ZmPrefZimletListView;

ZmPrefZimletListView.prototype.toString =
function() {
	return "ZmPrefZimletListView";
};

/**
 * Only show zimlets that have at least one valid action (eg, if the only action
 * is "tag" and tagging is disabled, don't show the rule).
 */
ZmPrefZimletListView.prototype.set =
function(list) {
	this._checkboxIds = [];
	DwtListView.prototype.set.call(this, list);
};

ZmPrefZimletListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmPrefZimletListView.COL_ACTIVE, text:ZmMsg.active, width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
        (new DwtListHeaderItem({field:ZmPrefZimletListView.COL_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),    
		(new DwtListHeaderItem({field:ZmPrefZimletListView.COL_DESC, text:ZmMsg.description}))
	];
};

ZmPrefZimletListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmPrefZimletListView.COL_ACTIVE) {
		html[idx++] = "<input name='checked_zimlets' type='checkbox' ";
		html[idx++] = item.active ? "checked " : "";
		html[idx++] = "id='";
		html[idx++] = item.name;
		html[idx++] = "_zimletCheckbox' _name='";
		html[idx++] = item.name;
		html[idx++] = "' _flvId='";
		html[idx++] = this._internalId;
		html[idx++] = "' onchange='ZmPrefZimletListView._activeStateChange'>";
	}
	else if (field == ZmPrefZimletListView.COL_DESC) {
		html[idx++] = AjxStringUtil.stripTags(item.desc, true);
	}
	else if (field == ZmPrefZimletListView.COL_NAME) {
		html[idx++] = AjxStringUtil.stripTags(item.getNameWithoutPrefix(), true);
	}

	return idx;
};

/**
* Handles click of 'active' checkbox by toggling the rule's active state.
*
* @param ev			[DwtEvent]	click event
*/
ZmPrefZimletListView._activeStateChange =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	var flvId = target.getAttribute("_flvId");
	var flv = AjxCore.objectWithId(flvId);
	var name = target.getAttribute("_name");
	var z = flv.parent.getZimlets().getPrefZimletByName(name);
	if (z) {
		z.active = !z.active;
	}
};

/**
* Override so that we don't change selection when the 'active' checkbox is clicked.
* Also contains a hack for IE for handling a click of the 'active' checkbox, because
* the ONCHANGE handler was only getting invoked on every other checkbox click for IE.
*
* @param clickedEl	[Element]	list DIV that received the click
* @param ev			[DwtEvent]	click event
* @param button		[constant]	button that was clicked
*/
ZmPrefZimletListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
	var target = DwtUiEvent.getTarget(ev);
	var isInput = (target.id.indexOf("_zimletCheckbox") > 0);
	if (isInput) {
		ZmPrefZimletListView._activeStateChange(ev);
	}

	return !isInput;
};

/**
 * Model class to hold the list of PrefZimlets
 */
ZmPrefZimlets = function() {
   ZmModel.call(this, ZmEvent.S_PREF_ZIMLET);
   this._vector = new AjxVector();
   this._zNameHash = {};
};

ZmPrefZimlets.prototype = new ZmModel;
ZmPrefZimlets.prototype.constructor = ZmPrefZimlets;

ZmPrefZimlets.prototype.toString =
function() {
	return "ZmPrefZimlets";
};

ZmPrefZimlets.prototype.addPrefZimlet =
function(zimlet) {
	this._vector.add(zimlet);
	this._zNameHash[zimlet.name] = zimlet;
};

ZmPrefZimlets.prototype.removePrefZimlet =
function(zimlet) {
	delete this._zNameHash[zimlet.name];
	this._vector.remove(zimlet);
};

ZmPrefZimlets.prototype.getPrefZimletByName =
function(name) {
   return this._zNameHash[name];
};

/**
 *
 * @param desc true for desc sorting, false or empty otherwise
 */
ZmPrefZimlets.prototype.sortByName =
function(desc) {
	var r = 0;
	this._vector.sort(function(a,b) {
		var aname = a.getNameWithoutPrefix();
		var bname = b.getNameWithoutPrefix();

		if (aname == bname) {
			r = 0;
		} else if (aname > bname) {
			r = 1;
		} else {
			r = -1;
		}
		return (desc ? -r : r);
	});
};

/**
 * ZmPrefZimlet
 *
 * @param name
 * @param active
 * @param desc
 */
ZmPrefZimlet = function(name, active, desc, label) {
	this.name = name;
	this.active = (active !== false);
	this.desc = desc;
	this.label = label;
	this._origStatus = this.active;
};

ZmPrefZimlet.prototype.getNameWithoutPrefix	=
function() {
	if (this.label != null && this.label.length > 0) {
		return	this.label;
	}

	return this.name.substring(this.name.lastIndexOf("_")+1);
};

ZmPrefZimlet.prototype.resetStatus =
function() {
	this._origStatus = this.active;
};

ZmPrefZimlet.prototype.restoreStatus =
function() {
	this.active = this._origStatus;
};
