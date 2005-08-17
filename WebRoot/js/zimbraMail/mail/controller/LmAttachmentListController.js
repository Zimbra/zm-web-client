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
function LmAttachmentListController(appCtxt, container, mailApp) {

	LmMailListController.call(this, appCtxt, container, mailApp);

	this._viewFactory = new Object();
	this._viewFactory[LmController.ATT_LIST_VIEW] = LmAttachmentListView;
	this._viewFactory[LmController.ATT_ICON_VIEW] = LmAttachmentIconView;
	this._toolbar = new Object();
	this._contentView = new Object();

	this._csfeMsgFetchSvc = location.protocol + "//" + this._container.getDocument().domain + appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI);
}

LmAttachmentListController.prototype = new LmMailListController;
LmAttachmentListController.prototype.constructor = LmAttachmentListController;

// Public methods

LmAttachmentListController.prototype.toString = 
function() {
	return "LmAttachmentListController";
}

LmAttachmentListController.prototype.show = 
function(view) {
	view = view || this._defaultView();

	this._setup(view);
	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._listView[view];
	this._setView(view, elements, true);
}

LmAttachmentListController.prototype._getViewType = 
function() {
	return this._currentView;
}

LmAttachmentListController.prototype._defaultView =
function() {
	return LmController.ATT_LIST_VIEW;
}

// minimal toolbar
LmAttachmentListController.prototype._getToolBarOps =
function() {
	var list = [LmOperation.NEW_MENU];
	return list;
}

// no action menu
LmAttachmentListController.prototype._getActionMenuOps =
function() {
	return null;
}

LmAttachmentListController.prototype._initializeToolBar = 
function(view) {
	if (!this._toolbar[view]) {
		LmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view);
		this._setNewButtonProps(view, LmMsg.compose, LmImg.I_MAIL_MSG, 
								LmImg.ID_MAIL_MSG, LmOperation.NEW_MESSAGE);
		this._toolbar[view].addFiller();
		var tb = new LmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, LmNavToolBar.SINGLE_ARROWS);
		this._setNavToolBar(tb);
    }
}

LmAttachmentListController.prototype._createNewView = 
function(view) {
	return (new this._viewFactory[view](this._container, null, Dwt.ABSOLUTE_STYLE));
}

// Create menu for View button and add listeners.
LmAttachmentListController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = new LmPopupMenu(appToolbar.getViewButton());
	var mi = menu.createMenuItem(LmController.ATT_LIST_VIEW, LmImg.I_LIST, LmMsg.list);
	mi.setData(LmOperation.MENUITEM_ID, LmController.ATT_LIST_VIEW);
    mi = menu.createMenuItem(LmController.ATT_ICON_VIEW, LmImg.I_ICON, LmMsg.icon);
	mi.setData(LmOperation.MENUITEM_ID, LmController.ATT_ICON_VIEW);
	
	var items = menu.getItems();
	var cnt = menu.getItemCount();
	for (var i = 0; i < cnt; i++)
		items[i].addSelectionListener(this._listeners[LmOperation.VIEW]);
}

LmAttachmentListController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._results);
}

// second arg below part of SKI DEMO HACK
LmAttachmentListController.prototype.setActiveSearch =
function(search, searchString) {
	this._activeSearch = search;
	if (this._appCtxt.get(LmSetting.SKI_HACK_ENABLED) && (searchString == "ski")) {
		this._results = this._getResultsAsMimeParts(search);
	} else {
		this._results = search.getResults(LmItem.ATT);
	}
	this.show(LmController.ATT_ICON_VIEW);
}

LmAttachmentListController.prototype.switchView = 
function(view) {
	// If we've already created the desired view, just swap it in (no need to do layout)	
	var viewExists = (this._listView[view] != null);
	this._setup(view);
	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._listView[view];
	this._setView(view, elements, true, false, viewExists);
}

// Enable clicking of fields to trigger searches.
LmAttachmentListController.prototype._listSelectionListener =
function(ev) {
	LmMailListController.prototype._listSelectionListener.call(this, ev);

	var msg = ev.item.getMessage();
	if (msg && ev.field == LmListView.FIELD_PREFIX[LmItem.F_FROM]) {
		var fromAddr = msg._addrs[LmEmailAddress.FROM].get(0);
		var sctrl = this._appCtxt.getSearchController();
		sctrl.fromSearch(fromAddr.getAddress());
	} else if (msg && ev.field == LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) {
		var conv = new LmConv(this._appCtxt); // should probably do search instead
		conv.id = msg.getConvId();
		conv.msgs.add(msg);
		conv.msgHitList[msg.id] = msg;
		this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvController().show(conv);
	}	
}

// SKI DEMO HACK for the most part. If we really do this, it should look recursively for parts instead of just
// one level. This code doesn't respect privacy.
LmAttachmentListController.prototype._getResultsAsMimeParts = 
function(search) {
	var msgList = search._msgList.getArray();
	for (var i = 0; i < msgList.length; i++) {
		var msg = msgList[i];
		if (msg.hasAttach) {
			msg.load();
			var topPart = LmMimePart.createFromDom(msg._partsDom, {appCtxt: this._appCtxt});
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
