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
ZmTaskListView.CLV_COLWIDTH_ICON = 19;


// Public Methods
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};


// Private Methods
ZmTaskListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL);

	var hList = [];

	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.tag));
	}

	return hList;
};
