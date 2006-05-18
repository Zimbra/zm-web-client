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
* Creates an empty view of the preference pages.
* @constructor
* @class
* This class represents a tabbed view of the preference pages.
*
* @author Conrad Damon
*
* @param parent				[DwtControl]				the containing widget
* @param appCtxt			[ZmAppCtxt]					the app context
* @param posStyle			[constant]					positioning style
* @param controller			[ZmPrefController]			prefs controller
* @param passwordDialog		[ZmChangePasswordDialog]	password change dialog
*/
function ZmPrefView(parent, appCtxt, posStyle, controller, passwordDialog) {

    DwtTabView.call(this, parent, "ZmPrefView", posStyle);

	this._parent = parent;
    this._appCtxt = appCtxt;
	this._controller = controller;
	this._passwordDialog = passwordDialog;

    this.setScrollStyle(DwtControl.SCROLL);
	this.prefView = new Object();
	this._hasRendered = false;
};

ZmPrefView.prototype = new DwtTabView;
ZmPrefView.prototype.constructor = ZmPrefView;

// preference pages
ZmPrefView.GENERAL		= 1;
ZmPrefView.MAIL			= 2;
ZmPrefView.FILTER_RULES	= 3;
ZmPrefView.ADDR_BOOK	= 4;
ZmPrefView.CALENDAR		= 5;
ZmPrefView.VIEWS = [ZmPrefView.GENERAL, ZmPrefView.MAIL, 
					ZmPrefView.ADDR_BOOK, ZmPrefView.CALENDAR, ZmPrefView.FILTER_RULES];

// list of prefs for each page
ZmPrefView.PREFS = new Object();
ZmPrefView.PREFS[ZmPrefView.GENERAL]			= ZmPref.GENERAL_PREFS;
ZmPrefView.PREFS[ZmPrefView.MAIL]				= ZmPref.MAIL_PREFS;
ZmPrefView.PREFS[ZmPrefView.ADDR_BOOK]			= ZmPref.ADDR_BOOK_PREFS;
ZmPrefView.PREFS[ZmPrefView.CALENDAR]			= ZmPref.CALENDAR_PREFS;

// title for the page's tab
ZmPrefView.TAB_NAME = new Object();
ZmPrefView.TAB_NAME[ZmPrefView.GENERAL]			= ZmMsg.general;
ZmPrefView.TAB_NAME[ZmPrefView.MAIL]			= ZmMsg.mail;
ZmPrefView.TAB_NAME[ZmPrefView.FILTER_RULES]	= ZmMsg.filterRules;
ZmPrefView.TAB_NAME[ZmPrefView.ADDR_BOOK]		= ZmMsg.contacts;
ZmPrefView.TAB_NAME[ZmPrefView.CALENDAR]		= ZmMsg.calendar;

ZmPrefView.prototype.toString =
function () {
    return "ZmPrefView";
};

/**
* Returns this view's controller.
*/
ZmPrefView.prototype.getController =
function() {
	return this._controller;
};

/**
* Displays a set of tabs, one for each preferences page. The first tab will have its
* page rendered.
*/
ZmPrefView.prototype.show =
function() {
	if (this._hasRendered) return;

	for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
		var view = ZmPrefView.VIEWS[i];

		if ((view == ZmPrefView.FILTER_RULES) && (!this._appCtxt.get(ZmSetting.FILTERS_ENABLED))) continue;
		if (view == ZmPrefView.ADDR_BOOK && (!this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))) continue;
		if (view == ZmPrefView.CALENDAR && (!this._appCtxt.get(ZmSetting.CALENDAR_ENABLED))) continue;

		var viewObj = null;
		if (view == ZmPrefView.FILTER_RULES) {
			viewObj = this._controller.getFilterRulesController().getFilterRulesView();
		} else {
			viewObj = new ZmPreferencesPage(this._parent, this._appCtxt, view, this._controller, this._passwordDialog);
		}

		this.prefView[view] = viewObj;

		this.addTab(ZmPrefView.TAB_NAME[view], this.prefView[view]);
	}
	this._hasRendered = true;
};

ZmPrefView.prototype.reset =
function() {
	for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
		var viewPage = this.prefView[ZmPrefView.VIEWS[i]];
		if (!viewPage) continue; // if feature is disabled, may not have a view page
		if (!viewPage.hasRendered()) continue; // if page hasn't rendered, nothing has changed
		viewPage.reset();
	}
};

ZmPrefView.prototype.getTitle =
function() {
	return this._hasRendered ? this.getActiveView().getTitle() : null;
};

ZmPrefView.prototype.getView =
function(view) {
	return this.prefView[view];
};

/**
* Returns a list of prefs whose values have changed due to user form input.
* Each prefs page is checked in turn. This method can also be used to check 
* simply whether _any_ prefs have changed, in which case it short-circuits as
* soon as it finds one that has changed.
*
* @param dirtyCheck		[boolean]* 		if true, only check if any prefs have changed
* @param noValidation	[boolean]*		if true, don't perform any validation
*/
ZmPrefView.prototype.getChangedPrefs =
function(dirtyCheck, noValidation) {
	var settings = this._appCtxt.getSettings();
	var list = new Array();
	var errorStr = "";
	for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
		var view = ZmPrefView.VIEWS[i];
		if (view == ZmPrefView.FILTER_RULES) continue;

		var viewPage = this.prefView[view];
		if (!viewPage) continue; // if feature is disabled, may not have a view page
		if (!viewPage.hasRendered()) continue; // if page hasn't rendered, nothing has changed

		var prefs = ZmPrefView.PREFS[view];
		for (var j = 0; j < prefs.length; j++) {
			var id = prefs[j];
			var setup = ZmPref.SETUP[id];
			var pre = setup.precondition;
			if (pre && !(this._appCtxt.get(pre))) continue;		
			
			var type = setup ? setup.displayContainer : null;
			if (type == ZmPref.TYPE_PASSWORD) continue; // ignore non-form elements
				
			// check if value has changed
			var value = viewPage.getFormValue(id);
			var pref = settings.getSetting(id);
			var unchanged = (value == pref.origValue);
			// null and "" are the same string for our purposes
			if (pref.dataType == ZmSetting.D_STRING) {
				unchanged = unchanged || ((value == null || value == "") &&
										  (pref.origValue == null || 
										   pref.origValue == ""));
			}

			if (dirtyCheck) {
				if (!unchanged) {
					return true;
				}
			} else if (!unchanged) {
				var maxLength = setup ? setup.maxLength : null
				var validationFunc = setup ? setup.validationFunction : null;
				var isValid = true;
				if (!noValidation && maxLength && (value.length > maxLength)) {
					isValid = false;
				} else if (!noValidation && validationFunc) {
					isValid = validationFunc(value);
				}
				if (!isValid)
					errorStr += "\n" + AjxMessageFormat.format(setup.errorMessage, value);
				pref.setValue(value);
				list.push(pref);
			}
		}
		// errorStr can only be non-null if noValidation is false
		if (errorStr != "") {
			throw new AjxException(errorStr);
		}
	}
	return dirtyCheck ? false : list;
};

/**
* Returns true if any pref has changed.
*/
ZmPrefView.prototype.isDirty =
function() {
	return this.getChangedPrefs(true, true);
};
