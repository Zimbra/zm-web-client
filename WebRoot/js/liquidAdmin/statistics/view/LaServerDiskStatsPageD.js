/**
* @class LaServerDiskStatsPageD 
* @contructor LaServerDiskStatsPageD
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerDiskStatsPageD (parent, app) {
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this._app = app;
	this._createHTML();
	this.initialized=false;
	this.setScrollStyle(DwtControl.SCROLL);
}
 
LaServerDiskStatsPageD.prototype = new DwtTabViewPage;
LaServerDiskStatsPageD.prototype.constructor = LaServerDiskStatsPageD;

LaServerDiskStatsPageD.prototype.toString = 
function() {
	return "LaServerDiskStatsPageD";
}

LaServerDiskStatsPageD.prototype.showMe = 
function () {
	DwtTabViewPage.prototype.showMe.call(this);
}

LaServerDiskStatsPageD.prototype.setObject =
function (item) {
	if(item) {
		if(item.attrs && item.attrs[LaServer.A_ServiceHostname]) {
			var newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/liquid/d/1";
			var imgElement = Dwt.getDomObj(this.getDocument(), this._LiquidImgID);
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._DBImgID);	
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/db/d/1";			
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._StoreImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/store/d/1";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
			imgElement = Dwt.getDomObj(this.getDocument(), this._IndexImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/index/d/1";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
			imgElement = Dwt.getDomObj(this.getDocument(), this._LogImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/log/d/1";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
			imgElement = Dwt.getDomObj(this.getDocument(), this._RedologImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/redolog/d/1";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
		}
	}
}

LaServerDiskStatsPageD.prototype._createHTML = 
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
	html[idx++] = "<img src='#' id='" + this._LogImgID + "'>";	
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._RedologImgID + "'>";	
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</div>";	
	this.getHtmlElement().innerHTML = html.join("");
}