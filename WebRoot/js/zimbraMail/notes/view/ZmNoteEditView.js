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

function ZmNoteEditView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmNoteEditView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;
	
	this._createHtml();
}
ZmNoteEditView.prototype = new DwtComposite;
ZmNoteEditView.prototype.constructor = ZmNoteEditView

ZmNoteEditView.prototype.toString =
function() {
	return "ZmNoteView";
};

// Data

ZmNoteEditView.prototype._appCtxt;
ZmNoteEditView.prototype._controller;

ZmNoteEditView.prototype._locationEl;
ZmNoteEditView.prototype._pageNameInput;
ZmNoteEditView.prototype._pageEditor;

// Public methods

ZmNoteEditView.prototype.getController =
function() {
	return this._controller;
};

ZmNoteEditView.prototype.set =
function(note) {
	var callback = new AjxCallback(this, this._setResponse, [note]);
	note.getContent(callback);
};
ZmNoteEditView.prototype._setResponse = function(note) {
	var content = "{{BREADCRUMBS format='template'}}";
	content = ZmWikletProcessor.process(this._appCtxt, note, content);
	this._locationEl.innerHTML = content;

	var name = note.name || "";
	this._pageNameInput.setValue(name);
	this._pageNameInput.disabled(name != "");

	var content = note.getContent();
	this.setContent(content);
	
	/***	
	var focusedComp = name == "" ? this._pageNameInput : this._pageEditor;
	focusedComp.focus();
	/***/
	this.focus();
	/***/
};

ZmNoteEditView.prototype.getTitle =
function() {
	return this._pageNameInput.getValue();
};

ZmNoteEditView.prototype.setFormat = function(format) {
	this._pageEditor.setFormat(format);
};
ZmNoteEditView.prototype.getFormat = function() {
	return this._pageEditor.getFormat();
};

ZmNoteEditView.prototype.setContent = function(content) {
	this._pageEditor.setContent(content);
};
ZmNoteEditView.prototype.getContent =
function() {
	return this._pageEditor.getContent();
};

ZmNoteEditView.prototype.getSelection =
function() {
	return this._controller.getNote();
};


ZmNoteEditView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNoteEditView.prototype.addActionListener = function(listener) { /*TODO*/ };

ZmNoteEditView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);

	var size = Dwt.getSize(this._inputEl);
	this._pageEditor.setSize(width, height - size.y);
};

ZmNoteEditView.prototype.focus = function() {
	var name = this._pageNameInput.getValue();
	var focusedComp = name == "" ? this._pageNameInput : this._pageEditor;
	focusedComp.focus();
};

// Protected methods

ZmNoteEditView.prototype._createHtml =
function() {
	// create components
	this._pageNameInput = new DwtInputField({parent:this});
	this._pageNameInput.setRequired(true);
	var titleInputEl = this._pageNameInput.getInputElement();
	titleInputEl.size = 50;
		
	this._pageEditor = new ZmNoteEditor(this, null, null, DwtHtmlEditor.HTML, this._appCtxt, this._controller);
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
	labelCell.className = "Label";
	labelCell.innerHTML = ZmMsg.locationLabel;
	this._locationEl = row.insertCell(-1);
	
	var row = table.insertRow(-1);
	var labelCell = row.insertCell(-1);
	labelCell.width = "1%";
	labelCell.className = "Label";
	labelCell.innerHTML = ZmMsg.pageLabel;
	var inputCell = row.insertCell(-1);
	inputCell.appendChild(this._pageNameInput.getHtmlElement());
	
	var element = this.getHtmlElement();
	element.appendChild(table);
	element.appendChild(textAreaEl);
};

//
// ZmNoteEditor class
//

function ZmNoteEditor(parent, posStyle, content, mode, appCtxt, controller) {
	if (arguments.length == 0) return;
	ZmHtmlEditor.call(this, parent, posStyle, content, mode, appCtxt)
	this._controller = controller;
}
ZmNoteEditor.prototype = new ZmHtmlEditor;
ZmNoteEditor.prototype.constructor = ZmNoteEditor;

ZmNoteEditor.prototype.toString = function() {
	return "ZmNoteEditor";
};

// Constants

ZmNoteEditor.KEY_FORMAT = "format";

ZmNoteEditor.HTML_SOURCE = "htmlsrc";
ZmNoteEditor.MEDIA_WIKI = "mediawiki";
ZmNoteEditor.RICH_TEXT = "richtext";
ZmNoteEditor.TWIKI = "twiki";

ZmNoteEditor.DEFAULT = ZmNoteEditor.RICH_TEXT;

ZmNoteEditor._MODES = {};
ZmNoteEditor._MODES[ZmNoteEditor.HTML_SOURCE] = DwtHtmlEditor.TEXT;
ZmNoteEditor._MODES[ZmNoteEditor.MEDIA_WIKI] = DwtHtmlEditor.TEXT;
ZmNoteEditor._MODES[ZmNoteEditor.RICH_TEXT] = DwtHtmlEditor.HTML;
ZmNoteEditor._MODES[ZmNoteEditor.TWIKI] = DwtHtmlEditor.TEXT;

ZmNoteEditor._CONVERTERS = {};
ZmNoteEditor._CONVERTERS[ZmNoteEditor.MEDIA_WIKI] = new MediaWikiConverter();
ZmNoteEditor._CONVERTERS[ZmNoteEditor.TWIKI] = new TWikiConverter();

// Data

ZmNoteEditor.prototype._format = ZmNoteEditor.DEFAULT;

// Public methods

ZmNoteEditor.prototype.setFormat = function(format) {
	this._format = format;
	this.setMode(ZmNoteEditor._MODES[format]);
};
ZmNoteEditor.prototype.getFormat = function() {
	return this._format;
};

ZmNoteEditor.prototype.setMode = function(mode) {
	if (mode != this._mode) {
		ZmHtmlEditor.prototype.setMode.call(this, mode);
		this.setSize(this._oldW, this._oldH);
	}
};

ZmNoteEditor.prototype.setSize = function(w, h) {
	// NOTE: We need to save our explicitly-set size so that we can
	//       resize the control properly when the mode is changed.
	//       Querying the size later returns the wrong values for
	//       some reason. REVISIT!
	this._oldW = w;
	this._oldH = h;
	ZmHtmlEditor.prototype.setSize.apply(this, arguments);
};

ZmNoteEditor.prototype.setContent = function(content) {
	var converter = ZmNoteEditor._CONVERTERS[this._format];
	if (converter) {
		content = converter.toWiki(content);
	}
	ZmHtmlEditor.prototype.setContent.call(this, content);
	if (this._mode == DwtHtmlEditor.HTML) {
		var root = this._getIframeDoc();
		this._deserializeWiklets(root);
	}
};
ZmNoteEditor.prototype.getContent = function() {
	if (this._mode == DwtHtmlEditor.HTML) {
		this._serializeWiklets();
	}
	var content = ZmHtmlEditor.prototype.getContent.call(this);
	var converter = ZmNoteEditor._CONVERTERS[this._format];
	if (converter) {
		content = converter.toHtml(content);
	}
	return content;
};

// Protected methods

ZmNoteEditor.prototype._serializeWiklets = function() {
	var elems = this._getIframeDoc().getElementsByTagName("INPUT");
	// NOTE: We go backwards because the collection is "live"
	for (var i = elems.length - 1; i >= 0; i--) {
		var elem = elems[i];
		var name = elem.getAttribute("wikname");
		var wiklet = ZmWiklet.getWikletByName(name);

		var a = [ "{{", name ];
		if (wiklet.type == ZmWiklet.SINGLE_VALUE) {
			a.push(" ", elem.getAttribute("wikparam_value"));
		}
		else if (wiklet.type == ZmWiklet.PARAMETERIZED) {
			var attrs = elem.attributes;
			for (var j = 0; j < attrs.length; j++) {
				var attr = attrs[j];
				if (attr.nodeName.match(/^wikparam_/)) {
					var aname = attr.nodeName.substr(9);
					var avalue = attr.nodeValue.replace(/"/g,"");
					a.push(" ", aname, "=\"", avalue, "\"");
				}
			}
		}
		a.push("}}");

		var text = document.createTextNode(a.join(""));
		elem.parentNode.replaceChild(text, elem);
	}
};
ZmNoteEditor.prototype._deserializeWiklets = function(node) {
	for (var child = node.firstChild; child; child = child.nextSibling) {
		if (child.nodeType == AjxUtil.ELEMENT_NODE) {
			this._deserializeWiklets(child);
		}
		else if (child.nodeType == AjxUtil.TEXT_NODE) {
			var regex = /(?=^|[^\\])\{\{\s*(.+?)(?:\s+(.*?))?\s*\}\}/g;
			var m;
			while ((m = regex.exec(child.nodeValue))) {
				var wiklet = ZmWiklet.getWikletByName(m[1]);
				if (!wiklet) continue;
				
				child = child.splitText(m.index);
				child = child.splitText(m[0].length);

				var value = m[2] || "";
				var params = ZmWikletProcessor.__parseValueAsParams(m[2]);
				var button = this._createWikletButton(wiklet, value, params);
				child.parentNode.replaceChild(button, child.previousSibling);

				regex.startIndex = 0;
			}
		}
	}
};
ZmNoteEditor.prototype._createWikletButton = function(wiklet, value, params) {
	var button = document.createElement("INPUT");
	button.type = "submit";
	button.value = wiklet.label || wiklet.name;
	button.setAttribute("wikname", wiklet.name);
	switch (wiklet.type) {
		case ZmWiklet.SINGLE_VALUE: {
			button.title = ZmMsg.wikletConfigureValue;
			var paramdef = wiklet.paramdefs && wiklet.paramdefs["value"];
			button.setAttribute("wikparam_value", value || paramdef.value || "");
			break;
		}
		case ZmWiklet.PARAMETERIZED: {
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
			break;
		}
		default: {
			button.title = ZmMsg.wikletConfigureNone;
			//button.disabled = true;
		}
	}
	button.onclick = ZmNoteEditor._wikletButtonHandler;
	return button;
};

ZmNoteEditor.prototype._embedHtmlContent =
function(html) {
	return html;
};

ZmNoteEditor.prototype._createToolbars = function() {
	ZmHtmlEditor.prototype._createToolbars.call(this);
	if (!this._wikiToolBar) {
		this._createWikiToolBar(this);
	}
};

ZmNoteEditor.prototype._createToolBar2 = function(parent) {
	ZmHtmlEditor.prototype._createToolBar2.call(this, parent);

	var button = new DwtButton(this._toolbar2, null, "TBButton")
	button.setImage("ImageDoc");
	button.addSelectionListener(new AjxListener(this, this._insertImageListener));
};

ZmNoteEditor.prototype._createWikiToolBar = function(parent) {
	var toolbar = this._wikiToolBar = new ZmToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	toolbar.setVisible(this._mode == DwtHtmlEditor.HTML);
	
	var listener = new AjxListener(this, this._wikiToolBarListener);
	
	var wiklets = ZmWiklet.getWiklets();
	for (var name in wiklets) {
		var wiklet = wiklets[name];
		var button = new DwtButton(toolbar, null, "TBButton");
		button.setText(wiklet.label || name);
		button.setToolTipContent(wiklet.tooltip);
		button.setData("wiklet", name);
		button.addSelectionListener(listener);
	}
	
	this._toolbars.push(toolbar);
};

ZmNoteEditor.prototype._insertImageListener = function(event) {
	var note = this._controller.getNote();

	var dialog = this._appCtxt.getUploadDialog();
	dialog.setFolderId(note.folderId || ZmNote.DEFAULT_FOLDER);
	if (!this._insertImageCallback) {
		this._insertImageCallback = new AjxCallback(this, this._insertImageByIds);
	}
	dialog.setCallback(this._insertImageCallback);
	dialog.popup();
};

ZmNoteEditor.prototype._insertImageByIds = function(ids) {
	var loc = document.location;
	var uname = this._appCtxt.get(ZmSetting.USERNAME);
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		var src = [
			loc.protocol,"//",loc.host,"/service/home/~",uname,"/?id=",id
		].join("");

		this.insertImage(src);
	}
};

ZmNoteEditor.prototype._wikiToolBarListener = function(event) {
	var name = event.item.getData("wiklet");
	var wiklet = ZmWiklet.getWikletByName(name);
	var button = this._createWikletButton(wiklet);
	this._insertNodeAtSelection(button);
};
ZmNoteEditor._wikletButtonHandler = function(event) {
	var target = DwtUiEvent.getTarget(event);
	var name = target.getAttribute("wikname");
	var wiklet = ZmWiklet.getWikletByName(name);
	if (!wiklet || !wiklet.type) {
		return;
	}
	
	var props = [];
	if (wiklet.type == ZmWiklet.SINGLE_VALUE) {
		var proxy = AjxUtil.createProxy(wiklet.paramdefs);
		var attr = target.getAttributeNode("wikparam_value");
		proxy.value =  attr != null ? attr.nodeValue : (proxy.value || "");
		props.push(proxy);
	}
	else if (wiklet.type == ZmWiklet.PARAMETERIZED) {
		var attrs = target.attributes;
		for (var i = 0; i < attrs.length; i++) {
			var attr = attrs[i];
			if (attr.nodeName.match(/^wikparam_/)) {
				var pname = attr.nodeName.substr(9);
				var proxy = AjxUtil.createProxy(wiklet.paramdefs[pname]);
				proxy.value = attr.nodeValue || proxy.value || "";
				props.push(proxy);
			}
		}
	}
	
	var shell = DwtShell.getShell(window);
	var dialog = new DwtDialog(shell);
	var propEditor = new DwtPropertyEditor(dialog);
	propEditor.initProperties(props);
	dialog.setView(propEditor);
	dialog.popup();
};

ZmNoteEditor.prototype._getInitialStyle = function(useDiv) {
	return "";
};