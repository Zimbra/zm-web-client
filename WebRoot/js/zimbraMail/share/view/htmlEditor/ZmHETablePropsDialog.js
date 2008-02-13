/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
 * Html Editor Create Table Dialog
 *
 * @author Ross Dargahi
 */
ZmHETablePropsDialog = function(parent) {
	if (arguments.length == 0) return;

	DwtDialog.call(this, {parent:parent, title:ZmMsg.insertTable, standardButtons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});

 	var tableAlignmentId = Dwt.getNextId();
	var floatId = Dwt.getNextId();
	var textHAlignId = Dwt.getNextId(); 
	var textVAlignId = Dwt.getNextId(); 
	var numColsId = Dwt.getNextId();
	var numRowsId = Dwt.getNextId();
	var tableWidthId = Dwt.getNextId(); 
	var widthUnitId = Dwt.getNextId();
	
	var cellSpacingId = Dwt.getNextId();
	var cellPaddingId = Dwt.getNextId();
	
	var borderWidthId = Dwt.getNextId();
 	var borderColorId = Dwt.getNextId();
  	var borderColorSwatchId = Dwt.getNextId();
 	var borderStyleId = Dwt.getNextId();
 	
	var bgColorId = Dwt.getNextId();
 	var bgColorSwatchId = Dwt.getNextId();
 	var fgColorId = Dwt.getNextId();
 	var fgColorSwatchId = Dwt.getNextId();
 	
     
	var html = [
         "<table class='ZmHEDialog'><tr><td>",

         "<fieldset><legend>", ZmMsg.tableSize, "</legend>",
         "<div style='padding:2px;'></div>",
         "<table><tr>",
         "<td class='Label'>", ZmMsg.numberOfCols,"</td>",
         "<td colspan=2 id='", numColsId, "'></td></tr>",
         "<tr><td class='Label'>", ZmMsg.numberOfRows, "</td>",
         "<td colspan=2 id='", numRowsId, "'></td></tr>",
         "<tr><td class='Label'>", ZmMsg.tableWidth, "</td>",
         "<td id='", tableWidthId, "' size='5' value='100'/></td>",
         "<td style='padding-left;2px;' id='", widthUnitId, "'></td></tr></table></fieldset><p/>",
 
         "<fieldset><legend>", ZmMsg.layout, "</legend>",
         "<div style='padding:2px;'></div>",
         "<table><tr>",
         "<td class='Label'>", ZmMsg.tableAlignment, "</td>",
         "<td id='", tableAlignmentId, "'></td>",
         "<td id='", floatId, 
         "<td class='Label'>", ZmMsg.cellSpacing, "</td>",
         "<td id='", cellSpacingId, "' size='5' value='1'/></td>",
         "<td class='Label'>", ZmMsg.cellSpacing, "</td>",
         "<td id='", cellSpacingId, "' size='5' value='1'/></td>",
         "<td class='Label'>", ZmMsg.cellPadding, "</td>",
         "<td id='", cellPaddingId, "'></td></tr>",
         "<tr><td class='Label'>", ZmMsg.borderThickness, "</td>",
         "<td id='", borderWidthId, "'></td>",
         "<td colspan='2'><table width='100%'><tr><td id='", borderColorId,
         "'></td><td valign='middle'><div class='BorderColorSwatch' id='", 
         borderColorSwatchId, "'></div></td></tr></table></tr>",
         
         "</table></fieldset>",
          
         "</td></tr></table>"].join("");
     
	this.setContent(html);
	
    var cb = new AjxCallback(this, this._validationCb);

    // Table Size
	var inputFieldParams = {parent: this, type: DwtInputField.INTEGER,
							initialValue: 2, size: 5, maxLen: 3,
							errorIconStyle: DwtInputField.ERROR_ICON_RIGHT,
							validationStyle: DwtInputField.CONTINUAL_VALIDATION};

	this._numColsField = new DwtInputField(inputFieldParams);
	this._numColsField.setValidNumberRange(1, 254);
	this._numColsField.setValidationCallback(cb);
	this._numColsField.reparentHtmlElement(numColsId);

	inputFieldParams.maxLen = 4;	
	this._numRowsField = new DwtInputField(inputFieldParams);
	this._numRowsField.setValidNumberRange(1, null);
	this._numRowsField.setValidationCallback(cb);
	this._numRowsField.reparentHtmlElement(numRowsId);

	this._widthUnit = new DwtSelect({parent:this.shell, options:[new DwtSelectOption(ZmHtmlEditor._PERCENT, true, ZmMsg.percent), 
																 new DwtSelectOption(ZmHtmlEditor._PIXELS, false, ZmMsg.pixels)]});
	this._widthUnit.reparentHtmlElement(widthUnitId);

	inputFieldParams.initialValue = 100;
	inputFieldParams.maxLen = 5;	
	this._tableWidthField = new DwtInputField(inputFieldParams);
	this._tableWidthField.setValidatorFunction(this, this._tcdValidateTableWidth);
	this._tableWidthField.setValidationCallback(cb);
	this._tableWidthField.reparentHtmlElement(tableWidthId);
    
	// Layout
	this._tableAlignment = new DwtSelect({parent:this.shell, options:["Center", "Left", "Right"]});
	this._tableAlignment.reparentHtmlElement(tableAlignmentId);

	inputFieldParams.initialValue = 1;
	inputFieldParams.maxLen = 3;
	this._cellSpacingField = new DwtInputField(inputFieldParams);
	this._cellSpacingField.setValidNumberRange(0, null);
	this._cellSpacingField.setValidationCallback(cb);
	this._cellSpacingField.reparentHtmlElement(cellSpacingId);

	this._cellPaddingField = new DwtInputField(inputFieldParams);
	this._cellPaddingField.setValidNumberRange(0, null);
	this._cellPaddingField.setValidationCallback(cb);
	this._cellPaddingField.reparentHtmlElement(cellPaddingId);

	this._borderWidthField = new DwtInputField(inputFieldParams);
	this._borderWidthField.setValidNumberRange(0, null);
	this._borderWidthField.setValidationCallback(cb);
	this._borderWidthField.reparentHtmlElement(borderWidthId);
	
	var b = new DwtButton({parent:this.shell});
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE, null, null, this);
	var c = new DwtColorPicker(m);
	c.addSelectionListener(new AjxListener(this, this._borderColorPickerListener));
	b.setText(ZmMsg.borderColor);
	b.setMenu(m);
	b.reparentHtmlElement(borderColorId);
	// Hack for FF
	b.getHtmlElement().style.width="100%";
	this._borderColorSwatch = document.getElementById(borderColorSwatchId);
	this._borderColorSwatch.style.backgroundColor = "#000";
	
};

ZmHETablePropsDialog.prototype = new DwtDialog;
ZmHETablePropsDialog.prototype.constructor = ZmHETablePropsDialog;

// Public methods

ZmHETablePropsDialog.prototype.toString =
function() {
	return "ZmHETablePropsDialog";
};


ZmHETablePropsDialog.prototype.getValues = 
function() {
	return {"numCols": this._numRowsField.getValue(),
			"numRows": this._numColsField.getValue(),
			"width": ["", this._tableWidthField.getValue(), (this._widthUnit.getValue() == ZmHETablePropsDialog._PERCENT) 
					  ? "%" : "px"].join(""),
			"cellSpacing": this._cellSpacingField.getValue(),
			"cellPadding": this._cellPaddingField.getValue(),
			"alignment": this._tableAlignment.getValue()};
};

// Table width units. Used to specify width units in method below
ZmHETablePropsDialog._PERCENT = 1;
ZmHETablePropsDialog._PIXELS = 2;

ZmHETablePropsDialog.prototype._widthUnitChangeListener =
function(ev) {
	this._tableWidthField.validate();
};

ZmHETablePropsDialog.prototype._validateTableWidth =
function(value) {
	var val = this._widthUnit.getValue();
	if (this._widthUnit.getValue() == ZmHETablePropsDialog._PERCENT && (value < 1 || value > 100))
		return AjxMsg.numberMustBeNon0Percent;
	else if (value < 1)
		return AjxMessageFormat.format(AjxMsg.numberLessThanMin, 1);
	
	return null;
};

ZmHETablePropsDialog.prototype._borderColorPickerListener =
function(ev) {
	this._borderColorSwatch.style.backgroundColor = ev.detail;
};

ZmHETablePropsDialog.prototype._validationCb =
function(args) {
	if (!this._numColsField.isValid())
 		this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	else if (!this._numRowsFieldisValid())
 		this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	else if (!this._cellSpacingField.isValid())
 		this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	else if (!this._cellPaddingField.isValid())
 		this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	else if (!this._tableWidthField.isValid())
 		this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	else
		this.setButtonEnabled(DwtDialog.OK_BUTTON, true);
};


