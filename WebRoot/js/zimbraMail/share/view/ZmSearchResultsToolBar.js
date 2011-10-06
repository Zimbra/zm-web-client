/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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
 * This class represents a search toolbar that shows up above search results. It can be
 * used to refine the search results. Each search term is contained within a bubble that
 * can easily be removed.
 * 
 * @param {hash}			params		a hash of parameters:
 * @param {DwtComposite}	parent		the parent widget
 * @param {string}			id			an explicit ID to use for the control's HTML element
 * 
 * @extends		ZmSearchToolBar
 * 
 * @author Conrad Damon
 */
ZmSearchResultsToolBar = function(params) {

	params.posStyle = Dwt.ABSOLUTE_STYLE;
	params.className = "ZmSearchResultsToolBar";
	ZmSearchToolBar.apply(this, arguments);
	
	this.initAutocomplete();
};

ZmSearchResultsToolBar.prototype = new ZmSearchToolBar;
ZmSearchResultsToolBar.prototype.constructor = ZmSearchResultsToolBar;

ZmSearchResultsToolBar.prototype.isZmSearchResultsToolBar = true;
ZmSearchResultsToolBar.prototype.toString = function() { return "ZmSearchResultsToolBar"; };


ZmSearchResultsToolBar.prototype.TEMPLATE = "share.Widgets#ZmSearchResultsToolBar";

ZmSearchResultsToolBar.prototype._createHtml =
function() {

	this.getHtmlElement().innerHTML = AjxTemplate.expand(this.TEMPLATE, {id:this._htmlElId});
	
	// add search input field
	var inputFieldCellId = this._htmlElId + "_inputFieldCell";
	var inputFieldCell = document.getElementById(inputFieldCellId);
	if (inputFieldCell) {
		var aifParams = {
			parent:					this,
			strictMode:				false,
			bubbleAddedCallback:	this._bubbleChange.bind(this),
			bubbleRemovedCallback:	this._bubbleChange.bind(this)
		}
		var aif = this._searchField = new ZmAddressInputField(aifParams);
		aif.reparentHtmlElement(inputFieldCell);
		
		var inputEl = this._searchField.getInputElement();
		inputEl.className = "search_results_input";
	}
	

	// add search button
	this._button[ZmSearchToolBar.SEARCH_BUTTON] = ZmToolBar.addButton({
				parent:		this, 
				tdId:		"_searchButton",
				buttonId:	ZmId.getButtonId(ZmId.SEARCHRESULTS, ZmId.SEARCHRESULTS_SEARCH),
				lbl:		ZmMsg.search,
				tooltip:	ZmMsg.searchTooltip
			});

	// add save search button if saved-searches enabled
	this._button[ZmSearchToolBar.SAVE_BUTTON] = ZmToolBar.addButton({
				parent:		this, 
				setting:	ZmSetting.SAVED_SEARCHES_ENABLED,
				tdId:		"_saveButton",
				buttonId:	ZmId.getButtonId(ZmId.SEARCHRESULTS, ZmId.SEARCHRESULTS_SAVE),
				lbl:		ZmMsg.save,
				tooltip:	ZmMsg.saveSearchTooltip
			});
};

// TODO: use the main search toolbar's autocomplete list - need to manage location callback
ZmSearchResultsToolBar.prototype.initAutocomplete =
function() {
	if (!this._acList) {
		this._acList = new ZmAutocompleteListView(this._getAutocompleteParams());
		this._acList.handle(this.getSearchField(), this._searchField._htmlElId);
	}
	this._searchField.setAutocompleteListView(this._acList);
	
//	var mainSearchToolbar = appCtxt.getSearchController().getSearchToolbar();
//	var aclv = this._acList = mainSearchToolbar.getAutocompleteListView();
//	var input = this.getSearchField();
//	aclv.handle(input);
//	aclv.addCallback(ZmAutocompleteListView.CB_KEYDOWN, new AjxCallback(this, this._handleKeyDown), input.id);
};

ZmSearchResultsToolBar.prototype._getAutocompleteParams =
function() {
	var params = ZmSearchToolBar.prototype._getAutocompleteParams.apply(this, arguments);
	params.options = { addrBubbles: true };
	return params;
};

ZmSearchResultsToolBar.prototype.setSearch =
function(search) {
	var tokens = search.getTokens();
	var terms = [];
	var noBubbles = false;
	for (var i = 0, len = tokens.length; i < len; i++) {
		var t = tokens[i];
		if (t.type == ZmParsedQuery.TERM) {
			terms.push((t.op == ZmParsedQuery.OP_CONTENT) ? t.arg : t.op + ":" + t.arg);
		}
		else if (t.type == ZmParsedQuery.GROUP) {
			noBubbles = true;
			break;
		}
		else if (t.type == ZmParsedQuery.COND) {
			if (t.op != ZmParsedQuery.COND_AND) {
				noBubbles = true;
				break;
			}
		}
	}
	if (noBubbles) {
		this._searchField.setInputValue(search.query + " ");
	}
	else {
		this._settingSearch = true;
		this._searchField.clear(true);
		for (var i = 0, len = terms.length; i < len; i++) {
			this._searchField.addBubble({address:terms[i]});
		}
		this._settingSearch = false;
	}
};

// Don't let the removal or addition of a bubble when we're setting up trigger another search.
ZmSearchResultsToolBar.prototype._bubbleChange =
function() {
	if (!this._settingSearch) {
		this._handleEnterKeyPress();
	}
};
