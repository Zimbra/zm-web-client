/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Subclass of ZmAutocompleteListView so we can customize the "listview"
 *
 * @param params
 */
ZmPeopleAutocompleteListView = function(params) {
	ZmAutocompleteListView.call(this, params);

	this.addClassName("ZmPeopleAutocompleteListView");
	this.setScrollStyle(DwtControl.CLIP);
};

ZmPeopleAutocompleteListView.prototype = new ZmAutocompleteListView;
ZmPeopleAutocompleteListView.prototype.constructor = ZmPeopleAutocompleteListView;


// Consts

ZmPeopleAutocompleteListView.ACTION_MESSAGE		= "message";
ZmPeopleAutocompleteListView.ACTION_IM			= "IM";
ZmPeopleAutocompleteListView.ACTION_CALL		= "call";
ZmPeopleAutocompleteListView.ACTION_APPT		= "appt";
ZmPeopleAutocompleteListView.NO_RESULTS			= "no-results";


// Public methods

ZmPeopleAutocompleteListView.prototype.toString =
function() {
	return "ZmPeopleAutocompleteListView";
};


// protected methods

// Creates the list and its member elements based on the matches we have. Each match becomes a
// row. The first match is automatically selected.
ZmPeopleAutocompleteListView.prototype._set =
function(list) {
	var table = this._getTable();
	this._matches = list;

	for (var i = 0; i < list.length; i++) {
		var match = list[i];
		if (match && (match.text || match.icon)) {
			var rowId = match.id = this._getId("Row", i);
			this._matchHash[rowId] = match;
		}

		var rowId = this._getId("Row", i);
		var contact = match.item;
		var data = {
			id: this._htmlElId,
			rowId: rowId,
			fullName: contact.getFullName(),
			title: contact.getAttr(ZmContact.F_jobTitle),
			email: contact.getEmail(),
            phone: contact.getAttr(ZmContact.F_workPhone),
            photoFileName: contact.getAttr("photoFileName")
		};

        // zimlet support
        appCtxt.notifyZimlets("onPeopleSearchData", [data]);
        

		var rowHtml = AjxTemplate.expand("share.Widgets#ZmPeopleAutocompleteListView", data);

        var row = Dwt.parseHtmlFragment(rowHtml, true);
        var tbody = document.createElement("tbody");
        tbody.appendChild(row);
		var rowEl = table.appendChild(tbody);

        if (data.email){
            var emailTxt = new DwtText({parent:this, parentElement:rowId + "-email", index:0, id:"NewMsg", className:"FakeAnchor"});
            emailTxt.isLinkText = true;
            emailTxt.setText(data.email);
            emailTxt.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._peopleItemListener));
            emailTxt.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this.peopleItemMouseOverListener));
            emailTxt.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this.peopleItemMouseOutListener));
        }

        if (data.fullName){
            var nameTxt = new DwtText({parent:this, parentElement:rowId + "-fullName", index:0, id:"NewContact", className:"ZmPeopleSearch-fullname"});
            nameTxt.isLinkText = true;
            nameTxt.setText(data.fullName);
            nameTxt.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._peopleItemListener));
            nameTxt.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this.peopleItemMouseOverListener));
            nameTxt.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this.peopleNameMouseOutListener));
        }
		Dwt.associateElementWithObject(row, contact, "contact");
        // ask zimlets if they want to make data into links
		appCtxt.notifyZimlets("onPeopleSearchShow", [this, contact, rowId]);

        if (i==0)
            this._setSelected(rowId);

	}

	//leave this out as part of bug 50692
	/*
	     //fetch free/busy info for all results;
	    if (list.length > 0) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._getFreeBusyInfo, [list]), 100);
	} */
};

/*
    Called by zimlet to clear existing text when DwtText item is created.
 */
ZmPeopleAutocompleteListView.prototype._clearText =
function(id) {
    if (document.getElementById(id)!=null)
        document.getElementById(id).innerHTML="";
};

ZmPeopleAutocompleteListView.prototype._showNoResults =
function() {
	var table = this._getTable();
	var data = { id: this._htmlElId, rowId: ZmPeopleAutocompleteListView.NO_RESULTS };
	var rowHtml = AjxTemplate.expand("share.Widgets#ZmPeopleAutocompleteListView-NoResults", data);
    var tbody =   document.createElement("tbody");
    tbody.appendChild(Dwt.parseHtmlFragment(rowHtml, true));
	table.appendChild(tbody);

	this.show(true);
};

ZmPeopleAutocompleteListView.prototype._setSelected =
function(id) {
    if (id && id instanceof String) {
        id = id.split("-")[0]; 
    }

    if (id == ZmPeopleAutocompleteListView.NO_RESULTS || id == this.getHtmlElement().id) { return; }

	if (id == ZmAutocompleteListView.NEXT || id == ZmAutocompleteListView.PREV) {
		var table = document.getElementById(this._tableId);
		var rows = table && table.rows;
		id = this._getRowId(rows, id, rows.length);
		if (!id) { return; }
	}

	var rowEl = document.getElementById(id);
	if (rowEl) {
		this._activeContact = Dwt.getObjectFromElement(rowEl, "contact");
	}

	ZmAutocompleteListView.prototype._setSelected.apply(this, arguments);
};

ZmPeopleAutocompleteListView.prototype._getFreeBusyInfo =
function(list) {
	var emailList = [];
	var emailHash = {};
	for (var i = 0; i < list.length; i++) {
		var match = list[i];
		emailList.push(match.email);
		emailHash[match.email] = match.id;
	}

	var now = new Date();
	var jsonObj = {GetFreeBusyRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.GetFreeBusyRequest;
	request.s = now.getTime();
	request.e = now.getTime() + (5*60*1000); // next 5 mins
	request.name = emailList.join(",");

	return appCtxt.getAppController().sendRequest({
		jsonObj: jsonObj,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleFreeBusyResponse, [emailHash])),
		noBusyOverlay: true
	});
};

ZmPeopleAutocompleteListView.prototype._handleFreeBusyResponse =
function(emailHash, result) {
	if (!this.getVisible()) { return; }

	var fb = result.getResponse().GetFreeBusyResponse.usr;
	for (var i = 0; i < fb.length; i++) {
		var id = fb[i].id;
		var el = id && (document.getElementById(emailHash[id] + "-freebusy"));
        var td = document.createElement("td");
        td.innerHTML="- ";
        td.className="ZmPeopleSearch-busy";
        el.parentNode.insertBefore(td, el);
        var text = new DwtText({parent:this, parentElement:el, index:1, id:"NewAppt", className:"FakeAnchor"});
        text.isLinkText = true;
        text.addListener(DwtEvent.ONMOUSEDOWN, new AjxListener(this, this._peopleItemListener));
        text.addListener(DwtEvent.ONMOUSEOVER, new AjxListener(this, this.peopleItemMouseOverListener));
        text.addListener(DwtEvent.ONMOUSEOUT, new AjxListener(this, this.peopleItemMouseOutListener));

		if (el && fb[i].b) {
            text.setText("Busy");
		}else if(el) {
            text.setText("Available");
        }
	}
};

ZmPeopleAutocompleteListView.prototype._removeAll =
function() {
	var table = this._getTable();
	for (var i = table.rows.length - 1; i >= 0; i--) {
		var row = table.rows[i];
		var contact = Dwt.getObjectFromElement(row, "contact");
		if (contact) {
			Dwt.disassociateElementFromObject(row, contact, "contact");
		}
	}

	this._activeContact = null;

	ZmAutocompleteListView.prototype._removeAll.apply(this, arguments);
};


ZmPeopleAutocompleteListView.prototype._listSelectionListener =
function(ev) {
};

ZmPeopleAutocompleteListView.prototype._peopleItemListener =
 function(ev){
    var target = DwtUiEvent.getTargetWithProp(ev, "id");
    var action = "";
    if (target && target.id)
        action = target.id.split("_")[0]; //ids are inserted by DwtText, clean up as necessary
     
    switch (action){
        case "NewMsg":
            var params = {action:ZmOperation.NEW_MESSAGE, toOverride: new AjxEmailAddress(this._activeContact.getEmail(),
            AjxEmailAddress.TO, this._activeContact.getFullName())};
	        AjxDispatcher.run("Compose", params);
            break;

        case "NewAppt":
            AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
			var cc = AjxDispatcher.run("GetCalController");
			var appt = cc.newApptObject((new Date()));
			appt.setAttendees([this._activeContact.getEmail()], ZmCalBaseItem.PERSON);
			cc.newAppointment(appt);
			break;

        case "NewContact":
            AjxDispatcher.require(["ContactsCore", "Contacts"]);
            var cc = AjxDispatcher.run("GetContactListController");
            var list = new ZmContactList((new ZmSearch()), true);
            list.add(this._activeContact);
	        cc.show(list, true);
            break;
    }

    this.show(false); 

 };

 ZmPeopleAutocompleteListView.prototype.peopleItemMouseOverListener =
 function(ev){
	 var target = DwtUiEvent.getTargetWithProp(ev, "id");
     target.className="ZmPeopleSearchText-hover";
 };

 ZmPeopleAutocompleteListView.prototype.peopleItemMouseOutListener =
 function(ev){
	 var target = DwtUiEvent.getTargetWithProp(ev, "id");
     target.className="FakeAnchor";
 };

 ZmPeopleAutocompleteListView.prototype.peopleNameMouseOutListener =
 function(ev){
	 var target = DwtUiEvent.getTargetWithProp(ev, "id");
     target.className="ZmPeopleSearch-fullname";
 };


ZmPeopleAutocompleteListView._outsideMouseDownListener =
function(ev) {
	var curList = ZmAutocompleteListView._activeAcList;
	if (curList) {
		var obj = DwtControl.getTargetControl(ev);
		if (obj && obj.parent && obj.parent == curList._toolbar) {
			return;
		}
	}

	ZmAutocompleteListView._outsideMouseDownListener(ev);
    ZmPeopleAutocompleteListView.prototype._listSelectionListener(ev);


};

ZmPeopleAutocompleteListView.prototype._addMouseDownListener =
function() {
	DwtEventManager.addListener(DwtEvent.ONMOUSEDOWN, ZmPeopleAutocompleteListView._outsideMouseDownListener);
	this.shell._setEventHdlrs([DwtEvent.ONMOUSEDOWN]);
	this.shell.addListener(DwtEvent.ONMOUSEDOWN, this._outsideListener);
};

ZmPeopleAutocompleteListView.prototype._removeMouseDownListener =
function() {
	DwtEventManager.removeListener(DwtEvent.ONMOUSEDOWN, ZmPeopleAutocompleteListView._outsideMouseDownListener);
	this.shell._setEventHdlrs([DwtEvent.ONMOUSEDOWN], true);
	this.shell.removeListener(DwtEvent.ONMOUSEDOWN, this._outsideListener);
};

/*
    Display message to user that more results are available than fit in the current display
    @param {int}    availHeight available height of display
 */
ZmPeopleAutocompleteListView.prototype._showMoreResultsText =
function (availHeight) {
      var rowNum = this._getNumberofAllowedRows(availHeight);
      var textPos = rowNum > 1 ? rowNum-1 : 0;
      var rowEl = this._getTable().rows[textPos];
      var rowCell = Dwt.parseHtmlFragment(AjxTemplate.expand("share.Widgets#ZmPeopleAutocompleteListView-MoreResults"), true);
      rowEl.parentNode.insertBefore(rowCell, rowEl);
      //remove rows below text so they are not displayed
      this._removeRows(rowNum);
};

/* remove rows from bottom to index number */
ZmPeopleAutocompleteListView.prototype._removeRows =
function(idx) {
	this._matches = null;
	var table = this._getTable();
	for (var i = table.rows.length - 1; i >= 0 && i >= idx; i--) {
		var row = table.rows[i];
		if (row != this._waitingRow) {
			table.deleteRow(i);
		}
	}
};

/*
    Get the number of rows within the available height
    @param {int}    availHeight available height for display
    @return {int}   return the number of rows
 */
ZmPeopleAutocompleteListView.prototype._getNumberofAllowedRows =
function(availHeight) {
   var rowCount = 0;
   var totalHeight = 0;
   for(var i = 0; i< this._getTable().rows.length; i++){
       var row = this._getTable().rows[i];
       totalHeight += Dwt.getSize(row).y;
       if (totalHeight < availHeight){
           rowCount++;
       } else {
           break;
       }
   }

    return rowCount;

};