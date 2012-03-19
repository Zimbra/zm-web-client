/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Lite Html Editor
 *
 * It uses an text area as an editor where text is plain or all with the same style.
 *
 * @author Rajesh Segu
 * @class
 * @constructor
 */
ZmLiteHtmlEditor = function(params) {
	if (arguments.length == 0) return;

	params.className = params.className || "ZmLiteHtmlEditor";
	DwtComposite.call(this, params);

	this._mode = params.mode || ZmLiteHtmlEditor.TEXT;
	this._initialize();


};

ZmLiteHtmlEditor.prototype = new DwtComposite();
ZmLiteHtmlEditor.prototype.constructor = ZmLiteHtmlEditor;

//Constants

ZmLiteHtmlEditor.HTML = 1;
ZmLiteHtmlEditor.TEXT = 2;

ZmLiteHtmlEditor._VALUE = "value";

// Font Styles
ZmLiteHtmlEditor.BOLD_STYLE = "bold";
ZmLiteHtmlEditor.ITALIC_STYLE = "italic";
ZmLiteHtmlEditor.UNDERLINE_STYLE = "underline";

ZmLiteHtmlEditor.FONT_SIZE_STYLE = "fontsize";
ZmLiteHtmlEditor.FONT_FAMILY_STYLE = "fontfamily";

ZmLiteHtmlEditor.FONT_COLOR = "fontcolor";

ZmLiteHtmlEditor.FONT_SIZE_VALUES = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
ZmLiteHtmlEditor.FONT_FAMILY = [
        {name:"Tahoma",           value:"Tahoma, Verdana, Arial, Helvetica, sans-serif" },
        {name:"Arial",            value:"Arial, Helvetica, sans-serif" },
        {name:"Times New Roman",  value:"Times New Roman, Times, serif" },
        {name:"Courier",          value:"Courier, Courier New, mono" },
        {name:"Verdana",          value:"Verdana, Tahoma, Arial, Helvetica, sans-serif" }
];

ZmLiteHtmlEditor.STYLE = {};
ZmLiteHtmlEditor.STYLE[ZmLiteHtmlEditor.BOLD_STYLE] = "fontWeight";
ZmLiteHtmlEditor.STYLE[ZmLiteHtmlEditor.ITALIC_STYLE] = "fontStyle";
ZmLiteHtmlEditor.STYLE[ZmLiteHtmlEditor.UNDERLINE_STYLE] = "textDecoration";
ZmLiteHtmlEditor.STYLE[ZmLiteHtmlEditor.FONT_SIZE_STYLE] = "fontSize";
ZmLiteHtmlEditor.STYLE[ZmLiteHtmlEditor.FONT_FAMILY_STYLE] = "fontFamily";
ZmLiteHtmlEditor.STYLE[ZmLiteHtmlEditor.FONT_COLOR] = "color";


// Public methods

ZmLiteHtmlEditor.prototype.toString =
function() {
	return "ZmLiteHtmlEditor";
};

ZmLiteHtmlEditor.prototype.getEditor =
function(){
	return this._textArea;
};

ZmLiteHtmlEditor.prototype.getContent =
function(){
	return this._mode == ZmLiteHtmlEditor.HTML
	        ? this.getHtmlContent()
	        : this.getTextContent();
};

ZmLiteHtmlEditor.prototype.getTextContent =
function(){
	return this._textArea.value || "";
};

//<B><U><I><font color="#FF9900"><font face="arial"><font size=16>RAJESH SEGU IS HERE</I></U></B>
//width: 100%; height: 40px; font-family: Courier,Courier New,mono; font-size: 18pt; color: rgb(0, 0, 0); font-weight: bold; font-style: italic; text-decoration: underline;

ZmLiteHtmlEditor.prototype.getHtmlContent =
function(tag){

	var html = ["<span style='",this.getCSS(),"'>",
				AjxStringUtil.htmlEncode(this.getTextContent(), true).replace(/\r?\n/g, "<br/>"),
				"</span>"];

	return html.join("");
};

ZmLiteHtmlEditor.prototype.getCSS =
function() {
	var style = this._textArea.style;
	var css = [];

	if (style.fontFamily)
	        css.push("font-family: " + style.fontFamily);
	if (style.fontSize)
	        css.push("font-size: " + style.fontSize);
	if (style.color)
	        css.push("color: " + style.color);
	if (style.fontWeight)
	        css.push("font-weight: " + style.fontWeight);
	if (style.fontStyle)
	        css.push("font-style: " + style.fontStyle);
	if (style.textDecoration)
	        css.push("text-decoration: " + style.textDecoration);
	if (style.color)
		css.push("color: " + style.color);

	return css.join(";");
};

//Supports only text content
ZmLiteHtmlEditor.prototype.setContent =
function(content){
	this._textArea.value = (content || "");
};

ZmLiteHtmlEditor.prototype.setSelectionText = function(text) {
        Dwt.setSelectionText(this._textArea, text);
};

ZmLiteHtmlEditor.prototype.clear =
function() {
	this.setContent("");
	this._setDefaultStyles();
}

ZmLiteHtmlEditor.prototype.addModeChangeListener =
function(listener){
	this.addListener(DwtEvent.STATE_CHANGE, listener);
};

ZmLiteHtmlEditor.prototype.getMode =
function(){
	return this._mode;
};

ZmLiteHtmlEditor.prototype.setMode =
function(mode, force) {

	if ( (!force && mode == this._mode) ||
		(mode != ZmLiteHtmlEditor.HTML && mode != ZmLiteHtmlEditor.TEXT) )
	{
		return;
	}

	this._mode = mode;

	if(mode == ZmLiteHtmlEditor.HTML) {
		this._createFormatToolBar();
		this._enableToolbar(true);
		this._setDefaultStyles();
	}else{
		this._enableToolbar(false);
		this._clearAllStyles();
	}

	this.resetSize();

	// Notify mode change listeners.
	this.notifyListeners(DwtEvent.STATE_CHANGE);
};

ZmLiteHtmlEditor.prototype.isHtmlMode =
function(){
	return ( this._mode == ZmLiteHtmlEditor.HTML );
};

ZmLiteHtmlEditor.prototype.reverseMode =
function(){
	this.setMode(( (this._mode == ZmLiteHtmlEditor.HTML)? ZmLiteHtmlEditor.TEXT : ZmLiteHtmlEditor.HTML),false);
};

ZmLiteHtmlEditor.prototype.setSize =
function( width, height ){
	DwtComposite.prototype.setSize.call(this, width, height);
	this.resetSize();
};

ZmLiteHtmlEditor.prototype.resetSize = function(){
	var height = this.getHtmlElement().offsetHeight;
	var toolbarHeight = this._basicToolBar.getSize().y;
	if (this._mode == ZmLiteHtmlEditor.HTML) {
		toolbarHeight += this._formatToolBar.getSize().y;
	}
	this._textArea.style.width = "100%";
	this._textArea.style.height = height - toolbarHeight - 2 + "px";
};

//KeyPress event listener
ZmLiteHtmlEditor.prototype.addKeyPressListener =
function(listener){
	this._keyPressListener = listener;
};


ZmLiteHtmlEditor.prototype.enable =
function(enable){
	if(this._textArea)
		this._textArea.disabled = (!enable);
};

ZmLiteHtmlEditor.prototype.insertText =
function(text) {
	this._textArea.focus();
	this._textArea.value += text;
};

ZmLiteHtmlEditor.prototype.getBasicToolBar =
function() {
	return this._basicToolBar;
};

ZmLiteHtmlEditor.prototype.getFormatToolBar =
function() {
	return this._formatToolBar;
};

//Private Methods

ZmLiteHtmlEditor.prototype._initialize = function() {
	var id = this.getHTMLElId();
	this._createHtmlFromTemplate(this.TEMPLATE, { id: id });
	this._textArea = this._initEditor();

	this._textArea[ AjxEnv.isIE ? "onkeydown" : "onkeypress" ] = AjxCallback.simpleClosure(this._keyPressHandler,this);

	var toolBarArgs = {
		parent:this,
		parentElement: id + "_toolBar",
		posStyle:Dwt.RELATIVE_STYLE,
		buttons: [ZmOperation.IM_HTML],
		index:0
	};
	this._basicToolBar = new ZmButtonToolBar(toolBarArgs);
	this._basicToolBar.addSelectionListener(ZmOperation.IM_HTML, new AjxListener(this, this._changeEditorModeListener));
	
	this.setMode(this._mode, true);
};

ZmLiteHtmlEditor.prototype._initEditor = function(){
	var htmlEl = Dwt.byId(this.getHTMLElId() + "_textarea");

	this._textAreaId = "textarea_" + Dwt.getNextId();
	var html = [
			"<textarea id='",
			this._textAreaId,
			"' class='DwtHtmlEditorTextArea' style='width:100%;'></textarea>"
	].join("");
	htmlEl.innerHTML = html; 
	return Dwt.byId(this._textAreaId);
};

ZmLiteHtmlEditor.prototype._keyPressHandler =
function(ev){
	if (AjxEnv.isIE)
		ev = window.event;

	if(this._keyPressListener){
		this._keyPressListener.run(ev);
	}

};

ZmLiteHtmlEditor.prototype._changeEditorModeListener = function() {
	this.reverseMode();
	this.focus();
};

//Styles

ZmLiteHtmlEditor.prototype._clearAllStyles =
function(){
	var style = this._textArea.style;
	style.cssText = "";
	this.resetSize();
};

ZmLiteHtmlEditor.prototype._setDefaultStyles =
function(){
// 	var style = this._textArea.style;
// 	style.fontFamily = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
// 	style.fontSize = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
// 	style.color = appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
// 	style.fontWeight = "normal";
// 	style.fontStyle = "normal";
// 	style.textDecoration = "none";
};

ZmLiteHtmlEditor.prototype.setStyle =
function(property,value){
	this._textArea.style[property] = value;
};

ZmLiteHtmlEditor.prototype.getStyle =
function(property){
	return this._textArea.style[property];
};

//Toolbar

ZmLiteHtmlEditor.prototype._createFormatToolBar = function(){
	if (!this._formatToolBar) {
		var formatToolBar = this._formatToolBar = new DwtToolBar({parent:this, className:"ZToolbar",
												  posStyle:DwtControl.RELATIVE_STYLE, cellSpacing:2, index:0});
		this._initFormatToolBar(formatToolBar);
		ZmLiteHtmlEditor._toolbarHeight = ZmLiteHtmlEditor._toolbarHeight || this._formatToolBar.getHtmlElement().offsetHeight;
		this.setSize(Dwt.DEFAULT, this.getH() + ZmLiteHtmlEditor._toolbarHeight);
	}
};

ZmLiteHtmlEditor.prototype._enableToolbar =
function(enable) {
	var visible = !!enable;
	if (this._formatToolBar && (visible != !!this._formatToolBar.getVisible())) {
		this._formatToolBar.setVisible(visible);
		var sizeDiff = visible ? ZmLiteHtmlEditor._toolbarHeight : -ZmLiteHtmlEditor._toolbarHeight;
		this.setSize(Dwt.DEFAULT, this.getH() + sizeDiff);
	}
};

ZmLiteHtmlEditor.prototype._initFormatToolBar = function(tb){

	this._createFontFamilyMenu(tb);

	this._createFontSizeMenu(tb);

	new DwtControl({parent:tb, className:"vertSep"});

	var listener = new AjxListener(this, this._fontStyleListener);
	var params = {parent:tb, style:DwtButton.TOGGLE_STYLE};
	this._boldButton = new DwtToolBarButton(params);
	this._boldButton.setImage("Bold");
	this._boldButton.setToolTipContent(ZmMsg.boldText);
	this._boldButton.setData(ZmLiteHtmlEditor._VALUE, ZmLiteHtmlEditor.BOLD_STYLE);
	this._boldButton.addSelectionListener(listener);

	this._italicButton = new DwtToolBarButton(params);
	this._italicButton.setImage("Italics");
	this._italicButton.setToolTipContent(ZmMsg.italicText);
	this._italicButton.setData(ZmLiteHtmlEditor._VALUE, ZmLiteHtmlEditor.ITALIC_STYLE);
	this._italicButton.addSelectionListener(listener);

	this._underlineButton = new DwtToolBarButton(params);
	this._underlineButton.setImage("Underline");
	this._underlineButton.setToolTipContent(ZmMsg.underlineText);
	this._underlineButton.setData(ZmLiteHtmlEditor._VALUE, ZmLiteHtmlEditor.UNDERLINE_STYLE);
	this._underlineButton.addSelectionListener(listener);

	new DwtControl({parent:tb, className:"vertSep"});

	this._fontColorButton = new ZmLiteHtmlEditorColorPicker(tb,null,"ZToolbarButton");
	this._fontColorButton.dontStealFocus();
	this._fontColorButton.setImage("FontColor");
	this._fontColorButton.showColorDisplay(true);
	this._fontColorButton.setToolTipContent(ZmMsg.fontColor);
	this._fontColorButton.setData(ZmLiteHtmlEditor._VALUE, ZmLiteHtmlEditor.FONT_COLOR);
	this._fontColorButton.setColor("#000000");
	this._fontColorButton.addSelectionListener(new AjxListener(this, this._fontStyleListener));
};

ZmLiteHtmlEditor.prototype._createFontFamilyMenu =
function(tb) {
	this._fontFamilyButton = new DwtToolBarButton({parent:tb});
	this._fontFamilyButton.dontStealFocus();
	this._fontFamilyButton.setAlign(DwtLabel.ALIGN_LEFT);
	var menu = new ZmPopupMenu(this._fontFamilyButton);
	var listener = new AjxListener(this, this._fontFamilyListener);

	for (var i = 0; i < ZmLiteHtmlEditor.FONT_FAMILY.length; i++) {
		var item = ZmLiteHtmlEditor.FONT_FAMILY[i];
		var mi = menu.createMenuItem(item.name, {text:item.name});
		mi.addSelectionListener(listener);
		mi.setData(ZmLiteHtmlEditor._VALUE, i);
		if(i == 0){
			this._fontFamilyButton.setText(item.name);
		}
	}

	this._fontFamilyButton.setMenu(menu);
};

ZmLiteHtmlEditor.prototype._createFontSizeMenu =
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
		if(i == 0){
				this._fontSizeButton.setText(text);
		}
	}

	this._fontSizeButton.setMenu(menu);

};

ZmLiteHtmlEditor.prototype._fontFamilyListener =
function(ev) {
	var id = ev.item.getData(ZmLiteHtmlEditor._VALUE);
	this.setStyle("fontFamily",ZmLiteHtmlEditor.FONT_FAMILY[id].value);
	this._fontFamilyButton.setText(ZmLiteHtmlEditor.FONT_FAMILY[id].name);
	this.focus();
};

ZmLiteHtmlEditor.prototype._fontSizeListener =
function(ev) {
	var num = ev.item.getData(ZmLiteHtmlEditor._VALUE);
	var size = ZmLiteHtmlEditor.FONT_SIZE_VALUES[num-1];
	this.setStyle("fontSize",size);
	this._fontSizeButton.setText(num + " (" + size + ")");
	this.focus();
};

ZmLiteHtmlEditor.prototype._fontStyleListener =
function(ev) {

	var styleType = ev.item.getData(ZmHtmlEditor._VALUE);
	var style = ZmLiteHtmlEditor.STYLE[styleType];
	if(!style) return;

	var value = this.getStyle(style);
	if(styleType == ZmLiteHtmlEditor.UNDERLINE_STYLE){
		this.setStyle( style , (( !value || value == "none" ) ? "underline" : "none"));
	}else if (styleType == ZmLiteHtmlEditor.BOLD_STYLE){
		this.setStyle( style , (( !value || value == "normal" ) ? "bold" : "normal"));
	}else if(styleType == ZmLiteHtmlEditor.ITALIC_STYLE){
		this.setStyle( style , (( !value || value == "normal" ) ? "italic" : "normal"));
	}else if(styleType == ZmLiteHtmlEditor.FONT_COLOR){
		this.setStyle( style, ( ev.item.getColor() || "#000000" ) );
	}
	this.focus();
};

ZmLiteHtmlEditor.prototype.focus =
function() {
	this.getEditor().focus();
};

ZmLiteHtmlEditorColorPicker = function(parent,style,className) {
    DwtButtonColorPicker.call(this, parent,style,className);
}

ZmLiteHtmlEditorColorPicker.prototype = new DwtButtonColorPicker;
ZmLiteHtmlEditorColorPicker.prototype.constructor = ZmLiteHtmlEditorColorPicker;

ZmLiteHtmlEditorColorPicker.prototype.TEMPLATE = "dwt.Widgets#ZToolbarButton";
