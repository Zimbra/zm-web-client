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
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Create a new, empty appt list.
* @constructor
* @class
* This class represents a list of appts.
*
*/
function ZmRosterItemList(appCtxt) {
	ZmList.call(this, ZmItem.ROSTER_ITEM, appCtxt);
}

ZmRosterItemList.prototype = new ZmList;
ZmRosterItemList.prototype.constructor = ZmRosterItemList;

ZmRosterItemList.prototype.toString = 
function() {
	return "ZmRosterItemList";
}

ZmRosterItemList.prototype.addItem =
function(item, skipNotify) {
    this.add(item);
    if (!skipNotify) {
        this._eventNotify(ZmEvent.E_CREATE, [item]);
    }
};

ZmRosterItemList.prototype.removeItem = 
function(item, skipNotify) {
    this.remove(item);
    if (!skipNotify) {
        this._eventNotify(ZmEvent.E_REMOVE, [item]);
    }    
};

ZmRosterItemList.prototype.getByAddr =
function(addr) {
    return this.getById(addr);
};

ZmRosterItemList.prototype.getAutoCompleteGroups =
function() {
    return new ZmRosterItemListGroups(this.getGroupsArray());
};

/**
 * return an array of all groups (uniqified)
 */

ZmRosterItemList.prototype.getGroupsArray =
function() {
// TODO: cache. only used to auto-complete groups for now
    var hash = {};
    var result = [];
	var listArray = this.getArray();
	for (var i=0; i < listArray.length; i++) {
	    var groups = listArray[i].getGroups();
        for (var g in groups) {
            var name = groups[g];
            if (!(name in hash)) {
                hash[name] = true;
                result.push(name);
            }
        }
	}
	return result;
};

ZmRosterItemList.prototype.removeAllItems =
function() {
    // get a clone, since we are removing while iterating...
	var listArray = this.getVector().clone().getArray();
	for (var i=0; i < listArray.length; i++) {
	    this.removeItem(listArray[i]);
	}
};

ZmRosterItemList.prototype.loadFromJs =
function(obj) {
	if (obj && obj.item && obj.item.length) {
		for (var i = 0; i < obj.item.length; i++) {
		    var item = obj.item[i];
            //if (item.group == null) item.group = ZmMsg.buddies;
            var item = new ZmRosterItem(item.addr, this, this._appCtxt, item.name, item.show, item.status, item.group);
            this.addItem(item);
        	}
	}
};

ZmRosterItemList.prototype._getGroups =
function(groups, groupDict) {
    if (groups == null || groups == "") return "";
    var g = groups.split(/,/);
    var result = [];
    for (var i=0; i < g.length; i++) {
        if (g[i] in groupDict) result.push(groupDict[g[i]]);
    }
    return result.join(",");
};

ZmRosterItemList.prototype._handleGetRosterResponse =
function(args) {
    var resp = args.getResponse()
    if (!resp || !resp.IMGetRosterResponse) return;
    var roster = resp.IMGetRosterResponse;
    var groupDict = {};
    if (roster.groups && roster.groups.group) {
        var groups = roster.groups.group;
        for (var i=0; i < groups.length; i++) {
            var group = groups[i];
            groupDict[group.num] = group.name;
        }        
    }
    if (roster.items && roster.items.item) {
        var items = roster.items.item;
        for (var i=0; i < items.length; i++) {
            var item = items[i];
            if (item.subscription == "TO") {
                // TODO: handle item.presence
                var groups = this._getGroups(item.group, groupDict);
                var rosterItem = new ZmRosterItem(item.addr, this, this._appCtxt, item.name, null, null, groups);
                this.addItem(rosterItem);
            }
        }        
    }
};


ZmRosterItemList.prototype.reload =
function() {
    this.removeAllItems();
    var soapDoc = AjxSoapDoc.create("IMGetRosterRequest", "urn:zimbraMail");
    var callback = new AjxCallback(this, this._handleGetRosterResponse);
	this._appCtxt.getAppController().sendRequest(soapDoc, true, callback);
};

ZmRosterItemList.prototype.reloadDummy =
function() {
    this.removeAllItems();
	this.loadFromJs({ 
	    item: [
            {addr: "dkarp@zimbra.com", name: "Dan", show: ZmRosterItem.SHOW_ONLINE, group: "Friends"},
            {addr: "ross@zimbra.com", name: "Ross", show: ZmRosterItem.SHOW_DND, group: "Work"},
            {addr: "satish@zimbra.com", name: "Satish", show: ZmRosterItem.SHOW_AWAY, status:"out to lunch", group: "Work"},
            {addr: "tim@zimbra.com", name: "Tim", show: ZmRosterItem.SHOW_OFFLINE, group: "Work"},
            {addr: "anand@zimbra.com", name: "Anand", show: ZmRosterItem.SHOW_EXT_AWAY, group: "Friends,Work"},
            {addr: "andy@zibra.com", name: "Andy", show: ZmRosterItem.SHOW_CHAT, group: "Work"},
            {addr: "matt@gmail.com", show:ZmRosterItem.SHOW_ONLINE, group: "Family"}
	    ]
    });
};

/**
 * create item on server.
 */
ZmRosterItemList.prototype.createRosterItem =
function(addr, name, groups) {
    var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraMail");
    var method = soapDoc.getMethod();
	method.setAttribute("addr", addr);    
	if (name) method.setAttribute("name", name);
	if (groups) method.setAttribute("group", groups); // soap attr is "group", not "groups"
	method.setAttribute("op", "add");
	this._appCtxt.getAppController().sendRequest(soapDoc, true);
};

//------------------------------------------
// for autocomplete 
//------------------------------------------

/**
* groups should be an array of groups
*/
function ZmRosterItemListGroups(groups) {
    this._groups = groups.sort();
};

ZmRosterItemListGroups.prototype.constructor = ZmRosterItemListGroups;

/**
* Returns a list of matching groups for a given string
*/
ZmRosterItemListGroups.prototype.autocompleteMatch =
function(str) {
    str = str.toLowerCase();
    var result = [];
    for (var i in this._groups) {
        var g = this._groups[i];
        if (g.toLowerCase().indexOf(str) == 0) result.push({data: g, text: g });
    }
    return result;
};

ZmRosterItemListGroups.prototype.isUniqueValue =
function(str) {
	return false;
};

