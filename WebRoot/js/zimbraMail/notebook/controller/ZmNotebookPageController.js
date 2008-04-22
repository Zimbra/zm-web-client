/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmNotebookPageController = function(container, app) {
	if (arguments.length == 0) return;
	ZmNotebookController.call(this, container, app);

	this._history = [];
}
ZmNotebookPageController.prototype = new ZmNotebookController;
ZmNotebookPageController.prototype.constructor = ZmNotebookPageController;

ZmNotebookPageController.prototype.toString = function() {
	return "ZmNotebookPageController";
};

// Data

ZmNotebookPageController.prototype._object;
ZmNotebookPageController.prototype._folderId;

ZmNotebookPageController.prototype._place = -1;
ZmNotebookPageController.prototype._history;

//
// Public methods
//

ZmNotebookPageController.prototype.getKeyMapName =
function() {
	return "ZmNotebookPageController";
};

ZmNotebookPageController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmNotebookPageController.handleKeyAction");
	
	switch (actionCode) {
		case ZmKeyMap.EDIT:
			if (this._object && !this._object.isReadOnly()) {
				this._editListener();
			}
			break;
		case ZmKeyMap.DEL:
			if (this._object && !this._object.isReadOnly()) {
				return ZmListController.prototype.handleKeyAction.call(this, actionCode);
			}
			break;
		case ZmKeyMap.REFRESH:
			this._refreshListener();
			break;
		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
			break;
	}
	return true;
};

// page

ZmNotebookPageController.prototype.gotoPage = function(pageRef) {
	var cache = this._app.getNotebookCache();
	//var page = cache.getPageByName(pageRef.folderId, pageRef.name);
	var params = null;//ctry
	if(pageRef.name=="_Index"){
		params = {id:pageRef.folderId};
	}else if(pageRef.pageId){ //bug:19658
		params={folderId:pageRef.folderId,id:pageRef.pageId};
	} else if(pageRef.name) {
        params={folderId:pageRef.folderId,name:pageRef.name};
    }
    var page = cache.getItemInfo(params);
	this._object = page;
	this._setViewContents(this._currentView);
	this._resetOperations(this._toolbar[this._currentView]);
};

ZmNotebookPageController.prototype.setPage = function(page) {
	var cache = this._app.getNotebookCache();
	this._object = page;
	this._resetOperations(this._toolbar[this._currentView]);
};

ZmNotebookPageController.prototype.getPage = function() {
	return this._object;
};

// view management

ZmNotebookPageController.prototype.showLink = function(link) {
	var cache = this._app.getNotebookCache();
	try {
		var page = cache.getPageByLink(link);
		if (page) {
			this.show(page);
		}
	}
	catch (e) {
		if (!this._formatter) {
			this._formatter = new AjxMessageFormat(ZmMsg.pageNotFound);
		}
		this.popupErrorDialog(this._formatter.format(link), null, null, true);
	}
};

ZmNotebookPageController.prototype.show = function(pageOrFolderId, force, fromSearch) {
	if (/*force ||*/ !(pageOrFolderId instanceof ZmPage)) {
		this._showIndex(pageOrFolderId || ZmNotebookItem.DEFAULT_FOLDER);
		return;
	}

	// save state
	this._fromSearch = fromSearch;

	var shownPage = this._object;
	var currentPage = pageOrFolderId;
	this._object = currentPage;

	// switch view
	var view = this._currentView;
	if (!view) {
		view = this._defaultView();
		force = true;
	}
	this.switchView(view, force);

	// are we already showing this note?
	if (shownPage && shownPage.name == currentPage.name &&
		shownPage.folderId == currentPage.folderId) {
		return;
	}

	if(!this._currentView._USE_IFRAME){		
	// update history
	this._folderId = null;
	if (this._object) {
		this._folderId = this._object.folderId;
		for (var i = this._place + 1; i < this._history.length; i++) {
			this._history[i] = null;
		}
	}

	// REVISIT: Need to do proper list management! For now we fake
	//          a list of a single item so that operations like
	//          tagging and delete work.
	this._list = new ZmList(ZmItem.PAGE);
	if (this._object) {
		this._list.add(this._object);
	}
	}

	// show this page
	this._setViewContents(this._currentView);
};

//
// Protected methods
//

// initialization

ZmNotebookPageController.prototype._getNaviToolBarOps = function() {
	var list = ZmNotebookController.prototype._getNaviToolBarOps.call(this);
	list = list.concat(
		ZmOperation.CLOSE
	);
	return list;
};
ZmNotebookPageController.prototype._initializeToolBar = function(view) {
	ZmNotebookController.prototype._initializeToolBar.call(this, view);

	var toolbar = this._toolbar[this._currentView];
	var button = toolbar.getButton(ZmOperation.CLOSE);
	button.setVisible(this._fromSearch);
};

ZmNotebookPageController.prototype._resetOperations =
function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmNotebookController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);
};

// listeners
ZmNotebookPageController.prototype._dropListener =
function(ev) {
	// only tags can be dropped on us
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if(this._object && (this._object.isShared() || this._object.isIndex() )){
		ev.doIt = false;	
		}else{
		ev.doIt = this._dropTgt.isValidTarget(ev.srcData);
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var tag = ev.srcData;
		this._doTag([this._object], tag, true);
	}
};

// notebook page view

ZmNotebookPageController.prototype._showIndex = function(folderId) {
	var cache = this._app.getNotebookCache();
	var params = {id:folderId};	
//	var index = cache.getPageByName(folderId, ZmNotebook.PAGE_INDEX, true);
	var index = cache.getItemInfo(params);
	this.show(index);
};

//
// Private functions
//

ZmNotebookPageController.__setButtonToolTip = function(button, pageRef, defaultValue) {
	var text = pageRef ? pageRef.name : defaultValue;
	if (text == ZmNotebook.PAGE_INDEX) {
		var notebook = appCtxt.getById(pageRef.folderId);
		if (notebook) {
			text = notebook.getName();
		}
		else {
			/*** REVISIT ***/
			// Get the remote notebook name. Or save the remote name in the pageRef.
		}
	}
	button.setToolTipContent(text);
};

ZmNotebookPageController.prototype.updateHistory = function() {
	
	this._folderId = null;
	
	if (this._object) {
		this._folderId = this._object.folderId;
		for (var i = this._place + 1; i < this._history.length; i++) {
			this._history[i] = null;
		}
		this._history.length = ++this._place;
        var pageRef = { folderId: this._object.folderId, name: this._object.name, pageId: this._object.id };
		this._history[this._place] = pageRef;
	}

	// REVISIT: Need to do proper list management! For now we fake
	//          a list of a single item so that operations like
	//          tagging and delete work.
	this._list = new ZmList(ZmItem.PAGE);
	if (this._object) {
		this._list.add(this._object);
	}
	
};

ZmNotebookPageController.prototype.refreshCurrentPage = function(){
	if(this._object && this._listView[ZmController.NOTEBOOK_PAGE_VIEW]){
	this._listView[ZmController.NOTEBOOK_PAGE_VIEW].refresh(this._object.getRestUrl());
	}
};

ZmNotebookPageController.prototype.isIframeEnabled = function(){
	if(this._listView[ZmController.NOTEBOOK_PAGE_VIEW]){
		return this._listView[ZmController.NOTEBOOK_PAGE_VIEW]._USE_IFRAME;
	}else{
		return false;	
	}
};

ZmNotebookPageController.prototype._refreshListener = function(event) {
	if(this.isIframeEnabled()){
		var page = this._object;
		var cache = this._app.getNotebookCache();
		//workaround for remote folder notification problem
		cache.removeItem(page);
		this.refreshCurrentPage();
	}else{	
		ZmNotebookController.prototype._refreshListener.call(this, event);		
	}
};

ZmNotebookController.prototype.handleUpdate =
function(ev, organizers) {

	if(!organizers) return;
		
	var shownPage = this.getPage();
    if (!shownPage) return;
	
	var cache = this._app.getNotebookCache();	
	for (var i = 0; i < organizers.length; i++) {
        var organizer = organizers[i];
        var id = organizer.id;
        var parentId  = organizer.parent ? organizer.parent.id : null;
        if (shownPage.isChildOf(id) || id == shownPage.id || id == shownPage.folderId || shownPage.id == parentId) {
            if(id == shownPage.folderId && shownPage.name == ZmNotebook.PAGE_INDEX){
                shownPage.restUrl = organizer.restUrl;
            }
            var needsRefresh = this._checkForUpdate(organizer);
            var item = cache.getItemInfo({id:shownPage.id},needsRefresh);
            cache.putItem(item);
            var oldName = ev.getDetail("oldName");
            if(oldName && organizer.restUrl) {
            	var oldUrl = organizer.restUrl.replace(new RegExp(("/"+organizer.name+"(/)?$")),"/" + oldName);
            	cache.updateItems(id, oldUrl, organizer.restUrl);
            }
            var appViewMgr = appCtxt.getAppViewMgr();
            if( appViewMgr.getCurrentViewId() != ZmController.NOTEBOOK_FILE_VIEW  && !this._importInProgress) {
                this.gotoPage(item);
            }
        }
    }

};

ZmNotebookPageController.prototype._checkForUpdate =
function(organizer) {
    if(organizer._updated){
      	organizer._updated = null;
		return false;
    }
	return true;
};
