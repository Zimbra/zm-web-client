/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the briefcase icon view.
 * @class
 * This class represents the briefcase icon view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 * @extends		ZmBriefcaseBaseView
 */
ZmBriefcaseIconView = function(params) {
	ZmBriefcaseBaseView.call(this, params);
	this.getHtmlElement().style.backgroundColor = "white";
}

ZmBriefcaseIconView.prototype = new ZmBriefcaseBaseView;
ZmBriefcaseIconView.prototype.constructor = ZmBriefcaseIconView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmBriefcaseIconView.prototype.toString =
function() {
	return "ZmBriefcaseIconView";
};

// Data
ZmBriefcaseIconView.prototype._createItemHtml =
function(item, params) {
	
	var name = item.name;
	var contentType = item.contentType;
	
	if(contentType && contentType.match(/;/)) {
			contentType = contentType.split(";")[0];
	}
	var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
	icon = "Img" + ( mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48");

	if(item.isFolder) {
		icon = "ImgBriefcase_48";
	}
	
	if(name.length>14){
		name = name.substring(0,14)+"...";
	}
	
	var div = document.createElement("div");
	div.className = "ZmBriefcaseItemSmall";
	
	var htmlArr = [];
	var idx = 0;

	var icon = null;
	if (!icon) {
		var contentType = item.contentType;
		if(contentType && contentType.match(/;/)) {
			contentType = contentType.split(";")[0];
		}
		var mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
		icon = mimeInfo ? mimeInfo.image : "UnknownDoc" ;
		if(item.isFolder){
			icon = "Folder";
		}
	}
	
	htmlArr[idx++] = "<table><tr>";
    if (appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
        htmlArr[idx++] = "<td>";
        idx = this._getImageHtml(htmlArr, idx, "CheckboxUnchecked", this._getFieldId(item, ZmItem.F_SELECTION));
        htmlArr[idx++] = "</td>";
    }
    htmlArr[idx++] = "<td><div class='Img";
	htmlArr[idx++] = icon;
	htmlArr[idx++] = "'></div></td><td nowrap>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	htmlArr[idx++] = "</td><tr></table>";
	
	if (params && params.isDragProxy) {
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
	}
	div.innerHTML = htmlArr.join("");
	
	this.associateItemWithElement(item, div);
	return div;
};

ZmBriefcaseIconView.prototype.set =
function(list, sortField, doNotIncludeFolders){

    doNotIncludeFolders = true;

    ZmBriefcaseBaseView.prototype.set.call(this, list, sortField, doNotIncludeFolders);

};