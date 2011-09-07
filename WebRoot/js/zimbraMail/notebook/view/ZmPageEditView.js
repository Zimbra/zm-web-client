/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmPageEditView = function(parent, controller) {
	DwtComposite.call(this, {parent:parent, className:"ZmPageEditView", posStyle:DwtControl.ABSOLUTE_STYLE});
	
	this._controller = controller;
	
	this._createHtml();
	this._page = null;
	this._contentHasBeenSet = false;
	this._originalContent = null;
}
ZmPageEditView.prototype = new DwtComposite;
ZmPageEditView.prototype.constructor = ZmPageEditView

ZmPageEditView.prototype.toString =
function() {
	return "ZmPageEditView";
};

// Data

// Message dialog placement
ZmPageEditView.DIALOG_X = 50;
ZmPageEditView.DIALOG_Y = 100;

ZmPageEditView.prototype._controller;

ZmPageEditView.prototype._locationEl;
ZmPageEditView.prototype._pageNameInput;
ZmPageEditView.prototype._pageEditor;
ZmPageEditView.prototype._page;
ZmPageEditView.prototype._isNewPage;
ZmPageEditView.prototype._renameWarningId;


// Public methods

ZmPageEditView.prototype.getController =
function() {
	return this._controller;
};

ZmPageEditView.prototype.clearContents =
function() {
	this._pageNameInput.setValue("");
    this.setContent("");
};

ZmPageEditView.prototype.set =
function(page) {
    this.clearContents();
    this._showPageLoading(true);
	var callback = new AjxCallback(this, this._setResponse, [page]);
	page.getContent(callback);
};
ZmPageEditView.prototype._setResponse = function(page) {
	// set location
	this._pageEditor.setFooterInfo(page);
	
	// set name
	var name = page.name || "";
	this._pageNameInput.setValue(name);
	this._isNewPage =  (page.version == 0);

	// set content
	var content = page.getContent() || "<br>";
	this.setContent(content);
	this._page = page;

	// set focus
    this._showRenameWarning(false);
	this.focus();
};

ZmPageEditView.prototype._onEditorContentInitialized =
function() {
	// Keep a copy of the view's contents, to help determine dirtiness.
	this._contentHasBeenSet = true;
	this._originalContent = this.getContent();
};

ZmPageEditView.prototype.pageSaved =
function(content) {
	this._originalContent = content;
	this._isNewPage = false;	
	this._updateRenameWarning();
};

ZmPageEditView.prototype.getTitle =
function() {
	var pageName = this.getPageName();
	if (!pageName || (pageName.length == 0)) {
		pageName = ZmMsg.newPage;
	}
	return [ZmMsg.zimbraTitle, pageName].join(": ");
};

ZmPageEditView.prototype.getPageName =
function() {
	return this._pageNameInput.getValue();
};

ZmPageEditView.prototype.setFormat = function(format) {
	this._pageEditor.setFormat(format);
};
ZmPageEditView.prototype.getFormat = function() {
	return this._pageEditor.getFormat();
};

ZmPageEditView.prototype.setContent = function(content) {
	this._pageEditor.setContent(content);
};
ZmPageEditView.prototype.getContent =
function() {
	return this._pageEditor.getContent();
};

ZmPageEditView.prototype.getPageEditor = function() {
	return this._pageEditor;
};

ZmPageEditView.prototype.getSelection =
function() {
	return this._controller.getPage();
};


ZmPageEditView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmPageEditView.prototype.addActionListener = function(listener) { /*TODO*/ };

ZmPageEditView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);

	var size = Dwt.getSize(this._inputEl);
	this._pageEditor.setSize(width, height - size.y - 23);
};

ZmPageEditView.prototype.focus = function() {
	var name = this._pageNameInput.getValue();
	var focusedComp = name == "" ? this._pageNameInput : this._pageEditor;
	focusedComp.focus();
};

ZmPageEditView.prototype.isDirty =
function() {
	if (this._page) {
		var pageName = this.getPageName();
		var content = this.getContent();
		if ((this._page.name || '') != pageName) {
			return true;
		}
		if (this._contentHasBeenSet && (this._originalContent != content)) {
			return true;
		}
	}
	return false;
};

// Protected methods

ZmPageEditView.prototype._createHtml =
function() {
	this._renameWarningId = Dwt.getNextId();
	
	// create components
	this._pageNameInput = new DwtInputField({parent:this});
	this._pageNameInput.setRequired(true);
	this._pageNameInput.setValidatorFunction(null, ZmPageEditView._validatePageName);
	var titleInputEl = this._pageNameInput.getInputElement();
	titleInputEl.size = 50;
	Dwt.setHandler(titleInputEl, DwtEvent.ONCHANGE, ZmPageEditView._onNameChange);
	Dwt.setHandler(titleInputEl, DwtEvent.ONKEYPRESS, ZmPageEditView._onNameChange);

	this._pageEditor = new ZmPageEditor(this, null, null, DwtHtmlEditor.HTML, this._controller);
	// HACK: Notes are always HTML format, regardless of the COS setting.
	this._pageEditor.isHtmlEditingSupported = new Function("return true");
	var textAreaEl = this._pageEditor.getHtmlElement();
	textAreaEl.style.width = "100%";
	textAreaEl.style.height = "100%";

	// build html
	this._inputEl = document.createElement("TABLE");
	var table = this._inputEl;
	table.cellSpacing = 0;
	table.cellPadding = 3;
	table.width = "100%";

	var row = table.insertRow(-1);
	var labelCell = row.insertCell(-1);
	labelCell.width = "1%";
    labelCell.style.whiteSpace = 'nowrap';
    labelCell.className = "Label";
	labelCell.innerHTML = ZmMsg.pageLabel;
	var inputCell = row.insertCell(-1);
	inputCell.width = "1%";
	inputCell.appendChild(this._pageNameInput.getHtmlElement());

	var warningCell = row.insertCell(-1);
	var warningDiv = document.createElement("DIV");
	warningCell.appendChild(warningDiv);
	warningDiv.id = this._renameWarningId;
	Dwt.setVisible(warningDiv, false);
	warningDiv.className = "RenameWarning";
	warningDiv.innerHTML = "<table><tr><td>" + AjxImg.getImageHtml("Warning") + "</td><td>" + ZmMsg.wikiChangeNameWarning + "</td></tr></table>";
	
	var element = this.getHtmlElement();
	element.appendChild(table);
	element.appendChild(textAreaEl);
};

ZmPageEditView._validatePageName =
function(name) {
    if(name !== ""){
        this.setValue(unescape(name),true);
    }    
	if (name == "") {
		throw AjxMsg.valueIsRequired;
	} else if (!ZmOrganizer.VALID_NAME_RE.test(name)) {
		throw AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(name));
	}
};

ZmPageEditView._onNameChange =
function(ev) {
    var control = DwtControl.getTargetControl(ev);
    while (control) {
    	if (control instanceof ZmPageEditView) {
    		// Update the warning text on a timer, after the keyboard event has 
    		// changed the value of the input field.
			var action = new AjxTimedAction(control, control._updateRenameWarning);
			AjxTimedAction.scheduleAction(action, 0);
    		break;
    	}
    	control = control.parent;
    }
};

ZmPageEditView.prototype._updateRenameWarning =
function(show) {
    if (!this._isNewPage) {
    	var name = this.getPageName();
    	var pageName = this._page.name;
	    this._showRenameWarning(name != pageName);
    }
};

ZmPageEditView.prototype._showRenameWarning =
function(show) {
	var element = document.getElementById(this._renameWarningId);
    if(element){
        element.innerHTML = "<table><tr><td>" + AjxImg.getImageHtml("Warning") + "</td><td>" + ZmMsg.wikiChangeNameWarning + "</td></tr></table>";
    }
	Dwt.setVisible(element, show);
};

ZmPageEditView.prototype._showPageLoading =
function(show) {
	var element = document.getElementById(this._renameWarningId);
    if(element){
        element.innerHTML = "<table><tr><td>" + AjxImg.getImageHtml("Information") + "</td><td>" + ZmMsg.loading + "</td></tr></table>";
    }
	Dwt.setVisible(element, show);
};

ZmPageEditView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmPageEditView.DIALOG_X, loc.y + ZmPageEditView.DIALOG_Y);
};

//
// ZmPageEditor class
//

ZmPageEditor = function(parent, posStyle, content, mode, controller) {
	if (arguments.length == 0) return;
	ZmHtmlEditor.call(this, parent, posStyle, content, mode, true /* enable ace */);
	this._controller = controller;
}
ZmPageEditor.prototype = new ZmHtmlEditor;
ZmPageEditor.prototype.constructor = ZmPageEditor;

ZmPageEditor.prototype.toString = function() {
	return "ZmPageEditor";
};

// Constants

ZmPageEditor.KEY_FORMAT = "format";

ZmPageEditor.HTML_SOURCE = "htmlsrc";
ZmPageEditor.MEDIA_WIKI = "mediawiki";
ZmPageEditor.RICH_TEXT = "richtext";
ZmPageEditor.TWIKI = "twiki";
ZmPageEditor.DEFAULT = ZmPageEditor.RICH_TEXT;

ZmPageEditor._MODES = {};
ZmPageEditor._MODES[ZmPageEditor.HTML_SOURCE] = DwtHtmlEditor.TEXT;
ZmPageEditor._MODES[ZmPageEditor.MEDIA_WIKI] = DwtHtmlEditor.TEXT;
ZmPageEditor._MODES[ZmPageEditor.RICH_TEXT] = DwtHtmlEditor.HTML;
ZmPageEditor._MODES[ZmPageEditor.TWIKI] = DwtHtmlEditor.TEXT;

ZmPageEditor._CONVERTERS = {};
ZmPageEditor._CONVERTERS[ZmPageEditor.MEDIA_WIKI] = new MediaWikiConverter();
ZmPageEditor._CONVERTERS[ZmPageEditor.TWIKI] = new TWikiConverter();

// Data

ZmPageEditor.prototype._format = ZmPageEditor.DEFAULT;

// Public methods

ZmPageEditor.prototype.setFormat = function(format) {
	this._format = format;
	this.setMode(ZmPageEditor._MODES[format]);
};
ZmPageEditor.prototype.getFormat = function() {
	return this._format;
};

ZmPageEditor.prototype.setMode = function(mode) {
	if (mode != this._mode) {
		ZmHtmlEditor.prototype.setMode.call(this, mode);
		this.setSize(this._oldW, this._oldH);
	}
};

ZmPageEditor.prototype.setSize = function(w, h) {
	// NOTE: We need to save our explicitly-set size so that we can
	//       resize the control properly when the mode is changed.
	//       Querying the size later returns the wrong values for
	//       some reason. REVISIT!
	this._oldW = w;
	this._oldH = h;
	ZmHtmlEditor.prototype.setSize.apply(this, arguments);
};

ZmPageEditor.prototype.setContent = function(content) {
	var converter = ZmPageEditor._CONVERTERS[this._format];
	if (converter) {
		content = converter.toWiki(content);
	}
	ZmHtmlEditor.prototype.setContent.call(this, content);
	if (this._mode == DwtHtmlEditor.HTML) {
		var root = this._getIframeDoc();
		this._deserializeWiklets(root);
		this._patchLinks(root);
	}
};
ZmPageEditor.prototype.getContent = function(insertFontStyle) {
	if (this._mode == DwtHtmlEditor.HTML) {
		this._serializeWiklets();
	}
	var content = ZmHtmlEditor.prototype.getContent.call(this, insertFontStyle);
	var converter = ZmPageEditor._CONVERTERS[this._format];
	if (converter) {
		content = converter.toHtml(content);
	}
	return content;
};

// Protected methods

ZmPageEditor.prototype._patchLinks = function(element) {
	var links = element.getElementsByTagName("A");
	for (var i = 0; i < links.length; i++) {
		var link = links[i];
		if (!link.href) continue;
		Dwt.associateElementWithObject(link, this);
		if (AjxEnv.isIE) {
			Dwt.setHandler(link, DwtEvent.ONCLICK, ZmPageEditor._handleLinkClick);
		}
		else {
			link.addEventListener("click", ZmPageEditor._handleLinkClick, true);
		}
	}
};

ZmPageEditor.prototype._serializeWiklets = function() {
	var elems = this._getIframeDoc().getElementsByTagName("BUTTON");
	// NOTE: We go backwards because the collection is "live"
	for (var i = elems.length - 1; i >= 0; i--) {
		var elem = elems[i];
		var name = elem.getAttribute("wikname");
		var wiklet = ZmWiklet.getWikletByName(name);

		var wikletEl = document.createElement("WIKLET");
		wikletEl.setAttribute("class", name);
		var attrs = elem.attributes;
        for (var j = 0; j < attrs.length; j++) {
            var attr = attrs[j];
			var aname = attr.nodeName;
			if (!aname.match(/^wikparam_/)) continue;

			var avalue = attr.nodeValue.replace(/"/g,"");
			if (avalue == "") continue;

			wikletEl.setAttribute(aname.substr(9), avalue);
  		}

		var text = document.createTextNode(name);
		wikletEl.appendChild(text);
		elem.parentNode.replaceChild(wikletEl, elem);
	}
};

ZmPageEditor.prototype._deserializeWiklets = function(node) {
	var wikletEls = node.getElementsByTagName("WIKLET");
	for (var i = wikletEls.length - 1; i >= 0; i--) {
		var wikletEl = wikletEls[i];
		var wiklet = ZmWiklet.getWikletByName(wikletEl.className);
		if (!wiklet) continue;

		var value = [];
		var params = {};
		for (var j = wikletEl.attributes.length - 1; j >= 0; j--) {
			var attr = wikletEl.attributes[j];
			var aname = attr.nodeName;
			var avalue = attr.nodeValue;

			value.push(aname,"=\"",avalue.replace(/"/g,"&quot;"),"\" ");
			params[aname] = avalue;
		}

		var button = this._createWikletButton(wiklet, value, params);
		wikletEl.parentNode.replaceChild(button, wikletEl);
	}
};

ZmPageEditor.prototype._createWikletButton = function(wiklet, value, params) {
	var button = document.createElement("BUTTON");
	button.setAttribute("wikname", wiklet.name);
	button.innerHTML = wiklet.label || wiklet.name;
	if (wiklet.paramdefs) {
		button.title = ZmMsg.wikletConfigureParams;
		if (params) {
			for (var pname in params) {
				button.setAttribute("wikparam_"+pname, params[pname] || "");
			}
		}
		else {
			for (var pname in wiklet.paramdefs) {
				button.setAttribute("wikparam_"+pname, wiklet.paramdefs[pname].value || "");
			}
		}
	}
	else {
		button.title = ZmMsg.wikletConfigureNone;
		//button.disabled = true;
	}
	button.onclick = ZmPageEditor._wikletButtonHandler;
	return button;
};

ZmPageEditor.prototype._embedHtmlContent =
function(html) {
	return html;
};

ZmPageEditor.prototype._createToolbars = function() {
	// notebook page editor will have two separate toolbars
	var tbParams = {parent:this, className:"ZToolbar", posStyle:DwtControl.RELATIVE_STYLE, cellSpacing:2};
	if (!this._toolbar1) {
		var tb = this._toolbar1 = new DwtToolBar(tbParams);
		tb.setVisible(this._mode == DwtHtmlEditor.HTML);
		this._createToolBar1(tb);
		this._toolbars.push(tb);
	}
	if (!this._toolbar2) {
		var tb = this._toolbar2 = new DwtToolBar(tbParams);
		tb.setVisible(this._mode == DwtHtmlEditor.HTML);

		// add extra buttons here
		var params = {parent:tb, style:DwtButton.TOGGLE_STYLE};
		var listener = new AjxListener(this, this._fontStyleListener);
		b = this._strikeThruButton = new DwtToolBarButton(params);
		b.setImage("StrikeThru");
		b.setToolTipContent(ZmMsg.strikeThruText);
		b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.STRIKETHRU_STYLE);
		b.addSelectionListener(listener);

		b = this._superscriptButton = new DwtToolBarButton(params);
		b.setImage("SuperScript");
		b.setToolTipContent(ZmMsg.superscript);
		b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.SUPERSCRIPT_STYLE);
		b.addSelectionListener(listener);

		b = this._subscriptButton = new DwtToolBarButton(params);
		b.setImage("Subscript");
		b.setToolTipContent(ZmMsg.subscript);
		b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.SUBSCRIPT_STYLE);
		b.addSelectionListener(listener);

		new DwtControl({parent:tb, className:"vertSep"});

		this._createToolBar2(tb);
		this._toolbars.push(tb);
	}
	/*** TODO: Add this back later...
	if (!this._wikiToolBar) {
		this._createWikiToolBar(this);
	}
	/***/
};

ZmPageEditor.prototype._createToolBar2 = function(parent) {
	ZmHtmlEditor.prototype._createToolBar2.call(this, parent);

	var params = {parent:this._toolbar2};
	var button = new DwtToolBarButton(params)
	button.setImage("ImageDoc");
	button.setToolTipContent(ZmMsg.insertImage);
	button.addSelectionListener(new AjxListener(this, this._insertImagesListener));

	button = new DwtToolBarButton(params)
	button.setImage("Attachment");
	button.setToolTipContent(ZmMsg.insertAttachment);
	button.addSelectionListener(new AjxListener(this, this._insertAttachmentsListener));

	/*button = new DwtToolBarButton(params);
	button.setImage("URL");
	button.setToolTipContent(ZmMsg.insertLink);
	button.addSelectionListener(new AjxListener(this, this._insertLinkListener)); */
	
	button = new DwtToolBarButton(params);
	button.setImage("FindReplace");
	button.setToolTipContent(ZmMsg.findNReplaceTitle);
	button.addSelectionListener(new AjxListener(this, this._findReplaceListener));
	

	button = new DwtToolBarButton(params);
	button.setImage("CamelCase");
	button.setToolTipContent(ZmMsg.convertCamelCase);
	button.addSelectionListener(new AjxListener(this, this._convertCamelCaseListener));

};

/*** TODO: Add this back later...
ZmPageEditor.prototype._createWikiToolBar = function(parent) {
	var toolbar = this._wikiToolBar = new ZmToolBar({parent:this, className:"ZToolbar", posStyle:DwtControl.RELATIVE_STYLE});
	toolbar.setVisible(this._mode == DwtHtmlEditor.HTML);
	
	var listener = new AjxListener(this, this._wikiToolBarListener);
	
	var wiklets = ZmWiklet.getWiklets();
	for (var name in wiklets) {
		var wiklet = wiklets[name];
		var button = new DwtButton({parent:toolbar, className:"DwtToolbarButton"});
		button.setText(wiklet.label || name);
		button.setToolTipContent(wiklet.tooltip);
		button.setData("wiklet", name);
		button.addSelectionListener(listener);
	}
	
	this._toolbars.push(toolbar);
};
/***/

ZmPageEditor.prototype.insertLinks = function(filenames) {
	if (!(filenames instanceof Array)) {
		filenames = [filenames];
	}
	
	if (!filenames.length)
		return;

	var insertTarget = null;
	for (var i = 0; i < filenames.length; i++) {
		if (i > 0) {
			// Put spaces between each link.
			var space = this._getIframeDoc().createTextNode(" ");
			insertTarget.parentNode.insertBefore(space, insertTarget.nextSibling);
			insertTarget = space;
		}
		var link = this._getIframeDoc().createElement("A");
        var page = this._controller.getPage();
        var notebook = appCtxt.getById(page.folderId);
        var url = [
            notebook.getRestUrl(), "/", AjxStringUtil.urlComponentEncode(filenames[i])
        ].join("");
		link.href = url;
		link.innerHTML = decodeURI(filenames[i]);
		this._insertLink(link, insertTarget, true);
		insertTarget = link;
	}
};

ZmPageEditor.prototype._insertImages = function(filenames) {
	for (var i = 0; i < filenames.length; i++) {
        var page = this._controller.getPage();
        var notebook = appCtxt.getById(page.folderId);
        var url = [
            notebook.getRestUrl(), "/", AjxStringUtil.urlComponentEncode(filenames[i])
        ].join("");
		this.insertImage(url);
	}
};

ZmPageEditor.prototype._insertImagesListener = function(event) {
	this._insertObjectsListener(event, this._insertImages, ZmMsg.insertImage);
};

ZmPageEditor.prototype._insertAttachmentsListener = function(event) {
	this._insertObjectsListener(event, this.insertLinks, ZmMsg.insertAttachment);
};

ZmPageEditor.prototype._insertObjectsListener = function(event, func, title) {
	if (!this._insertObjectsCallback) {
		this._insertObjectsCallback = new AjxCallback(this, this._insertObjects);
	}
	this._insertObjectsCallback.args = [ func ];
	this.__popupUploadDialog(this._insertObjectsCallback);
};

ZmPageEditor.prototype.__popupUploadDialog = function(callback, title) {
	var page = this._controller.getPage();
	var notebook = appCtxt.getById(page.folderId);

	var dialog = appCtxt.getUploadDialog();
    dialog.addPopdownListener(new AjxListener(this, this.focus));
	dialog.popup(notebook, callback, title);
};

ZmPageEditor.prototype._insertObjects = function(func, folder, filenames) {
	func.call(this, filenames);
};

ZmPageEditor.prototype._fontStyleListener =
function(ev) {
	ZmHtmlEditor.prototype._fontStyleListener.call(this, ev);

	// bug fix 9216 - toggle subscript/superscript if other is already enabled
	if (ev.item == this._superscriptButton && this._subscriptButton.isToggled()) {
		this.setFont(null, DwtHtmlEditor.SUBSCRIPT_STYLE);
	}
	else if (ev.item == this._subscriptButton && this._superscriptButton.isToggled()) {
		this.setFont(null, DwtHtmlEditor.SUPERSCRIPT_STYLE);
	}
};

ZmPageEditor.prototype._insertLinkListener = function(event) {
	var text = this._getSelectedText();
	var target = null;
	var url = null;
	var el = this._getParentElement();
	if (el && /^a$/i.test(el.tagName)){
		target = el;
		url = el.href;	
		text = el.innerHTML;
	}
	this._popupLinkPropsDialog(target,url,text);
};

// @param afterTarget	true: insert link after target, false: replace target with link
ZmPageEditor.prototype._insertLink = function(link, target, afterTarget) {
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
		Dwt.setHandler(link, DwtEvent.ONCLICK, ZmPageEditor._handleLinkClick);
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

ZmPageEditor._handleLinkClick = function(event) {
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

ZmPageEditor.prototype._popupLinkPropsDialog = function(target, url, text) {
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

ZmPageEditor.prototype._wikiToolBarListener = function(event) {
	var name = event.item.getData("wiklet");
	var wiklet = ZmWiklet.getWikletByName(name);
	var button = this._createWikletButton(wiklet);

	this.focus();
	this._insertNodeAtSelection(button);

	ZmPageEditor._wikletPressButton(button);
};

ZmPageEditor._wikletButtonHandler = function(event) {
	var button = DwtUiEvent.getTarget(event);
	ZmPageEditor._wikletPressButton(button);
};

ZmPageEditor._wikletPressButton = function(button) {
	var name = button.getAttribute("wikname");
	var wiklet = ZmWiklet.getWikletByName(name);
	if (!wiklet) return;
	
	var schema = [];
	for (var pname in wiklet.paramdefs) {
		var attr = button.attributes[pname];
		var proxy = AjxUtil.createProxy(wiklet.paramdefs[pname]);
		proxy.value = attr ? attr.nodeValue : (proxy.value || "");
		schema.push(proxy);
	}
	if (schema.length == 0) {
		return;
	}
	
	var shell = DwtShell.getShell(window);
	var dialog = new ZmDialog({parent:shell, title:ZmMsg.wikletParams});
	var propEditor = new DwtPropertyEditor(dialog);
	propEditor.initProperties(schema);
	dialog.setView(propEditor);

	var args = [dialog, propEditor, button, schema];
	var listener = new AjxListener(null, ZmPageEditor._wikletParamListener, args);
	dialog.setButtonListener(DwtDialog.OK_BUTTON, listener);
	dialog.popup();

	return false;
};

ZmPageEditor._wikletParamListener = 
function(dialog, editor, wikletEl, schema) {
	var props = editor.getProperties();
	for (var pname in props) {
		var aname = pname;
		var avalue = props[pname];
		if (avalue === "") {
			wikletEl.removeAttribute("wikparam_"+aname);
		}
		else {
			wikletEl.setAttribute("wikparam_"+aname, avalue);
		}
	}
	dialog.popdown();
};

// This is called after the editor really has set its contents, which
// is done after a series of timed events.
ZmPageEditor.prototype._onContentInitialized =
function() {
	ZmHtmlEditor.prototype._onContentInitialized.call(this); // otherwise ALE objects won't be deserialized
	this.parent._onEditorContentInitialized();	
	this._resetFormatControls();
	var action = new AjxTimedAction(this, this.focus);
	AjxTimedAction.scheduleAction(action, DwtHtmlEditor._INITDELAY + 5);
};

ZmPageEditor.prototype._findReplaceListener =
function(){	
	this.focus();	
	var sel_findnreplace = this._getSelection();
	this.range_findnreplace = this._createRange(sel_findnreplace);
	this._popupReplaceDialog();				
};

ZmPageEditor.prototype._popupReplaceDialog = function(target, url, text) {
	var editorInfo = {
		document: this._getIframeDoc(),editor: this
	}
	var dialog = appCtxt.getReplaceDialog();
	dialog.popup(editorInfo);
};

ZmPageEditor.prototype._initialize =
function() {
	ZmHtmlEditor.prototype._initialize.call(this);
	this.addFooter();
};

ZmPageEditor.prototype.addFooter = 
function() {	
	var el = this.getHtmlElement();
	var div = this._footerEl = document.createElement("div");
	var locationId = Dwt.getNextId(); 
	var versionId = Dwt.getNextId();
	var authorId = Dwt.getNextId();
	var modifiedId = Dwt.getNextId();
	var footer = [
			'<table cellpadding="0" cellspacing="0" class="ZmHtmlEditorFooter">',
			'<tr>',
			'<td>',ZmMsg.locationLabel,' <span id="',locationId,'"></span></td>',
			'<td>',ZmMsg.versionLabel,' <span id="',versionId,'"></span></td>',
			'<td>',ZmMsg.authorLabel,' <span id="',authorId,'"></span></td>',
			'<td>',ZmMsg.modifiedOnLabel,' <span id="',modifiedId,'"></span></td>',			
			'</tr>',
			'</table>'		
	];
	
	div.innerHTML = footer.join("");
	el.appendChild(div);
	this._locationEl = document.getElementById(locationId);
	this._versionEl = document.getElementById(versionId);
	this._authorEl = document.getElementById(authorId);
	this._modifiedEl = document.getElementById(modifiedId);
	
};

ZmPageEditor.prototype.setFooterInfo = 
function(page){
	
	var content;
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if (page.folderId == rootId) {
		content = appCtxt.getById(page.folderId).name;
	}else {
		var separator = "&nbsp;&raquo;&nbsp;";
		var a = [ ];
		var folderId = page.folderId;
		while ((folderId != null) && (folderId != rootId)) {
			var notebook = appCtxt.getById(folderId);

            if(!(notebook instanceof ZmNotebook)) {
                break;
            }
            a.unshift(notebook.name);

            if(!notebook.parent) {
                break;
            }

            folderId = notebook.parent.id;
			if (folderId != rootId) {
				a.unshift(separator);
			}

        }
		content = a.join("");
	}

	this._locationEl.innerHTML = content;
	this._versionEl.innerHTML = (page.version ? page.version : "");
	this._authorEl.innerHTML = (page.creator ? page.creator : "");
	this._modifiedEl.innerHTML = (page.createDate ? ZmWiklet._formatDate({type:"shortdateandtime"},page.createDate) : "");	
};

ZmPageEditor.prototype._initTextMode =
function(ignorePendingContent) {
	var htmlEl = this.getHtmlElement();
	this._textAreaId = "textarea_" + Dwt.getNextId();
	var textArea = document.createElement("textarea");
	textArea.className = "DwtHtmlEditorTextArea";
	textArea.id = this._textAreaId;
	
	if(this._footerEl){
		this._footerEl.parentNode.insertBefore(textArea,this._footerEl);
	}else{
		htmlEl.appendChild(textArea);
	}
	// We will ignore pending content if we are called from setMode. See setMode for
	// documentation
	if (!ignorePendingContent) {
		textArea.value = this._pendingContent;
		this._pendingContent = null;
	}
	return textArea;
};

ZmPageEditor.prototype._handleEditorEvent = 
function(ev) {
	var	retVal = ZmHtmlEditor.prototype._handleEditorEvent.call(this, ev);

	if (DwtKeyEvent.isKeyPressEvent(ev)) {
		var ke = this._keyEvent;
		ke.setFromDhtmlEvent(ev);
		if (ke.ctrlKey) {
			var key = String.fromCharCode(ke.charCode).toLowerCase();
			var value = null;

			switch (key) {

				case 's':
					this._controller._doSave(false);
					ke._stopPropagation = true;
					ke._returnValue = false;
					ke.setToDhtmlEvent(ev);
					retVal = false;
					break;
			}
		}
		}
		
		return retVal;
};



ZmPageEditor.WIKIWORD_RE = /[A-Z]+[a-z]+[A-Z]+[a-zA-Z0-9]*/;
ZmPageEditor.LITERAL_RE = /[^\]\|]+?/; // REVISIT: escaped ']'

ZmPageEditor.WIKI_LINK_RE =  /(^\[\[|\]\]$)/;

ZmPageEditor.TWIKI_KEYWORD_RE = new RegExp(
	"\\b(" + ZmPageEditor.WIKIWORD_RE.source + ")\\b" +
	"|" +
	"(?:\\[" +
		"\\[(" + ZmPageEditor.LITERAL_RE.source + ")\\]" +
		"(?:\\[(" + ZmPageEditor.LITERAL_RE.source + ")\\])?" +
	"\\])",
	"g"
);

ZmPageEditor.prototype._convertCamelCaseListener = 
function () {	
	var dlg = this._warningDlg = appCtxt.getYesNoMsgDialog();
	dlg.reset();
	dlg.setMessage(ZmMsg.convertCamelCaseMsg, DwtMessageDialog.WARNING_STYLE);
	dlg.registerCallback(DwtDialog.YES_BUTTON, this._camelcaseYesCallback, this);
	dlg.popup();
};

ZmPageEditor.prototype._camelcaseYesCallback = 
function() {
	this._warningDlg.popdown();
	var doc = this._getIframeDoc();
	if(doc && doc.body) {
		this._convertCamelCaseToLink(doc.body);
	}	
};

ZmPageEditor.prototype._convertCamelCaseToLink =
function(node) {
	
	if(!node) { return; }	
	var doc = node.ownerDocument;	

	var tmp, i, val;
	switch (node.nodeType) {
	    case 1:	// ELEMENT_NODE
		var child = node.firstChild;
		while (child) {
			child = this._convertCamelCaseToLink(child);
		}
		return node.nextSibling;

	    case 3:	// TEXT_NODE
	    case 4:	// CDATA_SECTION_NODE (just in case)
				var str = node.data;
				var m;
				var replaceTextNode = false;
				DBG.println("node.data:"+str);
				ZmPageEditor.TWIKI_KEYWORD_RE.lastIndex = 0;
				while(m = ZmPageEditor.TWIKI_KEYWORD_RE.exec(str)) {			
					var firstMatch = m[0];
					if(firstMatch && !firstMatch.match(ZmPageEditor.WIKI_LINK_RE)) {
						str = this._replaceCamelCaseWord(str, firstMatch, ZmPageEditor.TWIKI_KEYWORD_RE.lastIndex);							
						replaceTextNode = true;
					}					
				}
								
				if(replaceTextNode) {
						var nextSibling = node.nextSibling;
						this._replaceTextNode(node, doc.createTextNode(str));
						return nextSibling;
				}				
		}

		return node.nextSibling;
};

ZmPageEditor.prototype._replaceCamelCaseWord =
function(str, firstMatch, lastIndex) {
	var beginStr = str.substring(0, lastIndex - firstMatch.length);	
	var endStr = str.substring(lastIndex - firstMatch.length);
	if(beginStr!=null && endStr!=null) {
		str = beginStr + endStr.replace(firstMatch, "[["+firstMatch+"]]");
	}	
	return str;	
};

ZmPageEditor.prototype._replaceTextNode =
function(node, newNode) {
	var doc = node.ownerDocument;
	var nextSibling = node.nextSibling;
	var parentNode = node.parentNode;
	parentNode.removeChild(node);
	if(nextSibling) {
		parentNode.insertBefore(newNode, nextSibling);
	}else {
		parentNode.appendChild(newNode);
	}
};

