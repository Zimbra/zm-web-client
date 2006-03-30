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
ZmNoteFileView.COLWIDTH_NAME			= 105;
ZmNoteFileView.COLWIDTH_TYPE			= 47;
ZmNoteFileView.COLWIDTH_SIZE 			= 45;
ZmNoteFileView.COLWIDTH_DATE 			= 75;
ZmNoteFileView.COLWIDTH_OWNER			= 105;

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
	/***/
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
		var docs = response.SearchResponse.doc || [];
		var items = words.concat(docs).sort(ZmNoteView.__byNoteName);
		for (var i = 0; i < items.length; i++) {
			list.add(items[i]);
		}
	}
	this._fileListView.set(list);
	/***
	this._fileListView.setUI();
	/***/
};

ZmNoteFileView.prototype.getSelection =
function() {
	return this._controller.getNote();
};


ZmNoteFileView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNoteFileView.prototype.addActionListener = function(listener) { /*TODO*/ };

//
// Protected methods
//

ZmNoteFileView.prototype._createHtml = function() {
	var parent = this;
	var className = null;
	var posStyle = null;
	var view = null; // ???
	var type = null; // ???
	var controller = this._controller;
	var headerList = this._createHeaderList();
	var dropTgt = null; // ???
	this._fileListView = new ZmListView(parent, className, posStyle, view, type, controller, headerList, dropTgt);
	this._fileListView._createItemHtml = this._createItemHtml;

	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
	element.appendChild(this._fileListView.getHtmlElement());
};

ZmNoteFileView.prototype._createHeaderList = function() {
	// Columns: tag, name, type, size, date, owner
	return [
		// new DwtListHeaderItem(id, label, icon, width, sortable, resizeable, visible, tt)
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "Tag", ZmNoteFileView.COLWIDTH_ICON, null, null, false, ZmMsg.tag),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg._name, null, ZmNoteFileView.COLWIDTH_NAME, true, true, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ITEM_TYPE], ZmMsg.type, null, ZmNoteFileView.COLWIDTH_TYPE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmNoteFileView.COLWIDTH_SIZE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.date, null, ZmNoteFileView.COLWIDTH_DATE, true, null, null, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FROM], ZmMsg.owner, null, ZmNoteFileView.COLWIDTH_OWNER, true, null, null, null)
	];
};

ZmNoteFileView.prototype._createItemHtml =
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
				htmlArr[idx++] = "<td width="+width+"></td>";
				/***/
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]: {
				var mimeInfo = item.ct ? ZmMimeTable.getInfo(item.ct) : null;
				var icon = mimeInfo ? mimeInfo.image : "Page";
				
				htmlArr[idx++] = [
					"<td width=",width," class=Img",icon," style='margin-left:2px;padding-left:20px'>",
						item.name,
					"</td>"
				].join("");
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_ITEM_TYPE]: {
				htmlArr[idx++] = [
					"<td width=",width,">",
						"&nbsp;",
					"</td>"
				].join("");
				break;
			}
			case ZmListView.FIELD_PREFIX[ZmItem.F_SIZE]: {
				htmlArr[idx++] = "<td width=" + this._headerList[i]._width + "><nobr>";
				htmlArr[idx++] = AjxUtil.formatSize(item.s);
				if (AjxEnv.isNav)
					htmlArr[idx++] = ZmListView._fillerString;
				htmlArr[idx++] = "</td>";
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
		} 
		
		/***
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachments
			idx = this._getField(htmlArr, idx, msg, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			// Fragment
			if (this._mode == ZmController.CONV_VIEW) {
				htmlArr[idx++] = "<td id='" + this._getFieldId(msg, ZmItem.F_FRAGMENT) + "'";
				htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'><div style='overflow:hidden'>" : " width=100%>";
				htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
			} else {
				htmlArr[idx++] = "<td id='" + this._getFieldId(msg, ZmItem.F_SUBJECT) + "'";
				htmlArr[idx++] = AjxEnv.isSafari ? " style='width:auto;'><div style='overflow:hidden'>" : " width=100%>";
				var subj = msg.getSubject() || ZmMsg.noSubject;
				htmlArr[idx++] = AjxStringUtil.htmlEncode(subj);
				if (this._appCtxt.get(ZmSetting.SHOW_FRAGMENTS) && msg.fragment) {
					htmlArr[idx++] = "<span class='ZmConvListFragment'> - ";
					htmlArr[idx++] = AjxStringUtil.htmlEncode(msg.fragment, true);
					htmlArr[idx++] = "</span>";
				}
			}
			htmlArr[idx++] = AjxEnv.isNav ? ZmListView._fillerString : "";
			htmlArr[idx++] = AjxEnv.isSafari ? "</div>" : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER]) == 0) {
			// Folder
			htmlArr[idx++] = "<td width=" + width + ">";
			htmlArr[idx++] = "<nobr id='" + this._getFieldId(msg, ZmItem.F_FOLDER) + "'>"; // required for IE bug
			var folder = this._appCtxt.getTree(ZmOrganizer.FOLDER).getById(msg.folderId);
			htmlArr[idx++] = folder ? folder.getName() : "";
			htmlArr[idx++] = "</nobr>";
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
			htmlArr[idx++] = "</td>";
		/***/
	}
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	return div;
};
