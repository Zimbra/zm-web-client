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

/* Toolbars for the SpreadSheet widget.  The toolbars can be attached to the
 * widget itself (when parent == spreadSheet), in which case they will be
 * inserted at the top, or to any other widget.
 */
function ZmSpreadSheetToolbars(parent, spreadSheet) {
	this._spreadSheet = spreadSheet;
	DwtComposite.call(this, parent, "ZmSpreadSheetToolbars", DwtControl.RELATIVE_STYLE);
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
	this._buttons.bold.setToggled(cell.getStyleProp("fontWeight") == "bold");
	this._buttons.italic.setToggled(cell.getStyleProp("fontStyle") == "italic");
	this._buttons.underline.setToggled(cell.getStyleProp("textDecoration") == "underline");
	this._buttons.strike.setToggled(cell.getStyleProp("textDecoration") == "line-through");
	var align = cell.getStyleProp("textAlign");
	this._buttons.justifyLeft.setToggled(align == "left");
	this._buttons.justifyCenter.setToggled(align == "center");
	this._buttons.justifyRight.setToggled(align == "right");
};

ZmSpreadSheetToolbars.prototype._createWidgets = function() {
	this._createToolbar1();
	// this._createToolbar2();
};

ZmSpreadSheetToolbars.prototype._createToolbar1 = function() {
	var toolbar = new DwtToolBar(this, "ToolBar", DwtControl.RELATIVE_STYLE, 0);
	var listener = new AjxListener(this, this._on_buttonPress);

	var b = this._buttons.bold = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Bold");
	b.setData("SS", "Bold");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.boldText);

	b = this._buttons.italic = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Italics");
	b.setData("SS", "Italic");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.italicText);

	b = this._buttons.underline = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Underline");
	b.setData("SS", "Underline");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.underlineText);

	b = this._buttons.strike = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("StrikeThru");
	b.setData("SS", "Strike");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.strikeThruText);

	toolbar.addSeparator("vertSep");

	b = this._buttons.justifyLeft = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("LeftJustify");
	b.setData("SS", "JustifyLeft");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.leftJustify);

	b = this._buttons.justifyCenter = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("CenterJustify");
	b.setData("SS", "JustifyCenter");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.centerJustify);

	b = this._buttons.justifyRight = new DwtButton(toolbar, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("RightJustify");
	b.setData("SS", "JustifyRight");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.rightJustify);

	toolbar.addSeparator("vertSep");

	b = this._buttons.fontColor = new DwtButton(toolbar, null, "TBButton");
	b.setImage("FontColor");
	b.setToolTipContent(ZmMsg.fontColor);
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	var cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._on_fontColor));
	b.setMenu(m);

	b = this._buttons.bgColor = new DwtButton(toolbar, null, "TBButton");
	b.setImage("FontBackground");
	b.setToolTipContent(ZmMsg.fontBackground);
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	var cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._on_bgColor));
	b.setMenu(m);

	toolbar.addSeparator("vertSep");

	b = this._buttons.rowInsertAbove = new DwtButton(toolbar, 0, "TBButton");
	b.setImage("RowInsertAbove");
	b.setData("SS", "RowInsertAbove");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertRowAbove);

	b = this._buttons.rowInsertUnder = new DwtButton(toolbar, 0, "TBButton");
	b.setImage("RowInsertUnder");
	b.setData("SS", "RowInsertUnder");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertRowUnder);

	b = this._buttons.rowDelete = new DwtButton(toolbar, 0, "TBButton");
	b.setImage("RowDelete");
	b.setData("SS", "RowDelete");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.deleteRow);

	toolbar.addSeparator("vertSep");

	b = this._buttons.colInsertBefore = new DwtButton(toolbar, 0, "TBButton");
	b.setImage("ColInsertBefore");
	b.setData("SS", "ColInsertBefore");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertColumnBefore);

	b = this._buttons.colInsertAfter = new DwtButton(toolbar, 0, "TBButton");
	b.setImage("ColInsertAfter");
	b.setData("SS", "ColInsertAfter");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.insertColumnAfter);

	b = this._buttons.colDelete = new DwtButton(toolbar, 0, "TBButton");
	b.setImage("ColDelete");
	b.setData("SS", "ColDelete");
	b.addSelectionListener(listener);
	b.setToolTipContent(ZmMsg.deleteColumn);

	toolbar.addSeparator("vertSep");

	var s = this._buttons.typeSelect = new DwtSelect(toolbar, null);
	s.addChangeListener(new AjxListener(this, this._on_typeSelect));
	s.addOption("Auto type", true, null);
	s.addOption("Number", false, "number");
	s.addOption("Currency", false, "currency");
	s.addOption("Text", false, "string");
};

// ZmSpreadSheetToolbars.prototype._createToolbar2 = function() {
// };

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
	switch (data) {
		// Style formatting
	    case "Bold":
		this.applyStyle("fontWeight", btn.isToggled() ? "bold" : "");
		break;
	    case "Italic":
		this.applyStyle("fontStyle", btn.isToggled() ? "italic" : "");
		break;
	    case "Strike":
		this.applyStyle("textDecoration", btn.isToggled() ? "line-through" : "");
		this._buttons.underline.setToggled(false);
		break;
	    case "Underline":
		this.applyStyle("textDecoration", btn.isToggled() ? "underline" : "");
		this._buttons.strike.setToggled(false);
		break;
	    case "JustifyLeft":
		this.applyStyle("textAlign", btn.isToggled() ? "left" : "");
		this._buttons.justifyCenter.setToggled(false);
		this._buttons.justifyRight.setToggled(false);
		break;
	    case "JustifyCenter":
		this.applyStyle("textAlign", btn.isToggled() ? "center" : "");
		this._buttons.justifyLeft.setToggled(false);
		this._buttons.justifyRight.setToggled(false);
		break;
	    case "JustifyRight":
		this.applyStyle("textAlign", btn.isToggled() ? "right" : "");
		this._buttons.justifyLeft.setToggled(false);
		this._buttons.justifyCenter.setToggled(false);
		break;

		// Insert/remove rows/cols
	    case "RowInsertAbove":
		var cell = this._spreadSheet.getSelectedCellModel();
		if (cell)
			this.getModel().insertRow(cell.getRow() - 1);
		break;
	    case "RowInsertUnder":
		var cell = this._spreadSheet.getSelectedCellModel();
		if (cell)
			this.getModel().insertRow(cell.getRow());
		break;
	    case "ColInsertBefore":
		var cell = this._spreadSheet.getSelectedCellModel();
		if (cell)
			this.getModel().insertCol(cell.getCol() - 1);
		break;
	    case "ColInsertAfter":
		var cell = this._spreadSheet.getSelectedCellModel();
		if (cell)
			this.getModel().insertCol(cell.getCol());
		break;
	    case "RowDelete":
		var cell = this._spreadSheet.getSelectedCellModel();
		if (cell)
			this.getModel().deleteRow(cell.getRow() - 1);
		break;
	    case "ColDelete":
		var cell = this._spreadSheet.getSelectedCellModel();
		if (cell)
			this.getModel().deleteCol(cell.getCol() - 1);
		break;
	}
	this._spreadSheet.focus();
};

ZmSpreadSheetToolbars.prototype._on_typeSelect = function(ev) {
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
