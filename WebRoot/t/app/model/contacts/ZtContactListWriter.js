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
 * This class generates the JSON for contact-related SOAP requests.
 *
 * @author Komal Kakani<kkakani@zimbra.com>
 */
Ext.define('ZCS.model.contacts.ZtContactListWriter', {

    extend: 'ZCS.model.ZtWriter',

    alias: 'writer.contactlistwriter',

    writeRecords: function(request, data) {

        var	action = request.getAction(),
            offset = request.getOperation().getStart(),
            query = request.getParams().query,
            json, methodJson;

        // Do not pass query in query string.
        request.setParams({});

        if (action === 'read') {

            if (!query) {
                // if there's no query, this is the initial load so get all contacts
                query = "in:contacts";
            }

            // doing a search - replace the configured 'read' operation URL
            request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'SearchRequest');

            json = this.getSoapEnvelope(request, data, 'Search');
            methodJson = json.Body.SearchRequest;

            Ext.apply(methodJson, {
                sortBy: "dateDesc",
                offset: 0,
                limit: 20,
                query: query,
                types: 'contact'
            });
        }

        request.setJsonData(json);

        return request;
    }
});


