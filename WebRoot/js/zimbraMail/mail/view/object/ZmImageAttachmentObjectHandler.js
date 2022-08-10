/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
	}
	if (!image.el || (image.el.src !== context.url)) {
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
};

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
};
