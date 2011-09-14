/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @param container		containing shell
 * @param app			containing app
 */
ZmNotebookFileController = function(container, app) {
	ZmNotebookController.call(this, container, app);

	this._listChangeListener = new AjxListener(this,this._fileListChangeListener);
	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._listeners[ZmOperation.UNDELETE] = new AjxListener(this, this._undeleteListener);
}

ZmNotebookFileController.prototype = new ZmNotebookController;
ZmNotebookFileController.prototype.constructor = ZmNotebookFileController;

ZmNotebookFileController.prototype.toString = function() {
	return "ZmNotebookFileController";
};

// Public methods

ZmNotebookFileController.prototype.show =
function(searchResults, fromUserSearch) {
	ZmListController.prototype.show.call(this, searchResults);

	this._fromSearch = fromUserSearch;
	this._currentView = ZmId.VIEW_NOTEBOOK_FILE;
	this._setup(this._currentView);

	var temp_list = searchResults.getResults(ZmItem.MIXED);
    this._list = new ZmMailList(ZmItem.MIXED, searchResults.search);
    //Filter briefcase documents
    if(temp_list){
        var temp_arr = temp_list.getArray();
        for (var i=0; i < temp_arr.length ; i++) {
            var r = temp_arr[i];
            var org = appCtxt.getById(r.folderId);
            if(org && org instanceof ZmNotebook){
               this._list.add(r);
            }
        }
    }
    var lv = this._listView[this._currentView];
	if (this._activeSearch) {
		if (this._list) {
			var items = this._list.getArray();
			if(items){
				var list = ((items instanceof Array) && items.length>0) ? items[0].list : items.list;
				if(list) {
					list.addChangeListener(this._listChangeListener);
				}
			}		
			this._list.setHasMore(this._activeSearch.getAttribute("more"));
		}
		if (lv) {
			lv.offset = parseInt(this._activeSearch.getAttribute("offset"));
		}
	}

	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = lv;
	this._setView({view:this._currentView, elements:elements, isAppView:true});
	this._resetNavToolBarButtons(this._currentView);

	// always set the selection to the first item in the list
	var list = lv.getList();
	if (list && list.size() > 0) {
		lv.setSelection(list.get(0));
	}
};

ZmNotebookFileController.prototype._printListener =
function(ev) {
	var listView = this._listView[this._currentView];
	var items = listView.getSelection();
	var page = (items instanceof Array) ? items[0] : items;

	window.open(page.getRestUrl(true), "_blank");
};

// Resets the available options on a toolbar or action menu.
ZmNotebookFileController.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);

	var toolbar = this._toolbar[this._currentView];
	var buttonIds = [ ZmOperation.SEND, ZmOperation.DETACH ];
	toolbar.enable(buttonIds, true);
};


// Private and protected methods

ZmNotebookFileController.prototype._getToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU, ZmOperation.EDIT, ZmOperation.SEP];

	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		list.push(ZmOperation.TAG_MENU, ZmOperation.SEP);
	}

	list.push(ZmOperation.DELETE,
				ZmOperation.FILLER,
				ZmOperation.SEND_PAGE,
				ZmOperation.SEP,
				ZmOperation.DETACH);
	return list;
};

ZmNotebookFileController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) return;

	ZmNotebookController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].addFiller();

	var tb = new ZmNavToolBar({parent:this._toolbar[view], context:view});
	this._setNavToolBar(tb, view);

	this._setNewButtonProps(view, ZmMsg.compose, "NewPage", "NewPageDis", ZmOperation.NEW_PAGE);

	var toolbar = this._toolbar[view];
	var button = toolbar.getButton(ZmOperation.EDIT);
	button.setEnabled(false);
};

ZmNotebookFileController.prototype._initializeActionMenu =
function() {
	ZmListController.prototype._initializeActionMenu.call(this);

	// based on current search, show/hide undelete menu option
	var folder = this._getSearchFolder();
	var showUndelete = folder && folder.isInTrash();
	var actionMenu = this._actionMenu;
	var mi = actionMenu.getMenuItem(ZmOperation.UNDELETE);
	mi.setVisible(showUndelete);
};

ZmNotebookFileController.prototype._getActionMenuOps =
function() {
	var list = this._standardActionMenuOps();
	list.push(ZmOperation.UNDELETE);
	return list;
};

ZmNotebookFileController.prototype._getViewType =
function() {
	return ZmId.VIEW_NOTEBOOK_FILE;
};

ZmNotebookFileController.prototype._createNewView =
function(viewType) {
	var result = new ZmFileListView({parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE,
									 controller:this, dropTgt:this._dropTgt});
	result.setDragSource(this._dragSrc);
	return result;
};

ZmNotebookFileController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagItem : ZmMsg.tagItems;
};

ZmNotebookFileController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.moveItem : ZmMsg.moveItems;
};

ZmNotebookFileController.prototype._setViewContents =
function(view) {
	this._listView[view].set(this._list);
};


// List listeners

ZmNotebookFileController.prototype._editListener =
function(event) {
	var pageEditController = this._app.getPageEditController();
	var page = this._listView[this._currentView].getSelection()[0];
	pageEditController.show(page);
};
ZmNotebookFileController.prototype._resetOperations =
function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) { return; }

	ZmNotebookController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);

	var selection = this._listView[this._currentView].getSelection();

	var buttons = [ZmOperation.TAG_MENU, ZmOperation.DELETE];
	toolbarOrActionMenu.enable(buttons, (selection.length > 0));

	var enabled = selection.length == 1 && selection[0].type == ZmItem.PAGE;
	toolbarOrActionMenu.enable([ZmOperation.EDIT], enabled);
};

// Double click displays an item.
ZmNotebookFileController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._doSelectDblClicked(ev.item);
	}
};

ZmNotebookFileController.prototype._doSelectDblClicked =
function(item, fromSearch) {
	item.type = (item instanceof ZmPage) ? ZmItem.PAGE : ZmItem.DOCUMENT;

	if (item.type == ZmItem.PAGE) {
		var controller = this._app.getNotebookController();
		controller.show(item, true, this._fromSearch || fromSearch);
	} else if (item.type == ZmItem.DOCUMENT) {
		var url = item.getRestUrl();
        var parts = url.split("#");
        var nurl = parts[0] + (url.indexOf('?') < 0 ? '?' : '&') + ("disp=i") + (parts[1] ? "#" + parts[1] : '');
		window.open(nurl, "_new", "");											// TODO: popup window w/ REST URL
	}
};

ZmNotebookFileController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);

	var actionMenu = this.getActionMenu();
	actionMenu.popup(0, ev.docX, ev.docY);
	if (ev.ersatz) {
		// menu popped up via keyboard nav
		actionMenu.setSelectedItem(0);
	}
};

ZmNotebookFileController.prototype._undeleteListener =
function(ev) {
	/* TODO
	var items = this._listView[this._currentView].getSelection();

	// figure out the default for this item should be moved to
	var folder = null;
	if (items[0] instanceof ZmContact) {
		folder = new ZmFolder({id: ZmOrganizer.ID_ADDRBOOK});
	} else if (items[0] instanceof ZmAppt) {
		folder = new ZmFolder({id: ZmOrganizer.ID_CALENDAR});
	} else {
		var folderId = items[0].isDraft ? ZmFolder.ID_DRAFTS : ZmFolder.ID_INBOX;
		folder = appCtxt.getById(folderId);
	}

	if (folder)
		this._doMove(items, folder);
	*/
};

ZmNotebookFileController.prototype._doDelete = 
function(items) {
	if(!items) return;
	var list = items instanceof Array ? items[0].list : items.list;
	var callback = new AjxCallback(this,this.deleteCallback,[list]);
	ZmNotebookController.prototype._doDelete.call(this,items,callback);
};

ZmNotebookController.prototype.deleteCallback = 
function(list,result) {
	var response = result.getResponse();
	var resp = response["ItemActionResponse"]
	var actionedItems = new Array();
	var view = this._listView[this._currentView];
	if (resp && resp.action) {
		var ids = resp.action.id.split(",");
		if (ids) {
			for (var i = 0; i < ids.length; i++) {
				var item = list.getById(ids[i]);
				if (item) {
					actionedItems.push(item);
				}
			}
		}
	}
	this._list._notify(ZmEvent.E_DELETE, {items: actionedItems});
};


ZmNotebookFileController.prototype._fileListChangeListener = 
function(ev) {
	if(ev.handled) return;
	var details = ev._details;
	if(!details) return;
	this._list._notify(ev.event,details);
};