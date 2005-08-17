/**
* @class LaStatusServicesPage 
* @contructor LaStatusServicesPage
* @param parent
* @param app
* @author Greg Solovyev
**/
function LaStatusServicesPage (parent, app) {
	DwtTabViewPage.call(this, parent, "LaStatusServicesPage", DwtControl.ABSOLUTE_STYLE);
	this._fieldIds = new Object(); //stores the ids of all the form elements
	this._app = app;
	this.initialized=false;
	this._rendered = false;
	this.setScrollStyle(DwtControl.SCROLL);	
}
 
LaStatusServicesPage.prototype = new DwtTabViewPage;
LaStatusServicesPage.prototype.constructor = LaStatusServicesPage;

LaStatusServicesPage.prototype.toString = 
function() {
	return "LaStatusServicesPage";
}

LaStatusServicesPage.prototype.showMe = 
function() {
	if(!this._rendered) {
		this._createHtml();		
	}
	var mystatusVector = this._app.getStatusList(true).getVector();
	this._statusListView.set(mystatusVector);
	DwtTabViewPage.prototype.showMe.call(this);
	this.getHtmlElement().style.width = '520px';
	DBG.println(LsDebug.DBG3, "this._statusListView.getHtmlElement().offsetWidth: " + this._statusListView.getHtmlElement().offsetWidth);		
	DBG.println(LsDebug.DBG3, "this._statusListView.getHtmlElement().clientWidth: " + this._statusListView.getHtmlElement().clientWidth);				
	DBG.println(LsDebug.DBG3, "this.parent.getHtmlElement().offsetWidth: " + this.parent.getHtmlElement().offsetWidth);				
	
	DBG.println(LsDebug.DBG3, "this.getHtmlElement().offsetWidth: " + this.getHtmlElement().offsetWidth);		
	DBG.println(LsDebug.DBG3, "this.getHtmlElement().clientWidth: " + this.getHtmlElement().clientWidth);				
	DBG.println(LsDebug.DBG3, "this.getHtmlElement().style.width: " + this.getHtmlElement().style.width);				
	
}

LaStatusServicesPage.prototype._createHtml = 
function() {
	var idx = 0;
	var html = new Array(50);
	this._listContainerDivId = Dwt.getNextId();	
	html[idx++] = "<div style='width:520; height:520;'>";
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0' align='left' width='100%'>";	
	html[idx++] = "<tr valign='top'><td align='left' style='width:520;'>&nbsp</td></tr>";	
	html[idx++] = "<tr valign='top'><td align='left' style='width:520;'>";	
	html[idx++] = "<div id='" + this._listContainerDivId + "' style='width:520; height:520;'></div></td>";
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</div>";
	this.getHtmlElement().innerHTML = html.join("");

	this._createUI();
	this._rendered=true;
}

LaStatusServicesPage.prototype._createUI = 
function () {
	var htmlElement = this.getHtmlElement();
	var _contentDiv = Dwt.getDomObj(this.getDocument(), this._listContainerDivId);

	this._statusListView = new LaStatusServicesPage_LaListView(this);
//	alert(this._statusListView.getHtmlElement().style.width);
	//DBG.println(LsDebug.DBG3, "width 1: " + this._statusListView.getHtmlElement().style.width + "width2: " + this._statusListView.getHtmlElement().width);
	this._statusListView.getHtmlElement().width='520';
	_contentDiv.appendChild(this._statusListView.getHtmlElement());
}

function LaStatusServicesPage_LaListView(parent) {
	if (arguments.length == 0) return;
	var posStyle = DwtControl.ABSOLUTE_STYLE;
	var headerList = this._getHeaderList();
	LaListView.call(this, parent, null, posStyle, headerList);
}


LaStatusServicesPage_LaListView.prototype = new LaListView;
LaStatusServicesPage_LaListView.prototype.constructor = LaStatusServicesPage_LaListView;

LaStatusServicesPage_LaListView.prototype.toString = 
function() {
	return "LaStatusServicesPage_LaListView";
}

LaStatusServicesPage_LaListView.prototype._getViewPrefix = 
function() {
	return "Status_Service";
}

LaStatusServicesPage_LaListView.prototype._createItemHtml = 
function(item) {
	var html = new Array(50);
	var	div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);

	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=2 border=0 width=100%>";
	
	html[idx++] = "<tr>";
	var cnt = this._headerList.length;
	for(var i = 0; i < cnt; i++) {
		var id = this._headerList[i]._id;
		if(id.indexOf(LaStatus.PRFX_Server)==0) {		
			html[idx++] = "<td width=" + this._headerList[i]._width + " aligh=left>";
			html[idx++] = LsStringUtil.htmlEncode(item.serverName);
			html[idx++] = "</td>";
		} else if(id.indexOf(LaStatus.PRFX_Service)==0) {		
			html[idx++] = "<td width=" + this._headerList[i]._width + " aligh=left>";
			html[idx++] = LsStringUtil.htmlEncode(item.serviceName);
			html[idx++] = "</td>";
		} else if(id.indexOf(LaStatus.PRFX_Time)==0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + " aligh=left>";
			html[idx++] = LsStringUtil.htmlEncode(item.time);
			html[idx++] = "</td>";
		} else if(id.indexOf(LaStatus.PRFX_Status)==0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + " aligh=left>";
			if(item.status==1) {
				html[idx++] = "On";
			} else {
				html[idx++] = "Off";
			}
			html[idx++] = "</td>";
		}
	}
	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

LaStatusServicesPage_LaListView.prototype._setNoResultsHtml = 
function() {
	var	div = this.getDocument().createElement("div");
	div.innerHTML = "<table width='100%' cellspacing='0' cellpadding='1'><tr><td class='NoResults'><br>Status data is not available.</td></tr></table>";
	this._parentEl.appendChild(div);
}

LaStatusServicesPage_LaListView.prototype._getHeaderList =
function() {

	var headerList = new Array();

	headerList[0] = new LaListHeaderItem(LaStatus.PRFX_Server, LaMsg.STV_Server_col, null, 100, false, null, true, true);

	headerList[1] = new LaListHeaderItem(LaStatus.PRFX_Service, LaMsg.STV_Service_col, null, 150, false, null, true, true);
	
	headerList[2] = new LaListHeaderItem(LaStatus.PRFX_Time, LaMsg.STV_Time_col, null, 150, false, null, true, true);
	
	headerList[3] = new LaListHeaderItem(LaStatus.PRFX_Status, LaMsg.STV_Status_col, null, null, false, null, true, true);
	
	return headerList;
}
