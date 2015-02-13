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
 *  @return {String} HTML for all sections including section header
 */
ZmMailListFromGroup.prototype.getAllSections =
function() {
    var htmlArr = [];
	var sections = this._sectionList;

	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		htmlArr.push(this.getSectionHeader(section));
		htmlArr.push(this._section[section].join(""));
	}

    return htmlArr.join("");
};

/**
 * Adds item to section
 * @param {ZmMailMsg} msg   mail message
 * @param {String} itemHtml  HTML to add to section
 * @return {String} section returns section if successfully added, else returns null
 */
ZmMailListFromGroup.prototype.addMsgToSection =
function(msg, itemHtml){
    var fromParticipant =  msg.getAddress(AjxEmailAddress.FROM);
    if (!fromParticipant) {
		return null;
	}
	var section = fromParticipant.getText();
	if (!this._section.hasOwnProperty(section)) {
		this._section[section] = [];
		this._sectionList.push(section);
	}
	this._section[section].push(itemHtml);
	return section;
};

/**
 * Returns the sort by (ZmSearch.NAME_ASC or ZmSearch.NAME_DESC)
 * @param {boolean} sortAsc
 * @return {String} sortBy
 */
ZmMailListFromGroup.prototype.getSortBy =
function(sortAsc) {
    return sortAsc ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
};

ZmMailListFromGroup.prototype._init =
function() {
    this._section = {};
	this._sectionList = [];
};

ZmMailListFromGroup.prototype._getSectionHeaderTitle =
function(section) {
	return section;
};