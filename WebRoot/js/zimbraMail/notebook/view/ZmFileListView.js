/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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

function ZmFileListView(parent, className, posStyle, mode, controller, dropTgt) {
	if (arguments.length == 0) return;

	// save data
	//this._folderId = null;
	this._mode = mode; // ???
	this._appCtxt = controller._appCtxt;

	// call super constructor
	var headerList = this._getHeaderList(parent);
	var view = ZmController.NOTEBOOK_FILE_VIEW;
	ZmListView.call(this, parent, className, posStyle, view, ZmItem.PAGE, controller, headerList, dropTgt);

	// create a action menu for the header list
	this._colHeaderActionMenu = new ZmPopupMenu(this);
	var actionListener = new AjxListener(this, this._colHeaderActionListener);
	for (var i = 0; i < headerList.length; i++) {
		var hCol = headerList[i];
		// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
		if (hCol._width) {
			var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
			mi.setData(ZmFileListView.KEY_ID, hCol._id);
			mi.setChecked(true, true);
			this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
		}
	}
}

ZmFileListView.prototype = new ZmListView;
ZmFileListView.prototype.constructor = ZmFileListView;

ZmFileListView.prototype.toString = function() {
	return "ZmFileListView";
};

// Constants

ZmFileListView.KEY_ID = "_keyId";

ZmFileListView.COLWIDTH_ICON 			= 20;
ZmFileListView.COLWIDTH_NAME			= 160;
ZmFileListView.COLWIDTH_TYPE			= 80;
ZmFileListView.COLWIDTH_SIZE 			= 45;
ZmFileListView.COLWIDTH_DATE 			= 80;
ZmFileListView.COLWIDTH_OWNER			= 80;
ZmFileListView.COLWIDTH_FOLDER			= 100;

// Protected methods

ZmFileListView.prototype._getHeaderList = function(parent) {
	// Columns: tag, name, type, size, date, owner, folder
	var headers = [];
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headers.push(
			new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "Tag", ZmFileListView.COLWIDTH_ICON, null, null, true, ZmMsg.tag)
		);
	}
	headers.push(
		// new DwtListHeaderItem(id, label, icon, width, sortable, resizeable, visible, tt)
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ICON], null, "Globe", ZmFileListView.COLWIDTH_ICON, null, null, true, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg._name, null, ZmFileListView.COLWIDTH_NAME, null, true, true, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ITEM_TYPE], ZmMsg.type, null, ZmFileListView.COLWIDTH_TYPE, null, null, true, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SIZE], ZmMsg.size, null, ZmFileListView.COLWIDTH_SIZE, null, null, true, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.date, null, ZmFileListView.COLWIDTH_DATE, null, null, true, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT], ZmMsg.owner, null, ZmFileListView.COLWIDTH_OWNER, null, null, true, null),
		new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FOLDER], ZmMsg.folder, null, ZmFileListView.COLWIDTH_FOLDER, null, null, true, null)
	);
	return headers;
};

ZmFileListView.prototype._createItemHtml =
function(item, now, isDndIcon) {
	var isMatched = false; // ???
	var	div = this._getDiv(item, isDndIcon, isMatched);

	var htmlArr = [];
	var idx = 0;

	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);

	// Row
	var className = null;
	idx = this._getRow(htmlArr, idx, item, className);
	for (var colIdx = 0; colIdx < this._headerList.length; colIdx++) {
		var header = this._headerList[colIdx];
		if (!header._visible)
			continue;

		var field = ZmListView.PREFIX_MAP[header._id.substr(0,1)];
		var fieldId = this._getFieldId(item, field);
		var width = this._getFieldWidth(colIdx);

		if (field == ZmItem.F_SUBJECT) {
			htmlArr[idx++] = "<td id='" + fieldId + "'";
			htmlArr[idx++] = " width=" + width + ">";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
			htmlArr[idx++] = "</td>";
		}
		else if (field == ZmItem.F_SIZE) {
			htmlArr[idx++] = "<td id='" + fieldId + "'";
			htmlArr[idx++] = " width=" + width + " align=right>";
			htmlArr[idx++] = AjxUtil.formatSize(item.size);
			htmlArr[idx++] = "</td>";
		}
		else if (field == ZmItem.F_ITEM_TYPE) {
			var desc = item instanceof ZmPage ? ZmMsg.page : null;
			if (!desc) {
				var mimeInfo = item.ct ? ZmMimeTable.getInfo(item.ct) : null;
				desc = mimeInfo ? mimeInfo.desc : "&nbsp;";
			}
			htmlArr[idx++] = "<td id='" + fieldId + "'";
			htmlArr[idx++] = " width=" + width + ">";
			htmlArr[idx++] = desc;
			htmlArr[idx++] = "</td>";
		}
		else if (field == ZmItem.F_ICON) {
			var icon = item instanceof ZmPage ? "Page" : null;
			if (!icon) {
				var contentType = item.contentType;
				var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
				icon = mimeInfo ? mimeInfo.image : "UnknownDoc";
			}
			htmlArr[idx++] = "<td id=" + fieldId;
			htmlArr[idx++] = " width=" + width + " align=middle>";
			htmlArr[idx++] = "<div class='Img"+icon+"'></div>";
			htmlArr[idx++] = "</td>";
		}
		else if (field == ZmItem.F_PARTICIPANT) {
			var creator = item.creator.split("@");
			var user = this._appCtxt.get(ZmSetting.USERNAME).split("@");

			var cname = creator[0];
			if (creator[1] != user[1]) {
				cname = creator.join("@");
			}
			htmlArr[idx++] = "<td id='" + fieldId + "'";
			htmlArr[idx++] = " width=" + width + ">";
			htmlArr[idx++] = "<span style='white-space: nowrap'>";
			htmlArr[idx++] = cname;
			htmlArr[idx++] = "</span>";
			htmlArr[idx++] = "</td>";
		}
		else if (field == ZmItem.F_FOLDER) {
			var notebook = this._appCtxt.getById(item.folderId);
			var path = notebook ? notebook.getPath() : item.folderId;
			htmlArr[idx++] = "<td id='" + fieldId + "'";
			htmlArr[idx++] = " width=" + width + ">";
			htmlArr[idx++] = path;
			htmlArr[idx++] = "</td>";
		}
		else {
			if (field == ZmItem.F_DATE) {
				item = AjxUtil.createProxy(item);
				item.date = item.modifyDate;
			}
			idx = this._getField(htmlArr, idx, item, field, colIdx, now);
		}
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

// listeners

ZmFileListView.prototype._colHeaderActionListener = function(event) {
  	// TODO
};

//
// Private functions
//

ZmFileListView.__typify = function(array, type) {
	for (var i = 0; i < array.length; i++) {
		array[i]._type = type;
	}
};

