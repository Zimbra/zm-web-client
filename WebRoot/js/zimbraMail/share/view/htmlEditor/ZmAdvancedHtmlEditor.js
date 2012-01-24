/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 * Advanced Html Editor which switches between TinyMCE and ZmHtmlEditor
 *
 * @author Satish S
 * @private
 */
ZmAdvancedHtmlEditor = function(parent, posStyle, content, mode, withAce, reparentContainer, textAreaId) {
	if (arguments.length == 0) { return; }

	this.isTinyMCE = window.isTinyMCE;
	this._mode = mode;
	this._hasFocus = {};
    this.isSignatureEditor = parent.isSignatureEditor;
    this._bodyTextAreaId = textAreaId;
	this.initTinyMCEEditor(parent, posStyle, content, mode, withAce, reparentContainer);
    this._ignoreWords = {};
};

ZmAdvancedHtmlEditor.prototype.isZmAdvancedHtmlEditor = true;
ZmAdvancedHtmlEditor.prototype.isInputControl = true;
ZmAdvancedHtmlEditor.prototype.toString = function() { return "ZmAdvancedHtmlEditor"; };

ZmAdvancedHtmlEditor.TINY_MCE_PATH = appContextPath + "/js/ajax/3rdparty/tinymce";

ZmAdvancedHtmlEditor.prototype.getEditor =
function() {
	return  (window.tinyMCE) ? tinyMCE.get(this._bodyTextAreaId) : null;
};

ZmAdvancedHtmlEditor.prototype.getBodyFieldId =
function() {
	if (this._mode == DwtHtmlEditor.HTML) {
		var editor = this.getEditor();
		return editor ? this._bodyTextAreaId + '_ifr' : this._bodyTextAreaId;
	}

	return this._bodyTextAreaId;
};

ZmAdvancedHtmlEditor.prototype.getBodyField =
function() {
	return document.getElementById(this.getBodyFieldId());
};

ZmAdvancedHtmlEditor.prototype.resizeWidth =
function(width) {
	var editorContainer = document.getElementById(this._bodyTextAreaId + "_tbl");
	if (editorContainer) {
		editorContainer.style.width = width;
	}
};

ZmAdvancedHtmlEditor.prototype.setSize =
function(x, y) {
    var div = this._spellCheckDivId && document.getElementById(this._spellCheckDivId);
    var editorContainer = document.getElementById(this._bodyTextAreaId + "_tbl");// holds editor iframe container (table)
    var bodyField;
    if( this._mode === DwtHtmlEditor.HTML && editorContainer ){
        bodyField = editorContainer;
    }
    else{
        bodyField = document.getElementById(this._bodyTextAreaId);//holds textarea;
    }
	// FUDGE: we must substract borders and paddings - yuck.
	var delta = 10;

    /*
    if (x === Dwt.CLEAR) {
		bodyField.style.width = null;
        if (div) div.style.width = null;
	} else if (x === Dwt.DEFAULT) {
		bodyField.style.width = "auto";
        if (div) div.style.width = "auto";
	} else if (typeof(x) === "number") {
        x -= delta + 4;
    	// bug fix #6786 - normalize width/height if less than zero
	    if (x < 0) { x = 0; }
		bodyField.style.width = x + 5 + "px";
        if (div) {
			if (!AjxEnv.isIE) {
				x = x > 4 ? (x-4) : x;
			}
			div.style.width = x + "px";
		}
	}
	*/

    if (y === Dwt.CLEAR) {
        bodyField.style.height = null;
        if (div) div.style.height = null;
    } else if (y === Dwt.DEFAULT) {
        bodyField.style.height = "auto";
        if (div) div.style.height = "auto";
    } else if (typeof(y) === "number") {
        y -= delta; // subtract fudge factor
        if (y < 0) { y = 0; }
        if( this._mode === DwtHtmlEditor.TEXT ){
            bodyField.style.height = y + "px";
        }
        else{
            if( y > 0 ){
                var iframe = this._iFrameId && document.getElementById(this._iFrameId);//holds iframe
                if(iframe){
                    if( this.getToolbar("2").style.display === Dwt.DISPLAY_NONE ){
                        iframe.style.height = (y - 24)+"px";
                    }
                    else{
                        iframe.style.height = (y - 64)+"px";
                    }
                }
                else{
                    bodyField.style.height = (y - 18) + "px";
                }
            }
        }
        if (div) {
			if (!AjxEnv.isIE) {
				y = y > 4 ? (y-4) : y;
			} else {
				y += 2;
			}
			div.style.height = y + "px";
		}
    }
};

ZmAdvancedHtmlEditor.prototype.editorContainerFocus =
function() {
	DBG.println("focus on container");
	this.focus();
};

ZmAdvancedHtmlEditor.prototype.focus =
function() {
	var editor = this.getEditor();
	if (this._editorInitialized && editor) {
		editor.focus();
		this.setFocusStatus(true);
	} else {
        if ( this._mode === DwtHtmlEditor.HTML ) {
            this._onTinyMCEEditorInitcallback = new AjxCallback(this, this.focus);
        }
        else{
            var bodyField = this.getContentField();
            if (bodyField){
                bodyField.focus();
                this.setFocusStatus(true, true);
            }
        }
	}
};

ZmAdvancedHtmlEditor.prototype.getTextVersion =
function(convertor) {
	var textArea = this.getContentField();
	if (this._mode == DwtHtmlEditor.HTML) {
		var editor = this.getEditor();
		return editor ? this._convertHtml2Text(convertor): "";
	}

	return textArea.value;
};

ZmAdvancedHtmlEditor.prototype.getContent =
function(insertFontStyle, onlyInnerContent) {

    this.discardMisspelledWords();
    
	var field = this.getContentField();

	if (this._mode == DwtHtmlEditor.HTML) {
		var editor = this.getEditor();
        var params = {};
        params.format ='raw';
		var content = editor ? editor.getContent(params) : (this._pendingContent || "");
        if(content == '<br mce_bogus="1">' || content == '<br mce_bogus="1"/>') {
            content = '';
        }        
		content = this._embedHtmlContent(content, insertFontStyle, onlyInnerContent);
		return content;
	}

	return field.value;
};

ZmAdvancedHtmlEditor.prototype._embedHtmlContent =
function(html, insertFontStyle, onlyInnerContent) {
	if (!insertFontStyle && !onlyInnerContent) {
		return [ "<html><body>", html, "</body></html>" ].join("");
	}

	if (onlyInnerContent) {
		var cont = [];
		var idx = 0;

		if (insertFontStyle) {
			cont[idx++] = "<div";
			cont[idx++] = " style='font-family:";
			cont[idx++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
			cont[idx++] = "; font-size: ";
			cont[idx++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
			cont[idx++] = "; color: ";
			cont[idx++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
            cont[idx++] = ";' ";
            if ( appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL ){ //Default compose direction is ltr no need to specify direction as ltr
                cont[idx++] = "dir='"+ZmSetting.RTL+"' ";
            }
            cont[idx++] = ">";
			cont[idx++] = html;
			cont[idx++] = "</div>";
		} else {
			cont[idx++] = html;
		}

		return cont.join("");
	}

	if (insertFontStyle) {
		html = ZmAdvancedHtmlEditor._getFontStyle(html);
	}
	return [
		"<html><body>",
		html,
		"</body></html>"
	].join("");
};
ZmAdvancedHtmlEditor._embedHtmlContent = ZmAdvancedHtmlEditor.prototype._embedHtmlContent;

ZmAdvancedHtmlEditor._getFontStyle =
function(html) {
	var a = [], i = 0;
	a[i++] = "<div style='font-family: ";
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	a[i++] = "; font-size: ";
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
	a[i++] = "; color: ";
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
	a[i++] = "' ";
    if( appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL ){
        a[i++] = "dir='"+ZmSetting.RTL+"' ";
    }
    a[i++] = ">";
	a[i++] = html;
	a[i++] = "</div>";
	return a.join("");
};

ZmAdvancedHtmlEditor.prototype.setContent =
function(content) {
	if (this._mode == DwtHtmlEditor.HTML) {
		var editor = this.getEditor();
		if (editor && this._editorInitialized) {
			editor.setContent(content, {format: 'raw'});
		} else {
			this._pendingContent = content;
		}
	} else {
		var field = this.getContentField();
		field.value = content;
	}
    this._ignoreWords = {};
};

ZmAdvancedHtmlEditor.prototype.reEnableDesignMode =
function() {
	// tinyMCE doesn't need to handle this
};

ZmAdvancedHtmlEditor.prototype.getMode =
function() {
	return this._mode;
};

ZmAdvancedHtmlEditor.prototype.isHtmlModeInited =
function() {
	return Boolean(this.getEditor());
};

ZmAdvancedHtmlEditor.prototype._convertHtml2Text =
function(convertor) {
	var editor = this.getEditor();
	var doc = editor && editor.getDoc();

	return (doc && doc.body)
		? this._convertHtml2TextContinue(doc.body, convertor) : "";
};

ZmAdvancedHtmlEditor.prototype._convertHtml2TextContinue =
function(domRoot, convertor) {
	var text = [];
	var idx = 0;
	var ctxt = {};

	AjxStringUtil._traverse(domRoot, text, idx, AjxStringUtil._NO_LIST, 0, 0, ctxt, convertor);

	// tinymce always inserts <p> tag which creates unwanted new lines in format
	// conversion
	if (text.length && text[0] == "\n\n") {
		text[0] = "";
	}

	return text.join("");
};

ZmAdvancedHtmlEditor.prototype.moveCaretToTop =
function() {
	var focused = document.activeElement;
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
    try{
	    if (focused) focused.focus();
    }catch(ex){
        // do nothing
    }
};

ZmAdvancedHtmlEditor.prototype._moveCaretToTopHtml =
function(tryOnTimer) {
	var editor = this.getEditor();
	if (!editor) { return; }

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

ZmAdvancedHtmlEditor.prototype.getEditorContainer =
function() {
	return this._editorContainer;
};

ZmAdvancedHtmlEditor.prototype.hasFocus =
function() {
	return Boolean(this._hasFocus[this._mode]);
};

/*ZmSignature editor contains getIframeDoc method dont want to break the existing code*/
ZmAdvancedHtmlEditor.prototype._getIframeDoc = ZmAdvancedHtmlEditor.prototype.getIframeDoc =
function() {
	var editor = this.getEditor();
	return editor ? editor.getDoc() : null;
};

ZmAdvancedHtmlEditor.prototype._getIframeWin =
function() {
	var editor = this.getEditor();
	return editor ? editor.getWin() : null;
};

ZmAdvancedHtmlEditor.prototype.clear =
function() {
	this.setPendingContent(null);
	var editor = this.getEditor();
    if (editor && this._editorInitialized) {
		editor.setContent("", {format: "raw"});
        this.initDefaultFontSize(editor);
	}
    var field = this.getContentField();
    if(field) field.value = "";
};

ZmAdvancedHtmlEditor.prototype.reparentHtmlElement =
function(id, position) {
	return this._editorContainer.reparentHtmlElement(id, position);
};

ZmAdvancedHtmlEditor.prototype.getParent =
function() {
	return this._editorContainer.parent;
};

ZmAdvancedHtmlEditor.prototype.getInputElement =
function() {
	return document.getElementById(this._bodyTextAreaId);
};

ZmAdvancedHtmlEditor.prototype.initTinyMCEEditor =
function(parent, posStyle, content, mode, withAce, reparentContainer) {

	var params = {
		parent: parent,
		posStyle: posStyle,
		mode: mode,
		content: content,
		withAce: withAce,
		className:"ZmHtmlEditor"
	};
	this._editorContainer = new ZmEditorContainer(params);
    if( reparentContainer ){
        this._editorContainer.reparentHtmlElement(reparentContainer);
    }
	var htmlEl = this._editorContainer.getHtmlElement();

    if( this._mode === DwtHtmlEditor.HTML ){
        Dwt.setVisible(htmlEl, false);
    }
	//textarea on which html editor is constructed
    var id = this._bodyTextAreaId = this._bodyTextAreaId || this._editorContainer.getHTMLElId() + "_content";
	var textEl = document.createElement("textarea");
	textEl.setAttribute("id", id);
	textEl.setAttribute("name", id);
    if( appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL ){
        textEl.setAttribute("dir", ZmSetting.RTL);
    }
	textEl.className = "DwtHtmlEditorTextArea";
	htmlEl.appendChild(textEl);
	this._textAreaId = id;

	Dwt.setHandler(textEl, DwtEvent.ONFOCUS, AjxCallback.simpleClosure(this.setFocusStatus, this, true, true));
	Dwt.setHandler(textEl, DwtEvent.ONBLUR, AjxCallback.simpleClosure(this.setFocusStatus, this, false, true));
	this._editorContainer.setFocusMember(textEl);

	if (content != null) {
		this.setPendingContent(content);
	}

	if (!window.tinyMCE) {
        window.tinyMCEPreInit = {};
        window.tinyMCEPreInit.suffix = '';
        window.tinyMCEPreInit.base = ZmAdvancedHtmlEditor.TINY_MCE_PATH; // SET PATH TO TINYMCE HERE
        // Tell TinyMCE that the page has already been loaded
        window.tinyMCE_GZ = {};
        window.tinyMCE_GZ.loaded = true;

		var callback = new AjxCallback(this, this.initEditorManager, [id, content]);
        AjxDispatcher.require(["TinyMCE"], true, callback);
	} else {
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

ZmAdvancedHtmlEditor.prototype.addOnContentInitializedListener =
function(callback) {
	this._onContentInitializeCallback = callback;
};

ZmAdvancedHtmlEditor.prototype.removeOnContentInitializedListener =
function() {
	this._onContentInitializeCallback = null;
};

ZmAdvancedHtmlEditor.prototype._handleEditorKeyEvent =
function(ev, ed) {
	var retVal = true;

	var cmd = null;
	if (DwtKeyEvent.isKeyPressEvent(ev)) {
		if (DwtKeyboardMgr.isPossibleInputShortcut(ev)) {
			// pass to keyboard mgr for kb nav
			retVal = DwtKeyboardMgr.__keyDownHdlr(ev);
		}
	}

	if (window.DwtIdleTimer) {
		DwtIdleTimer.resetIdle();
	}

	return retVal;
};

ZmAdvancedHtmlEditor.prototype.onLoadContent =
function(ed) {
	var pendingContent = this.getPendingContent();
	if (pendingContent != null) {
		ed.setContent(pendingContent, {format: "raw"});
		this.setPendingContent(null);
	}

	if (this._onContentInitializeCallback) {
		this._onContentInitializeCallback.run();
	}
};

ZmAdvancedHtmlEditor.prototype.setFocusStatus =
function(hasFocus, isTextModeFocus) {
	var mode = isTextModeFocus ? DwtHtmlEditor.TEXT : DwtHtmlEditor.HTML;
	this._hasFocus[mode] = hasFocus;
};

ZmAdvancedHtmlEditor.prototype.initEditorManager =
function(id, content) {

	var obj = this;

	function handleContentLoad(ed) {
		obj.onLoadContent(ed);
		obj.initDefaultFontSize(ed);
        obj.initDefaultDirection();
	};

    function onTinyMCEEditorPostRender(ed) {
        obj.onToolbarToggle();
        Dwt.setVisible(obj.getHtmlElement(), true);
    };

	function onTinyMCEEditorInit(ed) {
        obj.initDefaultFontSize(ed);
        obj.initDefaultDirection();
		tinymce.dom.Event.add(ed.getWin(), 'focus', function(e) {
			obj.setFocusStatus(true);
		});
		tinymce.dom.Event.add(ed.getWin(), 'blur', function(e) {
			obj.setFocusStatus(false);
		});
	    // Set's up the a range for the current ins point or selection. This is IE only because the iFrame can
	    // easily lose focus (e.g. by clicking on a button in the toolbar) and we need to be able to get back
	    // to the correct insertion point/selection.
        // DwtHtmlEditor is using _currInsPtBm property to store the cursor position in editor event handler function which is heavy.
	    // Here we are registering this dedicated event to store the bookmark which will fire when focus moves outside the editor
        if(AjxEnv.isIE){
            tinymce.dom.Event.add(ed.getDoc(), 'beforedeactivate', function(e) {
                if(ed.windowManager){
                    ed.windowManager.bookmark = ed.selection.getBookmark(1);
                }
            });
        }

		var ec = obj.getEditorContainer();
		ec.setFocusMember(ed.getWin());

		obj._editorInitialized = true;

        if (obj._onTinyMCEEditorInitcallback) {
		    obj._onTinyMCEEditorInitcallback.run();
        }
        obj._handlePopup(ed);
	};

	function onEditorKeyPress(ed, e) {
		return obj._handleEditorKeyEvent(e, ed);
	};

    function onGetContent(ed, o) {
        // Replace <p tags with <span tags
        // and </p with </span><br / tags
        //o.content = o.content.replace(/<p/g, '<span').replace(/<\/p/g, '</span><br /');
        //causing issue in dir attribute as it is not valid for span tag
    };

    function onPaste(ed, ev) {
        return obj.onPaste(ev, ed);
    };

    function onInsertImage(ev) {
        ZmSignatureEditor.prototype._insertImagesListener.apply(obj, ev);
    };

    function onToolbarToggle(ev) {
        return obj.onToolbarToggle();
    };

	var urlParts = AjxStringUtil.parseURL(location.href);

	//important: tinymce doesn't handle url parsing well when loaded from REST URL - override baseURL/baseURI to fix this
	tinymce.baseURL = ZmAdvancedHtmlEditor.TINY_MCE_PATH + "/";

	if (tinymce.EditorManager) {
		tinymce.EditorManager.baseURI = new tinymce.util.URI(urlParts.protocol + "://" + urlParts.authority + tinymce.baseURL);
	}

	if (tinymce.dom) {
		tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
	}

	if (tinymce.dom && tinymce.dom.Event) {
		tinymce.dom.Event.domLoaded = true;
	}

	var locale = appCtxt.get(ZmSetting.LOCALE_NAME);
    var contentCSS = appContextPath + "/css/editor.css?v=" + window.cacheKillerVersion;
	var editorCSS = appContextPath + "/css/editor_ui.css?v=" + window.cacheKillerVersion + "&skin=" + appCurrentSkin + "&locale=" + locale;

    var fonts = [];
	var KEYS = [ "fontFamilyIntl", "fontFamilyBase" ];
	var i, j, key, value, name;
	for (j = 0; j < KEYS.length; j++) {
		for (i = 1; value = AjxMsg[KEYS[j]+i+".css"]; i++) {
			if (value.match(/^#+$/)) break;
			value = value.replace(/,\s/g,",");
			name = AjxMsg[KEYS[j]+i+".display"];
			fonts.push(name+"="+value);
		}
	}

    var tinyMCEInitObj = {
        // General options
		mode :  (this._mode == DwtHtmlEditor.HTML)? "exact" : "none",
		elements:  id,
        plugins : "autolink,advlist,inlinepopups,table,paste,directionality,emotions,media",
		theme : "advanced",
        theme_advanced_buttons1 : "fontselect,fontsizeselect,forecolor,backcolor,|,bold,italic,underline,strikethrough,|,bullist,numlist,|,outdent,indent,|,justifyleft,justifycenter,justifyright,|,link,unlink,image",
        theme_advanced_buttons2 : "formatselect,undo,redo,|,pastetext,pasteword,|,tablecontrols,|,blockquote,hr,emotions,charmap,media,|,removeformat,code",
		theme_advanced_buttons3 : "",
		theme_advanced_buttons4 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_resizing : true,
        theme_advanced_fonts : fonts.join(";"),
		convert_urls : false,
		verify_html : false,
		gecko_spellcheck : true,
        content_css : contentCSS,
		editor_css: editorCSS,
        theme_advanced_runtime_fontsize:true,
        dialog_type : "modal",
        forced_root_block : 'div',
        width: "100%",
        table_default_cellpadding : 3,
        table_default_border: 1,
		setup : function(ed) {
			ed.onLoadContent.add(handleContentLoad);
            ed.onPostRender.add(onTinyMCEEditorPostRender);
			ed.onInit.add(onTinyMCEEditorInit);
			ed.onKeyPress.add(onEditorKeyPress);
            ed.onGetContent.add(onGetContent);
            ed.onPaste.add(onPaste);
            //Adding Insert image button for uploading the insert image for signature alone
            ed.addButton('zmimage', {
                title : ZmMsg.insertImage,
                "class" : "mce_ImgInsertImage",
                onclick : onInsertImage
            });
            //Adding toggle button for showing/hiding the extended toolbar
            ed.addButton('toggle', {
                title : ZmMsg.showExtendedToolbar,
                onclick : onToolbarToggle,
                "class" : "mce_toggle"
            });
		}
    }

    if( obj.isSignatureEditor ){
       tinyMCEInitObj.theme_advanced_buttons1 = tinyMCEInitObj.theme_advanced_buttons1 + ",zmimage";
    }
    if(appCtxt.get(ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS)){
        tinyMCEInitObj.theme_advanced_buttons1 = tinyMCEInitObj.theme_advanced_buttons1 + ",|,ltr,rtl";
    }
    tinyMCEInitObj.theme_advanced_buttons1 = tinyMCEInitObj.theme_advanced_buttons1 + ",|,toggle";
	if( this._mode === DwtHtmlEditor.HTML ){
        Dwt.setVisible(obj.getHtmlElement(), false);
    }
    else{
        Dwt.setVisible(obj.getHtmlElement(), true);
    }

	tinyMCE.init(tinyMCEInitObj);
	this._editor = this.getEditor();
	this._iFrameId = this._bodyTextAreaId + "_ifr";
};

ZmAdvancedHtmlEditor.prototype.onPaste = function(ev, ed) {
    if (ev.clipboardData) {
        var items = ev.clipboardData.items;
        if( items ){
            var blob = items[0].getAsFile();
            if( blob ){
                var req = new XMLHttpRequest();
                req.open("POST", appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw", true);
                req.setRequestHeader("Cache-Control", "no-cache");
                req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                req.setRequestHeader("Content-Type", blob.type);
                req.setRequestHeader("Content-Disposition", 'attachment; filename="' + blob.fileName + '"');//For paste from clipboard filename is undefined
                req.onreadystatechange = function(){
                    if(req.readyState === 4 && req.status === 200) {
                        var resp = eval("["+req.responseText+"]");
                        if(resp.length === 3) {
                            resp[2].clipboardPaste = true;
                            var curView = appCtxt.getAppViewMgr().getCurrentView();
                            curView.getController().saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, resp[2]);
                        }
                    }
                }
                req.send(blob);
            }
        }
    }
};

ZmAdvancedHtmlEditor.prototype.setMode =
function(mode, convert, convertor) {

    this.discardMisspelledWords();

	if (mode == this._mode || (mode != DwtHtmlEditor.HTML && mode != DwtHtmlEditor.TEXT)) {	return;	}

	this._mode = mode;
    if(!window.tinyMCE){
        return;
    }
	var editor = this.getEditor();
	if (mode == DwtHtmlEditor.HTML) {
		var textArea = this.getContentField();
		var content = convert ? AjxStringUtil.convertToHtml(textArea.value, true) : textArea.value;
		if (editor && editor.getDoc()) {
			var doc = editor.getDoc();
			doc.body.innerHTML = content;
			this._pendingContent = content;
			//important: tinymce expects html markup in textarea so it might treat email
			//address in <user1@testdomain.com> as tag
			textArea.value = "";
			this._editorContainer.setFocusMember(editor.getWin());
		} else {
			this._pendingContent = content;
		}
        if( !this._editorInitialized ){
            Dwt.setVisible(this.getHtmlElement(), false);
        }
		tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);
	} else {
		var textArea = this.getContentField();
		var doc = editor && editor.getDoc();
		var textContent = convert ? this._convertHtml2Text(convertor) : doc.innerHTML;

		tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);
		textArea.value = textContent;
		this._editorContainer.setFocusMember(textArea);
	}
    this.initDefaultDirection();
};

ZmAdvancedHtmlEditor.prototype.getContentField =
function() {
	return document.getElementById(this._bodyTextAreaId);
};

ZmAdvancedHtmlEditor.prototype.insertImage =
function(src, dontExecCommand, width, height, dfsrc) {

	var html = [];
	var idx= 0 ;

	html[idx++] = "<img";
	html[idx++] = " src='";
	html[idx++] = src;
	html[idx++] = "'";

    if ( dfsrc != null) {
        html[idx++] = " dfsrc='";
        html[idx++] = dfsrc;
	    html[idx++] = "'";
    }
	if (width != null) {
		html[idx++] = " width='" + width + "'";
	}
	if (height != null) {
		html[idx++] = " height='" + height + "'";
	}
	html[idx++] = ">";

	var ed = this.getEditor();

    if(ed.windowManager && ed.windowManager.bookmark){
        ed.selection.moveToBookmark(ed.windowManager.bookmark);
    }
	// Fixes crash in Safari
	if (tinymce.isWebKit) {
		ed.getWin().focus();
	}

	//tinymce modifies the source when using mceInsertContent
    //ed.execCommand('mceInsertContent', false, html.join(""), {skip_undo : 1});
    ed.execCommand('mceInsertRawHTML', false, html.join(""), {skip_undo : 1});
};

ZmAdvancedHtmlEditor.prototype.replaceImage =
function(id, src){
    var doc = this.getEditor().getDoc();
    if(doc){
        var img = doc.getElementById(id);
        if(img){
            img.src = src;
            img.removeAttribute("id");
        }
    }
};

ZmAdvancedHtmlEditor.prototype.initDefaultFontSize =
function(editor) {
	var doc = editor && editor.getDoc();
	if (doc) {
		doc.body.style.fontFamily = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
		doc.body.style.fontSize = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
		doc.body.style.color = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
	}
};

ZmAdvancedHtmlEditor.prototype.initDefaultDirection =
function() {
    if( this._mode === DwtHtmlEditor.HTML ){
        var doc = this._getIframeDoc();
        if (doc){
            //Dont use css for direction Refer : http://www.w3.org/International/questions/qa-bidi-css-markup
            if( appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL ){
                if(doc.body.dir !== ZmSetting.RTL){
                    doc.body.dir = ZmSetting.RTL;
                }
            }
            else{
                doc.body.removeAttribute("dir");
            }
        }
    }
    else{
        var textArea = this.getContentField();
        if( appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL ){
            if(textArea.getAttribute("dir") !== ZmSetting.RTL){
                textArea.setAttribute("dir", ZmSetting.RTL);
            }
        }
        else{
            textArea.removeAttribute("dir");
        }
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
	if (doc) {
		this.insertDefaultCSS(doc, selectorText, ruleText);
	}
};

ZmAdvancedHtmlEditor.prototype.insertDefaultCSS =
function(doc, selectorText, ruleText) {
	var sheet, styleElement;
	if (doc.createStyleSheet) {
		sheet = doc.createStyleSheet();
	} else {
		styleElement = doc.createElement("style");
		doc.getElementsByTagName("head")[0].appendChild(styleElement);
		sheet = styleElement.styleSheet ? styleElement.styleSheet : styleElement.sheet;
	}

	if (!sheet && styleElement) {
		//remove braces
		ruleText = ruleText.replace(/^\{?([^\}])/, "$1");
		styleElement.innerHTML = selectorText + ruleText;
	} else if (sheet.addRule) {
		//remove braces
		ruleText = ruleText.replace(/^\{?([^\}])/, "$1");
		DBG.println("ruleText:" + ruleText + ",selector:" + selectorText);
		sheet.addRule(selectorText, ruleText);
	} else if (sheet.insertRule) {
		//need braces
		if (!/^\{[^\}]*\}$/.test(ruleText)) ruleText = "{" + ruleText + "}";
		sheet.insertRule(selectorText + " " + ruleText, sheet.cssRules.length);
	}
};

ZmAdvancedHtmlEditor.prototype.resetSpellCheck =
function() {
	//todo: remove this when spellcheck is disabled
	this.discardMisspelledWords();
	this._spellCheckHideModeDiv();
};

/**SpellCheck modules**/

ZmAdvancedHtmlEditor.prototype.checkMisspelledWords =
function(callback, onExitCallback, errCallback){
	var text = this.getTextVersion();
	if (/\S/.test(text)) {
		AjxDispatcher.require("Extras");
		this._spellChecker = new ZmSpellChecker(this);
		this._spellCheck = null;
		this._spellCheckSuggestionListenerObj = new AjxListener(this, this._spellCheckSuggestionListener);
		if (!this.onExitSpellChecker) {
			this.onExitSpellChecker = onExitCallback;
		}
		var params = {
			text: text,
			ignore: AjxUtil.keys(this._ignoreWords).join()
		};
		this._spellChecker.check(params, callback, errCallback);
		return true;
	}

	return false;
};

ZmAdvancedHtmlEditor.prototype.spellCheck =
function(callback) {
	var text = this.getTextVersion();

	if (/\S/.test(text)) {
		AjxDispatcher.require("Extras");
		this._spellChecker = new ZmSpellChecker(this);
		this._spellCheck = null;
		this._spellCheckSuggestionListenerObj = new AjxListener(this, this._spellCheckSuggestionListener);
		if (!this.onExitSpellChecker) {
			this.onExitSpellChecker = callback;
		}
        var params = {
			text: text,
			ignore: AjxUtil.keys(this._ignoreWords).join()
		};
		this._spellChecker.check(params, new AjxCallback(this, this._spellCheckCallback));
		return true;
	}

	return false;
};

ZmAdvancedHtmlEditor.prototype._spellCheckCallback =
function(words) {
	var wordsFound = false;

	if (words && words.available) {
		var misspelled = words.misspelled;
		if (misspelled == null || misspelled.length == 0) {
			appCtxt.setStatusMsg(ZmMsg.noMisspellingsFound, ZmStatusView.LEVEL_INFO);
		} else {
			var msg = AjxMessageFormat.format(ZmMsg.misspellingsResult, misspelled.length);
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);

			this.highlightMisspelledWords(misspelled);
			wordsFound = true;
		}
	} else {
		appCtxt.setStatusMsg(ZmMsg.spellCheckUnavailable, ZmStatusView.LEVEL_CRITICAL);
	}

	if (AjxEnv.isGeckoBased && this._mode == DwtHtmlEditor.HTML) {
		setTimeout(AjxCallback.simpleClosure(this.focus, this), 10);
	}

	if (this.onExitSpellChecker) {
		this.onExitSpellChecker.run(wordsFound);
	}
};

ZmAdvancedHtmlEditor.prototype._spellCheckSuggestionListener =
function(ev) {
	var self = this;
	var item = ev.item;
	var orig = item.getData("orig");
	if (!orig) { return; }

	var val = item.getData(ZmHtmlEditor._VALUE);
	var plainText = this._mode == DwtHtmlEditor.TEXT;
	var fixall = item.getData("fixall");
	var doc = plainText ? document : this._getIframeDoc();
	var span = doc.getElementById(item.getData("spanId"));
	var action = item.getData(ZmPopupMenu.MENU_ITEM_ID_KEY);
	switch (action) {
		case "ignore":
			val = orig;
			this._ignoreWords[val] = true;
			if (fixall) {
				// TODO: visually "correct" all of them
			}
			break;
		case "add":
			val = orig;
			// add word to user's personal dictionary
			var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
			var prefEl = soapDoc.set("pref", val);
			prefEl.setAttribute("name", "+zimbraPrefSpellIgnoreWord");
			var params = {
				soapDoc: soapDoc,
				asyncMode: true,
				callback: new AjxCallback(appCtxt, appCtxt.setStatusMsg, [ZmMsg.wordAddedToDictionary])
			};
			appCtxt.getAppController().sendRequest(params);
			this._ignoreWords[val] = true;
			break;
		default: break;
	}

	if (plainText && val == null) {
		this._editWord(fixall, span);
	}
	else {
		var spanEls = fixall ? this._spellCheck.wordIds[orig] : span;
		this._editWordFix(spanEls, val);
	}
    
	this._handleSpellCheckerEvents(null);
};

ZmAdvancedHtmlEditor.prototype._getEditorDocument = function() {
	var plainText = this._mode == DwtHtmlEditor.TEXT;
	return plainText ? document : this._getIframeDoc();
};

ZmAdvancedHtmlEditor.prototype._editWord = function(fixall, spanEl) {
	// edit clicked
	var doc = this._getEditorDocument();
	var input = doc.createElement("input");
	input.type = "text";
	input.value = AjxUtil.getInnerText(spanEl);
	input.className = "SpellCheckInputField";
	input.style.left = spanEl.offsetLeft - 2 + "px";
	input.style.top = spanEl.offsetTop - 2 + "px";
	input.style.width = spanEl.offsetWidth + 4 + "px";
	var div = doc.getElementById(this._spellCheckDivId);
	var scrollTop = div.scrollTop;
	div.appendChild(input);
	div.scrollTop = scrollTop; // this gets resetted when we add an input field (at least Gecko)
	input.setAttribute("autocomplete", "off");
	input.focus();
	if (!AjxEnv.isGeckoBased)
		input.select();
	else
		input.setSelectionRange(0, input.value.length);
	var inputListener = AjxCallback.simpleClosure(this._editWordHandler, this, fixall, spanEl);
	input.onblur = inputListener;
	input.onkeydown = inputListener;
};

ZmAdvancedHtmlEditor.prototype._editWordHandler = function(fixall, spanEl, ev) {
	// the event gets lost after 20 milliseconds so we need
	// to save the following :(
	setTimeout(AjxCallback.simpleClosure(this._editWordHandler2, this, fixall, spanEl, ev), 20);
};
ZmAdvancedHtmlEditor.prototype._editWordHandler2 = function(fixall, spanEl, ev) {
	ev = DwtUiEvent.getEvent(ev);
	var evType = ev.type;
	var evKeyCode = ev.keyCode;
	var evCtrlKey = ev.ctrlKey;
	var input = DwtUiEvent.getTarget(ev);
	var keyEvent = /key/.test(evType);
	var removeInput = true;
	if (/blur/.test(evType) || (keyEvent && evKeyCode == 13)) {
		if (evCtrlKey)
			fixall =! fixall;
		var orig = AjxUtil.getInnerText(spanEl);
		var spanEls = fixall ? this._spellCheck.wordIds[orig] : spanEl;
		this._editWordFix(spanEls, input.value);
	} else if (keyEvent && evKeyCode == 27 /* ESC */) {
		this._editWordFix(spanEl, AjxUtil.getInnerText(spanEl));
	} else {
		removeInput = false;
	}
	if (removeInput) {
		input.onblur = null;
		input.onkeydown = null;
		if (input.parentNode) {
			input.parentNode.removeChild(input);
		}
	}
	this._handleSpellCheckerEvents(null);
};

ZmAdvancedHtmlEditor.prototype._editWordFix = function(spanEls, value) {
	spanEls = spanEls instanceof Array ? spanEls : [ spanEls ];
	var doc = this._getEditorDocument();
	for (var i = spanEls.length - 1; i >= 0; i--) {
		var spanEl = spanEls[i];
		if (typeof spanEl == "string") {
			spanEl = doc.getElementById(spanEl);
		}
		if (spanEl) {
			spanEl.innerHTML = value;
		}
	}
};

ZmAdvancedHtmlEditor.prototype._getParentElement =
function() {
	var ed = this.getEditor();
	if (ed.selection) {
		return ed.selection.getNode();
	} else {
		var doc = this._getIframeDoc();
		return doc ? doc.body : null;
	}
};

ZmAdvancedHtmlEditor.prototype._handleSpellCheckerEvents =
function(ev) {
	var plainText = this._mode == DwtHtmlEditor.TEXT;
	var p = plainText ? (ev ? DwtUiEvent.getTarget(ev) : null) : this._getParentElement(),
		span, ids, i, suggestions,
		self = this,
		sc = this._spellCheck,
		doc = plainText ? document : this._getIframeDoc(),
		modified = false,
		word = "";
	if (ev && /^span$/i.test(p.tagName) && /ZM-SPELLCHECK/.test(p.className)) {
		// stuff.
		word = p.getAttribute("word");
		// FIXME: not sure this is OK.
		window.status = "Suggestions: " + sc.suggestions[word].join(", ");
		modified = word != AjxUtil.getInnerText(p);
	}

	// <FIXME: there's plenty of room for optimization here>
	ids = sc.spanIds;
	for (i in ids) {
		span = doc.getElementById(i);
		if (span) {
			if (ids[i] != AjxUtil.getInnerText(span) || this._ignoreWords[ids[i]])
				span.className = "ZM-SPELLCHECK-FIXED";
			else if (ids[i] == word)
				span.className = "ZM-SPELLCHECK-MISSPELLED2";
			else
				span.className = "ZM-SPELLCHECK-MISSPELLED";
		}
	}
	// </FIXME>

	// Dismiss the menu if it is present AND:
	//   - we have no event, OR
	//   - it's a mouse(down|up) event, OR
	//   - it's a KEY event AND there's no word under the caret, OR the word was modified.
	// I know, it's ugly.
	if (sc.menu &&
		(!ev || ( /click|mousedown|mouseup|contextmenu/.test(ev.type)
			  || ( /key/.test(ev.type)
			   && (!word || modified) )
			)))
	{
		//sc.menu._doPopdown();
		// FIXME: menu.dispose() should remove any submenus that may be
		//        present in its children; fix should go directly in DwtMenu.js
		if (sc.menu._menuItems.fixall)
			sc.menu._menuItems.fixall.getMenu().dispose();
		sc.menu.dispose();
		sc.menu = null;
		window.status = "";
	}
	// but that's even uglier:
	if (ev && word && (suggestions = sc.suggestions[word]) &&
		(/mouseup|contextmenu/i.test(ev.type) ||
		 (plainText && /(click|mousedown|contextmenu)/i.test(ev.type))) && 
		(word == AjxUtil.getInnerText(p) && !this._ignoreWords[word]))
	{
		sc.menu = this._spellCheckCreateMenu(this.getParent(), 0, suggestions, word, p.id, modified);
		if (sc.wordIds[word].length > 1) {
			sc.menu.createSeparator();
			this._replaceAllFormatter = this._replaceAllFormatter || new AjxMessageFormat(ZmMsg.replaceAllMenu);
			var text = this._replaceAllFormatter.format(sc.wordIds[word].length);
			var item = sc.menu.createMenuItem("fixall", {text:text});
			item.setMenu(makeMenu(1, item));
		}
		var pos, ms = sc.menu.getSize(), ws = this._editorContainer.shell.getSize();
		if (!plainText) {
			// bug fix #5857 - use Dwt.toWindow instead of Dwt.getLocation so we can turn off dontIncScrollTop
			pos = Dwt.toWindow(document.getElementById(this._iFrameId), 0, 0, null, true);
			var pos2 = Dwt.toWindow(p, 0, 0, null, true);
			pos.x += pos2.x
				- (doc.documentElement.scrollLeft || doc.body.scrollLeft);
			pos.y += pos2.y
				- (doc.documentElement.scrollTop || doc.body.scrollTop);
		} else {
			// bug fix #5857
			pos = Dwt.toWindow(p, 0, 0, null, true);
			var div = document.getElementById(this._spellCheckDivId);
			pos.x -= div.scrollLeft;
			pos.y -= div.scrollTop;
		}
		pos.y += p.offsetHeight;
		// let's make sure we look nice, shall we.
		if (pos.y + ms.y > ws.y)
			pos.y -= ms.y + p.offsetHeight;
		sc.menu.popup(0, pos.x, pos.y);
		ev._stopPropagation = true;
		ev._returnValue = false;
	}
};

ZmAdvancedHtmlEditor.prototype._spellCheckCreateMenu = function(parent, fixall, suggestions, word, spanId, modified) {
    
	var menu = new ZmPopupMenu(parent);
//	menu.dontStealFocus();

	if (modified) {
		var txt = "<b>" + word + "</b>";
		this._spellCheckCreateMenuItem(menu, "orig", {text:txt}, fixall, word, word, spanId);
	}

	if (suggestions.length > 0) {
		for (var i = 0; i < suggestions.length; ++i) {
			this._spellCheckCreateMenuItem(
				menu, "sug-"+i, {text:suggestions[i], className: ""},
				fixall, suggestions[i], word, spanId
			);
		}
		if (!(parent instanceof DwtMenuItem) && this._spellCheck.wordIds[word].length > 1) {
			if (!this._replaceAllFormatter) {
				this._replaceAllFormatter = new AjxMessageFormat(ZmMsg.replaceAllMenu);
			}
			var txt = "<i>"+this._replaceAllFormatter.format(this._spellCheck.wordIds[word].length)+"</i>";
			var item = menu.createMenuItem("fixall", {text:txt});
			var submenu = this._spellCheckCreateMenu(item, 1, suggestions, word, spanId, modified);
			item.setMenu(submenu);
		}
	}
	else {
		var item = this._spellCheckCreateMenuItem(menu, "noop", {text:ZmMsg.noSuggestions}, fixall, "", word, spanId);
		item.setEnabled(false);
		this._spellCheckCreateMenuItem(menu, "clear", {text:"<i>"+ZmMsg.clearText+"</i>" }, fixall, "", word, spanId);
	}

	menu.createSeparator();

	var plainText = this._mode == DwtHtmlEditor.TEXT;
	if (plainText) {
		// in plain text mode we want to be able to edit misspelled words
		var txt = fixall ? ZmMsg.editAll : ZmMsg.edit;
		this._spellCheckCreateMenuItem(menu, "edit", {text:txt}, fixall, null, word, spanId);
	}

	if (!fixall) {
		this._spellCheckCreateMenuItem(menu, "ignore", {text:ZmMsg.ignoreWord}, 0, null, word, spanId);
//		this._spellCheckCreateMenuItem(menu, "ignore", {text:ZmMsg.ignoreWordAll}, 1, null, word, spanId);
	}

	if (!fixall && appCtxt.get(ZmSetting.SPELL_CHECK_ADD_WORD_ENABLED)) {
		this._spellCheckCreateMenuItem(menu, "add", {text:ZmMsg.addWord}, fixall, null, word, spanId);
	}

	return menu;
};

ZmAdvancedHtmlEditor.prototype._spellCheckCreateMenuItem =
function(menu, id, params, fixall, value, word, spanId, listener) {
	if (params.className == null) {
		params.className = "ZMenuItem ZmSpellMenuItem";
	}
	var item = menu.createMenuItem(id, params);
	item.setData("fixall", fixall);
	item.setData("value", value);
	item.setData("orig", word);
	item.setData("spanId", spanId);
	item.addSelectionListener(listener || this._spellCheckSuggestionListenerObj);
	return item;
};

ZmAdvancedHtmlEditor.prototype.discardMisspelledWords =
function(keepModeDiv) {
	if (!this._spellCheck) { return; }

	if (this._mode == DwtHtmlEditor.HTML) {
		var doc = this._getIframeDoc();
		doc.body.style.display = "none";

		var p = null;
		var spanIds = this._spellCheck.spanIds;
		for (var i in spanIds) {
			var span = doc.getElementById(i);
			if (!span) continue;

			p = span.parentNode;
			while (span.firstChild) {
				p.insertBefore(span.firstChild, span);
			}
			p.removeChild(span);
		}

		if (!AjxEnv.isIE) {
			doc.body.normalize(); // IE crashes here.
		} else {
			doc.body.innerHTML = doc.body.innerHTML; // WTF.
		}

		// remove the spell check styles
		p = doc.getElementById("ZM-SPELLCHECK-STYLE");
		if (p) {
			p.parentNode.removeChild(p);
		}

		doc.body.style.display = "";
		this._unregisterEditorEventHandler(doc, "contextmenu");

	} else if (this._spellCheckDivId != null) {
		var div = document.getElementById(this._spellCheckDivId);
		var scrollTop = div.scrollTop;
		var textArea = document.getElementById(this._textAreaId);
		// bug: 41760 - HACK. Convert the nbsps back to spaces since Gecko seems
		// to return control characters for HTML entities.
		if (AjxEnv.isGeckoBased) {
			div.innerHTML = AjxStringUtil.htmlDecode(div.innerHTML, true);
		}
		textArea.value = AjxUtil.getInnerText(div);

		// avoid mem. leaks, hopefully
		div.onclick = null;
		div.oncontextmenu = null;
		div.onmousedown = null;
		div.parentNode.removeChild(div);
		textArea.style.display = "";
		textArea.scrollTop = scrollTop;
	}

	this._spellCheckDivId = this._spellCheck = null;
	window.status = "";

	if (!keepModeDiv) {
		this._spellCheckHideModeDiv();
	}

	if (this.onExitSpellChecker) {
		this.onExitSpellChecker.run();
	}
};

ZmAdvancedHtmlEditor.prototype._spellCheckShowModeDiv =
function() {
	var size = this._editorContainer.getSize();

	if (!this._spellCheckModeDivId) {
		var div = document.createElement("div");
		div.className = "SpellCheckModeDiv";
		div.id = this._spellCheckModeDivId = Dwt.getNextId();
		var html = new Array();
		var i = 0;
		html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td style='width:25'>";
		html[i++] = AjxImg.getImageHtml("SpellCheck");
		html[i++] = "</td><td style='white-space:nowrap'><span class='SpellCheckLink'>";
		html[i++] = ZmMsg.resumeEditing;
		html[i++] = "</span> | <span class='SpellCheckLink'>";
		html[i++] = ZmMsg.checkAgain;
		html[i++] = "</span></td></tr></table>";
		div.innerHTML = html.join("");

		//var editable = document.getElementById((this._spellCheckDivId || this.getBodyFieldId()));
		//editable.parentNode.insertBefore(div, editable);
		var container = this._editorContainer.getHtmlElement();
		container.insertBefore(div, container.firstChild);

		var el = div.getElementsByTagName("span");
		Dwt.associateElementWithObject(el[0], this);
		Dwt.setHandler(el[0], "onclick", ZmAdvancedHtmlEditor._spellCheckResumeEditing);
		Dwt.associateElementWithObject(el[1], this);
		Dwt.setHandler(el[1], "onclick", ZmAdvancedHtmlEditor._spellCheckAgain);
	}
	else {
		document.getElementById(this._spellCheckModeDivId).style.display = "";
	}
	this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 2));
};

ZmAdvancedHtmlEditor._spellCheckResumeEditing =
function() {
	var editor = Dwt.getObjectFromElement(this);
	editor.discardMisspelledWords();
};

ZmAdvancedHtmlEditor._spellCheckAgain =
function() {
	var editor = Dwt.getObjectFromElement(this);
	editor.discardMisspelledWords();
	editor.spellCheck();
};


ZmAdvancedHtmlEditor.prototype._spellCheckHideModeDiv =
function() {
	var size = this._editorContainer.getSize();
	if (this._spellCheckModeDivId) {
		document.getElementById(this._spellCheckModeDivId).style.display = "none";
	}
	this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 2));
};

ZmAdvancedHtmlEditor.prototype.highlightMisspelledWords =
function(words, keepModeDiv) {
	this.discardMisspelledWords(keepModeDiv);

	var word, style, doc, body, self = this,
		spanIds     = {},
		wordIds     = {},
		regexp      = [ "([^A-Za-z0-9']|^)(" ],
		suggestions = {};

	// preparations: initialize some variables that we then save in
	// this._spellCheck (the current spell checker context).
	for (var i = 0; i < words.length; ++i) {
		word = words[i].word;
		if (!suggestions[word]) {
			i && regexp.push("|");
			regexp.push(word);
			var a = words[i].suggestions.split(/\s*,\s*/);
			if (!a[a.length-1])
				a.pop();
			suggestions[word] = a;
			if (suggestions[word].length > 5)
				suggestions[word].length = 5;
		}
	}
	regexp.push(")([^A-Za-z0-9']|$)");
	regexp = new RegExp(regexp.join(""), "gm");

	function hiliteWords(text, textWhiteSpace) {
		text = textWhiteSpace
			? AjxStringUtil.convertToHtml(text)
			: AjxStringUtil.htmlEncode(text);

		var m;

		regexp.lastIndex = 0;
		while (m = regexp.exec(text)) {
			var str = m[0];
			var prefix = m[1];
			var word = m[2];
			var suffix = m[3];

			var id = Dwt.getNextId();
			spanIds[id] = word;
			if (!wordIds[word])
				wordIds[word] = [];
			wordIds[word].push(id);

			var repl = [
				prefix,
				'<span word="',
				word, '" id="', id, '" class="ZM-SPELLCHECK-MISSPELLED">',
				word, '</span>',
				suffix
				].join("");
			text = [
				text.substr(0, m.index),
				repl,
				text.substr(m.index + str.length)
			].join("");

			// All this crap necessary because the suffix
			// must be taken into account at the next
			// match and JS regexps don't have look-ahead
			// constructs (except \b, which sucks).  Oh well.
			regexp.lastIndex = m.index + repl.length - suffix.length;
		}
		return text;
	};

	var doc;

	// having the data, this function will parse the DOM and replace
	// occurrences of the misspelled words with <span
	// class="ZM-SPELLCHECK-MISSPELLED">word</span>
	rec = function(node) {
		switch (node.nodeType) {
			case 1: /* ELEMENT */
				for (var i = node.firstChild; i; i = rec(i));
				node = node.nextSibling;
				break;
			case 3: /* TEXT */
				if (!/[^\s\xA0]/.test(node.data)) {
					node = node.nextSibling;
					break;
				}
				// for correct handling of whitespace we should
				// not mess ourselves with leading/trailing
				// whitespace, thus we save it in 2 text nodes.
				var a = null, b = null;

				var result = /^[\s\xA0]+/.exec(node.data);
				if (result) {
					// a will contain the leading space
					a = node;
					node = node.splitText(result[0].length);
				}
				result = /[\s\xA0]+$/.exec(node.data);
				if (result) {
					// and b will contain the trailing space
					b = node.splitText(node.data.length - result[0].length);
				}

				var text = hiliteWords(node.data, false);
				text = text.replace(/^ +/, "&nbsp;").replace(/ +$/, "&nbsp;");
				var div = doc.createElement("div");
				div.innerHTML = text;

				// restore whitespace now
				if (a) {
					div.insertBefore(a, div.firstChild);
				}
				if (b) {
					div.appendChild(b);
				}

				var p = node.parentNode;
				while (div.firstChild) {
					p.insertBefore(div.firstChild, node);
				}
				div = node.nextSibling;
				p.removeChild(node);
				node = div;
				break;
			default :
				node = node.nextSibling;
		}
		return node;
	};

	if (this._mode == DwtHtmlEditor.HTML) {
		// HTML mode; See the "else" branch for the TEXT mode--code differs
		// quite a lot.  We should probably implement separate functions as
		// this already becomes long.

		doc = this._getIframeDoc();
		body = doc.body;

		// load the spell check styles, if not already there.
		this._loadExternalStyle("/css/spellcheck.css");

		body.style.display = "none";	// seems to have a good impact on speed,
										// since we may modify a lot of the DOM
		if (!AjxEnv.isIE) {
			body.normalize();
		} else {
			body.innerHTML = body.innerHTML;
		}
		rec(body);
		if (!AjxEnv.isIE) {
			body.normalize();
		} else {
			body.innerHTML = body.innerHTML;
		}
		body.style.display = ""; // redisplay the body

		var ed = this.getEditor();
		ed.onContextMenu.add(this._handleEditorEvent, this);
		ed.onMouseUp.add(this._handleEditorEvent, this);

		//this._registerEditorEventHandler(doc, "contextmenu");
	}
	else { // TEXT mode
		var textArea = document.getElementById(this._textAreaId);
		var scrollTop = textArea.scrollTop;
		var size = Dwt.getSize(textArea);
		textArea.style.display = "none";
		var div = document.createElement("div");
		div.className = "TextSpellChecker";
		this._spellCheckDivId = div.id = Dwt.getNextId();
		div.style.overflow = "auto";
		if (!AjxEnv.isIE) {
			// FIXME: we substract borders/padding here.  this sucks.
			size.x -= 4;
			size.y -= 6;
		}
		div.style.width = size.x + "px";
		div.style.height = size.y + "px";

		div.innerHTML = AjxStringUtil.convertToHtml(this.getContent());
		doc = document;
		rec(div);

		textArea.parentNode.insertBefore(div, textArea);
		div.scrollTop = scrollTop;
		div.oncontextmenu = div.onclick
			= function(ev) { self._handleSpellCheckerEvents(ev || window.event); };
	}

	this._spellCheckShowModeDiv();

	// save the spell checker context
	this._spellCheck = {
		suggestions: suggestions,
		spanIds: spanIds,
		wordIds: wordIds
	};
};

ZmAdvancedHtmlEditor.prototype._loadExternalStyle =
function(path) {
	var doc = this._getIframeDoc();
	// check if already loaded
	var style = doc.getElementById(path);
	if (!style) {
		style = doc.createElement("link");
		style.id = path;
		style.rel = "stylesheet";
		style.type = "text/css";
		var style_url = appContextPath + path + "?v=" + cacheKillerVersion;
		if (AjxEnv.isGeckoBased || AjxEnv.isSafari) {
			style_url = document.baseURI.replace(
					/^(https?:\x2f\x2f[^\x2f]+).*$/, "$1") + style_url;
		}
		style.href = style_url;
		var head = doc.getElementsByTagName("head")[0];
		if (!head) {
			head = doc.createElement("head");
			var docEl = doc.documentElement;
			if (docEl) {
				docEl.insertBefore(head, docEl.firstChild);
			}
		}
		head.appendChild(style);
	}
};

ZmAdvancedHtmlEditor.prototype._registerEditorEventHandler =
function(iFrameDoc, name) {
	if (AjxEnv.isIE) {
		iFrameDoc.attachEvent("on" + name, this.__eventClosure);
	} else {
		iFrameDoc.addEventListener(name, this.__eventClosure, true);
	}
};

ZmAdvancedHtmlEditor.prototype._unregisterEditorEventHandler =
function(iFrameDoc, name) {
	if (AjxEnv.isIE) {
		iFrameDoc.detachEvent("on" + name, this.__eventClosure);
	} else {
		iFrameDoc.removeEventListener(name, this.__eventClosure, true);
	}
};

ZmAdvancedHtmlEditor.prototype.__eventClosure =
function(ev) {
	this._handleEditorEvent(AjxEnv.isIE ? this._getIframeWin().event : ev);
	return tinymce.dom.Event.cancel(ev);
};


ZmAdvancedHtmlEditor.prototype._handleEditorEvent =
function(ed, ev) {
	var retVal = true;

	if (ev.type == "contextmenu") {
		// context menu event; we want to translate the event
		// coordinates from iframe to parent document coords,
		// before notifying listeners.
		var mouseEv = DwtShell.mouseEvent;
		mouseEv.setFromDhtmlEvent(ev);
		var pos = Dwt.getLocation(document.getElementById(this._iFrameId));
		if (!AjxEnv.isIE) {
			var doc = this._getIframeDoc();
			var sl = doc.documentElement.scrollLeft || doc.body.scrollLeft;
			var st = doc.documentElement.scrollTop || doc.body.scrollTop;
			pos.x -= sl;
			pos.y -= st;
		}
		mouseEv.docX += pos.x;
		mouseEv.docY += pos.y;
		DwtControl.__mouseEvent(ev, DwtEvent.ONCONTEXTMENU, this, mouseEv);
		retVal = mouseEv._returnValue;
	}


	var self = this;
	if (this._spellCheck) {
		var dw;
		// This probably sucks.
		if (/mouse|context|click|select/i.test(ev.type)) {
			dw = new DwtMouseEvent(true);
		} else {
			dw = new DwtUiEvent(true);
		}
		dw.setFromDhtmlEvent(ev);
		this._TIMER_spell = setTimeout(function() {
			self._handleSpellCheckerEvents(dw);
			this._TIMER_spell = null;
		}, 100);
		return tinymce.dom.Event.cancel(ev);
	}

	return retVal;
};

ZmAdvancedHtmlEditor.prototype._getSelection =
function() {
	if (AjxEnv.isIE) {
		return this._getIframeDoc().selection;
	} else {
		return this._getIframeWin().getSelection();
	}
};

ZmAdvancedHtmlEditor.prototype.getHtmlElement =
function() {
    return this._editorContainer.getHtmlElement();
};

/*
 * Returns toolbar row of tinymce
 *
 *  @param {Number}	Toolbar Row Number 1,2
 *  @return	{Toolbar HTML Element}
 */
ZmAdvancedHtmlEditor.prototype.getToolbar =
function( number ) {
    var editor = this.getEditor();
    if( editor && editor.controlManager ){
        var toolbar = editor.controlManager.get("toolbar"+number);
        if( toolbar && toolbar.id ){
            return document.getElementById( toolbar.id );
        }
    }
};

/*
 *  Returns toolbar button of tinymce
 *
 *  @param {String}	button name
 *  @return	{Toolbar Button HTML Element}
 */
ZmAdvancedHtmlEditor.prototype.getToolbarButton =
function( buttonName ) {
    var editor = this.getEditor();
    if( editor && editor.controlManager ){
        var toolbarButton = editor.controlManager.get(buttonName);
        if( toolbarButton && toolbarButton.id ){
            return document.getElementById( toolbarButton.id );
        }
    }
};

ZmAdvancedHtmlEditor.prototype.onToolbarToggle =
function() {
    var iframeStyle = this.getBodyField().style;
    var toolbar = this.getToolbar("2");
    var toggleButton = this.getToolbarButton("toggle");
    if(toolbar && toggleButton ){
        if( toolbar.style.display === Dwt.DISPLAY_NONE ){
            toggleButton.title = ZmMsg.hideExtendedToolbar;
            Dwt.setInnerHtml(toggleButton.firstChild, ZmMsg.lessToolbar);
            Dwt.show(toolbar);
            iframeStyle.height = parseInt( iframeStyle.height ) - 26 + "px";
        }
        else{
            toggleButton.title = ZmMsg.showExtendedToolbar;
            Dwt.setInnerHtml(toggleButton.firstChild, ZmMsg.moreToolbar);
            Dwt.hide(toolbar);
            iframeStyle.height = parseInt( iframeStyle.height ) + 26 + "px";
        }
    }
};

/*
 *  Inserting image for signature
 */
ZmAdvancedHtmlEditor.prototype.insertImageDoc =
function(file) {
    var src = file.rest;
    if (!src) { return; }
    var path = appCtxt.get(ZmSetting.REST_URL) + ZmFolder.SEP;
    var dfsrc = file.docpath;
    if (dfsrc && dfsrc.indexOf("doc:") == 0) {
        var url = [path, dfsrc.substring(4)].join('');
        src = AjxStringUtil.fixCrossDomainReference(url);
    }
    this.insertImage(src, null, null, null, dfsrc);
};

/*
 *  Signature Insert image callback
 */
ZmAdvancedHtmlEditor.prototype._imageUploaded =
function() {
    ZmSignatureEditor.prototype._imageUploaded.apply(this, arguments);
};

/*
 * Modifies popup dialog after rendering
 */
ZmAdvancedHtmlEditor.prototype._handlePopup =
function(ed) {
    var popupIframeLoad = function(popupWindow){
        var doc = popupWindow.document;
        if( doc ){
            if( popupWindow.action === "insert" ){  //Insert Table dialog
                var style = doc.getElementById("style");
                var align = doc.getElementById("align");
                var width = doc.getElementById("width");
                style && (style.value = "border-collapse:collapse;");
                align && (align.value = "center");
                width && (width.value = "90%");
            }
        }
    };

    ed.windowManager.onOpen.add(function(windowManager, popupWindow) {
        if( !popupWindow ){
            return;
        }
        var popupIframe = popupWindow.frameElement;
        if( popupIframe ){
            if( popupIframe.attachEvent ){
                 popupIframe.attachEvent("onload", function(){
                    popupIframeLoad( popupWindow );
                 });
            }
            else{
                popupIframe.onload = function(){
                    popupIframeLoad( popupWindow );
                };
            }
        }
    });
};

ZmEditorContainer = function(params) {
	if (arguments.length == 0) { return; }
	params = Dwt.getParams(arguments, ZmEditorContainer.PARAMS);

	DwtComposite.call(this, params);
};

ZmEditorContainer.PARAMS = ["parent", "className", "posStyle", "content", "mode", "blankIframeSrc"];

ZmEditorContainer.prototype = new DwtComposite();
ZmEditorContainer.prototype.constructor = ZmEditorContainer;

ZmEditorContainer.prototype.setFocusMember =
function(member) {
	this._focusMember = member;
};

ZmEditorContainer.prototype._focus =
function() {
	if(this._focusMember) this._focusMember.focus();
};
