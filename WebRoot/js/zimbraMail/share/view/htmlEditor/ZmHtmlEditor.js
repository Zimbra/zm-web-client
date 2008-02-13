/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * Html Editor
 *
 * @author Ross Dargahi
 */
ZmHtmlEditor = function(parent, posStyle, content, mode, withAce) {
	if (arguments.length == 0) return;
	this._toolbars = [];

	// ACE?
	this.ACE_ENABLED = !!withAce;
	this.ACE_DEBUG = false;

	if (this.ACE_ENABLED)
		this._ace_componentsLoading = 0;

	DwtHtmlEditor.call(this, {parent:parent, className:"ZmHtmlEditor", posStyle:posStyle,
							  content:content, mode:mode, blankIframeSrc:appContextPath+"/public/blank.html"});

	this.addStateChangeListener(new AjxListener(this, this._rteStateChangeListener));

	var settings = appCtxt.getSettings();
	var listener = new AjxListener(this, this._settingChangeListener);
	settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_COLOR).addChangeListener(listener);
	settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_FAMILY).addChangeListener(listener);
	settings.getSetting(ZmSetting.COMPOSE_INIT_FONT_SIZE).addChangeListener(listener);
};

ZmHtmlEditor.prototype = new DwtHtmlEditor;
ZmHtmlEditor.prototype.constructor = ZmHtmlEditor;


// Consts
ZmHtmlEditor._VALUE = "value";
ZmHtmlEditor.FONT_SIZE_VALUES = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
ZmHtmlEditor.FONT_FAMILY = [
	{name:"Arial", 				value:"Arial, Helvetica, sans-serif" },
	{name:"Times New Roman",	value:"Times New Roman, Times, serif" },
	{name:"Courier", 			value:"Courier, Courier New, mono" },
	{name:"Verdana",			value:"Verdana, Arial, Helvetica, sans-serif" }
];


// Big ugly RegExp, looking for iframe tags where the id starts with "ACE-"
ZmHtmlEditor.ACE_IFRAME_RE = new RegExp("<iframe\\s+.*?\\bid\\s*=\\s*[\"']?(ace-[^\"'\\s]*).*?>.*?</iframe(\\s.*?)?>", "ig");


// Public methods

ZmHtmlEditor.prototype.toString =
function() {
	return "ZmHtmlEditor";
};

ZmHtmlEditor.prototype.isHtmlEditingSupported =
function() {
	var isSupported = DwtHtmlEditor.prototype.isHtmlEditingSupported.call(this);
	if (isSupported) {
		// browser supports html edit but check if user pref allows it
		isSupported = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	}

	return isSupported;
};

ZmHtmlEditor.prototype.setMode =
function(mode, convert) {
	this.discardMisspelledWords();

	DwtHtmlEditor.prototype.setMode.call(this, mode, convert);

	if (mode == DwtHtmlEditor.HTML) {
		this._createToolbars();
		this._resetFormatControls();
	}

	// show/hide toolbars based on mode
	for (var i = 0; i < this._toolbars.length; i++) {
		var toolbar = this._toolbars[i];
		toolbar.setVisible(mode == DwtHtmlEditor.HTML);
	}
};

ZmHtmlEditor.prototype.getBodyFieldId =
function() {
	return this._mode == DwtHtmlEditor.HTML ? this._iFrameId : this._textAreaId;
};

// returns the text version of the html message
ZmHtmlEditor.prototype.getTextVersion =
function() {
	return this._mode == DwtHtmlEditor.HTML
		? this._convertHtml2Text()
		: this.getContent();
};

// Re-sets design mode for buggy gecko-based browser
ZmHtmlEditor.prototype.reEnableDesignMode =
function() {
	if (AjxEnv.isGeckoBased || AjxEnv.isSafari) {
		this._enableDesignMode(this._getIframeDoc());
	}
};

ZmHtmlEditor.prototype.addEventCallback =
function(callback) {
	this._eventCallback = callback;
};

ZmHtmlEditor.prototype._onContentInitialized =
function() {
	this._loadExternalStyle("/css/editor.css");
	this._setFontStyles();
	if (this.ACE_ENABLED && this._mode == DwtHtmlEditor.HTML) {
		setTimeout(AjxCallback.simpleClosure(this._deserializeAceObjects, this), 100);
	}
};

ZmHtmlEditor.prototype.getContent =
function(insertFontStyle) {
	this.discardMisspelledWords();

	// NOTE: this code is same as base class except we use insertFontStyle
	// (which shouldnt be in base).
	var content = null;
	if (this._mode == DwtHtmlEditor.HTML) {
		var iframeDoc = this._getIframeDoc();
		var html = iframeDoc && iframeDoc.body ? (this._getIframeDoc().body.innerHTML) : "";
		content = this._embedHtmlContent(html, insertFontStyle);
	} else {
		content = document.getElementById(this._textAreaId).value;
	}

	if (this.ACE_ENABLED && this._mode == DwtHtmlEditor.HTML)
		content = this._serializeAceObjects(content);

	return content;
};

ZmHtmlEditor.prototype.spellCheck =
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

ZmHtmlEditor.prototype.discardMisspelledWords =
function(keepModeDiv) {
	if (!this._spellCheck) return;

	if (this._mode == DwtHtmlEditor.HTML) {
		var doc = this._getIframeDoc();
		doc.body.style.display = "none";

		var p = null;
		var spanIds = this._spellCheck.spanIds;
		for (var i in spanIds) {
			var span = doc.getElementById(i);
			if (!span) continue;

			p = span.parentNode;
			while (span.firstChild)
				p.insertBefore(span.firstChild, span);
			p.removeChild(span);
		}

		if (!AjxEnv.isIE)
			doc.body.normalize(); // IE crashes here.
		else
			doc.body.innerHTML = doc.body.innerHTML;

		// remove the spell check styles
		p = doc.getElementById("ZM-SPELLCHECK-STYLE");
		if (p)
			p.parentNode.removeChild(p);

		doc.body.style.display = "";
		this._unregisterEditorEventHandler(doc, "contextmenu");

	} else if (this._spellCheckDivId != null) {
		var div = document.getElementById(this._spellCheckDivId);
		var scrollTop = div.scrollTop;
		var textArea = document.getElementById(this._textAreaId);
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

	if (!keepModeDiv)
		this._spellCheckHideModeDiv();

	if (this.onExitSpellChecker)
		this.onExitSpellChecker.run();
};

ZmHtmlEditor.prototype._resetFormatControls =
function() {
	this._fontFamilyButton.setText(appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY));
	this._fontSizeButton.setText(this._getFontSizeLabel(appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE)));
	this._fontColorButton.setColor(appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR));
	this._styleMenu.checkItem(ZmHtmlEditor._VALUE, DwtHtmlEditor.PARAGRAPH, true);
	this._justifyMenu.checkItem(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_LEFT, true);

	setTimeout(AjxCallback.simpleClosure(this._loadExternalStyle, this, "/css/editor.css"), 250);
	setTimeout(AjxCallback.simpleClosure(this._setFontStyles, this), 250);
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
			doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
		}
		head.appendChild(style);
	}
};

ZmHtmlEditor.prototype._setFontStyles =
function() {
	var doc = this._getIframeDoc();
	var style = doc.body.style;

	style.fontFamily = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	style.fontSize = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
	style.color = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
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

			var repl = [ prefix,
				     '<span word="',
				     word, '" id="', id, '" class="ZM-SPELLCHECK-MISSPELLED">',
				     word, '</span>',
				     suffix
				   ].join("");
			text = [ text.substr(0, m.index),
				 repl,
				 text.substr(m.index + str.length) ].join("");

			// All this crap necessary because the suffix
			// must be taken into account at the next
			// match and JS regexps don't have look-ahead
			// constructs (except \b, which sucks).  Oh well.
			regexp.lastIndex = m.index + repl.length - suffix.length;
		}

		return text;

// 		return text.replace(regexp, function(str, prefix, word, suffix) {
// 			// return suggestions[word];
// 			var id = Dwt.getNextId();
// 			spanIds[id] = word;
// 			if (!wordIds[word])
// 				wordIds[word] = [];
// 			wordIds[word].push(id);
// 			return [ prefix,
// 				 '<span word="',
// 				 word, '" id="', id, '" class="ZM-SPELLCHECK-MISSPELLED">',
// 				 word, '</span>',
// 				 suffix
// 			       ].join("");
// 		});
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
			if (a)
				div.insertBefore(a, div.firstChild);
			if (b)
				div.appendChild(b);

			var p = node.parentNode;
			while (div.firstChild)
				p.insertBefore(div.firstChild, node);
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
		if (!AjxEnv.isIE)
			body.normalize();
		else
			body.innerHTML = body.innerHTML;
		rec(body);
		if (!AjxEnv.isIE)
			body.normalize();
		else
			body.innerHTML = body.innerHTML;
		body.style.display = ""; // redisplay the body
		this._registerEditorEventHandler(doc, "contextmenu");

	} else { // TEXT mode

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
	this._spellCheck = { suggestions: suggestions,
						 spanIds: spanIds,
						 wordIds: wordIds };
};

ZmHtmlEditor.prototype.setSize =
function(x, y) {
	var div = null;
	if (this._spellCheckDivId) {
		div = document.getElementById(this._spellCheckDivId);
	}

	// FUDGE: we must substract borders and paddings - yuck.
	var delta = this._mode == DwtHtmlEditor.HTML ? 10 : 8;

	x -= delta + 4;

	// subtract spellchecker DIV if applicable
	if (this._spellCheckModeDivId) {
		var spellCheckDivHeight = document.getElementById(this._spellCheckModeDivId).offsetHeight;
		y -= (isNaN(spellCheckDivHeight) ? 0 : spellCheckDivHeight);
	}
	if (this._mode == DwtHtmlEditor.HTML && this._toolbars.length > 0) {
		for (var i = 0; i < this._toolbars.length; i++) {
			var toolbar = this._toolbars[i];
			y -= toolbar.getHtmlElement().offsetHeight;
		}
	}

	// subtract fudge factor
	y -= delta;

	// bug fix #6786 - normalize width/height if less than zero
	if (x < 0) x = 0;
	if (y < 0) y = 0;

	var main = document.getElementById(this.getBodyFieldId());
	main.style.width = x + 5 + "px";
	main.style.height = y + "px";
	if (div) {
		if (!AjxEnv.isIE) {
			x = x > 4 ? (x-4) : x;
			y = y > 4 ? (y-4) : y;
		} else {
			y += 2;
		}

		div.style.width = x + "px";
		div.style.height = y + "px";
	}
};


// Private / protected methods

ZmHtmlEditor.prototype._initialize =
function() {
	if (this._mode == DwtHtmlEditor.HTML) {
		this._createToolbars();
	}
	DwtHtmlEditor.prototype._initialize.call(this);
};

ZmHtmlEditor.prototype._styleListener =
function(ev) {
	this.setStyle(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._fontFamilyListener =
function(ev) {
	var id = ev.item.getData(ZmHtmlEditor._VALUE);
	this.setFont(ZmHtmlEditor.FONT_FAMILY[id].value);
	this._fontFamilyButton.setText(ZmHtmlEditor.FONT_FAMILY[id].name);
};

ZmHtmlEditor.prototype._fontSizeListener =
function(ev) {
	this.setFont(null, null, ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._indentListener =
function(ev) {
	this.setIndent(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._insElementListener =
function(ev) {
	var elType = ev.item.getData(ZmHtmlEditor._VALUE);
	switch (elType) {
	    default:
		this.insertElement(elType);
	}
};

ZmHtmlEditor.prototype._justificationListener =
function(ev) {
	this.setJustification(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._fontStyleListener =
function(ev) {
	this.setFont(null, ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._fontColorListener =
function(ev) {
	this.setFont(null, null, null, ev.detail || "#000000");
};

ZmHtmlEditor.prototype._fontHiliteListener =
function(ev) {
	this.setFont(null, null, null, null, ev.detail || "#ffffff");
};

ZmHtmlEditor.prototype._createToolbars =
function() {
	// NOTE: overload this method to place toolbars differently.
	if (!this._toolbar1) {
		var tb = this._toolbar1 = new DwtToolBar({parent:this, className:"ZToolbar",
												  posStyle:DwtControl.RELATIVE_STYLE, cellSpacing:2, index:0});
		tb.setVisible(this._mode == DwtHtmlEditor.HTML);

		// Default is to have ONE toolbar now
		this._createToolBar1(tb);
		new DwtControl({parent:tb, className:"vertSep"});
		this._createToolBar2(tb);

		this._toolbars.push(tb);
	}
};

ZmHtmlEditor.prototype._createToolBar1 =
function(tb) {
	this._createFontFamilyMenu(tb);
	this._createFontSizeMenu(tb);
	this._createStyleMenu(tb);
	this._createJustifyMenu(tb);

	new DwtControl({parent:tb, className:"vertSep"});

	var insListener = new AjxListener(this, this._insElementListener);
	var params = {parent:tb, style:DwtButton.TOGGLE_STYLE};
	this._listButton = new DwtToolBarButton(params);
	this._listButton.setToolTipContent(ZmMsg.bulletedList);
	this._listButton.setImage("BulletedList");
	this._listButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.UNORDERED_LIST);
	this._listButton.addSelectionListener(insListener);

	this._numberedListButton = new DwtToolBarButton(params);
	this._numberedListButton.setToolTipContent(ZmMsg.numberedList);
	this._numberedListButton.setImage("NumberedList");
	this._numberedListButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.ORDERED_LIST);
	this._numberedListButton.addSelectionListener(insListener);

	var listener = new AjxListener(this, this._indentListener);
	this._outdentButton = new DwtToolBarButton({parent:tb});
	this._outdentButton.setToolTipContent(ZmMsg.outdent);
	this._outdentButton.setImage("Outdent");
	this._outdentButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.OUTDENT);
	this._outdentButton.addSelectionListener(listener);

	this._indentButton = new DwtToolBarButton({parent:tb});
	this._indentButton.setToolTipContent(ZmMsg.indent);
	this._indentButton.setImage("Indent");
	this._indentButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.INDENT);
	this._indentButton.addSelectionListener(listener);

	new DwtControl({parent:tb, className:"vertSep"});

	var listener = new AjxListener(this, this._fontStyleListener);
	this._boldButton = new DwtToolBarButton(params);
	this._boldButton.setImage("Bold");
	this._boldButton.setToolTipContent(ZmMsg.boldText);
	this._boldButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.BOLD_STYLE);
	this._boldButton.addSelectionListener(listener);

	this._italicButton = new DwtToolBarButton(params);
	this._italicButton.setImage("Italics");
	this._italicButton.setToolTipContent(ZmMsg.italicText);
	this._italicButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.ITALIC_STYLE);
	this._italicButton.addSelectionListener(listener);

	this._underlineButton = new DwtToolBarButton(params);
	this._underlineButton.setImage("Underline");
	this._underlineButton.setToolTipContent(ZmMsg.underlineText);
	this._underlineButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.UNDERLINE_STYLE);
	this._underlineButton.addSelectionListener(listener);

	if (!appCtxt.isChildWindow) {
		appCtxt.getZimletMgr().notifyZimlets("on_htmlEditor_createToolbar1", this, tb);
	}
};

ZmHtmlEditor.prototype._createToolBar2 =
function(tb) {
	this._fontColorButton = new ZmHtmlEditorColorPicker(tb,null,"ZToolbarButton");
	this._fontColorButton.dontStealFocus();
	this._fontColorButton.setImage("FontColor");
	this._fontColorButton.showColorDisplay(true);
	this._fontColorButton.setToolTipContent(ZmMsg.fontColor);
	this._fontColorButton.addSelectionListener(new AjxListener(this, this._fontColorListener));

	this._fontBackgroundButton = new ZmHtmlEditorColorPicker(tb, null, "ZToolbarButton");
	this._fontBackgroundButton.dontStealFocus();
	this._fontBackgroundButton.setImage("FontBackground");
	this._fontBackgroundButton.showColorDisplay(true);
	this._fontBackgroundButton.setToolTipContent(ZmMsg.fontBackground);
	this._fontBackgroundButton.addSelectionListener(new AjxListener(this, this._fontHiliteListener));

	new DwtControl({parent:tb, className:"vertSep"});

	var params = {parent:tb};
	this._horizRuleButton = new DwtToolBarButton(params);
	this._horizRuleButton.setImage("HorizRule");
	this._horizRuleButton.setToolTipContent(ZmMsg.horizRule);
	this._horizRuleButton.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.HORIZ_RULE);
	this._horizRuleButton.addSelectionListener(new AjxListener(this, this._insElementListener));

// BEGIN: Table operations
	var b = new DwtToolBarButton(params);
	b.setToolTipContent(ZmMsg.insertTable);
	b.dontStealFocus();
	b.setImage("Table");
	var menu = new DwtMenu({parent:b});
	b.setMenu(menu);

	var item = new DwtMenuItem({parent:menu});
	item.setText(ZmMsg.insertTable);
	var grid_menu = new DwtMenu({parent:item, style:DwtMenu.GENERIC_WIDGET_STYLE});
 	var grid = new DwtGridSizePicker(grid_menu, ZmMsg.tableSize);
 	grid.addSelectionListener(new AjxListener(this, this._createTableListener));
 	item.setMenu(grid_menu);
	item.setImage("InsertTable");

	new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
	this.__createTableOperationItems(menu);
// END: table operations

	if (this.ACE_ENABLED) {
		tb.addSeparator("vertSep");
		params.style = 0;
		var b = new DwtToolBarButton(params);
		b.setImage("SpreadSheet");
		b.setData("ACE", "ZmSpreadSheet");
		b.setToolTipContent(ZmMsg.insertSpreadsheet);
		b.addSelectionListener(new AjxListener(this, this._menu_insertObject));
	}

	if (!appCtxt.isChildWindow) {
		appCtxt.getZimletMgr().notifyZimlets("on_htmlEditor_createToolbar2", this, tb);
	}
};

ZmHtmlEditor.prototype.__createTableOperationItems =
function(menu) {
	var tblListener = new AjxListener(this, this._tableOperationsListener);
	var tblCommands = [ "tableProperties...", "cellProperties...", null,
			    "insertRowAbove", "insertRowUnder", "deleteRow", null,
			    "insertColumnBefore", "insertColumnAfter", "deleteColumn", null ];
	if (AjxEnv.isGeckoBased)
		tblCommands.push("mergeCells", "splitCells", null);
	tblCommands.push("deleteTable");
	var tblIcons = [ "TableProperties", "CellProperties", null,
			 "InsertRowBefore", "InsertRowAfter", "DeleteRow", null,
			 "InsertColBefore", "InsertColAfter", "DeleteCol", null,
			 "MergeCells", "SplitCells", null,
			 "DeleteTable" ];
	menu._tblItems = {};
	for (var i = 0; i < tblCommands.length; ++i) {
		var cmd = tblCommands[i];
		if (cmd == null)
			new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
		else {
			var dots = "";
			if (/\.\.\.$/.test(cmd)) {
				cmd = cmd.substr(0, cmd.length - 3);
				dots = "&hellip;";
			}
			var item = new DwtMenuItem({parent:menu});
			menu._tblItems[cmd] = item;
			var txt = ZmMsg[cmd] || cmd;
			item.setText(txt + dots);
			if (tblIcons[i])
				item.setImage(tblIcons[i]);
			item.setData("TableOperations", cmd);
			item.addSelectionListener(tblListener);
		}
	}
	menu.addPopupListener(new AjxListener(this, this.__onTableOperationsPopup));
};

ZmHtmlEditor.prototype.__onTableOperationsPopup = function(menu) {
	this.focus();
	var table = this.getNearestElement("table");
	var items = menu._tblItems;
	for (var i in items) {
		items[i].setEnabled(!!table);
	}
	if (!table)
		return;

	menu.setData("table", table);

	if (!AjxEnv.isIE) {
		// Can we split? (the cell has to be a merged cell)
		var td = this.getNearestElement("td");
		var splitEnabled = td && ((td.colSpan && td.colSpan > 1)
					  || (td.rowSpan && td.rowSpan > 1));
		items.splitCells.setEnabled(splitEnabled);

		// Can we merge? (multiple cells are selected and none of them is previously merged)
		var a = this.getSelectedCells();
		var canMerge = true;
		var howMany = 0;
		try {
			for (var i = a.length; --i >= 0;) {
				var r = a[i];
				for (var j = r.length; --j >= 0;) {
					var td = r[j];
					++howMany;
					if (td.rowSpan > 1 || td.colSpan > 1)
						throw "can't merge";
				}
			}
		} catch(ex) {
			canMerge = false;
		}
		if (howMany < 2)
			canMerge = false;
		items.mergeCells.setEnabled(canMerge);
	}
};

ZmHtmlEditor.prototype._tableOperationsListener =
function(ev) {
	var item = ev.item;
	var table = item.parent.getData("table");
	var data = item.getData("TableOperations");
	this.focus();
	switch (data) {
	    case "tableProperties":
	    AjxDispatcher.require("Extras");
		var dlg = ZmTableEditor.getTablePropsDialog(this, this.getNearestElement("table"));
		dlg.popup();
		break;
	    case "cellProperties":
	    AjxDispatcher.require("Extras");
		var dlg = ZmTableEditor.getCellPropsDialog(this, this.getNearestElement("table"), this.getSelectedCells());
		dlg.popup();
		// alert("Not yet implemented");
		break;
	    default:
		this.doTableOperation(data, { table: table, cells: this.getSelectedCells() });
	}
};

ZmHtmlEditor.prototype._createTableListener =
function(ev) {
	var size = ev.detail;
	this.insertTable(size.rows, size.cols, "90%", null, 3, "center");
};

ZmHtmlEditor.prototype._menu_insertObject =
function(ev){
	var item = ev.item;
	var data = item.getData("ACE");
	this.insertObject(data);
};

ZmHtmlEditor.prototype.insertObject =
function(name, target, data) {
	var toplevel_url = document.URL
		.replace(/^(https?:\x2f\x2f[^\x2f]+\x2f?).*$/i, "$1")
		.replace(/\x2f*$/, "");
	var component_url = null;

	// REVISIT: object factory needed when there'll be many components to
	// chose from.
	switch (name) {
	    case "ZmSpreadSheet":
		component_url = toplevel_url + appContextPath + "/public/Spreadsheet.jsp";
		break;
	}

	if (component_url) {
		// var outer = this.getIframe();
		// outer.style.display = "none";
		var doc = this._getIframeDoc();
		this.focus();
		++this._ace_componentsLoading;
		if (AjxEnv.isGeckoBased) {
			doc.designMode = "off";
		}
		var ifr = doc.createElement("iframe");
		ifr.id = "ACE-" + Dwt.getNextId();
		ifr.frameBorder = 0;
		ifr.src = component_url;
		ifr.style.width = "100%";
		ifr.style.height = "400px";
		// Avoid bug 8523 in IE.
		ifr.ondragstart = AjxCallback.returnFalse;
		if (!target) {
			// embed it into 2 paragraphs to make it easy
			// to type text before or after the
			// spreadsheet
			var p = doc.createElement("br");
			var df = doc.createDocumentFragment();
			df.appendChild(p);
			df.appendChild(ifr);
			df.appendChild(p.cloneNode(true));
			this._insertNodeAtSelection(df);

			// this causes problems in Firefox too! :-(
// 			if (!AjxEnv.isIE) {
// 				ifr.contentWindow.focus();
// 				ifr.contentWindow.document.focus();
// 			}
		} else
			target.parentNode.replaceChild(ifr, target);
		var handler = AjxCallback.simpleClosure(this._ace_finishedLoading, this, ifr, name, data);
		if (AjxEnv.isIE) {
			ifr.onreadystatechange = handler;
		} else {
			ifr.addEventListener("load", handler, true);
		}
		// outer.style.display = "";
	}
};

ZmHtmlEditor.prototype._ace_finishedLoading = function(ifr, name, data) {
	// We have to delay execution (bug 12870).  Seems to affect
	// Firefox only.  10ms should be quite enough.
	var self = this;
	if (!AjxEnv.isIE || ifr.readyState == "complete") {
		setTimeout(function() {
			try {
				var win = Dwt.getIframeWindow(ifr);
				win.ZmACE = true;
				win.ZmACE_COMPONENT_NAME = name;
				ifr.onload = null;
				ifr.onreadystatechange = null;
				win.create(data);
				--self._ace_componentsLoading;
			} catch(ex) {
				--self._ace_componentsLoading;
				// throw new DwtException("Can't deserialize ALE component", DwtException.INTERNAL_ERROR, ex);
				var dlg = appCtxt.getErrorDialog();
				dlg.setMessage(ZmMsg.aleError, ex.msg || ex.toString(), DwtMessageDialog.WARNING_STYLE, "ALE error");
				dlg.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, false);
				dlg.popup();
			}
		}, 10);
	}
};

// Returns an array of embedded objects (each one is a reference to its containing IFRAME)
ZmHtmlEditor.prototype._getAceObjects =
function() {
	var tmp = this._getIframeDoc().getElementsByTagName("iframe");
	var a = new Array(tmp.length);
	for (var i = tmp.length; --i >= 0;)
		a[i] = tmp[i];
	return a;
};

ZmHtmlEditor.prototype._embedHtmlContent =
function(html, insertFontStyle) {
	if (!insertFontStyle) {
		if (!(this.ACE_ENABLED && this._headContent))
			return DwtHtmlEditor.prototype._embedHtmlContent.call(this, html);
	}

        var p_style = "<style type='text/css'>p { margin: 0; }</style>"; // bug 3264
	var fontStyle = insertFontStyle ? this._getFontStyle() : "";
	var headContent = this._headContent ? this._headContent.join("") : "";

	return ["<html><head>",
                p_style,
		fontStyle, headContent,
		"</head><body>",
		html,
		"</body></html>"].join("");
};

ZmHtmlEditor.prototype._getFontStyle =
function() {
	if (!this._fontStyle) {
		var head = [];
		var i = 0;
		head[i++] = "<style type='text/css'>";
		head[i++] = "body { font-family: '";
		head[i++] =  appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
		head[i++] = "'; ";
		head[i++] = "font-size: ";
		head[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
		head[i++] = "; ";
		head[i++] = "color: ";
		head[i++] = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
		head[i++] = "}";
		head[i++] = "</style>";

		this._fontStyle = head.join("");
	}

	return this._fontStyle;
};

ZmHtmlEditor.prototype._serializeAceObjects =
function(content) {
	this._headContent = [];
	var done = {};
	var replaceCallback = AjxCallback.simpleClosure(this._replaceAceIframes, this, done);
	return content.replace(ZmHtmlEditor.ACE_IFRAME_RE, replaceCallback);
};

ZmHtmlEditor.prototype._replaceAceIframes =
function(done, match, iframeId) {
	var iframe = this._getIframeDoc().getElementById(iframeId);
	var win = Dwt.getIframeWindow(iframe);
	var html = win.getHTML();
	var data = win.serialize()
		.replace(/&/g, "&amp;")
		.replace(/>/g, "&gt;");
	var component_name = win.ZmACE_COMPONENT_NAME;
	if (!done[component_name] && typeof win.getHeadHTML == "function") {
		done[component_name] = true;
		this._headContent.push(win.getHeadHTML());
	}
	return ["<div class=\"ACE ", component_name, "\">",
	        html,
	        "<!--",
	        "ACE[", component_name, "]:", data,
	        "-->",
	        "</div>"].join("");
};

ZmHtmlEditor.prototype._deserializeAceObjects =
function() {
	var divs = this._getIframeDoc().getElementsByTagName("div");
	var tmp = new Array(divs.length);
	for (var i = 0; i < divs.length; ++i)
		tmp[i] = divs.item(i);
	divs = tmp;
	for (var i = 0; i < divs.length; ++i) {
		var holder = divs[i];
		if (/^ACE\s+([^\s]+)/.test(holder.className)) {
			var component_name = RegExp.$1;
			var data = holder.lastChild;
			if (data.nodeType == 8 /* Node.COMMENT_NODE */) {
				data = data.data;
				var header = "ACE[" + component_name + "]:";
				if (data.indexOf(header) == 0) {
					data = data.substr(header.length)
						.replace(/&gt;/g, ">")
						.replace(/&amp;/g, "&");
					this.insertObject(component_name, holder, data);
				}
			}
		}
	}
};

ZmHtmlEditor.prototype._createStyleMenu =
function(tb) {
	var s = new DwtToolBarButton({parent:tb});
	// minor hack to set section symbol - avoids d/l'ing an icon :]
	s.setText("x");
    s._textEl.innerHTML = "<span style='font-size:13px'>&sect;</span>";
	s.setToolTipContent(ZmMsg.sections);
	s.dontStealFocus();
	var menu = this._styleMenu = new ZmPopupMenu(s);
	var listener = new AjxListener(this, this._styleListener);
	var menuItems = [
		{ label:ZmMsg.normal,		id:DwtHtmlEditor.PARAGRAPH},
		{ label:ZmMsg.heading1, 	id:DwtHtmlEditor.H1},
		{ label:ZmMsg.heading2, 	id:DwtHtmlEditor.H2},
		{ label:ZmMsg.heading3, 	id:DwtHtmlEditor.H3},
		{ label:ZmMsg.heading4, 	id:DwtHtmlEditor.H4},
		{ label:ZmMsg.heading5, 	id:DwtHtmlEditor.H5},
		{ label:ZmMsg.heading6, 	id:DwtHtmlEditor.H6},
		{ label:ZmMsg.addressLabel,	id:DwtHtmlEditor.ADDRESS},
		{ label:ZmMsg.preformatted,	id:DwtHtmlEditor.PREFORMATTED} ];

	for (var i = 0; i < menuItems.length; i++) {
		var item = menuItems[i];
		var mi = menu.createMenuItem(item.id, {text:item.label, style:DwtMenuItem.RADIO_STYLE});
		mi.addSelectionListener(listener);
		mi.setData(ZmHtmlEditor._VALUE, item.id);
		if (i == 0)
			mi.setChecked(true, true);
	}

	s.setMenu(menu);
};

ZmHtmlEditor.prototype._createJustifyMenu =
function(tb) {
	var b = new DwtToolBarButton({parent:tb});
	b.dontStealFocus();
	b.setImage("LeftJustify");
	b.setToolTipContent(ZmMsg.alignment);
	var menu = this._justifyMenu = new ZmPopupMenu(b);
	var listener = new AjxListener(this, this._justificationListener);
	var menuItems = [
		{ image:"LeftJustify",		id:DwtHtmlEditor.JUSTIFY_LEFT},
		{ image:"CenterJustify",	id:DwtHtmlEditor.JUSTIFY_CENTER},
		{ image:"RightJustify",		id:DwtHtmlEditor.JUSTIFY_RIGHT},
		{ image:"FullJustify",		id:DwtHtmlEditor.JUSTIFY_FULL} ];

	for (var i = 0; i < menuItems.length; i++) {
		var item = menuItems[i];
		var mi = menu.createMenuItem(item.id, {image:item.image, style:DwtMenuItem.RADIO_STYLE});
		mi.addSelectionListener(listener);
		mi.setData(ZmHtmlEditor._VALUE, item.id);
		if (i == 0)
			mi.setChecked(true, true);
	}

	b.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
};

ZmHtmlEditor.prototype._createFontFamilyMenu =
function(tb) {
	this._fontFamilyButton = new DwtToolBarButton({parent:tb});
	this._fontFamilyButton.dontStealFocus();
	this._fontFamilyButton.setSize(Dwt.DEFAULT);
	this._fontFamilyButton.setAlign(DwtLabel.ALIGN_LEFT);
	var menu = new ZmPopupMenu(this._fontFamilyButton);
	var listener = new AjxListener(this, this._fontFamilyListener);

	for (var i = 0; i < ZmHtmlEditor.FONT_FAMILY.length; i++) {
		var item = ZmHtmlEditor.FONT_FAMILY[i];
		var mi = menu.createMenuItem(item.name, {text:item.name});
		mi.addSelectionListener(listener);
		mi.setData(ZmHtmlEditor._VALUE, i);
	}

	this._fontFamilyButton.setMenu(menu);
};

ZmHtmlEditor.prototype._createFontSizeMenu =
function(tb) {
	this._fontSizeButton = new DwtToolBarButton({parent:tb});
	this._fontSizeButton.dontStealFocus();
	var menu = new ZmPopupMenu(this._fontSizeButton);
	var listener = new AjxListener(this, this._fontSizeListener);

	for (var i = 0; i < ZmHtmlEditor.FONT_SIZE_VALUES.length; i++) {
		var item = ZmHtmlEditor.FONT_SIZE_VALUES[i];
		var num = i+1;
		var text = num + " (" + item + ")";
		var mi = menu.createMenuItem(i, {text:text});
		mi.addSelectionListener(listener);
		mi.setData(ZmHtmlEditor._VALUE, num);
	}

	this._fontSizeButton.setMenu(menu);
};

ZmHtmlEditor.prototype._getFontSizeLabel =
function(fontSize) {
	for (var i = 0; i < ZmHtmlEditor.FONT_SIZE_VALUES.length; i++) {
		var item = ZmHtmlEditor.FONT_SIZE_VALUES[i];
		if (fontSize == item) {
			return ((i+1) + " (" + item + ")");
		}
	}
	// return "12pt" by default (yuck)
	return "3 (12pt)";
};

ZmHtmlEditor.prototype._rteStateChangeListener =
function(ev) {

	this._boldButton.setSelected(ev.isBold);
 	this._underlineButton.setSelected(ev.isUnderline);
 	this._italicButton.setSelected(ev.isItalic);
 	if (this._strikeThruButton)
 		this._strikeThruButton.setSelected(ev.isStrikeThru);
 	if (this._subscriptButton)
 		this._subscriptButton.setSelected(ev.isSubscript);
 	if (this._superscriptButton)
 		this._superscriptButton.setSelected(ev.isSuperscript);

 	this._numberedListButton.setSelected(ev.isOrderedList);
 	this._listButton.setSelected(ev.isUnorderedList);

 	if (ev.color)
 		this._fontColorButton.setColor(ev.color);

 	if (ev.backgroundColor)
 		this._fontBackgroundButton.setColor(ev.backgroundColor);

 	if (ev.style)
 		this._styleMenu.checkItem(ZmHtmlEditor._VALUE, ev.style, true);

        if (!AjxEnv.isIE) {

                // Bug 20171

                // For reasons not known to humanity, the following code resets the undo stack in IE.
                // It seems to have something to do with modifying the DOM.  The setText() calls use
                // innerHTML, but it's not about innerHTML, since I tried using DOM methods as well
                // to modify the text (createTextNode/removeChild/appendChild).  Nothing works.

                // I therefore disable this code for IE, trusting it's better to have working undo
                // and an un-updated toolbar, rather than the other way around.  I'll commit suicide
                // next; if you find a better solution please tell my son after about 12 years.  >:)

 	        if (ev.fontFamily)
 		        this._fontFamilyButton.setText(ZmHtmlEditor.FONT_FAMILY[ev.fontFamily].name);

 	        if (ev.fontSize) {
 		        var mi = this._fontSizeButton.getMenu().getItem(ev.fontSize-1);
 		        this._fontSizeButton.setText(mi.getText());
 	        }

        }

 	this._justifyMenu.checkItem(ZmHtmlEditor._VALUE, ev.justification, true);
};

ZmHtmlEditor.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;

	var id = ev.source.id;
	if (id == ZmSetting.COMPOSE_INIT_FONT_COLOR ||
		id == ZmSetting.COMPOSE_INIT_FONT_FAMILY ||
		id == ZmSetting.COMPOSE_INIT_FONT_SIZE)
	{
		this._fontStyle = null;
	}
};

ZmHtmlEditor.prototype._handleEditorEvent =
function(ev) {
	var rv = this._eventCallback ? this._eventCallback.run(ev) : true;
	if (rv)
		rv = DwtHtmlEditor.prototype._handleEditorEvent.call(this, ev);
	if (this._TIMER_spell)
		clearTimeout(this._TIMER_spell);
	var self = this;
	if (this._spellCheck) {
		var dw;
		// This probably sucks.
		if (/mouse|context|click|select/i.test(ev.type))
			dw = new DwtMouseEvent(true);
		else
			dw = new DwtUiEvent(true);
		dw.setFromDhtmlEvent(ev);
		this._TIMER_spell = setTimeout(function() {
			self._handleSpellCheckerEvents(dw);
			this._TIMER_spell = null;
		}, 100);
	}
	return rv;
};


// Spell checker methods

ZmHtmlEditor._spellCheckResumeEditing =
function() {
	var editor = Dwt.getObjectFromElement(this);
	editor.discardMisspelledWords();
};

ZmHtmlEditor._spellCheckAgain =
function() {
	var editor = Dwt.getObjectFromElement(this);
	editor.discardMisspelledWords();
	editor.spellCheck();
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
		html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
		html[i++] = "<td style='width:25'>"
		html[i++] = AjxImg.getImageHtml("SpellCheck");
		html[i++] = "</td><td style='white-space:nowrap'><span class='SpellCheckLink'>";
		html[i++] = ZmMsg.resumeEditing;
		html[i++] = "</span> | <span class='SpellCheckLink'>";
		html[i++] = ZmMsg.checkAgain;
		html[i++] = "</span></td>";
		html[i++] = "</tr></table>";
		div.innerHTML = html.join("");

		var editable = document.getElementById((this._spellCheckDivId || this.getBodyFieldId()));
		editable.parentNode.insertBefore(div, editable);

		var el = div.getElementsByTagName("span");
		Dwt.associateElementWithObject(el[0], this);
		Dwt.setHandler(el[0], "onclick", ZmHtmlEditor._spellCheckResumeEditing);
		Dwt.associateElementWithObject(el[1], this);
		Dwt.setHandler(el[1], "onclick", ZmHtmlEditor._spellCheckAgain);
	} else {
		document.getElementById(this._spellCheckModeDivId).style.display = "";
	}
	// this.parent._resetBodySize();
	this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 2));
};

ZmHtmlEditor.prototype._spellCheckHideModeDiv =
function() {
	var size = this.getSize();
	if (this._spellCheckModeDivId)
		document.getElementById(this._spellCheckModeDivId).style.display = "none";
	this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 2));
};

ZmHtmlEditor.prototype._spellCheckSuggestionListener =
function(ev) {
	var self = this;
	var item = ev.item;
	var orig = item.getData("orig");
	if (!orig)
		return;
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

ZmHtmlEditor.prototype._handleSpellCheckerEvents =
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
		// sc.menu.popdown();
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
			var menu = new ZmPopupMenu(parent), item;
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
	}
};

ZmHtmlEditor.prototype._spellCheckCallback =
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

	if (AjxEnv.isGeckoBased && this._mode == DwtHtmlEditor.HTML)
		setTimeout(AjxCallback.simpleClosure(this.focus, this), 10);

	if (this.onExitSpellChecker)
		this.onExitSpellChecker.run(wordsFound);
};

// overwrites the base class' _enableDesignMode in order to work around Gecko problems
ZmHtmlEditor.prototype._enableDesignMode =
function(doc) {
	if (!doc)
		return;
	if (!(AjxEnv.isGeckoBased && this.ACE_ENABLED))
		return DwtHtmlEditor.prototype._enableDesignMode.call(this, doc);
	// Gecko needs special attention here. (https://bugzilla.mozilla.org/show_bug.cgi?id=326600)
	// :-(

	if (!this._hasGeckoFocusHacks)
		this.__enableGeckoFocusHacks();

	// -- findings suggest that Firefox loses these events on certain
	//    occasions (i.e. iframe.style.display = "none"), so we DO need to
	//    add them multiple times.  Crap.
	this._getIframeWin().addEventListener("blur", this._designModeHack_blur, true);
	this._getIframeWin().addEventListener("focus", this._designModeHack_focus, true);
	// this._getIframeWin().addEventListener("mousedown", this._designModeHack_focus, true);
};

// this should be called ONLY ONCE (if !this._hasGeckoFocusHacks)
ZmHtmlEditor.prototype.__enableGeckoFocusHacks = function() {
	var bookmark = null;
	var state = 0;
	this._hasGeckoFocusHacks = true;

	function enableToolbars(enable) {
		var a = [];
		for (var i = 0; i < this._toolbars.length; i++)
			a = a.concat(this._toolbars[i].getChildren());
		for (var i = 0; i < a.length; ++i)
			a[i].setEnabled(enable);
	};

	this._designModeHack_blur = AjxCallback.simpleClosure(
		function(ev) {
			if (state < 0)
				return;
			// console.log("BLUR!");
			var enableFocus = false;
			var dwtev = DwtShell.mouseEvent;
			dwtev.setFromDhtmlEvent(ev);
			if(dwtev && dwtev.dwtObj) {
				for (var i = 0; i < this._toolbars.length; i++){
					if(dwtev.dwtObj.parent == this._toolbars[i]){
						enableFocus = true;
					}
				}
			}

			if(!enableFocus){
			enableToolbars.call(this, false);
			}

			var doc = this._getIframeDoc();
			doc.designMode = "off";
			state = -1;
			if (this._ace_componentsLoading > 0)
				return;
			try {
				var sel = this._getIframeWin().getSelection();
				var i = 0, r;
				try {
					bookmark = [];
					while (r = sel.getRangeAt(i++))
						bookmark.push(r);
				} catch(ex) {};
				sel.removeAllRanges();
			} catch(ex) {
				bookmark = null;
			}
		}, this);

	// bug 8508 - start off with disabled toolbars
	enableToolbars.call(this, false);

	this._designModeHack_focus = AjxCallback.simpleClosure(
		function(ev) {
			if (state > 0)
				return;
			// console.log("FOCUS!");
			var doc = this._getIframeDoc();
			var sel = this._getIframeWin().getSelection();
			enableToolbars.call(this, true);
			if (this._ace_componentsLoading > 0)
				return;
			// Probably a regression of FF 1.5.0.1/Linux requires us to
			// reset event handlers here (Zimbra bug: 6545).
//  			if (AjxEnv.isGeckoBased && (AjxEnv.isLinux || AjxEnv.isMac))
//  				this._registerEditorEventHandlers(document.getElementById(this._iFrameId), doc);
			doc.designMode = "on";
			if (!bookmark || bookmark.length == 0) {
				r = doc.createRange();
 				r.selectNodeContents(doc.body);
 				r.collapse(true);
				bookmark = [ r ];
			}
			sel.removeAllRanges();
			for (var i = 0; i < bookmark.length; ++i) {
				sel.addRange(bookmark[i]);
			}
			bookmark = null;
			state = 1;
		}, this);
};

ZmHtmlEditorColorPicker = function(parent,style,className) {
    DwtButtonColorPicker.call(this, parent,style,className);
}
ZmHtmlEditorColorPicker.prototype = new DwtButtonColorPicker;
ZmHtmlEditorColorPicker.prototype.constructor = ZmHtmlEditorColorPicker;

ZmHtmlEditorColorPicker.prototype.TEMPLATE = "dwt.Widgets#ZToolbarButton";
