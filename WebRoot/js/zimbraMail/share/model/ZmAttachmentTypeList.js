/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines a list of attachment types.
 *
 */

/**
 * Creates an attachment type list
 * @class
 * This class represents attachment types.
 * 
 * @extends	ZmModel
 */
ZmAttachmentTypeList = function() {
	ZmModel.call(this, ZmEvent.S_ATT);
};

ZmAttachmentTypeList.prototype = new ZmModel;
ZmAttachmentTypeList.prototype.constructor = ZmAttachmentTypeList;

ZmAttachmentTypeList.prototype.isZmAttachmentTypeList = true;
ZmAttachmentTypeList.prototype.toString = function() { return "ZmAttachmentTypeList"; };

/**
 * Gets the attachments.
 * 
 * @return	{Array}	an array of attachments
 */
ZmAttachmentTypeList.prototype.getAttachments =
function() {
	return this._attachments;
};

/**
 * Compares attachment type lists by description.
 * 
 * @param	{ZmAttachmentTypeList}	a			the first entry
 * @param	{ZmAttachmentTypeList}	b			the first entry
 * @return	{int}	0 if the entries match; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmAttachmentTypeList.compareEntry = 
function(a,b) {
	if (a.desc.toLowerCase() < b.desc.toLowerCase())	{ return -1; }
	if (a.desc.toLowerCase() > b.desc.toLowerCase())	{ return 1; }
	return 0;
};

/**
 * Loads the attachments.
 * 
 * @param	{AjxCallback}	callback		the callback to call after load
 */
ZmAttachmentTypeList.prototype.load =
function(callback) {

	this._attachments = [];

	var jsonObj = {BrowseRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.BrowseRequest;
	request.browseBy = "attachments";

	var respCallback = this._handleResponseLoad.bind(this, callback);
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
};

/**
 * @private
 */
ZmAttachmentTypeList.prototype._handleResponseLoad =
function(callback, result) {
	var att = this._organizeTypes(result.getResponse().BrowseResponse.bd);
    var isZipFileIncluded = false;
	if (att) {
		for (var i = 0; i < att.length; i++) {
			var type = att[i]._content;
			if (!ZmMimeTable.isIgnored(type)) {
				this._attachments.push(ZmMimeTable.getInfo(type, true));
			}
		}
		this._attachments.sort(ZmAttachmentTypeList.compareEntry);
	}

	if (callback) {
		callback.run(this._attachments);
	}
};

/**
 * Check whether type is from the following list
 * Adobe PDF
 * Microsoft Word (doc, docx)
 * Microsoft Powerpoint
 * Microsoft Excel
 * Email Message
 * HTML
 * Calendar (ical)
 *
 *
 * @param	{String}			attachment type
 * @return	{Boolean}           true if the type in the above list, otherwise false
 *
 * @private
 */
ZmAttachmentTypeList.prototype._isSupportedType  =
function(type){
	var supportedTypes =  [ZmMimeTable.APP_ADOBE_PDF, ZmMimeTable.APP_MS_WORD,ZmMimeTable.APP_MS_EXCEL,
    	                   ZmMimeTable.APP_MS_PPT, ZmMimeTable.APP_ZIP,ZmMimeTable.APP_ZIP2, ZmMimeTable.MSG_RFC822,
        	               ZmMimeTable.TEXT_HTML, ZmMimeTable.TEXT_CAL];

    return AjxUtil.arrayContains(supportedTypes, type);
};

/**
 * Returns group type if type belongs to following group:
 *  Text (vcard, csv)
 *  Video (mpeg, mov)
 *  Audio (wav, mp3, etc)
 *  Archive (zip, etc)
 *  Application (any)
 *  Image (bmp, png, gif, tiff, jpg, psd, ai, jpeg)
 *
 * @param	{String}	    attachment type
 * @return	{String}	    attachment group if it exits in the above list, otherwise null
 *
 * @private
 */
ZmAttachmentTypeList.prototype._isSupportedGroup =
function(type){
    var supportedGroups = [ZmMimeTable.APP,ZmMimeTable.AUDIO,ZmMimeTable.IMG,ZmMimeTable.TEXT,ZmMimeTable.VIDEO ];
    var regExp =new RegExp("^" + supportedGroups.join("|^") ,"ig");
    var groupType = type.match(regExp)
    return groupType && groupType[0];

};

/**
 * Returns set of supported type/group of attachments
 *
 * @param	{Array} list of attachment types
 * @return	{Array} Set of types which is an intersection of att and supported types/groups
 * @private
 */
ZmAttachmentTypeList.prototype._organizeTypes =
function(att) {

	var res = [];
	if (!(att && att.length)) {
		return res;
	}

	for (var i = 0; i < att.length; i++) {
		var type = att[i]._content;
		var freq = att[i].freq;
		var skip = true;
		var groupType = null;
		if (this._isSupportedType(type)) {
			skip = false;
		} else if (type = this._isSupportedGroup(type)) {
			skip = false;
			// Check if group is already in result
			for (var j=0; j < res.length; j++) {
				if (res[j]. _content === type ) {
					res[j].freq += freq;
					skip = true;
					break;
				}
			}
		}
	
		if (!skip) {
			res.push({_content: type, freq: freq});
		}

	}
	return res;
};
