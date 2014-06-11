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

            if (node.recur) {
                for (var i = 0, nodeLen = node.inst.length; i < nodeLen; i++) {
                    records.push({
                        clientId: null,
                        data: this.getDataFromNode(node, i),
                        node: node
                    });
                }
            }
	        else {
	            records.push({
		            clientId: null,
		            id: node.id,
		            data: this.getDataFromNode(node, null),
		            node: node
	            });
            }
        }, this);

        return records;
    },

    getDataFromNode: function(node, index) {
        //TODO: After a fix from Swarm's touch calendar extension we would not need start and end year, month and day variables
        var start = index !== null ? node.inst[index].s : node.inst[0].s,
	        adjustMs = node.allDay ? (node.tzo + new Date(start).getTimezoneOffset() * 60 * 1000) : 0,
			startTime = parseInt(start, 10) + adjustMs,
	        startDate = new Date(startTime),
            isException = index !== null ? (node.inst[index].ex ? true: false) : false,
            title = isException ? node.inst[index].name : node.name,
            invId = isException ? node.inst[index].invId : node.invId,
            duration = (index !== null && isException) ? node.inst[index].dur : node.dur,
	        endTime = startTime + (parseInt(duration)),
	        endDate = new Date(endTime),
            organizer = ZCS.session.getOrganizerModel(node.l),
            color = ZCS.constant.ORG_DEFAULT_COLOR,
	        ridZ = index !== null ? node.inst[index].ridZ : node.inst[0].ridZ;

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
	        event: Ext.Date.format(startDate, ZtMsg.invTimeFormat) + ' - ' + Ext.Date.format(endDate, ZtMsg.invTimeFormat),
            title: Ext.String.htmlEncode(title), //Fix for bug: 83580. Prevents XSS attacks.
	        start: startDate,
	        end: node.allDay ? new Date(endDate - 600) : endDate,
            invId: invId,
            color: color,
	        isAllDay: node.allDay,
	        isRecur: node.recur ? true : false,
	        ridZ: ridZ,
	        isException: isException,
	        ms: node.ms,
	        rev: node.rev
        };

        return data;
    }
});
