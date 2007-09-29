/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmDocument(appCtxt, id, list) {
	if (arguments.length == 0) return;
	ZmNotebookItem.call(this, appCtxt, ZmItem.DOCUMENT, id, list);
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
	var doc = new ZmDocument(args.appCtxt, node.id, args.list);
	doc.set(node);
	return doc;
};

// Public methods

ZmDocument.prototype.set = function(data) {
	ZmNotebookItem.prototype.set.call(this, data);

	// ZmDocument fields
	this.contentType = data.ct != null ? data.ct : this.contentType;
};
