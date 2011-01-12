/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011 Zimbra, Inc.
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
 * A SpreadSheet Widget.
 * @author Mihai Bazon, <mihai@zimbra.com>
 */
ZmSpreadSheet = function(parent, controller, className, posStyle, deferred) {
	if (arguments.length == 0)
		return;
	className = className || "ZmSpreadSheet";
	DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle, deferred:deferred});

    this._controller = controller;

	this._selectRangeCapture = new DwtMouseEventCapture({
		targetObj:this,
		id:"ZmSpreadSheet",
        mouseMoveHdlr: AjxCallback.simpleClosure(this._table_selrange_MouseMove, this),		
		mouseUpHdlr:AjxCallback.simpleClosure(this._clear_selectRangeCapture, this)
	});

    this._autofillRangeCapture = new DwtMouseEventCapture({
        targetObj: this,
        id: "ZmSpreadSheet-AutoFill",
        mouseMoveHdlr:AjxCallback.simpleClosure(this._table_autofill_mouseMove, this),
        mouseUpHdlr:AjxCallback.simpleClosure(this._table_autofill_mouseUp, this)
    });

	this._colsizeCapture = new DwtMouseEventCapture({
		targetObj:this,
		id:"ZmSpreadSheet-Col",
		mouseMoveHdlr:AjxCallback.simpleClosure(this._colsize_mouseMove, this),
		mouseUpHdlr:AjxCallback.simpleClosure(this._colsize_mouseUp, this)
	});

    this._rowsizeCapture = new DwtMouseEventCapture({
        targetObj:  this,
        id:"ZmSpreadSheet-Row",
        mouseMoveHdlr:AjxCallback.simpleClosure(this._rowsize_mouseMove, this),
		mouseUpHdlr:AjxCallback.simpleClosure(this._rowsize_mouseUp, this)
    });

	this._onResize = new AjxListener(this, this._onResize);
	this._hoverOverListener = new AjxListener(this, this._handleOverListener);
	this._hoverOutListener = new AjxListener(this, this._handleOutListener);
	this.addControlListener(this._onResize);
	this.onSelectCell = [];
	this.onInputModified = [];

    //TODO: Replace it with DwtKeyBoardMgr
    Dwt.setHandler(document, DwtEvent.ONKEYPRESS, AjxCallback.simpleClosure(this._keyPress, this));
    if (AjxEnv.isIE || AjxEnv.isOpera)
		Dwt.setHandler(document, DwtEvent.ONKEYDOWN, AjxCallback.simpleClosure(this._keyPress, this));

    //copy-paste
    Dwt.setHandler(document, DwtEvent.ONBLUR, AjxCallback.simpleClosure(this._clipboard_blur, this));
};

ZmSpreadSheet.TOOLTIP_DELAY = 750;

// custom HTML attributes for our data
// ZmSpreadSheet.ATTR = {
// 	EDIT  : "ZmSpreadSheet-edit",    // the value edited by the end-user
// 	VALUE : "ZmSpreadSheet-value"    // the computed value (which is actually displayed)
// };

ZmSpreadSheet.prototype = new DwtComposite;
ZmSpreadSheet.prototype.construction = ZmSpreadSheet;

ZmSpreadSheet.prototype.getXML = function(){
    var cell = this.getCellModel(this._selectedCell);
    var params = {
        selCol: cell.getCol(),
        selRow: cell.getRow()
    };
    return (this._model ? this._model.getXML(params).getDocXml() : null);
};

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

/*ZmSpreadSheet.prototype._model_cellEdited = function(row, col, cell) {
	var td = this._getTable().rows[row].cells[col];
	cell.setToElement(td);
};*/

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
    var newIndex = rowIndex + 1;  // add 1 to skip the header row
	var row = this._getTable().insertRow(newIndex);
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
		td.innerHTML = "<div>" + (newIndex) + "</div>";
	}
	// (2) create element cells and inform the model cells about them
	for (var i = 0; i < cells.length; ++i) {
		var td = row.insertCell(i + 1);
		td.className = "cell";
		cells[i]._td = td;
		cells[i].setToElement(td);
	}

    this._setRowHeight(rowIndex);

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
    this._setColWidth(colIndex);
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
	
	this._tableID = Dwt.getNextId();
    this._autoFillID = Dwt.getNextId();

    //AutoFill Div
    html.push("<div class='AutoFill' id='",this._autoFillID,"'><img src='",appContextPath,"/img/zimbra/ImgBlank_9.gif' width='5' height='5'/></div>");

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

    var autoFill = this._getAutoFill();
    autoFill.onmousedown = AjxCallback.simpleClosure(this._table_autoFill_mouseDown, this);
    autoFill.style.display = "none";
    
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

    this._table_setColWidths();
    this._table_setRowHeights();

	this.getHtmlElement().style.display = "";
	this._header_resetColWidths();

    this._showCharts();
};

ZmSpreadSheet.prototype._getAutoFillRangeDiv = function(){
    if (!this._autoFillRangeDiv){
		this._autoFillRangeDivID = Dwt.getNextId();
		var div = this._autoFillRangeDiv = document.createElement("div");
		div.id = this._autoFillRangeDivID;
		div.className = "ShowAutoFillRange";
		div.style.display = "none";
		this._getRelDiv().appendChild(div);		
	}
	return this._autoFillRangeDiv;
};

ZmSpreadSheet.prototype._isRangeEqual = function(range1, range2){
    var sR1 = Math.min(range1.sR, range1.eR);
    var sC1 = Math.min(range1.sC, range1.eC);
    var eR1 = Math.max(range1.sR, range1.eR);
    var eC1 = Math.max(range1.sC, range1.eC);

    var sR2 = Math.min(range2.sR, range2.eR);
    var sC2 = Math.min(range2.sC, range2.eC);
    var eR2 = Math.max(range2.sR, range2.eR);
    var eC2 = Math.max(range2.sC, range2.eC);

    if(sR1 == sR2 && sC1 == sC2 && eR1 == eR2 && eC1 == eC2){
        return true;
    }
    
    return false;
}

ZmSpreadSheet.prototype._table_autofill_mouseMove = function(ev){

    var dwtev = new DwtMouseEvent();
    dwtev.setFromDhtmlEvent(ev);


    var el = DwtUiEvent.getTarget(dwtev);
    var td;

    if(el.id == this._autoFillRangeDivID){

        var startRow = this._aRangeStartRow;
        var startCol = this._aRangeStartCol;
        var endRow   = this._aRangeEndRow;
        var endCol   = this._aRangeEndCol;

        var posX = dwtev.docX + this._getRelDiv().scrollLeft;
        var posY = dwtev.docY + this._getRelDiv().scrollTop;
        posY = posY - this._getRelDiv().offsetTop; // Relative height according to reldiv.

        var colDiff = ( startCol <= endCol ) ? (endCol == 0 ? 0 : 1 ) : -1;
        var rowDiff = ( startRow <= endRow ) ? (endRow == 0 ? 0 : 1 ) : -1
        if(this.isRange()){

            if((startCol == this._startRangeCol && endCol == this._endRangeCol) && this._checkBoundriesForRange(posX, posY, endRow, startCol, endRow, endCol)){
                td = null;
            }else if((startRow == this._startRangeRow && endRow == this._endRangeRow) && this._checkBoundriesForRange(posX, posY, startRow, endCol, endRow, endCol)){
                td = null;                
            }else if(this._checkBoundriesForRange(posX, posY, this._startRangeRow, this._startRangeCol, this._endRangeRow, this._endRangeCol)){
                td = null;
                if(!this._isRangeEqual({sR: startRow, sC: startCol, eR: endRow, eC: endCol}, {sR: this._startRangeRow, sC:this._startRangeCol, eR:this._endRangeRow, eC:this._endRangeCol})){
                    this._showAutoFillRange(this._startRangeRow, this._startRangeCol, this._endRangeRow, this._endRangeCol);
                }
                //Improved performance after tracking near by cell navigation
            }else if(this._checkBoundries(posX, posY, this._getCell(endRow - rowDiff, endCol ))) { //Chk  Up Cell
                td = this._getCell(endRow - rowDiff, endCol);
            }else if(this._checkBoundries(posX, posY, this._getCell(endRow, endCol - colDiff))){ //Chk Left Cell
                td = this._getCell(endRow, endCol - colDiff);
            }else if(this._checkBoundriesForRange(posX, posY, startRow, startCol, endRow, endCol)){ //Chk for Random Cell
                td = this._findCell( posX, posY, startRow, startCol, endRow, endCol);
            }
        }else{
            if(this._checkBoundries(posX, posY, this._getCell(endRow, endCol))){  //Chk self, EndCell already selected, so neglect it
                td = null;
            }else if(startCol == endCol && this._checkBoundries(posX, posY, this._getCell(endRow - rowDiff, endCol ))) { //Chk  Up Cell
                td = this._getCell(endRow - rowDiff, endCol);
            }else if(startRow == endRow && this._checkBoundries(posX, posY, this._getCell(endRow, endCol - colDiff))){ //Chk Left Cell
                td = this._getCell(endRow, endCol - colDiff);
            }else if(this._checkBoundriesForRange(posX, posY, startRow, startCol, endRow, endCol)){ //Chk for Random Cell
                td = this._findCell( posX, posY, startRow, startCol, endRow, endCol);
            }
        }

    }else{

        td = el;
        var table = this._getTable();
        while (td && td !== table && !/^td$/i.test(td.tagName))
            td = td.parentNode;
    }

    if (td && /^td$/i.test(td.tagName) && td.cellIndex > 0 && td.parentNode.rowIndex > 0) {

        var destCell = td;
        var startRow, startCol, endRow, endCol;
        if(this.isRange()){

            var dRow =  destCell.parentNode.rowIndex - 1;
            var dCol =  destCell.cellIndex - 1;

            startRow =  Math.min(this._startRangeRow, this._endRangeRow);
            startCol =  Math.min(this._startRangeCol, this._endRangeCol);
            endRow   =  Math.max(this._startRangeRow, this._endRangeRow);
            endCol   =  Math.max(this._startRangeCol, this._endRangeCol);

            if(dRow >= startRow && dRow <= endRow){
                 if(dCol > endCol)          endCol   = dCol;
                 else if(dCol < startCol)   startCol = dCol;
            }else {
                if(dRow > endRow)           endRow   = dRow;
                else if(dRow < startRow)    startRow = dRow;
            }
        }else{

            var srcCell = this._selectedCell;            
            startRow = srcCell.parentNode.rowIndex - 1;
            startCol = srcCell.cellIndex - 1;

            endRow =  destCell.parentNode.rowIndex - 1;
            endCol =  destCell.cellIndex - 1;

            if(startRow != endRow && startCol != endCol ){
                endCol = startCol;
            }           
        }        
        
        if(!(this._isRangeEqual({sR: startRow, sC: startCol, eR: endRow, eC: endCol}, {sR: this._aRangeStartRow, sC:this._aRangeStartCol, eR:this._aRangeEndRow, eC:this._aRangeEndCol}))){
            this._showAutoFillRange(startRow, startCol, endRow, endCol);
        }

    }

    dwtev._stopPropagation = true;
    dwtev._returnValue = false;
    dwtev.setToDhtmlEvent(ev);
    
};

ZmSpreadSheet.prototype._hideAutoFillRange = function(){

    this._isAutoFillRange = false;

	var div = this._getAutoFillRangeDiv();
	div.style.display = "none";

	//Tnks Mihai, amazing performance improvement:
	div.style.top = "0px";
	div.style.left = "0px";
	div.style.width = "5px";
	div.style.height = "5px";

};

ZmSpreadSheet.prototype._showAutoFillRange = function(sRow, sCol, eRow, eCol){

    this._isAutoFillRange = true;

    this._aRangeStartRow  = sRow;
    this._aRangeStartCol  = sCol;
    this._aRangeEndRow    = eRow;
    this._aRangeEndCol    = eCol;

    var startRow = Math.min(sRow, eRow);
    var startCol = Math.min(sCol, eCol);
    var endRow   = Math.max(sRow, eRow);
    var endCol   = Math.max(sCol, eCol);

	this._model.checkBounds(startRow, startCol);
	this._model.checkBounds(endRow, endCol);

	var r1 = this._getTable().rows[startRow + 1];
	var r2 = this._getTable().rows[endRow + 1];
	if (!r1 || !r2)
		this._hideRange();
	var c1 = r1.cells[startCol + 1];
	var c2 = r2.cells[endCol + 1];


	// and we have the top-left cell in c1 and bottom-right cell in c2
	var div = this._getAutoFillRangeDiv();
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

ZmSpreadSheet.prototype._table_autofill_mouseUp = function(ev) {

    var dwtev = new DwtMouseEvent();
    dwtev.setFromDhtmlEvent(ev);

    this._model.paste(this._autoFillClipboard, ZmSpreadSheetModel.getRangeName(this._aRangeStartRow+1, this._aRangeStartCol+1, this._aRangeEndRow+1, this._aRangeEndCol+1));

    this._autofillRangeCapture.release();

    this._hideAutoFillRange();

    //Now Select the whole range after fill series
    this._showRange(this._aRangeStartRow, this._aRangeStartCol, this._aRangeEndRow, this._aRangeEndCol);
    
    dwtev._stopPropagation = true;
    dwtev._returnValue = false;
    dwtev.setToDhtmlEvent(ev);
};

ZmSpreadSheet.prototype._table_autoFill_mouseDown = function(ev) {
    
    var dwtev = new DwtMouseEvent();
    dwtev.setFromDhtmlEvent(ev);

    this._autoFillClipboard = new ZmSpreadSheetClipboard
		(this._model, this.getSelectionRange(), false);

    this._getAutoFillRangeDiv();

    this._autofillRangeCapture.capture();

    dwtev._stopPropagation = true;
    dwtev._returnValue = false;
    dwtev.setToDhtmlEvent(ev);
};

ZmSpreadSheet.prototype._getAutoFill = function(){
    if(!this._autoFillDiv){
        this._autoFillDiv = document.getElementById(this._autoFillID);
    }
    return this._autoFillDiv;
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
ZmSpreadSheet.prototype._leftCellClicked = function(td, dwtEv) {

    var index = this._resizeRowIndex;
    if (index) {
        this._hideRange();
        var td = this._getTable().rows[index].cells[0];
        this._rowsizeArgs = {
            td       : td,
            h        : td.firstChild.offsetHeight,
            docX      : dwtEv.docX,
            docY      : dwtEv.docY
        };
        this._rowsizeCapture.capture();
        dwtEv._stopPropagation = true;
        dwtEv._returnValue = false;
    }else{
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
    var is_dblclick  = /dblclick/i.test(ev.type);

	this._hideRange();
    if (AjxEnv.isIE && DwtMenu._activeMenu)
		DwtMenu._activeMenu.popdown();

	if (is_mousedown) {

		var stopEvent = true;
		if (this._editingCell && this._hasExpression) {
            //this._selectCell(td);
            var cN = ZmSpreadSheet.getCellName(td);
            cN = cN+":"+cN;
            this._showRangeByRangeName(cN);
			var input = this._getInputField();
			var start = Dwt.getSelectionStart(input);
			var str = input.value.substr(0, start);
			if (/\)\s*$/.test(str)){
				stopEvent = false;
            }
			else{
                this._editRangeSelectedCell = td;
				this._updateCellRangeToken();
                stopEvent = true;
            }
		} else{
            if(this._editingCell){
                this._input_blur();
            }
            if(ev.shiftKey && this._selectedCell && ( this._selectedCell != td )){
                this._selectRange(ZmSpreadSheet.getCellName(this._selectedCell),
					  ZmSpreadSheet.getCellName(td), true);
            }else{
                this._selectCell(td);
            }
        }
		if (stopEvent) {
			ev._stopPropagation = true;
			ev._returnValue = false;
			this._selectRangeCapture.capture();
		}
	}

    if(is_dblclick){
        ev._stopPropagation = true;
		ev._returnValue = false;
		this._editCell(td);
    }

};

ZmSpreadSheet.prototype.focus = function() {
	if (!this._selectedCell)
		this._selectCell(this._getTable().rows[1].cells[1]);
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
    var row = rows ? rows[rowIndex] : null;
	return (row ? row.cells[0] : null);
};


ZmSpreadSheet.prototype._table_setRowHeights = function(){

    var r = this._model.ROWS;
    var table = this._getTable();

    for (var i = 0; i < r; ++i) {
		var row = table.rows[i + 1];
        var headerRowCell = row.cells[0];
        headerRowCell.firstChild.style.height = this._model.getRowHeight(i) + "px";
    }
};


ZmSpreadSheet.prototype._setRowHeight = function(row, height){

     var headerRowCell = this._getTable().rows[ row + 1 ].cells[0];
     height = height || this._model.getRowHeight(row);

     headerRowCell.firstChild.style.height = height + "px";
     this._model.setRowHeight(row, height);
};

//TODO: Allow to shrink further
ZmSpreadSheet.MIN_ROW_HEIGHT = 11; //Since Font Size is 11px;

ZmSpreadSheet.prototype._rowsize_mouseMove = function(ev) {

   var dwtev = new DwtMouseEvent();
   dwtev.setFromDhtmlEvent(ev);

    var fuzz = 0;
    var delta = dwtev.docY - this._rowsizeArgs.docY;
    var h1 = this._rowsizeArgs.h + delta + fuzz;

    if(h1 > ZmSpreadSheet.MIN_ROW_HEIGHT ){
        this._rowsizeArgs.td.firstChild.style.height = h1 + "px";
        this._rowsizeArgs.delta = delta;
    }

    dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._rowsize_mouseUp = function(ev){

    var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);

    var delta = this._rowsizeArgs.delta;
    if(delta){
        var index = this._resizeRowIndex;
        var h = this._model.getRowHeight(index - 1);
        if( (h + delta) > ZmSpreadSheet.MIN_ROW_HEIGHT) {
            this._setRowHeight(index-1, h + delta);
        }
    }

    // null out some things to make sure we don't leak
	this._rowsizeArgs.td = null;
	this._rowsizeArgs = null;

    this._rowsizeCapture.release();

	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};


ZmSpreadSheet.prototype._table_setColWidths = function(){

    var c = this._model.COLS;
    var row = this._getTable().rows[0];
    var headerColCell;
    for(i = 0; i < c; i++ ){
       headerColCell = row.cells[i+1];
       headerColCell.firstChild.style.width = this._model.getColWidth(i) + "px";
    }
};

ZmSpreadSheet.prototype._setColWidth = function(col, width){
    var headerColCell = this._getTable().rows[0].cells[col + 1];
    width = width || this._model.getColWidth(col);

    headerColCell.firstChild.style.width = width + "px";
    this._model.setColWidth(col, width);
    
};

//TODO: Allow to shrink further
ZmSpreadSheet.MIN_COL_WIDTH = 7;

ZmSpreadSheet.prototype._colsize_mouseMove = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	var delta = dwtev.docX - this._colsizeArgs.docX;
	var fuzz = AjxEnv.isIE ? 0 : -2;

    var w = this._colsizeArgs.w + delta + fuzz;
    if(w > ZmSpreadSheet.MIN_COL_WIDTH){
        this._colsizeArgs.td.firstChild.style.width  = w + "px";
        this._colsizeArgs.col.firstChild.style.width = w + "px";
        this._colsizeArgs.delta = delta;
    }
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._colsize_mouseUp = function(ev) {
	var dwtev = new DwtMouseEvent();
	dwtev.setFromDhtmlEvent(ev);
	this._colsizeCapture.release();
	var delta = this._colsizeArgs.delta;
	if (delta) {
		var index = this._resizeColIndex;
        var w = this._model.getColWidth(index - 1);
        if( ( w + delta ) > ZmSpreadSheet.MIN_COL_WIDTH){
            this._setColWidth(index - 1, w + delta);
        }
	}
	// null out some things to make sure we don't leak
	this._colsizeArgs.td = null;
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
        var col = this._getTable().rows[0].cells[this._resizeColIndex];
		this._colsizeArgs = {
			td       : td,
            col      : col,
			w        : td.firstChild.offsetWidth,
			docX      : dwtev.docX,
			docY      : dwtev.docY
		};
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
			var tdX = dwtev.docX - tmp.x - td.offsetLeft; //+ this._getRelDiv().scrollLeft;
			if (Math.abs(tdX - td.offsetWidth) < 5) {
				this._resizeColIndex = index;
				Dwt.delClass(table, "Header-ColWSize", "Header-ColESize");
			} else if (tdX < 5 && index > 1) {
				this._resizeColIndex = index - 1;
				Dwt.delClass(table, "Header-ColESize", "Header-ColWSize");
			} else {
				this._resizeColIndex = null;
				Dwt.delClass(table, "Header-ColWSize");
				Dwt.delClass(table, "Header-ColESize");
			}
		}
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

ZmSpreadSheet.prototype.getToolbar = function(){
    if(!this._toolbar){
        this._toolbar = this._controller._toolbar;
    }
    return this._toolbar;
};

ZmSpreadSheet.prototype._selectCell = function(td) {

	if (this._selectedCell) {        
		Dwt.delClass(this._getTopHeaderCell(this._selectedCell), "TopSelected");
		Dwt.delClass(this._getLeftHeaderCell(this._selectedCell), "LeftSelected");
		Dwt.delClass(this._selectedCell, "SSelected");
	}
	this._selectedCell = td;
	if (td) {

        if(this.isRange() && !this._editingCell){
            this._hideRange();
        }
        
		Dwt.addClass(td, "SSelected");
		Dwt.addClass(this._getTopHeaderCell(td), "TopSelected");
		Dwt.addClass(this._getLeftHeaderCell(td), "LeftSelected");
		this._getTopLeftCell().innerHTML = "<div>" + ZmSpreadSheet.getCellName(td) + "</div>";

        var autoFill = this._getAutoFill();
        autoFill.className = "AutoFill";
        autoFill.style.top = td.offsetTop + td.offsetHeight - 4 + "px";
        autoFill.style.left = td.offsetLeft + td.offsetWidth - 4 + "px";
        autoFill.style.display = "block";
        
		if (!this._editingCell) {
			this.focus();
			for (var i = this.onSelectCell.length; --i >= 0;)
				this.onSelectCell[i].run(this.getCellModel(td), td);
		}
	}
    //FileName input field Blur
    if(!this._editingCell){
        this.getToolbar().get("fileName").blur();
    }
};

ZmSpreadSheet.prototype._getHeaderTable = function() {
	return document.getElementById(this._headerID);
};

ZmSpreadSheet.prototype._getRelDiv = function() {
	return document.getElementById(this._relDivID);
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

        if(this.isRange()){
            this._hideRange();
        }

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

        //Hide AutoFill Div
        var autoFill = this._getAutoFill();        
        autoFill.style.display = "none";

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
	if (!this._preventSaveOnBlur && this._editingCell)
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

ZmSpreadSheet.prototype._handleKey = function(dwtev, ev) {
	var needs_keypress = AjxEnv.isIE || AjxEnv.isOpera;
	this.focus();
	var handled = true;
	var is_movement = false;
	var old_sel = this._selectedCell;
    var td;
	switch (dwtev.keyCode) {
	    case 9: // TAB
		td = dwtev.shiftKey
			? this._getPrevCell()
			: this._getNextCell();
		if (td)
			this._selectCell(td);
		break;

	    case 37: // LEFT
	    case 39: // RIGHT
        td = (dwtev.shiftKey && this._shiftRangeEnd) ? this._shiftRangeEnd : this._selectedCell;                
		td = dwtev.keyCode == 37
			? this._getLeftCell(td)
			: this._getRightCell(td);
        if(!dwtev.shiftKey && td){
            this._selectCell(td);
        }else{
           is_movement = true;
        }		
		break;

        case 13: //ENTER
        td = ( dwtev.shiftKey
			      ? this._getUpCell()
			      : this._getDownCell());
        if(td) this._selectCell(td);
        break;

        case 38:    //UP
        case 40:    //DOWN
        td = (dwtev.shiftKey && this._shiftRangeEnd) ? this._shiftRangeEnd : this._selectedCell;                
        td = ( dwtev.keyCode == 38
			      ? this._getUpCell(td)
			      : this._getDownCell(td)
                );
        if(!dwtev.shiftKey && td){
            this._selectCell(td);
        }else{
            if(this._editingCell){
                is_movement = false;
                handled = false;
            }else{
                is_movement = false;
            }           
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
		    this._showRangeByRangeName(this._selectedRangeName);
        }        
        // the selected cell _can_ be outside the selected range. ;-)
		// let's clear that too.
		this.getCellModel(this._selectedCell).clearValue();
		break;

	    case 27:
		this._hideRange();
		break;

	    default:
        if(!this._editingCell && dwtev.keyCode == 8){ //BackSpace
            this._handleDelKey(dwtev);
        }else if (!this._editingCell && !dwtev.isCommand() && ( (!needs_keypress && ev.charCode) ||
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
                    //handled = true;
                    this.clipboardCopy();

                    //Copy Data to System
                    this.focusTextArea();
                    this._addDataToTextArea();

                }
                break;

            case "x":	// CUT
                if (dwtev.isCommand()) {
                    handled = true;
                    this.clipboardCut();
                }
                break;

            case "v":	// PASTE
                if(dwtev.isCommand()){
                    if (this.hasClipboardData()) {
                        handled = true;
                        this.clipboardPaste();
                    }else{
                        this.focusTextArea();
                        window.setTimeout(AjxCallback.simpleClosure(this._pasteFromTextArea, this), 50);
                    }
                }
                break;

        }
	}
	if (handled) {
		dwtev._stopPropagation = true;
		dwtev._returnValue = false;
	}
	if (is_movement) {
		if (dwtev.shiftKey && !this._shiftRangeStart){
			this._shiftRangeStart = old_sel;
            this._shiftRangeEnd = old_sel;
        }else if (!dwtev.shiftKey) {
			this._shiftRangeStart = null;
            this._shiftRangeEnd = null;
			this._hideRange();
		}
		if (this._shiftRangeStart && td) {
            this._shiftRangeEnd = td;
			// we select the range between _shiftRangeStart and _selectedCell
			this._selectRange(ZmSpreadSheet.getCellName(this._shiftRangeStart),
					  ZmSpreadSheet.getCellName(this._shiftRangeEnd), false);
		}
	}
	return handled;
};

ZmSpreadSheet.prototype._handleDelKey =
function(ev){
    if (this._selectedRangeName) {
        this._model.forEachCell(this._selectedRangeName,
                function(cell) {
                    if (ev.isCommand())
                        cell.clearAll();
                    else
                        cell.clearValue();
                });
        this._showRangeByRangeName(this._selectedRangeName);
    }
    
    // the selected cell _can_ be outside the selected range. ;-)
    // let's clear that too.
    this.getCellModel(this._selectedCell).clearValue();
};

ZmSpreadSheet.prototype._keyPress = function(ev) {
	this._clearTooltip();
	ev || (ev = window.event);
	var dwtev = new DwtKeyEvent();
	dwtev.setFromDhtmlEvent(ev);
    var targetEl = DwtUiEvent.getTarget(dwtev);

    var fileName = this.getToolbar().get("fileName");
    if(targetEl == fileName.getInputElement() || ( this._import && targetEl == this._import)){
        dwtev._stopPropagation = true;
        dwtev._returnValue = true;
    }else{
	    this._handleKey(dwtev, ev);
    }
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
			this._handleKey(dwtev, ev);
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
				this._handleKey(dwtev, ev);
			} else{                
				input._caretMoved = true;
                dwtev._stopPropagation = true;
                dwtev._returnValue = true;
            }
            //setTimer = false;
 			break;

		    case 38: // UP
		    case 13: // ENTER
		    case 40: // DOWN
			setTimer = false;
			this._save_value(input.value);
			input.blur();
			this._handleKey(dwtev, ev);
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
        if(setTimer){
            dwtev._stopPropagation = true;
            dwtev._returnValue = true;
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
        this._showRange(c1.row, c1.col, c2.row, c2.col);
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

ZmSpreadSheet.prototype._showRangeByRangeName = function(rangeName){

    var a = rangeName.split(/:/);
    // now a[0] is the supposedly start cell and a[1] the end cell
    var c1 = ZmSpreadSheetModel.identifyCell(a[0]);
    var c2 = ZmSpreadSheetModel.identifyCell(a[1]);

    this._showRange(c1.row, c1.col, c2.row, c2.col);

};

ZmSpreadSheet.prototype._showRange = function(sRow, sCol, eRow, eCol) {

    this._isRange = true;

    this._startRangeRow = sRow;
    this._startRangeCol = sCol;
    this._endRangeRow   = eRow;
    this._endRangeCol   = eCol;

    //Logic to Select Range

    var startRow = Math.min(sRow, eRow);
    var startCol = Math.min(sCol, eCol);
    var endRow   = Math.max(sRow, eRow);
    var endCol   = Math.max(sCol, eCol);

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

    //Display AutoFill
    var autoFill = this._getAutoFill();
    autoFill.className = "AutoFill AutoFillRange";
    autoFill.style.top = c2.offsetTop + c2.offsetHeight - 4 + "px";
    autoFill.style.left = c2.offsetLeft + c2.offsetWidth - 4 + "px";
    autoFill.style.display = "block";

    // End of Logic

    this._startRangeCell = c1;
    this._endRangeCell   = c2;

    this._selectedRangeName = [ ZmSpreadSheet.getCellName(c1),
				    ZmSpreadSheet.getCellName(c2) ].join(":");
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
    var isEditingExpr = ( this._editingCell && this._hasExpression );
    this._rangediv_findCell(dwtev, isEditingExpr, isEditingExpr);
	this._hideRange();
	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
};

ZmSpreadSheet.prototype._rangediv_findCell = function(ev, selectRange, donotselectcell){

    var startRow = this._startRangeRow;
    var startCol = this._startRangeCol;
    var endRow   = this._endRangeRow;
    var endCol   = this._endRangeCol;    

    var posX = ev.docX + this._getRelDiv().scrollLeft;
    var posY = ev.docY + this._getRelDiv().scrollTop;

    posY = posY - this._getRelDiv().offsetTop; // Relative height according to reldiv.

    var cell = this._findCell( posX, posY, startRow, startCol, endRow, endCol);
    if(cell && selectRange){
        this._editRangeSelectedCell = cell;
        var cN = ZmSpreadSheet.getCellName(cell);
        cN = cN+":"+cN;
        this._showRangeByRangeName(cN);
		this._updateCellRangeToken();
    }
    if(cell && !donotselectcell){
        this._selectCell( cell );
    }

};

ZmSpreadSheet.prototype._getCell = function(row, col){
    return this._model.data[row][col]._td;
};

ZmSpreadSheet.prototype._findCell = function( x, y, sRow, sCol, eRow, eCol){

    var startRow = Math.min(sRow, eRow);
    var startCol = Math.min(sCol, eCol);
    var endRow   = Math.max(sRow, eRow);
    var endCol   = Math.max(sCol, eCol);

    var centerRow = startRow + Math.ceil( ( endRow - startRow)/2 );
    var centerCol = startCol + Math.ceil( ( endCol - startCol)/2 );
    var c = this._getCell(centerRow, centerCol);

    var cTop = c.offsetTop, cLeft = c.offsetLeft;

    if( y >= cTop){
        startRow = centerRow;
        if( y <= cTop + c.offsetHeight ){
            endRow = centerRow;
        } else {
            startRow = centerRow + 1;
        }
    } else {
        endRow = centerRow - 1;
    }


    if( x >= cLeft ){
        startCol = centerCol;
        if( x <= cLeft + c.offsetWidth ){
            endCol = centerCol;
        }else {
            startCol = centerCol + 1;
        }
    }else {
        endCol = centerCol - 1;
    }

    if(startCol == endCol && startRow == endRow){
        return this._getCell( startRow, startCol);
    }

    return this._findCell(x, y, startRow, startCol, endRow, endCol);
};

ZmSpreadSheet.prototype._hideRange = function() {

    this._isRange = false;
    this._startRangeCell = null;
    this._endRangeCell = null;

	this._shiftRangeStart = null;
	this._selectedRangeName = null;
	var div = this._getRangeDiv();
	div.style.display = "none";
	// amazing performance improvement:
	div.style.top = "0px";
	div.style.left = "0px";
	div.style.width = "5px";
	div.style.height = "5px";
    //this._selectCell(this._selectedCell);
};

ZmSpreadSheet.prototype.isRange = function(){
    return this._isRange;
}

ZmSpreadSheet.prototype._table_selrange_MouseMove = function(ev) {
    var dwtev = new DwtMouseEvent();
    dwtev.setFromDhtmlEvent(ev);
    var table = this._getTable();

    var el = DwtUiEvent.getTarget(dwtev);
    var td;

    if(el.id == this._rangeDivID){
        
        var startRow = this._startRangeRow;
        var startCol = this._startRangeCol;
        var endRow   = this._endRangeRow;
        var endCol   = this._endRangeCol;

        var posX = dwtev.docX + this._getRelDiv().scrollLeft;
        var posY = dwtev.docY + this._getRelDiv().scrollTop;

        posY = posY - this._getRelDiv().offsetTop; // Relative height according to reldiv.

        var colDiff = ( startCol <= endCol ) ? (endCol == 0 ? 0 : 1 ) : -1;
        var rowDiff = ( startRow <= endRow ) ? (endRow == 0 ? 0 : 1 ) : -1

        //Improved performance after tracking near by cell navigation
        if(this._checkBoundries(posX, posY, this._getCell(endRow, endCol))){  //Chk self, EndCell already selected, so neglect it
            td = null;
        }else if(this._checkBoundries(posX, posY, this._getCell(endRow, endCol - colDiff))){ //Chk Left Cell
            td = this._getCell(endRow, endCol - colDiff);
        }else if(this._checkBoundries(posX, posY, this._getCell(endRow - rowDiff, endCol  ))) { //Chk  Up Cell
            td = this._getCell(endRow - rowDiff, endCol);
         //TODO: Should we really include this dialognal check? Its very unlikely becoz most of the times its ( Left, Up ) combination.   
        }else if(this._checkBoundries(posX, posY, this._getCell(endRow - rowDiff, endCol - colDiff ))){   //Chk Diagnol Cell
            td = this._getCell(endRow - rowDiff, endCol - colDiff);
        }else if(this._checkBoundriesForRange(posX, posY, startRow, startCol, endRow, endCol)){ //Chk for Random Cell
            td = this._findCell( posX, posY, startRow, startCol, endRow, endCol);
        }

    }else{       
        td = el;
        while (td && td !== table && !/^td$/i.test(td.tagName))
            td = td.parentNode;
    }

    if (td && /^td$/i.test(td.tagName)
            && td.cellIndex > 0 && td.parentNode.rowIndex > 0) {
        var startCell = this._selectedCell;
        if(this._editingCell){
            startCell = this._editRangeSelectedCell;    
        }
        this._selectRange(ZmSpreadSheet.getCellName(startCell),
                ZmSpreadSheet.getCellName(td), true);
        this._updateCellRangeToken();
    }

	dwtev._stopPropagation = true;
	dwtev._returnValue = false;
	dwtev.setToDhtmlEvent(ev);
	return dwtev._returnValue;
};

ZmSpreadSheet.prototype._checkBoundries = function(x, y, cell) {
    if(cell && ( x >= cell.offsetLeft && x <= (cell.offsetLeft + cell.offsetWidth) ) && ( y >= cell.offsetTop && y <= ( cell.offsetTop+cell.offsetHeight) ) ){
        return true;
    }
    return false;
};

ZmSpreadSheet.prototype._checkBoundriesForRange = function(x, y, sRow, sCol, eRow, eCol){

    var startRow = Math.min(sRow, eRow);
    var startCol = Math.min(sCol, eCol);
    var endRow   = Math.max(sRow, eRow);
    var endCol   = Math.max(sCol, eCol);

    var startCell = this._getCell(startRow, startCol);
    var endCell   = this._getCell(endRow, endCol);

    if( startCell && endCell && ( x >= startCell.offsetLeft && x <= (endCell.offsetLeft + endCell.offsetWidth) ) && ( y >= startCell.offsetTop && y <= ( endCell.offsetTop+ endCell.offsetHeight) ) ){
        return true;
    }

    return false;
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
        var index = td.cellIndex;
        if(index == 0){
            var row = td.parentNode;
            index = row.rowIndex;
            var tmp = Dwt.getLocation(this._getRelDiv());            
			var tdY = dwtev.docY - tmp.y - td.offsetTop; //+ this._getRelDiv().scrollTop;
            if (Math.abs(tdY - td.offsetHeight) < 5) {
				this._resizeRowIndex = index;
                Dwt.delClass(table, "RowNSize", "RowSSize");
			} else if (tdY < 5 && index > 1) {
				this._resizeRowIndex = index - 1;
                Dwt.delClass(table, "RowSSize", "RowNSize");
			} else {
				this._resizeRowIndex = null;
                Dwt.delClass(table, "RowSSize");
                Dwt.delClass(table, "RowNSize");
			}
        }else{
            if(this._resizeRowIndex){
                this._resizeRowIndex = null;
                Dwt.delClass(table, "RowSSize");
                Dwt.delClass(table, "RowNSize");
            }
            try {
                var cell = this.getCellModel(td);
                this._setTooltip(cell, dwtev.docX, dwtev.docY);
            } catch(ex) {
                // ignoring exceptions (such as when we mouseover a
                // top/left bar td)
            }
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
	var w = ev.requestedWidth || el.offsetWidth;
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
    window.top._ZmSpreadSheet_cliboard_backup = null;
};

ZmSpreadSheet.prototype.clipboardCut = function() {
	window.top._ZmSpreadSheet_clipboard = new ZmSpreadSheetClipboard
		(this._model, this.getSelectionRange(), true);
    window.top._ZmSpreadSheet_cliboard_backup = null;
};

ZmSpreadSheet.prototype.clipboardPaste = function() {
	var c = window.top._ZmSpreadSheet_clipboard;
    c = c || window.top._ZmSpreadSheet_cliboard_backup;
	if (c) {
		var r = this._model.paste(c, this.getSelectionRange());
		this._selectRange.apply(this, r);
	}
};

ZmSpreadSheet.prototype.hasClipboardData =
function(){
    return (window.top._ZmSpreadSheet_clipboard != null);
};

ZmSpreadSheet.prototype._clipboard_blur =
function() { //backup to allow copy-paste from external sources
    window.top._ZmSpreadSheet_cliboard_backup = window.top._ZmSpreadSheet_clipboard;
    window.top._ZmSpreadSheet_clipboard = null;
};

ZmSpreadSheet.prototype._addDataToTextArea =
function(){

    var sRow = this._startRangeRow;
    var sCol = this._startRangeCol;
    var eRow = this._endRangeRow;
    var eCol = this._endRangeCol;

    //Logic to Select Range

    var startRow = Math.min(sRow, eRow);
    var startCol = Math.min(sCol, eCol);
    var endRow   = Math.max(sRow, eRow);
    var endCol   = Math.max(sCol, eCol);

    var textArea = this._getTextArea();
    var data = "";
    for(var i=startRow; i<=endRow; i++){        
        for(var j=startCol; j<=endCol; j++){
            data += this.getCell(i, j).getValue();
            if(j != endCol ) data += '\t';
        }
        if( i != endRow) data += '\n';
    }

    textArea.value = data;
    this.focusTextArea();

};

ZmSpreadSheet.prototype._pasteFromTextArea =
function(){

    var textArea = this._getTextArea();
    var str = textArea.value;

    //Parsing Logic
    var data, maxCols=0,maxRows=0,cols=0,totRows, totCols, selCell, extra, i;
    var strings = str.split("\n");
    for(i=0; i< strings.length ; i++){
        cols = (strings[i].split("\t")).length;
        if(cols > maxCols){
            maxCols = cols;
        }
    }
    maxRows = strings.length;
    if(cols == 0){
        maxRows = maxRows-1;
    }

    var selCell = this.getCellModel(this._selectedCell);
    var selRow  = selCell.getRow() - 1;
    var selCol  = selCell.getCol() - 1;

    maxRows = maxRows + selRow;
    maxCols = maxCols + selCol;
    
    totRows = this._model.ROWS;
    totCols = this._model.COLS;
    extra = 2;
    i = 0;
    if(maxRows > totRows ){
        totRows = ( maxRows - totRows ) + extra;
        while(i < totRows){
            this._model.insertRow();
            i++;
        }
    }
    i = 0;
    if(maxCols > totCols){
        totCols = ( maxCols - totCols ) + extra;
        while(i < totCols){
            this._model.insertCol();
            i++;
        }
    }
    
    var eRow, eCol, cols, rows = str.split('\n');
    for(var i=0; i<rows.length; i++){
        eRow = selRow+i;
        cols = rows[i].split('\t');
        for(var j=0; j<cols.length; j++){
            this.getCell(selRow+i, selCol+j).setEditValue(cols[j], true);
            eCol = selCol+j;
        }
    }

    this._showRange(selRow, selCol, eRow, eCol);

    //Copy this for future
    this.clipboardCopy();

    //Control back to spreadsheet
    textArea.blur();
    
};

ZmSpreadSheet.prototype.focusTextArea =
function(){
    var textArea = this._getTextArea();
    textArea.focus();
    textArea.select();
};

ZmSpreadSheet.prototype._getTextArea =
function(){

    if(!this._textarea) {

        var div = document.createElement("div");
        div.style.top = "-1000px";
        div.style.left = "-1000px";
        div.style.position = "absolute";

        this._textAreaId = Dwt.getNextId();
        var textArea = this._textarea = document.createElement("textarea");
        textArea.id  = this._textAreaId;
        textArea.onKeyDown = function() { this.blur(); };
        div.appendChild(textArea);
        appCtxt.getShell().getHtmlElement().appendChild(div);
        
    }
    
    return this._textarea;

};

//Charting

ZmSpreadSheet.prototype._showCharts =
function(){
    var rawCharts = this._model._rawCharts;
    if(!rawCharts) return;
    
    for(var i=0; i<rawCharts.length; i++){
        var rChart = rawCharts[i];
        this.makeChart(rChart.type, rChart, {posX:rChart.x, posY:rChart.y});        
    }
};

ZmSpreadSheet.prototype.addChart =
function(chart){
    this._model.addChart(chart);    
};

ZmSpreadSheet.prototype.removeChart =
function(id){
    this._model.removeChart(id);
}

ZmSpreadSheet.prototype.getChart =
function(type, data){
    return (new ZmSpreadSheetChart(appCtxt.getShell(), this, type, data));    
};

ZmSpreadSheet.prototype.getNextChartPos =
function(){
    if(!this._chartPos){
        this._chartPos = {
            x: 100,
            y: 100
        }        
    }

    this._chartPos.x = this._chartPos.x + 10;
    this._chartPos.y = this._chartPos.y + 5;

    return {posX: this._chartPos.x, posY: this._chartPos.y};
};


ZmSpreadSheet.prototype.makeChart =
function(type , range, pos){

    type = type || ZmSpreadSheetChart.BAR;

    var cData = this.getChartData(range);

    var chart = this.getChart(type, cData);    
    pos = pos || this.getNextChartPos();

    chart.show(type, pos);
    chart.makeDraggable();

    this.addChart(chart);

};

ZmSpreadSheet.prototype._getSeriesName =
function(index){
    return ("Series "+index);
};

ZmSpreadSheet.prototype.getCell =
function(row, col){
    return this.getCellModel(this._getCell(row, col));
};

ZmSpreadSheet.prototype.getChartData =
function(range){

    var cData = {};
    
    var data = new Array();    

    if(!this.isRange() && !range){

        data[0]     = new Array();
        data[0][0]  = "";
        data[0][1]  = "1";

        data[1]     = new Array();
        data[1][0]  = this._getSeriesName(1);

        var cell = this._selectedCell;
        cell = this.getCellModel(cell);
        data[1][1] = cell.getDisplayValue();

        cData.sRow = cell.getRow();
        cData.sCol = cell.getCol();
        cData.eRow = cell.getRow();
        cData.eCol = cell.getCol();
    }else{        
        var i, j, k, l;
        range = range || {};
        
        var sRow = range.sRow || this._startRangeRow;
        var sCol = range.sCol || this._startRangeCol;
        var eRow = range.eRow || this._endRangeRow;
        var eCol = range.eCol || this._endRangeCol;

        var startRow = cData.sRow = Math.min(sRow, eRow);
        var startCol = cData.sCol = Math.min(sCol, eCol);
        var endRow   = cData.eRow = Math.max(sRow, eRow);
        var endCol   = cData.eCol = Math.max(sCol, eCol);

        var rows = endRow - startRow + 1;
        var cols = endCol - startCol + 1;

        var firstCell = this.getCell(startRow, startCol);
        var firstCellVal  = firstCell.getValue();
        var firstCellType = firstCell.getType();

        //if (rows == 1 || cols == 1) {
            data[0] = new Array();
            data[0][0] = "";
        //}

        if( rows == 1 && cols > 1 ){            
            data[1] = new Array();
            if(firstCellType == "string" || firstCellType == "date"){
                data[1][0] = firstCellVal;
                j = 1;
            }else{
                data[1][0] = this._getSeriesName(1);
                j = 0;
            }
            var i = 1;
            while (j < cols) {
                data[0][i] = i;
                data[1][i] = this.getCell(startRow, startCol + j).getValue(); 
                i++;
                j++;
            }            
        }else if ( cols == 1 && rows > 1){
            if(firstCellType == "string" || firstCellType == "date"){
                data[0][1] = firstCellVal;
                j = 1;
            }else{
                data[0][1] = this._getSeriesName(1);
                j = 0;
            }

            var i = 1;
            while (j < rows) {
                data[i] = new Array();
                data[i][0] = i;
                data[i][1] = this.getCell(startRow + j, startCol).getValue();
                i++;
                j++;
            }
        }else {

            var isLabelRow = this._isLabelRow(startRow, endRow, startCol);
            var isLabelCol = this._isLabelCol(startCol, endCol, startRow);


            i = 1;
            while(i < cols){
                data[0][i] = isLabelCol ? this.getCell(startRow, startCol + i).getValue() : this._getSeriesName(i);
                i++;
            }

            i = 1;
            j = isLabelRow ? 1 : 0;
            while(j < rows){
                data[i] = new Array();
                data[i][0] = isLabelRow ? this.getCell(startRow+i, startCol).getValue() : this._getSeriesName(i);
                k = 1;
                l = isLabelCol ? 1 : 0;
                while(l < cols){
                    data[i][k] = this.getCell(startRow+i, startCol+k).getValue();
                    k++;
                    l++;
                }
                i++;
                j++;
            }
        }
    }
    DBG.println(data);
    cData.data = data;

    //return data;
    return cData;
};

ZmSpreadSheet.prototype._isLabelRow =
function(sRow, eRow, col){
    var type;
    for(var k = sRow; k <= eRow; k++){
       type = this.getCell(k, col).getType();
       if(type == "string" || type == "date"){
           return true;
       }
    }
    return false;
};

ZmSpreadSheet.prototype._isLabelCol =
function(sCol, eCol, row){
    var type;
    for(var k = sCol; k <= eCol; k++){
       type = this.getCell(row, k).getType();
       if(type == "string" || type == "date"){
           return true;
       }
    }
    return false;
};

ZmSpreadSheet.prototype._importDialog =
function(ev) {

    var importId = Dwt.getNextId();
    
    var dlg = new DwtDialog(appCtxt.getShell(), null, "Import Spreadsheet XML content");
    var html = [
            "<table height='400' width='300'  padding='5' cellspacing='5'>",
                "<tr><td><textarea id='",importId,"' style='width:100%;height:100%;'></textarea></td></tr>",
            "</table>"
    ].join("");
    dlg.setContent(html);

    dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,function(){
        this._importContent(document.getElementById(importId).value);
        dlg.popdown();
    }));
    
    dlg.popup();

    this._import = document.getElementById(importId);
    
};

ZmSpreadSheet.prototype._importContent =
function(value){
    if(value){
        var model = new ZmSpreadSheetModel(0, 0);
        model.loadFromXML(value);
        this.setModel(model);
    }
};