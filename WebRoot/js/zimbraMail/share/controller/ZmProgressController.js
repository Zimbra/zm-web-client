/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines the progress controller.
 *
 * it gets a list of folders to work on, uses the search controller to get all the messages in the folders, in chunks. Callbacks the work passed to it to perform the work
 * on the message id chunks.
 *
 */

/**
 *
 * @author Eran Yarkon
 *
 * @param {DwtControl}		container	the containing shell
 * @param {ZmApp}		app		the containing application
 * 
 * @extends		ZmController
 */
ZmProgressController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmController.call(this, container, app);
};

ZmProgressController.prototype = new ZmController;
ZmProgressController.prototype.constructor = ZmProgressController;

// public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmProgressController.prototype.toString =
function() {
	return "ZmProgressController";
};


ZmProgressController.prototype._getProgressDialog =
function() {
	if (!ZmProgressController._progressDialog) {
		var dialog = ZmProgressController._progressDialog = appCtxt.getCancelMsgDialog();
		dialog.reset();
		dialog.setTitle(this._currentWork.getProgressTitle());
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, new AjxCallback(this, this._cancelAction));
	}
	return ZmProgressController._progressDialog;
};

ZmProgressController.prototype._getFinishedDialog =
function() {
	if (!ZmProgressController._finishedDialog) {
		var dialog = ZmProgressController._finishedDialog = appCtxt.getMsgDialog();
		dialog.reset();
		dialog.setTitle(this._currentWork.getFinishedTitle());
	}

	return ZmProgressController._finishedDialog;
};

/**
 * start a progres on a folder list and work definition
 * @param folderList - list of folders to work on the messages of, in chunks.
 * @param work - implements an unwritten interface. See ZmFilterRulesController.ZmFilterWork for the first example of an implementation
 */
ZmProgressController.prototype.start =
function(folderList, work) {
	this._currentWork = work;
	this._currentRun = new ZmProgressRun(folderList);

	this._nextChunk();
};


/**
 * next chunk of work. Get the next chunk of ids from the search
 */
ZmProgressController.prototype._nextChunk =
function() {
	var run = this._currentRun;
	var work = this._currentWork;
	var searchParams = {
		query:		this._getFolderQuery(run._folderList),
		types:		ZmItem.MSG,
		limit:		ZmProgressRun.CHUNK_SIZE,
		idsOnly:	true
	};

	if (run._lastItem) {
		//this is not the first chunk - supply the last id and sort val to the search.
		searchParams.lastId = run._lastItem.id;
		searchParams.lastSortVal = run._lastItem.sf;
		DBG.println("progress", "***** progress search: " + searchParams.query + " --- " + [run._lastItem.id, run._lastItem.sf].join("/"));
	}

	var search = new ZmSearch(searchParams);
	var respCallback = new AjxCallback(this, this._handleSearchResults);
	appCtxt.getSearchController().redoSearch(search, true, null, respCallback);
};

/**
 * process the returned message ids and
 * @param result
 */
ZmProgressController.prototype._handleSearchResults =
function(result) {
	var run = this._currentRun;
	if (run._cancelled) {
		return;
	}

	var response = result.getResponse();
	var items = response.getResults();

	DBG.println("progress", "progress search results: " + items.length);
	if (!items.length) {
		DBG.println(AjxDebug.DBG1, "progress with empty search results!");
		return;
	}

	run._lastItem = items[items.length - 1];
	run._totalMessagesProcessed += items.length;
	var hasMore = response.getAttribute("more");
	run._finished = !hasMore;

	items = this._getIds(items);

	var afterWorkCallback = new AjxCallback(this, this._afterChunk);
	this._currentWork.doWork(items, afterWorkCallback); //callback the work to do it's job on the message ids

};

/**
 * returns here after the work is done on the chunk
 */
ZmProgressController.prototype._afterChunk =
function() {
	var work = this._currentWork;
	var run = this._currentRun;
	if (run._cancelled) {
		return;
	}

	var progDialog = this._getProgressDialog();
	if (run._finished) {
		//search is over, show summary messsage
		if (progDialog.isPoppedUp()) {
			progDialog.popdown();
		}
		var finishedMessage = work.getFinishedMessage(run._totalMessagesProcessed);
		var finishDialog = this._getFinishedDialog();
		finishDialog.setContent(finishedMessage);
		finishDialog.popup();
		return;
	}

	var workMessage = work.getProgressMessage(run._totalMessagesProcessed);
	progDialog.setContent(workMessage);

	if (!progDialog.isPoppedUp()) {
		progDialog.popup();
	}

	AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._nextChunk), work.getChunkPause());
};


/**
 * extract just the ids from the item objects. (they include also the search value)
 * @param items
 */
ZmProgressController.prototype._getIds =
function(items) {
	var ids = [];
	if (!items.length) { //not sure if this could happen but I've seen it elsewhere.
		items = [items];
	}

	for (var i = 0; i < items.length; i++) {
		ids.push(items[i].id);
	}
	return ids;
};

ZmProgressController.prototype._getFolderQuery =
function(folderList) {
	if (!(folderList instanceof Array)) {
		folderList = [folderList];
	}
	var query = [];
	for (var j = 0; j < folderList.length; j++) {
		query.push(folderList[j].createQuery());
	}
	return query.join(" OR ");

};

ZmProgressController.prototype._cancelAction =
function() {
	this._currentRun._cancelled = true;
	var dialog = this._getProgressDialog();
	if (dialog && dialog.isPoppedUp()) {
		dialog.popdown();
	}
};


/**
 * internal class to keep track of progress, with last item processed, total messages processed, and the folder list we work on
 * @param folderList
 */
ZmProgressRun = function(folderList) {
	this._lastItem = null;
	this._totalMessagesProcessed = 0;
	this._folderList = folderList;
};
ZmProgressRun.CHUNK_SIZE = 100;




