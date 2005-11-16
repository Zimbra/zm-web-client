/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * Html Editor
 *
 * @author Ross Dargahi
 */
function ZmHtmlEditor(parent, posStyle, content, mode, appCtxt) {
	if (arguments.length == 0) return;
	this._appCtxt = appCtxt;

	DwtHtmlEditor.call(this, parent, "ZmHtmlEditor", posStyle, content, mode, "/zimbra/public/blank.html");

	this.addStateChangeListener(new AjxListener(this, this._rteStateChangeListener));

	// only add listener if this is not a child window
	if (window.parentController == null) {
		var settings = this._appCtxt.getSettings();
		settings.addChangeListener(new AjxListener(this, this._settingsChangeListener));
	}

	// spell checker init
	this._spellChecker = new ZmSpellChecker(this, appCtxt);
	this._spellCheck = null;
	this._spellCheckSuggestionListener = new AjxListener(this, this._spellCheckSuggestionListener);
};

ZmHtmlEditor.prototype = new DwtHtmlEditor();
ZmHtmlEditor.prototype.constructor = ZmHtmlEditor;


// Consts
ZmHtmlEditor._VALUE = "value";
ZmHtmlEditor._INSERT_TABLE = "ZmHtmlEditor._INSERT_TABLE";

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
		isSupported = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	}

	return isSupported;
};

ZmHtmlEditor.prototype.setMode =
function(mode, convert) {
	this.discardMisspelledWords();
	DwtHtmlEditor.prototype.setMode.call(this, mode, convert);

	// show/hide toolbars based on mode
	this._toolbar1.setVisible(mode == DwtHtmlEditor.HTML);
	this._toolbar2.setVisible(mode == DwtHtmlEditor.HTML);
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
	if (AjxEnv.isGeckoBased) {
		this._enableDesignMode([this._getIframeDoc()]);
	}
};

ZmHtmlEditor.prototype.addEventCallback =
function(callback) {
	this._eventCallback = callback;
};

ZmHtmlEditor.prototype.getContent =
function() {
	this.discardMisspelledWords();
	return DwtHtmlEditor.prototype.getContent.call(this);
};

ZmHtmlEditor.prototype.spellCheck =
function(callback) {
	var text = this.getTextVersion();
	if (/\S/.test(text)) {
		if (!this.onExitSpellChecker)
			this.onExitSpellChecker = callback;
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
	} else if (this._spellCheckDivId != null) {
		var div = this.getElementById(this._spellCheckDivId);
		var scrollTop = div.scrollTop;
		var textArea = this.getElementById(this._textAreaId);
		textArea.value = AjxUtil.getInnerText(div);

		// avoid mem. leaks, hopefully
		div.onclick = null;
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

ZmHtmlEditor.prototype.highlightMisspelledWords =
function(words, keepModeDiv) {
	this.discardMisspelledWords(keepModeDiv);

	var word, style, doc, body, self = this,
		spanIds     = {},
		wordIds     = {},
		regexp      = [ "\\b(" ],
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
	regexp.push(")\\b");
	regexp = new RegExp(regexp.join(""), "gm");

	function hiliteWords(text, textWhiteSpace) {
		text = textWhiteSpace
			? AjxStringUtil.convertToHtml(text)
			: AjxStringUtil.htmlEncode(text);
		return text.replace(regexp, function(str, word) {
			// return suggestions[word];
			var id = Dwt.getNextId();
			spanIds[id] = word;
			if (!wordIds[word])
				wordIds[word] = [];
			wordIds[word].push(id);
			return [ '<span word="',
				 word, '" id="', id, '" class="ZM-SPELLCHECK-MISSPELLED">',
				 word, '</span>'].join("");
		});
	};

	if (this._mode == DwtHtmlEditor.HTML) {
		// HTML mode; See the "else" branch for the TEXT mode--code
		// differs quite a lot.  We should probably implement separate
		// functions as this already becomes long.

		doc = this._getIframeDoc();
		body = doc.body;

		// load the spell check styles, if not already there.
		style = doc.getElementById("ZM-SPELLCHECK-STYLE");
		if (!style) {
			style = doc.createElement("link");
			style.id = "ZM-SPELLCHECK-STYLE";
			style.rel = "stylesheet";
			style.type = "text/css";
			var style_url = "/zimbra/js/zimbraMail/config/style/spellcheck.css";
			if (AjxEnv.isGeckoBased) {
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

		// having the data, this function will parse the DOM and replace
		// occurrences of the misspelled words with <span
		// class="ZM-SPELLCHECK-MISSPELLED">word</span>
		function rec(node) {
			switch (node.nodeType) {
			    case 1: /* ELEMENT */
				for (var i = node.firstChild; i; i = rec(i));
				node = node.nextSibling;
				break;
			    case 3: /* TEXT */
				if (!/\S/.test(node.data)) {
					node = node.nextSibling;
					break;
				}
				// for correct handling of whitespace we should
				// not mess ourselves with leading/trailing
				// whitespace, thus we save it in 2 text nodes.
				var a = null, b = null;
				if (/^[\s\xA0]+/.test(node.data)) {
					// a will contain the leading space
					a = node;
					node = node.splitText(RegExp.lastMatch.length);
				}
				if (/[\s\xA0]+$/.test(node.data)) {
					// and b will contain the trailing space
					b = node.splitText(node.data.length - RegExp.lastMatch.length);
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
		body.style.display = "none"; // seems to have a good impact on speed,
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

	} else { // TEXT mode

		doc = this.getDocument();
		var textArea = this.getElementById(this._textAreaId);
		var scrollTop = textArea.scrollTop;
		var size = Dwt.getSize(textArea);
		textArea.style.display = "none";
		var div = doc.createElement("div");
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

		var text = hiliteWords(this.getTextVersion(), true);
		div.innerHTML = text;

		textArea.parentNode.insertBefore(div, textArea);
		div.scrollTop = scrollTop;
		div.onclick = function(ev) { self._handleSpellCheckerEvents(ev || window.event); };
	}

	this._spellCheckShowModeDiv();

	// save the spell checker context
	this._spellCheck = { suggestions : suggestions,
			     spanIds     : spanIds,
			     wordIds     : wordIds };
};

ZmHtmlEditor.prototype.setSize =
function(x, y) {
	// window.status = ev.oldWidth + "x" + ev.oldHeight + " -> " + ev.newWidth + "x" + ev.newHeight;
	var div = null;
	if (this._spellCheckDivId) {
		div = this.getElementById(this._spellCheckDivId);
		div.style.display = "none";
	}

	var main = this.getElementById(this.getBodyFieldId());
	main.style.display = "none";

	var delta = 2 + 6;	// we must substract borders and paddings
	if (this._mode == DwtHtmlEditor.HTML)
		delta += 2;	// for some reason...
	x -= delta;

	if (this._spellCheckModeDivId)
		y -= this.getElementById(this._spellCheckModeDivId).offsetHeight;
	y -= delta
		+ this._toolbar1.getHtmlElement().offsetHeight
		+ this._toolbar2.getHtmlElement().offsetHeight;
	main.style.width = x + "px";
	main.style.height = y + "px";
	if (div) {
		if (!AjxEnv.isIE) {
			x -= 4;
			y -= 4;
		} else {
			y += 2;
		}
		div.style.width = x + "px";
		div.style.height = y + "px";
		div.style.display = "";
	} else {
		// when the DIV is present, "main" is the textarea which should
		// actually remain hidden
		main.style.display = "";
	}
};


// Private / protected methods

ZmHtmlEditor.prototype._initialize =
function() {
	this._createToolBar1(this);
	this._createToolBar2(this);

	DwtHtmlEditor.prototype._initialize.call(this);
};

ZmHtmlEditor.prototype._styleListener =
function(ev) {
	this.setStyle(ev._args.newValue);
};

ZmHtmlEditor.prototype._fontNameListener =
function(ev) {
	this.setFont(ev._args.newValue);
};

ZmHtmlEditor.prototype._fontSizeListener =
function(ev) {
	this.setFont(null, null, ev._args.newValue);
};

ZmHtmlEditor.prototype._directionListener =
function(ev) {
	this.setTextDirection(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._indentListener =
function(ev) {
	this.setIndent(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._insElementListener =
function(ev) {
	var elType = ev.item.getData(ZmHtmlEditor._VALUE);
	switch (elType) {
		case ZmHtmlEditor._INSERT_TABLE:
			if (this._createTableDialog)
				this._resetCreateTableDialog();
			else
				this._createCreateTableDialog();
				this._createTableDialog.popup();
			break;
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
	this.setFont(null, null, null, ev.detail, null);
};

ZmHtmlEditor.prototype._fontHiliteListener =
function(ev) {
	this.setFont(null, null, null, null, ev.detail);
};

ZmHtmlEditor.prototype._createToolBar1 =
function(parent) {
	var tb = this._toolbar1 = new DwtToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	tb.setVisible(this._mode == DwtHtmlEditor.HTML);

	this._createStyleSelect(tb);
	this._createFontFamilySelect(tb);
	this._createFontSizeMenu(tb);
	new DwtControl(tb, "vertSep");

	var listener = new AjxListener(this, this._fontStyleListener);
	var b = this._boldButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Bold");
	b.setToolTipContent(ZmMsg.boldText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.BOLD_STYLE);
	b.addSelectionListener(listener);

	b = this._italicButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Italics");
	b.setToolTipContent(ZmMsg.italicText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.ITALIC_STYLE);
	b.addSelectionListener(listener);

	b = this._underlineButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Underline");
	b.setToolTipContent(ZmMsg.underlineText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.UNDERLINE_STYLE);
	b.addSelectionListener(listener);

	b = this._strikeThruButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("StrikeThru");
	b.setToolTipContent(ZmMsg.strikeThruText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.STRIKETHRU_STYLE);
	b.addSelectionListener(listener);

	b = this._superscriptButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("SuperScript");
	b.setToolTipContent(ZmMsg.superscript);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.SUPERSCRIPT_STYLE);
	b.addSelectionListener(listener);

	b = this._subscriptButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Subscript");
	b.setToolTipContent(ZmMsg.subscript);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.SUBSCRIPT_STYLE);
	b.addSelectionListener(listener);
};

ZmHtmlEditor.prototype._createToolBar2 =
function(parent) {
	var tb = this._toolbar2 = new DwtToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	tb.setVisible(this._mode == DwtHtmlEditor.HTML);

	var listener = new AjxListener(this, this._justificationListener);
	var b = this._leftJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("LeftJustify");
	b.setToolTipContent(ZmMsg.leftJustify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_LEFT);
	b.addSelectionListener(listener);

	b = this._centerJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("CenterJustify");
	b.setToolTipContent(ZmMsg.centerJustify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_CENTER);
	b.addSelectionListener(listener);

	b = this._rightJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("RightJustify");
	b.setToolTipContent(ZmMsg.rightJustify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_RIGHT);
	b.addSelectionListener(listener);

	b = this._fullJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("FullJustify");
	b.setToolTipContent(ZmMsg.justify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_FULL);
	b.addSelectionListener(listener);

	new DwtControl(tb, "vertSep");

	var insElListener = new AjxListener(this, this._insElementListener);
	b = this._listButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE,  "TBButton");
	b.setToolTipContent(ZmMsg.bulletedList);
	b.setImage("BulletedList");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.UNORDERED_LIST);
	b.addSelectionListener(insElListener);

	b = this._numberedListButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setToolTipContent(ZmMsg.numberedList);
	b.setImage("NumberedList");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.ORDERED_LIST);
	b.addSelectionListener(insElListener);

	listener = new AjxListener(this, this._indentListener);
	b = this._outdentButton = new DwtButton(tb, null, "TBButton");
	b.setToolTipContent(ZmMsg.outdent);
	b.setImage("Outdent");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.OUTDENT);
	b.addSelectionListener(insElListener);

	b = this._indentButton = new DwtButton(tb, null, "TBButton");
	b.setToolTipContent(ZmMsg.indent);
	b.setImage("Indent");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.INDENT);
	b.addSelectionListener(insElListener);

	new DwtControl(tb, "vertSep");

	b = this._fontColorButton = new DwtButton(tb, null, "TBButton");
	b.setImage("FontColor");
	b.setToolTipContent(ZmMsg.fontColor);
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	var cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._fontColorListener));
	b.setMenu(m);

	b = this._fontBackgroundButton = new DwtButton(tb, null, "TBButton");
	b.setImage("FontBackground");
	b.setToolTipContent(ZmMsg.fontBackground);
	m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._fontHiliteListener));
	b.setMenu(m);

	new DwtControl(tb, "vertSep");

	b = this._horizRuleButton = new DwtButton(tb, null, "TBButton");
	b.setImage("HorizRule");
	b.setToolTipContent(ZmMsg.horizRule);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.HORIZ_RULE);
	b.addSelectionListener(insElListener);
	
	b = this._horizRuleButton = new DwtButton(tb, null, "TBButton");
	b.setImage("InsertTable");
	b.setToolTipContent(ZmMsg.insertTable);
	b.setData(ZmHtmlEditor._VALUE, ZmHtmlEditor._INSERT_TABLE);
	b.addSelectionListener(insElListener);
};

ZmHtmlEditor.prototype._createStyleSelect =
function(tb) {
	var listener = new AjxListener(this, this._styleListener);
	var s = this._styleSelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);

	s.addOption("Normal", true, DwtHtmlEditor.PARAGRAPH);
	s.addOption("Heading 1", false, DwtHtmlEditor.H1);
	s.addOption("Heading 2", false, DwtHtmlEditor.H2);
	s.addOption("Heading 3", false, DwtHtmlEditor.H3);
	s.addOption("Heading 4", false, DwtHtmlEditor.H4);
	s.addOption("Heading 5", false, DwtHtmlEditor.H5);
	s.addOption("Heading 6", false, DwtHtmlEditor.H6);
	s.addOption("Address", false, DwtHtmlEditor.ADDRESS);
	s.addOption("Preformatted", false, DwtHtmlEditor.PREFORMATTED);
};

ZmHtmlEditor.prototype._createFontFamilySelect =
function(tb) {
	var listener = new AjxListener(this, this._fontNameListener);
	var s = this._fontFamilySelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);

	var fontFamily = this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);

	s.addOption("Arial", fontFamily == "Arial", DwtHtmlEditor.ARIAL);
	s.addOption("Times New Roman", fontFamily == "Times New Roman", DwtHtmlEditor.TIMES);
	s.addOption("Courier New", fontFamily == "Courier New", DwtHtmlEditor.COURIER);
	s.addOption("Verdana", fontFamily == "Verdana", DwtHtmlEditor.VERDANA);
};

ZmHtmlEditor.prototype._createFontSizeMenu =
function(tb) {
	var listener = new AjxListener(this, this._fontSizeListener);
	var s = this._fontSizeSelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);

	var fontSize = this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);

	s.addOption("1 (8pt)", fontSize == "8pt", 1);
	s.addOption("2 (10pt)", fontSize == "10pt", 2);
	s.addOption("3 (12pt)", fontSize == "12pt", 3);
	s.addOption("4 (14pt)", fontSize == "14pt", 4);
	s.addOption("5 (18pt)", fontSize == "18pt", 5);
	s.addOption("6 (24pt)", fontSize == "24pt", 6);
	s.addOption("7 (36pt)", fontSize == "36pt", 7);
};

ZmHtmlEditor.prototype._rteStateChangeListener =
function(ev) {

	this._boldButton.setToggled(ev.isBold);
	this._underlineButton.setToggled(ev.isUnderline);
	this._italicButton.setToggled(ev.isItalic);
	this._strikeThruButton.setToggled(ev.isStrikeThru);
	this._subscriptButton.setToggled(ev.isSubscript);
	this._superscriptButton.setToggled(ev.isSuperscript);

	this._numberedListButton.setToggled(ev.isOrderedList);
	this._listButton.setToggled(ev.isUnorderedList);

	if (ev.style)
		this._styleSelect.setSelectedValue(ev.style);

	if (ev.fontFamily)
		this._fontFamilySelect.setSelectedValue(ev.fontFamily);

	if (ev.fontSize && ev.fontFamily != "")
		this._fontSizeSelect.setSelectedValue(ev.fontSize);

	if (ev.justification == DwtHtmlEditor.JUSTIFY_LEFT) {
		this._leftJustifyButton.setToggled(true);
		this._centerJustifyButton.setToggled(false);
		this._rightJustifyButton.setToggled(false);
		this._fullJustifyButton.setToggled(false);
	} else if (ev.justification == DwtHtmlEditor.JUSTIFY_CENTER) {
		this._leftJustifyButton.setToggled(false);
		this._centerJustifyButton.setToggled(true);
		this._rightJustifyButton.setToggled(false);
		this._fullJustifyButton.setToggled(false);
	} else if (ev.justification == DwtHtmlEditor.JUSTIFY_RIGHT) {
		this._leftJustifyButton.setToggled(false);
		this._centerJustifyButton.setToggled(false);
		this._rightJustifyButton.setToggled(true);
		this._fullJustifyButton.setToggled(false);
	} else if (ev.justification == DwtHtmlEditor.JUSTIFY_FULL) {
		this._leftJustifyButton.setToggled(false);
		this._centerJustifyButton.setToggled(false);
		this._rightJustifyButton.setToggled(false);
		this._fullJustifyButton.setToggled(true);
	}
};

ZmHtmlEditor.prototype._settingsChangeListener =
function(ev) {
	var setting = ev.source;
	if (setting.id == ZmSetting.COMPOSE_INIT_FONT_COLOR ||
		setting.id == ZmSetting.COMPOSE_INIT_FONT_FAMILY ||
		setting.id == ZmSetting.COMPOSE_INIT_FONT_SIZE)
	{
		this._initialStyle = this._getInitialStyle(true);
		var iframeDoc = this._getIframeDoc();
		if (iframeDoc) {
			var initHtml = "<html><head>" + this._getInitialStyle(false) + "</head><body></body></html>";
			iframeDoc.open();
			iframeDoc.write(initHtml);
			iframeDoc.close();

			// update DwtSelect to reflect to new font size or family
			if (setting.id == ZmSetting.COMPOSE_INIT_FONT_FAMILY) {
				var fontfamily = this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
				var selectedValue = null;
				if (fontfamily == "Arial") 			selectedValue = DwtHtmlEditor.ARIAL;
				else if (fontfamily == "Times") 	selectedValue = DwtHtmlEditor.TIMES;
				else if (fontfamily == "Courier") 	selectedValue = DwtHtmlEditor.COURIER;
				else if (fontfamily == "Verdana") 	selectedValue = DwtHtmlEditor.VERDANA;
				if (selectedValue)
					this._fontFamilySelect.setSelectedValue(selectedValue);
			} else if (setting.id == ZmSetting.COMPOSE_INIT_FONT_SIZE) {
				var fontsize = this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
				var selectedValue = null;
				if (fontsize == "8pt") 		 selectedValue = 1;
				else if (fontsize == "10pt") selectedValue = 2;
				else if (fontsize == "12pt") selectedValue = 3;
				else if (fontsize == "14pt") selectedValue = 4;
				else if (fontsize == "18pt") selectedValue = 5;
				else if (fontsize == "24pt") selectedValue = 6;
				else if (fontsize == "36pt") selectedValue = 7;
				if (selectedValue)
					this._fontSizeSelect.setSelectedValue(selectedValue);
			}
		}
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

ZmHtmlEditor.prototype._getInitialFontFamily =
function() {
	// get font family user preference
	var familyPref = this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	familyPref = familyPref.toLowerCase(); // normalize value

	var fontFamily = DwtHtmlEditor._TIMES;
	if (familyPref.search(DwtHtmlEditor._VERDANA_RE) != -1)
		fontFamily = DwtHtmlEditor._VERDANA;
	else if (familyPref.search(DwtHtmlEditor._ARIAL_RE) != -1)
		fontFamily = DwtHtmlEditor._ARIAL;
	else if (familyPref.search(DwtHtmlEditor._COURIER_RE) != -1)
		fontFamily = DwtHtmlEditor._COURIER;

	return fontFamily;
};

ZmHtmlEditor.prototype._getInitialFontSize =
function() {
	return this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
};

ZmHtmlEditor.prototype._getInitialFontColor =
function() {
	return this._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
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
	var doc = this.getDocument();

	if (!this._spellCheckModeDivId) {

		var div = doc.createElement("div");
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

		var editable = Dwt.getDomObj(doc, (this._spellCheckDivId || this.getBodyFieldId()));
		editable.parentNode.insertBefore(div, editable);

		var el = div.getElementsByTagName("span");
		Dwt.associateElementWithObject(el[0], this);
		Dwt.setHandler(el[0], "onclick", ZmHtmlEditor._spellCheckResumeEditing);
		Dwt.associateElementWithObject(el[1], this);
		Dwt.setHandler(el[1], "onclick", ZmHtmlEditor._spellCheckAgain);
	} else {
		Dwt.getDomObj(doc, this._spellCheckModeDivId).style.display = "";
	}
	// this.parent._resetBodySize();
	this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 2));
};

ZmHtmlEditor.prototype._spellCheckHideModeDiv =
function() {
	var size = this.getSize();
	if (this._spellCheckModeDivId)
		this.getElementById(this._spellCheckModeDivId).style.display = "none";
	this.setSize(size.x, size.y + (this._mode == DwtHtmlEditor.TEXT ? 1 : 2));
};

ZmHtmlEditor.prototype._spellCheckSuggestionListener =
function(ev) {
	var self = this;
	var item = ev.item;
	var orig = item.getData("orig");
	if (!orig)
		return;
	var val = item.getData("value");
	var plainText = this._mode == DwtHtmlEditor.TEXT;
	var fixall = item.getData("fixall");
	var doc = plainText ? this.getDocument() : this._getIframeDoc();
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
			var div = self.getElementById(self._spellCheckDivId);
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

ZmHtmlEditor.prototype._handleSpellCheckerEvents = function(ev) {
	var plainText = this._mode == DwtHtmlEditor.TEXT;
	var p = plainText ? (ev ? DwtUiEvent.getTarget(ev) : null) : this._getParentElement(),
		span, ids, i, suggestions,
		self = this,
		sc = this._spellCheck,
		doc = plainText ? this.getDocument() : this._getIframeDoc(),
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
	    (!ev || ( /click|mousedown|mouseup/.test(ev.type)
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
	    (/mouseup/i.test(ev.type) || (plainText && /(click|mousedown)/i.test(ev.type))))
	{
		function makeMenu(fixall, parent) {
			var menu = new ZmPopupMenu(parent), item;
			if (modified) {
				item = menu.createMenuItem
					("orig", null,
					 "<b style='color: red'>Initial: " + word + "</b>",
					 null, true, null, null);
				item.setData("fixall", fixall);
				item.setData("value", word);
				item.setData("orig", word);
				item.setData("spanId", p.id);
				item.addSelectionListener(self._spellCheckSuggestionListener);
			}
			if (plainText) {
				// in plain text mode we want to be able to edit misspelled words
				var txt = fixall ? "Edit all" : "Edit";
				item = menu.createMenuItem("edit", null, "<b style='color: #d62'>" + txt + "</b>",
							   null, true, null, null);
				item.setData("fixall", fixall);
				item.setData("orig", word);
				item.setData("spanId", p.id);
				item.addSelectionListener(self._spellCheckSuggestionListener);
			}
			if (modified || plainText)
				menu.createSeparator();
			if (suggestions.length > 0) {
				for (var i = 0; i < suggestions.length; ++i) {
					item = menu.createMenuItem("sug-" + fixall + "" + i,
								   null, suggestions[i],
								   null, true, null, null);
					item.setData("fixall", fixall);
					item.setData("value", suggestions[i]);
					item.setData("orig", word);
					item.setData("spanId", p.id);
					item.addSelectionListener(self._spellCheckSuggestionListener);
				}
			} else {
				item = menu.createMenuItem("clear", null, "<b style='color: red'>Clear text</b>",
							   null, true, null, null);
				item.setData("fixall", fixall);
				item.setData("value", "");
				item.setData("orig", word);
				item.setData("spanId", p.id);
				item.addSelectionListener(self._spellCheckSuggestionListener);
			}
			return menu;
		};
		sc.menu = makeMenu(0, this);
		if (sc.wordIds[word].length > 1) {
			sc.menu.createSeparator();
			var item = sc.menu.createMenuItem
				("fixall", null,
				 "Replace all (" + sc.wordIds[word].length + " occurrences)",
				 null, true, null, null);
			item.setMenu(makeMenu(1, item));
		}
		var pos, ms = sc.menu.getSize(), ws = this.shell.getSize();
		if (!plainText) {
			pos = Dwt.getLocation(this.getElementById(this._iFrameId));
			var pos2 = Dwt.getLocation(p);
			pos.x += pos2.x
				- (doc.documentElement.scrollLeft || doc.body.scrollLeft);
			pos.y += pos2.y
				- (doc.documentElement.scrollTop || doc.body.scrollTop);
		} else {
			pos = Dwt.getLocation(p);
			var div = this.getElementById(this._spellCheckDivId);
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
			this._appCtxt.setStatusMsg(ZmMsg.noMisspellingsFound, ZmStatusView.LEVEL_INFO);
		} else {
			var msg = misspelled.length + " " + (misspelled.length > 1 ? ZmMsg.misspellings : ZmMsg.misspelling);
			this._appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);

			this.highlightMisspelledWords(misspelled);
			wordsFound = true;
		}
	} else {
		this._appCtxt.setStatusMsg(ZmMsg.spellCheckUnavailable, ZmStatusView.LEVEL_CRITICAL);
		DBG.println(args._data);
	}

	if (this.onExitSpellChecker)
		this.onExitSpellChecker.run(wordsFound);
};




/**
* Makes server request to check spelling of given text.
* @constructor
* @class
* Use this class to check spelling of any text via check() method.
*
* TODO: we may want to move this class out into its own file later...
*
* @author Mihai Bazon
* @param parent			the parent needing spell checking
* @param appCtxt		the application context
*/
function ZmSpellChecker(parent, appCtxt) {
	this._parent = parent;
	this._appCtxt = appCtxt;
};


// Public methods
ZmSpellChecker.prototype.toString =
function() {
	return "ZmSpellChecker";
};

ZmSpellChecker.prototype.check =
function(text, callback) {
	var soapDoc = AjxSoapDoc.create("CheckSpellingRequest", "urn:zimbraMail");
	soapDoc.getMethod().appendChild(soapDoc.getDoc().createTextNode(text));

	var callback = new AjxCallback(this, this._checkCallback, [callback]);
	this._appCtxt.getAppController().sendRequest(soapDoc, true, callback);
};

ZmSpellChecker.prototype._checkCallback =
function(args) {
	var callback	= args[0];
	var resp		= args[1];

	var words = resp._isException ? null : resp.getResponse().CheckSpellingResponse;

	if (callback)
		callback.run(words);
};


ZmHtmlEditor.prototype._createCreateTableDialog =
function() {
	this._createTableDialog = new DwtDialog(this.shell, null, ZmMsg.insertTable, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
	this._createTableDialog._disableFFhack();
	this._createTableDialog.registerCallback(DwtDialog.OK_BUTTON, this._tableDialogOkCallback, this);

	var numColsLabel = Dwt.getNextId();
	var numColsId = Dwt.getNextId();
	var numRowsId = Dwt.getNextId();
	var tableWidthId = Dwt.getNextId(); 
	var cellSpacingId = Dwt.getNextId();
	var cellPaddingId = Dwt.getNextId();
	var widthUnitId = Dwt.getNextId();
     
	var html = [
         "<table><tr><td>",
         "<fieldset style='margin-left:5px'><legend>Table Size</legend>",
         "<div style='padding:2px;'></div>",
         "<table><tr>",
         "<td style='width:9em; float:left; padding:2px 5px; text-align:right;' id='", numColsLabel, "'>Number of Columns:</td>",
         "<td colspan=2 id='", numColsId, "'></td></tr>",
         "<tr><td style='width:9em; float:left; padding:2px 5px; text-align:right;'>Number of Rows:</td>",
         "<td colspan=2><input type='text' id='", numRowsId, "' size='5' value='5'/></td></tr>",
         "<tr><td style='width:9em; float:left; padding:2px 5px; text-align:right;'>Table Width:</td>",
         "<td><input type='text' id='", tableWidthId, "' size='5' value='100'/></td>",
         "<td style='padding-left;2px;' id='", widthUnitId, "'></td></tr></table></fieldset><p/>",
         "<fieldset style='margin-left:5px'><legend>Spacing</legend>",
         "<div style='padding:2px;'></div>",
         "<table xborder=1><tr>",
         "<td style='width:9em; float:left; padding:2px 5px; text-align:right;'>Cell Spacing:</td>",
         "<td><input type='text' id='", cellSpacingId, "' size='5' value='1'/></td></tr>",
         "<tr><td style='width:9em; float:left; padding:2px 5px; text-align:right;'>Cell Padding:</td>",
         "<td><input type='text' id='", cellPaddingId, "' size='5' value='1'/></td></tr></table></fieldset>",
         "</td></tr></table>"].join("");
     
	this._createTableDialog.setContent(html);
    
	this._tcdNumColsLabel = document.getElementById(numColsLabel);
	//this._tcdNumColsField = document.getElementById(numColsId);
	this._numColsField = new DwtInputField(this, DwtInputField.INTEGER, 2, 5, 5, null, DwtInputField.CONTINUAL_VALIDATION);
	this._numColsField.reparentHtmlElement(numColsId);
	
	
	this._tcdNumRowsField = document.getElementById(numRowsId);
	this._tcdTableWidthField = document.getElementById(tableWidthId);
	this._tcdcellSpacingField = document.getElementById(cellSpacingId);
	this._tcdcellPaddingField = document.getElementById(cellPaddingId);
 
	this._tcdWidthUnit = new DwtSelect(this.shell, ["Percent", "Pixels"]);
	document.getElementById(widthUnitId).appendChild(this._tcdWidthUnit.getHtmlElement());
};

ZmHtmlEditor.prototype._tableDialogOkCallback =
function(ev) {
	/* Need to validate all the fields */
	// ZmAppCtxt.getFromShell();
	// getMsgDialog();
	//  msgDialog = ZmAppCtxt.getFromShell().getMsgDialog();
	//  msgDialog.setButtonListener(, this._msgDialogButtonListener);
	//  msgDialog.set("HA HA HA", DwtMessageDialog.CRITICAL_STYLE, "Input Error");   var msgDialog;
	var val = this._tcdNumColsField.value();
	//if (!AjxUtil.isNonNegativeInteger(val)) {
	//	this._tcdNumColsLabel.style.color = "red";
	//	this._tcdNumColsFiled.style.background = "yellow";
	//}
	this.insertTable(rows, cols, width, alignment, border, cellSpacing, cellPadding) 
};