/**
* Creates a new, empty double pane controller.
* @constructor
* @class
* This class manages the two-pane view. The top pane contains a list view of 
* items, and the bottom pane contains the selected item content.
*
* @author Parag Shah
* @param appCtxt	app context
* @param container	containing shell
* @param mailApp	containing app
*/
function LmDoublePaneController(appCtxt, container, mailApp) {

	if (arguments.length == 0) return;
	LmMailListController.call(this, appCtxt, container, mailApp);
	this._readingPaneOn = true;

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new LsListener(this, this._dragListener));	
	
	this._listeners[LmOperation.SHOW_ORIG] = new LsListener(this, this._showOrigListener);
}

LmDoublePaneController.prototype = new LmMailListController;
LmDoublePaneController.prototype.constructor = LmDoublePaneController;

// Public methods

LmDoublePaneController.prototype.toString = 
function() {
	return "LmDoublePaneController";
}

/**
* Displays the given item in a two-pane view. The view is actually
* created in _loadItem(), since it is a scheduled method and must execute
* last.
*
* @param activeSearch	the current search results
* @param searchString	the current search query string
* @param item			a generic item (LmItem)
*/
LmDoublePaneController.prototype.show =
function(search, searchString, item) {

	LmMailListController.prototype.show.call(this, search, searchString);
	this.reset();
	this._item = item;
	this._setup(this._currentView);

	// see if we have it cached? Check if conv loaded?
	// scheduled event has to be last, so it calls setView()
	this._schedule(this._loadItem, {item: item, view: this._currentView});
}

/**
* Clears the conversation view, which actually just clears the message view.
*/
LmDoublePaneController.prototype.reset =
function() {
	if (this._doublePaneView)
		this._doublePaneView.reset();
}

/**
* Shows or hides the reading pane.
*
* @param view		the id of the menu item
*/
LmDoublePaneController.prototype.switchView = 
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewButton().getMenu();
	var mi = menu.getItemById(LmOperation.MENUITEM_ID, view);
	if (this._readingPaneOn == mi.getChecked()) return;
	
	this._readingPaneOn = mi.getChecked();
	this._doublePaneView.toggleView();
		
	// set msg in msg view if reading pane is being shown
	if (this._readingPaneOn) {
		var currentMsg = this._doublePaneView.getSelection()[0];
		// DONT bother checking if current msg is already being displayed!
		if (currentMsg) {
			if (!currentMsg.isLoaded())
				currentMsg.load(this._appCtxt.get(LmSetting.VIEW_AS_HTML));
	
			this._doublePaneView.setMsg(currentMsg);
		}
	}
		
	this._doublePaneView.getMsgListView()._resetColWidth();
}

// called after a delete has occurred. 
// Return value indicates whether view was popped as a result of a delete
LmDoublePaneController.prototype.handleDelete = 
function() {
	return false;
}

// Private and protected methods

LmDoublePaneController.prototype._createDoublePaneView = 
function() {
	// overload me
};

// Creates the conv view, which is not a standard list view (it's a two-pane
// sort of thing).
LmDoublePaneController.prototype._initialize =
function(view) {
	// set up double pane view (which creates the MLV and MV)
	if (!this._doublePaneView){
		this._doublePaneView = this._createDoublePaneView();
		this._doublePaneView.addInviteReplyListener(this._inviteReplyListener);
	}

	LmMailListController.prototype._initialize.call(this, view);
}

LmDoublePaneController.prototype._getToolBarOps =
function() {
	var list = this._standardToolBarOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(LmOperation.SEP);
	list.push(LmOperation.SPAM);
	return list;
}

LmDoublePaneController.prototype._getActionMenuOps =
function() {
	var list = this._flagOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._msgOps());
	list.push(LmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	list.push(LmOperation.SEP);
	list.push(LmOperation.SHOW_ORIG);
	return list;
}

// Returns the already-created message list view.
LmDoublePaneController.prototype._createNewView = 
function() {
	var mlv = null;
	if (this._doublePaneView) {
		mlv = this._doublePaneView.getMsgListView();
		mlv.setDragSource(this._dragSrc);
	}
	return mlv;
}

LmDoublePaneController.prototype.getReferenceView = 
function() {
	return this._doublePaneView;
};

LmDoublePaneController.prototype._getTagMenuMsg = 
function(num) {
	return (num == 1) ? LmMsg.tagMessage : LmMsg.tagMessages;
}

LmDoublePaneController.prototype._getMoveDialogTitle = 
function(num) {
	return (num == 1) ? LmMsg.moveMessage : LmMsg.moveMessages;
}

LmDoublePaneController.prototype._setViewContents =
function(view) {
	this._doublePaneView.setItem(this._item);
}

LmDoublePaneController.prototype._setSelectedMsg =
function() {
	var selCnt = this._listView[this._currentView].getSelectionCount();
	if (selCnt == 1) {
		// Check if currently displaying selected element in message view
		var msg = this._listView[this._currentView].getSelection()[0];
		if (!msg.isLoaded()) {
			this._appCtxt.getSearchController().setEnabled(false);
			this._schedule(this._doGetMsg, {msg: msg});
		} else {
			if (msg.isUnread)
				this._markReadListener();
			this._doublePaneView.setMsg(msg);
		}
	}
}

// Adds a "Reading Pane" checked menu item to a view menu
LmDoublePaneController.prototype._setupReadingPaneMenuItem =
function(view, menu, checked) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = menu ? menu : appToolbar.getViewMenu(view);
	if (!menu) { // should have a menu by now, from _setupGroupByMenuItems()
		menu = new LmPopupMenu(appToolbar.getViewButton());
	}
	var id = LmController.READING_PANE_VIEW;
	if (menu._menuItems[id] == null) {
		var mi = menu.createMenuItem(id, LmImg.I_PANE_DOUBLE, LmMsg.readingPane, null, true, DwtMenuItem.CHECK_STYLE);
		mi.setData(LmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[LmOperation.VIEW]);
		mi.setChecked(checked, true);
	}
	appToolbar.setViewMenu(view, menu);
	return menu;
}

// List listeners

// Clicking on a message in the message list loads and displays it.
LmDoublePaneController.prototype._listSelectionListener =
function(ev) {
	LmMailListController.prototype._listSelectionListener.call(this, ev);
	
	var currView = this._listView[this._currentView];

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var msg = this._getMsg();
		if (msg) {
			if (msg.isDraft) {
				// open draft in compose view
				this._doAction(ev, LmOperation.DRAFT);
			} else if (!this._readingPaneOn) {
				try {
					this._app.getMsgController().show(msg, currView._mode);
				} catch (ex) {
					this._handleException(ex, this._listSelectionListener, ev, false);
				}
			}
		}
	} else {
		if (this._readingPaneOn) {
			this._setSelectedMsg();
	    } else {
			var msg = currView.getSelection()[0];
			if (msg)
				this._doublePaneView.resetMsg(msg);
	    }
    }
}

LmDoublePaneController.prototype._listActionListener =
function(ev) {
	LmMailListController.prototype._listActionListener.call(this, ev);

	if (!this._readingPaneOn) {
		// reset current message
		var msg = this._listView[this._currentView].getSelection()[0];
		if (msg)
			this._doublePaneView.resetMsg(msg);
	}
}

// Check to see if the entire conversation is now read.
LmDoublePaneController.prototype._markReadListener = 
function(ev) {
	this._list.markRead(this._listView[this._currentView].getSelection(), true);
}

// Check to see if the entire conversation is now unread.
LmDoublePaneController.prototype._markUnreadListener = 
function(ev) {
	this._list.markRead(this._listView[this._currentView].getSelection(), false);
}

LmDoublePaneController.prototype._showOrigListener = 
function(ev) {

	var msg = this._listView[this._currentView].getSelection()[0];
	if (msg) {
		var msgFetchUrl = location.protocol + "//" + document.domain + this._appCtxt.get(LmSetting.CSFE_MSG_FETCHER_URI) + "id=" + msg.id;
		// create a new window w/ generated msg based on msg id
		window.open(msgFetchUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
	}
}

// Data handling

// Loads the given item and displays it. The first message will be 
// selected, which will trigger a message load/display.
LmDoublePaneController.prototype._loadItem =
function(params) {
	try {
		if (params.item.load) {
			var results = params.item.load(this.getSearchString());
			if (results instanceof LmList) {
				this._list = results;
				this._activeSearch = results;
			}
		}
		var elements = new Object();
		elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[params.view];
		elements[LmAppViewMgr.C_APP_CONTENT] = this._doublePaneView;
		this._setView(params.view, elements, this._isTopLevelView());
		this._resetNavToolBarButtons(params.view);
				
		// always allow derived classes to reset size after loading
		var sz = this._doublePaneView.getSize();
		this._doublePaneView._resetSize(sz.x, sz.y);
	} catch (ex) {
		this._handleException(ex, LmDoublePaneController.prototype._loadItem, params);
	}
}

// Loads and displays the given message. If the message was unread, it gets marked as
// read, and the conversation may be marked as read as well.
LmDoublePaneController.prototype._doGetMsg =
function(params) {
	var msg = params.msg;
	if (msg) {
		try {
			msg.load(this._appCtxt.get(LmSetting.VIEW_AS_HTML));
			this._doublePaneView.setMsg(msg);
			this._appCtxt.getSearchController().setEnabled(true);
		} catch (ex) {
			this._handleException(ex, LmDoublePaneController.prototype._doGetMsg, params, false);
		}
	} else {
		DBG.println("XXX: msg not loaded!");
	}
}

// Returns the message currently being displayed.
LmDoublePaneController.prototype._getMsg =
function() {
	return this._listView[this._currentView].getSelection()[0];
}

LmDoublePaneController.prototype._dragListener =
function(ev) {
	LmListController.prototype._dragListener.call(this, ev);
	if (ev.action == DwtDragEvent.DRAG_END)
		this._resetOperations(this._toolbar[this._currentView], this._doublePaneView.getSelection().length);
}

LmDoublePaneController.prototype._cacheList = 
function(search) {

	if (this._list) {
		var newList = search.getResults(LmItem.MSG).getVector();
		var offset = parseInt(search.getAttribute("offset"));
		this._list.cache(offset, newList);
	} else {
		this._list = search.getResults(LmItem.MSG);
	}
}

LmDoublePaneController.prototype._resetOperations = 
function(parent, num) {
	LmMailListController.prototype._resetOperations.call(this, parent, num);
	parent.enable(LmOperation.SHOW_ORIG, num == 1);
}

// top level view means this view is allowed to get shown when user clicks on 
// app icon in app toolbar - overload to not allow this.
LmDoublePaneController.prototype._isTopLevelView = 
function() {
	return true;
}
