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
 * The Original Code is: Zimbra Collaboration Suite.
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
 * A SpreadSheet Widget.
 * @author Mihai Bazon, <mihai@zimbra.com>
 */
function ZmSpreadSheet(parent, className, posStyle, deferred) {
	if (arguments.length == 0)
		return;
	className = className || "ZmSpreadSheet";
	DwtComposite.call(this, parent, className, posStyle, deferred);

// 	this.ROWS = 5;
// 	this.COLS = 5;

// 	this._init();
};

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
	model.setViewListener
};

ZmSpreadSheet.prototype._model_cellEdited = function(row, col, cell) {
	var td = this._getTable().rows[row].cells[col];
	cell.setToElement(td);
};

ZmSpreadSheet.prototype._model_cellComputed = function(row, col, cell) {
	var td = this._getTable().rows[row].cells[col];
	cell.setToElement(td);
};

ZmSpreadSheet.prototype._model_insertRow = function(cells, rowIndex) {
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
		td.innerHTML = "&nbsp;";
		cells[i]._td = td;
		cells[i].setToElement(td);
	}
	this._selectCell(selected);
};

ZmSpreadSheet.prototype.getCellModel = function(td) {
	return this._model.getCell(td.parentNode.rowIndex, td.cellIndex);
};

ZmSpreadSheet.prototype._init = function() {
	this._relDivID = Dwt.getNextId();

	var html = [ "<div id='", this._relDivID, "' style='position: relative'><table cellspacing='1' cellpadding='0' border='0'>" ];
	var row = [ "<tr><td class='LeftBar'></td>" ];

	var ROWS = this._model.ROWS;
	var COLS = this._model.COLS;

	this._inputFieldID = null;
	this._spanFieldID = null;

	for (var i = COLS; --i >= 0;)
		row.push("<td class='cell'>&nbsp;</td>");
	row.push("</tr>");

	row = row.join("");

	// one more row for the header
	for (var i = ROWS; i-- >= 0;)
		html.push(row);
	html.push("</table></div>");

	var div = this.getHtmlElement();
	div.innerHTML = html.join("");
	var table = this._getTable();
	table.rows[0].className = "TopBar";
	table.rows[0].cells[0].className = "TopLeft";

	for (var i = 1; i < table.rows.length; ++i)
		table.rows[i].cells[0].innerHTML = "<div>" + i + "</div>";
	row = table.rows[0];
	for (var i = 1; i < row.cells.length; ++i)
		row.cells[i].innerHTML = "<div>" + ZmSpreadSheetModel.getColName(i) + "</div>";

	for (var i = 0; i < ROWS; ++i) {
		var row = table.rows[i + 1];
		for (var j = 0; j < COLS; ++j) {
			var mc = this._model.data[i][j];
			mc.setToElement(mc._td = row.cells[j + 1]);
		}
	}

	table.onmousedown = ZmSpreadSheet.simpleClosure(this._table_onClick, this);
	table.onclick = ZmSpreadSheet.simpleClosure(this._table_onClick, this);
};

// called when a cell from the top header was clicked or mousedown
ZmSpreadSheet.prototype._topCellClicked = function(td, ev) {
	if (/click/i.test(ev.type)) {
		this._model.insertCol(td.cellIndex - 1);
	}
};

// called when a cell from the left header was clicked or mousedown
ZmSpreadSheet.prototype._leftCellClicked = function(td, ev) {
	if (/click/i.test(ev.type)) {
		this._model.insertRow(td.parentNode.rowIndex - 1);
	}
};

// called when the top-left cell was clicked or mousedown (TODO: do we do anything here?)
ZmSpreadSheet.prototype._topLeftCellClicked = function(td, ev) {
};

// called for all other cells; normally we display an input field here and
// allow one to edit cell contents
ZmSpreadSheet.prototype._cellClicked = function(td, ev) {
	this._selectCell(td);
	if (/click/i.test(ev.type)) {
		ev._stopPropagation = true;
		ev._returnValue = false;
		this._editCell(td);
	}
};

ZmSpreadSheet.prototype._getTopLeftCell = function() {
	return this._getTable().rows[0].cells[0];
};

ZmSpreadSheet.prototype._getTopHeaderCell = function(td) {
	return this._getTable().rows[0].cells[td.cellIndex];
};

ZmSpreadSheet.prototype._getLeftHeaderCell = function(td) {
	return this._getTable().rows[td.parentNode.rowIndex].cells[0];
};

ZmSpreadSheet.prototype._selectCell = function(td) {
	if (this._selectedCell) {
		Dwt.delClass(this._getTopHeaderCell(this._selectedCell), "TopSelected");
		Dwt.delClass(this._getLeftHeaderCell(this._selectedCell), "LeftSelected");
		Dwt.delClass(this._selectedCell, "Selected");
	}
	this._selectedCell = td;
	if (td) {
		Dwt.addClass(td, "Selected");
		Dwt.addClass(this._getTopHeaderCell(td), "TopSelected");
		Dwt.addClass(this._getLeftHeaderCell(td), "LeftSelected");
		// this._getTopLeftCell().innerHTML = ZmSpreadSheet.getCellName(td);
	}
};

ZmSpreadSheet.prototype._getRelDiv = function() {
	return document.getElementById(this._relDivID);
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
			= ZmSpreadSheet.simpleClosure(this._input_keyPress, this);
		input.onmouseup = ZmSpreadSheet.simpleClosure(this._input_mouseUp, this);
		input.onblur = ZmSpreadSheet.simpleClosure(this._input_blur, this);
		input.onfocus = ZmSpreadSheet.simpleClosure(this._input_focus, this);
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
	if (td) {
		this._selectCell(td);
		var input = this._getInputField();
		input.style.visibility = "";
		input.style.top = td.offsetTop - 1 + "px";
		input.style.left = td.offsetLeft - 1 + "px";
		input.style.width = td.offsetWidth + 2 + "px";
		input.style.height = td.offsetHeight + 2 + "px";
		var mc = this.getCellModel(td);
		input.value = mc.getEditValue();
		input.select();
		input.focus();
		this._editingCell = td;
		mc.setStyleToElement(input);
		this._displayRangeIfAny();
		// quick hack to set the field size from the start
		// this._input_keyPress();
	}
};

ZmSpreadSheet.prototype._input_blur = function(ev) {
	var input = this._getInputField();
	input.style.visibility = "hidden";
	input.style.left = 0;
	input.style.top = 0;
	input.style.width = "";
	if (!this._preventSaveOnBlur)
		this._save_value(input.value);
	this._hideRange();
};

// In Firefox the input field loses focus when the whole document lost focus
// (i.e. tab change).  Then if you return to that tab, the input field regains
// focus but remains hidden in the top-left corner, so we re-edit the cell here
ZmSpreadSheet.prototype._input_focus = function(ev) {
	var input = this._getInputField();
	if (input.style.visibility == "hidden" && this._editingCell)
		this._editCell(this._editingCell);
};

ZmSpreadSheet.prototype._save_value = function(origval) {
	this.getCellModel(this._editingCell).setEditValue(origval);
};

ZmSpreadSheet.prototype._getNextCell = function(td) {
	if (td == null)
		td = this._editingCell;
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
		td = this._editingCell;
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
		td = this._editingCell;
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
		td = this._editingCell;
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
		td = this._editingCell;
	var row = td.parentNode;
	if (td.cellIndex < row.cells.length - 1)
		return row.cells[td.cellIndex + 1];
	return null;
};

ZmSpreadSheet.prototype._getLeftCell = function(td) {
	if (td == null)
		td = this._editingCell;
	var row = td.parentNode;
	if (td.cellIndex > 1)
		return row.cells[td.cellIndex - 1];
	return null;
};

ZmSpreadSheet.prototype._input_mouseUp = function() {
	this._displayRangeIfAny();
};

ZmSpreadSheet.prototype._input_keyPress = function(ev) {
	ev || (ev = window.event);
	var setTimer = true;
	if (ev) {
		var dwtev = new DwtUiEvent();
		dwtev.setFromDhtmlEvent(ev);
		var input = this._getInputField();
		this._preventSaveOnBlur = true;	// we're saving manually when it's the case.
		switch (ev.keyCode) {

		    case 9: // TAB
			setTimer = false;
			this._save_value(input.value);
			this._editCell(ev.shiftKey ? this._getPrevCell() : this._getNextCell());
			dwtev._stopPropagation = true;
			dwtev._returnValue = false;
			dwtev.setToDhtmlEvent(ev);
			break;

		    case 37: // LEFT
		    case 39: // RIGHT
			var doit = ( Dwt.getSelectionStart(input) == 0 &&
				     Dwt.getSelectionEnd(input) == input.value.length );
			if (doit || !input.value || ev.altKey) {
				setTimer = false;
				this._save_value(input.value);
				this._editCell(ev.keyCode == 37 ? this._getLeftCell() : this._getRightCell());
				dwtev._stopPropagation = true;
				dwtev._returnValue = false;
				dwtev.setToDhtmlEvent(ev);
			}
 			break;

		    case 38: // UP
		    case 13: // ENTER
		    case 40: // DOWN
			var td = (ev.keyCode == 13
				  ? (ev.shiftKey ? this._getUpCell() : this._getDownCell())
				  : (ev.keyCode == 38 ? this._getUpCell() : this._getDownCell()));
			setTimer = false;
			this._save_value(input.value);
			this._editCell(td);
			dwtev._stopPropagation = true;
			dwtev._returnValue = false;
			dwtev.setToDhtmlEvent(ev);
			break;

		    case 27: // ESC
			// setTimer = false;
			// input.blur();
			this._editCell(this._editingCell);
			dwtev._stopPropagation = true;
			dwtev._returnValue = false;
			dwtev.setToDhtmlEvent(ev);
			break;

		    case 113: // F2
			// users (I at least) expect to be able to use the
			// left/right arrow keys to move a caret inside the
			// field; so we simply must unselect the text if it's
			// selected.
			Dwt.setSelectionRange(input,
					      input.value.length,
					      input.value.length);
			break;

		}
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
		}, 10);
	} else
		this._hideRange();
};

ZmSpreadSheet.prototype._displayRangeIfAny = function() {
	var input = this._getInputField();
	if (!/^=(.*)$/.test(input.value)) {
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
		if (tok) {
			var c1, c2;
			if (tok.type === ZmSpreadSheetFormulae.TOKEN.CELL) {
				c1 = c2 = ZmSpreadSheetModel.identifyCell(tok.val);
			}
			if (tok.type === ZmSpreadSheetFormulae.TOKEN.CELLRANGE) {
				var a = tok.val.split(/:/);
				var c1 = ZmSpreadSheetModel.identifyCell(a[0]);
				var c2 = ZmSpreadSheetModel.identifyCell(a[1]);
			}
			if (c1 && c2) {
				var startRow = Math.min(c1.row, c2.row);
				var startCol = Math.min(c1.col, c2.col);
				var endRow   = Math.max(c1.row, c2.row);
				var endCol   = Math.max(c1.col, c2.col);
				this._showRange(startRow, startCol, endRow, endCol);
				// Dwt.setSelectionRange(input, tok.strPos + 1, tok.strPos + tok.strLen + 1);
			} else
				throw "HIDE";
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
	// and we have the top-left cell in c1 and bottom-right cell in c2
	var div = this._getRangeDiv();
	var w = c2.offsetTop + c2.offsetHeight - c1.offsetTop;
	var h = c2.offsetLeft + c2.offsetWidth - c1.offsetLeft;
	if (AjxEnv.isIE) {
		w += 2;
		h += 2;
	}
	div.style.height = w + "px";
	div.style.width = h + "px";
	div.style.left = c1.offsetLeft - 1 + "px";
	div.style.top = c1.offsetTop - 1 + "px";
	div.style.visibility = "";
};

ZmSpreadSheet.prototype._getRangeDiv = function() {
	if (!this._rangeDivID)
		this._rangeDivID = Dwt.getNextId();
	var div = document.getElementById(this._rangeDivID);
	if (!div) {
		var div = document.createElement("div");
		div.id = this._rangeDivID;
		div.className = "ShowRange";
		this._getRelDiv().appendChild(div);
		div.style.visibility = "hidden";
	}
	return div;
};

ZmSpreadSheet.prototype._hideRange = function() {
	this._getRangeDiv().style.visibility = "hidden";
};

ZmSpreadSheet.prototype._table_onClick = function(ev) {
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
};

ZmSpreadSheet.prototype._getTable = function() {
	return this._getRelDiv().firstChild;
};

ZmSpreadSheet.simpleClosure = function(func, obj) {
	return function() { return func.call(obj, arguments[0]); };
};
