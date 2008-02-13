/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

/* Toolbars for the SpreadSheet widget.  The toolbars can be attached to the
 * widget itself (when parent == spreadSheet), in which case they will be
 * inserted at the top, or to any other widget.
 */
ZmSpreadSheetToolbars = function(parent, spreadSheet) {
	if (spreadSheet == null)
		spreadSheet = parent;
	this._spreadSheet = spreadSheet;
	DwtComposite.call(this, {parent:parent, className:"ZmSpreadSheetToolbars", posStyle:DwtControl.RELATIVE_STYLE});
	this._on_buttonPress = new AjxListener(this, this._on_buttonPress);
	this._buttons = {};
	this._createWidgets();
	if (parent === spreadSheet) {
		parent = parent.getHtmlElement();
		parent.insertBefore(this.getHtmlElement(), parent.firstChild);
	}
	spreadSheet.onSelectCell.push(new AjxCallback(this, this._cellSelected));
};

ZmSpreadSheetToolbars.prototype = new DwtComposite;
ZmSpreadSheetToolbars.prototype.construction = ZmSpreadSheetToolbars;

// update the toolbar when a different cell was selected in the SpreadSheet widget
ZmSpreadSheetToolbars.prototype._cellSelected = function(cell) {
	this._buttons.bold.setSelected(cell.getStyleProp("fontWeight") == "bold");
	this._buttons.italic.setSelected(cell.getStyleProp("fontStyle") == "italic");
	this._buttons.underline.setSelected(cell.getStyleProp("textDecoration") == "underline");
	this._buttons.strike.setSelected(cell.getStyleProp("textDecoration") == "line-through");
	var align = cell.getStyleProp("textAlign");
	this._buttons.justifyLeft.setSelected(align == "left");
	this._buttons.justifyCenter.setSelected(align == "center");
	this._buttons.justifyRight.setSelected(align == "right");
	if (this._dataField)
		this._dataField.setValue(cell.getEditValue());
	this._buttons.typeSelect.setSelectedValue(cell.getType());
	var tmp = cell.getDecimals();
	if (tmp == null)
		tmp = -1;
	this._buttons.decimalsSelect.setSelectedValue(tmp);
};

ZmSpreadSheetToolbars.prototype._createWidgets = function() {
	this._createToolbar1();
	this._createToolbar2();
};

ZmSpreadSheetToolbars.prototype._createToolbar1 = function() {
	var toolbar = new DwtToolBar(this, "ToolBar", DwtControl.RELATIVE_STYLE, 0);
	var listener = this._on_buttonPress;
	var b;

	var params = {parent:toolbar};
	b = this._buttons.clipboardCopy = new DwtToolBarButton(params);
	b.setImage("Copy");
	b.setData("SS", "ClipboardCopy");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.copy);

	b = this._buttons.clipboardCut = new DwtToolBarButton(params);
	b.setImage("Cut");
	b.setData("SS", "ClipboardCut");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.cut);

	b = this._buttons.clipboardPaste = new DwtToolBarButton(params);
	b.setImage("Paste");
	b.setData("SS", "ClipboardPaste");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.paste);

	new DwtControl({parent:toolbar, className:"vertSep"});
	
	params.style = DwtButton.TOGGLE_STYLE;
	b = this._buttons.bold = new DwtToolBarButton(params);
	b.setImage("Bold");
	b.setData("SS", "Bold");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.boldText);

	b = this._buttons.italic = new DwtToolBarButton(params);
	b.setImage("Italics");
	b.setData("SS", "Italic");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.italicText);

	b = this._buttons.underline = new DwtToolBarButton(params);
	b.setImage("Underline");
	b.setData("SS", "Underline");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.underlineText);

	b = this._buttons.strike = new DwtToolBarButton(params);
	b.setImage("StrikeThru");
	b.setData("SS", "Strike");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.strikeThruText);

	new DwtControl({parent:toolbar, className:"vertSep"});
	
	b = this._buttons.justifyLeft = new DwtToolBarButton(params);
	b.setImage("LeftJustify");
	b.setData("SS", "JustifyLeft");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.leftJustify);

	b = this._buttons.justifyCenter = new DwtToolBarButton(params);
	b.setImage("CenterJustify");
	b.setData("SS", "JustifyCenter");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.centerJustify);

	b = this._buttons.justifyRight = new DwtToolBarButton(params);
	b.setImage("RightJustify");
	b.setData("SS", "JustifyRight");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.rightJustify);

	new DwtControl({parent:toolbar, className:"vertSep"});
	
	b = this._buttons.fontColor = new ZmSpreadSheetEditorColorPicker(toolbar, null, "DwtToolbarButton", null, null, null, ZmMsg.auto);
	b.setImage("FontColor");
	b.showColorDisplay();
	b.setToolTipContent(ZmMsg.fontColor);
	b.addSelectionListener(new AjxListener(this, this._on_fontColor));

	b = this._buttons.bgColor = new ZmSpreadSheetEditorColorPicker(toolbar, null, "DwtToolbarButton", null, null, null, ZmMsg.auto);
	b.setImage("FontBackground");
	b.showColorDisplay();
	b.setToolTipContent(ZmMsg.fontBackground);
	b.addSelectionListener(new AjxListener(this, this._on_bgColor));
};

ZmSpreadSheetToolbars.prototype._inputModified = function(val) {
	if (this._dataField)
		this._dataField.setValue(val);
};

ZmSpreadSheetToolbars.prototype._input_clicked = function(ev) {
	var dwtev = new DwtUiEvent();
	this._dataField.getInputElement().blur();
	dwtev.setFromDhtmlEvent(ev);
	var td = this._spreadSheet._selectedCell;
	if (td) {
		this._spreadSheet.focus();
		this._spreadSheet._editCell(td);
	}
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return false;
};

ZmSpreadSheetToolbars.prototype._createToolbar2 = function() {
	var toolbar = new DwtToolBar(this, "ToolBar ToolBar2", DwtControl.RELATIVE_STYLE, 0);
	var listener = this._on_buttonPress;
	var params = {parent:toolbar, style:0};

// 	var b = new DwtToolBarButton(params);
// 	b.setImage("Check");
// 	b.setToolTipContent(ZmMsg.subjectAccept);
// 	b.setData("SS", "DataEntry-OK");
// 	b.addSelectionListener(listener);

// 	b = new DwtToolBarButton(params);
// 	b.setImage("Cancel");
// 	b.setToolTipContent(ZmMsg.cancel);
// 	b.setData("SS", "DataEntry-Cancel");
// 	b.addSelectionListener(listener);

// 	var field = new DwtInputField({ parent: toolbar, size: 50 });
// 	field.setReadOnly(true);
// 	field.getInputElement().onfocus = AjxCallback.simpleClosure(this._input_clicked, this);
// 	this._dataField = field;

// 	this._spreadSheet.onInputModified.push(new AjxCallback(this, this._inputModified));

	// toolbar.getHtmlElement().style.display = "none";

	b = this._buttons.rowInsertAbove = new DwtToolBarButton(params);
	b.setImage("InsertRowBefore");
	b.setData("SS", "RowInsertAbove");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertRowAbove);

	b = this._buttons.rowInsertUnder = new DwtToolBarButton(params);
	b.setImage("InsertRowAfter");
	b.setData("SS", "RowInsertUnder");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertRowUnder);

	b = this._buttons.rowDelete = new DwtToolBarButton(params);
	b.setImage("DeleteRow");
	b.setData("SS", "RowDelete");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.deleteRow);

	new DwtControl({parent:toolbar, className:"vertSep"});
		
	b = this._buttons.colInsertBefore = new DwtToolBarButton(params);
	b.setImage("InsertColBefore");
	b.setData("SS", "ColInsertBefore");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertColumnBefore);

	b = this._buttons.colInsertAfter = new DwtToolBarButton(params);
	b.setImage("InsertColAfter");
	b.setData("SS", "ColInsertAfter");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertColumnAfter);

	b = this._buttons.colDelete = new DwtToolBarButton(params);
	b.setImage("DeleteCol");
	b.setData("SS", "ColDelete");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.deleteColumn);

	new DwtControl({parent:toolbar, className:"vertSep"});

	b = new DwtToolBarButton(params);
	b.setImage("Sum");
	b.setToolTipContent("Sum cells");
	b.setData("SS", "Func-SumCells");
	b.addSelectionListener(listener);

	// BEGIN: Insert Function menu

	b = new DwtToolBarButton(params);
	b.setText("Insert function");

	var menu = new DwtMenu(b);
	menu.dontStealFocus();

	var funcs = [];
	for (var i in ZmSpreadSheetFormulae.HELP)
		funcs.push(i);
	funcs = funcs.sort();

	var func_listener = new AjxListener(this, this._on_insertFunction);

	for (var i = 0; i < funcs.length; ++i) {
		var help = ZmSpreadSheetFormulae.HELP[funcs[i]];
		if (help.alias)	// skip aliases for now
			continue;
		var item = new DwtMenuItem({parent:menu});
		item.setText([ '<div style="float:left; width: 5em; text-align: right">', funcs[i],
			       '</div>',
			       '<div style="margin-left: 5em">&nbsp;- ',
			       help.help,
			       '</div>' ].join(""));
		item.setData("SS", funcs[i]);
		item.addSelectionListener(func_listener);
		if (help.args)
			item.setToolTipContent(help.args);
	}
	b.setMenu(menu);

	// END: insert function

	new DwtControl({parent:toolbar, className:"vertSep"});

	

	var s = this._buttons.typeSelect = new ZmSpreadSheetEditorSelect(toolbar, null);
	s.addChangeListener(new AjxListener(this, this._on_typeSelect));
	s.addOption("Auto type", true, null);
	s.addOption("Number", false, "number");
	s.addOption("Currency", false, "currency");
	s.addOption("Percentage", false, "percentage");
	s.addOption("Text", false, "string");


	var s = this._buttons.decimalsSelect = new ZmSpreadSheetEditorSelect(toolbar, null);
	s.addChangeListener(new AjxListener(this, this._on_decimalsSelect));
	s.addOption("Auto decimals", true, -1);
	s.addOption("No decimals", false, 0);
	s.addOption("1 decimal", false, 1);
	s.addOption("2 decimals", false, 2);
	s.addOption("3 decimals", false, 3);
	s.addOption("4 decimals", false, 4);
	s.addOption("5 decimals", false, 5);
	s.addOption("6 decimals", false, 6);

	if (ZmSpreadSheetModel.DEBUG) {
		new DwtControl({parent:toolbar, className:"vertSep"});
		new DwtLabel({parent:toolbar}).setText("DEBUG: ");
		b = new DwtToolBarButton(params);
		b.setText("Serialize");
		b.addSelectionListener(new AjxListener(this, function() {
			var txt = this.getModel().serialize();
			var win = window.open(appContextPath+"/public/blank.html", "_blank", "scrollbars=no");
			var timeout = setInterval(function() {
				try {
					var d = win.document;
					b = d.body;
					b.style.backgroundColor = "ButtonFace";
					var t = d.createElement("textarea");
					t.value = txt;
					b.appendChild(t);
					t.style.width = "100%";
					t.style.height = "100%";
					clearInterval(timeout);
				} catch(ex) {}
			}, 250);
		}));
		b = new DwtToolBarButton(params);
		b.setText("getHtml");
		b.addSelectionListener(new AjxListener(this, function() {
			var txt = this.getModel().getHtml();
			var win = window.open(appContextPath+"/public/blank.html", "_blank", "scrollbars=yes");
			var timeout = setInterval(function() {
				try {
					var d = win.document;
					b = d.body;
					b.style.backgroundColor = "ButtonFace";
					b.innerHTML = txt;
					clearInterval(timeout);
				} catch(ex) {}
			}, 250);
		}));
	}
};

ZmSpreadSheetToolbars.prototype._on_insertFunction = function(ev) {
	this.insertFunction(ev.item.getData("SS"));
};

ZmSpreadSheetToolbars.prototype._on_fontColor = function(ev) {
	this.applyStyle("color", ev.detail);
	this._spreadSheet.focus();
};

ZmSpreadSheetToolbars.prototype._on_bgColor = function(ev) {
	this.applyStyle("backgroundColor", ev.detail);
	this._spreadSheet.focus();
};

ZmSpreadSheetToolbars.prototype._on_buttonPress = function(ev) {
	var btn = ev.item;
	var data = btn.getData("SS");
	var ss = this._spreadSheet;
	ss.focus();
	switch (data) {

		// Clipboard
	    case "ClipboardCopy":
		ss.clipboardCopy();
		break;
	    case "ClipboardCut":
		ss.clipboardCut();
		break;
	    case "ClipboardPaste":
		ss.clipboardPaste();
		break;

		// Style formatting
	    case "Bold":
		this.applyStyle("fontWeight", btn.isToggled() ? "bold" : "");
		break;
	    case "Italic":
		this.applyStyle("fontStyle", btn.isToggled() ? "italic" : "");
		break;
	    case "Strike":
		this.applyStyle("textDecoration", btn.isToggled() ? "line-through" : "");
		this._buttons.underline.setSelected(false);
		break;
	    case "Underline":
		this.applyStyle("textDecoration", btn.isToggled() ? "underline" : "");
		this._buttons.strike.setSelected(false);
		break;
	    case "JustifyLeft":
		this.applyStyle("textAlign", btn.isToggled() ? "left" : "");
		this._buttons.justifyCenter.setSelected(false);
		this._buttons.justifyRight.setSelected(false);
		break;
	    case "JustifyCenter":
		this.applyStyle("textAlign", btn.isToggled() ? "center" : "");
		this._buttons.justifyLeft.setSelected(false);
		this._buttons.justifyRight.setSelected(false);
		break;
	    case "JustifyRight":
		this.applyStyle("textAlign", btn.isToggled() ? "right" : "");
		this._buttons.justifyLeft.setSelected(false);
		this._buttons.justifyCenter.setSelected(false);
		break;

		// Insert/remove rows/cols
	    case "RowInsertAbove":
		var cell = ss.getSelectedCellModel();
		if (cell)
			this.getModel().insertRow(cell.getRow() - 1);
		break;
	    case "RowInsertUnder":
		var cell = ss.getSelectedCellModel();
		if (cell)
			this.getModel().insertRow(cell.getRow());
		break;
	    case "ColInsertBefore":
		var cell = ss.getSelectedCellModel();
		if (cell)
			this.getModel().insertCol(cell.getCol() - 1);
		break;
	    case "ColInsertAfter":
		var cell = ss.getSelectedCellModel();
		if (cell)
			this.getModel().insertCol(cell.getCol());
		break;
	    case "RowDelete":
		var cell = ss.getSelectedCellModel();
		if (cell)
			this.getModel().deleteRow(cell.getRow() - 1);
		break;
	    case "ColDelete":
		var cell = ss.getSelectedCellModel();
		if (cell)
			this.getModel().deleteCol(cell.getCol() - 1);
		break;
	    case "Func-SumCells":
		this.insertFunction("sum");
		break;
	}
};

ZmSpreadSheetToolbars.prototype.insertFunction = function(fn) {
	var ss = this._spreadSheet;
	var cell = ss.getSelectedCellModel();
	if (cell) {
		var help = ZmSpreadSheetFormulae.HELP[fn];
		var pos = fn.length + 2;
		if (help && help.helper) {
			fn = help.helper;
			pos = fn.indexOf("|");
			fn = fn.replace(/\|/g, "");
		} else {
			fn = "=" + fn + "()";
		}
		var input = ss._getInputField();
		ss.focus();
		ss._editCell(cell._td);
		input.setValue(fn);
		Dwt.setSelectionRange(input, pos, pos);
	}
};

ZmSpreadSheetToolbars.prototype._on_typeSelect = function(ev) {
	this._spreadSheet.focus();
	var range = this._spreadSheet.getSelectionRange();
	if (!range)
		return;
	var type = ev._args.newValue;
	this.getModel().forEachCell(range, function(cell) {
		cell.setType(type);
	}, this);
};

ZmSpreadSheetToolbars.prototype._on_decimalsSelect = function(ev) {
	this._spreadSheet.focus();
	var range = this._spreadSheet.getSelectionRange();
	if (!range)
		return;
	var dec = ev._args.newValue;
	if (dec == -1)
		dec = null;
	this.getModel().forEachCell(range, function(cell) {
					    cell.setDecimals(dec);
				    }, this);
};

ZmSpreadSheetToolbars.prototype.getModel = function() {
	return this._spreadSheet._model;
};

ZmSpreadSheetToolbars.prototype.applyStyle = function(propName, propValue) {
	// retrieve the selection as a range
	var range = this._spreadSheet.getSelectionRange();
	if (!range)
		return;
	this.getModel().forEachCell(range, function(cell) {
		cell.setStyleProp(propName, propValue);
	}, this);
};

ZmSpreadSheetEditorColorPicker = function(parent, style, className, posStyle, id, index, noFillLabel) {
    DwtButtonColorPicker.call(this, parent, style, className, posStyle, id, index, noFillLabel);
}
ZmSpreadSheetEditorColorPicker.prototype = new DwtButtonColorPicker;
ZmSpreadSheetEditorColorPicker.prototype.constructor = ZmSpreadSheetEditorColorPicker;

ZmSpreadSheetEditorColorPicker.prototype.TEMPLATE = "dwt.Widgets#ZToolbarButton";

ZmSpreadSheetEditorSelect = function(parent, options, className, posStyle) {
    DwtSelect.call(this, {parent:parent, options:options, className:className, posStyle:posStyle});
}
ZmSpreadSheetEditorSelect.prototype = new DwtSelect;
ZmSpreadSheetEditorSelect.prototype.constructor = ZmSpreadSheetEditorSelect;

ZmSpreadSheetEditorSelect.prototype.TEMPLATE = "dwt.Widgets#ZBorderlessButton";
