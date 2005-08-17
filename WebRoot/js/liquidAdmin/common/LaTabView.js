/**
* LaTabView is an abstract class for creating views that present data in tabs.
* All the tabbed views in the Admin UI should extend LaTabView.
* call initForm after calling the constructor
* @class LaTabView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaTabView (parent, app) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, parent, "DwtTabView", Dwt.ABSOLUTE_STYLE);	
	this._app = app;
	this._drawn = false;	
	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	this._containedObject = null;
	this.setScrollStyle(DwtControl.SCROLL);
	this._currentSubTab = [];
}

LaTabView.prototype = new DwtComposite();
LaTabView.prototype.constructor = LaTabView;

LaTabView.DEFAULT_TAB = 1;

/**
* @param xModelMetaData - XModel metadata that describes data model
* @param xFormMetaData - XForm metadata that describes the form
**/
LaTabView.prototype.initForm = 
function (xModelMetaData, xFormMetaData) {
	if(xModelMetaData == null || xFormMetaData == null)
		throw new LsException("Metadata for XForm and/or XModel are not defined", LsException.INVALID_PARAM, "DwtXWizardDialog.prototype._initForm");

	this._localXModel = new XModel(xModelMetaData);
	this._localXForm = new XForm(xFormMetaData, this._localXModel, null, this);
	this._localXForm.setController(this._app);
	this._localXForm.draw();
	this._drawn = true;
}

/**
* @return XForm instance displayed on the view
**/
LaTabView.prototype.getMyForm = function () {
	return this._localXForm;
}

/**
* @return XModel instance controlled by the XForm on the view
**/
LaTabView.prototype.getMyModel = function () {
	return this._localXModel;
}


/**
* @method getObject returns the object contained in the view
* before returning the object this updates the object attributes with 
* tha values from the form fields 
**/
LaTabView.prototype.getObject =
function() {
	return this._containedObject;
}

/**
* @method setObject sets the object contained in the view
* @param entry - LaItem object to display
**/
LaTabView.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();

	for (var a in entry.attrs) {
		this._containedObject.attrs[a] = entry.attrs[a];
	}
	
	if(!entry[LaModel.currentTab])
		this._containedObject[LaModel.currentTab] = "1";
	else
		this._containedObject[LaModel.currentTab] = entry[LaModel.currentTab];
		
	this._localXForm.setInstance(this._containedObject);
}

LaTabView.prototype.setEnabled = 
function(enable) {
	//abstract. This method may be depriicated in near future
}

/**
* @param isD Boolean - flag indicates whether data on the form ahs been modified by user
**/
LaTabView.prototype.setDirty = 
function (isD) {
	this._app.getCurrentController().setDirty(isD);
	this._isDirty = isD;
}

LaTabView.prototype.getCurrentTab = 
function() {
	return this._containedObject[LaModel.currentTab];
}

LaTabView.prototype.getCurrentSubTab = 
function() {
	var subtab = this._currentSubTab[this._containedObject[LaModel.currentTab]];
	if (subtab == null) {
		subtab = this._currentSubTab[this._containedObject[LaModel.currentTab]] = LaTabView.DEFAULT_TAB;
	}
	return subtab;
}

LaTabView.prototype.swithTab = 
function (value) {
	this._containedObject[LaModel.currentTab] = value;
	this._localXForm.refresh()
}

LaTabView.prototype.switchSubTab =
function(value) {
	this._currentSubTab[this._containedObject[LaModel.currentTab]] = value;
}

LaTabView.prototype.isDirty = 
function () {
	return this._isDirty;
}

LaTabView.onFormFieldChanged = 
function (value, event, form) {
	form.parent.setDirty(true);
	this.setInstanceValue(value);
	return value;
}
