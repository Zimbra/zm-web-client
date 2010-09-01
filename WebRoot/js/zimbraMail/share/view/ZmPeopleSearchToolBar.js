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
 * @class
 * @constructor
 * @extends		DwtComposite
 */
ZmPeopleSearchToolBar = function(parent, id) {
	DwtComposite.call(this, {parent:parent, className:"ZmPeopleSearchToolbar", id:id, posStyle:Dwt.ABSOLUTE_STYLE});

	this._createHtml();
};

ZmPeopleSearchToolBar.prototype = new DwtComposite;
ZmPeopleSearchToolBar.prototype.constructor = ZmPeopleSearchToolBar;

// Public methods

ZmPeopleSearchToolBar.prototype.toString =
function() {
	return "ZmPeopleSearchToolBar";
};


// Private methods
ZmPeopleSearchToolBar.prototype._createHtml =
function() {
	this.getHtmlElement().innerHTML = AjxTemplate.expand("share.Widgets#ZmPeopleSearchToolBar", {id:this._htmlElId});

	// add search input field
	var inputFieldId = this._htmlElId + "_inputField";
	var inputField = document.getElementById(inputFieldId);
	if (inputField) {
		this._searchField = new DwtInputField({parent:this, hint:ZmMsg.peopleSearchHint, inputId:ZmId.SEARCH_INPUT});
		var inputEl = this._searchField.getInputElement();
		Dwt.addClass(inputEl, "people_search_input");
		this._searchField.reparentHtmlElement(inputFieldId);
		this._searchField._showHint();
	}
};

ZmPeopleSearchToolBar.prototype.initAutocomplete =
function() {
	var params = {
		parent: appCtxt.getShell(),
		dataClass: (new ZmPeopleSearchAutocomplete()),
		matchValue: ZmAutocomplete.AC_VALUE_EMAIL,
		options: {type:ZmAutocomplete.AC_TYPE_GAL},
		separator: "",
		compCallback: (new AjxCallback(this, this._acCompCallback))
	};
	this._autocomplete = new ZmPeopleAutocompleteListView(params);
	this._autocomplete.handle(this._searchField.getInputElement());
};

ZmPeopleSearchToolBar.prototype._acCompCallback =
function(text, el, match) {
	AjxDispatcher.require(["ContactsCore", "Contacts"]);

	var list = new ZmContactList((new ZmSearch()), true);
	list.add(match.item);

	appCtxt.getApp(ZmApp.CONTACTS).getContactListController().show(list, true);
};
