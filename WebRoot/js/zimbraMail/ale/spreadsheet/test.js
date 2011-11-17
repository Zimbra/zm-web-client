/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
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
DBG = new AjxDebug(AjxDebug.NONE, null, false);

var shell = null;
var spreadSheet = null;
var model = null;

create = function(data) {
	shell = new DwtShell({className:"MainShell"});
	shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));
	spreadSheet = new ZmSpreadSheet(shell, null, "absolute");
	if (data != null) {
		model = new ZmSpreadSheetModel(0, 0);
		model.deserialize(data);
	} else {
		model = new ZmSpreadSheetModel(10, 6);
	}
	spreadSheet.setModel(model);
	new ZmSpreadSheetToolbars(spreadSheet, spreadSheet);
	spreadSheet.setZIndex(Dwt.Z_VIEW);
	window.onresize = _resize;
	_resize();
	spreadSheet._selectedCell = null;
	spreadSheet.focus();
};

_resize = function() {
	spreadSheet.setDisplay("none");
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	if (!AjxEnv.isIE) {
		w -= 2;
		h -= 2;
	}
	spreadSheet.setDisplay("block");
	spreadSheet.setBounds(0, 0, w, h);
};

serialize = function() {
	return model.serialize();
};

deserialize = function(data) {
	model = new ZmSpreadSheetModel(0, 0);
	model.deserialize(data);
	spreadSheet.setModel(model);
};

getHTML = function() {
	return model.getHtml();
};

getHeadHTML = function() {
	return [ "<style type='text/css'>",
		 "td.SpreadSheet-Type-number { text-align: right; }",
		 "td.SpreadSheet-Type-currency { text-align: right; }",
		 "td.SpreadSheet-Type-error { text-align: center; color: #f00; }",
		 "</style>" ].join("");
};

// Useful for testing the spreadsheet outside the ACE framework
window.onload = function() {
	setTimeout(function() {
		if (!window.ZmACE)
			create();
	}, 200);
};
