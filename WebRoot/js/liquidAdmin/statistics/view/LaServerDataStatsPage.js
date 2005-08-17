/**
* @class LaServerDataStatsPage 
* @contructor LaServerDataStatsPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerDataStatsPage (parent, app) {
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this._app = app;
	this._createHTML();
	this.initialized=false;
	this.setScrollStyle(DwtControl.SCROLL);	
}
 
LaServerDataStatsPage.prototype = new DwtTabViewPage;
LaServerDataStatsPage.prototype.constructor = LaServerDataStatsPage;

LaServerDataStatsPage.prototype.toString = 
function() {
	return "LaServerDataStatsPage";
}

LaServerDataStatsPage.prototype.setObject =
function (item) {
	if(item) {
		if(item.attrs && item.attrs[LaServer.A_ServiceHostname]) {
			var newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/rcvddata/d/1";
			var imgElement = Dwt.getDomObj(this.getDocument(), this._1DayImgID);
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._3MonthImgID);	
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/rcvddata/m/3";			
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._12MonthImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/rcvddata/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
		}
	}
}

LaServerDataStatsPage.prototype._createHTML = 
function () {
	var idx = 0;
	var html = new Array(50);
	this._12MonthImgID = Dwt.getNextId();
	this._3MonthImgID = Dwt.getNextId();
	this._1DayImgID = Dwt.getNextId();	
	html[idx++] = "<table cellpadding='5' cellspacing='4' border='0' align='left'>";	
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsDataLastDay) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._1DayImgID + "'>";	
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsDataLast3Months) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._3MonthImgID + "'>";		
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";		
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsDataLast12Months) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._12MonthImgID + "'>";			
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	this.getHtmlElement().innerHTML = html.join("");
}