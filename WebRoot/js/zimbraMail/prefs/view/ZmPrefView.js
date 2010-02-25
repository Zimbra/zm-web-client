/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates an empty view of the preference pages.
 * @constructor
 * @class
 * This class represents a tabbed view of the preference pages.
 *
 * @author Conrad Damon
 *
 * @param {Hash}	params		a hash of parameters
 * @param  {DwtComposite}	parent		the parent widget
 * @param {constant}	posStyle		the positioning style
 * @param {ZmController}	controller	the owning controller
 * 
 * @extends		DwtTabView
 */
ZmPrefView = function(params) {

	params.className = "ZmPrefView";
	DwtTabView.call(this, params);

	this._parent = params.parent;
	this._controller = params.controller;

	this.setScrollStyle(DwtControl.SCROLL);
	this.prefView = {};
	this._tabId = {};
	this._sectionId = {};
	this.hasRendered = false;

	this.setVisible(false);
	this.getTabBar().setVisible(false);
};

ZmPrefView.prototype = new DwtTabView;
ZmPrefView.prototype.constructor = ZmPrefView;

ZmPrefView.prototype.toString =
function () {
	return "ZmPrefView";
};

ZmPrefView.prototype.getController =
function() {
	return this._controller;
};

ZmPrefView.prototype.getSectionForTab =
function(tabKey) {
	var sectionId = this._sectionId[tabKey];
	return ZmPref.getPrefSectionMap()[sectionId];
};

ZmPrefView.prototype.getTabForSection =
function(sectionOrId) {
	var section = (typeof sectionOrId == "string")
		? ZmPref.getPrefSectionMap()[sectionOrId] : sectionOrId;
	var sectionId = section && section.id;
	return this._tabId[sectionId];
};

ZmPrefView.prototype.show =
function() {
	if (this.hasRendered) { return; }

	// add sections that have been registered so far
	var sections = ZmPref.getPrefSectionArray();
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		this._addSection(section);
	}

	// add listener for sections added/removed later...
	var account = appCtxt.isOffline && appCtxt.accountList.mainAccount;
	var setting = appCtxt.getSettings(account).getSetting(ZmSetting.PREF_SECTIONS);
	setting.addChangeListener(new AjxListener(this, this._prefSectionsModified));

	// display
	this.resetKeyBindings();
	this.hasRendered = true;
	this.setVisible(true);
};

ZmPrefView.prototype._prefSectionsModified =
function(evt) {
	var sectionId = evt.getDetails();
	var section = appCtxt.get(ZmSetting.PREF_SECTIONS, sectionId);
	if (section) {
		this._prefSectionAdded(section);
	}
	else {
		this._prefSectionRemoved(sectionId);
	}
};

ZmPrefView.prototype._prefSectionAdded =
function(section) {
	// add section to tabs
	var index = this._getIndexForSection(section.id);
	this._addSection(section, index);

	// create new page pref organizer
	var organizer = ZmPrefPage.createFromSection(section);
	var treeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.PREF_PAGE);
	var tree = treeController.getDataTree();
	var parent = tree.getById(ZmId.getPrefPageId(section.parentId)) || tree.root;
	organizer.pageId = this.getNumTabs();
	organizer.parent = parent;

	// find index within parent's children
	var index = null;
	var children = parent.children.getArray();
	for (var i = 0; i < children.length; i++) {
		if (section.priority < this.getSectionForTab(children[i].pageId).priority) {
			index = i;
			break;
		}
	}
	parent.children.add(organizer, index);

	// notify so that views can be updated
	organizer._notify(ZmEvent.E_CREATE);
};

ZmPrefView.prototype._prefSectionRemoved =
function(sectionId) {
	var index = this._getIndexForSection(sectionId);
	var tree = appCtxt.getTree(ZmOrganizer.PREF_PAGE);
	var organizer = tree && tree.getById(ZmId.getPrefPageId(sectionId));
	if (organizer) {
		organizer.notifyDelete();
	}
};

/**
 * <strong>Note:</strong>
 * This is typically called automatically when adding sections.
 *
 * @param section   [object]    The section to add.
 * @param index     [number]    (Optional) The index where to add.
 * 
 * @private
 */
ZmPrefView.prototype._addSection =
function(section, index) {
	// does the section meet the precondition?
	if (!appCtxt.multiAccounts && !this._controller.checkPreCondition(section)) { return; }

	// create pref page's view
	var view = (section.createView)
		? (section.createView(this, section, this._controller))
		: (new ZmPreferencesPage(this, section, this._controller));
	this.prefView[section.id] = view;
	
	// add section as a tab
	var tabButtonId = ZmId.getTabId(this._controller._currentView, ZmId.getPrefPageId(section.id));
	var tabId = this.addTab(section.title, view, tabButtonId, index);
    this._tabId[section.id] = tabId;
	this._sectionId[tabId] = section.id;
};

ZmPrefView.prototype._getIndexForSection =
function(id) {
	var sections = ZmPref.getPrefSectionArray();
	for (var i = 0; i < sections.length; i++) {
		if (sections[i].id == id) break;
	}
	return i;
};

ZmPrefView.prototype.reset =
function() {
	for (var id in this.prefView) {
		var viewPage = this.prefView[id];
		// if feature is disabled, may not have a view page
		// or if page hasn't rendered, nothing has changed
		if (!viewPage || (viewPage && !viewPage.hasRendered)) { continue; }
		viewPage.reset();
	}
};

ZmPrefView.prototype.resetOnAccountChange =
function() {
	for (var id in this.prefView) {
		this.prefView[id].resetOnAccountChange();
	}
};

ZmPrefView.prototype.getTitle =
function() {
	return (this.hasRendered && this.getActiveView().getTitle());
};

ZmPrefView.prototype.getView =
function(view) {
	return this.prefView[view];
};

/**
 * This method iterates over the preference pages to see if any of them have
 * actions to perform <em>before</em> saving. If the page has a
 * <code>getPreSaveCallback</code> method and it returns a callback, the pref
 * controller will call it before performing any save. This is done for each
 * page that returns a callback.
 * <p>
 * The pre-save callback is passed a callback that <em>MUST</em> be called upon
 * completion of the pre-save code. This is so the page can perform its pre-save
 * behavior asynchronously without the need to immediately return to the pref
 * controller.
 * <p>
 * <strong>Note:</strong>
 * When calling the continue callback, the pre-save code <em>MUST</em> pass a
 * single boolean signifying the success of the the pre-save operation.
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
 *
 * @return	{Array}	an array of {AjxCallback} objects
 */
ZmPrefView.prototype.getPreSaveCallbacks =
function() {
	var callbacks = [];
	for (var id in this.prefView) {
		var viewPage = this.prefView[id];
		if (viewPage && viewPage.getPreSaveCallback && viewPage.hasRendered) {
			var callback = viewPage.getPreSaveCallback();
			if (callback) {
				callbacks.push(callback);
			}
		}
	}
	return callbacks;
};

/**
 * This method iterates over the preference pages to see if any of them have
 * actions to perform <em>after</em> saving. If the page has a
 * <code>getPostSaveCallback</code> method and it returns a callback, the pref
 * controller will call it after performing any save. This is done for each page
 * that returns a callback.
 * 
 * @return	{Array}	an array of {AjxCallback} objects
 */
ZmPrefView.prototype.getPostSaveCallbacks =
function() {
	var callbacks = [];
	for (var id in this.prefView) {
		var viewPage = this.prefView[id];
		var callback = viewPage && viewPage.hasRendered &&
					   viewPage.getPostSaveCallback && viewPage.getPostSaveCallback();
		if (callback) {
			callbacks.push(callback);
		}
	}
	return callbacks;
};

/**
 * Gets the changed preferences. Each prefs page is checked in
 * turn. This method can also be used to check simply whether <em>_any_</em>
 * prefs have changed, in which case it short-circuits as soon as it finds one that has changed.
 *
 * @param {Boolean}	dirtyCheck		if <code>true</code>, only check if any prefs have changed
 * @param {Boolean}	noValidation		if <code>true</code>, don't perform any validation
 * @param {ZmBatchCommand}	batchCommand		if not <code>null</code>, add soap docs to this batch command
 * 
 * @return	{Array|Boolean}	an array of {ZmPref} objects or <code>false</code> if no changed prefs
 */
ZmPrefView.prototype.getChangedPrefs =
function(dirtyCheck, noValidation, batchCommand) {
	var list = [];
	var errors= [];
	var sections = ZmPref.getPrefSectionMap();
	var pv = this.prefView;
	for (var view in pv) {
		var section = sections[view];
		if (!section || (section && section.manageChanges)) { continue; }

		var viewPage = pv[view];
		if (!viewPage || (viewPage && !viewPage.hasRendered)) { continue; }

		if (section.manageDirty) {
			var isDirty = viewPage.isDirty(section, list, errors);
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
				viewPage.addCommand(batchCommand);
			}
		}

		try {
			var result = this._checkSection(section, viewPage, dirtyCheck, noValidation, list, errors, view);
		} catch (e) {
			throw(e);
		}
		if (dirtyCheck && result) {
			return true;
		}
		
		// errors can only have a value if noValidation is false
		if (errors.length) {
			throw new AjxException(errors.join("\n"));
		}
	}
	return dirtyCheck ? false : list;
};

ZmPrefView.prototype._checkSection =
function(section, viewPage, dirtyCheck, noValidation, list, errors, view) {
	var settings = appCtxt.getSettings();
	var prefs = section && section.prefs;
	for (var j = 0, count = prefs ? prefs.length : 0; j < count; j++) {
		var id = prefs[j];
		if (!viewPage._prefPresent || !viewPage._prefPresent[id]) { continue; }
		var setup = ZmPref.SETUP[id];
		if (!this._controller.checkPreCondition(setup)) { continue; }

		var type = setup ? setup.displayContainer : null;
		// ignore non-form elements
		if (type == ZmPref.TYPE_PASSWORD || type == ZmPref.TYPE_CUSTOM) { continue;	}

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
		
		if (this._prefChanged(pref.dataType, origValue, value)) {
			var isValid = true;
			if (!noValidation) {
				var maxLength = setup ? setup.maxLength : null;
				var validationFunc = setup ? setup.validationFunction : null;
				if (!noValidation && maxLength && (value.length > maxLength)) {
					isValid = false;
				} else if (!noValidation && validationFunc) {
					isValid = validationFunc(value);
				}
			}
			if (isValid) {
                if (!dirtyCheck) {
                    if (setup.setFunction) {
                        setup.setFunction(pref, value, list);
                    } else {
                        pref.setValue(value);
                        if (pref.name) {
                            list.push(pref);
                        }
                    }
                }
			} else {
				errors.push(AjxMessageFormat.format(setup.errorMessage, value));
			}
			this._controller.setDirty(view, true);
			if (dirtyCheck) {
				return true;
			}
		}
	}
};

ZmPrefView.prototype._prefChanged =
function(type, origValue, value) {

	var test1 = value || null;
	var test2 = origValue || null;

	if (type == ZmSetting.D_LIST) {
		return !AjxUtil.arrayCompare(test1, test2);
	}
	if (type == ZmSetting.D_HASH) {
		return !AjxUtil.hashCompare(test1, test2);
	}
	return Boolean(test1 != test2);
};

/**
 * Checks if any preference has changed.
 * 
 * @return	{Boolean}	<code>true</code> if any preference has changed
 */
ZmPrefView.prototype.isDirty =
function() {
	return this.getChangedPrefs(true, true);
};

/**
 * Selects the section (tab) with the given id.
 * 
 * @param	{String}	sectionId		the section id
 * 
 */
ZmPrefView.prototype.selectSection =
function(sectionId) {
	this.switchToTab(this._tabId[sectionId]);

	// Mark the correct organizer entry
	var tree = appCtxt.getTree(ZmOrganizer.PREF_PAGE);
	var organizer = tree && tree.getById(ZmId.getPrefPageId(sectionId));
	if (organizer) {
		var treeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.PREF_PAGE);
		var treeView = treeController && treeController.getTreeView(appCtxt.getCurrentApp().getOverviewId());
		if (treeView)
			treeView.setSelected(organizer, true, false);
	}
};
