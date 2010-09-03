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

ZmDocsEditor = function(params) {
    if (arguments.length == 0) { return; }
    params = Dwt.getParams(arguments, DwtHtmlEditor.PARAMS);
    params.className = params.className || "DwtHtmlEditor";
    DwtComposite.call(this, params);
    this._buttons = {};
    this.__eventClosure = AjxCallback.simpleClosure(this.__eventClosure, this);

	// init content
    this._pendingContent = params.content || "";
    this._htmlModeInited = false;
    this._controller = params.controller;

    this._iframe = params.iframe;
    this._iFrameId = this._iframe.id;
    this._mode = DwtHtmlEditor.HTML;

    this.addStateChangeListener(new AjxListener(this, this._rteStateChangeListener));
}

ZmDocsEditor.prototype = new DwtHtmlEditor;
ZmDocsEditor.prototype.constructor = ZmDocsEditor;


ZmDocsEditor._VALUE = "ZD";
ZmDocsEditor.FONT_SIZE_VALUES = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];

ZmDocsEditor.FONT_FAMILY = {};
(function() {
	var KEYS = [ "fontFamilyIntl", "fontFamilyBase" ];
	var i, j, key, value, name;
	for (j = 0; j < KEYS.length; j++) {
		for (i = 1; value = AjxMsg[KEYS[j]+i+".css"]; i++) {
			if (value.match(/^#+$/)) break;
			name = AjxMsg[KEYS[j]+i+".display"];
			ZmDocsEditor.FONT_FAMILY[value] = {name:name, value:value};
		}
	}
})();

ZmDocsEditor.__makeFontName = function(value) {
	return value.replace(/,.*/,"").replace(/\b[a-z]/g, ZmDocsEditor.__toUpperCase);
};
ZmDocsEditor.__toUpperCase = function(s) {
	return s.toUpperCase();
};

ZmDocsEditor.prototype.enable =
function(enable) {
};

ZmDocsEditor.prototype.setMode =
function(mode, convert) {
    return;
};

ZmDocsEditor.prototype.getMode =
function() {
    return ZmDocsEditor.HTML;
};

ZmDocsEditor.prototype.getIframe =
function() {
    return this._iframe;
};

ZmDocsEditor.prototype.getInputElement =
function() {
    return this._iframe;
};

ZmDocsEditor.prototype._initIframe =
function() {
    this._initHtmlMode(this._pendingContent);
    //alert('here');
};

ZmDocsEditor.prototype._initHtmlMode =
function(content) {
    this._pendingContent = content || "";
    this._keyEvent = new DwtKeyEvent();
    this._stateEvent = new DwtHtmlEditorStateEvent();
    this._stateEvent.dwtObj = this;
    this._updateStateAction = new AjxTimedAction(this, this._updateState);

    var cont = AjxCallback.simpleClosure(this._finishHtmlModeInit, this);
    setTimeout(cont, DwtHtmlEditor._INITDELAY);

    return this._iframe;
}

ZmDocsEditor.prototype._finishHtmlModeInit =
function() {
    DwtHtmlEditor.prototype._finishHtmlModeInit.call(this);
};

ZmDocsEditor.prototype._getIframeDoc = function() {
    return this._iframe ? Dwt.getIframeDoc(this._iframe) : null;
};

ZmDocsEditor.prototype._saveButtonListener = function(ev) {
     alert(ev);
};

ZmDocsEditor.prototype._createFontFamilyMenu =
function(tb) {
    this._fontFamilyButton = new DwtToolBarButton({parent:tb});
    this._fontFamilyButton.dontStealFocus();
    this._fontFamilyButton.setSize(Dwt.DEFAULT);
    this._fontFamilyButton.setAlign(DwtLabel.ALIGN_LEFT);
    var menu = new ZmPopupMenu(this._fontFamilyButton,"ActionMenu", null, this._controller);
    var listener = new AjxListener(this, this._fontFamilyListener);

	var defaultText = "";

    for (var id in ZmDocsEditor.FONT_FAMILY) {
		var item = ZmDocsEditor.FONT_FAMILY[id];
		var mi = menu.createMenuItem(item.name, {text:item.name});
		mi.addSelectionListener(listener);
		mi.setData(ZmDocsEditor._VALUE, item.value);
	}

    this._fontFamilyButton.setMenu(menu);
    this._fontFamilyButton.setText(appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY));
};

ZmDocsEditor.prototype._createFontSizeMenu =
function(tb) {
    this._fontSizeButton = new DwtToolBarButton({parent:tb});
    this._fontSizeButton.dontStealFocus();
    var menu = new ZmPopupMenu(this._fontSizeButton, null, null, this._controller);
    var listener = new AjxListener(this, this._fontSizeListener);

	var defaultText = "";

    for (var i = 0; i < ZmDocsEditor.FONT_SIZE_VALUES.length; i++) {
        var item = ZmDocsEditor.FONT_SIZE_VALUES[i];
        var num = i+1;
        var text = num + " (" + item + ")";
        var mi = menu.createMenuItem(i, {text:text});
        mi.addSelectionListener(listener);
        mi.setData(ZmDocsEditor._VALUE, num);

		if(i == 2) {
			defaultText =  text;
		}

    }

    this._fontSizeButton.setMenu(menu);
	this._fontSizeButton.setText(defaultText);
};

ZmDocsEditor.prototype._getFontSizeLabel =
function(fontSize) {
    for (var i = 0; i < ZmDocsEditor.FONT_SIZE_VALUES.length; i++) {
        var item = ZmDocsEditor.FONT_SIZE_VALUES[i];
        if (fontSize == item) {
            return ((i+1) + " (" + item + ")");
        }
    }
    return "3 (12pt)";
};

ZmDocsEditor.prototype._createStyleMenu =
function(tb) {
    var s = new DwtToolBarButton({parent:tb});
	// minor hack to set section symbol - avoids d/l'ing an icon :]
    s.setText("x");
    s._textEl.innerHTML = "<span style='font-size:13px'>&sect;</span>";
    s.setToolTipContent(ZmMsg.sections);
    s.dontStealFocus();
    var menu = this._styleMenu = new ZmPopupMenu(s, null, null, this._controller);
    var listener = new AjxListener(this, this._styleListener);
    var menuItems = [
        { label:ZmMsg.normal,		id:DwtHtmlEditor.PARAGRAPH},
        { label:ZmMsg.heading1, 	id:DwtHtmlEditor.H1},
        { label:ZmMsg.heading2, 	id:DwtHtmlEditor.H2},
        { label:ZmMsg.heading3, 	id:DwtHtmlEditor.H3},
        { label:ZmMsg.heading4, 	id:DwtHtmlEditor.H4},
        { label:ZmMsg.heading5, 	id:DwtHtmlEditor.H5},
        { label:ZmMsg.heading6, 	id:DwtHtmlEditor.H6},
        { label:ZmMsg.address,		id:DwtHtmlEditor.ADDRESS},
        { label:ZmMsg.preformatted,	id:DwtHtmlEditor.PREFORMATTED} ];

    for (var i = 0; i < menuItems.length; i++) {
        var item = menuItems[i];
        var mi = menu.createMenuItem(item.id, {text:item.label, style:DwtMenuItem.RADIO_STYLE});
        mi.addSelectionListener(listener);
        mi.setData(ZmDocsEditor._VALUE, item.id);
        if (i == 0)
            mi.setChecked(true, true);
    }

    s.setMenu(menu);
};

ZmDocsEditor.prototype._createJustifyMenu =
function(tb) {
    var b = new DwtToolBarButton({parent:tb});
    b.dontStealFocus();
    b.setImage("LeftJustify");
    b.setToolTipContent(ZmMsg.alignment);
    var menu = this._justifyMenu = new ZmPopupMenu(b, null, null, this._controller);
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
        mi.setData(ZmDocsEditor._VALUE, item.id);
        if (i == 0)
            mi.setChecked(true, true);
    }

    b.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
};

ZmDocsEditor.prototype._fontStyleListener =
function(ev) {
    this.setFont(null, ev.item.getData(ZmDocsEditor._VALUE));
};

ZmDocsEditor.prototype._fontColorListener =
function(ev) {
    this.setFont(null, null, null, ev.detail || "#000000");
};

ZmDocsEditor.prototype._fontHiliteListener =
function(ev) {
    this.setFont(null, null, null, null, ev.detail || "#ffffff");
};


ZmDocsEditor.prototype._styleListener =
function(ev) {
    this.setStyle(ev.item.getData(ZmDocsEditor._VALUE));
};

ZmDocsEditor.prototype._fontFamilyListener =
function(ev) {
	var id = ev.item.getData(ZmDocsEditor._VALUE);
	this.setFont(ZmDocsEditor.FONT_FAMILY[id].value);
	this._fontFamilyButton.setText(ZmDocsEditor.FONT_FAMILY[id].name);
};

ZmDocsEditor.prototype._fontSizeListener =
function(ev) {
	this.setFont(null, null, ev.item.getData(ZmDocsEditor._VALUE));
};

ZmDocsEditor.prototype._indentListener =
function(ev) {
	this.setIndent(ev.item.getData(ZmDocsEditor._VALUE));
};

ZmDocsEditor.prototype._insElementListener =
function(ev) {
	var elType = ev.item.getData(ZmDocsEditor._VALUE);
	switch (elType) {
	    default:
		this.insertElement(elType);
	}
};

ZmDocsEditor.prototype._justificationListener =
function(ev) {
	this.setJustification(ev.item.getData(ZmDocsEditor._VALUE));
};

ZmDocsEditor.prototype._insertLinkListener =
function() {
	var dlg = this._insertLinkDialog;
	if (!dlg) {
		dlg = this._insertLinkDialog = new DwtDialog({parent:DwtShell.getShell(window), title:ZmMsg.linkProperties});
		var id = dlg.base_id = Dwt.getNextId();
		var html = AjxTemplate.expand("share.Dialogs#EditorInsertLink", {id:id});
		dlg.setContent(html);

		dlg.linkText = new DwtInputField({ parent        : dlg,
										   size          : 40,
										   parentElement : id + "_linkTextCont" });

		dlg.linkTarget = new DwtInputField({ parent        : dlg,
											 size          : 40,
											 parentElement : id + "_linkTargetCont" });

		function getURL() {
				var url = dlg.linkTarget.getValue();
				if (url && !/^(https?|ftp):\x2f\x2f/i.test(url)) {
					url = "http://" + url;
					dlg.linkTarget.setValue(url);
				}
				return url;
		};

		var btn = new DwtButton({ parent: dlg, parentElement: id + "_testBtnCont" });
		btn.setText(ZmMsg.testUrl);
		btn.setToolTipContent(ZmMsg.testUrlTooltip);
		btn.addSelectionListener(new AjxListener(this, function() {
			var url = getURL();
			if (url) {
				window.open(url);
			}
		}));

		dlg._tabGroup.addMember(dlg.linkText, 0);
		dlg._tabGroup.addMember(dlg.linkTarget, 1);
		dlg._tabGroup.addMember(btn, 2);

		dlg.registerCallback(DwtDialog.OK_BUTTON, new AjxListener(this, function(){
			var url = getURL();
			var text = dlg.linkText.getValue() || url;
			dlg.popdown();
			this.insertLink({ text : text, url  : url });
		}));
	}
	var link = this.getLinkProps();
	dlg.linkText.setValue(link.text || "");
	dlg.linkTarget.setValue(link.url || "");
	dlg.popup();
	if (/\S/.test(link.text)) {
		dlg.linkTarget.focus();
	} else {
		dlg.linkText.focus();
	}
};


ZmDocsEditor.prototype._initToolBar = function() {

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
    this._listButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.UNORDERED_LIST);
    this._listButton.addSelectionListener(insListener);

    this._numberedListButton = new DwtToolBarButton(params);
    this._numberedListButton.setToolTipContent(ZmMsg.numberedList);
    this._numberedListButton.setImage("NumberedList");
    this._numberedListButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.ORDERED_LIST);
    this._numberedListButton.addSelectionListener(insListener);

    var listener = new AjxListener(this, this._indentListener);
    this._outdentButton = new DwtToolBarButton({parent:tb});
    this._outdentButton.setToolTipContent(ZmMsg.outdent);
    this._outdentButton.setImage("Outdent");
    this._outdentButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.OUTDENT);
    this._outdentButton.addSelectionListener(listener);

    this._indentButton = new DwtToolBarButton({parent:tb});
    this._indentButton.setToolTipContent(ZmMsg.indent);
    this._indentButton.setImage("Indent");
    this._indentButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.INDENT);
    this._indentButton.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    var listener = new AjxListener(this, this._fontStyleListener);
    this._boldButton = new DwtToolBarButton(params);
    this._boldButton.setImage("Bold");
    this._boldButton.setToolTipContent(AjxKeys["editor.Bold.summary"]);
    this._boldButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.BOLD_STYLE);
    this._boldButton.addSelectionListener(listener);

    this._italicButton = new DwtToolBarButton(params);
    this._italicButton.setImage("Italics");
    this._italicButton.setToolTipContent(AjxKeys["editor.Italic.summary"]);
    this._italicButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.ITALIC_STYLE);
    this._italicButton.addSelectionListener(listener);

    this._underlineButton = new DwtToolBarButton(params);
    this._underlineButton.setImage("Underline");
    this._underlineButton.setToolTipContent(AjxKeys["editor.Underline.summary"]);
    this._underlineButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.UNDERLINE_STYLE);
    this._underlineButton.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});

    // add extra buttons here
    var params = {parent:tb, style:DwtButton.TOGGLE_STYLE};
    var b = this._strikeThruButton = new DwtToolBarButton(params);
    b.setImage("StrikeThru");
    b.setToolTipContent(ZmMsg.strikeThruText);
    b.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.STRIKETHRU_STYLE);
    b.addSelectionListener(listener);

    b = this._superscriptButton = new DwtToolBarButton(params);
    b.setImage("SuperScript");
    b.setToolTipContent(ZmMsg.superscript);
    b.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.SUPERSCRIPT_STYLE);
    b.addSelectionListener(listener);

    b = this._subscriptButton = new DwtToolBarButton(params);
    b.setImage("Subscript");
    b.setToolTipContent(ZmMsg.subscript);
    b.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.SUBSCRIPT_STYLE);
    b.addSelectionListener(listener);

    new DwtControl({parent:tb, className:"vertSep"});


    this._fontColorButton = new ZmDocsEditorColorPicker(tb,null,"ZToolbarButton");
	this._fontColorButton.dontStealFocus();
	this._fontColorButton.setImage("FontColor");
	this._fontColorButton.showColorDisplay(true);
	this._fontColorButton.setToolTipContent(ZmMsg.fontColor);
	this._fontColorButton.addSelectionListener(new AjxListener(this, this._fontColorListener));

	this._fontBackgroundButton = new ZmDocsEditorColorPicker(tb, null, "ZToolbarButton");
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
	this._horizRuleButton.setData(ZmDocsEditor._VALUE, DwtHtmlEditor.HORIZ_RULE);
	this._horizRuleButton.addSelectionListener(new AjxListener(this, this._insElementListener));

	this._insertLinkButton = new DwtToolBarButton(params);
	this._insertLinkButton.setImage("URL");
	this._insertLinkButton.setToolTipContent(ZmMsg.insertLink);
	this._insertLinkButton.addSelectionListener(new AjxListener(this, this._insertLinkListener));

    // BEGIN: Table operations
    b = this._tableButton = new DwtToolBarButton(params);
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

    new DwtControl({parent:tb, className:"vertSep"});

    var button = new DwtToolBarButton(params)
    button.setImage("ImageDoc");
    button.setToolTipContent(ZmMsg.insertImage);
    button.addSelectionListener(new AjxListener(this, this._insertImagesListener));

    button = new DwtToolBarButton(params)
    button.setImage("Attachment");
    button.setToolTipContent(ZmMsg.insertAttachment);
    button.addSelectionListener(new AjxListener(this, this._insertAttachmentsListener));
    
    tb.setVisible(true);

	this._styleMenu.checkItem(ZmDocsEditor._VALUE, DwtHtmlEditor.PARAGRAPH, true);
	this._justifyMenu.checkItem(ZmDocsEditor._VALUE, DwtHtmlEditor.JUSTIFY_LEFT, true);

};

// @param afterTarget	true: insert link after target, false: replace target with link
ZmDocsEditor.prototype._insertLink = function(link, target, afterTarget) {
	if (typeof link == "string") {
		if (target) {
			var doc = this._getIframeDoc();
			var text = doc.createTextNode(link);
			target.parentNode.replaceChild(text, target);
		}
		else {
			this.insertText(link);
		}
	}
	else {
		Dwt.setHandler(link, DwtEvent.ONCLICK, ZmDocsEditor._handleLinkClick);
		Dwt.associateElementWithObject(link, this);
		if (target) {
			if (afterTarget) {
				target.parentNode.insertBefore(link, target.nextSibling);
			}
			else {
				target.parentNode.replaceChild(link, target);
			}
		}
		else {
			this._insertNodeAtSelection(link);
		}
	}
};

ZmDocsEditor._handleLinkClick = function(event) {
	event = DwtUiEvent.getEvent(event, this);
	var target = DwtUiEvent.getTarget(event);
    //bug:22400
    var curTarget = target;
    if(curTarget.nodeName != 'A') {
        while(curTarget.nodeName != 'A') {
            curTarget = curTarget.parentNode;
            if(curTarget.nodeName == 'A') {
               break;
            }
        }
    }
    //end
    var dialog = Dwt.getObjectFromElement(curTarget);

	var url = curTarget.href;
	var text = target.innerHTML;
	dialog._popupLinkPropsDialog(target, url, text);

	// NOTE: do NOT allow browser to follow link!
	DwtUiEvent.setDhtmlBehaviour(event, true, false);
	return false;
};

ZmDocsEditor.prototype._popupLinkPropsDialog = function(target, url, text) {
	var linkInfo = {
		target: target, url: url, text: text, document: this._getIframeDoc()
	}
	if (!this._insertLinkCallback) {
		this._insertLinkCallback = new AjxCallback(this, this._insertLink);
	}
	var dialog = appCtxt.getLinkPropsDialog();
    dialog.addPopdownListener(new AjxListener(this, this.focus));
	dialog.popup(linkInfo, this._insertLinkCallback);
};

ZmDocsEditor.prototype.insertLinks = function(filenames, files) {
	if (!(files instanceof Array)) {
		files = [files];
	}

	var insertTarget = null;
    var noOfLinks = 0;
	for (var i in files) {
		if (noOfLinks > 0) {
			// Put spaces between each link.
			var space = this._getIframeDoc().createTextNode(" ");
			insertTarget.parentNode.insertBefore(space, insertTarget.nextSibling);
			insertTarget = space;
		}
		var link = this._getIframeDoc().createElement("A");
        var wAppCtxt = window.opener.appCtxt;        
        var folder = wAppCtxt.getById(ZmDocsEditApp.fileInfo.folderId);
        var url = [
            folder.getRestUrl(), "/", AjxStringUtil.urlComponentEncode(files[i].name)
        ].join("");
		link.href = url;
        var filename = decodeURI(files[i].name);
		link.innerHTML = (files[i].linkText)? files[i].linkText : filename;
		this._insertLink(link, insertTarget, true);
		insertTarget = link;
        noOfLinks++;
	}
};

ZmDocsEditor.prototype._insertImages = function(filenames) {
    var url = "";
    if(window.restPage) {
        url = location.href;
        url = url.split("/");
        url.pop();
        url = url.join("/");
    }else {
        var wAppCtxt = window.opener.appCtxt;
        var folder = wAppCtxt.getById(ZmDocsEditApp.fileInfo.folderId);
        url = folder.getRestUrl();
    }

    for (var i = 0; i < filenames.length; i++) {
        if(!filenames[i]) return;
        this.insertImage(url + "/" + AjxStringUtil.urlComponentEncode(filenames[i]));
	}
};

ZmDocsEditor.prototype._insertObjects = function(func, folder, filenames, files) {
	func.call(this, filenames, files);
};

ZmDocsEditor.prototype._insertImagesListener = function(event) {
	this._insertObjectsListener(event, this._insertImages, ZmMsg.insertImage, false);
};

ZmDocsEditor.prototype._insertAttachmentsListener = function(event) {
	this._insertObjectsListener(event, this.insertLinks, ZmMsg.insertAttachment, true);
};

ZmDocsEditor.prototype._insertObjectsListener = function(event, func, title, enableLinkTitle) {
	if (!this._insertObjectsCallback) {
		this._insertObjectsCallback = new AjxCallback(this, this._insertObjects);
	}
	this._insertObjectsCallback.args = [ func ];
	this.__popupUploadDialog(this._insertObjectsCallback, null, enableLinkTitle);
};

ZmDocsEditor.prototype.__popupUploadDialog = function(callback, title, enableLinkTitle) {
	var dialog = appCtxt.getUploadDialog();
    dialog.enableLinkTitleOption(enableLinkTitle);
    dialog.addPopdownListener(new AjxListener(this, this.focus));
	dialog.popup({id:ZmOrganizer.ID_BRIEFCASE}, callback, title);
};

ZmDocsEditor.prototype._rteStateChangeListener =
function(ev) {

	this._boldButton.setSelected(ev.isBold);
	this._underlineButton.setSelected(ev.isUnderline);
	this._italicButton.setSelected(ev.isItalic);
	/*if (this._strikeThruButton) {
		this._strikeThruButton.setSelected(ev.isStrikeThru);
	}
	if (this._subscriptButton) {
		this._subscriptButton.setSelected(ev.isSubscript);
	}
	if (this._superscriptButton) {
		this._superscriptButton.setSelected(ev.isSuperscript);
	}*/
	if (ev.color) {
		this._fontColorButton.setColor(ev.color);
	}
	if (ev.backgroundColor) {
		this._fontBackgroundButton.setColor(ev.backgroundColor);
	}
	if (ev.style) {
		this._styleMenu.checkItem(ZmDocsEditor._VALUE, ev.style, true);
	}

	if (!AjxEnv.isIE) {
		// Bug 20171
		// For reasons not known to humanity, the following code resets the undo stack in IE.
		// It seems to have something to do with modifying the DOM.  The setText() calls use
		// innerHTML, but it's not about innerHTML, since I tried using DOM methods as well
		// to modify the text (createTextNode/removeChild/appendChild).  Nothing works.
		// I therefore disable this code for IE, trusting it's better to have working undo
		// and an un-updated toolbar, rather than the other way around.

		if (ev.fontFamily) {
			var id = ev.fontFamily;
			var name = ZmDocsEditor.FONT_FAMILY[id] && ZmDocsEditor.FONT_FAMILY[id].name;
			name = name || ZmDocsEditor.__makeFontName(id);
			this._fontFamilyButton.setText(name);
		}

		if (ev.fontSize) {
			var mi = this._fontSizeButton.getMenu().getItem(ev.fontSize-1);
			this._fontSizeButton.setText(mi.getText());
		}
	}

	this._justifyMenu.checkItem(ZmDocsEditor._VALUE, ev.justification, true);
};

ZmDocsEditor.prototype._createToolbar = function(toolbarParent) {
    var toolbar = this._toolbar = new DwtToolBar({parent:toolbarParent, className:"ZDEditToolBar", posStyle:DwtControl.RELATIVE_STYLE, cellSpacing:2, index:0});
    var toolbarEl = this._toolbar.getHtmlElement();
    this.getHtmlElement().appendChild(toolbarEl);
    this._initToolBar();
	//this._toolbar.setVisible(false);
	return toolbar;
};

ZmDocsEditor.prototype.__createTableOperationItems =
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

ZmDocsEditor.prototype.__onTableOperationsPopup =
function(menu) {
	this.focus();
	var table = this.getNearestElement("table");
	var items = menu._tblItems;
	for (var i in items) {
		items[i].setEnabled(!!table);
	}
	if (!table) { return; }

	menu.setData("table", table);

	if (!AjxEnv.isIE) {
		// Can we split? (the cell has to be a merged cell)
		var td = this.getNearestElement("td");
		var splitEnabled = td && ((td.colSpan && td.colSpan > 1) || (td.rowSpan && td.rowSpan > 1));
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
					if (td.rowSpan > 1 || td.colSpan > 1) {
						throw "can't merge";
					}
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

ZmDocsEditor.prototype._tableOperationsListener =
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
			break;

		default:
			this.doTableOperation(data, { table: table, cells: this.getSelectedCells() });
	}
};

ZmDocsEditor.prototype._createTableListener =
function(ev) {
	var size = ev.detail;
	this.insertTable(size.rows, size.cols, "90%", null, 3, "center");
};


ZmDocsEditorColorPicker = function(parent,style,className) {
    DwtButtonColorPicker.call(this, parent,style,className);
};
ZmDocsEditorColorPicker.prototype = new DwtButtonColorPicker;
ZmDocsEditorColorPicker.prototype.constructor = ZmDocsEditorColorPicker;

ZmDocsEditorColorPicker.prototype.TEMPLATE = "dwt.Widgets#ZToolbarButton";