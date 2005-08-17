/**
* @class LaServerMsgsStatsPage 
* @contructor LaServerMsgsStatsPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaServerMsgsStatsPage (parent, app) {
	DwtTabViewPage.call(this, parent);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this._app = app;
	this._createHTML();
	this.initialized=false;
	this.setScrollStyle(DwtControl.SCROLL);	
}
 
LaServerMsgsStatsPage.prototype = new DwtTabViewPage;
LaServerMsgsStatsPage.prototype.constructor = LaServerMsgsStatsPage;

LaServerMsgsStatsPage.prototype.toString = 
function() {
	return "LaServerMsgsStatsPage";
}

LaServerMsgsStatsPage.prototype.setObject =
function (item) {
	if(item) {
		if(item.attrs && item.attrs[LaServer.A_ServiceHostname]) {
			var newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/rcvdmsgs/d/1";
			var imgElement = Dwt.getDomObj(this.getDocument(), this._1DayImgID);
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._3MonthImgID);	
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/rcvdmsgs/m/3";			
			if(imgElement) {
				imgElement.src = newSrc;
			}
			imgElement = Dwt.getDomObj(this.getDocument(), this._12MonthImgID);		
			newSrc = "/service/statsimg/" + item.attrs[LaServer.A_ServiceHostname] + "/rcvdmsgs/m/12";			
			if(imgElement) {
				imgElement.src = newSrc;
			}			
		}
	}
}

LaServerMsgsStatsPage.prototype._createHTML = 
function () {
	var idx = 0;
	var html = new Array(50);
	this._12MonthImgID = Dwt.getNextId();
	this._3MonthImgID = Dwt.getNextId();
	this._1DayImgID = Dwt.getNextId();	
	html[idx++] = "<table cellpadding='5' cellspacing='4' border='0' align='left'>";	
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsMsgsLastDay) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._1DayImgID + "'>";	
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsMsgsLast3Months) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._3MonthImgID + "'>";	
	html[idx++] = "</td></tr>";
	html[idx++] = "<tr valign='top'><td align='left'>&nbsp;&nbsp;</td></tr>";		
	html[idx++] = "<tr valign='top'><td align='left' class='StatsImageTitle'>" + LsStringUtil.htmlEncode(LaMsg.NAD_StatsMsgsLast12Months) + "</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left'>";
	html[idx++] = "<img src='#' id='" + this._12MonthImgID + "'>";	
	html[idx++] = "</td></tr>";
	html[idx++] = "</table>";
	this.getHtmlElement().innerHTML = html.join("");
}