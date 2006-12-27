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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskListView(parent, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	ZmListView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, ZmController.TASKLIST_VIEW, ZmItem.TASK, controller, headerList, dropTgt);
};

ZmTaskListView.prototype = new ZmListView;
ZmTaskListView.prototype.constructor = ZmTaskListView;


// Consts
ZmTaskListView.CLV_COLWIDTH_ICON =	19;
ZmTaskListView.CLV_COLWIDTH_DATE =	75;
ZmTaskListView.CLV_COLWIDTH_NOTES =	165;


// Public Methods
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};


// Private Methods

ZmTaskListView.prototype._createItemHtml =
function(task, now, isDndIcon) {
	var	div = this._getDiv(task, isDndIcon);

	var htmlArr = [];
	var idx = 0;

	idx = this._getTable(htmlArr, idx, isDndIcon);
	idx = this._getRow(htmlArr, idx, task);

	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;

		var id = this._headerList[i]._id;

		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS]) == 0) {
			// Status icon
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = " class='Attach'>";
//			htmlArr[idx++] = AjxImg.getImageHtml(attImageInfo, null, ["id='", fieldId, "'"].join(""));
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachments icon
			idx = this._getField(htmlArr, idx, task, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, task, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			// TODO - Checkbox icon
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			// subject
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(conv, ZmItem.F_SUBJECT);
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = task.subject ? AjxStringUtil.htmlEncode(task.subject, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		}
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

ZmTaskListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL);

	var hList = [];

	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS], null, "TaskP3", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.status));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, "Attachment", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.attachment));
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, "TaskCheckbox", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.done));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subject, null, null, ZmItem.F_SUBJECT));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_COMPLETE], ZmMsg.complete, null, ZmTaskListView.CLV_COLWIDTH_DATE, ZmItem.F_COMPLETE));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.dateDue, null, ZmTaskListView.CLV_COLWIDTH_DATE, ZmItem.F_DATE));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_CREATED_ON], ZmMsg.createdOn, null, ZmTaskListView.CLV_COLWIDTH_DATE, ZmItem.F_CREATED_ON));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_NOTES], ZmMsg.notes, null, ZmTaskListView.CLV_COLWIDTH_NOTES));

	return hList;
};
