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

/**
 * Functions to create and cache table and cells properties dialogs
 * @private
 */

ZmTableEditor = {

	RE_THICK_BORDERS : /^(double|groove|ridge|inset|outset)$/i,

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
		this._cellPropsDialog.setup(editor, table, cells);
	},

	// call this in the context of a dialog object that knows this stuff ;-)
	__makeCommonWidgets : function() {
		var params = { parent:this, noFillLabel:ZmMsg.auto, parentElement: this._idBackgroundColor };
		this._wBgColor = new DwtButtonColorPicker(params);
		this._wBgColor.setImage("FontBackground");
		this._wBgColor.showColorDisplay();

                params.parentElement = this._idForegroundColor;
		this._wFgColor = new DwtButtonColorPicker(params);
		this._wFgColor.setImage("FontColor");
		this._wFgColor.showColorDisplay();

                params.parentElement = this._idBorderColor;
		this._wBorderColor = new DwtButtonColorPicker(params);
		this._wBorderColor.setImage("FontBorder");
		this._wBorderColor.showColorDisplay();

		this._wBorderStyle = new DwtSelect({ parent:this,
                                                     options: [ new DwtSelectOption("none", false, ZmMsg.none),
							        new DwtSelectOption("solid", true, ZmMsg.borderStyleSolid),
							        new DwtSelectOption("dashed", false, ZmMsg.borderStyleDashed),
							        new DwtSelectOption("dotted", false, ZmMsg.borderStyleDotted),
							        new DwtSelectOption("double", false, ZmMsg.borderStyleDouble),
							        new DwtSelectOption("groove", false, ZmMsg.borderStyleGroove),
							        new DwtSelectOption("ridge", false, ZmMsg.borderStyleRidge),
							        new DwtSelectOption("inset", false, ZmMsg.borderStyleInset),
							        new DwtSelectOption("outset", false, ZmMsg.borderStyleOutset) ],
                                                     parentElement: this._idBorderStyle
                                                   });
		this._wBorderStyle.addChangeListener(new AjxListener(this, ZmTableEditor.__onBorderStyleChange));

		this._wBorderWidth = new DwtSpinner({ parent: this, size: 3, min: 0, max: 10, parentElement: this._idBorderWidth });

		this._wTextAlign = new DwtSelect({parent:this,
                                                  options: [ new DwtSelectOption("", true, ZmMsg.notSet),
							     new DwtSelectOption("left", false, ZmMsg.left),
							     new DwtSelectOption("center", false, ZmMsg.center),
							     new DwtSelectOption("right", false, ZmMsg.right) ],
                                                  parentElement: this._idTextAlign
                                                 });

		this._wTextVAlign = new DwtSelect({ parent:this,
                                                    options: [ new DwtSelectOption("", false, ZmMsg.notSet),
							       new DwtSelectOption("top", false, ZmMsg.top),
							       new DwtSelectOption("middle", true, ZmMsg.middle),
							       new DwtSelectOption("bottom", false, ZmMsg.bottom) ],
                                                    parentElement: this._idTextVAlign
                                                  });

		this._wWidth = new DwtSpinner({ parent: this, size : 3, min: 0, parentElement: this._idWidth });
	},

	__onBorderStyleChange : function(ev) {
		var data = ev._args;
		var borderStyle = data.newValue;
		if (ZmTableEditor.RE_THICK_BORDERS.test(borderStyle)) {
			var w = this._wBorderWidth.getValue();
			if (w < 3) {
				this._wBorderWidth.setValue(3);
			}
		}
	}

};

ZmTablePropsDialog = function(parent) {
	if (arguments.length == 0) return;
	var advancedBtn = new DwtDialog_ButtonDescriptor(ZmTablePropsDialog.ADVANCED_BUTTON, ZmMsg.advanced, DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, {parent:parent, title:ZmMsg.tableProperties,
		       standardButtons:[ DwtDialog.OK_BUTTON,
			 DwtDialog.CANCEL_BUTTON ],
		       extraButtons:[ advancedBtn ]});

	var base_id = Dwt.getNextId();
	for (var i = ZmTablePropsDialog.IDS.length; --i >= 0;) {
		var id = ZmTablePropsDialog.IDS[i];
		this["_id" + id] = base_id + "_" + id;
	}

	var html = AjxTemplate.expand("share.Dialogs#TableProperties", { id: base_id });
	this.setContent(html);

	ZmTableEditor.__makeCommonWidgets.call(this);

	this._wAlign = new DwtSelect({ parent: this,
                                       options: [ new DwtSelectOption("", true, ZmMsg.notSet),
					          new DwtSelectOption("center", false, ZmMsg.center),
					          new DwtSelectOption("left", false, ZmMsg.left),
					          new DwtSelectOption("right", false, ZmMsg.right) ],
                                       parentElement: this._idAlign
                                     });

	this._wCaption = new DwtInputField(
	        { parent: this,
		  type            : DwtInputField.STRING,
		  size            : 38,
		  maxLen          : 255,
		  validationStyle : DwtInputField.CONTINUAL_VALIDATION,
                  parentElement   : this._idCaption
                });
	this._wCaption.getInputElement().style.width = "100%";

	this._wSummary = new DwtInputField(
	        { parent: this,
		  type            : DwtInputField.STRING,
		  size            : 38,
		  maxLen          : 255,
		  validationStyle : DwtInputField.CONTINUAL_VALIDATION,
                  parentElement   : this._idSummary
                });
	this._wSummary.getInputElement().style.width = "100%";

	this._wWidthUnit = new DwtSelect({ parent: this,
                                           options: [ new DwtSelectOption("%", false, ZmMsg.percent),
						      new DwtSelectOption("px", true, ZmMsg.pixels) ],
                                           parentElement: this._idWidthUnit
                                         });

	this._wBorderSpacing = new DwtSpinner({ parent: this, size: 3, min: 0, max: 10, parentElement: this._idBorderSpacing });

	this._wCellPadding = new DwtSpinner({ parent: this, size: 3, min: 0, max: 10, parentElement: this._idCellPadding });

	var tmp = AjxCallback.simpleClosure(this._setManualWidthState, this);
	document.getElementById(this._idWidthAuto).onclick = tmp;
	document.getElementById(this._idWidthAuto1).onclick = tmp;

	this.registerCallback(DwtDialog.OK_BUTTON, this._onOK, this);
	this.registerCallback(DwtDialog.CANCEL_BUTTON, this._onCancel, this);
	this.registerCallback(ZmTablePropsDialog.ADVANCED_BUTTON, this._onAdvanced, this);
};

ZmTablePropsDialog.prototype = new DwtDialog;
ZmTablePropsDialog.prototype.constructor = ZmTablePropsDialog;

ZmTablePropsDialog.ADVANCED_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmTablePropsDialog.IDS = [
	"AdvancedMode1",
	"AdvancedMode2",
	"Align",
	"BackgroundColor",
	"BorderCollapse",
	"BorderColor",
	"BorderSpacing",
	"BorderStyle",
	"BorderWidth",
	"Caption",
	"CellPadding",
	"FixedLayout",
	"ForegroundColor",
	"Summary",
	"TextAlign",
	"TextVAlign",
	"Width",
	"WidthAuto",
	"WidthAuto1",
	"WidthUnit"
];

ZmTablePropsDialog.prototype.popup = function() {
	DwtDialog.prototype.popup.call(this);
	this._wCaption.focus();
};

ZmTablePropsDialog.prototype.popdown = function() {
	this._cells = null;
	this._table = null;
	this._editor = null;
	DwtDialog.prototype.popdown.call(this);
};

ZmTablePropsDialog.prototype.setup = function(editor, table) {
	this._editor = editor;
	this._table  = table;

	var caption = table.getElementsByTagName("caption");
	caption = caption.length > 0 ? caption[0].innerHTML : "";
	this._wCaption.setValue(caption);

	var summary = table.summary || "";
	this._wSummary.setValue(summary);

	var width = table.style.width || table.width;
	document.getElementById(this._idWidthAuto).checked = !width;
	document.getElementById(this._idWidthAuto1).checked = !!width;
	if (width) {
		this._wWidthUnit.setSelected(/%/.test(width) ? 0 : 1);
		width = parseInt(width);
		this._wWidth.setValue(width);
	}
	this._setManualWidthState();

	var layout = table.style.tableLayout;
	document.getElementById(this._idFixedLayout).checked = (layout.toLowerCase() == "fixed");

	var align = table.align;
	switch (align) {
	    case "center" : align = 1; break;
	    case "left"   : align = 2; break;
	    case "right"  : align = 3; break;
	    default       : align = 0;
	}
	this._wAlign.setSelected(align);

	var textAlign = table.style.textAlign;
	switch (textAlign) {
	    case "left"   : textAlign = 1; break;
	    case "center" : textAlign = 2; break;
	    case "right"  : textAlign = 3; break;
	    default       : textAlign = 0;
	}
	this._wTextAlign.setSelected(textAlign);

	var vAlign = table.style.verticalAlign;
	switch (vAlign) {
	    case "top"    : vAlign = 1; break;
	    case "middle" : vAlign = 2; break;
	    case "bottom" : vAlign = 3; break;
	    default       : vAlign = 0;
	}
	this._wTextVAlign.setSelected(vAlign);

	var fgColor = table.style.color || "";
	this._wFgColor.setColor(fgColor);

	var bgColor = table.style.backgroundColor || "";
	this._wBgColor.setColor(bgColor);

	var borderColor = table.style.borderTopColor || "";
	this._wBorderColor.setColor(borderColor);

	var borderWidth = table.style.borderTopWidth || 0;
	if (borderWidth) {
		borderWidth = parseInt(borderWidth);
		this._wBorderWidth.setValue(borderWidth);
	} else {
		this._wBorderWidth.setValue("");
	}

	var borderStyle = table.style.borderTopStyle;
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
	if (borderCollapse) {
		document.getElementById(this._idBorderCollapse).checked = (borderCollapse.toLowerCase().indexOf("collapse") != -1);
	}
};

ZmTablePropsDialog.prototype._setManualWidthState = function() {
	var auto = document.getElementById(this._idWidthAuto).checked;
	this._wWidth.setEnabled(!auto);
	this._wWidthUnit.setEnabled(!auto);
};

ZmTablePropsDialog.prototype._onOK = function() {
	this._editor.focus();
	this._editor.applyTableProperties(this._table, this.getValues());
	this.popdown();
};

ZmTablePropsDialog.prototype._onCancel = function() {
	this._editor.focus();
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
		color           : this._wFgColor.getColor(),
		backgroundColor : this._wBgColor.getColor(),
		borderWidth     : this._wBorderWidth.getValue(),
		borderColor     : this._wBorderColor.getColor(),
		borderStyle     : this._wBorderStyle.getValue(),
		borderCollapse  : document.getElementById(this._idBorderCollapse).checked ? "collapse" : "",
		cellPadding     : this._wCellPadding.getValue(),
		cellSpacing     : this._wBorderSpacing.getValue()
	};
	if (val.borderWidth < 3 && ZmTableEditor.RE_THICK_BORDERS.test(val.borderStyle))
		val.borderWidth = 3;
	return val;
};



// ****************************************************************
// cell properties dialog

ZmCellPropsDialog = function(parent) {
	DwtDialog.call(this, parent, null, ZmMsg.cellProperties,
		       [ DwtDialog.OK_BUTTON,
			 DwtDialog.CANCEL_BUTTON ]);

	var base_id = Dwt.getNextId();
	for (var i = ZmCellPropsDialog.IDS.length; --i >= 0;) {
		var id = ZmCellPropsDialog.IDS[i];
		this["_id" + id] = base_id + "_" + id;
	}

	var html = AjxTemplate.expand("share.Dialogs#CellProperties", { id: base_id });
	this.setContent(html);

	ZmTableEditor.__makeCommonWidgets.call(this);

	this._wHeight = new DwtSpinner({ parent: this, size : 3, min: 0, parentElement: this._idHeight });
	this._wHorizPadding = new DwtSpinner({ parent: this, size : 3, min: 0, max: 10, parentElement: this._idHorizPadding });
	this._wVertPadding = new DwtSpinner({ parent: this, size : 3, min: 0, max: 10, parentElement: this._idVertPadding });

	// insert the "quick borders buttons"
	var table = document.getElementById(this._idQuickBorders);
	var row = table.rows[0];
	var clrow = row.cloneNode(true);
	var cell_index = 0;
	var quickSetListener = new AjxListener(this, this._quickSetBorder);
	for (var i = 0; i < ZmCellPropsDialog.QUICK_BORDERS.length; ++i) {
		var info = ZmCellPropsDialog.QUICK_BORDERS[i];
		if (cell_index == row.cells.length) {
			cell_index = 0;
			row = clrow.cloneNode(true);
			table.rows[0].parentNode.appendChild(row);
		}
		var td = row.cells[cell_index];
		cell_index++;
                var btn = new DwtButton({ parent: this, className: "TBButton", parentElement: td });
		btn.setImage(info.img);
		btn.setData("ZmTableEditor", info);
		btn.addSelectionListener(quickSetListener);
	}
	clrow = null;

	var table = this.getPreviewGridHolder();
	table.onmousemove = table.onmousedown =
		AjxCallback.simpleClosure(this._gridMouseEvent, this);
	table.onmouseout = AjxCallback.simpleClosure(Dwt.delClass, Dwt, table, "Cursor-Pointer");

	this.registerCallback(DwtDialog.OK_BUTTON, this._onOK, this);
	this.registerCallback(DwtDialog.CANCEL_BUTTON, this._onCancel, this);

	document.getElementById(this._idEnableWidth).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wWidth, this._idEnableWidth);

	document.getElementById(this._idEnableHeight).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wHeight, this._idEnableHeight);

	document.getElementById(this._idEnableHorizPadding).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wHorizPadding, this._idEnableHorizPadding);

	document.getElementById(this._idEnableVertPadding).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wVertPadding, this._idEnableVertPadding);

	document.getElementById(this._idEnableTextAlign).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wTextAlign, this._idEnableTextAlign);

	document.getElementById(this._idEnableTextVAlign).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wTextVAlign, this._idEnableTextVAlign);

	document.getElementById(this._idEnableBackgroundColor).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wBgColor, this._idEnableBackgroundColor);

	document.getElementById(this._idEnableForegroundColor).onclick =
		AjxCallback.simpleClosure(this._enableWidget, this, this._wFgColor, this._idEnableForegroundColor);
};

ZmCellPropsDialog.prototype = new DwtDialog;
ZmCellPropsDialog.prototype.constructor = ZmCellPropsDialog;

ZmCellPropsDialog.URL = appContextPath + "/js/zimbraMail/share/view/htmlEditor/dlg-cell-properties.html";

ZmCellPropsDialog.IDS = [
	"BackgroundColor",
	"BorderColor",
	"BorderStyle",
	"BorderWidth",
	"EnableBackgroundColor",
	"EnableForegroundColor",
	"EnableHeight",
	"EnableHorizPadding",
	"EnableTextAlign",
	"EnableTextVAlign",
	"EnableVertPadding",
	"EnableWidth",
	"ForegroundColor",
	"Height",
	"HorizPadding",
	"PreviewGrid",
	"PreviewGridHolder",
	"QuickBorders",
	"TextAlign",
	"TextVAlign",
	"VertPadding",
	"Width"
];

//
// this rather ugly variable describes the "quick border" buttons.  It is an
// array of hashes that can contain the following keys:
//
//   - img (required) -- the icon class name
//   - borders (required) -- array that specifies what borders to affect.
//     The order is top, middle, bottom, left, center, right.
//     Specify 1 if the border is "on", 0 if the border is "off".
//   - width -- integer or array specifying width for borders.  implied is 1.
//   - style -- string or array specifying the style for borders.  implied is "solid".
//
ZmCellPropsDialog.QUICK_BORDERS = [
	{
	    img: "BorderAll",
	    borders: [ 1, 1, 1, 1, 1, 1 ]
	},
	{
	    img: "BorderBottom",
	    borders: [ 0, 0, 1, 0, 0, 0 ]
	},
	{
	    img: "BorderBottomDouble",
	    style: "double",
	    borders: [ 0, 0, 3, 0, 0, 0 ]
	},
	{
	    img: "BorderBottomThick",
	    borders: [ 0, 0, 2, 0, 0, 0 ]
	},
	{
	    img: "BorderBox",
	    borders: [ 1, 0, 1, 1, 0, 1 ]
	},
	{
	    img: "BorderBoxDouble",
	    style: "double",
	    borders: [ 3, 0, 3, 3, 0, 3 ]
	},
	{
	    img: "BorderBoxThick",
	    borders: [ 2, 0, 2, 2, 0, 2 ]
	},
	{
	    img: "BorderCenter",
	    borders: [ 0, 1, 0, 0, 1, 0 ]
	},
	{
	    img: "BorderH",
	    borders: [ 0, 1, 0, 0, 0, 0 ]
	},
	{
	    img: "BorderHEdges",
	    borders: [ 1, 0, 1, 0, 0, 0 ]
	},
	{
	    img: "BorderLeft",
	    borders: [ 0, 0, 0, 1, 0, 0 ]
	},
	{
	    img: "BorderNone",
	    borders: [ 0, 0, 0, 0, 0, 0 ]
	},
	{
	    img: "BorderRight",
	    borders: [ 0, 0, 0, 0, 0, 1 ]
	},
	{
	    img: "BorderTop",
	    borders: [ 1, 0, 0, 0, 0, 0 ]
	},
	{
	    img: "BorderTopBottomDouble",
	    style: [ "solid", "none", "double", "none", "none", "none" ],
	    borders: [ 1, 0, 3, 0, 0, 0 ]
	},
	{
	    img: "BorderTopBottomThick",
	    borders: [ 1, 0, 2, 0, 0, 0 ]
	},
	{
	    img: "BorderTopDoubleBottomDouble",
	    style: [ "double", "none", "double", "none", "none", "none" ],
	    borders: [ 3, 0, 3, 0, 0, 0 ]
	},
	{
	    img: "BorderTopThickBottomThick",
	    borders: [ 2, 0, 2, 0, 0, 0 ]
	},
	{
	    img: "BorderV",
	    borders: [ 0, 0, 0, 0, 1, 0 ]
	},
	{
	    img: "BorderVEdges",
	    borders: [ 0, 0, 0, 1, 0, 1 ]
	}
];

ZmCellPropsDialog.prototype._quickSetBorder = function(ev) {
	var btn = ev.item;
	var info = btn.getData("ZmTableEditor");
	var borders = info.borders;
	var width, style;
	for (var i = borders.length; --i >= 0;) {
		width = borders[i];
		if (width) {
			if (info.style != null)
				style = (info.style instanceof Array) ? info.style[i] : info.style;
			else
				style = "solid";
		} else {
			// style = "none";
			continue;
		}
		this._grid_applyBorderStyles(i, {
			width: width + "px",
			style: style,
			color: this._wBorderColor.getColor() });
		if (AjxEnv.isGeckoBased)
			this._grid_refresh();
	}
};

ZmCellPropsDialog.prototype.popdown = function() {
	this._cells = null;
	this._table = null;
	this._editor = null;
	DwtDialog.prototype.popdown.call(this);
};

ZmCellPropsDialog.prototype.getPreviewGridHolder = function() {
	return document.getElementById(this._idPreviewGridHolder);
};

ZmCellPropsDialog.prototype.getPreviewGrid = function() {
	return document.getElementById(this._idPreviewGrid);
};

ZmCellPropsDialog.prototype.setup = function(editor, table, cells) {
	var grid = this.getPreviewGrid();
	grid.style.border = "1px dashed #ccc";
	var tds = grid.getElementsByTagName("td");
	for (var i = 0; i < tds.length; ++i)
		tds[i].style.border = "1px dashed #ccc";

	this._editor = editor;
	this._table = table;
	this._cells = cells;

	// grid.style.borderCollapse = table.style.borderCollapse;
	// grid.cellSpacing = table.cellSpacing;

	this._wWidth.setEnabled(false);
	this._wHeight.setEnabled(false);
	this._wVertPadding.setEnabled(false);
	this._wHorizPadding.setEnabled(false);
	this._wTextAlign.setEnabled(false);
	this._wTextVAlign.setEnabled(false);
	this._wFgColor.setEnabled(false);
	this._wBgColor.setEnabled(false);

	document.getElementById(this._idEnableWidth).checked = false;
	document.getElementById(this._idEnableHeight).checked = false;
	document.getElementById(this._idEnableHorizPadding).checked = false;
	document.getElementById(this._idEnableVertPadding).checked = false;
	document.getElementById(this._idEnableTextAlign).checked = false;
	document.getElementById(this._idEnableTextVAlign).checked = false;
	document.getElementById(this._idEnableForegroundColor).checked = false;
	document.getElementById(this._idEnableBackgroundColor).checked = false;

	this._wBorderStyle.setSelected(1);
	this._wBorderColor.setColor("#000000");
	this._wBorderWidth.setValue(1);

	this._grid_borderStyles = [ null, null, null, null, null, null ];

	if (AjxEnv.isGeckoBased) {
		grid.style.display = "none";
		setTimeout(function() { grid.style.display = ""; }, 1);
	}
};

ZmCellPropsDialog.prototype._gridMouseEvent = function(ev) {
	if (AjxEnv.isIE)
		ev = window.event;
	var dwtev = DwtShell.mouseEvent;
	dwtev.setFromDhtmlEvent(ev);

	var holder = this.getPreviewGridHolder();
	var grid = this.getPreviewGrid();

	// event absolute position
	var evpos = { x: dwtev.docX, y: dwtev.docY };

	// holder absolute position
	var hpos = Dwt.getLocation(holder);

	// grid absolute position (top-left corner)
	var gpos = Dwt.getLocation(grid);

	// grid center position
	var ipos = Dwt.getLocation(grid.rows[1].cells[1].firstChild);

	// grid bottom-right corner
	var rpos = { x: gpos.x + grid.offsetWidth,
		     y: gpos.y + grid.offsetHeight };

	var best_h = this._pickBestBorder(evpos.y, DwtHtmlEditor.BORDER_TOP, 4,
					  gpos.y + this._grid_getBorderWidth(DwtHtmlEditor.BORDER_TOP) / 2,
					  ipos.y - this._grid_getBorderWidth(DwtHtmlEditor.BORDER_MIDDLE) / 2,
					  rpos.y - this._grid_getBorderWidth(DwtHtmlEditor.BORDER_BOTTOM) / 2);

	var best_v = this._pickBestBorder(evpos.x, DwtHtmlEditor.BORDER_LEFT, 4,
					  gpos.x + this._grid_getBorderWidth(DwtHtmlEditor.BORDER_LEFT) / 2,
					  ipos.x - this._grid_getBorderWidth(DwtHtmlEditor.BORDER_CENTER) / 2,
					  rpos.x - this._grid_getBorderWidth(DwtHtmlEditor.BORDER_RIGHT) / 2);

	if (/mousedown/i.test(dwtev.type)) {
		// mouse clicked, therefore act.
		this._grid_applyBorderStyles(best_h);
		this._grid_applyBorderStyles(best_v);

		if ((best_h != null || best_v != null) && AjxEnv.isGeckoBased)
			this._grid_refresh();
	} else {
		// just mousemove, let's set the cursor if appropriate
		if (best_h != null || best_v != null)
			Dwt.addClass(holder, "Cursor-Pointer");
		else
			Dwt.delClass(holder, "Cursor-Pointer");
	}

	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmCellPropsDialog.prototype._grid_refresh = function() {
	var grid = this.getPreviewGrid();
	grid.style.display = "none";
	setTimeout(function() { grid.style.display = ""; }, 1);
};

ZmCellPropsDialog.prototype._pickBestBorder = function(pos, start, fuzz, p1, p2, p3) {
// 	var w1 = this._grid_getBorderWidth(start);
// 	var w2 = this._grid_getBorderWidth(start + 1);
// 	var w3 = this._grid_getBorderWidth(start + 2);

	var a1 = Math.abs(pos - p1);
	var b1 = Math.abs(pos - p2);
	var c1 = Math.abs(pos - p3);

	if (a1 < fuzz)
		return start;
	if (b1 < fuzz)
		return start + 1;
	if (c1 < fuzz)
		return start + 2;

	return null;
};

ZmCellPropsDialog.prototype._grid_getBorderWidth = function(border) {
	var grid = this.getPreviewGrid();
	switch (border) {
	    case DwtHtmlEditor.BORDER_TOP:
		return parseInt(grid.style.borderTopWidth);
	    case DwtHtmlEditor.BORDER_MIDDLE:
		return parseInt(grid.rows[0].cells[0].style.borderBottomWidth);
	    case DwtHtmlEditor.BORDER_BOTTOM:
		return parseInt(grid.style.borderBottomWidth);

	    case DwtHtmlEditor.BORDER_LEFT:
		return parseInt(grid.style.borderLeftWidth);
	    case DwtHtmlEditor.BORDER_CENTER:
		return parseInt(grid.rows[0].cells[0].style.borderRightWidth);
	    case DwtHtmlEditor.BORDER_RIGHT:
		return parseInt(grid.style.borderRightWidth);
	}
};

ZmCellPropsDialog.prototype._grid_applyBorderStyles = function(border, force) {
	var els = [];
	var grid = this.getPreviewGrid();
	switch (border) {
	    case DwtHtmlEditor.BORDER_TOP:
		els.push({ el: grid, b: "borderTop" },
			 { el: grid.rows[0].cells[0], b: "borderTop" },
			 { el: grid.rows[0].cells[1], b: "borderTop" });
		break;

	    case DwtHtmlEditor.BORDER_MIDDLE:
		els.push({ el: grid.rows[0].cells[0], b: "borderBottom" },
			 { el: grid.rows[0].cells[1], b: "borderBottom" },
			 { el: grid.rows[1].cells[0], b: "borderTop" },
			 { el: grid.rows[1].cells[1], b: "borderTop" });
		break;

	    case DwtHtmlEditor.BORDER_BOTTOM:
		els.push({ el: grid, b: "borderBottom" },
			 { el: grid.rows[1].cells[0], b: "borderBottom" },
			 { el: grid.rows[1].cells[1], b: "borderBottom" });
		break;

	    case DwtHtmlEditor.BORDER_LEFT:
		els.push({ el: grid, b: "borderLeft" },
			 { el: grid.rows[0].cells[0], b: "borderLeft" },
			 { el: grid.rows[1].cells[0], b: "borderLeft" });
		break;

	    case DwtHtmlEditor.BORDER_CENTER:
		els.push({ el: grid.rows[0].cells[0], b: "borderRight" },
			 { el: grid.rows[0].cells[1], b: "borderLeft" },
			 { el: grid.rows[1].cells[0], b: "borderRight" },
			 { el: grid.rows[1].cells[1], b: "borderLeft" });
		break;

	    case DwtHtmlEditor.BORDER_RIGHT:
		els.push({ el: grid, b: "borderRight" },
			 { el: grid.rows[0].cells[1], b: "borderRight" },
			 { el: grid.rows[1].cells[1], b: "borderRight" });
		break;
	}

	var width = this._wBorderWidth.getValue();
	var style = this._wBorderStyle.getValue();
	if (width < 3 && ZmTableEditor.RE_THICK_BORDERS.test(style)) {
		this._wBorderWidth.setValue(3);
		width = 3;
	}

	var s = this._grid_borderStyles[border];
	var new_style = force || {
	    width : width + "px",
	    color : this._wBorderColor.getColor(),
	    style : style
	};
	if (force || s == null || ( s.width != new_style.width ||
				    s.color != new_style.color ||
				    s.style != new_style.style )) {
		// no style defined or style different
		s = this._grid_borderStyles[border] = new_style;
	} else {
		// style match, null-out
		this._grid_borderStyles[border] = null;
		s = { width: "1px",
		      color: "#ccc",
		      style: "dashed" };
	}

	for (var i = 0; i < els.length; ++i) {
		var o = els[i];
		var b = o.b;
		o = o.el;
		o.style[b + "Width"] = s.width;
		o.style[b + "Color"] = s.color;
		o.style[b + "Style"] = s.style;
	}
};

ZmCellPropsDialog.prototype.getValues = function() {
	var val = {
	    borders         : this._grid_borderStyles,
	    width           : this._wWidth.getEnabled()         ? this._wWidth.getValue()         : null,
	    height          : this._wHeight.getEnabled()        ? this._wHeight.getValue()        : null,
	    horizPadding    : this._wHorizPadding.getEnabled()  ? this._wHorizPadding.getValue()  : null,
	    vertPadding     : this._wVertPadding.getEnabled()   ? this._wVertPadding.getValue()   : null,
	    textAlign       : this._wTextAlign.getEnabled()     ? this._wTextAlign.getValue()     : null,
	    verticalAlign   : this._wTextVAlign.getEnabled()    ? this._wTextVAlign.getValue()    : null,
	    color           : this._wFgColor.getEnabled()       ? this._wFgColor.getColor()       : null,
	    backgroundColor : this._wBgColor.getEnabled()       ? this._wBgColor.getColor()       : null
	};
	return val;
};

ZmCellPropsDialog.prototype._onOK = function() {
	this._editor.focus();
	this._editor.applyCellProperties(this._table, this._cells, this.getValues());
	this.popdown();
};

ZmCellPropsDialog.prototype._onCancel = function() {
	this.popdown();
};

ZmCellPropsDialog.prototype._enableWidget = function(widget, checkbox) {
	checkbox = document.getElementById(checkbox);
	widget.setEnabled(checkbox.checked);
	if (checkbox.checked) {
		if (typeof widget.select == "function")
			widget.select();
		else if (typeof widget.focus == "function")
			widget.focus();
	}
};
