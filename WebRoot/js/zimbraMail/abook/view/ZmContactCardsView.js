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
 * @overview
 * This file contains the contact cards view class.
 */

/**
 * Creates a contact cards view.
 * @class
 * This class represents a contact cards view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @extends		ZmContactsBaseView
 */
ZmContactCardsView = function(params) {

	params.className = params.className || "ZmContactCardsView";
	params.posStyle = params.posStyle || Dwt.ABSOLUTE_STYLE;
	params.view = ZmId.VIEW_CONTACT_CARDS;
	ZmContactsBaseView.call(this, params);

	this._setMouseEventHdlrs(); // needed by object manager
	// this manages all the detected objects within the view
	this._objectManager = new ZmObjectManager(this);

	// find out if the user's locale has a alphabet defined
	if (ZmMsg.alphabet && ZmMsg.alphabet.length > 0) {
		this._alphabetBar = new ZmContactAlphabetBar(this);
	}

	this.addControlListener(new AjxListener(this, this._controlListener));

	this._addrbookTree = appCtxt.getFolderTree();
	this._addrbookTree.addChangeListener(new AjxListener(this, this._addrbookTreeListener));

	this._normalClass = "ZmContactCard";
	var base = DwtListView.ROW_CLASS;
	this._selectedClass = [base, DwtCssStyle.SELECTED].join("-");
	this._kbFocusClass = [base, DwtCssStyle.FOCUSED].join("-");
	this._dndClass = [base, DwtCssStyle.DRAG_PROXY].join("-");
	this._cardTableId = Dwt.getNextId();
	
	if (AjxEnv.isIE) {
		this._noDndPlusImage = true;
	}
	
	this._initialResized = false;
};

ZmContactCardsView.prototype = new ZmContactsBaseView;
ZmContactCardsView.prototype.constructor = ZmContactCardsView;

ZmContactCardsView.CARD_NAME = "__contactCard__";

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactCardsView.prototype.toString = 
function() {
	return "ZmContactCardsView";
};

/**
 * @private
 */
ZmContactCardsView.prototype.replenish = 
function(list) {
	ZmContactsBaseView.prototype.replenish.call(this, list);
	this._layout();
};

/**
 * lets just try to optimally layout all the cards by not letting base class do its thing
 * 
 * @private
 */
ZmContactCardsView.prototype.setUI =
function(defaultColumnSort) {
	// do nothing
};

/**
 * Sets the cards view contacts.
 * 
 * @param	{Array}	contacts		an array of {@link ZmContact} objects
 * @param	{String}	sortField	the sort field name
 * @param	{String}	folderId	the folder id
 */
ZmContactCardsView.prototype.set = 
function(contacts, sortField, folderId) {

	if (this._objectManager) {
		this._objectManager.reset();
	}

	if (this._itemsToAdd) {
		this._list.addList(this._itemsToAdd);
		this._itemsToAdd = null;
	} else {
		// XXX: optimize later - switch view always forces layout unnecessarily
		ZmContactsBaseView.prototype.set.call(this, contacts, sortField, this._controller.getFolderId());
	}

	if (this._initialResized) {
		this._layout();
	}

	// disable alphabet bar for gal searches
	this._alphabetBar.enable(!contacts.isGal);
};

/**
 * Pretend row height is half since we have two cards to a row.
 *
 * @private
 */
ZmContactCardsView.prototype._setRowHeight =
function() {
	if (!this._rowHeight) {
		ZmContactsBaseView.prototype._setRowHeight.call(this);
		this._rowHeight = this._rowHeight && Math.floor(this._rowHeight / 2);
	}
};

/**
 * Gets the alphabet bar.
 * 
 * @return	{ZmContactAlphabetBar}	the alphabet bar
 */
ZmContactCardsView.prototype.getAlphabetBar =
function() {
	return this._alphabetBar;
};


// Private / protected methods

/**
 * @private
 */
ZmContactCardsView.prototype._generateObject =
function(data, type) {
	return this._objectManager.findObjects(data, true, type);
};

/**
 * @private
 */
ZmContactCardsView.prototype._createItemHtml =
function(contact, params) {

	var isDnd = !!(params && params.isDragProxy);
	var color = contact.addrbook ? contact.addrbook.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];
	var tagCellId;
	var tagIcon;
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		tagCellId = this._getFieldId(contact, ZmItem.F_TAG_CELL);
		var fieldId = this._getFieldId(contact, ZmItem.F_TAG);
		tagIcon = AjxImg.getImageHtml(contact.getTagImageInfo(), null, ["id='", fieldId, "'"].join(""));
	}
	var groupMembers = contact.isGroup() ? contact.getGroupMembers().good.getArray() : null;
	var id = this._getItemId(contact);
	var imgHtml = "";
	if (params && params.isDragProxy) {
		id = id + "_dnd";
		if (AjxEnv.isIE) {
			imgHtml = AjxImg.getImageHtml("RoundPlus", "position:absolute;top:18;left:-11;visibility:hidden");
		}
	}

	var subs = {
		id: id,
		name: ZmContactCardsView.CARD_NAME,
		className: isDnd ? this._dndClass : this._normalClass,
		width: this._cardWidth,
		headerColor: (ZmOrganizer.COLOR_TEXT[color] + "Bg"),
		tagCellId: tagCellId,
		tagIcon: tagIcon,
		groupMembers: groupMembers,
		isDnd: isDnd,
		view: this,
		contact: contact,
		imgHtml: imgHtml
	};
	var html = AjxTemplate.expand("abook.Contacts#CardBase", subs);

	var div = isDnd ? Dwt.parseHtmlFragment(html) : html;
	if (AjxEnv.isIE && params && params.isDragProxy) {
		Dwt.setSize(div, this._cardWidth || 340, 140);
	}
	return div;
};

/**
 * @private
 */
ZmContactCardsView.prototype._layout =
function() {
	this._resetListView();

	if (this._list instanceof AjxVector && this._list.size()) {
		var list = this._list.getArray();
		var subs = {
			id: this._htmlElId,
			cardTableId: this._cardTableId,
			list: list
		};
		var html = AjxTemplate.expand("abook.Contacts#CardsView", subs);
		this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));

		for (var i = 0; i < list.length; i++) {
			var contact = list[i];
			var cid = this._htmlElId + "_contact_" + contact.id;
			var el = document.getElementById(cid);
			if (el) {
				el.innerHTML = this._createItemHtml(contact);
				var div = document.getElementById(this._getItemId(contact));
				this.associateItemWithElement(contact, div);
			}
		}
	} else {
		var subs = {
			id: this._cardTableId
		};
		var html = AjxTemplate.expand("abook.Contacts#CardsView-NoResults", subs);
		this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html));
	}

	this._setRowHeight();
};

/**
 * @private
 */
ZmContactCardsView.prototype._setNoResultsHtml =
function() {
	// overload and ignore
};

/**
 * overload this protected method so we can keep the alphabet bar around
 * 
 * @private
 */
ZmContactCardsView.prototype._resetListView =
function() {
	var cards = document.getElementsByName(ZmContactCardsView.CARD_NAME);
	var cDiv;

	// explicitly remove each child (setting innerHTML causes mem leak)
	for (var i = 0; i < cards.length; i++) {
		cDiv = cards[0].parentNode.removeChild(cards[0]);
		this._data[cDiv.id] = null;
	}

	var cardTable = document.getElementById(this._cardTableId);
	if (cardTable) {
		cardTable.parentNode.removeChild(cardTable);
	}
};

/**
 * @private
 */
ZmContactCardsView.prototype._modifyContact =
function(ev) {
	// always call base class first to resort list if necessary
	ZmContactsBaseView.prototype._modifyContact.call(this, ev);

	// XXX: optimize later - always re-layout no matter which field changed
	this._resetListView();
	this._layout();
};

/**
 * we overload this base class method since cards view is unconventional.
 * 
 * @private
 */
ZmContactCardsView.prototype._getElFromItem = 
function(item) {
	var children = document.getElementsByName(ZmContactCardsView.CARD_NAME);
	var comparisonId = this._getItemId(item);

	for (var i = 0; i < children.length; i++) {
		if (children[i].id == comparisonId) {
			return children[i];
		}
	}
	return null;
};

/**
 * @private
 */
ZmContactCardsView.prototype._setDragProxyState =
function(dropAllowed) {
	if (this._dndImg || !AjxEnv.isLinux) {
		ZmContactsBaseView.prototype._setDragProxyState.call(this, dropAllowed)
	} else if (this._dndProxy) {
		// bug fix #3235 - no opacity for linux
		var addClass = dropAllowed ? DwtCssStyle.DROPPABLE : DwtCssStyle.NOT_DROPPABLE;
		var linuxClass = [addClass, DwtCssStyle.LINUX].join("-");
		var origClass = this._getItemData(this._dndProxy, "origClassName");
		this._dndProxy.className = [origClass, linuxClass].join(" ");
	}
};

/**
 * @private
 */
ZmContactCardsView.prototype._handleResponseLoad =
function(result, contact) {
	var div = document.getElementById(this._getItemId(contact));
	var html = this._createItemHtml(contact);
	var newDiv = Dwt.parseHtmlFragment(html);
	div.innerHTML = newDiv.innerHTML;
};

/**
 * @private
 */
ZmContactCardsView.prototype._getSiblingElement =
function(element, next){
	var item = this.getItemFromElement(this._kbAnchor);
	if (!item) { return element; }
	var index = this._list.indexOf(item);
	if ((next && (index >= this._list.size() - 1)) || (!next && index <= 0)) { return element; }
	index = next ? index + 1 : index - 1;
	var id = this._getItemId(this._list.get(index));
	var el = document.getElementById(id);
	return el ? el : element;
};


// Listeners

/**
 * @private
 */
ZmContactCardsView.prototype._mouseDownListener = 
function(ev) {
	var div = ev.target;

	// bug fix #4595 - dont process mouse down for objects
	if (div.id.indexOf("OBJ_") == 0) {
		this._dragOp = Dwt.DND_DROP_NONE;
		this._dragging = DwtControl._NO_DRAG;
	} else {
		// otherwise, just call base class
		DwtListView.prototype._mouseDownListener.call(this, ev);
	}
};

/**
 * @private
 */
ZmContactCardsView.prototype._changeListener =
function(ev) {
	// need custom handling for delete (can't just remove row)
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		var items = ev.getDetail("items");
		for (var i = 0; i < items.length; i++) {
			this._list.remove(items[i]);
		}
		this._controller._app._checkReplenishListView = this;
		this._layout();
	} else {
		ZmContactsBaseView.prototype._changeListener.call(this, ev);
		this._setNextSelection();
	}
};

/**
 * @private
 */
ZmContactCardsView.prototype._controlListener =
function(ev) {
	if (ev.newWidth < 0 || ev.oldWidth == ev.newWidth) { return; }

	// calc. width of card based on width of window
	this._cardWidth = Math.round((ev.newWidth / 2) - 40);

	this._initialResized = true;
	this._layout();
};

/**
 * @private
 */
ZmContactCardsView.prototype._addrbookTreeListener =
function(ev, treeView) {
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && fields && fields[ZmOrganizer.F_COLOR]) {
		this._layout();
	}
};

// Static methods

/**
 * @private
 */
ZmContactCardsView._loadContact =
function(cell, contactId) {
	var contact = appCtxt.cacheGet(contactId);
	if (contact && !contact.isLoaded) {
		var clc = AjxDispatcher.run("GetContactListController");
		var cardsView = clc.getParentView();
		var callback = new AjxCallback(cardsView, cardsView._handleResponseLoad);
		contact.load(callback);
	}

	// this looks weird, but we're just removing the table row
	cell.parentNode.parentNode.removeChild(cell.parentNode);
};

/**
 * @private
 */
ZmContactCardsView._moreDetailsCallback =
function(contactId) {
	var contact = appCtxt.getById(contactId);
	if (contact) {
		AjxDispatcher.run("GetContactController").show(contact);
	}
};
