/**
* @constructor
* @class LaCosListView
* @param parent
* @author Roland Schemers
* @author Greg Solovyev
**/

function LaCosListView(parent) {
	var className = null;
	var posStyle = DwtControl.ABSOLUTE_STYLE;
	
	var headerList = this._getHeaderList();
	
	LaListView.call(this, parent, className, posStyle, headerList);

	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
}

LaCosListView.prototype = new LaListView;
LaCosListView.prototype.constructor = LaCosListView;

LaCosListView.prototype.toString = 
function() {
	return "LaCosListView";
}

/**
* Renders a single item as a DIV element.
*/
LaCosListView.prototype._createItemHtml =
function(cos, no, isDndIcon) {
	var html = new Array(50);
	var	div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(cos, div, DwtListView.TYPE_LIST_ITEM);
	
	var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='2' cellpadding='0'>";
	html[idx++] = "<tr>";


	var cnt = this._headerList.length;
	for(var i = 0; i < cnt; i++) {
		var id = this._headerList[i]._id;
		if(id.indexOf(LaCos.A_name)==0) {
		// name
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(cos.name);
			html[idx++] = "</td>";
			html[idx++] = "<td width=2></td>";	
		} else if (id.indexOf(LaCos.A_description)==0) {
			// description
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(cos.attrs[LaCos.A_description]);
			html[idx++] = "</td>";	
			html[idx++] = "<td width=2></td>";	
		}
	}
	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

LaCosListView.prototype._getHeaderList =
function() {

	var headerList = new Array();
	//idPrefix, label, iconInfo, width, sortable, sortField, resizeable, visible
	headerList[0] = new LaListHeaderItem(LaCos.A_name, LaMsg.CLV_Name_col, null, null, true, LaCos.A_name, true, true);
	//headerList[0].initialize(LaMsg.CLV_Name_col, null, "245", true, LaCos.A_name);

	headerList[1] = new LaListHeaderItem(LaCos.A_description, LaMsg.CLV_Description_col, null, null, false, null, true, true);
	//headerList[1].initialize(LaMsg.CLV_Description_col, null, null, false, LaCos.A_description);
	
	return headerList;
}
