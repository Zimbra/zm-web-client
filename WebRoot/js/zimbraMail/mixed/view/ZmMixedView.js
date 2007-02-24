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

function ZmMixedView(parent, className, posStyle, controller, dropTgt) {

	var headerList = this._getHeaderList(parent);
	ZmListView.call(this, parent, className, posStyle, ZmController.MIXED_VIEW, ZmItem.MIXED, controller, headerList, dropTgt);
};

ZmMixedView.prototype = new ZmListView;
ZmMixedView.prototype.constructor = ZmMixedView;

// Consts

ZmMixedView.REPLENISH_THRESHOLD 	= 0;

ZmMixedView.COLWIDTH_ICON 			= 19;
ZmMixedView.COLWIDTH_FROM 			= 145;
ZmMixedView.COLWIDTH_DATE 			= 60;

ZmMixedView.prototype.toString = 
function() {
	return "ZmMixedView";
};

ZmMixedView.prototype.set =
function(list, sortField) {
	ZmListView.prototype.set.call(this, list, sortField);

	// The mixed list of items doesn't handle notifications.
	// We need to add listeners to each of the lists that 
	// owns items in the mixed array...
	var items = list.getArray();
	var owners = new Object();
	for (var i = 0; i < items.length; i++) {
		var list = items[i].list;
		if (list) {
			owners[list.type] = list;
		}
	}
	for (var type in owners) {
		owners[type].addChangeListener(this._listChangeListener);
	}
};

ZmMixedView.prototype._createItemHtml =
function(item, now, isDndIcon) {
	if (item.type == ZmItem.CONTACT || item.type == ZmItem.GROUP) {
		return ZmContactSimpleView.prototype._createContactHtmlForMixed.call(this, item, now, isDndIcon);
	} else if (item.type == ZmItem.CONV) {
		return ZmConvListView.prototype._createItemHtml.call(this, item, now, isDndIcon, true);
	} else if (item.type == ZmItem.MSG) {
		return ZmMailMsgListView.prototype._createItemHtml.call(this, item, now, isDndIcon, true);
	} else if (item.type == ZmItem.TASK) {
		return ZmTaskListView.prototype._createTaskHtmlForMixed.call(this, item, now, isDndIcon);
	} else if (item.type == ZmItem.PAGE || item.type == ZmItem.DOCUMENT) {
		return ZmFileListView.prototype._createItemHtml.call(this, item, now, isDndIcon);
	}
};

ZmMixedView.prototype._getParticipantHtml =
function(conv, fieldId) {
	return ZmConvListView.prototype._getParticipantHtml.call(this, conv, fieldId);
};

ZmMixedView.prototype._fitParticipants = 
function(participants, participantsElided, width) {
	return ZmMailListView.prototype._fitParticipants.call(this, participants, participantsElided, width);
};

ZmMixedView.prototype._changeListener =
function(ev) {
	if (this._appCtxt.getAppViewMgr().getCurrentViewId() != this.view)
		return;

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		var items = ev.getDetail("items");
		var contactList = AjxDispatcher.run("GetContacts");

		// walk the list of items and if any are contacts,
		for (var i = 0; i < items.length; i++) {
			if ((items[i].type == ZmItem.CONTACT || items[i].type == ZmItem.GROUP) &&
				ev.event == ZmEvent.E_DELETE)
			{
				// and is hard delete, remove from canonical list
				contactList.remove(items[i]);
			}
			// also remove from controller's list
			this._controller.getList().remove(items[i]);
		}
	}

	// call base class last
	ZmListView.prototype._changeListener.call(this, ev);
};

ZmMixedView.prototype._getHeaderList =
function(parent) {

	var headerList = new Array();
	
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, "FlagRed", ZmMixedView.COLWIDTH_ICON));
	
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL); // this._appCtxt not set until parent constructor is called
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmMixedView.COLWIDTH_ICON));
	}
	
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ICON], null, "Globe", ZmMixedView.COLWIDTH_ICON));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT], ZmMsg.from, null, ZmMixedView.COLWIDTH_FROM, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, "Attachment", ZmMixedView.COLWIDTH_ICON));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subject, null, null, null, true));
	headerList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.date, null, ZmMixedView.COLWIDTH_DATE));
	
	return headerList;
};
