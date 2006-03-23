/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNoteCache(appCtxt) {
	this._appCtxt = appCtxt;
	this.clearCache();
	this._changeListener = new AjxListener(this, this._handleChange);
}

//
// Constants
//

ZmNoteCache._SPECIAL = {
	"_INDEX_": [
		"<H2>{{MSG|wikiUserPages}}</H2>",
		"<P>",
			"{{TOC}}",
		"<H2>{{MSG|wikiSpecialPages}}</H2>",
		"<P>",
			"{{TOC|name='_*_'}}"
	].join(""),
	"_CHROME_": [
		"<DIV style='padding:0.5em'>",
			"<H1>{{NAME}}</H1>",
			"<DIV>{{CONTENT}}</DIV>",
		"</DIV>"
	].join("")
};


//
// Data
//

ZmNoteCache.prototype._appCtxt;

ZmNoteCache.prototype._idMap;
ZmNoteCache.prototype._foldersMap;
ZmNoteCache.prototype._creatorsMap;

ZmNoteCache.prototype._changeListener;

//
// Public methods
//

// cache management

ZmNoteCache.prototype.fillCache = function(folderId, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("types", "wiki");
	var search = "is:anywhere"; // REVISIT!
	var queryNode = soapDoc.set("query", search);
		
	var handleResponse = callback ? new AjxCallback(this, this._fillCacheResponse, [folderId, callback]) : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(handleResponse),
		callback: handleResponse,
		errorCallback: errorCallback,
		noBusyOverlay: false
	};
	
	var appController = this._appCtxt.getAppController();
	var response = appController.sendRequest(params);
	
	if (!params.asyncMode) {
		this._fillCacheResponse(folderId, null, response);
	}
};

ZmNoteCache.prototype.putNote = function(note) {
	if (note.id) { 
		this._idMap[note.id] = note; 
	}
	var folderId = note.folderId || ZmNote.DEFAULT_FOLDER;
	this.getNotesInFolder(folderId)[note.name] = note;
	if (note.creator) {
		this.getNotesByCreator(note.creator)[note.name] = note;
	}
	
	note.addChangeListener(this._changeListener);
};
ZmNoteCache.prototype.removeNote = function(note) {
	if (note.id) { 
		delete this._idMap[note.id]; 
	}
	delete this.getNotesInFolder(note.folderId)[note.name];
	if (note.creator) {
		delete this.getNotesByCreator(note.creator)[note.name];
	}
	
	note.removeChangeListener(this._changeListener);
};

ZmNoteCache.prototype.clearCache = function() {
	this._idMap = {};
	this._foldersMap = {};
	this._creatorsMap = {};
};

// query methods

ZmNoteCache.prototype.getIds = function() {
	return this._idMap;
};
ZmNoteCache.prototype.getFolders = function() {
	return this._foldersMap;
};
ZmNoteCache.prototype.getCreators = function() {
	return this._creatorsMap;
};

ZmNoteCache.prototype.getNoteById = function(id) {
	return this._idMap[id];
};
ZmNoteCache.prototype.getNoteByName = function(folderId, name) {
	return this.getNotesInFolder(folderId)[name];
};
ZmNoteCache.prototype.getNotesInFolder = function(folderId) {
	folderId = folderId || ZmNote.DEFAULT_FOLDER;
	if (!this._foldersMap[folderId]) {
		this._foldersMap[folderId] = {};
	}
	for (var name in ZmNoteCache._SPECIAL) {
		if (!this._foldersMap[folderId][name]) {
			this._foldersMap[folderId][name] = this._generateSpecialNote(folderId, name);
		}
	}
	return this._foldersMap[folderId];
};
ZmNoteCache.prototype.getNotesByCreator = function(creator) {
	if (!this._creatorsMap[creator]) {
		this._creatorsMap[creator] = {};
	}
	return this._creatorsMap[creator];
};

// Protected methods

ZmNoteCache.prototype._fillCacheResponse = 
function(folderId, callback, response) {
	if (response && response._data) {
		var words = response._data.SearchResponse.w || [];
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var note = this.getNoteById(word.id);
			if (!note) {
				note = new ZmNote(this._appCtxt);
				note.set(word);
				this.putNote(note);
			}
			else {
				note.set(word);
			}
		}
	}
	
	if (callback) {
		callback.run();
	}
};

ZmNoteCache.prototype._handleChange = function(event) {
	debugger;
};

ZmNoteCache.prototype._generateSpecialNote = function(folderId, name) {
	var note = new ZmNote(this._appCtxt);
	note.name = name;
	note.fragment = "";
	note.setContent(ZmNoteCache._SPECIAL[name]);
	note.folderId = folderId;
	note.creator = "[auto]"; // i18n
	note.createDate = new Date();
	note.modifier = note.creator;
	note.modifyDate = new Date(note.createDate.getTime());
	//note.version = 0;
	return note;
};