/**
* @class LaServerDiskStatsPage
* @contructor LaServerDiskStatsPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerDiskStatsPage (parent, app) {
	this._app = app;
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this.cellId = Dwt.getNextId();
	this._rendered = false;
	this.internalView = null;
	this._createHTML();
}

LaServerDiskStatsPage.prototype = new DwtTabViewPage;
LaServerDiskStatsPage.prototype.constructor = LaServerDiskStatsPage;

LaServerDiskStatsPage.prototype.toString = 
function() {
	return "LaServerDiskStatsPage";
}

LaServerDiskStatsPage.prototype.showMe = 
function() {
	if(this.internalView !=null) {
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
}

LaServerDiskStatsPage.prototype.setObject = 
function (entry) {
	if(this.internalView==null)
		this.internalView = new LaServerDiskStatsTabPage(this, this._app);	
		
	this.internalView.setObject(entry);
}

LaServerDiskStatsPage.prototype._createHTML = 
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
* @class LaServerDiskStatsPage 
* @contructor LaServerDiskStatsPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerDiskStatsTabPage(parent, app) {
	this._app = app;
	DwtTabView.call(this, parent);
	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	this._1DPage = new LaServerDiskStatsPageD(this, app);
	this._3MPage = new LaServerDiskStatsPage3M(this, app);
	this._12MPage = new LaServerDiskStatsPage12M(this, app);	
	this.firstTabKey = this.addTab(LaMsg.TABT_StatsDataLastDay, this._1DPage);		
	this.addTab(LaMsg.TABT_StatsDataLast3Months, this._3MPage);			
	this.addTab(LaMsg.TABT_StatsDataLast12Months, this._12MPage);				
//	this.setScrollStyle(DwtControl.SCROLL);
}

LaServerDiskStatsTabPage.prototype = new DwtTabView;
LaServerDiskStatsTabPage.prototype.constructor = LaServerDiskStatsTabPage;

LaServerDiskStatsTabPage.prototype.toString = 
function() {
	return "LaServerDiskStatsTabPage";
}

LaServerDiskStatsTabPage.prototype.setObject = 
function (entry) {
	this._1DPage.setObject(entry);
	this._3MPage.setObject(entry);
	this._12MPage.setObject(entry);
}

LaServerDiskStatsTabPage.prototype._createHTML = 
function() {
	DwtTabView.prototype._createHTML.call(this);
}