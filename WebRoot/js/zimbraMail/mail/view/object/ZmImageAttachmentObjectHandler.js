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

function ZmImageAttachmentObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt,ZmImageAttachmentObjectHandler.TYPE);
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
