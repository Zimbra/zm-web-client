/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
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

/**
 * Advanced Html Editor which switches between TinyMCE and ZmHtmlEditor
 *
 * @author Satish S
 */
ZmAdvancedHtmlEditor = function(parent, posStyle, content, mode, withAce) {
    if (arguments.length == 0) return;

    this.isTinyMCE = window.isTinyMCE;
    this._mode = mode;

    this.initTinyMCEEditor(parent, posStyle, content, mode, withAce);
};

ZmAdvancedHtmlEditor.TINY_MCE_PATH = "/tiny_mce/3.2.6";

ZmAdvancedHtmlEditor.prototype.getEditor =
function() {
    return  (window.tinyMCE) ? tinyMCE.get(this._bodyTextAreaId) : null;    
};

ZmAdvancedHtmlEditor.prototype.getBodyFieldId =
function() {
    if(this._mode == DwtHtmlEditor.HTML){
        var editor = this.getEditor();
        return editor ? this._bodyTextAreaId + '_ifr' : this._bodyTextAreaId;
    }else {
        return this._bodyTextAreaId;
    }
};

ZmAdvancedHtmlEditor.prototype.getBodyField =
function() {
    var fieldId = this.getBodyFieldId();
    return document.getElementById(fieldId);
};

ZmAdvancedHtmlEditor.prototype.resizeWidth =
function(width) {
    var editorContainer = document.getElementById(this._bodyTextAreaId + "_tbl");
    if(editorContainer) {
        editorContainer.style.width = width;
    }
};

ZmAdvancedHtmlEditor.prototype.setSize =
function(x, y) {
    var editor = this.getEditor();
    var bodyField = this.getBodyField();

    // FUDGE: we must substract borders and paddings - yuck.
    var delta = this._mode == DwtHtmlEditor.HTML ? 10 : 8;

    x -= delta + 4;

    // subtract fudge factor
	y -= delta;
    
    // bug fix #6786 - normalize width/height if less than zero
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    bodyField.style.width = x + 5 + "px";
    bodyField.style.height = y + "px";

    var editorContainer = document.getElementById(this._bodyTextAreaId + "_tbl");
    if(editor && editorContainer) {
        editorContainer.style.height = y + "px";
        editorContainer.style.width = "100%";
    }
    //todo: handle spellcheck ids 
};

ZmAdvancedHtmlEditor.prototype.focus =
function() {
    var editor = this.getEditor();
    if(editor){
        editor.focus();
    }else {
        var bodyField = this.getContentField();
        if(bodyField) bodyField.focus();
    }
};

ZmAdvancedHtmlEditor.prototype.getTextVersion =
function() {
    var textArea = this.getContentField();
    if(this._mode == DwtHtmlEditor.HTML) {
        var editor = this.getEditor();
        return editor ? this._convertHtml2Text(): "";
    }else {
        return textArea.value;   
    }
};

ZmAdvancedHtmlEditor.prototype.getContent =
function() {
    var field = this.getContentField();
    if(this._mode == DwtHtmlEditor.HTML) {
        var editor = this.getEditor();
        if(editor) {
            return editor.getContent();
        }else {
            return this._pendingContent || "";
        }
    }else {
        return field.value;
    }
};

ZmAdvancedHtmlEditor.prototype.setContent =
function(content) {
    if(this._mode == DwtHtmlEditor.HTML) {
        var editor = this.getEditor();
        if(editor) {
            editor.setContent(content);
        }else {
            this._pendingContent = content;
        }
    }else {
        var field = this.getContentField();
        field.value = content;
    }
};

ZmAdvancedHtmlEditor.prototype.reEnableDesignMode =
function() {
    //tinyMCE doesn't need to handle this
};

ZmAdvancedHtmlEditor.prototype.getMode =
function() {
    return this._mode;
};

ZmAdvancedHtmlEditor.prototype.isHtmlModeInited =
function() {
    var editor = this.getEditor();
    return Boolean(editor);
};

ZmAdvancedHtmlEditor.prototype._convertHtml2Text =
function() {
    var editor = this.getEditor();
    var doc = editor ? editor.getDoc() : null;
    var textContent = "";
    if(doc && doc.body) {
        textContent = this._convertHtml2TextContinue(doc.body);
    }
    return textContent;
};


ZmAdvancedHtmlEditor.prototype._convertHtml2TextContinue =
function(domRoot) {
    var text = [];
    var idx = 0;
    var ctxt = {};

    AjxStringUtil._traverse(domRoot, text, idx, AjxStringUtil._NO_LIST, 0, 0, ctxt);

    //tinymce always inserts <p> tag which creates unwanted new lines in format conversion
    
    if(text.length && text[0] == "\n\n") {
        text[0] = "";        
    }

    return text.join("");
};

ZmAdvancedHtmlEditor.prototype.moveCaretToTop =
function() {
    if (this._mode == DwtHtmlEditor.TEXT) {
        var control = this.getContentField();
        if (control.createTextRange) { // IE
            var range = control.createTextRange();
            range.collapse(true);
            range.select();
        } else if (control.setSelectionRange) { // FF
            control.setSelectionRange(0, 0);
        }
    } else {
        this._moveCaretToTopHtml(true);
    }
};

ZmAdvancedHtmlEditor.prototype._moveCaretToTopHtml =
function(tryOnTimer) {
    var editor = this.getEditor();
    if(!editor) return;
	var body = editor.getDoc().body;
	var success = false;
	if (AjxEnv.isIE) {
		if (body) {
			body.createTextRange().collapse(true);
			success = true;
		}
	} else {
		var selection = editor.selection ? editor.selection.getSel() : "";
		if (selection) {
			selection.collapse(body,0);
			success = true;
		}
	}
	if (!success && tryOnTimer) {
		var action = new AjxTimedAction(this, this._moveCaretToTopHtml);
		AjxTimedAction.scheduleAction(action, DwtHtmlEditor._INITDELAY + 1);
	}
};


ZmAdvancedHtmlEditor.prototype.hasFocus =
function() {
    var editor = this.getEditor();
    return this._editorContainer ? this._editorContainer.hasFocus() : false;
    //todo: need to handle focus
};

ZmAdvancedHtmlEditor.prototype._getIframeDoc =
function() {
    var editor = this.getEditor();
    return editor ? editor.getDoc() : null; 
};

ZmAdvancedHtmlEditor.prototype.clear =
function() {
    this.setPendingContent(null);
    var editor = this.getEditor();
    if(editor) {
        editor.setContent("");
    }else {
        var field = this.getContentField();
        field.value = "";
    }
};

ZmAdvancedHtmlEditor.prototype.reparentHtmlElement =
function(id, position) {
     return this._editorContainer.reparentHtmlElement(id, position);
};

ZmAdvancedHtmlEditor.prototype.initTinyMCEEditor =
function(parent, posStyle, content, mode, withAce) {

    this._editorContainer = new DwtComposite({parent: parent, posStyle: posStyle, mode: mode, content: content, withAce: withAce, className:"ZmHtmlEditor"});
    var htmlEl = this._editorContainer.getHtmlElement();

    //textarea on which html editor is constructed
    var id = this._bodyTextAreaId = this._editorContainer.getHTMLElId() + "_content";
    var textEl = document.createElement("textarea");
    textEl.setAttribute("id", id);
    textEl.setAttribute("name", id);
    htmlEl.appendChild(textEl);

    if(!window.tinyMCE) {
        var callback = new AjxCallback(this, this.initEditorManager, [id, mode, content]);
        var data = {
            name: "tiny_mce",
            path: appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH + "/tiny_mce.js" ,
            method: AjxPackage.METHOD_XHR_SYNC,
            async: false,
            callback: null,
            scripts: [],
            basePath: appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH
        };

        AjxPackage.require(data);
        this.initEditorManager(id, mode, content);
    }else {
        this.initEditorManager(id, mode, content);
    }
};

ZmAdvancedHtmlEditor.prototype.getPendingContent =
function() {
    return this._pendingContent;    
};

ZmAdvancedHtmlEditor.prototype.setPendingContent =
function(content) {
    this._pendingContent = content;
};

ZmAdvancedHtmlEditor.prototype.addOnContentIntializedListener =
function(callback) {
	this._onContentInitializeCallback = callback;
};

ZmAdvancedHtmlEditor.prototype.removeOnContentIntializedListener =
function() {
	this._onContentInitializeCallback = null;
};

ZmAdvancedHtmlEditor.prototype.onLoadContent =
function(ed) {
    var pendingContent = this.getPendingContent();
    if(pendingContent != null) {
        ed.setContent(pendingContent);
        this.setPendingContent(null);
    }

    if (this._onContentInitializeCallback) {
        this._onContentInitializeCallback.run();
    }
};

ZmAdvancedHtmlEditor.prototype.initEditorManager =
function(id, mode, content) {

    var obj = this;

    function handleContentLoad(ed) {
        obj.onLoadContent(ed);
    };

    function initFontStyles(ed) {
        obj.initDefaultFontSize(ed);
    };

    var urlParts = AjxStringUtil.parseURL(location.href);

    //important: tinymce doesn't handle url parsing well when loaded from REST URL - override baseURL/baseURI to fix this
    tinymce.baseURL = appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH + "/";

    if(tinymce.EditorManager) tinymce.EditorManager.baseURI = new tinymce.util.URI(urlParts.protocol + "://" + urlParts.authority + tinymce.baseURL);

    if(tinymce.dom) {
        tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
    }

    if(tinymce.dom && tinymce.dom.Event) tinymce.dom.Event.domLoaded = true; 

    this.setPendingContent(content || "");
    
    tinyMCE.init({
        // General options
        mode :  (mode == DwtHtmlEditor.HTML)? "exact" : "none",
        elements:  id,
        plugins : "table",
        theme : "advanced",
        theme_advanced_buttons1 : "fontselect,fontsizeselect,formatselect,justifyleft,justifycenter,justifyright,justifyfull,separator,bold,italic,underline,separator,forecolor,backcolor,separator,link,table",
        theme_advanced_buttons2: "",
        theme_advanced_buttons3: "",
        theme_advanced_buttons4: "",
        theme_advanced_toolbar_location : "top",
        theme_advanced_toolbar_align : "left",
        convert_urls : false,
        verify_html : false,
        content_css : false,
        setup : function(ed) {
            ed.onLoadContent.add(handleContentLoad);
            ed.onInit.add(initFontStyles);
        }
    });

    this._editor = this.getEditor();
};


ZmAdvancedHtmlEditor.prototype.setMode =
function(mode, convert) {
    if (mode == this._mode || (mode != DwtHtmlEditor.HTML && mode != DwtHtmlEditor.TEXT)) {	return;	}

    this._mode = mode;
    var editor = this.getEditor();
    if (mode == DwtHtmlEditor.HTML) {
        var textArea = this.getContentField();
        if (editor && editor.getDoc()) {
            var doc = editor.getDoc();
            var content = convert ? AjxStringUtil.convertToHtml(textArea.value)	: textArea.value;
            doc.body.innerHTML = content;
            this._pendingContent = content;
        } else {
            var content = convert ? AjxStringUtil.convertToHtml(textArea.value)	: textArea.value;
            this._pendingContent = content;
        }
        tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);
    } else {
        var textArea = this.getContentField();
        var doc = editor.getDoc();
        var textContent = convert ? this._convertHtml2Text() : doc.innerHTML;

        tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);
        textArea.value = textContent;
    }
};

ZmAdvancedHtmlEditor.prototype.getContentField =
function() {
    return document.getElementById(this._bodyTextAreaId);
};

ZmAdvancedHtmlEditor.prototype.insertImage =
function(src, dontExecCommand, width, height) {

    var html=[],idx=0;

    html[idx++] = "<img";
    html[idx++] = " src='" + src + "'";
    if(width != null) html[idx++] = " width='" + width + "'";
    if(height != null) html[idx++] = " height='" + height + "'";
    html[idx++] = ">";

    var ed = this.getEditor();

    // Fixes crash in Safari
    if (tinymce.isWebKit) ed.getWin().focus();

    ed.execCommand('mceInsertContent', false, html.join(""), {skip_undo : 1});
};

ZmAdvancedHtmlEditor.prototype.initDefaultFontSize =
function(editor) {
    var doc = editor ? editor.getDoc() : null;
    if(doc) {
        doc.body.style.fontFamily = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
        doc.body.style.fontSize = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
        doc.body.style.color = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR); 
    }
};

ZmAdvancedHtmlEditor.prototype.addCSSForDefaultFontSize =
function(editor) {
    var selectorText = "body,td,pre";
    var ruleText = [
            "font-family:", appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY),";",
            "font-size:", appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE),";",
            "color:", appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR),";" 
    ].join("");
    var doc = editor ? editor.getDoc() : null;
    if(doc) this.insertDefaultCSS(doc, selectorText, ruleText);
};

ZmAdvancedHtmlEditor.prototype.insertDefaultCSS =
function(doc, selectorText, ruleText) {
    var sheet,styleElement;
    if (doc.createStyleSheet)
    {
        sheet = doc.createStyleSheet();
    }else {
        styleElement = doc.createElement("style");
        doc.getElementsByTagName("head")[0].appendChild(styleElement);
        sheet = styleElement.styleSheet ? styleElement.styleSheet : styleElement.sheet;
    }

    if(!sheet && styleElement) {
        //remove braces
        ruleText = ruleText.replace(/^\{?([^\}])/, "$1");
        styleElement.innerHTML = selectorText + ruleText;
    }else if (sheet.addRule) {
        //remove braces
        ruleText = ruleText.replace(/^\{?([^\}])/, "$1");
        DBG.println("ruleText:" + ruleText + ",selector:" + selectorText);
        sheet.addRule(selectorText, ruleText);
    }else if (sheet.insertRule) {
        //need braces
        if (!/^\{[^\}]*\}$/.test(ruleText)) ruleText = "{" + ruleText + "}";
        sheet.insertRule(selectorText + " " + ruleText, sheet.cssRules.length);
    }
};

ZmAdvancedHtmlEditor.prototype.resetSpellCheck =
function() {
};