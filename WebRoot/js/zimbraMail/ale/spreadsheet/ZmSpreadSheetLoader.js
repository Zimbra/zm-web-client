ZmSpreadSheetLoader = 	function() {

};

var shell = null;
var spreadSheet = null;
var model = null;
var controller = null;

create = function(data) {

    //DBG = new AjxDebug(AjxDebug.NONE, null, false);
    
    window.appCtxt = new ZmAppCtxt();
    appCtxt.rememberMe = false;

    // Create and initialize settings
    var settings = new ZmSettings();
    appCtxt.setSettings(settings);

    shell = new DwtShell({className:"MainShell"});
    appCtxt.setShell(shell);
    shell.getKeyboardMgr().registerKeyMap(new DwtKeyMap(true));
    spreadSheet = new ZmSpreadSheetView(shell, null, "absolute");
    if (data != null) {
        model = new ZmSpreadSheetModel(0, 0);
        model.deserialize(data);
    } else {
        model = new ZmSpreadSheetModel(38, 13);
    }
    spreadSheet.setModel(model);

    controller = new  ZmSpreadSheetEditController();

    new ZmSpreadSheetToolbars(spreadSheet, spreadSheet);
    spreadSheet.setZIndex(Dwt.Z_VIEW);
    window.onresize = _resize;
    _resize();
    spreadSheet._selectedCell = null;
    spreadSheet.focus();

    var sheetToolbar = new DwtToolBar({parent:spreadSheet, cellSpacing:2, index:0, posStyle:DwtControl.RELATIVE_STYLE,className: 'docsToolbar'});
    var nparent = spreadSheet.getHtmlElement();
    nparent.insertBefore(sheetToolbar.getHtmlElement(), nparent.firstChild);
    controller.setCurrentView(spreadSheet);
    controller.setToolBar(sheetToolbar);
    

    if(window.fileInfo && window.fileInfo.id) {
        var item = spreadSheet.loadData(window.fileInfo.id);
        if(item != null) {
            window.fileInfo = item;
            spreadSheet.loadSheet(item);
        }
    }
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



ZmSpreadSheetView = function(parent, className, posStyle, deferred) {
    ZmSpreadSheet.call(this, parent, className, posStyle, deferred);

    this._docMgr = new ZmDocletMgr();
};

ZmSpreadSheetView.prototype = new ZmSpreadSheet;
ZmSpreadSheetView.prototype.construction = ZmSpreadSheetView;

ZmSpreadSheetView.APP_ZIMBRA_XLS = "application/x-zimbra-xls";

ZmSpreadSheetView.prototype.saveFile =
function() {
    var content = [];
    var idx = 0;
    if(model != null) {
        window.fileInfo.content = model.getXml().getDocXml();
        window.fileInfo.contentType = ZmSpreadSheetView.APP_ZIMBRA_XLS;
        this._docMgr.setSaveCallback(new AjxCallback(this, this._saveHandler));
        this._docMgr.saveDocument(window.fileInfo);
    }
};

ZmSpreadSheetView.prototype._saveHandler =
function(files) {
    if(files && files.length > 0) {
        window.fileInfo.id = files[0].id;
        window.fileInfo.version = files[0].ver;
    }

};

ZmSpreadSheetView.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmSpreadSheetView.prototype.loadSheet =
function(item) {
    var content = this._docMgr.fetchDocumentContent(item);
    if(content && model) {
        model = new ZmSpreadSheetModel(0, 0);
        model.loadFromXml(content);
        spreadSheet.setModel(model);
    }
};

// Useful for testing the spreadsheet outside the ACE framework
if(!window.restView) {
    window.onload = function() {
        setTimeout(function() {
            if (!window.ZmACE)
                create();
        }, 200);
    };
}