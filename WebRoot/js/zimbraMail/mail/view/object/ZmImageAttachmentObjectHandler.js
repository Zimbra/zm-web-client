/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmImageAttachmentObjectHandler = function() {
	ZmObjectHandler.call(this, ZmImageAttachmentObjectHandler.TYPE);
	this._imageHash = {};
}

ZmImageAttachmentObjectHandler.prototype = new ZmObjectHandler;
ZmImageAttachmentObjectHandler.prototype.constructor = ZmImageAttachmentObjectHandler;

ZmImageAttachmentObjectHandler.TYPE = "imageAttachemnt";

ZmImageAttachmentObjectHandler.THUMB_SIZE = 'width="320" height="240"';
ZmImageAttachmentObjectHandler.THUMB_SIZE_MAX = 320;
	
// already htmlencoded!!
ZmImageAttachmentObjectHandler.prototype._getHtmlContent =
function(html, idx, obj, context) {
	html[idx++] = obj; //AjxStringUtil.htmlEncode(obj, true);
	return idx;
}

ZmImageAttachmentObjectHandler.prototype.getToolTipText =
function(url, context) {
	var image = this._imageHash[context.url];
	if (!image) {
		image = {id:Dwt.getNextId()};
		this._imageHash[context.url] = image;
		this._preload(context.url, image.id);	
	}
	
	var el = document.getElementById(image.id);
	if (el && !image.el) {
		image.el = el;
	}
	if (image.el) {
		return image.el.xml || image.el.outerHTML;
	}
	return '<img id="'+ image.id +'" style="visibility:hidden;"/>';
};

ZmImageAttachmentObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};

ZmImageAttachmentObjectHandler.prototype._preload =
function(url, id) {
	var tmpImage = new Image();
	tmpImage.onload = AjxCallback.simpleClosure(this._setSize, this, id, tmpImage);
	tmpImage.src = url;
}

ZmImageAttachmentObjectHandler.prototype._setSize =
function(id, tmpImage) {
	var elm = document.getElementById(id);
	if(elm) {
		var width = tmpImage.width;
		var height = tmpImage.height;
		if(width > ZmImageAttachmentObjectHandler.THUMB_SIZE_MAX && width >= height) {
			elm.width = ZmImageAttachmentObjectHandler.THUMB_SIZE_MAX;
		} else if (height > ZmImageAttachmentObjectHandler.THUMB_SIZE_MAX && height > width) {
			elm.height = ZmImageAttachmentObjectHandler.THUMB_SIZE_MAX;
		} else {
			elm.width = width;
			elm.width = height;
		}
		elm.src = tmpImage.src;
		elm.style.visibility = "visible";
	}
	tmpImage.onload = null;
	tmpImage = null;
}
