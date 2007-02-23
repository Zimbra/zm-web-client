/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty attachment list controller.
* @constructor
* @class
* This class manages the display of lists of attachments (MIME parts). There are two
* different views, a list view and an icon view. The icon view will represent the
* attachment with an icon based on its type - for example, a PDF icon. If the attachment
* is an image, then a thumbnail is shown.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function ZmAttachmentListController(appCtxt, container, mailApp) {

	ZmMailListController.call(this, appCtxt, container, mailApp);

	this._viewFactory = new Object();
	this._viewFactory[ZmController.ATT_LIST_VIEW] = ZmAttachmentListView;
	this._viewFactory[ZmController.ATT_ICON_VIEW] = ZmAttachmentIconView;
	this._toolbar = new Object();
	this._contentView = new Object();
}

ZmAttachmentListController.prototype = new ZmMailListController;
ZmAttachmentListController.prototype.constructor = ZmAttachmentListController;

// Public methods

ZmAttachmentListController.prototype.toString = 
function() {
	return "ZmAttachmentListController";
}

ZmAttachmentListController.prototype.show = 
function(view) {
	view = view || this._defaultView();

	this._setup(view);
	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[view];
	this._setView(view, elements, true);
}

ZmAttachmentListController.prototype._getViewType = 
function() {
	return this._currentView;
}

ZmAttachmentListController.prototype._defaultView =
function() {
	return ZmController.ATT_LIST_VIEW;
}

// minimal toolbar
ZmAttachmentListController.prototype._getToolBarOps =
function() {
	return [ZmOperation.NEW_MENU];
}

// no action menu
ZmAttachmentListController.prototype._getActionMenuOps =
function() {
	return null;
}

ZmAttachmentListController.prototype._initializeToolBar = 
function(view) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view);
		this._setNewButtonProps(view, ZmMsg.compose, "NewMessage", "NewMessageDis", ZmOperation.NEW_MESSAGE);
		this._toolbar[view].addFiller();
		var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS);
		this._setNavToolBar(tb, view);
    }
}

ZmAttachmentListController.prototype._createNewView = 
function(view) {
	return (new this._viewFactory[view](this._container, null, Dwt.ABSOLUTE_STYLE, this));
}

// Create menu for View button and add listeners.
ZmAttachmentListController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = new ZmPopupMenu(appToolbar.getViewButton());
	var mi = menu.createMenuItem(ZmController.ATT_LIST_VIEW, "ListView", ZmMsg.list);
	mi.setData(ZmOperation.MENUITEM_ID, ZmController.ATT_LIST_VIEW);
    mi = menu.createMenuItem(ZmController.ATT_ICON_VIEW, "IconView", ZmMsg.icon);
	mi.setData(ZmOperation.MENUITEM_ID, ZmController.ATT_ICON_VIEW);
	
	var items = menu.getItems();
	var cnt = menu.getItemCount();
	for (var i = 0; i < cnt; i++)
		items[i].addSelectionListener(this._listeners[ZmOperation.VIEW]);
}

ZmAttachmentListController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._results);
}

// second arg below part of SKI DEMO HACK
ZmAttachmentListController.prototype.setActiveSearch =
function(search, searchString) {
	this._activeSearch = search;
	if (this._appCtxt.get(ZmSetting.SKI_HACK_ENABLED) && (searchString == "ski")) {
		this._results = this._getResultsAsMimeParts(search);
	} else {
		this._results = search.getResults(ZmItem.ATT);
	}
	this.show(ZmController.ATT_ICON_VIEW);
}

ZmAttachmentListController.prototype.switchView = 
function(view) {
	// If we've already created the desired view, just swap it in (no need to do layout)	
	var viewExists = (this._listView[view] != null);
	this._setup(view);
	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[view];
	this._setView(view, elements, true, false, viewExists);
}

// Enable clicking of fields to trigger searches.
ZmAttachmentListController.prototype._listSelectionListener =
function(ev) {
	ZmMailListController.prototype._listSelectionListener.call(this, ev);

	var msg = ev.item.getMessage();
	if (msg && ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_FROM]) {
		var fromAddr = msg._addrs[AjxEmailAddress.FROM].get(0);
		var sctrl = this._appCtxt.getSearchController();
		sctrl.fromSearch(fromAddr.getAddress());
	} else if (msg && ev.field == ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) {
		var conv = new ZmConv(this._appCtxt); // should probably do search instead
		conv.id = msg.getConvId();
		conv.msgs.add(msg);
		conv.msgHitList[msg.id] = msg;
		AjxDispatcher.run("GetConvController").show(conv);
	}	
}

// SKI DEMO ACK for the most part. If we really do this, it should look recursively for parts instead of just
// one level. This code doesn't respect privacy.
ZmAttachmentListController.prototype._getResultsAsMimeParts = 
function(search) {
	var msgList = search._msgList.getArray();
	for (var i = 0; i < msgList.length; i++) {
		var msg = msgList[i];
		if (msg.hasAttach) {
			msg.load();
			var topPart = ZmMimePart.createFromDom(msg._partsDom, {appCtxt: this._appCtxt});
			var subParts = topPart.getSubParts();
			for (var j = 0; j < subParts.length; j++) {
				var mp = subParts[j];
				var ct = mp.getContentType();
				if (ct.indexOf("image/") === 0) {
					mp.setMessage(msg);
					mp.setMessageId(msg.getId());
					var subject = mp.getSubject();
					if (!subject) {
						subject = msg.getSubject() || "";
						mp.setSubject(subject);
					}
					var date = mp.getDate();
					if (!date)
						mp.setDate(msg.getDate());
					search._attachmentList.getVector().add(mp);
				}
			}
		}
	}
	return search._attachmentList;
}
