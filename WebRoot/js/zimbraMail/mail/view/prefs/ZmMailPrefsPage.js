/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmMailPrefsPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);

	this._initialized = false;
    this._isCalDurationChanged = false;
};

ZmMailPrefsPage.prototype = new ZmPreferencesPage;
ZmMailPrefsPage.prototype.constructor = ZmMailPrefsPage;

ZmMailPrefsPage.prototype.isZmMailPrefsPage = true;
ZmMailPrefsPage.prototype.toString = function() { return "ZmMailPrefsPage"; };

//
// ZmPreferencesPage methods
//

ZmMailPrefsPage.prototype.showMe =
function() {
	ZmPreferencesPage.prototype.showMe.call(this);

	if (!this._initialized || appCtxt.isOffline) {
		this._initialized = true;
		if (this._blackListControl && this._whiteListControl) {
			var soapDoc = AjxSoapDoc.create("GetWhiteBlackListRequest", "urn:zimbraAccount");
			var callback = new AjxCallback(this, this._handleResponseLoadWhiteBlackList);
			appCtxt.getRequestMgr().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:callback});
		}
	}
};

ZmMailPrefsPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);

	var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	if (cbox) {
		this._handleEnableVacationMsg(cbox);
	}

	this._setPopDownloadSinceControls();

	if (this._blackListControl && this._whiteListControl) {
		this._blackListControl.reset();
		this._whiteListControl.reset();
	}
};

ZmMailPrefsPage.prototype.isDirty =
function() {
	var isDirty = ZmPreferencesPage.prototype.isDirty.call(this);
	return (!isDirty) ? this.isWhiteBlackListDirty() : isDirty;
};

ZmMailPrefsPage.prototype.isWhiteBlackListDirty =
function() {
	if (this._blackListControl && this._whiteListControl) {
		return this._blackListControl.isDirty() ||
			   this._whiteListControl.isDirty();
	}
	return false;
};

ZmMailPrefsPage.prototype.addCommand =
function(batchCmd) {
	if (this.isWhiteBlackListDirty()) {
		var soapDoc = AjxSoapDoc.create("ModifyWhiteBlackListRequest", "urn:zimbraAccount");
		this._blackListControl.setSoapContent(soapDoc, "blackList");
		this._whiteListControl.setSoapContent(soapDoc, "whiteList");

		var respCallback = new AjxCallback(this, this._handleResponseModifyWhiteBlackList);
		batchCmd.addNewRequestParams(soapDoc, respCallback);
	}
};

ZmMailPrefsPage.prototype._handleResponseModifyWhiteBlackList =
function(result) {
	this._blackListControl.saveLocal();
	this._whiteListControl.saveLocal();
};

ZmMailPrefsPage.prototype._setPopDownloadSinceControls =
function() {
	var popDownloadSinceValue = this.getFormObject(ZmSetting.POP_DOWNLOAD_SINCE_VALUE);
    var value = appCtxt.get(ZmSetting.POP_DOWNLOAD_SINCE);
	if (popDownloadSinceValue && value) {
		var date = AjxDateFormat.parse("yyyyMMddHHmmss'Z'", value);
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

		popDownloadSinceValue.setText(AjxMessageFormat.format(ZmMsg.externalAccessPopCurrentValue, date));
        popDownloadSinceValue.setVisible(true);
	}  else if( popDownloadSinceValue ) {
        popDownloadSinceValue.setVisible(false);
    }

	var popDownloadSince = this.getFormObject(ZmSetting.POP_DOWNLOAD_SINCE);
	if (popDownloadSince) {
		popDownloadSince.setSelectedValue(appCtxt.get(ZmSetting.POP_DOWNLOAD_SINCE));
	}
};

ZmMailPrefsPage.prototype._createControls =
function() {
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);

	this._sId = this._htmlElId + "_startMiniCal";
	this._eId = this._htmlElId + "_endMiniCal";


    this._startDateField = Dwt.byId(this._htmlElId + "_VACATION_FROM1");
	this._endDateField = Dwt.byId(this._htmlElId + "_VACATION_UNTIL1");

	if (this._startDateField && this._endDateField) {
		this._startDateVal = Dwt.byId(this._htmlElId + "_VACATION_FROM");
		this._endDateVal = Dwt.byId(this._htmlElId + "_VACATION_UNTIL");
        if(this._startDateVal.value.length < 15){
            this._startDateVal.value = appCtxt.get(ZmSetting.VACATION_FROM);
        }
        if(this._endDateVal.value.length < 15){
            this._endDateVal.value = appCtxt.get(ZmSetting.VACATION_UNTIL);            
        }
		this._formatter = new AjxDateFormat("yyyyMMddHHmmss'Z'");

        var now = AjxDateUtil.roundTimeMins(new Date(), 30);
	    var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	    this._startTimeSelect = new ZmTimeInput(this, ZmTimeInput.START);
	    this._startTimeSelect.reparentHtmlElement(this._htmlElId + "_VACATION_FROM_TIME");
	    this._startTimeSelect.addChangeListener(timeSelectListener);
        this._startTimeSelect.set((this._startDateVal.value != null && this._startDateVal.value != "")
			? (this._formatter.parse(this._startDateVal.value))
			: now);

	    this._endTimeSelect = new ZmTimeInput(this, ZmTimeInput.END);
	    this._endTimeSelect.reparentHtmlElement(this._htmlElId + "_VACATION_UNTIL_TIME");
	    this._endTimeSelect.addChangeListener(timeSelectListener);

        now.setTime(now.getTime() + ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
	    this._endTimeSelect.set((this._endDateVal.value != null && this._endDateVal.value != "")
			? (this._formatter.parse(this._endDateVal.value))
			: now);

        var stDateValue = (this._startDateVal.value != null && this._startDateVal.value != "")
			? (this._formatter.parse(this._startDateVal.value))
			: (new Date());
        var endDateValue = (this._endDateVal.value != null && this._endDateVal.value != "")
			? (this._formatter.parse(this._endDateVal.value))
			: (AjxDateUtil.getDateForNextDay(new Date(),AjxDateUtil.FRIDAY));

        stDateValue = this._startTimeSelect.getValue(stDateValue);
        endDateValue = this._endTimeSelect.getValue(endDateValue);

        this._startDateVal.value = this._formatter.format(stDateValue);
        this._endDateVal.value = this._formatter.format(endDateValue);

		this._startDateField.value = AjxDateUtil.simpleComputeDateStr(stDateValue);

		this._endDateField.value = AjxDateUtil.simpleComputeDateStr(endDateValue);

		var dateButtonListener = new AjxListener(this, this._dateButtonListener);
		var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);
		var dateFieldListener = AjxCallback.simpleClosure(this._dateFieldListener, this);

		this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._sId, dateButtonListener, dateCalSelectionListener);
		this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._eId, dateButtonListener, dateCalSelectionListener);

		Dwt.setHandler(this._startDateField, DwtEvent.ONBLUR, dateFieldListener);
		Dwt.setHandler(this._endDateField, DwtEvent.ONBLUR, dateFieldListener);

		this._durationCheckbox = this.getFormObject(ZmSetting.VACATION_DURATION_ENABLED);
        this._extMsgCheckbox = this.getFormObject(ZmSetting.VACATION_EXTERNAL_MSG_ENABLED);
	}



	var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);


	if (cbox) {
		this._handleEnableVacationMsg(cbox);
	}

	// enable downloadSince appropriately based on presence of downloadSinceEnabled
	var downloadSinceCbox = this.getFormObject(ZmSetting.POP_DOWNLOAD_SINCE_ENABLED);
	if (downloadSinceCbox) {
		var downloadSince = this.getFormObject(ZmSetting.POP_DOWNLOAD_SINCE);
		if (downloadSince) {
			var enabled = downloadSince.getValue() != "";
			downloadSinceCbox.setSelected(enabled);
			downloadSince.setEnabled(enabled);
		}
	}

	// Following code makes child nodes as siblings to separate the event-handling 
	// between labels and input

	var input = Dwt.byId(DwtId.makeId(ZmId.WIDGET_INPUT, ZmId.OP_MARK_READ));
	var inputParent =  input && input.parentNode;
	var newParent = inputParent && inputParent.parentNode;

	if (newParent){
		var txtNode = input.nextSibling;
		inputParent.removeChild(input);
		newParent.appendChild(input);

		var lbl = inputParent.cloneNode(false);
		lbl.innerHTML = txtNode.data;
		lbl.id = lbl.id + "_end";
		inputParent.removeChild(txtNode);
		newParent.appendChild(lbl);
	}

	// If pref's value is number of seconds, populate the input
	var value = appCtxt.get(ZmSetting.MARK_MSG_READ);
	if (value > 0) {
		input.value = value;
	}

	this._setPopDownloadSinceControls();
};

ZmMailPrefsPage.prototype._timeChangeListener =
function(ev) {
   var stDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
   var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
   stDate = this._startTimeSelect.getValue(stDate);
   endDate = this._endTimeSelect.getValue(endDate);
   this._startDateVal.value = this._formatter.format(stDate);
   this._endDateVal.value = this._formatter.format(endDate);
   this._isCalDurationChanged = true;
};

ZmMailPrefsPage.prototype._dateButtonListener =
function(ev) {
	var calDate = ev.item == this._startDateButton
		? this._fixAndGetValidDateFromField(this._startDateField)
		: this._fixAndGetValidDateFromField(this._endDateField);

	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(calDate, true);
	ev.item.popup();
};

ZmMailPrefsPage.prototype._fixAndGetValidDateFromField =
function(field) {
	var d = AjxDateUtil.simpleParseDateStr(field.value);
	if (!d || isNaN(d)) {
		d = new Date();
		field.value = AjxDateUtil.simpleComputeDateStr(d);
	}
	return d;
};

ZmMailPrefsPage.prototype._dateCalSelectionListener =
function(ev) {
	var parentButton = ev.item.parent.parent;

	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);

	if (parentButton == this._startDateButton) {
		this._startDateField.value = newDate;
	} else {
		if (ev.detail < new Date()) { return; }
		this._endDateField.value = newDate;
	}

	var sd = this._fixAndGetValidDateFromField(this._startDateField);
	var ed = this._fixAndGetValidDateFromField(this._endDateField);
    if(this._startTimeSelect && this._endTimeSelect){
        sd = this._startTimeSelect.getValue(sd);
        ed = this._endTimeSelect.getValue(ed);
    }

	
	this._fixDates(sd, ed, parentButton == this._endDateButton);

	if (this._durationCheckbox.isSelected()) {
		this._startDateVal.value = this._formatter.format(sd);
        this._endDateVal.value = this._formatter.format(ed);
	}

    this._isCalDurationChanged = true;
};

ZmMailPrefsPage.prototype._dateFieldListener =
function(ev) {
	var sd = this._fixAndGetValidDateFromField(this._startDateField);
	var ed = this._fixAndGetValidDateFromField(this._endDateField);
    if(this._startTimeSelect && this._endTimeSelect){
        sd = this._startTimeSelect.getValue(sd);
        ed = this._endTimeSelect.getValue(ed);
    }
	this._fixDates(sd, ed, DwtUiEvent.getTarget(ev) == this._endDateField);
    this._isCalDurationChanged = true;
};

/* Fixes the field values so that end date always is later than or equal to start date
 * @param startDate	{Date}	The value of the start date field or calendar selection
 * @param endDate	{Date}	The value of the end date field or calendar selection
 * @param modifyStart {boolean}	Whether to modify the start date or end date when dates overlap. true for start date, false for end date
*/

ZmMailPrefsPage.prototype._fixDates =
function(startDate, endDate, modifyStart) {
	if (startDate > endDate) {
		// Mismatch; start date is after end date
		if (modifyStart) {
			// Set them to be equal
			this._startDateField.value = AjxDateUtil.simpleComputeDateStr(endDate);
		} else {
			// Put endDate a bit into the future
			this._endDateField.value = AjxDateUtil.simpleComputeDateStr(AjxDateUtil.getDateForNextDay(startDate,AjxDateUtil.FRIDAY));
		}

        this._isCalDurationChanged = true;
	}
};

ZmMailPrefsPage.prototype._setupCheckbox =
function(id, setup, value) {
	var cbox = ZmPreferencesPage.prototype._setupCheckbox.apply(this, arguments);
	if (id == ZmSetting.VACATION_EXTERNAL_MSG_ENABLED ||
        id == ZmSetting.VACATION_CALENDAR_ENABLED ||
        id == ZmSetting.VACATION_DURATION_ENABLED )
	{
		cbox.addSelectionListener(new AjxListener(this, this._handleEnableVacationMsg, [cbox, id]));
	}
	return cbox;
};

ZmMailPrefsPage.prototype._setupRadioGroup =
function(id, setup, value) {
	var control = ZmPreferencesPage.prototype._setupRadioGroup.apply(this, arguments);
	if (id == ZmSetting.POP_DOWNLOAD_SINCE) {
		var radioGroup = this.getFormObject(id);
		var radioButton = radioGroup.getRadioButtonByValue(ZmMailApp.POP_DOWNLOAD_SINCE_NO_CHANGE);
		radioButton.setVisible(false);
	}
    else if (id == ZmSetting.VACATION_MSG_ENABLED) {
        var radioGroup = this.getFormObject(id);
        radioGroup.addSelectionListener(new AjxListener(this, this._handleEnableVacationMsg, [radioGroup, id]));
    }
	return control;
};

ZmMailPrefsPage.prototype._setupCustom =
function(id, setup, value) {
	var el = document.getElementById([this._htmlElId, id].join("_"));
	if (!el) { return; }

	if (id == ZmSetting.MAIL_BLACKLIST) {
		this._blackListControl = new ZmWhiteBlackList(this, id, "BlackList");
		this._replaceControlElement(el, this._blackListControl);
	}

	if (id == ZmSetting.MAIL_WHITELIST) {
		this._whiteListControl = new ZmWhiteBlackList(this, id, "WhiteList");
		this._replaceControlElement(el, this._whiteListControl);
	}
};

ZmMailPrefsPage.prototype._handleResponseLoadWhiteBlackList =
function(result) {
	var resp = result.getResponse().GetWhiteBlackListResponse;
	this._blackListControl.loadFromJson(resp.blackList[0].addr);
	this._whiteListControl.loadFromJson(resp.whiteList[0].addr);
};


//
// Protected methods
//

ZmMailPrefsPage.prototype._handleEnableVacationMsg =
function(cbox, id, evt) {
	var textarea = this.getFormObject(ZmSetting.VACATION_MSG);
    var extTextarea = this.getFormObject(ZmSetting.VACATION_EXTERNAL_MSG);
    var externalTypeSelect = this.getFormObject(ZmSetting.VACATION_EXTERNAL_TYPE);
	if (textarea) {
		if (id == ZmSetting.VACATION_DURATION_ENABLED) {
			this._setEnabledStartDate(cbox.isSelected());
            this._setEnabledEndDate(cbox.isSelected());
            this._startTimeSelect.setEnabled(cbox.isSelected());
            this._endTimeSelect.setEnabled(cbox.isSelected());
            var calCheckBox = this.getFormObject(ZmSetting.VACATION_CALENDAR_ENABLED);
            calCheckBox.setEnabled(cbox.isSelected());
            var calendarType = this.getFormObject(ZmSetting.VACATION_CALENDAR_TYPE);
            calendarType.setEnabled(calCheckBox.isSelected() && cbox.isSelected());
            this._isCalDurationChanged = calCheckBox.isSelected();
		}else if(id == ZmSetting.VACATION_EXTERNAL_MSG_ENABLED){
            externalTypeSelect.setEnabled(cbox.isSelected());
            extTextarea.setEnabled(cbox.isSelected());
        }else if(id == ZmSetting.VACATION_CALENDAR_ENABLED){
            var calendarType = this.getFormObject(ZmSetting.VACATION_CALENDAR_TYPE);
            calendarType.setEnabled(cbox.isSelected());
            this._isCalDurationChanged = cbox.isSelected();
        }else {

			var enabled = cbox.getSelectedValue()=="true";
			textarea.setEnabled(enabled);

			this._durationCheckbox.setEnabled(enabled);

            var calCheckBox = this.getFormObject(ZmSetting.VACATION_CALENDAR_ENABLED);
            calCheckBox.setEnabled((this._durationCheckbox.isSelected() || appCtxt.get(ZmSetting.VACATION_DURATION_ENABLED)) && enabled);
            calCheckBox.setSelected((appCtxt.get(ZmSetting.VACATION_CALENDAR_TYPE).length!=0));

            var calendarType = this.getFormObject(ZmSetting.VACATION_CALENDAR_TYPE);
            calendarType.setEnabled(calCheckBox.isSelected() && this._durationCheckbox.isSelected() && enabled);

            this._extMsgCheckbox.setEnabled(enabled);
            var externalEnabled = this._extMsgCheckbox.isSelected() && enabled;

            externalTypeSelect.setEnabled(externalEnabled);
            extTextarea.setEnabled(externalEnabled);

			var val = !this._startDateVal.value ? false : true;
			this._durationCheckbox.setSelected(val);

			this._setEnabledStartDate(enabled && this._durationCheckbox.isSelected());
			this._setEnabledEndDate(enabled && this._durationCheckbox.isSelected());
            this._startTimeSelect.setEnabled(enabled && this._durationCheckbox.isSelected());
            this._endTimeSelect.setEnabled(enabled && this._durationCheckbox.isSelected());
		}
	}
};

ZmMailPrefsPage.prototype._setEnabledStartDate =
function(val) {
	var condition = val && this._durationCheckbox.isSelected();
	this._startDateField.disabled = !condition;
	this._startDateButton.setEnabled(condition);
    var stDateVal = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
    if(this._startTimeSelect){stDateVal = this._startTimeSelect.getValue(stDateVal);}
	this._startDateVal.value = (!condition)
		? "" : (this._formatter.format(stDateVal));
};

ZmMailPrefsPage.prototype._setEnabledEndDate =
function(val) {
	//this._endDateCheckbox.setEnabled(val);
	var condition = val && this._durationCheckbox.isSelected();
	this._endDateField.disabled = !condition;
	this._endDateButton.setEnabled(condition);
    var endDateVal = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
    if(this._endTimeSelect){endDateVal = this._endTimeSelect.getValue(endDateVal);}
	this._endDateVal.value = (!condition)
		? "" : (this._formatter.format(endDateVal));
};

ZmMailPrefsPage.prototype.getPostSaveCallback =
function() {
	return new AjxCallback(this, this._postSave);
};

ZmMailPrefsPage.prototype._postSave =
function(changed) {
    var form = this.getFormObject(ZmSetting.POLLING_INTERVAL);
    if (form && form.getSelectedOption() && form.getSelectedOption().getDisplayValue() == ZmMsg.pollInstant && appCtxt.get(ZmSetting.INSTANT_NOTIFY)
            && !appCtxt.getAppController().getInstantNotify()){
        //turn on instant notify if not already on
        appCtxt.getAppController().setInstantNotify(true);
    } else {
        //turn instant notify off if it's on
        if (appCtxt.getAppController().getInstantNotify()) {
            appCtxt.getAppController().setInstantNotify(false);
		}
    }

    if (appCtxt.get(ZmSetting.VACATION_MSG_ENABLED)) {
        var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
        var node = soapDoc.set("pref", "TRUE");
        node.setAttribute("name", "zimbraPrefOutOfOfficeStatusAlertOnLogin");
        appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true});
    }

    if(this._isCalDurationChanged){
       var stDate = this._formatter.parse(ZmPref.dateGMT2Local(appCtxt.get(ZmSetting.VACATION_FROM)));
       var endDate = this._formatter.parse(ZmPref.dateGMT2Local(appCtxt.get(ZmSetting.VACATION_UNTIL)));
       var calController = appCtxt.getApp(ZmApp.CALENDAR).getCalController();
       calController.createAppointmentFromOOOPref(stDate,endDate,new AjxCallback(this, this._oooApptCallback));
       this._isCalDurationChanged = false;
    }
	
	if (changed && changed[ZmSetting.CONV_MODE]) {
		var cd = appCtxt.getYesNoMsgDialog();
		cd.reset();
		cd.registerCallback(DwtDialog.YES_BUTTON, this._convModeChangeYesCallback, this, [cd]);
		cd.setMessage(ZmMsg.convModeConfirmChange, DwtMessageDialog.WARNING_STYLE);
		cd.popup();
	}
};

ZmMailPrefsPage.prototype._oooApptCallback = function(){
    appCtxt.setStatusMsg(ZmMsg.oooStatus);
}

ZmMailPrefsPage.prototype._convModeChangeYesCallback =
function(dialog) {
	dialog.popdown();
	window.onbeforeunload = null;
	var url = AjxUtil.formatUrl();
	DBG.println(AjxDebug.DBG1, "Conv mode change, redirect to: " + url);
	ZmZimbraMail.sendRedirect(url); // redirect to self to force reload
};

// ??? SHOULD THIS BE IN A NEW FILE?       ???
// ??? IT IS ONLY USED BY ZmMailPrefsPage. ???
/**
 * Custom control used to handle adding/removing addresses for white/black list
 *
 * @param parent
 * @param id
 *
 * @private
 */
ZmWhiteBlackList = function(parent, id, templateId) {
	DwtComposite.call(this, {parent:parent});

	this._settingId = id;
	this._tabGroup = new DwtTabGroup(this._htmlElId);
    switch(id) {
        case ZmSetting.MAIL_BLACKLIST:
            this._max = appCtxt.get(ZmSetting.MAIL_BLACKLIST_MAX_NUM_ENTRIES);
            break;
        case ZmSetting.MAIL_WHITELIST:
            this._max = appCtxt.get(ZmSetting.MAIL_WHITELIST_MAX_NUM_ENTRIES);
            break;
        case ZmSetting.TRUSTED_ADDR_LIST:
            this._max = appCtxt.get(ZmSetting.TRUSTED_ADDR_LIST_MAX_NUM_ENTRIES);
            break;
    }
	this._setContent(templateId);

	this._list = [];
	this._add = {};
	this._remove = {};
};

ZmWhiteBlackList.prototype = new DwtComposite;
ZmWhiteBlackList.prototype.constructor = ZmWhiteBlackList;

ZmWhiteBlackList.prototype.toString =
function() {
	return "ZmWhiteBlackList";
};

ZmWhiteBlackList.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

ZmWhiteBlackList.prototype.getTabGroup = ZmWhiteBlackList.prototype.getTabGroupMember;

ZmWhiteBlackList.prototype.reset =
function() {
	this._inputEl.setValue("");
	this._listView.set(AjxVector.fromArray(this._list).clone(), null, true);
	this._add = {};
	this._remove = {};

	this.updateNumUsed();
};

ZmWhiteBlackList.prototype.getValue =
function() {
    return this._listView.getList().clone().getArray().join(',').replace(';', ',').split(',');
};


ZmWhiteBlackList.prototype.loadFromJson =
function(data) {
	if (data) {
		for (var i = 0; i < data.length; i++) {
            var content = AjxUtil.isSpecified(data[i]._content) ? data[i]._content : data[i];
            if(content){
			    var item = this._addEmail(content);
			    this._list.push(item);
            }
		}
	}
	this.updateNumUsed();
};

ZmWhiteBlackList.prototype.setSoapContent =
function(soapDoc, method) {
	if (!this.isDirty()) { return; }

	var methodEl = soapDoc.set(method);

	for (var i in this._add) {
		var addrEl = soapDoc.set("addr", i, methodEl);
		addrEl.setAttribute("op", "+");
	}

	for (var i in this._remove) {
		var addrEl = soapDoc.set("addr", i, methodEl);
		addrEl.setAttribute("op", "-");
	}
};

ZmWhiteBlackList.prototype.isDirty =
function() {
	var isDirty = false;

	for (var i in this._add) {
		isDirty = true;
		break;
	}

	if (!isDirty) {
		for (var i in this._remove) {
			isDirty = true;
			break;
		}
	}

	return isDirty;
};

ZmWhiteBlackList.prototype.saveLocal =
function() {
	if (this.isDirty()) {
		this._list = this._listView.getList().clone().getArray();
		this._add = {};
		this._remove = {};
	}
};

ZmWhiteBlackList.prototype.updateNumUsed =
function() {
	this._numUsedText.innerHTML = AjxMessageFormat.format(ZmMsg.whiteBlackNumUsed, [this._listView.size(), this._max]);
};

ZmWhiteBlackList.prototype._setContent =
function(templateId) {
	this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#"+templateId, {id:this._htmlElId});

	var id = this._htmlElId + "_EMAIL_ADDRESS";
	var el = document.getElementById(id);
	this._inputEl = new DwtInputField({parent:this, parentElement:id, size:35, hint:ZmMsg.enterEmailAddressOrDomain});
	this._inputEl.getInputElement().style.width = "210px";
	this._inputEl._showHint();
	this._inputEl.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleKeyUp));
	this.parent._addControlTabIndex(el, this._inputEl);

	id = this._htmlElId + "_LISTVIEW";
	el = document.getElementById(id);
	this._listView = new DwtListView({parent:this, parentElement:id});
	this._listView.addClassName("ZmWhiteBlackList");
	this.parent._addControlTabIndex(el, this._listView);

	id = this._htmlElId + "_ADD_BUTTON";
	el = document.getElementById(id);
	var addButton = new DwtButton({parent:this, parentElement:id});
	addButton.setText(ZmMsg.add);
	addButton.addSelectionListener(new AjxListener(this, this._addListener));
	this.parent._addControlTabIndex(el, addButton);

	id = this._htmlElId + "_REMOVE_BUTTON";
	el = document.getElementById(id);
	var removeButton = new DwtButton({parent:this, parentElement:id});
	removeButton.setText(ZmMsg.remove);
	removeButton.addSelectionListener(new AjxListener(this, this._removeListener));
	this.parent._addControlTabIndex(el, removeButton);

	id = this._htmlElId + "_NUM_USED";
	this._numUsedText = document.getElementById(id);
};

ZmWhiteBlackList.prototype._addEmail =
function(addr) {
	var item = new ZmWhiteBlackListItem(addr);
	this._listView.addItem(item, null, true);
	return item;
};

ZmWhiteBlackList.prototype._addListener =
function() {
	if (this._listView.size() >= this._max) {
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(ZmMsg.errorWhiteBlackListExceeded);
		dialog.popup();
		return;
	}

	var val,
        items = AjxStringUtil.trim(this._inputEl.getValue(), true);
	if (items.length) {
        items = AjxStringUtil.split(items, [',', ';', ' ']);
        for(var i=0; i<items.length; i++) {
            val = items[i];
            if(val) {
                this._addEmail(AjxStringUtil.htmlEncode(val));
                if (!this._add[val]) {
                    this._add[val] = true;
                }
            }
        }
		this._inputEl.setValue("", true);
		this._inputEl.blur();
		this._inputEl.focus();

		this.updateNumUsed();
	}
};

ZmWhiteBlackList.prototype._removeListener =
function() {
	var items = this._listView.getSelection();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		this._listView.removeItem(item, true);
		var addr = item.toString();
		if (this._add[addr]) {
			delete this._add[addr];
		} else {
			this._remove[addr] = true;
		}
	}

	this.updateNumUsed();
};

ZmWhiteBlackList.prototype._handleKeyUp =
function(ev) {
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		this._addListener();
	}
};

// Helper
ZmWhiteBlackListItem = function(addr) {
	this.addr = addr;
	this.id = Dwt.getNextId();
};

ZmWhiteBlackListItem.prototype.toString =
function() {
	return this.addr;
};
