/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2011, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */
/**
 * From Group divides messages into sort by sender.
 */
ZmMailListFromGroup = function() {
    this.id = ZmId.GROUPBY_FROM;
	this.field = ZmItem.F_FROM;
    ZmMailListGroup.call(this);

};

ZmMailListFromGroup.prototype = new ZmMailListGroup;
ZmMailListFromGroup.prototype.constructor =  ZmMailListFromGroup;

/**
 *  returns HTML string for all sections.
 *  @param {boolean} sortAsc    true/false if sort ascending
 *  @return {String} HTML for all sections including section header
 * @param sortAsc
 */
ZmMailListFromGroup.prototype.getAllSections =
function(sortAsc) {
    var htmlArr = [];
    var keys = this._sortKeys(sortAsc);

    for(var i=0; i<keys.length; i++) {
        var key = keys[i].addr;
        if (this._section[key].length > 0) {
            var sectionHeader = keys[i].title;
            htmlArr.push(this.getSectionHeader(sectionHeader));
            htmlArr.push(this._section[key].join(""));
        }
    }

    return htmlArr.join("");
};

/**
 * Adds item to section
 * @param {ZmMailMsg} msg   mail message
 * @param {String} item  HTML to add to section
 * @return {String} section returns section if successfully added, else returns null
 */
ZmMailListFromGroup.prototype.addMsgToSection =
function(msg, item){
    var email = null;
    var fromParticipant =  msg.getAddress(AjxEmailAddress.FROM);
    if (fromParticipant) {
        email = fromParticipant.getAddress();
        if (this._section.hasOwnProperty(email)) {
            this._section[email].push(item);
        } else {
            this._section[email] = [];
            this._section[email].push(item);
            var title = this._getSectionTitle(fromParticipant);
            this._sectionTitle[email] = {addr: email, title:title};
        }
    }
    return email;
};


/**
 * Determines if message is in group
 * @param {String} section ID of section
 * @param {ZmMailMsg} msg
 * @return {boolean} true/false
 */
ZmMailListFromGroup.prototype.isMsgInSection =
function(section, msg) {

    var addr;
    var participants = msg.participants;
    if (participants) {
        var arr = participants.getArray();
        for (var i=0; i<arr.length; i++){
            if (arr[i].getType() == "FROM") {
              addr = arr[i].getAddress();
              break;
            }
        }
    }

    if (addr && addr == section) {
       return true;
    }

    return false;
};

/**
 * Returns the sort by (ZmSearch.NAME_ASC or ZmSearch.NAME_DESC)
 * @param {boolean} sortAsc
 * @return {String} sortBy
 */
ZmMailListFromGroup.prototype.getSortBy =
function(sortAsc) {
    if (sortAsc) {
        return ZmSearch.NAME_ASC;
    }
    return ZmSearch.NAME_DESC;
};

ZmMailListFromGroup.prototype._init =
function() {
    this._section = {};
    this._sectionTitle = {};
};

ZmMailListFromGroup.prototype._sortKeys =
function(sortAsc) {
  var keys = [];
  var i=0;
  for (var name in this._sectionTitle) {
      keys[i++] = {addr: this._sectionTitle[name].addr, title: this._sectionTitle[name].title};
  }

  var sortAscIgnoreCase = function(a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
  };

  var sortDescIgnoreCase = function(a, b) {
    a = a.title.toLowerCase();
    b = b.title.toLowerCase();
    if (a < b)
        return 1;
    if (a > b)
        return -1;
    return 0;
  };

  keys.sort(sortAscIgnoreCase);
  if (!sortAsc) {
      keys.reverse(sortDescIgnoreCase);
  }
  return keys;
};

ZmMailListFromGroup.prototype._getSectionTitle =
function(participant) {
    var sectionHeader = participant.getAddress();
    var name = participant.getName();
    if (name) {
        sectionHeader = name;
    }
    return sectionHeader;
};

ZmMailListFromGroup.prototype._getSectionHeaderTitle =
function(section) {
    return this._sectionTitle[section].title;
};