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
		appt: null
	},

	initialize: function() {

		this.element.on({
			tap: function(e) {
				var target = e.event.actionTarget || e.event.target,
					elm = Ext.fly(target);

				var apptBody = Ext.getCmp(e.delegatedTarget.id),
					appt = apptBody.getAppt(),
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
					hidden: true,
					disabled: true
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

	 setPanel: function(msg, event) {
		var invite = msg.get('invite'),
			dateFormat = invite.get('isAllDay') ? ZtMsg.invDateFormat : ZtMsg.invDateTimeOnlyFormat,
			startTime = Ext.Date.format(event.get('start'), dateFormat),
			endTime = Ext.Date.format(event.get('end'), ZtMsg.invTimeOnlyFormat),
			myResponse = invite.get('myResponse'),
			displayStatus = this.getShowAsOptionLabel(invite.get('fb')),
			apptColor, apptRgbColor, calFolderName;

		var calFolder = ZCS.cache.get(event.get('folderId'));

		if (calFolder) {
			apptColor = calFolder.get('color');
			apptRgbColor = calFolder.get('rgb');
			calFolderName = calFolder.get('displayName');
		}

		var idParams = {
				objType:	ZCS.constant.OBJ_INVITE,
				msgId:	  msg.get('id')
			},
			data = {
				title:  invite.get('subject'),
				start:  startTime + (invite.get('isAllDay') ? "" : " - " + endTime),
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
				invDeclineButtonId:	ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_DECLINE }, idParams))
			},
			tpl,html,me;

		tpl = Ext.create('Ext.XTemplate', ZCS.template.ApptViewDesc);
		html = tpl.apply(data);

		var apptView = this.getInnerAt(1);
		apptView.setHtml(html);
		this.setAppt(msg);
	 },

	getShowAsOptionLabel : function(value) {
		for (var i = 0; i < ZCS.constant.SHOWAS_OPTIONS.length; i++) {
			var option = ZCS.constant.SHOWAS_OPTIONS[i];
			if (option.value == value) {
				return option.label;
			}
		}
	}
});
