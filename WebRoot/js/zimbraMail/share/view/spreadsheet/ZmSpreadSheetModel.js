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
 * The SpreadSheet Widget data model.
 * @author Mihai Bazon, <mihai@zimbra.com>
 *
 * This class should embed functionality related to (re)compute cell values
 * (based on ZmSpreadSheetFormulae), set cell types, set cell data, display
 * cell values, serialize and deserialize data (most probably to some HTML
 * hybrid).
 *
 * Construct a model by passing the maximum number of rows and columns in your
 * spreadsheet.
 */
function ZmSpreadSheetModel(rows, cols) {
	this.ROWS = rows;
	this.COLS = cols;

	var d = this.data = new Array(rows);
	for (var i = 0; i < rows; ++i) {
		var row = d[i] = new Array(cols);
		for (var j = 0; j < cols; ++j) {
			row[j] = new ZmSpreadSheetCellModel(this);
		}
	}

	this._expressionCells = [];
	this.reset();
};

/* View events.  Views can hook upon events that happen in the data model.  The
 * following events are supported:
 *
 *    - onCellEdit    [ row index, col index, cell ]
 *    - onCellValue   [ row index, col index, cell ]
 *    - onInsertRow   [ array of fresh cells, row index ]
 *    - onInsertCol   [ array of fresh cells, col index ]
 *    - onDeleteRow   [ row index ]
 *    - onDeleteCol   [ col index ]
 *
 * Arguments are zero-based integers (row, col).  Cell is a reference to a
 * ZmSpreadSheetCellModel.
 */

ZmSpreadSheetModel.getCellName = function(row, col) {
	return ZmSpreadSheetModel.getColName(col) + row;
};

ZmSpreadSheetModel.getColName = function(index) {
	if (index <= 26)
		return String.fromCharCode(64 + index);
	else if (index < 676)
		return String.fromCharCode(64 + Math.floor(index / 26)) +
			String.fromCharCode(64 + index % 26);
	else
		throw "Too many columns at ZmSpreadSheetModel.getColName";
};

ZmSpreadSheetModel.identifyCell = function(ident) {
	if (/^([a-z]+)([0-9]+)$/i.test(ident)) {
		var col = RegExp.$1.toUpperCase();
		var rownum = parseInt(RegExp.$2);
		var colnum = 0;
		for (var i = 0; i < col.length; ++i) {
			colnum *= 26;
			colnum += col.charCodeAt(i) - 64;
		}
		return { row: rownum - 1, col: colnum - 1 };
	}
	throw "Can't parse cell identifier " + ident + " at ZmSpreadSheetModel.identifyCell";
};

ZmSpreadSheetModel.prototype.insertRow = function(before) {
	if (before == null)
		before = this.ROWS;
	var row = new Array(this.COLS);
	for (var i = this.COLS; --i >= 0;)
		row[i] = new ZmSpreadSheetCellModel(this);
	this.data.splice(before, 0, row);
	++this.ROWS;
	this.triggerEvent("onInsertRow", row, before);
	this.recompute();
};

ZmSpreadSheetModel.prototype.insertCol = function(before) {
	if (before == null)
		before = this.COLS;
	var cells = new Array(this.ROWS);
	for (var i = this.ROWS; --i >= 0;) {
		var c = new ZmSpreadSheetCellModel(this);
		cells[i] = c;
		this.data[i].splice(before, 0, c);
	}
	++this.COLS;
	this.triggerEvent("onInsertCol", cells, before);
	this.recompute();
};

ZmSpreadSheetModel.prototype.deleteRow = function(row) {
	data.splice(row, 1);
	--this.ROWS;
	this.triggerEvent("onDeleteRow", row);
	this.recompute();
};

ZmSpreadSheetModel.prototype.deleteCol = function(col) {
	for (var i = this.ROWS; --i >= 0;)
		data[i].splice(col, 1);
	--this.COLS;
	this.triggerEvent("onDeleteCol", col);
	this.recompute();
};

ZmSpreadSheetModel.prototype.checkBounds = function(row, col) {
	if (row < 0 || row > this.ROWS - 1)
		throw "Row out of bounds";
	if (col < 0 || col > this.COLS - 1)
		throw "Col out of bounds";
};

ZmSpreadSheetModel.prototype.reset = function() {
	this._viewEvents = {};
};

ZmSpreadSheetModel.prototype.triggerEvent = function(eventName) {
	var callback = this._viewEvents[eventName];
	if (!callback)
		return null;
	var args = new Array(arguments.length - 1);
	for (var i = 1; i < arguments.length; ++i)
		args[i - 1] = arguments[i];
	callback.run.apply(callback, args);
};

ZmSpreadSheetModel.prototype.setViewListener = function(event, callback) {
	this._viewEvents[event] = callback;
};

ZmSpreadSheetModel.prototype.getCell = function(row, col) {
	return this.data[row-1][col-1];
};

ZmSpreadSheetModel.prototype.getCellByID = function(ident) {
	var p = ZmSpreadSheetModel.identifyCell(ident);
	return this.data[p.row][p.col];
};

ZmSpreadSheetModel.prototype.recompute = function() {
	for (var i = this._expressionCells.length; --i >= 0;) {
		var expr = this._expressionCells[i]._expr;
		expr.update();
	}
};

/// The Cell Model

function ZmSpreadSheetCellModel(model, type, editValue, style) {
	if (style == null)
		style = {};
	if (editValue == null)
		editValue = "";
	if (type == null)
		type = null;	// cool isn't it...

	// initialize the style properties that are not present with the absolutely default value, "".
	function style_default(key, val) {
		if (style[key] == null)
			style[key] = val;
	};

	style_default("fontFamily"      , "");
	style_default("fontWeight"      , "");
	style_default("fontStyle"       , "");
	style_default("fontSize"        , "");
	style_default("backgroundColor" , "");
	style_default("color"           , "");
	style_default("textAlign"       , "");
	style_default("verticalAlign"   , "");
	// style_default("padding"         , "");

	this._model = model;
	this._decimals = null;
	this._type = type;
	this._autoType = null;
	this._editValue = editValue;
	this._value = editValue;
	this._style = style;
	this._expr = null;
	this._affects = [];
};

ZmSpreadSheetCellModel.prototype.setToElement = function(el) {
	el.innerHTML = "<div class='Wrapper'></div>";
	var val = this.getDisplayValue();
	if (!/\S/.test(val))
		val = "\xA0";
	else
		val = (val+"").replace(/\s/g, "\xA0");
	el.firstChild.appendChild(document.createTextNode(val));
	this.setStyleToElement(el.firstChild);
	if (this._expr)
		Dwt.addClass(el, "hasFormula");
	else
		Dwt.delClass(el, "hasFormula");
	var type = this.getType();
	if (type) {
		el.className = el.className.replace(/(^|\s)SpreadSheet-Type-.*?(\s|$)/g, " ");
		Dwt.addClass(el, "SpreadSheet-Type-" + type);
	}
};

ZmSpreadSheetCellModel.prototype.setStyleToElement = function(el) {
	for (var i in this._style)
		el.style[i] = this._style[i];
};

ZmSpreadSheetCellModel.prototype.setValue = function(value) {
	// on evil occasions, this function may get to be called recursively
	// (i.e. [A1]=B1 and [B1]=A1), thus we need to filter these situations
	// using a rude approach:
	if (!this._settingValue) {
		this._settingValue = true;
		this._value = value;
		this._model.triggerEvent("onCellValue", this.getRow(), this.getCol(), this);
		var a = this._affects;
		for (var i = a.length; --i >= 0;)
			a[i].recompute();
		this._settingValue = false;
	}
};

ZmSpreadSheetCellModel.prototype.getValue = function() {
	switch (this.getType()) {
	    case "currency":
	    case "number":
		return ZmSpreadSheetFormulae.parseFloat(this._value);
	}
	return this._value;
};

ZmSpreadSheetCellModel.prototype.getDisplayValue = function() {
	var val = this.getValue();
	var type = this.getType();
	switch (type) {
	    case "number":
		val = ZmSpreadSheetFormulae.parseFloat(val);
		if (this._decimals != null)
			val = val.toFixed(this._decimals);
		break;

	    case "currency":
		val = ZmSpreadSheetFormulae.parseFloat(val);
		if (this._decimals != null)
			val = val.toFixed(this._decimals);
		val = "$" + val;
		break;
	}
	return val;
};

ZmSpreadSheetCellModel.prototype.setExpression = function(expr) {
	var exc = this._model._expressionCells;
	for (var i = exc.length; --i >= 0;)
		if (exc[i] === this)
			exc.splice(i, 1);
	if (this._expr) {
		var deps = this._expr.depends();
		for (var i in deps) {
			var a = deps[i]._affects;
			for (var j = a.length; --j >= 0;)
				if (a[j] === this)
					a.splice(j, 1);
		}
	}
	this._expr = expr;
	if (expr) {
		exc.push(this);	// let the model know that this cell contains an expression
		// all cells involved in computing the expression affect the
		// "this" cell. ;-)
		var deps = this._expr.depends();
		for (var i in deps) {
			// there has to be a better fix for the recurrence problem :-\
			// if (deps[i] !== this) // a cell shall not depend on itself
			deps[i]._affects.push(this);
		}
	}
};

ZmSpreadSheetCellModel.prototype.recompute = function() {
	this.setValue(this._expr.eval());
};

// this tries to determine a cell type based on the given string
ZmSpreadSheetCellModel.prototype._determineType = function(str) {
//	str = AjxStringUtil.trim(str);

	var val = str;
	var type = null;

	// forced string
	if (/^\x27(.*)$/.test(str)) {
		type = "string";
		val = RegExp.$1;
	}

	// expression
	else if (/^=(.*)$/.test(str)) {
		type = "expression";
		val = RegExp.$1;
	}

	// number
	else if (/^([0-9]*\.?[0-9]+)$/.test(str)) {
		type = "number";
		val = RegExp.$1;
	}

	// currency
	else if (/^\$([0-9]*\.?[0-9]+)$/.test(str)) {
		type = "currency";
		val = RegExp.$1;
		if (this._decimals == null)
			this._decimals = 2;
	}

	// look, incidentally all values are retrieved with RegExp.$1 :-)
	// *incidentally*, I say..

	return { type: type, val: val };
};

ZmSpreadSheetCellModel.prototype.getType = function() {
	return this._type || this._autoType || "string";
};

ZmSpreadSheetCellModel.prototype.setEditValue = function(editValue) {
	if (editValue != this._editValue) {
		this._editValue = editValue;
		var val = editValue;

		var auto = this._determineType(editValue);
		this._autoType = auto.type;
		if (auto.type == "expression") {
			var expr = new ZmSpreadSheetFormulae(this._model, auto.val);
			this.setExpression(expr);
			val = expr.eval();
			auto = this._determineType(val);
			this._autoType = auto.type;
			if (this._autoType == "currency")
				// FIXME: this stinks.
				val = auto.val;
		} else {
			this.setExpression(null);
			val = auto.val;
			if (auto.type == "string") {
				if (!/^([\x27=]|\$?[0-9]+\.?[0-9]*$)/.test(val)) {
					// if it doesn't look like some special type
					// that we support, discard the useless quote.
					this._editValue = editValue = val;
				}
			}
		}

// 		if (/^\x27(.*)$/.test(val)) {
// 			val = RegExp.$1;
// 			if (!/^([\x27=]|\$?[0-9]+\.?[0-9]*$)/.test(val)) {
// 				// if it doesn't look like some special type
// 				// that we support, discard the useless quote.
// 				this._editValue = editValue = val;
// 			}
// 		} else if (/^=(.*)$/.test(val)) {
// 			var expr = this._formulae = new ZmSpreadSheetFormulae(this._model, RegExp.$1);
// 			val = expr.eval();
// 			this.setExpression(expr);
// 		} else
// 			// this is useful so that we clean any previous expression hooks that may be present
// 			this.setExpression(null);

		this.setValue(val);
		this._model.triggerEvent("onCellEdit", this.getRow(), this.getCol(), this);
	}
};

ZmSpreadSheetCellModel.prototype.getEditValue = function() {
	return this._expr
		? "=" + this._expr.getFormula()
		: this._editValue;
};

ZmSpreadSheetCellModel.prototype.getRow = function() {
	return this._getTD().parentNode.rowIndex;
};

ZmSpreadSheetCellModel.prototype.getCol = function() {
	return this._getTD().cellIndex;
};

ZmSpreadSheetCellModel.prototype._getTD = function() {
	return this._td;
};

ZmSpreadSheetCellModel.prototype.getName = function() {
	return ZmSpreadSheetModel.getCellName(this.getRow(), this.getCol());
};
