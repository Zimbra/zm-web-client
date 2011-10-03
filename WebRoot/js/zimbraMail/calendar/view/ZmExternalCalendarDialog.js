/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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

ZmExternalCalendarDialog = function(params) {
    var back = new DwtDialog_ButtonDescriptor(ZmExternalCalendarDialog.BACK_BUTTON, ZmMsg.back , DwtDialog.ALIGN_RIGHT);
    var next = new DwtDialog_ButtonDescriptor(ZmExternalCalendarDialog.NEXT_BUTTON, ZmMsg.next, DwtDialog.ALIGN_RIGHT);
    var cancel = new DwtDialog_ButtonDescriptor(ZmExternalCalendarDialog.SHARE_CANCEL_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT);
    var parent = params.parent || appCtxt.getShell();
    this._controller = params.controller;
    ZmDialog.call(this, {parent:parent, standardButtons:[DwtDialog.NO_BUTTONS], extraButtons: [back, next, cancel]});

	this.setButtonListener(ZmExternalCalendarDialog.BACK_BUTTON, new AjxListener(this, this._backButtonListener));
	this.setButtonListener(ZmExternalCalendarDialog.NEXT_BUTTON, new AjxListener(this, this._nextButtonListener));
	this.setButtonListener(ZmExternalCalendarDialog.SHARE_CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));

    this.getButton(ZmExternalCalendarDialog.BACK_BUTTON).setVisibility(false);
	//var title = ZmMsg.addSharedCalendar;
	var type = ZmOrganizer.CALENDAR;
    this.setTitle(ZmMsg.addSharedCalendar);
	this.setContent(this.getDefaultContent());
    this._viewsLoaded = {};
    //this._viewsLoaded[ZmExternalCalendarDialog.FIRST_VIEW] = true;
    this.currentView = ZmExternalCalendarDialog.FIRST_VIEW;
    this.getViews();
};

ZmExternalCalendarDialog.prototype = new ZmDialog;
ZmExternalCalendarDialog.prototype.constructor = ZmExternalCalendarDialog;

ZmExternalCalendarDialog.FIRST_VIEW = 1;
ZmExternalCalendarDialog.SECOND_VIEW = 2;
ZmExternalCalendarDialog.THIRD_VIEW = 3;

ZmExternalCalendarDialog.FIRST_VIEW_ID = "_shareCalendarView1";
ZmExternalCalendarDialog.SECOND_VIEW_ID = "_shareCalendarView2";
ZmExternalCalendarDialog.THIRD_VIEW_ID = "_shareCalendarView3";

ZmExternalCalendarDialog.SYNC_TYPE_ICAL = "ical";
ZmExternalCalendarDialog.SYNC_TYPE_CALDAV = "caldav";

ZmExternalCalendarDialog.URL_GOOGLE = "www.google.com";
ZmExternalCalendarDialog.URL_YAHOO = "caldav.calendar.yahoo.com";

ZmExternalCalendarDialog.TYPE_GOOGLE = "Google";
ZmExternalCalendarDialog.TYPE_YAHOO = "Yahoo";
ZmExternalCalendarDialog.TYPE_OTHER = "Other";

ZmExternalCalendarDialog.TEMPLATE = "calendar.Calendar#SharedCalendarDialog";
ZmExternalCalendarDialog.BACK_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmExternalCalendarDialog.NEXT_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmExternalCalendarDialog.SHARE_CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;


ZmExternalCalendarDialog.prototype.toString =
function() {
	return "ZmExternalCalendarDialog";
};

ZmExternalCalendarDialog.prototype.getDefaultContent =
function() {
    var html = AjxTemplate.expand(ZmExternalCalendarDialog.TEMPLATE, {id: this._htmlElId});
    return html;
};

ZmExternalCalendarDialog.prototype.popup =
function() {
    this.showView();
    ZmDialog.prototype.popup.call(this);
};

ZmExternalCalendarDialog.prototype.popdown =
function() {
    this.clearControls();
    ZmDialog.prototype.popdown.call(this);
};

ZmExternalCalendarDialog.prototype._setupControls =
function() {
    //blank
};

ZmExternalCalendarDialog.prototype._nextButtonListener =
function(ev) {
    var id = this._htmlElId;
    switch(this.currentView) {
        case ZmExternalCalendarDialog.FIRST_VIEW :
            /*var _shareRadioPublic = document.getElementById(id + '_shareRadioPublic');
            if(_shareRadioPublic && _shareRadioPublic.checked) {
                this._showSharePublicView();
            }*/
            var shareRadioGoogle = document.getElementById(id + '_shareRadioGoogle'),
                shareRadioYahoo = document.getElementById(id + '_shareRadioYahoo'),
                shareRadioOther = document.getElementById(id + '_shareRadioOther');

            if(shareRadioGoogle && shareRadioGoogle.checked) {
                this.showView(ZmExternalCalendarDialog.SECOND_VIEW, ZmExternalCalendarDialog.TYPE_GOOGLE);
            }
            if(shareRadioYahoo && shareRadioYahoo.checked) {
                this.showView(ZmExternalCalendarDialog.SECOND_VIEW, ZmExternalCalendarDialog.TYPE_YAHOO);
            }
            if(shareRadioOther && shareRadioOther.checked) {
                this.showView(ZmExternalCalendarDialog.SECOND_VIEW, ZmExternalCalendarDialog.TYPE_OTHER);
            }
            this.showIcalView(false);
            this._syncTypeSelect.setSelectedValue(ZmExternalCalendarDialog.SYNC_TYPE_CALDAV);
        break;

        case ZmExternalCalendarDialog.SECOND_VIEW :
            var syncType = this._syncTypeSelect.getValue();
            if (!this.validate(syncType)) {
                return false;
            }
            var extCalData = {};
            if(syncType == ZmExternalCalendarDialog.SYNC_TYPE_CALDAV) {
                extCalData = {
                    calDav : {
                        userName : this._userNameInput.getValue(),
                        password : this._passwordInput.getValue(),
                        hostUrl : this._urlInput.getValue()
                    },
                    iCal : null
                };
            }
            else {
                extCalData = {
                    calDav : null,
                    iCal : {
                        url : this._icsUrlInput.getValue()
                    }
                };
            }
            this._controller.setExternalCalendarData(extCalData);
            this._controller._newListener(ev);
        break;

        case ZmExternalCalendarDialog.THIRD_VIEW :
        break;
    }
};
ZmExternalCalendarDialog.prototype._backButtonListener =
function() {
    var id = this._htmlElId;
    switch(this.currentView) {
        case ZmExternalCalendarDialog.FIRST_VIEW :
            //this.showView(ZmExternalCalendarDialog.FIRST_VIEW);
        break;

        case ZmExternalCalendarDialog.SECOND_VIEW :
            this.showView(ZmExternalCalendarDialog.FIRST_VIEW);
        break;

        case ZmExternalCalendarDialog.THIRD_VIEW :
            this.showView(ZmExternalCalendarDialog.SECOND_VIEW);
        break;
    }
};

ZmExternalCalendarDialog.prototype.validate =
function(syncType) {
    var msg = "";
    if(syncType == ZmExternalCalendarDialog.SYNC_TYPE_CALDAV) {
        var userName = this._userNameInput.getValue(),
            password = this._passwordInput.getValue(),
            hostUrl = this._urlInput.getValue(),
            url;

        if(!AjxEmailAddress.isValid(userName)) {
            msg = ZmMsg.errorInvalidUserName;
        }
        if(!msg && AjxStringUtil.trim(password) == "") {
            msg = ZmMsg.errorMissingPass;
        }
        /*if(!msg) {
            msg = ZmOrganizer.checkUrl(hostUrl);
        }*/
    }
    else {
        url = this._icsUrlInput.getValue();
        msg = ZmOrganizer.checkUrl(url);
    }
    if(msg) {
        this._showError(msg);
        return false;
    }
    return true;
};

ZmExternalCalendarDialog.prototype._showSharePublicView =
function() {
    //var psd = this._publichShareDialog || this.createPublicShareDialog();
    //psd.popup();
};

ZmExternalCalendarDialog.prototype.getViews =
function() {
    var id = this._htmlElId;
    this._views = {};
    this._views[ZmExternalCalendarDialog.FIRST_VIEW] = document.getElementById(id + ZmExternalCalendarDialog.FIRST_VIEW_ID);
    this._views[ZmExternalCalendarDialog.SECOND_VIEW] = document.getElementById(id + ZmExternalCalendarDialog.SECOND_VIEW_ID);
    this._views[ZmExternalCalendarDialog.THIRD_VIEW] = document.getElementById(id + ZmExternalCalendarDialog.THIRD_VIEW_ID);
};

ZmExternalCalendarDialog.prototype.hideAllViews =
function() {
    for (var id in this._views) {
        var view = this._views[id];
        if(view) {
            Dwt.setDisplay(view, Dwt.DISPLAY_NONE);
        }
    }
};

ZmExternalCalendarDialog.prototype._changeCalType =
function() {
    if(this.currentView != ZmExternalCalendarDialog.SECOND_VIEW) {
        return;
    }
    var calType = this._syncTypeSelect.getValue();
    this.showIcalView(ZmExternalCalendarDialog.SYNC_TYPE_ICAL == calType);
};

ZmExternalCalendarDialog.prototype.showIcalView =
function(isIcal) {
    var id = this._htmlElId,
        syncUserNameContainer = document.getElementById(id + "_syncUserNameContainer"),
        syncPasswordContainer = document.getElementById(id + "_syncPasswordContainer"),
        syncUrlContainer = document.getElementById(id + "_syncUrlContainer"),
        syncIcsUrlContainer = document.getElementById(id + "_syncIcsUrlContainer"),
        syncMsgContainer = document.getElementById(id + "_syncMsgContainer");

    Dwt.setVisible(syncUserNameContainer, !isIcal);
    Dwt.setVisible(syncPasswordContainer, !isIcal);
    Dwt.setVisible(syncUrlContainer, !isIcal);
    //Dwt.setVisible(syncMsgContainer, !isIcal);
    Dwt.setVisible(syncIcsUrlContainer, isIcal);
};

ZmExternalCalendarDialog.prototype.showView =
function(viewId, type) {
    viewId = viewId || ZmExternalCalendarDialog.FIRST_VIEW;
    this.hideAllViews();
    this.currentView = viewId;

    if(!this.isViewLoaded(viewId)) {
        this.loadView(viewId);
    }

    switch(viewId) {
        case ZmExternalCalendarDialog.FIRST_VIEW :
            this.getButton(ZmExternalCalendarDialog.BACK_BUTTON).setVisibility(false);
            this.setTitle(ZmMsg.addExternalCalendar);
        break;

        case ZmExternalCalendarDialog.SECOND_VIEW :
            this.getButton(ZmExternalCalendarDialog.BACK_BUTTON).setVisibility(true);
            if(type == ZmExternalCalendarDialog.TYPE_GOOGLE) {
                this._urlInput.setValue(ZmExternalCalendarDialog.URL_GOOGLE);
                this._urlInput.setEnabled(false);
                this._syncMsg.innerHTML = ZmMsg.sharedCalSyncMsgGoogle;
                this.setTitle(ZmMsg.sharedCalTitleGoogle);
            }
            else if(type == ZmExternalCalendarDialog.TYPE_YAHOO) {
                this._urlInput.setValue(ZmExternalCalendarDialog.URL_YAHOO);
                this._urlInput.setEnabled(false);
                this._syncMsg.innerHTML = ZmMsg.sharedCalSyncMsgYahoo;
                this.setTitle(ZmMsg.sharedCalTitleYahoo);
            }
            else {
                this._urlInput.setEnabled(true);
                this._urlInput.setValue("");
                this._syncMsg.innerHTML = "";
                this.setTitle(ZmMsg.sharedCalTitleOther);
            }
        break;

        case ZmExternalCalendarDialog.THIRD_VIEW :
            this.getButton(ZmExternalCalendarDialog.BACK_BUTTON).setVisibility(true);
        break;

    }
    Dwt.setDisplay(this._views[viewId], Dwt.DISPLAY_BLOCK);
};

ZmExternalCalendarDialog.prototype.loadView =
function(viewId) {
    var id = this._htmlElId;

    switch(viewId) {
        case ZmExternalCalendarDialog.FIRST_VIEW :
            this._viewsLoaded[ZmExternalCalendarDialog.FIRST_VIEW] = true;
        break;

        case ZmExternalCalendarDialog.SECOND_VIEW :
            var syncTypeSelect = new DwtSelect({parent:this, parentElement: id + '_syncType'});
            syncTypeSelect.addOption(ZmMsg.sharedCalTypeCalDAV, true, ZmExternalCalendarDialog.SYNC_TYPE_CALDAV);
            syncTypeSelect.addOption(ZmMsg.sharedCalTypeICal, false, ZmExternalCalendarDialog.SYNC_TYPE_ICAL);
            syncTypeSelect.addChangeListener(new AjxListener(this, this._changeCalType));
            this._syncTypeSelect = syncTypeSelect;

            this._userNameInput = new DwtInputField({parent:this, parentElement: id + '_syncUserName'});
            this._passwordInput = new DwtInputField({parent:this, parentElement: id + '_syncPassword', type: DwtInputField.PASSWORD});
            this._urlInput = new DwtInputField({parent:this, parentElement: id + '_syncUrl'});
            this._icsUrlInput = new DwtInputField({parent:this, parentElement: id + '_syncIcsUrl'});
            this._syncMsg = document.getElementById(id + '_syncMsg');
            this._viewsLoaded[ZmExternalCalendarDialog.SECOND_VIEW] = true;
        break;

        case ZmExternalCalendarDialog.THIRD_VIEW :
            this.getButton(ZmExternalCalendarDialog.BACK_BUTTON).setVisibility(true);
            this._viewsLoaded[ZmExternalCalendarDialog.THIRD_VIEW] = true;
        break;

    }
};

ZmExternalCalendarDialog.prototype.isViewLoaded =
function(viewId) {
    return this._viewsLoaded[viewId] ? this._viewsLoaded[viewId] : false;
};

ZmExternalCalendarDialog.prototype.clearControls =
function() {
    if(this.isViewLoaded(ZmExternalCalendarDialog.SECOND_VIEW)) {
        this._userNameInput.setValue("");
        this._passwordInput.setValue("");
        this._urlInput.setValue("");
        this._icsUrlInput.setValue("");
    }
};

ZmExternalCalendarDialog.prototype.createPublicShareDialog =
function() {
    /*var dialog = new ZmSharedCalendarSearchDialog({id:"ZmSharedCalendarSearchDialog"});
    this._publichShareDialog = dialog;
    return dialog;*/
};

ZmExternalCalendarDialog.prototype._cancelButtonListener =
function() {
    // reset the caldav object
    this._controller.setExternalCalendarData(null);
    this.popdown();
};

