/**
* @class LaListView
* @constructor LaListView
* @param parent
* @ className
* @ posStyle
* @ headerList
* Abstract class list views. All the List views in the Admin panel extend this class.
* @author Greg Solovyev
**/
function LaListView(parent, className, posStyle, headerList) {
	if (arguments.length == 0) return;
	DwtListView.call(this, parent, className, posStyle, headerList);

}

LaListView.prototype = new DwtListView;
LaListView.prototype.constructor = LaListView;

LaListView.prototype.toString = 
function() {
	return "LaListView";
}

LaListView.ITEM_FLAG_CLICKED = DwtListView._LAST_REASON + 1;

// abstract methods
LaListView.prototype._createItemHtml = function(item) {}

LaListView.prototype._mouseOverAction =
function(ev, div) {
	if (div._type == DwtListView.TYPE_HEADER_ITEM) {
		if(this._headerList[div._itemIndex]._sortable) {
			div.className = "DwtListView-Column DwtListView-ColumnHover";		
			this.setToolTipContent(LaMsg.LST_ClickToSort_tt + this._headerList[div._itemIndex].getLabel());	
		} else {
			this.setToolTipContent(null);
		}
	} else if (div._type == DwtListView.TYPE_HEADER_SASH) {
		div.style.cursor = LsEnv.isIE ? "col-resize" : "e-resize";
    } else if (div._type == DwtListView.TYPE_LIST_ITEM){
		var item = this.getItemFromElement(div);
		if (item && item.getToolTip)
			this.setToolTipContent(item.getToolTip());
	}
}

LaListView.prototype._mouseOutAction = 
function(mouseEv, div) {
	if (div._type == DwtListView.TYPE_HEADER_ITEM) {
		if(this._headerList[div._itemIndex]._sortable) {
			div.className = div.id != this._currentColId ? "DwtListView-Column" : "DwtListView-Column DwtListView-ColumnActive"
		}
	}else if (div._type == DwtListView.TYPE_HEADER_SASH) {
		div.style.cursor = "auto";
	}
	return true;
}

LaListView.prototype._mouseUpAction =
function(ev, div) {
	if (ev.button == DwtMouseEvent.LEFT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			this._selEv.field = ev.target.id.substring(0, 3);
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
		}
	} else if (ev.button == DwtMouseEvent.RIGHT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.ACTION)) {
			this._actionEv.field = ev.target.id.substring(0, 3);
			this._evtMgr.notifyListeners(DwtEvent.ACTION, this._actionEv);
		}
	}
	return true;
}

LaListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {
	if (bSortAsc) {
		this._list.sort(LaItem.compareNamesAsc);
	} else {
    	this._list.sort(LaItem.compareNamesDesc);
	}
	this.setUI();
}

LaListView.prototype._getFieldId =
function(item, field, prfx) {
	return item ? (this._getViewPrefix() + prfx + item.id) : "";
}

LaListView.prototype._columnClicked =
function(clickedCol, ev) {
	
	if (this.getList().size() > 0) {
		if (this.getList().size() > 1 && this._headerList[clickedCol._itemIndex]._sortable==true) {
			var item = this._headerList[clickedCol._itemIndex];		
			// reset order by sorting preference
			this._bSortAsc = (item._id == this._currentColId) ? !this._bSortAsc : this._getDefaultSortbyForCol(item);		
			this._setSortedColStyle(item._id);
			this._sortColumn(item, this._bSortAsc);
			this._currentColId = item._id;			
		}
	}
}

function LaListHeaderItem(idPrefix, label, iconInfo, width, sortable, sortField, resizeable, visible) {
	DwtListHeaderItem.call(this, idPrefix, label, iconInfo, width, sortable, resizeable, visible);
	this._sortField = sortField;	
	this._initialized = false;
}

LaListHeaderItem.prototype = new DwtListHeaderItem;
LaListHeaderItem.prototype.constructor = LaListHeaderItem;
/*
LaListHeaderItem.prototype.initialize = 
function(label, icon, width, sortable, sortField, resizeable) {

	this._id = Dwt.getNextId();
	this._label = label;
	this._icon = icon;
	this._width = width;
	this._sortable = sortable;
	this._sortField = sortField;
	this._resizeable = resizeable;
	this._initialized = true;
}*/

LaListHeaderItem.prototype.getSortField = 
function() {
	return this._sortField;
}

LaListHeaderItem.prototype.getLabel = 
function () {
	return this._label;
}
