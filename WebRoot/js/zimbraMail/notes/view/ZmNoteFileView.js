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

function ZmNoteFileView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmNoteFileView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._createHtml();	
}
ZmNoteFileView.prototype = new DwtComposite;
ZmNoteFileView.prototype.constructor = ZmNoteFileView;

ZmNoteFileView.prototype.toString =
function() {
	return "ZmNoteFileView";
};

//
// Constants
//

ZmNoteFileView.COLWIDTH_ICON 			= 20;
ZmNoteFileView.COLWIDTH_NAME			= 200;
ZmNoteFileView.COLWIDTH_TYPE			= 120;
ZmNoteFileView.COLWIDTH_SIZE 			= 45;
ZmNoteFileView.COLWIDTH_DATE 			= 120;
ZmNoteFileView.COLWIDTH_OWNER			= 200;

//
// Data
//

ZmNoteFileView.prototype._appCtxt;
ZmNoteFileView.prototype._controller;

ZmNoteFileView.prototype._fileListView;

//
// Public methods
//

ZmNoteFileView.prototype.getController =
function() {
	return this._controller;
};

ZmNoteFileView.prototype.set =
function(note) {
	var folderId = note ? note.folderId : ZmNote.DEFAULT_FOLDER;
	
	var soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("types", "wiki,document");
	var queryNode = soapDoc.set("query", "is:anywhere"); // REVISIT
	
	var params = {
		soapDoc: soapDoc,
		asyncMode: false,
		callback: null,
		errorCallback: null,
		execFrame: null
	};
	var appController = this._appCtxt.getAppController();
	var response = appController.sendRequest(params);
	
	var list = new AjxVector();
	if (response.SearchResponse) {
		var words = response.SearchResponse.w || [];
		ZmNoteFileView.__typify(words, "wiki");
		var docs = response.SearchResponse.doc || [];
		ZmNoteFileView.__typify(docs, "document");
		var items = words.concat(docs).sort(ZmWiklet.__byNoteName);
		for (var i = 0; i < items.length; i++) {
			list.add(items[i]);
		}
	}
	this._fileListView.set(list);
};

// methods delegated to internal list view

ZmNoteFileView.prototype.addSelectionListener = function(listener) {
	this._fileListView.addSelectionListener(listener);
};
ZmNoteFileView.prototype.addActionListener = function(listener) {
	this._fileListView.addActionListener(listener);
};

ZmNoteFileView.prototype.getSelection =
function() {
	return this._fileListView.getSelection();
};
ZmNoteFileView.prototype.getSelectedItems =
function() {
	return this._fileListView.getSelectedItems();
};
ZmNoteFileView.prototype.getSelectionCount = function() {
	return this._fileListView.getSelectionCount();
};

//
// Protected methods
//

ZmNoteFileView.prototype._createHtml = function() {
	var parent = this;
	var className = null;
	var posStyle = null;
	var view = ZmController.NOTE_FILE_VIEW;
	var type = ZmItem.WIKI;
	var controller = this._controller;
	var headerList = this._createHeaderList();
	var dropTgt = null; // ???
	this._fileListView = new ZmNoteFileListView(parent, className, posStyle, view, type, controller, headerList, dropTgt);

	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
	element.appendChild(this._fileListView.getHtmlElement());
};

ZmNoteFileView.prototype._createHeaderList = function() {
	// Columns: tag, name, type, size, date, owner
	var headers = [];
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		/*** TODO
		headers.push(
			new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "Tag", ZmNoteFileView.COLWIDTH_ICON, null, null, false, ZmMsg.tag)
		);
		/***/
	}
	headers.push(
		// new DwtListHeaderItem(id, label, icon, width, sortable, resizeable, visible, tt)
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg._name, null, ZmNoteFileView.COLWIDTH_NAME, true, true, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ITEM_TYPE], ZmMsg.type, null, ZmNoteFileView.COLWIDTH_TYPE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmNoteFileView.COLWIDTH_SIZE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.date, null, ZmNoteFileView.COLWIDTH_DATE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FROM], ZmMsg.owner, null, ZmNoteFileView.COLWIDTH_OWNER, true, null, null, null)
	);
	return headers;		
};

//
// Private functions
//

ZmNoteFileView.__typify = function(array, type) {
	for (var i = 0; i < array.length; i++) {
		array[i]._type = type;
	}
};

//
// Classes
//

function ZmNoteFileListView(parent, className, posStyle, view, type, controller, headerList, dropTgt) {
	ZmListView.call(this, parent, className, posStyle, view, type, controller, headerList, dropTgt);
}
ZmNoteFileListView.prototype = new ZmListView;
ZmNoteFileListView.prototype.constructor = ZmNoteFileListView;

ZmNoteFileListView.prototype._createItemHtml =
function(item, now, isDndIcon, isMixedView) {
	var isMatched = false; // ???
	var	div = this._getDiv(item, isDndIcon, isMatched);
	div.className = div._styleClass;

	var htmlArr = new Array();
	var idx = 0;
	
	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);

	// Row
	var className = null;

	idx = this._getRow(htmlArr, idx, item, className);

	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;

		var id = this._headerList[i]._id;
		// IE/Safari do not obey box model properly so we over compensate :(
		var width = AjxEnv.isIE || AjxEnv.isSafari ? (this._headerList[i]._width + 4) : this._headerList[i]._width;
		
		switch (String(id).substring(0, 1)) {
			case ZmListView.FIELD_PREFIX[ZmItem.F_TAG]: {
				/***
				// REVISIT
				idx = this._getField(htmlArr, idx, item, ZmItem.F_TAG, i);
				/***/
				htmlArr[idx++] = ["<td width=",width,"></td>"].join("");
				/***/
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]: {
				var icon = item._type == "wiki" ? "Page" : null;
				if (!icon) {
					var mimeInfo = item.ct ? ZmMimeTable.getInfo(item.ct) : null;
					icon = mimeInfo ? mimeInfo.image : "UnknownDoc";
				}
				htmlArr[idx++] = [
					"<td width=",width," class=Img",icon," style='margin-left:2px;padding-left:20px'>",
						item.name,
					"</td>"
				].join("");
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_ITEM_TYPE]: {
				var desc = item._type == "wiki" ? ZmMsg.note : null;
				if (!desc) {
					var mimeInfo = item.ct ? ZmMimeTable.getInfo(item.ct) : null;
					desc = mimeInfo ? mimeInfo.desc : "&nbsp;";
				}
				htmlArr[idx++] = ["<td width=",width,">",desc,"</td>"].join("");
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_SIZE]: {
				htmlArr[idx++] = "<td width=" + this._headerList[i]._width + "><nobr>";
				htmlArr[idx++] = AjxUtil.formatSize(item.s);
				if (AjxEnv.isNav)
					htmlArr[idx++] = ZmListView._fillerString;
				htmlArr[idx++] = "</nobr></td>";
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_DATE]: {
				var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.SHORT);
				htmlArr[idx++] = [
					"<td width=",width,">",
						formatter.format(new Date(item.cd)),
					"</td>"
				].join("");
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_FROM]: {
				htmlArr[idx++] = [
					"<td width=",width,">",
						item.cr,
					"</td>"
				].join("");
				break;
			}
			default: {
				htmlArr[idx++] = ["<td width=",width,">&nbsp;</td>"].join("");
			}
		} 
	}
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};
