/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
function() {
	if (this._inviteToolbar) {
		this._inviteToolbar.setDisplay(Dwt.DISPLAY_NONE);
	}

	if (this._counterToolbar) {
		this._counterToolbar.setDisplay(Dwt.DISPLAY_NONE);
	}

	if (this._dayView) {
		this._dayView.setDisplay(Dwt.DISPLAY_NONE);
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

	if (invite && invite.hasAcceptableComponents() &&
		msg.folderId != ZmFolder.ID_TRASH &&
		msg.folderId != ZmFolder.ID_SENT)
	{
		if (invite.hasCounterMethod()) {
			if (!this._counterToolbar) {
				this._counterToolbar = this._getCounterToolbar();
			}
			this._counterToolbar.reparentHtmlElement(this.parent.getHtmlElement(), 0);
			this._counterToolbar.setVisible(Dwt.DISPLAY_BLOCK);
		}
		else if (invite.hasInviteReplyMethod()) {
			var ac = window.parentAppCtxt || window.appCtxt;

			if (!this._inviteToolbar) {
				this._inviteToolbar = this._getInviteToolbar();
			}
			this._inviteToolbar.reparentHtmlElement(this.parent.getHtmlElement(), 0);
			this._inviteToolbar.setVisible(Dwt.DISPLAY_BLOCK);

			// show on-behalf-of info?
			this._respondOnBehalfLabel.innerHTML = msg.cif
				? AjxMessageFormat.format(ZmMsg.onBehalfOfText, [msg.cif]) : "";
			Dwt.setVisible(this._respondOnBehalfLabel, (!!msg.cif));

			// logic for showing calendar/folder chooser
			var cc = AjxDispatcher.run("GetCalController");
			var msgAcct = msg.getAccount();
			var calendars = ac.get(ZmSetting.CALENDAR_ENABLED, null, msgAcct)
				? cc.getCalendars({includeLinks:true, account:msgAcct, onlyWritable:true}) : [];

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
					var calAcct = calendar.getAccount();
					var icon = appCtxt.multiAccounts ? calAcct.getIcon() : calendar.getIcon();
					var name = appCtxt.multiAccounts
						? ([calendar.name, " (", calAcct.getDisplayName(), ")"].join(""))
						: calendar.name;
					var isSelected = (calAcct && msgAcct)
						? (calAcct == msgAcct && calendar.nId == ZmOrganizer.ID_CALENDAR)
						: calendar.nId == ZmOrganizer.ID_CALENDAR;
					var option = new DwtSelectOptionData(calendar.id, name, isSelected, null, icon);
					this._inviteMoveSelect.addOption(option);
				}

				// for accounts that don't support calendar, always set the
				// selected calendar to the Local calendar
				if (!ac.get(ZmSetting.CALENDAR_ENABLED, null, msgAcct)) {
					this._inviteMoveSelect.setSelectedValue(ZmOrganizer.ID_CALENDAR);
				}
			}
			this._inviteMoveLabel.setVisible(visible);
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
function() {
	var apptId = this._invite && this._invite.hasAttendeeResponse() && this._invite.getAppointmentId();
	if (apptId) {
		var jsonObj = {GetAppointmentRequest:{_jsns:"urn:zimbraMail"}};
		var request = jsonObj.GetAppointmentRequest;
		request.id = apptId;

		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._handleShowMoreInfo))
		});
	}
	else {
		this._showFreeBusy();
	}
};

ZmInviteMsgView.prototype._handleShowMoreInfo =
function(result) {
	var appt = result && result.getResponse().GetAppointmentResponse.appt[0];
	if (appt) {
		var om = this.parent._objectManager;
		var html = [];
		var idx = 0;
		var attendees = appt.inv[0].comp[0].at || [];

		for (var i = 0; i < attendees.length; i++) {
			var at = attendees[i];
			var subs = {
				icon: ZmCalItem.getParticipationStatusIcon(at.ptst),
				attendee: (om ? om.findObjects((new AjxEmailAddress(at.a)), true, ZmObjectManager.EMAIL) : at.a)
			};
			html[idx++] = AjxTemplate.expand("mail.Message#InviteHeaderPtst", subs);
		}

		var ptstEl = document.getElementById(this._ptstId);
		ptstEl.innerHTML = html.join("");
	}

	this._showFreeBusy();
};

ZmInviteMsgView.prototype._showFreeBusy =
function() {
	var ac = window.parentAppCtxt || window.appCtxt;

	if (!appCtxt.isChildWindow &&
		(ac.get(ZmSetting.CALENDAR_ENABLED) || ac.multiAccounts) &&
		(this._invite && this._invite.type != "task"))
	{
		AjxDispatcher.require(["CalendarCore", "Calendar"]);
		var cc = AjxDispatcher.run("GetCalController");

		if (!this._dayView) {
			// create a new ZmCalDayView under msgview's parent otherwise, we
			// cannot position the day view correctly.
			this._dayView = new ZmCalDayView(this.parent.parent, DwtControl.ABSOLUTE_STYLE, cc, null, null, null, true);
			this._dayView.addSelectionListener(new AjxListener(this, this._apptSelectionListener));
			this._dayView.setZIndex(Dwt.Z_VIEW); // needed by ZmMsgController's msgview
		}

		var inviteDate = this._invite.getServerStartDate();
		this._dayView.setDisplay(Dwt.DISPLAY_BLOCK);
		this._dayView.setDate(inviteDate, 0, false);
		this.resize();

		var rt = this._dayView.getTimeRange();
		var params = {
			start: rt.start,
			end: rt.end,
			fanoutAllDay: this._dayView._fanoutAllDay(),
			callback: (new AjxCallback(this, this._dayResultsCallback, [inviteDate.getHours()])),
			accountFolderIds: ([].concat(cc.getCheckedCalendarFolderIds())) // pass in *copy*
		};
		cc.apptCache.batchRequest(params);
	}
};

/**
 * Resizes the view depending on whether f/b is being shown or not.
 *
 * @param reset		Boolean		If true, day view is not shown and msgview's bounds need to be "reset"
 */
ZmInviteMsgView.prototype.resize =
function(reset) {
	if (appCtxt.isChildWindow) { return; }

	var isRight = this.parent._controller.isReadingPaneOnRight();
	var grandParentSize = this.parent.parent.getSize();

	if (reset) {
		isRight
			? this.parent.setSize(Dwt.DEFAULT, grandParentSize.y)
			: this.parent.setSize(grandParentSize.x, Dwt.DEFAULT);
	} else if (this._dayView) {
		// bug: 50412 - fix day view for stand-alone message view which is a parent
		// of DwtShell and needs to be resized manually.
		var padding = 0;
		if (this.parent.getController() instanceof ZmMsgController) {
			// get the bounds for the app content area so we can position the day view
			var appContentBounds = appCtxt.getAppViewMgr()._getContainerBounds(ZmAppViewMgr.C_APP_CONTENT);
			grandParentSize = {x: appContentBounds.width, y: appContentBounds.height};

			// set padding so we can add it to the day view's x-location since it is a child of the shell
			padding = appContentBounds.x;
		}

		var mvBounds = this.parent.getBounds();

		if (isRight) {
			var parentHeight = grandParentSize.y;
			var dvHeight = Math.floor(parentHeight / 3);
			var mvHeight = parentHeight - dvHeight;

			this._dayView.setBounds(mvBounds.x, mvHeight, mvBounds.width, dvHeight);
			// don't call DwtControl's setSize() since it triggers control
			// listener and leads to infinite loop
			Dwt.setSize(this.parent.getHtmlElement(), Dwt.DEFAULT, mvHeight);
		} else {
			var parentWidth = grandParentSize.x;
			var dvWidth = Math.floor(parentWidth / 3);
			var mvWidth = parentWidth - dvWidth;

			this._dayView.setBounds(mvWidth+padding, mvBounds.y, dvWidth, mvBounds.height);
			// don't call DwtControl's setSize() since it triggers control
			// listener and leads to infinite loop
			Dwt.setSize(this.parent.getHtmlElement(), mvWidth, Dwt.DEFAULT);
		}
	}
};

ZmInviteMsgView.prototype.addSubs =
function(subs, sentBy, sentByAddr) {

	subs.invite = this._invite;

	// counter proposal
	if (this._invite.hasCounterMethod() &&
		this._msg.folderId != ZmFolder.ID_SENT)
	{
		subs.counterInvMsg = AjxMessageFormat.format(ZmMsg.counterInviteMsg, [(sentBy && sentBy.name ) ? sentBy.name : sentByAddr]);
		subs.newProposedTime = this._invite.getProposedTimeStr();
	}
	// if this an action'ed invite, show the status banner
	else if (this._invite.hasAttendeeResponse()) {
        AjxDispatcher.require(["CalendarCore", "Calendar"]);
		var attendee = this._invite.getAttendees()[0];
		var ptst = attendee && attendee.ptst;
		if (ptst) {
			var dispName = attendee.d || attendee.a;
			subs.ptstIcon = ZmCalItem.getParticipationStatusIcon(ptst);

			switch (ptst) {
				case ZmCalBaseItem.PSTATUS_ACCEPT:
					subs.ptstMsg = AjxMessageFormat.format(ZmMsg.inviteMsgAccepted, [dispName]);
					subs.ptstClassName = "InviteStatusAccept";
					break;
				case ZmCalBaseItem.PSTATUS_DECLINED:
					subs.ptstMsg = AjxMessageFormat.format(ZmMsg.inviteMsgDeclined, [dispName]);
					subs.ptstClassName = "InviteStatusDecline";
					break;
				case ZmCalBaseItem.PSTATUS_TENTATIVE:
					subs.ptstMsg = AjxMessageFormat.format(ZmMsg.inviteMsgTentative, [dispName]);
					subs.ptstClassName = "InviteStatusTentative";
					break;
			}

			// set an Id for adding more detailed info later
			subs.ptstId = this._ptstId = (this._htmlElId + "_ptst");
		}
	}

	var om = this.parent._objectManager;

	// organizer
	var org = new AjxEmailAddress(this._invite.getOrganizerEmail(), null, this._invite.getOrganizerName());
	subs.invOrganizer = om ? om.findObjects(org, true, ZmObjectManager.EMAIL) : org.toString();

	// sent-by
	var sentBy = this._invite.getSentBy();
	if (sentBy) {
		subs.invSentBy = om ? om.findObjects(sentBy, true, ZmObjectManager.EMAIL) : sentBy.toString();
	}

	// inviteees
	var str = [];
	var j = 0;

	var list = this._invite.getAttendees();
	for (var i = 0; i < list.length; i++) {
		var at = list[i];
		var attendee = new AjxEmailAddress(at.a, null, at.d);
		str[j++] = om ? om.findObjects(attendee, true, ZmObjectManager.EMAIL) : attendee.toString();
	}
	subs.invitees = str.join(AjxEmailAddress.SEPARATOR);

	// convert to local timezone if necessary
	var sd, ed;
	var inviteTz = this._invite.getServerStartTimeTz();
	var defaultTz = AjxTimezone.getServerId(AjxTimezone.DEFAULT);

	if (inviteTz != defaultTz) {
		sd = this._invite.getServerStartDate();
		ed = this._invite.getServerEndDate();
		var offset1 = AjxTimezone.getOffset(AjxTimezone.DEFAULT, sd);
		var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(inviteTz), sd);
		sd.setTime(sd.getTime() + (offset1 - offset2)*60*1000);
		ed.setTime(ed.getTime() + (offset1 - offset2)*60*1000);
	}
	subs.timezone = AjxTimezone.getMediumName(defaultTz);

	// duration text
	var durText = this._invite.getDurationText(null, null, null, true, sd, ed);
	subs.invDate = om ? om.findObjects(durText, true, ZmObjectManager.DATE) : durText;

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

ZmInviteMsgView.prototype.truncateBodyContent =
function(content, isHtml) {
	var sepIdx = content.indexOf(ZmItem.NOTES_SEPARATOR);
	return isHtml
		? (content.substring(content.indexOf(">", sepIdx)+1))
		: (content.substring(sepIdx+ZmItem.NOTES_SEPARATOR.length));
};

ZmInviteMsgView.prototype._getCounterToolbar =
function() {
	var params = {
		parent: this.parent,
		buttons: [ZmOperation.ACCEPT_PROPOSAL, ZmOperation.DECLINE_PROPOSAL],
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmInviteToolBar",
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

ZmInviteMsgView.prototype._getInviteToolbar =
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
		context: this.mode,
		toolbarType: ZmId.TB_INVITE
	};
	var tb = new ZmButtonToolBar(params);

	var listener = new AjxListener(this, this._inviteToolBarListener);
	for (var i = 0; i < tb.opList.length; i++) {
		var id = tb.opList[i];

		tb.addSelectionListener(id, listener);

		if (id == ZmOperation.PROPOSE_NEW_TIME) { continue; }

		var button = tb.getButton(id);
		var standardItems = [notifyOperationButtonIds[i], replyButtonIds[i], ignoreOperationButtonIds[i]];
		var menu = new ZmActionMenu({parent:button, menuItems:standardItems});
		standardItems = menu.opList;
		for (var j = 0; j < standardItems.length; j++) {
			var menuItem = menu.getItem(j);
			menuItem.addSelectionListener(listener);
		}
		button.setMenu(menu);
	}

	this._respondOnBehalfLabel = tb.addFiller();
	tb.addFiller();

	// folder picker
	var label = this._inviteMoveLabel = new DwtText({parent: tb, className: "DwtText InviteSelectLabel"});
	label.setSize(100, DwtControl.DEFAULT);
	label.setText(ZmMsg.calendarLabel);
	tb.addSpacer();
	this._inviteMoveSelect = new DwtSelect({parent:tb});

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
function(invitedHour, list, skipMiniCalUpdate, query) {
	this._dayView.set(list, true);
	this._dayView._scrollToTime(invitedHour);
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
