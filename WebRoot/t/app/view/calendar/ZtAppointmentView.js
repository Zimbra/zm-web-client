/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
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
 * This class represents a calendar view that can be used to create, edit or view an appointment.
 * The different views are presented depending upon the rights that the user has. ie. Organizer view or Attendee view.
 *
 * @author Piyush Waradpande <pwaradpande@zimbra.com>
 */

Ext.define('ZCS.view.calendar.ZtAppointmentView', {

    extend: 'Ext.Panel',

    xtype: ZCS.constant.APP_CALENDAR + 'appointmentview',

    requires: [
        'Ext.NavigationView'
    ],

    config: {
        width:      '50%',
        height:     '80%',
        hidden:     true,
        modal      : true,
        centered   : true,
        hideOnMaskTap: true
    },

    initialize: function() {
        this.callParent(arguments);

        var view = Ext.create('Ext.NavigationView', {
            fullscreen: true,

            items: [
                {
                    xtype: 'container',
                    height: '100%',
                    scrollable: true,
                    itemId: 'apptDetails'
                }
            ]
        });

        var container = Ext.create('Ext.Container', {
            layout: 'card',
            width: '100%',
            height: '100%',
            items: [
                view
            ]
        });

        this.add([container]);
    },

    setPanel: function(msg) {

        var invite = msg.get('invite'),
            dateFormat = invite.get('isAllDay') ? ZtMsg.invDateFormat : ZtMsg.invDateTimeOnlyFormat,
            startTime = Ext.Date.format(invite.get('start'), dateFormat),
            endTime = Ext.Date.format(invite.get('end'), ZtMsg.invTimeOnlyFormat),
            organizer = invite.get('organizer') && invite.get('organizer').get('name'),
            location = invite.get('location'),
            attendees = invite.get('attendees'),
            stats = this.getAttendeeStats(invite),
            isOrganizer = invite.get('isOrganizer'),

            data = {
                start:  startTime + (invite.get('isAllDay') ? "" : " - " + endTime),
                location: invite.get('location'),
                organizer: organizer,
                attendees: stats && stats.summary,
                calendar: null /* TODO: After other calendar folders are shown in touch client */,
                reminder: invite.get('reminderAlert') + " minutes before", /* TODO: Get strings similar to Ajax Client */
                notes: invite.get('notes')
            },
            tpl,html,navView,me;

        tpl = Ext.create('Ext.XTemplate', ZCS.template.ApptViewDesc);
        html = tpl.apply(data);
        navView = this.down('navigationview');

        if(navView.getInnerItems().length > 1){
            navView.removeInnerAt(1);
        }

        navView.down('#apptDetails').setHtml(html);
        navView.getNavigationBar().setTitle(invite.get('subject'));
        Ext.get("showAttendees").clearListeners();

        me = this;
        Ext.get("showAttendees").on({
            tap: function (ev) {
                var listData = me.getListDataAsHtml(stats,isOrganizer),
                    navView = me.down('navigationview'), list;

                if(navView.getInnerItems().length > 1) {
                    list = navView.getInnerItems()[1];
                    list.setData(listData);
                    navView.setActiveItem(navView.getInnerItems()[1]);
                }
                else {
                    navView.push({
                        title: ZtMsg.attendeesTitle,
                        xtype: 'list',
                        striped: true,
                        itemId: 'attendeeList',
                        fullscreen: true,
                        striped: true,
                        itemTpl: '{title}',
                        data: listData
                    })
                }
            }
        })

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



    getAttendeeStats: function(invite) {

        var attendees = invite.get('attendees'),
            accepted = 0, declined = 0, tentative = 0, unknown = 0, stats=[], attendeeList = "", i, name;

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
        if (invite.get('isOrganizer')) {
            stats.summary = ((accepted ? accepted + " " + ZtMsg.accepted : "") + (declined ? ", " + declined + " " + ZtMsg.declined: "") + (tentative ? ", " + tentative + " " + ZtMsg.tentative : "") + (unknown ? ", " + unknown + " " + ZtMsg.unknown : "")).replace(/(^,)|(,$)/g, "");
        }
        else {

            // TODO: Show only upto 4 attendees.
            stats.summary = attendeeList.replace(/(^,)|(,$)/g, "");
        }
        return stats;
    }

});

