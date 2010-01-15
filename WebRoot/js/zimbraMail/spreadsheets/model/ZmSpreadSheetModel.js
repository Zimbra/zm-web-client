/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
ZmSpreadSheetModel = function(rows, cols) {
	this.ROWS = rows;
	this.COLS = cols;
	this.version = 1;

	var d = this.data = new Array(rows);
	for (var i = 0; i < rows; ++i) {
		var row = d[i] = new Array(cols);
		for (var j = 0; j < cols; ++j) {
			row[j] = new ZmSpreadSheetCellModel(this);
		}
	}

	this.colProps = new Array(cols);
	for (var i = 0; i < cols; ++i)
		this.colProps[i] = ZmSpreadSheetModel.getDefaultColProp();

    this.rowProps = new Array(rows);
    for (var i = 0; i < rows; ++i)
		this.rowProps[i] = ZmSpreadSheetModel.getDefaultRowProp();

	this._expressionCells = [];
	this.reset();

    this._maxActiveRow = 0;
    this._maxActiveCol = 0; 
};

// Note that debug and profile code might require Firebug (FF extension)
ZmSpreadSheetModel.DEBUG = false;

ZmSpreadSheetModel.DATE_FORMATS = ["MM/dd/yy", "MM/dd/yyyy", "MM-dd-yy","MM-dd-yyyy", "MMM dd", "MMMM dd", "M/d", "MMM yyyy", "MMMM yyyy", "MMMM dd,yyyy", "dd-MMM-yyyy", "dd-MM"];

ZmSpreadSheetModel.getDefaultColProp = function() {
	var prop = {
		width: 100
	};
	return prop;
};

ZmSpreadSheetModel.getDefaultRowProp = function(){
    var prop = {
        height: 15
    };
    return prop;
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

ZmSpreadSheetModel.getRangeName = function(startRow, startCol, endRow, endCol) {
	return ZmSpreadSheetModel.getCellName(startRow, startCol) +
		":" + ZmSpreadSheetModel.getCellName(endRow, endCol);
};

ZmSpreadSheetModel.getColName = function(index) {
	--index;
	// translate to base 26 and represent each digit with an alphabet letter
	var letters = [];
	do {
		letters.unshift(String.fromCharCode(65 + index % 26));
		index = Math.floor(index / 26);
	} while (index > 0);
	return letters.join("");
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

ZmSpreadSheetModel.getRangeBounds = function(range) {
	var a = range.split(/:/);
	// now a[0] is the supposedly start cell and a[1] the end cell
	var c1 = ZmSpreadSheetModel.identifyCell(a[0]);
	var c2 = ZmSpreadSheetModel.identifyCell(a[1]);

	// note that we do need to check that (maybe it's a reverse range)
	var startRow = Math.min(c1.row, c2.row);
	var startCol = Math.min(c1.col, c2.col);
	var endRow   = Math.max(c1.row, c2.row);
	var endCol   = Math.max(c1.col, c2.col);

	return [ { row: startRow , col: startCol },
	         { row: endRow   , col: endCol } ];
};

ZmSpreadSheetModel.shiftCell = function(cell, rows, cols) {
	var c = ZmSpreadSheetModel.identifyCell(cell);
	c.row += rows;
	c.col += cols;
	return ZmSpreadSheetModel.getCellName(c.row + 1, c.col + 1);
};

ZmSpreadSheetModel.shiftRange = function(range, rows, cols) {
	var a = range.split(/:/);
	return ZmSpreadSheetModel.shiftCell(a[0], rows, cols)
		+ ":" + ZmSpreadSheetModel.shiftCell(a[1], rows, cols);
};

ZmSpreadSheetModel.getRangeGeometry = function(range) {
	var bounds = ZmSpreadSheetModel.getRangeBounds(range);
	return { rows   : bounds[1].row - bounds[0].row + 1,
		 cols   : bounds[1].col - bounds[0].col + 1,
		 bounds : bounds };
};

ZmSpreadSheetModel.prototype.getCellsInRange = function(range) {
	var bounds   = ZmSpreadSheetModel.getRangeBounds(range);
	var startRow = bounds[0].row;
	var startCol = bounds[0].col;
	var endRow   = bounds[1].row;
	var endCol   = bounds[1].col;

	var cells = [];
	for (var i = startRow; i <= endRow; ++i)
		for (var j = startCol; j <= endCol; ++j)
			cells.push(this.data[i][j]);
	return cells;
};

ZmSpreadSheetModel.prototype._setMaxActiveRow = function(row){
    if(this._maxActiveRow < row){
        this._maxActiveRow = row;
    }
};

ZmSpreadSheetModel.prototype._setMaxActiveCol = function(col){
    if(this._maxActiveCol < col){
        this._maxActiveCol = col;
    }
};

ZmSpreadSheetModel.prototype.forEachCell = function(range, func, obj) {
	var cells = this.getCellsInRange(range);
	for (var i = 0; i < cells.length; ++i)
		func.apply(obj, [ cells[i], i, cells ]);
};

ZmSpreadSheetModel.prototype.insertRow = function(before) {
	if (before == null)
		before = this.ROWS;
	var row = new Array(this.COLS);
	for (var i = this.COLS; --i >= 0;)
		row[i] = new ZmSpreadSheetCellModel(this);
	this.data.splice(before, 0, row);
    this.rowProps.splice(before, 0, ZmSpreadSheetModel.getDefaultRowProp());
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
	this.colProps.splice(before, 0, ZmSpreadSheetModel.getDefaultColProp());
	++this.COLS;
	this.triggerEvent("onInsertCol", cells, before);
	this.recompute();
};

ZmSpreadSheetModel.prototype.deleteRow = function(row) {
	// silently refuse to delete the last row
	if (this.ROWS > 1) {
		var cells = this.data[row];
		for (var i = cells.length; --i >= 0;) {
			if (cells[i]._expr)
				cells[i].setExpression(null);
			cells[i]._td = null;
		}
		this.data.splice(row, 1);
        this.rowProps.splice(row, 1);
		--this.ROWS;
		this.triggerEvent("onDeleteRow", row);
		this.recompute();
	}
};

ZmSpreadSheetModel.prototype.deleteCol = function(col) {
	// silently refuse to delete the last col
	if (this.COLS > 1) {
		for (var i = this.ROWS; --i >= 0;) {
			var cell = this.data[i][col];
			if (cell._expr)
				cell.setExpression(null);
			this.data[i].splice(col, 1);
			cell._td = null;
		}
		this.colProps.splice(col, 1);
		--this.COLS;
		this.triggerEvent("onDeleteCol", col);
		this.recompute();
	}
};

ZmSpreadSheetModel.prototype.getRowHeight = function(row) {
    if(!this.rowProps[row])
        return ZmSpreadSheetModel.getDefaultRowProp().height;
    return this.rowProps[row].height;  
};

ZmSpreadSheetModel.prototype.setRowHeight = function(row, height)  {
    this.rowProps[row].height = height;
};

ZmSpreadSheetModel.prototype.getColWidth = function(col) {
	return this.colProps[col].width;
};

ZmSpreadSheetModel.prototype.setColWidth = function(col, width) {
	this.colProps[col].width = width;
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

// This arranges the cells having expressions in an order suitable for correct
// sequential calculation, i.e. dependencies first.
ZmSpreadSheetModel.prototype._orderExpressionCells = function(cells) {
	var ordered = [];
	var count = {};
	var a = cells || this._expressionCells;

	while (a.length > 0) {
		var cell = a.shift();
		var name = cell.getName();
		if (cell._expr && !count[name]) {
			// a.splice.apply(a, [ 0, 0 ].concat(cell._expr.dependsArray()));
			a.unshift.apply(a, cell._expr.dependsArray());
			count[name] = true;
			ordered.push(cell);
		}
	}

// 	for (var i = 0; i < a.length; ++i) {
// 		var cell = a[i];
// 		// since we're playing with dependencies, not all cells
// 		// have an expression
// 		if (cell._expr) {
// 			a.splice(i + 1, 0, cell._expr.dependsArray());
// 			// don't add a cell a second time
// 			var name = cell.getName();
// 			if (!count[name]) {
// 				count[name] = true;
// 				ordered.unshift(cell);
// 			}
// 		}
// 	}
	if (!cells)
		this._expressionCells = ordered;
	return ordered;
};

ZmSpreadSheetModel.prototype.recompute = function(reset) {
	for (var i = this._expressionCells.length; --i >= 0;) {
		var cell = this._expressionCells[i];
		try {
			cell.updateExpression();
		} catch(ex) {
			// broken cell references
			cell._td.firstChild.innerHTML = "#REF";
		}
	}
};

ZmSpreadSheetModel.prototype.fillSeries = function(clipboard, dest){
    
};

// Paste the given src range from the given model to the destination range in
// the current model.  This actually performs something like the "fill"
// operation in Excel.
//
// IF (dest.rows < src.rows || dest.cols < src.cols)
//       enlarge dest to fit the "clipboard"
// ELSE
//       dest.rows -= dest.rows % src.rows;
//       dest.cols -= dest.cols % src.cols;
//
// Having a normalized destination range, we copy data and formatting from
// cells to dest according to the geometry.  If "dest" is bigger, multiple
// copies will be thrown out.
//
// src and dest are range descriptors.
ZmSpreadSheetModel.prototype.paste = function(clipboard, dest) {
	var g_src = clipboard.geometry;
	var b_src = clipboard.bounds;

	var g_dest = ZmSpreadSheetModel.getRangeGeometry(dest);
	var b_dest = g_dest.bounds;
	var i;

	if (g_dest.rows < g_src.rows)
		g_dest.rows = g_src.rows;
	else
		g_dest.rows -= g_dest.rows % g_src.rows;

	if (g_dest.cols < g_src.cols)
		g_dest.cols = g_src.cols;
	else
		g_dest.cols -= g_dest.cols % g_src.cols;

	b_dest[1].row = b_dest[0].row + g_dest.rows - 1;
	b_dest[1].col = b_dest[0].col + g_dest.cols - 1;

	// shift and recompile formulae by this value
	clipboard.setDelta(b_dest[0].row - b_src[0].row,
			   b_dest[0].col - b_src[0].col);

	// enlarge this model if needed
	for (i = b_dest[1].row - this.ROWS; i-- >= 0;)
		this.insertRow();
	for (i = b_dest[1].col - this.COLS; i-- >= 0;)
		this.insertCol();

	var src_i = 0;
	var dr = 0;
	var pasted_cells = [];
	for (var i = b_dest[0].row; i <= b_dest[1].row; ++i) {
		var src_j = 0;
		var dc = 0;
		for (var j = b_dest[0].col; j <= b_dest[1].col; ++j) {
			var dest_cell = this.data[i][j];
			clipboard.paste(src_i, src_j, dest_cell, dr, dc);
			pasted_cells.push(dest_cell);
			src_j++;
			if (src_j == g_src.cols) {
				dc += g_src.cols;
				src_j = 0;
			}
		}
		src_i++;
		if (src_i == g_src.rows) {
			dr += g_src.rows;
			src_i = 0;
		}
	}

	var exprs = this._orderExpressionCells(pasted_cells);
	for (var i = 0; i < exprs.length; ++i)
		exprs[i].recompute();

	return [ ZmSpreadSheetModel.getCellName(b_dest[0].row + 1, b_dest[0].col + 1),
		 ZmSpreadSheetModel.getCellName(b_dest[1].row + 1, b_dest[1].col + 1) ];
};

// FIXME: the following 2 functions are general purpose and should probably
// belong in Ajax...

ZmSpreadSheetModel.serializeJSObject = function(obj) {
	var ret;
	var objsep = ZmSpreadSheetModel.DEBUG ? ",\n" : ",";
	switch (typeof obj) {
	    case "object":
		if (obj == null) {
			ret = "null";
		} else if (obj.serialize && typeof obj.serialize == "function") {
			ret = obj.serialize();
		} else if (obj instanceof Array) {
			ret = new Array(obj.length);
			for (var i = 0; i < obj.length; ++i)
				ret[i] = this.serializeJSObject(obj[i]);
			ret = [ "[", ret.join(objsep), "]" ].join("");
		} else {
			ret = new Array();
			for (var i in obj)
				ret.push([ '"', i.replace(/\x22/g, '\\x22'), '":',
					   this.serializeJSObject(obj[i]) ].join(""));
			ret = [ "{", ret.join(objsep), "}" ].join("");
		}
		break;
	    case "string":
		ret = obj.replace(/\n/g, "\\n")
			.replace(/\x5c/g, "\\x5c")
			.replace(/\x22/g, "\\\"");
		ret = [ '"', ret, '"' ].join("");
		break;
	    default :
		ret = obj;
	}
	return ret;
};

ZmSpreadSheetModel.deserializeJSObject = function(str) {
	// We're using eval since it's faster.  To avoid security issues, I
	// think it's enough if we just disallow certain characters, except
	// in strings.

	// Remove string literals since we don't care about what they contain.
	// \x22 stands for " and \x27 for '
	var tmp = str.replace(/(\x22(\\.|[^\x22\\])*\x22|\x27(\\.|[^\x27\\])*\x27)/g, "");
	var forbid = ZmSpreadSheetModel.DEBUG
		? /([;()+=\x2f*.-])/g
		: /([\n;()+=\x2f*.-])/g;
	if (forbid.test(tmp)) {
		// we don't allow:
		// ";", newline, parens, operators, comments.  We want plain
		// JSON generated by our serialize function above.
		throw new DwtException("Can't deserialize in ZmSpreadSheetModel: " + RegExp.$1 + " characters not allowed.");
	}

	try {
		var foo;
		eval([ 'foo=', str ].join(""));
		return foo;
	} catch(ex) {
		throw new DwtException("Can't deserialize in ZmSpreadSheetModel: malformed data\n[ "
				       + ex + " ]");
	}
};

ZmSpreadSheetModel.prototype.serialize = function() {
	var tmp = {
		ROWS     : this.ROWS,
		COLS     : this.COLS,
		version  : 1,
		colProps : this.colProps,
		data     : this.data
	};
	return ZmSpreadSheetModel.serializeJSObject(tmp);
};

ZmSpreadSheetModel.prototype.deserialize = function(str) {
	var tmp = ZmSpreadSheetModel.deserializeJSObject(str);
	this.ROWS = tmp.ROWS;
	this.COLS = tmp.COLS;
	this.colProps = tmp.colProps;
	this.version = tmp.version || 0;
	var data = this.data = tmp.data;
	for (var i = 0; i < this.ROWS; ++i) {
		var row = data[i];
		for (var j = 0; j < this.COLS; ++j) {
			row[j] = ZmSpreadSheetCellModel.deserialize(this, row[j]);
		}
	}
};

ZmSpreadSheetModel.prototype.loadFromXml = function(xmlStr) {
	var xml = AjxXmlDoc.createFromXml(xmlStr);
	if(xml) {
		var workbook = xml.toJSObject(false, false, true);
		if(!workbook) return;

		var worksheet = (workbook && workbook.Worksheet) ? workbook.Worksheet : null;
		var colProps = (worksheet && worksheet.ColProps) ? worksheet.ColProps : null;
		var table = (worksheet && worksheet.Table) ? worksheet.Table : null;
		var rows = (table && table.Row) ? table.Row : [];

		this.ROWS = (table && table.ExpandedRowCount) ? table.ExpandedRowCount : 0;
		this.COLS = (table && table.ExpandedColumnCount) ? table.ExpandedColumnCount : 0;
		this.colProps = (colProps && colProps.Col) ? colProps.Col : [];
		this.version = (worksheet && worksheet.version) ? worksheet.version : 0;

		var d = this.data = new Array(this.ROWS);
		var cell = null;
		var cellData = null;

		for (var i = 0; i < this.ROWS; ++i) {
			if(!rows || !rows[i]) continue;
			var cells = rows[i].Cell;
			if(!cells) continue;
			var row = d[i] = new Array(this.COLS);
			for (var j = 0; j < this.COLS; ++j) {
					if(!cells[j]) continue;
					cell = cells[j];
					cellData = {
						row: cell.row,
						col: cell.col,
						type: cell.type,
						decimals: cell.decimals,
						editValue: cell.editValue,
						style: cell.Style
					};
					row[j] = ZmSpreadSheetCellModel.deserialize(this, cellData);
			}
		}
	}
};

// This function is important for deserialization to work fine.  It's called
// automatically from the view after all cells have been associated a <td>.
ZmSpreadSheetModel.prototype.doneSetView = function() {
	// step 1.  Walk through cells and reset the "editValue" in order to
	// instantiate expressions.
	var data = this.data;
	for (var i = 0; i < this.ROWS; ++i) {
		var row = data[i];
		for (var j = 0; j < this.COLS; ++j) {
			var cell = row[j];
			cell.setEditValue(cell._editValue, true);
		}
	}
	// step 2.  Recompute the formulas in the appropriate order
	this._orderExpressionCells();
	var a = this._expressionCells;
	if (ZmSpreadSheetModel.DEBUG) {
		var debug = [];
		for (var i = 0; i < a.length; ++i)
			debug[i] = a[i].getName();
		console.log("Computing: %s", debug.join(", "));
	}
	for (var i = 0; i < a.length; ++i)
		a[i].recompute();
};

ZmSpreadSheetModel.prototype.getHtml = function() {
	var html = [ "<table style='font: 8pt tahoma,verdana,sans-serif; background-color: #fff; border-collapse: collapse'>" ];
	for (var i = 0; i < this.ROWS; ++i) {
		html.push("<tr>");
		for (var j = 0; j < this.COLS; ++j)
			html.push(this.data[i][j].getHtml());
		html.push("</tr>");
	}
	html.push("</table>");
	return html.join("");
};


//Charting

ZmSpreadSheetModel.prototype.addChart =
function(chart){

    if(!this._charts) this._charts = {};
    var id = chart.getHTMLElId();
    this._charts[id] = chart;

};

ZmSpreadSheetModel.prototype.removeChart =
function(id){
    if(this._charts){
        delete this._charts[id];
        if(this._charts[id])
            this._charts[id] = null;  //Double Make Sure
    }
};

// XML Standard for SPREADSHEET
/*

<WorkBook name="" version="">
    <!-- WorkBook specific properties -->
    <!-- Custom Properties -->
    <WorkSheets>
        <WorkSheet name="">
            <!-- Sheet speficific properties -->
            <Selection row="" col=""/>
            <Active row="" col=""/>                          //Keep track of the bounds, easy to render
            <Default colWidth="" rowHeight=""/>              //Defaults can here or come from code. Former is idle.
            <Cols>
                <Col width=""/>                              //Only changed col widths
            </Cols>
            <Charts>
                <Chart name='' type='' srow='' scol='' erow='' ecol='' x='' y=''/>
                ...
            </Charts>
            <SheetData>
                <Row r="" height="">
                    <Cell row="" col="" type="" value="" decimals="">      //Only Modified cells
                        <Style color="" bgcolor="" ... />   
                    </Cell>
                </Row>
            </SheetData>
        </WorkSheet>
        <WorkSheet>...</WorkSheet>
    </WorkSheets>
</WorkBook>


*/

ZmSpreadSheetModel.prototype.getXML = function(params) {

    var workBookN = AjxXmlDoc.createRoot("WorkBook");
    workBookN.root.setAttribute("version", 1);

        var workSheetsN = AjxXmlDoc.createElement("WorkSheets");
            var workSheetN = AjxXmlDoc.createElement("WorkSheet");
            //WorkSheet name must later come from the UI
            workSheetN.root.setAttribute("name", "Sheet1");

                if(params.selRow && params.selCol){
                    var selectionN = AjxXmlDoc.createElement("Selection");
                    selectionN.root.setAttribute("row", params.selRow);
                    selectionN.root.setAttribute("col", params.selCol);
                    workSheetN.appendChild(selectionN);
                }
                
                var colsN = AjxXmlDoc.createElement("Cols");
                var defaultColWidth = ZmSpreadSheetModel.getDefaultColProp().width, colWidth, colN, flag=false;
                for (var i = 0; i < this.COLS; ++i){
                    colWidth = this.colProps[i].width;
                    if(colWidth != defaultColWidth){
		                colN = AjxXmlDoc.createElement("Col");
                        colN.root.setAttribute("col", i+1);
		                colN.root.setAttribute("width", this.colProps[i].width);
		                colsN.appendChild(colN);
                        flag = true;
                    }
	            }
                if(flag) workSheetN.appendChild(colsN);

                //Add Charts Data
                var chartsN = this.getChartsXML();
                if(chartsN) workSheetN.appendChild(chartsN);
                    
    
                //TODO: Optimize node/attr names such that the data transfer is optimal
                var sheetDataN = AjxXmlDoc.createElement("SheetData");
                var rowN, cellN, rowHeight, flag = false, aRow=0, aCol=0, cell;
                var defaultRowHeight = ZmSpreadSheetModel.getDefaultRowProp().height;
                for (var i = 0; i < this.ROWS; ++i) {
                    flag = false;
		            rowN = AjxXmlDoc.createElement("Row");
                    rowN.root.setAttribute("row", i+1);
		            for (var j = 0; j < this.COLS; ++j) {
                        cell = this.data[i][j];
			            cellN = cell.getXML(i+1,j+1);
			            if(cellN){
                            aRow = cell.getRow();
                            aCol=cell.getCol();
                            rowN.appendChild(cellN);
                            flag = true;
                        }
		            }
                    rowHeight = this.rowProps[i].height;
                    if(rowHeight != defaultRowHeight){
                        rowN.root.setAttribute("height", rowHeight);
                        flag = true;
                    }
		            if(flag){
                        sheetDataN.appendChild(rowN);
                    }
	            }

                
                var activeN = AjxXmlDoc.createElement("Active");
                activeN.root.setAttribute("row", aRow);
                activeN.root.setAttribute("col", aCol);
                workSheetN.appendChild(activeN);

                workSheetN.appendChild(sheetDataN);
            workSheetsN.appendChild(workSheetN);
        workBookN.appendChild(workSheetsN);


    return workBookN;
           
};

ZmSpreadSheetModel.prototype.getChartsXML =
function(){

    if(!this._charts) return null;


    var chartsN = AjxXmlDoc.createElement("Charts");
    var chartN, flag=false;
    for(var id in this._charts){
        var chart = this._charts[id];
        chartN = AjxXmlDoc.createElement("Chart");
        chartN.root.setAttribute("type", chart.getChartType());
        var data = chart.getChartRange();
        chartN.root.setAttribute("srow", data.sRow);
        chartN.root.setAttribute("scol", data.sCol);
        chartN.root.setAttribute("erow", data.eRow);
        chartN.root.setAttribute("ecol", data.eCol);
        var pos = chart.getChartPos();
        if(pos){
            chartN.root.setAttribute("x", pos.x);
            chartN.root.setAttribute("y", pos.y);
        }
        chartsN.appendChild(chartN);
        flag = true;
    }

    return ( flag ? chartsN : null);

};


ZmSpreadSheetModel.MIN_ROWS = 40;
ZmSpreadSheetModel.MIN_COLS = 15;

ZmSpreadSheetModel.prototype.loadFromXML = function(xmlStr) {
    var xml = AjxXmlDoc.createFromXml(xmlStr);
    if(!xml) return;

    var workBook = xml.toJSObject(false, false, true);
    if(!workBook) return;
    this.version = workBook.version;

    var workSheets = workBook.WorkSheets;
    workSheets  = ( workSheets ) ? workSheets.WorkSheet : null;
    if(!workSheets) return;

    //Consider only the first Sheet untill support for multiple sheets.
    var workSheet =  (workSheets instanceof Array ) ? workSheets[0] : workSheets;

    var activeArea, cols, col, i;

    activeArea = workSheet.Active;
    var aRows = activeArea ? new Number(activeArea.row) : 0;
    var aCols = activeArea ? new Number(activeArea.col) : 0;
    this.ROWS = aRows = ( aRows <= ZmSpreadSheetModel.MIN_ROWS) ? ZmSpreadSheetModel.MIN_ROWS : aRows + 5;
    this.COLS = aCols = ( aCols <= ZmSpreadSheetModel.MIN_COLS) ? ZmSpreadSheetModel.MIN_COLS : aCols + 3;

    this.colProps = new Array(this.COLS);
    for(i=0; i<this.colProps.length; i++){
        this.colProps[i] = ZmSpreadSheetModel.getDefaultColProp();
    }

    this.rowProps = new Array(this.ROWS);
    for(i=0; i<this.rowProps.length; i++){
        this.rowProps[i] = ZmSpreadSheetModel.getDefaultRowProp();
    }

    cols = workSheet.Cols;
    if(cols && cols.Col){
        cols = cols.Col;
        if(!(cols instanceof Array)) cols = [cols];
        for(var i=0; i<cols.length; i++){
            col = new Number(cols[i].col) - 1;
            this.colProps[col].width = cols[i].width;
        }
    }

    var chart, charts = workSheet.Charts;
    if(charts && charts.Chart){
        this._rawCharts = [];
        charts = charts.Chart;
        if(!(charts instanceof Array)) charts = [charts];
        for(i=0; i<charts.length; i++){
            chart = charts[i];
            this._rawCharts.push({
                type: chart.type,
                sRow: chart.srow,
                sCol: chart.scol,
                eRow: chart.erow,
                eCol: chart.ecol,
                x:  chart.x,
                y:  chart.y
            });
        }
    }

    var sheetData, row, rows, height, cells, cell, cellData, tmpRow;

    function getRowData(rData, r){
        var rowData = null;
        for(var k=0; k<rData.length; k++){
            if(rData[k].row == r){
                rowData = rData[k];
                break;
            }
        }
        return rowData;
    }

    function getCellData(cData, c){
        var cellData = null;        
        for(var k=0; k<cData.length; k++){
            if(cData[k].col == c){
                cellData = cData[k];
                break;
            }
        }
        return cellData;
    }

    sheetData = workSheet.SheetData;
    rows = sheetData.Row;
    if(rows){
        rows = (rows instanceof Array) ? rows : [rows];
    }

    this.data = new Array(this.ROWS);
    for (i = 0; i < this.ROWS; ++i) {
        this.data[i] = row =  new Array(this.COLS);
        tmpRow = rows ? getRowData(rows, i+1) : null;
        if(tmpRow){
            if(tmpRow.height) this.rowProps[i].height = tmpRow.height;
            cells = tmpRow.Cell;
            if(cells && !(cells instanceof Array)) cells = [cells];
        }
        for (var j = 0; j < this.COLS; ++j) {
            if(cells) cell = getCellData(cells, j+1);
            cell = cell || { row: i+1, col: j+1, type: "", decimals: "", editValue:"" };
            cellData = {
                row: cell.row,
                col: cell.col,
                type: cell.type,
                decimals: cell.decimals,
                editValue: cell.value,
                style: cell.Style
            };
            row[j] = ZmSpreadSheetCellModel.deserialize(this, cellData);
        }
        cells  = null;
        tmpRow = null;
    }


};

/* End of New Code */

/// A Range copy

ZmSpreadSheetClipboard = function(model, range, move) {
	this._move = !!move;
	this.model = model;
	this.geometry = ZmSpreadSheetModel.getRangeGeometry(range);
	this.range = range;
	this.bounds = this.geometry.bounds;
	var a = this.cells = model.getCellsInRange(range);
	if (!move) {
		// we need to copy contents
		for (var i = a.length; --i >= 0;)
			a[i] = a[i].clone();
	}
};

// row and col here should be from 0 to this.geometry.rows - 1 or
// this.geometry.cols - 1 respectively.
ZmSpreadSheetClipboard.prototype.getCell = function(row, col) {
	return this.cells[row * this.geometry.cols + col];
};

ZmSpreadSheetClipboard.prototype.setDelta = function(rows, cols) {
	this.delta = { rows: rows, cols: cols };
};

ZmSpreadSheetClipboard.prototype.paste = function(row, col, dest, dr, dc) {
	var src = this.getCell(row, col);
//  	alert("Pasting " + src._value + " to " + dest.getName() + " with delta " +
//  	      (this.delta.rows + dr) + " x " +
//  	      (this.delta.cols + dc));
	// deep copy style
	for (var i in src._style)
		dest._style[i] = src._style[i];
	if (src._expr) {
		// update formulae
		var e = src._expr;
		var formulae = e.shift(this.delta.rows + dr,
				       this.delta.cols + dc);
		dest._type = src._type;
		dest._decimals = src._decimals;
		dest.setEditValue("=" + formulae);
	} else {
		dest._type = src._type;
		dest._autoType = src._autoType;
		dest._decimals = src._decimals;
		dest.setEditValue(src.getEditValue());
	}
	if (this._move && !src._wasCut) {
		var clone = src.clone();
		this.cells[row * this.geometry.cols + col] = clone;
		clone._wasCut = true;
		src.clearAll();
	}
};

/// The Cell Model

ZmSpreadSheetCellModel = function(model, type, editValue, style) {
	if (editValue == null)
		editValue = "";
	if (type == null)
		type = null;	// cool isn't it...

	this._model = model;
	this._td = null;
	this._decimals = null;
	this._type = type;
	this._autoType = null;
	this._editValue = editValue;
	this._value = editValue;
	this._style = ZmSpreadSheetCellModel.getDefaultStyle(style);
	this._expr = null;
	this._affects = [];
};

ZmSpreadSheetCellModel.defaultStyle = {
	fontFamily        : "",
	fontWeight        : "",
	fontStyle         : "",
	fontSize          : "",
	backgroundColor   : "",
	color             : "",
	textAlign         : "",
	verticalAlign     : "",
	textDecoration    : ""
};

ZmSpreadSheetCellModel.prototype.serialize = function() {
	var tmp = {
		decimals  : this._decimals,
		type      : this._type,
		editValue : this._editValue,
		style     : this._style,
		row       : this.getRow(),
		col       : this.getCol()
	};
	return ZmSpreadSheetModel.serializeJSObject(tmp);
};

ZmSpreadSheetCellModel.deserialize = function(model, obj) {
	var cell = new ZmSpreadSheetCellModel(model, obj.type, obj.editValue, obj.style);
	cell._decimals = obj.decimals;
 	cell._savedRow = obj.row;
 	cell._savedCol = obj.col;
	return cell;
};

ZmSpreadSheetCellModel.getDefaultStyle = function(obj) {
	if (!obj)
		obj = {};
	var s = ZmSpreadSheetCellModel.defaultStyle;
	for (var i in s)
		if (typeof obj[i] == "undefined")
			obj[i] = s[i];
	return obj;
};

ZmSpreadSheetCellModel.prototype.clone = function() {
	var newCell = new ZmSpreadSheetCellModel(null);	// no model by default
	newCell._decimals  = this._decimals;
	newCell._type      = this._type;
	newCell._autoType  = this._autoType;
	newCell._editValue = this._editValue;
	newCell._value     = this._value;
	newCell._expr      = this._expr; // WARNING: calling code should *not*
					 // modify *our* expression directly.
	// deep copy style
	for (var i in this._style)
		newCell._style[i] = this._style[i];

	return newCell;
};

/*
//Commented as we do not set height/width on individual cell anymore

ZmSpreadSheetCellModel.prototype.setWidth = function(width) {
	if (this._td) {
		// var fuzz = AjxEnv.isIE ? 0 : -2;
		var fuzz = -2;
// 		this._td.style.width = width + fuzz + "px";
 		this._td.firstChild.style.width = width + fuzz + "px";
	}
};

ZmSpreadSheetCellModel.prototype.setHeight = function(height) {
    if(this._td){
        var fuzz = 0; //Correction if any according to browser
        this._td.firstChild.style.height = height + fuzz + "px";
    }
}; */

ZmSpreadSheetCellModel.prototype.getHtml = function() {
	var style = [];
	for (var i in this._style) {
		if (this._style[i] != "") {
			var css_name = i.replace(/([a-z])([A-Z])([a-z])/g, function(str, p1, p2, p3) {
				return p1 + "-" + p2.toLowerCase() + p3;
			});
			style.push(css_name + ":" + this._style[i]);
		}
	}
	var width = this._model.getColWidth(this.getCol() - 1);
	if (AjxEnv.isIE)
		width -= 2;
	style.push("width:" + width + "px");
	style.push("border:1px solid #aaa");
	if (style.length > 0)
		style = [ " style='", style.join(";"), "'" ].join("");
	else
		style = "";
	var cls = this.getType();
	if (cls)
		var cls = " class='SpreadSheet-Type-" + cls + "'";
	else
		cls = "";
	var val = AjxStringUtil.htmlEncode(this.getDisplayValue().toString());
	if (val == "")
		val = "&nbsp;";
	return [ "<td", cls, style, ">", val, "</td>" ].join("");
};


//TODO: Optimize the XML stored for Style node.
ZmSpreadSheetCellModel.prototype.getXML = function(row, col) {
    
    var styleN = AjxXmlDoc.createElement("Style");
    var flag = false;
    for (var i in this._style) {
		if (this._style[i] != "") {
			var css_name = i;
			if(css_name != "toString") {
				styleN.root.setAttribute(css_name,this._style[i]);
                flag = true;
			}
		}
	}
    
    if(!flag && !this._editValue && !this._decimals && !this._type) return null;

    var cellN = AjxXmlDoc.createElement("Cell");
	var cellRoot = cellN.root;
	cellRoot.setAttribute("row", row);
	cellRoot.setAttribute("col", col);
	cellRoot.setAttribute("value", (this._editValue ? this._editValue : ""));
    if(this._decimals)
	    cellRoot.setAttribute("decimals", (this._decimals ? this._decimals : ""));
	if(this._type)
        cellRoot.setAttribute("type", (this._type ? this._type : ""));
	if(flag) cellN.appendChild(styleN);

    return cellN;


};

ZmSpreadSheetCellModel.prototype.setToElement = function(el) {
	var div = el.firstChild;
	if (!div) {
		el.innerHTML = "<div class='Wrapper'></div>";
		div = el.firstChild;
	}
	var val = this.getDisplayValue();
	if (!/\S/.test(val))
		val = "\xA0";
	else
		val = val.toString().replace(/\s/g, "\xA0");
	div.innerHTML = "";
	div.appendChild(document.createTextNode(val));
	/*if (AjxEnv.isGeckoBased) {
		// A stupid Gecko bug don't trigger onmouseover events on the
		// table cells when we capture events for range selection,
		// _unless_ this div doesn't have "overflow: hidden".  Took
		// hours to debug. x-(
		//
		// OTOH, if we don't set this in IE then layout will be broken
		div.style.overflow = "visible";
	}*/
	this.setStyleToElement(el);
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

ZmSpreadSheetCellModel.prototype.setStyleToElement = function(el, special) {
	for (var i in this._style) {
		var val = this._style[i];
		switch (i) {
		    default :
			el.style[i] = val;
		}
	}
    //this._model.updateActiveCell(this.getRow(), this.getCol());
};

// Returns a set of _all_ cells affected by the current cell in an order
// appropriate for correct evaluation (level 1 dependencies first, etc.)
ZmSpreadSheetCellModel.prototype._mkDeps = function() {
	var deps = [];
	var count = {};
	function pushDeps(cell) {
		var a = cell._affects, i = 0, c, name;
		while (c = a[i++]) {
			name = c.getName();
			if (!count[name]) {
				count[name] = true;
				pushDeps(c);
				deps.unshift(c);
			}
		}
	};
	pushDeps(this);
	return deps;
};

ZmSpreadSheetCellModel.prototype.setValue = function(value, noDeps) {
	// on evil occasions, this function may get to be called recursively
	// (i.e. [A1]=B1 and [B1]=A1), thus we need to filter these situations
	// using a rude approach:
	if (!this._settingValue) {
		this._settingValue = true;
		this._value = value;
        //this._model.updateActiveCell(this.getRow(), this.getCol());
		this._model.triggerEvent("onCellValue", this.getRow(), this.getCol(), this);
		if (!noDeps) {
			var a = this._mkDeps();
			for (var i = 0; i < a.length; ++i)
				a[i].recompute();
		}
		this._settingValue = false;
	}
};

ZmSpreadSheetCellModel.prototype.getValue = function() {
	switch (this.getType()) {
	    case "currency":
	    case "percentage":
	    case "number":
		return ZmSpreadSheetFormulae.parseFloat(this._value);
	}
	return this._value;
};

ZmSpreadSheetCellModel.prototype.getEditValue =
function(){
     return this._editValue; 
};

ZmSpreadSheetCellModel.prototype.getDisplayValue = function() {
	var val = this.getValue();
	var type = this.getType();
	switch (type) {
	    case "number":
		if (!/\S/.test(this._editValue)) {
			val = "";
		} else {
			val = ZmSpreadSheetFormulae.parseFloat(val);
			if (this._decimals != null)
				val = val.toFixed(this._decimals);
		}
		break;

	    case "currency":
		val = ZmSpreadSheetFormulae.parseFloat(val);
		if (this._decimals != null)
			val = val.toFixed(this._decimals);
		val = "$" + val;
		break;

	    case "percentage":
		val = ZmSpreadSheetFormulae.parseFloat(val);
		if (this._decimals != null)
			val = val.toFixed(this._decimals);
		val = val + "%";
		break;

        case "date":
        this._formatter = new AjxDateFormat("MM/dd/yy");
        //try to pick first matching pattern        
        var date = null;
        for(var i in ZmSpreadSheetModel.DATE_FORMATS) {
            var pattern = ZmSpreadSheetModel.DATE_FORMATS[i];
            var nDate = (new AjxDateFormat(pattern)).parse(val);
            if(nDate) {
                date = nDate;
                break;
            }

        }
        val = date ? this._formatter.format(date) : val;
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
	this.setValue(this._expr.eval(), true);
};

ZmSpreadSheetCellModel.prototype.updateExpression = function() {
	if (this._expr) {
		var new_formula = this._expr.update();
		if (new_formula) {
			this._editValue = '=' + new_formula;
			this.recompute();
		}
	}
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
	else if (/^=(.+)$/.test(str)) {
		val = RegExp.$1;
		if (/\S/.test(val))
			type = "expression";
		else
			val = str;
	}

	// number
	else if (/^(\-?[0-9]*\.?[0-9]+)$/.test(str)) {
		type = "number";
		val = RegExp.$1;
	}

	// currency
	else if (/^\$\s*(\-?[0-9]*\.?[0-9]+)$/.test(str) ||
		 /^(\-?[0-9]*\.?[0-9]+)\$$/.test(str)) {
		type = "currency";
		val = RegExp.$1;
		if (this._decimals == null)
			this._decimals = 2;
                
    //  precentage
	} else if (/^(\-?[0-9]*\.?[0-9]+)\s*%$/.test(str)) {
		type = "percentage";
		val = RegExp.$1;

    // date
	} else if (/^(\d{1,2})(\/|-|\.)(\d{1,2})(\/|-|\.)(\d{2}|\d{4})$/.test(str)){
        if(AjxDateUtil.validDate(RegExp.$5, (RegExp.$1 - 1), RegExp.$3)){
             type = "date";
             this._editValue = val =   [RegExp.$1,"/",RegExp.$3,"/",RegExp.$5].join("");
        }
    }

	// look, incidentally all values are retrieved with RegExp.$1 :-)
	// *incidentally*, I say..

	return { type: type, val: val };
};

ZmSpreadSheetCellModel.prototype.getType = function() {
	return this._type || this._autoType || "string";
};

ZmSpreadSheetCellModel.prototype.setType = function(type) {
	this._type = type;
	if (type == null) {
		var auto = this._determineType(this.getValue());
		this._value = auto.val;
		this._type = auto.type;
	} else if (type == "currency" && this._decimals == null)
		this._decimals = 2;
	if (this._td)
		this.setToElement(this._td);
    //this._model.updateActiveCell(this.getRow(), this.getCol());
};

ZmSpreadSheetCellModel.prototype.getDecimals = function() {
	return this._decimals;
};

ZmSpreadSheetCellModel.prototype.setDecimals = function(dec) {
	this._decimals = dec;
	var type = this.getType();
	if (type == "currency" && dec == null)
		this._decimals = 2;
	if (this._td)
		this.setToElement(this._td);
    //this._model.updateActiveCell(this.getRow(), this.getCol());
};

ZmSpreadSheetCellModel.prototype.clearValue = function() {
	this._type = null;
	this.setEditValue("");	// for now
};

ZmSpreadSheetCellModel.prototype.clearStyle = function() {
	this._style = ZmSpreadSheetCellModel.getDefaultStyle();
	if (this._td)
		this.setStyleToElement(this._td);
};

ZmSpreadSheetCellModel.prototype.clearAll = function() {
	this._type = this._decimals = null;
	this.clearStyle();
	this.clearValue();
};

ZmSpreadSheetCellModel.prototype.setEditValue = function(editValue, force) {
	if (force || editValue != this._editValue) {
		this._editValue = editValue;
		var val = editValue;

		var auto = this._determineType(editValue);
		this._autoType = auto.type;
		if (auto.type == "expression") {
			var expr;
			try {
				expr = new ZmSpreadSheetFormulae(this._model, auto.val);
				this._errorMessage = null;
			} catch(ex) {
				expr = null;
				this._errorMessage = ex;
				val = "#ERROR";
			}
			this.setExpression(expr);
			if (expr) {
				val = expr.eval();
				if (expr.decimals != null && this._decimals == null)
					this._decimals = expr.decimals;
				auto = this._determineType(val);
				this._autoType = expr.autoType || auto.type;
				if (this._autoType == "currency")
					// FIXME: this stinks.
					val = auto.val;
			} else {
				this._type = null;
				this._autoType = "error";
			}
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

		this.setValue(val);
		//this._model.triggerEvent("onCellEdit", this.getRow(), this.getCol(), this);
	}
};

ZmSpreadSheetCellModel.prototype.getEditValue = function() {
	return this._expr
		? "=" + this._expr.getFormula()
		: this._editValue;
};

ZmSpreadSheetCellModel.prototype.getRow = function() {
	if (this._td)
		return this._td.parentNode.rowIndex;
	else
		return this._savedRow;
};

ZmSpreadSheetCellModel.prototype.getCol = function() {
	if (this._td)
		return this._td.cellIndex;
	else
		return this._savedCol;
};

ZmSpreadSheetCellModel.prototype._getTD = function() {
	return this._td;
};

ZmSpreadSheetCellModel.prototype.getName = function() {
	if (this._td || (this._savedRow && this._savedCol))
		return ZmSpreadSheetModel.getCellName(this.getRow(), this.getCol());
	else
		return "##";
};

ZmSpreadSheetCellModel.prototype.setStyleProp = function(prop, val) {
	this._style[prop] = val;
	if (this._td)
		this.setStyleToElement(this._td);
};

ZmSpreadSheetCellModel.prototype.getStyleProp = function(prop) {
	return this._style[prop];
};

ZmSpreadSheetCellModel.prototype.isEmpty = function() {
	return this._editValue == "";
};

ZmSpreadSheetCellModel.prototype.getTooltipText = function() {
	var html = [ "<div class='ZmSpreadSheet-Tooltip'>",
		     "<div class='CellName'>", ZmMsg.cell, " - ", this.getName(), "</div>" ];
	if (!this.isEmpty())
		html.push("<div class='CellType'>", ZmMsg.type, ": ", this.getType(), "</div>");
	else
		html.push("<div class='CellType'>", ZmMsg.emptyCell, "</div>");
	if (this._errorMessage) {
		html.push(ZmMsg.editValue, ": ", this._editValue);
		html.push("<div class='CellExprError'>", this._errorMessage, "</div>");
	} else if (this._expr) {
		html.push(ZmMsg.expression, ":");
		html.push("<div class='CellExpr'>[", this._expr.toString(), "]</div>");
	}
	if (ZmSpreadSheetModel.DEBUG) {
		// DEBUG!
		var a = this._affects;
		if (a.length > 0) {
			html.push("Directly affects cells:<br />");
			for (var i = 0; i < a.length; ++i)
				html.push(a[i].getName(), " ");
			html.push("<br />");
		}
		a = this._mkDeps();
		if (a.length > 0) {
			html.push("Affects cells:<br />");
			for (var i = 0; i < a.length; ++i)
				html.push(a[i].getName(), " ");
			html.push("<br />");
		}
		var span = this._td.firstChild;
		if (span.offsetWidth >= this._td.offsetWidth)
			html.push("Value:", "<div class='CellValue'>", this.getDisplayValue(), "</div>");
	}
	html.push("</div>");
	return html.join("");
};