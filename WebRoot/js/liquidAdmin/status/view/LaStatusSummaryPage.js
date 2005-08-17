/**
* @class LaStatusSummaryPage 
* @contructor LaStatusSummaryPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaStatusSummaryPage (parent, app) {
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this._app = app;
	this._createHTML();
	this.initialized=false;
}
 
LaStatusSummaryPage.prototype = new DwtTabViewPage;
LaStatusSummaryPage.prototype.constructor = LaStatusSummaryPage;

LaStatusSummaryPage.prototype.toString = 
function() {
	return "LaStatusSummaryPage";
}

LaStatusSummaryPage.prototype._createHTML = 
function () {
	var idx = 0;
	var html = new Array(50);
	html[idx++] = "<div class='LaStatusSummaryPage'>";	
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' align='left'>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='/service/statsimg/10.10.130.113/rcvddata/m/12'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</div>";
	this.getHtmlElement().innerHTML = html.join("");
}