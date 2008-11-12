/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmBriefcaseIconView = function(params) {
	ZmListView.call(this, params);
	this.getHtmlElement().style.backgroundColor = "white";
}

ZmBriefcaseIconView.prototype = new ZmListView;
ZmBriefcaseIconView.prototype.constructor = ZmBriefcaseIconView;

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
	
	htmlArr[idx++] = "<table><tr><td>"
	htmlArr[idx++] = "<div class='Img" + icon + "'></div>";
	htmlArr[idx++] = "</td><td nowrap>";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(item.name);
	htmlArr[idx++] = "</td><tr></table>";
	
	if (params.isDragProxy) {
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
	}
	div.innerHTML = htmlArr.join("");
	
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
	return div;
};

ZmBriefcaseIconView.prototype.set =
function(folderId, list) {
    var element = this.getHtmlElement();

    var itemsList = list;
    if(list instanceof ZmList){
        itemsList = list.getVector();
    }
    DwtListView.prototype.set.call(this,itemsList);
};

ZmBriefcaseIconView.prototype.getTitle =
function() {
	//TODO: title is the name of the current folder
	return [ZmMsg.zimbraTitle].join(": ");
};

ZmBriefcaseIconView.prototype.getContent =
function() {
	return this.getHtmlElement().innerHTML;
};
