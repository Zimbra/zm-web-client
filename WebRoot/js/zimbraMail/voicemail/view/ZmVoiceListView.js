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

function ZmVoiceListView(parent, className, posStyle, view, type, controller, headerList, dropTgt) {
	if (arguments.length == 0) return;
	ZmListView.call(this, parent, className, posStyle, view, type, controller, headerList, dropTgt);
}
ZmVoiceListView.prototype = new ZmListView;
ZmVoiceListView.prototype.constructor = ZmVoiceListView;

ZmVoiceListView.prototype.toString = function() {
	return "ZmVoiceListView";
};

ZmVoiceListView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", ZmMsg.voicemail].join("");
};

ZmVoiceListView.prototype.setCallType =
function(callType) {
	this._callType = callType;	
};

// Returns whichever calling party is shown in the view for the given item.
ZmVoiceListView.prototype.getCallingParty =
function(item) {
	var type = this._callType == ZmVoiceFolder.PLACED_CALL ? 
		ZmVoiceItem.TO : ZmVoiceItem.FROM;
	return item.getCallingParty(type);
};

ZmVoiceListView.prototype._getColumnIndex = 
function(field) {
	var prefix = ZmListView.FIELD_PREFIX[field];
	for (var i = 0, count = this._headerList.length; i < count; i++) {
		if (this._headerList[i]._id.indexOf(prefix) == 0) {
			return i;
		}
	}
	return 0;
};

ZmVoiceListView.prototype._getCell = 
function(columnIndex, element) {
	var table = element.firstChild;
	return table.rows[0].cells[columnIndex];
};

ZmVoiceListView.prototype._getCallerNameHtml =
function(voicemail) {
	var contactList = AjxDispatcher.run("GetContacts");
	var callingParty = this.getCallingParty(voicemail);
	var contact = contactList.getContactByPhone(callingParty.name);
	if (contact) {
// TODO: Seems like this should go on ZmVoicemail?!?!?		
		voicemail.participants.getArray()[0] = callingParty;
		return AjxStringUtil.htmlEncode(contact.getFullName());
	} else {
		return this._getCallerHtml(voicemail);
	}
};

ZmVoiceListView.prototype._getCallerHtml =
function(voicemail) {
	var callingParty = this.getCallingParty(voicemail);
	var display = callingParty.getDisplay();
	return AjxStringUtil.htmlEncode(display);
};

ZmVoiceListView.prototype._mouseOverAction =
function(ev, div) {
	// Bypassing the ZmList._mouseOverAction which does some participant stuff I'm not
	// set up to handle yet....
	DwtListView.prototype._mouseOverAction.call(this, ev, div);

	var tooltip = null;
	var id = ev.target.id || div.id;
	if (!id) return true;
	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var itemIdx = Dwt.getAttr(div, "_itemIndex");
		var headerId = this._headerList[itemIdx]._id;
		if (headerId && headerId.length) {
			var prefix = headerId.charAt(0);
			tooltip = this._getHeaderTooltip(prefix);
		}
	} else {
		var item = this.getItemFromElement(div);
		tooltip = this._getItemTooltip(item);
	}
	this.setToolTipContent(tooltip);
};

ZmVoiceListView.prototype._mouseOutAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
};

