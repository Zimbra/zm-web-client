/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

ZmImageAttachmentObjectHandler = function() {
	ZmObjectHandler.call(this, ZmImageAttachmentObjectHandler.TYPE);
}

ZmImageAttachmentObjectHandler.prototype = new ZmObjectHandler;
ZmImageAttachmentObjectHandler.prototype.constructor = ZmImageAttachmentObjectHandler;

ZmImageAttachmentObjectHandler.TYPE = "imageAttachemnt";

ZmImageAttachmentObjectHandler.THUMB_SIZE = 'width="320" height="240"';
	
// already htmlencoded!!
ZmImageAttachmentObjectHandler.prototype._getHtmlContent =
function(html, idx, obj, context) {
	html[idx++] = obj; //AjxStringUtil.htmlEncode(obj, true);
	return idx;
}

ZmImageAttachmentObjectHandler.prototype.getToolTipText =
function(url, context) {
	return '<img ' +ZmImageAttachmentObjectHandler.THUMB_SIZE + ' src="' + context.url + '"></img>';	
};

ZmImageAttachmentObjectHandler.prototype.getActionMenu =
function(obj) {
	return null;
};
