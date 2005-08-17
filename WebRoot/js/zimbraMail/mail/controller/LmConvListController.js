/**
* Creates a new, empty conversation list controller.
* @constructor
* @class
* This class manages the conversation list view.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function LmConvListController(appCtxt, container, mailApp) {

	LmMailListController.call(this, appCtxt, container, mailApp);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new LsListener(this, this._dragListener));
}

LmConvListController.prototype = new LmMailListController;
LmConvListController.prototype.constructor = LmConvListController;

// Public methods

LmConvListController.prototype.toString = 
function() {
	return "LmConvListController";
}

/**
* Displays the given search results as a list of conversations.
*
* @param search		search results (which should contain a list of conversations)
*/
LmConvListController.prototype.show =
function(searchResult, searchString) {
	
	// save previous offset and folder Id
	var oldOffset = this._listView[this._currentView] ? this._listView[this._currentView].getOffset() : 0;
	var oldFolderId = null;
	if (this._activeSearch && this._activeSearch.search)
		oldFolderId = this._activeSearch.search.folderId;

	LmMailListController.prototype.show.call(this, searchResult, searchString);
	
	this._list = searchResult.getResults(LmItem.CONV);
	this._setup(this._currentView);

	// if folders match and we're on the first page
	var selectedIdx = 0;
	if (oldFolderId && searchResult.search && searchResult.search.folderId && 
		oldFolderId == searchResult.search.folderId && oldOffset == 0)
	{
		// save first selected index if applicable
		var selectedItem = this._listView[this._currentView].getSelection()[0];
		if (selectedItem)
			selectedIdx = this._listView[this._currentView]._getItemIndex(selectedItem);
	}
	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
	this._setView(this._currentView, elements, true);
	this._setViewMenu(LmController.CONVLIST_VIEW);
	this._setGroupMailBy(LmItem.CONV);

	// reset selected index prior to resetting new list items
	var list = this._listView[this._currentView].getList();
	if (list) {
		var selectedItem = list.get(selectedIdx);
		if (!selectedItem && list.size() > 0)
			selectedItem = list.get(0);
		if (selectedItem)
			this._listView[this._currentView].setSelection(selectedItem);
	}
	
	this._resetNavToolBarButtons(this._currentView);
}

// Private and protected methods

// Custom tooltips for Reply/Reply All/Forward
LmConvListController.prototype._initializeToolBar = 
function(view, arrowStyle) {
	LmMailListController.prototype._initializeToolBar.call(this, view, arrowStyle);
	var buttons = [LmOperation.REPLY, LmOperation.REPLY_ALL, LmOperation.FORWARD];
	for (var i = 0; i < buttons.length; i++) {
		var b = this._toolbar[view].getButton(buttons[i]);
		var key = LmOperation.MSG_KEY_TT[buttons[i]] + "Conv";
		if (b)
			b.setToolTipContent(LmMsg[key]);
	}
}

LmConvListController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(LmOperation.SEP);
	list.push(LmOperation.SPAM);
	return list;
}

LmConvListController.prototype._getActionMenuOps =
function() {
	var list = this._flagOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(LmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
}

LmConvListController.prototype._getViewType = 
function() {
	return LmController.CONVLIST_VIEW;
}

LmConvListController.prototype._getItemType =
function() {
	return LmItem.CONV;
}

LmConvListController.prototype._defaultView = 
function() {
	return LmController.CONVLIST_VIEW;
}

LmConvListController.prototype._createNewView = 
function(view) {
	var clv = new LmConvListView(this._container, null, Dwt.ABSOLUTE_STYLE, this, this._dropTgt);
	clv.setDragSource(this._dragSrc);
	return clv;
}

LmConvListController.prototype._setupViewMenu =
function(view) {
	LmMailListController.prototype._setupGroupByMenuItems.call(this, view);
}

LmConvListController.prototype.switchView =
function(view) {
	if (view == LmController.TRAD_VIEW) {
		var sc = this._appCtxt.getSearchController();
		var sortBy = this._appCtxt.get(LmSetting.SORTING_PREF, LmController.TRAD_VIEW);
		var limit = this._appCtxt.get(LmSetting.PAGE_SIZE); // bug fix #3365
		sc.redoSearch(this._appCtxt.getCurrentSearch(), null, {types: [LmItem.MSG], offset: 0, sortBy: sortBy, limit: limit});
	}
}

LmConvListController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? LmMsg.tagConversation : LmMsg.tagConversations;
}

LmConvListController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? LmMsg.moveConversation : LmMsg.moveConversations;
}

LmConvListController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list, LmItem.F_DATE);
}

// Returns the message currently being displayed.
LmConvListController.prototype._getMsg =
function() {

	var msg = null;

	// get the currently selected conversation
	var conv = this._listView[this._currentView].getSelection()[0];
	if (conv) {
		// has this conv been loaded yet?
		if (conv.msgs) {
			// then always return the first msg in the list
			msg = conv.msgs.getVector().get(0);
		} else if (conv.tempMsg) {
			msg = conv.tempMsg;
		} else {
			// otherwise, create a temp msg w/ the msg op Id
			msg = new LmMailMsg(this._appCtxt);
			msg.id = conv.msgOpId;
			conv.tempMsg = msg; 	// cache it.
		}
		
		// set the conv's list w/in msg
		msg.list = conv.list;
	}
	
	return msg;
}


// List listeners

// Show conversation on double-click
LmConvListController.prototype._listSelectionListener =
function(ev) {
	try {
		LmMailListController.prototype._listSelectionListener.call(this, ev);
		if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
			if (ev.item.isDraft) {
				this._doAction(ev, LmOperation.DRAFT);
			} else {
				this._app.getConvController().show(null, this._searchString, ev.item);
			}
		}
	} catch (ex) {
		this._handleException(ex, this._listSelectionListener, ev, false);
	}
}

LmConvListController.prototype._paginateCallback = 
function(args) {
	LmMailListController.prototype._paginateCallback.call(this, args);
	
	var convIdx = args[1];
	var newConv = convIdx ? this._list.getVector().get(convIdx) : null;
	if (newConv)
		this._listView[this._currentView].emulateDblClick(newConv);
}

// Miscellaneous

// If we're viewing the Trash folder, do a hard delete of the selected convs
LmConvListController.prototype._doDelete = 
function(params) {
	params.hardDelete = (this._list.search.folderId == LmFolder.ID_TRASH);
	LmMailListController.prototype._doDelete.call(this, params);
	this._resetOperations(this._toolbar[this._currentView], 
						  this._listView[this._currentView].getSelectedItems().size());
}

LmConvListController.prototype._doMove = 
function(params) {
	LmMailListController.prototype._doMove.call(this, params);
	this._resetOperations(this._toolbar[this._currentView], 
						  this._listView[this._currentView].getSelectedItems().size());
}

LmConvListController.prototype._cacheList = 
function(search) {
	if (this._list) {
		var newList = search.getResults(LmItem.CONV).getVector();
		var offset = parseInt(search.getAttribute("offset"));
		this._list.cache(offset, newList);
	} else {
		this._list = search.getResults(LmItem.CONV);
	}
}

LmConvListController.prototype._resetNavToolBarButtons = 
function(view) {
	LmMailListController.prototype._resetNavToolBarButtons.call(this, view);
	this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.page);
	this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.page);
}

LmConvListController.prototype._processPrePopView = 
function(view) {
	this._resetNavToolBarButtons(view);
}
