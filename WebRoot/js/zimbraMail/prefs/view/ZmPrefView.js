/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
 * Creates an empty view of the preference pages.
 * @constructor
 * @class
 * This class represents a tabbed view of the preference pages.
 *
 * @author Conrad Damon
 *
 * @param parent			[DwtControl]				the containing widget
 * @param posStyle			[constant]					positioning style
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmPrefView = function(parent, posStyle, controller) {

	DwtTabView.call(this, parent, "ZmPrefView", posStyle);

	this._parent = parent;
	this._controller = controller;

	this.setScrollStyle(DwtControl.SCROLL);
	this.prefView = {};
    this._tabId = {};
    this._hasRendered = false;

	this.setVisible(false);
};

ZmPrefView.prototype = new DwtTabView;
ZmPrefView.prototype.constructor = ZmPrefView;

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

	var sections = ZmPref.getPrefSectionArray();
	for (var i = 0; i < sections.length; i++) {
		// does the section meet the precondition?
		var section = sections[i];
		if (!this._controller.checkPreCondition(section)) {
			continue;
		}

		// add section as a tab
		var view;
		if (section.createView) {
			view = section.createView(this._parent, section, this._controller);
		}
		else {
			view = new ZmPreferencesPage(this, section, this._controller);
		}
		this.prefView[section.id] = view;
		var tabId = this.addTab(section.title, view);
        this._tabId[section.id] = tabId;
    }

	this.resetKeyBindings();
	this._hasRendered = true;
	this.setVisible(true);
};

ZmPrefView.prototype.reset =
function() {
	for (var id in this.prefView) {
		var viewPage = this.prefView[id];
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
	for (var id in this.prefView) {
		var viewPage = this.prefView[id];
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
 * This method iterates over the preference pages to see if any
 * of them have actions to perform <em>after</em> saving. If
 * the page has a <code>getPostSaveCallback</code> method and it
 * returns a callback, the pref controller will call it after
 * performing any save. This is done for each page that returns
 * a callback.
 */
ZmPrefView.prototype.getPostSaveCallbacks =
function() {
	var callbacks = [];
	for (var id in this.prefView) {
		var viewPage = this.prefView[id];
		if (viewPage && viewPage.getPostSaveCallback && viewPage.hasRendered()) {
			var callback = viewPage.getPostSaveCallback();
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
* @param prefView		[Object]*			if not null, specific prefView to check instead of all
*/
ZmPrefView.prototype.getChangedPrefs =
function(dirtyCheck, noValidation, batchCommand, prefView) {
	var settings = appCtxt.getSettings();
	var list = [];
	var errorStr = "";
	var sections = ZmPref.getPrefSectionMap();
	var pv = prefView || this.prefView;
	for (var view in pv) {
		var section = sections[view];
		if (section.manageChanges) continue;
        
		var viewPage = pv[view];
		if (!viewPage || (viewPage && !viewPage.hasRendered())) { continue; }

		if (section.manageDirty) {
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
					throw new AjxException(viewPage.getErrorMessage());
				}
			}
			if (!dirtyCheck && batchCommand) {
				pv[view].addCommand(batchCommand);
			}
		}

		var prefs = sections[view] && sections[view].prefs;
		for (var j = 0, count = prefs ? prefs.length : 0; j < count; j++) {
			var id = prefs[j];
			if (!viewPage._prefPresent || !viewPage._prefPresent[id]) { continue; }
			var setup = ZmPref.SETUP[id];
			if (!this._controller.checkPreCondition(setup)) {
				continue;
			}

			var type = setup ? setup.displayContainer : null;
			// ignore non-form elements
			if (type == ZmPref.TYPE_PASSWORD || type == ZmPref.TYPE_CUSTOM) {
				continue;
			}

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
			var pref = (appCtxt.isOffline && appCtxt.multiAccounts && section.id == "GENERAL")
				? appCtxt.getMainAccount().settings.getSetting(id)
				: settings.getSetting(id);
			var origValue = pref.origValue;
			if (setup.approximateFunction) {
				if (setup.displayFunction) {
					origValue = setup.displayFunction(origValue);
				}
				origValue = setup.approximateFunction(origValue);
				if (setup.valueFunction) {
					origValue = setup.valueFunction(origValue);
				}
			}
			
			var unchanged = (value == origValue);
			// null and "" are the same string for our purposes
			if (pref.dataType == ZmSetting.D_STRING) {
				unchanged = unchanged || ((value == null || value == "") &&
										  (origValue == null ||
										   origValue == ""));
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
				if (isValid) {
					pref.setValue(value);
					if (addToList) {
						list.push(pref);
					}
				} else {
					errorStr += "\n" + AjxMessageFormat.format(setup.errorMessage, value);
				}
				this._controller.setDirty(view, true);
			}
		}
		// errorStr can only have a value if noValidation is false
		if (errorStr) {
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

/**
* Selects the section (tab) with the given id.
*/
ZmPrefView.prototype.selectSection =
function(sectionId) {
	this.switchToTab(this._tabId[sectionId]);
};
