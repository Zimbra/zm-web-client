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

ZmDocsEditView = function(parent, className, posStyle, controller, deferred) {
    className = className || "ZmDocsEditView";
    DwtComposite.call(this, {parent:parent, className:className, posStyle:DwtControl.ABSOLUTE_STYLE});
    this._buttons = {};
    this._controller = controller;
    this._docMgr = new ZmDocletMgr();
    this._initialize();    
};

ZmDocsEditView.prototype = new DwtComposite;
ZmDocsEditView.prototype.construction = ZmDocsEditView;

ZmDocsEditView.ZD_VALUE = "ZD";
ZmDocsEditView.APP_ZIMBRA_DOC = "application/x-zimbra-doc";

ZmDocsEditView.prototype.getController =
function() {
	return this._controller;
};

ZmDocsEditView.prototype._focusPageInput =
function() {
	if (this.warngDlg) {
		this.warngDlg.popdown();
	}
	this._buttons.fileName.focus();
};

ZmDocsEditView.prototype.save = function(){

    var fileInfo = ZmDocsEditApp.fileInfo;
    var fileName = this._buttons.fileName.getValue();
    var message;

    if(!fileInfo.id){
        if (fileName == "") {
            message = ZmMsg.emptyDocName;
        } else {
            message = this._docMgr.checkInvalidDocName(fileName);
        }
    }

    if (message) {
		var style = DwtMessageDialog.WARNING_STYLE;
		var dialog = this.warngDlg = appCtxt.getMsgDialog();
		dialog.setMessage(message, style);
		dialog.popup();
	    dialog.registerCallback(DwtDialog.OK_BUTTON, this._focusPageInput, this);
		return false;
	}

    ZmDocsEditApp.fileInfo.name    = fileName;
    if(window.isTinyMCE) { //temp check
        var ed = tinyMCE.get('tiny_mce_content');
        ZmDocsEditApp.fileInfo.content = ed.getContent();
    } else {
        ZmDocsEditApp.fileInfo.content = this._editor.getContent();
    }
    ZmDocsEditController.savedDoc = ZmDocsEditApp.fileInfo.content; 
    ZmDocsEditApp.fileInfo.contentType = ZmDocsEditApp.APP_ZIMBRA_DOC;
    this._docMgr.setSaveCallback(new AjxCallback(this, this._saveHandler));
    this._docMgr.saveDocument(ZmDocsEditApp.fileInfo);

};

ZmDocsEditView.prototype._saveHandler =
function(files, conflicts) {
    if(conflicts){
        var formatter = new AjxMessageFormat(ZmMsg.saveConflictDoc);
        appCtxt.setStatusMsg(formatter.format(files[0].name), ZmStatusView.LEVEL_WARNING);
    } else {
        if (files && files.length > 0) {

            ZmDocsEditApp.fileInfo.id = files[0].id;
            ZmDocsEditApp.fileInfo.version = files[0].ver;

            var item = this.loadData(ZmDocsEditApp.fileInfo.id);
            if(!item.rest){    //TODO: Change this code to construct a rest url
                item.rest = ZmDocsEditApp.restUrl;
            }
            if(item != null) {
                ZmDocsEditApp.fileInfo = item;
                this.setFooterInfo(item);
            }
            var wAppCtxt = null;
            if(window.isRestView) {
                wAppCtxt = top.appCtxt;
            } else {
                wAppCtxt = window.opener.appCtxt;
            }
            appCtxt.setStatusMsg(ZmMsg.savedDoc, ZmStatusView.LEVEL_INFO);

            if(this._saveClose){
                window.close();
            }
        }
    }

};

ZmDocsEditView.prototype.setFooterInfo = function(item){

    if(!this._locationEl) return;

	var content;
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
    
	if (item.folderId == rootId) {
		content = appCtxt.getById(item.folderId).name;
	}else {
		var separator = "&nbsp;&raquo;&nbsp;";
		var a = [ ];
		var folderId = item.folderId;
		while ((folderId != null) && (folderId != rootId)) {
            var wAppCtxt = null;
            if(window.isRestView) {
               wAppCtxt = top.appCtxt;
            } else {
               wAppCtxt = window.opener.appCtxt;
            }
            var docs = wAppCtxt.getById(folderId);
            if(!docs) {
                break;
            }
            
            a.unshift(docs.name);

            if(!docs.parent) {
                break;
            }

            folderId = docs.parent.id;
			if (folderId != rootId) {
				a.unshift(separator);
			}

        }
		content = a.join("");
	}

	this._locationEl.innerHTML = content;
	this._versionEl.innerHTML = (item.version ? item.version : "");
	this._authorEl.innerHTML = (item.creator ? item.creator : "");
	this._modifiedEl.innerHTML = (item.createDate ? item.createDate : "");
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

ZmDocsEditView.prototype.setPendingContent =
function(content) {
	this._pendingContent = content;
};

ZmDocsEditView.prototype.getPendingContent =
function() {
	return this._pendingContent;
};

ZmDocsEditView.prototype.onLoadContent =
function(ed) {
	var pendingContent = this.getPendingContent();
	if (pendingContent != null) {
		ed.setContent(pendingContent, {format: "raw"});
		this.setPendingContent(null);
	}
};

ZmDocsEditView.prototype._initialize = function() {

    var toolbar = this._toolbar = new DwtToolBar({parent:this, className:"ZDToolBar", cellSpacing:2, posStyle:DwtControl.RELATIVE_STYLE});
    this._createToolbar(toolbar);

    /* commented for bug:40022
    var toolbar2 = this._toolbar2 = new DwtToolBar({parent:this, className:"ZDUtilToolBar",cellSpacing:0,posStyle:DwtControl.RELATIVE_STYLE});
    toolbar2.getHtmlElement().setAttribute("align","center");
    this._createToolbar2(toolbar2);
    */
    var obj = this;
    
    function handleContentLoad(ed) {
		obj.onLoadContent(ed);
	};
    
    var iFrame = this._iframe = document.createElement("iframe");
    iFrame.id = Dwt.getNextId();
    iFrame.className = "ZDEditor";
    iFrame.setAttribute("border", "0", false);
    iFrame.setAttribute("frameborder", "0", false);
    iFrame.setAttribute("vspace", "0", false);
    iFrame.setAttribute("autocomplete", "off", false);
    iFrame.setAttribute("allowtransparency", "true", false);
    iFrame.onload = AjxCallback.simpleClosure(this._stealFocus, this, iFrame.id);

    if(window.isTinyMCE) {  //temp check
        var htmlEl = this.getHtmlElement();
        var divEl = document.createElement("div");
        divEl.setAttribute("style","padding:3px; height:98%");
        var textEl = document.createElement("textarea");
        textEl.setAttribute("id", "tiny_mce_content");
        textEl.setAttribute("name","tiny_mce_content");
        textEl.setAttribute("rows", "100");
        //textEl.setAttribute("cols", "99");
        textEl.setAttribute("style", "width:99.5%; height:97%;");

        divEl.appendChild(textEl);
        htmlEl.appendChild(divEl);

        var urlParts = AjxStringUtil.parseURL(location.href);

        //important: tinymce doesn't handle url parsing well when loaded from REST URL - override baseURL/baseURI
        //to fix this
        tinymce.baseURL = window.contextPath + "/tiny_mce/3.2.6/";
        if(tinymce.EditorManager) tinymce.EditorManager.baseURI = new tinymce.util.URI(urlParts.protocol + "://" + urlParts.authority + tinymce.baseURL);

        tinyMCE.init({
            // General options
            mode : "exact",
            elements: "tiny_mce_content",
            theme : "advanced",
            relative_urls: false,
            remove_script_host : false,
            plugins : "pagebreak,ztable,safari,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template",

            // Theme options
            theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect,|,cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
            theme_advanced_buttons2 : "ztablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen,|,insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak",
            theme_advanced_buttons3 : "",
            theme_advanced_toolbar_location : "top",
            theme_advanced_toolbar_align : "left",
            theme_advanced_statusbar_location : "none",
            theme_advanced_resizing : true,
            force_br_newlines : true,
            forced_root_block : '',
            force_p_newlines : false,
            // Example content CSS (should be your site CSS)
            content_css : "css/content.css",
            //enabling browser spell check
            gecko_spellcheck : true,
            // Drop lists for link/image/media/template dialogs
            template_external_list_url : "lists/template_list.js",
            external_link_list_url : "lists/link_list.js",
            external_image_list_url : "lists/image_list.js",
            media_external_list_url : "lists/media_list.js",
            setup : function(ed) {
			    ed.onLoadContent.add(handleContentLoad);
		    }

        });
    } else {
         var editor = this._editor = new ZmDocsEditor({parent:this, iframe: this._iframe, controller: this._controller, className:"ZDEditDiv"});
         this._editorTb = editor._createToolbar(this);

         editor.getHtmlElement().appendChild(iFrame);
         editor._initIframe();

         var iContentWindow = this._iframe.contentWindow;
         this._doc = iContentWindow ? iContentWindow.document : null;
         this._pushIframeContent(this._iframe);

         editor._enableDesignMode(editor._getIframeDoc());

         this.addFooter();
    }
};

ZmDocsEditView.prototype._stealFocus =
function(iFrameId) {
	if(AjxEnv.isFirefox3up) {
		var iframe = document.getElementById(iFrameId);
		if (iframe) {
			iframe.blur();
			iframe.focus();
		}
	}
}

ZmDocsEditView.prototype.addFooter = 
function() {
	var el = this.getHtmlElement();
	var div = this._footerEl = document.createElement("div");
	var locationId = Dwt.getNextId();
	var versionId = Dwt.getNextId();
	var authorId = Dwt.getNextId();
	var modifiedId = Dwt.getNextId();
	var footer = [
			'<table cellpadding="0" cellspacing="0" class="ZmHtmlEditorFooter">',
			'<tr>',
			'<td>',ZmMsg.locationLabel,' <span id="',locationId,'"></span></td>',
			'<td>',ZmMsg.versionLabel,' <span id="',versionId,'"></span></td>',
			'<td>',ZmMsg.authorLabel,' <span id="',authorId,'"></span></td>',
			'<td>',ZmMsg.modifiedOnLabel,' <span id="',modifiedId,'"></span></td>',
			'</tr>',
			'</table>'
	];

	div.innerHTML = footer.join("");
	el.appendChild(div);
	this._locationEl = document.getElementById(locationId);
	this._versionEl = document.getElementById(versionId);
	this._authorEl = document.getElementById(authorId);
	this._modifiedEl = document.getElementById(modifiedId);

};

ZmDocsEditView.prototype._saveButtonListener = function(ev) {
    this._saveClose = false;
    this.save();
};

ZmDocsEditView.prototype._saveCloseButtonListener = function(ev) {
    this._saveClose = true;
    this.save();
};

ZmDocsEditView.prototype._tbActionListener = function(ev) {
   var action = ev.item.getData(ZmDocsEditView.ZD_VALUE);

   if(action == "NewDocument") {

      if(confirm(ZmMsg.exitDocUnSavedChanges)) {
          this._buttons.fileName.setValue("");
          ZmDocsEditApp.setFile();
          this._pushIframeContent(this._iframe);
          this._editor._enableDesignMode(this._editor._getIframeDoc());
      }

   } else if(action = "OpenDocument") {
       /*if(!this._openDocDlg) {
            this._openDocDlg = new ZmOpenDocDialog(appCtxt.getShell());
       }
       this._openDocDlg.popup();*/
   }


};

ZmDocsEditView.prototype._createToolbar2 = function(toolbar) {

    var params = {parent:toolbar,style:DwtButton.TOGGLE_STYLE};

    var listener = new AjxListener(this, this._quickTbActionListener);
    
    var b = this._buttons.docElTb = new DwtToolBarButton(params);
    b.setText(ZmMsg.zd_docElements);
    b.setData(ZmDocsEditView.ZD_VALUE, "DocElements");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docElementsTT);

    new DwtControl({parent:toolbar, className:"vertSep"});

    b = this._buttons.quickTb = new DwtToolBarButton(params);
    b.setText(ZmMsg.zd_docQuickTables);
    b.setData(ZmDocsEditView.ZD_VALUE, "QuickTables");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickTablesTT);

    /*new DwtControl({parent:toolbar, className:"vertSep"});

    b = this._buttons.chartTb = new DwtToolBarButton(params);
    b.setText(ZmMsg.zd_docCharts);
    b.setData(ZmDocsEditView.ZD_VALUE, "QuickCharts");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docChartsTT);

    new DwtControl({parent:toolbar, className:"vertSep"});

    b = this._buttons.smartTb = new DwtToolBarButton(params);
    b.setText(ZmMsg.zd_docSmartArt);
    b.setData(ZmDocsEditView.ZD_VALUE, "SmartArt");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docSmartArtTT);*/

    this._createQuickTables();

    this._createDocElements();
};

ZmDocsEditView.prototype._quickTbActionListener = function(ev) {
    var action = ev.item.getData(ZmDocsEditView.ZD_VALUE);

    if(action == "QuickTables") {
        if(this._toolbar3.getVisible()) {
            this._toolbar3.setVisible(false);                
        } else {
            this._toolbar3.setVisible(true);
        }
        this._toolbar4.setVisible(false);
    } else if(action == "DocElements") {
        if(this._toolbar4.getVisible()) {
            this._toolbar4.setVisible(false);
        } else {
            this._toolbar4.setVisible(true);
        }    
        this._toolbar3.setVisible(false);
    } else {
        this._toolbar4.setVisible(false);
        this._toolbar3.setVisible(false);
    }

};

ZmDocsEditView.prototype._insertQuickTables = function(ev) {
  var action = ev.item.getData(ZmDocsEditView.ZD_VALUE);

    var doc = this._editor._getIframeDoc();
    var spanEl = doc.createElement("span");

    if(action == "QuickTable1") {
        var tableHtml = [];
        tableHtml.push('<table width="90%" cellspacing="1" cellpadding="3" align="center"><tbody><tr><th style="width:33%; background-color:rgb(237,37,37);"></br></th><th style="width:33%; background-color:rgb(237,37,37);" ></br></th><th style="width:33%; background-color:rgb(237,37,37);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(255,197,197);"></br></td><td style="background-color:rgb(255,197,197);"></br></td><td style="background-color:rgb(255,197,197);"></br></td></tr>' +
                       '<tr><td></br></td><td></br></td><td></br></td></tr>' +
                       '<tr><td style="background-color:rgb(255,197,197);"></br></td><td style="background-color:rgb(255,197,197);"></br></td><td style="background-color:rgb(255,197,197);"></br></td></tr>' +
                       '<tr><td></br></td><td></br></td><td></br></td></tr>' +
                       '<tr><td style="background-color:rgb(255,197,197);"></br></td><td style="background-color:rgb(255,197,197);"></br></td><td style="background-color:rgb(255,197,197);"></br></td></tr>' +
                       '<tr><td></br></td><td></br></td><td></br></td></tr></tbody></table>');

        spanEl.innerHTML = tableHtml.join("");
    } else if(action == "QuickTable2") {
        var tableHtml = [];
        tableHtml.push('<table width="90%" cellspacing="1" cellpadding="3" align="center"><tbody><tr><th style="background-color:rgb(115,170,270);"></br></th></tr>' +
                       '<tr><td style="background-color:rgb(198,220,238);"></br></td></tr>' +
                       '<tr><td></br></td></tr>' +
                       '<tr><td style="background-color:rgb(198,220,238);"></br></td></tr>' +
                       '<tr><td></br></td></tr>' +
                       '<tr><td style="background-color:rgb(198,220,238);"></br></td></tr>' +
                       '<tr><td></br></td></tr></tbody></table>');

        spanEl.innerHTML = tableHtml.join("");;
    } else if(action == "QuickTable3") {
        var tableHtml = [];
        tableHtml.push('<table width="90%" cellspacing="1" cellpadding="3" align="center"><tbody><tr><th style="width:33%; background-color:rgb(128,128,128);"></br></th><th style="width:33%; background-color:rgb(128,128,128);" ></br></th><th style="width:33%; background-color:rgb(128,128,128);"></br></td></tr>' +
                       '<tr><td colspan="1" rowspan="5" style="background-color:rgb(196,196,196);"></br></td><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td><td style="background-color:rgb(234,234,234);"></br></td></tr></tbody></table>');

        spanEl.innerHTML = tableHtml.join("");
    } else if(action == "QuickTable4") {
        var tableHtml = [];
        tableHtml.push('<table width="90%" cellspacing="1" cellpadding="3" align="center"><tbody><tr><th style="width:33%; background-color:rgb(1,171,37);"></br></th><th style="width:33%; background-color:rgb(1,171,37);" ></br></th><th style="width:33%; background-color:rgb(1,171,37);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td></tr>' +
                       '<tr><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td><td style="background-color:rgb(216,255,225);"></br></td></tr></tbody></table>');

        spanEl.innerHTML = tableHtml.join("");
    }

    var p = doc.createElement("br");
    var df = doc.createDocumentFragment();
    df.appendChild(p);
    df.appendChild(spanEl.getElementsByTagName("table")[0]);
    df.appendChild(p.cloneNode(true));

    this._editor._insertNodeAtSelection(df);

};

ZmDocsEditView.prototype._insertDocElements = function(ev) {

    var action = ev.item.getData(ZmDocsEditView.ZD_VALUE);

    var doc = this._editor._getIframeDoc();
    var spanEl = doc.createElement("span");

    if(action == "DocElement2") {
        spanEl.innerHTML = '<table width="90%" cellspacing="1" cellpadding="3" align="center" style="border:1px solid rgb(0,0,0);"><tbody><tr height="40"><td style="background-color: rgb(204, 0, 0);"><br/></td></tr><tr><td><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 80px;">' +
                            '<font size="7" _moz_dirty="">[ Document Title ]</font><br _moz_dirty=""/><font size="3" _moz_dirty="" style="color: rgb(192, 192, 192);">&nbsp;[ Sub Title]</font><br _moz_dirty=""/></div><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 76%;">&nbsp;' +
                            '<img src="http://www.zimbra.com/_media/logos/zimbra_logo.gif" alt="http://www.zimbra.com/_media/logos/zimbra_logo.gif" _moz_dirty="" style="width: 211px; height: 101px;"/>' +
                            '<br _moz_dirty=""/></div><br _moz_dirty=""/><br _moz_dirty=""/></td></tr></tbody></table>';

    } else if(action == "DocElement3") {

        spanEl.innerHTML = '<table width="90%" cellspacing="1" cellpadding="3" align="center"><tbody><tr><td style="border: 1px solid rgb(0, 0, 0);"><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 80px;">' +
                            '<font size="7" _moz_dirty="">[ Document Title ]</font><br _moz_dirty=""/><font size="3" _moz_dirty="" style="color: rgb(192, 192, 192);">&nbsp;[ Sub Title]</font><br _moz_dirty=""/></div><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/>' +
                            '<br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><br _moz_dirty=""/><div _moz_dirty="" style="margin-left: 80%;">&nbsp;' +
                            '<img src="http://yhoo.client.shareholder.com/press/images/yahoobang-small.gif" alt="http://yhoo.client.shareholder.com/press/images/yahoobang-small.gif" _moz_dirty="" style="width: 156px; height: 91px;"/>' +
                            '<br _moz_dirty=""/></div><br _moz_dirty=""/><br _moz_dirty=""/></td></tr></tbody></table>';

    }

    var p = doc.createElement("br");
    var df = doc.createDocumentFragment();
    df.appendChild(p);
    df.appendChild(spanEl.getElementsByTagName("table")[0]);
    df.appendChild(p.cloneNode(true));

    this._editor._insertNodeAtSelection(df);

};


ZmDocsEditView.prototype._createDocElements = function() {

    var toolbar4 = this._toolbar4 = new DwtToolBar({parent:this, className:"ZDQtbToolBar",cellSpacing:0,posStyle:DwtControl.RELATIVE_STYLE});

    var params = {parent:toolbar4,style:DwtButton.ALWAYS_FLAT};

    var listener = new AjxListener(this, this._insertDocElements);

    var b = new DwtToolBarButton(params);
    b.setImage("DocElement2");
    b.setData(ZmDocsEditView.ZD_VALUE, "DocElement2");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickInsert);

    b = new DwtToolBarButton(params);
    b.setImage("DocElement3");
    b.setData(ZmDocsEditView.ZD_VALUE, "DocElement3");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickInsert);

    this._toolbar4.setVisible(false);
};

ZmDocsEditView.prototype._createQuickTables = function() {

    var toolbar3 = this._toolbar3 = new DwtToolBar({parent:this, className:"ZDQtbToolBar",cellSpacing:0,posStyle:DwtControl.RELATIVE_STYLE});

    var params = {parent:toolbar3,style:DwtButton.ALWAYS_FLAT};

    var listener = new AjxListener(this, this._insertQuickTables);

    var b = new DwtToolBarButton(params);
    b.setImage("QuickTable1");
    b.setData(ZmDocsEditView.ZD_VALUE, "QuickTable1");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickInsert);
    b.getHtmlElement().style.padding = "6px";

    b = new DwtToolBarButton(params);
    b.setImage("QuickTable2");
    b.setData(ZmDocsEditView.ZD_VALUE, "QuickTable2");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickInsert);
    b.getHtmlElement().style.padding = "6px";

    b = new DwtToolBarButton(params);
    b.setImage("QuickTable3");
    b.setData(ZmDocsEditView.ZD_VALUE, "QuickTable3");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickInsert);
    b.getHtmlElement().style.padding = "6px";

    b = new DwtToolBarButton(params);
    b.setImage("QuickTable4");
    b.setData(ZmDocsEditView.ZD_VALUE, "QuickTable4");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.zd_docQuickInsert);
    b.getHtmlElement().style.padding = "6px";
    
    this._toolbar3.setVisible(false);
};

ZmDocsEditView.prototype._createToolbar = function(toolbar) {

    var params = {parent:toolbar};

    b = this._buttons.fileName = new DwtInputField({parent:toolbar, size:20});    
    
    var b = this._buttons.saveFile = new DwtToolBarButton(params);
    b.setImage("Save");
    b.setText(ZmMsg.save);
    b.setData(ZmDocsEditView.ZD_VALUE, "Save");
    b.addSelectionListener(new AjxListener(this, this._saveButtonListener));
    b.setToolTipContent(ZmMsg.save);

    new DwtControl({parent:toolbar, className:"vertSep"});

    var b = this._buttons.saveAndCloseFile = new DwtToolBarButton(params);
    b.setImage("Save");
    b.setText(ZmMsg.saveClose);
    b.setData(ZmDocsEditView.ZD_VALUE, "Save&Close");
    b.addSelectionListener(new AjxListener(this, this._saveCloseButtonListener));
    b.setToolTipContent(ZmMsg.saveClose);

    new DwtControl({parent:toolbar, className:"vertSep"});    

    var listener = new AjxListener(this, this._tbActionListener);
    /*
    b = this._buttons.clipboardCopy = new DwtToolBarButton(params);
	b.setImage("Copy");
	b.setData(ZmDocsEditView.ZD_VALUE, "ClipboardCopy");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.copy);

	b = this._buttons.clipboardCut = new DwtToolBarButton(params);
	b.setImage("Cut");
	b.setData(ZmDocsEditView.ZD_VALUE, "ClipboardCut");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.cut);

	b = this._buttons.clipboardPaste = new DwtToolBarButton(params);
	b.setImage("Paste");
	b.setData(ZmDocsEditView.ZD_VALUE, "ClipboardPaste");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.paste);

    new DwtControl({parent:toolbar, className:"vertSep"});
    */

    b = this._buttons.newDocument = new DwtToolBarButton(params);
    b.setText(ZmMsg.newDocument);
    b.setImage("Doc");
    b.setData(ZmDocsEditView.ZD_VALUE, "NewDocument");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.briefcaseCreateNewDocument);

    /*b = this._buttons.clipboardPaste = new DwtToolBarButton(params);
    b.setText("Open Document");
    b.setData(ZmDocsEditView.ZD_VALUE, "OpenDocument");
    b.addSelectionListener(listener);
    b.setToolTipContent(ZmMsg.paste);*/
    
};

ZmDocsEditView.prototype._pushIframeContent =
function(iframeN) {

    if(!iframeN) return;
    var iContentWindow = iframeN.contentWindow;
    var doc = iContentWindow ? iContentWindow.document : null;
    if(doc) {
        doc.open();
        var html = [];
        html.push('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">');
        html.push('<html>');
        //html.push('<link href="' + window.appContextPath + '/css/skin,slides.css?locale=' + AjxEnv.DEFAULT_LOCALE + '" rel="stylesheet" type="text/css" />');
        html.push('<body><br _moz_dirty=""/></body>');
        html.push('</html>');
        doc.write(html.join(""));
        doc.close();
        iContentWindow.focus();
    }
};
