/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
	DwtComposite.call(this, params);

	this._controller = params.controller;

	this.setScrollStyle(Dwt.CLIP);

	this._changeListener = new AjxListener(this, this._contactChangeListener);

	this._initialize(params.controller, params.dropTgt);

	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.addChangeListener(new AjxListener(this, this._addrbookTreeListener));
	}
	var tagTree = appCtxt.getTagTree();
	if (tagTree) {
		tagTree.addChangeListener(new AjxListener(this, this._tagChangeListener));
	}
};

ZmContactSplitView.prototype = new DwtComposite;
ZmContactSplitView.prototype.constructor = ZmContactSplitView;

// Consts
ZmContactSplitView.ALPHABET_HEIGHT = 35;
ZmContactSplitView.NUM_DL_MEMBERS = 10;	// number of distribution list members to show initially

ZmContactSplitView.LIST_MIN_WIDTH = 100;
ZmContactSplitView.CONTENT_MIN_WIDTH = 200;

ZmContactSplitView.SUBSCRIPTION_POLICY_ACCEPT = "ACCEPT";
ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT = "REJECT";
ZmContactSplitView.SUBSCRIPTION_POLICY_APPROVAL = "APPROVAL";


/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactSplitView.prototype.toString =
function() {
	return "ZmContactSplitView";
};

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
	if (!isGal) {
		// Remove and re-add listeners for current contact if exists
		if (this._contact) {
			this._contact.removeChangeListener(this._changeListener);
		}
		contact.addChangeListener(this._changeListener);
	}

	var oldContact = this._contact;
	this._contact = contact;

	if (this._contact.isLoaded) {
		this._setContact(contact, isGal, oldContact);
	} else {
		var callback = new AjxCallback(this, this._handleResponseLoad, [isGal, oldContact]);
		var errorCallback = new AjxCallback(this, this._handleErrorLoad);
		this._contact.load(callback, errorCallback);
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
	var subs = {seenone:true, html:html};
	var row = document.getElementById(view._dlLastRowId);
	var table = row && document.getElementById(view._detailsId);
	if (row) {
		var rowIndex = row.rowIndex + 1;
		for (var i = 0, len = list.length; i < len; i++) {
			view._distributionList.list.push(list[i]);
			subs.value = view.__findObjects(view._objectManager, list[i], ZmObjectManager.EMAIL);
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

	if (this._contactView) {
		this._contactView.getHtmlElement().innerHTML = "";
	}
	if (this._contactGroupView) {
		this._contactGroupView.getHtmlElement().innerHTML = "";
	}

	this._setHeaderInfo(true);
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
	this._tagCellId		= this._htmlElId + "_tags";
	this._headerRowId	= this._htmlElId + "_headerRow";
	this._contactBodyId = this._htmlElId + "_body";
	this._contentId		= this._htmlElId + "_content";
	this._detailsId		= this._htmlElId + "_details";

	// contact groups is not child of DwtTabGroup
	this._contactGroupView = new DwtComposite(this);
	this._contactGroupView.setVisible(false);
	this._contactGroupView.reparentHtmlElement(this._contentId);
	this._contactGroupView._setMouseEventHdlrs();
	this._groupObjectManager = new ZmObjectManager(this._contactGroupView);

	// create an empty slate
	this._contactView = new DwtComposite(this);
	this._contactView.reparentHtmlElement(this._contentId);
	this._contactView._setMouseEventHdlrs();
	this._objectManager = new ZmObjectManager(this._contactView);

	this._contentCell.style.right = "0px";
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

	var fudge = AjxEnv.isIE ? 39 : 41;
	this._listPart.setSize(Dwt.DEFAULT, height - fudge);

	fudge = AjxEnv.isIE ? 45 : 43;
	var view = (this._contact && this._contact.isGroup())
		? this._contactGroupView : this._contactView;

	if (view) {
		view.setSize(Dwt.DEFAULT, height - fudge);
	}
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
				this._setHeaderInfo();
			}
		}
	}
};

/**
 * @private
 */
ZmContactSplitView.prototype.__findObjects =
function(objectManager, data, type, encodeHTML) {
	return objectManager.findObjects(data, encodeHTML, type);
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
		this._controller.gatherContactExtraDlStuff(contact, callbackHere);
		return;
	}

	var folderId = contact.folderId;
	var folder = folderId ? appCtxt.getById(folderId) : null;
	var color = folder ? folder.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];

	var addrBook = contact.getAddressBook(); 
	var subs = {
		id: this._htmlElId,
		contact: contact,
		addrbook: addrBook,
		contactHdrClass: (ZmOrganizer.COLOR_TEXT[color] + "Bg"),
		isInTrash: (folder && folder.isInTrash())
	};

	if (contact.isGroup()) {
		this._groupObjectManager.reset();

		if (addrBook) {
			subs.folderIcon = addrBook.getIcon();
			subs.folderName = addrBook.getName();
		}

		if (contact.isDistributionList()) {
			var dlInfo = subs.dlInfo = contact.dlInfo;
			subs.groupMembers = contact.dlMembers;
		}
		else {
			subs.groupMembers = contact.getGroupMembersObj();
		}
		subs.findObjects = AjxCallback.simpleClosure(this.__findObjects, this, this._groupObjectManager);

		this._resetVisibility(true);

		this._contactGroupView.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#SplitViewGroup", subs);

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
		subs.findObjects = AjxCallback.simpleClosure(this.__findObjects, this, this._objectManager);
		subs.attrs = contact.getNormalizedAttrs();
		subs.encode = {};
		subs.encode.IM = AjxCallback.simpleClosure(this._encodeIM, this);
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

	this._setHeaderInfo();
	Dwt.setLoadedTime("ZmContactItem", new Date());
};

ZmContactSplitView.prototype._showContact =
function(subs) {
	this._objectManager.reset();
	this._resetVisibility(false);
	this._contactView.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#SplitView_content", subs);

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
	contact.dlInfo.isMember = subscribed;
	this._updateSubscriptionButtonAndMsg(contact);
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
	this._subscriptionMsg.innerHTML = statusMsg + (actionMsg != "" && statusMsg != "" ? "<br>" : "") + actionMsg;

};

// returns an object with common properties used for displaying a contact field
ZmContactSplitView._getListData =
function(data, label, objectType) {
	var itemListData = {id:data.id, attrs:data.attrs, seenone:false, label:label};
	if (objectType) {
		itemListData.findObjects = data.findObjects;
		itemListData.objectType = objectType;
	}
	itemListData.isDL = data.contact.isDL;

	return itemListData;
};

ZmContactSplitView._showContactList =
function(data, names, typeFunc) {

	data.names = names;
	var html = [];
	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		data.name = name;
		data.type = (typeFunc && typeFunc(data, name)) || ZmMsg["AB_FIELD_" + name];
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
		data.seenone = true;
	}

	return html.join("");
};

ZmContactSplitView.showContactEmails =
function(data) {
	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.emailLabel, ZmObjectManager.EMAIL);
	var typeFunc = function(data, name) { return data.isDL && ZmMsg.distributionList; };
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.EMAIL.attrs, typeFunc);
};

ZmContactSplitView.showContactPhones =
function(data) {
	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.phoneLabel, ZmObjectManager.PHONE);
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.PHONE.attrs);
};

ZmContactSplitView.showContactIMs =
function(data) {

	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.imLabel);
	if (AjxUtil.isFunction(data.encode.IM)) {
		itemListData.encode = data.encode.IM;
	}
	return ZmContactSplitView._showContactList(itemListData, ZmEditContactView.LISTS.IM.attrs);
};

ZmContactSplitView.showContactAddresses =
function(data) {

	var itemListData = ZmContactSplitView._getListData(data, ZmMsg.addressLabel);
	var types = {"work":ZmMsg.work, "home":ZmMsg.home, "other":ZmMsg.other};
	var prefixes = ZmEditContactView.ADDR_PREFIXES;
	var suffixes = ZmEditContactView.ADDR_SUFFIXES;
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
			itemListData.seenone = true;
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
		var aname = a.replace(/\d+$/,"");
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
	var prefixes = ZmEditContactView.ADDR_PREFIXES;
	var suffixes = ZmEditContactView.ADDR_SUFFIXES;
	for (var i = 0; i < prefixes.length; i++) {
		for (var j = 0; j < suffixes.length; j++) {
			delete attrs[prefixes[i] + suffixes[j]];
		}
	}

	// display custom
	for (var a in attrs) {
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
			itemData.seenone = false;
			for (var i = 0, len = list.length; i < len; i++) {
				itemData.value = list[i];
				if (data.findObjects) {
					itemData.value = data.findObjects(itemData.value, ZmObjectManager.EMAIL);
				}
				itemData.html = [];
				lv._getImageHtml(itemData.html, 0, itemData.seenone ? null : "NodeExpanded", id);
				var rowIdText = "";
				if (i == len - 1) {
					var rowId = data.view._dlLastRowId = Dwt.getNextId();
					rowIdText = "id='" + rowId + "'";
				}
				html.push("<tr valign='top' " + rowIdText + ">");
				html.push(AjxTemplate.expand("abook.Contacts#SplitView_dlmember-expanded", itemData));
				html.push("</tr>");
				itemData.seenone = true;
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
		var itemListData = {};
		var type = data.groupMembers[i].type;
		if (type == ZmContact.GROUP_GAL_REF || type == ZmContact.GROUP_CONTACT_REF) {
			var contact = ZmContact.getContactFromCache(data.groupMembers[i].value);
			if (contact) {
				itemListData.imageUrl = contact.getImageUrl();
				itemListData.imgClassName = "Person_48";
				itemListData.email = data.findObjects(contact.getEmail(), ZmObjectManager.EMAIL);
				itemListData.title = data.findObjects(contact.getAttr(ZmContact.F_jobTitle), ZmObjectManager.TITLE);
				itemListData.phone = data.findObjects(contact.getPhone(), ZmObjectManager.PHONE);
				var isPhonetic  = appCtxt.get(ZmSetting.PHONETIC_CONTACT_FIELDS);
                var fullnameHtml= contact.getFullNameForDisplay(isPhonetic);
				if (!isPhonetic) {
					fullnameHtml = AjxStringUtil.htmlEncode(fullnameHtml);
				}
				itemListData.fullName = fullnameHtml;
			}
			
			html.push(AjxTemplate.expand("abook.Contacts#SplitView_group", itemListData));
		}
		else {
			itemListData.imgClassName = "PersonInline_48";
			itemListData.email = data.findObjects(data.groupMembers[i].value, ZmObjectManager.EMAIL);
			html.push(AjxTemplate.expand("abook.Contacts#SplitView_group", itemListData));
		}
	}
	return html.join("");
	
};

ZmContactSplitView.prototype._showDL =
function(subs, result) {

	subs.dl = this._distributionList = result;
	this._showContact(subs);
	this._setHeaderInfo();
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

ZmContactSplitView.IM_RE_VALUE = /^(.*?):\/\/(.*)$/;
ZmContactSplitView.prototype._encodeIM =
function(data) {
	var result = ZmContactSplitView.IM_RE_VALUE.exec(data);
	if (result) {
		var params = [result[1], result[2], ZmMsg["AB_FIELD_", result[1]]];
		return AjxMessageFormat.format(ZmMsg.AB_DISPLAY_IM, params);
	} else {
		return data;
	}
};

/**
 * @private
 */
ZmContactSplitView.prototype._resetVisibility =
function(isGroup) {
	this._contactView.setVisible(!isGroup);
	this._contactGroupView.setVisible(isGroup);
};

/**
 * @private
 */
ZmContactSplitView.prototype._getTagHtml =
function() {
	var html = [];
	var idx = 0;

	// get sorted list of tags for this msg
	var tagsList = this._contact.tags;
	var ta = [];
	for (var i = 0; i < tagsList.length; i++) {
		ta.push(appCtxt.getById(tagsList[i]));
	}
	ta.sort(ZmTag.sortCompare);

	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) { continue; }
		var icon = tag.getIconWithColor();
		var attr = ["id='", this._tagCellId, tag.id, "'"].join("");
		// XXX: set proper class name for link once defined!
		html[idx++] = "<a href='javascript:;' class='' onclick='ZmContactSplitView._tagClicked(";
		html[idx++] = '"';
		html[idx++] = tag.id;
		html[idx++] = '"';
		html[idx++] = "); return false;'>";
		html[idx++] = AjxImg.getImageSpanHtml(icon, null, attr, tag.name);
		html[idx++] = "</a>&nbsp;";
	}
	return html.join("");
};

/**
 * @private
 */
ZmContactSplitView.prototype._setHeaderInfo =
function(clear) {
	// set tags
	var tagCell = document.getElementById(this._tagCellId);
	if (tagCell) {
		tagCell.innerHTML = clear ? "" : this._getTagHtml();
	}
};

/**
 * @private
 */
ZmContactSplitView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG) { return; }

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		var tagCell = document.getElementById(this._tagCellId);
        if (tagCell) {
		    tagCell.innerHTML = this._getTagHtml();
        }
	}
};

/**
 * @private
 */
ZmContactSplitView._tagClicked =
function(tagId) {
	var sc = appCtxt.getSearchController();
	if (sc) {
		var tag = appCtxt.getById(tagId);
		if (tag) {
			sc.search({query: tag.createQuery()});
		}
	}
};

ZmContactSplitView.prototype._sashCallback = function(delta) {
	var sashWidth = this._sash.getSize().x;
	var totalWidth = Dwt.getSize(this._splitviewCell).x;

	var origListWidth = Dwt.getSize(this._listviewCell).x;
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
	
	if (AjxEnv.isIE) {
		newContentPos -= 1;
		newContentWidth += 1;
	}

	Dwt.setSize(this._listviewCell, newListWidth, Dwt.DEFAULT);
	Dwt.setBounds(this._contentCell, newContentPos, Dwt.DEFAULT, newContentWidth, Dwt.DEFAULT);

	return delta;
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

	params.view = ZmId.VIEW_CONTACT_SIMPLE;
	params.className = "ZmContactSimpleView";
	ZmContactsBaseView.call(this, params);

	this._normalClass = DwtListView.ROW_CLASS + " SimpleContact";
	this._selectedClass = [DwtListView.ROW_CLASS, DwtCssStyle.SELECTED].join("-") + " SimpleContact";
};

ZmContactSimpleView.prototype = new ZmContactsBaseView;
ZmContactSimpleView.prototype.constructor = ZmContactSimpleView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactSimpleView.prototype.toString =
function() {
	return "ZmContactSimpleView";
};

/**
 * Sets the list.
 * 
 * @param	{ZmContactList}		list		the list
 * @param	{String}	defaultColumnSort		the sort field
 * @param	{String}	folderId		the folder id
 */
ZmContactSimpleView.prototype.set =
function(list, defaultColumnSort, folderId) {
	var fid = folderId || this._controller.getFolderId();
	ZmContactsBaseView.prototype.set.call(this, list, defaultColumnSort, fid);

	if (!(this._list instanceof AjxVector) || this._list.size() == 0) {
		this.parent.clear();
	}

	this.parent.enableAlphabetBar(!(list && list.isGal));
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

	if (appCtxt.get(ZmSetting.IM_ENABLED) && ZmImApp.loggedIn()) {
		// display presence information for contacts linked to buddy list
		var a = ev.getDetails().items, i = 0, c;
		while (c = a[i++]) {
			if (c instanceof ZmContact) {
				var presence = c.getImPresence();
				if (presence) {
					var el = this._getFieldId(c, ZmItem.F_PRESENCE);
					el = document.getElementById(el);
					if (el)
						AjxImg.setImage(el, presence.getIcon(), true);
				}
			}
		}
	}

	if (ev.getDetail("fileAsChanged")) {
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
function(contact, params) {

	params = params || {};

	var div = this._getDiv(contact, params);

	if (params.isDragProxy) {
		div.style.width = "175px";
		div.style.padding = "4px";
	} else {
		div.className = this._normalClass + " SimpleContact";
	}

	var htmlArr = [];
	var idx = 0;

	// table/row
	idx = this._getTable(htmlArr, idx, params);
	idx = this._getRow(htmlArr, idx, contact, params);

	// checkbox selection
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
		idx = this._getImageHtml(htmlArr, idx, "CheckboxUnchecked", this._getFieldId(contact, ZmItem.F_SELECTION));
		htmlArr[idx++] = "</center></td>";
	}

	// icon
	htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
	htmlArr[idx++] = AjxImg.getImageHtml(contact.getIcon(), null, "id=" + this._getFieldId(contact, "type"));
	htmlArr[idx++] = "</center></td>";

	// file as
	var fileAs = AjxStringUtil.htmlEncode(contact.getFileAs());
	if (!fileAs) {
		var val = contact.getEmail();
		if (!val || (val && val.length ==0)) {
			var imAddr = ZmImAddress.parse(contact.getIMAddress());
			if (imAddr) {
				val = imAddr.screenName;
			}
		}
		fileAs = [AjxStringUtil.htmlEncode(ZmMsg.noName), AjxStringUtil.htmlEncode(val)].join(" ");
	}
	htmlArr[idx++] = "<td id='" + this._getFieldId(contact, "fileas") + "' style='vertical-align:middle;'>&nbsp;";
	htmlArr[idx++] = fileAs;
	htmlArr[idx++] = "</td>";

	if (!params.isDragProxy) {
		// if read only, show lock icon in place of the tag column since we dont
		// currently support tags for "read-only" contacts (i.e. shares)
		if (contact.isReadOnly()) {
			htmlArr[idx++] = "<td width=16>";
			htmlArr[idx++] = AjxImg.getImageHtml("ReadOnly");
			htmlArr[idx++] = "</td>";
		} else if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			// otherwise, show tag if there is one
			htmlArr[idx++] = "<td style='vertical-align:middle;' width=16 class='Tag'>";
			idx = this._getImageHtml(htmlArr, idx, contact.getTagImageInfo(), this._getFieldId(contact, ZmItem.F_TAG));
			htmlArr[idx++] = "</td>";
		}
	}

	if (appCtxt.get(ZmSetting.IM_ENABLED)) {
		htmlArr[idx++] = "<td style='vertical-align:middle' width=16 class='Presence'>";
		var presence = contact.getImPresence();
		var img = presence ? presence.getIcon() : "Blank_16";
		idx = this._getImageHtml(htmlArr, idx, img, this._getFieldId(contact, ZmItem.F_PRESENCE));
		htmlArr[idx++] = "</td>";
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");

	return div;
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
