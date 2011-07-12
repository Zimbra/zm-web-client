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

/**
 * Creates the attachments controller.
 * @class
 * This class represents an attachments controller.
 * 
 * @param	{ZmComposite}	container		the container
 * @param	{ZmMailApp}		app				the application
 * 
 * @extends		ZmController
 * 
 */
ZmAttachmentsController = function(container, app) {

    if (arguments.length == 0) { return; }

    ZmController.call(this, container, app);

    this._trees = {};

    this._listeners = {};

};

ZmAttachmentsController.prototype = new ZmController();
ZmAttachmentsController.prototype.constructor = ZmAttachmentsController;

// Main Categories

ZmAttachmentsController.CATEGORY_BYTYPE = "BY_TYPE";
ZmAttachmentsController.CATEGORY_BYTIME = "BY_TIME";
ZmAttachmentsController.CATEGORY_BYTAG = "BY_SENDER";
ZmAttachmentsController.CATEGORY_BYSENDER = "BY_TAG";
ZmAttachmentsController.CATEGORY_BYFOLDER = "BY_FOLDER";

ZmAttachmentsController.CATEGORIES = [];

ZmAttachmentsController.CATEGORIES.push(ZmAttachmentsController.CATEGORY_BYTYPE);
ZmAttachmentsController.CATEGORIES.push(ZmAttachmentsController.CATEGORY_BYTIME);
ZmAttachmentsController.CATEGORIES.push(ZmAttachmentsController.CATEGORY_BYTAG);
ZmAttachmentsController.CATEGORIES.push(ZmAttachmentsController.CATEGORY_BYSENDER);
ZmAttachmentsController.CATEGORIES.push(ZmAttachmentsController.CATEGORY_BYFOLDER);



ZmAttachmentsController.CATEGORY_MSGKEY = {};
ZmAttachmentsController.CATEGORY_MSGKEY[ZmAttachmentsController.CATEGORY_BYTYPE]   = "byType";
ZmAttachmentsController.CATEGORY_MSGKEY[ZmAttachmentsController.CATEGORY_BYTIME]   = "byTime";
ZmAttachmentsController.CATEGORY_MSGKEY[ZmAttachmentsController.CATEGORY_BYTAG]    = "byTag";
ZmAttachmentsController.CATEGORY_MSGKEY[ZmAttachmentsController.CATEGORY_BYSENDER] = "bySender";
ZmAttachmentsController.CATEGORY_MSGKEY[ZmAttachmentsController.CATEGORY_BYFOLDER] = "byFolder";

ZmAttachmentsController.CATEGORY_ICON = {};
ZmAttachmentsController.CATEGORY_ICON[ZmAttachmentsController.CATEGORY_BYTYPE]   = "NodeCollapsed";
ZmAttachmentsController.CATEGORY_ICON[ZmAttachmentsController.CATEGORY_BYTIME]   = "NodeCollapsed";
ZmAttachmentsController.CATEGORY_ICON[ZmAttachmentsController.CATEGORY_BYTAG]    = "NodeCollapsed";
ZmAttachmentsController.CATEGORY_ICON[ZmAttachmentsController.CATEGORY_BYSENDER] = "NodeCollapsed";
ZmAttachmentsController.CATEGORY_ICON[ZmAttachmentsController.CATEGORY_BYFOLDER] = "NodeCollapsed";

//Query Commands

ZmAttachmentsController.ATTACH_QUERY_CMD = "attachment:";
ZmAttachmentsController.AFTER_QUERY_CMD  = "after:";
ZmAttachmentsController.BEFORE_QUERY_CMD = "before:";
ZmAttachmentsController.FROM_QUERY_CMD   = "from:";
ZmAttachmentsController.TAG_QUERY_CMD    = "tag:";
ZmAttachmentsController.FOLDER_QUERY_CMD = "in:";

ZmAttachmentsController.DEFAULT_QUERY = ZmAttachmentsController.ATTACH_QUERY_CMD + "any";

//Sub Categories

ZmAttachmentsController.SUBCATEGORY_BYTYPE_ALL              = "BY_TYPE_ALL";
ZmAttachmentsController.SUBCATEGORY_BYTYPE_IMAGE            = "BY_TYPE_IMAGE";
ZmAttachmentsController.SUBCATEGORY_BYTYPE_DOCS             = "BY_TYPE_DOCS";
ZmAttachmentsController.SUBCATEGORY_BYTYPE_PRESENTATIONS    = "BY_TYPE_PPT";
ZmAttachmentsController.SUBCATEGORY_BYTYPE_SPREADSHEETS     = "BY_TYPE_SHEET";
ZmAttachmentsController.SUBCATEGORY_BYTYPE_MEDIA            = "BY_TYPE_MEDIA";


ZmAttachmentsController.CATEGORY_ITEMS = {};
ZmAttachmentsController.CATEGORY_ITEMS[ZmAttachmentsController.CATEGORY_BYTYPE] = [
    {
        id     : ZmAttachmentsController.SUBCATEGORY_BYTYPE_ALL,
        msgKey : "all",
        image  : "Attachment",
        ct     : ["any"],
        cmd    : ZmAttachmentsController.ATTACH_QUERY_CMD
    },
    {
        id     : ZmAttachmentsController.SUBCATEGORY_BYTYPE_IMAGE,
        msgKey : "images",
        image  : "ImageDoc",
        ct     : ["image"],
        cmd    : ZmAttachmentsController.ATTACH_QUERY_CMD
    },
    {
        id     : ZmAttachmentsController.SUBCATEGORY_BYTYPE_DOCS,
        msgKey : "documents",
        image  : "MSWordDoc",
        ct     : ["text/plain", "application/msword", "application/pdf"],
        cmd    : ZmAttachmentsController.ATTACH_QUERY_CMD
    },
    {
        id     : ZmAttachmentsController.SUBCATEGORY_BYTYPE_PRESENTATIONS,
        msgKey : "presentations",
        image  : "MSPowerpointDoc",
        ct     : ["application/vnd.ms-powerpoint"],
        cmd    : ZmAttachmentsController.ATTACH_QUERY_CMD
    },
    {
        id     : ZmAttachmentsController.SUBCATEGORY_BYTYPE_SPREADSHEETS,
        msgKey : "sheet",
        image  : "MSExcelDoc",
        ct     : ["application/vnd.ms-excel"],
        cmd    : ZmAttachmentsController.ATTACH_QUERY_CMD
    },
    {
        id     : ZmAttachmentsController.SUBCATEGORY_BYTYPE_MEDIA,
        msgKey : "audioVideo",
        image  : "AudioDoc",
        ct     : ["audio", "audio/x-wav", "audio/mpeg", "video", "video/x-ms-wmv"],
        cmd    : ZmAttachmentsController.ATTACH_QUERY_CMD
    }
];

ZmAttachmentsController.SUBCATEORY_BYTIME_TODAY         = "BY_TIME_TODAY";
ZmAttachmentsController.SUBCATEORY_BYTIME_WEEK          = "BY_TIME_WEEK";
ZmAttachmentsController.SUBCATEORY_BYTIME_MONTH         = "BY_TIME_MONTH";
ZmAttachmentsController.SUBCATEORY_BYTIME_YEAR          = "BY_TIME_YEAR";

ZmAttachmentsController.CATEGORY_ITEMS[ZmAttachmentsController.CATEGORY_BYTIME] = [
    {
        id      :   ZmAttachmentsController.SUBCATEORY_BYTIME_TODAY,
        msgKey  :   "today",
        image    :  "DayView",
        cmd     :   ZmAttachmentsController.AFTER_QUERY_CMD
    },
    {
        id      :   ZmAttachmentsController.SUBCATEORY_BYTIME_WEEK,
        msgKey  :   "lastWeek",
        image    :   "WeekView",
        cmd     :   ZmAttachmentsController.AFTER_QUERY_CMD
    },
    {
        id      :   ZmAttachmentsController.SUBCATEORY_BYTIME_MONTH,
        msgKey  :   "lastMonth",
        image    :   "MonthView",
        cmd     :   ZmAttachmentsController.AFTER_QUERY_CMD
    },
    {
        id      :   ZmAttachmentsController.SUBCATEORY_BYTIME_YEAR,
        msgKey  :   "lastYear",
        image    :   "CalendarApp",
        cmd     :   ZmAttachmentsController.AFTER_QUERY_CMD
    },
    {
        id      :   ZmAttachmentsController.SUBCATEORY_BYTIME_ANYTIME,
        msgKey  :   "anyTime",
        image    :   "Date"
    }
];

ZmAttachmentsController.prototype._initToolBar =
function(){

    if (this._toolbar) return;

    this._listeners[ZmOperation.RESET] = new AjxListener(this, this._reset);
    this._listeners[ZmOperation.CANCEL] = new AjxListener(this, this._cancel);
    //this._listeners[ZmOperation.SEND] = new AjxListener(this, this._sendMail);

    var buttons = [ZmOperation.RESET, /*ZmOperation.SEND,*/ ZmOperation.CANCEL];


	var className = appCtxt.isChildWindow ? "ZmAppToolBar_cw" : "ZmAppToolBar";
	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons, className:className+" ImgSkin_Toolbar",
										 context:ZmId.VIEW_ATTACHMENTS});

	for (var i = 0; i < this._toolbar.opList.length; i++) {
		var button = this._toolbar.opList[i];
		if (this._listeners[button]) {
			this._toolbar.addSelectionListener(button, this._listeners[button]);
		}
	}	
};

ZmAttachmentsController.prototype._reset = function(ev){
     this._attachmentsView._resetFilterTrees();
     this.search({query:this._getQuery()});
};

ZmAttachmentsController.prototype._cancel = function(){
    this._app.popView();
};

ZmAttachmentsController.prototype.initAttachmentsView = function(){

    if (this._attachmentsView) return;

    this._attachmentsView =  new ZmAttachmentsView(this._container, this);
	this._initToolBar();

    var elements = {};
    elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar;
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._attachmentsView;

    this._app.createView({viewId:ZmId.VIEW_ATTACHMENTS, elements:elements, isTransient:true});

};

ZmAttachmentsController.prototype.show = function(){

    this.initAttachmentsView();

    this._app.pushView(ZmId.VIEW_ATTACHMENTS);

    this._reset();
    
};

ZmAttachmentsController.prototype.search = function(params){

    params.query  = params.query || ZmAttachmentsController.DEFAULT_QUERY;
    params.offset = 0;
    params.limit  = 50;
    params.sortBy = ZmSearch.DATE_DESC;
    params.fetch  = "all";
    params.searchFor = ZmItem.MSG;

    var types = new AjxVector();
    types.add(ZmItem.MSG);
    params.types  = types;

    params.noBusyOverlay = true;
    params.noRender = true;
    params.callback = new AjxCallback(this, this._handleSearchResponse);

    var sc = appCtxt.getSearchController();
    sc.search(params);

};

ZmAttachmentsController.prototype._handleSearchResponse = function(results){

    results = results.getResponse().getResults(ZmItem.MSG);

    this._attachmentsView.set(results);

};

ZmAttachmentsController.prototype._filterTreeListener = function(ev){

    if(ev.detail == DwtTree.ITEM_SELECTED){
        this.search({query:this._getQuery()});
    }
};


ZmAttachmentsController.prototype._getQuery = function(){

    var query = "";

    var queryString = "";

    var byTypeItem = this._attachmentsView.getSelectedItem(ZmAttachmentsController.CATEGORY_BYTYPE);
    if(byTypeItem){

        var subQuery = [];
        var ct = byTypeItem.ct;
        if(byTypeItem.id == ZmAttachmentsController.SUBCATEGORY_BYTYPE_ALL){
            subQuery.push("any");
        }else{
            for(var i=0; i<ct.length; i++){
                subQuery.push('"'+ct[i]+'"');
            }
        }        
        subQuery = subQuery.join(" OR ");

        query += byTypeItem.cmd + "("+ subQuery+")";

        queryString += '<strong>' + ZmMsg[byTypeItem.msgKey] + '</strong> attachments <br>';

    }else{
        queryString += '<strong>' + ZmMsg['all'] + '</strong> attachments <br>';
    }

    var byFolderItem = this._attachmentsView.getSelection(ZmAttachmentsController.CATEGORY_BYFOLDER);
    if(byFolderItem){
         var folder = byFolderItem.getData(Dwt.KEY_OBJECT);
         query += ' ' + folder.createQuery();

         queryString += 'in <strong>' + folder.getName() + '</strong>'+' folder<br>';
    }

    var byTagItem = this._attachmentsView.getSelection(ZmAttachmentsController.CATEGORY_BYTAG);
    if(byTagItem){
        var tag = byTagItem.getData(Dwt.KEY_OBJECT);
        query += ' ' + ZmAttachmentsController.TAG_QUERY_CMD + '"' + tag.name + '"';

        queryString += 'with tag <strong>' + tag.getName() + '</strong><br>';
    }

    var byTimeItem = this._attachmentsView.getSelectedItem(ZmAttachmentsController.CATEGORY_BYTIME);
    if(byTimeItem){

        var date = new Date();
        var offset = -1;
        if(byTimeItem.id == ZmAttachmentsController.SUBCATEORY_BYTIME_TODAY){
            date.setDate(date.getDate() + offset);
        }else if(byTimeItem.id == ZmAttachmentsController.SUBCATEORY_BYTIME_WEEK){
            date.setDate(date.getDate()+7*offset);
        }else if(byTimeItem.id == ZmAttachmentsController.SUBCATEORY_BYTIME_MONTH){
            d = date.getDate();
            date.setDate(1);
            date.setMonth(date.getMonth() + offset);
            var max = AjxDateUtil.daysInMonth(date.getFullYear(), date.getMonth());
		    date.setDate(Math.min(d, max));
        }else if(byTimeItem.id == ZmAttachmentsController.SUBCATEORY_BYTIME_YEAR){
            d = date.getDate();
            date.setDate(1);
            date.setFullYear(date.getFullYear() + offset);
		    var max = AjxDateUtil.daysInMonth(date.getFullYear(), date.getMonth());
		    date.setDate(Math.min(d, max));
        }

        var formatter = AjxDateFormat.getDateInstance(AjxDateFormat.SHORT);
        var afterDate = formatter.format(date);

        if(byTimeItem.cmd) {
            query += ' ' + byTimeItem.cmd + '"' +  afterDate  +'"';
        }

        queryString += 'during <strong>' + ZmMsg[byTimeItem.msgKey] + '</strong><br>';

    }

    //if(queryString == "") queryString = '<strong>' + ZmMsg['all'] + '</strong> attachments<br>';

    this._attachmentsView.setQueryString(queryString);

    return (query != "") ? query : ZmAttachmentsController.DEFAULT_QUERY;
};

ZmAttachmentsController.prototype._sendMail = function(ev){
  //Need Implmentation
};

