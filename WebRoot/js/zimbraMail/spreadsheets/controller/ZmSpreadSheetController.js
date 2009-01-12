/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmSpreadSheetController = function(shell){

    if(arguments.length == 0) return;
    ZmController.call(this, shell);

    this._spreadSheet = null;
    this._toolbar = null;

    appCtxt.getShell().addControlListener(new AjxListener(this, this.resize));

};

ZmSpreadSheetController.prototype = new ZmController();
ZmSpreadSheetController.prototype.constructor = ZmSpreadSheetController;

ZmSpreadSheetController.prototype._initToolbar = function(){
   if(this._toolbar) return;
   this._toolbar = new ZmSpreadSheetToolbars(this._spreadSheet);
};

ZmSpreadSheetController.prototype._initSpreadSheet = function(){
    if(this._spreadSheet) return;

    this._spreadSheet = new ZmSpreadSheet(this._container, null, "absolute");

};

ZmSpreadSheetController.prototype.show = function(data){

    this._initSpreadSheet();
    
    var model;
    if (data != null) {
		model = new ZmSpreadSheetModel(0, 0);
		model.deserialize(data);
	} else {
		model = new ZmSpreadSheetModel(40, 15);
	}

    var spreadSheet = this._spreadSheet;
    spreadSheet.setModel(model);

    this._initToolbar();

    spreadSheet._selectedCell = null;

    spreadSheet.setZIndex(Dwt.Z_VIEW);

    this.resize();

    spreadSheet.focus();
};

ZmSpreadSheetController.prototype.resize = function(ev){

    var spreadSheet = this._spreadSheet;

    if(!spreadSheet) return;

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

ZmSpreadSheetController.prototype.toString =
function() {
	return "ZmSpreadSheetController";
};