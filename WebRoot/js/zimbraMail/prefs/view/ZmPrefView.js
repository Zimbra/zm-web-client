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
* @param passwordDialog		a ZmChangePasswordDialog
*/
function ZmPrefView(parent, app, posStyle, passwordDialog) {

    DwtTabView.call(this, parent, "ZmPrefView", posStyle);

	this._parent = parent;
    this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	this._app = app;
	this._passwordDialog = passwordDialog;

    this.setScrollStyle(DwtControl.SCROLL);
	this.prefView = new Object();
	this._filtersEnabled = this._appCtxt.get(ZmSetting.FILTERS_ENABLED);
	this._rendered = false;
}

ZmPrefView.prototype = new DwtTabView;
ZmPrefView.prototype.constructor = ZmPrefView;

// preference pages
ZmPrefView.GENERAL		= 1;
ZmPrefView.MAIL			= 2;
ZmPrefView.FILTER_RULES	= 3;
ZmPrefView.ADDR_BOOK	= 4;
ZmPrefView.CALENDAR		= 5;
ZmPrefView.VIEWS = [ZmPrefView.GENERAL, ZmPrefView.MAIL, 
					ZmPrefView.FILTER_RULES, ZmPrefView.ADDR_BOOK, ZmPrefView.CALENDAR];

// list of prefs for each page
ZmPrefView.PREFS = new Object();
ZmPrefView.PREFS[ZmPrefView.GENERAL]	= ZmPref.GENERAL_PREFS;
ZmPrefView.PREFS[ZmPrefView.MAIL]		= ZmPref.MAIL_PREFS;
ZmPrefView.PREFS[ZmPrefView.ADDR_BOOK]	= ZmPref.ADDR_BOOK_PREFS;
ZmPrefView.PREFS[ZmPrefView.CALENDAR]	= ZmPref.CALENDAR_PREFS;

// title for the page's tab
ZmPrefView.TAB_NAME = new Object();
ZmPrefView.TAB_NAME[ZmPrefView.GENERAL]			= LmMsg.general;
ZmPrefView.TAB_NAME[ZmPrefView.MAIL]			= LmMsg.mail;
ZmPrefView.TAB_NAME[ZmPrefView.FILTER_RULES]	= LmMsg.filterRules;
ZmPrefView.TAB_NAME[ZmPrefView.ADDR_BOOK]		= LmMsg.contacts;
ZmPrefView.TAB_NAME[ZmPrefView.CALENDAR]		= LmMsg.calendar;

ZmPrefView.prototype.toString =
function () {
    return "ZmPrefView";
}

/**
* Displays a set of tabs, one for each preferences page. The first tab will have its
* page rendered.
*/
ZmPrefView.prototype.show =
function() {
	if (!this._rendered) {
		for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
			var view = ZmPrefView.VIEWS[i];
			if ((view == ZmPrefView.FILTER_RULES) && (!this._filtersEnabled)){
				continue;
			}
			if (view == ZmPrefView.ADDR_BOOK && 
				(!this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))) {
				continue;
			}
			if (view == ZmPrefView.CALENDAR && 
				(!this._appCtxt.get(ZmSetting.CALENDAR_ENABLED))) {
				continue;
			}
			var viewObj = null;
			
			if (view != ZmPrefView.FILTER_RULES) {
				viewObj = new ZmPreferencesPage(this._parent, this._app, 
												view, this._passwordDialog);
			} else {
					viewObj = new ZmFilterPrefView(this._parent, 
												   this._app._appCtxt);
					var size = this.getSize();
					viewObj.setSize((size.x *.97), (size.y *.97));
			}
			this.prefView[view] = viewObj;
			this.addTab(ZmPrefView.TAB_NAME[view], this.prefView[view]);
		}
		this._rendered = true;
	}
}

ZmPrefView.prototype.getTitle =
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
ZmPrefView.prototype.setBounds =
function(x, y, width, height) {
	DwtControl.prototype.setBounds.call(this, x, y, width, height);
	if (this._filtersEnabled) {
		var filterRulesView = this.prefView[ZmPrefView.FILTER_RULES];
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
ZmPrefView.prototype.getChangedPrefs =
function(dirtyCheck, noValidation) {
	var settings = this._appCtxt.getSettings();
	var list = new Array();
	var errorStr = "";
	for (var i = 0; i < ZmPrefView.VIEWS.length; i++) {
		var view = ZmPrefView.VIEWS[i];
		if (view == ZmPrefView.FILTER_RULES) continue;

		var value;
		var viewPage = this.prefView[view];
		// if the page hasn't rendered, then nothing could have been changed
		// so we'll skip the rest of the checks
		if (!viewPage.hasRendered()) continue;

		var prefs = ZmPrefView.PREFS[view];
		for (var j = 0; j < prefs.length; j++) {
			var id = prefs[j];
			var setup = ZmPref.SETUP[id];
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
				var prefId = ZmPref.KEY_ID + id;
				var element = document.getElementById(prefId);
				if (!element) continue;
				if (type == "checkbox") {
					value = element.checked ? true : false;
					if (id == ZmSetting.SIGNATURE_STYLE)
						value = value ? ZmSetting.SIG_INTERNET : ZmSetting.SIG_OUTLOOK;
				} else {
					value = element.value;
				}
			}
			// validate 
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
				if (!noValidation && validationFunc) {
					var isValid = validationFunc(value);
					if (!isValid) {
						errorStr += "\n" + 
							AjxStringUtil.resolve(setup.errorMessage,value);
					}
				}
				pref.setValue(value);
				list.push(pref);
			}
		}
		// errorStr will only be non-null if noValidation is false
		if (errorStr != "") {
			throw new AjxException(errorStr);
		}
	}
	return dirtyCheck ? false : list;
}

/**
* Returns true if any pref has changed.
*/
ZmPrefView.prototype.isDirty =
function() {
	if (this._filtersEnabled){
		return (this.getChangedPrefs(true, true) ||
				ZmFilterRules.shouldSave());
	} else {
		return (this.getChangedPrefs(true, true));
	}
}
