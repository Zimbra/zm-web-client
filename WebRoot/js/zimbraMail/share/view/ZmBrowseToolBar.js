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

ZmBrowseToolBar = function(parent, pickers) {

	ZmToolBar.call(this, {parent:parent, className:"ZmBrowseToolBar"});
	
	for (var i = 0; i < pickers.length; i++) {
		var id = pickers[i];
		var b = this.createButton(id, {image:ZmPicker.IMAGE[id], text:ZmMsg[ZmPicker.MSG_KEY[id]],
									   tooltip:ZmMsg[ZmPicker.TT_MSG_KEY[id]]});
		b.setData(ZmPicker.KEY_ID, id);
		b.setData(ZmPicker.KEY_CTOR, ZmPicker.CTOR[id]);
	}

	this.addSeparator();

	var id = ZmPicker.RESET;
	var b = this.createButton(id, {image:ZmPicker.IMAGE[id], text:ZmMsg[ZmPicker.MSG_KEY[id]],
								   tooltip:ZmMsg[ZmPicker.TT_MSG_KEY[id]]});
	b.setData(ZmPicker.KEY_ID, id);

	this.addFiller();

	var id = ZmPicker.CLOSE;
	var text = AjxEnv.is800x600orLower ? null : ZmMsg[ZmPicker.MSG_KEY[id]];
	var b = this.createButton(id, {image:ZmPicker.IMAGE[id], text:text,
								   tooltip:ZmMsg[ZmPicker.TT_MSG_KEY[id]]});
	b.setData(ZmPicker.KEY_ID, id);
}

ZmBrowseToolBar.prototype = new ZmToolBar;
ZmBrowseToolBar.prototype.constructor = ZmBrowseToolBar;

ZmBrowseToolBar.prototype.toString = 
function() {
	return "ZmBrowseToolBar";
}
