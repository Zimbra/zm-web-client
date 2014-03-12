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
        var syear = index ? new Date(node.inst[index].s).getFullYear() : new Date(node.inst[0].s).getFullYear(),
            smonth = index ? new Date(node.inst[index].s).getMonth() : new Date(node.inst[0].s).getMonth(),
            sday = index ? new Date(node.inst[index].s).getDate() : new Date(node.inst[0].s).getDate(),
            shour = index ? new Date(node.inst[index].s).getHours() : new Date(node.inst[0].s).getHours(),
            sminutes = index ? new Date(node.inst[index].s).getMinutes() : new Date(node.inst[0].s).getMinutes(),
            eyear = index ? new Date(node.inst[index].s + node.dur).getFullYear() : new Date(node.inst[0].s + node.dur).getFullYear(),
            emonth = index ? new Date(node.inst[index].s + node.dur).getMonth() : new Date(node.inst[0].s + node.dur).getMonth(),
            eday = index ? new Date(node.inst[index].s + node.dur).getDate() : new Date(node.inst[0].s + node.dur).getDate(),
            ehour = index ? new Date(node.inst[index].s + node.dur).getHours() : new Date(node.inst[0].s + node.dur).getHours(),
            eminutes = index ? new Date(node.inst[index].s + node.dur).getMinutes() : new Date(node.inst[0].s + node.dur).getMinutes(),
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
            title: Ext.String.htmlEncode(node.name), //Fix for bug: 83580. Prevents XSS attacks.
            start: new Date(syear, smonth, sday, shour, sminutes),
            end: node.allDay ? new Date(new Date(syear, smonth, sday).setHours(23,59,59,999)) : new Date(eyear, emonth, eday, ehour, eminutes),
            invId: node.invId,
            color: color
        };

        return data;
    },

    getPaddedDigits: function(number) {
        return ('0' + number).slice(-2);
    }
});
