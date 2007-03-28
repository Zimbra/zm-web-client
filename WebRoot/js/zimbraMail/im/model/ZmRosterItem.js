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
function ZmRosterItem(id, list, appCtxt, name, presence, groupNames) {
	ZmItem.call(this, appCtxt, ZmOrganizer.ROSTER_ITEM, id, list);
	this.name = name;
	this.presence = presence || new ZmRosterPresence();
	this.groupNames = groupNames;
    this.groups = groupNames ? groupNames.split(/,/) : [];
    this.numUnreadIMs = 0; // num unread IMs from this buddy
}

ZmRosterItem.prototype = new ZmItem;
ZmRosterItem.prototype.constructor = ZmRosterItem;

ZmRosterItem.F_PRESENCE = "ZmRosterItem.presence";
ZmRosterItem.F_GROUPS = "ZmRosterItem.groups";
ZmRosterItem.F_NAME = "ZmRosterItem.name";
ZmRosterItem.F_UNREAD = "ZmRosterItem.unread";

ZmRosterItem.prototype.toString = 
function() {
	return "ZmRosterItem - " + this.name;
};

/**
 * delete item on server. notification will remove us from list
 */
ZmRosterItem.prototype._delete =
function() {
    this._modify(this.id, this.name, this.groupNames, true);
};

/**
 * modify item on server. notification will remove us from list
 */
ZmRosterItem.prototype._modify =
function(id, name, groupNames, doDelete) {
    var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
    var method = soapDoc.getMethod();
	method.setAttribute("addr", id);
	if (name) method.setAttribute("name", name);
	if (groupNames) method.setAttribute("groups", groupNames);
	method.setAttribute("op", doDelete ? "remove" : "add");
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

ZmRosterItem.prototype.getPresence =
function() {
    return this.presence;
};

// debugging hack, to be removed
ZmRosterItem.prototype.__setShow  = 
function(show, status) {
    this.presence.setShow(show).setStatus(status);
    this._notifyPresence();
};

ZmRosterItem.prototype._notifyPresence =
function() {
    var fields = {};
    fields[ZmRosterItem.F_PRESENCE] = this.getPresence();
    this.list._notify(ZmEvent.E_MODIFY, {fields: fields, items: [this]});
    delete this._toolTip;
};

ZmRosterItem.prototype.setUnread  = 
function(num, addToTotal) {
    this.numUnreadIMs = addToTotal ? this.numUnreadIMs + num : num;
    var fields = {};
    fields[ZmRosterItem.F_UNREAD] = this.numUnreadIMs;
    this.list._notify(ZmEvent.E_MODIFY, {fields: fields, items: [this]});
    delete this._toolTip;    
};

ZmRosterItem.prototype._notifySetGroups = 
function(newGroups) {
    this.groupNames = newGroups;
    this.groups = this.groupNames ? this.groupNames.split(/,/) : [];
    var fields = {};
    fields[ZmRosterItem.F_GROUPS] = this.groupNames;
    this.list._notify(ZmEvent.E_MODIFY, {fields: fields, items: [this]});
    delete this._toolTip;    
};

ZmRosterItem.prototype._notifySetName = 
function(newName) {
    this.name = newName;
    var fields = {};
    fields[ZmRosterItem.F_NAME] = this.name;
    this.list._notify(ZmEvent.E_MODIFY, {fields: fields, items: [this]});
    delete this._toolTip;    
};

/**
 * sends updated group list to server
 */
ZmRosterItem.prototype.doRenameGroup = 
function(oldGroup, newGroup) {
    var oldI = -1;
    var newI = -1;
    for (var i in this.groups) {
        if (this.groups[i] == oldGroup) oldI = i;
        if (this.groups[i] == newGroup) newI = i;
    }
    if (newI !=-1 || oldI == -1) return;
    var newGroups = [];
    for (var i in this.groups) {
        if (i != oldI) newGroups.push(this.groups[i]);
    }
    newGroups.push(newGroup);
    var newGroupNames = newGroups.join(",");
    this._modify(this.id, this.name, newGroupNames, false);    
};

ZmRosterItem.sortCompare = 
function(itemA, itemB) {
	var check = ZmOrganizer.checkSortArgs(itemA, itemB);
	if (check != null) return check;

	// sort by name
	var itemAName = itemA.getDisplayName().toLowerCase();
	var itemBName = itemB.getDisplayName().toLowerCase();
	if (itemAName < itemBName) {return -1;}
	if (itemAName > itemBName) {return 1;}
	return 0;
};

// Public methods
ZmRosterItem.prototype.getId = function() { return this.id; };

ZmRosterItem.prototype.getAddress= function() { return this.id; };

ZmRosterItem.prototype.getGroups = function() { return this.groups; };

ZmRosterItem.prototype.getGroupNames = function() { return this.groupNames; };

ZmRosterItem.prototype.getName = function() {	return this.name; }

ZmRosterItem.prototype.getDisplayName = function() {	return this.name ? this.name : this.id;};

ZmRosterItem.prototype.getUnread = function() { return this.numUnreadIMs; };

ZmRosterItem.prototype.inGroup = 
function(name) { 
    for (var i in this.groups) {
        if (this.groups[i] == name) return true;
    }
    return false;
};

/**
* Checks a roster name for validity. Returns an error message if the
* name is invalid and null if the name is valid.
*
* @param name
*/
ZmRosterItem.checkName =
function(name) {
	return null;
};

/**
* Checks a roster address for validity. Returns an error message if the
* addres is invalid and null if the address is valid.
*
* @param address
*/
ZmRosterItem.checkAddress =
function(address) {
    if (address == null || address == "")
        return ZmMsg.rosterItemAddressNoValue;
    else
        	return null;
};

ZmRosterItem.checkGroups =
function(groups) {
    return null;
};


// Adds a row to the tool tip.
ZmRosterItem.prototype._addEntryRow =
function(field, data, html, idx, wrap, width) {
	if (data != null && data != "") {
		html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b><div style='white-space:nowrap'>";
		html[idx++] = AjxStringUtil.htmlEncode(field) + ":";
		html[idx++] = "</div></b></td><td align='left'><div style='white-space:";
		html[idx++] = wrap ? "wrap;" : "nowrap;";
		if (width) html[idx++] = "width:"+width+"px;";
		html[idx++] = "'>";
		html[idx++] = AjxStringUtil.htmlEncode(data);
		html[idx++] = "</div></td></tr>";
	}
	return idx;
};

/**
* Returns HTML for a tool tip for this appt.
*/
ZmRosterItem.prototype.getToolTip =
function() {
	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 >";
		html[idx++] = "<tr valign='middle'><td colspan=2 align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black;'>";
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
		html[idx++] = "<tr valign='middle'>";
		html[idx++] = "<td valign='middle'><b>";
		html[idx++] = "<td valign='middle'>" + AjxImg.getImageHtml(this.getPresence().getIcon()) + "</td>";
		html[idx++] = "<td valign='middle' align='center'><b>";
		html[idx++] = AjxStringUtil.htmlEncode(this.getDisplayName() + " (" + this.getPresence().getShowText() + ")");
		html[idx++] = "</td></b>";	
		html[idx++] = "<td align='right' valign='middle'>";
		html[idx++] = AjxImg.getImageHtml("HappyEmoticon");
		html[idx++] = "</td>";
		html[idx++] = "</tr>";		
		html[idx++] = "</table>";
		html[idx++] = "</div>";
		html[idx++] = "</td></tr>";				
		idx = this._addEntryRow(ZmMsg.imAddress, this.getAddress(), html, idx, false); //true, "250");		
		idx = this._addEntryRow(ZmMsg.imName, this.name, html, idx, false);  // use this.name
		idx = this._addEntryRow(ZmMsg.imGroups, this.getGroups().join(", "), html, idx, false);
		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
};
