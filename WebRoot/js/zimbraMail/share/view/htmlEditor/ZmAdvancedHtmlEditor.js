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
    var settings = appCtxt.getSettings();
    var listener = new AjxListener(this, this._settingChangeListener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_COLOR).addChangeListener(listener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_FAMILY).addChangeListener(listener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_SIZE).addChangeListener(listener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_DIRECTION).addChangeListener(listener);
    settings.getSetting(ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS).addChangeListener(listener);
};

ZmAdvancedHtmlEditor.prototype.isZmAdvancedHtmlEditor = true;
ZmAdvancedHtmlEditor.prototype.isInputControl = true;
ZmAdvancedHtmlEditor.prototype.toString = function() { return "ZmAdvancedHtmlEditor"; };

ZmAdvancedHtmlEditor.TINY_MCE_PATH = "/js/ajax/3rdparty/tinymce";
ZmAdvancedHtmlEditor.DELTA_HEIGHT = 6;
ZmAdvancedHtmlEditor.LOCALE = "en";

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

ZmAdvancedHtmlEditor.prototype.setSize =
function(x, y) {
    var div,
        bodyField;

    if (!y) {
        return;
    }

    div = this._spellCheckDivId && document.getElementById(this._spellCheckDivId);
    bodyField = this.getBodyField();  //textarea or editor iframe

    if (y === Dwt.CLEAR) {
        bodyField.style.height = null;
        if (div) div.style.height = null;
    } else if (y === Dwt.DEFAULT) {
        bodyField.style.height = "auto";
        if (div) div.style.height = "auto";
    } else if (typeof(y) === "number" && !isNaN(y)) {
        //Subtracting editor toolbar height
        if (bodyField.nodeName.toLowerCase() === "iframe") {
            y = y - 28;
            var secondToolbarRow = this.getToolbar("2");
            if (secondToolbarRow && secondToolbarRow.style.display !== "none") {
                y = y - 26; // subtracting second Toolbar height
            }
        }
        //Subtracting spellcheckmodediv height
        var spellCheckModeDiv = this._spellCheckModeDivId && document.getElementById(this._spellCheckModeDivId);
        if (spellCheckModeDiv && spellCheckModeDiv.style.display !== "none") {
            y = y - (div ? 45 : 39);
        }
        // FUDGE: we must substract borders and paddings - yuck.
        y = y - ZmAdvancedHtmlEditor.DELTA_HEIGHT;
        y = y < 0 ? 0 : y;

        if (y + "px" !== bodyField.style.height) {
            bodyField.style.height = y + "px";
        }

        if (div) {
            div.style.height = y + (AjxEnv.isIE ? 8 : 2) + "px";
        }
    }
};

ZmAdvancedHtmlEditor.prototype.editorContainerFocus =
function() {
	DBG.println("focus on container");
	this.focus();
};

ZmAdvancedHtmlEditor.prototype.focus =
function(editor) {
    var currentObj = this,
        bodyField;

    if (currentObj._mode === DwtHtmlEditor.HTML) {
        editor = editor || currentObj.getEditor();
        if (currentObj._editorInitialized && editor) {
            editor.focus();
            currentObj.setFocusStatus(true);
        }
        else {
            currentObj._onTinyMCEEditorInitcallback = new AjxCallback(currentObj, currentObj.focus);
        }
    }
    else {
        bodyField = currentObj.getContentField();
        if (bodyField) {
            bodyField.focus();
            currentObj.setFocusStatus(true, true);
        }
    }
};

/**
 * Restores the focus. For IE selecting bookmark and for other browsers calling focus will place the cursor in the last edited position
 * @param editor object
 * @param {Boolean} collapse whether to collapse selection or not for IE html mode
 */
ZmAdvancedHtmlEditor.prototype.restoreFocus =
function(editor, collapse) {
    var currentObj = this,
        windowManager,
        selection;

    if (AjxEnv.isIE && currentObj._mode === DwtHtmlEditor.HTML) {
        editor = editor || currentObj.getEditor();
        if (editor) {
            windowManager = editor.windowManager;
            selection = editor.selection;
            if (selection && windowManager && windowManager.bookmark) {
                selection.moveToBookmark(windowManager.bookmark);
                delete windowManager.bookmark;
                (collapse) && selection.collapse(false);
                return;
            }
        }
    }
    currentObj.focus(editor);
};

/**
 * @param	{Boolean}	keepModeDiv	if <code>true</code>, _spellCheckModeDiv is not removed
 */
ZmAdvancedHtmlEditor.prototype.getTextVersion = function (convertor, keepModeDiv) {
    this.discardMisspelledWords(keepModeDiv);
    return this._mode === DwtHtmlEditor.HTML
        ? this._convertHtml2Text(convertor)
        : this.getContentField().value;
};

/**
 * Returns the content of the editor.
 * 
 * @param {boolean}		insertFontStyle		if true, add surrounding DIV with font settings
 * @param {boolean}		onlyInnerContent	if true, do not surround with HTML and BODY
 */
ZmAdvancedHtmlEditor.prototype.getContent =
function(insertFontStyle, onlyInnerContent) {

    this.discardMisspelledWords();
    
	var field = this.getContentField();

	var content = "";
	if (this._mode == DwtHtmlEditor.HTML) {
		var editor = this.getEditor(),
            content1 = "";
        if (editor) {
            content1 = editor.getContent({format:"raw"});
        }
        else {
            content1 = field.value || "";
        }
        if (content1 && (/\S+/.test(AjxStringUtil.convertHtml2Text(content1)) || content1.match(/<img/i)) ) {
			content = this._embedHtmlContent(content1, insertFontStyle, onlyInnerContent);
		}
	}
	else {
		if (/\S+/.test(field.value)) {
			content = field.value;
		}
	}

	return content;
};

ZmAdvancedHtmlEditor.prototype._embedHtmlContent =
function(html, insertFontStyle, onlyInnerContent) {

	html = html || "";
	if (insertFontStyle) {
		html = ZmAdvancedHtmlEditor._getFontStyle(html);
	}
	return onlyInnerContent ? html : [ "<html><body>", html, "</body></html>" ].join("");
};
ZmAdvancedHtmlEditor._embedHtmlContent = ZmAdvancedHtmlEditor.prototype._embedHtmlContent;

ZmAdvancedHtmlEditor._getFontStyle =
function(html) {
	return ZmAdvancedHtmlEditor._getFontStylePrefix() + html + ZmAdvancedHtmlEditor._getFontStyleSuffix();
};

ZmAdvancedHtmlEditor._getFontStylePrefix =
function() {
	var a = [], i = 0;
	a[i++] = '<div style="font-family: ';
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	a[i++] = '; font-size: ';
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
	a[i++] = '; color: ';
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
	a[i++] = '"';
    if (appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL) {
        a[i++] = ' dir="' + ZmSetting.RTL + '"';
    }
    a[i++] = ">";
	return a.join("");
};

ZmAdvancedHtmlEditor._getFontStyleSuffix =
function() {
	return "</div>";
};

/*
 If editor is not initialized and mode is HTML, tinymce will automatically initialize the editor with the content in textarea
 */
ZmAdvancedHtmlEditor.prototype.setContent = function (content) {
    if (this._mode === DwtHtmlEditor.HTML && this._editorInitialized) {
        this.getEditor().setContent(content, {format:'raw'});
    } else {
        this.getContentField().value = content;
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

ZmAdvancedHtmlEditor.prototype._convertHtml2Text = function (convertor) {
    var editor = this.getEditor(),
        body;
    if (editor) {
        body = editor.getBody();
        if (body) {
            return (AjxStringUtil.convertHtml2Text(body, convertor, true));
        }
    }
    return "";
};

ZmAdvancedHtmlEditor.prototype.moveCaretToTop =
function(offset) {
	var focused = document.activeElement;
	if (this._mode == DwtHtmlEditor.TEXT) {
		var control = this.getContentField();
		if (control.createTextRange) { // IE
			var range = control.createTextRange();
			if (offset) {
				range.move('character', offset);
			}
			else {
				range.collapse(true);
			}
			range.select();
		} else if (control.setSelectionRange) { // FF
			offset = offset || 0;
            //If display is none firefox will throw the following error
            //Error: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIDOMHTMLTextAreaElement.setSelectionRange]
            //checking offsetHeight to check whether it is rendered or not
            if (control.offsetHeight) {
                control.setSelectionRange(offset, offset);
            }
		}
	} else {
		this._moveCaretToTopHtml(true, offset);
	}
    try {
	    if (focused) {
			focused.focus();
		}
    } catch(ex) {
        // do nothing
    }
};

ZmAdvancedHtmlEditor.prototype._moveCaretToTopHtml =
function(tryOnTimer, offset) {
	var editor = this.getEditor();
	if (!editor) { return; }

	var body = editor.getDoc().body;
	var success = false;
	if (AjxEnv.isIE) {
		if (body) {
			var range = body.createTextRange();
			if (offset) {
				range.move('character', offset);
			} else {
				range.collapse(true);
			}
			success = true;
		}
	} else {
		var selection = editor.selection ? editor.selection.getSel() : "";
		if (selection) {
            if (offset) { // if we get an offset, use it as character count into text node
                var target = body.firstChild;
                while (target) {
                    if (offset === 0) {
                        selection.collapse(target, offset);
                        break;
                    }
                    if (target.nodeName === "#text") {
                        var textLength = target.length;
                        if (offset > textLength) {
                            offset = offset - textLength;
                        } else {
                            selection.collapse(target, offset);
                            break;
                        }
                    } else if (target.nodeName === "BR") {//text.length is also including \n count. so if there is br reduce offset by 1
                        offset = offset - 1;
                    }
                    target = target.nextSibling;
                }
            }
            else {
                selection.collapse(body, 0);
            }
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
	var editor = this.getEditor();
    if (editor && this._editorInitialized) {
        editor.undoManager && editor.undoManager.clear();
        editor.isNotDirty = true;//setting tinymce editor internal property
	}
    var field = this.getContentField();
    if(field){
        var textEl = field.cloneNode(false);
        field.parentNode.replaceChild(textEl, field);//To clear undo/redo queue of textarea
        //cloning and replacing node will remove event handlers and hence adding it once again
        Dwt.setHandler(textEl, DwtEvent.ONFOCUS, this.setFocusStatus.bind(this, true, true));
        Dwt.setHandler(textEl, DwtEvent.ONBLUR, this.setFocusStatus.bind(this, false, true));
    }
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
    if ( content !== null ) {
        textEl.value = content;
    }
	htmlEl.appendChild(textEl);
	this._textAreaId = id;

    Dwt.setHandler(textEl, DwtEvent.ONFOCUS, this.setFocusStatus.bind(this, true, true));
    Dwt.setHandler(textEl, DwtEvent.ONBLUR, this.setFocusStatus.bind(this, false, true));
	this._editorContainer.setFocusMember(textEl);

	if (!window.tinyMCE) {
        window.tinyMCEPreInit = {};
        window.tinyMCEPreInit.suffix = '';
        window.tinyMCEPreInit.base = appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH; // SET PATH TO TINYMCE HERE
        // Tell TinyMCE that the page has already been loaded
        window.tinyMCE_GZ = {};
        window.tinyMCE_GZ.loaded = true;

        //Refer http://www.tinymce.com/i18n/index.php?ctrl=lang&act=download&pr_id=1
        var tinyMCELocaleArray = ['sq', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'nb', 'bs', 'br', 'bg', 'my', 'ca', 'km', 'ch', 'zh', 'hr', 'cs', 'da', 'dv', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'gl', 'ka', 'de', 'el', 'gu', 'he', 'hi', 'hu', 'is', 'id', 'ia', 'it', 'ja', 'kl', 'ko', 'lv', 'lt', 'lb', 'mk', 'ms', 'ml', 'mn', 'se', 'no', 'nn', 'fa', 'pl', 'pt', 'ps', 'ro', 'ru', 'sc', 'sr', 'si', 'sk', 'sl', 'es', 'sv', 'ta', 'tt', 'te', 'th', 'tn', 'tr', 'tw', 'uk', 'ur', 'vi', 'cy', 'zu', 'zh-tw', 'cn', 'zh-cn'],
            locale = appCtxt.get(ZmSetting.LOCALE_NAME),
            tinyMCELocale = locale.toLowerCase().replace("_", "-");

        if (tinyMCELocale === "zh-hk") {//setting chinese language for Hong kong chinese
            ZmAdvancedHtmlEditor.LOCALE = "zh";
        }
        else if (AjxUtil.arrayContains(tinyMCELocaleArray, tinyMCELocale, true)) {
            ZmAdvancedHtmlEditor.LOCALE = tinyMCELocale;
        }
		var callback = new AjxCallback(this, this.initEditorManager, [id, content]);
        AjxDispatcher.require(["TinyMCE"], true, callback);
	} else {
		this.initEditorManager(id, mode, content);
	}
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
function(ed, ev) {
	var retVal = true;

    if (DwtKeyboardMgr.isPossibleInputShortcut(ev)) {
        // pass to keyboard mgr for kb nav
        retVal = DwtKeyboardMgr.__keyDownHdlr(ev);
    }
    else if (ev.keyCode === 9) { //Tab key handling
        ed.execCommand("mceInsertContent", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
        ev.preventDefault();
    }

	if (window.DwtIdleTimer) {
		DwtIdleTimer.resetIdle();
	}

	return retVal;
};

//Notifies mousedown event in tinymce editor to ZCS
ZmAdvancedHtmlEditor.prototype._handleEditorMouseDownEvent =
function(ed, ev) {
    DwtOutsideMouseEventMgr.forwardEvent(ev);
};

ZmAdvancedHtmlEditor.prototype._handleEditorMouseUpEvent =
function(ed, ev) {
    var kbMgr = DwtShell.getShell(window).getKeyboardMgr();
    kbMgr.grabFocus(this._editorContainer);//This will finally call ZmEditorContainer.prototype._focus method which will call ZmAdvancedHtmlEditor.prototype.restoreFocus method
};

ZmAdvancedHtmlEditor.prototype.onLoadContent =
function(ed) {
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

    if (!window.tinyMCE) {//some problem in loading TinyMCE files
        return;
    }

	var urlParts = AjxStringUtil.parseURL(location.href);

	//important: tinymce doesn't handle url parsing well when loaded from REST URL - override baseURL/baseURI to fix this
	tinymce.baseURL = appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH + "/";

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
        plugins : "advlist,inlinepopups,table,paste,directionality,media,-zimbraplugin,-zbreakquote" + (AjxEnv.isIE ? "" : ",autolink"),
		theme : "advanced",
        theme_advanced_buttons1 : "fontselect,fontsizeselect,forecolor,backcolor,|,bold,italic,underline,strikethrough,|,bullist,numlist,|,outdent,indent,|,justifyleft,justifycenter,justifyright,|,image,link,unlink,|,ltr,rtl,|,toggle",
        theme_advanced_buttons2 : "formatselect,undo,redo,|,removeformat,|,pastetext,pasteword,|,tablecontrols,|,blockquote,hr,charmap,media",
		theme_advanced_buttons3 : "",
		theme_advanced_buttons4 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_resizing : true,
        theme_advanced_fonts : fonts.join(";"),
        theme_advanced_statusbar_location : "none",
		convert_urls : false,
		verify_html : false,
		gecko_spellcheck : true,
        content_css : false,
		editor_css: editorCSS,
        dialog_type : "modal",
        forced_root_block : "div",
        width: "100%",
        height: "auto",
        table_default_cellpadding : 3,
        table_default_border: 1,
        language : ZmAdvancedHtmlEditor.LOCALE,
        language_load : (ZmAdvancedHtmlEditor.LOCALE === "en") ? false : true,
        theme_advanced_show_current_color : true,
        directionality : appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION),
		setup : function(ed) {
            ed.onLoadContent.add(obj.onLoadContent.bind(obj));
            ed.onPostRender.add(obj.onPostRender.bind(obj));
            ed.onInit.add(obj.onInit.bind(obj));
            ed.onKeyDown.add(obj._handleEditorKeyEvent.bind(obj));
            ed.onMouseDown.add(obj._handleEditorMouseDownEvent.bind(obj));
            if (AjxEnv.isIE) {
                ed.onMouseUp.add(obj._handleEditorMouseUpEvent.bind(obj));
            }
            ed.onPaste.add(obj.onPaste.bind(obj));
            ed.onBeforeExecCommand.add(obj.onBeforeExecCommand.bind(obj));
            //Adding toggle button for showing/hiding the extended toolbar
            ed.addButton('toggle', {
                title : ZmMsg.showExtendedToolbar,
                onclick : obj.onToolbarToggle.bind(obj, ed),
                "class" : "mce_toggle"
            });
		}
    };

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

ZmAdvancedHtmlEditor.prototype.onPaste = function(ed, ev) {
    var data = ev.clipboardData,
        items,
        blob,
        req,
        view;

    if (!data) {
        return;
    }
    items = data.items;
    if (!items) {
        return;
    }
    view = this.getParent();
    if (view && view.toString() !== "ZmComposeView") {
        return;
    }
    blob = items[0].getAsFile();
    if (blob) {
        req = new XMLHttpRequest();
        req.open("POST", appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI)+"?fmt=extended,raw", true);
        req.setRequestHeader("Cache-Control", "no-cache");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("Content-Type", blob.type);
        req.setRequestHeader("Content-Disposition", 'attachment; filename="' + (blob.fileName ? AjxUtil.convertToEntities(blob.fileName) : ev.timeStamp || new Date().getTime()) + '"');//For paste from clipboard filename is undefined
        req.onreadystatechange = function(){
            if(req.readyState === 4 && req.status === 200) {
                var resp = eval("["+req.responseText+"]");
                if(resp.length === 3) {
                    resp[2].clipboardPaste = true;
                    view.getController().saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, resp[2]);
                }
            }
        }
        req.send(blob);
    }
};

ZmAdvancedHtmlEditor.prototype.onPostRender = function(ed, ev) {
    var defaultShortcuts = ed.shortcuts;//Tinymce editor internal object for storing default keyboard shortcuts
    if (defaultShortcuts) {
        delete defaultShortcuts[",alt,,48"];
        delete defaultShortcuts["ctrl,,,49"];//H1
        delete defaultShortcuts["ctrl,,,50"];//H2
        delete defaultShortcuts["ctrl,,,51"];//H3
        delete defaultShortcuts["ctrl,,,52"];//H4
        delete defaultShortcuts["ctrl,,,53"];//H5
        delete defaultShortcuts["ctrl,,,54"];//H6
        delete defaultShortcuts["ctrl,,,55"];//P
        delete defaultShortcuts["ctrl,,,56"];//div
        delete defaultShortcuts["ctrl,,,57"];//address
    }

    var strikethrough = AjxKeys["editor."+DwtKeyMap.TEXT_STRIKETHRU+".display"],
        justifyLeft = AjxKeys["editor."+DwtKeyMap.JUSTIFY_LEFT+".display"],
        justifyCenter = AjxKeys["editor."+DwtKeyMap.JUSTIFY_CENTER+".display"],
        justifyRight = AjxKeys["editor."+DwtKeyMap.JUSTIFY_RIGHT+".display"],
        link = AjxKeys["editor."+DwtKeyMap.INSERT_LINK+".display"],
        strikethroughBtn = this.getToolbarButton("strikethrough", ed),
        justifyLeftBtn = this.getToolbarButton("justifyleft", ed),
        justifyCenterBtn = this.getToolbarButton("justifycenter", ed),
        justifyRightBtn = this.getToolbarButton("justifyright", ed),
        linkBtn = this.getToolbarButton("link", ed);

    //Adding shortcuts
    strikethrough && ed.addShortcut(strikethrough.toLowerCase(), '', 'strikethrough');//shortcut for strikethrough
    justifyLeft && ed.addShortcut(justifyLeft.toLowerCase(), '', 'justifyLeft');//shortcut for align left
    justifyCenter && ed.addShortcut(justifyCenter.toLowerCase(), '', 'justifyCenter');//shortcut for align center
    justifyRight && ed.addShortcut(justifyRight.toLowerCase(), '', 'justifyRight');//shortcut for align right
    //shortcut for insert link dialog
    if (link) {
        ed.addShortcut(link.toLowerCase(), '', function(){
            if (!ed.controlManager.get('link').isDisabled()) { //Invokes dialog only if some selection is in the editor
                ed.execCommand("mceLink");
            }
        });
    }
    //Setting tooltip
    strikethroughBtn.title += " (" + strikethrough + ")";
    justifyLeftBtn.title += " (" + justifyLeft + ")";
    justifyCenterBtn.title += " (" + justifyCenter + ")";
    justifyRightBtn.title += " (" + justifyRight + ")";
    linkBtn.title += " (" + link + ")";

    if (AjxEnv.isMac) {
        var anchorButtonsArray = tinyMCE.DOM.select("a[title*='Ctrl']", this.getToolbar(1, ed).parentNode),//selects all anchor buttons having title ctrl
            anchorButton;
        while ( anchorButton = anchorButtonsArray.shift() ) {
            anchorButton.title = anchorButton.title.replace("Ctrl", "Cmd");
        }
    }
    if (!appCtxt.get(ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS)) {
        var ltrButton = this.getToolbarButton("ltr", ed).parentNode;
        if (ltrButton) {
            Dwt.setVisible(ltrButton, false);
            Dwt.setVisible(ltrButton.previousSibling, false);
        }
        Dwt.setVisible(this.getToolbarButton("rtl", ed).parentNode, false);
    }
    this.setSize("", parseInt(this.getContentField().style.height) + ZmAdvancedHtmlEditor.DELTA_HEIGHT);
    this.onToolbarToggle(ed);
    ed.dom.setStyles(ed.getBody(), {"font-family" : appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY),
                                    "font-size"   : appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE),
                                    "color"       : appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR)
                                   });
    Dwt.setVisible(this.getHtmlElement(), true);
};

ZmAdvancedHtmlEditor.prototype.onInit = function(ed, ev) {
    var obj = this,
        tinymceEvent = tinymce.dom.Event,
        doc = ed.getDoc(),
        win = ed.getWin(),
        view = obj.getParent();

    tinymceEvent.add(win, 'focus', function(e) {
        obj.setFocusStatus(true);
    });
    tinymceEvent.add(win, 'blur', function(e) {
        obj.setFocusStatus(false);
    });
    // Set's up the a range for the current ins point or selection. This is IE only because the iFrame can
    // easily lose focus (e.g. by clicking on a button in the toolbar) and we need to be able to get back
    // to the correct insertion point/selection.
    // DwtHtmlEditor is using _currInsPtBm property to store the cursor position in editor event handler function which is heavy.
    // Here we are registering this dedicated event to store the bookmark which will fire when focus moves outside the editor
    if(AjxEnv.isIE){
        tinymceEvent.add(doc, 'beforedeactivate', function(e) {
            if(ed.windowManager){
                ed.windowManager.bookmark = ed.selection.getBookmark(1);
            }
        });
    }

    obj.getEditorContainer().setFocusMember(obj.restoreFocus.bind(obj, ed));

    if (obj._onTinyMCEEditorInitcallback) {
        obj._onTinyMCEEditorInitcallback.run();
    }
    if (tinymce.settings && tinymce.settings.language_load === false){
        tinymce.settings.language_load = true;
    }
    (ed.windowManager) && ed.windowManager.onOpen.add(ZmAdvancedHtmlEditor.onPopupOpen);
    if (view && view.toString() === "ZmComposeView" && ZmDragAndDrop.isSupported()) {
        var dnd = view._dnd;
        tinymceEvent.add(doc, 'dragenter', this._onDragEnter.bind(this, ed, dnd));
        tinymceEvent.add(doc, 'dragleave', this._onDragLeave.bind(this, ed, dnd));
        tinymceEvent.add(doc, 'dragover', this._onDragOver.bind(this, ed, dnd));
        tinymceEvent.add(doc, 'drop', this._onDrop.bind(this, ed, dnd));
    }

    obj._editorInitialized = true;
};

/*
**   TinyMCE will fire onBeforeExecCommand before executing all commands
 */
ZmAdvancedHtmlEditor.prototype.onBeforeExecCommand = function(ed, cmd, ui, val, o) {
    if (cmd === "mceImage") {
        this.onBeforeInsertImage(ed, cmd, ui, val, o);
    }
};

ZmAdvancedHtmlEditor.prototype.onBeforeInsertImage = function(ed, cmd, ui, val, o) {
    var element = ed.selection.getNode();
    if (!element || element.nodeName !== 'IMG') {
        if (this.isSignatureEditor) {
            ZmSignatureEditor.prototype._insertImagesListener.call(this);
            o.terminate = true; //This will terminate tinymce from executing this command
        }
        else {
            var view = this.getParent();
            if (view && view.toString() === "ZmComposeView") {
                view.getController()._attachmentListener(true);
                o.terminate = true;
            }
        }
    }
};

ZmAdvancedHtmlEditor.prototype._onDragEnter = function(ed, dnd, ev) {
    dnd._onDragEnter(ev);
    Dwt.addClass(Dwt.getElement(this._iFrameId), "DropTarget");
};

ZmAdvancedHtmlEditor.prototype._onDragLeave = function(ed, dnd, ev) {
    dnd._onDragLeave(ev);
    Dwt.delClass(Dwt.getElement(this._iFrameId), "DropTarget");
};

ZmAdvancedHtmlEditor.prototype._onDragOver = function(ed, dnd, ev) {
    dnd._onDragOver(ev);
};

ZmAdvancedHtmlEditor.prototype._onDrop = function(ed, dnd, ev) {
    dnd._onDrop(ev, true);
    Dwt.delClass(Dwt.getElement(this._iFrameId), "DropTarget");
};

ZmAdvancedHtmlEditor.prototype.setMode = function (mode, convert, convertor) {
    this.discardMisspelledWords();
    if (mode === this._mode || (mode !== DwtHtmlEditor.HTML && mode !== DwtHtmlEditor.TEXT)) {
        return;
    }
    this._mode = mode;
    if (mode === DwtHtmlEditor.HTML) {
        if (convert) {
            var textarea = this.getContentField();
            textarea.value = AjxStringUtil.convertToHtml(textarea.value, true);
        }
        if (this._editorInitialized) {
            tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);//tinymce will automatically toggles the editor and sets the corresponding content.
        }
        else {
            //switching from plain text to html using tinymces mceToggleEditor method is always using the last editor creation setting. Due to this current ZmAdvancedHtmlEditor object always point to last ZmAdvancedHtmlEditor object. Hence initializing the tinymce editor again for the first time when mode is switched from plain text to html.
            this.initEditorManager(this._bodyTextAreaId);
        }
    } else {
        if (convert) {
            var content;
            if (this._editorInitialized) {
                content = this._convertHtml2Text(convertor);
            }
            else {
                content = AjxStringUtil.convertHtml2Text(this.getContentField().value);
            }
        }
        if (this._editorInitialized) {
            tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);//tinymce will automatically toggles the editor and sets the corresponding content.
        }
        if (convert) {//tinymce will set html content directly in textarea. Resetting the content after removing the html tags.
            this.setContent(content);
        }
        if (!window.tinyMCE) {
            //if tinymce is not loading in certain edge cases, user can switch to plain text mode
            Dwt.setVisible(this.getHtmlElement(), true);
        }
    }
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

    this.restoreFocus(ed);

	//tinymce modifies the source when using mceInsertContent
    //ed.execCommand('mceInsertContent', false, html.join(""), {skip_undo : 1});
    ed.execCommand('mceInsertRawHTML', false, html.join(""), {skip_undo : 1});
};

ZmAdvancedHtmlEditor.prototype.replaceImage =
function(id, src){
    var doc = this.getEditor().getDoc();
    if(doc){
        var img = doc.getElementById(id);
        if( img && img.getAttribute("data-zim-uri") === id ){
            img.src = src;
            img.removeAttribute("id");
            img.removeAttribute("data-mce-src");
            img.removeAttribute("data-zim-uri");
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
function(callback, keepModeDiv) {
	var text = this.getTextVersion(null, keepModeDiv);

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

    var size = this._editorContainer.getSize();
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
        size.y = size.y - (keepModeDiv ? 0 : 2);
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
        size.y = size.y + (keepModeDiv ? 2 : 0);
	}

	this._spellCheckDivId = this._spellCheck = null;
	window.status = "";

	if (!keepModeDiv) {
		this._spellCheckHideModeDiv();
	}

	if (this.onExitSpellChecker) {
		this.onExitSpellChecker.run();
	}
    this.setSize(size.x, size.y);
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
    this.setSize(size.x, size.y);
};

ZmAdvancedHtmlEditor._spellCheckResumeEditing =
function() {
	var editor = Dwt.getObjectFromElement(this);
	editor.discardMisspelledWords();
    editor.restoreFocus(0, true);
};

ZmAdvancedHtmlEditor._spellCheckAgain =
function() {
    Dwt.getObjectFromElement(this).spellCheck(null, true);
};


ZmAdvancedHtmlEditor.prototype._spellCheckHideModeDiv =
function() {
	var size = this._editorContainer.getSize();
	if (this._spellCheckModeDivId) {
		document.getElementById(this._spellCheckModeDivId).style.display = "none";
	}
    this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 0));
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

/**
 * Returns true if editor content is spell checked
 */
ZmAdvancedHtmlEditor.prototype.isSpellCheckMode = function() {
    return Boolean( this._spellCheck );
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
 *  @param {object}	tinymce editor
 *  @return	{Toolbar HTML Element}
 */
ZmAdvancedHtmlEditor.prototype.getToolbar =
function(number, editor) {
    var controlManager,
        toolbar;

    editor = editor || this.getEditor();
    if (editor && number) {
        controlManager = editor.controlManager;
        if (controlManager) {
            toolbar = controlManager.get("toolbar"+number);
            if (toolbar && toolbar.id) {
                return document.getElementById(toolbar.id);
            }
        }
    }
};

/*
 *  Returns toolbar button of tinymce
 *
 *  @param {String}	button name
 *  @param {object}	tinymce editor
 *  @return	{Toolbar Button HTML Element}
 */
ZmAdvancedHtmlEditor.prototype.getToolbarButton =
function(buttonName, editor) {
    var controlManager,
        toolbarButton;

    if (editor && buttonName) {
        controlManager = editor.controlManager;
        if (controlManager) {
            toolbarButton = controlManager.get(buttonName);
            if (toolbarButton && toolbarButton.id) {
                return document.getElementById(toolbarButton.id);
            }
        }
    }
};

ZmAdvancedHtmlEditor.prototype.onToolbarToggle =
function(editor) {
    var iframeStyle = this.getBodyField().style,
        toolbar = this.getToolbar("2", editor),
        toggleButton = this.getToolbarButton("toggle", editor),
        iframeHeight = parseInt(iframeStyle.height);

    if (toolbar && toggleButton) {
        if (toolbar.style.display === Dwt.DISPLAY_NONE) {
            toggleButton.title = ZmMsg.hideExtendedToolbar;
            Dwt.setInnerHtml(toggleButton.firstChild, ZmMsg.lessToolbar);
            Dwt.show(toolbar);
            if (!isNaN(iframeHeight)) {
                iframeStyle.height =  (iframeHeight > 26) ? iframeHeight - 26 : iframeHeight + "px";
            }
        }
        else{
            toggleButton.title = ZmMsg.showExtendedToolbar;
            Dwt.setInnerHtml(toggleButton.firstChild, ZmMsg.moreToolbar);
            Dwt.hide(toolbar);
            if (!isNaN(iframeHeight)) {
                iframeStyle.height = iframeHeight + 26 + "px";
            }
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
 * This will be fired before every popup open
 *
 * @param {windowManager} tinymce window manager for popups
 * @param {popupWindow}	contains tinymce popup info or popup DOM Window
 *
 */
ZmAdvancedHtmlEditor.onPopupOpen = function(windowManager, popupWindow) {
    if (!popupWindow) {
        return;
    }
    if (popupWindow.resizable) {
        popupWindow.resizable = 0;
    }

    var popupIframe = popupWindow.frameElement,
        popupIframeLoad;

    if (popupIframe && popupIframe.src && popupIframe.src.match("/table.htm")) {//Table dialog
        popupIframeLoad = function(popupWindow, popupIframe) {
            var doc,align,width;
            if (popupWindow.action === "insert") {//Insert Table Action
                doc = popupWindow.document;
                if (doc) {
                    align = doc.getElementById("align");
                    width = doc.getElementById("width");
                    align && (align.value = "center");
                    width && (width.value = "90%");
                }
            }
            if (this._popupIframeLoad) {
                popupIframe.detachEvent("onload", this._popupIframeLoad);
                delete this._popupIframeLoad;
            }
            else {
                popupIframe.onload = null;
            }
        };

        if (popupIframe.attachEvent) {
            this._popupIframeLoad = popupIframeLoad.bind(this, popupWindow, popupIframe);
            popupIframe.attachEvent("onload", this._popupIframeLoad);
        }
        else {
            popupIframe.onload = popupIframeLoad.bind(this, popupWindow, popupIframe);
        }
    }
};

/**
 * Returns true if editor content is modified
 */
ZmAdvancedHtmlEditor.prototype.isDirty = function(){
    if( this._mode === DwtHtmlEditor.HTML ){
        var editor = this.getEditor();
        if (editor) {
            return editor.isDirty();
        }
    }
};

/**
 * Listen for change in fontfamily, fontsize, fontcolor, direction and showing compose direction buttons preference and update the corresponding one.
 */
ZmAdvancedHtmlEditor.prototype._settingChangeListener = function(ev) {
    if (ev.type != ZmEvent.S_SETTING) { return; }

    var id = ev.source.id,
        editor,
        body,
        textArea,
        direction,
        showDirectionButtons,
        ltrButton;

    if (id === ZmSetting.COMPOSE_INIT_DIRECTION) {
        textArea = this.getContentField();
        direction = appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION);
        if (direction === ZmSetting.RTL) {
            textArea.setAttribute("dir", ZmSetting.RTL);
        }
        else{
            textArea.removeAttribute("dir");
        }
    }

    editor = this.getEditor();
    body = editor ? editor.getBody() : null;
    if(!body)
        return;

    if (id === ZmSetting.COMPOSE_INIT_FONT_FAMILY) {
        body.style.fontFamily = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
    }
    else if (id === ZmSetting.COMPOSE_INIT_FONT_SIZE) {
        body.style.fontSize = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
    }
    else if (id === ZmSetting.COMPOSE_INIT_FONT_COLOR) {
        body.style.color = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
    }
    else if (id === ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS) {
        showDirectionButtons = appCtxt.get(ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS);
        ltrButton = this.getToolbarButton("ltr", editor).parentNode;
        if (ltrButton) {
            Dwt.setVisible(ltrButton, showDirectionButtons);
            Dwt.setVisible(ltrButton.previousSibling, showDirectionButtons);
        }
        Dwt.setVisible(this.getToolbarButton("rtl", editor).parentNode, showDirectionButtons);
    }
    else if (id === ZmSetting.COMPOSE_INIT_DIRECTION) {
        if (direction === ZmSetting.RTL) {
            body.dir = ZmSetting.RTL;
        }
        else{
            body.removeAttribute("dir");
        }
    }
    editor.nodeChanged && editor.nodeChanged();//update the toolbar state
};

/*
 * This will be fired after every tinymce menu open. Listen for outside events happening in ZCS
 *
 * @param {menu} tinymce menu object
 */
ZmAdvancedHtmlEditor.onShowMenu =
function(menu) {
    if (menu && menu.isMenuVisible) {
        var omemParams = {
            id:					"ZmAdvancedHtmlEditor",
            elementId:			(menu.classPrefix === "mceMenu") ? ("menu_" + menu.id) : (menu.id + "_menu"),
            outsideListener:	function(){
                                    this.hideMenu();
                                }.bind(menu)
        };
        appCtxt.getOutsideMouseEventMgr().startListening(omemParams);
        ZmAdvancedHtmlEditor.isListening = 1;
    }
};

/*
 * This will be fired after every tinymce menu hide. Removing the outside event listener registered in onShowMenu
 *
 * @param {menu} tinymce menu object
 */
ZmAdvancedHtmlEditor.onHideMenu =
function(menu) {
    if (menu && menu.isMenuVisible === 0 && ZmAdvancedHtmlEditor.isListening) {
        var omemParams = {
            id:					"ZmAdvancedHtmlEditor",
            elementId:			(menu.classPrefix === "mceMenu") ? ("menu_" + menu.id) : (menu.id + "_menu")
        };
        appCtxt.getOutsideMouseEventMgr().stopListening(omemParams);
        delete ZmAdvancedHtmlEditor.isListening;
    }
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
    var focusMember = this._focusMember;
    if (focusMember) {
        if (focusMember.nodeName === "TEXTAREA") {
            focusMember.focus();
        }
        else {
            focusMember();
        }
    }
};
