/**
* @class LaGlobalStatsView 
* @contructor LaGlobalStatsView
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaGlobalStatsView(parent, app) {
	this._app = app;
	DwtTabView.call(this, parent);
	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	this._dataPage = new LaGlobalDataStatsPage(this, app);
	this._msgsPage = new LaGlobalMsgsStatsPage(this, app);
	this._diskPage = new LaGlobalDiskStatsPage(this, app);	
	this.addTab(LaMsg.TABT_InData, this._dataPage);		
	this.addTab(LaMsg.TABT_InMsgs, this._msgsPage);			
	this.addTab(LaMsg.TABT_Disk, this._diskPage);				
//	this.setScrollStyle(DwtControl.SCROLL);
}

LaGlobalStatsView.prototype = new DwtTabView;
LaGlobalStatsView.prototype.constructor = LaGlobalStatsView;

LaGlobalStatsView.prototype.toString = 
function() {
	return "LaGlobalStatsView";
}

LaGlobalStatsView.prototype._resetTabSizes = 
function (width, height) {
    var tabBarSize = this._tabBar.getSize();
	var titleCellSize = Dwt.getSize(this.titleCell);

	var tabBarHeight = tabBarSize.y || this._tabBar.getHtmlElement().clientHeight;
	var titleCellHeight = titleCellSize.y || this.titleCell.clientHeight;
		
	var tabWidth = width;
	var newHeight = (height - tabBarHeight - titleCellHeight);
	var tabHeight = ( newHeight > 50 ) ? newHeight : 50;
	
	if(this._tabs && this._tabs.length) {
		for(var curTabKey in this._tabs) {
			if(this._tabs[curTabKey]["view"]) {
				this._tabs[curTabKey]["view"].resetSize(tabWidth, tabHeight);
			}	
		}
	}		
}

LaGlobalStatsView.prototype._createHTML = 
function() {
	DwtTabView.prototype._createHTML.call(this);
	var row1;
	//var col1;
	var row2;
	var col2;
	row1 = this._table.insertRow(0);
	row1.align = "center";
	row1.vAlign = "middle";
	
	this.titleCell = row1.insertCell(row1.cells.length);
	this.titleCell.align = "center";
	this.titleCell.vAlign = "middle";
	this.titleCell.noWrap = true;	

	this.titleCell.id = Dwt.getNextId();
	this.titleCell.align="left";
	this.titleCell.innerHTML = LsStringUtil.htmlEncode(LaMsg.NAD_GlobalStatistics);
	this.titleCell.className="AdminTitleBar";
}