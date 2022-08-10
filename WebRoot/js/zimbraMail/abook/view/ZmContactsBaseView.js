/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contacts base view classes.
 */

/**
 * Creates the base view.
 * @class
 * This class represents the base view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmListView
 */
ZmContactsBaseView = function(params) {

	if (arguments.length == 0) { return; }

	params.posStyle = params.posStyle || Dwt.ABSOLUTE_STYLE;
	params.type = ZmItem.CONTACT;
	params.pageless = true;
	ZmListView.call(this, params);

	this._handleEventType[ZmItem.GROUP] = true;
};

ZmContactsBaseView.prototype = new ZmListView;
ZmContactsBaseView.prototype.constructor = ZmContactsBaseView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactsBaseView.prototype.toString =
function() {
	return "ZmContactsBaseView";
};

/**
 * Sets the list.
 * 
 * @param	{ZmContactList}		list		the list
 * @param	{String}	sortField		the sort field
 * @param	{String}	folderId		the folder id
 */
ZmContactsBaseView.prototype.set =
function(list, sortField, folderId) {

	if (this._itemsToAdd) {
		this.addItems(this._itemsToAdd);
		this._itemsToAdd = null;
	} else {
		var subList;
		if (list instanceof ZmContactList) {
			// compute the sublist based on the folderId if applicable
			list.addChangeListener(this._listChangeListener);
			// for accounts where gal paging is not supported, show *all* results
			subList = (list.isGal && !list.isGalPagingSupported)
				? list.getVector().clone()
				: list.getSubList(this.offset, this.getLimit(this.offset), folderId);
		} else {
			subList = list;
		}
		this._folderId = folderId;
		DwtListView.prototype.set.call(this, subList, sortField);
	}
	this._setRowHeight();
	this._rendered = true;
};

/**
 * @private
 */
ZmContactsBaseView.prototype._setParticipantToolTip =
function(address) {
	// XXX: OVERLOADED TO SUPPRESS JS ERRORS..
	// XXX: REMOVE WHEN IMPLEMENTED - SEE BASE CLASS ZmListView
};

/**
 * Gets the list view.
 * 
 * @return	{ZmContactsBaseView}	the list view
 */
ZmContactsBaseView.prototype.getListView =
function() {
	return this;
};

/**
 * Gets the title.
 * 
 * @return	{String}	the view title
 */
ZmContactsBaseView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

/**
 * @private
 */
ZmContactsBaseView.prototype._changeListener =
function(ev) {
	var folderId = this._controller.getFolderId();

	// if we dont have a folder, then assume user did a search of contacts
	if (folderId != null || ev.event != ZmEvent.E_MOVE) {
		ZmListView.prototype._changeListener.call(this, ev);

		if (ev.event == ZmEvent.E_MODIFY) {
			this._modifyContact(ev);
			var contact = ev.item || ev._details.items[0];
			if (contact instanceof ZmContact) {
				this.setSelection(contact, false, true);
			}
		} else if (ev.event == ZmEvent.E_CREATE) {
			var newContact = ev._details.items[0];
			var newFolder = appCtxt.getById(newContact.folderId);
			var newFolderId = newFolder && (appCtxt.getActiveAccount().isMain ? newFolder.nId : newFolder.id);
			var visible = ev.getDetail("visible");

			// only add this new contact to the listview if this is a simple
			// folder search and it belongs!
			if (folderId && newFolder && folderId == newFolderId && visible) {
				var index = ev.getDetail("sortIndex");
				var alphaBar = this.parent ? this.parent.getAlphabetBar() : null;
				var inAlphaBar = alphaBar ? alphaBar.isItemInAlphabetLetter(newContact) : true;
				if (index != null && inAlphaBar) {
					this.addItem(newContact, index);
				}

				// always select newly added contact if its been added to the
				// current page of contacts
				if (inAlphaBar) {
					this.setSelection(newContact, false, true);
				}
			}
		} else if (ev.event == ZmEvent.E_DELETE) {
			// bug fix #19308 - do house-keeping on controller's list so
			// replenishment works as it should
			var list = this._controller.getList();
			if (list) {
				list.remove(ev.item);
			}
		}
	}
};

ZmContactsBaseView.prototype.setSelection =
function(item, skipNotify, setPending) {
	if (!item) { return; }

	var el = this._getElFromItem(item);
	if (el) {
		ZmListView.prototype.setSelection.call(this, item, skipNotify);
		this._pendingSelection = null;
	} else if (setPending) {
		this._pendingSelection = {item: item, skipNotify: skipNotify};
	}
};

ZmContactsBaseView.prototype.addItems =
function(itemArray) {
	ZmListView.prototype.addItems.call(this, itemArray);
	if (this._pendingSelection && AjxUtil.indexOf(itemArray, this._pendingSelection.item)!=-1) {
		this.setSelection(this._pendingSelection.item, this._pendingSelection.skipNotify);
	}
}


/**
 * @private
 */
ZmContactsBaseView.prototype._modifyContact =
function(ev) {
	var list = this.getList();
	//the item was updated - the list might be "old" (not pointing to the latest items,
	// since we refreshed the items in the appCtxt cache by a different view. see bug 84226)
	//therefor let's make sure the modified contact replaces the old one in the list.
	var contact = ev.item;
	if (contact) {
		var arr = list.getArray();
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id === contact.id) {
				if (arr[i] === contact) {
					//nothing changed, still points to same object
					break;
				}
				arr[i] = contact;
				//update the viewed contact
				this.parent.setContact(contact);
				break;
			}
		}
	}
	// if fileAs changed, resort the internal list
	// XXX: this is somewhat inefficient. We should just remove this contact and reinsert
	if (ev.getDetail("fileAsChanged")) {
		if (list) {
			list.sort(ZmContact.compareByFileAs);
		}
	}
};

/**
 * @private
 */
ZmContactsBaseView.prototype._setNextSelection =
function() {
	// set the next appropriate selected item
	if (this.firstSelIndex < 0) {
		this.firstSelIndex = 0;
	}

	// get first valid item to select
	var item;
	if (this._list) {
		item = this._list.get(this.firstSelIndex);

		// only get the first non-trash contact to select if we're not in Trash
		if (this._controller.getFolderId() == ZmFolder.ID_TRASH) {
			if (!item) {
				item = this._list.get(0);
			}
		} else if (item == null || (item && item.folderId == ZmFolder.ID_TRASH)) {
			item = null;
			var list = this._list.getArray();

			if (this.firstSelIndex > 0 && this.firstSelIndex == list.length) {
				item = list[list.length-1];
			} else {
				for (var i=0; i < list.length; i++) {
					if (list[i].folderId != ZmFolder.ID_TRASH) {
						item = list[i];
						break;
					}
				}
			}

			// reset first sel index
			if (item) {
				var div = document.getElementById(this._getItemId(item));
				if (div) {
					var data = this._data[div.id];
					this.firstSelIndex = this._list ? this._list.indexOf(data.item) : -1;
				}
			}
		}
	}

	this.setSelection(item);
};

/**
 * Creates the alphabet bar.
 * @class
 * This class represents the contact alphabet bar.
 * 
 * @param {DwtComposite}	parent			the parent
 * 
 * @extends		DwtComposite
 */
ZmContactAlphabetBar = function(parent) {

	DwtComposite.call(this, {parent:parent});

	this._createHtml();

	this._all = this._current = document.getElementById(this._alphabetBarId).rows[0].cells[0];
	this._currentLetter = null;
	this.setSelected(this._all, true);
	this._enabled = true;
	this.addListener(DwtEvent.ONCLICK, this._onClick.bind(this));
};

ZmContactAlphabetBar.prototype = new DwtComposite;
ZmContactAlphabetBar.prototype.constructor = ZmContactAlphabetBar;
ZmContactAlphabetBar.prototype.role = 'toolbar';

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactAlphabetBar.prototype.toString =
function() {
	return "ZmContactAlphabetBar";
};

/**
 * Enables the bar.
 * 
 * @param	{Boolean}	enable		if <code>true</code>, enable the bar
 */
ZmContactAlphabetBar.prototype.enable =
function(enable) {
	this._enabled = enable;

	var alphabetBarEl = document.getElementById(this._alphabetBarId);
	if (alphabetBarEl) {
		alphabetBarEl.className = enable ? "AlphabetBarTable" : "AlphabetBarTable AlphabetBarDisabled";
	}
};

/**
 * Checks if the bar is enabled.
 * 
 * @return	{Boolean}	<code>true</code> if enabled
 */
ZmContactAlphabetBar.prototype.enabled =
function() {
	return this._enabled;
};

/**
 * Resets the bar.
 * 
 * @param	{Object}	useCell		the cell or <code>null</code>
 * @return	{Boolean}				Whether the cell was changed (false if it was already set to useCell)
 */
ZmContactAlphabetBar.prototype.reset =
function(useCell) {
	var cell = useCell || this._all;
	if (cell != this._current) {
		this.setSelected(this._current, false);
		this._current = cell;
		this._currentLetter = useCell && useCell != this._all ? useCell.innerHTML : null;
		this.setSelected(cell, true);
		return true;
	}
	return false;
};

/**
 * Sets the button index.
 * 
 * @param	{int}	index		the index
 */
ZmContactAlphabetBar.prototype.setButtonByIndex =
function(index) {
	var table = document.getElementById(this._alphabetBarId);
	var cell = table.rows[0].cells[index];
	if (cell) {
		this.reset(cell);
	}
};

/**
 * Gets the current cell.
 * 
 * @return	{Object}	the cell
 */
ZmContactAlphabetBar.prototype.getCurrent =
function() {
	return this._current;
};

/**
 * Gets the current cell letter.
 * 
 * @return	{String}	the cell letter, or null for "all"
 */
ZmContactAlphabetBar.prototype.getCurrentLetter =
function() {
	return this._currentLetter;
};

/**
 * Sets the cell as selected.
 * 
 * @param	{Object}	cell	the cell
 * @param	{Boolean}	selected	if <code>true</code>, set as selected
 */
ZmContactAlphabetBar.prototype.setSelected =
function(cell, selected) {
	cell.className = selected
		? "DwtButton-active AlphabetBarCell"
		: "DwtButton AlphabetBarCell";
	cell.setAttribute('aria-selected', selected);
	if (selected) {
		this.getHtmlElement().setAttribute('aria-activedescendant', cell.id);
		this.setFocusElement(cell);
	}
};

/**
 * Sets the cell as selected and performs a new search based on the selection.
 * 
 * @param	{Object}	cell		the cell
 * @param	{String}	letter		the letter to begin the search with
 * @param	{String}	endLetter	the letter to end the search with
 */
ZmContactAlphabetBar.alphabetClicked =
function(cell, letter, endLetter) {
	// get reference to alphabet bar - ugh
	var clc = AjxDispatcher.run("GetContactListController");
	var alphabetBar = clc && clc.getCurrentView() && clc.getCurrentView().getAlphabetBar();
	if (alphabetBar && alphabetBar.enabled()) {
		if (alphabetBar.reset(cell)) {
            letter = letter && String(letter).substr(0,1);
            endLetter = endLetter && String(endLetter).substr(0,1);
			clc.searchAlphabet(letter, endLetter);
        }
	}
};

/**
 * determine if contact belongs in the current alphabet bar.  Used when creating a new contact and not doing a reload --
 * such as new contact group from action menu.
 * @param item  {ZmContact}
 * @return {boolean} true/false if item belongs in alphabet selection
 */
ZmContactAlphabetBar.prototype.isItemInAlphabetLetter =
function(item) {
    var inCurrentBar = false;
	if (item) {
	  if (ZmMsg.alphabet && ZmMsg.alphabet.length > 0) {
		  var all = ZmMsg.alphabet.split(",")[0]; //get "All" for locale
	  }
	  var fileAs = item.getFileAs();
	  var currentLetter = this.getCurrentLetter();
	  if (!currentLetter || currentLetter.toLowerCase() == all) {
		  inCurrentBar = true; //All is selected
	  }
	  else if (currentLetter && fileAs) {
		var itemLetter = String(fileAs).substr(0,1).toLowerCase();
		var cellLetter = currentLetter.substr(0,1).toLowerCase();
		if (itemLetter == cellLetter) {
			inCurrentBar = true;
		}
		else if(AjxStringUtil.isDigit(cellLetter) && AjxStringUtil.isDigit(itemLetter)) {
			//handles "123" in alphabet bar
			inCurrentBar = true;
		}
		else if (currentLetter.toLowerCase() == "a-z" && itemLetter.match("[a-z]")) {
			//handle A-Z cases for certain locales
			inCurrentBar = true;
		}
	  }
  }
  return inCurrentBar;
};

/**
 * @private
 */
ZmContactAlphabetBar.prototype._createHtml =
function() {
	this._alphabetBarId = this._htmlElId + "_alphabet";
	var alphabet = ZmMsg.alphabet.split(",");

	this.startSortMap =
		ZmContactAlphabetBar._parseSortVal(ZmMsg.alphabetSortValue);

	this.endSortMap =
		ZmContactAlphabetBar._parseSortVal(ZmMsg.alphabetEndSortValue);

	var subs = {
		id: 			this._htmlElId,
		alphabet: 		alphabet,
		numLetters: 	alphabet.length
	};

	var element = this.getHtmlElement();
	element.innerHTML = AjxTemplate.expand("abook.Contacts#ZmAlphabetBar", subs);
	this.setAttribute('aria-label', ZmMsg.alphabetLabel);

	AjxUtil.foreach(Dwt.byClassName('AlphabetBarCell', element), (function(cell) {
        this._makeFocusable(cell, true);
        this._setEventHdlrs([ DwtEvent.ONCLICK ], false, cell);
    }).bind(this));
};

ZmContactAlphabetBar.prototype.getInputElement =
function() {
	return this._current;
};

ZmContactAlphabetBar.prototype.getKeyMapName =
function() {
	return DwtKeyMap.MAP_TOOLBAR_HORIZ;
};

ZmContactAlphabetBar.prototype.handleKeyAction =
function(actionCode, ev) {
	var target =
		Dwt.hasClass(ev.target, 'AlphabetBarCell') ? ev.target : this._current;

	switch (actionCode) {
	case DwtKeyMap.PREV:
		var previous = Dwt.getPreviousElementSibling(target);
		if (previous) {
			this.setFocusElement(previous);
		}
		return true;

	case DwtKeyMap.NEXT:
		var next = Dwt.getNextElementSibling(target);
		if (next) {
			this.setFocusElement(next);
		}
		return true;

	case DwtKeyMap.SELECT:
		target.click();
		return true;
	}
};

ZmContactAlphabetBar._parseSortVal =
function(sortVal) {
	if (!sortVal) {
		return {};
	}
	var sortMap = {};
	var values = sortVal.split(",");
	if (values && values.length) {
		for (var i = 0; i < values.length; i++) {
			var parts = values[i].split(":");
			sortMap[parts[0]] = parts[1];
		}
	}
	return sortMap;
};

/**
 * @private
 */
ZmContactAlphabetBar.prototype._onClick =
function(ev) {
	var cell = DwtUiEvent.getTarget(ev);

	if (!Dwt.hasClass(cell, 'AlphabetBarCell') ||
	    !this.enabled() || !this.reset(cell)) {
		return;
	}

	var idx = AjxUtil.indexOf(cell.parentNode.children, cell);
	var alphabet = ZmMsg.alphabet.split(",");

	var startLetter = null, endLetter = null;

	if (idx > 0) {
		startLetter = this.startSortMap[alphabet[idx]] || alphabet[idx].substr(0, 1);

		if (idx < alphabet.length - 1) {
			endLetter = this.endSortMap[alphabet[idx]] || alphabet[idx + 1].substr(0, 1);
		}
	}

	var clc = AjxDispatcher.run("GetContactListController");
	clc.searchAlphabet(startLetter, endLetter);
};


