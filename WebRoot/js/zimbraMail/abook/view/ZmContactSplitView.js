/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

//////////////////////////////////////////////////////////////////////////////
// ZmContactSplitView
// - parent for the simple list view and xform view
//////////////////////////////////////////////////////////////////////////////
ZmContactSplitView = function(params) {
	if (arguments.length == 0) { return; }

	params.className = params.className || "ZmContactSplitView";
	params.posStyle = params.posStyle || Dwt.ABSOLUTE_STYLE;
	DwtComposite.call(this, params);

	this._controller = params.controller;

	this.setScrollStyle(Dwt.CLIP);

	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.addChangeListener(new AjxListener(this, this._addrbookTreeListener));
	}
	var tagTree = appCtxt.getTagTree();
	if (tagTree) {
		tagTree.addChangeListener(new AjxListener(this, this._tagChangeListener));
	}

	this._changeListener = new AjxListener(this, this._contactChangeListener);
	this._objectManager = new ZmObjectManager();

	this._initialize(params.controller, params.dropTgt);
};

ZmContactSplitView.prototype = new DwtComposite;
ZmContactSplitView.prototype.constructor = ZmContactSplitView;


// Consts
ZmContactSplitView.ALPHABET_HEIGHT = 35;

ZmContactSplitView.prototype.toString =
function() {
	return "ZmContactSplitView";
};

ZmContactSplitView.prototype.getListView =
function() {
	return this._listPart;
};

ZmContactSplitView.prototype.getController =
function() {
	return this._controller;
};

ZmContactSplitView.prototype.getAlphabetBar =
function() {
	return this._alphabetBar;
};

ZmContactSplitView.prototype.setSize =
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

ZmContactSplitView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};

ZmContactSplitView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

ZmContactSplitView.prototype.setContact =
function(contact, isGal) {

	if (this._objectManager) {
		this._objectManager.reset();
	}

	if (!isGal) {
		// Remove and re-add listeners for current contact if exists
		if (this._contact)
			this._contact.removeChangeListener(this._changeListener);
		contact.addChangeListener(this._changeListener);
	}

	var oldContact = this._contact;
	this._contact = contact;
	if (this._contactTabView) {
		this._tabViewHtml = {};
		this._contactTabView.enable(true);
		// prevent listview from scrolling back up :/
		Dwt.CARET_HACK_ENABLED = false;
		this._contactTabView.switchToTab(1);
		Dwt.CARET_HACK_ENABLED = AjxEnv.isFirefox;
	}

	if (this._contact.isLoaded) {
		this._setContact(contact, isGal, oldContact);
	} else {
		var callback = new AjxCallback(this, this._handleResponseLoad, [isGal, oldContact]);
		var errorCallback = new AjxCallback(this, this._handleErrorLoad);
		this._contact.load(callback, errorCallback);
	}
};

ZmContactSplitView.prototype._handleResponseLoad =
function(isGal, oldContact, resp, contact) {
	if (contact.id == this._contact.id) {
		this._setContact(this._contact, isGal, oldContact);
	}
};

ZmContactSplitView.prototype._handleErrorLoad =
function(ex) {
	this.clear();
	// TODO - maybe display some kind of error?
};

ZmContactSplitView.prototype.clear =
function() {
	// clear the right pane
	if (this._contactTabView) {
		this._tabViewHtml = {};
		var tabIdx = this._contactTabView.getCurrentTab();
		var view = this._contactTabView.getTabView(tabIdx);
		if (view) {
			view.getHtmlElement().innerHTML = "";
		}
		this._contactTabView.enable(false);
	}

	var groupDiv = document.getElementById(this._contactBodyId);
	if (groupDiv) {
		groupDiv.innerHTML = "";
	}

	if (this._contactView) {
		this._contactView.getHtmlElement().innerHTML = "";
	}

	this._setHeaderInfo(true);
};

ZmContactSplitView.prototype.enableAlphabetBar =
function(enable) {
	this._alphabetBar.enable(enable);
};

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

	// create listview based on *required* existence in template
	var listviewCellId = this._htmlElId + "_listview";
	var listviewCell = document.getElementById(listviewCellId);
	this._listPart = new ZmContactSimpleView({parent:this, controller:controller, dropTgt:dropTgt});
	this._listPart.reparentHtmlElement(listviewCellId);

	// define well-known Id's
	this._iconCellId	= this._htmlElId + "_icon";
	this._titleCellId	= this._htmlElId + "_title";
	this._tagCellId		= this._htmlElId + "_tags";
	this._headerRowId	= this._htmlElId + "_headerRow";
	this._contactBodyId = this._htmlElId + "_body";

	// contact groups is not child of DwtTabGroup
	this._contactGroupView = new DwtComposite(this);
	this._contactGroupView.setVisible(false);
	this._contactGroupView.reparentHtmlElement(this._htmlElId + "_content");

	// add tabs to DwtTabGroup based on template
	var params = AjxTemplate.getParams("abook.Contacts#SplitView_tabs");
	var tabStr = params ? params["tabs"] : null;
	this._tabs = tabStr ? tabStr.split(",") : null;

	// create DwtTabGroup for contacts if in template
	if (this._tabs && this._tabs.length) {
		this._contactTabHeader = new DwtComposite(this);
		this._contactTabHeader.reparentHtmlElement(this._htmlElId + "_content");
		this._contactTabHeader.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#SplitView_header", {id:this._htmlElId});

		this._contactTabView = new DwtTabView(this._contactTabHeader, null, Dwt.STATIC_STYLE);
		this._contactTabView.addStateChangeListener(new AjxListener(this, this._tabStateChangeListener));

		for (var i = 0; i < this._tabs.length; i++) {
			var tab = this._tabs[i] = AjxStringUtil.trim(this._tabs[i]);
			var tabButtonId = ZmId.getTabId(this._controller._currentView, tab);
			var idx = this._contactTabView.addTab(ZmMsg[tab], null, tabButtonId);
			var view = new DwtTabViewPage(this._contactTabView, "ZmContactTabViewPage");
			view._setAllowSelection();
			view.setScrollStyle(Dwt.SCROLL);

			// reset event handlers for each view so object manager can process
			view._setMouseEventHdlrs();
			this._objectManager.setView(view);

			this._contactTabView.setTabView(idx, view);
		}

		this._tabViewHtml = {};
	} else {
		// otherwise, create an empty slate
		this._contactView = new DwtComposite(this);
		this._contactView.reparentHtmlElement(this._htmlElId + "_content");

		// reset event handlers so object manager can process
		this._contactView._setMouseEventHdlrs();
		this._objectManager.setView(this._contactView);
	}
};

ZmContactSplitView.prototype._tabStateChangeListener =
function(ev) {
	this._setContact(this._contact, this._isGalSearch);
};

ZmContactSplitView.prototype._sizeChildren =
function(width, height) {

	var listviewCell = document.getElementById(this._htmlElId + "_listview");
	var size = Dwt.getSize(listviewCell);

	if (this._contactTabView) {
		this._listPart.setSize(size.x, height-20);
		if (this._contact && this._contact.isGroup()) {
			var fudge = AjxEnv.isIE ? 27 : 20;
			this._contactGroupView.setSize(Dwt.DEFAULT, height-fudge);
		}
	} else {
		this._listPart.setSize(size.x, height-38);

		var fudge = AjxEnv.isIE ? 45 : 38;
		var view = (this._contact && this._contact.isGroup())
			? this._contactGroupView : this._contactView;

		if (view) {
			view.setSize(Dwt.DEFAULT, height-fudge);
		}
	}
};

ZmContactSplitView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT ||
		ev.source != this._contact ||
		ev.event == ZmEvent.E_DELETE)
	{
		return;
	}

	if (this._contactTabView) {
		var tabIdx = this._contactTabView.getCurrentTab();
		this._tabViewHtml[tabIdx] = false;
	}
	this._setContact(ev.source);
};

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

ZmContactSplitView.prototype._generateObject =
function(data, type) {
	return this._objectManager.findObjects(data, true, type);
};

ZmContactSplitView.prototype._setContact =
function(contact, isGal, oldContact) {
	if (this._contactTabView && !this._tabViewHtml) { return; }

	var folderId = contact.folderId;
	var folder = folderId ? appCtxt.getById(folderId) : null;
	var color = folder ? folder.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];

	var subs = {
		id: this._htmlElId,
		contact: contact,
		addrbook: contact.getAddressBook(),
		contactHdrClass: (ZmOrganizer.COLOR_TEXT[color] + "Bg"),
		isInTrash: (folder && folder.isInTrash())
	};

	if (contact.isGroup()) {
		subs.folderIcon = contact.addrbook.getIcon();
		subs.folderName = contact.addrbook.getName();
		subs.groupMembers = contact.getGroupMembers().good.getArray();

		this._resetVisibility(true);

		this._contactGroupView.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#SplitViewGroup", subs);
		var size = this.getSize();
		this._sizeChildren(size.x, size.y);
	} else {
		subs.view = this;
		subs.isGal = isGal;

		this._resetVisibility(false);

		// render the appropriate view
		if (this._contactTabView) {
			// only render HTML for tab if we haven't already
			var tabIdx = this._contactTabView.getCurrentTab();
			if (!this._tabViewHtml[tabIdx]) {
				subs.tabIdx = tabIdx;
				var tabName = this._tabs[tabIdx-1];
				var template = "abook.Contacts#SplitView_" + tabName;
				var view = this._contactTabView.getTabView(tabIdx);
				view.getHtmlElement().innerHTML = AjxTemplate.expand(template, subs);

				this._tabViewHtml[tabIdx] = true;
			}
		} else {
			this._contactView.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#SplitView_content", subs);
		}

		// notify zimlets that a new contact is being shown.
		if (appCtxt.zimletsPresent()) {
			appCtxt.getZimletMgr().notifyZimlets("onContactView", contact, this._htmlElId, tabIdx);
		}
	}

	this._setHeaderInfo();
};

ZmContactSplitView.prototype._resetVisibility =
function(isGroup) {
	if (this._contactTabView) {
		this._contactTabView.setVisible(!isGroup);
		this._contactTabHeader.setVisible(!isGroup);
	} else {
		this._contactView.setVisible(!isGroup);
	}
	this._contactGroupView.setVisible(isGroup);
};

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
		var icon = ZmTag.COLOR_ICON[tag.color];
		var attr = ["id='", this._tagCellId, tag.id, "'"].join("");
		// XXX: set proper class name for link once defined!
		html[idx++] = "<a href='javascript:;' class='' onclick='ZmContactSplitView._tagClicked(";
		html[idx++] = '"';
		html[idx++] = tag.id;
		html[idx++] = '"';
		html[idx++] = "); return false;'>"
		html[idx++] = AjxImg.getImageSpanHtml(icon, null, attr, tag.name);
		html[idx++] = "</a>&nbsp;";
	}
	return html.join("");
};

ZmContactSplitView.prototype._setHeaderInfo =
function(clear) {
	// set tags
	var tagCell = document.getElementById(this._tagCellId);
	if (tagCell) {
		tagCell.innerHTML = clear ? "" : this._getTagHtml();
	}
};

ZmContactSplitView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		var tagCell = document.getElementById(this._tagCellId);
		tagCell.innerHTML = this._getTagHtml();
	}
};

ZmContactSplitView._tagClicked =
function(tagId) {
	var sc = appCtxt.getSearchController();
	if (sc) {
		var tag = appCtxt.getById(tagId);
		var query = 'tag:"' + tag.name + '"';
		sc.search({query: query});
	}
};

//////////////////////////////////////////////////////////////////////////////
// ZmContactSimpleView
// - a simple contact list view (contains only full name)
//////////////////////////////////////////////////////////////////////////////
ZmContactSimpleView = function(params) {

	params.view = ZmId.VIEW_CONTACT_SIMPLE;
	params.className = "ZmContactSimpleView";
	ZmContactsBaseView.call(this, params);

	this._normalClass = DwtListView.ROW_CLASS + " SimpleContact";
	this._selectedClass = [DwtListView.ROW_CLASS, DwtCssStyle.SELECTED].join("-") + " SimpleContact";

	// handle a GAL ID such as:		V_CNS_uid=user5,ou=people,dc=pshahmacbook,dc=local
	this._parseIdRegex = /^V_([A-Z]+)_([a-z]*)_(.+)$/
};

ZmContactSimpleView.prototype = new ZmContactsBaseView;
ZmContactSimpleView.prototype.constructor = ZmContactSimpleView;

ZmContactSimpleView.prototype.toString =
function() {
	return "ZmContactSimpleView";
};

ZmContactSimpleView.prototype.set =
function(list, defaultColumnSort, folderId) {
	var fid = folderId || this._controller.getFolderId();
	ZmContactsBaseView.prototype.set.call(this, list, defaultColumnSort, fid);

	if (!(this._list instanceof AjxVector) || this._list.size() == 0) {
		this.parent.clear();
		var view = this._controller._getViewType();
		this._controller._navToolBar[view].setText("");
	}

	this.parent.enableAlphabetBar(!list.isGal);
};

ZmContactSimpleView.prototype.setSelection =
function(item, skipNotify) {
	// clear the right, content pane if no item to select
	if (!item) {
		this.parent.clear();
	}

	ZmContactsBaseView.prototype.setSelection.call(this, item, skipNotify);
};

ZmContactSimpleView.prototype._setNoResultsHtml =
function() {
	ZmContactsBaseView.prototype._setNoResultsHtml.call(this);
	this.parent.clear();
};

ZmContactSimpleView.prototype._changeListener =
function(ev) {
	// not sure if checking for the view is the right thing to do :/
	if (ev.event != ZmEvent.E_CREATE &&
		appCtxt.getCurrentViewId() != ZmId.VIEW_CONTACT_SIMPLE)
	{
		return;
	}

	ZmContactsBaseView.prototype._changeListener.call(this, ev);

	// bug fix #14874 - if moved to trash, show strike-thru
	var folderId = this._controller.getFolderId();
	if (!folderId && ev.event == ZmEvent.E_MOVE) {
		var contact = ev._details.items[0];
		var folder = appCtxt.getById(contact.folderId);
		var row = this._getElement(contact, ZmItem.F_ITEM_ROW);
		if (row) {
			row.className = folder && folder.isInTrash()
				? "Trash" : "";
		}
	}
};

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

ZmContactSimpleView.prototype._layout =
function() {
	// explicitly remove each child (setting innerHTML causes mem leak)
	while (this._parentEl.hasChildNodes()) {
		cDiv = this._parentEl.removeChild(this._parentEl.firstChild);
		this._data[cDiv.id] = null;
	}

	var size = this._list.size();
	for (var i = 0; i < size; i++) {
		var item = this._list.get(i);
		var div = item ? this._createItemHtml(item, {now:this._now}) : null;
		if (div) {
			this._addRow(div);
		}
	}
};

/**
 * A contact is normally displayed in a list view with no headers, and shows
 * just an icon and name. The mixed list view has headers, and the row can
 * be built in the standard way.
 *
 * @param contact	[ZmContact]		contact to display
 * @param params	[hash]*			optional params
 */
ZmContactSimpleView.prototype._createItemHtml =
function(contact, params) {

	if (params.isMixedView) {
		return ZmContactsBaseView.prototype._createItemHtml.apply(this, arguments);
	}

	var div = this._getDiv(contact, params);

	if (params.isDragProxy) {
		div.style.width = "175px";
		div.style.padding = "4px";
	}
	div.className = this._normalClass + " SimpleContact";
	div.id = this._getItemId(contact);

	var htmlArr = [];
	var idx = 0;

	// table/row
	idx = this._getTable(htmlArr, idx, params);
	idx = this._getRow(htmlArr, idx, contact, params);

	// checkbox selection
	if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
		idx = this._getImageHtml(htmlArr, idx, "TaskCheckbox", this._getFieldId(contact, ZmItem.F_SELECTION));
		htmlArr[idx++] = "</center></td>";
	}

	// icon
	htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
	htmlArr[idx++] = AjxImg.getImageHtml(contact.getIcon());
	htmlArr[idx++] = "</center></td>";

	// file as
	htmlArr[idx++] = "<td style='vertical-align:middle;'>&nbsp;";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs());
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

// mixed view
ZmContactSimpleView.prototype._getCellContents =
function(htmlArr, idx, contact, field, colIdx, params) {
	if (field == ZmItem.F_FROM) {
		// Name (fileAs)
		htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs());
	} else if (field == ZmItem.F_SUBJECT) {
		// Company
		htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getCompanyField());
	} else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = AjxDateUtil.computeDateStr(params.now, contact.modified);
	} else {
		idx = ZmContactsBaseView.prototype._getCellContents.apply(this, arguments);
	}

	return idx;
};

ZmContactSimpleView.prototype._getToolTip =
function(field, item, ev) {
	return (item && (field == ZmItem.F_FROM)) ? item.getToolTip(item.getAttr(ZmContact.F_email)) :
												ZmContactsBaseView.prototype._getToolTip.apply(this, arguments);
};

ZmContactSimpleView.prototype._getDateToolTip =
function(item, div) {
	div._dateStr = div._dateStr || this._getDateToolTipText(item.modified, ["<b>", ZmMsg.lastModified, "</b><br>"].join(""));
	return div._dateStr;
};
