ZmSpreadSheetPreview = function(container){

    this._container = document.getElementById(container);

    this.init();

};

ZmSpreadSheetPreview.prototype.constructor = ZmSpreadSheetPreview;

ZmSpreadSheetPreview.launch =
function(container){
    return ( new ZmSpreadSheetPreview(container) );
};

ZmSpreadSheetPreview.prototype.init =
function(){
    this.loadContent();    
};

ZmSpreadSheetPreview.prototype.loadContent =
function(){
    if(!this._content){
        this.fetchContent(new AjxCallback(this, this.loadContent));
        return;
    }

    var model = this._model = new ZmSpreadSheetModel(0, 0);
    model.loadFromXML(this._content);
    model.doneSetView();
    this.show();
};

ZmSpreadSheetPreview.prototype.fetchContent =
function(callback){

    var serverUrl = window.location.href;
    serverUrl = serverUrl.replace(/\?.*/,''); //Cleanup Params
    AjxRpc.invoke("fmt=html", serverUrl, null, new AjxCallback(this, this._handleFetchContent, callback), true ); 
};

ZmSpreadSheetPreview.prototype._handleFetchContent =
function(callback, response){
   this._content = response.text;
   if(callback)
        callback.run();    
};

ZmSpreadSheetPreview.prototype.show =
function(){
    var previewHTML = this._model.getHtml();
    this._container.innerHTML = previewHTML;
};

ZmSpreadSheetPreview._createDBG = function(devMode){

    var isDevMode = /^(1|true|on|yes)$/i.test(devMode);

    if(isDevMode){
        AjxDispatcher.require("Debug");
        window.DBG = new AjxDebug(AjxDebug.NONE, null, false);
    }else {
        window.AjxDebug = function() {};
        window.AjxDebug.prototype.toString		= function() { return "dummy DBG class"};
        window.AjxDebug.prototype.display		= function() {};
        window.AjxDebug.prototype.dumpObj		= function() {};
        window.AjxDebug.prototype.getDebugLevel	= function() {};
        window.AjxDebug.prototype.isDisabled	= function() {};
        window.AjxDebug.prototype.println		= function() {};
        window.AjxDebug.prototype.printRaw		= function() {};
        window.AjxDebug.prototype.printXML		= function() {};
        window.AjxDebug.prototype.setDebugLevel	= function() {};
        window.AjxDebug.prototype.setTitle		= function() {};
        window.AjxDebug.prototype.showTiming	= function() {};
        window.AjxDebug.prototype._getTimeStamp	= function() {};
        window.AjxDebug.prototype.timePt		= function() {};
        window.DBG = new window.AjxDebug();
    }
};


