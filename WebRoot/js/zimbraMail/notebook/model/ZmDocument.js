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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmDocument = function(id, list) {
	ZmNotebookItem.call(this, ZmItem.DOCUMENT, id, list);
}
ZmDocument.prototype = new ZmNotebookItem;
ZmDocument.prototype.constructor = ZmDocument;

ZmDocument.prototype.toString = function() {
	return "ZmDocument";
};

// Data

ZmDocument.prototype.contentType;

// Static functions

ZmDocument.createFromDom = function(node, args) {
	var doc = new ZmDocument(node.id, args.list);
	doc.set(node);
	return doc;
};

// Public methods

ZmDocument.prototype.set = function(data) {
	ZmNotebookItem.prototype.set.call(this, data);

	// ZmDocument fields
	this.contentType = data.ct != null ? data.ct : this.contentType;
};
