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
 * Html Editor Create Table Dialog
 *
 * @author Ross Dargahi
 */
function ZmHETablePropsDialog(parent) {
	if (arguments.length == 0) return;

	DwtDialog.call(this, parent, null, ZmMsg.insertTable, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
	this._disableFFhack();

 	var tableAlignmentId = Dwt.getNextId();
	var floatId = Dwt.getNextId();
	var textHAlignId = Dwt.getNextId(); 
	var textVAlignId = Dwt.getNextId(); 
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

         "<fieldset><legend>", ZmMsg.layout, "</legend>",
         "<div style='padding:2px;'></div>",
         "<table><tr>",
         "<td class='Label'>", ZmMsg.tableAlignment, ":</td>",
         "<td id='", tableAlignmentId, "'></td>",
         "<td id='", tableFloatId, 
         "<td class='Label'>", ZmMsg.cellSpacing, ":</td>",
         "<td id='", cellSpacingId, "' size='5' value='1'/></td>",
         "<td class='Label'>", ZmMsg.cellSpacing, ":</td>",
         "<td id='", cellSpacingId, "' size='5' value='1'/></td>",
         "<td class='Label'>", ZmMsg.cellPadding, ":</td>",
         "<td id='", cellPaddingId, "'></td></tr>",
         "<tr><td class='Label'>", "Border Thickness", ":</td>",
         "<td id='", borderWidthId, "'></td>",
         "<td colspan='2'><table width='100%'><tr><td id='", borderColorId, "'></td><td valign='middle'><div class='BorderColorSwatch' id='", borderColorSwatchId, "'></div></td></tr></table></tr>",
         
         "</table></fieldset>",
          
         "</td></tr></table>"].join("");
     
	this.setContent(html);
	
    var cb = new AjxCallback(this, this._validationCb);
    
	// Layout
	this._tableAlignment = new DwtSelect(this.shell, ["Center", "Left", "Right"]);
	this._tableAlignment.reparentHtmlElement(tableAlignmentId);
	
	this._cellSpacingField = new DwtInputField(this, DwtInputField.INTEGER, 1, 5, 3, DwtInputField.ERROR_ICON_RIGHT, DwtInputField.CONTINUAL_VALIDATION);
	this._cellSpacingField.setValidNumberRange(0, null);
	this._cellSpacingField.setValidationCallback(cb);
	this._cellSpacingField.reparentHtmlElement(cellSpacingId);

	this._cellPaddingField = new DwtInputField(this, DwtInputField.INTEGER, 1, 5, 3, DwtInputField.ERROR_ICON_RIGHT, DwtInputField.CONTINUAL_VALIDATION);
	this._cellPaddingField.setValidNumberRange(0, null);
	this._cellPaddingField.setValidationCallback(cb);
	this._cellPaddingField.reparentHtmlElement(cellPaddingId);

	this._borderWidthField = new DwtInputField(this, DwtInputField.INTEGER, 1, 5, 3, DwtInputField.ERROR_ICON_RIGHT, DwtInputField.CONTINUAL_VALIDATION);
	this._borderWidthField.setValidNumberRange(0, null);
	this._borderWidthField.setValidationCallback(cb);
	this._borderWidthField.reparentHtmlElement(borderWidthId);
	
	var b = new DwtButton(this.shell);
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

ZmHETablePropsDialog.prototype = new DwtDialog();
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


