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

ZmSlideEditController = function() {

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
ZmSlideEditController.ACTION_INSERT_GRPH = "insertgrph";
ZmSlideEditController.ACTION_NEW_SLIDE = "newslide";
ZmSlideEditController.ACTION_DELETE_SLIDE = "deleteslide";
ZmSlideEditController.ACTION_RUN = "run";
ZmSlideEditController.ACTION_SAVE = "save";


ZmSlideEditController.prototype._initToolBar = function () {

    var tb = this._toolbar;

    var listener = new AjxListener(this, this._actionListener);

    this._saveSlide = new DwtToolBarButton({parent:tb});
    this._saveSlide.setToolTipContent(ZmMsg.save);
    //this._insertSlide.setImage("Page");
    this._saveSlide.setText(ZmMsg.save);
    this._saveSlide.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_SAVE);
    this._saveSlide.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._insertSlide = new DwtToolBarButton({parent:tb});
    this._insertSlide.setToolTipContent(ZmMsg.slides_insertSlide);
    //this._insertSlide.setImage("Page");
    this._insertSlide.setText(ZmMsg.slides_insertSlide);
    this._insertSlide.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_NEW_SLIDE);
    this._insertSlide.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._deleteSlideButton = new DwtToolBarButton({parent:tb});
    this._deleteSlideButton.setToolTipContent(ZmMsg.slides_deleteSlide);
    //this._deleteSlideButton.setImage("Delete");
    this._deleteSlideButton.setText(ZmMsg.slides_deleteSlide);
    this._deleteSlideButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_DELETE_SLIDE);
    this._deleteSlideButton.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._insertButton = new DwtToolBarButton({parent:tb});
    this._insertButton.setToolTipContent(ZmMsg.slides_insertTextBox);
    //this._insertButton.setImage("Page");
    this._insertButton.setText(ZmMsg.slides_insertTextBox);
    this._insertButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_INSERT_TEXTBOX);
    this._insertButton.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._deleteButton = new DwtToolBarButton({parent:tb});
    this._deleteButton.setToolTipContent(ZmMsg.slides_deleteTextBox);
    //this._deleteButton.setImage("Delete");
    this._deleteButton.setText(ZmMsg.slides_deleteTextBox);
    this._deleteButton.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_DELETE_TEXTBOX);
    this._deleteButton.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._insertImage = new DwtToolBarButton({parent:tb});
    this._insertImage.setToolTipContent(ZmMsg.insertImage);
    //this._insertButton.setImage("Page");
    this._insertImage.setText(ZmMsg.insertImage);
    this._insertImage.setData(ZmSlideEditController._VALUE, ZmSlideEditController.ACTION_INSERT_IMG);
    this._insertImage.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    this._insertChart = new DwtToolBarButton({parent:tb});
    this._insertChart.dontStealFocus();
    this._insertChart.setSize(Dwt.DEFAULT);
    this._insertChart.setAlign(DwtLabel.ALIGN_LEFT);
    this._insertChart.setText(ZmMsg.slide_insertChart);
    var menu = new ZmPopupMenu(this._insertChart);
    var chartListener = new AjxListener(this, this._insertChartListener);

    var graphMenuItems = [
        {name: ZmMsg.slide_insertColumnChart, value: "Column2D"},
        {name: ZmMsg.slide_insertPieChart, value: "Pie2D"},
        {name: ZmMsg.slide_insertFunnelChart, value: "Funnel"},
        {name: ZmMsg.slide_insertDoughnutChart, value: "Doughnut2D"},
        {name: ZmMsg.slide_insertAreaChart, value: "Area2D"}
    ];


    for (var i=0;  i< graphMenuItems.length; i++) {
        var mi = menu.createMenuItem(graphMenuItems[i].name, {text:graphMenuItems[i].name});
        mi.addSelectionListener(chartListener);
        mi.setData(ZmSlideEditController._VALUE, graphMenuItems[i].value);
    }

    this._insertChart.setMenu(menu);

    new DwtControl({parent:tb, className:"vertSep"});

    this._runSlideShow = new DwtToolBarButton({parent:tb});
    this._runSlideShow.setToolTipContent(ZmMsg.slides_runSlideShow);
    //this._runSlideShow.setImage("");
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
};


ZmSlideEditController.prototype._insertChartListener =
function(ev) {
    var chartName = ev.item.getData(ZmSlideEditController._VALUE);
    var chartURL = "/public/slides/FusionCharts/Charts/FCF_" + chartName + ".swf";
    var dataURL = "/public/slides/FusionCharts/Data/" + chartName + ".xml";
    this._currentView.insertGraph(chartURL, dataURL);
};



