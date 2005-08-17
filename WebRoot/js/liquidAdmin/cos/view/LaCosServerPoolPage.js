/**
* @class LaCosServerPoolPage
* @contructor
**/
function LaCosServerPoolPage (parent, app) {
	if (arguments.length == 0) return;
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	/*
	* _fieldIds[] - this is a map, the keys are fields names of the LaCos object
	* and values are ids of the corresponding form fields 
	*/	
	this._app = app;
	this._rendered=false;
//	this._initialized = false;
	this.isNewObject=false;	
	this.setScrollStyle(DwtControl.SCROLL);			
}

LaCosServerPoolPage.prototype = new DwtTabViewPage;
LaCosServerPoolPage.prototype.constructor = LaCosServerPoolPage;

/**
* Public methods
**/

LaCosServerPoolPage.prototype.toString = 
function() {
	return "LaCosServerPoolPage";
}

LaCosServerPoolPage.prototype.resetSize = 
function(newWidth, newHeight) {
	if(this._rendered) {
		DwtTabViewPage.prototype.resetSize.call(this, newWidth, newHeight);
	}
}

LaCosServerPoolPage.prototype.showMe = 
function() {
	if(!this._rendered) {
		this._createHTML();
		this._createUI(); 	//initialize DWT widgets on the page
	}

/*	if(!this._initialized) {
		this._createUI(); 	//initialize DWT widgets on the page
	}	
*/	
	if(this.isNewObject) {
		this._setFields();
	}	
	DwtTabViewPage.prototype.showMe.call(this);
}

LaCosServerPoolPage.prototype.setEnabled = 
function(flag) {
	if(!this._rendered) {
		return;		
	}
}

LaCosServerPoolPage.prototype.setDirty = 
function (isD) {
	if(isD) {
		if(this._app.getCurrentController().getToolBar()) {
			if(this._app.getCurrentController().getToolBar().getButton(LaOperation.SAVE)) {
				this._app.getCurrentController().getToolBar().getButton(LaOperation.SAVE).setEnabled(true);
			}
		}
	}
	this._isDirty = isD;
}

/**
* @param item - LaCos object 
* copies attribute values from object to form fields
**/
LaCosServerPoolPage.prototype.setFields = 
function (item) {
	this.isNewObject=true;
	this._currentObject=item;
}

/**
* protected and private methods
**/


/**
* @method _setFields
* transfers the values from internal object (_containedObject)
* to the form fields
**/
LaCosServerPoolPage.prototype._setFields = 
function() {

	var sourceArray = this._app.getServerList().getVector().getArray();
	var hostVector = new LaItemVector();
	if(this._currentObject.attrs && this._currentObject.attrs[LaCos.A_liquidMailHostPool]) {
		if(this._currentObject.attrs[LaCos.A_liquidMailHostPool] instanceof Array) {
			for(sname in this._currentObject.attrs[LaCos.A_liquidMailHostPool]) {
				var newServer = new LaServer();
				newServer.load("id", this._currentObject.attrs[LaCos.A_liquidMailHostPool][sname]);
				hostVector.add(newServer);
			}
		} else if(typeof(this._currentObject.attrs[LaCos.A_liquidMailHostPool]) == 'string'){
			var newServer = new LaServer();
			newServer.load("id", this._currentObject.attrs[LaCos.A_liquidMailHostPool]);
			hostVector.add(newServer);
		}
	} 
	this._targetListView.set(hostVector);
	var sourceVector = new LaItemVector();
	for(var ix in sourceArray) {
		if(!hostVector.contains(sourceArray[ix])) {
			sourceVector.add(sourceArray[ix]);
		}
	}
	this._sorceListView.set(sourceVector);
	this.isNewObject=false;	
}


/**
* @method _getFields
* transfers the values from form fields (_containedObject)
* to the internal object
**/
LaCosServerPoolPage.prototype.getFields = 
function (item) {
	item.attrs[LaCos.A_liquidMailHostPool] = new Array();
	var list = this._targetListView.getList().getArray();
	if(list && list.length) {
		for (var ix = 0; ix < list.length; ix++) {
			item.attrs[LaCos.A_liquidMailHostPool].push(list[ix].id);
		}
	}
}

LaCosServerPoolPage.prototype._createUI = 
function() {
	//remove button
	this._removeButton = this._setupButton(this._removeButtonId, LaMsg.NAD_Remove);
	this._removeButton.addSelectionListener(new LsListener(this, this._removeButtonListener));
	this._removeButton.setEnabled(false);
	var removeDiv = Dwt.getDomObj(this.getDocument(), this._removeDivId);
	removeDiv.appendChild(this._removeButton.getHtmlElement());

	this._addButton = this._setupButton(this._addButtonId, LaMsg.NAD_Add);
	this._addButton.addSelectionListener(new LsListener(this, this._addButtonListener));
	this._addButton.setEnabled(false);
	var addDiv = Dwt.getDomObj(this.getDocument(), this._addDivId);
	addDiv.appendChild(this._addButton.getHtmlElement());
	
	var targetListDiv = Dwt.getDomObj(this.getDocument(), this._targetListId);
	this._targetListView = new LaCosServerPoolPage_LaListView(this);
	targetListDiv.appendChild(this._targetListView.getHtmlElement());
	
	//var size = Dwt.getSize(targetListDiv);
	//this._targetListView.setSize(size.x, size.y);
	this._targetListView.addSelectionListener(new LsListener(this, this._targetListener));
	
	//source list
	var sorceListDiv = Dwt.getDomObj(this.getDocument(), this._sourceListId);
	this._sorceListView = new LaCosServerPoolPage_LaListView(this);
	sorceListDiv.appendChild(this._sorceListView.getHtmlElement());
	//var size = Dwt.getSize(sorceListDiv);
	//this._sorceListView.setSize(size.x, size.y);
	this._sorceListView.addSelectionListener(new LsListener(this, this._sorceListener));
	this._rendered = true;
}

LaCosServerPoolPage.prototype._getField = 
function(obj, field, attr) {
	var elem = Dwt.getDomObj(this.getDocument(), this._fieldIds[field]);
	if(elem != null)
		obj.attrs[attr] = elem.value;

}

// Creates a DwtButton and adds a few props to it
LaCosServerPoolPage.prototype._setupButton =
function(id, name) {
	var button = new DwtButton(this);
	button.setText(name);
	button.id = id;
	button.setHtmlElementId(id);
	button._activeClassName = button._origClassName + " " + DwtCssStyle.ACTIVE;
	button._nonActiveClassName = button._origClassName;
	return button;
}

LaCosServerPoolPage.prototype._createHTML = 
function () {
	var idx = 0;
	var html = new Array(50);
	this._sourceListId = Dwt.getNextId();
	this._targetListId = Dwt.getNextId();
	this._addButtonId = Dwt.getNextId();
	this._addDivId = Dwt.getNextId();
	this._removeButtonId = Dwt.getNextId();
	this._removeDivId = Dwt.getNextId();
	
	html[idx++] = "<div class='LaCosView'>";	
	html[idx++] = "<table style='width:50ex' cellspacing='0' cellpadding='0' border='0'>";
	html[idx++] = "<tr>";
	// source list
	html[idx++] = "<td align='left'><div style='width:20ex' id='" + this._sourceListId + "' class='serverPickList'></div></td>";
	// buttons
	html[idx++] = "<td valign='middle' align='center' style='width:10ex'>";
	//add button
	html[idx++] = "<div id='" + this._addDivId + "'></div>";
	html[idx++] = "<br />";
	// remove button
	html[idx++] = "<div id='" + this._removeDivId + "'></div>";
	html[idx++] = "</td>";

	// target list
	html[idx++] = "<td align='right'><div style='width:20ex' id='" + this._targetListId + "' class='serverPickList'></div></td>";	
	html[idx++] = "</tr></table></div>";
	this.getHtmlElement().innerHTML = html.join("");
//	this._rendered = true;
}

LaCosServerPoolPage.prototype._targetListener = 
function (ev) {
	this._removeButton.setEnabled(true);
}

LaCosServerPoolPage.prototype._sorceListener = 
function () {
	this._addButton.setEnabled(true);
}

LaCosServerPoolPage.prototype._addButtonListener = 
function (ev) {
	//get selected item
	var selected = this._sorceListView.getSelection();
	//add it to the target list
	for (var i in selected) {
		this._targetListView.getList().add(selected[i]);
		this._sorceListView.getList().remove(selected[i]);
	}
	//call setUI.
	this._sorceListView.setUI();
	this._targetListView.setUI();
	//reset button states
	this._addButton.setEnabled(false);
	this._removeButton.setEnabled(false);	
	this.setDirty(true);
}

LaCosServerPoolPage.prototype._removeButtonListener = 
function () {
	//get selected item
	var selected = this._targetListView.getSelection();
	//add it to the source list
	for (var i in selected) {
		this._sorceListView.getList().add(selected[i]);
		this._targetListView.getList().remove(selected[i]);
	}
	//call setUI.
	this._sorceListView.setUI();
	this._targetListView.setUI();
	//reset button states
	this._removeButton.setEnabled(false);
	this._addButton.setEnabled(false);
	this.setDirty(true);
}

function LaCosServerPoolPage_LaListView(parent) {
	if (arguments.length == 0) return;
	LaListView.call(this, parent);
}


LaCosServerPoolPage_LaListView.prototype = new LaListView;
LaCosServerPoolPage_LaListView.prototype.constructor = LaCosServerPoolPage_LaListView;

LaCosServerPoolPage_LaListView.prototype.toString = 
function() {
	return "LaCosServerPoolPage_LaListView";
}

// abstract methods
LaCosServerPoolPage_LaListView.prototype._createItemHtml = 
function(item) {
	var html = new Array(50);
	var	div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);		
	
	var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='0' cellpadding='1'>";
	html[idx++] = "<tr>";
	// name
	html[idx++] = "<td>&nbsp;";
	html[idx++] = LsStringUtil.htmlEncode(item.name);
	html[idx++] = "</td>";
	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

LaCosServerPoolPage_LaListView.prototype._setNoResultsHtml = 
function() {
	var	div = this.getDocument().createElement("div");
	div.innerHTML = "<table width='100%' cellspacing='0' cellpadding='1'><tr><td class='NoResults'><br>&nbsp</td></tr></table>";
	this._parentEl.appendChild(div);
}
