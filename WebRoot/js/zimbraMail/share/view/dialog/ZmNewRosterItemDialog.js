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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNewRosterItemDialog(parent, appCtxt) {
	ZmQuickAddDialog.call(this, parent);
	this._appCtxt = appCtxt;
	this.setContent(this._contentHtml());
	this.setTitle(ZmMsg.createNewRosterItem);
	this.setTabOrder([this._addressFieldId, this._nameFieldId, this._groupsFieldId]);
    this._initGroupAutocomplete();
}

ZmNewRosterItemDialog._OVERVIEW_ID = "ZmNewRosterItemDialog";

ZmNewRosterItemDialog.prototype = new ZmQuickAddDialog;
ZmNewRosterItemDialog.prototype.constructor = ZmNewRosterItemDialog;

ZmNewRosterItemDialog.prototype.toString = 
function() {
	return "ZmNewRosterItemDialog";
};

ZmNewRosterItemDialog.prototype._contentHtml = 
function() {
	this._addressFieldId = Dwt.getNextId();
	this._nameFieldId = Dwt.getNextId();
	this._groupsFieldId = Dwt.getNextId();	

	var html = new AjxBuffer();
//	html.append("<table cellpadding='0' cellspacing='5' border='0'>");
	html.append("<table border='0' width=325>");

	html.append("<tr valign='center'><td class='ZmChatDialogField'>", ZmMsg.addressLabel, "</td>");
	html.append("<td><input autocomplete=OFF type='text' style='width:100%; height:22px' id='", this._addressFieldId, "' /></td></tr>");

	html.append("<tr valign='center'><td class='ZmChatDialogField'>", ZmMsg.nameLabel, "</td>");
	html.append("<td><input autocomplete=OFF type='text' style='width:100%; height:22px' id='", this._nameFieldId, "' /></td></tr>");
	
	html.append("<tr valign='center'><td class='ZmChatDialogField'>", ZmMsg.groupsLabel, "</td>");
	html.append("<td><input autocomplete=OFF type='text' style='width:100%; height:22px' id='", this._groupsFieldId, "' /></td></tr>");		
	html.append("</table>");
	
	return html.toString();
};

ZmNewRosterItemDialog.prototype.popup =
function(loc) {
	// reset input fields
	this.reset();
	// show dialog
	DwtDialog.prototype.popup.call(this, loc);
};

ZmNewRosterItemDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getRosterItemData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmNewRosterItemDialog.prototype._getRosterItemData =
function() {
	var name = AjxStringUtil.trim(document.getElementById(this._nameFieldId).value);
	var msg = ZmRosterItem.checkName(name);

	var address = AjxStringUtil.trim(document.getElementById(this._addressFieldId).value);
	if (!msg) msg = ZmRosterItem.checkAddress(address);

	var groups = AjxStringUtil.trim(document.getElementById(this._groupsFieldId).value);
	if (!msg) msg = ZmRosterItem.checkGroups(groups);

	return (msg ? this._showError(msg) : [address, name, groups]);
};

ZmNewRosterItemDialog.prototype.reset =
function() {
	ZmDialog.prototype.reset.call(this);
	document.getElementById(this._nameFieldId).value = "";	
	document.getElementById(this._addressFieldId).value = "";
	document.getElementById(this._groupsFieldId).value = "";	
};

ZmNewRosterItemDialog.prototype._initGroupAutocomplete =
function() {
	if (this._groupAutocomplete) return;

	var shell = this._appCtxt.getShell();
	var imApp = shell ? shell.getData(ZmAppCtxt.LABEL).getApp(ZmZimbraMail.IM_APP) : null;
	var groupList = imApp ? imApp.getAutoCompleteGroups : null;
	var locCallback = new AjxCallback(this, this._getGroupAcListLoc, this);
	var params = {parent: shell, dataClass: imApp, dataLoader: groupList,
				  matchValue: "text", locCallback: locCallback, separator: ','};
	this._groupAutocomplete = new ZmAutocompleteListView(params);
	this._groupAutocomplete.handle(document.getElementById(this._groupsFieldId));
};

ZmNewRosterItemDialog.prototype._getGroupAcListLoc =
function(ev) {
    var field = document.getElementById(this._groupsFieldId);
	if (field) {
		var loc = Dwt.getLocation(field);
		var height = Dwt.getSize(field).y;
		return (new DwtPoint(loc.x, loc.y+height));
	}
	return null;
};
