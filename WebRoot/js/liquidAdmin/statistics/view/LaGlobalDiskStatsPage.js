/**
* @class LaGlobalDiskStatsPage
* @contructor LaGlobalDiskStatsPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaGlobalDiskStatsPage (parent, app) {
	this._app = app;
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this.cellId = Dwt.getNextId();
	this._rendered = false;
	this._createHTML();
	this.internalView = new LaGlobalDiskStatsTabPage(this, this._app);	
}

LaGlobalDiskStatsPage.prototype = new DwtTabViewPage;
LaGlobalDiskStatsPage.prototype.constructor = LaGlobalDiskStatsPage;

LaGlobalDiskStatsPage.prototype.toString = 
function() {
	return "LaGlobalDiskStatsPage";
}

LaGlobalDiskStatsPage.prototype.showMe = 
function() {
	if(!this._rendered) {
		var elem = Dwt.getDomObj(this.getDocument(), this.cellId);
		elem.appendChild(this.internalView.getHtmlElement());
		this._rendered = true;
	}	
	DwtTabViewPage.prototype.showMe.call(this);
	this.internalView.getHtmlElement().style.height=this.getHtmlElement().style.height;
	this.internalView.getHtmlElement().style.width=this.getHtmlElement().style.width;	
	this.internalView.switchToTab(this.internalView.firstTabKey); 				
}


LaGlobalDiskStatsPage.prototype._createHTML = 
function () {
 	var idx = 0;
	var html = new Array(5);
//	html[idx++] = "<div style='width:85ex;'>";	
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' align='left' style='width:85ex;table-layout:fixed;'>";	
	html[idx++] = "<tr valign='top'><td align='left'><div style='width:85ex;' id='" + this.cellId + "'>&nbsp;<br>&nbsp;</div>";
	html[idx++] = "</td></tr></table>";	
	html[idx++] = "</div>";
	this.getHtmlElement().innerHTML = html.join("");
}
/**
* @class LaGlobalDiskStatsPage 
* @contructor LaGlobalDiskStatsPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaGlobalDiskStatsTabPage(parent, app) {
	this._app = app;
	DwtTabView.call(this, parent);
	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	this._1DPage = new LaGlobalDiskStatsPageD(this, app);
	this._3MPage = new LaGlobalDiskStatsPage3M(this, app);
	this._12MPage = new LaGlobalDiskStatsPage12M(this, app);	
	this.firstTabKey = this.addTab(LaMsg.TABT_StatsDataLastDay, this._1DPage);		
	this.addTab(LaMsg.TABT_StatsDataLast3Months, this._3MPage);			
	this.addTab(LaMsg.TABT_StatsDataLast12Months, this._12MPage);				
//	this.setScrollStyle(DwtControl.SCROLL);
}

LaGlobalDiskStatsTabPage.prototype = new DwtTabView;
LaGlobalDiskStatsTabPage.prototype.constructor = LaGlobalDiskStatsTabPage;

LaGlobalDiskStatsTabPage.prototype.toString = 
function() {
	return "LaGlobalDiskStatsTabPage";
}

LaGlobalDiskStatsTabPage.prototype._createHTML = 
function() {
	DwtTabView.prototype._createHTML.call(this);
}