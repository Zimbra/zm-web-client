/**
* @constructor
* @class LaDomainListView
* @param parent
* @author Roland Schemers
* @author Greg Solovyev
**/

function LaDomainListView(parent) {

//	var className = "LaDomainListView";
	var className = null;
	var posStyle = DwtControl.ABSOLUTE_STYLE;
	
	var headerList = this._getHeaderList();
	
	LaListView.call(this, parent, className, posStyle, headerList);

	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	
	//this.setScrollStyle(DwtControl.SCROLL);
	//this.addControlListener(new LsListener(this, LaDomainListView.prototype._controlListener));
}

LaDomainListView.prototype = new LaListView;
LaDomainListView.prototype.constructor = LaDomainListView;

LaDomainListView.prototype.toString = 
function() {
	return "LaDomainListView";
}

/**
* Renders a single item as a DIV element.
*/
LaDomainListView.prototype._createItemHtml =
function(domain, now, isDndIcon) {
	var html = new Array(50);
	var	div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(domain, div, DwtListView.TYPE_LIST_ITEM);
	
	var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='2' cellpadding='0'>";
	html[idx++] = "<tr>";
	var cnt = this._headerList.length;
	for(var i = 0; i < cnt; i++) {
		var id = this._headerList[i]._id;
		if(id.indexOf(LaDomain.A_domainName)==0) {
			// name
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(domain.attrs[LaDomain.A_domainName]);
			html[idx++] = "</td>";
		} else if(id.indexOf(LaDomain.A_description)==0) {
			// description		
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(domain.attrs[LaDomain.A_description]);
			html[idx++] = "</td>";
		}
	}
	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

LaDomainListView.prototype._getHeaderList =
function() {

	var headerList = new Array();
	//idPrefix, label, iconInfo, width, sortable, sortField, resizeable, visible
	headerList[0] = new LaListHeaderItem(LaDomain.A_domainName , LaMsg.CLV_Name_col, null, 250, true, LaDomain.A_domainName, true, true);
	//headerList[0].initialize(LaMsg.CLV_Name_col, null, "245", true, LaDomain.A_domainName);

	headerList[1] = new LaListHeaderItem(LaDomain.A_description, LaMsg.CLV_Description_col, null, null, false, null, true, true);
	//headerList[1].initialize(LaMsg.CLV_Description_col, null, "245", false, LaDomain.A_description);
	
	return headerList;
}


