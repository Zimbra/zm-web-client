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

function ZmAppChooser(parent, className, buttons) {

	className = className ? className : "ZmAppChooser";
	DwtToolBar.call(this, parent, className, Dwt.ABSOLUTE_STYLE, null, null, DwtToolBar.VERT_STYLE);

	this.setScrollStyle(Dwt.CLIP);

	this._buttons = new Object();
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) {
			this.addSpacer(ZmAppChooser.SPACER_HEIGHT);
		} else {
			this._createButton(id);
		}
	}

}

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

ZmAppChooser.IMAGE = new Object();
ZmAppChooser.IMAGE[ZmAppChooser.OUTER]		= "ImgAppChiclet";
ZmAppChooser.IMAGE[ZmAppChooser.OUTER_ACT]	= "ImgAppChicletHover";
ZmAppChooser.IMAGE[ZmAppChooser.OUTER_TRIG]	= "ImgAppChicletSel";

ZmAppChooser.IMAGE[ZmAppChooser.B_EMAIL]    = "MailApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_CONTACTS] = "ContactsApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_CALENDAR] = "CalendarApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_IM]		= "ImStartChat";
ZmAppChooser.IMAGE[ZmAppChooser.B_NOTEBOOK]	= "NoteApp";
ZmAppChooser.IMAGE[ZmAppChooser.B_HELP]     = "Help";
ZmAppChooser.IMAGE[ZmAppChooser.B_OPTIONS]	= "Preferences";
ZmAppChooser.IMAGE[ZmAppChooser.B_LOGOUT]	= "Logoff";

ZmAppChooser.TOOLTIP = new Object();
ZmAppChooser.TOOLTIP[ZmAppChooser.B_EMAIL]		= ZmMsg.goToMail;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_CONTACTS]	= ZmMsg.goToContacts;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_CALENDAR]	= ZmMsg.goToCalendar;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_IM]			= ZmMsg.goToIm;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_NOTEBOOK]	= ZmMsg.goToNotebooks;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_HELP]		= ZmMsg.goToHelp;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_OPTIONS]	= ZmMsg.goToOptions;
ZmAppChooser.TOOLTIP[ZmAppChooser.B_LOGOUT]		= ZmMsg.logOff;

ZmAppChooser.SPACER_HEIGHT = 10;

ZmAppChooser.prototype = new DwtToolBar;
ZmAppChooser.prototype.constructor = ZmAppChooser;

ZmAppChooser.prototype.toString = 
function() {
	return "ZmAppChooser";
}

ZmAppChooser.prototype.getButton =
function(id) {
	return this._buttons[id];
}

ZmAppChooser.prototype._createButton =
function(id) {
	var b = new ZmChicletButton(this, ZmAppChooser.IMAGE[ZmAppChooser.OUTER], ZmAppChooser.IMAGE[id]);
	b.setActivatedImage(ZmAppChooser.IMAGE[ZmAppChooser.OUTER_ACT]);
	b.setTriggeredImage(ZmAppChooser.IMAGE[ZmAppChooser.OUTER_TRIG]);
	b.setToolTipContent(ZmAppChooser.TOOLTIP[id]);
	b.setData(Dwt.KEY_ID, id);
	this._buttons[id] = b;
}
