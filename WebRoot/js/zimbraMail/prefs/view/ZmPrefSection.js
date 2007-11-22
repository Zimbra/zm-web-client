/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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
 * Creates an empty preferences section of the given type.
 * @constructor
 * @class
 * This class represents a single page of preferences available by selecting one of the
 * preference tabs. During construction, skeletal HTML is created. The preferences
 * aren't added until the page becomes visible.
 *
 * @param parent			[DwtControl]				the containing widget
 * @param view				[constant]					which page we are
 * @param controller		[ZmPrefController]			prefs controller
 */
ZmPrefSection = function(parent, section, controller) {
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");

	this._section = section; // which preferences page we are
	this._controller = controller;
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section.title].join(": ");

	this._rendered = false;
	this._hasRendered = false;
};

ZmPrefSection.prototype = new DwtTabViewPage;
ZmPrefSection.prototype.constructor = ZmPrefSection;

ZmPrefSection.prototype.toString = function () {
    return "ZmPrefSection";
};

//
// Public methods
//

// DwtTabViewPage methods

ZmPrefSection.prototype.showMe = function() {
	Dwt.setTitle(this._title);
    if (this._hasRendered) return;

    // expand section template
    var templateId = this._section.templateId;
    var data = { id: this._htmlElId };
    data.isEnabled = AjxCallback.simpleClosure(this._isEnabled, this, data);
    data.expandField = AjxCallback.simpleClosure(this._expandField, this, data);

    this._contentEl.innerHTML = AjxTemplate.expand(templateId, data);

    // create controls
    var details = ZmPreferencesApp[this._section.id];
    var prefs = details && details.prefs;
    if (prefs) {
        for (var i = 0; i < prefs.length; i++) {
            var settingId = prefs[i];
        }
    }
};

ZmPrefSection.prototype.getTitle =
function() {
	return this._title;
};

//
// Protected methods
//

ZmPrefSection.prototype._isEnabled =
function(data, prefId) {
    return this._controller.checkPreCondition(ZmPref.SETUP[prefId]);
};

ZmPrefSection.prototype._expandField =
function(data, prefId) {
    var templateId = this._section.templateId.replace(/#.*$/, "#"+prefId);
    return AjxTemplate.expand(templateId, data);
};