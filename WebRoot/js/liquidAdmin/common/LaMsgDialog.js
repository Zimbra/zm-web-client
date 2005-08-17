/**
* Creates a new message dialog.
* @constructor
* @class
* This class represents a reusable message dialog box. Messages can be informational, warning, or
* critical.
*/
function LaMsgDialog(parent, className, buttons, app) {
	this._app = app;
 	DwtMessageDialog.call(this, parent, className, buttons);
}

LaMsgDialog.prototype = new DwtMessageDialog;
LaMsgDialog.prototype.constructor = LaMsgDialog;

LaMsgDialog.prototype.setApp = 
function(app) {
	this._app=app;
}

