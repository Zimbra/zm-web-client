/**
* @constructor
* @class LaServerListView
* @param parent
* @author Greg Solovyev
**/

function LaServerListView(parent) {

//	var className = "LaServerListView";
	var className = null;
	var posStyle = DwtControl.ABSOLUTE_STYLE;
	
	var headerList = this._getHeaderList();
	
	LaListView.call(this, parent, className, posStyle, headerList);

	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	
	this.setScrollStyle(DwtControl.SCROLL);
	//this.addControlListener(new LsListener(this, LaServerListView.prototype._controlListener));
}

LaServerListView.prototype = new LaListView;
LaServerListView.prototype.constructor = LaServerListView;

LaServerListView.prototype.toString = 
function() {
	return "LaServerListView";
}

/**
* Renders a single item as a DIV element.
*/
LaServerListView.prototype._createItemHtml =
function(server, now, isDndIcon) {
	var html = new Array(50);
	var	div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(server, div, DwtListView.TYPE_LIST_ITEM);
	
	var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='2' cellpadding='0'>";
	html[idx++] = "<tr>";
	var cnt = this._headerList.length;
	for(var i = 0; i < cnt; i++) {
		var id = this._headerList[i]._id;
		if(id.indexOf(LaServer.A_ServiceHostname)==0) {	
			// name
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(server.attrs[LaServer.A_ServiceHostname]);
			html[idx++] = "</td>";
		} else if(id.indexOf(LaServer.A_description)==0) {	
			// description
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(server.attrs[LaServer.A_description]);
			html[idx++] = "</td>";
		}
	}
	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

LaServerListView.prototype._getHeaderList =
function() {

	var headerList = new Array();
//idPrefix, label, iconInfo, width, sortable, sortField, resizeable, visible

	headerList[0] = new LaListHeaderItem(LaServer.A_ServiceHostname, LaMsg.SLV_ServiceHName_col, null, 200, true, LaServer.A_ServiceHostname, true, true);

	headerList[1] = new LaListHeaderItem(LaServer.A_description, LaMsg.DLV_Description_col, null, null, false, LaServer.A_description, true, true);
		
	return headerList;
}


