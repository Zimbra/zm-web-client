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
    this._totalNumMsgs = 0; //for determining if run in background is available
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
	if (!this._progressDialog ) {
		var dialog = this._progressDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.YES_BUTTON, DwtDialog.CANCEL_BUTTON], id: Dwt.getNextId("ZmProgressControllerDialog_")});
		dialog.registerCallback(DwtDialog.CANCEL_BUTTON, new AjxCallback(this, this._cancelAction));
		dialog.registerCallback(DwtDialog.YES_BUTTON, new AjxCallback(this, this._runInBackgroundAction));
        dialog.getButton(DwtDialog.YES_BUTTON).setText(ZmMsg.runInBackground);
    }
    this._progressDialog.getButton(DwtDialog.YES_BUTTON).setVisible(this._totalNumMsgs <= appCtxt.get(ZmSetting.FILTER_BATCH_SIZE));
	return this._progressDialog;
};

ZmProgressController.prototype._getFinishedDialog =
function() {
	if (!ZmProgressController._finishedDialog) {
		var dialog = ZmProgressController._finishedDialog = appCtxt.getMsgDialog();
		dialog.reset();
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
    this._totalNumMsgs = this.getNumMsgs(folderList);
	this._nextChunk();
};


/**
 * next chunk of work. Get the next chunk of ids from the search
 */
ZmProgressController.prototype._nextChunk =
function() {
	var run = this._currentRun;
	var work = this._currentWork;
	if (run._runInBackground) {
		//don't get Ids
		this._handleRunInBackground(this._getFolderQuery(run._folderList));	
	}
	else {
		var searchParams = {
			query:		this._getFolderQuery(run._folderList),
			types:		ZmItem.MSG,
			limit:		ZmProgressController.CHUNK_SIZE,
			idsOnly:	true,
			noBusyOverlay: true
		};
	
		if (run._lastItem) {
			//this is not the first chunk - supply the last id and sort val to the search.
			searchParams.lastId = run._lastItem.id;
			searchParams.lastSortVal = run._lastItem.sf;
			AjxDebug.println(AjxDebug.PROGRESS, "***** progress search: " + searchParams.query + " --- " + [run._lastItem.id, run._lastItem.sf].join("/"));
		}
	
		var search = new ZmSearch(searchParams);
		var respCallback = new AjxCallback(this, this._handleSearchResults);
		appCtxt.getSearchController().redoSearch(search, true, null, respCallback);
	}
};

ZmProgressController.prototype._handleRunInBackground = 
function(query) {
	var run = this._currentRun;
	if (run._cancelled) {
		return;
	}
	run._finished = true; //running all at once
	var afterWorkCallback = new AjxCallback(this, this._afterChunk);
	this._currentWork.doWork(null, query, afterWorkCallback); //callback the work to do it's job on the message ids	
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

	AjxDebug.println(AjxDebug.PROGRESS, "progress search results: " + items.length);
	if (!items.length) {
		AjxDebug.println(AjxDebug.PROGRESS, "progress with empty search results!");
		return;
	}

	run._lastItem = items[items.length - 1];
	run._totalMessagesProcessed += items.length;
	var hasMore = response.getAttribute("more");
	run._finished = !hasMore;

	items = this._getIds(items);

	var afterWorkCallback = new AjxCallback(this, this._afterChunk);
	this._currentWork.doWork(items, null, afterWorkCallback); //callback the work to do it's job on the message ids

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
		var messagesProcessed = run._runInBackground ? false : run._totalMessagesProcessed;
		var finishedMessage = work.getFinishedMessage(messagesProcessed);
		var finishDialog = this._getFinishedDialog();
		finishDialog.setMessage(finishedMessage, DwtMessageDialog.INFO_STYLE, work.getFinishedTitle());
		finishDialog.popup();
		return;
	}

	if (!run._runInBackground) {
		var workMessage = work.getProgressMessage(run._totalMessagesProcessed);
		progDialog.setMessage(workMessage, DwtMessageDialog.INFO_STYLE, work.getProgressTitle());
		if (!progDialog.isPoppedUp()) {
			progDialog.popup();
		}
	}

	this._nextChunk();
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

/**
 * Determine total number of messages filters are being applied to.
 * @param folderList {ZmOrganizer[]} array of folders
 * @return {int} number of messages
 */
ZmProgressController.prototype.getNumMsgs = 
function(folderList) {
    var numMsgs = 0;
    if (!(folderList instanceof Array)) {
        folderList = [folderList];
    }

    for (var j = 0; j < folderList.length; j++) {
        numMsgs += folderList[j].numTotal;
    }
    return numMsgs;
};

ZmProgressController.prototype._cancelAction =
function() {
	this._currentRun._cancelled = true;
	var dialog = this._getProgressDialog();
	if (dialog && dialog.isPoppedUp()) {
		dialog.popdown();
	}
};

ZmProgressController.prototype._runInBackgroundAction = 
function() {
	this._currentRun._runInBackground = true;
	var dialog = this._getProgressDialog();
	if (dialog && dialog.isPoppedUp()) {
		dialog.popdown();
	}
	AjxDebug.println(AjxDebug.PROGRESS, "set to run in background");
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