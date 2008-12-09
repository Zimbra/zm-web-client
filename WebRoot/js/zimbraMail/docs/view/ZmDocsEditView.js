ZmDocsEditView = function(parent, className, posStyle, deferred) {
    className = className || "ZmDocsEditView";
    DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle, deferred:deferred});

    this._createHTML();
    this._docMgr = new ZmDocletMgr();
};

ZmDocsEditView.prototype = new DwtComposite;
ZmDocsEditView.prototype.construction = ZmDocsEditView;

ZmDocsEditView.APP_ZIMBRA_DOC = "application/x-zimbra-doc";

ZmDocsEditView.prototype.saveFile =
function() {
    var content = [];
    var idx = 0;
        window.fileInfo.content = this._editor.getEditorHTML();
        window.fileInfo.contentType = ZmDocsEditView.APP_ZIMBRA_DOC;
        this._docMgr.setSaveCallback(new AjxCallback(this, this._saveHandler));
        this._docMgr.saveDocument(window.fileInfo);

};

ZmDocsEditView.prototype._saveHandler =
function(files) {
    if(files && files.length > 0) {
        window.fileInfo.id = files[0].id;
        window.fileInfo.version = files[0].ver;
    }

};

ZmDocsEditView.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmDocsEditView.prototype.loadDoc =
function(item) {
    var content = this._docMgr.fetchDocumentContent(item);
    if(this._editor) {
        this._editor.setEditorHTML(content ? content : "<br/>");
    }
};

ZmDocsEditView.prototype.renderEditor =
function(content) {
    var id = this._textAreaId;
    var editorHeight = this.getSize().y;
    var myEditor = this._editor = new YAHOO.widget.Editor(id, {
        height: editorHeight,
        width: '100%',
        dompath: false, //Turns on the bar at the bottom
        animate: true, //Animates the opening, closing and moving of Editor windows
        focusAtStart: true,
        css: 'html {height: 95%;}body {height: 100%;padding: 7px; background-color: #fff; color:#000; font-size:12px; font-family: helvetica,clean,sans-serif;}a {color: blue;text-decoration: underline;cursor: pointer;}.warning-localfile {border-bottom: 1px dashed red !important;}.yui-busy {cursor: wait !important;}img.selected { border: 2px dotted #808080;}img {cursor: pointer !important;border: none;}',
        extracss: '.yui-spellcheck { background-color: yellow; }',
        collapse: false,
        draggable: false,
        buttonType: 'advanced'
    });

    myEditor.on('editorContentLoaded', function() {
        var html = document.getElementById(id).innerHTML;;
        if(html==""){
            myEditor.setEditorHTML("<br/>");
        }
    }, myEditor, true);

    myEditor.render();    
};

ZmDocsEditView.prototype._createHTML =
function() {
    var el = this.getHtmlElement();
    this._textAreaId = Dwt.getNextId();
    el.innerHTML =  '<textarea name="'+ this._textAreaId + '" id="' + this._textAreaId + '" rows="20" cols="80"></textarea>';

};