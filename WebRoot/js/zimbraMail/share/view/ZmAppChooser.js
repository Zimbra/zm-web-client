/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmAppChooser(parent, className, buttons, tabStyle) {

	className = className || "ZmAppChooser";
	var tbStyle = tabStyle ? DwtToolBar.HORIZ_STYLE : DwtToolBar.VERT_STYLE;
	var width = skin.hints && skin.hints.app_chooser.fullWidth ? "100%" : null;

	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE, null, null, width, tbStyle);

	this.setScrollStyle(Dwt.CLIP);

	this._buttons = {};
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) {
			this.addSpacer(ZmAppChooser.SPACER_HEIGHT);
		} else {
			this._createButton(id, tabStyle, i == buttons.length-1);
		}
	}
};

var i = 1;
ZmAppChooser.OUTER		= i++;
ZmAppChooser.OUTER_ACT	= i++;
ZmAppChooser.OUTER_TRIG	= i++;

ZmAppChooser.SEP		= i++;

ZmAppChooser.B_EMAIL	= i++;
ZmAppChooser.B_CONTACTS	= i++;
ZmAppChooser.B_CALENDAR	= i++;
ZmAppChooser.B_IM	    = i++;
ZmAppChooser.B_NOTEBOOK	= i++;
ZmAppChooser.B_HELP		= i++;
ZmAppChooser.B_OPTIONS	= i++;
ZmAppChooser.B_LOGOUT	= i++;

ZmAppChooser.IMAGE = {};
ZmAppChooser.IMAGE[ZmAppChooser.OUTER]			= "ImgAppChiclet";
ZmAppChooser.IMAGE[ZmAppChooser.OUTER_ACT]		= "ImgAppChicletHover";
ZmAppChooser.IMAGE[ZmAppChooser.OUTER_TRIG]		= "ImgAppChicletSel";

ZmAppChooser.IMAGE[ZmAppChooser.B_EMAIL]    	= "MailApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_CONTACTS] 	= "ContactsApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_CALENDAR] 	= "CalendarApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_IM]			= "ImStartChat";
ZmAppChooser.IMAGE[ZmAppChooser.B_NOTEBOOK]		= "NoteApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_HELP]     	= "Help";
ZmAppChooser.IMAGE[ZmAppChooser.B_OPTIONS]		= "Preferences";
ZmAppChooser.IMAGE[ZmAppChooser.B_LOGOUT]		= "Logoff";

ZmAppChooser.TEXT = {};
ZmAppChooser.TEXT[ZmAppChooser.B_EMAIL]			= ZmMsg.mail;
ZmAppChooser.TEXT[ZmAppChooser.B_CONTACTS]		= ZmMsg.addressBook;
ZmAppChooser.TEXT[ZmAppChooser.B_CALENDAR]		= ZmMsg.calendar;
ZmAppChooser.TEXT[ZmAppChooser.B_IM]			= ZmMsg.chat;
ZmAppChooser.TEXT[ZmAppChooser.B_NOTEBOOK]		= ZmMsg.documents + " " + ZmMsg.beta;
ZmAppChooser.TEXT[ZmAppChooser.B_HELP]			= ZmMsg.help;
ZmAppChooser.TEXT[ZmAppChooser.B_OPTIONS]		= ZmMsg.options;
ZmAppChooser.TEXT[ZmAppChooser.B_LOGOUT]		= ZmMsg.logOff;

ZmAppChooser.TOOLTIP = {};
ZmAppChooser.TOOLTIP[ZmAppChooser.B_EMAIL]		= ZmMsg.goToMail;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_CONTACTS]	= ZmMsg.goToContacts;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_CALENDAR]	= ZmMsg.goToCalendar;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_IM]			= ZmMsg.goToIm;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_NOTEBOOK]	= ZmMsg.goToDocuments;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_HELP]		= ZmMsg.goToHelp;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_OPTIONS]	= ZmMsg.goToOptions;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_LOGOUT]		= ZmMsg.logOff;

ZmAppChooser.SPACER_HEIGHT = 10;

ZmAppChooser.prototype = new DwtToolBar;
ZmAppChooser.prototype.constructor = ZmAppChooser;

ZmAppChooser.prototype.toString = 
function() {
	return "ZmAppChooser";
};

ZmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
};

ZmAppChooser.prototype.setSelected =
function(id) {
	if (this._selectedId && this._buttons[this._selectedId])
		this._buttons[this._selectedId].setSelected(false);

	if (this._buttons[id])
		this._buttons[id].setSelected(true);

	this._selectedId = id;
};

ZmAppChooser.prototype._createButton =
function(id, tabStyle, isLast) {
	var text = tabStyle == DwtToolBar.HORIZ_STYLE ? ZmAppChooser.TEXT[id]: null;
	var b = new ZmChicletButton(this, ZmAppChooser.IMAGE[ZmAppChooser.OUTER], ZmAppChooser.IMAGE[id], text, isLast);
	b.setActivatedImage(ZmAppChooser.IMAGE[ZmAppChooser.OUTER_ACT]);
	b.setTriggeredImage(ZmAppChooser.IMAGE[ZmAppChooser.OUTER_TRIG]);
	b.setToolTipContent(ZmAppChooser.TOOLTIP[id]);
	b.setData(Dwt.KEY_ID, id);
	this._buttons[id] = b;
};
