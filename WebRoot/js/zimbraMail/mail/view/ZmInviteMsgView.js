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
		this._inviteToolbar.setVisible(Dwt.DISPLAY_NONE);
		this._inviteToolbar.reparentHtmlElement(this.parent.getHtmlElement());
	}
	this._hasInviteToolbar = false;

	if (this._dayView) {
		this._dayView.setDisplay(Dwt.DISPLAY_NONE);
	}
};

ZmInviteMsgView.prototype.isActive =
function() {
	return this._hasInviteToolbar;
};

ZmInviteMsgView.prototype.set =
function(msg) {
	this._msg = msg;
	var invite = this._invite = msg.invite;

	var isCounterInvite = !invite.isEmpty() && invite.hasCounterMethod();

	if (!invite.isEmpty() &&
		invite.hasAcceptableComponents() &&
		(invite.hasInviteReplyMethod() || isCounterInvite) &&
		msg.folderId != ZmFolder.ID_TRASH && msg.folderId != ZmFolder.ID_SENT)
	{
		var ac = window.parentAppCtxt || window.appCtxt;

		var tb = this._getInviteToolbar();
		tb.reparentHtmlElement(this.parent.getHtmlElement());
		this._setInviteOptions(invite);
		tb.setVisible(Dwt.DISPLAY_BLOCK);

		if (this._respondOnBehalfLabel) {
			this._respondOnBehalfLabel.innerHTML = msg.cif
				? AjxMessageFormat.format(ZmMsg.onBehalfOfText, [msg.cif]) : "";
			Dwt.setVisible(this._respondOnBehalfLabel, new Boolean(msg.cif));
		}

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
		this._hasInviteToolbar = true;
	}
};

ZmInviteMsgView.prototype.showFreeBusy =
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

	if (reset) {
		isRight
			? this.parent.setSize(Dwt.DEFAULT, this.parent.parent.getSize().y)
			: this.parent.setSize(this.parent.parent.getSize().x, Dwt.DEFAULT);
	} else {
		var mvBounds = this.parent.getBounds();

		if (isRight) {
			var parentHeight = this.parent.parent.getSize().y;
			var dvHeight = Math.floor(parentHeight / 3);
			var mvHeight = parentHeight - dvHeight;

			this._dayView.setBounds(mvBounds.x, mvHeight, mvBounds.width, dvHeight);
			// don't call DwtControl's setSize() since it triggers control
			// listener and leads to infinite loop
			Dwt.setSize(this.parent.getHtmlElement(), Dwt.DEFAULT, mvHeight);
		} else {
			var parentWidth = this.parent.parent.getSize().x;
			var dvWidth = Math.floor(parentWidth / 3);
			var mvWidth = parentWidth - dvWidth;

			this._dayView.setBounds(mvWidth, mvBounds.y, dvWidth, mvBounds.height);
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
	if ((this._invite.type != "task") && this._invite.hasCounterMethod() &&
		this._msg.folderId != ZmFolder.ID_SENT)
	{
		subs.counterInvMsg = AjxMessageFormat.format(ZmMsg.counterInviteMsg, [(sentBy && sentBy.name ) ? sentBy.name : sentByAddr]);
		subs.newProposedTime = this._invite.getProposedTimeStr();
	}

	var om = this.parent._objectManager;

	// organizer
	var org = new AjxEmailAddress(this._invite.getOrganizerEmail(), null, this._invite.getOrganizerName());
	subs.invOrganizer = om ? om.findObjects(org, true, ZmObjectManager.EMAIL) : om.toString();

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

	// invite date
	var durText = this._invite.getDurationText(null,null,null,true);
	subs.invDate = om ? om.findObjects(durText, true, ZmObjectManager.DATE) : durText;
};

ZmInviteMsgView.prototype.truncateBodyContent =
function(content, isHtml) {
	var sepIdx = content.indexOf(ZmItem.NOTES_SEPARATOR);
	return isHtml
		? (content.substring(content.indexOf(">", sepIdx)+1))
		: (content.substring(sepIdx+ZmItem.NOTES_SEPARATOR.length));
};

ZmInviteMsgView.prototype._getInviteToolbar =
function() {
	if (this._inviteToolbar) { return this._inviteToolbar; }

	var operationButtonIds = this._getInviteOps();

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
	var params = {
		parent: this.parent,
		buttons: operationButtonIds,
		posStyle: DwtControl.STATIC_STYLE,
		className: "ZmInviteToolBar",
		buttonClassName: "DwtToolbarButton",
		context: this.mode,
		toolbarType: ZmId.TB_INVITE
	};
	this._inviteToolbar = new ZmButtonToolBar(params);

	var listener = new AjxListener(this, this._inviteToolBarListener);
	operationButtonIds = this._inviteToolbar.opList;
	for (var i = 0; i < operationButtonIds.length; i++) {
		var id = operationButtonIds[i];

		// HACK: IE doesn't support multiple classnames.
		var button = this._inviteToolbar.getButton(id);
		button._hoverClassName = button._className + "-" + DwtCssStyle.HOVER;
		button._activeClassName = button._className + "-" + DwtCssStyle.ACTIVE;

		this._inviteToolbar.addSelectionListener(id, listener);

		if (id == ZmOperation.ACCEPT_PROPOSAL || id == ZmOperation.DECLINED_PROPOSAL) {
			button.setVisible(false);
		}

		if (id == ZmOperation.PROPOSE_NEW_TIME ||
			id == ZmOperation.ACCEPT_PROPOSAL ||
			id == ZmOperation.DECLINE_PROPOSAL)
		{
			continue;
		}

		var standardItems = [notifyOperationButtonIds[i], replyButtonIds[i], ignoreOperationButtonIds[i]];
		var menu = new ZmActionMenu({parent:button, menuItems:standardItems});
		standardItems = menu.opList;
		for (var j = 0; j < standardItems.length; j++) {
			var menuItem = menu.getItem(j);
			menuItem.addSelectionListener(listener);
		}
		button.setMenu(menu);
	}

	this._respondOnBehalfLabel = this._inviteToolbar.addFiller();
	this._inviteToolbar.addFiller();

	var label = this._inviteMoveLabel = new DwtText({parent: this._inviteToolbar, className: "DwtText InviteSelectLabel"});
	label.setSize(100, DwtControl.DEFAULT);
	label.setText(ZmMsg.calendarLabel);

	this._inviteToolbar.addSpacer();
	this._inviteMoveSelect = new DwtSelect({parent:this._inviteToolbar});

	return this._inviteToolbar;
};

ZmInviteMsgView.prototype._getInviteOps =
function() {
    return [
		ZmOperation.REPLY_ACCEPT,
		ZmOperation.REPLY_TENTATIVE,
		ZmOperation.REPLY_DECLINE,
		ZmOperation.PROPOSE_NEW_TIME,
		ZmOperation.ACCEPT_PROPOSAL,
		ZmOperation.DECLINE_PROPOSAL
	];
};

ZmInviteMsgView.prototype._inviteToolBarListener =
function(ev) {
	ev._inviteReplyType = ev.item.getData(ZmOperation.KEY_ID);
	var folderId = ZmOrganizer.ID_CALENDAR;
	if (this._inviteMoveSelect && this._inviteMoveSelect.getValue()) {
		folderId = this._inviteMoveSelect.getValue();
	}
	ev._inviteReplyFolderId = folderId;
	ev._inviteComponentId = null;
	ev._msg = this._msg;
	this.parent.notifyListeners(ZmInviteMsgView.REPLY_INVITE_EVENT, ev);
};

ZmInviteMsgView.prototype._setInviteOptions =
function(invite) {
	var operationButtonIds = this._getInviteOps();
	var proposeTimeIds = {};
	proposeTimeIds[ZmOperation.ACCEPT_PROPOSAL] = true;
	proposeTimeIds[ZmOperation.DECLINE_PROPOSAL] = true;

	for (var i in operationButtonIds) {
		var id = operationButtonIds[i];
		var button = this._inviteToolbar.getButton(id);
		if (invite.hasCounterMethod()) {
			button.setVisible(Boolean(proposeTimeIds[id]));
		} else {
			button.setVisible(!Boolean(proposeTimeIds[id]));
		}
	}
};

ZmInviteMsgView.prototype._dayResultsCallback =
function(invitedHour, list, skipMiniCalUpdate, query) {
	this._dayView.set(list, true);
	this._dayView._scrollToTime(invitedHour);
};

