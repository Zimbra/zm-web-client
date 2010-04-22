ZmSpreadSheetPreview = function(container, xml){

    this._container = document.getElementById(container);
    this._content = AjxStringUtil.xmlAttrDecode(xml);

    this.init();
    this.show();
};

ZmSpreadSheetPreview.prototype.constructor = ZmSpreadSheetPreview;

ZmSpreadSheetPreview.launch =
function(container, xml){
    return ( new ZmSpreadSheetPreview(container, xml) );
};

ZmSpreadSheetPreview.prototype.init =
function(){

    var model = this._model = new ZmSpreadSheetModel(0, 0);
    model.loadFromXML(this._content);
    model.doneSetView();
    
};

ZmSpreadSheetPreview.prototype.show =
function(){
    var previewHTML = this._model.getHtml();
    this._container.innerHTML = previewHTML;
};


