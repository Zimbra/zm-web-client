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
 * This class generates the JSON for calendar-related SOAP requests.
 *
 * @author Ajinkya Chhatre <achhatre@zimbra.com>
 */

Ext.define('ZCS.model.calendar.ZtCalendarWriter', {

    extend: 'ZCS.model.ZtWriter',

    alias: 'writer.calendarwriter',

    writeRecords: function(request, data) {

        var	action = request.getAction(),
            operation = request.getOperation(),
            offset = operation.getStart(),
            query = request.getParams().query,
            options = operation.getInitialConfig(),
            itemData = data && data.length ? Ext.merge(data[0], options) : options,
            start = itemData.calStart,
            end = itemData.calEnd,
            json, methodJson;

        if (action === 'read') {

            if (!query) {
                // doing a search - replace the configured 'read' operation URL
                request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'Search');

                json = this.getSoapEnvelope(request, data, 'Search');
                methodJson = json.Body.SearchRequest;

                Ext.apply(methodJson, {
                    sortBy: 'none',
                    offset: offset,
                    calExpandInstEnd: end,
                    calExpandInstStart: start,
                    limit: "500",
                    query: {
                        _content: 'inid:10'
                    },
                    types: 'appointment'
                });

            }
        }

        request.setJsonData(json);

        return request;
    }
});