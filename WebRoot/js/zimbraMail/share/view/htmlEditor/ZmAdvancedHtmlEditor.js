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
 */
ZmAdvancedHtmlEditor = function(parent, posStyle, content, mode, withAce) {
	if (arguments.length == 0) { return; }

	this.isTinyMCE = window.isTinyMCE;
	this._mode = mode;
	this._hasFocus = {};
	this.initTinyMCEEditor(parent, posStyle, content, mode, withAce);
    this._ignoreWords = {};
};

ZmAdvancedHtmlEditor.TINY_MCE_PATH = "/tiny_mce/3.2.6";

ZmAdvancedHtmlEditor.prototype.toString =
function() {
	return "ZmAdvancedHtmlEditor";
};

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
	var editor = this.getEditor();
	var bodyField = this.getBodyField();

	// FUDGE: we must substract borders and paddings - yuck.
	var delta = this._mode == DwtHtmlEditor.HTML ? 10 : 8;

	x -= delta + 4;
	y -= delta; // subtract fudge factor

	// bug fix #6786 - normalize width/height if less than zero
	if (x < 0) { x = 0; }
	if (y < 0) { y = 0; }

	var editorContainer = document.getElementById(this._bodyTextAreaId + "_tbl");
	if (editor && editorContainer) {
		editorContainer.style.height = y + "px";
		editorContainer.style.width = "100%";
	}

	if (this._mode == DwtHtmlEditor.HTML && this.isTinyMCE)
		y -= 26;

	bodyField.style.width = x + 5 + "px";
	bodyField.style.height = y + "px";

	//todo: handle spellcheck ids
};

ZmAdvancedHtmlEditor.prototype.editorContainerFocus =
function() {
	DBG.println("focus on container");
	this.focus();
};

ZmAdvancedHtmlEditor.prototype.focus =
function() {
	var editor = this.getEditor();
	if (editor) {
		editor.focus();
		this.setFocusStatus(true);
	} else {
		var bodyField = this.getContentField();
		if (bodyField) {
			bodyField.focus();
		}
		this.setFocusStatus(true, true);
	}
};

ZmAdvancedHtmlEditor.prototype.getTextVersion =
function() {
	var textArea = this.getContentField();
	if (this._mode == DwtHtmlEditor.HTML) {
		var editor = this.getEditor();
		return editor ? this._convertHtml2Text(): "";
	}

	return textArea.value;
};

ZmAdvancedHtmlEditor.prototype.getContent =
function(insertFontStyle, onlyInnerContent) {
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
			cont[idx++] = ";'>";
			cont[idx++] = html;
			cont[idx++] = "</div>";
		} else {
			cont[idx++] = html;
		}

		return cont.join("");
	}

	var p_style = "<style type='text/css'>p { margin: 0; }</style>"; // bug 3264
	if (insertFontStyle) {
		html = this._getFontStyle(html);
	}
	return [
		"<html><head>",
		p_style,
		"</head><body>",
		html,
		"</body></html>"
	].join("");
};

ZmAdvancedHtmlEditor.prototype._getFontStyle =
function(html) {
	var a = [], i = 0;
	a[i++] = "<div style='font-family: ";
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	a[i++] = "; font-size: ";
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
	a[i++] = "; color: ";
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
	a[i++] = "'>";
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
function() {
	var editor = this.getEditor();
	var doc = editor && editor.getDoc();

	return (doc && doc.body)
		? this._convertHtml2TextContinue(doc.body) : "";
};

ZmAdvancedHtmlEditor.prototype._convertHtml2TextContinue =
function(domRoot) {
	var text = [];
	var idx = 0;
	var ctxt = {};

	AjxStringUtil._traverse(domRoot, text, idx, AjxStringUtil._NO_LIST, 0, 0, ctxt);

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
	if (focused) focused.focus();
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

ZmAdvancedHtmlEditor.prototype._getIframeDoc =
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
	if (editor) {
		editor.setContent("", {format: "raw"});
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
function(parent, posStyle, content, mode, withAce) {

	var params = {
		parent: parent,
		posStyle: posStyle,
		mode: mode,
		content: content,
		withAce: withAce,
		className:"ZmHtmlEditor"
	};
	this._editorContainer = new ZmEditorContainer(params);
	var htmlEl = this._editorContainer.getHtmlElement();

	//textarea on which html editor is constructed
	var id = this._bodyTextAreaId = this._editorContainer.getHTMLElId() + "_content";
	var textEl = document.createElement("textarea");
	textEl.setAttribute("id", id);
	textEl.setAttribute("name", id);
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
		var callback = new AjxCallback(this, this.initEditorManager, [id, mode, content]);
		var data = {
			name: "tiny_mce",
			path: appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH + "/tiny_mce.js",
			extension: ".js",
			method: AjxPackage.METHOD_XHR_SYNC,
			async: false,
			callback: null,
			scripts: [],
			basePath: appContextPath + ZmAdvancedHtmlEditor.TINY_MCE_PATH
		};

		AjxPackage.require(data);
		this.initEditorManager(id, mode, content);
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

ZmAdvancedHtmlEditor.prototype.addOnContentIntializedListener =
function(callback) {
	this._onContentInitializeCallback = callback;
};

ZmAdvancedHtmlEditor.prototype.removeOnContentIntializedListener =
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
function(id, mode, content) {

	var obj = this;

	function handleContentLoad(ed) {
		obj.onLoadContent(ed);
		obj.initDefaultFontSize(ed);
	};

	function onTinyMCEEditorInit(ed) {
		obj.initDefaultFontSize(ed);
		tinymce.dom.Event.add(ed.getWin(), 'focus', function(e) {
			obj.setFocusStatus(true);
		});
		tinymce.dom.Event.add(ed.getWin(), 'blur', function(e) {
			obj.setFocusStatus(false);
		});

		var ec = obj.getEditorContainer();
		ec.setFocusMember(ed.getWin());

		obj._editorInitialized = true;
	};

	function onEditorKeyPress(ed, e) {
		return obj._handleEditorKeyEvent(e, ed);
	};

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

	tinyMCE.init({
		// General options
		mode :  (mode == DwtHtmlEditor.HTML)? "exact" : "none",
		elements:  id,
		plugins : "table,ztable,inlinepopups,zcontextmenu,fullscreen",
		theme : "advanced",
		theme_advanced_buttons1 : "fontselect,fontsizeselect,formatselect,justifyleft,justifycenter,justifyright,justifyfull,separator,bullist,numlist,outdent,indent,separator,bold,italic,underline,separator,forecolor,backcolor,separator,link,ztablecontrols,fullscreen",
		theme_advanced_buttons2: "",
		theme_advanced_buttons3: "",
		theme_advanced_buttons4: "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_resizing : true,
		convert_urls : false,
		verify_html : false,
		gecko_spellcheck : true,
		force_br_newlines : true,
		forced_root_block : '',
		force_p_newlines : false,
		content_css : false,
		editor_css: editorCSS,
		inline_styles: false,
		setup : function(ed) {
			ed.onLoadContent.add(handleContentLoad);
			ed.onInit.add(onTinyMCEEditorInit);
			ed.onKeyPress.add(onEditorKeyPress);

		}
	});

	this._editor = this.getEditor();
	this._iFrameId = this._bodyTextAreaId + "_ifr";
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
			//important: tinymce expects html markup in textarea so it might treat email
			//address in <user1@testdomain.com> as tag
			textArea.value = "";
			this._editorContainer.setFocusMember(editor.getWin());
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
		this._editorContainer.setFocusMember(textArea);
	}
};

ZmAdvancedHtmlEditor.prototype.getContentField =
function() {
	return document.getElementById(this._bodyTextAreaId);
};

ZmAdvancedHtmlEditor.prototype.insertImage =
function(src, dontExecCommand, width, height) {

	var html = [];
	var idx= 0 ;

	html[idx++] = "<img";
	html[idx++] = " src='";
	html[idx++] = src;
	html[idx++] = "'";

	if (width != null) {
		html[idx++] = " width='" + width + "'";
	}
	if (height != null) {
		html[idx++] = " height='" + height + "'";
	}
	html[idx++] = ">";

	var ed = this.getEditor();

	// Fixes crash in Safari
	if (tinymce.isWebKit) {
		ed.getWin().focus();
	}

	ed.execCommand('mceInsertContent', false, html.join(""), {skip_undo : 1});
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
		this._spellChecker.check(text, new AjxCallback(this, this._spellCheckCallback));
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
	function fix(val) {
		var spans = fixall
			? self._spellCheck.wordIds[orig]
			: [ item.getData("spanId") ];
		for (var i = spans.length; --i >= 0;) {
			var span = doc.getElementById(spans[i]);
			if (span)
				span.innerHTML = val;
		}
	};
	if (plainText && val == null) {
		function inputListener(ev) {
			ev || (ev = window.event);
			// the event gets lost after 20 milliseconds so we need
			// to save the following :(
			var evType = ev.type;
			var evKeyCode = ev.keyCode;
			var evCtrlKey = ev.ctrlKey;
			var input = this;
			setTimeout(function() {
				var keyEvent = /key/.test(evType);
				var removeInput = true;
				if (/blur/.test(evType) || (keyEvent && evKeyCode == 13)) {
					if (evCtrlKey)
						fixall =! fixall;
					fix(input.value);
				} else if (keyEvent && evKeyCode == 27 /* ESC */) {
					fix(AjxUtil.getInnerText(span));
				} else {
					removeInput = false;
				}
				if (removeInput) {
					input.onblur = null;
					input.onkeydown = null;
					input.parentNode.removeChild(input);
				}
				self._handleSpellCheckerEvents(null);
			}, 20);
		};
		// protect variables
		(function() {
			// edit clicked
			var input = doc.createElement("input");
			input.type = "text";
			input.value = AjxUtil.getInnerText(span);
			input.className = "SpellCheckInputField";
			input.style.left = span.offsetLeft - 2 + "px";
			input.style.top = span.offsetTop - 2 + "px";
			input.style.width = span.offsetWidth + 4 + "px";
			var div = doc.getElementById(self._spellCheckDivId);
			var scrollTop = div.scrollTop;
			div.appendChild(input);
			div.scrollTop = scrollTop; // this gets resetted when we add an input field (at least Gecko)
			input.setAttribute("autocomplete", "off");
			input.focus();
			if (!AjxEnv.isGeckoBased)
				input.select();
			else
				input.setSelectionRange(0, input.value.length);
			input.onblur = inputListener;
			input.onkeydown = inputListener;
		})();
	} else
		fix(val);
	this._handleSpellCheckerEvents(null);
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
			if (ids[i] != AjxUtil.getInnerText(span))
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
		sc.menu._doPopdown();
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
		 (plainText && /(click|mousedown|contextmenu)/i.test(ev.type))))
	{
		function makeMenu(fixall, parent) {
			var menu = new ZmPopupMenu(self.getParent()), item;
			menu.dontStealFocus();
			if (modified) {
				var text = "<b style='color: red'>Initial: " + word + "</b>";
				item = menu.createMenuItem("orig", {text:text});
				item.setData("fixall", fixall);
				item.setData("value", word);
				item.setData("orig", word);
				item.setData("spanId", p.id);
				item.addSelectionListener(self._spellCheckSuggestionListenerObj);
			}
			if (plainText) {
				// in plain text mode we want to be able to edit misspelled words
				var txt = fixall ? ZmMsg.editAll : ZmMsg.edit;
				item = menu.createMenuItem("edit", {text:txt, className:"ZMenuItem ZmSpellMenuItem"});
				item.setData("fixall", fixall);
				item.setData("orig", word);
				item.setData("spanId", p.id);
				item.addSelectionListener(self._spellCheckSuggestionListenerObj);
			}
			if (modified || plainText)
				menu.createSeparator();
			if (suggestions.length > 0) {
				for (var i = 0; i < suggestions.length; ++i) {
					item = menu.createMenuItem("sug-" + fixall + "" + i, {text:suggestions[i]});
					item.setData("fixall", fixall);
					item.setData("value", suggestions[i]);
					item.setData("orig", word);
					item.setData("spanId", p.id);
					item.addSelectionListener(self._spellCheckSuggestionListenerObj);
				}
			} else {
				item = menu.createMenuItem("clear", {text:ZmMsg.noSuggestions, className:"ZMenuItem ZmSpellMenuItem"});
				item.setData("fixall", fixall);
				item.setData("value", "");
				item.setData("orig", word);
				item.setData("spanId", p.id);
				menu.createSeparator();

				item = menu.createMenuItem("clear", {text:ZmMsg.clearText, className:"ZMenuItem ZmSpellMenuItem"});
				item.setData("fixall", fixall);
				item.setData("value", "");
				item.setData("orig", word);
				item.setData("spanId", p.id);
				item.addSelectionListener(self._spellCheckSuggestionListenerObj);
			}
			return menu;
		};
		sc.menu = makeMenu(0, this);
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
