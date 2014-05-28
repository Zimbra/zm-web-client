/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class represents a controller that manages calendar.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.controller.calendar.ZtCalendarController', {

    extend: 'ZCS.controller.ZtItemController',

    requires: [
        'Ext.ux.TouchCalendarEventsBase',
        'Ext.ux.TouchCalendarMonthEvents',
        'Ext.ux.TouchCalendarWeekEvents',
        'Ext.ux.TouchCalendarDayEvents',
        'Ext.ux.TouchCalendarEvents',
        'Ext.ux.TouchCalendarSimpleEvents',
        'Ext.ux.TouchCalendarView',
        'Ext.ux.TouchCalendar',
        'ZCS.view.calendar.ZtCalendarToolbar',
        'ZCS.view.calendar.ZtAppointmentForm',
	    'ZCS.view.calendar.ZtAppointmentDialog'
    ],

    config: {

        models: ['ZCS.model.calendar.ZtCalendar'],

        stores: ['ZCS.store.calendar.ZtCalendarStore'],

        views: [
            'ZCS.view.calendar.ZtCalendarView'
        ],

        refs: {
            overview: '#' + ZCS.constant.APP_CALENDAR + 'overview',
            itemPanel: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel',
            calendarView: ZCS.constant.APP_CALENDAR + 'itemview',
            calMonthView: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel #calMonthView',
            calDayView: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel #calDayView',
            itemPanelTitleBar: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel titlebar',
            calToolbar: 'appview #' + ZCS.constant.APP_CALENDAR + 'itempanel caltoolbar',
            appointmentPanel : 'appointmentpanel',
			appointmentTitleBar:  'appointmentpanel #apptTitleOnlyBar',
			appointmentToolbar: 'appointmentpanel #apptToolbar',
			appointmentView : 'appointmentpanel #apptDetails',
			calendarAddressActionsMenu: 'list[itemId=calendarAddressActionsMenu]',
			inviteReplyActionsMenu: 'list[itemId=inviteReplyActionsMenu]',
			appointmentActionsMenu: 'list[itemId=apptActionsMenu]',
	        appointmentDialog: 'appointmentdialog'
		},

        control: {
			overview: {
				search: 'doSearch'
			},
            calendarView: {
                eventtap: 'onEventTap',
                selectionchange: 'onTimeSlotChange'
			},
            calMonthView: {
                periodchange: 'onPeriodChange'
            },
			appointmentPanel: {
				cancel:             'doCancel',
				contactTap:         'showMenu',
                attachmentTap:      'doShowAttachment'
            },
			'appointmentpanel toolbar button[iconCls=inviteReply]': {
				tap: 'onApptActionsButtonTap'
			},
            'appointmentpanel toolbar button[iconCls=edit]': {
                tap:       'onApptActionsButtonTap'
            },
			'appointmentpanel toolbar button[iconCls=arrow_down]': {
				tap: 'onApptActionsButtonTap'
			},
	        'appointmentpanel toolbar button[iconCls=trash]': {
		        tap: 'onApptActionsButtonTap'
	        },
			calendarAddressActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			inviteReplyActionsMenu: {
				itemtap:            'onMenuItemSelect'
			},
			apptActionsMenu: {
				itemtap:            'onMenuItemSelect'
			}
        },

        app: ZCS.constant.APP_CALENDAR,

        event: null,

	    isSeries: false
    },

    launch: function() {

	    if (!ZCS.util.isAppEnabled(this.getApp())) {
		    return;
	    }

        this.callParent();

        ZCS.app.on('notifyAppointmentDelete', this.handleDeleteNotification, this);
        ZCS.app.on('notifyAppointmentChange', this.handleModifyNotification, this);
        ZCS.app.on('notifyAppointmentCreate', this.handleCreateNotification, this);

        //Create a toolbar with calendar view buttons - Month, Day and Today
        this.createToolbar();
    },

    /*
     * Loads the appointments on application switch
     */
    loadCalendar: function(loadRange) {
        var defaultQuery = this.getDefaultQuery(),
            me = this,
	        loadRange = loadRange || false,
	        currentEvent = this.getEvent(),
	        rangeStart,
	        rangeEnd;

	    if (loadRange && currentEvent) {
		    var eventStart = Ext.Date.getFirstDateOfMonth(currentEvent.get('start'));
		    // Fetches events of past 1 month from current events start date
			rangeStart = eventStart.setMonth(eventStart.getMonth() - 1);

			var eventEnd = Ext.Date.getLastDateOfMonth(currentEvent.get('end'));
		    // Fetches events of next 1 month from current events end date
			rangeEnd = eventEnd.setMonth(eventEnd.getMonth() + 1);
	    }

        //Set the proxies params so this parameter persists between paging requests.
        this.getStore().getProxy().setExtraParams({
            query: defaultQuery
        });

        this.getStore().load({
            calStart: loadRange ? rangeStart : this.getMonthStartTime(),
            calEnd: loadRange ? rangeEnd : this.getMonthEndTime(),
            query: defaultQuery,
            callback: function(records, operation, success) {
                if (success) {
                    // Fix for bug: 83607
                    me.refreshCurrentView();
                }
            }
        });
    },

    /*
     * Refreshes and reloads default/last selected calendar view
     */
    refreshCurrentView: function() {
        var monthView = this.getCalMonthView(),
            dayView = this.getCalDayView();

        monthView.view.refreshDelta(0);
        dayView.view.refreshDelta(0);
    },

    /*
     * Invokes when an appointment is tapped
     *
     * @param {ZCS.model.calendar.ZtCalendar} event The Event record that was tapped
     */
    onEventTap: function(event) {
        var msg = Ext.create('ZCS.model.mail.ZtMailMsg'),
            inviteId = event.get('invId'),
            start = event.get('start'),
            me = this;

	    this.setEvent(event);

	    if (!event.get('isException') && event.get('isRecur')) {
		    var actionDialog = this.getAppointmentDialog();
		    actionDialog.show();
	    }
	    else {
		    msg.save({
			    op: 'load',
			    id: inviteId,
			    apptView: true,
			    ridZ: start,
			    success: function(record) {
				    me.showItem(record);
			    }
		    });
	    }
    },

    /**
     * Show appoinment view panel, by sliding it up on an overlay
     * @param {ZCS.model.calendar.ZtCalendar} event The Event record that was tapped
     */

    showItem: function(msg, isSeries, isEdit) {
		var panel = this.getAppointmentPanel(),
            invite = msg.get('invite'),
            title = Ext.String.htmlEncode(invite.get('subject') || ZtMsg.noSubject),
            calFolder = ZCS.cache.get(invite.get('apptFolderId')),
            isFeed = calFolder && calFolder.isFeed();

	    this.setIsSeries(isSeries);

        panel.setPanel(msg, isSeries, isEdit);

        this.updateToolbar({isOrganizer: invite.get('isOrganizer'), isFeed: isFeed});
        panel.show({
            type:       'slide',
            direction:  'left',
            duration:   250
        });
	    this.updateTitle({title:title});
    },

    updateToolbar: function(params) {

        params = params || {};
		var app = ZCS.util.getAppFromObject(this),
			hideAll = !this.getItem() || params.hideAll || params.isOrganizer;

		Ext.each(ZCS.constant.ITEM_BUTTONS[app], function(button) {
			this.showButton(button.op, !hideAll);
		}, this);

		// Show the ATD options only in case of attendees
		if (params.isOrganizer) {
			Ext.getCmp('inviteActionsAppt').hide();
		} else {
			Ext.getCmp('inviteActionsAppt').show();
		}

        if (params.isFeed) {
            Ext.getCmp('editAppt').hide();
            Ext.getCmp('deleteAppt').hide();
        } else {
            Ext.getCmp('editAppt').show();
            Ext.getCmp('deleteAppt').show();
        }
    },

	updateTitle: function(params) {
		var apptTitleBar = this.getAppointmentTitleBar(),
			apptView = this.getAppointmentView(),
			apptViewInner = apptView.element.down('.x-innerhtml');

		if (apptTitleBar && params && params.title != null) {
			apptTitleBar.setHtml(params.title);
			if (params.title) {
				apptTitleBar.show();
			} else {
				apptTitleBar.hide();
			}
		}

		// Add padding inside scroll inner so items start below transparent titlebar
		var titleHeight = apptTitleBar.element.getHeight();
		apptViewInner.setStyle({ paddingTop: titleHeight + 'px' });
	},

	/**
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
	updateMenuLabels: function(menuButton, params, menu) {

		var menuName = params.menuName;

		if (menuName === ZCS.constant.MENU_CALENDAR_ADDRESS) {
			// Hiding/showing address listitems instead of changing labels
			menu.hideItem(ZCS.constant.OP_ADD_CONTACT, true);
			menu.hideItem(ZCS.constant.OP_EDIT, true);

			// Pick which listitem to show, only if contacts app is enabled
			if (ZCS.util.isAppEnabled(ZCS.constant.APP_CONTACTS)) {
				var addr = params.addrObj,
					cachedAddr = ZCS.cache.get(addr && addr.get('email'), 'email');

				if (cachedAddr) {
					menu.hideItem(ZCS.constant.OP_EDIT, false);
				} else {
					menu.hideItem(ZCS.constant.OP_ADD_CONTACT, false);
				}
			}
		}
	},

    onTimeSlotChange: function(view, newDate, oldDate) {
        //Switch to the day view if user taps on a particular date in month view
        ZCS.app.getCalendarController().toggleCalView('day', newDate);
    },

    getDefaultQuery: function() {
		var folders = ZCS.session.getOrganizerData(ZCS.constant.APP_CALENDAR, ZCS.constant.ORG_FOLDER),
		 	calFolders = [];

		Ext.each(folders, function(folder) {
            if (folder.zcsId !== ZCS.constant.ID_TRASH) {
                calFolders.push("inid:" + folder.zcsId);
                Ext.each(folder.items, function(child) {
                    //subfolders, if any
                    calFolders.push("inid:" + child.zcsId)
                }, this);
            }
		} , this);

		return calFolders.join(' OR ');
    },

    createToolbar: function() {
        this.getItemPanelTitleBar().add(Ext.create('ZCS.view.calendar.ZtCalendarToolbar', {
            newButtonIcon: ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CALENDAR]
        }));
    },

    getMonthStartTime: function() {
        var weekStart = this.getCalMonthView().getViewConfig().weekStart,
            firstDay = new Date().setDate(1),  //Month starts with 1
            firstDayDate = new Date(firstDay),
            today = new Date(firstDay).getDay(),
            daysToSubtract = today - weekStart;

        return this.getTimeStamp(firstDayDate, -daysToSubtract);
    },

    getMonthEndTime: function() {
        var daysInWeek = 7,
            weekStart = this.getCalMonthView().getViewConfig().weekStart,
            month = new Date().getMonth(), //Starts from 0 as January
            year = new Date().getFullYear(),
            lastDayDate = new Date(year, month + 1, 0),
            daysToAdd = (daysInWeek + weekStart) - 1;

        return this.getTimeStamp(lastDayDate, daysToAdd);
    },

    getTimeStamp: function(date, daysToAdjust) {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + daysToAdjust,
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ).getTime();
    },

    /**
     * Handler for the calendar's periodchange event.
     *
     * @param {Ext.ux.TouchCalendarView} view The underlying Ext.ux.TouchCalendarView instance
     * @param {Date} minDate The min date of the new period
     * @param {Date} maxDate The max date of the new period
     * @param {String} direction The direction the period change moved.
     */
    onPeriodChange: function(view, minDate, maxDate, direction) {
        this.getStore().load({
            calStart: minDate.getTime(),
            calEnd: maxDate.getTime() + 172800000, // Fetch two days extra
            callback: function(records, operation, success) {
                if (success) {
                    view.refresh();
                }
            }
        });
    },

    toggleCalView: function(viewToShow, date) {
        var monthView = this.getCalMonthView(),
            dayView = this.getCalDayView();

        if (!date) {
            switch(viewToShow) {
                case 'month':
                    monthView.show();
                    this.getCalToolbar().down('#monthBtn').setCls('x-button-pressed');
                    dayView.hide();
                    this.getCalToolbar().down('#dayBtn').removeCls('x-button-pressed');
                    break;

                case 'day':
                    dayView.show();
                    this.getCalToolbar().down('#dayBtn').setCls('x-button-pressed');
                    monthView.hide();
                    this.getCalToolbar().down('#monthBtn').removeCls('x-button-pressed');
                    //Ensure that the day view is for the month user navigated to
                    dayView.updateViewMode('day', monthView.view.currentDate);
                    break;
            }
        }
        else {
            dayView.show();
            this.getCalToolbar().down('#dayBtn').setCls('x-button-pressed');
            monthView.hide();
            this.getCalToolbar().down('#monthBtn').removeCls('x-button-pressed');
            this.setDayViewConfig(date);
        }
    },

    goToday: function() {
        var date = new Date(),
            monthView = this.getCalMonthView(),
            dayView = this.getCalDayView();
        if (!monthView.isHidden()) {
            this.getCalMonthView().updateViewMode('month', date);
        } else if (!dayView.isHidden()) {
            this.getCalDayView().updateViewMode('day', date);
        }
    },

    setDayViewConfig: function(date) {
        this.getCalDayView().updateViewMode('day', date);
    },

	doAccept: function(actionParams) {
		this.doInviteReply(ZCS.constant.OP_ACCEPT, actionParams.msg);
	},

	doTentative: function(actionParams) {
		this.doInviteReply(ZCS.constant.OP_TENTATIVE, actionParams.msg);
	},

	doDecline: function(actionParams) {
		this.doInviteReply(ZCS.constant.OP_DECLINE, actionParams.msg);
	},
    /**
     * Sends the attendee response as a notification to the organizer
     */
    doInviteReply: function(action, apptMsg) {
        var invite = apptMsg.get('invite'),
			invId =  apptMsg.get('id'),
            msg = Ext.create('ZCS.model.mail.ZtMailMsg'),
	        isSeries = this.getIsSeries(),
	        invReplySubject = ZCS.constant.INVITE_REPLY_PREFIX[action] + ": " + invite.get('subject');

        msg.set('origId', invId);  //not sure if origId should be set to invite id
        msg.set('inviteAction', action);
        msg.set('replyType', 'r');

        msg.set('subject', invReplySubject);

        var from = ZCS.mailutil.getFromAddress();
        msg.addAddresses(from);

        if (!invite.get('isOrganizer')) {
            var	organizer = invite.get('organizer'),
                organizerEmail = organizer && organizer.get('email'),
                toEmail = organizerEmail || invite.get('sentBy');

            if (toEmail) {
                msg.addAddresses(ZCS.model.mail.ZtEmailAddress.fromEmail(toEmail, ZCS.constant.TO));
            }
        }

        var replyBody = invite.getSummary(true) + ZCS.constant.INVITE_REPLY_TEXT[action] + '<br><br>';

        msg.createMime(replyBody, true);
        var me = this;
        msg.save({
            isInviteReply: true,
	        isSeries: isSeries,
	        ridZ: this.getEvent().get('ridZ'),
	        isCalApp: true,
            success: function () {
                me.getAppointmentPanel().hide();
                ZCS.app.fireEvent('showToast', ZtMsg.invReplySent);
            }
        });
    },

    doEdit: function(actionParams) {
        ZCS.app.getAppointmentController().showNewApptForm(ZCS.constant.OP_EDIT, actionParams.msg, actionParams.event);
    },

	doDelete: function(actionParams) {
		var event = this.getEvent(),
			isSeries = this.getIsSeries(),
			isRecurring = event.get('isRecur'),
			msg = actionParams.msg,
			invite = msg.get('invite'),
			isOrganizer = invite.get('isOrganizer'),
			attendeeList = this.getAttendeeList(invite.get('attendees')),
			cancelReqObject = {},
			me = this,
			inTrash = ZCS.util.curFolderIs(ZCS.constant.ID_TRASH),
			inJunk = ZCS.util.curFolderIs(ZCS.constant.ID_JUNK),
			isHardDelete = false,
			isInstance = isRecurring && !isSeries;

		if (inTrash || inJunk) {
			cancelReqObject.action = {};
			cancelReqObject.action.id = invite.get('id');
			cancelReqObject.action.op = 'delete';
			isHardDelete = true;
		}
		else {
			// Common objects applicable to CancelAppointmentRequest
			cancelReqObject.comp = "0";
			cancelReqObject.id = event.get('invId');
			cancelReqObject.m = {};
			cancelReqObject.m.su = Ext.String.format(ZtMsg.apptCancelSubject, invite.get('subject'));
			cancelReqObject.m.e = [];
			cancelReqObject.m.mp = {};

			if ((!isInstance && isOrganizer) || (!isRecurring && isOrganizer)) {
				cancelReqObject.m.e = attendeeList;
				cancelReqObject.ms = event.get('ms');
				cancelReqObject.rev = event.get('rev');
			}
			else if ((!isInstance && !isOrganizer) || (!isRecurring && !isOrganizer)) {
				cancelReqObject.ms = event.get('ms');
				cancelReqObject.rev = event.get('rev');
			}
			else if (isInstance && isOrganizer) {
				cancelReqObject.inst = {};
				cancelReqObject.inst.d = event.get('ridZ');
				cancelReqObject.inst.tz = ZCS.timezone.guessMachineTimezone().clientId;

				cancelReqObject.ms = event.get('ms');
				cancelReqObject.rev = event.get('rev');

				cancelReqObject.s = event.get('start').getTime();

				cancelReqObject.m.e = attendeeList;
			}
			else if (isInstance && !isOrganizer) {
				cancelReqObject.inst = {};
				cancelReqObject.inst.d = event.get('ridZ');
				cancelReqObject.inst.tz = ZCS.timezone.guessMachineTimezone().clientId;

				cancelReqObject.s = event.get('start').getTime();
			}
		}

		msg.save({
			op: 'delete',
			hardDelete: isHardDelete,
			isApptRequest: true,
			cancelReqObject: cancelReqObject,
			success: function () {
				me.loadCalendar();
				Ext.Function.defer(function() {
					me.getAppointmentPanel().hide();
				}, 100);
				ZCS.app.fireEvent('showToast', isHardDelete ? ZtMsg.apptTrashDeleteToast : ZtMsg.apptCancelToast);
			}
		});
	},

	doMove: function(actionParams) {
		console.log("TODO: Move!!");
	},

	doTag: function(actionParams) {
		console.log("TODO: Tag!!");
	},

	/**
	 * Starts a new compose session.
	 *
	 * @param {String}  addr    email address of recipient (To: field)
	 */
	doCompose: function(actionParams) {
		var	toAddr = ZCS.model.mail.ZtEmailAddress.fromEmail(actionParams.address);
		this.getAppointmentPanel().hide();
		ZCS.app.getComposeController().showComposeForm([toAddr]);
	},

	doAddContact: function(actionParams) {
		var contactCtrl = ZCS.app.getContactController(),
			contact = ZCS.model.contacts.ZtContact.fromEmailObj(actionParams.addrObj);
		this.getAppointmentPanel().hide();
		contactCtrl.showContactForm(ZCS.constant.OP_COMPOSE, contact);
	},

	doEditContact: function(actionParams) {
		var contact = ZCS.cache.get(actionParams.addrObj.get('email'), 'email'),
			contactCtrl = ZCS.app.getContactController();
		contactCtrl.setItem(contact);
		this.getAppointmentPanel().hide();
		contactCtrl.showContactForm(ZCS.constant.OP_EDIT, contact);
	},

	doCancel: function() {
        this.getAppointmentPanel().hide({
            type:       'slide',
            direction:  'right',
            duration: 250
        });

		var apptTitleBar = this.getAppointmentTitleBar();
		apptTitleBar.setHtml("");
		apptTitleBar.hide();
	},

    doShowAttachment: function(el) {

        var idParams = ZCS.util.getIdParams(el.dom.id),
            url = idParams && idParams.url;

        if (url) {
            window.open(url, '_blank');
        }
    },

    onApptActionsButtonTap: function (button, e) {
		var apptPanel = this.getAppointmentPanel(),
			msg = apptPanel.getMsg(),
            event = this.getEvent();

		if (button.get('iconCls') == 'trash') {
			this.doDelete({msg: msg});
		} else if (button.get('iconCls') == 'edit') {
            this.doEdit({msg:msg, event:event});
        } else {
			this.showMenu(button, {
				menuName:   button.initialConfig ? button.initialConfig.menuName : undefined,
				msg:       msg
			});
		}
	},

	/**
	 * Searches for appointments in a particular calendar folder.
	 */
	doSearch: function(query, folder) {
		var me = this;

		//<debug>
		Ext.Logger.info('SearchRequest: ' + query);
		//</debug>

		this.getStore().currentPage = 1;

		//Set the proxy's params so this parameter persists between paging requests.
		this.getStore().getProxy().setExtraParams({
			query:  query
		});

		this.getStore().load({
            calStart: this.getMonthStartTime(),
            calEnd: this.getMonthEndTime(),
			query:      query,
			folder:     folder,
			scope:      this,
			callback: function(records, operation, success) {
				if (success) {
					me.refreshCurrentView();
				}
			}
		});

		ZCS.app.fireEvent('hideOverviewPanel');
	},

    /**
     * Refreshes the month and day view of calendar in case of a calendar
     * notification,i.e; in case an appointment is created or modified or deleted
     */
    refreshCalendar: function() {
        var monthView = this.getCalMonthView(),
            dayView = this.getCalDayView();

        monthView.view.refreshDelta(0);
        dayView.view.refreshDelta(0);

    },

    handleModifyNotification: function(item, modify) {
        this.refreshCalendar();
    },

    handleCreateNotification: function(item, create) {
        this.refreshCalendar();
    },

    handleDeleteNotification: function(item) {
        this.refreshCalendar();
    },

	appointmentDialogAction: function(isInstance) {
		var msg = Ext.create('ZCS.model.mail.ZtMailMsg'),
			event = this.getEvent(),
			inviteId = event.get('invId'),
			me = this,
			isSeries = !isInstance;

		msg.save({
			op: 'load',
			id: inviteId,
			apptView: true,
			ridZ: (isInstance ? event.get('ridZ') : null),
			success: function(record) {
				me.showItem(record, isSeries);
			}
		});
	},

	getAttendeeList: function(attendees) {
		if (!attendees) {
			return [];
		}

		var attendeeLen = attendees.length,
			i,
			attendeeList = [];

		for (i = 0; i < attendeeLen; i++) {
			attendeeList.push({
				a: attendees[i].get('email'),
				p: attendees[i].get('name'),
				t: 't'
			});
		}

		return attendeeList;
	}
});
