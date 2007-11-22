/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmVoiceListView = function(parent, className, posStyle, view, type, controller, headerList, dropTgt) {
	if (arguments.length == 0) return;
	ZmListView.call(this, parent, className, posStyle, view, type, controller, headerList, dropTgt);

	this._contactToItem = {}; // Map of contact ids to the items we draw them in.

	var contactList = AjxDispatcher.run("GetContacts");
	if (contactList) {
		contactList.addChangeListener(new AjxListener(this, this._contactsChangeListener));
	}
};


ZmVoiceListView.prototype = new ZmListView;
ZmVoiceListView.prototype.constructor = ZmVoiceListView;

ZmVoiceListView.prototype.toString = function() {
	return "ZmVoiceListView";
};

ZmVoiceListView.PHONE_FIELDS_LABEL = { };
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_callbackPhone] = ZmMsg.phoneLabelCallback;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_carPhone] = ZmMsg.phoneLabelCar;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_assistantPhone] = ZmMsg.phoneLabelAssistant;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_companyPhone] = ZmMsg.phoneLabelCompany;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_homeFax] = ZmMsg.phoneLabelHomeFax;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_homePhone] = ZmMsg.phoneLabelHome;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_homePhone2] = ZmMsg.phoneLabelHome2;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_mobilePhone] = ZmMsg.phoneLabelMobile;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_otherPhone] = ZmMsg.phoneLabelOther;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_workPhone] = ZmMsg.phoneLabelWork;
ZmVoiceListView.PHONE_FIELDS_LABEL[ZmContact.F_workPhone2] = ZmMsg.phoneLabelWork2;

ZmVoiceListView.F_DATE = ZmItem.F_DATE;
ZmVoiceListView.F_CALLER = "cl";
ZmVoiceListView.F_DURATION = "du";

ZmVoiceListView.prototype.getTitle =
function() {
	var text = this._folder ? this._folder.getName(false, 0, true) : ZmMsg.voice;
	return [ZmMsg.zimbraTitle, text].join(": ");
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

ZmVoiceListView.prototype.getLimit =
function() {
	return appCtxt.get(ZmSetting.VOICE_PAGE_SIZE);
};

ZmVoiceListView.prototype._getCallType =
function() {
	return this._folder ? this._folder.callType : ZmVoiceFolder.VOICEMAIL;
};

ZmVoiceListView.prototype._getRowClass =
function(voicemail, params) {
	return voicemail.isUnheard ? "Unread" : "";
};

ZmVoiceListView.prototype._getCellContents =
function(htmlArr, idx, voicemail, field, colIdx, params) {
	if (field == ZmVoiceListView.F_CALLER) {
		htmlArr[idx++] = this._getCallerNameHtml(voicemail);
	} else if (field == ZmVoiceListView.F_DATE) {
		htmlArr[idx++] = AjxDateUtil.computeWordyDateStr(params.now, voicemail.date);
	} else {
		idx = ZmListView.prototype._getCellContents.call(this, htmlArr, idx, voicemail, field, colIdx, params); 
	}
	
	return idx;
};

ZmVoiceListView.prototype._getCallerNameHtml =
function(voicemail) {
	var contactList = AjxDispatcher.run("GetContacts");
	var callingParty = this.getCallingParty(voicemail);
	var data = null;
	if (contactList) {
		data = contactList.getContactByPhone(callingParty.name);
	}
	if (data) {
		this._addToContactMap(data.contact, voicemail);
// TODO: Seems like this should go on ZmVoicemail?!?!?		
		voicemail.participants.getArray()[0] = data.contact;
		if (!ZmVoiceListView._callerFormat) {
			ZmVoiceListView._callerFormat = new AjxMessageFormat(ZmMsg.callingPartyFormat);
		}
		var text = ZmVoiceListView._callerFormat.format([data.contact.getFullName(), ZmVoiceListView.PHONE_FIELDS_LABEL[data.field]]);
		return AjxStringUtil.htmlEncode(text);
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
		var match = this._parseId(id);
		if (match && match.field && match.field == ZmItem.F_SELECTION) {
			if (ev.target.className != "ImgTaskCheckboxCompleted")
				ev.target.className = "ImgTaskCheckboxCompleted";
			return;
		}

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

	// XXX: this is repetitive code. We really ought to call ZmListView base
	// class to handle mouseout but looks like flag field is overloaded to be
	// handled differently in voicemail
	var id = ev.target.id || div.id;
	if (!id) return true;

	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			if (m.field == ZmItem.F_SELECTION) {
				ev.target.className = (this.getSelectedItems().contains(div))
					? "ImgTaskCheckboxCompleted"
					: "ImgTaskCheckbox";
			}
		}
	}
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

ZmVoiceListView.prototype.getReplenishThreshold =
function() {
	return 0;
};

ZmVoiceListView.prototype.setBounds =
function(x, y, width, height) {
	ZmListView.prototype.setBounds.call(this, x, y, width, height);
	this._resetColWidth();
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

ZmVoiceListView.prototype._sortColumn =
function(columnItem, bSortAsc) {
	var sortBy;
	switch (columnItem._sortable) {
		case ZmVoiceListView.F_DURATION: sortBy = bSortAsc ? ZmSearch.DURATION_ASC : ZmSearch.DURATION_DESC; break;
		case ZmVoiceListView.F_DATE: sortBy = bSortAsc ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC; break;
		default: break;
	}
	appCtxt.getApp(ZmApp.VOICE).search(this._controller._folder, null, sortBy)
	appCtxt.set(ZmSetting.SORTING_PREF, sortBy, this.view);
};

