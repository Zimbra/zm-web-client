/**
* Creates an empty view of the preference pages.
* @constructor
* @class
* This class represents a tabbed view of the preference pages.
*
* @author Enrique Del Campo
* @author Conrad Damon
* @param parent				the containing widget
* @param app				the preferences app
* @param posStyle			positioning style
* @param passwordDialog		a LmChangePasswordDialog
*/
function LmPrefView(parent, app, posStyle, passwordDialog) {

    DwtTabView.call(this, parent, "LmPrefView", posStyle);

	this._parent = parent;
    this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);
	this._app = app;
	this._passwordDialog = passwordDialog;

    this.setScrollStyle(DwtControl.SCROLL);
	this.prefView = new Object();
	this._filtersEnabled = this._appCtxt.get(LmSetting.FILTERS_ENABLED);
	this._rendered = false;
}

LmPrefView.prototype = new DwtTabView;
LmPrefView.prototype.constructor = LmPrefView;

// preference pages
LmPrefView.GENERAL		= 1;
LmPrefView.MAIL			= 2;
LmPrefView.FILTER_RULES	= 3;
LmPrefView.ADDR_BOOK	= 4;
LmPrefView.CALENDAR		= 5;
LmPrefView.VIEWS = [LmPrefView.GENERAL, LmPrefView.MAIL, 
					LmPrefView.FILTER_RULES, LmPrefView.ADDR_BOOK, LmPrefView.CALENDAR];

// list of prefs for each page
LmPrefView.PREFS = new Object();
LmPrefView.PREFS[LmPrefView.GENERAL]	= LmPref.GENERAL_PREFS;
LmPrefView.PREFS[LmPrefView.MAIL]		= LmPref.MAIL_PREFS;
LmPrefView.PREFS[LmPrefView.ADDR_BOOK]	= LmPref.ADDR_BOOK_PREFS;
LmPrefView.PREFS[LmPrefView.CALENDAR]	= LmPref.CALENDAR_PREFS;

// title for the page's tab
LmPrefView.TAB_NAME = new Object();
LmPrefView.TAB_NAME[LmPrefView.GENERAL]			= LmMsg.general;
LmPrefView.TAB_NAME[LmPrefView.MAIL]			= LmMsg.mail;
LmPrefView.TAB_NAME[LmPrefView.FILTER_RULES]	= LmMsg.filterRules;
LmPrefView.TAB_NAME[LmPrefView.ADDR_BOOK]		= LmMsg.contacts;
LmPrefView.TAB_NAME[LmPrefView.CALENDAR]		= LmMsg.calendar;

LmPrefView.prototype.toString =
function () {
    return "LmPrefView";
}

/**
* Displays a set of tabs, one for each preferences page. The first tab will have its
* page rendered.
*/
LmPrefView.prototype.show =
function() {
	if (!this._rendered) {
		for (var i = 0; i < LmPrefView.VIEWS.length; i++) {
			var view = LmPrefView.VIEWS[i];
			if ((view == LmPrefView.FILTER_RULES) && (!this._filtersEnabled)){
				continue;
			}
			if (view == LmPrefView.ADDR_BOOK && 
				(!this._appCtxt.get(LmSetting.CONTACTS_ENABLED))) {
				continue;
			}
			if (view == LmPrefView.CALENDAR && 
				(!this._appCtxt.get(LmSetting.CALENDAR_ENABLED))) {
				continue;
			}
			var viewObj = null;
			
			if (view != LmPrefView.FILTER_RULES) {
				viewObj = new LmPreferencesPage(this._parent, this._app, 
												view, this._passwordDialog);
			} else {
					viewObj = new LmFilterPrefView(this._parent, 
												   this._app._appCtxt);
					var size = this.getSize();
					viewObj.setSize((size.x *.97), (size.y *.97));
			}
			this.prefView[view] = viewObj;
			this.addTab(LmPrefView.TAB_NAME[view], this.prefView[view]);
		}
		this._rendered = true;
	}
}

LmPrefView.prototype.getTitle =
function() {
	if (!this._rendered) return null;
	var tab = this.getActiveView();
	return tab.getTitle();
}

/**
 * For some reason, the filter page, when rendered, resets the height of the
 * pref view div. By intercepting the setBounds call, we will can set the 
 * height of the filter rules view as well.
 */
LmPrefView.prototype.setBounds =
function(x, y, width, height) {
	DwtControl.prototype.setBounds.call(this, x, y, width, height);
	if (this._filtersEnabled) {
		var filterRulesView = this.prefView[LmPrefView.FILTER_RULES];
		if (filterRulesView) {
			filterRulesView.setSize(width *.97, height *.93);
		}
	}
};

/**
* Returns a list of prefs whose values have changed due to user form input.
* Each prefs page is checked in turn. This method can also be used to check 
* simply whether _any_ prefs have changed, in which case it short-circuits as
* soon as it finds one that has changed.
*
* @param dirtyCheck		only check if any prefs have changed
* @param noValidation   true if the caller doesn't want to perform any validation
* @returns				a list of changed prefs, or, optionally, true if any
*						pref has changed
*/
LmPrefView.prototype.getChangedPrefs =
function(dirtyCheck, noValidation) {
	var settings = this._appCtxt.getSettings();
	var list = new Array();
	var errorStr = "";
	for (var i = 0; i < LmPrefView.VIEWS.length; i++) {
		var view = LmPrefView.VIEWS[i];
		if (view == LmPrefView.FILTER_RULES) continue;

		var value;
		var viewPage = this.prefView[view];
		// if the page hasn't rendered, then nothing could have been changed
		// so we'll skip the rest of the checks
		if (!viewPage.hasRendered()) continue;

		var prefs = LmPrefView.PREFS[view];
		for (var j = 0; j < prefs.length; j++) {
			var id = prefs[j];
			var setup = LmPref.SETUP[id];
			var type = setup.displayContainer;
			var validationFunc = setup.validationFunction;
			if (type.indexOf("x_") == 0) // ignore non-form elements			
				continue;
			if (type == "select") {
				var select = viewPage.selects[id];
				if (select){
					value = select.getValue();
				}
			} else {
				var prefId = LmPref.KEY_ID + id;
				var element = document.getElementById(prefId);
				if (!element) continue;
				if (type == "checkbox") {
					value = element.checked ? true : false;
					if (id == LmSetting.SIGNATURE_STYLE)
						value = value ? LmSetting.SIG_INTERNET : LmSetting.SIG_OUTLOOK;
				} else {
					value = element.value;
				}
			}
			// validate 
			var pref = settings.getSetting(id);
			var unchanged = (value == pref.origValue);
			// null and "" are the same string for our purposes
			if (pref.dataType == LmSetting.D_STRING) {
				unchanged = unchanged || ((value == null || value == "") &&
										  (pref.origValue == null || 
										   pref.origValue == ""));
			}

			if (dirtyCheck) {
				if (!unchanged) {
					return true;
				}
			} else if (!unchanged) {
				if (!noValidation && validationFunc) {
					var isValid = validationFunc(value);
					if (!isValid) {
						errorStr += "\n" + 
							LsStringUtil.resolve(setup.errorMessage,value);
					}
				}
				pref.setValue(value);
				list.push(pref);
			}
		}
		// errorStr will only be non-null if noValidation is false
		if (errorStr != "") {
			throw new LsException(errorStr);
		}
	}
	return dirtyCheck ? false : list;
}

/**
* Returns true if any pref has changed.
*/
LmPrefView.prototype.isDirty =
function() {
	if (this._filtersEnabled){
		return (this.getChangedPrefs(true, true) ||
				LmFilterRules.shouldSave());
	} else {
		return (this.getChangedPrefs(true, true));
	}
}
