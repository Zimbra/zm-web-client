/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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

ZmSlideEditController = function() {
    this._requestMgr = new ZmRequestMgr(this);
};

ZmSlideEditController.prototype.toString = function() {
    return "ZmSlideController";
};


ZmSlideEditController.prototype.setToolBar = function(toolbar) {
    this._toolbar = toolbar;
    this._initToolBar();
}

ZmSlideEditController.prototype.setCurrentView = function(view) {
    this._currentView = view;
}

ZmSlideEditController._VALUE = "value";

ZmSlideEditController.ACTION_INSERT_TEXTBOX = "textbox";
ZmSlideEditController.ACTION_DELETE_TEXTBOX = "delete";
ZmSlideEditController.ACTION_INSERT_IMG = "insertimg";
ZmSlideEditController.ACTION_INSERT_IMG1 = "insertimg1";
ZmSlideEditController.ACTION_INSERT_GRPH = "insertgrph";
ZmSlideEditController.ACTION_NEW_SLIDE = "newslide";
ZmSlideEditController.ACTION_DELETE_SLIDE = "deleteslide";
ZmSlideEditController.ACTION_RUN = "run";
ZmSlideEditController.ACTION_THEMES = "themes";
ZmSlideEditController.ACTION_SAVE = "save";


ZmSlideEditController.prototype._initToolBar = function () {

    var tb = this._toolbar;

    this._fileName = new DwtInputField({parent:tb, size:20});


    var listener = new AjxListener(this, this._actionListener);

    this._saveSlide = new DwtToolBarButton({parent:tb});
    this._saveSlide.setToolTipContent(ZmMsg.save);
    this._saveSlide.setImage("Save");
    this._saveSlide.setText(ZmMsg.save);
    this._saveSlide.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_SAVE);
    this._saveSlide.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._insertSlide = new DwtToolBarButton({parent:tb});
    this._insertSlide.setToolTipContent(ZmMsg.slides_insertSlide);
    this._insertSlide.setImage("AddSlide");
    this._insertSlide.setText(ZmMsg.slides_insertSlide);
    this._insertSlide.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_NEW_SLIDE);
    this._insertSlide.addSelectionListener(listener);

    //new DwtControl({parent:tb, className:"vertSep"});

    this._deleteSlideButton = new DwtToolBarButton({parent:tb});
    this._deleteSlideButton.setToolTipContent(ZmMsg.slides_deleteSlide);
    this._deleteSlideButton.setImage("DeleteSlide");
    this._deleteSlideButton.setText(ZmMsg.slides_deleteSlide);
    this._deleteSlideButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_DELETE_SLIDE);
    this._deleteSlideButton.addSelectionListener(listener);

    //new DwtControl({parent:tb, className:"vertSep"});

    this._insertButton = new DwtToolBarButton({parent:tb});
    this._insertButton.setToolTipContent(ZmMsg.slides_insertTextBox);
    this._insertButton.setImage("AddTextBox");
    this._insertButton.setText(ZmMsg.slides_insertTextBox);
    this._insertButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_INSERT_TEXTBOX);
    this._insertButton.addSelectionListener(listener);

    //new DwtControl({parent:tb, className:"vertSep"});

    this._deleteButton = new DwtToolBarButton({parent:tb});
    this._deleteButton.setToolTipContent(ZmMsg.slides_deleteTextBox);
    this._deleteButton.setImage("DeleteTextBox");
    this._deleteButton.setText(ZmMsg.slides_deleteTextBox);
    this._deleteButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_DELETE_TEXTBOX);
    this._deleteButton.addSelectionListener(listener);

    //new DwtControl({parent:tb, className:"vertSep"});

    var button = this._insertImage1 = new DwtToolBarButton({parent:tb});
    button.setImage("AddImage");
    button.setToolTipContent(ZmMsg.insertImage);
    button.setText(ZmMsg.insertImage);    
    button.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_INSERT_IMG1);
    button.addSelectionListener(listener);

    var imgMenu = new ZmPopupMenu(button, null, null, this);
    var imgMenuListener = new AjxListener(this, this._imgListener);

    var imgMenuItems = [
        {name: ZmMsg.uploadNewFile, value: "upload"},
        {name: ZmMsg.insertLink, value: "link"}
    ];


    for (var i=0;  i< imgMenuItems.length; i++) {
        var mi = imgMenu.createMenuItem(imgMenuItems[i].name, {text:imgMenuItems[i].name});
        mi.addSelectionListener(imgMenuListener);
        mi.setData(ZmSlideEditController._VALUE, imgMenuItems[i].value);
    }
    button.setMenu(imgMenu);
    
    /*
    this._insertImage = new DwtToolBarButton({parent:tb});
    this._insertImage.setToolTipContent(ZmMsg.insertImage);
    this._insertImage.setImage("AddImage");
    this._insertImage.setText(ZmMsg.insertImage);
    this._insertImage.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_INSERT_IMG);
    this._insertImage.addSelectionListener(listener);
    */

    //new DwtControl({parent:tb, className:"vertSep"});

    this._themesButton = new DwtToolBarButton({parent:tb});
    this._themesButton.setToolTipContent(ZmMsg.slides_runSlideShow);
    //this._themesButton.setImage("RunSlides");
    this._themesButton.setText(ZmMsg.slides_themes);
    this._themesButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_THEMES);
    this._themesButton.addSelectionListener(listener);
    var menu = new ZmPopupMenu(this._themesButton, null, null, this);
    var themeListener = new AjxListener(this, this._themeListener);

    var graphMenuItems = [
        {name: ZmMsg.slides_themeDefault, value: "default"},
        {name: ZmMsg.slides_themeDarkBlue, value: "darkblue"},
        {name: ZmMsg.slides_themeBlue, value: "blue"},
        {name: ZmMsg.slides_themeGreen, value: "green"},
        {name: ZmMsg.slides_themePurple, value: "purple"},
        {name: ZmMsg.slides_themeBlueBand, value: "blueband"}
    ];


    for (var i=0;  i< graphMenuItems.length; i++) {
        var mi = menu.createMenuItem(graphMenuItems[i].name, {text:graphMenuItems[i].name});
        mi.addSelectionListener(themeListener);
        mi.setData(ZmSlideEditController._VALUE, graphMenuItems[i].value);
    }
    this._themesButton.setMenu(menu);

    
    //new DwtControl({parent:tb, className:"vertSep"});

    this._runSlideShow = new DwtToolBarButton({parent:tb});
    this._runSlideShow.setToolTipContent(ZmMsg.slides_runSlideShow);
    this._runSlideShow.setImage("RunSlides");
    this._runSlideShow.setText(ZmMsg.slides_runSlideShow);
    this._runSlideShow.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_RUN);
    this._runSlideShow.addSelectionListener(listener);

    tb.setVisible(true);
}

ZmSlideEditController.prototype._actionListener =
function(ev) {
	var action = ev.item.getData(ZmSlideEditController._VALUE);

	if(action == ZmSlideEditController.ACTION_INSERT_TEXTBOX) {
		this._currentView.insertTextBox();
	}
	else if(action == ZmSlideEditController.ACTION_DELETE_TEXTBOX) {
		this._currentView.deleteTextBox();
	}
	else if(action == ZmSlideEditController.ACTION_NEW_SLIDE) {
		this._currentView.createSlide();
	}
	else if(action == ZmSlideEditController.ACTION_DELETE_SLIDE) {
		this._currentView.deleteSlide();
	}
	else if(action == ZmSlideEditController.ACTION_RUN) {
		this._currentView.runSlideShow();
	}
	else if(action == ZmSlideEditController.ACTION_SAVE) {
		this._currentView.saveFile();
	}
	else if(action == ZmSlideEditController.ACTION_INSERT_IMG) {
		this._currentView.insertImage();
	}
	else if(action == ZmSlideEditController.ACTION_INSERT_IMG1) {
		if (!this._insertObjectsCallback) {
			this._insertObjectsCallback = new AjxCallback(this, this._insertObjects);
		}
		this.__popupUploadDialog(this._insertObjectsCallback);
	}
};

ZmSlideEditController.prototype.getRestUrl =
function() {
    var url = "";
    if(window.restPage) {
        url = location.href;
        url = url.split("/");
        url.pop();
        url = url.join("/");
    }else {
        var wAppCtxt = window.opener.appCtxt;
        var folder = wAppCtxt.getById(window.fileInfo.folderId);
        url = folder.getRestUrl();
    }
    return url;
};

ZmSlideEditController.prototype.__popupUploadDialog =
function(callback) {
    //AjxDispatcher.require(["NotebookCore", "Notebook"]);
    var restUrl = this.getRestUrl();
    var uploadFolder = {
        id: window.fileInfo.folderId,
        restUrl: restUrl
    };
	var dialog = appCtxt.getUploadDialog();
    dialog.addPopdownListener(new AjxListener(this, this.focus));
	dialog.popup(uploadFolder, callback, ZmMsg.insertAttachment);
};

ZmSlideEditController.prototype._insertObjects =
function(folder, filenames) {
	//func.call(this, filenames);
    this._currentView.insertFile(filenames);    
};

ZmSlideEditController.prototype._imgListener =
function(ev) {
    var value = ev.item.getData(ZmSlideEditController._VALUE);

    if(value == "upload") {
        if (!this._insertObjectsCallback) {
            this._insertObjectsCallback = new AjxCallback(this, this._insertObjects);
        }
        this.__popupUploadDialog(this._insertObjectsCallback);
    }else {
        this._currentView.insertImage();
    }
};


ZmSlideEditController.prototype._themeListener =
function(ev) {
    var themeName = ev.item.getData(ZmSlideEditController._VALUE);
    this._currentView.setTheme(themeName);
};


ZmSlideEditController.prototype.getKeyMapName =
function() {
	return "Global";
};

ZmSlideEditController.prototype.setStatusMsg =
function(){
    if(!this.statusView){
        this.statusView = new ZmStatusView(appCtxt.getShell(), "ZmStatus", Dwt.ABSOLUTE_STYLE, ZmId.STATUS_VIEW);
    }
    params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
    params.transitions = ZmToast.DEFAULT_TRANSITIONS;
	this.statusView.setStatusMsg(params);
};

ZmSlideEditController.prototype.getFileName =
function() {
    return this._fileName ? this._fileName.getValue() : null;
};

ZmSlideEditController.prototype.setFileName =
function(fileName) {
    if(this._fileName) {
        this._fileName.setValue(fileName);
    }
};

ZmSlideEditController.prototype.sendRequest =
function(params) {
    params.noSession = true;
    this._requestMgr.sendRequest(params);
};

ZmSlideEditController.prototype._kickPolling =
function(resetBackoff) {

};

ZmSlideEditController.prototype.exit = function(){
    return this._currentView.checkForChanges();
};

window.onbeforeunload = function() {
    return appCtxt.getAppController().exit();
};