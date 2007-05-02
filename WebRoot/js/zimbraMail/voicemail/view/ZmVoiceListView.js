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

	this._contactToItem = {}; // Map of contact ids to the items we draw them in.

	var contactList = AjxDispatcher.run("GetContacts");
	contactList.addChangeListener(new AjxListener(this, this._contactsChangeListener));
};


ZmVoiceListView.prototype = new ZmListView;
ZmVoiceListView.prototype.constructor = ZmVoiceListView;

ZmVoiceListView.prototype.toString = function() {
	return "ZmVoiceListView";
};

ZmVoiceListView.prototype.getTitle =
function() {
	var text = this._folder ? this._folder.getName(false, 0, true) : ZmMsg.voice;
	return [ZmMsg.zimbraTitle, ": ", text].join("");
};

ZmVoiceListView.prototype.setFolder =
function(folder) {
	this._folder = folder;	
};

// Returns whichever calling party is shown in the view for the given item.
ZmVoiceListView.prototype.getCallingParty =
function(item) {
	var type = this._getCallType() == ZmVoiceFolder.PLACED_CALL ? 
		ZmVoiceItem.TO : ZmVoiceItem.FROM;
	return item.getCallingParty(type);
};

ZmVoiceListView.prototype._getCallType =
function() {
	return this._folder ? this._folder.callType : ZmVoiceFolder.VOICEMAIL;
};

ZmVoiceListView.prototype._getCell = 
function(element, field) {
	var id = this._getFieldId(element, field);
	return document.getElementById(id);
};

ZmVoiceListView.prototype._getRowClassName =
function(voicemail, params) {
	return voicemail.isUnheard ? "Unread" : "";
};

ZmVoiceListView.prototype._getCallerNameHtml =
function(voicemail) {
	var contactList = AjxDispatcher.run("GetContacts");
	var callingParty = this.getCallingParty(voicemail);
	var contact = contactList.getContactByPhone(callingParty.name);
	if (contact) {
		this._addToContactMap(contact, voicemail);
// TODO: Seems like this should go on ZmVoicemail?!?!?		
		voicemail.participants.getArray()[0] = contact;
		return AjxStringUtil.htmlEncode(contact.getFullName());
	} else {
		return this._getCallerHtml(voicemail);
	}
};

ZmVoiceListView.prototype._addToContactMap =
function(contact, voicemail) {
	var items = this._contactToItem[contact.id];
	if (!items) {
		this._contactToItem[contact.id] = [voicemail];
	} else {
		var found = false;
		for(var i = 0, count = items.length; i < count; i++) {
			if (items[i] == voicemail) {
				found = true;
				break;
			}
		}
		if (!found) {
			items.push(voicemail);
		}
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
		var field = DwtListHeaderItem.getHeaderField(this._headerList[itemIdx]._id);
		if (field) {
			tooltip = this._getHeaderTooltip(field);
		}
	} else {
		var item = this.getItemFromElement(div);
		if (item) {
			tooltip = this._getItemTooltip(item);
		}
	}
	this.setToolTipContent(tooltip);
};

ZmVoiceListView.prototype._mouseOutAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
};

ZmVoiceListView.prototype.removeItem =
function(item, skipNotify) {
	ZmListView.prototype.removeItem.call(this, item, skipNotify);
	
	var contact = item.participants.getArray()[0];
	if (contact) {
		item.participants.removeAll();
		var items = this._contactToItem[contact.id];
		for(var i = 0, count = items.length; i < count; i++) {
			if (items[i] == item) {
				items.splice(i,1);
				break;
			}
		}
	}
};

ZmVoiceListView.prototype.removeAll =
function(skipNotify) {
	this._contactToItem = {};
	ZmListView.prototype.removeAll.call(this, skipNotify);
};

ZmVoiceListView.prototype._resetList =
function() {
	this._contactToItem = {};
	ZmListView.prototype._resetList.call(this);
};

ZmVoiceListView.prototype._contactsChangeListener =
function(ev) {
	// The implementation of this method just redraws the entire list when any
	// contact in the view changes. This is a little brute-force-ish. I tried
	// just redrawing individual items, but because of reconnecting the sound
	// players and all the styles that are set on each item, it seemed like I
	// was going to end up with an unmaintainable mess. So redraw everything...
	var redraw = false;
	if ((ev.event == ZmEvent.E_MODIFY) || (ev.event == ZmEvent.E_DELETE)) {
		var contacts = ev.getDetails().items;
		if (contacts) {
			redraw = true;
			if (ev.event == ZmEvent.E_DELETE) {
				for(var i = 0, count = contacts.length; i < count; i++) {
					var contact = contacts[i];
					var items = this._contactToItem[contact.id];
					if (items) {
						for(var j = 0; j < items.length; j++) {
							items[j].participants.removeAll();
						}
						delete this._contactToItem[contact.id];
					}
				}
			}
		}
	} else if (ev.event == ZmEvent.E_CREATE) {
		var contacts = ev.getDetails().items;
		if (contacts) {
			redraw = true;
		}
	}
	if (redraw) {
		this.setUI();
	}
};
