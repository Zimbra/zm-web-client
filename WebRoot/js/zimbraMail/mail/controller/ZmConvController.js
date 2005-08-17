/**
* Creates a new, empty conversation controller.
* @constructor
* @class
* This class manages the two-pane conversation view. The top pane contains a list
* view of the messages in the conversation, and the bottom pane contains the current
* message.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function LmConvController(appCtxt, container, mailApp) {

	LmDoublePaneController.call(this, appCtxt, container, mailApp);

	this._convDeleteListener = new LsListener(this, this._deleteListener);
	this._listeners[LmOperation.DELETE_MENU] = this._convDeleteListener;
	this._listeners[LmOperation.CLOSE] = new LsListener(this, this._backListener);
}

LmConvController.prototype = new LmDoublePaneController;
LmConvController.prototype.constructor = LmConvController;

// Public methods

LmConvController.prototype.toString = 
function() {
	return "LmConvController";
}

/**
* Displays the given conversation in a two-pane view. The view is actually
* created in _loadConv(), since it is a scheduled method and must execute
* last.
*
* @param activeSearch	the current search results
* @param searchString	the current search query string
* @param conv			a conversation (LmConv)
*/
LmConvController.prototype.show =
function(activeSearch, searchString, conv) {
	this._conv = conv;
	// always reset offset & sortby to asc.
	if (this._listView[this._currentView]) {
		this._listView[this._currentView].setOffset(0);	
		this._listView[this._currentView].setSortByAsc(LmItem.F_DATE, false);
	}
	this._setViewMenu(LmController.CONV_VIEW);

	// this._list will be set when conv is loaded
	LmDoublePaneController.prototype.show.call(this, activeSearch, searchString, conv);
}

LmConvController.prototype.getConv = 
function() {
	return this._conv;
}

// Private and protected methods

LmConvController.prototype._createDoublePaneView = 
function() {
	return new LmConvView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
}

// Creates the conv view, which is not a standard list view (it's a two-pane sort of thing).
LmConvController.prototype._initialize =
function(view) {
	LmDoublePaneController.prototype._initialize.call(this, view);
	
	// set up custom listeners for this view 
	if (this._doublePaneView)
		this._doublePaneView.addTagClickListener(new LsListener(this, LmConvController.prototype._convTagClicked));
}

LmConvController.prototype._initializeToolBar = 
function(view) {
	if (!this._toolbar[view])
		LmDoublePaneController.prototype._initializeToolBar.call(this, view, LmNavToolBar.ALL_ARROWS);
	this._setupDeleteMenu(view);	// ALWAYS call setup to turn delete menu on/off
}

LmConvController.prototype._setupViewMenu =
function(view) {
	this._setupReadingPaneMenuItem(view, null, true);
}

LmConvController.prototype._setupDeleteMenu =
function(view) {
	var delButton = this._toolbar[view].getButton(LmOperation.DELETE_MENU);
	if (this._conv.numMsgs > 1) {
		var menu = new LmPopupMenu(delButton);
		delButton.setMenu(menu);
		
		var mi = menu.createMenuItem(LmOperation.DELETE_CONV, LmOperation.IMAGE[LmOperation.DELETE_CONV], LmMsg[LmOperation.MSG_KEY[LmOperation.DELETE_CONV]]);
		mi.setData(LmOperation.MENUITEM_ID, LmOperation.DELETE_CONV);
		mi.addSelectionListener(this._listeners[LmOperation.DELETE]);

	} else {
		if (delButton.getMenu())
			delButton.setMenu(null);
	}
}

LmConvController.prototype._getToolBarOps =
function() {
	var list = LmDoublePaneController.prototype._getToolBarOps.call(this);
	list.push(LmOperation.CLOSE);
	return list;
}

LmConvController.prototype._standardToolBarOps =
function() {
	var list = [LmOperation.NEW_MENU];
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		list.push(LmOperation.TAG_MENU);
	if (this._appCtxt.get(LmSetting.PRINT_ENABLED))
		list.push(LmOperation.PRINT);
	list.push(LmOperation.DELETE_MENU, LmOperation.MOVE);
	return list;
}

LmConvController.prototype._getViewType =
function() {
	return LmController.CONV_VIEW;
}

LmConvController.prototype._getItemType =
function() {
	return LmItem.MSG;
}

LmConvController.prototype._defaultView =
function() {
	return LmController.CONV_VIEW;
}

LmConvController.prototype._resetSelection = 
function(idx) {
	// do nothing (dont want base class functionality)
}

// Operation listeners

// Delete one or more items.
LmConvController.prototype._deleteListener = 
function(ev) {
	
	if (ev.item.getData(LmOperation.MENUITEM_ID) == LmOperation.DELETE_CONV) {
		// use conv list controller to delete conv
		var clc = this._app.getConvListController();
		clc._schedule(clc._doDelete, {items: [this._conv]});
		this._app.popView();
	} else {
		LmDoublePaneController.prototype._deleteListener.call(this, ev);
	}
}

// If one or more messages have been moved/deleted, and the CLV from which we came represents
// folder contents, see if this conv still belongs in that folder. It does if it has at least
// one message still in that folder. Note that the conv item in the CLV isn't physically moved
// or deleted, it's just removed from the view and its underlying list.
LmConvController.prototype._checkConvLocation =
function() {
	var clc = this._app.getConvListController();
	var list = clc.getList();
	var folderId = list.search.folderId;
	if (folderId) {
		if (this._conv.checkMoved(folderId)) { // view notif happens here
			list.remove(this._conv);
			clc._checkReplenish();
		}
	}
}

// Tag in the summary area clicked, do a tag search.
LmConvController.prototype._convTagClicked =
function(tagId) {
	var tag = this._appCtxt.getTagList().getById(tagId);
	var query = 'tag:"' + tag.name + '"';
	var searchController = this._appCtxt.getSearchController();
	searchController.search(query);
}

LmConvController.prototype._doDelete =
function(params) {
	LmDoublePaneController.prototype._doDelete.call(this, params);
	this._checkConvLocation();
}

LmConvController.prototype._doMove =
function(params) {
	LmDoublePaneController.prototype._doMove.call(this, params);
	this._checkConvLocation();
}

LmConvController.prototype._doSpam =
function(params) {
	LmDoublePaneController.prototype._doSpam.call(this, params);
	this._checkConvLocation();
}

// Handle DnD tagging (can only add a tag to a single item) - if a tag got dropped onto
// a msg, we need to update its conv
LmConvController.prototype._dropListener =
function(ev) {
	LmListController.prototype._dropListener.call(this, ev);
	// need to check to make sure tagging actually happened
	if (ev.action == DwtDropEvent.DRAG_DROP) {
		var div = DwtUiEvent.getTargetWithProp(ev.uiEvent, "_itemIndex");
		if (div) {
			var tag = ev.srcData;
			if (!this._conv.hasTag(tag.id)) {
				this._doublePaneView._setTags(this._conv); 	// update tag summary
			}
		}
	}
}

// Miscellaneous

// called after a delete has occurred. 
// Return value indicates whether view was popped as a result of a delete
LmConvController.prototype.handleDelete = 
function() {
	
	var popView = true;

	if (this._conv.numMsgs > 1) {
		// get the search folder if one exists
		var clc = this._app.getConvListController();
		var search = clc.getList().search;
		var folderId = search.folderId ? (parseInt(search.folderId)) : null;
		if (folderId && this._conv.msgs) {
			// search all msgs in conv to see if at least one is in search folder
			var msgs = this._conv.msgs.getArray();
			for (var i = 0; i < msgs.length; i++) {
				if (msgs[i].folderId == folderId) {
					popView = false;
					break;
				}
			}
		} else {
			// must be custom/saved search, dont pop!
			popView = false;
		}
	}
	
	// Don't pop unless we're currently visible!
	popView = popView && (this._appCtxt.getCurrentView() == this._currentView);

	if (popView) {
		this._app.popView();
	} else {
		// otherwise disable delete toolbar button if selected msg has been deleted
		var bAllDeleted = true;
		var selection = this._listView[this._currentView].getSelection();
		for (var i = 0; i < selection.length; i++) {
			if (selection[i].folderId != LmFolder.ID_TRASH) {
				bAllDeleted = false;
				break;
			}
		}
		this._toolbar[this._currentView].getButton(LmOperation.DELETE_MENU).setEnabled(!bAllDeleted);
	}

	return popView;
}

LmConvController.prototype._resetOperations = 
function(parent, num) {
	LmDoublePaneController.prototype._resetOperations.call(this, parent, num);

	var canDelete = true;
	if (this._getSearchFolderId() != LmFolder.ID_TRASH) {
		// if all selected items are deleted, then disable delete button
		// XXX: hmmm, that also disables "Delete Conv" in the menu
		canDelete = false;
		var selItems = this._listView[this._currentView].getSelection();
		for (var i = 0; i < selItems.length; i++) {
			if (selItems[i] && selItems[i].folderId != LmFolder.ID_TRASH) {
				canDelete = true;
				break;
			}
		}
	}
	
	parent.enable(LmOperation.DELETE_MENU, canDelete);
	parent.enable(LmOperation.CLOSE, true);
}

LmConvController.prototype._resetNavToolBarButtons = 
function(view) {
	LmDoublePaneController.prototype._resetNavToolBarButtons.call(this, view);

	var list = this._conv.list.getVector();
	
	// enable/disable up/down buttons per conversation index
	var first = list.get(0);
	this._navToolBar.enable(LmOperation.PAGE_DBL_BACK, (first && first != this._conv));
	var enablePgDn = this._conv.list.hasMore() || (list.getLast() != this._conv);
	this._navToolBar.enable(LmOperation.PAGE_DBL_FORW, enablePgDn);

	this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.page);	
	this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.page);
	this._navToolBar.setToolTip(LmOperation.PAGE_DBL_BACK, LmMsg.previous + " " + LmMsg.conversation);
	this._navToolBar.setToolTip(LmOperation.PAGE_DBL_FORW, LmMsg.next + " " + LmMsg.conversation);
}

// overloaded...
LmConvController.prototype._search = 
function(view, offset, limit, callback) {

	var sortby = this._appCtxt.get(LmSetting.SORTING_PREF, view);
	this._schedule(this._doSearch, {sortby: sortby, offset: offset, limit: limit, callback: callback});
}

LmConvController.prototype._doSearch = 
function(params) {
	try {
		this._conv.load(this._searchString, params.sortby, params.offset, params.limit, params.callback);
	} catch (ex) {
		this._handleException(ex, this._doSearch, params, false);
	}
}

LmConvController.prototype._paginateDouble = 
function(bDoubleForward) {
	var clc = this._app.getConvListController();
	if (clc)
		clc.pageItemSilently(this._conv, bDoubleForward);
}

LmConvController.prototype._paginateCallback = 
function(args) {
	LmMailListController.prototype._paginateCallback.call(this, args);
	
	var msgIdx = args[1];
	var newMsg = msgIdx ? this._list.getVector().get(msgIdx) : null;
	if (newMsg)
		this._listView[this._currentView].emulateDblClick(newMsg);
}

LmConvController.prototype._getSearchFolderId = 
function() {
	return this._conv.list.search.folderId;
}

// top level view means this view is allowed to get shown when user clicks on 
// app icon in app toolbar - we dont want conv view to be top level (always show CLV)
LmConvController.prototype._isTopLevelView = 
function() {
	return false;
}
