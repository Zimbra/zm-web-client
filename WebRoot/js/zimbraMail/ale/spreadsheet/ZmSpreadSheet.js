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

/**
 * A SpreadSheet Widget.
 * @author Mihai Bazon, <mihai@zimbra.com>
 */
ZmSpreadSheet = function(parent, className, posStyle, deferred) {
	if (arguments.length == 0)
		return;
	className = className || "ZmSpreadSheet";
	DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle, deferred:deferred});

	// WARNING: the mousemove handler is a crazy workaround to the fact
	// that the range DIV blocks events from reaching the table element.
	// So upon mouseover, we hide it for about 10 milliseconds; during this
	// timeout the table will catch on mouseover-s.  Produces a short
	// flicker :-(  I donno how to work around this...
	var footimeout = null;
	this._selectRangeCapture = new DwtMouseEventCapture({
		targetObj:this,
		id:"ZmSpreadSheet",
		mouseOverHdlr:AjxCallback.simpleClosure(this._table_selrange_MouseOver, this),
		mouseMoveHdlr:
			// mousemove handler (see warning above)
			AjxCallback.simpleClosure(function(ev) {
				var self = this;
				if (footimeout)
					clearTimeout(footimeout);
				footimeout = setTimeout(function() {
					self._getRangeDiv().style.display = "none";
					setTimeout(function() {
						self._getRangeDiv().style.display = "";
					}, 1);
				}, 50);
			}, this),
		mouseUpHdlr:AjxCallback.simpleClosure(this._clear_selectRangeCapture, this)
	});

	this._colsizeCapture = new DwtMouseEventCapture({
		targetObj:this,
		id:"ZmSpreadSheet",
		mouseMoveHdlr:AjxCallback.simpleClosure(this._colsize_mouseMove, this),
		mouseUpHdlr:AjxCallback.simpleClosure(this._colsize_mouseUp, this)
	});

	this._onResize = new AjxListener(this, this._onResize);
	this._hoverOverListener = new AjxListener(this, this._handleOverListener);
	this._hoverOutListener = new AjxListener(this, this._handleOutListener);
	this.addControlListener(this._onResize);
	this.onSelectCell = [];
	this.onInputModified = [];

// 	this.ROWS = 5;
// 	this.COLS = 5;

// 	this._init();
};

ZmSpreadSheet.TOOLTIP_DELAY = 750;

// custom HTML attributes for our data
// ZmSpreadSheet.ATTR = {
// 	EDIT  : "ZmSpreadSheet-edit",    // the value edited by the end-user
// 	VALUE : "ZmSpreadSheet-value"    // the computed value (which is actually displayed)
// };

ZmSpreadSheet.prototype = new DwtComposite;
ZmSpreadSheet.prototype.construction = ZmSpreadSheet;

ZmSpreadSheet.getCellName = function(td) {
	return ZmSpreadSheetModel.getCellName(td.parentNode.rowIndex, td.cellIndex);
};

ZmSpreadSheet.prototype.setModel = function(model) {
	model.reset();
	this._model = model;

	this._init();

//	model.setViewListener("onCellEdit", new AjxCallback(this, this._model_cellEdited));
	model.setViewListener("onCellValue", new AjxCallback(this, this._model_cellComputed));
	model.setViewListener("onInsertRow", new AjxCallback(this, this._model_insertRow));
	model.setViewListener("onInsertCol", new AjxCallback(this, this._model_insertCol));
	model.setViewListener("onDeleteRow", new AjxCallback(this, this._model_deleteRow));
	model.setViewListener("onDeleteCol", new AjxCallback(this, this._model_deleteCol));
};

ZmSpreadSheet.prototype._model_cellEdited = function(row, col, cell) {
	var td = this._getTable().rows[row].cells[col];
	cell.setToElement(td);
};

ZmSpreadSheet.prototype._model_cellComputed = function(row, col, cell) {
	var td = this._getTable().rows[row].cells[col];
	cell.setToElement(td);
};

ZmSpreadSheet.prototype._model_deleteRow = function(rowIndex) {
	this._hideRange();
	var selected = this._selectedCell;
	this._selectCell();
	var pos_x = selected.cellIndex;
	var pos_y = selected.parentNode.rowIndex;
	var rows = this._getTable().rows;
	var tr = rows[rows.length - 1];
	tr.removeChild(tr.firstChild);
	++rowIndex;
	for (var i = rows.length; --i > rowIndex;) {
		var node = rows[i - 1].firstChild;
		rows[i].insertBefore(node, rows[i].firstChild);
	}
	var tr = rows[i];
	tr.parentNode.removeChild(tr);
	// rows = this._getTable().rows; // is this updated? in all browsers?
	if (pos_y >= rows.length)
		--pos_y;
	this._selectCell(rows[pos_y].cells[pos_x]);
};

ZmSpreadSheet.prototype._model_deleteCol = function(colIndex) {
	this._hideRange();
	var selected = this._selectedCell;
	this._selectCell();
	var pos_x = selected.cellIndex;
	var pos_y = selected.parentNode.rowIndex;
	var rows = this._getTable().rows;
	for (var i = 1; i < rows.length; ++i) {
		var tr = rows[i];
		var td = tr.cells[colIndex + 1];
		tr.removeChild(td);
	}
	tr = rows[0];
	tr.removeChild(tr.cells[tr.cells.length - 1]);
	if (pos_x >= tr.cells.length)
		--pos_x;
	this._header_resetColWidths();
	this._selectCell(rows[pos_y].cells[pos_x]);
};

ZmSpreadSheet.prototype._model_insertRow = function(cells, rowIndex) {
	this._hideRange();
	var selected = this._selectedCell;
	this._selectCell();
	var rows = this._getTable().rows;
	var row = this._getTable().insertRow(rowIndex + 1); // add 1 to skip the header row
	// (1) update numbering in the left-bar header
	var is_last_row = true;
	for (var i = row.rowIndex; i < rows.length - 1; ++i) {
		var node = rows[i + 1].firstChild;
		var tmp = node;
		if (i == rows.length - 2) {
			node = node.cloneNode(true);
			tmp.firstChild.innerHTML = i + 1;
		}
		rows[i].insertBefore(node, rows[i].firstChild);
		is_last_row = false;
	}
	if (is_last_row) {
		var td = row.insertCell(0);
		td.className = "LeftBar";
		td.innerHTML = "<div>" + (rowIndex + 1) + "</div>";
	}
	// (2) create element cells and inform the model cells about them
	for (var i = 0; i < cells.length; ++i) {
		var td = row.insertCell(i + 1);
		td.className = "cell";
		cells[i]._td = td;
		cells[i].setToElement(td);
	}
	this._selectCell(selected);
};

ZmSpreadSheet.prototype._model_insertCol = function(cells, colIndex) {
	this._hideRange();
	var selected = this._selectedCell;
	this._selectCell();
	var rows = this._getTable().rows;
	// (1) update labels in the top-bar header
	var row = rows[0];
	var td = row.insertCell(colIndex + 1);
	td.innerHTML = "<div></div>";
	for (var i = colIndex + 1; i < row.cells.length; ++i)
		row.cells[i].firstChild.innerHTML = ZmSpreadSheetModel.getColName(i);
	// (2) create element cells and inform the model cells about them
	for (var i = 0; i < cells.length; ++i) {
		row = rows[i + 1];
		var td = row.insertCell(colIndex + 1);
		td.className = "cell";
		cells[i]._td = td;
		cells[i].setToElement(td);
	}
	this._header_resetColWidths();
	this._selectCell(selected);
};

ZmSpreadSheet.prototype.getCellModel = function(td) {
	return this._model.getCell(td.parentNode.rowIndex, td.cellIndex);
};

ZmSpreadSheet.prototype._init = function() {
	var html = [];
	var was_initialized = true;
	if (!this._relDivID) {
		was_initialized = false;
		this._relDivID = Dwt.getNextId();
		html.push("<div id='", this._relDivID,
			  "' class='ZmSpreadSheet-RelDiv'>");
	}
	this._focusLinkID = Dwt.getNextId();
	this._tableID = Dwt.getNextId();

	// the "focus link" is our clever way to receive key events when the
	// "spreadsheet" is focused.  As usual, it requires some special bits
	// for IE (needs to have a href and some content in order to be
	// focusable).  It looks better in FF without these special bits.
	html.push("<a class='FocusLink' id='", this._focusLinkID, "'");
	if (AjxEnv.isIE)
		html.push(" href='#' onclick='return false'");
	html.push(">");
	if (AjxEnv.isIE)
		html.push("&nbsp;");
	html.push("</a>");

	html.push("<table class='SpreadSheet' id='", this._tableID, "' cellspacing='1' cellpadding='0' border='0'>");
	var row = [ "<tr><td class='LeftBar'></td>" ];

	var ROWS = this._model.ROWS;
	var COLS = this._model.COLS;

	this._inputFieldID = null;
	this._spanFieldID = null;

	for (var i = COLS; i > 0;)
		row[i--] = "<td class='cell'></td>";
	row[COLS+1] = "</tr>";

	row = row.join("");

	// one more row for the header
	for (var i = ROWS; i-- >= 0;)
		html[html.length] = row;
	html[html.length] = "</table>";

	if (!was_initialized) {
		html[html.length] = "</div>";
		var div = this.getHtmlElement();
		div.innerHTML = html.join("");
	} else {
		this._getRelDiv().innerHTML = html.join("");
	}

	var table = this._getTable();
	table.rows[0].className = "TopBar";
	table.rows[0].cells[0].className = "TopLeft";

	for (var i = 0; i < table.rows.length; ++i)
		table.rows[i].cells[0].innerHTML = "<div>" + i + "</div>";
	row = table.rows[0];
	for (var i = 1; i < row.cells.length; ++i)
		row.cells[i].innerHTML = "<div>" + ZmSpreadSheetModel.getColName(i) + "</div>";

	table.onmouseup = AjxCallback.simpleClosure(this._table_onMouseUp, this);
	table.onmousedown = AjxCallback.simpleClosure(this._table_onClick, this);
	table.onclick = AjxCallback.simpleClosure(this._table_onClick, this);
	table.ondblclick = AjxCallback.simpleClosure(this._table_onClick, this);
	table.onmousemove = AjxCallback.simpleClosure(this._table_mouseMove, this);
	table.onmouseout = AjxCallback.simpleClosure(this._table_mouseOut, this);

	var link = this._getFocusLink();
	link.onkeypress = AjxCallback.simpleClosure(this._focus_keyPress, this);
	if (AjxEnv.isIE || AjxEnv.isOpera)
		link.onkeydown = link.onkeypress;

	var header = document.createElement("table");
	header.cellSpacing = 1;
	header.cellPadding = 0;
	header.border = 0;
	header.id = this._headerID = Dwt.getNextId();
	header.className = "SpreadSheet Header";
	var hbody = document.createElement("tbody");
	header.appendChild(hbody);
	header.style.position = "absolute";
	header.style.left = "0px";
	header.style.top = "0px";
	this._getRelDiv().appendChild(header);

	header.onclick = table.onclick;	// hack ;-)
	header.onmousemove = AjxCallback.simpleClosure(this._header_onMouseMove, this);
	header.onmousedown = AjxCallback.simpleClosure(this._header_onMouseDown, this);

 	this._getRelDiv().onscroll = AjxCallback.simpleClosure(this._header_resetScrollTop, this);

	this.getHtmlElement().style.display = "none"; // things may be recomputed 1-2 times, let's disable refresh for better performance

	if (!this._model.version) {
		if (ZmSpreadSheetModel.DEBUG)
			console.log("Loading old spreadsheet file -- slower");
		for (var i = 0; i < ROWS; ++i) {
			var row = table.rows[i + 1];
			for (var j = 0; j < COLS; ++j)
				this._model.data[i][j]._td = row.cells[j + 1];
		}
	}

	this._model.doneSetView();

	for (var i = 0; i < ROWS; ++i) {
		var row = table.rows[i + 1];
		for (var j = 0; j < COLS; ++j) {
			var mc = this._model.data[i][j];
			var td = mc._td = row.cells[j + 1];
			mc._savedRow = mc._savedCol = null;
			mc.setToElement(td);
		}
	}

	this.getHtmlElement().style.display = "";
	this._header_resetColWidths();
};

// called when a cell from the top header was clicked or mousedown
ZmSpreadSheet.prototype._topCellClicked = function(td, ev) {
	if (/click/i.test(ev.type)) {
		var col = td.cellIndex;
		this._selectCell(this._getTable().rows[td.parentNode.rowIndex + 1].cells[col]);
		var col = ZmSpreadSheetModel.getColName(col);
		var c1 = col + "1";
		var c2 = col + this._model.ROWS;
		this._selectRange(c1, c2);
	}
};

// called when a cell from the left header was clicked or mousedown
ZmSpreadSheet.prototype._leftCellClicked = function(td, ev) {
	if (/click/i.test(ev.type)) {
		var row = td.parentNode.rowIndex;
		this._selectCell(this._getTable().rows[row].cells[td.cellIndex + 1]);
		var c1 = "A" + row;
		var c2 = ZmSpreadSheetModel.getColName(this._model.COLS) + row;
		this._selectRange(c1, c2);
	}
};

// called when the top-left cell was clicked or mousedown (TODO: do we do anything here?)
ZmSpreadSheet.prototype._topLeftCellClicked = function(td, ev) {
	var c1 = "A1";
	var c2 = ZmSpreadSheetModel.getColName(this._model.COLS) + this._model.ROWS;
	this.focus();
	this._selectRange(c1, c2, true);
};

// called for all other cells; normally we display an input field here and
// allow one to edit cell contents
ZmSpreadSheet.prototype._cellClicked = function(td, ev) {
	var is_mousedown = /mousedown/i.test(ev.type);
	this._hideRange();
	this._selectCell(td);
	// <BUG 9037>
	if (AjxEnv.isIE && DwtMenu._activeMenu)
		DwtMenu._activeMenu.popdown();
	// </BUG>
	if (is_mousedown) {
		var stopEvent = true;
		if (this._editingCell && this._hasExpression) {
			var input = this._getInputField();
			var start = Dwt.getSelectionStart(input);
			var str = input.value.substr(0, start);
			if (/\)\s*$/.test(str))
				stopEvent = false;
			else
				this._updateCellRangeToken();
		} else
			this.focus();
		if (stopEvent) {
			ev._stopPropagation = true;
			ev._returnValue = false;
			this._selectRangeCapture.capture();
		}
	}
	if (/dblclick/i.test(ev.type)) {
		ev._stopPropagation = true;
		ev._returnValue = false;
		this._editCell(td);
	}
};

ZmSpreadSheet.prototype.focus = function() {
	if (!this._selectedCell)
		this._selectCell(this._getTable().rows[1].cells[1]);
	// this link will intercept keybindings.  Clever, huh? B-)
	this._getFocusLink().focus();
	window.status = ""; // Clear the statusbar for IE's smart ass
};

ZmSpreadSheet.prototype._getTopLeftCell = function() {
	return this._getHeaderTable().rows[0].cells[0];
};

ZmSpreadSheet.prototype._getTopHeaderCell = function(td) {
	return this._getHeaderTable().rows[0].cells[td.cellIndex];
};

ZmSpreadSheet.prototype._getLeftHeaderCell = function(td) {
	var cell = null;
	var table = this._getTable();
	var rows = (table && table.rows)? table.rows : null;
	var rowIndex = (td && td.parentNode)? td.parentNode.rowIndex : 0;
	return (rows ? rows[rowIndex][0] : null);
};

ZmSpreadSheet.prototype._colsize_mouseMove = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	var delta = dwtev.docX - this._colsizeArgs.docX;
	var fuzz = AjxEnv.isIE ? 0 : -2;
	var OK = true;
	if (this._resizeColStart) {
		var w1 = this._colsizeArgs.w1 - delta + fuzz;
		var w2 = this._colsizeArgs.w2 + delta + fuzz;
		if (w1 > 7 && w2 > 7) {
			this._colsizeArgs.td1.firstChild.style.width = w1 + "px";
			this._colsizeArgs.td2.firstChild.style.width = w2 + "px";
		} else
			OK = false;
	} else {
		var w1 = this._colsizeArgs.w1 + delta + fuzz;
		if (w1 > 7)
			this._colsizeArgs.td1.firstChild.style.width = w1 + "px";
		else
			OK = false;
	}
	if (OK)
		this._colsizeArgs.delta = delta;
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._colsize_mouseUp = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	this._colsizeCapture.release();
	var w;
	var delta = this._colsizeArgs.delta;
	if (delta) {
		var index = this._resizeColIndex;
		if (this._resizeColStart) {
			w = this._model.getColWidth(index - 1);
			this._model.setColWidth(index - 1, w - delta);
			w = this._model.getColWidth(index - 2);
			this._model.setColWidth(index - 2, w + delta);
		} else {
			w = this._model.getColWidth(index - 1);
			this._model.setColWidth(index - 1, w + delta);
		}
	}
	// null out some things to make sure we don't leak
	this._colsizeArgs.td1 = null;
	this._colsizeArgs.td2 = null;
	this._colsizeArgs = null;
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._header_onMouseDown = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	if (this._resizeColIndex) {
		this._hideRange();
		var td = this._getHeaderTable().rows[0].cells[this._resizeColIndex];
		this._colsizeArgs = {
			td1       : td,
			w1        : td.firstChild.offsetWidth,
			docX      : dwtev.docX,
			docY      : dwtev.docY
		};
		var dir = this._resizeColStart ? -1 : +1;
		td = this._getHeaderTable().rows[0].cells[this._resizeColIndex + dir];
		if (td) {
			this._colsizeArgs.td2 = td;
			this._colsizeArgs.w2 = td.firstChild.offsetWidth;
		}
		this._colsizeCapture.capture();
		dwtev._stopPropagation = true;
		dwtev._returnValue = false;
	}
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._header_onMouseMove = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	var table = this._getHeaderTable();
	var td = DwtUiEvent.getTarget(dwtev);
	while (td && td !== table && !/^td$/i.test(td.tagName))
		td = td.parentNode;
	if (td && /^td$/i.test(td.tagName)) {
		var index = td.cellIndex;
		if (index > 0) {
			var row = td.parentNode;
			var cells = row.cells;
			var tmp = Dwt.getLocation(this._getRelDiv());
			var tdX = dwtev.docX - tmp.x - td.offsetLeft + this._getRelDiv().scrollLeft;
			if (Math.abs(tdX - td.offsetWidth) < 5) {
				this._resizeColIndex = index;
				this._resizeColStart = false;
				Dwt.delClass(table, "Header-ColWSize", "Header-ColESize");
			} else if (tdX < 5 && index > 1) {
				this._resizeColIndex = index;
				this._resizeColStart = true;
				Dwt.delClass(table, "Header-ColESize", "Header-ColWSize");
			} else {
				this._resizeColIndex = null;
				Dwt.delClass(table, "Header-ColWSize");
				Dwt.delClass(table, "Header-ColESize");
			}
		}
	} else {
// 		Dwt.delClass(table, "Header-ColWSize");
// 		Dwt.delClass(table, "Header-ColESize");
	}
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._header_resetColWidths = function() {
	var table = this._getTable();
	var header = this._getHeaderTable();
	if (header.rows.length > 0)
		header.deleteRow(0);
	header.firstChild.appendChild(table.rows[0].cloneNode(true));
	var a = table.rows[0].cells;
	var b = header.rows[0].cells;
	var fuzz = AjxEnv.isIE ? 0 : -2;
	for (var i = 0; i < a.length; ++i) {
		b[i].firstChild.style.width = a[i].firstChild.offsetWidth + fuzz + "px";
	}
};

ZmSpreadSheet.prototype._header_resetScrollTop = function() {
	this._getHeaderTable().style.top = this._getRelDiv().scrollTop + "px";
};

ZmSpreadSheet.prototype._selectCell = function(td) {
	if (this._selectedCell) {
		Dwt.delClass(this._getTopHeaderCell(this._selectedCell), "TopSelected");
		Dwt.delClass(this._getLeftHeaderCell(this._selectedCell), "LeftSelected");
		Dwt.delClass(this._selectedCell, "SSelected");
	}
	this._selectedCell = td;
	if (td) {
		Dwt.addClass(td, "SSelected");
		Dwt.addClass(this._getTopHeaderCell(td), "TopSelected");
		Dwt.addClass(this._getLeftHeaderCell(td), "LeftSelected");
		this._getTopLeftCell().innerHTML = "<div>" + ZmSpreadSheet.getCellName(td) + "</div>";
		var link = this._getFocusLink();
		link.style.top = td.offsetTop + "px";
		link.style.left = td.offsetLeft + "px";
		if (!this._editingCell)
			this.focus();
		link.style.top = td.offsetTop + td.offsetHeight - 1 + "px";
		link.style.left = td.offsetLeft + td.offsetWidth - 1 + "px";
		if (!this._editingCell) {
			this.focus();
			for (var i = this.onSelectCell.length; --i >= 0;)
				this.onSelectCell[i].run(this.getCellModel(td), td);
		}
	}
};

ZmSpreadSheet.prototype._getHeaderTable = function() {
	return document.getElementById(this._headerID);
};

ZmSpreadSheet.prototype._getRelDiv = function() {
	return document.getElementById(this._relDivID);
};

ZmSpreadSheet.prototype._getFocusLink = function() {
	return document.getElementById(this._focusLinkID);
};

ZmSpreadSheet.prototype._input_setValue = function(val) {
	var input = this._getInputField();
	input.value = val;
	for (var i = this.onInputModified.length; --i >= 0;)
		this.onInputModified[i].run(val);
};

ZmSpreadSheet.prototype._getInputField = function() {
	var input = null;
	if (this._inputFieldID)
		input = document.getElementById(this._inputFieldID);
	if (!input) {
		var div = this._getRelDiv();
		input = document.createElement("input");
		this._inputFieldID = input.id = Dwt.getNextId();
		input.setAttribute("autocomplete", "off");
		input.type = "text";
		input.className = "InputField";
		input.style.left = "0px";
		input.style.top = "0px";
		input.style.visibility = "hidden";
		div.appendChild(input);

		// set event handlers
		input[(AjxEnv.isIE || AjxEnv.isOpera) ? "onkeydown" : "onkeypress"]
			= AjxCallback.simpleClosure(this._input_keyPress, this);
		// input.onmousedown = AjxCallback.simpleClosure(this._input_mouseUp, this);
		input.onmouseup = AjxCallback.simpleClosure(this._input_mouseUp, this);
		input.onblur = AjxCallback.simpleClosure(this._input_blur, this);
		input.onfocus = AjxCallback.simpleClosure(this._input_focus, this);
		input.setValue = AjxCallback.simpleClosure(this._input_setValue, this);
	}
	return input;
};

ZmSpreadSheet.prototype._getSpanField = function() {
	var span = null;
	if (this._spanFieldID)
		span = document.getElementById(this._spanFieldID);
	if (!span) {
		// we're using this hidden element in order to determine the
		// width of the input field while it is edited
		var span = document.createElement("span");
		this._spanFieldID = span.id = Dwt.getNextId();
		span.className = "InputField";
		var div = this._getRelDiv();
		div.appendChild(span);
	}
	return span;
};

ZmSpreadSheet.prototype._editCell = function(td) {
	this._shiftRangeStart = null;
	var input = this._getInputField();
	if (this._editingCell)
		input.blur();
	if (td) {
		this._selectCell(td);
		input.style.visibility = "";
		input.style.top = td.offsetTop - 1 + "px";
		input.style.left = td.offsetLeft - 1 + "px";
		input.style.width = td.offsetWidth + 2 + "px";
		input.style.height = td.offsetHeight + 2 + "px";
		var mc = this.getCellModel(td);
		input.setValue(mc.getEditValue());
		input._caretMoved = false;
		input.select();
		input.focus();
		this._editingCell = td;
		mc.setStyleToElement(input, true);
		this._displayRangeIfAny();
		// quick hack to set the field size from the start
		this._input_keyPress();
	}
};

ZmSpreadSheet.prototype._input_blur = function(ev) {
	this._shiftRangeStart = null;
	var input = this._getInputField();
	input.style.visibility = "hidden";
	input.style.left = 0;
	input.style.top = 0;
	input.style.width = "";
	if (!this._preventSaveOnBlur)
		this._save_value(input.value);
	this._editingCell = null;
	this._hideRange();
};

// In Firefox the input field loses focus when the whole document lost focus
// (i.e. tab change).  Then if you return to that tab, the input field regains
// focus but remains hidden in the top-left corner, so we re-edit the cell here
ZmSpreadSheet.prototype._input_focus = function(ev) {
	var input = this._getInputField();
	if (input.style.visibility == "hidden" && this._selectedCell)
		this._editCell(this._selectedCell);
};

ZmSpreadSheet.prototype._save_value = function(origval) {
	this.getCellModel(this._editingCell).setEditValue(origval);
};

ZmSpreadSheet.prototype._getNextCell = function(td) {
	if (td == null)
		td = this._editingCell || this._selectedCell;
	var row = td.parentNode;
	if (td.cellIndex < row.cells.length - 1)
		return row.cells[td.cellIndex + 1];
	var body = this._getTable();
	if (row.rowIndex < body.rows.length - 1)
		return body.rows[row.rowIndex + 1].cells[1];
	return null;
};

ZmSpreadSheet.prototype._getPrevCell = function(td) {
	if (td == null)
		td = this._editingCell || this._selectedCell;
	var row = td.parentNode;
	if (td.cellIndex > 1)
		return row.cells[td.cellIndex - 1];
	var body = this._getTable();
	if (row.rowIndex > 1) {
		row = body.rows[row.rowIndex - 1];
		return row.cells[row.cells.length - 1];
	}
	return null;
};

ZmSpreadSheet.prototype._getDownCell = function(td) {
	if (td == null)
		td = this._editingCell || this._selectedCell;
	var row = td.parentNode;
	var body = this._getTable();
	if (row.rowIndex < body.rows.length - 1) {
		row = body.rows[row.rowIndex + 1];
		return row.cells[td.cellIndex];
	}
	return null;
};

ZmSpreadSheet.prototype._getUpCell = function(td) {
	if (td == null)
		td = this._editingCell || this._selectedCell;
	var row = td.parentNode;
	var body = this._getTable();
	if (row.rowIndex > 1) {
		row = body.rows[row.rowIndex - 1];
		return row.cells[td.cellIndex];
	}
	return null;
};

ZmSpreadSheet.prototype._getRightCell = function(td) {
	if (td == null)
		td = this._editingCell || this._selectedCell;
	var row = td.parentNode;
	if (td.cellIndex < row.cells.length - 1)
		return row.cells[td.cellIndex + 1];
	return null;
};

ZmSpreadSheet.prototype._getLeftCell = function(td) {
	if (td == null)
		td = this._editingCell || this._selectedCell;
	var row = td.parentNode;
	if (td.cellIndex > 1)
		return row.cells[td.cellIndex - 1];
	return null;
};

ZmSpreadSheet.prototype._focus_handleKey = function(dwtev, ev) {
	var needs_keypress = AjxEnv.isIE || AjxEnv.isOpera;
	this.focus();
	var handled = true;
	var is_movement = false;
	var old_sel = this._selectedCell;
	switch (dwtev.keyCode) {
	    case 9: // TAB
		var td = dwtev.shiftKey
			? this._getPrevCell()
			: this._getNextCell();
		if (td)
			this._selectCell(td);
		break;

	    case 37: // LEFT
	    case 39: // RIGHT
		var td = dwtev.keyCode == 37
			? this._getLeftCell()
			: this._getRightCell();
		if (td) {
			this._selectCell(td);
			is_movement = true;
		}
		break;

	    case 38: // UP
	    case 13: // ENTER
	    case 40: // DOWN
		var td = (dwtev.keyCode == 13
			  ? ( dwtev.shiftKey
			      ? this._getUpCell()
			      : this._getDownCell())
			  : ( dwtev.keyCode == 38
			      ? this._getUpCell()
			      : this._getDownCell()));
		if (td) {
			this._selectCell(td);
			is_movement = dwtev.keyCode != 13;
		}
		break;

	    case 113: // F2
		this._editCell(this._selectedCell);
		break;

	    case 46: // DEL
		if (this._selectedRangeName) {
			this._model.forEachCell(this._selectedRangeName,
						function(cell) {
							if (dwtev.isCommand())
								cell.clearAll();
							else
								cell.clearValue();
						});
		}
		// the selected cell _can_ be outside the selected range. ;-)
		// let's clear that too.
		this.getCellModel(this._selectedCell).clearValue();
		break;

	    case 27:
		this._hideRange();
		break;

	    default:
		if (!dwtev.isCommand() && ( (!needs_keypress && ev.charCode) ||
					    (needs_keypress && /keypress/i.test(dwtev.type)))) {
			var val = String.fromCharCode(dwtev.charCode);
// 			// FIXME: this sucks.  Isn't there any way to determine
// 			// if some character is a printable Unicode character? :(
// 			if (/[`~\x5d\x5ba-zA-Z0-9!@#$%^&*(),.<>\/?;:\x22\x27{}\\|+=_-]/.test(val)) {
			this._editCell(this._selectedCell);
			// Workaround for IE: all codes reported are uppercase.
			// Should find something better. :-|
// 			if (AjxEnv.isIE && !dwtev.shiftKey)
// 				val = val.toLowerCase();
			this._getInputField().setValue(val);
			Dwt.setSelectionRange(this._getInputField(), 1, 1);
		} else
			handled = false;
	}
	if (!handled) {
		switch (String.fromCharCode(dwtev.charCode).toLowerCase()) {

		    case "c":	// COPY
			if (dwtev.isCommand()) {
				handled = true;
				this.clipboardCopy();
			}
			break;

		    case "x":	// CUT
			if (dwtev.isCommand()) {
				handled = true;
				this.clipboardCut();
			}
			break;

		    case "v":	// PASTE
			if (dwtev.isCommand()) {
				handled = true;
				this.clipboardPaste();
			}
			break;

		}
	}
	if (handled) {
		dwtev._stopPropagation = true;
		dwtev._returnValue = false;
	}
	if (is_movement) {
		if (dwtev.shiftKey && !this._shiftRangeStart)
			this._shiftRangeStart = old_sel;
		else if (!dwtev.shiftKey) {
			this._shiftRangeStart = null;
			this._hideRange();
		}
		if (this._shiftRangeStart) {
			// we select the range between _shiftRangeStart and _selectedCell
			this._selectRange(ZmSpreadSheet.getCellName(this._shiftRangeStart),
					  ZmSpreadSheet.getCellName(this._selectedCell), false);
		}
	}
	return handled;
};

ZmSpreadSheet.prototype._focus_keyPress = function(ev) {
	this._clearTooltip();
	ev || (ev = window.event);
	var dwtev = new DwtKeyEvent();
	dwtev.setFromDhtmlEvent(ev);
	this._focus_handleKey(dwtev, ev);
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._input_mouseUp = function() {
	this._displayRangeIfAny();
};

ZmSpreadSheet.prototype._input_keyPress = function(ev) {
	ev || (ev = window.event);
	var setTimer = true;
	if (ev) {
		var dwtev = new DwtKeyEvent();
		dwtev.setFromDhtmlEvent(ev);
		var input = this._getInputField();
		this._preventSaveOnBlur = true;	// we're saving manually when it's the case.
		switch (ev.keyCode) {

		    case 9: // TAB
			setTimer = false;
			this._save_value(input.value);
			input.blur();
			this._focus_handleKey(dwtev, ev);
			break;

		    case 37: // LEFT
		    case 39: // RIGHT
			var doit = ( !input._caretMoved &&
				     ( (Dwt.getSelectionStart(input) == 0 && dwtev.keyCode == 37) ||
				       (Dwt.getSelectionEnd(input) == input.value.length && dwtev.keyCode == 39) ) );
			if (doit || !input.value || ev.altKey) {
				setTimer = false;
				this._save_value(input.value);
				input.blur();
				this._focus_handleKey(dwtev, ev);
			} else
				input._caretMoved = true;
 			break;

		    case 38: // UP
		    case 13: // ENTER
		    case 40: // DOWN
			setTimer = false;
			this._save_value(input.value);
			input.blur();
			this._focus_handleKey(dwtev, ev);
			break;

		    case 27: // ESC
			setTimer = false;
			if (AjxEnv.isIE) {
				var mc = this.getCellModel(this._editingCell);
				input.setValue(mc.getEditValue());
			}
			this.focus();
			break;

		    case 113: // F2 -- select all
			Dwt.setSelectionRange(input, 0, input.value.length);
			break;

		}
		dwtev.setToDhtmlEvent(ev);
		this._preventSaveOnBlur = false;
	}
	if (setTimer) {
		if (this._input_keyPress_timer)
			clearTimeout(this._input_keyPress_timer);
		var self = this;
		this._input_keyPress_timer = setTimeout(function() {
			var span = self._getSpanField();
			var input = self._getInputField();
			span.innerHTML = "";
			span.appendChild(document.createTextNode(input.value));
			if (span.offsetWidth > (input.offsetWidth - 20))
				input.style.width = span.offsetWidth + 50 + "px";
			self._input_keyPress_timer = null;
			self._displayRangeIfAny();
			for (var i = self.onInputModified.length; --i >= 0;)
				self.onInputModified[i].run(input.value);
		}, 10);
	} else
		this._hideRange();
};

ZmSpreadSheet.prototype._selectRange = function(c1, c2, showSingleCell) {
	this._selectedRangeName = null;
	var show = showSingleCell || (c1.toLowerCase() != c2.toLowerCase());
	c1 = ZmSpreadSheetModel.identifyCell(c1);
	c2 = ZmSpreadSheetModel.identifyCell(c2);
	if (show && c1 && c2) {
		var startRow = Math.min(c1.row, c2.row);
		var startCol = Math.min(c1.col, c2.col);
		var endRow   = Math.max(c1.row, c2.row);
		var endCol   = Math.max(c1.col, c2.col);
		this._showRange(startRow, startCol, endRow, endCol);
	} else
		this._hideRange();
};

ZmSpreadSheet.prototype._displayRangeIfAny = function() {
	var input = this._getInputField();
	this._hasExpression = /^=(.*)$/.test(input.value);
	if (!this._hasExpression) {
		// no formulae
		this._hideRange();
		return;
	}
	var expr = RegExp.$1;
	var
		selStart = Dwt.getSelectionStart(input),
		selEnd   = Dwt.getSelectionEnd(input);
	try {
		if (selStart > 0)
			--selStart;
		if (selEnd > 0)
			--selEnd;
		var tokens = ZmSpreadSheetFormulae.parseTokens(expr, true);	// don't throw
		var tok = null;
		for (var i = 0; i < tokens.length; ++i) {
			var tmp = tokens[i];
			if (tmp.strPos <= selStart &&
			    tmp.strPos + tmp.strLen >= selEnd &&
			    ( tmp.type === ZmSpreadSheetFormulae.TOKEN.CELL ||
			      tmp.type === ZmSpreadSheetFormulae.TOKEN.CELLRANGE )) {
				tok = tmp;
				break;
			}
		}
		this._rangeToken = tok;
		if (tok) {
			var c1, c2;
			if (tok.type === ZmSpreadSheetFormulae.TOKEN.CELL) {
				c1 = c2 = tok.val;
			}
			if (tok.type === ZmSpreadSheetFormulae.TOKEN.CELLRANGE) {
				var a = tok.val.split(/:/);
				c1 = a[0];
				c2 = a[1];
			}
			this._selectRange(c1, c2, true);
		} else
			throw "HIDE";
	} catch(ex) {
		this._hideRange();
	}
};

ZmSpreadSheet.prototype._showRange = function(startRow, startCol, endRow, endCol) {
	this._model.checkBounds(startRow, startCol);
	this._model.checkBounds(endRow, endCol);
	var r1 = this._getTable().rows[startRow + 1];
	var r2 = this._getTable().rows[endRow + 1];
	if (!r1 || !r2)
		this._hideRange();
	var c1 = r1.cells[startCol + 1];
	var c2 = r2.cells[endCol + 1];
	if (!c1 || !c2)
		this._hideRange();
	this._selectedRangeName = [ ZmSpreadSheet.getCellName(c1),
				    ZmSpreadSheet.getCellName(c2) ].join(":");
	// and we have the top-left cell in c1 and bottom-right cell in c2
	var div = this._getRangeDiv();
	var w = c2.offsetTop + c2.offsetHeight - c1.offsetTop;
	var h = c2.offsetLeft + c2.offsetWidth - c1.offsetLeft;
	if (AjxEnv.isIE) {
		w += 2;
		h += 2;
	}
	div.style.display = "none";
	div.style.height = w + "px";
	div.style.width = h + "px";
	div.style.left = c1.offsetLeft - 1 + "px";
	div.style.top = c1.offsetTop - 1 + "px";
	div.style.display = "";
};

ZmSpreadSheet.prototype._getRangeDiv = function() {
	if (!this._rangeDivID)
		this._rangeDivID = Dwt.getNextId();
	var div = document.getElementById(this._rangeDivID);
	if (!div) {
		var div = document.createElement("div");
		div.id = this._rangeDivID;
		div.className = "ShowRange";
		div.style.display = "none";
		this._getRelDiv().appendChild(div);
		// at any move, we should hide the range display :-(
		// otherwise, elements below it won't be able to receive mouse clicks
		// div.onmousemove = AjxCallback.simpleClosure(this._hideRange, this);
		div.onmousedown = AjxCallback.simpleClosure(this._rangediv_mousedown, this);
		div.onmousemove = AjxCallback.simpleClosure(this._rangediv_mousemove, this);
	}
	return div;
};

ZmSpreadSheet.prototype._rangediv_mousemove = function(ev) {
	if (this._selectRangeCapture.capturing())
		return;
	var dwtev = new DwtMouseEvent(ev);
	dwtev.setFromDhtmlEvent(ev);
	var html = [ "<div class='ZmSpreadSheet-Tooltip'>",
		     "<div class='CellName'>",
		     ZmMsg.cellRange + " - " + this._selectedRangeName,
		     "</div>" ];
	// let's try to present a nice sum of the selected cells ;-)
	var g = ZmSpreadSheetModel.getRangeGeometry(this._selectedRangeName);
	html.push("<div class='CellDesc'>[ ", g.rows, " rows x ", g.cols, " cols = ",
		  g.rows * g.cols, " cells ]</div>");
	try {
		var formula = new ZmSpreadSheetFormulae(this._model, "sum(" + this._selectedRangeName + ")");
		html.push("Sum: ", formula.eval());
	} catch(ex) {}
	html.push("</div>");
	this._setTooltip(html.join(""), dwtev.docX, dwtev.docY);
};

ZmSpreadSheet.prototype._rangediv_mousedown = function(ev) {
	this._clearTooltip();
	var dwtev = new DwtUiEvent(ev);
	dwtev.setFromDhtmlEvent(ev);
	this._hideRange();
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
};

ZmSpreadSheet.prototype._hideRange = function() {
	this._shiftRangeStart = null;
	this._selectedRangeName = null;
	var div = this._getRangeDiv();
	div.style.display = "none";
	// amazing performance improvement:
	div.style.top = "0px";
	div.style.left = "0px";
	div.style.width = "5px";
	div.style.height = "5px";
};

ZmSpreadSheet.prototype._table_selrange_MouseOver = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	var table = this._getTable();
	var td = DwtUiEvent.getTarget(dwtev);
	while (td && td !== table && !/^td$/i.test(td.tagName))
		td = td.parentNode;
	if (td && /^td$/i.test(td.tagName)
	    && td.cellIndex > 0 && td.parentNode.rowIndex > 0) {
		this._selectRange(ZmSpreadSheet.getCellName(this._selectedCell),
				  ZmSpreadSheet.getCellName(td), false);
		this._updateCellRangeToken();
	}
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._updateCellRangeToken = function() {
	if (this._editingCell && this._hasExpression) {
		var val = this._selectedRangeName ||
			ZmSpreadSheet.getCellName(this._selectedCell);
		var input = this._getInputField();
		var tok = this._rangeToken;
		if (!tok) {
			tok = { strPos: Dwt.getSelectionStart(input) };
			tok.strLen = Dwt.getSelectionEnd(input) - tok.strPos;
			tok.strPos--;
		}
		Dwt.setSelectionRange(input, tok.strPos + 1, tok.strPos + tok.strLen + 1);
		tok.strLen = val.length;
		Dwt.setSelectionText(input, val);
		val = tok.strPos + tok.strLen + 1;
		Dwt.setSelectionRange(input, val, val);
		this._displayRangeIfAny();
	}
};

ZmSpreadSheet.prototype._clear_selectRangeCapture = function(ev) {
	this._selectRangeCapture.release();
	if (this._editingCell)
		this._selectCell(this._editingCell);
};

// hmm, do we ever get here?
ZmSpreadSheet.prototype._table_onMouseUp = function(ev) {
 	if (this._editingCell && !this._hasExpression)
 		// save & clear
 		this._getInputField().blur();
};

ZmSpreadSheet.prototype._setTooltip = function(cell, x, y) {
	var shell = DwtShell.getShell(window);
	var manager = shell.getHoverMgr();
	if (!manager.isHovering()) {
		manager.reset();
		manager.setHoverOverDelay(ZmSpreadSheet.TOOLTIP_DELAY);
		if (typeof cell == "object")
			manager.setHoverOverData(cell.getTooltipText());
		else
			manager.setHoverOverData(cell);
		manager.setHoverOverListener(this._hoverOverListener);
		manager.hoverOver(x, y);
	}
};

ZmSpreadSheet.prototype._handleOverListener = function(ev) {
	var shell = DwtShell.getShell(window);
	var text = ev.object;
	var tooltip = shell.getToolTip();
	tooltip.setContent(text);
	tooltip.popup(ev.x, ev.y);
};

ZmSpreadSheet.prototype._handleOutListener = function(ev) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.popdown();
};

ZmSpreadSheet.prototype._clearTooltip = function() {
	var shell = DwtShell.getShell(window);
	var manager = shell.getHoverMgr();
        manager.setHoverOutDelay(0);
        manager.setHoverOutData(null);
        manager.setHoverOutListener(this._hoverOutListener);
        manager.hoverOut();
};

ZmSpreadSheet.prototype._table_mouseOut = function() {
	this._clearTooltip();
};

ZmSpreadSheet.prototype._table_mouseMove = function(ev) {
	if (this._editingCell || this._selectRangeCapture.capturing())
		// no tooltips while we're writing code or dragging. :-p
		return;
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	var table = this._getTable();
	var td = DwtUiEvent.getTarget(dwtev);
	while (td && td !== table && !/^td$/i.test(td.tagName))
		td = td.parentNode;
	if (td && /^td$/i.test(td.tagName)) {
		try {
			var cell = this.getCellModel(td);
			this._setTooltip(cell, dwtev.docX, dwtev.docY);
		} catch(ex) {
			// ignoring exceptions (such as when we mouseover a
			// top/left bar td)
		}
	}
};

ZmSpreadSheet.prototype._table_onClick = function(ev) {
	this._clearTooltip();
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	var table = this._getTable();
	var td = DwtUiEvent.getTarget(dwtev);
	while (td && td !== table && !/^td$/i.test(td.tagName))
		td = td.parentNode;
	if (td && /^td$/i.test(td.tagName)) {
		// cell found
		var tr = td.parentNode;
		if (tr.rowIndex == 0) {
			if (td.cellIndex == 0)
				this._topLeftCellClicked(td, dwtev);
			else
				this._topCellClicked(td, dwtev);
		} else if (td.cellIndex == 0)
			this._leftCellClicked(td, dwtev);
		else
			this._cellClicked(td, dwtev);
	}
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._getTable = function() {
	return document.getElementById(this._tableID);
};

ZmSpreadSheet.prototype._onResize = function(ev) {
	var el = this.getHtmlElement();
	var reldiv = this._getRelDiv();
	reldiv.style.display = "none";
	var h = el.offsetHeight;
	reldiv.style.display = "";
	h -= reldiv.offsetTop + 2;
	var w = ev.requestedWidth;
	if (AjxEnv.isIE)
		w -= 2;		// don't ask..
	var p = reldiv.nextSibling;
	while (p) {
		h -= p.offsetHeight;
		p = p.nextSibling;
	}
	reldiv.style.height = h + "px";
	reldiv.style.width = w + "px";
};

ZmSpreadSheet.prototype.getSelectionRange = function() {
	var range = this._selectedRangeName;
	if (!range && this._selectedCell) {
		range = ZmSpreadSheet.getCellName(this._selectedCell);
		range += ":" + range;
	}
	return range;
};

ZmSpreadSheet.prototype.getSelectedCellModel = function() {
	if (this._selectedCell)
		return this.getCellModel(this._selectedCell);
	return null;
};

ZmSpreadSheet.prototype.clipboardCopy = function() {
	window.top._ZmSpreadSheet_clipboard = new ZmSpreadSheetClipboard
		(this._model, this.getSelectionRange(), false);
};

ZmSpreadSheet.prototype.clipboardCut = function() {
	window.top._ZmSpreadSheet_clipboard = new ZmSpreadSheetClipboard
		(this._model, this.getSelectionRange(), true);
};

ZmSpreadSheet.prototype.clipboardPaste = function() {
	var c = window.top._ZmSpreadSheet_clipboard;
	if (c) {
		var r = this._model.paste(c, this.getSelectionRange());
		this._selectRange.apply(this, r);
	}
};
