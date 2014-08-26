/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty preferences section of the given type.
 * @constructor
 * @class
 * This class represents a single page of preferences available by selecting one of the
 * preference tabs. During construction, skeleton HTML is created. The preferences
 * aren't added until the page becomes visible.
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {constant}	section			the preferences page
 * @param {ZmController}	controller		the prefs controller
 * 
 * @extends		DwtTabViewPage
 * 
 * @private
 */
ZmPrefSection = function(parent, section, controller) {
	DwtTabViewPage.call(this, parent, "ZmPreferencesPage");

	this._section = section;
	this._controller = controller;
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section.title].join(": ");

	this._rendered = false; // for DwtTabViewPage
	this.hasRendered = false;
};

ZmPrefSection.prototype = new DwtTabViewPage;
ZmPrefSection.prototype.constructor = ZmPrefSection;

ZmPrefSection.prototype.toString =
function () {
    return "ZmPrefSection";
};

//
// Public methods
//

// DwtTabViewPage methods

ZmPrefSection.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
    if (this.hasRendered) { return; }

    // expand section template
    var templateId = this._section.templateId;
    var data = { id: this._htmlElId };
    data.isEnabled = AjxCallback.simpleClosure(this._isEnabled, this);
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

/**
 * Gets the title.
 * 
 * @return	{String}		the title
 */
ZmPrefSection.prototype.getTitle =
function() {
	return this._title;
};

//
// Protected methods
//

ZmPrefSection.prototype._isEnabled =
function(prefId) {
    return this._controller.checkPreCondition(ZmPref.SETUP[prefId]);
};

ZmPrefSection.prototype._expandField =
function(data, prefId) {
    var templateId = this._section.templateId.replace(/#.*$/, "#"+prefId);
    return AjxTemplate.expand(templateId, data);
};