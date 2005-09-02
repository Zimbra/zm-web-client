/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmCalBaseView(parent, className, posStyle, view) {
	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, className, posStyle, view);
	

	// BEGIN LIST-RELATED
	this._setMouseEventHdlrs();
	this._setKeyEventHdlrs();
	this.setCursor("default");
	
	this._listenerMouseOver = new AjxListener(this, ZmCalBaseView.prototype._mouseOverListener);
	this._listenerMouseOut = new AjxListener(this, ZmCalBaseView.prototype._mouseOutListener);
	this._listenerMouseDown = new AjxListener(this, ZmCalBaseView.prototype._mouseDownListener);
	this._listenerMouseUp = new AjxListener(this, ZmCalBaseView.prototype._mouseUpListener);
	this._listenerMouseMove = new AjxListener(this, ZmCalBaseView.prototype._mouseMoveListener);
	this._listenerDoubleClick = new AjxListener(this, ZmCalBaseView.prototype._doubleClickListener);
	this.addListener(DwtEvent.ONMOUSEOVER, this._listenerMouseOver);
	this.addListener(DwtEvent.ONMOUSEOUT, this._listenerMouseOut);
	this.addListener(DwtEvent.ONMOUSEDOWN, this._listenerMouseDown);
	this.addListener(DwtEvent.ONMOUSEUP, this._listenerMouseUp);
	this.addListener(DwtEvent.ONMOUSEMOVE, this._listenerMouseMove);
	this.addListener(DwtEvent.ONDBLCLICK, this._listenerDoubleClick);
	
	
	this.view = view;	
	this._evtMgr = new AjxEventMgr();	 
	this._selectedItems = new AjxVector();
	this._selEv = new DwtSelectionEvent(true);
	this._actionEv = new DwtListViewActionEvent(true);	
	
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	// END LIST-RELATED
		
	this._timeRangeStart = 0;
	this._timeRangeEnd = 0;
	this.addControlListener(new AjxListener(this, this._controlListener));	
	this._createHtml();
	this._firstSet = true;
	this._needsRefresh = true;
}

ZmCalBaseView.prototype = new DwtComposite;
ZmCalBaseView.prototype.constructor = ZmCalBaseView;

ZmCalBaseView.TIME_SELECTION = "ZmCalTimeSelection";

ZmCalBaseView.TYPE_APPTS_DAYGRID = 1; // grid holding days, for example
ZmCalBaseView.TYPE_APPT = 2; // an appt
ZmCalBaseView.TYPE_SELECTED_TIME = 3; // div representing selected time in a grid
ZmCalBaseView.TYPE_APPT_BOTTOM_SASH = 4; // a sash for appt duration
ZmCalBaseView.TYPE_APPT_TOP_SASH = 5; // a sash for appt duration

// BEGIIN LIST-RELATED

ZmCalBaseView.prototype.addSelectionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.SELECTION, listener);
}

ZmCalBaseView.prototype.removeSelectionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.SELECTION, listener);    	
}

ZmCalBaseView.prototype.addActionListener = 
function(listener) {
	this._evtMgr.addListener(DwtEvent.ACTION, listener);
}

ZmCalBaseView.prototype.removeActionListener = 
function(listener) {
	this._evtMgr.removeListener(DwtEvent.ACTION, listener);    	
}

ZmCalBaseView.prototype.getList = 
function() {
	return this._list;
}

ZmCalBaseView.prototype.associateItemWithElement =
function (item, element, type, optionalId) {
	element.id = optionalId ? optionalId : this._getItemId(item);
	element._itemIndex = AjxCore.assignId(item);
	element._type = type;
}

ZmCalBaseView.prototype._getViewPrefix = 
function() { 
	return "V" + this.view + "_";
}

ZmCalBaseView.prototype.deselectAll =
function() {
	var a = this._selectedItems.getArray();
	var sz = this._selectedItems.size();
	for (var i = 0; i < sz; i++)
		a[i].className = a[i]._styleClass;
	this._selectedItems.removeAll();
	//this._selAnchor = null;
}

ZmCalBaseView.prototype._mouseOverAction = 
function(mouseEv, div) {
	if (div._type == ZmCalBaseView.TYPE_APPT) {
		if (div._hoverStyleClass == null || div == this._rightSelItems) {
			div.hoverSet = false;
		} else {
			var selItems = this._selectedItems.getArray();
			div.hoverSet = true;
			for (var i = 0; i < selItems.length; i++) {
				if (div == selItems[i]) {
					div.hoverSet = false;
					break;
				}
			}
		}
		if (div.hoverSet)
			div.className += " " + div._hoverStyleClass;
	}

	var item = this.getItemFromElement(div);
	if (item instanceof ZmAppt) {
		this.setToolTipContent(item.getToolTip());
	} else {
		this.setToolTipContent(null);
	}
	return true;
}

ZmCalBaseView.prototype._mouseOutAction = 
function(mouseEv, div) {
	if (div._type == ZmCalBaseView.TYPE_APPT) {
		if (div._hoverStyleClass && div.hoverSet)
			div.className = div._styleClass;
	}
	return true;
}

ZmCalBaseView.prototype._mouseDownAction = 
function(mouseEv, div) {
	return true;
}

ZmCalBaseView.prototype._mouseOverListener = 
function(ev) {
	var div = ev.target;
	div = this._findAncestor(div, "_itemIndex");
	if (!div)
		return;
	
	this._mouseOverAction(ev, div);
}

ZmCalBaseView.prototype._mouseOutListener = 
function(ev) {
	var div = ev.target;
	div = this._findAncestor(div, "_itemIndex");
	if (!div)
		return;
	// NOTE: The DwtListView handles the mouse events on the list items
	//		 that have associated tooltip text. Therefore, we must
	//		 explicitly null out the tooltip content whenever we handle
	//		 a mouse out event. This will prevent the tooltip from
	//		 being displayed when we re-enter the listview even though
	//		 we're not over a list item.
	this._toolTipContent = null;
	this._mouseOutAction(ev, div);
}

ZmCalBaseView.prototype._mouseMoveListener = 
function(ev) {
	if (this._clickDiv == null)
		return;
}

ZmCalBaseView.prototype._mouseUpAction = 
function(ev, div) {
	if (div._type != ZmCalBaseView.TYPE_APPT) return true;
	var id = div.id; //(ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : div.id;
	if (!id) return true;

	if (ev.button == DwtMouseEvent.LEFT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
		}
	} else if (ev.button == DwtMouseEvent.RIGHT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.ACTION)) {
			this._evtMgr.notifyListeners(DwtEvent.ACTION, this._actionEv);
		}
	}
	return true;
}

ZmCalBaseView.prototype._findAncestor =
function(elem, attr) {
	while (elem && (elem[attr] == void 0)){
		elem = elem.parentNode;
	}
	return elem;
}

ZmCalBaseView.prototype._mouseDownListener = 
function(ev) {
	var div = ev.target;

	div = this._findAncestor(div, "_type");

	if (div == null){
		this._dndSelection = null;
	} else {
		this._clickDiv = div;

		if (div._type != ZmCalBaseView.TYPE_APPT)
			this._dndSelection = null;
		else
			this._dndSelection = (this._selectedItems.contains(div)) ? this._selectedItems :  div._itemIndex;
		return this._mouseDownAction(ev, div);	
	}

}

ZmCalBaseView.prototype._mouseUpListener = 
function(ev) {
	var div = ev.target;
	div = this._findAncestor(div, "_type");

	delete this._clickDiv;
	
	if (!div) return true;
	
	switch (div._type) {
		case ZmCalBaseView.TYPE_APPT:
			// set item selection, then hand off to derived class for handling
			if (ev.button == DwtMouseEvent.LEFT || ev.button == DwtMouseEvent.RIGHT)
				this._itemClicked(div, ev);
			break;	
	}
	return this._mouseUpAction(ev, div);
}

ZmCalBaseView.prototype._doubleClickAction = 
function(mouseEv, div) {return true;}

ZmCalBaseView.prototype._doubleClickListener =
function(ev) {
	var div = ev.target;
	div = this._findAncestor(div, "_type");
	
	if (!div) return;	
		
	if (div._type == ZmCalBaseView.TYPE_APPT) {
		if (this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			DwtUiEvent.copy(this._selEv, ev);
			this._selEv.item = this.getItemFromElement(div);
			this._selEv.detail = DwtListView.ITEM_DBL_CLICKED;
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
		}
	}
	return this._doubleClickAction(ev, div);
}

ZmCalBaseView.prototype._itemClicked =
function(clickedEl, ev) {
	var i;
	var a = this._selectedItems.getArray();
	var numSelectedItems = this._selectedItems.size();

	// always clear out old right click selection
	if (this._rightSelItems) {
		this._rightSelItems.className = this._rightSelItems._styleClass;
		this._rightSelItems = null;
	}

	if ((!ev.shiftKey && !ev.ctrlKey) || !this.isMultiSelectEnabled()) {
		// always reset detail if left/right click
		if (ev.button == DwtMouseEvent.LEFT || ev.button == DwtMouseEvent.RIGHT)
			this._selEv.detail = DwtListView.ITEM_SELECTED;
		
		// is this element currently in the selected items list?
		var bContained = this._selectedItems.contains(clickedEl);
		
		if (ev.button == DwtMouseEvent.LEFT) {
		
			// clear out old left click selection(s)
			for (i = 0; i < numSelectedItems; i++)
				a[i].className = a[i]._styleClass;
			this._selectedItems.removeAll();
			
			// save new left click selection
			this._selectedItems.add(clickedEl);
			this._selAnchor = clickedEl;
			clickedEl.className = clickedEl._selectedStyleClass;
			this._firstSelIndex = this._list 
				? this._list.indexOf(AjxCore.objectWithId(clickedEl._itemIndex)) : -1;
		} else if (ev.button == DwtMouseEvent.RIGHT && !bContained) {
			// save right click selection
			this._rightSelItems = clickedEl;
			clickedEl.className = clickedEl._selectedStyleClass + "-right";
		}
		clickedEl.hoverSet = false;
	} else {
		if (ev.ctrlKey) {
			if (this._selectedItems.contains(clickedEl)) {
				this._selectedItems.remove(clickedEl);
				clickedEl.className = clickedEl._styleClass;
				this._selEv.detail = DwtListView.ITEM_DESELECTED;
				this._firstSelIndex = this._selectedItems.size() > 0 
					? this._selectedItems.get(0)._itemIndex : -1;
			} else {
				this._selectedItems.add(clickedEl);
				clickedEl.className = clickedEl._selectedStyleClass;
				clickedEl.hoverSet = false;
				this._selEv.detail = DwtListView.ITEM_SELECTED;
			}
			// The element that was part of the ctrl action always becomes
			// the anchor since it gets focus
			this._selAnchor = clickedEl;
		} else { // SHIFT KEY
			// Adds to the selection to/from the current node to the selection anchor
			if (this._selAnchor == null)
				return;				
			var convEls = this._getChildren() || clickedEl.parentNode.childNodes;
			var numConvEls = convEls.length;
			var convEl;
			var state = 0;
			for (var i = 0; i < numConvEls; i++) {
				convEl = convEls[i];
				if (convEl == this._rightSelItems)
					this._rightSelItems = null;
				
				if (convEl == clickedEl) {
					/* Increment the state. 
					 * 0 - means we havent started
					 * 1 - means we are in selection range
					 * 2 - means we are out of selection range */
					state++;
				}
				if (convEl == this._selAnchor) {
					state++;
					if (convEl.className != convEl._selectedStyleClass) {
						convEl.className = convEl._selectedStyleClass;
						this._selectedItems.add(convEl);
					}
					continue;
				}
				
				// If state == 0 or 2 (i.e. we are out of the selection range, 
				// we have to deselect the node. Else we select it
				if (state != 1 && convEl.className == convEl._selectedStyleClass && convEl != clickedEl) {
					convEl.className = convEl._styleClass;
					this._selectedItems.remove(convEl);
				} else if (state == 1 || convEl == clickedEl) {
					if (convEl.className != convEl._selectedStyleClass) {
						convEl.className = convEl._selectedStyleClass;
						convEl.hoverSet = false;
						this._selectedItems.add(convEl);
					}
				}
			}
			var newSelectedItems = this._selectedItems.size();
			if (numSelectedItems < newSelectedItems)
				this._selEv.detail = DwtListView.ITEM_SELECTED;
			else if (numSelectedItems > newSelectedItems)
				this._selEv.detail = DwtListView.ITEM_DESELECTED;
			else
				return;
		}
	}

	// let derived class call notifyListeners(), since it may want to add to event
	if (ev.button == DwtMouseEvent.LEFT) {
		DwtUiEvent.copy(this._selEv, ev);
		this._selEv.item = AjxCore.objectWithId(clickedEl._itemIndex);
		if (this.constructor == ZmCalBaseView)
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, this._selEv);
	} else if (ev.button == DwtMouseEvent.RIGHT) {
		DwtUiEvent.copy(this._actionEv, ev);
		this._actionEv.item = AjxCore.objectWithId(clickedEl._itemIndex);
		if (this.constructor == ZmCalBaseView)
			this._evtMgr.notifyListeners(DwtEvent.ACTION, this._actionEv);
	}
}

ZmCalBaseView.prototype.getItemFromElement =
function (element){
	if (element._itemIndex !== void 0){
		switch (element._type){
			case ZmCalBaseView.TYPE_APPT:
			  return AjxCore.objectWithId(element._itemIndex);
			default:
			  return null;
		}
	} else {
		return null;
	}
}

ZmCalBaseView.prototype.setSelection =
function(item, skipNotify) {
	var el = this._getElFromItem(item);
	if (el) {
		var i;
		var a = this._selectedItems.getArray();
		var sz = this._selectedItems.size();
		for (i = 0; i < sz; i++)
			a[i].className = a[i]._styleClass;
		this._selectedItems.removeAll();
		this._selectedItems.add(el);
		this._selAnchor = el;
		el.className = this.getEnabled() ? el._selectedStyleClass : el._selectedDisabledStyleClass;
		if (!skipNotify && this._evtMgr.isListenerRegistered(DwtEvent.SELECTION)) {
			var selEv = new DwtSelectionEvent(true);
			selEv.button = DwtMouseEvent.LEFT;
			selEv.target = el;
			selEv.item = AjxCore.objectWithId(el._itemIndex);
			selEv.detail = DwtListView.ITEM_SELECTED;
			this._evtMgr.notifyListeners(DwtEvent.SELECTION, selEv);
		}	
	}
}

ZmCalBaseView.prototype.getSelectionCount =
function() {
	return this._rightSelItems ? 1 : this._selectedItems.size();
}

ZmCalBaseView.prototype.getSelection =
function() {
	var a = new Array();
	if (this._rightSelItems) {
		a.push(AjxCore.objectWithId(this._rightSelItems._itemIndex));
	} else {
		var sa = this._selectedItems.getArray();
		var saLen = this._selectedItems.size();
		for (var i = 0; i < saLen; i++)
			a[i] = AjxCore.objectWithId(sa[i]._itemIndex);
	}
	return a;
}

ZmCalBaseView.prototype.getSelectedItems =
function() {
	return this._selectedItems;
}

ZmCalBaseView.prototype.handleActionPopdown = 
function(ev) {
	// clear out old right click selection
	if (this._rightSelItems) {
		this._rightSelItems.className = this._rightSelItems._styleClass;
		this._rightSelItems = null;
	}
}

// END LIST-RELATED

ZmCalBaseView.prototype.getTitle = 
function() {
	return [ZmMsg.zimbraTitle, this.getCalTitle()].join(": ");
}

ZmCalBaseView.prototype.needsRefresh = 
function() {
	return this._needsRefresh;
}

ZmCalBaseView.prototype.setNeedsRefresh = 
function(refresh) {
	 this._needsRefresh = refresh;
}

ZmCalBaseView.prototype.isFirstSet = 
function() {
	return this._firstSet;
}

ZmCalBaseView.prototype.setFirstSet = 
function(set) {
	this._firstSet = set;
}

ZmCalBaseView.prototype._getItemId =
function(item) {
	return item ? (this._getViewPrefix()+item.getUniqueId()) : null;
}

ZmCalBaseView.prototype.addTimeSelectionListener = 
function(listener) {
	this.addListener(ZmCalBaseView.TIME_SELECTION, listener);
}

ZmCalBaseView.prototype.removeTimeSelectionListener = 
function(listener) { 
	this.removeListener(ZmCalBaseView.TIME_SELECTION, listener);
}

ZmCalBaseView.prototype.addDateRangeListener = 
function(listener) {
	this.addListener(DwtEvent.DATE_RANGE, listener);
}

ZmCalBaseView.prototype.removeDateRangeListener = 
function(listener) { 
	this.removeListener(DwtEvent.DATE_RANGE, listener);
}

// override. 
ZmCalBaseView.prototype.getRollField =
function(isDouble)
{
	return 0;
}

ZmCalBaseView.prototype.getDate =
function() {
	return this._date;
}

ZmCalBaseView.prototype.getTimeRange =
function() {
	return { start: this._timeRangeStart, end: this._timeRangeEnd };
}

ZmCalBaseView.prototype.isInView =
function(appt) {
	return appt.isInRange(this._timeRangeStart, this._timeRangeEnd);
}

ZmCalBaseView.prototype.isStartInView =
function(appt) {
	return appt.isStartInRange(this._timeRangeStart, this._timeRangeEnd);
}

ZmCalBaseView.prototype.isEndInView =
function(appt) {
	return appt.isEndInRange(this._timeRangeStart, this._timeRangeEnd);
}

ZmCalBaseView.prototype._dayKey =
function(date) {
	var key = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate();
	return key;
}

ZmCalBaseView.prototype.setDate =
function(date, duration, roll)
{
	this._date = new Date(date.getTime());
	var d = new Date(date.getTime());
	d.setHours(0, 0, 0, 0);
	var t = d.getTime();
	if (roll || t < this._timeRangeStart || t >= this._timeRangeEnd) {
		this._resetList();
		this._updateRange();		
		this._dateUpdate(true);
		this._updateTitle();
		
		// Notify any listeners
		if (this.isListenerRegistered(DwtEvent.DATE_RANGE)) {
			if (!this._dateRangeEvent)
				this._dateRangeEvent = new DwtDateRangeEvent(true);
			this._dateRangeEvent.item = this;
			this._dateRangeEvent.start = new Date(this._timeRangeStart);
			this._dateRangeEvent.end = new Date(this._timeRangeEnd);
			this.notifyListeners(DwtEvent.DATE_RANGE, this._dateRangeEvent);
		}
	} else {
		this._dateUpdate(false);
	}
}

/*
* override: responsible for updating any view-specific data when the date changes during a setDate call.
*/
ZmCalBaseView.prototype._dateUpdate =
function(rangeChanged) 
{

}

/*
* override: called when an appointment is clicked to see if the view should de-select a selected time range. For example,
* in day view if you have selected the 8:00 AM row and then click on an appt, the 8:00 AM row should be de-selected. If
* you are in month view though and have a day selected, thne day should still be selected if the appt you clicked on is in 
* the same day.
*/
ZmCalBaseView.prototype._apptSelected =
function() {

}

// override
ZmCalBaseView.prototype._updateRange =
function() { }

// override 
ZmCalBaseView.prototype._updateTitle =
function() { }


ZmCalBaseView.prototype.addAppt = 
function(ao, now) {
	var item = this._createItemHtml(ao, now);
	var div = this._getDivForAppt(ao);
	if (div) div.appendChild(item);
}

ZmCalBaseView.prototype.set = 
function(list) {
	this._preSet();
//	ZmListView.prototype.set.call(this, list);
	this._selectedItems.removeAll();
	this._resetList();
	this._list = list;	
	var list = this.getList();
	if (list) {
		var size = list.size();
		if (size != 0) {
			var now = new Date();
			for (var i=0; i < size; i++) {
				var ao = list.get(i);
				this.addAppt(ao, now);
			}
		}
	}
	this._postSet(list);
}

// override
ZmCalBaseView.prototype._fanoutAllDay =
function(appt) {
	return true;
}

// override
ZmCalBaseView.prototype._postSet =
function(appt) {}

// override
ZmCalBaseView.prototype._preSet =
function(appt) {}

// override
ZmCalBaseView.prototype._getDivForAppt =
function(appt) {}

ZmCalBaseView.prototype._addApptIcons =
function(appt, html, idx) {

	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";

	if (appt.hasOtherAttendees())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_MEETING) + "</td>";

	if (appt.isException())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_EXCEPTION) + "</td>";
	else if (appt.isRecurring())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_RECUR) + "</td>";

	if (appt.hasAlarm())
		html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_REMINDER) + "</td>";
	
	html[idx++] = "</tr></table>";

	return idx;
}

ZmCalBaseView.prototype._getElFromItem = 
function(item) {
			return Dwt.getDomObj(this.getDocument(), this._getItemId(item));
}

ZmCalBaseView.prototype._resetList =
function() {
	var doc = this.getDocument();
	var list = this.getList();
	if (list == null) return;

	var size = list.size();
	if (size == 0) return;

	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		var appt = Dwt.getDomObj(doc, this._getItemId(ao));
		if (appt) {
			appt.parentNode.removeChild(appt);
			AjxCore.unassignId(appt._itemIndex);
		}
	}
	list.removeAll();
	this.removeAll();	
}

ZmCalBaseView.prototype.removeAll =
function() {
	this._selectedItems.removeAll();
	this._selAnchor = null;
}

ZmCalBaseView.prototype.getCalTitle = 
function() {
	return this._title;
}

// override
ZmCalBaseView.prototype._createItemHtml =
function(appt, now, isDndIcon) {}

// override
ZmCalBaseView.prototype._createHtml =
function() {}

ZmCalBaseView.prototype._controlListener =
function(ev) {
	if ((ev.oldWidth != ev.newWidth) ||
		(ev.oldHeight != ev.newHeight)) {
		this._layout();
	}
}

/**
* override
*/
ZmCalBaseView.prototype._layout =
function() {}
