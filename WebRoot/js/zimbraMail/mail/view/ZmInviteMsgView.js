/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains an invite mail message singleton class.
 *
 */


/**
 * Default constructor for invite mail message class.
 * @class
 * When a user receives an invite, this class is instatiated to help
 * ZmMailMsgView deal with invite-specific rendering/logic.
 *
 * @author Parag Shah
 */
ZmInviteMsgView = function(params) {
	if (arguments.length == 0) { return; }

	this.parent = params.parent; // back reference to ZmMailMsgView
	this.mode = params.mode;
};

// Consts
ZmInviteMsgView.REPLY_INVITE_EVENT	= "inviteReply";


ZmInviteMsgView.prototype.toString =
function() {
	return "ZmInviteMsgView";
};

ZmInviteMsgView.prototype.reset =
function(cleanupHTML) {
	if (this._inviteToolbar) {
		if (cleanupHTML) {
			this._inviteToolbar.dispose();
			this._inviteToolbar = null;
		} else {
			this._inviteToolbar.setDisplay(Dwt.DISPLAY_NONE);
		}
	}

	if (this._counterToolbar) {
		if (cleanupHTML) {
			this._counterToolbar.dispose();
			this._counterToolbar = null;
		} else {
			this._counterToolbar.setDisplay(Dwt.DISPLAY_NONE);
		}
	}

	if (this._dayView) {
		if (cleanupHTML) {
			this._dayView.dispose();
			this._dayView = null;
		} else {
			this._dayView.setDisplay(Dwt.DISPLAY_NONE);
		}
		Dwt.delClass(this.parent.getHtmlElement(), "RightBorderSeparator");
	}

	this._msg = null;
	this._invite = null;
};

ZmInviteMsgView.prototype.isActive =
function() {
	return ((this._invite && !this._invite.isEmpty()) ||
			(this._inviteToolbar && this._inviteToolbar.getVisible()) ||
			(this._counterToolbar && this._counterToolbar.getVisible()));
};

ZmInviteMsgView.prototype.set =
function(msg) {

	this._msg = msg;
	var invite = this._invite = msg.invite;

	this.parent._lazyCreateObjectManager();

    // Can operate the toolbar if user is the invite recipient, or invite is in a
    // non-trash shared folder with admin/workflow access permissions
    var folder   =  appCtxt.getById(msg.folderId);
    var enabled  = !appCtxt.isExternalAccount();
    if (enabled && folder && folder.isRemote()) {
        var workflow = folder.isPermAllowed(ZmOrganizer.PERM_WORKFLOW);
        var admin    = folder.isPermAllowed(ZmOrganizer.PERM_ADMIN);
        var enabled  = (admin || workflow) &&
                       (ZmOrganizer.normalizeId(msg.folderId) != ZmFolder.ID_TRASH);
    }
	if (invite && invite.hasAcceptableComponents() && msg.folderId != ZmFolder.ID_SENT)	{
		if (msg.isInviteCanceled()) {
			//appointment was canceled (not necessarily on this instance, but by now it is canceled. Do not show the toolbar.
			return;
		}
		if (invite.hasCounterMethod()) {
			if (!this._counterToolbar) {
				this._counterToolbar = this._getCounterToolbar();
			}
			this._counterToolbar.reparentHtmlElement(this.parent.getHtmlElement(), 0);
			this._counterToolbar.setVisible(enabled);
		}
		else if (!invite.isOrganizer() && invite.hasInviteReplyMethod()) {
			var ac = window.parentAppCtxt || window.appCtxt;
			if (AjxEnv.isIE && this._inviteToolbar) {
				//according to fix to bug 52412 reparenting doestn't work on IE. so I don't reparent for IE but also if the toolbar element exists,
				//I remove it from parent since in the case of double-click message view, it appears multiple times without removing it
				this._inviteToolbar.dispose();
				this._inviteToolbar = null;
			}

			var inviteToolbar = this.getInviteToolbar();
			inviteToolbar.setVisible(enabled);

			// show on-behalf-of info?
			this._respondOnBehalfLabel.setContent(msg.cif ? AjxMessageFormat.format(ZmMsg.onBehalfOfText, [msg.cif]) : "");
			this._respondOnBehalfLabel.setVisible(!!msg.cif);

			// logic for showing calendar/folder chooser
			var cc = AjxDispatcher.run("GetCalController");
			//note that for a msg from a mountpoint, msgAcct returns the main account, so it's not really msgAcct.
			var msgAcct = msg.getAccount();
			var calendars = ac.get(ZmSetting.CALENDAR_ENABLED, null, msgAcct) && (!msg.cif)
				? cc.getCalendars({includeLinks:true, account:msgAcct, onlyWritable:true}) : [];

			var msgFolder = ac.getById(msg.getFolderId());
			var msgAcctId = msgFolder && msgFolder.isMountpoint ? ZmOrganizer.parseId(msgFolder.id).acctId : msgAcct.id;

			if (appCtxt.multiAccounts) {
				var accounts = ac.accountList.visibleAccounts;
				for (var i = 0; i < accounts.length; i++) {
					var acct = accounts[i];
					if (acct == msgAcct || !ac.get(ZmSetting.CALENDAR_ENABLED, null, acct)) { continue; }
					if (appCtxt.isOffline && acct.isMain) { continue; }

					calendars = calendars.concat(cc.getCalendars({includeLinks:true, account:acct, onlyWritable:true}));
				}

				// always add the local account *last*
				if (appCtxt.isOffline) {
					calendars.push(appCtxt.getById(ZmOrganizer.ID_CALENDAR));
				}
			}

			var visible = (calendars.length > 1 || appCtxt.multiAccounts);
			if (visible) {
				this._inviteMoveSelect.clearOptions();
				for (var i = 0; i < calendars.length; i++) {
					var calendar = calendars[i];
					var calAcct = null;
					var calAcctId;
					if (calendar.isMountpoint) {
						//we can't get account object for mountpoint, just get the ID.
						calAcctId = ZmOrganizer.parseId(calendar.id).acctId;
					}
					else {
						calAcct = calendar.getAccount();
						calAcctId = calAcct.id;
					}
					var name = (appCtxt.multiAccounts && calAcct)
						? ([calendar.name, " (", calAcct.getDisplayName(), ")"].join(""))
						: calendar.name;
					var isSelected = (calAcctId && msgAcctId)
						? (calAcctId == msgAcctId && calendar.nId == ZmOrganizer.ID_CALENDAR)
						: calendar.nId == ZmOrganizer.ID_CALENDAR;
                    //bug: 57538 - this invite is intended for owner of shared calendar which should be selected
                    if(msg.cif && calendar.owner == msg.cif && calendar.rid == ZmOrganizer.ID_CALENDAR) isSelected = true;
					var option = new DwtSelectOptionData(calendar.id, name, isSelected, null, null);
					this._inviteMoveSelect.addOption(option);
				}

				// for accounts that don't support calendar, always set the
				// selected calendar to the Local calendar
				if (!ac.get(ZmSetting.CALENDAR_ENABLED, null, msgAcct)) {
					this._inviteMoveSelect.setSelectedValue(ZmOrganizer.ID_CALENDAR);
				}
			}
			this._inviteMoveSelect.setVisible(visible);
		}
	}
};

/**
 * This method does two things:
 * 1) Checks if invite was responded to with accept/decline/tentative, and if so,
 *    a GetAppointmentRequest is made to get the status for the other attendees.
 *
 * 2) Requests the free/busy status for the start date and renders the day view
 *    with the results returned.
 */
ZmInviteMsgView.prototype.showMoreInfo =
function(callback, dayViewCallback) {
	var apptId = this._invite && this._invite.hasAttendeeResponse() && this._invite.getAppointmentId();

    // Fix for bug: 83785. apptId: 0 is default id for an appointment without any parent.
    // Getting apptId: 0 when external user takes action on appointment and organizer gets reply mail.
	if (apptId !== '0' && apptId) {
		var jsonObj = {GetAppointmentRequest:{_jsns:"urn:zimbraMail"}};
		var request = jsonObj.GetAppointmentRequest;
		var msgId = this._invite.msgId;
		var inx = msgId.indexOf(":");
		if (inx !== -1) {
			apptId = [msgId.substr(0, inx), apptId].join(":");
		}
		request.id = apptId;

		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._handleShowMoreInfo, [callback, dayViewCallback]))
		});
	}
	else {
		this._showFreeBusy(dayViewCallback);
		if (callback) {
			callback.run();
		}
	}
};

ZmInviteMsgView.prototype._handleShowMoreInfo =
function(callback, dayViewCallback, result) {
	var appt = result && result.getResponse().GetAppointmentResponse.appt[0];
	if (appt) {
		var om = this.parent._objectManager;
		var html = [];
		var idx = 0;
		var attendees = appt.inv[0].comp[0].at || [];
        AjxDispatcher.require(["MailCore", "CalendarCore"]);

        var options = {};
	    options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);

		for (var i = 0; i < attendees.length; i++) {
			var at = attendees[i];
			var subs = {
				attendee: this.parent._getBubbleHtml(new AjxEmailAddress(at.a), options)
			};
			html[idx++] = AjxTemplate.expand("mail.Message#InviteHeaderPtst", subs);
		}

		var ptstEl = document.getElementById(this._ptstId);
        if(ptstEl)
            ptstEl.innerHTML = html.join("");
	}

	if (callback) {
		callback.run();
	}

	this._showFreeBusy(dayViewCallback);
};

ZmInviteMsgView.prototype._showFreeBusy =
function(dayViewCallback) {
	var ac = window.parentAppCtxt || window.appCtxt;

	if (!appCtxt.isChildWindow &&
		(ac.get(ZmSetting.CALENDAR_ENABLED) || ac.multiAccounts) &&
		(this._invite && this._invite.type != "task"))
	{
        var inviteDate = this._getInviteDate();
        if (inviteDate == null) {
            return;
        }

		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
		var cc = AjxDispatcher.run("GetCalController");

		if (!this._dayView) {
			// create a new ZmCalDayView under msgview's parent otherwise, we
			// cannot position the day view correctly.
			var dayViewParent = (this.mode && (this.mode == ZmId.VIEW_CONV2)) ?
			    this.parent : this.parent.parent;
			this._dayView = new ZmCalDayView(dayViewParent, DwtControl.ABSOLUTE_STYLE, cc, null,
                this.parent._viewId, null, true, true, this.isRight());
			this._dayView.addSelectionListener(new AjxListener(this, this._apptSelectionListener));
			this._dayView.setZIndex(Dwt.Z_VIEW); // needed by ZmMsgController's msgview
		}

		this._dayView.setDisplay(Dwt.DISPLAY_BLOCK);
		this._dayView.setDate(inviteDate, 0, false);
        this.resize();

        var acctFolderIds = [].concat(cc.getCheckedCalendarFolderIds()); // create a *copy*
        if(this._msg.cif) {
            acctFolderIds = acctFolderIds.concat(cc.getUncheckedCalendarIdsByOwner(this._msg.cif));
        }
		var rt = this._dayView.getTimeRange();
		var params = {
			start: rt.start,
			end: rt.end,
			fanoutAllDay: this._dayView._fanoutAllDay(),
			callback: (new AjxCallback(this, this._dayResultsCallback, [dayViewCallback, inviteDate.getHours()])),
			accountFolderIds: [acctFolderIds] // pass in array of array
		};
		cc.apptCache.batchRequest(params);
	}
};

ZmInviteMsgView.prototype._getInviteDate =
function() {
	if (!this._invite) { return null; }
    var inviteDate = this._invite.getServerStartDate(null, true);
    // Not sure when null inviteDate happens (probably a bug) but this is defensive
    // check for bug 51754
    if (inviteDate != null) {
        var inviteTz = this._invite.getServerStartTimeTz();
        inviteDate = AjxTimezone.convertTimezone(inviteDate,
            AjxTimezone.getClientId(inviteTz), AjxTimezone.DEFAULT);
    }
    return inviteDate;
}

ZmInviteMsgView.prototype.isRight =
function() {
	return this.parent._controller.isReadingPaneOnRight();
};

ZmInviteMsgView.prototype.convResize =
function() {
	var parentSize = this.parent.getSize();
	if (this._dayView) {
		this._dayView.setSize(parentSize.x - 5, 218);
		var el = this._dayView.getHtmlElement();
		el.style.left = el.style.top = "auto";
		this._dayView.layout();
	}
}

/**
 * Resizes the view depending on whether f/b is being shown or not.
 *
 * @param reset		Boolean		If true, day view is not shown and msgview's bounds need to be "reset"
 */
ZmInviteMsgView.prototype.resize =
function(reset) {
	if (appCtxt.isChildWindow) { return; }
	if (this.parent.isZmMailMsgCapsuleView) { return; }

	var isRight = this.isRight();
	var grandParentSize = this.parent.parent.getSize();

	if (reset) {
		if (isRight) {
			this.parent.setSize(Dwt.DEFAULT, grandParentSize.y);
		}
		else {
			this.parent.setSize(grandParentSize.x, Dwt.DEFAULT);
		}
	} else if (this._dayView) {
		// bug: 50412 - fix day view for stand-alone message view which is a parent
		// of DwtShell and needs to be resized manually.
		var padding = 0;
		if (this.parent.getController() instanceof ZmMsgController) {
			// get the bounds for the app content area so we can position the day view
			var appContentBounds = appCtxt.getAppViewMgr()._getContainerBounds(ZmAppViewMgr.C_APP_CONTENT);
            if (!isRight)
			    grandParentSize = {x: appContentBounds.width, y: appContentBounds.height};

			// set padding so we can add it to the day view's x-location since it is a child of the shell
			padding = appContentBounds.x;
		}

		var mvBounds = this.parent.getBounds();

		/* on IE sometimes the value of top and left is "auto", in which case we get a NaN value here due to parseInt in getLocation. */
		/* not sure if 0 is the right value we should use in this case, but it seems to work */
		if (isNaN(mvBounds.x)) {
			mvBounds.x = 0;
		}
		if (isNaN(mvBounds.y)) {
			mvBounds.y = 0;
		}

		if (isRight) {
			var parentHeight = grandParentSize.y;
			var dvHeight = Math.floor(parentHeight / 3);
			var mvHeight = parentHeight - dvHeight;
			
			this._dayView.setBounds(mvBounds.x, mvHeight, mvBounds.width, dvHeight);
            if (this.parent && this.parent instanceof ZmMailMsgView){
                var el = this.parent.getHtmlElement();
                if (this.mode && this.mode != ZmId.VIEW_MSG) {
                    if (el){
                        el.style.height = mvHeight + "px";
                        Dwt.setScrollStyle(el, Dwt.SCROLL);
                    }
                }
                else {
                    var bodyDiv = this.parent.getMsgBodyElement();
                    if (bodyDiv) Dwt.setScrollStyle(bodyDiv, Dwt.CLIP);
                    if (el) {
                        Dwt.setScrollStyle(el, Dwt.SCROLL);
                        var yOffset = this.parent.getBounds().y || 0;
                        el.style.height = (mvHeight - yOffset) + "px";
                    }
                }
            }

			// don't call DwtControl's setSize() since it triggers control
			// listener and leads to infinite loop

			Dwt.delClass(this.parent.getHtmlElement(), "RightBorderSeparator");
		} else {
			var parentWidth = grandParentSize.x;
			var dvWidth = Math.floor(parentWidth / 3);
			var separatorWidth = 5;
			var mvWidth = parentWidth - dvWidth - separatorWidth; 

			this._dayView.setBounds(mvWidth + padding + separatorWidth, mvBounds.y, dvWidth, mvBounds.height);
			// don't call DwtControl's setSize() since it triggers control
			// listener and leads to infinite loop
			Dwt.setSize(this.parent.getHtmlElement(), mvWidth, Dwt.DEFAULT);
			Dwt.addClass(this.parent.getHtmlElement(), "RightBorderSeparator");
		}
	}
};

/**
 * enables all invite toolbar buttons, except one that matches the current ptst
 * @param ptst participant status
 */
ZmInviteMsgView.prototype.enableToolbarButtons =
function(ptst) {
	var disableButtonIds = {};
	switch (ptst) {
		case ZmCalBaseItem.PSTATUS_ACCEPT:
			disableButtonIds[ZmOperation.REPLY_ACCEPT] = true;
			break;
		case ZmCalBaseItem.PSTATUS_DECLINED:
			disableButtonIds[ZmOperation.REPLY_DECLINE] = true;
			break;
		case ZmCalBaseItem.PSTATUS_TENTATIVE:
			disableButtonIds[ZmOperation.REPLY_TENTATIVE] = true;
			break;
	}
	if (appCtxt.isWebClientOffline()) {
		 disableButtonIds[ ZmOperation.PROPOSE_NEW_TIME] = true;
	}
	var inviteToolbar = this.getInviteToolbar();

	var buttonIds = [ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_DECLINE, ZmOperation.REPLY_TENTATIVE, ZmOperation.PROPOSE_NEW_TIME];
	for (var i = 0; i < buttonIds.length; i++) {
		var buttonId = buttonIds[i];
		inviteToolbar.getButton(buttonId).setEnabled(appCtxt.isExternalAccount() ? false : !disableButtonIds[buttonId]);
	}
};

/**
 * hide the participant status message (no longer relevant)
 */
ZmInviteMsgView.prototype.updatePtstMsg =
function(ptst) {
	var ptstMsgBannerDiv = document.getElementById(this._ptstMsgBannerId);
	if (!ptstMsgBannerDiv) {
		return;
	}
	ptstMsgBannerDiv.className = ZmInviteMsgView.PTST_MSG[ptst].className;
	ptstMsgBannerDiv.style.display = "block"; // since it might be display none if there's no message to begin with (this is the first time ptst is set by buttons)

	var ptstMsgElement = document.getElementById(this._ptstMsgId);
	ptstMsgElement.innerHTML = ZmInviteMsgView.PTST_MSG[ptst].msg;

	var ptstIconImg = document.getElementById(this._ptstMsgIconId);
	var icon = ZmCalItem.getParticipationStatusIcon(ptst);
	ptstIconImg.innerHTML = AjxImg.getImageHtml(icon)


};


ZmInviteMsgView.PTST_MSG = [];
ZmInviteMsgView.PTST_MSG[ZmCalBaseItem.PSTATUS_ACCEPT] = {msg: AjxMessageFormat.format(ZmMsg.inviteAccepted), className: "InviteStatusAccept"};
ZmInviteMsgView.PTST_MSG[ZmCalBaseItem.PSTATUS_DECLINED] = {msg: AjxMessageFormat.format(ZmMsg.inviteDeclined), className: "InviteStatusDecline"};
ZmInviteMsgView.PTST_MSG[ZmCalBaseItem.PSTATUS_TENTATIVE] = {msg: AjxMessageFormat.format(ZmMsg.inviteAcceptedTentatively), className: "InviteStatusTentative"};
ZmInviteMsgView.PTST_MSG[ZmCalBaseItem.PSTATUS_NEEDS_ACTION] = {msg: AjxMessageFormat.format(ZmMsg.ptstMsgNeedsAction), className: "InviteStatusTentative"};

ZmInviteMsgView.prototype.addSubs =
function(subs, sentBy, sentByAddr, obo) {

    AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	subs.invite = this._invite;

	if (!this._msg.isInviteCanceled() && !subs.invite.isOrganizer() && subs.invite.hasInviteReplyMethod()) {
		var yourPtst = this._msg.getPtst();
		this.enableToolbarButtons(yourPtst);
		if (yourPtst) {
			subs.ptstMsg = ZmInviteMsgView.PTST_MSG[yourPtst].msg;
			subs.ptstClassName = ZmInviteMsgView.PTST_MSG[yourPtst].className;
			subs.ptstIcon = ZmCalItem.getParticipationStatusIcon(yourPtst);
		}
	}
	//ids for updating later
	subs.ptstMsgBannerId = this._ptstMsgBannerId = (this.parent._htmlElId + "_ptstMsgBanner");
	subs.ptstMsgId = this._ptstMsgId = (this.parent._htmlElId + "_ptstMsg");
	subs.ptstMsgIconId = this._ptstMsgIconId = (this.parent._htmlElId + "_ptstMsgIcon");

	var isOrganizer = this._invite && this._invite.isOrganizer();
    var isInviteCancelled = this._invite.components && this._invite.components[0].method === ZmId.OP_CANCEL;
	// counter proposal
	if (this._invite.hasCounterMethod() &&
		this._msg.folderId != ZmFolder.ID_SENT)
	{
        var from = this._msg.getAddress(AjxEmailAddress.FROM) && this._msg.getAddress(AjxEmailAddress.FROM).getAddress();
        subs.counterInvMsg =  (!sentByAddr || sentByAddr == from) ?
            AjxMessageFormat.format(ZmMsg.counterInviteMsg, [from]):AjxMessageFormat.format(ZmMsg.counterInviteMsgOnBehalfOf, [sentByAddr, from]);
	}
	// Fix for bug: 88052 and 77237. Display cancellation banner to organizer or attendee
	else if (isInviteCancelled) {
		var organizer = this._invite.getOrganizerName() || this._invite.getOrganizerEmail();
		subs.ptstMsg = AjxMessageFormat.format(ZmMsg.inviteMsgCancelled, organizer.split());
		subs.ptstIcon = ZmCalItem.getParticipationStatusIcon(ZmCalBaseItem.PSTATUS_DECLINED);
		subs.ptstClassName = "InviteStatusDecline";
	}
	// if this an action'ed invite, show the status banner
	else if (isOrganizer && this._invite.hasAttendeeResponse()) {
		var attendee = this._invite.getAttendees()[0];
		var ptst = attendee && attendee.ptst;
		if (ptst) {
            var names = [];
			var dispName = attendee.d || attendee.a;
            var sentBy = attendee.sentBy;
            var ptstStr = null;
            if (sentBy) names.push(attendee.sentBy);
            names.push(dispName);
			subs.ptstIcon = ZmCalItem.getParticipationStatusIcon(ptst);
			switch (ptst) {
				case ZmCalBaseItem.PSTATUS_ACCEPT:
					ptstStr = (!sentBy) ? ZmMsg.inviteMsgAccepted : ZmMsg.inviteMsgOnBehalfOfAccepted;
					subs.ptstClassName = "InviteStatusAccept";
					break;
				case ZmCalBaseItem.PSTATUS_DECLINED:
					ptstStr = (!sentBy) ? ZmMsg.inviteMsgDeclined : ZmMsg.inviteMsgOnBehalfOfDeclined;
					subs.ptstClassName = "InviteStatusDecline";
					break;
				case ZmCalBaseItem.PSTATUS_TENTATIVE:
					ptstStr = (!sentBy) ? ZmMsg.inviteMsgTentative:ZmMsg.inviteMsgOnBehalfOfTentative;
					subs.ptstClassName = "InviteStatusTentative";
					break;
			}
            if (ptstStr){
                subs.ptstMsg = AjxMessageFormat.format(ptstStr, names);
            }
		}
	}

    if (isOrganizer && this._invite && this._invite.hasAttendeeResponse() && this._invite.getAppointmentId()){
        // set an Id for adding more detailed info later
        subs.ptstId = this._ptstId = (this.parent._htmlElId + "_ptst");
    }

    var options = {};
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);

	var om = this.parent._objectManager;
	// organizer
	var org = new AjxEmailAddress(this._invite.getOrganizerEmail(), null, this._invite.getOrganizerName());
	subs.invOrganizer = this.parent._getBubbleHtml(org, options);

    if (obo) {
	    subs.obo = this.parent._getBubbleHtml(obo, options);
    }

	// sent-by
	var sentBy = this._invite.getSentBy();
	if (sentBy) {
		subs.invSentBy = this.parent._getBubbleHtml(sentBy, options);
	}

    if(this._msg.cif) {
        subs.intendedForMsg = AjxMessageFormat.format(ZmMsg.intendedForInfo, [this._msg.cif]);
        subs.intendedForClassName = "InviteIntendedFor";
    }

	// inviteees
	var invitees = [];
    var optInvitees = [];

	var list = this._invite.getAttendees();
	for (var i = 0; i < list.length; i++) {
		var at = list[i];
		var attendee = new AjxEmailAddress(at.a, null, at.d);
        if (at.role == ZmCalItem.ROLE_OPTIONAL) {
            optInvitees.push(attendee);
        }
        else {
            invitees.push(attendee);
        }
	}
    var addressInfo = this.parent.getAddressesFieldInfo(invitees, options, "inv");
    subs.invitees = addressInfo.html;
    addressInfo = this.parent.getAddressesFieldInfo(optInvitees, options, "opt");
    subs.optInvitees = addressInfo.html;

	// convert to local timezone if necessary
	var inviteTz = this._invite.getServerStartTimeTz();
	var defaultTz = AjxTimezone.getServerId(AjxTimezone.DEFAULT);

    if (inviteTz) {
        var sd = AjxTimezone.convertTimezone(this._invite.getServerStartDate(null, true), AjxTimezone.getClientId(inviteTz), AjxTimezone.DEFAULT);
        var ed = AjxTimezone.convertTimezone(this._invite.getServerEndDate(null, true), AjxTimezone.getClientId(inviteTz), AjxTimezone.DEFAULT);

        subs.timezone = AjxTimezone.getMediumName(defaultTz);
    }

	// duration text
	var durText = this._invite.getDurationText(null, null, null, true, sd, ed);
	subs.invDate = durText;
	subs.startDate = sd || this._invite.getServerStartDate();

	// recurrence
	if (this._invite.isRecurring()) {
		var recur = new ZmRecurrence();
		recur.setRecurrenceRules(this._invite.getRecurrenceRules(), this._invite.getServerStartDate());
		subs.recur = recur.getBlurb();
	}

	// set changes to the invite
	var changes = this._invite.getChanges();
	if (changes && changes[ZmInvite.CHANGES_LOCATION]) {
		subs.locChangeClass = "InvChanged";
	}
	if (changes && changes[ZmInvite.CHANGES_SUBJECT]) {
		subs.subjChangeClass = "InvChanged";
	}
	if (changes && changes[ZmInvite.CHANGES_TIME]) {
		subs.timeChangeClass = "InvChanged";
	}
};

ZmInviteMsgView.truncateBodyContent =
function(content, isHtml) {
    if (!content) return content;
	var sepIdx = content.indexOf(ZmItem.NOTES_SEPARATOR);
	if (sepIdx == -1) {
		return content;
	}
	if (isHtml) {
		//if it is a html content then just remove the content and preserve the html tags
		//surrounding the content.
        content = content.replace("<div>"+ ZmItem.NOTES_SEPARATOR +"</div>", ZmItem.NOTES_SEPARATOR); // Striping div if ZmItem.NOTES_SEPARATOR is part of div.
        content = content.replace(ZmItem.NOTES_SEPARATOR, "<div id='separatorId'>" + ZmItem.NOTES_SEPARATOR + "</div>");
        var divEle = document.createElement("div");
        divEle.innerHTML = content;
        var node = Dwt.byId("separatorId",divEle) ;
        if (node){
            var parent = node.parentNode
            // Removing all previousSiblings of node that contains ZmItem.NOTES_SEPARATOR
            while(node.previousSibling){
                parent.removeChild(node.previousSibling);
            }
            parent.removeChild(node);
        }
        return divEle.innerHTML;
	}
	return content.substring(sepIdx+ZmItem.NOTES_SEPARATOR.length);
};

ZmInviteMsgView.prototype._getCounterToolbar =
function() {
	var params = {
		parent: this.parent,
		buttons: [ZmOperation.ACCEPT_PROPOSAL, ZmOperation.DECLINE_PROPOSAL],
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmCounterToolBar",
		buttonClassName: "DwtToolbarButton",
		context: this.mode,
		toolbarType: ZmId.TB_COUNTER
	};
	var tb = new ZmButtonToolBar(params);

	var listener = new AjxListener(this, this._inviteToolBarListener);
	for (var i = 0; i < tb.opList.length; i++) {
		tb.addSelectionListener(tb.opList[i], listener);
	}

	return tb;
};

/**
 * returns the toolbar. Creates a new one only if it's not already set to the internal field
 */
ZmInviteMsgView.prototype.getInviteToolbar =
function() {
	if (!this._inviteToolbar) {
		this._inviteToolbar = this._createInviteToolbar();
		//hide it till needed. Just in case after the fix I submit with this, some future change will call it before needs to be displayed.
		this._inviteToolbar.setDisplay(Dwt.DISPLAY_NONE);
		
	}
	return this._inviteToolbar;
};


ZmInviteMsgView.prototype._createInviteToolbar =
function() {
	var replyButtonIds = [
		ZmOperation.INVITE_REPLY_ACCEPT,
		ZmOperation.INVITE_REPLY_TENTATIVE,
		ZmOperation.INVITE_REPLY_DECLINE
	];
	var notifyOperationButtonIds = [
		ZmOperation.REPLY_ACCEPT_NOTIFY,
		ZmOperation.REPLY_TENTATIVE_NOTIFY,
		ZmOperation.REPLY_DECLINE_NOTIFY
	];
	var ignoreOperationButtonIds = [
		ZmOperation.REPLY_ACCEPT_IGNORE,
		ZmOperation.REPLY_TENTATIVE_IGNORE,
		ZmOperation.REPLY_DECLINE_IGNORE
	];
	var inviteOps = [
		ZmOperation.REPLY_ACCEPT,
		ZmOperation.REPLY_TENTATIVE,
		ZmOperation.REPLY_DECLINE,
		ZmOperation.PROPOSE_NEW_TIME
	];

	var params = {
		parent: this.parent,
		buttons: inviteOps,
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmInviteToolBar",
		buttonClassName: "DwtToolbarButton",
		context: this.parent.getHTMLElId(),
		toolbarType: ZmId.TB_INVITE
	};
	var tb = new ZmButtonToolBar(params);

	var listener = new AjxListener(this, this._inviteToolBarListener);
	for (var i = 0; i < tb.opList.length; i++) {
		var id = tb.opList[i];

		tb.addSelectionListener(id, listener);

		if (id == ZmOperation.PROPOSE_NEW_TIME) { continue; }

		var button = tb.getButton(id);
		button.addClassName(id);
		var standardItems = [notifyOperationButtonIds[i], replyButtonIds[i], ignoreOperationButtonIds[i]];
		var menu = new ZmActionMenu({parent:button, menuItems:standardItems});
		standardItems = menu.opList;
		for (var j = 0; j < standardItems.length; j++) {
			var menuItem = menu.getItem(j);
			menuItem.addSelectionListener(listener);
		}
		button.setMenu(menu);
	}

	this._respondOnBehalfLabel = new DwtControl({parent:tb.parent});
	// tb.addFiller();

	// folder picker
	this._inviteMoveSelect = new DwtSelect({parent:tb.parent});
	this._inviteMoveSelect.setVisible(false); //by default hide it. bug 74254

	return tb;
};

ZmInviteMsgView.prototype._inviteToolBarListener =
function(ev) {
	ev._inviteReplyType = ev.item.getData(ZmOperation.KEY_ID);
	ev._inviteReplyFolderId = ((this._inviteMoveSelect && this._inviteMoveSelect.getValue()) || ZmOrganizer.ID_CALENDAR);
	ev._inviteComponentId = null;
	ev._msg = this._msg;
	this.parent.notifyListeners(ZmInviteMsgView.REPLY_INVITE_EVENT, ev);
};

ZmInviteMsgView.prototype._dayResultsCallback =
function(dayViewCallback, invitedHour, list, skipMiniCalUpdate, query) {
	if (this._dayView) {
	    this._dayView.set(list, true);
	    this._dayView._scrollToTime(invitedHour);
	}
    if (dayViewCallback) {
        dayViewCallback.run();
    }
};

ZmInviteMsgView.prototype.getDayView =
function() {
    return this._dayView;
};

ZmInviteMsgView.prototype._apptSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var appt = ev.item;
		if (appt.isPrivate() && appt.getFolder().isRemote() && !appt.getFolder().hasPrivateAccess()) {
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.setMessage(ZmMsg.apptIsPrivate, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
		} else {
			// open a appointment view
			var cc = AjxDispatcher.run("GetCalController");
			cc._showAppointmentDetails(appt);
		}
	}
};

ZmInviteMsgView.prototype.scrollToInvite =
function() {
    var inviteDate = this._getInviteDate();
    if ((inviteDate != null) && this._dayView) {
        this._dayView._scrollToTime(inviteDate.getHours());
    }
}

ZmInviteMsgView.prototype.repositionCounterToolbar =
function(hdrTableId) {
    if (this._invite && this._invite.hasCounterMethod() && hdrTableId && this._counterToolbar) {
        this._counterToolbar.reparentHtmlElement(hdrTableId + '_counterToolbar', 0);
    }
}
