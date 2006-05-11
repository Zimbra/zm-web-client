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
	},

	// call this in the context of a dialog object that knows this stuff ;-)
	__makeCommonWidgets : function() {
		this._wBgColor = new DwtButtonColorPicker(this, null, null, null, null, null, ZmMsg.auto);
		this._wBgColor.reparentHtmlElement(this._idBackgroundColor);
		this._wBgColor.setImage("FontBackground");
		this._wBgColor.showColorDisplay();

		this._wFgColor = new DwtButtonColorPicker(this, null, null, null, null, null, ZmMsg.auto);
		this._wFgColor.reparentHtmlElement(this._idForegroundColor);
		this._wFgColor.setImage("FontColor");
		this._wFgColor.showColorDisplay();

		this._wBorderColor = new DwtButtonColorPicker(this, null, null, null, null, null, ZmMsg.auto);
		this._wBorderColor.reparentHtmlElement(this._idBorderColor);
		this._wBorderColor.setImage("FontBorder");
		this._wBorderColor.showColorDisplay();

		this._wBorderStyle = new DwtSelect(this, [ new DwtSelectOption("none", false, ZmMsg.none),
							   new DwtSelectOption("solid", true, ZmMsg.borderStyleSolid),
							   new DwtSelectOption("dashed", false, ZmMsg.borderStyleDashed),
							   new DwtSelectOption("dotted", false, ZmMsg.borderStyleDotted),
							   new DwtSelectOption("double", false, ZmMsg.borderStyleDouble),
							   new DwtSelectOption("groove", false, ZmMsg.borderStyleGroove),
							   new DwtSelectOption("ridge", false, ZmMsg.borderStyleRidge),
							   new DwtSelectOption("inset", false, ZmMsg.borderStyleInset),
							   new DwtSelectOption("outset", false, ZmMsg.borderStyleOutset) ]);
		this._wBorderStyle.reparentHtmlElement(this._idBorderStyle);

		this._wBorderWidth = new DwtSpinner({ parent: this, size: 3, min: 0, max: 10 });
		this._wBorderWidth.reparentHtmlElement(this._idBorderWidth);

		this._wTextAlign = new DwtSelect(this, [ new DwtSelectOption("", true, ZmMsg.notSet),
							 new DwtSelectOption("left", false, ZmMsg.left),
							 new DwtSelectOption("center", false, ZmMsg.center),
							 new DwtSelectOption("right", false, ZmMsg.right) ]);
		this._wTextAlign.reparentHtmlElement(this._idTextAlign);

		this._wTextVAlign = new DwtSelect(this, [ new DwtSelectOption("", false, ZmMsg.notSet),
							  new DwtSelectOption("top", false, ZmMsg.top),
							  new DwtSelectOption("middle", true, ZmMsg.middle),
							  new DwtSelectOption("bottom", false, ZmMsg.bottom) ]);
		this._wTextVAlign.reparentHtmlElement(this._idTextVAlign);
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

	ZmTableEditor.__makeCommonWidgets.call(this);

	this._wAlign = new DwtSelect(this, [ new DwtSelectOption("", true, ZmMsg.notSet),
					     new DwtSelectOption("center", false, ZmMsg.center),
					     new DwtSelectOption("left", false, ZmMsg.left),
					     new DwtSelectOption("right", false, ZmMsg.right) ]);
	this._wAlign.reparentHtmlElement(this._idAlign);

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

	this._wWidth = new DwtSpinner({ parent: this, size : 3, min: 0 });
	this._wWidth.reparentHtmlElement(this._idWidth);

	this._wWidthUnit = new DwtSelect(this, [ new DwtSelectOption("%", false, ZmMsg.percent),
						 new DwtSelectOption("px", true, ZmMsg.pixels) ]);
	this._wWidthUnit.reparentHtmlElement(this._idWidthUnit);

	this._wBorderSpacing = new DwtSpinner({ parent: this, size: 3, min: 0, max: 10 });
	this._wBorderSpacing.reparentHtmlElement(this._idBorderSpacing);

	this._wCellPadding = new DwtSpinner({ parent: this, size: 3, min: 0, max: 10 });
	this._wCellPadding.reparentHtmlElement(this._idCellPadding);

	document.getElementById(this._idWidthAuto).onclick = AjxCallback.simpleClosure(this._setManualWidthState, this);
	document.getElementById(this._idWidthAuto1).onclick = AjxCallback.simpleClosure(this._setManualWidthState, this);

	this.registerCallback(DwtDialog.OK_BUTTON, this._onOK, this);
	this.registerCallback(DwtDialog.CANCEL_BUTTON, this._onCancel, this);
	this.registerCallback(ZmTablePropsDialog.ADVANCED_BUTTON, this._onAdvanced, this);
};

ZmTablePropsDialog.prototype = new DwtDialog;
ZmTablePropsDialog.prototype.constructor = ZmTablePropsDialog;

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
	document.getElementById(this._idBorderCollapse).checked = /collapse/i.test(borderCollapse);
};

ZmTablePropsDialog.prototype._setManualWidthState = function() {
	var auto = document.getElementById(this._idWidthAuto).checked;
	this._wWidth.setEnabled(!auto);
	this._wWidthUnit.setEnabled(!auto);
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
		color           : this._wFgColor.getColor(),
		backgroundColor : this._wBgColor.getColor(),
		borderWidth     : this._wBorderWidth.getValue(),
		borderColor     : this._wBorderColor.getColor(),
		borderStyle     : this._wBorderStyle.getValue(),
		borderCollapse  : document.getElementById(this._idBorderCollapse).checked ? "collapse" : "",
		cellPadding     : this._wCellPadding.getValue(),
		cellSpacing     : this._wBorderSpacing.getValue()
	};
	return val;
};

// cell properties dialog

ZmCellPropsDialog.URL = appContextPath + "/js/zimbraMail/share/view/htmlEditor/dlg-cell-properties.html";

function ZmCellPropsDialog(parent) {
	DwtDialog.call(this, parent, null, ZmMsg.cellProperties,
		       [ DwtDialog.OK_BUTTON,
			 DwtDialog.CANCEL_BUTTON ]);

	this._disableFFhack();

	var ids;
	var html;

	ids = ZmTableEditor.getDialogLayout(ZmCellPropsDialog.URL);
	html = ids.html;
	ids = ids.ids;

	for (var i in ids)
		this["_id" + i] = ids[i];

	this.setContent(html);

	ZmTableEditor.__makeCommonWidgets.call(this);

	var table = this.getPreviewGridHolder();
	table.onmousemove = table.onmousedown =
		AjxCallback.simpleClosure(this._gridMouseEvent, this);
	table.onmouseout = AjxCallback.simpleClosure(Dwt.delClass, Dwt, table, "Cursor-Pointer");
};

ZmCellPropsDialog.prototype = new DwtDialog;
ZmCellPropsDialog.prototype.constructor = ZmCellPropsDialog;

ZmCellPropsDialog.BORDER_TOP    = 0;
ZmCellPropsDialog.BORDER_MIDDLE = 1;
ZmCellPropsDialog.BORDER_BOTTOM = 2;
ZmCellPropsDialog.BORDER_LEFT   = 3;
ZmCellPropsDialog.BORDER_CENTER = 4;
ZmCellPropsDialog.BORDER_RIGHT  = 5;

ZmCellPropsDialog.prototype.getPreviewGridHolder = function() {
	return document.getElementById(this._idPreviewGridHolder);
};

ZmCellPropsDialog.prototype.getPreviewGrid = function() {
	return document.getElementById(this._idPreviewGrid);
};

ZmCellPropsDialog.prototype.setup = function(editor, table) {
	// for some reason we need to reset this here, otherwise the dialog
	// won't properly display a second time (and generates an error in IE)
	// :-/  Calling this.reset() would null _loc, but would also clear
	// button-press event handlers, which we don't want to happen.
	this._loc = null;

	var grid = this.getPreviewGrid();
	grid.style.border = "1px dashed #ccc";
	var tds = grid.getElementsByTagName("td");
	for (var i = 0; i < tds.length; ++i)
		tds[i].style.border = "1px dashed #ccc";

	this._editor = editor;
	this._table = table;

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

	var best_h = this._pickBestBorder(evpos.y, ZmCellPropsDialog.BORDER_TOP, 4,
					  gpos.y + this._grid_getBorderWidth(ZmCellPropsDialog.BORDER_TOP) / 2,
					  ipos.y - this._grid_getBorderWidth(ZmCellPropsDialog.BORDER_MIDDLE) / 2,
					  rpos.y - this._grid_getBorderWidth(ZmCellPropsDialog.BORDER_BOTTOM) / 2);

	var best_v = this._pickBestBorder(evpos.x, ZmCellPropsDialog.BORDER_LEFT, 4,
					  gpos.x + this._grid_getBorderWidth(ZmCellPropsDialog.BORDER_LEFT) / 2,
					  ipos.x - this._grid_getBorderWidth(ZmCellPropsDialog.BORDER_CENTER) / 2,
					  rpos.x - this._grid_getBorderWidth(ZmCellPropsDialog.BORDER_RIGHT) / 2);

	if (/mousedown/i.test(dwtev.type)) {
		// mouse clicked, therefore act.
		this._grid_applyBorderStyles(best_h);
		this._grid_applyBorderStyles(best_v);

		if ((best_h != null || best_v != null) && AjxEnv.isGeckoBased) {
			grid.style.display = "none";
			setTimeout(function() { grid.style.display = ""; }, 1);
		}
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
	    case ZmCellPropsDialog.BORDER_TOP:
		return parseInt(grid.style.borderTopWidth);
	    case ZmCellPropsDialog.BORDER_MIDDLE:
		return parseInt(grid.rows[0].cells[0].style.borderBottomWidth);
	    case ZmCellPropsDialog.BORDER_BOTTOM:
		return parseInt(grid.style.borderBottomWidth);

	    case ZmCellPropsDialog.BORDER_LEFT:
		return parseInt(grid.style.borderLeftWidth);
	    case ZmCellPropsDialog.BORDER_CENTER:
		return parseInt(grid.rows[0].cells[0].style.borderRightWidth);
	    case ZmCellPropsDialog.BORDER_RIGHT:
		return parseInt(grid.style.borderRightWidth);
	}
};

ZmCellPropsDialog.prototype._grid_applyBorderStyles = function(border) {
	var els = [];
	var grid = this.getPreviewGrid();
	switch (border) {
	    case ZmCellPropsDialog.BORDER_TOP:
		els.push({ el: grid, b: "borderTop" },
			 { el: grid.rows[0].cells[0], b: "borderTop" },
			 { el: grid.rows[0].cells[1], b: "borderTop" });
		break;

	    case ZmCellPropsDialog.BORDER_MIDDLE:
		els.push({ el: grid.rows[0].cells[0], b: "borderBottom" },
			 { el: grid.rows[0].cells[1], b: "borderBottom" },
			 { el: grid.rows[1].cells[0], b: "borderTop" },
			 { el: grid.rows[1].cells[1], b: "borderTop" });
		break;

	    case ZmCellPropsDialog.BORDER_BOTTOM:
		els.push({ el: grid, b: "borderBottom" },
			 { el: grid.rows[1].cells[0], b: "borderBottom" },
			 { el: grid.rows[1].cells[1], b: "borderBottom" });
		break;

	    case ZmCellPropsDialog.BORDER_LEFT:
		els.push({ el: grid, b: "borderLeft" },
			 { el: grid.rows[0].cells[0], b: "borderLeft" },
			 { el: grid.rows[1].cells[0], b: "borderLeft" });
		break;

	    case ZmCellPropsDialog.BORDER_CENTER:
		els.push({ el: grid.rows[0].cells[0], b: "borderRight" },
			 { el: grid.rows[0].cells[1], b: "borderLeft" },
			 { el: grid.rows[1].cells[0], b: "borderRight" },
			 { el: grid.rows[1].cells[1], b: "borderLeft" });
		break;

	    case ZmCellPropsDialog.BORDER_RIGHT:
		els.push({ el: grid, b: "borderRight" },
			 { el: grid.rows[0].cells[1], b: "borderRight" },
			 { el: grid.rows[1].cells[1], b: "borderRight" });
		break;
	}

	var s = this._grid_borderStyles[border];
	var new_style = {
	    width : this._wBorderWidth.getValue() + "px",
	    color : this._wBorderColor.getColor(),
	    style : this._wBorderStyle.getValue()
	};
	if (s == null
	    || s.width != new_style.width
	    || s.color != new_style.color
	    || s.style != new_style.style)
	{
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
