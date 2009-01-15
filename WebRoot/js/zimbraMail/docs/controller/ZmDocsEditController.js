/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmDocsEditController = 	function() {

};

ZmDocsEditController.prototype.toString = function() {
    return "ZmSlideController";
};


ZmDocsEditController.prototype.setToolBar = function(toolbar) {
    this._toolbar = toolbar;
    this._initToolBar();
}

ZmDocsEditController.prototype.setCurrentView = function(view) {
    this._currentView = view;
}

ZmDocsEditController._VALUE = "value";

ZmDocsEditController.ACTION_INSERT_TEXTBOX = "textbox";
ZmDocsEditController.ACTION_DELETE_TEXTBOX = "delete";
ZmDocsEditController.ACTION_NEW_SLIDE = "newslide";
ZmDocsEditController.ACTION_DELETE_SLIDE = "deleteslide";
ZmDocsEditController.ACTION_RUN = "run";
ZmDocsEditController.ACTION_SAVE = "save";


ZmDocsEditController.prototype._initToolBar = function () {

    var tb = this._toolbar;

    var listener = new AjxListener(this, this._actionListener);

    this._saveSlide = new DwtToolBarButton({parent:tb});
    this._saveSlide.setToolTipContent(ZmMsg.save);
    this._saveSlide.setImage("Save");
    this._saveSlide.setText(ZmMsg.save);
    this._saveSlide.setData(ZmDocsEditController._VALUE, ZmDocsEditController.ACTION_SAVE);
    this._saveSlide.addSelectionListener(listener);

    tb.setVisible(true);
}

ZmDocsEditController.prototype._actionListener =
function(ev) {
    var action = ev.item.getData(ZmDocsEditController._VALUE);

    if(action == ZmDocsEditController.ACTION_SAVE) {
        this._currentView.saveFile();
    }
}


