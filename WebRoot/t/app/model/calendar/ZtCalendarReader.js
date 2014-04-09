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
 * This class parses JSON calendar data into ZtCalendar objects.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.model.calendar.ZtCalendarReader', {

    extend: 'ZCS.model.ZtReader',

    alias: 'reader.calendarreader',

    /**
     * Converts a list of JSON nodes into a list of records.
     * Override so that we can handle recurring instances of an event
     *
     * @param {array}   root        list of JSON nodes
     * @return {array}  list of records
     */
    getRecords: function(root) {
        var records = [];

        //TODO: Need to add a reference to the parent of recurring invites

        Ext.each(root, function(node) {

            records.push({
                clientId: null,
                id: node.id,
                data: this.getDataFromNode(node, null),
                node: node
            });

            if (node.recur) {
                for (var i = 1; i < node.inst.length; i++) {
                    records.push({
                        clientId: null,
                        data: this.getDataFromNode(node, i),
                        node: node
                    });
                }
            }
        }, this);

        return records;
    },

    getDataFromNode: function(node, index) {
        //TODO: After a fix from Swarm's touch calendar extension we would not need start and end year, month and day variables
        var start = index ? node.inst[index].s : node.inst[0].s,
            isException = index ? (node.inst[index].ex ? true: false) : false,
            title = isException ? node.inst[index].name : node.name,
            invId = isException ? node.inst[index].invId : node.invId,
            duration = (index && isException) ? node.inst[index].dur : node.dur,
            syear = new Date(start).getFullYear(),
            smonth = new Date(start).getMonth(),
            sday = new Date(start).getDate(),
            shour = new Date(start).getHours(),
            sminutes = new Date(start).getMinutes(),
            eyear = new Date(start + duration).getFullYear(),
            emonth = new Date(start + duration).getMonth(),
            eday = new Date(start + duration).getDate(),
            ehour = new Date(start + duration).getHours(),
            eminutes = new Date(start + duration).getMinutes(),
            organizer = ZCS.cache.get(node.l),
            color = ZCS.constant.ORG_DEFAULT_COLOR;

        if (organizer) {
            var folderColor = organizer.get('color');
            color = ZCS.constant.COLOR_VALUES[folderColor];
            if (!color) {
                color = organizer.get('rgb');
            }
        }

        var data = {
            folderId: node.l,
            type: ZCS.constant.ITEM_APPOINTMENT,
            event: shour + ':' + this.getPaddedDigits(sminutes) + ' - ' + ehour + ':' + this.getPaddedDigits(eminutes),
            title: Ext.String.htmlEncode(title), //Fix for bug: 83580. Prevents XSS attacks.
            start: node.allDay ? new Date(new Date(syear, smonth, sday).setHours(0, 0, 0, 0)) : new Date(syear, smonth, sday, shour, sminutes),
            end: node.allDay ? new Date(new Date(syear, smonth, sday).setHours(23,59,59,999)) : new Date(eyear, emonth, eday, ehour, eminutes),
            invId: invId,
            color: color,
	        isAllDay: node.allDay
        };

        return data;
    },

    getPaddedDigits: function(number) {
        return ('0' + number).slice(-2);
    }
});
