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
*/
ZmPrefView = function(parent, appCtxt, posStyle, controller) {

    DwtTabView.call(this, parent, "ZmPrefView", posStyle);

	ZmPrefView._setViewPrefs();
	
	this._parent = parent;
    this._appCtxt = appCtxt;
	this._controller = controller;

    this.setScrollStyle(DwtControl.SCROLL);
	this.prefView = {};
	this._hasRendered = false;
};

ZmPrefView.prototype = new DwtTabView;
ZmPrefView.prototype.constructor = ZmPrefView;

// preference pages
var i = 1;
ZmPrefView.ADDR_BOOK		 = i++;
ZmPrefView.CALENDAR		 = i++;
ZmPrefView.FILTER_RULES		 = i++;
ZmPrefView.GENERAL		 = i++;
ZmPrefView.IDENTITY		 = i++;
ZmPrefView.MAIL			 = i++;
ZmPrefView.IM			 = i++;
ZmPrefView.POP_ACCOUNTS		 = i++;
ZmPrefView.SHORTCUTS		 = i++;
ZmPrefView.VOICE		 = i++;
delete i;

ZmPrefView.VIEWS = [
	ZmPrefView.GENERAL,
	ZmPrefView.MAIL,
	ZmPrefView.IDENTITY,
	ZmPrefView.POP_ACCOUNTS,
	ZmPrefView.FILTER_RULES,
	ZmPrefView.VOICE,
	ZmPrefView.ADDR_BOOK,
	ZmPrefView.CALENDAR,
	ZmPrefView.IM,
	ZmPrefView.SHORTCUTS
];

// list of prefs for each page
ZmPrefView.PREFS = {};
ZmPrefView._setViewPrefs =
function() {
        ZmPrefView.PREFS[ZmPrefView.ADDR_BOOK]     = ZmPref.ADDR_BOOK_PREFS;
        ZmPrefView.PREFS[ZmPrefView.CALENDAR]      = ZmPref.CALENDAR_PREFS;
        ZmPrefView.PREFS[ZmPrefView.GENERAL]       = ZmPref.GENERAL_PREFS;
        ZmPrefView.PREFS[ZmPrefView.MAIL]          = ZmPref.MAIL_PREFS;
        ZmPrefView.PREFS[ZmPrefView.IM]            = ZmPref.IM_PREFS;
        ZmPrefView.PREFS[ZmPrefView.POP_ACCOUNTS]  = ZmPref.POP_ACCOUNTS_PREFS;
        ZmPrefView.PREFS[ZmPrefView.SHORTCUTS]     = ZmPref.SHORTCUT_PREFS;
};

// title for the page's tab
ZmPrefView.TAB_NAME = {};
ZmPrefView.TAB_NAME[ZmPrefView.ADDR_BOOK]          = ZmMsg.addressBook;
ZmPrefView.TAB_NAME[ZmPrefView.CALENDAR]           = ZmMsg.calendar;
ZmPrefView.TAB_NAME[ZmPrefView.FILTER_RULES]       = ZmMsg.filterRules;
ZmPrefView.TAB_NAME[ZmPrefView.GENERAL]            = ZmMsg.general;
ZmPrefView.TAB_NAME[ZmPrefView.IDENTITY]           = ZmMsg.identitiesTab;
ZmPrefView.TAB_NAME[ZmPrefView.MAIL]               = ZmMsg.mail;
ZmPrefView.TAB_NAME[ZmPrefView.IM]                 = ZmMsg.im;
ZmPrefView.TAB_NAME[ZmPrefView.POP_ACCOUNTS]       = ZmMsg.popAccounts;
ZmPrefView.TAB_NAME[ZmPrefView.SHORTCUTS]          = ZmMsg.shortcuts;
ZmPrefView.TAB_NAME[ZmPrefView.VOICE]              = ZmMsg.voice;

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
		if (view == ZmPrefView.POP_ACCOUNTS && !this._appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) continue;
		if (view == ZmPrefView.SHORTCUTS && !this._appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) continue;
		if (view == ZmPrefView.VOICE && !this._appCtxt.get(ZmSetting.VOICE_ENABLED)) continue;
		if (view == ZmPrefView.IM && !this._appCtxt.get(ZmSetting.IM_ENABLED)) continue;

		var viewObj = null;
		if (view == ZmPrefView.FILTER_RULES) {
			viewObj = this._controller.getFilterRulesController().getFilterRulesView();
		} else if (view == ZmPrefView.SHORTCUTS) {
			viewObj = new ZmShortcutsPage(this._parent, this._appCtxt, view, this._controller);
		} else if (view == ZmPrefView.IDENTITY) {
			viewObj = this._controller.getIdentityController().getListView();
		} else if (view == ZmPrefView.POP_ACCOUNTS) {
			viewObj = AjxDispatcher.run("GetPopAccountsController").getListView();
		} else if (view == ZmPrefView.VOICE) {
			viewObj = AjxDispatcher.run("GetVoicePrefsController").getListView();
		} else {
			viewObj = new ZmPreferencesPage(this._parent, this._appCtxt, view, this._controller);
		}

		this.prefView[view] = viewObj;

		this.addTab(ZmPrefView.TAB_NAME[view], this.prefView[view]);
	}
	this.resetKeyBindings();
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
 * This method iterates over the preference pages to see if any
 * of them have actions to perform <em>before</em> saving. If
 * the page has a <code>getPreSaveCallback</code> method and it
 * returns a callback, the pref controller will call it before
 * performing any save. This is done for each page that returns
 * a callback.
 * <p>
 * The pre-save callback is passed a callback that <em>MUST</em>
 * be called upon completion of the pre-save code. This is so
 * the page can perform its pre-save behavior asynchronously
 * without the need to immediately return to the pref controller.
 * <p>
 * <strong>Note:</strong>
 * When calling the continue callback, the pre-save code <em>MUST</em>
 * pass a single boolean signifying the success of the the pre-save
 * operation.
 * <p>
 * An example pre-save callback implementation:
 * <pre>
 * MyPrefView.prototype.getPreSaveCallback = function() {
 *    return new AjxCallback(this, this._preSaveAction, []);
 * };
 *
 * MyPrefView.prototype._preSaveAction =
 * function(continueCallback, batchCommand) {
 *    var success = true;
 *    // perform some operation
 *    continueCallback.run(success);
 * };
 * </pre>
 */
ZmPrefView.prototype.getPreSaveCallbacks = function() {
    var callbacks = [];
    for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
        var view = ZmPrefView.VIEWS[i];
        var viewPage = this.prefView[view];
        if (viewPage && viewPage.getPreSaveCallback && viewPage.hasRendered()) {
            var callback = viewPage.getPreSaveCallback();
            if (callback) {
                callbacks.push(callback);
            }
        }
    }
    return callbacks;
};

/**
* Returns a list of prefs whose values have changed due to user form input.
* Each prefs page is checked in turn. This method can also be used to check 
* simply whether _any_ prefs have changed, in which case it short-circuits as
* soon as it finds one that has changed.
*
* @param dirtyCheck		[boolean]* 			if true, only check if any prefs have changed
* @param noValidation	[boolean]*			if true, don't perform any validation
* @param batchCommand	[ZmBatchCommand]*	if not null, add soap docs to this batch command
*/
ZmPrefView.prototype.getChangedPrefs =
function(dirtyCheck, noValidation, batchCommand) {
	var settings = this._appCtxt.getSettings();
	var list = [];
	var errorStr = "";
	for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
		var view = ZmPrefView.VIEWS[i];
		if (view == ZmPrefView.FILTER_RULES) continue;

		var viewPage = this.prefView[view];
		if (!viewPage) continue; // if feature is disabled, may not have a view page
		if (!viewPage.hasRendered()) continue; // if page hasn't rendered, nothing has changed

		if (view == ZmPrefView.IDENTITY || view == ZmPrefView.POP_ACCOUNTS || view == ZmPrefView.VOICE) {
			var isDirty = viewPage.isDirty();
			if (isDirty) {
				if (dirtyCheck) {
					return true;
				} else {
					this._controller.setDirty(view, true);
				}
			}
			if (!noValidation) {
				if (!viewPage.validate()) {
					throw new AjxException(viewPage.getErrorMessage(true));
				}
			}
            if (!dirtyCheck && batchCommand) {
				this.prefView[view].addCommand(batchCommand);
			}
		}

		var prefs = ZmPrefView.PREFS[view];
		for (var j = 0, count = prefs ? prefs.length : 0; j < count; j++) {
			var id = prefs[j];
			if (!viewPage._prefPresent[id]) continue;
			var setup = ZmPref.SETUP[id];
			var pre = setup.precondition;
			if (pre && !(this._appCtxt.get(pre))) continue;

			var type = setup ? setup.displayContainer : null;
			if (type == ZmPref.TYPE_PASSWORD) continue; // ignore non-form elements

			// check if value has changed
			try {
				var value = viewPage.getFormValue(id);
			} catch (e) {
				if (dirtyCheck) {
					return true;
				} else {
					throw e;
				}
			}
			var pref = settings.getSetting(id);
			var unchanged = (value == pref.origValue);
			// null and "" are the same string for our purposes
			if (pref.dataType == ZmSetting.D_STRING) {
				unchanged = unchanged || ((value == null || value == "") &&
										  (pref.origValue == null ||
										   pref.origValue == ""));
			}
			// don't try to update on server if it's client-side pref
			var addToList = (!unchanged && (pref.name != null));

			if (dirtyCheck) {
				if (addToList) {
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
				if (!isValid) {
					errorStr += "\n" + AjxMessageFormat.format(setup.errorMessage, value);
				}
				pref.setValue(value);
				if (addToList) {
					list.push(pref);
				}
				this._controller.setDirty(view, true);
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
