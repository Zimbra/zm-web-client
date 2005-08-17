/**
* @class LaServerDiskStatsPage12M 
* @contructor LaServerDiskStatsPage12M
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerDiskStatsPage12M (parent, app) {
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this._app = app;
	this._createHTML();
	this.initialized=false;
	this.setScrollStyle(DwtControl.SCROLL);
}
 
LaServerDiskStatsPage12M.prototype = new DwtTabViewPage;
LaServerDiskStatsPage12M.prototype.constructor = LaServerDiskStatsPage12M;

LaServerDiskStatsPage12M.prototype.toString = 
function() {
	return "LaServerDiskStatsPage12M";
}

LaServerDiskStatsPage12M.prototype.showMe = 
function () {
	DwtTabViewPage.prototype.showMe.call(this);
}

LaServerDiskStatsPage12M.prototype.setObject =
function (item) {
	if(item) {
		if(item.attrs && item.attrs[LaServer.A_ServiceHostname]) {
			var newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/liquid/m/12";
			var imgElement = Dwt.getDomObj(this.getDocument(), this._LiquidImgID);
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._DBImgID);	
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/db/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._StoreImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/store/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
			imgElement = Dwt.getDomObj(this.getDocument(), this._IndexImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/index/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
			imgElement = Dwt.getDomObj(this.getDocument(), this._LogImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/log/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
			imgElement = Dwt.getDomObj(this.getDocument(), this._RedologImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/redolog/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
		}
	}
}

LaServerDiskStatsPage12M.prototype._createHTML = 
function () {
	this._LiquidImgID = Dwt.getNextId();	
	this._DBImgID = Dwt.getNextId();	
	this._StoreImgID = Dwt.getNextId();		
	this._IndexImgID = Dwt.getNextId();			
	this._LogImgID = Dwt.getNextId();					
	this._RedologImgID = Dwt.getNextId();						
	var idx = 0;
	var html = new Array(50);
	html[idx++] = "<div style='width:70ex;'>";		
	html[idx++] = "<table cellpadding='5' cellspacing='4' border='0' align='left'>";	
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsDataLastDay) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._LiquidImgID + "'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._DBImgID + "'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._StoreImgID + "'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._IndexImgID + "'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id = '" + this._LogImgID + "'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._RedologImgID + "'>";
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</div>";	
	this.getHtmlElement().innerHTML = html.join("");
}