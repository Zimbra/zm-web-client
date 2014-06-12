Ext.define('ZCS.view.calendar.ZtAppointmentForm', {

	extend: 'Ext.form.Panel',

	xtype: 'appointmentpanel',

	config: {
		itemId: 'appointmentPanel',
		layout: 'vbox',
		centered: true,
		width: '100%',
		height: '100%',
		hidden: true,
		modal: true,
		style: 'background-color: white;',   // TODO: move styles to a class
		title: null,
		app: null,
		msg: null
	},

	initialize: function() {

		this.element.on({
			tap: function(e) {
				var target = e.event.actionTarget || e.event.target,
					elm = Ext.fly(target);

				var apptBody = Ext.getCmp(e.delegatedTarget.id),
				// Note: elm.getId() hits NPE trying to cache DOM ID, so use elm.dom.id
					idParams = ZCS.util.getIdParams(elm.dom.id) || {};

				// address bubble
				if (idParams.objType === ZCS.constant.OBJ_ADDRESS) {
					apptBody.fireEvent('contactTap', elm, {
						menuName:	ZCS.constant.MENU_CALENDAR_ADDRESS,
						address:	idParams.address,
						name:		idParams.name,
						addrObj:	idParams.addrObj
					});
					return true;
				}
                // attachment bubble
                if (idParams.objType === ZCS.constant.OBJ_ATTACHMENT) {
                    apptBody.fireEvent('attachmentTap', elm);
                    return false;
                }

				//Stop this event from triggering a scroll reset.
				e.preventDefault();
				return false;
			}
		});

		var toolbar = {
			xtype: 'toolbar',
			cls: 'zcs-item-titlebar',
			docked: 'top',
			itemId: 'apptToolbar',
			items: [
				{
					xtype: 'button',
					align: 'left',
					iconCls: 'back',
					handler: function() {
						this.up('appointmentpanel').fireEvent('cancel');
					}
				},
				{
					xtype: 'spacer'
				},
				{
					xtype: 'button',
					iconCls: 'edit',
					id: 'editAppt',
                    handler: function() {
                        this.up('appointmentpanel').fireEvent('onButtonTap');
                    }
				},
				{
					xtype: 'button',
					iconCls: 'trash',
					id: 'deleteAppt',
					handler: function() {
						this.up('appointmentpanel').fireEvent('onButtonTap');
					}
				},
				{
					xtype: 'button',
					iconCls: 'arrow_down',
					id: 'inviteActionsAppt',
					menuName: ZCS.constant.MENU_INVITE_ACTIONS,
					handler: function() {
						this.up('appointmentpanel').fireEvent('onButtonTap');
					}
				},
				{
					xtype: 'button',
					iconCls: 'arrow_down',
					id: 'apptActions',
					disabled: true,
					hidden: true,
					menuName: ZCS.constant.MENU_APPT_ACTIONS,
					handler: function() {
						this.up('appointmentpanel').fireEvent('onButtonTap');
					}
				}
			]
		};

		var titleBar = {
			xtype: 'component',
			itemId: 'apptTitleOnlyBar',
			cls: 'zcs-conv-title-bar'
		};

		var itemView = {
			xtype: 'container',
			flex: 1,
			itemId: 'apptDetails',
			scrollable: { direction: 'vertical'}
		};

		this.add([toolbar, titleBar, itemView]);
	},

	setPanel: function(msg, isSeries, isEdit) {
		var invite = msg.get('invite'),
            event = ZCS.app.getCalendarController().getEvent(),
			start = invite.get('start'),
			startTime = Ext.Date.format(start, ZtMsg.invTimeFormat),
			end = invite.get('end'),
			// There might not be end date for all day events sync'd from external sources
			endTime = end && Ext.Date.format(end, ZtMsg.invTimeFormat),
            eventDate = isSeries ? Ext.Date.format(start, ZtMsg.dayViewDateFormat) :
                Ext.Date.format(event.get('start'),ZtMsg.dayViewDateFormat),
			myResponse = invite.get('myResponse'),
			displayStatus = this.getShowAsOptionLabel(invite.get('fb')),
			apptColor, apptRgbColor, calFolderName,
            me = this,
			isMultiDay = end && ZCS.util.isMultiDay(start, end),
			isAllDay = invite.get('isAllDay'),
			apptTitleString = '';

		var calFolder = ZCS.session.getOrganizerModel(invite.get('apptFolderId'));

		if (calFolder) {
			apptColor = calFolder.get('color');
			apptRgbColor = calFolder.get('rgb');
			calFolderName = calFolder.get('displayName');
		}

		if (isMultiDay) {
			// If appt is multiday & all day then show start and end dates without respective timings
			// else for normal multiday appt show start and end dates with respective timings
			var formattedStart = Ext.Date.format(event.get('start'), ZtMsg.dayViewDateFormat),
				formattedEnd = Ext.Date.format(event.get('end'), ZtMsg.dayViewDateFormat),
				startStr = !isAllDay ? startTime + ", " + formattedStart : formattedStart,
				endStr = !isAllDay ? endTime + ", " + formattedEnd : formattedEnd;

			apptTitleString = startStr + " " + ZtMsg.to + " " + endStr;
		}
		else {
			apptTitleString = isAllDay ? eventDate : (startTime + " " + ZtMsg.to + " " + endTime + ", " + eventDate);
		}

		var idParams = {
				objType:	ZCS.constant.OBJ_INVITE,
				msgId:	  msg.get('id')
			},
			data = {
				title:  invite.get('subject'),
				start:  apptTitleString,
				location: invite.get('location'),
				isOrganizer: invite.get('isOrganizer'),
				organizer: ZCS.model.mail.ZtMailItem.convertAddressModelToObject(invite.get('organizer')),
                attendees: ZCS.model.mail.ZtMailItem.convertAddressModelToObject(invite.get('attendees')),
				optAttendees: ZCS.model.mail.ZtMailItem.convertAddressModelToObject(invite.get('optAttendees')),
				myResponse: myResponse ? ZCS.constant.PSTATUS_TEXT[myResponse] : '',
				calendar: calFolderName,
				color: apptColor ? apptColor : (apptRgbColor ? '' : '1'),
				rgb: apptRgbColor,
				reminder: invite.get('reminderAlert'), /* TODO: Get strings similar to Ajax Client */
				recurrence: invite.get('recurrence'),
				displayStatus: displayStatus,
				notes: invite.get('notes'),
				invAcceptButtonId:	 ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_ACCEPT }, idParams)),
				invTentativeButtonId:  ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_TENTATIVE }, idParams)),
				invDeclineButtonId:	ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_DECLINE }, idParams)),
                isException: invite.get('isException'),
                attachments: me.fetchAttachments(msg)
            },
			tpl,html,me;

		tpl = Ext.create('Ext.XTemplate', ZCS.template.ApptViewDesc);
		html = tpl.apply(data);

        var apptView = this.getInnerAt(1);
        apptView.setHtml(html);
        this.setMsg(msg);
    },

	getShowAsOptionLabel : function(value) {
		for (var i = 0; i < ZCS.constant.SHOWAS_OPTIONS.length; i++) {
			var option = ZCS.constant.SHOWAS_OPTIONS[i];
			if (option.value == value) {
				return option.label;
			}
		}
	},

    /**
     * Returns an array of attachments to be displayed below the appointment details.
     */
    fetchAttachments: function(msg) {
        var attachments = msg.getAttachmentInfo(),
            attachArr = [],
            ln = attachments.length;

        if (ln > 0) {
            for (var i = 0; i < ln; i++) {
                var attInfo = attachments[i],
                    id = ZCS.util.getUniqueId({
                        objType:    ZCS.constant.OBJ_ATTACHMENT,
                        url:        attInfo.url
                    });

                attInfo.id = id;
                attachArr.push(attInfo);
            }
        }
        return attachArr;
    }
});
