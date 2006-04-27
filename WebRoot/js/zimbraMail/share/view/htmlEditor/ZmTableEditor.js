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
 * Functions to create and cache table and cells properties dialogs
 */

ZmTableEditor = {

	getTablePropsDialog : function(editor, table) {
		if (!this._tablePropsDialog)
			this._createTablePropsDialog();
		this._updateTablePropsDialog(editor, table);
		return this._tablePropsDialog;
	},

	getCellPropsDialog : function(editor, table, cells) {
		if (!this._cellPropsDialog)
			this._createCellPropsDialog();
		this._updateCellPropsDialog(editor, table, cells);
		return this._cellPropsDialog;
	},

	_createTablePropsDialog : function() {
		this._tablePropsDialog = new ZmTablePropsDialog(DwtShell.getShell(window));
	},

	_updateTablePropsDialog : function(editor, table) {
		this._tablePropsDialog.setup(editor, table);
	},

	_createCellPropsDialog : function() {
		this._cellPropsDialog = new ZmCellPropsDialog(DwtShell.getShell(window));
	},

	_updateCellPropsDialog : function(editor, table, cells) {
		this._cellPropsDialog.setup(editor, table);
	},

	getDialogLayout : function(url) {
		var time = new Date().getTime();

		// WARNING: synchronous request!
		// Also we don't treat errors at this point >-) so you better
		// know what you're doing.
		var res = AjxRpc.invoke(null, url + "?v=" + time, null, null, true, 5000);
		var txt = res.text;

		var ids = {};

		// get rid of the comments
		txt = txt.replace(/<!--.*?-->/, "");

		// replace $msg and $id fields
		txt = txt.replace(/\$([a-zA-Z0-9_.]+)/g, function(str, p1) {
			if (/^([^.]+)\.(.*)$/.test(p1)) {
				var prefix = RegExp.$1;
				var name = RegExp.$2;
				switch (prefix) {
				    case "id":
					var id = ids[name];
					if (!id)
						id = ids[name] = Dwt.getNextId();
					return id;
				    case "msg":
					return ZmMsg[name];
				}
			}
			return str;
		});

		return { ids: ids, html: txt };
	}

};

ZmTablePropsDialog.URL = appContextPath + "/js/zimbraMail/share/view/htmlEditor/dlg-table-properties.html";

ZmTablePropsDialog.ADVANCED_BUTTON = ++DwtDialog.LAST_BUTTON;

function ZmTablePropsDialog(parent) {
	if (arguments.length == 0) return;
	var advancedBtn = new DwtDialog_ButtonDescriptor(ZmTablePropsDialog.ADVANCED_BUTTON, ZmMsg.advanced, DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, parent, null, ZmMsg.tableProperties,
		       [ DwtDialog.OK_BUTTON,
			 DwtDialog.CANCEL_BUTTON ],
		       [ advancedBtn ] );

	this._disableFFhack();

	var ids;
	var html;

	ids = ZmTableEditor.getDialogLayout(ZmTablePropsDialog.URL);
	html = ids.html;
	ids = ids.ids;

	for (var i in ids)
		this["_id" + i] = ids[i];

	this.setContent(html);

	this._wCaption = new DwtInputField(
	{ parent: this,
			  type            : DwtInputField.STRING,
			  size            : 38,
			  maxLen          : 255,
			  validationStyle : DwtInputField.CONTINUAL_VALIDATION });
	this._wCaption.reparentHtmlElement(this._idCaption);
	this._wCaption.getInputElement().style.width = "100%";

	this._wSummary = new DwtInputField(
	{ parent: this,
			  type            : DwtInputField.STRING,
			  size            : 38,
			  maxLen          : 255,
			  validationStyle : DwtInputField.CONTINUAL_VALIDATION });
	this._wSummary.reparentHtmlElement(this._idSummary);
	this._wSummary.getInputElement().style.width = "100%";

	this._wWidth = new DwtInputField(
	{ parent: this,
			  type            : DwtInputField.INTEGER,
			  size            : 4,
			  validationStyle : DwtInputField.CONTINUAL_VALIDATION,
			  errorIconStyle  : DwtInputField.ERROR_ICON_RIGHT });
	this._wWidth.reparentHtmlElement(this._idWidth);

	this._wWidthUnit = new DwtSelect(this, [ new DwtSelectOption("%", false, ZmMsg.percent),
						 new DwtSelectOption("px", true, ZmMsg.pixels) ]);
	this._wWidthUnit.reparentHtmlElement(this._idWidthUnit);

	this._wAlign = new DwtSelect(this, [ new DwtSelectOption("", true, ZmMsg.notSet),
					     new DwtSelectOption("center", false, ZmMsg.center),
					     new DwtSelectOption("left", false, ZmMsg.left),
					     new DwtSelectOption("right", false, ZmMsg.right) ]);
	this._wAlign.reparentHtmlElement(this._idAlign);

	this._wBgColor = new DwtButton(this, null, "TBButton");
	this._wBgColor.setImage("FontBackground");
	var m = new DwtMenu(this._wBgColor, DwtMenu.COLOR_PICKER_STYLE, null, null, this);
	this._wBgColor.setMenu(m);
	this._wBgColor.reparentHtmlElement(this._idBackgroundColor);
	var c = new DwtColorPicker(m);
	c.addSelectionListener(new AjxListener(this, this._bgColorSelected));

	this._wFgColor = new DwtButton(this, null, "TBButton");
	this._wFgColor.setImage("FontColor");
	var m = new DwtMenu(this._wFgColor, DwtMenu.COLOR_PICKER_STYLE, null, null, this);
	this._wFgColor.setMenu(m);
	this._wFgColor.reparentHtmlElement(this._idForegroundColor);
	var c = new DwtColorPicker(m);
	c.addSelectionListener(new AjxListener(this, this._fgColorSelected));

	this._wBorderColor = new DwtButton(this, null, "TBButton");
	this._wBorderColor.setImage("FontColor");
	var m = new DwtMenu(this._wBorderColor, DwtMenu.COLOR_PICKER_STYLE, null, null, this);
	this._wBorderColor.setMenu(m);
	this._wBorderColor.reparentHtmlElement(this._idBorderColor);
	var c = new DwtColorPicker(m);
	c.addSelectionListener(new AjxListener(this, this._borderColorSelected));

	(this._wBorderStyle = new DwtSelect(this, [ new DwtSelectOption("none", false, ZmMsg.notSet),
						    new DwtSelectOption("solid", true, ZmMsg.borderStyleSolid),
						    new DwtSelectOption("dashed", false, ZmMsg.borderStyleDashed),
						    new DwtSelectOption("dotted", false, ZmMsg.borderStyleDotted),
						    new DwtSelectOption("double", false, ZmMsg.borderStyleDouble),
						    new DwtSelectOption("groove", false, ZmMsg.borderStyleGroove),
						    new DwtSelectOption("ridge", false, ZmMsg.borderStyleRidge),
						    new DwtSelectOption("inset", false, ZmMsg.borderStyleInset),
						    new DwtSelectOption("outset", false, ZmMsg.borderStyleOutset) ]))
		.reparentHtmlElement(this._idBorderStyle);

	(this._wBorderWidth = new DwtInputField(
	{ parent: this,
			  type            : DwtInputField.INTEGER,
			  size            : 3,
			  validationStyle : DwtInputField.CONTINUAL_VALIDATION,
			  errorIconStyle  : DwtInputField.ERROR_ICON_RIGHT }))
		.reparentHtmlElement(this._idBorderWidth);

	(this._wBorderSpacing = new DwtInputField(
	{ parent: this,
			  type            : DwtInputField.INTEGER,
			  size            : 3,
			  validationStyle : DwtInputField.CONTINUAL_VALIDATION,
			  errorIconStyle  : DwtInputField.ERROR_ICON_RIGHT }))
		.reparentHtmlElement(this._idBorderSpacing);

	(this._wCellPadding = new DwtInputField(
	{ parent: this,
			  type            : DwtInputField.INTEGER,
			  size            : 3,
			  validationStyle : DwtInputField.CONTINUAL_VALIDATION,
			  errorIconStyle  : DwtInputField.ERROR_ICON_RIGHT }))
		.reparentHtmlElement(this._idCellPadding);

	(this._wTextAlign = new DwtSelect(this, [ new DwtSelectOption("", true, ZmMsg.notSet),
						  new DwtSelectOption("left", false, ZmMsg.left),
						  new DwtSelectOption("center", false, ZmMsg.center),
						  new DwtSelectOption("right", false, ZmMsg.right) ]))
		.reparentHtmlElement(this._idTextAlign);

	(this._wTextVAlign = new DwtSelect(this, [ new DwtSelectOption("", false, ZmMsg.notSet),
						   new DwtSelectOption("top", false, ZmMsg.top),
						   new DwtSelectOption("middle", true, ZmMsg.middle),
						   new DwtSelectOption("bottom", false, ZmMsg.bottom) ]))
		.reparentHtmlElement(this._idTextVAlign);

	document.getElementById(this._idWidthAuto).onclick = AjxCallback.simpleClosure(this._setManualWidthState, this);
	document.getElementById(this._idWidthAuto1).onclick = AjxCallback.simpleClosure(this._setManualWidthState, this);

	document.getElementById(this._idShowForegroundColor).onclick
		= AjxCallback.simpleClosure(this._clearSelectedColor, this, this._idShowForegroundColor);
	document.getElementById(this._idShowBackgroundColor).onclick
		= AjxCallback.simpleClosure(this._clearSelectedColor, this, this._idShowBackgroundColor);
	document.getElementById(this._idShowBorderColor).onclick
		= AjxCallback.simpleClosure(this._clearSelectedColor, this, this._idShowBorderColor);

	this.registerCallback(DwtDialog.OK_BUTTON, this._onOK, this);
	this.registerCallback(DwtDialog.CANCEL_BUTTON, this._onCancel, this);
	this.registerCallback(ZmTablePropsDialog.ADVANCED_BUTTON, this._onAdvanced, this);
};

ZmTablePropsDialog.prototype = new DwtDialog;
ZmTablePropsDialog.prototype.constructor = ZmTablePropsDialog;

// DEBUG!!! -- works only with Firefox + Firebug extension
function printfire() {
	if (document.createEvent)
	{
		printfire.args =  arguments;
		var ev = document.createEvent("Events");
		ev.initEvent("printfire", false, true );
		dispatchEvent(ev);
	}
};

ZmTablePropsDialog.prototype.popup = function() {
	DwtDialog.prototype.popup.call(this);
	this._wCaption.focus();
};

ZmTablePropsDialog.prototype.setup = function(editor, table) {
	// for some reason we need to reset this here, otherwise the dialog
	// won't properly display a second time (and generates an error in IE)
	// :-/  Calling this.reset() would null _loc, but would also clear
	// button-press event handlers, which we don't want to happen.
	this._loc = null;

	this._editor = editor;
	this._table  = table;

	var caption = table.getElementsByTagName("caption");
	caption = caption.length > 0 ? caption[0].innerHTML : "";
	printfire("Caption: " + caption);
	this._wCaption.setValue(caption);

	var summary = table.summary || "";
	printfire("Sum: " + summary);
	this._wSummary.setValue(summary);

	var width = table.style.width || table.width;
	document.getElementById(this._idWidthAuto).checked = !width;
	document.getElementById(this._idWidthAuto1).checked = !!width;
	printfire("Width: " + width);
	if (width) {
		this._wWidthUnit.setSelected(/%/.test(width) ? 0 : 1);
		width = parseInt(width);
		this._wWidth.setValue(width);
	}
	this._setManualWidthState();

	var layout = table.style.tableLayout;
	printfire("Layout: " + layout);
	document.getElementById(this._idFixedLayout).checked = (layout.toLowerCase() == "fixed");

	var align = table.align;
	printfire("Align: " + align);
	switch (align) {
	    case "center" : align = 1; break;
	    case "left"   : align = 2; break;
	    case "right"  : align = 3; break;
	    default       : align = 0;
	}
	this._wAlign.setSelected(align);

	var textAlign = table.style.textAlign;
	printfire("Text align: " + textAlign);
	switch (textAlign) {
	    case "left"   : textAlign = 1; break;
	    case "center" : textAlign = 2; break;
	    case "right"  : textAlign = 3; break;
	    default       : textAlign = 0;
	}
	this._wTextAlign.setSelected(textAlign);

	var vAlign = table.style.verticalAlign;
	printfire("Vertical align: " + vAlign);
	switch (vAlign) {
	    case "top"    : vAlign = 1; break;
	    case "middle" : vAlign = 2; break;
	    case "bottom" : vAlign = 3; break;
	    default       : vAlign = 0;
	}
	this._wTextVAlign.setSelected(vAlign);

	var fgColor = table.style.color || "";
	printfire("Font color: " + fgColor);
	document.getElementById(this._idShowForegroundColor).style.backgroundColor = fgColor;

	var bgColor = table.style.backgroundColor || "";
	printfire("Background color: " + bgColor);
	document.getElementById(this._idShowBackgroundColor).style.backgroundColor = bgColor;

	var borderColor = table.style.borderTopColor || "";
	printfire("Border color: " + borderColor);
	document.getElementById(this._idShowBorderColor).style.backgroundColor = borderColor;

	var borderWidth = table.style.borderTopWidth || 0;
	printfire("Border width: " + borderWidth);
	if (borderWidth) {
		borderWidth = parseInt(borderWidth);
		this._wBorderWidth.setValue(borderWidth);
	} else {
		this._wBorderWidth.setValue("");
	}

	var borderStyle = table.style.borderTopStyle;
	printfire("Border Style: " + borderStyle);
	switch (borderStyle.toLowerCase()) {
	    case "solid"   : borderStyle = 1; break;
	    case "dashed"  : borderStyle = 2; break;
	    case "dotted"  : borderStyle = 3; break;
	    case "double"  : borderStyle = 4; break;
	    case "groove"  : borderStyle = 5; break;
	    case "ridge"   : borderStyle = 6; break;
	    case "inset"   : borderStyle = 7; break;
	    case "outset"  : borderStyle = 8; break;
	    default        : borderStyle = 0;
	}
	this._wBorderStyle.setSelected(borderStyle);

	var cellSpacing = table.cellSpacing;
	this._wBorderSpacing.setValue(cellSpacing);

	var cellPadding = table.cellPadding;
	this._wCellPadding.setValue(cellPadding);

	var borderCollapse = table.style.borderCollapse;
	document.getElementById(this._idBorderCollapse).checked = /collapse/i.test(borderCollapse);
};

ZmTablePropsDialog.prototype._setManualWidthState = function() {
	var auto = document.getElementById(this._idWidthAuto).checked;
	this._wWidth.setEnabled(!auto);
	this._wWidthUnit.setEnabled(!auto);
};

ZmTablePropsDialog.prototype._bgColorSelected = function(ev) {
	document.getElementById(this._idShowBackgroundColor).style.backgroundColor = ev.detail;
};

ZmTablePropsDialog.prototype._fgColorSelected = function(ev) {
	document.getElementById(this._idShowForegroundColor).style.backgroundColor = ev.detail;
};

ZmTablePropsDialog.prototype._borderColorSelected = function(ev) {
	document.getElementById(this._idShowBorderColor).style.backgroundColor = ev.detail;
};

ZmTablePropsDialog.prototype._clearSelectedColor = function(id) {
	document.getElementById(id).style.backgroundColor = "";
};

ZmTablePropsDialog.prototype._onOK = function() {
	this._editor.focus();
	this._editor.applyTableProperties(this._table, this.getValues());
	this._editor = null;
	this._table = null;
	this.popdown();
};

ZmTablePropsDialog.prototype._onCancel = function() {
	this._editor.focus();
	this._editor = null;
	this._table = null;
	this.popdown();
};

ZmTablePropsDialog.prototype._onAdvanced = function() {
	this._advancedMode = !this._advancedMode;
	var el = document.getElementById(this._idAdvancedMode1);
	el.style.display = this._advancedMode ? "" : "none";
	el = document.getElementById(this._idAdvancedMode2);
	el.style.display = this._advancedMode ? "" : "none";
	var btn = this.getButton(ZmTablePropsDialog.ADVANCED_BUTTON);
	btn.setText(this._advancedMode ? ZmMsg.simple : ZmMsg.advanced);
};

ZmTablePropsDialog.prototype.getValues = function() {
	var val = {
		caption         : this._wCaption.getValue(),
		summary         : this._wSummary.getValue(),
		width           : ( document.getElementById(this._idWidthAuto).checked
				    ? ""
				    : this._wWidth.getValue() + this._wWidthUnit.getValue() ),
		align           : this._wAlign.getValue(),
		tableLayout     : document.getElementById(this._idFixedLayout).checked ? "fixed" : "",
		textAlign       : this._wTextAlign.getValue(),
		verticalAlign   : this._wTextVAlign.getValue(),
		color           : document.getElementById(this._idShowForegroundColor).style.backgroundColor,
		backgroundColor : document.getElementById(this._idShowBackgroundColor).style.backgroundColor,
		borderWidth     : this._wBorderWidth.getValue(),
		borderColor     : document.getElementById(this._idShowBorderColor).style.backgroundColor,
		borderStyle     : this._wBorderStyle.getValue(),
		borderCollapse  : document.getElementById(this._idBorderCollapse).checked ? "collapse" : "",
		cellPadding     : this._wCellPadding.getValue(),
		cellSpacing     : this._wBorderSpacing.getValue()
	};
	return val;
};
