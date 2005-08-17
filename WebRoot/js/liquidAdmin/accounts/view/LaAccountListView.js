/**
* @constructor
* @class LaAccountListView
* @param parent
* @author Roland Schemers
* @author Greg Solovyev
**/
function LaAccountListView(parent, app) {
	this._app = app;
	var className = null;
	var posStyle = DwtControl.ABSOLUTE_STYLE;
	
	var headerList = this._getHeaderList();
	
	LaListView.call(this, parent, className, posStyle, headerList);

	this._appCtxt = this.shell.getData(LaAppCtxt.LABEL);
	
	this.setScrollStyle(DwtControl.SCROLL);
}

LaAccountListView.prototype = new LaListView;
LaAccountListView.prototype.constructor = LaAccountListView;


LaAccountListView.prototype.toString = 
function() {
	return "LaAccountListView";
}

/**
* Renders a single item as a DIV element.
*/
LaAccountListView.prototype._createItemHtml =
function(account, now, isDndIcon) {
	var html = new Array(50);
	var	div = this.getDocument().createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + "-" + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
	this.associateItemWithElement(account, div, DwtListView.TYPE_LIST_ITEM);
	
	var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='2' cellpadding='0'>";

	html[idx++] = "<tr>";
	
	var cnt = this._headerList.length;
	for(var i = 0; i < cnt; i++) {
		var id = this._headerList[i]._id;
		if(id.indexOf(LaAccount.A_name)==0) {
			// name
			html[idx++] = "<td width=" + this._headerList[i]._width + ">";
			html[idx++] = LsStringUtil.htmlEncode(account.name);
			html[idx++] = "</td>";
		} else if (id.indexOf(LaAccount.A_displayname)==0) {
			// display name
			html[idx++] = "<td width=" + this._headerList[i]._width + "><nobr>";
			html[idx++] = LsStringUtil.htmlEncode(account.attrs[LaAccount.A_displayname]);
			html[idx++] = "</nobr></td>";	
		} else if(id.indexOf(LaAccount.A_accountStatus)==0) {
			// status
			html[idx++] = "<td width=" + this._headerList[i]._width + "><nobr>";
			html[idx++] = LsStringUtil.htmlEncode(LaMsg.accountStatus(account.attrs[LaAccount.A_accountStatus]));
			html[idx++] = "</nobr></td>";		
		} else if (id.indexOf(LaAccount.A_description)==0) {		
			// description
			html[idx++] = "<td width=" + this._headerList[i]._width + "><nobr>";
			html[idx++] = LsStringUtil.htmlEncode(account.attrs[LaAccount.A_description]);
			html[idx++] = "</nobr></td>";	
		}
	}
		html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}

LaAccountListView.prototype._getHeaderList =
function() {

	var headerList = new Array();

	headerList[0] = new LaListHeaderItem(LaAccount.A_name, LaMsg.ALV_Name_col, null, 195, true, LaAccount.A_uid, true, true);
//idPrefix, label, iconInfo, width, sortable, sortField, resizeable, visible
	headerList[1] = new LaListHeaderItem(LaAccount.A_displayname, LaMsg.ALV_DspName_col, null, 145, true,LaAccount.A_displayname, true, true);

	headerList[2] = new LaListHeaderItem(LaAccount.A_accountStatus, LaMsg.ALV_Status_col, null, 80, true,LaAccount.A_accountStatus, true, true);

	headerList[3] = new LaListHeaderItem(LaAccount.A_description, LaMsg.ALV_Description_col, null, null, false, null,true, true );
	
	return headerList;
}


LaAccountListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {
	try {
		var searchResult=LaAccount.searchByQueryHolder(this._app.getAccountListController().getQuery(),this._app.getAccountListController().getPageNum(), columnItem.getSortField(), bSortAsc, this._app)
		this._app.getAccountListController().setSortOrder(bSortAsc);
		this._app.getAccountListController().show(searchResult);
	} catch (ex) {
		this._app.getCurrentController()._handleException(ex);
	}
}
