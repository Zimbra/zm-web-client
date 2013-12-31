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
 * This class represents a calendar view that can be used to create, edit or view an appointment.
 * The different views are presented depending upon the rights that the user has. ie. Organizer view or Attendee view.
 *
 * @author Piyush Waradpande <pwaradpande@zimbra.com>
 */

Ext.define('ZCS.view.calendar.ZtAppointmentView', {

    extend: 'Ext.navigation.View',

    xtype: ZCS.constant.APP_CALENDAR + 'appointmentview',

    config: {
        fullscreen: true,
        width: '50%',
        height: '80%',
        hidden: true,
        modal: true,
        centered: true,
        hideOnMaskTap: true,

        items: [
            {
                xtype: 'panel',
                scrollable: true,
                itemId: 'apptDetails'
            }
        ],
        listeners: {
            back: function (){
                this.getNavigationBar().setTitle(this.getTitle());
            },
            tap: {
                element: 'element',
                fn: function(e) {
                    var elm = Ext.fly(e.target),
                        idParams = ZCS.util.getIdParams(elm.dom.id) || {};
                    // invite response button (accept/tentative/decline)
                    if (elm.hasCls('zcs-invite-button')) {
                        this.fireEvent('inviteReply', idParams.msgId, idParams.action);
                    }
                }
            }
        },
        title: null
    },

    setPanel: function(msg, event) {
        var invite = msg.get('invite'),
            dateFormat = invite.get('isAllDay') ? ZtMsg.invDateFormat : ZtMsg.invDateTimeOnlyFormat,
            startTime = Ext.Date.format(event.get('start'), dateFormat),
            endTime = Ext.Date.format(event.get('end'), ZtMsg.invTimeOnlyFormat),
            organizer = invite.get('organizer') && invite.get('organizer').get('name'),
            location = invite.get('location'),
            attendees = invite.get('attendees'),
            isOrganizer = invite.get('isOrganizer'),
            stats = attendees && this.getAttendeeStats(attendees, isOrganizer),
            reminder = invite.get('reminderAlert'),
            recurrence = invite.get('recurrence'),
            myResponse = invite.get('myResponse'),
            idParams = {
	            objType:    ZCS.constant.OBJ_INVITE,
                msgId:      msg.get('id')
            },
            data = {
                start:  startTime + (invite.get('isAllDay') ? "" : " - " + endTime),
                location: invite.get('location'),
                organizer: organizer,
                attendees: stats && stats.summary,
                myResponse: myResponse ? ZCS.constant.PSTATUS_TEXT[myResponse] : '',
                calendar: null /* TODO: After other calendar folders are shown in touch client */,
                reminder: reminder ? reminder : "", /* TODO: Get strings similar to Ajax Client */
                recurrence: recurrence ? recurrence : "",
                notes: invite.get('notes'),
	            invAcceptButtonId:     ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_ACCEPT }, idParams)),
	            invTentativeButtonId:  ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_TENTATIVE }, idParams)),
	            invDeclineButtonId:    ZCS.util.getUniqueId(Ext.apply({}, { action: ZCS.constant.OP_DECLINE }, idParams))
            },
            apptTitle = invite.get('subject'),
            tpl,html,me;

        tpl = Ext.create('Ext.XTemplate', ZCS.template.ApptViewDesc);
        html = tpl.apply(data);

        this.setTitle(apptTitle);

        this.down('#apptDetails').setHtml(html);
        this.getNavigationBar().setTitle(apptTitle);

        if (attendees) {
            Ext.get("showAttendees").clearListeners();

            me = this;
            Ext.get("showAttendees").on({
                tap: function (ev) {
                    var listData = me.getListDataAsHtml(stats,isOrganizer),
                        list;
                    me.push({
                            title: ZtMsg.attendeesTitle,
                            xtype: 'list',
                            striped: true,
                            itemId: 'attendeeList',
                            fullscreen: true,
                            itemTpl: '{title}',
                            data: listData
                        });

                }
            })
        }

    },


    getListDataAsHtml: function(stats, isOrganizer) {

        var data = [],
            listItem = Ext.create('Ext.XTemplate', ZCS.template.ApptViewAttendeeList),
            i;

        for(i=0; i < stats.length; i++){
            data.push({
                title: listItem.apply({attendee: stats[i], isOrganizer: isOrganizer}
                )});
        }
        return data;
    },



    getAttendeeStats: function(attendees, isOrganizer) {

        var accepted = 0, declined = 0, tentative = 0, unknown = 0, stats=[], attendeeList = "", i, name;

        for (i=0 ; i < attendees.length; i++) {
            name = attendees[i].get('name') || attendees[i].get('email');
            attendeeList = attendeeList + name + ', ';

            stats.push({
                name: name,
                ptst: attendees[i].ptst
            });

            switch (attendees[i].ptst) {
                case ZCS.constant.PSTATUS_ACCEPTED:
                    ++accepted;
                    break;

                case ZCS.constant.PSTATUS_DECLINED:
                    ++declined;
                    break;

                case ZCS.constant.PSTATUS_TENTATIVE:
                    ++tentative;
                    break;

                case ZCS.constant.PSTATUS_UNKNOWN:
                    ++unknown;
                    break;
            }
        }
        if (isOrganizer) {
            stats.summary = ((accepted ? accepted + " " + ZtMsg.accepted : "")
                + (declined ? ", " + declined + " " + ZtMsg.declined: "")
                + (tentative ? ", " + tentative + " " + ZtMsg.tentative : "")
                + (unknown ? ", " + unknown + " " + ZtMsg.noresponse : "")).replace(/(^,)|(,$)/g, "");
        } else {

            // TODO: Show only upto 4 attendees.
            stats.summary = attendeeList.replace(/(^,)|(,$)/g, "");
        }
        return stats;
    }

});

