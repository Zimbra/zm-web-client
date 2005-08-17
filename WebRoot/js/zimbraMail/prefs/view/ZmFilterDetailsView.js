/**
 * This class represents the view of the details of a filter rule. It
 * is a sub-class of DwtComposite.
 */
function LmFilterDetailsView(parent, appCtxt, className) {
    var clsName = this._className = className || "LmFilterDetailsView";
	this._appCtxt = appCtxt;
    DwtComposite.call(this, parent, clsName, DwtControl.STATIC_STYLE);
	// this has to be done, so that the dwtselect is created after we've set
	// the content. NextSelect then starts at 1, since this is 0.
    this._dwtObjects = [{obj:null, id: Dwt.getNextId(), name:'groupOp'}];
	this._nextSelect = 1;
	
	// setup the skeleton of the view
	var el = this.getHtmlElement();
    el.innerHTML = this._contentHtml();

	// create the anyof/allof select
	var sel = new DwtSelect(this);
	sel.addOption(new DwtSelectOptionData("anyof", "any of", true));
	sel.addOption(new DwtSelectOptionData("allof", "all of", false));
	this._dwtObjects[0].obj = sel;

	// make sure we are out of the flow to start --
	// we do this after the select code, to make 
	// sure the select can initialize itself.
	el.style.display = "none";
	
	// add the onmousedown listener, allowing the user to access the
	// input areas.
	var ls = new LsListener(this, 
							LmFilterDetailsView.prototype._mouseDownListener);
	this.addListener(DwtEvent.ONMOUSEDOWN, ls);

	LmFilterDetailsView.DEFAULT_CONDITION = new LmCondition('from', null, 'is', null);
	LmFilterDetailsView.DEFAULT_ACTION = new LmCondition('keep', null);

	// create the msgDialog used for reporting an incomplete rule.
	this._msgDialog = new DwtMessageDialog(this.shell, null, 
										   [DwtDialog.YES_BUTTON, 
											DwtDialog.NO_BUTTON]);
	this._msgDialog.setMessage(LmMsg.confirmFilterDetailsSave,
							   null, DwtMessageDialog.WARNING_STYLE);
	this._msgDialog.registerCallback(DwtDialog.YES_BUTTON, 
									 this._msgDialogYesCallback, this);
	this._msgDialog.registerCallback(DwtDialog.NO_BUTTON, 
									 this._msgDialogNoCallback, this);
	
}

LmFilterDetailsView.prototype = new DwtComposite;
LmFilterDetailsView.prototype.constructor = LmFilterDetailsView;

LmFilterDetailsView.EVENT_HIDE = "hide";

LmFilterDetailsView.TAG_CONTEXT = 1;
LmFilterDetailsView.FOLDER_CONTEXT = 2;
LmFilterDetailsView.contextMap = {
	"tag": LmFilterDetailsView.TAG_CONTEXT,
	"fileinto": LmFilterDetailsView.FOLDER_CONTEXT
};


LmFilterDetailsView.prototype.toString = function() {
	return "LmFilterDetailsView";
};

LmFilterDetailsView.prototype.getNextDwtObjectId = function () {
	return this._nextSelect++;
};
LmFilterDetailsView.prototype.addHideListener = function (listener){
	this.addListener(LmFilterDetailsView.EVENT_HIDE, listener);
};

LmFilterDetailsView.prototype.isVisible = function () {
	var el = this.getHtmlElement();
	return (el && el.style.display == 'block');
};
LmFilterDetailsView.prototype.hide = function(silent) {
	// hide all SELECT boxes as a workaround for IE
	var el = this.getHtmlElement();
	var rule = this._rule;
	if (el && el.style.display == "block"){
		el.style.display = "none";
		this._resetTables();
		this._rule = null;
		this._referenceRule = null;
		this._editMode = void 0;
		if (!silent){
			this.notifyListeners(LmFilterDetailsView.EVENT_HIDE, rule);
		}
	}
};


LmFilterDetailsView.prototype.edit = function(rule) {
	this.show(rule);
};

LmFilterDetailsView.prototype.show = function(rule, referenceRule) {
	var el = this.getHtmlElement();
	if (el.style.display == "none") {
		this._rule = rule? rule : LmFilterRule.DUMMY_RULE;
		this._referenceRule = referenceRule? referenceRule: null;	
		var rule = this._rule;
		var doc = this.getDocument();
		// fill in rule name
		var ruleNameInput = Dwt.getDomObj(doc, this._ruleNameId);
		if (rule.name != null) {
			ruleNameInput.value = rule.name;
		} else {
			ruleNameInput.value = "";
		}

		// reset the groupOpSelect
		//var groupOpSelect = Dwt.getDomObj(doc, this._dwtObjects[0]);
		var groupOpSelect =	this._dwtObjects[0].obj;
		if (rule.groupOp == "allof") {
			groupOpSelect.setSelectedValue("allof");
		} else {
			groupOpSelect.setSelectedValue("anyof");
		}

		this._renderConditions(rule);
		this._renderActions(rule);
		this._addDwtObjects();
		var doc = this.getDocument();
		var outerTable = Dwt.getDomObj( doc, this._outerTableId);
		if (!this._rendered){
			var okButtonCell = Dwt.getDomObj( doc, this._okButtonCellId);
			var okButton = new DwtButton(this);
			okButton.setText("Ok");
			okButton.addSelectionListener(new LsListener(this, 
														 this._okButtonListener));
			var okButtonEl = okButton.getHtmlElement();
			if (okButtonEl && okButtonEl.parentNode){
				okButtonEl.parentNode.removeChild(okButtonEl);
			}
			okButtonCell.appendChild(okButtonEl);
			
			var cancelButtonCell = Dwt.getDomObj( doc, 
												  this._cancelButtonCellId);
			var cancelButton = new DwtButton(this);
			var cancelButtonEl = cancelButton.getHtmlElement();
			cancelButton.setText("Cancel");
			cancelButton.addSelectionListener(new LsListener(this, 
												 this._cancelButtonListener));
			var cancelButtonEl = cancelButton.getHtmlElement();
			if (cancelButtonEl && cancelButtonEl.parentNode){
				cancelButtonEl.parentNode.removeChild(cancelButtonEl);
			}
			cancelButtonCell.appendChild(cancelButtonEl);
			
			this._rendered = true;
		}
		el.style.display = "block";
	}
};

LmFilterDetailsView.prototype._addDwtObjects = function () {
	var selEl, id, wrapper, selParent;
	for (var j =0; j < this._dwtObjects.length; ++j ){
		wrapper = this._dwtObjects[j];
		if (!wrapper._added){
			selEl = wrapper.obj.getHtmlElement();
			if (selEl) {
				selEl.parentNode.removeChild(selEl);
				document.getElementById(wrapper.id).appendChild(selEl);
				selEl._filterViewSelIndex = j;
				wrapper._added = true;
			}
		}
	}
};

// ----------------------------------------------------------------------
// private rendering methods methods
// ----------------------------------------------------------------------
LmFilterDetailsView.prototype._renderConditions = function(rule) {
	// select the condition grouping op
	var doc = this.getDocument();
	var conditionTable = Dwt.getDomObj(doc, this._conditionTableId);

	var row, cell;
	var conditions = rule.conditions;
	// if we have an empty conditions block,
	// render a dummy condition.
	if (conditions.length == 0) {
		conditions = [new LmCondition];
	};
	for (var i=0; i< conditions.length; i++) {
		row = this._renderRow(this._getConditionsHtml(rule.conditions[i]));
		row = conditionTable.tBodies[0].insertBefore(row, null);
		
		cell = document.getElementById('tempConditionsCellId');
		cell.id = null;
		// +/- buttons
		this._plusMinusHtml(cell, false);
	}
};

LmFilterDetailsView.prototype._renderActions = function(rule) {
	var doc = this.getDocument();
	var actionTable = Dwt.getDomObj(doc, this._actionTableId);
	var html, row, cell;
	for (var i=0; i < rule.actions.length; i++) {

		html = this._getActionsHtml(rule.actions[i]);
		row = this._renderRow(html);
		row = actionTable.tBodies[0].insertBefore(row, null);
		cell = document.getElementById('tempEllipsisId');
		cell.id = void 0;
		var ellipsisButton = new DwtButton(this);
		ellipsisButton.setText(LmMsg.browse);
		var ebEl = ellipsisButton.getHtmlElement();
		ebEl.style.width = "50px";
		ebEl.parentNode.removeChild(ebEl);
		cell.appendChild(ebEl);
		var f = rule.actions[i].name;
		if (f == 'fileinto' || f == 'tag'){
			this._setupActionDialogButton(ebEl, ellipsisButton, f, 
										  cell.previousSibling.firstChild );
		} else {
			ebEl.style.visibility = "hidden";
		}

		cell = document.getElementById('tempCellId');
		cell.id = void 0;
		// +/- buttons
		this._plusMinusHtml(cell, true);
	}
};

LmFilterDetailsView.prototype._renderRow = function (rowStr){
	return Dwt.parseHtmlFragment(rowStr, "TR");
};

LmFilterDetailsView.prototype._contentHtml = function() {
	var html = new Array(25);
	var idx = 0;
	this._outerTableId = Dwt.getNextId();
	this._ruleNameId = Dwt.getNextId();
	this._actionContainerId = Dwt.getNextId();
	html[idx++] = "<table id=";
	html[idx++] = this._outerTableId;
	html[idx++] = " cellpadding='0' cellspacing='0' width='100%' border='0' style='padding:7px'>";
	html[idx++] = "<COLGROUP><COL></COLGROUP>";
	html[idx++] = "<tr><td><TABLE cellSpacing=5 cellPadding=0 width=100% border=0 style='table-layout:fixed;border:1px solid rgb(100, 100, 100); background-color:rgb(230, 230, 230); padding-right:15px'><colgroup><col width=28><col>";
	var w = 100;
	html[idx++] = "<tr><td colspan=2><table cellSpacing=0 cellPadding=0 style='width:700px; table-layout:fixed'><colgroup><col style='width:75px'></col><col></col></colgroup><tr><td><div style='margin-top:4px; margin-left:5px'>Rule Name: </div></td><td><input id='"
	html[idx++] = this._ruleNameId;
	html[idx++] = "' type='text' name='name' size='80' style='width:100%";
	html[idx++] = "'></td></tr></table></td></tr>";
	html[idx++] = "<tr><td colspan=2><div style='margin-top:5px'><table cellpadding=0 cellspacing=0 style='table-layout:fixed; width:600px' border=0><colgroup> <col style='width:5px'></col> <col style='width:15px'></col> <col style='width:100px'></col></colgroup><tr><td style='vertical-align:middle;'><div style='margin-left:5px'>If</div><td style='vertical-align:midlle' id=\"";
	html[idx++] = this._dwtObjects[0].id;
	html[idx++] = "\">";

	html[idx++] = "</td><td style='vertical-align:middle'> of the following conditions are met:</td></tr></table></div></td></tr>";
	html[idx++] = "<tr><td></td><td>";
	// the dynamic table for conditions
	this._conditionTableId = Dwt.getNextId();
	//var shadedBoxWidth = LsEnv.isIE? "100%": "";
	var shadedBoxWidth = "auto";
	html[idx++] = "<div style='margin-top:5px;' class=shadedBox >";
	html[idx++] = "<table id='";
	html[idx++] = this._conditionTableId;
	html[idx++] = "' cellpadding='0' cellspacing='0' border='0' style='table-layout:fixed' ><col style='width:125px'></col><col style='width:108px'></col><col style='width:135px'></col><col style='width:166px'></col><col style='width:60px'></col><col></col><tbody>";
	html[idx++] = "</tbody></table></div>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr><td colspan=2><div id=";
	html[idx++] = this._actionContainerId;
	html[idx++] = " style='margin-top:8px; margin-left:5px;'>Perform the following actions:</div></td></tr>";
	html[idx++] = "<tr><td></td><td>";
	// the dynamic table for actions
	this._actionTableId = Dwt.getNextId();
	html[idx++] = "<div style='margin-top:5px;' class=shadedBox>";
	html[idx++] = "<table id='";
	html[idx++] = this._actionTableId;
	html[idx++] = "' cellpadding='0' cellspacing='0' border='0' style='table-layout:fixed'><colgroup><col style='width: 260px'></col><col style='width:340px'></col><col></col></colgroup><tbody>";
	html[idx++] = "</tbody></table></div>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<td></td><td><table cellpadding=0 cellspacing=0 style=' table-layout:fixed' border=0> <colgroup><col></col><col style='width:100%'></col></colgroup><tr><td></td><td><table cellpadding=0 cellspacing=0 style='table-layout:fixed; width:100%' border=0><colgroup><col><col width=50><col width=50></colgroup><tr><td>&nbsp;</td><td id='";
	html[idx++] = this._okButtonCellId = Dwt.getNextId();
	html[idx++] = "' ></td><td id='";
	html[idx++] = this._cancelButtonCellId = Dwt.getNextId();
	html[idx++] = "' style='text-align:right'></td></tr></table></td></tr></table>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";

	return html.join("");
};


// ----------------------------------------------------------------------
// conditions construction methods
// ----------------------------------------------------------------------
LmFilterDetailsView.prototype._getConditionsHtml = function(con) {
	var html = new Array(10);
	var idx = 0;
	var v, condFound, conditionName, conName;
	
	conName = con.field;
	// default condition when adding a rule		
	condFound = "from";

	var configCond = LmFilterRules.getConfigForCondition (conName)
	if (configCond == null) {
		configCond = LmFilterRules.CONDITIONS["from"];
	}
	
	// Adjust for the header condition if necessary

	var condition = con;
	if (conName != null){
		if (LmFilterRules.CONDITIONS[conName].isHeader) {
			if (LmFilterRules.CONDITIONS[con.key0] != null ){
				condition = new LmCondition(con.key0, null, con.comparator, 
											con.key1);
				configCond = LmFilterRules.CONDITIONS[con.key0];
			}
		}
	}
	// select the field
	idx = 0;
	html[idx++] = "<tr><td id='";
	var selWrapper = this._createOptionsToConditionSelect(condition);
	html[idx++] = selWrapper.id;
	html[idx++] = "' valign='center' class='paddedTableCell'>";
	html[idx++] = "</td>";
	// lhs
	html[idx++] = this._getConditionsCell1Html(configCond, condition).html;
		
	// select the comparator
		
	html[idx++] = "<td id='";
	selWrapper = this._createConditionOperatorSelect(configCond, condition);
	html[idx++] = selWrapper.id;
	html[idx++] = "' valign='center' class='paddedTableCell' >";
	html[idx++] = "</td>";

	html[idx++] = this._getConditionsCell3Html(configCond, condition).html;
	html[idx++] = this._getConditionsCell4Html(configCond, condition).html;
	html[idx++] = "<td valign='center' id='tempConditionsCellId'></td>"
	html[idx++] = "</tr>";
	// fill in the rhs value for the condition (key1)
	html.length = idx;
	return html.join("");
};

LmFilterDetailsView.prototype._getConditionsCell4Html =
function(configCond, condition){
	var visibility, value;
	var nextId = Dwt.getNextId();
	var htmlStr = "<td class='paddedTableCell' valign='center' id='" + nextId + "'></td>";
	switch (configCond.cell4) {
	case LmFilterRules.TYPE_INPUT:
		break;
	case LmFilterRules.TYPE_SELECT:
		var sel = new DwtSelect(this);
		var selWrapper = {id: nextId, obj: sel}
		this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
		var op, selected;
		for (var i = 0; i < configCond.cell4ops.length; ++i){
			op = configCond.cell4ops[i];
			selected = false;
			if (condition.cell4Value == op.value){
				selected = true;
			}
			sel.addOption(new DwtSelectOptionData(op.value, op.display,
												  selected));
		}
		if (sel.getValue() == null) {
			sel.setSelected(0);
		}

		break;
	case LmFilterRules.TYPE_EMPTY:
		break;
	default:
		break;
	}
	return {html: htmlStr, id: nextId};	
};

LmFilterDetailsView.prototype._getConditionsCell3Html =
function (configCond, condition) {
	var visibility;
	var htmlStr = null;
	var nextId = Dwt.getNextId();
	var value = condition.key1;
	if ( (value == null) && (configCond.cell1 == LmFilterRules.TYPE_EMPTY)){
		value = condition.key0;
	}
	value = value? value : "";
	switch (configCond.cell3) {
	case LmFilterRules.TYPE_INPUT:
		visibility = "visible";
		// if we have extra data for this type of condition,
		// trim it off here, and save it for cell 4.
		if (configCond.cell4 != LmFilterRules.TYPE_EMPTY){
			var vlen = value.length;
			var c4len = configCond.cell4length;
			var cell4Val = value.substring(vlen - c4len, vlen);
			condition.cell4Value = cell4Val;
			value = value.substring(0, vlen - c4len);
		}
		htmlStr = 
			LsStringUtil.resolve(LmFilterDetailsView._cell3Template,
								 [nextId, visibility, value]);
		break;
	case LmFilterRules.TYPE_SELECT:
		var sel = new DwtSelect(this);
		var selWrapper = {id: nextId, obj: sel}
		this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
		var op, selected;
		for (var i = 0; i < configCond.cell3ops.length; ++i){
			op = configCond.cell3ops[i];
			selected = false;
			if (condition.cell4Value == op.value){
				selected = true;
			}
			sel.addOption(new DwtSelectOptionData(op.value, op.display,
												  selected));
		}
		if (sel.getValue() == null) {
			sel.setSelected(0);
		}
		htmlStr = "<td valign='center' class='paddedTableCell' style='visibility:visible' id='" + selWrapper.id + "'></td>";
		break;
	case LmFilterRules.TYPE_BUTTON:
		// we can use the default string, but we need to handle the button 
		// after in the same way that we insert the select objects.
		var b = new DwtButton(this, null, "pickerButton");
		b._activatedClassName = b._className + "-" + DwtCssStyle.ACTIVATED;
		b._triggeredClassName = b._className + "-" + DwtCssStyle.TRIGGERED;
		var bWrapper = {id: nextId, obj: b}
		this._dwtObjects[this.getNextDwtObjectId()] = bWrapper;
		var buttonText = (value == "")? LmMsg.pickADate: value;
		b.setText(buttonText);
		b._detailsViewValue = value;

		var menu = new DwtMenu(b,DwtMenu.CALENDAR_PICKER_STYLE);
		menu.setAssociatedObj(b);
		var cal = new DwtCalendar(menu);
		cal.setDate(new Date());
		cal._filterDetailsButton = b;
		var ls = new LsListener(this, this._dateSelListener);
		cal.addSelectionListener(ls);
		b.setMenu(menu, true);
		htmlStr = "<td valign='center' class='paddedTableCell' style='visibility:visible' id='" + bWrapper.id + "'></td>";
		break;
	case LmFilterRules.TYPE_EMPTY:
		value = "";
		visibility = "hidden";
		htmlStr = 
			LsStringUtil.resolve(LmFilterDetailsView._cell3Template,
								 [nextId, visibility, value]);
		break;
	}
	return {html: htmlStr, id: nextId};
};

LmFilterDetailsView._cell3Template = "<td id='$0' valign='center' class='paddedTableCell' style='visibility:$1'><input type='text' size='25' value='$2' style='width:100%'></td>";
LmFilterDetailsView._cell1Template =
		"<td id='$0' valign='center' class='paddedTableCell' style='visibility: $1'><input type='text' size='10' value='$2' style='width:100%'></td>";

LmFilterDetailsView.prototype._getConditionsCell1Html = 
function (configCond, cond){
	var condition = cond? cond: new LmCondition();
	var nextId = Dwt.getNextId();
	var visibility, value;
	var htmlStr = null;
	switch (configCond.cell1) {
	case LmFilterRules.TYPE_SELECT:
		var sel = new DwtSelect(this);
		var selWrapper = {id: nextId, obj: sel}
		this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
		var op, selected;
		for (var i = 0; i < configCond.cell1ops.length; ++i){
			op = configCond.cell1ops[i];
			selected = false;
			if (condition.key0 == op.value){
				selected = true;
			}
			sel.addOption(new DwtSelectOptionData(op.value, op.display,
												  selected));
		}
		if (sel.getValue() == null) {
			sel.setSelected(0);
		}
		htmlStr = "<td valign='center' class='paddedTableCell' style='visibility:visible' id='" + selWrapper.id + "'></td>";
		break;
	case LmFilterRules.TYPE_INPUT:
		visibility = "visible";
		value = condition.key0;
		if (value == null) {
			value = "";
		}
		htmlStr = 
			LsStringUtil.resolve(LmFilterDetailsView._cell1Template,
								 [nextId, visibility, value]);
		break;
	case LmFilterRules.TYPE_EMPTY:
		value = "";
		visibility = "hidden";
		htmlStr = 
			LsStringUtil.resolve(LmFilterDetailsView._cell1Template,
								 [nextId, visibility, value]);
		break;
	}
	return {html: htmlStr, id: nextId};
};

LmFilterDetailsView.prototype._createOptionsToConditionSelect = 
function (condition) {
	var sel = new DwtSelect(this);
	var selWrapper = {id: Dwt.getNextId(), obj: sel};
	this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
	sel.addChangeListener(new LsListener(this, this._conditionSelListener));
	for (var conditionName in LmFilterRules.CONDITIONS) {
		v = false;
		var ruleCondField = condition.field;
		if (ruleCondField != null && 
			conditionName == ruleCondField.toLowerCase()) {
			v = true;
		}
		sel.addOption(new DwtSelectOptionData(
								  conditionName,
								  LmFilterRules.CONDITIONS[conditionName].desc,
								  v));
	}
	if (sel.getValue() == null){
		sel.setSelected(0);
	}
	return selWrapper;
};

LmFilterDetailsView.prototype._createConditionOperatorSelect = 
function (configCond, condition){
	var sel = new DwtSelect(this);
	var selWrapper = {id: Dwt.getNextId(), obj: sel}
	this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
	this._addConditionOperatorOptions(sel, configCond, condition);
	return selWrapper;
};

LmFilterDetailsView.prototype._addConditionOperatorOptions =
function (sel, configCond, condition){
	if (!condition) condition = new LmCondition();
	var relatedComparators = configCond.op;
	var negativeDisplayValues = configCond.negativeOps;
	var negDisplayVal, negVal;
	for (var j=0; j< relatedComparators.length; j++) {
		v = nv = false;
		var ruleCondOp = condition.comparator;
		if (ruleCondOp != null) {
			if (relatedComparators[j] == ruleCondOp) {
				v = true;
			} else if ("not " + relatedComparators[j] == ruleCondOp) {
				nv = true;
			}
		}
		negVal = "not " + relatedComparators[j];
		negDisplayVal = negativeDisplayValues[j];
		sel.addOption(new DwtSelectOptionData(relatedComparators[j],
											  relatedComparators[j],
											  v));

		sel.addOption(new DwtSelectOptionData(negVal, negDisplayVal, nv));

	}
	if (sel.getValue() == null){
		sel.setSelected(0);
	}
};

// ----------------------------------------------------------------------
// actions construction methods
// ----------------------------------------------------------------------
LmFilterDetailsView.prototype._getActionsHtml = function (action) {
	var html = new Array(10);
	var idx = 0;
	var v, actFound;
	// default action when adding a rule
	actFound = "keep";
	// action name
	idx = 0;
	html[idx++] = "<tr><td id='";
	var sel = new DwtSelect(this);
	var selWrapper = {id: Dwt.getNextId(), obj: sel};
	this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
	html[idx++] = selWrapper.id;
	html[idx++] = "' class='paddedTableCell' valign='center'>";
	sel.addChangeListener(new LsListener(this, this._actionSelListener));
	for (var actionName in LmFilterRules.ACTIONS) {
		v = false;
		var ruleActName = action.name;
		if (ruleActName != null && ruleActName == actionName) {
			v = true;
			actFound = ruleActName;
		}
		sel.addOption(new DwtSelectOptionData(
										actionName,
										LmFilterRules.ACTIONS[actionName].desc,
										v));
		if (sel.getValue() == null){
			sel.setSelected(0);
		}
	}
	html[idx++] = "</td>";
	
	var configAction = LmFilterRules.ACTIONS[actFound];

	// action parameter
	v = action.arg;
	if (v == null) {
		v = "";
	}
	var vis = "visible";
	if (configAction.param == LmFilterRules.TYPE_EMPTY) {
		vis= "hidden";
	}
	
	html[idx++] = "<td class='paddedTableCell' valign='center' style='visibility:";
	html[idx++] = vis;
	html[idx++] = "'><table cellpadding=0 cellspacing=0 style='table-layout:fixed; width:230px'><colgroup><col style='width:180px'></col> <col style='width:60px'></col></colgroup><tr><td valign='center' id='";
	var nextId = Dwt.getNextId();
	html[idx++] = nextId;
	html[idx++] = "'>";
	html[idx++] = this._getActionParamHtml(configAction, action, nextId);
	html[idx++] = "</td><td id='tempEllipsisId'></td></tr></table></td>";
	html[idx++] = "<td id='tempCellId'></td></tr>";
	html.length = idx;
	return html.join("");
};

LmFilterDetailsView.prototype._getActionParamHtml = 
function ( configAction, action, nextId){
	var htmlStr = "";
	var value = action.arg? action.arg: "";
	switch(configAction.param) {
	case LmFilterRules.TYPE_INPUT:
		htmlStr = "<input type='text' size='25' value='" + value + "'>";
		break;
	case LmFilterRules.TYPE_SELECT:
		htmlStr = "";
		var sel = new DwtSelect(this);
		var selWrapper = {id: nextId, obj: sel};
		this._dwtObjects[this.getNextDwtObjectId()] = selWrapper;
		var op, selected;
		for (var i = 0 ; i < configAction.paramOps.length; ++i) {
			op = configAction.paramOps[i];
			selected = false;
			if ( op.value == value ) {
				selected = true;
			}
			sel.addOption( new DwtSelectOptionData(op.value,
												   op.display,
												   selected));
		}
		if (sel.getValue() == null){
			sel.setSelected(0);
		}
		break;
	}
	return htmlStr;
};

// ----------------------------------------------------------------------
// + - button construction methods
// ----------------------------------------------------------------------
LmFilterDetailsView.prototype._plusMinusHtml = function(cell, isActionRow) {
	var doc = this.getDocument();
	cell.align = "right";
	cell.width = "80";
	// create a table for the +/- buttons
	var buttonsTable = doc.createElement("table");
	buttonsTable.cellpadding = 0;
	buttonsTable.cellspacing = "5";
	buttonsTable.width = "100%";
	var row = buttonsTable.insertRow(0);
	var cell0 = row.insertCell(0);	// + button cell
	var cell1 = row.insertCell(1);	// - button cell
	var plusButton = new DwtButton(this);
	plusEl = plusButton.getHtmlElement();
 	plusEl.style.width="30px";
	plusButton.setImage(LmImg.I_PLUS);
	var plusList = null;
	var minusList = null;
	if (isActionRow) {
		plusList = new LsListener(this, this._actionPlusClickListener);
		minusList = new LsListener(this, this._actionMinusClickListener);
	} else {
		plusList = new LsListener(this, this._conditionPlusClickListener);
		minusList = new LsListener(this, this._conditionMinusClickListener);
	}
	plusButton.addSelectionListener(plusList);
	               

	var minusButton = new DwtButton(this);
	var minusEl = minusButton.getHtmlElement();
	minusEl.style.width="30px";
	minusButton.addSelectionListener(minusList);

	minusButton.setImage(LmImg.I_MINUS);
	cell0.appendChild(plusButton.getHtmlElement());
	cell1.appendChild(minusButton.getHtmlElement());
	cell.appendChild(buttonsTable);
};

LmFilterDetailsView._getAncestor = function (el, tagName){
	while (el && el.tagName != tagName){
		el = el.parentNode;
	}
	return el;
};

LmFilterDetailsView.prototype._getRowFromButtonEvent = function(ev){
	var button = ev.item;
	var el = button.getHtmlElement();
	// get the second TR we see in the DOM ( going up ).
	var row = LmFilterDetailsView._getAncestor(el, "TR");
	row = LmFilterDetailsView._getAncestor(row.parentNode, "TR");
	return row;	
};

LmFilterDetailsView.prototype._deleteRow = function (tableOrId, row){
	var table = null;
	if (typeof(tableOrId) == 'string'){
		table = Dwt.getDomObj(this.getDocument(), tableId);
	} else {
		table = tableOrId;
	}
	var rows = table.rows;
	var i = 0;
	var index = -1;
	for (var i = 0; i < rows.length ; ++i) {
		if (rows[i] == row) {
			index = i;
			break;
		}
	}
	if (index != -1){
		table.deleteRow(index);
		return true;
	}
	return false;
};

// ----------------------------------------------------------------------
// button listening methods
// ----------------------------------------------------------------------
LmFilterDetailsView.prototype._dateSelListener = function (ev) {
	var cal = ev.item;
	var b = cal._filterDetailsButton;
	var date = ev.detail;
	var dateString = (( date.getMonth() + 1 ) + "/" + date.getDate() + "/" +
					  date.getFullYear());
	b.setText(dateString);
	b._detailsViewValue = dateString;
};

LmFilterDetailsView.prototype._actionMinusClickListener = function (ev) {
	var row = this._getRowFromButtonEvent(ev);
	if (row == null) return;
	var actionTable = document.getElementById(this._actionTableId);
	if ((actionTable.rows.length == 1) && (row == actionTable.rows[0])){
		return null;
	}

	this._cleanUpActionRow(row);
	var deleted = this._deleteRow(actionTable, row, actionTable);	
};

LmFilterDetailsView.prototype._cleanUpActionRow = function (row) {
	//clean up objects -- the action row has 3 cells:
	// 1. contains a DwtSelect Object
	// 2. contains a table which houses an input and a DwtButton
	// 3. contains a table which encloses a pair of DwtButtons
	var selObj = DwtSelect.getObjectFromElement(row.cells[0].firstChild);
	selObj.dispose();
	var table = row.cells[1].firstChild;
	var button = Dwt.getObjectFromElement(table.rows[0].cells[1].firstChild);
	button.dispose();

	table = row.cells[2].firstChild;
	button = Dwt.getObjectFromElement(table.rows[0].cells[0].firstChild);
	button.dispose();

	button = Dwt.getObjectFromElement(table.rows[0].cells[1].firstChild);
	button.dispose();
};

LmFilterDetailsView.prototype._conditionMinusClickListener = function (ev) {
	var row = this._getRowFromButtonEvent(ev);
	if (row == null) return;

	var conditionTable = document.getElementById(this._conditionTableId);
	if ((conditionTable.rows.length == 1) && (row == conditionTable.rows[0])){
		return null;
	}
	this._cleanUpConditionRow(row);
	var deleted = this._deleteRow(conditionTable, row);
};

LmFilterDetailsView.prototype._cleanUpConditionRow = function (row) {
	//clean up objects -- the action row has 3 cells:
	// 0. contains a DwtSelect Object
	// 1. contains an input widget
	// 2. contains a DwtSelect Object
	// 3. contains an input widget
	// 4. contains 
	// 5. contains a table housing two dwtbuttons.

	var selObj = DwtSelect.getObjectFromElement(row.cells[0].firstChild);
	var conditionName = selObj.getValue();
	var configCond = LmFilterRules.CONDITIONS[conditionName];
	selObj.dispose();

	if (configCond.cell1 == LmFilterRules.TYPE_SELECT) {
		selObj = DwtSelect.getObjectFromElement(row.cells[1].firstChild);
		selObj.dispose();
	}
	selObj = DwtSelect.getObjectFromElement(row.cells[2].firstChild);
	selObj.dispose();

	if (configCond.cell4 == LmFilterRules.TYPE_SELECT) {
		selObj = DwtSelect.getObjectFromElement(row.cells[4].firstChild);
		selObj.dispose();
	}
	table = row.cells[5].firstChild;
	button = Dwt.getObjectFromElement(table.rows[0].cells[0].firstChild);
	button.dispose();

	button = Dwt.getObjectFromElement(table.rows[0].cells[1].firstChild);
	button.dispose();
};

LmFilterDetailsView.prototype._actionPlusClickListener = function (ev) {
 	// doesn't really matter where the action is added, so we'll always 
	// add at the end;
	var rule = LmFilterRule.DUMMY_RULE;
	this._renderActions(rule);
	this._addDwtObjects();
};

LmFilterDetailsView.prototype._conditionPlusClickListener = function (ev) {
 	// doesn't really matter where the row is added, so we'll always 
	// add at the end;
	var rule = LmFilterRule.DUMMY_RULE;
	this._renderConditions(rule);
	this._addDwtObjects();
};

LmFilterDetailsView.prototype._okButtonListener = function(evt) {
	// This is where we have to save the information
	// generate the soap call here for the save. If it fails, I think we have
	// to popup another dialog in front of this one. Ugly.
	// Get rule name
	var okButton = evt.item;
	var ruleName = document.getElementById(this._ruleNameId).value
	var incompleteSave = false;
	var andOrOpVal = this._dwtObjects[0].obj.getValue();
	var ruleObj = this._rule;
	this._editMode = true;
	if (this._rule == LmFilterRule.DUMMY_RULE){
		ruleObj = new LmFilterRule(ruleName);
		ruleObj.setGroupOp(andOrOpVal);
		this._editMode = false;
	} else {
		ruleObj.setName(ruleName);
		ruleObj.setGroupOp(andOrOpVal);
		ruleObj.clearActions();
		ruleObj.clearConditions();
	}

	var conditionTable = document.getElementById(this._conditionTableId);
	var rows = conditionTable.rows;
	var i = 0;
	var sel = null;
	var conditionName = null;
	var condition = null;
	var lhs = null;
	var opSel, opValue, rhs;
	for (i = 0; i < rows.length; ++i) {
		sel = 
			DwtSelect.getObjectFromElement(rows[i].cells[0].firstChild);
		conditionName = sel.getValue();
		configCond = LmFilterRules.CONDITIONS[conditionName];
		var cellEl = rows[i].cells[1].firstChild;
		switch (configCond.cell1){
		case LmFilterRules.TYPE_INPUT:
			lhs = cellEl.value;
			break;
		case LmFilterRules.TYPE_SELECT:
			var selObj = 
				DwtSelect.getObjectFromElement(cellEl);
			lhs = selObj.getValue();
			break;
		case LmFilterRules.TYPE_EMPTY:
			if (configCond.isHeader){
				lhs = conditionName;
				conditionName = "header";
			} else {
				lhs = null;
			}
			break;
		default:
			lhs = null;
			break;
		}

		var opSel = 
			DwtSelect.getObjectFromElement(rows[i].cells[2].firstChild);
		opValue = opSel.getValue();
		cellEl = rows[i].cells[3].firstChild;
		switch (configCond.cell3) {
		case LmFilterRules.TYPE_INPUT:
			rhs = cellEl.value;
			break;
		case LmFilterRules.TYPE_SELECT:
			var selObj = 
				DwtSelect.getObjectFromElement(cellEl);
			rhs = selObj.getValue();			
			break;
		case LmFilterRules.TYPE_BUTTON:
			var b = Dwt.getObjectFromElement(cellEl);
			rhs = b._detailsViewValue;
			break;
		default:
			rhs = null;
			break;

		}

		if (configCond.cell4 == LmFilterRules.TYPE_SELECT){
			var cellSel = 
				DwtSelect.getObjectFromElement(rows[i].cells[4].firstChild);
			rhs += cellSel.getValue();;
		}
		if (!this._isConditionComplete(conditionName, lhs, opValue, rhs)){
			incompleteSave = true;
		}
		ruleObj.addCondition(conditionName, lhs, opValue, rhs);
	}

	var actionTable = document.getElementById(this._actionTableId);
	var name = null;
	var action = null;
	var input = null;
	var actionValue = "";
	var b;
	rows = actionTable.rows;
	i = 0;

	for (; i < rows.length; ++i) {
		sel = 
			DwtSelect.getObjectFromElement(rows[i].cells[0].firstChild);
		name = sel.getValue();
		action = LmFilterRules.ACTIONS[name];
		var cell = rows[i].cells[1].firstChild.rows[0].cells[0];
		switch (action.param) {
			
		case LmFilterRules.TYPE_INPUT:
			input = cell.firstChild;
			actionValue = input.value;
			break;
		case LmFilterRules.TYPE_SELECT:
			sel = DwtSelect.getObjectFromElement(cell.firstChild);
			actionValue = sel.getValue();
			break;
		default:
			actionValue = "";
			break;
		}
		if (!this._isActionComplete(name, actionValue)){
			incompleteSave = true;
		}
		ruleObj.addAction(name, actionValue);
	}
	
	// we have to hide before modifiying the model, because the model notifies
	// listeners, that might need this object to be gone.
	okButton.setActivated(false);
	this._ruleToBeSaved = ruleObj;
	if (incompleteSave) {
		this._msgDialog.popup();
	} else {
		this._saveRule();
	}
};

LmFilterDetailsView.prototype._msgDialogYesCallback = function (args){
	this._msgDialog.popdown();
	this._saveRule();
};

LmFilterDetailsView.prototype._msgDialogNoCallback = function (args){
	this._msgDialog.popdown();
	// do nothing.
};

LmFilterDetailsView.prototype._saveRule = function () {
	// Save the reference rule, since hide will reset state for the widget.
	var refRule = this._referenceRule;
	var ruleObj = this._ruleToBeSaved;
	var editMode = this._editMode;
	delete this._ruleToBeSaved;
	this.hide();

	if (!editMode){
		if (refRule){
			LmFilterRules.insertRule(ruleObj, refRule);
		}else {
			LmFilterRules.addRule(ruleObj);
		}
	} else {
		LmFilterRules.modifyRule(ruleObj);
	}
};

LmFilterDetailsView.prototype._isConditionComplete = function (conditionName, lhs,
															   op, rhs){

	var configCond = LmFilterRules.CONDITIONS[conditionName];
	if (configCond.cell1 != LmFilterRules.TYPE_EMPTY && 
		( (!lhs) || (lhs == ""))) {
			return false;
	}
	if (configCond.cell3 != LmFilterRules.TYPE_EMPTY &&
		( (!rhs) || (rhs == ""))){
		return false;
	}
	return true;
};

LmFilterDetailsView.prototype._isActionComplete = function (actionName, param) {
	var configAction = LmFilterRules.ACTIONS[actionName];
	if (configAction.param != LmFilterRules.TYPE_EMPTY &&
		( (!param) || (param == ""))) {
			return false;
	}
	return true;
};

LmFilterDetailsView.prototype._cancelButtonListener = function(evt) {
	var cancelButton = evt.item;
	cancelButton.setActivated(false);
	this.hide();
};

// ----------------------------------------------------------------------
// private reset methods
// ----------------------------------------------------------------------

LmFilterDetailsView.prototype._resetTables = function() {
	var doc = this.getDocument();
	var conditionTable = Dwt.getDomObj(doc, this._conditionTableId);
	var tbody = conditionTable.tBodies[0];
	while ( tbody.firstChild!= null) {
		this._cleanUpConditionRow(tbody.firstChild);
		tbody.removeChild(tbody.firstChild);
	}
	var actionTable = Dwt.getDomObj(doc, this._actionTableId);
	tbody = actionTable.tBodies[0];
	while (tbody.firstChild != null) {
		this._cleanUpActionRow(tbody.firstChild);
		tbody.removeChild(tbody.firstChild);
	}
};


// ----------------------------------------------------------------------
// methods handling changing of main selects
// ----------------------------------------------------------------------	
/**
 * When a condition is selected, dynamically show/hide lhs/rhs value, and
 * compose the allowed comparators depending on the newly chosen condition
 * type.
 */
LmFilterDetailsView.prototype._conditionSelListener = function(ev) {
	var condFound = ev._args.newValue;
	var configCond = LmFilterRules.CONDITIONS[condFound];
	var selectObj = ev._args.selectObj;
	var sel = selectObj.getHtmlElement();
	var rowEl = LmFilterDetailsView._getAncestor(sel, "TR");

	var parentCell = sel.parentNode;
	var lhsCell = sel.parentNode.nextSibling;
	var opCell  = lhsCell.nextSibling;
	var rhsCell = lhsCell.nextSibling.nextSibling;
	var cell4 = rhsCell.nextSibling;

	var newCell1 = lhsCell.cloneNode(false);
	var dummyCondition = new LmCondition();
	var htmlObj = this._getConditionsCell1Html(configCond,dummyCondition);
	newCell1.innerHTML = htmlObj.html.replace(/<\?td[^>]*>?/g,"");
	newCell1.id = htmlObj.id;
	newCell1.style.visibility = 
	  (configCond.cell1 != LmFilterRules.TYPE_EMPTY) ? "visible" : "hidden";
	rowEl.insertBefore(newCell1, lhsCell);
	rowEl.removeChild(lhsCell);	
	
	
	var opSelect = DwtSelect.getObjectFromElement(opCell.firstChild);
	// removing existing comparators
	opSelect.clearOptions();
	this._addConditionOperatorOptions(opSelect, configCond);

	var newCell3 = rhsCell.cloneNode(false);

	htmlObj = this._getConditionsCell3Html(configCond, dummyCondition);
	// since we've cloned the node, we need to trim off the td tags
	newCell3.innerHTML = htmlObj.html.replace(/<\/?td[^>]*>?/g,"");;
	newCell3.id = htmlObj.id;
	newCell3.style.visibility = 
	  (configCond.cell3 != LmFilterRules.TYPE_EMPTY) ? "visible" : "hidden";
	rowEl.insertBefore(newCell3, rhsCell);
	rowEl.removeChild(rhsCell);
	
	var newCell4 = cell4.cloneNode(false);
	htmlObj = this._getConditionsCell4Html(configCond, dummyCondition);
	newCell4.innerHTML = htmlObj.html.replace(/<\/?td[^>]*>?/g,"");
	newCell4.id = htmlObj.id;
	rowEl.insertBefore(newCell4, cell4);
	rowEl.removeChild(cell4);
	this._addDwtObjects();
	
};
	
/**
 * When an action is selected, dynamically show/hide the param input box 
 * depending on whether the action can take a parameter.
 */
LmFilterDetailsView.prototype._actionSelListener = function(ev) {
	var sel = ev._args.selectObj;
	var actFound = sel.getValue();
	var configAction = LmFilterRules.ACTIONS[actFound];
	var selEl = sel.getHtmlElement();
	var paramTableCell = selEl.parentNode.nextSibling;
	var paramCell = paramTableCell.firstChild.rows[0].cells[0];
	//var input = paramCell.firstChild.rows[0].cells[0].firstChild;
	var rowEl = paramTableCell.firstChild.rows[0];

	var newCell = paramCell.cloneNode(false);
	var nextId = Dwt.getNextId();
	html = this._getActionParamHtml(configAction, new LmAction() , nextId);
	newCell.innerHTML = html;
	newCell.style.width="100%";
	newCell.id = nextId;
	rowEl.insertBefore(newCell, paramCell);
	rowEl.removeChild(paramCell);
	this._addDwtObjects();

	paramTableCell.style.visibility = 
	   (configAction.param == LmFilterRules.TYPE_EMPTY)? "hidden": "visible";
	var button = paramTableCell.firstChild.rows[0].cells[1].firstChild;
	if (configAction.param == LmFilterRules.TYPE_INPUT &&
		(actFound == 'fileinto') || (actFound == 'tag')){
		var b = LsCore.objectWithId(button.dwtObj);
		this._setupActionDialogButton(button, b, actFound, newCell.firstChild);
	} else {
		button.style.visibility = "hidden";
	}
};

LmFilterDetailsView.prototype._setupActionDialogButton = function (el, button,
																   actionName,
																   destInput){
	el.style.visibility = "visible";
	var ctxt = LmFilterDetailsView.contextMap[actionName];
	button.removeSelectionListeners();
	var ls = new LsListener(this, this._showContextDialog);
	ls._args = [ctxt, destInput];
	button.addSelectionListener(ls);
};

LmFilterDetailsView.prototype._showContextDialog = function(args) {
	var dialog = null;
	var callback = null;
	var ctxt = args[0];
	var input = args[1];
	switch (ctxt){
	case LmFilterDetailsView.FOLDER_CONTEXT:
		dialog = this._appCtxt.getMoveToDialog();
		dialog.reset();
		dialog.setTitle("Pick a Folder");
		callback = this._handleFolderSelection;
		break;
	case LmFilterDetailsView.TAG_CONTEXT:
		var dialog = this._tagDialog = 
			new LmPickTagDialog(this.shell,this._appCtxt.getMsgDialog());
		callback = this._handleTagSelection;
		break;
	default:
		// argument error
		return;
	};
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback, this, input);
	dialog.popup();	
};


LmFilterDetailsView.prototype._handleFolderSelection = function(args) {
	this._appCtxt.getMoveToDialog().popdown();
	var destInput = args[0];
	var folder = args[1];
	var fullPath = '/' +  folder.getPath();
	destInput.value = fullPath;
};

LmFilterDetailsView.prototype._handleTagSelection = function(args) {
	this._tagDialog.popdown();
	var destInput = args[0];
	var tag = args[1];
	destInput.value = tag.getName();
};

	
/**
 * Since we have inputs inside of a dwt widget, we have to make sure that
 * focus clicks get to them.
 */
LmFilterDetailsView.prototype._mouseDownListener = function (ev){
	var target = ev.target;
	if (target.tagName == "INPUT"){
		// reset mouse event to propagate event to browser 
		// (allows text selection)
		ev._stopPropagation = false;
		ev._returnValue = true;
		ev._populated = true;
	}
};
