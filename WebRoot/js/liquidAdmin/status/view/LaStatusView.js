/**
* @class LaStatusView displays status page
* @contructor LaStatusView
* @param parent
* @param app
* @author Roland Schemers
* @author Greg Solovyev
**/
function LaStatusView(parent, app) {
	this._app = app;
	DwtTabView.call(this, parent, "LaStatusView");
	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
//	this._summaryPage = new LaStatusSummaryPage(this, app);
	this._servicesPage = new LaStatusServicesPage(this, app);
//	this.addTab("Summary", this._summaryPage);		
	this.addTab("Services", this._servicesPage);		
	
	this.setScrollStyle(DwtControl.AUTO);
}

LaStatusView.prototype = new DwtTabView;
LaStatusView.prototype.constructor = LaStatusView;

LaStatusView.prototype.toString = 
function() {
	return "LaStatusView";
}

