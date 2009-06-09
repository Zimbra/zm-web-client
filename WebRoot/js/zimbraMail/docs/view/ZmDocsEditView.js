/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmDocsEditView = function(parent, className, posStyle, controller) {
    className = className || "ZmDocsEditView";
    DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle});

    this._createHTML();
    this._docMgr = new ZmDocletMgr();
    this._controller = controller;    
};

ZmDocsEditView.prototype = new DwtComposite;
ZmDocsEditView.prototype.construction = ZmDocsEditView;

ZmDocsEditView.APP_ZIMBRA_DOC = "application/x-zimbra-doc";

ZmDocsEditView.prototype.saveFile =
function() {
    var content = [];
    var idx = 0;
    window.fileInfo.content = this._editor.getEditorHTML();
    window.fileInfo.name = this._controller.getFileName();
    window.fileInfo.contentType = ZmDocsEditView.APP_ZIMBRA_DOC;
    this._docMgr.setSaveCallback(new AjxCallback(this, this._saveHandler));
    this._docMgr.saveDocument(window.fileInfo);

};

ZmDocsEditView.prototype._saveHandler =
function(files, conflicts) {
 if(conflicts){
        var formatter = new AjxMessageFormat(ZmMsg.saveConflictDoc);
        appCtxt.setStatusMsg(formatter.format(files[0].name), ZmStatusView.LEVEL_WARNING);
    }else {
        if(files && files.length > 0) {
            window.fileInfo.id = files[0].id;
            window.fileInfo.version = files[0].ver;
            appCtxt.setStatusMsg(ZmMsg.savedDoc, ZmStatusView.LEVEL_INFO);
        }
    }
};

ZmDocsEditView.prototype.loadData =
function(id) {
    return this._docMgr.getItemInfo({id:id});
};

ZmDocsEditView.prototype.loadDoc =
function(item) {
    var content = this._docMgr.fetchDocumentContent(item);
    this._controller.setFileName(item.name ? item.name : "Untitled");
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

    this.initExtraToolbarOptions(myEditor);

    myEditor.render();    
};

ZmDocsEditView.prototype._createHTML =
function() {
    var el = this.getHtmlElement();
    this._textAreaId = Dwt.getNextId();
    
    el.innerHTML =  '<textarea name="'+ this._textAreaId + '" id="' + this._textAreaId + '" rows="20" cols="80"></textarea>';

};

ZmDocsEditView.prototype.initExtraToolbarOptions =
function(myEditor) {
    myEditor.on('toolbarLoaded', function() {
        YAHOO.log('Toolbar loaded, add button and create gutter', 'info', 'example');
        //gutter = new YAHOO.gutter();

        var flickrConfig = {
            type: 'push',
            label: 'Insert Flickr Image',
            value: 'flickr'
        }

        myEditor.toolbar.addButtonToGroup(flickrConfig, 'insertitem');

        myEditor.toolbar.on('flickrClick', function(ev) {
            YAHOO.log('flickrClick: ' + YAHOO.lang.dump(ev), 'info', 'example');
            this._focusWindow();
            if (ev && ev.img) {
                YAHOO.log('We have an image, insert it', 'info', 'example');
                //To abide by the Flickr TOS, we need to link back to the image that we just inserted
                var html = '<a href="' + ev.url + '"><img src="' + ev.img + '" title="' + ev.title + '"></a>';
                this.execCommand('inserthtml', html);
            }
            //gutter.toggle();
        }, myEditor, true);

        //gutter.createGutter();
    });
};