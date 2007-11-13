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

ZmContactsBaseView = function(parent, className, posStyle, view, controller, headerList, dropTgt) {

	if (arguments.length == 0) return;
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmListView.call(this, parent, className, posStyle, view, ZmItem.CONTACT, controller, headerList, dropTgt);

	this._handleEventType[ZmItem.GROUP] = true;
};

ZmContactsBaseView.prototype = new ZmListView;
ZmContactsBaseView.prototype.constructor = ZmContactsBaseView;

ZmContactsBaseView.prototype.toString =
function() {
	return "ZmContactsBaseView";
};

ZmContactsBaseView.prototype.set =
function(list, sortField, folderId) {
	var subList;
	if (list instanceof ZmContactList) {
		// compute the sublist based on the folderId if applicable
		list.addChangeListener(this._listChangeListener);
		subList = list.getSubList(this.getOffset(), this.getLimit(), folderId);
	} else {
		subList = list;
	}
	DwtListView.prototype.set.call(this, subList, sortField);
}


ZmContactsBaseView.prototype.paginate =
function(contacts, bPageForward) {
	var offset = this.getNewOffset(bPageForward);
	var subVector = contacts.getSubList(offset, this.getLimit(), this._controller.getFolderId());
	ZmListView.prototype.set.call(this, subVector);
	this.setOffset(offset);
	this.setSelection(this.getList().get(0));
};

ZmContactsBaseView.prototype._setParticipantToolTip =
function(address) {
	// XXX: OVERLOADED TO SUPPRESS JS ERRORS..
	// XXX: REMOVE WHEN IMPLEMENTED - SEE BASE CLASS ZmListView
};

ZmContactsBaseView.prototype.getLimit =
function() {
	return appCtxt.get(ZmSetting.CONTACTS_PER_PAGE);
};

ZmContactsBaseView.prototype.getListView =
function() {
	return this;
};

ZmContactsBaseView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.contacts].join(": ");
};

ZmContactsBaseView.prototype._changeListener =
function(ev) {
	var folderId = this._controller.getFolderId();

	// if we dont have a folder, then assume user did a search of contacts
	if (folderId != null || ev.event != ZmEvent.E_MOVE)
	{
		ZmListView.prototype._changeListener.call(this, ev);

		if (ev.event == ZmEvent.E_MODIFY)
		{
			this._modifyContact(ev);
		}
		else if (ev.event == ZmEvent.E_CREATE)
		{
			var newContact = ev._details.items[0];

			// only add this new contact to the listview if this is a simple
			// folder search and it belongs!
			if (folderId && folderId == newContact.folderId) {
				var subVector = ev.source.getSubList(this.getOffset(), this.getLimit(), folderId);
				ZmListView.prototype.set.call(this, subVector);

				// only relayout if this is cards view
				if (this instanceof ZmContactCardsView)
					this._layout();

				// always select newly added contact if its been added to the
				// current page of contacts
				this.setSelection(newContact);
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

ZmContactsBaseView.prototype._modifyContact =
function(ev) {
	// if fileAs changed, resort the internal list
	// XXX: this is somewhat inefficient. We should just remove this contact and reinsert
	if (ev.getDetail("fileAsChanged"))
		this.getList().sort(ZmContact.compareByFileAs);
};

ZmContactsBaseView.prototype._setNextSelection =
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;

	// get first valid item to select
	var item = this._list.get(this._firstSelIndex);
	if (item == null || (item && item.folderId == ZmFolder.ID_TRASH)) {
		// get the first non-trash contact to select
		item = null;
		var list = this._list.getArray();

		if (this._firstSelIndex > 0 && this._firstSelIndex == list.length) {
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
			this._firstSelIndex = div ? this._list.indexOf(AjxCore.objectWithId(Dwt.getAttr(div, "_itemIndex"))) : -1;
		}
	}

	if (item) {
		this.setSelection(item);
	}
};

	
ZmContactAlphabetBar = function(parent) {

	DwtComposite.call(this, parent);

	this._createHtml();

	this._all = this._current = document.getElementById(this._alphabetBarId).rows[0].cells[0];
	this.setSelected(this._all, true);
	this._enabled = true;
};

ZmContactAlphabetBar.prototype = new DwtComposite;
ZmContactAlphabetBar.prototype.constructor = ZmContactAlphabetBar;

ZmContactAlphabetBar.prototype.toString =
function() {
	return "ZmContactAlphabetBar";
};

ZmContactAlphabetBar.prototype.enable =
function(enable) {
	this._enabled = enable;

	var alphabetBarEl = document.getElementById(this._alphabetBarId);
	if (alphabetBarEl) {
		alphabetBarEl.className = enable ? "AlphabetBarTable" : "AlphabetBarTable AlphabetBarDisabled";
	}
};

ZmContactAlphabetBar.prototype.enabled =
function() {
	return this._enabled;
};

ZmContactAlphabetBar.prototype.reset =
function(useCell) {
	var cell = useCell || this._all;

	this.setSelected(this._current, false);
	this._current = cell;
	this.setSelected(cell, true);
};

ZmContactAlphabetBar.prototype.setButtonByIndex =
function(index) {
	var table = document.getElementById(this._alphabetBarId);
	var cell = table.rows[0].cells[index];
	if (cell) {
		this.reset(cell);
	}
};

ZmContactAlphabetBar.prototype.getCurrent =
function() {
	return this._current;
};

ZmContactAlphabetBar.prototype.setSelected =
function(cell, selected) {
	cell.className = selected
		? "DwtButton-active AlphabetBarCell"
		: "DwtButton AlphabetBarCell";
};

ZmContactAlphabetBar.prototype._createHtml =
function() {
	this._alphabetBarId = this._htmlElId + "_alphabet";
	var alphabet = ZmMsg.alphabet.split(",");

	var subs = {
		id: 		this._htmlElId,
		alphabet: 	alphabet,
		numLetters: alphabet.length
	};

	this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#ZmAlphabetBar", subs);
};

ZmContactAlphabetBar._alphabetClicked =
function(cell, letter, endLetter) {
	// get reference to alphabet bar - ugh
	var clc = AjxDispatcher.run("GetContactListController");
	var alphabetBar = clc.getParentView().getAlphabetBar();
	if (alphabetBar.enabled()) {
		alphabetBar.reset(cell);
		clc.searchAlphabet(letter, endLetter);
	}
};

ZmContactAlphabetBar._onMouseOver =
function(cell) {
	// get reference to alphabet bar - ugh
	var alphabetBar = AjxDispatcher.run("GetContactListController").getParentView().getAlphabetBar();
	if (alphabetBar.enabled()) {
		cell.className = "DwtButton-hover AlphabetBarCell";
	}
};

ZmContactAlphabetBar._onMouseOut =
function(cell) {
	// get reference to alphabet bar - ugh
	var alphabetBar = AjxDispatcher.run("GetContactListController").getParentView().getAlphabetBar();
	if (alphabetBar.enabled()) {
		alphabetBar.setSelected(cell, cell == alphabetBar.getCurrent());
	}
};
