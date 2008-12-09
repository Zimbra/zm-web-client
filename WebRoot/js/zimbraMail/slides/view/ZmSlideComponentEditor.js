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
 * @constructor
 * @class
 * Html Editor
 *
 * @author Sathishkumar Sugumaran
 *
 * @param params			[hash]				hash of params:
 *        parent			[DwtComposite] 		parent widget
 *        className			[string]*			CSS class
 *        posStyle			[constant]*			positioning style
 *        content
 *        mode
 *        blankIframeSrc
 */
ZmSlideComponentEditor = function(params) {
    if (arguments.length == 0) { return; }
    params = Dwt.getParams(arguments, DwtHtmlEditor.PARAMS);
    params.className = params.className || "DwtHtmlEditor";
    DwtComposite.call(this, params);

    this.__eventClosure = AjxCallback.simpleClosure(this.__eventClosure, this);

	// init content
    this._pendingContent = params.content || "";
    this._htmlModeInited = false;

    this._iframe = params.iframe;
    this._iFrameId = this._iframe.id;
    this._mode = DwtHtmlEditor.HTML;
    this._initialize();

}

ZmSlideComponentEditor.prototype = new DwtHtmlEditor();
ZmSlideComponentEditor.prototype.constructor = ZmSlideComponentEditor;

ZmSlideComponentEditor._VALUE = "value";
ZmSlideComponentEditor.FONT_SIZE_VALUES = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
ZmSlideComponentEditor.FONT_FAMILY = [
	{name:"Times New Roman",	value:"Times New Roman, Times, serif" },
    {name:"Arial", 				value:"Arial, Helvetica, sans-serif" },
    {name:"Courier", 			value:"Courier, Courier New, mono" },
    {name:"Verdana",			value:"Verdana, Arial, Helvetica, sans-serif" }
];

ZmSlideComponentEditor.prototype.enable =
function(enable) {
};

ZmSlideComponentEditor.prototype.setMode =
function(mode, convert) {
    return;
};

ZmSlideComponentEditor.prototype.getMode =
function() {
    return ZmSlideComponentEditor.HTML
};

ZmSlideComponentEditor.prototype.getIframe =
function() {
    return this._iframe;
};

ZmSlideComponentEditor.prototype.getInputElement =
function() {
    return this._iframe;
};

ZmSlideComponentEditor.prototype._initialize =
function() {
    this._initHtmlMode(this._pendingContent);
};

ZmSlideComponentEditor.prototype._initHtmlMode =
function(content) {
    this._pendingContent = content || "";
    this._keyEvent = new DwtKeyEvent();
    this._stateEvent = new DwtHtmlEditorStateEvent();
    this._stateEvent.dwtObj = this;
    this._updateStateAction = new AjxTimedAction(this, this._updateState);
    this._finishHtmlModeInit();
    return this._iframe;
}

ZmSlideComponentEditor.prototype._finishHtmlModeInit =
function() {
    this._updateState();
    this._htmlModeInited = true;
    this._registerEditorEventHandlers(this._iframe, this._getIframeDoc());
};

ZmSlideComponentEditor.prototype._getIframeDoc =
function() {
    return this._iframe ? Dwt.getIframeDoc(this._iframe) : null;
}

ZmSlideComponentEditor.prototype._getIframeWin =
function() {
    return Dwt.getIframeWindow(this._iframe);
};


ZmSlideComponentEditor.prototype.setToolbar =
function(toolbar) {
    this._toolbar = toolbar;
};


ZmSlideComponentEditor.prototype._initToolBar =
function() {
    var tb = this._toolbar;
    this._createFontFamilyMenu(tb);
    this._createFontSizeMenu(tb);
    this._createStyleMenu(tb);
    this._createJustifyMenu(tb);
    tb.setVisible(true);

    new DwtControl({parent:tb, className:"vertSep"});

    var insListener = new AjxListener(this, this._insElementListener);
    var params = {parent:tb, style:DwtButton.TOGGLE_STYLE};
    this._listButton = new DwtToolBarButton(params);
    this._listButton.setToolTipContent(ZmMsg.bulletedList);
    this._listButton.setImage("BulletedList");
    this._listButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.UNORDERED_LIST);
    this._listButton.addSelectionListener(insListener);

    this._numberedListButton = new DwtToolBarButton(params);
    this._numberedListButton.setToolTipContent(ZmMsg.numberedList);
    this._numberedListButton.setImage("NumberedList");
    this._numberedListButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.ORDERED_LIST);
    this._numberedListButton.addSelectionListener(insListener);

    var listener = new AjxListener(this, this._indentListener);
    this._outdentButton = new DwtToolBarButton({parent:tb});
    this._outdentButton.setToolTipContent(ZmMsg.outdent);
    this._outdentButton.setImage("Outdent");
    this._outdentButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.OUTDENT);
    this._outdentButton.addSelectionListener(listener);

    this._indentButton = new DwtToolBarButton({parent:tb});
    this._indentButton.setToolTipContent(ZmMsg.indent);
    this._indentButton.setImage("Indent");
    this._indentButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.INDENT);
    this._indentButton.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    var listener = new AjxListener(this, this._fontStyleListener);
    this._boldButton = new DwtToolBarButton(params);
    this._boldButton.setImage("Bold");
    this._boldButton.setToolTipContent(AjxKeys["editor.Bold.summary"]);
    this._boldButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.BOLD_STYLE);
    this._boldButton.addSelectionListener(listener);

    this._italicButton = new DwtToolBarButton(params);
    this._italicButton.setImage("Italics");
    this._italicButton.setToolTipContent(AjxKeys["editor.Italic.summary"]);
    this._italicButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.ITALIC_STYLE);
    this._italicButton.addSelectionListener(listener);

    this._underlineButton = new DwtToolBarButton(params);
    this._underlineButton.setImage("Underline");
    this._underlineButton.setToolTipContent(AjxKeys["editor.Underline.summary"]);
    this._underlineButton.setData(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.UNDERLINE_STYLE);
    this._underlineButton.addSelectionListener(listener);

    tb.setVisible(true);
	
	this._styleMenu.checkItem(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.PARAGRAPH, true);
	this._justifyMenu.checkItem(ZmSlideComponentEditor._VALUE, DwtHtmlEditor.JUSTIFY_LEFT, true);
	
};

ZmSlideComponentEditor.prototype._createFontFamilyMenu =
function(tb) {
    this._fontFamilyButton = new DwtToolBarButton({parent:tb});
    this._fontFamilyButton.dontStealFocus();
    this._fontFamilyButton.setSize(Dwt.DEFAULT);
    this._fontFamilyButton.setAlign(DwtLabel.ALIGN_LEFT);
    var menu = new ZmPopupMenu(this._fontFamilyButton);
    var listener = new AjxListener(this, this._fontFamilyListener);

	var defaultText = "";

    for (var i = 0; i < ZmSlideComponentEditor.FONT_FAMILY.length; i++) {
        var item = ZmSlideComponentEditor.FONT_FAMILY[i];
        var mi = menu.createMenuItem(item.name, {text:item.name});
        mi.addSelectionListener(listener);
        mi.setData(ZmSlideComponentEditor._VALUE, i);
		if(i==0) {
			defaultText = item.name;
		}
    }

    this._fontFamilyButton.setMenu(menu);
    this._fontFamilyButton.setText(defaultText);
};

ZmSlideComponentEditor.prototype._createFontSizeMenu =
function(tb) {
    this._fontSizeButton = new DwtToolBarButton({parent:tb});
    this._fontSizeButton.dontStealFocus();
    var menu = new ZmPopupMenu(this._fontSizeButton);
    var listener = new AjxListener(this, this._fontSizeListener);

	var defaultText = "";

    for (var i = 0; i < ZmSlideComponentEditor.FONT_SIZE_VALUES.length; i++) {
        var item = ZmSlideComponentEditor.FONT_SIZE_VALUES[i];
        var num = i+1;
        var text = num + " (" + item + ")";
        var mi = menu.createMenuItem(i, {text:text});
        mi.addSelectionListener(listener);
        mi.setData(ZmSlideComponentEditor._VALUE, num);
		
		if(i == 2) {
			defaultText =  text;
		}

    }

    this._fontSizeButton.setMenu(menu);
	this._fontSizeButton.setText(defaultText);
};

ZmSlideComponentEditor.prototype._getFontSizeLabel =
function(fontSize) {
    for (var i = 0; i < ZmSlideComponentEditor.FONT_SIZE_VALUES.length; i++) {
        var item = ZmSlideComponentEditor.FONT_SIZE_VALUES[i];
        if (fontSize == item) {
            return ((i+1) + " (" + item + ")");
        }
    }
    return "3 (12pt)";
};

ZmSlideComponentEditor.prototype._createStyleMenu =
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
        mi.setData(ZmSlideComponentEditor._VALUE, item.id);
        if (i == 0)
            mi.setChecked(true, true);
    }

    s.setMenu(menu);
};

ZmSlideComponentEditor.prototype._createJustifyMenu =
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
        mi.setData(ZmSlideComponentEditor._VALUE, item.id);
        if (i == 0)
            mi.setChecked(true, true);
    }

    b.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
};

ZmSlideComponentEditor.prototype._fontStyleListener =
function(ev) {
    this.setFont(null, ev.item.getData(ZmSlideComponentEditor._VALUE));
};

ZmSlideComponentEditor.prototype._fontColorListener =
function(ev) {
    this.setFont(null, null, null, ev.detail || "#000000");
};

ZmSlideComponentEditor.prototype._fontHiliteListener =
function(ev) {
    this.setFont(null, null, null, null, ev.detail || "#ffffff");
};


ZmSlideComponentEditor.prototype._styleListener =
function(ev) {
    this.setStyle(ev.item.getData(ZmSlideComponentEditor._VALUE));
};

ZmSlideComponentEditor.prototype._fontFamilyListener =
function(ev) {
	var id = ev.item.getData(ZmSlideComponentEditor._VALUE);
	this.setFont(ZmSlideComponentEditor.FONT_FAMILY[id].value);
	this._fontFamilyButton.setText(ZmSlideComponentEditor.FONT_FAMILY[id].name);
};

ZmSlideComponentEditor.prototype._fontSizeListener =
function(ev) {
	this.setFont(null, null, ev.item.getData(ZmSlideComponentEditor._VALUE));
};

ZmSlideComponentEditor.prototype._indentListener =
function(ev) {
	this.setIndent(ev.item.getData(ZmSlideComponentEditor._VALUE));
};

ZmSlideComponentEditor.prototype._createToolBar = function(toolbarParent, locationBoundElement) {
    var toolbar = this._toolbar = new DwtToolBar({parent:toolbarParent, className:"ZToolbar SlideEditorToolbar",
        posStyle:DwtControl.ABSOLUTE_STYLE, cellSpacing:2, index:0});
    this._initToolBar();
	this._toolbar.setVisible(false);
	return toolbar;
};
