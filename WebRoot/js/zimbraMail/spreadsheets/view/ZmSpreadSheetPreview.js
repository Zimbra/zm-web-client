ZmSpreadSheetPreview = function(container, params){

    this._container = document.getElementById(container);

    params = params || {};
    if(params.versionCont)
        params.versionCont = document.getElementById(params.versionCont);
    this._params = params;
    
    this.init();

};

ZmSpreadSheetPreview.prototype.constructor = ZmSpreadSheetPreview;

ZmSpreadSheetPreview.launch =
function(container, params){
    return ( new ZmSpreadSheetPreview(container, params) );
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
    var version = this._params.version;
    var urlParams = version ? ("?ver="+version) : "";
    serverUrl = serverUrl +  urlParams;
    AjxRpc.invoke(urlParams, serverUrl, null, new AjxCallback(this, this._handleFetchContent, callback), true);
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

    if(this._params.versionCont){
        this._params.versionCont.innerHTML = this._params.version;
    }
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


