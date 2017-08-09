/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact split view class.
 */

/**
 * Creates a contact split view.
 * @class
 * This class represents the contact split view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @extends	DwtComposite
 */
ZmContactSplitView = function(params) {
	if (arguments.length == 0) { return; }

	params.className = params.className || "ZmContactSplitView";
	params.posStyle = params.posStyle || Dwt.ABSOLUTE_STYLE;
	params.id = Dwt.getNextId('ZmContactSplitView_');
	DwtComposite.call(this, params);

	this._controller = params.controller;
	this.setScrollStyle(Dwt.CLIP);

	this._changeListener = new AjxListener(this, this._contactChangeListener);

	this._initialize(params.controller, params.dropTgt);

	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.addChangeListener(new AjxListener(this, this._addrbookTreeListener));
	}

	ZmTagsHelper.setupListeners(this);

};

ZmContactSplitView.prototype = new DwtComposite;
ZmContactSplitView.prototype.constructor = ZmContactSplitView;

ZmContactSplitView.prototype.isZmContactSplitView = true
ZmContactSplitView.prototype.toString = function() { return "ZmContactSplitView"; };

// Consts
ZmContactSplitView.ALPHABET_HEIGHT = 35;

ZmContactSplitView.NUM_DL_MEMBERS = 10;	// number of distribution list members to show initially

ZmContactSplitView.LIST_MIN_WIDTH = 100;
ZmContactSplitView.CONTENT_MIN_WIDTH = 200;

ZmContactSplitView.SUBSCRIPTION_POLICY_ACCEPT = "ACCEPT";
ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT = "REJECT";
ZmContactSplitView.SUBSCRIPTION_POLICY_APPROVAL = "APPROVAL";

/**
 * Gets the list view.
 * 
 * @return	{ZmContactSimpleView}	the list view
 */
ZmContactSplitView.prototype.getListView =
function() {
	return this._listPart;
};

/**
 * Gets the controller.
 * 
 * @return	{ZmContactController}	the controller
 */
ZmContactSplitView.prototype.getController =
function() {
	return this._controller;
};

/**
 * Gets the alphabet bar.
 * 
 * @return	{ZmContactAlphabetBar}	the alphabet bar
 */
ZmContactSplitView.prototype.getAlphabetBar =
function() {
	return this._alphabetBar;
};

/**
 * Sets the view size.
 * 
 * @param	{int}	width		the width (in pixels)
 * @param	{int}	height		the height (in pixels)
 */
ZmContactSplitView.prototype.setSize =
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

/**
 * Gets the title.
 * 
 * @return	{String}	the title
 */
ZmContactSplitView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

/**
 * Gets the size limit.
 * 
 * @param	{int}	offset		the offset
 * @return	{int}	the size
 */
ZmContactSplitView.prototype.getLimit =
function(offset) {
	return this._listPart.getLimit(offset);
};

/**
 * Sets the contact.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{Boolean}	isGal		<code>true</code> if is GAL
 * 
 */
ZmContactSplitView.prototype.setContact =
function(contact, isGal) {
	if (contact.isDistributionList() || !isGal) {
		// Remove and re-add listeners for current contact if exists
		if (this._contact) {
			this._contact.removeChangeListener(this._changeListener);
		}
		contact.addChangeListener(this._changeListener);
	}

	var oldContact = this._contact;
	this._contact = this._item = contact;

	if (this._contact.isLoaded) {
		this._setContact(contact, isGal, oldContact);
	} else {
		var callback = new AjxCallback(this, this._handleResponseLoad, [isGal, oldContact]);
		var errorCallback = new AjxCallback(this, this._handleErrorLoad);
		this._contact.load(callback, errorCallback, null, contact.isGroup());
	}
};

ZmContactSplitView.expandDL =
function(viewId, expand) {
	var view = DwtControl.fromElementId(viewId);
	if (view) {
		view._setContact(view._contact, true, null, expand);
	}
};

ZmContactSplitView.handleDLScroll =
function(ev) {

	var target = DwtUiEvent.getTarget(ev);
	var view = DwtControl.findControl(target);
	if (!view) { return; }
	var div = view._dlScrollDiv;
	if (div.clientHeight == div.scrollHeight) { return; }
	var contactDL = appCtxt.getApp(ZmApp.CONTACTS).getDL(view._dlContact.getEmail());
	var listSize = view.getDLSize();
	if (contactDL && (contactDL.more || (listSize < contactDL.list.length))) {
		var params = {scrollDiv:	div,
					  rowHeight:	view._rowHeight,
					  threshold:	10,
					  limit:		ZmContact.DL_PAGE_SIZE,
					  listSize:		listSize};
		var needed = ZmListView.getRowsNeeded(params);
		DBG.println("dl", "scroll, items needed: " + needed);
		if (needed) {
			DBG.println("dl", "new offset: " + listSize);
			var respCallback = new AjxCallback(null, ZmContactSplitView._handleResponseDLScroll, [view]);
			view._dlContact.getDLMembers(listSize, null, respCallback);
		}
	}
};

ZmContactSplitView._handleResponseDLScroll =
function(view, result) {

	var list = result.list;
	if (!(list && list.length)) { return; }

	var html = [];
	view._listPart._getImageHtml(html, 0, null);
	var subs = {first: false, html: html};
	var row = document.getElementById(view._dlLastRowId);
	var table = row && document.getElementById(view._detailsId);
	if (row) {
		var rowIndex = row.rowIndex + 1;
		for (var i = 0, len = list.length; i < len; i++) {
			view._distributionList.list.push(list[i]);
			subs.value = view._objectManager.findObjects(list[i], false, ZmObjectManager.EMAIL);
			var rowIdText = "";
			var newRow = table.insertRow(rowIndex + i);
			if (i == len - 1) {
				newRow.id = view._dlLastRowId = Dwt.getNextId();
			}
			newRow.valign = "top";
			newRow.innerHTML = AjxTemplate.expand("abook.Contacts#SplitView_dlmember-expanded", subs);
		}
//		view._dlScrollDiv.scrollTop = 0;
	}
	DBG.println("dl", table.rows.length + " rows");
};

ZmContactSplitView.prototype.getDLSize =
function() {
	return this._distributionList && this._distributionList.list.length;

};

/**
 * @private
 */
ZmContactSplitView.prototype._handleResponseLoad =
function(isGal, oldContact, resp, contact) {
	if (contact.id == this._contact.id) {
		this._setContact(this._contact, isGal, oldContact);
	}
};

/**
 * @private
 */
ZmContactSplitView.prototype._handleErrorLoad =
function(ex) {
	this.clear();
	// TODO - maybe display some kind of error?
};

/**
 * Clears the view.
 * 
 */
ZmContactSplitView.prototype.clear =
function() {
	var groupDiv = document.getElementById(this._contactBodyId);
	if (groupDiv) {
		groupDiv.innerHTML = "";
	}

	this._contactView.clear();
	this._clearTags();
};

/**
 * Enables the alphabet bar.
 * 
 * @param	{Boolean}	enable		if <code>true</code>, enable the alphabet bar
 */
ZmContactSplitView.prototype.enableAlphabetBar =
function(enable) {
	if (this._alphabetBar)
		this._alphabetBar.enable(enable);
};

/**
 * shows/hides the alphabet bar.
 *
 * @param	{Boolean}	visible		if <code>true</code>, show the alphabet bar
 */
ZmContactSplitView.prototype.showAlphabetBar =
function(visible) {
	if (this._alphabetBar) {
		this._alphabetBar.setVisible(visible);
	}
};


/**
 * @private
 */
ZmContactSplitView.prototype._initialize =
function(controller, dropTgt) {
	this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#SplitView", {id:this._htmlElId});

	// alphabet bar based on *optional* existence in template and msg properties
	var alphaDivId = this._htmlElId + "_alphabetbar";
	var alphaDiv = document.getElementById(alphaDivId);
	if (alphaDiv && ZmMsg.alphabet && ZmMsg.alphabet.length>0) {
		this._alphabetBar = new ZmContactAlphabetBar(this);
		this._alphabetBar.reparentHtmlElement(alphaDivId);
	}

	var splitviewCellId = this._htmlElId + "_splitview";
	this._splitviewCell = document.getElementById(splitviewCellId);

	// create listview based on *required* existence in template
	var listviewCellId = this._htmlElId + "_listview";
	this._listviewCell = document.getElementById(listviewCellId);
	this._listPart = new ZmContactSimpleView({parent:this, controller:controller, dropTgt:dropTgt});
	this._listPart.reparentHtmlElement(listviewCellId);

	var sashCellId = this._htmlElId + "_sash";
	this._sash = new DwtSash(this, DwtSash.HORIZONTAL_STYLE, null, 5, Dwt.ABSOLUTE_STYLE);
	this._sash.registerCallback(this._sashCallback, this);
	this._sash.replaceElement(sashCellId, false, true);

	var contentCellId = this._htmlElId + "_contentCell";
	this._contentCell = document.getElementById(contentCellId);

	// define well-known Id's
	this._iconCellId	= this._htmlElId + "_icon";
	this._titleCellId	= this._htmlElId + "_title";
	this._tagCellId		= this._htmlElId + "_tags_contact";
	this._contactBodyId = this._htmlElId + "_body";
	this._contentId		= this._htmlElId + "_content";
	this._detailsId		= this._htmlElId + "_details";

	// create an empty slate
	this._contactView = new ZmContactView({ parent: this, controller: this._controller });
	this._contactView.reparentHtmlElement(this._contentId);
	this._objectManager = new ZmObjectManager(this._contactView);
	this._contentCell.style.right = "0px";

	this._tabGroup = new DwtTabGroup('ZmContactSplitView');
	this._tabGroup.addMember(this._contactView.getTabGroupMember());
};

ZmContactSplitView.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

/**
 * @private
 */
ZmContactSplitView.prototype._tabStateChangeListener =
function(ev) {
	this._setContact(this._contact, this._isGalSearch);
};

/**
 * @private
 */
ZmContactSplitView.prototype._sizeChildren =
function(width, height) {

	// Using toWindow instead of getY because getY calls Dwt.getLocation
	// which returns NaN if "top" is not set or is "auto"
	var listPartOffset = Dwt.toWindow(this._listPart.getHtmlElement(), 0, 0);
	var fudge = listPartOffset.y - this.getY();

	this._listPart.setSize(Dwt.DEFAULT, height - fudge);

	fudge = this._contactView.getY() - this.getY();
	this._contactView.setSize(Dwt.DEFAULT, height - fudge);
};

/**
 * @private
 */
ZmContactSplitView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT ||
		ev.source != this._contact ||
		ev.event == ZmEvent.E_DELETE)
	{
		return;
	}

	this._setContact(ev.source);
};

/**
 * @private
 */
ZmContactSplitView.prototype._addrbookTreeListener =
function(ev, treeView) {
	if (!this._contact) { return; }

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && fields && fields[ZmOrganizer.F_COLOR]) {
		var organizers = ev.getDetail("organizers");
		if (!organizers && ev.source) {
			organizers = [ev.source];
		}

		for (var i = 0; i < organizers.length; i++) {
			var organizer = organizers[i];
			var folderId = this._contact.isShared()
				? appCtxt.getById(this._contact.folderId).id
				: this._contact.folderId;

			if (organizer.id == folderId) {
				this._setTags();
			}
		}
	}
};

/**
 * @private
 */
ZmContactSplitView.prototype._setContact =
function(contact, isGal, oldContact, expandDL, isBack) {

	//first gather the dl info and dl members. Those are async requests so calling back here after
	//it is done with isBack set to true.
	if (contact.isDistributionList() && !isBack) {
		var callbackHere = this._setContact.bind(this, contact, isGal, oldContact, expandDL, true);
		contact.gatherExtraDlStuff(callbackHere);
		return;
	}

	var addrBook = contact.getAddressBook();
	var color = addrBook ? addrBook.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];
	var subs = {
		id: this._htmlElId,
		contact: contact,
		addrbook: addrBook,
		contactHdrClass: (ZmOrganizer.COLOR_TEXT[color] + "Bg"),
		isInTrash: (addrBook && addrBook.isInTrash())
	};

	if (contact.isGroup()) {
		this._objectManager.reset();

		if (addrBook) {
			subs.folderIcon = addrBook.getIcon();
			subs.folderName = addrBook.getName();
		}

		if (contact.isDistributionList()) {
			var dlInfo = subs.dlInfo = contact.dlInfo;
		}
		subs.groupMembers = contact.getAllGroupMembers();
		subs.findObjects = this._objectManager.findObjects.bind(this._objectManager);

		this._resetVisibility(true);

		this._contactView.createHtml("abook.Contacts#SplitViewGroup", subs);

		if (contact.isDistributionList()) {
			if (this._subscriptionButton) {
				this._subscriptionButton.dispose();
			}
			this._subscriptionButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_subscriptionButton")});
			this._subscriptionButton.setEnabled(true);
			this._subscriptionMsg = document.getElementById(this._htmlElId + "_subscriptionMsg");
			this._updateSubscriptionButtonAndMsg(contact);
			var subListener = new AjxListener(this, this._subscriptionListener, contact);
			this._subscriptionButton.addSelectionListener(subListener);
		}

		var size = this.getSize();
		this._sizeChildren(size.x, size.y);
	} else {
		subs.view = this;
		subs.isGal = isGal;
		subs.findObjects = this._objectManager.findObjects.bind(this._objectManager);
		subs.attrs = contact.getNormalizedAttrs();
		subs.expandDL = expandDL;

		if (contact.isDL && contact.canExpand) {
			this._dlContact = contact;
			this._dlScrollDiv = this._dlScrollDiv || document.getElementById(this._contentId);
			var respCallback = new AjxCallback(this, this._showDL, [subs]);
			contact.getDLMembers(0, null, respCallback);
			return;
		}
		this._showContact(subs);
	}

	this._setTags();
	Dwt.setLoadedTime("ZmContactItem");
};

ZmContactSplitView.prototype.dispose =
function() {
	ZmTagsHelper.disposeListeners(this);
	DwtComposite.prototype.dispose.apply(this, arguments);
};


ZmContactSplitView.prototype._showContact =
function(subs) {
	this._objectManager.reset();
	this._resetVisibility(false);

	subs.defaultImageUrl = ZmZimbraMail.DEFAULT_CONTACT_ICON;

	this._contactView.createHtml("abook.Contacts#SplitView_content", subs);

	// notify zimlets that a new contact is being shown.
	appCtxt.notifyZimlets("onContactView", [subs.contact, this._htmlElId]);
};

ZmContactSplitView.prototype._subscriptionListener =
function(contact, ev) {
	var subscribe = !contact.dlInfo.isMember;
	this._subscriptionButton.setEnabled(false);
	var respHandler = this._handleSubscriptionResponse.bind(this, contact, subscribe);
	contact.toggleSubscription(respHandler);
};

ZmContactSplitView.prototype._handleSubscriptionResponse =
function(contact, subscribe, result) {
	var status = result._data.SubscribeDistributionListResponse.status;
	var subscribed = status == "subscribed";
	var unsubscribed = status == "unsubscribed";
	var awaitingApproval = status == "awaiting_approval";
	this._subscriptionButton.setEnabled(!awaitingApproval);
	if (!awaitingApproval) {
		contact.dlInfo.isMember = subscribed;
	}
	if (subscribed || unsubscribed) {
		contact.clearDlInfo();
		contact._notify(ZmEvent.E_MODIFY);
	}
	var msg = subscribed ? ZmMsg.dlSubscribed
			: unsubscribed ? ZmMsg.dlUnsubscribed
			: awaitingApproval && subscribe ? ZmMsg.dlSubscriptionRequested
			: awaitingApproval && !subscribe ? ZmMsg.dlUnsubscriptionRequested
			: ""; //should not happen. Keep this as separate case for ease of debug when it does happen somehow.
	var dlg = appCtxt.getMsgDialog();
	var name = contact.getEmail();
	dlg.setMessage(AjxMessageFormat.format(msg, name), DwtMessageDialog.INFO_STYLE);
	dlg.popup();

};

ZmContactSplitView.prototype._updateSubscriptionButtonAndMsg =
function(contact) {
	var dlInfo = contact.dlInfo;
	var policy = dlInfo.isMember ? dlInfo.unsubscriptionPolicy : dlInfo.subscriptionPolicy;
	if (policy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT) {
		this._subscriptionButton.setVisible(false);
	}
	else {
		this._subscriptionButton.setVisible(true);
		this._subscriptionButton.setText(dlInfo.isMember ? ZmMsg.dlUnsubscribe: ZmMsg.dlSubscribe);
	}
	var statusMsg = dlInfo.isOwner && dlInfo.isMember ? ZmMsg.youAreOwnerAndMember
			: dlInfo.isOwner ? ZmMsg.youAreOwner
			: dlInfo.isMember ? ZmMsg.youAreMember
			: "";
	if (statusMsg != '') {
		statusMsg = "<li>" + statusMsg + "</li>";
	}
	var actionMsg;
	if (!dlInfo.isMember) {
		actionMsg =	policy == ZmContactSplitView.SUBSCRIPTION_POLICY_APPROVAL ? ZmMsg.dlSubscriptionRequiresApproval
			: policy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT ? ZmMsg.dlSubscriptionNotAllowed
			: "";
	}
	else {
		actionMsg =	policy == ZmContactSplitView.SUBSCRIPTION_POLICY_APPROVAL ? ZmMsg.dlUnsubscriptionRequiresApproval
			: policy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT ? ZmMsg.dlUnsubscriptionNotAllowed
			: "";

	}
	if (actionMsg != '') {
		actionMsg = "<li>" + actionMsg + "</li>";
	}
	this._subscriptionMsg.innerHTML = statusMsg + actionMsg;

};

// returns an object with common properties used for displaying a contact field
ZmContactSplitView._getListData =
function(data, label, objectType) {
	var itemListData = {
		id: data.id,
		attrs: data.attrs,
		labelId: data.id + '_' + label.replace(/[^\w]/g,""),
		label: label,
		first: true
	};
	if (objectType) {
		itemListData.findObjects = data.findObjects;
		itemListData.objectType = objectType;
	}
	itemListData.isDL = data.contact.isDL;

	return itemListData;
};

ZmContactSplitView._showContactList =
function(data, names, typeFunc, hideType) {

	data.names = names;
	var html = [];
	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		data.name = name;
		data.type = (typeFunc && typeFunc(data, name)) || ZmMsg["AB_FIELD_" + name];
		data.type = hideType ? "" : data.type;
		html.push(ZmContactSplitView._showContactListItem(data));
	}

	return html.join("");
};

ZmContactSplitView._showContactListItem =
function(data) {

	var isEmail = (data.objectType == ZmObjectManager.EMAIL);
	var i = 0;
	var html = [];
	while (true) {
		data.name1 = ++i > 1 || ZmContact.IS_ADDONE[data.name] ? data.name + i : data.name;
		var values = data.attrs[data.name1];
		if (!values) { break; }
		data.name1 = AjxStringUtil.htmlEncode(data.name1);
		data.type = AjxStringUtil.htmlEncode(data.type);
		values = AjxUtil.toArray(values);
		for (var j=0; j<values.length; j++) {
			var value = values[j];
			if (!isEmail) {
				value = AjxStringUtil.htmlEncode(value);
			}
			if (ZmContact.IS_DATE[data.name]) {
				var date = ZmEditContactViewOther.parseDate(value);
				if (date) {
					var includeYear = date.getFullYear() != 0;
					var formatter = includeYear ?
					    AjxDateFormat.getDateInstance(AjxDateFormat.LONG) : new AjxDateFormat(ZmMsg.formatDateLongNoYear);
					value = formatter.format(date);
		        	}
			}
			if (data.findObjects) {
				value = data.findObjects(value, data.objectType);
			}
			if (data.encode) {
				value = data.encode(value);
			}
			data.value = value;

			html.push(AjxTemplate.expand("#SplitView_list_item", data));
		}
		data.first = false;
	}

	return html.join("");
};

ZmContactSplitView.showContactEmails =
function(data) {
	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.emailLabel, ZmObjectManager.EMAIL);
	var typeFunc = function(data, name) { return data.isDL && ZmMsg.distributionList; };
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.EMAIL.attrs, typeFunc, !data.isDL);
};

ZmContactSplitView.showContactPhones =
function(data) {
	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.phoneLabel, ZmObjectManager.PHONE);
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.PHONE.attrs);
};

ZmContactSplitView.showContactIMs =
function(data) {

	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.imLabel);
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.IM.attrs);
};

ZmContactSplitView.showContactAddresses =
function(data) {

	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.addressLabel);
	var types = {"work":ZmMsg.work, "home":ZmMsg.home, "other":ZmMsg.other};
	var prefixes = ZmContact.ADDR_PREFIXES;
	var suffixes = ZmContact.ADDR_SUFFIXES;
	var html = [];
	for (var i = 0; i < prefixes.length; i++) {
		var count = 0;
		var prefix = prefixes[i];
		itemListData.type = types[prefix] || prefix;
		while (true) {
			count++;
			itemListData.address = null;
			for (var j = 0; j < suffixes.length; j++) {
				var suffix = suffixes[j];
				var name = [prefix, suffix, count > 1 ? count : ""].join("");
				var value = data.attrs[name];
				if (!value) { continue; }
				value = AjxStringUtil.htmlEncode(value);
				if (!itemListData.address)  {
					itemListData.address = {};
				}
				itemListData.address[suffix] = value.replace(/\n/g,"<br/>");
			}
			if (!itemListData.address) { break; }
			itemListData.name = [prefix, "Address", count > 1 ? count : ""].join("");
			html.push(AjxTemplate.expand("#SplitView_address_value", itemListData));
			itemListData.first = false;
		}
	}

	return html.join("");
};

ZmContactSplitView.showContactUrls =
function(data) {
	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.urlLabel, ZmObjectManager.URL);
	var typeFunc = function(data, name) { return ZmMsg["AB_FIELD_" + name.replace("URL", "")]; };
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.URL.attrs, typeFunc);
};

ZmContactSplitView.showContactOther =
function(data) {

	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.otherLabel);
	itemListData.findObjects = data.findObjects;
	var html = [];
	html.push(ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.OTHER.attrs));

	// find unknown attributes
	var attrs = {};
	for (var a in itemListData.attrs) {
		var aname = ZmContact.getPrefix(a);
		if (aname in ZmContact.IS_IGNORE) { continue; }
		attrs[aname] = true;
	}
	for (var id in ZmEditContactView.ATTRS) {
		delete attrs[ZmEditContactView.ATTRS[id]];
	}
	for (var id in ZmEditContactView.LISTS) {
		var list = ZmEditContactView.LISTS[id];
		if (!list.attrs) { continue; }
		for (var i = 0; i < list.attrs.length; i++) {
			delete attrs[list.attrs[i]];
		}
	}
	var prefixes = ZmContact.ADDR_PREFIXES;
	var suffixes = ZmContact.ADDR_SUFFIXES;
	for (var i = 0; i < prefixes.length; i++) {
		for (var j = 0; j < suffixes.length; j++) {
			delete attrs[prefixes[i] + suffixes[j]];
		}
	}

	// display custom
	for (var a in attrs) {
		if (a === "notesHtml") { continue; }
		itemListData.name = a;
		itemListData.type = AjxStringUtil.capitalizeWords(AjxStringUtil.fromMixed(a));
		html.push(ZmContactSplitView._showContactListItem(itemListData));
	}

	return html.join("");
};

ZmContactSplitView.showContactNotes =
function(data) {

	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.notesLabel);
	itemListData.encode = AjxStringUtil.nl2br;
	itemListData.name = ZmContact.F_notes;
	itemListData.names = [ZmContact.F_notes];
	return ZmContactSplitView._showContactListItem(itemListData);
};

ZmContactSplitView.showContactDLMembers =
function(data) {

	var html = [];
	var itemData = {contact:data.contact};
	if (data.dl) {
		var list = data.dl.list;
		var canExpand = data.contact.canExpand && (list.length > ZmContactSplitView.NUM_DL_MEMBERS || data.dl.more);
		var lv = data.view._listPart;
		var id = lv._expandId = Dwt.getNextId();
		var tdStyle = "", onclick = "";
		var list1 = [];
		var len = Math.min(list.length, ZmContactSplitView.NUM_DL_MEMBERS);
		for (var i = 0; i < len; i++) {
			list1.push(data.findObjects ? data.findObjects(list[i], ZmObjectManager.EMAIL) : list[i]);
		}
		if (canExpand) {
			if (!data.expandDL) {
				list1.push(" ... ");
			}
			tdStyle = "style='cursor:pointer;'";
			var viewId = '"' + data.id + '"';
			var doExpand = data.expandDL ? "false" : "true";
			onclick = "onclick='ZmContactSplitView.expandDL(" + viewId + ", " + doExpand + ");'";
		}
		itemData.value = list1.join(", ");
		itemData.expandTdText = [tdStyle, onclick].join(" ");
		if (!data.expandDL) {
			itemData.html = [];
			lv._getImageHtml(itemData.html, 0, canExpand ? "NodeCollapsed" : null, id);
			html.push("<tr valign='top'>");
			html.push(AjxTemplate.expand("abook.Contacts#SplitView_dlmember-collapsed", itemData));
			html.push("</tr>");
		} else {
			itemData.first = true;
			for (var i = 0, len = list.length; i < len; i++) {
				itemData.value = list[i];
				if (data.findObjects) {
					itemData.value = data.findObjects(itemData.value, ZmObjectManager.EMAIL);
				}
				itemData.html = [];
				lv._getImageHtml(itemData.html, 0, itemData.first ? "NodeExpanded" : null, id);
				var rowIdText = "";
				if (i == len - 1) {
					var rowId = data.view._dlLastRowId = Dwt.getNextId();
					rowIdText = "id='" + rowId + "'";
				}
				html.push("<tr valign='top' " + rowIdText + ">");
				html.push(AjxTemplate.expand("abook.Contacts#SplitView_dlmember-expanded", itemData));
				html.push("</tr>");
				itemData.first = false;
			}
		}
	}

	return html.join("");
};

/**
 * Displays contact group
 * @param data  {object}
 * @return html {String} html representation of group
 */
ZmContactSplitView.showContactGroup =
function(data) {
	var html = []; 
	if (!AjxUtil.isArray(data.groupMembers)) {
		return "";
	}
	for (var i = 0; i < data.groupMembers.length; i++) {
		var member = data.groupMembers[i];
		var itemListData = {};
		var contact = member.__contact;
		if (contact) {
			itemListData.contact = contact;
			itemListData.imageUrl = contact.getImageUrl();
			itemListData.defaultImageUrl = ZmZimbraMail.DEFAULT_CONTACT_ICON;
			itemListData.imgClassName = contact.getIconLarge();
			itemListData.email = data.findObjects(contact.getEmail(), ZmObjectManager.EMAIL, true);
			itemListData.title = data.findObjects(contact.getAttr(ZmContact.F_jobTitle), ZmObjectManager.TITLE, true);
			itemListData.phone = data.findObjects(contact.getPhone(), ZmObjectManager.PHONE, true);
			var isPhonetic = appCtxt.get(ZmSetting.PHONETIC_CONTACT_FIELDS);
			var fullnameHtml = contact.getFullNameForDisplay(isPhonetic);
			if (!isPhonetic) {
				fullnameHtml = AjxStringUtil.htmlEncode(fullnameHtml);
			}
			itemListData.fullName = fullnameHtml;
		}
		else {
			itemListData.imgClassName = "DistributionList";
			itemListData.email = data.findObjects(member.value, ZmObjectManager.EMAIL, true);
		}
		html.push(AjxTemplate.expand("abook.Contacts#SplitView_group", itemListData));
	}
	return html.join("");
	
};

ZmContactSplitView.prototype._showDL =
function(subs, result) {

	subs.dl = this._distributionList = result;
	this._showContact(subs);
	this._setTags();
	if (!this._rowHeight) {
		var table = document.getElementById(this._detailsId);
		if (table) {
			this._rowHeight = Dwt.getSize(table.rows[0]).y;
		}
	}

	if (subs.expandDL) {
		Dwt.setHandler(this._dlScrollDiv, DwtEvent.ONSCROLL, ZmContactSplitView.handleDLScroll);
	}
};

/**
 * @private
 */
ZmContactSplitView.prototype._resetVisibility =
function(isGroup) {
};

/**
 * @private
 */
ZmContactSplitView.prototype._setTags =
function() {
	//use the helper to get the tags.
	var tagsHtml = ZmTagsHelper.getTagsHtml(this._item, this);
	this._setTagsHtml(tagsHtml);
};

/**
 * @private
 */
ZmContactSplitView.prototype._clearTags =
function() {
	this._setTagsHtml("");
};

/**
 * note this is called from ZmTagsHelper
 * @param html
 */
ZmContactSplitView.prototype._setTagsHtml =
function(html) {
	var tagCell = document.getElementById(this._tagCellId);
	if (!tagCell) { return; }
	tagCell.innerHTML = html;
};


ZmContactSplitView.prototype._sashCallback = function(delta) {
	var sashWidth = this._sash.getSize().x;
	var totalWidth = Dwt.getSize(this._splitviewCell).x;

	var origListWidth = this._listPart.getSize().x;
	var newListWidth = origListWidth + delta;
	var newContentPos = newListWidth + sashWidth;
	var newContentWidth = totalWidth - newContentPos;

	if (delta < 0 && newListWidth <= ZmContactSplitView.LIST_MIN_WIDTH) {
		newListWidth = ZmContactSplitView.LIST_MIN_WIDTH;
		newContentPos = newListWidth + sashWidth;
		newContentWidth = totalWidth - newContentPos;
	} else if (delta > 0 && newContentWidth <= ZmContactSplitView.CONTENT_MIN_WIDTH) {
		newContentWidth = ZmContactSplitView.CONTENT_MIN_WIDTH;
		newContentPos = totalWidth - newContentWidth;
		newListWidth = newContentPos - sashWidth;
	}
		
	delta = newListWidth - origListWidth;
	
	this._listPart.setSize(newListWidth, Dwt.DEFAULT);
	Dwt.setBounds(this._contentCell, newContentPos, Dwt.DEFAULT, newContentWidth, Dwt.DEFAULT);

	return delta;
};

/**
 * View for displaying the contact information. Provides events for enabling text selection.
 * @param {Object}  params      hash of params:
 *                  parent      parent control
 *                  controller  owning controller
 */
ZmContactView = function(params) {
	DwtComposite.call(this, {parent:params.parent});
	this._controller = params.controller;
	this._tabGroup = new DwtTabGroup('ZmContactView');
	this.addListener(DwtEvent.ONSELECTSTART, this._selectStartListener.bind(this));
	this._setMouseEventHdlrs();
};
ZmContactView.prototype = new DwtControl;
ZmContactView.prototype.constructor = ZmContactView;
ZmContactView.prototype.isZmContactView = true;
ZmContactView.prototype.role = 'document';
ZmContactView.prototype.toString = function() { return "ZmContactView"; };

ZmContactView.prototype.getTabGroupMember = 
function() {
	return this._tabGroup;
};

ZmContactView.prototype._selectStartListener =
function(ev) {
	// reset mouse event to propagate event to browser (allows text selection)
	ev._stopPropagation = false;
	ev._returnValue = true;
};

ZmContactView.prototype.clear = function() {
	this.getTabGroupMember().removeAllMembers();
	Dwt.removeChildren(this.getHtmlElement());
};

ZmContactView.prototype.createHtml = function(templateid, subs) {
	this._createHtmlFromTemplate(templateid, subs);

	// add the header row and all objects to the tab order
	var rows = Dwt.byClassName('rowValue', this.getHtmlElement());

	this.getTabGroupMember().removeAllMembers();
	this.getTabGroupMember().addMember(rows[0]);

	AjxUtil.foreach(rows, this._makeRowFocusable.bind(this));
};

ZmContactView.prototype._makeRowFocusable = function(row) {
	this._makeFocusable(row);

	var objects = Dwt.byClassName('Object', row);

	for (var i = 0; i < objects.length; i++) {
		this._makeFocusable(objects[i]);
		this.getTabGroupMember().addMember(objects[i]);

		objects[i].setAttribute('aria-describedby', row.getAttribute('aria-labelledby'));
	}
};

/**
 * Creates a simple view.
 * @class
 * This class represents a simple contact list view (contains only full name).
 * 
 * @param	{Hash}	params		a hash of parameters
 * @extends		ZmContactsBaseView
 */
ZmContactSimpleView = function(params) {

	if (arguments.length == 0) { return; }

	this._view = params.view = params.controller.getCurrentViewId();
	params.className = "ZmContactSimpleView";
	ZmContactsBaseView.call(this, params);

	this._normalClass = "SimpleContact " + DwtListView.ROW_CLASS;
	this._selectedClass = [DwtListView.ROW_CLASS, DwtCssStyle.SELECTED].join("-");
};

ZmContactSimpleView.prototype = new ZmContactsBaseView;
ZmContactSimpleView.prototype.constructor = ZmContactSimpleView;

ZmContactSimpleView.prototype.isZmContactSimpleView = true;
ZmContactSimpleView.prototype.toString = function() { return "ZmContactSimpleView"; };

/**
 * Sets the list.
 * 
 * @param	{ZmContactList}		list		the list
 * @param	{String}	defaultColumnSort		the sort field
 * @param	{String}	folderId		the folder id
 * @param	{Boolean}	isSearchResults	is this a search tab?
 */
ZmContactSimpleView.prototype.set =
function(list, defaultColumnSort, folderId, isSearchResults) {
	var fid = folderId || this._controller.getFolderId();
	ZmContactsBaseView.prototype.set.call(this, list, defaultColumnSort, fid);

	if (!(this._list instanceof AjxVector) || this._list.size() == 0) {
		this.parent.clear();
	}

	this.parent.showAlphabetBar(!isSearchResults);
	this.parent.enableAlphabetBar(fid != ZmOrganizer.ID_DLS);
};

/**
 * Sets the selection.
 * 
 * @param	{Object}	item		the item
 * @param	{Boolean}	skipNotify	<code>true</code> to skip notification
 */
ZmContactSimpleView.prototype.setSelection =
function(item, skipNotify) {
	// clear the right, content pane if no item to select
	if (!item) {
		this.parent.clear();
	}

	ZmContactsBaseView.prototype.setSelection.call(this, item, skipNotify);
};

/**
 * @private
 */
ZmContactSimpleView.prototype._setNoResultsHtml =
function() {

	var	div = document.createElement("div");

	var isSearch = this._controller._contactSearchResults;
	if (isSearch){
		isSearch = !(this._controller._currentSearch && this._controller._currentSearch.folderId);
	}
	//bug:28365  Show custom "No Results" for Search.
	if ((isSearch || this._folderId == ZmFolder.ID_TRASH) && AjxTemplate.getTemplate("abook.Contacts#SimpleView-NoResults-Search")) {
		div.innerHTML = AjxTemplate.expand("abook.Contacts#SimpleView-NoResults-Search");
	} else {
		// Shows "No Results", unless the skin has overridden to show links to plaxo.
		div.innerHTML = AjxTemplate.expand("abook.Contacts#SimpleView-NoResults");
	}
	this._addRow(div);

	this.parent.clear();
};

/**
 * @private
 */
ZmContactSimpleView.prototype._changeListener =
function(ev) {
	ZmContactsBaseView.prototype._changeListener.call(this, ev);

	// bug fix #14874 - if moved to trash, show strike-thru
	var folderId = this._controller.getFolderId();
	if (!folderId && ev.event == ZmEvent.E_MOVE) {
		var contact = ev._details.items[0];
		var folder = appCtxt.getById(contact.folderId);
		var row = this._getElement(contact, ZmItem.F_ITEM_ROW);
		if (row) {
			row.className = (folder && folder.isInTrash()) ? "Trash" : "";
		}
	}
};

/**
 * @private
 */
ZmContactSimpleView.prototype._modifyContact =
function(ev) {
	ZmContactsBaseView.prototype._modifyContact.call(this, ev);

	//TODO: `contactImageChanged` event should be handled separately and should just update current row instead of relayout
	if (ev.getDetail("fileAsChanged") || ev.getDetail("contactImageChanged")) {
		var selected = this.getSelection()[0];
		this._layout();
		this.setSelection(selected, true);
	}
};

/**
 * @private
 */
ZmContactSimpleView.prototype._layout =
function() {
	// explicitly remove each child (setting innerHTML causes mem leak)
	while (this._parentEl.hasChildNodes()) {
		cDiv = this._parentEl.removeChild(this._parentEl.firstChild);
		this._data[cDiv.id] = null;
	}

	var now = new Date();
	var size = this._list.size();
	for (var i = 0; i < size; i++) {
		var item = this._list.get(i);
		var div = item ? this._createItemHtml(item, {now:now}) : null;
		if (div) {
			this._addRow(div);
		}
	}
};

ZmContactSimpleView.prototype.useListElement =
function() {
	return true;
}

/**
 * A contact is normally displayed in a list view with no headers, and shows
 * just an icon and name.
 *
 * @param {ZmContact}	contact	the contact to display
 * @param {Hash}	params	a hash of optional parameters
 * 
 * @private
 */
ZmContactSimpleView.prototype._createItemHtml =
function(contact, params, asHtml, count) {

	params = params || {};

	var htmlArr = [];
	var idx = 0;
	if (!params.isDragProxy) {
		params.divClass = this._normalClass;
	}
	if (asHtml) {
		idx = this._getDivHtml(contact, params, htmlArr, idx, count);
	} else {
		var div = this._getDiv(contact, params);
	}
	var folder = this._folderId && appCtxt.getById(this._folderId);

	idx = this._getRow(htmlArr, idx, contact, params);

	// checkbox selection
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		idx = this._getImageHtml(htmlArr, idx, "CheckboxUnchecked", this._getFieldId(contact, ZmItem.F_SELECTION));
	}

	// icon
	var avatarUrl = contact.getImageUrl();
	if(avatarUrl) {
		htmlArr[idx++] = "<div class='ZmContactIcon' id='" + this._getFieldId(contact, "type") + "' >";
		htmlArr[idx++] = "<img src='" + avatarUrl + "' alt='" + contact.getFullName() + "' />";
		htmlArr[idx++] = "</div>"; 
	} else {
		htmlArr[idx++] = AjxImg.getImageHtml(contact.getIcon(folder), null, "id=" + this._getFieldId(contact, "type"),null, null, ["ZmContactIcon"]);
	}

	// file as
	htmlArr[idx++] = "<div class='ZmContactName' id='" + this._getFieldId(contact, "fileas") + "'>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs() || contact.getFileAsNoName());
	htmlArr[idx++] = "</div>";
	htmlArr[idx++] = "<div class='ZmListFlagsWrapper'>";

	if (!params.isDragProxy) {
		// if read only, show lock icon in place of the tag column since we dont
		// currently support tags for "read-only" contacts (i.e. shares)
		var isLocked = folder ? folder.link && folder.isReadOnly() : contact.isLocked();
		if (isLocked) {
			htmlArr[idx++] = AjxImg.getImageHtml("ReadOnly");
		} else if (!contact.isReadOnly() && appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			// otherwise, show tag if there is one
			idx = this._getImageHtml(htmlArr, idx, contact.getTagImageInfo(), this._getFieldId(contact, ZmItem.F_TAG), ["Tag"]);
		}
	}

	htmlArr[idx++] = "</div></div></li>";

	if (div) {
		div.innerHTML = htmlArr.join("");
		return div;
	} else {
		return htmlArr.join("");
	}
};

/**
 * @private
 */
ZmContactSimpleView.prototype._getToolTip =
function(params) {

	var ttParams = {
		contact:		params.item,
		ev:				params.ev
	};
	var ttCallback = new AjxCallback(this,
		function(callback) {
			appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
		});
	return {callback:ttCallback};
};

/**
 * @private
 */
ZmContactSimpleView.prototype._getDateToolTip =
function(item, div) {
	div._dateStr = div._dateStr || this._getDateToolTipText(item.modified, ["<b>", ZmMsg.lastModified, "</b><br>"].join(""));
	return div._dateStr;
};
