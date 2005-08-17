/** 
 * Html Editor
 *
 * @author Ross Dargahi
 */
function LmHtmlEditor(parent, className, posStyle, content, mode) {
	if (arguments.length == 0) return;
	className = className || "LmHtmlEditor";
	
	DwtHtmlEditor.call(this, parent, className, posStyle, content, mode);

	this.addStateChangeListener(new LsListener(this, this._rteStateChangeListener));	
};

LmHtmlEditor.prototype = new DwtHtmlEditor();
LmHtmlEditor.prototype.constructor = LmHtmlEditor;


// Consts
LmHtmlEditor._VALUE = "value";

LmHtmlEditor.prototype.isHtmlEditingSupported =
function() {
	var isSupported = DwtHtmlEditor.prototype.isHtmlEditingSupported.call(this);
	if (isSupported) {
		// browser supports html edit but check if user pref allows it
		isSupported = this.parent._appCtxt.get(LmSetting.HTML_COMPOSE_ENABLED);
	}
	
	return isSupported;
};

LmHtmlEditor.prototype.setMode = 
function(mode, convert) {
	DwtHtmlEditor.prototype.setMode.call(this, mode, convert);
	
	// show/hide toolbars based on mode
	this._toolbar1.setVisible(mode == DwtHtmlEditor.HTML);
	this._toolbar2.setVisible(mode == DwtHtmlEditor.HTML);
};

LmHtmlEditor.prototype.getBodyFieldId = 
function() {
	return this._mode == DwtHtmlEditor.HTML ? this._iFrameId : this._textAreaId;
};

// returns the text version of the html message
LmHtmlEditor.prototype.getTextVersion = 
function() {
	return this._mode == DwtHtmlEditor.HTML
		? this._convertHtml2Text()
		: this.getContent();
};

// Re-sets design mode for buggy gecko-based browser
LmHtmlEditor.prototype.reEnableDesignMode = 
function() {
	if (LsEnv.isGeckoBased) {
		this._enableDesignMode([this._getIframeDoc()]);
	}
};

LmHtmlEditor.prototype._initialize = 
function() {
	this._createToolBar1(this);
	this._createToolBar2(this);

	DwtHtmlEditor.prototype._initialize.call(this);
};

LmHtmlEditor.prototype._styleListener =
function(ev) {
	this.setStyle(ev._args.newValue);
};

LmHtmlEditor.prototype._fontNameListener =
function(ev) {
	this.setFont(ev._args.newValue);
};

LmHtmlEditor.prototype._fontSizeListener =
function(ev) {
	this.setFont(null, null, ev._args.newValue);
};

LmHtmlEditor.prototype._directionListener =
function(ev) {
	this.setTextDirection(ev.item.getData(LmHtmlEditor._VALUE));
};

LmHtmlEditor.prototype._indentListener =
function(ev) {
	this.setIndent(ev.item.getData(LmHtmlEditor._VALUE));
};

LmHtmlEditor.prototype._insElementListener =
function(ev) {
	this.insertElement(ev.item.getData(LmHtmlEditor._VALUE));
};

LmHtmlEditor.prototype._justificationListener =
function(ev) {
	this.setJustification(ev.item.getData(LmHtmlEditor._VALUE));
};

LmHtmlEditor.prototype._fontStyleListener =
function(ev) {
	this.setFont(null, ev.item.getData(LmHtmlEditor._VALUE));
};

LmHtmlEditor.prototype._fontColorListener =
function(ev) {
	this.setFont(null, null, null, ev.detail, null);
};

LmHtmlEditor.prototype._fontHiliteListener =
function(ev) {
	this.setFont(null, null, null, null, ev.detail);
};

LmHtmlEditor.prototype._createToolBar1 =
function(parent) {
	var tb = this._toolbar1 = new DwtToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	tb.setVisible(this._mode == DwtHtmlEditor.HTML);

	this._createStyleSelect(tb);
	this._createFontFamilySelect(tb);
	this._createFontSizeMenu(tb);
	new DwtControl(tb, "vertSep");
	
	var listener = new LsListener(this, this._fontStyleListener);
	var b = this._boldButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_BOLD_TEXT);
	b.setToolTipContent(LmMsg.boldText);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.BOLD_STYLE);
	b.addSelectionListener(listener);
	
	b = this._italicButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_ITALIC_TEXT);
	b.setToolTipContent(LmMsg.italicText);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.ITALIC_STYLE);
	b.addSelectionListener(listener);
	
	b = this._underlineButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_UNDERLINE_TEXT);
	b.setToolTipContent(LmMsg.underlineText);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.UNDERLINE_STYLE);
	b.addSelectionListener(listener);
	
	b = this._strikeThruButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_STRIKETHRU_TEXT);
	b.setToolTipContent(LmMsg.strikeThruText);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.STRIKETHRU_STYLE);
	b.addSelectionListener(listener);

	b = this._superscriptButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_SUPERSCRIPT);
	b.setToolTipContent(LmMsg.superscript);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.SUPERSCRIPT_STYLE);
	b.addSelectionListener(listener);
	
	b = this._subscriptButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_SUBSCRIPT);
	b.setToolTipContent(LmMsg.subscript);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.SUBSCRIPT_STYLE);
	b.addSelectionListener(listener);
};

LmHtmlEditor.prototype._createToolBar2 =
function(parent) {
	var tb = this._toolbar2 = new DwtToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	tb.setVisible(this._mode == DwtHtmlEditor.HTML);
	
	var listener = new LsListener(this, this._justificationListener);
	var b = this._leftJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_LEFT_JUSTIFY);
	b.setToolTipContent(LmMsg.leftJustify);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_LEFT);
	b.addSelectionListener(listener);
	
	b = this._centerJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_CENTER_JUSTIFY);
	b.setToolTipContent(LmMsg.centerJustify);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_CENTER);
	b.addSelectionListener(listener);

	b = this._rightJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_RIGHT_JUSTIFY);
	b.setToolTipContent(LmMsg.rightJustify);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_RIGHT);
	b.addSelectionListener(listener);
	
	b = this._fullJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage(LmImg.I_FULL_JUSTIFY);
	b.setToolTipContent(LmMsg.justify);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_FULL);
	b.addSelectionListener(listener);
	
	new DwtControl(tb, "vertSep");

	var insElListener = new LsListener(this, this._insElementListener);
	b = this._listButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE,  "TBButton");
	b.setToolTipContent(LmMsg.bulletedList);
	b.setImage(LmImg.I_BULLETED_LIST);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.UNORDERED_LIST);
	b.addSelectionListener(insElListener);
	
	b = this._numberedListButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setToolTipContent(LmMsg.numberedList);
	b.setImage(LmImg.I_NUMBERED_LIST);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.ORDERED_LIST);
	b.addSelectionListener(insElListener);

	listener = new LsListener(this, this._indentListener);	
	b = this._outdentButton = new DwtButton(tb, null, "TBButton");
	b.setToolTipContent(LmMsg.outdent);
	b.setImage(LmImg.I_OUTDENT);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.OUTDENT);
	b.addSelectionListener(insElListener);
	
	b = this._indentButton = new DwtButton(tb, null, "TBButton");
	b.setToolTipContent(LmMsg.indent);
	b.setImage(LmImg.I_INDENT);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.INDENT);
	b.addSelectionListener(insElListener);
	
	new DwtControl(tb, "vertSep");

	b = this._fontColorButton = new DwtButton(tb, null, "TBButton");
	b.setImage(LmImg.I_FONT_COLOR);
	b.setToolTipContent(LmMsg.fontColor);
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	var cp = new DwtColorPicker(m);
	cp.addSelectionListener(new LsListener(this, this._fontColorListener));
	b.setMenu(m);
	
	b = this._fontBackgroundButton = new DwtButton(tb, null, "TBButton");
	b.setImage(LmImg.I_FONT_BACKGROUND);
	b.setToolTipContent(LmMsg.fontBackground);
	m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	cp = new DwtColorPicker(m);
	cp.addSelectionListener(new LsListener(this, this._fontHiliteListener));
	b.setMenu(m);
	
	new DwtControl(tb, "vertSep");
	
	b = this._horizRuleButton = new DwtButton(tb, null, "TBButton");
	b.setImage(LmImg.I_HORIZ_RULE);
	b.setToolTipContent(LmMsg.horizRule);
	b.setData(LmHtmlEditor._VALUE, DwtHtmlEditor.HORIZ_RULE);
	b.addSelectionListener(insElListener);
};

LmHtmlEditor.prototype._createStyleSelect =
function(tb) {
	var listener = new LsListener(this, this._styleListener);
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

LmHtmlEditor.prototype._createFontFamilySelect =
function(tb) {
	var listener = new LsListener(this, this._fontNameListener);
	var s = this._fontFamilySelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);
	
	s.addOption("Arial", false, DwtHtmlEditor.ARIAL);
	s.addOption("Times New Roman", true, DwtHtmlEditor.TIMES);
	s.addOption("Courier New", false, DwtHtmlEditor.COURIER);
	s.addOption("Verdana", false, DwtHtmlEditor.VERDANA);
};

LmHtmlEditor.prototype._createFontSizeMenu =
function(tb) {
	var listener = new LsListener(this, this._fontSizeListener);
	var s = this._fontSizeSelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);
	
	s.addOption("1 (8pt)", false, 1);
	s.addOption("2 (10pt)", false, 2);
	s.addOption("3 (12pt)", true, 3);
	s.addOption("4 (14pt)", false, 4);
	s.addOption("5 (18pt)", false, 5);
	s.addOption("6 (24pt)", false, 6);
	s.addOption("7 (36pt)", false, 7);
};

LmHtmlEditor.prototype._rteStateChangeListener =
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
