/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * HTML editor which wraps TinyMCE
 *
 * @param {Hash}		params				a hash of parameters:
 * @param {constant}	posStyle				new message, reply, forward, or an invite action
 * @param {Object}		content
 * @param {constant}	mode
 * @param {Boolean}		withAce
 * @param {Boolean}		parentElement
 * @param {String}		textAreaId
 * @param {Function}	attachmentCallback		callback to create image attachment
 * @param {Function}	pasteCallback			callback invoked when data is pasted and uploaded to the server
 * @param {Function}	initCallback			callback invoked when the editor is fully initialized
 *
 * @author Satish S
 * @private
 */
ZmHtmlEditor = function() {
	if (arguments.length == 0) { return; }

	var params = Dwt.getParams(arguments, ZmHtmlEditor.PARAMS);

	if (!params.className) {
		params.className = 'ZmHtmlEditor';
	}

	if (!params.id) {
		params.id = Dwt.getNextId('ZmHtmlEditor');
	}

    DwtControl.call(this, params);

	this.isTinyMCE = window.isTinyMCE;
	this._mode = params.mode;
	this._hasFocus = {};
	this._bodyTextAreaId = params.textAreaId || this.getHTMLElId() + '_body';
	this._iFrameId = this._bodyTextAreaId + "_ifr";
	this._initCallbacks = [];
	this._attachmentCallback = params.attachmentCallback;
	this._pasteCallback = params.pasteCallback;
	this._onContentInitializeCallbacks = []
	this.initTinyMCEEditor(params);
    this._ignoreWords = {};
	this._classCount = 0;

    if (params.initCallback)
        this._initCallbacks.push(params.initCallback);

    var settings = appCtxt.getSettings();
    var listener = new AjxListener(this, this._settingChangeListener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_COLOR).addChangeListener(listener);
    //settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_FAMILY).addChangeListener(listener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_SIZE).addChangeListener(listener);
    settings.getSetting(ZmSetting.COMPOSE_INIT_DIRECTION).addChangeListener(listener);
    settings.getSetting(ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS).addChangeListener(listener);

	this.addControlListener(this._resetSize.bind(this));

	this.addListener(DwtEvent.ONFOCUS, this._onFocus.bind(this));
	this.addListener(DwtEvent.ONBLUR, this._onBlur.bind(this));
};

ZmHtmlEditor.PARAMS = [
	'parent',
	'posStyle',
	'content',
	'mode',
	'withAce',
	'parentElement',
	'textAreaId',
	'attachmentCallback',
	'initCallback'
];

ZmHtmlEditor.prototype = new DwtControl();
ZmHtmlEditor.prototype.constructor = ZmHtmlEditor;

ZmHtmlEditor.prototype.isZmHtmlEditor = true;
ZmHtmlEditor.prototype.isInputControl = true;
ZmHtmlEditor.prototype.toString = function() { return "ZmHtmlEditor"; };

ZmHtmlEditor.TINY_MCE_PATH = "/js/ajax/3rdparty/tinymce";

// used as a data key (mostly for menu items)
ZmHtmlEditor.VALUE = "value";

ZmHtmlEditor._INITDELAY = 50;

ZmHtmlEditor._containerDivId = "zimbraEditorContainer";

ZmHtmlEditor.prototype.getEditor =
function() {
	return  (window.tinyMCE) ? tinyMCE.get(this._bodyTextAreaId) : null;
};

ZmHtmlEditor.prototype.getBodyFieldId =
function() {
	if (this._mode == Dwt.HTML) {
		var editor = this.getEditor();
		return editor ? this._iFrameId : this._bodyTextAreaId;
	}

	return this._bodyTextAreaId;
};

ZmHtmlEditor.prototype.getBodyField =
function() {
	return document.getElementById(this.getBodyFieldId());
};

ZmHtmlEditor.prototype._resetSize =
function() {
	var field = this.getContentField();

	if (this._resetSizeAction) {
		clearTimeout(this._resetSizeAction);
		this._resetSizeAction = null;
	}

	if (field) {
		var bounds = this.boundsForChild(field);
		Dwt.setSize(field, bounds.width, bounds.height);
	}

	var editor = this.getEditor();

	if (!editor || !editor.getContentAreaContainer() || !editor.getBody()) {
		if (this.getVisible()) {
			this._resetSizeAction =
				setTimeout(ZmHtmlEditor.prototype._resetSize.bind(this), 100);
		}
		return;
	}

	var iframe = Dwt.byId(this._iFrameId);
	var bounds = this.boundsForChild(iframe);
	var x = bounds.width, y = bounds.height;

    //Subtracting editor toolbar heights
    AjxUtil.foreach(
        Dwt.byClassName('mce-toolbar-grp', editor.getContainer()),
        function(elem) {
            y -= Dwt.getSize(elem).y;
        }
    );

    // on Firefox, the toolbar is detected as unreasonably large during load;
    // so start the timer for small sizes -- even in small windows, the toolbar
    // should never be more than ~110px tall
    if (bounds.height - y > 200) {
        this._resetSizeAction =
            setTimeout(ZmHtmlEditor.prototype._resetSize.bind(this), 100);
        return;
    }

    //Subtracting spellcheckmodediv height
    var spellCheckModeDiv = this._spellCheckModeDivId && document.getElementById(this._spellCheckModeDivId);
    if (spellCheckModeDiv && spellCheckModeDiv.style.display !== "none") {
        y = y - Dwt.getSize(spellCheckModeDiv).y;
    }

	if (isNaN(x) || x < 0 || isNaN(y) || y < 0) {
		if (this.getVisible()) {
			this._resetSizeAction =
				setTimeout(ZmHtmlEditor.prototype._resetSize.bind(this), 100);
		}
		return;
	}

	Dwt.setSize(iframe, Math.max(0, x), Math.max(0, y));

	var body = editor.getBody();
	var bounds =
		Dwt.insetBounds(Dwt.insetBounds({x: 0, y: 0, width: x, height: y},
		                                Dwt.getMargins(body)),
		                Dwt.getInsets(body));

	Dwt.setSize(body, Math.max(0, bounds.width), Math.max(0, bounds.height));
};

ZmHtmlEditor.prototype.focus =
function(editor) {
    var currentObj = this,
        bodyField;

   if (currentObj._mode === Dwt.HTML) {
        editor = editor || currentObj.getEditor();
        if (currentObj._editorInitialized && editor) {
            editor.focus();
            currentObj.setFocusStatus(true);
            editor.getWin().scrollTo(0,0);
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
 * @param	{Boolean}	keepModeDiv	if <code>true</code>, _spellCheckModeDiv is not removed
 */
ZmHtmlEditor.prototype.getTextVersion = function (convertor, keepModeDiv) {
    this.discardMisspelledWords(keepModeDiv);
    return this._mode === Dwt.HTML
        ? this._convertHtml2Text(convertor)
        : this.getContentField().value;
};

ZmHtmlEditor.prototype._focus = function() {
	if (this._mode === Dwt.HTML && this.getEditor()) {
		this.getEditor().focus();
	}
};

/**
 * Returns the content of the editor.
 * 
 * @param {boolean}		insertFontStyle		if true, add surrounding DIV with font settings
 * @param {boolean}		onlyInnerContent	if true, do not surround with HTML and BODY
 */
ZmHtmlEditor.prototype.getContent =
function(addDivContainer, onlyInnerContent) {

    this.discardMisspelledWords();
    
	var field = this.getContentField();

	var content = "";
	if (this._mode == Dwt.HTML) {
		var editor = this.getEditor(),
            content1 = "";
        if (editor) {
            content1 = editor.save({ format:"raw", set_dirty: false });
        }
        else {
            content1 = field.value || "";
        }
        if (content1 && (/\S+/.test(AjxStringUtil.convertHtml2Text(content1)) || content1.match(/<img/i)) ) {
			content = this._embedHtmlContent(content1, addDivContainer, onlyInnerContent, this._classCount);
		}
	}
	else {
		if (/\S+/.test(field.value)) {
			content = field.value;
		}
	}

	return content;
};

ZmHtmlEditor.prototype._embedHtmlContent =
function(html, addDivContainer, onlyInnerContent, classCount) {

	html = html || "";
	if (addDivContainer) {
		if (classCount) {
			var editor = this.getEditor();
			var document = editor.getDoc();
			var containerEl = document.getElementById(ZmHtmlEditor._containerDivId);
			if (containerEl) {
				// Leave the previous container in place and update its
				// class (used for classCount)
				containerEl.setAttribute("class", classCount.toString());
				// Set to zero, so an additional classCount is not added in the new container
				classCount = 0;
			}
		}
		html = ZmHtmlEditor._addDivContainer(html, classCount);
	}
	return onlyInnerContent ? html : [ "<html><body>", html, "</body></html>" ].join("");
};
ZmHtmlEditor._embedHtmlContent = ZmHtmlEditor.prototype._embedHtmlContent;

ZmHtmlEditor._addDivContainer =
function(html, classCount) {
	return ZmHtmlEditor._getDivContainerPrefix(classCount) + html + ZmHtmlEditor._getDivContainerSuffix();
};

ZmHtmlEditor._getDivContainerPrefix =
function(classCount) {
	var recordClassCount = !!classCount;
	var a = [], i = 0;
	a[i++] = '<div ';
	if (recordClassCount) {
		a[i++] = 'id="' + ZmHtmlEditor._containerDivId + '" ';
	}
	a[i++] = 'style="';
	a[i++] = 'font-size: ';
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
	a[i++] = '; color: ';
	a[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
	a[i++] = '"';
    if (appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL) {
        a[i++] = ' dir="' + ZmSetting.RTL + '"';
    }
	// Cheat; Store the classCount (used for mapping excel classes to unique ids) in a class attribute.
	// Otherwise, if stored in a non-standard attribute, it gets stripped by the server defanger.
	if (recordClassCount) {
		a[i++] = ' class=' + classCount.toString() + ' '
	}
    a[i++] = ">";
	return a.join("");
};

ZmHtmlEditor._getDivContainerSuffix =
function() {
	return "</div>";
};

/*
 If editor is not initialized and mode is HTML, tinymce will automatically initialize the editor with the content in textarea
 */
ZmHtmlEditor.prototype.setContent = function (content) {
    if (this._mode === Dwt.HTML && this._editorInitialized) {
		var ed = this.getEditor();
        ed.setContent(content, {format:'raw'});
		this._setContentStyles(ed);
    } else {
        this.getContentField().value = content;
    }
    this._ignoreWords = {};
};

ZmHtmlEditor.prototype._setContentStyles = function(ed) {
    var document = ed.getDoc();

	// First, get the number of classes already added via paste; Only exists if this was retrieved from the server
	// (otherwise, use the in-memory this._classCount).  This is used to create unique class names for styles
	// imported on an Excel paste
	var containerDiv = document.getElementById(ZmHtmlEditor._containerDivId);
	if (containerDiv && containerDiv.hasAttribute("class")) {
		// Cheated - stored classCount in class, since non-standard attributes will be stripped by the
		// server html defanger.
		this._classCount = parseInt(containerDiv.getAttribute("class"));
		if (isNaN(this._classCount)) {
			this._classCount = 0;
		}
	}

	// Next, move all style nodes to be children of the body, otherwise when adding a style to the body, any subnode
	// style nodes will be deleted!
	var dom      = ed.dom;
	var body     = document.body;
	var styles   = dom.select("style", body);
	var parentNode;
	for (var i = 0; i < styles.length; i++) {
		parentNode = styles[i].parentNode;
		if (parentNode.tagName.toLowerCase() != 'body') {
			parentNode.removeChild(styles[i]);
			body.insertBefore(styles[i], body.childNodes[0]);
		}
	}
}

ZmHtmlEditor.prototype.reEnableDesignMode =
function() {
	// tinyMCE doesn't need to handle this
};

ZmHtmlEditor.prototype.getMode =
function() {
	return this._mode;
};

ZmHtmlEditor.prototype.isHtmlModeInited =
function() {
	return Boolean(this.getEditor());
};

ZmHtmlEditor.prototype._convertHtml2Text = function (convertor) {
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

ZmHtmlEditor.prototype.moveCaretToTop =
function(offset) {
	if (this._mode == Dwt.TEXT) {
		var control = this.getContentField();
		control.scrollTop = 0;
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
};

ZmHtmlEditor.prototype._moveCaretToTopHtml =
function(tryOnTimer, offset) {
	var editor = this.getEditor();
	var body = editor && editor.getDoc().body;
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
		var selection = editor && editor.selection ? editor.selection.getSel() : "";
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

	if (success) {
		editor.focus();
	} else if (tryOnTimer) {
		if (editor) {
			var action = new AjxTimedAction(this, this._moveCaretToTopHtml);
			AjxTimedAction.scheduleAction(action, ZmHtmlEditor._INITDELAY + 1);
		} else {
			var cb = ZmHtmlEditor.prototype._moveCaretToTopHtml;
			this._initCallbacks.push(cb.bind(this, tryOnTimer, offset));
		}
	}
};

ZmHtmlEditor.prototype.hasFocus =
function() {
	return Boolean(this._hasFocus[this._mode]);
};

/*ZmSignature editor contains getIframeDoc method dont want to break the existing code*/
ZmHtmlEditor.prototype._getIframeDoc = ZmHtmlEditor.prototype.getIframeDoc =
function() {
	var editor = this.getEditor();
	return editor ? editor.getDoc() : null;
};

ZmHtmlEditor.prototype._getIframeWin =
function() {
	var editor = this.getEditor();
	return editor ? editor.getWin() : null;
};

ZmHtmlEditor.prototype.clear =
function() {
	var editor = this.getEditor();
	if (editor && this._editorInitialized) {
		editor.undoManager && editor.undoManager.clear();
		this.clearDirty();
	}
	var textField = this.getContentField();
	if (!textField) {
		return;
	}

	//If HTML editor is not initialized and the current mode is HTML, then HTML editor is currently getting initialized. Text area should not be replaced at this time, as this will make the TinyMCE JavaScript reference empty for the text area.
	if (!this.isHtmlModeInited() && this.getMode() === Dwt.HTML) {
		return;
	}
	var textEl = textField.cloneNode(false);
	textField.parentNode.replaceChild(textEl, textField);//To clear undo/redo queue of textarea
	//cloning and replacing node will remove event handlers and hence adding it once again
	Dwt.setHandler(textEl, DwtEvent.ONFOCUS, this._onTextareaFocus.bind(this, true, true));
	Dwt.setHandler(textEl, DwtEvent.ONBLUR, this.setFocusStatus.bind(this, false, true));
    Dwt.setHandler(textEl, DwtEvent.ONKEYDOWN, this._handleTextareaKeyEvent.bind(this));
	if (editor) {
		// TinyMCE internally stored textarea element reference as targetElm which is lost after the above operation. Once targetElm is undefined TinyMCE will try to get the element using it's id.
		editor.targetElm = null;
	}
};

ZmHtmlEditor.prototype.initTinyMCEEditor = function(params) {

	var htmlEl = this.getHtmlElement();
	//textarea on which html editor is constructed
	var id = this._bodyTextAreaId;
	var textEl = document.createElement("textarea");
	textEl.setAttribute("id", id);
	textEl.setAttribute("name", id);
	textEl.setAttribute("aria-label", ZmMsg.composeBody);
    if( appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION) === ZmSetting.RTL ){
        textEl.setAttribute("dir", ZmSetting.RTL);
    }
	textEl.className = "ZmHtmlEditorTextArea";
    if ( params.content ) {
        textEl.value = params.content;
    }
	if (this._mode === Dwt.HTML) {
		//If the mode is HTML set the text area display as none. After editor is rendered with the content, TinyMCE editor's show method will be called for displaying the editor on the post render event.
		Dwt.setVisible(textEl, false);
	}
	htmlEl.appendChild(textEl);
	this._textAreaId = id;

    Dwt.setHandler(textEl, DwtEvent.ONFOCUS, this._onTextareaFocus.bind(this, true, true));
    Dwt.setHandler(textEl, DwtEvent.ONBLUR, this.setFocusStatus.bind(this, false, true));
    //Dwt.setHandler(textEl, DwtEvent.ONKEYDOWN, this._handleTextareaKeyEvent.bind(this));

	if (!window.tinyMCE) {
        window.tinyMCEPreInit = {};
        window.tinyMCEPreInit.suffix = '';
        window.tinyMCEPreInit.base = appContextPath + ZmHtmlEditor.TINY_MCE_PATH; // SET PATH TO TINYMCE HERE
        // Tell TinyMCE that the page has already been loaded
        window.tinyMCE_GZ = {};
        window.tinyMCE_GZ.loaded = true;

		var callback = this.initEditorManager.bind(this, id, params.autoFocus);
        AjxDispatcher.require(["TinyMCE"], true, callback);
	} else {
		this.initEditorManager(id, params.autoFocus);
	}
};

ZmHtmlEditor.prototype.addOnContentInitializedListener =
function(callback) {
	this._onContentInitializeCallbacks.push(callback);
};

ZmHtmlEditor.prototype.clearOnContentInitializedListeners =
function() {
	this._onContentInitializeCallback = null;
};

ZmHtmlEditor.prototype._handleEditorKeyEvent = function(ev) {

	var ed = this.getEditor(),
	    retVal = true;

    if (DwtKeyboardMgr.isPossibleInputShortcut(ev) || (ev.keyCode === DwtKeyEvent.KEY_TAB && (ev.shiftKey || !appCtxt.get(ZmSetting.TAB_IN_EDITOR)))) {
        // pass to keyboard mgr for kb nav
        retVal = DwtKeyboardMgr.__keyDownHdlr(ev);
    }
    else if (DwtKeyEvent.IS_RETURN[ev.keyCode]) { // enter key
        var parent,
            selection,
            startContainer,
            editorDom,
            uniqueId,
            blockquote,
            nextSibling,
            divElement,
            splitElement;

        if (ev.shiftKey) {
            return;
        }

        selection = ed.selection;
        parent = startContainer = selection.getRng(true).startContainer;
        if (!startContainer) {
            return;
        }

        editorDom = ed.dom;
        //Gets all parent block elements
        blockquote = editorDom.getParents(startContainer, "blockquote", ed.getBody());
        if (!blockquote) {
            return;
        }

        blockquote = blockquote.pop();//Gets the last blockquote element
        if (!blockquote || !blockquote.style.borderLeft) {//Checking blockquote left border for verifying it is reply blockquote
            return;
        }

        uniqueId = editorDom.uniqueId();
        ed.undoManager.add();
        try {
            selection.setContent("<div id='" + uniqueId + "'><br></div>");
        }
        catch (e) {
            return;
        }

        divElement = ed.getDoc().getElementById(uniqueId);
        if (divElement) {
            divElement.removeAttribute("id");
        }
        else {
            return;
        }

        nextSibling = divElement.nextSibling;
        if (nextSibling && nextSibling.nodeName === "BR") {
            nextSibling.parentNode.removeChild(nextSibling);
        }

        try {
            splitElement = editorDom.split(blockquote, divElement);
            if (splitElement) {
                selection.select(splitElement);
                selection.collapse(true);
                ev.preventDefault();
            }
        }
        catch (e) {
        }
    }
    else if (ZmHtmlEditor.isEditorTab(ev)) {
        ed.execCommand('mceInsertContent', false, '&emsp;');
        DwtUiEvent.setBehaviour(ev, true, false);
        return false;
    }


    if (window.DwtIdleTimer) {
		DwtIdleTimer.resetIdle();
	}

	if (window.onkeydown) {
		window.onkeydown.call(this);
	}
	
	return retVal;
};

// Text mode key event handler
ZmHtmlEditor.prototype._handleTextareaKeyEvent = function(ev) {

    if (ZmHtmlEditor.isEditorTab(ev)) {
        Dwt.insertText(this.getContentField(), '\t');
        DwtUiEvent.setBehaviour(ev, true, false);
        return false;
    }
    return true;
};

//Notifies mousedown event in tinymce editor to ZCS
ZmHtmlEditor.prototype._handleEditorMouseDownEvent =
function(ev) {
    DwtOutsideMouseEventMgr.forwardEvent(ev);
};

ZmHtmlEditor.prototype.onLoadContent =
function(ev) {
	if (this._onContentInitializeCallbacks) {
		AjxDebug.println(AjxDebug.REPLY, "ZmHtmlEditor::onLoadContent - run callbacks");
		AjxUtil.foreach(this._onContentInitializeCallbacks,
		                function(fn) { fn.run() });
	}
};

ZmHtmlEditor.prototype.setFocusStatus =
function(hasFocus, isTextModeFocus) {
	var mode = isTextModeFocus ? Dwt.TEXT : Dwt.HTML;
	this._hasFocus[mode] = hasFocus;

	Dwt.condClass(this.getHtmlElement(), hasFocus, DwtControl.FOCUSED);

	if (!isTextModeFocus) {
		Dwt.condClass(this.getEditor().getBody(), hasFocus,
		              'mce-active-editor', 'mce-inactive-editor');
	}
};

ZmHtmlEditor.prototype._onTextareaFocus = function() {

    this.setFocusStatus(true, true);
    appCtxt.getKeyboardMgr().updateFocus(this.getContentField());
};

ZmHtmlEditor.prototype.initEditorManager =
function(id, autoFocus) {

	var obj = this;

    if (!window.tinyMCE) {//some problem in loading TinyMCE files
        return;
    }

	var urlParts = AjxStringUtil.parseURL(location.href);

	//important: tinymce doesn't handle url parsing well when loaded from REST URL - override baseURL/baseURI to fix this
	tinymce.baseURL = appContextPath + ZmHtmlEditor.TINY_MCE_PATH;

	if (tinymce.EditorManager) {
		tinymce.EditorManager.baseURI = new tinymce.util.URI(urlParts.protocol + "://" + urlParts.authority + tinymce.baseURL);
	}

	if (tinymce.dom) {
		tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
	}

	if (tinymce.dom && tinymce.dom.Event) {
		tinymce.dom.Event.domLoaded = true;
	}

	var toolbarbuttons = [
		'pramukhime pramukhimehelp |',
		//'fontselect fontsizeselect formatselect |',
		'fontsizeselect formatselect |',
		'bold italic underline strikethrough removeformat |',
		'forecolor backcolor |',
		'outdent indent bullist numlist blockquote |',
		'alignleft aligncenter alignright alignjustify |',
		this._attachmentCallback ? 'zimage' : 'image',
		'link zemoticons charmap hr table |',
		appCtxt.get(ZmSetting.SHOW_COMPOSE_DIRECTION_BUTTONS) ? 'ltr rtl |' : '',
		'undo redo |'
	];

	// NB: contextmenu plugin deliberately omitted; it's confusing
	var plugins = [
		"zemoticons",
		"pramukhime",
		"table", "directionality", "textcolor", "lists", "advlist",
		"link", "hr", "charmap", "code", "image", "autolink", "noneditable"
	];

	if (this._attachmentCallback) {
		tinymce.PluginManager.add('zimage', function(editor) {
			editor.addButton('zimage', {
                icon: 'image',
                tooltip: ZmMsg.insertImage,
                onclick: obj._attachmentCallback,
                stateSelector: 'img:not([data-mce-object])'
			});
		});

		plugins.push('zimage');
	}

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

	if (!autoFocus) {
		// if !true, Set to false in case undefined
		autoFocus = false;
	}
    var tinyMCEInitObj = {
		mode :  (this._mode == Dwt.HTML)? "exact" : "none",
		theme: 'modern',
		auto_focus: autoFocus,
        plugins : plugins.join(' '),
		toolbar: toolbarbuttons.join(' '),
		toolbar_items_size: 'small',
		selector: "#" + id,
		statusbar: false,
		menubar: false,
		ie7_compat: false,
		object_resizing : true,
		pramukhime_options : {
			selected_value: 'pramukhindic:hindi'
        },
        //font_formats : fonts.join(";"),
        fontsize_formats : AjxMsg.fontSizes || '',
		convert_urls : true,
		verify_html : false,
		browser_spellcheck : true,
        content_css : appContextPath + '/css/tinymce-content.css?v=' + cacheKillerVersion,
        dialog_type : "modal",
        forced_root_block : "div",
        width: "100%",
        height: "auto",
        visual: false,
        language: tinyMCE.getlanguage(appCtxt.get(ZmSetting.LOCALE_NAME)),
        directionality : appCtxt.get(ZmSetting.COMPOSE_INIT_DIRECTION),
        paste_retain_style_properties : "all",
		paste_data_images: false,
        paste_remove_styles_if_webkit : false,
        table_default_attributes: { cellpadding: '3px', border: '1px' },
        table_default_styles: { width: '90%', tableLayout: 'fixed' },
		setup : function(ed) {
            ed.on('LoadContent', obj.onLoadContent.bind(obj));
            ed.on('PostRender', obj.onPostRender.bind(obj));
            ed.on('init', obj.onInit.bind(obj));
            //ed.on('keydown', obj._handleEditorKeyEvent.bind(obj));
            ed.on('MouseDown', obj._handleEditorMouseDownEvent.bind(obj));
            ed.on('paste', obj.onPaste.bind(obj));
            ed.on('PastePostProcess', obj.pastePostProcess.bind(obj));
            ed.on('BeforeExecCommand', obj.onBeforeExecCommand.bind(obj));

            ed.on('contextmenu', obj._handleEditorEvent.bind(obj));
            ed.on('mouseup', obj._handleEditorEvent.bind(obj));
        }
    };

	tinyMCE.init(tinyMCEInitObj);
	this._editor = this.getEditor();
};

ZmHtmlEditor.prototype.onPaste = function(ev) {
    if (!this._pasteCallback)
        return;

    var items = ((ev.clipboardData &&
                  (ev.clipboardData.items || ev.clipboardData.files)) ||
                 (window.clipboardData && clipboardData.files)),
        item = items && items[0],
        file, name, type,
        view;

	if (item && item.getAsFile) {
		file = item.getAsFile();
		name = file && file.fileName;
		type = file && file.type;
	} else if (item && item.type) {
		file = item;
		name = file.name;
		type = file.type;
	}

	if (file) {
		ev.stopPropagation();
		ev.preventDefault();
		var headers = {
			"Cache-Control": "no-cache",
			"X-Requested-With": "XMLHttpRequest",
			"Content-Type": type,
			//For paste from clipboard filename is undefined
			"Content-Disposition": 'attachment; filename="' + (name ? AjxUtil.convertToEntities(name) : ev.timeStamp || new Date().getTime()) + '"'
		};
		var url = (appCtxt.get(ZmSetting.CSFE_ATTACHMENT_UPLOAD_URI) +
				   "?fmt=extended,raw");

		var fn = AjxRpc.invoke.bind(AjxRpc, file, url, headers,
		                            this._handlePasteUpload.bind(this),
		                            AjxRpcRequest.HTTP_POST);

		// IE11 appears to disallow AJAX requests within the event handler
		if (AjxEnv.isTrident) {
			setTimeout(fn, 0);
		} else {
			fn();
		}
    }  else  {
		var clipboardContent = this.getClipboardContent(ev);
		if (this.hasContentType(clipboardContent, 'text/html')) {
			var content = clipboardContent['text/html'];
			if (content) {
				this.pasteHtml(content);
				ev.stopPropagation();
				ev.preventDefault();
			}
		}
	}
};

ZmHtmlEditor.prototype.getDataTransferItems = function(dataTransfer) {
	var data = {};

	if (dataTransfer) {
		// Use old WebKit/IE API
		if (dataTransfer.getData) {
			var legacyText = dataTransfer.getData('Text');
			if (legacyText && legacyText.length > 0) {
				data['text/plain'] = legacyText;
			}
		}

		if (dataTransfer.types) {
			for (var i = 0; i < dataTransfer.types.length; i++) {
				var contentType = dataTransfer.types[i];
				data[contentType] = dataTransfer.getData(contentType);
			}
		}
	}

	return data;
};


ZmHtmlEditor.prototype.hasContentType = function(clipboardContent, mimeType) {
	return mimeType in clipboardContent && clipboardContent[mimeType].length > 0;
};

ZmHtmlEditor.prototype.getClipboardContent = function(clipboardEvent) {
	return this.getDataTransferItems(clipboardEvent.clipboardData || this.getEditor().getDoc().dataTransfer);
};


ZmHtmlEditor.prototype.pasteHtml = function(html) {
	var ed = this.getEditor();
	var args, dom = ed.dom;

	var document = ed.getDoc();
	var numOriginalStyleSheets = document.styleSheets ? document.styleSheets.length : 0;
	var styleSheets    = document.styleSheets;

	// We need to attach the element to the DOM so Sizzle selectors work on the contents
	var tempBody = dom.add(ed.getBody(), 'div', {style: 'display:none'}, html);
	args = ed.fire('PastePostProcess', {node: tempBody});
	html = args.node.innerHTML;

	var styleNodes = [];
	if (!args.isDefaultPrevented()) {
		var re;
		for (var i = numOriginalStyleSheets; i < styleSheets.length; i++) {
			// Access and update the stylesheet class names, to insure no collisions
			var stylesheet = styleSheets[i];
			var updates = this._getPastedClassUpdates(stylesheet);
			var styleHtml = stylesheet.ownerNode.innerHTML;
			for (var selectorText in updates) {
				// Replace the non-unique Excel class names with unique new ones in style html and pasted content html.
				var newSelectorText = updates[selectorText];
				re = new RegExp(selectorText.substring(1), 'g');
				html = html.replace(re, newSelectorText.substring(1));
				styleHtml = styleHtml.replace(selectorText, newSelectorText);
			}
			// Excel .5pt line doesn't display in Chrome - use a 1pt line.  Somewhat fragile (Assuming width is the
			// first attribute for border, following the ':'), but need to do so that we only replace a standalone .5pt
			re = new RegExp(":.5pt", 'g');
			styleHtml = styleHtml.replace(re, ":1pt");
			// Microsoft special, just use 'black'
			re = new RegExp("windowtext", 'g');
			styleHtml = styleHtml.replace(re, "black");

			// Create a new style node and record it; it will be added below to the body with the new content
			var styleNode = document.createElement('style');
			styleNode.type = "text/css";
			var scoped = document.createAttribute("scoped");
			styleNode.setAttributeNode(scoped);
			styleNode.innerHTML = styleHtml;
			styleNodes.push(styleNode);
		}
	}

	dom.remove(tempBody);

	if (!args.isDefaultPrevented()) {
		var body = document.body;
		for (var i = 0; i < styleNodes.length; i++) {
			// Insert the styles into the body.  Modern browsers support this (even though its not strictly valid), and
			// the 'scoped' attribute added above means that future browsers should treat it as valid.
			body.insertBefore(styleNodes[i], body.childNodes[0]);
		}
		ed.insertContent(html, {merge: ed.settings.paste_merge_formats !== false});
	}
};

ZmHtmlEditor.prototype._getPastedClassUpdates = function(styleSheet) {
    var cssRules = styleSheet.cssRules;
	var updates = {};
	if (cssRules) {
		for (var i = 0; i < cssRules.length; i++) {
			var selectorText = cssRules[i].selectorText;
			// Excel class definitions (for now) start with ".xl", but this tries to be a little less specific (and fragile).
			// Convert the Excel class names (which may be duplicated with each paste) to unique class names, so that
			// later paste formatting doesn't step on previous formatting.
			if (selectorText && selectorText.indexOf(".") == 0) {
				// Create a new unique class name that will be used instead
				var newSelectorText = ".zimbra" + (++this._classCount).toString();
				updates[selectorText] = newSelectorText;
			}
		}
	}
	// Return a map of { oldClassName : newClassName }
	return updates;
}

ZmHtmlEditor.prototype._handlePasteUpload = function(r) {
	if (r && r.success) {
		var resp = eval("["+r.text+"]");
		if(resp.length === 3) {
			resp[2].clipboardPaste = true;
		}
		this._pasteCallback(resp);
	}
};


ZmHtmlEditor.prototype.onPostRender = function(ev) {
	var ed = this.getEditor();

    ed.dom.setStyles(ed.getBody(), {//"font-family" : appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY),
                                    "font-size"   : appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE),
                                    "color"       : appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR)
                                   });
	//Shows the editor and hides any textarea/div that the editor is supposed to replace.
	ed.show();
    this._resetSize();
};

ZmHtmlEditor.prototype.onInit = function(ev) {

	var ed = this.getEditor();
    var obj = this,
        tinymceEvent = tinymce.dom.Event,
        doc = ed.getDoc(),
        win = ed.getWin(),
        view = obj.parent;

    obj.setFocusStatus(false);

    ed.on('focus', function(e) {
        DBG.println(AjxDebug.FOCUS, "EDITOR got focus");
		appCtxt.getKeyboardMgr().updateFocus(obj._getIframeDoc().body);
        obj.setFocusStatus(true);
    });
    ed.on('blur', function(e) {
        obj.setFocusStatus(false);
    });
    // Sets up the a range for the current ins point or selection. This is IE only because the iFrame can
    // easily lose focus (e.g. by clicking on a button in the toolbar) and we need to be able to get back
    // to the correct insertion point/selection.
    // Here we are registering this dedicated event to store the bookmark which will fire when focus moves outside the editor
    if(AjxEnv.isIE){
        tinymceEvent.bind(doc, 'beforedeactivate', function(e) {
            if(ed.windowManager){
                ed.windowManager.bookmark = ed.selection.getBookmark(1);
            }
        });
    }

    ed.on('open', ZmHtmlEditor.onPopupOpen);
    if (view && view.toString() === "ZmComposeView" && ZmDragAndDrop.isSupported()) {
        var dnd = view._dnd;
        tinymceEvent.bind(doc, 'dragenter', this._onDragEnter.bind(this));
        tinymceEvent.bind(doc, 'dragleave', this._onDragLeave.bind(this));
        tinymceEvent.bind(doc, 'dragover', this._onDragOver.bind(this, dnd));
        tinymceEvent.bind(doc, 'drop', this._onDrop.bind(this, dnd));
    }

    obj._editorInitialized = true;

	// Access the content stored in the textArea (if any)
	var contentField = this.getContentField();
	var content =  contentField.value;
	contentField.value = "";
	// Use our setContent to set up the content using the 'raw' format, which preserves styling
	this.setContent(content);

	this._resetSize();
	this._setupTabGroup();

	var iframe = Dwt.getElement(this._iFrameId);
	if (iframe) {
		Dwt.addClass(iframe, 'ZmHtmlEditorIFrame');
		iframe.setAttribute('title', ZmMsg.htmlEditorTitle);
		var body = this._getIframeDoc().body;
		if (body) {
			body.setAttribute('aria-label', ZmMsg.composeBody);
		}
	}

    AjxUtil.foreach(this._initCallbacks, function(fn) { fn.run() });
};

ZmHtmlEditor.prototype._onFocus = function() {
	var editor = this.getEditor();

	if (this._mode === Dwt.HTML && editor) {
		editor.fire('focus', {focusedEditor: editor});
	}
};

ZmHtmlEditor.prototype._onBlur = function() {
	var editor = this.getEditor();

	if (this._mode === Dwt.HTML && editor) {
		editor.fire('blur', {focusedEditor: null});
	}
};


ZmHtmlEditor.prototype.__getEditorControl = function(type, tooltip) {
	// This method provides a naive emulation of the control manager offered in
	// TinyMCE 3.x. We assume that there's only one control of a given type
	// with a given tooltip in the entire TinyMCE control hierarchy. Hopefully,
	// this heuristic won't prove too fragile.
	var ed = this.getEditor();

	function finditem(item) {
		// the tooltip in settings appears constant and unlocalized
		if (item.type === type && item.settings.tooltip === tooltip)
			return item;

		if (typeof item.items === 'function') {
			var items = item.items();

			for (var i = 0; i < items.length; i++) {
				var r = finditem(items[i]);
				if (r)
					return r;
			}
		}

		if (typeof item.menu === 'object') {
			return finditem(item.menu);
		}
	};

	return ed ? finditem(ed.theme.panel) : null;
};

/*
**   TinyMCE will fire onBeforeExecCommand before executing all commands
 */
ZmHtmlEditor.prototype.onBeforeExecCommand = function(ev) {
    if (ev.command === "mceImage") {
        this.onBeforeInsertImage(ev);
    }
    else if (ev.command === "mceRepaint") { //img src modified
        this.onBeforeRepaint(ev);
    }
};

ZmHtmlEditor.prototype.onBeforeInsertImage = function(ev) {
    var element = ev.target.selection.getNode();
    if (element && element.nodeName === "IMG") {
        element.setAttribute("data-mce-src", element.src);
        element.setAttribute("data-mce-zsrc", element.src);//To find out whether src is modified or not set a dummy attribute
    }
};

ZmHtmlEditor.prototype.onBeforeRepaint = function(ev) {
    var element = ev.target.selection.getNode();
    if (element && element.nodeName === "IMG") {
        if (element.src !== element.getAttribute("data-mce-zsrc")) {
            element.removeAttribute("dfsrc");
        }
        element.removeAttribute("data-mce-zsrc");
    }
};

ZmHtmlEditor.prototype._onDragEnter = function() {
    Dwt.addClass(Dwt.getElement(this._iFrameId), "DropTarget");
};

ZmHtmlEditor.prototype._onDragLeave = function() {
    Dwt.delClass(Dwt.getElement(this._iFrameId), "DropTarget");
};

ZmHtmlEditor.prototype._onDragOver = function(dnd, ev) {
    dnd._onDragOver(ev);
};

ZmHtmlEditor.prototype._onDrop = function(dnd, ev) {
    dnd._onDrop(ev, true);
    Dwt.delClass(Dwt.getElement(this._iFrameId), "DropTarget");
};

ZmHtmlEditor.prototype.setMode = function (mode, convert, convertor) {

    this.discardMisspelledWords();
    if (mode === this._mode || (mode !== Dwt.HTML && mode !== Dwt.TEXT)) {
        return;
    }
    this._mode = mode;
	var textarea = this.getContentField();
    if (mode === Dwt.HTML) {
        if (convert) {
            textarea.value = AjxStringUtil.convertToHtml(textarea.value, true);
        }
        if (this._editorInitialized) {
	        // tinymce will automatically toggle the editor and set the corresponding content.
            tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);
        }
        else {
            //switching from plain text to html using tinymces mceToggleEditor method is always
            // using the last editor creation setting. Due to this current ZmHtmlEditor object
            // always point to last ZmHtmlEditor object. Hence initializing the tinymce editor
            // again for the first time when mode is switched from plain text to html.
            this.initEditorManager(this._bodyTextAreaId);
        }
    } else {
        if (convert) {
            var content;
            if (this._editorInitialized) {
                content = this._convertHtml2Text(convertor);
            }
            else {
                content = AjxStringUtil.convertHtml2Text(textarea.value);
            }
        }
        if (this._editorInitialized) {
	        //tinymce will automatically toggles the editor and sets the corresponding content.
            tinyMCE.execCommand('mceToggleEditor', false, this._bodyTextAreaId);
        }
        if (convert) {
            //tinymce will set html content directly in textarea. Resetting the content after removing the html tags.
            this.setContent(content);
        }

        Dwt.setVisible(textarea, true);
    }

	textarea = this.getContentField();
	textarea.setAttribute('aria-hidden', !Dwt.getVisible(textarea));

	if(this._editorInitialized) {
		this._setupTabGroup();
		this._resetSize();
	}
};

ZmHtmlEditor.prototype.getContentField =
function() {
	return document.getElementById(this._bodyTextAreaId);
};

ZmHtmlEditor.prototype.insertImage =
function(src, dontExecCommand, width, height, dfsrc) {
	// We can have a situation where:
	//   Paste plugin does a createPasteBin, creating a marker element that it uses
	//   We upload a pasted image.
	//   The upload completes, and we do a SaveDraft. It calls insertImage.
	//   A timeout function from the plugin executes before or after insertImage, and calls removePasteBin.
	//
	//   InsertImage executes. If the pasteBin has not been removed when we try to insert the image, it interferes with
	//   tinyMCE insertion.  No image is inserted in the editor body, and we end up with an attachment
	//    bubble instead.
	var  pasteBinClone;
	var ed = this.getEditor();

	// *** Begin code copied from Paste Plugin Clipboard.js, removePasteBin
	while ((pasteBinClone = ed.dom.get('mcepastebin'))) {
		ed.dom.remove(pasteBinClone);
		ed.dom.unbind(pasteBinClone);
	}
	// *** End copied code from removePasteBin

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


    ed.focus();

	//tinymce modifies the source when using mceInsertContent
    //ed.execCommand('mceInsertContent', false, html.join(""), {skip_undo : 1});
    ed.execCommand('mceInsertRawHTML', false, html.join(""), {skip_undo : 1});
};

ZmHtmlEditor.prototype.replaceImage =
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

/*
This function will replace all the img elements matching src
 */
ZmHtmlEditor.prototype.replaceImageSrc =
function(src, newsrc){
	var doc = this.getEditor().getDoc();
	if(doc){
		var images = doc.getElementsByTagName('img');
		if (images && images.length > 0) {
			AjxUtil.foreach(images,function(img) {
				if (img.src && img.src == src) {
					img.src = newsrc;
					img.removeAttribute("id");
					img.removeAttribute("data-mce-src");
					img.removeAttribute("data-zim-uri");
				}
			});
		}
	}
};

ZmHtmlEditor.prototype.resetSpellCheck =
function() {
	//todo: remove this when spellcheck is disabled
	this.discardMisspelledWords();
	this._spellCheckHideModeDiv();
};

/**SpellCheck modules**/

ZmHtmlEditor.prototype.checkMisspelledWords =
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

ZmHtmlEditor.prototype.spellCheck =
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

ZmHtmlEditor.prototype._spellCheckCallback =
function(words) {
    // Remove the below comment for hard coded spell check response for development
    //words = {"misspelled":[{"word":"onee","suggestions":"one,nee,knee,once,ones,one's"},{"word":"twoo","suggestions":"two,too,woo,twos,two's"},{"word":"fourrr","suggestions":"Fourier,furor,furry,firer,fuhrer,fore,furrier,four,furrow,fora,fury,fours,ferry,foray,flurry,four's"}],"available":true};
	var wordsFound = false;

	if (words && words.available) {
		var misspelled = words.misspelled;
		if (misspelled == null || misspelled.length == 0) {
			appCtxt.setStatusMsg(ZmMsg.noMisspellingsFound, ZmStatusView.LEVEL_INFO);
			this._spellCheckHideModeDiv();
		} else {
			var msg = AjxMessageFormat.format(ZmMsg.misspellingsResult, misspelled.length);
			appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);

			this.highlightMisspelledWords(misspelled);
			wordsFound = true;
		}
	} else {
		appCtxt.setStatusMsg(ZmMsg.spellCheckUnavailable, ZmStatusView.LEVEL_CRITICAL);
	}

	if (AjxEnv.isGeckoBased && this._mode == Dwt.HTML) {
		setTimeout(AjxCallback.simpleClosure(this.focus, this), 10);
	}

	if (this.onExitSpellChecker) {
		this.onExitSpellChecker.run(wordsFound);
	}
};

ZmHtmlEditor.prototype._spellCheckSuggestionListener =
function(ev) {
	var self = this;
	var item = ev.item;
	var orig = item.getData("orig");
	if (!orig) { return; }

	var val = item.getData(ZmHtmlEditor.VALUE);
	var plainText = this._mode == Dwt.TEXT;
	var fixall = item.getData("fixall");
	var doc = plainText ? document : this._getIframeDoc();
	var span = doc.getElementById(item.getData("spanId"));
	var action = item.getData(ZmOperation.MENUITEM_ID);
	switch (action) {
		case "ignore":
			val = orig;
			this._ignoreWords[val] = true;
//			if (fixall) {
				// TODO: visually "correct" all of them
//			}
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

ZmHtmlEditor.prototype._getEditorDocument = function() {
	var plainText = this._mode == Dwt.TEXT;
	return plainText ? document : this._getIframeDoc();
};

ZmHtmlEditor.prototype._editWord = function(fixall, spanEl) {
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

ZmHtmlEditor.prototype._editWordHandler = function(fixall, spanEl, ev) {
	// the event gets lost after 20 milliseconds so we need
	// to save the following :(
	setTimeout(AjxCallback.simpleClosure(this._editWordHandler2, this, fixall, spanEl, ev), 20);
};
ZmHtmlEditor.prototype._editWordHandler2 = function(fixall, spanEl, ev) {
	ev = DwtUiEvent.getEvent(ev);
	var evType = ev.type;
	var evKeyCode = ev.keyCode;
	var evCtrlKey = ev.ctrlKey;
	var input = DwtUiEvent.getTarget(ev);
	var keyEvent = /key/.test(evType);
	var removeInput = true;
	if (/blur/.test(evType) || (keyEvent && DwtKeyEvent.IS_RETURN[evKeyCode])) {
		if (evCtrlKey)
			fixall =! fixall;
		var orig = AjxUtil.getInnerText(spanEl);
		var spanEls = fixall ? this._spellCheck.wordIds[orig] : spanEl;
		this._editWordFix(spanEls, input.value);
	} else if (keyEvent && evKeyCode === DwtKeyEvent.KEY_ESCAPE) {
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

ZmHtmlEditor.prototype._editWordFix = function(spanEls, value) {
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

ZmHtmlEditor.prototype._getParentElement =
function() {
	var ed = this.getEditor();
	if (ed.selection) {
		return ed.selection.getNode();
	} else {
		var doc = this._getIframeDoc();
		return doc ? doc.body : null;
	}
};

ZmHtmlEditor.prototype._handleSpellCheckerEvents =
function(ev) {
	var plainText = this._mode == Dwt.TEXT;
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
		sc.menu = this._spellCheckCreateMenu(this.parent, 0, suggestions, word, p.id, modified);
		var pos, ms = sc.menu.getSize(), ws = this.shell.getSize();
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
		return false;
	}
};

ZmHtmlEditor.prototype._spellCheckCreateMenu = function(parent, fixall, suggestions, word, spanId, modified) {
    
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

    var plainText = this._mode == Dwt.TEXT;
    if (!fixall || plainText) {
        menu.createSeparator();
    }

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

ZmHtmlEditor.prototype._spellCheckCreateMenuItem =
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

ZmHtmlEditor.prototype.discardMisspelledWords =
function(keepModeDiv) {
	if (!this._spellCheck) { return; }

    var size = this.getSize();
	if (this._mode == Dwt.HTML) {
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
    this._resetSize();
};

ZmHtmlEditor.prototype._spellCheckShowModeDiv =
function() {
	var size = this.getSize();

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
		var container = this.getHtmlElement();
		container.insertBefore(div, container.firstChild);

		var el = div.getElementsByTagName("span");
		Dwt.associateElementWithObject(el[0], this);
		Dwt.setHandler(el[0], "onclick", ZmHtmlEditor._spellCheckResumeEditing);
		Dwt.associateElementWithObject(el[1], this);
		Dwt.setHandler(el[1], "onclick", ZmHtmlEditor._spellCheckAgain);
	}
	else {
		document.getElementById(this._spellCheckModeDivId).style.display = "";
	}
    this._resetSize();
};

ZmHtmlEditor._spellCheckResumeEditing =
function() {
	var editor = Dwt.getObjectFromElement(this);
	editor.discardMisspelledWords();
    editor.focus();
};

ZmHtmlEditor._spellCheckAgain =
function() {
    Dwt.getObjectFromElement(this).spellCheck(null, true);
};


ZmHtmlEditor.prototype._spellCheckHideModeDiv =
function() {
	var size = this.getSize();
	if (this._spellCheckModeDivId) {
		document.getElementById(this._spellCheckModeDivId).style.display = "none";
	}
    this._resetSize();
};

ZmHtmlEditor.prototype.highlightMisspelledWords =
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
				for (var i = node.firstChild; i; i = rec(i)) {}
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

	if (this._mode == Dwt.HTML) {
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
ZmHtmlEditor.prototype.isSpellCheckMode = function() {
    return Boolean( this._spellCheck );
};

ZmHtmlEditor.prototype._loadExternalStyle =
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

ZmHtmlEditor.prototype._registerEditorEventHandler = function(iFrameDoc, name) {

	if (iFrameDoc.attachEvent) {
		iFrameDoc.attachEvent("on" + name, this.__eventClosure);
	}
    else if (iFrameDoc.addEventListener) {
		iFrameDoc.addEventListener(name, this.__eventClosure, true);
	}
};

ZmHtmlEditor.prototype._unregisterEditorEventHandler = function(iFrameDoc, name) {

	if (iFrameDoc.detachEvent) {
		iFrameDoc.detachEvent("on" + name, this.__eventClosure);
	}
    else if (iFrameDoc.removeEventListener) {
		iFrameDoc.removeEventListener(name, this.__eventClosure, true);
	}
};

ZmHtmlEditor.prototype.__eventClosure =
function(ev) {
	this._handleEditorEvent(AjxEnv.isIE ? this._getIframeWin().event : ev);
	return tinymce.dom.Event.cancel(ev);
};


ZmHtmlEditor.prototype._handleEditorEvent =
function(ev) {
	var ed = this.getEditor();
	var retVal = true;

	var self = this;

	var target = ev.srcElement || ev.target; //in FF we get ev.target and not ev.srcElement.
	if (this._spellCheck && target && target.id in this._spellCheck.spanIds) {
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
		ev.stopImmediatePropagation();
		ev.stopPropagation();
		ev.preventDefault();
		return tinymce.dom.Event.cancel(ev);
	}

	return retVal;
};

ZmHtmlEditor.prototype._getSelection =
function() {
	if (AjxEnv.isIE) {
		return this._getIframeDoc().selection;
	} else {
		return this._getIframeWin().getSelection();
	}
};

/*
 * Returns toolbar row of tinymce
 *
 *  @param {Number}	Toolbar Row Number 1,2
 *  @param {object}	tinymce editor
 *  @return	{Toolbar HTML Element}
 */
ZmHtmlEditor.prototype.getToolbar =
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
ZmHtmlEditor.prototype.getToolbarButton =
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

/*
 *  Inserting image for signature
 */
ZmHtmlEditor.prototype.insertImageDoc =
function(file) {
    var src = file.rest;
    if (!src) { return; }
    var path = appCtxt.get(ZmSetting.REST_URL) + ZmFolder.SEP;
    var dfsrc = file.docpath;
    if (dfsrc && dfsrc.indexOf("doc:") == 0) {
        var url = [path, dfsrc.substring(4)].join('');
        src = AjxStringUtil.fixCrossDomainReference(url, false, true);
    }
    this.insertImage(src, null, null, null, dfsrc);
};

/*
 *  Insert image callback
 */
ZmHtmlEditor.prototype._imageUploaded = function(folder, fileNames, files) {

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var path = appCtxt.get(ZmSetting.REST_URL) + ZmFolder.SEP;
		var docPath = folder.getRestUrl() + ZmFolder.SEP + file.name;
		file.docpath = ["doc:", docPath.substr(docPath.indexOf(path) + path.length)].join("");
		file.rest = folder.getRestUrl() + ZmFolder.SEP + AjxStringUtil.urlComponentEncode(file.name);

		this.insertImageDoc(file);
	}

	//note - it's always one file so far even though the code above support a more than one item array.
	//toast so the user understands uploading an image result in it being in the briefcase.
	appCtxt.setStatusMsg(ZmMsg.imageUploadedToBriefcase);

};

/**
 * This will be fired before every popup open
 *
 * @param {windowManager} tinymce window manager for popups
 * @param {popupWindow}	contains tinymce popup info or popup DOM Window
 *
 */
ZmHtmlEditor.onPopupOpen = function(windowManager, popupWindow) {
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
ZmHtmlEditor.prototype.isDirty = function(){
    if( this._mode === Dwt.HTML ){
        var editor = this.getEditor();
        if (editor) {
            return editor.isDirty();
        }
    }
    return false;
};

/**
 * Mark the editor content as unmodified; e.g. as freshly saved.
 */
ZmHtmlEditor.prototype.clearDirty = function(){
	var ed = this.getEditor();
    if (ed) {
        this.getEditor().isNotDirty = true;
    }
};

/**
 * Listen for change in fontfamily, fontsize, fontcolor, direction and showing compose direction buttons preference and update the corresponding one.
 */
ZmHtmlEditor.prototype._settingChangeListener = function(ev) {
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
        //body.style.fontFamily = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
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
 * TinyMCE paste Callback function to execute after the contents has been converted into a DOM structure.
 */
ZmHtmlEditor.prototype.pastePostProcess =
function(ev) {
	if (!ev || !ev.node || !ev.target || ev.node.children.length === 0) {
		return;
	}

	var editor = ev.target, tables = editor.dom.select("TABLE", ev.node);

	// Add a border to all tables in the pasted content
	for (var i = 0; i < tables.length; i++) {
		var table = tables[i];
		// set the table border as 1 if it is 0 or unset
		if (table && (table.border === "0" || table.border === "")) {
			table.border = 1;
		}
	}

	// does any child have a 'float' style?
	var hasFloats = editor.dom.select('*', ev.node).some(function(node) {
		return node.style['float'];
	});

	// If the pasted content contains a table then append a DIV so
	// that focus can be set outside the table, and to prevent any floats from
	// overlapping other elements
	if (hasFloats || tables.length > 0) {
		var div = editor.getDoc().createElement("DIV");
		div.style.clear = 'both';
		ev.node.appendChild(div);
	}

	// Find all paragraphs in the pasted content and set the margin to 0
	var paragraphs = editor.dom.select("p", ev.node);

	for (var i = 0; i < paragraphs.length; i++) {
		editor.dom.setStyle(paragraphs[i], "margin", "0");
	}
};

ZmHtmlEditor.prototype._getTabGroup = function() {
	if (!this.__tabGroup) {
		this.__tabGroup = new DwtTabGroup(this.toString());
	}
	return this.__tabGroup;
};

ZmHtmlEditor.prototype.getTabGroupMember = function() {
	var tabGroup = this._getTabGroup();
	this._setupTabGroup(tabGroup);

	return tabGroup;
};

/**
 * Set up the editor tab group. This is done by having a separate tab group for each compose mode: one for HTML, one
 * for TEXT. The current one will be attached to the main tab group. We rebuild the tab group each time to avoid all kinds of issues
 *
 * @private
 */
ZmHtmlEditor.prototype._setupTabGroup = function(mainTabGroup) {

	var mode = this.getMode();
	mainTabGroup = mainTabGroup || this._getTabGroup();

	mainTabGroup.removeAllMembers();
	var modeTabGroup = new DwtTabGroup(this.toString() + '-' + mode);
	if (mode === Dwt.HTML) {
		// tab group for HTML has first toolbar button and IFRAME
		var firstbutton = this.__getEditorControl('listbox', 'Font Family');
		if (firstbutton) {
			modeTabGroup.addMember(firstbutton.getEl());
		}
		var iframe = this._getIframeDoc();
		if (iframe) { //iframe not avail first time this is called. But it's fixed subsequently
			modeTabGroup.addMember(iframe.body);
		}
	}
	else {
		// tab group for TEXT has the TEXTAREA
		modeTabGroup.addMember(this.getContentField());
	}
	mainTabGroup.addMember(modeTabGroup);
};

// Returns true if the user is inserting a Tab into the editor (rather than moving focus)
ZmHtmlEditor.isEditorTab = function(ev) {

    return appCtxt.get(ZmSetting.TAB_IN_EDITOR) && ev && ev.keyCode === DwtKeyEvent.KEY_TAB && !ev.shiftKey && !DwtKeyMapMgr.hasModifier(ev);
};
